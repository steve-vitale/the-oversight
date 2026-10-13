#!/usr/bin/env node
// diag-crisis-memory-20261013.js — CRISIS LEG r6: crisis memory.
// Question: after a night raid, do defenders remember it? Does the lately
// topic ("what's been happening") surface the raid for the villagers who
// bled at the door?
//
// Phase 1-4 mirror the r5 diag tool: oracleV2 establish, controlled REAL
// raid (cooldown cleared, 18% roll looped; all downstream machinery real),
// player at haven faces own fight, 7 competent aftermath days.
// Phase 5 (new): per-villager inspection — village.memory[vid] entries,
// t2LatelyEvent(vid) kind, t2gen_lately(vid) lines — plus full transcripts
// with a defender (ask:lately first), a non-defender, and the bearer.
//
// Usage: SEED=777 node scripts/diag-crisis-memory-20261013.js
// Output: JSON record to stdout; narrative + transcripts to stderr.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, driveFights } = require('./sim-harness');
const { oracleV2 } = require('./policies/oracleV2');
const { competent } = require('./policies/competent');

const SEED = parseInt(process.env.SEED || '777', 10);

function firstName(n) { return String(n || 'Someone').split(' ')[0]; }
function rawName(Game, vid) {
  try { const rc = ((Game.state.village || {}).rosterChars || {})[vid]; if (rc && rc.name) return rc.name; } catch (e) {}
  try { return Game.displayName(vid); } catch (e) {}
  return String(vid).slice(0, 12);
}
function pantryKcal(Game) {
  const v = Game.state.village || {};
  return Math.round(((v.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0)));
}
function dayOf(Game) { try { return Game.state.scholar.day || 0; } catch (e) { return 0; } }

function driveConvo(Game, vid, tag, maxTurns) {
  maxTurns = maxTurns || 12;
  const out = [`## ${tag} — talking to ${firstName(rawName(Game, vid))}`];
  try { Game.startConvo(vid); } catch (e) { return out.join('\n') + ' (startConvo threw: ' + e.message + ')'; }
  try {
    const open = (Game.convoChoices(vid) || []).map(x => `[${x.id}] ${(x.text || x.label || '').slice(0, 90)}`);
    out.push(`OPEN CHOICES (${open.length}): ${open.join(' | ')}`);
  } catch (e) {}
  for (let t = 0; t < maxTurns; t++) {
    const choices = Game.convoChoices(vid) || [];
    if (!choices.length) { out.push('(no choices offered)'); break; }
    let pick = choices.find(c => c.id === 'ask:lately');
    if (!pick) pick = choices.find(c => /^gq:/.test(c.id));
    if (!pick) pick = choices.find(c => /^(dlg:help|dlg:details|want:)/.test(c.id));
    if (!pick) pick = choices.find(c => /raid|siege|monster|defend|dead|died|gone|grief|mourn|buri|funeral|scared|afraid|night|attack/i.test(c.text || ''));
    if (!pick) pick = choices.find(c => !/^(leave|bye|goodbye)/.test(c.id));
    if (!pick) break;
    if (/^(leave|bye|goodbye)/.test(pick.id)) break;
    out.push(`> YOU PICK [${pick.id}] ${(pick.text || '').slice(0, 100)}`);
    try { Game.convoTurn(vid, pick.id); } catch (e) { out.push(`(turn threw: ${e.message})`); break; }
    const c = Game.convoGet(vid);
    if (!c || !c.active) { out.push('(conversation ended by the engine)'); break; }
    const last = (c.transcript || []).slice(-2);
    for (const e of last) out.push(`${e.who === 'you' ? 'YOU' : 'NPC'}: ${String(e.text).slice(0, 400)}`);
    out.push('');
  }
  try { Game.endConvo(vid, 'left'); } catch (e) {}
  const c = Game.convoGet(vid);
  out.push('\n### FULL TRANSCRIPT');
  for (const e of ((c && c.transcript) || [])) out.push(`${e.who === 'you' ? 'YOU' : 'NPC'}: ${String(e.text).slice(0, 600)}`);
  return out.join('\n');
}

