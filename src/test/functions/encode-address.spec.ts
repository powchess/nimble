import bsv from 'bsv';
import { describe, test, expect } from 'vitest';
import nimble from '../..';

const { encodeAddress } = nimble.functions;

describe('encodeAddress', () => {
	test('valid', () => {
		const pubkeyhash = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
		const bsvMainnetAddress = bsv.Address.fromPublicKeyHash(bsv.deps.Buffer.from(pubkeyhash), 'mainnet');
		const bsvTestnetAddress = bsv.Address.fromPublicKeyHash(bsv.deps.Buffer.from(pubkeyhash), 'testnet');
		expect(encodeAddress(pubkeyhash, false)).toBe(bsvMainnetAddress.toString());
		expect(encodeAddress(pubkeyhash, true)).toBe(bsvTestnetAddress.toString());
	});
});
