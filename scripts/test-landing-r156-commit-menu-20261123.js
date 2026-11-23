#!/usr/bin/env node
// test-landing-r156-commit-menu-20261123.js — proof test for the r156
// M-PR1 fix (journey-landing r156; the r155 filed blank).
//
// THE DEFECT (r155 panel, seed 1370, Lucas d10 and Lena d11): someone asks
// the player plainly to go foraging with them tomorrow — and at no point is
// there any way to say yes. The menu never offers "I'll come back to help."
// The favor hangs ("Think about it? I'll be around.") and the outing never
// happens. M-PR1 went NO-GO on it (4/20 = 20% > 15%).
//
// ROOT CAUSE (pinned by transcript + code trace, pre-panel): the opener in
// both sittings is a GRIEF beat ("We gave them a good burial..."),
// so convoOpening returns thread 'grief' (conversation.js:3791, :3950).
// The player picks [dlg:help] (offered by the r230 stage-0 surfacing);
// engageBeat states the ask and convoWantEngage moves the want to stage 2
// with the favor record attached in state 'asked' — but NOTHING moves
// c.thread to 'want' (convoWantEngage is a pure stage transition,
// convo-wants.js:2992). Next menu: convoWantMenu returns [] on its
// thread-coherence gate (c.thread !== 'want' && !== 'small',
// convo-wants.js:3084), so the commit menu never builds; beatMenuResponses
// drops [dlg:more] too, because grief is a no-followup thread
// (threadNoFollowups, convo-beats.js:455), so there is no thread-advance
// path either. Contrast 1371 d13 (promised): opener thread 'request' HAS
// follow-up machinery, [dlg:more] is offered, picking it advances the
// thread to 'want', and the commit menu appears.
//
// THE FIX (r156): when the want engages to stage 2, the want owns the
// conversation — convoWantEngage('engage') moves c.thread to 'want'.
// One place, covers every engage path (help/heed/stay/details/react/
// answers); the guarded callers already engage only on want/small threads,
// so the only behavioral change is for pre-empted openers — exactly the
// defect.
//
// PROOF SHAPE (real sittings, real sayLine ledger — godpath lib, as the
// r268 F6 test): drain the pantry so a real forage_help need is live
// (the villager's belief reads the live pantry at haven, so the need is
// genuinely live, not planted). Repeat-meeting staging (count=2 — the
// panel's sittings are repeat meetings; first meetings are curiosity-led
// by design). The ask_favor def is captured from a sitting that selects
// it naturally. The test sitting reproduces the panel-observed state:
// the want selected on a live need, its opener pre-empted (stage 0, no
// favor attached yet), thread 'grief' (the state the grief opener
// produces — same staging honesty as r268 planting the topic ledger).
// Press dlg:help and read the next menu.
//   1. grief-thread engage -> dlg:commit is offered (RED on old code)
//   2. control: thread 'small' (a cooperating thread) -> dlg:commit is
//      offered (GREEN on old code too — guards against vacuous staging)
//   3. unit: convoWantEngage('engage') on a grief thread moves the thread
//      to 'want' (RED on old code — isolates the fix's mechanism)
//
// Usage: node scripts/test-landing-r156-commit-menu-20261123.js
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('landing-r156-commit-menu');

