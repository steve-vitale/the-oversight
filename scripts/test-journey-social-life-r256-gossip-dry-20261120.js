#!/usr/bin/env node
// test-journey-social-life-r256-gossip-dry-20261120.js — proof test for
// the r256 Arm C fix (journey-social-life r256; the wild F6 dry line on
// social r239: seed 45766, Sigrun Eiriksdottir, C-friendship, day 45 —
// the player asks "What's the word? What should I know?" (ask:gossip)
// and the NPC answers "...Sorry, lost my train of thought.").
//
// THE DEFECT: the ask:gossip turn's line is composed (convoComposeBeat
// prepends a 1-of-3 topic ack) and the DRY2 guard (conversation.js tail,
// journey-social r234) replaces a run-ledger-blocked composed line with
// an exhausted-pool pick — but the pick itself is NEVER checked against
// the ledger. The exhausted pool cycles per villager, not cross-villager,
// so a pick another villager spoke recently is handed to sayLine blocked
// and sayLine dry-replaces it. Two fixed-string pools collide in the
// 48-entry run ledger: the gossip engine's idle admission (3 fixed
// strings) and the exhausted pool (20 fixed strings). The wild sitting
// proves the shape: the same sitting's earlier "What happened?"
// (dlg:more) turn hit the same class — its news beat (the fixed treeline
// sighting line) was run-blocked, so the thread went dry-honest ("That's
// the whole of it. Sorry."); the gossip ask then dried outright because
// its guard replacement was blocked too. The want resolved fine and the
// gossip pool had content (Ingrid gossip served two turns later) — the
// null came from the ledger-blocked fallback, not the want or the pool.
//
// THE FIX (same class as r238 — check the ledger BEFORE handing sayLine
// a line; conversation.js, DRY2 guard): after picking the exhausted
// replacement, walk the pool for a variant convoWouldBlock would NOT
// refuse; if every variant is blocked, speak the pick as STRUCTURAL
// (r169 wind-down class — the honest "I've told you everything I know"
// admission is conversation grammar, not content, so repeating it is not
// parroting).
//
// PROOF SHAPE (real sittings, real sayLine ledger — godpath lib, as the
// r226/r238 proofs): poison the lines through OTHER villagers' sittings
// (cross-villager run ledger, never the test villager's own said lists),
// then ask gossip across fresh sittings. Fixed: every ask speaks —
// gossip, or an exhausted admission — never dry. Unfixed: the blocked
// asks dry (scratch probe: 18/30 dry).
//   1. control: 6 gossip asks unpoisoned — all speak, none dry.
//   2. DISCRIMINATOR: exhausted pool (20) + bare idle composites
//      (3 acks x 3 idle lines) poisoned; 30 trial sittings — 0 dry,
//      and at least one trial speaks an exhausted-pool line (the guard
//      replacement path firing and speaking instead of drying).
//
// STAGING NOTE (r238 pattern): trust is staged to 40 so gossip opens
// (effTrust >= 20); the gossip-seeking pick order (gq: -> ask:gossip ->
// dlg:subject -> want: -> other non-leave) answers the opening curious
// question, then opens the subject menu where ask:gossip lives. Poisoning
// uses sayLine on INACTIVE convos (one throwaway sitting per poisoner to
// create the convo object): it ledgers the line with no sitting chatter,
// so the 48-entry run-ledger window keeps the poison set instead of the
// openers evicting it. The poison set is re-applied before every trial
// sitting (a blocked re-poison costs no ledger slot; an aged-out line is
// re-added), so the set stays live across all 30 trials. One run
// throughout — the ledger must accumulate across trials.
// Usage: node scripts/test-journey-social-life-r256-gossip-dry-20261120.js
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('journey-social-life-r256-gossip-dry');
const fs = require('fs');
const path = require('path');

const DRY_MARK = 'lost my train of thought';
const ACKS = ['"Good question."', '"Huh. Let me think about that."', '"You want to know about that? Okay."'];
const IDLE = ['"Quiet lately. Too quiet, maybe."', '"Nothing new. Which is new, if you think about it."', '"People are keeping to themselves."'];
const EXH = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'characterGen.json'), 'utf8')).convo.exhausted;
const COMPOSITES = [];
for (const a of ACKS) for (const idle of IDLE) COMPOSITES.push(a + ' ' + idle);

