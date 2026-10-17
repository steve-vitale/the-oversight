#!/usr/bin/env node
// scripts/sweep-modalplay-20261017.js — MODALPLAY pilot sweep (flesh-out loop,
// axis scale-onramp, 2026-10-17; finding #480's named next gate).
//
// 8 FRESH seeds [9901-9908] x {leadfeast, belongfeast} x {armed, control}
// = 32 runs, 180d death-aware, identical-seed armed/control pairs.
// SUBSTRATE: FEASTSCALE_R13=1, SEATDRIVE=0 EXPLICIT, TAKESEAT=1 (both arms
// sit via the takeseat driver). ARMED adds MODALPLAY=1 (the modal driver);
// CONTROL = the bare takeseat policy (MODALPLAY unset — the modal opens and
// nobody answers, the sim-takeseat baseline).
// SWEEP STOP on substrate mismatch: FEASTSCALE_R13!=1, SEATDRIVE not '0',
// TAKESEAT!=1.
//
// PRE-REGISTERED (evidence/2026-10-17/sim-modalplay.md header — binding):
//   PRIMARY = wins(armed) - wins(control); GO iff >= +3/16 (takeseat's bar).
//   Guardrails: national >= control-2; median survival >= control-10d; no new
//   death mode; det-gate byte-identical with layer off; SMOKE green.
//
// Per run: won (PRIMARY), tableDone, doors played (door/strength/tie/offered
// strengths from ctx._modalplay.doors), modal answers, witness offered/taken
// (honest tripwires), trial skipped, conscript refused, national ever,
// survival days, death causes, instrument errors, modal beats (say-lines on
// drain days, for the sense-read).
//
// Usage:
//   FEASTSCALE_R13=1 SEATDRIVE=0 TAKESEAT=1 node scripts/sweep-modalplay-20261017.js
// Targeted: SEEDS="9901,9902" ONLY="leadfeast" ARM="armed" DAYS=180
// Smoke: SMOKE=1 FEASTSCALE_R13=1 SEATDRIVE=0 TAKESEAT=1 node scripts/sweep-modalplay-20261017.js
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { leadtakeseat, belongtakeseat } = require('./policies/takeseat');
const { leadmodalplay, belongmodalplay } = require('./policies/modalplay');

const DATE = '2026-10-17';
function assertSubstrate() {
  const fails = [];
  if (process.env.FEASTSCALE_R13 !== '1') fails.push('FEASTSCALE_R13=1 required');
  if (process.env.SEATDRIVE !== '0') fails.push('SEATDRIVE=0 required EXPLICIT');
  if (process.env.TAKESEAT !== '1') fails.push('TAKESEAT=1 required (both arms sit)');
  if (fails.length) { console.error('SWEEP STOP: ' + fails.join('; ')); process.exit(2); }
}

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [9901, 9902, 9903, 9904, 9905, 9906, 9907, 9908]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10);
const SMOKE = process.env.SMOKE === '1';
const EFF_DAYS = SMOKE ? 12 : DAYS;
const BASES = { leadfeast: leadtakeseat, belongfeast: belongtakeseat };
const ARMED = { leadfeast: leadmodalplay, belongfeast: belongmodalplay };
const ROADS = process.env.ONLY ? String(process.env.ONLY).split(',').map(s => s.trim()).filter(s => BASES[s]) : ['leadfeast', 'belongfeast'];
const ARMS = process.env.ARM ? String(process.env.ARM).split(',').map(s => s.trim()).filter(s => s === 'armed' || s === 'control') : ['armed', 'control'];
const EVID = path.join(__dirname, '..', 'evidence', DATE, 'perseed-modalplay');
if (!SMOKE) fs.mkdirSync(EVID, { recursive: true });

function dayOf(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }

async function runOne(seed, road, arm) {
  const useLayer = arm === 'armed';
  const policy = useLayer ? ARMED[road] : BASES[road];
  const prevMod = process.env.MODALPLAY;
  if (useLayer) process.env.MODALPLAY = '1'; else delete process.env.MODALPLAY;
  try {
    const { Game } = await loadGame({ seed, mode: `modalplay-${road}-${arm}` });
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
    // --- modal beat capture: rolling say-line buffer; on drain days keep
    // that day's lines (the drain answers the whole modal synchronously in
    // one daily, the same game-day the seat was taken in upkeep) ---
    const sayLines = [];
    const SAY_CAP = 5000;
    const pushSay = (msg) => {
      try {
        const s = String(msg || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').slice(0, 400);
        if (!s) return;
        sayLines.push({ day: dayOf(Game), text: s });
        if (sayLines.length > SAY_CAP) sayLines.splice(0, sayLines.length - SAY_CAP);
      } catch (e) {}
    };
    const _say = Game.say ? Game.say.bind(Game) : null;
    const _sys = Game.sysSay ? Game.sysSay.bind(Game) : null;
    try {
      Game.say = function (msg) { pushSay(msg); return _say ? _say(msg) : msg; };
      if (_sys) Game.sysSay = function (msg) { pushSay(msg); return _sys(msg); };
    } catch (e) {}
    const modalBeats = [];
    const baseDaily = policy.daily;
    let seenCtx = null; // runDays does not return ctx — keep the live ref
    const wrapped = Object.assign({}, policy, {
      daily(G, ctx) {
        seenCtx = ctx;
        const before = ctx.mpAnswers | 0;
        const day = dayOf(G);
        let r;
        try { r = baseDaily ? baseDaily(G, ctx) : undefined; } catch (e) { r = undefined; }
        try {
          if ((ctx.mpAnswers | 0) > before) {
            const lines = sayLines.filter(x => x.day === day).map(x => x.text).slice(0, 120);
            modalBeats.push({ day, answers: (ctx.mpAnswers | 0) - before, lines });
          }
        } catch (e) {}
        return r;
      },
    });
    let result = null;
    await quietLog(async () => { result = await runDays(Game, wrapped, { days: EFF_DAYS, sampleEvery: 30 }); });
    try { Game.say = _say ? function (m) { return _say(m); } : Game.say; } catch (e) {}
    const s = Game.state.scholar || {};
    const pg = (() => { try { return Game.progState() || {}; } catch (e) { return {}; } })();
    const scholarDeaths = deaths.filter(d => d.player);
    const scholarCombatDeaths = scholarDeaths.filter(d => /combat|monster|fight/i.test(String(d.cause || '') + ' ' + String(d.kind || ''))).length;
    const c = seenCtx || {};
    const mp = c._modalplay || { doors: [], beats: [] };
    let nationalDay = null;
    try {
      const rk = (typeof Game.scaleRank === 'function') ? Game.scaleRank() : null;
      nationalDay = (rk === 'national' || rk === 'global') ? dayOf(Game) : null;
    } catch (e) {}
    const out = {
      seed, road, arm, days: EFF_DAYS,
      survived: !Game.over, endDay: dayOf(Game),
      won: !!Game.won,
      tableDone: !!pg.tableDone,
      nationalDay,
      doors: mp.doors || [],
      beats: (mp.beats || []).map(b => b.id),
      modal: {
        answers: c.mpAnswers | 0, doorsPlayed: c.mpDoorsPlayed | 0,
        doorNoHonest: c.mpDoorNoHonest | 0, trialSkipped: c.mpTrialSkipped | 0,
        conscriptRefused: c.mpConscriptRefused | 0, driveError: c.mpDriveError | 0,
        drained: !!c.mpDrained,
      },
      witnessTaken: c.mpWitnessTaken | 0,
      scholarDeaths: scholarDeaths.length, scholarCombatDeaths,
      deathCauses: deaths.reduce((a, d) => { const k = String(d.cause || d.kind || 'unknown'); a[k] = (a[k] || 0) + 1; return a; }, {}),
      modalBeats: modalBeats.slice(0, 8),
      ms: result ? result.ms : 0,
    };
    if (!SMOKE) fs.writeFileSync(path.join(EVID, `modalplay-${road}-${arm}-s${seed}.json`), JSON.stringify(out, null, 1));
    return out;
  } finally {
    if (prevMod == null) delete process.env.MODALPLAY; else process.env.MODALPLAY = prevMod;
  }
}

function median(xs) {
  if (!xs.length) return null;
  const a = xs.slice().sort((x, y) => x - y);
  const m = a.length >> 1;
  return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
}

(async () => {
  assertSubstrate();
  const rows = [];
  for (const road of ROADS) for (const seed of SEEDS) for (const arm of ARMS) {
    const r = await runOne(seed, road, arm);
    rows.push(r);
    const doors = (r.doors || []).map(d => `${d.door}@${d.strength}`).join(',');
    console.log(`done ${r.road}/${r.arm}/s${r.seed}: won=${r.won} tableDone=${r.tableDone} doors=[${doors}] answers=${r.modal.answers} national=${r.nationalDay != null ? 'd' + r.nationalDay : 'no'} surv=${r.survived ? 'Y' : 'N'}:d${r.endDay}`);
  }
  const sum = (f) => rows.filter(f).length;
  for (const arm of ARMS) {
    const rs = rows.filter(r => r.arm === arm);
    console.log(`--- ${arm}: won ${sum(r => r.arm === arm && r.won)}/${rs.length} ` +
      `tableDone ${sum(r => r.arm === arm && r.tableDone)}/${rs.length} ` +
      `national ${sum(r => r.arm === arm && r.nationalDay != null)}/${rs.length} ` +
      `medianSurv ${median(rs.map(r => r.endDay))}`);
  }
  // PRIMARY (pre-registered, binding): wins(armed) - wins(control) >= +3/16.
  const wA = sum(r => r.arm === 'armed' && r.won);
  const wC = sum(r => r.arm === 'control' && r.won);
  console.log(`PRIMARY: armed ${wA} - control ${wC} = ${wA - wC} (GO iff >= +3)`);
  // Guardrails (pre-registered): national >= control-2; median survival >= control-10d.
  for (const arm of ARMS) {
    const rs = rows.filter(r => r.arm === arm);
    console.log(`guardrail ${arm}: national ${sum(r => r.arm === arm && r.nationalDay != null)}, medianSurv ${median(rs.map(r => r.endDay))}`);
  }
  const witTaken = sum(r => r.witnessTaken > 0);
  const trialSk = rows.reduce((a, r) => a + (r.modal.trialSkipped | 0), 0);
  console.log(`tripwires: witnessTaken runs=${witTaken} (expect 0), trialSkipped total=${trialSk}`);
})().catch(e => { console.error('SWEEP FATAL', e); process.exit(1); });
