import decodeBase58Check from './decode-base58-check';
import verifyPrivateKey from './verify-private-key';

export default function decodeWIF(privkey: string) {
	const { version, payload } = decodeBase58Check(privkey);

	const testnet = version === 0xef;

	let number: Uint8Array;
	let compressed;

	if (payload.length === 32) {
		compressed = false;
		number = payload;
	} else if (payload.length === 33) {
		compressed = true;
		number = payload.slice(0, 32);
	} else {
		throw new Error('bad length');
	}

	verifyPrivateKey(number);

	return { number, testnet, compressed };
}
