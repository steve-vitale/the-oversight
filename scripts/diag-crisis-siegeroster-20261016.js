#!/usr/bin/env node
// diag-crisis-siegeroster-20261016.js — CRISIS LEG r19: THE SIEGE ROSTER.
// Who bleeds for the village? Fresh angle (never journey-tested roster-first):
// when the raid hits, do villagers fight real blow-by-blow fights and take
// real attributed combat deaths, does the aid channel fire (aidCrisis raise +
// runner/aidFight actuation or honest absence), are the fallen mourned BY
// NAME, and are the wounded tended?
// Real pathway only: havenRaidTick (cooldown cleared + roll bypassed by
// looping — no side effects on failed calls) → defender fights via
// resolveWildMonsterEncounter {raid:true} → aid crisis (raiseAidCrisis,
// reactive) → lingering raiders → endurance/sortie → resolution. The one
// player-side act: a single competent callForHelp('runner') while the first
// raid's crisis is live (a real player move; records nolink/sent/died/hot
// honestly). Endure vs sortie varies by seed via ANSWER env.
// Per seed: census before/after, per-dawn fallen-cause diffs, mid-siege
// convos (2) + end convos (4), FULL transcripts, SENSE-read by the analyst.
// Usage: SEED=1717 ANSWER=endure node scripts/diag-crisis-siegeroster-20261016.js
// Output: JSON record to stdout; narrative + census + transcripts to stderr.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays, driveFights } = require('./sim-harness');
const { oracleV2 } = require('./policies/oracleV2');
const { competent } = require('./policies/competent');

const SEED = parseInt(process.env.SEED || '1717', 10);
const ANSWER = process.env.ANSWER || 'endure'; // endure | sortie for lingerers

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
function lingeringN(Game) {
  try { return (Game.worldMonsters() || []).filter(m => m.lingering).length; } catch (e) { return 0; }
}
function census(Game, label) {
  const v = Game.state.village || {};
  const lines = [`--- CENSUS (${label}), day ${dayOf(Game)}, Bearer: ${firstName(rawName(Game, Game.villagerId))} ---`];
  for (const vid of (v.roster || [])) {
    const rc = (v.rosterChars || {})[vid] || {};
    const sick = (v.sick || {})[vid];
    const hp = (v.health || {})[vid];
    lines.push(`  ${firstName(rc.name || vid)} [${rc.occupationId || rc.formerOccupation || '?'}]${hp !== undefined && hp < 100 ? ' HP' + Math.round(hp) : ''}${sick ? ' SICK(' + (sick.name || '?') + ')' : ''}`);
  }
  const fallen = (v.fallen || []).slice(-10).map(f => {
    let nm = f.name || '?';
    try { if (nm === '?' && f.villagerId) nm = rawName(Game, f.villagerId); } catch (e) {}
    return `${firstName(nm)} d${f.day} (${f.cause})`;
  });
  lines.push(`  fallen (recent): ${fallen.length ? fallen.join('; ') : 'none'}`);
  lines.push(`  pantry: ${pantryKcal(Game).toLocaleString()} kcal | world monsters: ${(Game.worldMonsters ? Game.worldMonsters().length : 0)} | lingering: ${lingeringN(Game)}`);
  return lines.join('\n');
}

// Natural-path conversation driver (r5/r18 lineage): engage the situation.
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
    if (!pick) pick = choices.find(c => /raid|siege|monster|defend|dead|died|gone|grief|mourn|buri|funeral|tend|wound|hurt|scared|afraid|night|attack|treeline/i.test(c.text || ''));
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
  const full = [];
  for (const e of ((c && c.transcript) || [])) {
    full.push(`${e.who === 'you' ? 'YOU' : 'NPC'}: ${String(e.text).slice(0, 600)}`);
  }
  out.push(full.join('\n'));
  // siege-carry regex for the metric (tight anchors; SENSE-read by analyst)
  const txt = full.join('\n');
  const siegeCarry = /(raid|siege|treeline|defend|drove (it|them) off|bar the hall)/i.test(txt);
  const mournCarry = /(died|dead|gone|buried|funeral|mourn|since .* died|rest .* soul)/i.test(txt);
  const woundCarry = /(wound|hurt|bleeding|stitched|bound up|healer|sat with me|tended)/i.test(txt);
  const namedFallen = /(Nobody says .* name|since .* died|miss .*|bury .*|laid .* to rest)/i.test(txt);
  out.push(`\nCARRY-FLAGS: siege=${siegeCarry} mourn=${mournCarry} wound=${woundCarry} namedFallen=${namedFallen}`);
  return { text: out.join('\n'), flags: { siegeCarry, mournCarry, woundCarry, namedFallen } };
}

