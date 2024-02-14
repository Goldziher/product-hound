import { deepmerge } from 'deepmerge-ts';

import { HttpMethod } from '@/constants/generic.js';
import {
	ApiError,
	ConfigurationError,
	PermissionError,
} from '@/utils/errors.js';

export async function fetcher<T>({
	url,
	method,
	data,
	queryParams,
	headers,
	...rest
}: {
	data?: Record<string, any> | any[] | string | number;
	headers?: Record<string, string | undefined>;
	method: HttpMethod;
	queryParams?: Record<string, string | undefined>;
	url: string;
} & Omit<RequestInit, 'method' | 'body'>): Promise<T> {
	if (!Object.values(HttpMethod).includes(method)) {
		throw new ConfigurationError(`invalid HTTP method ${method}`);
	}

	const request = deepmerge(rest, {
		body: data ? JSON.stringify(data) : undefined,
		headers: {
			'Content-Type': 'application/json',
			...headers,
		},
		method,
	}) satisfies RequestInit;

	const path = new URL(url);
	const searchParams = new URLSearchParams();

	for (const [key, value] of Object.entries(queryParams ?? {})) {
		searchParams.set(key, value ?? '');
	}
	path.search = searchParams.toString();

	const response = await fetch(path, request);
	const body =
		response.status === 204 ? {} : ((await response.json()) as unknown);

	if (!response.ok) {
		if (response.status === 401 || response.status === 403) {
			throw new PermissionError(
				'user does not have permission to access this resource',
			);
		}

		throw new ApiError(
			Reflect.get(body as Record<string, any>, 'message') ??
				JSON.stringify(body),
			{
				context: { path, text: await response.text() },
				statusCode: response.status,
				statusText: response.statusText,
			},
		);
	}

	return body as T;
}
