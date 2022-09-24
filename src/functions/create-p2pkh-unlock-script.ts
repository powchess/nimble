import BufferWriter from '../classes/buffer-writer';
import writePushData from './write-push-data';

export default function createP2PKHUnlockScript(signature: Uint8Array, pubkey: Uint8Array): Uint8Array {
	const writer = new BufferWriter();
	writePushData(writer, signature);
	writePushData(writer, pubkey);
	return writer.toBuffer();
}
