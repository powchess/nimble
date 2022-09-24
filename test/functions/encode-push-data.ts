import nimble from '../env/nimble';
const { encodePushData } = nimble.functions;
import bsv from 'bsv';
import { describe, test, expect } from '@jest/globals';

describe('encodePushData', () => {
	test('valid', () => {
		function testValid(x: number[]) {
			const actual = Array.from(encodePushData(x));
			const expected = Array.from(bsv.Script.fromASM(`${Buffer.from(x).toString('hex')}`).toBuffer());
			expect(actual).toEqual(expected);
		}

		testValid([]);
		testValid(new Array(0xff + 1).fill(0));
	});
});
