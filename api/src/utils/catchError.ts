export type TryCatchResult<T> =
	| [error: Error, result: null]
	| [error: null, result: T];

export async function catchError<T>(
	promise: Promise<T>,
): Promise<TryCatchResult<T>> {
	try {
		const result = await promise;
		return [null, result];
	} catch (err: unknown) {
		const error = err instanceof Error ? err : new Error(String(err));
		return [error, null];
	}
}
