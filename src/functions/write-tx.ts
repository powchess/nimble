import BufferWriter from 'classes/buffer-writer';
import Transaction from '../classes/transaction';
import decodeHex from './decode-hex';
import writeU32LE from './write-u32-le';
import writeU64LE from './write-u64-le';
import writeVarint from './write-varint';

export default function writeTx(writer: BufferWriter, tx: Transaction): void {
	const version = typeof tx.version === 'undefined' ? 1 : tx.version;
	const inputs = tx.inputs || [];
	const outputs = tx.outputs || [];
	const locktime = typeof tx.locktime === 'undefined' ? 0 : tx.locktime;

	writeU32LE(writer, version);

	writeVarint(writer, inputs.length);
	for (const input of inputs) {
		const sequence = typeof input.sequence === 'undefined' ? 0xffffffff : input.sequence;
		writer.write(decodeHex(input.txid).reverse());
		writeU32LE(writer, input.vout);
		writeVarint(writer, input.script.length);
		writer.write(input.script.buffer);
		writeU32LE(writer, sequence);
	}

	writeVarint(writer, outputs.length);
	for (const output of outputs) {
		writeU64LE(writer, output.satoshis);
		writeVarint(writer, output.script.length);
		writer.write(output.script.buffer);
	}

	writeU32LE(writer, locktime);
}
