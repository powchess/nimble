import preimage from './preimage';
import Transaction from 'classes/transaction';

export default async function preimageAsync(
	tx: Transaction,
	vin: number,
	parentScript: Uint8Array,
	parentSatoshis: number,
	sighashFlags: number
) {
	return await preimage(tx, vin, parentScript, parentSatoshis, sighashFlags, true);
}
