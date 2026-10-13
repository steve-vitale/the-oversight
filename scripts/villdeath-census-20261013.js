#!/usr/bin/env node
// scripts/villdeath-census-20261013.js — villager death-cause census instrument
// (flesh-out scale-wall r16, arm C, 2026-10-13).
//
// Answers: which wave kills villagers, where (haven vs wild node), and why
// are they there? For every field fight: monster id/wave/damage, villager
// armed state (weapon bonus + armor P, pre- AND post-gearup — villagers
// re-equip at fight entry via villagerGearUp), HP, node + distance from
// haven, away purpose (expedition vs other), voluntary vs ambushed
// (ambushed = failed the pre-fight awareness check: "walks straight into"),
// player present (same node), contest/arena flag. For every villager death:
// cause, day, linked field fight when present, say-line capture for
// sense-testing.
//
// Pure instrumentation: no game behavior changed. Uses sim-harness
// (loadGame/setupGame/runDays), seeded BEFORE eval, full src/js list.
'use strict';

function dayOf(Game) { try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; } }
function havenOf(Game) {
  try { const v = Game.state.village || {}; return { x: v.px != null ? v.px : 4, y: v.py != null ? v.py : 4 }; } catch (e) { return { x: 4, y: 4 }; }
}
function gearOf(Game, vid) {
  // returns {wb, armorP} — weapon bonus + armor protection, best effort
  const out = { wb: 0, armorP: 0 };
  try {
    const S = (typeof globalThis !== 'undefined' ? globalThis.Scattering : null) || {};
    const person = Game.getPerson ? Game.getPerson(vid) : null;
    if (!person || !S.equipment) return out;
    if (S.equipment.weaponBonusOf) out.wb = S.equipment.weaponBonusOf(person, Game.data.items) || 0;
    if (S.equipment.armorOf) out.armorP = S.equipment.armorOf(person, Game.data.items) || 0;
  } catch (e) {}
  return out;
}
function nodeOf(Game, vid) {
  try { const n = Game.npcNode ? Game.npcNode(vid) : null; return n ? { x: n.nx, y: n.ny } : null; } catch (e) { return null; }
}
function nameOf(Game, vid) {
  try { return Game.displayName ? String(Game.displayName(vid)).slice(0, 40) : String(vid); } catch (e) { return String(vid); }
}

function attachCensus(Game) {
  const m = { fights: [], deaths: [], sayLines: [] };

  // say-line capture for sense-testing (villager death beats, departure beats)
  const origSay = Game.say ? Game.say.bind(Game) : null;
  const SAY_RE = /🕯|didn't come back|torn pack|didn't make it|lost|killed|died|funeral|quieter tonight/i;
  Game.say = function (msg) {
    try {
      const text = String((msg && (msg.text || msg.msg || msg.message)) || msg || '');
      if (text && SAY_RE.test(text) && m.sayLines.length < 400) {
        m.sayLines.push({ day: dayOf(Game), msg: text.slice(0, 320) });
      }
    } catch (e) {}
    if (origSay) { try { return origSay(msg); } catch (e) {} }
    return null;
  };

  // field fights: the fight itself
  const origFF = Game.fieldFight.bind(Game);
  Game.fieldFight = function (vid, mdef, mon, opts) {
    mdef = mdef || {};
    opts = opts || {};
    const d0 = dayOf(Game);
    const pre = gearOf(Game, vid);
    let hp0 = null;
    try { hp0 = ((Game.state.village || {}).health || {})[vid]; } catch (e) {}
    const node = nodeOf(Game, vid);
    const hv = havenOf(Game);
    const dist = node ? Math.abs(node.x - hv.x) + Math.abs(node.y - hv.y) : null;
    let awayPurpose = null;
    try { awayPurpose = (((Game.state.village || {}).away || {})[vid] || {}).purpose || null; } catch (e) {}
    const pn = nodeOf(Game, Game.villagerId);
    const playerAtHaven = !!(pn && pn.x === hv.x && pn.y === hv.y);
    const playerPresent = !!(pn && node && pn.x === node.x && pn.y === node.y);
    let rec = null;
    try { rec = origFF(vid, mdef, mon, opts); } catch (e) { throw e; }
    const post = gearOf(Game, vid);
    const atk = mdef.attack || {};
    const logText = ((rec.log || []).join(' | ')).slice(0, 600);
    m.fights.push({
      day: d0, vid: String(vid), name: nameOf(Game, vid),
      monster: mdef.id || 'unknown', mName: String(mdef.name || mdef.id || '?').slice(0, 60),
      wave: mdef.wave || 1,
      mdmg: (atk.damage && atk.damage.length === 2) ? [atk.damage[0], atk.damage[1]] : null,
      mhp: mdef.hp != null ? mdef.hp : null,
      hp0: hp0, wbPre: pre.wb, wbFight: post.wb, armorP: post.armorP,
      venue: opts.noFlee ? 'contest' : (node && node.x === hv.x && node.y === hv.y ? 'haven' : 'wild'),
      dist: dist, awayPurpose: awayPurpose,
      raid: !!opts.raid, arena: !!opts.noFlee,
      awareness: opts.awareness !== false,
      ambushed: rec.outcome !== 'evade' && opts.awareness !== false && /walks straight into/i.test(logText),
      evaded: rec.outcome === 'evade',
      playerAtHaven: playerAtHaven, playerPresent: playerPresent,
      outcome: rec.outcome, rounds: rec.rounds || 0,
      vTaken: rec.vTaken || 0, mDealt: rec.mDealt || 0,
      minHpFrac: rec.minHpFrac != null ? +rec.minHpFrac.toFixed(3) : null,
      everHopeless: !!rec.everHopeless, fleeHopeless: !!rec.fleeHopeless,
      log: logText.slice(0, 400),
    });
    return rec;
  };

  // every villager death: link to a same-day vDie field fight when present
  const origRD = Game.registerDeath.bind(Game);
  Game.registerDeath = function (ev) {
    ev = ev || {};
    if (ev.kind === 'villager' && ev.villagerId) {
      const d = dayOf(Game);
      const vid = String(ev.villagerId);
      // PLAYER-VESSEL vs NPC is matched post-hoc in finalizeCensus: the
      // mantleOf push (ledger.js) happens AFTER registerDeath, so the
      // handoff list only reads complete at run end.
      const playerVessel = false;
      let fightLink = null;
      for (let i = m.fights.length - 1; i >= 0; i--) {
        const f = m.fights[i];
        if (String(f.vid) === vid && f.outcome === 'vDie' && f.day === d) { fightLink = f; break; }
        if (f.day < d - 2) break;
      }
      m.deaths.push({
        day: d, vid: vid, name: String(ev.name || nameOf(Game, ev.villagerId)).slice(0, 40),
        cause: String(ev.cause || '?').slice(0, 120), killerId: ev.killerId || null,
        node: ev.node || null, playerVessel: playerVessel,
        fight: fightLink ? { monster: fightLink.monster, wave: fightLink.wave,
          venue: fightLink.venue, dist: fightLink.dist, ambushed: fightLink.ambushed,
          rounds: fightLink.rounds, vTaken: fightLink.vTaken, wbFight: fightLink.wbFight,
          armorP: fightLink.armorP, hp0: fightLink.hp0, awayPurpose: fightLink.awayPurpose,
          playerPresent: fightLink.playerPresent } : null,
      });
    }
    return origRD(ev);
  };
  return m;
}

