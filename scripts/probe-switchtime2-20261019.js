#!/usr/bin/env node
// probe-switchtime2-20261019.js — v3-switch MOMENTUM GATE sweep (sim-switchtime-2 arm,
// run fleshout-20261019T2115Z, axis scale-onramp).
//
// COPY of scripts/probe-seasonblock-20261019.js (2026-10-19) with exactly three
// changes: (a) EVID dir is env-switched (SWITCHTIME2=1 -> perseed-switchtime2-armed,
// unset -> perseed-switchtime2-control); (b) the policy ctx's _switch2Gate
// counters (belongseek's switch-discipline decisions) are captured into the
// per-seed JSON, but ONLY when SWITCHTIME2=1 — control JSONs stay
// byte-identical to the seasonblock corpus; (c) header/usage retitled. The
// bond census, beat capture, death census, flow recording and DET/SMOKE/
// FIDELITY gates are otherwise verbatim.
// instrument (flesh-out loop arm sim-seasonblock, run fleshout-20261019T2015Z,
// axis scale-onramp).
//
// Named next from sim-feastgap (evidence/2026-10-19/sim-feastgap.md): the
// lead-vs-belong deferral-5 gap is M-SEASONED-LINK-DIPLOMACY (t5 needs
// +34/seasoned-link diplomacy; lead's 3 bonds season together; belong's
// upward bond carries trust 70-100 but seasons 0-1x per run). Trust is NOT
// the blocker. This arm attributes the seasoning blocker per bond: one of
// (age-reset by succession / age-reset by v3 re-court / primary polity < 4
// fires) — instrumenting LINK AGE + PRIMARY-POLITY FIRE COUNT per link per
// day, plus "the bond is young" beat firings, succession days, and full link
// histories (the breakLink how is noted in link.history[] — day-exact).
//
// INSTRUMENT-ONLY DIAGNOSTIC: zero src/js changes, zero scripts/policies
// changes. The new reads are PURE engine calls (no state writes, no RNG
// draws): Game._linkSeasoned, Game._linkRegionalPlus, Game.foreignPolities,
// link.history[], and a call-through Game.say wrap for the succession-beat
// capture. The DET gate pins instrument-on vs instrument-off byte-identical.
//
// SUBSTRATE (the feastgap substrate, verbatim):
//   withSeatDrive(withWinDefer(withReposition(TF base)))
//   on {leadfeast, belongfeast} tribfloor bases.
//   Env: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1
//        WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 KILLDISC=1
//   (SEATDRIVE='0' -> seatdrive pure delegation; REPOSITION unset -> inert;
//   VETREL unset -> companion-veteran channel OFF; KILLDISC='1' -> read-only
//   kill census installed — same instrument envelope as the feastgap sweep,
//   so trajectories stay comparable seed-for-seed.)
//
// Seeds: 64201-64208 x {belongfeast (focus: stall seeds 64201, 64202, 64207),
// leadfeast (paired attribution)} = 16 runs. Horizon: 180d death-aware.
//
// Usage:
//   FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 \
//   WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 KILLDISC=1 \
//   node scripts/probe-seasonblock-20261019.js
//   SMOKE=1 ...        # short smoke: census live on 1 seed
//   DET=1 ...          # det-gate: instrument-on vs instrument-off byte-identical (2 seeds x 60d)
//   FIDELITY=1 ...     # fidelity: re-run 2 completed sweep seeds, byte-identical per-seed JSON
//   ONLY=belongfeast ... # policy filter (parallel batches)
//   SEEDS="64201,64207" DAYS=60 ...  # targeted
'use strict';
const fs = require('fs');
const path = require('path');
const FG = require('./probe-feastgap-20261019');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');
const { dayHash } = require('./det-gate');

