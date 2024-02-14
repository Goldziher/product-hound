import { ValueHistogram } from './ValueHistogram';

/**
 * aspect
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.ebay.com/marketplace/search/v1/services`
 */
export interface Aspect {
	/** xs:string */
	delimiter?: string;
	/** valueHistogram[] */
	valueHistogram?: ValueHistogram[];
}
