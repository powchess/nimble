module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	extends: ['airbnb', 'airbnb-typescript/base', 'plugin:@typescript-eslint/recommended', 'prettier'],
	plugins: ['@typescript-eslint', 'prettier'],
	parserOptions: {
		ecmaVersion: 2020,
		sourceType: 'module',
		tsconfigRootDir: __dirname,
		project: './tsconfig.json',
	},
	env: {
		browser: true,
		es2017: true,
		node: true,
	},
	rules: {
		'no-continue': 'off',
		'no-plusplus': 'off',
		'@typescript-eslint/ban-ts-comment': 'off',
		'import/no-extraneous-dependencies': 'off',
	},
};
