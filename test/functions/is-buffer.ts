import nimble from '../env/nimble';
const { isBuffer } = nimble.functions;
import { describe, test, expect } from '@jest/globals';

describe('isBuffer', () => {
	test('returns true for buffer', () => {
		expect(isBuffer([])).toBe(true);
		expect(isBuffer(Buffer.from([]))).toBe(true);
		expect(isBuffer(new Uint8Array([]))).toBe(true);
	});

	test('returns false for non-buffer', () => {
		expect(isBuffer()).toBe(false);
		expect(isBuffer({})).toBe(false);
		expect(isBuffer(Uint16Array.from([]))).toBe(false);
	});

	test('returns false non-byte elements', () => {
		expect(isBuffer(['a'])).toBe(false);
		expect(isBuffer([1, undefined])).toBe(false);
	});
});
