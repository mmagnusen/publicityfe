const POSTCODES_IO_BASE = "https://api.postcodes.io";

/** Milliseconds to wait after typing before calling postcodes.io autocomplete. */
export const POSTCODE_AUTOCOMPLETE_DEBOUNCE_MS = 400;

/**
 * Basic client-side check before calling postcodes.io autocomplete.
 * Compact form (no spaces): 2–12 chars, letters and digits only, must start with a letter.
 */
export const isValidPartialUkPostcodeForAutocomplete = (
	input: string,
): boolean => {
	const compact = input.trim().replace(/\s+/g, "");
	if (compact.length < 2 || compact.length > 12) return false;
	if (!/^[A-Za-z0-9]+$/i.test(compact)) return false;
	if (!/^[A-Za-z]/.test(compact)) return false;
	return true;
};

export type PostcodeLocation = {
	area: string;
	postcode: string;
	city: string;
	latitude: number;
	longitude: number;
};

type PostcodesIoLookupResult = {
	postcode: string;
	latitude: number;
	longitude: number;
	admin_district: string;
	admin_ward: string;
	parish: string;
	post_town?: string;
	region: string;
};

/**
 * Returns matching full postcodes for a partial query (postcodes.io autocomplete).
 * Uses the compact outcode+incode form in the URL path (no spaces).
 */
export const fetchPostcodeAutocomplete = async (
	partial: string,
): Promise<string[]> => {
	if (!isValidPartialUkPostcodeForAutocomplete(partial)) return [];

	const compact = partial.trim().replace(/\s+/g, "");
	const pathSegment = encodeURIComponent(compact);
	const res = await fetch(
		`${POSTCODES_IO_BASE}/postcodes/${pathSegment}/autocomplete`,
	);
	const json = (await res.json()) as {
		status: number;
		result: string[] | null;
	};
	if (json.status !== 200 || !Array.isArray(json.result)) return [];
	return json.result;
};

export const mapLookupResultToLocation = (
	result: PostcodesIoLookupResult,
): PostcodeLocation => {
	return {
		postcode: result.postcode,
		area: result.admin_ward || result.admin_district || "",
		city: result.post_town || result.region || result.admin_district || "",
		latitude: result.latitude,
		longitude: result.longitude,
	};
};

/**
 * Full postcode lookup (normalised postcode from autocomplete selection).
 */
export const fetchPostcodeLocation = async (
	postcode: string,
): Promise<PostcodeLocation | null> => {
	const encoded = encodeURIComponent(postcode.trim());
	const res = await fetch(`${POSTCODES_IO_BASE}/postcodes/${encoded}`);
	const json = (await res.json()) as {
		status: number;
		result: PostcodesIoLookupResult | null;
	};
	if (json.status !== 200 || !json.result) return null;
	return mapLookupResultToLocation(json.result);
};
