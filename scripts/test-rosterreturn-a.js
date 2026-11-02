#!/usr/bin/env node
// test-rosterreturn-a.js — proof for sim-rosterreturn-a (DIAG only).
// Proves the traced mechanism two ways:
//  (A) LIVE harness: a dead-flagged roster id stays an npcIds candidate
//      (isMember false, candidacy true); removeVillager preserves its
//      trust entry and sets vp dead.
//  (A-FLIP, sim-deadid-a 2026-11-02, design changed on purpose): the
//      arrival half of (A) no longer re-adds the id — arrivalTick now
//      REFUSES a dead-flagged arrival (no roster push) and genApplicant
//      excludes dead ids. The original 29/29 run (old behavior) is
//      recorded in evidence/2026-11-02/sim-rosterreturn-a.md; the live
//      arrival assertions below now pin the NEW behavior, and the
//      driver-JSON part (B) is untouched historical analysis.
//  (B) DRIVER-JSON analysis: the 97330 judged run reproduces the
//      bearerorder death chain and traces Nora's return step by step
//      (genApplicant d109 -> auto-accept d109 -> arrivalTick push d111
//      membership.js:612 -> d112 snapshot appended last); the 97338 run
//      shows no roster reappearance at all.
// Usage: node scripts/test-rosterreturn-a.js
// Requires the driver outputs at evidence/2026-11-02/perseed-rosterreturn-a/.
// Exit 0 on all green, 1 on any failure.
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));

let pass = 0, fail = 0;
function ok(cond, label) {
  if (cond) { pass++; console.log('PASS: ' + label); }
  else { fail++; console.log('FAIL: ' + label); }
}
function eq(a, b, label) { ok(a === b, label + ' (got ' + JSON.stringify(a) + ', want ' + JSON.stringify(b) + ')'); }

async function livePart() {
  const { Game } = await loadGame({ seed: 42, mode: 'herald', fullTelemetry: false });
  await setupGame(Game);
  const v = Game.state.village || {};
  const roster = v.roster || [];
  const bearer = Game.villagerId;
  const X = roster.find(function (id) { return id && id !== bearer; });
  ok(!!X, 'live: a non-bearer roster id exists (got ' + X + ')');
  if (!X) return;
  // Silence narration for the manipulation steps (say is UI, not state).
  const origSay = Game.say;
  Game.say = function () {};
  try {
    const rec = (Game.data.villagers || []).find(function (r) { return r.id === X; });
    ok(!!rec, 'live: roster id resolves to a data.villagers record');
    if (rec) rec.dead = true;
    ok(Game.npcIds().indexOf(X) >= 0, 'live: dead-flagged roster id is STILL an npcIds candidate (no dead filter)');
    eq(Game.isMember(X), false, 'live: dead-flagged roster id isMember is false');
    v.trust = v.trust || {};
    v.trust[X] = 90;
    Game.removeVillager(X, 'killed');
    ok((v.roster || []).indexOf(X) < 0, 'live: removeVillager(killed) drops the id from the roster');
    eq(v.trust[X], 90, 'live: removeVillager preserves the trust entry (90)');
    eq(!!(Game.vpOf(X) || {}).dead, true, 'live: vpOf dead flag set after killed removal');
    // Re-application arrival, as arrivalTick performs it.
    const day = (Game.state.scholar || {}).day || 0;
    const m = Game.mshipState();
    m.arrivals = m.arrivals || [];
    m.arrivals.push({ id: X, charId: X, name: 'Test Return', arriveDay: day });
    const beforeLen = (v.roster || []).length;
    Game.arrivalTick();
    const after = v.roster || [];
    ok(after.indexOf(X) < 0, 'live: arrivalTick REFUSES a dead-flagged arrival (no roster push, sim-deadid-a)');
    eq(after.length, beforeLen, 'live: arrivalTick leaves roster length unchanged for a dead-flagged arrival');
    eq(v.trust[X], 90, 'live: arrivalTick preserves the old trust entry (no reset to 20)');
    eq(!!(Game.vpOf(X) || {}).dead, true, 'live: arrivalTick does NOT clear the vp dead flag');
    eq(Game.isMember(X), false, 'live: refused id isMember still false (dead-flagged)');
    ok(Game.npcIds().indexOf(X) < 0, 'live: refused id is NOT an npcIds candidate (never rejoined)');
  } finally {
    Game.say = origSay;
  }
}

