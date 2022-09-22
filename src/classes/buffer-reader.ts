export default class BufferReader {
	public buffer: Uint8Array;
	public pos: number;

	constructor(buffer: Uint8Array, pos = 0) {
		this.buffer = buffer;
		this.pos = pos;
	}

	read(length: number): Uint8Array {
		this.checkRemaining(length);

		const start = this.pos;
		const end = start + length;
		const buffer = Uint8Array.prototype.slice(start, end);
		this.pos = end;

		// The buffer returned may be a view, so should not be modified without first making a copy, including reverse()
		return buffer;
	}

	close(): void {
		if (this.pos !== this.buffer.length) throw new Error('unconsumed data');
	}

	checkRemaining(length: number): void {
		if (this.buffer.length - this.pos < length) throw new Error('not enough data');
	}
}
