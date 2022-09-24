import decodeBase58 from './decode-base58';
import sha256d from './sha256d';

export default function decodeBase58Check(str: string): { version: number, payload: Uint8Array} {
	const arr = decodeBase58(str);

	const version = arr[0];

	const checksum = sha256d(arr.slice(0, arr.length - 4));

	if (
		checksum[0] !== arr[arr.length - 4] ||
		checksum[1] !== arr[arr.length - 3] ||
		checksum[2] !== arr[arr.length - 2] ||
		checksum[3] !== arr[arr.length - 1]
	) {
		throw new Error('bad checksum');
	}

	const payload = new Uint8Array(arr.slice(1, arr.length - 4));

	return { version, payload };
}
