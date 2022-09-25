import { Point } from 'types/general';
import { BN_SIZE, PT_SIZE, getMemoryBuffer, getSecp256k1Exports, writeBN, readBN } from 'run-wasm/wasm-secp256k1';

export default function calculatePublicKey(privateKey: Uint8Array): Point {
	const memory = getMemoryBuffer();
	const privateKeyPos = memory.length - BN_SIZE;
	const publicKeyPos = privateKeyPos - PT_SIZE;

	writeBN(memory, privateKeyPos, privateKey);
	const gMul = getSecp256k1Exports().g_mul as CallableFunction;
	gMul(publicKeyPos, privateKeyPos);

	return {
		x: readBN(memory, publicKeyPos),
		y: readBN(memory, publicKeyPos + BN_SIZE),
	};
}
