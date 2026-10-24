#!/usr/bin/env node
// test-sim-write-robust.js — proof for scripts/sim-write-robust.js
// (gap 852/621). Writes through the robust writer to a temp dir and
// asserts the final bytes hash-match the input and no .tmp- leftovers
// remain (atomic rename, read-back verified).
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const assert = require('assert');
const { writeFileRobust } = require('./sim-write-robust');

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'write-robust-'));
const file = path.join(dir, 'verdict.json');
const body = JSON.stringify({ verdict: 'GO', seeds: [1, 2, 3] }, null, 1) + '\n';
const res = writeFileRobust(file, body);
assert.strictEqual(res.sha256, crypto.createHash('sha256').update(body).digest('hex'), '852 hash matches');
assert.strictEqual(fs.readFileSync(file, 'utf8'), body, '852 final bytes exact');
assert.strictEqual(fs.readdirSync(dir).filter(n => n.includes('.tmp-')).length, 0, '852 no temp leftovers');
console.log('PASS 852/621 robust write: sha256=' + res.sha256.slice(0, 12) + ' attempts=' + res.attempts + ' no leftovers');
console.log('ALL WRITE-ROBUST PROOFS PASS');
