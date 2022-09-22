import BufferWriter from '../classes/buffer-writer';
import writeDER from './write-der';

export default function encodeDER(signature: Uint8Array): Uint8Array {
	const writer = new BufferWriter();
	writeDER(writer, signature);
	return writer.toBuffer();
}
