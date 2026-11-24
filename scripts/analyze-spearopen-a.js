// analyze-spearopen-a.js — analyzer + judge, arm sim-spearopen-a (DIAG).
// SPEAR OPENING DIAGNOSTIC: spears are 15/38 of ranged-at-entry
// fighters but carry 0 ammo (ammosupply-a §3). Question: does the
// spear opening volley ever fire, what does it contribute, and is
// the volley path wrongly demanding ammo for a thrown weapon?
// Single leg (no ctl/arm pair): substrate SENSEEXPED=1 + SPEARGATE=1
// + BOWOPEN=1, band 110601-110608, 8 seeds, 150d, competent verbatim.
// Population: ALL wave-4+ v4encounters rows (every origin, evades
// included — each row records the fighter's ranged kit at entry
// before any fight). The volley itself comes from the fight record
// (rec.volley), never from snapshots.
//
// Opening taxonomy (per ranged-at-entry row, lead fighter):
//   fired               — volley.shots > 0 (the opening loosed)
//   blocked-empty-ammo  — ammo-capable weapon, volley.shots === 0,
//                         ammoAtEntry === 0 (the "no arrows" case;
//                         the dry line should be in row.log)
//   no-volley-path      — weapon def carries NO weapon.ammo (spear /
//                         lance): the fieldFights volley block
//                         (`_w && _ammoId`) is skipped entirely —
//                         rec.volley stays null, no narration
//   held                — volley.shots === 0 with ammo on hand
//                         (CELLGATE searcaster hold; log names it)
//   unattributed        — anything else (volley null on an
//                         ammo-capable weapon, etc.). Counted openly;
//                         attribution completeness = attributed /
//                         engaged ranged rows.
// Evades (outcome 'evade' / 'alreadyDead') never reach the volley
// block — the fighter saw the monster in time and gave it room — so
// they are counted separately as evaded and EXCLUDED from the
// opening denominators (no opening was possible), never silently
// pooled and never counted as unattributed. The ammosupply corpora
// show why: all 5 null-volley ammo-capable rows there are evades.
//
// Attribution completeness is the instrument check: every ranged row
// must land in one of the four attributed classes. The judge (frozen
// prereg §2): pool floor spear carriers >= 10; attribution >= 0.90;
// opening: spear volley fire rate >= 0.50 OR >= 0.80 of not-fired
// spear carriers attributable to the ammo gate (weapon def carries
// no ammo, ammoAtEntry 0 — the code-level block, measured live).
//
// Usage:
//   node scripts/analyze-spearopen-a.js --dir DIR [--out FILE]
//   node scripts/analyze-spearopen-a.js --selftest
'use strict';
const path = require('path');
const fs = require('fs');

const RANK_ORDER = { village: 0, regional: 1, national: 2, global: 3 };
function median(xs) {
  if (!xs.length) return null;
  const s = xs.slice().sort(function (a, b) { return a - b; });
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
function mean(xs) {
  if (!xs.length) return null;
  return xs.reduce(function (a, b) { return a + b; }, 0) / xs.length;
}
function isStarvation(d) {
  return /starvat/i.test(String((d && d.kind) || '')) || /starvat/i.test(String((d && d.cause) || ''));
}

function loadDefs() {
  const defs = {};
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'items.json'), 'utf8'));
    const list = raw.monsters ? [] : raw;
    for (const it of list) if (it && it.id) defs[it.id] = it;
  } catch (e) {}
  return defs;
}
// Weapon class from the live item def (never a hardcoded id list —
// a future spear/lance is classified by what it can fire):
//   spear       — melee type, range > 1 (all five live spears/lance)
//   bow         — ammo 'arrow'; crossbow — 'bolt'; sling — 'stone';
//                 searcaster — 'fusion_cell'
//   other-ranged— type 'ranged' with any other ammo id
//   other-melee — melee type, range <= 1 (should not sit ranged-slot)
//   none        — no ranged weapon at entry
function weaponClass(rid, defs) {
  if (rid == null) return 'none';
  const w = ((defs[rid] || {}).weapon) || null;
  if (!w) return 'other-melee';
  if (w.ammo === 'arrow') return 'bow';
  if (w.ammo === 'bolt') return 'crossbow';
  if (w.ammo === 'stone') return 'sling';
  if (w.ammo === 'fusion_cell') return 'searcaster';
  if (w.ammo) return 'other-ranged';
  if (w.type === 'melee' && (w.range || 1) > 1) return 'spear';
  if (w.type === 'melee') return 'other-melee';
  return 'other-ranged';
}
function ammoCapable(rid, defs) {
  const w = ((defs[rid] || {}).weapon) || null;
  return !!(w && w.ammo);
}
const DRY_RE = /but no (?:\w+ )?(arrows|stones|bolts|fusion cells)/i; // "but no crossbow bolts" carries the weapon word first
function dryLineOf(log) {
  for (const ln of (log || [])) {
    const m = DRY_RE.exec(String(ln));
    if (m) return String(ln).slice(0, 200);
  }
  return null;
}

