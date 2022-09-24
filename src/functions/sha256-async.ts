import VARIANT from 'constants/variant';

const subtleCrypto = typeof window !== 'undefined' && window.crypto && window.crypto.subtle;

let sha256Async: (data: Uint8Array) => Promise<Uint8Array>;

if (typeof VARIANT !== 'undefined' && VARIANT === 'browser' && subtleCrypto) {
	sha256Async = async (data) => {
		return new Uint8Array(await subtleCrypto.digest('SHA-256', new Uint8Array(data)));
	};
} else {
	const asyncify = require('./asyncify');
	const sha256 = require('./sha256');

	sha256Async = asyncify(sha256);
}

export default sha256Async;
