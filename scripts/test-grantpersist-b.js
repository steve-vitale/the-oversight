#!/usr/bin/env node
// test-grantpersist-b.js — proof for the grant-persistence trace
// instrument (sim-grantpersist-b). Synthetic legs only: each leg
// builds a fake Game, takes snapshots through the REAL
// snapshotScholar/localizeLoss exported by
// scripts/grantpersist-trace-b.js, and asserts the detector
// flags a planted loss with the right day/event bracket — or
// correctly does NOT flag deepening/evolution/no-loss.
// The driver file is required, not run: its require.main guard
// means requiring it never starts the judged band (the env
// gates are set here before require so the module loads).
'use strict';
// Env gates the driver asserts at load time (values match the
// prereg substrate; they gate nothing in these synthetic legs).
process.env.COMPETENT_FEAST = '0';
process.env.SEATDRIVE = '0';
process.env.PLENTYDEPRI = '0';
process.env.DEPOSITGATE = '1';
const { snapshotScholar, localizeLoss } = require('./grantpersist-trace-b');

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}
// Fake Game with the exact fields snapshotScholar reads.
function fakeGame(abilities, bearer) {
  const scholar = { day: 1, dayTicks: 100, villagerId: bearer, abilities: abilities.slice(), backgroundAbilities: [] };
  const obj = {
    state: { scholar },
    villagerId: bearer,
    over: false,
    // Reads the LIVE scholar (like the real Game.hasAbility), so a
    // bearer/scholar swap is visible to the detector.
    hasAbility(id) { const s = obj.state.scholar; return (s.abilities || []).some((e) => ((e && e.id) || e) === id || (e && e.evolvedFrom) === id); },
  };
  return obj;
}
// Caller-side prevRefs bookkeeping, exactly as the driver does it.
function tracker() {
  let refs = null;
  return {
    snap(Game, aid, phase, seq) {
      const s = snapshotScholar(Game, aid, phase, seq, refs);
      refs = { scholar: Game.state.scholar, list: Game.state.scholar.abilities };
      return s;
    },
  };
}

// L1: snapshot shape — ids + levels + bearer + present flag.
{
  const G = fakeGame([{ id: 'animal_ken', level: 1 }, { id: 'tracker', level: 2 }], 'vill_a');
  const s = snapshotScholar(G, 'animal_ken', 'setup', 0, null);
  ok('L1 snapshot lists ids+levels, bearer, present', s.abilities.length === 2
    && s.abilities[0].id === 'animal_ken' && s.abilities[0].level === 1
    && s.abilities[1].level === 2 && s.bearerGame === 'vill_a'
    && s.grantedPresent === true && s.hasAbility === true, JSON.stringify(s));
}

// L2: planted drop inside one day — bracketed as post-daily, not
// tapday-start; bearer unchanged; array mutated in place (the
// splice class) so listRefChanged is false and the ENTRY-GONE
// signal, not the ref flag, carries it.
{
  const G = fakeGame([{ id: 'fear_aura', level: 1 }], 'vill_a');
  const T = tracker();
  const snaps = [T.snap(G, 'fear_aura', 'setup', 0)];
  G.state.scholar.day = 2; snaps.push(T.snap(G, 'fear_aura', 'tapday-start', 1));
  G.state.scholar.abilities.splice(0, 1); // planted loss: competent.daily drops it
  G.state.scholar.day = 2; snaps.push(T.snap(G, 'fear_aura', 'post-daily', 1));
  const loc = localizeLoss(snaps, 'fear_aura');
  ok('L2 planted drop localizes to post-daily of that day',
    loc.lost === true && /post-daily/.test(loc.bracket) && loc.lastPresent.phase === 'tapday-start'
    && loc.bearerChanged === false && loc.firstAbsent.grantedPresent === false, JSON.stringify(loc));
}

