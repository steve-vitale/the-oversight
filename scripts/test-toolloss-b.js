#!/usr/bin/env node
// test-toolloss-b.js — proof for sim-toolloss-b. Checks: analyzer
// helpers (knifeIn), the judged bracket, the gap corpus narration,
// the corpse check, determinism (gap rerun trajectory == judged),
// pilot-band scope, and the tracked-diff guard (src/ and
// scripts/policies/ unchanged vs the prereg commit's parent).
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const A = require('./analyze-toolloss-b');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra !== undefined ? ' :: ' + JSON.stringify(extra) : '')); }
}
const BASE = path.join(__dirname, '..', 'evidence', '2026-10-31');
const on = A.load('on', 15215);
const guard = A.load('guard', 15215);
const gap = A.loadGap(15215);

// knifeIn unit cases
check('knifeIn inventory', A.knifeIn({ inv: [{ id: 'stone_knife' }], equipped: {} }) === 'inventory');
check('knifeIn equipped', A.knifeIn({ inv: [], equipped: { melee: { id: 'stone_knife' } } }) === 'equipped');
check('knifeIn absent', A.knifeIn({ inv: [{ id: 'wood' }], equipped: {} }) === 'absent');
check('knifeIn null snap', A.knifeIn(null) === null);

// Bracket: judged ON leg
const b = A.bracket(on);
check('ON morning16 whittle+knife', b.morning16.tier === 'whittle' && b.morning16.knife === 'inventory');
check('ON evening16 whittle+knife', b.evening16.tier === 'whittle' && b.evening16.knife === 'inventory');
check('ON evening16 still creek, old bearer', b.evening16.bearer === 'gen_gyft62f' && b.evening16.tile === 'creek' && !b.evening16.inside);
check('ON morning17 none+absent', b.morning17.tier === 'none' && b.morning17.knife === 'absent');
check('ON bearer changed across bracket', b.bearerChanged === true);
check('ON morning17 new bearer at haven', b.morning17.bearer === 'gen_eni1m98' && b.morning17.inside && b.morning17.tile === 'haven');
// Guard contrast: no change
const bg = A.bracket(guard);
check('guard bracket unchanged bearer+knife', !bg.bearerChanged && bg.morning17.knife === 'inventory' && bg.morning17.tier === 'whittle');
// Full morning coverage
const onM = A.morningTable(on);
check('ON mornings 8-16 all whittle', onM.filter((m) => m.loopDay >= 8 && m.loopDay <= 16).every((m) => m.tier === 'whittle'));
check('ON morning17 none', onM.find((m) => m.loopDay === 17).tier === 'none');
check('guard mornings 8-17 all whittle', A.morningTable(guard).filter((m) => m.loopDay >= 8 && m.loopDay <= 17).every((m) => m.tier === 'whittle'));
// Death record
const pd = (on.deaths || []).find((x) => x.player && x.who === 'gen_gyft62f');
check('death record day17 wild player', !!pd && pd.day === 17 && pd.cause === 'the wild');
// Gap narration
const m17 = gap.mornings.find((m) => m.loopDay === 17);
check('gap bearer names', gap.mornings.find((m) => m.loopDay === 16).morningInv.scholarName === 'Gabriela'
  && m17.morningInv.scholarName === 'Dakota');
check('gap death line present', m17.gapLines.some((l) => /is dead — the wild/i.test(l)));
check('gap mantle line present', m17.gapLines.some((l) => /mantle passes to Dakota Ibarra/i.test(l)));
check('gap wake-somebody-else line present', m17.gapLines.some((l) => /wake up somebody else/i.test(l)));
check('gap hushpuppy fight lines present', m17.gapLines.some((l) => /HUSHPUPPY/i.test(l))
  && m17.gapLines.some((l) => /hits you for 15/i.test(l)) && m17.gapLines.some((l) => /You go down/i.test(l)));
check('gap no knife line (loss never narrated as loss)', !m17.gapLines.some((l) => /knife/i.test(l)));
// Corpse check: knife on Gabriela's corpse, unlooted, from morning 17 on
const cc = A.corpseCheck(gap);
check('corpse absent morning16', cc[16] === null);
check('corpse holds knife mornings 17-19', [17, 18, 19].every((d) => cc[d] && cc[d].items.includes('stone_knife') && !cc[d].looted));
check('corpse holds full loadout', cc[17].items.includes('hunting_spear') && cc[17].items.includes('work_gloves'));
// Gap vitals: old bearer spent (kcal 0), successor fresh
const eve16 = gap.evenings.find((e) => e.loopDay === 16);
check('eve16 bearer spent', eve16.eveningInv.vitals.kcal === 0 && eve16.eveningInv.vitals.health === 46);
check('morn17 successor fresh', m17.morningInv.vitals.kcal === 2340 && m17.morningInv.vitals.health === 100);
// Determinism: gap rerun trajectory == judged trajectory
check('gap rerun trajectory matches judged', JSON.stringify(gap.mornings.map((m) => [m.loopDay, m.morningInv.scholarId, m.morningCut.tier]))
  === JSON.stringify(on.mornings.map((m) => [m.loopDay, m.morningInv.scholarId, m.morningCut.tier])));
// Band: only 15215 drops, and with bearer change; no confirm trigger
const band = A.bandSummary();
check('band only 15215 drops', band.filter((x) => x.drop).map((x) => x.seed).join(',') === '15215');
check('band 15215 drop is bearer change', band.find((x) => x.seed === 15215).drop.bearerChanged === true);
check('band bearer changes exist elsewhere (succession is common)', band.filter((x) => x.changes.length).length >= 3);
// Store errs zero on judged legs
check('store errs zero', on.woodcarryStore.errs === 0 && on.warmthStore.errs === 0 && guard.woodcarryStore.errs === 0);
// Tracked-diff guard: src/ + scripts/policies/ unchanged vs prereg parent
try {
  const prereg = execSync('git log --oneline --all -- evidence/2026-10-31/sim-toolloss-b-prereg.md', { cwd: path.join(__dirname, '..'), encoding: 'utf8' })
    .trim().split('\n')[0].split(' ')[0];
  const diff = execSync('git diff --name-only ' + prereg + '^ HEAD -- src scripts/policies', { cwd: path.join(__dirname, '..'), encoding: 'utf8' }).trim();
  // Working tree may hold the new (untracked) driver files only; tracked diff must be empty.
  check('tracked src/policies diff empty', diff === '', diff);
} catch (e) { check('tracked src/policies diff empty', false, String(e && e.message)); }

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
