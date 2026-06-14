import { useCallback, useEffect } from "react";

import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";
import { isInternalStaffUser, isProductionEnv } from "@util/errorReporting";
import posthogSingleton from "posthog-js";
import { usePostHog } from "posthog-js/react";

const usePosthog = () => {
	const { authenticatedUser } = useAuthenticatedUser();
	const posthogClient = usePostHog();

	const isStaff = isInternalStaffUser(authenticatedUser?.groups);

	const shouldSendToPosthog = () =>
		!isStaff && isProductionEnv() && !!posthogSingleton;

	useEffect(() => {
		if (posthogClient && authenticatedUser?.pk) {
			const currentDistinctId = posthogClient.get_distinct_id();
			const desiredDistinctId = String(authenticatedUser.pk);

			if (currentDistinctId !== desiredDistinctId) {
				posthogClient.reset();
				posthogClient.identify(desiredDistinctId, {
					email: authenticatedUser.email,
				});
			}
		}
	}, [posthogClient, authenticatedUser?.pk, authenticatedUser?.email]);

	const capturePosthogEvent = useCallback(
		(event: string, properties?: Record<string, unknown>) => {
			if (!shouldSendToPosthog()) return;
			const props = properties ?? {};
			posthogClient?.capture(event, {
				...props,
				user_pk: props.user_pk ?? authenticatedUser?.pk ?? null,
			});
		},
		[authenticatedUser?.pk, posthogClient],
	);

	return {
		capturePosthogEvent,
	};
};

export default usePosthog;
