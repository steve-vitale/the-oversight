#!/usr/bin/env node
// test-journey-scale-r133-trapline-20261112.js — proof test for the
// journey-scale r133 trap-line answer fix (lane A, leg 3).
//
// THE DEFECT (r131 Q4, carried; r132 Q2-secondary; fired twice — Tarek
// r131, Mario seed 132101 d120 r132):
//   The NPC (no shared words) mimes "come with me" toward a spot, and the
//   menu offers no way to answer. The policy nods 4 times and leaves. The
//   invitation evaporates.
//
// MECHANISM (read in code this run — three links, all verified):
//   1. `nvOpen` (conversation.js:8452-8468) SHOWS the mime and sets
//      `inv.spoken = true` — but the gesture goes through `this.say()` +
//      a transcript push, never through `sayLine` with tag 'invitation'.
//   2. `betrayalChoices` (betrayal.js:4351-4360) DOES prepend
//      `betrayal:accept`/`betrayal:decline` whenever a pending invite
//      exists (the no-shared-words gate below it returns the list WITH
//      them).
//   3. `convoMenuPage` (conversation.js:4632 + the else-if strip) strips
//      `betrayal:accept`/`betrayal:decline` whenever no owns rule fires
//      and `c.spokenBeat?.tag !== 'invitation'` — and the gesture never
//      sets that tag. The strip bites because the outermost
//      villager-agency convoChoices wrapper re-runs convoMenuPage on the
//      FULL combined menu (extra.concat(base)), after the betrayal wrap
//      has prepended the choices. So the accept/decline are offered by
//      one layer and removed by the next. The mime is shown and
//      unanswerable.
// Canon (docs/CONVERSATIONS.md:104): "Replies belong to the spoken
// exchange. A question, invitation, price or live request owns its
// decision menu." And (:142): "No shared language → the conversation is
// nonverbal (gesture choices with varying outcomes)."
//
// THE FIX (one task, one commit): gesture answers, in the nonverbal menu,
// gated on the mime having been shown this sitting:
//   1. `conversation.js` buildMenu, nonverbal branch (~4954): when a
//      pending invite exists AND `inv.spoken` (the mime was shown at open
//      this sitting), prepend `{ id: 'nv:accept', label: '(follow their
//      gesture — go with them)' }` and `{ id: 'nv:decline', label:
//      '(shake your head — not this time)' }`. No pending, or
//      pending-but-unshown (staged mid-sitting, never mimed) → no
//      choices: an unshown ask is never answered (INVITATION HONESTY r7,
//      same rule as r132).
//   2. `conversation.js` convoTurn nv: override (~8547): intercept
//      `nv:accept`/`nv:decline` before the winddown-delivery block;
//      resolve through the existing handlers (`acceptInvite` — plot-ambush
//      spring, sick veto, `resolveInvite` walk — / `declineInvite` — trust
//      −1, decline line, pocketed thing), with gesture `youSaid`
//      ('(follow their gesture)' / '(shake your head)' — never an English
//      "Sure." in a no-words sitting), `diegeticAct` sayLine, `exchanges++`,
//      and the same `convoMaybeWinddown` tail `betrayalTurn`'s finish runs.
//      Mark substantive, like the verbal accept path. No `resolveInvite`
//      line changes, no demand/number/bar changes.
//   3. `conversation.js` convoMenuPage rank function: `nv:accept` /
//      `nv:decline` rank 0 (same as `betrayal:`) so a long nonverbal menu
//      (interpreter present) cannot page the mime's answer off page 1.
//
// PROOF SHAPE: a pending invite staged before open — the mime shown —
// must offer `nv:accept`/`nv:decline` in the full menu (RED before the
// fix, GREEN after), and picking one must consume the pending invite
// through the existing handlers (RED/GREEN). Every path that must NOT
// offer the answer (no pending; pending but unshown) stays silent
// (GREEN both engines). The verbal invitation path is untouched (GREEN
// both engines — regression guard). §8 pins the Q2 (betrayal sibling)
// mechanism: the turn-0 menu restriction proves the invite beat was
// spoken this sitting (GREEN both engines).
//
// Usage: node scripts/test-journey-scale-r133-trapline-20261112.js
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('journey-scale-r133-trapline');

