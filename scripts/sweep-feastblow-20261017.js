#!/usr/bin/env node
// scripts/sweep-feastblow-20261017.js — FEASTBLOW pilot sweep (flesh-out loop,
// axis scale-onramp, 2026-10-17).
//
// 8 FRESH seeds [9501-9508] x {leadfeast, belongfeast} x {armed, control}
// = 32 runs, 180d death-aware, identical-seed armed/control pairs.
// ARMED = feastblow layer on (FEASTBLOW=1); CONTROL = bare feastscale policy.
// Substrate asserted up front (SWEEP STOP on mismatch).
//
// Per run: foodDeeds end flags (sentimentTaught, feastSurgeUsed), feasted
// marks (noteFeastedCombatUse calls), draws cast / faced, seat-earned
// (tableSeat 'lesser' ever + first day via the tablegate instrument),
// invitation staged (tableWaiting ever), national ever, table ever, wins,
// survival days, scholar combat deaths (live tele capture).
//
// Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/sweep-feastblow-20261017.js
// Targeted: SEEDS="9501,9502" ONLY="leadfeast" ARM="armed" DAYS=180
// Smoke: SMOKE=1 FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/sweep-feastblow-20261017.js
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');
const { leadfeastblow, belongfeastblow } = require('./policies/feastblow');
const { attachTablegateCapture } = require('./tablegate-instrument-20261017');

const DATE = '2026-10-17';
function assertSubstrate() {
  const fails = [];
  if (process.env.FEASTSCALE_R13 !== '1') fails.push('FEASTSCALE_R13=1 required');
  if (process.env.SEATDRIVE !== '0') fails.push('SEATDRIVE=0 required EXPLICIT');
  if (fails.length) { console.error('SWEEP STOP: ' + fails.join('; ')); process.exit(2); }
}

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [9501, 9502, 9503, 9504, 9505, 9506, 9507, 9508]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10);
const SMOKE = process.env.SMOKE === '1';
const EFF_DAYS = SMOKE ? 12 : DAYS;
const BASES = { leadfeast, belongfeast };
const ARMED = { leadfeast: leadfeastblow, belongfeast: belongfeastblow };
const ROADS = process.env.ONLY ? String(process.env.ONLY).split(',').map(s => s.trim()).filter(s => BASES[s]) : ['leadfeast', 'belongfeast'];
const ARMS = process.env.ARM ? String(process.env.ARM).split(',').map(s => s.trim()).filter(s => s === 'armed' || s === 'control') : ['armed', 'control'];
const EVID = path.join(__dirname, '..', 'evidence', DATE, 'perseed-feastblow');
if (!SMOKE) fs.mkdirSync(EVID, { recursive: true });

function dayOf(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }

