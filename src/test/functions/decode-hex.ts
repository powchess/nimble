import { describe, test, expect } from 'vitest';
import nimble from 'index';

const { decodeHex } = nimble.functions;

describe('decodeHex', () => {
	test('empty', () => {
		expect(Array.from(decodeHex(''))).toEqual([]);
	});

	test('buffer', () => {
		expect(Array.from(decodeHex('001122'))).toEqual([0x00, 0x11, 0x22]);
	});

	test('incomplete', () => {
		expect(Array.from(decodeHex('102'))).toEqual([0x01, 0x02]);
	});

	test('throws if not a string', () => {
		expect(() => decodeHex()).toThrow('not a string');
		expect(() => decodeHex(null)).toThrow('not a string');
	});

	test('throws if not a hex char', () => {
		expect(() => decodeHex('z')).toThrow('bad hex char');
		expect(() => decodeHex('x!')).toThrow('bad hex char');
	});
});
