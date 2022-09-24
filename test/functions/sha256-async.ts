import nimble from '../env/nimble';
const { sha256Async } = nimble.functions;
import bsv from 'bsv';
import { describe, test, expect } from '@jest/globals';

describe('ripemd160Async', () => {
	test('empty', async () => {
		const data: number[] = [];
		const expected = Array.from(bsv.crypto.Hash.sha256(bsv.deps.Buffer.from(data)));
		const actual = Array.from(await sha256Async(data));
		expect(actual).toEqual(expected);
	});
});
