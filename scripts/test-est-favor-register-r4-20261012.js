#!/usr/bin/env node
// Journey ESTABLISHMENT r4 blank — FAVOR FOLLOW-UP VOICE proof test (2026-10-12).
//
// Two voice bugs in favor follow-ups (caught live in r4 transcripts, seed 777-day25):
//
// 1. FIRST-PERSON REGISTER BREAK: favor.short is spoken by the asker
//    themselves in EVERY follow-up head ("About {short} — have you had a
//    chance?", "Never mind {short} — we got it handled", the repay opener,
//    "You came through on {short}", "You said you'd help with {short}...").
//    Three kinds shipped third-person shorts for the asker's OWN need:
//      food_share: 'the food they needed'  ("About the food they needed — ...")
//      heal_help:  'their injury'          ("About their injury — ...")
//      sick_help:  'the sickness they're fighting'
//    Fixed: 'the food I needed' / 'this wound' / 'the sickness I'm fighting'.
//    (The journal-facing favor.task keeps third person — the narrator quotes
//    it: "Lena catches your eye across the fire. 'help Lena with their
//    injury' — done." — correct as-is.)
//
// 2. DOUBLE-PREFIX: conversation.js's unfinished-business opener prefixed
//    "About {seedNote} — " unless the follow-up already self-named — but the
//    guard only recognized `"About ` heads. The settled heads ("Never mind
//    ...", "You came through on ...", "You said you'd help with ...") got the
//    redundant prefix, live: "About the help I asked you for — Never mind
//    the food they needed — we got it handled. Thanks anyway."
//    Fixed: the alreadyNamed guard recognizes all four self-naming heads.
//
// RED on pristine (PRISTINE=1 swaps convo-wants.js + conversation.js from
//   git HEAD): third-person shorts asserted, alreadyNamed misses the settled
//   heads.
// GREEN fixed: all follow-up heads first-person; every head matches the
//   alreadyNamed guard in conversation.js (coupling guard: the test extracts
//   the actual regex from conversation.js source, so a future head added to
//   convoFavorFollowup without widening the guard goes RED).
//
// Usage: node scripts/test-est-favor-register-r4-20261012.js
//        PRISTINE=1 node scripts/test-est-favor-register-r4-20261012.js

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ROOT = path.join(__dirname, '..');

let _s = 424242;
Math.random = function () {
  _s |= 0; _s = (_s + 0x6D2B79F5) | 0;
  let t = Math.imul(_s ^ (_s >>> 15), 1 | _s);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
global.fetch = (f) => Promise.resolve({
  json: () => Promise.resolve(JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8')))
});
global.localStorage = {
  _m: {},
  getItem(k) { return (k in this._m) ? this._m[k] : null; },
  setItem(k, v) { this._m[k] = String(v); },
  removeItem(k) { delete this._m[k]; },
};
global.window = global;
const files = [];
for (const line of fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').split('\n')) {
  const m = /src\/js\/[^\"]*\.js/.exec(line);
  if (m && !/app\.js|tile-scenes\.js|move-anim\.js|drama\.js|sprites\.js/.test(m[0])) files.push(m[0]);
}
const PRISTINE = process.env.PRISTINE === '1';
const SWAPPED = ['src/js/convo-wants.js', 'src/js/conversation.js'];
for (const f of files) {
  let src = fs.readFileSync(path.join(ROOT, f), 'utf8');
  if (PRISTINE && SWAPPED.includes(f)) {
    src = execSync('git show HEAD:' + f, { cwd: ROOT }).toString('utf8');
  }
  eval(src);
}
delete global.window;
const Game = globalThis.Scattering.Game;

// The alreadyNamed guard, read from conversation.js — the coupling this test
// pins down. (Under PRISTINE the swapped conversation.js supplies the old
// narrow guard.) Since r5 the guard lives in Game.convoFavorHead (shared with
// voiceLine); prefer the behavioral API and fall back to regex extraction
// from source for pristine trees that predate it.
const convoSrc = (PRISTINE
  ? execSync('git show HEAD:src/js/conversation.js', { cwd: ROOT }).toString('utf8')
  : fs.readFileSync(path.join(ROOT, 'src/js/conversation.js'), 'utf8'));
let ALREADY_NAMED, guardDesc;
if (!PRISTINE && typeof Game.convoFavorHead === 'function') {
  ALREADY_NAMED = (line) => Game.convoFavorHead(line);
  guardDesc = 'Game.convoFavorHead() (behavioral)';
} else {
  const guardMatch = /const alreadyNamed = (\/.+?\/)\.test\(opener\.line\)/.exec(convoSrc);
  ALREADY_NAMED = guardMatch ? (line) => eval(guardMatch[1]).test(line) : () => false;
  guardDesc = guardMatch ? guardMatch[1] : 'NOT FOUND';
}

let pass = 0, fail = 0;
function ok(cond, name, detail) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (detail ? '\n    -> ' + detail : '')); }
}

