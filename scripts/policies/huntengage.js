#!/usr/bin/env node
// scripts/policies/huntengage.js — boar/bear engagement observation layer
// for arm sim-huntstaff-b5 (loop B, run fleshout-loop-b-20261018T1530Z).
//
// What it does: read-only observation wraps (zero RNG draws, zero Game
// state writes) that record every villagerHuntResolve call into a caller-
// owned ledger `t`:
//   t.bbEngagements: {day, vid, name, aid, animalName, killed, kcal, source}
//     — one row per resolve whose PICKED PREY was wild_boar or black_bear.
//     aid comes from the return value on a kill (villagerHuntResolve
//     returns {aid, ...} on success); on a stalk-miss the engine returns
//     no aid, so the stalked name is parsed from the miss message
//     ("stalks a <name> all morning"). "Hunted out" resolves pick no prey
//     and are NOT engagements.
//   t.huntWounds: {day, vid, dmg, cause} — hurtVillager calls with cause
//     'hunting' (resolveOneAssignment's injury roll). Feeds the lesson #535
//     wound-chain attribution instrument in the sweep.
//   t.huntResolves / t.huntKcal / t.huntKills: totals for every resolve
//     (continuity with the b2-b4 instrument).
//
// source: 'layer-staffed' when v.assignments[vid].task === 'hunt' at
// resolve time (the HUNTSTAFF layer staffed it); else 'engine-tasklead'
// (the engine's contender-challenge hunt domain, game.js ~6098-6136 —
// resolveOneAssignment(leadVid, {task}) flows through villagerHuntResolve
// exactly like a staffed duty).
//
// Applied ONLY on the armed side (HUNTSTAFF=1). Gate-off: never installed,
// so the det-gate neutrality holds. Policy-side only — no src/js changes.
//
// No empty catch blocks (repo AGENTS.md): every catch reports into
// t.instrumentErrors so the sweep can count them.
'use strict';

const TARGETS = { wild_boar: 'wild_boar', black_bear: 'black_bear' };
const MISS_RE = /stalks a\s+(wild boar|black bear)/i;

function gday(Game) {
  try { return (Game.state && Game.state.scholar && Game.state.scholar.day) || 0; } catch (e) { return 0; }
}

function nameOf(Game, vid) {
  try {
    const p = Game.getPerson ? Game.getPerson(vid) : null;
    if (p && p.name) return String(p.name).split(' ')[0];
  } catch (e) { /* fall through */ }
  return String(vid);
}

function sourceOf(Game, vid) {
  try {
    const v = (Game.state || {}).village || {};
    const a = (v.assignments || {})[vid];
    if (a && a.task === 'hunt') return 'layer-staffed';
  } catch (e) { /* fall through */ }
  return 'engine-tasklead';
}

// stalkedAid(msg): the picked prey when the engine did NOT return aid
// (stalk-miss and hunted-out cases). Returns 'wild_boar' | 'black_bear'
// | null. Pure function — unit-tested in test-huntstaff-b5.js.
function stalkedAid(msg) {
  if (!msg) return null;
  const m = String(msg).match(MISS_RE);
  if (!m) return null;
  const key = m[1].toLowerCase().replace(/ /g, '_');
  return TARGETS[key] || null;
}

// observeGame(Game, t): install the read-only observation wraps.
// t is the caller's ledger; the function mutates ONLY t.
function observeGame(Game, t) {
  if (!Game || !t) return;
  t.bbEngagements = t.bbEngagements || [];
  t.huntWounds = t.huntWounds || [];
  t.instrumentErrors = t.instrumentErrors || 0;

  const oHunt = Game.villagerHuntResolve.bind(Game);
  Game.villagerHuntResolve = function (vid, eff) {
    let r;
    try { r = oHunt.apply(this, arguments); }
    catch (e) { t.instrumentErrors++; throw e; }
    try {
      const day = gday(Game);
      const kcal = (r && typeof r.kcal === 'number') ? r.kcal : 0;
      t.huntResolves = (t.huntResolves || 0) + 1;
      t.huntKcal = (t.huntKcal || 0) + kcal;
      if (kcal > 0) t.huntKills = (t.huntKills || 0) + 1;
      let aid = (r && r.aid) || null;
      if (!aid) aid = stalkedAid(r && r.msg);
      if (aid && TARGETS[aid]) {
        t.bbEngagements.push({
          day, vid, name: nameOf(Game, vid),
          aid, animalName: aid === 'wild_boar' ? 'Wild Boar' : 'Black Bear',
          killed: kcal > 0, kcal,
          source: sourceOf(Game, vid),
        });
      }
    } catch (e) { t.instrumentErrors++; }
    return r;
  };

  const oHurt = Game.hurtVillager ? Game.hurtVillager.bind(Game) : null;
  if (oHurt) {
    Game.hurtVillager = function (vid, dmg, cause) {
      let r;
      try { r = oHurt.apply(this, arguments); }
      catch (e) { t.instrumentErrors++; throw e; }
      try {
        if (String(cause) === 'hunting') {
          t.huntWounds.push({ day: gday(Game), vid, name: nameOf(Game, vid), dmg: dmg | 0 });
        }
      } catch (e) { t.instrumentErrors++; }
      return r;
    };
  }
}

module.exports = { observeGame, stalkedAid, gday };
