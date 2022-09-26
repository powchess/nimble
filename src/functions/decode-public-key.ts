// eslint-disable-next-line import/no-relative-packages
import { BN_SIZE, getMemoryBuffer, getSecp256k1Exports, writeBN, readBN } from '../wasm/wasm-secp256k1';
import { Point } from '../types/general';
import verifyPoint from './verify-point';

function decodeCompressedPublicKey(buffer: Uint8Array): Point {
	if (buffer.length !== 33) throw new Error('bad length');

	let xstart = 1;
	while (!buffer[xstart] && xstart < buffer.length) xstart++;
	const x = buffer.slice(xstart, 33);

	const memory = getMemoryBuffer();
	const xPos = memory.length - BN_SIZE;
	const yPos = xPos - BN_SIZE;

	writeBN(memory, xPos, x);

	const decompressY = getSecp256k1Exports().decompress_y as CallableFunction;
	decompressY(yPos, xPos, buffer[0]);

	const y = readBN(memory, yPos);

	return { x, y };
}

function decodeUncompressedPublicKey(buffer: Uint8Array): Point {
	if (buffer.length !== 65) throw new Error('bad length');

	let xstart = 1;
	while (!buffer[xstart] && xstart < buffer.length) xstart++;
	const x = buffer.slice(xstart, 33);

	let ystart = 33;
	while (!buffer[ystart] && ystart < buffer.length) ystart++;
	const y = buffer.slice(ystart, 65);

	return { x, y };
}

export default function decodePublicKey(buffer: Uint8Array): Point {
	const prefix = buffer[0];

	if (prefix === 0x04) {
		const publicKey = decodeUncompressedPublicKey(buffer);
		verifyPoint(publicKey);
		return publicKey;
	}

	if (prefix === 0x02 || prefix === 0x03) {
		const publicKey = decodeCompressedPublicKey(buffer);
		verifyPoint(publicKey);
		return publicKey;
	}

	throw new Error(`bad prefix: ${prefix}`);
}
