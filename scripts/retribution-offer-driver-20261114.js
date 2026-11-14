// retribution-offer-driver-20261114.js — ability-offer DIAGNOSTIC
// (arm sim-retribution-offer-b, run fleshout-loop-b-20261114T0330Z).
// Finding #2318: the scholar never holds retribution in 16 long sims.
// This driver answers WHY with an instrument, not a fix: it wraps
// (driver-side only — no game-code change) every function that can put
// an ability sheet in front of the scholar, plus the two resolution
// functions, and records every offer with its source, its ids IN ORDER,
// the scholar's state at that moment (slots, held abilities, combat-kit
// depth, track levels, recognised class), and its resolution:
// accepted (id + sheet position + replaced id), declined-by-position
// (another id taken from the same sheet), stalled-full-slots (a
// chooseAbility attempt refused with the sheet still pending),
// kept, trampled (a later setter overwrote the pending sheet), or
// pending-at-end. An offer with no resolution class is an instrument
// failure, never a datum. Villager offers (villagerLevelUpOffers) and
// grants (npcGrantAbility) are wrapped too, and every villager's
// end-state abilities are scanned for retribution.
// Competent policy verbatim, 150d death-aware, steeple band
// 190391-190398 (the finding's observation band). Per-seed JSON to
// evidence/2026-11-14/<OUTDIR>/ (writeRobust, flap-proof,
// refuse-overwrite). EXPECTED_ANCHOR env pins the leg: the guard
// refuses any other HEAD, so a run on any other base can never be
// mislabeled.
// Usage:
//   EXPECTED_ANCHOR=<sha> SEEDS=190391,190392 DAYS=150 RUN=retribution-offer node scripts/retribution-offer-driver-20261114.js
'use strict';
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { execSync } = require('child_process');
const REPO = process.env.REPO || path.join(__dirname, '..');
const { loadGame, setupGame, runDays, quietLog } = require(path.join(REPO, 'scripts', 'sim-harness'));
const { competent } = require(path.join(REPO, 'scripts', 'policies', 'competent'));

const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(function (s) { return parseInt(s.trim(), 10); }) : []).filter(Number.isFinite);
const DAYS = parseInt(process.env.DAYS || '150', 10) || 150;
const RUN = process.env.RUN || 'retribution-offer';
const EXPECTED_ANCHOR = process.env.EXPECTED_ANCHOR || '';

let ANCHOR = 'unknown';
try { ANCHOR = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim(); } catch (e) {}
const policyPath = path.join(REPO, 'scripts', 'policies', 'competent.js');
let POLICY_SHA = 'unknown';
try { POLICY_SHA = crypto.createHash('sha256').update(fs.readFileSync(policyPath, 'utf8')).digest('hex'); } catch (e) {}

function refuseUnlessAnchor() {
  if (EXPECTED_ANCHOR && ANCHOR !== EXPECTED_ANCHOR) {
    console.error('RETRIBUTION-OFFER STOP: HEAD ' + ANCHOR.slice(0, 12) + ' is not the expected anchor ' + EXPECTED_ANCHOR.slice(0, 12) + ' — check out that commit first (see prereg).');
    process.exit(2);
  }
  if (!EXPECTED_ANCHOR) {
    console.error('RETRIBUTION-OFFER STOP: EXPECTED_ANCHOR required — pass the prereg commit SHA.');
    process.exit(2);
  }
}

// FLAP SHAPE (measured 2026-11-12 04:19–04:23Z): clear windows last
// ~1–2s and recur every ~2–3 min. Sample every 250ms for up to 120s.
function sleepMs(ms) {
  try { Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms); }
  catch (e) {
    const t0 = process.hrtime.bigint();
    while (process.hrtime.bigint() - t0 < BigInt(ms) * 1000000n) {}
  }
}
function writeRobust(filePath, data) {
  const tmp = filePath + '.tmp-' + process.pid;
  for (let i = 0; i < 480; i++) {
    try {
      if (fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, data);
        const back = fs.readFileSync(filePath, 'utf8');
        if (back.length !== data.length) throw new Error('readback length mismatch');
        return;
      }
      fs.writeFileSync(tmp, data);
      const back = fs.readFileSync(tmp, 'utf8');
      if (back.length !== data.length) throw new Error('readback length mismatch');
      fs.renameSync(tmp, filePath);
      return;
    } catch (e) {
      if (i === 479) { process.stdout.write('@@FALLBACK ' + filePath + '\n' + data + '\n'); return; }
      sleepMs(250);
    }
  }
}

