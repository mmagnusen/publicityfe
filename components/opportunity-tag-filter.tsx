"use client";

import { useMemo } from "react";

import type {
	OpportunityListAppliedFilter,
	OpportunityListSort,
} from "@hooks/useOpportunities";
import { useAllTags } from "@hooks/useTags";
import type { MultiValue, SingleValue } from "react-select";

import Select, { type SelectOption } from "@/components/Select/Select";
import Text from "@/components/Text";
import { selectOptionsToTagPks, tagsToSelectOptions } from "@/lib/profileForm";

const sortOptions: SelectOption[] = [
	{ label: "Newest first", value: "newest" },
	{ label: "Deadline soonest", value: "deadline" },
];

const appliedOptions: SelectOption[] = [
	{ label: "All opportunities", value: "" },
	{ label: "Applied", value: "true" },
	{ label: "Not applied", value: "false" },
];

function isMultiSelectValue(
	value: SingleValue<SelectOption> | MultiValue<SelectOption>,
): value is MultiValue<SelectOption> {
	return Array.isArray(value);
}

type Props = {
	selectedApplied: OpportunityListAppliedFilter;
	selectedSort: OpportunityListSort;
	selectedTagPks: number[];
	onSelectedAppliedChange: (applied: OpportunityListAppliedFilter) => void;
	onSelectedSortChange: (sort: OpportunityListSort) => void;
	onSelectedTagPksChange: (tagPks: number[]) => void;
	showAppliedFilter?: boolean;
};

export function OpportunityListFilters({
	selectedApplied,
	selectedSort,
	selectedTagPks,
	onSelectedAppliedChange,
	onSelectedSortChange,
	onSelectedTagPksChange,
	showAppliedFilter = true,
}: Props) {
	const { data: tags, error, isLoading } = useAllTags();
	const tagOptions = useMemo(() => tagsToSelectOptions(tags ?? []), [tags]);
	const selectedTagOptions = useMemo(
		() =>
			tagOptions.filter((option) =>
				selectedTagPks.includes(Number(option.value)),
			),
		[selectedTagPks, tagOptions],
	);
	const selectedSortOption = useMemo(
		() =>
			sortOptions.find((option) => option.value === selectedSort) ??
			sortOptions[0],
		[selectedSort],
	);
	const selectedAppliedOption = useMemo(
		() =>
			appliedOptions.find((option) => option.value === selectedApplied) ??
			appliedOptions[0],
		[selectedApplied],
	);

	const handleTagChange = (
		value: SingleValue<SelectOption> | MultiValue<SelectOption>,
	) => {
		const selected = isMultiSelectValue(value) ? value : [];
		onSelectedTagPksChange(selectOptionsToTagPks([...selected]));
	};

	const handleSortChange = (
		value: SingleValue<SelectOption> | MultiValue<SelectOption>,
	) => {
		if (isMultiSelectValue(value)) {
			onSelectedSortChange("newest");
			return;
		}

		if (value?.value === "deadline") {
			onSelectedSortChange("deadline");
			return;
		}

		onSelectedSortChange("newest");
	};

	const handleAppliedChange = (
		value: SingleValue<SelectOption> | MultiValue<SelectOption>,
	) => {
		if (isMultiSelectValue(value)) {
			onSelectedAppliedChange("");
			return;
		}

		if (value?.value === "true" || value?.value === "false") {
			onSelectedAppliedChange(value.value);
			return;
		}

		onSelectedAppliedChange("");
	};

	return (
		<div className="rounded-2xl border border-gray-200 bg-white p-4">
			<div
				className={
					showAppliedFilter
						? "grid gap-4 sm:grid-cols-[minmax(0,1fr)_220px_220px] sm:items-start"
						: "grid gap-4 sm:grid-cols-[minmax(0,1fr)_220px] sm:items-start"
				}
			>
				<div>
					<label
						className="mb-2 block text-sm font-medium text-gray-900"
						htmlFor="opportunity-tag-filter"
					>
						Filter by tag
					</label>
					<Select
						arrOptions={tagOptions}
						bCompact
						id="opportunity-tag-filter"
						isClearable
						isDisabled={isLoading || Boolean(error)}
						isMulti
						isSearchable
						onChange={handleTagChange}
						placeholder={isLoading ? "Loading tags…" : "Search by tag…"}
						value={selectedTagOptions}
					/>
					{selectedTagPks.length > 1 ? (
						<Text variant="caption" className="mt-2">
							Showing opportunities that match all selected tags.
						</Text>
					) : null}
					{error ? (
						<Text variant="error" className="mt-2">
							Could not load tags. Try refreshing the page.
						</Text>
					) : null}
				</div>

				{showAppliedFilter ? (
					<div>
						<label
							className="mb-2 block text-sm font-medium text-gray-900"
							htmlFor="opportunity-applied-filter"
						>
							Applied status
						</label>
						<Select
							arrOptions={appliedOptions}
							bCompact
							id="opportunity-applied-filter"
							isSearchable={false}
							onChange={handleAppliedChange}
							value={selectedAppliedOption}
						/>
					</div>
				) : null}

				<div>
					<label
						className="mb-2 block text-sm font-medium text-gray-900"
						htmlFor="opportunity-sort-filter"
					>
						Sort by
					</label>
					<Select
						arrOptions={sortOptions}
						bCompact
						id="opportunity-sort-filter"
						isSearchable={false}
						onChange={handleSortChange}
						value={selectedSortOption}
					/>
				</div>
			</div>
		</div>
	);
}

/** @deprecated Use {@link OpportunityListFilters} */
export const OpportunityTagFilter = OpportunityListFilters;
