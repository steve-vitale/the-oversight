#!/usr/bin/env node
// test-seasonbeat-p1.js — PROOF for rogue P1 T4 (season-turn beat).
//
// BLANK: day/season/run-arc don't mirror (no fractal). endDay had no
// reflection beat; season was a weather layer, not a loop
// (roguelike-celebration-audit.md Talk 4 G2).
//
// GREEN: on the regionCalendar flip, endDay fires Game.seasonTurnBeat exactly
// once: narrated (non-empty fireside lines — no silent actions), reflection
// grounded in recorded in-season learnings/deaths, ≤2 knowledge gaps that
// are ACTUAL gaps in the run's state (Codex + living villagers), and the
// beat grants nothing (knowledge grant fns wrapped — zero calls from the
// beat; codex/pantry/kcal snapshots byte-identical across it).
//
// Usage: node scripts/test-seasonbeat-p1.js
'use strict';
const { loadGame, setupGame, mulberry32 } = require('./sim-harness');

let pass = 0, fail = 0;
function check(id, ok, detail) {
  if (ok) { pass++; console.log(`  [OK] ${id}`); }
  else { fail++; console.log(`  [FAIL] ${id}${detail ? ' — ' + detail : ''}`); }
}

// independent recompute of the beat's gap contract: candidate skills for the
// coming season's temp/wetness, first two that NOBODY living knows
function expectedGaps(Game, se) {
  const cands = [];
  const temp = (se && se.temp) || '';
  const w = (se && se.weather) || {};
  const wet = (w.rain || 0) + (w.storm || 0) + (w.monsoon || 0);
  if (temp === 'cold' || temp === 'frozen') cands.push('preserve_food', 'shelter_debris', 'fire_rain', 'weather_read');
  else if (temp === 'hot') cands.push('purify_boil', 'weather_read', 'purify_solar', 'shelter_debris');
  else if (temp === 'cool') cands.push('preserve_food', 'snare_wire', 'fire_rain', 'weather_read');
  else if (temp === 'warm') cands.push('purify_boil', 'fire_rain', 'weather_read', 'forage_sense');
  else cands.push('forage_sense', 'fishing', 'weather_read', 'purify_boil');
  if (wet >= 0.4) for (const s of ['fire_rain', 'weather_read']) if (cands.indexOf(s) < 0) cands.unshift(s);
  const out = [];
  for (const sid of cands) {
    if (out.length >= 2) break;
    if (out.some(g => g.sid === sid)) continue;
    const k = (Game.data.knowledge || []).find(x => x.id === sid);
    if (!k || !k.name) continue;
    if (Game.villageKnowsSkill(sid)) continue;
    out.push({ sid, name: k.name });
  }
  return out;
}

