import { describe, test } from 'vitest';
import nimble from '../..';

const { verifyScript } = nimble.functions;

describe('verifyScript', () => {
	test('promise resolves if script passes and async', async () => {
		verifyScript(new Uint8Array([]), [nimble.constants.opcodes.OP_TRUE], undefined, undefined, undefined);
	});
});
