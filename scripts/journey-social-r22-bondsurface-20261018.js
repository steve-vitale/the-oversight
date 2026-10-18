#!/usr/bin/env node
// journey-social-r22-bondsurface-20261018.js — LEG 5 SOCIAL LIFE, r22.
// Pre-registration: evidence/2026-10-18/journey-social-r22.md (written BEFORE any fix).
// Leg question: do depth>=2 friendships and depth<=-1 rivalries get NARRATIVELY
// marked in conversation now (bondWarm/bondCold opener pools, bond-flavored
// grace)? Binding: M2 >=4/6 favorite/outsider transcript samples show a
// bond-colored line; M3 zero fabricated shared events; M4 >=5/6 transcripts
// meet the quality bar; M5 >=2/3 runs end 60d with >=5 alive.
// Leg question: with a MIXED policy (kind to 2 favorites, hostile to 2
// outsiders, neutral to the rest), do friendships and rivalries FORM across a
// full run — scholar<->villager AND villager<->villager — and does the game
// ever NARRATIVELY mark them?
// Binding: M1 >=1 scholar->favorite bond v>=50 in >=2/3 runs;
// M2 >=1 scholar->outsider bond v<=-25 OR (trust<=5 + >=1 grievance) in >=2/3;
// M3 >=1 NPC<->NPC pair crossing +-50 or -25 in >=1/3 runs;
// M4 6+ transcripts sense-read, GO if >=5/6 meet the quality bar;
// M5 guardrail >=2/3 runs end 60d with >=5 alive.
// Seeds 1501,1502,1503. DAYCAP=60. Policy "favorites" = competent base.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [1501, 1502, 1503]);
const DAYCAP = parseInt(process.env.DAYCAP || '60', 10);
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

const OUTDIR = path.join(ROOT, 'evidence', '2026-10-18');
let convoIdx = 0; // r22 fix: rotate the driven favorite instead of always index 0

// --- r22 bond-surface detection: signatures from the data pools ---
const _cg = JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'data', 'characterGen.json'), 'utf8'));
const _sig = (arr) => (arr || []).map(s => String(s).replace(/^"|"$/g, '').slice(0, 24));
const BOND_WARM_SIG = _sig((_cg.convo || {}).bondWarm);
const BOND_COLD_SIG = _sig((_cg.convo || {}).bondCold);
const BOND_BEAT_WARM_SIG = _sig((_cg.convo || {}).bondBeatWarm);
const BOND_BEAT_COLD_SIG = _sig((_cg.convo || {}).bondBeatCold);
const BOND_GRACE_SIG = ['long enough to let it pass', "doesn't flinch at one sharp word"];
function bondScan(transcript) {
  const npc = (transcript || []).filter(e => e && e.who === 'NPC').map(e => String(e.text || ''));
  return {
    warm: npc.some(t => BOND_WARM_SIG.some(s => s && t.indexOf(s) !== -1)),
    cold: npc.some(t => BOND_COLD_SIG.some(s => s && t.indexOf(s) !== -1)),
    beatWarm: npc.some(t => BOND_BEAT_WARM_SIG.some(s => s && t.indexOf(s) !== -1)),
    beatCold: npc.some(t => BOND_BEAT_COLD_SIG.some(s => s && t.indexOf(s) !== -1)),
    grace: npc.some(t => BOND_GRACE_SIG.some(s => t.indexOf(s) !== -1)),
  };
}
const TRDIR = path.join(OUTDIR, 'social-r22-transcripts');
for (const d of [OUTDIR, TRDIR]) { try { fs.mkdirSync(d, { recursive: true }); } catch (e) {} }

function vname(Game, vid) { try { return Game.displayName(vid) || String(vid); } catch (e) { return String(vid); } }
function safe(fn, dflt) { try { return fn(); } catch (e) { return dflt; } }
function roleOf(Game, vid) {
  try { const p = Game.getPerson ? Game.getPerson(vid) : null; return (p && (p.occupationId || p.formerOccupation)) || '?'; }
  catch (e) { return '?'; }
}

