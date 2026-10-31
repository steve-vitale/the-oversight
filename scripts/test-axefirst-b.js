#!/usr/bin/env node
// test-axefirst-b.js — proof for sim-axefirst-b.
// Unit cases for the source classifier + fell-capable mornings +
// strand extraction, then (when corpus dirs are passed) corpus
// checks: completeness, errs 0, determinism byte-identity, and the
// tracked-diff guard (src/ + scripts/policies/ empty vs pinned
// base 003a9c2f391edd56f31a0f6f9f1305dfe6380a48).
// Usage: node scripts/test-axefirst-b.js [pilotGuard pilotOn confirmGuard confirmOn [determinismDir]]
// Guard and ON legs live in separate dirs (same file names).
// With no dirs, unit cases only.
'use strict';
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const { classifySource, censusLeg, strandMornings } = require('./analyze-axefirst-b');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; console.error('FAIL: ' + name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : '')); }
}
function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

// --- classifier unit cases (prereg classes) ---
check('classify spawn', classifySource({ spawnTierFell: true, lines: [] }) === 'spawn');
check('classify stash fetch by line',
  classifySource({ spawnTierFell: false, lines: ['You remember the Hatchet at your space in the haven and fetch it — it rides in your pack now.'] }) === 'stash fetch');
check('classify corpse loot by line',
  classifySource({ spawnTierFell: false, lines: ['You take hatchet from Ethan. Your hands know what they did. (+2 trauma)'] }) === 'corpse loot');
check('classify craft by line',
  classifySource({ spawnTierFell: false, lines: ['You fashion a hatchet from the salvaged head and haft.'] }) === 'craft');
check('classify stash-diff inferred',
  classifySource({ spawnTierFell: false, lines: ['You eat the dried meat.'], prevStash: ['multitool', 'hatchet'], arrStash: ['multitool'], arrivalInvIds: ['hatchet', 'trail_mix'] }) === 'stash fetch (stash-diff inferred)');
check('classify other keeps lines (no silent relabel)',
  classifySource({ spawnTierFell: false, lines: ['The System grants you a Hatchet.'], prevStash: ['multitool'], arrStash: ['multitool'], arrivalInvIds: ['hatchet'] }) === 'other');
check('classify other when stash grows without fetch line',
  classifySource({ spawnTierFell: false, lines: [], prevStash: [], arrStash: [], arrivalInvIds: ['hatchet'] }) === 'other');
check('classify fetch line without hatchet is not stash fetch',
  classifySource({ spawnTierFell: false, lines: ['You remember the Hunting spear at your space in the haven and fetch it — it rides in your pack now.'], prevStash: [], arrStash: [], arrivalInvIds: ['hunting_spear'] }) === 'other');

// --- synthetic leg helper ---
function morning(loopDay, tier, opts) {
  const o = opts || {};
  return {
    loopDay, vesselId: o.vesselId || 'v1', inside: false, tile: 'creek',
    inCombat: false, morningWood: (o.wood === undefined ? 2 : o.wood),
    kcal: (o.kcal === undefined ? 40 : o.kcal),
    tool: { tier: tier ? { tier, name: tier === 'fell' ? 'Hatchet' : 'Stone knife', itemId: tier === 'fell' ? 'hatchet' : 'stone_knife' } : null,
      target: (o.target === undefined ? { cell: 'bigtree' } : o.target),
      cutInfo: (o.canFell === undefined ? null : { canFell: o.canFell }),
      ticksLeft: 256, walkSteps: 2 },
    inv: { inv: (o.inv || []).map((id) => ({ itemId: id })), eq: {}, stashFetchDay: null, armorFetchDay: null },
    stash: o.stash || [],
  };
}
function evening(loopDay, tier, opts) {
  const o = opts || {};
  return {
    loopDay,
    woodcarry: o.wc || null,
    eveningTool: { tier: tier ? { tier, name: tier === 'fell' ? 'Hatchet' : 'Stone knife', itemId: tier === 'fell' ? 'hatchet' : 'stone_knife' } : null },
    eveningInv: { inv: (o.inv || []).map((id) => ({ itemId: id })), eq: {}, stashFetchDay: (o.fetchDay === undefined ? null : o.fetchDay), armorFetchDay: null },
    eveningStash: o.stash || [],
    hatchetLines: o.hatchetLines || [], takeLines: o.takeLines || [],
  };
}
function leg(seed, ww, morningsList, eveningsList, spawn) {
  return { seed, woodwarm: ww, daysAlive: 30, endReason: 'survived', maxWaveUnlocked: 1,
    errCount: 0, evenings: eveningsList, mornings: morningsList, spawn: spawn || { stash: [], inv: { inv: [], eq: {} } } };
}

