import { describe, test, expect } from 'vitest';
import nimble from '../..';

const { writeU32LE } = nimble.functions;
const { BufferWriter } = nimble.classes;

describe('writeU32LE', () => {
	test('valid', () => {
		expect(Array.from(writeU32LE(new BufferWriter(), 0).toBuffer())).toEqual([0x00, 0x00, 0x00, 0x00]);
		expect(Array.from(writeU32LE(new BufferWriter(), 0x01234567).toBuffer())).toEqual([0x67, 0x45, 0x23, 0x01]);
		expect(Array.from(writeU32LE(new BufferWriter(), 0xffffffff).toBuffer())).toEqual([0xff, 0xff, 0xff, 0xff]);
	});

	test('multiple', () => {
		const bw = new BufferWriter();
		writeU32LE(bw, 0x00000000);
		writeU32LE(bw, 0xffffffff);
		expect(Array.from(bw.toBuffer())).toEqual([0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0xff]);
	});

	test('throws if too big', () => {
		expect(() => writeU32LE(new BufferWriter(), 0xffffffff + 1)).toThrow('number too large');
	});
});
