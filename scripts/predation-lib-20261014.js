// predation-lib-20261014.js — PANTRY-PREDATION diagnostic instrument
// (ARM 3, loop B, 2026-10-14, food-economy axis).
//
// INSTRUMENT ONLY — read-only telemetry wraps around the engine's lingering-
// raider pantry gorge (src/js/havenGrowth.js: havenGrowthDaily → raidPillage,
// the "gorges at the treeline — N kcal gone from the stores. Drive it off,
// or call for help." beat). No game-code changes; every wrap is call-through
// with before/after observation. Byte-identicality is proven by
// scripts/test-predation-instrument-20261014.js (PART C).
//
// Usage:
//   const { installPredation } = require('./predation-lib-20261014');
//   const track = installPredation(Game);     // before runDays
//   ... runDays(Game, policy, opts) ...
//   const analysis = finalizePredation(Game, track); // episodes + stats
'use strict';

function pantryKcal(Game) {
  try {
    return ((Game.state.village || {}).pantry || [])
      .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0);
  } catch (e) { return 0; }
}
function gday(Game) {
  try { return (Game.state.scholar || {}).day || 0; } catch (e) { return 0; }
}
function waveOf(Game, mid) {
  try {
    const mdef = (Game.data.monsters || []).find(x => x.id === mid) || {};
    return mdef.wave || 1;
  } catch (e) { return 1; }
}
// Stable identity for a world-monster entry across daily snapshots. m.key
// exists on most world monsters (combat refers to m.key || 'm0'); fall back
// to id + tile.
function mkey(m) {
  try {
    if (m && m.key) return String(m.key);
    return String((m && m.id) || '?') + '@' + ((m && m.tx) ?? '?') + ',' + ((m && m.ty) ?? '?');
  } catch (e) { return '?'; }
}
function lingeringList(Game) {
  const out = [];
  try {
    for (const m of (Game.worldMonsters ? Game.worldMonsters() : [])) {
      if (m && m.lingering && (m.hp || 0) > 0) {
        out.push({ key: mkey(m), id: m.id, hp: Math.round(m.hp || 0), wave: waveOf(Game, m.id) });
      }
    }
  } catch (e) {}
  return out;
}

