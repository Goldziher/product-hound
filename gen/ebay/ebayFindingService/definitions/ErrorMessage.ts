import { Error } from './Error';

/**
 * errorMessage
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.ebay.com/marketplace/search/v1/services`
 */
export interface ErrorMessage {
	/** error[] */
	error?: Error[];
}
