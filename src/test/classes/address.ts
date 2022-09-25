import bsv from 'bsv';
import { expect, describe, test } from 'vitest';
import nimble from 'index';

const { Address, PrivateKey, Script } = nimble;
const { encodeBase58Check, createP2PKHLockScript } = nimble.functions;

describe('Address', () => {
	describe('constructor', () => {
		test('valid', () => {
			const privateKey = nimble.functions.generatePrivateKey();
			const publicKey = nimble.functions.calculatePublicKey(privateKey);
			const pubkeyhash = nimble.functions.calculatePublicKeyHash(publicKey);
			const address = new Address(pubkeyhash, true);
			expect(address.pubkeyhash).toBe(pubkeyhash);
			expect(address.testnet).toBe(true);
		});

		test('throws if bad', () => {
			expect(() => new Address('abc', true)).toThrow('bad pubkeyhash');
			expect(() => new Address([], false)).toThrow('bad pubkeyhash');
			expect(() => new Address(new Array(20), 0)).toThrow('bad testnet flag');
		});
	});

	describe('fromString', () => {
		test('decodes valid mainnet address', () => {
			const bsvAddress = new bsv.PrivateKey().toAddress();
			const address = Address.fromString(bsvAddress.toString());
			expect(address.testnet).toBe(false);
			expect(Buffer.from(bsvAddress.hashBuffer).toString('hex')).toBe(
				Buffer.from(address.pubkeyhash).toString('hex')
			);
		});

		test('decodes valid testnet address', () => {
			const bsvAddress = new bsv.PrivateKey(undefined, 'testnet').toAddress();
			const address = Address.fromString(bsvAddress.toString());
			expect(address.testnet).toBe(true);
			expect(Buffer.from(bsvAddress.hashBuffer).toString('hex')).toBe(
				Buffer.from(address.pubkeyhash).toString('hex')
			);
		});

		test('throws if bad checksum', () => {
			expect(() => Address.fromString('1JMckZqEF3194i3TCe2eJrvLyL74RAJ36k')).toThrow('bad checksum');
		});

		test('throws if not a string', () => {
			expect(() => Address.fromString()).toThrow('not a string');
			expect(() => Address.fromString(null)).toThrow('not a string');
			expect(() => Address.fromString(Address.fromString(new bsv.PrivateKey().toAddress()))).toThrow(
				'not a string'
			);
		});

		test('throws if bad chars', () => {
			expect(() => Address.fromString('!JMckZqEF3194i3TCe2eJrvLyL74RAJ36k')).toThrow('bad base58 chars');
		});

		test('throws if bad length', () => {
			const badLengthAddress = encodeBase58Check(0, []);
			expect(() => Address.fromString(badLengthAddress)).toThrow('bad payload');
		});

		test('is immutable', () => {
			const address = Address.fromString(PrivateKey.fromRandom().toAddress().toString());
			expect(Object.isFrozen(address)).toBe(true);
		});
	});

	describe('fromPublicKey', () => {
		test('computes address', () => {
			const bsvPrivateKey = new bsv.PrivateKey();
			const bsvAddress = bsvPrivateKey.toAddress();
			const privateKey = PrivateKey.fromString(bsvPrivateKey.toString());
			const address = privateKey.toAddress();
			expect(address.toString()).toBe(bsvAddress.toString());
		});

		test('caches address', () => {
			const publicKey = PrivateKey.fromRandom().toPublicKey();
			const t0 = Date.now();
			const address1 = Address.fromPublicKey(publicKey);
			const t1 = Date.now();
			const address2 = Address.fromPublicKey(publicKey);
			const t2 = Date.now();
			expect(t2 - t1).toBeLessThanOrEqual(t1 - t0);
			expect(address1).toBe(address2);
		});

		test('is immutable', () => {
			const address = Address.fromPublicKey(PrivateKey.fromRandom().toPublicKey());
			expect(Object.isFrozen(address)).toBe(true);
		});
	});

	describe('from', () => {
		test('from Address instance', () => {
			const address = PrivateKey.fromRandom().toAddress();
			expect(Address.from(address)).toBe(address);
		});

		test('from bsv.Address', () => {
			const address = PrivateKey.fromRandom().toAddress();
			const bsvAddress = new bsv.Address(address.toString());
			expect(Address.from(bsvAddress).toString()).toBe(address.toString());
		});

		test('from string', () => {
			const address = PrivateKey.fromRandom().toAddress();
			expect(Address.from(address.toString()).toString()).toBe(address.toString());
		});

		test('from PublicKey instance', () => {
			const publicKey = PrivateKey.fromRandom().toPublicKey();
			expect(Address.from(publicKey).toString()).toBe(publicKey.toAddress().toString());
		});

		test('throws if unsupported', () => {
			expect(() => Address.from()).toThrow();
			expect(() => Address.from(null)).toThrow();
			expect(() => Address.from('abc')).toThrow();
		});
	});

	describe('toString', () => {
		test('mainnet', () => {
			const bsvAddress = new bsv.PrivateKey().toAddress();
			expect(Address.fromString(bsvAddress.toString()).toString()).toBe(bsvAddress.toString());
		});

		test('testnet', () => {
			const bsvAddress = new bsv.PrivateKey(undefined, 'testnet').toAddress();
			expect(Address.fromString(bsvAddress.toString()).toString()).toBe(bsvAddress.toString());
		});
	});

	describe('toScript', () => {
		test('returns p2pkh lock script', () => {
			const address = PrivateKey.fromRandom().toAddress();
			const script = address.toScript();
			expect(Array.from(script.toBuffer())).toEqual(Array.from(createP2PKHLockScript(address.pubkeyhash)));
		});
	});
});
