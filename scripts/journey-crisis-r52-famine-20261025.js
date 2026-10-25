#!/usr/bin/env node
// journey-crisis-r52-famine-20261025.js — CRISIS LEG r52: famine-window
// revision, applied prospectively (r51's proposal, NOT applied in r51).
// Leg question: on the CURRENT build, does r51's revised famine-window
// definition (>=5 famine days in any 7-day span) hold on a fresh panel,
// does the relief stack still fire inside those windows, and does the
// Mabel-style deflection loop recur under the UNCHANGED driver?
// Base: r51's instrument, unchanged driver (famine comparability).
// Additions vs r51: (a) revised-window computation from the daily ledger
// (any 7-day span with >=5 famine days, dawn pc pantry < 1500 kcal,
// pop>1), reported alongside the old consecutive count; (b) a per-convo
// deflection counter — same pick id chosen >=3 times in one convo, with
// the pick id and count, plus NPC deflection-phrasing lines as a
// secondary signal. No driver change, no game change.
// Pre-registration: goal hidden_files/evidence/2026-10-25/journey-crisis-r52-prereg.md
// Usage: SEED=101 node scripts/journey-crisis-r52-famine-20261025.js
// Output: JSON record to stdout; narrative to stderr.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { oracleV2 } = require('./policies/oracleV2');

const SEED = parseInt(process.env.SEED || '101', 10);
const ESTABLISH = 20, WINDOW_DAYS = parseInt(process.env.WINDOW_DAYS || '70', 10);
const FAMINE_PC_KCAL = 1500; // dawn pantry per-capita below this = famine day

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
function hungryDaysSum(Game) {
  try { return (Game.state.village || {}).hungryDays || 0; }
  catch (e) { return 0; }
}
function lingeringCount(Game) {
  try { return (Game.lingeringRaiders() || []).length; } catch (e) { return 0; }
}
function isPersonDeath(o) {
  const k = String((o && o.kind) || '');
  return k === 'person' || k === 'villager';
}
function isStarvation(o) {
  const c = String((o && o.cause) || '').toLowerCase();
  return /starv|hunger|famish|malnut|starved/.test(c);
}
const HUNGER_RE = /hungr|starv|empty pantry|no food|scraps|ration|nothing to eat|famish|bellies|tighter belt/i;
// R52 secondary deflection signal: NPC deflection phrasing in a convo line.
const DEFLECT_LINE_RE = /deflect|wandered off|going in circles|as I said|we've been over|I just said|we wandered/i;
const MOURN_RE = /mourn|grief|griev|grave|burial|funeral|fire feels smaller|Nobody's talking much|The village mourns|first grave|we buried|laid to rest/i;
const RELIEF_RE = /bins are echoing|half rations|go out hungry|come back heavy|triage|relief|granary|emergency hunt|The hunt took its price/i;

