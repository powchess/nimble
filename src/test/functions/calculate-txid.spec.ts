import bsv from 'bsv';
import { describe, test, expect } from 'vitest';
import nimble from '../..';
import Transaction from '../../classes/transaction';

const { calculateTxid, encodeTx, encodeHex } = nimble.functions;

describe('calculateTxid', () => {
	test('calculates txid', () => {
		const tx = new Transaction();
		const bsvtx = new bsv.Transaction(encodeHex(encodeTx(tx)));
		const txid = calculateTxid(encodeTx(tx));
		expect(txid).toBe(bsvtx.hash);
	});
});
