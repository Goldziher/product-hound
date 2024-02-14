import { Affiliate } from './Affiliate';
import { AspectFilter } from './AspectFilter';
import { DomainFilter } from './DomainFilter';
import { ItemFilter } from './ItemFilter';
import { PaginationInput } from './PaginationInput';

/** tns:FindItemsAdvancedRequest */
export interface TnsfindItemsAdvancedRequest {
	/** affiliate */
	affiliate?: Affiliate;
	/** aspectFilter[] */
	aspectFilter?: AspectFilter[];
	/** xs:string */
	buyerPostalCode?: string;
	/** xs:string */
	categoryId?: string[];
	/** xs:boolean */
	descriptionSearch?: string;
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
