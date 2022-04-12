/**
 * index.js
 *
 * Entry point for test modules
 */

const { describe, it } = require('mocha')
const { expect } = require('chai')
const nimble = require('./env/nimble')
const { PrivateKey } = nimble

// ------------------------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------------------------

describe('classes', () => {
  require('./classes/address')
  require('./classes/buffer-reader')
  require('./classes/buffer-writer')
  require('./classes/private-key')
  require('./classes/public-key')
  require('./classes/transaction')
})

describe('functions', () => {
  require('./functions/are-buffers-equal')
  require('./functions/calculate-dust')
  require('./functions/calculate-public-key')
  require('./functions/create-p2pkh-lock-script')
  require('./functions/create-p2pkh-unlock-script')
  require('./functions/decode-address')
  require('./functions/decode-der')
  require('./functions/decode-hex')
  require('./functions/decode-public-key')
  require('./functions/decode-script-chunks')
  require('./functions/decode-tx')
  require('./functions/decode-wif')
  require('./functions/ecdsa-sign')
  require('./functions/ecdsa-verify')
  require('./functions/encode-der')
  require('./functions/encode-hex')
  require('./functions/encode-public-key')
  require('./functions/encode-tx')
  require('./functions/encode-wif')
  require('./functions/generate-private-key')
  require('./functions/generate-tx-signature')
  require('./functions/is-buffer')
  require('./functions/read-u32-le')
  require('./functions/read-u64-le')
  require('./functions/read-varint')
  require('./functions/ripemd160-async')
  require('./functions/ripemd160')
  require('./functions/sha1-async')
  require('./functions/sha1')
  require('./functions/sha256-async')
  require('./functions/sha256')
  require('./functions/sha256d')
  require('./functions/sighash-async')
  require('./functions/sighash')
  require('./functions/validate-public-key')
  require('./functions/verify-tx-signature')
  require('./functions/verify-script-async')
  require('./functions/write-u32-le')
  require('./functions/write-u64-le')
  require('./functions/write-push-data')
  require('./functions/write-varint')
})

// ------------------------------------------------------------------------------------------------
// nimble
// ------------------------------------------------------------------------------------------------

describe('nimble', () => {
  // --------------------------------------------------------------------------
  // testnet
  // --------------------------------------------------------------------------

  describe('testnet', () => {
    it('enabled', () => {
      nimble.testnet = true
      expect(PrivateKey.fromRandom().testnet).to.equal(true)
      expect(PrivateKey.fromRandom().toPublicKey().testnet).to.equal(true)
      expect(PrivateKey.fromRandom().toAddress().testnet).to.equal(true)
    })

    // ------------------------------------------------------------------------

    it('disabled', () => {
      nimble.testnet = false
      expect(PrivateKey.fromRandom().testnet).to.equal(false)
      expect(PrivateKey.fromRandom().toPublicKey().testnet).to.equal(false)
      expect(PrivateKey.fromRandom().toAddress().testnet).to.equal(false)
    })
  })
})

// ------------------------------------------------------------------------------------------------
