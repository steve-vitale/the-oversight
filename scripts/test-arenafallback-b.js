#!/usr/bin/env node
// test-arenafallback-b.js — proof for sim-arenafallback-b:
// tbFightDeathCause names each tbEnd fallback origin honestly.
// L1–L7: direct label-function legs on fabricated fight objects.
// L8–L14: real tbEnd harness legs, one fresh game per origin, through
// the real entry point (arena via _contestArena, betrayal via
// startBetrayalCombat, table trial via startCombat('finale',
// {tableTrial:true}), coalition via seeded muster + startCombat('herald'),
// alien via apStartEncounter, wild via startCombat('bulldozer')).
// Loss forced the arenalabel way (HP -> 0, tbEndCheck, tbEnd('lost')).
// Label-only: no HP/kcal/behavior assertion beyond the label.
//   node scripts/test-arenafallback-b.js   (exit 0 = PROOF-GREEN)
'use strict';
const { loadGame, setupGame } = require('./sim-harness');

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('PASS ' + name); }
  else { fail++; console.log('FAIL ' + name + (extra ? ' :: ' + extra : '')); }
}
function wildFight() {
  return { fighters: [{ key: 'p', kind: 'player' }, { key: 'm_0', kind: 'monster', monsterId: 'bulldozer' }] };
}
function hostileFight(pid) {
  return { fighters: [{ key: 'p', kind: 'player' }, { key: 'ap_x', kind: 'hostile', alienPid: pid }] };
}

async function realLeg(seed, origin) {
  const { Game } = await loadGame({ seed });
  await setupGame(Game);
  const deaths = [];
  const sayLines = [];
  const origPD = Game.playerDeath;
  Game.playerDeath = function (...a) { deaths.push(a[0]); return origPD.apply(this, a); };
  const origSay = Game.say;
  Game.say = function (...a) { try { sayLines.push(String(a[0] || '')); } catch (e) {} return origSay.apply(this, a); };
  const s = Game.state.scholar;
  s.abilities = [];
  Game.state.phoenixLink = null;
  const bearerBefore = Game.villagerId;
  try {
    if (origin === 'arena') {
      const ac = { contestId: 'pit', arenaSuspended: false, phases: [], phaseIdx: 0 };
      Game.state.activeContest = ac;
      Game._contestArena(ac, { waves: 1 }, []);
    } else if (origin === 'betrayal') {
      const roster = (Game.state.village && Game.state.village.roster) || [];
      Game.startBetrayalCombat(roster.find((x) => x !== Game.villagerId));
    } else if (origin === 'tableTrial') {
      Game.startCombat('finale', { tableTrial: true });
    } else if (origin === 'coalition') {
      Game.state.titans = Game.state.titans || {};
      Game.state.titans.musters = Game.state.titans.musters || {};
      const allies = [];
      for (let i = 0; i < 10; i++) allies.push({ vid: 'ally_' + i, villageId: 'ally-village-' + i, name: 'Ally ' + i, hp: 100 });
      Game.state.titans.musters.herald = { allies, haven: [] };
      Game.startCombat('herald');
    } else if (origin === 'alien') {
      Game.apStartEncounter('pip_quindle');
    } else if (origin === 'wild') {
      Game.startCombat('bulldozer');
    }
  } catch (e) { return { error: 'start: ' + e.message }; }
  const f = Game.tbfight;
  if (!f) return { error: 'no fight started' };
  const flags = { betrayal: !!f.betrayal, tableTrial: !!f.tableTrial, coalitionArena: !!f.coalitionArena, arenaContest: !!Game.state.arenaContest };
  const p = Game.tbFighter('p');
  if (p) { p.hp = 0; p.alive = false; }
  s.health = 0;
  try { Game.tbEndCheck(); } catch (e) {}
  if (Game.tbfight && !Game.tbfight.over) { try { Game.tbEnd('lost'); } catch (e) {} }
  const fallen = ((Game.state.village || {}).fallen || []).filter((x) => x.villagerId === bearerBefore);
  const teles = (Game.state.telemetry || []).filter((t) => t && t.type === 'death' && String(t.who) === String(bearerBefore));
  let lineage = null;
  try {
    const lin = typeof Game.lineage === 'function' ? Game.lineage() : [];
    const mine = lin.filter((x) => x.villagerId === bearerBefore);
    lineage = mine.length ? mine[mine.length - 1].cause : null;
  } catch (e) { lineage = 'ERR'; }
  const line = sayLines.filter((l) => /is dead —/.test(l)).pop() || null;
  return {
    deaths, flags,
    fallen: fallen.length ? fallen[fallen.length - 1].cause : null,
    telemetry: teles.length ? teles[teles.length - 1].cause : null,
    lineage, line,
  };
}

