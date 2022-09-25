import bsv from 'bsv';
import { describe, test, expect } from 'vitest';
import nimble from 'index';

const { ripemd160Async } = nimble.functions;

describe('ripemd160Async', () => {
	test('empty', async () => {
		const data: any[] = [];
		const expected = Array.from(bsv.crypto.Hash.ripemd160(bsv.deps.Buffer.from(data)));
		const actual = Array.from(await ripemd160Async(data));
		expect(actual).toEqual(expected);
	});
});
