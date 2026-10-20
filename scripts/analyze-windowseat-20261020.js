#!/usr/bin/env node
// analyze-windowseat-20261020.js — window-death taxonomy for arm
// sim-windowseat (flesh-out loop run fleshout-20261020T2145Z, axis
// scale-onramp). DIAGNOSTIC.
//
// Reads evidence/2026-10-20/perseed-windowseat/<policy>/s<seed>.json
// (validated before aggregating — the w5census 0-byte lesson) and, per
// run, derives:
//   - windows: maximal contiguous deferral(5)-true windows with outcomes
//     released | died | won | horizon | regressed (the windowsurvive
//     attemptsOf logic, identical by construction, plus the 'won'
//     outcome — on the SEATDRIVE default-on substrate villages win
//     THROUGH the window via feared/light).
//   - windowDeaths: attributed person deaths inside ANY window, tagged
//     with the window's outcome, classified into the 9 wall classes:
//       contest / sealed-fight / kill-fight / raid / haven-encounter /
//       attrition / starvation / expedition / other
//   - the sealed-fight class answers backlog #695 (sealed-shape deaths)
//     — first-class, keyed on the engine's own noFlee mark (tbfight.noFlee),
//     not on narrative shape (the scholarsurvive d162 lesson: travel
//     blockage is not a seal).
//   - wall numbers: national/table/wins, wave 4-5 unlocks, median/max
//     survival, death-cause shares.
//
// Writes: evidence/2026-10-20/windowseat-corpus-summary.json and
//         evidence/2026-10-20/windowseat-taxonomy.md
// Usage: node scripts/analyze-windowseat-20261020.js
'use strict';
const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '..');
const EVID = path.join(REPO, 'evidence', '2026-10-20', 'perseed-windowseat');
const OUTD = path.join(REPO, 'evidence', '2026-10-20');

// ---------------------------------------------------------------------------
// The 9-class wall taxonomy.
//
// Precedence (documented — the analyzer also emits the overlap cross-tab
// so no question is double-counted silently):
//   contest        ctx.arena (state.arenaContest at death) OR cause==='contest'
//   sealed-fight   inTb && noFlee (the engine's seal mark; non-arena)
//   kill-fight     combatish && the dead person's own wave-4+ kill same day
//   raid           cause raid/raid-defense, OR combatish && raidNight && atHaven
//   starvation     cause starvation/starved/hunger
//   attrition      disease sets, dehydration/thirst/exposure, alien/alien_beam,
//                  'experiment' (food-trying deaths — Steve 2026-10-16 canon:
//                  villagers try unrevealed foods), "a wound that wouldn't close"
//   haven-encounter combatish && atHaven (non-raid — feast draws, scavengers)
//   expedition     combatish anywhere else (wild/patrol/aid-crisis/sortie)
//   other:<cause>  everything else — the cause is NAMED, so it is explained
//
// ONE DELIBERATE DIVERGENCE from the windowsurvive channel classifier
// (probe-windowsurvive-20261019.js): that classifier maps 'combat' +
// ctx.aid (aid-crisis) to the RAID channel. Here the raid class means
// defending Haven; aid-crisis combat happens away from Haven and reads
// 'expedition'. The diff is one rule, pinned in the proof fixture.
//
// atHaven for villager deaths is scholar-relative (the engine only exposes
// the scholar's location — the windowsurvive limitation, documented).
// Villager raid-class deaths therefore lean on cause + raid-night join;
// the rule is named per row.
const DISEASE_IDS = new Set(['gutrot', 'trichinosis', 'disease', 'lockjaw', 'wound_fever', 'trembles',
  'howlbelly', 'gristlefit', 'croakbelly', 'shellgut', 'witness_maw', 'flockmind',
  'eurika', 'east_nile', 'lemons']);
const DISEASE_RES = [/^sickness$/i, /food poisoning|bad belly|spoiled gut|poisoned/i,
  /^(wound fever|gut rot|tick fever)$/i];
const STARVATION = new Set(['starvation', 'starved', 'hunger']);
const ATTRITION = new Set(['sickness', 'dehydration', 'thirst', 'exposure',
  'alien', 'alien_beam', 'experiment', "a wound that wouldn't close"]);
const COMBAT_CAUSES = new Set(['combat', 'monster', 'raid', 'raid-defense', 'ambush',
  'expedition', 'patrol combat', 'aid-runner', 'sortie combat', 'the wild', 'hunting', 'injuries']);

