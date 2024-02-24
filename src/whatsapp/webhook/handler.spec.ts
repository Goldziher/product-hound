import { HttpRequest } from '@azure/functions';
import { createAzureContext } from 'testing/utils.js';

import { HttpStatus } from '@/constants/generic.js';
import { handleValidationRequest } from '@/whatsapp/webhook/handler.js';

vi.mock('@/ebay/client.js');
vi.mock('@/whatsapp/cloud-api/client.js');
vi.mock('@/analytics/client.js');

describe('Webhook handler tests', () => {
	describe('handleValidationRequest', () => {
		it('should returns 403 FORBIDDEN when the WA token is missing', () => {
			const request = new HttpRequest({
				method: 'GET',
				url: 'https://example.com',
			});
			expect(
				handleValidationRequest(request, createAzureContext()),
			).toEqual({
				status: HttpStatus.Forbidden,
			});
		});
	});
});
