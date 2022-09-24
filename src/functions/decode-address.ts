import decodeBase58Check from './decode-base58-check';

export default function decodeAddress(address: string): { testnet: boolean, pubkeyhash: Uint8Array} {
	const { version, payload } = decodeBase58Check(address);

	if (payload.length !== 20) throw new Error('bad payload');
	if (version !== 0x00 && version !== 0x6f) throw new Error('unsupported version');

	return {
		testnet: version !== 0,
		pubkeyhash: payload,
	};
}
