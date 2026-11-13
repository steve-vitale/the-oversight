// scholarschurn-instrument-20261112.js — scholar churn in the wild,
// diagnostic census (arm sim-scholarschurn-b, run
// fleshout-loop-b-20261112T2130Z). Scripts only, zero src/js.
//
// The question (pairarming §8, tracker blank #6): three scholars die
// in 19 days on seed 190398, all "the wild", and the third death ends
// the wave-5 pair because the dead scholar was a veteran. How bad is
// scholar churn across the band, where does it happen, and what does
// each succession cost?
//
// Ground truth (pre-registered in sim-scholarschurn-b-prereg.md): the
// harness samples.deaths player:true rows OVERCOUNT scholar deaths
// (91 vs 66 by the prev-day regDeath rule on the pairarming corpus —
// the tele live-capture double-fires per death), and the same-day
// snapshot rule UNDERCOUNTS (24 — succession happens before the
// daily snapshot). So this instrument wraps Game.playerDeath
// DIRECTLY: the pre-hook records the scholar id, cause, and location
// AT THE CALL, before succession; the post-hook records the successor.
// Cross-checked against vetfirst regDeath rows (same day, same
// villagerId). A wrap record with no regDeath match (or vice versa)
// is an instrument error, never silently dropped.
//
// What this records:
//   (1) SCHOLAR DEATHS (playerDeath wrap): day, cause arg, dead
//       scholar id/name, location at death (insideHaven / insideTent
//       / camp / mx,my), hp, abilities, veteranW4 (wave-4+ kill in
//       the log), pellet bearer, reactor bearer, inventory/equipped
//       ids, trust; post: successor id/name/trust/was-veteran/
//       abilities, over/villageLost. Cause class + location class
//       are derived by classifyScholarDeath (pure, tested).
//   (2) DAILY SCHOLAR SNAPSHOT: PA.gearSnapshot (armed/armored/
//       veterans/ready5/capped standing/peak wave, engine
//       cross-checked) PLUS scholar abilities, insideHaven,
//       insideTent, camp, pellet/reactor bearer flags.
//   (3) SUCCESSION DIFF (diffScholarDays): scholarId changes across
//       consecutive snapshots, matched against the CHAIN of wrap
//       records in the interval between the snapshots (same-day
//       cascades and sleep-boundary deaths both shift the match); a
//       change no chain explains is an instrument error.
//   (4) HELPERS for the analyzer: firstWaveKillDay, findHoldStranding.
//
// All reads are record-only: no RNG consumed, no state mutated.
// Any failure in the RECORDING path is logged to instrumentErrors,
// never thrown into the game.
//
// Usage (driver): const SC = require('./scholarschurn-instrument-20261112');
//   const sc = SC.install(Game);
//   sc.snapshot(deathsToday); // once per day, after the vetfirst snapshot
//   ... sc.uninstall();
'use strict';

const PA = require('./pairarming-instrument-20261112');

const PELLET_ID = 'fusion_pellet';
const REACTOR_ID = 'fusion_reactor';

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function personName(Game, vid) {
  try {
    if (typeof Game.getPerson === 'function') {
      const p = Game.getPerson(vid);
      if (p) return p.name || p.displayName || vid;
    }
  } catch (e) {}
  try {
    const v = ((Game.data || {}).villagers || []).find(function (x) { return x && x.id === vid; });
    if (v) return v.name || vid;
  } catch (e) {}
  return vid;
}

function abilityIdsOf(abilities) {
  const out = [];
  for (const a of (abilities || [])) {
    const id = (a && typeof a === 'object') ? (a.id || null) : (typeof a === 'string' ? a : null);
    if (id) out.push(id);
  }
  return out;
}

function itemIdsOf(items) {
  const out = [];
  for (const e of (items || [])) {
    if (!e) continue;
    const id = (typeof e === 'string') ? e : (e.itemId || e.id || null);
    if (id) out.push(id);
  }
  return out;
}

