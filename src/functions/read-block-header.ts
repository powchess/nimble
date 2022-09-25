import BufferReader from 'classes/buffer-reader';
import readU32LE from './read-u32-le';

export default function readBlockHeader(reader: BufferReader): {
	version: number;
	prevBlock: Uint8Array;
	merkleRoot: Uint8Array;
	timestamp: number;
	bits: number;
	nonce: number;
} {
	const version = readU32LE(reader);
	const prevBlock = reader.read(32);
	const merkleRoot = reader.read(32);
	const timestamp = readU32LE(reader);
	const bits = readU32LE(reader);
	const nonce = readU32LE(reader);

	return { version, prevBlock, merkleRoot, timestamp, bits, nonce };
}
