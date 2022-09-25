import { describe, test, expect } from 'vitest';
import nimble from 'index';

const { encodeDER, decodeDER } = nimble.functions;

describe('decodeDER', () => {
	test('decodes', () => {
		const signature = { r: new Array(20).fill(1), s: new Array(10).fill(2) };
		const der = encodeDER(signature);
		const signature2 = decodeDER(der);
		expect(Array.from(signature2.r)).toEqual(signature.r);
		expect(Array.from(signature2.s)).toEqual(signature.s);
	});

	test('negative', () => {
		const signature = { r: [0x80].concat(new Array(31).fill(0)), s: new Array(32).fill(255) };
		const der = encodeDER(signature);
		const signature2 = decodeDER(der);
		expect(Array.from(signature2.r)).toEqual(signature.r);
		expect(Array.from(signature2.s)).toEqual(signature.s);
	});

	test('throws if bad der', () => {
		const err = 'bad der';
		expect(() => decodeDER([0x00, 0x04, 0x02, 0, 0x02, 0])).toThrow(err);
		expect(() => decodeDER([0x30, 0x04, 0x03, 0, 0x02, 0])).toThrow(err);
		expect(() => decodeDER([0x30, 0x04, 0x02, 0, 0xff, 0])).toThrow(err);
		expect(() => decodeDER([0x30, 100, 0x02, 0, 0x02, 0])).toThrow(err);
	});

	test('throws if not enough data', () => {
		const err = 'not enough data';
		expect(() => decodeDER([])).toThrow(err);
		expect(() => decodeDER([0x30])).toThrow(err);
		expect(() => decodeDER([0x30, 0x00])).toThrow(err);
		expect(() => decodeDER([0x30, 0x04, 0x02, 0])).toThrow(err);
		expect(() => decodeDER([0x30, 0x04, 0x02, 0, 0x02, 1])).toThrow(err);
		expect(() => decodeDER([0x30, 0x04, 0x02, 3, 0x02, 1])).toThrow(err);
	});

	test('throws if unconsumed data', () => {
		const err = 'unconsumed data';
		expect(() => decodeDER([0x30, 0x04, 0x02, 0x00, 0x02, 0x00, 0xff])).toThrow(err);
	});
});
