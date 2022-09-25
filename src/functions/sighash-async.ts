import Transaction from 'classes/transaction';
import sha256Async from './sha256-async';
import preimageAsync from './preimage-async';

async function sighashAsync(
	tx: Transaction,
	vin: number,
	parentScript: Uint8Array,
	parentSatoshis: number,
	sighashFlags: number
) {
	return preimageAsync(tx, vin, parentScript, parentSatoshis, sighashFlags).then(sha256Async).then(sha256Async);
}

export default sighashAsync;
