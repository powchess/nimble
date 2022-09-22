/* global VARIANT */

import { checkAvailableMemory, getMemoryBuffer, getRipemd160, getSha256 } from '../wasm/wasm-hashes';

let sha256ripemd160: (data: Uint8Array) => Uint8Array;

if (typeof VARIANT === 'undefined' || VARIANT === 'browser') {
	sha256ripemd160 = function (data) {
		const wasmMemory = getMemoryBuffer();
		const wasmSha256 = getSha256();
		const wasmRipemd160 = getRipemd160();

		checkAvailableMemory(data.length + 32 + 20);

		const hashDataPos = wasmMemory.length - data.length;
		const hashOutPos1 = hashDataPos - 32;
		const hashOutPos2 = hashOutPos1 - 20;

		wasmMemory.set(data, hashDataPos);

		wasmSha256(hashDataPos, data.length, hashOutPos1);
		wasmRipemd160(hashOutPos1, 32, hashOutPos2);

		return new Uint8Array(wasmMemory.slice(hashOutPos2, hashOutPos2 + 20));
	};
} else {
	const sha256 = require('./sha256');
	const ripemd160 = require('./ripemd160');
	sha256ripemd160 = (data) => ripemd160(sha256(data));
}

export default sha256ripemd160;