function gday(Game) { try { return ((Game.state || {}).scholar || {}).day || 0; } catch (e) { return 0; } }
function heldIds(Game) {
  try { return ((Game.state.scholar || {}).abilities || []).map(function (a) { return (a && a.id) || a; }); }
  catch (e) { return []; }
}
function choiceIds(Game) {
  try { return ((Game.state.scholar || {}).abilityChoices || []).map(function (c) { return (c && c.id) || c; }); }
  catch (e) { return []; }
}
function choiceSrcs(Game) {
  try { return ((Game.state.scholar || {}).abilityChoices || []).map(function (c) { return (c && c.src) || null; }); }
  catch (e) { return []; }
}

// installOfferInstrument(Game): wraps the offer setters and the
// resolvers on the live Game object. Returns the instrument handle:
// { offers, villagerOffers, villagerGrants, errors, missing, seq,
//   endState(Game) }. The driver and the proof test share this code,
// so a proof-test GREEN covers the exact wraps the band runs.
function installOfferInstrument(Game) {
  const inst = {
    offers: [], villagerOffers: [], villagerGrants: [],
    errors: [], missing: [], seq: 0, pending: null,
  };
  let combatKit = [];
  try {
    const T = Game.trackData ? Game.trackData() : null;
    combatKit = ((T && T.kits && T.kits.combat) || []);
    if (!combatKit.length) {
      const tracksJson = JSON.parse(fs.readFileSync(path.join(REPO, 'src', 'data', 'tracks.json'), 'utf8'));
      combatKit = (tracksJson.kits || {}).combat || [];
    }
  } catch (e) { inst.errors.push('combat-kit-load: ' + String(e.message).slice(0, 80)); }

  function snapScholar() {
    const s = (Game.state || {}).scholar || {};
    let slots = null;
    try { slots = Game.abilitySlots ? Game.abilitySlots() : null; } catch (e) {}
    const held = heldIds(Game);
    const combatHeld = held.filter(function (id) { return combatKit.indexOf(id) >= 0; });
    let tracks = null;
    try {
      const pt = Game.playerTracks ? Game.playerTracks() : null;
      if (pt) {
        tracks = {};
        for (const k of Object.keys(pt)) tracks[k] = { level: (pt[k] || {}).level || 0, xp: (pt[k] || {}).xp || 0 };
      }
    } catch (e) {}
    let classRec = null;
    try { classRec = Game.godpathClass ? Game.godpathClass('player') : null; } catch (e) {}
    let trackStats = null;
    try { trackStats = Object.assign({}, s.trackStats || {}); } catch (e) {}
    return {
      day: s.day || 0, slots: slots, heldCount: held.length, held: held.slice(),
      combatKitHeld: combatHeld.slice(), combatKitHeldCount: combatHeld.length,
      tracks: tracks, classRec: classRec,
      queueDepth: ((s.levelUpQueue || []).length),
      trackStats: trackStats,
    };
  }

  function recordOffer(source) {
    const ids = choiceIds(Game);
    if (!ids.length) return null;
    const srcs = choiceSrcs(Game);
    const first = ((Game.state.scholar || {}).abilityChoices || [])[0] || {};
    let track = null, level = null;
    const m = String(first.src || '').match(/^level_up:(.+)$/);
    if (m) { track = m[1]; level = first.level != null ? first.level : null; }
    const snap = snapScholar();
    const offer = {
      seq: ++inst.seq, day: snap.day, source: source,
      src: first.src || null, track: track, level: level,
      ids: ids.slice(), retributionPos: ids.indexOf('retribution'),
      slots: snap.slots, heldCount: snap.heldCount,
      combatKitHeldCount: snap.combatKitHeldCount,
      combatKitHeld: snap.combatKitHeld,
      tracks: snap.tracks, classRec: snap.classRec,
      queueDepth: snap.queueDepth, trackStats: snap.trackStats,
      status: 'pending', resolution: null, stallAttempts: [],
    };
    if (inst.pending) {
      inst.pending.status = 'trampled';
      inst.pending.resolution = { by: source, day: snap.day };
    }
    inst.pending = offer;
    inst.offers.push(offer);
    return offer;
  }

  function sameIds(a, b) {
    return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every(function (x, i) { return x === b[i]; });
  }

  function wrapSetter(name, source) {
    if (typeof Game[name] !== 'function') { inst.missing.push(name); return; }
    const orig = Game[name];
    Game[name] = function () {
      let before = null;
      try { before = choiceIds(Game); } catch (e) {}
      let r;
      try { r = orig.apply(this, arguments); }
      catch (e) { inst.errors.push(name + '-throw: ' + String(e.message).slice(0, 80)); throw e; }
      try {
        const after = choiceIds(Game);
        if (after.length && !sameIds(before, after)) recordOffer(source);
      } catch (e) { inst.errors.push(name + '-record: ' + String(e.message).slice(0, 80)); }
      return r;
    };
  }

  // Offer setters (complete set per the prereg code gate: every
  // assignment to scholar.abilityChoices in src/js is one of these).
  wrapSetter('pumpLevelUps', 'level_up');
  wrapSetter('checkSystemArrival', 'arrival');
  wrapSetter('maybeOfferPurify', 'purify');
  wrapSetter('maybeOfferFusionReactor', 'fusion');
  wrapSetter('_cxPrizeAbilityOffer', 'prize');
  wrapSetter('_completeAidQuest', 'aid-quest');

  // Resolution: chooseAbility.
  if (typeof Game.chooseAbility !== 'function') { inst.missing.push('chooseAbility'); }
  else {
    const origChoose = Game.chooseAbility;
    Game.chooseAbility = function (id, replaceId) {
      const sheetBefore = choiceIds(Game);
      const srcBefore = choiceSrcs(Game);
      const heldBefore = heldIds(Game);
      let slotsBefore = null;
      try { slotsBefore = Game.abilitySlots ? Game.abilitySlots() : null; } catch (e) {}
      // Hand the pending offer to this wrapper: origChoose calls
      // pumpLevelUps at the end, and its recordOffer must not trample
      // the sheet being resolved here.
      const pendBefore = inst.pending;
      inst.pending = null;
      let r;
      try { r = origChoose.apply(this, arguments); }
      catch (e) { inst.pending = pendBefore; inst.errors.push('chooseAbility-throw: ' + String(e.message).slice(0, 80)); throw e; }
      try {
        if (!sheetBefore.length) return r; // no sheet: no-op call, nothing to attribute
        const heldAfter = heldIds(Game);
        const sheetAfter = choiceIds(Game);
        const pend = pendBefore && sameIds(pendBefore.ids, sheetBefore) ? pendBefore : null;
        if (heldAfter.indexOf(id) >= 0 && heldBefore.indexOf(id) < 0) {
          // ACCEPTED: the chosen id is newly held.
          const gone = heldBefore.filter(function (h) { return heldAfter.indexOf(h) < 0; });
          const res = {
            id: id, position: sheetBefore.indexOf(id),
            replaced: gone.length ? gone[0] : null,
            slotsFullBefore: slotsBefore != null && heldBefore.length >= slotsBefore,
          };
          if (pend) { pend.status = 'accepted'; pend.resolution = res; if (inst.pending === pend) inst.pending = null; }
          else inst.errors.push('choose-accepted-no-pending-offer: ' + id);
          // Any OTHER offer on the same sheet is declined-by-position:
          // the sheet is gone; record it on the accepted offer.
          if (pend) {
            pend.declinedByPosition = sheetBefore.filter(function (x) { return x !== id; });
          }
        } else if (sheetAfter.length && sameIds(sheetAfter, sheetBefore)) {
          // STALLED: sheet still pending after the attempt.
          const isLevelUp = String(srcBefore[0] || '').indexOf('level_up:') === 0;
          const full = slotsBefore != null && heldBefore.length >= slotsBefore;
          const cls = full ? (isLevelUp ? 'stalled-full-levelup' : 'stalled-full-nonlevelup') : 'stalled-other';
          if (pend) {
            pend.stallAttempts.push({ day: gday(Game), id: id, class: cls });
            // The sheet is still pending: hand the offer back so the
            // next resolution attempt attributes to it.
            if (!inst.pending) inst.pending = pend;
          }
          else inst.errors.push('choose-stalled-no-pending-offer: ' + id);
        } else if (!sheetAfter.length) {
          // Sheet cleared but the id is NOT held: skill-lane teach, or
          // an unattributed clear (instrument failure).
          let isSkill = false;
          try { isSkill = Game.isSkillLane ? !!Game.isSkillLane(id) : false; } catch (e) {}
          if (isSkill) {
            if (pend) { pend.status = 'taught-skill'; pend.resolution = { id: id, position: sheetBefore.indexOf(id) }; if (inst.pending === pend) inst.pending = null; }
          } else {
            inst.errors.push('choose-cleared-without-grant: ' + id + ' sheet=' + sheetBefore.join(','));
            if (pend) { pend.status = 'unattributed'; pend.resolution = { id: id, day: gday(Game) }; if (inst.pending === pend) inst.pending = null; }
          }
        }
      } catch (e) { inst.errors.push('chooseAbility-record: ' + String(e.message).slice(0, 80)); }
      return r;
    };
  }

  // Resolution: keepAbilities.
  if (typeof Game.keepAbilities !== 'function') { inst.missing.push('keepAbilities'); }
  else {
    const origKeep = Game.keepAbilities;
    Game.keepAbilities = function () {
      const sheetBefore = choiceIds(Game);
      // Hand the pending offer to this wrapper (keepAbilities pumps
      // the next level-up internally; see chooseAbility above).
      const pendBefore = inst.pending;
      inst.pending = null;
      let r;
      try { r = origKeep.apply(this, arguments); }
      catch (e) { inst.pending = pendBefore; inst.errors.push('keepAbilities-throw: ' + String(e.message).slice(0, 80)); throw e; }
      try {
        // keepAbilities returns true when it kept the sheet; it pumps
        // the next queued level-up internally, so the choices array may
        // already hold a NEW sheet — resolve on the return value, not
        // on the array being empty.
        if (r === true) {
          const pend = pendBefore && sameIds(pendBefore.ids, sheetBefore) ? pendBefore : null;
          if (pend) {
            pend.status = 'kept';
            pend.resolution = { ids: sheetBefore.slice(), day: gday(Game) };
            if (inst.pending === pend) inst.pending = null;
          } else inst.errors.push('keep-no-pending-offer: ' + sheetBefore.join(','));
        }
      } catch (e) { inst.errors.push('keepAbilities-record: ' + String(e.message).slice(0, 80)); }
      return r;
    };
  }

  // Villager offers: the same kitSheet, resolved by buildScore.
  if (typeof Game.villagerLevelUpOffers !== 'function') { inst.missing.push('villagerLevelUpOffers'); }
  else {
    const origVO = Game.villagerLevelUpOffers;
    Game.villagerLevelUpOffers = function (vid, track, level) {
      let r;
      try { r = origVO.apply(this, arguments); }
      catch (e) { inst.errors.push('villagerLevelUpOffers-throw: ' + String(e.message).slice(0, 80)); throw e; }
      try {
        const ids = (r || []).map(function (d) { return (d && d.id) || d; }).filter(Boolean);
        if (ids.length) inst.villagerOffers.push({ seq: ++inst.seq, day: gday(Game), vid: vid, track: track, level: level, ids: ids, retributionPos: ids.indexOf('retribution') });
      } catch (e) { inst.errors.push('villagerLevelUpOffers-record: ' + String(e.message).slice(0, 80)); }
      return r;
    };
  }

  // Villager grants (incl. direct grants that bypass a sheet).
  if (typeof Game.npcGrantAbility !== 'function') { inst.missing.push('npcGrantAbility'); }
  else {
    const origNG = Game.npcGrantAbility;
    Game.npcGrantAbility = function (vid, id) {
      let r;
      try { r = origNG.apply(this, arguments); }
      catch (e) { inst.errors.push('npcGrantAbility-throw: ' + String(e.message).slice(0, 80)); throw e; }
      try {
        const offeredBefore = inst.villagerOffers.some(function (o) { return o.vid === vid && o.ids.indexOf(id) >= 0; });
        inst.villagerGrants.push({ seq: ++inst.seq, day: gday(Game), vid: vid, id: id, granted: r !== false, offeredBefore: offeredBefore });
      } catch (e) { inst.errors.push('npcGrantAbility-record: ' + String(e.message).slice(0, 80)); }
      return r;
    };
  }

  inst.endState = function () {
    const s = (Game.state || {}).scholar || {};
    const held = heldIds(Game);
    const offeredIds = {};
    for (const o of inst.offers) for (const id of o.ids) offeredIds[id] = true;
    const heldButNeverOffered = held.filter(function (id) { return !offeredIds[id]; });
    // NPC scan: every roster id + every npcAbilities key.
    const village = (Game.state || {}).village || {};
    const npcStore = village.npcAbilities || {};
    const roster = (village.roster || []).slice();
    const vids = Array.from(new Set(roster.concat(Object.keys(npcStore))));
    const npcScan = vids.map(function (vid) {
      const vHeld = (npcStore[vid] || []).slice();
      const vOffered = inst.villagerOffers.filter(function (o) { return o.vid === vid; });
      const vOfferedIds = {};
      for (const o of vOffered) for (const id of o.ids) vOfferedIds[id] = true;
      return {
        vid: vid, held: vHeld, heldCount: vHeld.length,
        retribution: vHeld.indexOf('retribution') >= 0,
        offeredRetribution: !!vOfferedIds.retribution,
        offersReceived: vOffered.length,
        grantsReceived: inst.villagerGrants.filter(function (g) { return g.vid === vid && g.granted; }).length,
      };
    });
    let tracks = null;
    try {
      const pt = Game.playerTracks ? Game.playerTracks() : null;
      if (pt) { tracks = {}; for (const k of Object.keys(pt)) tracks[k] = { level: (pt[k] || {}).level || 0, xp: (pt[k] || {}).xp || 0 }; }
    } catch (e) {}
    let classRec = null;
    try { classRec = Game.godpathClass ? Game.godpathClass('player') : null; } catch (e) {}
    return {
      scholarHeld: held, scholarHeldCount: held.length,
      hasRetribution: held.indexOf('retribution') >= 0,
      heldButNeverOffered: heldButNeverOffered,
      tracks: tracks, classRec: classRec,
      pendingSheet: choiceIds(Game), pendingSheetSrcs: choiceSrcs(Game),
      queueDepth: ((s.levelUpQueue || []).length),
      trackStats: Object.assign({}, s.trackStats || {}),
      npcScanned: npcScan.length, npcScan: npcScan,
      npcRetributionHolders: npcScan.filter(function (v) { return v.retribution; }).map(function (v) { return v.vid; }),
      npcOfferedRetribution: npcScan.filter(function (v) { return v.offeredRetribution; }).map(function (v) { return v.vid; }),
    };
  };

  return inst;
}

