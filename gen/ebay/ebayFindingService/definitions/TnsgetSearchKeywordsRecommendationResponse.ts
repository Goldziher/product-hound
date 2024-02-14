import { ErrorMessage } from './ErrorMessage';
import { Extension } from './Extension';

/** tns:GetSearchKeywordsRecommendationResponse */
export interface TnsgetSearchKeywordsRecommendationResponse {
	/** AckValue|xs:string|Success,Failure,Warning,PartialFailure */
	ack?: string;
	/** errorMessage */
	errorMessage?: ErrorMessage;
	/** extension[] */
	extension?: Extension[];
	/** xs:string */
	keywords?: string;
	/** xs:dateTime */
	timestamp?: string;
	/** xs:string */
	version?: string;
}
