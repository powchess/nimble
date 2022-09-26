// eslint-disable-next-line import/no-relative-packages
import { BN_SIZE, PT_SIZE, getMemoryBuffer, getEcdsaExports, writeBN, readBN } from '../wasm/wasm-secp256k1';
import { Point, Signature } from '../types/general';

export default function ecdsaSignWithK(
	hash32: Uint8Array,
	k: Uint8Array,
	privateKey: Uint8Array,
	publicKey: Point
): Signature | null {
	const memory = getMemoryBuffer();
	const hash32Pos = memory.length - BN_SIZE;
	const kPos = hash32Pos - BN_SIZE;
	const privateKeyPos = kPos - BN_SIZE;
	const publicKeyPos = privateKeyPos - PT_SIZE;
	const rPos = publicKeyPos - BN_SIZE;
	const sPos = rPos - BN_SIZE;

	const ecdsaSign = getEcdsaExports().ecdsa_sign as CallableFunction;

	writeBN(memory, hash32Pos, hash32);
	writeBN(memory, kPos, k);
	writeBN(memory, privateKeyPos, privateKey);
	writeBN(memory, publicKeyPos, publicKey.x);
	writeBN(memory, publicKeyPos + BN_SIZE, publicKey.y);

	if (ecdsaSign(rPos, sPos, hash32Pos, kPos, privateKeyPos, publicKeyPos)) {
		return null;
	}

	return {
		r: readBN(memory, rPos),
		s: readBN(memory, sPos),
	};
}