function driverPart() {
  const dir = path.join(REPO, 'evidence', '2026-11-02', 'perseed-rosterreturn-a');
  const r30 = JSON.parse(fs.readFileSync(path.join(dir, 'rr-s97330-r1.json'), 'utf8'));
  const r38 = JSON.parse(fs.readFileSync(path.join(dir, 'rr-s97338-r1.json'), 'utf8'));
  // Bearerorder chain reproduction on 97330 (instrument must not move outcomes).
  const chain30 = r30.deaths.map(function (d) { return d.day + ':' + d.oldName + '->' + d.chosenName; }).join(',');
  eq(chain30, '93:Jenny->Piper,94:Piper->Piya,95:Piya->Patrick,103:Patrick->Vera,106:Vera->Nora,106:Nora->Aroha,106:Aroha->Lamar,107:Lamar->Ivy,112:Ivy->Nora,122:Nora->Omar',
    'driver 97330: death chain reproduces bearerorder exactly');
  // Traced return steps on 97330.
  const traps = r30.trapLog || [];
  const gen = traps.find(function (t) { return t.kind === 'method:genApplicant' && t.note && t.note.app && t.note.app.charId === 'nora_wilson'; });
  ok(!!gen && gen.day === 109, 'driver 97330: genApplicant draws nora_wilson on d109');
  const acc = traps.find(function (t) { return t.kind === 'method:acceptApplication' && t.note && t.note.appId === 'nora_wilson'; });
  ok(!!acc && acc.day === 109, 'driver 97330: nora_wilson application accepted d109 (auto-recruit)');
  const push = traps.find(function (t) { return t.kind === 'push' && (t.pushed || []).indexOf('nora_wilson') >= 0; });
  ok(!!push && push.day === 111, 'driver 97330: arrivalTick pushes nora_wilson on d111');
  ok(!!push && (push.stack || []).some(function (l) { return l.indexOf('membership.js:612') >= 0; }),
    'driver 97330: push stack names membership.js arrivalTick (line 612)');
  ok(!!push && push.nora && push.nora.trust === 90 && push.nora.vpDead === true && push.nora.isMember === false,
    'driver 97330: at push, trust 90 preserved, vpDead true, isMember false');
  const snaps = r30.dailySnap || [];
  const snap = function (d) { return snaps.find(function (s) { return s.day === d; }); };
  const absent = [106, 107, 108, 109, 110, 111].every(function (d) { const s = snap(d); return s && !s.nora.onRoster; });
  ok(absent, 'driver 97330: Nora absent from daily snapshots d106-d111');
  const s112 = snap(112);
  ok(!!s112 && s112.nora.onRoster && s112.roster[s112.roster.length - 1] === 'nora_wilson',
    'driver 97330: Nora present appended last in d112 snapshot');
  ok(!!s112 && s112.nora.vpDead === true && s112.nora.isMember === false,
    'driver 97330: d112 snapshot still vpDead true, isMember false (dead-flagged bearer)');
  const sayWalk = (r30.sayKept || []).find(function (s) { return s.day === 111 && /Nora Wilson walks in/.test(s.line); });
  ok(!!sayWalk, 'driver 97330: d111 say line narrates the walk-in (not silent)');
  const sayWord = (r30.sayKept || []).find(function (s) { return s.day === 109 && /Word came: Nora Wilson/.test(s.line); });
  ok(!!sayWord, 'driver 97330: d109 say line narrates the re-application (not silent)');
  // 97338: no reappearance of any roster id; chain reproduces bearerorder.
  const reapp = (function () {
    const seen = {}; let prev = new Set(); const hits = [];
    for (const s of (r38.dailySnap || [])) {
      const cur = new Set(s.roster);
      for (const vid of prev) if (!cur.has(vid)) seen[vid] = s.day;
      for (const vid of cur) if (seen[vid] != null) { hits.push(vid); seen[vid] = null; }
      prev = cur;
    }
    return hits;
  })();
  eq(reapp.length, 0, 'driver 97338: no roster id reappears after disappearing');
  const chain38 = r38.deaths.map(function (d) { return d.day + ':' + d.oldName + '->' + d.chosenName; }).join(',');
  ok(chain38.indexOf('115:Sanne->Dmitri') >= 0 && chain38.indexOf('117:Elif->Enzo') >= 0,
    'driver 97338: death chain reproduces bearerorder (incl. d115/d117 muster events)');
  // Code properties (read, not inferred): genApplicant used-set, npcIds, arrival trust guard.
  const membSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'membership.js'), 'utf8');
  const genFn = membSrc.slice(membSrc.indexOf('genApplicant() {'), membSrc.indexOf('genApplicant() {') + 2000);
  ok(genFn.indexOf('deadMarked') >= 0,
    'code: genApplicant excludes dead ids via deadMarked (sim-deadid-a flip; was: nothing dead/fallen excluded)');
  const bg = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'background_survivors.json'), 'utf8'));
  ok(bg.some(function (c) { return c.id === 'nora_wilson'; }),
    'code: nora_wilson is in the background_survivors applicant pool');
  const betrSrc = fs.readFileSync(path.join(REPO, 'src', 'js', 'betrayal.js'), 'utf8');
  const npcFn = betrSrc.slice(betrSrc.indexOf('npcIds() {'), betrSrc.indexOf('npcIds() {') + 200);
  ok(npcFn.indexOf('dead') < 0, 'code: npcIds() has no dead filter (roster minus bearer only)');
}

(async () => {
  try { await livePart(); } catch (e) { fail++; console.log('FAIL: live part threw: ' + (e && e.stack ? e.stack.split('\n').slice(0, 3).join(' | ') : e)); }
  try { driverPart(); } catch (e) { fail++; console.log('FAIL: driver part threw: ' + (e && e.stack ? e.stack.split('\n').slice(0, 3).join(' | ') : e)); }
  console.log(`\nrosterreturn proof: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e.stack); process.exit(1); });
