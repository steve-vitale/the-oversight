#!/usr/bin/env node
// probe-lingerer-fate-20261021.js — M4 probe for journey-crisis r38.
// Natural siege seasons rarely leave raiders unmet (r38 pilot: 1 episode / 22
// raids — defenders meet everyone). This probe stages the honest case: the
// village bars the hall (shelterEveryoneBut — a real verb with real costs:
// lost production, and unmet raiders linger and gorge), then the player
// answers the beats panel's explicit default (answerLingerer('endure')).
// Questions: do the lingerers drift off within ~6 nights as the narration
// promises? Does the moved-on valve fire? Is the nightly gorge honest
// (say-line claims match pillage records)? Anything stuck?
// The sortie path is already proof-tested (test-lingerer-20261016.js) —
// this probe covers the endure natural history only.
// Usage: SEED=101 node scripts/probe-lingerer-fate-20261021.js
'use strict';
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { oracleV2 } = require('./policies/oracleV2');

const SEED = parseInt(process.env.SEED || '101', 10);
function dayOf(Game) { try { return Game.state.scholar.day || 0; } catch (e) { return 0; } }
function lingeringCount(Game) { try { return (Game.lingeringRaiders() || []).length; } catch (e) { return 0; } }

async function main() {
  const E = console.error;
  const { Game } = await loadGame({ seed: SEED, mode: 'linger-probe-r38', fullTelemetry: false });
  await setupGame(Game);
  const rec = { seed: SEED, raids: [], gorges: [], aidResolutions: [], lingererAnswers: [], daily: [], sayLog: [] };

  const _say = Game.say;
  Game.say = function (msg) {
    try {
      const s = String(msg || '');
      if (/lingering|gorges at the treeline|drift off|moved-on|treeline is quiet|Endure it|🚪|bar the hall/i.test(s))
        rec.sayLog.push({ day: dayOf(Game), line: s.slice(0, 200) });
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
      E(`[RAID] d${dayOf(Game)} lingering=${lingeringCount(Game)}`);
    }
    return r;
  };
  const _pillage = Game.raidPillage;
  Game.raidPillage = function (v, kcal) {
    const got = _pillage ? _pillage.apply(this, arguments) : 0;
    try { rec.gorges.push({ day: dayOf(Game), asked: Math.round(kcal || 0), got: Math.round(got || 0) }); } catch (e) {}
    return got;
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

  E(`[SETUP] seed ${SEED}: establishing 20d...`);
  await runDays(Game, oracleV2, { days: 20 });
  if (Game.over) { console.log(JSON.stringify({ ...rec, verdict: 'died-in-establish' })); return; }

  // Bar the hall: everyone inside except nobody. Real verb, real costs.
  const n = Game.shelterEveryoneBut([], { reason: 'raid-drill' });
  E(`[SHELTER] d${dayOf(Game)} sheltered ${n}`);

  // Wait for a raid that leaves lingerers (1-day chunks, 30d cap).
  let epStart = null;
  for (let i = 0; i < 30 && !Game.over; i++) {
    await runDays(Game, oracleV2, { days: 1 });
    const last = rec.raids[rec.raids.length - 1];
    if (last && last.lingeringAfter > 0 && !epStart) {
      epStart = { raidDay: last.day, n: last.lingeringAfter };
      E(`[EPISODE] opens d${last.day} with ${last.lingeringAfter} lingerers`);
      break;
    }
  }
  if (!epStart) { console.log(JSON.stringify({ ...rec, verdict: 'no-lingering-raid-in-30d' })); return; }

  // The player answers the beats panel's explicit default: endure it.
  Game.answerLingerer('endure');
  E(`[ENDURE] d${dayOf(Game)} answered endure`);

  // Watch 12 nights.
  for (let i = 0; i < 12 && !Game.over; i++) {
    await runDays(Game, oracleV2, { days: 1 });
    rec.daily.push({ day: dayOf(Game), lingering: lingeringCount(Game) });
    E(`[NIGHT] d${dayOf(Game)} lingering=${lingeringCount(Game)}`);
    if (lingeringCount(Game) === 0 && rec.daily.length >= 2) break;
  }

  // Release the hall (cleanliness for the record).
  try { Game.shelterAllClear(); } catch (e) {}

  const firstZero = rec.daily.find(d => d.lingering === 0);
  const daysToClear = firstZero ? firstZero.day - epStart.raidDay : null;
  const movedOn = rec.aidResolutions.some(x => x.how === 'moved-on' && x.day >= epStart.raidDay);
  const gorgeTotal = rec.gorges.filter(g => g.day >= epStart.raidDay).reduce((t, g) => t + g.got, 0);
  // gorge honesty: every gorge say-line's claimed number vs the pillage record.
  // Pair per day IN ORDER (one line + one pillage call per lingerer per night).
  const claims = rec.sayLog.filter(s => /gorges at the treeline/.test(s.line) && s.day >= epStart.raidDay);
  let mismatch = 0;
  const byDay = {};
  for (const c of claims) { (byDay[c.day] = byDay[c.day] || []).push(c); }
  const recByDay = {};
  for (const g of rec.gorges) { if (g.day >= epStart.raidDay) (recByDay[g.day] = recByDay[g.day] || []).push(g); }
  for (const d of Object.keys(byDay)) {
    const cs = byDay[d], gs = recByDay[d] || [];
    for (let i = 0; i < cs.length; i++) {
      const m = cs[i].line.match(/([\d,]+) kcal gone/);
      const claimed = m ? parseInt(m[1].replace(/,/g, ''), 10) : null;
      const g = gs[i];
      if (claimed !== null && g && Math.abs(claimed - g.got) > 1) { mismatch++; E(`[MISMATCH] d${d} #${i} claimed=${claimed} got=${g.got}`); }
      else if (claimed !== null && !g) { mismatch++; E(`[MISMATCH] d${d} #${i} claimed=${claimed} no pillage record`); }
    }
  }
  const verdict = {
    ...rec,
    episode: epStart,
    daysToClear,
    movedOnFired: movedOn,
    gorgeTotalKcal: gorgeTotal,
    gorgeClaimMismatch: mismatch,
    lingeringAtEnd: lingeringCount(Game),
    stuck: lingeringCount(Game) > 0,
  };
  E(`[VERDICT] daysToClear=${daysToClear} movedOn=${movedOn} gorge=${gorgeTotal} mismatch=${mismatch} stuck=${verdict.stuck}`);
  console.log(JSON.stringify(verdict));
}

main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
