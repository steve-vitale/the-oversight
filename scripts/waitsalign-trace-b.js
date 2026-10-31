#!/usr/bin/env node
// waitsalign-trace-b.js — waits-alignment probe legs
// (sim-waitsalign-a; prereg: evidence/2026-10-31/
// sim-waitsalign-a-prereg.md, committed BEFORE any judged leg).
// Compact driver on the SAME substrate stack as the selecttrim
// driver (scripts/selecttrim-trace-b.js): pressb(woodwarm(
// woodcarry(modeLayer(nighttravel)))) with pure-read tick
// probes around each layer. It records ONLY what the clock
// question needs: morning/evening dayTicks, wake cells,
// woodcarry classification, press attempts, mode-layer
// firings, and the night's say lines (so the sleep-refusal
// line can be checked). No sweep analysis, no wood sources:
// the clock question does not need them, and a leaner driver
// cannot drift them.
// Modes (WAITSALIGN, asserted FATAL):
//   0 = control (mode layer delegates untouched)
//   1 = trim (selecttrim-diag, SELECTTRIM=1 semantics)
//   2 = askskip (waitsalign-diag: skips ONLY askAbout, save 2)
// Same substrate gates as selecttrim: COMPETENT_FEAST=0,
// SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1, WOODCARRY=1,
// WOODWARM 0|1, PRESSB 0|1, POLICY=nighttravel, DAYS.
// The recorder itself NEVER calls a state-editing verb; the
// only verbs in a variant leg are the variant policy's own.
// POLICY-SIDE ARM ONLY: zero src/js changes.
'use strict';
const fs = require('fs');
const path = require('path');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { nighttravel } = require('./policies/nighttravel');
const { withWoodcarry, newStore } = require('./policies/woodcarry');
const { withWoodwarm, newStore: newWwStore } = require('./policies/woodwarm');
const { withPressb, newStore: newPbStore } = require('./policies/pressb-diag');
const { withSelecttrim, newStore: newStStore } = require('./policies/selecttrim-diag');
const { withWaitsalign, newStore: newWaStore } = require('./policies/waitsalign-diag');

if (process.env.COMPETENT_FEAST !== '0') { console.error('FATAL: COMPETENT_FEAST=0 must be set explicitly'); process.exit(2); }
if (process.env.SEATDRIVE !== '0') { console.error('FATAL: SEATDRIVE=0 must be set explicitly'); process.exit(2); }
if (process.env.PLENTYDEPRI !== '0') { console.error('FATAL: PLENTYDEPRI=0 must be set explicitly'); process.exit(2); }
if (process.env.DEPOSITGATE !== '1') { console.error('FATAL: DEPOSITGATE=1 must be set explicitly'); process.exit(2); }
if (process.env.WOODCARRY !== '1') { console.error('FATAL: WOODCARRY must be 1'); process.exit(2); }
if (process.env.WOODWARM !== '0' && process.env.WOODWARM !== '1') { console.error('FATAL: WOODWARM must be 0 or 1'); process.exit(2); }
if (process.env.POLICY !== 'nighttravel') { console.error('FATAL: POLICY must be nighttravel'); process.exit(2); }
if (process.env.PRESSB !== '0' && process.env.PRESSB !== '1') { console.error('FATAL: PRESSB must be 0 or 1'); process.exit(2); }
if (process.env.WAITSALIGN !== '0' && process.env.WAITSALIGN !== '1' && process.env.WAITSALIGN !== '2') { console.error('FATAL: WAITSALIGN must be 0 (control), 1 (trim) or 2 (askskip)'); process.exit(2); }
const MODE = process.env.WAITSALIGN;
const MODE_NAME = MODE === '0' ? 'control' : MODE === '1' ? 'trim' : 'askskip';
if (MODE === '1') process.env.SELECTTRIM = '1';
if (MODE === '2') process.env.WAITSALIGN_ASKSKIP = '1';
const SEEDS = (process.env.SEEDS || '15215').split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
const DAYS = parseInt(process.env.DAYS || '15', 10);
const OUTDIR = process.env.OUTDIR || path.join(__dirname, '..', 'evidence', '2026-10-31', 'sim-waitsalign-a-corpus-' + (process.env.WOODWARM === '1' ? 'on' : 'guard') + '-' + MODE_NAME);
const STAGING_DIR = path.join(__dirname, '..', '.waitsalign-staging');

