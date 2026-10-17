#!/usr/bin/env node
// test-fieldport-20261017.js — proof for the sim-fieldport arm (axis scale-onramp):
// the wave-4/5 field ports' HONEST audit/editor mechanics.
//
// CONTEXT: sim-findings #408/#409 documented that sigW4FieldMonster's audit
// branch and sigW5FieldMonster's editor branch INVERTED the TB mechanics:
// the audit branch halved the MONSTER's damage while narrating "your best
// trick is taxed", and the editor branch zeroed the MONSTER's damage while
// narrating "your swing hits the cutting-room floor". The sibling sim-apexhook
// arm (commit a3f9e124) already landed the honest ports. This test
// independently proves the honest mechanic RED→GREEN:
//
//   RED  — run with REPO=~/workspace/sim-fieldport-control (reconstructed
//          inverted ports, everything else byte-identical): assertions fail.
//   GREEN — run with REPO=<this worktree> (default): all assertions pass.
//
// The assertions test the HONEST behavior:
//   AUDIT (TB source of truth — sigW4 sigAuditHook): the villager's best
//     trick is taxed at half strength for 2 rounds. Port arms
//     rec.auditTaxRounds=2; the villager-strike section halves vd twice.
//     The monster's damage is NOT halved.
//   EDITOR (TB source of truth — sigW5 TB): the villager's swing is cut —
//     it never happened. Port arms rec.editorCuts=1; the villager-strike
//     section voids the swing (vd=0). The monster's damage is NOT zeroed.
// Negatives: on non-port days the ports are byte-identical pass-throughs
// (the fix fires ONLY on port days) — these pass on BOTH trees.
//
// Sim-harness rules honored: Math.random seeded BEFORE eval (sim-harness
// does it), full src/js list via the harness, no Game.save stub.
// Each probe runs in its own child process (never two harnesses in one).
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const REPO = process.env.REPO || ROOT;
const HARNESS = path.join(REPO, 'scripts', 'sim-harness.js');

let pass = 0, fail = 0;
const fails = [];
function ok(cond, name) {
  if (cond) { pass++; }
  else { fail++; fails.push(name); console.log('  FAIL: ' + name); }
}

function gameEval(seed, js) {
  const tmpFile = path.join(os.tmpdir(), 'fieldport-synth-' + seed + '-' + process.pid + '.js');
  const code = `
const { loadGame, setupGame } = require('${HARNESS}');
(async () => {
  const { Game } = await loadGame({ seed: ${seed}, mode: 'synth', fullTelemetry: true });
  await setupGame(Game);
  const out = {};
  try { await (async () => { ${js} })(); } catch (e) { out.__err = String(e && e.stack || e).slice(0, 900); }
  console.log(JSON.stringify(out));
})().catch(e => { console.log(JSON.stringify({ __crash: String(e).slice(0, 300) })); });
`;
  fs.writeFileSync(tmpFile, code);
  try {
    const r = execSync('node ' + tmpFile, { cwd: path.join(REPO, 'scripts'), maxBuffer: 64 * 1024 * 1024 }).toString();
    const lines = r.trim().split('\n');
    return JSON.parse(lines[lines.length - 1] || '{}');
  } finally { try { fs.unlinkSync(tmpFile); } catch (e) {} }
}

const REPO_LABEL = REPO === ROOT ? 'armed(honest)' : 'control(inverted)';
console.log('== test-fieldport-20261017 — tree: ' + REPO_LABEL + ' ==');

