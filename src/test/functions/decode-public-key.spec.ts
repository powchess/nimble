import bsv from 'bsv';
import { describe, test, expect } from 'vitest';
import nimble from '../..';

const { generatePrivateKey, decodePublicKey, calculatePublicKey, encodePublicKey } = nimble.functions;

describe('decodePublicKey', () => {
	test('valid uncompressed', () => {
		for (let i = 0; i < 100; i++) {
			const privateKey = generatePrivateKey();
			const bsvPrivateKey = bsv.PrivateKey.fromBuffer(bsv.deps.Buffer.from(privateKey));
			const bsvPublicKey = new bsv.PublicKey(bsvPrivateKey.toPublicKey().point, { compressed: false });
			const hex = bsvPublicKey.toString();
			const publicKey = decodePublicKey(Buffer.from(hex, 'hex'));
			const xhex1 = Buffer.from(publicKey.x).toString('hex');
			const xhex2 = bsvPublicKey.point.getX().toBuffer().toString('hex');
			const yhex1 = Buffer.from(publicKey.y).toString('hex');
			const yhex2 = bsvPublicKey.point.getY().toBuffer().toString('hex');
			expect(xhex1).toBe(xhex2);
			expect(yhex1).toBe(yhex2);
		}
	});

	test('valid compressed', () => {
		for (let i = 0; i < 100; i++) {
			const privateKey = generatePrivateKey();
			const bsvPrivateKey = bsv.PrivateKey.fromBuffer(bsv.deps.Buffer.from(privateKey));
			const bsvPublicKey = new bsv.PublicKey(bsvPrivateKey.toPublicKey().point, { compressed: true });
			const hex = bsvPublicKey.toString();
			const publicKey = decodePublicKey(Buffer.from(hex, 'hex'));
			const xhex1 = Buffer.from(publicKey.x).toString('hex');
			const xhex2 = bsvPublicKey.point.getX().toBuffer().toString('hex');
			const yhex1 = Buffer.from(publicKey.y).toString('hex');
			const yhex2 = bsvPublicKey.point.getY().toBuffer().toString('hex');
			expect(xhex1).toBe(xhex2);
			expect(yhex1).toBe(yhex2);
		}
	});

	test('keys with zero prefixes', () => {
		const shortCompressed = new Uint8Array([
			2, 0, 221, 62, 61, 19, 166, 177, 126, 56, 13, 99, 181, 179, 30, 140, 44, 30, 198, 254, 38, 53, 76, 23, 54,
			114, 251, 36, 47, 51, 175, 43, 151,
		]);

		const shortXUncompressed = new Uint8Array([
			4, 0, 0, 247, 101, 21, 114, 84, 240, 125, 142, 42, 70, 20, 187, 167, 30, 154, 102, 116, 186, 108, 154, 162,
			153, 245, 144, 223, 114, 119, 68, 227, 225, 4, 25, 56, 47, 176, 138, 32, 38, 87, 75, 61, 34, 122, 13, 60,
			115, 162, 151, 72, 163, 123, 96, 174, 112, 190, 9, 160, 206, 232, 121, 77, 178,
		]);

		const shortYUncompressed = new Uint8Array([
			4, 59, 175, 128, 195, 151, 76, 161, 225, 98, 94, 14, 18, 44, 201, 89, 239, 146, 210, 217, 55, 214, 36, 173,
			12, 61, 207, 171, 215, 150, 107, 123, 15, 0, 198, 214, 244, 171, 26, 58, 87, 180, 53, 125, 76, 235, 181,
			203, 237, 77, 44, 130, 221, 222, 26, 140, 123, 152, 93, 36, 28, 241, 201, 64, 103,
		]);

		expect(() => decodePublicKey(shortCompressed)).not.toThrow();
		expect(() => decodePublicKey(shortXUncompressed)).not.toThrow();
		expect(() => decodePublicKey(shortYUncompressed)).not.toThrow();
	});

	test('throws if bad prefix', () => {
		const badPrefix = new Uint8Array([
			5, 0, 221, 62, 61, 19, 166, 177, 126, 56, 13, 99, 181, 179, 30, 140, 44, 30, 198, 254, 38, 53, 76, 23, 54,
			114, 251, 36, 47, 51, 175, 43, 151,
		]);
		expect(() => decodePublicKey(badPrefix)).toThrow('bad prefix');
	});

	test('throws if too short', () => {
		const shortCompressed = new Uint8Array([
			2, 221, 62, 61, 19, 166, 177, 126, 56, 13, 99, 181, 179, 30, 140, 44, 30, 198, 254, 38, 53, 76, 23, 54, 114,
			251, 36, 47, 51, 175, 43, 151,
		]);

		const shortUncompressed = new Uint8Array([
			4, 59, 175, 128, 195, 151, 76, 161, 225, 98, 94, 14, 18, 44, 201, 89, 239, 146, 210, 217, 55, 214, 36, 173,
			12, 61, 207, 171, 215, 150, 107, 123, 15, 198, 214, 244, 171, 26, 58, 87, 180, 53, 125, 76, 235, 181, 203,
			237, 77, 44, 130, 221, 222, 26, 140, 123, 152, 93, 36, 28, 241, 201, 64, 103,
		]);

		expect(() => decodePublicKey(shortCompressed)).toThrow('bad length');
		expect(() => decodePublicKey(shortUncompressed)).toThrow('bad length');
	});

	test('throws if too long', () => {
		const longCompressed = new Uint8Array([
			2, 0, 221, 62, 61, 19, 166, 177, 126, 56, 13, 99, 181, 179, 30, 140, 44, 30, 198, 254, 38, 53, 76, 23, 54,
			114, 251, 36, 47, 51, 175, 43, 151, 0,
		]);

		const longUncompressed = new Uint8Array([
			4, 59, 175, 128, 195, 151, 76, 161, 225, 98, 94, 14, 18, 44, 201, 89, 239, 146, 210, 217, 55, 214, 36, 173,
			12, 61, 207, 171, 215, 150, 107, 123, 15, 0, 198, 214, 244, 171, 26, 58, 87, 180, 53, 125, 76, 235, 181,
			203, 237, 77, 44, 130, 221, 222, 26, 140, 123, 152, 93, 36, 28, 241, 201, 64, 103, 0,
		]);

		expect(() => decodePublicKey(longCompressed)).toThrow('bad length');
		expect(() => decodePublicKey(longUncompressed)).toThrow('bad length');
	});

	test('throws if not on curve', () => {
		const privateKey = generatePrivateKey();
		const publicKey = calculatePublicKey(privateKey);
		const badPublicKey = { x: publicKey.x, y: publicKey.x };
		const uncompressed = encodePublicKey(badPublicKey, false);
		expect(() => decodePublicKey(uncompressed)).toThrow('not on curve');
	});

	test('throws if outside range', () => {
		const badPublicKey = { x: new Uint8Array(32).fill(0xff), y: new Uint8Array(32).fill(0xff) };
		const compressed = encodePublicKey(badPublicKey, true);
		const uncompressed = encodePublicKey(badPublicKey, true);
		expect(() => decodePublicKey(compressed)).toThrow('outside range');
		expect(() => decodePublicKey(uncompressed)).toThrow('outside range');
	});
});
