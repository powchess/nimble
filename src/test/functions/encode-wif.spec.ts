import bsv from 'bsv';
import { describe, test, expect } from 'vitest';
import nimble from '../..';

const { encodeWIF, generatePrivateKey } = nimble.functions;

describe('encodeWIF', () => {
	test('uncompressed', () => {
		for (let i = 0; i < 100; i++) {
			const privateKey = generatePrivateKey();
			const wif = encodeWIF(privateKey, false, false);
			expect([...new bsv.PrivateKey(wif).toBuffer()]).toEqual([...privateKey]);
		}
	});

	test('compressed', () => {
		for (let i = 0; i < 100; i++) {
			const privateKey = generatePrivateKey();
			const wif = encodeWIF(privateKey, true, true);
			expect([...new bsv.PrivateKey(wif).toBuffer()]).toEqual([...privateKey]);
		}
	});
});
