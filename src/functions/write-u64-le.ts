/* eslint-disable no-param-reassign */
/* eslint-disable no-bitwise */
import BufferWriter from '../classes/buffer-writer';

export default function writeU64LE(writer: BufferWriter, n: number): BufferWriter {
	if (n > Number.MAX_SAFE_INTEGER) throw new Error('number too large');

	const buffer = new Uint8Array(8);
	buffer[0] = n % 256;
	n = Math.floor(n / 256);
	buffer[1] = n % 256;
	n = Math.floor(n / 256);
	buffer[2] = n % 256;
	n = Math.floor(n / 256);
	buffer[3] = n % 256;
	n = Math.floor(n / 256);
	buffer[4] = n % 256;
	n = Math.floor(n / 256);
	buffer[5] = n % 256;
	n >>= 8;
	buffer[6] = n % 256;
	n >>= 8;
	buffer[7] = n;

	return writer.write(buffer);
}