function driveFamineConvo(Game, vid, tag, maxTurns) {
  maxTurns = maxTurns || 8;
  const out = [`## ${tag} — lately with ${firstName(rawName(Game, vid))} (d${dayOf(Game)})`];
  const npcLines = [];
  const pickCounts = {};
  const deflectionLines = [];
  let lastPickId = null;
  try { Game.startConvo(vid); } catch (e) { return { text: out.join('\n') + ' (startConvo threw: ' + e.message + ')', hunger: false, npcLines, pickCounts, deflectionLines, turns: 0 }; }
  let askedLately = false;
  let turns = 0;
  for (let t = 0; t < maxTurns; t++) {
    const choices = Game.convoChoices(vid) || [];
    if (!choices.length) { out.push('(no choices offered)'); break; }
    let pool = choices.filter(c => c.id !== lastPickId);
    if (!pool.length) pool = choices;
    let pick = !askedLately ? pool.find(c => c.id === 'ask:lately') : null;
    if (!pick) pick = pool.find(c => /^(dlg:help|dlg:details|want:)/.test(c.id));
    if (!pick) pick = pool.find(c => !/^(leave|bye|goodbye)/.test(c.id));
    if (!pick) break;
    if (/^(leave|bye|goodbye)/.test(pick.id)) break;
    if (pick.id === 'ask:lately') askedLately = true;
    lastPickId = pick.id;
    pickCounts[pick.id] = (pickCounts[pick.id] || 0) + 1;
    turns++;
    out.push(`> YOU PICK [${pick.id}] ${(pick.text || '').slice(0, 100)}`);
    try { Game.convoTurn(vid, pick.id); } catch (e) { out.push(`(turn threw: ${e.message})`); break; }
    const c = Game.convoGet(vid);
    if (!c || !c.active) { out.push('(conversation ended by the engine)'); break; }
    const last = (c.transcript || []).slice(-2);
    for (const e of last) {
      out.push(`${e.who === 'you' ? 'YOU' : 'NPC'}: ${String(e.text).slice(0, 400)}`);
      if (e.who !== 'you') {
        npcLines.push(String(e.text));
        if (DEFLECT_LINE_RE.test(String(e.text))) deflectionLines.push(String(e.text).slice(0, 200));
      }
    }
    out.push('');
    if (askedLately && t >= 1) break;
  }
  try { Game.endConvo(vid, 'left'); } catch (e) {}
  let maxRepeat = 0, maxRepeatId = null;
  for (const k of Object.keys(pickCounts)) {
    if (pickCounts[k] > maxRepeat) { maxRepeat = pickCounts[k]; maxRepeatId = k; }
  }
  return {
    text: out.join('\n'),
    hunger: npcLines.some(l => HUNGER_RE.test(l)),
    npcLines: npcLines.slice(0, 14),
    pickCounts, deflectionLines, turns,
    maxRepeat, maxRepeatId,
    deflected3plus: Object.keys(pickCounts).filter(k => pickCounts[k] >= 3),
  };
}

