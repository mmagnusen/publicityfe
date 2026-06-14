/**
 * Bytescale file paths must be absolute (begin with `/`, not end with `/`).
 * Paths parsed from public CDN URLs often omit the leading slash.
 */
export const normalizeBytescaleFilePath = (filePath: string): string => {
	const t = filePath.trim();
	if (!t) {
		return t;
	}
	return t.startsWith("/") ? t : `/${t}`;
};
