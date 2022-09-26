import Transaction from '../classes/transaction';
import evalScript from './eval-script';

export default function verifyScript(
	unlockScript: Uint8Array,
	lockScript: Uint8Array,
	tx: Transaction,
	vin: number,
	parentSatoshis: number
) {
	const vm = evalScript(unlockScript, lockScript, tx, vin, parentSatoshis, { trace: false });
	if (vm.error) throw vm.error;
	return vm.success;
}
