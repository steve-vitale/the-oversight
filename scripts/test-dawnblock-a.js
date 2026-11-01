#!/usr/bin/env node
// scripts/test-dawnblock-a.js — proof test for sim-dawnblock-a.
//
// TWO LEGS, both independent of the sweep's printed verdict:
//   (1) UNIT: synthetic decision series exercise classifyHeldDawn,
//       identityKey / encounterKind / firingSignal, and
//       buildEpisodes (multi-dawn linger, intermittent recurrence,
//       and all five clearance outcomes).
//   (2) CORPUS: re-derive every headline number from the JUDGED
//       corpora (evidence/2026-11-01/dawnblock-a-perseed, EVID
//       override) + the seathes corpus: held totals, coverage,
//       encounter-blocked days per seed, traced counts, episode
//       spans, sole-blocker counts, neutrality diffs (must be
//       empty on all 8 seeds), and the 78201/78208 block-shape
//       reproduction. No sims run here.
//
// Exit 0 + "DAWNBLOCK-A PROOF GREEN" iff every check passes;
// exit 1 + the failing check otherwise. Never run concurrent
// jest; this is a plain node script.
'use strict';
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const REPO = path.join(__dirname, '..');
const {
  classifyHeldDawn, isHeldDawn, isEncounterBlockedHeldDawn,
  buildEpisodes, identityKey, encounterKind, firingSignal,
} = require('./policies/dawnblock-diag');
const { summarizeSeed, compareToSeathes } = require('./dawnblock-a-sweep');

let checks = 0, passed = 0;
function check(name, cond, extra) {
  checks += 1;
  if (cond) { passed += 1; }
  else { console.error(`FAIL: ${name}${extra != null ? ' :: ' + JSON.stringify(extra) : ''}`); }
}
function eq(name, a, b) { check(name, JSON.stringify(a) === JSON.stringify(b), { got: a, want: b }); }

// --- synthetic row builder ---
function row(day, opts) {
  const o = opts || {};
  const enc = {
    inCombat: !!o.inCombat,
    fight: o.fight || null,
    tileMonster: o.tileMonster || null,
    pending: !!o.pending, pendingMonsterId: o.pendingMonsterId || null,
    pendingInTent: !!o.pendingInTent, raidPendingMonsterId: o.raidPendingMonsterId || null,
    contest: o.contest || null,
    px: o.px == null ? 4 : o.px, py: o.py == null ? 4 : o.py, tile: o.tile || 'haven',
    world: o.world || [], kills: o.kills || [],
  };
  return {
    pre: {
      d: day, seat: o.seat || 'lesser', done: !!o.done,
      rank: o.rank || 'regional', rankOrd: o.rankOrd == null ? 1 : o.rankOrd,
      waiting: o.waiting == null ? true : o.waiting,
      pv: o.pv === undefined ? { seat: 'lesser', ready: true, why: '', ot: 0 } : o.pv,
      block: o.block || '', access: o.access || 'remote', enc,
    },
    post: o.post === undefined ? null : o.post,
  };
}
function tileMon(id, tx, ty, name) {
  return { id, name: name || id, wave: 4, hp: 100, tx, ty, mx: 1, my: 1, inWorld: true };
}
function encPost(mon) {
  // post snapshot shape = snapEncounter shape (flat encounter fields)
  return {
    inCombat: false, fight: null, tileMonster: mon || null,
    pending: false, pendingMonsterId: null, pendingInTent: false,
    raidPendingMonsterId: null, contest: null, px: 4, py: 4, tile: 'haven',
    world: [], kills: [],
  };
}

