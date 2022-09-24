import encodeBase58Check from './encode-base58-check';

export default function encodeAddress(pubkeyhash: Uint8Array, testnet: boolean): string {
	return encodeBase58Check(testnet ? 0x6f : 0x00, pubkeyhash);
}
