import Transaction from '../classes/transaction';
import BufferReader from '../classes/buffer-reader';
import readTx from './read-tx';

export default function decodeTx(buffer: Uint8Array) {
	const reader = new BufferReader(buffer);
	const tx = readTx(reader);
	reader.close();
	const newTx = new Transaction();
	newTx.locktime = tx.locktime;
	newTx.version = tx.version;
	newTx.inputs = tx.inputs;
	newTx.outputs = tx.outputs;
	return newTx;
}
