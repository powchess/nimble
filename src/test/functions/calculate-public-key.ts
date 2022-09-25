import bsv from 'bsv';
import { expect, describe, test } from 'vitest';
import nimble from 'index';

const { generatePrivateKey, calculatePublicKey } = nimble.functions;

describe('calculatePublicKey', () => {
	test('valid', () => {
		for (let i = 0; i < 100; i++) {
			const privateKey = generatePrivateKey();
			const publicKey = calculatePublicKey(privateKey);
			const bsvPrivateKey = bsv.PrivateKey.fromBuffer(bsv.deps.Buffer.from(privateKey));
			const bsvPublicKey = bsvPrivateKey.toPublicKey();
			const xhex1 = Buffer.from(publicKey.x).toString('hex');
			const xhex2 = bsvPublicKey.point.getX().toBuffer().toString('hex');
			const yhex1 = Buffer.from(publicKey.y).toString('hex');
			const yhex2 = bsvPublicKey.point.getY().toBuffer().toString('hex');
			expect(xhex1).toBe(xhex2);
			expect(yhex1).toBe(yhex2);
		}
	});

	test('performance', () => {
		const privateKey = generatePrivateKey();
		let count = 0;
		const start = Date.now();
		while (Date.now() - start < 1000) {
			calculatePublicKey(privateKey);
			count++;
		}
		const msPerCall = 1000 / count;
		expect(msPerCall).toBeLessThan(10);
	});
});
