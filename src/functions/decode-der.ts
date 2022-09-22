import BufferReader from '../classes/buffer-reader';
import readDER from './read-der';

export default function decodeDER(buffer: Uint8Array) {
	const reader = new BufferReader(buffer);
	const signature = readDER(reader);
	reader.close();
	return signature;
}
