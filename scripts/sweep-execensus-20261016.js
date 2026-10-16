#!/usr/bin/env node
// sweep-execensus-20261016.js — the sim-execensus execution-window census.
// DIAGNOSTIC INSTRUMENT (zero src/js changes, scripts/ + evidence/ only).
// Read-only attach to the engine: with NODEWITNESS=1, trace every
// witness-sourced learning (learning id -> trick id -> species) through
// subsequent live fights and classify the execution funnel.
//
// Substrate: PRE-SEAT (SEATDRIVE=0 explicit — unset means driver ON).
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1
//   SEEDS=961..968 POLICIES=leadfeast,belongfeast DAYS=180 ARM=execensus
// Armed-only census (diagnostic): no control — the substrate is the landed
// nodewitness channel itself (commit a2c02684).
// REPO defaults to this script's own tree.
//
// What the instrument captures per run:
//   - tele: counter_observed {id,n,vid,via}, counter_discovered {id,via},
//     death events (all seq-stamped by the fight counter).
//   - fieldFight wrapper: per-fight {seq,day,vid,mid,wave,outcome,rounds,
//     trickLog,knownStart,knownEnd} + per-fight gate aggregation
//     {evals,fires,firedActions} from the villagerTrickAction wrapper
//     (recorded ONLY when the village knew the trick at eval time).
//   - tbEnd wrapper: per-TB-fight {seq,day,result,mids,perfs} where perfs
//     is f.trickLogByMid per species (scholar performances).
//   - end-of-run: waveKillLog trick entries, _trickTally, villagerTricks,
//     monsterCounters, villageCounterObs.
//   - say beats matching TRICK_BEAT (sense-read material) + trick-fight
//     logs (rec.log for fights with trickLog non-empty).
//
// Per-seed JSONs: evidence/2026-10-16/perseed-execensus/<policy>-s<seed>-execensus.json
// Schema: exact numeric keys national/table/won/wins/exiled (+ funnel).
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const TF = require(path.join(REPO, 'scripts', 'policies', 'tribfloor'));

for (const k of ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER']) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (pre-seat).'); process.exit(2); }
if (process.env.NODEWITNESS !== '1') { console.error('SWEEP STOP: NODEWITNESS=1 is required (the measured channel).'); process.exit(2); }
if (!TF.layerOn()) { console.error('SWEEP STOP: tribfloor layerOn() false despite TRIBFLOOR=1.'); process.exit(2); }

const ARM = process.env.ARM || 'execensus';
if (ARM !== 'execensus') { console.error('SWEEP STOP: this is an armed-only census (ARM=execensus).'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [961]).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '180', 10) || 180;
const POLICIES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['leadfeast']);
const EVID = process.env.EXECENSUS_EVID || path.join(__dirname, '..', 'evidence', '2026-10-16', 'perseed-execensus');
const BEATS = process.env.EXECENSUS_BEATS || path.join(__dirname, '..', 'evidence', '2026-10-16', 'execensus-beats');
const BEAT_CAP = 3000;
const BEAT_LEN = 300;
const TRICK_BEAT = /COUNTER LEARNED|came back with|the fire listens|pieced it together|watched .* take them|BELLOWS|fine print|loophole|DISMISSED|contradicts the|Tanking the|goes quiet|starves|deliberately boring|LEAVE|goodbye properly|looks away|dead air|VOMITS|followers|deliberately inefficient|off-script|falls PRONE|bad note|confesses first|argues theology|fighting boring/i;

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

function policyFor(policyId) {
  return policyId === 'leadfeast' ? TF.leadfeast : TF.belongfeast;
}

