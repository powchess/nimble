/* global VARIANT */

import decodeBase64 from 'functions/decode-base64';

const { WebAssembly } = global;

const RIPEMD160_WASM_BASE64 =
	'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';
let SHA1_WASM_BASE64 = null;
let SHA256_WASM_BASE64 = null;

if (typeof VARIANT === 'undefined' || VARIANT === 'browser') {
	SHA1_WASM_BASE64 =
		'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';
	SHA256_WASM_BASE64 =
		'AGFzbQEAAAABDAJgAn9/AGADf39/AAIPAQNlbnYGbWVtb3J5AgA8AwMCAAEGCQF/AUGAguwBCwcKAQZzaGEyNTYAAQrGCwKbBAEWfyMAQYACayIFJAADQCADQcAARgRAA0AgBEHAAUZFBEAgBCAFaiICQUBrIAIoAgAgAkEkaigCACACQThqKAIAIgFBD3cgAUENd3MgAUEKdnNqaiACQQRqKAIAIgFBGXcgAUEOd3MgAUEDdnNqNgIAIARBBGohBAwBCwtBACEBIABB2ABqKAIAIg0hCyAAQdwAaigCACIOIQggAEHgAGooAgAiDyEMIABB5ABqKAIAIhAhAyAAQegAaigCACIRIQYgAEHsAGooAgAiEiEJIABB1ABqKAIAIhMhAiAAKAJQIhQhBANAIAYhCiADIQYgDCEDIAshByABQYACRkUEQCACIAdxIRUgAiAHcyEWIAEgBWooAgAgAUGAgKABaigCACADIAZxIANBGncgA0EVd3MgA0EHd3NqIAlqIAogA0F/c3FqamoiFyAIaiEMIAFBBGohASACIQsgByEIIAohCSAEIgJBHncgAkETd3MgAkEKd3MgFSACIBZxc2ogF2ohBAwBCwsgACAJIBJqNgJsIAAgCiARajYCaCAAIAYgEGo2AmQgACADIA9qNgJgIAAgCCAOajYCXCAAIAcgDWo2AlggACACIBNqNgJUIAAgBCAUajYCUCAFQYACaiQABSADIAVqIAEgA2ooAAAiAkEYdCACQQh0QYCA/AdxciACQQh2QYD+A3EgAkEYdnJyNgIAIANBBGohAwwBCwsLpgcCCn8BfiMAQfAAayIDJAAgA0HoAGpCq7OP/JGjs/DbADcDACADQeAAakL/pLmIxZHagpt/NwMAIANB2ABqQvLmu+Ojp/2npX83AwAgA0LnzKfQ1tDrs7t/NwNQIANCADcDSCADQQA2AkADQCABBEAgAyAEaiAALQAAOgAAIAMgAygCQEEBaiIENgJAIARBwABGBEAgAyADEAAgA0EANgJAIAMgAykDSEKABHw3A0hBACEECyABQQFrIQEgAEEBaiEADAELCyADIARqQYABOgAAAkACQCAEQThPBEAgBEEBaiEEA0AgBEE/Sw0CIAMgBGpBADoAACAEQQFqIQQMAAsACyADQQFyIQADQCAEQTdGDQIgACAEakEAOgAAIARBAWohBAwACwALIAMgAxAAIANBADoAACADQThqIgBBAWtBADoAACADQQA6AAIgA0EAOgABIABBA2tBADoAACAAQQJrQQA6AAAgA0EAOgADIABBBGtBADoAACADQQAgA2tBA3EiAWoiAEEANgIAIABBOCABa0F8cSIEaiIBQQRrQQA2AgACQCAEQQlJDQAgAEEANgIIIABBADYCBCABQQhrQQA2AgAgAUEMa0EANgIAIARBGUkNACAAQQA2AhggAEEANgIUIABBADYCECAAQQA2AgwgAUEQa0EANgIAIAFBFGtBADYCACABQRhrQQA2AgAgAUEca0EANgIAIAQgAEEEcUEYciIEayIBQSBJDQAgACAEaiEAA0AgAEIANwMAIABBGGpCADcDACAAQRBqQgA3AwAgAEEIakIANwMAIABBIGohACABQSBrIgFBH0sNAAsLCyADIAMpA0ggAygCQEEDdK18Ig03A0ggAyANPAA/IAMgDUIIiDwAPiADIA1CEIg8AD0gAyANQhiIPAA8IAMgDUIgiDwAOyADIA1CKIg8ADogAyANQjCIPAA5IAMgDUI4iDwAOCADIAMQAEEAIQAgAygCbCEFIAMoAmghBiADKAJkIQcgAygCYCEIIAMoAlwhCSADKAJYIQogAygCVCELIAMoAlAhDEEYIQQDQCAAQQRHBEAgACACaiIBIAwgBHY6AAAgAUEcaiAFIAR2OgAAIAFBGGogBiAEdjoAACABQRRqIAcgBHY6AAAgAUEQaiAIIAR2OgAAIAFBDGogCSAEdjoAACABQQhqIAogBHY6AAAgAUEEaiALIAR2OgAAIARBCGshBCAAQQFqIQAMAQsLIANB8ABqJAALC4oCAQBBgICgAQuAApgvikKRRDdxz/vAtaXbtelbwlY58RHxWaSCP5LVXhyrmKoH2AFbgxK+hTEkw30MVXRdvnL+sd6Apwbcm3Txm8HBaZvkhke+78adwQ/MoQwkbyzpLaqEdErcqbBc2oj5dlJRPphtxjGoyCcDsMd/Wb/zC+DGR5Gn1VFjygZnKSkUhQq3JzghGy78bSxNEw04U1RzCmW7Cmp2LsnCgYUscpKh6L+iS2YaqHCLS8KjUWzHGeiS0SQGmdaFNQ70cKBqEBbBpBkIbDceTHdIJ7W8sDSzDBw5SqrYTk/KnFvzby5o7oKPdG9jpXgUeMiECALHjPr/vpDrbFCk96P5vvJ4ccYAdglwcm9kdWNlcnMBDHByb2Nlc3NlZC1ieQEFY2xhbmdWMTMuMC4wIChodHRwczovL2dpdGh1Yi5jb20vbGx2bS9sbHZtLXByb2plY3QgZmQxZDhjMmYwNGRkZTIzYmVlMGZiM2E3ZDA2OWE5YjEwNDZkYTk3OSk=';
}

