import bsv from 'bsv';
import { describe, test, expect } from 'vitest';
import nimble from '../..';
import Transaction, { Input, Output } from '../../classes/transaction';

const { PrivateKey } = nimble;
const { verifyTxSignature, encodeHex, sha256d, encodeTx, createP2PKHLockScript, decodeHex } = nimble.functions;

describe('verifyTxSignature', () => {
	test('validates bsv library signature', async () => {
		for (let i = 0; i < 10; i++) {
			const privateKey = PrivateKey.fromRandom();
			const publicKey = privateKey.toPublicKey();

			const parentSatoshis = 123;
			const parentScript = createP2PKHLockScript(privateKey.toAddress().pubkeyhash);

			const parentTx = new Transaction();
			parentTx.outputs = [new Output(parentScript, parentSatoshis)];

			const parentTxid = encodeHex(sha256d(encodeTx(parentTx)).reverse());

			const tx = new Transaction();
			const input = new Input(parentTxid, 0);
			tx.inputs.push(input);

			const vin = 0;

			const bsvtx = new bsv.Transaction(encodeHex(encodeTx(tx)));
			bsvtx.inputs[0].output = new bsv.Transaction.Output({
				satoshis: parentSatoshis,
				script: new bsv.Script(encodeHex(parentScript)),
			});
			Object.setPrototypeOf(bsvtx.inputs[0], bsv.Transaction.Input.PublicKeyHash.prototype);
			const bsvPrivateKey = new bsv.PrivateKey(privateKey.toString());

			bsvtx.sign(bsvPrivateKey);

			const txsignature = bsvtx.inputs[0].script.chunks[0].buf;

			const verified1 = verifyTxSignature(tx, vin, txsignature, publicKey.point, parentScript, parentSatoshis);
			expect(verified1).toBe(true);
		}
	});

	test('returns false if signature does not validate', async () => {
		const privateKey = PrivateKey.fromRandom();
		const publicKey = privateKey.toPublicKey();

		const parentSatoshis = 123;
		const parentScript = createP2PKHLockScript(privateKey.toAddress().pubkeyhash);

		const parentTx = new Transaction();
		parentTx.outputs = [new Output(parentScript, parentSatoshis)];

		const parentTxid = encodeHex(sha256d(encodeTx(parentTx)).reverse());

		const tx = new Transaction();
		const input = new Input(parentTxid, 0);
		tx.inputs.push(input);

		const vin = 0;

		const badTxSignature = decodeHex(
			'3045022100fa477f79af22e87989e8a00c2bd20554d8fe78988ff1ff688e7227fb36ae5e2d0220072bbbf1e0ee223e483a8b4f87f2ddf1dbf8f4c38aef08c5f3e2dc1919de37a141'
		);

		const verified1 = verifyTxSignature(tx, vin, badTxSignature, publicKey.point, parentScript, parentSatoshis);
		expect(verified1).toBe(false);
	});
});
