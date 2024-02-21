export const productDataSchema = {
	$schema: 'http://json-schema.org/draft-07/schema#',
	description: 'Schema definition for normalized product data',
	properties: {
		categories: {
			description: 'List of categories the product belongs to',
			items: {
				type: 'string',
			},
			type: 'array',
		},
		condition: {
			description: 'Condition of the product',
			type: 'string',
		},
		id: {
			description: 'Unique identifier for the product',
			type: 'string',
		},
		price: {
			description: 'Price of the product, represented as a number string',
			type: 'string',
		},
		shortDescription: {
			description:
				'A short description of the product. Optional - this value is sometimes an empty string.',
			type: 'string',
		},
		title: {
			description: 'Title of the product',
			type: 'string',
		},
	},
	required: ['categories', 'condition', 'currency', 'id', 'price', 'title'],
	title: 'ProductData',
	type: 'object',
};