function isCombatish(cause, nameSet) {
  const lc = String(cause || '').toLowerCase();
  if (COMBAT_CAUSES.has(cause)) return true;
  if (cause.startsWith('split-fight:')) return true;
  if (nameSet && nameSet.has(lc)) return true;
  return false;
}

function classifyWall(d, killDays, nameSet) {
  const cause = String(d.cause || 'unknown');
  const lc = cause.toLowerCase();
  const ctx = d.ctx || {};
  const combatish = isCombatish(cause, nameSet);
  if (ctx.arena || cause === 'contest') return ['contest', ctx.arena ? 'ctx:arenaContest' : 'cause'];
  if (ctx.inTb && ctx.noFlee) return ['sealed-fight', 'ctx:noFlee-fight'];
  if (combatish && killDays.has([d.who, d.day].join('|'))) return ['kill-fight', 'same-day-own-w4+-kill'];
  if (cause === 'raid' || cause === 'raid-defense') return ['raid', 'cause'];
  if (combatish && ctx.raidNight && ctx.atHaven) return ['raid', 'ctx:raid-night-at-haven'];
  if (STARVATION.has(lc)) return ['starvation', 'cause'];
  if (DISEASE_IDS.has(lc) || DISEASE_RES.some(re => re.test(cause)) || ATTRITION.has(lc))
    return ['attrition', cause === 'experiment' ? 'food-experiment' : 'cause'];
  if (combatish && ctx.atHaven) return ['haven-encounter', 'ctx:combat-at-haven'];
  if (combatish) return ['expedition', ctx.aid ? 'ctx:aid-crisis' : 'field-combat'];
  return ['other:' + cause, cause === 'unknown' ? 'cause-unmapped' : 'cause-named'];
}

// ---------------------------------------------------------------------------
// nameToWave — monsters.json lookup (names + ids + the 'unknown'
// descriptors, which expedDeath stamps as the death cause).
let NAME2WAVE = null, NAMESET = null;
function buildNameMaps() {
  NAME2WAVE = new Map(); NAMESET = new Set();
  try {
    const ms = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
    for (const m of (ms.monsters || ms)) {
      if (!m) continue;
      const w = (m.wave | 0) || null;
      for (const k of [m.name, m.id, m.id && String(m.id).replace(/_/g, ' '), m.unknown]) {
        if (!k) continue;
        const lc = String(k).toLowerCase();
        NAMESET.add(lc);
        if (w != null && !NAME2WAVE.has(lc)) NAME2WAVE.set(lc, w);
      }
    }
  } catch (e) { /* static data missing: lookups yield null, honestly */ }
}
function nameToWave(name) {
  if (!NAME2WAVE) buildNameMaps();
  return NAME2WAVE.get(String(name).toLowerCase()) ?? null;
}
function nameSet() {
  if (!NAMESET) buildNameMaps();
  return NAMESET;
}

// KILLER-WAVE JOIN: death tele's `wave` is null for person-kind deaths.
// Post-hoc routes: (1) monster-name/descriptor causes -> direct lookup;
// (2) combatish deaths -> the probe's fightStarts: latest fight-start with
// day <= death day. Best-effort, honestly nullable.
function joinKillerWave(rec) {
  const fights = (rec.fightStarts || []).slice().sort((a, b) => (a.day | 0) - (b.day | 0));
  const deaths = (((rec.deathsAttributed || {}).attributed) || []);
  const ns = nameSet();
  for (const d of deaths) {
    let kw = (d.wave != null) ? (d.wave | 0) : null, km = null, kv = null;
    const nm = nameToWave(d.cause);
    if (nm != null) { kw = nm; km = d.cause; kv = 'name-lookup'; }
    else if (isCombatish(d.cause, ns)) {
      let best = null;
      for (const f of fights) {
        if ((f.day | 0) <= (d.day | 0)) best = f; else break;
      }
      if (best) { kw = best.wave != null ? (best.wave | 0) : null; km = best.mid; kv = best.via; }
    }
    d.killerWave = kw; d.killerMid = km; d.killerVia = kv;
  }
  return deaths;
}

