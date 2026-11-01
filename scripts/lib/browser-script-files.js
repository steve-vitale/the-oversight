'use strict';
const fs = require('fs'), path = require('path');
// Pure file inventory for historical tests which still own their eval loop.
// Same DOM exclusions as sim-harness; no arbitrary script-count cap. New
// runtime tests should use loadGame rather than creating another loader.
module.exports = function browserScriptFiles(root) {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const files = [...html.matchAll(/\bsrc\s*=\s*["'](src\/js\/[^"'?]+\.js)(?:\?[^"']*)?["']/g)]
    .map(m => m[1]).filter(f => !/\/(app|sprites|tile-scenes|move-anim|drama)\.js$/.test(f));
  if (!files.includes('src/js/game.js') || !files.includes('src/js/text.js'))
    throw Error('Browser script inventory is missing game/text dependencies');
  return files;
};
