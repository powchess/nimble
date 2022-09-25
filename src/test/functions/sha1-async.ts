import bsv from 'bsv';
import { describe, test, expect } from 'vitest';
import nimble from 'index';

const { sha1Async } = nimble.functions;

describe('ripemd160Async', () => {
	test('empty', async () => {
		const data: any[] = [];
		const expected = Array.from(bsv.crypto.Hash.sha1(bsv.deps.Buffer.from(data)));
		const actual = Array.from(await sha1Async(data));
		expect(actual).toEqual(expected);
	});
});
