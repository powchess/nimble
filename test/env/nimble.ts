// Provides the build of nimble for testing

import path from 'path';

const nimble = process.env.LIB ? require(path.join(process.cwd(), process.env.LIB)) : require('target');

export default nimble;
