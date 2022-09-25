import BufferReader from 'classes/buffer-reader';
import { Input, Output } from 'classes/transaction';
import encodeHex from './encode-hex';
import readU32LE from './read-u32-le';
import readU64LE from './read-u64-le';
import readVarint from './read-varint';

export default function readTx(reader: BufferReader): {
	version: number;
	inputs: Input[];
	outputs: Output[];
	locktime: number;
} {
	const version = readU32LE(reader);

	const nin = readVarint(reader);
	const inputs: Input[] = [];
	for (let vin = 0; vin < nin; vin++) {
		const txid = encodeHex(new Uint8Array(reader.read(32)).reverse());
		const vout = readU32LE(reader);
		const scriptLength = readVarint(reader);
		const script = reader.read(scriptLength);
		const sequence = readU32LE(reader);

		const input = new Input(txid, vout, script, sequence);
		inputs.push(input);
	}

	const nout = readVarint(reader);
	const outputs: Output[] = [];
	for (let vout = 0; vout < nout; vout++) {
		const satoshis = readU64LE(reader);
		const scriptLength = readVarint(reader);
		const script = reader.read(scriptLength);

		const output = new Output(script, satoshis);
		outputs.push(output);
	}

	const locktime = readU32LE(reader);

	return { version, inputs, outputs, locktime };
}