// --- UNIT: classification ---
(function unitClassify() {
  const blocked = row(173, {
    pv: { seat: 'lesser', ready: false, why: 'Finish the current encounter before taking your seat.', ot: 1 },
    block: 'Finish the current encounter before taking your seat.',
    tileMonster: tileMon('herald', 4, 4, 'The Herald'),
    world: ['herald@4,4:700'],
  });
  const c = classifyHeldDawn(blocked);
  eq('unit: encounter-blocked class', c.class, 'ENTRY-BLOCKED');
  eq('unit: encounter-blocked subclass', c.subclass, 'ENCOUNTER');
  eq('unit: firing signal is tile-monster', c.firingSignal, 'tile-monster');
  eq('unit: kind is tile-monster', c.encounterKind, 'tile-monster');
  eq('unit: rank gate also binding (regional)', c.rankGateAlsoBinding, true);
  eq('unit: not sole blocker (regional)', c.soleBlocker, false);
  check('unit: isEncounterBlockedHeldDawn true', isEncounterBlockedHeldDawn(c));

  const sole = row(90, {
    rank: 'national', rankOrd: 2,
    pv: { seat: 'lesser', ready: false, why: 'Finish the current encounter before taking your seat.', ot: 0 },
    block: 'Finish the current encounter before taking your seat.',
    tileMonster: tileMon('herald', 4, 4, 'The Herald'), access: 'inside',
  });
  const cs = classifyHeldDawn(sole);
  check('unit: sole blocker at national+inside', cs.soleBlocker === true && cs.rankGateAlsoBinding === false);

  const fightRow = row(50, {
    inCombat: true,
    fight: { id: 'f1', over: false, round: 2, fighters: [{ key: 'p', kind: 'player', alive: true, fled: false, hp: 50, maxHp: 80, monsterId: null, name: null }, { key: 'm_0', kind: 'monster', alive: true, fled: false, hp: 300, maxHp: 700, monsterId: 'herald', name: 'The Herald' }] },
    pv: { seat: 'lesser', ready: false, why: 'Finish the current encounter before taking your seat.', ot: 0 },
    block: 'Finish the current encounter before taking your seat.',
  });
  const cf = classifyHeldDawn(fightRow);
  eq('unit: fight kind', cf.encounterKind, 'tbfight');
  eq('unit: fight firing signal', cf.firingSignal, 'tbfight');
  eq('unit: fight identity key', cf.identityKey, 'fight:herald');

  const pendingOnly = row(60, {
    pending: true, pendingMonsterId: 'herald',
    pv: { seat: 'lesser', ready: false, why: 'Finish the current encounter before taking your seat.', ot: 0 },
    block: 'Finish the current encounter before taking your seat.',
  });
  const cp = classifyHeldDawn(pendingOnly);
  eq('unit: pending-only kind', cp.encounterKind, 'pending');
  eq('unit: pending-only firing signal null (code surprise)', cp.firingSignal, null);
  eq('unit: pending-only subclass is SURPRISE', cp.subclass, 'ENCOUNTER-SURPRISE');

  const contestRow = row(61, {
    contest: { id: 'c1', kind: 'show' },
    pv: { seat: 'lesser', ready: false, why: 'Finish the current contest before taking your seat.', ot: 0 },
    block: 'Finish the current contest before taking your seat.',
  });
  const cc = classifyHeldDawn(contestRow);
  eq('unit: contest subclass', cc.subclass, 'CONTEST');
  check('unit: contest row is not encounter-blocked', !isEncounterBlockedHeldDawn(cc));

  const nullPv = row(165, { waiting: false, pv: null });
  const cn = classifyHeldDawn(nullPv);
  eq('unit: preview-null subclass', cn.subclass, 'TABLEWAITING-FALSE');

  const rankGate = row(166, { pv: { seat: 'lesser', ready: true, why: '', ot: 0 } });
  const cg = classifyHeldDawn(rankGate);
  eq('unit: ready+regional is RANK-GATE', cg.class, 'RANK-GATE');

  const notHeld = row(10, { seat: 'none' });
  check('unit: seat none is not held', !isHeldDawn(notHeld));
  check('unit: seat lesser is held', isHeldDawn(row(11, {})));
})();

