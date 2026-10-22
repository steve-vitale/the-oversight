#!/usr/bin/env node
// journey-crisis-r41-famine-20261022.js — CRISIS LEG r41: the famine response.
// Leg question: with SURPLUSFEED removed (Steve 2026-10-21) and plentydepri-b
// live (villagers deprioritize production when plentiful), when famine hits
// does anything respond — production, acknowledgment, hungry behavior — or
// does the village starve politely?
// Also carries r38's named-next: record scholar fight outcomes vs lingering entities.
// Usage: SEED=101 node scripts/journey-crisis-r41-famine-20261022.js
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
  // VILLAGE-level signal (game.js): v.hungryDays increments only when
  // pantryKcal <= 0; at the famine limit the village scatters. (r41 fix:
  // the villager person object has no hungryDays — reading it was always 0.)
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
const HUNGER_RE = /hungr|starv|empty pantry|no food|scraps|ration|nothing to eat|famish|bellies|tighter belt/i;
const MOURN_RE = /mourn|grief|griev|grave|burial|funeral|fire feels smaller|Nobody's talking much|The village mourns|first grave|we buried|laid to rest/i;

// Forced ask:lately convo with a living non-player villager during famine.
function driveFamineConvo(Game, vid, tag, maxTurns) {
  maxTurns = maxTurns || 8;
  const out = [`## ${tag} — lately with ${firstName(rawName(Game, vid))} (d${dayOf(Game)})`];
  const npcLines = [];
  let lastPickId = null;
  try { Game.startConvo(vid); } catch (e) { return { text: out.join('\n') + ' (startConvo threw: ' + e.message + ')', hunger: false, npcLines }; }
  let askedLately = false;
  for (let t = 0; t < maxTurns; t++) {
    const choices = Game.convoChoices(vid) || [];
    if (!choices.length) { out.push('(no choices offered)'); break; }
    let pool = choices.filter(c => c.id !== lastPickId);
    if (!pool.length) pool = choices;
    // r40 metric review: force the lately pick rather than relying on the sampler
    let pick = !askedLately ? pool.find(c => c.id === 'ask:lately') : null;
    if (!pick) pick = pool.find(c => /^(dlg:help|dlg:details|want:)/.test(c.id));
    if (!pick) pick = pool.find(c => !/^(leave|bye|goodbye)/.test(c.id));
    if (!pick) break;
    if (/^(leave|bye|goodbye)/.test(pick.id)) break;
    if (pick.id === 'ask:lately') askedLately = true;
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
    if (askedLately && t >= 1) break;
  }
  try { Game.endConvo(vid, 'left'); } catch (e) {}
  return {
    text: out.join('\n'),
    hunger: npcLines.some(l => HUNGER_RE.test(l)),
    npcLines: npcLines.slice(0, 14),
  };
}

async function main() {
  const E = console.error;
  const { Game } = await loadGame({ seed: SEED, mode: 'crisis-famine-r41', fullTelemetry: true });
  await setupGame(Game);
  const playerVid = (() => { try { return String(Game.villagerId || ''); } catch (e) { return ''; } })();
  const rec = {
    seed: SEED, playerVid, days: [], deaths: [], hungerLines: [], convos: [],
    famineDays: [], playerLingeringFights: [], stuckNotes: [],
    mourningLines: [], crisesFired: [],
  };

  // ---- instrumentation: outflow channels (for inflow attribution) ----
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
      rec.deaths.push({
        day: dayOf(Game),
        vid: String(o.villagerId || o.vid || o.id || '?').slice(0, 16),
        kind: String(o.kind || '?'),
        cause: String(o.cause || '?').slice(0, 80),
        name: String(o.name || rawName(Game, o.villagerId) || '?').slice(0, 40),
        person: isPersonDeath(o),
      });
      E(`[DEATH] d${dayOf(Game)} kind=${o.kind} cause=${String(o.cause || '').slice(0, 50)}`);
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

  // ---- phase 1: establish ----
  E(`[SETUP] seed ${SEED}: oracleV2 establishing ${ESTABLISH}d...`);
  await runDays(Game, oracleV2, { days: ESTABLISH });
  if (Game.over) { E('[SETUP] game over during establish — abort'); console.log(JSON.stringify(rec)); return; }
  let prevHungry = hungryDaysSum(Game);
  E(`[ESTABLISHED] d${dayOf(Game)} pop=${livingRoster(Game).length} pantry=${pantryKcal(Game)}`);

  // ---- phase 2: the window, 1-day chunks ----
  const endDay = ESTABLISH + WINDOW_DAYS;
  let convosDone = 0;
  let famineStart = null;
  while (dayOf(Game) < endDay && !Game.over) {
    const d0 = dayOf(Game);
    const p0 = pantryKcal(Game);
    const pop0 = livingRoster(Game).length;
    const lingeringBefore = lingeringCount(Game);
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

    // famine convos: up to 2 per seed, first during the first famine window
    if (famine && convosDone < 2) {
      const witness = livingRoster(Game).find(id => id !== 'player' && id !== playerVid);
      if (witness) {
        const cv = driveFamineConvo(Game, witness, `famine-d${d}`, 8);
        rec.convos.push({ day: d, hunger: cv.hunger });
        rec.convText = rec.convText || [];
        rec.convText.push(cv.text);
        convosDone++;
        E(`[CONVO] d${d} hungerAck=${cv.hunger}`);
      }
    }
  }
  if (famineStart !== null) { rec.stuckNotes.push(`famine window open at end d${dayOf(Game)} (started d${famineStart})`); }

  rec.notes = `ended d${dayOf(Game)} over=${!!Game.over} pop=${livingRoster(Game).length} pantry=${pantryKcal(Game)} famineDays=${rec.famineDays.length}`;
  E(`[DONE] seed ${SEED}: ${rec.notes} personDeaths=${rec.deaths.filter(x => x.person).length} hungerLines=${rec.hungerLines.length} lingeringFights=${rec.playerLingeringFights.length}`);
  console.log(JSON.stringify(rec));
}

main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
