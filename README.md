# bot

## Installation

1. Install the Azure CLI and Azure functions core tools:

    ```shell
    brew update && brew upgrade && brew cleanup || true
    brew install az
    brew tap azure/functions
    brew install azure-functions-core-tools@4
    ```

2. Install PNPM, Node 20 and the project dependencies:

    ```shell
    brew install pnpm
    brew install nvm
    nvm install 20 && nvm use 20
    pnpm install
    ```

## Local Development

1. Create a file called `local.settings.json` in the root folder of the repository, and add the following content:

    ```json
    {
    	"IsEncrypted": false,
    	"Values": {
    		"AZURE_API_KEY": "<AZURE_API_KEY>",
    		"AZURE_API_URL": "https://api.cognitive.microsoft.com/bing/v7.0/images/search",
    		"AzureWebJobsFeatureFlags": "EnableWorkerIndexing",
    		"AzureWebJobsStorage": "",

    		"EBAY_CAMPAIGN_ID": "5339042258",
    		"EBAY_ENV": "<EBAY_ENV>",
    		"EBAY_PRODUCTION_CLIENT_ID": "<EBAY_PRODUCTION_CLIENT_ID>",
    		"EBAY_PRODUCTION_CLIENT_SECRET": "<EBAY_PRODUCTION_CLIENT_SECRET>",
    		"EBAY_PRODUCTION_REDIRECT_URI": "<EBAY_PRODUCTION_REDIRECT_URI>",
    		"EBAY_SANDBOX_CLIENT_ID": "<EBAY_SANDBOX_CLIENT_ID>",
    		"EBAY_SANDBOX_CLIENT_SECRET": "<EBAY_SANDBOX_CLIENT_SECRET>",
    		"EBAY_SANDBOX_REDIRECT_URI": "<EBAY_SANDBOX_REDIRECT_URI>",
    		"FUNCTIONS_WORKER_RUNTIME": "node",
    		"NODE_ENV": "development",

    		"WHATSAPP_ACCESS_TOKEN": "<WHATSAPP_ACCESS_TOKEN>",
    		"WHATSAPP_PHONE_NUMBER_ID": "<WHATSAPP_PHONE_NUMBER_ID>"
    	}
    }
    ```

    - You will need to replace the value for `<AZURE_API_KEY>` with a value from the [Azure Portal resource page](https://portal.azure.com/#@tombasemind.onmicrosoft.com/resource/subscriptions/ed7f0a74-b478-49cd-bbc6-25f24f441e2f/resourceGroups/chatbot/providers/Microsoft.CognitiveServices/accounts/basemind-bot/overview).
    - You will need to replace the value for `<EBAY_ENV>` with either `SANDBOX` or `PRODUCTION`.
    - You will need to replace the value for `<EBAY_PRODUCTION_CLIENT_ID>` with a value from the [Ebay EPN Console](https://partner.ebay.com/secure/mediapartner/accountSettings/mp-wsapi-flow.ihtml?execution=e3s2).
    - You will need to replace the value for `<EBAY_PRODUCTION_CLIENT_SECRET>` with a value from the [Ebay EPN Console](https://partner.ebay.com/secure/mediapartner/ads/view-flexi-flow.ihtml?execution=e1s1).
    - You will need to replace the value for `<EBAY_PRODUCTION_REDIRECT_URI>` with a value from the [Ebay EPN Console](https://partner.ebay.com/secure/mediapartner/ads/view-flexi-flow.ihtml?execution=e1s1).
    - You will need to replace the value for `<EBAY_SANDBOX_CLIENT_ID>` with a value from the [Ebay EPN Console](https://partner.ebay.com/secure/mediapartner/accountSettings/mp-wsapi-flow.ihtml?execution=e3s2).
    - You will need to replace the value for `<EBAY_SANDBOX_CLIENT_SECRET>` with a value from the [Ebay EPN Console](https://partner.ebay.com/secure/mediapartner/ads/view-flexi-flow.ihtml?execution=e1s1).
    - You will need to replace the value for `<EBAY_SANDBOX_REDIRECT_URI>` with a value from the [Ebay EPN Console](https://partner.ebay.com/secure/mediapartner/ads/view-flexi-flow.ihtml?execution=e1s1).
    - You will need to replace the value for `<WHATSAPP_ACCESS_TOKEN>` with a value from the [Whatsapp Console](https://developers.facebook.com/apps/1298514190843491/whatsapp-business/wa-dev-console/?business_id=403861875376645).
    - You will need to replace the value for `<WHATSAPP_PHONE_NUMBER_ID>` with a value from the [Whatsapp Console](https://developers.facebook.com/apps/1298514190843491/whatsapp-business/wa-dev-console/?business_id=403861875376645).

    Note: the WhatsApp token is a temporary token that needs to be regenerated every 24 hours.

2. Make sure to use Node 20 (not 21+)! For example, use [NVM](https://github.com/nvm-sh/nvm) and do the following:

    ```shell
    brew install nvm
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

4. Send requests to the function, for example:

    ```shell
    curl -i -X POST http://localhost:7071/api/basemind-whatsapp-webhook -H 'Content-Type: application/json' -d '["please find me a new iphone mini"]'
    ```

## Deployment

Deployment occurs through GitHub actions on push to the main branch. You can still deploy locally though, by doing the following:

1. Login to Azure

    ```shell
    az login
    ```

2. Deploy the function to Azure

    ```shell
    func azure functionapp publish basemind-whatsapp-webhook
    ```

    Note: you will need to have the correct permissions to deploy to the Azure subscription.

You can also deploy AND sync your local settings to the cloud at the same time by doing the following:

```shell
func azure functionapp publish basemind-whatsapp-webhook --publish-local-settings
```

### Syncing Local Settings

To set the environment variables in the cloud to match those used locally, simply do the following:

```shell
func azure functionapp publish basemind-whatsapp-webhook --publish-settings-only
```
