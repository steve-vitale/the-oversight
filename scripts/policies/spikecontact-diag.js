// spikecontact-diag — the spike/contact recorder (sim-spikecontact-a,
// 2026-11-01, flesh-out loop, axis scale-onramp, DIAG ONLY).
//
// QUESTIONS (sim-spikecontact-a, from run 2156Z): (a) spike-vs-
// last-two separation for committed/twoblow-eligible fights;
// (b) contact-finish BUILD readiness: the fighter's real finish
// instrument at contact (held weapon, ammo, melee availability).
// This recorder is twoblow-diag.js PLUS: log for wave >= 3 (slice
// 200), contactrec HP-capture preference order (pre-call, the
// rec.mHpStart/rec.mMaxHp emission, evade-only exact fill +
// m=null band-top max), pre-call finish-instrument capture
// (equipped ranged/melee + ammo count + carried melee), and
// parsed lead-strike components via the shared parser
// (scripts/spikecontact-parse-20261031.js — same code the
// analyzer uses, so policy and analyzer cannot drift).
//
// LAYERS (all observational, SPIKECONTACT=1 only):
//   DAILY (after the inner daily runs): pure reads — day, rank,
//     waveLedgerPoints(1..5), waveLedgerCfg bars/floor, the wave-3
//     rung recomputed (day >= 25 AND p2 >= bar2), villageStanding()
//     warPts, deedState().wavesFaced copy, waveKillLog deltas.
//     NEVER calls unlockedWave() or villageStandingTotal() mid-run
//     (both can write state / fire beats); the sweep cross-checks
//     derived final uw>=3 against ONE post-run unlockedWave() call.
//   EVENTS (wraps installed after loadGame, removed after the run;
//     all record AFTER delegating, return the original value
//     untouched, never throw into the engine):
//     - fieldFight: villager channel (outcome/rounds/HP/ally/intent/
//       caller class from the call stack).
//     - tbEnd: player channel. Fighters are captured BEFORE
//       delegating (tbEnd clears Game.tbfight — the encounter-diag
//       lesson: a post-call read always misses); only fights whose
//       settled state is over are recorded.
//     - recordWaveKill: the ledger choke point. The wave-ledger
//       point delta (after minus before, scorer runs inside) is
//       exact per kill event, whatever channel called it — this
//       is what splits ledger-point kills from capped kills
//       without guessing from log order.
//     - spawnWorldMonster: context only (never in the meeting
//       total). Spawn-to-fight linkage is type-level: world
//       entities carry no stable instance id.
//     - sysSay: lines naming a wave-3 monster, capped, for the
//       sense read only.
// POLICY-SIDE ONLY — zero src/js changes.
'use strict';
const SC_PARSE = require('../spikecontact-parse-20261031.js');

const MAX_EVENTS = 60000;
const W3_IDS = ['redactor', 'gavel', 'focus_group', 'spool', 'chorus_line', 'terms_of_service', 'callback', 'buffering', 'ad_break'];
const W3_NAME_FRAGS = ['redactor', 'gavel', 'focus group', 'spool', 'chorus line', 'terms of service', 'callback', 'buffering', 'ad break'];

function layerOn() { try { return process.env.SPIKECONTACT === '1'; } catch (e) { return false; } }
function n0(x) { const n = x | 0; return n > 0 ? n : 0; }
function dayOf(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }

