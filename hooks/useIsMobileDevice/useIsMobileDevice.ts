import { isMobile } from "react-device-detect";

/**
 * Returns a boolean indicating if the current viewport should be treated as mobile.
 * Uses a max-width media query so it's safe for SSR (runs only in effects on the client).
 */
const useIsMobileDevice = () => {
	return { isMobileDevice: isMobile };
};

export default useIsMobileDevice;
