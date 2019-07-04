/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const config = require('../config');

const KEYS = (function() {
  const privKey = config.get('openid.key');
  const newPrivKey = config.get('openid.newKey');
  const oldPubKey = config.get('openid.oldKey');

  function pub(key) {
    // Hey, this is important. Listen up.
    //
    // This function pulls out only the **PUBLIC** pieces of this key.
    // For RSA, that's the `e` and `n` values.
    //
    // BE CAREFUL IF YOU REFACTOR THIS. Thanks.
    return {
      kty: key.kty,
      alg: 'RS256',
      kid: key.kid,
      'fxa-createdAt': key['fxa-createdAt'],
      use: 'sig',
      n: key.n,
      e: key.e,
    };
  }

  const keys = [pub(privKey)];
  if (newPrivKey) {
    keys.push(pub(newPrivKey));
  }
  if (oldPubKey) {
    // Still use `pub()` here, just in case...
    keys.push(pub(oldPubKey));
  }
  return { keys: keys };
})();

module.exports = {
  cache: {
    privacy: 'public',
    expiresIn: 10000,
  },
  handler: async function jwks() {
    return KEYS;
  },
};
