import { CategoryHistogram } from './CategoryHistogram';

/**
 * categoryHistogramContainer
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.ebay.com/marketplace/search/v1/services`
 */
export interface CategoryHistogramContainer {
	/** categoryHistogram[] */
	categoryHistogram?: CategoryHistogram[];
	/** xs:string */
	delimiter?: string;
}
