import useErrorReport, { REPORT_POSTHOG_ONLY } from "@hooks/useErrorReport";
import { instanceAxios } from "@util/instanceAxios";

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
			await instanceAxios({
				method: "patch",
				url: `/content/update-content/${pk}`,
				data: { content },
			});
		} catch (error) {
			reportError(error, "editAdDefaultValue", REPORT_POSTHOG_ONLY);
			throw error; // Re-throw the error to handle it in the calling component
		}
	};

	return {
		editAdDefaultValue,
	};
};

export default useDefaultValues;
