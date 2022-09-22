import BufferReader from '../classes/buffer-reader';
import readTx from './read-tx';

export default function decodeTx(buffer: Uint8Array) {
	const reader = new BufferReader(buffer);
	const tx = readTx(reader);
	reader.close();
	return tx;
}
