// eslint-disable-next-line import/no-relative-packages
import { BN_SIZE, PT_SIZE, getMemoryBuffer, getEcdsaExports, writeBN } from '../wasm/wasm-secp256k1';
import { Point, Signature } from '../types/general';

export default function ecdsaVerify(signature: Signature, hash32: Uint8Array, publicKey: Point): boolean {
	const memory = getMemoryBuffer();
	const rPos = memory.length - BN_SIZE;
	const sPos = rPos - BN_SIZE;
	const hash32Pos = sPos - BN_SIZE;
	const publicKeyPos = hash32Pos - PT_SIZE;

	const verify = getEcdsaExports().ecdsa_verify as CallableFunction;

	writeBN(memory, rPos, signature.r);
	writeBN(memory, sPos, signature.s);
	writeBN(memory, hash32Pos, hash32);
	writeBN(memory, publicKeyPos, publicKey.x);
	writeBN(memory, publicKeyPos + BN_SIZE, publicKey.y);

	return verify(rPos, sPos, hash32Pos, publicKeyPos) === 0;
}
