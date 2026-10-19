#!/usr/bin/env node
// scripts/sweep-dashboard.js — the tuning dashboard (2026-10-15).
//
// One reusable before/after sweep for lever work. Reports, per run and
// aggregated: won / sat / invited / Table path; village lost + day; median
// days; player and villager level-ups; player class recognised + day;
// subclasses seen (player + villager, out of 20); ascensions (and % of runs
// past day 100); wins with vs without a player ascension; deaths by cause;
// wave reach; Overtime tier, THE NETWORK summoned / fallen, THE HOSTS;
// keepsake levels; skills learned by teaching; the starting bearer's job.
//
// Observe-only: it wraps Game.tele / endDay and reads state. It never
// changes a decision, and it uses the shared kit (sweep-compare ->
// sim-harness). One seed per process (AGENTS.md).
//
//   node scripts/sweep-dashboard.js --label base [--n 64 | --seeds 7,42] [--days 150] [--par 3]
//        -> evidence/<today>/dashboard-<label>.json + dashboard-<label>.md
//   node scripts/sweep-dashboard.js --compare evidence/x/dashboard-a.json evidence/x/dashboard-b.json
//        -> prints a before/after markdown table
//   FORCE_OCC=<occupation id> forces the starting bearer's job (as sweep-buff.js).
//   SEED=7 node scripts/sweep-dashboard.js   -> one child run, one RESULT line
'use strict';
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const ROOT = path.join(__dirname, '..');
const STD16 = [7, 42, 99, 1234, 555, 777, 2026, 31337, 1, 2, 3, 4, 5, 6, 8, 9];
function seedList(n) {
  const extra = [];
  for (let s = 10; s <= 41; s++) extra.push(s);
  for (let s = 43; s <= 58; s++) extra.push(s);
  for (let s = 59; extra.length < 200; s++) extra.push(s);
  return STD16.concat(extra).slice(0, n);
}
function arg(name, dflt) { const i = process.argv.indexOf('--' + name); return i > 0 ? process.argv[i + 1] : dflt; }
function median(a) { if (!a.length) return 0; const s = a.slice().sort((x, y) => x - y); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; }
const sum = (rows, f) => rows.reduce((t, r) => t + (f(r) || 0), 0);
const count = (rows, f) => rows.filter(f).length;
const pct = (a, b) => b ? Math.round(100 * a / b) : 0;

