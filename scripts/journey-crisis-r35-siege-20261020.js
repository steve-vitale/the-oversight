#!/usr/bin/env node
// journey-crisis-r35-siege-20261020.js — CRISIS LEG r35: the siege season, social-fabric lens.
// When monster raids grip a competent village repeatedly, do villagers act like
// people — organizing defense, tending the wounded, grieving the dead — or does
// the village break (panic, desertion, unfought raids, untended wounds)?
// Canon: docs/MONSTER-WAVES.md (fights not rolled), docs/CORRUPTION.md (fear),
// Steve: "violence desperate and traumatic". Prior art: r10 (siege+famine),
// r28/r29 (schism/exile), r30 (raid defense beat narration), r32 (disease),
// r34 (famine; sieges dominated death profiles, unassessed here).
// Question: during a sustained siege season, does the village bend or break?
// Usage: SEED=101 node scripts/journey-crisis-r35-siege-20261020.js
// Output: JSON record to stdout; narrative + transcripts to stderr.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { oracleV2 } = require('./policies/oracleV2');

const SEED = parseInt(process.env.SEED || '101', 10);
const ESTABLISH = 20, SIEGE_DAYS = parseInt(process.env.SIEGE_DAYS || '70', 10);

function dayOf(Game) { try { return Game.state.scholar.day || 0; } catch (e) { return 0; } }
function pantryKcal(Game) {
  try { return Math.round((Game.state.village.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0)); }
  catch (e) { return 0; }
}
function firstName(n) { return String(n || 'Someone').split(' ')[0]; }
function rawName(Game, vid) {
  try { const rc = ((Game.state.village || {}).rosterChars || {})[vid]; if (rc && rc.name) return rc.name; } catch (e) {}
  try { return Game.displayName(vid); } catch (e) {}
  return String(vid).slice(0, 12);
}
function livingRoster(Game) {
  const v = Game.state.village || {};
  return (v.roster || []).filter(id => {
    try { const vp = Game.vpOf(id); return vp && !vp.dead; } catch (e) { return true; }
  });
}
function woundedList(Game) {
  const v = Game.state.village || {};
  const out = [];
  for (const id of (v.roster || [])) {
    try {
      if (id === Game.villagerId) continue;
      const vp = Game.vpOf(id); if (!vp || vp.dead) continue;
      const h = (v.health || {})[id];
      if (h !== undefined && h < 70) out.push({ vid: id, health: Math.round(h) });
    } catch (e) {}
  }
  return out;
}
function lingeringCount(Game) {
  try { return (Game.lingeringRaiders() || []).length; } catch (e) { return 0; }
}

function pickChoice(choices, mode, lastPickId) {
  const isLoopTrap = (c) => /^(betrayal:investigate|betrayal:site|betrayal:witnesses)/.test(c.id || '');
  const notRepeat = (c) => c.id !== lastPickId;
  const griefKw = /dead|died|death|mourn|grief|griev|funeral|burial|grave|lost|gone/i;
  const defenseKw = /raid|treeline|defend|defense|stood|fought|fight|monster|attack|wound|hurt|injur/i;
  let pool = choices.filter(notRepeat);
  if (!pool.length) pool = choices;
  let pick = null;
  const kw = mode === 'grief' ? griefKw : defenseKw;
  pick = pool.find(c => c.id === 'ask:lately');
  if (!pick) pick = pool.find(c => kw.test(c.text || '') && !isLoopTrap(c));
  if (!pick) pick = pool.find(c => /^gq:/.test(c.id));
  if (!pick) pick = pool.find(c => /^(dlg:help|dlg:details|want:)/.test(c.id));
  if (!pick) pick = pool.find(c => !/^(leave|bye|goodbye)/.test(c.id) && !isLoopTrap(c));
  if (!pick) pick = pool.find(c => !/^(leave|bye|goodbye)/.test(c.id));
  return pick || null;
}

