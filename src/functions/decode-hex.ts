import VARIANT from 'constants/variant';
import isHex from './is-hex';

// Prefer our implementation of decodeHex over Buffer when we don't know the VARIANT
// to avoid accidentally importing the Buffer shim in the browser.

export default function decodeHex(hex: string): Uint8Array {
	if (hex.length % 2 === 1) hex = `0${hex}`;

	if (!isHex(hex)) throw new Error('bad hex char');

	if (typeof VARIANT === 'undefined' || VARIANT === 'browser') {
		const length = hex.length / 2;
		const arr = new Uint8Array(length);
		const isNaN = (x: number) => x !== x; // eslint-disable-line no-self-compare
		for (let i = 0; i < length; ++i) {
			const byte = parseInt(hex.substr(i * 2, 2), 16);
			if (isNaN(byte)) throw new Error('bad hex char');
			arr[i] = byte;
		}
		return arr;
	}
	return Buffer.from(hex, 'hex');
}
