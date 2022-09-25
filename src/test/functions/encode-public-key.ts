import bsv from 'bsv';
import { describe, test, expect } from 'vitest';
import nimble from 'index';

const { generatePrivateKey, calculatePublicKey, encodePublicKey } = nimble.functions;

describe('encodePublicKey', () => {
	test('valid uncompressed', () => {
		for (let i = 0; i < 100; i++) {
			const privateKey = generatePrivateKey();
			const publicKey = calculatePublicKey(privateKey);
			const bsvPrivateKey = bsv.PrivateKey.fromBuffer(bsv.deps.Buffer.from(privateKey));
			const bsvPublicKey = new bsv.PublicKey(bsvPrivateKey.toPublicKey().point, { compressed: false });
			const encoded = encodePublicKey(publicKey, false);
			const hex1 = Buffer.from(encoded).toString('hex');
			const hex2 = bsvPublicKey.toString();
			expect(hex1).toBe(hex2);
		}
	});

	test('valid compressed', () => {
		for (let i = 0; i < 100; i++) {
			const privateKey = generatePrivateKey();
			const publicKey = calculatePublicKey(privateKey);
			const bsvPrivateKey = bsv.PrivateKey.fromBuffer(bsv.deps.Buffer.from(privateKey));
			const bsvPublicKey = new bsv.PublicKey(bsvPrivateKey.toPublicKey().point, { compressed: true });
			const encoded = encodePublicKey(publicKey);
			const hex1 = Buffer.from(encoded).toString('hex');
			const hex2 = bsvPublicKey.toString();
			expect(hex1).toBe(hex2);
		}
	});
});
