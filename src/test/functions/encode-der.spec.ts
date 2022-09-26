import bsv from 'bsv';
import { describe, test, expect } from 'vitest';
import nimble from '../..';

const { encodeDER, decodeDER, generateRandomData } = nimble.functions;

describe('encodeDER', () => {
	test('encodes full length', () => {
		const signature = { r: new Array(32).fill(1), s: new Array(32).fill(2) };
		const der = encodeDER(signature);
		expect(der[0]).toBe(0x30);
		expect(der[1]).toBe(68);
		expect(der[2]).toBe(0x02);
		expect(der[3]).toBe(32);
		expect(Array.from(der.slice(4, 4 + 32))).toEqual(signature.r);
		expect(der[36]).toBe(0x02);
		expect(der[37]).toBe(32);
		expect(Array.from(der.slice(38))).toEqual(signature.s);
		const bsvSignature = bsv.crypto.Signature.fromDER(bsv.deps.Buffer.from(der));
		expect(Array.from(bsvSignature.r.toBuffer())).toEqual(signature.r);
		expect(Array.from(bsvSignature.s.toBuffer())).toEqual(signature.s);
	});

	test('encodes smaller length', () => {
		const signature = { r: new Array(20).fill(1), s: new Array(10).fill(2) };
		const der = encodeDER(signature);
		expect(der[0]).toBe(0x30);
		expect(der[1]).toBe(34);
		expect(der[2]).toBe(0x02);
		expect(der[3]).toBe(20);
		expect(Array.from(der.slice(4, 4 + 20))).toEqual(signature.r);
		expect(der[24]).toBe(0x02);
		expect(der[25]).toBe(10);
		expect(Array.from(der.slice(26))).toEqual(signature.s);
		const bsvSignature = bsv.crypto.Signature.fromDER(bsv.deps.Buffer.from(der));
		expect(Array.from(bsvSignature.r.toBuffer())).toEqual(signature.r);
		expect(Array.from(bsvSignature.s.toBuffer())).toEqual(signature.s);
	});

	test('negative', () => {
		const signature = { r: [0x80].concat(new Array(31).fill(0)), s: new Array(32).fill(255) };
		const der = encodeDER(signature);
		expect(der[0]).toBe(0x30);
		expect(der[1]).toBe(70);
		expect(der[2]).toBe(0x02);
		expect(der[3]).toBe(33);
		expect(der[4]).toBe(0x00);
		expect(Array.from(der.slice(5, 5 + 32))).toEqual(signature.r);
		expect(der[37]).toBe(0x02);
		expect(der[38]).toBe(33);
		expect(der[39]).toBe(0x00);
		expect(Array.from(der.slice(40, 40 + 32))).toEqual(signature.s);
	});

	test('matches bsv lib', () => {
		for (let i = 0; i < 100; i++) {
			let r = generateRandomData(32);
			while (r[0] === 0) {
				r = r.slice(1);
			}

			let s = generateRandomData(32);
			while (s[0] === 0) {
				s = s.slice(1);
			}

			const signature = { r, s };
			const der = encodeDER(signature);

			const rbn = bsv.crypto.BN.fromBuffer(bsv.deps.Buffer.from(signature.r));
			const sbn = bsv.crypto.BN.fromBuffer(bsv.deps.Buffer.from(signature.s));
			const bsvSignature = new bsv.crypto.Signature(rbn, sbn);
			const bsvder = bsvSignature.toDER();

			expect(Array.from(der)).toEqual(Array.from(bsvder));
			expect(Array.from(decodeDER(der).r)).toEqual(Array.from(r));
			expect(Array.from(decodeDER(der).s)).toEqual(Array.from(s));
		}
	});
});
