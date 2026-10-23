#!/usr/bin/env node
// test-vetformation.js — proof gates for sim-vetformation (run
// fleshout-20261023T1215Z, axis scale-onramp, the FORMATION half).
//
// E0 shape; E1 det-gate (VETFORMATION unset -> formedFor byte-identical to
// AD.armedFor, 60d x2 bases, ARMORYDRIVE=1 both sides); E2 env-gate;
// E3 synthetic RED->GREEN fixtures (formation beat guards + composition
// + never-dismiss + brave-beat voicing; fight-wrapper hold/finish shape);
// E4 armed determinism (60d, same seed twice); D2 180d armed run completes
// + deterministic re-run.
//
// Usage (the full Usage-header env):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 \
//   ARMORYDRIVE=1 \
//   node scripts/test-vetformation.js
'use strict';
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'ARMORYDRIVE']) {
  if (process.env[k] !== '1') { console.error(`PROOF STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('PROOF STOP: SEATDRIVE=0 is required (pre-seat).'); process.exit(2); }
if (process.env.VETFORMATION === '1') { console.error('PROOF STOP: run with VETFORMATION unset (the proof sets it itself for the armed fixtures).'); process.exit(2); }

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const AD = require(path.join(REPO, 'scripts', 'policies', 'armorydrive'));
const VF = require(path.join(REPO, 'scripts', 'policies', 'vetformation'));

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
  const { Game } = await loadGame({ seed, mode: 'vetformation-proof', fullTelemetry: false });
  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 30 }); });
  return { Game, result };
}

// ---------- synthetic Game fixtures (E3) ----------
// Stub the equipment reads the layer uses (globalThis.Scattering).
const _S = globalThis.Scattering || (globalThis.Scattering = {});
_S.equipment = {
  weaponBonusOf: (vp, items, kind) => ((vp && vp._wb) || {})[kind] || 0,
  armorOf: () => 0,
};

function makeGame(o) {
  o = o || {};
  const calls = { invites: [], says: [], waits: 0, baseFights: 0, baseDailys: 0 };
  const wave = o.wave == null ? 4 : o.wave;
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
    tbfight: o.tbfight || null,
    over: false,
    inCombat: () => !!o.inCombat,
    playerAtHaven: () => !!o.atHaven,
    unlockedWave: () => wave,
    waveCombatReadiness: (w) => ({ veterans: o.vetsMet ? 2 : 0, demand: { veterans: 2 } }),
    feastedActive: () => !!o.feasted,
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
    partyFull: () => (o.party || []).length >= 3,
    inviteToParty: (id) => { calls.invites.push(id); (o.party = o.party || []).push(id); return { ok: true, msg: 'yes' }; },
    disp: (id) => String(id).split('_')[0],
    say: (s) => { calls.says.push(s); },
    tbIsPlayerTurn: () => !!o.playerTurn,
    tbFighter: (k) => (k === 'p' ? { hp: o.scholarHp == null ? 100 : o.scholarHp, maxHp: 100 } : null),
    tbPlayerWait: () => { calls.waits++; },
    _calls: calls,
    _roster: o.roster || [],
  };
  return G;
}
function mkRoster() {
  // anchor: best fighter AND veteran (vetKills set per fixture); forming:
  // two armed non-veterans; one unarmed (never committed); one hurt
  // (hp<40, never committed).
  return [
    { id: 'anchor_vid', wb: 60, hp: 95 },
    { id: 'form1_vid', wb: 40, hp: 90 },
    { id: 'form2_vid', wb: 30, hp: 85 },
    { id: 'unarmed_vid', wb: 0, hp: 90 },
    { id: 'hurt_vid', wb: 45, hp: 30 },
  ];
}
function mkFight(o) {
  o = o || {};
  const mhp = o.mhp == null ? 30 : o.mhp; // inside the sober band by default
  return {
    over: false, round: o.round == null ? 3 : o.round,
    fighters: [
      { kind: 'monster', monsterId: 'm_w4', hp: mhp, maxHp: 1200, fled: false },
      { kind: 'villager', villagerId: 'form1_vid', alive: true, fled: false, hp: o.compHp == null ? 90 : o.compHp, maxHp: 100 },
      { kind: 'villager', villagerId: 'anchor_vid', alive: true, fled: false, hp: 95, maxHp: 100 },
    ],
  };
}
function setGate(on) {
  if (on) process.env.VETFORMATION = '1';
  else delete process.env.VETFORMATION;
}

(async () => {
  console.log('E0 shape');
  setGate(false);
  const p = VF.formedFor('leadfeast');
  ok('formedFor returns a policy', p && p.id === 'lead-vetformation' && typeof p.daily === 'function' && typeof p.fight === 'function');
  ok('belong base tags', VF.formedFor('belongfeast').id === 'belong-vetformation');
  ok('controlFor tags', VF.controlFor('leadfeast').id === 'lead-armorydrive');
  let threw = false;
  try { VF.formedFor('nope'); } catch (e) { threw = true; }
  ok('unknown base throws', threw);
  ok('exports present', ['vfOn', 'stagingWindowLive', 'wave4Imminent', 'formationBeat', 'withVetformation', 'liveWave4', 'engagedCompanions', 'yieldBand', 'discipline', 'formedFor', 'controlFor', 'resetTele'].every(k => typeof VF[k] === 'function'));

  console.log('E2 env-gate');
  setGate(false);
  ok('vfOn false when unset', VF.vfOn() === false);
  setGate(true);
  ok('vfOn true when 1', VF.vfOn() === true);
  setGate(false);

  console.log('E3 formation-beat fixtures');
  const baseThreat = () => ({
    atHaven: true, day: 90, roster: mkRoster(), party: [],
    targets: [{ x: 1, y: 2, mid: 'm_w4' }],
    vetKills: [{ d: 80, mid: 'm_w4', w: 4, by: 'anchor_vid', via: 'companion' }],
  });
  // RED: gate off -> silent
  setGate(false); VF.resetTele();
  {
    const G = makeGame(baseThreat());
    const ctx = {};
    VF.formationBeat(G, ctx);
    const teleZero = Object.values(VF.tele()).every(v => v === 0);
    ok('RED gate off: beat silent, tele zero, ctx untouched', G._calls.invites.length === 0 && teleZero && Object.keys(ctx).length === 0);
  }
  // GREEN: fires — anchor + two forming fighters invited, unarmed/hurt skipped
  setGate(true); VF.resetTele();
  {
    const G = makeGame(baseThreat());
    const ctx = {};
    VF.formationBeat(G, ctx);
    const inv = G._calls.invites;
    ok('GREEN fires: invites the anchor + two forming fighters',
      inv.length === 3 && inv[0] === 'anchor_vid' && inv.includes('form1_vid') && inv.includes('form2_vid'),
      JSON.stringify(inv));
    ok('never commits the unarmed or the hurt', !inv.includes('unarmed_vid') && !inv.includes('hurt_vid'));
    ok('brave beat voiced once', G._calls.says.length === 1 && /pick up their edges/.test(G._calls.says[0]));
    ok('tele counts the formation', VF.tele().formationDays === 1 && VF.tele().formationCommits === 1);
    ok('formation affirmed for the fight trace', Array.isArray(ctx.vfFormationVids) && ctx.vfFormationVids.length === 3);
  }
  // one pass per day
  setGate(true); VF.resetTele();
  {
    const G = makeGame(baseThreat());
    const ctx = {};
    VF.formationBeat(G, ctx);
    VF.formationBeat(G, ctx);
    ok('one formation pass per day', G._calls.invites.length === 3);
  }
  // next day fires again
  setGate(true); VF.resetTele();
  {
    const G = makeGame(baseThreat());
    const ctx = {};
    VF.formationBeat(G, ctx);
    G.state.scholar.day = 91;
    VF.formationBeat(G, ctx);
    ok('fires again the next day', G._calls.invites.length === 3 && VF.tele().formationDays === 2);
  }
  // no threat
  setGate(true); VF.resetTele();
  {
    const G = makeGame(Object.assign(baseThreat(), { targets: [] }));
    const ctx = {};
    VF.formationBeat(G, ctx);
    ok('no formation without a wave-4 threat', G._calls.invites.length === 0 && VF.tele().skippedNoThreat === 1);
  }
  // wave-3-only is not a threat
  setGate(true); VF.resetTele();
  {
    const G = makeGame(Object.assign(baseThreat(), { targets: [{ x: 1, y: 2, mid: 'm_w3' }] }));
    const ctx = {};
    VF.formationBeat(G, ctx);
    ok('wave-3-only is not a threat', G._calls.invites.length === 0);
  }
  // window closed: pre-wave-4
  setGate(true); VF.resetTele();
  {
    const G = makeGame(Object.assign(baseThreat(), { wave: 3 }));
    const ctx = {};
    VF.formationBeat(G, ctx);
    ok('window closed pre-wave-4', G._calls.invites.length === 0 && VF.tele().skippedWindow === 1);
  }
  // window closed: vets bar met
  setGate(true); VF.resetTele();
  {
    const G = makeGame(Object.assign(baseThreat(), { vetsMet: true }));
    const ctx = {};
    VF.formationBeat(G, ctx);
    ok('window closed when the vets bar is met', G._calls.invites.length === 0);
  }
  // off haven
  setGate(true); VF.resetTele();
  {
    const G = makeGame(Object.assign(baseThreat(), { atHaven: false }));
    const ctx = {};
    VF.formationBeat(G, ctx);
    ok('no formation off the haven', G._calls.invites.length === 0 && VF.tele().skippedHaven === 1);
  }
  // in combat
  setGate(true); VF.resetTele();
  {
    const G = makeGame(Object.assign(baseThreat(), { inCombat: true }));
    const ctx = {};
    VF.formationBeat(G, ctx);
    ok('no formation in combat', G._calls.invites.length === 0);
  }
  // never dismisses: a weak party member already in party is kept
  setGate(true); VF.resetTele();
  {
    const G = makeGame(Object.assign(baseThreat(), { party: ['unarmed_vid'] }));
    const ctx = {};
    VF.formationBeat(G, ctx);
    ok('never dismisses: keeps the weak party member, fills around them',
      G.partyMembers().includes('unarmed_vid') && G._calls.invites.length === 2,
      JSON.stringify(G.partyMembers()));
  }
  // all veterans forming pool empty: anchor + best remaining fill the slots
  setGate(true); VF.resetTele();
  {
    const G = makeGame(Object.assign(baseThreat(), {
      vetKills: [
        { d: 80, mid: 'm_w4', w: 4, by: 'anchor_vid', via: 'companion' },
        { d: 81, mid: 'm_w4', w: 4, by: 'form1_vid', via: 'companion' },
        { d: 82, mid: 'm_w4', w: 4, by: 'form2_vid', via: 'companion' },
      ],
    }));
    const ctx = {};
    VF.formationBeat(G, ctx);
    ok('all-veteran pool still commits the anchor first',
      G._calls.invites[0] === 'anchor_vid' && G._calls.invites.length === 3,
      JSON.stringify(G._calls.invites));
  }

  console.log('E3 fight-wrapper fixtures');
  const fightBase = (o) => Object.assign(baseThreat(), {
    tbfight: mkFight(o), playerTurn: true, party: ['form1_vid', 'anchor_vid'],
  });
  const wrapFight = (G, ctx, baseFights) => {
    const base = { id: 'b', daily() {}, fight() { baseFights.n++; return false; } };
    const w = VF.withVetformation(base, 'w', 'w');
    return w.fight(G, ctx);
  };
  // RED: gate off -> pure delegation to base.fight
  setGate(false); VF.resetTele();
  {
    const G = makeGame(fightBase({}));
    const ctx = {};
    const bf = { n: 0 };
    wrapFight(G, ctx, bf);
    ok('RED gate off: fight delegates purely to base', bf.n === 1 && G._calls.waits === 0 && Object.values(VF.tele()).every(v => v === 0));
  }
  // GREEN: inside the band, non-veteran engaged -> scholar holds
  setGate(true); VF.resetTele();
  {
    const G = makeGame(fightBase({ mhp: 30 }));
    const ctx = { vfFormationVids: ['form1_vid', 'anchor_vid'] }; // the affirmed formation
    const bf = { n: 0 };
    wrapFight(G, ctx, bf);
    ok('GREEN hold: weakened wave-4 + forming companion -> scholar waits',
      G._calls.waits === 1 && bf.n === 0 && VF.tele().holds === 1 && VF.tele().bandHolds === 1);
    ok('fight trace counts the formed engagement',
      VF.tele().w4Fights === 1 && VF.tele().w4FightsWithComp === 1 && VF.tele().w4FightsFormed2 === 1);
  }
  // soften: above band+est -> scholar strikes (base.fight)
  setGate(true); VF.resetTele();
  {
    const G = makeGame(fightBase({ mhp: 900 }));
    const ctx = {};
    const bf = { n: 0 };
    wrapFight(G, ctx, bf);
    ok('soften: healthy target -> scholar strikes', G._calls.waits === 0 && bf.n === 1 && VF.tele().softens === 1);
  }
  // all veterans engaged -> no hold (the scholar finishes)
  setGate(true); VF.resetTele();
  {
    const G = makeGame(Object.assign(fightBase({ mhp: 30 }), {
      vetKills: [
        { d: 80, mid: 'm_w4', w: 4, by: 'anchor_vid', via: 'companion' },
        { d: 81, mid: 'm_w4', w: 4, by: 'form1_vid', via: 'companion' },
      ],
    }));
    const ctx = {};
    const bf = { n: 0 };
    wrapFight(G, ctx, bf);
    ok('all veterans engaged: no hold, scholar finishes',
      G._calls.waits === 0 && bf.n === 1 && VF.tele().holdSkippedAllVets === 1);
  }
  // no companions -> base.fight
  setGate(true); VF.resetTele();
  {
    const G = makeGame(Object.assign(fightBase({ mhp: 30 }), { party: [] }));
    G.tbfight.fighters = G.tbfight.fighters.filter(f => f.kind === 'monster');
    const ctx = {};
    const bf = { n: 0 };
    wrapFight(G, ctx, bf);
    ok('companion-less fight: scholar is the finisher', G._calls.waits === 0 && bf.n === 1);
  }
  // rescue: bleeding companion ends the hold
  setGate(true); VF.resetTele();
  {
    const G = makeGame(fightBase({ mhp: 30, compHp: 25 }));
    const ctx = {};
    const bf = { n: 0 };
    wrapFight(G, ctx, bf);
    ok('rescue: bleeding companion ends the hold', G._calls.waits === 0 && bf.n === 1 && VF.tele().rescueStrikes === 1);
  }
  // not the player's turn -> delegate
  setGate(true); VF.resetTele();
  {
    const G = makeGame(Object.assign(fightBase({ mhp: 30 }), { playerTurn: false }));
    const ctx = {};
    const bf = { n: 0 };
    wrapFight(G, ctx, bf);
    ok('not the scholar turn: delegates', G._calls.waits === 0 && bf.n === 1);
  }
  // stall: two hold turns with no HP decrease -> scholar resumes
  setGate(true); VF.resetTele();
  {
    const G = makeGame(fightBase({ mhp: 30 }));
    const ctx = {};
    const bf = { n: 0 };
    const base = { id: 'b', daily() {}, fight() { bf.n++; return false; } };
    const w = VF.withVetformation(base, 'w', 'w');
    w.fight(G, ctx); // hold 1
    w.fight(G, ctx); // hold 2 (no HP decrease -> stall 1)
    w.fight(G, ctx); // stall 2 -> scholar resumes
    ok('stall: companions not closing -> scholar resumes the finish',
      G._calls.waits === 2 && bf.n === 1 && VF.tele().stallFinishes === 1,
      `waits=${G._calls.waits} baseFights=${bf.n}`);
  }

  console.log('E1 det-gate (VETFORMATION unset — byte-identical to AD.armedFor)');
  setGate(false); VF.resetTele();
  for (const b of ['leadfeast', 'belongfeast']) {
    const a = await shortRun(VF.formedFor(b), 4242, 60);
    const c = await shortRun(AD.armedFor(b), 4242, 60);
    ok(`det-gate ${b} 60d byte-identical`, digest(a.Game, a.result) === digest(c.Game, c.result),
      digest(a.Game, a.result) + ' vs ' + digest(c.Game, c.result));
  }
  ok('det-gate tele untouched', Object.values(VF.tele()).every(v => v === 0));

  console.log('E4 armed determinism (VETFORMATION=1, 60d, same seed twice)');
  setGate(true); VF.resetTele();
  {
    const a = await shortRun(VF.formedFor('leadfeast'), 4243, 60);
    setGate(true); VF.resetTele();
    const b = await shortRun(VF.formedFor('leadfeast'), 4243, 60);
    ok('armed re-run deterministic', digest(a.Game, a.result) === digest(b.Game, b.result));
    ok('armed 60d completes', (a.Game.state.scholar.day || 0) > 0 || a.Game.over);
  }

  console.log('D2 180d armed run completes + deterministic re-run');
  setGate(true); VF.resetTele();
  {
    const a = await shortRun(VF.formedFor('belongfeast'), 4244, 180);
    setGate(true); VF.resetTele();
    const b = await shortRun(VF.formedFor('belongfeast'), 4244, 180);
    ok('armed 180d re-run deterministic', digest(a.Game, a.result) === digest(b.Game, b.result));
    console.log('   digest:', digest(a.Game, a.result));
    console.log('   tele:', JSON.stringify(VF.tele()));
  }

  setGate(false);
  console.log(`\n${pass} PASS, ${fail} FAIL`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROOF FATAL', e); process.exit(1); });
