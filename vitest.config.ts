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
		environment: 'node',
		globals: true,
		setupFiles: ['./testing/mocks.ts'],
	},
});
