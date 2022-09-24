import nimble from '../env/nimble';
const { decodeScriptChunks } = nimble.functions;
import bsv from 'bsv';
import { describe, test, expect } from '@jest/globals';
import { Chunk } from 'types/general';

describe('decodeScriptChunks', () => {
	test('valid', () => {
		function testFn(script: number[], chunks: Chunk[]) {
			const buffer = new Uint8Array(script);
			expect(decodeScriptChunks(buffer)).toEqual(chunks);
			const bsvScript = bsv.Script.fromBuffer(bsv.deps.Buffer.from(buffer));
			expect(bsvScript.chunks.length).toBe(chunks.length);
			chunks.forEach((chunk, i) => {
				expect(chunk.opcode).toBe(bsvScript.chunks[i].opcodenum);
				// We treat OP_0 special and do store an empty buffer to match writePushData behavior
				if (chunk.opcode !== 0) {
					expect(chunk.buf || []).toEqual(Array.from(bsvScript.chunks[i].buf || []));
				}
			});
		}

		testFn([], []);
		testFn([100, 255], [{ opcode: 100 }, { opcode: 255 }]);
		testFn([0], [{ opcode: 0, buf: new Uint8Array([]) }]);
		testFn([1, 2], [{ opcode: 1, buf: new Uint8Array([2]) }]);
		testFn([75, ...new Array(75).fill(1)], [{ opcode: 75, buf: new Uint8Array(75).fill(1) }]);
		testFn([76, 76, ...new Array(76).fill(1)], [{ opcode: 76, buf: new Uint8Array(76).fill(1) }]);
		testFn([76, 0xff, ...new Array(0xff).fill(1)], [{ opcode: 76, buf: new Uint8Array(0xff).fill(1) }]);
		testFn([77, 0, 1, ...new Array(0xff + 1).fill(1)], [{ opcode: 77, buf: new Uint8Array(0xff + 1).fill(1) }]);
		testFn([77, 0xff, 0xff, ...new Array(0xffff).fill(1)], [{ opcode: 77, buf: new Uint8Array(0xffff).fill(1) }]);
		testFn(
			[78, 0, 0, 1, 0, ...new Array(0xffff + 1).fill(1)],
			[{ opcode: 78, buf: new Uint8Array(0xffff + 1).fill(1) }]
		);
		testFn([79], [{ opcode: 79 }]);
		testFn([80], [{ opcode: 80 }]);
		testFn([81], [{ opcode: 81 }]);
		testFn([96], [{ opcode: 96 }]);
		testFn([100, 255, 1, 2], [{ opcode: 100 }, { opcode: 255 }, { opcode: 1, buf: new Uint8Array([2]) }]);
	});

	test('throws if bad', () => {
		const err = 'bad script';
		expect(() => decodeScriptChunks([1])).toThrow(err);
		expect(() => decodeScriptChunks([75])).toThrow(err);
		expect(() => decodeScriptChunks([76])).toThrow(err);
		expect(() => decodeScriptChunks([76, 1])).toThrow(err);
		expect(() => decodeScriptChunks([77, 0])).toThrow(err);
		expect(() => decodeScriptChunks([77, 1, 0])).toThrow(err);
		expect(() => decodeScriptChunks([78, 0])).toThrow(err);
		expect(() => decodeScriptChunks([78, 0, 0, 0])).toThrow(err);
		expect(() => decodeScriptChunks([78, 1, 0, 0, 0])).toThrow(err);
	});
});
