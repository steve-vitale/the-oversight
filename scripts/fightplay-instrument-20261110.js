// fightplay-instrument-20261110.js — fight-play census instrument
// (arm sim-fightplay-b). Pure-read wrappers + daily snapshots; zero
// game-state writes, zero RNG draws. Wrappers never throw into game code:
// a recording failure is counted in instrumentErrors and the original
// call's result is returned untouched.
//
// Grounded-vs-conjured classification adapted from
// scripts/conjurefix-analyze-20261110.js (branch sim-conjurefix-b,
// read-only reference; that tree was never modified):
//   - agency fight = channel 'field' + cls 'other' (expeditionMonster path)
//   - conjured = seq == null (fought object never registered by the
//     spawnWorldMonster wrapper); on current master every
//     expeditionMonster fight is conjured by construction
//     (fieldFight(vid, m, null, ...) in villager-agency.js).
//   - REAL (grounded) wild fight = field fight with seq != null.
//   - psycho_* rows are person-vs-person violence (corruption.js),
//     excluded from wild counts like conjurefix does.
//
// Per-fight capture (field channel):
//   party size at fight start (rec.partySize + allyVid + calledHelp),
//   ability uses by villager (rec.ffFired, leader only — the engine
//   records no per-ally firing list), flee/engage context (win-plan
//   gate result joined by gateSeq, awareness evade outcome, rec.intent
//   + intentWhy, mid-fight vFlee outcome) cross-tabulated offline
//   against knowledge captured at fight entry (villageKnowsTrick,
//   fighter's personal fought list + seen count), trick executions
//   (rec.trickLog), ammo pocketed at contact (counted from the fighter's
//   own items before the fight) and ammo spent (before-minus-after;
//   rec.volley.shots is the PLANNED count and can overstate when the
//   volley kills the lead early).
// Usage: const INST = require('./fightplay-instrument-20261110');
//   const inst = INST.install(Game); inst.snapshot(); ... inst.finalize(); inst.uninstall();
'use strict';

function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function stackFn() {
  try {
    const lines = (new Error().stack || '').split('\n').slice(1);
    for (const ln of lines) {
      if (ln.indexOf('fightplay-instrument') >= 0) continue;
      const m = ln.match(/at (?:async )?([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)?)/);
      if (m) return m[1];
    }
    return null;
  } catch (e) { return null; }
}
function stackHas(needle) {
  try {
    const st = new Error().stack || '';
    const lines = st.split('\n').slice(1).filter(function (ln) { return ln.indexOf('fightplay-instrument') < 0; });
    return lines.some(function (ln) { return ln.indexOf(needle) >= 0; });
  } catch (e) { return false; }
}
function classifyFight(st) {
  if (/contest/i.test(st)) return 'contest';
  if (/feast/i.test(st)) return 'feast';
  if (/trap/i.test(st)) return 'trap';
  if (/monsterTurn|resolveWildMonsterEncounter|villagerMonsterTick|checkEncounter|worldTick/i.test(st)) return 'world';
  return 'other';
}
function isPsycho(mid) {
  return typeof mid === 'string' && mid.indexOf('psycho_') === 0;
}

