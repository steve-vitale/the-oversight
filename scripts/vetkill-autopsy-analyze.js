#!/usr/bin/env node
// vetkill-autopsy-analyze.js — WAVE-4 KILLER AUTOPSY attribution (flesh-out
// loop arm sim-vetkill-autopsy, axis scale-onramp). PURE offline over the
// census corpus (evidence/2026-10-23/perseed-vetkill-autopsy). Reads the
// retained sensor streams the fresh census added: per-event wave-4+ kills
// from state.waveKillLog {d, mid, w, by, via} joined to per-villager death
// rows {day, who, kind, cause, wave, real} on vid.
//
// Named cause classes (pre-registered in the evidence header BEFORE any
// analysis):
//   combat-vs-wave-4  — died in combat (cause 'combat'/'villager combat') vs
//                       a wave-4+ monster (death-rec wave>=4), incl. same-fight
//   other-combat      — died in combat vs wave<4, wave unknown, or contests/aid
//   starvation        — cause 'starvation'
//   disease           — cause 'sickness' (mundane pool) or alien quirk death
//   wound             — cause naming a wound/infection
//   other             — explicit fallback; every unmapped raw cause is listed
//                       so >=90% attribution is HONEST (unmapped shows).
//
// The retention-lever read: share of killer deaths in combat channels
// (killer-mortality: they formed then died) vs configs with zero wave-4
// kills (never-formed: the village never fields killers at all).
//
// Writes evidence/2026-10-23/vetkill-autopsy-attribution.json and prints the
// ranked death-cause share table.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');
const CORPUS = process.env.CORPUS || path.join(REPO, 'evidence', '2026-10-23', 'perseed-vetkill-autopsy');

// classifyDeathCause(rec): map a death-row record to a named cause class.
// Pure function of {cause, wave, ctx} — unit-testable.
function classifyDeathCause(rec) {
  const cause = String((rec && rec.cause) || 'unknown').toLowerCase();
  const wave = (rec && rec.wave != null) ? (rec.wave | 0) : null;
  const via = ((rec && rec.ctx && rec.ctx.router) || '').toLowerCase();
  if (cause === 'combat' || cause === 'villager combat') {
    if (wave != null && wave >= 4) return { cls: 'combat-vs-wave-4', why: `combat vs wave-${wave}` };
    if (via === 'aidfight' || via === 'router:aid') return { cls: 'other-combat', why: 'combat (aid/raid channel)' };
    return { cls: 'other-combat', why: `combat vs wave-${wave == null ? 'unknown' : wave}` };
  }
  if (cause === 'starvation') return { cls: 'starvation', why: 'starvation' };
  if (cause === 'sickness') return { cls: 'disease', why: 'sickness (mundane pool)' };
  if (cause.indexOf('wound') >= 0 || cause.indexOf('infect') >= 0) return { cls: 'wound', why: cause };
  if (cause === 'dehydration') return { cls: 'other', why: 'dehydration (water, not food)' };
  return { cls: 'other', why: 'unmapped-cause:' + String(rec && rec.cause) };
}

