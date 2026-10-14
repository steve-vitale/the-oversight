#!/usr/bin/env node
// scripts/test-succombat-20261014.js — proof for the succombat policy layer.
//
// RED PHASE (gate off = pure delegation): identical seeds, 30 loop-days,
// raw leadcourt vs wrapSuccombat(leadcourt) with SUCCOMBAT unset —
// semantic telemetry + samples + pacing must be IDENTICAL, and no sc*
// counters may be written. Any divergence fails.
//
// GREEN PHASE (gate on, SUCCOMBAT=1): real engine succession
// (Game.playerDeath -> the village chooses a successor) must be detected via
// villagerId change; the heal check must patch a hurt successor with honest
// verbs (no free healing); synthetic fresh-successor fights must route
// winnable races to fight-back (base delegation) and lost races to the hold
// (no base delegation, no flee-to-edge); party-winnable races rally then
// fight back; gate-off and non-fresh fights delegate.
//
// Node harness rules: loadGame seeds Math.random BEFORE eval (modules
// capture it at load); Game.save is never stubbed; no concurrent jest.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { leadcourt } = require('./policies/leadcourt');
let SC;
try { SC = require('./policies/succombat'); }
catch (e) { console.error('SKIP: ./policies/succombat was deleted per kill protocol (arm killed at pilot) — proof retained as the durable record'); process.exit(0); }
const { wrapSuccombat, checkSuccession, freshSuccessor, scHealCheck, scRace } = SC;

let failures = 0;
function check(name, cond, detail) {
  if (cond) { console.log(`  ok: ${name}`); }
  else { failures++; console.log(`  FAIL: ${name}${detail ? ' — ' + detail : ''}`); }
}

function teleSig(Game) {
  const evs = Game.state.telemetry || [];
  return evs.map(e => [
    e.day, e.part, e.type, e.who, e.cause, e.kind, e.player ? 1 : 0,
  ].join('|')).join('\n');
}
function runSig(result) {
  return JSON.stringify({
    days: result.days, gameDays: result.gameDays, endReason: result.endReason,
    pop: result.samples.pop, pantry: result.samples.pantry,
    knowledge: result.samples.knowledge, deaths: result.samples.deaths,
    trust: result.samples.trust,
    verbs: result.pacing ? result.pacing.meanVerbsPerDay : null,
  });
}
function scCounters(ctx) {
  const out = {};
  for (const k of Object.keys(ctx)) if (k.startsWith('sc') || k === '_scBearer' || k === '_scFightObj' || k === '_scMode') out[k] = ctx[k];
  return out;
}

async function run30(policy, seed, mode) {
  const { Game, manifest } = await loadGame({ seed, mode, fullTelemetry: true });
  await setupGame(Game);
  const ctx = { policyId: policy.id, notes: [] };
  if (policy.setup) await policy.setup(Game, ctx);
  const result = await runDays(Game, policy, { days: 30, manifest, sampleEvery: 10 });
  return { sig: teleSig(Game) + '\n@@RUN@@\n' + runSig(result), ctx };
}

async function red() {
  console.log('RED: gate off = pure delegation (identical seeds, 30d)');
  delete process.env.SUCCOMBAT;
  const wrapped = wrapSuccombat(leadcourt);
  check('wrapped id distinct', wrapped.id === 'leadcourt-succombat', wrapped.id);
  for (const seed of [11, 22]) {
    const a = await run30(leadcourt, seed, 'sc-red-base-' + seed);
    const b = await run30(wrapped, seed, 'sc-red-wrap-' + seed);
    check(`seed ${seed}: telemetry semantic-identical`, a.sig === b.sig,
      a.sig === b.sig ? '' : `lens ${a.sig.length}/${b.sig.length}`);
    const sc = scCounters(b.ctx);
    const dirty = Object.keys(sc).filter(k => k !== '_scBearer');
    check(`seed ${seed}: no sc* counters written`, dirty.length === 0, JSON.stringify(sc));
  }
}

