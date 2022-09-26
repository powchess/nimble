/* eslint-disable no-bitwise */
/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
import Transaction from '../classes/transaction';
import BufferWriter from '../classes/buffer-writer';
import writeU32LE from './write-u32-le';
import writeU64LE from './write-u64-le';
import writeVarint from './write-varint';
import decodeHex from './decode-hex';
import sha256d from './sha256d';

export default async function preimage(
	tx: Transaction,
	vin: number,
	parentScript: Uint8Array,
	parentSatoshis: number,
	sighashFlags: number
) {
	const input = tx.inputs[vin];
	const outputs = tx.outputs || [];

	const SIGHASH_NONE = 0x02;
	const SIGHASH_SINGLE = 0x03;
	const SIGHASH_ANYONECANPAY = 0x80;

	async function getPrevoutsHash() {
		if (tx._hashPrevouts) return tx._hashPrevouts;
		const writer = new BufferWriter();
		tx.inputs.forEach((inpt) => {
			writer.write(decodeHex(inpt.txid).reverse());
			writeU32LE(writer, inpt.vout);
		});
		const preimg = writer.toBuffer();
		const hashPrevouts = sha256d(preimg);
		tx._hashPrevouts = hashPrevouts;
		return hashPrevouts;
	}

	async function getSequenceHash() {
		if (tx._hashSequence) return tx._hashSequence;
		const writer = new BufferWriter();
		tx.inputs.forEach((inpt) => {
			writeU32LE(writer, typeof inpt.sequence === 'undefined' ? 0xffffffff : inpt.sequence);
		});
		const preimg = writer.toBuffer();
		const hashSequence = sha256d(preimg);
		tx._hashSequence = hashSequence;
		return hashSequence;
	}

	async function getAllOutputsHash() {
		if (tx._hashOutputsAll) return tx._hashOutputsAll;
		const writer = new BufferWriter();
		outputs.forEach((output) => {
			writeU64LE(writer, output.satoshis);
			writeVarint(writer, output.script.length);
			writer.write(output.script.buffer);
		});
		const preimg = writer.toBuffer();
		const hashOutputsAll = sha256d(preimg);
		tx._hashOutputsAll = hashOutputsAll;
		return hashOutputsAll;
	}

	function getOutputHash(n: number) {
		const output = outputs[n];
		const writer = new BufferWriter();
		writeU64LE(writer, output.satoshis);
		writeVarint(writer, output.script.length);
		writer.write(output.script.buffer);
		const preimg = writer.toBuffer();
		return sha256d(preimg);
	}

	let hashPrevouts = new Uint8Array(32);
	let hashSequence = new Uint8Array(32);
	let hashOutputs = new Uint8Array(32);

	if (!(sighashFlags & SIGHASH_ANYONECANPAY)) {
		hashPrevouts = await getPrevoutsHash();
	}

	if (
		!(sighashFlags & SIGHASH_ANYONECANPAY) &&
		(sighashFlags & 0x1f) !== SIGHASH_SINGLE &&
		(sighashFlags & 0x1f) !== SIGHASH_NONE
	) {
		hashSequence = await getSequenceHash();
	}

	if ((sighashFlags & 0x1f) !== SIGHASH_SINGLE && (sighashFlags & 0x1f) !== SIGHASH_NONE) {
		hashOutputs = await getAllOutputsHash();
	} else if ((sighashFlags & 0x1f) === SIGHASH_SINGLE && vin < outputs.length) {
		hashOutputs = await getOutputHash(vin);
	}

	function getPreimage(hashprevouts: Uint8Array, hashsequence: Uint8Array, hashoutputs: Uint8Array) {
		const writer = new BufferWriter();
		writeU32LE(writer, typeof tx.version === 'undefined' ? 1 : tx.version);
		writer.write(hashprevouts);
		writer.write(hashsequence);
		writer.write(decodeHex(input.txid).reverse());
		writeU32LE(writer, input.vout);
		writeVarint(writer, parentScript.length);
		writer.write(parentScript);
		writeU64LE(writer, parentSatoshis);
		writeU32LE(writer, typeof input.sequence === 'undefined' ? 0xffffffff : input.sequence);
		writer.write(hashoutputs);
		writeU32LE(writer, tx.locktime || 0);
		writeU32LE(writer, sighashFlags >>> 0);
		return writer.toBuffer();
	}
	return getPreimage(hashPrevouts, hashSequence, hashOutputs);
}