(async () => {
  const Game = await K.load({ seed: 256000 });

  function fresh() {
    K.newRun(Game);
    const roster = (Game.state.village && Game.state.village.roster) || [];
    const scholarId = Game.villagerId;
    const others = roster.filter(v => v && v !== scholarId);
    const speaking = others.filter(vid => {
      try { const c = Game.commLevel(vid); return c && c.level !== 'none'; } catch (e) { return false; }
    });
    if (speaking.length < 4) throw new Error('fresh run has fewer than 4 speaking non-scholar roster members');
    return { speaking };
  }
  function convo(vid) { try { return Game.convoGet(vid); } catch (e) { return null; } }
  function openVid(vid) {
    try {
      const opened = Game.talkTo(vid);
      if (!opened) return false;
      const c = convo(vid);
      if (c && c.active) return true;
      try { Game.endConvo(vid, 'left'); } catch (e) {}
    } catch (e) {}
    return false;
  }
  function closeVid(vid) { try { Game.endConvo(vid, 'left'); } catch (e) {} }
  function stageTrust(vid) { try { (Game.state.village.trust = Game.state.village.trust || {})[vid] = 40; } catch (e) {} }
  function inLedger(line) {
    try { const rl = Game.convoRunLedger(); return rl && rl.indexOf(line) !== -1; } catch (e) { return false; }
  }
  function themLines(vid) {
    const c = convo(vid);
    const tr = (c && Array.isArray(c.transcript)) ? c.transcript : [];
    return tr.filter(e => e && e.who === 'them').map(e => String(e.text || ''));
  }
  function pickNext(choices) {
    const isLeave = x => /^(leave|bye|goodbye)/.test(String(x.id || ''));
    return choices.find(x => x && /^gq:/.test(String(x.id || ''))) ||
           choices.find(x => x && String(x.id || '') === 'ask:gossip') ||
           choices.find(x => x && String(x.id || '') === 'dlg:subject') ||
           choices.find(x => x && /^(dlg:help|dlg:details|want:)/.test(String(x.id || ''))) ||
           choices.find(x => x && !isLeave(x) && !/^(goon|recap)$/.test(String(x.id || ''))) ||
           choices.find(x => x && !isLeave(x));
  }
  function driveGossipAsk(vid) {
    for (let t = 0; t < 12; t++) {
      const c = convo(vid);
      if (!c || !c.active) return { asked: false, dry: false, line: null, why: 'ended' };
      let choices = [];
      try { choices = Game.convoChoices(vid) || []; } catch (e) {}
      if (!choices.length) return { asked: false, dry: false, line: null, why: 'no-choices' };
      const pick = pickNext(choices);
      if (!pick || /^(leave|bye|goodbye)/.test(String(pick.id || ''))) return { asked: false, dry: false, line: null, why: 'bye' };
      const before = themLines(vid).length;
      try { Game.convoTurn(vid, pick.id); } catch (e) { return { asked: false, dry: false, line: null, why: 'turn-error:' + e.message }; }
      if (String(pick.id || '') === 'ask:gossip') {
        const after = themLines(vid).slice(before);
        return { asked: true, dry: after.some(x => x.indexOf(DRY_MARK) !== -1), line: after[0] || null };
      }
    }
    return { asked: false, dry: false, line: null, why: 'turn-cap' };
  }
  // poisonAll: (re-)apply the poison set via sayLine on INACTIVE convos —
  // one throwaway sitting per poisoner first creates their convo object.
  // A line already in the ledger counts as poisoned (a blocked re-poison
  // costs no ledger slot); an aged-out line is re-added. Returns how many
  // of the set are in the ledger afterwards.
  function poisonAll(speaking, poisoners) {
    let n = 0;
    for (const line of COMPOSITES.concat(EXH)) {
      if (inLedger(line)) { n++; continue; }
      for (const p of poisoners) {
        try { Game.sayLine(p, line); } catch (e) {}
        if (inLedger(line)) { n++; break; }
      }
    }
    return n;
  }

  // ---- 1. Control — gossip asks unpoisoned: all speak, none dry. ----
  T.section('1. Control — 6 gossip asks unpoisoned: all speak, none dry');
  const f = fresh();
  const V = f.speaking[0];
  const POISONERS = f.speaking.slice(1, 4);
  T.ok('picked a test villager', !!V, 'vid=' + V);
  T.ok('picked 3 poisoner villagers', POISONERS.length === 3, 'n=' + POISONERS.length);
  for (const p of POISONERS) { if (openVid(p)) closeVid(p); }
  T.ok('poisoner convos exist (inactive sayLine ledgers)', (() => {
    try { Game.sayLine(POISONERS[0], '"zz-r256-probe-one."'); } catch (e) { return false; }
    return inLedger('"zz-r256-probe-one."');
  })());
  let ctlAsked = 0, ctlDry = 0;
  for (let i = 0; i < 6; i++) {
    stageTrust(V);
    if (!openVid(V)) continue;
    const r = driveGossipAsk(V);
    closeVid(V);
    if (r.asked) { ctlAsked++; if (r.dry) ctlDry++; }
  }
  T.ok('control asks reached (' + ctlAsked + '/6)', ctlAsked >= 4, 'asked=' + ctlAsked);
  T.ok('control asks never dry', ctlDry === 0, 'dry=' + ctlDry);

  // ---- 2. DISCRIMINATOR — everything blocked: speaks, never dry. ----
  T.section('2. Exhausted pool + idle composites poisoned — 30 gossip asks: 0 dry (wild: Sigrun 45766 d45)');
  const poisoned = poisonAll(f.speaking, POISONERS);
  T.ok('poison set landed in the run ledger (' + poisoned + '/' + (COMPOSITES.length + EXH.length) + ')',
    poisoned === COMPOSITES.length + EXH.length, 'poisoned=' + poisoned);
  let asked = 0, dry = 0, spoke = 0, exhSpoken = 0;
  const dryTrials = [];
  for (let i = 0; i < 30; i++) {
    poisonAll(f.speaking, POISONERS);
    stageTrust(V);
    if (!openVid(V)) continue;
    const r = driveGossipAsk(V);
    closeVid(V);
    if (!r.asked) continue;
    asked++;
    if (r.dry) { dry++; dryTrials.push(i); }
    else {
      spoke++;
      if (r.line && EXH.some(l => r.line.indexOf(l) !== -1)) exhSpoken++;
    }
  }
  T.ok('trial asks reached (' + asked + '/30)', asked >= 20, 'asked=' + asked);
  T.ok('trial asks NEVER dry', dry === 0, 'dry=' + dry + ' trials=' + JSON.stringify(dryTrials));
  T.ok('at least one blocked ask speaks an exhausted-pool line (guard replacement speaks)',
    exhSpoken >= 1, 'exhSpoken=' + exhSpoken + ' spoke=' + spoke);

  T.done();
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(1); });
