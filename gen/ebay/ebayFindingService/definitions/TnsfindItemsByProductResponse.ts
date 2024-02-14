import { AspectHistogramContainer } from './AspectHistogramContainer';
import { ConditionHistogramContainer } from './ConditionHistogramContainer';
import { ErrorMessage } from './ErrorMessage';
import { Extension } from './Extension';
import { PaginationOutput } from './PaginationOutput';
import { SearchResult } from './SearchResult';

/** tns:FindItemsByProductResponse */
export interface TnsfindItemsByProductResponse {
	/** AckValue|xs:string|Success,Failure,Warning,PartialFailure */
	ack?: string;
	/** aspectHistogramContainer */
	aspectHistogramContainer?: AspectHistogramContainer;
	/** conditionHistogramContainer */
	conditionHistogramContainer?: ConditionHistogramContainer;
	/** errorMessage */
	errorMessage?: ErrorMessage;
	/** extension[] */
	extension?: Extension[];
	/** xs:anyURI */
	itemSearchURL?: string;
	/** paginationOutput */
	paginationOutput?: PaginationOutput;
	/** searchResult */
	searchResult?: SearchResult;
	/** xs:dateTime */
	timestamp?: string;
	/** xs:string */
	version?: string;
}