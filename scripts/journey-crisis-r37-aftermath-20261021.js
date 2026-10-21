#!/usr/bin/env node
// journey-crisis-r37-aftermath-20261021.js — CRISIS LEG r37 (lane B): the
// scattering's aftermath. r36 proved the scattering is the compound-crisis
// break (earned, not mass-casualty). This run asks what the ending says and
// whether it's honest:
//   - is the scattering beat narrated (say line) when it fires?
//   - does the end state distinguish scattering (people walked away alive)
//     from extinction (everyone dead)? The game-over screen currently says
//     "THE VILLAGE DIES OUT / No one is left to pick up the Codex" for both,
//     contradicting the extinction beat's own "Not scattered" line.
//   - do person deaths get spontaneous grief dialogue within 7d (r35's
//     revised M4, driver-forced convos removed so this measures the game)?
//   - do lingering raiders resolve (r35 named-next)?
// Canon: docs/DISEASES.md, docs/PRESERVATION.md, docs/CORRUPTION.md.
// Steve: "violence desperate and traumatic, not power fantasy."
// Staging: blight from d20 + gut-rot on 5 adults at d25 (r36: scatters 2/3).
// Horizon: to d90, death-aware (+10d tail). No driven convos in this run.
// Usage: SEED=101 node scripts/journey-crisis-r37-aftermath-20261021.js
// Output: JSON record to stdout; narrative to stderr.
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require('./sim-harness');
const { oracleV2 } = require('./policies/oracleV2');

const SEED = parseInt(process.env.SEED || '101', 10);
const ESTABLISH = 20, OUTBREAK_DAY = 25, END_DAY = parseInt(process.env.END_DAY || '90', 10);

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
function captureScatter(Game, rec, E, tag) {
  try {
    const v = Game.state.village || {};
    if (v.scattered && !rec.scatter) {
      const pop = livingRoster(Game);
      rec.scatter = {
        day: dayOf(Game), detected: tag || 'chunk',
        livingAtScatter: pop.map(id => firstName(rawName(Game, id))),
        scholarAlive: !!(Game.state.scholar && !Game.state.scholar.dead),
        over: !!Game.over, villageLost: !!Game.villageLost,
        beatLines: rec.sayLog.filter(e => SCATTER_RE.test(e.line)).map(e => e.line),
        pantryAtScatter: pantryKcal(Game),
      };
      E(`[SCATTER] d${dayOf(Game)} living=${pop.length} scholarAlive=${rec.scatter.scholarAlive} beatLines=${rec.scatter.beatLines.length} (${rec.scatter.detected})`);
    }
  } catch (e) { rec.notes.push('scatter-detect threw: ' + (e.message || e)); }
}

const GRIEF_RE = /mourn|grief|griev|miss (her|him|them)|dead|died|death|grave|burial|funeral|lost her|lost him|lost them|gave them a good/i;
const SCATTER_RE = /couldn.t hold|scattering, again|started walking/i;
const CRISIS_SAY_RE = /CRISIS|died|dead|grave|burial|mourn|grief|sick|fever|gut rot|hunger|starv|triage|raid|scattering|gorge|treeline|drift off|sortie/i;

// Neutral daily convo (competent-player behavior): the player talks to people;
// the NPC brings up what IT wants. No grief steering — whatever mourning
// surfaces is the game's own engine. NPC speech captured via sayLine.
function driveNeutralConvo(Game, vid, maxTurns) {
  const npcLines = [];
  try { Game.startConvo(vid); } catch (e) { return { npcLines, ok: false }; }
  let lastPickId = null;
  for (let t = 0; t < (maxTurns || 5); t++) {
    let choices = [];
    try { choices = Game.convoChoices(vid) || []; } catch (e) { break; }
    if (!choices.length) break;
    let pool = choices.filter(c => c.id !== lastPickId);
    if (!pool.length) pool = choices;
    let pick = pool.find(c => c.id === 'ask:lately');
    if (!pick) pick = pool.find(c => /^(gq:|dlg:help|dlg:details|want:)/.test(c.id || ''));
    if (!pick) pick = pool.find(c => !/^(leave|bye|goodbye|betrayal:)/.test(c.id || ''));
    if (!pick || /^(leave|bye|goodbye)/.test(pick.id || '')) break;
    lastPickId = pick.id;
    try { Game.convoTurn(vid, pick.id); } catch (e) { break; }
    let c = null;
    try { c = Game.convoGet(vid); } catch (e) { break; }
    if (!c || !c.active) break;
  }
  try { Game.endConvo(vid, 'left'); } catch (e) {}
  return { npcLines, ok: true };
}

