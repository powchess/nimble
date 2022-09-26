import bsv from 'bsv';
import { describe, test, expect } from 'vitest';
import nimble from '../..';

const { generatePrivateKey, calculatePublicKey, ecdsaSign, sha256 } = nimble.functions;

describe('ecdsaSign', () => {
	test('valid', () => {
		for (let i = 0; i < 10; i++) {
			const data = 'abc';
			const privateKey = generatePrivateKey();
			const publicKey = calculatePublicKey(privateKey);
			const hash = sha256(Buffer.from(data, 'utf8'));
			const signature = ecdsaSign(hash, privateKey, publicKey);

			const hashbuf = bsv.deps.Buffer.from(hash).reverse();
			const endian = 'little';
			const rbn = bsv.crypto.BN.fromBuffer(bsv.deps.Buffer.from(signature.r));
			const sbn = bsv.crypto.BN.fromBuffer(bsv.deps.Buffer.from(signature.s));
			const bsvSignature = new bsv.crypto.Signature(rbn, sbn);
			const bsvPrivateKey = new bsv.PrivateKey(bsv.crypto.BN.fromBuffer(bsv.deps.Buffer.from(privateKey)));
			const bsvPublicKey = bsvPrivateKey.toPublicKey();

			const ecdsa = bsv.crypto.ECDSA();
			ecdsa.k = bsv.crypto.BN.fromBuffer(bsv.deps.Buffer.from(signature.k));
			const { sig } = ecdsa.set({ hashbuf, endian, privkey: bsvPrivateKey }).sign();

			expect(Buffer.from(signature.r).toString('hex')).toBe(
				new bsv.crypto.BN(bsv.deps.Buffer.from(sig.r.toArray())).toBuffer().toString('hex')
			);
			expect(Buffer.from(signature.s).toString('hex')).toBe(
				new bsv.crypto.BN(bsv.deps.Buffer.from(sig.s.toArray())).toBuffer().toString('hex')
			);

			const verified = bsv.crypto.ECDSA.verify(hashbuf, bsvSignature, bsvPublicKey, endian);
			expect(verified).toBe(true);
		}
	});

	test('performance', () => {
		const data = 'abc';
		const privateKey = generatePrivateKey();
		const publicKey = calculatePublicKey(privateKey);
		const hash = sha256(Buffer.from(data, 'utf8'));
		let count = 0;
		const start = Date.now();
		while (Date.now() - start < 1000) {
			ecdsaSign(hash, privateKey, publicKey);
			count++;
		}
		const msPerCall = 1000 / count;
		expect(msPerCall).toBeLessThan(10);
	});
});
