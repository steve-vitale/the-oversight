#!/usr/bin/env node
// scripts/instrument-huntroster-b.js — HUNT-ROSTER GENERATION AUDIT (flesh-out
// loop B, 2026-10-17, arm sim-huntroster-b, sim-huntduty-b's named next #1).
//
// sim-huntduty-b proved hunt duties are NEVER assigned (0/672) because no
// policy asks — and measured ~0.6 hunter-competent villagers per 12-person
// roster via a coarse occupation word-match. This arm audits the
// ROSTER/GENERATION side: WHY is the hunting engagement substrate ~0.6/seed?
// Generation gap, measurement artifact, or canon-honest?
//
// INSTRUMENT HONESTY: the census is pure reads (roster, getPerson, data-table
// joins, the real Game.villagerCompetence called read-only — zero RNG draws,
// zero state writes). The daily observer wraps policy.daily read-only and
// calls through (huntduty-b's proven pattern); the beat ring and death
// instrument are huntduty-b's proven wraps. The det-gate in
// scripts/test-huntroster-b.js proves byte-identical trajectories.
//
// ZERO src/js, ZERO scripts/policies edits. Usage:
//   node scripts/instrument-huntroster-b.js
// Targeted: SEEDS="7701" POLICIES="leadfeast" DAYS=180 SMOKE=1 ...
'use strict';
const fs = require('fs');
const path = require('path');

// EXPLICIT substrate (task: FEASTSCALE_R13=1, SEATDRIVE=0 EXPLICIT).
process.env.FEASTSCALE_R13 = '1';
process.env.SEATDRIVE = '0';

const { belongfeast, leadfeast } = require('./policies/feastscale');
const { loadGame, setupGame, runDays, quietLog } = require('./sim-harness');

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s.trim(), 10)) : [7701, 7702, 7703, 7704, 7705, 7706, 7707, 7708]).filter(Number.isFinite);
const POLICIES = (process.env.POLICIES ? process.env.POLICIES.split(',').map(s => s.trim()) : ['leadfeast', 'belongfeast']);
const DAYS = parseInt(process.env.DAYS || '180', 10);
const SMOKE = process.env.SMOKE === '1';
const EFF_DAYS = SMOKE ? 12 : DAYS;
const EVID = path.join(__dirname, '..', 'evidence', '2026-10-17', 'perseed-huntroster');
const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };

// ---- hunter-competence definitions (the audit's subject) ----
// D1 COARSE14 / D2 COARSE12: sim-huntduty-b's word lists (the ~0.6 figure).
const COARSE14 = ['hunter', 'tracker', 'ranger', 'soldier', 'marine', 'poacher'];
const COARSE12 = ['butcher', 'farmer', 'athlete'];
// D3 ENGINE_COMP: the engine's own detector — Game.villagerCompetence(vid,'hunt').
// D4 PLUS20: villagerHuntResolve's hunter check: formerOccupation.includes('hunter').
// D5 SUBSTRATE_SKILL: design-intent hunter-capable — occupation grants a
//    hunt-relevant skill or knowsSnare (the trap system's hunter marker).
const HUNT_SKILLS = ['game_sense', 'tracker', 'patient_aim', 'field_dressing'];
// D6 KNOWLEDGE_HUNT: the knowledge system recognizes this occupation as
//    hunt-relevant (npcSeedSkills background route: track_read, animal_behavior,
//    snare_wire — pure data join, mirrors the engine's job.includes(bg)).
const HUNT_KNOWLEDGE_IDS = ['track_read', 'animal_behavior', 'snare_wire'];

const gday = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
const num = (x) => (typeof x === 'number' && Number.isFinite(x) ? x : null);
const low = (s) => String(s == null ? '' : s).toLowerCase();
const hasAny = (s, words) => words.some(w => low(s).includes(w));

function occDefOf(Game, p) {
  try {
    const occs = ((Game.data || {}).characterGen || {}).occupations || [];
    return occs.find(o => o.id === p.occupationId) || null;
  } catch (e) { return null; }
}

