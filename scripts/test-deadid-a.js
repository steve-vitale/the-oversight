#!/usr/bin/env node
// test-deadid-a.js — proof for sim-deadid-a (dead-id exclusion BUILD).
// Must be RED pre-fix, GREEN post-fix. Two parts:
//   (A) LIVE harness (always runs): a dead-flagged id must be
//       undrawable by genApplicant (bg-record dead AND villagers-
//       record dead cases) and refused by arrivalTick (no roster
//       push, no trust write, no walk-in line). A living bg id must
//       stay drawable (guardrail against over-filtering).
//   (B) SWEEP-JSON analysis (runs when judged per-seed JSONs exist
//       at evidence/2026-11-02/perseed-deadid-a/): the 97330
//       baseline run reproduces the rosterreturn chain and the
//       post-fix run shows zero dead draws, zero dead arrivals, no
//       Nora reappearance, no Nora bearer-after-death. Skipped with
//       a note when the files are absent (pre-sweep RED run).
// Usage: node scripts/test-deadid-a.js
// Exit 0 on all green, 1 on any failure.
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = path.join(__dirname, '..');
const { loadGame, setupGame } = require(path.join(REPO, 'scripts', 'sim-harness'));

let pass = 0, fail = 0, skipped = 0;
function ok(cond, label) {
  if (cond) { pass++; console.log('PASS: ' + label); }
  else { fail++; console.log('FAIL: ' + label); }
}
function skip(label) { skipped++; console.log('SKIP: ' + label); }

function isDeadTriple(Game, id) {
  try {
    const vrec = (Game.data.villagers || []).find(function (r) { return r.id === id; });
    if (vrec && vrec.dead) return true;
    const brec = (Game.data.background_survivors || []).find(function (r) { return r.id === id; });
    if (brec && brec.dead) return true;
    const vp = Game.vpOf ? Game.vpOf(id) : null;
    if (vp && vp.dead) return true;
  } catch (e) {}
  return false;
}

async function livePart() {
  const { Game } = await loadGame({ seed: 42, mode: 'herald', fullTelemetry: false });
  await setupGame(Game);
  const v = Game.state.village || {};
  const roster = v.roster || [];
  const bearer = Game.villagerId;
  const X = roster.find(function (id) { return id && id !== bearer; });
  ok(!!X, 'live: a non-bearer roster id exists (got ' + X + ')');
  if (!X) return;
  const sayLines = [];
  const origSay = Game.say;
  Game.say = function () {
    try { if (typeof arguments[0] === 'string') sayLines.push(String(arguments[0])); } catch (e) {}
    return origSay.apply(this, arguments);
  };
  try {
    // Real death path: trust preserved, dead flag set, roster drops.
    v.trust = v.trust || {};
    v.trust[X] = 90;
    Game.removeVillager(X, 'killed');
    ok((v.roster || []).indexOf(X) < 0, 'live: removeVillager(killed) drops the id from the roster');
    ok(v.trust[X] === 90, 'live: removeVillager preserves the trust entry (90)');
    ok(isDeadTriple(Game, X), 'live: dead mark visible to the triple-source check after killed removal');

    // (A1) genApplicant, bg-record-dead case: pool = only the dead bg record.
    const bg = Game.data.background_survivors || [];
    const bgX = bg.find(function (r) { return r.id === X; });
    const bgB = bg.find(function (r) { return r && r.id && r.id !== X; });
    ok(!!bgB, 'live: a second background record exists for the living-draw guardrail');
    if (bgX) {
      const savedBg = Game.data.background_survivors;
      try {
        bgX.dead = true;
        Game.data.background_survivors = [bgX];
        let drewDead = false;
        for (let i = 0; i < 50; i++) {
          let app = null;
          try { app = Game.genApplicant(); } catch (e) { app = null; }
          if (app && (app.charId === X || app.id === X)) { drewDead = true; break; }
        }
        ok(!drewDead, 'live: genApplicant never draws a bg-record-dead id (50 draws, pool=[dead])');
      } finally {
        delete bgX.dead;
        Game.data.background_survivors = savedBg;
      }
    } else {
      skip('live: roster id not in background_survivors, bg-record-dead draw case untestable here');
    }

    // (A2) genApplicant, villagers-record-dead case (divergent copies):
    // a bg id whose ONLY dead mark is a villagers record must still be excluded.
    if (bgB) {
      const savedBg = Game.data.background_survivors;
      const savedVill = Game.data.villagers;
      try {
        delete bgB.dead;
        const fake = { id: bgB.id, name: bgB.name || 'Test Person', dead: true };
        Game.data.villagers = (Game.data.villagers || []).concat([fake]);
        Game.data.background_survivors = [bgB];
        let drewDead = false;
        for (let i = 0; i < 50; i++) {
          let app = null;
          try { app = Game.genApplicant(); } catch (e) { app = null; }
          if (app && (app.charId === bgB.id || app.id === bgB.id)) { drewDead = true; break; }
        }
        ok(!drewDead, 'live: genApplicant never draws a villagers-record-dead id (50 draws, pool=[clean bg, dead villagers])');
      } finally {
        Game.data.background_survivors = savedBg;
        Game.data.villagers = savedVill;
      }
    }

    // (A3) Living guardrail: a living bg id stays drawable.
    if (bgB) {
      const savedBg = Game.data.background_survivors;
      try {
        delete bgB.dead;
        Game.data.background_survivors = [bgB];
        let drewLiving = false;
        for (let i = 0; i < 50; i++) {
          let app = null;
          try { app = Game.genApplicant(); } catch (e) { app = null; }
          if (app && (app.charId === bgB.id || app.id === bgB.id)) { drewLiving = true; break; }
        }
        ok(drewLiving, 'live: genApplicant still draws a living bg id (guardrail, 50 draws)');
      } finally {
        Game.data.background_survivors = savedBg;
      }
    }

    // (A4) arrivalTick refusal: queue the dead id's arrival, call arrivalTick.
    const day = (Game.state.scholar || {}).day || 0;
    const m = Game.mshipState();
    m.arrivals = m.arrivals || [];
    const sayBefore = sayLines.length;
    m.arrivals.push({ id: X, charId: X, name: 'Test Return', arriveDay: day });
    const trustBefore = v.trust[X];
    Game.arrivalTick();
    const after = v.roster || [];
    ok(after.indexOf(X) < 0, 'live: arrivalTick refuses a dead-flagged arrival (no roster push)');
    ok((m.arrivals || []).filter(function (a) { return a.charId === X || a.id === X; }).length === 0,
      'live: refused arrival is consumed from the arrivals queue');
    ok(v.trust[X] === trustBefore, 'live: refused arrival writes no trust (still ' + trustBefore + ')');
    const newLines = sayLines.slice(sayBefore);
    ok(!newLines.some(function (l) { return /walks in/.test(l) && /Test Return/.test(l); }),
      'live: refused arrival produces no walk-in line');
    ok(newLines.some(function (l) { return /never made it/.test(l); }),
      'live: refused arrival narrates its non-arrival generically');
  } finally {
    Game.say = origSay;
  }
}

