// scripts/entrycensus-analyze-20261106.js
// sim-entrycensus-a: census past per-seed corpora for wave-4+ fight traces
// with entry HP < 100, and size how many RECORDED wave-4 kills may be
// 20-HP spawn artifacts (sim-congtrace-a follow-up: a wanderer-cast
// Congregation spawned at 20/20 HP and died to one strike on 53006 d149).
//
// READ-ONLY over evidence/. Never writes into the repo; writes the JSON
// table + markdown summary only to the --out path given (default /tmp).
// Usage:
//   node scripts/entrycensus-analyze-20261106.js [--root <repo-root>] [--out <json-path>]
//
// Scan design (see sim-entrycensus-a-prereg.md): 1047 perseed-* dirs /
// 21,750 JSON files is too large to fully parse, so:
//  Stage A: full JSON parse of files containing "entryHp" (the ONLY files
//    where entry-HP classification is possible) plus files containing
//    "traces" (to catch trace arrays that record no entry HP).
//  Stage B: regex extraction of waveKillLog/killsLive wave-4+ entries from
//    every file carrying a wave-4/5 marker, matched to Stage A traces by
//    (seed, day, mid).
//  Stage C: every perseed-* dir is enumerated; dirs with no marker file
//    are recorded as searched with zero wave-4 traces/kills.
// Derived files (basename contains analysis/summary) are skipped for
// counting — they re-state corpus traces and would double-count — and
// are listed separately.
//
// FIELD ALIASES (found live during the judged run's verification):
// the tbretreat/finishprobe-class recorders carry the entry max as
// entryMaxHpPrimary (TB rows) or worldHpAtLift.maxHp, not entryMaxHp;
// extractTraces resolves the max through those aliases (direct field
// wins). The kill matcher treats a 'kill-or-rout' row as the killing
// trace when a waveKillLog kill is logged for the same (seed, day, mid)
// — the log resolves the recorder's ambiguity. Both are reads of the
// fields the recorders actually wrote, not changes to the pre-decided
// classifier; see the proof test's alias fixtures (99722 d104, 99723
// d53, finishprobe d121/d113 shapes).
'use strict';
const fs = require('fs');
const path = require('path');

// Canonical HP bands from src/data/monsters.json (census time) and
// docs/MONSTER-WAVES.md (wave 4: 850-1500; wave 5: 1000-2200).
const CANON_HP = {
  congregation: [900, 1100], strike: [1000, 1200], influencer: [850, 1050],
  audit: [1100, 1300], reunion: [1200, 1400], suburb: [1300, 1500],
  eulogy: [900, 1100], algorithm: [1000, 1200], eater: [950, 1150],
  herald: [700, 900],
  cancellation: [1600, 2000], editor: [1500, 1900], rerun: [1200, 1500],
  spoiler: [1300, 1600], timeslot: [1400, 1700], nielsen: [1100, 1400],
  finale: [1800, 2200], finale_crew: [700, 900], finale_opening: [900, 1100],
  network_note: [1000, 1300],
  network_tower: [2400, 2800], network_limb: [3000, 3400], network_heart: [6000, 7000],
};
const CANON_WAVE = {
  congregation: 4, strike: 4, influencer: 4, audit: 4, reunion: 4, suburb: 4,
  eulogy: 4, algorithm: 4, eater: 4, herald: 4,
  cancellation: 5, editor: 5, rerun: 5, spoiler: 5, timeslot: 5, nielsen: 5,
  finale: 5, finale_crew: 5, finale_opening: 5, network_note: 5,
  network_tower: 6, network_limb: 6, network_heart: 6,
};

