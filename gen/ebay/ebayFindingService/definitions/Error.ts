/**
 * error
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.ebay.com/marketplace/search/v1/services`
 */
export interface Error {
	/** ErrorCategory|xs:string|System,Application,Request */
	category?: string;
	/** xs:string */
	domain?: string;
	/** xs:long */
	errorId?: string;
	/** xs:token */
	exceptionId?: string;
	/** xs:string */
	message?: string;
	/** xs:string */
	parameter?: string[];
	/** ErrorSeverity|xs:string|Error,Warning */
	severity?: string;
	/** xs:string */
	subdomain?: string;
}
