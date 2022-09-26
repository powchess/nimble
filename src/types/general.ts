import Script from '../classes/script';

export type Point = {
	x: Uint8Array;
	y: Uint8Array;
};

export type ParentTx = {
	script: Script;
	satoshis: number;
};

export interface ByteArray extends Iterable<number> {
	length: number;
}

export type Chunk = {
	opcode: number;
	buf?: Uint8Array;
};

export type Signature = {
	r: Uint8Array;
	s: Uint8Array;
};