// Field-path trick-log tokens per species (villagerTrickAction's type/why
// pairs in fieldFights.js). [] = the village can know the trick but the
// field AI has no gate for it (un-actuatable in the abstract model — the
// engine's own documentation, not this instrument's invention).
const W3_FIELD_TOKENS = {
  spool: ['wait:spool-record'], chorus_line: ['dance'], buffering: ['wait:buffering-still'],
  redactor: ['wait:redactor-quiet'], gavel: ['confess'], focus_group: ['bore'],
  terms_of_service: ['examine'], callback: ['farewell'], ad_break: ['look_away'],
  strike: ['meet_demand'], suburb: ['leave'], eulogy: ['contradict'],
  algorithm: ['wait:algorithm-tank'], congregation: ['argue'],
  nielsen: ['wait:nielsen-boring'], spoiler: ['prone'], network_note: ['bad_note'],
  eater: ['poison'], influencer: ['focus_followers'], audit: ['inefficient'],
  reunion: ['wait:reunion-novel'], editor: ['continuity'], cancellation: ['offscript'],
  herald: [], finale: [], finale_crew: [], finale_opening: [], rerun: [], timeslot: [],
};
function trickTokensFor(Game, mid) {
  try {
    if (Object.prototype.hasOwnProperty.call(W3_FIELD_TOKENS, mid)) return W3_FIELD_TOKENS[mid].slice();
    const mdef = (Game.data.monsters || []).find(m => m.id === mid);
    if (mdef && mdef.counter) {
      if (mdef.counter.kind === 'shout') return ['shout'];
      if (mdef.counter.kind === 'offer_food') return ['offer_food'];
    }
    return [];
  } catch (e) { return []; }
}
// Dismiss-type tokens: firing them resolves the fight (mFlee / vFlee-wise)
// once the required count lands — offer_food/poison/leave resolve on the
// first fire; redactor-quiet/bore/examine need 3/3/2.
const DISMISS_TOKENS = ['offer_food', 'poison', 'leave', 'wait:redactor-quiet', 'bore', 'examine'];

// ---------------------------------------------------------------------------
// Read-only capture. Every wrapper calls through and records; none touches
// RNG, logic, or save state. The det-gate (test-execensus) proves
// byte-identical trajectories with the instrument attached.
// ---------------------------------------------------------------------------
function attachExecensusCapture(Game) {
  let fightSeq = 0;
  let curFightSeq = 0; // the field fight currently inside its round loop
  const fieldFights = [];
  const tbFights = [];
  const observations = [];
  const discoveries = [];
  const deaths = [];
  const sayBeats = [];
  const trickFightLogs = [];
  const gateAgg = new Map(); // fightSeq -> {evals, fires, actions[]}

  const _t = Game.tele.bind(Game);
  Game.tele = function (type, data) {
    try {
      if (type === 'counter_observed') observations.push({ seq: fightSeq, day: gday(Game), id: data && data.id, n: data && data.n, vid: data && data.vid, via: data && data.via });
      else if (type === 'counter_discovered') discoveries.push({ seq: fightSeq, day: gday(Game), id: data && data.id, via: data && data.via });
      else if (type === 'death') deaths.push({ day: gday(Game), kind: data && data.kind, who: data && data.who, cause: data && data.cause, player: !!(data && data.player) });
    } catch (e) {}
    return _t(type, data);
  };
  const _s = Game.say.bind(Game);
  Game.say = function (t) {
    try {
      const s = String(t || '');
      if (TRICK_BEAT.test(s) && sayBeats.length < BEAT_CAP) sayBeats.push({ day: gday(Game), text: s.slice(0, BEAT_LEN) });
    } catch (e) {}
    return _s(t);
  };
  // Gate-eval capture: every villagerTrickAction evaluation where the
  // village knew the trick. The engine's own gate decides fired/null — the
  // instrument just counts the engine's answers.
  const _vta = Game.villagerTrickAction.bind(Game);
  Game.villagerTrickAction = function (vid, mdef, fctx) {
    const ret = _vta(vid, mdef, fctx);
    try {
      if (mdef && Game.villageKnowsTrick && Game.villageKnowsTrick(mdef.id)) {
        const seq = curFightSeq;
        let agg = gateAgg.get(seq);
        if (!agg) { agg = { evals: 0, fires: 0, actions: [] }; gateAgg.set(seq, agg); }
        agg.evals++;
        if (ret) { agg.fires++; if (agg.actions.length < 12) agg.actions.push(ret.type + ':' + (ret.why || '')); }
      }
    } catch (e) {}
    return ret;
  };
  const _ff = Game.fieldFight.bind(Game);
  Game.fieldFight = function (vid, mdef, m, opts) {
    const prev = curFightSeq;
    fightSeq++; curFightSeq = fightSeq;
    let knownStart = false;
    try { knownStart = !!(Game.villageKnowsTrick && mdef && Game.villageKnowsTrick(mdef.id)); } catch (e) {}
    const rec = _ff(vid, mdef, m, opts);
    try {
      const tl = (rec && rec.trickLog) || [];
      let knownEnd = false;
      try { knownEnd = !!(Game.villageKnowsTrick && mdef && Game.villageKnowsTrick(mdef.id)); } catch (e) {}
      const agg = gateAgg.get(curFightSeq) || { evals: 0, fires: 0, actions: [] };
      fieldFights.push({
        seq: curFightSeq, day: gday(Game), vid: vid,
        mid: mdef && mdef.id, wave: (mdef && mdef.wave) || 1,
        outcome: rec && rec.outcome, rounds: rec && rec.rounds,
        trickLog: tl.slice(0, 12), knownStart, knownEnd,
        evals: agg.evals, fires: agg.fires, firedActions: agg.actions.slice(0, 12),
      });
      if (tl.length && rec && rec.log && trickFightLogs.length < 60) {
        trickFightLogs.push({ seq: curFightSeq, day: gday(Game), vid: vid, mid: mdef && mdef.id, outcome: rec && rec.outcome, log: rec.log.slice(0, 60).map(String) });
      }
    } catch (e) {}
    curFightSeq = prev;
    return rec;
  };
  // TB-path capture: scholar performances are logged per species in
  // f.trickLogByMid by checkMonsterCounter (regardless of known status).
  const _tbEnd = Game.tbEnd.bind(Game);
  Game.tbEnd = function (result) {
    let rec = null;
    try {
      const f = Game.tbfight;
      if (f && !f.over) {
        fightSeq++;
        const mids = (f.fighters || []).filter(x => x && x.kind === 'monster' && x.mdef).map(x => x.mdef.id);
        const perfs = {};
        for (const k of Object.keys(f.trickLogByMid || {})) perfs[k] = (f.trickLogByMid[k] || []).slice();
        rec = { seq: fightSeq, day: gday(Game), result: result, mids: mids, perfs: perfs };
      }
    } catch (e) {}
    const r = _tbEnd(result);
    if (rec) tbFights.push(rec);
    return r;
  };

  return {
    fieldFights, tbFights, observations, discoveries, deaths, sayBeats, trickFightLogs,
    restore() { Game.tele = _t; Game.say = _s; Game.villagerTrickAction = _vta; Game.fieldFight = _ff; Game.tbEnd = _tbEnd; },
  };
}

