import BufferReader from '../classes/buffer-reader';

export default function readU32LE(reader: BufferReader): number {
	reader.checkRemaining(4);

	const { buffer, pos: i } = reader;

	// eslint-disable-next-line no-param-reassign
	reader.pos += 4;

	// We can't use a bit shift for the high-order byte because in JS this math is 32-bit signed.
	// eslint-disable-next-line no-bitwise
	return (buffer[i + 3] << 23) * 2 + ((buffer[i + 2] << 16) | (buffer[i + 1] << 8) | (buffer[i + 0] << 0));
}