function installPredation(Game) {
  const track = {
    gorgeNights: [],   // {day, events:[{key,id,wave,asked,got}], totalGorged, pantryBefore, pantryAfter}
    sayBeats: [],       // {day, kind, text}
    aidResolutions: [], // {day, type} — resolveAidCrisis calls
    fieldFights: [],    // {day, vid, isScholar, monsterId, wasLingering, hpBefore, outcome, monsterDead}
    scholarEngages: [], // {day, monsterId, wasLingering} — startCombat wraps
    helpCalls: [],      // {day, tier} — callForHelp wraps
    removals: [],       // {day, key, id, hp, wasLingering} — removeWorldMonster wraps
                        // (hp>0 at removal = fight start, NOT a kill: startCombat
                        // pulls the world entry "into the fight" with full hp)
    tbOutcomes: [],     // {day, result, monsters:[{id, dead, hp}]} — tbEnd wraps
    samples: [],        // {day, pantry, lingering:[{key,id,hp,wave}]}
    instrErrors: [],
  };
  const note = (where, e) => { track.instrErrors.push(where + ': ' + (e && e.message)); };

  // --- say: capture the gorge beats verbatim (sense-test evidence) ---
  try {
    const origSay = Game.say.bind(Game);
    Game.say = function (msg) {
      try {
        const s = String(msg || '');
        if (/gorges at the treeline|still out there at the treeline|Drive it off/i.test(s)) {
          track.sayBeats.push({ day: gday(this), text: s.slice(0, 420) });
        }
      } catch (e) { note('say', e); }
      return origSay(msg);
    };
  } catch (e) { note('wrapSay', e); }

  // --- havenGrowthDaily + raidPillage: pair gorge events in call order ---
  let inGorge = false;
  let preList = null;
  let pillageEvents = [];
  let pantryPre = 0;
  try {
    const origRaid = Game.raidPillage.bind(Game);
    Game.raidPillage = function (v, kcal) {
      const wasIn = inGorge;
      let pb = 0, got = 0;
      try { if (wasIn) pb = pantryKcal(this); } catch (e) {}
      got = origRaid(v, kcal);
      try {
        if (wasIn) pillageEvents.push({ asked: Math.round(kcal || 0), got: Math.round(got || 0), pantryBefore: pb });
      } catch (e) { note('raidPillage', e); }
      return got;
    };
  } catch (e) { note('wrapRaidPillage', e); }

  try {
    const origHGD = Game.havenGrowthDaily.bind(Game);
    Game.havenGrowthDaily = function () {
      try { preList = lingeringList(this); } catch (e) { preList = []; }
      try { pantryPre = pantryKcal(this); } catch (e) { pantryPre = 0; }
      pillageEvents = [];
      inGorge = true;
      let ret;
      try { ret = origHGD(); } finally { inGorge = false; }
      try {
        if (pillageEvents.length) {
          const events = pillageEvents.map((pe, i) => {
            const mon = (preList || [])[i] || {};
            return { key: mon.key || null, id: mon.id || null, wave: mon.wave || null,
                     asked: pe.asked, got: pe.got };
          });
          track.gorgeNights.push({
            day: gday(this),
            events,
            totalGorged: events.reduce((t, e2) => t + (e2.got || 0), 0),
            pantryBefore: pantryPre,
            pantryAfter: pantryKcal(this),
          });
        }
      } catch (e) { note('havenGrowthDaily', e); }
      return ret;
    };
  } catch (e) { note('wrapHGD', e); }

  // --- resolveAidCrisis: how the crisis ended (fought / moved-on) ---
  try {
    if (typeof Game.resolveAidCrisis === 'function') {
      const origAid = Game.resolveAidCrisis.bind(Game);
      Game.resolveAidCrisis = function (type) {
        try { track.aidResolutions.push({ day: gday(this), type: String(type || '') }); } catch (e) {}
        return origAid(type);
      };
    }
  } catch (e) { note('wrapAid', e); }

  // --- resolveWildMonsterEncounter: villager (or scholar) fights a lingering raider ---
  try {
    const origRWME = Game.resolveWildMonsterEncounter.bind(Game);
    Game.resolveWildMonsterEncounter = function (vid, m, opts) {
      let rec = null;
      try {
        const lm = lingeringList(this).map(x => x.key);
        rec = { day: gday(this), vid: String(vid || '').slice(0, 24),
                isScholar: (vid === this.villagerId),
                monsterId: m && m.id, monsterKey: mkey(m),
                wasLingering: lm.indexOf(mkey(m)) >= 0,
                hpBefore: Math.round((m && m.hp) || 0) };
      } catch (e) { note('rwme-pre', e); }
      const ret = origRWME(vid, m, opts);
      try {
        if (rec) {
          rec.hpAfter = Math.round((m && m.hp) || 0);
          let wm = null;
          try { wm = (this.worldMonsters ? this.worldMonsters() : []).find(x => mkey(x) === rec.monsterKey); } catch (e2) {}
          rec.monsterDead = !wm || (wm.hp || 0) <= 0;
          track.fieldFights.push(rec);
        }
      } catch (e) { note('rwme-post', e); }
      return ret;
    };
  } catch (e) { note('wrapRWME', e); }

  // --- startCombat: scholar engaging a lingering monster ---
  // NOTE: world monsters are REMOVED from the world list at fight start
  // (game.js: "it's in the fight now, not wandering") with FULL hp — so a
  // removal with hp>0 is a fight start, not a kill. Kills are read from the
  // tbEnd wrap below.
  track.startCombatCalls = []; // every startCombat invocation (diagnostic completeness)
  try {
    const origSC = Game.startCombat.bind(Game);
    Game.startCombat = function (monsterId) {
      try {
        // pendingMonsterId fallback: some callers startCombat() with no id
        // (the engine resolves pendingMonsterId internally).
        let effId = monsterId;
        try { if (!effId) effId = this.pendingMonsterId; } catch (e2) {}
        let found = null;
        try { found = (this.worldMonsters ? this.worldMonsters() : []).find(x => x.id === effId); } catch (e3) {}
        track.startCombatCalls.push({ day: gday(this), argId: monsterId || null,
          effId: effId || null, foundLingering: found ? !!found.lingering : null });
        if (found) {
          track.scholarEngages.push({ day: gday(this), monsterId: effId,
            wasLingering: !!found.lingering, outcome: null });
        }
      } catch (e) { note('startCombat', e); }
      return origSC(monsterId);
    };
  } catch (e) { note('wrapSC', e); }

  // --- tbEnd: the fight's outcome, linked back to lingering engages ---
  try {
    const origTbEnd = Game.tbEnd.bind(Game);
    Game.tbEnd = function (result) {
      try {
        const f = this.tbfight;
        if (f && !f.over && f.fighters) {
          const mons = f.fighters.filter(x => x && x.kind === 'monster');
          if (mons.length) {
            const rec = {
              day: gday(this), result: String(result || ''),
              monsters: mons.map(mo => ({
                id: (mo.mdef && mo.mdef.id) || mo.monsterId || null,
                dead: !mo.alive, hp: Math.round(mo.hp || 0),
              })),
            };
            // Link each dead/won monster back to the latest unmatched
            // lingering engage of the same id.
            for (const mo of rec.monsters) {
              for (let i = track.scholarEngages.length - 1; i >= 0; i--) {
                const eg = track.scholarEngages[i];
                if (eg.monsterId === mo.id && eg.wasLingering && !eg.outcome) {
                  eg.outcome = mo.dead ? 'killed' : ('fight-' + rec.result);
                  break;
                }
              }
            }
            track.tbOutcomes.push(rec);
          }
        }
      } catch (e) { note('tbEnd', e); }
      return origTbEnd(result);
    };
  } catch (e) { note('wrapTbEnd', e); }

  // --- callForHelp: does any policy ever answer the beat's second clause? ---
  try {
    if (typeof Game.callForHelp === 'function') {
      const origCFH = Game.callForHelp.bind(Game);
      Game.callForHelp = function (tier, opts) {
        try { track.helpCalls.push({ day: gday(this), tier: String(tier || '') }); } catch (e) {}
        return origCFH(tier, opts);
      };
    }
  } catch (e) { note('wrapCFH', e); }

  track.sampleDay = function () {
    try {
      track.samples.push({ day: gday(Game), pantry: pantryKcal(Game), lingering: lingeringList(Game) });
    } catch (e) { note('sampleDay', e); }
  };

  // --- removeWorldMonster: the hp AT removal (kills land between samples) ---
  try {
    const origRWM = Game.removeWorldMonster.bind(Game);
    Game.removeWorldMonster = function (m) {
      try {
        track.removals.push({ day: gday(this), key: mkey(m), id: m && m.id,
          hp: Math.round((m && m.hp) || 0), wasLingering: !!(m && m.lingering) });
      } catch (e) { note('removeWorldMonster', e); }
      return origRWM(m);
    };
  } catch (e) { note('wrapRWM', e); }

  return track;
}

