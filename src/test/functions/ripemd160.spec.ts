import bsv from 'bsv';
import { describe, test, expect } from 'vitest';
import nimble from '../..';

const { ripemd160 } = nimble.functions;

describe('ripemd160', () => {
	test('empty', () => {
		const data: any[] = [];
		const expected = Array.from(bsv.crypto.Hash.ripemd160(bsv.deps.Buffer.from(data)));
		const actual = Array.from(ripemd160(data));
		expect(actual).toEqual(expected);
	});

	test('non-empty', () => {
		const data = [1, 2, 3, 4, 5];
		const expected = Array.from(bsv.crypto.Hash.ripemd160(bsv.deps.Buffer.from(data)));
		const actual = Array.from(ripemd160(data));
		expect(actual).toEqual(expected);
	});

	test('performance', () => {
		const start = Date.now();
		for (let i = 0; i < 1000; i++) {
			ripemd160([1, 2, 3, 4, 5]);
		}
		const time = Date.now() - start;
		expect(time < 100).toBe(true);
	});

	test('throws if too big', () => {
		const data = new Uint8Array(100 * 1024 * 1024);
		expect(() => ripemd160(data)).toThrow('data too big');
	});
});
