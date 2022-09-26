import { describe, test, expect } from 'vitest';
import nimble from '../..';

const { encodeHex } = nimble.functions;

describe('encodeHex', () => {
	test('empty', () => {
		expect(encodeHex([])).toBe('');
	});

	test('buffer', () => {
		expect(encodeHex([0x00, 0x11, 0x22])).toBe('001122');
	});
});
