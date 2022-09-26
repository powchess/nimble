import { describe, test, expect } from 'vitest';
import nimble from '../..';

const { BufferReader } = nimble.classes;

describe('BufferReader', () => {
	describe('constructor', () => {
		test('creates reader', () => {
			const buffer = new Uint8Array([0x00, 0x01]);
			const reader = new BufferReader(buffer);
			expect(Array.from(reader.buffer)).toEqual(buffer);
			expect(reader.pos).toBe(0);
		});
	});

	describe('read', () => {
		test('reads buffer', () => {
			expect(Array.from(new BufferReader(new Uint8Array([])).read(0))).toEqual([]);
			expect(Array.from(new BufferReader(new Uint8Array([0x00, 0x01, 0x02])).read(3))).toEqual(
				new Uint8Array([0x00, 0x01, 0x02])
			);
		});

		test('throws if not enough data', () => {
			expect(() => new BufferReader(new Uint8Array([])).read(1)).toThrow('not enough data');
			expect(() => new BufferReader(new Uint8Array([0x00])).read(2)).toThrow('not enough data');
			const reader = new BufferReader(new Uint8Array([0x00]));
			reader.read(1);
			expect(() => reader.read(1)).toThrow('not enough data');
		});
	});

	describe('close', () => {
		test('does not throw if read all', () => {
			expect(() => new BufferReader(new Uint8Array([])).close()).not.toThrow();
			const reader = new BufferReader(new Uint8Array([0x00, 0x00, 0x00, 0x00]));
			reader.read(4);
			expect(() => reader.close()).not.toThrow();
		});

		test('throws if unconsumed data', () => {
			expect(() => new BufferReader(new Uint8Array([0x00])).close()).toThrow('unconsumed data');
			const reader = new BufferReader(new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00]));
			reader.read(4);
			expect(() => reader.close()).toThrow('unconsumed data');
		});
	});

	describe('checkRemaining', () => {
		test('throws if not enough data left', () => {
			expect(() => new BufferReader(new Uint8Array([])).checkRemaining(1)).toThrow('not enough data');
			expect(() => new BufferReader(new Uint8Array([2])).checkRemaining(2)).toThrow('not enough data');
		});

		test('does not throw if data left', () => {
			expect(() => new BufferReader(new Uint8Array([])).checkRemaining(0)).not.toThrow();
			expect(() => new BufferReader(new Uint8Array([1])).checkRemaining(1)).not.toThrow();
		});
	});
});
