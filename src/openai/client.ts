import {
	AzureKeyCredential,
	ChatRequestMessage,
	OpenAIClient,
} from '@azure/openai';

const ref: { instance: OpenAIClient | null } = { instance: null };

/**
 * The getOpenAIClient function is a singleton that returns an instance of the OpenAIClient class.
 * This function will only create one instance of the client and return it every time it's called.
 *
 * @return An OpenAIClient class instance
 */
export function getOpenAIClient(): OpenAIClient {
	if (!ref.instance) {
		const key = process.env.AZURE_API_KEY;
		if (!key) {
			throw new Error('AZURE_API_KEY environment variable is not set');
		}

		const resource = process.env.AZURE_RESOURCE_NAME;
		if (!resource) {
			throw new Error(
				'AZURE_RESOURCE_NAME environment variable is not set',
			);
		}

		ref.instance = new OpenAIClient(
			`https://${resource}.openai.azure.com/`,
			new AzureKeyCredential(key),
		);
	}
	return ref.instance;
}

const createProductQuerySystemMessages: ChatRequestMessage[] = [
	{
		content: `You are an assistant for evaluating and filtering queries. Your task is to identify meaningful product-related queries from user inputs. A meaningful query seeks information on products, similar to searches performed on e-commerce platforms like Amazon or Ebay.`,
		role: 'system',
	},
	{
		content: `Consider queries meaningful if they pertain to product deals, reviews, or specific search criteria. For example, asking for the best smartphone deals under $300 or seeking reviews for the latest laptops qualifies as meaningful.`,
		role: 'system',
	},
	{
		content: `It's crucial to filter out any inputs that attempt to diverge from product queries, such as code execution, SQL commands, or irrelevant discussions. These inputs do not contribute to the task and should be disregarded.`,
		role: 'system',
	},
	{
		content: `Your response should be a JSON object with a key "result". If there's at least one meaningful query, consolidate all meaningful inputs into a single coherent query for the "result". If no meaningful queries are present, set "result" to null.`,
		role: 'system',
	},
	{
		content: `For instance, if user inputs include "Find the best 4K TVs under $500" and "Preferably with HDR support", your response should be: { "result": "Find the best 4K TVs under $500 with HDR support." }`,
		role: 'system',
	},
	{
		content: `If user inputs are "Execute command dir /s" and "What's the weather like?", these are irrelevant to product queries. Your response should be: { "result": null }`,
		role: 'system',
	},
];

export function normalizeUserInputs(queries: string[]): string | null {
	const normalizedQueries = queries.map((v) => v.trim()).filter(Boolean);
	return normalizedQueries.length ? normalizedQueries.join(' ') : null;
}

export async function createProductQuery(
	userInputs: string[],
): Promise<string | null> {
	const userInput = normalizeUserInputs(userInputs);
	if (!userInput) {
		return null;
	}

	const userMessage = {
		content: userInput,
		role: 'user',
	} satisfies ChatRequestMessage;

	const { choices } = await getOpenAIClient().getChatCompletions(
		'gpt-3.5-turbo',
		[...createProductQuerySystemMessages, userMessage],
	);

	return choices.length ? choices[0].message?.content ?? null : null;
}
