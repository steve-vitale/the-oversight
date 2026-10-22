#!/usr/bin/env node
// analyze-windowfight-20261022.js — analyzer for the sim-windowfight-r2 sweep.
//
// ADOPTED ARM (run fleshout-20261022T0555Z): the sim-windowfight (0019Z)
// orphan's analyzer, path-pointed at the r2 corpus.
//
// Reads evidence/2026-10-22/perseed-windowfight-r2/{policy}/s<seed>.json and
// produces the #748 decomposition: the current-master unlock rate on the
// pinned winning substrate, 100%-attributed wave-4+/wave-5 engagement
// censuses (herald-titan vs wave-monster channels split, #749; kills
// attributed kill-time against the DAILY bearer vid, #754), wall numbers,
// and the per-unlock post-invitation window decomposition.
//
// Usage: EVID=evidence/2026-10-22/perseed-windowfight-r2 \
//        node scripts/analyze-windowfight-20261022.js
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const EVID = process.env.EVID || path.join(REPO, 'evidence', '2026-10-22', 'perseed-windowfight-r2');

const monsters = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'monsters.json'), 'utf8'));
const byId = {};
for (const m of (Array.isArray(monsters) ? monsters : monsters.monsters || [])) {
  if (m && m.id) byId[m.id] = m;
}

