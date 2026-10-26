// test-journey-deepening-r53-stage0-ask-20261026.js -- PROBE for the
// journey-deepening r53 P1 mechanism (r52 P1, unresolved).
//
// r52 claimed: a stage-0 ask_favor opener re-returns the favor's stored
// line, and when that line was already spoken in an earlier sitting the
// no-repeat rule blocks it and speaks the shrug ("...Sorry, lost my train
// of thought."). r52 did NOT reproduce the shrug in a constructed sitting,
// so r53 must name which ledger actually governs the stage-0 path before
// any fix lands. This probe answers that question three ways, all through
// real game code (sim-harness loadGame, no retyped logic):
//
//   A. LEDGER GOVERNANCE (sayLine level): the exact favor line is placed
//      in (a) the 48-entry run ledger only, (b) the per-sitting
//      saidLinesConvo only, (c) the flat cross-sitting saidLines only,
//      (d) nowhere (control). sayLine is called with each placement and
//      the returned first chunk is recorded. This names the blocker.
//   B. FULL-PATH STAGE-0 (convoTurn level): a real sitting is opened with
//      a villager whose want is ask_favor, the want is held at stage 0
//      (simulating the preempted-opener / subject-first state: the
//      opener did not surface the want), and alive:want:ask_favor is
//      driven. The verbatim turn line + post-turn stage are recorded.
//   C. PRE-RECORDED REPLAY: the same stage-0 sitting is driven a second
//      time with the B-turn line pre-seeded into the run ledger (the
//      "another villager said it recently" case) and into saidLinesConvo
//      (the "this sitting already said it" case). A shrug here is the
//      r52 mechanism reproduced; a fresh variant is the pool protecting
//      the ask, and the test says so.
//
// PROOF TEST (r53 fix landed): section A stays diagnostic (sayLine
// itself is untouched — a run-ledger block still dries at that level, by
// design), but sections B and C are assertions: a stage-0 ask_favor turn
// must SPEAK an ask (re-ask phrasing or whyLine), never the shrug.
// Before the conversation.js stage-0 re-ask guard, B shrugs (and the C
// saidLinesConvo replay shrugs); after it, both speak. Exits 1 on any
// shrug in B or C, 0 when all three turns speak.
// Usage: node scripts/test-journey-deepening-r53-stage0-ask-20261026.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

const DRY = 'lost my train of thought';
function isShrug(line) {
  return !!line && (String(line).includes(DRY) || String(line).includes('I just said'));
}

