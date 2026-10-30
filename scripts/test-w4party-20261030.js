#!/usr/bin/env node
// test-w4party-20261030.js — proof for the sim-w4party-a instrument
// (w4party-instrument-20261030.js) + sweep + analyzer.
//
// (a) DET-GATE: W4PARTY v1 instrument installed vs not installed —
//     per-day trajectory hashes identical on 60d of the leadfeast
//     seatdrive stack. This is the read-only proof: zero game-state
//     writes, zero RNG draws.
// (b) READ-ONLY STATIC SCAN: no npcNode / partyMembers /
//     ensureVillagerPositions calls in code lines (comment lines
//     excluded); no Game.state writes; no RNG draws.
// (c) FIXTURES on fake state (no harness): nodeSnapshot buckets +
//     defaulted-Haven handling (no writes to the fixture state) +
//     formalParty filter + classifyFieldFight taxonomy.
// (d) REAL-SWEEP GATE: the real sweep script on 1 pilot seed, 60d,
//     EVID pointed at a scratch dir — per-seed JSON written, zero
//     instrument errors, re-run byte-identical, analyzer runs clean.
//
// Usage: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 \
//        FULLSEAT=1 W4PARTY=1 node scripts/test-w4party-20261030.js
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const REPO = path.join(__dirname, '..');

