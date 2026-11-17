#!/usr/bin/env node
// test-journey-social-life-r234-dry2-20261117.js — proof test for the r234
// DRY2 fix (journey-social-life r234; the r231 DRY2 finding: 4 dry servings
// at 3 new sites, F6 holding at its three sites).
//
// THE DEFECTS (all "...Sorry, lost my train of thought." — the dry line):
//   1. dlg:doubt stonewall hole (convo-dialogue.js): the stonewall
//      ("They shake their head — not no, not yes. Done talking about it.")
//      was served as the PRIMARY line when all probe-branch variants were
//      blocked, so sayLine LEDGERED it; a later sitting found all branch
//      variants blocked AND the stonewall run-blocked, and sayLine's
//      run-block branch serves the dry line, ignoring opts.fallback.
//      (45706 Raj d31/d32.)
//   2. confront result (truth.js): the handler called sayLine(vid, r.line)
//      with NO WouldBlock check and NO fallback; a run-ledger-blocked r.line
//      dried. (45708 gen_o1jb3sv d50: third confront returned the
//      '"Never mind."' guard line, which sat in the 48-entry run ledger.)
//   3. neighbors topic reply (convoTopics.js topic2Ask): generated topic
//      lines are composed from shared village state — two villagers asked
//      about the same thing produce byte-identical lines — and t2pick treats
//      run-ledger avoidance as a preference, so a run-blocked line reached
//      the generic emission and dried. (45706 Raj d132.)
//
// THE FIXES:
//   1. The stonewall emission is ledger-exempt (structural: true) — only
//      when the handler falls to the stonewall; pool variants keep ledgering.
//   2. The confront handler WouldBlock-checks r.line; on the blocked path
//      only it re-speaks with the diegetic-act exemption (the outcome already
//      fired inside confrontDoubt — same class as r86 lessons).
//   3. topic2Ask WouldBlock-checks the composed line; if blocked it returns
//      the honest exhausted line (same as the null-pool branch).
//
// PROOF SHAPE (godpath lib, real sittings, real sayLine ledger — F6/r192
// pattern): every discriminator poisons the run ledger through ANOTHER
// villager's real sitting, never by writing the ledger directly.
//   1. probe: a donor hammers dlg:doubt until the stonewall speaks once
//      (all branch variants + stonewall in the run ledger); the test
//      villager then presses the probe 3x — the 3rd press (branch 3, all
//      variants blocked) discriminates: base dries, fix stonewalls. Three
//      further presses stonewall repeatedly, never dry (fix).
//   2. confront: a donor confesses (shame motive + trust 90 + warm temper
//      => confessP > 1, guaranteed), then re-confronts the resolved doubt
//      and speaks '"Never mind."' into the run ledger; the test villager
//      (resolved doubt staged via the real addDoubt/resolveDoubt APIs)
//      confronts — base dries, fix speaks '"Never mind."'
//   3. neighbors: donor and test both learn the same village through the
//      real recordVillageLore API (no grievance events => a single
//      deterministic candidate line); the donor asks first and speaks it
//      into the run ledger; the test villager asks — base dries, fix serves
//      the exhausted line.
// Guards (pass on base and fix): clean-ledger first prod speaks the
// original branch-1 line verbatim; a clean-ledger confession speaks
// without drying; a clean-ledger neighbors ask speaks the neighbors line.
// Usage: node scripts/test-journey-social-life-r234-dry2-20261117.js
'use strict';
const K = require('./godpath/lib');
const T = K.reporter('journey-social-life-r234-dry2');

