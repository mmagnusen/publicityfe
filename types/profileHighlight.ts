/** Press / podcast / article link from `/users/fetch-profile-links` and public user `profile_links`. */
export type ProfileHighlight = {
	pk: number;
	publication: string;
	title: string;
	url: string;
	year: number | null;
	sort_order: number;
};

export type ProfileHighlightInput = {
	publication: string;
	title: string;
	url: string;
	year?: number | null;
	sort_order?: number;
};
