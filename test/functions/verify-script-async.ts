import nimble from '../env/nimble';
const { verifyScriptAsync } = nimble.functions;
import { describe, test, expect } from '@jest/globals';

describe('verifyScriptAsync', () => {
	test('promise resolves if script passes and async', async () => {
		await verifyScriptAsync([], [nimble.constants.opcodes.OP_TRUE]);
	});

	test('promise is rejected if script fails and async', async () => {
		await expect(verifyScriptAsync([], [nimble.constants.opcodes.OP_FALSE])).rejects;
	});
});
