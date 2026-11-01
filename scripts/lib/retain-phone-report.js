'use strict';
// Retain actual newly produced bytes only after the real verifier accepts them.
const fs = require('fs'), path = require('path'), z = require('zlib'), crypto = require('crypto');
function runCLI(canonical, verify) {
  try {
    if (!process.argv[2]) throw Error('Actual retained report path required');
    const root = fs.realpathSync(path.resolve(__dirname, '../..'));
    const actual = fs.realpathSync(path.resolve(process.argv[2]));
    const relative = path.relative(root, actual);
    if (path.isAbsolute(relative) || relative.startsWith('..')) throw Error('Retain actual report inside this repository first');
    const target = path.resolve(root, canonical), targetRelative = path.relative(root, target);
    if (path.isAbsolute(targetRelative) || targetRelative.startsWith('..')) throw Error('Canonical report must stay inside repository');
    const raw = fs.readFileSync(actual), report = JSON.parse(z.gunzipSync(raw)), result = verify(root, report);
    if (!result.ok) throw Error(result.errors.join('\n'));
    fs.writeFileSync(target, raw);
    if (!fs.readFileSync(target).equals(raw)) throw Error('Retained report bytes differ');
    console.log(JSON.stringify({ report: relative.replace(/\\/g, '/'), canonical, sha256: crypto.createHash('sha256').update(raw).digest('hex'), verified: true }));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
module.exports = { runCLI };