function jsonPart() {
  // AMENDED PRIMARY (see evidence/2026-11-02/sim-deadid-a.md §amendment):
  // 97330's rosterreturn chain does not reproduce on current code
  // (verbatim-driver cross-check: the d107 Jenny chain, not the d106
  // Vera/Nora/Aroha chain — intervening landings moved the seed).
  // The judged primary is 97331, where the current-code baseline
  // reproduces the FULL mechanism (Jovan Milic: killed d40, drawn
  // d41, walked d43, reappeared d44+, bearer-after-death d55-58).
  const dir = path.join(REPO, 'evidence', '2026-11-02', 'perseed-deadid-a');
  const base = path.join(dir, 'dd-s97331-baseline.json');
  const post = path.join(dir, 'dd-s97331-postfix.json');
  if (!fs.existsSync(base) || !fs.existsSync(post)) {
    skip('json: judged 97331 baseline/postfix files absent (run the sweep first)');
    return;
  }
  const b = JSON.parse(fs.readFileSync(base, 'utf8'));
  const p = JSON.parse(fs.readFileSync(post, 'utf8'));
  const bJovanDraw = (b.draws || []).filter(function (d) { return d.charId === 'jovan_milic' || d.id === 'jovan_milic'; });
  ok(bJovanDraw.length >= 1, 'json: baseline 97331 reproduces a Jovan application draw (got ' + bJovanDraw.length + ')');
  ok(bJovanDraw.some(function (d) { return d.deadAtDraw; }), 'json: baseline 97331 Jovan draw is dead-flagged at draw time');
  ok((b.deadWalked || []).some(function (a) { return a.charId === 'jovan_milic' || a.id === 'jovan_milic'; }),
    'json: baseline 97331 reproduces a dead-id walk-in (Jovan d43)');
  ok((b.reappearances || []).some(function (r) { return r.id === 'jovan_milic'; }),
    'json: baseline 97331 reproduces a Jovan roster reappearance');
  ok((b.bearerAfterDeath || []).some(function (r) { return r.id === 'jovan_milic'; }),
    'json: baseline 97331 reproduces Jovan bearer-after-death');
  ok((p.draws || []).filter(function (d) { return d.deadAtDraw; }).length === 0,
    'json: post-fix 97331 has zero dead-id draws (got ' + (p.draws || []).filter(function (d) { return d.deadAtDraw; }).length + ')');
  ok((p.deadWalked || []).length === 0, 'json: post-fix 97331 has zero dead-id walk-ins');
  ok((p.reappearances || []).length === 0, 'json: post-fix 97331 has zero roster reappearances');
  ok((p.bearerAfterDeath || []).length === 0, 'json: post-fix 97331 has zero bearer-after-death days');
  ok(p.applicationsTotal >= 1, 'json: post-fix 97331 applicant flow alive (applications=' + p.applicationsTotal + ')');
  // Documentation of the 97330 non-reproduction (not a gate): the
  // current-code baseline must show NO Nora return, because the
  // seed's chain moved — the arm does not claim a 97330 fix.
  const b30 = path.join(dir, 'dd-s97330-baseline.json');
  if (fs.existsSync(b30)) {
    const b30j = JSON.parse(fs.readFileSync(b30, 'utf8'));
    ok((b30j.reappearances || []).filter(function (r) { return r.id === 'nora_wilson'; }).length === 0,
      'json: baseline 97330 shows no Nora reappearance (chain moved; amended primary is 97331)');
  }
}

(async () => {
  await livePart();
  jsonPart();
  console.log(`\ntest-deadid-a: ${pass} passed, ${fail} failed, ${skipped} skipped`);
  process.exit(fail ? 1 : 0);
})().catch(function (e) { console.error(e.stack); process.exit(1); });
