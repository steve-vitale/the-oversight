#!/usr/bin/env node
// test-journey-succession-r258-selfwit-20261120.js — proof test for the
// r258 SELF-WITNESS fix (journey-succession r258).
//
// The screen found the panel's only witnessed person corpse on seed
// 34403: Karimi, killed in an NPC-NPC ambush (betrayal.js simNpcAmbush),
// whose corpse carries witnesses ["Karimi","Giulia","Grace"] — the dead
// woman listed as a witness of her own death. Root cause: simNpcAmbush
// registers the death with `witnesses: this.witnesses(6)`, and
// witnesses() (game.js) excludes only the bearer (the player) — it
// never excludes the victim. The combat path does it right:
// fightWitnesses(excludeVid) drops the victim (corpses.js), and every
// combat registerDeath call passes the victim's id. The ambush path is
// the only person-death registration that passes a raw proximity list.
//
// The self-entry is harmless for mourning (the dead cannot speak, so
// t2MournRel.witnessed never fires on it) but it corrupts the witness
// record the mourning system, gossip seeding, and the WITNESS-CENSUS
// read: a corpse's witness list must name only the living who saw the
// death. Fix: filter the victim out at the simNpcAmbush registerDeath
// call, the same exclusion the combat path applies.
//
// Cases (each in its own process — never two harnesses in one process):
//   selfwit-excluded: target + a bystander both within 6 tiles of the
//     scholar. UNFIXED: the killed target's corpse lists the target
//     among its witnesses. FIXED: the corpse's witnesses exclude the
//     target and still include the bystander.
//   selfwit-far: target far from the scholar (>6 tiles), bystander near.
//     FIXED: the corpse's witnesses exclude the target and still
//     include the bystander (the filter must not drop real witnesses
//     or invent any).
//
// Staging note: the kill is driven through the real simNpcAmbush with
// fresh plots until the outcome rolls 'killed' (p=0.2 per call, seeded
// RNG — deterministic per seed). The test asserts on the corpse the
// game itself registered, not on a staged corpse.
// Usage: node scripts/test-journey-succession-r258-selfwit-20261120.js [case]
//   Default (no arg): runs all cases, spawning children.
'use strict';
const { execFileSync } = require('child_process');
const path = require('path');
const { loadGame, setupGame } = require('./sim-harness');

let fails = 0;
function check(name, cond, detail) {
  console.log((cond ? 'PASS ' : 'FAIL ') + name + (detail ? ' — ' + detail : ''));
  if (!cond) fails++;
}

function firstName(n) { return String(n || 'Someone').split(' ')[0]; }

function placeNear(Game, vid, dx, dy) {
  const v = Game.state.village || {};
  v.positions = v.positions || {};
  const s = Game.state.scholar || {};
  const mx = (s.mx == null ? 4 : s.mx) + dx;
  const my = (s.my == null ? 4 : s.my) + dy;
  v.positions[vid] = { mx, my };
}

function placeFar(Game, vid) {
  const v = Game.state.village || {};
  v.positions = v.positions || {};
  const s = Game.state.scholar || {};
  const mx = (s.mx == null ? 4 : s.mx) + 30;
  const my = (s.my == null ? 4 : s.my) + 30;
  v.positions[vid] = { mx, my };
}

async function runCase(mode) {
  const seed = { 'selfwit-excluded': 5592, 'selfwit-far': 5593 }[mode] || 5592;
  const { Game } = await loadGame({ seed, mode: 'succession-r258-selfwit-proof', fullTelemetry: true });
  await setupGame(Game);
  const v = Game.state.village || {};
  const roster = (v.roster || []).filter(id => id !== Game.villagerId);
  check(`${mode}: roster has >= 3 villagers`, roster.length >= 3, `roster=${roster.length}`);
  if (roster.length < 3) return;

  const target = roster[0];
  const leader = roster[1];
  const bystander = roster[2];
  // Scholar stays where setup put them; place target + bystander adjacent.
  if (mode === 'selfwit-excluded') {
    placeNear(Game, target, 1, 0);
    placeNear(Game, bystander, 0, 1);
  } else {
    placeFar(Game, target);
    placeNear(Game, bystander, 0, 1);
  }
  const wit = (typeof Game.witnesses === 'function') ? (Game.witnesses(6) || []) : [];
  check(`${mode}: precondition — bystander is in witnesses(6)`, wit.includes(bystander), `witnesses=${JSON.stringify(wit)}`);
  if (mode === 'selfwit-excluded') {
    check(`${mode}: precondition — target is in witnesses(6) (the raw list sees the victim)`, wit.includes(target), `witnesses=${JSON.stringify(wit)}`);
  } else {
    check(`${mode}: precondition — far target is NOT in witnesses(6)`, !wit.includes(target), `witnesses=${JSON.stringify(wit)}`);
  }

  // Drive real ambushes until one kills (p=0.2 per call, seeded RNG).
  let killed = null;
  let tries = 0;
  for (tries = 0; tries < 60 && !killed; tries++) {
    const plot = { id: 'plot_selfwit_' + tries, target, leader, accomplices: [], weakest: leader };
    let res = null;
    try { res = Game.simNpcAmbush(plot); } catch (e) { check(`${mode}: simNpcAmbush call ${tries} throws`, false, String(e && e.message)); return; }
    if (res && res.outcome === 'killed') killed = plot;
  }
  check(`${mode}: a killed outcome rolled within 60 plots`, !!killed, `tries=${tries}`);
  if (!killed) return;

  const corpse = (typeof Game.corpses === 'function' ? Game.corpses() : []).find(c => c && c.villagerId === target);
  check(`${mode}: a corpse was registered for the target`, !!corpse, corpse ? `cause=${corpse.cause}` : 'no corpse');
  if (!corpse) return;
  check(`${mode}: corpse cause is ambush`, corpse.cause === 'ambush', `cause=${corpse.cause}`);
  const cw = corpse.witnesses || [];
  check(`${mode}: the victim is NOT in their own corpse's witnesses`, !cw.includes(target), `witnesses=${JSON.stringify(cw)}`);
  check(`${mode}: the nearby bystander IS still in the corpse's witnesses`, cw.includes(bystander), `witnesses=${JSON.stringify(cw)}`);
}

const CASES = ['selfwit-excluded', 'selfwit-far'];

async function main() {
  const mode = process.argv[2];
  if (mode && CASES.includes(mode)) {
    await runCase(mode);
  } else {
    await runCase('selfwit-excluded');
    for (const m of CASES.slice(1)) {
      try {
        const out = execFileSync('node', [path.join(__dirname, 'test-journey-succession-r258-selfwit-20261120.js'), m],
          { timeout: 300000, maxBuffer: 64 * 1024 * 1024 }).toString();
        console.log(out.split('\n').filter(l => l.startsWith('PASS') || l.startsWith('FAIL')).join('\n'));
        if (/FAIL/.test(out)) fails++;
      } catch (e) {
        check(`${m} child run passes`, false, String((e.stdout || e.message || e)).slice(0, 300));
      }
    }
  }
  if (fails) { console.log(`\n${fails} FAILURES`); process.exit(1); }
  console.log('\nALL GREEN');
}

main().catch(e => { console.error('THREW', e); process.exit(1); });
