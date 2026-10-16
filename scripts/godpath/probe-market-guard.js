#!/usr/bin/env node
'use strict';
// Prepared guard-contract cohort, not naturally earned godhood or a campaign.
// The real fieldFight returns an outcome; its caller's later wound settlement
// is outside this probe. Each case loads one shared harness in its own process.
const fs = require('fs'), path = require('path'), cp = require('child_process'), crypto = require('crypto'), z = require('zlib');
const { promisify } = require('util'), execFile = promisify(cp.execFile);
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i < 0 ? d : process.argv[i + 1]; };
const sha = x => crypto.createHash('sha256').update(x).digest('hex');
async function child(root, seed, monster) {
  const K = require(path.join(root, 'scripts/godpath/lib')), H = K.H;
  return H.quietLog(async () => {
    const G = await K.load({ seed }); K.newRun(G);
    const s = G.state.scholar, v = G.state.village, id = v.roster.find(x => x !== G.villagerId);
    s.day = 85; G.state.systemArrived = true;
    v.npcAbilities = { [id]: [] }; v.npcSkills = { [id]: [] };
    v.npcGodhood = { [id]: { active: ['market_god'], recognized: { market_god: 85 } } };
    v.health = { [id]: 100 }; G.npcNeeds(id).hunger = 10;
    const hash = require(path.join(root, 'scripts/gear-usage-audit')).gameplayHash;
    const initialHash = hash(G.state), md = G.data.monsters.find(m => m.id === monster);
    if (!md) throw Error('Unknown monster ' + monster);
    let draws = 0; const random = H.mulberry32((seed ^ 0x517cc1b7) >>> 0);
    // hp is a range in monster data; the real engine rolls a fresh body.
    // Passing that range as a world entity's scalar hp would create NaN.
    const record = G.fieldFight(id, md, {}, { noFlee: true, rng: () => { draws++; return random(); } });
    if (![record.vHpLeft, record.mHpLeft].every(Number.isFinite)) throw Error('Nonfinite fight outcome');
    return { seed, monster, person: id, initialHash, finalHash: hash(G.state), record, draws,
      hunger: G.npcNeeds(id).hunger, guardDepletion: v.npcGodhood[id].guardDepletion || [] };
  });
}
(async () => {
  const root = path.resolve(arg('root', path.join(__dirname, '../..')));
  if (process.argv.includes('--child')) { console.log(JSON.stringify(await child(root, Number(arg('seed', 7)), arg('monster', 'review_drone')))); return; }
  const n = Number(arg('n', 64)), par = Number(arg('par', 4)), out = arg('out', null), panelFile = arg('panel', null);
  if (!out || !Number.isSafeInteger(n) || n < 1 || !Number.isSafeInteger(par) || par < 1 || par > 16) throw Error('--out file.json.gz --n positive-integer --par 1..16 required');
  if (!panelFile) throw Error('--panel matching-standard-panel.json.gz required to bind source/flags/Node');
  const panel = JSON.parse(z.gunzipSync(fs.readFileSync(panelFile)));
  const manifest = require('../balance-panel').manifest, sources = manifest(root), rows = [], probeDigest = sha(fs.readFileSync(__filename));
  if (panel.sourceDigest !== sha(JSON.stringify(sources)) || panel.options.nodeVersion !== process.version || panel.options.region !== null || panel.options.origin !== 'Columbus, Ohio') throw Error('Unmatched source/Node/default origin');
  for (const [k, value] of Object.entries(panel.options.flags)) if ((process.env[k] ?? null) !== value) throw Error('Flag mismatch ' + k);
  const jobs = Array.from({ length: n }, (_, i) => i + 1).flatMap(seed => ['review_drone', 'hushwolf'].map(monster => ({ seed, monster })));
  let next = 0;
  await Promise.all(Array.from({ length: par }, async () => {
    while (next < jobs.length) {
      const job = jobs[next++], r = await execFile(process.execPath, [__filename, '--child', '--root', root, '--seed', String(job.seed), '--monster', job.monster], { maxBuffer: 2000000 });
      if (r.stderr.trim()) throw Error(r.stderr);
      rows.push(JSON.parse(r.stdout));
    }
  }));
  if (JSON.stringify(sources) !== JSON.stringify(manifest(root)) || probeDigest !== sha(fs.readFileSync(__filename))) throw Error('Source/probe changed mid-cohort');
  rows.sort((a, b) => a.monster.localeCompare(b.monster) || a.seed - b.seed);
  const report = { schemaVersion: 1, sourceDigest: sha(JSON.stringify(sources)), sources, probeDigest, nodeVersion: process.version, flags: panel.options.flags, origin: panel.options.origin,
    preparation: 'Day85/100HP/10hunger, prepared Market God, no abilities/skills, generated ordinary equipment, real freshly rolled full-health monster, opts.noFlee=true, private RNG. Returned early learn-first withdrawals remain observable. Outcome returned before caller settlement; not a natural campaign or full god-build balance claim.', rows };
  fs.writeFileSync(out, z.gzipSync(JSON.stringify(report) + '\n'));
  console.log(JSON.stringify({ out, cases: rows.length, sourceDigest: report.sourceDigest }));
})().catch(e => { console.error(e.stack); process.exitCode = 1; });