function install(Game) {
  const t = { spawns: [], casts: [], fights: [], gateCalls: [], daily: [], instrumentErrors: [] };
  const waveById = {};
  try {
    const mons = ((Game.data || {}).monsters) || [];
    mons.forEach(function (m) { if (m && m.id) waveById[m.id] = (m.wave | 0) || 1; });
  } catch (e) { t.instrumentErrors.push('monster-map: ' + String(e.message).slice(0, 80)); }

  function waveOf(mid, mdef) {
    if (mdef && (mdef.wave | 0)) return (mdef.wave | 0);
    if (mid && waveById[mid]) return waveById[mid];
    return null;
  }

  const instances = new Map();
  let seqCounter = 0;
  let gateSeqCounter = 0;
  const lastGateByVid = {};

  function playerTile() {
    try { return { px: Game.map.px, py: Game.map.py }; } catch (e) { return { px: null, py: null }; }
  }

  function villagerPerson(vid) {
    try {
      const vl = (Game.data || {}).villagers || [];
      for (let i = 0; i < vl.length; i++) if (vl[i] && vl[i].id === vid) return vl[i];
      const bs = (Game.data || {}).background_survivors || [];
      for (let i = 0; i < bs.length; i++) if (bs[i] && bs[i].id === vid) return bs[i];
    } catch (e) {}
    return null;
  }

  // Ammo at contact, counted exactly the way the volley block counts it
  // (fieldFights.js): the equipped ranged weapon's ammo id, summed over
  // the fighter's own items. Returns {n, ammoId, rangedId} or
  // {n: 0, reason} when there is no ranged weapon / no ammo / no lookup.
  // NOTE (instrument fix, 2026-11-11): the first pilot run read the
  // equipment handle from globalThis.Scattering.S, which does not exist —
  // equipment.js publishes S.equipment to globalThis.Scattering.equipment
  // (namespace bridge, 2026-10-09). Every fight in that corpus recorded
  // ammoBeforeReason 'no-S-equipment'; the corpus was re-run with this
  // fix (see evidence). The volley data in the first corpus already
  // proved archers carry and spend ammo (200 volley fights).
  function ammoBefore(vid) {
    try {
      const EQ = (typeof globalThis !== 'undefined' && globalThis.Scattering && globalThis.Scattering.equipment)
        || (typeof globalThis !== 'undefined' && globalThis.S && globalThis.S.equipment) || null;
      const vp = villagerPerson(vid);
      if (!vp) return { n: 0, reason: 'no-person' };
      if (!EQ || typeof EQ.rangedWeaponOf !== 'function') return { n: 0, reason: 'no-equipment' };
      const rw = EQ.rangedWeaponOf(vp, (Game.data || {}).items || []);
      const rwId = rw ? (rw.itemId || rw.id) : null;
      if (!rwId) return { n: 0, reason: 'no-ranged-weapon' };
      let rdef = null;
      const defs = (Game.data || {}).items || [];
      for (let i = 0; i < defs.length; i++) if (defs[i] && defs[i].id === rwId) { rdef = defs[i]; break; }
      const w = (rdef && rdef.weapon) || null;
      const ammoId = w ? w.ammo : null;
      if (!ammoId) return { n: 0, reason: 'ranged-no-ammo-type', rangedId: rwId };
      let n = 0;
      const items = vp.items || [];
      for (let i = 0; i < items.length; i++) {
        const ent = items[i];
        if (!ent) continue;
        const eid = (typeof ent === 'string') ? ent : (ent.itemId || ent.id);
        const mat = (typeof ent === 'string') ? null : ent.material;
        const u = (typeof ent === 'string') ? 1 : (ent.units || 1);
        if (eid === ammoId || mat === ammoId) n += u;
      }
      return { n: n, ammoId: ammoId, rangedId: rwId, reason: n > 0 ? null : 'ranged-no-ammo' };
    } catch (e) { return { n: null, reason: 'error:' + String(e.message).slice(0, 60) }; }
  }

  // Knowledge at fight entry, as the code actually stores it
  // (sim-knowledge-b audit: no per-villager monster-knowledge store;
  // village-wide trick stores + the fighter's personal fought list).
  function knowledgeAt(vid, mid) {
    const out = { trickKnown: null, trickKnownWhy: null, foughtBefore: null, seenCount: null };
    try {
      if (typeof Game.villageKnowsTrick === 'function') {
        out.trickKnown = !!Game.villageKnowsTrick(mid);
        if (out.trickKnown) {
          try { out.trickKnownWhy = (Game.monsterCounterKnown && Game.monsterCounterKnown(mid)) ? 'counter' : 'villagerTricks'; } catch (e) { out.trickKnownWhy = 'unknown'; }
        }
      }
    } catch (e) { out.trickKnown = null; }
    try {
      const a = (typeof Game.agencyOf === 'function') ? Game.agencyOf(vid) : null;
      const know = a && a.know && a.know[vid];
      if (know) {
        out.foughtBefore = Array.isArray(know.fought) ? (know.fought.indexOf(mid) >= 0) : null;
        out.seenCount = (typeof know.monsters === 'number') ? know.monsters : null;
      }
    } catch (e) {}
    return out;
  }

  const origSpawn = Game.spawnWorldMonster;
  const origCast = Game.castMonster;
  const origStart = Game.startCombat;
  const origField = Game.fieldFight;
  const origGate = Game.winPlanFightGate;

  if (typeof origSpawn === 'function') {
    Game.spawnWorldMonster = function (mdef, tx, ty, opts) {
      let mon = null;
      try { mon = origSpawn.apply(this, arguments); } catch (e) { throw e; }
      try {
        const pt = playerTile();
        const fn = stackFn();
        let source = 'other';
        if (fn && fn.indexOf('maintainWorldMonsters') >= 0) source = 'background';
        else if (fn && fn.indexOf('checkEncounter') >= 0) source = 'checkEncounter';
        else if (stackHas('maintainWorldMonsters')) source = 'background';
        else if (stackHas('checkEncounter')) source = 'checkEncounter';
        const id = (mon && mon.id) || ((typeof mdef === 'string') ? mdef : (mdef && mdef.id)) || null;
        const wave = (mon && mon.wave != null) ? (mon.wave | 0) : waveOf(id, (typeof mdef === 'object') ? mdef : null);
        seqCounter++;
        if (mon && typeof mon === 'object') instances.set(mon, seqCounter);
        t.spawns.push({
          seq: seqCounter, day: dayOf(Game), id: id, wave: wave,
          tx: (mon && mon.tx != null) ? mon.tx : tx, ty: (mon && mon.ty != null) ? mon.ty : ty,
          px: pt.px, py: pt.py,
          onPlayerTile: (pt.px != null && mon) ? (mon.tx === pt.px && mon.ty === pt.py) : null,
          source: source, veteran: !!(mon && mon.veteran),
        });
      } catch (e) { t.instrumentErrors.push('spawn-record: ' + String(e.message).slice(0, 80)); }
      return mon;
    };
  } else { t.instrumentErrors.push('spawnWorldMonster-missing'); }

  if (typeof origCast === 'function') {
    Game.castMonster = function () {
      let ret = null;
      try { ret = origCast.apply(this, arguments); } catch (e) { throw e; }
      try {
        const fn = stackFn();
        let source = 'other';
        if (fn && fn.indexOf('checkEncounter') >= 0) source = 'wanderer-cast';
        else if (stackHas('checkEncounter')) source = 'wanderer-cast';
        const id = (ret && ret.id) || (typeof ret === 'string' ? ret : null);
        t.casts.push({ day: dayOf(Game), id: id, wave: waveOf(id, null), source: source, veteran: !!(ret && ret.veteran) });
      } catch (e) { t.instrumentErrors.push('cast-record: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
  } else { t.instrumentErrors.push('castMonster-missing'); }

  if (typeof origGate === 'function') {
    Game.winPlanFightGate = function (vid, mdef) {
      let ret = null;
      try { ret = origGate.apply(this, arguments); } catch (e) { throw e; }
      try {
        gateSeqCounter++;
        const rec = {
          gateSeq: gateSeqCounter, day: dayOf(Game), vid: vid || null,
          mid: (mdef && mdef.id) || null, wave: waveOf((mdef && mdef.id) || null, mdef),
          result: (ret && ret.avoid) ? 'avoid' : ((ret && ret.seek) ? 'seek' : null),
          reason: (ret && (ret.reason || null)) || null,
          partySize: (ret && ret.party) ? ret.party.length : null,
        };
        t.gateCalls.push(rec);
        if (vid) lastGateByVid[vid] = gateSeqCounter;
      } catch (e) { t.instrumentErrors.push('gate-record: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
  } else { t.instrumentErrors.push('winPlanFightGate-missing'); }

  if (typeof origStart === 'function') {
    Game.startCombat = function () {
      const mid = arguments.length ? arguments[0] : null;
      let ret;
      try { ret = origStart.apply(this, arguments); } catch (e) { throw e; }
      try {
        const st = (new Error().stack || '');
        const tileMon = (typeof Game.monsterAt === 'function' && playerTile().px != null) ? Game.monsterAt(playerTile().px, playerTile().py) : null;
        const seq = (tileMon && instances.get(tileMon)) || null;
        t.fights.push({ day: dayOf(Game), channel: 'player-tb', fighter: null, mid: mid || null, wave: waveOf(mid, null), cls: classifyFight(st), seq: seq, outcome: null });
      } catch (e) { t.instrumentErrors.push('startCombat-record: ' + String(e.message).slice(0, 80)); }
      return ret;
    };
  } else { t.instrumentErrors.push('startCombat-missing'); }

  if (typeof origField === 'function') {
    Game.fieldFight = function (vid, mdef, m, opts) {
      opts = opts || {};
      const mid = (mdef && mdef.id) || (m && m.id) || null;
      const preAmmo = ammoBefore(vid);
      const preKnow = knowledgeAt(vid, mid);
      const gateSeq = (vid && lastGateByVid[vid]) || null;
      let rec;
      try { rec = origField.apply(this, arguments); } catch (e) { throw e; }
      try {
        const st = (new Error().stack || '');
        const seq = (m && instances.get(m)) || null;
        let outcome = null;
        try { outcome = (rec && (rec.outcome || rec.result)) || null; } catch (e2) { t.instrumentErrors.push('fieldFight-outcome: ' + String(e2.message).slice(0, 80)); }
        const volley = (rec && rec.volley) || null;
        // Ammo spent = before-minus-after. rec.volley.ammoLeft is the
        // post-volley count; when there is no volley the fight spends no
        // ammo, so spent is 0 and after-count equals before-count.
        let ammoAfter = null, ammoSpent = null;
        try {
          if (volley && typeof volley.ammoLeft === 'number') {
            ammoAfter = volley.ammoLeft;
            ammoSpent = (typeof preAmmo.n === 'number') ? Math.max(0, preAmmo.n - volley.ammoLeft) : null;
          } else if (typeof preAmmo.n === 'number') { ammoAfter = preAmmo.n; ammoSpent = 0; }
        } catch (e) { t.instrumentErrors.push('fieldFight-ammo: ' + String(e.message).slice(0, 80)); }
        let abilitiesByRound = null;
        try {
          if (rec && Array.isArray(rec.roundsDetail)) {
            abilitiesByRound = rec.roundsDetail.map(function (d) { return (d && Array.isArray(d.abilities)) ? d.abilities.slice() : []; });
          }
        } catch (e) { abilitiesByRound = null; }
        let logExcerpt = null;
        try {
          if (rec && Array.isArray(rec.log)) logExcerpt = rec.log.slice(0, 4).join(' | ').slice(0, 800);
        } catch (e) { logExcerpt = null; }
        t.fights.push({
          day: dayOf(Game), channel: 'field', fighter: vid || null, mid: mid,
          wave: waveOf(mid, mdef), cls: classifyFight(st), seq: seq,
          outcome: outcome, psycho: isPsycho(mid),
          gateSeq: gateSeq,
          partySize: (rec && rec.partySize != null) ? rec.partySize : null,
          alliesOpt: (opts.allies | 0) || 0,
          allyVid: (rec && rec.allyVid) || null,
          calledHelp: !!(rec && rec.calledHelp),
          noFlee: !!opts.noFlee,
          intent: (rec && rec.intent) || null, intentWhy: (rec && rec.intentWhy) || null,
          rounds: (rec && rec.rounds != null) ? rec.rounds : null,
          vTaken: (rec && rec.vTaken != null) ? rec.vTaken : null,
          mDealt: (rec && rec.mDealt != null) ? rec.mDealt : null,
          vHpLeft: (rec && rec.vHpLeft != null) ? rec.vHpLeft : null,
          mHpLeft: (rec && rec.mHpLeft != null) ? rec.mHpLeft : null,
          ffFired: (rec && Array.isArray(rec.ffFired)) ? rec.ffFired.slice() : [],
          abilitiesByRound: abilitiesByRound,
          trickLog: (rec && Array.isArray(rec.trickLog)) ? rec.trickLog.slice() : [],
          volley: volley ? { shots: volley.shots, hits: volley.hits, dmg: volley.dmg, ammoLeft: volley.ammoLeft } : null,
          ammoBefore: (typeof preAmmo.n === 'number') ? preAmmo.n : null,
          ammoBeforeReason: preAmmo.reason || null,
          ammoId: preAmmo.ammoId || null, rangedId: preAmmo.rangedId || null,
          ammoAfter: ammoAfter, ammoSpent: ammoSpent,
          trickKnown: preKnow.trickKnown, trickKnownWhy: preKnow.trickKnownWhy,
          foughtBefore: preKnow.foughtBefore, seenCount: preKnow.seenCount,
          logExcerpt: logExcerpt,
        });
      } catch (e) { t.instrumentErrors.push('fieldFight-record: ' + String(e.message).slice(0, 80)); }
      return rec;
    };
  } else { t.instrumentErrors.push('fieldFight-missing'); }

  function snapshot() {
    const snap = { day: dayOf(Game) };
    try { snap.scholarId = Game.villagerId || null; } catch (e) { snap.scholarId = null; }
    try {
      const roster = (((Game.state || {}).village || {}).roster || []).slice();
      snap.rosterSize = roster.length;
      let living = 0;
      roster.forEach(function (vid) {
        if (vid === snap.scholarId) { living++; return; }
        try { const p = (typeof Game.getPerson === 'function') ? Game.getPerson(vid) : null; if (p && !p.dead) living++; } catch (e) {}
      });
      snap.living = living;
    } catch (e) { snap.rosterSize = null; snap.living = null; t.instrumentErrors.push('roster: ' + String(e.message).slice(0, 80)); }
    try {
      const st = Game.villageStanding ? Game.villageStanding() : null;
      snap.raw = st ? (st.total | 0) : null;
    } catch (e) { snap.raw = null; t.instrumentErrors.push('standing: ' + String(e.message).slice(0, 80)); }
    try { snap.gated = Game.villageStandingTotal ? Game.villageStandingTotal() : null; } catch (e) { snap.gated = null; t.instrumentErrors.push('gated: ' + String(e.message).slice(0, 80)); }
    try { snap.w2pts = (typeof Game.waveLedgerPoints === 'function') ? (Game.waveLedgerPoints(2) | 0) : null; } catch (e) { snap.w2pts = null; t.instrumentErrors.push('w2pts: ' + String(e.message).slice(0, 80)); }
    try {
      const cfg = (typeof Game.waveLedgerCfg === 'function') ? Game.waveLedgerCfg() : null;
      snap.bar2 = (cfg && cfg.barsPerWave && cfg.barsPerWave[2] != null) ? (cfg.barsPerWave[2] | 0) : 5;
      snap.dayFloor = (cfg && cfg.dayFloor != null) ? (cfg.dayFloor | 0) : 25;
    } catch (e) { snap.bar2 = 5; snap.dayFloor = 25; }
    try {
      const sc = (typeof Game.standingCfg === 'function') ? Game.standingCfg() : null;
      snap.t4 = (sc && sc.t4 != null) ? (sc.t4 | 0) : 100;
    } catch (e) { snap.t4 = 100; }
    try { snap.scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) { snap.scaleRank = null; }
    try { snap.readiness5 = Game.waveCombatReadiness ? Game.waveCombatReadiness(5) : null; } catch (e) { snap.readiness5 = null; t.instrumentErrors.push('readiness5: ' + String(e.message).slice(0, 80)); }
    try {
      const log = ((Game.state || {}).waveKillLog) || [];
      const w4 = log.filter(function (e2) { return ((e2 && e2.w) | 0) >= 4; });
      snap.w4kills = w4.length;
      const seen = {};
      w4.forEach(function (e2) { if (e2 && e2.by) seen[e2.by] = true; });
      snap.w4killers = Object.keys(seen).length;
    } catch (e) { snap.w4kills = null; snap.w4killers = null; t.instrumentErrors.push('killlog-snap: ' + String(e.message).slice(0, 80)); }
    try { snap.w4facedTypes = (typeof Game.waveEngaged === 'function') ? (Game.waveEngaged(4) | 0) : null; } catch (e) { snap.w4facedTypes = null; }
    snap.fightsTotal = t.fights.length;
    snap.fightsGrounded = t.fights.filter(function (f) { return f.channel === 'field' && f.seq != null && !f.psycho; }).length;
    snap.gateCalls = t.gateCalls.length;
    t.daily.push(snap);
    return snap;
  }

  function finalize() {
    const out = {};
    try { out.waveKillLog = (((Game.state || {}).waveKillLog) || []).slice(); } catch (e) { out.waveKillLog = null; t.instrumentErrors.push('killlog-final: ' + String(e.message).slice(0, 80)); }
    try { out.fallen = (((Game.state || {}).village || {}).fallen || []).slice(); } catch (e) { out.fallen = null; t.instrumentErrors.push('fallen-final: ' + String(e.message).slice(0, 80)); }
    try {
      const ds = (typeof Game.deedState === 'function') ? Game.deedState() : null;
      out.wavesFaced = (ds && ds.wavesFaced) || null;
    } catch (e) { out.wavesFaced = null; t.instrumentErrors.push('deed-final: ' + String(e.message).slice(0, 80)); }
    try { out.scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) { out.scaleRank = null; }
    try { out.unlockedWave = Game.unlockedWave ? Game.unlockedWave() : null; } catch (e) { out.unlockedWave = null; }
    try { out.standing = Game.villageStandingTotal ? Game.villageStandingTotal() : null; } catch (e) { out.standing = null; }
    try { out.readiness5 = Game.waveCombatReadiness ? Game.waveCombatReadiness(5) : null; } catch (e) { out.readiness5 = null; }
    return out;
  }

  function uninstall() {
    try { if (typeof origSpawn === 'function') Game.spawnWorldMonster = origSpawn; } catch (e) {}
    try { if (typeof origCast === 'function') Game.castMonster = origCast; } catch (e) {}
    try { if (typeof origStart === 'function') Game.startCombat = origStart; } catch (e) {}
    try { if (typeof origField === 'function') Game.fieldFight = origField; } catch (e) {}
    try { if (typeof origGate === 'function') Game.winPlanFightGate = origGate; } catch (e) {}
  }

  return { t: t, snapshot: snapshot, finalize: finalize, uninstall: uninstall };
}

module.exports = { install: install, classifyFight: classifyFight, isPsycho: isPsycho };
