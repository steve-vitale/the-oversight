#!/usr/bin/env node
// vetautopsy-analyze.js — WAVE-4 KILLER AUTOPSY attribution (flesh-out loop
// arm sim-vetautopsy, axis scale-onramp). PURE offline over the census corpus
// (evidence/2026-10-24/perseed-vetautopsy). Joins state.waveKillLog (w>=4)
// killer vids to the instrument's death rows, classifies each killer death
// into the pre-registered channel taxonomy, and judges the pre-registered
// DIAG-GO: >=90% of wave-4+ killer deaths fully attributed (named channel +
// mechanism evidence), remainder in the explicit "unexplained" bucket.
//
// Channel taxonomy (exclusive, pre-registered priority — see
// evidence/2026-10-24/sim-vetautopsy.md):
//   chair      — died as the mantle-holder (the office is the funnel)
//   combat     — non-mantle-holder combat-cause death (sub: vs-wave-4,
//                aid-crisis, raid, haven, contest, patrol, wild, expedition,
//                combat-other)
//   starvation — cause 'starvation'
//   disease    — windowstay DISEASE taxonomy (pool named)
//   wound      — wound/infection causes
//   other      — explicit fallback; raw cause listed
//   unexplained — no-death-row | cause-unknown | evidence-missing
//
// Writes evidence/2026-10-24/vetautopsy-attribution.json and prints the
// ranked channel table.
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = process.env.REPO || path.join(__dirname, '..');
const CORPUS = process.env.CORPUS || path.join(REPO, 'evidence', '2026-10-24', 'perseed-vetautopsy');

// Richness: count of non-null informative fields (dedup keeps the richest).
function richness(r) {
  let n = 0;
  for (const k of ['cause', 'wave', 'hp', 'armor', 'oppMid', 'oppWave', 'fightBasis', 'scholarVidAtDeath']) {
    if (r[k] !== null && r[k] !== undefined) n++;
  }
  return n;
}

// dedupDeathRows(rows): death teles re-emit (windowstay lesson #1) — dedup
// on (day, who, cause), keeping the richest row. Returns {rows, nCollapsed}.
function dedupDeathRows(rows) {
  const byKey = new Map();
  let nCollapsed = 0;
  for (const r of rows) {
    const k = [(r.day | 0), String(r.who || ''), String(r.cause || '')].join('|');
    const cur = byKey.get(k);
    if (!cur) { byKey.set(k, r); continue; }
    nCollapsed++;
    if (richness(r) > richness(cur)) byKey.set(k, r);
  }
  return { rows: Array.from(byKey.values()), nCollapsed };
}

