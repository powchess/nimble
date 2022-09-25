import { describe, test, expect } from 'vitest';
import nimble from 'index';

const { BufferReader } = nimble.classes;

describe('BufferReader', () => {
	describe('constructor', () => {
		test('creates reader', () => {
			const buffer = [0x00, 0x01];
			const reader = new BufferReader(buffer);
			expect(Array.from(reader.buffer)).toEqual(buffer);
			expect(reader.pos).toBe(0);
		});
	});

	describe('read', () => {
		test('reads buffer', () => {
			expect(Array.from(new BufferReader([]).read(0))).toEqual([]);
			expect(Array.from(new BufferReader([0x00, 0x01, 0x02]).read(3))).toEqual([0x00, 0x01, 0x02]);
		});

		test('throws if not enough data', () => {
			expect(() => new BufferReader([]).read(1)).toThrow('not enough data');
			expect(() => new BufferReader([0x00]).read(2)).toThrow('not enough data');
			const reader = new BufferReader([0x00]);
			reader.read(1);
			expect(() => reader.read(1)).toThrow('not enough data');
		});
	});

	describe('close', () => {
		test('does not throw if read all', () => {
			expect(() => new BufferReader([]).close()).not.toThrow();
			const reader = new BufferReader([0x00, 0x00, 0x00, 0x00]);
			reader.read(4);
			expect(() => reader.close()).not.toThrow();
		});

		test('throws if unconsumed data', () => {
			expect(() => new BufferReader([0x00]).close()).toThrow('unconsumed data');
			const reader = new BufferReader([0x00, 0x00, 0x00, 0x00, 0x00]);
			reader.read(4);
			expect(() => reader.close()).toThrow('unconsumed data');
		});
	});

	describe('checkRemaining', () => {
		test('throws if not enough data left', () => {
			expect(() => new BufferReader([]).checkRemaining(1)).toThrow('not enough data');
			expect(() => new BufferReader([2]).checkRemaining(2)).toThrow('not enough data');
		});

		test('does not throw if data left', () => {
			expect(() => new BufferReader([]).checkRemaining()).not.toThrow();
			expect(() => new BufferReader([1]).checkRemaining(1)).not.toThrow();
		});
	});
});
