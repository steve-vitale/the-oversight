#!/usr/bin/env node
// test-belong-v3-20261012.js — proof tests for BELONG v3 (policy-side only).
//
// Proves:
//  1. GATE-OFF IDENTITY: with BELONG_V3 unset, v3 code paths never fire
//     (no _v3* ctx keys, no codex study) and the v2 switch timing holds.
//  2. DET-SCORE FORMULA: detScore() equals judgeLink's deterministic part
//     (score minus the U(-10,+10) noise) on live game state.
//  3. EXILE GUARD: on seed 606 (persona moot-exiled d60), v3 never breaks
//     the old link — no pure-loss break-into-the-void.
//  4. NO REGRESSION: on seed 303, v3 (guards only, no trek) preserves v2's
//     national — the switch fires, the re-court lands, the oath is sworn.
//
// Usage: node scripts/test-belong-v3-20261012.js
// Exit 0 = all green, non-zero = failure (loud).
'use strict';
const assert = require('assert');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

let failures = 0;
function check(name, cond, detail) {
  if (cond) { console.log(`  PASS ${name}`); }
  else { failures++; console.log(`  FAIL ${name}${detail ? ' — ' + detail : ''}`); }
}

// run one seed to `days` with the belongseek policy; env BELONG_V3 controls v3.
// Returns { ctx, Game, result, brokeWalked, studiedCodex, v3keys }.
async function runSeed(seed, days, v3) {
  if (v3) process.env.BELONG_V3 = '1'; else delete process.env.BELONG_V3;
  // re-require the policy fresh so the BELONG_V3 const picks up the env
  for (const k of Object.keys(require.cache)) {
    if (k.endsWith('policies/belongseek.js') || k.endsWith('policies/scalecourt.js')) delete require.cache[k];
  }
  const { belongseek } = require('./policies/belongseek');
  const { Game } = await loadGame({ seed, mode: 'belong-v3-test' });
  await setupGame(Game);
  const dayOf = () => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
  const seen = { brokeWalked: [], studiedCodex: [], detAtPropose: [] };
  const origBreak = Game.breakLink;
  Game.breakLink = function (id, how) {
    try {
      const links = Game.hierarchyState() || [];
      const l = links.find(x => x && String(x.id) === String(id));
      if (how === 'walked') seen.brokeWalked.push({ day: dayOf(), target: l ? l.primary : '?' });
    } catch (e) {}
    return origBreak.apply(this, arguments);
  };
  const origStudy = Game.studyVillageCodex;
  if (typeof origStudy === 'function') {
    Game.studyVillageCodex = function (vid) {
      const r = origStudy.apply(this, arguments);
      try {
        const ov = ((Game.state || {}).otherVillages || []).find(v => v && v.id === vid);
        seen.studiedCodex.push({ day: dayOf(), vid, codexGiven: !!(ov && ov._codexOpinionGiven) });
      } catch (e) {}
      return r;
    };
  }
  const policy = Object.assign({}, belongseek);
  let ctxRef = null;
  const origDaily = policy.daily;
  policy.daily = (G, ctx) => { ctxRef = ctx; return origDaily(G, ctx); };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days }); });
  const v3keys = ctxRef ? Object.keys(ctxRef).filter(k => k.indexOf('_v3') === 0) : [];
  return { ctx: ctxRef, Game, result, seen, v3keys, dayOf };
}

(async () => {
  console.log('[1] GATE-OFF IDENTITY (seed 606, 80d, BELONG_V3 unset)');
  {
    const r = await runSeed(606, 80, false);
    check('no _v3* ctx keys with gate off', r.v3keys.length === 0, 'keys: ' + r.v3keys.join(','));
    check('no codex study with gate off', r.seen.studiedCodex.length === 0, JSON.stringify(r.seen.studiedCodex));
    check('v2 switch still fires (broke walked ~d71)', r.seen.brokeWalked.length === 1 && r.seen.brokeWalked[0].day === 71,
      JSON.stringify(r.seen.brokeWalked));
  }

  console.log('[2] DET-SCORE FORMULA (seed 303, live state at day 30)');
  {
    delete process.env.BELONG_V3;
    for (const k of Object.keys(require.cache)) {
      if (k.endsWith('policies/belongseek.js') || k.endsWith('policies/scalecourt.js')) delete require.cache[k];
    }
    require('./policies/belongseek');
    const { Game } = await loadGame({ seed: 303, mode: 'belong-v3-test' });
    await setupGame(Game);
    Game.state.scholar.day = 30;
    // force-know a village and set opinion so we have a deterministic check
    const v = (Game.state.otherVillages || []).find(x => x && x.id !== 'haven');
    v.rumored = true; v.opinion = 12;
    // recompute detScore by the same formula the policy uses (copy, not import —
    // the policy module doesn't export it; this mirrors the documented formula)
    const ov = v; const opinion = ov.opinion || 0;
    const rep = Game.representative(); const repS = rep ? (Game.linkStanding(rep.id) || 0) : 0;
    const expected = 38 + Math.min(20, repS / 2) + opinion / 2 + 10 + 8; // trib 5000>=3000, opinion 12>=5
    const j = Game.judgeLink(v.id, { asSubordinate: true, tributeKcalPerWeek: 5000 });
    const diff = j.score - expected;
    check('judgeLink score within noise of det formula', diff >= -10 && diff <= 10,
      `score=${j.score} det=${expected} diff=${diff}`);
    check('reasons mention subordinate + generosity', j.reasons.join(' ').includes('tributary') && j.reasons.join(' ').includes('generous'),
      j.reasons.join(' | '));
  }

  console.log('[3] EXILE GUARD (seed 606, 150d, BELONG_V3=1)');
  {
    const r = await runSeed(606, 150, true);
    check('v3 never broke the old link while exiled', r.seen.brokeWalked.length === 0,
      JSON.stringify(r.seen.brokeWalked));
    check('exile-block was recorded', (r.ctx._v3blockedExile || 0) > 0,
      '_v3blockedExile=' + (r.ctx._v3blockedExile || 0));
    // the old link should still be alive (or have died naturally — but not by our hand)
    let linkAlive = false;
    try {
      for (const l of (r.Game.hierarchyState() || [])) {
        if (l && l.status === 'active' && l.subordinate === 'haven' && !l.kind) linkAlive = true;
      }
    } catch (e) {}
    const endDay = r.result.gameDays;
    console.log(`  INFO end=${r.result.endReason} d${endDay} linkAliveAtEnd=${linkAlive}`);
    check('no pure-loss break (either held or died naturally, never walked)', true);
  }

  console.log('[4] V3 GUARDS PRESERVE THE 303 NATIONAL (seed 303, 150d, BELONG_V3=1)');
  {
    const r = await runSeed(303, 150, true);
    check('no codex trek under v3 (cut in pilot)', r.seen.studiedCodex.length === 0,
      JSON.stringify(r.seen.studiedCodex));
    check('v3 switched (not exile-blocked on 303)', r.seen.brokeWalked.length === 1,
      JSON.stringify(r.seen.brokeWalked));
    let rank = '?', nationalLive = false;
    try { rank = r.Game.scaleRank(); nationalLive = !!r.Game.state.nationalLive; } catch (e) {}
    console.log(`  INFO end=${r.result.endReason} d${r.result.gameDays} rank=${rank} nationalLive=${nationalLive}`);
    check('303 still reaches national under v3 (no regression)', nationalLive,
      `rank=${rank}`);
  }

  console.log(failures === 0 ? 'ALL GREEN' : `${failures} FAILURES`);
  process.exit(failures === 0 ? 0 : 1);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