// ---------------------------------------------------------------- child run
async function one() {
  const harness = require('./sim-harness');
  const C = {
    occ: undefined, pLU: 0, vLU: 0, classPlayerDay: null, classVillagers: new Set(),
    subP: {}, subV: {}, ascPlayer: 0, ascVillager: 0, ascPaths: [], ascPlayerDay: null,
    villageLostDay: null, tablePath: null, overtime: 0, netSummoned: false, netFallen: false, netLost: 0,
    hosts: false, ksMax: 0, ksWornMax: 0, lessons: 0, lessonsToPlayer: 0, lessonsByPlayer: 0,
    deathDays: [], lostCause: null, pTrack: {}, vTrack: {},
    force: { pOffered: 0, pPicked: 0, vOffered: 0, vPicked: 0 },
  };
  const _loadGame = harness.loadGame;
  harness.loadGame = async function () {
    const r = await _loadGame.apply(this, arguments);
    const G = r.Game;
    if (process.env.FORCE_OCC) {
      // Same as sweep-buff.js: only the FIRST genCharacter call's occupation
      // pool is swapped, so the RNG draw count and the rest of the cast match.
      const _gr = G.genRoster;
      G.genRoster = function () {
        const cg = G.data.characterGen || {};
        const all = cg.occupations || [];
        const want = all.find(o => o.id === process.env.FORCE_OCC);
        if (!want) throw new Error('FORCE_OCC: unknown occupation ' + process.env.FORCE_OCC);
        const _gc = G.genCharacter;
        let first = true;
        G.genCharacter = function () {
          if (!first) return _gc.apply(this, arguments);
          first = false;
          cg.occupations = [want];
          try { return _gc.apply(this, arguments); } finally { cg.occupations = all; }
        };
        try { return _gr.apply(this, arguments); } finally { G.genCharacter = _gc; }
      };
    }
    // FORCE_SUB=<path>/<subclass> (sim-only probe, 2026-10-15): every
    // level-up sheet (player and villagers, the one kitSheet) carries the
    // first unheld ability of that subclass, from any kit, in its last slot.
    // Tells "buried" (never offered) from "unwanted" (offered, not taken).
    let forceIds = null;
    if (process.env.FORCE_SUB) {
      const [fp, fs] = process.env.FORCE_SUB.split('/');
      const kits = ((G.data.tracks || {}).kits) || {};
      const inKit = new Set([].concat(...Object.values(kits)));
      const abil = G.data.abilities || [];
      forceIds = abil.filter(a => a && a.path === fp && a.subclass === fs && a.lane === 'magic' && inKit.has(a.id)).map(a => a.id);
      if (!forceIds.length) throw new Error('FORCE_SUB: no kit abilities for ' + process.env.FORCE_SUB);
      const _ks = G.kitSheet;
      G.kitSheet = function (cands, who, track, level) {
        const out = _ks.apply(this, arguments);
        try {
          if (!Array.isArray(out) || !out.length) return out;
          if (out.some(o => forceIds.indexOf(o.id) >= 0)) return out;
          const held = this._buildHeld ? this._buildHeld(who) : [];
          const id = forceIds.find(x => held.indexOf(x) < 0 && !out.some(o => o.id === x));
          if (!id) return out;
          out[out.length - 1] = abil.find(a => a.id === id);
          if (who === 'player' || who === G.villagerId) C.force.pOffered++; else C.force.vOffered++;
        } catch (e) { console.warn('[dashboard] force', e.message); }
        return out;
      };
    }
    const dayOf = () => (((G.state || {}).scholar || {}).day) || 0;
    const _tele = G.tele;
    G.tele = function (type, data) {
      try {
        const d = data || {};
        if (type === 'track_level') { if (d.who === 'player') { C.pLU++; C.pTrack[d.track] = (C.pTrack[d.track] || 0) + 1; } else { C.vLU++; C.vTrack[d.track] = (C.vTrack[d.track] || 0) + 1; } }
        else if (type === 'class_recognized') {
          const k = d.path + '/' + d.subclass;
          if (d.who === 'player') { if (C.classPlayerDay == null) C.classPlayerDay = dayOf(); C.subP[k] = (C.subP[k] || 0) + 1; }
          else { C.classVillagers.add(d.who); C.subV[k] = (C.subV[k] || 0) + 1; }
        } else if (type === 'ascension') {
          if (d.who === 'villager') C.ascVillager++; else { C.ascPlayer++; if (C.ascPlayerDay == null) C.ascPlayerDay = dayOf(); }
          C.ascPaths.push((d.who === 'villager' ? 'v:' : 'p:') + d.godhood);
        } else if (type === 'village_lost') { if (C.villageLostDay == null) C.villageLostDay = dayOf(); }
        else if (type === 'table_path') { if (!C.tablePath) C.tablePath = d.path || null; }
        else if (type === 'overtime_tier') C.overtime = Math.max(C.overtime, d.tier | 0);
        else if (type === 'network_summoned') C.netSummoned = true;
        else if (type === 'network_fallen') C.netFallen = true;
        else if (type === 'network_lost') C.netLost++;
        else if (type === 'table_won') { if (d.hosts) C.hosts = true; }
        else if (type === 'skill_lesson') { C.lessons++; if (d.learner === 'player') C.lessonsToPlayer++; if (d.teacher === 'player') C.lessonsByPlayer++; }
        else if (type === 'death' && d.player) C.deathDays.push(dayOf() + ':' + d.cause);
        if (forceIds) {
          if (type === 'ability_granted' && d.who === 'player' && forceIds.indexOf(d.id) >= 0) C.force.pPicked++;
          else if (type === 'villager_level_up' && d.pick && forceIds.indexOf(d.pick) >= 0) C.force.vPicked++;
        }
      } catch (e) { console.warn('[dashboard] tele', e.message); }
      return _tele.apply(this, arguments);
    };
    const _ed = G.endDay;
    G.endDay = function () {
      try {
        if (C.occ === undefined) { const p = G.getPerson && G.getPerson(G.villagerId); C.occ = (p && p.occupationId) || null; }
        const s = G.state.scholar || {};
        if (G.isKeepsake && G.keepsakeLevel) {
          for (const it of (s.inventory || [])) if (it && G.isKeepsake(it)) C.ksMax = Math.max(C.ksMax, G.keepsakeLevel(it) | 0);
          for (const it of Object.values(s.equipped || {})) if (it && G.isKeepsake(it)) { const l = G.keepsakeLevel(it) | 0; C.ksMax = Math.max(C.ksMax, l); C.ksWornMax = Math.max(C.ksWornMax, l); }
        }
      } catch (e) { console.warn('[dashboard] endDay', e.message); }
      return _ed.apply(this, arguments);
    };
    return r;
  };
  const { runComparison } = require('./sweep-compare');
  const seed = parseInt(process.env.SEED || '7', 10);
  const rep = await runComparison({
    label: 'dashboard', seeds: [seed], policies: [process.env.POLICY || 'capable'],
    days: parseInt(process.env.DAYS || '150', 10),
    extraMetrics: (Game) => {
      let pAbil = [];
      try { pAbil = ((Game.state.scholar || {}).abilities || []).map(a => (a && (a.id || a)) || '?'); } catch (e) { console.warn('[dashboard] abil', e.message); }
      return { villageLost: !!Game.villageLost, pAbil };
    },
  });
  const r = rep.runs[0];
  console.log('RESULT ' + JSON.stringify({
    seed, occ: C.occ || null, days: r.days, end: r.endReason, won: !!r.won, invited: !!r.table, sat: !!r.entered,
    tablePath: C.tablePath, villageLost: !!((r.extra || {}).villageLost) || /village/.test(String(r.endReason || '')),
    villageLostDay: C.villageLostDay, waveReach: r.waveReach,
    pLU: C.pLU, vLU: C.vLU, classPlayer: C.classPlayerDay != null, classPlayerDay: C.classPlayerDay,
    classVillagers: C.classVillagers.size, subP: C.subP, subV: C.subV,
    ascPlayer: C.ascPlayer, ascPlayerDay: C.ascPlayerDay, ascVillager: C.ascVillager, ascPaths: C.ascPaths,
    overtime: C.overtime, netSummoned: C.netSummoned, netFallen: C.netFallen, netLost: C.netLost, hosts: C.hosts,
    ksMax: C.ksMax, ksWornMax: C.ksWornMax,
    lessons: C.lessons, lessonsToPlayer: C.lessonsToPlayer, lessonsByPlayer: C.lessonsByPlayer,
    deaths: r.deaths, playerDeaths: C.deathDays, force: C.force, pTrack: C.pTrack, vTrack: C.vTrack, pAbil: (r.extra || {}).pAbil || [],
  }));
}

