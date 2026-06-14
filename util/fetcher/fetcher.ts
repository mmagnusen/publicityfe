import type { AxiosRequestConfig } from "axios";

import { instanceAxios } from "@util/instanceAxios";

const fetcher = async (
	url: string,
	params: AxiosRequestConfig["params"] = {},
) => {
	const data = await instanceAxios({
		method: "get",
		url: url,
		params,
	});

	return data?.data;
};

export default fetcher;
