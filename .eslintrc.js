const rules = {
	'unicorn/no-array-for-each': 2,
};

const project = ['./tsconfig.json'];

const settings = {
	'import/parsers': {
		'@typescript-eslint/parser': ['.ts'],
	},
	'import/resolver': {
		typescript: {
			project,
		},
	},
};

module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	parserOptions: {
		tsconfigRootDir: __dirname,
		project,
	},
	settings,
	extends: ['@tool-belt/eslint-config'],
	ignorePatterns: ['.eslintrc.js', '**/*.js', '*.js'],
	rules,
	overrides: [
		{
			files: ['tests/**/*.ts', '**/*.spec.ts'],
			extends: ['@tool-belt/eslint-config', 'plugin:vitest/recommended'],
			rules,
		},
	],
};
