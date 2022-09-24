import BufferWriter from '../classes/buffer-writer';
import writePushData from './write-push-data';

export default function encodePushData(buffer: Buffer): Uint8Array {
	const writer = new BufferWriter();
	writePushData(writer, buffer);
	return writer.toBuffer();
}
