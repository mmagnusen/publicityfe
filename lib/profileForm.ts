import type { SelectOption } from "@components/Select/Select";
import type { RichTextContent } from "@customTypes/index";
import { RichTextDefaultValues } from "@customTypes/index";
import type { PublicUser } from "@customTypes/publicUser";
import type { Tag } from "@customTypes/tag";
import {
	emptyTipTapDoc,
	parseTipTapDocFromApi,
	unwrapMisstoredJsonStringTipTapDoc,
} from "@lib/tiptap-utils";
import type { JSONContent } from "@tiptap/react";

import type { ProfileLink } from "@/lib/profiles";

export type ProfileFormValues = {
	first_name: string;
	last_name: string;
	bio: RichTextContent;
	short_description: RichTextContent;
	headline: string;
	city: string;
	personal_website_url: string;
	linked_in_url: string;
	instagram_url: string;
	facebook_url: string;
	tags: SelectOption[];
};

const tipTapDocHasContent = (json: unknown): boolean => {
	const doc = parseTipTapDocFromApi(json);
	return (
		doc != null &&
		Array.isArray(doc.content) &&
		doc.content.some((block) => {
			if (!block || typeof block !== "object") {
				return false;
			}
			if (block.type === "paragraph" && Array.isArray(block.content)) {
				return block.content.length > 0;
			}
			return true;
		})
	);
};

const emptyRichText = (): RichTextContent => ({
	...RichTextDefaultValues,
	editorJSON: emptyTipTapDoc(),
});

const plainTextToTipTapDoc = (text: string): JSONContent => {
	const paragraphs = text.split(/\n+/).filter((line) => line.trim());
	if (paragraphs.length === 0) {
		return emptyTipTapDoc();
	}

	return {
		type: "doc",
		content: paragraphs.map((paragraph) => ({
			type: "paragraph",
			content: [{ type: "text", text: paragraph.trim() }],
		})),
	};
};

const richTextFromApiField = (raw: string | undefined): RichTextContent => {
	const parsedDoc = parseTipTapDocFromApi(raw);
	if (parsedDoc) {
		return {
			...RichTextDefaultValues,
			editorJSON: unwrapMisstoredJsonStringTipTapDoc(parsedDoc),
		};
	}

	if (raw?.trim()) {
		const trimmed = raw.trim();
		return {
			...RichTextDefaultValues,
			characterCount: trimmed.replace(/\s/g, "").length,
			editorJSON: plainTextToTipTapDoc(trimmed),
		};
	}

	return emptyRichText();
};

export const bioToApiField = (rich: RichTextContent): string => {
	const doc = parseTipTapDocFromApi(rich.editorJSON);
	if (doc && tipTapDocHasContent(doc)) {
		return JSON.stringify(unwrapMisstoredJsonStringTipTapDoc(doc));
	}

	const html = rich.editorHTML?.trim();
	if (html) {
		return html;
	}

	return "";
};

export const tagsToSelectOptions = (tags: Tag[] | undefined): SelectOption[] =>
	(tags ?? []).map((tag) => ({
		label: tag.name,
		value: String(tag.pk),
	}));

export const selectOptionsToTagPks = (options: SelectOption[]): number[] =>
	options
		.map((option) => Number(option.value))
		.filter((pk) => Number.isFinite(pk) && pk > 0);

export const profileFormValuesFromPublicUser = (
	user: PublicUser,
): ProfileFormValues => ({
	first_name: user.first_name ?? "",
	last_name: user.last_name ?? "",
	bio: richTextFromApiField(user.human_profile?.bio),
	short_description: richTextFromApiField(
		user.human_profile?.short_description,
	),
	headline: user.human_profile?.tagline ?? user.human_profile?.headline ?? "",
	city: user.human_profile?.city ?? "",
	personal_website_url: user.human_profile?.personal_website_url ?? "",
	linked_in_url: user.human_profile?.linked_in_url ?? "",
	instagram_url: user.human_profile?.instagram_url ?? "",
	facebook_url: user.human_profile?.facebook_url ?? "",
	tags: tagsToSelectOptions(user.tags),
});

const normalizeProfileLinkUrl = (url: string): string => {
	const trimmed = url.trim();
	if (!trimmed) {
		return "";
	}

	if (/^https?:\/\//i.test(trimmed)) {
		return trimmed;
	}

	return `https://${trimmed}`;
};

const profileLinkLabel = (url: string, type: ProfileLink["type"]): string => {
	try {
		const parsed = new URL(normalizeProfileLinkUrl(url));

		if (type === "instagram") {
			const handle = parsed.pathname.replace(/^\/+|\/+$/g, "");
			if (handle) {
				return handle.startsWith("@") ? handle : `@${handle}`;
			}
		}

		if (type === "facebook") {
			const path = parsed.pathname.replace(/^\/+|\/+$/g, "");
			if (path) {
				return path;
			}
		}

		if (type === "linkedin") {
			const path = parsed.pathname.replace(/^\/+|\/+$/g, "");
			if (path) {
				return path.replace(/^in\//, "");
			}
		}

		return (
			parsed.hostname.replace(/^www\./, "") +
			(parsed.pathname !== "/" ? parsed.pathname : "")
		);
	} catch {
		return url.trim();
	}
};

/** Sidebar links built from human_profile URL fields. */
export const profileLinksFromFields = (
	profile:
		| Pick<
				PublicUser["human_profile"],
				| "personal_website_url"
				| "linked_in_url"
				| "instagram_url"
				| "facebook_url"
		  >
		| null
		| undefined,
): ProfileLink[] => {
	if (!profile) {
		return [];
	}

	const entries: Array<[ProfileLink["type"], string | undefined]> = [
		["website", profile.personal_website_url],
		["linkedin", profile.linked_in_url],
		["instagram", profile.instagram_url],
		["facebook", profile.facebook_url],
	];

	return entries.flatMap(([type, rawUrl]) => {
		const trimmed = rawUrl?.trim();
		if (!trimmed) {
			return [];
		}

		return [
			{
				type,
				href: normalizeProfileLinkUrl(trimmed),
				label: profileLinkLabel(trimmed, type),
			},
		];
	});
};

/** Sidebar links built from `/users/public-user/:username` human_profile URL fields. */
export const profileLinksFromPublicUser = (user: PublicUser): ProfileLink[] =>
	profileLinksFromFields(user.human_profile);

export const profileLinksFromFormValues = (
	values: Pick<
		ProfileFormValues,
		"personal_website_url" | "linked_in_url" | "instagram_url" | "facebook_url"
	>,
): ProfileLink[] => profileLinksFromFields(values);
