import { useEffect } from "react";
import { Crisp } from "crisp-sdk-web";

import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";

/** Shows the Crisp chat bubble while mounted; hides on unmount (same pattern as Contact). */
export const useCrispChatWidget = () => {
	const { authenticatedUser, isLoggedIn } = useAuthenticatedUser();

	useEffect(() => {
		const websiteId = process.env.NEXT_PUBLIC_CRISP_WEBSITE;
		if (!websiteId) return;

		Crisp.configure(String(websiteId));
		Crisp.chat.show();

		if (isLoggedIn && authenticatedUser) {
			const email = authenticatedUser.email;
			if (email) {
				Crisp.user.setEmail(String(email));
			}
			Crisp.user.setNickname(
				`${authenticatedUser.firstName ?? ""} ${authenticatedUser.lastName ?? ""}`.trim() ||
					"Member",
			);
		}

		return () => {
			Crisp.chat.hide();
		};
	}, [isLoggedIn, authenticatedUser]);
};
