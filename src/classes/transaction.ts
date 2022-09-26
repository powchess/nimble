/* eslint-disable max-classes-per-file */
import PublicKey from './public-key';
import generateTxSignature from '../functions/generate-tx-signature';
import createP2PKHLockScript from '../functions/create-p2pkh-lock-script';
import encodeHex from '../functions/encode-hex';
import decodeHex from '../functions/decode-hex';
import extractP2PKHLockScriptPubkeyhash from '../functions/extract-p2pkh-lock-script-pubkeyhash';
import isHex from '../functions/is-hex';
import isP2PKHLockScript from '../functions/is-p2pkh-lock-script';
import writePushData from '../functions/write-push-data';
import areBuffersEqual from '../functions/are-buffers-equal';
import decodeTx from '../functions/decode-tx';
import encodeTx from '../functions/encode-tx';
import calculateTxid from '../functions/calculate-txid';
import BufferWriter from './buffer-writer';
import isBuffer from '../functions/is-buffer';
import verifyTx from '../functions/verify-tx';
import PrivateKey from './private-key';
import Address from './address';
import Script from './script';
import nimble from '../index';

// These WeakMap caches allow the objects themselves to maintain their immutability
const TRANSACTION_TO_TXID_CACHE = new WeakMap();

function verifySatoshis(satoshis: number) {
	if (!Number.isInteger(satoshis) || satoshis < 0 || satoshis > Number.MAX_SAFE_INTEGER) {
		throw new Error(`bad satoshis: ${satoshis}`);
	}
	return satoshis;
}

function verifySequence(sequence: number) {
	if (!Number.isInteger(sequence) || sequence < 0 || sequence > 0xffffffff) {
		throw new Error(`bad sequence: ${sequence}`);
	}
	return sequence;
}

export class Input {
	txid: string;

	vout: number;

	script: Script;

	sequence: number;

	output: Output;

	constructor(
		txid: string,
		vout: number,
		output: Output,
		script: Script | Uint8Array | string = new Uint8Array([]),
		sequence = 0
	) {
		if (!isHex(txid) || txid.length !== 64) throw new Error(`bad txid: ${txid}`);
		if (!Number.isInteger(vout) || vout < 0) throw new Error(`bad vout: ${vout}`);

		this.txid = txid;
		this.vout = vout;
		this.script = Script.from(script);
		this.sequence = verifySequence(sequence);
		this.output = output;
	}
}

export class Output {
	script: Script;

	satoshis: number;

	constructor(script: Script | Uint8Array | string, satoshis: number) {
		this.script = Script.from(script);
		this.satoshis = verifySatoshis(satoshis);
	}
}

export default class Transaction {
	version: number;

	inputs: Input[];

	outputs: Output[];

	locktime: number;

	feePerKb: number;

	changeOutput: Output | undefined;

	_hashPrevouts: Uint8Array | undefined;

	_hashSequence: Uint8Array | undefined;

	_hashOutputsAll: Uint8Array | undefined;

	Input = Input;

	Output = Output;

	constructor() {
		// This basic data structure matches what the functions encodeTx and decodeTx expect
		this.version = 1;
		this.inputs = [];
		this.outputs = [];
		this.locktime = 0;
		this.feePerKb = nimble.feePerKb;

		// An actual output object matching an entry in this.outputs
		this.changeOutput = undefined;
	}

	static fromHex(hex: string): Transaction {
		const buffer = decodeHex(hex);
		return Transaction.fromBuffer(buffer);
	}

	static fromString(hex: string): Transaction {
		return this.fromHex(hex);
	}

	static fromBuffer(buffer: Uint8Array): Transaction {
		if (!isBuffer(buffer)) throw new Error('not a buffer');
		const txData = decodeTx(buffer);

		const tx = new this();
		txData.inputs.forEach((inp) => tx.input(inp));
		txData.outputs.forEach((out) => tx.output(out));
		tx.locktime = txData.locktime;
		tx.version = txData.version;

		return tx;
	}

	toHex(): string {
		return encodeHex(this.toBuffer());
	}

	toString() {
		return this.toHex();
	}

	toBuffer() {
		// eslint-disable-next-line no-underscore-dangle
		this.calculateChange();
		return encodeTx(this);
	}

	get hash() {
		if (Object.isFrozen(this)) {
			if (TRANSACTION_TO_TXID_CACHE.has(this)) return TRANSACTION_TO_TXID_CACHE.get(this);
			const txid = calculateTxid(this.toBuffer());
			TRANSACTION_TO_TXID_CACHE.set(this, txid);
			return txid;
		}

		return calculateTxid(this.toBuffer());
	}

