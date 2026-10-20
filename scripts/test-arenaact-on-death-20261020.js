#!/usr/bin/env node
// test-arenaact-on-death-20261020.js — proof for the journey-endgame r25 blank fill.
//
// THE BLANK: the heroic contest channel (r23's arenaAct wiring) priced heroic
// choices into the leadership vector — but only when the player SURVIVED the
// choice. A heroic choice whose damage killed the player died via _contestDie's
// early return inside contestChoose's dmg block, BEFORE the notability block
// ran. The village watched the sacrifice on camera ("Howard: sacrifice —
// Volunteer. (The village watches the broadcast. Nobody blinks.)") and the
// ledger never heard of it: no arenaAct, no protected+3, no trust/viewership/
// opinion pricing. The most heroic outcome was the one that didn't count.
//
// THE FIX (src/js/contests.js): the notability/arenaAct block now fires on
// the ACT, right after the choice's note and BEFORE damage resolves. The
// cameras witnessed the choice; damage/death is the consequence and must not
// skip the pricing.
//
// RED (before): pick 'Volunteer' (notability sacrifice, lethal dmg) at 1 HP —
//   the player dies and arenaAct never fires (protected stays 0, no arena
//   record for the act).
// GREEN (after): the same pick kills the player AND arenaAct fires
//   (protected +3, arenaRecord holds the sacrifice act, trust/viewership/
//   opinion priced).
//
// Also asserts the non-lethal path is unchanged: a surviving heroic pick
// still prices exactly once (no double-fire from the move).
//
// Usage: node scripts/test-arenaact-on-death-20261020.js
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function check(name, cond, extra) {
  if (cond) { pass++; console.log('  ok: ' + name); }
  else { fail++; console.log('  FAIL: ' + name + (extra ? ' — ' + extra : '')); }
}

function ledgerProtected(Game) {
  try { return (Game.ledger() || {}).protected | 0; } catch (e) { return -999; }
}
function arenaActs(Game) {
  try {
    const pg = Game.progState();
    const recs = pg.arenaRecord || {};
    const acts = [];
    for (const k of Object.keys(recs)) for (const a of (recs[k].acts || [])) acts.push(a);
    return acts;
  } catch (e) { return []; }
}

// Build a real price contest and put the player at phase 0 ('Volunteer').
function setupPrice(Game, hp) {
  const contest = { id: 'price', name: 'The Price', risk: 'extreme', cat: 'moot' };
  const phases = Game.contestPlayable(contest);
  Game.state.activeContest = {
    contestId: 'price', kind: 'contest', participant: 'player',
    phases, phaseIdx: 0,
  };
  Game.state.scholar.health = hp;
  // No lifeline: this test is about the death path specifically.
  Game.apContestInterference = function () { return {}; };
  const c0 = phases[0].choices[0];
  return c0;
}

async function main() {
  // ---- Case 1: lethal heroic pick ----
  {
    const { Game } = await loadGame({ seed: 4242, mode: 'arenaact-death-proof' });
    await setupGame(Game);
    const c0 = setupPrice(Game, 1);
    check('fixture: phase-0 choice is Volunteer/sacrifice',
      c0 && c0.label === 'Volunteer' && c0.do && c0.do.notability === 'sacrifice',
      JSON.stringify(c0 && { label: c0.label, nota: c0.do && c0.do.notability }));
    const p0 = ledgerProtected(Game);
    const r = Game.contestChoose(0);
    // NB: on death the mantle passes — state.scholar is a NEW person at full
    // health. The contest's own return reports the death.
    const died = r && r.outcome === 'died';
    check('lethal Volunteer pick kills the player', died === true,
      'outcome=' + (r && r.outcome));
    check('arenaAct fired despite death (protected +3)',
      ledgerProtected(Game) === p0 + 3,
      `protected ${p0} -> ${ledgerProtected(Game)}`);
    const acts = arenaActs(Game).filter(a => a.kind === 'sacrifice');
    check('arenaRecord holds the sacrifice act',
      acts.length === 1 && /Volunteer/.test(acts[0].detail || ''),
      JSON.stringify(acts.map(a => a.kind + ':' + a.detail).slice(0, 2)));
  }

  // ---- Case 2: surviving heroic pick still prices exactly once ----
  {
    const { Game } = await loadGame({ seed: 4243, mode: 'arenaact-death-proof' });
    await setupGame(Game);
    const c0 = setupPrice(Game, 1000); // plenty of health: survives
    const p0 = ledgerProtected(Game);
    Game.contestChoose(0);
    const survived = (Game.state.scholar.health | 0) > 0;
    check('healthy Volunteer pick does not kill', survived === true,
      'health=' + Game.state.scholar.health);
    check('surviving heroic pick prices exactly once (protected +3, not +6)',
      ledgerProtected(Game) === p0 + 3,
      `protected ${p0} -> ${ledgerProtected(Game)}`);
    const acts = arenaActs(Game).filter(a => a.kind === 'sacrifice');
    check('exactly one sacrifice act recorded', acts.length === 1,
      'acts=' + acts.length);
  }

  // ---- Case 3: non-heroic notability untouched (showmanship is not wired) ----
  {
    const { Game } = await loadGame({ seed: 4244, mode: 'arenaact-death-proof' });
    await setupGame(Game);
    const contest = { id: 'longodds', name: 'The Long Odds', risk: 'medium', cat: 'chance' };
    const phases = Game.contestPlayable(contest);
    // find a showmanship-notability choice
    let found = null;
    phases.forEach((ph, pi) => (ph.choices || []).forEach((ch, ci) => {
      if (ch && ch.do && ch.do.notability === 'showmanship' && !found) found = { pi, ci, ch };
    }));
    check('fixture: a showmanship-notability choice exists', !!found);
    if (found) {
      Game.state.activeContest = { contestId: 'longodds', kind: 'contest',
        participant: 'player', phases, phaseIdx: found.pi };
      Game.state.scholar.health = 1000;
      Game.apContestInterference = function () { return {}; };
      const p0 = ledgerProtected(Game);
      Game.contestChoose(found.ci);
      check('showmanship pick does not touch protected ledger',
        ledgerProtected(Game) === p0,
        `protected ${p0} -> ${ledgerProtected(Game)}`);
      const acts = arenaActs(Game);
      check('showmanship pick records no arena act', acts.length === 0,
        'acts=' + acts.length);
    }
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('FATAL: ' + (e && e.stack || e)); process.exit(1); });
