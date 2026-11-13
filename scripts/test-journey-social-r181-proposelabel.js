// test-journey-social-r181-proposelabel.js — r181 propose-label fix (Lane B).
// The r141 bond instrument hard-labeled every Game.proposeLink call
// 'scholar' ("any call observed is scholar-initiated"). That claim is
// WRONG on the current base: src/js/bond-initiation.js:840 calls
// G.proposeLink(pending.villageId) to FORMALIZE an already-staged proposal
// the scholar accepted, so the call's initiator is the proposal's
// proposer, not the caller. On the r181 panel every proposeLink call
// matches an ACCEPTED villager link proposal on the same seed, same day,
// same target — the calls are the engine executing villager proposals,
// not scholar proposals. The fix (r181 driver): record initiatorKind
// 'engine' + acceptedBy (the bearer who accepted), and read the true
// scholar-vs-villager split from the bond_proposed tele, which judges the
// initiator at fire time (1 scholar proposal on the panel: Ricardo d31).
// Proof: the r181 4-seed corpus as the anchor (15/15 correspondence).
'use strict';
const fs = require('fs'), path = require('path');

let pass = 0, fail = 0;
function check(name, got, want) {
  if (got === want) { pass++; console.log('PASS ' + name + ' (' + got + ')'); }
  else { fail++; console.log('FAIL ' + name + ' got=' + JSON.stringify(got) + ' want=' + JSON.stringify(want)); }
}

const DIR = path.join(__dirname, '..', 'evidence', '2026-11-12');
let totalCalls = 0, matched = 0, unmatched = [];
let scholarTele = 0, villagerTele = 0;
for (const seed of [43701, 43702, 43703, 43704]) {
  const d = JSON.parse(fs.readFileSync(path.join(DIR, `journey-social-life-r181-${seed}.json`), 'utf8'));
  const acceptedVillagerLinks = (d.bondProposed || []).filter(b =>
    b.initiatorKind === 'villager' && b.kind === 'link' && b.outcome === 'accepted');
  for (const c of (d.proposeCalls || [])) {
    totalCalls++;
    const hit = acceptedVillagerLinks.find(b => b.day === c.day && String(b.targetId) === String(c.targetId));
    if (hit) matched++;
    else unmatched.push({ seed, day: c.day, targetId: c.targetId, method: c.method });
  }
  for (const b of (d.bondProposed || [])) {
    if (b.initiatorKind === 'scholar') scholarTele++;
    else if (b.initiatorKind === 'villager') villagerTele++;
  }
}
check('proposeCalls total', totalCalls, 15);
check('proposeCalls matching an accepted villager link proposal (day+target)', matched, 15);
check('proposeCalls unmatched', unmatched.length, 0);
if (unmatched.length) console.log('UNMATCHED: ' + JSON.stringify(unmatched));
check('bond_proposed tele: scholar-initiated', scholarTele, 1);
check('bond_proposed tele: villager-initiated', villagerTele, 114);

// Source guard: the driver wrap must label the execution step 'engine',
// not the proposal's proposer 'scholar'.
const src = fs.readFileSync(path.join(__dirname, 'journey-social-life-r189-20261112.js'), 'utf8');
const wrapStart = src.indexOf('// r141 (j) BOND INSTRUMENT');
const wrapEnd = src.indexOf('} catch (e) { ctxShared.proposeWrapped', wrapStart);
const wrapSrc = src.slice(wrapStart, wrapEnd);
check('wrap labels the execution step engine', wrapSrc.includes("initiatorKind: 'engine'"), true);
check('wrap no longer hard-codes scholar', wrapSrc.includes("initiatorKind: 'scholar'"), false);
check('wrap records the accepting bearer', wrapSrc.includes('acceptedBy: scholarName'), true);
check('wrap cites bond-initiation.js:840', wrapSrc.includes('bond-initiation.js:840'), true);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
