#!/usr/bin/env node
// test-convo-settled-help-names-favor-r247-20261120.js — PROOF (journey-scale r247):
// The settled dlg:help answer never named WHAT was handled.
//
// BEFORE (wild evidence — journey-scale r247, seed 103891 day 120,
// Karlygash, ask_favor want stage 0, planted d114): the opener signaled
// an edge ("Karlygash has an edge today — something curdled."), the
// player pressed dlg:help ("I'm listening.") and got the bare line
// "It's already handled. Thank you for asking." The favor had died
// off-screen between the d114 seed and the d120 sitting; the ledger
// favor was settled, the want had no favor of its own, and no live need
// existed — so the r231 deferred-ask guard correctly did NOT fire, and
// the settled branch answered without naming the favor. The player
// never learned what the favor was. Root cause: the settled branch in
// convo-dialogue.js (dlg:help) hard-coded the bare line, the one place
// in the favor system that doesn't speak favor.short — every follow-up
// elsewhere says "About {short} — ...", "Never mind {short} — ...".
//
// AFTER (the fix, convo-dialogue.js dlg:help settled branch): the answer
// names the settled favor's short — "It's already handled — the food I
// needed. Thank you for asking." — falling back to the bare line only
// when there is no speakable short (a bare kind id must never be spoken:
// the r16 stale-opener rule — name the ask, never the id).
//
// FIXTURE NOTES: staging clones the r231 settled-help test
// (test-journey-establishment-r231-settled-help-20261117.js): a sick
// need makes ask_favor selectable, a recall thread pre-empts the
// opener into a stage-0 favorless sitting, and a planted ledger favor
// supplies the settled state with a known short. One fresh game per
// part (a stated ask in one part must not run-ledger-block the next).
// Part A is the fail-before/pass-after core: on unfixed code the line
// is the bare "It's already handled..." and the short check fails.
// Seeds: 5001–5004.
// Exit 0 = green, 1 = failure.
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let fails = 0;
function check(id, ok, detail) {
  console.log(`  [${ok ? 'OK' : 'FAIL'}] ${id}${detail ? ' — ' + detail : ''}`);
  if (!ok) fails++;
}

function plantSickNeeds(Game, living) {
  const v = Game.state.village;
  v.sick = v.sick || {};
  v.trust = v.trust || {};
  for (const id of living) {
    v.sick[id] = { daysLeft: 3, severity: 2, name: 'wound fever' };
    v.trust[id] = 30;
  }
}

// Stage a NATURAL resume-pre-empted sitting: backed open recall thread +
// live sick need, then startConvo until the resume fires with a fresh
// ask_favor want at stage 0. Returns { vid, open } or null. (r230/r231 pattern.)
function stageResumePreempted(Game, living, used) {
  const v = Game.state.village;
  for (const id of living) {
    if (used.has(String(id))) continue;
    const sel = Game.convoSelectWant(id);
    if (!sel || sel.id !== 'ask_favor') continue;
    if (v.convoSeeds) delete v.convoSeeds[id];
    const c0 = Game.convoGet(id);
    c0.answered = { q_test: 'yes' };
    Game.convoThreadOpen(id, 'recall', 'something personal', 'changed the subject',
      '"I still think about what my mother used to say about the winters here, back before the scattering took her."');
    const r = Game.startConvo(id);
    const c = Game.convoGet(id);
    if (c && c._resumedOnce && c.want && c.want.id === 'ask_favor' && (c.want.stage || 0) === 0) {
      used.add(String(id));
      return { vid: id, open: r };
    }
    Game.endConvo(id, 'done');
  }
  return null;
}

// Plant a SETTLED ledger favor with a known short (the Karlygash shape:
// the ledger holds the dead favor; the want itself has none).
function plantSettledFavor(Game, vid, short) {
  const v = Game.state.village;
  v.favorLedger = v.favorLedger || {};
  const f = { id: 'favor-' + vid + '-test', kind: 'food_share', state: 'moot' };
  if (short !== undefined) f.short = short;
  v.favorLedger[vid] = f;
  return f;
}

async function freshGame(seed) {
  const { Game } = await loadGame({ seed, mode: 'test-settled-help-names-r247' });
  await setupGame(Game);
  const v = Game.state.village;
  const living = (v.roster || []).filter(id => String(id) !== String(Game.villagerId) && !((Game.getPerson(id) || {}).dead));
  return { Game, living };
}

