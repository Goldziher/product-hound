# Product Hound

This repository includes the first iteration of a product recommendation chatbot. 

Stack:

- Whatsapp for the user facing functionality.
- Azure functions for the backend components
- OpenAI for the chatbot functionalities.

The code is written in TypeScript. 

## Installation

1. Install the Azure CLI and Azure functions core tools:

    ```shell
    brew update && brew upgrade && brew cleanup || true
    brew install az
    brew tap azure/functions
    brew install azure-functions-core-tools@4
    ```

2. Install Node 20 and the project dependencies:

    ```shell
    brew install nvm
    nvm install 20 && nvm use 20
    npm install
    ```

## Local Development

1. Create a file called `local.settings.json` in the root folder of the repository, and add the env variables and secrets - you need to request these from another developer.

2. Make sure to use Node 20 (not 21+)! For example, use [NVM](https://github.com/nvm-sh/nvm) and do the following:

    ```shell
    brew install nvm
    nvm install 20
    nvm use 20
    ```

    Note- you can make v20 the default with `nvm alias default 20`, so you will not need to repeat this.

3. Start the local development server:

    ```shell
    npm run watch
    ```

    Optionally if for some reason you do not want to run in watch mode, do:

    ```shell
     npm run build
     npm run start
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
