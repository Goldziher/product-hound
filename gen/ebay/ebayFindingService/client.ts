import {
	Client as SoapClient,
	createClientAsync as soapCreateClientAsync,
} from 'soap';

import { TnsfindCompletedItemsRequest } from './definitions/TnsfindCompletedItemsRequest';
import { TnsfindCompletedItemsResponse } from './definitions/TnsfindCompletedItemsResponse';
import { TnsfindItemsAdvancedRequest } from './definitions/TnsfindItemsAdvancedRequest';
import { TnsfindItemsAdvancedResponse } from './definitions/TnsfindItemsAdvancedResponse';
import { TnsfindItemsByCategoryRequest } from './definitions/TnsfindItemsByCategoryRequest';
import { TnsfindItemsByCategoryResponse } from './definitions/TnsfindItemsByCategoryResponse';
import { TnsfindItemsByKeywordsRequest } from './definitions/TnsfindItemsByKeywordsRequest';
import { TnsfindItemsByKeywordsResponse } from './definitions/TnsfindItemsByKeywordsResponse';
import { TnsfindItemsByProductRequest } from './definitions/TnsfindItemsByProductRequest';
import { TnsfindItemsByProductResponse } from './definitions/TnsfindItemsByProductResponse';
import { TnsfindItemsIneBayStoresRequest } from './definitions/TnsfindItemsIneBayStoresRequest';
import { TnsfindItemsIneBayStoresResponse } from './definitions/TnsfindItemsIneBayStoresResponse';
import { TnsgetHistogramsRequest } from './definitions/TnsgetHistogramsRequest';
import { TnsgetHistogramsResponse } from './definitions/TnsgetHistogramsResponse';
import { TnsgetSearchKeywordsRecommendationRequest } from './definitions/TnsgetSearchKeywordsRecommendationRequest';
import { TnsgetSearchKeywordsRecommendationResponse } from './definitions/TnsgetSearchKeywordsRecommendationResponse';
import { TnsgetVersionRequest } from './definitions/TnsgetVersionRequest';
import { TnsgetVersionResponse } from './definitions/TnsgetVersionResponse';
import { FindingService } from './services/FindingService';

export interface EbayFindingServiceClient extends SoapClient {
	FindingService: FindingService;
	findCompletedItemsAsync(
		findCompletedItemsRequest: TnsfindCompletedItemsRequest,
	): Promise<
		[
			result: TnsfindCompletedItemsResponse,
			rawResponse: any,
			soapHeader: any,
			rawRequest: any,
		]
	>;
	findItemsAdvancedAsync(
		findItemsAdvancedRequest: TnsfindItemsAdvancedRequest,
	): Promise<
		[
			result: TnsfindItemsAdvancedResponse,
			rawResponse: any,
			soapHeader: any,
			rawRequest: any,
		]
	>;
	findItemsByCategoryAsync(
		findItemsByCategoryRequest: TnsfindItemsByCategoryRequest,
	): Promise<
		[
			result: TnsfindItemsByCategoryResponse,
			rawResponse: any,
			soapHeader: any,
			rawRequest: any,
		]
	>;
	findItemsByKeywordsAsync(
		findItemsByKeywordsRequest: TnsfindItemsByKeywordsRequest,
	): Promise<
		[
			result: TnsfindItemsByKeywordsResponse,
			rawResponse: any,
			soapHeader: any,
			rawRequest: any,
		]
	>;
	findItemsByProductAsync(
		findItemsByProductRequest: TnsfindItemsByProductRequest,
	): Promise<
		[
			result: TnsfindItemsByProductResponse,
			rawResponse: any,
			soapHeader: any,
			rawRequest: any,
		]
	>;
	findItemsIneBayStoresAsync(
		findItemsIneBayStoresRequest: TnsfindItemsIneBayStoresRequest,
	): Promise<
		[
			result: TnsfindItemsIneBayStoresResponse,
			rawResponse: any,
			soapHeader: any,
			rawRequest: any,
		]
	>;
	getHistogramsAsync(
		getHistogramsRequest: TnsgetHistogramsRequest,
	): Promise<
		[
			result: TnsgetHistogramsResponse,
			rawResponse: any,
			soapHeader: any,
			rawRequest: any,
		]
	>;
	getSearchKeywordsRecommendationAsync(
		getSearchKeywordsRecommendationRequest: TnsgetSearchKeywordsRecommendationRequest,
	): Promise<
		[
			result: TnsgetSearchKeywordsRecommendationResponse,
			rawResponse: any,
			soapHeader: any,
			rawRequest: any,
		]
	>;
	getVersionAsync(
		getVersionRequest: TnsgetVersionRequest,
	): Promise<
		[
			result: TnsgetVersionResponse,
			rawResponse: any,
			soapHeader: any,
			rawRequest: any,
		]
	>;
}

/** Create EbayFindingServiceClient */
export function createClientAsync(
	...args: Parameters<typeof soapCreateClientAsync>
): Promise<EbayFindingServiceClient> {
	return soapCreateClientAsync(args[0], args[1], args[2]) as any;
}
