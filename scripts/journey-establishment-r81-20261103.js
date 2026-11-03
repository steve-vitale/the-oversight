#!/usr/bin/env node
// Journey leg: ESTABLISHMENT (days 14-40 window, 42d horizon per r71)
// R81 (2026-11-03). Lean pilot driver: competent policy, one seed per
// process (no cross-seed harness leakage), dawn-signal instrumentation,
// daily alive/pantry trace, end census, 2 held convos (goon-first).
// Purpose: (a) play establishment on the dawn-signal build, (b) count
// real dawn-signal fires vs genuine waiting-favor opportunities, (c)
// village assessment in plain words + people check.
// Usage: SEEDS=961 DAYS=42 node scripts/journey-establishment-r81-20261103.js
//   EVID defaults to the goal hidden_files evidence dir for 2026-11-03.
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const EVID = process.env.EVID || '/home/hatch/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-11-03';
const { loadGame, setupGame, driveFights, driveContests } = require('./sim-harness');
const { competent } = require('./policies/competent');

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [961]);
const DAYS = parseInt(process.env.DAYS || '42', 10);
const _warned = {};
function warnOnce(k, e) { if (!_warned[k]) { _warned[k] = true; console.warn('[r81:' + k + ']', (e && e.message) || e); } }
const nowDay = (Game) => { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } };
function nameOf(Game, id) { try { return Game.displayName(id); } catch (e) { return String(id); } }
function pantryKcal(Game) {
  try { return ((Game.state.village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0); }
  catch (e) { return 0; }
}
function isDead(Game, id) { try { return !!(Game.getPerson(id) || {}).dead; } catch (e) { return false; } }

async function runSeed(seed) {
  const { Game } = await loadGame({ seed, mode: 'mvc', fullTelemetry: true });
  await setupGame(Game);
  const policy = competent;
  const ctx = { policyId: policy.id, notes: [] };
  if (policy.setup) { try { await policy.setup(Game, ctx); } catch (e) { warnOnce('setup', e); } }

  const dayLines = {};
  Game.say = function (...a) {
    try { const d = nowDay(Game); (dayLines[d] = dayLines[d] || []).push('SAY: ' + String(a[0] == null ? '' : a[0])); } catch (e) { warnOnce('say', e); }
  };
  if (typeof Game.sysSay === 'function') {
    Game.sysSay = function (...a) {
      try { const d = nowDay(Game); (dayLines[d] = dayLines[d] || []).push('SYS: ' + String(a[0] == null ? '' : a[0])); } catch (e) { warnOnce('sysSay', e); }
    };
  }
  // Dawn-signal instrument: wrap the method (endDay calls it via this.*),
  // log every call's return; never mutate, never consume RNG.
  const dawnCalls = [];
  if (typeof Game.jointFavorDawnSignal === 'function') {
    const orig = Game.jointFavorDawnSignal.bind(Game);
    Game.jointFavorDawnSignal = function (...a) {
      const out = orig(...a);
      try { dawnCalls.push({ day: nowDay(Game), out: (out || []).map(o => ({ vid: String(o.vid), kind: o.kind, due: o.due, line: o.line })) }); } catch (e) {}
      return out;
    };
  } else { dawnCalls.push({ day: null, out: null, note: 'METHOD-MISSING' }); }

  const daily = [];
  const dawnOpps = [];
  const dawnLedgers = [];
  let startCensus = null;
  try {
    const v0 = Game.state.village || {};
    startCensus = (v0.roster || []).map(id => ({ id: String(id), name: nameOf(Game, id) }));
  } catch (e) { startCensus = null; }
  let deadTail = 0;
  for (let d = 1; d <= DAYS; d++) {
    for (let p = 0; p < 3; p++) {
      if (policy.upkeep) { try { policy.upkeep(Game, ctx); } catch (e) { warnOnce('upkeep', e); } }
      try { driveFights(Game, policy, ctx); } catch (e) { warnOnce('fights', e); }
      try { driveContests(Game, policy, ctx); } catch (e) { warnOnce('contests', e); }
      if (Game.over) break;
      try { Game.doAction('wait'); } catch (e) { warnOnce('wait', e); }
      try { driveFights(Game, policy, ctx); } catch (e) { warnOnce('fights2', e); }
      try { driveContests(Game, policy, ctx); } catch (e) { warnOnce('contests2', e); }
      if (Game.over) break;
    }
    if (Game.over) break;
    if (policy.daily) { try { policy.daily(Game, ctx); } catch (e) { warnOnce('daily', e); } }
    try { Game.sleep(); } catch (e) { warnOnce('sleep', e); }
    // Post-sleep dawn scan: predicates still read true for signaled favors
    // (they check window + partner-at-home + dayPart 0, not the signal flag),
    // so this is an honest opportunity denominator for the dawn just passed.
    try {
      const v = Game.state.village || {};
      const waiting = [];
      const allJoint = [];
      for (const vid of (v.roster || [])) {
        const f = (v.favorLedger || {})[vid];
        if (!f || (f.kind !== 'forage_help' && f.kind !== 'water_haul')) continue;
        allJoint.push({ vid: String(vid), name: nameOf(Game, vid), kind: f.kind, dawnSignaledDay: f.dawnSignaledDay ?? null });
        let w = false;
        try { w = f.kind === 'forage_help' ? !!Game.forageFavorWaiting?.(vid) : !!Game.waterFavorWaiting?.(vid); } catch (e) { w = false; }
        if (w) waiting.push({ vid: String(vid), name: nameOf(Game, vid), kind: f.kind, dawnSignaledDay: f.dawnSignaledDay ?? null });
      }
      if (allJoint.length) dawnLedgers.push({ day: nowDay(Game), joint: allJoint });
      if (waiting.length) dawnOpps.push({ day: nowDay(Game), waiting });
    } catch (e) { warnOnce('dawnOpp', e); }
    const roster = ((Game.state.village || {}).roster || []);
    const alive = roster.filter(id => !isDead(Game, id)).length;
    daily.push({ day: nowDay(Game), alive, roster: roster.length, pantryKcal: Math.round(pantryKcal(Game)), over: !!Game.over });
    if (alive === 0) { deadTail++; if (deadTail >= 10) break; } else deadTail = 0;
  }

  const tele = (() => { try { return (Game.state.telemetry || []).slice(); } catch (e) { return []; } })();
  const deaths = [];
  for (const t of tele) if (t && t.type === 'death') deaths.push({ day: t.day, who: nameOf(Game, t.who), cause: t.cause, kind: t.kind, player: !!t.player });
  let wave = 1; try { wave = Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) {}
  const v = Game.state.village || {};
  const census = [];
  for (const id of (v.roster || [])) {
    let p = null; try { p = Game.getPerson ? Game.getPerson(id) : null; } catch (e) {}
    let health = null; try { health = ((v.health || {})[id] !== undefined ? v.health[id] : null); } catch (e) {}
    let sick = false; try { sick = !!((v.sick || {})[id]); } catch (e) {}
    let equipped = []; try { equipped = Object.values((p && p.equipped) || {}).map(x => x && x.itemId).filter(Boolean); } catch (e) {}
    let known = null;
    try {
      const k = p && (p.knownPlants || p.known || p.codex);
      known = k ? (Array.isArray(k) ? k.length : Object.keys(k).length) : null;
    } catch (e) {}
    census.push({ id: String(id), name: nameOf(Game, id), dead: isDead(Game, id),
      occ: (p && (p.occupation || p.formerOccupation)) || '?', health, sick, equipped, knownCount: known });
  }
  const saySignalLines = [];
  for (const d of Object.keys(dayLines)) for (const ln of dayLines[d]) if (/is waiting at Haven to/.test(ln)) saySignalLines.push({ day: parseInt(d, 10), line: ln.replace(/^SAY: /, '') });

  // People check: 2 held convos at end of run (top cook-ish fallback: first
  // two living non-player villagers in roster order), goon-first, 8 turns.
  const convoLines = [];
  const living = (v.roster || []).filter(id => String(id) !== String(Game.villagerId) && !isDead(Game, id));
  for (const vid of living.slice(0, 2)) {
    const nm = nameOf(Game, vid);
    const p = (() => { try { return Game.getPerson(vid) || {}; } catch (e) { return {}; } })();
    convoLines.push(`\n-- ${nm} (${String(vid)}) occ=${p.occupation || p.formerOccupation || '?'} --`);
    try {
      let r = Game.startConvo(vid);
      convoLines.push(`OPENING: ${r.line}`);
      const seen = {};
      for (let turn = 0; turn < 8; turn++) {
        const choices = (r.choices && r.choices.length) ? r.choices : [];
        if (!choices.length) { convoLines.push('(choices empty)'); break; }
        let pick = null;
        if (choices.find(ch => ch.id === 'goon')) pick = choices.find(ch => ch.id === 'goon');
        else if (choices.find(ch => ch.id === 'ask:personal') && !seen['ask:personal']) pick = choices.find(ch => ch.id === 'ask:personal');
        else pick = choices.find(ch => /work|food|teach|help|craft|build/.test(ch.id) && !seen[ch.id])
          || choices.find(ch => /gossip|rumor/.test(ch.id) && !seen[ch.id])
          || choices.find(ch => /^want:/.test(ch.id) && !seen[ch.id])
          || choices.find(ch => ch.id !== 'leave' && ch.id !== 'bye' && !seen[ch.id])
          || null;
        if (!pick) { convoLines.push('(no pick)'); break; }
        if (pick.id !== 'goon') seen[pick.id] = 1;
        convoLines.push(`YOU: [${pick.id}] ${(pick.label || '').slice(0, 80)}`);
        r = Game.convoTurn(vid, pick.id);
        convoLines.push(`THEM: ${r.line == null ? '(null)' : r.line}`);
        if (r.ended) { convoLines.push('(ended by engine)'); break; }
      }
      try { const end = Game.endConvo(vid, 'done'); if (end && end.line) convoLines.push('closing: ' + end.line); } catch (e) { convoLines.push('endConvo: ' + e.message); }
    } catch (e) { convoLines.push('ERROR: ' + e.message); }
  }

  let finalLedger = null;
  try {
    const vF = Game.state.village || {};
    finalLedger = Object.entries(vF.favorLedger || {}).map(([vid, f]) => ({ vid: String(vid), name: nameOf(Game, vid), kind: f && f.kind, dawnSignaledDay: f && f.dawnSignaledDay !== undefined ? f.dawnSignaledDay : null }));
  } catch (e) { finalLedger = null; }
  const out = { seed, run: 'r81', days: DAYS, endDay: nowDay(Game), gameOver: !!Game.over, startCensus,
    aliveAt40: (daily.find(x => x.day === 40) || daily[daily.length - 1] || {}).alive ?? null,
    aliveEnd: daily.length ? daily[daily.length - 1].alive : null,
    waveReached: wave, pantryKcalEnd: Math.round(pantryKcal(Game)),
    deaths, census, daily, dawnCalls, dawnOpportunities: dawnOpps, dawnLedgers, finalFavorLedger: finalLedger, saySignalLines };
  fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, `journey-establishment-r81-seed${seed}.json`), JSON.stringify(out, null, 2));
  fs.writeFileSync(path.join(EVID, `journey-establishment-r81-convo-seed${seed}.txt`), convoLines.join('\n'));
  console.log(`SEED ${seed}: endDay=${out.endDay} over=${out.gameOver} aliveEnd=${out.aliveEnd} aliveAt40=${out.aliveAt40} wave=${wave} deaths=${deaths.length} dawnCalls=${dawnCalls.filter(c => c.out && c.out.length).length} dawnOppDays=${dawnOpps.length} saySignals=${saySignalLines.length} pantryEnd=${out.pantryKcalEnd}`);
  return out;
}

(async () => {
  for (const s of SEEDS) { try { await runSeed(s); } catch (e) { console.error(`SEED ${s} CRASH:`, e && e.stack || e); process.exitCode = 1; } }
})();
