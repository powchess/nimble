import encodeDER from './encode-der';
import sighashAsync from './sighash-async';
import ecdsaSignAsync from './ecdsa-sign-async';

const SIGHASH_ALL = 0x01;
const SIGHASH_FORKID = 0x40;

export default async function generateTxSignatureAsync(
	tx,
	vin,
	parentScript,
	parentSatoshis,
	privateKey,
	publicKey,
	sighashFlags = SIGHASH_ALL
) {
	sighashFlags |= SIGHASH_FORKID;
	const hash = await sighashAsync(tx, vin, parentScript, parentSatoshis, sighashFlags);
	const signature = await ecdsaSignAsync(hash, privateKey, publicKey);
	const dersig = encodeDER(signature);
	return Array.from([...dersig, sighashFlags]);
}
