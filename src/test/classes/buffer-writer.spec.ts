import { describe, test, expect } from 'vitest';
import nimble from '../..';

const { BufferWriter } = nimble.classes;

describe('BufferWriter', () => {
	describe('constructor', () => {
		test('empty', () => {
			expect(new BufferWriter().toBuffer().length).toBe(0);
			expect(new BufferWriter().buffers.length).toBe(0);
			expect(new BufferWriter().length).toBe(0);
		});
	});

	describe('write', () => {
		test('appends and increases length', () => {
			const writer = new BufferWriter();
			writer.write(new Uint8Array([0, 1, 2]));
			expect(writer.length).toBe(3);
			writer.write(new Uint8Array([3]));
			expect(writer.length).toBe(4);
			expect(writer.buffers.length).toBe(2);
		});
	});

	describe('toBuffer', () => {
		test('concatenates buffers', () => {
			const writer = new BufferWriter();
			writer.write(new Uint8Array([0, 1, 2, 3]));
			writer.write(new Uint8Array([4]));
			writer.write(new Uint8Array([]));
			writer.write(new Uint8Array([5, 6, 7, 8, 9]));
			expect(Array.from(writer.toBuffer())).toEqual(new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]));
		});
	});
});
