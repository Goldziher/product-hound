import { ErrorMessage } from './ErrorMessage';

/** tns:GetVersionResponse */
export interface TnsgetVersionResponse {
	/** AckValue|xs:string|Success,Failure,Warning,PartialFailure */
	ack?: string;
	/** errorMessage */
	errorMessage?: ErrorMessage;
	/** xs:dateTime */
	timestamp?: string;
	/** xs:string */
	version?: string;
}
