import nimble from '../env/nimble';
const { writePushData } = nimble.functions;
const { BufferWriter } = nimble.classes;
import { describe, test, expect } from '@jest/globals';

describe('writePushData', () => {
	test('valid', () => {
		function testValid(x: number[], y: number[]) {
			const actual = Array.from(writePushData(new BufferWriter(), x).toBuffer());
			expect(Array.from(actual)).toEqual(y);
		}

		testValid([], [0]);
		testValid([0], [1, 0]);
		testValid([0, 0], [2, 0, 0]);
		testValid([1], [1, 1]);
		testValid([16], [1, 16]);
		testValid(new Array(0xff).fill(0), [76, 255].concat(new Array(0xff).fill(0)));
		testValid(new Array(0xff + 1).fill(0), [77, 0, 1].concat(new Array(0xff + 1).fill(0)));
		testValid(new Array(0xffff).fill(0), [77, 255, 255].concat(new Array(0xffff).fill(0)));
		testValid(new Array(0xffff + 1).fill(0), [78, 0, 0, 1, 0].concat(new Array(0xffff + 1).fill(0)));
	});

	test('throws if data too big', () => {
		const bigBuffer = Buffer.alloc(0);
		Object.defineProperty(bigBuffer, 'length', () => 0xffffffff + 1);
		expect(() => writePushData(new BufferWriter(), bigBuffer)).toThrow('data too large');
	});
});
