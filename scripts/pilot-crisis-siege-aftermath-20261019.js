#!/usr/bin/env node
// pilot-crisis-siege-aftermath-20261019.js — CRISIS LEG r30 (lane B): THE SIEGE AS A PEOPLE EVENT. (v2)
//
// PRE-REGISTERED (crisis leg r30): when a raid hits Haven, do villagers
// behave like people under siege — and does the aftermath live in the
// village's social tissue (defenders named, wounds acknowledged, fallen
// mourned, fear spoken), or does the raid resolve as pure mechanics with
// no social consequence?
//
// Interesting-finding bar (any of these):
//   (a) a raid where no defender's name ever appears in narrative;
//   (b) wounded defenders with zero acknowledgment (no tend/care, no mention);
//   (c) 'the-siege' fires and the 'defense' lately-topic never surfaces in
//       a post-siege conversation driven INSIDE the 7-day window;
//   (d) a defender dies and no mourning/mention machinery speaks.
// Seeds: 7, 42, 99, 424242 (continuity with r25). Policy: oracleV2.
// Horizon: 120d death-aware (+10d tail).
// Metrics (bound: sense + counts): raids; defendersPerRaid (named);
//   defenderDeaths (via deaths roll); defenderWounds (hurtVillager);
//   siegeFires; defendedMems; tendedMems; post-siege convos (within window).
// v2 fixes: CHUNK=5 + convos driven the chunk a raid fires (inside the
// 7-day 'defense' window); outcomes read from defended-memory text
// (authoritative) not end-of-run state inference.
// Usage: SEED=7 DAYS=120 node scripts/pilot-crisis-siege-aftermath-20261019.js > rec.json 2> log
'use strict';
const path = require('path');
const ROOT = path.join(__dirname, '..');
const { loadGame, setupGame, runDays } = require(path.join(ROOT, 'scripts', 'sim-harness'));
const { oracleV2 } = require(path.join(ROOT, 'scripts', 'policies', 'oracleV2'));

const SEED = parseInt(process.env.SEED || '7', 10);
const DAYS = parseInt(process.env.DAYS || '120', 10);
const CHUNK = 5;
const E = (s) => console.error(s);

function dayOf(Game) { try { return Game.state.scholar.day || 0; } catch (e) { return 0; } }
function aliveCount(Game) {
  try {
    return (Game.state.village.roster || []).filter(id => {
      const c = (Game.state.village.rosterChars || {})[id];
      return c && c.alive !== false;
    }).length;
  } catch (e) { return -1; }
}
function nm(Game, vid) {
  try { const rc = ((Game.state.village || {}).rosterChars || {})[vid]; if (rc && rc.name) return String(rc.name).split(' ')[0]; } catch (e) {}
  try { return String(Game.displayName(vid)).split(' ')[0]; } catch (e) {}
  return String(vid).slice(0, 10);
}
function isAlive(Game, vid) {
  try { const c = ((Game.state.village || {}).rosterChars || {})[vid]; return c && c.alive !== false; } catch (e) { return true; }
}
function livingVids(Game) {
  return (Game.state.village.roster || []).filter(id => id !== Game.villagerId && isAlive(Game, id));
}

// --- conversation driver (from journey2-social-r28-pilot, lately-first) ---
function driveOne(Game, vid, tag, mode, convoLog) {
  const day = dayOf(Game);
  const out = { vid, name: nm(Game, vid), tag, mode, day, turns: 0, naturalEnd: false, transcript: [] };
  try { Game.startConvo(vid); } catch (e) { out.error = 'startConvo: ' + e.message; return out; }
  const seenIds = [];
  for (let t = 0; t < 14; t++) {
    let c = null; try { c = Game.convoGet(vid); } catch (e) {}
    if (!c || !c.active) { out.naturalEnd = true; out.turns = t; break; }
    let choices = []; try { choices = Game.convoChoices(vid) || []; } catch (e) {}
    if (!choices.length) { out.naturalEnd = true; break; }
    const fresh = (x) => x && !seenIds.includes(String(x.id || ''));
    let pick = null;
    if (mode === 'lately') pick = choices.find(x => /^(ask:lately|alive:event)$/.test(String(x.id || '')));
    if (!pick) pick = choices.find(x => String(x.id || '') === 'more');
    if (!pick) pick = choices.find(x => fresh(x) && String(x.temper || '') === 'kind');
    if (!pick) pick = choices.find(x => fresh(x) && /^(dlg:commit|dlg:help|dlg:details|want:|ask:|gq:)/.test(String(x.id || '')));
    if (!pick) pick = choices.find(x => x && /^(dlg:commit|dlg:help|dlg:details|want:|ask:|gq:)/.test(String(x.id || '')));
    if (!pick) pick = choices.find(x => fresh(x) && !/^(leave|bye|goodbye)/.test(String(x.id || '')));
    if (!pick) pick = choices.find(x => x && !/^(leave|bye|goodbye)/.test(String(x.id || '')));
    if (!pick) pick = choices[0];
    if (!pick) break;
    seenIds.push(String(pick.id || ''));
    try { Game.convoTurn(vid, pick.id); } catch (e) { out.error = 'convoTurn: ' + e.message; break; }
    out.turns++;
  }
  if (!out.naturalEnd && out.turns >= 14) { try { Game.endConvo(vid, 'left'); } catch (e) {} }
  try {
    const c = Game.convoGet(vid);
    out.transcript = ((c && c.transcript) || []).map(e => ({ who: e.who === 'you' ? 'YOU' : 'NPC', text: String(e.text || '') }));
  } catch (e) {}
  if (convoLog) convoLog.push(out);
  return out;
}