// --- natural-path conversation driver with a MODE (kind | hostile) ---
function driveOne(Game, vid, tag, mode, convoLog) {
  const day = safe(() => (Game.state.scholar || {}).day || 0, 0);
  const out = { vid, name: vname(Game, vid), tag, mode, day, turns: 0, naturalEnd: false, threads: [], transcript: [] };
  const seenThreads = new Set();
  const noteThread = () => {
    const t = safe(() => { const c = Game.convoGet(vid); return c && c.thread; }, null);
    if (t && !seenThreads.has(t)) { seenThreads.add(t); out.threads.push(String(t)); }
  };
  try { Game.startConvo(vid); } catch (e) { out.error = 'startConvo: ' + e.message; return out; }
  noteThread();
  for (let t = 0; t < 12; t++) {
    let c = null; try { c = Game.convoGet(vid); } catch (e) {}
    if (!c || !c.active) { out.naturalEnd = true; out.turns = t; break; }
    let choices = []; try { choices = Game.convoChoices(vid) || []; } catch (e) {}
    if (!choices.length) { out.naturalEnd = true; break; }
    const byId = (re) => choices.find(x => x && re.test(String(x.id || '')));
    let pick = null;
    const seenIds = out.pickedIds || (out.pickedIds = []);
    const fresh = (c) => c && !seenIds.includes(String(c.id || ''));
    if (mode === 'hostile') {
      // decline favors, pick cruel-tempter options, bail early
      pick = choices.find(x => x && String(x.temper || '') === 'cruel');
      if (!pick) pick = byId(/^dlg:cant$/);
      if (!pick) pick = byId(/^deflect_q$/);
      if (t >= 2) pick = pick || byId(/^(leave|bye|goodbye)/);
      if (!pick) pick = choices.find(x => x && !/^(leave|bye|goodbye)/.test(String(x.id || '')));
      if (!pick) pick = choices[0];
    } else {
      const ansChoices = choices.filter(x => x && /^ans:/.test(String(x.id || '')));
      if (ansChoices.length && !seenIds.some(id => /^ans:/.test(id)))
        pick = ansChoices.find(x => !/honest_pass/.test(String(x.id || ''))) || ansChoices[0];
      if (!pick) pick = choices.find(x => fresh(x) && String(x.temper || '') === 'kind');
      if (!pick) pick = choices.find(x => fresh(x) && /^(dlg:commit|dlg:help|dlg:details|want:|ask:)/.test(String(x.id || '')));
      if (!pick) pick = choices.find(x => x && /^(dlg:commit|dlg:help|dlg:details|want:|ask:)/.test(String(x.id || '')));
      if (!pick) pick = choices.find(x => fresh(x) && !/^(leave|bye|goodbye)/.test(String(x.id || '')));
      if (!pick) pick = choices.find(x => x && !/^(leave|bye|goodbye)/.test(String(x.id || '')));
      if (!pick) pick = choices[0];
    }
    if (!pick) break;
    seenIds.push(String(pick.id || ''));
    try { Game.convoTurn(vid, pick.id); } catch (e) { out.error = 'convoTurn: ' + e.message; break; }
    out.turns++;
    noteThread();
  }
  if (!out.naturalEnd && out.turns >= 12) { try { Game.endConvo(vid, 'left'); } catch (e) {} }
  noteThread();
  try {
    const c = Game.convoGet(vid);
    out.transcript = ((c && c.transcript) || []).map(e => ({
      who: e.who === 'you' ? 'YOU' : 'NPC', text: String(e.text || ''),
    }));
  } catch (e) {}
  // deflection density with the game's own pool
  try {
    let d = 0, n = 0;
    for (const e of out.transcript) {
      if (e.who !== 'NPC') continue; n++;
      if (Game.convoIsDeflectionLine && Game.convoIsDeflectionLine(e.text)) d++;
    }
    out.deflectShare = n ? +(d / n).toFixed(2) : 0;
  } catch (e) { out.deflectShare = 0; }
  if (convoLog) convoLog.push(out);
  return out;
}

