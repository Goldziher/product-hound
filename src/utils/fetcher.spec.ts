import { mockFetch } from 'testing/mocks.js';

import { HttpMethod } from '@/constants/generic.js';
import {
	ApiError,
	ConfigurationError,
	PermissionError,
} from '@/utils/errors.js';
import { fetcher } from '@/utils/fetcher.js';

describe('fetcher tests', () => {
	it('handles a success response correctly', async () => {
		const mockResponse = { data: 'success' };
		mockFetch.mockResolvedValueOnce({
			json: () => Promise.resolve(mockResponse),
			ok: true,
			status: 200,
		});

		const result = await fetcher({
			method: HttpMethod.Get,
			url: 'http://www.test.com',
		});

		expect(mockFetch).toHaveBeenCalledWith(new URL('http://www.test.com'), {
			headers: {
				'Content-Type': 'application/json',
			},
			method: HttpMethod.Get,
		});
		expect(result).toEqual(mockResponse);
	});

	it('handles an empty response', async () => {
		mockFetch.mockResolvedValueOnce({
			ok: true,
			status: 204,
		});

		const result = await fetcher({
			method: HttpMethod.Get,
			url: 'http://www.test.com',
		});

		expect(mockFetch).toHaveBeenCalledWith(new URL('http://www.test.com'), {
			headers: {
				'Content-Type': 'application/json',
			},
			method: HttpMethod.Get,
		});
		expect(result).toEqual({});
	});

	it('handles an invalid HTTP method', async () => {
		await expect(
			// @ts-expect-error
			fetcher({ method: 'INVALID', url: 'http://www.test.com' }),
		).rejects.toThrow(ConfigurationError);
	});

	it('handles a non-200 range status code', async () => {
		const mockResponse = { message: 'error' };
		mockFetch.mockResolvedValueOnce({
			json: () => Promise.resolve(mockResponse),
			ok: false,
			status: 400,
			statusText: 'Bad Request',
			text: () => Promise.resolve('error'),
		});

		await expect(
			fetcher({ method: HttpMethod.Get, url: 'http://www.test.com' }),
		).rejects.toThrow(ApiError);

		expect(mockFetch).toHaveBeenCalledWith(new URL('http://www.test.com'), {
			headers: {
				'Content-Type': 'application/json',
			},
			method: HttpMethod.Get,
		});
	});

	it('handles a non-200 range status code that does not include message', async () => {
		const mockResponse = {};
		mockFetch.mockResolvedValueOnce({
			json: () => Promise.resolve(mockResponse),
			ok: false,
			status: 500,
			statusText: 'Internal Server Error',
			text: () => Promise.resolve('error'),
		});

		await expect(
			fetcher({ method: HttpMethod.Get, url: 'http://www.test.com' }),
		).rejects.toThrow(ApiError);

		expect(mockFetch).toHaveBeenCalledWith(new URL('http://www.test.com'), {
			headers: {
				'Content-Type': 'application/json',
			},
			method: HttpMethod.Get,
		});
	});

	it.each([401, 403])('handles a %d', async (status: number) => {
		const mockResponse = {};
		mockFetch.mockResolvedValueOnce({
			json: () => Promise.resolve(mockResponse),
			ok: false,
			status,
			statusText: 'Permission Denied',
			text: () => Promise.resolve('error'),
		});

		await expect(
			fetcher({ method: HttpMethod.Get, url: 'http://www.test.com' }),
		).rejects.toThrow(PermissionError);
	});

	it('handles custom headers', async () => {
		mockFetch.mockResolvedValueOnce({
			json: () => Promise.resolve({}),
			ok: true,
			status: 200,
		});

		await fetcher({
			headers: { 'X-Test': 'test' },
			method: HttpMethod.Get,
			url: 'http://www.test.com',
		});

		expect(mockFetch).toHaveBeenCalledWith(new URL('http://www.test.com'), {
			headers: {
				'Content-Type': 'application/json',
				'X-Test': 'test',
			},
			method: HttpMethod.Get,
		});
	});

	it('handles request with query params', async () => {
		mockFetch.mockResolvedValueOnce({
			json: () => Promise.resolve({}),
			ok: true,
			status: 200,
		});

		await fetcher({
			method: HttpMethod.Get,
			queryParams: { foo: 'bar' },
			url: 'http://www.test.com',
		});

		expect(mockFetch).toHaveBeenCalledWith(
			new URL('http://www.test.com?foo=bar'),
			{
				headers: {
					'Content-Type': 'application/json',
				},
				method: HttpMethod.Get,
			},
		);
	});
});
