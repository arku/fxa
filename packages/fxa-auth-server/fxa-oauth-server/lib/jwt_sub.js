/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const hex = require('buf').to.hex;
const hkdf = require('../../lib/crypto/hkdf');
const config = require('./config');

const PPID_ENABLED = config.get('ppid.enabled');
const PPID_CLIENT_IDS = new Set(config.get('ppid.enabledClientIds'));
const PPID_ROTATING_CLIENT_IDS = new Set(config.get('ppid.rotatingClientIds'));
const PPID_ROTATION_PERIOD_MS = config.get('ppid.rotationPeriodMS');
const PPID_SALT = config.get('ppid.salt');
const PPID_INFO = 'oidc ppid sub';

const SUB_LENGTH_BYTES = config.get('unique.id');

module.exports = async function generateSub(
  userIdBuf,
  clientIdBuf,
  clientSeed = 0
) {
  const userIdHex = hex(userIdBuf);
  const clientIdHex = hex(clientIdBuf);

  // TODO - constrain clientSeed.

  if (PPID_ENABLED && PPID_CLIENT_IDS.has(clientIdHex)) {
    let timeBasedContext = 0;
    if (PPID_ROTATING_CLIENT_IDS.has(clientIdHex)) {
      timeBasedContext = Math.floor(Date.now() / PPID_ROTATION_PERIOD_MS);
    }
    return hex(
      await hkdf(
        `${clientIdHex}.${userIdHex}.${clientSeed}.${timeBasedContext}`,
        PPID_INFO,
        PPID_SALT,
        SUB_LENGTH_BYTES
      )
    );
  } else {
    return userIdHex;
  }
};
