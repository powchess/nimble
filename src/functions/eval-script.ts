/* eslint-disable no-bitwise */
import OP_CODES from '../constants/opcodes';
import { Chunk } from '../types/general';
import Transaction from '../classes/transaction';
import encodeHex from './encode-hex';
import decodeHex from './decode-hex';
import decodeScriptChunks from './decode-script-chunks';
import verifyTxSignature from './verify-tx-signature';
import decodePublicKey from './decode-public-key';
import ripemd160 from './ripemd160';
import sha1 from './sha1';
import sha256 from './sha256';

type NumNeg = { num: bigint; neg: boolean };

const LSHIFT_MASK = [0xff, 0x7f, 0x3f, 0x1f, 0x0f, 0x07, 0x03, 0x01];

function lshift(arr: Uint8Array, n: number) {
	const bitshift = n % 8;
	const byteshift = Math.floor(n / 8);
	const mask = LSHIFT_MASK[bitshift];
	const overflowmask = mask ^ 0xff;
	const result: number[] = new Array(arr.length).fill(0);
	for (let i = arr.length - 1; i >= 0; i--) {
		const k = i - byteshift;
		if (k >= 0) {
			let val = arr[i] & mask;
			val <<= bitshift;
			result[k] |= val;
		}
		if (k - 1 >= 0) {
			let carryval = arr[i] & overflowmask;
			carryval >>= (8 - bitshift) % 8;
			result[k - 1] |= carryval;
		}
	}
	return new Uint8Array(result);
}

const RSHIFT_MASK = [0xff, 0xfe, 0xfc, 0xf8, 0xf0, 0xe0, 0xc0, 0x80];

function rshift(arr: Uint8Array, n: number) {
	const bitshift = n % 8;
	const byteshift = Math.floor(n / 8);
	const mask = RSHIFT_MASK[bitshift];
	const overflowmask = mask ^ 0xff;
	const result = new Array(arr.length).fill(0);
	for (let i = 0; i < arr.length; i++) {
		const k = i + byteshift;
		if (k < arr.length) {
			let val = arr[i] & mask;
			val >>= bitshift;
			result[k] |= val;
		}
		if (k + 1 < arr.length) {
			let carryval = arr[i] & overflowmask;
			carryval <<= (8 - bitshift) % 8;
			result[k + 1] |= carryval;
		}
	}
	return new Uint8Array(result);
}

