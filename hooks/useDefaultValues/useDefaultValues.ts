import { patchContent } from "@hooks/useContent";
import useErrorReport, { REPORT_POSTHOG_ONLY } from "@hooks/useErrorReport";

const useDefaultValues = () => {
	const { reportError } = useErrorReport({
		functionNamePrefix: "useDefaultValues",
	});

	const editAdDefaultValue = async ({
		content,
		pk,
	}: {
		content: string;
		pk: number;
	}) => {
		try {
			await patchContent(pk, { content });
		} catch (error) {
			reportError(error, "editAdDefaultValue", REPORT_POSTHOG_ONLY);
			throw error;
		}
	};

	return {
		editAdDefaultValue,
	};
};

export default useDefaultValues;
