import { describe, test, expect } from 'vitest';
import nimble from '../..';

const { readU64LE } = nimble.functions;
const { BufferReader } = nimble.classes;

describe('readU64LE', () => {
	test('valid', () => {
		expect(readU64LE(new BufferReader(new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])))).toBe(0);
		expect(readU64LE(new BufferReader(new Uint8Array([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x1f, 0x00])))).toBe(
			Number.MAX_SAFE_INTEGER
		);
	});

	test('multiple times', () => {
		const reader = new BufferReader(
			new Uint8Array([
				0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x1f, 0x00,
			])
		);
		expect(readU64LE(reader)).toBe(0x0000000000000000);
		expect(readU64LE(reader)).toBe(Number.MAX_SAFE_INTEGER);
		expect(() => readU64LE(reader)).toThrow('not enough data');
	});

	test('throws if not enough data', () => {
		expect(() => readU64LE(new BufferReader(new Uint8Array([])))).toThrow('not enough data');
		expect(() => readU64LE(new BufferReader(new Uint8Array([0x00])))).toThrow('not enough data');
		expect(() => readU64LE(new BufferReader(new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])))).toThrow(
			'not enough data'
		);
	});
});
