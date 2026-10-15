#!/usr/bin/env node
// scripts/test-tribcollapse-20261015.js — proof for the tribute-collapse
// named mode (sim-tribcollapse, 2026-10-15, scale-onramp axis).
//
// The r5 taxonomy kept tribute-collapse as other-named with the mechanism
// in the evidence (sim-holdloss2 narrative 7 — the s44 belongfeast loss:
// grief-leverage x1.5 twice, TRIBFLOOR-capped payments, arrears 0->37,970,
// the polity dissolved on the arrears while the village lived to d146).
// The r6 instrument promotes it to a named mode on the EXISTING
// arrearsSpike detector, restricted to Haven's BELONG links, plus a level
// gate, a grief-leverage trail requirement, and a starve-paying guard.
// ZERO src/js change — the lib is a pure classifier on persisted records.
//
// This proof pins the promotion:
//
//   F1 tribute-collapse: an s44-shaped constructed record (belong arrears
//      0->37,970 in the 7d before the loss, grief-leverage ratchet lines
//      within 14d, TRIBFLOOR floor-caps in the window, no starvation
//      plurality, village alive at the loss) -> 'tribute-collapse' with
//      the spike numbers, the trail, and the floor-caps in the evidence.
//   F2 succession-collapse vs F3 raid-siege: scholar death +/-3d with
//      clean arrears -> 'succession-chain'; a recorded link break within
//      3d -> 'other-named' with the link-break trail (raid-siege stays
//      other-named by the pre-registered taxonomy — the instrument names
//      the mechanism, never invents a mode).
//   F4 arrears spike WITHOUT a grief-leverage trail -> 'other-named'
//      (honest remainder, not tribute-collapse).
//   F5 starvation-plural loss window + spike + trail -> 'other-named'
//      (the starve-paying guard: the village did NOT live to pay).
//   F6 REAL-RED: the r5 B-branch rule (inline: any arrearsSpike ->
//      other-named) on the F1 fixture -> 'other-named' — the old taxonomy
//      demonstrably cannot name it; the extended instrument ->
//      'tribute-collapse'.
//   F7 engine-read equivalence: JSON round-trip of a full record (belong
//      links with arrears) classifies identically to the live object —
//      persisting the rows the detector reads loses nothing.
//   F8 attribution math: the GO denominator is losses only (held-to-end
//      outside); other-named counts against the 90% bar.
//   F9 grief-trail window boundary: a ratchet line 15d before the loss
//      does NOT trail; at 14d it does.
//   F10 the 2,000 bar: 0->2,500 spikes (fires); 0->1,500 does not.
//   F11 non-belong spike fallback: arrears spike on a LEAD-kind link only
//      -> 'other-named' with the non-belong trail (r5 behavior preserved).
'use strict';
const HL = require('./holdloss-lib-20261015');

let pass = 0, fail = 0;
function chk(name, cond, extra) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); }
}

// Daily scale rows: rank from a schedule, one belong link whose arrears
// follow arrearsFn(day). Mirrors scripts/scale-repro-20261013.js scaleRow
// (the fields the detector reads: day, rank, links[].{kind,arrears}).
function scaleRows(schedule, N, arrearsFn, kind) {
  const rows = [];
  for (let d = 1; d <= N; d++) {
    let rank = 'village';
    for (const s of schedule) if (d >= s.from && d <= s.to) rank = s.rank;
    rows.push({
      day: d, rank, exiled: false,
      links: [{ vid: 'Thornfield', kind: kind || 'belong', primary: 'Thornfield',
                trust: 55, age: 60, arrears: arrearsFn ? Math.round(arrearsFn(d)) : 0,
                perWeek: 37970 }],
    });
  }
  return rows;
}
function mkDeath(day, name, cause, kind) { return { day, name, cause, kind: kind || 'villager' }; }
function beat(day, text) { return { day, text }; }
function mkRec(o) {
  o = o || {};
  const N = o.days || 100;
  return {
    seed: o.seed || 1, policy: o.policy || 'belongfeast', days: N,
    endReason: o.endReason || 'village-lost', won: !!o.won,
    scaleRows: o.scaleRows || scaleRows([{ from: 41, to: N, rank: 'national' }], N),
    foodRows: [], standingRows: [],
    deaths: o.deaths || [], beats: o.beats || [],
    waveUnlockDays: o.waveUnlockDays || { 4: null, 5: null },
    breaks: o.breaks || [], exiledEver: !!o.exiledEver, exiledDay: o.exiledDay || null,
  };
}

