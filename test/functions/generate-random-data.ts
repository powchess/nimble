import nimble from '../env/nimble';
const { generateRandomData } = nimble.functions;
import { describe, test, expect } from '@jest/globals';

describe('generateRandomData', () => {
	test('returns random data', () => {
		const buf1 = generateRandomData(1000);
		const buf2 = generateRandomData(1000);
		expect(buf1.length).toBe(buf2.length);
		expect(buf1.length).toBe(1000);
		expect(Array.from(buf1)).not.toEqual(Array.from(buf2));
	});
});