// SUBSTRATE GUARD — the feastgap substrate, verbatim. All ones must be
// '1'; SEATDRIVE must be '0'; REPOSITION and VETREL must NOT be '1'.
const ENV_REQ_1 = ['FEASTSCALE_R13', 'TRIBFLOOR', 'SUCCGRACE', 'RAIDDENSITY', 'WINPURSUIT', 'WINDEFER', 'NODEWITNESS', 'KILLDISC'];
for (const k of ENV_REQ_1) {
  if (process.env[k] !== '1') { console.error(`SWEEP STOP: ${k}=1 is required (seasonblock substrate).`); process.exit(2); }
}
if (process.env.SEATDRIVE !== '0') { console.error('SWEEP STOP: SEATDRIVE=0 is required (pre-seat).'); process.exit(2); }
if (process.env.REPOSITION === '1') { console.error('SWEEP STOP: REPOSITION must NOT be 1 (pre-seat substrate).'); process.exit(2); }
if (process.env.VETREL === '1') { console.error('SWEEP STOP: VETREL must NOT be 1 (seasonblock is the no-vetrel divergence surface).'); process.exit(2); }

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10))
  : [64201, 64202, 64203, 64204, 64205, 64206, 64207, 64208]).filter(Number.isFinite);
const DAYS_DEFAULT = 180;
function daysNow() { return process.env.DAYS ? parseInt(process.env.DAYS, 10) : DAYS_DEFAULT; }
const ONLY = (process.env.ONLY || '').toLowerCase();
const POLICIES = ['leadfeast', 'belongfeast'].filter(p => !ONLY || p === ONLY);
// Evaluated per call, not cached at load: the proof test (test-switchtime.js)
// toggles SWITCHTIME2 within one node process across its sections.
const switchTimeOn = () => process.env.SWITCHTIME2 === '1';
function evidDir() {
  return path.join(__dirname, '..', 'evidence', '2026-10-19',
    switchTimeOn() ? 'perseed-switchtime2-armed' : 'perseed-switchtime2-control');
}
const EVID = evidDir();
const isBare = () => process.env.SEASONBLOCK_BARE === '1';

const scholarDay = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };

// ---------------------------------------------------------------------------
// BOND CENSUS — the instrument this arm exists for. Per link per day: link
// age (= scholar.day - link.day; link.day is written once at _formLink and
// NEVER reassigned — grep-verified 2026-10-19, so an age reset is always a
// break+re-form), trust, arrears, _linkSeasoned (age>=30, trust>=40), the
// regional+ filter (_linkRegionalPlus: for the belong bond, polityOf(primary)
// = good standing (trust>=50, arrears 0, age>=14) AND the foreign realm at
// >=4 fires), whether THIS link earns its +34 today, and the foreign
// primary's polity fire count (2 + fp.subs.length — primary + Haven + subs).
// All reads are pure; breakLink notes 'Link broken (<how>).' into
// link.history[] at day-exact precision, and _formLink notes 'formed' — the
// analyzer names the reset cause (walked = v3 re-court; succession =
// succession; other = other) from those notes, not from prose.
function bondCensus(G) {
  const day = scholarDay(G);
  const links = [];
  try {
    const ls = (G.hierarchyState ? G.hierarchyState() : []) || [];
    for (const l of ls) {
      if (!l) continue;
      const age = day - (l.day || 0);
      let seasoned = false, rplus = false;
      try { seasoned = !!(G._linkSeasoned && G._linkSeasoned(l, !!l.conquered)); } catch (e) {}
      try { rplus = !!(G._linkRegionalPlus && G._linkRegionalPlus(l)); } catch (e) {}
      let fires = null;
      try {
        if (l.subordinate === 'haven' && l.primary && l.primary !== 'haven' && G.foreignPolities) {
          const fps = G.foreignPolities() || [];
          const fp = fps.find(f => f && f.primary === l.primary);
          fires = fp ? (2 + ((fp.subs || []).length)) : 2;
        }
      } catch (e) {}
      let vid = '?';
      try { vid = String(G.villagerId); } catch (e) {}
      links.push({
        id: String(l.id || '?'), st: l.status || '?',
        prim: String(l.primary || '?'), sub: String(l.subordinate || '?'),
        kind: l.kind || null,
        trust: (l.trust | 0) || 0, age, fday: (l.day || 0),
        arrears: (l.arrears | 0) || 0,
        seasoned, rplus, dip: (seasoned && rplus) ? 1 : 0, fires,
        vid,
      });
    }
  } catch (e) {}
  return { d: day, links };
}

// Full link dump at run end: every link ever (active + broken) with its
// day-stamped history[] — the age-reset attribution source.
function linkHistoryDump(G) {
  const out = [];
  try {
    const ls = (G.hierarchyState ? G.hierarchyState() : []) || [];
    for (const l of ls) {
      if (!l) continue;
      out.push({
        id: String(l.id || '?'), st: l.status || '?',
        prim: String(l.primary || '?'), sub: String(l.subordinate || '?'),
        kind: l.kind || null, fday: (l.day || 0),
        endTrust: (l.trust | 0) || 0,
        history: (l.history || []).map(h => ({ day: (h && h.day) | 0, kind: String((h && h.kind) || ''), note: String((h && h.note) || '').slice(0, 160) })),
      });
    }
  } catch (e) {}
  return out;
}

