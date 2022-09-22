import PublicKey from './public-key';
import Script from './script';

import encodeAddress from '../functions/encode-address';
import decodeAddress from '../functions/decode-address';
import calculatePublicKeyHash from '../functions/calculate-public-key-hash';
import isBuffer from '../functions/is-buffer';

// These WeakMap caches allow the objects themselves to maintain their immutability
const PUBLIC_KEY_TO_ADDRESS_CACHE = new WeakMap(); // Cached to reduce ripemd160 and sha256 hashing
const ADDRESS_TO_STRING_CACHE = new WeakMap(); // Cached to reduce sha256 hashing

export default class Address {
	public pubkeyhash: Uint8Array;
	public testnet: boolean;

	constructor(pubkeyhash: Uint8Array, testnet: boolean, validate = true) {
		if (validate) {
			if (!isBuffer(pubkeyhash) || pubkeyhash.length !== 20) throw new Error('bad pubkeyhash');
			if (typeof testnet !== 'boolean') throw new Error('bad testnet flag');
		}

		this.pubkeyhash = pubkeyhash;
		this.testnet = testnet;

		Object.freeze(this);
	}

	static fromString(str: string) {
		const { pubkeyhash, testnet } = decodeAddress(str);
		const address = new Address(pubkeyhash, testnet, false);
		ADDRESS_TO_STRING_CACHE.set(address, str);
		return address;
	}

	static fromPublicKey(publicKey: PublicKey) {
		if (PUBLIC_KEY_TO_ADDRESS_CACHE.has(publicKey)) return PUBLIC_KEY_TO_ADDRESS_CACHE.get(publicKey);

		const testnet = publicKey.testnet;
		const pubkeyhash = calculatePublicKeyHash(publicKey.point);
		const address = new Address(pubkeyhash, testnet, false);

		PUBLIC_KEY_TO_ADDRESS_CACHE.set(publicKey, address);

		return address;
	}

	static from(x: Address | PublicKey | string): Address {
		if (x instanceof Address) return x;
		if (x instanceof PublicKey) return Address.fromPublicKey(x);
		if (typeof x === 'object' && x) x = x.toString();
		if (typeof x === 'string') return Address.fromString(x);
		throw new Error('unsupported type');
	}

	toString(): string {
		if (ADDRESS_TO_STRING_CACHE.has(this)) return ADDRESS_TO_STRING_CACHE.get(this);
		const address = encodeAddress(this.pubkeyhash, this.testnet);
		ADDRESS_TO_STRING_CACHE.set(this, address);
		return address;
	}

	toScript() {
		return Script.templates.P2PKHLockScript.fromAddress(this);
	}
}
