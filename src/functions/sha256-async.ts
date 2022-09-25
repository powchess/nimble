import VARIANT from 'constants/variant';
import asyncify from './asyncify';
import sha256 from './sha256';

const subtleCrypto = typeof window !== 'undefined' && window.crypto && window.crypto.subtle;

let sha256Async: (data: Uint8Array) => Promise<Uint8Array>;

if (typeof VARIANT !== 'undefined' && VARIANT === 'browser' && subtleCrypto) {
	sha256Async = async (data) => new Uint8Array(await subtleCrypto.digest('SHA-256', new Uint8Array(data)));
} else {
	sha256Async = asyncify(sha256);
}

export default sha256Async;
