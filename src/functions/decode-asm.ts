import decodeHex from './decode-hex';
import opcodes from '../constants/opcodes';
import BufferWriter from '../classes/buffer-writer';
import writePushData from './write-push-data';

export default function decodeASM(script: string) {
	const parts = script.split(' ').filter((x) => x.length);
	const writer = new BufferWriter();
	parts.forEach((part) => {
		if (part in opcodes) {
			writer.write(new Uint8Array([opcodes[part as keyof typeof opcodes]]));
		} else if (part === '0') {
			writer.write(new Uint8Array([opcodes.OP_0]));
		} else if (part === '-1') {
			writer.write(new Uint8Array([opcodes.OP_1NEGATE]));
		} else {
			const buf = decodeHex(part);
			writePushData(writer, buf);
		}
	});
	return writer.toBuffer();
}