// Classifier — decided in the prereg before the judged census run.
// t: {mid, wave, entryHp, entryMaxHp, mids?}
// Returns {cls, reason}; cls in artifact | legitimate | unclassifiable | out-of-scope.
function classifyTrace(t) {
  const wave = (t.wave != null) ? t.wave : CANON_WAVE[t.mid];
  if (wave == null || wave < 4) return { cls: 'out-of-scope', reason: 'wave < 4 or unknown monster wave' };
  if (t.entryHp == null || t.entryMaxHp == null) {
    return { cls: 'unclassifiable', reason: 'no entry HP recorded (recorder gap: tbFights-only / field-fight row)' };
  }
  const band = CANON_HP[t.mid];
  if (t.entryMaxHp < 100) {
    // No band needed: every wave-4+ species has canonical low >= 700,
    // so a max HP below 100 is born-crippled whatever the species.
    return { cls: 'artifact', reason: 'entryMaxHp ' + t.entryMaxHp + ' far below canonical low ' + (band ? band[0] : '>=700 for every wave-4+ species') + ' (born crippled; || 20 fallback signature)' };
  }
  if (!band) return { cls: 'unclassifiable', reason: 'unknown monster id ' + t.mid + ', no canonical band' };
  const mids = (Array.isArray(t.mids) && t.mids.length) ? t.mids : [t.mid];
  let low = 0, high = 0;
  for (const m of mids) {
    const b = CANON_HP[m];
    if (!b) return { cls: 'unclassifiable', reason: 'pack member ' + m + ' has no canonical band' };
    low += b[0]; high += b[1];
  }
  if (t.entryMaxHp < low) {
    return { cls: 'unclassifiable', reason: 'entryMaxHp ' + t.entryMaxHp + ' below canonical low ' + low + ' but >= 100 — no known mechanism' };
  }
  if (t.entryMaxHp > 1.5 * high) {
    return { cls: 'unclassifiable', reason: 'entryMaxHp ' + t.entryMaxHp + ' above veteran max ' + (1.5 * high) };
  }
  if (t.entryHp >= t.entryMaxHp) {
    return { cls: 'legitimate', reason: 'full-health entry at canonical max ' + t.entryMaxHp };
  }
  return { cls: 'legitimate', reason: 'wounded entry ' + t.entryHp + '/' + t.entryMaxHp + ' at canonical max — designed world-HP grind carryover' };
}

// Bracket-match the array value after a "key": occurrence. Returns the
// substring including brackets, or null.
function extractArrayText(text, key) {
  const ki = text.indexOf('"' + key + '"');
  if (ki < 0) return null;
  const bi = text.indexOf('[', ki);
  if (bi < 0) return null;
  let depth = 0, inStr = false, esc = false;
  for (let i = bi; i < text.length; i++) {
    const c = text[i];
    if (inStr) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === '"') inStr = false; continue; }
    if (c === '"') { inStr = true; continue; }
    if (c === '[') depth++;
    else if (c === ']') { depth--; if (depth === 0) return text.slice(bi, i + 1); }
  }
  return null;
}

function field(chunk, name) {
  const m = chunk.match(new RegExp('"' + name + '":\\s*"([^"]*)"'));
  return m ? m[1] : null;
}
function numField(chunk, name) {
  const m = chunk.match(new RegExp('"' + name + '":\\s*(-?\\d+(?:\\.\\d+)?)'));
  return m ? Number(m[1]) : null;
}

// Extract flat {...} objects from an array substring.
function flatObjects(arrText) {
  if (!arrText) return [];
  const out = [];
  const re = /\{[^{}]*\}/g;
  let m;
  while ((m = re.exec(arrText)) !== null) out.push(m[0]);
  return out;
}

function extractKills(text, seed) {
  const kills = [];
  for (const [key, dayField, waveField] of [['waveKillLog', 'd', 'w'], ['killsLive', 'day', 'wave']]) {
    const arr = extractArrayText(text, key);
    if (!arr) continue;
    for (const chunk of flatObjects(arr)) {
      const w = numField(chunk, waveField);
      if (w == null || w < 4) continue;
      const day = numField(chunk, dayField);
      const mid = field(chunk, 'mid');
      if (day == null || !mid) continue;
      kills.push({ seed, day, mid, wave: w, by: field(chunk, 'by'), via: field(chunk, 'via'), src: key });
    }
  }
  return kills;
}

function countWaveRows(text, key, waveRe, extraRe) {
  const arr = extractArrayText(text, key);
  if (!arr) return 0;
  let n = 0;
  for (const chunk of flatObjects(arr)) {
    if (waveRe.test(chunk) && (!extraRe || extraRe.test(chunk))) n++;
  }
  return n;
}

// Extract tbFights rows (wave >= 4): the stageally-class recorders carry
// no entry HP, but a won row on (day, mid) still confirms a kill was a
// turn-based fight — it just cannot say what HP the beast entered at.
function extractTbRows(text) {
  const arr = extractArrayText(text, 'tbFights');
  if (!arr) return [];
  const rows = [];
  for (const chunk of flatObjects(arr)) {
    const wave = numField(chunk, 'wave');
    if (wave == null || wave < 4) continue;
    const day = numField(chunk, 'day');
    const mid = field(chunk, 'mid');
    if (day == null || !mid) continue;
    rows.push({ day, mid, wave, outcome: field(chunk, 'outcome') });
  }
  return rows;
}

