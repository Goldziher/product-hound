/**
 * itemFilter
 * @targetNSAlias `tns`
 * @targetNamespace `http://www.ebay.com/marketplace/search/v1/services`
 */
export interface ItemFilter {
	/** xs:string */
	delimiter?: string;
	/** ItemFilterType|xs:string|Condition,Currency,EndTimeFrom,ModTimeFrom,EndTimeTo,ExcludeAutoPay,BestOfferOnly,FeaturedOnly,FeedbackScoreMax,FeedbackScoreMin,FreeShippingOnly,GetItFastOnly,HideDuplicateItems,AvailableTo,LocatedIn,LocalPickupOnly,LocalSearchOnly,ListingType,LotsOnly,MaxBids,MinBids,MaxPrice,MinPrice,PaymentMethod,MaxQuantity,MinQuantity,Seller,ExcludeSeller,ExcludeCategory,WorldOfGoodOnly,MaxDistance,SellerBusinessType,TopRatedSellerOnly,SoldItemsOnly,CharityOnly,ListedIn,ExpeditedShippingType,MaxHandlingTime,ReturnsAcceptedOnly,ValueBoxInventory,OutletSellerOnly,AuthorizedSellerOnly,StartTimeFrom,StartTimeTo */
	name?: string;
	/** xs:token */
	paramName?: string;
	/** xs:string */
	paramValue?: string;
	/** xs:string */
	value?: string[];
}