function huntKnowledgeBgs(Game) {
  // Cached per Game: lowercased backgrounds of the hunt knowledge entries.
  try {
    if (Game.__huntrosterKBgs) return Game.__huntrosterKBgs;
    const out = [];
    for (const k of (Game.data.knowledge || [])) {
      if (HUNT_KNOWLEDGE_IDS.indexOf(k.id) < 0) continue;
      for (const b of (k.backgrounds || [])) out.push(low(b));
    }
    Game.__huntrosterKBgs = out;
    return out;
  } catch (e) { return []; }
}

// rosterCensus(Game): PURE READS. Per roster member: identity, occupation,
// joined occupation-def traits, and all six hunter-competence definitions.
// No RNG, no writes.
function rosterCensus(Game) {
  const out = { roster: 0, members: [], occHist: {}, defs: null };
  const kbgs = huntKnowledgeBgs(Game);
  try {
    const v = Game.state.village || {};
    const roster = v.roster || [];
    const health = v.health || {};
    out.roster = roster.length;
    const d = { coarse14: 0, coarse12: 0, engine14: 0, engine12: 0, plus20: 0, substrateSkill: 0, knowledgeHunt: 0, hp40fail: 0 };
    for (const vid of roster) {
      let p = null;
      try { p = Game.getPerson(vid); } catch (e) {}
      if (!p || p.dead) continue;
      const occName = p.formerOccupation || p.occupation || '';
      const occ = occDefOf(Game, p) || {};
      const granted = (occ.granted || []).map(g => (typeof g === 'string' ? g : (g && g.id) || ''));
      const m = {
        vid: String(vid),
        name: p.name || '?',
        occName: String(occName),
        occId: p.occupationId || null,
        age: num(p.age),
        hp: (health[vid] !== undefined) ? health[vid] : 100,
        granted: granted.filter(Boolean),
        knowsSnare: !!occ.knowsSnare,
        teachTags: occ.teachTags || [],
        c14: hasAny(occName, COARSE14),
        c12: hasAny(occName, COARSE12),
        engineComp: null,
        plus20: low(occName).includes('hunter'),
        substrateSkill: granted.some(g => HUNT_SKILLS.indexOf(g) >= 0) || !!occ.knowsSnare,
        knowledgeHunt: kbgs.some(bg => low(occName).includes(bg)),
        backstory: String(p.backstory || '').slice(0, 400),
      };
      try {
        if (typeof Game.villagerCompetence === 'function') m.engineComp = Game.villagerCompetence(vid, 'hunt');
      } catch (e) {}
      if (m.c14) d.coarse14++;
      if (m.c12) d.coarse12++;
      if (m.engineComp === 1.4) d.engine14++;
      else if (m.engineComp === 1.2) d.engine12++;
      if (m.plus20) d.plus20++;
      if (m.substrateSkill) d.substrateSkill++;
      if (m.knowledgeHunt) d.knowledgeHunt++;
      if ((m.c14 || m.c12 || m.substrateSkill) && m.hp < 40) d.hp40fail++;
      const hk = m.occId || 'none';
      out.occHist[hk] = (out.occHist[hk] || 0) + 1;
      out.members.push(m);
    }
    out.defs = d;
  } catch (e) { out.error = String(e && e.message); }
  return out;
}

function attachDeathInstrument(Game, t) {
  t.deaths = [];
  try {
    const oTele = Game.tele ? Game.tele.bind(Game) : null;
    Game.tele = function (type, data) {
      const r = oTele ? oTele.apply(this, arguments) : undefined;
      try {
        if (type === 'death') {
          const cause = data && (data.cause == null ? null : String(data.cause));
          t.deaths.push({ day: gday(Game), who: data && data.who, cause, player: !!(data && data.player) });
        }
      } catch (e) { t.errors++; }
      return r;
    };
  } catch (e) { t.errors++; }
}

function attachBeatRing(Game, t) {
  t.beats = t.beats || [];
  try {
    const base = Game.say && Game.say.bind(Game);
    if (!base) { t.errors++; return; }
    const strip = (s) => String(s == null ? '' : s).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').slice(0, 400);
    Game.say = function (msg) {
      try {
        const s = strip(msg);
        if (/hunt|🏹|stalk|trapline|traps/i.test(s)) {
          t.beats.push({ day: gday(Game), text: s });
          if (t.beats.length > 2000) t.beats.splice(0, 400);
        }
      } catch (e) { t.errors++; }
      return base(msg);
    };
  } catch (e) { t.errors++; }
}