(async () => {
  const { Game } = await loadGame({ seed: SEED, mode: 'crisis-siege-r30' });
  await setupGame(Game);

  const raids = [];          // {day, line}
  const defenderFights = []; // {day, defender, monster}
  const defenderWounds = []; // hurtVillager {day, who, amount, cause}
  const crisisFires = [];    // {day, kind}
  const defendedMems = [];   // {day, who, text}
  const tendedMems = [];     // {day, who, text} kind tended/tended_by
  const raidLines = [];
  const hungerLines = [];
  const allDeaths = [];
  const convos = [];
  let convosDriven = false;

  const _rwme = Game.resolveWildMonsterEncounter ? Game.resolveWildMonsterEncounter.bind(Game) : null;
  if (_rwme) {
    Game.resolveWildMonsterEncounter = function (vid, m, opts) {
      if (opts && opts.raid) defenderFights.push({ day: dayOf(Game), defender: nm(Game, vid), monster: (m && m.id) || '?' });
      return _rwme(vid, m, opts);
    };
  }
  const _hv = Game.hurtVillager ? Game.hurtVillager.bind(Game) : null;
  if (_hv) {
    Game.hurtVillager = function (vid, amt, cause) {
      defenderWounds.push({ day: dayOf(Game), who: nm(Game, vid), amount: amt, cause: String(cause || '') });
      return _hv(vid, amt, cause);
    };
  }
  const _fc = Game.fireCrisis ? Game.fireCrisis.bind(Game) : null;
  if (_fc) {
    Game.fireCrisis = function (kind, ctx) {
      const r = _fc(kind, ctx);
      if (r) {
        crisisFires.push({ day: dayOf(Game), kind, name: (ctx && ctx.name) || null });
        E(`[CRISIS] day ${dayOf(Game)}: ${kind}`);
      }
      return r;
    };
  }
  const _rem = Game.remember ? Game.remember.bind(Game) : null;
  if (_rem) {
    Game.remember = function (vid, kind, text, opts) {
      const r = _rem(vid, kind, text, opts);
      if (kind === 'defended') defendedMems.push({ day: dayOf(Game), who: nm(Game, vid), text: String(text || '').slice(0, 200) });
      if (kind === 'tended' || kind === 'tended_by') tendedMems.push({ day: dayOf(Game), who: nm(Game, vid), kind, text: String(text || '').slice(0, 160) });
      return r;
    };
  }
  const _say = Game.say ? Game.say.bind(Game) : null;
  if (_say) {
    Game.say = function (txt) {
      const t = String(txt || '');
      if (/RAID|siege|defend|treeline|hit Haven|raider|🛡️|met them at the door/i.test(t) && raidLines.length < 400)
        raidLines.push({ day: dayOf(Game), line: t.slice(0, 300) });
      if (/hunger|starv|pantry is an echo|gone to sleep hungry/i.test(t) && hungerLines.length < 120)
        hungerLines.push({ day: dayOf(Game), line: t.slice(0, 300) });
      return _say(txt);
    };
  }

  E(`[SETUP] seed ${SEED}: oracleV2 running to day ${DAYS} (chunk ${CHUNK})...`);
  let day = 0, tailLeft = 10, endReason = '?';
  while (day < DAYS) {
    const raidsBefore = raids.length;
    const r = await runDays(Game, oracleV2, { days: CHUNK });
    day += (r.days || 0);
    (r.samples && r.samples.deaths || []).forEach(d => allDeaths.push({ day: d.day, who: String(d.who || ''), cause: d.cause, player: !!d.player }));
    for (const l of raidLines) {
      if (!l.counted) { l.counted = true; if (/RAID/.test(l.line)) raids.push({ day: l.day, line: l.line.slice(0, 160) }); }
    }
    // people check: the chunk a raid fires, talk to a defender + a non-defender
    // (inside the 7-day 'defense' lately window)
    if (!convosDriven && raids.length > raidsBefore && defenderFights.length) {
      const today = dayOf(Game);
      const recentFighters = defenderFights.filter(f => today - f.day <= 7);
      const defenderVid = livingVids(Game).find(id => recentFighters.some(f => f.defender === nm(Game, id)));
      const fighterNames = new Set(defenderFights.map(f => f.defender));
      const otherVid = livingVids(Game).find(id => !fighterNames.has(nm(Game, id)) && id !== defenderVid)
        || livingVids(Game).find(id => id !== defenderVid);
      if (defenderVid) driveOne(Game, defenderVid, 'raid-week defender', 'lately', convos);
      if (otherVid) driveOne(Game, otherVid, 'raid-week non-defender', 'lately', convos);
      convosDriven = true;
      E(`[CONVOS] drove ${convos.length} post-raid conversations at day ${today}`);
    }
    E(`[CHUNK] gameday ${dayOf(Game)} alive=${aliveCount(Game)} over=${!!Game.over} raids=${raids.length} defenders=${defenderFights.length} sieges=${crisisFires.filter(c => c.kind === 'the-siege').length}`);
    if (Game.villageLost || Game.over) {
      endReason = Game.villageLost ? 'village-lost' : 'over-other';
      E(`[DEAD] at day ${dayOf(Game)}; tail ${tailLeft}d`);
      const tail = await runDays(Game, oracleV2, { days: Math.min(tailLeft, CHUNK) });
      day += (tail.days || 0);
      (tail.samples && tail.samples.deaths || []).forEach(d => allDeaths.push({ day: d.day, who: String(d.who || ''), cause: d.cause, player: !!d.player }));
      break;
    }
    if (r.endReason !== 'survived') { endReason = r.endReason; break; }
    endReason = 'survived';
  }
  if (endReason === 'survived' && day >= DAYS) endReason = 'survived';

  // defender deaths: match defender first-names against the death roll near their fight
  const fighterNames = new Set(defenderFights.map(f => f.defender));
  const defenderDeaths = allDeaths.filter(d =>
    fighterNames.has(String(d.who || '').split(' ')[0]) &&
    defenderFights.some(f => f.defender === String(d.who || '').split(' ')[0] && Math.abs(f.day - d.day) <= 3));

  const rec = {
    tool: 'pilot-crisis-siege-aftermath-20261019', seed: SEED, daysSimmed: day, endReason,
    raids: raids.length,
    raidLines: raidLines.slice(0, 60),
    defenderFights,
    defenderWounds: defenderWounds.filter(w => /monster|raid/i.test(w.cause)).slice(0, 40),
    allWounds: defenderWounds.length,
    defendedMems,
    defendedCount: defendedMems.length,
    tendedMems: tendedMems.slice(0, 20),
    tendedCount: tendedMems.length,
    crisisFires,
    siegeFires: crisisFires.filter(c => c.kind === 'the-siege').length,
    hungerWinters: crisisFires.filter(c => c.kind === 'hunger-winter').length,
    hungerLines: hungerLines.slice(0, 20),
    defenderDeaths,
    deaths: allDeaths.map(d => ({ day: d.day, who: d.who.split(' ')[0], cause: d.cause, player: d.player })),
    deathCount: allDeaths.length,
    convos: convos.map(c => ({ name: c.name, tag: c.tag, mode: c.mode, day: c.day, turns: c.turns, naturalEnd: c.naturalEnd, transcript: c.transcript })),
    census: { alive: aliveCount(Game), roster: (Game.state.village.roster || []).length },
  };
  E(`--- seed ${SEED}: raids=${raids.length} defenders=${defenderFights.length} wounds=${defenderWounds.length} defendedMems=${defendedMems.length} tended=${tendedMems.length} defenderDeaths=${defenderDeaths.length} sieges=${rec.siegeFires} convos=${convos.length} ---`);
  console.log(JSON.stringify(rec));
})().catch(e => { console.error('FATAL', e); process.exit(1); });
