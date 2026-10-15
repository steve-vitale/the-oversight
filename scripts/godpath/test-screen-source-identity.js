#!/usr/bin/env node
'use strict';
const cp = require('child_process'), path = require('path');
const K = require('./lib'), T = K.reporter('screen-source-identity');
const { sourceIdentity } = require('./deed-screen');
const head = cp.execFileSync('git', ['rev-parse', 'HEAD'], { cwd: K.ROOT, encoding: 'utf8' }).trim();
T.ok('a real checkout reports its own base commit', sourceIdentity(K.ROOT).sourceHead === head && sourceIdentity(K.ROOT).sourceHeadKind === 'checkout-base');
// Git itself returns the enclosing HEAD here; these are not source checkouts.
for (const folder of [path.join(K.ROOT, 'src'), path.join(K.ROOT, '.git')]) {
  T.ok('a nested source folder never borrows its enclosing repository HEAD', sourceIdentity(folder).sourceHead === null && sourceIdentity(folder).sourceHeadKind === 'archive-base-unavailable');
}
T.ok('an explicit archived base is retained and labelled as supplied', sourceIdentity(path.join(K.ROOT, 'src'), head).sourceHead === head && sourceIdentity(path.join(K.ROOT, 'src'), head).sourceHeadKind === 'supplied-archive-base');
let rejected = false;
try { sourceIdentity(K.ROOT, 'main'); } catch (e) { rejected = /immutable/.test(e.message); }
T.ok('a moving branch name is not an archived source identity', rejected);
T.done();
