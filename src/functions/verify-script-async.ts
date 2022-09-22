import verifyScript from './verify-script';

function verifyScriptAsync(unlockScript, lockScript, tx, vin, parentSatoshis) {
	return verifyScript(unlockScript, lockScript, tx, vin, parentSatoshis, true);
}

export default verifyScriptAsync;
