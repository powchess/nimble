import bsv from 'bsv';
import { describe, test, expect } from 'vitest';
import nimble from '../..';

const { createP2PKHLockScript } = nimble.functions;

describe('createP2PKHLockScript', () => {
	test('valid', () => {
		const mainnetAddress = nimble.PrivateKey.fromRandom(false).toAddress();
		const mainnetScript = Array.from(bsv.Script.fromAddress(mainnetAddress.toString()).toBuffer());
		expect(Array.from(createP2PKHLockScript(mainnetAddress.pubkeyhash))).toEqual(mainnetScript);
		const testnetAddress = nimble.PrivateKey.fromRandom(true).toAddress();
		const testnetScript = Array.from(bsv.Script.fromAddress(testnetAddress.toString()).toBuffer());
		expect(Array.from(createP2PKHLockScript(testnetAddress.pubkeyhash))).toEqual(testnetScript);
	});

	test('throws if bad address', () => {
		expect(() => createP2PKHLockScript()).toThrow('not a buffer');
		expect(() => createP2PKHLockScript(null)).toThrow('not a buffer');
		expect(() => createP2PKHLockScript(new bsv.PrivateKey().toAddress())).toThrow('not a buffer');
		expect(() => createP2PKHLockScript('')).toThrow('not a buffer');
	});
});
