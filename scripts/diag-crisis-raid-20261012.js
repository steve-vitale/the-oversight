#!/usr/bin/env node
// diag-crisis-raid-20261012.js — CRISIS LEG r5: the raid, played end-to-end.
// Uses the REAL raid pathway (havenRaidTick via progDaily + one controlled
// call with the 7-day cooldown cleared), never spawns "siege monsters" by
// hand. The only thing the controlled call bypasses is the 18% nightly roll
// — every downstream system (defender fights via fieldFight, aid crisis,
// lingering gorgers, pillage, pendingEncounter -> startCombat, crisis
// resolution 'fought'/'moved-on', the 'the-siege' crisis beat) is real code.
// Per seed:
//   1. oracleV2 10 days (establish), travelTo haven.
//   2. Gate check: 3+ world monsters (spawn near haven if short — noted),
//      pantry >= 3000 (extend oracleV2 if short — the wealth gate is data).
//   3. Controlled raid, player AT haven (pendingEncounter -> real fight).
//   4. 10 competent days: lingering gorge, crisis resolution, deaths, pantry.
//   5. Second controlled raid with the player AWAY (awayNews path).
//   6. Two full-transcript conversations (defender + gossip) — SENSE-TESTING.
//   7. Census before/after/end; natural-raid count from the wrapped tick.
// Usage: SEED=777 node scripts/diag-crisis-raid-20261012.js
// Output: JSON record to stdout; narrative + census + transcripts to stderr.
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
function census(Game, label) {
  const v = Game.state.village || {};
  const lines = [`--- CENSUS (${label}), day ${dayOf(Game)}, Bearer: ${firstName(rawName(Game, Game.villagerId))} ---`];
  for (const vid of (v.roster || [])) {
    const rc = (v.rosterChars || {})[vid] || {};
    const sick = (v.sick || {})[vid];
    lines.push(`  ${firstName(rc.name || vid)} [${rc.occupationId || rc.formerOccupation || '?'}]${sick ? ' SICK(' + (sick.name || '?') + ')' : ''}`);
  }
  const fallen = (v.fallen || []).slice(-8).map(f => `${firstName(f.name || '?')} d${f.day} (${f.cause})`);
  lines.push(`  fallen (recent): ${fallen.length ? fallen.join('; ') : 'none'}`);
  lines.push(`  pantry: ${pantryKcal(Game).toLocaleString()} kcal | world monsters: ${(Game.worldMonsters ? Game.worldMonsters().length : 0)}`);
  return lines.join('\n');
}

// Natural-path conversation driver (same as r4): engage the situation.
function driveConvo(Game, vid, tag, maxTurns) {
  maxTurns = maxTurns || 14;
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
  out.push(`FINAL: want=${(c && c.want && c.want.id) || 'none'} resolution=${(c && c.want && c.want.resolution) || 'n/a'}`);
  out.push('\n### FULL TRANSCRIPT');
  for (const e of ((c && c.transcript) || [])) out.push(`${e.who === 'you' ? 'YOU' : 'NPC'}: ${String(e.text).slice(0, 600)}`);
  return out.join('\n');
}