const TRAP_DEF = 'traps'; // spot 'the trap line' — the namesake
const AIR_DEF = 'air'; // spoken label 'Come get air with me. ...'

(async () => {
  const Game = await K.load({ seed: 133100 });

  function day() { try { return (Game.state.scholar || {}).day || 1; } catch (e) { return 1; } }
  // fresh(): a new expedition, departed, with a roster. Returns the
  // speaking (shared-language) and silent (no shared language)
  // non-scholar roster villagers.
  function fresh() {
    K.newRun(Game);
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
  // stageInvite mirrors betrayal.js:512's state write exactly
  // (inviteHistory().pending = { defId, day }) — the defect shape is a
  // pending invite the NPC is about to mime at open.
  function stageInvite(vid, defId) {
    const hist = Game.inviteHistory(vid);
    hist.pending = { defId, day: day() };
    return hist.pending;
  }
  function pending(vid) { try { return Game.pendingInvite(vid); } catch (e) { return null; } }
  function convo(vid) { try { return Game.convoGet(vid); } catch (e) { return null; } }
  function fullMenu(vid) {
    try { return (Game.convoChoices(vid) || []).map(ch => ch && ch.id).filter(Boolean); } catch (e) { return ['ERR:' + (e && e.message)]; }
  }
  function transcriptText(vid) {
    const c = convo(vid);
    return ((c && c.transcript) || []).map(e => String(e && e.text || '')).join(' ');
  }
  function trustOf(vid) { try { return ((Game.state.village.trust || {})[vid] ?? 10); } catch (e) { return 10; } }
  // openSilent: the first no-shared-language villager whose talkTo opens
  // a nonverbal sitting. Loops fresh runs (roster re-rolls) until one
  // appears — a fresh roster usually has one, but the loop makes the
  // test independent of a single roll.
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
  function inviteLabel(vid, inv) {
    try {
      const l = Game.inviteLabelFor(vid, inv);
      if (l) return String(l);
    } catch (e) {}
    try {
      const def = (Game.INVITE_DEFS() || []).find(d => d.id === (inv && inv.defId));
      if (def) return String(def.label);
    } catch (e) {}
    return '';
  }

  // ---- 1. The defect: mime shown, no gesture answer ----
  T.section('1. Mime shown at open — the defect (Mario r132)');
  let vid = openSilent();
  T.ok('opened a nonverbal sitting', !!vid, 'vid=' + vid);
  if (vid) {
    stageInvite(vid, TRAP_DEF);
    // The mime is shown by nvOpen at open — but this sitting opened
    // BEFORE the invite was staged, so re-open to get the mime path.
    try { Game.endConvo(vid, 'left'); } catch (e) {}
    let opened = null;
    try { opened = Game.talkTo(vid); } catch (e) { opened = null; }
    T.ok('re-opened the sitting with the invite pending', !!opened, 'vid=' + vid);
    const inv = pending(vid);
    T.ok('invite still pending at open', !!inv, 'pending=' + JSON.stringify(inv));
    T.ok('the mime was shown (inv.spoken set by nvOpen)', !!(inv && inv.spoken),
      'spoken=' + (inv && inv.spoken));
    T.ok('the mime text is in the transcript', transcriptText(vid).indexOf('mime walking') !== -1,
      'transcript=' + transcriptText(vid).slice(0, 240));
    const fm = fullMenu(vid);
    T.ok('full menu offers nv:accept while the mime stands', fm.indexOf('nv:accept') !== -1,
      'convoChoices=' + JSON.stringify(fm));
    T.ok('full menu offers nv:decline while the mime stands', fm.indexOf('nv:decline') !== -1,
      'convoChoices=' + JSON.stringify(fm));
    // The English verbal answers must NOT leak into a no-words sitting:
    // the player shares no words, so "All right. Let's go." is not
    // something they can say.
    T.ok('full menu does NOT offer the English betrayal:accept', fm.indexOf('betrayal:accept') === -1,
      'convoChoices=' + JSON.stringify(fm));
    try { Game.endConvo(vid, 'left'); } catch (e) {}
  }

  // ---- 2. Accepting the mime walks the trap line ----
  T.section('2. nv:accept consumes the pending invite (the walk happens)');
  vid = openSilent();
  T.ok('opened a nonverbal sitting', !!vid, 'vid=' + vid);
  if (vid) {
    stageInvite(vid, TRAP_DEF);
    try { Game.endConvo(vid, 'left'); } catch (e) {}
    try { Game.talkTo(vid); } catch (e) {}
    const before = (Game.inviteHistory(vid).outcomes || []).length;
    let res = null;
    try { res = Game.convoTurn(vid, 'nv:accept'); } catch (e) { res = 'ERR:' + (e && e.message); }
    T.ok('nv:accept turn ran', !!res && typeof res === 'object', 'res=' + (res && res.line ? String(res.line).slice(0, 80) : String(res).slice(0, 80)));
    T.ok('the pending invite is consumed', !pending(vid), 'pending=' + JSON.stringify(pending(vid)));
    const after = (Game.inviteHistory(vid).outcomes || []).length;
    T.ok('the walk outcome is recorded in the invite history', after === before + 1,
      'outcomes ' + before + ' -> ' + after);
    const youLines = ((convo(vid) && convo(vid).transcript) || []).filter(e => e.who === 'you').map(e => String(e.text));
    T.ok('no English YOU line ("Sure.") in a no-words sitting',
      !youLines.some(t => t.indexOf('Sure') !== -1), 'youLines=' + JSON.stringify(youLines.slice(-3)));
    T.ok('the gesture answer is in the transcript',
      youLines.some(t => t.indexOf('follow') !== -1), 'youLines=' + JSON.stringify(youLines.slice(-3)));
    try { Game.endConvo(vid, 'left'); } catch (e) {}
  }

  // ---- 3. Declining the mime costs trust, consumes the invite ----
  T.section('3. nv:decline consumes the pending invite (trust −1)');
  vid = openSilent();
  T.ok('opened a nonverbal sitting', !!vid, 'vid=' + vid);
  if (vid) {
    stageInvite(vid, TRAP_DEF);
    try { Game.endConvo(vid, 'left'); } catch (e) {}
    try { Game.talkTo(vid); } catch (e) {}
    try { Game.state.village.trust[vid] = 20; } catch (e) {}
    const beforeTrust = trustOf(vid);
    let res = null;
    try { res = Game.convoTurn(vid, 'nv:decline'); } catch (e) { res = 'ERR:' + (e && e.message); }
    T.ok('nv:decline turn ran', !!res && typeof res === 'object', 'res=' + (res && res.line ? String(res.line).slice(0, 80) : String(res).slice(0, 80)));
    T.ok('the pending invite is consumed', !pending(vid), 'pending=' + JSON.stringify(pending(vid)));
    T.ok('trust drops by exactly 1', trustOf(vid) === beforeTrust - 1,
      'trust ' + beforeTrust + ' -> ' + trustOf(vid));
    const youLines = ((convo(vid) && convo(vid).transcript) || []).filter(e => e.who === 'you').map(e => String(e.text));
    T.ok('no English YOU line ("Not this time.") in a no-words sitting',
      !youLines.some(t => t.indexOf('Not this time') !== -1), 'youLines=' + JSON.stringify(youLines.slice(-3)));
    try { Game.endConvo(vid, 'left'); } catch (e) {}
  }

  // ---- 4. Control: no pending invite — no gesture answers ----
  T.section('4. Control — no pending invite, no nv:accept/nv:decline');
  vid = openSilent();
  T.ok('opened a nonverbal sitting', !!vid, 'vid=' + vid);
  if (vid) {
    T.ok('no invite pending', !pending(vid), 'pending=' + JSON.stringify(pending(vid)));
    const fm = fullMenu(vid);
    T.ok('no nv:accept without a pending invite', fm.indexOf('nv:accept') === -1,
      'convoChoices=' + JSON.stringify(fm));
    T.ok('no nv:decline without a pending invite', fm.indexOf('nv:decline') === -1,
      'convoChoices=' + JSON.stringify(fm));
    T.ok('the gesture menu is still there (nod/smile/pointself/listen)',
      fm.indexOf('nv:nod') !== -1 && fm.indexOf('nv:listen') !== -1,
      'convoChoices=' + JSON.stringify(fm));
    try { Game.endConvo(vid, 'left'); } catch (e) {}
  }

  // ---- 5. Pending but unshown — never answered (honesty guard) ----
  T.section('5. Pending but unshown — no answer (INVITATION HONESTY)');
  vid = openSilent();
  T.ok('opened a nonverbal sitting', !!vid, 'vid=' + vid);
  if (vid) {
    T.ok('no invite pending at open', !pending(vid), 'pending=' + JSON.stringify(pending(vid)));
    // Stage the invite AFTER open: nvOpen already ran, so the mime was
    // never shown this sitting (inv.spoken false) — the ask must not be
    // answerable until it is heard.
    stageInvite(vid, TRAP_DEF);
    const inv = pending(vid);
    T.ok('invite pending but unshown (inv.spoken false)', !!(inv && !inv.spoken),
      'spoken=' + (inv && inv.spoken));
    const fm = fullMenu(vid);
    T.ok('no nv:accept while the mime is unshown', fm.indexOf('nv:accept') === -1,
      'convoChoices=' + JSON.stringify(fm));
    T.ok('no nv:decline while the mime is unshown', fm.indexOf('nv:decline') === -1,
      'convoChoices=' + JSON.stringify(fm));
    try { Game.endConvo(vid, 'left'); } catch (e) {}
  }

  // ---- 6. Per-sitting scope: leave unanswered, next sitting re-mimes ----
  T.section('6. Per-sitting scope — the mime returns next sitting');
  vid = openSilent();
  T.ok('opened a nonverbal sitting', !!vid, 'vid=' + vid);
  if (vid) {
    stageInvite(vid, TRAP_DEF);
    try { Game.endConvo(vid, 'left'); } catch (e) {}
    try { Game.talkTo(vid); } catch (e) {}
    T.ok('sitting 1: the mime was shown', !!(pending(vid) && pending(vid).spoken),
      'spoken=' + (pending(vid) && pending(vid).spoken));
    const fm1 = fullMenu(vid);
    T.ok('sitting 1: nv:accept offered', fm1.indexOf('nv:accept') !== -1,
      'convoChoices=' + JSON.stringify(fm1));
    try { Game.endConvo(vid, 'left'); } catch (e) {}
    T.ok('the invite survives leaving unanswered', !!pending(vid),
      'pending=' + JSON.stringify(pending(vid)));
    T.ok('inv.spoken resets at endConvo (re-spoken next sitting)', !(pending(vid) && pending(vid).spoken),
      'spoken=' + (pending(vid) && pending(vid).spoken));
    try { Game.talkTo(vid); } catch (e) {}
    T.ok('sitting 2: the mime is shown again', !!(pending(vid) && pending(vid).spoken),
      'spoken=' + (pending(vid) && pending(vid).spoken));
    const fm2 = fullMenu(vid);
    T.ok('sitting 2: nv:accept offered again', fm2.indexOf('nv:accept') !== -1,
      'convoChoices=' + JSON.stringify(fm2));
    try { Game.endConvo(vid, 'left'); } catch (e) {}
  }

  // ---- 7. Verbal-path regression guard ----
  // Fresh day-1 openers almost always own the reply, so the invite is
  // usually HELD at open (c.invitePending) rather than spoken. The held
  // beat is queued by buildMenu (queueTraderIntro) once no question is
  // pending, and spoken by the continuer ('goon', tag 'invitation') —
  // drive the sitting forward honestly (answer the pending question
  // first — it owns its answers — then take the continuer) and assert
  // the menu matches the spoken state at each step. Never invoke an
  // unoffered handler: the drive only picks choices the menu offers.
  T.section('7. Verbal path untouched — menu matches the spoken state');
  {
    // driveToSpoken: play offered choices until the held invite is
    // spoken (spokenBeat.tag === 'invitation') or no forward move
    // exists. Answers a pending question first, then takes 'goon'.
    const driveToSpoken = (svid, maxTurns) => {
      for (let t = 0; t < maxTurns; t++) {
        const c = convo(svid);
        if (c && c.spokenBeat && c.spokenBeat.tag === 'invitation') return true;
        const fm = fullMenu(svid);
        if (fm.indexOf('goon') !== -1) { try { Game.convoTurn(svid, 'goon'); } catch (e) {} continue; }
        const ans = fm.find(id => id.indexOf('ans:') === 0 && id.indexOf('honest_pass') === -1);
        if (ans) { try { Game.convoTurn(svid, ans); } catch (e) {} continue; }
        const gq = fm.find(id => id.indexOf('gq:') === 0 && id.indexOf('honest_pass') === -1);
        if (gq) { try { Game.convoTurn(svid, gq); } catch (e) {} continue; }
        const react = fm.find(id => id.indexOf('react:') === 0);
        if (react) { try { Game.convoTurn(svid, react); } catch (e) {} continue; }
        const engage = fm.find(id => ['dlg:commit', 'dlg:help', 'dlg:heed', 'dlg:stay', 'dlg:comfort', 'dlg:details', 'dlg:askwhy', 'dlg:more'].indexOf(id) !== -1);
        if (engage) { try { Game.convoTurn(svid, engage); } catch (e) {} continue; }
        return false;
      }
      const c = convo(svid);
      return !!(c && c.spokenBeat && c.spokenBeat.tag === 'invitation');
    };
    const f = fresh();
    let observed = { spoken: 0, held: 0, spokenViaGoon: 0 };
    for (const svid of f.speaking.slice(0, 4)) {
      stageInvite(svid, AIR_DEF);
      let opened = null;
      try { opened = Game.talkTo(svid); } catch (e) { opened = null; }
      if (!opened) { try { Game.endConvo(svid, 'left'); } catch (e) {} continue; }
      const checkRestricted = (where) => {
        const c = convo(svid);
        const tag = c && c.spokenBeat && c.spokenBeat.tag;
        const fm = fullMenu(svid);
        T.ok(where + ': spokenBeat.tag is invitation', tag === 'invitation', 'tag=' + tag);
        T.ok(where + ': menu offers betrayal:accept', fm.indexOf('betrayal:accept') !== -1,
          'vid=' + svid + ' convoChoices=' + JSON.stringify(fm));
        T.ok(where + ': menu is restricted to the invite answers',
          fm.every(id => ['betrayal:accept', 'betrayal:decline', 'leave', 'silence'].indexOf(id) !== -1),
          'vid=' + svid + ' convoChoices=' + JSON.stringify(fm));
      };
      const c0 = convo(svid);
      const tag0 = c0 && c0.spokenBeat && c0.spokenBeat.tag;
      const held0 = !!(c0 && c0.invitePending);
      const fm0 = fullMenu(svid);
      if (tag0 === 'invitation') {
        observed.spoken++;
        checkRestricted('spoken at open');
      } else if (held0) {
        observed.held++;
        T.ok('held invite: menu offers NO betrayal:accept yet', fm0.indexOf('betrayal:accept') === -1,
          'vid=' + svid + ' convoChoices=' + JSON.stringify(fm0));
        if (driveToSpoken(svid, 6)) {
          observed.spokenViaGoon++;
          checkRestricted('spoken via drive');
        } else {
          console.log('  (held branch, drive did not reach the spoken invite for ' + svid + ')');
        }
      } else {
        T.ok('invite is either spoken or held at open', false,
          'vid=' + svid + ' tag=' + tag0 + ' held=' + held0 + ' convoChoices=' + JSON.stringify(fm0));
      }
      try { Game.endConvo(svid, 'left'); } catch (e) {}
      if (observed.held && (observed.spoken || observed.spokenViaGoon)) break;
    }
    T.ok('held branch observed', observed.held > 0, 'observed=' + JSON.stringify(observed));
    T.ok('spoken branch observed (at open or via drive)', (observed.spoken + observed.spokenViaGoon) > 0,
      'observed=' + JSON.stringify(observed));
    console.log('  (verbal branches observed: ' + JSON.stringify(observed) + ')');
  }

  // ---- 8. Q2 mechanism pin: the restriction proves the beat was spoken ----
  // Same drive as §7: reach a spoken invite (at open, or by answering
  // the pending question and taking the continuer) and check the label
  // is IN this sitting's transcript — the r132 reading ("only the grief
  // line") came from a driver log that prints only r0.line (the opener),
  // not the beats spoken at open.
  T.section('8. Q2 pin (Thabo r132) — restriction implies the beat was spoken');
  {
    const driveToSpoken = (svid, maxTurns) => {
      for (let t = 0; t < maxTurns; t++) {
        const c = convo(svid);
        if (c && c.spokenBeat && c.spokenBeat.tag === 'invitation') return true;
        const fm = fullMenu(svid);
        if (fm.indexOf('goon') !== -1) { try { Game.convoTurn(svid, 'goon'); } catch (e) {} continue; }
        const ans = fm.find(id => id.indexOf('ans:') === 0 && id.indexOf('honest_pass') === -1);
        if (ans) { try { Game.convoTurn(svid, ans); } catch (e) {} continue; }
        const gq = fm.find(id => id.indexOf('gq:') === 0 && id.indexOf('honest_pass') === -1);
        if (gq) { try { Game.convoTurn(svid, gq); } catch (e) {} continue; }
        const react = fm.find(id => id.indexOf('react:') === 0);
        if (react) { try { Game.convoTurn(svid, react); } catch (e) {} continue; }
        const engage = fm.find(id => ['dlg:commit', 'dlg:help', 'dlg:heed', 'dlg:stay', 'dlg:comfort', 'dlg:details', 'dlg:askwhy', 'dlg:more'].indexOf(id) !== -1);
        if (engage) { try { Game.convoTurn(svid, engage); } catch (e) {} continue; }
        return false;
      }
      const c = convo(svid);
      return !!(c && c.spokenBeat && c.spokenBeat.tag === 'invitation');
    };
    const f = fresh();
    let pinned = false;
    for (const svid of f.speaking.slice(0, 4)) {
      stageInvite(svid, AIR_DEF);
      let opened = null;
      try { opened = Game.talkTo(svid); } catch (e) { opened = null; }
      if (!opened) { try { Game.endConvo(svid, 'left'); } catch (e) {} continue; }
      if (driveToSpoken(svid, 6)) {
        const inv = pending(svid);
        const label = inviteLabel(svid, inv);
        const core = label.replace(/[""]/g, '').slice(0, 18);
        T.ok('invite label is known', core.length > 5, 'label=' + label.slice(0, 60));
        T.ok('the invite label IS in this sitting\'s transcript (the driver log only printed the opener)',
          core && transcriptText(svid).indexOf(core) !== -1,
          'core=' + JSON.stringify(core) + ' transcript=' + transcriptText(svid).slice(0, 300));
        pinned = true;
        try { Game.endConvo(svid, 'left'); } catch (e) {}
        break;
      }
      try { Game.endConvo(svid, 'left'); } catch (e) {}
    }
    T.ok('a spoken-invite sitting was found to pin', pinned, 'pinned=' + pinned);
  }

  T.done();
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(1); });
