import BufferWriter from '../classes/buffer-writer';
import writeTx from './write-tx';
import Transaction from 'classes/transaction';

export default function encodeTx(tx: Transaction): Uint8Array {
	const writer = new BufferWriter();
	writeTx(writer, tx);
	return writer.toBuffer();
}
