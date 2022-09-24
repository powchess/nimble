// .eslintrc.js
module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	extends: ['airbnb', 'airbnb-typescript/base', 'plugin:@typescript-eslint/recommended', 'prettier'],
	plugins: ['@typescript-eslint', 'prettier'],
	parserOptions: {
		project: './tsconfig.eslint.json',
	},
};
