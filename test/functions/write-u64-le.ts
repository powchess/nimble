import nimble from '../env/nimble';
const { writeU64LE } = nimble.functions;
const { BufferWriter } = nimble.classes;
import { describe, test, expect } from '@jest/globals';

describe('writeU64LE', () => {
	test('valid', () => {
		expect(Array.from(writeU64LE(new BufferWriter(), 0).toBuffer())).toEqual([
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
		]);
		expect(Array.from(writeU64LE(new BufferWriter(), Number.MAX_SAFE_INTEGER).toBuffer())).toEqual([
			0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x1f, 0x00,
		]);
	});

	test('multiple', () => {
		const bw = new BufferWriter();
		writeU64LE(bw, 0);
		writeU64LE(bw, Number.MAX_SAFE_INTEGER);
		expect(Array.from(bw.toBuffer())).toEqual([
			0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x1f, 0x00,
		]);
	});

	test('throws if too big', () => {
		expect(() => writeU64LE(new BufferWriter(), Number.MAX_SAFE_INTEGER + 1)).toThrow('number too large');
	});
});
