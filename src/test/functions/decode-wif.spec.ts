import { describe, test, expect } from 'vitest';
import nimble from '../..';

const { encodeWIF, decodeWIF, generatePrivateKey, encodeBase58Check } = nimble.functions;

describe('decodeWIF', () => {
	test('uncompressed', () => {
		const privateKey = generatePrivateKey();
		const testnet = Math.random() < 0.5;
		const compressed = false;
		const wif = encodeWIF(privateKey, testnet, compressed);
		const decoded = decodeWIF(wif);
		expect([...decoded.number]).toEqual([...privateKey]);
		expect(decoded.testnet).toBe(testnet);
		expect(decoded.compressed).toBe(false);
	});

	test('compressed', () => {
		const privateKey = generatePrivateKey();
		const testnet = Math.random() < 0.5;
		const compressed = true;
		const wif = encodeWIF(privateKey, testnet, compressed);
		const decoded = decodeWIF(wif);
		expect([...decoded.number]).toEqual([...privateKey]);
		expect(decoded.testnet).toBe(testnet);
		expect(decoded.compressed).toBe(true);
	});

	test('throws if too short', () => {
		const badLengthWIF = encodeBase58Check(0x80, new Uint8Array([]));
		expect(() => decodeWIF(badLengthWIF)).toThrow('bad length');
	});

	test('throws if outside range', () => {
		const outsideRangeWIP = encodeBase58Check(0x80, new Uint8Array(32).fill(255));
		expect(() => decodeWIF(outsideRangeWIP)).toThrow('outside range');
	});
});