async function main() {
  const { Game } = await loadGame({ seed: SEED, mode: 'crisis-raid', fullTelemetry: true });
  await setupGame(Game);
  const E = console.error;
  const rec = { seed: SEED, raids: [], defenderFights: [], playerFights: [], crises: [], gorge: [], sayLines: [], beats: [], dedupedBeats: [], gate: {}, notes: [] };

  // ---- instrumentation ----
  const _say = Game.say;
  Game.say = function (t) {
    const s = String(t || '');
    if (/raid|siege|treeline|lingering|gorge|pantry|defend|🕯️|💀|died|dead|kill|hush|bulldozer|deer|toad|crisis|call for help|aid|moved-on|driven off|palisade/i.test(s))
      rec.sayLines.push({ day: dayOf(Game), text: s.slice(0, 280) });
    return _say ? _say.call(this, t) : undefined;
  };
  const _tick = Game.havenRaidTick;
  Game.havenRaidTick = function () {
    const d = dayOf(Game), mons = Game.worldMonsters ? Game.worldMonsters().length : 0, pk = pantryKcal(Game);
    const r = _tick ? _tick.call(this) : false;
    rec.raids.push({ day: d, fired: !!r, monsters: mons, pantry: pk, manual: !!rec._manualRaid });
    if (r) E(`[RAID] day ${d} FIRED (monsters=${mons}, pantry=${pk}${rec._manualRaid ? ', CONTROLLED' : ', natural'})`);
    return r;
  };
  const _enc = Game.resolveWildMonsterEncounter;
  Game.resolveWildMonsterEncounter = function (vid, m) {
    const hpBefore = ((Game.state.village || {}).health || {})[vid];
    const r = _enc ? _enc.call(this, vid, m) : undefined;
    const hpAfter = ((Game.state.village || {}).health || {})[vid];
    const v = Game.state.village || {};
    const alive = (v.roster || []).map(String).includes(String(vid));
    rec.defenderFights.push({ day: dayOf(Game), defender: firstName(rawName(Game, vid)), monster: (m && m.id) || '?', hpBefore, hpAfter, aliveAfter: alive });
    E(`[DEFEND] ${firstName(rawName(Game, vid))} met ${(m && m.id) || '?'} — hp ${hpBefore} -> ${hpAfter}${alive ? '' : ' (DIED)'}`);
    return r;
  };
  const _fire = Game.fireCrisis;
  Game.fireCrisis = function (kind) {
    const r = _fire ? _fire.call(this, kind) : undefined;
    if (r) { rec.beats.push({ day: dayOf(Game), kind }); E(`[BEAT] fireCrisis('${kind}') day ${dayOf(Game)}`); }
    else rec.dedupedBeats.push({ day: dayOf(Game), kind });
    return r;
  };

  const crisisState = () => {
    try { const c = Game.aidCrisis ? Game.aidCrisis() : null; return c ? { raiders: !!c.raiders, resolved: c.resolved || null, sinceDay: c.sinceDay } : null; }
    catch (e) { return null; }
  };

  // ---- phase 1: establish ----
  E(`[SETUP] seed ${SEED}: oracleV2 establishing village...`);
  await runDays(Game, oracleV2, { days: 10 });
  E(census(Game, 'established'));
  E(`[GATE] day ${dayOf(Game)}: monsters=${Game.worldMonsters ? Game.worldMonsters().length : 0}, pantry=${pantryKcal(Game)}, tier=${Game.havenTier ? Game.havenTier() : '?'}`);

  // ---- phase 2: raid gate ----
  const v = Game.state.village || {};
  const hx = (v.px !== undefined && v.px !== null) ? v.px : 4;
  const hy = (v.py !== undefined && v.py !== null) ? v.py : 4;
  // player to haven for the at-haven raid
  try { Game.travelTo(hx, hy); } catch (e) { rec.notes.push('travelTo haven threw: ' + e.message); }
  let mons = Game.worldMonsters ? Game.worldMonsters().length : 0;
  if (mons < 3) {
    rec.gate.spawned = 3 - mons;
    rec.notes.push(`spawned ${3 - mons} world monsters near haven to open the 3-monster raid gate (real spawnWorldMonster)`);
    const ids = ['hushwolf', 'bulldozer', 'highbeam_deer', 'choir_toad'];
    for (let i = mons; i < 3; i++) {
      try { Game.spawnWorldMonster({ id: ids[i % ids.length] }, hx + 2, hy + 1, {}); } catch (e) {}
    }
  }
  let extraDays = 0;
  while (pantryKcal(Game) < 3000 && extraDays < 12 && !Game.over) {
    await runDays(Game, oracleV2, { days: 2 }); extraDays += 2;
  }
  rec.gate.pantry = pantryKcal(Game); rec.gate.extraDays = extraDays;
  E(`[GATE] raid-ready day ${dayOf(Game)}: pantry=${pantryKcal(Game)} (extra ${extraDays}d), monsters=${Game.worldMonsters().length}, playerAtHaven=${Game.playerAtHaven()}`);

  // ---- phase 3: CONTROLLED raid, player at haven ----
  // Loop the tick until the 18% nightly roll opens (max 12 "nights"); failed
  // calls have no side effects (all early returns precede lastRaidDay). This
  // bypasses only the roll's timing, not the raid machinery.
  v.lastRaidDay = dayOf(Game) - 8; // cooldown cleared
  try { Game.travelTo(hx, hy); } catch (e) { rec.notes.push('travelTo haven threw: ' + e.message); }
  rec.gate.playerAtHaven = Game.playerAtHaven();
  const pantryBefore = pantryKcal(Game);
  const rosterBefore = (v.roster || []).length;
  let fired = false, tries = 0;
  rec._manualRaid = true;
  while (!fired && tries < 12 && !Game.over) { tries++; fired = Game.havenRaidTick(); }
  rec._manualRaid = false;
  rec.gate.raidTries = tries;
  E(`[RAID] controlled raid ${fired ? 'FIRED' : 'DID NOT FIRE'} after ${tries} night(s); playerAtHaven=${Game.playerAtHaven()}`);
  if (!fired) rec.notes.push(`controlled raid never fired in ${tries} nights (18% roll cold)`);
  E(census(Game, 'raid night'));
  // the player faces the raider: pendingEncounter -> startCombat -> real fight
  if (fired && Game.pendingEncounter) {
    E(`[PLAYER] pendingEncounter vs ${Game.pendingMonsterId} — FACING IT`);
    const pHpBefore = (Game.state.scholar || {}).hp;
    let rounds = 0;
    try { Game.startCombat(); } catch (e) { rec.notes.push('startCombat threw: ' + e.message); }
    const ctx = { policyId: 'competent', notes: [] };
    try { driveFights(Game, competent, ctx); } catch (e) { rec.notes.push('driveFights threw: ' + e.message); }
    const f = Game.tbfight;
    rec.playerFights.push({ day: dayOf(Game), monster: Game.pendingMonsterId, hpBefore: pHpBefore, hpAfter: (Game.state.scholar || {}).hp, fightOver: !!(f && f.over), notes: ctx.notes });
    try { Game.pendingEncounter = false; Game.pendingMonsterId = null; } catch (e) {}
    E(`[PLAYER] fight done: hp ${pHpBefore} -> ${(Game.state.scholar || {}).hp}`);
  } else if (fired) {
    rec.notes.push('raid fired but no pendingEncounter for the player (palisade or player position)');
  }
  E(`[CRISIS] aidCrisis after raid: ${JSON.stringify(crisisState())}`);

  // ---- phase 4: 10 competent days of aftermath ----
  const ctx2 = { policyId: 'competent', notes: [] };
  for (let i = 0; i < 10 && !Game.over; i++) {
    await runDays(Game, competent, { days: 1 });
    if (Game.pendingEncounter) { // a follow-up night visit — face it too
      try { Game.startCombat(); driveFights(Game, competent, ctx2); } catch (e) {}
      try { Game.pendingEncounter = false; Game.pendingMonsterId = null; } catch (e) {}
      rec.playerFights.push({ day: dayOf(Game), monster: 'follow-up', hpAfter: (Game.state.scholar || {}).hp });
    }
  }
  E(census(Game, 'after 10d aftermath'));
  E(`[PANTRY] raid ${pantryBefore} -> ${pantryKcal(Game)} (delta ${pantryKcal(Game) - pantryBefore})`);
  E(`[POP] ${rosterBefore} -> ${((Game.state.village || {}).roster || []).length}`);
  E(`[CRISIS] aidCrisis end: ${JSON.stringify(crisisState())}`);
  E(`[BEATS] ${JSON.stringify(rec.beats)}`);

  // ---- phase 5: conversations (SENSE-TESTING) ----
  // snapshot the engine's own hunger model so favors can be judged honest
  try {
    const needSnap = {};
    for (const vid of ((Game.state.village || {}).roster || [])) {
      const n = Game.npcNeeds ? Game.npcNeeds(vid) : {};
      needSnap[firstName(rawName(Game, vid))] = { hunger: n.hunger, away: !!((Game.state.village || {}).away || {})[vid] };
    }
    rec.needSnap = needSnap;
    E(`[NEEDS] ${JSON.stringify(needSnap)}`);
  } catch (e) {}
  const defenders = [...new Set(rec.defenderFights.filter(f => f.aliveAfter).map(f => f.defender))];
  const vids = (Game.state.village || {}).roster || [];
  const vidByFirst = (fn) => vids.find(id => firstName(rawName(Game, id)) === fn);
  const livingDefender = defenders.map(vidByFirst).find(Boolean);
  if (livingDefender) {
    E(driveConvo(Game, livingDefender, 'RAID DEFENDER convo', 14));
  } else { rec.notes.push('no living defender to talk to'); }
  const other = vids.find(id => id !== Game.villagerId && (!defenders.length || firstName(rawName(Game, id)) !== defenders[0]));
  if (other) E(driveConvo(Game, other, 'RAID GOSSIP convo', 12));

  // ---- phase 6: AWAY-case raid ----
  E(`[AWAY] traveling out for the away-case raid...`);
  let awayOk = false;
  const awaySpots = [[hx + 3, hy], [hx - 3, hy], [hx, hy + 3], [hx, hy - 3], [hx + 2, hy + 2]];
  for (const [ax, ay] of awaySpots) {
    try { Game.travelTo(ax, ay); } catch (e) {}
    try { if (!Game.playerAtHaven()) { awayOk = true; break; } } catch (e) {}
  }
  rec.awayTravelOk = awayOk;
  E(`[AWAY] playerAtHaven=${Game.playerAtHaven()} (travel ok: ${awayOk})`);
  v.lastRaidDay = dayOf(Game) - 8;
  const pk2 = pantryKcal(Game);
  let fired2 = false, tries2 = 0;
  rec._manualRaid = true;
  while (!fired2 && tries2 < 12 && !Game.over) { tries2++; fired2 = Game.havenRaidTick(); }
  rec._manualRaid = false;
  rec.awayRaid = { fired: !!fired2, tries: tries2, playerAtHaven: Game.playerAtHaven(), pendingEncounter: !!Game.pendingEncounter, pantryBefore: pk2 };
  if (Game.pendingEncounter) { try { Game.pendingEncounter = false; Game.pendingMonsterId = null; } catch (e) {} rec.notes.push('AWAY raid set pendingEncounter despite player away — BUG'); }
  E(`[AWAY] fired=${fired2} after ${tries2} night(s); playerAtHaven=${Game.playerAtHaven()} pendingEncounter=${!!Game.pendingEncounter}`);
  try {
    const an = (Game.state.scholar || {}).awayNews || [];
    rec.awayRaid.awayNews = an.slice(-3);
    E(`[AWAY] awayNews: ${JSON.stringify(an.slice(-3))}`);
  } catch (e) {}

  E(census(Game, 'final'));
  process.stdout.write(JSON.stringify(rec, null, 1) + '\n');
}

main().catch(e => { console.error('FATAL: ' + (e && e.stack || e)); process.exit(1); });
