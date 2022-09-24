import { getMemoryBuffer, getRipemd160, checkAvailableMemory } from '../wasm/wasm-hashes';

export default function ripemd160(data: Uint8Array): Uint8Array {
	const wasmMemory = getMemoryBuffer();
	const wasmRipemd160 = getRipemd160() as CallableFunction;

	checkAvailableMemory(data.length + 20);

	const hashDataPos = wasmMemory.length - data.length;
	const hashOutPos = hashDataPos - 20;

	wasmMemory.set(data, hashDataPos);

	wasmRipemd160(hashDataPos, data.length, hashOutPos);

	return new Uint8Array(wasmMemory.slice(hashOutPos, hashOutPos + 20));
}
