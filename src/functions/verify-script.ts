import Transaction from 'classes/transaction';
import evalScript from './eval-script';

function verifyScript(
	unlockScript: Uint8Array,
	lockScript: Uint8Array,
	tx: Transaction,
	vin: number,
	parentSatoshis: number,
	async = false
) {
	const vm = evalScript(unlockScript, lockScript, tx, vin, parentSatoshis, { async, trace: false });

	if (async) {
		// @ts-ignore
		return vm.then((vm) => (vm.error ? Promise.reject(vm.error) : vm.success));
	}
	// @ts-ignore
	if (vm.error) throw vm.error;
	// @ts-ignore
	return vm.success;
}

export default verifyScript;
