export function loadEnv<T extends string = string>(key: string): T {
	const value = (process.env[key] ?? '').trim();
	if (!value) {
		throw new Error(`${key} environment variable is not set`);
	}
	return value as T;
}
