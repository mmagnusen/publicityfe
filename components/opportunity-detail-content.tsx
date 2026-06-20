"use client";

import { useMemo } from "react";
import axios from "axios";
import { useParams } from "next/navigation";

import { useMediaOutlet } from "@hooks/useMediaOutlets";
import { useOpportunity } from "@hooks/useOpportunities";

import { OpportunityDetail } from "@/components/opportunity-detail";
import Text from "@/components/Text";
import { mapApiOpportunityToDisplay } from "@/lib/opportunities";

export function OpportunityDetailContent() {
	const params = useParams<{ pk: string }>();
	const pk = Number(params.pk);

	const { data, error, isLoading } = useOpportunity(
		Number.isFinite(pk) && pk > 0 ? pk : null,
	);

	const mediaOutletPk =
		data?.media_outlet != null && data.media_outlet > 0
			? data.media_outlet
			: null;
	const { data: mediaOutlet, isLoading: isLoadingMediaOutlet } =
		useMediaOutlet(mediaOutletPk);

	const opportunity = useMemo(
		() => (data ? mapApiOpportunityToDisplay(data, mediaOutlet) : null),
		[data, mediaOutlet],
	);

	if (!Number.isFinite(pk) || pk <= 0) {
		return (
			<div className="flex min-h-full items-center justify-center bg-white px-6 py-16">
				<Text variant="center-sm">Invalid opportunity.</Text>
			</div>
		);
	}

	if (isLoading || (mediaOutletPk != null && isLoadingMediaOutlet)) {
		return (
			<div className="flex min-h-full items-center justify-center bg-white px-6 py-16">
				<Text variant="loading">Loading opportunity…</Text>
			</div>
		);
	}

	if (error || !data || !opportunity) {
		const accessDenied = axios.isAxiosError(error)
			? error.response?.status === 401 || error.response?.status === 403
			: false;

		return (
			<div className="flex min-h-full items-center justify-center bg-white px-6 py-16">
				<Text variant="error">
					{accessDenied
						? "Could not load this opportunity. You may not have permission to view it."
						: "Could not load this opportunity. It may not exist or the API is unavailable."}
				</Text>
			</div>
		);
	}

	return <OpportunityDetail opportunity={opportunity} />;
}