// --- UNIT: episodes ---
(function unitEpisodes() {
  const mon = tileMon('herald', 4, 4, 'The Herald');
  // Multi-dawn linger, 3 dawns, then gone at run end -> STILL-PENDING
  // (no next row).
  const s1 = [173, 174, 175].map(d => row(d, {
    pv: { seat: 'lesser', ready: false, why: 'Finish the current encounter before taking your seat.', ot: 1 },
    block: 'Finish the current encounter before taking your seat.',
    tileMonster: mon, world: ['herald@4,4:700'], kills: [],
    post: encPost(mon),
  }));
  const e1 = buildEpisodes(s1);
  eq('unit: linger is one episode', e1.length, 1);
  eq('unit: linger dawns', e1[0].dawns, 3);
  eq('unit: linger clearance STILL-PENDING', e1[0].clearance, 'STILL-PENDING');
  eq('unit: linger blocked held dawns', e1[0].blockedHeldDawns, 3);

  // Intermittent: blocked day, clear day, blocked day (same monster,
  // new episode) -> first episode GONE-UNATTRIBUTED (post shows it
  // gone during the day? here post keeps it, so expect
  // GONE-UNATTRIBUTED via neither-kill-nor-move-nor-post-absent).
  const s2 = [
    row(140, { pv: { seat: 'lesser', ready: false, why: 'Finish the current encounter before taking your seat.', ot: 1 }, block: 'Finish the current encounter before taking your seat.', tileMonster: mon, world: ['herald@4,4:700'], kills: [], post: encPost(mon) }),
    row(141, { pv: { seat: 'lesser', ready: true, why: '', ot: 1 }, tileMonster: null, world: [], kills: [], post: encPost(null) }),
    row(142, { pv: { seat: 'lesser', ready: false, why: 'Finish the current encounter before taking your seat.', ot: 1 }, block: 'Finish the current encounter before taking your seat.', tileMonster: mon, world: ['herald@4,4:700'], kills: [], post: encPost(mon) }),
  ];
  const e2 = buildEpisodes(s2);
  eq('unit: intermittent is two episodes', e2.length, 2);
  eq('unit: first intermittent episode clearance', e2[0].clearance, 'CLEARED-GONE-UNATTRIBUTED');
  eq('unit: second intermittent episode STILL-PENDING', e2[1].clearance, 'STILL-PENDING');

  // Kill-logged clearance: kill entry appears across the gap.
  const s3 = [
    row(140, { pv: { seat: 'lesser', ready: false, why: 'Finish the current encounter before taking your seat.', ot: 1 }, block: 'Finish the current encounter before taking your seat.', tileMonster: mon, world: ['herald@4,4:700'], kills: [], post: encPost(mon) }),
    row(141, { pv: { seat: 'lesser', ready: true, why: '', ot: 1 }, tileMonster: null, world: [], kills: ['141:4:herald:p'], post: encPost(null) }),
  ];
  const e3 = buildEpisodes(s3);
  eq('unit: kill-logged clearance', e3[0].clearance, 'CLEARED-KILL-LOGGED');

  // Moved-away clearance: same id on another tile next dawn.
  const s4 = [
    row(140, { pv: { seat: 'lesser', ready: false, why: 'Finish the current encounter before taking your seat.', ot: 1 }, block: 'Finish the current encounter before taking your seat.', tileMonster: mon, world: ['herald@4,4:700'], kills: [], post: encPost(mon) }),
    row(141, { pv: { seat: 'lesser', ready: true, why: '', ot: 1 }, tileMonster: null, world: ['herald@5,4:700'], kills: [], post: encPost(null) }),
  ];
  const e4 = buildEpisodes(s4);
  eq('unit: moved-away clearance', e4[0].clearance, 'CLEARED-MOVED-AWAY');

  // During-day clearance: present pre, absent post, gone next dawn.
  const s5 = [
    row(140, { pv: { seat: 'lesser', ready: false, why: 'Finish the current encounter before taking your seat.', ot: 1 }, block: 'Finish the current encounter before taking your seat.', tileMonster: mon, world: ['herald@4,4:700'], kills: [], post: encPost(null) }),
    row(141, { pv: { seat: 'lesser', ready: true, why: '', ot: 1 }, tileMonster: null, world: [], kills: [], post: encPost(null) }),
  ];
  const e5 = buildEpisodes(s5);
  eq('unit: during-day clearance', e5[0].clearance, 'CLEARED-DURING-DAY');
})();