function newStore() {
  return {
    daily: [], fieldFights: [], tbFights: [], killEvents: [], pyrrhicEvents: [], spawns: [], sayLines: [],
    errs: 0, errors: [], overflow: {}, installed: false,
    _lastLogLen: 0,
  };
}
function noteErr(store, where, e) {
  try {
    store.errs++;
    if (store.errors.length < 20) store.errors.push(where + ': ' + String((e && e.message) || e).slice(0, 120));
  } catch (e2) { /* counting must never throw */ }
}
function pushCapped(store, list, item) {
  if (store[list].length >= MAX_EVENTS) { store.overflow[list] = (store.overflow[list] || 0) + 1; return false; }
  store[list].push(item);
  return true;
}
function waveOfDef(Game, mid) {
  try {
    const def = ((Game.data || {}).monsters || []).find(d => d && d.id === mid);
    if (def && (def.wave | 0)) return def.wave | 0;
  } catch (e) { /* fall through */ }
  return 1;
}
function stackNames() {
  let names = [];
  try {
    const stack = (new Error()).stack || '';
    for (const line of stack.split('\n')) {
      const m = line.match(/at\s+(?:Object\.)?([A-Za-z_$][\w$]*)/);
      if (m && names.indexOf(m[1]) < 0) names.push(m[1]);
    }
  } catch (e) { /* best-effort */ }
  return names;
}
function classifyCaller(names, hasRng) {
  if (names.indexOf('lingererSortie') >= 0) return 'sortie';
  if (names.indexOf('resolvePatrol') >= 0) return 'patrol';
  if (names.indexOf('aidFight') >= 0) return 'aid';
  if (names.indexOf('resolveWildMonsterEncounter') >= 0) return 'wild';
  if (names.indexOf('expeditionMonster') >= 0) return 'expedition';
  if (hasRng) return 'rng-seeded';
  return 'other';
}
function copyFaced(Game) {
  const out = {};
  try {
    const ds = (typeof Game.deedState === 'function') ? Game.deedState() : null;
    const faced = (ds && ds.wavesFaced) || {};
    for (const k of Object.keys(faced)) out[k] = faced[k] | 0;
  } catch (e) { /* empty map on failure; errs counted by caller */ }
  return out;
}
function copyKillLog(Game) {
  const out = [];
  try {
    const log = (Game.state && Game.state.waveKillLog) || [];
    if (Array.isArray(log)) {
      for (const e of log) {
        if (!e || typeof e !== 'object') continue;
        out.push({ d: n0(e.d), mid: e.mid || null, w: n0(e.w), by: e.by || null, via: e.via || 'unknown', trick: e.trick || null });
      }
    }
  } catch (e) { /* empty on failure */ }
  return out;
}
function snapDaily(Game, store) {
  const row = { day: dayOf(Game), errs: [] };
  try { row.rank = (typeof Game.scaleRank === 'function') ? String(Game.scaleRank()) : 'village'; }
  catch (e) { row.rank = 'village'; row.errs.push('scaleRank'); }
  let cfg = null;
  try { cfg = (typeof Game.waveLedgerCfg === 'function') ? Game.waveLedgerCfg() : null; }
  catch (e) { row.errs.push('waveLedgerCfg'); }
  const bars = (cfg && cfg.barsPerWave) || {};
  row.bar2 = (bars[2] | 0) || 4;
  row.dN = (cfg && cfg.dayFloor != null) ? (cfg.dayFloor | 0) : 25;
  row.p1 = 0; row.p2 = 0; row.p3 = 0; row.p4 = 0; row.p5 = 0;
  try {
    for (let w = 1; w <= 5; w++) {
      if (typeof Game.waveLedgerPoints === 'function') row['p' + w] = Game.waveLedgerPoints(w) | 0;
    }
  } catch (e) { row.errs.push('waveLedgerPoints'); }
  row.w3rung = row.day >= row.dN && row.p2 >= row.bar2;
  try {
    const vs = (typeof Game.villageStanding === 'function') ? Game.villageStanding() : null;
    row.warPts = vs ? n0(vs.warPts) : 0;
  } catch (e) { row.warPts = 0; row.errs.push('villageStanding'); }
  row.faced = copyFaced(Game);
  const log = copyKillLog(Game);
  row.logLen = log.length;
  if (log.length < store._lastLogLen) { row.resync = true; row.newEntries = log.slice(); }
  else row.newEntries = log.slice(store._lastLogLen);
  store._lastLogLen = log.length;
  row.won = false;
  try { row.won = !!Game.won; } catch (e) { /* false */ }
  store.daily.push(row);
  if (row.errs.length) store.errs += row.errs.length;
  return row;
}

