#!/usr/bin/env node
// scripts/test-subaid-20261014.js — PROOF for the SUBAID arm (loop B).
//
// The SUBAID question: tendLink (the LEAD road's tending verb) removes
// 1,500 kcal of grain from Haven's pantry and grants +8 trust — but the
// grain NEVER reaches the subordinate's pantry. The beat says "Haven sends
// 1,500 kcal of grain to X's fire... Someone's grandmother over there will
// remember who fed her", while the engine lets it vanish into narrative.
// The lever: credit _otherVillage(link.subordinate).pantryKcal by the paid
// amount inside tendLink, alongside the unchanged trust gain — the fiction
// becomes engine-true (their people eat it in the weekly tick; their own
// production can then go to tribute; tribute reliability rises).
//
// RED phase (pristine code — run BEFORE the lever):
//   R1. the grain vanishes: tendLink(1500) drops Haven's pantry 1500 and the
//       subordinate's pantryKcal is byte-identical before/after.
// GREEN phase (after the lever):
//   G1. the sub's pantry is credited EXACTLY the paid amount (full tend).
//   G2. trust gain byte-identical (+8, same frac math, same tendedWeek).
//   G3. mourning refusal unchanged (returns 0, both pantries untouched).
//   G4. empty-pantry refusal unchanged (returns 0, sub pantry untouched).
//   G5. weekly dedup: no double-credit (second tend same week -> 0).
//   G6. partial pantry: paid 800 -> credit 800, trust +4 (round(8*800/1500)).
//   G7. next-week tend credits again (dedup is per-week, not once-ever).
//
// The credit assertion adapts to the lever marker so one file demonstrates
// both phases: on pristine it documents the vanishing (RED), on the lever
// tip it proves the credit (GREEN). All invariant assertions are identical
// on both tips.
//
// Usage: node scripts/test-subaid-20261014.js
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame } = require('./sim-harness');