(async () => {
  // --- Part A (core, fail-before/pass-after): no live need + moot ledger
  // favor with a known short -> the settled answer must NAME the favor.
  {
    const { Game, living } = await freshGame(5001);
    check('A setup: living villagers exist', living.length > 0, 'living=' + living.length);
    plantSickNeeds(Game, living);
    const st = stageResumePreempted(Game, living, new Set());
    check('A staged: resume pre-empts into stage-0 favorless ask_favor', !!st, st ? 'vid=' + st.vid : 'none staged');
    if (st) {
      plantSettledFavor(Game, st.vid, 'the food I needed');
      const origNeed = Game.convoFindFavorNeed;
      Game.convoFindFavorNeed = () => null; // Karlygash shape: no live need at press time
      let r = null;
      try { r = Game.convoTurn(st.vid, 'dlg:help'); } finally { Game.convoFindFavorNeed = origNeed; }
      const line = (r && r.line) || '';
      check('A1 settled help NAMES the favor short', line.includes('the food I needed'), 'line=' + JSON.stringify(line));
      check('A2 settled help keeps the honest "already handled" frame', /already handled/i.test(line), 'line=' + JSON.stringify(line));
      Game.endConvo(st.vid, 'done');
    }
  }

  // --- Part B: the want's OWN favor settled (r7/r231-F shape) -> named too.
  {
    const { Game, living } = await freshGame(5002);
    plantSickNeeds(Game, living);
    const v = Game.state.village;
    let gVid = null;
    for (const id of living) {
      const sel = Game.convoSelectWant(id);
      if (!sel || sel.id !== 'ask_favor') continue;
      if (v.convoSeeds) delete v.convoSeeds[id];
      const r = Game.startConvo(id);
      const c = Game.convoGet(id);
      if (c && !c._resumedOnce && c.want && c.want.id === 'ask_favor' && (c.want.stage || 0) >= 1 && c.want.favor) { gVid = id; break; }
      Game.endConvo(id, 'done');
    }
    check('B staged: opener ran, favor attached (stage >= 1)', !!gVid, gVid ? 'vid=' + gVid : 'none staged');
    if (gVid) {
      const c0 = Game.convoGet(gVid);
      const sh = c0.want.favor.short;
      c0.want.favor.state = 'moot';
      const r = Game.convoTurn(gVid, 'dlg:help');
      const line = (r && r.line) || '';
      check('B1 own settled favor is named in the answer', !!(sh && / /.test(sh) ? line.includes(sh) : /already handled/i.test(line)),
        'short=' + JSON.stringify(sh) + ' line=' + JSON.stringify(line));
      Game.endConvo(gVid, 'done');
    }
  }

  // --- Part C: no speakable short -> bare line, and no kind id spoken.
  {
    const { Game, living } = await freshGame(5003);
    plantSickNeeds(Game, living);
    const st = stageResumePreempted(Game, living, new Set());
    check('C staged: resume pre-empts into stage-0 favorless ask_favor', !!st, st ? 'vid=' + st.vid : 'none staged');
    if (st) {
      plantSettledFavor(Game, st.vid, undefined); // kind food_share, NO short
      const origNeed = Game.convoFindFavorNeed;
      Game.convoFindFavorNeed = () => null;
      let r = null;
      try { r = Game.convoTurn(st.vid, 'dlg:help'); } finally { Game.convoFindFavorNeed = origNeed; }
      const line = (r && r.line) || '';
      check('C1 shortless favor falls back to the bare line', line === '"It\'s already handled. Thank you for asking."', 'line=' + JSON.stringify(line));
      check('C2 no kind id is spoken', !/food_share/.test(line), 'line=' + JSON.stringify(line));
      Game.endConvo(st.vid, 'done');
    }
  }

  // --- Part D (regression guard for r231): live need + moot ledger favor
  // -> help still states the LIVE ask (the deferred-ask guard untouched).
  {
    const { Game, living } = await freshGame(5004);
    plantSickNeeds(Game, living);
    const st = stageResumePreempted(Game, living, new Set());
    check('D staged: resume pre-empts into stage-0 favorless ask_favor', !!st, st ? 'vid=' + st.vid : 'none staged');
    if (st) {
      plantSettledFavor(Game, st.vid, 'the food I needed');
      const need = Game.convoFindFavorNeed(st.vid);
      const r = Game.convoTurn(st.vid, 'dlg:help');
      const c = Game.convoGet(st.vid);
      const line = (r && r.line) || '';
      check('D1 live need: help states the live ask, not "already handled"',
        !!(/feverish|wound fever|help me/i.test(line)) && !/already handled/i.test(line),
        'line=' + JSON.stringify(line));
      check('D2 live need: help moves stage 0 -> 2', (c.want.stage || 0) === 2, 'stage=' + c.want.stage);
      check('D3 live need: help attaches the favor with the need kind',
        !!(c.want.favor && c.want.favor.kind === (need && need.kind)),
        'favor=' + JSON.stringify(c.want.favor && c.want.favor.kind));
      Game.endConvo(st.vid, 'done');
    }
  }

  console.log(`\n${fails === 0 ? 'PASS' : 'FAIL'}: ${fails} failed`);
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error('TEST-ERROR', e && e.stack || e); process.exit(1); });
