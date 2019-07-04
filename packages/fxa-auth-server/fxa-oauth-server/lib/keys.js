/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const crypto = require('crypto');
const generateRSAKeypair = require('keypair');
const JwTool = require('fxa-jwtool');

module.exports = {
  generatePrivateKey() {
    const kp = generateRSAKeypair();
    // We tag our keys with their creation time, and a unique key id
    // based on a hash of the public key and the timestamp.  The result
    // comes out like:
    //  {
    //    kid: "2017-03-16-ebe69008de771d62cd1cadf9faa6daae"
    //    "fxa-createdAt": 1489716000,
    //  }
    const now = new Date();
    const pubKeyHash = crypto
      .createHash('sha256')
      .update(kp.public)
      .digest('hex')
      .slice(0, 32);
    const privKey = JwTool.JWK.fromPEM(kp.private, {
      kid: now.toISOString().slice(0, 10) + '-' + pubKeyHash,
      // Timestamp to nearest hour; consumers don't need to know the precise time.
      'fxa-createdAt': Math.round(now / 1000 / 3600) * 3600,
    });
    return privKey.toJSON();
  },

  extractPublicKey(privKey) {
    return {
      kty: privKey.kty,
      alg: 'RS256',
      kid: privKey.kid,
      'fxa-createdAt': privKey['fxa-createdAt'],
      use: 'sig',
      n: privKey.n,
      e: privKey.e,
    };
  },
};
