import decodeScriptChunks from './decode-script-chunks';
import encodeHex from './encode-hex';
import opcodes from '../constants/opcodes';

const OPCODE_MAP: Record<number, string> = [];

Object.entries(opcodes).forEach(([value, key]) => {
	OPCODE_MAP[key] = value;
});

export default function encodeASM(script: Uint8Array): string {
	const chunks = decodeScriptChunks(script);

	return chunks
		.map((chunk) => {
			if (chunk.buf) {
				return encodeHex(chunk.buf) || '0';
			}
			if (chunk.opcode === opcodes.OP_1NEGATE) {
				return '-1';
			}
			return OPCODE_MAP[chunk.opcode] || `<unknown opcode ${chunk.opcode}>`;
		})
		.join(' ');
}
