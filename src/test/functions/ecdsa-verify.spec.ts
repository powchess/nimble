import { describe, test, expect } from 'vitest';
import nimble from '../..';

const { generatePrivateKey, calculatePublicKey, ecdsaSign, ecdsaVerify, sha256 } = nimble.functions;

describe('ecdsaVerify', () => {
	test('valid', async () => {
		for (let i = 0; i < 10; i++) {
			const data = 'abc';
			const privateKey = generatePrivateKey();
			const publicKey = calculatePublicKey(privateKey);
			const hash = sha256(Buffer.from(data, 'utf8'));
			// eslint-disable-next-line no-await-in-loop
			const signature = await ecdsaSign(hash, privateKey, publicKey);
			expect(ecdsaVerify(signature, hash, publicKey)).toBe(true);
		}
	});

	test('performance', async () => {
		const data = 'abc';
		const privateKey = generatePrivateKey();
		const publicKey = calculatePublicKey(privateKey);
		const hash = sha256(Buffer.from(data, 'utf8'));
		const signaturePromises = [];
		const count = 30;
		for (let i = 0; i < count; i++) {
			signaturePromises.push(ecdsaSign(hash, privateKey, publicKey));
		}
		const signatures = await Promise.all(signaturePromises);
		const start = Date.now();
		for (let i = 0; i < count; i++) {
			ecdsaVerify(signatures[i], hash, publicKey);
		}
		expect((Date.now() - start) / count).toBeLessThan(30);
	});
});
