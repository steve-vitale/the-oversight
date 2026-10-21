#!/usr/bin/env node
// Journey leg: ESTABLISHMENT (days 14-40) R22 — DEATH-TAXONOMY CORRECTION (2026-10-21).
// Rotation index 1 (establishment). Base: master@91b5518db.
// Pre-registered in hidden_files/evidence/2026-10-21/journey-establishment-r22-note.md.
//
// r21's "villager-vs-villager carnage" was a taxonomy misread: tele('death')
// fires for monster corpses too, and game.js registers a villager's monster
// kill as kind:'monster', cause:'villager combat'. This run replays the r21
// pilot seeds on the current base with the kind-aware census
// (scripts/lib/death-census.js) and publishes the corrected tables.
//
// Binding: M1 taxonomy reproduces (person deaths <=3/seed, 0 true v-vs-v,
// villager monster-kills >=2 on >=3/4 seeds); M2 people (>=6 transcripts
// sense-read, r21 favor-repeat fix holds); M3 correction shipped.
// Guardrails: day 44 all seeds, no softlocks, wave-2 >= d8, starvation reported.
// Usage: SEEDS=61 node scripts/journey-establishment-r22-20261021.js
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVID = process.env.EVID || '/home/hatch/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-21';
const { loadGame, setupGame, driveFights, driveContests } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { census } = require('./lib/death-census');

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [61, 82, 103, 124]);
const DAYS = parseInt(process.env.DAYS || '42', 10);

const _warned = {};
function warnOnce(key, e) {
  if (_warned[key]) return;
  _warned[key] = true;
  console.warn('[r22:' + key + ']', (e && e.message) || e);
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
  for (let d = 1; d <= DAYS; d++) {
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

  // ---- held conversations for the people check (3 per seed) ----
  const convoPath = EVID + `/journey-establishment-r22-convo-seed${seed}.txt`;
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

  // ---- guardrails ----
  const starvation = deaths.filter(t => /starvat|hunger|thirst/.test(String(t.cause || '')) && (t.kind === 'villager' || t.kind === 'person'));
  const wave2day = waveDay[2] != null ? waveDay[2] : null;
  const out = {
    seed, run: 'r22', reachedDay: nowDay(Game), over: !!Game.over, policy: policy.id,
    deaths, deathCensus: dc,
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
  };
  try { fs.writeFileSync(EVID + `/journey-establishment-r22-seed${seed}.json`, JSON.stringify(out, null, 1)); } catch (e) { warnOnce('jsonWrite', e); }
  console.log(`[r22] seed ${seed}: day ${out.reachedDay} personDeaths=${dc.personDeaths} vVsV=${dc.villagerVsVillager} villagerKills=${dc.villagerKilledMonster} favorRepeatHits=${favorRepeatHits}`);
  return out;
}

(async () => {
  const results = [];
  for (const seed of SEEDS) {
    try { results.push(await runSeed(seed)); }
    catch (e) { console.error(`[r22] seed ${seed} FAILED:`, (e && e.message) || e); }
  }
  // leg aggregate
  const agg = { run: 'r22', seeds: SEEDS, personDeaths: 0, vVsV: 0, villagerKilledMonster: 0, playerKilledMonster: 0, villagerDiedToMonster: 0, betrayalAmbush: 0, playerKilledVillager: 0, favorRepeatHits: 0 };
  for (const r of results) {
    const dc = r.deathCensus || {};
    agg.personDeaths += dc.personDeaths || 0;
    agg.vVsV += dc.villagerVsVillager || 0;
    agg.villagerKilledMonster += dc.villagerKilledMonster || 0;
    agg.playerKilledMonster += dc.playerKilledMonster || 0;
    agg.villagerDiedToMonster += dc.villagerDiedToMonster || 0;
    agg.betrayalAmbush += dc.betrayalAmbush || 0;
    agg.playerKilledVillager += dc.playerKilledVillager || 0;
    agg.favorRepeatHits += r.favorRepeatHits || 0;
  }
  try { fs.writeFileSync(EVID + '/journey-establishment-r22-teleagg.json', JSON.stringify(agg, null, 1)); } catch (e) { warnOnce('aggWrite', e); }
  console.log('[r22] aggregate:', JSON.stringify(agg));
})().catch(e => { console.error('[r22] FATAL', (e && e.stack) || e); process.exit(1); });
