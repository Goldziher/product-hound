import { FindingServiceSoapPort } from '../ports/FindingServiceSoapPort';

export interface FindingService {
	readonly FindingServiceSoapPort: FindingServiceSoapPort;
}
