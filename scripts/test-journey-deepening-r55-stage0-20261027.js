// test-journey-deepening-r55-stage0-20261027.js -- R55 P1 PROBE (r54-specified)
//
// Question: which stage-0 sitting construction reproduces the r50 Amanda shape —
// a goal-thread conversation looping "tell me more" while the NPC's live want
// never surfaces (convoWantMenu [] throughout, want stage stays 0, close
// resolution 'unestablished')?
//
//   (A) fromSeed stage-0: a planted seed want whose opener is ledger-blocked
//       at opening, so it falls through with the want still at stage 0.
//   (B) blocked-opener stage-0: a fresh (non-fromSeed) want whose opener is
//       ledger-blocked at opening, so it falls through to the goal/smalltalk
//       fallback with the want still at stage 0.
//
// Method (all through real game code, sim-harness loadGame, no retyped logic):
// the villager carries a live acute favor need (hunger 85 -> food_share urgency 4,
// same fixture as the r53 stage-0 probe). To force a ledger block, the sitting
// is opened once to observe the exact opener line, closed, and that line is
// pushed into the 48-entry run ledger; the sitting is re-opened, and the loop
// repeats until a sitting opens with the want at stage 0 (each iteration banks
// one more opener variant, so a repeat variant must eventually block — the
// variant space is finite). Each construction is then driven with TWO pickers:
//   (i) panel picker — the r54 ENGAGE order (never picks dlg:subject);
//   (ii) subject-first picker — dlg:subject on turn 0, then alive:want:ask_favor
//       if offered, then the panel picker.
// Per turn the probe logs: offered choice ids, thread, want id/stage/fromSeed,
// convoWantMenu length, and the verbatim THEM line. After endConvo it logs the
// close resolution and whether a seed survives for the villager.
//
// Usage: node scripts/test-journey-deepening-r55-stage0-20261027.js A|B
// Exit 0: the construction was achieved and driven with both pickers (the
// VERDICT block states whether the Amanda shape reproduced). Exit 1: the
// construction could not be achieved within the attempt cap, or a harness error.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

const WHICH = process.argv[2];
if (WHICH !== 'A' && WHICH !== 'B' && WHICH !== 'A2' && WHICH !== 'BG') {
  console.log('usage: node scripts/test-journey-deepening-r55-stage0-20261027.js A|B|A2|BG');
  process.exit(1);
}
// BG (added after the B run): construction B with the trust fixture raised, so
// that after the fresh want opener blocks, the GOAL-share opener candidate
// fires (thread 'goal') instead of falling to smalltalk — the exact r50 Amanda
// shape: goal thread + dlg:more loop on goaldeep lines while the stage-0 want
// sits unheard. Trust is a state fixture like the hunger fixture, documented.
// A2 (added after the A run): construction A as specified (fromSeed stage-0)
// does not exist — the fromSeed ask_favor opener sets stage=2 at computation
// time, before the ledger-block check, so a blocked fromSeed opener lands at
// stage 2 on a smalltalk thread, never stage 0. A2 drives THAT real shape:
// accept the first fromSeed sitting that opens at stage 2 on a non-want thread
// and record whether the want menu surfaces there (thread 'small' passes
// convoWantMenu's thread-coherence rule, unlike a goal thread).
const ENGAGE = ['dlg:help', 'dlg:commit', 'dlg:heed', 'dlg:stay', 'dlg:comfort', 'dlg:empathize', 'dlg:more', 'dlg:details', 'dlg:askwhy',
  'gq:open:take', 'gq:open:unsure', 'agency:ask_field', 'alive:want:share_news', 'alive:want:ask_favor', 'alive:want:warn_you', 'alive:want:seek_comfort', 'alive:want:curious'];
const ENGAGE2 = ['goon', 'ask:gossip', 'ask:lately', 'ask:personal', 'alive:event:mourning', 'ask:fears', 'ask:you', 'teach'];
const DEFLECT = ['dlg:cant', 'gq:open:honest_pass'];

