import { cva } from "class-variance-authority";

export const fieldVariants = cva(
	"mb-4 grid grid-cols-1 gap-4 [&_label]:flex [&_label]:items-center [&_label]:justify-start [&_label]:text-black",
);
