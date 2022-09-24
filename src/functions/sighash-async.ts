import sighash from './sighash';
import Transaction from 'classes/transaction';
import { ByteArray } from 'types/general';

async function sighashAsync(
	tx: Transaction,
	vin: number,
	parentScript: ByteArray,
	parentSatoshis: number,
	sighashFlags: number
) {
	return await preimageAsync(tx, vin, parentScript, parentSatoshis, sighashFlags).then(sha256Async).then(sha256Async);
}

export default sighashAsync;
