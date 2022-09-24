import nimble from '../env/nimble';
const { verifyScript } = nimble.functions;
import { describe, test, expect } from '@jest/globals';

describe('verifyScript', () => {
	test('does not throw if script passes', () => {
		expect(() => verifyScript([], [nimble.constants.opcodes.OP_TRUE])).not.toThrow();
	});

	test('throws if script fails', () => {
		expect(() => verifyScript([], [nimble.constants.opcodes.OP_FALSE])).toThrow();
	});

	test('promise resolves if script passes and async', async () => {
		await verifyScript([], [nimble.constants.opcodes.OP_TRUE], undefined, undefined, undefined, true);
	});

	test('promise is rejected if script fails and async', async () => {
		await expect(verifyScript([], [nimble.constants.opcodes.OP_FALSE], undefined, undefined, undefined, true))
			.rejects;
	});
});
