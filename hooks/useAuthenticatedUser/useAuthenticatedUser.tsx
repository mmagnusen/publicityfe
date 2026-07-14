import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import axios from "axios";
import { isEmpty, isNil, noop } from "lodash-es";
import { usePathname, useRouter } from "next/navigation";

import { filePathFromBytescalePublicUrl } from "@components/UploadButton";
import {
	AUTHENTICATED_USER_COOKIE,
	AUTHENTICATED_USER_EMAIL_VERIFIED,
	AUTHENTICATED_USER_IDENTITY_VERIFIED,
	AUTHENTICATED_USER_PROFILE_PIC_URL,
} from "@constants/cookies";
import type { ItemToDelete } from "@customTypes/gallery";
import type { AuthenticatedUser } from "@customTypes/index";
import type { ProfileHighlightInput } from "@customTypes/profileHighlight";
import useErrorReport, { REPORT_POSTHOG_ONLY } from "@hooks/useErrorReport";
import { useLogs } from "@hooks/useLogs";
import usePosthog from "@hooks/usePosthog";
import { SESSION_EXPIRED_EVENT } from "@util/authSessionCookies";
import {
	type SessionInvalidReason,
	setUnauthorizedHandler,
} from "@util/authUnauthorizedHandler";
import {
	identityFieldsFromApiUser,
	mergeIdentityFieldsFromPatch,
} from "@util/identityVerificationFromApi";
import { instanceAxios } from "@util/instanceAxios";
import { normalizeEmail } from "@util/normalizeEmail";
import {
	clearPromoCodeCookie,
	getPromoCodeFromCookie,
} from "@util/promoCodeCookie";
import { isJwtExpired } from "jwt-check-expiration";
import Cookies from "universal-cookie";
import { v4 as uuidv4 } from "uuid";

const cookies = new Cookies(null, { path: "/" });

const readAuthenticatedUserFromCookie = (): AuthenticatedUser | null => {
	const raw = cookies.get(AUTHENTICATED_USER_COOKIE);
	if (raw === "null" || raw == null) {
		return null;
	}
	return raw as AuthenticatedUser;
};

const readProfilePicFromCookie = (): string | null => {
	const raw = cookies.get(AUTHENTICATED_USER_PROFILE_PIC_URL);
	if (raw === "null" || raw == null) {
		return null;
	}
	return raw;
};

const verifiedFlagsFromCookies = (
	user: AuthenticatedUser,
): { emailVerified: boolean; identityVerified: boolean } => {
	const emailVerifiedFromCookie = cookies.get(
		AUTHENTICATED_USER_EMAIL_VERIFIED,
	);
	const identityVerifiedFromCookie = cookies.get(
		AUTHENTICATED_USER_IDENTITY_VERIFIED,
	);
	return {
		emailVerified:
			emailVerifiedFromCookie === "true"
				? true
				: emailVerifiedFromCookie === "false"
					? false
					: (user.emailVerified ?? false),
		identityVerified:
			identityVerifiedFromCookie === "true"
				? true
				: identityVerifiedFromCookie === "false"
					? false
					: (user.identityVerified ?? false),
	};
};

const clearSessionState = (
	updateUser: (user: null) => void,
	setProfilePicURL: (url: string | null) => void,
	setEmailVerified: (value: boolean | null) => void,
	setIdentityVerified: (value: boolean | null) => void,
) => {
	updateUser(null);
	setProfilePicURL(null);
	setEmailVerified(null);
	setIdentityVerified(null);
};

export type GoogleRedirectUri =
	| "/google"
	| "/google/post-offered"
	| "/google/post-wanted";

