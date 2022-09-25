import bsv from 'bsv';
import { describe, test, expect } from 'vitest';
import nimble from 'index';

const { sighashAsync, decodeHex, decodeTx } = nimble.functions;
const { SIGHASH_ALL, SIGHASH_FORKID } = nimble.constants.sighashFlags;

describe('sighash', () => {
	test('async', async () => {
		const utxo1 = {
			txid: '0000000000000000000000000000000000000000000000000000000000000000',
			vout: 0,
			script: '00',
			satoshis: 1000,
		};
		const utxo2 = {
			txid: '1111111111111111111111111111111111111111111111111111111111111111',
			vout: 1,
			script: '01',
			satoshis: 2000,
		};
		const addr = new bsv.PrivateKey().toAddress();
		const bsvtx = new bsv.Transaction().from(utxo1).from(utxo2).to(addr, 4000);
		const bsvSighash = bsv.Transaction.Sighash.sighash(
			bsvtx,
			bsv.crypto.Signature.SIGHASH_ALL | bsv.crypto.Signature.SIGHASH_FORKID,
			1,
			new bsv.Script('01'),
			new bsv.deps.bnjs.BN(2000)
		).reverse();
		const tx = decodeTx(decodeHex(bsvtx.toString()));
		const runSighash = await sighashAsync(tx, 1, [0x01], 2000, SIGHASH_ALL | SIGHASH_FORKID);
		expect(bsvSighash).toEqual(runSighash);
	});
});