// classifyDeathRow(row): PURE. Returns {channel, sub, why, evidenceOk, evidenceNote}.
function classifyDeathRow(row) {
  const cause = String((row && row.cause) || 'unknown');
  const lc = cause.toLowerCase();
  // 1. chair — the office is the funnel (pre-registered priority).
  if (row && row.mantleHolder) {
    const flags = [];
    if (row.pickedSuccessor) flags.push('picked-successor');
    if (row.bloodWindow14d) flags.push('in-14d-blood-window');
    if (row.combatCause) flags.push(row.oppMid ? `combat-vs-${row.oppWave != null ? row.oppWave : '?'}(${row.oppMid})` : 'combat-no-opp');
    return {
      channel: 'chair', sub: row.combatCause ? 'combat-context' : 'non-combat',
      why: 'died as mantle-holder' + (flags.length ? ' [' + flags.join(', ') + ']' : ''),
      evidenceOk: true, evidenceNote: 'mantle flags attached',
    };
  }
  // 2. combat — non-mantle-holder combat-cause death.
  if (row && row.combatCause) {
    const ctx = (row && row.ctx) || {};
    let sub = 'combat-other';
    if ((row.wave != null && row.wave >= 4) || (row.oppWave != null && row.oppWave >= 4)) sub = 'vs-wave-4';
    else if (ctx.aid) sub = 'aid-crisis';
    else if (/^raid/i.test(cause)) sub = 'raid';
    else if (/contest/i.test(cause)) sub = 'contest';
    else if (ctx.atHaven && lc === 'combat') sub = 'haven';
    else if (ctx.router === 'patrol') sub = 'patrol';
    else if (ctx.router === 'wild') sub = 'wild';
    else if (ctx.onExped) sub = 'expedition';
    // Linkage evidence: the windowstay cross-arm taxonomy treats ctx.atHaven +
    // combat-cause as a raid classification ('ctx:scholar-fight-at-haven') —
    // the ctx IS the evidence there. A 'contest' cause names the venue the
    // same way a monster name names the killer. Both count as mechanism
    // evidence (refinement of the pre-registered "e.g.", documented in the
    // evidence metric review; the DIAG-GO bar itself is unchanged).
    const hasLink = !!(row.oppMid || (row.fightBasis && row.fightBasis !== 'none') || ctx.aid || ctx.router || ctx.onExped || ctx.atHaven || /contest/i.test(cause));
    const monsterNamed = /the |[A-Z]/.test(cause) && lc !== 'combat' && lc !== 'villager combat';
    if (!hasLink && !monsterNamed) {
      return { channel: 'unexplained', sub: 'evidence-missing', why: 'combat cause but no fight linkage (no opp, no basis, no ctx)', evidenceOk: false, evidenceNote: 'missing' };
    }
    return {
      channel: 'combat', sub,
      why: `combat (${sub})` + (row.oppMid ? ` vs ${row.oppMid} (w${row.oppWave != null ? row.oppWave : '?'}, ${row.fightBasis})` : ''),
      evidenceOk: true, evidenceNote: row.oppMid ? 'opponent attached' : 'cause/ctx linkage',
    };
  }
  // 3. starvation.
  if (lc === 'starvation') {
    const v = (row && row.village) || {};
    const ok = v.hungryStreak !== -1 && v.hungryStreak != null;
    return {
      channel: ok ? 'starvation' : 'unexplained', sub: ok ? 'starved' : 'evidence-missing',
      why: ok ? `starvation (hungryStreak ${v.hungryStreak}, pantry ${v.pantry})` : 'starvation cause but starvation state unreadable',
      evidenceOk: ok, evidenceNote: ok ? 'starvation state attached' : 'missing',
    };
  }
  // 4. disease (instrument precomputed the windowstay taxonomy).
  if (row && row.disease) {
    return {
      channel: 'disease', sub: String(row.diseasePool || 'pool-unknown'),
      why: `disease: ${row.diseaseId || cause} (${row.diseasePool || 'pool-unknown'} pool)`,
      evidenceOk: !!row.diseaseId, evidenceNote: row.diseaseId ? 'disease id + pool attached' : 'missing',
    };
  }
  // 5. wound.
  if (/wound|infect/i.test(lc)) {
    return { channel: 'wound', sub: 'wound', why: 'wound/infection: ' + cause, evidenceOk: true, evidenceNote: 'raw cause' };
  }
  // 6. other — explicit fallback, raw cause listed.
  if (lc !== 'unknown' && lc !== '') {
    return { channel: 'other', sub: 'named-cause', why: 'other named cause: ' + cause, evidenceOk: true, evidenceNote: 'raw cause + village context' };
  }
  // 7. unexplained — cause unknown and nothing else to go on.
  return { channel: 'unexplained', sub: 'cause-unknown', why: 'cause unknown, no fight basis, not mantle-holder', evidenceOk: false, evidenceNote: 'missing' };
}