// Synthetic-fight builders (proof-combat-survival-20261013.js pattern).
function mkFight(Game, fighters) {
  Game.tbfight = {
    id: 'sc-proof', fighters,
    order: fighters.map(f => f.key), turnIdx: 0, round: 1, over: false,
  };
}
function mkPlayer(opts) {
  return Object.assign({
    key: 'p', kind: 'player', name: 'You', mx: 4, my: 4,
    hp: 100, maxHp: 100, alive: true, fled: false, speed: 3,
    moveLeft: 3, acted: false,
  }, opts || {});
}
function mkMonster(Game, key, id, opts) {
  const mdef = (Game.data.monsters || []).find(m => m.id === id);
  if (!mdef) throw new Error('no mdef for ' + id);
  return Object.assign({
    key, kind: 'monster', monsterId: id, mdef, name: mdef.name || id,
    mx: 6, my: 4, hp: 100, maxHp: 100, alive: true, fled: false,
    speed: 3, moveLeft: 3, acted: false,
  }, opts || {});
}
function mkVillager(key, vid, opts) {
  return Object.assign({
    key, kind: 'villager', villagerId: vid, name: 'Vill' + key,
    mx: 2, my: 4, hp: 100, maxHp: 100, alive: true, fled: false,
    speed: 3, moveLeft: 3, acted: false, wbonus: 0,
  }, opts || {});
}
function endFight(Game) { try { if (Game.tbfight && !Game.tbfight.over) Game.tbEnd('fled'); } catch (e) {} }

