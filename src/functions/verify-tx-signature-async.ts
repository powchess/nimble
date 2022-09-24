import decodeDER from './decode-der';
import sighashAsync from './sighash-async';
import ecdsaVerifyAsync from './ecdsa-verify-async';
import Transaction from 'classes/transaction';
import { ByteArray, Point } from 'types/general';

async function verifyTxSignatureAsync(
	tx: Transaction,
	vin: number,
	signature: Uint8Array,
	pubkey: Point,
	parentScript: Uint8Array,
	parentSatoshis: number
): Promise<boolean> {
	const dersig = signature.slice(0, signature.length - 1);
	const sighashFlags = signature[signature.length - 1];
	const hash = await sighashAsync(tx, vin, parentScript, parentSatoshis, sighashFlags);
	try {
		return await ecdsaVerifyAsync(decodeDER(dersig), hash, pubkey);
	} catch (e) {
		return false;
	}
}

export default verifyTxSignatureAsync;