// L3: bearer change — new scholar object, new bearer id, empty
// list: detector names the bearer change.
{
  const G = fakeGame([{ id: 'molt', level: 1 }], 'vill_a');
  const T = tracker();
  const snaps = [T.snap(G, 'molt', 'setup', 0)];
  const newScholar = { day: 3, dayTicks: 50, villagerId: 'vill_b', abilities: [], backgroundAbilities: [] };
  G.state.scholar = newScholar; G.villagerId = 'vill_b';
  snaps.push(T.snap(G, 'molt', 'tapday-start', 1));
  const loc = localizeLoss(snaps, 'molt');
  ok('L3 bearer change flagged (bearer + scholar object changed)',
    loc.lost === true && loc.bearerChanged === true && loc.scholarChanged === true, JSON.stringify(loc));
}

// L4: list rewrite, same bearer — new array object without the
// granted id: detector names the list rewrite, not a bearer change.
{
  const G = fakeGame([{ id: 'ambush', level: 1 }], 'vill_a');
  const T = tracker();
  const snaps = [T.snap(G, 'ambush', 'setup', 0)];
  G.state.scholar.abilities = [{ id: 'tracker', level: 1 }];
  snaps.push(T.snap(G, 'ambush', 'post-daily', 1));
  const loc = localizeLoss(snaps, 'ambush');
  ok('L4 same-bearer list rewrite flagged, bearer unchanged',
    loc.lost === true && loc.bearerChanged === false && loc.listRefChanged === true, JSON.stringify(loc));
}

// L5: no loss across a full tap-day pair — detector stays silent.
{
  const G = fakeGame([{ id: 'scarecrow', level: 1 }], 'vill_a');
  const T = tracker();
  const snaps = [T.snap(G, 'scarecrow', 'setup', 0), T.snap(G, 'scarecrow', 'tapday-start', 1), T.snap(G, 'scarecrow', 'post-daily', 1), T.snap(G, 'scarecrow', 'pre-tap', 1)];
  const loc = localizeLoss(snaps, 'scarecrow');
  ok('L5 no loss is not flagged', loc.lost === false, JSON.stringify(loc));
}

// L6: deepening L1 -> L2 is NOT a loss (same id, higher level).
{
  const G = fakeGame([{ id: 'war_cry', level: 1 }], 'vill_a');
  const T = tracker();
  const snaps = [T.snap(G, 'war_cry', 'setup', 0)];
  G.state.scholar.abilities[0].level = 2;
  snaps.push(T.snap(G, 'war_cry', 'post-daily', 1));
  const loc = localizeLoss(snaps, 'war_cry');
  ok('L6 deepening is not flagged as loss', loc.lost === false && snaps[1].abilities[0].level === 2, JSON.stringify(loc));
}

// L7: evolution (new id, evolvedFrom = granted root) is NOT a
// loss — mirrors modifiers.js hasAbility lineage.
{
  const G = fakeGame([{ id: 'blood_trail', level: 1 }], 'vill_a');
  const T = tracker();
  const snaps = [T.snap(G, 'blood_trail', 'setup', 0)];
  G.state.scholar.abilities = [{ id: 'blood_trail_ii', level: 3, evolvedFrom: 'blood_trail' }];
  snaps.push(T.snap(G, 'blood_trail', 'post-daily', 1));
  const loc = localizeLoss(snaps, 'blood_trail');
  ok('L7 evolution (evolvedFrom root) is not flagged as loss', loc.lost === false, JSON.stringify(loc));
}

// L8: grant failed at setup — first snapshot already absent.
{
  const G = fakeGame([], 'vill_a');
  const T = tracker();
  const snaps = [T.snap(G, 'patient_aim', 'setup', 0)];
  const loc = localizeLoss(snaps, 'patient_aim');
  ok('L8 absent-at-setup reported as lostAtSetup', loc.lost === true && loc.lostAtSetup === true, JSON.stringify(loc));
}

console.log('test-grantpersist-b: ' + pass + ' passed, ' + fail + ' failed');
console.log(fail === 0 ? 'verdict PROOF-GREEN' : 'verdict PROOF-RED');
process.exit(fail === 0 ? 0 : 1);
