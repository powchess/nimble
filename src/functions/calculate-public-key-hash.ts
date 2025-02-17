import { Point } from '../types/general';
import sha256ripemd160 from './sha256ripemd160';
import encodePublicKey from './encode-public-key';

export default function calculatePublicKeyHash(publicKeyPoint: Point): Uint8Array {
	return sha256ripemd160(encodePublicKey(publicKeyPoint, true));
}
