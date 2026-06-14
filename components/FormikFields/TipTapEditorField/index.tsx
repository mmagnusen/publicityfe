import { useField } from "formik";
import { isEmpty, isNil } from "lodash-es";

import type { SimpleEditorProps } from "@components/tiptap-templates/simple/simple-editor";
import SimpleEditor from "@components/tiptap-templates/simple/simple-editor";
import useTipTapEditor from "@components/tiptap-templates/simple/useTipTapEditor";
import type { RichTextContent, Validation } from "@customTypes/index";
import { RichTextDefaultValues } from "@customTypes/index";
import type { JSONContent } from "@tiptap/react";

import {
	tipTapEditorOutlineVariants,
	tipTapFieldVariants,
	tipTapLabelRowVariants,
} from "./style";

const getInitialCharacterCountFromExistingContent = (string: string = "") => {
	if (isEmpty(string) || isNil(string)) {
		return 0;
	}
	const contentWithoutHTMLTAHS = string.replace(/<[^>]*>/g, "");
	const contentWithoutWhitespace = contentWithoutHTMLTAHS.replace(/ /g, "");
	return contentWithoutWhitespace.length;
};

const getInitialEditorJSONFromExistingContent = (
	initialContent: string = "",
) => {
	if (isEmpty(initialContent)) {
		return "";
	}

	try {
		const parsedContent = JSON.parse(initialContent);
		return parsedContent;
	} catch (error) {
		console.error("Error parsing initial content JSON:", error);
		return "";
	}
};

export const getInitialEditorValues = (content?: string): RichTextContent => {
	return {
		...RichTextDefaultValues,
		characterCount: getInitialCharacterCountFromExistingContent(content),
		editorJSON: getInitialEditorJSONFromExistingContent(content),
	};
};

interface Props extends Omit<SimpleEditorProps, "editor"> {
	existingContent?: JSONContent | null | string;
	name: string;
	strLabel?: string;
}

const TipTapEditorField = ({
	strLabel,
	name,
	existingContent,
	...restProps
}: Props) => {
	const [, formikProps, helpers] = useField(name);
	const { setTouched, setValue } = helpers;
	const { error, touched } = formikProps;

	const handleChange = ({
		characterCount,
		wordCount,
		editorJSON,
		editorHTML,
	}: RichTextContent) => {
		setValue({
			editorHTML,
			editorJSON,
			characterCount,
			wordCount,
		});
	};

	const handleBlur = () => {
		setTouched(true);
	};

	const objValidation: Validation = {
		bIsValid: touched ? isEmpty(error) : true,
		strErrorMessage: touched ? (error as string) : "",
	};

	const { editor } = useTipTapEditor({
		onChange: handleChange,
		onBlur: handleBlur,
		existingContent,
	});

	return (
		<div className={tipTapFieldVariants()}>
			<div className={tipTapLabelRowVariants()}>
				{strLabel ? <label htmlFor={name}>{strLabel}</label> : null}
			</div>
			<div className={tipTapEditorOutlineVariants()}>
				<SimpleEditor
					editor={editor}
					objValidation={objValidation}
					{...restProps}
				/>
			</div>
		</div>
	);
};

export default TipTapEditorField;