async function runOne(seed, road, arm) {
  const useLayer = arm === 'armed';
  const policy = useLayer ? ARMED[road] : BASES[road];
  const prevBlow = process.env.FEASTBLOW;
  if (useLayer) process.env.FEASTBLOW = '1'; else delete process.env.FEASTBLOW;
  try {
    const { Game } = await loadGame({ seed, mode: `feastblow-${road}-${arm}` });
    await setupGame(Game);
    // --- read-only feast-chain instrument: hooks record, never alter ---
    const m = { marks: 0, draws: 0, faced: 0, faceOk: 0, feasts: 0, armedFeasts: 0, fbFacedCtx: 0, fbSkippedLowHp: 0, errors: 0 };
    const wrap = (name, fn) => {
      const orig = Game[name];
      if (typeof orig !== 'function') return;
      Game[name] = function (...a) { let r; try { r = orig.apply(this, a); } catch (e) { m.errors++; r = null; } return r; };
    };
    const onm = Game.noteFeastedCombatUse;
    if (typeof onm === 'function') Game.noteFeastedCombatUse = function (...a) { m.marks++; try { return onm.apply(this, a); } catch (e) { m.errors++; return null; } };
    const ods = Game.drawFeastScavenger;
    if (typeof ods === 'function') Game.drawFeastScavenger = function (...a) { let r = null; try { r = ods.apply(this, a); } catch (e) { m.errors++; } if (r && r.drawn) m.draws++; return r; };
    const off = Game.faceFeastDraw;
    if (typeof off === 'function') Game.faceFeastDraw = function (...a) { m.faced++; let r = null; try { r = off.apply(this, a); } catch (e) { m.errors++; } if (r && r.ok) m.faceOk++; return r; };
    const ohf = Game.hostFeast;
    if (typeof ohf === 'function') Game.hostFeast = function (...a) {
      const armed = !!((Game.state.scholar || {}).prog || {}).feastSurge;
      let r = null; try { r = ohf.apply(this, a); } catch (e) { m.errors++; }
      if (r && r.ok) { m.feasts++; if (armed) m.armedFeasts++; }
      return r;
    };
    // --- live death capture (independent of the 300-event tele cap) ---
    const deaths = [];
    const _tele = Game.tele;
    Game.tele = function (type, data) {
      let r; try { r = _tele.apply(this, arguments); } catch (e) { throw e; }
      try {
        if (type === 'death') deaths.push({ day: dayOf(Game), kind: data && data.kind, who: data && data.who, cause: data && data.cause, player: !!(data && data.player) });
      } catch (e) {}
      return r;
    };
    // --- tablegate arrival-path capture (read-only) ---
    const tg = attachTablegateCapture(Game);
    const baseDaily = policy.daily;
    const wrapped = Object.assign({}, policy, {
      daily(G, ctx) {
        let r;
        try { r = baseDaily ? baseDaily(G, ctx) : undefined; } catch (e) { r = undefined; }
        try { tg.sample(); } catch (e) {}
        return r;
      },
    });
    let result = null;
    await quietLog(async () => { result = await runDays(Game, wrapped, { days: EFF_DAYS, sampleEvery: 30 }); });
    const cap = tg.finish();
    try { tg.restore(); } catch (e) {}
    const s = Game.state.scholar || {};
    const pg = (() => { try { return Game.progState() || {}; } catch (e) { return {}; } })();
    const scholarDeaths = deaths.filter(d => d.player);
    const scholarCombatDeaths = scholarDeaths.filter(d => /combat|monster|fight/i.test(String(d.cause || '') + ' ' + String(d.kind || ''))).length;
    const out = {
      seed, road, arm, days: EFF_DAYS,
      survived: !Game.over, endDay: dayOf(Game),
      foodDeeds: { sentimentTaught: !!pg.sentimentTaught, feastSurgeUsed: !!((s.prog || {}).feastSurgeUsed) },
      marks: m.marks, draws: m.draws, faced: m.faced, faceOk: m.faceOk,
      feasts: m.feasts, armedFeasts: m.armedFeasts,
      fbFacedCtx: (result && result.ctx && result.ctx.fbFaced) || 0,
      fbSkippedLowHp: (result && result.ctx && result.ctx.fbSkippedLowHp) || 0,
      seatEver: cap.seatEver, seatEverDay: cap.seatEverDay,
      waitingDay: cap.waitingDay, announcedDay: cap.announcedDay, arc4Day: cap.arc4Day,
      seated: cap.seated, seatDay: cap.seatDay,
      nationalDay: cap.nationalDay, nationalRank: cap.nationalRank,
      tableWaiting: !!pg.tableWaiting, tableDone: !!pg.tableDone,
      won: !!Game.won,
      scholarDeaths: scholarDeaths.length, scholarCombatDeaths,
      deathCauses: deaths.reduce((a, d) => { const k = String(d.cause || d.kind || 'unknown'); a[k] = (a[k] || 0) + 1; return a; }, {}),
      instrumentErrors: m.errors + (cap.errors | 0),
      endDetail: cap.endDetail,
      ms: result ? result.ms : 0,
    };
    out.foodDeeds.holds = out.foodDeeds.sentimentTaught && out.foodDeeds.feastSurgeUsed;
    if (!SMOKE) fs.writeFileSync(path.join(EVID, `feastblow-${road}-${arm}-s${seed}.json`), JSON.stringify(out, null, 1));
    return out;
  } finally {
    if (prevBlow == null) delete process.env.FEASTBLOW; else process.env.FEASTBLOW = prevBlow;
  }
}

(async () => {
  assertSubstrate();
  const rows = [];
  for (const road of ROADS) for (const seed of SEEDS) for (const arm of ARMS) {
    const r = await runOne(seed, road, arm);
    rows.push(r);
    console.log(`done ${r.road}/${r.arm}/s${r.seed}: foodDeeds=${r.foodDeeds.holds} seat=${r.seatEver} waiting=${r.waitingDay != null ? 'd' + r.waitingDay : 'no'} national=${r.nationalDay != null ? 'd' + r.nationalDay : 'no'} won=${r.won} marks=${r.marks} faced=${r.faceOk}/${r.draws} surv=${r.survived ? "Y" : "N"}:d${r.endDay}`);
  }
  const sum = (f) => rows.filter(f).length;
  for (const arm of ARMS) {
    const rs = rows.filter(r => r.arm === arm);
    console.log(`--- ${arm}: foodDeeds ${sum(r => r.arm === arm && r.foodDeeds.holds)}/${rs.length} ` +
      `seat ${sum(r => r.arm === arm && r.seatEver !== 'none')}/${rs.length} ` +
      `waiting ${sum(r => r.arm === arm && r.waitingDay != null)}/${rs.length} ` +
      `national ${sum(r => r.arm === arm && r.nationalDay != null)}/${rs.length} ` +
      `won ${sum(r => r.arm === arm && r.won)}/${rs.length}`);
  }
})().catch(e => { console.error('SWEEP FATAL', e); process.exit(1); });