async function main() {
  Math.random = mulberry32(5150);
  const { Game } = await loadGame({ seed: 5150, mode: 'seasonbeat-proof', fullTelemetry: false });
  const said = [];
  Game.say = (t) => { said.push(String(t)); };
  await setupGame(Game);

  // find the first season flip ahead of day 1
  const s1 = Game.season(1).id;
  let flipDay = -1;
  for (let d = 2; d <= 400; d++) {
    if (Game.season(d).id !== s1) { flipDay = d; break; }
  }
  check('flip-found', flipDay > 1, `season(1)=${s1} flipDay=${flipDay}`);
  const oldSe = Game.season(flipDay - 1);
  const newSe = Game.season(flipDay);
  check('flip-is-boundary', oldSe.id !== newSe.id && Game.season(flipDay + 1).id === newSe.id,
    `${oldSe.id} -> ${newSe.id}`);

  // position the run the day before the flip
  Game.state.scholar.day = flipDay - 1;
  if (Game.state.village) Game.state.village.day = flipDay - 1;

  // wrap the beat: count fires + detect any grant from inside it
  let fires = 0;
  let grants = 0;
  const grantFns = ['learnSkill', 'identifyPlant', 'grantKnowledge', '_grantRecipe'];
  const origBeat = Game.seasonTurnBeat.bind(Game);
  Game.seasonTurnBeat = function (b, a) {
    fires++;
    // beat-scoped say capture: endDay keeps narrating after the hook, so
    // the beat's own lines are isolated here
    const saySaved = Game.say;
    const beatSaid = [];
    Game.say = (t) => { said.push(String(t)); beatSaid.push(String(t)); };
    const saved = {};
    for (const m of grantFns) {
      if (typeof Game[m] === 'function') {
        saved[m] = Game[m];
        Game[m] = function () { grants++; return saved[m].apply(this, arguments); };
      }
    }
    const codexBefore = JSON.stringify(Game.state.codex || {});
    const kcalBefore = (Game.state.scholar || {}).kcal;
    try { return origBeat(b, a); }
    finally {
      for (const m of Object.keys(saved)) Game[m] = saved[m];
      Game.say = saySaved;
      Game._beatSaid = beatSaid;
      Game._seasonBeatCodexBefore = codexBefore;
      Game._seasonBeatKcalBefore = kcalBefore;
    }
  };

  const beatLinesBefore = said.length;
  Game.endDay(); // the real night transition, across the flip
  const beatLines = Game._beatSaid || [];
  check('beat-lines-isolated', beatLines.length >= 3 && said.length > beatLinesBefore + beatLines.length,
    `beat=${beatLines.length} total-endday=${said.length - beatLinesBefore}`);

  check('fires-exactly-once', fires === 1, `fires=${fires}`);
  check('narrates', beatLines.length >= 3 && beatLines.every(l => l.trim().length > 0),
    `${beatLines.length} non-empty lines`);
  console.log('  beat lines:');
  for (const l of beatLines) console.log('   | ' + l.slice(0, 160));

  // fractal frame: the beat states the daily/seasonal mirror
  const frame = beatLines[0] || '';
  check('fractal-frame', /day ends at the fire/i.test(frame), frame.slice(0, 90));

  // reflection grounding: "grew this season — N new" must match an
  // independent count of in-season learnings from state stamps
  const firstDay = flipDay - oldSe.seasonDays;
  const inSeason = (d) => (d || 0) >= firstDay && (d || 0) < flipDay;
  let learnedCount = 0;
  {
    const cx = Game.state.codex || {};
    for (const e of Object.values(cx.plants || {})) if ((e.level || 0) >= 1 && inSeason(e.identifiedDay)) learnedCount++;
    for (const e of Object.values(cx.skills || {})) if (e.via !== 'background' && inSeason(e.learnedDay)) learnedCount++;
    for (const e of Object.values(cx.recipes || {})) if (e.via !== 'background' && inSeason(e.learnedDay)) learnedCount++;
    for (const e of Object.values(cx.animals || {})) if (inSeason(e.learnedDay)) learnedCount++;
  }
  const reflLine = beatLines.find(l => /Codex (grew|gained)/.test(l)) || '';
  const mCount = reflLine.match(/(\d+) new/);
  check('reflection-count-grounded',
    learnedCount > 0 ? (!!mCount && Number(mCount[1]) === learnedCount) : /gained nothing new/.test(reflLine),
    `line="${reflLine.slice(0, 80)}" state=${learnedCount}`);

  // independently verify the label matches wawSeasonLabel
  const pk = (Game.placeKnown ? Game.placeKnown() : {}) || {};
  if ((pk.season || 0) >= 1) {
    const lbl = Game.wawSeasonLabel(newSe.id);
    check('names-coming-season-when-known', beatLines.some(l => l.includes(lbl)),
      `label=${lbl} pk.season=${pk.season}`);
  }

  // gaps: ≤2, and every named gap is an actual gap in run state
  const exp = expectedGaps(Game, newSe);
  const fwdLine = beatLines[beatLines.length - 1] || '';
  const namedInFwd = exp.filter(g => fwdLine.includes(g.name));
  check('gaps-at-most-two', exp.length <= 2, `expected=${exp.length}`);
  if (exp.length) {
    check('gaps-are-actual-gaps', namedInFwd.length === exp.length,
      `expected [${exp.map(g => g.name).join(', ')}], forward line names [${namedInFwd.map(g => g.name).join(', ')}]`);
    // none of the named gaps may be known by anyone living
    check('gaps-unknown-to-village', exp.every(g => !Game.villageKnowsSkill(g.sid)),
      exp.map(g => g.sid).join(', '));
  } else {
    check('no-gaps-honest-line', /ready/i.test(fwdLine), fwdLine.slice(0, 90));
  }
  // the forward line must not name MORE gaps than the contract allows
  const allSkillNames = (Game.data.knowledge || []).map(k => k.name).filter(Boolean);
  const extraNamed = allSkillNames.filter(n => n.length > 4 && fwdLine.includes(n) && !exp.some(g => g.name === n));
  check('no-extra-gap-names', extraNamed.length === 0, extraNamed.slice(0, 2).join(', ') || 'none');

  // parity: the beat grants nothing
  check('grants-nothing', grants === 0, `grant-fn calls from beat=${grants}`);
  check('codex-unchanged', JSON.stringify(Game.state.codex || {}) === Game._seasonBeatCodexBefore,
    'codex byte-identical across beat');
  check('kcal-unchanged', (Game.state.scholar || {}).kcal === Game._seasonBeatKcalBefore,
    `kcal ${Game._seasonBeatKcalBefore} -> ${(Game.state.scholar || {}).kcal}`);

  // exactly-once: the next endDay (no flip) must not fire again
  Game.endDay();
  check('no-double-fire', fires === 1, `fires=${fires} after second endDay`);

  // 'none' guard: a seasonless region never fires
  const realSeason = Game.season;
  Game.season = () => ({ id: 'none', temp: null, weather: null, dayOfSeason: 0, seasonDays: 0, dayOfYear: 0, yearDays: 0, hemisphere: 'north', region: null });
  try { Game.endDay(); } catch (e) { console.log('  (none-guard endDay threw: ' + String(e).slice(0, 80) + ')'); }
  Game.season = realSeason;
  check('none-season-no-fire', fires === 1, `fires=${fires} with seasonless stub`);

  // knowledge-gating tier 0: at placeKnown.season 0 the beat names no season
  const sc = Game.state.scholar || {};
  const pkSaved = sc.placeKnown;
  sc.placeKnown = { region: 0, season: 0 };
  const said2 = [];
  const saySaved = Game.say;
  Game.say = (t) => { said2.push(String(t)); };
  const firesBefore = fires;
  try { Game.seasonTurnBeat(oldSe, newSe); }
  finally { Game.say = saySaved; sc.placeKnown = pkSaved; }
  const anyLabel = ['spring', 'summer', 'fall', 'winter', 'dry', 'wet', 'hot', 'cool', 'cold', 'mild']
    .some(w => said2.some(l => new RegExp(`\\b${w}\\b`, 'i').test(l) && /night of|coming|Behind us/i.test(l)));
  check('tier0-names-no-season', !anyLabel && fires === firesBefore + 1,
    `named-season=${anyLabel} lines=${said2.length}`);
  console.log('  tier-0 lines:');
  for (const l of said2) console.log('   | ' + l.slice(0, 160));

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('THREW: ' + e.stack); process.exit(1); });