export default async function evalScript(
	unlockScript: Uint8Array,
	lockScript: Uint8Array,
	tx: Transaction = new Transaction(),
	vin = 0,
	parentSatoshis = 0,
	opts = {}
) {
	const { trace } = {
		trace: true,
		...opts,
	};

	const chunks: Chunk[] = [];
	const stack: Uint8Array[] = [];
	const altStack: Uint8Array[] = [];
	const branchExec: boolean[] = [];
	const stackTrace: [{ opcode: number; exec: boolean }, Uint8Array[], Uint8Array[]][] = [];
	let checkIndex = 0;
	let done = false;

	function traceStack(i: number, exec = true) {
		if (trace && i >= 0) {
			const { opcode } = chunks[i];
			stackTrace.push([{ opcode, exec }, [...stack], [...altStack]]);
		}
	}

	function finish(error: Error | null = null) {
		let err = error;
		if (stackTrace.length) traceStack(stackTrace.length);
		if (!error && branchExec.length) err = new Error('ENDIF missing');
		const success = !error && !!stack.length && stack[stack.length - 1].some((x) => x);
		if (!error && !success) err = new Error('top of stack is false');

		return {
			success,
			error: err,
			chunks,
			stack,
			stackTrace,
		};
	}

	try {
		const unlockChunks = decodeScriptChunks(unlockScript);
		const lockChunks = decodeScriptChunks(lockScript);

		if (unlockChunks.some((x) => x.opcode && x.opcode > 96)) throw new Error('non-push data in unlock script');
		chunks.push(...unlockChunks);
		chunks.push(...lockChunks);

		const pop = () => {
			if (stack.length === 0) throw new Error('stack empty');
			return stack.pop() as Uint8Array;
		};

		const altpop = () => {
			if (altStack.length === 0) throw new Error('alt stack empty');
			return altStack.pop() as Uint8Array;
		};

		const popBool = () => pop().some((x) => x);

		const encodeNum = (num: bigint | number, neg?: boolean): Uint8Array => {
			if (BigInt(num) === BigInt(0)) return new Uint8Array([]);
			const arr = Array.from(decodeHex(BigInt(num).toString(16))).reverse();
			const full = arr[arr.length - 1] & 0x80;
			if (full) arr.push(0x00);
			if (neg === true) arr[arr.length - 1] |= 0x80;
			return new Uint8Array(arr);
		};

		const decodeNum = (arr: number[] | number | Uint8Array): NumNeg => {
			if (typeof arr === 'number') return { num: BigInt(0), neg: false };
			const neg = !!(arr[arr.length - 1] & 0x80);
			// eslint-disable-next-line no-param-reassign
			arr[arr.length - 1] &= 0x7f;
			const num = BigInt(`0x${encodeHex(new Uint8Array(arr).reverse())}`);
			return { num, neg };
		};

		const addNum = (a: NumNeg, b: NumNeg): NumNeg => {
			if (a.neg === b.neg) {
				return { num: a.num + b.num, neg: a.neg };
			}
			return a.num > b.num ? { num: a.num - b.num, neg: a.neg } : { num: b.num - a.num, neg: b.neg };
		};

		const subNum = (b: NumNeg, a: NumNeg) => addNum(a, { num: b.num, neg: !b.neg });

		const lessThan = (b: NumNeg, a: NumNeg) =>
			a.neg !== b.neg ? a.neg : (a.neg && a.num > b.num) || (!a.neg && a.num < b.num);

		const greaterThan = (b: NumNeg, a: NumNeg) =>
			a.neg !== b.neg ? !a.neg : (a.neg && a.num < b.num) || (!a.neg && a.num > b.num);

		const lessThanOrEqual = (b: NumNeg, a: NumNeg) =>
			a.neg !== b.neg ? a.neg : (a.neg && a.num >= b.num) || (!a.neg && a.num <= b.num);

		const greaterThanOrEqual = (b: NumNeg, a: NumNeg) =>
			a.neg !== b.neg ? !a.neg : (a.neg && a.num <= b.num) || (!a.neg && a.num >= b.num);

		let i = 0;

		// eslint-disable-next-line no-inner-declarations
		async function step() {
			// Skip branch
			if (branchExec.length > 0 && !branchExec[branchExec.length - 1]) {
				let sub = 0; // sub branch
				let psub = 0; // previous sub
				while (i < chunks.length) {
					const { opcode } = chunks[i];
					const prevOp = chunks[i - 1].opcode;
					// Because we trace the previous chunk, this funky code works out if
					// it is an opcode that is executed or not
					const executed =
						(prevOp === OP_CODES.OP_IF && sub === 0) ||
						([OP_CODES.OP_ELSE, OP_CODES.OP_ENDIF].includes(prevOp) && psub === 0);
					traceStack(i - 1, executed);
					psub = sub;
					if (opcode === OP_CODES.OP_IF || opcode === OP_CODES.OP_NOTIF) {
						sub++;
					} else if (opcode === OP_CODES.OP_ENDIF) {
						if (sub === 0) break;
						sub--;
					} else if (opcode === OP_CODES.OP_ELSE) {
						if (!sub) break;
					}
					i++;
				}
				if (i >= chunks.length) {
					done = true;
					return;
				}
			} else {
				traceStack(i - 1);
			}

			const chunk = chunks[i++];

			if (chunk.buf) {
				stack.push(chunk.buf);
				return;
			}

			switch (chunk.opcode) {
				case OP_CODES.OP_1NEGATE:
					stack.push(new Uint8Array([0x81]));
					break;
				case OP_CODES.OP_0:
					stack.push(new Uint8Array([]));
					break;
				case OP_CODES.OP_1:
					stack.push(new Uint8Array([1]));
					break;
				case OP_CODES.OP_2:
					stack.push(new Uint8Array([2]));
					break;
				case OP_CODES.OP_3:
					stack.push(new Uint8Array([3]));
					break;
				case OP_CODES.OP_4:
					stack.push(new Uint8Array([4]));
					break;
				case OP_CODES.OP_5:
					stack.push(new Uint8Array([5]));
					break;
				case OP_CODES.OP_6:
					stack.push(new Uint8Array([6]));
					break;
				case OP_CODES.OP_7:
					stack.push(new Uint8Array([7]));
					break;
				case OP_CODES.OP_8:
					stack.push(new Uint8Array([8]));
					break;
				case OP_CODES.OP_9:
					stack.push(new Uint8Array([9]));
					break;
				case OP_CODES.OP_10:
					stack.push(new Uint8Array([10]));
					break;
				case OP_CODES.OP_11:
					stack.push(new Uint8Array([11]));
					break;
				case OP_CODES.OP_12:
					stack.push(new Uint8Array([12]));
					break;
				case OP_CODES.OP_13:
					stack.push(new Uint8Array([13]));
					break;
				case OP_CODES.OP_14:
					stack.push(new Uint8Array([14]));
					break;
				case OP_CODES.OP_15:
					stack.push(new Uint8Array([15]));
					break;
				case OP_CODES.OP_16:
					stack.push(new Uint8Array([16]));
					break;
				case OP_CODES.OP_NOP:
					break;
				case OP_CODES.OP_IF:
					branchExec.push(popBool());
					break;
				case OP_CODES.OP_NOTIF:
					branchExec.push(!popBool());
					break;
				case OP_CODES.OP_ELSE:
					if (!branchExec.length) throw new Error('ELSE found without matching IF');
					branchExec[branchExec.length - 1] = !branchExec[branchExec.length - 1];
					break;
				case OP_CODES.OP_ENDIF:
					if (!branchExec.length) throw new Error('ENDIF found without matching IF');
					branchExec.pop();
					break;
				case OP_CODES.OP_VERIFY:
					if (!popBool()) throw new Error('OP_VERIFY failed');
					break;
				case OP_CODES.OP_RETURN:
					done = true;
					break;
				case OP_CODES.OP_TOALTSTACK:
					altStack.push(pop());
					break;
				case OP_CODES.OP_FROMALTSTACK:
					stack.push(altpop());
					break;
				case OP_CODES.OP_IFDUP:
					{
						const v = pop();
						stack.push(v);
						if (v.some((x) => x)) stack.push(new Uint8Array(v));
					}
					break;
				case OP_CODES.OP_DEPTH:
					stack.push(encodeNum(BigInt(stack.length)));
					break;
				case OP_CODES.OP_DROP:
					pop();
					break;
				case OP_CODES.OP_DUP:
					{
						const v = pop();
						stack.push(v);
						stack.push(new Uint8Array(v));
					}
					break;
				case OP_CODES.OP_NIP:
					{
						const x2 = pop();
						pop();
						stack.push(x2);
					}
					break;
				case OP_CODES.OP_OVER:
					{
						const x2 = pop();
						const x1 = pop();
						stack.push(x1, x2, x1);
					}
					break;
				case OP_CODES.OP_PICK:
					{
						const v = pop();
						const n = decodeNum(v);
						if (n.neg || n.num >= stack.length) throw new Error('OP_PICK failed, out of range');
						stack.push(new Uint8Array(stack[stack.length - Number(n.num) - 1]));
					}
					break;
				case OP_CODES.OP_ROLL:
					{
						const v = pop();
						const n = decodeNum(v);
						if (n.neg || Number(n.num) >= stack.length) throw new Error('OP_ROLL failed, out of range');
						stack.push(stack.splice(stack.length - Number(n.num) - 1, 1)[0]);
					}
					break;
				case OP_CODES.OP_ROT:
					{
						const x3 = pop();
						const x2 = pop();
						const x1 = pop();
						stack.push(x2, x3, x1);
					}
					break;
				case OP_CODES.OP_SWAP:
					{
						const x2 = pop();
						const x1 = pop();
						stack.push(x2, x1);
					}
					break;
				case OP_CODES.OP_TUCK:
					{
						const x2 = pop();
						const x1 = pop();
						stack.push(x2, x1, x2);
					}
					break;
				case OP_CODES.OP_2DROP:
					pop();
					pop();
					break;
				case OP_CODES.OP_2DUP:
					{
						const x2 = pop();
						const x1 = pop();
						stack.push(x1, x2, x1, x2);
					}
					break;
				case OP_CODES.OP_3DUP:
					{
						const x3 = pop();
						const x2 = pop();
						const x1 = pop();
						stack.push(x1, x2, x3, x1, x2, x3);
					}
					break;
				case OP_CODES.OP_2OVER:
					{
						const x4 = pop();
						const x3 = pop();
						const x2 = pop();
						const x1 = pop();
						stack.push(x1, x2, x3, x4, x1, x2);
					}
					break;
				case OP_CODES.OP_2ROT:
					{
						const x6 = pop();
						const x5 = pop();
						const x4 = pop();
						const x3 = pop();
						const x2 = pop();
						const x1 = pop();
						stack.push(x3, x4, x5, x6, x1, x2);
					}
					break;
				case OP_CODES.OP_2SWAP:
					{
						const x4 = pop();
						const x3 = pop();
						const x2 = pop();
						const x1 = pop();
						stack.push(x3, x4, x1, x2);
					}
					break;
				case OP_CODES.OP_CAT:
					{
						const x2 = pop();
						const x1 = pop();
						stack.push(new Uint8Array([...x1, ...x2]));
					}
					break;
				case OP_CODES.OP_SPLIT:
					{
						const v = pop();
						const n = decodeNum(v);
						const x = pop();
						if (n.neg || Number(n.num) > x.length) throw new Error('OP_SPLIT failed, out of range');
						stack.push(x.slice(0, Number(n.num)), x.slice(Number(n.num)));
					}
					break;
				case OP_CODES.OP_SIZE:
					{
						const x = pop();
						stack.push(x);
						stack.push(encodeNum(x.length));
					}
					break;
				case OP_CODES.OP_INVERT:
					{
						const v = pop();
						stack.push(v.map((ai) => ai ^ 0xff));
					}
					break;
				case OP_CODES.OP_AND:
					{
						const a = pop();
						const b = pop();
						if (a.length !== b.length) throw new Error('OP_AND failed, different sizes');
						stack.push(a.map((ai, j) => ai & b[j]));
					}
					break;
				case OP_CODES.OP_OR:
					{
						const a = pop();
						const b = pop();
						if (a.length !== b.length) throw new Error('OP_OR failed, different sizes');
						stack.push(a.map((ai, j) => ai | b[j]));
					}
					break;
				case OP_CODES.OP_XOR:
					{
						const a = pop();
						const b = pop();
						if (a.length !== b.length) throw new Error('OP_XOR failed, different sizes');
						stack.push(a.map((ai, j) => ai ^ b[j]));
					}
					break;
				case OP_CODES.OP_EQUAL:
					{
						const a = pop();
						const b = pop();
						const equal = a.length === b.length && !a.some((ai, j) => ai !== b[j]);
						stack.push(encodeNum(equal ? 1 : 0));
					}
					break;
				case OP_CODES.OP_EQUALVERIFY:
					{
						const a = pop();
						const b = pop();
						const equal = a.length === b.length && !a.some((ai, j) => ai !== b[j]);
						if (!equal) throw new Error('OP_EQUALVERIFY failed');
					}
					break;
				case OP_CODES.OP_LSHIFT:
					{
						const n = decodeNum(pop());
						if (n.neg) throw new Error('OP_LSHIFT failed, n negative');
						stack.push(lshift(pop(), Number(n.num)));
					}
					break;
				case OP_CODES.OP_RSHIFT:
					{
						const n = decodeNum(pop());
						if (n.neg) throw new Error('OP_RSHIFT failed, n negative');
						stack.push(rshift(pop(), Number(n.num)));
					}
					break;
				case OP_CODES.OP_1ADD:
					{
						const num1 = addNum(decodeNum(pop()), { num: BigInt(1), neg: false });
						stack.push(encodeNum(num1.num, num1.neg));
					}
					break;
				case OP_CODES.OP_1SUB:
					{
						const num2 = addNum(decodeNum(pop()), { num: BigInt(1), neg: true });
						stack.push(encodeNum(num2.num, num2.neg));
					}
					break;
				case OP_CODES.OP_NEGATE:
					{
						const n = decodeNum(pop());
						stack.push(encodeNum(n.num, !n.neg));
					}
					break;
				case OP_CODES.OP_ABS:
					{
						const n = decodeNum(pop());
						stack.push(encodeNum(n.num));
					}
					break;
				case OP_CODES.OP_NOT:
					{
						const n = decodeNum(pop());
						stack.push(n.num === BigInt(0) ? encodeNum(1) : encodeNum(0));
					}
					break;
				case OP_CODES.OP_0NOTEQUAL:
					{
						const n = decodeNum(pop());
						stack.push(n.num === BigInt(0) ? encodeNum(0) : encodeNum(1));
					}
					break;
				case OP_CODES.OP_ADD:
					{
						const n = addNum(decodeNum(pop()), decodeNum(pop()));
						stack.push(encodeNum(n.num, n.neg));
					}
					break;
				case OP_CODES.OP_SUB:
					{
						const m = subNum(decodeNum(pop()), decodeNum(pop()));
						stack.push(encodeNum(m.num, m.neg));
					}
					break;
				case OP_CODES.OP_MUL:
					{
						const b = decodeNum(pop());
						const a = decodeNum(pop());
						stack.push(encodeNum(a.num * b.num, a.neg !== b.neg));
					}
					break;
				case OP_CODES.OP_DIV:
					{
						const b = decodeNum(pop());
						const a = decodeNum(pop());
						if (b.num === BigInt(0)) throw new Error('OP_DIV failed, divide by 0');
						stack.push(encodeNum(a.num / b.num, a.neg !== b.neg));
					}
					break;
				case OP_CODES.OP_MOD:
					{
						const b = decodeNum(pop());
						const a = decodeNum(pop());
						if (b.num === BigInt(0)) throw new Error('OP_DIV failed, divide by 0');
						stack.push(encodeNum(a.num % b.num, a.neg));
					}
					break;
				case OP_CODES.OP_BOOLAND:
					{
						const a = popBool();
						const b = popBool();
						stack.push(encodeNum(a && b ? 1 : 0));
					}
					break;
				case OP_CODES.OP_BOOLOR:
					{
						const a = popBool();
						const b = popBool();
						stack.push(encodeNum(a || b ? 1 : 0));
					}
					break;
				case OP_CODES.OP_NUMEQUAL:
					{
						const b = decodeNum(pop());
						const a = decodeNum(pop());
						stack.push(encodeNum(a.num === b.num && a.neg === b.neg ? 1 : 0));
					}
					break;
				case OP_CODES.OP_NUMEQUALVERIFY:
					{
						const b = decodeNum(pop());
						const a = decodeNum(pop());
						if (a.num !== b.num || a.neg !== b.neg) throw new Error('OP_NUMEQUALVERIFY failed');
					}
					break;
				case OP_CODES.OP_NUMNOTEQUAL:
					{
						const b = decodeNum(pop());
						const a = decodeNum(pop());
						stack.push(encodeNum(a.num !== b.num || a.neg !== b.neg ? 1 : 0));
					}
					break;
				case OP_CODES.OP_LESSTHAN:
					stack.push(encodeNum(lessThan(decodeNum(pop()), decodeNum(pop())) ? 1 : 0));
					break;
				case OP_CODES.OP_GREATERTHAN:
					stack.push(encodeNum(greaterThan(decodeNum(pop()), decodeNum(pop())) ? 1 : 0));
					break;
				case OP_CODES.OP_LESSTHANOREQUAL:
					stack.push(encodeNum(lessThanOrEqual(decodeNum(pop()), decodeNum(pop())) ? 1 : 0));
					break;
				case OP_CODES.OP_GREATERTHANOREQUAL:
					stack.push(encodeNum(greaterThanOrEqual(decodeNum(pop()), decodeNum(pop())) ? 1 : 0));
					break;
				case OP_CODES.OP_MIN:
					{
						const b = decodeNum(pop());
						const a = decodeNum(pop());
						const n = lessThan(b, a) ? a : b;
						stack.push(encodeNum(n.num, n.neg));
					}
					break;
				case OP_CODES.OP_MAX:
					{
						const b = decodeNum(pop());
						const a = decodeNum(pop());
						const n = greaterThan(b, a) ? a : b;
						stack.push(encodeNum(n.num, n.neg));
					}
					break;
				case OP_CODES.OP_WITHIN:
					{
						const max = decodeNum(pop());
						const min = decodeNum(pop());
						const x = decodeNum(pop());
						stack.push(encodeNum(greaterThanOrEqual(min, x) && lessThan(max, x) ? 1 : 0));
					}
					break;
				case OP_CODES.OP_BIN2NUM:
					{
						const num = decodeNum(pop());
						stack.push(encodeNum(num.num, num.neg));
					}
					break;
				case OP_CODES.OP_NUM2BIN:
					{
						const m = decodeNum(pop());
						const narr = pop();
						const n = decodeNum(narr);
						const oor =
							m.neg || m.num < BigInt(1) || m.num < BigInt(narr.length) || m.num > BigInt(2147483647);
						if (oor) throw new Error('OP_NUM2BIN failed, out of range');
						const arr = Array.from(decodeHex(BigInt(n.num).toString(16)));
						for (let j = arr.length; j < Number(m.num); j++) arr.push(0x00);
						const full = arr[arr.length - 1] & 0x80;
						if (full) arr.push(0x00);
						if (n.neg) {
							arr[arr.length - 1] |= n.neg ? 0x80 : 0x00;
						}
						stack.push(new Uint8Array(arr));
					}
					break;
				case OP_CODES.OP_RIPEMD160:
					stack.push(ripemd160(pop()));
					return;

				case OP_CODES.OP_SHA1:
					stack.push(sha1(pop()));
					return;

				case OP_CODES.OP_SHA256:
					stack.push(sha256(pop()));
					return;

				case OP_CODES.OP_HASH160:
					stack.push(ripemd160(sha256(pop())));
					return;

				case OP_CODES.OP_HASH256:
					stack.push(sha256(sha256(pop())));
					return;

				case OP_CODES.OP_CODESEPARATOR:
					checkIndex = i + 1;
					break;
				case OP_CODES.OP_CHECKSIG:
				case OP_CODES.OP_CHECKSIGVERIFY:
					{
						const pubkeybytes = pop();
						const pubkey = decodePublicKey(pubkeybytes);
						const signature = pop();
						const cleanedScript = lockScript.slice(checkIndex);

						const check = (verified: boolean) => {
							if (chunk.opcode === OP_CODES.OP_CHECKSIG) {
								stack.push(encodeNum(verified ? 1 : 0));
							} else if (!verified) throw new Error('OP_CHECKSIGVERIFY failed');
						};
						check(await verifyTxSignature(tx, vin, signature, pubkey, cleanedScript, parentSatoshis));
					}
					break;
				case OP_CODES.OP_CHECKMULTISIG:
				case OP_CODES.OP_CHECKMULTISIGVERIFY:
					{
						// Pop the keys
						const total = decodeNum(pop());
						if (total.neg) throw new Error('OP_CHECKMULTISIG failed, out of range');
						const keys = [];
						for (let j = 0; j < Number(total.num); j++) {
							const pubkey = decodePublicKey(pop());
							keys.push(pubkey);
						}

						// Pop the sigs
						const required = decodeNum(pop());
						if (required.neg || required.num > total.num)
							throw new Error('OP_CHECKMULTISIG failed, out of range');
						const sigs = [];
						for (let j = 0; j < Number(required.num); j++) {
							sigs.push(pop());
						}

						// Pop one more off. This isn't used and can't be changed.
						pop();

						// Verify the sigs
						let key = 0;
						let sig = 0;
						let success = true;
						const cleanedScript = lockScript.slice(checkIndex);

						const check = (succ: boolean) => {
							if (chunk.opcode === OP_CODES.OP_CHECKMULTISIG) {
								stack.push(encodeNum(succ ? 1 : 0));
							} else if (!succ) throw new Error('OP_CHECKMULTISIGVERIFY failed');
						};

						while (sig < sigs.length) {
							if (key === keys.length) {
								success = false;
								break;
							}
							// eslint-disable-next-line no-await-in-loop
							const verified = await verifyTxSignature(
								tx,
								vin,
								sigs[sig],
								keys[key],
								cleanedScript,
								parentSatoshis
							);
							if (verified) {
								sig++;
							}
							key++;
						}
						check(success);
					}
					break;
				case OP_CODES.OP_NOP1:
					break;
				case OP_CODES.OP_NOP2:
					break;
				case OP_CODES.OP_NOP3:
					break;
				case OP_CODES.OP_NOP4:
					break;
				case OP_CODES.OP_NOP5:
					break;
				case OP_CODES.OP_NOP6:
					break;
				case OP_CODES.OP_NOP7:
					break;
				case OP_CODES.OP_NOP8:
					break;
				case OP_CODES.OP_NOP9:
					break;
				case OP_CODES.OP_NOP10:
					break;
				default:
					throw new Error(`reserved opcode: ${chunk.opcode}`);
			}
		}

		// eslint-disable-next-line no-await-in-loop
		while (i < chunks.length && !done) await step();
		return finish();
	} catch (e) {
		const err = e instanceof Error ? e : null;
		return finish(err);
	}
}
