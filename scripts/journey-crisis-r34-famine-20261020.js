#!/usr/bin/env node
// journey-crisis-r34-famine-20261020.js — CRISIS LEG r34: famine as lived experience.
// Same blight staging as r7 (2026-10-13): from day 20 ALL pantry inflows are
// refused ("the blight"). r7 tested the CORRUPTION SLOPE; this run tests the
// SOCIAL FABRIC under famine: sharing, theft-and-punishment, triage/care,
// grief/mourning, and whether famine dialogue reads as desperate people.
// Canon: docs/PRESERVATION.md (food ladder), docs/CORRUPTION.md (slope — NOT
// re-tested here), Steve's "theft allowed, socially punished".
// Question: when the village starves, do villagers bend or break like people?
// Usage: SEED=101 node scripts/journey-crisis-r34-famine-20261020.js
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
function packKcalOf(Game, vid) {
  try { return Math.round(Game.packKcal(vid) || 0); } catch (e) { return 0; }
}

function pickChoice(choices, mode, lastPickId) {
  const isLoopTrap = (c) => /^(betrayal:investigate|betrayal:site|betrayal:witnesses)/.test(c.id || '');
  const notRepeat = (c) => c.id !== lastPickId;
  const griefKw = /dead|died|death|mourn|grief|griev|funeral|burial|grave|lost|gone/i;
  const hungerKw = /hunger|hungry|starv|ration|share|theft|stol|desperat|scared|afraid/i;
  // food-keyword but NOT the betrayal "follow the food" investigation trap
  const foodKw = (c) => /food|eat/i.test(c.text || '') && !isLoopTrap(c);
  let pool = choices.filter(notRepeat);
  if (!pool.length) pool = choices;
  let pick = null;
  if (mode === 'grief') {
    pick = pool.find(c => griefKw.test(c.text || '') && !isLoopTrap(c));
    if (!pick) pick = pool.find(c => /^gq:/.test(c.id));
    if (!pick) pick = pool.find(c => c.id === 'ask:lately');
  } else { // famine
    pick = pool.find(c => c.id === 'ask:lately');
    if (!pick) pick = pool.find(c => hungerKw.test(c.text || '') && !isLoopTrap(c));
    if (!pick) pick = pool.find(c => foodKw(c));
    if (!pick) pick = pool.find(c => /^gq:/.test(c.id));
  }
  if (!pick) pick = pool.find(c => /^(dlg:help|dlg:details|want:)/.test(c.id));
  if (!pick) pick = pool.find(c => !/^(leave|bye|goodbye)/.test(c.id) && !isLoopTrap(c));
  if (!pick) pick = pool.find(c => !/^(leave|bye|goodbye)/.test(c.id));
  return pick || null;
}

function driveConvo(Game, vid, tag, maxTurns, mode) {
  maxTurns = maxTurns || 12;
  mode = mode || 'famine';
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
  const GRIEF_RE = /mourn|grief|griev|miss (her|him|them)|dead|died|death|grave|burial|funeral|lost her|lost him|lost them/i;
  const HUNGER_RE = /hunger|hungry|starv|starving|ration|no food|empty pantry|bare pantry|nothing to eat/i;
  const scanRe = mode === 'grief' ? GRIEF_RE : HUNGER_RE;
  const surfaced = npcLines.some(l => scanRe.test(l));
  return { text: out.join('\n'), surfaced };
}

