#!/usr/bin/env node
// journey-crisis-r38-aftermath-20261021.js — CRISIS LEG r38: the siege aftermath.
// Two questions: (1) do siege dead get mourned SPONTANEOUSLY (no driver-forced
// grief beats — only the game's own channels: sayLog grief lines, the witness's
// own lately topic, awayNews); (2) what becomes of lingering raiders (do they
// drift off within ~6 nights as promised, or stick?).
// Canon: docs/MONSTER-WAVES.md (fights not rolled), design call #8 2026-10-16
// (lingerers: endure-default 6-day valve or real sortie), death-liturgy
// 2026-10-21 (griefLine codas, presence-gated).
// Forked from journey-crisis-r35-siege-20261020.js. Key differences:
//  - registerDeath instrument reads o.villagerId + o.kind (r36: cause strings
//    lie; monster kills with cause 'sortie combat'/'villager combat' are NOT
//    village deaths — filter on kind).
//  - NO driven grief convos. One ask:lately convo per person death (days 2-7,
//    witness = first living non-player): the topic choice is the NPC's own.
//  - Lingering-episode tracker: daily count, gorge via raidPillage instrument,
//    resolution via resolveAidCrisis + answerLingerer instruments.
//  - Telemetry schema: defenderFights, playerFights, defendedCount,
//    latelyDefenseCount top-level (r35 named next: align crisis schema).
// Usage: SEED=101 node scripts/journey-crisis-r38-aftermath-20261021.js
// Output: JSON record to stdout; narrative to stderr.
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
function playerAtHaven(Game) { try { return Game.playerAtHaven(); } catch (e) { return null; } }
function isPersonDeath(o) {
  const k = String((o && o.kind) || '');
  return k === 'person' || k === 'villager';
}

function pickLately(choices, lastPickId) {
  let pool = choices.filter(c => c.id !== lastPickId);
  if (!pool.length) pool = choices;
  let pick = pool.find(c => c.id === 'ask:lately');
  if (!pick) pick = pool.find(c => /^(dlg:help|dlg:details|want:)/.test(c.id));
  if (!pick) pick = pool.find(c => !/^(leave|bye|goodbye)/.test(c.id));
  return pick || null;
}

// One ask:lately convo with a witness. The TOPIC is the NPC's own — the
// driver only asks "what's new" (r37 probe framing). Scans NPC lines for
// mourning (names the dead / grief keywords) and defense content.
function driveLately(Game, vid, tag, deadFirst, maxTurns) {
  maxTurns = maxTurns || 8;
  const out = [`## ${tag} — lately with ${firstName(rawName(Game, vid))} (d${dayOf(Game)})`];
  const npcLines = [];
  let lastPickId = null;
  try { Game.startConvo(vid); } catch (e) { return { text: out.join('\n') + ' (startConvo threw: ' + e.message + ')', mourn: false, defense: false }; }
  for (let t = 0; t < maxTurns; t++) {
    const choices = Game.convoChoices(vid) || [];
    if (!choices.length) { out.push('(no choices offered)'); break; }
    const pick = pickLately(choices, lastPickId);
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
    // one lately answer is enough — the topic is chosen, don't grind
    if (pick.id === 'ask:lately' && t >= 1) break;
  }
  try { Game.endConvo(vid, 'left'); } catch (e) {}
  const griefRe = new RegExp(`mourn|grief|griev|miss (her|him|them)|dead|died|death|grave|burial|funeral|lost her|lost him|lost them|fire feels smaller${deadFirst ? '|' + deadFirst.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : ''}`, 'i');
  const defenseRe = /raid|treeline|defend|defense|defended|stood|fought|fight|monster|attack|wound/i;
  const mourn = npcLines.some(l => griefRe.test(l));
  const defense = npcLines.some(l => defenseRe.test(l));
  return { text: out.join('\n'), mourn, defense, npcLines: npcLines.slice(0, 12) };
}