// The w5census 0-byte lesson: validate every per-seed file BEFORE
// aggregating; never trust a successful shell exit as proof the reads
// inside succeeded.
function loadValid() {
  const recs = [];
  const bad = [];
  for (const policyId of ['leadfeast', 'belongfeast']) {
    const dir = path.join(EVID, policyId);
    if (!fs.existsSync(dir)) { bad.push(`${policyId}/: MISSING DIR`); continue; }
    for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort()) {
      const p = path.join(dir, f);
      const stat = fs.statSync(p);
      if (stat.size === 0) { bad.push(`${policyId}/${f}: 0 BYTES`); continue; }
      let rec;
      try { rec = JSON.parse(fs.readFileSync(p, 'utf8')); }
      catch (e) { bad.push(`${policyId}/${f}: UNPARSEABLE (${e.message})`); continue; }
      if (!rec || !Array.isArray(rec.recs) || !rec.deathsAttributed) {
        bad.push(`${policyId}/${f}: INCOMPLETE (recs/deathsAttributed missing)`);
        continue;
      }
      if ((rec.instrumentErrors | 0) !== 0) bad.push(`${policyId}/${f}: NOTE instrumentErrors=${rec.instrumentErrors}`);
      recs.push(rec);
    }
  }
  return { recs, bad };
}

// Deferral-5 windows: maximal contiguous def5-true windows. Logic identical
// to analyze-windowsurvive-20261019.js (incl. the endRec boundary fix) so
// window definitions match. Outcomes on this substrate: died | won |
// released | regressed | horizon — 'won' is new here (villages win THROUGH
// the window via feared/light; on the pre-seat substrate this never fired).
function attemptsOf(rec) {
  const recs = (rec.recs || []).slice();
  if (rec.endRec && recs.length && (rec.endRec.d | 0) > (recs[recs.length - 1].d | 0)) recs.push(rec.endRec);
  const wins = [];
  let cur = null;
  for (const r of recs) {
    if (r.st && r.st.def5) {
      if (!cur) cur = { start: r.d, end: r.d, shortStart: ((r.st.short) || []).slice() };
      else { cur.end = r.d; cur.shortEnd = ((r.st.short) || []).slice(); }
    } else if (cur) { wins.push(cur); cur = null; }
  }
  if (cur) wins.push(cur);
  const endKind = rec.won ? 'won'
    : (rec.endReason === 'village-lost' || rec.endReason === 'pop-zero') ? 'died'
    : (rec.gameDays >= 180 || rec.endReason === 'survived') ? 'horizon' : 'died';
  const gameDays = rec.gameDays || 0;
  for (const w of wins) {
    if (rec.wave5Day != null && w.start <= rec.wave5Day && rec.wave5Day <= w.end + 1) w.outcome = 'released';
    else if (w.end >= gameDays) w.outcome = endKind === 'won' ? 'won' : endKind === 'horizon' ? 'horizon' : 'died';
    else w.outcome = 'regressed';
    w.len = w.end - w.start + 1;
  }
  return wins;
}

