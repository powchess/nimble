import Address from './address';
import PublicKey from './public-key';
import nimble from '../index';
import generatePrivateKey from '../functions/generate-private-key';
import encodeWIF from '../functions/encode-wif';
import decodeWIF from '../functions/decode-wif';
import isBuffer from '../functions/is-buffer';
import verifyPrivateKey from '../functions/verify-private-key';

// These WeakMap caches allow the objects themselves to maintain their immutability
const PRIVATE_KEY_TO_WIF_CACHE = new WeakMap(); // Cached to reduce sha256
export default class PrivateKey {
	number: Uint8Array;

	testnet: boolean;

	compressed: boolean;

	constructor(number: Uint8Array, testnet: boolean, compressed: boolean, validate = true) {
		if (validate) {
			if (!isBuffer(number)) throw new Error('bad number');
			if (typeof testnet !== 'boolean') throw new Error('bad testnet flag');
			if (typeof compressed !== 'boolean') throw new Error('bad compressed flag');
			verifyPrivateKey(number);
		}

		this.number = number;
		this.testnet = testnet;
		this.compressed = compressed;

		Object.freeze(this);
	}

	static fromString(wif: string): PrivateKey {
		const { number, testnet, compressed } = decodeWIF(wif);
		const privateKey = new PrivateKey(number, testnet, compressed, false);
		PRIVATE_KEY_TO_WIF_CACHE.set(privateKey, wif);
		return privateKey;
	}

	static fromRandom(testnet: boolean = nimble.testnet): PrivateKey {
		const number = generatePrivateKey();
		const compressed = true;
		return new PrivateKey(number, testnet, compressed, false);
	}

	static from(privateKey: PrivateKey | string): PrivateKey {
		if (privateKey instanceof PrivateKey) return privateKey;
		if (typeof privateKey === 'string') return PrivateKey.fromString(privateKey);
		throw new Error('unsupported type');
	}

	toString(): string {
		if (PRIVATE_KEY_TO_WIF_CACHE.has(this)) return PRIVATE_KEY_TO_WIF_CACHE.get(this);
		const wif = encodeWIF(this.number, this.testnet, this.compressed);
		PRIVATE_KEY_TO_WIF_CACHE.set(this, wif);
		return wif;
	}

	toPublicKey(): PublicKey {
		return PublicKey.fromPrivateKey(this);
	}

	toAddress(): Address {
		return this.toPublicKey().toAddress();
	}
}
