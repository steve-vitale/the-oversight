#!/usr/bin/env node
// test-landing-r157-commit-menu-residual-20261123.js — proof test for the
// r157 M-PR1 residual fix (journey-landing r157; the r156 filed blank).
//
// THE DEFECT (r156 panel, seed 1375, Landon d26 — transcript-read this run):
// Landon asks plainly for help with the pantry run and at no point is there
// any way to say yes. The favor ends 'stated' with no commit menu ever
// offered. M-PR1 residual 1/27 on r156.
//
// ROOT CAUSE (transcript + code trace, pre-panel): the sitting opens
// pre-empted by a linkraise + betrayal offer, so the want's opener never
// runs — the want sits at stage 0 with no favor attached, thread
// 'request', the favor living only in the ledger (established from an
// earlier sitting, state 'asked', fromSeed). The player picks [dlg:help];
// engageBeat's deferred branch calls the opener, whose follow-up branch
// sets c.want.stage = 2 directly (convo-wants.js ~697-700) and returns
// the follow-up line ("I still need help with the pantry run."). The
// turn handler then calls convoWantEngage(vid, 'engage') — but the stage
// is ALREADY 2, so the r156 thread flip inside the `stage < 2` guard is
// skipped and the thread stays 'request'. The [dlg:more] depth path then
// delivers the favor's depth lines via the request-thread engageBeat
// fallback (conversation.js ~4310) without flipping either, so
// convoWantMenu's coherence gate stays closed for the whole sitting and
// the commit menu never appears. The player asks for more four times,
// hears the whole depth ("That's... pretty much all of it, honestly."),
// winds down ("I should go. You know where to find me.") — no way to say
// yes.
//
// THE FIX (r156's prescription): move the thread flip out of the
// `stage < 2` guard in convoWantEngage — flip whenever engage lands at
// stage 2. One place; the only new behavior is for engages landing when
// the stage was already 2 (the pre-established-favor route), which is
// exactly the defect. The r156 flip already covers every other engage
// caller identically, so no other sitting changes shape.
//
// PROOF SHAPE (real sittings, real sayLine ledger — godpath lib, as the
// r156 test): drain the pantry so a real forage_help need is live.
// Sitting A creates a real favor: a villager whose natural want is
// ask_favor, press dlg:help, the favor is created ('asked') and stored.
// End the conversation. Sitting B reopens the same villager and plants
// the panel-observed state: stage 0, fromSeed, seedFavorId set, NO favor
// attached (the opener was pre-empted), thread 'request'. Press dlg:help
// and read the next menu.
//   1. pre-established favor + request thread: dlg:help states the ask,
//      commit is offered (RED on old code)
//   2. control: the r156 grief route still works (deferred ask, grief
//      thread) — guards the r156 fix against this change (GREEN on old
//      code too)
//   3. unit: convoWantEngage('engage') on a stage-2 + request-thread want
//      moves the thread to 'want' (RED on old code — isolates the fix's
//      mechanism)
//
// Usage: node scripts/test-landing-r157-commit-menu-residual-20261123.js
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('landing-r157-commit-menu-residual');

