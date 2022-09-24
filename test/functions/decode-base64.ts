import nimble from '../env/nimble';
const { decodeBase64 } = nimble.functions;
import { describe, test, expect } from '@jest/globals';

describe('decodeBase64', () => {
	test('decodes', () => {
		expect(Array.from(decodeBase64(''))).toEqual(Array.from(Buffer.from('')));
		expect(Array.from(decodeBase64('YQ=='))).toEqual(Array.from(Buffer.from('a')));
		expect(Array.from(decodeBase64('YWI='))).toEqual(Array.from(Buffer.from('ab')));
		expect(Array.from(decodeBase64('YWJj'))).toEqual(Array.from(Buffer.from('abc')));
		expect(Array.from(decodeBase64('YWJjZGVmZw=='))).toEqual(Array.from(Buffer.from('abcdefg')));
		expect(Array.from(decodeBase64('YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5'))).toEqual(
			Array.from(Buffer.from('abcdefghijklmnopqrstuvwxyz0123456789'))
		);
	});

	test('throws if bad', () => {
		expect(() => decodeBase64('1')).toThrow('length must be a multiple of 4');
		expect(() => decodeBase64('abc')).toThrow('length must be a multiple of 4');
	});
});
