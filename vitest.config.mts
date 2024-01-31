/* eslint-disable n/no-unpublished-import */
import tsconfigPaths from 'vite-tsconfig-paths';
import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [tsconfigPaths()],
	test: {
		coverage: {
			exclude: [
				...(configDefaults.coverage.exclude ?? []),
				'testing/**/*.*',
				'**/*.spec.*',
			],
			reporter: ['text', 'cobertura'],
		},
		css: true,
		environment: 'jsdom',
		globals: true,
		setupFiles: ['./testing/vitest.setup.ts', './testing/mocks.ts'],
	},
});