// attachRosterInstrument(Game, t): day-0 census + read-only daily observer
// (wall maxima + day-90 re-snapshot) + beat ring + death instrument.
// Sets Game.__huntroster (the RED marker: absent without the instrument).
function attachRosterInstrument(Game, t) {
  t.errors = t.errors || 0;
  Game.__huntroster = t; // RED marker only; det-gate proves trajectory-neutral
  attachDeathInstrument(Game, t);
  attachBeatRing(Game, t);
  t.census0 = rosterCensus(Game);
  t.census90 = null;
  t.hist = { maxRank: 0, table: false, exiled: false, starvedDays: 0, maxArc: 1, maxWave: 1, wins: false };
  t._observer = (G) => {
    try {
      const day = (G.state.scholar || {}).day || 0;
      const pg = G.progState ? G.progState() : {};
      if (pg.tableWaiting || pg.tableDone) t.hist.table = true;
      if (G.won) t.hist.wins = true;
      let rank = 'village';
      try { rank = (G.scaleRank ? G.scaleRank() : 'village') || 'village'; } catch (e) {}
      t.hist.maxRank = Math.max(t.hist.maxRank, RANK_ORDER[rank] || 0);
      if ((G.state.scholar || {}).exiled) t.hist.exiled = true;
      if ((((G.state || {}).village || {}).hungryDays || 0) > 0) t.hist.starvedDays++;
      try { const a = (((G.state || {}).scholar || {}).prog || {}).arc || 1; if (a > t.hist.maxArc) t.hist.maxArc = a; } catch (e) {}
      try { const w = G.unlockedWave ? (G.unlockedWave() | 0) : 1; if (w > t.hist.maxWave) t.hist.maxWave = w; } catch (e) {}
      if (day === 90 && !t.census90) t.census90 = rosterCensus(G);
    } catch (e) { t.errors++; }
  };
}

async function oneRun(seed, policyId) {
  const base = policyId === 'leadfeast' ? leadfeast : belongfeast;
  const { Game } = await loadGame({ seed, mode: 'huntroster-audit', fullTelemetry: false });
  await setupGame(Game);
  const policy = Object.assign({}, base);
  const t = { errors: 0 };
  attachRosterInstrument(Game, t);
  const oDaily = base.daily;
  policy.daily = (G, ctx) => {
    try { t._observer(G); } catch (e) { t.errors++; }
    if (oDaily) { try { return oDaily(G, ctx); } catch (e) { return undefined; } }
    return undefined;
  };
  let result;
  await quietLog(async () => { result = await runDays(Game, policy, { days: EFF_DAYS, sampleEvery: 30 }); });
  const days = num(result && result.days);
  // end-of-run: what were the hunter-substrate villagers doing? (final assignments, pure read)
  let finalDuties = [];
  try {
    const asg = (Game.state.village || {}).assignments || {};
    for (const m of (t.census0.members || [])) {
      if (!(m.substrateSkill || m.c14 || m.c12)) continue;
      let alive = true;
      try { const p = Game.getPerson(m.vid); alive = !!(p && !p.dead); } catch (e) {}
      const a = asg[m.vid];
      finalDuties.push({ name: m.name, occ: m.occName, alive, duty: (a && a.task) || 'none' });
    }
  } catch (e) { t.errors++; }
  const out = {
    schema: 'huntroster-audit/1', seed, policy: policyId, days, errors: t.errors,
    census0: t.census0, census90: t.census90, finalDuties,
    deaths: t.deaths, beats: t.beats,
    wall: {
      maxRank: t.hist.maxRank, table: t.hist.table, wins: t.hist.wins, exiled: t.hist.exiled,
      starvedDays: t.hist.starvedDays, maxArc: t.hist.maxArc, maxWave: t.hist.maxWave,
    },
  };
  out.schemaClean = !!(out.census0 && out.census0.defs && out.wall && Array.isArray(out.deaths));
  return out;
}

