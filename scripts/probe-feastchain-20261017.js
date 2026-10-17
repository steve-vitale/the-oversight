#!/usr/bin/env node
// scripts/probe-feastchain-20261017.js — WHERE does the feast chain break
// on the SEATDRIVE=0 / FEASTSCALE_R13=1 courtship substrate?
// Instruments: hostFeast calls (armed?), grantFeastBuff grants, buff grants,
// feastDrawPending firings, faceFeastDraw calls, noteFeastedCombatUse marks,
// scholar combat engagements, devotion arm state (prog.feastSurge).
// Read-only: hooks record, never alter. Run:
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/probe-feastchain-20261017.js
'use strict';
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { leadfeast } = require('./policies/feastscale');

function assertSubstrate() {
  const f = [];
  if (process.env.FEASTSCALE_R13 !== '1') f.push('FEASTSCALE_R13=1 required');
  if (process.env.SEATDRIVE !== '0') f.push('SEATDRIVE=0 required EXPLICIT');
  if (f.length) { console.error('PROBE STOP: ' + f.join('; ')); process.exit(2); }
}

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [9001, 9002]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '90', 10);

async function probe(seed) {
  const { Game } = await loadGame({ seed, mode: 'feastchain-probe' });
  await setupGame(Game);
  const c = {
    hostFeast: 0, armedFeasts: 0, grants: 0, buffsSeen: 0, drawsPending: 0,
    facedDraw: 0, feastedMarks: 0, combatEngagements: 0, devotionArms: 0,
    firstFeastDay: 0, firstGrantDay: 0, firstMarkDay: 0,
  };
  const day = () => (Game.state.scholar || {}).day || 0;
  // hostFeast wrap
  const oh = Game.hostFeast;
  Game.hostFeast = function (...a) {
    c.hostFeast++;
    const armed = !!((Game.state.scholar || {}).prog || {}).feastSurge;
    if (!c.firstFeastDay) c.firstFeastDay = day();
    let r;
    try { r = oh.apply(this, a); } catch (e) { r = null; }
    if (r && r.ok && armed) c.armedFeasts++;
    return r;
  };
  // grantFeastBuff wrap
  const og = Game.grantFeastBuff;
  Game.grantFeastBuff = function (...a) {
    c.grants++;
    if (!c.firstGrantDay) c.firstGrantDay = day();
    try { return og.apply(this, a); } catch (e) { return null; }
  };
  // noteFeastedCombatUse wrap
  const on = Game.noteFeastedCombatUse;
  Game.noteFeastedCombatUse = function (...a) {
    c.feastedMarks++;
    if (!c.firstMarkDay) c.firstMarkDay = day();
    try { return on.apply(this, a); } catch (e) { return null; }
  };
  // feastDrawPending wrap
  const op = Game.feastDrawPending;
  Game.feastDrawPending = function (...a) {
    const r = op.apply(this, a);
    if (r) c.drawsPending++;
    return r;
  };
  // faceFeastDraw wrap
  const of = Game.faceFeastDraw;
  Game.faceFeastDraw = function (...a) {
    c.facedDraw++;
    try { return of.apply(this, a); } catch (e) { return null; }
  };
  // startCombat wrap — scholar engagements
  const osc = Game.startCombat;
  Game.startCombat = function (...a) {
    c.combatEngagements++;
    try { return osc.apply(this, a); } catch (e) { return null; }
  };
  let result = null;
  await quietLog(async () => { result = await runDays(Game, leadfeast, { days: DAYS, sampleEvery: 30 }); });
  const s = Game.state.scholar || {};
  c.devotionArmed = !!((s.prog || {}).feastSurge);
  c.feastSurgeUsed = !!((s.prog || {}).feastSurgeUsed);
  c.survived = !Game.over;
  c.endDay = day();
  c.armedFeastsCtx = (result && result.ctx && result.ctx.fsArmedFeasts) || 0;
  c.feastsCtx = (result && result.ctx && result.ctx.fsFeasts) || 0;
  c.facedDrawCtx = (result && result.ctx && result.ctx.facedDraw) || 0;
  console.log('seed ' + seed + ': ' + JSON.stringify(c));
}

(async () => {
  assertSubstrate();
  for (const s of SEEDS) await probe(s);
})().catch(e => { console.error('PROBE FATAL', e); process.exit(1); });