// ---------------------------------------------------------------------------
// Funnel classification. learnSeq = the fight-counter value when the
// discovery tele event fired (so the discovery fight itself is excluded).
// ---------------------------------------------------------------------------
function classifyLearning(Game, cap, learning) {
  const mid = learning.id;
  const tokens = trickTokensFor(Game, mid);
  const fights = [];
  for (const f of cap.fieldFights) {
    if (f.mid !== mid || f.seq <= learning.seq) continue;
    if (f.outcome === 'alreadyDead') continue; // not a live fight
    if (!f.knownStart) continue; // pre-learning (shouldn't happen: knowledge is monotonic)
    const e = { seq: f.seq, day: f.day, path: 'field', vid: f.vid, outcome: f.outcome, rounds: f.rounds, trickLog: f.trickLog, evals: f.evals, fires: f.fires };
    if (f.outcome === 'evade') { e.cls = 'survive'; e.sub = 'no contact — saw it, gave it room'; }
    else if (tokens.length === 0) { e.cls = 'un-actuatable'; e.sub = 'trick known, field AI has no gate for it'; }
    else if (f.evals === 0) { e.cls = 'no-opportunity'; e.sub = 'fight over before any trick turn (one-round kill / volley)'; }
    else if (f.fires === 0) { e.cls = 'conditions-never-met'; e.sub = 'engine evaluated the gate ' + f.evals + 'x, never fired'; }
    else {
      const fired = (f.trickLog || []).filter(t => tokens.indexOf(t) >= 0);
      e.firedTokens = fired;
      const dismissFired = fired.some(t => DISMISS_TOKENS.indexOf(t) >= 0);
      if (f.outcome === 'vKill') { e.cls = 'kill'; e.sub = 'trick present in fight, brute-force kill (tricks buy survival, not damage)'; }
      else if (f.outcome === 'mFlee') { e.cls = 'flee'; e.sub = dismissFired ? 'flee, trick-driven' : 'flee, engine'; }
      else if (f.outcome === 'vFlee') { e.cls = 'flee'; e.sub = (fired.indexOf('leave') >= 0) ? 'flee, trick-driven (wise — navigation is victory)' : 'flee, engine'; }
      else if (f.outcome === 'vDie') { e.cls = 'trick fired but failed'; e.sub = 'trick fired, villager died anyway'; }
      else { e.cls = 'survive'; e.sub = 'trick fired, fight ended without resolution'; }
    }
    fights.push(e);
  }
  // TB path: only counter-bearing (w1/w2) species have scholar-performable
  // tricks; village tricks (w3+) cannot be actuated in TB.
  const mdefTb = ((Game.data || {}).monsters || []).find(m => m.id === mid);
  const tbActuable = !!(mdefTb && mdefTb.counter);
  const tbFights = [];
  for (const t of cap.tbFights) {
    if (t.mids.indexOf(mid) < 0 || t.seq <= learning.seq) continue;
    const perfs = (t.perfs && t.perfs[mid]) || [];
    const e = { seq: t.seq, day: t.day, path: 'tb', result: t.result, performances: perfs.slice(0, 8) };
    if (!tbActuable) { e.cls = 'tb-n/a'; e.sub = 'TB path cannot actuate village tricks (w3+)'; }
    else if (!perfs.length) { e.cls = 'conditions-never-met'; e.sub = 'scholar fought ' + mid + ', never performed the trick'; }
    else if (t.result === 'won' || t.result === 'routed') {
      const attributed = (Game.state.waveKillLog || []).some(k => k.mid === mid && k.trick && (k.d === t.day || k.d === t.day - 1 || k.d === t.day + 1));
      e.cls = 'kill'; e.sub = attributed ? 'kill, trick-attributed' : 'kill, trick performed but not attributed';
    }
    else if (t.result === 'fled') { e.cls = 'flee'; e.sub = perfs.length ? 'flee, trick performed' : 'flee'; }
    else if (t.result === 'lost') { e.cls = perfs.length ? 'trick fired but failed' : 'villager died'; e.sub = perfs.length ? 'scholar performed the trick, fight lost' : 'scholar lost, trick never performed'; }
    else { e.cls = 'survive'; e.sub = 'tb result ' + t.result; }
    tbFights.push(e);
  }
  const summary = {};
  for (const e of fights.concat(tbFights)) summary[e.cls] = (summary[e.cls] || 0) + 1;
  // Executed = the trick actually fired in the fight (field: gate fired;
  // TB: scholar performance logged). Everything else is the funnel breaking
  // upstream.
  const execs = fights.filter(f => (f.fires | 0) > 0).length
    + tbFights.filter(f => (f.performances || []).length > 0).length;
  const verdict = (fights.length + tbFights.length) === 0 ? 'no-opportunity' : 'traced';
  return { fights, tbFights, summary, execs, verdict };
}

