import { Point } from 'types/general';
import { PT_SIZE, BN_SIZE, getMemoryBuffer, getEcdsaExports, writeBN } from '../wasm/wasm-secp256k1';

function verifyPoint(publicKeyPoint: Point): Point {
	const memory = getMemoryBuffer();
	const pos = memory.length - PT_SIZE;

	writeBN(memory, pos, publicKeyPoint.x);
	writeBN(memory, pos + BN_SIZE, publicKeyPoint.y);

	const verifyPoint = getEcdsaExports().validate_point as CallableFunction;
	const verified = verifyPoint(pos);

	if (verified !== 0)
		throw new Error(verified === 1 ? 'outside range' : verified === 2 ? 'not on curve' : 'bad point');

	return publicKeyPoint;
}

export default verifyPoint;