const DRY = /lost my train of thought/;
const STONEWALL = 'They shake their head — not no, not yes. Done talking about it.';
const NEVERMIND = '"Never mind."';
const ORIG1 = '"...What\'s that supposed to mean?" Their voice goes careful.';
const BRANCH3 = [
  'They\'re rattled — hands busy, eyes everywhere but on you. "I\'ve told you what I\'ve told you."',
  'Their hands won\'t keep still. "I\'ve said what I\'ve said. That\'s all there is."',
  '"I\'ve told you everything I\'m going to tell you." They won\'t meet your eyes. "Leave it there."',
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
function press(Game, vid, choiceId) {
  const c = convo(Game, vid);
  const before = (c && c.transcript ? c.transcript.length : 0);
  let r = null;
  try { r = Game.convoTurn(vid, choiceId); } catch (e) { return { err: String(e && e.message), lines: [] }; }
  return { ret: r, lines: npcLines(Game, vid, before), active: !!(convo(Game, vid) && convo(Game, vid).active) };
}
// Press a choice, reopening the sitting whenever it closes. Returns the
// collected NPC lines across (re)opened sittings.
function pressAcrossSittings(Game, vid, choiceId, n) {
  const out = [];
  for (let i = 0; i < n; i++) {
    let c = convo(Game, vid);
    if (!c || !c.active) { try { openSitting(Game, vid); } catch (e) { out.push({ err: 'reopen: ' + e.message }); break; } }
    const p = press(Game, vid, choiceId);
    out.push(p);
    if (p.err) break;
  }
  return out;
}
function plantSlipDoubt(Game, vid) {
  const vp = Game.vpOf(vid);
  const lie = Game.makeLie(vp, 'origin', 'shame');
  lie.confessed = false;
  vp.lies = { origin: lie };
  Game.truthSlip(vid, lie);
  const doubts = Game.getDoubts(vid);
  if (doubts.length !== 1) throw new Error('expected 1 open slip doubt on ' + Game.displayName(vid) + ', got ' + doubts.length);
  return doubts[0];
}

(async () => {
  const Game = await K.load({ seed: 234100 });

  // ============ 1. PROBE STONEWALL ============
  T.section('1. Probe stonewall (DRY2 site 1)');
  // 1a. Guard: clean-ledger first prod speaks the original branch-1 line.
  K.newRun(Game);
  try { Game.convoRunLedger().length = 0; } catch (e) {}
  let sp = speaking(Game);
  T.ok('fresh run has >= 2 speaking villagers (probe guard)', sp.length >= 2, 'got ' + sp.length);
  if (sp.length >= 2) {
    const vid = sp[0];
    Game.state.village.trust[vid] = 50;
    plantSlipDoubt(Game, vid);
    openSitting(Game, vid);
    const p = press(Game, vid, 'dlg:doubt');
    const text = p.lines.join(' ');
    T.ok('clean-ledger first prod speaks the original branch-1 line verbatim', text.includes(ORIG1), text.slice(0, 200));
    T.ok('clean-ledger first prod speaks no dry line', !DRY.test(text), text.slice(0, 200));
    closeSitting(Game, vid);
  }

  // 1b. Discriminator: donor hammers to the stonewall; test villager's
  // 3rd probe press must stonewall (fix) / dry (base).
  K.newRun(Game);
  try { Game.convoRunLedger().length = 0; } catch (e) {}
  sp = speaking(Game);
  T.ok('fresh run has >= 2 speaking villagers (probe discriminator)', sp.length >= 2, 'got ' + sp.length);
  if (sp.length >= 2) {
    const donor = sp[0], test = sp[1];
    Game.state.village.trust[donor] = 50;
    Game.state.village.trust[test] = 50;
    plantSlipDoubt(Game, donor);
    plantSlipDoubt(Game, test);
    // Donor hammers until the stonewall speaks once (max 12 presses,
    // reopening the sitting whenever the budget closes it).
    let donorStonewalled = false;
    let donorDry = false;
    let donorPresses = 0;
    for (let i = 0; i < 12 && !donorStonewalled; i++) {
      const batch = pressAcrossSittings(Game, donor, 'dlg:doubt', 1);
      donorPresses++;
      for (const p of batch) {
        if (p.err) break;
        const text = (p.lines || []).join(' ');
        if (DRY.test(text)) donorDry = true;
        if (text.includes(STONEWALL)) donorStonewalled = true;
      }
      if (batch.some(p => p.err)) break;
    }
    T.ok('donor hammer speaks the stonewall once (wild d30 shape)', donorStonewalled, 'presses=' + donorPresses);
    T.ok('donor hammer speaks no dry line', !donorDry, 'donor dried while hammering');
    closeSitting(Game, donor);
    // Test villager: presses 1-2 speak branch variants; press 3 is branch 3
    // with all variants blocked (donor spoke them) => stonewall or dry.
    openSitting(Game, test);
    const p1 = press(Game, test, 'dlg:doubt');
    const p2 = press(Game, test, 'dlg:doubt');
    const t1 = p1.lines.join(' ');
    const t2 = p2.lines.join(' ');
    T.ok('test press 1 speaks a probe variant, no dry', !DRY.test(t1) && t1.length > 0, t1.slice(0, 160));
    T.ok('test press 2 speaks a probe variant, no dry', !DRY.test(t2) && t2.length > 0, t2.slice(0, 160));
    const p3 = press(Game, test, 'dlg:doubt');
    const t3 = p3.lines.join(' ');
    T.ok('DISCRIMINATOR press 3 stonewalls (fix) instead of drying', t3.includes(STONEWALL) && !DRY.test(t3), t3.slice(0, 200));
    // Hammer guard: three further presses in the same sitting stonewall
    // repeatedly, never dry (the stonewall is ledger-exempt on fix).
    const more = [];
    for (let i = 0; i < 3; i++) {
      const c = convo(Game, test);
      if (!c || !c.active) break;
      more.push(press(Game, test, 'dlg:doubt'));
    }
    const moreText = more.map(p => (p.lines || []).join(' ')).join(' | ');
    T.ok('hammered probe stonewalls repeatedly, never dries', more.length >= 1 && more.every(p => (p.lines || []).join(' ').includes(STONEWALL)) && !DRY.test(moreText), moreText.slice(0, 300) || 'sitting closed after discriminator');
    closeSitting(Game, test);
  }

  // ============ 2. CONFRONT NEVER-MIND ============
  T.section('2. Confront guard line (DRY2 site 2)');
  K.newRun(Game);
  try { Game.convoRunLedger().length = 0; } catch (e) {}
  sp = speaking(Game);
  T.ok('fresh run has >= 2 speaking villagers (confront)', sp.length >= 2, 'got ' + sp.length);
  if (sp.length >= 2) {
    const donor = sp[0], test = sp[1];
    const v = Game.state.village;
    v.trust = v.trust || {};
    // Donor: shame lie + warm temper + trust 90 => confessP > 1, guaranteed.
    v.trust[donor] = 90;
    const dvp = Game.vpOf(donor);
    try { dvp.personality = dvp.personality || {}; dvp.personality.temperament = 'warm'; } catch (e) {}
    T.ok('donor temper stages warm', Game.npcTemper(donor) === 'warm', 'got ' + Game.npcTemper(donor));
    const dDoubt = plantSlipDoubt(Game, donor);
    openSitting(Game, donor);
    const c1 = press(Game, donor, 'confront:' + dDoubt.id);
    const c1text = c1.lines.join(' ');
    T.ok('donor first confront confesses (no dry)', !DRY.test(c1text) && c1text.length > 0, c1text.slice(0, 200));
    let resolved = null;
    try { resolved = (Game.getDoubts(donor, true) || []).find(d => d.id === dDoubt.id); } catch (e) {}
    T.ok('donor doubt resolves after the confession', !!(resolved && resolved.resolved), 'resolved=' + !!(resolved && resolved.resolved));
    // Donor re-confronts the resolved doubt: speaks '"Never mind."' into
    // the run ledger (the wild d50 poison, through a real sitting).
    const c2 = press(Game, donor, 'confront:' + dDoubt.id);
    const c2text = c2.lines.join(' ');
    T.ok('donor re-confront speaks \'"Never mind."\' (ledger poison)', c2text.includes(NEVERMIND) && !DRY.test(c2text), c2text.slice(0, 200));
    closeSitting(Game, donor);
    // Test villager: a resolved doubt staged via the real APIs, then one
    // confront. The guard line is run-blocked (donor spoke it) => base
    // dries, fix speaks it (diegetic-act exemption).
    v.trust[test] = 50;
    const td = Game.addDoubt(test, 'observation', 'Staged doubt for the r234 DRY2 proof.', [], {});
    T.ok('test doubt planted via addDoubt', !!(td && td.id), 'id=' + (td && td.id));
    try { Game.resolveDoubt(td.id, 'r234 proof staging'); } catch (e) {}
    let tres = null;
    try { tres = (Game.getDoubts(test, true) || []).find(d => d.id === td.id); } catch (e) {}
    T.ok('test doubt resolves via resolveDoubt', !!(tres && tres.resolved), 'resolved=' + !!(tres && tres.resolved));
    openSitting(Game, test);
    const c3 = press(Game, test, 'confront:' + td.id);
    const c3text = c3.lines.join(' ');
    T.ok('DISCRIMINATOR confront speaks \'"Never mind."\' (fix) instead of drying', c3text.includes(NEVERMIND) && !DRY.test(c3text), c3text.slice(0, 200));
    closeSitting(Game, test);
  }

  // ============ 3. NEIGHBORS TOPIC REPLY ============
  T.section('3. Neighbors topic reply (DRY2 site 3)');
  // 3a. Guard: clean-ledger neighbors ask speaks the neighbors line.
  K.newRun(Game);
  try { Game.convoRunLedger().length = 0; } catch (e) {}
  sp = speaking(Game);
  const ovs = (Game.state.otherVillages || []);
  T.ok('fresh run has other villages', ovs.length >= 1, 'got ' + ovs.length);
  if (sp.length >= 3 && ovs.length >= 1) {
    const ovId = ovs[0].id;
    const scholarId = Game.villagerId;
    const guard = sp[0];
    Game.state.village.trust[guard] = 50;
    Game.recordVillageLore(guard, ovId, { how: 'told', toldBy: scholarId });
    T.ok('guard villager knows the village via recordVillageLore', !!Game.knowsVillage({ id: ovId }, guard));
    let gcands = [];
    try { gcands = Game.t2gen_neighbors(guard) || []; } catch (e) { gcands = []; }
    T.ok('neighbors generator returns exactly 1 candidate (no-event line, deterministic)', gcands.length === 1, 'got ' + gcands.length);
    if (gcands.length === 1) {
      openSitting(Game, guard);
      const g = press(Game, guard, 'ask:neighbors');
      const gtext = g.lines.join(' ');
      T.ok('clean-ledger neighbors ask speaks the neighbors line, no dry', !DRY.test(gtext) && gtext.includes(ovs[0].name || 'barely know them'), gtext.slice(0, 200));
      closeSitting(Game, guard);
    }
  } else {
    T.ok('fresh run has >= 3 speaking villagers + 1 OV (neighbors guard)', false, 'speaking=' + sp.length + ' ovs=' + ovs.length);
  }

  // 3b. Discriminator: donor asks first (real sitting, speaks the line into
  // the run ledger); test villager asks the same thing — base dries, fix
  // serves the honest exhausted line.
  K.newRun(Game);
  try { Game.convoRunLedger().length = 0; } catch (e) {}
  sp = speaking(Game);
  const ovs2 = (Game.state.otherVillages || []);
  T.ok('fresh run has >= 2 speaking villagers (neighbors discriminator)', sp.length >= 2, 'got ' + sp.length);
  if (sp.length >= 2 && ovs2.length >= 1) {
    const ovId = ovs2[0].id;
    const scholarId = Game.villagerId;
    const donor = sp[0], test = sp[1];
    Game.state.village.trust[donor] = 50;
    Game.state.village.trust[test] = 50;
    Game.recordVillageLore(donor, ovId, { how: 'told', toldBy: scholarId });
    Game.recordVillageLore(test, ovId, { how: 'told', toldBy: scholarId });
    let dcands = [], tcands = [];
    try { dcands = Game.t2gen_neighbors(donor) || []; } catch (e) {}
    try { tcands = Game.t2gen_neighbors(test) || []; } catch (e) {}
    T.ok('donor + test generate the identical single neighbors line', dcands.length === 1 && tcands.length === 1 && String(dcands[0]) === String(tcands[0]), 'donor=' + dcands.length + ' test=' + tcands.length);
    if (dcands.length === 1 && tcands.length === 1 && String(dcands[0]) === String(tcands[0])) {
      const expectLine = String(Game.t2fill(dcands[0], Game.vpOf(donor), donor));
      openSitting(Game, donor);
      const d = press(Game, donor, 'ask:neighbors');
      const dtext = d.lines.join(' ');
      T.ok('donor asks neighbors and speaks the line (ledger poison)', !DRY.test(dtext) && dtext.includes(expectLine.slice(1, 40)), dtext.slice(0, 200));
      closeSitting(Game, donor);
      openSitting(Game, test);
      const t = press(Game, test, 'ask:neighbors');
      const ttext = t.lines.join(' ');
      const exh = ((Game.data.characterGen || {}).convo || {}).exhausted || [];
      const servedExhausted = exh.some(l => ttext.includes(String(l).replace(/^"|"$/g, '').slice(0, 30)));
      T.ok('DISCRIMINATOR test ask serves the exhausted line (fix) instead of drying', !DRY.test(ttext) && servedExhausted, ttext.slice(0, 200));
      T.ok('test ask does NOT re-speak the blocked neighbors line', !ttext.includes(expectLine.slice(1, 40)), ttext.slice(0, 200));
      closeSitting(Game, test);
    }
  }

  T.done();
})().catch(e => { console.error(e.stack); process.exitCode = 1; });
