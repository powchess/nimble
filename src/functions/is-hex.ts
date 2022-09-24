const HEX_REGEX = /^(?:[a-fA-F0-9][a-fA-F0-9])*$/;

export default function isHex(str: string): boolean {
	return HEX_REGEX.test(str);
}
