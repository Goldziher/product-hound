# bot

## Installation

1. Install the azure functions core tools:

    ```shell
    brew tap azure/functions
    brew install azure-functions-core-tools@4
    ```

2. Install project dependencies:

    ```shell
    pnpm install
    ```

## Local Development

1. Create a file called `local.settings.json` in the root folder of the repository, and add the following content:

    ```json
    {
    	"IsEncrypted": false,
    	"Values": {
    		"AZURE_API_KEY": "<API_KEY>",
    		"AzureWebJobsFeatureFlags": "EnableWorkerIndexing",
    		"AzureWebJobsStorage": "",
    		"FUNCTIONS_WORKER_RUNTIME": "node"
    	}
    }
    ```

    You will need to replace the value for `<API_KEY>` with a value from the [Azure Portal resource page](https://portal.azure.com/#@tombasemind.onmicrosoft.com/resource/subscriptions/ed7f0a74-b478-49cd-bbc6-25f24f441e2f/resourceGroups/chatbot/providers/Microsoft.CognitiveServices/accounts/basemind-bot/overview).

2. Make sure to use Node 20 (not 21+)! For example, use [NVM](https://github.com/nvm-sh/nvm) and do the following:

    ```shell
    nvm install 20
    nvm use 20
    ```

    Note- you can make v20 the default with `nvm alias default 20`, so you will not need to repeat this.

3. Start the local development server:

    ```shell
    pnpm watch
    ```

    Optionally if for some reason you do not want to run in watch mode, do:

    ```shell
     pnpm build
     pnpm start
    ```