async function main() {
  const E = console.error;
  const { Game } = await loadGame({ seed: SEED, mode: 'crisis-famine-r52', fullTelemetry: true });
  await setupGame(Game);
  const playerVid = (() => { try { return String(Game.villagerId || ''); } catch (e) { return ''; } })();
  const rec = {
    seed: SEED, playerVid, days: [], deaths: [], hungerLines: [], convos: [],
    famineDays: [], playerLingeringFights: [], stuckNotes: [],
    mourningLines: [], crisesFired: [], reliefLines: [],
    deflectionConvos: [],
  };

  const out = { meals: 0, rot: 0, raid: 0, take: 0 };
  function wrapDelta(fn, key) {
    if (typeof Game[fn] !== 'function') { rec.stuckNotes.push(`missing ${fn}`); return; }
    const o = Game[fn];
    Game[fn] = function () {
      const b = pantryKcal(Game);
      let r;
      try { r = o.apply(this, arguments); }
      finally { const a = pantryKcal(Game); if (b - a > 0) out[key] += (b - a); }
      return r;
    };
  }
  wrapDelta('villageEats', 'meals');
  wrapDelta('villageMeal', 'meals');
  wrapDelta('sweepSpoiled', 'rot');
  wrapDelta('raidPillage', 'raid');
  wrapDelta('takeFromPantry', 'take');

  const _say = Game.say;
  Game.say = function (msg) {
    try {
      const s = String(msg || '');
      if (HUNGER_RE.test(s)) rec.hungerLines.push({ day: dayOf(Game), line: s.slice(0, 280) });
      if (MOURN_RE.test(s)) rec.mourningLines.push({ day: dayOf(Game), line: s.slice(0, 280) });
      if (RELIEF_RE.test(s)) rec.reliefLines.push({ day: dayOf(Game), line: s.slice(0, 280) });
    } catch (e) {}
    return _say ? _say.apply(this, arguments) : undefined;
  };
  const _fireCrisis = Game.fireCrisis;
  Game.fireCrisis = function (kind, ctx) {
    try { rec.crisesFired.push({ day: dayOf(Game), kind: String(kind) }); } catch (e) {}
    return _fireCrisis ? _fireCrisis.call(this, kind, ctx) : undefined;
  };
  const _regDeath = Game.registerDeath;
  Game.registerDeath = function (opts) {
    const r = _regDeath ? _regDeath.call(this, opts) : undefined;
    try {
      const o = opts || {};
      const vid = o.villagerId || o.vid || o.id || '?';
      let away = null;
      try { const aw = (Game.state.village || {}).away || {}; away = !!aw[String(vid)]; } catch (e) {}
      const pop = livingRoster(Game).length;
      const pk = pantryKcal(Game);
      rec.deaths.push({
        day: dayOf(Game),
        vid: String(vid).slice(0, 16),
        kind: String(o.kind || '?'),
        cause: String(o.cause || '?').slice(0, 80),
        name: String(o.name || rawName(Game, vid) || '?').slice(0, 40),
        person: isPersonDeath(o),
        starvation: isStarvation(o),
        pantryAtDeath: pk,
        popAtDeath: pop,
        pcAtDeath: pop > 0 ? Math.round(pk / pop) : 0,
        awayAtDeath: away,
      });
      E(`[DEATH] d${dayOf(Game)} kind=${o.kind} cause=${String(o.cause || '').slice(0, 50)} pantry=${pk} pop=${pop} away=${away}`);
    } catch (e) {}
    return r;
  };
  const _rwme = Game.resolveWildMonsterEncounter;
  Game.resolveWildMonsterEncounter = function (vid, m, opts) {
    const r = _rwme ? _rwme.apply(this, arguments) : undefined;
    try {
      if ((String(vid) === 'player' || String(vid) === playerVid) && lingeringCount(Game) > 0) {
        rec.playerLingeringFights.push({
          day: dayOf(Game), outcome: (r && r.outcome) || '?',
          monster: String((m && (m.name || m.id)) || '?').slice(0, 40),
        });
        E(`[SCHOLAR-VS-LINGERING] d${dayOf(Game)} outcome=${(r && r.outcome) || '?'}`);
      }
    } catch (e) {}
    return r;
  };

  E(`[SETUP] seed ${SEED}: oracleV2 establishing ${ESTABLISH}d...`);
  await runDays(Game, oracleV2, { days: ESTABLISH });
  if (Game.over) { E('[SETUP] game over during establish — abort'); console.log(JSON.stringify(rec)); return; }
  let prevHungry = hungryDaysSum(Game);
  E(`[ESTABLISHED] d${dayOf(Game)} pop=${livingRoster(Game).length} pantry=${pantryKcal(Game)}`);

  const endDay = ESTABLISH + WINDOW_DAYS;
  let convosDone = 0;
  let famineStart = null;
  let starvationDeathsSeen = 0;
  while (dayOf(Game) < endDay && !Game.over) {
    const d0 = dayOf(Game);
    const p0 = pantryKcal(Game);
    const pop0 = livingRoster(Game).length;
    const lingeringBefore = lingeringCount(Game);
    const deathsBefore = rec.deaths.length;
    await runDays(Game, oracleV2, { days: 1 });
    if (Game.over) break;
    const d = dayOf(Game);
    const p1 = pantryKcal(Game);
    const pop1 = livingRoster(Game).length;
    const inflow = Math.round((p1 - p0) + out.meals + out.rot + out.raid + out.take);
    const hungryNow = hungryDaysSum(Game);
    const hungryNew = Math.max(0, hungryNow - prevHungry);
    prevHungry = hungryNow;
    const pc = pop0 > 0 ? p0 / pop0 : 0;
    const famine = pop0 > 1 && pc < FAMINE_PC_KCAL;
    if (famine) rec.famineDays.push(d);
    if (famine && famineStart === null) { famineStart = d; E(`[FAMINE-START] d${d} pantry=${p0} pop=${pop0} pc=${Math.round(pc)}`); }
    if (!famine && famineStart !== null) {
      E(`[FAMINE-END] d${d} ran ${d - famineStart}d; pantry=${p0} pop=${pop0}`);
      famineStart = null;
    }
    rec.days.push({
      day: d, pantry: p0, pop: pop0, pcPantry: Math.round(pc),
      inflow, meals: Math.round(out.meals), rot: Math.round(out.rot),
      raidOut: Math.round(out.raid), take: Math.round(out.take),
      hungryNew, famine, lingering: lingeringBefore,
    });
    out.meals = out.rot = out.raid = out.take = 0;
    if (pop1 <= 1) { rec.stuckNotes.push(`death-aware stop d${d}: pop=${pop1}`); break; }

    if (famine && convosDone < 2) {
      const witness = livingRoster(Game).find(id => id !== 'player' && id !== playerVid);
      if (witness) {
        const cv = driveFamineConvo(Game, witness, `famine-d${d}`, 8);
        rec.convos.push({ day: d, hunger: cv.hunger, tag: 'famine' });
        rec.deflectionConvos.push({ day: d, tag: 'famine', turns: cv.turns, pickCounts: cv.pickCounts, maxRepeat: cv.maxRepeat, maxRepeatId: cv.maxRepeatId, deflected3plus: cv.deflected3plus, deflectionLines: cv.deflectionLines });
        rec.convText = rec.convText || [];
        rec.convText.push(cv.text);
        convosDone++;
        E(`[CONVO] d${d} hungerAck=${cv.hunger} maxRepeat=${cv.maxRepeat} (${cv.maxRepeatId}) deflectLines=${cv.deflectionLines.length}`);
      }
    }
    // Starvation-death witness convo (extra, cap 4 total).
    const newStarv = rec.deaths.slice(deathsBefore).filter(x => x.person && x.starvation);
    if (newStarv.length && convosDone < 4) {
      const witness = livingRoster(Game).find(id => id !== 'player' && id !== playerVid);
      if (witness) {
        const cv = driveFamineConvo(Game, witness, `starvation-death-d${d}`, 8);
        rec.convos.push({ day: d, hunger: cv.hunger, tag: 'starvation-death' });
        rec.deflectionConvos.push({ day: d, tag: 'starvation-death', turns: cv.turns, pickCounts: cv.pickCounts, maxRepeat: cv.maxRepeat, maxRepeatId: cv.maxRepeatId, deflected3plus: cv.deflected3plus, deflectionLines: cv.deflectionLines });
        rec.convText = rec.convText || [];
        rec.convText.push(cv.text);
        convosDone++;
        starvationDeathsSeen += newStarv.length;
        E(`[CONVO] starvation-death d${d} hungerAck=${cv.hunger} maxRepeat=${cv.maxRepeat} (${cv.maxRepeatId}) deflectLines=${cv.deflectionLines.length}`);
      }
    }
  }
  if (famineStart !== null) { rec.stuckNotes.push(`famine window open at end d${dayOf(Game)} (started d${famineStart})`); }

  // R52 revised-window computation from the daily ledger (dawn pc pantry).
  // A revised window = any 7-day span (by recorded day values) holding
  // >=5 famine days. Old consecutive count kept for comparison only.
  (function () {
    const fam = new Set(rec.days.filter(x => x.famine).map(x => x.day));
    const wins = [];
    const daySet = new Set(rec.days.map(x => x.day));
    for (const d of [...daySet].sort((a, b) => a - b)) {
      let n = 0;
      for (let k = 0; k < 7; k++) if (fam.has(d + k)) n++;
      if (n >= 5) wins.push({ start: d, end: d + 6, famineDaysInSpan: n });
    }
    let maxConsec = 0, run = 0, prev = null;
    for (const d of [...fam].sort((a, b) => a - b)) {
      run = (prev !== null && d === prev + 1) ? run + 1 : 1;
      if (run > maxConsec) maxConsec = run;
      prev = d;
    }
    rec.revisedWindows = wins;
    rec.revisedWindowCount = wins.length;
    rec.maxConsecutiveFamineDays = maxConsec;
    rec.famineDayCount = fam.size;
  })();

  rec.notes = `ended d${dayOf(Game)} over=${!!Game.over} pop=${livingRoster(Game).length} pantry=${pantryKcal(Game)} famineDays=${rec.famineDays.length}`;
  E(`[DONE] seed ${SEED}: ${rec.notes} personDeaths=${rec.deaths.filter(x => x.person).length} starvationDeaths=${rec.deaths.filter(x => x.person && x.starvation).length} hungerLines=${rec.hungerLines.length} reliefLines=${rec.reliefLines.length} lingeringFights=${rec.playerLingeringFights.length} revisedWindows=${rec.revisedWindowCount} maxConsec=${rec.maxConsecutiveFamineDays} deflectConvos3plus=${rec.deflectionConvos.filter(c => (c.deflected3plus || []).length).length}`);
  console.log(JSON.stringify(rec));
}

main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
