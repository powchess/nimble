import { Point } from '../types/general';
import generatePrivateKey from './generate-private-key';
import ecdsaSignWithK from './ecdsa-sign-with-k';

export default function ecdsaSign(
	hash32: Uint8Array,
	privateKey: Uint8Array,
	publicKey: Point
): Promise<{ r: Uint8Array; s: Uint8Array; k: Uint8Array }> {
	return new Promise((resolve) => {
		// eslint-disable-next-line no-constant-condition
		while (true) {
			const k = generatePrivateKey();
			const signature = ecdsaSignWithK(hash32, k, privateKey, publicKey);

			if (signature) {
				resolve({ r: signature.r, s: signature.s, k });
			}
		}
	});
}
