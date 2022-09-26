// eslint-disable-next-line import/no-relative-packages
import { PT_SIZE, BN_SIZE, getMemoryBuffer, getEcdsaExports, writeBN } from '../wasm/wasm-secp256k1';
import { Point } from '../types/general';

export default function verifyPoint(publicKeyPoint: Point): Point {
	const memory = getMemoryBuffer();
	const pos = memory.length - PT_SIZE;

	writeBN(memory, pos, publicKeyPoint.x);
	writeBN(memory, pos + BN_SIZE, publicKeyPoint.y);

	const point = getEcdsaExports().validate_point as CallableFunction;
	const verified = point(pos) as number;

	if (verified !== 0) {
		// eslint-disable-next-line no-nested-ternary
		const errorMessage = verified === 1 ? 'outside range' : verified === 2 ? 'not on curve' : 'bad point';
		throw new Error(errorMessage);
	}

	return publicKeyPoint;
}
