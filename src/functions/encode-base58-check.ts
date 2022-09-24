import encodeBase58 from './encode-base58';
import sha256d from './sha256d';

export default function encodeBase58Check(version: number, payload: Uint8Array): string {
	const arr = new Uint8Array(payload.length + 5);

	arr[0] = version;

	arr.set(payload, 1);

	const checksum = sha256d(arr.slice(0, payload.length + 1));
	arr.set(checksum.slice(0, 4), arr.length - 4);

	return encodeBase58(arr);
}
