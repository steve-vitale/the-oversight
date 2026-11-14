// test-journey-deepening-r191-stage0-h1-20261114.js -- TARGETED PROBE for
// the journey-deepening r191 Q1 hypothesis H1 (carried from r188/r189):
//
//   H1: the stage-0 guard (conversation.js ~7017) speaks a re-ask phrasing
//   (convoFavorFollowup) for a favor built seconds earlier in the SAME
//   sitting, never previously spoken — when the fresh opener line collides
//   with the 48-entry run ledger (another villager said the same food line
//   recently; the run ledger is run-wide, the variant space is 18 lines).
//   The player hears "About the food I needed — I'm still asking" for an
//   ask that never happened: fabricated shared history (SENSE-TESTING LAW).
//
// Method (all through real game code, sim-harness loadGame, no retyped
// logic; forked from the r53 probe pattern):
//   0. Hunger fixture (npcNeeds.hunger = 85 -> food_share urgency 4).
//   1. CONTROL arm (villager A): stage-0 alive:want turn with a clean run
//      ledger. Expect the fresh opener line to speak (not a re-ask).
//   2. BLOCKED arm (villager B, first sitting in the run): sample
//      convoBuildFavor draws to collect the food_share opener-variant set,
//      push every distinct line's first-chunk key into the run ledger
//      (simulating "another villager said it recently"), then drive the
//      stage-0 alive:want turn. Expect the turn's fresh favor line to be
//      ledger-blocked and the spoken line to be one of the 4
//      convoFavorFollowup re-ask variants.
//   3. Verdict from the records, printed as RESULT-JSON + RESULT line.
//      RED (H1 real) on current code: blocked arm speaks a re-ask variant
//      for a favor with askedDay == today, the turn favor's own line IS
//      ledger-blocked (the guard's input), the spoken line's key differs
//      from the sitting-opener line's key (the ask was never spoken in
//      any words), and the want is not fromSeed. After the fix the blocked
//      arm must speak a fresh need line (whyLine / needLine), never a
//      re-ask — and never the shrug (r53 invariant).
//   v2 (r191): v1's "primaryBlocked" wrapper metric was structurally blind
//      — the guard substitutes before sayLine ever sees the primary — so v1
//      could report NOT-REPRODUCED while the phantom re-ask fired in front
//      of it (v1 run: blocked arm spoke the re-ask, reask=true, but
//      primaryBlocked=false). v2 observes the guard's input directly.
//
// Usage: node scripts/test-journey-deepening-r191-stage0-h1-20261114.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

const DRY = 'lost my train of thought';
const REASK_MARKERS = [
  'still need hands',
  "I still haven't found anyone",
  'I hate to ask twice',
  "the need hasn't gone anywhere",
];
function isShrug(line) {
  return !!line && (String(line).includes(DRY) || String(line).includes('I just said'));
}
function isReask(line) {
  if (!line) return false;
  const s = String(line);
  return REASK_MARKERS.some(m => s.includes(m));
}
function firstKey(Game, line) {
  try { return Game.convoSplitBeats(line)[0].trim(); } catch (e) { return String(line); }
}

