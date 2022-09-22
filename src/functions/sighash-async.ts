import sighash from './sighash';

async function sighashAsync(tx, vin, parentScript, parentSatoshis, sighashFlags) {
	return await sighash(tx, vin, parentScript, parentSatoshis, sighashFlags, true);
}

export default sighashAsync;
