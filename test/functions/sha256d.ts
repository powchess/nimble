import nimble from '../env/nimble';
const { sha256d } = nimble.functions;
import bsv from 'bsv';
import { describe, test, expect } from '@jest/globals';

describe('sha256', () => {
	test('valid', () => {
		const data = [1, 2, 3];
		const expected = Array.from(bsv.crypto.Hash.sha256(bsv.crypto.Hash.sha256(bsv.deps.Buffer.from(data))));
		const actual = Array.from(sha256d(data));
		expect(actual).toEqual(expected);
	});
});