(async () => {
  const { Game } = await loadGame({ seed: 42003, mode: 'r53-stage0-probe', fullTelemetry: true });
  await setupGame(Game);
  const results = {};
  const log = (s) => console.log(s);

  // ---- pick a talkable villager -------------------------------------
  // Fixture (stated, not hidden): at setup no villager carries a live
  // favor need, so the picker never selects ask_favor. Hunger is the
  // game's own acute need channel (convoFindFavorNeed: hunger > 70 ->
  // food_share urgency 4, which beats the first-meeting curiosity floor
  // of 3). npcNeeds returns the mutable per-villager object the game
  // itself mutates (game.js gift/hunger writes), so setting hunger here
  // is a state fixture, not a code patch. Read-back is logged.
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  for (const id of roster) {
    try {
      const n = Game.npcNeeds(id);
      if (n) n.hunger = 85;
      log(`fixture: ${Game.displayName(id)} npcNeeds.hunger read-back=${Game.npcNeeds(id) && Game.npcNeeds(id).hunger} need=${JSON.stringify(Game.convoFindFavorNeed(id))}`);
    } catch (e) { log(`fixture: ${id} npcNeeds error: ${e && e.message}`); }
  }
  let vid = null, opener = null;
  for (const id of roster) {
    try {
      const comm = Game.npcComm ? Game.npcComm(id) : { level: 'full' };
      if (comm.level === 'none') continue;
      const r = Game.startConvo(id);
      if (!r || !r.line) { try { Game.endConvo(id, 'done'); } catch (e) {} continue; }
      const c = Game.convoGet(id);
      if (c && c.want && c.want.id === 'ask_favor') { vid = id; opener = r; break; }
      try { Game.endConvo(id, 'done'); } catch (e) {}
    } catch (e) {}
  }
  if (!vid) {
    console.log('PROBE-INCONCLUSIVE: no ask_favor villager found in the setup roster');
    process.exit(1);
  }
  const c0 = Game.convoGet(vid);
  log(`villager=${Game.displayName(vid)} (${vid}) want=${c0.want.id} stage=${c0.want.stage} favorKind=${(c0.want.favor || {}).kind || 'none'} favorState=${(c0.want.favor || {}).state || 'none'} favorLine=${(c0.want.favor || {}).line || 'none'}`);
  log(`opener line: ${opener.line}`);
  const favorLine = (c0.want.favor && c0.want.favor.line) || null;

  // ---- A. ledger governance at sayLine level ------------------------
  log('--- A. sayLine ledger governance (favor line, one placement each) ---');
  const placements = [
    ['run-ledger-only', (c, line) => { Game.convoRunLedger().push(line); }],
    ['saidLinesConvo-only', (c, line) => { c.saidLinesConvo.push(line); }],
    ['flat-saidLines-only', (c, line) => { c.saidLines.push(line); }],
    ['control-nowhere', () => {}],
  ];
  results.ledger = {};
  for (const [name, seedFn] of placements) {
    // Fresh sitting so per-sitting ledgers start empty; the flat ledger
    // and run ledger are then seeded exactly as the placement says.
    try { Game.endConvo(vid, 'done'); } catch (e) {}
    const r = Game.startConvo(vid);
    if (!r) { log(`${name}: startConvo null`); results.ledger[name] = 'startConvo-null'; continue; }
    const c = Game.convoGet(vid);
    const line = favorLine || (c.want && c.want.favor && c.want.favor.line) || '"probe line"';
    // Clear the per-sitting ledgers the opener may have filled, then seed.
    c.saidLinesConvo = [];
    const rl = Game.convoRunLedger();
    const idx = rl.indexOf(line);
    if (idx >= 0) rl.splice(idx, 1);
    seedFn(c, line);
    let said = null;
    try { said = Game.sayLine(vid, line); } catch (e) { said = 'ERR:' + e.message; }
    log(`${name}: saidLine returned: ${said}`);
    results.ledger[name] = { returned: said, shrug: isShrug(said) };
  }

  // ---- B. full-path stage-0 sitting ---------------------------------
  log('--- B. full-path stage-0 alive:want:ask_favor ---');
  try { Game.endConvo(vid, 'done'); } catch (e) {}
  const rb = Game.startConvo(vid);
  if (!rb) { log('B: startConvo null'); process.exit(1); }
  log(`B: startConvo opener line: ${rb.line}`);
  const cb = Game.convoGet(vid);
  // Hold the want at stage 0: simulate the preempted-opener state (the
  // opener spoke something else, or the player steered to subject first,
  // so the want never surfaced). The want def + favor instance are the
  // game's own; only the stage is held back, and that is stated here.
  const stageBefore = cb.want ? cb.want.stage : null;
  if (cb.want) cb.want.stage = 0;
  cb.thread = null;
  // Wrap sayLine for the B turn only: record the exact primary line the
  // branch attempts (the blocked primary is otherwise discarded) and
  // whether convoWouldBlock flagged it beforehand.
  const origSayLine = Game.sayLine;
  const attempted = [];
  Game.sayLine = function (v2, line, opts) {
    let blocked = null;
    try { blocked = Game.convoWouldBlock(v2, line); } catch (e) {}
    attempted.push({ line: String(line), wouldBlock: blocked });
    return origSayLine.call(this, v2, line, opts);
  };
  let turnB = null;
  try {
    const choices = Game.convoChoices(vid) || [];
    const wantChoice = choices.find(x => x && x.id === 'alive:want:ask_favor');
    log(`B: stageBefore=${stageBefore} stageHeld=0 wantChoiceOffered=${!!wantChoice} offered=[${choices.map(x => x && x.id).filter(Boolean).join(',')}]`);
    if (wantChoice) turnB = Game.convoTurn(vid, 'alive:want:ask_favor');
    else {
      // No alive:want menu (thread/menu state) — drive dlg:subject first,
      // then retry, exactly the r51/r52 subject->want route.
      const subj = choices.find(x => x && x.id === 'dlg:subject');
      if (subj) {
        const t0 = Game.convoTurn(vid, 'dlg:subject');
        log(`B: dlg:subject turn line: ${t0 && t0.line}`);
        const choices2 = Game.convoChoices(vid) || [];
        const want2 = choices2.find(x => x && x.id === 'alive:want:ask_favor');
        log(`B: after subject, wantChoiceOffered=${!!want2} offered=[${choices2.map(x => x && x.id).filter(Boolean).join(',')}]`);
        if (want2) turnB = Game.convoTurn(vid, 'alive:want:ask_favor');
      }
    }
  } catch (e) { log('B: convoTurn threw: ' + (e && e.stack || e)); }
  log(`B: want turn line: ${turnB && turnB.line}`);
  log(`B: attempted sayLine calls during B: ${JSON.stringify(attempted)}`);
  log(`B: run ledger at B end: ${JSON.stringify(Game.convoRunLedger())}`);
  log(`B: want stage after: ${(Game.convoGet(vid).want || {}).stage} shrug=${isShrug(turnB && turnB.line)}`);
  Game.sayLine = origSayLine;
  results.stage0 = { stageBefore, line: turnB && turnB.line, stageAfter: (Game.convoGet(vid).want || {}).stage, shrug: isShrug(turnB && turnB.line) };
  const bLine = turnB && turnB.line;

  // ---- C. pre-recorded replay ---------------------------------------
  log('--- C. pre-recorded replay of the B line ---');
  for (const [name, seedFn] of [
    ['run-ledger-preseed', (c) => { if (bLine) Game.convoRunLedger().push(bLine); }],
    ['saidLinesConvo-preseed', (c) => { if (bLine) c.saidLinesConvo.push(bLine); }],
  ]) {
    try { Game.endConvo(vid, 'done'); } catch (e) {}
    const rc = Game.startConvo(vid);
    if (!rc) { log(`C ${name}: startConvo null`); continue; }
    const cc = Game.convoGet(vid);
    if (cc.want) cc.want.stage = 0;
    cc.thread = null;
    seedFn(cc);
    const origSayLineC = Game.sayLine;
    const attemptedC = [];
    Game.sayLine = function (v2, line, opts) {
      let blocked = null;
      try { blocked = Game.convoWouldBlock(v2, line); } catch (e) {}
      attemptedC.push({ line: String(line), wouldBlock: blocked });
      return origSayLineC.call(this, v2, line, opts);
    };
    let turnC = null;
    try {
      // Same subject->want route as B: the want choice only appears
      // after the subject turn moves the thread.
      let choices = Game.convoChoices(vid) || [];
      let wantChoice = choices.find(x => x && x.id === 'alive:want:ask_favor');
      if (!wantChoice) {
        const subj = choices.find(x => x && x.id === 'dlg:subject');
        if (subj) Game.convoTurn(vid, 'dlg:subject');
        choices = Game.convoChoices(vid) || [];
        wantChoice = choices.find(x => x && x.id === 'alive:want:ask_favor');
      }
      if (wantChoice) turnC = Game.convoTurn(vid, 'alive:want:ask_favor');
      else log(`C ${name}: want choice not offered, offered=[${choices.map(x => x && x.id).filter(Boolean).join(',')}]`);
    } catch (e) { log(`C ${name}: threw: ${e && e.message}`); }
    log(`C ${name}: line: ${turnC && turnC.line} shrug=${isShrug(turnC && turnC.line)} stageAfter=${(Game.convoGet(vid).want || {}).stage}`);
    log(`C ${name}: attempted: ${JSON.stringify(attemptedC)} startOpener: ${rc && rc.line}`);
    Game.sayLine = origSayLineC;
    results['replay-' + name] = { line: turnC && turnC.line, shrug: isShrug(turnC && turnC.line) };
  }
  try { Game.endConvo(vid, 'done'); } catch (e) {}

  console.log('RESULT-JSON ' + JSON.stringify(results, null, 1));
  const shrugs = [];
  if (results.stage0 && results.stage0.shrug) shrugs.push('B stage-0');
  for (const k of Object.keys(results)) if (k.startsWith('replay-') && results[k].shrug) shrugs.push(k);
  if (shrugs.length) {
    console.log(`RESULT: FAIL — shrug in ${shrugs.join(', ')} (stage-0 ask went dry)`);
    process.exit(1);
  }
  console.log('RESULT: PASS — stage-0 ask speaks in B and both C replays (no shrug)');
  process.exit(0);
})().catch(e => { console.error('PROOF ERROR', e && e.stack); process.exit(1); });
