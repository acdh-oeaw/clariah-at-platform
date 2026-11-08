import * as v from "valibot";

declare const encodedSearchParamsBrand: unique symbol;

type SearchParamPrimitive = boolean | number | string;
type RawSearchParams = Readonly<Record<string, ReadonlyArray<string> | string | undefined>>;

export type SearchParamsInput =
	| RawSearchParams
	| URLSearchParams
	| { entries: () => IterableIterator<[string, string]> };

export interface EncodedSearchParams<Schema extends v.GenericSchema = v.GenericSchema> {
	readonly query: string;
	readonly [encodedSearchParamsBrand]: Schema;
}

export interface SearchParamsCodec<Schema extends v.GenericSchema> {
	encode: (value: v.InferOutput<Schema>) => EncodedSearchParams<Schema>;
	parse: (input: SearchParamsInput) => v.InferOutput<Schema>;
	safeParse: (input: SearchParamsInput) => v.SafeParseResult<Schema>;
	readonly schema: Schema;
}

interface SearchParamsOptions<Schema extends v.GenericSchema> {
	stringify?: (value: v.InferOutput<Schema>) => RawSearchParams;
}

function isSearchParamsIterable(value: SearchParamsInput): value is Exclude<SearchParamsInput, RawSearchParams> {
	return "entries" in value && typeof value.entries === "function";
}

function normalizeSearchParams(input: SearchParamsInput): RawSearchParams {
	if (!isSearchParamsIterable(input)) {
		return input;
	}

	const result: Record<string, Array<string> | string> = {};

	for (const [key, value] of input.entries()) {
		const existing = result[key];

		if (existing == null) {
			result[key] = value;
		} else if (Array.isArray(existing)) {
			existing.push(value);
		} else {
			result[key] = [existing, value];
		}
	}

	return result;
}

function stringifyPrimitive(value: SearchParamPrimitive): string {
	if (typeof value === "number" && !Number.isFinite(value)) {
		throw new TypeError("Search parameter numbers must be finite");
	}

	return String(value);
}

function isStringArray(value: ReadonlyArray<string> | string | undefined): value is ReadonlyArray<string> {
	return Array.isArray(value);
}

function defaultStringify(value: unknown): RawSearchParams {
	if (value == null || typeof value !== "object" || Array.isArray(value)) {
		throw new TypeError("Search parameter schema output must be an object");
	}

	const result: Record<string, Array<string> | string | undefined> = {};

	for (const [key, entry] of Object.entries(value)) {
		if (entry === undefined) {
			continue;
		}

		if (Array.isArray(entry)) {
			result[key] = entry.map((item: unknown) => {
				if (typeof item !== "boolean" && typeof item !== "number" && typeof item !== "string") {
					throw new TypeError(`Search parameter "${key}" contains a non-serializable value`);
				}

				return stringifyPrimitive(item);
			});
			continue;
		}

		if (typeof entry !== "boolean" && typeof entry !== "number" && typeof entry !== "string") {
			throw new TypeError(`Search parameter "${key}" is not serializable`);
		}

		result[key] = stringifyPrimitive(entry);
	}

	return result;
}

function toQueryString(input: RawSearchParams): string {
	const result = new URLSearchParams();

	for (const [key, value] of Object.entries(input)) {
		if (value === undefined) {
			continue;
		}

		if (isStringArray(value)) {
			for (const item of value) {
				result.append(key, item);
			}
		} else {
			result.append(key, value);
		}
	}

	return result.toString();
}

/**
 * Defines a synchronous codec for a page's raw and domain search parameters. Export the result as `searchParams` from a
 * `search-params.ts` file next to the page.
 *
 * Next represents both `?key` and `?key=` as `{ key: "" }`, and repeated empty values such as `?key=&key=` as `{ key:
 * ["", ""] }`. Empty strings are preserved when encoding. `v.optional()` only handles a missing key; it does not treat
 * an empty string as missing. Use an item-level `v.nonEmpty()` to reject empty strings. An array-level `v.nonEmpty()`
 * only rejects an empty array. `undefined` and empty arrays produce no parameter occurrences.
 *
 * Use `v.fallback()` when malformed user input should resolve to a valid default instead of making `parse()` throw or
 * `safeParse()` fail. For example, a fallback around a positive integer page schema can turn `?page=invalid` into page
 * `1`. Use this only when silently recovering from malformed input is intentional.
 */
export function defineSearchParams<const Schema extends v.GenericSchema>(
	schema: Schema,
	options: SearchParamsOptions<Schema> = {},
): SearchParamsCodec<Schema> {
	const stringify = options.stringify ?? defaultStringify;

	return {
		encode(value) {
			const parsed = v.parse(schema, stringify(value));
			const serialized = stringify(parsed);
			v.parse(schema, serialized);
			const query = toQueryString(serialized);

			return { query } as EncodedSearchParams<Schema>;
		},
		parse(input) {
			return v.parse(schema, normalizeSearchParams(input));
		},
		safeParse(input) {
			return v.safeParse(schema, normalizeSearchParams(input));
		},
		schema,
	};
}
