import type {
	ChatCompletionsFunctionToolDefinition,
	ChatRequestMessage,
} from '@azure/openai';

import { getOpenAIClient } from '@/openai/client.js';
import { ModelDeployments } from '@/openai/enums.js';
import { NormalizedProductData, ProductRecommendation } from '@/types.js';
import { UnknownError } from '@/utils/errors.js';

/*
 * OpenAI tool definitions
 *
 * see: https://platform.openai.com/docs/guides/function-calling
 * */
const tools: ChatCompletionsFunctionToolDefinition[] = [
	{
		function: {
			description: 'sends product recommendations to the user',
			name: 'sendProductRecommendation',
			parameters: {
				properties: {
					recommendations: {
						description:
							'An array of objects containing product recommendations',
						items: {
							additionalProperties: false,
							properties: {
								id: {
									description:
										'The unique identifier for the product',
									type: 'string',
								},
								recommendation: {
									description:
										'A short, natural language recommendation explaining why the product is a good fit',
									type: 'string',
								},
							},
							required: ['id', 'recommendation'],
							type: 'object',
						},
						title: 'ProductRecommendations',
						type: 'array',
					},
				},
				required: ['recommendations'],
				type: 'object',
			},
		},
		type: 'function',
	},
];

const productDataSchema = {
	$schema: 'http://json-schema.org/draft-07/schema#',
	description: 'Schema definition for normalized product data',
	properties: {
		categories: {
			description: 'List of categories the product belongs to',
			items: {
				type: 'string',
			},
			type: 'array',
		},
		condition: {
			description: 'Condition of the product',
			type: 'string',
		},
		currency: {
			description: 'Currency code for the product price',
			type: 'string',
		},
		id: {
			description: 'Unique identifier for the product',
			type: 'string',
		},
		price: {
			description: 'Price of the product, represented as a number string',
			type: 'string',
		},
		shortDescription: {
			description:
				'A short description of the product. Optional - this value is sometimes an empty string.',
			type: 'string',
		},
		title: {
			description: 'Title of the product',
			type: 'string',
		},
		url: {
			description: 'URL to the product page',
			type: 'string',
		},
	},
	required: [
		'categories',
		'condition',
		'currency',
		'id',
		'price',
		'title',
		'url',
	],
	title: 'NormalizedProductData',
	type: 'object',
};

const createProductQuerySystemMessages: ChatRequestMessage[] = [
	{
		content: 'You are a helpful product recommendation assistant.',
		role: 'system',
	},
	{
		content: `You will be given an array of JSON objects, each of which adheres to the following JSON schema: ${JSON.stringify(productDataSchema)}.`,
		role: 'system',
	},
	{
		content: `Please identify and return up to 3 products that best match the user's request, using the "sendProductRecommendation" function.`,
		role: 'system',
	},
];

export async function createRecommendationQuery(
	query: string,
	productMapping: Record<string, NormalizedProductData>,
) {
	const systemProductMessage = {
		content: `This is the array of product data from which you should select: ${JSON.stringify(productMapping, null, 2)}`,
		role: 'system',
	} as ChatRequestMessage;

	const userMessage = {
		content: query,
		role: 'user',
	} satisfies ChatRequestMessage;

	const response = await getOpenAIClient().getChatCompletions(
		ModelDeployments.GPT_4,
		[
			...createProductQuerySystemMessages,
			systemProductMessage,
			userMessage,
		],
		{ tools },
	);

	if (!response.choices.length) {
		throw new UnknownError('No choices returned from OpenAI', response);
	}

	const [{ finishReason, message }] = response.choices;

	if (finishReason === 'tool_calls' && message?.toolCalls.length) {
		const [
			{
				function: { arguments: params },
			},
		] = message.toolCalls;
		const result = JSON.parse(params) as {
			recommendations: ProductRecommendation[];
		};
		return result.recommendations;
	}

	return null;
}
