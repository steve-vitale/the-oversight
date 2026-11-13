#!/usr/bin/env node
// test-journey-scale-r134-raisewindow-20261112.js — proof test for the
// journey-scale r134 spoken-raise answer-window fix (lane A, leg 3).
//
// THE DEFECT (r132/r133 carried; fired 3x in the r133 band — Henry
// seed 133101 d10 'traps', Fidele d94 'carry', Henry d111 'show'):
//   THEM: "I've heard good things about Stonebridge. We should link
//     with them — we'd be stronger together."   (THE LINK RAISE, spoken)
//   THEM: "Walk my trap line with me? Extra hands, extra eyes."
//     (a follow-on beat — an invitation label, spoken right after)
//   THEM: "Sure. I'll be around."   (the leftexit line — 0 turns played)
//   No YOU line: the player heard the raise and was never offered a way
//   to answer it. The policy (takes link:accept first whenever offered,
//   5 turns) never saw it. The raise survives pending — the bookkeeping
//   survives, the human moment dies.
//
// MECHANISM (CORRECTED — read the wrap chain in code, then confirmed
// by the unfixed-engine run; the first version of this comment had it
// backwards): two defects, one ask-window.
//   (A) THE FLAG LIE (the wild defect, Henry 133101 d10): the talk
//   request carries the raise as the opener (spoken verbatim), and the
//   pending invite is spoken right after — but `startConvo`
//   (conversation.js:5996) runs `if (openerOwnsReply || inviteBeat ||
//   bondBeat) c.linkPending = linkBeat; else if (openerCarriedLink)
//   recordStagedBeat(linkBeat, 'linkraise');` — because the invite beat
//   exists, the hold fires INSTEAD of the record, so `c.linkRaiseSpoken`
//   stays FALSE even though the raise is in the transcript. `bondChoices`
//   (bond-initiation.js:997) gates on `pendingLinkRaise &&
//   linkRaiseSpoken`, so it offers nothing and the menu has no `link:`.
//   (Bond mirror at 5981-5982.) The r153 OPENER-CARRIED SKIP comment
//   intends the record, but the hold above it shadows the record
//   whenever another beat exists.
//   (B) TAG-OVERWRITE CROWDING: once the flag IS set (raise spoken via
//   sayLine), `bondChoices` prepends `link:` — but a follow-on beat
//   overwrites `c.spokenBeat.tag`, so branch 5 (`linkraise`) no longer
//   fires and the want-owns branch crowds the menu with competing
//   choices. The `link:` answers are present but the menu is not
//   exclusively the raise's. (The invite's answers can be stripped the
//   same way: the invite is spoken FIRST among the ask beats, so any
//   later beat overwrites its tag.)
//   WRAP CHAIN (verified): buildMenu → convoMenuPage (filter #1) →
//   betrayal wrap prepends `betrayal:` → agency wrap re-runs
//   convoMenuPage (filter #2) → bond wrap prepends `bond:`/`link:`
//   with NO re-filter → party/truth. So `link:`/`bond:` are NEVER
//   stripped by the filter; the filter only ever sees `betrayal:` +
//   base. The `link:` absence in the wild is the FLAG (A), not the
//   filter. The union's job for `link:`/`bond:` is EXCLUSIVITY
//   (strip competing base choices by flag, not by last-beat tag);
//   for `betrayal:` it is PRESERVATION (an invite whose tag was
//   overwritten keeps its answers). Canon (docs/CONVERSATIONS.md):
//   "Replies belong to the spoken exchange. A question, invitation,
//   price or live request owns its decision menu."
//
// THE FIX (one task, one commit):
//   0. `conversation.js` `startConvo` — THE HOIST: check
//      `openerCarriedBond` / `openerCarriedLink` BEFORE the hold
//      condition in both beat blocks (record the flag, do NOT hold —
//      the line was already spoken as the opener; holding it would let
//      the continuer re-speak it verbatim).
//   1. `convo-beats.js` `convoRecordSpokenBeat`: the invite joins the
//      r132 per-sitting spoken flags — tag 'invitation' sets
//      `c.inviteSpoken`, reset in `startConvo` beside linkRaiseSpoken /
//      bondProposalSpoken. (The existing `inv.spoken` can NOT serve:
//      it is set at label resolution, BEFORE the hold-or-speak decision,
//      so a HELD — queued, unheard — invite already carries it; keying
//      on it would offer betrayal:accept for an invite never heard,
//      evicting a pending question's answers — an invitation-honesty
//      regression, r7. `c.inviteSpoken` is set only by the actual
//      emission through `sayLine`.)
//   2. `conversation.js` `convoMenuPage`: branches 3–5 (invitation /
//      bondproposal / linkraise) become ONE union branch, keyed on the
//      per-sitting spoken flags: inviteSpoken / bondSpoken / linkSpoken,
//      each AND its pending. If any is true (and the sitting is not
//      nonverbal — the mime answers through nv:accept/nv:decline,
//      r133), the menu offers the UNION of the spoken asks' answers
//      (betrayal:accept/decline, bond:accept/decline,
//      link:accept/decline) + leave/silence. A single spoken ask
//      behaves exactly as its old branch did. The r132 invariant holds:
//      the flags are set ONLY when the ask's line is actually spoken.
//   No demand, number, bar, or line changes; no new system, no new file.
//
// PROOF SHAPE: §1b (Henry end-to-end through startConvo) and §2
// (tag-overwrite exact-set) are the RED/GREEN sections. §1/§3/§6 are
// GREEN-both pins (direct sayLine staging sets the flags, so they
// cannot hit the flag bug). §4/§5/§7/§8/§9/§10 are GREEN-both guards.
// Sections that stage an invite or bond open a NON-QUESTION sitting
// (openSpeakingNoQuestion): a question sitting would trip the agency
// reactive-budget trim, which can split a live ask's accept/decline
// pair (villager-agency.js ~1810-1860 — a SEPARATE, latent defect,
// probed this run, NOT fixed here; see the prereg) and would measure
// the trim, not the ask window.
//
// Usage: node scripts/test-journey-scale-r134-raisewindow-20261112.js
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('journey-scale-r134-raisewindow');