const BAD = /their injury|the food they needed|the sickness they're fighting/i;

const KINDS = [
  { kind: 'food_share', expect: 'the food I needed',
    need: { kind: 'food_share', urgency: 4, hunger: 90 },
    live: (v, vid) => { try { Game.npcNeeds(vid).hunger = 90; } catch (e) {} } },
  { kind: 'heal_help', expect: 'this wound',
    need: { kind: 'heal_help', urgency: 4, health: 40 },
    live: (v, vid) => { v.health = v.health || {}; v.health[vid] = 40; } },
  { kind: 'sick_help', expect: "the sickness I'm fighting",
    need: { kind: 'sick_help', urgency: 4, health: 50, sickName: 'gut rot' },
    live: (v, vid) => { v.sick = v.sick || {}; v.sick[vid] = { daysLeft: 3 }; } },
];

async function main() {
  console.log((PRISTINE ? 'PRISTINE (expect RED)' : 'FIXED (expect GREEN)') + ' — favor follow-up voice');
  console.log('  alreadyNamed guard from conversation.js: ' + guardDesc);
  ok(guardDesc !== 'NOT FOUND', 'alreadyNamed guard present in conversation.js');

  await Game.init();
  Game.genDetail = function () { return {}; };
  Game.genRoster('Columbus, Ohio');
  Game.newGame('Columbus, Ohio', null, Game.generatedRoster[0].id);
  Game.depart();
  const roster = (Game.state.village.roster || []).filter(id => id !== Game.villagerId);
  const v = Game.state.village;

  for (const K of KINDS) {
    const vid = roster.find(id => { try { return Game.npcComm(id).level === 'full'; } catch (e) { return false; } }) || roster[0];
    K.live(v, vid);
    Game.state.scholar.day = 20;
    const favor = Game.convoBuildFavor(vid, K.need);
    ok(favor && favor.kind === K.kind, `${K.kind}: favor builds from a real need`);
    if (!favor) continue;
    Game.convoStoreFavor(favor);

    // 'promised' needs a live promise record (openFavorObligation reads
    // village.promises).
    v.promises = v.promises || {};
    v.promises[vid] = { kept: false, favorId: favor.id, favorTask: favor.task, day: 20, favorDeadline: 22 };

    // asked state needs the need live (convoFavorNeedLive) — set above.
    const heads = {};
    for (const state of ['promised', 'fulfilled', 'broken', 'asked']) {
      favor.state = state;
      favor.inheritedAcked = true; // skip the predecessor branch — register is what we test
      try { heads[state] = Game.convoFavorFollowup(vid, favor); }
      catch (e) { heads[state] = 'ERR ' + (e && e.message); }
    }
    // 'moot' is only reached through the asked branch with a dead need —
    // the live transcript (777-day25) showed exactly this. Mirror it.
    favor.state = 'asked';
    favor.inheritedAcked = true;
    if (K.kind === 'food_share') { try { Game.npcNeeds(vid).hunger = 0; } catch (e) {} }
    if (K.kind === 'heal_help') { v.health[vid] = 100; }
    if (K.kind === 'sick_help') { v.sick[vid] = { daysLeft: 0 }; }
    try { heads.moot = Game.convoFavorFollowup(vid, favor); }
    catch (e) { heads.moot = 'ERR ' + (e && e.message); }
    // restore the live need for the remaining checks
    K.live(v, vid);
    const all = Object.values(heads).join('\n');
    ok(!BAD.test(all), `${K.kind}: no third-person slip in any follow-up head`, all);
    ok(all.indexOf(K.expect) !== -1, `${K.kind}: first-person short "${K.expect}" in heads`, all);
    for (const state of ['promised', 'fulfilled', 'broken', 'moot', 'asked']) {
      const line = heads[state];
      ok(typeof line === 'string' && ALREADY_NAMED(line),
        `${K.kind}/${state}: head recognized by alreadyNamed (no seed double-prefix)`, line);
    }
    // the repay opener for an open promise also speaks the short
    try {
      const open = Game.openFavorObligation(vid);
      ok(open && open.favorId === favor.id, `${K.kind}: openFavorObligation finds the promise`);
    } catch (e) { ok(false, `${K.kind}: openFavorObligation finds the promise`, e && e.message); }
    // the repay SEED note ("{short} you promised") is ledger text the NPC
    // later speaks back — assert the first-person register there too.
    const repayNote = favor.short + ' you promised';
    ok(!BAD.test(repayNote) && repayNote.indexOf(K.expect) !== -1,
      `${K.kind}: repay seed note first-person ("${repayNote}")`, repayNote);
  }

  console.log('\nRESULT: ' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('HARNESS ERROR:', e); process.exit(2); });
