/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { assert } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const mocks = require('../lib/mocks');
const realConfig = require('../../lib/config');

const routeModulePath = '../../lib/routes/jwks';
var dependencies = mocks.require(
  [{ path: '../config' }],
  routeModulePath,
  __dirname
);

describe('/jwks GET', function() {
  describe('config handling', () => {
    let sandbox, newKey, oldKey, getRoute;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
      newKey = null;
      oldKey = null;
      sandbox.stub(dependencies['../config'], 'get').callsFake(name => {
        switch (name) {
          case 'openid.newKey':
            return newKey;
          case 'openid.oldKey':
            return oldKey;
          default:
            return realConfig.get(name);
        }
      });
      getRoute = () => proxyquire(routeModulePath, dependencies);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('by default returns just the active signing key', async () => {
      const resp = await getRoute().handler();
      assert.deepEqual(Object.keys(resp), ['keys']);
      assert.equal(resp.keys.length, 1);
      assert.deepEqual(resp.keys[0], {
        kty: 'RSA',
        alg: 'RS256',
        kid: realConfig.get('openid.key').kid,
        'fxa-createdAt': realConfig.get('openid.key')['fxa-createdAt'],
        use: 'sig',
        n: realConfig.get('openid.key').n,
        e: realConfig.get('openid.key').e,
      });
    });

    it('returns the old signing key if present', async () => {
      oldKey = {
        kty: 'foo',
        kid: 'bar',
        n: 'N',
        e: 'E',
      };
      const resp = await getRoute().handler();
      assert.deepEqual(Object.keys(resp), ['keys']);
      assert.equal(resp.keys.length, 2);
      assert.deepEqual(resp.keys[0], {
        kty: 'RSA',
        alg: 'RS256',
        kid: realConfig.get('openid.key').kid,
        'fxa-createdAt': realConfig.get('openid.key')['fxa-createdAt'],
        use: 'sig',
        n: realConfig.get('openid.key').n,
        e: realConfig.get('openid.key').e,
      });
      assert.deepEqual(resp.keys[1], {
        kty: 'foo',
        alg: 'RS256',
        kid: 'bar',
        'fxa-createdAt': undefined,
        use: 'sig',
        n: 'N',
        e: 'E',
      });
    });

    it('returns the new signing key if present', async () => {
      newKey = {
        kty: 'foo',
        kid: 'bar',
        n: 'N',
        e: 'E',
        d: 'D',
      };
      const resp = await getRoute().handler();
      assert.deepEqual(Object.keys(resp), ['keys']);
      assert.equal(resp.keys.length, 2);
      assert.deepEqual(resp.keys[0], {
        kty: 'RSA',
        alg: 'RS256',
        kid: realConfig.get('openid.key').kid,
        'fxa-createdAt': realConfig.get('openid.key')['fxa-createdAt'],
        use: 'sig',
        n: realConfig.get('openid.key').n,
        e: realConfig.get('openid.key').e,
      });
      assert.deepEqual(resp.keys[1], {
        kty: 'foo',
        alg: 'RS256',
        kid: 'bar',
        'fxa-createdAt': undefined,
        use: 'sig',
        n: 'N',
        e: 'E',
      });
    });

    it('returns both new and old keys if both are present', async () => {
      newKey = { kid: 'new' };
      oldKey = { kid: 'old' };
      const resp = await getRoute().handler();
      assert.deepEqual(Object.keys(resp), ['keys']);
      assert.equal(resp.keys.length, 3);
      assert.equal(resp.keys[0].kid, realConfig.get('openid.key').kid);
      assert.equal(resp.keys[1].kid, 'new');
      assert.equal(resp.keys[2].kid, 'old');
    });
  });
});