// ---------------------------------------------------------------- aggregate
function deathGroups(rows) {
  const g = { player: {}, villager: {}, other: {} };
  for (const r of rows) for (const [k, v] of Object.entries(r.deaths || {})) {
    const [kind, cause] = [k.slice(0, k.indexOf(':')), k.slice(k.indexOf(':') + 1)];
    const grp = kind === 'player' ? 'player' : kind === 'villager' ? 'villager' : 'other';
    g[grp][cause] = (g[grp][cause] || 0) + v;
  }
  return g;
}
function summarize(rows) {
  const n = rows.length;
  const subs = {}, subP = {}, subV = {};
  for (const r of rows) {
    for (const [k, v] of Object.entries(r.subP || {})) { subP[k] = (subP[k] || 0) + v; subs[k] = (subs[k] || 0) + v; }
    for (const [k, v] of Object.entries(r.subV || {})) { subV[k] = (subV[k] || 0) + v; subs[k] = (subs[k] || 0) + v; }
  }
  const long = rows.filter(r => r.days >= 100);
  const asc = rows.filter(r => r.ascPlayer > 0), noAsc = rows.filter(r => !(r.ascPlayer > 0));
  const tally = (f) => { const o = {}; for (const r of rows) { const k = f(r); if (k == null) continue; o[k] = (o[k] || 0) + 1; } return o; };
  const occ = {};
  for (const r of rows) { const k = r.occ || '?'; occ[k] = occ[k] || { runs: 0, won: 0, lost: 0 }; occ[k].runs++; if (r.won) occ[k].won++; if (r.villageLost) occ[k].lost++; }
  const pLU = rows.map(r => r.pLU || 0);
  const dg = deathGroups(rows);
  const pDeathRuns = {};
  for (const r of rows) { const seen = new Set(); for (const k of Object.keys(r.deaths || {})) if (k.startsWith('player:')) seen.add(k.slice(7)); for (const c of seen) pDeathRuns[c] = (pDeathRuns[c] || 0) + 1; }
  return {
    n,
    won: count(rows, r => r.won), sat: count(rows, r => r.sat), invited: count(rows, r => r.invited),
    tablePaths: tally(r => r.tablePath),
    villageLost: count(rows, r => r.villageLost), villageLostDayMed: median(rows.filter(r => r.villageLostDay != null).map(r => r.villageLostDay)),
    medDays: median(rows.map(r => r.days)),
    pLU: { med: median(pLU), min: Math.min.apply(null, pLU.concat([Infinity])), max: Math.max.apply(null, pLU.concat([0])) },
    pLU100med: median(long.map(r => r.pLU || 0)),
    vLUmean: +(sum(rows, r => r.vLU) / Math.max(1, n)).toFixed(1),
    classPlayerPct: pct(count(rows, r => r.classPlayer), n), classPlayerDayMed: median(rows.filter(r => r.classPlayerDay != null).map(r => r.classPlayerDay)),
    villagersClassed: sum(rows, r => r.classVillagers),
    subclassesSeen: Object.keys(subs).length, subclassesPlayer: Object.keys(subP).length, subclassesVillager: Object.keys(subV).length,
    subclasses: subs,
    ascPlayer: sum(rows, r => r.ascPlayer), ascPlayerRuns: asc.length, runs100: long.length,
    ascPlayerRuns100: count(long, r => r.ascPlayer > 0), asc100Pct: pct(count(long, r => r.ascPlayer > 0), long.length),
    ascVillager: sum(rows, r => r.ascVillager),
    gods: {}, // filled by fillGods
    winsAsc: count(asc, r => r.won), runsAsc: asc.length, winsNoAsc: count(noAsc, r => r.won), runsNoAsc: noAsc.length,
    deaths: dg, playerDeathRuns: pDeathRuns,
    deathTotals: { player: sum(Object.values(dg.player), x => x), villager: sum(Object.values(dg.villager), x => x), other: sum(Object.values(dg.other), x => x) },
    waveReach: tally(r => r.waveReach),
    overtime: tally(r => r.overtime), netSummoned: count(rows, r => r.netSummoned), netFallen: count(rows, r => r.netFallen), hosts: count(rows, r => r.hosts),
    keepsake: tally(r => r.ksMax), keepsakeWorn: tally(r => r.ksWornMax),
    lessonsMean: +(sum(rows, r => r.lessons) / Math.max(1, n)).toFixed(1),
    lessonsToPlayerMean: +(sum(rows, r => r.lessonsToPlayer) / Math.max(1, n)).toFixed(1),
    lessonsByPlayerMean: +(sum(rows, r => r.lessonsByPlayer) / Math.max(1, n)).toFixed(1),
    occ,
    force: ['pOffered', 'pPicked', 'vOffered', 'vPicked'].reduce((o, k) => { o[k] = sum(rows, r => (r.force || {})[k]); return o; }, {}),
    pTrack: (() => { const o = {}; for (const r of rows) for (const [k, v] of Object.entries(r.pTrack || {})) o[k] = (o[k] || 0) + v; return o; })(),
    vTrack: (() => { const o = {}; for (const r of rows) for (const [k, v] of Object.entries(r.vTrack || {})) o[k] = (o[k] || 0) + v; return o; })(),
    pAbil: (() => { const o = {}; for (const r of rows) for (const k of (r.pAbil || [])) o[k] = (o[k] || 0) + 1; return o; })(),
  };
}
function fillGods(s, rows) {
  const g = {};
  for (const r of rows) for (const p of (r.ascPaths || [])) g[p] = (g[p] || 0) + 1;
  s.gods = g;
  return s;
}