// classifyOpening(row, defs): the opening taxonomy above. Returns
// { cls, dryLine } where cls is one of fired / blocked-empty-ammo /
// no-volley-path / held / unattributed.
function classifyOpening(r, defs) {
  const vol = (r.volley && typeof r.volley.shots === 'number') ? r.volley : null;
  const dry = dryLineOf(r.log);
  if (vol && vol.shots > 0) return { cls: 'fired', dryLine: dry };
  if (!ammoCapable(r.rangedId, defs)) return { cls: 'no-volley-path', dryLine: dry };
  if (vol && vol.shots === 0 && (r.ammoAtEntry | 0) === 0) return { cls: 'blocked-empty-ammo', dryLine: dry };
  if (vol && vol.shots === 0 && (r.ammoAtEntry | 0) > 0) return { cls: 'held', dryLine: dry };
  return { cls: 'unattributed', dryLine: dry };
}

function spearStats(dir, opts) {
  opts = opts || {};
  const defs = loadDefs();
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(function (f) { return f.endsWith('.json'); }).sort() : [];
  const st = { dir: dir, n: 0, valid: 0, errors: 0,
    bowopenOn: {}, speargateOn: {}, senseexpedOn: {}, fightally2On: {},
    // Gate replication (sim-instrument-a counters, live game code):
    spearSeen: 0, spearPassed: 0, spearSeenFiles: 0, spearPassedRatio: null,
    bowOpen: { alreadyHad: 0, fromStash: 0, fromArmory: 0, crafted: 0, craftedFail: 0, noSource: 0, spearSeen: 0, spearPassed: 0 },
    bowOpenStagedVids: 0, alreadyHadSpear: 0, // bowOpenByVid alreadyHad rows whose itemId is a spear
    // Opening population: ALL wave-4+ encounters, every origin.
    // Evades are counted separately (see classifyOpening header)
    // and excluded from the opening denominators.
    encounters: 0, rangedAll: 0, ranged: 0, spearCarriersAll: 0, spearCarriers: 0, spearShare: null,
    evaded: 0, evadedSpear: 0,
    attributionComplete: 0, attributionCompleteness: null,
    spearFired: 0, spearVolleyFireRate: null,
    spearNotFired: 0, spearAmmoGate: 0, spearAmmoGateShare: null,
    volleyDmgByClass: {}, // class -> { entries, fired, dmg, meanDmg, blocked, noPath, held, dryLines, unattributed }
    byOrigin: {}, // origin -> { ranged, spear }
    byWeapon: {}, // rangedId -> { entries, fired, dmg, blocked, noPath }
    // Allies at entry (secondary: the spear-carrier share among every
    // fighter present, not just the lead).
    alliesPresent: 0, alliesRanged: 0, alliesSpear: 0, alliesSpearShare: null,
    // Contact finish (the spear's only entry contribution).
    contactFinish: { attempted: 0, spearKind: 0, spearDmg: 0, spearKills: 0, otherKind: 0 },
    // Wall numbers (scale-onramp axis).
    days: [], medianDays: null, communityLost: 0, national: 0, seedWins: 0,
    wave4: 0, wave5: 0, scaleRanks: {}, deaths: 0, starvation: 0,
    deathKinds: {} };
  const spearMeetings = [];
  const allRanged = [];
  for (const f of files) {
    let d;
    try { d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch (e) { st.errors++; continue; }
    st.n++;
    if (!d || typeof d !== 'object') { st.errors++; continue; }
    st.valid++;
    st.errors += ((d.instrumentErrors || []).length);
    if (d.bowopenOn != null) st.bowopenOn[String(d.bowopenOn)] = (st.bowopenOn[String(d.bowopenOn)] || 0) + 1;
    if (d.speargateOn != null) st.speargateOn[String(d.speargateOn)] = (st.speargateOn[String(d.speargateOn)] || 0) + 1;
    if (d.senseexpedOn != null) st.senseexpedOn[String(d.senseexpedOn)] = (st.senseexpedOn[String(d.senseexpedOn)] || 0) + 1;
    if (d.fightally2On != null) st.fightally2On[String(d.fightally2On)] = (st.fightally2On[String(d.fightally2On)] || 0) + 1;
    if (d.spearSeen != null) { st.spearSeen += (d.spearSeen | 0); st.spearSeenFiles++; }
    if (d.spearPassed != null) st.spearPassed += (d.spearPassed | 0);
    if (d.bowOpen) {
      for (const k of Object.keys(st.bowOpen)) st.bowOpen[k] += (d.bowOpen[k] | 0);
      st.bowOpenStagedVids += (d.bowOpenStagedVids | 0);
    }
    if (d.bowOpenByVid) {
      for (const vid of Object.keys(d.bowOpenByVid)) {
        const row = d.bowOpenByVid[vid] || {};
        if (row.source === 'alreadyHad' && weaponClass(row.itemId, defs) === 'spear') st.alreadyHadSpear++;
      }
    }
    st.days.push(d.days != null ? d.days : (d.gameDays != null ? d.gameDays : 0));
    if ((RANK_ORDER[d.scaleRank] || 0) >= 2) st.national++;
    if (d.won) st.seedWins++;
    if ((d.maxWave | 0) >= 4) st.wave4++;
    if ((d.maxWave | 0) >= 5) st.wave5++;
    if (['village-lost', 'village-dead', 'pop-zero'].includes(d.endReason)) st.communityLost++;
    st.scaleRanks[d.scaleRank || '?'] = (st.scaleRanks[d.scaleRank || '?'] || 0) + 1;
    for (const death of (d.deaths || [])) {
      st.deaths++;
      if (isStarvation(death)) st.starvation++;
      const k = String((death.kind || death.cause || '?')).slice(0, 40);
      st.deathKinds[k] = (st.deathKinds[k] || 0) + 1;
    }
    for (const r of (d.v4encounters || [])) {
      st.encounters++;
      // Allies at entry (secondary population).
      for (const a of (r.allyKit || [])) {
        st.alliesPresent++;
        if (a.rangedId != null) {
          st.alliesRanged++;
          if (weaponClass(a.rangedId, defs) === 'spear') st.alliesSpear++;
        }
      }
      if (r.rangedId == null) continue;
      const cls = weaponClass(r.rangedId, defs);
      const evaded = r.outcome === 'evade' || r.outcome === 'alreadyDead';
      st.rangedAll++;
      if (cls === 'spear') st.spearCarriersAll++;
      if (!st.volleyDmgByClass[cls]) st.volleyDmgByClass[cls] = { entries: 0, fired: 0, dmg: 0, meanDmg: null, blocked: 0, noPath: 0, held: 0, dryLines: 0, unattributed: 0, evaded: 0 };
      const vc = st.volleyDmgByClass[cls];
      if (evaded) {
        st.evaded++;
        vc.evaded++;
        if (cls === 'spear') st.evadedSpear++;
        continue; // no opening was possible; counted, never unattributed
      }
      vc.entries++;
      st.ranged++;
      const o = r.origin || '?';
      if (!st.byOrigin[o]) st.byOrigin[o] = { ranged: 0, spear: 0 };
      st.byOrigin[o].ranged++;
      if (cls === 'spear') st.byOrigin[o].spear++;
      if (!st.byWeapon[r.rangedId]) st.byWeapon[r.rangedId] = { entries: 0, fired: 0, dmg: 0, blocked: 0, noPath: 0 };
      st.byWeapon[r.rangedId].entries++;
      const op = classifyOpening(r, defs);
      if (op.cls !== 'unattributed') st.attributionComplete++;
      if (op.cls === 'fired') {
        vc.fired++;
        vc.dmg += (r.volley.dmg | 0);
        st.byWeapon[r.rangedId].fired++;
        st.byWeapon[r.rangedId].dmg += (r.volley.dmg | 0);
      } else if (op.cls === 'blocked-empty-ammo') {
        vc.blocked++;
        st.byWeapon[r.rangedId].blocked++;
      } else if (op.cls === 'no-volley-path') {
        vc.noPath++;
        st.byWeapon[r.rangedId].noPath++;
      } else if (op.cls === 'held') {
        vc.held++;
      } else {
        vc.unattributed++;
      }
      if (op.dryLine) vc.dryLines++;
      if (cls === 'spear') {
        st.spearCarriers++;
        if (op.cls === 'fired') st.spearFired++;
        else {
          st.spearNotFired++;
          // The ammo-gate attribution, read from the DEF (not from
          // the classification): the weapon carries no weapon.ammo
          // and the fighter holds 0 of it — the code-level block.
          if (!ammoCapable(r.rangedId, defs) && (r.ammoAtEntry | 0) === 0) st.spearAmmoGate++;
        }
        spearMeetings.push({ seed: d.seed, day: r.day, vid: r.vid, mid: r.mid, wave: r.wave,
          origin: r.origin || null, outcome: r.outcome || null, rounds: r.rounds | 0,
          rangedId: r.rangedId, ammoAtEntry: r.ammoAtEntry | 0,
          volley: r.volley ? { shots: r.volley.shots | 0, hits: r.volley.hits | 0, dmg: r.volley.dmg | 0 } : null,
          opening: op.cls, dryLine: op.dryLine,
          contactFinish: r.contactFinish || null,
          log: (r.log || []).slice(0, 8) });
      }
      allRanged.push({ seed: d.seed, day: r.day, vid: r.vid, mid: r.mid, wave: r.wave,
        origin: r.origin || null, outcome: r.outcome || null, rangedId: r.rangedId,
        weaponClass: cls, ammoAtEntry: r.ammoAtEntry | 0,
        volley: r.volley ? { shots: r.volley.shots | 0, hits: r.volley.hits | 0, dmg: r.volley.dmg | 0 } : null,
        opening: op.cls, dryLine: op.dryLine });
      // Contact finish, any instrument (spear kind is the question).
      if (r.contactFinish && r.contactFinish.attempted) {
        st.contactFinish.attempted++;
        if (r.contactFinish.instrument === 'spear') {
          st.contactFinish.spearKind++;
          st.contactFinish.spearDmg += (r.contactFinish.dmg | 0);
          if (r.contactFinish.kill) st.contactFinish.spearKills++;
        } else st.contactFinish.otherKind++;
      }
    }
  }
  st.spearShare = st.ranged ? st.spearCarriers / st.ranged : null;
  st.attributionCompleteness = st.ranged ? st.attributionComplete / st.ranged : null;
  st.spearVolleyFireRate = st.spearCarriers ? st.spearFired / st.spearCarriers : null;
  st.spearAmmoGateShare = st.spearNotFired ? st.spearAmmoGate / st.spearNotFired : null;
  st.spearPassedRatio = st.spearSeen ? st.spearPassed / st.spearSeen : null;
  st.alliesSpearShare = st.alliesRanged ? st.alliesSpear / st.alliesRanged : null;
  for (const k of Object.keys(st.volleyDmgByClass)) {
    const vc = st.volleyDmgByClass[k];
    vc.meanDmg = vc.fired ? vc.dmg / vc.fired : null;
  }
  st.medianDays = median(st.days);
  st.spearMeetings = spearMeetings;
  st.allRanged = allRanged;
  return st;
}

function judgeSpear(st) {
  const bars = [];
  const poolOk = st.spearCarriers >= 10;
  bars.push({ id: 'pool-floor', pass: poolOk,
    detail: 'spear carriers at entry, ENGAGED (lead, all wave-4+ encounters): ' + st.spearCarriers + ' (floor 10); engaged ranged ' + st.ranged + ' of ' + st.rangedAll + ' ranged-at-entry (' + st.evaded + ' evaded, ' + st.evadedSpear + ' of them spear); spear share ' + (st.spearShare == null ? 'n/a' : st.spearShare.toFixed(3)) });
  const attrOk = st.attributionCompleteness != null && st.attributionCompleteness >= 0.90;
  bars.push({ id: 'attribution-completeness', pass: attrOk,
    detail: 'opening attributed on ' + st.attributionComplete + '/' + st.ranged + ' ranged rows (' + (st.attributionCompleteness == null ? 'n/a' : st.attributionCompleteness.toFixed(3)) + ', bar >= 0.90); unattributed by class ' + JSON.stringify(Object.keys(st.volleyDmgByClass).map(function (k) { return k + ':' + st.volleyDmgByClass[k].unattributed; })) });
  const fireOk = st.spearVolleyFireRate != null && st.spearVolleyFireRate >= 0.50;
  const gateOk = st.spearAmmoGateShare != null && st.spearAmmoGateShare >= 0.80;
  const openingOk = fireOk || gateOk;
  bars.push({ id: 'opening', pass: openingOk,
    detail: 'spear volley fire rate ' + st.spearFired + '/' + st.spearCarriers + ' (' + (st.spearVolleyFireRate == null ? 'n/a' : st.spearVolleyFireRate.toFixed(3)) + ', bar >= 0.50) OR ammo-gate attribution ' + st.spearAmmoGate + '/' + st.spearNotFired + ' of not-fired spear carriers (' + (st.spearAmmoGateShare == null ? 'n/a' : st.spearAmmoGateShare.toFixed(3)) + ', bar >= 0.80)' });
  const errOk = st.errors === 0;
  bars.push({ id: 'instrument-errors', pass: errOk,
    detail: 'instrument errors ' + st.errors + ' across ' + st.valid + '/' + st.n + ' valid per-seed files (bar 0)' });
  let verdict = 'DIAG-NO-GO', kind = '';
  if (!poolOk) { verdict = 'DIAG-NO-GO'; kind = 'THIN-POOL'; }
  else if (!attrOk) { verdict = 'DIAG-NO-GO'; kind = 'ATTRIBUTION'; }
  else if (!openingOk) { verdict = 'DIAG-NO-GO'; kind = 'OPENING-UNEXPLAINED'; }
  else if (!errOk) { verdict = 'DIAG-NO-GO'; kind = 'INSTRUMENT'; }
  else { verdict = 'DIAG-GO'; kind = ''; }
  return { verdict: verdict, kind: kind, bars: bars };
}

function summarize(st) {
  const o = {};
  for (const k of ['dir', 'n', 'valid', 'errors', 'bowopenOn', 'speargateOn', 'senseexpedOn', 'fightally2On',
    'spearSeen', 'spearPassed', 'spearSeenFiles', 'spearPassedRatio',
    'bowOpen', 'bowOpenStagedVids', 'alreadyHadSpear',
    'encounters', 'rangedAll', 'ranged', 'spearCarriersAll', 'spearCarriers', 'spearShare',
    'evaded', 'evadedSpear',
    'attributionComplete', 'attributionCompleteness',
    'spearFired', 'spearVolleyFireRate', 'spearNotFired', 'spearAmmoGate', 'spearAmmoGateShare',
    'volleyDmgByClass', 'byOrigin', 'byWeapon',
    'alliesPresent', 'alliesRanged', 'alliesSpear', 'alliesSpearShare',
    'contactFinish', 'medianDays', 'communityLost', 'national', 'seedWins',
    'wave4', 'wave5', 'scaleRanks', 'deaths', 'starvation', 'deathKinds']) o[k] = st[k];
  return o;
}

function selftest() {
  let passed = 0, failed = 0;
  function check(name, cond, extra) {
    if (cond) passed++;
    else { failed++; console.log('FAIL: ' + name + (extra ? ' — ' + extra : '')); }
  }
  const os = require('os');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'sp-analyze-'));
  const dir = path.join(tmp, 'leg');
  fs.mkdirSync(dir);
  const defs = loadDefs();
  check('live defs classify the five spears/lance as spear',
    ['hunting_spear', 'fire_hardened_spear', 'shard_spear', 'starfall_lance', 'godslayer_spear'].every(function (id) { return weaponClass(id, defs) === 'spear'; }),
    JSON.stringify(['hunting_spear', 'fire_hardened_spear', 'shard_spear', 'starfall_lance', 'godslayer_spear'].map(function (id) { return weaponClass(id, defs); })));
  check('live defs classify bows/crossbow/sling/searcaster by ammo',
    weaponClass('bow', defs) === 'bow' && weaponClass('crude_bow', defs) === 'bow' &&
    weaponClass('crossbow', defs) === 'crossbow' && weaponClass('sling', defs) === 'sling' &&
    weaponClass('searcaster', defs) === 'searcaster',
    [weaponClass('bow', defs), weaponClass('crossbow', defs), weaponClass('sling', defs), weaponClass('searcaster', defs)].join(','));
  check('spears are not ammo-capable; bows are',
    !ammoCapable('hunting_spear', defs) && ammoCapable('bow', defs) && ammoCapable('sling', defs));
  function mkSeed(o) {
    return Object.assign({ seed: 110601, days: 150, gameDays: 150, scaleRank: 'regional', won: false,
      maxWave: 4, endReason: 'survived', instrumentErrors: [], bowopenOn: true, speargateOn: true,
      senseexpedOn: true, fightally2On: true, deaths: [],
      bowOpen: { alreadyHad: 3, fromStash: 0, fromArmory: 0, crafted: 0, craftedFail: 0, noSource: 1, spearSeen: 2, spearPassed: 2 },
      bowOpenStagedVids: 4, spearSeen: 2, spearPassed: 2,
      bowOpenByVid: { v1: { day: 10, source: 'alreadyHad', itemId: 'hunting_spear' }, v2: { day: 12, source: 'alreadyHad', itemId: 'bow' } },
      v4encounters: [] }, o);
  }
  const seed = mkSeed({
    v4encounters: [
      // bow fires: 3 shots, 34 dmg
      { day: 20, vid: 'h1', mid: 'eulogy', wave: 4, origin: 'expedition', outcome: 'vFlee', rounds: 3, mDealt: 120, rangedId: 'bow', ammoAtEntry: 5, volley: { shots: 3, hits: 2, dmg: 34, ammoLeft: 2 }, allyKit: [{ vid: 'c1', rangedId: 'hunting_spear', ammoAtEntry: 0 }], log: ['Holly sees The Eulogy coming and nocks an arrow — the fight opens at range (3 shots).'] },
      // bow blocked, empty quiver, dry line narrated
      { day: 21, vid: 'h1', mid: 'eulogy', wave: 4, origin: 'aid', outcome: 'vFlee', rounds: 2, mDealt: 40, rangedId: 'crude_bow', ammoAtEntry: 0, volley: { shots: 0, hits: 0, dmg: 0, ammoLeft: 0 }, allyKit: [], log: ['Holly has Bow but no arrows — the string stays drawn, useless.'] },
      // spear: volley null, silent skip, contact finish fires (kind spear)
      { day: 22, vid: 'h1', mid: 'audit', wave: 4, origin: 'expedition', outcome: 'vKill', rounds: 0, mDealt: 12, rangedId: 'hunting_spear', ammoAtEntry: 0, volley: null, allyKit: [{ vid: 'c1', rangedId: 'bow', ammoAtEntry: 4 }], contactFinish: { attempted: true, instrument: 'spear', weapon: 'Hunting spear', dmg: 12, kill: true, beastHp: 10 }, log: ['Holly does not let it slip away — they close in and strike with the hunting spear for 12 — The Audit falls. (Contact finish)'] },
      // spear: volley null, no contact finish, world-tick origin
      { day: 23, vid: 'h1', mid: 'reunion', wave: 4, origin: 'world-tick', outcome: 'vFlee', rounds: 4, mDealt: 60, rangedId: 'fire_hardened_spear', ammoAtEntry: 0, volley: null, allyKit: [], log: [] },
      // sling fires
      { day: 24, vid: 'h1', mid: 'suburb', wave: 4, origin: 'expedition', outcome: 'mFlee', rounds: 2, mDealt: 90, rangedId: 'sling', ammoAtEntry: 3, volley: { shots: 2, hits: 2, dmg: 18, ammoLeft: 1 }, allyKit: [], log: [] },
      // searcaster held (CELLGATE): shots 0 with cells on hand
      { day: 25, vid: 'h1', mid: 'audit', wave: 4, origin: 'expedition', outcome: 'vFlee', rounds: 3, mDealt: 30, rangedId: 'searcaster', ammoAtEntry: 2, volley: { shots: 0, hits: 0, dmg: 0, ammoLeft: 2 }, allyKit: [], log: ['Holly holds the Searcaster — the beast is below wave 4, and the cells are saved for harder prey.'] },
      // no ranged kit: not a ranged row
      { day: 26, vid: 'h1', mid: 'eulogy', wave: 4, origin: 'expedition', outcome: 'vDie', rounds: 1, mDealt: 0, rangedId: null, ammoAtEntry: 0, volley: null, allyKit: [], log: [] },
      // unattributed: bow with ammo, volley null (engine anomaly — must stay visible)
      { day: 27, vid: 'h1', mid: 'eulogy', wave: 4, origin: 'patrol', outcome: 'vFlee', rounds: 2, mDealt: 25, rangedId: 'bow', ammoAtEntry: 4, volley: null, allyKit: [], log: [] },
      // evade: bow with ammo, volley null — the meeting never became a
      // fight, so no opening was possible (counted evaded, never
      // unattributed, excluded from the opening denominators)
      { day: 28, vid: 'h1', mid: 'eulogy', wave: 4, origin: 'expedition', outcome: 'evade', rounds: 0, mDealt: 0, rangedId: 'bow', ammoAtEntry: 5, volley: null, allyKit: [], log: ['Holly saw The Eulogy in time and gave it room.'] },
      // crossbow blocked, empty quiver, dry line narrated ("no crossbow bolts" — weapon word first)
      { day: 29, vid: 'h1', mid: 'audit', wave: 4, origin: 'aid', outcome: 'vFlee', rounds: 2, mDealt: 22, rangedId: 'crossbow', ammoAtEntry: 0, volley: { shots: 0, hits: 0, dmg: 0, ammoLeft: 0 }, allyKit: [], log: ['Holly has Crossbow but no crossbow bolts — the crank clicks on nothing.'] },
    ],
  });
  fs.writeFileSync(path.join(dir, 's1.json'), JSON.stringify(seed));
  const st = spearStats(dir);
  check('encounters 10, rangedAll 9, engaged ranged 8 (evade + no-kit excluded)', st.encounters === 10 && st.rangedAll === 9 && st.ranged === 8, JSON.stringify({ e: st.encounters, ra: st.rangedAll, r: st.ranged }));
  check('evaded 1 (the bow evade), evadedSpear 0', st.evaded === 1 && st.evadedSpear === 0, JSON.stringify({ e: st.evaded, s: st.evadedSpear }));
  check('bow evaded count 1, bow entries still 3 engaged', st.volleyDmgByClass.bow.evaded === 1 && st.volleyDmgByClass.bow.entries === 3, JSON.stringify(st.volleyDmgByClass.bow));
  check('crossbow dry line found despite the weapon word ("no crossbow bolts")', st.volleyDmgByClass.crossbow.dryLines === 1 && st.volleyDmgByClass.crossbow.blocked === 1, JSON.stringify(st.volleyDmgByClass.crossbow));
  check('spear carriers 2 of 8 ranged (share 0.25)', st.spearCarriers === 2 && Math.abs(st.spearShare - 2 / 8) < 1e-9, JSON.stringify({ s: st.spearCarriers, sh: st.spearShare }));
  check('attribution 7/8 (the null-volley bow is unattributed)', st.attributionComplete === 7 && Math.abs(st.attributionCompleteness - 7 / 8) < 1e-9, JSON.stringify({ a: st.attributionComplete, c: st.attributionCompleteness }));
  check('spear volley fire rate 0/2', st.spearFired === 0 && st.spearVolleyFireRate === 0, JSON.stringify({ f: st.spearFired, r: st.spearVolleyFireRate }));
  check('spear ammo-gate share 2/2 (both spears lack ammo def, 0 held)', st.spearAmmoGate === 2 && Math.abs(st.spearAmmoGateShare - 1) < 1e-9, JSON.stringify({ g: st.spearAmmoGate, s: st.spearAmmoGateShare }));
  check('bow volley dmg 34 total; sling 18', st.volleyDmgByClass.bow.dmg === 34 && st.volleyDmgByClass.sling.dmg === 18, JSON.stringify(st.volleyDmgByClass));
  check('spear volley dmg 0 (no volley ever fires from a spear)', st.volleyDmgByClass.spear.dmg === 0 && st.volleyDmgByClass.spear.fired === 0 && st.volleyDmgByClass.spear.noPath === 2, JSON.stringify(st.volleyDmgByClass.spear));
  check('blocked-empty-ammo counted on bow (1) with its dry line', st.volleyDmgByClass.bow.blocked === 1 && st.volleyDmgByClass.bow.dryLines === 1, JSON.stringify(st.volleyDmgByClass.bow));
  check('searcaster hold classified held, not blocked', st.volleyDmgByClass.searcaster.held === 1 && st.volleyDmgByClass.searcaster.blocked === 0, JSON.stringify(st.volleyDmgByClass.searcaster));
  check('unattributed counted on bow (1)', st.volleyDmgByClass.bow.unattributed === 1, JSON.stringify(st.volleyDmgByClass.bow));
  check('allies: 2 present, 2 ranged, 1 spear (share 0.5)', st.alliesPresent === 2 && st.alliesRanged === 2 && st.alliesSpear === 1 && Math.abs(st.alliesSpearShare - 0.5) < 1e-9, JSON.stringify({ p: st.alliesPresent, r: st.alliesRanged, s: st.alliesSpear }));
  check('contact finish: 1 attempted, spear kind, 12 dmg, 1 kill', st.contactFinish.attempted === 1 && st.contactFinish.spearKind === 1 && st.contactFinish.spearDmg === 12 && st.contactFinish.spearKills === 1, JSON.stringify(st.contactFinish));
  check('gate replication: spearSeen 2, spearPassed 2, ratio 1.0', st.spearSeen === 2 && st.spearPassed === 2 && Math.abs(st.spearPassedRatio - 1) < 1e-9, JSON.stringify({ s: st.spearSeen, p: st.spearPassed }));
  check('alreadyHad-with-spear cross-check counts 1', st.alreadyHadSpear === 1, 'got ' + st.alreadyHadSpear);
  check('by-origin expedition ranged 4 spear 1; world-tick ranged 1 spear 1', st.byOrigin.expedition.ranged === 4 && st.byOrigin.expedition.spear === 1 && st.byOrigin['world-tick'].ranged === 1 && st.byOrigin['world-tick'].spear === 1, JSON.stringify(st.byOrigin));
  check('spear meetings detail carries opening + contact finish', st.spearMeetings.length === 2 && st.spearMeetings[0].opening === 'no-volley-path' && st.spearMeetings[0].contactFinish && st.spearMeetings[0].contactFinish.kill === true, JSON.stringify(st.spearMeetings[0]));
  // Judge shapes.
  function mk(o) {
    return Object.assign({ spearCarriers: 12, ranged: 40, spearShare: 0.3, attributionComplete: 38, attributionCompleteness: 0.95,
      spearFired: 0, spearVolleyFireRate: 0, spearNotFired: 12, spearAmmoGate: 12, spearAmmoGateShare: 1,
      volleyDmgByClass: { bow: { unattributed: 0 }, spear: { unattributed: 0 } }, errors: 0, valid: 8, n: 8 }, o);
  }
  let j = judgeSpear(mk({}));
  check('judge DIAG-GO via the ammo-gate branch (0 fired, 12/12 gate-attributed)', j.verdict === 'DIAG-GO' && j.bars.every(function (b) { return b.pass; }), JSON.stringify(j));
  j = judgeSpear(mk({ spearFired: 7, spearVolleyFireRate: 7 / 12, spearNotFired: 5, spearAmmoGate: 0, spearAmmoGateShare: 0 }));
  check('judge DIAG-GO via the fire-rate branch (7/12 volleys fire)', j.verdict === 'DIAG-GO' && j.bars[2].pass, JSON.stringify(j.bars));
  j = judgeSpear(mk({ spearCarriers: 6, spearFired: 0, spearNotFired: 6, spearAmmoGate: 6, spearAmmoGateShare: 1 }));
  check('judge DIAG-NO-GO THIN-POOL when spear carriers < 10', j.verdict === 'DIAG-NO-GO' && j.kind === 'THIN-POOL', JSON.stringify(j));
  j = judgeSpear(mk({ attributionComplete: 30, attributionCompleteness: 0.75 }));
  check('judge DIAG-NO-GO ATTRIBUTION when completeness < 0.90', j.verdict === 'DIAG-NO-GO' && j.kind === 'ATTRIBUTION', JSON.stringify(j));
  j = judgeSpear(mk({ spearFired: 2, spearVolleyFireRate: 2 / 12, spearNotFired: 10, spearAmmoGate: 5, spearAmmoGateShare: 0.5 }));
  check('judge DIAG-NO-GO OPENING-UNEXPLAINED when neither branch clears', j.verdict === 'DIAG-NO-GO' && j.kind === 'OPENING-UNEXPLAINED', JSON.stringify(j));
  j = judgeSpear(mk({ errors: 2 }));
  check('judge DIAG-NO-GO when instrument errors > 0', j.verdict === 'DIAG-NO-GO' && !j.bars[3].pass, JSON.stringify(j.bars));
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
  console.log('analyze-spearopen-a --selftest: ' + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.indexOf('--selftest') !== -1) selftest();
  let dir = null, outFile = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--dir') dir = args[++i];
    else if (args[i] === '--out') outFile = args[++i];
  }
  if (!dir) { console.error('usage: analyze-spearopen-a.js --dir DIR [--out FILE] | --selftest'); process.exit(2); }
  const st = spearStats(dir);
  const j = judgeSpear(st);
  const result = { verdict: j.verdict, kind: j.kind, bars: j.bars, summary: summarize(st),
    spearMeetings: st.spearMeetings, allRanged: st.allRanged };
  console.log(JSON.stringify({ verdict: result.verdict, kind: result.kind, bars: result.bars, summary: result.summary }, null, 2));
  if (outFile) fs.writeFileSync(outFile, JSON.stringify(result, null, 2) + '\n');
}
module.exports = { spearStats: spearStats, judgeSpear: judgeSpear, classifyOpening: classifyOpening, weaponClass: weaponClass, ammoCapable: ammoCapable, loadDefs: loadDefs };
