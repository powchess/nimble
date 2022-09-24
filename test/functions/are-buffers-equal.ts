import nimble from '../env/nimble';
const { areBuffersEqual } = nimble.functions;
import { describe, test, expect } from '@jest/globals';

describe('areBuffersEqual', () => {
	test('retunrs true if same', () => {
		expect(areBuffersEqual([], [])).toBe(true);
		expect(areBuffersEqual(Buffer.from([]), Buffer.from([]))).toBe(true);
		expect(areBuffersEqual(new Uint8Array([]), new Uint8Array([]))).toBe(true);
		expect(areBuffersEqual([1, 2, 3], [1, 2, 3])).toBe(true);
		expect(areBuffersEqual(Buffer.from([1, 2, 3]), Buffer.from([1, 2, 3]))).toBe(true);
		expect(areBuffersEqual(new Uint8Array([1, 2, 3]), new Uint8Array([1, 2, 3]))).toBe(true);
		expect(areBuffersEqual([], Buffer.from([]))).toBe(true);
		expect(areBuffersEqual(Buffer.from([]), new Uint8Array([]))).toBe(true);
	});

	test('returns false for different lengths', () => {
		expect(areBuffersEqual([], [1])).toBe(false);
		expect(areBuffersEqual([1], [])).toBe(false);
		expect(areBuffersEqual([1], [1, 2])).toBe(false);
	});

	test('returns false for different values', () => {
		expect(areBuffersEqual([1], [21])).toBe(false);
		expect(areBuffersEqual([1, 2, 3], [1, 2, 4])).toBe(false);
	});
});
