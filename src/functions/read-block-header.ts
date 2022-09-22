import readU32LE from './read-u32-le';
import BufferReader from 'classes/buffer-reader';

export default function readBlockHeader(reader: BufferReader) {
	const version = readU32LE(reader);
	const prevBlock = reader.read(32);
	const merkleRoot = reader.read(32);
	const timestamp = readU32LE(reader);
	const bits = readU32LE(reader);
	const nonce = readU32LE(reader);

	return { version, prevBlock, merkleRoot, timestamp, bits, nonce };
}