// attributeCorpus(corpusDir): PURE join. Returns the attribution object.
function attributeCorpus(corpusDir) {
  const rows = [];
  const errors = [];
  const files = [];
  if (fs.existsSync(corpusDir)) {
    for (const f of fs.readdirSync(corpusDir)) {
      if (/^s\d+-(lead|belong)\.json$/.test(f)) files.push(path.join(corpusDir, f));
    }
  }
  files.sort();
  let totalW4Kills = 0, totalCollapsed = 0, multiRowVids = 0, totalPhantoms = 0;
  const wall = { national: 0, table: 0, won: 0, wave4: 0, wave5: 0, survival: [], configs: 0 };
  for (const fp of files) {
    let d;
    try { d = JSON.parse(fs.readFileSync(fp, 'utf8')); }
    catch (e) { errors.push(path.basename(fp) + ': ' + String((e && e.message) || e)); continue; }
    if (!Array.isArray(d.waveKillLog) || !Array.isArray(d.deathRows)) {
      errors.push(path.basename(fp) + ': missing waveKillLog/deathRows (sensor failure)'); continue;
    }
    wall.configs++;
    if (d.national) wall.national++;
    if (d.table) wall.table++;
    if (d.won) wall.won++;
    if ((d.maxWave | 0) >= 4) wall.wave4++;
    if ((d.maxWave | 0) >= 5) wall.wave5++;
    if (Number.isFinite(d.days)) wall.survival.push(d.days);

    const w4k = d.waveKillLog.filter(e => e && (e.w | 0) >= 4 && e.by);
    totalW4Kills += w4k.length;

    // Killer index: vid -> kills.
    const killers = {};
    for (const k of w4k) {
      const by = String(k.by);
      (killers[by] = killers[by] || []).push({ d: (k.d | 0), mid: k.mid, w: (k.w | 0), via: k.via || null });
    }
    // Death index: person deaths by vid (deduped).
    const ded = dedupDeathRows(d.deathRows.filter(r => r && r.person));
    totalCollapsed += ded.nCollapsed;
    const deathByVid = {};
    for (const r of ded.rows) {
      const who = String(r.who || '');
      if (!who) continue;
      (deathByVid[who] = deathByVid[who] || []).push(r);
    }
    const pickedSet = new Set((d.successions || []).map(s => String(s.newId)));
    const pickedTrust = {};
    for (const s of (d.successions || [])) pickedTrust[String(s.newId)] = s.trust | 0;
    const finalRoster = new Set((d.finalRoster || []).map(String));
    // Phantom check (windowstay lesson #3): a person death row for a vid
    // still on the final roster is a phantom — excluded from the join, counted.
    for (const r of ded.rows) {
      if (r && r.who && finalRoster.has(String(r.who))) totalPhantoms++;
    }

    const cfg = {
      file: path.basename(fp), seed: d.seed, base: d.base,
      nW4Kills: w4k.length, nKillers: Object.keys(killers).length,
      anchorCommit: d.anchorCommit, endReason: d.endReason, days: d.days,
      killers: {},
    };
    for (const vid of Object.keys(killers)) {
      const kills = killers[vid].slice().sort((a, b) => a.d - b.d);
      const firstKill = kills[0].d;
      const lastKill = kills[kills.length - 1].d;
      const drows = (deathByVid[vid] || []).slice().sort((a, b) => a.day - b.day);
      if (drows.length > 1) multiRowVids++;
      const survived = finalRoster.has(vid);
      const pickedSuccessor = pickedSet.has(vid) && vid !== d.initialScholarVid;
      let outcome;
      if (survived) {
        outcome = { fate: 'survived', channel: null };
      } else if (!drows.length) {
        outcome = {
          fate: 'died', channel: 'unexplained', sub: 'no-death-row',
          why: 'killer vid absent from final roster with no joined death row',
          firstKill, bloodToDeath: null, evidenceOk: false,
        };
      } else {
        const dr = drows[drows.length - 1]; // the one that stuck
        // Attach autopsy flags before classification.
        dr.pickedSuccessor = pickedSuccessor;
        dr.succTrust = pickedTrust[vid] != null ? pickedTrust[vid] : null;
        dr.bloodToDeath = dr.day - firstKill;
        dr.bloodWindow14d = dr.bloodToDeath >= 0 && dr.bloodToDeath <= 14;
        const cls = classifyDeathRow(dr);
        outcome = {
          fate: 'died', channel: cls.channel, sub: cls.sub, why: cls.why,
          evidenceOk: cls.evidenceOk, evidenceNote: cls.evidenceNote,
          deathDay: dr.day, firstKill, lastKill, bloodToDeath: dr.bloodToDeath,
          bloodWindow14d: dr.bloodWindow14d, pickedSuccessor, succTrust: dr.succTrust,
          mantleHolder: !!dr.mantleHolder, playerRepaired: !!dr.playerRepaired,
          rawCause: dr.cause, deathWave: dr.wave,
          oppMid: dr.oppMid, oppWave: dr.oppWave, fightBasis: dr.fightBasis,
          hp: dr.hp, hpSource: dr.hpSource, armor: dr.armor,
          equippedKeys: dr.equippedKeys,
          disease: dr.disease, diseasePool: dr.diseasePool,
          national: dr.village ? dr.village.national : null,
          w5live: dr.village ? dr.village.w5live : null,
          scaleRank: dr.village ? dr.village.scaleRank : null,
          hungryStreak: dr.village ? dr.village.hungryStreak : null,
          pantry: dr.village ? dr.village.pantry : null,
          nDeathRows: drows.length,
        };
        if (dr.day < firstKill) {
          outcome.anomaly = 'death-before-first-kill';
          errors.push(`${cfg.file}/${vid}: death d${dr.day} before firstKill d${firstKill}`);
        }
      }
      cfg.killers[vid] = { nKills: kills.length, kills, outcome };
    }
    rows.push(cfg);
  }

  // Ranked channel table over killer deaths.
  const counts = {};
  const detail = [];
  let nKillerDeaths = 0, nSurvived = 0, nAttributed = 0, nUnexplained = 0;
  let nChair = 0, nBloodWindow = 0, bloodToDeaths = [];
  for (const r of rows) {
    for (const vid of Object.keys(r.killers)) {
      const o = r.killers[vid].outcome;
      if (o.fate === 'survived') { nSurvived++; continue; }
      nKillerDeaths++;
      counts[o.channel] = (counts[o.channel] || 0) + 1;
      if (o.channel === 'unexplained') nUnexplained++;
      else nAttributed++;
      if (o.channel === 'chair') nChair++;
      if (o.bloodWindow14d) nBloodWindow++;
      if (Number.isFinite(o.bloodToDeath)) bloodToDeaths.push(o.bloodToDeath);
      detail.push({
        config: r.file, seed: r.seed, base: r.base, vid,
        channel: o.channel, sub: o.sub, why: o.why,
        firstKill: o.firstKill, deathDay: o.deathDay, bloodToDeath: o.bloodToDeath,
        bloodWindow14d: !!o.bloodWindow14d, pickedSuccessor: !!o.pickedSuccessor,
        mantleHolder: !!o.mantleHolder, nKills: r.killers[vid].nKills,
        oppMid: o.oppMid, oppWave: o.oppWave, fightBasis: o.fightBasis,
        armor: o.armor, hp: o.hp, evidenceOk: !!o.evidenceOk,
      });
    }
  }
  const ranked = Object.keys(counts).map(channel => ({
    channel, n: counts[channel],
    share: nKillerDeaths ? Math.round((counts[channel] / nKillerDeaths) * 1000) / 10 : 0,
  })).sort((a, b) => b.n - a.n);
  const attributionRate = nKillerDeaths ? nAttributed / nKillerDeaths : 1;
  bloodToDeaths.sort((a, b) => a - b);
  const medianBloodToDeath = bloodToDeaths.length ? bloodToDeaths[Math.floor(bloodToDeaths.length / 2)] : null;
  const neverFormed = rows.filter(r => r.nKillers === 0).length;
  wall.survival.sort((a, b) => a - b);
  const medianSurvival = wall.survival.length ? wall.survival[Math.floor(wall.survival.length / 2)] : null;

  // Exposure vs conversion (the wallseg gap, measured as far as telemetry allows):
  // exposure = w4+ combat_start/aidFight rows with the vid in party (or scholarIn for 'p');
  // conversion = waveKillLog w4+ kills. Non-conversion outcomes are invisible — documented.
  return {
    corpus: corpusDir.replace(REPO + '/', ''),
    total: rows.length,
    totalW4Kills,
    nKillerDeaths, nSurvived, nAttributed, nUnexplained,
    attributionRate: Math.round(attributionRate * 1000) / 10,
    diagGo: nKillerDeaths > 0 && attributionRate >= 0.9,
    ranked,
    chairShare: nKillerDeaths ? Math.round((nChair / nKillerDeaths) * 1000) / 10 : 0,
    bloodWindowShare: nKillerDeaths ? Math.round((nBloodWindow / nKillerDeaths) * 1000) / 10 : 0,
    medianBloodToDeath,
    detail,
    neverFormedConfigs: neverFormed,
    formedConfigs: rows.length - neverFormed,
    totalCollapsedDupes: totalCollapsed,
    multiRowVids,
    totalPhantoms,
    wall: {
      national: wall.national, table: wall.table, won: wall.won,
      wave4: wall.wave4, wave5: wall.wave5, medianSurvival,
      maxSurvival: wall.survival.length ? wall.survival[wall.survival.length - 1] : null,
    },
    rows,
    instrumentErrors: errors,
  };
}

