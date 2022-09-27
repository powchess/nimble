/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-bitwise */
import bsv from 'bsv';
import { describe, test, expect } from 'vitest';
import nimble from '../..';
import Transaction, { Input } from '../../classes/transaction';

const { sighash, decodeHex, decodeTx } = nimble.functions;
const { SIGHASH_ALL, SIGHASH_NONE, SIGHASH_SINGLE, SIGHASH_ANYONECANPAY, SIGHASH_FORKID } =
	nimble.constants.sighashFlags;

describe('sighash', () => {
	test('all', async () => {
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
		const runSighash = await sighash(tx, 1, new Uint8Array([0x01]), 2000, SIGHASH_ALL | SIGHASH_FORKID);
		expect(bsvSighash).toEqual(runSighash);
	});

	test('none', async () => {
		const utxo = {
			txid: '0000000000000000000000000000000000000000000000000000000000000000',
			vout: 0,
			script: '00',
			satoshis: 1000,
		};
		const bsvtx = new bsv.Transaction().from(utxo);
		const bsvSighash = bsv.Transaction.Sighash.sighash(
			bsvtx,
			bsv.crypto.Signature.SIGHASH_NONE | bsv.crypto.Signature.SIGHASH_FORKID,
			0,
			new bsv.Script('00'),
			new bsv.deps.bnjs.BN(1000)
		).reverse();
		const tx = decodeTx(decodeHex(bsvtx.toString()));
		const runSighash = await sighash(tx, 0, new Uint8Array([0x00]), 1000, SIGHASH_NONE | SIGHASH_FORKID);
		expect(bsvSighash).toEqual(runSighash);
	});

	test('single', async () => {
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
			bsv.crypto.Signature.SIGHASH_SINGLE | bsv.crypto.Signature.SIGHASH_FORKID,
			0,
			new bsv.Script('00'),
			new bsv.deps.bnjs.BN(1000)
		).reverse();
		const tx = decodeTx(decodeHex(bsvtx.toString()));
		const runSighash = await sighash(tx, 0, new Uint8Array([0x00]), 1000, SIGHASH_SINGLE | SIGHASH_FORKID);
		expect(bsvSighash).toEqual(runSighash);
	});

	test('anyonecanpay', async () => {
		const utxo = {
			txid: '0000000000000000000000000000000000000000000000000000000000000000',
			vout: 0,
			script: '00',
			satoshis: 1000,
		};
		const addr = new bsv.PrivateKey().toAddress();
		const bsvtx = new bsv.Transaction().from(utxo).to(addr, 4000);
		const bsvSighash = bsv.Transaction.Sighash.sighash(
			bsvtx,
			bsv.crypto.Signature.SIGHASH_SINGLE |
				bsv.crypto.Signature.SIGHASH_ANYONECANPAY |
				bsv.crypto.Signature.SIGHASH_FORKID,
			0,
			new bsv.Script('00'),
			new bsv.deps.bnjs.BN(1000)
		).reverse();
		const tx = decodeTx(decodeHex(bsvtx.toString()));
		const runSighash = await sighash(
			tx,
			0,
			new Uint8Array([0x00]),
			1000,
			SIGHASH_SINGLE | SIGHASH_ANYONECANPAY | SIGHASH_FORKID
		);
		expect(bsvSighash).toEqual(runSighash);
	});

	test('supports no sequence, outputs, version, or locktime', async () => {
		const utxo = {
			txid: '0000000000000000000000000000000000000000000000000000000000000000',
			vout: 0,
			script: '00',
			satoshis: 1000,
		};
		const bsvtx = new bsv.Transaction().from(utxo);
		const bsvSighash = bsv.Transaction.Sighash.sighash(
			bsvtx,
			bsv.crypto.Signature.SIGHASH_ALL | bsv.crypto.Signature.SIGHASH_FORKID,
			0,
			new bsv.Script('00'),
			new bsv.deps.bnjs.BN(1000)
		).reverse();
		const tx = decodeTx(decodeHex(bsvtx.toString()));
		// @ts-ignore
		delete tx.version;
		// @ts-ignore
		delete tx.inputs[0].sequence;
		// @ts-ignore
		delete tx.outputs;
		// @ts-ignore
		delete tx.locktime;
		const runSighash = await sighash(tx, 0, new Uint8Array([0x00]), 1000, SIGHASH_ALL | SIGHASH_FORKID);
		expect(bsvSighash).toEqual(runSighash);
	});

	test('caches hashes', async () => {
		const txns = [];
		for (let i = 0; i < 1000; i++) {
			const input = new Input('0000000000000000000000000000000000000000000000000000000000000000', 0);
			const tx = new Transaction();
			tx.inputs.push(input);
			txns.push(tx);
		}
		const start1 = Date.now();
		const promises1 = [];
		for (const tx of txns) {
			promises1.push(sighash(tx, 0, new Uint8Array([0x00]), 1000, SIGHASH_ALL | SIGHASH_FORKID));
		}
		await Promise.all(promises1);
		const end1 = Date.now();

		const start2 = Date.now();
		const promises2 = [];
		for (const tx of txns) {
			promises2.push(sighash(tx, 0, new Uint8Array([0x00]), 1000, SIGHASH_ALL | SIGHASH_FORKID));
		}
		await Promise.all(promises2);
		const end2 = Date.now();
		expect(end2 - start2 <= end1 - start1).toBe(true);
	});
});
