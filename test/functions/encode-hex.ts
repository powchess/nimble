import nimble from '../env/nimble';
const { encodeHex } = nimble.functions;
import { describe, test, expect } from '@jest/globals';

describe('encodeHex', () => {
	test('empty', () => {
		expect(encodeHex([])).toBe('');
	});

	test('buffer', () => {
		expect(encodeHex([0x00, 0x11, 0x22])).toBe('001122');
	});
});
