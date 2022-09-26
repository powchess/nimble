import { describe, test, expect } from 'vitest';
import nimble from '../..';

const { decodeTx, encodeTx } = nimble.functions;

describe('decodeTx', () => {
	test('twice of buffer returns same value', () => {
		const tx = {
			version: 1,
			inputs: [
				{
					txid: '1234567812345678123456781234567812345678123456781234567812345678',
					vout: 1,
					script: [1, 2, 3],
					sequence: 88,
				},
			],
			outputs: [
				{
					script: [4, 5, 6],
					satoshis: 7,
				},
			],
			locktime: 100,
		};
		const buffer = Buffer.from(encodeTx(tx));
		const tx1 = decodeTx(buffer);
		const tx2 = decodeTx(buffer);
		expect(tx1).toEqual(tx2);
	});

	test('throws if not enough data', () => {
		const err = 'not enough data';
		expect(() => decodeTx([])).toThrow(err);
		expect(() => decodeTx([1, 0, 0, 0])).toThrow(err);
		expect(() => decodeTx([1, 0, 0, 0, 0])).toThrow(err);
		expect(() => decodeTx([1, 0, 0, 0, 0, 0])).toThrow(err);
		expect(() => decodeTx([1, 0, 0, 0, 0, 0, 0, 0, 0])).toThrow(err);
	});

	test('1gb tx', () => {
		const outputs = [];
		for (let i = 0; i < 1024; i++) {
			outputs.push({ script: new Uint8Array(1 * 1024 * 1024), satoshis: 123 });
		}
		const tx = { inputs: [], outputs };
		const buffer = encodeTx(tx);
		expect(buffer.length > 1024 * 1024 * 1024).toBe(true);
	}, 3000);
});