// ---------- PORTS: direct port-call probes ----------
console.log('== PORTS ==');
{
  const o = gameEval(1701, `
    const P = {};
    const G = Game;
    function mkrec() { return { log: [], trickLog: [], mDealt: 0, vTaken: 0, actionKinds: [] }; }
    const lroll = (r) => r[0];
    const said = [];
    const _say = G.say.bind(G);
    G.say = (t) => { try { said.push(String(t)); } catch (e) {} return _say(t); };
    // --- AUDIT: audit day (round 3) ---
    {
      const mdef = G.data.monsters.find(m => m.id === 'audit');
      const rec = mkrec();
      const before = 100;
      const got = G.sigW4FieldMonster(mdef, rec, { total: before, round: 3, rr: Math.random, lroll: lroll, vName: 'Yara', mName: 'Audit' });
      P.auditTaxSet = rec.auditTaxRounds === 2;          // tax lands on the VILLAGER's side
      P.auditMonsterUntouched = got === before;          // the monster's damage is NOT halved (the inversion)
      P.auditNarrates = said.join(' ').includes('taxed');
    }
    // --- AUDIT: deliberate inefficiency defeats the tax ---
    {
      const mdef = G.data.monsters.find(m => m.id === 'audit');
      const rec = mkrec(); rec.trickInefficient = 1;
      said.length = 0;
      const got = G.sigW4FieldMonster(mdef, rec, { total: 100, round: 3, rr: Math.random, lroll: lroll, vName: 'Yara', mName: 'Audit' });
      P.auditJankNoTax = (rec.auditTaxRounds | 0) === 0 && rec.trickInefficient === 0;
      P.auditJankNarrates = said.join(' ').includes('nothing to tax');
      P.auditJankUntouched = got === 100;
    }
    // --- AUDIT negatives: non-port days byte-identical ---
    {
      const mdef = G.data.monsters.find(m => m.id === 'audit');
      const rec = mkrec(); said.length = 0;
      const g1 = G.sigW4FieldMonster(mdef, rec, { total: 77, round: 1, rr: Math.random, lroll: lroll, vName: 'Yara', mName: 'Audit' });
      const rec2 = mkrec();
      const g2 = G.sigW4FieldMonster(mdef, rec2, { total: 77, round: 2, rr: Math.random, lroll: lroll, vName: 'Yara', mName: 'Audit' });
      P.auditNeg1 = g1 === 77 && (rec.auditTaxRounds | 0) === 0 && !said.join(' ').includes('Audit day');
      said.length = 0;
      P.auditNeg2 = g2 === 77 && (rec2.auditTaxRounds | 0) === 0 && !said.join(' ').includes('Audit day');
    }
    // --- EDITOR: cut round (3rd port call) arms the villager-side cut ---
    {
      const mdef = G.data.monsters.find(m => m.id === 'editor');
      const rec = mkrec();
      let got = 0;
      for (let i = 0; i < 3; i++) got = G.sigW5FieldMonster(mdef, rec, { total: 100, round: i + 1, rr: Math.random, lroll: lroll, vName: 'Yara', mName: 'Editor' });
      P.editorArmsCut = rec.editorCuts === 1;            // the cut arms on the VILLAGER's side
      P.editorMonsterUntouched = got === 100;            // the monster's damage is NOT zeroed (the inversion)
      P.editorNarrates = rec.log.join(' ').includes('scissors poise'); // editor narrates via rec.log, not say()
    }
    // --- EDITOR negatives: non-cut rounds byte-identical ---
    {
      const mdef = G.data.monsters.find(m => m.id === 'editor');
      const rec = mkrec();
      const g1 = G.sigW5FieldMonster(mdef, rec, { total: 64, round: 1, rr: Math.random, lroll: lroll, vName: 'Yara', mName: 'Editor' });
      const g2 = G.sigW5FieldMonster(mdef, rec, { total: 64, round: 2, rr: Math.random, lroll: lroll, vName: 'Yara', mName: 'Editor' });
      P.editorNeg = g1 === 64 && g2 === 64 && (rec.editorCuts | 0) === 0;
    }
    G.say = _say;
    out.P = P;
  `);
  if (o.__err || o.__crash) { console.log('  PROBE CRASH: ' + (o.__err || o.__crash)); process.exit(2); }
  const p = o.P;
  ok(p.auditTaxSet === true, 'audit: audit day arms auditTaxRounds=2 (villager-side tax)');
  ok(p.auditMonsterUntouched === true, 'audit: monster damage NOT halved (inversion gone)');
  ok(p.auditNarrates === true, 'audit: narration says the trick is taxed');
  ok(p.auditJankNoTax === true, 'audit: deliberate inefficiency → nothing to tax');
  ok(p.auditJankNarrates === true, 'audit: jank narration present');
  ok(p.auditJankUntouched === true, 'audit: jank day leaves monster damage untouched');
  ok(p.auditNeg1 === true, 'audit: round 1 byte-identical pass-through');
  ok(p.auditNeg2 === true, 'audit: round 2 byte-identical pass-through');
  ok(p.editorArmsCut === true, 'editor: cut round arms editorCuts=1 (villager-side cut)');
  ok(p.editorMonsterUntouched === true, 'editor: monster damage NOT zeroed (inversion gone)');
  ok(p.editorNarrates === true, 'editor: narration poises the scissors on the villager swing');
  ok(p.editorNeg === true, 'editor: non-cut rounds byte-identical pass-through');
}

