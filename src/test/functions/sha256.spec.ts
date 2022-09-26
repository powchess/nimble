import bsv from 'bsv';
import { describe, test, expect } from 'vitest';
import nimble from '../..';

const { sha256 } = nimble.functions;

describe('sha256', () => {
	test('empty', () => {
		const data = new Uint8Array([]);
		const expected = Array.from(bsv.crypto.Hash.sha256(bsv.deps.Buffer.from(data)));
		const actual = Array.from(sha256(data));
		expect(actual).toEqual(expected);
	});

	test('non-empty', () => {
		const data = new Uint8Array([1, 2, 3, 4, 5]);
		const expected = Array.from(bsv.crypto.Hash.sha256(bsv.deps.Buffer.from(data)));
		const actual = Array.from(sha256(data));
		expect(actual).toEqual(expected);
	});

	test('performance', () => {
		const start = Date.now();
		for (let i = 0; i < 1000; i++) {
			sha256(new Uint8Array([1, 2, 3, 4, 5]));
		}
		const time = Date.now() - start;
		expect(time < 100).toBe(true);
	});

	if (typeof nimble.variant === 'undefined' || nimble.variant === 'browser') {
		test('throws if too big', () => {
			const data = new Uint8Array(100 * 1024 * 1024);
			expect(() => sha256(data)).toThrow('data too big');
		});
	}
});