(async () => {
  const Game = await K.load({ seed: 156100 });

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
  // Capture the ask_favor def from a sitting that selects it naturally.
  // Returns {def, captureVid} or null with a diagnostic.
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
  // whose natural want is NOT ask_favor (so no favor was created in their
  // opening sitting): overwrite the want with a stage-0 ask_favor and plant
  // the given thread. Returns the vid or null.
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
      // The panel-observed sittings carry no hanging question (the grief
      // opener asks nothing); the natural opener here may have hung one
      // (a curious question), which would own the menu instead of the
      // want. Clear it so the staged state matches the panel state.
      c.pendingQ = null; c.reactiveQ = null; c.genericQ = null;
      return vid;
    }
    return null;
  }

  // ---- 1. Grief-thread engage -> commit offered. ----
  T.section('1. Grief-opener ask_favor: dlg:help states the ask, commit is offered');
  let f = fresh();
  T.ok('pantry drained to 0 kcal (live forage_help need)', f.kcal === 0, 'kcal=' + f.kcal);
  T.ok('speaking villagers exist', f.speaking.length > 0, 'n=' + f.speaking.length);
  let cap = captureAskFavorDef(f.speaking);
  T.ok('captured the ask_favor def from a natural sitting', !!cap.def, 'tried=' + cap.tried.join(' | ').slice(0, 400));
  let vid = cap.def ? stageDeferredAsk(f.speaking, cap.def, 'grief', cap.captureVid) : null;
  T.ok('staged a deferred ask_favor sitting (stage 0, thread grief)', !!vid, 'vid=' + vid);
  if (vid) {
    const c = convo(vid);
    const before = Game.convoWantMenu(vid) || [];
    T.ok('want menu offers dlg:help at stage 0 (r230 surfacing)', before.some(o => o && o.id === 'dlg:help'), 'menu=' + before.map(o => o && o.id).join(','));
    const res = Game.convoTurn(vid, 'dlg:help');
    T.ok('the turn ran', !!res && typeof res === 'object', 'res=' + String(res && res.line || res).slice(0, 80));
    const c2 = convo(vid);
    T.ok('the ask was stated (stage 2)', (c2.want && c2.want.stage) === 2, 'stage=' + (c2.want && c2.want.stage));
    T.ok('the favor record is attached in state asked', !!(c2.want && c2.want.favor && c2.want.favor.state === 'asked'), 'favor=' + JSON.stringify(c2.want && c2.want.favor && { kind: c2.want.favor.kind, state: c2.want.favor.state }));
    T.ok('the spoken ask is the forage ask', /forage/i.test(themText(vid)), 'text=' + themText(vid).slice(0, 160));
    T.ok('the want owns the thread after engage', c2.thread === 'want', 'thread=' + c2.thread);
    const ids = choiceIds(res);
    T.ok('the next menu offers dlg:commit', ids.includes('dlg:commit'), 'menu=' + ids.join(','));
    const wm = Game.convoWantMenu(vid) || [];
    T.ok('convoWantMenu offers dlg:commit', wm.some(o => o && o.id === 'dlg:commit'), 'wantMenu=' + wm.map(o => o && o.id).join(','));
    try { Game.endConvo(vid, 'left'); } catch (e) {}
  }

  // ---- 2. Control: cooperating thread ('small') -> commit offered. ----
  T.section('2. Control — small-thread engage offers commit (good flow)');
  f = fresh();
  T.ok('pantry drained to 0 kcal', f.kcal === 0, 'kcal=' + f.kcal);
  cap = captureAskFavorDef(f.speaking);
  T.ok('captured the ask_favor def from a natural sitting', !!cap.def, 'tried=' + cap.tried.join(' | ').slice(0, 400));
  vid = cap.def ? stageDeferredAsk(f.speaking, cap.def, 'small', cap.captureVid) : null;
  T.ok('staged a deferred ask_favor sitting (stage 0, thread small)', !!vid, 'vid=' + vid);
  if (vid) {
    const res = Game.convoTurn(vid, 'dlg:help');
    T.ok('the turn ran', !!res && typeof res === 'object', 'res=' + String(res && res.line || res).slice(0, 80));
    const c2 = convo(vid);
    T.ok('the ask was stated (stage 2)', (c2.want && c2.want.stage) === 2, 'stage=' + (c2.want && c2.want.stage));
    const ids = choiceIds(res);
    T.ok('the next menu offers dlg:commit', ids.includes('dlg:commit'), 'menu=' + ids.join(','));
    try { Game.endConvo(vid, 'left'); } catch (e) {}
  }

  // ---- 3. Unit: convoWantEngage moves the thread. ----
  T.section('3. Unit — convoWantEngage(engage) moves a grief thread to want');
  f = fresh();
  cap = captureAskFavorDef(f.speaking);
  T.ok('captured the ask_favor def from a natural sitting', !!cap.def, 'tried=' + cap.tried.join(' | ').slice(0, 400));
  vid = cap.def ? stageDeferredAsk(f.speaking, cap.def, 'grief', cap.captureVid) : null;
  T.ok('staged a deferred ask_favor sitting (stage 0, thread grief)', !!vid, 'vid=' + vid);
  if (vid) {
    const c = convo(vid);
    T.ok('staged: stage 0, thread grief', (c.want.stage || 0) === 0 && c.thread === 'grief', 'stage=' + c.want.stage + ' thread=' + c.thread);
    Game.convoWantEngage(vid, 'engage');
    const c2 = convo(vid);
    T.ok('engage moves stage to 2', (c2.want.stage || 0) === 2, 'stage=' + c2.want.stage);
    T.ok('engage moves the thread to want', c2.thread === 'want', 'thread=' + c2.thread);
    try { Game.endConvo(vid, 'left'); } catch (e) {}
  }

  T.done();
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(1); });
