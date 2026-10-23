#!/usr/bin/env node
// R38 gate extraction: one table row per seed from census + log.
const fs = require('fs');
const path = require('path');
const DIR = path.join(process.env.HOME, 'workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-22/landing-r38');
const SEEDS = [309, 310, 311, 312];
function loadLog(s) {
  const log = fs.readFileSync(`/tmp/r38-seed-${s}.log`, 'utf8');
  const i = log.indexOf('SENSE METRICS: ');
  const start = log.indexOf('{', i);
  let depth = 0, end = start;
  for (let j = start; j < log.length; j++) {
    const c = log[j];
    if (c === '{') depth++; else if (c === '}') { depth--; if (depth === 0) { end = j + 1; break; } }
  }
  return { met: JSON.parse(log.slice(start, end)), log };
}
const rows = [];
for (const s of SEEDS) {
  const c = JSON.parse(fs.readFileSync(path.join(DIR, `journey-landing-r38-census-${s}.json`), 'utf8'));
  const { met } = loadLog(s);
  const series = c.series || [];
  const last = series[series.length - 1] || {};
  const alive = (last.villagerDay || []).filter(v => !v.dead).length;
  const deaths = (last.deaths || []);
  const ss = c.selfSufficiency;
  const tp = c.trustOut || {};
  const trusts = tp.trustPairs40 || [];
  const hungerGT90 = (last.villagerDay || []).filter(v => !v.dead && (v.needs || {}).hunger > 90).length;
  rows.push({
    seed: s, scholar: (c.spawn || {}).scholarName, systemDay: c.systemDay,
    pop14: alive, deaths: deaths.length, ss,
    hungerGT90, trustPairs: trusts.length, moots: tp.mootConvened || 0,
    boils: met.boils, fills: met.havenFills, deathMislabels: met.deathMislabels,
    nearDupes: met.nearDupes, verbatim: met.verbatimRepeats, fabric: met.fabricHistoryFlags,
    griefBeats: met.griefBeats, headcountCodas: met.headcountCodas, caughtRedHanded: met.caughtRedHanded,
    plentyVoice: met.plentyVoiceLines, fallenDupes: met.fallenDupes,
    fleshHauls: met.fleshHaulsSeen, fleshReveals: met.fleshReveals, fleshDeposits: met.fleshDeposits,
    freeze: met.timeFreezeCleared, taking: met.takingLines, takingSys: met.takingSystemLines, takingVill: met.takingVillagerLines,
    pipeWarns: met.textPipeWarns, pipeCands: met.textPipeCandidates,
    commaStutter: met.commaStutter, punctStutter: met.punctStutter, justSaid: met.justSaid, thirdP: met.thirdPersonFavorHead,
    nvSurfaced: met.nvWinddownSurfaced, nvClosed: met.nvWinddownClosed,
    stuckLoops: met.stuckLoops, devChannels: met.devotionChannels,
    starvDeaths: met.starvationDeaths, fights: met.fightsSeen,
    pipeCandSamples: met.textPipeCandidateSamples,
  });
}
console.log(JSON.stringify(rows, null, 1));