// attribute(rec): per-run attribution — windows, window deaths (inside ANY
// window, tagged by window outcome), the 9 wall classes, unexplained
// (the PRIMARY gate: 0 allowed).
function attribute(rec) {
  const deaths = joinKillerWave(rec); // adds killerWave/killerMid/killerVia
  const ns = nameSet();
  const killDays = new Set(((rec.kills || []).map(k => [String(k.by), k.day | 0].join('|'))));
  const attempts = attemptsOf(rec);
  const def5ever = attempts.length > 0;
  const firstDef5Day = def5ever ? Math.min(...attempts.map(w => w.start)) : null;
  const classified = [];
  for (const d of deaths) {
    const [wclass, rule] = classifyWall(d, killDays, ns);
    classified.push(Object.assign({}, d, { wclass, rule }));
  }
  // Window deaths: attributed deaths inside any window.
  const windowDeaths = [];
  for (const d of classified) {
    for (const w of attempts) {
      if (d.day >= w.start && d.day <= w.end) {
        windowDeaths.push(Object.assign({}, d, {
          windowStart: w.start, windowEnd: w.end, windowLen: w.len,
          windowDay: d.day - w.start + 1, windowOutcome: w.outcome,
        }));
        break;
      }
    }
  }
  windowDeaths.sort((a, b) => a.day - b.day);
  const gaps = [];
  for (let i = 1; i < windowDeaths.length; i++) gaps.push(windowDeaths[i].day - windowDeaths[i - 1].day);
  const otherDeaths = classified.filter(d => !windowDeaths.some(wd => wd.who === d.who && wd.day === d.day && wd.cause === d.cause));
  // UNEXPLAINED (PRIMARY gate — 0 allowed): who unverifiable (the probe's
  // unverifiable list — the death can't be confirmed against the roster),
  // or cause literally 'unknown' with nothing to classify by.
  const unverif = ((rec.deathsAttributed || {}).unverifiable || []);
  const unexplained = unverif.map(u => ({ who: u.who, day: u.day, cause: u.cause, why: 'who-unverifiable' }))
    .concat(classified.filter(d => d.wclass === 'other:unknown').map(d => ({ who: d.who, day: d.day, cause: d.cause, why: 'cause-unmapped-no-ctx' })));
  const end = (rec.endRec && rec.endRec.st) || {};
  return {
    seed: rec.seed, policyId: rec.policyId,
    def5ever, firstDef5Day, attempts,
    endDay: rec.gameDays, endReason: rec.endReason, won: !!rec.won, wonDay: rec.wonDay,
    national: !!rec.national, table: !!rec.table, tableDay: rec.tableDay, exiled: !!rec.exiled,
    maxWave: rec.maxWave, wave4Day: rec.wave4Day, wave5Day: rec.wave5Day,
    deathsTotal: classified.length, windowDeaths, windowDeathCount: windowDeaths.length,
    interDeathGaps: gaps, otherDeathCount: otherDeaths.length, otherDeaths,
    unexplained, unexplainedCount: unexplained.length,
    phantoms: ((rec.deathsAttributed || {}).phantomCount | 0) || 0,
    causeSpace: (rec.deathsAttributed || {}).causeSpace || {},
    r5term: { arm: end.armored, wpn: end.armed, trk: end.tricks, vet: end.vets, short: end.short, rdy: end.rdy },
    standingTerm: { raw: end.raw, cap: end.cap, war: end.war, dip: end.dip, plenty: end.plenty },
    pantryTerm: end.pantry, hungryTerm: end.hungryStreak,
  };
}

