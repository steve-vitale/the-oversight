#!/usr/bin/env node
// scripts/test-d94-a.js — proof for sim-d94-a (scale-onramp axis,
// 2026-10-27, MEASUREMENT/ARCHAEOLOGY ONLY).
//
// Question: the 1121Z tbstarts arm's band-wide table shows 188 starts /
// 156 ends with ONE unmatched END — seed 73671, day 94 — described as
// an alien direct-build fight, not a start gap. This script re-derives
// that claim from the committed tbstarts corpus on disk and NOTHING
// else: no harness, no RNG, no game state, no replay. It FAILS (exit 1)
// if the d94 end is counted differently — a different unmatched-end
// count, a different row identity, a token/id join to any start row,
// or a different band total.
//
// Classification asserted here (see evidence/2026-10-27/sim-d94-a.md
// for the full row anatomy and the ruled-out alternatives):
//   DIRECT-BUILD ALIEN DUEL — a genuine fight outcome with no
//   startCombat start row, because encounters.js startAlienCombat
//   builds the tbfight directly instead of via Game.startCombat
//   (code comment verbatim in encounters.js). The tbEnd recorder
//   still fires, so the corpus has the end without a start.
//   It is NOT a duplicate end, NOT a day/seed key shift, NOT a
//   wrapper snap-timing artifact, and NOT a recorder gap.
//
// Usage: node scripts/test-d94-a.js [corpus-dir]
// Default corpus: evidence/2026-10-27/perseed-tbstarts-a
'use strict';
const fs = require('fs');
const path = require('path');
let pass = 0, fail = 0;
function check(name, ok, detail) {
  if (ok) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (detail ? ' ' + detail : '')); }
}
function pairStarts(tb) {
  const endsById = new Map(), endsByToken = new Map(), endsByActive = new Map();
  for (const e of (tb.ends || [])) {
    if (e.id) endsById.set(e.id, e);
    if (e.token != null) endsByToken.set(e.token, e);
    if (e.activeStart != null) endsByActive.set(e.activeStart, e);
  }
  const out = { starts: 0, ends: (tb.ends || []).length, settled: 0, instantSettled: 0,
    refused: 0, titanRefused: 0, unsettled: 0, unsettledNull: 0, unmatchedEnds: 0, unmatched: [] };
  const matched = new Set();
  for (const s of (tb.starts || [])) {
    out.starts++;
    if (s.refused) { out.refused++; continue; }
    if ((s.newOutcomes || []).some(o => o && o.titan === s.arg && o.outcome === 'refused')) { out.titanRefused++; continue; }
    if (s.postId && endsById.has(s.postId)) { out.settled++; matched.add(endsById.get(s.postId)); continue; }
    if (s.postToken != null && endsByToken.has(s.postToken)) { out.settled++; matched.add(endsByToken.get(s.postToken)); continue; }
    if (s.postId == null && s.postToken == null && endsByActive.has(s.callIdx)) { out.instantSettled++; matched.add(endsByActive.get(s.callIdx)); continue; }
    if (s.postId == null && s.postToken == null) { out.unsettledNull++; continue; }
    out.unsettled++;
  }
  out.unmatched = (tb.ends || []).filter(e => !matched.has(e));
  out.unmatchedEnds = out.unmatched.length;
  return out;
}
function main() {
  const dir = process.argv[2] || path.join(__dirname, '..', 'evidence', '2026-10-27', 'perseed-tbstarts-a');
  const seeds = [73671, 73672, 73673, 73674, 73675, 73676, 73677, 73678];
  const rows = {};
  for (const seed of seeds) rows[seed] = JSON.parse(fs.readFileSync(path.join(dir, 's' + seed + '-armed.json'), 'utf8'));
  const r71 = rows[73671];
  const tb = r71.tbstarts;

  // Corpus health on 73671 (recorder errors would void the join).
  check('73671 corpus present, tbstarts diag clean', tb && tb.diag && tb.diag.errs === 0 && JSON.stringify(tb.diag.overflow || {}) === '{}',
    'diag=' + JSON.stringify(tb && tb.diag));
  check('73671 throws empty (no thrown startCombat call hiding as a gap)', (tb.throws || []).length === 0);
  check('73671 dissolves empty', (tb.dissolves || []).length === 0);

  // Pairing re-derivation on 73671.
  const p = pairStarts(tb);
  check('73671 starts == 33', p.starts === 33, 'starts=' + p.starts);
  check('73671 ends == 34', p.ends === 34, 'ends=' + p.ends);
  check('73671 settled == 29', p.settled === 29, 'settled=' + p.settled);
  check('73671 instant-settled == 4 (d10, d18, d74, d160)', p.instantSettled === 4, 'instant=' + p.instantSettled);
  check('73671 titan-refused == 0, core-refused == 0', p.titanRefused === 0 && p.refused === 0,
    'titan=' + p.titanRefused + ' refused=' + p.refused);
  check('73671 unsettled == 0 and unsettled-null == 0', p.unsettled === 0 && p.unsettledNull === 0,
    'unsettled=' + p.unsettled + ' unsettledNull=' + p.unsettledNull);
  check('73671 starts partition (settled + instant == starts)', p.settled + p.instantSettled === p.starts,
    p.settled + '+' + p.instantSettled + ' vs ' + p.starts);

  // THE claim: exactly one unmatched end, with this exact identity.
  check('73671 unmatched ends == 1 (fails if counted differently)', p.unmatchedEnds === 1, 'unmatchedEnds=' + p.unmatchedEnds);
  const u = p.unmatched[0] || {};
  check('unmatched end is day 94', u.day === 94, 'day=' + u.day);
  check('unmatched end id is fmgpspijo_f53f9n', u.id === 'fmgpspijo_f53f9n', 'id=' + u.id);
  check('unmatched end token is 15', u.token === 15, 'token=' + u.token);
  check('unmatched end result is lost', u.result === 'lost', 'result=' + u.result);
  check('unmatched end has no inside-call join (activeStart null, not an instant settlement)',
    u.activeStart === null || u.activeStart === undefined, 'activeStart=' + u.activeStart);
  check('unmatched end postId null (fight cleared by tbEnd)', u.postId === null || u.postId === undefined, 'postId=' + u.postId);
  const fighters = u.fighters || [];
  check('unmatched end fighters are exactly player-dead + sarge-alive',
    fighters.length === 2
    && fighters[0].kind === 'player' && fighters[0].id === 'p' && fighters[0].alive === false && fighters[0].hp === 0
    && fighters[1].kind === 'hostile' && fighters[1].id === 'sarge' && fighters[1].key === 'ap_sarge'
    && fighters[1].alive === true && fighters[1].hp === 80,
    'fighters=' + JSON.stringify(fighters));
  check('unmatched end has no monster-kind fighter (not a wave/monster fight)',
    !fighters.some(f => f.kind === 'monster'), 'kinds=' + fighters.map(f => f.kind).join(','));

  // No-join proof: token 15 and the fight id appear in NO start row on 73671.
  const startTokens = new Set();
  for (const s of (tb.starts || [])) {
    if (s.preToken != null) startTokens.add(s.preToken);
    if (s.postToken != null) startTokens.add(s.postToken);
  }
  check('token 15 appears in no 73671 start row (preToken/postToken)', !startTokens.has(15),
    'startTokens=' + [...startTokens].sort((a, b) => a - b).join(','));
  check('fight id appears in no 73671 start row (preId/postId)',
    !(tb.starts || []).some(s => s.preId === u.id || s.postId === u.id));
  check('no 73671 start has arg sarge',
    !(tb.starts || []).some(s => s.arg === 'sarge'), 'args=' + (tb.starts || []).map(s => s.arg).join(','));
  check('no 73671 start touches sarge as a post-call fighter',
    !(tb.starts || []).some(s => (s.postFighters || []).some(f => f.id === 'sarge')));
  check('no other 73671 end carries token 15 or this id',
    (tb.ends || []).filter(e => e !== u && (e.token === 15 || e.id === u.id)).length === 0);
  check('73671 end ids and tokens are unique (not a duplicate end)',
    new Set((tb.ends || []).map(e => e.id)).size === (tb.ends || []).length
    && new Set((tb.ends || []).map(e => e.token)).size === (tb.ends || []).length);
  check('73671 end tokens are contiguous 1..34 (token 15 sits between d93 token 14 and d102 token 16)',
    JSON.stringify((tb.ends || []).map(e => e.token).sort((a, b) => a - b)) === JSON.stringify(Array.from({ length: 34 }, (_, i) => i + 1)));
  check('no 73671 start on day 94 at all (no start-day key to shift from)',
    !(tb.starts || []).some(s => s.day === 94), 'startDaysAround=' + (tb.starts || []).filter(s => s.day >= 90 && s.day <= 102).map(s => s.day).join(','));
  check('d94 end id appears nowhere else in the band corpus (no cross-seed key)',
    seeds.every(seed => {
      const t = rows[seed].tbstarts;
      const inStarts = (t.starts || []).some(s => s.preId === u.id || s.postId === u.id);
      const inEnds = (t.ends || []).filter(e => e.id === u.id).length;
      return seed === 73671 ? (!inStarts && inEnds === 1) : (!inStarts && inEnds === 0);
    }));

  // Band-wide: the d94 end is the ONLY unmatched end anywhere.
  let bandStarts = 0, bandEnds = 0, bandUnmatched = 0, bandBegun = 0;
  for (const seed of seeds) {
    const pp = pairStarts(rows[seed].tbstarts);
    bandStarts += pp.starts; bandEnds += pp.ends; bandUnmatched += pp.unmatchedEnds;
    bandBegun += pp.settled + pp.instantSettled;
    check('seed ' + seed + ' unmatched ends == ' + (seed === 73671 ? 1 : 0),
      pp.unmatchedEnds === (seed === 73671 ? 1 : 0), 'unmatchedEnds=' + pp.unmatchedEnds);
  }
  check('band starts == 188', bandStarts === 188, 'bandStarts=' + bandStarts);
  check('band ends == 156', bandEnds === 156, 'bandEnds=' + bandEnds);
  check('band unmatched ends == 1', bandUnmatched === 1, 'bandUnmatched=' + bandUnmatched);
  check('fight-begun closure: startCombat-begun (155) + 1 alien direct-build == ends (156)',
    bandBegun === 155 && bandBegun + 1 === bandEnds, 'begun=' + bandBegun + ' ends=' + bandEnds);
  check('73671 fight-begun closure: 33 startCombat-begun + 1 alien == 34 ends',
    p.settled + p.instantSettled + 1 === p.ends);

  // Headline-touch negatives on 73671: the melt and the wave-4 kill are
  // settled starts, and the d94 end is neither.
  const meltStart = (tb.starts || []).find(s => s.callIdx === 28 && s.day === 167 && s.arg === 'reunion');
  const meltEnd = (tb.ends || []).find(e => e.token === 30);
  check('73671 w4melt fight (reunion d167) is a SETTLED start, untouched by d94',
    !!meltStart && meltStart.postToken === 30 && !!meltEnd && meltEnd.result === 'lost' && meltEnd.id === meltStart.postId,
    'meltStart=' + JSON.stringify(meltStart && { callIdx: meltStart.callIdx, postId: meltStart.postId, postToken: meltStart.postToken })
    + ' meltEnd=' + JSON.stringify(meltEnd && { result: meltEnd.result, token: meltEnd.token }));
  const killStart = (tb.starts || []).find(s => s.callIdx === 20 && s.day === 121 && s.arg === 'congregation');
  const killEnd = (tb.ends || []).find(e => e.token === 22);
  check('73671 wave-4 kill (congregation d121) is a SETTLED start, untouched by d94',
    !!killStart && killStart.postToken === 22 && !!killEnd && killEnd.result === 'won',
    'killEnd=' + JSON.stringify(killEnd && { result: killEnd.result, token: killEnd.token }));
  check('d94 end is not a kill (sarge alive) and not a melt (no monster, no linger)',
    fighters.every(f => f.alive || f.kind === 'player'));

  console.log('\nCLASSIFICATION: DIRECT-BUILD ALIEN DUEL — genuine tbEnd outcome, no startCombat start row');
  console.log('  (encounters.js startAlienCombat builds tbfight directly; tbEnd still fires.)');
  console.log('d94 proof: ' + pass + ' PASS, ' + fail + ' FAIL');
  if (fail) process.exit(1);
}
main();
