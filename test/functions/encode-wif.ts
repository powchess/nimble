import nimble from '../env/nimble';
const { encodeWIF, generatePrivateKey } = nimble.functions;
import bsv from 'bsv';
import { describe, test, expect } from '@jest/globals';

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