async function main() {
  const E = console.error;
  const { Game } = await loadGame({ seed: SEED, mode: 'crisis-famine-r34', fullTelemetry: true });
  await setupGame(Game);
  const rec = {
    seed: SEED, crises: [], deaths: [], shares: [], crimes: [], griefs: [],
    burials: [], griefConvos: [], theftBeat: null, dawns: [], convos: [], notes: [],
  };
  let griefConvosRun = 0;
  const griefedVids = new Set();

  // ---- instrumentation (all call-through) ----
  const _fireCrisis = Game.fireCrisis;
  Game.fireCrisis = function (kind, ctx) {
    rec.crises.push({ day: dayOf(Game), kind });
    E(`[CRISIS] d${dayOf(Game)} ${kind}`);
    return _fireCrisis ? _fireCrisis.call(this, kind, ctx) : undefined;
  };
  const _share = Game.shareFood;
  Game.shareFood = function (kcal, toName) {
    rec.shares.push({ day: dayOf(Game), kcal: Math.round(kcal || 0), to: String(toName || '?').slice(0, 40) });
    return _share ? _share.call(this, kcal, toName) : undefined;
  };
  const _crime = Game.recordCrime;
  Game.recordCrime = function (kind, info) {
    rec.crimes.push({ day: dayOf(Game), kind, info: info ? JSON.stringify(info).slice(0, 160) : '' });
    E(`[CRIME] d${dayOf(Game)} ${kind}`);
    return _crime ? _crime.call(this, kind, info) : undefined;
  };
  const _grief = Game.noteVillageBondGrief;
  Game.noteVillageBondGrief = function () {
    rec.griefs.push({ day: dayOf(Game) });
    return _grief ? _grief.apply(this, arguments) : undefined;
  };
  const _bury = Game.buryCorpse;
  Game.buryCorpse = function () {
    const r = _bury ? _bury.apply(this, arguments) : undefined;
    rec.burials.push({ day: dayOf(Game), ok: !!r });
    E(`[BURIAL] d${dayOf(Game)} ${r ? 'buried' : 'failed'}`);
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
  rec.notes.push('blight: pantryAdd+stockPantry refused from d' + dayOf(Game));
  // FORCED FAMINE (r34 second arm): the blight withers crops and scatters game —
  // villager daily production scaled by PROD_SCALE. The sharing machinery
  // (trustFactor, stockSurplus, gives) stays real; there is simply less to share.
  const PROD_SCALE = parseFloat(process.env.PROD_SCALE || '0.4');
  if (process.env.FAMINE_FORCE === '1') {
    const _vdp = Game.villagerDayProduction;
    Game.villagerDayProduction = function (person, vid, v) {
      const r = _vdp ? _vdp.call(this, person, vid, v) : 0;
      return r * PROD_SCALE;
    };
    rec.notes.push(`forced famine: villagerDayProduction x${PROD_SCALE} from d` + dayOf(Game));
    E(`[STAGING] forced famine: production x${PROD_SCALE}`);
  }

  // baseline sample at blight onset (gives/takes deltas need a start point)
  const sampleDawn = (label) => {
    let starving = '?';
    try { starving = !!Game.starvingVillage(); } catch (e) {}
    // CONTRIBUTION FLOWS: villager sharing bypasses Game.shareFood (the
    // ledger's deliberate-gift path). The daily meal loop writes v.gives /
    // v.takes per villager — snapshot the sums, delta = shared since last.
    let givesSum = 0, takesSum = 0;
    try {
      const v = Game.state.village || {};
      for (const k in (v.gives || {})) givesSum += (v.gives[k] || 0);
      for (const k in (v.takes || {})) takesSum += (v.takes[k] || 0);
    } catch (e) {}
    const lastG = rec.dawns.length ? rec.dawns[rec.dawns.length - 1].givesSum : givesSum;
    const lastT = rec.dawns.length ? rec.dawns[rec.dawns.length - 1].takesSum : takesSum;
    rec.dawns.push({
      day: dayOf(Game), label: label || '', pantry: pantryKcal(Game),
      pop: livingRoster(Game).length, starvingVillage: starving,
      blockedKcal: Math.round(blockedKcal),
      givesSum: Math.round(givesSum), takesSum: Math.round(takesSum),
      gaveSince: Math.round(givesSum - lastG), tookSince: Math.round(takesSum - lastT),
      sharesToday: rec.shares.filter(e => e.day === dayOf(Game)).length,
      crimesToday: rec.crimes.filter(e => e.day === dayOf(Game)).length,
      deathsToday: rec.deaths.filter(e => e.day === dayOf(Game)).length,
    });
  };

  // ---- phase 3: famine in 5-day chunks, with beats ----
  const endDay = ESTABLISH + FAMINE_DAYS;
  let theftDone = false;
  // threshold-crossing (days land on 2-mod-5, never exactly on round numbers)
  const convoThresholds = [ESTABLISH + 5, ESTABLISH + 20, ESTABLISH + 35];
  let nextConvoIdx = 0;
  sampleDawn('blight-start');
  let prevD = dayOf(Game);
  while (dayOf(Game) < endDay && !Game.over) {
    const target = Math.min(dayOf(Game) + 5, endDay);
    await runDays(Game, oracleV2, { days: target - dayOf(Game) });
    if (Game.over) break;
    const d = dayOf(Game);
    sampleDawn('');
    // THEFT BEAT: once, in deep famine (pantry < 2000, village starving) —
    // theft is allowed; is it socially punished when everyone is hungry?
    if (!theftDone && d >= ESTABLISH + 15 && pantryKcal(Game) < 2000) {
      let starving = false;
      try { starving = !!Game.starvingVillage(); } catch (e) {}
      if (starving) {
        const cands = livingRoster(Game)
          .filter(id => id !== Game.villagerId)
          .map(id => ({ id, pack: packKcalOf(Game, id), name: firstName(rawName(Game, id)) }))
          .filter(c => c.pack >= 100)
          .sort((a, b) => b.pack - a.pack);
        if (cands.length) {
          const victim = cands[0];
          let trustBefore = null, repBefore = null;
          try { trustBefore = (Game.state.village.trust || {})[victim.id]; } catch (e) {}
          E(`[THEFT-BEAT] d${d} player steals from ${victim.name} (pack ${victim.pack} kcal), pantry=${pantryKcal(Game)}`);
          let result = null;
          try { result = Game.stealFrom(victim.id); } catch (e) { result = 'threw: ' + e.message; }
          let trustAfter = null;
          try { trustAfter = (Game.state.village.trust || {})[victim.id]; } catch (e) {}
          rec.theftBeat = { day: d, victim: victim.name, packBefore: victim.pack, result: String(result), trustBefore, trustAfter };
          E(`[THEFT-BEAT] result=${result} trust ${trustBefore}->${trustAfter}`);
        } else {
          rec.theftBeat = { day: d, skipped: 'no victim with pack>=100' };
          E(`[THEFT-BEAT] d${d} skipped — every pack is empty (famine is total)`);
        }
        theftDone = true;
      }
    }
    // driven convos at famine depths (threshold-crossing, not exact-day)
    while (nextConvoIdx < convoThresholds.length && d >= convoThresholds[nextConvoIdx]) {
      const thresh = convoThresholds[nextConvoIdx];
      nextConvoIdx++;
      const roster = livingRoster(Game).filter(id => id !== Game.villagerId);
      if (roster.length) {
        const vid = roster[Math.floor(Math.random() * roster.length)];
        E(`[CONVO] d${d} driven convo (crossed d${thresh}, ${d - ESTABLISH}d into famine)`);
        const res = driveConvo(Game, vid, `famine-d${d - ESTABLISH}`, 10, 'famine');
        rec.convos.push({ day: d, depth: d - ESTABLISH, surfaced: res.surfaced, text: res.text });
        E(res.text.split('\n').slice(0, 14).join('\n'));
        E(`[CONVO] hunger-surfaced=${res.surfaced}`);
      }
    }
    prevD = d;
    // death-aware: village dead/scattered -> stop (+10d tail handled by loop bound)
    if (livingRoster(Game).length === 0) { E(`[STOP] d${d} village extinct — death-aware stop`); break; }
    // GRIEF CONVOS (r32 method): for each recent death (<=7d) not yet grieved,
    // drive one convo and scan for mourning. Cap 6 per run.
    if (griefConvosRun < 6) {
      const fresh = rec.deaths.filter(dd => !griefedVids.has(dd.vid) && d - dd.day >= 1 && d - dd.day <= 7);
      for (const dd of fresh) {
        if (griefConvosRun >= 6) break;
        griefedVids.add(dd.vid);
        const roster = livingRoster(Game).filter(id => id !== Game.villagerId && String(id) !== String(dd.vid));
        if (!roster.length) break;
        const vid = roster[Math.floor(Math.random() * roster.length)];
        griefConvosRun++;
        E(`[GRIEF-CONVO] d${d} about death d${dd.day} (${dd.cause}) — talking to ${firstName(rawName(Game, vid))}`);
        const res = driveConvo(Game, vid, `grief-d${dd.day}-${dd.cause}`, 10, 'grief');
        rec.griefConvos.push({ day: d, deathDay: dd.day, cause: dd.cause, surfaced: res.surfaced, text: res.text });
        E(`[GRIEF-CONVO] surfaced=${res.surfaced}`);
      }
    }
  }
  sampleDawn('final');
  E(`[DONE] seed ${SEED}: d${dayOf(Game)} pop=${livingRoster(Game).length} pantry=${pantryKcal(Game)} deaths=${rec.deaths.length} shares=${rec.shares.length} crimes=${rec.crimes.length} griefConvos=${rec.griefConvos.length}(${rec.griefConvos.filter(g=>g.surfaced).length} surfaced) burials=${rec.burials.length} over=${!!Game.over}`);
  console.log(JSON.stringify(rec));
}

main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