// ---------------------------------------------------------------------------
// DEATH CAPTURE — copied VERBATIM from scripts/probe-feastgap-20261019.js
// (2026-10-19, sim-feastgap arm). The feastgap probe's module.exports does
// NOT include installDeathCapture, so we vendor the copy here rather than
// editing the sibling arm's file. IDENTICAL BY CONSTRUCTION so the death
// taxonomy stays comparable across arms. Per-run death capture: wraps
// Game.tele (records death teles — incl. the engine's `wave` field). Pure
// recording — no state writes, no RNG draws.
function installDeathCapture(Game, C, monsterNames) {
  C.deathRecs = [];
  C.fightStarts = [];
  function recFight(mid, wave, via) {
    try {
      if (mid == null) return;
      C.fightStarts.push({ day: scholarDay(Game), mid: String(mid), wave: wave == null ? null : (wave | 0), via });
    } catch (e) { C.instrumentErrors++; }
  }
  function wrapRouterFn(name, flag, midOf) {
    const orig = Game[name];
    if (typeof orig !== 'function') return;
    Game[name] = function () {
      const prev = C._router; C._router = flag;
      try {
        const mid = midOf ? midOf(arguments) : null;
        if (mid) recFight(mid, null, 'router:' + flag);
      } catch (e) { C.instrumentErrors++; }
      try { return orig.apply(this, arguments); }
      finally { C._router = prev; }
    };
  }
  wrapRouterFn('resolvePatrol', 'patrol', (args) => (args[1] && args[1].id) || null);
  wrapRouterFn('resolveWildMonsterEncounter', 'wild', (args) => (args[1] && args[1].id) || null);
  try {
    const oAid = Game.aidFight;
    if (typeof oAid === 'function') {
      Game.aidFight = function (vid, mdef) {
        try { recFight(mdef && mdef.id, mdef && mdef.wave, 'aidFight'); }
        catch (e) { C.instrumentErrors++; }
        return oAid.apply(this, arguments);
      };
    } else { C.instrumentErrors++; }
  } catch (e) { C.instrumentErrors++; }
  try {
    const oTele = Game.tele.bind(Game);
    Game.tele = function (type, data) {
      const r = oTele.apply(this, arguments);
      try {
        if (type === 'combat_start') {
          recFight(data && data.vs, data && data.wave, 'combat_start');
        }
        if (type === 'death') {
          const rec = {
            day: scholarDay(Game),
            who: data && data.who != null ? String(data.who) : null,
            cause: data && data.cause != null ? String(data.cause) : 'unknown',
            kind: data && data.kind != null ? String(data.kind) : null,
            player: !!(data && data.player),
            wave: (data && data.wave != null) ? (data.wave | 0) : null,
            ctx: { aid: false, atHaven: false, inTb: false, router: C._router || null, onExped: false },
          };
          try { rec.ctx.aid = !!(Game.aidCrisis && Game.aidCrisis()); } catch (e) {}
          try { rec.ctx.atHaven = !!(Game.playerAtHaven && Game.playerAtHaven()); } catch (e) {}
          try { rec.ctx.inTb = !!Game.tbfight; } catch (e) {}
          try {
            const st = (typeof Game.agencyState === 'function') ? Game.agencyState() : null;
            rec.ctx.onExped = !!(st && st.exped && rec.who && st.exped[rec.who]);
          } catch (e) {}
          C.deathRecs.push(rec);
        }
      } catch (e) { C.instrumentErrors++; }
      return r;
    };
  } catch (e) { C.instrumentErrors++; }
}