async function oneRun(seed) {
  const policy = competent;
  const { Game } = await loadGame({ seed: seed, mode: 'competent-retribution-offer', fullTelemetry: false });
  const inst = installOfferInstrument(Game);
  await setupGame(Game);
  let result = null;
  await quietLog(async function () { result = await runDays(Game, policy, { days: DAYS, manifest: undefined, sampleEvery: 1 }); });

  const st = Game.state || {};
  let scaleRank = null, unlocked = null, standing = null;
  const errors = inst.errors.slice();
  try { scaleRank = Game.scaleRank ? Game.scaleRank() : null; } catch (e) { errors.push('scaleRank: ' + String(e.message).slice(0, 80)); }
  try { unlocked = Game.unlockedWave ? Game.unlockedWave() : null; } catch (e) { errors.push('unlockedWave: ' + String(e.message).slice(0, 80)); }
  try { standing = Game.villageStandingTotal ? Game.villageStandingTotal() : null; } catch (e) {}
  let pantryKcal = 0;
  try { pantryKcal = ((st.village || {}).pantry || []).reduce(function (a, i) { return a + (i.kcalEach || 0) * (i.units || 1); }, 0); } catch (e) {}
  const deaths = ((result && result.samples && result.samples.deaths) || []).map(function (d) {
    return { day: d.day, kind: d.kind || null, who: d.who || null, cause: d.cause || null, player: !!d.player };
  });
  // Close out: any offer still pending at end of run is pending-at-end.
  let end = null;
  try { end = inst.endState(); } catch (e) { errors.push('endState: ' + String(e.message).slice(0, 80)); end = null; }
  const pendingAtEnd = inst.offers.filter(function (o) { return o.status === 'pending'; });
  for (const o of pendingAtEnd) { o.status = 'pending-at-end'; o.resolution = { ids: o.ids.slice(), day: gday(Game) }; }

  return {
    seed: seed, arm: 'retribution-offer', run: RUN,
    anchorCommit: ANCHOR, policySha: POLICY_SHA,
    days: result.days, gameDays: (st.scholar && st.scholar.day) || 0,
    endReason: result.endReason, won: !!Game.won, over: !!Game.over,
    villageLost: !!Game.villageLost, scaleRank: scaleRank,
    maxWave: result.maxWaveUnlocked || 1, unlockedWave: unlocked, standing: standing,
    endPantryKcal: pantryKcal,
    offers: inst.offers, villagerOffers: inst.villagerOffers, villagerGrants: inst.villagerGrants,
    offerCount: inst.offers.length,
    retributionOfferCount: inst.offers.filter(function (o) { return o.retributionPos >= 0; }).length,
    instrumentErrors: errors, instrumentMissing: inst.missing,
    endState: end, deaths: deaths,
    samples: result.samples || null,
  };
}

