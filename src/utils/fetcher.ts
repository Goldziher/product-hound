import { deepmerge } from 'deepmerge-ts';

import { HttpMethod } from '@/constants/generic.js';
import {
	ApiError,
	ConfigurationError,
	PermissionError,
} from '@/utils/errors.js';

const parseJsonSafe = (value: string): string | Record<string, any> => {
	try {
		return JSON.parse(value) as Record<string, any>;
	} catch {
		return value;
	}
};

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
	queryParams?: Record<string, string>;
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
	if (queryParams) {
		path.search = new URLSearchParams(queryParams).toString();
	}

	const response = await fetch(path, request);

	if (!response.ok) {
		if (response.status === 401 || response.status === 403) {
			throw new PermissionError(
				'user does not have permission to access this resource',
			);
		}

		throw new ApiError(
			'an unexpected error occurred while fetching the resource',
			{
				context: { path, text: parseJsonSafe(await response.text()) },
				statusCode: response.status,
				statusText: response.statusText,
			},
		);
	}

	const body =
		response.status === 204 ? {} : ((await response.json()) as unknown);

	return body as T;
}