let pass = 0, fail = 0;
function check(name, cond, detail) {
  if (cond) { pass++; console.log(`  ok   ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'FULLSEAT', 'W4PARTY']) {
  if (process.env[k] !== '1') { console.error(`STOP: ${k}=1 required.`); process.exit(2); }
}

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { dayHash } = require(path.join(REPO, 'scripts', 'det-gate'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));
const WD = require(path.join(REPO, 'scripts', 'policies', 'windefer'));
const SD = require(path.join(REPO, 'scripts', 'policies', 'seatdrive'));
const FD = require(path.join(REPO, 'scripts', 'policies', 'fullseat-diag'));
const WP = require(path.join(REPO, 'scripts', 'w4party-instrument-20261030'));

function seatPolicy() {
  const wd = WD.withWinDefer(TF.leadfeast, 'lead-windefer', 'x');
  const sd = SD.withSeatDrive(wd, 'lead-seatdrive', 'y');
  return FD.withFullseatDiag(sd, 'lead-fullseat', 'z');
}

async function newGame(seed) {
  const { Game } = await loadGame({ seed, mode: 'killconv-test', fullTelemetry: false });
  await setupGame(Game);
  return Game;
}

(async () => {
  console.log('== (a) DET-GATE: instrument installed vs not — 60d leadfeast trajectory ==');
  async function traj(seed, useInstr) {
    const pol = seatPolicy();
    const G = await newGame(seed);
    const t = { meetings: [], tbFights: [], tbOutcomes: {}, instrumentErrors: [] };
    let uninstall = null;
    if (useInstr) uninstall = WP.install(G, t);
    const hs = [];
    const wrapped = Object.assign({}, pol, {
      daily(Gm, ctx) { hs.push(Gm.state.scholar.day + ':' + dayHash(Gm)); return pol.daily(Gm, ctx); },
    });
    await quietLog(async () => { await runDays(G, wrapped, { days: 60, manifest: undefined, sampleEvery: 1 }); });
    if (uninstall) uninstall();
    return { hashes: hs.join('\n'), t };
  }
  let judged = false;
  for (const seed of [85101, 85102, 85103]) {
    if (judged) break;
    const a = await traj(seed, false);
    const b = await traj(seed, false);
    if (a.hashes !== b.hashes) { console.log(`  .. s${seed}: noinstr-vs-noinstr UNSTABLE — seed skipped`); continue; }
    const c = await traj(seed, true);
    check(`det s${seed} trajectory identical with instrument`, c.hashes === a.hashes, 'trajectories diverged');
    check(`det s${seed} zero instrument errors`, c.t.instrumentErrors.length === 0, c.t.instrumentErrors.slice(0, 2).join(' | '));
    judged = true;
  }
  check('det-gate found a stable seed', judged, 'all 3 seeds flaky');

  console.log('== (b) READ-ONLY STATIC SCAN ==');
  {
    const src = fs.readFileSync(path.join(REPO, 'scripts', 'w4party-instrument-20261030.js'), 'utf8');
    const lines = src.split('\n').filter(l => !/^\s*\/\//.test(l));
    const code = lines.join('\n');
    check('no npcNode() calls in code', !/\.npcNode\s*\(/.test(code), 'npcNode call present');
    check('no partyMembers() calls in code', !/\.partyMembers\s*\(/.test(code), 'partyMembers call present');
    check('no ensureVillagerPositions() calls in code', !/ensureVillagerPositions\s*\(/.test(code), 'ensureVillagerPositions call present');
    const badState = lines.filter(l => /Game\.state\.\w+\s*=(?!=)|this\.state\.\w+\s*=(?!=)/.test(l));
    check('no Game.state / this.state writes', badState.length === 0, badState.slice(0, 3).join(' | '));
    const rng = lines.filter(l => /Math\.random|\.roll\(/.test(l));
    check('no RNG draws in instrument', rng.length === 0, rng.slice(0, 3).join(' | '));
  }

  console.log('== (c) FIXTURES (fake state, no harness) ==');
  {
    // Fighter at node (2,3); A same node, B adjacent, C at d=2, D far.
    // E has NO nodePos entry -> defaulted to Haven (4,4), which is d=2
    // from (2,3) — and the fixture state must be UNCHANGED after.
    const fake = {
      villagerId: 'scholar1',
      state: { village: {
        roster: ['f1', 'A', 'B', 'C', 'D', 'E', 'dead1'],
        nodePos: { f1: { nx: 2, ny: 3 }, A: { nx: 2, ny: 3 }, B: { nx: 3, ny: 3 }, C: { nx: 4, ny: 3 }, D: { nx: 8, ny: 8 } },
        px: 4, py: 4, health: { dead1: 0 }, trust: { A: 40 }, party: ['scholar1', 'A', 'ghost'], assignments: { B: { task: 'forage' } },
      } },
    };
    const before = JSON.stringify(fake.state);
    const snap = WP.nodeSnapshot(fake, 'f1', { tx: 2, ty: 3 });
    check('nodeSnapshot buckets', snap.sameNode.map(x => x.vid).join(',') === 'A'
      && snap.adjacent.map(x => x.vid).join(',') === 'B'
      && snap.within2.map(x => x.vid).sort().join(',') === 'C,E'
      && snap.farther.map(x => x.vid).join(',') === 'D', JSON.stringify({ same: snap.sameNode, adj: snap.adjacent, w2: snap.within2 }));
    check('nodeSnapshot flags defaulted E', snap.unplaced.includes('E') && !snap.fighterDefaulted, JSON.stringify(snap.unplaced));
    check('nodeSnapshot excludes dead roster', !snap.sameNode.some(x => x.vid === 'dead1') && !snap.farther.some(x => x.vid === 'dead1'), 'dead1 leaked');
    check('nodeSnapshot reads crew + task', snap.crewOutdoor.join(',') === 'B' && snap.fighterTask === null, JSON.stringify(snap.crewOutdoor));
    check('nodeSnapshot does NOT write fixture state', JSON.stringify(fake.state) === before, 'fixture state mutated');
    check('formalParty filters scholar + non-roster', WP.formalParty(fake).join(',') === 'A', WP.formalParty(fake).join(','));
    check('classifyFieldFight taxonomy', WP.classifyFieldFight({ outcome: 'vKill' }) === 'vKill'
      && WP.classifyFieldFight({ outcome: 'bogus' }) === 'unresolved'
      && WP.classifyFieldFight(null) === 'unresolved', 'taxonomy mismatch');
  }

  console.log('== (d) REAL-SWEEP GATE: 1 pilot seed, 60d, scratch EVID ==');
  {
    const scratch = '/tmp/w4party-proof-20261030';
    try { fs.rmSync(scratch, { recursive: true, force: true }); } catch (e) {}
    const env = Object.assign({}, process.env, { SEEDS: '85101', DAYS: '60', EVID: scratch });
    execFileSync('node', [path.join(REPO, 'scripts', 'w4party-sweep-20261030.js')], { env, stdio: 'pipe' });
    const fp = path.join(scratch, 'leadfeast', 's85101.json');
    check('sweep wrote per-seed JSON', fs.existsSync(fp), 'missing ' + fp);
    const first = fs.readFileSync(fp, 'utf8');
    const j = JSON.parse(first);
    check('sweep JSON zero instrument errors', (j.instrumentErrors || []).length === 0, (j.instrumentErrors || []).slice(0, 2).join(' | '));
    check('sweep JSON carries meetings + tb arrays', Array.isArray(j.meetings) && Array.isArray(j.tbFights), 'missing arrays');
    execFileSync('node', [path.join(REPO, 'scripts', 'w4party-sweep-20261030.js')], { env, stdio: 'pipe' });
    const second = fs.readFileSync(fp, 'utf8');
    check('sweep re-run byte-identical', first === second, 'bytes differ');
    const ana = execFileSync('node', [path.join(REPO, 'scripts', 'w4party-analyze-20261030.js'), path.join(scratch, 'leadfeast')], { encoding: 'utf8' });
    check('analyzer runs clean on sweep output', /seeds: 1/.test(ana) && /WALL:/.test(ana), ana.split('\n').slice(0, 3).join(' | '));
    try { fs.rmSync(scratch, { recursive: true, force: true }); } catch (e) {}
  }

  console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROOF CRASH: ' + (e && e.stack || e)); process.exit(1); });