// Fell-capable morning: tier fell + canFell + target.
{
  const inst = leg(1, '1',
    [morning(2, null, { canFell: false }), morning(3, 'fell', { canFell: true })],
    [evening(1, null), evening(2, 'fell', { hatchetLines: ['You remember the Hatchet at your space in the haven and fetch it — it rides in your pack now.'], takeLines: ['You remember the Hatchet at your space in the haven and fetch it — it rides in your pack now.'] })]);
  const c = censusLeg(inst);
  check('firstAxeEvening day 2', c.firstAxeEvening === 2, c.firstAxeEvening);
  check('firstAxeMorning day 3', c.firstAxeMorning === 3, c.firstAxeMorning);
  check('source stash fetch', c.source === 'stash fetch', c.source);
  check('firstFellCapableMorning day 3', c.firstFellCapableMorning === 3, c.firstFellCapableMorning);
  check('not heldNeverFell', c.heldButNeverFellCapable === false);
}
// Held but never fell-capable: axe held, target null every morning.
{
  const inst = leg(2, '0',
    [morning(2, 'fell', { canFell: true, target: null })],
    [evening(1, 'fell', { hatchetLines: [], takeLines: [] })]);
  const c = censusLeg(inst);
  check('heldNeverFell true when target null', c.heldButNeverFellCapable === true, c);
  check('fellCapable null when target null', c.firstFellCapableMorning === null);
}
// Never holds an axe: both dates null, source null.
{
  const inst = leg(3, '1',
    [morning(2, 'whittle', { canFell: false })],
    [evening(1, 'whittle')]);
  const c = censusLeg(inst);
  check('never axe: dates null', c.firstAxeEvening === null && c.firstAxeMorning === null);
  check('never axe: source null', c.source === null);
  check('never axe: fellCapable null', c.firstFellCapableMorning === null);
}
// Spawn-held axe.
{
  const inst = leg(4, '0',
    [morning(2, 'fell', { canFell: true })],
    [evening(1, 'fell')],
    { stash: [], inv: { inv: [{ itemId: 'hatchet' }], eq: {} } });
  const c = censusLeg(inst);
  check('spawn source', c.source === 'spawn', c.source);
  check('spawn flag', c.spawnTierFell === true);
}
// Strand extraction + pairing: still evening -> next morning, not haven.
{
  const inst = leg(5, '1',
    [morning(2, 'fell', { canFell: true }), morning(3, 'whittle', { canFell: false })],
    [evening(1, 'fell', { wc: { bucket: 'creek', rescued: false } }),
     evening(2, 'whittle', { wc: { bucket: 'creek', rescued: false } })]);
  const strands = strandMornings(inst);
  check('strand count 2', strands.length === 2, strands.length);
  const c = censusLeg(inst);
  check('pairing has loopDay 2 only', eq(c.pairing, [2]), c.pairing);
  check('strandMornings 2', c.strandMornings === 2);
}
// Rescued creek evening is NOT a strand morning; haven wake is NOT.
{
  const mHaven = morning(2, 'fell', { canFell: true }); mHaven.inside = true; mHaven.tile = 'haven';
  const inst = leg(6, '0', [mHaven, morning(3, 'whittle', { canFell: false })],
    [evening(1, 'fell', { wc: { bucket: 'creek', rescued: false } }),
     evening(2, 'whittle', { wc: { bucket: 'creek', rescued: true } })]);
  const c = censusLeg(inst);
  check('haven wake + rescued excluded', c.strandMornings === 0, c.strandMornings);
  check('pairing empty when no strand', eq(c.pairing, []));
}

