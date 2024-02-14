import { TnsfindCompletedItemsRequest } from '../definitions/TnsfindCompletedItemsRequest';
import { TnsfindCompletedItemsResponse } from '../definitions/TnsfindCompletedItemsResponse';
import { TnsfindItemsAdvancedRequest } from '../definitions/TnsfindItemsAdvancedRequest';
import { TnsfindItemsAdvancedResponse } from '../definitions/TnsfindItemsAdvancedResponse';
import { TnsfindItemsByCategoryRequest } from '../definitions/TnsfindItemsByCategoryRequest';
import { TnsfindItemsByCategoryResponse } from '../definitions/TnsfindItemsByCategoryResponse';
import { TnsfindItemsByKeywordsRequest } from '../definitions/TnsfindItemsByKeywordsRequest';
import { TnsfindItemsByKeywordsResponse } from '../definitions/TnsfindItemsByKeywordsResponse';
import { TnsfindItemsByProductRequest } from '../definitions/TnsfindItemsByProductRequest';
import { TnsfindItemsByProductResponse } from '../definitions/TnsfindItemsByProductResponse';
import { TnsfindItemsIneBayStoresRequest } from '../definitions/TnsfindItemsIneBayStoresRequest';
import { TnsfindItemsIneBayStoresResponse } from '../definitions/TnsfindItemsIneBayStoresResponse';
import { TnsgetHistogramsRequest } from '../definitions/TnsgetHistogramsRequest';
import { TnsgetHistogramsResponse } from '../definitions/TnsgetHistogramsResponse';
import { TnsgetSearchKeywordsRecommendationRequest } from '../definitions/TnsgetSearchKeywordsRecommendationRequest';
import { TnsgetSearchKeywordsRecommendationResponse } from '../definitions/TnsgetSearchKeywordsRecommendationResponse';
import { TnsgetVersionRequest } from '../definitions/TnsgetVersionRequest';
import { TnsgetVersionResponse } from '../definitions/TnsgetVersionResponse';

export interface FindingServiceSoapPort {
	findCompletedItems(
		findCompletedItemsRequest: TnsfindCompletedItemsRequest,
		callback: (
			err: any,
			result: TnsfindCompletedItemsResponse,
			rawResponse: any,
			soapHeader: any,
			rawRequest: any,
		) => void,
	): void;
	findItemsAdvanced(
		findItemsAdvancedRequest: TnsfindItemsAdvancedRequest,
		callback: (
			err: any,
			result: TnsfindItemsAdvancedResponse,
			rawResponse: any,
			soapHeader: any,
			rawRequest: any,
		) => void,
	): void;
	findItemsByCategory(
		findItemsByCategoryRequest: TnsfindItemsByCategoryRequest,
		callback: (
			err: any,
			result: TnsfindItemsByCategoryResponse,
			rawResponse: any,
			soapHeader: any,
			rawRequest: any,
		) => void,
	): void;
	findItemsByKeywords(
		findItemsByKeywordsRequest: TnsfindItemsByKeywordsRequest,
		callback: (
			err: any,
			result: TnsfindItemsByKeywordsResponse,
			rawResponse: any,
			soapHeader: any,
			rawRequest: any,
		) => void,
	): void;
	findItemsByProduct(
		findItemsByProductRequest: TnsfindItemsByProductRequest,
		callback: (
			err: any,
			result: TnsfindItemsByProductResponse,
			rawResponse: any,
			soapHeader: any,
			rawRequest: any,
		) => void,
	): void;
	findItemsIneBayStores(
		findItemsIneBayStoresRequest: TnsfindItemsIneBayStoresRequest,
		callback: (
			err: any,
			result: TnsfindItemsIneBayStoresResponse,
			rawResponse: any,
			soapHeader: any,
			rawRequest: any,
		) => void,
	): void;
	getHistograms(
		getHistogramsRequest: TnsgetHistogramsRequest,
		callback: (
			err: any,
			result: TnsgetHistogramsResponse,
			rawResponse: any,
			soapHeader: any,
			rawRequest: any,
		) => void,
	): void;
	getSearchKeywordsRecommendation(
		getSearchKeywordsRecommendationRequest: TnsgetSearchKeywordsRecommendationRequest,
		callback: (
			err: any,
			result: TnsgetSearchKeywordsRecommendationResponse,
			rawResponse: any,
			soapHeader: any,
			rawRequest: any,
		) => void,
	): void;
	getVersion(
		getVersionRequest: TnsgetVersionRequest,
		callback: (
			err: any,
			result: TnsgetVersionResponse,
			rawResponse: any,
			soapHeader: any,
			rawRequest: any,
		) => void,
	): void;
}