// Beat capture: the succession liturgy the sense-test must read — 'the bond
// is young' (fires only when link age < 21 per hierarchy.js:1591), 'installs
// their own speaker' (the older-bond grief variant), 'grief card is spent'.
// Call-through wrap only: no state writes, no RNG draws.
function installBeatCapture(G, C) {
  C.beats = [];
  try {
    const oSay = G.say.bind(G);
    G.say = function (x) {
      try {
        const t = String(x == null ? '' : x);
        const low = t.toLowerCase();
        if (low.includes('bond is young') || low.includes('installs their own speaker') ||
            low.includes('grief card is spent') || low.includes('swear the oath of the realm')) {
          const tag = low.includes('bond is young') ? 'bond-is-young'
            : low.includes('installs their own speaker') ? 'speaker-install'
            : low.includes('grief card is spent') ? 'grief-card-spent' : 'oath-summons';
          C.beats.push({ day: scholarDay(G), tag, text: t.slice(0, 400) });
        }
      } catch (e) { C.instrumentErrors++; }
      return oSay.apply(this, arguments);
    };
  } catch (e) { C.instrumentErrors++; }
}

// ---------------------------------------------------------------------------
// runOne(seed, policyId, opts): one instrumented 180d death-aware run.
async function runOne(seed, policyId, opts) {
  opts = opts || {};
  const bare = isBare();
  const C = { instrumentErrors: 0, hashes: [], bond: [], maxWave: 1, wave4Day: null, wave5Day: null,
    maxRank: 0, nationalDay: null, everTable: false, exiled: false, successionDays: [], _prevVid: null };
  const base = FG.policyFor(policyId);
  const policy = Object.assign({}, base);
  const holder = { monsterNames: null };
  const oSetup = base.setup;
  policy.setup = (G, ctx) => {
    const r = oSetup ? oSetup(G, ctx) : undefined;
    if (!bare) {
      try { installDeathCapture(G, C, holder.monsterNames || new Set()); } catch (e) { C.instrumentErrors++; }
      try { FG.installFlowRecording(G, C); } catch (e) { C.instrumentErrors++; }
      try { installBeatCapture(G, C); } catch (e) { C.instrumentErrors++; }
    }
    return r;
  };
  const oDaily = base.daily;
  policy.daily = (G, ctx) => {
    let r;
    if (oDaily) { try { r = oDaily(G, ctx); } catch (e) {} }
    try { if (ctx && ctx._switch2Gate) C.switch2Gate = Object.assign({}, ctx._switch2Gate, { reasons: Object.assign({}, ctx._switch2Gate.reasons), last: ctx._switch2Gate.last ? Object.assign({}, ctx._switch2Gate.last) : null }); } catch (e) {}
    try {
      // Hashes ALWAYS recorded (bare and live alike) — the det-gate
      // compares these; gating them on !isBare() voids the gate.
      C.hashes.push(scholarDay(G) + ':' + dayHash(G));
    } catch (e) {}
    if (!bare) {
      try {
        const bc = bondCensus(G);
        // Succession detection: scholar-vid change day-exact.
        const vids = new Set(bc.links.map(l => l.vid));
        const vid = vids.size ? [...vids][0] : '?';
        if (C._prevVid != null && vid !== C._prevVid) {
          C.successionDays.push({ day: bc.d, from: String(C._prevVid), to: vid });
        }
        C._prevVid = vid;
        bc.succession = (C.successionDays.length && C.successionDays[C.successionDays.length - 1].day === bc.d) ? 1 : 0;
        C.bond.push(bc);
        const rec = FG.dailyRec(G);
        if (rec.uw > C.maxWave) C.maxWave = rec.uw;
        if (rec.uw >= 4 && C.wave4Day == null) C.wave4Day = rec.d;
        if (rec.uw >= 5 && C.wave5Day == null) C.wave5Day = rec.d;
        let rank = 'village';
        try { rank = (G.scaleRank ? G.scaleRank() : 'village') || 'village'; } catch (e) {}
        const RANK_ORDER = { village: 0, local: 1, regional: 2, national: 3, global: 4 };
        C.maxRank = Math.max(C.maxRank, RANK_ORDER[rank] == null ? 0 : RANK_ORDER[rank]);
        if (rank === 'national' || rank === 'global') {
          if (C.nationalDay == null) C.nationalDay = rec.d;
        }
        const pg = G.progState ? G.progState() : null;
        if (pg && (pg.tableWaiting || pg.tableDone)) C.everTable = true;
        if ((G.state.scholar || {}).exiled) C.exiled = true;
      } catch (e) { C.instrumentErrors++; }
    }
    return r;
  };
  const { Game } = await loadGame({ seed, mode: 'feastgap', fullTelemetry: false });
  await setupGame(Game);
  let monsterNames = null;
  try {
    monsterNames = new Set();
    for (const m of (Game.data && Game.data.monsters) || []) {
      if (m && m.name) monsterNames.add(String(m.name).toLowerCase());
      if (m && m.id) monsterNames.add(String(m.id).toLowerCase().replace(/_/g, ' '));
      if (m && m.id) monsterNames.add(String(m.id).toLowerCase());
    }
  } catch (e) {}
  holder.monsterNames = monsterNames;
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: opts.days || daysNow(), manifest: undefined, sampleEvery: 30 }); });
  // NOTE (fixed 2026-10-19, run ordering): installDeathCapture runs inside
  // policy.setup, which the harness calls within runDays — AFTER loadGame, so
  // holder.monsterNames carries the real set (the feastgap probe's ordering).
  const endReason = Game.over ? (Game.villageLost ? 'village-lost' : 'over-other')
    : (result.gameDays >= (opts.days || daysNow()) ? 'survived' : (result.endReason || 'ended'));
  const attr = bare ? null : FG.attributeDeaths(Game, C, monsterNames || new Set());
  let deathChannels = null;
  if (!bare && attr && attr.deaths) {
    deathChannels = {};
    for (const d of attr.deaths) {
      const ch = d.channel || 'other';
      deathChannels[ch] = (deathChannels[ch] || 0) + 1;
    }
  }
  let endBond = null;
  try { endBond = bare ? null : bondCensus(Game); } catch (e) { endBond = null; }
  let linkDump = null;
  try { linkDump = bare ? null : linkHistoryDump(Game); } catch (e) { linkDump = null; }
  let flowAgg = null;
  if (!bare && C.flows) {
    try {
      let trib = 0, tribN = 0, tend = 0, tendN = 0, feast = 0;
      const feastDays = [];
      for (const f of C.flows) {
        if (f.kind === 'tribute') { trib += f.paid; tribN++; }
        else if (f.kind === 'tend') { tend += f.paid; tendN++; }
        else if (f.kind === 'feast' && f.paid > 0) { feast++; feastDays.push(f.day); }
      }
      flowAgg = { tributePaid: trib, tributeCalls: tribN, tendPaid: tend, tendCalls: tendN, feasts: feast, feastDays };
    } catch (e) { flowAgg = { error: String(e && e.message) }; }
  }
  let maxWave = C.maxWave;
  let gameDays = 0;
  try { gameDays = (Game.state.scholar || {}).day || 0; } catch (e) {}
  try {
    const endUw = (Game.unlockedWave ? Game.unlockedWave() : 1) | 0;
    if (endUw > maxWave) maxWave = endUw;
    if (maxWave >= 5 && C.wave5Day == null) C.wave5Day = gameDays;
    if (maxWave >= 4 && C.wave4Day == null) C.wave4Day = gameDays;
  } catch (e) {}
  const out = {
    seed, policyId, substrate: 'pre-seat-winside-novetrel',
    days: result.days, gameDays: result.gameDays, endReason,
    won: !!Game.won,
    maxRank: C.maxRank, national: C.nationalDay != null, nationalDay: C.nationalDay,
    table: !!C.everTable, exiled: !!C.exiled,
    maxWave, wave45: maxWave >= 4, wave5: maxWave >= 5,
    wave4Day: C.wave4Day, wave5Day: C.wave5Day,
    successions: C.successionDays.length,
    successionDays: C.successionDays,
    instrumentErrors: C.instrumentErrors | 0,
    deathsAttributed: attr ? { rawCount: attr.rawCount, attributedCount: attr.attributedCount, phantomCount: attr.phantomCount } : null,
    deathChannels,
    flows: bare ? [] : ((C.flows || []).map(f => [f.day, f.kind, f.paid])),
    flowAgg,
    beats: bare ? [] : (C.beats || []),
    bond: bare ? [] : C.bond,
    endBond, linkDump,
    hashes: C.hashes,
  };
  if (switchTimeOn()) out.switch2Gate = C.switch2Gate || null;
  if (!opts.noWrite) {
    const dir = path.join(evidDir(), policyId);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `s${seed}.json`), JSON.stringify(out, null, 1));
  }
  return out;
}

