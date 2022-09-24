import generatePrivateKey from './generate-private-key';
import ecdsaSignWithK from './ecdsa-sign-with-k';
import { Point } from 'types/general';

export default function ecdsaSign(
	hash32: Uint8Array,
	privateKey: Uint8Array,
	publicKey: Point
): { r: Uint8Array; s: Uint8Array; k: Uint8Array } {
	while (true) {
		const k = generatePrivateKey();

		const signature = ecdsaSignWithK(hash32, k, privateKey, publicKey);

		if (signature) {
			return { r: signature.r, s: signature.s, k };
		}
	}
}
