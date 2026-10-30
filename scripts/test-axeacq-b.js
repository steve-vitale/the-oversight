#!/usr/bin/env node
// test-axeacq-b.js — proof for sim-axeacq-b (DIAG only).
// Part A: static code/data facts (tier ladder, no hatchet recipe,
//   no hatchet in ruin pools) read from the repo files themselves.
// Part B: analyzer legs on synthetic corpora (spawn / loot /
//   unrecorded / blocked-survived / blocked-died / mismatch),
//   written to a scratch dir inside this worktree and removed
//   in a finally block — no leftovers on success or failure.
// Part C: live spawn-kit replay (2 seeds): the recorder's tier /
//   canFell reads are real engine reads on a real vessel kit.
// Part D: determinism — re-run corpus byte-equals the original
//   corpus (recursive compare, 'ms' keys stripped defensively).
// Part E: census-file assertions over the committed analyzer
//   outputs (every seed classified, 0 recorder errors, bank
//   equivalence counts).
// Usage:
//   node scripts/test-axeacq-b.js   (full: A+B+C+D+E)
//   AXEACQ_PROOF_STAGE=fixtures node scripts/test-axeacq-b.js
//     (A+B+C only — runs before any judged leg exists)
// Env for D: AXEACQ_DET_ORIG, AXEACQ_DET_RERUN (dirs).
// Env for E: AXEACQ_CENSUS, AXEACQ_BANK_GUARD,
//   AXEACQ_BANK_ON (analyzer JSON files).
// Exit non-zero on any failure.
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { nighttravel } = require('./policies/nighttravel');
const { withWoodcarry, newStore } = require('./policies/woodcarry');
const { withWoodwarm, newStore: newWwStore } = require('./policies/woodwarm');

const ROOT = path.join(__dirname, '..');
const EVID = path.join(ROOT, 'evidence', '2026-10-30');
const STAGE = process.env.AXEACQ_PROOF_STAGE || 'full';
let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : '')); }
}
function stripMs(x) {
  if (Array.isArray(x)) return x.map(stripMs);
  if (x && typeof x === 'object') {
    const o = {};
    for (const k of Object.keys(x)) if (k !== 'ms') o[k] = stripMs(x[k]);
    return o;
  }
  return x;
}
function firstDiff(a, b, p) {
  if (JSON.stringify(a) === JSON.stringify(b)) return null;
  if (a && b && typeof a === 'object' && typeof b === 'object' && !Array.isArray(a) && !Array.isArray(b)) {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const k of keys) {
      const d = firstDiff(a[k], b[k], p + '.' + k);
      if (d) return d;
    }
    return p + ' (object diff)';
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return p + ' length ' + a.length + ' vs ' + b.length;
    for (let i = 0; i < a.length; i++) {
      const d = firstDiff(a[i], b[i], p + '[' + i + ']');
      if (d) return d;
    }
  }
  return p + ': ' + JSON.stringify(a) + ' vs ' + JSON.stringify(b);
}

function partA() {
  const items = JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'data', 'items.json'), 'utf8'));
  const list = Array.isArray(items) ? items : items.items;
  const byId = new Map(list.map((i) => [i.id, i]));
  const tierOf = (id) => ((byId.get(id) || {}).tool || {}).woodcut || null;
  check('ladder: stone_knife whittle', tierOf('stone_knife') === 'whittle', tierOf('stone_knife'));
  check('ladder: machete brush', tierOf('machete') === 'brush', tierOf('machete'));
  check('ladder: hand_saw prune', tierOf('hand_saw') === 'prune', tierOf('hand_saw'));
  check('ladder: hatchet fell', tierOf('hatchet') === 'fell', tierOf('hatchet'));
  check('hatchet is the ONLY fell-tier item', list.filter((i) => (i.tool || {}).woodcut === 'fell').map((i) => i.id).join(',') === 'hatchet');
  check('hatchet class weapon, findable, no alien origin',
    byId.get('hatchet').class === 'weapon' && byId.get('hatchet').findable === true && byId.get('hatchet').origin === undefined,
    { class: byId.get('hatchet').class, findable: byId.get('hatchet').findable, origin: byId.get('hatchet').origin });
  const recipes = JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'data', 'recipes.json'), 'utf8'));
  check('recipes.json contains no hatchet', !JSON.stringify(recipes).includes('hatchet'));
  const regions = JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'data', 'regions.json'), 'utf8'));
  check('regions.json contains no hatchet', !JSON.stringify(regions).includes('hatchet'));
  const storage = fs.readFileSync(path.join(ROOT, 'src', 'js', 'storage.js'), 'utf8');
  check('storage TIER_RANK fell=4', /TIER_RANK\s*=\s*\{[^}]*fell:\s*4/.test(storage));
  check('cutInfo canFell iff rank >= fell', /canFell\s*=\s*rank\s*>=\s*TIER_RANK\.fell/.test(storage));
}

