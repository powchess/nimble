import Script from 'classes/script';

export default function extractP2PKHLockScriptPubkeyhash(script: Uint8Array): Uint8Array {
	return script.slice(3, 23);
}
