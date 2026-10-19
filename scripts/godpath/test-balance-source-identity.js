#!/usr/bin/env node
'use strict';
const path = require('path'), cp = require('child_process');
const T = require('./lib').reporter('balance-source-identity');
const { sourceHead } = require('../balance-panel');
const root = path.resolve(__dirname, '../..');
T.ok('a checkout reports its own HEAD, including linked worktrees', sourceHead(root) === cp.execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim());
T.ok('a nested source directory cannot inherit the enclosing checkout HEAD', sourceHead(path.join(root, 'src')) === null);
T.ok('deep source directories without their own git identity remain unknown', sourceHead(path.join(root, 'src/data')) === null);
T.done();
