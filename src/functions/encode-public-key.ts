import { Point } from 'types/general';

export default function encodePublicKey(publicKeyPoint: Point, compressed = true): Uint8Array {
	if (!compressed) {
		const arr = new Uint8Array(65);
		arr[0] = 4;
		arr.set(publicKeyPoint.x, 1 + 32 - publicKeyPoint.x.length);
		arr.set(publicKeyPoint.y, 33 + 32 - publicKeyPoint.y.length);
		return arr;
	}

	const arr = new Uint8Array(33);
	arr[0] = (publicKeyPoint.y[publicKeyPoint.y.length - 1] & 1) === 0 ? 0x02 : 0x03;
	arr.set(publicKeyPoint.x, 1 + 32 - publicKeyPoint.x.length);
	return arr;
}
