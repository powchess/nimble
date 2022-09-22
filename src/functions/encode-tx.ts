import BufferWriter from '../classes/buffer-writer';
import writeTx from './write-tx';

export default function encodeTx(tx) {
	const writer = new BufferWriter();
	writeTx(writer, tx);
	return writer.toBuffer();
}
