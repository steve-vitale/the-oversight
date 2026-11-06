#!/usr/bin/env node
// test-awaynaming-cap-a.js — proof for the uncapped naming-news
// position gate (sim-awaynaming-cap-a). Re-do of the killed
// sim-gossipfix-a gate (86e4652b7) with the 12-entry awayNaming cap
// REMOVED: the killed fix silently dropped the oldest held line past
// 12 (15009 lost 1, 17010 lost 24 on a 9-night stranding). This arm
// re-applies the gossipfix shape (a) on the r141-relay substrate —
// the three call sites now swap sayHavenNews for sayNamingNews for
// word/debate/settle only; tale/witness stay on the relay — with NO
// bound on the queue. Prereg:
// evidence/2026-11-05/sim-awaynaming-cap-a-prereg.md, committed
// BEFORE any judged sim (before leg on current master: relay
// behavior, 0 stranded events, relay dropped 4 word + 4 debate).
//
// Unit leg (fast, always): the gate itself, scripted on a live Game —
// (1) burst held while away, delivered on return (namingKicked and
// proposals still set while away: the debate proceeds, only delivery
// waits); (2) settle held likewise (villageName still set while
// away); (3) THE CAP FIX: 20 lines held directly (word/debate/settle
// kinds) — the killed fix capped at 12 — delivered as SUMMARIES
// (sim-catchup-summary-a 2026-11-06): framing + burst + settle
// summaries, at most 3 lines, parsed counts exact (7 words, 7
// debates, 6 settles); (4) in-haven burst still says
// immediately; (5) the framing line on delivery matches no
// burst/settle classifier pattern. Classifier unit checks are reused
// verbatim from test-gossipcensus-a.js where applicable (same
// constants, same exclusions).
// Integration leg (60 loop-days, bankfood variant leg, WOODWARM=0):
// runs the driver once with STRANDNARR=1 and once with
// STRANDNARR=0 on seed 17021 and asserts
//   (a) det-gate: bankfood evenings/mornings/first-upkeep kcal series
//       identical ON vs OFF on the FIXED code (the recorder + position
//       reads change no trajectory);
//   (b) stranded anchor — CURRENT-substrate pin, re-pinned at the
//       2026-11-06 adoption rebase onto local master a7dfc4a45
//       (journey-endgame r143: Fixes B/C + gorge fix moved the
//       substrate): 17021 has 0 stranded nights, 52 days,
//       village-lost. The old pin (60 days,
//       survived, read from the fresh before leg on base 555f59160)
//       no longer holds on current master — verified by a no-fix
//       control run on master (same driver, game.js without the gate):
//       17021 runs 52 days, village-lost there too, so the pin moved
//       UNDER the fix, not because of it. The gate's own checks
//       (det-gate, 0 stranded windows) are unchanged by the move.
//   (c) non-stranded anchor: seed 15003 loop-day 7 sleep window
//       still contains a 'Word gets around the haven' line, classified
//       non-stranded sleep with the scholar inside Haven at fire time
//       (the gate must NOT hold an in-haven burst) — re-verified from
//       the fresh before leg (hit at idx 777, position (4,7) haven,
//       inside true).
// Usage: node scripts/test-awaynaming-cap-a.js
// Env (the bankfood substrate gates, as in gossipcensus-trace-a.js):
//   COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1
//   POLICY=nighttravel WOODCARRY=1 WOODWARM=0 BANKFOOD=1
'use strict';
const gc = require('./policies/gossipcensus-diag');
const { oneInstance, analyzeInstance } = require('./gossipcensus-trace-a');
const { loadGame, setupGame } = require('./sim-harness');

let checks = 0, fails = 0;
function check(name, cond, detail) {
  checks++;
  if (cond) console.log('ok   ' + name);
  else { fails++; console.log('FAIL ' + name + ' :: ' + (detail || '')); }
}

// ---- unit leg: classifiers reused verbatim (census constants) ----
const WORD1 = 'Word gets around the haven. Whatever that thing was — everyone\'s talking about it now.';
const DEBATE1 = 'Back at the haven the argument starts: Mara is calling it "Old Loud." They\'ll fight it out — weigh in if you want.';
check('word regex: variant 1', gc.isGossipWordLine(WORD1));
check('debate regex: variant 1', gc.isDebateLine(DEBATE1));
check('burst: word is burst', gc.isGossipBurstLine(WORD1));
check('burst: debate is burst', gc.isGossipBurstLine(DEBATE1));
check('exclusion: teachGossip bare phrase', !gc.isGossipBurstLine('Mara showed June the snare — "remember it." Word gets around.'));
check('exclusion: back-name line', !gc.isGossipBurstLine('You back "Old Loud." Word gets around.'));
check('settle: settle line', gc.isSettleLine('It\'s settled. The village is calling it "Old Loud." The Codex keeps it.'));
check('settle: not a burst line', !gc.isGossipBurstLine('It\'s settled. The village is calling it "Old Loud." The Codex keeps it.'));
check('framing line matches no burst/settle pattern',
  !gc.isGossipBurstLine('While you were away, the haven argued over what to call it — they catch you up at the fire:')
  && !gc.isSettleLine('While you were away, the haven argued over what to call it — they catch you up at the fire:'));