(async () => {
  const { Game } = await loadGame({ seed: 42003, mode: 'r191-stage0-h1-probe', fullTelemetry: true });
  await setupGame(Game);
  const log = (s) => console.log(s);
  const results = { control: null, blocked: null, coverage: null };

  // ---- fixture: hunger on every roster NPC -------------------------
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  for (const id of roster) {
    try { const n = Game.npcNeeds(id); if (n) n.hunger = 85; } catch (e) {}
  }

  // ---- find TWO ask_favor villagers (A control, B blocked) ---------
  const found = [];
  for (const id of roster) {
    if (found.length >= 2) break;
    try {
      const comm = Game.npcComm ? Game.npcComm(id) : { level: 'full' };
      if (comm.level === 'none') continue;
      const r = Game.startConvo(id);
      if (!r || !r.line) { try { Game.endConvo(id, 'done'); } catch (e) {} continue; }
      const c = Game.convoGet(id);
      if (c && c.want && c.want.id === 'ask_favor') found.push({ vid: id, opener: r });
      try { Game.endConvo(id, 'done'); } catch (e) {}
    } catch (e) {}
  }
  if (found.length < 2) {
    console.log(`PROBE-INCONCLUSIVE: only ${found.length} ask_favor villager(s) found in the setup roster`);
    process.exit(1);
  }
  const [ctrl, blocked] = found;
  log(`control villager=${Game.displayName(ctrl.vid)} (${ctrl.vid})`);
  log(`blocked villager=${Game.displayName(blocked.vid)} (${blocked.vid})`);

  // ---- shared driver: fresh sitting, stage-0 alive:want turn -------
  // r191 FIX (probe v2): the v1 wrapper only recorded lines actually passed
  // to sayLine — but the stage-0 guard substitutes the opener line BEFORE
  // sayLine ever sees it, so v1's "primaryBlocked" could never be true.
  // v2 observes the guard's actual input: (a) wouldBlock on the sitting
  // opener's line BEFORE the turn, (b) a convoWouldBlock wrapper logging
  // every evaluation DURING the turn, (c) the turn favor's own .line and
  // its wouldBlock status AFTER the turn, plus (d) want.fromSeed, which
  // rules the opener's seed branch in or out as the re-ask's source.
  function driveStage0(vid, label) {
    try { Game.endConvo(vid, 'done'); } catch (e) {}
    const r = Game.startConvo(vid);
    if (!r || !r.line) return { label, error: 'startConvo-null' };
    const c = Game.convoGet(vid);
    const openerFavorLine = (c.want && c.want.favor && c.want.favor.line) || null;
    const openerFavorId = (c.want && c.want.favor && c.want.favor.id) || null;
    const wantFromSeed = !!(c.want && c.want.fromSeed);
    const wantSeedFavorId = (c.want && c.want.seedFavorId) || null;
    let openerBlocked = null;
    try { openerBlocked = openerFavorLine ? Game.convoWouldBlock(vid, openerFavorLine) : null; } catch (e) {}
    if (c.want) c.want.stage = 0;
    c.thread = null;
    const blockEvals = [];
    const origWouldBlock = Game.convoWouldBlock;
    if (typeof origWouldBlock === 'function') {
      Game.convoWouldBlock = function (v2, line) {
        let res = null;
        try { res = origWouldBlock.call(this, v2, line); } catch (e) {}
        try { blockEvals.push({ line: String(line).slice(0, 120), result: res }); } catch (e) {}
        return res;
      };
    }
    const origSayLine = Game.sayLine;
    const attempted = [];
    Game.sayLine = function (v2, line, opts) {
      let wb = null;
      try { wb = Game.convoWouldBlock(v2, line); } catch (e) {}
      attempted.push({ line: String(line), wouldBlock: wb });
      return origSayLine.call(this, v2, line, opts);
    };
    let turn = null;
    try {
      let choices = Game.convoChoices(vid) || [];
      let wantChoice = choices.find(x => x && x.id === 'alive:want:ask_favor');
      if (!wantChoice) {
        const subj = choices.find(x => x && x.id === 'dlg:subject');
        if (subj) Game.convoTurn(vid, 'dlg:subject');
        choices = Game.convoChoices(vid) || [];
        wantChoice = choices.find(x => x && x.id === 'alive:want:ask_favor');
      }
      if (wantChoice) turn = Game.convoTurn(vid, 'alive:want:ask_favor');
      else return { label, error: 'want-choice-not-offered', offered: choices.map(x => x && x.id).filter(Boolean) };
    } catch (e) { return { label, error: 'threw: ' + (e && e.message) }; }
    finally { Game.sayLine = origSayLine; if (typeof origWouldBlock === 'function') Game.convoWouldBlock = origWouldBlock; }
    const cAfter = Game.convoGet(vid);
    const favor = (cAfter.want && cAfter.want.favor) || Game.convoGetFavor(vid);
    const favorLine = (favor && favor.line) || null;
    let favorLineBlocked = null;
    try { favorLineBlocked = favorLine ? Game.convoWouldBlock(vid, favorLine) : null; } catch (e) {}
    return {
      label,
      openerFavorLine,
      openerFavorId,
      openerBlocked,
      wantFromSeed,
      wantSeedFavorId,
      blockEvals,
      spokenLine: turn && turn.line,
      stageAfter: (cAfter.want || {}).stage,
      favorId: favor && favor.id,
      favorLine,
      favorLineBlocked,
      favorAskedDay: favor && favor.askedDay,
      favorKind: favor && favor.kind,
      favorState: favor && favor.state,
      shrug: isShrug(turn && turn.line),
      reask: isReask(turn && turn.line),
      attempted,
    };
  }

  // ---- 1. CONTROL arm (clean ledger) ----------------------------
  log('--- 1. CONTROL arm (clean ledger) ---');
  const ctrlRes = driveStage0(ctrl.vid, 'control');
  log(`control: spoken=${ctrlRes.spokenLine} reask=${ctrlRes.reask} shrug=${ctrlRes.shrug}`);
  log(`control: attempted=${JSON.stringify(ctrlRes.attempted)}`);
  results.control = ctrlRes;

  // ---- 2. BLOCKED arm: pre-seed the run ledger ---------------------
  log('--- 2. BLOCKED arm: sample the food_share variant set ---');
  const needB = Game.convoFindFavorNeed(blocked.vid);
  log(`blocked: need=${JSON.stringify(needB)}`);
  const seenKeys = new Set();
  const seenLines = [];
  let draws = 0, noNew = 0;
  while (draws < 400 && noNew < 40) {
    const f = Game.convoBuildFavor(blocked.vid, needB);
    draws++;
    if (!f || !f.line) { noNew++; continue; }
    const k = firstKey(Game, f.line);
    if (!seenKeys.has(k)) { seenKeys.add(k); seenLines.push(f.line); noNew = 0; }
    else noNew++;
  }
  const rl = Game.convoRunLedger();
  for (const k of seenKeys) if (rl.indexOf(k) === -1) rl.push(k);
  results.coverage = { distinctKeys: seenKeys.size, draws, noNewStreak: noNew, lines: seenLines };
  log(`blocked: sampled ${draws} builds, ${seenKeys.size} distinct first-chunk keys, no-new streak ${noNew}`);
  log(`blocked: run ledger now ${rl.length} entries`);

  const blockedRes = driveStage0(blocked.vid, 'blocked');
  log(`blocked: openerFavorLine=${blockedRes.openerFavorLine}`);
  log(`blocked: spoken=${blockedRes.spokenLine} reask=${blockedRes.reask} shrug=${blockedRes.shrug}`);
  log(`blocked: attempted=${JSON.stringify(blockedRes.attempted)}`);
  log(`blocked: favorId=${blockedRes.favorId} askedDay=${blockedRes.favorAskedDay} today=${(Game.state.scholar || {}).day}`);
  log(`blocked: openerBlocked=${blockedRes.openerBlocked} wantFromSeed=${blockedRes.wantFromSeed} favorLineBlocked=${blockedRes.favorLineBlocked} guardSawBlock=${(blockedRes.blockEvals || []).some(e => e.result === true)}`);
  log(`blocked: favorLine=${blockedRes.favorLine}`);
  results.blocked = blockedRes;
  try { Game.endConvo(blocked.vid, 'done'); } catch (e) {}

  // ---- 3. Verdict ----------------------------------------------------
  // v2 verdict: H1 is a MECHANISM claim (the guard substitutes a re-ask
  // for a never-spoken favor when the fresh line is ledger-blocked). The
  // observable that proves it is the TURN favor's own line being blocked
  // (favorLineBlocked) together with the re-ask actually speaking for a
  // today-built favor on a first sitting, with the seed branch ruled out
  // (wantFromSeed false). The v1 wrapper metric (a SPOKEN line with
  // wouldBlock=true) is kept in the JSON for the record but is known-blind:
  // the guard substitutes before sayLine ever sees the primary.
  const today = (Game.state.scholar || {}).day;
  const blockedAttempts = (blockedRes.attempted || []).filter(a => a.wouldBlock === true);
  const primaryBlocked = blockedAttempts.length > 0;
  const openerKey = blockedRes.openerFavorLine ? firstKey(Game, blockedRes.openerFavorLine) : null;
  const spokenKey = blockedRes.spokenLine ? firstKey(Game, blockedRes.spokenLine) : null;
  const spokenDiffersFromOpener = !!(openerKey && spokenKey && openerKey !== spokenKey);
  const guardBlockedTurnFavor = blockedRes.favorLineBlocked === true;
  const guardSawBlock = (blockedRes.blockEvals || []).some(e => e.result === true);
  const h1 = guardBlockedTurnFavor && blockedRes.reask && !blockedRes.shrug &&
    blockedRes.favorAskedDay === today && spokenDiffersFromOpener && !blockedRes.wantFromSeed;
  const controlOk = ctrlRes.spokenLine && !ctrlRes.reask && !ctrlRes.shrug;

  console.log('RESULT-JSON ' + JSON.stringify({ ...results, verdict: { h1, controlOk, primaryBlocked, guardBlockedTurnFavor, guardSawBlock, spokenDiffersFromOpener, blockedAttempts: blockedAttempts.length } }, null, 1));
  if (!controlOk) {
    console.log('RESULT: INCONCLUSIVE — control arm did not speak a fresh opener line (reask=' + ctrlRes.reask + ' shrug=' + ctrlRes.shrug + ')');
    process.exit(1);
  }
  if (blockedRes.error) {
    console.log('RESULT: INCONCLUSIVE — blocked arm error: ' + blockedRes.error);
    process.exit(1);
  }
  if (h1) {
    console.log('RESULT: H1-CONFIRMED — stage-0 guard spoke a re-ask variant for a same-sitting-built, never-spoken favor (turn favor line ledger-blocked, askedDay=today, spoken differs from opener, seed branch ruled out)');
    process.exit(2); // RED on pre-fix code: the phantom re-ask fires
  }
  if (blockedRes.reask && !guardBlockedTurnFavor) {
    console.log('RESULT: H1-NOT-CONFIRMED-OTHER-PATH — blocked arm spoke a re-ask variant but the turn favor line was NOT ledger-blocked (favorLineBlocked=' + blockedRes.favorLineBlocked + ', wantFromSeed=' + blockedRes.wantFromSeed + ', guardSawBlock=' + guardSawBlock + '); the phantom re-ask came from another path — diagnose before fixing');
    process.exit(3);
  }
  if (blockedRes.shrug) {
    console.log('RESULT: FAIL — blocked arm went dry (shrug); the guard did not speak at all');
    process.exit(1);
  }
  console.log('RESULT: H1-NOT-REPRODUCED — blocked arm spoke a fresh line, not a re-ask (reask=' + blockedRes.reask + ', favorLineBlocked=' + blockedRes.favorLineBlocked + ', guardSawBlock=' + guardSawBlock + ')');
  process.exit(0);
})().catch(e => { console.error('PROOF ERROR', e && e.stack); process.exit(1); });
