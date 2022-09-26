import Address from './classes/address';
import PublicKey from './classes/public-key';
import PrivateKey from './classes/private-key';
import Script from './classes/script';
import Transaction from './classes/transaction';
import classes from './classes';
import constants from './constants';
import functions from './functions';
import { version } from '../package.json';
import VARIANT from './constants/variant';
import VERSION from './constants/version';

const nimble = {
	Address,
	PublicKey,
	PrivateKey,
	Script,
	Transaction,

	classes,
	constants,
	functions,

	testnet: false,
	feePerKb: 50,

	version: typeof VERSION === 'undefined' ? version : VERSION,
	variant: typeof VARIANT === 'undefined' ? undefined : VARIANT,
};

export default nimble;
