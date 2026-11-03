#!/usr/bin/env node
// guardcasc-b-trace-driver.js — identity-tracing driver for the
// 69604 guard->succession cascade (sim-guardcasc-b, 2026-11-03).
// Prereg: evidence/2026-11-03/sim-guardcasc-b-prereg.md
// (question (b): death timing + attribution).
//
// Same seed, same policy, same substrate as the judged
// 69604 pair — the ONLY addition is logging: scholar
// identity (bearer id + person name) at daily entry/exit
// and at Game.sleep entry/exit, plus death/mantle say
// lines tagged with the current loopDay. The wrappers are
// pure logging: they call the original functions, change
// no state, consume no RNG, and make no policy decisions.
// This driver decides nothing; it only timestamps WHO the
// player is at each day boundary, so the diagnostic can
// settle whether the armed scholar died during the night
// of day 5->6 (harness sleep) or during day 6 (fight).
//
// Env (FATAL if violated):
//   COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=0
//   POLICY=construct-shadow|construct-armed, SEEDS=69604,
//   TRACE_DAYS=7..30, CONSTRUCT_SHAPE=C (defaults as the
//   homeconstruct driver), packcomp *=1 flags not 1.
// Prints one JSON object per line to stdout:
//   {type:'daily-entry'|'daily-exit'|'sleep-entry'|'sleep-exit'|'say',
//    loopDay, bearer, name, pos, kcal, day, ...}
// plus a final {type:'summary', ...} line.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { construct, constructShadow } = require('./policies/competent-homewardconstruct-b');

function checkEnv() {
  if (process.env.POLICY !== 'construct-shadow' && process.env.POLICY !== 'construct-armed') { console.error('FATAL: POLICY must be construct-shadow or construct-armed'); process.exit(2); }
  for (const k of ['COMPETENT_FEAST', 'SEATDRIVE', 'PLENTYDEPRI', 'DEPOSITGATE']) {
    if (process.env[k] !== '0') { console.error('FATAL: ' + k + '=0 must be set explicitly'); process.exit(2); }
  }
  for (const k of ['COMPETENT_STANDING_HOME', 'COMPETENT_ROUTE_AROUND', 'COMPETENT_TRIPHOME_ROUTE_AROUND',
    'WOODCARRY', 'WOODWARM', 'MORNINGCARRY', 'WINDOWCARRY', 'STRANDFIX', 'PRESSB', 'FEDEVENING']) {
    if (process.env[k] === '1') { console.error('FATAL: ' + k + ' must NOT be 1'); process.exit(2); }
  }
  const d = parseInt(process.env.TRACE_DAYS || '7', 10);
  if (!(d >= 7 && d <= 30)) { console.error('FATAL: TRACE_DAYS must be 7..30'); process.exit(2); }
  if ((process.env.CONSTRUCT_SHAPE || 'C') !== 'C') { console.error('FATAL: CONSTRUCT_SHAPE must be C'); process.exit(2); }
}
function ident(Game) {
  try {
    const s = (Game.state || {}).scholar || {};
    let name = null;
    try {
      const p = Game.getPerson ? Game.getPerson(Game.villagerId) : null;
      name = (p && (p.name || (p.first && p.last ? p.first + ' ' + p.last : p.first) || p.id)) || null;
    } catch (e) {}
    return { bearer: Game.villagerId || null, name,
      pos: { x: (Game.map || {}).px ?? null, y: (Game.map || {}).py ?? null },
      kcal: s.kcal ?? null, day: s.day || 0 };
  } catch (e) { return { bearer: null, name: null, pos: { x: null, y: null }, kcal: null, day: 0 }; }
}
function emit(obj) {
  try { process.stdout.write(JSON.stringify(obj) + '\n'); } catch (e) { console.error('trace emit error', e && e.message); }
}
async function oneInstance(seed) {
  const { Game } = await loadGame({ seed, mode: 'homeconstruct-b', fullTelemetry: false });
  const st = { loopDay: 0 };
  const origSay = Game.say;
  if (typeof origSay === 'function') {
    Game.say = function (...args) {
      try {
        const line = String(args[0] || '');
        if (/is dead|MANTLE TRANSFER|wake up somebody else|goes into the ground/i.test(line)) {
          emit(Object.assign({ type: 'say', loopDay: st.loopDay, line: line.slice(0, 300) }, ident(Game)));
        }
      } catch (e) {}
      return origSay.apply(this, args);
    };
  }
  const origSleep = Game.sleep;
  if (typeof origSleep === 'function') {
    Game.sleep = function (...args) {
      emit(Object.assign({ type: 'sleep-entry', loopDay: st.loopDay }, ident(Game)));
      const r = origSleep.apply(this, args);
      emit(Object.assign({ type: 'sleep-exit', loopDay: st.loopDay }, ident(Game)));
      return r;
    };
  }
  await setupGame(Game);
  const POLICY_ID = process.env.POLICY;
  const baseDaily = (POLICY_ID === 'construct-armed' ? construct : constructShadow).daily.bind(
    POLICY_ID === 'construct-armed' ? construct : constructShadow);
  const policy = Object.assign({}, (POLICY_ID === 'construct-armed' ? construct : constructShadow), {
    daily(Game2, ctx) {
      st.loopDay++;
      emit(Object.assign({ type: 'daily-entry', loopDay: st.loopDay }, ident(Game2)));
      baseDaily(Game2, ctx);
      const rec = Object.assign({ type: 'daily-exit', loopDay: st.loopDay }, ident(Game2));
      rec.construct = ctx.constructReport ? { kind: ctx.constructReport.kind,
        startPos: ctx.constructReport.startPos || null,
        posAfterForced: ctx.constructReport.posAfterForced || null } : null;
      emit(rec);
    },
  });
  const result = await runDays(Game, policy, { days: parseInt(process.env.TRACE_DAYS || '7', 10), manifest: null });
  return { seed, policy: POLICY_ID, daysAlive: result.days, endReason: result.endReason,
    deaths: (result.samples && result.samples.deaths) || [] };
}
async function main() {
  checkEnv();
  const seeds = (process.env.SEEDS || '69604').split(',').map((s) => parseInt(s.trim(), 10)).filter(Boolean);
  for (const seed of seeds) {
    const res = await oneInstance(seed);
    emit({ type: 'summary', seed: res.seed, policy: res.policy,
      daysAlive: res.daysAlive, endReason: res.endReason,
      playerDeaths: res.deaths.filter((d) => d.player === true) });
    console.error('guardcasc trace policy=' + res.policy + ' seed=' + seed + ' end=' + res.endReason);
  }
}
if (require.main === module) {
  main().catch((e) => { console.error('GUARDCASC TRACE CRASH', e && (e.stack || e)); process.exit(2); });
}
module.exports = { ident };