async function oneRun(seed, policyId) {
  const policy = policyFor(policyId);
  const { Game } = await loadGame({ seed, mode: 'execensus', fullTelemetry: false });
  await setupGame(Game);
  const cap = attachExecensusCapture(Game);

  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 30 }); });
  cap.restore();

  const st = Game.state || {};
  const monsterById = {};
  try { for (const m of (Game.data.monsters || [])) monsterById[m.id] = m; } catch (e) {}

  let national = 0, table = 0;
  try { const r = (Game.scaleRank ? Game.scaleRank() : 'village') || 'village'; if (r === 'national' || r === 'global') national = 1; } catch (e) {}
  try { const pg = Game.progState ? Game.progState() : {}; if (pg.tableWaiting || pg.tableDone) table = 1; } catch (e) {}
  const maxWave = result.maxWaveUnlocked || 1;
  const won = !!Game.won ? 1 : 0;
  const fieldDeaths = cap.deaths.filter(d => !d.player).length;
  let trickTally = {};
  try { trickTally = Game._trickTally || {}; } catch (e) {}

  // Witness-sourced learnings: every counter_discovered where the witness
  // channel wrote the discovery (pure) or contributed >=1 observation to
  // the 2-observation bar before discovery (shared-bar — e.g. the eater:
  // 1 witness report + 1 survived encounter).
  const witnessLearnings = [];
  for (const d of cap.discoveries) {
    const mid = d.id;
    const mdef = monsterById[mid];
    if (!mdef) continue;
    const witnessObsBefore = cap.observations.filter(o => o.id === mid && o.via === 'node-witnessed' && o.seq <= d.seq).length;
    // pure = the witness channel wrote BOTH observations on the 2-bar;
    // shared = it wrote the decisive one (the other came from a survived
    // encounter). via='node-witnessed' alone doesn't distinguish: the
    // witness can provide observation #2 after a survived #1.
    const pure = d.via === 'node-witnessed' && witnessObsBefore >= 2;
    const shared = !pure && witnessObsBefore > 0;
    if (!pure && !shared) continue;
    const defs = (Game.villagerTrickDefs ? Game.villagerTrickDefs() : {}) || {};
    const store = mdef.counter ? 'monsterCounters' : 'villagerTricks';
    const trickText = mdef.counter ? (mdef.counter.kind + ' — ' + (mdef.counter.trick || '')) : ((defs[mid] || {}).trick || '');
    witnessLearnings.push({
      learnId: 'L' + d.seq + '-' + mid, seq: d.seq, day: d.day, id: mid,
      trick: mdef.counter ? mdef.counter.kind : mid, trickText: String(trickText).slice(0, 200),
      wave: mdef.wave || 1, store, via: d.via,
      witnessSourced: pure ? 'pure' : 'shared', witnessObsBefore,
      tokens: trickTokensFor(Game, mid),
    });
  }
  const funnel = witnessLearnings.map(l => {
    const c = classifyLearning(Game, cap, l);
    return { learnId: l.learnId, day: l.day, id: l.id, trick: l.trick, wave: l.wave, via: l.via, witnessSourced: l.witnessSourced, verdict: c.verdict, summary: c.summary, execs: c.execs, fights: c.fights, tbFights: c.tbFights };
  });

  const waveKillTricks = (st.waveKillLog || []).filter(k => k.trick).map(k => ({ d: k.d, mid: k.mid, w: k.w, by: k.by, via: k.via, trick: String(k.trick).slice(0, 120) }));
  const bySpecies = {};
  for (const w of cap.observations.filter(o => o.via === 'node-witnessed')) bySpecies[w.id] = (bySpecies[w.id] || 0) + 1;

  const out = {
    seed, policyId, arm: ARM, repo: REPO,
    substrate: 'pre-seat courtship (FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1, SEATDRIVE=0 explicit, NODEWITNESS=1)',
    days: result.days, endReason: result.endReason,
    national, table, won, wins: won, exiled: 0,
    maxWave, wave4Reached: maxWave >= 4 ? 1 : 0, wave5Reached: maxWave >= 5 ? 1 : 0,
    deaths: cap.deaths.length, fieldDeaths, playerDeaths: cap.deaths.length - fieldDeaths,
    deathCauses: cap.deaths.reduce((o, d) => { const c = String(d.cause || '?').slice(0, 60); o[c] = (o[c] || 0) + 1; return o; }, {}),
    trickTally,
    nNodeWitnessReports: cap.observations.filter(o => o.via === 'node-witnessed').length,
    nodeWitnessBySpecies: bySpecies,
    nNodeWitnessDiscovered: witnessLearnings.filter(l => l.via === 'node-witnessed').length,
    nodeWitnessDiscovered: witnessLearnings.filter(l => l.via === 'node-witnessed').map(l => ({ day: l.day, id: l.id })),
    nFieldFights: cap.fieldFights.length, nTbFights: cap.tbFights.length,
    nWaveKillTricks: waveKillTricks.length,
    witnessLearnings, funnel,
    nLearnings: witnessLearnings.length,
  };
  fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, `${policyId}-s${seed}-${ARM}.json`), JSON.stringify(out, null, 1));
  const beats = cap.sayBeats.slice(0, 800);
  if (beats.length || cap.trickFightLogs.length) {
    fs.mkdirSync(BEATS, { recursive: true });
    fs.writeFileSync(path.join(BEATS, `${policyId}-s${seed}-${ARM}.json`), JSON.stringify({ beats, trickFightLogs: cap.trickFightLogs.slice(0, 40) }, null, 1));
  }
  const nExec = funnel.reduce((a, f) => a + f.execs, 0);
  console.log(`  [${ARM} ${policyId} s${seed}] days=${result.days} end=${result.endReason} maxWave=${maxWave} nat=${national} won=${won} fieldFights=${cap.fieldFights.length} tbFights=${cap.tbFights.length} learnings=${witnessLearnings.length} execs=${nExec}`);
  return out;
}

(async () => {
  if (require.main !== module) return;
  for (const seed of SEEDS) {
    for (const policyId of POLICIES) {
      await oneRun(seed, policyId);
    }
  }
  console.log(`\nSWEEP DONE (${ARM}) — per-seed JSONs in ${EVID}/`);
})().catch(e => { console.error('SWEEP CRASH:', e); process.exit(2); });

module.exports = { oneRun, policyFor, attachExecensusCapture, trickTokensFor, classifyLearning, TRICK_BEAT };