async function main() {
  if (process.env.DET === '1') {
    const dseeds = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [64201, 64202]).filter(Number.isFinite);
    const odays = process.env.DAYS; process.env.DAYS = '60';
    let ok = true;
    for (const seed of dseeds) {
      for (const policyId of POLICIES) {
        process.env.SEASONBLOCK_BARE = '1';
        const b1 = await runOne(seed, policyId, { noWrite: true });
        const b2 = await runOne(seed, policyId, { noWrite: true });
        delete process.env.SEASONBLOCK_BARE;
        const c1 = await runOne(seed, policyId, { noWrite: true });
        const c2 = await runOne(seed, policyId, { noWrite: true });
        const hb1 = b1.hashes.join('|'), hb2 = b2.hashes.join('|');
        const hc1 = c1.hashes.join('|'), hc2 = c2.hashes.join('|');
        const pass = hb1 === hb2 && hc1 === hc2 && hb1 === hc1;
        console.log(`  DET s${seed} ${policyId}: ${pass ? 'PASS' : 'FAIL'} (bare-stable=${hb1 === hb2} census-stable=${hc1 === hc2} identical=${hb1 === hc1}, ${b1.hashes.length} days)`);
        if (!pass) ok = false;
      }
    }
    if (odays === undefined) delete process.env.DAYS; else process.env.DAYS = odays;
    console.log(ok ? 'DET: ALL PASS' : 'DET: FAILURES — instrument perturbs the trajectory');
    process.exit(ok ? 0 : 1);
  }
  if (process.env.FIDELITY === '1') {
    const fseeds = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [64201, 64202]).filter(Number.isFinite);
    let ok = true;
    for (const seed of fseeds) {
      for (const policyId of POLICIES) {
        const p = path.join(evidDir(), policyId, `s${seed}.json`);
        if (!fs.existsSync(p)) { console.log(`  FIDELITY s${seed} ${policyId}: SKIP (no per-seed file)`); continue; }
        const before = fs.readFileSync(p, 'utf8');
        await runOne(seed, policyId);
        const after = fs.readFileSync(p, 'utf8');
        const pass = before === after;
        console.log(`  FIDELITY s${seed} ${policyId}: ${pass ? 'PASS' : 'FAIL'}`);
        if (!pass) ok = false;
      }
    }
    console.log(ok ? 'FIDELITY: ALL PASS' : 'FIDELITY: FAILURES');
    process.exit(ok ? 0 : 1);
  }
  if (process.env.SMOKE === '1') {
    process.env.DAYS = process.env.DAYS || '30';
    const seeds = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [64201]).filter(Number.isFinite);
    for (const policyId of POLICIES) {
      const out = await runOne(seeds[0], policyId, { noWrite: true });
      const lastB = out.bond[out.bond.length - 1];
      const up = (lastB.links || []).filter(l => l.sub === 'haven' && l.st === 'active');
      console.log(`  SMOKE ${policyId} s${seeds[0]}: days=${out.gameDays} end=${out.endReason} bondrecs=${out.bond.length} upActive=${up.length} ` +
        up.map(l => `${l.prim}@age${l.age},trust${l.trust},seas${l.seasoned ? 1 : 0},rp${l.rplus ? 1 : 0},dip${l.dip},fires${l.fires}`).join(' | ') +
        ` beats=${out.beats.length} succ=${out.successionDays.length} ierr=${out.instrumentErrors} linksTotal=${(out.linkDump || []).length}`);
    }
    console.log('SMOKE: done');
    return;
  }
  // Full sweep.
  for (const policyId of POLICIES) {
    for (const seed of SEEDS) {
      const out = await runOne(seed, policyId);
      const nb = out.beats.filter(b => b.tag === 'bond-is-young').length;
      const upMax = Math.max(0, ...out.bond.map(b => (b.links || []).filter(l => l.sub === 'haven' && l.st === 'active').length));
      console.log(`  [${policyId} s${seed}] days=${out.gameDays} end=${out.endReason} won=${out.won} nat=${out.national} wave=${out.maxWave} table=${out.table} succ=${out.successionDays.length} beatsYoung=${nb} upMax=${upMax} ierr=${out.instrumentErrors}`);
    }
  }
  console.log('SWEEP: done');
}

module.exports = { policyFor: FG.policyFor, runOne, bondCensus, linkHistoryDump, installBeatCapture, installDeathCapture, SEEDS, POLICIES, EVID };

if (require.main === module) {
  main().catch(e => { console.error('PROBE CRASH:', e); process.exit(2); });
}