// Verbatim beat texts from src/js/hierarchy.js successionCrisis (the
// old-link x1.5 ratchet) and the TRIBFLOOR floor-cap line, as captured in
// the s44 belongfeast per-seed record (evidence/2026-10-15/perseed-
// holdloss2/belongfeast-s44-full.json).
const RATCHET_1 = "With Haven grieving, Thornfield installs their own speaker at the table. Tribute rises to 25,313 kcal/week. Grief is leverage, and they know it. The link holds \u2014 it was never with one person.";
const RATCHET_2 = "With Haven grieving, Thornfield installs their own speaker at the table. Tribute rises to 37,970 kcal/week. Grief is leverage, and they know it. The link holds \u2014 it was never with one person.";
const FLOOR_CAP = "\uD83D\uDEE1\uFE0F The pantry holds about 2 days of food at the current burn \u2014 tribute takes 12,645 of 25,313 kcal and no more. What isn't paid rides as arrears; the village eats first.";
const DISSOLVE = "\u25C8 The realm came apart \u2014 no polity answers to Haven now, and Haven is a free fire again. National and global no longer describe this village. The climb starts over.";

// The s44-shaped fixture: national d73-133, loss d134, village dies d146
// (12d after the loss — B-branch: the rank fell while the village lived).
function s44Rec() {
  return mkRec({
    days: 146, endReason: 'village-lost',
    scaleRows: scaleRows(
      [{ from: 73, to: 133, rank: 'national' }, { from: 134, to: 146, rank: 'regional' }],
      146,
      (d) => (d < 131 ? 0 : 37970)),
    deaths: [
      mkDeath(118, 'Devon', 'combat'), mkDeath(121, 'Quinn', 'combat'),
      mkDeath(124, 'Howard', 'monster'), mkDeath(127, 'Minh', 'combat'),
      mkDeath(130, 'Carlos', 'monster'), mkDeath(131, 'Ava', 'combat'),
      mkDeath(132, 'Ben', 'monster'), mkDeath(133, 'Thabo', 'combat'),
    ],
    beats: [
      beat(121, RATCHET_1), beat(127, FLOOR_CAP), beat(133, RATCHET_2),
      beat(133, 'Thornfield notices the missing tribute. Arrears: 37,970 kcal. The air changes.'),
      beat(133, DISSOLVE),
    ],
  });
}

console.log('F1: tribute-collapse names the s44-shaped loss');
const rec1 = s44Rec();
const loss1 = HL.nationalLoss(rec1);
chk('s44 fixture -> tribute-collapse', loss1.lossMode === 'tribute-collapse', 'got ' + loss1.lossMode);
chk('evidence names the belong-arrears spike numbers', /37,970/.test(loss1.lossEvidence.join(' ')), loss1.lossEvidence[0] || '(no evidence)');
chk('evidence names the grief-leverage trail', /grief-leverage trail/.test(loss1.lossEvidence.join(' ')));
chk('evidence names the TRIBFLOOR floor-caps', /TRIBFLOOR held the payments/.test(loss1.lossEvidence.join(' ')));
chk('evidence states the lived-to-pay verdict', /lived to pay/.test(loss1.lossEvidence.join(' ')));

console.log('F2: succession-collapse vs F3: raid-siege classify correctly');
const recSucc = mkRec({
  days: 100, endReason: 'survived',
  scaleRows: scaleRows([{ from: 40, to: 74, rank: 'national' }, { from: 75, to: 100, rank: 'regional' }], 100),
  deaths: [mkDeath(74, 'Konrad Jarosi\u0144ski', 'combat', 'scholar')],
  beats: [beat(74, '\uD83D\uDD6F\uFE0F Konrad Jarosi\u0144ski is dead \u2014 and the dead hold no treaties. Every link Haven has shakes.')],
});
const lossSucc = HL.nationalLoss(recSucc);
chk('scholar death +/-3d, clean arrears -> succession-chain', lossSucc.lossMode === 'succession-chain', 'got ' + lossSucc.lossMode);
const recRaid = mkRec({
  days: 100, endReason: 'survived',
  scaleRows: scaleRows([{ from: 40, to: 74, rank: 'national' }, { from: 75, to: 100, rank: 'regional' }], 100),
  breaks: [{ day: 74, link: 'Thornfield' }],
  beats: [beat(74, 'the neglected link snaps \u2014 no tribute, no deeds, no one left who kept it.')],
});
const lossRaid = HL.nationalLoss(recRaid);
chk('link break within 3d -> other-named (raid-siege stays other-named)', lossRaid.lossMode === 'other-named', 'got ' + lossRaid.lossMode);
chk('raid-siege names the link-break mechanism', /link-break/.test(lossRaid.lossEvidence.join(' ')));

console.log('F4: arrears spike without a grief-leverage trail stays other-named');
const recNoTrail = s44Rec();
recNoTrail.beats = recNoTrail.beats.filter(b => !/tribute rises to/i.test(b.text));
const lossNoTrail = HL.nationalLoss(recNoTrail);
chk('spike, no ratchet lines -> other-named', lossNoTrail.lossMode === 'other-named', 'got ' + lossNoTrail.lossMode);
chk('evidence says why (no grief-leverage trail)', /without a grief-leverage trail/.test(lossNoTrail.lossEvidence.join(' ')));