// causeClass(cause): the cause string is label-only (game.js:47229 —
// 'the wild' labels a proven wild fight, 'the arena' an arena loss),
// so the census cross-tabs cause class against the LOCATION read at
// the death call instead of trusting either alone.
function causeClass(cause) {
  const c = String(cause || '').toLowerCase();
  if (!c) return 'other';
  if (c === 'the wild') return 'wild-fight';
  if (c.indexOf('arena') >= 0) return 'arena';
  if (c.indexOf('contest') >= 0) return 'contest';
  if (c.indexOf('expedition') >= 0) return 'expedition';
  if (c.indexOf('stranger') >= 0 || c.indexOf('spool') >= 0 || c.indexOf('big-eyes') >= 0 ||
      c.indexOf('alien') >= 0 || c.indexOf('monster') >= 0 || c.indexOf('combat') >= 0 ||
      c.indexOf('ambush') >= 0 || c.indexOf('pit trap') >= 0 || c.indexOf('phoenix') >= 0) return 'fight';
  if (c.indexOf('starvation') >= 0 || c.indexOf('disease') >= 0 || c.indexOf('injur') >= 0 ||
      c.indexOf('wound') >= 0 || c.indexOf('night') >= 0 || c.indexOf('thirst') >= 0 ||
      c.indexOf('hunger') >= 0) return 'exposure';
  return 'other';
}

// locationClass(rec): HOME = inside Haven at the death call; CAMP =
// in a tent / camp out in the world; WILD = anywhere else out.
// The census's primary split is wild (!insideHaven) vs home.
function locationClass(rec) {
  if (!rec) return 'unknown';
  if (rec.insideHaven) return 'home';
  if (rec.insideTent || rec.hasCamp) return 'camp';
  return 'wild';
}

function isVeteranW4(Game, vid) {
  try {
    const log = ((Game.state && Game.state.waveKillLog) || []);
    for (const e of log) if (e && e.by === vid && ((e.w | 0) >= 4)) return true;
  } catch (e) {}
  return false;
}

