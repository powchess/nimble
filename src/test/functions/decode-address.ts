import bsv from 'bsv';
import { describe, test, expect } from 'vitest';
import nimble from 'index';

const { decodeAddress, encodeBase58Check } = nimble.functions;

describe('decodeAddress', () => {
	test('valid', () => {
		expect(decodeAddress('14kPnFashu7rYZKTXvJU8gXpJMf9e3f8k1')).toEqual({
			testnet: false,
			pubkeyhash: Array.from(new bsv.Address('14kPnFashu7rYZKTXvJU8gXpJMf9e3f8k1').hashBuffer),
		});
		expect(decodeAddress('mhZZFmSiUqcmf8wQrBNjPAVHUCFsHso9ni')).toEqual({
			testnet: true,
			pubkeyhash: Array.from(new bsv.Address('mhZZFmSiUqcmf8wQrBNjPAVHUCFsHso9ni').hashBuffer),
		});
	});

	test('throws if not a string', () => {
		expect(() => decodeAddress()).toThrow('not a string');
		expect(() => decodeAddress([])).toThrow('not a string');
	});

	test('throws if unsupported version', () => {
		expect(() => decodeAddress('3P14159f73E4gFr7JterCCQh9QjiTjiZrG')).toThrow('unsupported version');
	});

	test('throws if bad checksum', () => {
		expect(() => decodeAddress('mhZZFmSiUqcmf8wQrBNjPAVHUCFsHso9n')).toThrow('bad checksum');
	});

	test('throws if unsupported base58', () => {
		expect(() => decodeAddress('@')).toThrow('bad base58 chars');
	});

	test('throws if too short', () => {
		const badLengthAddress = encodeBase58Check(0x00, []);
		expect(() => decodeAddress(badLengthAddress)).toThrow('bad payload');
	});
});
