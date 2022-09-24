import nimble from './env/nimble';
const { PrivateKey } = nimble;
import { describe, test, expect } from '@jest/globals';

describe('nimble', () => {
	describe('testnet', () => {
		test('enabled', () => {
			nimble.testnet = true;
			expect(PrivateKey.fromRandom().testnet).toBe(true);
			expect(PrivateKey.fromRandom().toPublicKey().testnet).toBe(true);
			expect(PrivateKey.fromRandom().toAddress().testnet).toBe(true);
		});

		test('disabled', () => {
			nimble.testnet = false;
			expect(PrivateKey.fromRandom().testnet).toBe(false);
			expect(PrivateKey.fromRandom().toPublicKey().testnet).toBe(false);
			expect(PrivateKey.fromRandom().toAddress().testnet).toBe(false);
		});
	});
});