// per-lingerer fate tracking (r35 named-next): object-identity map so each
// lingering monster's own tenure is measured against the "~6 nights" promise
const lingerTrack = new Map(); // mon object -> {firstSeen, lastSeen, name, hp0}
function lingerFingerprint(Game, m) {
  let name = m.id || '?';
  try { name = (Game.monsterDisplayName && Game.monsterDisplayName(m.id)) || m.id || '?'; } catch (e) {}
  return { name: String(name).slice(0, 40), hp: m.hp || 0 };
}

async function main() {
  const E = console.error;
  const { Game } = await loadGame({ seed: SEED, mode: 'crisis-aftermath-r37', fullTelemetry: true });
  await setupGame(Game);
  const rec = {
    seed: SEED, raids: [], deaths: [], monsterKills: [], crises: [], burials: [],
    scatter: null, sayLog: [], npcLines: [], staged: [], sickPeak: 0, firstGraveTrue: 0,
    carriedCount: 0, notes: [], lingerFates: [], dailyConvos: [],
  };

  // sayLine is THE single NPC-speech emission point (conversation.js) — the
  // clean instrument for spontaneous grief dialogue (no keyword guessing on
  // narration). Captured unfiltered; the matcher below is name-bearing.
  const _sayLine = Game.sayLine;
  Game.sayLine = function (vid, line, opts) {
    try {
      const s = String(line || '');
      if (s && rec.npcLines.length < 8000)
        rec.npcLines.push({ day: dayOf(Game), vid: String(vid || '').slice(0, 24), line: s.slice(0, 400) });
    } catch (e) {}
    return _sayLine ? _sayLine.apply(this, arguments) : undefined;
  };

  const _say = Game.say;
  Game.say = function (msg) {
    try {
      const s = String(msg || '');
      if (CRISIS_SAY_RE.test(s) && rec.sayLog.length < 4000)
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
      rec.raids.push({ day: dayOf(Game), lingeringAfter: lingeringCount(Game), resolvedDay: null });
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
      const entry = { day: dayOf(Game), kind, vid: String(o.villagerId || o.vid || o.id || '?'), cause: String(o.cause || '?').slice(0, 60), name: firstName(rawName(Game, o.villagerId || o.vid || o.id)) };
      if (kind === 'person' || kind === 'villager') {
        rec.deaths.push(entry);
        E(`[DEATH] d${entry.day} ${entry.cause} (${entry.name})`);
      } else {
        rec.monsterKills.push(entry);
      }
    } catch (e) {}
    return r;
  };
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

  E(`[SETUP] seed ${SEED}: oracleV2 establishing ${ESTABLISH}d...`);
  await runDays(Game, oracleV2, { days: ESTABLISH });
  if (Game.over) { E('[SETUP] game over during establish — abort'); console.log(JSON.stringify(rec)); return; }
  E(`[ESTABLISHED] d${dayOf(Game)} pop=${livingRoster(Game).length} pantry=${pantryKcal(Game)}`);

  // blight: refuse ALL pantry inflows from d20
  let blockedKcal = 0;
  const _pa = Game.pantryAdd;
  Game.pantryAdd = function (item) { try { blockedKcal += ((item || {}).kcalEach || 0) * ((item || {}).units || 1); } catch (e) {} return undefined; };
  const _sp = Game.stockPantry;
  Game.stockPantry = function (kcal) { blockedKcal += (kcal || 0); return undefined; };
  rec.notes.push('blight: pantryAdd+stockPantry refused from d' + dayOf(Game));

  // outbreak at d25: gut-rot on 5 adults
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

  // compound run, 3-day chunks
  let tailDays = 0;
  while (dayOf(Game) < END_DAY && !Game.over && tailDays < 10) {
    await runDays(Game, oracleV2, { days: 3 });
    if (Game.over) break;
    const d = dayOf(Game);
    const pop = livingRoster(Game);
    if (pop.length <= 1) { tailDays += 3; }
    const sickNow = pop.filter(id => isSick(Game, id));
    if (sickNow.length > rec.sickPeak) rec.sickPeak = sickNow.length;
    // daily neutral convos: one per day of this chunk, rotating villagers.
    // The player talks; the NPC brings up what IT wants. Mourning topics
    // that surface here are the game's own grief engine, not driver steering.
    for (let ci = 0; ci < 3; ci++) {
      const candidates = livingRoster(Game).filter(id => id !== Game.villagerId);
      if (!candidates.length) break;
      const vid = candidates[(d + ci) % candidates.length];
      const before = rec.npcLines.length;
      const cv = driveNeutralConvo(Game, vid, 5);
      rec.dailyConvos.push({ day: d, vid: String(vid).slice(0, 24), npcLines: rec.npcLines.length - before, ok: cv.ok });
    }
    // scattering detection: the beat flips v.scattered and ends the run
    captureScatter(Game, rec, E, 'chunk');
    // lingering-raider fate: resolve tracking per lingerer (object identity)
    const nowLingering = new Set();
    try {
      for (const m of (Game.lingeringRaiders() || [])) {
        nowLingering.add(m);
        if (!lingerTrack.has(m)) {
          const fp = lingerFingerprint(Game, m);
          lingerTrack.set(m, { firstSeen: d, lastSeen: d, name: fp.name, hp0: fp.hp });
        } else {
          lingerTrack.get(m).lastSeen = d;
        }
      }
    } catch (e) {}
    for (const [m, t] of [...lingerTrack.entries()]) {
      if (!nowLingering.has(m)) {
        const days = t.lastSeen - t.firstSeen;
        rec.lingerFates.push({ name: t.name, firstSeen: t.firstSeen, lastSeen: t.lastSeen, days, overPromise: days > 6 });
        lingerTrack.delete(m);
        E(`[LINGER-FATE] ${t.name} lingered d${t.firstSeen}-d${t.lastSeen} (${days}d)${days > 6 ? ' OVER the ~6-night promise' : ''}`);
      }
    }
    // (coarse raid-level resolution kept for M4 continuity)
    const lc = nowLingering.size;
    for (const raid of rec.raids) {
      if (raid.lingeringAfter > 0 && raid.resolvedDay === null && lc === 0) {
        raid.resolvedDay = d;
        raid.resolvedInDays = d - raid.day;
        E(`[LINGER] raid d${raid.day} resolved by d${d} (${raid.resolvedInDays}d)`);
      }
    }
  }

  // post-loop scatter check: the beat ends the run (over=true), so the
  // in-loop detector never sees the chunk after it fires
  captureScatter(Game, rec, E, 'post-loop');

  // flush lingerers still present at run end
  for (const [m, t] of lingerTrack.entries()) {
    rec.lingerFates.push({ name: t.name, firstSeen: t.firstSeen, lastSeen: t.lastSeen, days: t.lastSeen - t.firstSeen, stillThere: true, overPromise: (t.lastSeen - t.firstSeen) > 6 });
  }

  rec.blockedKcal = Math.round(blockedKcal);
  try {
    const s = Game.state || {}, v = s.village || {}, sch = s.scholar || {};
    rec.endState = {
      over: !!Game.over, won: !!Game.won, villageLost: !!Game.villageLost,
      scattered: !!v.scattered, extinct: !!v.extinct,
      scholarDead: !!(sch.dead),
      livingCount: livingRoster(Game).length,
      living: livingRoster(Game).map(id => firstName(rawName(Game, id))),
    };
  } catch (e) { rec.endState = { err: String(e && e.message || e) }; }
  // spontaneous grief reach (r35's revised M4): per person death, >=1
  // NAME-BEARING NPC line (sayLine — the single NPC-speech emission point)
  // within 7d. The mourning engine names the dead; announcements and raid
  // lines are narration, not NPC speech, so this can't inflate on them.
  rec.griefReach = rec.deaths.map(dt => {
    const nm = String(dt.name || '').toLowerCase();
    const hits = nm ? rec.npcLines.filter(e => e.day >= dt.day && e.day <= dt.day + 7 && e.line.toLowerCase().includes(nm)) : [];
    return { name: dt.name, day: dt.day, cause: dt.cause, reached: hits.length > 0, hits: hits.slice(0, 2).map(e => ({ day: e.day, line: e.line.slice(0, 180) })) };
  });
  rec.notes.push(`ended d${dayOf(Game)} over=${!!Game.over} pop=${livingRoster(Game).length} pantry=${pantryKcal(Game)}`);
  E(`[DONE] seed ${SEED}: deaths=${rec.deaths.length} scatter=${rec.scatter ? 'd' + rec.scatter.day : 'none'} firstGraveTrue=${rec.firstGraveTrue} sickPeak=${rec.sickPeak} raids=${rec.raids.length}`);
  console.log(JSON.stringify(rec));
}

main().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
