import { instanceAxios } from "@util/instanceAxios";

type SubmitApplicationPayload = {
	message: string;
	opportunityId: number;
};

export async function submitApplication({
	message,
	opportunityId,
}: SubmitApplicationPayload): Promise<void> {
	await instanceAxios({
		method: "post",
		url: "/opportunities/submit-application",
		data: {
			opportunity_id: opportunityId,
			message: message.trim(),
		},
	});
}
