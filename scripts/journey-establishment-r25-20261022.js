#!/usr/bin/env node
// Journey leg: ESTABLISHMENT (days 14-40) R25 — REGIME-CHANGE ESTABLISHMENT: SURPLUSFEED REMOVED + PLENTYDEPRI LIVE (2026-10-22).
// Rotation index 1 (establishment). Base: master@4f9844181 (current tip).
// Pre-registered in hidden_files/evidence/2026-10-22/journey-establishment-r25-note.md.
//
// Steve 2026-10-21 removed the SURPLUSFEED trim governor: the replacement
// direction is behavioral and bottom-up — villagers deprioritize PRODUCTION
// and STORAGE when food is plentiful (docs/DECISIONS.md). That replacement
// is a design thread, not yet an implementation order. This pilot asks:
// post-removal + plentydepri lever LIVE (df66ebaff, base 10501df7f), does the easing regime
// deprioritization (the FORAGE gate in villager-objectives.js is
// pantry<4000-or-hungry gated), or does the pantry balloon unboundedly on
// establishment horizons? The r13 preserve arm measured garden influx
// ~4.9k/day vs ~1.5k/night draw — gardens bypass the forage gate, so the
// gate's adequacy is the question.
// Instrument: daily pantry checkpoints + dawn objective-kind sampling
// (Game.objOf per living villager) bucketed by pantry level. Same 4 seeds
// as r20-r23 for baseline comparability.
// Binding: M1 food-economy (production share vs pantry fullness, pantry
// trajectory vs r23 baseline); M2 people (>=6 transcripts sense-read, 0
// senseless, 0 fabricated shared history, r21 favor-repeat fix holds);
// M3 blank = the production-deprioritization instrument + audit.
// Guardrails: reachedDay >= 43 all seeds; no softlocks; wave-2 gate >= d8;
// starvation reported; pilot aired.
// Usage: SEEDS=61 node scripts/journey-establishment-r25-20261022.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVID = process.env.EVID || '/home/hatch/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-22';
const { loadGame, setupGame, driveFights, driveContests } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { census } = require('./lib/death-census');

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [61, 82, 103, 124]);
const DAYS = parseInt(process.env.DAYS || '42', 10);

const _warned = {};
function warnOnce(key, e) {
  if (_warned[key]) return;
  _warned[key] = true;
  console.warn('[r24:' + key + ']', (e && e.message) || e);
}
function pantryKcal(Game) {
  try {
    return ((Game.state.village || {}).pantry || [])
      .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  } catch (e) { return 0; }
}
function livingVids(Game) {
  try {
    const v = Game.state.village || {};
    return (v.roster || []).filter(id => {
      try { if ((Game.getPerson(id) || {}).dead) return false; } catch (e) {}
      return true;
    });
  } catch (e) { return []; }
}
function nameOf(Game, id) {
  try { return id === 'player' ? 'You' : (Game.displayName ? Game.displayName(id) : id); } catch (e) { return String(id); }
}
const nowDay = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
function teleStream(Game) {
  try { return (Game.state.telemetry || []).slice(); } catch (e) { return []; }
}
function killerOf(Game, d) {
  // resolve killerId from the corpse record when the tele entry lacks it
  try {
    const corpses = (Game.corpses && Game.corpses()) || [];
    const c = corpses.find(c => c && String(c.dayDied) === String(d.day) &&
      (String(c.monsterId || '') === String(d.who) || String(c.villagerId || '') === String(d.who) || String(c.name || '') === String(d.who)));
    if (c && c.killerId) return String(c.killerId);
  } catch (e) {}
  return null;
}

