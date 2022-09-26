import bsv from 'bsv';
import { expect, describe, test } from 'vitest';
import nimble from '../..';

const { Script } = nimble;

describe('Script', () => {
	describe('constructor', () => {
		test('create script with buffer property', () => {
			const buffer = new Uint8Array([1, 2, 3]);
			const script = new Script(buffer);
			expect(script.buffer).toBe(buffer);
		});

		test('defaults to empty buffer if not passed', () => {
			const script = new Script();
			expect(Array.isArray(script.buffer)).toBe(true);
			expect(script.buffer.length).toBe(0);
		});
	});

	describe('fromString', () => {
		test('decodes hex', () => {
			expect(Array.from(Script.fromString('000102').buffer)).toEqual([0, 1, 2]);
		});

		test('decodes asm', () => {});

		test('throws if bad', () => {
			expect(() => Script.fromString('xyz')).toThrow('bad hex char');
			expect(() => Script.fromString('OP_MISSING')).toThrow('bad hex char');
		});
	});

	describe('fromHex', () => {
		test('decodes hex', () => {
			expect(Array.from(Script.fromHex('').buffer)).toEqual([]);
			expect(Array.from(Script.fromHex('aabbcc').buffer)).toEqual([0xaa, 0xbb, 0xcc]);
		});

		test('throws if bad hex', () => {
			expect(() => Script.fromHex('x')).toThrow('bad hex char');
		});
	});

	describe('fromASM', () => {
		test('decodes asm', () => {
			expect(Array.from(Script.fromASM('OP_TRUE').buffer)).toEqual([81]);
		});
	});

	describe('fromBuffer', () => {
		test('creates with buffer', () => {
			expect(Array.from(Script.fromBuffer(new Uint8Array([])).buffer)).toEqual([]);
		});
	});

	describe('from', () => {
		test('accepts Script instances', () => {
			const script = new Script(new Uint8Array([1, 2, 3]));
			expect(Script.from(script)).toBe(script);
		});

		test('from bsv.Script', () => {
			const script = new Script(new Uint8Array([1, 2, 3]));
			const bsvScript = new bsv.Script(script.toString());
			expect(Script.from(bsvScript).toString()).toBe(script.toString());
		});

		test('accepts hex strings', () => {
			expect(Script.from('001122').toString()).toBe('001122');
		});

		test('accepts asm', () => {
			expect(Script.from('OP_CHECKSIG').toString()).toBe('ac');
		});

		test('accepts buffers', () => {
			expect(Array.from(Script.from(new Uint8Array([0, 1, 2])).buffer)).toEqual([0, 1, 2]);
		});

		test('throws if none of the above', () => {
			expect(() => Script.from('xyz')).toThrow('bad hex char');
		});
	});

	describe('toString', () => {
		test('encodes hex', () => {
			expect(Script.fromBuffer(new Uint8Array([])).toString()).toBe('');
			expect(Script.fromBuffer(new Uint8Array([0, 1, 2])).toString()).toBe('000102');
		});
	});

	describe('toHex', () => {
		test('encodes hex', () => {
			expect(Script.fromBuffer(new Uint8Array([0xff])).toHex()).toBe('ff');
		});
	});

	describe('toASM', () => {
		test('encodes asm', () => {
			expect(Script.fromBuffer(new Uint8Array([0, 81, 100])).toASM()).toBe('0 OP_1 OP_NOTIF');
		});
	});

	describe('toBuffer', () => {
		test('returns buffer', () => {
			expect(Array.from(Script.fromBuffer(new Uint8Array([])).toBuffer())).toEqual([]);
			expect(Array.from(Script.fromBuffer(new Uint8Array([0xff])).toBuffer())).toEqual([0xff]);
			expect(Array.from(Script.fromBuffer(new Uint8Array([1, 2, 3])).toBuffer())).toEqual([1, 2, 3]);
		});
	});

	describe('length', () => {
		test('returns buffer length', () => {
			expect(new Script().length).toBe(0);
			expect(new Script(new Uint8Array([1, 2, 3])).length).toBe(3);
		});
	});

	describe('slice', () => {
		test('returns slice of buffer', () => {
			expect(Array.from(new Script(new Uint8Array([1, 2, 3])).slice(0, 0))).toEqual([1, 2, 3]);
			expect(Array.from(new Script(new Uint8Array([1, 2, 3])).slice(0, 1))).toEqual([2, 3]);
			expect(Array.from(new Script(new Uint8Array([1, 2, 3])).slice(1, 2))).toEqual([2]);
		});
	});

	describe('chunks', () => {
		test('returns chunks', () => {
			expect(new Script(new Uint8Array([100, 255, 1, 2])).chunks).toEqual([
				{ opcode: 100 },
				{ opcode: 255 },
				{ opcode: 1, buf: [2] },
			]);
		});

		test('caches chunks', () => {
			let bufferArray: number[] = [];
			for (let i = 0; i < 10000; i++) {
				bufferArray = bufferArray.concat([100, 255, 1, 2]);
			}
			const script = new Script(new Uint8Array(bufferArray));
			const t0 = Date.now();
			// eslint-disable-next-line @typescript-eslint/no-unused-expressions
			script.chunks;
			const t1 = Date.now();
			// eslint-disable-next-line @typescript-eslint/no-unused-expressions
			script.chunks;
			const t2 = Date.now();
			expect(t2 - t1).toBeLessThanOrEqual(t1 - t0);
		});
	});

	describe('P2PKHLockScript', () => {
		describe('fromAddress', () => {
			test('creates', () => {
				const address = nimble.PrivateKey.fromRandom().toAddress();
				const script = Script.fromAddress(address);
				expect(Array.from(script.buffer)).toEqual(
					Array.from(nimble.functions.createP2PKHLockScript(address.pubkeyhash))
				);
			});

			test('throws if not an address', () => {
				expect(() => Script.fromAddress('abc')).toThrow();
			});
		});

		describe('toAddress', () => {
			test('returns address for current network', () => {
				const address = nimble.PrivateKey.fromRandom().toAddress();
				const script = Script.fromAddress(address);
				expect(script.toAddress().toString()).toBe(address.toString());
			});
		});
	});
});
