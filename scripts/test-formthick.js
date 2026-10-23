#!/usr/bin/env node
// test-formthick.js — proof gates for sim-formthick (flesh-out loop arm
// sim-formthick, axis scale-onramp, the THICKENING half).
//
// E0 shape; E1 det-gate (FORMTHICK unset -> thickFor byte-identical to
// VF.formedFor, 60d x2 bases, VETFORMATION=1 ARMORYDRIVE=1 both sides);
// E2 env-gate; E3 synthetic RED->GREEN fixtures (pair-them beat: fires
// when a blooded veteran is staged and the forming bench is thin; silent
// with no veteran / already thick / party full / no candidate /
// VETFORMATION off; refusal silent; beat voiced by the veteran, never
// names the wave title); E4 armed determinism (60d, same seed twice);
// D2 180d armed run completes + deterministic re-run.
//
// Usage (the full Usage-header env):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 \
//   ARMORYDRIVE=1 \
//   node scripts/test-formthick.js
'use strict';
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'ARMORYDRIVE']) {
  if (process.env[k] !== '1') { console.error(`PROOF STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('PROOF STOP: SEATDRIVE=0 is required (pre-seat).'); process.exit(2); }
if (process.env.FORMTHICK === '1' || process.env.VETFORMATION === '1') { console.error('PROOF STOP: run with FORMTHICK and VETFORMATION unset (the proof sets them itself).'); process.exit(2); }

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const AD = require(path.join(REPO, 'scripts', 'policies', 'armorydrive'));
const VF = require(path.join(REPO, 'scripts', 'policies', 'vetformation'));
const FT = require(path.join(REPO, 'scripts', 'policies', 'formthick'));

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log(`  PASS ${name}`); }
  else { fail++; console.log(`  FAIL ${name}${extra ? ' — ' + extra : ''}`); }
}

function digest(Game, result) {
  const st = Game.state || {};
  const s = st.scholar || {};
  const v = st.village || {};
  return JSON.stringify({
    day: s.day || 0,
    alive: !!Game.villagerId,
    hp: Math.round(s.hp || 0),
    pop: ((v.roster || []).length),
    pantry: Math.round((st.pantry && st.pantry.kcal) || 0),
    wkl: (st.waveKillLog || []).length,
    uw: (typeof Game.unlockedWave === 'function' ? Game.unlockedWave() : 0),
    over: !!Game.over, won: !!Game.won,
    deaths: (result && result.samples && result.samples.deaths || []).length,
  });
}

async function shortRun(policy, seed, days) {
  const { Game } = await loadGame({ seed, mode: 'formthick-proof', fullTelemetry: false });
  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 30 }); });
  return { Game, result };
}

// ---------- synthetic Game fixtures (E3) ----------
const _S = globalThis.Scattering || (globalThis.Scattering = {});
_S.equipment = {
  weaponBonusOf: (vp, items, kind) => ((vp && vp._wb) || {})[kind] || 0,
  armorOf: () => 0,
};

function makeGame(o) {
  o = o || {};
  const calls = { invites: [], says: [], baseDailys: 0, baseFights: 0 };
  const roster = (o.roster || []).map(r => r.id);
  const G = {
    state: {
      scholar: { day: o.day != null ? o.day : 90 },
      village: {
        roster,
        trust: Object.fromEntries(roster.map(id => [id, 60])),
        health: Object.fromEntries((o.roster || []).map(r => [r.id, r.hp == null ? 90 : r.hp])),
      },
      waveKillLog: o.vetKills || [],
    },
    villagerId: 'scholar_vid',
    data: { monsters: [{ id: 'm_w4', wave: 4 }, { id: 'm_w3', wave: 3 }], items: [] },
    tbfight: null,
    over: false,
    inCombat: () => !!o.inCombat,
    playerAtHaven: () => !!o.atHaven,
    unlockedWave: () => (o.wave == null ? 4 : o.wave),
    waveCombatReadiness: (w) => ({ veterans: o.vetsMet ? 2 : 0, demand: { veterans: 2 } }),
    travelTargets: () => (o.targets || []).map(t => ({ x: t.x, y: t.y })),
    monsterAt: (x, y) => {
      const t = (o.targets || []).find(t => t.x === x && t.y === y);
      return t ? { id: t.mid } : null;
    },
    vpOf: (id) => {
      const r = (o.roster || []).find(r => r.id === id) || {};
      return { _wb: { melee: r.wb || 0, ranged: 0 }, dead: false };
    },
    inParty: (id) => (o.party || []).includes(id),
    partyMembers: () => (o.party || []).slice(),
    partyFull: () => (o.party || []).length >= (o.partyCap == null ? 4 : o.partyCap),
    inviteToParty: (id) => {
      calls.invites.push(id);
      if (o.refuse) return { ok: false, msg: 'no' };
      (o.party = o.party || []).push(id);
      return { ok: true, msg: 'yes' };
    },
    disp: (id) => String(id).split('_')[0],
    say: (s) => { calls.says.push(s); },
    _calls: calls,
  };
  return G;
}
function mkRoster() {
  // anchor_vid: best fighter, BLOODED (vetKills set per fixture);
  // form1_vid: forming, armed; form2_vid: the pair-them draft candidate;
  // unarmed_vid: never drafted; hurt_vid: hp<40, never drafted.
  return [
    { id: 'anchor_vid', wb: 60, hp: 95 },
    { id: 'form1_vid', wb: 40, hp: 90 },
    { id: 'form2_vid', wb: 30, hp: 85 },
    { id: 'unarmed_vid', wb: 0, hp: 90 },
    { id: 'hurt_vid', wb: 45, hp: 30 },
  ];
}
// A stub base whose daily simulates the formation beat's affirmation for
// today (sets ctx._vfFormDay + ctx.vfFormationVids, like formationBeat).
function stubBase(day, affirmed) {
  const calls = { dailys: 0, fights: 0 };
  return {
    base: {
      id: 'stub', daily(G, ctx) { calls.dailys++; ctx._vfFormDay = day; ctx.vfFormationVids = (affirmed || []).slice(); },
      fight(G, ctx) { calls.fights++; return false; },
    },
    calls,
  };
}
function setGates(ft, vf) {
  if (ft) process.env.FORMTHICK = '1'; else delete process.env.FORMTHICK;
  if (vf) process.env.VETFORMATION = '1'; else delete process.env.VETFORMATION;
}
function threatOpts(o) {
  return Object.assign({
    atHaven: true, day: 90, roster: mkRoster(),
    targets: [{ x: 1, y: 2, mid: 'm_w4' }],
    vetKills: [{ d: 80, mid: 'm_w4', w: 4, by: 'anchor_vid', via: 'companion' }],
  }, o || {});
}

(async () => {
  console.log('E0 shape');
  setGates(false, false);
  const p = FT.thickFor('leadfeast');
  ok('thickFor returns a policy', p && p.id === 'lead-formthick' && typeof p.daily === 'function' && typeof p.fight === 'function');
  ok('belong base tags', FT.thickFor('belongfeast').id === 'belong-formthick');
  ok('controlFor is formation-alone', FT.controlFor('leadfeast').id === 'lead-vetformation');
  let threw = false;
  try { FT.thickFor('nope'); } catch (e) { threw = true; }
  ok('unknown base throws', threw);
  ok('exports present', ['ftOn', 'pairBeat', 'withFormthick', 'thickFor', 'controlFor', 'resetTele', 'tele'].every(k => typeof FT[k] === 'function'));

  console.log('E2 env-gate');
  setGates(false, false);
  ok('ftOn false when unset', FT.ftOn() === false);
  setGates(true, false);
  ok('ftOn true when 1', FT.ftOn() === true);
  setGates(false, false);

  console.log('E3 pair-them fixtures');
  // RED: gate off -> pure delegation (stub base runs, thickening silent)
  setGates(false, true); FT.resetTele();
  {
    const G = makeGame(threatOpts({ party: ['anchor_vid', 'form1_vid'] }));
    const ctx = {};
    const { base, calls } = stubBase(90, ['anchor_vid', 'form1_vid']);
    const w = FT.withFormthick(base, 'w', 'w');
    w.daily(G, ctx);
    const teleZero = Object.values(FT.tele()).every(v => v === 0);
    ok('RED gate off: daily delegates, thickening silent',
      calls.dailys === 1 && G._calls.invites.length === 0 && G._calls.says.length === 0 && teleZero &&
      ctx.ftPairDrafts === undefined && ctx._ftPairDay === undefined);
  }
  // RED: FORMTHICK=1 but VETFORMATION unset -> silent (nothing to thicken)
  setGates(true, false); FT.resetTele();
  {
    const G = makeGame(threatOpts({ party: ['anchor_vid', 'form1_vid'] }));
    const ctx = {};
    const { base } = stubBase(90, ['anchor_vid', 'form1_vid']);
    const w = FT.withFormthick(base, 'w', 'w');
    w.daily(G, ctx);
    ok('RED formation off: thickening silent (nothing to thicken)',
      G._calls.invites.length === 0 && G._calls.says.length === 0 &&
      Object.values(FT.tele()).every(v => v === 0));
  }
  // GREEN: veteran staged + thin forming bench -> drafts form2, voices beat
  setGates(true, true); FT.resetTele();
  {
    const G = makeGame(threatOpts({ party: ['anchor_vid', 'form1_vid'] }));
    const ctx = {};
    const { base } = stubBase(90, ['anchor_vid', 'form1_vid']);
    const w = FT.withFormthick(base, 'w', 'w');
    w.daily(G, ctx);
    const beat = G._calls.says[0] || '';
    ok('GREEN pair-them: drafts the second forming fighter',
      G._calls.invites.length === 1 && G._calls.invites[0] === 'form2_vid' &&
      ctx.ftPairDrafts === 1 && FT.tele().pairDrafts === 1 && FT.tele().pairInvitesOk === 1);
    ok('beat voiced by the veteran, names the drafted fighter',
      G._calls.says.length === 1 && beat.includes('anchor') && beat.includes('form2'));
    ok('beat knowledge-gated (never names the wave title)',
      !/mirror/i.test(beat));
    ok('affirmed set extended for the fight trace',
      (ctx.vfFormationVids || []).includes('form2_vid'));
  }
  // No veteran staged -> silent (the pair needs the blooded one)
  setGates(true, true); FT.resetTele();
  {
    const G = makeGame(threatOpts({ party: ['form1_vid'], vetKills: [] }));
    const ctx = {};
    const { base } = stubBase(90, ['form1_vid']);
    const w = FT.withFormthick(base, 'w', 'w');
    w.daily(G, ctx);
    ok('no veteran staged: silent',
      G._calls.invites.length === 0 && G._calls.says.length === 0 && FT.tele().skippedNoVet === 1);
  }
  // Already thick (2 forming staged) -> silent
  setGates(true, true); FT.resetTele();
  {
    const G = makeGame(threatOpts({ party: ['anchor_vid', 'form1_vid', 'form2_vid'] }));
    const ctx = {};
    const { base } = stubBase(90, ['anchor_vid', 'form1_vid', 'form2_vid']);
    const w = FT.withFormthick(base, 'w', 'w');
    w.daily(G, ctx);
    ok('already thick: silent',
      G._calls.invites.length === 0 && G._calls.says.length === 0 && FT.tele().skippedThick === 1);
  }
  // Party full -> silent (never dismisses)
  setGates(true, true); FT.resetTele();
  {
    const G = makeGame(threatOpts({
      party: ['anchor_vid', 'form1_vid', 'vet2_vid'],
      partyCap: 3,
      roster: [
        { id: 'anchor_vid', wb: 60, hp: 95 },
        { id: 'vet2_vid', wb: 55, hp: 95 },
        { id: 'form1_vid', wb: 40, hp: 90 },
        { id: 'form2_vid', wb: 30, hp: 85 },
        { id: 'unarmed_vid', wb: 0, hp: 90 },
        { id: 'hurt_vid', wb: 45, hp: 30 },
      ],
      vetKills: [
        { d: 80, mid: 'm_w4', w: 4, by: 'anchor_vid', via: 'companion' },
        { d: 81, mid: 'm_w4', w: 4, by: 'vet2_vid', via: 'companion' },
      ],
    }));
    const ctx = {};
    const { base } = stubBase(90, ['anchor_vid', 'form1_vid', 'vet2_vid']);
    const w = FT.withFormthick(base, 'w', 'w');
    w.daily(G, ctx);
    ok('party full: silent, never dismisses',
      G._calls.invites.length === 0 && (G.partyMembers() || []).length === 3 && FT.tele().skippedFull === 1);
  }
  // No eligible candidate (only unarmed/hurt left) -> silent
  setGates(true, true); FT.resetTele();
  {
    const G = makeGame(threatOpts({
      party: ['anchor_vid', 'form1_vid'],
      roster: [
        { id: 'anchor_vid', wb: 60, hp: 95 },
        { id: 'form1_vid', wb: 40, hp: 90 },
        { id: 'unarmed_vid', wb: 0, hp: 90 },
        { id: 'hurt_vid', wb: 45, hp: 30 },
      ],
    }));
    const ctx = {};
    const { base } = stubBase(90, ['anchor_vid', 'form1_vid']);
    const w = FT.withFormthick(base, 'w', 'w');
    w.daily(G, ctx);
    ok('no eligible candidate: silent',
      G._calls.invites.length === 0 && G._calls.says.length === 0 && FT.tele().skippedThin === 1);
  }
  // Refusal -> silent beat (the fire is patient), counted
  setGates(true, true); FT.resetTele();
  {
    const G = makeGame(threatOpts({ party: ['anchor_vid', 'form1_vid'], refuse: true }));
    const ctx = {};
    const { base } = stubBase(90, ['anchor_vid', 'form1_vid']);
    const w = FT.withFormthick(base, 'w', 'w');
    w.daily(G, ctx);
    ok('refusal: no beat, counted',
      G._calls.invites.length === 1 && G._calls.says.length === 0 && FT.tele().pairRefused === 1 &&
      ctx.ftPairDrafts === undefined);
  }
  // No threat -> silent (same threat signal as the formation)
  setGates(true, true); FT.resetTele();
  {
    const G = makeGame(threatOpts({ party: ['anchor_vid', 'form1_vid'], targets: [] }));
    const ctx = {};
    const { base } = stubBase(90, ['anchor_vid', 'form1_vid']);
    const w = FT.withFormthick(base, 'w', 'w');
    w.daily(G, ctx);
    ok('no threat: silent',
      G._calls.invites.length === 0 && FT.tele().skippedNoThreat === 1);
  }
  // Formation did not affirm today (stale marker) -> silent
  setGates(true, true); FT.resetTele();
  {
    const G = makeGame(threatOpts({ party: ['anchor_vid', 'form1_vid'] }));
    const ctx = { _vfFormDay: 89 }; // yesterday's affirmation
    const base = { id: 'stub', daily(G2, ctx2) { /* no affirmation today */ }, fight() { return false; } };
    const w = FT.withFormthick(base, 'w', 'w');
    w.daily(G, ctx);
    ok('stale formation affirmation: silent',
      G._calls.invites.length === 0 && FT.tele().skippedNoForm === 1);
  }
  // One pass per day
  setGates(true, true); FT.resetTele();
  {
    const G = makeGame(threatOpts({ party: ['anchor_vid', 'form1_vid'] }));
    const ctx = {};
    const { base } = stubBase(90, ['anchor_vid', 'form1_vid']);
    const w = FT.withFormthick(base, 'w', 'w');
    w.daily(G, ctx);
    w.daily(G, ctx);
    ok('one pass per day', G._calls.invites.length === 1 && FT.tele().pairDays === 1);
  }
  // fight: pure delegation either way (the close belongs to the formation)
  setGates(true, true); FT.resetTele();
  {
    const G = makeGame(threatOpts({}));
    const ctx = {};
    const { base, calls } = stubBase(90, []);
    const w = FT.withFormthick(base, 'w', 'w');
    const r = w.fight(G, ctx);
    ok('fight delegates purely to base', calls.fights === 1 && r === false &&
      Object.values(FT.tele()).every(v => v === 0) && Object.keys(ctx).length === 0);
  }

  console.log('E1 det-gate (FORMTHICK unset, VETFORMATION=1 — byte-identical to VF.formedFor)');
  setGates(false, true); FT.resetTele(); VF.resetTele();
  for (const b of ['leadfeast', 'belongfeast']) {
    const a = await shortRun(FT.thickFor(b), 4242, 60);
    setGates(false, true); FT.resetTele(); VF.resetTele();
    const c = await shortRun(VF.formedFor(b), 4242, 60);
    ok(`det-gate ${b} 60d byte-identical`, digest(a.Game, a.result) === digest(c.Game, c.result),
      digest(a.Game, a.result) + ' vs ' + digest(c.Game, c.result));
  }
  ok('det-gate tele untouched', Object.values(FT.tele()).every(v => v === 0));

  console.log('E4 armed determinism (FORMTHICK=1 VETFORMATION=1, 60d, same seed twice)');
  setGates(true, true); FT.resetTele(); VF.resetTele();
  {
    const a = await shortRun(FT.thickFor('leadfeast'), 4243, 60);
    setGates(true, true); FT.resetTele(); VF.resetTele();
    const b = await shortRun(FT.thickFor('leadfeast'), 4243, 60);
    ok('armed re-run deterministic', digest(a.Game, a.result) === digest(b.Game, b.result));
    ok('armed 60d completes', (a.Game.state.scholar.day || 0) > 0 || a.Game.over);
  }

  console.log('D2 180d armed run completes + deterministic re-run');
  setGates(true, true); FT.resetTele(); VF.resetTele();
  {
    const a = await shortRun(FT.thickFor('belongfeast'), 4244, 180);
    setGates(true, true); FT.resetTele(); VF.resetTele();
    const b = await shortRun(FT.thickFor('belongfeast'), 4244, 180);
    ok('armed 180d re-run deterministic', digest(a.Game, a.result) === digest(b.Game, b.result));
    console.log('   digest:', digest(a.Game, a.result));
    console.log('   tele:', JSON.stringify(FT.tele()));
  }

  setGates(false, false);
  console.log(`\n${pass} PASS, ${fail} FAIL`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROOF FAILED:', (e && e.stack) || e); process.exit(1); });