async function green() {
  console.log('GREEN: succession detection, heal check, fight routing (gate on)');
  process.env.SUCCOMBAT = '1';

  // --- succession detection via villagerId change ---
  {
    const { Game } = await loadGame({ seed: 11, mode: 'sc-green-succ', fullTelemetry: true });
    await setupGame(Game);
    const wrapped = wrapSuccombat(leadcourt);
    const ctx = { policyId: wrapped.id, notes: [] };
    await wrapped.setup(Game, ctx);
    const oldBearer = ctx._scBearer;
    check('setup recorded a bearer', !!oldBearer, String(oldBearer));
    check('not fresh before any succession', freshSuccessor(Game, ctx) === false);
    Game.playerDeath('combat');
    const newBearer = Game.villagerId;
    check('succession happened (bearer changed)', !!newBearer && newBearer !== oldBearer,
      `${oldBearer} -> ${newBearer}`);
    checkSuccession(Game, ctx);
    check('succession detected via villagerId change', ctx.scSuccessions === 1, String(ctx.scSuccessions));
    check('fresh successor within 2 days', freshSuccessor(Game, ctx) === true);
    // three days later the window closes
    Game.state.scholar.day = (Game.state.scholar.day || 0) + 3;
    check('window closes after 2 days', freshSuccessor(Game, ctx) === false);
  }

  // --- heal check: honest verbs, no free healing ---
  {
    const { Game } = await loadGame({ seed: 22, mode: 'sc-green-heal', fullTelemetry: true });
    await setupGame(Game);
    const ctx = { policyId: 'x', notes: [] };
    const s = Game.state.scholar;
    s.health = 40; // hurt: 40%
    // a first-aid kit in the pack
    s.inventory = s.inventory || [];
    s.inventory.push({ itemId: 'first_aid_kit', id: 'first_aid_kit', name: 'First aid kit', units: 1 });
    const hc = scHealCheck(Game, ctx, false);
    check('heal check fired when hurt', (ctx.scHealChecks || 0) === 1, String(ctx.scHealChecks));
    check('first-aid kit consumed honestly', !s.inventory.find(i => (i.itemId || i.id) === 'first_aid_kit'),
      JSON.stringify(s.inventory.map(i => i.itemId || i.id)));
    check('health rose by the kit (+30)', s.health === 70, `health=${s.health} healed=${hc.healed}`);
    check('hpPct recomputed post-heal', Math.abs(hc.hpPct - 0.7) < 0.01, String(hc.hpPct));
    // healthy scholar: no heal, no counters
    s.health = 90;
    const ctx2 = { policyId: 'x', notes: [] };
    scHealCheck(Game, ctx2, false);
    check('no heal when healthy (>=70%)', (ctx2.scHealChecks || 0) === 0, String(ctx2.scHealChecks));
    // hurt with nothing to heal with: fires the check, heals nothing, no crash
    s.health = 40; s.inventory = [];
    const ctx3 = { policyId: 'x', notes: [] };
    const hc3 = scHealCheck(Game, ctx3, false);
    check('empty-handed heal check degrades gracefully', hc3.healed === 0 && (ctx3.scHealChecks || 0) === 1,
      JSON.stringify(hc3));
  }

  // --- fight routing on synthetic fresh-successor fights ---
  {
    const { Game } = await loadGame({ seed: 33, mode: 'sc-green-fight', fullTelemetry: true });
    await setupGame(Game);
    const mkWrapped = () => {
      const base = Object.assign({}, leadcourt);
      let baseFightCalls = 0;
      const origFight = base.fight;
      base.fight = (G, C) => { baseFightCalls++; return origFight(G, C); };
      const wrapped = wrapSuccombat(base);
      const ctx = { policyId: wrapped.id, notes: [] };
      return { wrapped, ctx, baseFightCalls: () => baseFightCalls };
    };
    const forceFresh = (Game2, ctx) => {
      // simulate a succession 1 day ago without killing anyone
      ctx._scBearer = Game2.villagerId;
      ctx.scSuccessionDays = [(Game2.state.scholar.day || 0) - 1];
    };

    // (i) winnable race, full HP -> fight back (delegates to base)
    {
      const { wrapped, ctx, baseFightCalls } = mkWrapped();
      await wrapped.setup(Game, ctx);
      forceFresh(Game, ctx);
      const p = mkPlayer({ hp: 100, maxHp: 100 });
      const m = mkMonster(Game, 'm0', 'hushwolf', { hp: 40, maxHp: 40 });
      mkFight(Game, [p, m]);
      let r = 'unset', threw = false;
      try { r = wrapped.fight(Game, ctx); } catch (e) { threw = true; r = 'threw:' + e.message; }
      check('winnable: delegates to base fight', !threw && baseFightCalls() >= 1, `r=${r} calls=${baseFightCalls()}`);
      check('winnable: fight-back counted', (ctx.scFightBacks || 0) === 1, String(ctx.scFightBacks));
      check('winnable: no hold', (ctx.scHolds || 0) === 0, String(ctx.scHolds));
      endFight(Game);
    }
    // (ii) lost race (gallowdeer 160 HP), full HP -> HOLD, no base delegation
    {
      const { wrapped, ctx, baseFightCalls } = mkWrapped();
      await wrapped.setup(Game, ctx);
      forceFresh(Game, ctx);
      const p = mkPlayer({ hp: 100, maxHp: 100 });
      const m = mkMonster(Game, 'm0', 'gallowdeer', { hp: 160, maxHp: 160 });
      mkFight(Game, [p, m]);
      let r = 'unset', threw = false;
      try { r = wrapped.fight(Game, ctx); } catch (e) { threw = true; r = 'threw:' + e.message; }
      check('lost race: HOLD (no base delegation)', !threw && baseFightCalls() === 0 && (ctx.scHolds || 0) === 1,
        `r=${r} calls=${baseFightCalls()} holds=${ctx.scHolds}`);
      check('lost race: hold acts in place (no flee-to-edge)', (ctx.scStruck || 0) >= 1 || (ctx.scRallies || 0) >= 1 || (ctx.scClosed || 0) >= 1,
        `struck=${ctx.scStruck} rallies=${ctx.scRallies} closed=${ctx.scClosed}`);
      check('lost race: no flee counters from the hold', (ctx.fled || 0) === 0, String(ctx.fled));
      endFight(Game);
    }
    // (iii) hurt successor (30%) vs weak monster -> HOLD (hp gate)
    {
      const { wrapped, ctx, baseFightCalls } = mkWrapped();
      await wrapped.setup(Game, ctx);
      forceFresh(Game, ctx);
      const p = mkPlayer({ hp: 30, maxHp: 100 });
      const m = mkMonster(Game, 'm0', 'hushwolf', { hp: 40, maxHp: 40 });
      mkFight(Game, [p, m]);
      let threw = false;
      try { wrapped.fight(Game, ctx); } catch (e) { threw = true; }
      check('hurt successor: HOLD via hp gate', !threw && baseFightCalls() === 0 && (ctx.scHolds || 0) === 1,
        `calls=${baseFightCalls()} holds=${ctx.scHolds}`);
      endFight(Game);
    }
    // (iv) lost solo race but the PARTY carries it -> fight back (+ rally)
    {
      const { wrapped, ctx, baseFightCalls } = mkWrapped();
      await wrapped.setup(Game, ctx);
      forceFresh(Game, ctx);
      const roster = (Game.state.village.roster || []).filter(r => r !== Game.villagerId);
      const p = mkPlayer({ hp: 100, maxHp: 100 });
      const m = mkMonster(Game, 'm0', 'hushwolf', { hp: 120, maxHp: 120 });
      const v1 = mkVillager('v1', roster[0] || 'vill_x', { wbonus: 10 });
      const v2 = mkVillager('v2', roster[1] || 'vill_y', { wbonus: 10 });
      mkFight(Game, [p, v1, v2, m]);
      const race = scRace(Game, ctx, Game.tbfight, p);
      let threw = false;
      try { wrapped.fight(Game, ctx); } catch (e) { threw = true; }
      check('party race assessed', race.allies.length === 2, `allies=${race.allies.length} decline=${race.decline} partyWinnable=${race.partyWinnable}`);
      check('party-winnable: fight back', !threw && (ctx.scFightBacks || 0) === 1, `fightbacks=${ctx.scFightBacks}`);
      endFight(Game);
    }
    // (v) gate OFF: identical lost-race fight delegates (no hold)
    {
      delete process.env.SUCCOMBAT;
      const { wrapped, ctx, baseFightCalls } = mkWrapped();
      await wrapped.setup(Game, ctx);
      ctx._scBearer = Game.villagerId;
      ctx.scSuccessionDays = [(Game.state.scholar.day || 0) - 1];
      const p = mkPlayer({ hp: 100, maxHp: 100 });
      const m = mkMonster(Game, 'm0', 'gallowdeer', { hp: 160, maxHp: 160 });
      mkFight(Game, [p, m]);
      let threw = false;
      try { wrapped.fight(Game, ctx); } catch (e) { threw = true; }
      check('gate off: delegates even a lost race', !threw && baseFightCalls() >= 1 && (ctx.scHolds || 0) === 0,
        `calls=${baseFightCalls()} holds=${ctx.scHolds}`);
      endFight(Game);
      process.env.SUCCOMBAT = '1';
    }
    // (vi) stale successor (no recent succession): delegates
    {
      const { wrapped, ctx, baseFightCalls } = mkWrapped();
      await wrapped.setup(Game, ctx);
      // no succession recorded -> not fresh
      const p = mkPlayer({ hp: 100, maxHp: 100 });
      const m = mkMonster(Game, 'm0', 'gallowdeer', { hp: 160, maxHp: 160 });
      mkFight(Game, [p, m]);
      let threw = false;
      try { wrapped.fight(Game, ctx); } catch (e) { threw = true; }
      check('non-fresh: delegates to base', !threw && baseFightCalls() >= 1, `calls=${baseFightCalls()}`);
      endFight(Game);
    }
  }

  // --- daily: hurt fresh successor holds at haven (no travel) ---
  {
    const { Game } = await loadGame({ seed: 44, mode: 'sc-green-daily', fullTelemetry: true });
    await setupGame(Game);
    const wrapped = wrapSuccombat(leadcourt);
    const ctx = { policyId: wrapped.id, notes: [] };
    await wrapped.setup(Game, ctx);
    Game.playerDeath('combat');
    checkSuccession(Game, ctx);
    Game.state.scholar.health = 40; // hurt, nothing to heal with
    Game.state.scholar.inventory = [];
    const mapBefore = Game.map.px + ',' + Game.map.py;
    await wrapped.daily(Game, ctx);
    check('hurt fresh successor: hold day fired', (ctx.scHoldDays || 0) === 1, String(ctx.scHoldDays));
    check('hold day: no travel to wild tiles', Game.map.px + ',' + Game.map.py === mapBefore,
      `${mapBefore} -> ${Game.map.px},${Game.map.py}`);
    // fit fresh successor: delegates to base daily (counter only, no hold)
    const ctx2 = { policyId: wrapped.id, notes: [] };
    await wrapped.setup(Game, ctx2);
    Game.state.scholar.health = 100;
    ctx2._scBearer = Game.villagerId;
    ctx2.scSuccessionDays = [Game.state.scholar.day || 0];
    await wrapped.daily(Game, ctx2);
    check('fit fresh successor: base daily runs', (ctx2.scHoldDays || 0) === 0 && (ctx2.scFitDays || 0) === 1,
      `hold=${ctx2.scHoldDays} fit=${ctx2.scFitDays}`);
  }
  delete process.env.SUCCOMBAT;
}

(async () => {
  await red();
  await green();
  console.log(failures === 0 ? 'ALL GREEN' : `${failures} FAILURES`);
  process.exit(failures === 0 ? 0 : 1);
})().catch(e => { console.error('HARNESS ERROR', e); process.exit(2); });