// cause classification for the census
function classifyCause(death) {
  if (death.playerVessel) return 'player-vessel';
  if (death.fight) return 'monster-w' + death.fight.wave;
  const c = (death.cause || '').toLowerCase();
  if (/starv/.test(c)) return 'starvation';
  if (/wound/.test(c)) return 'wound';
  if (/injur/.test(c)) return 'injuries';
  if (/rot|trich|lemons|lockjaw|eurika|east nile|howlbelly|gristlefit|croakbelly|shellgut|witness maw|flockmind|fever|cough|sick/.test(c)) return 'disease';
  if (/contest|arena|gauntlet/.test(c)) return 'contest';
  if (/aid-runner|expedition|frozen|wild/.test(c)) return 'wild-exposure';
  if (/alien/.test(c)) return 'alien';
  return 'other:' + String(death.cause || '?').slice(0, 40);
}

// finalize(Game, m, runResult) -> census row
function finalizeCensus(Game, m, runResult) {
  const deaths = m.deaths.map(d => Object.assign({}, d, { class: classifyCause(d) }));
  // player-vessel detection (post-hoc — mantleOf is written by playerDeath
  // AFTER registerDeath, so only the final list is complete)
  let mantle = [];
  try { mantle = ((Game.state.village || {}).mantleOf || []); } catch (e) {}
  const vesselVids = {};
  for (const x of mantle) vesselVids[String(x.from)] = true;
  for (const d of deaths) {
    if (vesselVids[d.vid]) { d.playerVessel = true; d.class = classifyCause(d); }
  }
  const byClass = {};
  for (const d of deaths) byClass[d.class] = (byClass[d.class] || 0) + 1;
  // NPC exposure stats: player vessels choose their own fights — exclude them
  const npcDeaths = deaths.filter(d => !d.playerVessel);
  const npcByClass = {};
  for (const d of npcDeaths) npcByClass[d.class] = (npcByClass[d.class] || 0) + 1;
  const monsterDeaths = npcDeaths.filter(d => /^monster/.test(d.class));
  const fights = m.fights.filter(f => f.venue !== 'contest'); // wild+field only for exposure stats
  const contactFights = fights.filter(f => !f.evaded);
  return {
    days: runResult ? runResult.days : null, endReason: runResult ? runResult.endReason : null,
    villagerDeaths: deaths.length,
    npcDeaths: npcDeaths.length,
    deathClasses: byClass, npcDeathClasses: npcByClass,
    villMonsterShare: npcDeaths.length ? +(monsterDeaths.length / npcDeaths.length).toFixed(3) : null,
    fieldFights: fights.length, contactFights: contactFights.length,
    vDie: contactFights.filter(f => f.outcome === 'vDie').length,
    vKill: contactFights.filter(f => f.outcome === 'vKill').length,
    deaths: deaths, fights: m.fights, sayLines: m.sayLines,
  };
}

module.exports = { attachCensus, finalizeCensus, classifyCause };
