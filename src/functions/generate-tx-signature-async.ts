import encodeDER from './encode-der';
import sighashAsync from './sighash-async';
import ecdsaSignAsync from './ecdsa-sign-async';
import Transaction from 'classes/transaction';
import { Point } from 'types/general';

const SIGHASH_ALL = 0x01;
const SIGHASH_FORKID = 0x40;

export default async function generateTxSignatureAsync(
	tx: Transaction,
	vin: number,
	parentScript: Uint8Array,
	parentSatoshis: number,
	privateKey: Uint8Array,
	publicKey: Point,
	sighashFlags = SIGHASH_ALL
) {
	sighashFlags |= SIGHASH_FORKID;
	const hash = await sighashAsync(tx, vin, parentScript, parentSatoshis, sighashFlags);
	const signature = await ecdsaSignAsync(hash, privateKey, publicKey);
	const dersig = encodeDER(signature);
	return Array.from([...dersig, sighashFlags]);
}
