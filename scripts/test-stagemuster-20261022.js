#!/usr/bin/env node
// test-stagemuster-20261022.js — proof gates for sim-stagemuster.
//
// E0 shape; E1 det-gate (STAGEMUSTER unset -> stagedFor byte-identical to
// AD.armedFor, 60d x2 bases, ARMORYDRIVE=1 both sides); E2 env-gate;
// E3 synthetic RED->GREEN fixtures on the beats (muster invites, formation
// regroup, patrol hop, all guard rails, gate-off pure delegation,
// stagedCompanionsOf census); E4 armed+KILLDISC deterministic;
// D2 180d armed run completes per policy + deterministic re-run.
//
// Usage (the full Usage-header env):
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 \
//   KILLDISC=1 ARMORYDRIVE=1 \
//   node scripts/test-stagemuster-20261022.js
'use strict';
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'KILLDISC', 'ARMORYDRIVE']) {
  if (process.env[k] !== '1') { console.error(`PROOF STOP: ${k}=1 is required (substrate/instrument).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('PROOF STOP: SEATDRIVE=0 is required (pre-seat).'); process.exit(2); }

const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));
const AD = require(path.join(REPO, 'scripts', 'policies', 'armorydrive'));
const SM = require(path.join(REPO, 'scripts', 'policies', 'stagemuster'));

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
  const { Game } = await loadGame({ seed, mode: 'stagemuster-proof', fullTelemetry: false });
  await setupGame(Game);
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days, manifest: undefined, sampleEvery: 30 }); });
  return { Game, result };
}

// ---------- synthetic Game fixtures (E3) ----------
function makeGame(o) {
  o = o || {};
  const wave = o.wave4 === false ? 3 : 4;
  const w5met = !!o.w5met;
  const party = (o.party || []).slice();
  const day = o.day != null ? o.day : 60;
  const dayPart = o.dayPart != null ? o.dayPart : 1;
  const scholarHpPct = o.scholarHpPct != null ? o.scholarHpPct : 0.8;
  const atHaven = !!o.atHaven;
  const inCombat = !!o.inCombat;
  const calls = { invites: [], travelTos: [], placed: 0, baseDailys: 0 };
  const base = { daily(G, ctx) { calls.baseDailys++; } };
  const positions = Object.assign({}, o.positions);
  const smx = o.smx != null ? o.smx : 4, smy = o.smy != null ? o.smy : 4;
  const G = {
    state: {
      scholar: { day, health: 100 * scholarHpPct, maxHealth: 100, mx: smx, my: smy },
      village: {
        roster: ['vidA', 'vidB', 'vidC'],
        trust: o.trust || { vidA: 50, vidB: 50, vidC: 50 },
        health: { vidA: 100, vidB: 100, vidC: 100 },
        positions,
      },
      waveKillLog: [],
    },
    villagerId: 'scholar0',
    dayPart,
    map: { px: atHaven ? 4 : 6, py: atHaven ? 4 : 6 },
    data: { monsters: [{ id: 'the_algorithm', wave: 4 }, { id: 'gavel', wave: 3 }] },
    tbfight: null,
    unlockedWave: () => wave,
    waveCombatReadiness: (w) => ({ veterans: w5met ? 2 : 0, demand: { veterans: 2 }, short: [] }),
    partyMembers: () => party.slice(),
    inParty: (id) => party.includes(id),
    partyFull: () => party.length >= 3,
    inviteToParty: (id) => { calls.invites.push(id); if (!party.includes(id)) party.push(id); return { ok: true }; },
    placePartyAtPlayer: () => { calls.placed++; for (const id of party) positions[id] = { mx: 4, my: 4 }; },
    playerAtHaven: () => atHaven,
    inCombat: () => inCombat,
    travelTargets: () => o.targets || [],
    travelTo: (x, y) => { calls.travelTos.push([x, y]); },
    monsterAt: (x, y) => (o.monsters || []).find(m => m.x === x && m.y === y) || null,
    vpOf: () => ({}),
    _calls: calls, _base: base,
  };
  return G;
}
function runDaily(G, envOn) {
  const ctx = {};
  const wrapped = SM.withStagemuster(G._base, 't', 't');
  wrapped.daily(G, ctx);
  return { ctx, calls: G._calls, wrapped };
}
// The patrol beat lives in upkeep (per day-part; the dawn gate needs it).
function runUpkeep(G, ctx) {
  const w = SM.withStagemuster(G._base, 't', 't');
  const c2 = ctx || {};
  w.upkeep(G, c2);
  return { ctx: c2, calls: G._calls };
}

async function main() {
  console.log('E0 shape');
  ok('E0 module loads with withStagemuster', typeof SM.withStagemuster === 'function');
  ok('E0 stagemusterOn exported', typeof SM.stagemusterOn === 'function');
  ok('E0 stagedFor exported', typeof SM.stagedFor === 'function');
  ok('E0 stagedCompanionsOf exported', typeof SM.stagedCompanionsOf === 'function');
  {
    const base = { daily() {}, fight() {} };
    const w = SM.withStagemuster(base, 't', 't');
    ok('E0 no fight wrapper (base.fight carries through)', w.fight === base.fight);
  }

  console.log('E2 env-gate');
  ok('E2 gate off when unset', !SM.stagemusterOn());
  process.env.STAGEMUSTER = '1';
  ok('E2b gate on when STAGEMUSTER=1', SM.stagemusterOn());

  console.log('E3 synthetic fixtures');
  // E3a: muster invites when party < 2, wave-4 live, out of combat
  {
    const G = makeGame({ party: [], dayPart: 1 });
    const { ctx, calls } = runDaily(G);
    ok('E3a muster invites when party empty', calls.invites.length >= 1 && calls.baseDailys === 1,
      'invites=' + calls.invites.length);
    ok('E3a smMusterInvitesOk counted', (ctx.smMusterInvitesOk | 0) >= 1);
  }
  // E3b: no muster when party already 2
  {
    const G = makeGame({ party: ['vidA', 'vidB'] });
    const { ctx, calls } = runDaily(G);
    ok('E3b party full (2) -> no invites', calls.invites.length === 0 && (ctx.smMusterInvites | 0) === 0);
  }
  // E3c: no muster when wave-4 locked
  {
    const G = makeGame({ party: [], wave4: false });
    const { ctx, calls } = runDaily(G);
    ok('E3c wave-4 locked -> silent', calls.invites.length === 0 && (ctx.smMusterPasses | 0) === 0);
  }
  // E3d: no muster when the w5 veterans bar is met
  {
    const G = makeGame({ party: [], w5met: true });
    const { ctx, calls } = runDaily(G);
    ok('E3d w5 bar met -> stands down', calls.invites.length === 0 && (ctx.smMusterPasses | 0) === 0);
  }
  // E3e: formation regroups drifted party members (field, position >4 away)
  {
    const G = makeGame({ party: ['vidA'], positions: { vidA: { mx: 8, my: 8 } }, smx: 0, smy: 0, dayPart: 1 });
    const { ctx, calls } = runDaily(G);
    ok('E3e drifted member -> placePartyAtPlayer', calls.placed === 1 && (ctx.smRegroups | 0) === 1,
      'placed=' + calls.placed);
  }
  // E3f: no regroup when positions are fresh (party already 2: muster adds nobody)
  {
    const G = makeGame({ party: ['vidA', 'vidB'], positions: { vidA: { mx: 4, my: 4 }, vidB: { mx: 5, my: 5 } } });
    const { ctx, calls } = runDaily(G);
    ok('E3f fresh positions -> no regroup', calls.placed === 0 && (ctx.smRegroups | 0) === 0,
      'placed=' + calls.placed + ' regroups=' + (ctx.smRegroups | 0));
  }
  // E3g: no regroup at haven (door rules positions)
  {
    const G = makeGame({ party: ['vidA'], positions: {}, atHaven: true });
    const { ctx, calls } = runDaily(G);
    ok('E3g at haven -> no field regroup', calls.placed === 0 && (ctx.smRegroups | 0) === 0);
  }
  // E3h: no beats in combat
  {
    const G = makeGame({ party: [], inCombat: true });
    G.tbfight = { over: false };
    const { ctx, calls } = runDaily(G);
    const u2 = runUpkeep(G, ctx);
    ok('E3h in combat -> silent', calls.invites.length === 0 && calls.placed === 0 &&
      (ctx.smMusterPasses | 0) === 0 && (u2.ctx.smPatrolHops | 0) === 0 &&
      u2.calls.travelTos.length === 0);
  }
  // E3i: dawn patrol hops toward the monster node (party staged, healthy)
  // — the patrol lives in upkeep (per day-part), not daily.
  {
    const G = makeGame({ party: ['vidA'], dayPart: 0,
      targets: [{ x: 5, y: 6 }, { x: 6, y: 5 }],
      monsters: [{ x: 6, y: 5, id: 'the_algorithm' }] });
    const { ctx, calls } = runUpkeep(G);
    ok('E3i dawn patrol -> travelTo the monster node', calls.travelTos.length === 1 &&
      calls.travelTos[0][0] === 6 && calls.travelTos[0][1] === 5,
      JSON.stringify(calls.travelTos));
    ok('E3i smPatrolHops counted', (ctx.smPatrolHops | 0) === 1);
  }
  // E3i2: dawn patrol fires from haven too (a dawn departure IS the patrol)
  {
    const G = makeGame({ party: ['vidA', 'vidB'], dayPart: 0, atHaven: true,
      targets: [{ x: 5, y: 4 }], monsters: [{ x: 5, y: 4, id: 'the_audit' }] });
    const { ctx, calls } = runUpkeep(G);
    ok('E3i2 dawn patrol from haven -> travelTo', calls.travelTos.length === 1 &&
      calls.travelTos[0][0] === 5 && calls.travelTos[0][1] === 4,
      JSON.stringify(calls.travelTos));
    ok('E3i2 smPatrolHops counted', (ctx.smPatrolHops | 0) === 1);
  }
  // E3i3: upkeep delegates to base.upkeep when it exists (gate on and off)
  {
    let baseUpkeeps = 0;
    const G = makeGame({ party: [], dayPart: 1 });
    G._base.upkeep = () => { baseUpkeeps++; };
    const w = SM.withStagemuster(G._base, 't', 't');
    w.upkeep(G, {});
    ok('E3i3 base.upkeep runs first', baseUpkeeps === 1);
    delete process.env.STAGEMUSTER;
    const ctx = {};
    w.upkeep(G, ctx);
    ok('E3i3 gate-off upkeep -> base.upkeep only, ctx untouched', baseUpkeeps === 2 && Object.keys(ctx).length === 0,
      'ctx keys: ' + Object.keys(ctx).join(','));
    process.env.STAGEMUSTER = '1';
  }
  {
    const G = makeGame({ party: ['vidA'], dayPart: 0, scholarHpPct: 0.5,
      targets: [{ x: 6, y: 5 }], monsters: [{ x: 6, y: 5, id: 'the_algorithm' }] });
    const { ctx, calls } = runUpkeep(G);
    ok('E3j battered scholar -> no patrol', calls.travelTos.length === 0 && (ctx.smPatrolHops | 0) === 0);
  }
  // E3k: no patrol when the party is empty (and no one can be mustered: trust floor)
  {
    const G = makeGame({ party: [], dayPart: 0, trust: { vidA: 5, vidB: 5, vidC: 5 },
      targets: [{ x: 6, y: 5 }], monsters: [{ x: 6, y: 5, id: 'the_algorithm' }] });
    const { calls } = runUpkeep(G);
    ok('E3k empty party -> no patrol', calls.travelTos.length === 0);
  }
  // E3l: no dangerous target -> skip counted, no hop
  {
    const G = makeGame({ party: ['vidA'], dayPart: 0, targets: [{ x: 5, y: 6 }], monsters: [] });
    const { ctx, calls } = runUpkeep(G);
    ok('E3l no dangerous target -> skip', calls.travelTos.length === 0 && (ctx.smPatrolSkips | 0) === 1);
  }
  // E3m: gate off -> pure delegation, ctx untouched
  {
    delete process.env.STAGEMUSTER;
    const G = makeGame({ party: [], dayPart: 0,
      targets: [{ x: 6, y: 5 }], monsters: [{ x: 6, y: 5, id: 'the_algorithm' }] });
    const { ctx, calls } = runDaily(G);
    ok('E3m gate-off -> base.daily only, ctx untouched', calls.baseDailys === 1 &&
      calls.invites.length === 0 && calls.travelTos.length === 0 && calls.placed === 0 &&
      Object.keys(ctx).length === 0, 'ctx keys: ' + Object.keys(ctx).join(','));
    process.env.STAGEMUSTER = '1';
  }
  // E3n: stagedCompanionsOf — only live party villagers in the fight
  {
    const G = makeGame({ party: ['vidA', 'vidB'] });
    G.tbfight = { id: 'f1', over: false, fighters: [
      { key: 'p', kind: 'player', alive: true },
      { key: 'v_0', kind: 'villager', villagerId: 'vidA', alive: true, fled: false },
      { key: 'v_1', kind: 'villager', villagerId: 'vidB', alive: true, fled: true },
      { key: 'v_2', kind: 'villager', villagerId: 'vidC', alive: true, fled: false },
      { key: 'm_0', kind: 'monster', alive: true, fled: false },
    ] };
    const got = SM.stagedCompanionsOf(G);
    ok('E3n census: only live party members', got.length === 1 && got[0].villagerId === 'vidA',
      'got=' + got.map(c => c.villagerId).join(','));
  }

  console.log('E1 det-gate (60d x2 bases, STAGEMUSTER unset, ARMORYDRIVE=1 both sides)');
  delete process.env.STAGEMUSTER;
  ok('E1 gate off again for det-gate', !SM.stagemusterOn());
  for (const [baseId, seed] of [['leadfeast', 65421], ['belongfeast', 65422]]) {
    const base = baseId === 'leadfeast' ? TF.leadfeast : TF.belongfeast;
    const a = await shortRun(AD.armedFor(baseId), seed, 60);
    const b = await shortRun(SM.stagedFor(baseId), seed, 60);
    const da = digest(a.Game, a.result), db = digest(b.Game, b.result);
    ok(`E1 ${baseId} s${seed} byte-identical`, da === db, da !== db ? `\n  A=${da}\n  B=${db}` : '');
  }

  console.log('E4 armed+KILLDISC deterministic (STAGEMUSTER=1)');
  process.env.STAGEMUSTER = '1';
  {
    const a = await shortRun(SM.stagedFor('leadfeast'), 65423, 60);
    const b = await shortRun(SM.stagedFor('leadfeast'), 65423, 60);
    const da = digest(a.Game, a.result), db = digest(b.Game, b.result);
    ok('E4 identical seeds -> identical digest', da === db, da !== db ? `\n  A=${da}\n  B=${db}` : '');
  }

  console.log('D2 180d armed run completes + deterministic re-run (STAGEMUSTER=1)');
  {
    const a = await shortRun(SM.stagedFor('belongfeast'), 65424, 180);
    const b = await shortRun(SM.stagedFor('belongfeast'), 65424, 180);
    const da = digest(a.Game, a.result), db = digest(b.Game, b.result);
    ok('D2 180d armed completes', !!a.result && !!b.result);
    ok('D2 180d armed deterministic re-run', da === db, da !== db ? `\n  A=${da}\n  B=${db}` : '');
  }
  delete process.env.STAGEMUSTER;

  console.log(`\n${pass} PASS, ${fail} FAIL`);
  process.exit(fail ? 1 : 0);
}

main().catch(e => { console.error('PROOF FAIL:', e && e.stack || e); process.exit(1); });
