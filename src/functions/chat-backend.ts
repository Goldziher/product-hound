import {
	app,
	HttpRequest,
	HttpResponseInit,
	InvocationContext,
} from '@azure/functions';

import { HttpStatus } from '@/constants/generic.js';
import { EbayClient } from '@/ebay/client.js';
import { createProductQuery } from '@/openai/product-query.js';
import { createRecommendationQuery } from '@/openai/recommendation-query.js';

const ebayClient = new EbayClient();

const isChatRequest = (value: unknown): value is string[] =>
	Array.isArray(value) && value.every((v) => typeof v === 'string');

export async function handler(
	request: HttpRequest,
	context: InvocationContext,
): Promise<HttpResponseInit> {
	const body = await request.json();

	if (isChatRequest(body)) {
		context.log('received chat request', JSON.stringify(body));

		try {
			const data = await createProductQuery(body);
			if (!data) {
				context.warn(
					'no meaningful query could be extracted from the input',
				);
				return {
					jsonBody: {
						message:
							'No meaningful query could be extracted from the input',
					},
					status: HttpStatus.BadRequest,
				};
			}

			const { query, ...productSearchParameters } = data;

			const ebayData = await ebayClient.search(
				context,
				productSearchParameters,
			);

			if (!ebayData) {
				// TODO: this is a case where no results match the search.
				// We will need to give instructions to the user - for now we simply return a placeholder.
				// Later we will send a whatsapp message.
				context.warn('no matching data found on ebay');

				return {
					jsonBody: {
						message: 'no matching data found',
					},
					status: HttpStatus.OK,
				};
			}
			context.log('ebayData', JSON.stringify(ebayData));

			const recommendations = await createRecommendationQuery(
				query,
				ebayData,
			);

			if (recommendations?.length) {
				const [{ recommendation, id }] = recommendations;

				const datum = ebayData[id];

				context.log(`sending recommendations`, JSON.stringify(datum));

				return {
					jsonBody: {
						message: `The following product looks like a great fit: "${datum.title}"
					
${recommendation}
					
${datum.url}`,
					},
					status: HttpStatus.OK,
				};
			}

			return {
				jsonBody: { message: 'no recommendations' },
				status: HttpStatus.OK,
			};
		} catch (error) {
			context.error(
				`an unexpected error occurred: ${(error as Error).message}`,
				{ stack: (error as Error).stack },
			);

			return {
				jsonBody: { message: (error as Error).message },
				status: HttpStatus.InternalServerError,
			};
		}
	}

	context.error('bad request body', JSON.stringify(body));
	return {
		jsonBody: {
			body,
			message: 'request body should be an array of strings',
		},
		status: HttpStatus.BadRequest,
	};
}

app.http('chat', {
	authLevel: 'anonymous',
	handler,
	methods: ['POST'],
});
