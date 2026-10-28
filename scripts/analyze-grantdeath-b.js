#!/usr/bin/env node
// analyze-grantdeath-b.js — summarizer for the sim-grantdeath-b
// corpus. For every loss instance it names the death cause
// through the SAME counting rule the instrument proves
// (nameDeathCause: recorded events only, never a body guess),
// classifies the window from the death event's own stack, and
// checks fallen/telemetry agreement. Prints a reproduction
// table, a per-loss detail block (with the overnight death
// narration quoted from the bracket window), and the verdict
// counts against the prereg (2/2 seeds named = DIAG-GO).
'use strict';
process.env.COMPETENT_FEAST = '0';
process.env.SEATDRIVE = '0';
process.env.PLENTYDEPRI = '0';
process.env.DEPOSITGATE = '1';
const fs = require('fs');
const path = require('path');
const { nameDeathCause } = require('./grantdeath-trace-b');

const DIR = process.env.CORPUS || path.join(__dirname, '..', 'evidence', '2026-10-28', 'sim-grantdeath-b-corpus');
const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.json')).sort();
function classifyWindow(stack) {
  const s = (stack || []).join('\n');
  if (/endDay|resolveDay/.test(s)) return 'overnight endDay/resolveDay';
  if (/sleep/.test(s)) return 'overnight sleep tick';
  if (/tbEnd|fieldFight|hurtVillager|combat/.test(s)) return 'fight/field damage';
  if (/contest/.test(s)) return 'contest';
  return 'other (see stack)';
}
const losses = [];
const perSeed = {};
let total = 0, grantsOk = 0;
for (const f of files) {
  const d = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
  total++;
  if (d.grantOk) grantsOk++;
  perSeed[d.seed] = perSeed[d.seed] || { instances: 0, losses: 0 };
  perSeed[d.seed].instances++;
  const loc = d.lossLocalization || {};
  if (!loc.lost) {
    // Deaths that never surfaced as a loss (e.g. after the last
    // tap, or a death with no grant effect) are still counted.
    const des = d.deathEvents || [];
    if (des.length) perSeed[d.seed].deathsNoLoss = (perSeed[d.seed].deathsNoLoss || 0) + 1;
    continue;
  }
  perSeed[d.seed].losses++;
  const last = loc.lastPresent || {};
  const first = loc.firstAbsent || {};
  const oldId = last.bearerGame || null;
  const bracket = first.bracketWindow || {};
  // Primary source: the death events inside the first-absent
  // snapshot's own bracket window; fall back to top-level
  // events for the old bearer if the bracket came up empty.
  let named = nameDeathCause({
    deathEvents: bracket.deathEvents || [],
    regDeathEvents: bracket.regDeathEvents || [],
    fallen: bracket.fallenAdded || [],
    teleDeaths: bracket.teleDeathAdded || [],
  }, oldId);
  if (!named.recorded) {
    named = nameDeathCause({
      deathEvents: (d.deathEvents || []).filter((e) => e.oldId === oldId),
      regDeathEvents: (d.regDeathEvents || []).filter((e) => e.villagerId === oldId),
      fallen: (d.fallenFinal || []).filter((x) => x.villagerId === oldId),
      teleDeaths: (d.teleDeathFinal || []).filter((x) => String(x.who) === String(oldId)),
    }, oldId);
    if (named.recorded) named.source += ' (top-level fallback, bracket empty)';
  }
  const deathEv = (named.event && named.event.kind === 'playerDeath') ? named.event : null;
  const sayDeath = (bracket.sayLines || []).filter((l) => /dead|Codex|digging|picks up/.test(l));
  losses.push({
    file: f, seed: d.seed, key: d.key, oldId, newId: first.bearerGame || null,
    lastPresent: { phase: last.phase, seq: last.seq, gameDay: last.gameDay, dayTicks: last.dayTicks, health: last.health, kcal: last.kcal, hydration: last.hydration },
    firstAbsent: { phase: first.phase, seq: first.seq, gameDay: first.gameDay, dayTicks: first.dayTicks },
    cause: named.cause, source: named.source, site: named.site, recorded: named.recorded,
    window: deathEv ? classifyWindow(deathEv.stack) : (named.recorded ? 'recorded, no playerDeath stack' : 'UNRECORDED'),
    deathEvent: deathEv ? { gameDay: deathEv.gameDay, dayTicks: deathEv.dayTicks, body: deathEv.body, stack: deathEv.stack } : null,
    regEvents: bracket.regDeathEvents || [],
    fallenAdded: bracket.fallenAdded || [],
    teleAdded: bracket.teleDeathAdded || [],
    sayDeath,
    reinstalls: d.deathReinstalls || 0,
    refusalTaps: (d.taps || []).filter((t) => t.outcome === 'attempted' && (t.sayWindow || []).some((l) => /You don't have that ability/.test(l))).length,
  });
}
console.log('=== sim-grantdeath-b corpus: ' + total + ' files, grants ok ' + grantsOk + ' ===');
for (const seed of Object.keys(perSeed).sort((a, b) => a - b)) {
  const s = perSeed[seed];
  console.log('seed ' + seed + ': ' + s.instances + ' instances, ' + s.losses + ' losses' + (s.deathsNoLoss ? ', ' + s.deathsNoLoss + ' non-loss instances with death events' : ''));
}
console.log('\n=== losses: ' + losses.length + ' ===');
for (const L of losses) {
  console.log('- seed ' + L.seed + ' ' + L.key + ' ' + L.oldId + ' -> ' + L.newId
    + ' | cause=' + (L.cause == null ? 'UNRECORDED' : L.cause) + ' (' + (L.source || 'none') + ')'
    + ' | window=' + L.window + ' | site=' + (L.site || 'none')
    + ' | lastPresent day ' + L.lastPresent.gameDay + ' ticks ' + L.lastPresent.dayTicks
    + ' -> firstAbsent day ' + L.firstAbsent.gameDay + ' ticks ' + L.firstAbsent.dayTicks
    + (L.deathEvent ? ' | deathEvent day ' + L.deathEvent.gameDay + ' ticks ' + L.deathEvent.dayTicks + ' body=' + JSON.stringify(L.deathEvent.body) : '')
    + ' | refusalTaps=' + L.refusalTaps + ' | reinstalls=' + L.reinstalls);
}
console.log('\n=== per-loss detail (bracket narration + agreement) ===');
for (const L of losses) {
  console.log('\n-- ' + L.seed + ' ' + L.key + ' --');
  console.log('  death stack: ' + JSON.stringify(L.deathEvent ? L.deathEvent.stack : null));
  console.log('  regDeathEvents in bracket: ' + JSON.stringify(L.regEvents.map((e) => ({ cause: e.cause, villagerId: e.villagerId, player: e.player }))));
  console.log('  fallenAdded: ' + JSON.stringify(L.fallenAdded));
  console.log('  teleDeathAdded: ' + JSON.stringify(L.teleAdded));
  console.log('  death narration in bracket:');
  for (const l of L.sayDeath) console.log('    ' + JSON.stringify(l));
}
const targets = ['10041', '10042'];
console.log('\n=== verdict counts (prereg: 2/2 seeds named = DIAG-GO) ===');
let namedSeeds = 0;
for (const t of targets) {
  const ls = losses.filter((L) => String(L.seed) === t);
  const recorded = ls.filter((L) => L.recorded);
  const allRecorded = ls.length > 0 && recorded.length === ls.length;
  const causes = [...new Set(recorded.map((L) => L.cause))];
  console.log('seed ' + t + ': ' + ls.length + ' loss instances, ' + recorded.length + ' recorded, causes=' + JSON.stringify(causes) + ' -> ' + (allRecorded ? 'NAMED (all instances recorded)' : (recorded.length > 0 ? 'PARTIALLY RECORDED' : 'UNRECORDED')));
  if (allRecorded) namedSeeds++;
}
console.log('named seeds: ' + namedSeeds + '/2 -> ' + (namedSeeds === 2 ? 'DIAG-GO' : (namedSeeds === 1 ? 'DIAG-PARTIAL' : 'DIAG-NO-GO')));
