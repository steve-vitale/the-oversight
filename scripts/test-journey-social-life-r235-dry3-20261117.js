#!/usr/bin/env node
// test-journey-social-life-r235-dry3-20261117.js — proof test for the r235
// DRY3 fix (journey-social-life r235; the r234 DRY3 finding: 4 dry servings
// at 3 new sites, F6 holding at its sites and DRY2 holding at its sites).
//
// THE DEFECTS (all "...Sorry, lost my train of thought." — the dry line).
// One shared mechanism, three sites: sayLine is handed a line with no
// convoWouldBlock pre-check, and its truthy dry-line return fools the
// caller's "primary spoken" test. Re-traced from the r234 panel JSONs:
//   1. Expedition-ask answer (villager-agency.js agencyTurn): the lesson
//      line is spoken through sayLine with no pre-check (only the place
//      branch is diegeticAct-exempt, only the closer pool is pre-checked,
//      r193). The collision is the FIXED fallback line ("Saw things with
//      too many joints...") — one string for every villager with
//      k.monsters>=2 and nothing teachable. Two such asks inside the
//      48-entry run window → the second dries. (45711 t63 d47 + t89 d72.)
//   2. dlg:details favor explanation (convo-dialogue.js): the composed
//      answer reaches sayLine with no pre-check on the COMPOSED line. The
//      r146/r151 guards check the BARE whyLine/need-lines and cannot see
//      this collision: the wild dry is the dry-pool line itself (raw null
//      → pool variant already spoken by another villager). (45710 t49 d44.)
//   3. Greeting reply / dlg:react (convo-dialogue.js): a thread beat is
//      composed and handed to sayLine with only a truthiness test
//      (`if (said)`); sayLine returns the dry line truthy on a run-block,
//      so the handler reports the beat as spoken while the transcript
//      holds the dry line. The thread-beat pools are shared across
//      villagers. (45712 t79 d66.)
//
// THE FIXES:
//   1. agencyTurn pre-checks convoWouldBlock(vid, lineText) (place branch
//      keeps its diegeticAct exemption); when blocked it skips sayLine and
//      falls to the r193 closer pool (already pre-checked) or the honest
//      noop. New helper convoWouldRunBlock(vid, line) in conversation.js:
//      the run-ledger-only predicate (true only when the line's key is in
//      the run ledger AND NOT in this sitting's ledger).
//   2. dlg:details pre-checks convoWouldRunBlock(vid, composed); on a
//      run-block it serves the dlg:details:dry pool deflection ledger-exempt
//      ({ structural: true }, generic grammar, DRY2 stonewall precedent)
//      with the same tail. A within-sitting self-block still flows to
//      sayLine → null → the existing self-repeat path (r16 honesty).
//   3. dlg:react pre-checks convoWouldBlock(vid, composed); when blocked it
//      skips sayLine and falls to the existing dead-react wind-down
//      (structural pool), like a dry thread.
//
// PROOF SHAPE (godpath lib, real sittings, real sayLine ledger — F6/DRY2
// pattern): every discriminator poisons the run ledger through real
// handler calls on ANOTHER villager's sitting, never by writing the
// ledger directly — with two noted exceptions: the react pool (8-12
// lines) is poisoned through the donor's real sayLine calls in a real
// sitting (handler-driven poisoning would need 8-12 sittings; the ledger
// entries are identical — sayLine is the emission choke point every wild
// entry passes through), and the helper unit checks stage ledger state
// directly (guards, not discriminators).
//   1. agency: donor + test staged with know.monsters>=2 and nothing
//      teachable; donor's expedition ask speaks the fixed fallback line;
//      test's ask must speak a closer (fix) / dry (base). Deterministic.
//   2. details: donor presses details 6x across sittings (why, need v0,
//      v1, v2, dry-pool variant, other dry-pool variant — each through
//      the real handler); test's details press must speak a deflection
//      (fix) / dry (base). Deterministic.
//   3. react: donor speaks every line of the test thread's goal pool via
//      real sayLine; test's react (thread 'goal') must wind down via the
//      dead-react pool (fix) / dry (base). The 60% beat gate is handled
//      by a retry loop that stops only when the beat path demonstrably
//      fired (c.said['goaldeep'] non-empty) — never a vacuous pass.
// Guards (pass on base and fix): clean-ledger lesson/beat/details lines
// speak verbatim; convoWouldRunBlock is false for self-blocks and clean
// lines, true for run-blocked lines.
// Usage: node scripts/test-journey-social-life-r235-dry3-20261117.js
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('journey-social-life-r235-dry3');

