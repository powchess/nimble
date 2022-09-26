import bsv from 'bsv';
import { describe, test, expect } from 'vitest';
import nimble from '../..';

const { encodePushData } = nimble.functions;

describe('encodePushData', () => {
	test('valid', () => {
		function testValid(x: number[]) {
			const actual = Array.from(encodePushData(new Uint8Array(x)));
			const expected = Array.from(bsv.Script.fromASM(`${Buffer.from(x).toString('hex')}`).toBuffer());
			expect(actual).toEqual(expected);
		}

		testValid([]);
		testValid(new Array(0xff + 1).fill(0));
	});
});
