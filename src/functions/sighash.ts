import preimage from './preimage';
import sha256d from './sha256d';
import Transaction from 'classes/transaction';

function sighash(tx: Transaction, vin: number, parentScript: Uint8Array, parentSatoshis: number, sighashFlags: number) {
	// @ts-ignore
	return sha256d(preimage(tx, vin, parentScript, parentSatoshis, sighashFlags, false));
}

export default sighash;