function install(Game) {
  const t = {
    scholarDeaths: [], // playerDeath wrap records {day, cause, ...}
    scholarDaily: [],  // daily scholar snapshots
    scholarDiffs: [],  // succession diffs between consecutive snapshots
    instrumentErrors: [],
    wrapLive: {},
  };
  const wrapped = {};
  let prevSnap = null;

  function err(site, e) {
    try { t.instrumentErrors.push(site + ': ' + String((e && e.message) || e).slice(0, 120)); } catch (e2) {}
  }

  // Wrap Game.playerDeath — the choke point for every player death
  // (ledger.js). Pre-hook reads the DYING scholar before succession;
  // post-hook reads the SUCCESSOR after the mantle passes.
  try {
    const orig = Game.playerDeath;
    if (typeof orig !== 'function') { t.instrumentErrors.push('playerDeath-missing: not a function'); }
    else {
      wrapped.playerDeath = orig;
      const selfGame = Game;
      Game.playerDeath = function () {
        const args = Array.prototype.slice.call(arguments);
        const causeArg = (args.length && typeof args[0] === 'string') ? args[0] : null;
        let pre = null;
        try {
          const s = (selfGame.state && selfGame.state.scholar) || {};
          const v = (selfGame.state && selfGame.state.village) || {};
          const oldId = selfGame.villagerId || null;
          const invIds = itemIdsOf(s.inventory);
          const eqIds = [];
          try {
            const eq = s.equipped || {};
            for (const k of Object.keys(eq)) {
              const e = eq[k];
              if (!e) continue;
              const id = (typeof e === 'string') ? e : (e.itemId || e.id);
              if (id) eqIds.push(id);
            }
          } catch (e2) {}
          pre = {
            day: dayOf(selfGame), cause: causeArg,
            scholarId: oldId, scholarName: personName(selfGame, oldId),
            insideHaven: !!s.insideHaven, insideTent: !!s.insideTent,
            hasCamp: !!(selfGame.state && selfGame.state.camp),
            mx: (typeof s.mx === 'number') ? s.mx : null,
            my: (typeof s.my === 'number') ? s.my : null,
            hp: (typeof s.health === 'number') ? s.health : null,
            abilityIds: abilityIdsOf(s.abilities),
            veteranW4: isVeteranW4(selfGame, oldId),
            pelletBearer: invIds.indexOf(PELLET_ID) >= 0 || eqIds.indexOf(PELLET_ID) >= 0,
            reactorBearer: abilityIdsOf(s.abilities).indexOf(REACTOR_ID) >= 0,
            inventoryItemIds: invIds, equippedItemIds: eqIds,
            trust: (v.trust && oldId) ? ((v.trust[oldId] | 0) || 0) : null,
          };
        } catch (e) { err('playerDeath-pre', e); }
        let r, threw = null;
        try { r = orig.apply(selfGame, args); } catch (e) { threw = e; }
        try {
          t.wrapLive.playerDeath = true;
          const s2 = (selfGame.state && selfGame.state.scholar) || {};
          const v2 = (selfGame.state && selfGame.state.village) || {};
          const newId = selfGame.villagerId || null;
          const rec = Object.assign({}, pre || { day: dayOf(selfGame), cause: causeArg });
          rec.causeClass = causeClass(rec.cause);
          rec.location = locationClass(rec);
          rec.threw = !!threw;
          rec.over = !!selfGame.over;
          rec.villageLost = !!selfGame.villageLost;
          if (rec.over && rec.villageLost) {
            rec.successorId = null; rec.successorName = null;
          } else {
            rec.successorId = newId;
            rec.successorName = personName(selfGame, newId);
            try { rec.successorTrust = (v2.trust && newId) ? ((v2.trust[newId] | 0) || 0) : null; } catch (e) { rec.successorTrust = null; }
            try { rec.successorWasVeteran = isVeteranW4(selfGame, newId); } catch (e) { rec.successorWasVeteran = null; }
            try { rec.successorAbilityIds = abilityIdsOf(s2.abilities); } catch (e) { rec.successorAbilityIds = null; }
            try { rec.successorHp = (typeof s2.health === 'number') ? s2.health : null; } catch (e) { rec.successorHp = null; }
          }
          t.scholarDeaths.push(rec);
        } catch (e) { err('playerDeath-record', e); }
        if (threw) throw threw;
        return r;
      };
    }
  } catch (e) { err('playerDeath-wrap', e); }

  // scholarSnapshot(deathsToday): PA gear snapshot + scholar fields.
  // deathsToday is the array of villagerIds with a registerDeath row
  // on this day (from the vetfirst instrument's regDeaths).
  function snapshot(deathsToday) {
    try {
      const gear = PA.gearSnapshot(Game, prevSnap ? prevSnap.gear : null, deathsToday);
      const snap = { day: dayOf(Game), instrumentErrors: [] };
      const s = (Game.state && Game.state.scholar) || {};
      snap.scholarId = Game.villagerId || null;
      try { snap.scholarName = personName(Game, snap.scholarId); } catch (e) { snap.scholarName = snap.scholarId; }
      try { snap.abilityIds = abilityIdsOf(s.abilities); } catch (e) { snap.abilityIds = []; }
      snap.abilityCount = snap.abilityIds.length;
      try { snap.hp = (typeof s.health === 'number') ? s.health : null; } catch (e) { snap.hp = null; }
      try { snap.insideHaven = !!s.insideHaven; } catch (e) { snap.insideHaven = null; }
      try { snap.insideTent = !!s.insideTent; } catch (e) { snap.insideTent = null; }
      try { snap.hasCamp = !!(Game.state && Game.state.camp); } catch (e) { snap.hasCamp = null; }
      try {
        const invIds = itemIdsOf(s.inventory);
        snap.pelletBearer = invIds.indexOf(PELLET_ID) >= 0;
        snap.reactorBearer = snap.abilityIds.indexOf(REACTOR_ID) >= 0;
      } catch (e) { snap.pelletBearer = null; snap.reactorBearer = null; }
      snap.gear = gear;
      // Scholar member row from the gear snapshot (armed/armorP/veteran).
      try {
        const m = (gear.members || []).filter(function (x) { return x && x.isScholar; })[0] || null;
        snap.scholarArmed = m ? !!m.armed : null;
        snap.scholarArmorP = m ? m.armorP : null;
        snap.scholarVeteranW4 = m ? !!m.veteranW4 : null;
      } catch (e) { snap.scholarArmed = null; snap.scholarArmorP = null; snap.scholarVeteranW4 = null; }
      if (gear && gear.instrumentErrors && gear.instrumentErrors.length) {
        for (const m of gear.instrumentErrors) t.instrumentErrors.push('gear-snap d' + snap.day + ': ' + m);
      }
      if (prevSnap) {
        try {
          const diff = diffScholarDays(prevSnap, snap, t.scholarDeaths);
          if (diff && diff.instrumentErrors && diff.instrumentErrors.length) {
            for (const m of diff.instrumentErrors) t.instrumentErrors.push('scholar-diff d' + snap.day + ': ' + m);
          }
          t.scholarDiffs.push(diff);
        } catch (e) { err('scholar-diff d' + snap.day, e); }
      }
      t.scholarDaily.push(snap);
      prevSnap = snap;
    } catch (e) { err('scholar-snapshot', e); }
  }

  function uninstall() {
    try { if (wrapped.playerDeath) Game.playerDeath = wrapped.playerDeath; } catch (e) { err('uninstall-playerDeath', e); }
  }

  return { t: t, snapshot: snapshot, uninstall: uninstall };
}