async function main() {
  const { Game } = await loadGame({ seed: SEED, mode: 'crisis-memory', fullTelemetry: true });
  await setupGame(Game);
  const E = console.error;
  const rec = { seed: SEED, defenders: [], raidDay: null, defenderFights: [], playerFights: [], memories: {}, lately: {}, latelyLines: {}, notes: [] };

  // instrumentation: defender fights
  const _enc = Game.resolveWildMonsterEncounter;
  Game.resolveWildMonsterEncounter = function (vid, m, opts) {
    const hpBefore = ((Game.state.village || {}).health || {})[vid];
    const r = _enc ? _enc.call(this, vid, m, opts) : undefined;
    const hpAfter = ((Game.state.village || {}).health || {})[vid];
    const v = Game.state.village || {};
    const alive = (v.roster || []).map(String).includes(String(vid));
    const monstId = (m && (m.id || m.monsterId)) || '?';
    const fell = m && (m.hp || 0) <= 0;
    rec.defenderFights.push({ day: dayOf(Game), defender: firstName(rawName(Game, vid)), monster: monstId, hpBefore, hpAfter, aliveAfter: alive, monsterDown: fell });
    E(`[DEFEND] ${firstName(rawName(Game, vid))} met ${monstId} — hp ${hpBefore} -> ${hpAfter}${alive ? '' : ' (DIED)'}${fell ? ' (MONSTER DOWN)' : ''}`);
    return r;
  };

  // phase 1: establish
  E(`[SETUP] seed ${SEED}: oracleV2 establishing village...`);
  await runDays(Game, oracleV2, { days: 10 });
  const v = Game.state.village || {};
  const hx = (v.px !== undefined && v.px !== null) ? v.px : 4;
  const hy = (v.py !== undefined && v.py !== null) ? v.py : 4;
  try { Game.travelTo(hx, hy); } catch (e) {}

  // phase 2: raid gate (same as r5)
  let mons = Game.worldMonsters ? Game.worldMonsters().length : 0;
  if (mons < 3) {
    const ids = ['hushwolf', 'bulldozer', 'highbeam_deer', 'choir_toad'];
    for (let i = mons; i < 3; i++) { try { Game.spawnWorldMonster({ id: ids[i % ids.length] }, hx + 2, hy + 1, {}); } catch (e) {} }
    rec.notes.push('spawned world monsters to open the 3-monster raid gate (real spawnWorldMonster)');
  }
  let extraDays = 0;
  while (pantryKcal(Game) < 3000 && extraDays < 12 && !Game.over) { await runDays(Game, oracleV2, { days: 2 }); extraDays += 2; }
  E(`[GATE] raid-ready day ${dayOf(Game)}: pantry=${pantryKcal(Game)}, monsters=${Game.worldMonsters().length}, playerAtHaven=${Game.playerAtHaven()}`);

  // phase 3: controlled raid, player at haven
  v.lastRaidDay = dayOf(Game) - 8;
  try { Game.travelTo(hx, hy); } catch (e) {}
  const rosterBefore = (v.roster || []).length;
  let fired = false, tries = 0;
  while (!fired && tries < 12 && !Game.over) { tries++; fired = Game.havenRaidTick(); }
  rec.raidDay = fired ? dayOf(Game) : null;
  E(`[RAID] controlled raid ${fired ? 'FIRED day ' + rec.raidDay : 'DID NOT FIRE'} after ${tries} night(s)`);
  if (fired && Game.pendingEncounter) {
    try { Game.startCombat(); } catch (e) {}
    const ctx = { policyId: 'competent', notes: [] };
    const pHpBefore = (Game.state.scholar || {}).hp;
    try { driveFights(Game, competent, ctx); } catch (e) {}
    rec.playerFights.push({ day: dayOf(Game), monster: Game.pendingMonsterId, hpBefore: pHpBefore, hpAfter: (Game.state.scholar || {}).hp });
    try { Game.pendingEncounter = false; Game.pendingMonsterId = null; } catch (e) {}
    E(`[PLAYER] fought ${rec.playerFights[0].monster}: hp ${pHpBefore} -> ${rec.playerFights[0].hpAfter}`);
  }

  // phase 4: 7 aftermath days
  const ctx2 = { policyId: 'competent', notes: [] };
  for (let i = 0; i < 7 && !Game.over; i++) {
    await runDays(Game, competent, { days: 1 });
    if (Game.pendingEncounter) {
      try { Game.startCombat(); driveFights(Game, competent, ctx2); } catch (e) {}
      try { Game.pendingEncounter = false; Game.pendingMonsterId = null; } catch (e) {}
    }
  }
  E(`[AFTER] day ${dayOf(Game)}, pop ${rosterBefore} -> ${((Game.state.village || {}).roster || []).length}, pantry=${pantryKcal(Game)}`);
  const daysAfter = dayOf(Game) - (rec.raidDay || dayOf(Game));
  E(`[AFTER] days since raid: ${daysAfter}`);

  // phase 5: memory + lately inspection per villager
  const roster = ((Game.state.village || {}).roster || []).map(String);
  const defenders = rec.defenderFights.map(f => f.defender);
  rec.defenders = defenders;
  E(`[INSPECT] defenders: ${defenders.join(', ') || 'none'}`);
  for (const vid of roster) {
    const nm = firstName(rawName(Game, vid));
    let mems = [];
    try { mems = (((Game.state.village || {}).memory || {})[vid]) || []; } catch (e) {}
    rec.memories[nm] = mems.map(m => ({ t: m.t, day: m.day, note: String(m.note || '').slice(0, 120) }));
    let ev = null, lines = [];
    try { ev = Game.t2LatelyEvent ? Game.t2LatelyEvent(vid) : null; } catch (e) {}
    try { lines = Game.t2gen_lately ? (Game.t2gen_lately(vid) || []) : []; } catch (e) {}
    rec.lately[nm] = ev ? { kind: ev.kind, note: String(ev.note || ev.name || '').slice(0, 80) } : null;
    rec.latelyLines[nm] = lines.map(l => String(l).slice(0, 200));
    const isDef = defenders.includes(nm);
    E(`[MEM] ${nm}${isDef ? ' (DEFENDER)' : ''}: memories=[${rec.memories[nm].map(m => m.t + '@d' + m.day).join(', ')}] lately=${ev ? ev.kind : 'NONE'}`);
    if (ev) for (const l of lines) E(`        lately: ${String(l).slice(0, 160)}`);
  }

  // phase 6: conversations — defender (ask:lately first), non-defender, bearer
  const vidOf = (nm) => roster.find(v => firstName(rawName(Game, v)) === nm);
  const defVid = vidOf(defenders[0]);
  const nonDefVid = roster.map(v => firstName(rawName(Game, v))).length > 1
    ? roster.find(v => { const n = firstName(rawName(Game, v)); return !defenders.includes(n) && v !== Game.villagerId; })
    : null;
  if (defVid) { E('\n' + driveConvo(Game, defVid, 'DEFENDER (fought at the door)')); }
  else { E('\n(no defender available for conversation)'); rec.notes.push('no defender to interview'); }
  if (nonDefVid) { E('\n' + driveConvo(Game, nonDefVid, 'NON-DEFENDER (was at haven, did not fight)')); }
  const bearerVid = Game.villagerId;
  if (bearerVid && String(bearerVid) !== String(defVid)) { E('\n' + driveConvo(Game, bearerVid, 'BEARER')); }

  rec.notes.push(`days after raid: ${daysAfter}`);
  // leg-level aggregates for telemetry-check baselines
  let defendedCount = 0, latelyDefenseCount = 0;
  for (const vid of roster) {
    const mems = ((((Game.state.village || {}).memory || {})[vid]) || []);
    defendedCount += mems.filter(m => m.t === 'defended').length;
    let ev = null;
    try { ev = Game.t2LatelyEvent ? Game.t2LatelyEvent(vid) : null; } catch (e) {}
    if (ev && ev.kind === 'defense') latelyDefenseCount++;
  }
  rec.defendedCount = defendedCount;
  rec.latelyDefenseCount = latelyDefenseCount;
  process.stdout.write(JSON.stringify(rec, null, 1));
}

main().catch(e => { console.error('FATAL: ' + (e && e.stack || e)); process.exit(1); });
