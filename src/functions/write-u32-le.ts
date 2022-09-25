import BufferWriter from 'classes/buffer-writer';

export default function writeU32LE(writer: BufferWriter, n: number): BufferWriter {
	if (n > 0xffffffff) throw new Error('number too large');

	const buffer = new Uint8Array(4);
	buffer[0] = n % 256;
	n = Math.floor(n / 256);
	buffer[1] = n % 256;
	n >>= 8;
	buffer[2] = n % 256;
	n >>= 8;
	buffer[3] = n;

	return writer.write(buffer);
}
