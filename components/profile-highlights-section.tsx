"use client";

import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import useSWR from "swr";
import { mdiDelete, mdiPencil } from "@mdi/js";
import Icon from "@mdi/react";

import type { ProfileHighlight } from "@customTypes/profileHighlight";
import { useAuthenticatedUser } from "@hooks/useAuthenticatedUser";
import fetcher from "@util/fetcher";

import Button from "@/components/Button";
import Heading from "@/components/Heading";
import Text from "@/components/Text";

type HighlightsResponse = {
	results: ProfileHighlight[];
};

type HighlightFormState = {
	publication: string;
	title: string;
	url: string;
	year: string;
};

type ProfileHighlightsSectionProps = {
	initialHighlights: ProfileHighlight[];
	profileUsername: string;
	userPk: number;
};

function ExternalLinkIcon() {
	return (
		<svg
			viewBox="0 0 16 16"
			fill="none"
			className="size-3.5 shrink-0"
			aria-hidden
		>
			<title>External link</title>
			<path
				d="M10 3h3v3M9 7l4-4M6 4H4a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1v-2"
				stroke="currentColor"
				strokeWidth="1.25"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

const emptyForm = (): HighlightFormState => ({
	publication: "",
	title: "",
	url: "",
	year: "",
});

const formFromHighlight = (
	highlight: ProfileHighlight,
): HighlightFormState => ({
	publication: highlight.publication,
	title: highlight.title,
	url: highlight.url,
	year: highlight.year != null ? String(highlight.year) : "",
});

const parseYear = (value: string): number | null => {
	const trimmed = value.trim();
	if (!trimmed) {
		return null;
	}

	const year = Number.parseInt(trimmed, 10);
	return Number.isFinite(year) ? year : null;
};

const validateForm = (values: HighlightFormState): string | null => {
	if (!values.publication.trim()) {
		return "Publication is required.";
	}
	if (!values.title.trim()) {
		return "Title is required.";
	}
	if (!values.url.trim()) {
		return "URL is required.";
	}

	try {
		new URL(values.url.trim());
	} catch {
		return "Enter a valid URL.";
	}

	if (values.year.trim() && parseYear(values.year) == null) {
		return "Enter a valid year.";
	}

	return null;
};

function HighlightForm({
	initialValues,
	isSaving,
	onCancel,
	onSubmit,
	submitLabel,
}: {
	initialValues: HighlightFormState;
	isSaving: boolean;
	onCancel: () => void;
	onSubmit: (values: HighlightFormState) => Promise<void>;
	submitLabel: string;
}) {
	const [values, setValues] = useState(initialValues);

	const handleChange =
		(field: keyof HighlightFormState) =>
		(event: React.ChangeEvent<HTMLInputElement>) => {
			setValues((current) => ({ ...current, [field]: event.target.value }));
		};

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		const error = validateForm(values);
		if (error) {
			toast.error(error);
			return;
		}

		await onSubmit(values);
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="mt-4 space-y-3 rounded-2xl border border-gray-200 bg-gray-50 p-4"
		>
			<div>
				<label
					htmlFor="highlight-publication"
					className="mb-1 block text-sm font-medium text-gray-700"
				>
					Publication
				</label>
				<input
					id="highlight-publication"
					value={values.publication}
					onChange={handleChange("publication")}
					className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
					placeholder="Forbes"
				/>
			</div>
			<div>
				<label
					htmlFor="highlight-title"
					className="mb-1 block text-sm font-medium text-gray-700"
				>
					Title
				</label>
				<input
					id="highlight-title"
					value={values.title}
					onChange={handleChange("title")}
					className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
					placeholder="Article or episode title"
				/>
			</div>
			<div>
				<label
					htmlFor="highlight-url"
					className="mb-1 block text-sm font-medium text-gray-700"
				>
					URL
				</label>
				<input
					id="highlight-url"
					type="url"
					value={values.url}
					onChange={handleChange("url")}
					className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
					placeholder="https://"
				/>
			</div>
			<div>
				<label
					htmlFor="highlight-year"
					className="mb-1 block text-sm font-medium text-gray-700"
				>
					Year <span className="font-normal text-gray-400">(optional)</span>
				</label>
				<input
					id="highlight-year"
					inputMode="numeric"
					value={values.year}
					onChange={handleChange("year")}
					className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
					placeholder="2025"
				/>
			</div>
			<div className="flex flex-wrap gap-2 pt-1">
				<Button type="submit" bLoading={isSaving} strVariant="primary">
					{submitLabel}
				</Button>
				<Button
					type="button"
					onClick={onCancel}
					strVariant="transparentWithBorder"
				>
					Cancel
				</Button>
			</div>
		</form>
	);
}

export function ProfileHighlightsSection({
	initialHighlights,
	profileUsername,
	userPk,
}: ProfileHighlightsSectionProps) {
	const {
		authenticatedUser,
		canUseAuthenticatedApi,
		funcCreateProfileHighlight,
		funcDeleteProfileHighlight,
		funcUpdateProfileHighlight,
	} = useAuthenticatedUser();
	const [isSaving, setIsSaving] = useState(false);
	const [deletingPk, setDeletingPk] = useState<number | null>(null);
	const [isAdding, setIsAdding] = useState(false);
	const [editingPk, setEditingPk] = useState<number | null>(null);

	const isOwner =
		Boolean(authenticatedUser?.username?.trim()) &&
		authenticatedUser?.username?.trim() === profileUsername.trim();

	const highlightsKey =
		isOwner && canUseAuthenticatedApi && userPk
			? `/users/fetch-profile-links/${userPk}`
			: null;

	const { data, mutate } = useSWR<HighlightsResponse>(highlightsKey, fetcher, {
		revalidateOnMount: true,
	});

	const highlights = useMemo(() => {
		const source =
			isOwner && canUseAuthenticatedApi
				? (data?.results ?? initialHighlights)
				: initialHighlights;

		return [...source].sort(
			(a, b) => a.sort_order - b.sort_order || a.pk - b.pk,
		);
	}, [canUseAuthenticatedApi, data?.results, initialHighlights, isOwner]);

	const editingHighlight =
		editingPk != null
			? (highlights.find((item) => item.pk === editingPk) ?? null)
			: null;

	const closeForm = () => {
		setIsAdding(false);
		setEditingPk(null);
	};

	const handleCreate = async (values: HighlightFormState) => {
		setIsSaving(true);
		try {
			await funcCreateProfileHighlight({
				publication: values.publication.trim(),
				title: values.title.trim(),
				url: values.url.trim(),
				year: parseYear(values.year),
				sort_order: highlights.length,
			});
			await mutate();
			closeForm();
			toast.success("Highlight added");
		} catch {
			toast.error("Unable to add highlight");
		} finally {
			setIsSaving(false);
		}
	};

	const handleUpdate = async (values: HighlightFormState) => {
		if (editingPk == null) {
			return;
		}

		const existing = highlights.find((item) => item.pk === editingPk);
		if (!existing) {
			return;
		}

		setIsSaving(true);
		try {
			await funcUpdateProfileHighlight(editingPk, {
				publication: values.publication.trim(),
				title: values.title.trim(),
				url: values.url.trim(),
				year: parseYear(values.year),
				sort_order: existing.sort_order,
			});
			await mutate();
			closeForm();
			toast.success("Highlight updated");
		} catch {
			toast.error("Unable to update highlight");
		} finally {
			setIsSaving(false);
		}
	};

	const handleDelete = async (highlight: ProfileHighlight) => {
		const confirmed = window.confirm(
			"Delete this highlight? This cannot be undone.",
		);
		if (!confirmed) {
			return;
		}

		setDeletingPk(highlight.pk);
		try {
			await funcDeleteProfileHighlight(highlight.pk);
			await mutate();
			if (editingPk === highlight.pk) {
				closeForm();
			}
			toast.success("Highlight removed");
		} catch {
			toast.error("Unable to delete highlight");
		} finally {
			setDeletingPk(null);
		}
	};

	return (
		<section className="mt-10">
			<div className="flex items-center justify-between gap-4">
				<Heading level={2} variant="label">
					Highlights
				</Heading>
				{isOwner && canUseAuthenticatedApi && !isAdding && editingPk == null ? (
					<Button
						type="button"
						strVariant="transparentWithBorder"
						onClick={() => {
							setIsAdding(true);
							setEditingPk(null);
						}}
					>
						Add highlight
					</Button>
				) : null}
			</div>

			{isAdding ? (
				<HighlightForm
					initialValues={emptyForm()}
					isSaving={isSaving}
					onCancel={closeForm}
					onSubmit={handleCreate}
					submitLabel="Add highlight"
				/>
			) : null}

			{editingHighlight ? (
				<HighlightForm
					key={editingHighlight.pk}
					initialValues={formFromHighlight(editingHighlight)}
					isSaving={isSaving}
					onCancel={closeForm}
					onSubmit={handleUpdate}
					submitLabel="Save changes"
				/>
			) : null}

			{highlights.length === 0 ? (
				<p className="mt-4 text-sm text-gray-500">No highlights yet.</p>
			) : (
				<ul className="mt-4 divide-y divide-gray-200 rounded-2xl border border-gray-200">
					{highlights.map((item) => (
						<li key={item.pk}>
							<div className="flex items-start gap-3 px-5 py-4">
								<a
									href={item.url}
									target="_blank"
									rel="noopener noreferrer"
									className="flex min-w-0 flex-1 items-start gap-4 transition-colors hover:bg-gray-50"
								>
									<div className="min-w-0 flex-1">
										<Text variant="sm">
											<span className="font-semibold text-black">
												{item.publication}
											</span>
											<span className="text-gray-500">
												{" "}
												&mdash; &ldquo;{item.title}&rdquo;
											</span>
										</Text>
									</div>
									<div className="flex shrink-0 items-center gap-3">
										{item.year != null ? (
											<span className="text-sm text-gray-400">{item.year}</span>
										) : null}
										<ExternalLinkIcon />
									</div>
								</a>
								{isOwner && canUseAuthenticatedApi ? (
									<div className="flex shrink-0 items-center gap-1">
										<button
											type="button"
											aria-label={`Edit ${item.publication} highlight`}
											className="rounded-full p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
											onClick={() => {
												setEditingPk(item.pk);
												setIsAdding(false);
											}}
										>
											<Icon path={mdiPencil} size={0.7} />
										</button>
										<button
											type="button"
											aria-label={`Delete ${item.publication} highlight`}
											className="rounded-full p-1.5 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
											disabled={deletingPk === item.pk}
											onClick={() => handleDelete(item)}
										>
											<Icon path={mdiDelete} size={0.7} />
										</button>
									</div>
								) : null}
							</div>
						</li>
					))}
				</ul>
			)}
		</section>
	);
}
