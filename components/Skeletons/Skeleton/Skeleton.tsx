import { cn } from "@/lib/cn";
import { skeletonVariants } from "./style";

const Skeleton = ({ width = "100%", height = "100%" }) => {
	return (
		<div
			className={cn(skeletonVariants(), "animate-pulse")}
			style={{ width, height }}
		/>
	);
};

export default Skeleton;
