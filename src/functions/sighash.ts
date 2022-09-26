import Transaction from '../classes/transaction';
import preimage from './preimage';
import sha256d from './sha256d';

export default async function sighash(
	tx: Transaction,
	vin: number,
	parentScript: Uint8Array,
	parentSatoshis: number,
	sighashFlags: number
) {
	return sha256d(await preimage(tx, vin, parentScript, parentSatoshis, sighashFlags));
}
