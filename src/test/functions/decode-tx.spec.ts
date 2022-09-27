import { describe, test, expect } from 'vitest';
import nimble from '../..';
import Script from '../../classes/script';
import Transaction, { Input, Output } from '../../classes/transaction';

const { decodeTx, encodeTx } = nimble.functions;

describe('decodeTx', () => {
	test('twice of buffer returns same value', () => {
		const tx = new Transaction();
		tx.version = 1;
		tx.locktime = 100;
		tx.inputs = [
			new Input(
				'1234567812345678123456781234567812345678123456781234567812345678',
				1,
				new Script(new Uint8Array([1, 2, 3])),
				88,
				new Output(new Uint8Array([4, 5, 6]), 7)
			),
		];
		tx.outputs = [new Output(new Uint8Array([4, 5, 6]), 7)];

		const buffer = Buffer.from(encodeTx(tx));
		const tx1 = decodeTx(buffer);
		const tx2 = decodeTx(buffer);
		expect(tx1).toEqual(tx2);
	});

	test('throws if not enough data', () => {
		const err = 'not enough data';
		expect(() => decodeTx(new Uint8Array([]))).toThrow(err);
		expect(() => decodeTx(new Uint8Array([1, 0, 0, 0]))).toThrow(err);
		expect(() => decodeTx(new Uint8Array([1, 0, 0, 0, 0]))).toThrow(err);
		expect(() => decodeTx(new Uint8Array([1, 0, 0, 0, 0, 0]))).toThrow(err);
		expect(() => decodeTx(new Uint8Array([1, 0, 0, 0, 0, 0, 0, 0, 0]))).toThrow(err);
	});

	test('1gb tx', () => {
		const outputs = [];
		for (let i = 0; i < 1024; i++) {
			outputs.push({ script: new Uint8Array(1 * 1024 * 1024), satoshis: 123 });
		}
		const tx = new Transaction();
		const buffer = encodeTx(tx);
		expect(buffer.length > 1024 * 1024 * 1024).toBe(true);
	}, 3000);
});
