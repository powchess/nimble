// eslint-disable-next-line import/no-relative-packages
import { getMemoryBuffer, getSha256, checkAvailableMemory } from '../wasm/wasm-hashes';
import VARIANT from '../constants/variant';
import sha256 from './sha256';

// eslint-disable-next-line import/no-mutable-exports
let sha256d: (data: Uint8Array) => Uint8Array;

if (typeof VARIANT === 'undefined' || VARIANT === 'browser') {
	sha256d = (data) => {
		const wasmMemory = getMemoryBuffer();
		const wasmSha256 = getSha256() as CallableFunction;

		checkAvailableMemory(data.length + 32 + 32);

		const hashDataPos = wasmMemory.length - data.length;
		const hashOutPos1 = hashDataPos - 32;
		const hashOutPos2 = hashOutPos1 - 32;

		wasmMemory.set(data, hashDataPos);

		wasmSha256(hashDataPos, data.length, hashOutPos1);
		wasmSha256(hashOutPos1, 32, hashOutPos2);

		return new Uint8Array(wasmMemory.slice(hashOutPos2, hashOutPos2 + 32));
	};
} else {
	sha256d = (data) => sha256(sha256(data));
}

export default sha256d;
