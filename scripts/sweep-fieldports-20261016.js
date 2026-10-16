#!/usr/bin/env node
// sweep-fieldports-20261016.js — the sim-fieldports measurement sweep.
// GAME-CODE ARM (treatment) vs base-commit (control) on IDENTICAL seeds,
// policies, env. Read-only attach to the engine (port-call wrap + say-beat
// capture + end-of-run state reads).
//
// Substrate: PRE-SEAT (SEATDRIVE=0 explicit — unset means driver ON, steve-call #411).
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0
//   SEEDS=... POLICIES=leadfeast,belongfeast DAYS=180 ARM=treatment REPO=/path/to/repo
// REPO defaults to this script's own tree (the treatment worktree).
// Control: REPO=/home/hatch/workspace/the-scattering (clean main tree at the
// same base commit — read-only load, never modified).
//
// Per-seed JSONs: evidence/2026-10-16/perseed-fieldports/<policy>-s<seed>-<arm>.json
// Schema: exact numeric keys national/table/won/wins/exiled (+ wins alias for telemetry-check).
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
// PRE-SEAT: SEATDRIVE=0 explicit (unset = driver ON — the method note).
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (pre-seat).'); process.exit(2); }
if (!TF.layerOn()) { console.error('SWEEP STOP: tribfloor layerOn() false despite TRIBFLOOR=1.'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [911]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const POLICIES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['leadfeast']);
const ARM = process.env.ARM || 'treatment';
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-16', 'perseed-fieldports');
const BEATS = path.join(__dirname, '..', 'evidence', '2026-10-16', 'fieldports-beats');
const BEAT_CAP = 3000;
const BEAT_LEN = 300;
// Beats for the newly-ported species (sense-testing material).
const PORT_BEAT = /raises its trumpet|WHITENS|THE OMEN LANDS|read the omen|ratings STALL|ratings climb|SWEEPS WEEK|reads the room|credits are still ROLLING|THE CREDITS FINISH ROLLING|TITLE CARD FALLS|PREVIOUSLY ON/i;

// The newly-ported set (this arm's ports).
const FP_IDS = ['herald', 'finale_crew', 'finale_opening'];

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
const scholarVid = (Game) => { try { return (Game.state.scholar || {}).villagerId || 'player'; } catch (e) { return 'player'; } };

function policyFor(policyId) {
  return policyId === 'leadfeast' ? TF.leadfeast : TF.belongfeast;
}

async function oneRun(seed, policyId) {
  const policy = policyFor(policyId);
  const { Game } = await loadGame({ seed, mode: 'fieldports', fullTelemetry: false });
  await setupGame(Game);

  const discovered = [];
  const deaths = [];
  const sayBeats = [];
  const firings = { herald: 0, finale_crew: 0, finale_opening: 0 };
  const punishLines = [];

  // Wrap the two field-port entry points (read-only instrumentation — the
  // ports run exactly as shipped; we count calls + scrape rec.log deltas).
  const hasW4 = typeof Game.sigW4FieldMonster === 'function';
  const hasW5 = typeof Game.sigW5FieldMonster === 'function';
  let _w4 = null, _w5 = null;
  if (hasW4) {
    _w4 = Game.sigW4FieldMonster.bind(Game);
    Game.sigW4FieldMonster = function (mdef, rec, ctx) {
      const id = mdef && mdef.id;
      const before = rec && rec.log ? rec.log.length : 0;
      const out = _w4(mdef, rec, ctx);
      if (FP_IDS.indexOf(id) >= 0) {
        firings[id] = (firings[id] || 0) + 1;
        try {
          const newLines = (rec.log || []).slice(before);
          for (const ln of newLines) punishLines.push({ day: gday(Game), id, text: String(ln).slice(0, BEAT_LEN) });
        } catch (e) {}
      }
      return out;
    };
  }
  if (hasW5) {
    _w5 = Game.sigW5FieldMonster.bind(Game);
    Game.sigW5FieldMonster = function (mdef, rec, ctx) {
      const id = mdef && mdef.id;
      const before = rec && rec.log ? rec.log.length : 0;
      const out = _w5(mdef, rec, ctx);
      if (FP_IDS.indexOf(id) >= 0) {
        firings[id] = (firings[id] || 0) + 1;
        try {
          const newLines = (rec.log || []).slice(before);
          for (const ln of newLines) punishLines.push({ day: gday(Game), id, text: String(ln).slice(0, BEAT_LEN) });
        } catch (e) {}
      }
      return out;
    };
  }

  const _t = Game.tele.bind(Game);
  Game.tele = function (type, data) {
    try {
      if (type === 'counter_discovered') discovered.push({ day: gday(Game), id: data && data.id, via: data && data.via });
      else if (type === 'death') deaths.push({ day: gday(Game), kind: data && data.kind, who: data && data.who, cause: data && data.cause, player: !!(data && data.player) });
    } catch (e) {}
    return _t(type, data);
  };
  const _s = Game.say.bind(Game);
  Game.say = function (t) {
    try {
      const s = String(t || '');
      if (PORT_BEAT.test(s) && sayBeats.length < BEAT_CAP) sayBeats.push({ day: gday(Game), text: s.slice(0, BEAT_LEN) });
    } catch (e) {}
    return _s(t);
  };

  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  if (hasW4) Game.sigW4FieldMonster = _w4;
  if (hasW5) Game.sigW5FieldMonster = _w5;
  Game.tele = _t; Game.say = _s;

  const st = Game.state || {};
  const sid = scholarVid(Game);

  let national = 0, table = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}

  const maxWave = result.maxWaveUnlocked || 1;
  const won = !!Game.won ? 1 : 0;
  const fTricks = Object.keys(st.villagerTricks || {});
  const fieldDeaths = deaths.filter(d => !d.player).length;
  let trickTally = {};
  try { trickTally = Game._trickTally || {}; } catch (e) {}
  const trickExecutions = Object.values(trickTally).reduce((a, b) => a + (b | 0), 0);

  // Honest-punishment / trick-resolution taxonomy for the newly-ported set.
  const P = {
    heraldOmenLands: 0, heraldOmenDodged: 0,
    crewStall: 0, crewClimb: 0, crewSweeps: 0,
    openingDeclared: 0, openingCardFalls: 0,
  };
  const allLines = punishLines.concat(sayBeats);
  for (const b of allLines) {
    const t = b.text || '';
    if (b.id === 'herald' || /THE OMEN LANDS|read the omen/.test(t)) {
      if (/THE OMEN LANDS/.test(t)) P.heraldOmenLands++;
      else if (/read the omen and repositioned/.test(t)) P.heraldOmenDodged++;
    }
    if (b.id === 'finale_crew' || /ratings STALL|ratings climb|SWEEPS WEEK/.test(t)) {
      if (/ratings STALL/.test(t)) P.crewStall++;
      else if (/SWEEPS WEEK/.test(t)) P.crewSweeps++;
      else if (/ratings climb/.test(t)) P.crewClimb++;
    }
    if (b.id === 'finale_opening' || /THE CREDITS FINISH ROLLING|TITLE CARD FALLS/.test(t)) {
      if (/TITLE CARD FALLS/.test(t)) P.openingCardFalls++;
      else if (/THE CREDITS FINISH ROLLING/.test(t)) P.openingDeclared++;
    }
  }
  const punishResolutions = P.heraldOmenLands + P.heraldOmenDodged + P.crewStall + P.openingCardFalls;
  const totalFirings = (firings.herald | 0) + (firings.finale_crew | 0) + (firings.finale_opening | 0);

  const out = {
    seed, policyId, arm: ARM, repo: REPO,
    substrate: 'pre-seat (FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1, SEATDRIVE=0 explicit)',
    days: result.days, endReason: result.endReason,
    national, table, won, wins: won, exiled: 0,
    maxWave, wave4Reached: maxWave >= 4 ? 1 : 0, wave5Reached: maxWave >= 5 ? 1 : 0,
    deaths: deaths.length, fieldDeaths, playerDeaths: deaths.length - fieldDeaths,
    deathCauses: deaths.reduce((o, d) => { const c = String(d.cause || '?').slice(0, 60); o[c] = (o[c] || 0) + 1; return o; }, {}),
    trickTally, trickExecutions,
    nDiscovered: discovered.length,
    villagerTricksKnown: fTricks.length,
    portFirings: firings, totalFirings,
    portPunishments: P, punishResolutions,
    hasW4Port: hasW4 ? 1 : 0, hasW5Port: hasW5 ? 1 : 0,
  };
  fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, `${policyId}-s${seed}-${ARM}.json`), JSON.stringify(out, null, 1));
  const beats = sayBeats.slice(0, 800).concat(punishLines.slice(0, 800));
  if (beats.length) {
    fs.mkdirSync(BEATS, { recursive: true });
    fs.writeFileSync(path.join(BEATS, `${policyId}-s${seed}-${ARM}.json`), JSON.stringify(beats, null, 1));
  }
  console.log(`${policyId}-s${seed}-${ARM}: days=${result.days} national=${national} table=${table} won=${won} w4=${out.wave4Reached} w5=${out.wave5Reached} firings=${JSON.stringify(firings)} punish=${punishResolutions} tricks=${trickExecutions}`);
}

(async () => {
  for (const seed of SEEDS) {
    for (const policyId of POLICIES) {
      await oneRun(seed, policyId);
    }
  }
  console.log('SWEEP DONE');
})().catch(e => { console.error('SWEEP CRASH', String(e).slice(0, 500)); process.exit(1); });