// attributeCorpus(corpusDir): PURE join. Returns the attribution object.
function attributeCorpus(corpusDir) {
  const rows = [];
  const killersAll = {}; // vid -> {killCount, killDays:[], arm, seed}
  let totalW4Kills = 0;
  const arms = fs.existsSync(corpusDir) ? fs.readdirSync(corpusDir) : [];
  const errors = [];
  for (const arm of arms) {
    const dir = path.join(corpusDir, arm);
    if (!fs.statSync(dir).isDirectory()) continue;
    for (const f of fs.readdirSync(dir)) {
      if (!/^s\d+\.json$/.test(f)) continue;
      let d;
      try { d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); }
      catch (e) { errors.push(f + ': ' + String((e && e.message) || e)); continue; }
      const seed = d.seed;
      const log = Array.isArray(d.waveKillLog) ? d.waveKillLog : null;
      if (!log) { errors.push(`s${seed}/${arm}: missing waveKillLog (sensor failure)`); continue; }
      const w4k = log.filter(e => (e && e.w | 0) >= 4);
      totalW4Kills += w4k.length;
      const killers = {}; // vid -> kill events this config
      for (const k of w4k) {
        const by = k && k.by;
        if (!by) continue;
        (killers[by] = killers[by] || []).push({ d: (k.d | 0), mid: k.mid, via: k.via });
      }
      const scholarVid = d.scholarVid;
      // Death index for this config: real villager deaths keyed by vid.
      const deathByVid = {};
      for (const r of (d.deathRows || [])) {
        if (r.kind !== 'villager') continue;
        if (r.real === false) continue; // phantom (still on roster at end)
        const who = String(r.who || '');
        if (!who) continue;
        if (!deathByVid[who]) deathByVid[who] = [];
        deathByVid[who].push(r);
      }
      const row = {
        arm, seed, nW4Kills: w4k.length, nKillers: Object.keys(killers).length,
        scholarVid, killers: {},
      };
      for (const vid of Object.keys(killers)) {
        const kills = killers[vid];
        const deaths = deathByVid[vid] || [];
        const death = deaths.length ? deaths[deaths.length - 1] : null; // last = the one that stuck
        const isScholar = !!(scholarVid && (vid === scholarVid || vid === 'p' || vid === 'player'));
        let outcome;
        if (!death) {
          outcome = { fate: 'survived', cls: null, why: 'living at end of run' };
        } else {
          const cls = classifyDeathCause(death);
          const killDays = kills.map(k => k.d);
          const sameDay = killDays.indexOf(death.day) >= 0;
          const afterKill = Math.min.apply(null, killDays) <= death.day;
          outcome = {
            fate: 'died', cls: cls.cls, why: cls.why,
            deathDay: death.day, killDays,
            sameDayAsKill: sameDay, diedAfterKill: afterKill,
            rawCause: death.cause, deathWave: death.wave,
            player: !!death.player, isScholar,
          };
        }
        row.killers[vid] = { nKills: kills.length, kills: kills.map(k => ({ d: k.d, mid: k.mid, via: k.via })), outcome };
        const ka = killersAll[vid] || (killersAll[vid] = { n: 0, arms: {} });
        ka.n += 1; ka.arms[arm + '/s' + seed] = true;
      }
      rows.push(row);
    }
  }
  // Ranked cause table across ALL configs.
  const counts = { 'combat-vs-wave-4': 0, 'other-combat': 0, starvation: 0, disease: 0, wound: 0, other: 0 };
  const detail = [];
  let nKillerDeaths = 0, nAttributed = 0, nSurvived = 0, nScholarKillerDeaths = 0;
  for (const r of rows) {
    for (const vid of Object.keys(r.killers)) {
      const o = r.killers[vid].outcome;
      if (o.fate === 'survived') { nSurvived += 1; continue; }
      nKillerDeaths += 1;
      if (o.isScholar) nScholarKillerDeaths += 1;
      counts[o.cls] = (counts[o.cls] || 0) + 1;
      if (o.cls !== 'other') nAttributed += 1;
      detail.push({ arm: r.arm, seed: r.seed, vid, cls: o.cls, why: o.why, deathDay: o.deathDay, killDays: o.killDays, sameDayAsKill: o.sameDayAsKill, isScholar: o.isScholar, nKills: r.killers[vid].nKills });
    }
  }
  const ranked = Object.keys(counts).map(cls => ({
    cls, n: counts[cls],
    share: nKillerDeaths ? Math.round((counts[cls] / nKillerDeaths) * 1000) / 10 : 0,
  })).sort((a, b) => b.n - a.n);
  const attributionRate = nKillerDeaths ? nAttributed / nKillerDeaths : 1;
  const neverFormed = rows.filter(r => r.nKillers === 0).length;
  const combatDeaths = (counts['combat-vs-wave-4'] || 0) + (counts['other-combat'] || 0);
  return {
    corpus: corpusDir.replace(REPO + '/', ''),
    total: rows.length,
    totalW4Kills,
    distinctKillerVids: Object.keys(killersAll).length,
    nKillerDeaths, nSurvived, nAttributed,
    attributionRate: Math.round(attributionRate * 1000) / 10,
    diagGo: nKillerDeaths > 0 && attributionRate >= 0.9,
    ranked,
    detail,
    neverFormedConfigs: neverFormed,
    formedConfigs: rows.length - neverFormed,
    combatDeathShare: nKillerDeaths ? Math.round((combatDeaths / nKillerDeaths) * 1000) / 10 : 0,
    nScholarKillerDeaths,
    rows,
    instrumentErrors: errors,
  };
}

function main() {
  const a = attributeCorpus(CORPUS);
  const outPath = path.join(REPO, 'evidence', '2026-10-23', 'vetkill-autopsy-attribution.json');
  fs.writeFileSync(outPath, JSON.stringify(a, null, 1) + '\n');
  console.log(`=== vetkill-autopsy: ${a.total} configs, ${a.totalW4Kills} wave-4+ kills, ${a.distinctKillerVids} killer vids ===`);
  console.log(`killer deaths: ${a.nKillerDeaths}, survived: ${a.nSurvived}, attributed: ${a.attributionRate}% (DIAG-GO>=90: ${a.diagGo ? 'PASS' : 'NO'})`);
  console.log('--- ranked death-cause shares (killer deaths only) ---');
  for (const r of a.ranked) console.log(`  ${r.cls}: ${r.n} (${r.share}%)`);
  console.log(`never-formed configs: ${a.neverFormedConfigs}/${a.total} | scholar killer deaths: ${a.nScholarKillerDeaths}`);
  if (a.instrumentErrors.length) { console.log('ERRORS:'); for (const e of a.instrumentErrors) console.log('  ' + e); }
  console.log('wrote ' + outPath);
}

if (require.main === module) main();

module.exports = { attributeCorpus, classifyDeathCause };
