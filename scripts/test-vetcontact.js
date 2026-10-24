#!/usr/bin/env node
// test-vetcontact.js — proof gates for sim-vetcontact (run 2026-10-24,
// axis scale-onramp, the FORMATION half's havencontact lever).
//
// E0 shape; E1 det-gate (VETCONTACT unset -> withVetcontact(VF.formedFor)
// byte-identical to VF.formedFor, 60d x2 bases, pinned substrate both
// sides); E2 env-gate; E3 synthetic RED->GREEN fixtures (contact beat
// guards: window, VF-signal-cold, havencontact, haven, non-suicidal,
// consent, never-dismiss, the commit line; fight-wrapper delegation +
// engagement counting); E4 armed determinism (60d, same seed twice);
// D2 180d armed run completes + deterministic re-run.
//
// Usage (the full Usage-header env — the pinned substrate):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 \
//   KILLDISC=1 ARMORYDRIVE=1 ARMORVILLAGE=1 VETFORMATION=1 TRUSTBUFFER=1 \
//   LINKFORM=2 \
//   node scripts/test-vetcontact.js
'use strict';
const path = require('path');
const fs = require('fs');
const REPO = process.env.REPO || path.join(__dirname, '..');

const SUB = ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'KILLDISC', 'ARMORYDRIVE', 'ARMORVILLAGE', 'VETFORMATION', 'TRUSTBUFFER'];
for (const k of SUB) {
  if (process.env[k] !== '1') { console.error(`PROOF STOP: ${k}=1 is required (pinned substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('PROOF STOP: SEATDRIVE=0 is required (pre-seat).'); process.exit(2); }
if (process.env.LINKFORM !== '2') { console.error('PROOF STOP: LINKFORM=2 is required (pinned substrate).'); process.exit(2); }
if (process.env.VETCONTACT === '1') { console.error('PROOF STOP: run with VETCONTACT unset (the proof sets it itself for the armed fixtures).'); process.exit(2); }

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const AD = require(path.join(REPO, 'scripts', 'policies', 'armorydrive'));
const VF = require(path.join(REPO, 'scripts', 'policies', 'vetformation'));
const VC = require(path.join(REPO, 'scripts', 'policies', 'vetcontact'));

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
  const { Game } = await loadGame({ seed, mode: 'vetcontact-proof', fullTelemetry: false });
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
  const calls = { invites: [], says: [], waits: 0, baseFights: 0 };
  const wave = o.wave == null ? 4 : o.wave;
  const roster = (o.roster || []).map(r => r.id);
  const hx = (o.haven || {}).x != null ? o.haven.x : 4;
  const hy = (o.haven || {}).y != null ? o.haven.y : 4;
  const havenMid = o.havenMid === undefined ? 'm_w4' : o.havenMid; // the monster on the haven tile (null = none)
  const targets = o.targets || []; // travel targets [{x,y,mid}]
  const G = {
    state: {
      scholar: { day: o.day != null ? o.day : 90 },
      village: {
        roster,
        px: hx, py: hy,
        trust: Object.fromEntries(roster.map(id => [id, 60])),
        health: Object.fromEntries((o.roster || []).map(r => [r.id, r.hp == null ? 90 : r.hp])),
      },
      waveKillLog: o.vetKills || [],
    },
    villagerId: 'scholar_vid',
    data: { monsters: [{ id: 'm_w4', wave: 4 }, { id: 'm_w5', wave: 5 }, { id: 'm_w3', wave: 3 }], items: [] },
    tbfight: o.tbfight || null,
    over: false,
    inCombat: () => !!o.inCombat,
    playerAtHaven: () => !!o.atHaven,
    unlockedWave: () => wave,
    waveCombatReadiness: (w) => ({ veterans: o.vetsMet ? 2 : 0, demand: { veterans: 2 } }),
    travelTargets: () => targets.map(t => ({ x: t.x, y: t.y })),
    monsterAt: (x, y) => {
      if (x === hx && y === hy) return havenMid ? { id: havenMid, monsterId: havenMid } : null;
      const t = targets.find(t => t.x === x && t.y === y);
      return t ? { id: t.mid, monsterId: t.mid } : null;
    },
    vpOf: (id) => {
      const r = (o.roster || []).find(r => r.id === id) || {};
      return { _wb: { melee: r.wb || 0, ranged: 0 }, dead: false };
    },
    inParty: (id) => (o.party || []).includes(id),
    partyMembers: () => (o.party || []).slice(),
    partyFull: () => (o.party || []).length >= 3,
    inviteToParty: (id) => {
      calls.invites.push(id);
      if ((o.refuse || []).includes(id)) return { ok: false, msg: 'no' };
      (o.party = o.party || []).push(id);
      return { ok: true, msg: 'yes' };
    },
    disp: (id) => String(id).split('_')[0],
    say: (s) => { calls.says.push(s); },
    tbIsPlayerTurn: () => !!o.playerTurn,
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
  const compHp = o.compHp == null ? 90 : o.compHp;
  return {
    over: false, round: 3,
    fighters: [
      { kind: 'monster', monsterId: 'm_w4', hp: 30, maxHp: 1200, fled: false },
      { kind: 'villager', villagerId: 'form1_vid', alive: true, fled: false, hp: compHp, maxHp: 100 },
      { kind: 'villager', villagerId: 'anchor_vid', alive: true, fled: false, hp: 95, maxHp: 100 },
    ],
  };
}
function setGate(on) {
  if (on) process.env.VETCONTACT = '1';
  else delete process.env.VETCONTACT;
}

(async () => {
  console.log('E0 shape + namespace');
  setGate(false);
  const src = fs.readFileSync(path.join(REPO, 'scripts', 'policies', 'vetcontact.js'), 'utf8');
  // Collision surfaces only: identifier/env/tele-key prefixes, not prose
  // mentions (the file legitimately cites the wallseg evidence spec by name).
  ok('namespace vetcontact-* (no sibling-loop collisions)',
    !/(bloodrestraint|wallseg|depositrelief|homecoming|pdtradeoff)[-_][a-z0-9]/i.test(src) &&
    !/process\.env\.(BLOODRESTRAINT|WALLSEG|DEPOSITRELIEF|HOMECOMING|PDTRADEOFF)/i.test(src));
  // No actual src/js requires/paths — the file is policy-side only.
  ok('zero src/js (no game.js edits)',
    !/\.\.\/src\/js/.test(src) && !/require\(['"][^'"]*src\/js/.test(src));
  const p = VC.contactFor('leadfeast');
  ok('contactFor returns a policy', p && p.id === 'lead-vetcontact' && typeof p.daily === 'function' && typeof p.fight === 'function');
  ok('belong base tags', VC.contactFor('belongfeast').id === 'belong-vetcontact');
  ok('controlFor tags', VC.controlFor('leadfeast').id === 'lead-vetformation');
  let threw = false;
  try { VC.contactFor('nope'); } catch (e) { threw = true; }
  ok('unknown base throws', threw);
  ok('exports present', ['vcOn', 'havenXY', 'havenContact', 'contactBeat', 'withVetcontact', 'contactFor', 'controlFor', 'resetTele', 'tele'].every(k => typeof VC[k] === 'function'));

  console.log('E2 env-gate');
  setGate(false);
  ok('vcOn false when unset', VC.vcOn() === false);
  setGate(true);
  ok('vcOn true when 1', VC.vcOn() === true);
  setGate(false);

  console.log('E3 contact-beat fixtures');
  const baseContact = () => ({
    atHaven: true, day: 90, roster: mkRoster(), party: [],
    haven: { x: 4, y: 4 }, havenMid: 'm_w4', targets: [], // VF travel-target signal COLD
    vetKills: [{ d: 80, mid: 'm_w4', w: 4, by: 'anchor_vid', via: 'companion' }],
  });
  // RED: gate off -> silent
  setGate(false); VC.resetTele();
  {
    const G = makeGame(baseContact());
    const ctx = {};
    VC.contactBeat(G, ctx);
    const teleZero = Object.values(VC.tele()).every(v => v === 0);
    ok('RED gate off: beat silent, tele zero, ctx untouched', G._calls.invites.length === 0 && teleZero && Object.keys(ctx).length === 0);
  }
  // GREEN: fires — anchor + two forming fighters invited, unarmed/hurt skipped
  setGate(true); VC.resetTele();
  {
    const G = makeGame(baseContact());
    const ctx = {};
    VC.contactBeat(G, ctx);
    const inv = G._calls.invites;
    ok('GREEN fires: invites the anchor + two forming fighters',
      inv.length === 3 && inv[0] === 'anchor_vid' && inv.includes('form1_vid') && inv.includes('form2_vid'),
      JSON.stringify(inv));
    ok('never commits the unarmed or the hurt', !inv.includes('unarmed_vid') && !inv.includes('hurt_vid'));
    ok('commit line voiced once, names the committed', G._calls.says.length === 1 && /fall in beside you/.test(G._calls.says[0]) && /anchor/.test(G._calls.says[0]));
    ok('tele counts the contact formation', VC.tele().contactDays === 1 && VC.tele().contactCommits === 1 && VC.tele().contactInvitesOk === 3);
    ok('formation affirmed for the fight trace', Array.isArray(ctx.vcFormationVids) && ctx.vcFormationVids.length === 3 && ctx.vcContactStages === 1);
  }
  // havenContact read: wave-5 monster on the haven tile also fires
  setGate(true); VC.resetTele();
  {
    const G = makeGame(Object.assign(baseContact(), { havenMid: 'm_w5' }));
    const ctx = {};
    VC.contactBeat(G, ctx);
    ok('wave-5 on the haven tile is a contact', G._calls.invites.length === 3);
  }
  // one pass per day
  setGate(true); VC.resetTele();
  {
    const G = makeGame(baseContact());
    const ctx = {};
    VC.contactBeat(G, ctx);
    VC.contactBeat(G, ctx);
    ok('one contact pass per day', G._calls.invites.length === 3 && VC.tele().contactDays === 1);
  }
  // no contact: no monster on the haven tile
  setGate(true); VC.resetTele();
  {
    const G = makeGame(Object.assign(baseContact(), { havenMid: null }));
    const ctx = {};
    VC.contactBeat(G, ctx);
    ok('no contact without a haven monster', G._calls.invites.length === 0 && VC.tele().skippedNoContact === 1);
  }
  // wave-3-only on the haven tile is not a contact
  setGate(true); VC.resetTele();
  {
    const G = makeGame(Object.assign(baseContact(), { havenMid: 'm_w3' }));
    const ctx = {};
    VC.contactBeat(G, ctx);
    ok('wave-3-only on the haven tile is not a contact', G._calls.invites.length === 0);
  }
  // VF signal HOT: vetformation owns the staging — no double-staging
  setGate(true); VC.resetTele();
  {
    const G = makeGame(Object.assign(baseContact(), {
      targets: [{ x: 1, y: 2, mid: 'm_w4' }],
    }));
    const ctx = {};
    VC.contactBeat(G, ctx);
    ok('VF signal hot: the contact beat stands down (one delta)',
      G._calls.invites.length === 0 && VC.tele().skippedVfHot === 1);
  }
  // window closed: pre-wave-4
  setGate(true); VC.resetTele();
  {
    const G = makeGame(Object.assign(baseContact(), { wave: 3 }));
    const ctx = {};
    VC.contactBeat(G, ctx);
    ok('window closed pre-wave-4', G._calls.invites.length === 0 && VC.tele().skippedWindow === 1);
  }
  // window closed: vets bar met
  setGate(true); VC.resetTele();
  {
    const G = makeGame(Object.assign(baseContact(), { vetsMet: true }));
    const ctx = {};
    VC.contactBeat(G, ctx);
    ok('window closed when the vets bar is met', G._calls.invites.length === 0);
  }
  // off haven
  setGate(true); VC.resetTele();
  {
    const G = makeGame(Object.assign(baseContact(), { atHaven: false }));
    const ctx = {};
    VC.contactBeat(G, ctx);
    ok('no formation off the haven', G._calls.invites.length === 0 && VC.tele().skippedHaven === 1);
  }
  // in combat
  setGate(true); VC.resetTele();
  {
    const G = makeGame(Object.assign(baseContact(), { inCombat: true }));
    const ctx = {};
    VC.contactBeat(G, ctx);
    ok('no formation in combat', G._calls.invites.length === 0);
  }
  // never dismisses: a weak party member already in party is kept
  setGate(true); VC.resetTele();
  {
    const G = makeGame(Object.assign(baseContact(), { party: ['unarmed_vid'] }));
    const ctx = {};
    VC.contactBeat(G, ctx);
    ok('never dismisses: keeps the weak party member, fills around them',
      G.partyMembers().includes('unarmed_vid') && G._calls.invites.length === 2,
      JSON.stringify(G.partyMembers()));
  }
  // refusal is honest: the commit line names only the committed, never the refuser
  setGate(true); VC.resetTele();
  {
    const G = makeGame(Object.assign(baseContact(), { refuse: ['form2_vid'] }));
    const ctx = {};
    VC.contactBeat(G, ctx);
    ok('refusal is honest: line names only the committed, never the refuser',
      G._calls.says.length === 1 && !/form2/.test(G._calls.says[0]) && !/nobody argues/i.test(G._calls.says[0]),
      G._calls.says[0]);
  }
  // veteran's repeat kill forms nothing: non-veterans take the forming slots
  setGate(true); VC.resetTele();
  {
    const G = makeGame(baseContact());
    const ctx = {};
    VC.contactBeat(G, ctx);
    const formIds = ctx.vcFormationVids.slice(1); // slots after the anchor
    ok('forming slots go to non-veterans (a veteran repeat kill forms nothing)',
      formIds.includes('form1_vid') && formIds.includes('form2_vid'),
      JSON.stringify(ctx.vcFormationVids));
  }

  console.log('E3 fight-wrapper fixtures');
  const wrapFight = (G, ctx) => {
    const base = { id: 'b', daily() {}, fight() { G._calls.baseFights++; return false; } };
    return VC.withVetcontact(base, 'w', 'w').fight(G, ctx);
  };
  // RED: gate off -> pure delegation to base.fight, ctx untouched
  setGate(false); VC.resetTele();
  {
    const G = makeGame({ tbfight: mkFight({}), party: ['form1_vid', 'anchor_vid'] });
    const ctx = {};
    wrapFight(G, ctx);
    ok('RED gate off: fight delegates purely to base', G._calls.baseFights === 1 && Object.values(VC.tele()).every(v => v === 0) && Object.keys(ctx).length === 0);
  }
  // GREEN: gate on, wave-4 fight with >=2 vc-formed companions engaged ->
  // the landed discipline path runs (base.fight) AND the fight is counted
  setGate(true); VC.resetTele();
  {
    const G = makeGame({ tbfight: mkFight({}), party: ['form1_vid', 'anchor_vid'] });
    const ctx = { vcFormationVids: ['form1_vid', 'anchor_vid'] }; // the contact formation
    wrapFight(G, ctx);
    ok('GREEN: vc-formed wave-4 fight counts and delegates to base',
      G._calls.baseFights === 1 && VC.tele().w4Fights === 1 &&
      VC.tele().w4FightsFormed2 === 1 && VC.tele().w4FightsVcFormed2 === 1 &&
      ctx.vcW4FightRows.length === 1,
      JSON.stringify(VC.tele()));
  }
  // union counting: vf-formed engaged companions also count toward the
  // staged-fight instrument (but not the vc-attribution one)
  setGate(true); VC.resetTele();
  {
    const G = makeGame({ tbfight: mkFight({}), party: ['form1_vid', 'anchor_vid'] });
    const ctx = { vfFormationVids: ['form1_vid', 'anchor_vid'] }; // vetformation's trace only
    wrapFight(G, ctx);
    ok('union counting: vf-formed engaged counts as staged, not as vc-attributed',
      VC.tele().w4FightsFormed2 === 1 && VC.tele().w4FightsVcFormed2 === 0);
  }
  // no fight -> delegation, no counting
  setGate(true); VC.resetTele();
  {
    const G = makeGame({ party: [] });
    const ctx = {};
    wrapFight(G, ctx);
    ok('no fight: delegation only', G._calls.baseFights === 1 && VC.tele().w4Fights === 0);
  }

  console.log('E1 det-gate (VETCONTACT unset — byte-identical to VF.formedFor)');
  setGate(false); VC.resetTele();
  for (const b of ['leadfeast', 'belongfeast']) {
    const a = await shortRun(VC.withVetcontact(VF.formedFor(b), b + '-vc', 'vc'), 4242, 60);
    const c = await shortRun(VF.formedFor(b), 4242, 60);
    ok(`det-gate ${b} 60d byte-identical`, digest(a.Game, a.result) === digest(c.Game, c.result),
      digest(a.Game, a.result) + ' vs ' + digest(c.Game, c.result));
  }
  ok('det-gate tele untouched', Object.values(VC.tele()).every(v => v === 0));

  console.log('E4 armed determinism (VETCONTACT=1, 60d, same seed twice)');
  setGate(true); VC.resetTele();
  {
    const a = await shortRun(VC.contactFor('leadfeast'), 4243, 60);
    setGate(true); VC.resetTele();
    const b = await shortRun(VC.contactFor('leadfeast'), 4243, 60);
    ok('armed re-run deterministic', digest(a.Game, a.result) === digest(b.Game, b.result));
    ok('armed 60d completes', (a.Game.state.scholar.day || 0) > 0 || a.Game.over);
  }

  console.log('D2 180d armed run completes + deterministic re-run');
  setGate(true); VC.resetTele();
  {
    const a = await shortRun(VC.contactFor('belongfeast'), 4244, 180);
    setGate(true); VC.resetTele();
    const b = await shortRun(VC.contactFor('belongfeast'), 4244, 180);
    ok('armed 180d re-run deterministic', digest(a.Game, a.result) === digest(b.Game, b.result));
    console.log('   digest:', digest(a.Game, a.result));
    console.log('   tele:', JSON.stringify(VC.tele()));
  }

  setGate(false);
  console.log(`\n${pass} PASS, ${fail} FAIL`);
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('PROOF FATAL', e); process.exit(1); });