function driveConvo(Game, vid, tag, maxTurns, mode) {
  maxTurns = maxTurns || 12;
  mode = mode || 'defense';
  const out = [`## ${tag} — talking to ${firstName(rawName(Game, vid))} (d${dayOf(Game)})`];
  const npcLines = [];
  let lastPickId = null;
  try { Game.startConvo(vid); } catch (e) { return { text: out.join('\n') + ' (startConvo threw: ' + e.message + ')', surfaced: false }; }
  for (let t = 0; t < maxTurns; t++) {
    const choices = Game.convoChoices(vid) || [];
    if (!choices.length) { out.push('(no choices offered)'); break; }
    const pick = pickChoice(choices, mode, lastPickId);
    if (!pick) break;
    if (/^(leave|bye|goodbye)/.test(pick.id)) break;
    lastPickId = pick.id;
    out.push(`> YOU PICK [${pick.id}] ${(pick.text || '').slice(0, 100)}`);
    try { Game.convoTurn(vid, pick.id); } catch (e) { out.push(`(turn threw: ${e.message})`); break; }
    const c = Game.convoGet(vid);
    if (!c || !c.active) { out.push('(conversation ended by the engine)'); break; }
    const last = (c.transcript || []).slice(-2);
    for (const e of last) {
      out.push(`${e.who === 'you' ? 'YOU' : 'NPC'}: ${String(e.text).slice(0, 400)}`);
      if (e.who !== 'you') npcLines.push(String(e.text));
    }
    out.push('');
  }
  try { Game.endConvo(vid, 'left'); } catch (e) {}
  const c = Game.convoGet(vid);
  out.push('\n### FULL TRANSCRIPT');
  for (const e of ((c && c.transcript) || [])) {
    out.push(`${e.who === 'you' ? 'YOU' : 'NPC'}: ${String(e.text).slice(0, 600)}`);
    if (e.who !== 'you') npcLines.push(String(e.text));
  }
  // surfacing is scored on NPC lines only — never the driver's own tags/picks
  const scanRe = mode === 'grief'
    ? /mourn|grief|griev|miss (her|him|them)|dead|died|death|grave|burial|funeral|lost her|lost him|lost them/i
    : /raid|treeline|defend|defense|defended|stood|fought|fight|monster|attack|wound/i;
  const surfaced = npcLines.some(l => scanRe.test(l));
  return { text: out.join('\n'), surfaced, npcLines };
}