function dayTicksOf(Game) {
  try { return ((Game.state || {}).scholar || {}).dayTicks || 0; } catch (e) { return 0; }
}
function probeWrap(inner, name, sink) {
  return Object.assign({}, inner, {
    daily(Game2, ctx2) {
      const t0 = dayTicksOf(Game2);
      const r = inner.daily ? inner.daily(Game2, ctx2) : undefined;
      const t1 = dayTicksOf(Game2);
      try { sink.push({ layer: name, before: t0, after: t1, spent: t1 - t0 }); } catch (e) {}
      return r;
    },
  });
}
function realSleepMs(ms) {
  try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }
  catch (e) { try { require('child_process').execSync('sleep ' + (ms / 1000)); } catch (e2) {} }
}
function tryWrite(filePath, data, attempts) {
  for (let i = 0; i < attempts; i++) {
    try {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, data);
      const back = fs.readFileSync(filePath, 'utf8');
      if (back !== data) throw new Error('readback mismatch');
      JSON.parse(back);
      return true;
    } catch (e) {
      if (i === attempts - 1) return false;
      realSleepMs(2000);
    }
  }
  return false;
}
function snapPos(Game) {
  const sch = (Game.state || {}).scholar || {};
  let tile = null;
  try { const t = Game.playerTile(); tile = t ? (t.type || null) : null; } catch (e) {}
  return {
    inside: (sch.insideHaven === undefined ? null : !!sch.insideHaven),
    insideTent: (sch.insideTent === undefined ? null : !!sch.insideTent),
    mx: (sch.mx === undefined ? null : sch.mx), my: (sch.my === undefined ? null : sch.my),
    tile,
    mapPx: (Game.map ? Game.map.px : null), mapPy: (Game.map ? Game.map.py : null),
    kcal: Math.round(sch.kcal || 0), gameDay: sch.day || 0,
  };
}

async function oneInstance(seed) {
  const { Game } = await loadGame({ seed, mode: 'nighttravel-b', fullTelemetry: false });
  const sayLines = [];
  {
    const origSay = Game.say;
    if (typeof origSay === 'function') {
      Game.say = function (...args) {
        try { if (sayLines.length < 20000) sayLines.push({ day: (Game.state.scholar || {}).day || 0, line: String(args[0] || '').slice(0, 400) }); } catch (e) {}
        return origSay.apply(this, args);
      };
    }
  }
  await setupGame(Game);
  const evenings = [], mornings = [];
  let callIdx = 0;
  const wcStore = newStore();
  const probeAll = [];
  const probedN = probeWrap(nighttravel, 'nighttravel', probeAll);
  const stStore = newStStore();
  const waStore = newWaStore();
  let modeLayer = probedN, modeName = 'none';
  if (MODE === '1') { modeLayer = withSelecttrim(probedN, stStore); modeName = 'selecttrim'; }
  else if (MODE === '2') { modeLayer = withWaitsalign(probedN, waStore); modeName = 'waitsalign'; }
  const probedM = probeWrap(modeLayer, modeName, probeAll);
  const base = withWoodcarry(probedM, wcStore);
  const wwStore = newWwStore();
  const probedC = probeWrap(base, 'woodcarry', probeAll);
  const warmed = withWoodwarm(probedC, wwStore);
  const probedW = probeWrap(warmed, 'woodwarm', probeAll);
  const pbStore = newPbStore();
  const dayPolicy = withPressb(probedW, pbStore);
  const policy = Object.assign({}, base, {
    daily(Game2, ctx) {
      callIdx++;
      if (callIdx > 1) {
        const m = snapPos(Game2);
        mornings.push({ loopDay: callIdx, ...m, morningDayTicks: dayTicksOf(Game2) });
      }
      const probeBefore = probeAll.length;
      dayPolicy.daily(Game2, ctx);
      const tickProbe = probeAll.slice(probeBefore);
      const pos = snapPos(Game2);
      const row = { loopDay: callIdx, ...pos };
      row.woodcarry = ctx._wcLast || null;
      row.warmth = ctx._wwLast || null;
      row.eveningOutcome = (ctx._ntLast || {}).outcome || 'policy-no-record';
      row.pressbAttempt = (pbStore.attempts || []).find((a) => a.loopDay === callIdx) || null;
      row.selecttrimTrim = (stStore.trims || []).find((h) => h.loopDay === callIdx) || null;
      row.selecttrimSkip = (stStore.skips || []).find((s) => s.loopDay === callIdx) || null;
      row.waitsalignAsk = (waStore.asks || []).find((h) => h.loopDay === callIdx) || null;
      row.waitsalignSkip = (waStore.skips || []).find((s) => s.loopDay === callIdx) || null;
      const mRow = mornings.find((m) => m.loopDay === callIdx);
      row.morningDayTicks = mRow ? mRow.morningDayTicks : null;
      row.morningCell = mRow ? (mRow.mx + ',' + mRow.my) : null;
      row.eveningDayTicks = dayTicksOf(Game2);
      row.tickProbe = tickProbe;
      row.gameOver = !!Game2.over;
      evenings.push(row);
    },
  });
  const result = await runDays(Game, policy, { days: DAYS, manifest: null });
  return {
    seed, policy: 'nighttravel', mode: MODE_NAME,
    woodcarryStore: { records: wcStore.records, errs: wcStore.errs, errors: wcStore.errors },
    warmthStore: { records: wwStore.records, errs: wwStore.errs, errors: wwStore.errors },
    pressbStore: { attempts: pbStore.attempts, skips: pbStore.skips, errs: pbStore.errs, errors: pbStore.errors },
    selecttrimStore: { trims: stStore.trims, skips: stStore.skips, errs: stStore.errs, errors: stStore.errors },
    waitsalignStore: { asks: waStore.asks, skips: waStore.skips, errs: waStore.errs, errors: waStore.errors },
    daysAlive: result.days, endReason: result.endReason, gameDays: result.gameDays,
    maxWaveUnlocked: result.maxWaveUnlocked, waveKills: result.waveKills,
    deaths: (result.samples && result.samples.deaths) || [],
    evenings, mornings, sayLines,
  };
}

