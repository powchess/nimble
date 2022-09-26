import bsv from 'bsv';
import { describe, test, expect } from 'vitest';
import nimble from '../..';

const { generatePrivateKey, calculatePublicKey, ecdsaSignWithK, sha256, decodeHex } = nimble.functions;

describe('ecdsaSign', () => {
	test('generate signature', () => {
		const data = 'abc';
		const privateKey = generatePrivateKey();
		const publicKey = calculatePublicKey(privateKey);
		const hash = sha256(Buffer.from(data, 'utf8'));
		const k = decodeHex('1111111111111111111111111111111111111111111111111111111111111111');
		const signature = ecdsaSignWithK(hash, k, privateKey, publicKey);
		if (signature === null) throw new Error('signature is null');

		const hashbuf = bsv.deps.Buffer.from(hash).reverse();
		const endian = 'little';
		const rbn = bsv.crypto.BN.fromBuffer(bsv.deps.Buffer.from(signature.r));
		const sbn = bsv.crypto.BN.fromBuffer(bsv.deps.Buffer.from(signature.s));
		const bsvSignature = new bsv.crypto.Signature(rbn, sbn);
		const bsvPrivateKey = new bsv.PrivateKey(bsv.crypto.BN.fromBuffer(bsv.deps.Buffer.from(privateKey)));
		const bsvPublicKey = bsvPrivateKey.toPublicKey();

		const ecdsa = bsv.crypto.ECDSA();
		ecdsa.k = bsv.crypto.BN.fromBuffer(bsv.deps.Buffer.from(k));
		const { sig } = ecdsa.set({ hashbuf, endian, privkey: bsvPrivateKey }).sign();

		expect(Buffer.from(signature.r).toString('hex')).toBe(
			new bsv.crypto.BN(bsv.deps.Buffer.from(sig.r.toArray())).toBuffer().toString('hex')
		);
		expect(Buffer.from(signature?.s).toString('hex')).toBe(
			new bsv.crypto.BN(bsv.deps.Buffer.from(sig.s.toArray())).toBuffer().toString('hex')
		);

		const verified = bsv.crypto.ECDSA.verify(hashbuf, bsvSignature, bsvPublicKey, endian);
		expect(verified).toBe(true);
	});

	test('returns null if k=n', () => {
		const data = 'abc';
		const privateKey = generatePrivateKey();
		const publicKey = calculatePublicKey(privateKey);
		const hash = sha256(Buffer.from(data, 'utf8'));
		const k = decodeHex('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141');
		const signature = ecdsaSignWithK(hash, k, privateKey, publicKey);
		expect(signature).toBe(null);
	});
});
