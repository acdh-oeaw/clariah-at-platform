/** Identifies a server error in the logs. Client errors have none, and may not even be an `Error`. */
export function getErrorDigest(error: unknown): string | null {
	if (typeof error === "object" && error != null && "digest" in error && typeof error.digest === "string") {
		return error.digest;
	}

	return null;
}
