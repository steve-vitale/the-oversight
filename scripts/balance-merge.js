#!/usr/bin/env node
'use strict';
const fs = require('fs'), zlib = require('zlib'), { mergePanels } = require('./lib/balance-merge');
const args = process.argv.slice(2), at = args.indexOf('--out');
if (at < 0 || at !== args.length - 2 || at < 1) throw new Error('node scripts/balance-merge.js <panel1.json.gz> <panel2.json.gz> --out <merged.json.gz>');
const panels = args.slice(0, at).map(file => JSON.parse(file.endsWith('.gz') ? zlib.gunzipSync(fs.readFileSync(file)) : fs.readFileSync(file, 'utf8')));
const result = mergePanels(panels); fs.writeFileSync(args[at + 1], zlib.gzipSync(JSON.stringify(result) + '\n'));
console.log('Merged ' + result.rows.length + ' cases from ' + panels.length + ' disjoint shards.');
