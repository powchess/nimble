import bsv from 'bsv';
import { expect, describe, test } from 'vitest';
import nimble from '../..';

const { PublicKey, PrivateKey } = nimble;

describe('PublicKey', () => {
	describe('constructor', () => {
		test('valid', () => {
			const privateKey = nimble.functions.generatePrivateKey();
			const publicKeyPoint = nimble.functions.calculatePublicKey(privateKey);
			const publicKey = new PublicKey(publicKeyPoint, true, false);
			expect(publicKey.point).toBe(publicKeyPoint);
			expect(publicKey.testnet).toBe(true);
			expect(publicKey.compressed).toBe(false);
		});

		test('throws if bad', () => {
			const privateKey = nimble.functions.generatePrivateKey();
			const publicKeyPoint = nimble.functions.calculatePublicKey(privateKey);
			expect(() => new PublicKey(0, true, true)).toThrow('bad point');
			expect(() => new PublicKey('', true, true)).toThrow('bad point');
			expect(() => new PublicKey({}, true, true)).toThrow('bad point');
			expect(() => new PublicKey({ x: [], y: publicKeyPoint.y }, true, true)).toThrow('not on curve');
			expect(() => new PublicKey({ x: publicKeyPoint.x, y: 1 }, true, true)).toThrow('bad point');
			expect(() => new PublicKey(publicKeyPoint, 0, true)).toThrow('bad testnet flag');
			expect(() => new PublicKey(publicKeyPoint, 'testnet', true)).toThrow('bad testnet flag');
			expect(() => new PublicKey(publicKeyPoint, true, 'compressed')).toThrow('bad compressed flag');
		});
	});

	describe('fromString', () => {
		test('parses string', () => {
			const bsvPrivateKey = new bsv.PrivateKey();
			const bsvPublicKey = bsvPrivateKey.toPublicKey();
			const publicKey = PublicKey.fromString(bsvPublicKey.toString());
			expect(publicKey.compressed).toBe(bsvPublicKey.compressed);
			expect(publicKey.testnet).toBe(false);
			expect([...publicKey.point.x]).toEqual([...bsvPublicKey.point.x.toArray()]);
			expect([...publicKey.point.y]).toEqual([...bsvPublicKey.point.y.toArray()]);
		});

		test('throws if not a string', () => {
			expect(() => PublicKey.fromString()).toThrow('not a string');
			expect(() => PublicKey.fromString(null)).toThrow('not a string');
			expect(() => PublicKey.fromString({})).toThrow('not a string');
		});

		test('throws if too short', () => {
			expect(() => PublicKey.fromString('02')).toThrow('bad length');
		});

		test('throws if not on curve', () => {
			const privateKey = nimble.functions.generatePrivateKey();
			const publicKey = nimble.functions.calculatePublicKey(privateKey);
			publicKey.y = publicKey.x;
			const compressed = nimble.functions.encodeHex(nimble.functions.encodePublicKey(publicKey, false));
			expect(() => PublicKey.fromString(compressed)).toThrow('not on curve');
		});

		test('is immutable', () => {
			const privateKey = PrivateKey.fromRandom();
			const publicKey = PublicKey.fromString(privateKey.toPublicKey().toString());
			expect(Object.isFrozen(publicKey)).toBe(true);
		});
	});

	describe('fromPrivateKey', () => {
		test('creates from private key', () => {
			const bsvPrivateKey = new bsv.PrivateKey();
			const bsvPublicKey = bsvPrivateKey.toPublicKey();
			const privateKey = PrivateKey.fromString(bsvPrivateKey.toString());
			const publicKey = PublicKey.fromPrivateKey(privateKey);
			expect(bsvPublicKey.toString()).toBe(publicKey.toString());
		});

		test('throws if not a private key', () => {
			expect(() => PublicKey.fromPrivateKey()).toThrow('not a PrivateKey: ');
		});

		test('caches public key', () => {
			const privateKey = PrivateKey.fromRandom();
			const t0 = Date.now();
			const publicKey1 = PublicKey.fromPrivateKey(privateKey);
			const t1 = Date.now();
			const publicKey2 = PublicKey.fromPrivateKey(privateKey);
			const t2 = Date.now();
			expect(t2 - t1).toBeLessThanOrEqual(t1 - t0);
			expect(publicKey1).toBe(publicKey2);
		});

		test('is immutable', () => {
			const privateKey = PrivateKey.fromRandom();
			const publicKey = PublicKey.fromPrivateKey(privateKey);
			expect(Object.isFrozen(publicKey)).toBe(true);
		});
	});

	describe('from', () => {
		test('from PublicKey instance', () => {
			const publicKey = PrivateKey.fromRandom().toPublicKey();
			expect(PublicKey.from(publicKey)).toBe(publicKey);
		});

		test('from bsv.PublicKey', () => {
			const publicKey = PrivateKey.fromRandom().toPublicKey();
			const bsvPublicKey = new bsv.PublicKey(publicKey.toString());
			expect(PublicKey.from(bsvPublicKey).toString()).toBe(publicKey.toString());
		});

		test('from string', () => {
			const publicKey = PrivateKey.fromRandom().toPublicKey();
			expect(PublicKey.from(publicKey.toString()).toString()).toBe(publicKey.toString());
		});

		test('from PrivateKey instance', () => {
			const privateKey = PrivateKey.fromRandom();
			expect(PublicKey.from(privateKey).toString()).toBe(privateKey.toPublicKey().toString());
		});

		test('throws if unsupported', () => {
			expect(() => PublicKey.from()).toThrow();
			expect(() => PublicKey.from(null)).toThrow();
			expect(() => PublicKey.from('abc')).toThrow();
		});
	});

	describe('toString', () => {
		test('compressed', () => {
			const bsvPrivateKey = new bsv.PrivateKey();
			const bsvPublicKey = bsvPrivateKey.toPublicKey();
			expect(bsvPublicKey.compressed).toBe(true);
			const publicKey = PublicKey.fromString(bsvPublicKey.toString());
			expect(publicKey.compressed).toBe(true);
			expect(publicKey.toString()).toBe(bsvPublicKey.toString());
		});

		test('uncompressed', () => {
			const bsvPrivateKey = new bsv.PrivateKey();
			const bsvPublicKey = new bsv.PublicKey(bsvPrivateKey.toPublicKey().point, { compressed: false });
			expect(bsvPublicKey.compressed).toBe(false);
			const publicKey = PublicKey.fromString(bsvPublicKey.toString());
			expect(publicKey.compressed).toBe(false);
			expect(publicKey.toString()).toBe(bsvPublicKey.toString());
		});
	});

	describe('toAddress', () => {
		test('mainnet', () => {
			const bsvPrivateKey = new bsv.PrivateKey();
			const bsvAddress = bsvPrivateKey.toAddress();
			const privateKey = PrivateKey.fromString(bsvPrivateKey.toString());
			const address = privateKey.toAddress();
			expect(address.testnet).toBe(false);
			expect(address.toString()).toBe(bsvAddress.toString());
		});

		test('testnet', () => {
			const bsvPrivateKey = new bsv.PrivateKey('testnet');
			const bsvAddress = bsvPrivateKey.toAddress();
			const privateKey = PrivateKey.fromString(bsvPrivateKey.toString());
			const address = privateKey.toAddress();
			expect(address.testnet).toBe(true);
			expect(address.toString()).toBe(bsvAddress.toString());
		});
	});
});