const DRY = /lost my train of thought/;
const FALLBACK = '"Saw things with too many joints. Give them room. That\'s the whole lesson."';
const CLOSERS = [
  '"There\'s more, but that\'s for another fire."',
  '"That\'s everything I brought back. The rest is just walking."',
  '"I\'ve told you everything I know about that."',
];
const WHY = '"Do the math with me: 4 liters, 3 people. That\'s not tomorrow\'s water. We walk together and each carry two liters back. Creek water still needs boiling."';
const NEEDS = [
  '"I still need help with the creek water run."',
  '"I still need a hand with the creek water run."',
  '"The creek water run isn\'t going away — I need help."',
];
const DRYPOOL = [
  '"It\'s... complicated. But thank you for asking."',
  '"I don\'t have the words for all of it. But thank you for asking."',
];
const DEADREACT = [
  '"Anyway." A small smile.',
  '"So." They look at the fire for a moment.',
  '"Well." A breath. "That\'s where things stand."',
  'They nod slowly, not quite done, not quite continuing.',
];

function speaking(Game) {
  const v = Game.state.village;
  const oldId = Game.villagerId;
  const roster = (v.roster || []).filter(id => id !== oldId);
  const sp = roster.filter(id => {
    try { return Game.commLevel(id).level === 'full'; } catch (e) { return false; }
  });
  return sp.length ? sp : roster;
}
function convo(Game, vid) { try { return Game.convoGet(vid); } catch (e) { return null; } }
function openSitting(Game, vid) {
  const o = Game.startConvo(vid);
  if (!(o && !o.refused && !o.ended)) throw new Error('startConvo refused/ended for ' + Game.displayName(vid) + ': ' + JSON.stringify(o && (o.refused || o.reason)));
  return convo(Game, vid);
}
function closeSitting(Game, vid) { try { Game.endConvo(vid, 'left'); } catch (e) {} }
function npcLines(Game, vid, fromIdx) {
  const c = convo(Game, vid);
  const tr = (c && c.transcript) || [];
  return tr.slice(fromIdx || 0).filter(e => e.who !== 'you').map(e => String(e.text || ''));
}
function clearLedger(Game) { try { Game.convoRunLedger().length = 0; } catch (e) {} }
// findDef: plant a seed for wantId on a donor villager and read the real
// def back through selection (the seed path, fromSeed). C3d pattern.
function findDef(Game, sp, wantId) {
  for (const vid of sp) {
    try { Game.convoPlantSeed(vid, { wantId, note: 'r235 proof' }); } catch (e) {}
    let sel = null;
    try { sel = Game.convoSelectWant(vid); } catch (e) { sel = null; }
    if (sel && sel.id === wantId && sel.def) return { donor: vid, def: sel.def };
  }
  return null;
}
function stageFavorWant(Game, vid, askDef) {
  const day = (Game.state.scholar || {}).day || 1;
  const favor = { vid, id: 'favor-r235-water-' + vid, kind: 'water_haul', state: 'asked', askedDay: day, short: 'the creek water run', whyLine: WHY };
  try { Game.convoStoreFavor(favor); } catch (e) {}
  openSitting(Game, vid);
  const c = convo(Game, vid);
  c.want = { id: 'ask_favor', def: askDef, favor, stage: 2, fromSeed: true, seedFavorId: favor.id };
  c.thread = 'small';
  return c;
}
// spokenGoal: the goal a 'goal'-thread beat actually draws from. Mirrors
// truth.js wrapper 0b (convoThreadBeat swaps vp.goal to the live lie's told
// value for pool selection; fillTalkLine does the same for the fill). A
// goal-liar discusses the cover goal — the test's pool must be that pool,
// or the guard fails on honest game behavior (r235 adoption: gen_pkg7bj4,
// true goal 'lead', live lie told 'belong', beat correctly from belong).
function spokenGoal(Game, vid) {
  try {
    const lies = Game.npcLies(vid) || {};
    const g = lies.goal;
    if (g && Game.lieLive(vid, g) && g.told) return g.told;
  } catch (e) {}
  return Game.npcGoal(vid);
}
function stageAgency(Game, vid) {
  const st = Game.agencyState();
  st.know[vid] = { plants: 0, monsters: 2, places: [], fought: [] };
  st.teachable[vid] = [];
}