// ---- unit leg: the gate on a live Game ----
// Game.log is a 40-entry ring, so length-slicing misses lines once it
// is full (returnToVillage says many lines). Capture say() calls
// directly instead — the same wrap the census recorder uses.
(async () => {
  const { Game } = await loadGame({ seed: 15003, mode: 'nighttravel-b', fullTelemetry: false });
  await setupGame(Game);
  const said = [];
  const origSay = Game.say;
  Game.say = function (msg) {
    said.push(typeof msg === 'string' ? msg : String(msg && msg.text !== undefined ? msg.text : msg));
    return origSay.call(this, msg);
  };
  const mid = (Game.data.monsters || [])[0] && Game.data.monsters[0].id;
  const roster = ((Game.state.village || {}).roster || []).slice();
  const vpx = (Game.state.village || {}).px ?? 4, vpy = (Game.state.village || {}).py ?? 4;
  check('fixture: monster + roster present', !!mid && roster.length >= 3, 'mid=' + mid + ' roster=' + roster.length);
  check('fixture: scholar starts at Haven', Game.playerAtHaven() === true
    && Game.state.scholar.insideHaven !== false, 'playerAtHaven=' + Game.playerAtHaven());

  // Position the scholar AWAY: far map tile, outside the hall.
  function goAway() {
    Game.map.px = 0; Game.map.py = 0;
    Game.state.scholar.mx = 0; Game.state.scholar.my = 0;
    Game.state.scholar.insideHaven = false;
  }
  function goHome() {
    Game.map.px = vpx; Game.map.py = vpy;
    Game.state.scholar.mx = vpx; Game.state.scholar.my = vpy;
    Game.state.scholar.insideHaven = true;
  }
  goAway();
  check('fixture: away means playerAtHaven false', Game.playerAtHaven() === false);

  // (1) Burst held while away.
  const e = Game.ensureMonsterEntry(mid);
  e.reported = true; e.knowers = roster.slice();
  const saidBefore = said.length;
  Game.monsterNewsCheck(mid);
  const freshLines = said.slice(saidBefore);
  check('burst held: no word line while away', !freshLines.some((t) => gc.isGossipWordLine(t)), JSON.stringify(freshLines));
  check('burst held: no debate line while away', !freshLines.some((t) => gc.isDebateLine(t)), JSON.stringify(freshLines));
  check('burst held: debate still proceeds (namingKicked + proposals set)',
    e.namingKicked === true && Object.keys(e.proposals || {}).length >= 1,
    'kicked=' + e.namingKicked + ' proposals=' + Object.keys(e.proposals || {}).length);
  const held = (Game.state.scholar || {}).awayNaming || [];
  check('burst held: queue holds word + debate', held.length === 2
    && held[0].kind === 'word' && held[1].kind === 'debate'
    && gc.isGossipWordLine(held[0].text) && gc.isDebateLine(held[1].text),
    JSON.stringify(held.map((h) => [h.kind, h.text])));
  check('burst held: relay queue stays empty (burst/settle bypass the relay)',
    ((Game.state || {}).pendingHavenNews || []).length === 0);
  const heldTexts = held.map((h) => h.text);

  // (2) Settle held likewise.
  for (const vid of roster) e.proposals[vid] = 'Old Loud';
  const saidBefore2 = said.length;
  Game.monsterNamingCheck(mid);
  const fresh2 = said.slice(saidBefore2);
  check('settle held: villageName still set while away', e.villageName === 'Old Loud', 'villageName=' + e.villageName);
  check('settle held: no settle line while away', !fresh2.some((t) => gc.isSettleLine(t)), JSON.stringify(fresh2));
  const held2 = (Game.state.scholar || {}).awayNaming || [];
  check('settle held: queue holds the settle line', held2.length === 3 && held2[2].kind === 'settle'
    && gc.isSettleLine(held2[2].text), JSON.stringify(held2.map((h) => h.kind)));
  const settleText = held2[2].text;

// (3) Delivered on return as SUMMARIES (sim-catchup-summary-a
  // 2026-11-06 — the verbatim delivery is replaced: framing + one
  // burst summary + one settle summary, 3 lines, parsed counts
  // exact, queue drained; NO verbatim held line appears).
  goHome();
  const saidBefore3 = said.length;
  Game.returnToVillage();
  const fresh3 = said.slice(saidBefore3);
  const delivered3 = fresh3.filter((t) => gc.parseSummaryLine(t));
  check('delivered: framing + burst + settle summaries (3 lines)',
    delivered3.length === 3, JSON.stringify(fresh3));
  check('delivered: framing line on return',
    delivered3[0] === 'While you were away, the haven argued over what to call it — they catch you up at the fire:',
    JSON.stringify(delivered3));
  check('delivered: burst summary carries 1 word + 1 debate',
    (() => { const p = gc.parseSummaryLine(delivered3[1] || ''); return p && p.kind === 'burst' && p.words === 1 && p.debates === 1 && p.clauses.length === 1 && p.clauses[0].name === 'Old Loud' && p.clauses[0].n === 2 && !p.inconsistent; })(),
    JSON.stringify(delivered3[1]));
  check('delivered: settle summary names the village name (1 beast)',
    (() => { const p = gc.parseSummaryLine(delivered3[2] || ''); return p && p.kind === 'settle' && p.beasts === 1 && p.names[0] === 'Old Loud' && !p.inconsistent; })(),
    JSON.stringify(delivered3[2]));
  check('delivered: NO verbatim held line appears',
    !heldTexts.some((t) => fresh3.includes(t)) && !fresh3.includes(settleText), JSON.stringify(fresh3));
  check('delivered: queue drained', ((Game.state.scholar || {}).awayNaming || []).length === 0);

  // (4) THE CAP FIX: hold 20 lines — past the killed fix's 12-entry
  // bound — and deliver them as SUMMARIES (sim-catchup-summary-a):
  // the queue holds all 20, but the return still costs at most 3
  // lines (framing + burst + settle summaries) with exact counts.
  // A long stranding (17010 held 36 on the gossipfix corpus) must
  // lose nothing — the revised ledger accounts every held line.
  goAway();
  const capTexts = [];
  const kinds = ['word', 'debate', 'settle'];
  for (let i = 0; i < 20; i++) {
    const kind = kinds[i % 3];
    const text = kind === 'word'
      ? 'Word gets around the haven. Whatever that thing was — every fire has a theory tonight.'
      : kind === 'debate'
        ? 'Back at the haven the argument starts: Mara is calling it "Old Loud." Nobody agrees yet — weigh in if you want.'
        : 'It\'s settled. The village is calling it "Old Loud." The Codex keeps it.';
    capTexts.push(text);
    Game.holdNamingNews(kind, 'cap-probe-' + i, text);
  }
  const heldCap = (Game.state.scholar || {}).awayNaming || [];
  check('cap fix: queue holds all 20 lines (no 12-entry bound)', heldCap.length === 20,
    'length=' + heldCap.length + ' (killed fix would hold 12)');
  check('cap fix: kinds preserved in order', heldCap.every((h, i) => h.kind === kinds[i % 3]),
    JSON.stringify(heldCap.map((h) => h.kind)));
  goHome();
  const saidBeforeCap = said.length;
  Game.returnToVillage();
  const freshCap = said.slice(saidBeforeCap);
  const deliveredCap = freshCap.filter((t) => gc.parseSummaryLine(t));
  check('cap fix: big delivery is still <= 3 lines (framing + 2 summaries)',
    deliveredCap.length === 3, JSON.stringify(deliveredCap));
  check('cap fix: burst summary counts exact (7 words, 7 debates, 14 clauses of 1)',
    (() => { const p = gc.parseSummaryLine(deliveredCap[1] || ''); return p && p.kind === 'burst' && p.words === 7 && p.debates === 7 && p.clauses.length === 14 && p.clauses.every((c) => c.n === 1) && !p.inconsistent; })(),
    JSON.stringify(deliveredCap[1]));
  check('cap fix: settle summary counts exact (6 beasts, names from held lines)',
    (() => { const p = gc.parseSummaryLine(deliveredCap[2] || ''); return p && p.kind === 'settle' && p.beasts === 6 && p.names.length === 6 && p.names.every((n) => n === 'Old Loud') && !p.inconsistent; })(),
    JSON.stringify(deliveredCap[2]));
  check('cap fix: NO verbatim held line appears', !capTexts.some((t) => freshCap.includes(t)), JSON.stringify(freshCap));
  check('cap fix: queue drained after the big delivery', ((Game.state.scholar || {}).awayNaming || []).length === 0);

  // (5) In-haven burst still says immediately (fresh monster, no hold).
  const mid2 = (Game.data.monsters || [])[1] && Game.data.monsters[1].id;
  const e2 = Game.ensureMonsterEntry(mid2);
  e2.reported = true; e2.knowers = roster.slice();
  const saidBefore4 = said.length;
  Game.monsterNewsCheck(mid2);
  const fresh4 = said.slice(saidBefore4);
  check('in-haven: word + debate said immediately', fresh4.some((t) => gc.isGossipWordLine(t))
    && fresh4.some((t) => gc.isDebateLine(t)), JSON.stringify(fresh4));
  check('in-haven: nothing held', ((Game.state.scholar || {}).awayNaming || []).length === 0);
  check('in-haven: settle said immediately on majority',
    (() => {
      for (const vid of roster) e2.proposals[vid] = 'Big Big';
      const sb = said.length;
      Game.monsterNamingCheck(mid2);
      return said.slice(sb).some((t) => gc.isSettleLine(t))
        && ((Game.state.scholar || {}).awayNaming || []).length === 0;
    })());

  // ---- integration leg ----
  for (const g of ['COMPETENT_FEAST', 'SEATDRIVE', 'PLENTYDEPRI']) {
    if (process.env[g] !== '0') { console.log('SKIP integration: ' + g + '=0 required'); process.exit(fails ? 1 : 0); }
  }
  if (process.env.DEPOSITGATE !== '1' || process.env.POLICY !== 'nighttravel'
    || process.env.WOODCARRY !== '1' || process.env.WOODWARM !== '0' || process.env.BANKFOOD !== '1') {
    console.log('SKIP integration: substrate gates not set (see header)'); process.exit(fails ? 1 : 0);
  }
  process.env.STRANDNARR = '1';
  const on = await oneInstance(17021, { days: 60 });
  process.env.STRANDNARR = '0';
  const off = await oneInstance(17021, { days: 60 });
  const key = (inst) => JSON.stringify({
    evenings: inst.evenings.map((e) => [e.loopDay, e.eveningOutcome, e.tile, e.inside,
      e.bankfoodEvening ? [e.bankfoodEvening.mode, e.bankfoodEvening.skip, e.bankfoodEvening.kcalBefore] : null,
      e.bankfoodMorning ? [e.bankfoodMorning.kcalBefore, e.bankfoodMorning.kcalAfterEat] : null]),
    firstUpkeeps: (inst.bankfoodStore.firstUpkeeps || []).map((f) => [f.scholarDay, f.kcal]),
  });
  check('det-gate: ON vs OFF trajectories identical (fixed code)', key(on) === key(off));
  check('det-gate: transcript errs 0', on.transcript.errs === 0, 'errs=' + on.transcript.errs + ' ' + JSON.stringify(on.transcript.errors));
  const a = analyzeInstance(on);
  check('stranded anchor (current substrate): 17021 has 0 stranded nights',
    a.stranded.length === 0,
    'stranded=' + JSON.stringify(a.stranded.map((s) => s.loopDay)));
  check('stranded anchor (current substrate): 17021 runs 52 days, village-lost (r143 substrate)',
    on.daysAlive === 52 && on.endReason === 'village-lost',
    'daysAlive=' + on.daysAlive + ' end=' + on.endReason);
  check('stranded anchor (current substrate): 0 stranded sleep windows, 0 bursts',
    a.strandedSleepWindows === 0 && a.strandedEvents === 0,
    'sleepWindows=' + a.strandedSleepWindows + ' events=' + a.strandedEvents);

  process.env.STRANDNARR = '1';
  const s15003 = await oneInstance(15003, { days: 60 });
  const a15003 = analyzeInstance(s15003);
  const hit7 = (a15003.nonStranded.sleepHits || []).find((h) => h.loopDay === 7 && h.kind === 'word');
  check('non-stranded anchor: 15003 loop-day-7 sleep window has a Word-gets-around line',
    !!hit7, 'sleepHits=' + JSON.stringify((a15003.nonStranded.sleepHits || []).map((h) => [h.loopDay, h.kind])));
  check('non-stranded anchor: that hit fires inside Haven',
    !!hit7 && hit7.position && hit7.position.inside === true,
    JSON.stringify(hit7 && hit7.position));
  console.log('---');
  console.log('awaynaming-cap proof: ' + (checks - fails) + '/' + checks + ' checks pass');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error('PROOF CRASH', e && (e.stack || e)); process.exit(2); });