const WASM_PAGE_SIZE = 65536;
const RESERVED_PAGES = 2 * 3;
const MAX_USER_MEMORY = 32 * 1024 * 1024;
const HASH_PAGES = RESERVED_PAGES + MAX_USER_MEMORY / WASM_PAGE_SIZE;

let memory = null;
let memoryBuffer = null;

let ripemd160 = null;
let sha1 = null;
let sha256 = null;

const getMemory = () => {
	memory = memory || new WebAssembly.Memory({ initial: HASH_PAGES });
	return memory;
};

export const checkAvailableMemory = (size: number) => {
	if (size > MAX_USER_MEMORY) throw new Error(`data too big: ${size}`);
};

export const getMemoryBuffer = () => {
	memoryBuffer = memoryBuffer || new Uint8Array(getMemory().buffer);
	return memoryBuffer;
};

export const getRipemd160 = () => {
	ripemd160 = ripemd160 || compileInstance(RIPEMD160_WASM_BASE64).exports.ripemd160;
	return ripemd160;
};

export const getSha1 = () => {
	sha1 = sha1 || compileInstance(SHA1_WASM_BASE64).exports.sha1;
	return sha1;
};

export const getSha256 = () => {
	sha256 = sha256 || compileInstance(SHA256_WASM_BASE64).exports.sha256;
	return sha256;
};

function compileInstance(base64: string) {
	const bytes = decodeBase64(base64);
	const module = new WebAssembly.Module(bytes);
	const imports = { env: { memory: getMemory() } };
	const instance = new WebAssembly.Instance(module, imports);
	return instance;
}
