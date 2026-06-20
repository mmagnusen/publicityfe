"use client";

import RichTextRenderer from "@components/RichTextRenderer";
import {
	parseTipTapDocFromApi,
	unwrapMisstoredJsonStringTipTapDoc,
} from "@lib/tiptap-utils";

type ProfileBioContentProps = {
	bio?: string | null;
};

export function ProfileBioContent({ bio }: ProfileBioContentProps) {
	const trimmed = bio?.trim();
	if (!trimmed) {
		return null;
	}

	const parsedDoc = parseTipTapDocFromApi(trimmed);
	const richText = parsedDoc
		? unwrapMisstoredJsonStringTipTapDoc(parsedDoc)
		: null;

	if (!richText) {
		return null;
	}

	return (
		<RichTextRenderer className="mt-6" key={trimmed} richText={richText} />
	);
}
