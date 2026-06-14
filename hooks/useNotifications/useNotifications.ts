import useSWR from "swr";

import type { Notification } from "@customTypes/index";
import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";
import useErrorReport, { REPORT_POSTHOG_ONLY } from "@hooks/useErrorReport";
import fetcher from "@util/fetcher";
import { instanceAxios } from "@util/instanceAxios";

export type NotificationsResponse = {
	count: number;
	next: string | null;
	previous: string | null;
	results: Notification[];
};

const NOTIFICATIONS_KEY = "/notification";
const EMAIL_PREFERENCES_UPDATE_URL = "/notification/email-preferences/update";

export type EmailPreferencesUpdatePayload = {
	ad_approved: boolean;
	daily_digest: boolean;
	unread_chat: boolean;
};

export const useNotifications = () => {
	const { canUseAuthenticatedApi } = useAuthenticatedUser();
	const { reportError } = useErrorReport({
		functionNamePrefix: "useNotifications",
	});

	const { data, error, isLoading, mutate } = useSWR<NotificationsResponse>(
		canUseAuthenticatedApi ? NOTIFICATIONS_KEY : null,
		fetcher,
	);

	const notifications = data?.results ?? [];
	const hasUnreadNotifications = notifications.some(
		(notification) => !notification.is_read,
	);

	const markAsRead = async (notificationId: number) => {
		if (!canUseAuthenticatedApi) {
			return;
		}

		await mutate(
			(current) =>
				current
					? {
							...current,
							results: current.results.map((n) =>
								n.id === notificationId ? { ...n, is_read: true } : n,
							),
						}
					: current,
			{ revalidate: false },
		);
		try {
			await instanceAxios({
				method: "post",
				url: `/notification/mark-as-read/${notificationId}`,
			});
		} catch (error) {
			reportError(error, "markAsRead", REPORT_POSTHOG_ONLY);
			await mutate();
		}
	};

	const markAllAsRead = async (notificationIds: number[]) => {
		if (!canUseAuthenticatedApi || notificationIds.length === 0) {
			return;
		}

		const idsSet = new Set(notificationIds);
		await mutate(
			(current) =>
				current
					? {
							...current,
							results: current.results.map((n) =>
								idsSet.has(n.id) ? { ...n, is_read: true } : n,
							),
						}
					: current,
			{ revalidate: false },
		);
		try {
			await Promise.all(
				notificationIds.map((id) =>
					instanceAxios({
						method: "post",
						url: `/notification/mark-as-read/${id}`,
					}),
				),
			);
		} catch (error) {
			reportError(error, "markAllAsRead", REPORT_POSTHOG_ONLY);
			await mutate();
		}
	};

	const updateEmailPreferences = async (
		payload: EmailPreferencesUpdatePayload,
	) => {
		if (!canUseAuthenticatedApi) {
			return;
		}

		await instanceAxios({
			method: "patch",
			url: EMAIL_PREFERENCES_UPDATE_URL,
			data: payload,
		});
	};

	/**
	 * Mark notification(s) as read by object_id and type (e.g. ad approval).
	 * Use when the notification may not be in the current paginated list (e.g. old approval).
	 * Backend finds and marks any matching notification for the current user.
	 */
	const markAsReadByObject = async (
		objectId: number,
		notificationType: string,
	) => {
		if (!canUseAuthenticatedApi) {
			return;
		}

		try {
			await instanceAxios({
				method: "post",
				url: "/notification/mark-ad-approval-as-read",
				data: { ad_id: objectId, ad_type: notificationType },
			});
			await mutate();
		} catch (error) {
			reportError(error, "markAsReadByObject", REPORT_POSTHOG_ONLY);
		}
	};

	return {
		notifications,
		hasUnreadNotifications,
		isLoading,
		error,
		refetch: mutate,
		markAsRead,
		markAllAsRead,
		markAsReadByObject,
		updateEmailPreferences,
	};
};
