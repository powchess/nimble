// eslint-disable-next-line import/no-relative-packages
import { BN_SIZE, getBnExports, getMemoryBuffer, getNPos, writeBN } from '../wasm/wasm-secp256k1';

function verifyPrivateKey(privateKey: Uint8Array): Uint8Array {
	if (privateKey.length !== 32) throw new Error('bad length');

	const memory = getMemoryBuffer();
	const privateKeyPos = memory.length - BN_SIZE;
	const bnCmp = getBnExports().bn_cmp as CallableFunction;
	const N_POS = getNPos();

	writeBN(memory, privateKeyPos, privateKey);

	if (bnCmp(privateKeyPos, N_POS) >= 0) throw new Error('outside range');

	return privateKey;
}

export default verifyPrivateKey;
