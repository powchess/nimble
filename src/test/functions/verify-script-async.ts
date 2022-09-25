import { describe, test, expect } from 'vitest';
import nimble from 'index';

const { verifyScriptAsync } = nimble.functions;

describe('verifyScriptAsync', () => {
	test('promise resolves if script passes and async', async () => {
		await verifyScriptAsync([], [nimble.constants.opcodes.OP_TRUE]);
	});

	test('promise is rejected if script fails and async', async () => {
		await expect(verifyScriptAsync([], [nimble.constants.opcodes.OP_FALSE])).rejects;
	});
});