const LEVER_MARKER = 'SUBAID-AID-CREDIT';
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
  const { Game } = await loadGame({ seed: 42, mode: 'subaid-proof' });
  await setupGame(Game);
  Game.state.otherVillages = (Game.state.otherVillages || []).concat([
    { id: 'aidv', name: 'Aidvale', pantryKcal: opts.subPantry != null ? opts.subPantry : 5000,
      population: 10, day: 0, roster: [] },
  ]);
  const m = Game.mshipState();
  m.links = m.links || [];
  Game.state.scholar.day = opts.day != null ? opts.day : 30;
  m.links.push({
    id: 'link_aid', primary: 'haven', subordinate: 'aidv',
    day: 0, trust: opts.trust != null ? opts.trust : 30,
    status: 'active', tributeKcalPerWeek: 4000,
    tributePaidKcal: 0, tributeWeek: -1, tributePaidWeek: -1,
    arrears: 0, history: [],
    mourningUntil: opts.mourning ? 40 : 0,
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
const linkOf = (Game) => Game.mshipState().links.find(l => l.id === 'link_aid');
const weekOf = (Game) => (Game._week ? Game._week() : 0);

async function main() {
  const lever = leverPresent();
  console.log('SUBAID lever marker in hierarchy.js: ' + (lever ? 'PRESENT' : 'ABSENT'));
  let pass = 0;
  const ok = (name, cond, detail) => {
    if (!cond) { console.error(`FAIL ${name}: ${detail}`); process.exit(1); }
    pass++;
    console.log(`ok ${name}${detail ? ' — ' + detail : ''}`);
  };

  // ---- invariants (identical assertions on both tips) ----
  {
    const Game = await buildWorld({});
    const havenBefore = havenPantryKcal(Game);
    const subBefore = subVillage(Game, 'aidv').pantryKcal;
    const trustBefore = linkOf(Game).trust;
    const paid = Game.tendLink('link_aid');
    const l = linkOf(Game);
    ok('tend-returns-paid', paid === 1500, `paid=${paid}`);
    ok('haven-pantry-debited', havenPantryKcal(Game) === havenBefore - 1500,
      `${havenBefore} -> ${havenPantryKcal(Game)}`);
    ok('trust-plus-8', l.trust === trustBefore + 8, `trust ${trustBefore} -> ${l.trust}`);
    ok('week-stamped', l.tendedWeek === weekOf(Game), `tendedWeek=${l.tendedWeek} week=${weekOf(Game)}`);
    const subAfter = subVillage(Game, 'aidv').pantryKcal;
    if (lever) {
      ok('CREDIT-sub-credited-exactly', subAfter === subBefore + paid,
        `sub pantry ${subBefore} -> ${subAfter} (+${paid})`);
    } else {
      ok('RED-grain-vanishes', subAfter === subBefore,
        `sub pantry ${subBefore} -> ${subAfter}: the 1500 kcal never arrives (RED)`);
    }
  }

  // G5: weekly dedup — no double-credit
  {
    const Game = await buildWorld({});
    const subBefore = subVillage(Game, 'aidv').pantryKcal;
    const paid1 = Game.tendLink('link_aid');
    const subMid = subVillage(Game, 'aidv').pantryKcal;
    const paid2 = Game.tendLink('link_aid');
    const subAfter = subVillage(Game, 'aidv').pantryKcal;
    ok('dedup-second-tend-zero', paid1 === 1500 && paid2 === 0,
      `first=${paid1} second=${paid2}`);
    const expectMid = lever ? subBefore + 1500 : subBefore;
    ok('no-double-credit', subMid === expectMid && subAfter === expectMid,
      `sub pantry ${subBefore} -> ${subMid} -> ${subAfter}: credited exactly once`);
  }

  // G3: mourning refusal unchanged
  {
    const Game = await buildWorld({ mourning: true });
    const havenBefore = havenPantryKcal(Game);
    const subBefore = subVillage(Game, 'aidv').pantryKcal;
    const paid = Game.tendLink('link_aid');
    ok('mourning-refuses', paid === 0, 'mourning link cannot be tended');
    ok('mourning-pantries-untouched',
      havenPantryKcal(Game) === havenBefore && subVillage(Game, 'aidv').pantryKcal === subBefore,
      'neither pantry moved');
  }

  // G4: empty-pantry refusal unchanged
  {
    const Game = await buildWorld({ pantryItems: [] });
    const subBefore = subVillage(Game, 'aidv').pantryKcal;
    const paid = Game.tendLink('link_aid');
    ok('empty-pantry-refuses', paid === 0, 'bare pantry sends nothing');
    ok('empty-pantry-sub-untouched', subVillage(Game, 'aidv').pantryKcal === subBefore,
      'sub pantry untouched on refusal');
  }

  // G6: partial pantry — proportional trust, proportional credit
  {
    const Game = await buildWorld({ pantryItems: [{ name: 'Test crumbs', kcalEach: 400, units: 2, spoilDay: 9999 }] });
    const subBefore = subVillage(Game, 'aidv').pantryKcal;
    const paid = Game.tendLink('link_aid');
    const l = linkOf(Game);
    ok('partial-paid-800', paid === 800, `whole-unit take: paid=${paid}`);
    ok('partial-trust-proportional', l.trust === 34, `trust 30 -> ${l.trust} (round(8*800/1500)=4)`);
    const subAfter = subVillage(Game, 'aidv').pantryKcal;
    if (lever) {
      ok('CREDIT-partial-credited', subAfter === subBefore + 800,
        `sub pantry ${subBefore} -> ${subAfter} (+800, the actual paid amount)`);
    } else {
      ok('RED-partial-vanishes', subAfter === subBefore,
        `sub pantry ${subBefore} -> ${subAfter}: partial 800 also vanishes (RED)`);
    }
  }

  // G7: next-week tend works again (dedup is per-week)
  {
    const Game = await buildWorld({ day: 30 });
    const paid1 = Game.tendLink('link_aid');
    Game.state.scholar.day = 37; // next week
    const subBefore = subVillage(Game, 'aidv').pantryKcal;
    const paid2 = Game.tendLink('link_aid');
    const subAfter = subVillage(Game, 'aidv').pantryKcal;
    ok('next-week-tends-again', paid1 === 1500 && paid2 === 1500,
      `week ${weekOf(Game) - 1}: ${paid1}, next week: ${paid2}`);
    if (lever) {
      ok('CREDIT-next-week-credited', subAfter === subBefore + 1500,
        `sub pantry ${subBefore} -> ${subAfter} (+1500 again)`);
    } else {
      ok('RED-next-week-vanishes', subAfter === subBefore,
        `sub pantry ${subBefore} -> ${subAfter} (RED)`);
    }
  }

  // invalid link / non-primary guards unchanged
  {
    const Game = await buildWorld({});
    const r = Game.tendLink('nope');
    ok('bad-link-id-zero', r === 0, 'unknown link id returns 0');
  }

  console.log(lever
    ? `\nPROOF ${pass}/${pass} GREEN — tended grain reaches the subordinate's pantry; trust/refusal/dedup math byte-identical.`
    : `\nRED observed (${pass} invariant assertions held) — tended grain vanishes; sub pantryKcal untouched. Run again after the lever for GREEN.`);
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
