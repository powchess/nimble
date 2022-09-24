import preimage from './preimage';
import sha256d from './sha256d';
import Transaction from 'classes/transaction';
import { ByteArray } from 'types/general';

function sighash(
	tx: Transaction,
	vin: number,
	parentScript: ByteArray,
	parentSatoshis: number,
	sighashFlags: number,
	async: boolean = false
): Uint8Array {
	return sha256d(preimage(tx, vin, parentScript, parentSatoshis, sighashFlags));
}

export default sighash;