function main() {
  const a = attributeCorpus(CORPUS);
  const outPath = path.join(REPO, 'evidence', '2026-10-24', 'vetautopsy-attribution.json');
  fs.writeFileSync(outPath, JSON.stringify(a, null, 1) + '\n');
  console.log(`=== vetautopsy: ${a.total} configs, ${a.totalW4Kills} wave-4+ kills, killer deaths ${a.nKillerDeaths}, survived ${a.nSurvived} ===`);
  console.log(`attributed: ${a.nAttributed}/${a.nKillerDeaths} = ${a.attributionRate}% (DIAG-GO>=90: ${a.diagGo ? 'PASS' : 'NO'}) | unexplained: ${a.nUnexplained}`);
  console.log('--- ranked channels (killer deaths only) ---');
  for (const r of a.ranked) console.log(`  ${r.channel}: ${r.n} (${r.share}%)`);
  console.log(`chair share: ${a.chairShare}% | 14d-blood-window share: ${a.bloodWindowShare}% | median blood-to-death: ${a.medianBloodToDeath}d`);
  console.log(`never-formed: ${a.neverFormedConfigs}/${a.total} | collapsed dupes: ${a.totalCollapsedDupes} | multi-row vids: ${a.multiRowVids} | phantoms: ${a.totalPhantoms}`);
  console.log(`wall: national ${a.wall.national}/${a.total}, table ${a.wall.table}/${a.total}, won ${a.wall.won}/${a.total}, wave4 ${a.wall.wave4}/${a.total}, wave5 ${a.wall.wave5}/${a.total}, median survival ${a.wall.medianSurvival}d`);
  if (a.instrumentErrors.length) { console.log('ERRORS:'); for (const e of a.instrumentErrors) console.log('  ' + e); }
  console.log('wrote ' + outPath);
}

if (require.main === module) main();

module.exports = { attributeCorpus, classifyDeathRow, dedupDeathRows };
