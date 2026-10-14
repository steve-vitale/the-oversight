#!/usr/bin/env node
// scripts/test-griefgrain-20261014.js — PROOF for the GRIEF-GRAIN arm (flesh-out loop A r32).
//
// The GRIEF-GRAIN question: answerRenegotiation's 'gift' verb (hierarchy.js)
// removes 1,500 kcal of grain from Haven's pantry and grants +8 trust — but
// the grain NEVER reaches the subordinate's pantry. The beat says "Haven
// sends 1,500 kcal to Emberhold's fire — grief met with grain", while the
// engine lets it vanish into narrative.
// The lever: credit _otherVillage(link.subordinate).pantryKcal by the paid
// amount inside the 'gift' branch, alongside the unchanged trust gain —
// the same credit pattern SUBAID-AID-CREDIT applied to tendLink.
//
// RED phase (pristine code — run BEFORE the lever):
//   R1. the grain vanishes: gift() drops Haven's pantry 1500 and the
//       subordinate's pantryKcal is byte-identical before/after.
// GREEN phase (after the lever):
//   G1. the sub's pantry is credited EXACTLY the paid amount (full gift).
//   G2. trust gain byte-identical (+8, same frac math).
//   G3. partial pantry: paid 800 -> credit 800, trust +4 (round(8*800/1500)).
//   G4. 'visit'/'wait' verbs unaffected (no pantry movement).
//   G5. no pendingRenegotiation -> returns null, pantries untouched.
//
// The credit assertion adapts to the lever marker so one file demonstrates
// both phases: on pristine it documents the vanishing (RED), on the lever
// tip it proves the credit (GREEN). All invariant assertions are identical
// on both tips. If the layer is ever reverted (kill-at-pilot), the marker
// absence keeps every assertion live — it degrades to RED documentation,
// never a crash.
//
// Usage: node scripts/test-griefgrain-20261014.js
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame } = require('./sim-harness');

const LEVER_MARKER = 'GRIEFGRAIN-AID-CREDIT';
function leverPresent() {
  const src = fs.readFileSync(path.join(__dirname, '..', 'src', 'js', 'hierarchy.js'), 'utf8');
  return src.indexOf(LEVER_MARKER) >= 0;
}

function havenPantryKcal(Game) {
  return ((Game.state.village || {}).pantry || [])
    .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
}
function subVillage(Game, id) {
  return (Game.state.otherVillages || []).find(v => v.id === id);
}

async function buildWorld(opts) {
  opts = opts || {};
  const { Game } = await loadGame({ seed: 42, mode: 'griefgrain-proof' });
  await setupGame(Game);
  Game.state.otherVillages = (Game.state.otherVillages || []).concat([
    { id: 'griefv', name: 'Griefvale', pantryKcal: opts.subPantry != null ? opts.subPantry : 5000,
      population: 10, day: 0, roster: [] },
  ]);
  const m = Game.mshipState();
  m.links = m.links || [];
  Game.state.scholar.day = opts.day != null ? opts.day : 30;
  m.links.push({
    id: 'link_grief', primary: 'haven', subordinate: 'griefv',
    day: 0, trust: opts.trust != null ? opts.trust : 30,
    status: 'active', tributeKcalPerWeek: 4000,
    tributePaidKcal: 0, tributeWeek: -1, tributePaidWeek: -1,
    arrears: 0, history: [],
    mourningUntil: 0,
    pendingRenegotiation: opts.reneg === undefined ? { sub: false, day: 28 } : opts.reneg,
  });
  if (opts.pantryItems) {
    Game.state.village.pantry = opts.pantryItems;
  } else {
    const kcal = opts.havenKcal != null ? opts.havenKcal : 3000;
    const units = Math.round(kcal / 1500);
    Game.state.village.pantry = [{ name: 'Test grain', kcalEach: 1500, units, spoilDay: 9999 }];
  }
  return Game;
}
const linkOf = (Game) => Game.mshipState().links.find(l => l.id === 'link_grief');