// Entry-max resolution: the tbretreat/finishprobe-class recorders carry the
// entry max under ALIAS fields, not entryMaxHp:
//   - entryMaxHpPrimary (TB rows; the primary fighter's max)
//   - worldHpAtLift.maxHp (the world entity's max at lift)
// A trace born 20/20 records entryMaxHpPrimary 20 (99722 d104 Reunion,
// tbretreat-b baseline) while entryMaxHp is absent — reading only the
// direct field misclassifies it unclassifiable and misses an artifact
// kill. The aliases agree wherever two are present (20/20, 1200/1200,
// 1000/1000 on the rows checked); the direct field wins on conflict.
// defHpLo/defHpHi is the CANONICAL band, never the entry max.
function resolveEntryMax(el) {
  if (el.entryMaxHp != null) return { max: el.entryMaxHp, src: 'entryMaxHp' };
  if (el.entryMaxHpPrimary != null) return { max: el.entryMaxHpPrimary, src: 'entryMaxHpPrimary' };
  if (el.worldHpAtLift && el.worldHpAtLift.maxHp != null) return { max: el.worldHpAtLift.maxHp, src: 'worldHpAtLift.maxHp' };
  return { max: null, src: null };
}
function extractTraces(doc, relFile, seed) {
  const out = [];
  if (!doc || typeof doc !== 'object') return out;
  for (const [topKey, val] of Object.entries(doc)) {
    if (!Array.isArray(val)) continue;
    for (const el of val) {
      if (!el || typeof el !== 'object' || typeof el.entryHp !== 'number') continue;
      const wave = (el.wave != null) ? el.wave : CANON_WAVE[el.mid];
      if (wave == null || wave < 4) continue;
      const resolved = resolveEntryMax(el);
      const norm = Object.assign({}, el, { entryMaxHp: resolved.max });
      const c = classifyTrace(norm);
      out.push({
        file: relFile, corpus: topKey, seed,
        seq: el.seq != null ? el.seq : null, tbSeq: el.tbSeq != null ? el.tbSeq : null,
        day: el.day != null ? el.day : null, mid: el.mid, mids: el.mids || null,
        wave, entryHp: el.entryHp, entryMaxHp: resolved.max,
        maxSource: resolved.src,
        entryFrac: el.entryFrac != null ? el.entryFrac : null,
        outcome: el.outcome || null, ending: el.ending || null,
        rounds: el.rounds != null ? el.rounds : null,
        alliesAtEntry: el.alliesAtEntry != null ? el.alliesAtEntry : null,
        cls: c.cls, reason: c.reason,
      });
    }
  }
  return out;
}

function walkJsonFiles(dir, out) {
  if (!fs.existsSync(dir)) return;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walkJsonFiles(p, out);
    else if (ent.isFile() && ent.name.endsWith('.json')) out.push(p);
  }
}