const runs = [];
for (const policy of fs.readdirSync(EVID)) {
  const dir = path.join(EVID, policy);
  if (!fs.statSync(dir).isDirectory() || policy === 'sweep-summary.json') continue;
  for (const f of fs.readdirSync(dir)) {
    if (!/^s\d+\.json$/.test(f)) continue;
    runs.push(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
  }
}

const summary = {
  n: runs.length,
  w4Unlock: runs.filter(r => r.w4Day != null).length,
  w5Unlock: runs.filter(r => r.w5Day != null).length,
  national: runs.filter(r => r.national).length,
  everNational: runs.filter(r => r.everNational).length,
  table: runs.filter(r => r.table).length,
  won: runs.filter(r => r.won).length,
  exiled: runs.filter(r => r.endReason === 'exiled').length,
  villageLost: runs.filter(r => r.endReason === 'village-lost').length,
  daysSurvived: runs.map(r => r.gameDays | 0).sort((a, b) => a - b),
};
summary.medianSurvival = summary.daysSurvived[Math.floor(summary.daysSurvived.length / 2)] || 0;
summary.maxSurvival = summary.daysSurvived[summary.daysSurvived.length - 1] || 0;

// ---------- attribution completeness (PRIMARY, pre-registered) ----------
let unexplained = [];   // engagements that are not attributable
let attributedNote = []; // non-fight engagements with an explicit reason
let instrumentErrors = 0;
const channelCounts = { 'herald-titan': { eng: 0, refused: 0 }, 'wave-monster': { eng: 0 } };
const w5EngTotal = [];
const w5KillTotal = [];

for (const r of runs) {
  instrumentErrors += (r.instrumentErrors || []).length;
  for (const e of (r.engagements || [])) {
    const def = byId[e.mid];
    const resolvable = !!(def && def.wave === e.wave);
    if (!resolvable) { unexplained.push({ r: `${r.policyId}/s${r.seed}`, e, why: 'unresolvable-mid' }); continue; }
    const ch = e.channel || 'wave-monster';
    channelCounts[ch].eng++;
    if (ch === 'herald-titan') {
      // Herald solo TB refusal is the expected mechanism (titans.js canon);
      // it must not land in the unexplained bucket.
      if (e.shape === 'tb-refused' || !e.started) channelCounts[ch].refused++;
      else if (e.fightIdPresent || e.killJoin || e.outcome != null) { /* started herald fight — rare, counted as attributed */ }
      else unexplained.push({ r: `${r.policyId}/s${r.seed}`, e, why: 'herald-no-fight-no-kill-no-outcome' });
      continue;
    }
    // wave-monster channel: attributed iff fight-id, kill-join, or a tb
    // outcome — the STRICT pre-reg rule ("engagement without fight-id AND
    // without day+mid fallback kill match" is unexplained). Two explicit
    // non-fight categories, root-caused 2026-10-22 (kill-discipline: the
    // game is behaving; the census classifies):
    //   finale-node-gate: finale_opening refused until the crew is dead
    //     (finale-campaign.js: "THE OPENING CREDITS will not roll until the
    //     crew is dead") — designed, narrated refusal.
    //   muster-announcement: raid announced (started=false) with a started
    //     same-mid engagement within 1 day — the announcement beat of a
    //     real fight.
    if (e.fightIdPresent || e.killJoin || e.outcome != null) continue;
    if (e.mid === 'finale_opening' && !e.started) { attributedNote.push({ r: `${r.policyId}/s${r.seed}`, e, note: 'finale-node-gate-refused' }); continue; }
    const announced = (r.engagements || []).some(x =>
      x !== e && x.mid === e.mid && x.started && Math.abs((x.d | 0) - (e.d | 0)) <= 1);
    if (!e.started && announced) { attributedNote.push({ r: `${r.policyId}/s${r.seed}`, e, note: 'muster-announcement' }); continue; }
    unexplained.push({ r: `${r.policyId}/s${r.seed}`, e, why: 'no-fightid-no-kill-no-outcome' });
  }
  for (const e of (r.engagements || []).filter(x => x.wave === 5)) w5EngTotal.push({ r: `${r.policyId}/s${r.seed}`, e });
  for (const k of (r.kills || []).filter(x => x.wave === 5)) w5KillTotal.push({ r: `${r.policyId}/s${r.seed}`, k });
}

// ---------- kill-time bearer <redacted> (#754) ----------
const ktScholar = [], ktCompanion = [], ktPhantom = [];
for (const r of runs) {
  for (const k of (r.kills || [])) {
    if (k.channel === 'herald-titan') continue; // herald kills: zero ever measured
    if (k.bearerOnKillDay == null) { ktCompanion.push({ r: `${r.policyId}/s${r.seed}`, k, note: 'bearer-unknown-on-kill-day' }); continue; }
    if (k.byScholarAtKill) ktScholar.push({ r: `${r.policyId}/s${r.seed}`, k });
    else ktCompanion.push({ r: `${r.policyId}/s${r.seed}`, k });
    if (k.becameScholarLater) ktPhantom.push({ r: `${r.policyId}/s${r.seed}`, k });
  }
}

// ---------- per-unlock window decomposition (CONDITIONAL on >=1 unlock) ----------
const unlockRuns = runs.filter(r => r.w5Day != null);
const windowDecomp = unlockRuns.map(r => {
  const wd = r.w5Day | 0;
  const w5eng = (r.engagements || []).filter(e => e.wave === 5 && e.d >= wd);
  const w5fought = w5eng.filter(e => e.started || e.fightIdPresent);
  const w5kills = (r.kills || []).filter(k => k.wave === 5 && k.d >= wd);
  const wDeaths = {};
  for (const d of (r.deathList || [])) {
    if ((d.day | 0) >= wd) { const kk = `${d.cause || d.kind || 'unknown'}${d.player ? ' (player)' : ''}`; wDeaths[kk] = (wDeaths[kk] || 0) + 1; }
  }
  const nWindowDeaths = Object.values(wDeaths).reduce((a, b) => a + b, 0);
  const foughtBy = {};
  for (const k of w5kills) { const kk = k.byScholarAtKill ? 'scholar' : 'villager'; foughtBy[kk] = (foughtBy[kk] || 0) + 1; }
  const windowDays = (r.gameDays | 0) - wd;
  return {
    run: `${r.policyId}/s${r.seed}`, w5Day: wd,
    winDay: r.postWin ? r.postWin.winDay : null, winPath: r.postWin ? r.postWin.winPath : null,
    winResumed: !!(r.postWin && r.postWin.winResumed), postWinDays: r.postWin ? r.postWin.postWinDays : 0,
    windowDays, endReason: r.endReason,
    w5Engagements: w5eng.length, w5Fought: w5fought.length, w5Kills: w5kills.length,
    foughtBy, windowDeaths: nWindowDeaths, windowDeathCauses: wDeaths,
    w5KillsDetail: w5kills.map(k => ({ d: k.d, mid: k.mid, by: k.by, via: k.via, byScholarAtKill: k.byScholarAtKill })),
  };
});

const out = {
  evidenceDir: EVID,
  summary,
  attribution: {
    totalEngagements: runs.reduce((a, r) => a + (r.engagements || []).length, 0),
    unexplained: unexplained.length,
    unexplainedDetail: unexplained.slice(0, 40),
    attributedNonFight: attributedNote,
    instrumentErrors,
    heraldTitanChannel: channelCounts['herald-titan'],
    waveMonsterChannel: channelCounts['wave-monster'],
    w5Engagements: w5EngTotal.length,
    w5Kills: w5KillTotal.length,
  },
  killTimeBearer: {
    wave4PlusKillsByScholarAtKill: ktScholar.length,
    wave4PlusKillsByVillagerAtKill: ktCompanion.length,
    phantomScholarKills: ktPhantom.length, // #754 class: end-run vid said scholar, kill-day bearer <redacted>
    phantomDetail: ktPhantom.slice(0, 20),
  },
  unlockRate: {
    w4: `${summary.w4Unlock}/${summary.n}`,
    w5: `${summary.w5Unlock}/${summary.n}`,
  },
  windowDecomposition: windowDecomp,
};

const outPath = path.join(EVID, 'windowfight-analysis.json');
fs.writeFileSync(outPath, JSON.stringify(out, null, 1) + '\n');
console.log(JSON.stringify({
  n: summary.n,
  unlockRate_w4: out.unlockRate.w4, unlockRate_w5: out.unlockRate.w5,
  wall: { national: summary.national, everNational: summary.everNational, table: summary.table, won: summary.won, medianSurvival: summary.medianSurvival, maxSurvival: summary.maxSurvival, exiled: summary.exiled },
  attribution: { totalEngagements: out.attribution.totalEngagements, unexplained: out.attribution.unexplained, instrumentErrors: out.attribution.instrumentErrors },
  herald: out.attribution.heraldTitanChannel, waveMonster: out.attribution.waveMonsterChannel,
  w5: { engagements: out.attribution.w5Engagements, kills: out.attribution.w5Kills },
  killTime: { scholar: out.killTimeBearer.wave4PlusKillsByScholarAtKill, villager: out.killTimeBearer.wave4PlusKillsByVillagerAtKill, phantom: out.killTimeBearer.phantomScholarKills },
  windows: windowDecomp.length,
}, null, 1));
console.log('analysis -> ' + outPath);
