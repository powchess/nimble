import { Point } from 'types/general';
/* eslint-disable import/no-cycle */
import Address from './address';
import PrivateKey from './private-key';
import nimble from '../index';
/* eslint-enable import/no-cycle */
import encodeHex from '../functions/encode-hex';
import decodeHex from '../functions/decode-hex';
import decodePublicKey from '../functions/decode-public-key';
import calculatePublicKey from '../functions/calculate-public-key';
import encodePublicKey from '../functions/encode-public-key';
import isBuffer from '../functions/is-buffer';
import verifyPoint from '../functions/verify-point';

// These WeakMap caches allow the objects themselves to maintain their immutability
const PRIVATE_KEY_TO_PUBLIC_KEY_CACHE = new WeakMap(); // Cached to reduce secp256k1 multiplication

export default class PublicKey {
	point: Point;

	testnet: boolean;

	compressed: boolean;

	constructor(point: Point, testnet: boolean, compressed: boolean, validate = true) {
		if (validate) {
			if (typeof point !== 'object' || !isBuffer(point.x) || !isBuffer(point.y)) throw new Error('bad point');
			if (typeof testnet !== 'boolean') throw new Error('bad testnet flag');
			if (typeof compressed !== 'boolean') throw new Error('bad compressed flag');
			verifyPoint(point);
		}

		this.point = point;
		this.testnet = testnet;
		this.compressed = compressed;

		Object.freeze(this);
	}

	static fromString(pubkey: string): PublicKey {
		const point = decodePublicKey(decodeHex(pubkey));
		const { testnet } = nimble;
		const compressed = pubkey.length === 66;
		return new PublicKey(point, testnet, compressed, false);
	}

	static fromPrivateKey(privateKey: PrivateKey): PublicKey {
		if (PRIVATE_KEY_TO_PUBLIC_KEY_CACHE.has(privateKey)) return PRIVATE_KEY_TO_PUBLIC_KEY_CACHE.get(privateKey);

		if (!(privateKey instanceof PrivateKey)) throw new Error(`not a PrivateKey: ${privateKey}`);

		const point = calculatePublicKey(privateKey.number);
		const { testnet } = privateKey;
		const { compressed } = privateKey;
		const publicKey = new PublicKey(point, testnet, compressed, false);

		PRIVATE_KEY_TO_PUBLIC_KEY_CACHE.set(privateKey, publicKey);

		return publicKey;
	}

	static from(x: PublicKey | PrivateKey | string): PublicKey {
		if (x instanceof PublicKey) return x;
		if (x instanceof PrivateKey) return PublicKey.fromPrivateKey(x);
		if (typeof x === 'string') return PublicKey.fromString(x);
		throw new Error('unsupported type');
	}

	toString(): string {
		return encodeHex(this.toBuffer());
	}

	toBuffer(): Uint8Array {
		return encodePublicKey(this.point, this.compressed);
	}

	toAddress(): Address {
		return Address.fromPublicKey(this);
	}
}