async function runSeed(seed) {
  const { Game } = await loadGame({ seed, mode: 'mvc', fullTelemetry: true });
  await setupGame(Game);
  const policy = competent;
  const ctx = { policyId: policy.id, notes: [] };
  if (policy.setup) { try { policy.setup(Game, ctx); } catch (e) { warnOnce('setup', e); } }

  const waveDay = {};
  const contestFires = [];
  const _fireContest = Game.fireContest ? Game.fireContest.bind(Game) : null;
  if (_fireContest) {
    Game.fireContest = function (contest) {
      const wasPilotAired = !!Game.state.pilotAired;
      const r = _fireContest(contest);
      try {
        contestFires.push({ day: nowDay(Game), name: (contest && contest.name) || (contest && contest.id) || '?' });
        if (!wasPilotAired && Game.state.pilotAired) ctx._pilotDay = nowDay(Game);
      } catch (e) { warnOnce('fireContest', e); }
      return r;
    };
  }

  const dayLines = {};
  const foodTrack = []; // r24: dawn sample per day — pantry + objective-kind mix per living villager
  const PROD_KINDS = { FORAGE: 1, TRAPS: 1, HAUL: 1, EXPLORE: 1 };
  for (let d = 1; d <= DAYS; d++) {
    try {
      const pk = Math.round(pantryKcal(Game));
      const kinds = {};
      const vids = livingVids(Game);
      for (const vid of vids) {
        let k = 'unknown';
        try { const o = Game.objOf ? Game.objOf(vid) : null; k = (o && o.kind) || 'unknown'; } catch (e) { k = 'error'; }
        kinds[k] = (kinds[k] || 0) + 1;
      }
      foodTrack.push({ d, day: nowDay(Game), pantry: pk, alive: vids.length, kinds });
    } catch (e) { warnOnce('foodTrack', e); }
    for (let p = 0; p < 3; p++) {
      if (policy.upkeep) { try { policy.upkeep(Game, ctx); } catch (e) { warnOnce('upkeep', e); } }
      try { driveFights(Game, policy, ctx); } catch (e) { warnOnce('driveFights', e); }
      try { driveContests(Game, policy, ctx); } catch (e) { warnOnce('driveContests', e); }
      if (Game.over) break;
      try { Game.doAction('wait'); } catch (e) { warnOnce('doAction', e); }
      try { driveFights(Game, policy, ctx); } catch (e) { warnOnce('driveFights2', e); }
      try { driveContests(Game, policy, ctx); } catch (e) { warnOnce('driveContests2', e); }
      if (Game.over) break;
    }
    if (Game.over) break;
    if (policy.daily) { try { policy.daily(Game, ctx); } catch (e) { warnOnce('daily', e); } }
    try { Game.sleep(); } catch (e) { warnOnce('sleep', e); }
    const gd = nowDay(Game);
    try {
      const w = Game.unlockedWave ? Game.unlockedWave() : 1;
      if (waveDay[w] == null) waveDay[w] = gd;
    } catch (e) { warnOnce('waveDay', e); }
    const liv = livingVids(Game).length;
    if (liv === 0) { ctx._deadTail = (ctx._deadTail || 0) + 1; if (ctx._deadTail >= 10) break; }
    else ctx._deadTail = 0;
  }

  // ---- kind-aware death census ----
  const tele = teleStream(Game);
  const deaths = [];
  for (const t of tele) {
    if (t && t.type === 'death') {
      const d = { day: t.day, who: t.who, whoName: nameOf(Game, t.who), cause: t.cause, kind: t.kind, player: !!t.player };
      d.killerId = killerOf(Game, d);
      deaths.push(d);
    }
  }
  const roster = (() => { try { return (Game.state.village || {}).roster || []; } catch (e) { return []; } })();
  const dc = census(deaths, { roster, playerId: 'p' });
  // r24 keeps the r23 split taxonomy (M1a = open-combat v-vs-v, M1b = betrayal-ambush):
  const openCombatVV = (dc.villagerVsVillagerRecs || [])
    .filter(r => String(r.cause) === 'combat')
    .map(r => ({ day: r.day, who: r.whoName, killer: r.killerId, cause: r.cause }));
  const ambushRecs = (dc.villagerVsVillagerRecs || [])
    .filter(r => String(r.cause) === 'ambush')
    .map(r => ({ day: r.day, who: r.whoName, killer: r.killerId, cause: r.cause }));

  // ---- held conversations for the people check (3 per seed) ----
  const convoPath = EVID + `/journey-establishment-r25-convo-seed${seed}.txt`;
  const convoLines = [];
  let favorRepeatHits = 0; // r21 fix-hold: verbatim-repeat favor-requirement lines
  try {
    const cv = livingVids(Game).slice(0, 3);
    convoLines.push(`=== seed ${seed} — held conversations (end day ${nowDay(Game)}) ===`);
    for (const vid of cv) {
      const nm = nameOf(Game, vid);
      const p = (Game.getPerson ? Game.getPerson(vid) : {}) || {};
      convoLines.push(`\n-- ${nm} (${String(vid).slice(0, 8)}) occ=${p.occupation || p.formerOccupation || '?'} --`);
      let r = Game.startConvo(vid);
      convoLines.push(`OPENING: ${r.line}`);
      convoLines.push('choices: ' + ((r.choices || []).map(ch => `[${ch.id}] ${String(ch.label || '').slice(0, 80)}`).join(' | ')));
      const seenReq = {};
      for (let turn = 0; turn < 8; turn++) {
        let choices = (r.choices && r.choices.length) ? r.choices : [];
        if (!choices.length) break;
        const pick = choices.find(ch => /gossip|rumor/.test(ch.id)) || choices.find(ch => /work|food|teach|help/.test(ch.id)) || choices.find(ch => /^want:/.test(ch.id)) || choices.find(ch => ch.id !== 'leave') || null;
        if (!pick) break;
        convoLines.push(`YOU: [${pick.id}] ${pick.label}`);
        r = Game.convoTurn(vid, pick.id);
        if (r.line == null && r.ended) convoLines.push('THEM: (quiet close — no line, ended)');
        else convoLines.push(`THEM: ${r.line}`);
        // favor-requirements verbatim-repeat check (r21 fix must hold)
        if (pick.id === 'favor_requirements' || /favor_requirements/.test(pick.id || '')) {
          const key = String(r.line || '');
          seenReq[key] = (seenReq[key] || 0) + 1;
          if (seenReq[key] >= 3) favorRepeatHits++;
        }
        if (r.ended) { convoLines.push('(ended by engine)'); break; }
      }
      try { const end = Game.endConvo(vid, 'done'); if (end && end.line) convoLines.push('closing: ' + end.line); } catch (e) { convoLines.push('endConvo: ' + e.message); }
    }
  } catch (e) { convoLines.push('ERROR: ' + e.message); }
  try { fs.writeFileSync(convoPath, convoLines.join('\n')); } catch (e) { warnOnce('convoWrite', e); }

  // ---- r24 food-economy analysis: production share bucketed by pantry ----
  let prodByBucket = null;
  try {
    const buckets = { '<4000': { days: 0, prod: 0, alive: 0 }, '4000-8000': { days: 0, prod: 0, alive: 0 }, '>=8000': { days: 0, prod: 0, alive: 0 } };
    let prodTripDays = 0, totalTripDays = 0;
    for (const ft of foodTrack) {
      const b = ft.pantry < 4000 ? '<4000' : ft.pantry < 8000 ? '4000-8000' : '>=8000';
      const bb = buckets[b];
      bb.days++;
      const prod = Object.keys(ft.kinds || {}).filter(k => PROD_KINDS[k]).reduce((t, k) => t + ft.kinds[k], 0);
      bb.prod += prod; bb.alive += (ft.alive || 0);
      if ((ft.alive || 0) > 0) { totalTripDays++; if (prod > 0) prodTripDays++; }
    }
    prodByBucket = {};
    for (const [k, bb] of Object.entries(buckets)) {
      prodByBucket[k] = { days: bb.days, prodShareOfLiving: bb.alive ? +(bb.prod / bb.alive).toFixed(3) : 0 };
    }
    prodByBucket.prodTripDayRate = totalTripDays ? +(prodTripDays / totalTripDays).toFixed(3) : 0;
    prodByBucket.pantryEnd = foodTrack.length ? foodTrack[foodTrack.length - 1].pantry : null;
    prodByBucket.pantryMax = foodTrack.length ? Math.max(...foodTrack.map(ft => ft.pantry)) : null;
  } catch (e) { warnOnce('prodBucket', e); }


  // ---- r25: plenty-deprioritization ledger (census-time full dump; r36 R36b
  // lesson: per-day snapshot before the meal loop is always zero) ----
  let plentyLedgerFinal = null;
  try {
    const vv = (Game.state || {}).village || {};
    const lg = vv._plentyDepri || { days: {} };
    const days = lg.days || {};
    const keys = Object.keys(days).map(k => parseInt(k, 10)).sort((a, b) => a - b);
    let depriTotal = 0, kcalTotal = 0;
    const perDay = {};
    for (const k of keys) {
      const rec = days[k] || {};
      depriTotal += rec.depri || 0; kcalTotal += rec.kcal || 0;
      perDay[k] = { depri: rec.depri || 0, kcal: Math.round(rec.kcal || 0), vids: (rec.vids || []).slice() };
    }
    plentyLedgerFinal = { plentyDays: keys.length, depriTotal, easedKcalTotal: Math.round(kcalTotal), days: perDay, voiceDay: lg.voiceDay != null ? lg.voiceDay : null };
  } catch (e) { warnOnce('plentyLedger', e); }

  // ---- guardrails ----
  const starvation = deaths.filter(t => /starvat|hunger|thirst/.test(String(t.cause || '')) && (t.kind === 'villager' || t.kind === 'person'));
  const wave2day = waveDay[2] != null ? waveDay[2] : null;
  const out = {
    seed, run: 'r25', reachedDay: nowDay(Game), over: !!Game.over, policy: policy.id,
    deaths, deathCensus: dc,
    m1aOpenCombatVV: openCombatVV,
    m1bAmbush: ambushRecs,
    favorRepeatHits,
    guardrails: {
      reachedDay: nowDay(Game), over: !!Game.over,
      starvationDeaths: starvation.map(t => ({ day: t.day, who: t.whoName, cause: t.cause })),
      waveUnlockDays: waveDay, wave2GateOk: wave2day == null || wave2day >= 8,
      popAlive: livingVids(Game).length,
      pantryEnd: Math.round(pantryKcal(Game)),
      contestsFired: contestFires.length,
      pilotAiredDay: ctx._pilotDay != null ? ctx._pilotDay : null,
    },
    transcriptPath: null, convoPath,
    foodTrack, prodByBucket, plentyLedgerFinal,
  };
  try { fs.writeFileSync(EVID + `/journey-establishment-r25-seed${seed}.json`, JSON.stringify(out, null, 1)); } catch (e) { warnOnce('jsonWrite', e); }
  console.log(`[r25] seed ${seed}: day ${out.reachedDay} personDeaths=${dc.personDeaths} vVsV=${dc.villagerVsVillager} openCombatVV=${openCombatVV.length} ambush=${ambushRecs.length} villagerKills=${dc.villagerKilledMonster} favorRepeatHits=${favorRepeatHits} pantryEnd=${(prodByBucket||{}).pantryEnd} pantryMax=${(prodByBucket||{}).pantryMax} prodTripDayRate=${(prodByBucket||{}).prodTripDayRate}`);
  return out;
}

