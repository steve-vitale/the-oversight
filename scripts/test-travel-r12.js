#!/usr/bin/env node
// Break-it travel & map, round 12 (2026-10-11) — hostile-player attacks on
// the FRESH surface landed after r11:
//
//   6f538cd4 "sim-opt phase 2" — npcNodeTravel redundancy fixes: hoisted
//       travelingWith() out of the per-villager loop (loop-invariance
//       claim), removed "dead" npcTemper/npcGoal reads.
//   8b5c9613 "structural-scale Worker A" — engagement-driven foreign-realm
//       growth + young-link succession grace. The grace's 'visit' answer
//       sends a speaker away 2 days via _musterAway/_sendAwayParty — new
//       travel surface.
//
// CATCHES THIS RUN (all in the away-party machinery — the succession-grace
// 'visit' path is the fresh caller that makes the old double-booking class
// newly reachable in a common flow):
//   B1 EXPLOIT — parley member re-drafted by npcNodeTravel: _sendAwayParty
//        never sets v.away / moves the node, and objMaybeDepart never
//        checks _isAwayVid, so a villager "away" on a 2-day parley is sent
//        out foraging the same part — one villager, two trips, two return
//        announcements, forage kcal banked from a phantom trip.
//   B2 EXPLOIT — reverse: _musterAway never checks v.away, so a villager
//        out foraging is drafted for a 2-day parley — the forage clock
//        brings them "home" mid-parley while awayParties still holds them.
//   B3 HONESTY — _musterAway drafts party members/followers: your companion
//        is simultaneously "away on parley" (awayMembers panel) and
//        traveling with you (travelingWith — teleported to you by
//        placePartyAtPlayer, drafted into your fights by startCombat).
//        Also drafts villagers mid-conversation (engaged).
//   B4 HONESTY — awayPartiesReturnTick / loanedReturnTick announce
//        "X walks back in" with no death check: a villager killed at Haven
//        while "away" (their node never moved) walks back in as a corpse.
//        Same class as the DEAD-IS-DEAD rule (betrayal.js 2026-10-08).
//   B5 HONESTY — kindWord for 'parley' falls through to "the road": the
//        renegotiation promises "rides to X's fire" but the return says
//        "the road at X".
// FIXES: _musterAway skips node-travel-away / traveling-with-you / engaged;
//   npcNodeTravel skips _isAwayVid villagers (parley/defense/trade/raid/
//   loan/wounded — away by any ledger is away for the node system too);
//   return ticks partition living/dead and never walk a corpse in;
//   kindWord 'parley' -> 'the parley'.
//
// HELD (attacked, verified, not broken):
//   S1 — sim-opt hoist: old-vs-new game.js behavioral equivalence +
//        static audit (no party/follower writers reachable from any
//        npcNodeTravel-loop callee; temp/goal were provably dead).
//   S2 — foreign-polity drift honesty: drift-only weeks seed pacts but
//        never grow past one pair (code-read + seeded sim).
//   D  — dead-code: travel/map entry points defined AND called.
//
// Run: node scripts/test-travel-r12.js   (SEED env override)
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');

let pass = 0, fail = 0;
const failures = [];
function ok(cond, name, detail) {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; failures.push(name + (detail ? ' — ' + detail : '')); console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); }
}

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const SEED = parseInt(process.env.SEED || '7', 10);
Math.random = mulberry32(SEED);

