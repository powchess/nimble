import preimage from './preimage';
import preimageAsync from './preimage-async';
import sha256d from './sha256d';
import sha256Async from './sha256-async';
import Transaction from 'classes/transaction';
import { ByteArray } from 'types/general';

function sighash(
	tx: Transaction,
	vin: number,
	parentScript: ByteArray,
	parentSatoshis: number,
	sighashFlags: number,
	async: boolean = false
) {
	if (async) {
		return preimageAsync(tx, vin, parentScript, parentSatoshis, sighashFlags).then(sha256Async).then(sha256Async);
	} else {
		return sha256d(preimage(tx, vin, parentScript, parentSatoshis, sighashFlags));
	}
}

export default sighash;