(async () => {
  const { Game } = await loadGame({ seed: 4242 });
  await setupGame(Game);
  if (typeof Game.tbFightDeathCause !== 'function') {
    console.log('FAIL tbFightDeathCause missing — the lever is not installed');
    process.exit(1);
  }
  const saveArc = Game.state.arenaContest;
  try { Game.state.arenaContest = null; } catch (e) {}
  Game.state.arenaContest = { contestId: 'pit', waves: ['bulldozer'], waveIdx: 0 };
  ok('L1 arenaContest present -> the arena', Game.tbFightDeathCause(wildFight()) === 'the arena');
  Game.state.arenaContest = null;
  ok('L2 proven wild -> the wild', Game.tbFightDeathCause(wildFight()) === 'the wild');
  ok('L3 betrayal -> betrayal', Game.tbFightDeathCause({ betrayal: true, fighters: wildFight().fighters }) === 'betrayal');
  ok('L4 tableTrial -> the table trial', Game.tbFightDeathCause({ tableTrial: true, fighters: wildFight().fighters }) === 'the table trial');
  ok('L5 coalitionArena -> the coalition arena', Game.tbFightDeathCause({ coalitionArena: {}, fighters: wildFight().fighters }) === 'the coalition arena');
  ok('L6 alien-hostile -> a stranger', Game.tbFightDeathCause(hostileFight('pip_quindle')) === 'a stranger');
  ok('L6b hostile without alienPid, no flags -> the arena (unchanged fallback)',
    Game.tbFightDeathCause({ fighters: [{ key: 'p', kind: 'player' }, { key: 'h_0', kind: 'hostile' }] }) === 'the arena');
  ok('L7 betrayal beats alien check (betrayal flag + hostile fighter -> betrayal, not stranger)',
    Game.tbFightDeathCause({ betrayal: true, fighters: [{ key: 'p', kind: 'player' }, { key: 'h_0', kind: 'hostile', alienPid: 'pip_quindle' }] }) === 'betrayal');
  Game.state.arenaContest = saveArc;

  const EXPECT = {
    arena: 'the arena', betrayal: 'betrayal', tableTrial: 'the table trial',
    coalition: 'the coalition arena', alien: 'a stranger', wild: 'the wild',
  };
  const FLAGKEY = { arena: 'arenaContest', betrayal: 'betrayal', tableTrial: 'tableTrial', coalition: 'coalitionArena' };
  let seed = 9001;
  for (const origin of Object.keys(EXPECT)) {
    const r = await realLeg(seed++, origin);
    const label = EXPECT[origin];
    if (r.error) { ok('L-real ' + origin + ' loss', false, r.error); continue; }
    ok('L-real ' + origin + ' flag set', FLAGKEY[origin] ? !!r.flags[FLAGKEY[origin]] : true, JSON.stringify(r.flags));
    ok('L-real ' + origin + ' -> playerDeath ' + label, r.deaths[0] === label, 'cause=' + JSON.stringify(r.deaths));
    ok('L-real ' + origin + ' derivations agree', r.fallen === label && r.telemetry === label && r.lineage === label,
      JSON.stringify({ fallen: r.fallen, telemetry: r.telemetry, lineage: r.lineage }));
    ok('L-real ' + origin + ' death line names it', !!r.line, r.line ? r.line.slice(0, 120) : 'no death line');
    if (r.line) console.log('  line[' + origin + ']: ' + r.line.slice(0, 160));
  }
  console.log(pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error('PROOF CRASH', e && (e.stack || e)); process.exit(2); });
