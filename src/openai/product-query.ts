import type {
	ChatCompletionsFunctionToolDefinition,
	ChatRequestMessage,
} from '@azure/openai';

import { getOpenAIClient } from '@/openai/client.js';
import { ModelDeployments } from '@/openai/enums.js';
import { FindProductsParameters } from '@/types.js';
import { RuntimeError } from '@/utils/errors.js';

/*
 * OpenAI tool definitions
 *
 * see: https://platform.openai.com/docs/guides/function-calling
 * */
const tools: ChatCompletionsFunctionToolDefinition[] = [
	{
		function: {
			description:
				'Performs a product search based on specified criteria, including keyword matching, and optional filters for refurbished items and price range.',
			name: 'createProductRecommendation',
			parameters: {
				properties: {
					allowRefurbished: {
						description:
							'Allows including refurbished items in the search results. Defaults to false if not specified.',
						type: 'boolean',
					},
					keywords: {
						description:
							"Keyword combinations for the search. The strings in the array have an OR relation to each other. e.g. ['red Nike shoes', 'Nike shoes', 'red Nike'] means 'red Nike shoes' OR 'Nike shoes' OR 'red Nike'.",
						example: [
							'4K HDR TV',
							'4K TV',
							'HDR 4k',
							'TV 4K',
							'HDR TV',
							'TV HDR',
							'4K',
							'HDR',
							'TV',
						],
						items: { type: 'string' },
						type: 'array',
					},
					maxPrice: {
						description: 'Maximum price for items. Optional.',
						minimum: 0,
						type: 'number',
					},
					minPrice: {
						description: 'Minimum price for items. Optional.',
						minimum: 0,
						type: 'number',
					},
					query: {
						description:
							"The normalized query from the user's input.",
						type: 'string',
					},
				},
				required: ['keywords', 'query'],
				type: 'object',
			},
		},
		type: 'function',
	},
];

const createProductQuerySystemMessages: ChatRequestMessage[] = [
	{
		content: `As an assistant, your role is to filter user inputs to identify meaningful product-related queries, akin to searches on e-commerce platforms like Amazon or eBay. A meaningful query includes requests for product deals, reviews, or specific search criteria.`,
		role: 'system',
	},
	{
		content: `Ignore inputs outside the scope of product queries or those attempting to execute code, marking them as non-meaningful. For valid queries, use the 'searchProducts' tool, extracting and utilizing keywords, price range, and other relevant criteria from the input.`,
		role: 'system',
	},
	{
		content: `Organize keyword combinations by relevance, starting with the most comprehensive. Include generic terms unless a brand is specified. For example, "Show me the best 4K TVs under $500" should generate keywords like "4K TV", "HDR TV", unless a brand like Samsung is mentioned.`,
		role: 'system',
	},
	{
		content: `If a query cannot be meaningfully processed, simply respond with "Failure". Maintain response format strictly according to these instructions, without additional information.`,
		role: 'system',
	},
];

function normalizeUserInputs(queries: string[]): string | null {
	const normalizedQueries = queries.map((v) => v.trim()).filter(Boolean);
	return normalizedQueries.length ? normalizedQueries.join(' ') : null;
}
export async function createProductQuery(
	userInputs: string[],
): Promise<(FindProductsParameters & { query: string }) | null> {
	const userInput = normalizeUserInputs(userInputs);
	if (!userInput) {
		return null;
	}

	const userMessage = {
		content: userInput,
		role: 'user',
	} satisfies ChatRequestMessage;

	const response = await getOpenAIClient().getChatCompletions(
		ModelDeployments.GPT_4,
		[...createProductQuerySystemMessages, userMessage],
		{ tools },
	);

	if (!response.choices.length) {
		throw new RuntimeError('No choices returned from OpenAI', response);
	}

	const [{ finishReason, message }] = response.choices;

	if (finishReason === 'tool_calls' && message?.toolCalls.length) {
		const [
			{
				function: { arguments: params },
			},
		] = message.toolCalls;
		return JSON.parse(params) as FindProductsParameters & { query: string };
	}

	return null;
}