function synthSeed(seed, opts) {
  // opts: {spawnHatchet, mornings:[{loopDay,hasHatchet,canFell}], evenings:[{loopDay,hatchetLines}], endReason}
  const spawn = { gameDay: 0, inv: opts.spawnHatchet ? ['hatchet'] : ['stone_knife'], invNames: opts.spawnHatchet ? ['Hatchet'] : ['Stone knife'], eq: [], eqNames: [], hasHatchet: !!opts.spawnHatchet, tier: opts.spawnHatchet ? 'fell' : 'whittle', toolName: opts.spawnHatchet ? 'Hatchet' : 'Stone knife', canFell: !!opts.spawnHatchet, occupation: 'carpenter' };
  const mornings = (opts.mornings || []).map((m) => ({ loopDay: m.loopDay, axe: { gameDay: m.loopDay, inv: m.hasHatchet ? ['hatchet'] : ['stone_knife'], invNames: [], eq: [], eqNames: [], hasHatchet: !!m.hasHatchet, tier: m.canFell ? 'fell' : 'whittle', toolName: m.canFell ? 'Hatchet' : 'Stone knife', canFell: !!m.canFell, occupation: 'carpenter' } }));
  const evenings = (opts.evenings || []).map((e) => ({ loopDay: e.loopDay, hatchetLines: e.hatchetLines || [] }));
  return { seed, spawnSnap: spawn, mornings, evenings, daysAlive: opts.daysAlive || 30, endReason: opts.endReason || 'survived', gameDays: 30, maxWaveUnlocked: 1, waveKills: {}, endState: { won: false, villageLost: false, scaleRank: 'village', stage: null, standing: 0 } };
}

function partB() {
  const scratch = path.join(EVID, 'sim-axeacq-b-proof-scratch');
  try {
    fs.mkdirSync(scratch, { recursive: true });
    const cases = [
      { name: 'spawn', inst: synthSeed(1, { spawnHatchet: true, mornings: [], evenings: [] }) },
      { name: 'loot', inst: synthSeed(2, { mornings: [{ loopDay: 2, hasHatchet: false, canFell: false }, { loopDay: 5, hasHatchet: true, canFell: true }], evenings: [{ loopDay: 4, hatchetLines: ['You loot the body. Took Hatchet off the body.'] }] }) },
      { name: 'unrecorded', inst: synthSeed(3, { mornings: [{ loopDay: 2, hasHatchet: false, canFell: false }, { loopDay: 5, hasHatchet: true, canFell: true }], evenings: [{ loopDay: 4, hatchetLines: [] }] }) },
      { name: 'blocked-survived', inst: synthSeed(4, { mornings: [{ loopDay: 2, hasHatchet: false, canFell: false }], evenings: [] }) },
      { name: 'blocked-died', inst: synthSeed(5, { mornings: [{ loopDay: 2, hasHatchet: false, canFell: false }], evenings: [], endReason: 'village-lost' }) },
      { name: 'mismatch', inst: synthSeed(6, { mornings: [{ loopDay: 2, hasHatchet: false, canFell: true }], evenings: [] }) },
    ];
    for (const c of cases) fs.writeFileSync(path.join(scratch, 'axeacq-b-nighttravel-s' + c.inst.seed + '.json'), JSON.stringify(c.inst));
    const out = JSON.parse(execFileSync('node', [path.join(__dirname, 'analyze-axeacq-b.js'), scratch], { encoding: 'utf8' }));
    const bySeed = new Map(out.rows.map((r) => [r.seed, r]));
    check('synth spawn -> ACQUIRED spawn day 0', bySeed.get(1).classification === 'ACQUIRED' && bySeed.get(1).firstAxe.source === 'spawn' && bySeed.get(1).firstAxe.loopDay === 0, bySeed.get(1));
    check('synth loot line -> loot source', bySeed.get(2).classification === 'ACQUIRED' && bySeed.get(2).firstAxe.source === 'loot', bySeed.get(2).firstAxe);
    check('synth no line -> unrecorded, never guessed', bySeed.get(3).classification === 'ACQUIRED' && bySeed.get(3).firstAxe.source === 'unrecorded', bySeed.get(3).firstAxe);
    check('synth never + survived -> BLOCKED-survived', bySeed.get(4).classification === 'BLOCKED-survived-without-acquisition', bySeed.get(4).classification);
    check('synth never + village-lost -> BLOCKED-died', bySeed.get(5).classification === 'BLOCKED-died-before-acquisition', bySeed.get(5).classification);
    check('synth canFell-without-hatchet -> mismatch recorded, still ACQUIRED', !!bySeed.get(6).mismatch && bySeed.get(6).classification === 'ACQUIRED', bySeed.get(6));
    check('synth summary counts', out.summary.acquired === 4 && out.summary.blocked === 2 && out.summary.unclassified === 0, out.summary);
  } finally {
    try { fs.rmSync(scratch, { recursive: true, force: true }); } catch (e) {}
    check('proof scratch dir removed', !fs.existsSync(scratch));
  }
}