function runCensus(root) {
  const evidenceDir = path.join(root, 'evidence');
  const perseedDirs = [];
  // Enumerate every perseed-* dir (Stage C coverage).
  for (const dateDir of fs.readdirSync(evidenceDir, { withFileTypes: true })) {
    if (!dateDir.isDirectory() || !/^\d{4}-\d{2}-\d{2}$/.test(dateDir.name)) continue;
    const dd = path.join(evidenceDir, dateDir.name);
    for (const ent of fs.readdirSync(dd, { withFileTypes: true })) {
      if (ent.isDirectory() && ent.name.startsWith('perseed-')) {
        perseedDirs.push(path.join(dd, ent.name));
      }
    }
  }
  const result = {
    meta: {
      arm: 'sim-entrycensus-a', generatedUtc: new Date().toISOString(),
      root, perseedDirs: perseedDirs.length,
      method: 'Stage A: full parse of files containing "entryHp" or "traces". Stage B: regex extraction of waveKillLog/killsLive wave-4+ entries from files with wave-4/5 markers. Stage C: every perseed-* dir enumerated.',
    },
    canonHp: CANON_HP,
    filesScanned: 0, filesWithMarkers: 0, filesParsed: 0, parseErrors: [],
    derivedFilesSkipped: [],
    corpora: {}, // dir-rel -> stats
    traces: [], // all wave-4+ traces with entryHp
    kills: [], // all wave-4+ kill records (per file)
    tbRows: [], // all wave-4+ tbFights rows (per file)
    tbFightWave4Rows: 0, fieldFightWave4Rows: 0, fieldFightWave4Kills: 0,
  };
  const corpusStats = (relDir) => {
    if (!result.corpora[relDir]) {
      result.corpora[relDir] = { files: 0, filesWithMarkers: 0, traces: 0, lowEntryTraces: 0, artifactTraces: 0, killsW4: 0, tbFightW4Rows: 0, fieldW4Kills: 0 };
    }
    return result.corpora[relDir];
  };

  for (const dir of perseedDirs) {
    const relDir = path.relative(root, dir).split(path.sep).join('/');
    const files = [];
    walkJsonFiles(dir, files);
    for (const file of files) {
      const relFile = path.relative(root, file).split(path.sep).join('/');
      const base = path.basename(file);
      result.filesScanned++;
      const st = corpusStats(relDir);
      st.files++;
      if (/analysis|summary/i.test(base)) { result.derivedFilesSkipped.push(relFile); continue; }
      let text;
      try { text = fs.readFileSync(file, 'utf8'); } catch (e) { result.parseErrors.push({ file: relFile, error: 'read: ' + e.message }); continue; }
      const hasEntryHp = text.includes('"entryHp"');
      const hasTraces = text.includes('"traces"');
      const hasW4 = /"(w|wave)":\s*[45]\b/.test(text);
      const hasTb = text.includes('"tbFights"');
      if (!hasEntryHp && !hasTraces && !hasW4 && !hasTb) continue;
      result.filesWithMarkers++;
      st.filesWithMarkers++;
      const seedM = text.match(/"seed":\s*"?(\d+)/);
      const seed = seedM ? Number(seedM[1]) : null;
      // Stage B: kills + row counts (regex; works with or without a parse).
      const kills = extractKills(text, seed);
      for (const k of kills) { k.file = relFile; result.kills.push(k); st.killsW4++; }
      const tbRows = extractTbRows(text);
      for (const r of tbRows) { r.file = relFile; r.seed = seed; result.tbRows.push(r); }
      const tbN = tbRows.length;
      result.tbFightWave4Rows += tbN; st.tbFightW4Rows += tbN;
      const ffKills = countWaveRows(text, 'fights', /"wave":\s*([45]\b|[6-9]\b|\d\d)/, /"outcome":\s*"vKill"/);
      const ffRows = countWaveRows(text, 'fights', /"wave":\s*([45]\b|[6-9]\b|\d\d)/, null);
      result.fieldFightWave4Kills += ffKills; result.fieldFightWave4Rows += ffRows;
      st.fieldW4Kills += ffKills;
      // Stage A: full parse for entry-HP / trace files.
      if (hasEntryHp || hasTraces) {
        let doc;
        try { doc = JSON.parse(text); result.filesParsed++; }
        catch (e) { result.parseErrors.push({ file: relFile, error: 'parse: ' + e.message }); continue; }
        const trs = extractTraces(doc, relFile, seed);
        for (const t of trs) {
          result.traces.push(t); st.traces++;
          if (t.entryHp < 100) st.lowEntryTraces++;
          if (t.cls === 'artifact') st.artifactTraces++;
        }
      }
    }
  }

  // Match kills to kill-ending traces by (seed, day, mid).
  // Refined classes (a kill is SUSPECT only when matched to an artifact
  // trace; a match to a trace with entryHp >= 100 rules the 20-HP spawn
  // out by itself, since a born-20 beast can never enter at >= 100):
  //   trace-artifact            -> suspect kill (spawn-crippled)
  //   trace-legitimate          -> not suspect
  //   trace-entry100plus-not-kill -> not suspect (kill came from another
  //     fight the same day; the traced fight entered at >= 100)
  //   trace-unclassifiable-low  -> unresolvable (entry < 100, no max)
  //   trace-unclassifiable-high -> not suspect (entry >= 100, no max)
  //   tbfight-won-no-entryhp    -> unresolvable (tb fight confirmed, HP unknown)
  //   tbfight-present-not-won   -> unresolvable (tb fight recorded, not won)
  //   unresolvable-field-kill   -> unresolvable (field kill, no tb trace)
  //   unresolvable-no-trace     -> unresolvable (no fight record at all)
  const traceByKey = {};
  for (const t of result.traces) {
    if (t.seed == null || t.day == null) continue;
    const k = t.seed + '|' + t.day + '|' + t.mid;
    (traceByKey[k] = traceByKey[k] || []).push(t);
  }
  const tbWonKeys = new Set();
  const tbKeys = new Set();
  for (const r of result.tbRows) {
    if (r.seed == null) continue;
    const k = r.seed + '|' + r.day + '|' + r.mid;
    tbKeys.add(k);
    if (r.outcome === 'won') tbWonKeys.add(k);
  }
  for (const k of result.kills) {
    const key = k.seed + '|' + k.day + '|' + k.mid;
    const mts = traceByKey[key] || [];
    // The killing trace is the row whose ending is a kill — or, failing
    // that, a 'kill-or-rout' row for the same key. 'kill-or-rout' is the
    // recorder's own ambiguity about one fight; when a waveKillLog kill
    // IS logged for that (seed, day, mid), the log resolves it: the
    // fight ended in the kill. Without this fallback the tbretreat/
    // finishprobe recorders' kills never match their own fight rows
    // (99722 d104 Reunion 20/20, 1 round, 20 damage dealt — an artifact
    // kill the log proves and the row explains). A 'kill-or-rout' row is
    // only ever consulted while matching a logged kill, never on its own.
    const killTrace = mts.find((t) => t.ending === 'kill' || t.ending === 'vKill')
      || mts.find((t) => t.ending === 'kill-or-rout');
    if (killTrace) {
      k.match = 'trace-' + killTrace.cls;
      k.traceFile = killTrace.file;
      k.traceEntry = killTrace.entryHp + '/' + (killTrace.entryMaxHp != null ? killTrace.entryMaxHp : '?');
      if (killTrace.cls === 'unclassifiable') {
        k.match = killTrace.entryHp >= 100 ? 'trace-unclassifiable-high' : 'trace-unclassifiable-low';
      }
    } else if (mts.length) {
      const hi = mts.some((t) => t.entryHp >= 100);
      k.match = hi ? 'trace-entry100plus-not-kill' : 'trace-present-not-kill';
      k.traceFile = mts[0].file;
    } else if (tbWonKeys.has(key)) {
      k.match = 'tbfight-won-no-entryhp';
    } else if (tbKeys.has(key)) {
      k.match = 'tbfight-present-not-won';
    } else if (k.via === 'wild') {
      k.match = 'unresolvable-field-kill';
    } else {
      k.match = 'unresolvable-no-trace';
    }
  }
  // Trail analysis for unclassifiable low-entry traces (entryHp < 100, no
  // entryMaxHp): group all same-file+mid traces. If NO fight vs this type
  // in the whole run ever entered at >= 100, the beast(s) the village met
  // were never seen healthy — born crippled (artifact-by-trail), mechanism
  // unproven. If the type WAS seen healthy, the low row could be a
  // ground-down beast or a second crippled spawn — stays unclassifiable.
  const byFileMid = {};
  for (const t of result.traces) {
    const k = t.file + '|' + t.mid;
    (byFileMid[k] = byFileMid[k] || []).push(t);
  }
  for (const t of result.traces) {
    if (!(t.cls === 'unclassifiable' && t.entryHp < 100)) continue;
    const sibs = byFileMid[t.file + '|' + t.mid] || [];
    const maxEntry = Math.max.apply(null, sibs.map((s) => s.entryHp));
    const firstDay = Math.min.apply(null, sibs.map((s) => s.day));
    t.trail = {
      fightsVsType: sibs.length, maxEntryHpVsType: maxEntry,
      firstFightDayVsType: firstDay, isFirstFightVsType: t.day === firstDay,
    };
    if (maxEntry < 100) {
      t.trailCls = 'artifact-by-trail';
      t.trailReason = 'no fight vs ' + t.mid + ' in this run ever entered at >= 100 (max ' + maxEntry + ' over ' + sibs.length + ' fights) — never seen healthy, born crippled (spawn-bug class); spawn mechanism unproven';
    } else {
      t.trailCls = 'unclassifiable';
      t.trailReason = 'same type seen healthy in this run (max entry ' + maxEntry + ') — could be ground-down or a second crippled spawn; indistinguishable without entity identity';
    }
  }
  // Distinct suspect kills: (seed, day, mid) matched to an artifact trace.
  const suspect = new Map();
  for (const k of result.kills) {
    if (k.match === 'trace-artifact') {
      const key = k.seed + '|' + k.day + '|' + k.mid;
      if (!suspect.has(key)) suspect.set(key, { seed: k.seed, day: k.day, mid: k.mid, files: [], traceEntry: k.traceEntry });
      suspect.get(key).files.push(k.file);
    }
  }
  result.suspectKillsDistinct = [...suspect.values()];
  // Distinct kill events (seed, day, mid) across all files/ledgers, with
  // the strongest (most informative) match class per event. Caveat: the
  // same (seed,day,mid) in a baseline leg and a staged leg of one seed
  // are different trajectories and could in principle be two events; the
  // artifact-matched events below are single events re-recorded by
  // same-policy re-runs, verified by their identical trace.
  const MATCH_RANK = { 'trace-artifact': 0, 'trace-legitimate': 1, 'trace-unclassifiable-low': 2, 'trace-unclassifiable-high': 3, 'trace-entry100plus-not-kill': 4, 'tbfight-won-no-entryhp': 5, 'tbfight-present-not-won': 6, 'trace-present-not-kill': 7, 'unresolvable-field-kill': 8, 'unresolvable-no-trace': 9 };
  const events = new Map();
  for (const k of result.kills) {
    const key = k.seed + '|' + k.day + '|' + k.mid;
    if (!events.has(key)) events.set(key, { seed: k.seed, day: k.day, mid: k.mid, records: [], match: k.match });
    const ev = events.get(key);
    ev.records.push({ file: k.file, src: k.src, via: k.via, by: k.by, match: k.match });
    if (MATCH_RANK[k.match] < MATCH_RANK[ev.match]) ev.match = k.match;
  }
  result.killEventsDistinct = [...events.values()];
  result.lowEntryTraces = result.traces.filter((t) => t.entryHp < 100);
  result.artifactTraces = result.traces.filter((t) => t.cls === 'artifact');
  result.trailArtifactTraces = result.traces.filter((t) => t.trailCls === 'artifact-by-trail');
  const evByMatch = {};
  for (const ev of result.killEventsDistinct) evByMatch[ev.match] = (evByMatch[ev.match] || 0) + 1;
  result.summary = {
    perseedDirs: perseedDirs.length,
    filesScanned: result.filesScanned,
    filesWithMarkers: result.filesWithMarkers,
    filesParsed: result.filesParsed,
    tracesW4WithEntryHp: result.traces.length,
    lowEntryTraces: result.lowEntryTraces.length,
    artifactTraces: result.artifactTraces.length,
    trailArtifactTraces: result.trailArtifactTraces.length,
    killsW4RecordedPerFile: result.kills.length,
    killsMatchedArtifact: result.kills.filter((k) => k.match === 'trace-artifact').length,
    suspectKillsDistinct: result.suspectKillsDistinct.length,
    killsMatchedLegitimate: result.kills.filter((k) => k.match === 'trace-legitimate').length,
    killsUnresolvable: result.kills.filter((k) => String(k.match || '').startsWith('unresolvable') || String(k.match || '').startsWith('tbfight-') || String(k.match || '').startsWith('trace-present') || String(k.match || '').startsWith('trace-unclassifiable-low')).length,
    killsTracePresentNotKill: result.kills.filter((k) => k.match === 'trace-present-not-kill').length,
    tbFightWave4Rows: result.tbFightWave4Rows,
    fieldFightWave4Rows: result.fieldFightWave4Rows,
    fieldFightWave4Kills: result.fieldFightWave4Kills,
    killEventsDistinct: result.killEventsDistinct.length,
    killEventsByMatch: evByMatch,
  };
  return result;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const rootIdx = args.indexOf('--root');
  const outIdx = args.indexOf('--out');
  const root = rootIdx >= 0 ? args[rootIdx + 1] : path.resolve(__dirname, '..');
  const out = outIdx >= 0 ? args[outIdx + 1] : '/tmp/entrycensus-out.json';
  const res = runCensus(root);
  fs.writeFileSync(out, JSON.stringify(res, null, 2));
  console.log(JSON.stringify(res.summary, null, 2));
  console.log('wrote ' + out);
}

module.exports = { classifyTrace, CANON_HP, CANON_WAVE, extractTraces, extractKills, extractTbRows, runCensus };
