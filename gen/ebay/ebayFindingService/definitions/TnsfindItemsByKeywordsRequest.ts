import { Affiliate } from './Affiliate';
import { AspectFilter } from './AspectFilter';
import { DomainFilter } from './DomainFilter';
import { ItemFilter } from './ItemFilter';
import { PaginationInput } from './PaginationInput';

/** tns:FindItemsByKeywordsRequest */
export interface TnsfindItemsByKeywordsRequest {
	/** affiliate */
	affiliate?: Affiliate;
	/** aspectFilter[] */
	aspectFilter?: AspectFilter[];
	/** xs:string */
	buyerPostalCode?: string;
	/** domainFilter[] */
	domainFilter?: DomainFilter[];
	/** itemFilter[] */
	itemFilter?: ItemFilter[];
	/** xs:string */
	keywords?: string;
	/** OutputSelectorType|xs:string|SellerInfo,StoreInfo,CategoryHistogram,AspectHistogram,ConditionHistogram,GalleryInfo,PictureURLSuperSize,PictureURLLarge,UnitPriceInfo */
	outputSelector?: string[];
	/** paginationInput */
	paginationInput?: PaginationInput;
	/** SortOrderType|xs:string|BestMatch,CurrentPriceHighest,DistanceNearest,EndTimeSoonest,PricePlusShippingLowest,PricePlusShippingHighest,StartTimeNewest,BidCountMost,BidCountFewest,CountryAscending,CountryDescending,WatchCountDecreaseSort */
	sortOrder?: string;
}