// finalizePredation(Game, track) — reconstruct lingering episodes from the
// daily samples and classify each episode's resolution:
//   killed      — disappeared from worldMonsters with last hp <= 0
//   moved-on    — lingering cleared with hp > 0 (crisis drifted / resolved)
//   lingering-at-end — still lingering when the run ended
// Drive-off attribution for kills: a fieldFights/scholarEngages record on a
// lingering monster within ±1 day of the disappearance.
function finalizePredation(Game, track) {
  const errors = track.instrErrors.slice();
  const samples = (track.samples || []).slice().sort((a, b) => a.day - b.day);
  const byKey = new Map(); // key -> {id, wave, firstDay, lastDay, lastHp, gorgeNights, gorgeKcal}
  for (const s of samples) {
    for (const L of (s.lingering || [])) {
      if (!byKey.has(L.key)) {
        byKey.set(L.key, { key: L.key, id: L.id, wave: L.wave,
          firstDay: s.day, lastDay: s.day, lastHp: L.hp,
          gorgeNights: 0, gorgeKcal: 0 });
      } else {
        const ep = byKey.get(L.key);
        ep.lastDay = s.day; ep.lastHp = L.hp;
      }
    }
  }
  // Gorge nights attributed to lingering entries present that day. The gorge
  // loop re-pins monsters to the haven tile each dawn; a gorge event on day D
  // attributes to the lingering monster(s) present in the day-D sample.
  for (const gn of (track.gorgeNights || [])) {
    for (const ev of (gn.events || [])) {
      const s = samples.find(x => x.day === gn.day);
      const cands = s ? (s.lingering || []) : [];
      const hit = ev.key && byKey.has(ev.key) ? byKey.get(ev.key)
        : (cands.length === 1 ? byKey.get(cands[0].key) : null);
      if (hit && hit.firstDay <= gn.day && hit.lastDay >= gn.day) {
        hit.gorgeNights += 1; hit.gorgeKcal += ev.got || 0;
      }
    }
  }
  const runEndDay = samples.length ? samples[samples.length - 1].day : 0;
  const finalKeys = new Set();
  try {
    for (const L of ((samples[samples.length - 1] || {}).lingering || [])) finalKeys.add(L.key);
  } catch (e) {}

  // Drive-off records, normalized: one row per lingering-monster engagement.
  //   scholar: engage (wasLingering) + tbEnd outcome → killed-by-scholar |
  //            scholar-failed (fled/lost/routed) | engaged-unknown
  //   villager: fieldFight (wasLingering, monsterDead) → killed-by-villager
  const driveOffs = [];
  for (const eg of (track.scholarEngages || [])) {
    if (!eg.wasLingering) continue;
    driveOffs.push({ day: eg.day, id: eg.monsterId, by: 'scholar',
      outcome: eg.outcome === 'killed' ? 'killed-by-scholar'
        : (eg.outcome ? 'scholar-failed' : 'engaged-unknown'),
      rawOutcome: eg.outcome || null });
  }
  for (const ff of (track.fieldFights || [])) {
    if (!ff.wasLingering) continue;
    driveOffs.push({ day: ff.day, id: ff.monsterId,
      by: ff.isScholar ? 'scholar' : ('villager:' + ff.vid),
      outcome: ff.monsterDead
        ? (ff.isScholar ? 'killed-by-scholar' : 'killed-by-villager')
        : 'villager-failed',
      rawOutcome: null });
  }

  const killRecs = driveOffs.filter(d =>
    d.outcome === 'killed-by-scholar' || d.outcome === 'killed-by-villager');
  const episodes = [];
  for (const ep of byKey.values()) {
    const stillAtEnd = finalKeys.has(ep.key);
    // The hp at actual removal beats the last sample's hp — kills happen
    // between daily samples. But: startCombat REMOVES the world entry at
    // fight start with full hp ("it's in the fight now, not wandering") —
    // so removal-hp only counts when no scholar engage claims the monster.
    let endHp = ep.lastHp;
    let engagedByScholar = false;
    try {
      const eng = (track.scholarEngages || []).find(x =>
        x.wasLingering && x.monsterId === ep.id &&
        x.day >= ep.firstDay && x.day <= ep.lastDay + 1);
      engagedByScholar = !!eng;
      if (!engagedByScholar) {
        const rems = (track.removals || []).filter(r => r.key === ep.key);
        if (rems.length) endHp = rems[rems.length - 1].hp;
      }
    } catch (e) {}
    let resolution = 'moved-on', killer = null;
    if (stillAtEnd) { resolution = 'lingering-at-end'; }
    else {
      const kr = killRecs.find(k => k.id === ep.id &&
        k.day >= ep.firstDay && k.day <= ep.lastDay + 1);
      if (kr) { resolution = 'killed'; killer = kr.by; }
      else if ((endHp || 0) <= 0 && !engagedByScholar) { resolution = 'killed'; killer = 'unknown'; }
    }
    episodes.push(Object.assign({}, ep, { resolution, killer }));
  }
  // Synthetic sub-day episodes: drive-off records (engage/kill) for a
  // lingering monster that never appeared in any daily sample — the raid-
  // at-night / driven-off-next-morning pattern. Without these the drive-off
  // success story is invisible.
  const synthSeen = new Set();
  for (const d of driveOffs) {
    const covered = episodes.some(e => e.id === d.id &&
      e.firstDay <= d.day && e.lastDay >= d.day);
    if (covered) continue;
    const sk = d.id + '@d' + d.day + ':' + d.by;
    if (synthSeen.has(sk)) continue;
    synthSeen.add(sk);
    const killed = d.outcome === 'killed-by-scholar' || d.outcome === 'killed-by-villager';
    episodes.push({ key: sk, id: d.id, wave: waveOf(Game, d.id),
      firstDay: d.day, lastDay: d.day, lastHp: null,
      gorgeNights: 0, gorgeKcal: 0,
      resolution: killed ? 'killed' : (d.outcome === 'scholar-failed' || d.outcome === 'villager-failed' ? 'drive-failed' : 'moved-on'),
      killer: killed ? d.by : null, subDay: true });
  }
  episodes.sort((a, b) => a.firstDay - b.firstDay);

  const gns = track.gorgeNights || [];
  const totalGorged = gns.reduce((t, g) => t + (g.totalGorged || 0), 0);
  const w5Gorged = gns.reduce((t, g) => t + (g.events || [])
    .filter(e2 => (e2.wave || 1) >= 5).reduce((x, e2) => x + (e2.got || 0), 0), 0);
  const totalEvents = gns.reduce((t, g) => t + (g.events || []).length, 0);

  // Pantry trajectory around the first gorge night: pantry before the first
  // gorge vs 3 days later (the s88 hollow pattern: gorge → 0 → scatter).
  return {
    episodes,
    driveOffs,
    gorgeNights: gns.length,
    totalEvents,
    totalGorged,
    w5Gorged,
    meanPerEvent: totalEvents ? +(totalGorged / totalEvents).toFixed(0) : 0,
    meanPerNight: gns.length ? +(totalGorged / gns.length).toFixed(0) : 0,
    sayBeats: track.sayBeats,
    aidResolutions: track.aidResolutions,
    fieldFights: track.fieldFights,
    scholarEngages: track.scholarEngages,
    tbOutcomes: track.tbOutcomes,
    helpCalls: track.helpCalls,
    removals: track.removals,
    samples,
    instrErrors: errors,
    rawGorgeNights: gns,
  };
}

module.exports = { installPredation, finalizePredation, pantryKcal, gday };