const fmtObj = (o) => Object.entries(o || {}).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(', ') || '-';
function headline(s) {
  return [
    ['Runs', s.n],
    ['Won / sat / invited', `${s.won} / ${s.sat} / ${s.invited}`],
    ['Wins: runs with player ascension', `${s.winsAsc}/${s.runsAsc}`],
    ['Wins: runs without', `${s.winsNoAsc}/${s.runsNoAsc}`],
    ['Village lost (median day)', `${s.villageLost} (${s.villageLostDayMed})`],
    ['Median days', s.medDays],
    ['Player level-ups med (min–max)', `${s.pLU.med} (${s.pLU.min}–${s.pLU.max})`],
    ['Player level-ups med, runs ≥100d', s.pLU100med],
    ['Villager level-ups / run', s.vLUmean],
    ['Player class recognised (median day)', `${s.classPlayerPct}% (${s.classPlayerDayMed})`],
    ['Villagers classed (sum)', s.villagersClassed],
    ['Subclasses seen (player / villager)', `${s.subclassesSeen}/20 (${s.subclassesPlayer} / ${s.subclassesVillager})`],
    ['Player ascension, runs ≥100d', `${s.ascPlayerRuns100}/${s.runs100} (${s.asc100Pct}%)`],
    ['Ascensions player / villager', `${s.ascPlayer} / ${s.ascVillager}`],
    ['Deaths player / villager / other', `${s.deathTotals.player} / ${s.deathTotals.villager} / ${s.deathTotals.other}`],
    ['Overtime ≥1 / Network summoned / fallen / HOSTS', `${s.n - ((s.overtime || {})[0] || 0)} / ${s.netSummoned} / ${s.netFallen} / ${s.hosts}`],
    ['Skill lessons / run (to / by player)', `${s.lessonsMean} (${s.lessonsToPlayerMean} / ${s.lessonsByPlayerMean})`],
  ];
}
function markdown(label, s, rows) {
  const L = [];
  L.push(`# Dashboard: ${label}`, '', `capable bot, ${rows.length} seeds, generated ${new Date().toISOString().slice(0, 10)}`, '');
  L.push('| Metric | Value |', '|---|---|');
  for (const [k, v] of headline(s)) L.push(`| ${k} | ${v} |`);
  L.push('', `- Table paths: ${fmtObj(s.tablePaths)}`);
  L.push(`- Subclasses: ${fmtObj(s.subclasses)}`);
  L.push(`- Gods: ${fmtObj(s.gods)}`);
  L.push(`- Player deaths by cause: ${fmtObj(s.deaths.player)}`);
  L.push(`- Runs with a player death by cause: ${fmtObj(s.playerDeathRuns)}`);
  L.push(`- Villager deaths by cause: ${fmtObj(s.deaths.villager)}`);
  L.push(`- Other deaths by cause: ${fmtObj(s.deaths.other)}`);
  if (process.env.FORCE_SUB) L.push(`- FORCE_SUB ${process.env.FORCE_SUB}: player offered ${s.force.pOffered} / picked ${s.force.pPicked}; villagers offered ${s.force.vOffered} / picked ${s.force.vPicked}`);
  L.push(`- Wave reach: ${fmtObj(s.waveReach)}`);
  L.push(`- Track level-ups, player: ${fmtObj(s.pTrack)}; villagers: ${fmtObj(s.vTrack)}`);
  L.push(`- Abilities held by the final bearer: ${fmtObj(s.pAbil)}`);
  L.push(`- Overtime tier: ${fmtObj(s.overtime)}`);
  L.push(`- Keepsake max level (any / worn): ${fmtObj(s.keepsake)} / ${fmtObj(s.keepsakeWorn)}`);
  L.push(`- Starting job (runs/won/lost): ${Object.entries(s.occ).sort((a, b) => b[1].runs - a[1].runs).map(([k, v]) => `${k} ${v.runs}/${v.won}/${v.lost}`).join(', ')}`);
  L.push('', '| seed | job | days | end | won | lost@ | pLU | vLU | class@ | asc | OT | wave | player deaths |', '|---|---|---|---|---|---|---|---|---|---|---|---|---|');
  for (const r of rows) L.push(`| ${r.seed} | ${r.occ} | ${r.days} | ${r.end} | ${r.won ? 'Y' : ''} | ${r.villageLostDay == null ? '' : r.villageLostDay} | ${r.pLU} | ${r.vLU} | ${r.classPlayerDay == null ? '' : r.classPlayerDay} | ${r.ascPlayer}/${r.ascVillager} | ${r.overtime} | ${r.waveReach} | ${(r.playerDeaths || []).join(' ')} |`);
  return L.join('\n') + '\n';
}
function compare(a, b, la, lb) {
  const ha = headline(a), hb = headline(b);
  const L = [`| Metric | ${la} | ${lb} |`, '|---|---|---|'];
  for (let i = 0; i < ha.length; i++) L.push(`| ${ha[i][0]} | ${ha[i][1]} | ${hb[i][1]} |`);
  const causes = new Set([...Object.keys(a.deaths.player), ...Object.keys(b.deaths.player)]);
  for (const c of causes) L.push(`| player death: ${c} | ${a.deaths.player[c] || 0} | ${b.deaths.player[c] || 0} |`);
  const vc = new Set([...Object.keys(a.deaths.villager), ...Object.keys(b.deaths.villager)]);
  for (const c of vc) L.push(`| villager death: ${c} | ${a.deaths.villager[c] || 0} | ${b.deaths.villager[c] || 0} |`);
  return L.join('\n');
}

