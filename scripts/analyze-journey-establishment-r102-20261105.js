#!/usr/bin/env node
// r102 analyzer (node wrapper): delegates to the python strict-use analysis
// so the same file can be cited from the run note. Real logic lives in
// analyze-journey-establishment-r102-20261105.py next to this file.
'use strict';
const { spawnSync } = require('child_process');
const path = require('path');
const r = spawnSync('python3', [path.join(__dirname, 'analyze-journey-establishment-r102-20261105.py')].concat(process.argv.slice(2)), { stdio: 'inherit' });
process.exit(r.status == null ? 1 : r.status);
