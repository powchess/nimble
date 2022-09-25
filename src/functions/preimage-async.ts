import Transaction from 'classes/transaction';
import preimage from './preimage';

export default async function preimageAsync(
	tx: Transaction,
	vin: number,
	parentScript: Uint8Array,
	parentSatoshis: number,
	sighashFlags: number
) {
	return preimage(tx, vin, parentScript, parentSatoshis, sighashFlags, true);
}
