import { describe, test, expect } from 'vitest';
import nimble from 'index';

const { readU32LE } = nimble.functions;
const { BufferReader } = nimble.classes;

describe('readU32LE', () => {
	test('valid', () => {
		expect(readU32LE(new BufferReader([0x00, 0x00, 0x00, 0x00]))).toBe(0x00000000);
		expect(readU32LE(new BufferReader([0x01, 0x23, 0x45, 0x67]))).toBe(0x67452301);
		expect(readU32LE(new BufferReader([0xff, 0xff, 0xff, 0xff]))).toBe(0xffffffff);
	});

	test('multiple times', () => {
		const reader = new BufferReader([0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0xff]);
		expect(readU32LE(reader)).toBe(0x00000000);
		expect(readU32LE(reader)).toBe(0xffffffff);
		expect(() => readU32LE(reader)).toThrow('not enough data');
	});

	test('throws if not enough data', () => {
		expect(() => readU32LE(new BufferReader([]))).toThrow('not enough data');
		expect(() => readU32LE(new BufferReader([0x00]))).toThrow('not enough data');
		expect(() => readU32LE(new BufferReader([0x00, 0x00, 0x00]))).toThrow('not enough data');
	});
});
