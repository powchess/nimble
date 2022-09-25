import Transaction from 'classes/transaction';
import preimage from './preimage';
import sha256d from './sha256d';

function sighash(tx: Transaction, vin: number, parentScript: Uint8Array, parentSatoshis: number, sighashFlags: number) {
	// @ts-ignore
	return sha256d(preimage(tx, vin, parentScript, parentSatoshis, sighashFlags, false));
}

export default sighash;
