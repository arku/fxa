#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*

 Usage:
 scripts/retire-new-signing-key.js

 Will zero out the old signing key in ./config/oldKey.json.

 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const keyPath = path.resolve(__dirname, '../config/key.json');
const oldKeyPath = path.resolve(__dirname, '../config/oldKey.json');

function main(cb) {
  assert(fs.existsSync(keyPath), 'missing active signing key');
  assert(
    Object.keys(require(keyPath)).length > 0,
    'missing active signing key'
  );

  fs.writeFileSync(oldKeyPath, JSON.stringify({}, undefined, 2));
  console.log('OldKey wiped:', keyPath); //eslint-disable-line no-console
}

module.exports = main;

if (require.main === module) {
  main(function() {});
}