(async () => {
  const pending = [];
  let done = 0;
  for (const seed of SEEDS) {
    const inst = await oneInstance(seed);
    done++;
    const name = `waitsalign-a-nighttravel-s${seed}.json`;
    const summary = `waitsalign mode=${MODE_NAME} woodwarm=${process.env.WOODWARM} pressb=${process.env.PRESSB} seed=${seed} end=${inst.endReason} days=${inst.daysAlive} evenings=${inst.evenings.length} wcErrs=${inst.woodcarryStore.errs} wwErrs=${inst.warmthStore.errs} pbAttempts=${inst.pressbStore.attempts.length} stTrims=${inst.selecttrimStore.trims.length} waAsks=${inst.waitsalignStore.asks.length}`;
    const data = JSON.stringify(inst);
    if (tryWrite(path.join(OUTDIR, name), data, 6)) console.log(summary + ' written');
    else { pending.push({ name, data }); console.error(summary + ' WRITE PENDING (EPERM flap) — kept in memory'); }
  }
  if (pending.length) {
    const deadline = Date.now() + 45 * 60 * 1000;
    while (pending.length && Date.now() < deadline) {
      for (let i = pending.length - 1; i >= 0; i--) {
        if (tryWrite(path.join(OUTDIR, pending[i].name), pending[i].data, 5)) {
          console.log('flushed pending ' + pending[i].name);
          pending.splice(i, 1);
        }
      }
      if (pending.length && Date.now() < deadline) realSleepMs(30000);
    }
  }
  if (pending.length) {
    for (const p of pending) {
      if (tryWrite(path.join(STAGING_DIR, p.name), p.data, 30)) console.error('STAGED (not evidence) ' + p.name);
      else console.error('STAGE FAIL LOUDLY ' + p.name);
    }
    console.error('PENDING STAGED: ' + pending.length + ' files in ' + STAGING_DIR + ' — copy to ' + OUTDIR + ' before judging');
    process.exit(3);
  }
  console.log('wrote ' + done + ' waitsalign files to ' + OUTDIR);
})().catch((e) => { console.error('WAITSALIGN CRASH', e && (e.stack || e)); process.exit(2); });