async function partC() {
  // Live spawn-kit replay: 2 seeds, warmed policy stack, 3 loop-days.
  // Proves axeSnap-style reads (tier/canFell/inventory) are real.
  for (const seed of [15215, 16101]) {
    const { Game } = await loadGame({ seed, mode: 'axeacq-proof', fullTelemetry: false });
    await setupGame(Game);
    const sch = Game.state.scholar || {};
    const inv = (sch.inventory || []).map((i) => i.itemId || i.id || null).filter(Boolean);
    const wt = Game.woodcutTier();
    const ci = Game.cutInfo('bigtree');
    check('seed ' + seed + ' spawn snap reads tier + canFell consistently',
      !!wt && !!ci && (ci.canFell === (wt.tier === 'fell')) && (ci.tier === wt.tier),
      { inv, tier: wt && wt.tier, canFell: ci && ci.canFell });
    // 3 loop-days under the driver stack (behavior-neutral read check).
    const wcStore = newStore();
    const base = withWoodcarry(nighttravel, wcStore);
    const wwStore = newWwStore();
    const warmed = withWoodwarm(base, wwStore);
    const policy = Object.assign({}, base, {
      daily(Game2, ctx) {
        const s2 = Game2.state.scholar || {};
        const w2 = Game2.woodcutTier();
        const c2 = Game2.cutInfo('bigtree');
        if (c2.canFell !== (w2.tier === 'fell')) throw new Error('tier/canFell inconsistent mid-run');
        warmed.daily(Game2, ctx);
      },
    });
    const res = await runDays(Game, policy, { days: 3, manifest: null });
    check('seed ' + seed + ' 3-day replay runs without tier inconsistency', !!res && res.days >= 0, res && res.days);
  }
}

function partD() {
  const origDir = process.env.AXEACQ_DET_ORIG || path.join(EVID, 'sim-axeacq-b-corpus-pilot');
  const rerunDir = process.env.AXEACQ_DET_RERUN || path.join(EVID, 'sim-axeacq-b-corpus-determinism');
  check('determinism dirs exist', fs.existsSync(origDir) && fs.existsSync(rerunDir), [origDir, rerunDir]);
  if (!fs.existsSync(origDir) || !fs.existsSync(rerunDir)) return;
  const files = fs.readdirSync(rerunDir).filter((f) => f.endsWith('.json')).sort();
  check('determinism rerun has files', files.length > 0, files.length);
  for (const f of files) {
    const a = stripMs(JSON.parse(fs.readFileSync(path.join(origDir, f), 'utf8')));
    const b = stripMs(JSON.parse(fs.readFileSync(path.join(rerunDir, f), 'utf8')));
    const d = firstDiff(a, b, f);
    check('determinism byte-equal (ms-stripped): ' + f, d === null, d);
  }
}

function partE() {
  const census = process.env.AXEACQ_CENSUS || path.join(EVID, 'sim-axeacq-b-census.json');
  const bankGuard = process.env.AXEACQ_BANK_GUARD || path.join(EVID, 'sim-axeacq-b-census-bank-guard.json');
  const bankOn = process.env.AXEACQ_BANK_ON || path.join(EVID, 'sim-axeacq-b-census-bank-on.json');
  for (const [label, pth] of [['census (column a, guard leg)', census], ['bank guard', bankGuard], ['bank on', bankOn]]) {
    check(label + ' file exists', fs.existsSync(pth), pth);
  }
  if (![census, bankGuard, bankOn].every((pth) => fs.existsSync(pth))) return;
  const c = JSON.parse(fs.readFileSync(census, 'utf8'));
  const bg = JSON.parse(fs.readFileSync(bankGuard, 'utf8'));
  const bo = JSON.parse(fs.readFileSync(bankOn, 'utf8'));
  check('census: 16 seeds, 0 unclassified, 0 recorder errors',
    c.rows.length === 16 && c.summary.unclassified === 0 && c.summary.recorderErrorCount === 0,
    [c.rows.length, c.summary]);
  check('census: every row classified ACQUIRED or BLOCKED-*',
    c.rows.every((r) => r.classification === 'ACQUIRED' || r.classification.startsWith('BLOCKED')), c.rows.map((r) => r.classification));
  check('bank guard: 10 seeds, 0 recorder errors, stranded rows carry axe reads',
    bg.rows.length === 10 && bg.summary.recorderErrorCount === 0 && bg.stranded.every((x) => x.axe !== null),
    [bg.rows.length, bg.summary, bg.stranded.length]);
  check('bank on: 10 seeds, 0 recorder errors, stranded rows carry axe reads',
    bo.rows.length === 10 && bo.summary.recorderErrorCount === 0 && bo.stranded.every((x) => x.axe !== null),
    [bo.rows.length, bo.summary, bo.stranded.length]);
  check('bank guard stranded mornings == walktree still count 4', bg.summary.strandedMornings === 4, bg.summary.strandedMornings);
  check('bank on stranded mornings == walktree still count 11', bo.summary.strandedMornings === 11, bo.summary.strandedMornings);
}

async function main() {
  partA();
  partB();
  await partC();
  if (STAGE === 'full') { partD(); partE(); }
  else console.log('STAGE=fixtures: skipping determinism (D) and census-file (E) legs');
  console.log('axeacq proof: ' + pass + ' passed, ' + fail + ' failed');
  if (fail) process.exit(1);
}
main().catch((e) => { console.error('AXEACQ PROOF CRASH', e && (e.stack || e)); process.exit(2); });
