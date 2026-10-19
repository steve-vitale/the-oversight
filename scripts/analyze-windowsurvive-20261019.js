#!/usr/bin/env node
// analyze-windowsurvive-20261019.js — window-death attribution for the
// sim-windowsurvive diagnostic.
//
// Reads evidence/2026-10-19/perseed-windowsurvive/<policy>/s<seed>.json
// (validated before aggregating — the w5census 0-byte lesson) and, per
// run, derives:
//   - doorReach: deferral(5) true >= 1 day.
//   - attempts: maximal contiguous deferral(5)-true windows with outcomes
//     released | died | won | horizon | regressed (the analyze-w5path
//     logic, endRec-boundary fix included — identical by construction).
//   - windowDeaths: attributed deaths whose day falls inside a 'died'
//     window, taxonomized: WHO (scholar successions vs villager
//     attrition), WHERE (field channels via the vetwindow-identical
//     classifier), WHAT (the death tele's `wave` field: killer monster's
//     wave — wave-4 verbs vs wave-3 vs mundane), WHEN (window-day index,
//     inter-death intervals), STATE at death (pantry, hungryStreak,
//     veterans living, armored fighters, standing).
//   - the veteran leg and armor mortality read jointly (r5short at stall).
//   - wall numbers: national/table/wins, wave 4-5 unlocks, median survival.
//
// Writes: evidence/2026-10-19/windowsurvive-corpus-summary.json and
//         evidence/2026-10-19/windowsurvive-taxonomy.md
// Usage: node scripts/analyze-windowsurvive-20261019.js
'use strict';
const fs = require('fs');
const path = require('path');

const EVID = path.join(__dirname, '..', 'evidence', '2026-10-19', 'perseed-windowsurvive');
const OUTD = path.join(__dirname, '..', 'evidence', '2026-10-19');

