import generateRandomData from './generate-random-data';
import verifyPrivateKey from './verify-private-key';

export default function generatePrivateKey(): Uint8Array {
	while (true) {
		try {
			return verifyPrivateKey(generateRandomData(32));
		} catch (e) {
			continue;
		}
	}
}