// FINISH-INSTRUMENT CAPTURE (sim-spikecontact-a, pre-call, pure
// reads only — never writes game state, draws no RNG). Mirrors the
// engine's own lookups in fieldFights.js: vp from
// data.villagers/background_survivors by vid, equipped ranged/melee
// from vp.equipped, ammo counted exactly as the volley block counts
// it (pack entries whose itemId or material equals the ranged
// weapon's weapon.ammo id, units summed), carried melee = pack
// weapon defs that are not ranged under the equipment.js
// isRangedWeapon rule (range > 1, or bow/sling/rifle/pistol/
// crossbow in the name). Returns nulls (never throws) when the
// fighter record is unavailable.
function captureInstrument(Game, vid) {
  const empty = { rangedEqId: null, rangedEqName: null, ammoAtContact: null, meleeEqId: null, meleeEqName: null, meleeCarriedIds: [] };
  try {
    const data = Game.data || {};
    const persons = (data.villagers || []).concat(data.background_survivors || []);
    let vp = null;
    for (const x of persons) if (x && x.id === vid) { vp = x; break; }
    if (!vp) return empty;
    const defs = data.items || [];
    const defOf = (id) => { for (const d of defs) if (d && d.id === id) return d; return null; };
    const eq = vp.equipped || {};
    const rangedEntry = eq.ranged || null;
    const rangedId = rangedEntry ? (rangedEntry.itemId || rangedEntry.id || null) : null;
    const rangedDef = rangedId ? defOf(rangedId) : null;
    let ammoAtContact = null;
    if (rangedDef && rangedDef.weapon && rangedDef.weapon.ammo) {
      const ammoId = rangedDef.weapon.ammo;
      let n = 0;
      for (const ent of (vp.items || [])) {
        let eid = null, mat = null, u = 1;
        if (typeof ent === 'string') eid = ent;
        else if (ent) { eid = ent.itemId || ent.id; mat = ent.material; u = ent.units || 1; }
        if (eid === ammoId || mat === ammoId) n += u;
      }
      ammoAtContact = n;
    }
    const meleeEntry = eq.melee || eq.weapon || null;
    const meleeId = meleeEntry ? (meleeEntry.itemId || meleeEntry.id || null) : null;
    const meleeDef = meleeId ? defOf(meleeId) : null;
    const carried = [];
    for (const ent of (vp.items || [])) {
      const eid = typeof ent === 'string' ? ent : (ent && (ent.itemId || ent.id));
      if (!eid) continue;
      const d = defOf(eid);
      if (!d || !d.weapon) continue;
      if (d.class !== 'weapon' && d.class !== 'sentimental') continue;
      const isRanged = ((d.weapon.range || 1) > 1) ||
        /bow|sling|rifle|pistol|crossbow/.test(String(d.name || '').toLowerCase() + ' ' + String(d.id || '').toLowerCase());
      if (!isRanged) carried.push(eid);
    }
    return { rangedEqId: rangedId, rangedEqName: rangedDef ? (rangedDef.name || null) : null, ammoAtContact,
      meleeEqId: meleeId, meleeEqName: meleeDef ? (meleeDef.name || null) : null, meleeCarriedIds: carried };
  } catch (e) { return Object.assign({}, empty, { instrumentErr: String((e && e.message) || e).slice(0, 80) }); }
}

