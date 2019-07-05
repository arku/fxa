/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { assert } = require('chai');
const proxyquire = require('proxyquire');
const config = require('../lib/config');

describe('lib/jwt_sub', () => {
  let mockConfig;
  let jwtSub;

  const USER_ID_HEX = 'deadbeef';
  const USER_ID_BUF = Buffer.from(USER_ID_HEX, 'hex');

  const ENABLED_CLIENT_ID_HEX = '98e6508e88680e1a';
  const ENABLED_CLIENT_ID_BUF = Buffer.from(ENABLED_CLIENT_ID_HEX, 'hex');

  const ROTATING_CLIENT_ID_HEX = '38a6b9b3a65a1871';
  const ROTATING_CLIENT_ID_BUF = Buffer.from(ROTATING_CLIENT_ID_HEX, 'hex');

  const DISABLED_CLIENT_ID_HEX = 'dcdb5ae7add825d2';
  const DISABLED_CLIENT_ID_BUF = Buffer.from(DISABLED_CLIENT_ID_HEX, 'hex');

  function initialize(isEnabled) {
    mockConfig = {
      get(key) {
        switch (key) {
          case 'ppid.salt':
            return 'salt';
          case 'ppid.enabled':
            return isEnabled;
          case 'ppid.enabledClientIds':
            return [ENABLED_CLIENT_ID_HEX, ROTATING_CLIENT_ID_HEX];
          case 'ppid.rotatingClientIds':
            return [ROTATING_CLIENT_ID_HEX];
          case 'ppid.rotationPeriodMS':
            return 1;
          default:
            return config.get(key);
        }
      },
    };

    jwtSub = proxyquire('../lib/jwt_sub', {
      './config': mockConfig,
    });
  }

  it('returns the hex version of the userId if not enabled', async () => {
    initialize(false);

    assert.strictEqual(
      await jwtSub(USER_ID_BUF, ENABLED_CLIENT_ID_HEX),
      USER_ID_HEX
    );
  });

  it('returns the hex version of the userId if not enabled for the clientId', async () => {
    initialize(true);

    assert.strictEqual(
      await jwtSub(USER_ID_BUF, DISABLED_CLIENT_ID_BUF),
      USER_ID_HEX
    );
  });

  it('returns a stable PPID if enabled without rotation', async () => {
    initialize(true);

    const result1 = await jwtSub(USER_ID_BUF, ENABLED_CLIENT_ID_BUF);
    assert.isString(result1);
    assert.notEqual(result1, USER_ID_HEX);
    // * 2 because length is specified in bytes, we have hex characters
    assert.lengthOf(result1, config.get('unique.id') * 2);

    return new Promise((resolve, reject) => {
      const callback = async () => {
        try {
          const result2 = await jwtSub(USER_ID_BUF, ENABLED_CLIENT_ID_BUF);
          assert.isString(result2);
          assert.notEqual(result2, USER_ID_HEX);
          // * 2 because length is specified in bytes, we have hex characters
          assert.lengthOf(result2, config.get('unique.id') * 2);

          assert.strictEqual(result1, result2);
        } catch (e) {
          return reject(e);
        }
        resolve();
      };

      setTimeout(callback, 10);
    });
  });

  it('returns rotating PPIDs for enabled clients', async () => {
    initialize(true);

    const result1 = await jwtSub(USER_ID_BUF, ROTATING_CLIENT_ID_BUF);
    assert.isString(result1);
    assert.notEqual(result1, USER_ID_HEX);
    // * 2 because length is specified in bytes, we have hex characters
    assert.lengthOf(result1, config.get('unique.id') * 2);

    return new Promise((resolve, reject) => {
      const callback = async () => {
        try {
          const result2 = await jwtSub(USER_ID_BUF, ROTATING_CLIENT_ID_BUF);
          assert.isString(result2);
          assert.notEqual(result2, USER_ID_HEX);
          // * 2 because length is specified in bytes, we have hex characters
          assert.lengthOf(result2, config.get('unique.id') * 2);

          assert.notEqual(result1, result2);
        } catch (e) {
          return reject(e);
        }
        resolve();
      };

      setTimeout(callback, 10);
    });
  });
});
