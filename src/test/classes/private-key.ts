import bsv from 'bsv';
import { expect, describe, test } from 'vitest';
import nimble from 'index';

const { PrivateKey } = nimble;
const { encodeBase58Check } = nimble.functions;

describe('PrivateKey', () => {
	describe('constructor', () => {
		test('valid', () => {
			const number = nimble.functions.generatePrivateKey();
			const privateKey = new PrivateKey(number, true, false);
			expect(privateKey.number).toBe(number);
			expect(privateKey.testnet).toBe(true);
			expect(privateKey.compressed).toBe(false);
		});

		test('throws if bad', () => {
			const number = nimble.functions.generatePrivateKey();
			expect(() => new PrivateKey(null, true, true)).toThrow('bad number');
			expect(() => new PrivateKey(0, true, true)).toThrow('bad number');
			expect(() => new PrivateKey(number, 1, true)).toThrow('bad testnet flag');
			expect(() => new PrivateKey(number, false, undefined)).toThrow('bad compressed flag');
			expect(() => new PrivateKey([], true, true)).toThrow('bad length');
			expect(() => new PrivateKey(new Array(33), true, true)).toThrow('bad length');
			expect(() => new PrivateKey(new Array(32).fill(255), true, true)).toThrow('outside range');
		});
	});

	describe('fromString', () => {
		test('parses WIF', () => {
			const bsvPrivateKey = new bsv.PrivateKey();
			const privateKey = PrivateKey.fromString(bsvPrivateKey.toString());
			expect(privateKey.testnet).toBe(false);
			expect(privateKey.compressed).toBe(bsvPrivateKey.compressed);
			expect([...privateKey.number]).toEqual([...bsvPrivateKey.toBuffer()]);
		});

		test('throws if not a string', () => {
			expect(() => PrivateKey.fromString()).toThrow('not a string');
		});

		test('throws if bad WIF', () => {
			const badPrivateKey = encodeBase58Check(0, []);
			expect(() => PrivateKey.fromString(badPrivateKey)).toThrow('bad length');
		});

		test('is immutable', () => {
			const wif = PrivateKey.fromRandom().toString();
			const privateKey = PrivateKey.fromString(wif);
			expect(Object.isFrozen(privateKey)).toBe(true);
		});
	});

	describe('fromRandom', () => {
		test('generates random', () => {
			const privateKey1 = PrivateKey.fromRandom();
			const privateKey2 = PrivateKey.fromRandom();
			expect(privateKey1.number).not.toEqual(privateKey2.number);
		});

		test('is immutable', () => {
			const privateKey = PrivateKey.fromRandom();
			expect(Object.isFrozen(privateKey)).toBe(true);
		});

		test('testnet', () => {
			const privateKey = PrivateKey.fromRandom(true);
			expect(privateKey.testnet).toBe(true);
		});
	});

	describe('from', () => {
		test('from PrivateKey instance', () => {
			const privateKey = PrivateKey.fromRandom();
			expect(PrivateKey.from(privateKey)).toBe(privateKey);
		});

		test('from bsv.PrivateKey', () => {
			const privateKey = PrivateKey.fromRandom();
			const bsvPrivateKey = new bsv.PrivateKey(privateKey.toString());
			expect(PrivateKey.from(bsvPrivateKey).toString()).toBe(privateKey.toString());
		});

		test('from string', () => {
			const privateKey = PrivateKey.fromRandom();
			expect(PrivateKey.from(privateKey.toString()).toString()).toBe(privateKey.toString());
		});

		test('throws if unsupported', () => {
			expect(() => PrivateKey.from()).toThrow();
			expect(() => PrivateKey.from(null)).toThrow();
			expect(() => PrivateKey.from('abc')).toThrow();
		});
	});

	describe('toString', () => {
		test('returns WIF', () => {
			const bsvPrivateKey = new bsv.PrivateKey();
			const privateKey = PrivateKey.fromString(bsvPrivateKey.toString());
			expect(privateKey.toString()).toBe(bsvPrivateKey.toString());
		});

		test('caches wif string', () => {
			const privateKey = PrivateKey.fromRandom();
			const t0 = Date.now();
			privateKey.toString();
			const t1 = Date.now();
			privateKey.toString();
			const t2 = Date.now();
			expect(t2 - t1).toBeLessThanOrEqual(t1 - t0);
		});
	});

	describe('toPublicKey', () => {
		test('calculates public key', () => {
			const bsvPrivateKey = new bsv.PrivateKey();
			const bsvPublicKey = bsvPrivateKey.toPublicKey();
			const privateKey = PrivateKey.fromString(bsvPrivateKey.toString());
			const publicKey = privateKey.toPublicKey();
			expect(publicKey.toString()).toBe(bsvPublicKey.toString());
		});

		test('caches public key', () => {
			const privateKey = PrivateKey.fromRandom();
			const t0 = Date.now();
			const publicKey1 = privateKey.toPublicKey();
			const t1 = Date.now();
			const publicKey2 = privateKey.toPublicKey();
			const t2 = Date.now();
			expect(t2 - t1).toBeLessThanOrEqual(t1 - t0);
			expect(publicKey1).toBe(publicKey2);
		});
	});

	describe('toAddress', () => {
		test('mainnet', () => {
			const bsvPrivateKey = new bsv.PrivateKey();
			const bsvAddress = bsvPrivateKey.toAddress();
			const privateKey = PrivateKey.fromString(bsvPrivateKey.toString());
			const address = privateKey.toAddress();
			expect(address.toString()).toBe(bsvAddress.toString());
		});

		test('testnet', () => {
			const bsvPrivateKey = new bsv.PrivateKey('testnet');
			const bsvAddress = bsvPrivateKey.toAddress();
			const privateKey = PrivateKey.fromString(bsvPrivateKey.toString());
			const address = privateKey.toAddress();
			expect(address.toString()).toBe(bsvAddress.toString());
		});
	});
});
