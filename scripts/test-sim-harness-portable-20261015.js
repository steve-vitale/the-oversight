#!/usr/bin/env node
// The shared simulator must boot on hosts without grep or a POSIX shell.
'use strict';
const cp = require('child_process');
const originalExec = cp.execSync;
cp.execSync = function (command, options) {
  if (/\bgrep\b/.test(command)) throw new Error('grep is unavailable on this host');
  return originalExec(command, options);
};
const K = require('./godpath/lib');
const T = K.reporter('test-sim-harness-portable-20261015');
(async () => {
  try {
    const { Game, loadFails } = await K.H.loadGame({ seed: 7 });
    T.ok('boots without grep', !!Game);
    T.ok('all index modules load', loadFails.length === 0, loadFails.join('; '));
    T.ok('modules after the old 80-script cap are present', typeof Game.recognizeClass === 'function' && typeof Game.tableTakeSeat === 'function');
    K.newRun(Game);
    T.ok('a real run starts', !!Game.state.scholar && !Game.over);
  } catch (e) {
    T.ok('boots without grep', false, e.message);
  } finally {
    cp.execSync = originalExec;
    T.done();
  }
})();
