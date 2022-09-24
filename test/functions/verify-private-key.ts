import nimble from '../env/nimble';
const { verifyPrivateKey, generatePrivateKey } = nimble.functions;
import { describe, test, expect } from '@jest/globals';

describe('verifyPrivateKey', () => {
	test('does not throw for valid key', () => {
		verifyPrivateKey(generatePrivateKey());
	});

	test('throws if bad length', () => {
		expect(() => verifyPrivateKey([])).toThrow('bad length');
		expect(() => verifyPrivateKey(new Array(33))).toThrow('bad length');
	});

	test('throws if out of range', () => {
		expect(() => verifyPrivateKey(new Array(32).fill(255))).toThrow('outside range');
	});
});
