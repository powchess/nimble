import encodeHex from './encode-hex';
import decodeHex from './decode-hex';
import decodeScriptChunks from './decode-script-chunks';
import verifyTxSignature from './verify-tx-signature';
import verifyTxSignatureAsync from './verify-tx-signature-async';
import ripemd160Async from './ripemd160-async';
import sha1Async from './sha1-async';
import sha256Async from './sha256-async';
import decodePublicKey from './decode-public-key';
import ripemd160 from './ripemd160';
import sha1 from './sha1';
import sha256 from './sha256';
import Transaction from 'classes/transaction';

const defaults = {
	async: false,
	trace: true,
};

export default function evalScript(
	unlockScript: Uint8Array,
	lockScript: Uint8Array,
	tx: Transaction,
	vin: number,
	parentSatoshis: number,
	opts = {}
) {
	const { async, trace } = {
		...defaults,
		...opts,
	};

	const chunks = [];
	const stack = [];
	const altStack = [];
	const branchExec = [];
	const stackTrace = [];
	let checkIndex = 0;
	let done = false;

	function traceStack(i, exec = true) {
		if (trace && i >= 0) {
			const { opcode } = chunks[i];
			stackTrace.push([{ opcode, exec }, [...stack], [...altStack]]);
		}
	}

	function finish(error = null) {
		if (stackTrace.length) traceStack(stackTrace.length);
		if (!error && branchExec.length) error = new Error('ENDIF missing');
		const success = !error && !!stack.length && stack[stack.length - 1].some((x) => x);
		if (!error && !success) error = new Error('top of stack is false');

		return {
			success,
			error,
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
			if (!stack.length) throw new Error('stack empty');
			return stack.pop();
		};

		const altpop = () => {
			if (!altStack.length) throw new Error('alt stack empty');
			return altStack.pop();
		};

		const popBool = () => pop().some((x) => x);

		const encodeNum = (num, neg) => {
			if (typeof num === 'object') {
				neg = num.neg;
				num = num.num;
			}
			if (BigInt(num) === BigInt(0)) return [];
			const arr = Array.from(decodeHex(BigInt(num).toString(16))).reverse();
			const full = arr[arr.length - 1] & 0x80;
			if (full) arr.push(0x00);
			if (neg) arr[arr.length - 1] |= 0x80;
			return arr;
		};

		const decodeNum = (arr) => {
			if (!arr.length) return { num: BigInt(0), neg: false };
			const neg = !!(arr[arr.length - 1] & 0x80);
			arr[arr.length - 1] &= 0x7f;
			const num = BigInt(`0x${encodeHex(Array.from(arr).reverse())}`);
			return { num, neg };
		};

		const addNum = (a, b) => {
			if (a.neg === b.neg) {
				return { num: a.num + b.num, neg: a.neg };
			} else {
				return a.num > b.num ? { num: a.num - b.num, neg: a.neg } : { num: b.num - a.num, neg: b.neg };
			}
		};

		const subNum = (b, a) => addNum(a, { num: b.num, neg: !b.neg });

		const lessThan = (b, a) => (a.neg !== b.neg ? a.neg : (a.neg && a.num > b.num) || (!a.neg && a.num < b.num));

		const greaterThan = (b, a) =>
			a.neg !== b.neg ? !a.neg : (a.neg && a.num < b.num) || (!a.neg && a.num > b.num);

		const lessThanOrEqual = (b, a) =>
			a.neg !== b.neg ? a.neg : (a.neg && a.num >= b.num) || (!a.neg && a.num <= b.num);

		const greaterThanOrEqual = (b, a) =>
			a.neg !== b.neg ? !a.neg : (a.neg && a.num <= b.num) || (!a.neg && a.num >= b.num);

		let i = 0;

		function step() {
			// Skip branch
			if (branchExec.length > 0 && !branchExec[branchExec.length - 1]) {
				let sub = 0; // sub branch
				let psub = 0; // previous sub
				while (i < chunks.length) {
					const opcode = chunks[i].opcode;
					const prevOp = chunks[i - 1].opcode;
					// Because we trace the previous chunk, this funky code works out if
					// it is an opcode that is executed or not
					const executed =
						(prevOp === OP_IF && sub === 0) || ([OP_ELSE, OP_ENDIF].includes(prevOp) && psub === 0);
					traceStack(i - 1, executed);
					psub = sub;
					if (opcode === OP_IF || opcode === OP_NOTIF) {
						sub++;
					} else if (opcode === OP_ENDIF) {
						if (sub === 0) break;
						sub--;
					} else if (opcode === OP_ELSE) {
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
				case OP_1NEGATE:
					stack.push([0x81]);
					break;
				case OP_0:
					stack.push([]);
					break;
				case OP_1:
					stack.push([1]);
					break;
				case OP_2:
					stack.push([2]);
					break;
				case OP_3:
					stack.push([3]);
					break;
				case OP_4:
					stack.push([4]);
					break;
				case OP_5:
					stack.push([5]);
					break;
				case OP_6:
					stack.push([6]);
					break;
				case OP_7:
					stack.push([7]);
					break;
				case OP_8:
					stack.push([8]);
					break;
				case OP_9:
					stack.push([9]);
					break;
				case OP_10:
					stack.push([10]);
					break;
				case OP_11:
					stack.push([11]);
					break;
				case OP_12:
					stack.push([12]);
					break;
				case OP_13:
					stack.push([13]);
					break;
				case OP_14:
					stack.push([14]);
					break;
				case OP_15:
					stack.push([15]);
					break;
				case OP_16:
					stack.push([16]);
					break;
				case OP_NOP:
					break;
				case OP_IF:
					branchExec.push(popBool());
					break;
				case OP_NOTIF:
					branchExec.push(!popBool());
					break;
				case OP_ELSE:
					if (!branchExec.length) throw new Error('ELSE found without matching IF');
					branchExec[branchExec.length - 1] = !branchExec[branchExec.length - 1];
					break;
				case OP_ENDIF:
					if (!branchExec.length) throw new Error('ENDIF found without matching IF');
					branchExec.pop();
					break;
				case OP_VERIFY:
					if (!popBool()) throw new Error('OP_VERIFY failed');
					break;
				case OP_RETURN:
					done = true;
					break;
				case OP_TOALTSTACK:
					altStack.push(pop());
					break;
				case OP_FROMALTSTACK:
					stack.push(altpop());
					break;
				case OP_IFDUP:
					{
						const v = pop();
						stack.push(v);
						if (v.some((x) => x)) stack.push(Array.from(v));
					}
					break;
				case OP_DEPTH:
					stack.push(encodeNum(BigInt(stack.length)));
					break;
				case OP_DROP:
					pop();
					break;
				case OP_DUP:
					{
						const v = pop();
						stack.push(v);
						stack.push(Array.from(v));
					}
					break;
				case OP_NIP:
					{
						const x2 = pop();
						pop();
						stack.push(x2);
					}
					break;
				case OP_OVER:
					{
						const x2 = pop();
						const x1 = pop();
						stack.push(x1, x2, x1);
					}
					break;
				case OP_PICK:
					{
						const n = decodeNum(pop());
						if (n.neg || n.num >= stack.length) throw new Error('OP_PICK failed, out of range');
						stack.push(Array.from(stack[stack.length - Number(n.num) - 1]));
					}
					break;
				case OP_ROLL:
					{
						const n = decodeNum(pop());
						if (n.neg || Number(n.num) >= stack.length) throw new Error('OP_ROLL failed, out of range');
						stack.push(stack.splice(stack.length - Number(n.num) - 1, 1)[0]);
					}
					break;
				case OP_ROT:
					{
						const x3 = pop();
						const x2 = pop();
						const x1 = pop();
						stack.push(x2, x3, x1);
					}
					break;
				case OP_SWAP:
					{
						const x2 = pop();
						const x1 = pop();
						stack.push(x2, x1);
					}
					break;
				case OP_TUCK:
					{
						const x2 = pop();
						const x1 = pop();
						stack.push(x2, x1, x2);
					}
					break;
				case OP_2DROP:
					pop();
					pop();
					break;
				case OP_2DUP:
					{
						const x2 = pop();
						const x1 = pop();
						stack.push(x1, x2, x1, x2);
					}
					break;
				case OP_3DUP:
					{
						const x3 = pop();
						const x2 = pop();
						const x1 = pop();
						stack.push(x1, x2, x3, x1, x2, x3);
					}
					break;
				case OP_2OVER:
					{
						const x4 = pop();
						const x3 = pop();
						const x2 = pop();
						const x1 = pop();
						stack.push(x1, x2, x3, x4, x1, x2);
					}
					break;
				case OP_2ROT:
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
				case OP_2SWAP:
					{
						const x4 = pop();
						const x3 = pop();
						const x2 = pop();
						const x1 = pop();
						stack.push(x3, x4, x1, x2);
					}
					break;
				case OP_CAT:
					{
						const x2 = pop();
						const x1 = pop();
						stack.push(Array.from([...x1, ...x2]));
					}
					break;
				case OP_SPLIT:
					{
						const n = decodeNum(pop());
						const x = pop();
						if (n.neg || Number(n.num) > x.length) throw new Error('OP_SPLIT failed, out of range');
						stack.push(x.slice(0, Number(n.num)), x.slice(Number(n.num)));
					}
					break;
				case OP_SIZE:
					{
						const x = pop();
						stack.push(x);
						stack.push(encodeNum(x.length));
					}
					break;
				case OP_INVERT:
					stack.push(pop().map((ai) => ai ^ 0xff));
					break;
				case OP_AND:
					{
						const a = pop();
						const b = pop();
						if (a.length !== b.length) throw new Error('OP_AND failed, different sizes');
						stack.push(a.map((ai, i) => ai & b[i]));
					}
					break;
				case OP_OR:
					{
						const a = pop();
						const b = pop();
						if (a.length !== b.length) throw new Error('OP_OR failed, different sizes');
						stack.push(a.map((ai, i) => ai | b[i]));
					}
					break;
				case OP_XOR:
					{
						const a = pop();
						const b = pop();
						if (a.length !== b.length) throw new Error('OP_XOR failed, different sizes');
						stack.push(a.map((ai, i) => ai ^ b[i]));
					}
					break;
				case OP_EQUAL:
					{
						const a = pop();
						const b = pop();
						const equal = a.length === b.length && !a.some((ai, i) => ai !== b[i]);
						stack.push(encodeNum(equal ? 1 : 0));
					}
					break;
				case OP_EQUALVERIFY:
					{
						const a = pop();
						const b = pop();
						const equal = a.length === b.length && !a.some((ai, i) => ai !== b[i]);
						if (!equal) throw new Error('\'OP_EQUALVERIFY failed"');
					}
					break;
				case OP_LSHIFT:
					{
						const n = decodeNum(pop());
						if (n.neg) throw new Error('OP_LSHIFT failed, n negative');
						stack.push(lshift(pop(), Number(n.num)));
					}
					break;
				case OP_RSHIFT:
					{
						const n = decodeNum(pop());
						if (n.neg) throw new Error('OP_RSHIFT failed, n negative');
						stack.push(rshift(pop(), Number(n.num)));
					}
					break;
				case OP_1ADD:
					stack.push(encodeNum(addNum(decodeNum(pop()), { num: BigInt(1), neg: false })));
					break;
				case OP_1SUB:
					stack.push(encodeNum(addNum(decodeNum(pop()), { num: BigInt(1), neg: true })));
					break;
				case OP_NEGATE:
					{
						const n = decodeNum(pop());
						stack.push(encodeNum({ num: n.num, neg: !n.neg }));
					}
					break;
				case OP_ABS:
					{
						const n = decodeNum(pop());
						stack.push(encodeNum(n.num));
					}
					break;
				case OP_NOT:
					{
						const n = decodeNum(pop());
						stack.push(n.num === BigInt(0) ? encodeNum(1) : encodeNum(0));
					}
					break;
				case OP_0NOTEQUAL:
					{
						const n = decodeNum(pop());
						stack.push(n.num === BigInt(0) ? encodeNum(0) : encodeNum(1));
					}
					break;
				case OP_ADD:
					stack.push(encodeNum(addNum(decodeNum(pop()), decodeNum(pop()))));
					break;
				case OP_SUB:
					stack.push(encodeNum(subNum(decodeNum(pop()), decodeNum(pop()))));
					break;
				case OP_MUL:
					{
						const b = decodeNum(pop());
						const a = decodeNum(pop());
						stack.push(encodeNum(a.num * b.num, a.neg !== b.neg));
					}
					break;
				case OP_DIV:
					{
						const b = decodeNum(pop());
						const a = decodeNum(pop());
						if (b.num === BigInt(0)) throw new Error('OP_DIV failed, divide by 0');
						stack.push(encodeNum(a.num / b.num, a.neg !== b.neg));
					}
					break;
				case OP_MOD:
					{
						const b = decodeNum(pop());
						const a = decodeNum(pop());
						if (b.num === BigInt(0)) throw new Error('OP_DIV failed, divide by 0');
						stack.push(encodeNum(a.num % b.num, a.neg));
					}
					break;
				case OP_BOOLAND:
					{
						const a = popBool();
						const b = popBool();
						stack.push(encodeNum(a && b ? 1 : 0));
					}
					break;
				case OP_BOOLOR:
					{
						const a = popBool();
						const b = popBool();
						stack.push(encodeNum(a || b ? 1 : 0));
					}
					break;
				case OP_NUMEQUAL:
					{
						const b = decodeNum(pop());
						const a = decodeNum(pop());
						stack.push(encodeNum(a.num === b.num && a.neg === b.neg ? 1 : 0));
					}
					break;
				case OP_NUMEQUALVERIFY:
					{
						const b = decodeNum(pop());
						const a = decodeNum(pop());
						if (a.num !== b.num || a.neg !== b.neg) throw new Error('OP_NUMEQUALVERIFY failed');
					}
					break;
				case OP_NUMNOTEQUAL:
					{
						const b = decodeNum(pop());
						const a = decodeNum(pop());
						stack.push(encodeNum(a.num !== b.num || a.neg !== b.neg ? 1 : 0));
					}
					break;
				case OP_LESSTHAN:
					stack.push(encodeNum(lessThan(decodeNum(pop()), decodeNum(pop())) ? 1 : 0));
					break;
				case OP_GREATERTHAN:
					stack.push(encodeNum(greaterThan(decodeNum(pop()), decodeNum(pop())) ? 1 : 0));
					break;
				case OP_LESSTHANOREQUAL:
					stack.push(encodeNum(lessThanOrEqual(decodeNum(pop()), decodeNum(pop())) ? 1 : 0));
					break;
				case OP_GREATERTHANOREQUAL:
					stack.push(encodeNum(greaterThanOrEqual(decodeNum(pop()), decodeNum(pop())) ? 1 : 0));
					break;
				case OP_MIN:
					{
						const b = decodeNum(pop());
						const a = decodeNum(pop());
						stack.push(encodeNum(lessThan(b, a) ? a : b));
					}
					break;
				case OP_MAX:
					{
						const b = decodeNum(pop());
						const a = decodeNum(pop());
						stack.push(encodeNum(greaterThan(b, a) ? a : b));
					}
					break;
				case OP_WITHIN:
					{
						const max = decodeNum(pop());
						const min = decodeNum(pop());
						const x = decodeNum(pop());
						stack.push(encodeNum(greaterThanOrEqual(min, x) && lessThan(max, x) ? 1 : 0));
					}
					break;
				case OP_BIN2NUM:
					stack.push(encodeNum(decodeNum(pop())));
					break;
				case OP_NUM2BIN:
					{
						const m = decodeNum(pop());
						const narr = pop();
						const n = decodeNum(narr);
						const oor =
							m.neg || m.num < BigInt(1) || m.num < BigInt(narr.length) || m.num > BigInt(2147483647);
						if (oor) throw new Error('OP_NUM2BIN failed, out of range');
						const arr = Array.from(decodeHex(BigInt(n.num).toString(16)));
						for (let i = arr.length; i < Number(m.num); i++) arr.push(0x00);
						const full = arr[arr.length - 1] & 0x80;
						if (full) arr.push(0x00);
						if (n.neg) {
							arr[arr.length - 1] |= n.neg ? 0x80 : 0x00;
						}
						stack.push(arr);
					}
					break;
				case OP_RIPEMD160:
					if (async) {
						return ripemd160Async(pop()).then((x) => stack.push(x));
					} else {
						stack.push(ripemd160(pop()));
						return;
					}
				case OP_SHA1:
					if (async) {
						return sha1Async(pop()).then((x) => stack.push(x));
					} else {
						stack.push(sha1(pop()));
						return;
					}
				case OP_SHA256:
					if (async) {
						return sha256Async(pop()).then((x) => stack.push(x));
					} else {
						stack.push(sha256(pop()));
						return;
					}
				case OP_HASH160:
					if (async) {
						return sha256Async(pop())
							.then((x) => ripemd160Async(x))
							.then((x) => stack.push(x));
					} else {
						stack.push(ripemd160(sha256(pop())));
						return;
					}
				case OP_HASH256:
					if (async) {
						return sha256Async(pop())
							.then((x) => sha256Async(x))
							.then((x) => stack.push(x));
					} else {
						stack.push(sha256(sha256(pop())));
						return;
					}
				case OP_CODESEPARATOR:
					checkIndex = i + 1;
					break;
				case OP_CHECKSIG:
				case OP_CHECKSIGVERIFY:
					{
						const pubkeybytes = pop();
						const pubkey = decodePublicKey(pubkeybytes);
						const signature = pop();
						const cleanedScript = lockScript.slice(checkIndex);

						const check = (verified) => {
							if (chunk.opcode === OP_CHECKSIG) {
								stack.push(encodeNum(verified ? 1 : 0));
							} else {
								if (!verified) throw new Error('OP_CHECKSIGVERIFY failed');
							}
						};

						if (async) {
							return verifyTxSignatureAsync(
								tx,
								vin,
								signature,
								pubkey,
								cleanedScript,
								parentSatoshis
							).then(check);
						} else {
							check(verifyTxSignature(tx, vin, signature, pubkey, cleanedScript, parentSatoshis));
						}
					}
					break;
				case OP_CHECKMULTISIG:
				case OP_CHECKMULTISIGVERIFY:
					{
						// Pop the keys
						const total = decodeNum(pop());
						if (total.neg) throw new Error('OP_CHECKMULTISIG failed, out of range');
						const keys = [];
						for (let i = 0; i < Number(total.num); i++) {
							const pubkey = decodePublicKey(pop());
							keys.push(pubkey);
						}

						// Pop the sigs
						const required = decodeNum(pop());
						if (required.neg || required.num > total.num)
							throw new Error('OP_CHECKMULTISIG failed, out of range');
						const sigs = [];
						for (let i = 0; i < Number(required.num); i++) {
							sigs.push(pop());
						}

						// Pop one more off. This isn't used and can't be changed.
						pop();

						// Verify the sigs
						let key = 0;
						let sig = 0;
						let success = true;
						const cleanedScript = lockScript.slice(checkIndex);

						const check = (success) => {
							if (chunk.opcode === OP_CHECKMULTISIG) {
								stack.push(encodeNum(success ? 1 : 0));
							} else {
								if (!success) throw new Error('OP_CHECKMULTISIGVERIFY failed');
							}
						};

						if (async) {
							return (async () => {
								while (sig < sigs.length) {
									if (key === keys.length) {
										success = false;
										break;
									}
									const verified = await verifyTxSignatureAsync(
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
								return success;
							})().then(check);
						} else {
							while (sig < sigs.length) {
								if (key === keys.length) {
									success = false;
									break;
								}
								const verified = verifyTxSignature(
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
					}
					break;
				case OP_NOP1:
					break;
				case OP_NOP2:
					break;
				case OP_NOP3:
					break;
				case OP_NOP4:
					break;
				case OP_NOP5:
					break;
				case OP_NOP6:
					break;
				case OP_NOP7:
					break;
				case OP_NOP8:
					break;
				case OP_NOP9:
					break;
				case OP_NOP10:
					break;
				default:
					throw new Error(`reserved opcode: ${chunk.opcode}`);
			}
		}

		if (async) {
			return (async () => {
				try {
					while (i < chunks.length && !done) await step();
					return finish();
				} catch (e) {
					const vm = finish(e);
					return Promise.resolve(vm);
				}
			})();
		} else {
			while (i < chunks.length && !done) step();
			return finish();
		}
	} catch (e) {
		const vm = finish(e);
		return async ? Promise.resolve(vm) : vm;
	}
}

const LSHIFT_MASK = [0xff, 0x7f, 0x3f, 0x1f, 0x0f, 0x07, 0x03, 0x01];

function lshift(arr, n) {
	const bitshift = n % 8;
	const byteshift = Math.floor(n / 8);
	const mask = LSHIFT_MASK[bitshift];
	const overflowmask = mask ^ 0xff;
	const result = Array.from(arr.length).fill(0);
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
	return result;
}

const RSHIFT_MASK = [0xff, 0xfe, 0xfc, 0xf8, 0xf0, 0xe0, 0xc0, 0x80];

function rshift(arr, n) {
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
	return result;
}
