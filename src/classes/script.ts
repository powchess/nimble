import createP2PKHLockScript from '../functions/create-p2pkh-lock-script';
import isP2PKHLockScript from '../functions/is-p2pkh-lock-script';
import extractP2PKHLockScriptPubkeyhash from '../functions/extract-p2pkh-lock-script-pubkeyhash';
import encodeHex from '../functions/encode-hex';
import decodeHex from '../functions/decode-hex';
import decodeScriptChunks from '../functions/decode-script-chunks';
import isBuffer from '../functions/is-buffer';
import encodeASM from '../functions/encode-asm';
import decodeASM from '../functions/decode-asm';
import Address from './address';
import PublicKey from './public-key';
import nimble from '../../index';

// These WeakMap caches allow the objects themselves to maintain their immutability
const SCRIPT_TO_CHUNKS_CACHE = new WeakMap();

export default class Script {
	buffer: Uint8Array;

	constructor(buffer = new Uint8Array(), validate = true) {
		if (validate && !isBuffer(buffer)) throw new Error('not a buffer');

		this.buffer = buffer;

		// Make the script class immutable, in part so that its safe to cache chunks
		// We can't freeze the underlying buffer unfortunately because of a limitation in JS, and copying to
		// an object we can freeze, like Array, is too slow. https://github.com/tc39/proposal-limited-arraybuffer
		Object.freeze(this);

		// Proxy the script so it may be used in place of a buffer in functions
		return new Proxy(this, {
			get: (target, prop, receiver) => {
				if (prop === Symbol.iterator) return target.buffer[Symbol.iterator].bind(target.buffer);
				if (typeof prop !== 'symbol' && Number.isInteger(parseInt(prop))) return target.buffer[parseInt(prop)];
				return Reflect.get(target, prop, receiver);
			},
		});
	}

	static fromString(str: string) {
		try {
			return Script.fromHex(str);
		} catch (e) {
			return Script.fromASM(str);
		}
	}

	static fromHex(str: string) {
		return new Script(decodeHex(str), false);
	}

	static fromASM(asm: string) {
		return this.fromBuffer(decodeASM(asm));
	}

	static fromBuffer(buffer: Uint8Array) {
		return new Script(buffer, true);
	}

	static from(script: Script | Uint8Array | string) {
		if (script instanceof Script) return script;
		if (isBuffer(script)) return Script.fromBuffer(script as Uint8Array);
		if (typeof script === 'string') return Script.fromString(script);
		throw new Error('unsupported type');
	}

	toString() {
		return this.toHex();
	}

	toHex() {
		return encodeHex(this.buffer);
	}

	toASM() {
		return encodeASM(this.buffer);
	}

	toBuffer() {
		return this.buffer;
	}

	get length() {
		return this.buffer.length;
	}

	slice(start: number, end: number) {
		return this.buffer.slice(start, end);
	}

	get chunks() {
		if (SCRIPT_TO_CHUNKS_CACHE.has(this)) return SCRIPT_TO_CHUNKS_CACHE.get(this);
		const chunks = decodeScriptChunks(this.buffer);
		SCRIPT_TO_CHUNKS_CACHE.set(this, chunks);
		return chunks;
	}

	static matches(buffer: Uint8Array) {
		return isP2PKHLockScript(buffer);
	}

	static fromAddress(address: Address | PublicKey | string) {
		return new Script(createP2PKHLockScript(Address.from(address).pubkeyhash));
	}

	toAddress() {
		return new Address(extractP2PKHLockScriptPubkeyhash(this.buffer), nimble.testnet);
	}
}
