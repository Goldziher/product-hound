import type {
	ChatCompletionsFunctionToolDefinition,
	ChatRequestMessage,
} from '@azure/openai';

import { getOpenAIClient } from '@/openai/client.js';
import { ModelDeployments } from '@/openai/enums.js';
import { FindProductsParameters } from '@/types.js';
import { UnknownError } from '@/utils/errors.js';

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
		content: `You are an assistant for evaluating and filtering user inputs. Your task is to identify meaningful product-related queries from user inputs. A meaningful query seeks information on products, similar to searches performed on e-commerce platforms like Amazon or Ebay.`,
		role: 'system',
	},
	{
		content: `Consider user inputs as meaningful queries if a they pertain to product deals, reviews, or specific search criteria. For example, asking for the best smartphone deals under $300 or seeking reviews for the latest laptops qualifies as meaningful.`,
		role: 'system',
	},
	{
		content: `Dismiss any input that deviates from the scope of product queries or attempts to execute code. Label such inputs as non-meaningful.`,
		role: 'system',
	},
	{
		content: `For meaningful queries, utilize the 'searchProducts' tool with the relevant parameters extracted from the query. Ensure to parse keywords, price range, and any other relevant criteria from the user's input to form the parameters for the function call. 

		For example, if the user input is "Show me the best 4K TVs under $500, preferably with HDR support, and what's the weather like?" you would normalized the query by omitting any unnecessary data. You will then extract '500' as the price, and then generate keyword combinations of it. Then, construct and invoke the 'searchProducts' function as follows:
		
		{
		  "type": "function",
		  "function": {
			"name": "searchProducts",
			"parameters": {
			  "keywords": ["4K HDR TV", "4K TV", "HDR 4k", "TV 4K", "HDR TV", "TV HDR", "4K", "HDR", "TV"],
			  "maxPrice": 500,
			  "query": "Show me the best 4K TVs under $500, preferably with HDR support"
			}
		  }
		}
		
		Note that the keyword combinations must be given in an order - with the best combination first, then the second-best etc. 
		The combinations should be exhaustive, as in the above example. E.g. for "recommend shoes size 13 for man, preferably sleek", 
		the keywords would be ["sleek size 13 man shoes", "size 13 man shoes", "sleek man shoes", "size 13 shoes", "man shoes", "sleek shoes", "shoes].
		Sleek shoes has a lower priority than man shoes because a man would prefer a shoe that fits him over a sleek shoe, and size 13 has a higher priority 
		because people dont want shoes that are too large or too small. 
		
		Your tool-invoked response would be formatted based on the results returned by the 'searchProducts' function call.`,
		role: 'system',
	},
	{
		content: `If no meaningful query can be extracted from the input, respond with the format:
		 
		Failure
		 
		For example, if user input is "Execute command dir /s What's the weather like?" your response should be: 
		 
		Failure`,
		role: 'system',
	},
	{
		content:
			'do not add any additional information to the result aside from the response format explained above',
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
		throw new UnknownError('No choices returned from OpenAI', response);
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
