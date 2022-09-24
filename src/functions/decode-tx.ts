import BufferReader from '../classes/buffer-reader';
import readTx from './read-tx';
import { Input, Output } from 'classes/transaction';

export default function decodeTx(buffer: Uint8Array): {
	version: number;
	inputs: Input[];
	outputs: Output[];
	locktime: number;
} {
	const reader = new BufferReader(buffer);
	const tx = readTx(reader);
	reader.close();
	return tx;
}