const ContextAuthenticatedUser = createContext({
	authenticatedUser: null as AuthenticatedUser | null,
	authenticationChecked: false,
	emailVerified: null as boolean | null,
	identityVerified: null as boolean | null,
	funcAddGalleryImage: noop,
	funcCreateProfileHighlight: noop,
	funcDeleteGalleryImage: noop,
	funcDeleteProfileHighlight: noop,
	funcLogin: noop,
	funcLogout: noop,
	funcRegister: noop,
	funcRequestPasswordReset: noop,
	funcResetPassword: noop, // from password reset page
	funcUpdateProfile: noop,
	funcUpdateProfilePicture: noop,
	funcUpdateProfileHighlight: noop,
	funcUpdateUser: noop,
	funcUpdateUserTags: noop,
	funcVerifyToken: noop,
	hasActiveSubscription: false,
	isAdmin: false as boolean | undefined,
	isLoggedIn: false,
	canUseAuthenticatedApi: false,
	authenticateWithGoogleSuccess: noop,
	openGoogleLoginPage: noop,
	profilePicURL: "" as string | null,
	updateUser: noop, //only used for google login
	updateEmailVerified: noop as (value: boolean) => void,
	updateIdentityVerified: noop as (value: boolean) => void,
	uploadFromUrl: noop,
});

