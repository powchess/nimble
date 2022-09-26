import { Point } from '../types/general';
import Transaction from '../classes/transaction';
import encodeDER from './encode-der';
import sighash from './sighash';
import ecdsaSign from './ecdsa-sign';

const SIGHASH_ALL = 0x01;
const SIGHASH_FORKID = 0x40;

export default async function generateTxSignature(
	tx: Transaction,
	vin: number,
	parentScript: Uint8Array,
	parentSatoshis: number,
	privateKey: Uint8Array,
	publicKey: Point,
	sighashFlags = SIGHASH_ALL
) {
	// eslint-disable-next-line no-bitwise, no-param-reassign
	sighashFlags |= SIGHASH_FORKID;
	const hash = await sighash(tx, vin, parentScript, parentSatoshis, sighashFlags);
	const signature = await ecdsaSign(hash, privateKey, publicKey);
	const dersig = encodeDER(signature);
	return new Uint8Array([...dersig, sighashFlags]);
}
