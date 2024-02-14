import { Aspect } from './Aspect';

/**
 * aspectHistogramContainer
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.ebay.com/marketplace/search/v1/services`
 */
export interface AspectHistogramContainer {
	/** aspect[] */
	aspect?: Aspect[];
	/** xs:string */
	delimiter?: string;
	/** xs:token */
	domainDisplayName?: string;
	/** xs:string */
	domainName?: string;
}