export const AuthenticatedUserContextProvider = ({
	children,
}: {
	children: ReactNode;
}) => {
	const [authenticatedUser, setAuthenticatedUser] =
		useState<AuthenticatedUser | null>(null);
	const [authenticationChecked, setAuthenticationChecked] = useState(false);
	const [profilePicURL, setProfilePicURL] = useState<string | null>(null);
	const [emailVerified, setEmailVerified] = useState<boolean | null>(null);
	const [identityVerified, setIdentityVerified] = useState<boolean | null>(
		null,
	);
	const router = useRouter();
	const pathname = usePathname();

	const { capturePosthogEvent } = usePosthog();
	const { trackEvent } = useLogs();
	const { reportError } = useErrorReport({
		functionNamePrefix: "useAuthenticatedUser",
	});

	const updateUser = useCallback((updatedUser: any) => {
		setAuthenticatedUser(updatedUser);
		if (isNil(updatedUser)) {
			cookies.remove(AUTHENTICATED_USER_COOKIE, { path: "/" });
			return;
		}
		cookies.set(AUTHENTICATED_USER_COOKIE, updatedUser, { path: "/" });
	}, []);

	/**
	 * Hydrate session from cookies and reject expired/missing JWTs before any
	 * authenticated API calls (e.g. chat unread polls) are enabled.
	 */
	const syncSessionFromCookie = useCallback(async () => {
		try {
			const userFromCookies = readAuthenticatedUserFromCookie();
			if (!userFromCookies?.token) {
				clearSessionState(
					updateUser,
					setProfilePicURL,
					setEmailVerified,
					setIdentityVerified,
				);
				return;
			}

			const isExpired = await isJwtExpired(userFromCookies.token);
			if (isExpired) {
				clearSessionState(
					updateUser,
					setProfilePicURL,
					setEmailVerified,
					setIdentityVerified,
				);
				return;
			}

			let sessionUser = userFromCookies;
			if (!sessionUser.username?.trim()) {
				try {
					const { data } = await instanceAxios({
						method: "post",
						url: `/users/api-token-verify/`,
						data: { token: sessionUser.token },
					});
					const idFields = identityFieldsFromApiUser(data.user);
					sessionUser = {
						...sessionUser,
						firstName: data.user.first_name,
						lastName: data.user.last_name,
						email: data.user.email,
						emailVerified: data.user.email_verified ?? false,
						pk: data.user.pk,
						username: data.user.username,
						hasActiveSubscription: data.user.has_active_subscription,
						groups: data.user.groups ?? sessionUser.groups,
						isStaff: data.user.is_staff ?? sessionUser.isStaff,
						referral_code: data.user.referral_code ?? sessionUser.referral_code,
						reward_points: data.user.reward_points ?? sessionUser.reward_points,
						...idFields,
					};
					cookies.set(AUTHENTICATED_USER_COOKIE, sessionUser, { path: "/" });
				} catch {
					// Keep existing session; profile link stays hidden until re-login.
				}
			}

			setAuthenticatedUser(sessionUser);
			setProfilePicURL(readProfilePicFromCookie());
			const verified = verifiedFlagsFromCookies(sessionUser);
			setEmailVerified(verified.emailVerified);
			setIdentityVerified(verified.identityVerified);
		} catch (error: unknown) {
			reportError(error, "syncSessionFromCookie", REPORT_POSTHOG_ONLY);
			clearSessionState(
				updateUser,
				setProfilePicURL,
				setEmailVerified,
				setIdentityVerified,
			);
		} finally {
			setAuthenticationChecked(true);
		}
	}, [reportError, updateUser]);

	const isLoggedIn = useMemo(() => {
		const isUserLoggedIn = isNil(authenticatedUser) ? false : true;
		return isUserLoggedIn;
	}, [authenticatedUser]);

	/** Cookie can exist without a JWT; wait for auth check before authenticated API calls. */
	const canUseAuthenticatedApi = useMemo(
		() =>
			authenticationChecked && isLoggedIn && !isEmpty(authenticatedUser?.token),
		[authenticationChecked, isLoggedIn, authenticatedUser?.token],
	);

	const isAdmin = useMemo(() => {
		return (
			authenticatedUser?.isStaff === true ||
			authenticatedUser?.groups?.some((group) => group.name === "Admin")
		);
	}, [authenticatedUser?.isStaff, authenticatedUser?.groups]);

	useEffect(() => {
		void syncSessionFromCookie();
	}, [authenticatedUser?.token, syncSessionFromCookie]);

	useEffect(() => {
		const onSessionExpired = () => {
			void syncSessionFromCookie();
		};
		window.addEventListener(SESSION_EXPIRED_EVENT, onSessionExpired);
		return () =>
			window.removeEventListener(SESSION_EXPIRED_EVENT, onSessionExpired);
	}, [syncSessionFromCookie]);

	// Re-sync emailVerified from cookie when tab regains focus (e.g. after verifying in another tab)
	useEffect(() => {
		const onFocus = () => {
			const userFromCookies =
				cookies.get(AUTHENTICATED_USER_COOKIE) === "null"
					? null
					: cookies.get(AUTHENTICATED_USER_COOKIE);
			if (!userFromCookies) return;
			setAuthenticatedUser(userFromCookies as AuthenticatedUser);
			const emailVerifiedFromCookie = cookies.get(
				AUTHENTICATED_USER_EMAIL_VERIFIED,
			);
			const identityVerifiedFromCookie = cookies.get(
				AUTHENTICATED_USER_IDENTITY_VERIFIED,
			);
			setEmailVerified(
				emailVerifiedFromCookie === "true"
					? true
					: emailVerifiedFromCookie === "false"
						? false
						: ((userFromCookies as AuthenticatedUser).emailVerified ?? false),
			);
			setIdentityVerified(
				identityVerifiedFromCookie === "true"
					? true
					: identityVerifiedFromCookie === "false"
						? false
						: ((userFromCookies as AuthenticatedUser).identityVerified ??
							false),
			);
		};
		window.addEventListener("focus", onFocus);
		return () => window.removeEventListener("focus", onFocus);
	}, []);

	const updateProfilePicURL = (updatedProfilePicURL: string) => {
		setProfilePicURL(updatedProfilePicURL);
		cookies.set(AUTHENTICATED_USER_PROFILE_PIC_URL, updatedProfilePicURL, {
			path: "/",
		});
	};

	const updateEmailVerified = (value: boolean) => {
		setEmailVerified(value);
		cookies.set(AUTHENTICATED_USER_EMAIL_VERIFIED, String(value), {
			path: "/",
		});
	};

	const updateIdentityVerified = (value: boolean) => {
		setIdentityVerified(value);
		cookies.set(AUTHENTICATED_USER_IDENTITY_VERIFIED, String(value), {
			path: "/",
		});
	};

	/** Re-fetch subscription status and merge into the stored user (fixes stale `hasActiveSubscription` after server-side grants). */
	const refreshSession = useCallback(async () => {
		const raw = cookies.get(AUTHENTICATED_USER_COOKIE);
		const userFromCookie =
			raw === "null" || raw == null ? null : (raw as AuthenticatedUser);
		if (!userFromCookie?.token) {
			return;
		}

		try {
			const { data } = await instanceAxios({
				method: "get",
				url: "/billing/subscription-status",
			});
			const hasSub = Boolean(data?.has_active_subscription);
			setAuthenticatedUser((prev) => {
				if (!prev?.token) return prev;
				const next: AuthenticatedUser = {
					...prev,
					hasActiveSubscription: hasSub,
				};
				cookies.set(AUTHENTICATED_USER_COOKIE, next, { path: "/" });
				return next;
			});
		} catch (error: unknown) {
			if (axios.isAxiosError(error) && error.response?.status === 401) {
				void syncSessionFromCookie();
				return;
			}
			reportError(error, "refreshSession", REPORT_POSTHOG_ONLY);
		}
	}, [reportError]);

	useEffect(() => {
		if (!isLoggedIn) {
			return;
		}
		const onVisibility = () => {
			if (document.visibilityState === "visible") {
				void refreshSession();
			}
		};
		document.addEventListener("visibilitychange", onVisibility);
		void refreshSession();
		return () => {
			document.removeEventListener("visibilitychange", onVisibility);
		};
	}, [pathname, refreshSession, isLoggedIn]);

	const funcLogin = async (email: string, password: string) => {
		console.log("[LOGIN DEBUG] funcLogin called", {
			email: normalizeEmail(email),
			passwordLength: password?.length ?? 0,
		});
		try {
			console.log("[LOGIN DEBUG] sending POST /users/api-token-auth/");
			const { data } = await instanceAxios({
				method: "post",
				url: `/users/api-token-auth/`,
				data: {
					email: normalizeEmail(email),
					password,
				},
			});
			console.log("[LOGIN DEBUG] API response received", {
				status: "success",
				userPk: data?.user?.pk,
				hasToken: !!data?.token,
			});

			const idFields = identityFieldsFromApiUser(data.user);
			updateUser({
				email: data.user.email,
				emailVerified: data.user.email_verified ?? false,
				firstName: data.user.first_name,
				lastName: data.user.last_name,
				pk: data.user.pk,
				username: data.user.username,
				token: data.token,
				groups: data.user.groups,
				hasActiveSubscription: data.user.has_active_subscription,
				isStaff: data.user.is_staff ?? false,
				referral_code: data.user.referral_code,
				reward_points: data.user.reward_points,
				...idFields,
			});
			updateProfilePicURL(data.user.human_profile?.profile_image_url ?? "");
			updateEmailVerified(data.user.email_verified ?? false);
			updateIdentityVerified(idFields.identityVerified);
			return data;
		} catch (error: unknown) {
			console.error("[LOGIN DEBUG] funcLogin API error", error);
			throw error;
		}
	};

	const funcLogout = useCallback(async () => {
		cookies.remove(AUTHENTICATED_USER_COOKIE, { path: "/" });
		cookies.remove(AUTHENTICATED_USER_PROFILE_PIC_URL, { path: "/" });
		cookies.remove(AUTHENTICATED_USER_EMAIL_VERIFIED, { path: "/" });
		cookies.remove(AUTHENTICATED_USER_IDENTITY_VERIFIED, { path: "/" });
		clearPromoCodeCookie();
		setAuthenticatedUser(null);
		setProfilePicURL(null);
		setEmailVerified(null);
		setIdentityVerified(null);
		// await createInterceptorAccessToken({ strToken: undefined });
		axios.defaults.headers.common["Authorization"] = undefined;

		router.push("/");
	}, [router]);

	const funcLogoutRef = useRef(funcLogout);
	funcLogoutRef.current = funcLogout;
	const authenticatedUserRef = useRef(authenticatedUser);
	authenticatedUserRef.current = authenticatedUser;
	const trackEventRef = useRef(trackEvent);
	trackEventRef.current = trackEvent;

	useLayoutEffect(() => {
		const handleSessionInvalid = async (reason: SessionInvalidReason) => {
			trackEventRef.current({
				channel: "user-session",
				event: "Session invalidated",
				description: `reason=${reason}. user_pk=${authenticatedUserRef.current?.pk ?? "unknown"}`,
				functionName: "useAuthenticatedUser > handleSessionInvalid",
			});
			await funcLogoutRef.current();
		};
		setUnauthorizedHandler(handleSessionInvalid);
		// Do not clear on cleanup: React Strict Mode remount leaves a window where handler is
		// null while in-flight 401s still fire, and the sync effect would resurrect the session
		// from a cookie that logout had not finished clearing.
	}, []);

	const funcRegister = async (
		firstName: string,
		lastName: string,
		email: string,
		password: string,
		username: string,
		inviteReferralCode?: string | null,
	) => {
		try {
			const promoCode = getPromoCodeFromCookie();
			const registrationData: Record<string, string | number> = {
				first_name: firstName.trim(),
				last_name: lastName.trim(),
				email: normalizeEmail(email),
				password: password,
				username: username.trim(),
			};
			if (promoCode) {
				registrationData.promo_code = promoCode;
				registrationData.plan_id = 1;
			}
			const invite = inviteReferralCode?.trim();
			if (invite) {
				registrationData.invite_referral_code = invite;
			}

			const { data } = await instanceAxios({
				method: "post",
				url: `/users/`,
				data: registrationData,
			});

			const idFields = identityFieldsFromApiUser(data);
			updateUser({
				token: data.token,
				firstName: data.first_name,
				lastName: data.last_name,
				email: data.email,
				emailVerified: data.email_verified ?? false,
				username: data.username,
				pk: data.pk,
				hasActiveSubscription: data.has_active_subscription,
				referral_code: data.referral_code,
				reward_points: data.reward_points,
				...idFields,
			});
			updateEmailVerified(data.email_verified ?? false);
			updateIdentityVerified(idFields.identityVerified);

			if (data.is_new_account) {
				capturePosthogEvent("user_register", {
					registration_method: "email_password",
					user_pk: data.pk,
				});
			}

			return data;
		} catch (error: unknown) {
			reportError(error, "funcRegister", REPORT_POSTHOG_ONLY);
			throw error;
		}
	};

	/* authenticatedUser.human_profile*/
	// Token is optional, if not provided use the one from authenticatedUser
	// When logging in via google, we need to pass the token explicitly as authenticatedUser is not yet set
	const funcUpdateProfile = async (objUpdatedProfile: any, token?: string) => {
		try {
			const { headline, ...profileFields } = objUpdatedProfile ?? {};
			const payload: Record<string, unknown> = {
				...profileFields,
				token: token ?? authenticatedUser?.token,
			};
			if (headline !== undefined) {
				payload.tagline = headline;
			}

			const { data } = await instanceAxios({
				method: "patch",
				url: `/profile/update-human-profile`,
				data: payload,
			});

			return data;
		} catch (error: any) {
			reportError(error, "funcUpdateProfile", REPORT_POSTHOG_ONLY);
			throw new Error(error);
		}
	};

	const funcUpdateProfilePicture = async (uploadedFilePath: string) => {
		const userHasExistingProfilePicture = !isEmpty(profilePicURL);
		try {
			if (userHasExistingProfilePicture && profilePicURL) {
				const filePath =
					filePathFromBytescalePublicUrl(profilePicURL) ?? profilePicURL;
				await axios.post("/api/bytescale", {
					filePath,
				});
			}
			// update human profile in the database
			await funcUpdateProfile({ profile_image_url: uploadedFilePath });

			// set cookies and local state
			updateProfilePicURL(uploadedFilePath);

			return "success";
		} catch (error: any) {
			reportError(error, "funcUpdateProfilePicture", REPORT_POSTHOG_ONLY);
			throw new Error(error);
		}
	};

	/* first name, last name, email*/
	const funcUpdateUser = async (objUpdatedUser: any) => {
		try {
			const { data } = await instanceAxios({
				method: "patch",
				url: `/users/update-user`,
				data: objUpdatedUser,
			});

			const verified =
				data.email_verified ?? authenticatedUser?.emailVerified ?? false;
			const idFields = mergeIdentityFieldsFromPatch(
				data as Record<string, unknown>,
				authenticatedUser,
			);
			updateUser({
				...authenticatedUser,
				firstName: data.first_name,
				lastName: data.last_name,
				emailVerified: verified,
				...idFields,
			});
			updateEmailVerified(verified);
			updateIdentityVerified(idFields.identityVerified);
		} catch (error: any) {
			reportError(error, "funcUpdateUser", REPORT_POSTHOG_ONLY);
			throw new Error(error);
		}
	};

	const funcUpdateUserTags = async (tagPks: number[]) => {
		try {
			await instanceAxios({
				method: "patch",
				url: `/users/update-user`,
				data: { tag_pks: tagPks },
			});
		} catch (error: unknown) {
			reportError(error, "funcUpdateUserTags", REPORT_POSTHOG_ONLY);
			throw error;
		}
	};

	const funcRequestPasswordReset = async (strEmail: string) => {
		try {
			const { data } = await instanceAxios({
				method: "post",
				url: `/users/request-password-reset/`,
				data: {
					email: normalizeEmail(strEmail),
				},
			});

			return data;
		} catch (error: unknown) {
			reportError(error, "funcRequestPasswordReset", REPORT_POSTHOG_ONLY);
			throw error;
		}
	};

	const funcResetPassword = async (token: string, strNewPassword: string) => {
		try {
			const { data } = await instanceAxios({
				method: "patch",
				url: `/users/submit-password-reset/`,
				data: {
					token: token,
					password: strNewPassword,
				},
			});

			if (data.token) {
				const idFields = identityFieldsFromApiUser(data.user);
				updateUser({
					token: data.token,
					firstName: data.user.first_name,
					lastName: data.user.last_name,
					email: data.user.email,
					emailVerified: data.user.email_verified ?? false,
					pk: data.user.pk,
					username: data.user.username,
					hasActiveSubscription: data.user.has_active_subscription,
					...idFields,
				});
				updateEmailVerified(data.user.email_verified ?? false);
				updateIdentityVerified(idFields.identityVerified);
			}

			return data;
		} catch (error: any) {
			reportError(error, "funcResetPassword", REPORT_POSTHOG_ONLY);
			throw new Error(error);
		}
	};

	const funcVerifyToken = async (token: string) => {
		try {
			const { data } = await instanceAxios({
				method: "post",
				url: `/users/api-token-verify/`,
				data: {
					token,
				},
				responseType: "json",
			});

			const idFields = identityFieldsFromApiUser(data.user);
			/** Verify-token payload may omit `groups`; without merging, admin nav disappears. */
			updateUser({
				token: data.token,
				firstName: data.user.first_name,
				lastName: data.user.last_name,
				email: data.user.email,
				emailVerified: data.user.email_verified ?? false,
				pk: data.user.pk,
				username: data.user.username,
				hasActiveSubscription: data.user.has_active_subscription,
				groups: data.user.groups ?? authenticatedUser?.groups,
				isStaff: data.user.is_staff ?? authenticatedUser?.isStaff,
				referral_code:
					data.user.referral_code ?? authenticatedUser?.referral_code,
				reward_points:
					data.user.reward_points ?? authenticatedUser?.reward_points,
				...idFields,
			});
			updateEmailVerified(data.user.email_verified ?? false);
			updateIdentityVerified(idFields.identityVerified);
			return data;
		} catch (error: any) {
			reportError(error, "funcVerifyToken", REPORT_POSTHOG_ONLY);
			throw new Error(error);
		}
	};

	const funcAddGalleryImage = async ({
		uploadedFilePath,
	}: {
		uploadedFilePath: string;
	}) => {
		try {
			await instanceAxios({
				method: "post",
				url: `/users/create-gallery-asset`,
				data: {
					asset_url: uploadedFilePath,
				},
			});
		} catch (error: any) {
			reportError(error, "funcAddGalleryImage", REPORT_POSTHOG_ONLY);
			throw error;
		}
	};

	const funcDeleteGalleryImage = async (asset: ItemToDelete) => {
		try {
			const filePath =
				filePathFromBytescalePublicUrl(asset.assetUrl) ?? asset.assetUrl;
			await axios.post("/api/bytescale", {
				filePath,
			});

			await instanceAxios({
				method: "delete",
				url: `/users/delete-gallery-asset/${asset.pk}`,
			});
		} catch (error: any) {
			reportError(error, "funcDeleteGalleryImage", REPORT_POSTHOG_ONLY);
			throw error;
		}
	};

	const funcCreateProfileHighlight = async (payload: ProfileHighlightInput) => {
		try {
			await instanceAxios({
				method: "post",
				url: `/users/create-profile-link`,
				data: payload,
			});
		} catch (error: any) {
			reportError(error, "funcCreateProfileHighlight", REPORT_POSTHOG_ONLY);
			throw error;
		}
	};

	const funcUpdateProfileHighlight = async (
		pk: number,
		payload: ProfileHighlightInput,
	) => {
		try {
			await instanceAxios({
				method: "patch",
				url: `/users/profile-link/${pk}`,
				data: payload,
			});
		} catch (error: any) {
			reportError(error, "funcUpdateProfileHighlight", REPORT_POSTHOG_ONLY);
			throw error;
		}
	};

	const funcDeleteProfileHighlight = async (pk: number) => {
		try {
			await instanceAxios({
				method: "delete",
				url: `/users/profile-link/${pk}`,
			});
		} catch (error: any) {
			reportError(error, "funcDeleteProfileHighlight", REPORT_POSTHOG_ONLY);
			throw error;
		}
	};

	const uploadFromUrl = async ({ url }: { url: string }) => {
		const accountId = process.env.NEXT_PUBLIC_BYTESCALE_ACCOUNT_ID;
		const apiKey = process.env.NEXT_PUBLIC_BYTESCALE_PUBLIC_FRONTEND_KEY;

		if (!accountId || !apiKey) {
			throw new Error("Bytescale credentials not configured");
		}

		const baseUrl = "https://api.bytescale.com";
		const path = `/v2/accounts/${accountId}/uploads/url`;

		const response = await fetch(`${baseUrl}${path}`, {
			method: "POST",
			body: JSON.stringify({
				url: url,
				path: `/uploads/profile/${uuidv4()}`,
			}),
			headers: {
				Authorization: `Bearer ${apiKey}`,
				"Content-Type": "application/json",
			},
		});

		const result = await response.json();

		if (Math.floor(response.status / 100) !== 2) {
			throw new Error(`Bytescale API Error: ${JSON.stringify(result)}`);
		}

		return result;
	};

	const authenticateWithGoogleSuccess = async ({
		token,
		firstName,
		lastName,
		email,
		username,
		pk,
		profileImageUrl,
		googleProfilePicUrl,
		hasActiveSubscription,
		emailVerified,
		identityVerified,
		identityVerificationStatus,
		identityVerificationError,
		referral_code,
		reward_points,
	}: {
		email: string;
		emailVerified?: boolean;
		identityVerified?: boolean;
		identityVerificationStatus?: string | null;
		identityVerificationError?: string | null;
		firstName: string;
		lastName: string;
		pk: number;
		profileImageUrl: string;
		token: string;
		username: string;
		googleProfilePicUrl: string;
		hasActiveSubscription: boolean;
		referral_code?: string;
		reward_points?: number;
	}) => {
		const idFields = identityFieldsFromApiUser({
			identity_verified: identityVerified,
			identity_verification_status: identityVerificationStatus,
			identity_verification_error: identityVerificationError,
		});
		updateUser({
			token,
			firstName,
			lastName,
			email,
			emailVerified: emailVerified ?? false,
			pk,
			username,
			hasActiveSubscription,
			referral_code,
			reward_points,
			...idFields,
		});
		updateEmailVerified(emailVerified ?? false);
		updateIdentityVerified(idFields.identityVerified);

		// if user has no profile image set, make request to bytescale to copy google profile pic to our storage and set as profile pic
		if (isEmpty(profileImageUrl) && !isEmpty(googleProfilePicUrl)) {
			try {
				const result = await uploadFromUrl({ url: googleProfilePicUrl });
				const uploadedImageUrl = result.filePath;

				// Update profile with the new image URL
				await funcUpdateProfile({ profile_image_url: uploadedImageUrl }, token);
				updateProfilePicURL(uploadedImageUrl);
			} catch (error) {
				reportError(
					error,
					"authenticateWithGoogleSuccess_upload_profile_picture",
					REPORT_POSTHOG_ONLY,
				);
				// Fall back to original profileImageUrl if upload fails
				updateProfilePicURL(profileImageUrl);
			}
		} else {
			updateProfilePicURL(profileImageUrl);
		}
	};

	const openGoogleLoginPage = useCallback(
		({
			strGoogleRedirectUri = "/google",
			prompt,
		}: {
			strGoogleRedirectUri: GoogleRedirectUri;
			prompt: string;
		}) => {
			const googleAuthUrl = "https://accounts.google.com/o/oauth2/v2/auth";

			const scope = [
				"https://www.googleapis.com/auth/userinfo.email",
				"https://www.googleapis.com/auth/userinfo.profile",
			].join(" ");

			const clientId = process.env.NEXT_PUBLIC_REACT_APP_GOOGLE_CLIENT_ID;

			if (!clientId) {
				throw new Error("Google client ID is not defined");
			}

			const params = new URLSearchParams({
				response_type: "code",
				client_id: clientId,
				redirect_uri: `${process.env.NEXT_PUBLIC_REACT_APP_GOOGLE_REDIRECT_URL_ENDPOINT}${strGoogleRedirectUri}`,
				prompt: prompt,
				access_type: "offline",
				scope,
			});

			const url = `${googleAuthUrl}?${params}`;

			window.location.href = url;
		},
		[],
	);
	return (
		<ContextAuthenticatedUser.Provider
			value={{
				authenticatedUser,
				authenticationChecked,
				emailVerified,
				identityVerified,
				funcAddGalleryImage,
				funcCreateProfileHighlight,
				funcLogin,
				funcLogout,
				funcRegister,
				funcRequestPasswordReset,
				funcResetPassword, // from password reset page
				funcUpdateProfile,
				funcUpdateProfilePicture,
				funcUpdateProfileHighlight,
				funcUpdateUser,
				funcUpdateUserTags,
				funcVerifyToken,
				funcDeleteGalleryImage,
				funcDeleteProfileHighlight,
				hasActiveSubscription:
					authenticatedUser?.hasActiveSubscription ?? false,
				isAdmin,
				isLoggedIn,
				canUseAuthenticatedApi,
				openGoogleLoginPage,
				profilePicURL,
				updateUser,
				updateEmailVerified,
				updateIdentityVerified,
				authenticateWithGoogleSuccess,
				uploadFromUrl,
			}}
		>
			{children}
		</ContextAuthenticatedUser.Provider>
	);
};

export const useAuthenticatedUser = () => useContext(ContextAuthenticatedUser);
