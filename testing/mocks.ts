export const mockFetch = vi.fn();

beforeEach(() => {
	mockFetch.mockReset();
	mockFetch.mockResolvedValue({
		json: () => Promise.resolve({}),
		ok: true,
		status: 200,
	});
	global.fetch = mockFetch;
});
