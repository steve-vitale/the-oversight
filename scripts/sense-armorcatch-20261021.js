#!/usr/bin/env node
// sense-armorcatch-20261021.js — sense-test for sim-armorcatch.
// Runs armed seeds that fired vetos (belongfeast-armorcatch-s65423:
// 1 triage + 1 chaff; leadfeast-armorcatch-s65427: 9 chaff) with narration
// live, captures say-beats, and dumps the beats surrounding each veto so a
// human can judge whether the disengages read as sensible decisions or
// robotic aborts. SENSE-TESTING LAW: transcripts over counts.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 VGEAR=1 KILLDISC=1 \
//   ARMORCATCH=1 node scripts/sense-armorcatch-20261021.js
'use strict';
const path = require('path');
const REPO = path.join(__dirname, '..');

// KILL-PROTOCOL INFO-SKIP: if the composition is deleted (ARMORCATCH_KILLED=1
// set by the coordinator after a killed arm), this sense-test exits green
// with an INFO-SKIP instead of FATAL-ing.
let AC = null;
try {
  AC = require(path.join(REPO, 'scripts', 'policies', 'armorcatch'));
} catch (e) {
  if (process.env.ARMORCATCH_KILLED === '1') {
    console.log('INFO-SKIP: scripts/policies/armorcatch.js deleted per kill protocol (sim-armorcatch NO-GO) — sense-test not applicable.');
    process.exit(0);
  }
  throw e;
}
for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'WINPURSUIT', 'WINDEFER', 'SEATDRIVE', 'VGEAR', 'KILLDISC', 'ARMORCATCH']) {
  if (process.env[k] !== '1') { console.error(`SENSE STOP: ${k}=1 required.`); process.exit(2); }
}
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));

const SEEDS = [
  { seed: 65423, base: 'belong' },  // 1 chaff + 1 triage veto
  { seed: 65427, base: 'lead' },    // 9 chaff vetos
];

function beatCtx(Game) {
  const d = ((Game.state || {}).scholar || {}).day || 0;
  const f = Game.tbfight;
  const round = (f && f.round) || 0;
  const mons = (f && f.fighters || []).filter(x => x && x.kind === 'monster' && x.alive && !x.fled)
    .map(x => `${x.name || x.mid || '?'}(${Math.round(x.hp || 0)}/${Math.round(x.maxHp || x.hp || 1)})`);
  return { d, round, mons };
}

async function oneRun({ seed, base }) {
  const { Game } = await loadGame({ seed, mode: 'armorcatch-sense', fullTelemetry: false, narration: true });
  const policy = AC.armedFor(base + 'feast');
  const beats = [];
  const oSay = Game.say.bind(Game);
  const oSysSay = (Game.sysSay || function () {}).bind(Game);
  Game.say = function (...a) { beats.push({ kind: 'say', ctx: beatCtx(Game), text: String(a[0] || '').slice(0, 400) }); return oSay(...a); };
  Game.sysSay = function (...a) { beats.push({ kind: 'sys', ctx: beatCtx(Game), text: String(a[0] || '').slice(0, 400) }); return oSysSay(...a); };

  let lastCtx = null;
  const oFight = policy.fight;
  const vetoBeats = [];
  const wrapped = Object.assign({}, policy, {
    daily(G, ctx) { lastCtx = ctx; return policy.daily(G, ctx); },
    fight(G, ctx) {
      lastCtx = ctx;
      const before = ((ctx.acChaffVetos | 0) + (ctx.acTriageVetos | 0));
      const r = oFight(G, ctx);
      const after = ((ctx.acChaffVetos | 0) + (ctx.acTriageVetos | 0));
      if (after > before) {
        const kind = (ctx.acChaffVetos | 0) > ((ctx._acSB || 0)) ? 'chaff' : 'triage';
        ctx._acSB = (ctx.acChaffVetos | 0);
        vetoBeats.push({ kind, day: ((G.state || {}).scholar || {}).day || 0,
          round: ((G.tbfight || {}).round) || 0,
          tail: beats.slice(-18) });
      }
      return r;
    },
  });

  await setupGame(Game);
  await quietLog(async () => { await runDays(Game, wrapped, { days: 180, manifest: undefined, sampleEvery: 30 }); });

  console.log(`\n===== ${base}feast-armorcatch s${seed}: ${vetoBeats.length} vetoes captured =====`);
  for (const v of vetoBeats) {
    console.log(`\n--- ${v.kind.toUpperCase()} VETO, day ${v.day}, round ${v.round} ---`);
    for (const b of v.tail) {
      const monstr = b.ctx.mons.length ? ` [${b.ctx.mons.join(', ')}]` : '';
      console.log(`d${b.ctx.d} r${b.ctx.round}${monstr} | ${b.text}`);
    }
  }
  return vetoBeats.length;
}

(async () => {
  let total = 0;
  for (const s of SEEDS) total += await oneRun(s);
  console.log(`\nTOTAL veto beats captured: ${total}`);
})().catch(e => { console.error('FATAL', e && e.stack ? e.stack : e); process.exit(1); });