function panelPick(choices, turn) {
  const list = choices || [];
  for (const id of ENGAGE) { const c = list.find(x => x && x.id === id); if (c) return c; }
  const reactAns = list.find(x => x && x.id && x.id.indexOf('react:') === 0 && x.id.indexOf('honest_pass') === -1);
  if (reactAns) return reactAns;
  const gqAns = list.find(x => x && x.id && x.id.indexOf('gq:') === 0 && x.id.indexOf('honest_pass') === -1);
  if (gqAns) return gqAns;
  const ans = list.find(x => x && x.id && x.id.indexOf('ans:') === 0 && x.id.indexOf('honest_pass') === -1);
  if (ans) return ans;
  for (const id of ENGAGE2) { const c = list.find(x => x && x.id === id); if (c) return c; }
  for (const id of DEFLECT) { const c = list.find(x => x && x.id === id); if (c) return c; }
  const react = list.find(x => x && x.id === 'dlg:react');
  if (react && turn < 6) return react;
  return list.find(x => x && x.id === 'leave') || null;
}

(async () => {
  const { Game } = await loadGame({ seed: 42003, mode: 'r55-stage0-probe', fullTelemetry: true });
  await setupGame(Game);
  const log = (s) => console.log(s);
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  for (const id of roster) {
    try { const n = Game.npcNeeds(id); if (n) n.hunger = 85; } catch (e) {}
  }
  // Find a villager whose fresh sitting selects ask_favor.
  let vid = null;
  for (const id of roster) {
    try {
      const comm = Game.npcComm ? Game.npcComm(id) : { level: 'full' };
      if (comm.level === 'none') continue;
      const r = Game.startConvo(id);
      if (!r || !r.line) { try { Game.endConvo(id, 'done'); } catch (e) {} continue; }
      const c = Game.convoGet(id);
      if (c && c.want && c.want.id === 'ask_favor') { vid = id; break; }
      try { Game.endConvo(id, 'done'); } catch (e) {}
    } catch (e) {}
  }
  if (!vid) { console.log('PROBE-INCONCLUSIVE: no ask_favor villager in the setup roster'); process.exit(1); }
  // Clear any seed the finder sitting planted, so construction B starts fresh.
  try { delete (Game.state.village.convoSeeds || {})[vid]; } catch (e) {}
  if (WHICH === 'BG') {
    try {
      Game.state.village.trust = Game.state.village.trust || {};
      Game.state.village.trust[vid] = 100;
      log(`trust fixture: trust[${vid}] read-back=${Game.state.village.trust[vid]} (goal-share threshold at most 60)`);
    } catch (e) { log(`trust fixture error: ${e && e.message}`); }
  }
  const favor = Game.convoGetFavor ? Game.convoGetFavor(vid) : null;
  log(`villager=${Game.displayName(vid)} (${vid}) goal=${Game.npcGoal ? Game.npcGoal(vid) : '?'} favorId=${favor ? favor.id : 'none'} favorKind=${favor ? favor.kind : 'none'} favorState=${favor ? favor.state : 'none'}`);

  function runLedger() { try { return Game.convoRunLedger ? Game.convoRunLedger() : []; } catch (e) { return []; } }
  function seedNow() { try { return (Game.state.village.convoSeeds || {})[vid] || null; } catch (e) { return null; } }
  function clearSeed() { try { delete (Game.state.village.convoSeeds || {})[vid]; } catch (e) {} }

  // Achieve one stage-0 sitting for this construction. Returns the opening
  // result + attempt count, or null if the cap is hit.
  function achieveStage0(label) {
    for (let attempt = 1; attempt <= 14; attempt++) {
      if (WHICH === 'A' || WHICH === 'A2') {
        try { Game.convoPlantSeed(vid, { wantId: 'ask_favor', note: 'last time', favorId: favor ? favor.id : null }); } catch (e) { log(`plant error: ${e && e.message}`); }
      }
      let r = null;
      try { r = Game.startConvo(vid); } catch (e) { log(`startConvo error: ${e && e.message}`); clearSeed(); continue; }
      if (!r || !r.line) { try { Game.endConvo(vid, 'done'); } catch (e) {} clearSeed(); continue; }
      const c = Game.convoGet(vid);
      const w = (c && c.want) || {};
      log(`${label} attempt ${attempt}: want=${w.id || 'none'} stage=${w.stage || 0} fromSeed=${!!w.fromSeed} thread=${c.thread || '?'} opener=${JSON.stringify(r.line)}`);
      if (w.id === 'ask_favor' && (w.stage || 0) === 0) return { r, attempt };
      if (WHICH === 'A2' && w.id === 'ask_favor' && (w.stage || 0) === 2 && c.thread !== 'want') return { r, attempt };
      // Surfaced (or another want): bank the exact opener line in the run
      // ledger so a repeat variant blocks next time, close, clear any seed
      // the close planted, and try again.
      try { runLedger().push(r.line); } catch (e) {}
      try { Game.endConvo(vid, 'done'); } catch (e) {}
      clearSeed();
    }
    return null;
  }

  function drive(label, pickerName) {
    const c0 = Game.convoGet(vid);
    const w0 = (c0 && c0.want) || {};
    log(`--- ${label} picker=${pickerName} open: want=${w0.id || 'none'} stage=${w0.stage || 0} fromSeed=${!!w0.fromSeed} thread=${c0.thread || '?'}`);
    let r = null;
    // The opening line was already logged by achieveStage0; re-read it from
    // the transcript for the drive log.
    const t0 = (c0.transcript || []).filter(e => e.who === 'them').map(e => String(e.text));
    log(`THEM(open): ${t0.length ? t0[t0.length - 1] : '(none)'}`);
    for (let turn = 0; turn < 8; turn++) {
      let choices = [];
      try { choices = Game.convoChoices(vid) || []; } catch (e) { choices = []; }
      const cc = Game.convoGet(vid) || {};
      const cw = cc.want || {};
      let menuLen = '?';
      try { const m = Game.convoWantMenu ? Game.convoWantMenu(vid) : []; menuLen = Array.isArray(m) ? m.length : '?'; } catch (e) { menuLen = 'err'; }
      log(`turn ${turn}: offered=[${choices.map(x => x && x.id).filter(Boolean).join(',')}] thread=${cc.thread || '?'} want=${cw.id || 'none'} stage=${cw.stage || 0} wantMenuLen=${menuLen}`);
      let pick = null;
      if (pickerName === 'subject-first' && turn === 0) pick = choices.find(x => x && x.id === 'dlg:subject') || null;
      if (pickerName === 'subject-first' && turn === 1) pick = choices.find(x => x && x.id === 'alive:want:ask_favor') || null;
      if (!pick) pick = panelPick(choices, turn);
      if (!pick || pick.id === 'leave') { log('YOU: (leave)'); break; }
      log(`YOU: [${pick.id}] ${pick.label}`);
      try { r = Game.convoTurn(vid, pick.id); } catch (e) { log(`convoTurn error: ${e && e.message}`); break; }
      if (r && r.line) log(`THEM: ${r.line}`);
      const w = (Game.convoGet(vid).want) || {};
      log(`(want=${w.id || 'none'} stage=${w.stage || 0})`);
      if (r && r.ended) { log('(ended by engine)'); break; }
    }
    let endR = null;
    try { endR = Game.endConvo(vid, 'done'); } catch (e) { log(`endConvo error: ${e && e.message}`); }
    if (endR && endR.line) log(`closing line: ${endR.line}`);
    const c2 = Game.convoGet(vid) || {};
    const w2 = c2.want || {};
    const sd = seedNow();
    log(`want final: id=${w2.id || 'none'} stage=${w2.stage || 0} resolution=${w2.resolution || 'none'} seedAfterClose=${sd ? JSON.stringify(sd) : 'none'}`);
    clearSeed();
    return { finalStage: w2.stage || 0, resolution: w2.resolution || 'none', seedAfter: !!sd };
  }

  const s1 = achieveStage0('construction-' + WHICH + '-panel');
  if (!s1) { console.log(`CONSTRUCTION-${WHICH}-FAILED: no stage-0 sitting within 14 attempts`); process.exit(1); }
  const dPanel = drive('construction-' + WHICH + '-panel', 'panel');
  const s2 = achieveStage0('construction-' + WHICH + '-subject');
  if (!s2) { console.log(`CONSTRUCTION-${WHICH}-FAILED(second sitting): no stage-0 sitting within 14 attempts`); process.exit(1); }
  const dSubject = drive('construction-' + WHICH + '-subject', 'subject-first');
  log(`VERDICT construction=${WHICH} panel: finalStage=${dPanel.finalStage} resolution=${dPanel.resolution} seedAfter=${dPanel.seedAfter}`);
  log(`VERDICT construction=${WHICH} subject-first: finalStage=${dSubject.finalStage} resolution=${dSubject.resolution} seedAfter=${dSubject.seedAfter}`);
  console.log('PROBE-COMPLETE');
})().catch(e => { console.log('PROBE-ERROR: ' + (e && e.stack || e)); process.exit(1); });
