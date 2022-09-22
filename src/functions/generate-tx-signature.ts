import encodeDER from './encode-der';
import sighash from './sighash';
import ecdsaSign from './ecdsa-sign';

const SIGHASH_ALL = 0x01;
const SIGHASH_FORKID = 0x40;

export default function generateTxSignature(
	tx,
	vin,
	parentScript,
	parentSatoshis,
	privateKey,
	publicKey,
	sighashFlags = SIGHASH_ALL
) {
	sighashFlags |= SIGHASH_FORKID;
	const hash = sighash(tx, vin, parentScript, parentSatoshis, sighashFlags);
	const signature = ecdsaSign(hash, privateKey, publicKey);
	const dersig = encodeDER(signature);
	return new Uint8Array([...dersig, sighashFlags]);
}
