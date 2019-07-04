#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*

 Usage:
 scripts/prepare-new-signing-key.js

 Will generate a new signing key and write it into ./config/newKey.json.

 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const keys = require('../lib/keys');

const keyPath = path.resolve(__dirname, '../config/key.json');
const newKeyPath = path.resolve(__dirname, '../config/newKey.json');

function main(cb) {
  assert(fs.existsSync(keyPath), 'missing active signing key');
  assert(
    Object.keys(require(keyPath)).length > 0,
    'missing active signing key'
  );

  if (
    fs.existsSync(newKeyPath) &&
    Object.keys(require(newKeyPath)).length > 0
  ) {
    assert(false, 'new key alreayd exists; perhaps you meant to activate it?');
  }

  const privKey = keys.generatePrivateKey();
  fs.writeFileSync(newKeyPath, JSON.stringify(privKey, undefined, 2));
  console.log('NewKey saved:', keyPath); //eslint-disable-line no-console
}

module.exports = main;

if (require.main === module) {
  main(function() {});
}
