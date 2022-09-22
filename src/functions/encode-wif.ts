import encodeBase58Check from './encode-base58-check';

export default function encodeWIF(payload: Uint8Array, testnet: boolean, compressed = true) {
	return encodeBase58Check(testnet ? 0xef : 0x80, compressed ? new Uint8Array([...payload, 1]) : payload);
}
