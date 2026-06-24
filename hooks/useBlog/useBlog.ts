import useErrorReport, { REPORT_POSTHOG_ONLY } from "@hooks/useErrorReport";
import { instanceAxios } from "@util/instanceAxios";

export type DelphiBlogFormValues = {
	content: {
		characterCount: number;
		editorHTML: string;
		editorJSON: string;
		wordCount: number;
	};
	slug: string;
	excerpt: string;
	metaDescription: string;
	title: string;
};

export type DelphiBlogPost = {
	content?: string;
	created_at?: string;
	updated_at?: string;
	excerpt: string;
	meta_description: string;
	/** Short SERP title; `<title>` only- on-page H1 uses `title`. */
	meta_title?: string;
	image_alt?: string;
	pk?: number;
	slug: string;
	title: string;
	thumbnail_image_url?: string;
	featured_image_url?: string;
	related_articles?: string[];
};

export const useBlog = () => {
	const { reportError } = useErrorReport({ functionNamePrefix: "useBlog" });

	const funcCreateBlogPost = async ({
		title,
		content,
		slug,
		excerpt,
		metaDescription,
	}: Omit<DelphiBlogPost, "meta_description"> & {
		metaDescription: string;
	}) => {
		try {
			await instanceAxios({
				method: "post",
				url: `/blog/create`,
				data: {
					title,
					content,
					slug,
					excerpt,
					meta_description: metaDescription,
				},
			});
		} catch (error: any) {
			reportError(error, "funcCreateBlogPost", REPORT_POSTHOG_ONLY);
			throw error;
		}
	};

	const funEditBlogPost = async ({
		formValues,
		pk,
	}: {
		formValues: Omit<DelphiBlogPost, "meta_description"> & {
			metaDescription: string;
		};
		pk: number;
	}) => {
		try {
			await instanceAxios({
				method: "patch",
				url: `/blog/update/${pk}`,
				data: {
					title: formValues.title,
					content: formValues.content,
					slug: formValues.slug,
					excerpt: formValues.excerpt,
					meta_description: formValues.metaDescription,
				},
			});
		} catch (error: any) {
			reportError(error, "funEditBlogPost", REPORT_POSTHOG_ONLY);
			throw error;
		}
	};

	return {
		funcCreateBlogPost,
		funEditBlogPost,
	};
};