// HP CAPTURE (sim-contactrec-a rules, copied verbatim in preference
// order): (a) pre-call world-entity HP, (b) the contactrec emission
// rec.mHpStart/rec.mMaxHp, (c) evade-only exact fill (opening HP =
// rec.mHpLeft, since the awareness evade return precedes all damage)
// plus m=null band-top max (members[0].maxHp = max(rolled HP,
// hp[1]) = hp[1] for a roll inside [lo, hi]). Rule (c) NEVER fills
// a fought row's mHpStart. mHpAtContact = rec.mHpLeft on every row.
function captureHp(preMhp, preMmax, rec, m, mdef) {
  let mHpStart = (preMhp != null) ? preMhp : null;
  let mMaxHp = (preMmax != null) ? preMmax : null;
  try {
    if (mHpStart == null && rec && rec.mHpStart != null) mHpStart = Math.round(rec.mHpStart);
    if (mMaxHp == null && rec && rec.mMaxHp != null) mMaxHp = Math.round(rec.mMaxHp);
    if (rec && rec.outcome === 'evade' && mHpStart == null && rec.mHpLeft != null) mHpStart = Math.round(rec.mHpLeft);
    if (mMaxHp == null && !m && mdef && Array.isArray(mdef.hp) && mdef.hp.length === 2 && Number.isFinite(mdef.hp[1])) mMaxHp = mdef.hp[1] | 0;
  } catch (e) { /* (a) values stand */ }
  const mHpAtContact = (rec && rec.mHpLeft != null) ? Math.round(rec.mHpLeft) : null;
  return { mHpStart, mMaxHp, mHpAtContact };
}