async function oneSeed(seed) {
  const t0 = performance.now();
  const { Game, manifest } = await loadGame({ seed, mode: 'journey-social-r22', fullTelemetry: true });
  await setupGame(Game);
  const curDay = () => safe(() => (Game.state.scholar || {}).day || 0, 0);
  const me = () => safe(() => Game.villagerId, null);

  const beatBuf = [];
  Game.say = function (msg) {
    try { beatBuf.push({ day: curDay(), kind: 'say', text: String(msg == null ? '' : msg) }); if (beatBuf.length > 20000) beatBuf.shift(); } catch (e) {}
  };
  Game.sysSay = function (msg) {
    try { beatBuf.push({ day: curDay(), kind: 'sys', text: String(msg == null ? '' : msg) }); if (beatBuf.length > 20000) beatBuf.shift(); } catch (e) {}
  };

  const convoLog = [];
  const deaths = [];
  const seenCorpseIds = new Set();
  const crossings = [];            // bond threshold crossings {a,b,v,depth,day,kind}
  const seenCross = new Set();
  const bondHist = [];             // daily snapshots
  const npcBondPeaks = [];         // daily top NPC-NPC bonds
  const acts = { feeds: 0, thefts: 0, declines: 0, tends: 0, treats: 0, comforts: 0 };
  const favors = { picked: 0, declined: 0 };

  const livingIds = () => {
    const vv = Game.state.village || {};
    const sid = me();
    return (vv.roster || []).filter(id => {
      if (id === sid) return false;
      try { if ((Game.getPerson(id) || {}).dead) return false; } catch (e) {}
      return true;
    });
  };
  function trustOf(vid) { try { const t = (Game.state.village || {}).trust || {}; return t[vid] === undefined ? 10 : t[vid]; } catch (e) { return 10; } }
  function bondOf(a, b) { try { return Game.bondGet ? (Game.bondGet(a, b) || { v: 0, depth: 0 }) : { v: 0, depth: 0 }; } catch (e) { return { v: 0, depth: 0 }; } }

  function scanDeaths() {
    const corpses = safe(() => Game.corpses() || [], []);
    for (const cp of corpses) {
      if (!cp || seenCorpseIds.has(cp.id)) continue;
      seenCorpseIds.add(cp.id);
      const kind = cp.kind || '';
      if (kind !== 'person' && kind !== 'villager') continue;
      deaths.push({ name: cp.name || 'someone', role: cp.villagerId ? roleOf(Game, cp.villagerId) : '?',
        day: cp.dayDied || 0, cause: cp.cause || '?', killerName: cp.killerId ? vname(Game, cp.killerId) : null });
    }
  }

  // --- bond tracking: scholar<->all, plus NPC<->NPC peaks ---
  function scanBonds() {
    const day = curDay();
    const sid = me();
    const living = livingIds();
    const row = { day, scholar: {}, npcTop: [] };
    const crossed = (a, b, bnd) => {
      const v = bnd.v || 0, depth = bnd.depth || 0;
      for (const th of [25, 50, 75]) {
        const key = a + '|' + b + '|+' + th;
        if (v >= th && !seenCross.has(key)) { seenCross.add(key); crossings.push({ a: vname(Game, a), b: vname(Game, b), th, dir: '+', v, depth, day }); }
        const k2 = a + '|' + b + '|-' + th;
        if (v <= -th && !seenCross.has(k2)) { seenCross.add(k2); crossings.push({ a: vname(Game, a), b: vname(Game, b), th, dir: '-', v, depth, day }); }
      }
    };
    for (const vid of living) {
      const bnd = bondOf(sid, vid);
      row.scholar[vid] = { name: vname(Game, vid), v: bnd.v || 0, depth: bnd.depth || 0, trust: trustOf(vid) };
      crossed(sid, vid, bnd);
    }
    // NPC<->NPC: all pairs, keep top 5 by |v|
    const pairs = [];
    for (let i = 0; i < living.length; i++) for (let j = i + 1; j < living.length; j++) {
      const a = living[i], b = living[j];
      const bnd = bondOf(a, b);
      if (Math.abs(bnd.v || 0) >= 8) { pairs.push({ a, b, v: bnd.v, depth: bnd.depth || 0 }); crossed(a, b, bnd); }
    }
    pairs.sort((x, y) => Math.abs(y.v) - Math.abs(x.v));
    row.npcTop = pairs.slice(0, 5).map(p => ({ a: vname(Game, p.a), b: vname(Game, p.b), v: p.v, depth: p.depth }));
    bondHist.push(row);
  }

  function grievances() {
    try {
      const bs = Game.betrayalState ? Game.betrayalState() : {};
      return (bs.grievances || []).map(g => ({
        by: vname(Game, g.by), against: vname(Game, g.against),
        kind: g.kind, severity: g.severity, day: g.day,
      }));
    } catch (e) { return []; }
  }

  // --- the favorites/outsiders overlay ---
  const ctx2 = { favorites: null, outsiders: null };
  function pickFactions() {
    const living = livingIds();
    const byTrust = living.slice().sort((a, b) => trustOf(b) - trustOf(a));
    ctx2.favorites = byTrust.slice(0, 2);
    ctx2.outsiders = byTrust.slice(-2).reverse();
  }
  const isFav = (vid) => ctx2.favorites && ctx2.favorites.includes(vid);
  const isOut = (vid) => ctx2.outsiders && ctx2.outsiders.includes(vid);

  function kindnessRound() {
    const day = curDay();
    const sid = me();
    // favorites: feed, tend/treat, comfort, deep talk
    for (const vid of (ctx2.favorites || [])) {
      if (!livingIds().includes(vid)) continue;
      try {
        const needs = safe(() => Game.npcNeeds(vid) || {}, {});
        const s = Game.state.scholar || {};
        if ((needs.hunger || 0) > 30 && (s.kcal || 0) > 1200 && Game.giveFood) {
          const r = Game.giveFood(vid); if (r !== false) acts.feeds++;
        }
      } catch (e) {}
      try { if (Game.tendVillager) { const r = Game.tendVillager(vid); if (r !== false) acts.tends++; } } catch (e) {}
      try {
        const p = safe(() => Game.getPerson(vid) || {}, {});
        if ((p.grieving || p.mood === 'grieving')) {
          const o = driveOne(Game, vid, 'kind-grief', 'kind', convoLog);
          if (o.threads.includes('grief') || o.threads.includes('request')) acts.comforts++;
        }
      } catch (e) {}
    }
    // outsiders: steal every 5 days, never feed/comfort
    for (const vid of (ctx2.outsiders || [])) {
      if (!livingIds().includes(vid)) continue;
      if (day % 5 === 0 && day > 2 && Game.stealFrom) {
        try { const r = Game.stealFrom(vid); if (r) { acts.thefts++; } } catch (e) {}
      }
    }
    // driven conversations: favorite on even days, outsider on odd days (mode matches faction)
    const living = livingIds();
    const favAlive = (ctx2.favorites || []).filter(id => living.includes(id));
    const outAlive = (ctx2.outsiders || []).filter(id => living.includes(id));
    convoIdx++;
    if (day >= 3) {
      if (day % 2 === 0 && favAlive.length) {
        const o = driveOne(Game, favAlive[convoIdx % favAlive.length], 'kind-daily', 'kind', convoLog);
        if (o.transcript.some(e => /dlg:cant/.test(e.text))) favors.declined++;
      } else if (day % 2 === 1 && outAlive.length) {
        const o = driveOne(Game, outAlive[day % outAlive.length], 'hostile-daily', 'hostile', convoLog);
        if (o.transcript.some(e => /can't right now|Actually — I can't/.test(e.text))) favors.declined++;
      }
    }
  }

  const base = competent;
  const pol = Object.assign({}, base, {
    id: 'journey-social-r22-favorites',
    daily(Game2, ctx) {
      if (base.daily) base.daily(Game2, ctx);
      if (curDay() === 2 && !ctx2.favorites) pickFactions();
      if (ctx2.favorites) kindnessRound();
      scanBonds();
      scanDeaths();
    },
  });
  const result = await runDays(Game, pol, { days: DAYCAP, manifest });
  const ms = Math.round(performance.now() - t0);
  scanDeaths(); scanBonds();

  // write transcripts
  const trFiles = [];
  for (const o of convoLog) {
    const fn = `r22-s${seed}-d${o.day}-${o.mode}-${String(o.vid).slice(0, 12)}.txt`;
    const lines = [`CONVERSATION — seed ${seed} day ${o.day} [${o.mode}] ${o.name} (${o.vid}) tag=${o.tag}`, `threads: ${o.threads.join(', ')} | turns: ${o.turns} | naturalEnd: ${o.naturalEnd}`, '---'];
    for (const e of o.transcript) lines.push(`${e.who}: ${e.text}`);
    fs.writeFileSync(path.join(TRDIR, fn), lines.join('\n'));
    trFiles.push(fn);
    o.bondScan = bondScan(o.transcript);
  }
  const bondSurface = {
    warmConvos: convoLog.filter(o => o.bondScan && o.bondScan.warm).length,
    coldConvos: convoLog.filter(o => o.bondScan && o.bondScan.cold).length,
    beatWarmConvos: convoLog.filter(o => o.bondScan && o.bondScan.beatWarm).length,
    beatColdConvos: convoLog.filter(o => o.bondScan && o.bondScan.beatCold).length,
    graceBeats: convoLog.filter(o => o.bondScan && o.bondScan.grace).length,
    convos: convoLog.length,
    kindWarm: convoLog.filter(o => o.mode === 'kind' && o.bondScan && (o.bondScan.warm || o.bondScan.beatWarm)).length,
    hostileCold: convoLog.filter(o => o.mode === 'hostile' && o.bondScan && (o.bondScan.cold || o.bondScan.beatCold)).length,
  };

  const vv = Game.state.village || {};
  const fav = (ctx2.favorites || []).map(vid => ({ vid, name: vname(Game, vid), role: roleOf(Game, vid), bond: bondOf(me(), vid), trust: trustOf(vid) }));
  const out = (ctx2.outsiders || []).map(vid => ({ vid, name: vname(Game, vid), role: roleOf(Game, vid), bond: bondOf(me(), vid), trust: trustOf(vid) }));
  const allPairs = [];
  const living = livingIds();
  for (let i = 0; i < living.length; i++) for (let j = i + 1; j < living.length; j++) {
    const bnd = bondOf(living[i], living[j]);
    if (Math.abs(bnd.v || 0) >= 10) allPairs.push({ a: vname(Game, living[i]), b: vname(Game, living[j]), v: bnd.v, depth: bnd.depth || 0 });
  }
  allPairs.sort((x, y) => Math.abs(y.v) - Math.abs(x.v));

  const js = safe(() => Game.justiceState(), {}) || {};
  const outObj = {
    seed, daycap: DAYCAP, ms,
    endDay: curDay(), alive: (vv.roster || []).length, fallen: deaths.length,
    outcome: (result && result.outcome) || null, endReason: result ? result.endReason : null,
    factions: { favorites: fav, outsiders: out },
    crossings,
    bondHist,
    npcPairsTop: allPairs.slice(0, 10),
    grievances: grievances(),
    acts,
    convos: convoLog.length,
    naturalEnds: convoLog.filter(o => o.naturalEnd).length,
    deflectAvg: +(convoLog.reduce((t, c) => t + (c.deflectShare || 0), 0) / Math.max(1, convoLog.length)).toFixed(2),
    crimesByType: (() => { const m = {}; for (const c of (js.crimes || [])) m[c.type] = (m[c.type] || 0) + 1; return m; })(),
    justiceStage: safe(() => Game.justiceStage(), 0),
    deaths: deaths.slice(0, 30),
    census: {
      alive: living.map(id => ({ name: vname(Game, id), role: roleOf(Game, id), trust: trustOf(id), bond: bondOf(me(), id) })),
      dead: deaths,
    },
    transcripts: trFiles.length,
    bondSurface,
    // flat keys for telemetry-check
    'end.day': curDay(), 'end.alive': (vv.roster || []).length,
  };
  const fn = `journey-social-r22-per-seed-${seed}.json`;
  fs.writeFileSync(path.join(OUTDIR, fn), JSON.stringify(outObj, null, 1));
  console.log(`seed ${seed}: day ${outObj.endDay}, alive ${outObj.alive}, fallen ${outObj.fallen}, convos ${outObj.convos}, crossings ${crossings.length}, ms ${ms}`);
  return outObj;
}