(async () => {
  const results = [];
  for (const seed of SEEDS) {
    try { results.push(await runSeed(seed)); }
    catch (e) { console.error(`[r25] seed ${seed} FAILED:`, (e && e.message) || e); }
  }
  // leg aggregate
  const agg = { run: 'r25', seeds: SEEDS, personDeaths: 0, vVsV: 0, openCombatVV: 0, villagerKilledMonster: 0, playerKilledMonster: 0, villagerDiedToMonster: 0, betrayalAmbush: 0, playerKilledVillager: 0, favorRepeatHits: 0, ambushRecs: [] };
  for (const r of results) {
    const dc = r.deathCensus || {};
    agg.personDeaths += dc.personDeaths || 0;
    agg.vVsV += dc.villagerVsVillager || 0;
    agg.openCombatVV += (r.m1aOpenCombatVV || []).length;
    agg.villagerKilledMonster += dc.villagerKilledMonster || 0;
    agg.playerKilledMonster += dc.playerKilledMonster || 0;
    agg.villagerDiedToMonster += dc.villagerDiedToMonster || 0;
    agg.betrayalAmbush += dc.betrayalAmbush || 0;
    agg.playerKilledVillager += dc.playerKilledVillager || 0;
    agg.favorRepeatHits += r.favorRepeatHits || 0;
    if (r.m1bAmbush && r.m1bAmbush.length) agg.ambushRecs.push({ seed: r.seed, recs: r.m1bAmbush });
    if (r.m1aOpenCombatVV && r.m1aOpenCombatVV.length) agg.openCombatRecs = (agg.openCombatRecs || []).concat({ seed: r.seed, recs: r.m1aOpenCombatVV });
  }
  try { fs.writeFileSync(EVID + '/journey-establishment-r25-teleagg.json', JSON.stringify(agg, null, 1)); } catch (e) { warnOnce('aggWrite', e); }
  console.log('[r25] aggregate:', JSON.stringify(agg));
})().catch(e => { console.error('[r25] FATAL', (e && e.stack) || e); process.exit(1); });