// --- corpus checks (only when dirs passed) ---
const pilotGuard = process.argv[2], pilotOn = process.argv[3], confirmGuard = process.argv[4], confirmOn = process.argv[5], detDir = process.argv[6];
const pilotDir = pilotGuard, confirmDir = confirmGuard;
if (pilotGuard || confirmGuard) {
  const PINNED = '003a9c2f391edd56f31a0f6f9f1305dfe6380a48';
  const root = path.join(__dirname, '..');
  try {
    const diff = cp.execSync('git diff ' + PINNED + ' -- src scripts/policies', { cwd: root, encoding: 'utf8' });
    check('tracked-diff guard: src/ + scripts/policies/ empty vs pinned base', diff.trim() === '', diff.slice(0, 300));
  } catch (e) { check('tracked-diff guard runs', false, String(e && e.message)); }
  function checkCorpus(dir, expectedLegs, label) {
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
    check(label + ' leg count', files.length === expectedLegs, files.length);
    for (const f of files) {
      const inst = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
      const c = censusLeg(inst);
      check(label + ' ' + f + ' errs 0', inst.errCount === 0, inst.errCount);
      check(label + ' ' + f + ' mornings complete', c.incompleteMornings === 0, c.incompleteMornings);
      check(label + ' ' + f + ' strands complete', c.incompleteStrands === 0, c.incompleteStrands);
      if (c.firstAxeEvening !== null || c.firstAxeMorning !== null) {
        check(label + ' ' + f + ' source classified', c.source !== null, c.source);
        if (c.source === 'other') {
          check(label + ' ' + f + ' other has quoted lines/diff', !!(c.sourceEvidence && (c.sourceEvidence.lines.length || c.sourceEvidence.arrivalInvIds)), c.sourceEvidence);
        }
      }
      check(label + ' ' + f + ' evenings>=mornings-1', inst.evenings.length >= inst.mornings.length, [inst.evenings.length, inst.mornings.length]);
    }
  }
  if (pilotGuard) checkCorpus(pilotGuard, 8, 'pilot-guard');
  if (pilotOn) checkCorpus(pilotOn, 8, 'pilot-on');
  if (confirmGuard) checkCorpus(confirmGuard, 12, 'confirm-guard');
  if (confirmOn) checkCorpus(confirmOn, 12, 'confirm-on');
  if (detDir && pilotOn) {
    const pilotFiles = fs.readdirSync(pilotOn).filter((f) => /s15215/.test(f) && f.includes('axefirst')).sort();
    // Determinism file must byte-match the judged 15215 ON pilot file.
    const detFiles = fs.readdirSync(detDir).filter((f) => f.endsWith('.json')).sort();
    check('determinism dir has 1 file', detFiles.length === 1, detFiles.length);
    if (detFiles.length === 1) {
      const detData = fs.readFileSync(path.join(detDir, detFiles[0]), 'utf8');
      const onPilot = pilotFiles.filter((f) => {
        const inst = JSON.parse(fs.readFileSync(path.join(pilotOn, f), 'utf8'));
        return inst.woodwarm === '1';
      });
      check('pilot has one 15215 ON file', onPilot.length === 1, onPilot);
      if (onPilot.length === 1) {
        const judged = fs.readFileSync(path.join(pilotOn, onPilot[0]), 'utf8');
        check('determinism byte-identical', detData === judged, 'lengths ' + detData.length + ' vs ' + judged.length);
      }
    }
  }
}

console.log('axefirst proof: ' + pass + ' pass, ' + fail + ' fail');
process.exit(fail ? 1 : 0);
