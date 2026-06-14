import { useCallback, useEffect, useState } from "react";

const useMedia = (query: string) => {
	const [value, setValue] = useState(false);
	const updateValue = useCallback((e: any) => setValue(e.matches), []);

	useEffect(() => {
		const media = window.matchMedia(query);
		const isBrowserNew = media.addEventListener;

		// @ts-expect-error --- IGNORE ---
		if (isBrowserNew) {
			media.addEventListener("change", updateValue);
		} else {
			// since some browsers like safari 13 .. version still do not support it
			media.addListener(updateValue);
		}

		if (media.matches) {
			setValue(true);
		}
		return () =>
			// @ts-expect-error --- IGNORE ---
			isBrowserNew
				? media.removeEventListener("change", updateValue)
				: media.removeListener(updateValue);
	}, [query, updateValue]);

	return value;
};

export default useMedia;
