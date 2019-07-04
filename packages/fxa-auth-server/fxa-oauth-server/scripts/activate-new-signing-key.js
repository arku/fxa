#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*

 Usage:
 scripts/activate-new-signing-key.js

 Will copy the existing signing key from ./config/key.json into ./config/oldKey.json,
 then move the new signing key from ./config/newKey.json into ./config/key.json.

 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const keys = require('../lib/keys');

const keyPath = path.resolve(__dirname, '../config/key.json');
const newKeyPath = path.resolve(__dirname, '../config/newKey.json');
const oldKeyPath = path.resolve(__dirname, '../config/oldKey.json');

function main(cb) {
  assert(fs.existsSync(keyPath), 'missing active signing key');
  const key = require(keyPath);
  assert(Object.keys(key).length > 0, 'missing active signing key');

  assert(fs.existsSync(newKeyPath), 'missing new signing key');
  const newKey = require(newKeyPath);
  assert(Object.keys(newKey).length > 0, 'missing new signing key');

  const oldKey = keys.extractPublicKey(key);
  fs.writeFileSync(oldKeyPath, JSON.stringify(oldKey, undefined, 2));
  console.log('OldKey saved:', keyPath); //eslint-disable-line no-console

  fs.writeFileSync(keyPath, JSON.stringify(newKey, undefined, 2));
  console.log('Key saved:', keyPath); //eslint-disable-line no-console

  fs.writeFileSync(newKeyPath, JSON.stringify({}, undefined, 2));
  console.log('NewKey wiped:', keyPath); //eslint-disable-line no-console
}

module.exports = main;

if (require.main === module) {
  main(function() {});
}
