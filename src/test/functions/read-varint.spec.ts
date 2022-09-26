import { describe, test, expect } from 'vitest';
import nimble from '../..';

const { readVarint } = nimble.functions;
const { BufferReader } = nimble.classes;

describe('readVarint', () => {
	test('valid', () => {
		expect(readVarint(new BufferReader([0]))).toBe(0);
		expect(readVarint(new BufferReader([252]))).toBe(252);
		expect(readVarint(new BufferReader([0xfd, 0x00, 0x00]))).toBe(0);
		expect(readVarint(new BufferReader([0xfd, 0xfd, 0x00]))).toBe(253);
		expect(readVarint(new BufferReader([0xfd, 0xff, 0x00]))).toBe(255);
		expect(readVarint(new BufferReader([0xfd, 0x00, 0x01]))).toBe(256);
		expect(readVarint(new BufferReader([0xfd, 0xfe, 0xff]))).toBe(0xfffe);
		expect(readVarint(new BufferReader([0xfe, 0x00, 0x00, 0x00, 0x00]))).toBe(0);
		expect(readVarint(new BufferReader([0xfe, 0xfc, 0xfd, 0xfe, 0xff]))).toBe(0xfffefdfc);
		expect(readVarint(new BufferReader([0xff, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]))).toBe(0);
		expect(readVarint(new BufferReader([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x1f, 0x00]))).toBe(
			Number.MAX_SAFE_INTEGER
		);
	});

	test('multiple times', () => {
		const reader = new BufferReader([0x00, 0x01, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x1f, 0x00]);
		expect(readVarint(reader)).toBe(0);
		expect(readVarint(reader)).toBe(1);
		expect(readVarint(reader)).toBe(Number.MAX_SAFE_INTEGER);
		expect(() => readVarint(reader)).toThrow('not enough data');
	});

	test('throws if too big', () => {
		expect(() => readVarint(new BufferReader([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x20, 0x00]))).toThrow(
			'varint too large'
		);
		expect(() => readVarint(new BufferReader([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]))).toThrow(
			'varint too large'
		);
	});

	test('throws if not enough data', () => {
		const err = 'not enough data';
		expect(() => readVarint(new BufferReader([]))).toThrow(err);
		expect(() => readVarint(new BufferReader([0xfd]))).toThrow(err);
		expect(() => readVarint(new BufferReader([0xfd, 0x00]))).toThrow(err);
		expect(() => readVarint(new BufferReader([0xfe, 0x00]))).toThrow(err);
		expect(() => readVarint(new BufferReader([0xfe, 0x00, 0x00, 0x00]))).toThrow(err);
		expect(() => readVarint(new BufferReader([0xff, 0x00]))).toThrow(err);
		expect(() => readVarint(new BufferReader([0xff, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]))).toThrow(err);
		expect(() => readVarint(new BufferReader([0xff, 0x00]))).toThrow(err);
	});
});
