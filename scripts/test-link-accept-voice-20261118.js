#!/usr/bin/env node
// test-link-accept-voice-20261118.js — proof test for the journey-scale
// r243 raise-accept echo fix (lane A, leg 3).
//
// THE DEFECT (r242 Q4, 13/13 on the band — arm B and arm A alike):
//   YOU: "All right. Let's ask them."
//   THEM: "All right — let's ask them." You carry the proposal to X.
// The NPC's reply to a link-raise acceptance opened by repeating the
// player's choice label verbatim. The NPC added nothing of their own at
// the moment the proposal was carried. Canon (docs/CONVERSATIONS.md):
// "Replies belong to the spoken exchange" — and "Both voice backends
// receive complete quoted speech only; narration remains visible and
// silent" (the carry is narration, not the NPC's speech).
//
// THE FIX (src/js/bond-initiation.js, one task): `acceptLinkRaise`
// returns a voiced line — the NPC's own words, keyed to how they know
// the village (the lore `how` linkRaiseLine already uses: visit /
// seen-nearby / rumor / told / default), naming the village — and
// `bondTurn` link:accept uses it, following the `acceptBondProposal`
// precedent ('"Stick together, then." They look steadier already.').
// A small pool per `how` (2 lines each) is picked first-unledgered via
// the `convoRunLedger` (the `declineLine` precedent), so the same
// villager does not repeat one accept line across villages. The lore
// tell, the `proposeLink` call, telemetry, cooldowns, and the player's
// choice label are byte-identical.
//
// PROOF SHAPE: staged link raises per `how` through the real verb;
// the NPC line's quoted speech must NOT normalize-equal the player's
// choice, must name the village, and must keep the carry narration.
// The sitting routing (bondTurn via convoTurn) must return the voiced
// line with the player's choice as the YOU entry. RED before the fix
// (the NPC line normalizes equal to the player's choice), GREEN after.
//
// Usage: node scripts/test-link-accept-voice-20261118.js
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('journey-scale-r243-link-accept-voice');

const VILLAGE_A = 'village_test_a'; // Thornfield
const VILLAGE_B = 'village_test_b'; // Stonebridge
const VILLAGE_C = 'village_test_c'; // Aldergate
const VILLAGE_D = 'village_test_d'; // Millbrook
const PLAYER_CHOICE = '"All right. Let\'s ask them."';

// normalize: lowercase, strip all punctuation/space — so the old parrot
// ("All right — let's ask them.") and the player's choice ("All right.
// Let's ask them.") normalize to the same string, while any voiced line
// normalizes to something else.
function norm(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}
function quotedSpeech(line) {
  const m = String(line || '').match(/"([^"]*)"/);
  return m ? m[1] : '';
}
const PLAYER_NORM = norm(quotedSpeech(PLAYER_CHOICE));

