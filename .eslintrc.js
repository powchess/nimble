// .eslintrc.js
module.exports = {
	root: true,
	extends: ['airbnb', 'airbnb-typescript/base', 'prettier'],
	plugins: ['import', 'prettier'],
	parserOptions: {
		project: './tsconfig.eslint.json',
	},
};
