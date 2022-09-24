/* global VERSION */
/* global VARIANT */

import Address from './src/classes/address';
import PublicKey from './src/classes/public-key';
import PrivateKey from './src/classes/private-key';
import Script from './src/classes/script';
import Transaction from './src/classes/transaction';
import classes from './src/classes';
import constants from './src/constants';
import functions from './src/functions';
import * as pkg from './package.json';
import VARIANT from './src/constants/variant';
import VERSION from './src/constants/version';

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

	version: typeof VERSION === 'undefined' ? pkg.version : VERSION,
	variant: typeof VARIANT === 'undefined' ? undefined : VARIANT,
};

export default nimble;
