import nimble from '../env/nimble';
const { generatePrivateKey, calculatePublicKey, verifyPoint } = nimble.functions;
import { describe, test, expect } from '@jest/globals';

describe('verifyPoint', () => {
	test('valid', () => {
		const privateKey = generatePrivateKey();
		const publicKey = calculatePublicKey(privateKey);
		expect(() => verifyPoint(publicKey)).not.toThrow();
	});

	test('bad', () => {
		const privateKey = generatePrivateKey();
		const publicKey = calculatePublicKey(privateKey);
		publicKey.y = publicKey.x;
		expect(() => verifyPoint(publicKey)).toThrow('not on curve');
	});

	test('returns self for chaining', () => {
		const privateKey = generatePrivateKey();
		const publicKey = calculatePublicKey(privateKey);
		expect(verifyPoint(publicKey)).toBe(publicKey);
	});
});
