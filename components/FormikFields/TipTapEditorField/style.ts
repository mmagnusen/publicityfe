import { cva } from "class-variance-authority";

export const tipTapFieldVariants = cva(
	"mb-4 grid grid-cols-1 gap-4 [&_label]:flex [&_label]:items-center [&_label]:justify-start",
);

export const tipTapLabelRowVariants = cva("flex gap-4");

export const tipTapEditorOutlineVariants = cva(
	"overflow-hidden rounded-sm border border-base-300",
);