function main() {
  const { recs, bad } = loadValid();
  const n = recs.length;
  const atts = recs.map(attribute);
  const agg = (f) => atts.filter(f).length;
  const surv = atts.map(a => a.endDay).sort((a, b) => a - b);
  const median = surv.length ? surv[Math.floor(surv.length / 2)] : 0;
  const maxS = surv.length ? surv[surv.length - 1] : 0;

  const doorRuns = atts.filter(a => a.def5ever);
  const wd = [];
  for (const a of atts) for (const d of a.windowDeaths) wd.push(Object.assign({ seed: a.seed, policy: a.policyId }, d));
  const unexplainedTotal = atts.reduce((x, a) => x + a.unexplainedCount, 0);

  const byClass = {};
  const byClassOutcome = { died: {}, won: {}, other: {} };
  const byClassRole = { scholar: {}, villager: {} };
  for (const d of wd) {
    byClass[d.wclass] = (byClass[d.wclass] || 0) + 1;
    const ob = d.windowOutcome === 'died' ? 'died' : d.windowOutcome === 'won' ? 'won' : 'other';
    byClassOutcome[ob][d.wclass] = (byClassOutcome[ob][d.wclass] || 0) + 1;
    const rl = d.player ? 'scholar' : 'villager';
    byClassRole[rl][d.wclass] = (byClassRole[rl][d.wclass] || 0) + 1;
  }
  // Overlap cross-tab (precedence transparency): sealed deaths that were
  // also kill-day; raid deaths in noFlee fights; contest deaths with arena.
  const overlaps = {
    sealedOnKillDay: wd.filter(d => d.wclass === 'sealed-fight' && d.rule === 'same-day-own-w4+-kill').length,
    raidInNoFlee: wd.filter(d => d.wclass === 'raid' && d.ctx.noFlee).length,
    contestNoArena: wd.filter(d => d.wclass === 'contest' && !d.ctx.arena).length,
  };
  // Killer wave for combatish classes.
  const byWave = {};
  for (const d of wd) {
    if (!['raid', 'haven-encounter', 'expedition', 'sealed-fight', 'kill-fight'].includes(d.wclass)) continue;
    const w = d.killerWave != null ? 'w' + d.killerWave : 'unmapped';
    byWave[w] = (byWave[w] || 0) + 1;
  }
  const wdi = wd.map(d => d.windowDay);
  const wdiMean = wdi.length ? (wdi.reduce((x, y) => x + y, 0) / wdi.length) : 0;
  const gaps = [];
  for (const a of atts) gaps.push(...a.interDeathGaps);
  const gapMean = gaps.length ? gaps.reduce((x, y) => x + y, 0) / gaps.length : 0;
  const outcomes = {};
  for (const a of atts) for (const w of a.attempts) outcomes[w.outcome] = (outcomes[w.outcome] || 0) + 1;
  const windowLens = atts.flatMap(a => a.attempts.map(w => w.len)).sort((a, b) => a - b);
  const medLens = windowLens.length ? windowLens[Math.floor(windowLens.length / 2)] : 0;
  const causeUnion = {};
  for (const a of atts) for (const [c, k] of Object.entries(a.causeSpace)) causeUnion[c] = (causeUnion[c] || 0) + k;
  const vetShort = atts.filter(a => (a.r5term.short || []).includes('veterans')).length;
  const armorShort = atts.filter(a => (a.r5term.short || []).includes('armor')).length;

  const summary = {
    n, filesBad: bad,
    wall: {
      national: agg(a => a.national), table: agg(a => a.table), wins: agg(a => a.won),
      wave4: agg(a => a.maxWave >= 4), wave5: agg(a => a.wave5Day != null),
      medianSurvival: median, maxSurvival: maxS, exiled: agg(a => a.exiled),
    },
    door: { reached: doorRuns.length, windows: atts.reduce((x, a) => x + a.attempts.length, 0), outcomes, medianWindowLen: medLens },
    legsAtStall: { veteransShort: vetShort, armorShort, n },
    taxonomy: {
      windowDeaths: wd.length,
      byClass,
      byOutcome: byClassOutcome,
      byRole: byClassRole,
      killerWave: byWave,
      overlaps,
      when: { windowDayMean: Math.round(wdiMean * 10) / 10, interDeathGapMean: Math.round(gapMean * 10) / 10 },
      stateAtDeathMeans: null,
    },
    attribution: { unexplained: unexplainedTotal, phantoms: atts.reduce((x, a) => x + a.phantoms, 0) },
    causeSpace: causeUnion,
  };
  const num = (f) => { const xs = wd.map(f).filter(x => x != null && x >= 0); return xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : null; };
  summary.taxonomy.stateAtDeathMeans = {
    pantryKcal: num(d => d.stateAtDeath && d.stateAtDeath.pantry),
    hungryStreak: num(d => d.stateAtDeath && d.stateAtDeath.hungryStreak),
    veteransLiving: num(d => d.stateAtDeath && d.stateAtDeath.vets),
    armored: num(d => d.stateAtDeath && d.stateAtDeath.armored),
    standingCap: num(d => d.stateAtDeath && d.stateAtDeath.cap),
  };
  const winRows = wd.map(d => [d.policy, d.seed, d.day, d.name, d.player ? 'SCHOLAR' : 'villager', d.wclass, d.cause,
    d.killerWave == null ? '—' : 'w' + d.killerWave + (d.killerVia ? '/' + d.killerVia : ''),
    'winDay' + d.windowDay + '/' + d.windowOutcome, d.rule].join(' | '));

  let md = `# sim-windowseat — window-death taxonomy on the SEATDRIVE default-on substrate\n\n`;
  md += `Runs: ${n} (8 fresh seeds 66001–66008 x {leadfeast, belongfeast}), substrate seatdrive-natural-win-side (SEATDRIVE unset=default-on, WINDEFER=1, no drivers).\n`;
  md += `Bad per-seed files: ${bad.length}${bad.length ? ' — ' + bad.join('; ') : ''}\n\n`;
  md += `## Wall numbers (this substrate)\n\n`;
  md += `national ${summary.wall.national}/${n} | table ${summary.wall.table}/${n} | wins ${summary.wall.wins}/${n} | wave-4 ${summary.wall.wave4}/${n} | wave-5 ${summary.wall.wave5}/${n} | median survival ${summary.wall.medianSurvival}d | max ${summary.wall.maxSurvival}d | exiled ${summary.wall.exiled}/${n}\n\n`;
  md += `## The window (deferral-5, windowsurvive-identical definition)\n\n`;
  md += `door-reaching runs: ${summary.door.reached}/${n}; windows: ${summary.door.windows} (outcomes: ${JSON.stringify(outcomes)}); median window length: ${medLens}d.\n\n`;
  md += `## Legs at stall (terminal readiness, r5)\n\n`;
  md += `veterans short: ${vetShort}/${n} | armor short: ${armorShort}/${n}\n\n`;
  md += `## Window-death taxonomy (${wd.length} deaths, all windows)\n\n`;
  md += `### The 9 classes\n\n`;
  for (const [c, k] of Object.entries(byClass).sort((a, b) => b[1] - a[1])) md += `- ${c}: ${k}\n`;
  md += `\n### By window outcome (died vs won-through)\n\n`;
  md += `died-windows: ${JSON.stringify(byClassOutcome.died)} | won-windows: ${JSON.stringify(byClassOutcome.won)} | other: ${JSON.stringify(byClassOutcome.other)}\n\n`;
  md += `### By role\n\n`;
  md += `scholars: ${JSON.stringify(byClassRole.scholar)} | villagers: ${JSON.stringify(byClassRole.villager)}\n\n`;
  md += `### Killer wave (combatish classes)\n\n${JSON.stringify(byWave)}\n\n`;
  md += `### Precedence overlaps\n\n${JSON.stringify(overlaps)} (sealed deaths that were also kill-day; raid deaths in noFlee fights; contest-class deaths without the arena flag)\n\n`;
  md += `### WHEN — mean window-day at death: ${summary.taxonomy.when.windowDayMean}; mean inter-death gap: ${summary.taxonomy.when.interDeathGapMean}d\n\n`;
  md += `### STATE at death (means): ${JSON.stringify(summary.taxonomy.stateAtDeathMeans)}\n\n`;
  md += `### Window deaths, row by row\n\n`;
  md += `| policy | seed | day | who | role | class | cause | killerWave | windowDay/outcome | rule |\n|---|---|---|---|---|---|---|---|---|---|\n`;
  md += winRows.map(r => `| ${r} |`).join('\n') + '\n\n';
  md += `## Non-window deaths (contrast: died before the door or after regress/horizon)\n\n`;
  for (const a of atts) {
    if (!a.otherDeathCount) continue;
    md += `| ${a.policyId}-s${a.seed} | ${a.otherDeaths.map(d => `d${d.day} ${d.name} ${d.wclass}/${d.cause}`).join('; ')} |\n`;
  }
  md += `\n## Attribution quality (PRIMARY gate)\n\n`;
  md += `unexplained: ${unexplainedTotal} (DIAG-GO iff 0); phantom person-teles excluded: ${summary.attribution.phantoms}; cause space: ${JSON.stringify(causeUnion)}\n\n`;
  md += `## Per-run\n\n`;
  md += `| run | def5 | firstDef5d | windows (outcome) | endDay/endReason/won | deaths (window) | unexplained | r5 short @stall |\n|---|---|---|---|---|---|---|---|\n`;
  for (const a of atts) {
    md += `| ${a.policyId}-s${a.seed} | ${a.def5ever} | ${a.firstDef5Day == null ? '—' : 'd' + a.firstDef5Day} | ${a.attempts.map(w => `d${w.start}-${w.end}:${w.outcome}`).join('; ') || '—'} | ${a.endDay}/${a.endReason}${a.won ? '/WON' : ''} | ${a.deathsTotal} (${a.windowDeathCount}) | ${a.unexplainedCount} | ${(a.r5term.short || []).join('+')} |\n`;
  }
  writeOut(path.join(OUTD, 'windowseat-corpus-summary.json'), JSON.stringify(summary, null, 1));
  writeOut(path.join(OUTD, 'windowseat-taxonomy.md'), md);
  console.log(`WINDOW-DEATH TAXONOMY: ${n} runs (${bad.length} bad files), door ${summary.door.reached}, window deaths ${wd.length}, unexplained ${unexplainedTotal}`);
  console.log(`  classes: ${JSON.stringify(byClass)}`);
  console.log(`  wall: nat=${summary.wall.national} table=${summary.wall.table} wins=${summary.wall.wins} w4=${summary.wall.wave4} w5=${summary.wall.wave5} med=${summary.wall.medianSurvival}d max=${summary.wall.maxSurvival}d`);
}

function writeOut(fp, data) {
  let last = null;
  for (let i = 0; i < 15; i++) {
    try { fs.writeFileSync(fp, data); return; }
    catch (e) { last = e; if (e && e.code === 'EPERM') { const t = Date.now(); while (Date.now() - t < 4000) {} continue; } throw e; }
  }
  throw last;
}

if (require.main === module) main();
module.exports = { loadValid, attemptsOf, attribute, classifyWall, isCombatish, nameToWave, nameSet, joinKillerWave };
