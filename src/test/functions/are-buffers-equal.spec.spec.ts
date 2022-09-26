import { describe, test, expect } from 'vitest';
import areBuffersEqual from '../../functions/are-buffers-equal';

describe('areBuffersEqual', () => {
	test('retunrs true if same', () => {
		expect(areBuffersEqual(new Uint8Array([]), new Uint8Array([]))).toBe(true);
		expect(areBuffersEqual(Buffer.from([]), Buffer.from([]))).toBe(true);
		expect(areBuffersEqual(new Uint8Array([]), new Uint8Array([]))).toBe(true);
		expect(areBuffersEqual(new Uint8Array([1, 2, 3]), new Uint8Array([1, 2, 3]))).toBe(true);
		expect(areBuffersEqual(Buffer.from([1, 2, 3]), Buffer.from([1, 2, 3]))).toBe(true);
		expect(areBuffersEqual(new Uint8Array([1, 2, 3]), new Uint8Array([1, 2, 3]))).toBe(true);
		expect(areBuffersEqual(new Uint8Array([]), Buffer.from([]))).toBe(true);
		expect(areBuffersEqual(Buffer.from([]), new Uint8Array([]))).toBe(true);
	});

	test('returns false for different lengths', () => {
		expect(areBuffersEqual(new Uint8Array([]), new Uint8Array([1]))).toBe(false);
		expect(areBuffersEqual(new Uint8Array([1]), new Uint8Array([]))).toBe(false);
		expect(areBuffersEqual(new Uint8Array([1]), new Uint8Array([1, 2]))).toBe(false);
	});

	test('returns false for different values', () => {
		expect(areBuffersEqual(new Uint8Array([2]), new Uint8Array([21]))).toBe(false);
		expect(areBuffersEqual(new Uint8Array([1, 2, 3]), new Uint8Array([1, 2, 4]))).toBe(false);
	});
});
