import { describe, test, expect } from 'vitest';
import nimble from '../..';

const { createP2PKHUnlockScript } = nimble.functions;

describe('createP2PKHUnlockScript', () => {
	test('valid', () => {
		const sig = new Uint8Array(71).fill(1);
		const pubkey = new Uint8Array(33).fill(2);
		expect(Array.from(createP2PKHUnlockScript(sig, pubkey))).toEqual([71, ...sig, 33, ...pubkey]);
	});
});
