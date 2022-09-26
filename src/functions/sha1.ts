import { createHash } from 'crypto';
// eslint-disable-next-line import/no-relative-packages
import { checkAvailableMemory, getSha1, getMemoryBuffer } from '../wasm/wasm-hashes';
import VARIANT from '../constants/variant';

// eslint-disable-next-line import/no-mutable-exports
let sha1: (data: Uint8Array) => Uint8Array;

// If we don't know the VARIANT, prefer our implementation to avoid the crypto shim in the browser

if (typeof VARIANT === 'undefined' || VARIANT === 'browser') {
	sha1 = (data) => {
		const wasmMemory = getMemoryBuffer();
		const wasmSha1 = getSha1() as CallableFunction;

		checkAvailableMemory(data.length + 20);

		const hashDataPos = wasmMemory.length - data.length;
		const hashOutPos = hashDataPos - 20;

		wasmMemory.set(data, hashDataPos);

		wasmSha1(hashDataPos, data.length, hashOutPos);

		return new Uint8Array(wasmMemory.slice(hashOutPos, hashOutPos + 20));
	};
} else {
	sha1 = (data) => {
		const hash = createHash('sha1');
		hash.update(new Uint8Array(data));
		return hash.digest();
	};
}

export default sha1;