(async () => {
  const Game = await K.load({ seed: 235100 });

  // ============ 1. AGENCY: guard + discriminator ============
  T.section('1. Agency expedition ask (DRY3 site 1)');
  // 1a. Guard: clean-ledger expedition ask speaks the fallback verbatim.
  K.newRun(Game);
  clearLedger(Game);
  let sp = speaking(Game);
  T.ok('fresh run has >= 2 speaking villagers (agency guard)', sp.length >= 2, 'got ' + sp.length);
  if (sp.length >= 2) {
    const vid = sp[0];
    Game.state.village.trust[vid] = 50;
    stageAgency(Game, vid);
    openSitting(Game, vid);
    const c = convo(Game, vid);
    const before = c.transcript.length;
    let r = null;
    try { r = Game.agencyTurn(vid, 'agency:ask_expedition'); } catch (e) { r = { err: String(e && e.message) }; }
    const text = npcLines(Game, vid, before).join(' ');
    T.ok('clean-ledger expedition ask speaks the fallback line verbatim', text.includes(FALLBACK) && !DRY.test(text), text.slice(0, 200));
    T.ok('clean-ledger expedition ask reports the fallback line', r && r.line === FALLBACK, String(r && r.line).slice(0, 120));
    closeSitting(Game, vid);
  }

  // 1b. Discriminator: donor speaks the fallback; test ask must close (fix) / dry (base).
  K.newRun(Game);
  clearLedger(Game);
  sp = speaking(Game);
  T.ok('fresh run has >= 2 speaking villagers (agency discriminator)', sp.length >= 2, 'got ' + sp.length);
  if (sp.length >= 2) {
    const donor = sp[0], test = sp[1];
    Game.state.village.trust[donor] = 50;
    Game.state.village.trust[test] = 50;
    stageAgency(Game, donor);
    stageAgency(Game, test);
    openSitting(Game, donor);
    let rd = null;
    try { rd = Game.agencyTurn(donor, 'agency:ask_expedition'); } catch (e) {}
    const dtext = npcLines(Game, donor).join(' ');
    T.ok('donor expedition ask speaks the fallback line (ledger poison)', dtext.includes(FALLBACK) && !DRY.test(dtext), dtext.slice(0, 200));
    closeSitting(Game, donor);
    openSitting(Game, test);
    const c = convo(Game, test);
    const before = c.transcript.length;
    let rt = null;
    try { rt = Game.agencyTurn(test, 'agency:ask_expedition'); } catch (e) { rt = { err: String(e && e.message) }; }
    const ttext = npcLines(Game, test, before).join(' ');
    const hasCloser = CLOSERS.some(l => ttext.includes(l));
    T.ok('DISCRIMINATOR test ask speaks a closer (fix) instead of drying', !DRY.test(ttext) && hasCloser, ttext.slice(0, 200));
    T.ok('test ask does NOT re-speak the blocked fallback line', !ttext.includes(FALLBACK), ttext.slice(0, 200));
    T.ok('test ask reports a closer, not the fallback', rt && CLOSERS.indexOf(rt.line) !== -1, String(rt && rt.line).slice(0, 120));
    closeSitting(Game, test);
  }

  // ============ 2. DETAILS: guard + discriminator ============
  T.section('2. dlg:details favor explanation (DRY3 site 2)');
  // 2a. Guard: clean-ledger details press speaks the whyLine verbatim.
  K.newRun(Game);
  clearLedger(Game);
  sp = speaking(Game);
  let askDef = findDef(Game, sp, 'ask_favor');
  T.ok('found the ask_favor def via a seeded donor (details guard)', !!askDef, askDef && ('donor=' + askDef.donor));
  if (askDef && sp.length >= 2) {
    const vid = sp[1];
    Game.state.village.trust[vid] = 50;
    const c = stageFavorWant(Game, vid, askDef.def);
    const before = c.transcript.length;
    let r = null;
    try { r = Game.convoTurn(vid, 'dlg:details'); } catch (e) { r = { err: String(e && e.message) }; }
    const text = npcLines(Game, vid, before).join(' ');
    T.ok('clean-ledger details press speaks the whyLine verbatim', text.includes(WHY) && !DRY.test(text), text.slice(0, 200));
    T.ok('clean-ledger details press reports the whyLine', r && r.line === WHY, String(r && r.line).slice(0, 120));
    closeSitting(Game, vid);
  }

  // 2b. Discriminator: donor presses details 6x across sittings (why, need
  // v0/v1/v2, dry-pool variant, other dry-pool variant — each through the
  // real handler); test press must deflect (fix) / dry (base).
  K.newRun(Game);
  clearLedger(Game);
  sp = speaking(Game);
  askDef = findDef(Game, sp, 'ask_favor');
  T.ok('found the ask_favor def via a seeded donor (details discriminator)', !!askDef, askDef && ('donor=' + askDef.donor));
  if (askDef && sp.length >= 2) {
    const donor = sp[0], test = sp[1];
    Game.state.village.trust[donor] = 50;
    Game.state.village.trust[test] = 50;
    const expected = [WHY, NEEDS[0], NEEDS[1], NEEDS[2]];
    let donorOk = true;
    for (let i = 0; i < 6; i++) {
      const c = stageFavorWant(Game, donor, askDef.def);
      const before = c.transcript.length;
      let r = null;
      try { r = Game.convoTurn(donor, 'dlg:details'); } catch (e) { r = { err: String(e && e.message) }; }
      const text = npcLines(Game, donor, before).join(' ');
      if (i < 4) {
        const ok = text.includes(expected[i]) && !DRY.test(text);
        if (!ok) donorOk = false;
        T.ok('donor details press ' + i + ' speaks ' + (i === 0 ? 'the whyLine' : 'need v' + (i - 1)), ok, text.slice(0, 160));
      } else {
        const ok = DRYPOOL.some(l => text.includes(l)) && !DRY.test(text);
        if (!ok) donorOk = false;
        T.ok('donor details press ' + i + ' speaks a dry-pool variant', ok, text.slice(0, 160));
      }
      closeSitting(Game, donor);
    }
    const rl = Game.convoRunLedger();
    T.ok('run ledger holds the whyLine + all 3 need-lines + both pool variants',
      [WHY].concat(NEEDS, DRYPOOL).every(l => rl.indexOf(l) !== -1),
      'missing=' + [WHY].concat(NEEDS, DRYPOOL).filter(l => rl.indexOf(l) === -1).join(' | ').slice(0, 200));
    if (donorOk) {
      const c = stageFavorWant(Game, test, askDef.def);
      const before = c.transcript.length;
      let r = null;
      try { r = Game.convoTurn(test, 'dlg:details'); } catch (e) { r = { err: String(e && e.message) }; }
      const text = npcLines(Game, test, before).join(' ');
      const hasDeflection = DRYPOOL.some(l => text.includes(l));
      T.ok('DISCRIMINATOR test details press speaks a deflection (fix) instead of drying', !DRY.test(text) && hasDeflection, text.slice(0, 200));
      T.ok('test details press reports the deflection', r && DRYPOOL.indexOf(r.line) !== -1, String(r && r.line).slice(0, 120));
      closeSitting(Game, test);
    } else {
      T.ok('donor poison sequence complete (prerequisite for the discriminator)', false, 'a donor press missed its expected line — discriminator skipped, see above');
    }
  }

  // 2c. Helper guard: convoWouldRunBlock is run-ledger-only.
  // (On base the helper does not exist — the section then runs only the
  // WouldBlock sanity checks and notes the skip loudly; the three
  // discriminators above carry the base-vs-fix verdict.)
  T.section('2c. convoWouldRunBlock contract (helper guard)');
  K.newRun(Game);
  clearLedger(Game);
  sp = speaking(Game);
  askDef = findDef(Game, sp, 'ask_favor');
  T.ok('found the ask_favor def via a seeded donor (helper guard)', !!askDef, askDef && ('donor=' + askDef.donor));
  const hasWrb = typeof Game.convoWouldRunBlock === 'function';
  if (!hasWrb) console.log('  SKIP convoWouldRunBlock assertions — helper absent on this base (fix not applied)');
  function wrb(vid, line) { return hasWrb ? Game.convoWouldRunBlock(vid, line) : null; }
  if (askDef && sp.length >= 2) {
    const donor = sp[0], test = sp[1];
    Game.state.village.trust[donor] = 50;
    Game.state.village.trust[test] = 50;
    // (i) clean line: both predicates false.
    openSitting(Game, test);
    let c = convo(Game, test);
    if (hasWrb) T.ok('clean line: WouldRunBlock false', wrb(test, WHY) === false, 'got ' + wrb(test, WHY));
    T.ok('clean line: WouldBlock false', Game.convoWouldBlock(test, WHY) === false, 'got ' + Game.convoWouldBlock(test, WHY));
    closeSitting(Game, test);
    // (ii) run-blocked only (donor speaks it; test never said it): RunBlock true.
    openSitting(Game, donor);
    try { Game.sayLine(donor, WHY); } catch (e) {}
    closeSitting(Game, donor);
    openSitting(Game, test);
    c = convo(Game, test);
    if (hasWrb) T.ok('run-blocked line: WouldRunBlock true', wrb(test, WHY) === true, 'got ' + wrb(test, WHY));
    closeSitting(Game, test);
    // (iii) self-blocked only (staged in this sitting's ledger, run ledger clean):
    // RunBlock false (the r16 path must keep the self-repeat fallback), WouldBlock true.
    K.newRun(Game);
    clearLedger(Game);
    sp = speaking(Game);
    const vid = sp[0];
    Game.state.village.trust[vid] = 50;
    openSitting(Game, vid);
    c = convo(Game, vid);
    c.saidLinesConvo = [WHY];
    if (hasWrb) T.ok('self-blocked line: WouldRunBlock false (r16 path preserved)', wrb(vid, WHY) === false, 'got ' + wrb(vid, WHY));
    T.ok('self-blocked line: WouldBlock true (sanity)', Game.convoWouldBlock(vid, WHY) === true, 'got ' + Game.convoWouldBlock(vid, WHY));
    closeSitting(Game, vid);
  }

  // ============ 3. REACT: guard + discriminator ============
  // Retry helper: drive dlg:react across fresh sittings until the beat path
  // demonstrably fired (convoThreadBeat recorded a 'goaldeep' pick). Returns
  // the collected NPC lines of the firing attempt, or null when the gate
  // never fired (loud failure, never a vacuous pass).
  function reactUntilBeat(Game, vid, maxAttempts) {
    for (let i = 0; i < (maxAttempts || 8); i++) {
      openSitting(Game, vid);
      const c = convo(Game, vid);
      c.thread = 'goal';
      const before = c.transcript.length;
      let r = null;
      try { r = Game.convoTurn(vid, 'dlg:react'); } catch (e) { r = { err: String(e && e.message) }; }
      const lines = npcLines(Game, vid, before);
      const said = (convo(Game, vid).said || {}).goaldeep || [];
      const fired = said.length > 0;
      closeSitting(Game, vid);
      if (fired) return { lines, ret: r, attempts: i + 1 };
    }
    return null;
  }

  T.section('3. dlg:react greeting reply (DRY3 site 3)');
  // 3a. Guard: clean-ledger react speaks a thread beat verbatim.
  K.newRun(Game);
  clearLedger(Game);
  sp = speaking(Game);
  T.ok('fresh run has >= 2 speaking villagers (react guard)', sp.length >= 2, 'got ' + sp.length);
  if (sp.length >= 2) {
    const vid = sp[0];
    Game.state.village.trust[vid] = 50;
    const goal = spokenGoal(Game, vid);
    const pool = ((Game.data.characterGen || {}).convo.goalFollow || {})[goal] || [];
    T.ok('test villager has a goal with a beat pool', pool.length > 0, 'goal=' + goal + ' pool=' + pool.length);
    if (pool.length) {
      const hit = reactUntilBeat(Game, vid, 8);
      T.ok('react beat path fired within 8 attempts (guard)', !!hit, hit ? ('attempts=' + hit.attempts) : 'gate never fired');
      if (hit) {
        const text = hit.lines.join(' ');
        const spokeBeat = pool.some(l => text.includes(l));
        T.ok('clean-ledger react speaks a thread beat verbatim', spokeBeat && !DRY.test(text), text.slice(0, 200));
      }
    }
  }

  // 3b. Discriminator: donor speaks the whole goal pool; test react must
  // wind down (fix) / dry (base).
  K.newRun(Game);
  clearLedger(Game);
  sp = speaking(Game);
  T.ok('fresh run has >= 2 speaking villagers (react discriminator)', sp.length >= 2, 'got ' + sp.length);
  if (sp.length >= 2) {
    const donor = sp[0], test = sp[1];
    Game.state.village.trust[donor] = 50;
    Game.state.village.trust[test] = 50;
    const goal = spokenGoal(Game, test);
    const pool = ((Game.data.characterGen || {}).convo.goalFollow || {})[goal] || [];
    T.ok('test villager has a goal with a beat pool', pool.length > 0, 'goal=' + goal + ' pool=' + pool.length);
    if (pool.length) {
      openSitting(Game, donor);
      for (const line of pool) { try { Game.sayLine(donor, line); } catch (e) {} }
      const rl = Game.convoRunLedger();
      T.ok('run ledger holds every pool line (donor poison)', pool.every(l => rl.indexOf(l) !== -1), 'missing=' + pool.filter(l => rl.indexOf(l) === -1).length);
      closeSitting(Game, donor);
      const hit = reactUntilBeat(Game, test, 8);
      T.ok('react beat path fired within 8 attempts (discriminator)', !!hit, hit ? ('attempts=' + hit.attempts) : 'gate never fired');
      if (hit) {
        const text = hit.lines.join(' ');
        const hasWinddown = DEADREACT.some(l => text.includes(l));
        T.ok('DISCRIMINATOR test react winds down honestly (fix) instead of drying', !DRY.test(text) && hasWinddown, text.slice(0, 200));
        T.ok('test react does NOT re-speak a blocked pool beat', !pool.some(l => text.includes(l)), text.slice(0, 200));
      }
    }
  }

  T.done();
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(1); });