const VILLAGE_A = 'village_test_a'; // Thornfield (fresh text per section)
const VILLAGE_B = 'village_test_b'; // Stonebridge (fresh text per section)
const RAISE_A = '"I\'ve heard good things about Thornfield. We should link with them — we\'d be stronger together."';
const RAISE_B = '"I\'ve heard good things about Stonebridge. We should link with them — we\'d be stronger together."';
const BOND_LINE = '"Can I ask you something? ... I want us to stick together. Properly. Watch each other\'s backs."';

(async () => {
  const Game = await K.load({ seed: 134100 });

  function fresh() {
    K.newRun(Game);
    Game.state.otherVillages = Game.state.otherVillages || [];
    for (const [id, name] of [[VILLAGE_A, 'Thornfield'], [VILLAGE_B, 'Stonebridge']]) {
      if (!Game.state.otherVillages.some(v => v && v.id === id)) {
        Game.state.otherVillages.push({ id, name });
      }
    }
    const roster = (Game.state.village && Game.state.village.roster) || [];
    const scholarId = Game.villagerId;
    const others = roster.filter(v => v && v !== scholarId);
    const comm = (vid) => { try { const c = Game.commLevel(vid); return c && c.level; } catch (e) { return '?'; } };
    return {
      speaking: others.filter(vid => comm(vid) !== 'none'),
      silent: others.filter(vid => comm(vid) === 'none'),
      scholarId,
    };
  }
  function day() { try { return (Game.state.scholar || {}).day || 1; } catch (e) { return 1; } }
  // stageRaise/stageBond mirror stageLinkRaise/stageBondProposal's state
  // writes (bond-initiation.js), minus the talk request — the ask is
  // pending with NO talk-request opener carrying it.
  function stageRaise(vid, villageId, line) {
    const v = Game.state.village; v.linkRaises = v.linkRaises || {};
    v.linkRaises[vid] = { vid, villageId, day: day(), kind: 'link', line };
  }
  // stageRaiseWithRequest mirrors stageLinkRaise in full, INCLUDING the
  // talk request — the opener carries the raise verbatim (the Henry
  // shape: the raise is heard as the opener, recordStagedBeat flags it).
  function stageRaiseWithRequest(vid, villageId, line) {
    stageRaise(vid, villageId, line);
    const v = Game.state.village; v.talkRequests = v.talkRequests || {};
    v.talkRequests[vid] = { line: '__NAME__: ' + line, day: day(), linkRaise: true };
  }
  function stageBond(vid) {
    const v = Game.state.village; v.bondRequests = v.bondRequests || {};
    v.bondRequests[vid] = { vid, day: day(), kind: 'bond', line: BOND_LINE };
  }
  // stageInvite mirrors betrayal.js:512's state write exactly.
  function stageInvite(vid, defId) {
    const hist = Game.inviteHistory(vid);
    hist.pending = { defId, day: day() };
    return hist.pending;
  }
  function pending(vid) { try { return Game.pendingInvite(vid); } catch (e) { return null; } }
  function pendingRaise(vid) { try { return Game.pendingLinkRaise(vid); } catch (e) { return null; } }
  function convo(vid) { try { return Game.convoGet(vid); } catch (e) { return null; } }
  function fullMenu(vid) {
    try { return (Game.convoChoices(vid) || []).map(ch => ch && ch.id).filter(Boolean); } catch (e) { return ['ERR:' + (e && e.message)]; }
  }
  function bondMenu(vid) {
    try { return (Game.bondChoices(vid) || []).map(ch => ch && ch.id).filter(Boolean); } catch (e) { return ['ERR:' + (e && e.message)]; }
  }
  function transcriptText(vid) {
    const c = convo(vid);
    return ((c && c.transcript) || []).map(e => String(e && e.text || '')).join(' ');
  }
  function raiseSpoken(vid) { const c = convo(vid); return !!(c && c.linkRaiseSpoken); }
  function bondSpoken(vid) { const c = convo(vid); return !!(c && c.bondProposalSpoken); }
  function inviteSpoken(vid) { const c = convo(vid); return !!(c && c.inviteSpoken); }
  function inviteLabel(vid, inv) {
    try { const l = Game.inviteLabelFor(vid, inv); if (l) return String(l); } catch (e) {}
    return '';
  }
  function openAnySpeaking(speaking) {
    for (const vid of speaking) {
      try {
        const opened = Game.talkTo(vid);
        if (!opened) continue;
        const c = convo(vid);
        if (c && c.active) return vid;
        try { Game.endConvo(vid, 'left'); } catch (e) {}
      } catch (e) { /* try the next villager */ }
    }
    return null;
  }
  // openNoQuestion: fresh runs until a non-question speaking sitting
  // opens (same retry shape as openSilent below). Day-1 openers are
  // often questions, and the RNG stream advances per fresh() — a single
  // fresh run may have no non-question opener at all, which is not a
  // test failure, just a bad draw.
  function openNoQuestion() {
    for (let attempt = 0; attempt < 6; attempt++) {
      const f = fresh();
      const vid = openSpeakingNoQuestion(f.speaking);
      if (vid) return vid;
    }
    return null;
  }
  // openSpeakingNoQuestion: like openAnySpeaking, but the opener must not
  // leave a live question (no pendingQ / reactiveQ / genericQ). A question
  // sitting trips the agency reactive-budget trim, which can split a live
  // ask's accept/decline pair (villager-agency.js ~1810-1860 — a separate,
  // latent defect, probed this run, NOT fixed here) — sections that stage
  // an invite or bond use this helper so they measure the ask window,
  // not the trim. A question sitting is skipped, not answered.
  function openSpeakingNoQuestion(speaking) {
    for (const vid of speaking) {
      try {
        const opened = Game.talkTo(vid);
        if (!opened) continue;
        const c = convo(vid);
        if (c && c.active) {
          if (c.pendingQ || c.reactiveQ || c.genericQ) {
            try { Game.endConvo(vid, 'left'); } catch (e) {}
            continue;
          }
          return vid;
        }
        try { Game.endConvo(vid, 'left'); } catch (e) {}
      } catch (e) { /* try the next villager */ }
    }
    return null;
  }
  function openSilent() {
    for (let attempt = 0; attempt < 6; attempt++) {
      const f = fresh();
      for (const vid of f.silent) {
        try {
          const opened = Game.talkTo(vid);
          if (!opened) continue;
          const c = convo(vid);
          if (c && c.active && c.thread === 'nonverbal') return vid;
          try { Game.endConvo(vid, 'left'); } catch (e) {}
        } catch (e) { /* try the next villager */ }
      }
    }
    return null;
  }
  function setEquals(a, b) {
    const sa = (a || []).slice().sort().join('|');
    const sb = (b || []).slice().sort().join('|');
    return sa === sb;
  }

  // ---- 1. PIN (not the Henry shape): raise + invite both spoken via
  // direct sayLine — direct staging sets the flags, so this cannot hit
  // the flag bug; it pins that two spoken asks stay answerable together.
  // GREEN both engines. The Henry shape is §1b. ----
  T.section('1. Raise + invite both spoken via sayLine — pin');
  {
    const vid = openNoQuestion();
    T.ok('opened a speaking sitting', !!vid, 'vid=' + vid);
    if (vid) {
      stageRaise(vid, VILLAGE_A, RAISE_A);
      stageInvite(vid, 'traps');
      let said1 = null, said2 = null;
      try { said1 = Game.sayLine(vid, RAISE_A, { tag: 'linkraise', linkBeat: true }); } catch (e) { said1 = 'ERR:' + (e && e.message); }
      T.ok('raise spoken via sayLine (not blocked)', !!said1, 'said=' + String(said1).slice(0, 60));
      T.ok('linkRaiseSpoken is set', raiseSpoken(vid), 'linkRaiseSpoken=' + raiseSpoken(vid));
      const label = inviteLabel(vid, pending(vid));
      T.ok('invite label resolves', !!label, 'label=' + String(label).slice(0, 60));
      if (label) {
        try { said2 = Game.sayLine(vid, label, { inviteBeat: true, tag: 'invitation' }); } catch (e) { said2 = 'ERR:' + (e && e.message); }
        T.ok('invite spoken via sayLine (not blocked)', !!said2, 'said=' + String(said2).slice(0, 60));
        // (no inviteSpoken assertion here — the new flag is pinned by §1b;
        // this section is a GREEN-both pin on the menu, not the flag)
      }
      const fm = fullMenu(vid);
      T.ok('menu offers link:accept after the invite overwrote the tag', fm.indexOf('link:accept') !== -1,
        'convoChoices=' + JSON.stringify(fm));
      T.ok('menu offers link:decline too', fm.indexOf('link:decline') !== -1,
        'convoChoices=' + JSON.stringify(fm));
      T.ok('menu still offers betrayal:accept (the invite stays answerable)', fm.indexOf('betrayal:accept') !== -1,
        'convoChoices=' + JSON.stringify(fm));
      T.ok('menu still offers betrayal:decline too', fm.indexOf('betrayal:decline') !== -1,
        'convoChoices=' + JSON.stringify(fm));
      try { Game.endConvo(vid, 'left'); } catch (e) {}
    }
  }

  // ---- 1b. End-to-end: the Henry shape through startConvo ----
  T.section('1b. Henry shape end-to-end — talk-request opener + staged invite');
  {
    const f = fresh();
    let vid = null;
    for (const cand of f.speaking) {
      stageRaiseWithRequest(cand, VILLAGE_A, RAISE_A);
      stageInvite(cand, 'traps');
      let opened = null;
      try { opened = Game.talkTo(cand); } catch (e) { opened = null; }
      if (!opened) { try { Game.endConvo(cand, 'left'); } catch (e) {} continue; }
      const c = convo(cand);
      if (c && c.active) { vid = cand; break; }
      try { Game.endConvo(cand, 'left'); } catch (e) {}
    }
    T.ok('opened a sitting with the raise as the talk-request opener', !!vid, 'vid=' + vid);
    if (vid) {
      const tt = transcriptText(vid);
      T.ok('the raise line is in the opening transcript', tt.indexOf('We should link with') !== -1,
        'transcript=' + tt.slice(0, 240));
      T.ok('the invite label is in the opening transcript', tt.indexOf('trap line') !== -1,
        'transcript=' + tt.slice(0, 240));
      T.ok('linkRaiseSpoken is set (opener-carried)', raiseSpoken(vid), 'linkRaiseSpoken=' + raiseSpoken(vid));
      T.ok('inviteSpoken is set (invite beat spoken after)', inviteSpoken(vid), 'inviteSpoken=' + inviteSpoken(vid));
      const fm = fullMenu(vid);
      T.ok('menu offers link:accept (the raise stays answerable)', fm.indexOf('link:accept') !== -1,
        'convoChoices=' + JSON.stringify(fm));
      T.ok('menu offers betrayal:accept (the invite stays answerable)', fm.indexOf('betrayal:accept') !== -1,
        'convoChoices=' + JSON.stringify(fm));
      try { Game.endConvo(vid, 'left'); } catch (e) {}
    }
  }

  // ---- 2. Tag-overwrite consistency: raise spoken, then a want-thread
  // beat is ACTUALLY SPOKEN (not just poked) — the follow-on overwrites
  // spokenBeat.tag, so branch 5 cannot fire and the want-owns branch
  // crowds the menu on unfixed code. RED on unfixed (exact-set only),
  // GREEN on fixed (the union owns by flag). ----
  T.section('2. Raise spoken, then a want-thread beat — the raise still owns');
  {
    const vid = openNoQuestion();
    T.ok('opened a speaking sitting', !!vid, 'vid=' + vid);
    if (vid) {
      stageRaise(vid, VILLAGE_B, RAISE_B);
      let said = null;
      try { said = Game.sayLine(vid, RAISE_B, { tag: 'linkraise', linkBeat: true }); } catch (e) { said = 'ERR:' + (e && e.message); }
      T.ok('raise spoken via sayLine', !!said, 'said=' + String(said).slice(0, 60));
      T.ok('linkRaiseSpoken is set', raiseSpoken(vid), 'linkRaiseSpoken=' + raiseSpoken(vid));
      // A follow-on want beat is SPOKEN after the raise (the wild shape:
      // a want line spoken after the raise, thread 'want' stage 1 — the
      // want-owns branch would crowd the raise answers on unfixed code).
      // The first version of this section only POKED thread/want without
      // speaking a beat, so spokenBeat.tag stayed 'linkraise' and branch 5
      // fired — the section passed vacuously on unfixed. The sayLine is
      // what overwrites the tag; without it there is no crowding to fix.
      let said2 = null;
      try { said2 = Game.sayLine(vid, '"The traps need checking before the light goes."', { tag: 'want' }); } catch (e) { said2 = 'ERR:' + (e && e.message); }
      T.ok('follow-on want beat spoken (not blocked)', !!said2, 'said=' + String(said2).slice(0, 60));
      T.ok('spokenBeat.tag is no longer linkraise', (convo(vid) && convo(vid).spokenBeat && convo(vid).spokenBeat.tag) !== 'linkraise',
        'tag=' + (convo(vid) && convo(vid).spokenBeat && convo(vid).spokenBeat.tag));
      const c = convo(vid);
      if (c) { c.thread = 'want'; c.want = { id: 'traps_help', stage: 1 }; }
      const fm = fullMenu(vid);
      T.ok('menu still offers link:accept under the want-owns branch', fm.indexOf('link:accept') !== -1,
        'convoChoices=' + JSON.stringify(fm));
      T.ok('menu is exactly the raise answers + leave/silence', setEquals(fm, ['link:accept', 'link:decline', 'leave', 'silence']),
        'convoChoices=' + JSON.stringify(fm));
      try { Game.endConvo(vid, 'left'); } catch (e) {}
    }
  }

  // ---- 3. Bond mirror: proposal + invite both spoken — pin (bond: arrives
  // via the prepend, which the filter never touches). GREEN both engines. ----
  T.section('3. Bond proposal + invite both spoken — the union (bond mirror)');
  {
    const vid = openNoQuestion();
    T.ok('opened a speaking sitting', !!vid, 'vid=' + vid);
    if (vid) {
      stageBond(vid);
      stageInvite(vid, 'air');
      let said1 = null, said2 = null;
      try { said1 = Game.sayLine(vid, BOND_LINE, { tag: 'bondproposal', bondBeat: true }); } catch (e) { said1 = 'ERR:' + (e && e.message); }
      T.ok('proposal spoken via sayLine', !!said1, 'said=' + String(said1).slice(0, 60));
      T.ok('bondProposalSpoken is set', bondSpoken(vid), 'bondProposalSpoken=' + bondSpoken(vid));
      const label = inviteLabel(vid, pending(vid));
      T.ok('invite label resolves', !!label, 'label=' + String(label).slice(0, 60));
      if (label) {
        try { said2 = Game.sayLine(vid, label, { inviteBeat: true, tag: 'invitation' }); } catch (e) { said2 = 'ERR:' + (e && e.message); }
        T.ok('invite spoken via sayLine', !!said2, 'said=' + String(said2).slice(0, 60));
      }
      const fm = fullMenu(vid);
      T.ok('menu offers bond:accept after the invite overwrote the tag', fm.indexOf('bond:accept') !== -1,
        'convoChoices=' + JSON.stringify(fm));
      T.ok('menu offers bond:decline too', fm.indexOf('bond:decline') !== -1,
        'convoChoices=' + JSON.stringify(fm));
      T.ok('menu still offers betrayal:accept', fm.indexOf('betrayal:accept') !== -1,
        'convoChoices=' + JSON.stringify(fm));
      T.ok('menu still offers betrayal:decline too', fm.indexOf('betrayal:decline') !== -1,
        'convoChoices=' + JSON.stringify(fm));
      try { Game.endConvo(vid, 'left'); } catch (e) {}
    }
  }

  // ---- 4. Unspoken raise does NOT leak into the union ----
  T.section('4. Raise unspoken + invite spoken — no link:accept (r132 holds)');
  {
    const vid = openNoQuestion();
    T.ok('opened a speaking sitting', !!vid, 'vid=' + vid);
    if (vid) {
      stageRaise(vid, VILLAGE_A, RAISE_A);
      stageInvite(vid, 'show');
      T.ok('raise not spoken yet', !raiseSpoken(vid), 'linkRaiseSpoken=' + raiseSpoken(vid));
      const label = inviteLabel(vid, pending(vid));
      T.ok('invite label resolves', !!label, 'label=' + String(label).slice(0, 60));
      if (label) {
        try { Game.sayLine(vid, label, { inviteBeat: true, tag: 'invitation' }); } catch (e) {}
      }
      // (no inviteSpoken assertion here — the new flag is pinned by §1b;
      // this section guards the r132 invariant: an unspoken raise is
      // never offered, whatever the invite does)
      const fm = fullMenu(vid);
      T.ok('menu offers betrayal:accept (the invite was heard)', fm.indexOf('betrayal:accept') !== -1,
        'convoChoices=' + JSON.stringify(fm));
      T.ok('menu offers NO link:accept (the raise was never heard)', fm.indexOf('link:accept') === -1,
        'convoChoices=' + JSON.stringify(fm));
      T.ok('menu offers NO link:decline either', fm.indexOf('link:decline') === -1,
        'convoChoices=' + JSON.stringify(fm));
      try { Game.endConvo(vid, 'left'); } catch (e) {}
    }
  }

  // ---- 5. Control: nothing pending — no ask answers ----
  T.section('5. Control — nothing pending, no ask answers');
  {
    const f = fresh();
    const vid = openAnySpeaking(f.speaking);
    T.ok('opened a speaking sitting', !!vid, 'vid=' + vid);
    if (vid) {
      T.ok('no raise pending', !pendingRaise(vid), 'pending=' + JSON.stringify(pendingRaise(vid)));
      T.ok('no invite pending', !pending(vid), 'pending=' + JSON.stringify(pending(vid)));
      const fm = fullMenu(vid);
      T.ok('no link:accept without a pending raise', fm.indexOf('link:accept') === -1,
        'convoChoices=' + JSON.stringify(fm));
      T.ok('no bond:accept without a pending proposal', fm.indexOf('bond:accept') === -1,
        'convoChoices=' + JSON.stringify(fm));
      T.ok('no betrayal:accept without a pending invite', fm.indexOf('betrayal:accept') === -1,
        'convoChoices=' + JSON.stringify(fm));
      try { Game.endConvo(vid, 'left'); } catch (e) {}
    }
  }

  // ---- 6. Answering the raise consumes it; the invite survives ----
  T.section('6. link:accept with an invite also spoken — raise consumed, invite survives');
  {
    const vid = openNoQuestion();
    T.ok('opened a speaking sitting', !!vid, 'vid=' + vid);
    if (vid) {
      stageRaise(vid, VILLAGE_A, RAISE_A);
      stageInvite(vid, 'traps');
      try { Game.sayLine(vid, RAISE_A, { tag: 'linkraise', linkBeat: true }); } catch (e) {}
      const label = inviteLabel(vid, pending(vid));
      if (label) { try { Game.sayLine(vid, label, { inviteBeat: true, tag: 'invitation' }); } catch (e) {} }
      const fm = fullMenu(vid);
      T.ok('menu offers link:accept (pin — direct staging sets the flag)', fm.indexOf('link:accept') !== -1,
        'convoChoices=' + JSON.stringify(fm));
      let res = null;
      if (fm.indexOf('link:accept') !== -1) {
        try { res = Game.convoTurn(vid, 'link:accept'); } catch (e) { res = 'ERR:' + (e && e.message); }
        T.ok('link:accept turn ran', !!res && typeof res === 'object', 'res=' + (res && res.line ? String(res.line).slice(0, 80) : String(res).slice(0, 80)));
      }
      T.ok('the pending raise is consumed', !pendingRaise(vid), 'pending=' + JSON.stringify(pendingRaise(vid)));
      T.ok('the pending invite SURVIVES the raise answer', !!pending(vid), 'pending=' + JSON.stringify(pending(vid)));
      try { Game.endConvo(vid, 'left'); } catch (e) {}
    }
  }

  // ---- 7. Invite-only — exactly the betrayal answers (no over-offer) ----
  T.section('7. Invite-only — exactly betrayal:accept/decline/leave/silence');
  {
    const vid = openNoQuestion();
    T.ok('opened a speaking sitting', !!vid, 'vid=' + vid);
    if (vid) {
      stageInvite(vid, 'air');
      const label = inviteLabel(vid, pending(vid));
      if (label) { try { Game.sayLine(vid, label, { inviteBeat: true, tag: 'invitation' }); } catch (e) {} }
      const fm = fullMenu(vid);
      T.ok('menu is exactly the invite answers + leave/silence', setEquals(fm, ['betrayal:accept', 'betrayal:decline', 'leave', 'silence']),
        'convoChoices=' + JSON.stringify(fm));
      try { Game.endConvo(vid, 'left'); } catch (e) {}
    }
  }

  // ---- 8. Raise-only, raise is the last beat — exactly the link answers ----
  T.section('8. Raise-only — exactly link:accept/decline/leave/silence (r132 shape)');
  {
    const f = fresh();
    const vid = openAnySpeaking(f.speaking);
    T.ok('opened a speaking sitting', !!vid, 'vid=' + vid);
    if (vid) {
      stageRaise(vid, VILLAGE_B, RAISE_B);
      try { Game.sayLine(vid, RAISE_B, { tag: 'linkraise', linkBeat: true }); } catch (e) {}
      T.ok('linkRaiseSpoken is set', raiseSpoken(vid), 'linkRaiseSpoken=' + raiseSpoken(vid));
      const fm = fullMenu(vid);
      T.ok('menu is exactly the raise answers + leave/silence', setEquals(fm, ['link:accept', 'link:decline', 'leave', 'silence']),
        'convoChoices=' + JSON.stringify(fm));
      try { Game.endConvo(vid, 'left'); } catch (e) {}
    }
  }

  // ---- 9. R132 regression guard (Claudete): pending raise, beat is not a raise ----
  T.section('9. Claudete guard — pending raise, never spoken, no link:accept');
  {
    const f = fresh();
    const vid = openAnySpeaking(f.speaking);
    T.ok('opened a speaking sitting', !!vid, 'vid=' + vid);
    if (vid) {
      stageRaise(vid, VILLAGE_A, RAISE_A);
      T.ok('raise not spoken', !raiseSpoken(vid), 'linkRaiseSpoken=' + raiseSpoken(vid));
      const bm = bondMenu(vid);
      T.ok('bondChoices offers NO link:accept while the raise is unspoken', bm.indexOf('link:accept') === -1,
        'bondChoices=' + JSON.stringify(bm));
      const fm = fullMenu(vid);
      T.ok('full menu offers NO link:accept while the raise is unspoken', fm.indexOf('link:accept') === -1,
        'convoChoices=' + JSON.stringify(fm));
      try { Game.endConvo(vid, 'left'); } catch (e) {}
    }
  }

  // ---- 10. Nonverbal guard (r133): the mime still answers by gesture ----
  T.section('10. Nonverbal guard — mime shown, nv:accept offered, no betrayal:accept');
  {
    const vid = openSilent();
    T.ok('opened a nonverbal sitting', !!vid, 'vid=' + vid);
    if (vid) {
      stageInvite(vid, 'traps');
      try { Game.endConvo(vid, 'left'); } catch (e) {}
      let opened = null;
      try { opened = Game.talkTo(vid); } catch (e) { opened = null; }
      T.ok('re-opened the sitting with the invite pending', !!opened, 'vid=' + vid);
      const inv = pending(vid);
      T.ok('the mime was shown (inv.spoken set by nvOpen)', !!(inv && inv.spoken),
        'spoken=' + (inv && inv.spoken));
      const fm = fullMenu(vid);
      T.ok('full menu offers nv:accept while the mime stands', fm.indexOf('nv:accept') !== -1,
        'convoChoices=' + JSON.stringify(fm));
      T.ok('full menu offers nv:decline while the mime stands', fm.indexOf('nv:decline') !== -1,
        'convoChoices=' + JSON.stringify(fm));
      T.ok('full menu does NOT offer the English betrayal:accept', fm.indexOf('betrayal:accept') === -1,
        'convoChoices=' + JSON.stringify(fm));
      try { Game.endConvo(vid, 'left'); } catch (e) {}
    }
  }

  T.done();
})().catch(e => { console.error(e); process.exit(1); });
