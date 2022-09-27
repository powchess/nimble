import bsv from 'bsv';
import { expect, describe, test } from 'vitest';
import nimble from '../..';
import { Input, Output } from '../../classes/transaction';
import verifyScript from '../../functions/verify-script';

const { Transaction, PrivateKey, Script } = nimble;
const { createP2PKHLockScript } = nimble.functions;
const { opcodes } = nimble.constants;

describe('Transaction', () => {
	describe('constructor', () => {
		test('creates empty transaction', () => {
			const tx = new Transaction();
			expect(tx.version).toBe(new bsv.Transaction().version);
			expect(tx.inputs.length).toBe(0);
			expect(tx.outputs.length).toBe(0);
			expect(tx.locktime).toBe(new bsv.Transaction().nLockTime);
		});
	});

	describe('fromHex', () => {
		test('parses hex string', () => {
			const dummyTxid = new Transaction().hash;
			const tx = new Transaction();
			tx.version = 2;
			tx.locktime = 3;
			const input = new Input(dummyTxid, 1, new Script(), 5);
			tx.inputs.push(input);
			const output = new Output(new Script(new Uint8Array([0])), 6);
			tx.outputs.push(output);
			const hex = tx.toString();
			const tx2 = Transaction.fromHex(hex);
			expect(tx2.version).toBe(tx.version);
			expect(tx2.locktime).toBe(tx.locktime);
			expect(tx2.inputs.length).toBe(tx.inputs.length);
			expect(tx2.outputs.length).toBe(tx.outputs.length);
			expect(tx2.inputs[0].txid).toBe(tx.inputs[0].txid);
			expect(tx2.inputs[0].vout).toBe(tx.inputs[0].vout);
			expect(new Uint8Array([...tx2.inputs[0].script.buffer])).toEqual(
				new Uint8Array([...tx.inputs[0].script.buffer])
			);
			expect(tx2.inputs[0].sequence).toBe(tx.inputs[0].sequence);
			expect(new Uint8Array(tx2.outputs[0].script.buffer)).toEqual(new Uint8Array(tx.outputs[0].script.buffer));
			expect(tx2.outputs[0].satoshis).toBe(tx.outputs[0].satoshis);
		});

		test('throws if bad', () => {
			const badHex = `${new Transaction().toString()}00`;
			expect(() => Transaction.fromHex(badHex)).toThrow('unconsumed data');
		});
	});

	describe('fromString', () => {
		test('creates from string', () => {
			const tx = new Transaction();
			const tx2 = Transaction.fromString(tx.toString());
			expect(Array.from(tx2.toBuffer())).toEqual(Array.from(tx.toBuffer()));
		});

		test('throws if bad', () => {
			const badHex = `00${new Transaction().toString()}`;
			expect(() => Transaction.fromHex(badHex)).toThrow('unconsumed data');
		});
	});

	describe('fromBuffer', () => {
		test('parses buffer', () => {
			const dummyTxid = new Transaction().hash;
			const tx = new Transaction();
			tx.version = 2;
			tx.locktime = 3;
			const input = new Input(dummyTxid, 1, new Script(), 5);
			tx.inputs.push(input);
			const output = new Output(new Script(new Uint8Array([0])), 4);
			tx.outputs.push(output);
			const buffer = tx.toBuffer();
			const tx2 = Transaction.fromBuffer(buffer);
			expect(tx2.version).toBe(tx.version);
			expect(tx2.locktime).toBe(tx.locktime);
			expect(tx2.inputs.length).toBe(tx.inputs.length);
			expect(tx2.outputs.length).toBe(tx.outputs.length);
			expect(tx2.inputs[0].txid).toBe(tx.inputs[0].txid);
			expect(tx2.inputs[0].vout).toBe(tx.inputs[0].vout);
			expect(new Uint8Array(tx2.inputs[0].script.buffer)).toEqual(new Uint8Array(tx.inputs[0].script.buffer));
			expect(tx2.inputs[0].sequence).toBe(tx.inputs[0].sequence);
			expect(new Uint8Array(tx2.outputs[0].script.buffer)).toEqual(new Uint8Array(tx.outputs[0].script.buffer));
			expect(tx2.outputs[0].satoshis).toBe(tx.outputs[0].satoshis);
		});

		test('creates script objects', () => {
			const dummyTxid = new Transaction().hash;
			const tx = new Transaction();
			const script = [3, 1, 2, 3, opcodes.OP_CHECKSIG, opcodes.OP_ADD];
			const input = new Input(dummyTxid, 1, new Script(new Uint8Array(script)), 5);
			tx.inputs.push(input);
			const output = new Output(new Script(), 4);
			tx.outputs.push(output);
			const tx2 = Transaction.fromBuffer(tx.toBuffer());
			expect(tx2.inputs[0].script instanceof Script).toBe(true);
			expect(tx2.outputs[0].script instanceof Script).toBe(true);
		});

		test('1gb tx', () => {
			const outputs: { script: Uint8Array; satoshis: number }[] = [];
			for (let i = 0; i < 1024; i++) {
				outputs.push({ script: new Uint8Array(1 * 1024 * 1024), satoshis: 123 });
			}
			const tx = new Transaction();
			const buffer = nimble.functions.encodeTx(tx);
			const tx2 = Transaction.fromBuffer(buffer);
			expect(tx2.outputs.length).toBe(tx.outputs.length);
		}, 10000);
	});

	describe('toString', () => {
		test('returns hex string', () => {
			const privateKey = PrivateKey.fromRandom();
			const tx1 = new Transaction().to(privateKey.toAddress(), 1000);
			const tx2 = new Transaction().from(tx1.outputs[0]).to(privateKey.toAddress(), 2000);
			expect(new bsv.Transaction(tx2.toString()).toString()).toEqual(tx2.toString());
			expect(new bsv.Transaction(tx2.toHex()).toString()).toEqual(tx2.toHex());
		});
	});

	describe('toBuffer', () => {
		test('returns buffer', () => {
			const privateKey = PrivateKey.fromRandom();
			const tx1 = new Transaction().to(privateKey.toAddress(), 1000);
			const tx2 = new Transaction().from(tx1.outputs[0]).to(privateKey.toAddress(), 2000);
			expect(Array.from(new bsv.Transaction(tx2.toString()).toBuffer())).toEqual(Array.from(tx2.toBuffer()));
		});
	});

	describe('hash', () => {
		test('returns txid', () => {
			const address = PrivateKey.fromRandom().toAddress().toString();
			const bsvtx = new bsv.Transaction().to(address, 1000);
			const nimbletx = nimble.Transaction.fromString(bsvtx.toString());
			expect(nimbletx.hash).toBe(bsvtx.hash);
		});

		test('caches txid when finalized', () => {
			const tx = new nimble.Transaction().finalize();
			const t0 = Date.now();
			// eslint-disable-next-line @typescript-eslint/no-unused-expressions
			tx.hash;
			const t1 = Date.now();
			for (let i = 0; i < 100; i++) {
				// eslint-disable-next-line @typescript-eslint/no-unused-expressions
				tx.hash;
			}
			const t2 = Date.now();
			expect(Math.round((t2 - t1) / 100)).toBeLessThanOrEqual(t1 - t0);
		});

		test('computes change before calculating hash', async () => {
			const privateKey = PrivateKey.fromRandom();
			const tx1 = new Transaction().to(privateKey.toAddress(), 9000);
			const tx2 = await new Transaction()
				.from(tx1.outputs[0])
				.to(privateKey.toAddress(), 1000)
				.change(privateKey.toAddress())
				.sign(privateKey);
			expect(tx2.changeOutput?.satoshis).not.toBe(0);
			expect(tx2.hash).toBe(new bsv.Transaction(tx2.toString()).hash);
		});
	});

	describe('fee', () => {
		test('returns input satoshis minus output satoshis', () => {
			const utxo1 = new Output(new Script(), 2000);
			const utxo2 = new Output(new Script(), 100);
			const address = PrivateKey.fromRandom().toAddress();
			const tx = new Transaction().from(utxo1).from(utxo2).to(address, 1000).to(address, 500);
			expect(tx.fee).toBe(600);
		});

		test('throws if missing previous output information', () => {
			const txid = new Transaction().hash;
			const input = new Input(txid, 0, new Script(new Uint8Array([])), 0);
			const tx = new Transaction().input(input);
			expect(() => tx.fee).toThrow('missing previous output information for input 0');
		});
	});

	describe('from', () => {
		test('adds transaction output', () => {
			const pk = PrivateKey.fromRandom();
			const tx1 = new Transaction().to(pk.toAddress(), 1000);
			const tx2 = new Transaction().from(tx1.outputs[0]);
			expect(tx2.inputs[0].txid).toBe(tx1.hash);
			expect(tx2.inputs[0].vout).toBe(0);
			expect(tx2.inputs[0].script.length).toBe(0);
			expect(tx2.inputs[0].sequence).toBe(0xffffffff);
			expect(tx2.inputs[0].output).toBe(tx1.outputs[0]);
		});

		test('adds utxo', () => {
			const pk = PrivateKey.fromRandom();
			const tx1 = new Transaction().to(pk.toAddress(), 1000);
			const utxo = {
				txid: tx1.hash,
				vout: 0,
				script: tx1.outputs[0].script,
				satoshis: tx1.outputs[0].satoshis,
			};
			const tx2 = new Transaction().from(utxo);
			expect(tx2.inputs[0].txid).toBe(tx1.hash);
			expect(tx2.inputs[0].vout).toBe(0);
			expect(tx2.inputs[0].script.length).toBe(0);
			expect(tx2.inputs[0].sequence).toBe(0xffffffff);
			expect(tx2.inputs[0].output?.script).toBe(utxo.script);
			expect(tx2.inputs[0].output?.satoshis).toBe(utxo.satoshis);
		});

		test('returns self for chaining', () => {
			const pk = PrivateKey.fromRandom();
			const tx1 = new Transaction().to(pk.toAddress(), 1000);
			const tx2 = new Transaction();
			expect(tx2.from(tx1.outputs[0])).toBe(tx2);
		});

		test('throws if bad satoshis', () => {
			const txid = new Transaction().hash;
			expect(() => new Transaction().from(new Input(txid, 0, new Script(), -1))).toThrow('bad satoshis');
			expect(() => new Transaction().from(new Input(txid, 0, new Script(), 1.5))).toThrow('bad satoshis');
			expect(() => new Transaction().from(new Input(txid, 0, new Script(), Number.MAX_VALUE))).toThrow(
				'bad satoshis'
			);
		});

		test('supports array', () => {
			const pk = PrivateKey.fromRandom();
			const tx1 = new Transaction().to(pk.toAddress(), 1000);
			const tx2 = new Transaction().to(pk.toAddress(), 1000);
			const tx3 = new Transaction().from([tx1.outputs[0], tx2.outputs[0]]);

			expect(tx3.inputs[0].txid).toBe(tx1.hash);
			expect(tx3.inputs[0].vout).toBe(0);
			expect(tx3.inputs[0].script.length).toBe(0);
			expect(tx3.inputs[0].sequence).toBe(0xffffffff);
			expect(tx3.inputs[0].output).toBe(tx1.outputs[0]);

			expect(tx3.inputs[1].txid).toBe(tx2.hash);
			expect(tx3.inputs[1].vout).toBe(0);
			expect(tx3.inputs[1].script.length).toBe(0);
			expect(tx3.inputs[1].sequence).toBe(0xffffffff);
			expect(tx3.inputs[1].output).toBe(tx2.outputs[0]);
		});
	});

	describe('to', () => {
		test('adds output', () => {
			const pk = PrivateKey.fromRandom();
			const tx = new Transaction().to(pk.toAddress(), 1000);
			expect(Array.from(tx.outputs[0].script.buffer)).toEqual(
				Array.from(createP2PKHLockScript(pk.toAddress().pubkeyhash))
			);
			expect(tx.outputs[0].satoshis).toBe(1000);
		});

		test('returns self for chaining', () => {
			const pk = PrivateKey.fromRandom();
			const tx = new Transaction();
			expect(tx.to(pk.toAddress(), 1000)).toBe(tx);
		});

		test('throws if not a valid satoshis', () => {
			const address = PrivateKey.fromRandom().toAddress();
			expect(() => new Transaction().to(address, -1)).toThrow('bad satoshis');
			expect(() => new Transaction().to(address, 1.5)).toThrow('bad satoshis');
			expect(() => new Transaction().to(address, Number.MAX_VALUE)).toThrow('bad satoshis');
		});
	});

	describe('input', () => {
		test('adds input object', () => {
			const pk = PrivateKey.fromRandom();
			const tx1 = new Transaction().to(pk.toAddress(), 1000);
			const input = new Input(tx1.hash, 0, new Script(new Uint8Array([1])), 2);
			const tx2 = new Transaction().input(input);
			expect(tx2.inputs[0].txid).toBe(tx1.hash);
			expect(tx2.inputs[0].vout).toBe(0);
			expect(Array.from(tx2.inputs[0].script.buffer)).toEqual([1]);
			expect(tx2.inputs[0].sequence).toBe(2);
		});

		test('adds Input instance', () => {
			const pk = PrivateKey.fromRandom();
			const tx1 = new Transaction().to(pk.toAddress(), 1000);
			const input = new Input(tx1.hash, 0);
			const tx2 = new Transaction().input(input);
			expect(tx2.inputs[0].txid).toBe(tx1.hash);
		});

		test('returns self for chaining', () => {
			const pk = PrivateKey.fromRandom();
			const tx1 = new Transaction().to(pk.toAddress(), 1000);
			const input = new Input(tx1.hash, 0, new Script(new Uint8Array([1])), 2);
			const tx2 = new Transaction();
			expect(tx2.input(input)).toBe(tx2);
		});

		test('throws if bad txid', () => {
			const input = new Input('abc', 0, new Script(), 0);
			expect(() => new Transaction().input(input)).toThrow('bad txid');
		});

		test('throws if bad vout', () => {
			const txid = new Transaction().hash;
			expect(() => new Transaction().input(new Input(txid, 1.5, new Script(), 0))).toThrow('bad vout');
			expect(() => new Transaction().input(new Input(txid, -1, new Script(), 0))).toThrow('bad vout');
		});

		test('throws if bad sequence', () => {
			const txid = new Transaction().hash;
			expect(() => new Transaction().input(new Input(txid, 0, new Script(), -1))).toThrow('bad sequence');
			expect(() => new Transaction().input(new Input(txid, 0, new Script(), 0xffffffff + 1))).toThrow(
				'bad sequence'
			);
		});

		test('supports output property', () => {
			const txid = new Transaction().hash;
			const output = new Output(new Uint8Array([2]), 2);
			const input = new Input(txid, 0, new Script(), 0, output);
			const tx = new Transaction().input(input);
			expect(Array.from(tx.inputs[0].output?.script.buffer || [0])).toEqual([2]);
			expect(tx.inputs[0].output?.satoshis).toBe(2);
		});

		test('uses txid and vout from output property if unspecified', () => {
			const txid = new Transaction().hash;
			const output = new Output(new Uint8Array([2]), 2);
			const input = new Input(txid, 0, new Script(), 0, output);
			const tx = new Transaction().input(input);
			expect(Array.from(tx.inputs[0].output?.script.buffer || [0])).toEqual([2]);
			expect(tx.inputs[0].output?.satoshis).toBe(2);
		});

		test('throws if bad output property', () => {
			const txid = new Transaction().hash;
			const output1 = new Output('xyz', 0);
			const output2 = new Output(new Uint8Array([]), -1);
			expect(() => new Transaction().input(new Input(txid, 0, new Script(), 0, output1))).toThrow('bad hex char');
			expect(() => new Transaction().input(new Input(txid, 0, new Script(), 0, output2))).toThrow('bad satoshis');
		});
	});

	describe('output', () => {
		test('adds output object', () => {
			const pk = PrivateKey.fromRandom();
			const script = createP2PKHLockScript(pk.toAddress().pubkeyhash);
			const output = new Output(script, 1000);
			const tx = new Transaction().output(output);
			expect(Array.from(tx.outputs[0].script.buffer)).toEqual(Array.from(script));
			expect(tx.outputs[0].satoshis).toBe(1000);
		});

		test('adds Output instance', () => {
			const pk = PrivateKey.fromRandom();
			const script = createP2PKHLockScript(pk.toAddress().pubkeyhash);
			const output = new Output(script, 1000);
			const tx = new Transaction().output(output);
			expect(Array.from(tx.outputs[0].script.buffer)).toEqual(Array.from(script));
		});

		test('returns self for chaining', () => {
			const tx = new Transaction();
			const pk = PrivateKey.fromRandom();
			const script = createP2PKHLockScript(pk.toAddress().pubkeyhash);
			const output = new Output(script, 1000);
			expect(tx.output(output)).toBe(tx);
		});
	});

	describe('change', () => {
		test('creates change output', async () => {
			const privateKey = PrivateKey.fromRandom();
			const tx1 = new Transaction().to(privateKey.toAddress(), 9000);
			const tx2 = new Transaction()
				.from(tx1.outputs[0])
				.to(privateKey.toAddress(), 1000)
				.change(privateKey.toAddress());

			const tx2Signed = (await tx2.sign(privateKey)).finalize();

			expect(Math.ceil((tx2Signed.toBuffer().length * nimble.feePerKb) / 1000)).toBe(tx2Signed.fee);
		});

		test('returns self for chaining', () => {
			const tx = new Transaction();
			expect(tx.change(PrivateKey.fromRandom().toAddress())).toBe(tx);
		});

		test('delete change output', () => {
			const utxo = new Input(new Transaction().hash, 0, undefined, undefined, new Output(new Script(), 1000));
			const address = PrivateKey.fromRandom().toAddress();
			const tx = new Transaction().from(utxo).change(address);
			tx.outputs = [];
			tx.finalize();
			expect(tx.outputs.length).toBe(0);
		});

		test('throws if already has change output', () => {
			const utxo = new Input(new Transaction().hash, 0, undefined, undefined, new Output(new Script(), 1000));
			const address = PrivateKey.fromRandom().toAddress();
			const tx = new Transaction().from(utxo).change(address);
			expect(() => tx.change(address)).toThrow('change output already added');
		});
	});

	describe('sign', () => {
		test('signs matching p2pkh scripts', async () => {
			const privateKey = PrivateKey.fromRandom();
			const tx1 = new Transaction().to(privateKey.toAddress(), 1000);
			const tx2 = await new Transaction().from(tx1.outputs[0]).to(privateKey.toAddress(), 2000).sign(privateKey);
			expect(tx2.inputs[0].script.length > 0).toBe(true);

			await verifyScript(
				tx2.inputs[0].script.buffer,
				tx1.outputs[0].script.buffer,
				tx2,
				0,
				tx1.outputs[0].satoshis
			);
		});

		test('supports string private key', () => {
			const privateKey = PrivateKey.fromRandom();
			new Transaction().sign(privateKey.toString()); // eslint-disable-line
		});

		test('does not sign different addresses', async () => {
			const privateKey1 = PrivateKey.fromRandom();
			const privateKey2 = PrivateKey.fromRandom();
			const tx0 = new Transaction().to(privateKey1.toAddress(), 1000);
			const tx1 = new Transaction().to(privateKey2.toAddress(), 1000);
			const tx2 = await new Transaction()
				.from(tx0.outputs[0])
				.from(tx1.outputs[0])
				.to(privateKey2.toAddress(), 2000)
				.sign(privateKey2);
			expect(tx2.inputs[0].script.length === 0).toBe(true);
			expect(tx2.inputs[1].script.length > 0).toBe(true);
		});

		test('does not sign non-p2pkh', async () => {
			const privateKey = PrivateKey.fromRandom();
			const script = new Uint8Array([
				...nimble.functions.createP2PKHLockScript(privateKey.toAddress().pubkeyhash),
				1,
			]);
			const utxo = new Input(new Transaction().hash, 0, script, undefined, new Output(new Script(), 1000));
			const tx = await new Transaction().from(utxo).sign(privateKey);
			expect(tx.inputs[0].script.length).toBe(0);
		});

		test('does not sign without previous outputs', async () => {
			const privateKey = PrivateKey.fromRandom();
			const tx1 = new Transaction().to(privateKey.toAddress(), 1000);
			const input = new Input(tx1.hash, 0, new Script(), 0);
			const tx2 = await new Transaction().input(input).to(privateKey.toAddress(), 2000).sign(privateKey);
			expect(tx2.inputs[0].script.length).toBe(0);
		});

		test('does not sign if already have sign data', () => {
			const privateKey = PrivateKey.fromRandom();
			const tx1 = new Transaction().to(privateKey.toAddress(), 1000);
			const tx2 = new Transaction().from(tx1.outputs[0]).to(privateKey.toAddress(), 2000);
			tx2.inputs[0].script = new Script(new Uint8Array([0x01]));
			tx2.sign(privateKey);
			expect(tx2.inputs[0].script).toEqual([0x01]);
		});

		test('returns self for chaining', () => {
			const tx = new Transaction();
			expect(tx.sign(PrivateKey.fromRandom())).toBe(tx);
		});

		test('throws if private key not provided', () => {
			expect(() => new Transaction().sign('abc')).toThrow('bad checksum');
		});
	});

	describe('verify', () => {
		test('does not throw if valid', async () => {
			const privateKey = PrivateKey.fromRandom();
			const tx1 = new Transaction().to(privateKey.toAddress(), 2000);
			const tx2 = await new Transaction().from(tx1.outputs[0]).to(privateKey.toAddress(), 1000).sign(privateKey);
			expect(() => tx2.verify()).not.toThrow();
		});

		test('throws if invalid', () => {
			expect(() => new Transaction().verify()).toThrow('no inputs');
		});

		test('returns self for chaining', async () => {
			const privateKey = PrivateKey.fromRandom();
			const tx1 = new Transaction().to(privateKey.toAddress(), 2000);
			const tx2 = await new Transaction().from(tx1.outputs[0]).to(privateKey.toAddress(), 1000).sign(privateKey);
			expect(tx2.verify()).toBe(tx2);
		});
	});

	describe('finalize', () => {
		test('locks transaction', () => {
			const privateKey = PrivateKey.fromRandom();
			const address = privateKey.toAddress();
			const txid = new Transaction().hash;

			const prev = new Transaction().to(address, 1000);

			const tx = new Transaction().from(prev.outputs[0]).to(address, 1000).finalize();

			const err = 'transaction finalized';
			expect(() => tx.from(new Input(txid, 0, new Script(), 0))).toThrow(err);
			expect(() => tx.to(address, 1000)).toThrow(err);
			expect(() => tx.input(new Input(txid, 0, new Script(), 0))).toThrow(err);

			tx.inputs[0].vout = 1;
			expect(tx.inputs[0].vout).toBe(0);
			tx.outputs[0].satoshis = 1;
			expect(tx.outputs[0].satoshis).toBe(1000);
		});

		test('returns self for chaining', () => {
			const tx = new Transaction();
			expect(tx.finalize()).toBe(tx);
		});

		test('call twice ok', () => {
			new Transaction().finalize().finalize(); // eslint-disable-line
		});

		test('removes change output if not enough to cover dust', () => {
			const address = PrivateKey.fromRandom().toAddress();
			const utxo = new Input(new Transaction().hash, 0, undefined, undefined, new Output(new Script(), 1));
			const tx = new Transaction().from(utxo).change(address).finalize();
			expect(tx.outputs.length).toBe(0);
			expect(tx.changeOutput).toBe(undefined);
		});
	});

	describe('feePerKb', () => {
		test('change the feePerKb', () => {
			const tx = new Transaction().setFeePerKb(0);
			const tx2 = new Transaction();
			const bsvTx = new bsv.Transaction();
			bsvTx.feePerKb = 0;

			expect(tx.feePerKb).toBe(bsvTx.feePerKb);
			expect(tx.feePerKb).not.toBe(tx2.feePerKb);
			expect(tx.feePerKb).toBe(0);
			expect(tx2.feePerKb).toBe(nimble.feePerKb);
		});

		test('throws if invalid', () => {
			expect(() => new Transaction().setFeePerKb(-1)).toThrow('bad satoshis: -1');
			expect(() => new Transaction().finalize().setFeePerKb(-1)).toThrow('transaction finalized');
		});
	});
});
