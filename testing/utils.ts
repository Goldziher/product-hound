import { InvocationContext } from '@azure/functions';

export function createAzureContext(
	opts?: Partial<InvocationContext>,
): InvocationContext {
	return {
		debug: vi.fn(),
		error: vi.fn(),
		functionName: 'test',
		invocationId: 'abc123',
		log: vi.fn(),
		trace: vi.fn(),
		traceContext: undefined,
		warn: vi.fn(),
		...opts,
	} as unknown as InvocationContext;
}