// --- CORPUS legs ---
(function corpus() {
  const evidDir = process.env.EVID || path.join(REPO, 'evidence', '2026-11-01', 'dawnblock-a-perseed');
  const seathesDir = path.join(REPO, 'evidence', '2026-11-01', 'seathes-a-perseed');
  if (!fs.existsSync(evidDir)) {
    console.error('CORPUS LEG SKIPPED: no judged corpus at ' + evidDir);
    process.exit(1);
  }
  const rows = [], series = {}, seatHes = {};
  for (const fn of fs.readdirSync(evidDir).sort()) {
    if (/^s[0-9]+\.json$/.test(fn)) rows.push(JSON.parse(fs.readFileSync(path.join(evidDir, fn), 'utf8')));
    else if (/^s[0-9]+-daily\.json$/.test(fn)) {
      const d = JSON.parse(fs.readFileSync(path.join(evidDir, fn), 'utf8'));
      series[d.seed] = d.series; seatHes[d.seed] = d.seatHesSeries || [];
    }
  }
  rows.sort((a, b) => a.seed - b.seed);
  check('corpus: 8 seeds', rows.length === 8, rows.map(r => r.seed));
  const perSeed = rows.map(r => summarizeSeed(r, series[r.seed] || [], seatHes[r.seed] || []));
  const totalHeld = perSeed.reduce((a, s) => a + s.heldN, 0);
  const totalClassified = perSeed.reduce((a, s) => a + s.classifiedN, 0);
  const totalEnc = perSeed.reduce((a, s) => a + s.encBlockedN, 0);
  const totalTraced = perSeed.reduce((a, s) => a + s.tracedN, 0);
  const totalUntraced = perSeed.reduce((a, s) => a + s.untracedN, 0);
  eq('corpus: band held dawns (seathes 65)', totalHeld, 65);
  check('corpus: coverage >= 0.90', totalHeld ? totalClassified / totalHeld >= 0.90 : false, { totalClassified, totalHeld });
  eq('corpus: encounter-blocked held dawns total', totalEnc, 12);
  eq('corpus: traced == blocked', totalTraced, totalEnc);
  eq('corpus: untraced == 0', totalUntraced, 0);
  const s78201 = perSeed.find(s => s.seed === 78201);
  const s78208 = perSeed.find(s => s.seed === 78208);
  eq('corpus: 78201 blocked days', s78201.encBlockedDays, [173, 174, 175, 176, 177, 178, 179, 180]);
  eq('corpus: 78208 blocked days', s78208.encBlockedDays, [140, 147, 148, 163]);
  eq('corpus: 78201 tile-block runs (identity changes day 180, block continuous)',
    s78201.blockedRuns, [{ firstDay: 173, lastDay: 180, dawns: 8 }]);
  eq('corpus: 78201 longest tile-block run', s78201.longestBlockedRun, 8);
  eq('corpus: 78208 tile-block runs',
    s78208.blockedRuns, [{ firstDay: 140, lastDay: 140, dawns: 1 }, { firstDay: 147, lastDay: 148, dawns: 2 }, { firstDay: 163, lastDay: 163, dawns: 1 }]);
  eq('corpus: 78208 longest tile-block run', s78208.longestBlockedRun, 2);
  eq('corpus: 78201 sole blockers', s78201.soleBlockerN, 0);
  eq('corpus: 78208 sole blockers', s78208.soleBlockerN, 0);
  eq('corpus: 78201 rank-also count', s78201.rankAlsoN, 8);
  eq('corpus: 78208 rank-also count', s78208.rankAlsoN, 4);
  check('corpus: every 78201 traced dawn has kind+signal+age+clearance',
    s78201.traced.length === 8 && s78201.traced.every(t => t.kind && t.signal && t.ageDawns >= 1 && t.clearance));
  check('corpus: every 78208 traced dawn has kind+signal+age+clearance',
    s78208.traced.length === 4 && s78208.traced.every(t => t.kind && t.signal && t.ageDawns >= 1 && t.clearance));
  check('corpus: seriesOk on all seeds', perSeed.every(s => s.seriesOk), perSeed.filter(s => !s.seriesOk).map(s => s.seed));
  // Neutrality vs seathes, re-derived here (not the sweep's print).
  let neutBad = [];
  for (const r of rows) {
    try {
      const stRow = JSON.parse(fs.readFileSync(path.join(seathesDir, `s${r.seed}.json`), 'utf8'));
      const diffs = compareToSeathes(r, stRow);
      if (diffs.length) neutBad.push({ seed: r.seed, diffs });
    } catch (e) { neutBad.push({ seed: r.seed, diffs: ['seathes row unreadable: ' + String(e.message).slice(0, 80)] }); }
  }
  check('corpus: neutrality vs seathes empty on 8/8 seeds', neutBad.length === 0, neutBad);
  // Sat control: 78206 sat day 90 (from seathes ts diffs, re-derived).
  const s78206 = perSeed.find(s => s.seed === 78206);
  check('corpus: 78206 held dawns include a SAT day',
    s78206 && (function () {
      // SAT appears in classCounts as 'SAT'
      return (s78206.classCounts['SAT'] | 0) === 1;
    })(), s78206 ? s78206.classCounts : null);
})();

console.log(`\nDAWNBLOCK-A PROOF: ${passed}/${checks} checks passed`);
if (passed !== checks) { console.error('DAWNBLOCK-A PROOF FAILED'); process.exit(1); }
console.log('DAWNBLOCK-A PROOF GREEN');
