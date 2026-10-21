#!/usr/bin/env node
// journey-crisis-r36-compound-20261021.js — CRISIS LEG r36 (lane B): the compound
// crisis, mass-casualty lens. When famine and outbreak hit TOGETHER and deaths
// come faster than the village can mourn, does the village stay honest and
// person-like — or do the grief/burial/talk systems break, go silent, repeat?
// Canon: docs/DISEASES.md (no true-name announcements undiagnosed),
// docs/PRESERVATION.md (food ladder), docs/CORRUPTION.md (fear slope — r7's
// ground). Prior art: r9 (2026-10-14 compound, interaction-deadlock lens, d55),
// r32 (outbreak sense-test, clean), r34 (famine; proposed mass-casualty
// exemption to the 100%-mourning bar + mourning-pool expansion), r35 (siege;
// named next: first-grave double-fire lead, spontaneous grief reachability).
// Question: does the overwhelm read as real, or as a bug?
// Staging: blight from d20 (r34: pantryAdd+stockPantry refused) + gut-rot on
// 5 adults at d25 (r9: downstream fully real). Run to d75, death-aware (+10d tail).
// Usage: SEED=101 node scripts/journey-crisis-r36-compound-20261021.js
// Output: JSON record to stdout; narrative + transcripts to stderr.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { oracleV2 } = require('./policies/oracleV2');

const SEED = parseInt(process.env.SEED || '101', 10);
const ESTABLISH = 20, OUTBREAK_DAY = 25, END_DAY = parseInt(process.env.END_DAY || '75', 10);

function dayOf(Game) { try { return Game.state.scholar.day || 0; } catch (e) { return 0; } }
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
function isSick(Game, vid) {
  try { const s = (Game.state.village.sick || {})[vid]; return s && (s.daysLeft || 0) > 0 && Game.vpOf(vid) && !Game.vpOf(vid).dead; } catch (e) { return false; }
}
function isAdult(Game, vid) { try { return Game.npcAge(vid) >= 15; } catch (e) { return true; } }
function pantryKcal(Game) {
  try { return Math.round((Game.state.village.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0)); }
  catch (e) { return 0; }
}
function lingeringCount(Game) { try { return (Game.lingeringRaiders() || []).length; } catch (e) { return 0; } }

// mass-casualty: >=5 deaths in any rolling 7-day window
function massCasualtyWindows(deaths) {
  const days = deaths.map(d => d.day).sort((a, b) => a - b);
  const wins = [];
  for (let i = 0; i < days.length; i++) {
    let j = i;
    while (j < days.length && days[j] - days[i] <= 6) j++;
    if (j - i >= 5) {
      const w = { start: days[i], end: days[j - 1], count: j - i };
      if (!wins.length || wins[wins.length - 1].end < w.start) wins.push(w);
      else if (w.count > wins[wins.length - 1].count) wins[wins.length - 1] = w;
    }
  }
  return wins;
}

function pickChoice(choices, mode, lastPickId) {
  const isLoopTrap = (c) => /^(betrayal:investigate|betrayal:site|betrayal:witnesses)/.test(c.id || '');
  const notRepeat = (c) => c.id !== lastPickId;
  const griefKw = /dead|died|death|mourn|grief|griev|funeral|burial|grave|lost|gone/i;
  const overwhelmKw = /dead|died|death|everyone|all of|too many|can't keep|bury|burial|grave|gone|lost/i;
  const crisisKw = /hunger|hungry|starv|food|eat|sick|ill|fever|tired|worse|disease|gut|tend|heal|dead|died|gone|grief|mourn|buri/i;
  let pool = choices.filter(notRepeat);
  if (!pool.length) pool = choices;
  const kw = mode === 'grief' ? griefKw : mode === 'overwhelm' ? overwhelmKw : crisisKw;
  let pick = pool.find(c => c.id === 'ask:lately');
  if (!pick) pick = pool.find(c => kw.test(c.text || '') && !isLoopTrap(c));
  if (!pick) pick = pool.find(c => /^gq:/.test(c.id));
  if (!pick) pick = pool.find(c => /^(dlg:help|dlg:details|want:)/.test(c.id));
  if (!pick) pick = pool.find(c => !/^(leave|bye|goodbye)/.test(c.id) && !isLoopTrap(c));
  if (!pick) pick = pool.find(c => !/^(leave|bye|goodbye)/.test(c.id));
  return pick || null;
}

const GRIEF_RE = /mourn|grief|griev|miss (her|him|them)|dead|died|death|grave|burial|funeral|lost her|lost him|lost them|gave them a good/i;
const CRISIS_RE = /hunger|hungry|starv|food|eat\b|sick|ill|fever|tired|tire|worse|disease|gut|tend|heal|dead|died|gone|grief|mourn|buri|funeral|too many|everyone/i;