// diffScholarDays(prev, cur): succession detection across two
// consecutive scholar snapshots. A scholarId change MUST be explained
// by the playerDeath wrap records — but the explanation is a CHAIN,
// not a single record, and the snapshot may be taken mid-cascade:
//
//   * Same-day cascades (190393 d61: SEVEN scholars die in one day):
//     the snapshot is taken once per day, mid-day, so it can show an
//     INTERMEDIATE bearer (d61 shows Tikhon, the 3rd of 7 deaths) or
//     the terminal one. The diff follows the chain — each record's
//     scholarId must equal the previous record's successorId — from
//     prev.scholarId until the holder equals cur.scholarId.
//   * Sleep boundary (190397 d28->d29: Ella dies after the d28
//     snapshot, during sleep): the wrap record carries the death day
//     (d28) while the snapshot transition appears a day later (d29).
//     Records are therefore accepted with day in [prev.day, cur.day],
//     the whole interval between the two snapshots.
//   * A scholar dies once: the same scholarId twice in the window is
//     still a double-fire error, and a chain that dead-ends at a
//     holder the snapshot does not show is still a mismatch.
//   * The chain is anchored on scholarId, not on the day: a record
//     for prev.scholarId can only be that scholar's one death, so the
//     window is a sanity bound, not the match key.
function diffScholarDays(prev, cur, scholarDeaths) {
  const out = {
    day: cur.day, prevDay: prev.day,
    succession: null, instrumentErrors: [],
  };
  try {
    if (prev.scholarId && cur.scholarId && prev.scholarId !== cur.scholarId) {
      const fromWasVeteran = !!prev.scholarVeteranW4;
      out.succession = {
        day: cur.day, fromId: prev.scholarId, fromName: prev.scholarName || prev.scholarId,
        toId: cur.scholarId, toName: cur.scholarName || cur.scholarId,
        fromWasVeteran: fromWasVeteran,
        fromAbilityCount: prev.abilityCount | 0,
        toAbilityCount: cur.abilityCount | 0,
        toArmed: cur.scholarArmed, toArmorP: cur.scholarArmorP,
        toHp: cur.hp,
        cascadeSize: null, intermediateIds: [],
      };
      // Match against the wrap records when supplied: follow the chain
      // of same-window records from the outgoing id to the snapshot id.
      if (Array.isArray(scholarDeaths)) {
        const byScholar = {};
        for (const r of scholarDeaths) {
          if (!r || r.scholarId == null) continue;
          if ((r.day | 0) < (prev.day | 0) || (r.day | 0) > (cur.day | 0)) continue;
          if (byScholar[r.scholarId]) {
            out.instrumentErrors.push('succession-double-death-record: ' + r.scholarId + ' recorded twice in d' + prev.day + '-d' + cur.day);
          } else byScholar[r.scholarId] = r;
        }
        const chain = [];
        const seenHolders = {};
        let holder = prev.scholarId;
        let deadEnd = null;
        while (holder && holder !== cur.scholarId) {
          if (seenHolders[holder]) {
            out.instrumentErrors.push('succession-cycle: ' + holder + ' repeats in the chain on d' + cur.day);
            deadEnd = holder;
            break;
          }
          seenHolders[holder] = true;
          const rec = byScholar[holder];
          if (!rec) { deadEnd = holder; break; }
          chain.push(rec);
          holder = rec.successorId || null;
          if (!holder) { deadEnd = null; break; }
        }
        if (holder === cur.scholarId) {
          out.succession.cascadeSize = chain.length;
          out.succession.intermediateIds = chain.slice(0, -1).map(function (r) { return r.successorId; });
        } else if (deadEnd === prev.scholarId) {
          out.instrumentErrors.push('succession-without-death-record: ' + prev.scholarId + ' -> ' + cur.scholarId + ' on d' + cur.day);
        } else if (deadEnd != null) {
          if (chain.length === 1) {
            out.instrumentErrors.push('succession-mismatch: wrap names ' + chain[0].successorId + ' but snapshot shows ' + cur.scholarId + ' on d' + cur.day);
          } else {
            out.instrumentErrors.push('succession-mismatch: chain ends at ' + deadEnd + ' after ' + chain.length + ' deaths but snapshot shows ' + cur.scholarId + ' on d' + cur.day);
          }
        } else if (holder === null) {
          out.instrumentErrors.push('succession-mismatch: chain ends at a village-lost record but snapshot shows ' + cur.scholarId + ' on d' + cur.day);
        }
      }
    }
  } catch (e) {
    try { out.instrumentErrors.push('diff: ' + String((e && e.message) || e).slice(0, 120)); } catch (e2) {}
  }
  return out;
}