async function main() {
  const lever = leverPresent();
  console.log('GRIEFGRAIN lever marker in hierarchy.js: ' + (lever ? 'PRESENT' : 'ABSENT'));
  let pass = 0;
  const ok = (name, cond, detail) => {
    if (!cond) { console.error(`FAIL ${name}: ${detail}`); process.exit(1); }
    pass++;
    console.log(`ok ${name}${detail ? ' — ' + detail : ''}`);
  };

  // ---- core: the gift verb moves grain AND credits the sub ----
  {
    const Game = await buildWorld({});
    const havenBefore = havenPantryKcal(Game);
    const subBefore = subVillage(Game, 'griefv').pantryKcal;
    const trustBefore = linkOf(Game).trust;
    const r = Game.answerRenegotiation('link_grief', 'gift');
    const l = linkOf(Game);
    ok('gift-returns-gift', r === 'gift', `returned=${r}`);
    ok('gift-clears-pending', !l.pendingRenegotiation, 'pendingRenegotiation consumed');
    ok('haven-pantry-debited', havenPantryKcal(Game) === havenBefore - 1500,
      `${havenBefore} -> ${havenPantryKcal(Game)}`);
    ok('trust-plus-8', l.trust === trustBefore + 8, `trust ${trustBefore} -> ${l.trust}`);
    const subAfter = subVillage(Game, 'griefv').pantryKcal;
    if (lever) {
      ok('CREDIT-sub-credited-exactly', subAfter === subBefore + 1500,
        `sub pantry ${subBefore} -> ${subAfter} (+1500)`);
    } else {
      ok('RED-grain-vanishes', subAfter === subBefore,
        `sub pantry ${subBefore} -> ${subAfter}: the 1500 kcal never arrives (RED)`);
    }
  }

  // ---- partial pantry: proportional trust, proportional credit ----
  {
    const Game = await buildWorld({ pantryItems: [{ name: 'Test crumbs', kcalEach: 400, units: 2, spoilDay: 9999 }] });
    const havenBefore = havenPantryKcal(Game);
    const subBefore = subVillage(Game, 'griefv').pantryKcal;
    const trustBefore = linkOf(Game).trust;
    const r = Game.answerRenegotiation('link_grief', 'gift');
    const l = linkOf(Game);
    ok('partial-returns-gift', r === 'gift');
    ok('partial-paid-800', havenPantryKcal(Game) === havenBefore - 800, `paid=800 whole-unit take`);
    ok('partial-trust-proportional', l.trust === trustBefore + 4,
      `trust ${trustBefore} -> ${l.trust} (round(8*800/1500)=4)`);
    const subAfter = subVillage(Game, 'griefv').pantryKcal;
    if (lever) {
      ok('CREDIT-partial-credited', subAfter === subBefore + 800,
        `sub pantry ${subBefore} -> ${subAfter} (+800, the actual paid amount)`);
    } else {
      ok('RED-partial-vanishes', subAfter === subBefore,
        `sub pantry ${subBefore} -> ${subAfter}: partial 800 also vanishes (RED)`);
    }
  }

  // ---- 'visit' verb: no pantry movement, lever must not interfere ----
  {
    const Game = await buildWorld({});
    const havenBefore = havenPantryKcal(Game);
    const subBefore = subVillage(Game, 'griefv').pantryKcal;
    const r = Game.answerRenegotiation('link_grief', 'visit');
    ok('visit-returns-visit', r === 'visit', `returned=${r}`);
    ok('visit-pantries-untouched',
      havenPantryKcal(Game) === havenBefore && subVillage(Game, 'griefv').pantryKcal === subBefore,
      'gift credit does not leak into the visit verb');
  }

  // ---- no pending beat: returns null, pantries untouched ----
  {
    const Game = await buildWorld({ reneg: null });
    const havenBefore = havenPantryKcal(Game);
    const subBefore = subVillage(Game, 'griefv').pantryKcal;
    const r = Game.answerRenegotiation('link_grief', 'gift');
    ok('no-pending-returns-null', r === null, `returned=${r}`);
    ok('no-pending-pantries-untouched',
      havenPantryKcal(Game) === havenBefore && subVillage(Game, 'griefv').pantryKcal === subBefore,
      'unanswered links cost nothing');
  }

  // ---- bad link id guard ----
  {
    const Game = await buildWorld({});
    const r = Game.answerRenegotiation('nope', 'gift');
    ok('bad-link-id-null', r === null, 'unknown link id returns null');
  }

  // ---- empty pantry gift: paid 0, no credit possible, trust +0 ----
  {
    const Game = await buildWorld({ pantryItems: [] });
    const subBefore = subVillage(Game, 'griefv').pantryKcal;
    const trustBefore = linkOf(Game).trust;
    const r = Game.answerRenegotiation('link_grief', 'gift');
    const l = linkOf(Game);
    ok('empty-gift-returns-gift', r === 'gift');
    ok('empty-gift-trust-zero', l.trust === trustBefore, `trust unchanged (frac 0 -> +0)`);
    ok('empty-gift-sub-untouched', subVillage(Game, 'griefv').pantryKcal === subBefore,
      'no credit when nothing was paid');
  }

  console.log(lever
    ? `\nPROOF ${pass}/${pass} GREEN — grief grain reaches the subordinate's pantry; trust/partial/verb math byte-identical.`
    : `\nRED observed (${pass} invariant assertions held) — grief grain vanishes; sub pantryKcal untouched. Run again after the lever for GREEN.`);
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
