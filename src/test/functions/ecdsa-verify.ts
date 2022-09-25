import { describe, test, expect } from 'vitest';
import nimble from 'index';

const { generatePrivateKey, calculatePublicKey, ecdsaSign, ecdsaVerify, sha256 } = nimble.functions;

describe('ecdsaVerify', () => {
	test('valid', () => {
		for (let i = 0; i < 10; i++) {
			const data = 'abc';
			const privateKey = generatePrivateKey();
			const publicKey = calculatePublicKey(privateKey);
			const hash = sha256(Buffer.from(data, 'utf8'));
			const signature = ecdsaSign(hash, privateKey, publicKey);
			expect(ecdsaVerify(signature, hash, publicKey)).toBe(true);
		}
	});

	test('performance', () => {
		const data = 'abc';
		const privateKey = generatePrivateKey();
		const publicKey = calculatePublicKey(privateKey);
		const hash = sha256(Buffer.from(data, 'utf8'));
		const signatures = [];
		const count = 30;
		for (let i = 0; i < count; i++) {
			signatures.push(ecdsaSign(hash, privateKey, publicKey));
		}
		const start = Date.now();
		for (let i = 0; i < count; i++) {
			ecdsaVerify(signatures[i], hash, publicKey);
		}
		expect((Date.now() - start) / count).toBeLessThan(30);
	});
});