const outDir = path.join(REPO, 'evidence', '2026-11-14', process.env.OUTDIR || 'perseed-retribution-offer-b');

if (require.main === module) (async function () {
  refuseUnlessAnchor();
  if (!SEEDS.length) { console.error('RETRIBUTION-OFFER STOP: SEEDS required.'); process.exit(2); }
  fs.mkdirSync(outDir, { recursive: true });
  for (const seed of SEEDS) {
    const file = path.join(outDir, 'retribution-offer-s' + seed + '-' + RUN + '.json');
    if (fs.existsSync(file)) { console.error('RETRIBUTION-OFFER STOP: refusing to overwrite ' + file); process.exit(3); }
  }
  for (const seed of SEEDS) {
    const out = await oneRun(seed);
    const file = path.join(outDir, 'retribution-offer-s' + seed + '-' + RUN + '.json');
    writeRobust(file, JSON.stringify(out, null, 2) + '\n');
    const bySource = {};
    for (const o of out.offers) bySource[o.source] = (bySource[o.source] || 0) + 1;
    const byStatus = {};
    for (const o of out.offers) byStatus[o.status] = (byStatus[o.status] || 0) + 1;
    console.log(JSON.stringify({
      seed: out.seed, days: out.days, endReason: out.endReason, won: out.won,
      maxWave: out.maxWave, standing: out.standing, scaleRank: out.scaleRank,
      offers: out.offerCount, retributionOffers: out.retributionOfferCount,
      bySource: bySource, byStatus: byStatus,
      scholarHeld: (out.endState && out.endState.scholarHeldCount) || 0,
      scholarRetribution: !!(out.endState && out.endState.hasRetribution),
      npcScanned: (out.endState && out.endState.npcScanned) || 0,
      npcRetribution: (out.endState && out.endState.npcRetributionHolders) || [],
      deaths: out.deaths.length,
      errors: out.instrumentErrors.length, missing: out.instrumentMissing.length,
      file: path.relative(REPO, file),
    }));
  }
})().catch(function (e) { console.error(e.stack); process.exitCode = 1; });

module.exports = {
  oneRun: oneRun, installOfferInstrument: installOfferInstrument,
  gday: gday, heldIds: heldIds, choiceIds: choiceIds,
};
