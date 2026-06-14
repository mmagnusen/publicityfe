import { useCallback, useEffect, useMemo, useState } from "react";
import ReactAutosuggest from "react-autosuggest";

import { debounce } from "lodash";

import { cn } from "@/lib/cn";
import { autoSuggestContainerVariants } from "./style";

export type AutoSuggestProps<T> = {
	className?: string;
	debounceMs?: number;
	defaultValue?: string;
	fetchSuggestions: (query: string) => Promise<T[]>;
	getSuggestionValue: (suggestion: T) => string;
	onInputChange?: (newValue: string) => void;
	onSuggestionSelected?: (
		event: React.FormEvent,
		data: { suggestion: T; suggestionValue: string; method: string },
	) => void;
	placeholder?: string;
	renderInputComponent?: (
		inputProps: React.InputHTMLAttributes<HTMLInputElement> & {
			ref?: React.Ref<HTMLInputElement>;
		},
	) => React.ReactNode;
	renderSuggestion: (suggestion: T) => React.ReactNode;
	shouldFetchSuggestions?: (query: string) => boolean;
	shouldRenderSuggestions?: (value: string) => boolean;
	onSuggestionsChange?: (suggestions: T[]) => void;
	value?: string;
};

const AutoSuggest = <T,>({
	className,
	debounceMs = 0,
	defaultValue = "",
	fetchSuggestions,
	getSuggestionValue,
	onInputChange,
	onSuggestionSelected,
	placeholder = "Search...",
	renderInputComponent,
	renderSuggestion,
	shouldFetchSuggestions = () => true,
	shouldRenderSuggestions = (v) => v.trim().length > 0,
	onSuggestionsChange,
	value: controlledValue,
}: AutoSuggestProps<T>) => {
	const [internalValue, setInternalValue] = useState(defaultValue);
	const isControlled = controlledValue !== undefined;
	const inputValue = isControlled ? controlledValue : internalValue;
	const [suggestions, setSuggestions] = useState<T[]>([]);

	const runFetch = useCallback(
		async (query: string) => {
			if (!shouldFetchSuggestions(query)) {
				setSuggestions([]);
				onSuggestionsChange?.([]);
				return;
			}
			try {
				const list = await fetchSuggestions(query);
				setSuggestions(list);
				onSuggestionsChange?.(list);
			} catch {
				setSuggestions([]);
				onSuggestionsChange?.([]);
			}
		},
		[fetchSuggestions, onSuggestionsChange, shouldFetchSuggestions],
	);

	const debouncedFetch = useMemo(() => {
		if (debounceMs <= 0) return null;
		return debounce((q: string) => void runFetch(q), debounceMs);
	}, [debounceMs, runFetch]);

	useEffect(() => {
		return () => {
			if (debouncedFetch) debouncedFetch.cancel();
		};
	}, [debouncedFetch]);

	const onSuggestionsFetchRequested = useCallback(
		({ value }: { value: string }) => {
			if (debounceMs <= 0) {
				void runFetch(value);
			} else if (debouncedFetch) {
				debouncedFetch(value);
			}
		},
		[debounceMs, debouncedFetch, runFetch],
	);

	const onSuggestionsClearRequested = useCallback(() => {
		setSuggestions([]);
		onSuggestionsChange?.([]);
	}, [onSuggestionsChange]);

	const handleSuggestionSelected = useCallback(
		(
			event: React.FormEvent,
			data: { suggestion: T; suggestionValue: string; method: string },
		) => {
			if (debouncedFetch) debouncedFetch.cancel();
			setSuggestions([]);
			onSuggestionsChange?.([]);
			onSuggestionSelected?.(event, data);
		},
		[debouncedFetch, onSuggestionsChange, onSuggestionSelected],
	);

	const handleChange = useCallback(
		(_event: React.FormEvent, data: { newValue: string; method: string }) => {
			if (!isControlled) setInternalValue(data.newValue);
			onInputChange?.(data.newValue);
		},
		[isControlled, onInputChange],
	);

	const mergedInputProps = {
		value: inputValue,
		onChange: handleChange,
		placeholder,
	};

	return (
		<div className={cn(autoSuggestContainerVariants(), className)}>
			<ReactAutosuggest
				focusInputOnSuggestionClick
				getSuggestionValue={getSuggestionValue}
				inputProps={mergedInputProps}
				onSuggestionSelected={handleSuggestionSelected}
				onSuggestionsClearRequested={onSuggestionsClearRequested}
				onSuggestionsFetchRequested={onSuggestionsFetchRequested}
				renderInputComponent={renderInputComponent}
				renderSuggestion={renderSuggestion}
				shouldRenderSuggestions={shouldRenderSuggestions}
				suggestions={suggestions}
			/>
		</div>
	);
};

export default AutoSuggest;