async function main() {
  const E = console.error;
  const { Game } = await loadGame({ seed: SEED, mode: 'crisis-siege-r35', fullTelemetry: true });
  await setupGame(Game);
  const rec = {
    seed: SEED, raids: [], raidFights: [], reliefs: [], reliefAnswers: [],
    deaths: [], crises: [], burials: [], griefConvos: [], defenseConvos: [],
    dawns: [], convos: [], notes: [], sayLog: [],
  };

  // ---- instrumentation (all call-through) ----
  const _say = Game.say;
  Game.say = function (msg) {
    try {
      const s = String(msg || '');
      if (/🐗 RAID|THE SIEGE|Triage tents|🛟|lingering|gorges at the treeline|drove them back|met them at the door|Nobody met/i.test(s))
        rec.sayLog.push({ day: dayOf(Game), line: s.slice(0, 280) });
    } catch (e) {}
    return _say ? _say.apply(this, arguments) : undefined;
  };
  const _raidTick = Game.havenRaidTick;
  Game.havenRaidTick = function () {
    const before = ((Game.state.village || {}).lastRaidDay) || 0;
    const r = _raidTick ? _raidTick.apply(this, arguments) : false;
    const after = ((Game.state.village || {}).lastRaidDay) || 0;
    if (after > before) {
      rec.raids.push({ day: dayOf(Game), lingeringAfter: lingeringCount(Game) });
      E(`[RAID] d${dayOf(Game)} fired; lingering=${lingeringCount(Game)}`);
    }
    return r;
  };
  const _rwme = Game.resolveWildMonsterEncounter;
  Game.resolveWildMonsterEncounter = function (vid, m, opts) {
    const r = _rwme ? _rwme.apply(this, arguments) : undefined;
    try {
      if (opts && opts.raid) {
        rec.raidFights.push({ day: dayOf(Game), vid: String(vid).slice(0, 16), outcome: (r && r.outcome) || '?' });
        E(`[RAIDFIGHT] d${dayOf(Game)} ${firstName(rawName(Game, vid))}: ${(r && r.outcome) || '?'}`);
      }
    } catch (e) {}
    return r;
  };
  const _relief = Game.raiseRelief;
  Game.raiseRelief = function (kind, ctx) {
    const r = _relief ? _relief.apply(this, arguments) : undefined;
    if (r) { rec.reliefs.push({ day: dayOf(Game), kind: String(kind) }); E(`[RELIEF] d${dayOf(Game)} kind=${kind}`); }
    return r;
  };
  const _ansRelief = Game.answerRelief;
  Game.answerRelief = function (opt) {
    const r = _ansRelief ? _ansRelief.apply(this, arguments) : undefined;
    rec.reliefAnswers.push({ day: dayOf(Game), opt: String(opt), result: String(r).slice(0, 40) });
    E(`[RELIEF-ANSWER] d${dayOf(Game)} ${opt} -> ${String(r).slice(0, 40)}`);
    return r;
  };
  const _regDeath = Game.registerDeath;
  Game.registerDeath = function (opts) {
    const r = _regDeath ? _regDeath.call(this, opts) : undefined;
    try {
      const o = opts || {};
      rec.deaths.push({ day: dayOf(Game), vid: String(o.vid || o.id || '?').slice(0, 16), cause: String(o.cause || '?').slice(0, 60) });
      E(`[DEATH] d${dayOf(Game)} ${(o.cause || '?')}`);
    } catch (e) {}
    return r;
  };
  const _fireCrisis = Game.fireCrisis;
  Game.fireCrisis = function (kind, ctx) {
    rec.crises.push({ day: dayOf(Game), kind });
    E(`[CRISIS] d${dayOf(Game)} ${kind}`);
    return _fireCrisis ? _fireCrisis.call(this, kind, ctx) : undefined;
  };
  const _bury = Game.buryCorpse;
  Game.buryCorpse = function () {
    const r = _bury ? _bury.apply(this, arguments) : undefined;
    rec.burials.push({ day: dayOf(Game), ok: !!r });
    return r;
  };

  // ---- phase 1: establish ----
  E(`[SETUP] seed ${SEED}: oracleV2 establishing ${ESTABLISH}d...`);
  await runDays(Game, oracleV2, { days: ESTABLISH });
  if (Game.over) { E('[SETUP] game over during establish — abort'); console.log(JSON.stringify(rec)); return; }
  E(`[ESTABLISHED] d${dayOf(Game)} pop=${livingRoster(Game).length} pantry=${pantryKcal(Game)}`);

  const sampleDawn = (label) => {
    let givesSum = 0, takesSum = 0;
    try {
      const v = Game.state.village || {};
      for (const k in (v.gives || {})) givesSum += (v.gives[k] || 0);
      for (const k in (v.takes || {})) takesSum += (v.takes[k] || 0);
    } catch (e) {}
    const last = rec.dawns.length ? rec.dawns[rec.dawns.length - 1] : null;
    rec.dawns.push({
      day: dayOf(Game), label: label || '', pantry: pantryKcal(Game),
      pop: livingRoster(Game).length, wounded: woundedList(Game).length,
      lingering: lingeringCount(Game),
      relief: (() => { try { return Game.state.relief ? Game.state.relief.kind : null; } catch (e) { return null; } })(),
      gaveSince: Math.round(givesSum - (last ? last.givesSum : givesSum)),
      givesSum: Math.round(givesSum),
      deathsToday: rec.deaths.filter(e => e.day === dayOf(Game)).length,
      raidsSoFar: rec.raids.length, raidFightsSoFar: rec.raidFights.length,
    });
  };
  sampleDawn('established');

  // ---- phase 2: the siege season, 3-day chunks ----
  // 3-day chunks (not 5): defense convos must land inside the 'defended'
  // memory's 7-day lately window — a 5-day chunk delays the beat past it.
  const endDay = ESTABLISH + SIEGE_DAYS;
  const griefedVids = new Set();
  let defenseConvosRun = 0;
  const raidedConvoDone = new Set();
  while (dayOf(Game) < endDay && !Game.over) {
    await runDays(Game, oracleV2, { days: 3 });
    if (Game.over) break;
    const d = dayOf(Game);
    // death-aware tail: village dead/scattered -> stop
    if (livingRoster(Game).length <= 1) { rec.notes.push(`death-aware stop d${d}: pop<=1`); break; }
    sampleDawn('chunk');

    // beat: after each NEW raid, drive one convo with a defender (threshold-crossing).
    // Talk to a defender who hasn't been interviewed yet when possible.
    const interviewed = new Set(rec.defenseConvos.map(c => c.vid));
    for (const raid of rec.raids) {
      if (raidedConvoDone.has(raid.day) || raid.day > d || d - raid.day > 6) continue;
      raidedConvoDone.add(raid.day);
      const fighters = rec.raidFights.filter(f => f.day === raid.day && f.outcome !== '?');
      const fresh = fighters.filter(f => !interviewed.has(f.vid));
      const pick = fresh.length ? fresh[0] : (fighters.length ? fighters[0] : null);
      const talkTo = pick ? pick.vid : (livingRoster(Game)[1] || livingRoster(Game)[0]);
      if (talkTo && defenseConvosRun < 10) {
        defenseConvosRun++;
        interviewed.add(String(talkTo).slice(0, 16));
        const cv = driveConvo(Game, talkTo, `raid-d${raid.day} defense`, 10, 'defense');
        rec.defenseConvos.push({ day: d, raidDay: raid.day, vid: String(talkTo).slice(0, 16), surfaced: cv.surfaced });
        rec.convos.push(cv.text);
        E(`[CONVO] defense raid-d${raid.day} (talked d${d}) surfaced=${cv.surfaced}`);
      }
    }
    // beat: grief convos 1-7d after each death (threshold-crossing, one per death)
    for (const death of rec.deaths) {
      if (griefedVids.has(death.vid) || d - death.day < 1 || d - death.day > 7) continue;
      griefedVids.add(death.vid);
      const talkTo = livingRoster(Game).find(id => id !== death.vid) || livingRoster(Game)[0];
      if (talkTo) {
        const cv = driveConvo(Game, talkTo, `grief-d${d} for ${firstName(rawName(Game, death.vid))}`, 10, 'grief');
        rec.griefConvos.push({ day: d, forVid: String(death.vid).slice(0, 16), surfaced: cv.surfaced });
        rec.convos.push(cv.text);
        E(`[CONVO] grief d${d} surfaced=${cv.surfaced}`);
      }
    }
    // competent-player relief: when raid relief opens and wounded exist, take triage
    try {
      const rel = Game.state.relief;
      if (rel && rel.kind === 'raid' && !rel.used.triage) {
        const w = woundedList(Game);
        if (w.length) {
          E(`[RELIEF-AUTO] d${d} answering triage for ${w.length} wounded`);
          Game.answerRelief('triage');
        } else {
          rec.notes.push(`d${d}: raid relief open, no wounded — left unanswered`);
        }
      }
    } catch (e) {}
  }

  rec.notes.push(`ended d${dayOf(Game)} over=${!!Game.over} pop=${livingRoster(Game).length} pantry=${pantryKcal(Game)}`);
  E(`[DONE] seed ${SEED}: raids=${rec.raids.length} raidFights=${rec.raidFights.length} reliefs=${rec.reliefs.length} deaths=${rec.deaths.length}`);
  console.log(JSON.stringify(rec));
}

main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
