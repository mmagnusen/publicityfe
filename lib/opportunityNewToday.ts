const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export const isOpportunityNewToday = (
	createdAt: string | null | undefined,
): boolean => {
	const trimmed = createdAt?.trim();
	if (!trimmed) {
		return false;
	}

	const created = new Date(trimmed);
	if (Number.isNaN(created.getTime())) {
		return false;
	}

	return Date.now() - created.getTime() < TWENTY_FOUR_HOURS_MS;
};
