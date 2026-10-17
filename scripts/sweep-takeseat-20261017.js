#!/usr/bin/env node
// scripts/sweep-takeseat-20261017.js — TAKESEAT pilot sweep (flesh-out loop,
// axis scale-onramp, 2026-10-17).
//
// 8 FRESH seeds [9701-9708] x {leadfeast, belongfeast} x {armed, control}
// = 32 runs, 180d death-aware, identical-seed armed/control pairs.
// ARMED = takeseat layer on (TAKESEAT=1); CONTROL = bare feastscale policy.
// Substrate asserted up front (SWEEP STOP on mismatch): FEASTSCALE_R13=1,
// SEATDRIVE=0 EXPLICIT (unset now means driver ON after c004b9dd — pinned
// OFF, same as the feastblow census). CONTROL must replicate the feastblow
// substrate: invitations staged ~15/16, tableDone 0/16 — otherwise STOP and
// report the substrate mismatch loudly before any verdict.
//
// Per run: tableDone (PRIMARY), seat-earned (tableSeat 'lesser' ever +
// first day), invitation staged (tableWaiting ever), announced ever,
// arcIV, national ever, wins, survival days, scholar combat deaths, the
// announced→table conversion, seat-earned day, ctx driver counters,
// instrument errors. Beats captured for the sense-read.
//
// Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/sweep-takeseat-20261017.js
// Targeted: SEEDS="9701,9702" ONLY="leadfeast" ARM="armed" DAYS=180
// Smoke: SMOKE=1 FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/sweep-takeseat-20261017.js
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { leadfeast, belongfeast } = require('./policies/feastscale');
const { leadtakeseat, belongtakeseat } = require('./policies/takeseat');
const { attachTablegateCapture } = require('./tablegate-instrument-20261017');

const DATE = '2026-10-17';
function assertSubstrate() {
  const fails = [];
  if (process.env.FEASTSCALE_R13 !== '1') fails.push('FEASTSCALE_R13=1 required');
  if (process.env.SEATDRIVE !== '0') fails.push('SEATDRIVE=0 required EXPLICIT');
  if (fails.length) { console.error('SWEEP STOP: ' + fails.join('; ')); process.exit(2); }
}

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [9701, 9702, 9703, 9704, 9705, 9706, 9707, 9708]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10);
const SMOKE = process.env.SMOKE === '1';
const EFF_DAYS = SMOKE ? 12 : DAYS;
const BASES = { leadfeast, belongfeast };
const ARMED = { leadfeast: leadtakeseat, belongfeast: belongtakeseat };
const ROADS = process.env.ONLY ? String(process.env.ONLY).split(',').map(s => s.trim()).filter(s => BASES[s]) : ['leadfeast', 'belongfeast'];
const ARMS = process.env.ARM ? String(process.env.ARM).split(',').map(s => s.trim()).filter(s => s === 'armed' || s === 'control') : ['armed', 'control'];
const EVID = path.join(__dirname, '..', 'evidence', DATE, 'perseed-takeseat');
if (!SMOKE) fs.mkdirSync(EVID, { recursive: true });

function dayOf(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }

async function runOne(seed, road, arm) {
  const useLayer = arm === 'armed';
  const policy = useLayer ? ARMED[road] : BASES[road];
  const prevTake = process.env.TAKESEAT;
  if (useLayer) process.env.TAKESEAT = '1'; else delete process.env.TAKESEAT;
  try {
    const { Game } = await loadGame({ seed, mode: `takeseat-${road}-${arm}` });
    await setupGame(Game);
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
    const c = (result && result.ctx) || {};
    const out = {
      seed, road, arm, days: EFF_DAYS,
      survived: !Game.over, endDay: dayOf(Game),
      foodDeeds: { sentimentTaught: !!pg.sentimentTaught, feastSurgeUsed: !!((s.prog || {}).feastSurgeUsed) },
      seatEver: cap.seatEver, seatEverDay: cap.seatEverDay,
      waitingDay: cap.waitingDay, announcedDay: cap.announcedDay, arc4Day: cap.arc4Day,
      takeSeatCalls: (cap.takeSeatCalls || []).map(x => ({ day: x.day, ok: x.ok })),
      seated: cap.seated, seatDay: cap.seatDay,
      nationalDay: cap.nationalDay, nationalRank: cap.nationalRank,
      tableWaiting: !!pg.tableWaiting, tableDone: !!pg.tableDone,
      won: !!Game.won,
      driver: {
        attempts: c.tsSeatAttempts | 0, taken: c.tsSeatTaken | 0, failed: c.tsSeatFailed | 0,
        skippedFight: c.tsSkippedFight | 0, previewNull: c.tsPreviewNull | 0,
        driveError: c.tsDriveError | 0, seatDay: c.tsSeatDay == null ? null : c.tsSeatDay,
        seatKind: c.tsSeatKind || null,
      },
      scholarDeaths: scholarDeaths.length, scholarCombatDeaths,
      deathCauses: deaths.reduce((a, d) => { const k = String(d.cause || d.kind || 'unknown'); a[k] = (a[k] || 0) || 0; a[k]++; return a; }, {}),
      instrumentErrors: (cap.errors | 0),
      beats: (cap.beats || []).slice(0, 120),
      endDetail: cap.endDetail,
      ms: result ? result.ms : 0,
    };
    out.foodDeeds.holds = out.foodDeeds.sentimentTaught && out.foodDeeds.feastSurgeUsed;
    if (!SMOKE) fs.writeFileSync(path.join(EVID, `takeseat-${road}-${arm}-s${seed}.json`), JSON.stringify(out, null, 1));
    return out;
  } finally {
    if (prevTake == null) delete process.env.TAKESEAT; else process.env.TAKESEAT = prevTake;
  }
}

(async () => {
  assertSubstrate();
  const rows = [];
  for (const road of ROADS) for (const seed of SEEDS) for (const arm of ARMS) {
    const r = await runOne(seed, road, arm);
    rows.push(r);
    console.log(`done ${r.road}/${r.arm}/s${r.seed}: tableDone=${r.tableDone} seat=${r.seatEver} waiting=${r.waitingDay != null ? 'd' + r.waitingDay : 'no'} announced=${r.announcedDay != null ? 'd' + r.announcedDay : 'no'} national=${r.nationalDay != null ? 'd' + r.nationalDay : 'no'} won=${r.won} surv=${r.survived ? 'Y' : 'N'}:d${r.endDay}`);
  }
  const sum = (f) => rows.filter(f).length;
  for (const arm of ARMS) {
    const rs = rows.filter(r => r.arm === arm);
    console.log(`--- ${arm}: tableDone ${sum(r => r.arm === arm && r.tableDone)}/${rs.length} ` +
      `seat ${sum(r => r.arm === arm && r.seatEver !== 'none')}/${rs.length} ` +
      `waiting ${sum(r => r.arm === arm && r.waitingDay != null)}/${rs.length} ` +
      `announced ${sum(r => r.arm === arm && r.announcedDay != null)}/${rs.length} ` +
      `national ${sum(r => r.arm === arm && r.nationalDay != null)}/${rs.length} ` +
      `won ${sum(r => r.arm === arm && r.won)}/${rs.length}`);
  }
  // SUBSTRATE REPLICATION CHECK (pre-registered): control must replicate the
  // feastblow census substrate (invitations staged ~15/16, tableDone 0/16).
  // A mismatch = stop before any verdict.
  const ctl = rows.filter(r => r.arm === 'control');
  const ctlWaiting = ctl.filter(r => r.waitingDay != null).length;
  const ctlDone = ctl.filter(r => r.tableDone).length;
  console.log(`SUBSTRATE-CHECK control: staged ${ctlWaiting}/${ctl.length}, tableDone ${ctlDone}/${ctl.length}`);
  if (ctlDone !== 0) console.error('SUBSTRATE MISMATCH: control has tableDone>0 — STOP before verdict.');
  else console.log('SUBSTRATE OK: control replicates feastblow (staged invitations, zero sittings)');
})().catch(e => { console.error('SWEEP FATAL', e); process.exit(1); });