function driveConvo(Game, vid, tag, maxTurns, mode) {
  maxTurns = maxTurns || 12;
  const out = [`## ${tag} — talking to ${firstName(rawName(Game, vid))} (d${dayOf(Game)})`];
  const npcLines = [];
  let lastPickId = null;
  try { Game.startConvo(vid); } catch (e) { return { text: out.join('\n') + ' (startConvo threw: ' + e.message + ')', surfaced: false, carried: false, npcLines }; }
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
  const surfaced = npcLines.some(l => GRIEF_RE.test(l));
  const carried = npcLines.some(l => CRISIS_RE.test(l));
  return { text: out.join('\n'), surfaced, carried, npcLines };
}

async function main() {
  const E = console.error;
  const { Game } = await loadGame({ seed: SEED, mode: 'crisis-compound-r36', fullTelemetry: true });
  await setupGame(Game);
  const rec = {
    seed: SEED, raids: [], deaths: [], monsterKills: [], crises: [], burials: [],
    griefConvos: [], overwhelmConvos: [], crisisConvos: [], dawns: [],
    convos: [], notes: [], sayLog: [], staged: [],
    sickPeak: 0, carriedCount: 0, firstGraveTrue: 0,
  };

  // ---- instrumentation (all call-through) ----
  const _say = Game.say;
  Game.say = function (msg) {
    try {
      const s = String(msg || '');
      if (/CRISIS|died|dead|grave|burial|mourn|sick|fever|gut rot|hunger|starv|triage/i.test(s))
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
  const _regDeath = Game.registerDeath;
  Game.registerDeath = function (opts) {
    const r = _regDeath ? _regDeath.call(this, opts) : undefined;
    try {
      const o = opts || {};
      const kind = String(o.kind || '?');
      const entry = { day: dayOf(Game), kind, vid: String(o.villagerId || o.vid || o.id || '?'), cause: String(o.cause || '?').slice(0, 60) };
      // 'villager combat' cause with kind 'monster' = a VILLAGER KILLED A
      // MONSTER (game.js) — defense data, not a village death. Only
      // person/villager kinds count toward casualty logic.
      if (kind === 'person' || kind === 'villager') {
        rec.deaths.push(entry);
        E(`[DEATH] d${entry.day} ${entry.cause} (${firstName(rawName(Game, entry.vid))})`);
      } else {
        rec.monsterKills.push(entry);
      }
    } catch (e) {}
    return r;
  };
  // NOTE (r36): record the RETURN VALUE, not just the call — fireCrisis
  // dedupes once-per-kind-per-run, so a second CALL is not a second FIRE.
  // The r35 "first-grave fired 2x" lead may be an instrument artifact of
  // counting calls. M5 asserts true-returns <= 1.
  const _fireCrisis = Game.fireCrisis;
  Game.fireCrisis = function (kind, ctx) {
    const r = _fireCrisis ? _fireCrisis.call(this, kind, ctx) : undefined;
    rec.crises.push({ day: dayOf(Game), kind: String(kind), fired: r === true });
    if (kind === 'first-grave' && r === true) rec.firstGraveTrue++;
    E(`[CRISIS] d${dayOf(Game)} ${kind} fired=${r === true}`);
    return r;
  };
  const _bury = Game.buryCorpse;
  Game.buryCorpse = function () {
    const r = _bury ? _bury.apply(this, arguments) : undefined;
    rec.burials.push({ day: dayOf(Game), ok: !!r });
    if (r) E(`[BURIAL] d${dayOf(Game)}`);
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
    const pop = livingRoster(Game);
    const sickNow = pop.filter(id => isSick(Game, id));
    if (sickNow.length > rec.sickPeak) rec.sickPeak = sickNow.length;
    let unburied = 0;
    try {
      const isP = (c) => Game.corpseIsPerson ? Game.corpseIsPerson(c) : (c.kind === 'person' || c.kind === 'villager');
      for (const c of (Game.corpses ? Game.corpses() : [])) if (isP(c) && !c.buried) unburied++;
    } catch (e) {}
    const last = rec.dawns.length ? rec.dawns[rec.dawns.length - 1] : null;
    rec.dawns.push({
      day: dayOf(Game), label: label || '', pantry: pantryKcal(Game),
      pop: pop.length, sick: sickNow.length, unburied,
      gaveSince: Math.round(givesSum - (last ? last.givesSum : givesSum)),
      givesSum: Math.round(givesSum),
      deathsToday: rec.deaths.filter(e => e.day === dayOf(Game)).length,
    });
  };
  sampleDawn('established');

  // ---- phase 2: the blight — refuse ALL pantry inflows from d20 ----
  let blockedKcal = 0;
  const _pa = Game.pantryAdd;
  Game.pantryAdd = function (item) { try { blockedKcal += ((item || {}).kcalEach || 0) * ((item || {}).units || 1); } catch (e) {} return undefined; };
  const _sp = Game.stockPantry;
  Game.stockPantry = function (kcal) { blockedKcal += (kcal || 0); return undefined; };
  rec.notes.push('blight: pantryAdd+stockPantry refused from d' + dayOf(Game));

  // ---- phase 3: the outbreak at d25 — gut-rot on 5 adults, downstream real ----
  while (dayOf(Game) < OUTBREAK_DAY && !Game.over) await runDays(Game, oracleV2, { days: 1 });
  if (!Game.over) {
    const adults = livingRoster(Game).filter(id => isAdult(Game, id) && id !== Game.villagerId);
    const staged = adults.slice(0, 5);
    const v = Game.state.village;
    v.sick = v.sick || {};
    for (const id of staged) {
      v.sick[id] = { name: 'gut rot', daysLeft: 14, severity: 3 };
      rec.staged.push({ who: firstName(rawName(Game, id)) });
    }
    rec.notes.push(`staged gut-rot outbreak on ${staged.length} adults at d${dayOf(Game)}; downstream fully real`);
    E(`[OUTBREAK] d${dayOf(Game)} staged on ${staged.map(id => firstName(rawName(Game, id))).join(', ')}`);
  }
  sampleDawn('compound-start');

  // ---- phase 4: compound run to d75, 3-day chunks ----
  const griefedVids = new Set();
  const overwhelmedDone = new Set();
  while (dayOf(Game) < END_DAY && !Game.over) {
    await runDays(Game, oracleV2, { days: 3 });
    if (Game.over) break;
    const d = dayOf(Game);
    if (livingRoster(Game).length <= 1) { rec.notes.push(`death-aware stop d${d}: pop<=1`); break; }
    sampleDawn('chunk');

    // grief convos 1-7d after each death (one per death)
    for (const death of rec.deaths) {
      if (griefedVids.has(death.vid) || d - death.day < 1 || d - death.day > 7) continue;
      griefedVids.add(death.vid);
      const talkTo = livingRoster(Game).find(id => id !== death.vid) || livingRoster(Game)[0];
      if (talkTo) {
        const cv = driveConvo(Game, talkTo, `grief-d${d} for ${firstName(rawName(Game, death.vid))}`, 10, 'grief');
        rec.griefConvos.push({ day: d, forVid: String(death.vid).slice(0, 16), deathDay: death.day, surfaced: cv.surfaced, carried: cv.carried });
        rec.convos.push(cv.text);
        E(`[CONVO] grief d${d} (death d${death.day}) surfaced=${cv.surfaced}`);
      }
    }
    // overwhelm beat: when a mass-casualty window is OPEN, drive one convo
    // with a survivor in 'overwhelm' mode (threshold-crossing, once per window)
    for (const w of massCasualtyWindows(rec.deaths)) {
      const key = `${w.start}-${w.end}`;
      if (overwhelmedDone.has(key) || d < w.start || d > w.end + 3) continue;
      overwhelmedDone.add(key);
      const talkTo = livingRoster(Game)[0];
      if (talkTo) {
        const cv = driveConvo(Game, talkTo, `overwhelm-d${d} (${w.count} deaths d${w.start}-${w.end})`, 12, 'overwhelm');
        rec.overwhelmConvos.push({ day: d, window: w, surfaced: cv.surfaced, carried: cv.carried });
        rec.convos.push(cv.text);
        E(`[CONVO] OVERWHELM d${d} window d${w.start}-${w.end} (${w.count} deaths) surfaced=${cv.surfaced}`);
      }
    }
    // crisis-pulse beat: one convo every ~9 days to sample whether the
    // compound crisis is carried in talk (r9's carried metric, live)
    if (d % 9 < 3 && livingRoster(Game).length > 1) {
      const talkTo = livingRoster(Game)[1] || livingRoster(Game)[0];
      const cv = driveConvo(Game, talkTo, `pulse-d${d}`, 8, 'crisis');
      rec.crisisConvos.push({ day: d, carried: cv.carried, surfaced: cv.surfaced });
      rec.convos.push(cv.text);
    }
  }

  rec.carriedCount = rec.crisisConvos.filter(c => c.carried).length + rec.overwhelmConvos.filter(c => c.carried).length;
  rec.massCasualtyWindows = massCasualtyWindows(rec.deaths);
  rec.blockedKcal = Math.round(blockedKcal);
  try {
    const s = Game.state || {}, v = s.village || {}, sch = s.scholar || {};
    rec.endState = {
      over: !!Game.over, won: !!Game.won, villageLost: !!Game.villageLost,
      scholarDead: !!(sch.dead), scholarHealth: sch.health,
      bearer: Game.villagerId || null,
      livingCount: livingRoster(Game).length,
    };
  } catch (e) { rec.endState = { err: String(e && e.message || e) }; }
  rec.notes.push(`ended d${dayOf(Game)} over=${!!Game.over} pop=${livingRoster(Game).length} pantry=${pantryKcal(Game)}`);
  E(`[DONE] seed ${SEED}: deaths=${rec.deaths.length} massCasualtyWindows=${rec.massCasualtyWindows.length} firstGraveTrue=${rec.firstGraveTrue} sickPeak=${rec.sickPeak} carried=${rec.carriedCount}`);
  console.log(JSON.stringify(rec));
}

main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