// ---------- ARCS: full synthetic fieldFights, tax/cut land on the villager ----------
console.log('== ARCS ==');
{
  const o = gameEval(1702, `
    const A = {};
    const G = Game;
    // audit-day narration flows through game.say (not rec.log) — capture it
    const said = [];
    const _say = G.say.bind(G);
    G.say = (t) => { try { said.push(String(t)); } catch (e) {} };
    function setupFighter() {
      const vs = G.data.villagers || [];
      const v = vs.find(x => !x.dead) || vs[0];
      const vid = v.id;
      // NOTE: villagerTricks deliberately NOT taught — the trick would
      // defeat the tax/cut; here the port mechanic must land unopposed.
      try { G.state.village = G.state.village || {}; G.state.village.health = G.state.village.health || {}; G.state.village.health[vid] = 100000; } catch (e) {}
      try { v.abilities = []; } catch (e) {}
      return vid;
    }
    function weakMdef(mid) {
      const base = G.data.monsters.find(m => m.id === mid);
      const c = Object.assign({}, base);
      c.hp = [60, 60];
      return c;
    }
    // --- AUDIT ARC: the tax lands on the villager's strike beats ---
    {
      const vid = setupFighter();
      const mdef = weakMdef('audit');
      const rec = G.fieldFight(vid, mdef, null, {});
      const log = (rec.log || []).join('\\n');
      A.auditRounds = rec.rounds | 0;
      A.auditTaxBeat = log.includes('(audited — half strength)');   // tax consumed in the villager-strike section
      A.auditDayNarrated = said.join(' ').includes('Audit day');
    }
    // --- EDITOR ARC: the villager's swing is voided, monster damage stands ---
    {
      const vid = setupFighter();
      const mdef = weakMdef('editor');
      const rec = G.fieldFight(vid, mdef, null, {});
      const log = (rec.log || []).join('\\n');
      A.editorRounds = rec.rounds | 0;
      A.editorCutBeat = log.includes('hits the cutting-room floor'); // CUT lands on the villager's strike
      A.editorVoidedSwing = /strikes for 0(\\D|$)/.test(log);          // the swing is voided (vd=0), never naturally 0
    }
    G.say = _say;
    out.A = A;
  `);
  if (o.__err || o.__crash) { console.log('  PROBE CRASH: ' + (o.__err || o.__crash)); process.exit(2); }
  const a = o.A;
  console.log('  arc info: auditRounds=' + a.auditRounds + ' editorRounds=' + a.editorRounds);
  ok(a.auditRounds >= 3, 'audit arc: fight reaches audit day (round 3)');
  ok(a.auditTaxBeat === true, 'audit arc: villager strike beats show (audited — half strength)');
  ok(a.auditDayNarrated === true, 'audit arc: audit-day narration present');
  ok(a.editorRounds >= 3, 'editor arc: fight reaches the cut round');
  ok(a.editorCutBeat === true, 'editor arc: CUT lands on the villager swing');
  ok(a.editorVoidedSwing === true, 'editor arc: a villager strike is voided (strikes for 0)');
}

console.log('\n' + pass + ' passed, ' + fail + ' failed' + (fails.length ? ' — ' + fails.join('; ') : ''));
process.exit(fail ? 1 : 0);
