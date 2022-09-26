import { describe, test, expect } from 'vitest';
import nimble from '../..';

const { verifyPrivateKey, generatePrivateKey } = nimble.functions;

describe('verifyPrivateKey', () => {
	test('does not throw for valid key', () => {
		verifyPrivateKey(generatePrivateKey());
	});

	test('throws if bad length', () => {
		expect(() => verifyPrivateKey(new Uint8Array([]))).toThrow('bad length');
		expect(() => verifyPrivateKey(new Uint8Array(33))).toThrow('bad length');
	});

	test('throws if out of range', () => {
		expect(() => verifyPrivateKey(new Uint8Array(32).fill(255))).toThrow('outside range');
	});
});
