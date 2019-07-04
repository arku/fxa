#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*

 Usage:
 scripts/gen_keys.js

 Will create these files

 ./config/key.json
 ./config/newKey.json
 ./config/oldKey.json

 This script is used for initializing keys in a dev environment.
 If these files already exist, this script will show an error message
 and exit. You must remove all keys if you want to generate a new
 keypair.
 */

const fs = require('fs');
const assert = require('assert');
const keys = require('../lib/keys');

const keyPath = './fxa-oauth-server/config/key.json';
const newKeyPath = './fxa-oauth-server/config/newKey.json';
const oldKeyPath = './fxa-oauth-server/config/oldKey.json';

try {
  var keysExist =
    fs.existsSync(keyPath) ||
    fs.existsSync(newKeyPath) ||
    fs.existsSync(oldKeyPath);
  assert(!keysExist, 'keys already exists');
} catch (e) {
  process.exit();
}

function main(cb) {
  try {
    fs.mkdirSync('./fxa-oauth-server/config');
  } catch (accessEx) {}

  const privKey = keys.generatePrivateKey();
  fs.writeFileSync(keyPath, JSON.stringify(privKey, undefined, 2));
  console.log('Key saved:', keyPath); //eslint-disable-line no-console

  // The "new key" is optional, for dev purposes we just write an empty one.
  fs.writeFileSync(newKeyPath, JSON.stringify({}, undefined, 2));
  console.log('NewKey wiped:', newKeyPath); //eslint-disable-line no-console

  // The "old key" is not used to sign anything, so we don't need to store
  // the private component, we just need to serve the public component
  // so that old signatures can be verified correctly.  In dev we just
  // write a fake one for testing purposes.
  const pubKey = keys.extractPublicKey(keys.generatePrivateKey());
  fs.writeFileSync(oldKeyPath, JSON.stringify(pubKey, undefined, 2));
  console.log('OldKey saved:', oldKeyPath); //eslint-disable-line no-console
  cb();
}

module.exports = main;

if (require.main === module) {
  main(function() {});
}
