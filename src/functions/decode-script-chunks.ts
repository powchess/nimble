import { Chunk } from '../types/general';

export default function decodeScriptChunks(script: Uint8Array): Chunk[] {
	const chunks: Chunk[] = [];
	let i = 0;
	while (i < script.length) {
		const opcode = script[i];
		i += 1;
		if (opcode === 0) {
			chunks.push({ opcode, buf: new Uint8Array([]) });
		} else if (opcode < 76) {
			// OP_PUSHDATA1
			chunks.push({ opcode, buf: script.slice(i, i + opcode) });
			i += opcode;
		} else if (opcode === 76) {
			// OP_PUSHDATA1
			const len = script[i];
			i += 1;
			chunks.push({ opcode, buf: script.slice(i, i + len) });
			i += len;
		} else if (opcode === 77) {
			// OP_PUSHDATA2
			// eslint-disable-next-line no-bitwise
			const len = script[i] | (script[i + 1] << 8);
			i += 2;
			chunks.push({ opcode, buf: script.slice(i, i + len) });
			i += len;
		} else if (opcode === 78) {
			// OP_PUSHDATA4
			const len = script[i] + script[i + 1] * 0x0100 + script[i + 2] * 0x010000 + script[i + 3] * 0x01000000;
			i += 4;
			chunks.push({ opcode, buf: script.slice(i, i + len) });
			i += len;
		} else {
			chunks.push({ opcode });
		}
	}
	if (i !== script.length) throw new Error('bad script');
	return chunks;
}
