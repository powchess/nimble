import { describe, test, expect } from 'vitest';
import nimble from 'index';

const { createP2PKHUnlockScript } = nimble.functions;

describe('createP2PKHUnlockScript', () => {
	test('valid', () => {
		const sig = new Array(71).fill(1);
		const pubkey = new Array(33).fill(2);
		expect(Array.from(createP2PKHUnlockScript(sig, pubkey))).toEqual([71, ...sig, 33, ...pubkey]);
	});

	test('throws if bad address', () => {
		expect(() => createP2PKHUnlockScript()).toThrow();
		expect(() => createP2PKHUnlockScript(null)).toThrow();
		expect(() => createP2PKHUnlockScript([])).toThrow();
	});
});
