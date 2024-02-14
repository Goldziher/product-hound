import { AspectHistogramContainer } from './AspectHistogramContainer';
import { CategoryHistogramContainer } from './CategoryHistogramContainer';
import { ConditionHistogramContainer } from './ConditionHistogramContainer';
import { ErrorMessage } from './ErrorMessage';
import { Extension } from './Extension';

/** tns:GetHistogramsResponse */
export interface TnsgetHistogramsResponse {
	/** AckValue|xs:string|Success,Failure,Warning,PartialFailure */
	ack?: string;
	/** aspectHistogramContainer */
	aspectHistogramContainer?: AspectHistogramContainer;
	/** categoryHistogramContainer */
	categoryHistogramContainer?: CategoryHistogramContainer;
	/** conditionHistogramContainer */
	conditionHistogramContainer?: ConditionHistogramContainer;
	/** errorMessage */
	errorMessage?: ErrorMessage;
	/** extension[] */
	extension?: Extension[];
	/** xs:dateTime */
	timestamp?: string;
	/** xs:string */
	version?: string;
}