function installSpikecontactDiag(Game, store) {
  if (!Game || !store) return function () {};
  if (Game._spikecontactStore === store && Game._spikecontactInstalled) return Game._spikecontactUninstall || function () {};
  const uninstalls = [];
  // sysSay capture (wave-3 names only, for the sense read).
  try {
    if (typeof Game.sysSay === 'function') {
      const orig = Game.sysSay;
      Game.sysSay = function () {
        try {
          const line = (arguments.length && arguments[0] != null) ? String(arguments[0]) : '';
          const low = line.toLowerCase();
          if (W3_NAME_FRAGS.some(f => low.indexOf(f) >= 0)) {
            pushCapped(store, 'sayLines', { day: dayOf(Game), line: line.slice(0, 400) });
          }
        } catch (e) { /* never break narration */ }
        return orig.apply(this, arguments);
      };
      uninstalls.push(() => { try { Game.sysSay = orig; } catch (e) {} });
    }
  } catch (e) { noteErr(store, 'say.wrap', e); }
  // spawnWorldMonster (context only).
  try {
    if (typeof Game.spawnWorldMonster === 'function') {
      const orig = Game.spawnWorldMonster;
      Game.spawnWorldMonster = function (mdef, tx, ty, opts) {
        const mon = orig.apply(this, arguments);
        try {
          if (mon) pushCapped(store, 'spawns', { day: dayOf(Game), mid: mon.id || null, wave: n0(mon.wave), tx: mon.tx != null ? (mon.tx | 0) : null, ty: mon.ty != null ? (mon.ty | 0) : null, veteran: !!mon.veteran });
        } catch (e) { noteErr(store, 'spawn.rec', e); }
        return mon;
      };
      uninstalls.push(() => { try { Game.spawnWorldMonster = orig; } catch (e) {} });
    } else noteErr(store, 'spawn.missing', new Error('no spawnWorldMonster'));
  } catch (e) { noteErr(store, 'spawn.wrap', e); }
  // fieldFight (villager channel).
  try {
    if (typeof Game.fieldFight === 'function') {
      const orig = Game.fieldFight;
      Game.fieldFight = function (vid, mdef, m, opts) {
        const names = stackNames();
        let preMhp = null, preMmax = null, preVhp = null;
        try { if (m) { preMhp = (m.hp != null ? Math.round(m.hp) : null); preMmax = (m.maxHp != null ? Math.round(m.maxHp) : null); } } catch (e) {}
        try { const vh = ((Game.state || {}).village || {}).health || {}; preVhp = (vh[vid] != null ? Math.round(vh[vid]) : null); } catch (e) {}
        const preOpts = { allies: (opts && opts.allies) | 0, allyVids: (opts && opts.allyVids) ? opts.allyVids.length : 0, allyFromStart: !!(opts && opts.allyFromStart), noFlee: !!(opts && opts.noFlee), cornered: !!(opts && opts.cornered) };
        const preInstrument = captureInstrument(Game, vid);
        const rec = orig.apply(this, arguments);
        try {
          const md = mdef || {};
          const mid = md.id || null;
          const wave = (md.wave | 0) || (mid ? waveOfDef(Game, mid) : 1);
          const cap = captureHp(preMhp, preMmax, rec, m, md);
          const parsed = rec && rec.log ? SC_PARSE.parseLeadStrikes(rec.log) : null;
          const leadStrikes = parsed ? parsed.strikes : null;
          const lastTwoParsed = leadStrikes && leadStrikes.length >= 2 ? leadStrikes.slice(-2).map(x => x.dmg) : null;
          const lastTwoParsedSum = lastTwoParsed ? (lastTwoParsed[0] + lastTwoParsed[1]) : null;
          const maxStrike = leadStrikes && leadStrikes.length ? Math.max.apply(null, leadStrikes.map(x => x.dmg)) : null;
          pushCapped(store, 'fieldFights', {
            day: dayOf(Game), vid: vid != null ? String(vid) : null,
            mid, wave, outcome: rec ? (rec.outcome || null) : null,
            rounds: rec ? (rec.rounds | 0) : null,
            vHpLeft: rec ? (rec.vHpLeft != null ? Math.round(rec.vHpLeft) : null) : null,
            mHpLeft: rec ? (rec.mHpLeft != null ? Math.round(rec.mHpLeft) : null) : null,
            vTaken: rec ? (rec.vTaken != null ? Math.round(rec.vTaken) : null) : null,
            mDealt: rec ? (rec.mDealt != null ? Math.round(rec.mDealt) : null) : null,
            allyDealt: rec ? (rec.allyDealt != null ? Math.round(rec.allyDealt) : null) : null,
            allyTaken: rec ? (rec.allyTaken != null ? Math.round(rec.allyTaken) : null) : null,
            allyVid: rec ? (rec.allyVid || null) : null,
            calledHelp: rec ? !!rec.calledHelp : false,
            partySize: rec ? (rec.partySize != null ? (rec.partySize | 0) : null) : null,
            intent: rec ? (rec.intent || null) : null,
            intentWhy: rec ? (rec.intentWhy || null) : null,
            committedFinish: rec ? !!rec.committedFinish : false,
            committedRounds: rec ? (rec.committedRounds | 0) : 0,
            twoblowLastTwo: rec ? (rec.twoblowLastTwo ? rec.twoblowLastTwo.slice() : null) : null,
            twoblowSum: rec ? (rec.twoblowSum != null ? rec.twoblowSum : null) : null,
            twoblowCommitMhp: rec ? (rec.twoblowCommitMhp != null ? rec.twoblowCommitMhp : null) : null,
            twoblowCommitVhpFrac: rec ? (rec.twoblowCommitVhpFrac != null ? rec.twoblowCommitVhpFrac : null) : null,
            twoblowCommitSum: rec ? (rec.twoblowCommitSum != null ? rec.twoblowCommitSum : null) : null,
            fleeHopeless: rec ? (rec.fleeHopeless != null ? !!rec.fleeHopeless : null) : null,
            fleeLearn: rec ? !!rec.fleeLearn : false,
            fleeHpFrac: rec ? (rec.fleeHpFrac != null ? rec.fleeHpFrac : null) : null,
            everWinning: rec ? !!rec.everWinning : false,
            everHopeless: rec ? !!rec.everHopeless : false,
            minHpFrac: rec ? (rec.minHpFrac != null ? rec.minHpFrac : null) : null,
            volley: rec && rec.volley ? { shots: rec.volley.shots | 0, hits: rec.volley.hits | 0, dmg: Math.round(rec.volley.dmg || 0), ammoLeft: rec.volley.ammoLeft != null ? rec.volley.ammoLeft : null } : null,
            roundTotals: rec && rec.roundTotals ? rec.roundTotals.map(t => ({ round: t.round | 0, mDealt: Math.round(t.mDealt || 0), vTaken: Math.round(t.vTaken || 0), allyDealt: Math.round(t.allyDealt || 0) })) : null,
            trickLog: rec && rec.trickLog ? rec.trickLog.slice() : null,
            shoutRound: rec ? (rec.shoutRound != null ? (rec.shoutRound | 0) : null) : null,
            shoutMhp: rec ? (rec.shoutMhp != null ? Math.round(rec.shoutMhp) : null) : null,
            shoutMmax: rec ? (rec.shoutMmax != null ? Math.round(rec.shoutMmax) : null) : null,
            shoutVhp: rec ? (rec.shoutVhp != null ? Math.round(rec.shoutVhp) : null) : null,
            corneredHold: rec ? !!rec.corneredHold : false,
            staredDown: rec ? !!rec.staredDown : false,
            peaceful: rec ? !!rec.peaceful : false,
            redactorQuiet: rec ? (rec.redactorQuiet | 0) : 0,
            judges: rec ? !!rec.judges : false,
            mHpStart: cap.mHpStart, mMaxHp: cap.mMaxHp, mHpAtContact: cap.mHpAtContact, vHpStart: preVhp,
            rangedEqId: preInstrument.rangedEqId, rangedEqName: preInstrument.rangedEqName, ammoAtContact: preInstrument.ammoAtContact,
            meleeEqId: preInstrument.meleeEqId, meleeEqName: preInstrument.meleeEqName, meleeCarriedIds: preInstrument.meleeCarriedIds,
            instrumentErr: preInstrument.instrumentErr || null,
            leadStrikes: leadStrikes, maxStrike: maxStrike, lastTwoParsed: lastTwoParsed, lastTwoParsedSum: lastTwoParsedSum,
            parseTruncated: parsed ? !!parsed.truncated : null, parseDamageSum: parsed ? parsed.damageSum : null,
            optsAllies: preOpts.allies, optsAllyVids: preOpts.allyVids, allyFromStart: preOpts.allyFromStart, noFlee: preOpts.noFlee, cornered: preOpts.cornered,
            log: wave >= 3 && rec && rec.log ? rec.log.slice(0, 200).map(String) : null,
            hasRng: !!(opts && opts.rng),
            caller: classifyCaller(names, !!(opts && opts.rng)),
            stack: names.slice(0, 20).join(','),
          });
        } catch (e) { noteErr(store, 'fieldFight.rec', e); }
        return rec;
      };
      uninstalls.push(() => { try { Game.fieldFight = orig; } catch (e) {} });
    } else noteErr(store, 'fieldFight.missing', new Error('no fieldFight'));
  } catch (e) { noteErr(store, 'fieldFight.wrap', e); }
  // tbEnd (player channel; fighters captured BEFORE delegating).
  try {
    if (typeof Game.tbEnd === 'function') {
      const orig = Game.tbEnd;
      Game.tbEnd = function (result) {
        let pre = null;
        try {
          const f = Game.tbfight;
          if (f && !f.over) {
            const monsterIds = [], villagerIds = [];
            let scholarIn = false;
            for (const fighter of (f.fighters || [])) {
              if (!fighter) continue;
              if (fighter.kind === 'monster' && fighter.monsterId) monsterIds.push(String(fighter.monsterId));
              if (fighter.kind === 'villager' && fighter.villagerId) villagerIds.push(String(fighter.villagerId));
              if (fighter.kind === 'player') scholarIn = true;
            }
            pre = { fight: f, monsterIds, villagerIds, scholarIn, arena: !!(f.coalitionArena || f.arena) };
          }
        } catch (e) { noteErr(store, 'tbEnd.pre', e); pre = null; }
        const r = orig.apply(this, arguments);
        try {
          if (pre && pre.fight.over) {
            pushCapped(store, 'tbFights', { day: dayOf(Game), result: pre.fight.result != null ? String(pre.fight.result) : (result != null ? String(result) : null), monsterIds: pre.monsterIds, villagerIds: pre.villagerIds, scholarIn: pre.scholarIn, arena: pre.arena });
          }
        } catch (e) { noteErr(store, 'tbEnd.rec', e); }
        return r;
      };
      uninstalls.push(() => { try { Game.tbEnd = orig; } catch (e) {} });
    } else noteErr(store, 'tbEnd.missing', new Error('no tbEnd'));
  } catch (e) { noteErr(store, 'tbEnd.wrap', e); }
  // recordWaveKill (ledger choke point; exact per-kill delta).
  try {
    if (typeof Game.recordWaveKill === 'function') {
      const orig = Game.recordWaveKill;
      Game.recordWaveKill = function (monsterId, killerVid, via, detail) {
        let before = null, wave = 1;
        try {
          wave = waveOfDef(Game, monsterId);
          before = (typeof Game.waveLedgerPoints === 'function') ? (Game.waveLedgerPoints(wave) | 0) : null;
        } catch (e) { /* before stays null */ }
        const r = orig.apply(this, arguments);
        try {
          const after = (typeof Game.waveLedgerPoints === 'function') ? (Game.waveLedgerPoints(wave) | 0) : null;
          pushCapped(store, 'killEvents', { day: dayOf(Game), mid: monsterId || null, wave, by: killerVid != null ? String(killerVid) : null, via: via || 'unknown', trick: detail || null, ptsBefore: before, ptsAfter: after, delta: (before != null && after != null) ? (after - before) : null });
        } catch (e) { noteErr(store, 'recordWaveKill.rec', e); }
        return r;
      };
      uninstalls.push(() => { try { Game.recordWaveKill = orig; } catch (e) {} });
    } else noteErr(store, 'recordWaveKill.missing', new Error('no recordWaveKill'));
  } catch (e) { noteErr(store, 'recordWaveKill.wrap', e); }
  // recordPyrrhicKill (second waveKillLog writer, found by vet2):
  // 'lost' TB fights settle kills here; they score NO ledger points.
  try {
    if (typeof Game.recordPyrrhicKill === 'function') {
      const origP = Game.recordPyrrhicKill;
      Game.recordPyrrhicKill = function (monsterId, killerVid, via, detail) {
        const r = origP.apply(this, arguments);
        try {
          pushCapped(store, 'pyrrhicEvents', { day: dayOf(Game), mid: monsterId || null, wave: waveOfDef(Game, monsterId), by: killerVid != null ? String(killerVid) : null, via: via || 'unknown', trick: detail || null, pyrrhic: true, delta: null });
        } catch (e) { noteErr(store, 'recordPyrrhicKill.rec', e); }
        return r;
      };
      uninstalls.push(() => { try { Game.recordPyrrhicKill = origP; } catch (e) {} });
    }
  } catch (e) { noteErr(store, 'recordPyrrhicKill.wrap', e); }
  const uninstall = function () {
    for (let i = uninstalls.length - 1; i >= 0; i--) { try { uninstalls[i](); } catch (e) {} }
    try { Game._spikecontactInstalled = false; } catch (e) {}
  };
  try {
    Game._spikecontactStore = store;
    Game._spikecontactInstalled = true;
    Game._spikecontactUninstall = uninstall;
  } catch (e) { noteErr(store, 'install.flag', e); }
  store.installed = true;
  return uninstall;
}

function withSpikecontactDiag(inner, id, desc, store) {
  const st = store || newStore();
  return Object.assign({}, inner, {
    id, desc, spikecontactStore: st,
    daily(Game, ctx) {
      const r = inner.daily ? inner.daily(Game, ctx) : undefined;
      if (layerOn()) {
        try { installSpikecontactDiag(Game, st); } catch (e) { noteErr(st, 'daily.install', e); }
        try { snapDaily(Game, st); } catch (e) { noteErr(st, 'daily.snap', e); }
      }
      return r;
    },
  });
}

module.exports = {
  layerOn, newStore, installSpikecontactDiag, withSpikecontactDiag, snapDaily,
  copyFaced, copyKillLog, waveOfDef, W3_IDS, MAX_EVENTS,
};
