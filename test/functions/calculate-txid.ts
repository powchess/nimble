import nimble from '../env/nimble';
const { calculateTxid, encodeTx, encodeHex } = nimble.functions;
import bsv from 'bsv';
import { describe, test, expect } from '@jest/globals';

describe('calculateTxid', () => {
	test('calculates txid', () => {
		const tx = { inputs: [], outputs: [{ script: [], satoshis: 100 }] };
		const bsvtx = new bsv.Transaction(encodeHex(encodeTx(tx)));
		const txid = calculateTxid(encodeTx(tx));
		expect(txid).toBe(bsvtx.hash);
	});
});