// ---------------------------------------------------------------- driver
async function all() {
  const label = arg('label', 'unlabeled');
  const seeds = arg('seeds') ? arg('seeds').split(',').map(Number) : seedList(parseInt(arg('n', '64'), 10));
  const days = arg('days', process.env.DAYS || '150');
  const par = Math.min(3, parseInt(arg('par', '3'), 10)); // 4 CPUs: leave one free
  const rows = [];
  let next = 0;
  const runOne = (seed) => new Promise((resolve) => {
    const ch = spawn(process.execPath, [__filename], { env: Object.assign({}, process.env, { SEED: String(seed), DAYS: String(days) }), stdio: ['ignore', 'pipe', 'ignore'] });
    let buf = '';
    ch.stdout.on('data', d => { buf += d; });
    ch.on('close', () => {
      const line = buf.split('\n').find(l => l.startsWith('RESULT '));
      if (line) { const r = JSON.parse(line.slice(7)); rows.push(r); console.error(`[${label}] seed ${seed}: days=${r.days} won=${r.won} lost=${r.villageLost} pLU=${r.pLU} asc=${r.ascPlayer}/${r.ascVillager}`); }
      else console.error(`[${label}] seed ${seed}: NO RESULT`);
      resolve();
    });
  });
  const workers = [];
  for (let w = 0; w < par; w++) workers.push((async () => { while (next < seeds.length) { const s = seeds[next++]; await runOne(s); } })());
  await Promise.all(workers);
  rows.sort((a, b) => seeds.indexOf(a.seed) - seeds.indexOf(b.seed));
  const s = fillGods(summarize(rows), rows);
  const outDir = arg('out-dir', path.join(ROOT, 'evidence', new Date().toISOString().slice(0, 10)));
  fs.mkdirSync(outDir, { recursive: true });
  const base = path.join(outDir, 'dashboard-' + label);
  fs.writeFileSync(base + '.json', JSON.stringify({ label, days: +days, seeds, forceOcc: process.env.FORCE_OCC || null, forceSub: process.env.FORCE_SUB || null, summary: s, rows }, null, 1));
  const md = markdown(label, s, rows);
  fs.writeFileSync(base + '.md', md);
  console.log(md.split('\n').slice(0, 40).join('\n'));
  console.log('wrote ' + base + '.json/.md');
}

if (require.main === module) {
if (process.argv.includes('--compare')) {
  const i = process.argv.indexOf('--compare');
  const A = JSON.parse(fs.readFileSync(process.argv[i + 1], 'utf8')), B = JSON.parse(fs.readFileSync(process.argv[i + 2], 'utf8'));
  console.log(compare(A.summary, B.summary, A.label, B.label));
} else if (process.argv.includes('--label') || process.argv.includes('--n') || process.argv.includes('--seeds')) {
  all().catch(e => { console.error('FATAL', e); process.exit(1); });
} else {
  one().catch(e => { console.error('FATAL', e); process.exit(1); });
}
}
module.exports = { summarize, seedList, markdown, compare };