(async () => {
  const Game = await K.load({ seed: 243100 });
  const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
  const { competent } = require('./policies/competent');

  // fresh(): a new expedition, departed, with a roster. Adds two fake
  // other-villages so linkAcceptLine names real villages, and returns
  // the speaking (shared-language) non-scholar roster villagers.
  // (r132 idiom, verbatim.)
  function fresh() {
    K.newRun(Game);
    Game.state.otherVillages = Game.state.otherVillages || [];
    for (const [id, name] of [[VILLAGE_A, 'Thornfield'], [VILLAGE_B, 'Stonebridge'], [VILLAGE_C, 'Aldergate'], [VILLAGE_D, 'Millbrook']]) {
      if (!Game.state.otherVillages.some(v => v && v.id === id)) {
        Game.state.otherVillages.push({ id, name });
      }
    }
    const roster = (Game.state.village && Game.state.village.roster) || [];
    const scholarId = Game.villagerId;
    const others = roster.filter(v => v && v !== scholarId);
    const speaking = others.filter(vid => {
      try { const c = Game.commLevel(vid); return c && c.level !== 'none'; } catch (e) { return false; }
    });
    if (speaking.length < 2) throw new Error('fresh run has <2 speaking non-scholar roster members: ' + JSON.stringify(roster));
    return { speaking, scholarId, roster: others };
  }
  function day() { try { return (Game.state.scholar || {}).day || 1; } catch (e) { return 1; } }
  // findKnower: a villager who can stage a raise for the village — the
  // test-bond-initiation idiom: knows the village (lore), holds the
  // build_standing drive (>= 1), carries village trust >= 20, no
  // pending raise, no undelivered talk request.
  function findKnower(speaking, used, villageId, how) {
    for (let i = 0; i < speaking.length; i++) {
      const id = speaking[i];
      if (used.has(id)) continue;
      try {
        if (((Game.state.village.sick || {})[id])) continue;
        if (Game.pendingLinkRaise && Game.pendingLinkRaise(id)) continue;
        const treq = ((Game.state.village.talkRequests || {})[id]);
        if (treq && !treq.delivered) continue;
        if (Game.recordVillageLore) Game.recordVillageLore(id, villageId, how ? { how } : {});
        const w = Game.vgoalWeights ? Game.vgoalWeights(id) : null;
        if (w && (w.build_standing || 0) >= 1) return id;
      } catch (e) { /* try the next villager */ }
    }
    return null;
  }
  function armKnower(id) {
    try { Game.state.village.trust = Game.state.village.trust || {}; Game.state.village.trust[id] = 25; } catch (e) {}
  }

  // ---- 0. The echo detector itself (the instrument, pinned) ----
  T.section('0. Echo detector pins the old parrot');
  T.ok('old THEM line normalizes equal to the player choice',
    norm(quotedSpeech('"All right — let\'s ask them." You carry the proposal to Thornfield.')) === PLAYER_NORM,
    'norm=' + norm(quotedSpeech('"All right — let\'s ask them."')));
  T.ok('a voiced line does NOT normalize equal',
    norm(quotedSpeech('"Good. Tell them I remember their fires — and that we\'re ready."')) !== PLAYER_NORM);

  // ---- 1. Verb level, per `how` ----
  // A short competent run first so villager goals (vgoalWeights) exist —
  // the test-bond-initiation idiom.
  T.section('1. acceptLinkRaise voices the accept per how');
  let f = fresh();
  try {
    await quietLog(async function () { await runDays(Game, competent, { days: 2, manifest: undefined, sampleEvery: 30 }); });
  } catch (e) { T.ok('2-day competent run populates goals', false, 'ERR: ' + (e && e.message)); }
  const used = new Set();
  // One knower covers all four hows: the stage/accept cooldown is per
  // villager+village, so a fresh village per how keeps each stage legal
  // (a fresh knower per how does not exist on most seeds — the
  // test-bond-initiation idiom finds one knower, not four).
  const HOWS = [
    ['visit', VILLAGE_A, 'Thornfield', /remember their fires|sat by their fires/i],
    ['seen-nearby', VILLAGE_B, 'Stonebridge', /watched their fires|close enough to trust/i],
    ['rumor', VILLAGE_C, 'Aldergate', /heard of them|word on them/i],
    ['told', VILLAGE_D, 'Millbrook', /heard of them|word on them/i],
  ];
  let covered = 0;
  let knower = findKnower(f.speaking, used, VILLAGE_A, 'visit');
  if (!knower) { console.log('  (skip section 1: no villager with build_standing >= 1)'); }
  for (const [how, villageId, villageName, marker] of HOWS) {
    if (!knower) break;
    // Record this how's lore for this village, then stage + accept.
    try { if (Game.recordVillageLore) Game.recordVillageLore(knower, villageId, { how }); } catch (e) {}
    armKnower(knower);
    const staged = Game.stageLinkRaise(knower, villageId);
    T.ok('stage link raise (' + how + ')', !!(staged && staged.vid === knower && staged.villageId === villageId),
      'staged=' + JSON.stringify(staged));
    if (!staged) continue;
    const acc = Game.acceptLinkRaise(knower);
    T.ok('accept link raise resolves (' + how + ')', acc.ok === true, 'acc=' + JSON.stringify(acc).slice(0, 120));
    T.ok('accept still carries the proposal (' + how + ')', acc.proposed === true);
    T.ok('accept consumes the pending (' + how + ')', Game.pendingLinkRaise(knower) == null);
    if (!acc.line) { T.ok('accept returns a voiced line (' + how + ')', false, 'line missing'); continue; }
    const speech = quotedSpeech(acc.line);
    T.ok('NPC line is quoted speech (' + how + ')', speech.length > 0, 'line=' + acc.line);
    T.ok('NPC line does NOT echo the player choice (' + how + ')', norm(speech) !== PLAYER_NORM,
      'speech=' + speech);
    T.ok('NPC line does not open with the player words (' + how + ')', speech.indexOf('All right') !== 0,
      'speech=' + speech);
    T.ok('NPC line names the village (' + how + ')', acc.line.indexOf(villageName) !== -1, 'line=' + acc.line);
    T.ok('carry narration kept (' + how + ')', acc.line.indexOf('You carry the proposal to ' + villageName + '.') !== -1,
      'line=' + acc.line);
    T.ok('NPC line is voiced for how=' + how, marker.test(speech), 'speech=' + speech);
    covered++;
  }
  T.ok('at least 3 of 4 hows covered by staged raises', covered >= 3, 'covered=' + covered + '/4');

  // Default pool: a villager with no lore for the village — the direct
  // call, since staging requires lore to exist.
  T.section('1b. Default pool (no lore how)');
  f = fresh();
  const dv = f.speaking.find(vid => {
    try { const lore = (Game.villageLoreOf ? Game.villageLoreOf(vid) : {}) || {}; return !lore[VILLAGE_A]; } catch (e) { return false; }
  });
  if (dv) {
    // A missing export (pre-fix tree) is a FAIL here, not a FATAL —
    // the RED run must reach the routing section too.
    let line = null, lineErr = null;
    try { line = Game.linkAcceptLine(dv, VILLAGE_A, 'Thornfield'); } catch (e) { lineErr = e; }
    T.ok('default line returned', typeof line === 'string' && line.length > 0, 'line=' + line + (lineErr ? ' ERR:' + (lineErr && lineErr.message) : ''));
    if (typeof line === 'string' && line.length > 0) {
      T.ok('default line does NOT echo the player choice', norm(quotedSpeech(line)) !== PLAYER_NORM, 'line=' + line);
      T.ok('default line names the village', line.indexOf('Thornfield') !== -1, 'line=' + line);
      T.ok('default line keeps the carry narration', line.indexOf('You carry the proposal to Thornfield.') !== -1, 'line=' + line);
    }
  } else { T.ok('a lore-less villager exists for the default pool', false, 'all speaking villagers know ' + VILLAGE_A); }

  // ---- 2. No-pending paths ----
  T.section('2. No-pending accept is a clean refusal, not a crash');
  f = fresh();
  const np = f.speaking[0];
  const noAcc = Game.acceptLinkRaise(np);
  T.ok('accept with no pending is not ok', noAcc.ok === false, 'acc=' + JSON.stringify(noAcc));
  T.ok('accept with no pending carries no line', noAcc.line == null);

  // ---- 3. Sitting routing: bondTurn returns the voiced line ----
  // Loop speaking villagers until one both opens a sitting AND holds
  // the build_standing drive (either alone is common; both together is
  // what the routing needs — never fake the drive for the sitting
  // villager).
  T.section('3. bondTurn routes link:accept through the voiced line');
  f = fresh();
  let routed = false;
  let vid = null;
  for (const cand of f.speaking) {
    if (routed) break;
    try {
      const opened = Game.talkTo(cand);
      if (!opened) continue;
      const c = Game.convoGet(cand);
      if (!c || !c.active) { try { Game.endConvo(cand, 'left'); } catch (e) {} continue; }
      vid = cand;
      const knower = findKnower([vid], new Set(), VILLAGE_A, 'visit');
      if (!knower) { try { Game.endConvo(vid, 'left'); } catch (e) {} vid = null; continue; }
      armKnower(vid);
      const staged = Game.stageLinkRaise(vid, VILLAGE_A);
      T.ok('stage link raise in the sitting', !!(staged && staged.villageId === VILLAGE_A),
        'staged=' + JSON.stringify(staged));
      if (!staged) { try { Game.endConvo(vid, 'left'); } catch (e) {} vid = null; continue; }
      // Speak the raise so the gate offers the choice (r132 idiom).
      try { Game.sayLine(vid, '"I\'ve been to Thornfield. I know their fires. We should link with them — we\'d be stronger together."', { tag: 'linkraise', linkBeat: true }); } catch (e) {}
      const bm = (Game.bondChoices(vid) || []).map(ch => ch && ch.id).filter(Boolean);
      T.ok('bondChoices offers link:accept once spoken', bm.indexOf('link:accept') !== -1, 'bondChoices=' + JSON.stringify(bm));
      let res = null;
      try { res = Game.convoTurn(vid, 'link:accept'); } catch (e) { res = { err: String((e && e.message) || e) }; }
      T.ok('convoTurn link:accept returns a line', !!(res && res.line), 'res=' + JSON.stringify(res).slice(0, 160));
      if (res && res.line) {
        const speech = quotedSpeech(res.line);
        T.ok('routed NPC line does NOT echo the player choice', norm(speech) !== PLAYER_NORM, 'line=' + res.line);
        T.ok('routed NPC line names the village', res.line.indexOf('Thornfield') !== -1, 'line=' + res.line);
        const you = ((res.transcript || []).filter(t => t.who === 'you').map(t => t.text));
        T.ok('transcript YOU entry is the player choice', you.indexOf(PLAYER_CHOICE) !== -1, 'you=' + JSON.stringify(you));
        const them = ((res.transcript || []).filter(t => t.who === 'them').map(t => t.text));
        // The LAST them entry is the accept reply itself (the turn
        // appends YOU then THEM) — it must be the voiced line, not a
        // parrot. (An any-entry read is vacuous: the sitting's opener
        // would satisfy it on the pre-fix tree too.)
        const lastThem = them.length ? them[them.length - 1] : '';
        T.ok('transcript THEM entry is the voiced line', norm(quotedSpeech(lastThem)) !== PLAYER_NORM && lastThem.indexOf('Thornfield') !== -1,
          'lastThem=' + JSON.stringify(lastThem).slice(0, 200));
      }
      T.ok('routing consumes the pending', Game.pendingLinkRaise(vid) == null);
      routed = true;
      try { Game.endConvo(vid, 'left'); } catch (e) {}
    } catch (e) { try { Game.endConvo(cand, 'left'); } catch (e2) {} }
  }
  T.ok('a sitting villager with the drive was found (routing exercised)', routed);

  // ---- 4. Ledger pick: a ledgered first line yields the second ----
  T.section('4. First-unledgered pick (declineLine precedent)');
  f = fresh();
  const lv = f.speaking[0];
  let first = null, firstErr = null;
  try { first = Game.linkAcceptLine(lv, VILLAGE_A, 'Thornfield'); } catch (e) { firstErr = e; }
  T.ok('first line returned', typeof first === 'string' && first.length > 0, 'first=' + first + (firstErr ? ' ERR:' + (firstErr && firstErr.message) : ''));
  if (typeof first !== 'string' || !first.length) { T.ok('ledgered first line yields a different line', false, 'no first line'); T.ok('second line is still voiced (no echo)', false, 'no first line'); }
  else {
    const firstKey = (() => {
      try { const ch = Game.convoSplitBeats(first); return String((ch && ch[0]) || first).trim(); }
      catch (e) { return first; }
    })();
    try {
      const v = Game.state.village || {};
      v.convoRunLines = v.convoRunLines || [];
      if (v.convoRunLines.indexOf(firstKey) === -1) v.convoRunLines.push(firstKey);
    } catch (e) {}
    let second = null, secondErr = null;
    try { second = Game.linkAcceptLine(lv, VILLAGE_A, 'Thornfield'); } catch (e) { secondErr = e; }
    T.ok('ledgered first line yields a different line', second !== first, 'first=' + first + ' second=' + second + (secondErr ? ' ERR:' + (secondErr && secondErr.message) : ''));
    T.ok('second line is still voiced (no echo)', typeof second === 'string' && norm(quotedSpeech(second)) !== PLAYER_NORM, 'second=' + second);
  }

  T.done();
})().catch(e => { console.error('FATAL ' + (e && e.stack ? e.stack : e)); process.exitCode = 1; });
