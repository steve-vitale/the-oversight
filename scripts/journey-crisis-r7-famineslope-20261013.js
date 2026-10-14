#!/usr/bin/env node
// journey-crisis-r7-famineslope-20261013.js — CRISIS LEG r7: the famine->corruption slope.
// Controlled REAL famine: from day 20, ALL pantry inflows are intercepted
// (pantryAdd + stockPantry wrapped to refuse — "the blight": nothing stored
// lasts). Every downstream machine stays real: starvation, hunger-winter,
// relief, corpses, funerals, petitions, moots, npcCannibalTick, temptTick,
// the contextual cannibalNorm (exile/horror/power).
// Question: does the village bend or break sensibly, and does the slope fire?
// Usage: SEED=101 node scripts/journey-crisis-r7-famineslope-20261013.js
// Output: JSON record to stdout; narrative + transcripts to stderr.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { oracleV2 } = require('./policies/oracleV2');

const SEED = parseInt(process.env.SEED || '101', 10);
const ESTABLISH = 20, FAMINE_DAYS = parseInt(process.env.FAMINE_DAYS || '45', 10);

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

function driveConvo(Game, vid, tag, maxTurns) {
  maxTurns = maxTurns || 12;
  const out = [`## ${tag} — talking to ${firstName(rawName(Game, vid))}`];
  try { Game.startConvo(vid); } catch (e) { return out.join('\n') + ' (startConvo threw: ' + e.message + ')'; }
  for (let t = 0; t < maxTurns; t++) {
    const choices = Game.convoChoices(vid) || [];
    if (!choices.length) { out.push('(no choices offered)'); break; }
    let pick = choices.find(c => c.id === 'ask:lately');
    if (!pick) pick = choices.find(c => /^gq:/.test(c.id));
    if (!pick) pick = choices.find(c => /hunger|hungry|starv|food|eat|dead|died|gone|grief|mourn|buri|funeral|scared|afraid|cannibal|meat|desperat/i.test(c.text || ''));
    if (!pick) pick = choices.find(c => /^(dlg:help|dlg:details|want:)/.test(c.id));
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
  const E = console.error;
  const { Game } = await loadGame({ seed: SEED, mode: 'crisis-famineslope', fullTelemetry: true });
  await setupGame(Game);
  const rec = {
    seed: SEED, crises: [], npcCannibalFires: 0, temptFires: 0,
    eatCannibal: [], corpseButcher: [], discoveries: [], crimes: [],
    exiles: [], petitions: [], dawns: [], corpsesEnd: [], notes: [],
  };

  // ---- instrumentation (all call-through) ----
  const _fireCrisis = Game.fireCrisis;
  Game.fireCrisis = function (kind, ctx) {
    rec.crises.push({ day: dayOf(Game), kind });
    E(`[CRISIS] d${dayOf(Game)} ${kind}`);
    return _fireCrisis ? _fireCrisis.call(this, kind, ctx) : undefined;
  };
  const _npcT = Game.npcCannibalTick;
  Game.npcCannibalTick = function () {
    const before = ((Game.state.village || {}).normShift || 0);
    const r = _npcT ? _npcT.call(this) : undefined;
    if (((Game.state.village || {}).normShift || 0) > before) {
      rec.npcCannibalFires++;
      E(`[SLOPE] d${dayOf(Game)} npcCannibalTick FIRED (normShift ${before}->${(Game.state.village || {}).normShift})`);
    }
    return r;
  };
  const _tempt = Game.temptTick;
  Game.temptTick = function () {
    const inv = ((Game.state.scholar || {}).inventory || []).length;
    const r = _tempt ? _tempt.call(this) : undefined;
    if (((Game.state.scholar || {}).inventory || []).length > inv) {
      rec.temptFires++;
      E(`[SLOPE] d${dayOf(Game)} temptTick FIRED (meat offered)`);
    }
    return r;
  };
  const _eatC = Game.eatCannibal;
  Game.eatCannibal = function (idx) {
    rec.eatCannibal.push({ day: dayOf(Game), meals: (Game.state.scholar || {}).cannibalMeals || 0 });
    E(`[SLOPE] d${dayOf(Game)} PLAYER ate human meat (meal #${(Game.state.scholar || {}).cannibalMeals || 0})`);
    return _eatC ? _eatC.call(this, idx) : false;
  };
  const _butcher = Game.corpseButcher;
  Game.corpseButcher = function (cid) {
    const r = _butcher ? _butcher.call(this, cid) : null;
    if (r) { rec.corpseButcher.push({ day: dayOf(Game), cid }); E(`[SLOPE] d${dayOf(Game)} PLAYER butchered person-corpse`); }
    return r;
  };
  const _disc = Game.discoverNpcCannibalism;
  Game.discoverNpcCannibalism = function (cid) {
    const r = _disc ? _disc.call(this, cid) : false;
    if (r) { rec.discoveries.push({ day: dayOf(Game), cid }); E(`[SLOPE] d${dayOf(Game)} player DISCOVERED npc cannibalism`); }
    return r;
  };
  const _crime = Game.recordCrime;
  Game.recordCrime = function (kind, info) {
    if (/desecrat|cannibal/i.test(kind || '')) {
      rec.crimes.push({ day: dayOf(Game), kind, info });
      E(`[CRIME] d${dayOf(Game)} ${kind} ${JSON.stringify(info || {})}`);
    }
    return _crime ? _crime.call(this, kind, info) : undefined;
  };
  const _pet = Game.pendingPetition;
  // petition arrivals: watch state.pendingPetition instead (property, not method)
  const _addNpcCorr = Game.addNpcCorruption;
  Game.addNpcCorruption = function (vid, n, reason) {
    if (/cannibal past/i.test(reason || '')) {
      rec.petitions.push({ day: dayOf(Game), cause: 'cannibal-admitted', n, vid, reason });
      E(`[SLOPE] d${dayOf(Game)} cannibal petitioner ADMITTED (${firstName(rawName(Game, vid))}, +${n} corruption)`);
    }
    return _addNpcCorr ? _addNpcCorr.call(this, vid, n, reason) : 0;
  };
  let lastExileCount = 0;

  // ---- phase 1: establish ----
  E(`[SETUP] seed ${SEED}: oracleV2 establishing ${ESTABLISH}d...`);
  await runDays(Game, oracleV2, { days: ESTABLISH });
  if (Game.over) { E('[SETUP] game over during establish — abort'); console.log(JSON.stringify(rec)); return; }
  E(`[ESTABLISHED] d${dayOf(Game)} pop=${livingRoster(Game).length} pantry=${pantryKcal(Game)}`);

  // ---- phase 2: the blight — refuse ALL pantry inflows ----
  let blockedKcal = 0;
  const _pa = Game.pantryAdd;
  Game.pantryAdd = function (item) {
    blockedKcal += (item.kcalEach || 0) * (item.units || 1);
    return false;
  };
  const _sp = Game.stockPantry;
  Game.stockPantry = function (kcal) { blockedKcal += (kcal || 0); return undefined; };
  // also refuse direct pantry array pushes? no — keep it to the choke points.
  rec.notes.push('blight: pantryAdd+stockPantry refused from d' + dayOf(Game));

  // dawn sampler: run interleaved in 5-day chunks
  const sampleDawn = () => {
    const v = Game.state.village || {};
    let norm = '?', starving = false, vcorr = 0, maxCorr = 0, maxCorrWho = '?';
    try { norm = Game.cannibalNorm(); } catch (e) {}
    try { starving = !!Game.starvingVillage(); } catch (e) {}
    try { vcorr = Game.villageCorruption(); } catch (e) {}
    const corrs = [];
    for (const id of livingRoster(Game)) {
      let c = 0; try { c = Game.corruptionOf(id); } catch (e) {}
      corrs.push({ who: firstName(rawName(Game, id)), c });
      if (c > maxCorr) { maxCorr = c; maxCorrWho = firstName(rawName(Game, id)); }
    }
    let unburied = 0, butchered = 0, npcFed = 0;
    try {
      const isP = (c) => Game.corpseIsPerson ? Game.corpseIsPerson(c) : (c.kind === 'person' || c.kind === 'villager');
      for (const c of (Game.corpses ? Game.corpses() : [])) {
        if (!isP(c) || c.buried) continue;
        unburied++;
        if (c.butchered) butchered++;
        if (c.npcFed) npcFed++;
      }
    } catch (e) {}
    const exiles = (v.exiles || []).length;
    if (exiles > lastExileCount) {
      for (const x of (v.exiles || []).slice(lastExileCount))
        rec.exiles.push({ day: dayOf(Game), vid: x.vid, how: x.how, name: firstName(rawName(Game, x.vid)) });
      lastExileCount = exiles;
    }
    const pend = Game.state.pendingPetition;
    if (pend && !rec.petitions.some(p => p.day === (pend.day || dayOf(Game)) && p.cause === pend.cause))
      rec.petitions.push({ day: dayOf(Game), cause: pend.cause, n: (pend.petitioners || []).length });
    rec.dawns.push({
      day: dayOf(Game), pantry: pantryKcal(Game), pop: livingRoster(Game).length,
      norm, starving, vcorr: Math.round(vcorr * 10) / 10, maxCorr, maxCorrWho,
      unburied, butchered, npcFed, blockedKcal,
      corrs: corrs.sort((a, b) => b.c - a.c).slice(0, 5),
    });
  };

  let famineDay = dayOf(Game);
  for (let i = 0; i < FAMINE_DAYS && !Game.over; i += 5) {
    await runDays(Game, oracleV2, { days: Math.min(5, FAMINE_DAYS - i) });
    if (Game.over) break;
    sampleDawn();
    const d = rec.dawns[rec.dawns.length - 1];
    E(`[DAWN] d${d.day} pantry=${d.pantry} pop=${d.pop} norm=${d.norm} starving=${d.starving} vcorr=${d.vcorr} maxCorr=${d.maxCorrWho}:${d.maxCorr} unburied=${d.unburied} butchered=${d.butchered} npcFed=${d.npcFed}`);
  }

  // ---- phase 3: census ----
  const v = Game.state.village || {};
  const fallen = (v.fallen || []).map(f => ({
    day: f.day, name: firstName(f.name || rawName(Game, f.vid)), cause: f.cause,
  }));
  const census = livingRoster(Game).map(id => {
    let c = 0; try { c = Game.corruptionOf(id); } catch (e) {}
    return { name: firstName(rawName(Game, id)), corruption: c };
  });
  let corpses = [];
  try {
    corpses = (Game.corpses ? Game.corpses() : []).filter(c => Game.corpseIsPerson ? Game.corpseIsPerson(c) : (c.kind === 'person' || c.kind === 'villager')).map(c => ({
      name: firstName(c.name || rawName(Game, c.villagerId)),
      buried: !!c.buried, butchered: !!c.butchered, npcFed: c.npcFed ? firstName(rawName(Game, c.npcFed)) : null,
    }));
  } catch (e) {}
  rec.corpsesEnd = corpses;
  E(`\n[CENSUS] d${dayOf(Game)} over=${!!Game.over} living=${census.length} fallen=${fallen.length}`);
  E(`  fallen: ${fallen.map(f => `${f.name}(d${f.day}:${f.cause})`).join(', ') || 'none'}`);

  // ---- phase 4: people check — conversations with the starving ----
  E('\n[PEOPLE] driving conversations...');
  const talkers = livingRoster(Game).slice(0, 3);
  const transcripts = [];
  for (const id of talkers) {
    transcripts.push(driveConvo(Game, id, 'famine', 10));
  }
  rec.transcripts = transcripts;
  for (const t of transcripts) E('\n' + t.split('\n').slice(0, 40).join('\n') + '\n... [truncated in log; full in JSON]');

  rec.final = {
    day: dayOf(Game), over: !!Game.over, living: census.length, fallen,
    census, blockedKcal, pantryEnd: pantryKcal(Game),
  };
  console.log(JSON.stringify(rec));
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
