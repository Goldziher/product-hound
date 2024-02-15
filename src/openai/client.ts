import { AzureKeyCredential, OpenAIClient } from '@azure/openai';

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

		ref.instance = new OpenAIClient(
			`https://basemind-ai-us-west.openai.azure.com/`,
			new AzureKeyCredential(key),
			{
				// TODO: update this as required to the latest version
				// see: https://learn.microsoft.com/en-us/azure/ai-services/openai/reference
				apiVersion: '2024-02-15-preview',
			},
		);
	}
	return ref.instance;
}
