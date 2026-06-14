import { useCallback } from "react";

import { useLogSnag } from "@logsnag/next";

export const useLogs = () => {
	const { track } = useLogSnag();

	const trackEvent = useCallback(
		({ channel, event, description, functionName }) => {
			track({
				channel,
				event,
				description,
				// user_id: "user-123", // optional when set using setUserId
				icon: "🔥",
				notify: true,
				tags: {
					"function-name": functionName,
				},
			});
		},
		[track],
	);

	return {
		trackEvent,
	};
};
