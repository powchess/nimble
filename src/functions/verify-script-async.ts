import Transaction from 'classes/transaction';
import verifyScript from './verify-script';

function verifyScriptAsync(
	unlockScript: Uint8Array,
	lockScript: Uint8Array,
	tx: Transaction,
	vin: number,
	parentSatoshis: number
) {
	return verifyScript(unlockScript, lockScript, tx, vin, parentSatoshis, true);
}

export default verifyScriptAsync;