(async () => {
  const all = [];
  for (const s of SEEDS) { all.push(await oneSeed(s)); }
  const agg = {
    seeds: SEEDS, daycap: DAYCAP, runs: all.length,
    m1: all.map(r => ({ seed: r.seed, favBonds: r.factions.favorites.map(f => ({ name: f.name, v: f.bond.v, depth: f.bond.depth, trust: f.trust })) })),
    m2: all.map(r => ({ seed: r.seed, outBonds: r.factions.outsiders.map(f => ({ name: f.name, v: f.bond.v, depth: f.bond.depth, trust: f.trust })), grievances: r.grievances.length })),
    m3: all.map(r => ({ seed: r.seed, npcPairs: r.npcPairsTop.slice(0, 3) })),
    m5: all.map(r => ({ seed: r.seed, endDay: r.endDay, alive: r.alive })),
    bondSurface: all.map(r => ({ seed: r.seed, ...r.bondSurface })),
    crossings: all.flatMap(r => r.crossings.map(c => ({ ...c, seed: r.seed }))),
  };
  fs.writeFileSync(path.join(OUTDIR, 'journey-social-r22-aggregate.json'), JSON.stringify(agg, null, 1));
  console.log('AGGREGATE written');
  for (const r of all) {
    console.log(`--- seed ${r.seed} favorites:`, JSON.stringify(r.factions.favorites.map(f => [f.name, f.bond.v, f.bond.depth, f.trust])));
    console.log(`--- seed ${r.seed} outsiders:`, JSON.stringify(r.factions.outsiders.map(f => [f.name, f.bond.v, f.bond.depth, f.trust])));
  }
  console.log('CROSSINGS:', JSON.stringify(agg.crossings, null, 1));
})().catch(e => { console.error('FATAL', e); process.exit(1); });