console.log('F5: the starve-paying guard');
const recStarve = s44Rec();
recStarve.deaths = [
  mkDeath(120, 'Devon', 'starvation'), mkDeath(124, 'Howard', 'starvation'),
  mkDeath(128, 'Minh', 'starvation'), mkDeath(131, 'Carlos', 'combat'),
  mkDeath(132, 'Ava', 'starvation'), mkDeath(133, 'Ben', 'starvation'),
];
const lossStarve = HL.nationalLoss(recStarve);
chk('starvation-plural window -> other-named, not tribute-collapse', lossStarve.lossMode === 'other-named', 'got ' + lossStarve.lossMode);
chk('evidence says starve-paying', /starve-paying/.test(lossStarve.lossEvidence.join(' ')));

console.log('F6: REAL-RED — the r5 taxonomy cannot name it');
// The r5 B-branch rule, inline: any arrearsSpike -> other-named.
function r5branch(rec) {
  const rows = rec.scaleRows || [];
  const ld = 134;
  const win = rows.filter(r => r.day >= ld - 7 && r.day <= ld && r.links);
  const sum = (row) => (row.links || []).reduce((t, l) => t + (Number(l.arrears) || 0), 0);
  if (win.length >= 2 && sum(win[win.length - 1]) - sum(win[0]) > 2000) return 'other-named';
  return 'unfired';
}
chk('r5 rule on the s44 fixture -> other-named (cannot name it)', r5branch(rec1) === 'other-named');
chk('r6 instrument on the same fixture -> tribute-collapse', loss1.lossMode === 'tribute-collapse');

console.log('F7: engine-read equivalence — persisted rows classify identically');
const roundTripped = JSON.parse(JSON.stringify(rec1));
const lossRT = HL.nationalLoss(roundTripped);
chk('JSON round-trip -> same mode', lossRT.lossMode === loss1.lossMode, 'got ' + lossRT.lossMode);
chk('JSON round-trip -> same evidence', JSON.stringify(lossRT.lossEvidence) === JSON.stringify(loss1.lossEvidence));

console.log('F8: attribution math — the GO denominator is losses only');
const suite = [
  { mode: loss1.lossMode },                       // tribute-collapse (named)
  { mode: 'held-to-end' },                        // no loss — outside the denominator
  { mode: 'other-named' },                        // honest remainder — counts against
];
const losses = suite.filter(s => s.mode !== 'held-to-end');
const attributed = losses.filter(s => s.mode !== 'other-named' && s.mode !== 'unattributed').length;
chk('held-to-end sits outside the denominator', losses.length === 2, 'got ' + losses.length);
chk('other-named counts against: 1/2 = 50%', attributed / losses.length === 0.5, 'got ' + (attributed / losses.length));

console.log('F9: grief-trail window boundary (14d in, 15d out)');
function trailRec(ratchetDay) {
  const r = s44Rec();
  r.beats = [beat(ratchetDay, RATCHET_2)];
  return r;
}
chk('ratchet line 15d before the loss -> no trail -> other-named',
  HL.nationalLoss(trailRec(119)).lossMode === 'other-named',
  'got ' + HL.nationalLoss(trailRec(119)).lossMode);
chk('ratchet line 14d before the loss -> trail -> tribute-collapse',
  HL.nationalLoss(trailRec(120)).lossMode === 'tribute-collapse',
  'got ' + HL.nationalLoss(trailRec(120)).lossMode);

console.log('F10: the 2,000 bar');
function spikeRec(afterKcal) {
  return mkRec({
    days: 146, endReason: 'village-lost',
    scaleRows: scaleRows(
      [{ from: 73, to: 133, rank: 'national' }, { from: 134, to: 146, rank: 'regional' }],
      146, (d) => (d < 131 ? 0 : afterKcal)),
    deaths: [mkDeath(130, 'Carlos', 'monster')],
    beats: [beat(133, RATCHET_2), beat(133, DISSOLVE)],
  });
}
chk('0->2,500 spikes (fires, grief trail present)', HL.nationalLoss(spikeRec(2500)).lossMode === 'tribute-collapse',
  'got ' + HL.nationalLoss(spikeRec(2500)).lossMode);
chk('0->1,500 does not spike (below the bar)', HL.nationalLoss(spikeRec(1500)).lossMode !== 'tribute-collapse',
  'got ' + HL.nationalLoss(spikeRec(1500)).lossMode);

console.log('F11: non-belong spike fallback (r5 behavior preserved)');
const recLead = s44Rec();
recLead.scaleRows = scaleRows(
  [{ from: 73, to: 133, rank: 'national' }, { from: 134, to: 146, rank: 'regional' }],
  146, (d) => (d < 131 ? 0 : 37970), 'lead');
const lossLead = HL.nationalLoss(recLead);
chk('lead-kind arrears spike -> other-named, not tribute-collapse', lossLead.lossMode === 'other-named', 'got ' + lossLead.lossMode);
chk('evidence names the non-belong spike trail', /non-belong/.test(lossLead.lossEvidence.join(' ')));

console.log(`\n${pass}/${pass + fail} checks green`);
if (fail) { console.error('TRIBCOLLAPSE PROOF FAILED'); process.exit(1); }
console.log('TRIBCOLLAPSE PROOF GREEN');
