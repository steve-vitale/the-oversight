#!/usr/bin/env node
// Standard driver, one seeded game per process; no gameplay-state observation writes.
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process'), crypto = require('crypto');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i < 0 ? d : process.argv[i + 1]; };
const root = path.resolve(arg('root', path.join(__dirname, '../..')));
async function child() {
  const H = require(path.join(root, 'scripts/sim-harness'));
  const { runComparison, POLICY_REGISTRY: registry } = require(path.join(root, 'scripts/sweep-compare'));
  const id = arg('policy', 'capable'), base = registry[id];
  if (!base) throw new Error('Unknown policy ' + id);
  const people = new Map(), ascensions = [], outcomes = [];
  let G;
  const person = vid => { if (!people.has(vid)) people.set(vid, { id: vid, bearerDays: [], events: {}, classes: [] }); return people.get(vid); };
  const sample = g => {
    const me = person(g.villagerId), day = g.state.scholar.day;
    if (!me.bearerDays.includes(day)) me.bearerDays.push(day);
    for (const [vid, rec] of [[g.villagerId, g.state.scholar.godpath], ...Object.entries(g.state.village.npcGodpath || {})]) {
      if (!rec || rec.lapsed) continue;
      const p = person(vid), key = rec.path + '/' + rec.subclass;
      if (!p.classes.includes(key)) p.classes.push(key);
    }
  };
  registry[id] = Object.assign({}, base, {
    setup(g, ctx) {
      G = g;
      if (arg('observe', '1') !== '0') {
        const credit = G.creditDeed;
        G.creditDeed = function (who, deed) {
          const vid = who === 'player' || who === this.villagerId ? this.villagerId : who;
          const day = this.state.scholar.day;
          const value = credit.apply(this, arguments);
          if (vid && Number.isFinite(value) && value > 0) {
            const p = person(vid), e = p.events[deed] || (p.events[deed] = { count: 0, days: [] });
            e.count++; if (!e.days.includes(day)) e.days.push(day);
          }
          return value;
        };
        const tele = G.tele;
        G.tele = function (type, data) { if (type === 'ascension') ascensions.push(JSON.parse(JSON.stringify(data))); if (type === 'godpath_deed') outcomes.push(JSON.parse(JSON.stringify(data))); return tele.apply(this, arguments); };
        sample(G);
      }
      if (base.setup) return base.setup(g, ctx);
    },
    daily(g, ctx) { const r = base.daily && base.daily(g, ctx); if (arg('observe', '1') !== '0') sample(g); return r; },
  });
  const warnings = [], warnBefore = console.warn;
  console.warn = function (...args) { if (warnings.length < 100) warnings.push(args.map(String).join(' ')); return warnBefore.apply(console, args); };
  let report;
  try { report = await H.quietLog(() => runComparison({ seeds: [Number(arg('seed', 7))], policies: [id], days: Number(arg('days', 150)) })); }
  finally { registry[id] = base; console.warn = warnBefore; }
  const hash = require('../gear-usage-audit').gameplayHash(G.state);
  const rows = [...people.values()];
  // Gate diagnostics occur only after the run and after hashing its gameplay state.
  const GH = globalThis.Scattering.Godhood;
  for (const p of rows) {
    p.gates = {};
    for (const god of GH.godhoods()) {
      const c = p.id === G.villagerId ? GH.godhoodCloseness(G.state.scholar, god, G.state.scholar.day) : GH.villagerGodhoodCloseness(G, p.id, god);
      if (c.classOk || c.kit >= 3) p.gates[god.id] = { kit: c.kit, need: c.needKit, payoff: c.coreHit, deed: c.synergy, day: c.dayOk, complete: c.complete };
    }
  }
  process.stdout.write('@@DEED@@' + JSON.stringify({ row: report.runs[0], stateHash: hash, ascensions, outcomes, warnings, people: rows }) + '\n');
}
async function main() {
  if (process.argv.includes('--child')) return child();
  const seeds = require('../sweep-dashboard').seedList(Number(arg('n', 64))), policies = arg('policies', 'capable,maker,merchant,caregiver').split(',');
  const jobs = policies.flatMap(policy => seeds.map(seed => ({ policy, seed }))), rows = []; let next = 0;
  const worker = async () => {
    while (next < jobs.length) {
      const j = jobs[next++];
      const row = await new Promise((resolve, reject) => {
        const p = cp.spawn(process.execPath, [__filename, '--child', '--root', root, '--seed', String(j.seed), '--policy', j.policy, '--days', arg('days', '150')], { cwd: root });
        let out = '', err = ''; p.stdout.on('data', x => { out += x; }); p.stderr.on('data', x => { err += x; }); p.on('error', reject);
        p.on('close', code => { try { if (code) throw new Error(err); resolve(JSON.parse(out.split('@@DEED@@').pop())); } catch (e) { reject(new Error(j.policy + '/' + j.seed + ': ' + e.message)); } });
      }); rows.push(row); process.stdout.write('.');
    }
  };
  await Promise.all(Array.from({ length: Number(arg('par', 4)) }, worker));
  rows.sort((a, b) => a.row.policy.localeCompare(b.row.policy) || seeds.indexOf(a.row.seed) - seeds.indexOf(b.row.seed));
  const hashes = {};
  for (const rel of ['src/js/godhood.js', 'src/js/godpath.js', 'src/js/tracks.js', 'src/data/godpaths.json', 'src/data/tracks.json', 'scripts/sim-harness.js', 'scripts/sweep-compare.js', 'scripts/policies/capable.js', 'scripts/policies/livelihood.js']) hashes[rel] = crypto.createHash('sha256').update(fs.readFileSync(path.join(root, rel))).digest('hex');
  hashes['observer/deed-screen.js'] = crypto.createHash('sha256').update(fs.readFileSync(__filename)).digest('hex');
  if (!arg('out', null)) throw new Error('--out required');
  fs.writeFileSync(arg('out'), JSON.stringify({ driver: 'sweep-compare', sourceRoot: root, sourceHead: cp.execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(), sourceHashes: hashes, days: Number(arg('days', 150)), seeds, policies, rows }, null, 2) + '\n');
  console.log('\nSaved ' + arg('out'));
}
main().catch(e => { console.error(e.stack); process.exitCode = 1; });
