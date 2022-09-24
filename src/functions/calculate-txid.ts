import encodeHex from './encode-hex';
import sha256d from './sha256d';

export default function calculateTxid(buffer: Uint8Array): string {
	return encodeHex(sha256d(buffer).reverse());
}