// KILLER-WAVE JOIN (2026-10-19): the death tele's `wave` is null for
// person-kind deaths. Two post-hoc routes, both engine-true:
//   1. monster-name causes (expedDeath: cause = the monster's NAME) ->
//      direct lookup in data.monsters (static).
//   2. combat/monster deaths -> the probe's fightStarts (combat_start
//      teles + router/aidFight records): the latest fight-start with
//      day <= death day.
let NAME2WAVE = null;
function nameToWave(name) {
  if (!NAME2WAVE) {
    NAME2WAVE = new Map();
    try {
      const ms = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'monsters.json'), 'utf8'));
      for (const m of (ms.monsters || ms)) {
        if (!m) continue;
        if (m.name) NAME2WAVE.set(String(m.name).toLowerCase(), m.wave | 0 || null);
        if (m.id) NAME2WAVE.set(String(m.id).toLowerCase(), m.wave | 0 || null);
        if (m.id) NAME2WAVE.set(String(m.id).toLowerCase().replace(/_/g, ' '), m.wave | 0 || null);
      }
    } catch (e) { /* static data missing: lookups yield null, honestly */ }
  }
  return NAME2WAVE.get(String(name).toLowerCase()) ?? null;
}
function joinKillerWave(rec) {
  const fights = (rec.fightStarts || []).slice().sort((a, b) => (a.day | 0) - (b.day | 0));
  const deaths = (((rec.deathsAttributed || {}).attributed) || []);
  for (const d of deaths) {
    let kw = (d.wave != null) ? (d.wave | 0) : null, km = null, kv = null;
    const nm = nameToWave(d.cause);
    if (nm != null) { kw = nm; km = d.cause; kv = 'name-lookup'; }
    else if (d.cause === 'combat' || d.cause === 'monster') {
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

// Wave-5 unlock attempts: maximal contiguous deferral(5)-true windows.
// Logic identical to analyze-w5path-20261019.js (incl. the endRec
// boundary fix) so window definitions match the w5census numbers.
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

function attribute(rec) {
  const recs = rec.recs || [];
  const end = (rec.endRec && rec.endRec.st) || {};
  const attempts = attemptsOf(rec);
  const diedWindows = attempts.filter(w => w.outcome === 'died');
  const def5ever = attempts.length > 0;
  const firstDef5Day = def5ever ? Math.min(...attempts.map(w => w.start)) : null;
  const deaths = joinKillerWave(rec); // mutates rec.deathsAttributed.attributed: adds killerWave/killerMid/killerVia
  // Window deaths: attributed deaths inside a died window.
  const windowDeaths = [];
  for (const d of deaths) {
    for (const w of diedWindows) {
      if (d.day >= w.start && d.day <= w.end) {
        windowDeaths.push(Object.assign({}, d, {
          windowStart: w.start, windowEnd: w.end, windowLen: w.len,
          windowDay: d.day - w.start + 1,
        }));
        break;
      }
    }
  }
  windowDeaths.sort((a, b) => a.day - b.day);
  const gaps = [];
  for (let i = 1; i < windowDeaths.length; i++) gaps.push(windowDeaths[i].day - windowDeaths[i - 1].day);
  // Non-window deaths for contrast (deaths before the door or after regress/horizon).
  const otherDeaths = deaths.filter(d => !windowDeaths.some(wd => wd.who === d.who && wd.day === d.day && wd.cause === d.cause));
  return {
    seed: rec.seed, policyId: rec.policyId,
    def5ever, firstDef5Day, attempts,
    diedWindows: diedWindows.length, diedInWindow: diedWindows.length > 0 && (rec.endReason === 'village-lost' || rec.endReason === 'pop-zero'),
    endDay: rec.gameDays, endReason: rec.endReason, won: !!rec.won,
    national: !!rec.national, table: !!rec.table, exiled: !!rec.exiled,
    maxWave: rec.maxWave, wave4Day: rec.wave4Day, wave5Day: rec.wave5Day,
    deathsTotal: deaths.length, windowDeaths, windowDeathCount: windowDeaths.length,
    interDeathGaps: gaps, otherDeathCount: otherDeaths.length,
    unattributed: (rec.deathsAttributed.unattributedCount | 0) || 0,
    phantoms: (rec.deathsAttributed.phantomCount | 0) || 0,
    causeSpace: rec.deathsAttributed.causeSpace || {},
    r5term: { arm: end.armored, wpn: end.armed, trk: end.tricks, vet: end.vets, short: end.short, rdy: end.rdy },
    standingTerm: { raw: end.raw, cap: end.cap, war: end.war, dip: end.dip, plenty: end.plenty },
    pantryTerm: end.pantry, hungryTerm: end.hungryStreak,
  };
}

// The policy-side addressability read: which window-death channels can a
// window-support policy plausibly reach? (Pre-registered lever surface:
// field recovery for wave-4-engaged fighters, pantry defense during the
// deferral.) A death is addressable-by-window-support iff it is a combat
// field death with a wave-3+ killer (field recovery surface) or a
// logistics death (starvation/thirst/dehydration/injuries — pantry/water
// defense surface). DIAGNOSTIC MISS = no addressable surface.
function addressability(d) {
  const kw = d.killerWave != null ? d.killerWave : d.wave;
  const mundaneField = d.channel === 'disease' || d.channel === 'alien';
  const logistics = (d.channel === 'haven' && /starvation|thirst|dehydration|injuries|wound/i.test(d.cause))
    || (d.channel === 'other' && /dehydration/i.test(d.cause));
  const fieldCombat = (d.channel === 'raid' || d.channel === 'expedition' || d.channel === 'wild' || d.channel === 'patrol')
    && (d.cause === 'combat' || d.cause === 'monster' || kw != null || nameToWave(d.cause) != null);
  const wave4Combat = fieldCombat && kw === 4;
  const wave3Combat = fieldCombat && kw === 3;
  return { logistics, fieldCombat, wave4Combat, wave3Combat, mundaneField,
    addressable: logistics || fieldCombat };
}

function main() {
  const { recs, bad } = loadValid();
  const n = recs.length;
  const atts = recs.map(attribute);
  const agg = (f) => atts.filter(f).length;
  const surv = atts.map(a => a.endDay).sort((a, b) => a - b);
  const median = surv.length ? surv[Math.floor(surv.length / 2)] : 0;

  const doorRuns = atts.filter(a => a.def5ever);
  const diedRuns = atts.filter(a => a.diedInWindow);

  // Taxonomy aggregates over window deaths.
  const wd = [];
  for (const a of atts) for (const d of a.windowDeaths) wd.push(Object.assign({ seed: a.seed, policy: a.policyId }, d));
  const byWho = { scholar: wd.filter(d => d.player).length, villager: wd.filter(d => !d.player).length };
  const byChannel = {};
  for (const d of wd) byChannel[d.channel] = (byChannel[d.channel] || 0) + 1;
  const byWave = { w4: 0, w3: 0, w12: 0, null: 0 };
  for (const d of wd) {
    const w = d.killerWave != null ? d.killerWave : d.wave;
    if (w === 4) byWave.w4++;
    else if (w === 3) byWave.w3++;
    else if (w != null && w <= 2) byWave.w12++;
    else byWave.null++;
  }
  const addr = wd.map(d => Object.assign({ d }, addressability(d)));
  const addrN = addr.filter(a => a.addressable).length;
  const addrLogistics = addr.filter(a => a.logistics).length;
  const addrField = addr.filter(a => a.fieldCombat).length;
  // Window-day index distribution.
  const wdi = wd.map(d => d.windowDay);
  const wdiMean = wdi.length ? (wdi.reduce((x, y) => x + y, 0) / wdi.length) : 0;
  const gaps = [];
  for (const a of atts) gaps.push(...a.interDeathGaps);
  const gapMean = gaps.length ? gaps.reduce((x, y) => x + y, 0) / gaps.length : 0;
  // Veteran leg + armor at stall (terminal), read jointly.
  const vetShort = atts.filter(a => (a.r5term.short || []).includes('veterans')).length;
  const armorShort = atts.filter(a => (a.r5term.short || []).includes('armor')).length;
  const weaponsShort = atts.filter(a => (a.r5term.short || []).includes('weapons')).length;
  // Unattributed rows on door-reaching runs that died in the window.
  const unattribOnDied = diedRuns.reduce((x, a) => x + a.unattributed, 0);
  // Attempt-outcome table.
  const outcomes = {};
  for (const a of atts) for (const w of a.attempts) outcomes[w.outcome] = (outcomes[w.outcome] || 0) + 1;
  const windowLens = atts.flatMap(a => a.attempts.map(w => w.len)).sort((a, b) => a - b);
  const medLens = windowLens.length ? windowLens[Math.floor(windowLens.length / 2)] : 0;
  // Cause space union.
  const causeUnion = {};
  for (const a of atts) for (const [c, k] of Object.entries(a.causeSpace)) causeUnion[c] = (causeUnion[c] || 0) + k;

  const summary = {
    n, filesBad: bad,
    wall: {
      national: agg(a => a.national), table: agg(a => a.table), wins: agg(a => a.won),
      wave4: agg(a => a.maxWave >= 4), wave5: agg(a => a.wave5Day != null),
      medianSurvival: median, exiled: agg(a => a.exiled),
    },
    door: { reached: doorRuns.length, diedInWindow: diedRuns.length,
      attempts: atts.reduce((x, a) => x + a.attempts.length, 0), outcomes, medianWindowLen: medLens },
    legsAtStall: { veteransShort: vetShort, armorShort, weaponsShort, n },
    taxonomy: {
      windowDeaths: wd.length,
      who: byWho,
      where: byChannel,
      what: byWave,
      when: { windowDayMean: Math.round(wdiMean * 10) / 10, interDeathGapMean: Math.round(gapMean * 10) / 10 },
      stateAtDeathMeans: null,
      addressable: { n: addrN, logistics: addrLogistics, fieldCombat: addrField, wave4Combat: addr.filter(a => a.wave4Combat).length, wave3Combat: addr.filter(a => a.wave3Combat).length, mundaneField: addr.filter(a => a.mundaneField).length },
    },
    attribution: { unattributedOnDiedRuns: unattribOnDied, phantoms: atts.reduce((x, a) => x + a.phantoms, 0) },
    causeSpace: causeUnion,
  };
  // State-at-death means (window deaths only).
  const num = (f) => { const xs = wd.map(f).filter(x => x != null && x >= 0); return xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : null; };
  summary.taxonomy.stateAtDeathMeans = {
    pantryKcal: num(d => d.stateAtDeath && d.stateAtDeath.pantry),
    hungryStreak: num(d => d.stateAtDeath && d.stateAtDeath.hungryStreak),
    veteransLiving: num(d => d.stateAtDeath && d.stateAtDeath.vets),
    armored: num(d => d.stateAtDeath && d.stateAtDeath.armored),
    standingCap: num(d => d.stateAtDeath && d.stateAtDeath.cap),
  };
  const winRows = wd.map(d => [d.policy, d.seed, d.day, d.name, d.player ? 'SCHOLAR' : 'villager', d.channel, d.cause, d.killerWave == null ? '—' : 'w' + d.killerWave + (d.killerVia ? '/' + d.killerVia : ''), d.windowDay, d.rule, d.stateAtDeath ? `pantry=${d.stateAtDeath.pantry} hungry=${d.stateAtDeath.hungryStreak} vets=${d.stateAtDeath.vets} arm=${d.stateAtDeath.armored}` : ''].join(' | '));

  let md = `# sim-windowsurvive — window-death taxonomy\n\n`;
  md += `Runs: ${n} (8 seeds x {leadfeast, belongfeast}), substrate w5path-vetrel1 (pre-seat + windefer, VETREL=1, SEATDRIVE=0).\n`;
  md += `Bad per-seed files: ${bad.length}${bad.length ? ' — ' + bad.join('; ') : ''}\n\n`;
  md += `## Wall numbers (this substrate)\n\n`;
  md += `national ${summary.wall.national}/${n} | table ${summary.wall.table}/${n} | wins ${summary.wall.wins}/${n} | wave-4 ${summary.wall.wave4}/${n} | wave-5 ${summary.wall.wave5}/${n} | median survival ${summary.wall.medianSurvival}d | exiled ${summary.wall.exiled}/${n}\n\n`;
  md += `## The window\n\n`;
  md += `door-reaching runs: ${summary.door.reached}/${n}; died in the window: ${summary.door.diedInWindow}; attempts: ${summary.door.attempts} (outcomes: ${JSON.stringify(outcomes)}); median window length: ${medLens}d.\n\n`;
  md += `## Legs at stall (terminal readiness, r5)\n\n`;
  md += `veterans short: ${vetShort}/${n} | armor short: ${armorShort}/${n} | weapons short: ${weaponsShort}/${n}\n\n`;
  md += `## Window-death taxonomy (${wd.length} deaths)\n\n`;
  md += `### WHO — scholar successions: ${byWho.scholar}, villager attrition: ${byWho.villager}\n\n`;
  md += `### WHERE — channel shares: ${JSON.stringify(byChannel)}\n\n`;
  md += `(Comparability anchor — sim-fieldfightsrc post-invite FIELD-EXPOSURE: raid 28.4% / expedition 68.9% / wild 2.7%. Exposure, not deaths.)\n\n`;
  md += `### WHAT — killer wave (death tele's wave field): wave-4: ${byWave.w4}, wave-3: ${byWave.w3}, wave-1/2: ${byWave.w12}, non-combat/unknown: ${byWave.null}\n\n`;
  md += `### WHEN — mean window-day at death: ${summary.taxonomy.when.windowDayMean}; mean inter-death gap: ${summary.taxonomy.when.interDeathGapMean}d\n\n`;
  md += `### STATE at death (means): ${JSON.stringify(summary.taxonomy.stateAtDeathMeans)}\n\n`;
  md += `### Addressability (policy-side surface)\n\n`;
  md += `addressable by window support: ${addrN}/${wd.length} (logistics: ${addrLogistics}, field combat: ${addrField} — wave-4 ${summary.taxonomy.addressable.wave4Combat}, wave-3 ${summary.taxonomy.addressable.wave3Combat}, mundane field: ${summary.taxonomy.addressable.mundaneField})\n\n`;
  md += `### Window deaths, row by row\n\n`;
  md += `| policy | seed | day | who | role | channel | cause | wave | windowDay | rule | state |\n|---|---|---|---|---|---|---|---|---|---|---|\n`;
  md += winRows.map(r => `| ${r} |`).join('\n') + '\n\n';
  md += `## Attribution quality\n\n`;
  md += `unattributed rows on died-in-window runs: ${unattribOnDied} (DIAGNOSTIC MISS if > 0); phantom person-teles excluded: ${summary.attribution.phantoms}; cause space: ${JSON.stringify(causeUnion)}\n\n`;
  md += `## Per-run\n\n`;
  md += `| run | def5 | firstDef5d | attempts (outcome) | endDay/endReason | deaths (window) | unattrib | r5 short @stall |\n|---|---|---|---|---|---|---|---|\n`;
  for (const a of atts) {
    md += `| ${a.policyId}-s${a.seed} | ${a.def5ever} | ${a.firstDef5Day == null ? '—' : 'd' + a.firstDef5Day} | ${a.attempts.map(w => `d${w.start}-${w.end}:${w.outcome}`).join('; ') || '—'} | ${a.endDay}/${a.endReason} | ${a.deathsTotal} (${a.windowDeathCount}) | ${a.unattributed} | ${(a.r5term.short || []).join('+')} |\n`;
  }
  fs.writeFileSync(path.join(OUTD, 'windowsurvive-corpus-summary.json'), JSON.stringify(summary, null, 1));
  fs.writeFileSync(path.join(OUTD, 'windowsurvive-taxonomy.md'), md);
  console.log(`WINDOW-DEATH TAXONOMY: ${n} runs (${bad.length} bad files), door ${summary.door.reached}, died-in-window ${summary.door.diedInWindow}, window deaths ${wd.length}, unattrib-on-died ${unattribOnDied}`);
  console.log(`  who: scholar=${byWho.scholar} villager=${byWho.villager} | where: ${JSON.stringify(byChannel)} | what: ${JSON.stringify(byWave)}`);
  console.log(`  addressable: ${addrN}/${wd.length} | vetsShort=${vetShort}/${n} armorShort=${armorShort}/${n}`);
  console.log(`  wall: nat=${summary.wall.national} table=${summary.wall.table} wins=${summary.wall.wins} w4=${summary.wall.wave4} w5=${summary.wall.wave5} med=${summary.wall.medianSurvival}d`);
}

if (require.main === module) main();
module.exports = { loadValid, attemptsOf, attribute, addressability, nameToWave, joinKillerWave };
