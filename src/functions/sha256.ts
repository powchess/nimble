import { createHash } from 'crypto';
// eslint-disable-next-line import/no-relative-packages
import { checkAvailableMemory, getSha256, getMemoryBuffer } from '../wasm/wasm-hashes';
import VARIANT from '../constants/variant';

// eslint-disable-next-line import/no-mutable-exports
let sha256: (data: Uint8Array) => Uint8Array;

// If we don't know the VARIANT, prefer our implementation to avoid the crypto shim in the browser

if (typeof VARIANT === 'undefined' || VARIANT === 'browser') {
	sha256 = (data) => {
		const wasmMemory = getMemoryBuffer();
		const wasmSha256 = getSha256() as CallableFunction;

		checkAvailableMemory(data.length + 32);

		const hashDataPos = wasmMemory.length - data.length;
		const hashOutPos = hashDataPos - 32;

		wasmMemory.set(data, hashDataPos);

		wasmSha256(hashDataPos, data.length, hashOutPos);

		return new Uint8Array(wasmMemory.slice(hashOutPos, hashOutPos + 32));
	};
} else {
	sha256 = (data) => {
		const hash = createHash('sha256');
		hash.update(new Uint8Array(data));
		return hash.digest();
	};
}

export default sha256;
