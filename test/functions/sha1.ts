import nimble from '../env/nimble';
const { sha1 } = nimble.functions;
import bsv from 'bsv';
import { describe, test, expect } from '@jest/globals';

describe('sha1', () => {
	test('empty', () => {
		const data: number[] = [];
		const expected = Array.from(bsv.crypto.Hash.sha1(bsv.deps.Buffer.from(data)));
		const actual = Array.from(sha1(data));
		expect(actual).toEqual(expected);
	});

	test('non-empty', () => {
		const data = [1, 2, 3, 4, 5];
		const expected = Array.from(bsv.crypto.Hash.sha1(bsv.deps.Buffer.from(data)));
		const actual = Array.from(sha1(data));
		expect(actual).toEqual(expected);
	});

	test('performance', () => {
		const start = Date.now();
		for (let i = 0; i < 1000; i++) {
			sha1([1, 2, 3, 4, 5]);
		}
		const time = Date.now() - start;
		expect(time < 100).toBe(true);
	});

	if (nimble.variant === 'undefined' || nimble.variant === 'browser') {
		test('throws if too big', () => {
			const data = new Uint8Array(100 * 1024 * 1024);
			expect(() => sha1(data)).toThrow('data too big');
		});
	}
});
