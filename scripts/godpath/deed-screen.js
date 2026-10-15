#!/usr/bin/env node
// Standard driver, one seeded game per process; no gameplay-state observation writes.
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process'), crypto = require('crypto');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i < 0 ? d : process.argv[i + 1]; };
const root = path.resolve(arg('root', path.join(__dirname, '../..')));
function sourceIdentity(sourceRoot, archiveBase) {
  if (archiveBase != null) {
    if (!/^[a-f0-9]{40}$/i.test(archiveBase)) throw new Error('--source-head must be a full immutable commit hash');
    return { sourceHead: archiveBase, sourceHeadKind: 'supplied-archive-base' };
  }
  if (!fs.existsSync(path.join(sourceRoot, '.git'))) return { sourceHead: null, sourceHeadKind: 'archive-base-unavailable' };
  return { sourceHead: cp.execFileSync('git', ['rev-parse', 'HEAD'], { cwd: sourceRoot, encoding: 'utf8' }).trim(), sourceHeadKind: 'checkout-base' };
}
async function child() {
  const H = require(path.join(root, 'scripts/sim-harness'));
  const { runComparison, POLICY_REGISTRY: registry } = require(path.join(root, 'scripts/sweep-compare'));
  const id = arg('policy', 'capable'), base = registry[id];
  if (!base) throw new Error('Unknown policy ' + id);
  const people = new Map(), ascensions = [], outcomes = [], tableTrace = [], foodUses = [], offers = { player: {}, npc: {} }, heldPeople = { player: {}, npc: {} };
  let G, gardenCoverage;
  const intakeDays = new Map();
  const sampleIntake = g => {
    for (const [day, book] of Object.entries(g.state.village.harvestIntake || {})) {
      const out = { day: Number(day), kcal: 0, nourishment: 0, eaters: Object.values(book).filter(r => r.kcal > 0).length, routes: {}, harvesters: {} };
      for (const [eater, r] of Object.entries(book)) {
        out.kcal += r.kcal; out.nourishment += r.nourishment;
        for (const [route, value] of Object.entries(r.routes)) {
          const a = out.routes[route] || (out.routes[route] = { kcal: 0, nourishment: 0 });
          a.kcal += value.kcal; a.nourishment += value.nourishment;
        }
        for (const [owner, kcal] of Object.entries(r.harvestKcal)) {
          const a = out.harvesters[owner] || (out.harvesters[owner] = { kcal: 0, nourishment: 0, othersKcal: 0, othersNourishment: 0, otherEaters: [] });
          const n = r.harvestNourishment[owner] || 0;
          a.kcal += kcal; a.nourishment += n;
          if (owner !== eater && kcal > 0) { a.othersKcal += kcal; a.othersNourishment += n; a.otherEaters.push(eater); }
        }
      }
      intakeDays.set(day, out);
    }
  };
  const person = vid => { if (!people.has(vid)) people.set(vid, { id: vid, bearerDays: [], events: {}, classes: [] }); return people.get(vid); };
  const sample = g => {
    const me = person(g.villagerId), day = g.state.scholar.day;
    for (const [vid, ids] of [[g.villagerId, (g.state.scholar.abilities || []).map(x => typeof x === 'string' ? x : x.evolvedFrom || x.id)], ...Object.entries(g.state.village.npcAbilities || {})]) {
      const role = vid === g.villagerId ? 'player' : 'npc';
      for (const id of ids) { const seen = heldPeople[role][id] || (heldPeople[role][id] = []); if (!seen.includes(vid)) seen.push(vid); }
    }
    if (!me.bearerDays.includes(day)) me.bearerDays.push(day);
    for (const [vid, rec] of [[g.villagerId, g.state.scholar.godpath], ...Object.entries(g.state.village.npcGodpath || {})]) {
      if (!rec || rec.lapsed) continue;
      const p = person(vid), key = rec.path + '/' + rec.subclass;
      if (!p.classes.includes(key)) p.classes.push(key);
    }
    sampleIntake(g);
  };
  registry[id] = Object.assign({}, base, {
    setup(g, ctx) {
      G = g;
      if (arg('observe', '1') !== '0') {
        gardenCoverage = require('../lib/garden-coverage').install(G);
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
        const sheet = G.kitSheet;
        G.kitSheet = function (cands, who, track, level) {
          const out = sheet.apply(this, arguments), role = who === 'player' || who === this.villagerId ? 'player' : 'npc';
          for (const item of out || []) offers[role][item.id] = (offers[role][item.id] || 0) + 1;
          return out;
        };
        const choose = G.chooseTableOption;
        G.chooseTableOption = function (id) {
          const tc = this.state.scholar.tableChoices, T = ((this.state.scholar.prog || {}).table || {});
          if (tc) tableTrace.push({ day: this.state.scholar.day, id, options: (tc.options || []).map(x => ({ id: x.id, label: x.label })), prompt: tc.prompt, path: T.path, phase: T.phase, beat: T.beat, meters: { ...(T.meters || {}) } });
          return choose.apply(this, arguments);
        };
        // Observe the canonical receipt; emitting diagnostic telemetry here
        // would advance the harness's Date.now counter and change later IDs.
        const spend = G._spendFeastedPower;
        if (spend) G._spendFeastedPower = function () {
          const before = this.state.scholar.feastBuff;
          const used = before && before.used;
          const result = spend.apply(this, arguments);
          const after = this.state.scholar.feastBuff;
          if (after && after.used && !used && after.use) foodUses.push({ bearer: this.villagerId, ...JSON.parse(JSON.stringify(after.use)) });
          return result;
        };
        const tele = G.tele;
        G.tele = function (type, data) { if (type === 'ascension') ascensions.push(JSON.parse(JSON.stringify(data))); if (type === 'godpath_deed') outcomes.push(JSON.parse(JSON.stringify(data))); if (type === 'table_failed' || type === 'table_won') tableTrace.push({ day: this.state.scholar.day, type, ...JSON.parse(JSON.stringify(data)) }); return tele.apply(this, arguments); };
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
  if (arg('observe', '1') !== '0') sampleIntake(G);
  // Gate diagnostics occur only after the run and after hashing its gameplay state.
  const GH = globalThis.Scattering.Godhood;
  for (const p of rows) {
    p.gates = {};
    for (const god of GH.godhoods()) {
      const c = p.id === G.villagerId ? GH.godhoodCloseness(G.state.scholar, god, G.state.scholar.day) : GH.villagerGodhoodCloseness(G, p.id, god);
      if (c.classOk || c.kit >= 3) p.gates[god.id] = { kit: c.kit, need: c.needKit, payoff: c.coreHit, deed: c.synergy, day: c.dayOk, complete: c.complete };
    }
  }
  process.stdout.write('@@DEED@@' + JSON.stringify({ row: report.runs[0], stateHash: hash, ascensions, outcomes, warnings, offers, heldPeople, tableTrace, foodUses, gardenCoverage: gardenCoverage || null, people: rows, intakeDays: [...intakeDays.values()].sort((a, b) => a.day - b.day) }) + '\n');
}
function sourceManifest() {
  const out = {};
  function walk(dir) { for (const e of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const file = path.join(dir, e.name);
    if (e.isDirectory()) walk(file);
    else if (/\.(js|json)$/.test(file)) out[path.relative(root, file).replace(/\\/g, '/')] = crypto.createHash('sha256').update(fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n')).digest('hex');
  } }
  walk(path.join(root, 'src')); walk(path.join(root, 'scripts/policies'));
  for (const file of ['index.html', 'scripts/sim-harness.js', 'scripts/sweep-compare.js']) out[file] = crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file), 'utf8').replace(/\r\n/g, '\n')).digest('hex');
  for (const [key, file] of [['observer/deed-screen.js', __filename], ['observer/garden-coverage.js', path.join(__dirname, '../lib/garden-coverage.js')]]) out[key] = crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  return out;
}
async function main() {
  if (process.argv.includes('--child')) return child();
  const sources = sourceManifest();
  const seeds = arg('seeds', '') ? arg('seeds', '').split(',').map(Number) : require('../sweep-dashboard').seedList(Number(arg('n', 64))), policies = arg('policies', 'capable,maker,merchant,caregiver').split(',');
  const jobs = policies.flatMap(policy => seeds.map(seed => ({ policy, seed }))), rows = []; let next = 0;
  const worker = async () => {
    while (next < jobs.length) {
      const j = jobs[next++];
      const row = await new Promise((resolve, reject) => {
        const p = cp.spawn(process.execPath, [__filename, '--child', '--root', root, '--seed', String(j.seed), '--policy', j.policy, '--days', arg('days', '150'), '--observe', arg('observe', '1')], { cwd: root });
        let out = '', err = ''; p.stdout.on('data', x => { out += x; }); p.stderr.on('data', x => { err += x; }); p.on('error', reject);
        p.on('close', code => { try { if (code) throw new Error(err); resolve(JSON.parse(out.split('@@DEED@@').pop())); } catch (e) { reject(new Error(j.policy + '/' + j.seed + ': ' + e.message)); } });
      }); rows.push(row); process.stdout.write('.');
    }
  };
  await Promise.all(Array.from({ length: Number(arg('par', 4)) }, worker));
  rows.sort((a, b) => a.row.policy.localeCompare(b.row.policy) || seeds.indexOf(a.row.seed) - seeds.indexOf(b.row.seed));
  const hashes = {};
  for (const rel of ['src/js/godhood.js', 'src/js/godpath.js', 'src/js/tracks.js', 'src/js/endingKey.js', 'src/js/table.js', 'src/js/fieldFights.js', 'src/js/encounters.js', 'src/js/alienPlayers.js', 'src/js/equipment.js', 'src/js/party.js', 'src/js/food.js', 'src/js/carexplore.js', 'src/js/betrayal.js', 'src/js/safetynets.js', 'src/js/abilityActions.js', 'src/js/corruption.js', 'src/js/game.js', 'src/js/contestEngine.js', 'src/js/villager-agency.js', 'src/js/feastBuff.js', 'src/js/foodPower.js', 'src/data/abilities.json', 'src/data/feast-surge.json', 'src/data/godpaths.json', 'src/data/tracks.json', 'scripts/sim-harness.js', 'scripts/sweep-compare.js', 'scripts/policies/capable.js', 'scripts/policies/livelihood.js']) hashes[rel] = crypto.createHash('sha256').update(fs.readFileSync(path.join(root, rel))).digest('hex');
  hashes['observer/garden-coverage.js'] = crypto.createHash('sha256').update(fs.readFileSync(path.join(__dirname, '../lib/garden-coverage.js'))).digest('hex');
  hashes['observer/deed-screen.js'] = crypto.createHash('sha256').update(fs.readFileSync(__filename)).digest('hex');
  if (!arg('out', null)) throw new Error('--out required');
  if (JSON.stringify(sources) !== JSON.stringify(sourceManifest())) throw new Error('Sources changed during the panel; retain cases and rerun on a frozen source.');
  fs.writeFileSync(arg('out'), JSON.stringify({ driver: 'sweep-compare', sources, sourcesStable: true, sourceRoot: root, ...sourceIdentity(root, arg('source-head', null)), sourceHashes: hashes, policyFlags: { CAPABLE_READ_STAKES: process.env.CAPABLE_READ_STAKES || null, CAPABLE_GREEDY: process.env.CAPABLE_GREEDY || null }, days: Number(arg('days', 150)), seeds, policies, rows }, null, 2) + '\n');
  console.log('\nSaved ' + arg('out'));
}
module.exports = { sourceIdentity };
if (require.main === module) main().catch(e => { console.error(e.stack); process.exitCode = 1; });
