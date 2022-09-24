import nimble from '../env/nimble';
const { writeVarint } = nimble.functions;
const { BufferWriter } = nimble.classes;
import { describe, test, expect } from '@jest/globals';

describe('writeVarint', () => {
	test('valid', () => {
		const testValid = (n: number, enc: number[]) =>
			expect(Array.from(writeVarint(new BufferWriter(), n).toBuffer())).toEqual(enc);
		testValid(0, [0]);
		testValid(1, [1]);
		testValid(252, [252]);
		testValid(253, [0xfd, 253, 0]);
		testValid(0xff, [0xfd, 255, 0]);
		testValid(0xff + 1, [0xfd, 0, 1]);
		testValid(0xffff, [0xfd, 0xff, 0xff]);
		testValid(0xffff + 1, [0xfe, 0, 0, 1, 0]);
		testValid(0xffffff, [0xfe, 0xff, 0xff, 0xff, 0]);
		testValid(0xffffff + 1, [0xfe, 0, 0, 0, 1]);
		testValid(0xffffffff, [0xfe, 0xff, 0xff, 0xff, 0xff]);
		testValid(0xffffffff + 1, [0xff, 0, 0, 0, 0, 1, 0, 0, 0]);
		testValid(0x0000ffffffffffff, [0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x00, 0x00]);
		testValid(0x0000f2f3f4f5f6f7, [0xff, 0xf7, 0xf6, 0xf5, 0xf4, 0xf3, 0xf2, 0x00, 0x00]);
		testValid(Number.MAX_SAFE_INTEGER, [0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x1f, 0x00]);
	});

	test('throws if too big', () => {
		expect(() => writeVarint(new BufferWriter(), Number.MAX_SAFE_INTEGER + 1)).toThrow('varint too large');
		expect(() => writeVarint(new BufferWriter(), Number.MAX_VALUE)).toThrow('varint too large');
	});
});
