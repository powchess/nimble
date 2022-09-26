/* eslint-disable no-bitwise */
import VARIANT from '../constants/variant';

// eslint-disable-next-line import/no-mutable-exports
let decodeBase64: (base64: string) => Uint8Array;

function getLens(b64: string) {
	const len = b64.length;

	if (len % 4 > 0) throw new Error('length must be a multiple of 4');

	// Trim off extra bytes after placeholder bytes are found
	// See: https://github.com/beatgammit/base64-js/issues/42
	let validLen = b64.indexOf('=');
	if (validLen === -1) validLen = len;

	const placeHoldersLen = validLen === len ? 0 : 4 - (validLen % 4);

	return [validLen, placeHoldersLen];
}

// Prefer our implementation of decodeBase64 over Buffer when we don't know the VARIANT
// to avoid accidentally importing the Buffer shim in the browser.

if (typeof VARIANT === 'undefined' || VARIANT === 'browser') {
	// Credit to https://raw.githubusercontent.com/beatgammit/base64-js

	const REV_LOOKUP: number[] = [];

	const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
	for (let i = 0, len = BASE64_CHARS.length; i < len; ++i) {
		REV_LOOKUP[BASE64_CHARS.charCodeAt(i)] = i;
	}

	// Support decoding URL-safe base64 strings, as Node.js does.
	// See: https://en.wikipedia.org/wiki/Base64#URL_applications
	REV_LOOKUP['-'.charCodeAt(0)] = 62;
	REV_LOOKUP['_'.charCodeAt(0)] = 63;

	decodeBase64 = (b64: string) => {
		let tmp;
		const lens = getLens(b64);
		const validLen = lens[0];
		const placeHoldersLen = lens[1];
		const byteLenght = ((validLen + placeHoldersLen) * 3) / 4 - placeHoldersLen;
		const arr = new Uint8Array(byteLenght);

		let curByte = 0;

		// if there are placeholders, only get up to the last complete 4 chars
		const len = placeHoldersLen > 0 ? validLen - 4 : validLen;

		let i;
		for (i = 0; i < len; i += 4) {
			tmp =
				(REV_LOOKUP[b64.charCodeAt(i)] << 18) |
				(REV_LOOKUP[b64.charCodeAt(i + 1)] << 12) |
				(REV_LOOKUP[b64.charCodeAt(i + 2)] << 6) |
				REV_LOOKUP[b64.charCodeAt(i + 3)];
			arr[curByte++] = (tmp >> 16) & 0xff;
			arr[curByte++] = (tmp >> 8) & 0xff;
			arr[curByte++] = tmp & 0xff;
		}

		if (placeHoldersLen === 2) {
			tmp = (REV_LOOKUP[b64.charCodeAt(i)] << 2) | (REV_LOOKUP[b64.charCodeAt(i + 1)] >> 4);
			arr[curByte++] = tmp & 0xff;
		}

		if (placeHoldersLen === 1) {
			tmp =
				(REV_LOOKUP[b64.charCodeAt(i)] << 10) |
				(REV_LOOKUP[b64.charCodeAt(i + 1)] << 4) |
				(REV_LOOKUP[b64.charCodeAt(i + 2)] >> 2);
			arr[curByte++] = (tmp >> 8) & 0xff;
			arr[curByte++] = tmp & 0xff;
		}

		return arr;
	};
} else {
	decodeBase64 = (str: string) => {
		if (str.length % 4 > 0) throw new Error('length must be a multiple of 4');

		return Buffer.from(str, 'base64');
	};
}

export default decodeBase64;