	get fee() {
		const incompleteInputIndex = this.inputs.findIndex((x) => !x.output);
		if (incompleteInputIndex !== -1) {
			const hint = `Hint: Set tx.inputs[${incompleteInputIndex}].output = new Transaction.Output(script, satoshis)`;
			throw new Error(`missing previous output information for input ${incompleteInputIndex}\n\n${hint}`);
		}

		const satoshisIn = this.inputs.reduce((prev, curr) => prev + curr.output.satoshis, 0);
		const satoshisOut = this.outputs.reduce((prev, curr) => prev + curr.satoshis, 0);

		return satoshisIn - satoshisOut;
	}

	from(output: Output | Output[], tx: Transaction | Transaction[]) {
		if (Object.isFrozen(this)) throw new Error('transaction finalized');

		if (Array.isArray(output)) {
			output.forEach((out) => this.from(out, tx));
			return this;
		}

		const transactions = Array.isArray(tx) ? tx : [tx];
		const transaction = transactions.find((transx) => transx.outputs.indexOf(output) >= 0);
		if (!transaction) return this;

		const vout = transaction.outputs.indexOf(output);
		const txid = transaction.hash;

		const input = new Input(txid, vout, output, new Uint8Array([]), 0xffffffff);
		this.inputs.push(input);

		return this;
	}

	to(address: string | PublicKey | Address, satoshis: number) {
		if (Object.isFrozen(this)) throw new Error('transaction finalized');

		const newAddress = Address.from(address);
		verifySatoshis(satoshis);

		const script = createP2PKHLockScript(newAddress.pubkeyhash);
		const output = new Output(script, satoshis);
		this.outputs.push(output);

		return this;
	}

	input(input: Input) {
		if (Object.isFrozen(this)) throw new Error('transaction finalized');
		this.inputs.push(input);
		return this;
	}

	output(output: Output) {
		if (Object.isFrozen(this)) throw new Error('transaction finalized');
		this.outputs.push(output);
		return this;
	}

	change(address: string | Address | PublicKey) {
		if (Object.isFrozen(this)) throw new Error('transaction finalized');

		if (this.changeOutput) throw new Error('change output already added');

		const script = createP2PKHLockScript(Address.from(address).pubkeyhash);
		const output = new Output(script, 0);

		this.outputs.push(output);
		this.changeOutput = output;

		return this;
	}

	async sign(privateKey: PrivateKey | string) {
		if (Object.isFrozen(this)) throw new Error('transaction finalized');

		const privKey = typeof privateKey === 'string' ? PrivateKey.fromString(privateKey) : privateKey;

		for (let vin = 0; vin < this.inputs.length; vin++) {
			const input = this.inputs[vin];
			const { output } = input;

			if (input.script.length) continue;
			if (!output) continue;

			const outputScript = output.script;
			const outputSatoshis = output.satoshis;

			if (!isP2PKHLockScript(output.script.buffer)) continue;
			if (
				!areBuffersEqual(extractP2PKHLockScriptPubkeyhash(output.script.buffer), privKey.toAddress().pubkeyhash)
			)
				continue;

			// eslint-disable-next-line no-await-in-loop
			const txsignature = await generateTxSignature(
				this,
				vin,
				outputScript.buffer,
				outputSatoshis,
				privKey.number,
				privKey.toPublicKey().point
			);

			const writer = new BufferWriter();
			writePushData(writer, txsignature);
			writePushData(writer, privKey.toPublicKey().toBuffer());
			const script = writer.toBuffer();

			input.script = Script.fromBuffer(script);
		}

		return this;
	}

	verify() {
		const parents = this.inputs.map((input) => input.output);
		const minFeePerKb = this.feePerKb;
		verifyTx(this, parents, minFeePerKb);
		return this;
	}

	// Calculates change and then locks a transaction so that no further changes may be made
	finalize() {
		if (Object.isFrozen(this)) return this;

		this.calculateChange();

		Object.freeze(this);
		Object.freeze(this.inputs);
		Object.freeze(this.outputs);
		this.inputs.forEach((input) => Object.freeze(input));
		this.outputs.forEach((output) => Object.freeze(output));

		return this;
	}

	calculateChange() {
		if (Object.isFrozen(this)) return;
		if (!this.changeOutput) return;

		const changeIndex = this.outputs.indexOf(this.changeOutput);
		if (changeIndex === -1) {
			this.changeOutput = undefined;
			return;
		}

		this.changeOutput.satoshis = 0;

		const currentFee = this.fee;
		const expectedFee = Math.ceil((encodeTx(this).length * this.feePerKb) / 1000);

		const change = currentFee - expectedFee;
		const minDust = 1;

		if (change >= minDust) {
			this.changeOutput.satoshis = change;
		} else {
			this.outputs.splice(changeIndex, 1);
			this.changeOutput = undefined;
		}
	}

	setFeePerKb(satoshis: number) {
		if (Object.isFrozen(this)) throw new Error('transaction finalized');
		verifySatoshis(satoshis);
		this.feePerKb = satoshis;
		return this;
	}
}