// ---------- boot the full engine (index.html order, DOM-only excluded) ----------
global.fetch = (f) => Promise.resolve({ json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'))) });
const order = execSync("grep -o 'src/js/[^\"]*\\.js' index.html | head -60", { cwd: ROOT }).toString().split('\n')
  .filter(s => s && !/app\.js|sprites\.js|tile-scenes\.js|move-anim\.js|drama\.js/.test(s));
global.window = global; // stub for the eval phase only (flips combat async — deleted before play)
global.document = { getElementById: () => null, createElement: () => ({ textContent: '', innerHTML: '', style: {}, setAttribute() {}, appendChild() {} }), head: { appendChild() {} }, body: {} };
order.forEach(f => { eval(fs.readFileSync(path.join(ROOT, f), 'utf8')); });
delete global.window; delete global.document;
const Game = globalThis.Scattering.Game;
const said = [];
Game.say = (m) => { said.push(String(m)); };

async function freshGame() {
  await Game.init();
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  said.length = 0;
  Game.dayPart = 1; // midday — departures allowed
  return Game.state.scholar;
}

function roster() { return (Game.state.village.roster || []).filter(id => id !== Game.villagerId); }

// synthetic foreign village + young link, then stage the succession grace
function mkLink(linkId, ovId, ovName) {
  Game.state.otherVillages = Game.state.otherVillages || [];
  if (!Game.state.otherVillages.find(v => v.id === ovId))
    Game.state.otherVillages.push({ id: ovId, name: ovName, generated: true, rumored: true, pantryKcal: 5000 });
  const links = Game.hierarchyState();
  const day = (Game.state.scholar || {}).day || 0;
  const link = { id: linkId, kind: 'belong', status: 'active', primary: 'haven', subordinate: ovId, day: day, trust: 50, tributeKcalPerWeek: 1000 };
  links.push(link);
  const r = Game.successionCrisis(linkId);
  ok(r === 'grace', 'succession grace staged for ' + linkId, 'got ' + r);
  ok(!!link.pendingRenegotiation, 'pendingRenegotiation set for ' + linkId);
  return link;
}

function doVisit(linkId) {
  said.length = 0;
  const r = Game.answerRenegotiation(linkId, 'visit');
  ok(r === 'visit', 'answerRenegotiation visit accepted for ' + linkId, 'got ' + r);
  const m = Game.mshipState();
  const p = (m.awayParties || [])[m.awayParties.length - 1];
  ok(!!p && p.kind === 'parley', 'away party recorded as parley for ' + linkId);
  return p.vids[0];
}

function firstName(vid) { return String(Game.displayName(vid)).split(' ')[0]; }

(async () => {
  // ================= B1: parley member re-drafted by npcNodeTravel =================
  console.log('\n[B1] EXPLOIT: villager away on parley is sent out foraging by npcNodeTravel');
  await freshGame();
  const link1 = mkLink('lnk-b1', 'ov-b1', 'B1ville');
  const X = doVisit('lnk-b1');
  const v = Game.state.village;
  const hx = v.px ?? 4, hy = v.py ?? 4;
  ok(!(v.away || {})[X], 'parley member has no v.away entry (pre)');
  ok(Game._isAwayVid(X), '_isAwayVid sees the parley member');
  // prime X with a ready forage objective, force the danger verdict to 'go'
  const o = Game.objOf(X);
  o.kind = 'FORAGE'; o.purpose = 'forage'; o.state = 'ready'; o.indoor = false;
  o.tx = hx + 1 > 8 ? hx - 1 : hx + 1; o.ty = hy; o.partsLeft = 4; o.tightness = 0;
  const realDanger = Game.objDanger;
  Game.objDanger = () => ({ score: 0, verdict: 'go' });
  for (let i = 0; i < 4; i++) { Game.dayPart = 1; Game.npcNodeTravel(); }
  Game.objDanger = realDanger;
  const doubleBooked = !!((Game.state.village.away || {})[X]);
  ok(!doubleBooked, 'parley member NOT double-booked by npcNodeTravel',
    doubleBooked ? X + ' has v.away (forage) while on parley — one villager, two trips' : '');
  const forageReturnSaid = said.some(s => s.includes('returns from foraging') && s.includes(firstName(X)));
  ok(!forageReturnSaid, 'no phantom "returns from foraging" for the parley member',
    forageReturnSaid ? 'said: ' + said.filter(s => s.includes(firstName(X))).join(' | ') : '');

  // ================= B2: forager drafted to parley (reverse) =================
  console.log('\n[B2] EXPLOIT: villager out foraging is drafted for a parley');
  await freshGame();
  const rs2 = roster();
  const Y = rs2[1];
  // Y is out foraging (node-travel away system)
  Game.state.village.away = Game.state.village.away || {};
  Game.state.village.away[Y] = { nx: hx + 1, ny: hy, purpose: 'forage', sinceDay: 0, sincePart: 0, duration: 8 };
  // burn the first muster pick on someone else: draft Z away first via link
  const Z = rs2[0];
  mkLink('lnk-b2a', 'ov-b2a', 'B2aville');
  const sentA = doVisit('lnk-b2a');
  ok(sentA === Z, 'first muster takes roster[0] (' + firstName(Z) + ')', 'got ' + firstName(sentA));
  mkLink('lnk-b2b', 'ov-b2b', 'B2bville');
  said.length = 0;
  const r2 = Game.answerRenegotiation('lnk-b2b', 'visit');
  const m2 = Game.mshipState();
  const p2 = (m2.awayParties || [])[m2.awayParties.length - 1];
  const draftedY = (p2.vids || []).includes(Y);
  ok(!draftedY, 'foraging villager NOT drafted for parley',
    draftedY ? firstName(Y) + ' drafted while v.away (forage) — double-booked' : '');
  ok(r2 === 'visit', 'second visit still resolves', 'got ' + r2);

  // ================= B3: companion drafted =================
  console.log('\n[B3] HONESTY: party member / engaged villager drafted for parley');
  await freshGame();
  const rs3 = roster();
  const C = rs3[0], E = rs3[1];
  Game.partyState().party.push(C); // C travels with the player
  ok(Game.travelingWith().includes(C), 'C is traveling with the player (setup)');
  Game.state.village.engaged = Game.state.village.engaged || {};
  Game.state.village.engaged[E] = 2; // E is mid-conversation with the player
  mkLink('lnk-b3', 'ov-b3', 'B3ville');
  said.length = 0;
  Game.answerRenegotiation('lnk-b3', 'visit');
  const m3 = Game.mshipState();
  const p3 = (m3.awayParties || [])[m3.awayParties.length - 1];
  const draftedC = (p3.vids || []).includes(C);
  const draftedE = (p3.vids || []).includes(E);
  ok(!draftedC, 'traveling companion NOT drafted for parley',
    draftedC ? firstName(C) + ' drafted while in travelingWith() — desync' : '');
  ok(!draftedE, 'engaged (mid-conversation) villager NOT drafted for parley',
    draftedE ? firstName(E) + ' drafted mid-conversation' : '');
  Game.partyState().party = Game.partyState().party.filter(id => id !== C);

  // ================= B4: the dead walk back in =================
  console.log('\n[B4] HONESTY: dead villager announced as walking back in');
  await freshGame();
  mkLink('lnk-b4', 'ov-b4', 'B4ville');
  const D = doVisit('lnk-b4');
  const dnm = firstName(D);
  Game.vpOf(D).dead = true; // killed at Haven while "away" (node never moved)
  Game.state.scholar.day += 3;
  said.length = 0;
  Game.membershipDaily();
  const walkIn = said.some(s => s.includes(dnm) && s.includes('walks back in'));
  ok(!walkIn, 'dead parley member is NOT announced as walking back in',
    walkIn ? 'said: ' + said.filter(s => s.includes(dnm)).join(' | ') : '');
  // sibling: the representative loan
  await freshGame();
  const rs4 = roster();
  const L = rs4[0];
  const m4 = Game.mshipState();
  m4.loaned = { vid: L, untilDay: Game.state.scholar.day, to: 'ov-b4' };
  const lnm = firstName(L);
  Game.vpOf(L).dead = true;
  said.length = 0;
  Game.membershipDaily();
  const loanWalkIn = said.some(s => s.includes(lnm) && s.includes('walks back in'));
  ok(!loanWalkIn, 'dead loaned representative is NOT announced as walking back in',
    loanWalkIn ? 'said: ' + said.filter(s => s.includes(lnm)).join(' | ') : '');

  // ================= B5: parley kindWord =================
  console.log('\n[B5] HONESTY: parley return names the parley, not "the road"');
  await freshGame();
  mkLink('lnk-b5', 'ov-b5', 'B5ville');
  const P = doVisit('lnk-b5');
  const pnm = firstName(P);
  Game.state.scholar.day += 3;
  said.length = 0;
  Game.membershipDaily();
  const retLine = said.find(s => s.includes(pnm) && s.includes('back in'));
  ok(!!retLine && retLine.includes('the parley'), 'parley return says "the parley"',
    'got: ' + (retLine || '(no return line)'));

  // ================= B6: representative-loan muster (sibling sweep) =================
  console.log('\n[B6] SIBLING: loan sites muster available bodies, never the player');
  await freshGame();
  {
    // B6a: the player is the best social speaker — the aid loan must not
    // loan the player's own id (old code did: "X walks out to serve" for a
    // walk-out that never happened, then "walks back in").
    const me = Game.villagerId;
    Game.state.village.trust = Game.state.village.trust || {};
    for (const id of roster()) Game.state.village.trust[id] = 0;
    Game.state.village.trust[me] = 100;
    ok(Game.representative().id === me, 'setup: player is the social representative');
    const av = Game._availableRepresentative();
    ok(!av || av.id !== me, 'available representative is never the player', av ? 'got ' + av.id : '');
    const link = mkLink('lnk-b6a', 'ov-b6a', 'B6aville');
    link.pendingDemand = { kind: 'aid' };
    said.length = 0;
    Game.answerDemand('lnk-b6a', true);
    const m = Game.mshipState();
    ok(!!m.loaned && m.loaned.vid !== me, 'aid demand loans a villager, never the player',
      m.loaned ? 'loaned: ' + m.loaned.vid + ' (me=' + me + ')' : 'nobody loaned — vacuous');
    if (m.loaned) m.loaned = null; // reset for the next sub-case
  }
  await freshGame();
  {
    // B6b: best speaker out foraging — the aid loan takes the next
    // available body, not the forager.
    const rs = roster();
    const best = rs[0], alt = rs[1];
    Game.state.village.trust = Game.state.village.trust || {};
    Game.state.village.trust[best] = 100; Game.state.village.trust[alt] = 50;
    Game.state.village.away = Game.state.village.away || {};
    Game.state.village.away[best] = { nx: 5, ny: 5, purpose: 'forage', sinceDay: 0, sincePart: 0, duration: 99 };
    const link = mkLink('lnk-b6b', 'ov-b6b', 'B6bville');
    link.pendingDemand = { kind: 'aid' };
    said.length = 0;
    Game.answerDemand('lnk-b6b', true);
    const m = Game.mshipState();
    ok(!!m.loaned && m.loaned.vid !== best, 'aid loan skips the foraging best speaker',
      m.loaned ? 'loaned: ' + firstName(m.loaned.vid) : 'nobody loaned');
    ok(!!m.loaned && m.loaned.vid === alt, 'aid loan takes the next-available speaker',
      m.loaned ? 'loaned: ' + firstName(m.loaned.vid) : 'nobody loaned');
  }
  await freshGame();
  {
    // B6c: accord 'visit' with the whole bench busy — no phantom loan;
    // the player-goes fallback says so honestly.
    const v = Game.state.village;
    v.away = v.away || {};
    for (const id of roster()) v.away[id] = { nx: 5, ny: 5, purpose: 'forage', sinceDay: 0, sincePart: 0, duration: 99 };
    const link = mkLink('lnk-b6c', 'ov-b6c', 'B6cville');
    Game.state.pendingAccord = { linkId: 'lnk-b6c', day: 0 };
    said.length = 0;
    const r = Game.answerAccord('visit');
    ok(r === true, 'accord visit resolves with busy bench');
    ok(!Game.mshipState().loaned, 'no phantom loan when the bench is busy');
    ok(said.some(s => s.includes('You go yourself')), 'player-goes fallback said aloud',
      said.join(' | ').slice(0, 160));
  }
  await freshGame();
  {
    // B6d: global champion with the whole bench busy — honest "no speaker".
    const v = Game.state.village;
    v.away = v.away || {};
    for (const id of roster()) v.away[id] = { nx: 5, ny: 5, purpose: 'forage', sinceDay: 0, sincePart: 0, duration: 99 };
    Game.state.pendingGlobal = { day: 0 };
    said.length = 0;
    Game.answerGlobalChoice('champion');
    ok(!Game.mshipState().loaned, 'no phantom champion loan when the bench is busy');
    ok(said.some(s => s.includes('no speaker to send')), 'honest "no speaker" line said aloud',
      said.join(' | ').slice(0, 160));
  }

  // ================= S2: foreign-polity drift honesty =================
  console.log('\n[S2] drift-only weeks seed pacts but never build past one pair');
  await freshGame();
  Game.state.networkLive = true;
  Game.state.otherVillages = [
    { id: 'ov-s1', name: 'S1ville', generated: true },
    { id: 'ov-s2', name: 'S2ville', generated: true },
    { id: 'ov-s3', name: 'S3ville', generated: true },
    { id: 'ov-s4', name: 'S4ville', generated: true },
  ];
  Game.state._regionStir = 0; Game.state._regionStirKinds = [];
  let maxSubs = 0, weeks = 0;
  const realSay = said.length;
  for (let w = 0; w < 60; w++) {
    Game.state._lastForeignPolityWeek = null;
    Game.state.scholar.day = w * 7 + 1;
    // force the week gate open: _week() derives from day
    Game._foreignPolitySim();
    const fps = Game.foreignPolities();
    for (const f of fps) maxSubs = Math.max(maxSubs, (f.subs || []).length);
    weeks++;
  }
  void realSay; void weeks;
  const finalFps = Game.foreignPolities();
  const pairsOnly = finalFps.every(f => (f.subs || []).length <= 1);
  ok(pairsOnly, 'drift-only: no polity ever grew past one pair in 60 weeks',
    'maxSubs seen: ' + maxSubs + ', polities: ' + JSON.stringify(finalFps.map(f => f.subs.length)));
  // engagement CAN grow past a pair: bank beats then sim
  Game.state._regionStir = 12;
  let grew = false;
  for (let w = 0; w < 40 && !grew; w++) {
    Game.state._lastForeignPolityWeek = null;
    Game.state.scholar.day = 500 + w * 7 + 1;
    Game.state._regionStir = 12;
    Game._foreignPolitySim();
    const fps = Game.foreignPolities();
    if (fps.some(f => (f.subs || []).length > 1)) grew = true;
  }
  ok(grew, 'engaged weeks CAN grow a polity past one pair (deed-gated, not calendar)');

  // ================= D: dead-code =================
  console.log('\n[D] dead-code: travel/map entry points defined AND called');
  // NOTE: `order` excludes DOM-only app.js — scan ALL js files here so
  // app.js call sites (Game.answerRenegotiation, Game.awayMembers) count.
  const allJs = execSync("grep -o 'src/js/[^\"]*\\.js' index.html | head -70", { cwd: ROOT }).toString().split('\n').filter(Boolean);
  const srcAll = allJs.map(f => { try { return fs.readFileSync(path.join(ROOT, f), 'utf8'); } catch (e) { return ''; } }).join('\n');
  for (const fn of ['_musterAway', '_sendAwayParty', 'answerRenegotiation', '_renegotiationTick',
    'awayPartiesReturnTick', 'loanedReturnTick', 'awayMembers', '_isAwayVid',
    'npcNodeTravel', 'travelingWith', 'objMaybeDepart', 'objAwayStep']) {
    const defined = new RegExp('\\b' + fn + '\\s*\\(|\\b' + fn + ':').test(srcAll);
    const calls = (srcAll.match(new RegExp('(?:this|Game)\\.' + fn + '\\(', 'g')) || []).length;
    ok(defined && calls > 0, 'Game.' + fn + ' defined and called (' + calls + ' call sites)');
  }

  console.log('\n==== r12: ' + pass + ' passed, ' + fail + ' failed ====');
  if (failures.length) { console.log('failures:'); failures.forEach(f => console.log(' - ' + f)); }
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
