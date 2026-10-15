#!/usr/bin/env node
// Prepared relationship capacity, not natural alliance/ending probability.
// One real generated world per child process; all recruitment uses public verbs.
'use strict';
const fs = require('fs'), path = require('path'), { spawn, execFileSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i < 0 ? d : process.argv[i + 1]; };
async function child() {
  const root = path.resolve(arg('root', ROOT)), K = require(path.join(root, 'scripts/godpath/lib'));
  const G = await K.load({ seed: Number(arg('seed', 7)) }); K.newRun(G);
  const strong = arg('mode', 'strong') === 'strong', villages = G.state.otherVillages;
  const links = G.hierarchyState(); links.length = 0;
  for (const v of villages) {
    G.genVillageRoster(v); v.opinion = strong ? 30 : 0;
    const speaker = v.roster.find(r => r.age >= 18);
    links.push({ primary: 'haven', subordinate: v.id, status: 'active', trust: strong ? 90 : 40, arrears: 0, theirSpeaker: { id: speaker.id, name: speaker.name } });
  }
  G.state.titans = { omens: { finale: { stage: 2, day: G.state.scholar.day } }, musters: {}, slain: {}, cast: null };
  const m = G.soundTitanCall('finale');
  const first = m.allies.length, uniqueFirst = new Set(m.allies.map(a => a.villageId + ':' + a.vid)).size;
  G.titanCommitOwn('finale'); G.titanCommitOwn('finale');
  const own = m.haven.length, readyFirst = G.titanMusterReady('finale');
  for (let i = 0; i < 3; i++) G.soundTitanCall('finale');
  const claimed = m.allies.length, uniqueAfter = new Set(m.allies.map(a => a.villageId + ':' + a.vid)).size;
  const readyRepeated = G.titanMusterReady('finale');
  const children = m.allies.filter(a => { const r = villages.find(v => v.id === a.villageId).roster.find(r => r.id === a.vid); return r.age < 18; }).length;
  // Enough prepared meals isolate the actual upkeep arithmetic. This is
  // not evidence that a natural player can afford or carry this stock.
  G.state.scholar.inventory = [{ name: 'Prepared audit meals', units: 200, kcalEach: 1000, foodKind: 'plant', foodState: 'cooked', safe: true, edible: true, spoilDay: 9999 }];
  G.titanDawnTick();
  const remaining = G.state.scholar.inventory.reduce((n, i) => n + (i.units || 0) * (i.kcalEach || 0), 0);
  return { seed: Number(arg('seed', 7)), mode: strong ? 'strong' : 'ordinary', villages: villages.length, adults: villages.map(v => v.roster.filter(r => r.alive && r.age >= 18).length), first, uniqueFirst, own, readyFirst, claimedAfterFourCalls: claimed, uniqueAfterFourCalls: uniqueAfter, duplicateEntries: claimed - uniqueAfter, readyRepeated, childEntries: children, upkeepSpent: 200000 - remaining };
}
async function main() {
  if (process.argv.includes('--child')) { const r = await child(); process.stdout.write('@@COALITION@@' + JSON.stringify(r) + '\n'); return; }
  const root = path.resolve(arg('root', ROOT)), seeds = require('./sweep-dashboard').seedList(Number(arg('n', 16)));
  const jobs = seeds.flatMap(seed => ['ordinary', 'strong'].map(mode => ({ seed, mode }))), rows = []; let next = 0;
  const worker = async () => {
    while (next < jobs.length) {
      const job = jobs[next++];
      rows.push(await new Promise((resolve, reject) => {
        const p = spawn(process.execPath, [__filename, '--child', '--root', root, '--seed', String(job.seed), '--mode', job.mode], { cwd: root });
        let out = '', err = '';
        p.stdout.on('data', b => { out += b; }); p.stderr.on('data', b => { err += b; }); p.on('error', reject);
        p.on('close', code => { try { if (code) throw new Error(err.slice(-500)); resolve(JSON.parse(out.split('@@COALITION@@').pop().trim())); } catch (e) { reject(new Error(job.seed + '/' + job.mode + ': ' + e.message)); } });
      }));
    }
  };
  await Promise.all(Array.from({ length: Number(arg('par', 4)) }, worker));
  rows.sort((a, b) => a.mode.localeCompare(b.mode) || seeds.indexOf(a.seed) - seeds.indexOf(b.seed));
  const hashes = {};
  for (const f of ['src/js/titans.js', 'src/js/finale-campaign.js', 'src/data/titans.json']) hashes[f] = require('crypto').createHash('sha256').update(fs.readFileSync(path.join(root, f))).digest('hex');
  const out = path.join(ROOT, 'evidence', '2026-10-15', 'coalition-' + arg('label', 'audit'));
  const report = { kind: 'prepared-relationship-capacity', sourceHead: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(), sourceHashes: hashes, root, seeds, relationshipsPrepared: true, foodPrepared: true, rows };
  fs.writeFileSync(out + '.json', JSON.stringify(report, null, 2) + '\n');
  const lines = ['# Coalition capacity audit', '', 'Generated worlds with prepared ordinary/strong alliances, located Finale and upkeep food. Public call/commit/dawn verbs. Not natural alliance formation, food affordability, combat success or win probability.', '', '| mode | first-call ready | ready after four calls | duplicate entries | child entries |', '|---|---:|---:|---:|---:|'];
  for (const mode of ['ordinary', 'strong']) { const rs = rows.filter(r => r.mode === mode); lines.push(`| ${mode} | ${rs.filter(r => r.readyFirst).length}/${rs.length} | ${rs.filter(r => r.readyRepeated).length}/${rs.length} | ${rs.reduce((n, r) => n + r.duplicateEntries, 0)} | ${rs.reduce((n, r) => n + r.childEntries, 0)} |`); }
  fs.writeFileSync(out + '.md', lines.join('\n') + '\n'); console.log('wrote ' + out + '.{json,md}');
}
if (require.main === module) main().catch(e => { console.error(e.stack); process.exitCode = 1; });