// ---- per-seed panel-schema JSON (wall metrics + census) ----
function panelRow(r) {
  const deathCauses = {};
  for (const d of (r.deaths || [])) {
    const c = (d.cause || 'unknown');
    deathCauses[c] = (deathCauses[c] || 0) + 1;
  }
  return {
    schemaVersion: 1, schema: 'huntroster-wall/1', seed: r.seed, policy: r.policy,
    substrate: 'courtship FEASTSCALE_R13=1 SEATDRIVE=0', days: r.days,
    metrics: {
      national: r.wall.maxRank >= 2 ? 1 : 0,
      table: r.wall.table ? 1 : 0,
      wins: r.wall.wins ? 1 : 0,
      maxArc: r.wall.maxArc, maxWave: r.wall.maxWave,
      exiled: r.wall.exiled ? 1 : 0,
      starvedDays: r.wall.starvedDays,
      deaths: (r.deaths || []).length,
      deathCauses,
    },
    rosterCensus: {
      day0defs: r.census0.defs,
      day0occHist: r.census0.occHist,
      day90defs: r.census90 ? r.census90.defs : null,
      hunterDuties: r.finalDuties,
    },
    huntBeats: (r.beats || []).slice(0, 60),
  };
}

async function main() {
  fs.mkdirSync(EVID, { recursive: true });
  const rows = [];
  for (const pid of POLICIES) {
    for (const seed of SEEDS) {
      const r = await oneRun(seed, pid);
      fs.writeFileSync(path.join(EVID, `${pid}-${seed}.json`), JSON.stringify(r, null, 1));
      fs.writeFileSync(path.join(EVID, `wall-${pid}-${seed}.json`), JSON.stringify(panelRow(r), null, 1));
      rows.push(r);
      const d = r.census0.defs || {};
      console.log(`${pid}-${seed}: days=${r.days} roster=${r.census0.roster} coarse14=${d.coarse14} coarse12=${d.coarse12} eng14=${d.engine14} eng12=${d.engine12} plus20=${d.plus20} substrate=${d.substrateSkill} knowHunt=${d.knowledgeHunt} errors=${r.errors} schemaClean=${r.schemaClean}`);
    }
  }
  // aggregate occupation histogram
  const hist = {};
  for (const r of rows) for (const [k, n] of Object.entries(r.census0.occHist || {})) hist[k] = (hist[k] || 0) + n;
  console.log('\n=== occupation histogram (all seeds, day-0 rosters) ===');
  for (const k of Object.keys(hist).sort()) console.log(`  ${k}: ${hist[k]}`);
  // definition totals
  const tot = { coarse14: 0, coarse12: 0, engine14: 0, engine12: 0, plus20: 0, substrateSkill: 0, knowledgeHunt: 0 };
  let nRoster = 0;
  for (const r of rows) {
    nRoster += r.census0.roster || 0;
    for (const k of Object.keys(tot)) tot[k] += (r.census0.defs || {})[k] || 0;
  }
  console.log(`\n=== definitions across ${rows.length} runs, ${nRoster} roster members ===`);
  for (const k of Object.keys(tot)) console.log(`  ${k}: ${tot[k]} (${(tot[k] / rows.length).toFixed(2)}/seed)`);
  // wall
  const wall = { national: 0, table: 0, wins: 0, maxWave4: 0, maxWave5: 0 };
  const surv = [];
  for (const r of rows) {
    if (r.wall.maxRank >= 2) wall.national++;
    if (r.wall.table) wall.table++;
    if (r.wall.wins) wall.wins++;
    if (r.wall.maxWave >= 4) wall.maxWave4++;
    if (r.wall.maxWave >= 5) wall.maxWave5++;
    if (r.days != null) surv.push(r.days);
  }
  surv.sort((a, b) => a - b);
  const med = surv.length ? surv[Math.floor(surv.length / 2)] : null;
  console.log(`\n=== wall (${rows.length} runs) === national=${wall.national} table=${wall.table} wins=${wall.wins} wave4=${wall.maxWave4} wave5=${wall.maxWave5} medianSurvival=${med}`);
  const err = rows.filter(r => r.errors > 0 || !r.schemaClean);
  console.log(`errors/schemaDirty: ${err.length}/${rows.length}`);
}

if (require.main === module) {
  main().catch(e => { console.error('FATAL', e); process.exit(1); });
}

module.exports = { rosterCensus, attachRosterInstrument, oneRun, panelRow, EVID, COARSE14, COARSE12, HUNT_SKILLS, HUNT_KNOWLEDGE_IDS };