// firstWaveKillDay(waveKillLog, vid, fromDay): first day >= fromDay
// the villager recorded a wave kill (any wave), or null.
function firstWaveKillDay(waveKillLog, vid, fromDay) {
  let best = null;
  for (const e of (waveKillLog || [])) {
    if (!e || e.by !== vid) continue;
    const d = (e.d | 0) || 0;
    if (d < (fromDay | 0)) continue;
    if (best === null || d < best) best = d;
  }
  return best;
}

// findHoldStranding(gearDaily, scholarDeaths): for each scholar death,
// was that day a pair-hold / deferral-hold day, was the dead scholar a
// veteran, and did the pair end (veterans < 2) within 7 days after?
// gearDaily is the PA gear snapshot array (same shape as pairarming).
function findHoldStranding(gearDaily, scholarDeaths) {
  const holds = PA.findHoldBlocks(gearDaily || []);
  const perDay = {};
  for (const p of (holds.perDay || [])) perDay[p.day] = p;
  const rows = [];
  for (const r of (scholarDeaths || [])) {
    const h = perDay[r.day] || null;
    let pairEndsWithin7 = null, pairEndDay = null;
    if (h && h.pairHold) {
      for (let d = r.day + 1; d <= r.day + 7; d++) {
        const p = perDay[d];
        if (!p) continue;
        if (!p.pairHold) { pairEndsWithin7 = true; pairEndDay = d; break; }
      }
      if (pairEndsWithin7 === null) {
        // Pair still holding 7 days out (or the run ended): only a
        // definite end counts as ended; check whether later days exist.
        const later = Object.keys(perDay).map(Number).filter(function (d) { return d > r.day + 7; });
        pairEndsWithin7 = later.length ? false : null;
      }
    }
    rows.push({
      day: r.day, scholarId: r.scholarId, scholarName: r.scholarName,
      cause: r.cause, causeClass: r.causeClass, location: r.location,
      wasVeteran: !!r.veteranW4,
      pairHoldDay: !!(h && h.pairHold), deferralHoldDay: !!(h && h.deferralHold),
      ceilingDay: !!(h && h.ceiling),
      pairEndsWithin7: pairEndsWithin7, pairEndDay: pairEndDay,
      successorId: r.successorId || null,
    });
  }
  return { perDay: holds.perDay, blocks: holds.blocks, strandings: rows };
}

module.exports = {
  PELLET_ID: PELLET_ID,
  REACTOR_ID: REACTOR_ID,
  install: install,
  diffScholarDays: diffScholarDays,
  causeClass: causeClass,
  locationClass: locationClass,
  firstWaveKillDay: firstWaveKillDay,
  findHoldStranding: findHoldStranding,
  abilityIdsOf: abilityIdsOf,
};
