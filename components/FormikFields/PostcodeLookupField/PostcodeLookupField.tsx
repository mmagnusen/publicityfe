import {
	type FocusEvent,
	type FormEvent,
	type InputHTMLAttributes,
	type Ref,
	useCallback,
	useEffect,
	useState,
} from "react";
import { useFormikContext } from "formik";

import AutoSuggest, { type AutoSuggestProps } from "@components/AutoSuggest";
import Input from "@components/Input";
import {
	fetchPostcodeAutocomplete,
	fetchPostcodeLocation,
	isValidPartialUkPostcodeForAutocomplete,
	POSTCODE_AUTOCOMPLETE_DEBOUNCE_MS,
} from "@util/postcodesIo";

import { postcodeLookupVariants, postcodeSummaryVariants } from "./style";

const POSTCODE_HELPER_TEXT = "Select a postcode from the list";

type LocationFormSlice = {
	area: string;
	postcode: string;
	city: string;
	latitude: number | null;
	longitude: number | null;
};

type Props = {
	strLabel?: string;
};

const PostcodeLookupField = ({ strLabel = "Postcode" }: Props) => {
	const {
		values,
		errors,
		touched,
		submitCount,
		setFieldValue,
		setTouched,
		setValues,
		validateForm,
	} = useFormikContext<LocationFormSlice>();

	const [searchText, setSearchText] = useState(values.postcode || "");
	const [isLoadingPick, setIsLoadingPick] = useState(false);
	const [hasAutocompleteOptions, setHasAutocompleteOptions] = useState(false);

	useEffect(() => {
		setSearchText(values.postcode || "");
	}, [values.postcode]);

	const clearLocation = useCallback(() => {
		setFieldValue("postcode", "");
		setFieldValue("area", "");
		setFieldValue("city", "");
		setFieldValue("latitude", null);
		setFieldValue("longitude", null);
	}, [setFieldValue]);

	const applyInputChange = useCallback(
		(newValue: string) => {
			setSearchText(newValue);
			const selected = (values.postcode || "").trim();
			if (selected && newValue.trim() !== selected) clearLocation();
		},
		[values.postcode, clearLocation],
	);

	const handleSelect = useCallback(
		async (postcode: string) => {
			setIsLoadingPick(true);
			try {
				const loc = await fetchPostcodeLocation(postcode);
				if (!loc) return;
				setSearchText(loc.postcode);
				await setValues(
					(prev) => ({
						...prev,
						postcode: loc.postcode,
						area: loc.area,
						city: loc.city,
						latitude: loc.latitude,
						longitude: loc.longitude,
					}),
					true,
				);
			} finally {
				setIsLoadingPick(false);
			}
		},
		[setValues],
	);

	const hasResolvedLocation =
		Boolean(values.postcode?.trim()) &&
		values.latitude != null &&
		values.longitude != null;

	const combinedPostcodeMessage =
		(typeof errors.postcode === "string" && errors.postcode) ||
		(typeof errors.latitude === "string" && errors.latitude) ||
		"";

	const postcodeTouched =
		Boolean(touched.postcode) || Boolean(touched.latitude);

	const postcodeError =
		!hasResolvedLocation &&
		(postcodeTouched || submitCount > 0) &&
		combinedPostcodeMessage
			? combinedPostcodeMessage
			: "";

	const showPostcodeError = Boolean(postcodeError) && !hasAutocompleteOptions;

	const shouldOfferPostcodeSuggestions = useCallback((value: string) => {
		const trimmed = value.trim();
		if (trimmed.length === 0) return false;
		return isValidPartialUkPostcodeForAutocomplete(value);
	}, []);

	const handleSuggestionsChange = useCallback((list: string[]) => {
		setHasAutocompleteOptions(list.length > 0);
	}, []);

	const handlePostcodeInputBlur = useCallback(
		(
			e: FocusEvent<HTMLInputElement>,
			inputPropsOnBlur: InputHTMLAttributes<HTMLInputElement>["onBlur"],
		) => {
			inputPropsOnBlur?.(e);
			setTouched(
				{
					...touched,
					postcode: true,
					latitude: true,
				},
				false,
			);
			window.setTimeout(() => {
				void validateForm();
			}, 0);
		},
		[setTouched, touched, validateForm],
	);

	const postcodeSuggestProps: AutoSuggestProps<string> = {
		debounceMs: POSTCODE_AUTOCOMPLETE_DEBOUNCE_MS,
		fetchSuggestions: fetchPostcodeAutocomplete,
		getSuggestionValue: (pc: string) => pc,
		onInputChange: applyInputChange,
		onSuggestionsChange: handleSuggestionsChange,
		onSuggestionSelected: (
			_e: FormEvent,
			{ suggestion }: { suggestion: string },
		) => void handleSelect(suggestion),
		placeholder: "e.g. SW9 8AA",
		renderInputComponent: (
			inputProps: InputHTMLAttributes<HTMLInputElement> & {
				ref?: Ref<HTMLInputElement>;
			},
		) => (
			<Input
				ref={inputProps.ref as Ref<HTMLInputElement>}
				bIsLoading={isLoadingPick}
				id={inputProps.id}
				nstrAutoComplete="postal-code"
				objValidation={{
					bIsValid: !postcodeError,
					strErrorMessage: showPostcodeError ? postcodeError : "",
				}}
				strHelperMessage={
					hasAutocompleteOptions ? POSTCODE_HELPER_TEXT : undefined
				}
				onBlur={(e) => handlePostcodeInputBlur(e, inputProps.onBlur)}
				onChange={inputProps.onChange}
				onFocus={inputProps.onFocus}
				onKeyDown={inputProps.onKeyDown}
				placeHolder={inputProps.placeholder ?? "e.g. SW9 8AA"}
				strLabel={strLabel}
				value={inputProps.value == null ? "" : String(inputProps.value)}
			/>
		),
		renderSuggestion: (pc: string) => <span>{pc}</span>,
		shouldFetchSuggestions: shouldOfferPostcodeSuggestions,
		shouldRenderSuggestions: shouldOfferPostcodeSuggestions,
		value: searchText,
	};

	return (
		<div className={postcodeLookupVariants()}>
			<AutoSuggest {...postcodeSuggestProps} />
			{values.postcode &&
				values.latitude != null &&
				values.longitude != null && (
					<div className={postcodeSummaryVariants()}>
						{values.area}
						{values.area && values.city ? ", " : ""}
						{values.city} · {values.postcode}
					</div>
				)}
		</div>
	);
};

export default PostcodeLookupField;