async function main() {
  const E = console.error;
  const { Game } = await loadGame({ seed: SEED, mode: 'crisis-siege-r38', fullTelemetry: true });
  await setupGame(Game);
  const playerVid = (() => { try { return String(Game.villagerId || ''); } catch (e) { return ''; } })();
  const rec = {
    seed: SEED, playerVid,
    raids: [], raidFights: [], reliefs: [], reliefAnswers: [],
    deaths: [], crises: [], aidResolutions: [], lingererAnswers: [],
    gorges: [], burials: [], latelyConvos: [], episodes: [],
    dawns: [], notes: [], sayLog: [], convos: [],
  };

  // ---- instrumentation (all call-through) ----
  const _say = Game.say;
  Game.say = function (msg) {
    try {
      const s = String(msg || '');
      if (/💀|mourn|grief|griev|grave|burial|funeral|fire feels smaller|Nobody's talking much|The village mourns|🐗 RAID|lingering|gorges at the treeline|drove them back|met them at the door|Nobody met|treeline is quiet|still hold.*treeline|didn't come back|drift off|moved-on|The treeline holds/i.test(s))
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
      const person = isPersonDeath(o);
      rec.deaths.push({
        day: dayOf(Game),
        vid: String(o.villagerId || o.vid || o.id || '?').slice(0, 16),
        kind: String(o.kind || '?'),
        cause: String(o.cause || '?').slice(0, 60),
        name: String(o.name || rawName(Game, o.villagerId) || '?').slice(0, 40),
        person,
        present: playerAtHaven(Game),
      });
      E(`[DEATH] d${dayOf(Game)} person=${person} kind=${o.kind} cause=${o.cause}`);
    } catch (e) {}
    return r;
  };
  const _fireCrisis = Game.fireCrisis;
  Game.fireCrisis = function (kind, ctx) {
    rec.crises.push({ day: dayOf(Game), kind });
    E(`[CRISIS] d${dayOf(Game)} ${kind}`);
    return _fireCrisis ? _fireCrisis.call(this, kind, ctx) : undefined;
  };
  const _resolveAid = Game.resolveAidCrisis;
  Game.resolveAidCrisis = function (how) {
    const r = _resolveAid ? _resolveAid.apply(this, arguments) : undefined;
    try { rec.aidResolutions.push({ day: dayOf(Game), how: String(how) }); E(`[AID-RESOLVE] d${dayOf(Game)} ${how}`); } catch (e) {}
    return r;
  };
  const _ansLing = Game.answerLingerer;
  Game.answerLingerer = function (how) {
    const r = _ansLing ? _ansLing.apply(this, arguments) : undefined;
    try { rec.lingererAnswers.push({ day: dayOf(Game), how: String(how) }); } catch (e) {}
    return r;
  };
  const _pillage = Game.raidPillage;
  Game.raidPillage = function (v, kcal) {
    const got = _pillage ? _pillage.apply(this, arguments) : 0;
    try { rec.gorges.push({ day: dayOf(Game), asked: Math.round(kcal || 0), got: Math.round(got || 0) }); } catch (e) {}
    return got;
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
    rec.dawns.push({
      day: dayOf(Game), label: label || '', pantry: pantryKcal(Game),
      pop: livingRoster(Game).length, wounded: woundedList(Game).length,
      lingering: lingeringCount(Game),
      relief: (() => { try { return Game.state.relief ? Game.state.relief.kind : null; } catch (e) { return null; } })(),
      deathsToday: rec.deaths.filter(e => e.day === dayOf(Game) && e.person).length,
      raidsSoFar: rec.raids.length, raidFightsSoFar: rec.raidFights.length,
    });
  };
  sampleDawn('established');

  // ---- lingering episode tracker ----
  let openEp = null;
  const trackLingering = () => {
    const n = lingeringCount(Game);
    const d = dayOf(Game);
    if (n > 0 && !openEp) {
      openEp = { startDay: d, startLingering: n, gorge: 0, maxLingering: n };
      E(`[EPISODE] d${d} opens with ${n} lingerers`);
    }
    if (openEp) {
      openEp.maxLingering = Math.max(openEp.maxLingering, n);
      if (n === 0) {
        const sinceStart = rec.aidResolutions.filter(x => x.day >= openEp.startDay);
        const sortie = rec.lingererAnswers.filter(x => x.day >= openEp.startDay);
        openEp.endDay = d;
        openEp.days = d - openEp.startDay;
        openEp.resolution = sortie.length ? 'sortie' : (sinceStart.length ? sinceStart[sinceStart.length - 1].how : 'unknown');
        rec.episodes.push(openEp);
        E(`[EPISODE] d${d} closed after ${openEp.days}d via ${openEp.resolution}; gorge=${openEp.gorge}`);
        openEp = null;
      }
    }
  };

  // ---- phase 2: the siege season, 3-day chunks ----
  const endDay = ESTABLISH + SIEGE_DAYS;
  const latelyDone = new Set();
  while (dayOf(Game) < endDay && !Game.over) {
    await runDays(Game, oracleV2, { days: 3 });
    if (Game.over) break;
    const d = dayOf(Game);
    if (livingRoster(Game).length <= 1) { rec.notes.push(`death-aware stop d${d}: pop<=1`); break; }
    trackLingering();
    // attribute gorges to the open episode
    if (openEp) {
      const newG = rec.gorges.filter(g => g.day >= openEp.startDay && !g.epCounted);
      for (const g of newG) { g.epCounted = true; openEp.gorge += g.got; }
    }
    sampleDawn('chunk');

    // beat: ONE ask:lately convo per person death, days 2-7 after, witness =
    // first living non-player. The topic is the NPC's own — driver just asks.
    for (const death of rec.deaths) {
      if (!death.person || latelyDone.has(death.vid + ':' + death.day)) continue;
      if (d - death.day < 2 || d - death.day > 7) continue;
      latelyDone.add(death.vid + ':' + death.day);
      const witness = livingRoster(Game).find(id => id !== death.vid && id !== playerVid)
        || livingRoster(Game).find(id => id !== death.vid);
      if (witness) {
        const deadFirst = firstName(death.name);
        const cv = driveLately(Game, witness, `lately-d${d} after ${deadFirst}'s death`, deadFirst, 8);
        rec.latelyConvos.push({ day: d, deathDay: death.day, forVid: String(death.vid).slice(0, 16), forName: deadFirst, surfacedMourning: cv.mourn, surfacedDefense: cv.defense });
        rec.convos.push(cv.text);
        E(`[LATELY] d${d} for ${deadFirst}: mourning=${cv.mourn} defense=${cv.defense}`);
      } else {
        rec.notes.push(`d${d}: no living witness for lately check (${firstName(death.name)})`);
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
  if (openEp) { // window ended with lingerers still out there
    openEp.endDay = dayOf(Game); openEp.days = openEp.endDay - openEp.startDay;
    openEp.resolution = 'unresolved-at-window-end';
    rec.episodes.push(openEp); openEp = null;
  }

  // unburied person corpses (informational — burial is a manual player action)
  let corpses = [];
  try {
    const cs = Game.corpses ? Game.corpses() : (Game.state.corpses || []);
    corpses = (cs || []).filter(c => { try { return Game.corpseIsPerson(c); } catch (e) { return c && (c.kind === 'person' || c.kind === 'villager'); } })
      .map(c => ({ name: String(c.name || '?').slice(0, 30), dayDied: c.dayDied }));
  } catch (e) {}
  rec.unburiedPersonCorpses = corpses;

  // ---- telemetry schema (r35 named next) ----
  rec.defenderFights = rec.raidFights.filter(f => f.vid !== playerVid).length;
  rec.playerFights = rec.raidFights.filter(f => f.vid === playerVid).length;
  rec.defendedCount = rec.raids.filter(r => rec.raidFights.some(f => f.day === r.day)).length;
  rec.latelyDefenseCount = rec.latelyConvos.filter(c => c.surfacedDefense).length;

  rec.notes.push(`ended d${dayOf(Game)} over=${!!Game.over} pop=${livingRoster(Game).length} pantry=${pantryKcal(Game)}`);
  E(`[DONE] seed ${SEED}: raids=${rec.raids.length} raidFights=${rec.raidFights.length} personDeaths=${rec.deaths.filter(x => x.person).length} episodes=${rec.episodes.length} lately=${rec.latelyConvos.length}`);
  console.log(JSON.stringify(rec));
}

main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
