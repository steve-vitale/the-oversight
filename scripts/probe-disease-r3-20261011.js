#!/usr/bin/env node
// probe-disease-r3-20261011.js — r3 investigation probe.
// Q(a): alien_tick fight reachability — count combat_start vs id, wave unlock day.
// Q(b): alien transformation arcs — do eurika/east_nile/lemons carriers live
//       long enough for their abilities to fire (eurika-sense line, east_nile
//       crow line, lemons engorge/blood-sense)? Capture say-lines + ability hooks.
// Q(c): '?' attribution — log raw villager disease death causes.
// Q(d): SENSE — capture full say-stream snippets around disease beats.
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');

const SEEDS = (process.env.SEEDS || '7,42,99,2026,4242,987654').split(',').map(Number);
const DAYS = parseInt(process.env.DAYS || '200', 10);

const ALIEN_RE = /eurika|east.?nile|lemons|mosquito-sense|mosquito.sense|sensory hairs|faceted|crows? (are|is) screaming|ringed rashes?|waxy grey|engorge|blood-sense|blood sense|heartbeats|voice-box|howls? at night|gristle|ribbit|chitin|pinfeathers|hollow bones|tick/i;

async function one(seed) {
  const { Game } = await loadGame({ seed, mode: 'probe', fullTelemetry: true });
  await setupGame(Game);
  const sayHits = [];
  const origSay = Game.say.bind(Game);
  Game.say = function (txt, ...rest) {
    try { if (txt && ALIEN_RE.test(String(txt))) sayHits.push({ day: (this.state.scholar || {}).day, txt: String(txt).slice(0, 220) }); } catch (e) {}
    return origSay(txt, ...rest);
  };
  // ability-use hooks
  let engorgeUses = 0, bloodSenseUses = 0, eurikaSenseFires = 0, crowWarnFires = 0;
  const combats = {};
  const res = await runDays(Game, competent, { days: DAYS });
  const tele = res.telemetry || [];
  for (const ev of tele) {
    if (ev.type === 'combat_start') {
      const id = ev.vs || '?';
      combats[id] = (combats[id] || 0) + 1;
    }
  }
  // scan say stream already captured; also count disease cases
  const cases = {};
  for (const ev of tele) {
    if (ev.type === 'disease') cases[ev.id] = (cases[ev.id] || 0) + 1;
  }
  const waveUnlocks = {};
  for (const ev of tele) {
    if (ev.type === 'wave_unlock') waveUnlocks[ev.wave] = ev.day;
  }
  let maxWave = 1;
  try { maxWave = Game.unlockedWave ? Game.unlockedWave() : 1; } catch (e) {}
  const villagerDiseaseDeaths = [];
  for (const ev of tele) {
    if (ev.type === 'death' && (ev.kind || '') !== 'monster' && /sick|sickness|disease|fever|wound|lockjaw|gutrot/i.test(String(ev.cause || ''))) {
      villagerDiseaseDeaths.push({ day: ev.day, who: ev.who, cause: ev.cause });
    }
  }
  const endDay = (Game.state.scholar || {}).day || 0;
  return { seed, days: endDay, over: !!Game.over, maxWave, waveUnlocks, combats, cases, sayHits: sayHits.slice(0, 25), nSayHits: sayHits.length, villagerDiseaseDeaths };
}

(async () => {
  const out = [];
  for (const s of SEEDS) {
    try { out.push(await one(s)); } catch (e) { out.push({ seed: s, error: e.message }); }
  }
  console.log(JSON.stringify(out, null, 1));
})();
