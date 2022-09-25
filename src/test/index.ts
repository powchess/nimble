import { describe, test, expect } from 'vitest';
import nimble from './env/nimble';

const { PrivateKey } = nimble;

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
