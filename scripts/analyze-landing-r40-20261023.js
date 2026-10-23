#!/usr/bin/env node
// R39 gate extraction: one table row per seed from census + transcript
// evidence. Reads the landing-r40 evidence dir (no /tmp reads).
const fs = require('fs');
const path = require('path');
const DIR = path.join(process.env.HOME, 'workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-23/landing-r40');
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [401, 402, 403, 404]);
const rows = [];
for (const s of SEEDS) {
  const cpath = path.join(DIR, `journey-landing-r40-census-${s}.json`);
  if (!fs.existsSync(cpath)) { rows.push({ seed: s, missing: true }); continue; }
  const c = JSON.parse(fs.readFileSync(cpath, 'utf8'));
  const r = c.r40Summary || {};
  const series = c.series || [];
  const last = series[series.length - 1] || {};
  const alive = (last.villagerDay || []).filter(v => !v.dead).length;
  const deaths = (last.deaths || []);
  const lv = r.laughVoices || {};
  rows.push({
    seed: s, scholar: (c.spawn || {}).scholarName, systemDay: c.systemDay,
    pop14: alive, deaths: deaths.length, ss: (c.villageAutonomy || {}).selfSufficiency,
    hungerGT90: (last.villagerDay || []).filter(v => !v.dead && (v.needs || {}).hunger > 90).length,
    // stay-green spine
    nearDupes: r.nearDupes, nvStuck: r.nvStuckLoops, nvSurfaced: r.nvWinddownSurfaced, nvClosed: r.nvWinddownClosed,
    griefBeats: r.griefBeats, headcountCodas: r.headcountCodas, theft: r.caughtRedHanded,
    nudge: `fired${r.dayOneNudgeFired||0}/d${r.dayOneNudgeDay==null?'?':r.dayOneNudgeDay}`,
    plentyVoice: r.plentyVoiceLines, fallenDupes: r.fallenDupes,
    // r39 blank arm A: night beats
    debriefLines: r.debriefLines, graveMarkers: r.graveMarkerLines,
    laugh: `m${lv.mutiny || 0}/b${lv.borrowed || 0}/h${lv.honest || 0} b2b${lv.backToBack || 0}`,
    seekSuggest: r.seekSuggestLines,
    objectivesWarns: r.objectivesWarns, nightfallWarns: r.nightfallWarns,
    debriefSamples: r.debriefLineSamples, graveSamples: r.graveMarkerSamples,
    laughSamples: r.laughLineSamples, seekSamples: r.seekSuggestSamples,
  });
}
console.log(JSON.stringify(rows, null, 1));
