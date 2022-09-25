import bsv from 'bsv';
import { describe, test, expect } from 'vitest';
import nimble from 'index';

const { generatePrivateKey } = nimble.functions;

describe('generatePrivateKey', () => {
	test('valid', () => {
		for (let i = 0; i < 100; i++) {
			const privateKey = generatePrivateKey();
			const bsvPrivateKey = bsv.PrivateKey.fromBuffer(bsv.deps.Buffer.from(privateKey));
			bsvPrivateKey.toPublicKey();
			expect(Buffer.from(privateKey).toString('hex')).toBe(bsvPrivateKey.toBuffer().toString('hex'));
		}
	});

	test('performance', () => {
		generatePrivateKey();
		let count = 0;
		const start = Date.now();
		while (Date.now() - start < 100) {
			generatePrivateKey();
			count++;
		}
		const msPerCall = 1000 / count;
		expect(msPerCall).toBeLessThan(1);
	});
});