(async () => {
  const Game = await K.load({ seed: 157100 });

  function fresh() {
    K.newRun(Game);
    // Drain the pantry so a real forage_help need is live (pantryPer 0 <
    // 4000 gate). At haven the villager's belief reads the live pantry
    // (objResourceBelief -> objResourceSee), so the need is genuinely live,
    // not planted.
    const v = Game.state.village;
    v.pantry = [];
    const kcal = (typeof Game.pantryKcalLive === 'function') ? Game.pantryKcalLive(v) : -1;
    const roster = (v.roster || []);
    const scholarId = Game.villagerId;
    const speaking = roster.filter(vid => vid && vid !== scholarId && (() => {
      try { const c = Game.commLevel(vid); return c && c.level !== 'none'; } catch (e) { return false; }
    })());
    // Repeat-meeting staging: the panel's sittings are repeat meetings.
    // First meetings are curiosity-led by design (curious floor 3,
    // ask_favor x0.4 in convoSelectWant).
    for (const vid of speaking) { try { Game.convoGet(vid).count = 2; } catch (e) {} }
    return { kcal, speaking };
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
  function choiceIds(res) {
    try { return (res && Array.isArray(res.choices) ? res.choices : []).map(o => o && o.id).filter(Boolean); } catch (e) { return []; }
  }
  function themText(vid) {
    const c = convo(vid);
    const tr = (c && Array.isArray(c.transcript)) ? c.transcript : [];
    return tr.filter(e => e && e.who === 'them').map(e => String(e.text || '')).join(' ');
  }
  function liveForageNeed(vid) {
    try { const n = Game.convoFindFavorNeed(vid); return n && n.kind === 'forage_help' ? n : null; } catch (e) { return null; }
  }
  // Sitting A: create a real favor. Open sittings until one selects
  // ask_favor naturally, press dlg:help (the favor is created by the
  // opener and the ask is stated), record the stored favor, end the
  // conversation 'left' so the favor stays 'asked' and seeds the next
  // sitting. Returns {vid, favorId} or null with a diagnostic.
  function createFavor(speaking) {
    const tried = [];
    for (const vid of speaking) {
      if (!liveForageNeed(vid)) { tried.push(vid + ':no-need'); continue; }
      if (!openVid(vid)) { tried.push(vid + ':unopenable'); continue; }
      const c = convo(vid);
      const w = c && c.want;
      if (!w || w.id !== 'ask_favor' || !w.def) {
        tried.push(vid + ':want=' + (w && w.id));
        try { Game.endConvo(vid, 'left'); } catch (e) {}
        continue;
      }
      const res = Game.convoTurn(vid, 'dlg:help');
      const c2 = convo(vid);
      const favor = c2 && c2.want && c2.want.favor;
      if (!res || !favor || favor.state !== 'asked') {
        tried.push(vid + ':favor=' + JSON.stringify(favor && { kind: favor.kind, state: favor.state }));
        try { Game.endConvo(vid, 'left'); } catch (e) {}
        continue;
      }
      const favorId = favor.id;
      try { Game.endConvo(vid, 'left'); } catch (e) {}
      return { vid, favorId, tried };
    }
    return { vid: null, favorId: null, tried };
  }
  // Capture the ask_favor def from a sitting that selects it naturally
  // (r156 test's helper, reused for the control + unit sections).
  function captureAskFavorDef(speaking) {
    const tried = [];
    for (const vid of speaking) {
      if (!liveForageNeed(vid)) { tried.push(vid + ':no-need'); continue; }
      if (!openVid(vid)) { tried.push(vid + ':unopenable'); continue; }
      const c = convo(vid);
      const w = c && c.want;
      if (w && w.id === 'ask_favor' && w.def) {
        const def = w.def;
        try { Game.endConvo(vid, 'left'); } catch (e) {}
        return { def, captureVid: vid, tried };
      }
      tried.push(vid + ':want=' + (w && w.id));
      try { Game.endConvo(vid, 'left'); } catch (e) {}
    }
    return { def: null, captureVid: null, tried };
  }
  // Stage the panel-observed deferred shape on a villager with a live need
  // whose natural want is NOT ask_favor: overwrite the want with a stage-0
  // ask_favor and plant the given thread (r156 test's helper, reused for
  // the control section).
  function stageDeferredAsk(speaking, def, thread, excludeVid) {
    for (const vid of speaking) {
      if (vid === excludeVid) continue;
      if (!liveForageNeed(vid)) continue;
      if (!openVid(vid)) continue;
      const c = convo(vid);
      const w = c && c.want;
      if (w && w.id === 'ask_favor') { try { Game.endConvo(vid, 'left'); } catch (e) {} continue; }
      c.want = { id: 'ask_favor', def, stage: 0, fromSeed: false, seedNote: null, seedFavorId: null, seedQid: null };
      c.thread = thread;
      c.pendingQ = null; c.reactiveQ = null; c.genericQ = null;
      return vid;
    }
    return null;
  }

  // ---- 1. Pre-established favor + request thread: engage offers commit. ----
  T.section('1. Pre-established favor on a request thread: dlg:help states the ask, commit is offered');
  let f = fresh();
  T.ok('pantry drained to 0 kcal (live forage_help need)', f.kcal === 0, 'kcal=' + f.kcal);
  T.ok('speaking villagers exist', f.speaking.length > 0, 'n=' + f.speaking.length);
  let created = createFavor(f.speaking);
  T.ok('sitting A created a real favor (state asked)', !!created.vid, 'tried=' + created.tried.join(' | ').slice(0, 400));
  if (created.vid) {
    // The def for the replant: capture it from a fresh natural sitting
    // (the natural want on reopen may be a different want).
    let cap = captureAskFavorDef(f.speaking);
    const def = cap.def;
    T.ok('captured the ask_favor def for the replant', !!def, 'tried=' + (cap.tried || []).join(' | ').slice(0, 200));
    // Reopen the favor's villager and plant the panel state.
    let vid = null;
    if (def && openVid(created.vid)) {
      const c = convo(created.vid);
      let ledger = null;
      try { ledger = Game.convoGetFavor(created.vid); } catch (e) { ledger = null; }
      if (ledger && ledger.id === created.favorId && ledger.state === 'asked') {
        c.want = { id: 'ask_favor', def, stage: 0, fromSeed: true, seedFavorId: created.favorId };
        c.thread = 'request';
        c.pendingQ = null; c.reactiveQ = null; c.genericQ = null;
        vid = created.vid;
      } else {
        try { Game.endConvo(created.vid, 'left'); } catch (e) {}
      }
    }
    T.ok('staged the panel state (stage 0, fromSeed, no favor attached, thread request)', !!vid,
      'vid=' + vid + ' ledger=' + (() => { try { const l = Game.convoGetFavor(created.vid); return l && l.state; } catch (e) { return '?'; } })());
    if (vid) {
      const c = convo(vid);
      T.ok('staged: favor NOT attached (opener pre-empted, lives in ledger)', !(c.want && c.want.favor),
        'favor=' + JSON.stringify(c.want && c.want.favor && { kind: c.want.favor.kind, state: c.want.favor.state }));
      const before = Game.convoWantMenu(vid) || [];
      T.ok('want menu offers dlg:help at stage 0 (r230 surfacing)', before.some(o => o && o.id === 'dlg:help'), 'menu=' + before.map(o => o && o.id).join(','));
      const res = Game.convoTurn(vid, 'dlg:help');
      T.ok('the turn ran', !!res && typeof res === 'object', 'res=' + String(res && res.line || res).slice(0, 80));
      const c2 = convo(vid);
      T.ok('the ask was stated (stage 2)', (c2.want && c2.want.stage) === 2, 'stage=' + (c2.want && c2.want.stage));
      T.ok('the favor record is attached in state asked', !!(c2.want && c2.want.favor && c2.want.favor.state === 'asked'), 'favor=' + JSON.stringify(c2.want && c2.want.favor && { kind: c2.want.favor.kind, state: c2.want.favor.state }));
      T.ok('the spoken line states the pantry ask', /pantry run|need help|help with/i.test(themText(vid)), 'text=' + themText(vid).slice(0, 200));
      T.ok('the want owns the thread after engage', c2.thread === 'want', 'thread=' + c2.thread);
      const ids = choiceIds(res);
      T.ok('the next menu offers dlg:commit', ids.includes('dlg:commit'), 'menu=' + ids.join(','));
      const wm = Game.convoWantMenu(vid) || [];
      T.ok('convoWantMenu offers dlg:commit', wm.some(o => o && o.id === 'dlg:commit'), 'wantMenu=' + wm.map(o => o && o.id).join(','));
      try { Game.endConvo(vid, 'left'); } catch (e) {}
    }
  }

  // ---- 2. Control: the r156 grief route still works. ----
  T.section('2. Control — grief-thread deferred ask offers commit (r156 fix holds)');
  f = fresh();
  T.ok('pantry drained to 0 kcal', f.kcal === 0, 'kcal=' + f.kcal);
  let cap = captureAskFavorDef(f.speaking);
  T.ok('captured the ask_favor def from a natural sitting', !!cap.def, 'tried=' + cap.tried.join(' | ').slice(0, 400));
  let vid = cap.def ? stageDeferredAsk(f.speaking, cap.def, 'grief', cap.captureVid) : null;
  T.ok('staged a deferred ask_favor sitting (stage 0, thread grief)', !!vid, 'vid=' + vid);
  if (vid) {
    const res = Game.convoTurn(vid, 'dlg:help');
    T.ok('the turn ran', !!res && typeof res === 'object', 'res=' + String(res && res.line || res).slice(0, 80));
    const c2 = convo(vid);
    T.ok('the ask was stated (stage 2)', (c2.want && c2.want.stage) === 2, 'stage=' + (c2.want && c2.want.stage));
    T.ok('the want owns the thread after engage', c2.thread === 'want', 'thread=' + c2.thread);
    const ids = choiceIds(res);
    T.ok('the next menu offers dlg:commit', ids.includes('dlg:commit'), 'menu=' + ids.join(','));
    try { Game.endConvo(vid, 'left'); } catch (e) {}
  }

  // ---- 3. Unit: engage at stage 2 moves the thread. ----
  T.section('3. Unit — convoWantEngage(engage) at stage 2 moves a request thread to want');
  f = fresh();
  created = createFavor(f.speaking);
  T.ok('sitting A created a real favor (state asked)', !!created.vid, 'tried=' + created.tried.join(' | ').slice(0, 400));
  if (created.vid) {
    cap = captureAskFavorDef(f.speaking);
    T.ok('captured the ask_favor def for the replant', !!cap.def, 'tried=' + (cap.tried || []).join(' | ').slice(0, 200));
    let vid3 = null;
    if (cap.def && openVid(created.vid)) {
      const c = convo(created.vid);
      let ledger = null;
      try { ledger = Game.convoGetFavor(created.vid); } catch (e) { ledger = null; }
      if (ledger && ledger.id === created.favorId && ledger.state === 'asked') {
        // Plant the post-help state directly: stage 2, favor attached,
        // thread 'request' — the state engage lands on in the defect.
        c.want = { id: 'ask_favor', def: cap.def, stage: 2, fromSeed: true, seedFavorId: created.favorId, favor: ledger };
        c.thread = 'request';
        c.pendingQ = null; c.reactiveQ = null; c.genericQ = null;
        vid3 = created.vid;
      } else {
        try { Game.endConvo(created.vid, 'left'); } catch (e) {}
      }
    }
    T.ok('staged: stage 2, favor attached, thread request', !!vid3, 'vid=' + vid3);
    if (vid3) {
      const c = convo(vid3);
      T.ok('staged state confirmed', (c.want.stage || 0) === 2 && c.thread === 'request' && !!(c.want.favor && c.want.favor.state === 'asked'),
        'stage=' + c.want.stage + ' thread=' + c.thread + ' favor=' + (c.want.favor && c.want.favor.state));
      Game.convoWantEngage(vid3, 'engage');
      const c2 = convo(vid3);
      T.ok('engage keeps stage at 2', (c2.want.stage || 0) === 2, 'stage=' + c2.want.stage);
      T.ok('engage moves the thread to want', c2.thread === 'want', 'thread=' + c2.thread);
      const wm = Game.convoWantMenu(vid3) || [];
      T.ok('convoWantMenu offers dlg:commit after the flip', wm.some(o => o && o.id === 'dlg:commit'), 'wantMenu=' + wm.map(o => o && o.id).join(','));
      try { Game.endConvo(vid3, 'left'); } catch (e) {}
    }
  }

  T.done();
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(1); });
