import { Point } from '../types/general';
import Transaction from '../classes/transaction';
import decodeDER from './decode-der';
import sighash from './sighash';
import ecdsaVerify from './ecdsa-verify';

export default async function verifyTxSignature(
	tx: Transaction,
	vin: number,
	signature: Uint8Array,
	pubkey: Point,
	parentScript: Uint8Array,
	parentSatoshis: number
) {
	const dersig = signature.slice(0, signature.length - 1);
	const sighashFlags = signature[signature.length - 1];
	const hash = await sighash(tx, vin, parentScript, parentSatoshis, sighashFlags);
	return ecdsaVerify(decodeDER(dersig), hash, pubkey);
}