async function main() {
  const { Game } = await loadGame({ seed: SEED, mode: 'crisis-siegeroster', fullTelemetry: true });
  await setupGame(Game);
  const E = console.error;
  const rec = {
    seed: SEED, answer: ANSWER, raids: [], defenderFights: [], villagerDeaths: [],
    aid: { raised: [], calls: [], runners: [], allyFights: [], resolved: [] },
    healerRounds: [], memories: [], deathGossip: [], lingerers: [],
    convos: [], sayLines: [], gate: {}, notes: [], anomalies: [],
  };

  // ---- instrumentation ----
  const _say = Game.say;
  Game.say = function (t) {
    const s = String(t || '');
    if (/raid|siege|treeline|lingering|gorge|pantry|defend|🕯️|💀|died|dead|kill|aid|runner|signal fire|relay|moved-on|driven off|palisade|wound|hurt|healer|rounds|tend|sortie|endure|all clear|bar the|inside/i.test(s))
      rec.sayLines.push({ day: dayOf(Game), text: s.slice(0, 300) });
    return _say ? _say.call(this, t) : undefined;
  };
  const _tick = Game.havenRaidTick;
  Game.havenRaidTick = function () {
    const d = dayOf(Game), mons = Game.worldMonsters ? Game.worldMonsters().length : 0, pk = pantryKcal(Game);
    const r = _tick ? _tick.call(this) : false;
    if (!!rec._silentNights) return r; // controlled loop calls land below
    rec.raids.push({ day: d, fired: !!r, monsters: mons, pantry: pk, manual: !!rec._manualRaid });
    if (r) E(`[RAID] day ${d} FIRED (monsters=${mons}, pantry=${pk}${rec._manualRaid ? ', CONTROLLED' : ', natural'})`);
    return r;
  };
  const _enc = Game.resolveWildMonsterEncounter;
  Game.resolveWildMonsterEncounter = function (vid, m, opts) {
    const hpBefore = ((Game.state.village || {}).health || {})[vid];
    const r = _enc ? _enc.call(this, vid, m, opts) : undefined;
    const hpAfter = ((Game.state.village || {}).health || {})[vid];
    const v = Game.state.village || {};
    const alive = (v.roster || []).map(String).includes(String(vid));
    rec.defenderFights.push({
      day: dayOf(Game), defender: firstName(rawName(Game, vid)), monster: (m && m.id) || '?',
      hpBefore, hpAfter, aliveAfter: alive, raid: !!(opts && opts.raid),
    });
    E(`[FIGHT] ${firstName(rawName(Game, vid))} vs ${(m && m.id) || '?'}${opts && opts.raid ? ' (RAID)' : ''} — hp ${hpBefore} -> ${hpAfter}${alive ? '' : ' (DIED)'}`);
    return r;
  };
  const _reg = Game.registerDeath;
  Game.registerDeath = function (rec0) {
    const r = _reg ? _reg.call(this, rec0) : undefined;
    try {
      if (rec0 && (rec0.kind === 'villager' || rec0.kind === 'person')) {
        // resolve via rosterChars first: registerDeath carries the
        // knowledge-gated descriptor ("A woman in her 30s"), which
        // firstName() would mangle to "A".
        let nm = null;
        try { nm = rawName(Game, rec0.villagerId); } catch (e) {}
        nm = nm || rec0.name;
        rec.villagerDeaths.push({
          day: dayOf(Game), name: firstName(String(nm)), cause: rec0.cause || '?',
          killerId: rec0.killerId || null, scholar: rec0.villagerId === Game.villagerId,
        });
        E(`[DEATH] ${firstName(String(nm))} d${dayOf(Game)} cause=${rec0.cause || '?'}${rec0.villagerId === Game.villagerId ? ' (SCHOLAR)' : ''}`);
      }
    } catch (e) {}
    return r;
  };
  const _raise = Game.raiseAidCrisis;
  Game.raiseAidCrisis = function (name, wave) {
    const c = _raise ? _raise.call(this, name, wave) : null;
    if (c) { rec.aid.raised.push({ day: dayOf(Game), name: String(name).slice(0, 80), wave: wave || 1 }); E(`[AID] crisis raised day ${dayOf(Game)}: ${String(name).slice(0, 60)} (wave ${wave || 1})`); }
    return c;
  };
  const _resolve = Game.resolveAidCrisis;
  Game.resolveAidCrisis = function (how) {
    const r = _resolve ? _resolve.call(this, how) : null;
    rec.aid.resolved.push({ day: dayOf(Game), how, ret: r });
    E(`[AID] crisis resolved day ${dayOf(Game)}: ${how}`);
    return r;
  };
  const _call = Game.callForHelp;
  Game.callForHelp = function (tier, opts) {
    const r = _call ? _call.call(this, tier, opts) : null;
    rec.aid.calls.push({ day: dayOf(Game), tier, result: r });
    E(`[AID] callForHelp('${tier}') → ${JSON.stringify(r)}`);
    return r;
  };
  const _aidFight = Game.aidFight;
  if (_aidFight) Game.aidFight = function (vid, mdef, m, opts) {
    const r = _aidFight.call(this, vid, mdef, m, opts);
    if (r) { rec.aid.allyFights.push({ day: dayOf(Game), vid: firstName(rawName(Game, vid)), monster: (m && m.id) || '?', outcome: r.outcome }); E(`[AID-FIGHT] ${firstName(rawName(Game, vid))} vs ${(m && m.id) || '?'} outcome=${r.outcome}`); }
    return r;
  };
  const _heal = Game.healerRounds;
  if (_heal) Game.healerRounds = function () {
    const r = _heal.call(this);
    if (r) { rec.healerRounds.push({ day: dayOf(Game), treated: firstName(rawName(Game, r)) }); E(`[HEAL] day ${dayOf(Game)}: rounds treated ${firstName(rawName(Game, r))}`); }
    return r;
  };
  const _rem = Game.remember;
  if (_rem) Game.remember = function (vid, kind, text, opts) {
    try {
      if (/^(defended|tended|tended_by|hero|rest)$/.test(kind))
        rec.memories.push({ day: dayOf(Game), who: firstName(rawName(Game, vid)), kind, text: String(text || '').slice(0, 120) });
    } catch (e) {}
    return _rem.call(this, vid, kind, text, opts);
  };
  const _gossip = Game.seedGossip;
  if (_gossip) Game.seedGossip = function (kind, data, opts) {
    try { if (kind === 'death') rec.deathGossip.push({ day: dayOf(Game), who: data && data.who ? firstName(rawName(Game, data.who)) : '?' }); } catch (e) {}
    return _gossip.call(this, kind, data, opts);
  };
  const _fire = Game.fireCrisis;
  if (_fire) Game.fireCrisis = function (kind) {
    const r = _fire.call(this, kind);
    if (r) E(`[BEAT] fireCrisis('${kind}') day ${dayOf(Game)}`);
    return r;
  };

  // ---- phase 1: establish ----
  E(`[SETUP] seed ${SEED} (${ANSWER}): oracleV2 establishing...`);
  let lastDay = dayOf(Game);
  await runDays(Game, oracleV2, { days: 12 });
  if (dayOf(Game) <= lastDay) rec.anomalies.push(`clock stall: day stayed ${lastDay} after 12d establish`);
  E(census(Game, 'established'));

  // ---- phase 2: raid gate ----
  const v = Game.state.village || {};
  const hx = (v.px !== undefined && v.px !== null) ? v.px : 4;
  const hy = (v.py !== undefined && v.py !== null) ? v.py : 4;
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
  while (pantryKcal(Game) < 3000 && extraDays < 8 && !Game.over) {
    await runDays(Game, oracleV2, { days: 2 }); extraDays += 2;
  }
  rec.gate.pantry = pantryKcal(Game); rec.gate.extraDays = extraDays;
  E(`[GATE] day ${dayOf(Game)}: pantry=${pantryKcal(Game)} (extra ${extraDays}d), monsters=${Game.worldMonsters().length}`);

  // ---- phase 3: CONTROLLED raid 1, player at haven ----
  function controlledRaid(tag, stayPut) {
    if (!stayPut) { try { Game.travelTo(hx, hy); } catch (e) {} }
    const vv = Game.state.village || {};
    vv.lastRaidDay = dayOf(Game) - 8; // cooldown cleared
    let fired = false, tries = 0;
    rec._manualRaid = true;
    while (!fired && tries < 12 && !Game.over) { tries++; fired = Game.havenRaidTick(); }
    rec._manualRaid = false;
    rec.gate[tag + 'Tries'] = tries;
    E(`[RAID] ${tag} ${fired ? 'FIRED' : 'DID NOT FIRE'} after ${tries} night(s); playerAtHaven=${Game.playerAtHaven()}`);
    return fired;
  }
  const rosterBefore = (v.roster || []).length;
  const pantryBefore = pantryKcal(Game);
  const fired1 = controlledRaid('raid1');
  E(census(Game, 'raid1 night'));
  if (fired1 && Game.pendingEncounter) {
    E(`[PLAYER] pendingEncounter vs ${Game.pendingMonsterId} — FACING IT`);
    const pHpBefore = (Game.state.scholar || {}).hp;
    try { Game.startCombat(); } catch (e) { rec.notes.push('startCombat threw: ' + e.message); }
    try { driveFights(Game, competent, { policyId: 'competent', notes: [] }); } catch (e) { rec.notes.push('driveFights threw: ' + e.message); }
    try { Game.pendingEncounter = false; Game.pendingMonsterId = null; } catch (e) {}
    E(`[PLAYER] fight done: hp ${pHpBefore} -> ${(Game.state.scholar || {}).hp}`);
  }
  // the competent player move: call for help while the crisis is live
  const crisisLive1 = !!(Game.aidCrisis && Game.aidCrisis());
  if (fired1 && crisisLive1) {
    E(`[AID] crisis live — player calls for a RUNNER (real competent move)`);
    try { Game.callForHelp('runner'); } catch (e) { rec.notes.push('callForHelp threw: ' + e.message); }
  } else {
    rec.notes.push(`no aid call after raid1 (fired=${fired1}, crisisLive=${crisisLive1})`);
  }

  // ---- phase 4: 6d aftermath → mid-siege convos ----
  const dayAfterRaid = dayOf(Game);
  for (let i = 0; i < 6 && !Game.over && dayOf(Game) < 55; i++) await runDays(Game, competent, { days: 1 });
  if (dayOf(Game) <= dayAfterRaid) rec.anomalies.push(`clock stall after raid1: day stayed ${dayAfterRaid}`);
  E(census(Game, 'raid1 +6d'));
  E(`[AID] lingering=${lingeringN(Game)} aidCrisis=${Game.aidCrisis ? JSON.stringify(Game.aidCrisis()) : 'none'}`);
  const fighters = [...new Set(rec.defenderFights.filter(f => f.raid && f.aliveAfter).map(f => f.defender))];
  const vids = () => (Game.state.village || {}).roster || [];
  const vidByFirst = (fn) => vids().find(id => firstName(rawName(Game, id)) === fn);
  const midDef = fighters.map(vidByFirst).find(Boolean);
  if (midDef) { const c = driveConvo(Game, midDef, 'MID-SIEGE defender', 12); E(c.text); rec.convos.push({ when: 'mid', kind: 'defender', flags: c.flags }); }
  else rec.notes.push('no living raid defender for mid-siege convo');
  const midOther = vids().find(id => id !== Game.villagerId && id !== midDef);
  if (midOther) { const c = driveConvo(Game, midOther, 'MID-SIEGE other', 10); E(c.text); rec.convos.push({ when: 'mid', kind: 'other', flags: c.flags }); }

  // ---- phase 5: answer the lingerers (seed-varying) ----
  const lingN = lingeringN(Game);
  rec.lingerers.push({ day: dayOf(Game), n: lingN, answer: lingN ? ANSWER : 'none-needed' });
  if (lingN > 0 && Game.answerLingerer) {
    E(`[LINGER] ${lingN} lingerers — answering '${ANSWER}'`);
    try {
      const r = Game.answerLingerer(ANSWER);
      E(`[LINGER] answerLingerer → ${JSON.stringify(r && r.ok !== undefined ? { ok: r.ok, why: r.why } : r)}`);
      rec.notes.push(`answerLingerer(${ANSWER}) → ${JSON.stringify(r)}`);
    } catch (e) { rec.notes.push('answerLingerer threw: ' + e.message); }
  }

  // ---- phase 6: controlled raid 2, player genuinely AWAY ----
  // travelTo only walks ADJACENT travelTargets — chain hops outward until
  // the player is off the haven tile (harness lesson, r19 pilot).
  E(`[AWAY] traveling out for the away-case raid...`);
  let awayOk = false;
  for (let hop = 0; hop < 6 && !awayOk; hop++) {
    let targets = [];
    try { targets = Game.travelTargets() || []; } catch (e) {}
    // hop to the target farthest from haven
    targets.sort((a, b) =>
      (Math.abs(b.x - hx) + Math.abs(b.y - hy)) - (Math.abs(a.x - hx) + Math.abs(a.y - hy)));
    let moved = false;
    for (const t of targets) {
      try { if (Game.travelTo(t.x, t.y)) { moved = true; break; } } catch (e) {}
    }
    if (!moved) { rec.notes.push(`away travel stalled at hop ${hop} (no travel target accepted)`); break; }
    try { awayOk = !Game.playerAtHaven(); } catch (e) {}
  }
  rec.awayTravelOk = awayOk;
  E(`[AWAY] playerAtHaven=${Game.playerAtHaven()} (travel ok: ${awayOk})`);
  if (!awayOk) rec.anomalies.push('away travel failed — raid2 ran at-haven; away-case invalid');
  const pk2 = pantryKcal(Game);
  const fired2 = controlledRaid('raid2', true); // stay away — do NOT travel back to haven
  if (Game.pendingEncounter) { try { Game.pendingEncounter = false; Game.pendingMonsterId = null; } catch (e) {} rec.notes.push('AWAY raid set pendingEncounter despite player away — BUG'); }
  E(`[AWAY] fired=${fired2} playerAtHaven=${Game.playerAtHaven()} pantry ${pk2} -> ${pantryKcal(Game)}`);
  try {
    const an = (Game.state.scholar || {}).awayNews || [];
    rec.awayNews = an.slice(-4);
    E(`[AWAY] awayNews: ${JSON.stringify(an.slice(-4))}`);
  } catch (e) {}

  // ---- phase 7: run to d55 (death-aware) ----
  while (dayOf(Game) < 55 && !Game.over) {
    await runDays(Game, competent, { days: 2 });
    const vv = Game.state.village || {};
    if ((vv.roster || []).length <= 2) {
      E(`[TAIL] pop≤2 at d${dayOf(Game)} — +10d tail max`);
      await runDays(Game, competent, { days: 10 });
      break;
    }
  }
  E(census(Game, 'end'));

  // ---- phase 8: end convos (4): 2 defenders/wounded, 2 others ----
  const endFighters = [...new Set(rec.defenderFights.filter(f => f.aliveAfter).map(f => f.defender))];
  const picked = [];
  for (const fn of endFighters.slice(0, 2)) { const id = vidByFirst(fn); if (id) picked.push({ id, kind: 'defender' }); }
  const wounded = vids().filter(id => { const hp = ((Game.state.village || {}).health || {})[id]; return hp !== undefined && hp < 70 && !picked.find(p => p.id === id) && id !== Game.villagerId; });
  for (const id of wounded.slice(0, 2 - picked.length)) picked.push({ id, kind: 'wounded' });
  for (const id of vids()) {
    if (picked.length >= 4) break;
    if (id !== Game.villagerId && !picked.find(p => p.id === id)) picked.push({ id, kind: 'other' });
  }
  for (const p of picked.slice(0, 4)) {
    const c = driveConvo(Game, p.id, `END ${p.kind}`, 12);
    E(c.text);
    rec.convos.push({ when: 'end', kind: p.kind, who: firstName(rawName(Game, p.id)), flags: c.flags });
  }

  // ---- wrap-up ----
  const vEnd = Game.state.village || {};
  rec.endState = {
    day: dayOf(Game), living: (vEnd.roster || []).length,
    fallen: (vEnd.fallen || []).map(f => {
      let nm = f.name || '?';
      try { if (nm === '?' && f.villagerId) nm = rawName(Game, f.villagerId); } catch (e) {}
      return { name: firstName(nm), day: f.day, cause: f.cause };
    }),
    pantry: pantryKcal(Game), lingering: lingeringN(Game),
    aidCrisis: Game.aidCrisis ? (Game.aidCrisis() ? 'active' : 'none') : 'n/a',
  };
  const causeClass = (c) => /combat|monster|runner|sortie/i.test(String(c)) ? 'combat' : 'other';
  const combatDeaths = rec.villagerDeaths.filter(d => !d.scholar && causeClass(d.cause) === 'combat');
  E(`[SUMMARY] seed ${SEED}: raids=${rec.raids.filter(r => r.fired).length} raidFights=${rec.defenderFights.filter(f => f.raid).length} defenderDeaths=${rec.defenderFights.filter(f => f.raid && !f.aliveAfter).length} villagerCombatDeaths=${combatDeaths.length} aidRaised=${rec.aid.raised.length} aidCalls=${rec.aid.calls.length} allyFights=${rec.aid.allyFights.length} healerRounds=${rec.healerRounds.length} convos=${rec.convos.length} anomalies=${rec.anomalies.length}`);
  process.stdout.write(JSON.stringify(rec, null, 1) + '\n');
}

main().catch(e => { console.error('FATAL: ' + (e && e.stack || e)); process.exit(1); });
