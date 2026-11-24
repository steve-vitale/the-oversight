// journey-social-life-r277-20261123.js — LEG 5 SOCIAL LIFE r277 (lane B).
// r277 = r268 driver verbatim EXCEPT: fresh seeds 45845-45848, OUTDIR
// evidence/2026-11-23, filenames r277, + Arm D PANTRY-DAWN snapshot
// (r268 metric review: the outing chain never attempted on r268 —
// pantryPer / live-want / ledger-state per dawn names whether the
// forage_help want gate ever opens under competent play).
// Arm A F5-REASK dawn scan, Arm B dry-fallback fix, Arm C trail
// 3-press driver, and the B6 want-resolution instrument are carried
// verbatim (all wraps are pure reads — no RNG consumed, no state
// mutated). Determinism proof: one seed re-run to a separate OUTDIR,
// JSONs diffed identical before judging.
// and the B6 want-resolution instrument are carried verbatim (both wraps are
// pure reads — no RNG consumed, no state mutated). Determinism proof: one
// seed re-run to a separate OUTDIR, JSONs diffed identical before judging.
// The panel runs on the FIXED code: the r226 F6 dry-opener fix, the r231 C3d
// recap-live fix, the r234 DRY2 fix, the r235 DRY3 fix, the r236 TRAILTALK
// fix, the r237 OUTING-SEEK driver, the r238 repay-fallback fix, AND the
// r256 Arm C gossip-ask fix, the r260 M4 discourse-opener strip, and the
// r262 M12 escalator cap + "You asked me that before" strip are native
// in the base (panel judges the wild
// hold directly, per the r228 precedent).
// PLUS (r256 Arm B, carried verbatim since r260): armTrailTalk presses dlg:forage_talk up to 3 times per
// outing so the trail-talk pool walks 0,1,2 within the outing (r238 metric
// review: the 1-press driver always saw pool[0]); stage pushes record
// lines: [...] with line = first for compat.
// Pre-registration: evidence/2026-11-23/journey-social-life-r277-prereg.md
// Game.confrontDoubt / Game.confrontTheft wrapped (read-only) recording
// {sitting, vid, day, method, outcome} into confrontEvents, so the
// analyzer can count sittings with >=2 'confessed' outcomes
// (double-confession watch, r163 open item 3 — fourth datapoint).
// The r167 (C1) scattering capture is carried: village end records
// scattered / hungryDays / aliveEnd so a scattered-with-people-alive
// ending is confirmed from the record, not by elimination (r159's
// 42703 question).
// r226 (B5) funeral instrument carried: funeralLines + funeralMendStats
// serialized into the evidence JSON — driver-side, read-only.
//   (B) COUNTER-SETTLE EXPERIMENT (r149 finding): the driver settles a
//       pending link counter once per day via Game.answerCounter('accept')
//       (a real player answers the counter through the app.js buttons;
//       the r149 driver never did, so its 9 'counter' returns may be 1
//       fresh stage + 8 blocked re-attempts behind state.pendingCounter).
//       proposeLink wrap records pendingBefore/pendingAfter + raw
//       targetId (r149's vname-on-village-id target names were garbage);
//       answerCounter wrap records every answer; settles + pantry at
//       settle time + pendingCounter at village end are evidence.
//   (C) RECAP-CAP VERIFICATION: driveConversation records recapPresses
//       per transcript + whether 'recap' is offered after the 5th press
//       (convoRecapLine spends the choice out after the 5th PRESS on the
//       r154 fix — press-count-based, not same-line-repeat-based;
//       a 6th press in one conversation = cap failure).
//   (1) bond_proposed LIVE capture via a Game.tele wrap (initiatorKind
//       judged at fire time — succession-proof); (2) M6 second
//       classification per naming-beat line (atHavenGate via
//       playerAtHaven(), radius-1) alongside atHaven (scholarAtHaven(),
//       on-tile); (3) nightly aggregation via the shared r154 helpers
//       module.
//   (j) BOND INSTRUMENT: Game.proposeLink / proposeCovenant / proposeTrade
//       wrapped (driver-side, read-only) to record every bond-proposal call
//       { day, method, target, initiator, result }. r181 CORRECTION: the
//       r141 claim ("any call observed is scholar-initiated") is WRONG on
//       the current base — src/js/bond-initiation.js:840 calls
//       G.proposeLink(pending.villageId) to FORMALIZE an already-staged
//       proposal the scholar accepted, so a call's initiator is the
//       proposal's proposer, not the caller. On the r181 panel all 15
//       calls formalize ACCEPTED villager link proposals (same day +
//       target as the villager's bond_proposed 'accepted' event). The wrap
//       therefore records initiatorKind 'engine' (execution step), and the
//       TRUE scholar-vs-villager split is the bond_proposed tele (1),
//       which judges the initiator at fire time. Scholar name + a bond
//       sample (to see whether the engine records an initiator) are added
//       to the evidence.
// Zero src/js changes in the driver.
//   (g) ARMPLOT WRAP: Game.armPlot wrapped (driver-side, read-only) to record
//       motiveBetween(leader,target) score+reasons, grievanceBetween both ways,
//       each accomplice motive, and trust — AT ARMING (r113 metric review).
//   (h) SIMNPCAMBUSH WRAP: Game.simNpcAmbush wrapped to record every NPC-NPC
//       spring (plotId, leader, target, outcome, caseId) for the escaped-trace.
//   (i) darkSnap cases are a detail list now, not a count.
//   (d) LURE DECISIONS: Game.npcInviteDecision wrapped (driver-side,
//       read-only) to record every party/lure decision with chance,
//       accept, veto, inputs, reasons — the direct sometimes-taken read.
//   (e) DARK SNAPSHOTS at d30/60/90/120/end: betrayalState() grievances,
//       plots (status, inviter/target), invite histories, cases, and
//       grievanceBetween(inviter, target) per live plot.
//   (f) AMBUSH LINES: emit-stream lines matching ambush/spring/trap.
// Pre-registration: evidence/2026-11-08/journey-social-life-r159-prereg.md
// journey-social-life-20261012.js — LEG 5 SOCIAL LIFE (village journey sim loop).
// Plays a full run days 1->140 as a competent SOCIALLY-ENGAGED player:
//   - base survival from policies/competent.js, social layer from
//     policies/socialite.js (talks, feasts, moots, aid cries)
//   - REAL full conversations driven through the natural player path:
//     answer their question -> engage their want -> ask about them/village ->
//     leave via a bye choice (NOT forced endConvo('left')), so openings,
//     middles, AND endings are all sense-tested
//   - full transcripts captured in 5 social contexts for the PEOPLE CHECK:
//     A. day-1 nudge      (talk request fires on day 1 — "Can we talk?")
//     B. first meeting    (stranger, no prior conversation)
//     C. friendship       (trust >= 50 with a villager)
//     D. talk request     (pending v.talkRequests answered when found)
//     E. moot             (a petition moot held — transcript + outcome)
// Output: evidence file scripts/journey-social-life-<seed>.json + census text.
// Usage: node scripts/journey-social-life-20261012.js   (seeds 20261012, 777; DAYCAP=140)
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [45845, 45846, 45847, 45848]);
const DAYCAP = parseInt(process.env.DAYCAP || '140', 10);

const { loadGame, setupGame, runDays } = require('./sim-harness');
const { competent } = require('./policies/competent');
const { socialite } = require('./policies/socialite');
const gc = require('./policies/gossipcensus-diag'); // r141 M6 classifiers (read-only)
const { aggregateNightlyNews, mapTranscriptEntry, pickConversationChoice } = require('./journey-social-r226-helpers');

// R237 OUTING-SEEK bindings (set per seed in oneSeed; the ported chain
// below reads the Game through _G and the narration stream through _CAP).
let _G = null;
let _CAP = null;
const OUTING_SEEK = process.env.OUTING_SEEK !== '0';

const OUTDIR = process.env.OUTDIR ? path.resolve(process.env.OUTDIR) : path.join(ROOT, 'evidence', '2026-11-23');
function vname(Game, vid) { try { return Game.displayName(vid) || String(vid); } catch (e) { return String(vid); } }
function trustOf(Game, vid) {
  try { const t = (Game.state.village.trust || {})[vid]; return t === undefined ? 10 : t; } catch (e) { return 10; }
}

// --- natural-path conversation driver (sense-testing: the full arc) ---
// r181 (B1): sitting stamp for the confront wraps — talkOne sets it
// before each driven conversation and clears it after; a confront fired
// outside a driven conversation records sitting null.
let sittingSeq = 0;
let currentSitting = null;
// Returns { vid, turns, naturalEnd, transcript[], endTrust }.
function driveConversation(Game, vid, tag, maxTurns, log) {
  const out = { vid, tag, turns: 0, naturalEnd: false, forcedClose: false, transcript: [], recapPresses: 0, recapOfferedAfterCap: false };
  try { Game.startConvo(vid); } catch (e) { out.error = 'startConvo: ' + e.message; return out; }
  const snap = () => {
    let c = null;
    try { c = Game.convoGet(vid); } catch (e) {}
    return c;
  };
  out.offered = []; // choice ids offered each turn (evidence of bye availability)
  for (let t = 0; t < (maxTurns || 12); t++) {
    const c = snap();
    if (!c) { out.error = 'convoGet null at turn ' + t; break; }
    if (!c.active) {
      // the budget winddown closed the conversation — that IS the natural end
      out.naturalEnd = true;
      out.turns = t;
      out.transcript = (c.transcript || []).map(mapTranscriptEntry);
      break;
    }
    let choices = [];
    try { choices = Game.convoChoices(vid) || []; } catch (e) {}
    if (!choices.length) {
      // menu empty while still active (shouldn't happen) — treat as end
      out.naturalEnd = true;
      out.transcript = (c.transcript || []).map(mapTranscriptEntry);
      break;
    }
    const ids = choices.map(x => String((x && x.id) || '')).slice(0, 10);
    out.offered.push(ids);
    // r154 (C) RECAP-CAP VERIFICATION: convoRecapLine spends 'recap' out
    // after the 5th press (convoSpendChoice). If 'recap' is offered on a
    // turn after 5 presses already happened, the cap did not fire.
    if (out.recapPresses >= 5 && ids.indexOf('recap') !== -1) out.recapOfferedAfterCap = true;
    const lastNPC = (c.transcript || []).filter(e => e.who !== 'you').slice(-1)[0];
    // r277 Arm A: pick priority lives in pickConversationChoice (helpers) —
    // same order as the inline picks it replaces, plus the commit rule:
    // press dlg:commit when offered on a joint-outing favor (forage_help /
    // water_haul), after answering questions and hearing the ask. The old
    // inline policy had no commit rule, so the favor menu's first choice
    // (favor_requirements, never spent) was pressed forever and no outing
    // was ever promised (r268: 0 attempts; r277 probe: 198 offers, 0 presses).
    const favorKind = c.want && c.want.favor ? c.want.favor.kind : null;
    const pick = pickConversationChoice(choices, {
      lastNPCText: lastNPC ? String(lastNPC.text || '') : '',
      favorKind,
    });
    if (!pick) { out.forcedClose = true; break; }
    if (/^(leave|bye|goodbye)/.test(String(pick.id || ''))) out.leftViaBye = true;
    // r154 (C): count 'recap' presses — a 6th press in one conversation
    // means the convoSpendChoice cap did not fire.
    if (String(pick.id || '') === 'recap') out.recapPresses++;
    try { Game.convoTurn(vid, pick.id); } catch (e) { out.error = 'convoTurn: ' + e.message; break; }
    out.turns++;
  }
  if (!out.naturalEnd) {
    // exhausted turns without close — snapshot what we have, close via bye if possible
    const c = snap();
    if (c) out.transcript = (c.transcript || []).map(mapTranscriptEntry);
    try {
      const choices = Game.convoChoices(vid) || [];
      const bye = choices.find(x => x && /^(leave|bye|goodbye)/.test(String(x.id || '')));
      if (bye) Game.convoTurn(vid, bye.id);
      else Game.endConvo(vid, 'left');
      out.forcedClose = true;
    } catch (e) {}
  }
  out.endTrust = trustOf(Game, vid);
  if (log) log.push(out);
  return out;
}

// POLICY env: journey (socialite base + real conversations) | socialite | competent
const POLICY = process.env.POLICY || 'journey';

// --- policy: socialite + real conversations in daily ---
function makePolicy(Game, ctxShared) {
  ctxShared.mootNotes = [];
  ctxShared.talkReqSeen = {};
  const base = POLICY === 'competent' ? competent : socialite;
  const pol = Object.assign({}, base, {
    id: 'journey-social-' + POLICY,
    setup(Game2, ctx) { ctxShared.ctx = ctx; },
    // R237 OUTING-SEEK: dawn upkeep hook (r62 pattern) — the chain runs
    // before the day's social play so a promised outing departs at dawn.
    upkeep(Game2, ctx) {
      try { if (base.upkeep) base.upkeep(Game2, ctx); } catch (e) {}
      try { pantryDawnArm(Game2, ctxShared); } catch (e) { (ctxShared.pantryDawnErrors = ctxShared.pantryDawnErrors || []).push({ day: (Game2.state.scholar || {}).day || 0, err: String(e && e.message) }); }
      try { outingDawnArm(ctxShared); } catch (e) { (ctxShared.outingArmErrors = ctxShared.outingArmErrors || []).push({ day: (Game2.state.scholar || {}).day || 0, err: String(e && e.message) }); }
      // r277 Arm A (F5-REASK, moved from end-of-day to DAWN): r266 proved
      // the end-of-day scan structurally cannot catch the window — a seed
      // whose favor settles is consumed by the first sitting that opens on
      // it the same day. Scanning at dawn, before ANY sitting opens, is the
      // interception point: a seed on a favor that settled yesterday is
      // visible and visitable before the day's social play consumes it.
      try { f5ReaskArm(Game2, ctxShared); } catch (e) { (ctxShared.f5reaskErrors = ctxShared.f5reaskErrors || []).push({ day: (Game2.state.scholar || {}).day || 0, err: String(e && e.message) }); }
    },
    daily(Game2, ctx) {
      if (POLICY === 'journey') socialite.daily(Game2, ctx); // includes competent.daily + social talks/feasts/moots/aid
      else if (base.daily) base.daily(Game2, ctx);
      ctx.socialTranscripts = ctx.socialTranscripts || [];
      const vv = Game2.state.village || {};
      const roster = (vv.roster || []).filter(id => id !== Game2.villagerId);
      const day = (Game2.state.scholar || {}).day || 0;
      const talked = new Set();
      const talkOne = (vid, tag) => {
        if (!vid || talked.has(vid)) return;
        talked.add(vid);
        const before = trustOf(Game2, vid);
        // r181 (B1): stamp the sitting so the confront wraps can attribute
        // confessions to this conversation.
        currentSitting = { seq: ++sittingSeq, vid, tag };
        let rec;
        try { rec = driveConversation(Game2, vid, tag, 12, ctx.socialTranscripts); } finally { currentSitting = null; }
        rec.day = day; rec.trustBefore = before;
        ctx.socialConvs = (ctx.socialConvs || 0) + 1;
        if (rec.naturalEnd) ctx.socialNaturalEnds = (ctx.socialNaturalEnds || 0) + 1;
        if (rec.forcedClose) ctx.socialForced = (ctx.socialForced || 0) + 1;
        ctx.lastDay = day;
      };
      // A. day-1 nudge: answer the villager who asked "Can we talk?"
      if (day <= 2) {
        const reqs = vv.talkRequests || {};
        for (const vid of Object.keys(reqs)) { talkOne(vid, 'A-day1-nudge'); break; }
      }
      // D. pending talk requests answered first (they came to YOU)
      try {
        const reqs = vv.talkRequests || {};
        for (const vid of Object.keys(reqs)) { talkOne(vid, 'D-talk-request'); break; }
      } catch (e) {}
      // B. first meeting: someone with no recorded conversation history
      try {
        const fresh = roster.find(vid => {
          try {
            const c = Game2.convoGet(vid);
            return c && !(c.transcript || []).length && !(ctx.metSet || {}).has(vid);
          } catch (e) { return false; }
        });
        if (fresh && Math.random() < 0.6) talkOne(fresh, 'B-first-meeting');
      } catch (e) {}
      // C. friendship: someone at trust>=50 gets a real visit every few days
      try {
        if (day % 3 === 0) {
          const pals = roster.filter(vid => trustOf(Game2, vid) >= 50 && !talked.has(vid));
          if (pals.length) talkOne(pals[Math.floor(Math.random() * pals.length)], 'C-friendship');
        }
      } catch (e) {}
      // one random villager each day keeps the village warmed (the socialite talk)
      try {
        const rest = roster.filter(vid => !talked.has(vid));
        if (rest.length) {
          const vid = rest[Math.floor(Math.random() * rest.length)];
          try {
            Game2.talkTo(vid);
            const choices = Game2.convoChoices(vid) || [];
            const agency = choices.find(x => x && String(x.id || '').indexOf('agency:') === 0);
            if (agency && Game2.convoTurn) { try { Game2.convoTurn(vid, agency.id); } catch (e) {} }
            ctx.socialTalks = (ctx.socialTalks || 0) + 1;
          } catch (e) {}
          try { Game2.endConvo(vid, 'left'); } catch (e2) {}
        }
      } catch (e) {}
      // moot note (socialite.daily already conducted+answered; record what fired)
      try {
        const pet = Game2.state ? Game2.state.pendingPetition : null;
        if (pet && pet.id && !(ctx._mootSeen || {})[pet.id]) {
          ctx._mootSeen = ctx._mootSeen || {};
          ctx._mootSeen[pet.id] = 1;
          ctxShared.mootNotes.push({ day, petition: pet.id || pet.kind || '?', moots: ctx.socialMoots || 0 });
        }
      } catch (e) {}
      // record the talkRequests we never got to (are NPCs being heard?)
      try {
        ctxShared.talkReqSeen = ctxShared.talkReqSeen || {};
        for (const vid of Object.keys(vv.talkRequests || {})) ctxShared.talkReqSeen[vid] = (ctxShared.talkReqSeen[vid] || 0) + 1;
      } catch (e) {}
      // met set for B
      ctx.metSet = ctx.metSet || new Set();
      for (const v of roster) { try { const c = Game2.convoGet(v); if (c && (c.transcript || []).length) ctx.metSet.add(v); } catch (e) {} }
    },
  });
  return pol;
}


// --- r277 Arm D: PANTRY-DAWN snapshot (read-only) ---
// r268's outing chain never attempted (0/4 seeds) and its trail press
// never fired. The forage_help want gates on pantryPer < 4000
// (convo-wants.js FAVOR_NEED_GATE, belief-gated via
// convoFavorNeedReadings). This snapshot records, at each dawn before
// any social play: pantry kcal + roster size + pantryPer, how many
// roster villagers have the forage_help / water_haul want LIVE right
// now (pure convoFavorNeedPresent reads), and the favorLedger's
// forage_help / water_haul entries by state. It names whether the
// outing chain starves at the want gate under competent play.
function pantryDawnArm(Game2, ctxShared) {
  const rec = ctxShared.pantryDawn = ctxShared.pantryDawn || [];
  const day = (Game2.state.scholar || {}).day || 0;
  const vv = Game2.state.village || {};
  const roster = (vv.roster || []).filter(id => id !== Game2.villagerId);
  let kcal = null;
  try { kcal = (typeof Game2.pantryKcalLive === 'function') ? Game2.pantryKcalLive(vv) : (vv.pantryKcal || 0); } catch (e) {}
  const rosterN = roster.length || 1;
  const pantryPer = (typeof kcal === 'number' && rosterN > 0) ? Math.round(kcal / rosterN) : null;
  let liveForage = 0, liveWater = 0;
  for (const vid of roster) {
    try { if (Game2.convoFavorNeedPresent('forage_help', vid)) liveForage++; } catch (e) {}
    try { if (Game2.convoFavorNeedPresent('water_haul', vid)) liveWater++; } catch (e) {}
  }
  const ledger = {};
  try {
    for (const f of Object.values(vv.favorLedger || {})) {
      if (!f || (f.kind !== 'forage_help' && f.kind !== 'water_haul')) continue;
      ledger[f.kind] = ledger[f.kind] || {};
      ledger[f.kind][f.state || '?'] = (ledger[f.kind][f.state || '?'] || 0) + 1;
    }
  } catch (e) {}
  rec.push({ day, kcal, rosterN, pantryPer, liveForage, liveWater, ledger });
}

// --- r277 Arm A: F5-REASK — stage the settled-favor re-ask in the wild ---
// The settled re-ask branch (conversation.js:7367) fires only when the
// sitting's want is ask_favor AND its favor is already settled — but
// ask_favor.pick returns 0 without a LIVE need, so the only route back is
// a seed planted while the favor was 'asked' that settles before the next
// sitting (convo-wants.js resolve + convoSelectWant seed branch). This arm
// scans daily for exactly that state and visits (max 2/day): open a
// sitting, record c.want.id, press the OFFERED want choice
// (alive:want:<wantId> — never a direct turn call when the menu does not
// offer it), record the served line + variant by the F5W shape cores.
// convoCheckSeeds is pure except deleting already-expired (>7d) seeds, so
// the daily scan cannot destroy a live seed. Opening a sitting resolves
// its want on close like any player visit (seed consumed) — the arm's
// visit IS the seed's one chance, which is itself part of the diagnosis.
const F5_SETTLED = new Set(['moot', 'thanked', 'acknowledged', 'fulfilled']);
function f5wVariant(text) {
  if (!text) return null;
  if (text.indexOf('Finished. Thank you for checking') !== -1) return 'V3';
  if (text.toLowerCase().indexOf('taken care of, i swear') !== -1) return 'V2';
  if (text.indexOf("it's handled") !== -1 && text.indexOf('Thanks for asking') !== -1) return 'V1';
  return null;
}
function f5ReaskArm(Game2, ctxShared) {
  const rec = ctxShared.f5reask = ctxShared.f5reask || { scanned: 0, seedsAskFavor: 0, seedsOnSettled: 0, sittings: 0, wantWasAskFavor: 0, wantChoiceOffered: 0, reasks: 0, variants: { V1: 0, V2: 0, V3: 0, other: 0 }, dry: 0, attempts: [], funnel: {} };
  const day = (Game2.state.scholar || {}).day || 0;
  const vv = Game2.state.village || {};
  const roster = (vv.roster || []).filter(id => id !== Game2.villagerId);
  let visited = 0;
  for (const vid of roster) {
    if (visited >= 2) break;
    let seed = null, favor = null;
    try { seed = Game2.convoCheckSeeds(vid); } catch (e) {}
    try { favor = Game2.convoGetFavor(vid); } catch (e) {}
    rec.scanned++;
    if (!seed || seed.wantId !== 'ask_favor') continue;
    rec.seedsAskFavor++;
    const fstate = (favor && favor.state) || null;
    const fkey = vid + '|' + (seed.favorId || 'none');
    const fentry = rec.funnel[fkey] = rec.funnel[fkey] || { vid: vname(Game2, vid), seedFavorId: seed.favorId || null, favorShort: (favor && favor.short) || null, firstDay: day, firstState: fstate, lastState: fstate, lastDay: day, attempted: false };
    fentry.lastState = fstate; fentry.lastDay = day;
    if (!favor || !F5_SETTLED.has(fstate)) continue;
    if (!favor.short || !/ /.test(favor.short)) continue; // named pool only; shortless favors speak generic
    rec.seedsOnSettled++;
    visited++;
    fentry.attempted = true;
    const attempt = { day, vid: vname(Game2, vid), favorState: fstate, favorShort: favor.short, wantId: null, choicePressed: null, served: null, variant: null, dry: false, note: null };
    rec.attempts.push(attempt);
    try {
      Game2.startConvo(vid);
      const c = Game2.convoGet(vid);
      if (!c || !c.active) { attempt.note = 'sitting did not open'; try { Game2.endConvo(vid, 'left'); } catch (e) {} continue; }
      attempt.wantId = (c.want && c.want.id) || null;
      if (attempt.wantId === 'ask_favor') rec.wantWasAskFavor++;
      rec.sittings++;
      const before = (c.transcript || []).length;
      const choices = Game2.convoChoices(vid) || [];
      const wantChoice = choices.find(x => x && String(x.id || '').indexOf('alive:want:') === 0);
      if (!wantChoice) { attempt.note = 'want choice not offered'; try { Game2.endConvo(vid, 'left'); } catch (e) {} continue; }
      rec.wantChoiceOffered++;
      attempt.choicePressed = wantChoice.id;
      try { Game2.convoTurn(vid, wantChoice.id); } catch (e) { attempt.note = 'convoTurn: ' + (e && e.message); }
      const tr = (Game2.convoGet(vid) || {}).transcript || [];
      const lines = tr.slice(before).filter(e => e && e.who === 'them').map(e => String(e.text || ''));
      attempt.served = lines.join(' ');
      if (attempt.served.indexOf('lost my train of thought') !== -1) { attempt.dry = true; rec.dry++; }
      attempt.variant = f5wVariant(attempt.served);
      if (attempt.variant) { rec.variants[attempt.variant]++; rec.reasks++; }
      else rec.variants.other++;
      try { const ch2 = Game2.convoChoices(vid) || []; const bye = ch2.find(x => x && /^(leave|bye|goodbye)/.test(String(x.id || ''))); if (bye) Game2.convoTurn(vid, bye.id); else Game2.endConvo(vid, 'left'); } catch (e) { try { Game2.endConvo(vid, 'left'); } catch (e2) {} }
    } catch (e) { attempt.note = 'arm error: ' + (e && e.message); }
  }
}


// --- r110: bond snapshot (trust + relationship channels, read-only) ---
function bondSnap(Game2) {
  const vv = Game2.state.village || {};
  const snap = { day: (Game2.state.scholar || {}).day || 0, alive: (vv.roster || []).length };
  try {
    snap.trust = (vv.roster || []).map(vid => ({ who: vname(Game2, vid), trust: trustOf(Game2, vid) })).sort((a, b) => b.trust - a.trust);
  } catch (e) { snap.trust = []; }
  try { snap.bonds = Object.keys(vv.bonds || {}).length; } catch (e) { snap.bonds = -1; }
  try { snap.conflicts = Object.keys(vv.conflicts || {}).length; } catch (e) { snap.conflicts = -1; }
  try { snap.grievances = Object.keys(vv.grievances || {}).length; } catch (e) { snap.grievances = -1; }
  try { snap.groups = Object.keys(vv.groups || {}).length; } catch (e) { snap.groups = -1; }
  try { snap.friends50 = snap.trust.filter(t => t.trust >= 50).length; } catch (e) { snap.friends50 = -1; }
  return snap;
}

// --- r112: dark snapshot (betrayal state, read-only) ---
function darkSnap(Game2) {
  const snap = { day: (Game2.state.scholar || {}).day || 0 };
  try {
    const bs = (Game2.betrayalState && Game2.betrayalState()) || {};
    snap.grievances = (bs.grievances || []).map(g => ({
      by: vname(Game2, g.by), against: vname(Game2, g.against),
      kind: g.kind, severity: g.severity, day: g.day,
    }));
    snap.plots = (bs.plots || []).map(p => {
      let gb = null, gtl = null, gti = null, gat = null;
      try { gb = (Game2.grievanceBetween && Game2.grievanceBetween(p.inviter, p.target)); } catch (e) {}
      try { gtl = (Game2.grievanceBetween && Game2.grievanceBetween(p.target, p.leader)); } catch (e) {}
      try { gti = (Game2.grievanceBetween && Game2.grievanceBetween(p.target, p.inviter)); } catch (e) {}
      try {
        const acc = p.accomplices || [];
        const vals = acc.map(a => { try { return Game2.grievanceBetween(a, p.target); } catch (e) { return null; } }).filter(v => v !== null);
        gat = vals.length ? Math.max(...vals) : null;
      } catch (e) {}
      return {
        id: p.id, leader: vname(Game2, p.leader), inviter: vname(Game2, p.inviter),
        target: vname(Game2, p.target),
        accomplices: (p.accomplices || []).map(a => vname(Game2, a)),
        day: p.day, active: !!p.active, sprung: !!p.sprung, resolved: !!p.resolved,
        expired: !!p.expired, grievanceInviterToTarget: gb,
        grievanceTargetToLeader: gtl, grievanceTargetToInviter: gti,
        grievanceAccompliceToTargetMax: gat,
      };
    });
    snap.invites = Object.keys(bs.invites || {}).map(vid => {
      const h = bs.invites[vid] || {};
      return { who: vname(Game2, vid), count: h.count || 0, accepted: h.accepted || 0,
        outcomes: (h.outcomes || []).slice(-6), pending: h.pending ? { defId: h.pending.defId, day: h.pending.day, plotId: h.pending.plotId || null } : null };
    });
    snap.casesCount = (bs.cases || []).length;
    snap.cases = (bs.cases || []).map(c => ({
      id: c.id, plotId: c.plotId, charge: c.charge, day: c.day,
      target: vname(Game2, c.target),
      accused: (c.accused || []).map(a => vname(Game2, a)),
      status: c.status, knownToPlayer: !!c.knownToPlayer, playerHeardDay: c.playerHeardDay || null,
      playerRole: c.playerRole || null,
    }));
  } catch (e) { snap.error = 'darkSnap: ' + e.message; }
  return snap;
}

// --- plain-words census ---
function census(Game, seed) {
  const lines = [];
  const vv = Game.state.village || {};
  const roster = vv.roster || [];
  const day = (Game.state.scholar || {}).day || 0;
  lines.push(`seed ${seed}, day ${day}, alive ${roster.length}`);
  for (const vid of roster) {
    let p = {}, name = vname(Game, vid);
    try { p = Game.getPerson(vid) || {}; } catch (e) {}
    const t = trustOf(Game, vid);
    let mood = '?';
    try { mood = Game.convoMoodBand ? Game.convoMoodBand(vid) : '?'; } catch (e) {}
    const ab = ((vv.npcAbilities || {})[vid] || []).length;
    lines.push(`- ${name} (${p.occupationId || p.formerOccupation || 'no occ'}, ${p.origin || '?'}) trust=${t} mood=${mood} npcAbilities=${ab}`);
  }
  const fallen = vv.fallen || [];
  lines.push(`fallen: ${fallen.length}`);
  for (const f of fallen.slice(0, 12)) {
    let nm = '?'; try { nm = vname(Game, f.villagerId); } catch (e) {}
    lines.push(`- ${nm} d${f.day}: ${f.cause || '?'}`);
  }
  lines.push(`codex plants: ${Object.keys((Game.state.codex || {}).plants || {}).length}`);
  lines.push(`pantry kcal: ${Math.round((vv.pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0))}`);
  return lines;
}


// ---- R237 OUTING-SEEK (ported from journey-deepening-r62-20261028.js) ----
// The social driver never walked a joint forage outing out: asks happen,
// outings start, but the pair never leaves Haven, so trail talk never
// fires (r236: 0 trail-talk lines on all 4 seeds). This chain runs at
// dawn upkeep (OUTING_SEEK=1, default on): readiness -> position adjacent
// -> depart through the menu -> travel to stocked green -> joint presses
// -> ONE trail-talk press -> travel home -> unload. Every stage is
// recorded in ctx.outingArm; a blocked stage names its blocker.
// The r62 chain is copied verbatim except: _G/_CAP are module-level
// bindings set per seed in oneSeed, vname takes the Game arg, and the
// trail-talk stage + helper are new (r239).
function gday() { try { return (_G.state && _G.state.scholar && _G.state.scholar.day) || 0; } catch (e) { return 0; } }
function homePoint() {
  try {
    const v = _G.state.village;
    if (Number.isFinite(v.px) && Number.isFinite(v.py)) return { x: v.px, y: v.py };
    const tiles = _G.map.tiles || [];
    for (let y = 0; y < tiles.length; y++) for (let x = 0; x < tiles[y].length; x++) if (tiles[y][x].type === 'haven') return { x, y };
  } catch (e) {}
  return { x: 4, y: 4 };
}
function armConvoAction(vid) {
  const path = [];
  try {
    const r0 = _G.startConvo(vid);
    if (!r0) return { ok: false, blocker: 'convo-null', path };
    let r = r0;
    for (let turn = 0; turn < 6; turn++) {
      let choices = (r.choices && r.choices.length) ? r.choices : null;
      if (!choices) { try { choices = _G.convoChoices(vid); } catch (e) { choices = []; } }
      const ids = (choices || []).map(x => x && x.id).filter(Boolean);
      path.push(ids);
      const act = (choices || []).find(x => x && x.id === 'dlg:favor_action');
      if (act) {
        r = _G.convoTurn(vid, 'dlg:favor_action');
        const line = (r && r.line) || null;
        try { _G.endConvo(vid, 'done'); } catch (e) {}
        return { ok: true, line, offered: ids, path };
      }
      const more = (choices || []).find(x => x && x.id === 'dlg:more');
      if (more) { r = _G.convoTurn(vid, 'dlg:more'); if (r && r.ended) break; continue; }
      break;
    }
    try { _G.endConvo(vid, 'done'); } catch (e) {}
    return { ok: false, blocker: 'favor_action-not-offered', offered: path[path.length - 1] || [], path };
  } catch (e) { try { _G.endConvo(vid, 'done'); } catch (e2) {} return { ok: false, blocker: 'convo-error', err: String(e && e.message), path }; }
}

function armTrailTalk(vid) {
  // R256 (Arm B, r238 metric review): press dlg:forage_talk up to 3 times
  // per outing, so the trail-talk pool walks 0,1,2 within the outing (the
  // 1-press driver always saw pool[0]; r237's stranded outing proved
  // repeated presses walk the pool). Failure to talk never blocks the
  // outing — it is recorded, not fatal. lines[] holds every pressed line;
  // line = lines[0] for compat with the r237/r239 stage shape.
  try {
    const r0 = _G.startConvo(vid);
    if (!r0) return { ok: false, blocker: 'convo-null' };
    let r = r0;
    const lines = [];
    let pressed = 0;
    for (let turn = 0; turn < 9; turn++) {
      let choices = (r.choices && r.choices.length) ? r.choices : null;
      if (!choices) { try { choices = _G.convoChoices(vid); } catch (e) { choices = []; } }
      const talk = (choices || []).find(x => x && x.id === 'dlg:forage_talk');
      if (talk) {
        r = _G.convoTurn(vid, 'dlg:forage_talk');
        const line = (r && r.line) || null;
        if (line) lines.push(line);
        pressed++;
        if (pressed >= 3) break;
        if (r && r.ended) break;
        continue;
      }
      const more = (choices || []).find(x => x && x.id === 'dlg:more');
      if (more) { r = _G.convoTurn(vid, 'dlg:more'); if (r && r.ended) break; continue; }
      break;
    }
    let transcript = null;
    try { const c = _G.convoGet(vid); transcript = (c && c.transcript || []).map(mapTranscriptEntry); } catch (e) {}
    try { _G.endConvo(vid, 'done'); } catch (e) {}
    if (pressed > 0) return { ok: true, line: lines[0] || null, lines, transcript };
    return { ok: false, blocker: 'forage_talk-not-offered' };
  } catch (e) { try { _G.endConvo(vid, 'done'); } catch (e2) {} return { ok: false, blocker: 'convo-error', err: String(e && e.message) }; }
}
function armMoveAdjacent(vid, entry) {
  try {
    const v = _G.state.village, s = _G.state.scholar;
    const home = homePoint();
    if (_G.map.px !== home.x || _G.map.py !== home.y) {
      let tr = null; try { tr = _G.travelTo(home.x, home.y); } catch (e) { tr = 'err:' + e.message; }
      entry.travelHome = { to: home, result: tr === true ? 'ok' : (tr === false ? 'refused' : String(tr)) };
      if (_G.map.px !== home.x || _G.map.py !== home.y) { entry.blocker = 'travel-home-failed'; return false; }
    }
    const node = (v.nodePos || {})[vid] || {};
    if (node.nx !== home.x || node.ny !== home.y) { entry.blocker = 'partner-not-at-haven'; entry.partnerNode = node; return false; }
    const scholarInside = () => _G.state.scholar.insideHaven !== false;
    const partnerInside = () => (_G.state.village.npcInside?.[vid] !== false);
    if (scholarInside() !== partnerInside()) {
      let dr = null;
      try { dr = scholarInside() ? _G.exitBuilding() : _G.enterBuilding(); } catch (e) { dr = 'err:' + e.message; }
      entry.door = { scholarInsideBefore: scholarInside(), partnerInside: partnerInside(), result: dr === true ? 'ok' : (dr === false ? 'refused' : String(dr)) };
    }
    // R62-DIAG walk rounds: at dawn the partner's micro position is often
    // still null (NPC positions populate lazily on first movement), so a
    // walk toward a null/default target strands the scholar a few cells
    // off. Re-read the position each round; a null position costs one
    // trigger step toward the hall center, then the fresh position is
    // walked to. Succeeds only when the scholar ends adjacent to the
    // CURRENTLY read position.
    entry.posRounds = [];
    for (let round = 0; round < 3; round++) {
      const vv = _G.state.village, ss = _G.state.scholar;
      const pos = (vv.positions || {})[vid] || {};
      const roundRec = { round, posBefore: (pos.mx != null && pos.my != null) ? [pos.mx, pos.my] : null, scholarBefore: [ss.mx, ss.my] };
      let steps = 0;
      if (pos.mx == null || pos.my == null) {
        // Trigger placement: one step toward the hall center (or aside if already there).
        const tx = (ss.mx === 4 && ss.my === 4) ? 4 : 4, ty = (ss.mx === 4 && ss.my === 4) ? 5 : 4;
        const cands = [];
        for (let ddy = -1; ddy <= 1; ddy++) for (let ddx = -1; ddx <= 1; ddx++) {
          if (!ddx && !ddy) continue;
          const nx = (ss.mx ?? 4) + ddx, ny = (ss.my ?? 4) + ddy;
          if (nx < 0 || nx > 8 || ny < 0 || ny > 8) continue;
          cands.push({ nx, ny, d: Math.max(Math.abs(tx - nx), Math.abs(ty - ny)) });
        }
        cands.sort((a, b) => a.d - b.d);
        for (const cand of cands) {
          let r = false; try { r = _G.microMove(cand.nx, cand.ny); } catch (e) { r = false; }
          if (r) { steps++; break; }
        }
        roundRec.triggerSteps = steps;
        entry.posRounds.push(roundRec);
        const posAfter = (_G.state.village.positions || {})[vid] || {};
        if (posAfter.mx == null || posAfter.my == null) { entry.blocker = 'partner-position-never-populated'; entry.steps = (entry.steps || 0) + steps; return false; }
        continue; // fresh position known; walk to it next round
      }
      for (let guard = 0; guard < 30; guard++) {
        const s2 = _G.state.scholar;
        const dx = Math.abs((pos.mx ?? 4) - (s2.mx ?? 4)), dy = Math.abs((pos.my ?? 4) - (s2.my ?? 4));
        if (Math.max(dx, dy) <= 1) break;
        const cands = [];
        for (let ddy = -1; ddy <= 1; ddy++) for (let ddx = -1; ddx <= 1; ddx++) {
          if (!ddx && !ddy) continue;
          const nx = (s2.mx ?? 4) + ddx, ny = (s2.my ?? 4) + ddy;
          if (nx < 0 || nx > 8 || ny < 0 || ny > 8) continue;
          cands.push({ nx, ny, d: Math.max(Math.abs((pos.mx ?? 4) - nx), Math.abs((pos.my ?? 4) - ny)) });
        }
        cands.sort((a, b) => a.d - b.d);
        let moved = false;
        for (const cand of cands) {
          let r = false; try { r = _G.microMove(cand.nx, cand.ny); } catch (e) { r = false; }
          if (r) { steps++; moved = true; break; }
        }
        if (!moved) { entry.blocker = 'microMove-blocked'; entry.steps = (entry.steps || 0) + steps; entry.posRounds.push(roundRec); return false; }
      }
      entry.steps = (entry.steps || 0) + steps;
      roundRec.steps = steps;
      const fresh = (_G.state.village.positions || {})[vid] || {};
      const s3 = _G.state.scholar;
      roundRec.posAfter = (fresh.mx != null && fresh.my != null) ? [fresh.mx, fresh.my] : null;
      roundRec.scholarAfter = [s3.mx, s3.my];
      entry.posRounds.push(roundRec);
      if (fresh.mx != null && fresh.my != null && Math.max(Math.abs(fresh.mx - s3.mx), Math.abs(fresh.my - s3.my)) <= 1) return true;
      if (fresh.mx === pos.mx && fresh.my === pos.my) { entry.blocker = 'not-adjacent-after-walk'; return false; }
      // Position moved under us (placement) — one more round toward the fresh spot.
    }
    entry.blocker = 'position-rounds-exhausted';
    return false;
  } catch (e) { entry.blocker = 'position-error'; entry.err = String(e && e.message); return false; }
}
function posDiag(vid) {
  try {
    const v = _G.state.village, s = _G.state.scholar;
    return { scholar: { node: [_G.map.px, _G.map.py], mx: s.mx, my: s.my, insideHaven: s.insideHaven, insideTent: s.insideTent },
      partner: { node: (v.nodePos || {})[vid] || null, pos: (v.positions || {})[vid] || null, inside: v.npcInside?.[vid], away: !!v.away?.[vid] },
      home: homePoint(), dayPart: _G.dayPart };
  } catch (e) { return { err: String(e && e.message) }; }
}
function armStepToGreen(vid, entry) {
  // Honest in-node step: the detail grid is the rendered map — walk to a
  // forageable cell (plant/bush/tree/bigtree) that is neither scorched nor
  // regrowing, and stand on/adjacent to it so the next sweep can bite.
  try {
    const t = _G.tileAt(_G.map.px, _G.map.py);
    const detail = t ? t.detail : null;
    if (!detail) return { moved: false, reason: 'no-detail-grid' };
    const regrow = t.detailRegrow || {};
    const FORAGEABLE = { plant: 1, bush: 1, tree: 1, bigtree: 1 };
    const ss0 = _G.state.scholar;
    let best = null;
    for (let y = 0; y < 9; y++) for (let x = 0; x < 9; x++) {
      const c = detail[y] && detail[y][x];
      if (!FORAGEABLE[c]) continue;
      if (regrow[x + ',' + y]) continue;
      try { if (_G.cellScorched && _G.cellScorched(x, y)) continue; } catch (e) {}
      const d = Math.max(Math.abs(x - (ss0.mx ?? 4)), Math.abs(y - (ss0.my ?? 4)));
      if (!best || d < best.d) best = { x, y, d };
    }
    if (!best) return { moved: false, reason: 'no-green-on-node' };
    if (best.d <= 1) return { moved: false, reason: 'already-on-green-but-press-empty' };
    let steps = 0;
    for (let guard = 0; guard < 30; guard++) {
      const s2 = _G.state.scholar;
      if (Math.max(Math.abs(best.x - s2.mx), Math.abs(best.y - s2.my)) <= 1) break;
      const cands = [];
      for (let ddy = -1; ddy <= 1; ddy++) for (let ddx = -1; ddx <= 1; ddx++) {
        if (!ddx && !ddy) continue;
        const nx = (s2.mx ?? 4) + ddx, ny = (s2.my ?? 4) + ddy;
        if (nx < 0 || nx > 8 || ny < 0 || ny > 8) continue;
        cands.push({ nx, ny, d: Math.max(Math.abs(best.x - nx), Math.abs(best.y - ny)) });
      }
      cands.sort((a, b) => a.d - b.d);
      let moved = false;
      for (const cand of cands) {
        let r = false; try { r = _G.microMove(cand.nx, cand.ny); } catch (e) { r = false; }
        if (r) { steps++; moved = true; break; }
      }
      if (!moved) return { moved: false, reason: 'microMove-blocked', steps };
    }
    const s3 = _G.state.scholar;
    return { moved: Math.max(Math.abs(best.x - s3.mx), Math.abs(best.y - s3.my)) <= 1, steps, target: [best.x, best.y], scholar: [s3.mx, s3.my] };
  } catch (e) { return { moved: false, reason: 'step-error', err: String(e && e.message) }; }
}
function sweepDiag() {
  // Replicates the area sweep's own view: genDetail grid, 3x3 around the
  // scholar, forageable/scorched/regrow/species per cell. Names exactly
  // why a press would come back empty.
  try {
    const t = _G.tileAt(_G.map.px, _G.map.py);
    const detail = _G.genDetail(_G.map.px, _G.map.py);
    const s = _G.state.scholar;
    const mx = s.mx ?? 4, my = s.my ?? 4;
    const regrow = (t && t.detailRegrow) || {};
    const FORAGEABLE = { plant: 1, bush: 1, tree: 1, bigtree: 1 };
    const cells = [];
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const cx = mx + dx, cy = my + dy;
      if (cx < 0 || cx > 8 || cy < 0 || cy > 8) continue;
      const c = detail[cy] && detail[cy][cx];
      let scorched = false;
      try { scorched = !!(_G.cellScorched && _G.cellScorched(cx, cy)); } catch (e) {}
      let species = null;
      try { species = FORAGEABLE[c] ? _G.cellPlantSpecies(t, cx, cy, c) : null; } catch (e) { species = 'err:' + e.message; }
      cells.push({ x: cx, y: cy, cell: c || null, forageable: !!FORAGEABLE[c], scorched, regrow: !!regrow[cx + ',' + cy], species: species || null });
    }
    return { node: [_G.map.px, _G.map.py], scholar: [mx, my], tileType: t ? t.type : null, stock: t ? (t.stock || 0) : null, cells };
  } catch (e) { return { err: String(e && e.message) }; }
}
function packSnap() {
  try {
    const s = _G.state.scholar;
    const inv = s.inventory || [];
    let weight = null, cap = null;
    try { if (_G.packWeight) weight = _G.packWeight(); } catch (e) { weight = null; }
    try { if (_G.carryCapacity) cap = _G.carryCapacity(); } catch (e) { cap = null; }
    return { items: inv.length, units: inv.reduce((n, i) => n + (Number(i.units) || 0), 0),
      names: inv.map(i => (i.name || i.plantId || i.id) + 'x' + (i.units || 0)).slice(0, 12),
      weight, cap,
      kcal: s.kcal, dayTicks: s.dayTicks, day: s.day, dayPart: _G.dayPart, mx: s.mx, my: s.my, node: [_G.map.px, _G.map.py] };
  } catch (e) { return { err: String(e && e.message) }; }
}
function outingAttemptFavor(ctx, vid, favor) {
  const entry = { day: gday(), vid, name: null, favorId: favor.id || null, stages: [] };
  try { entry.name = vname(_G, vid); } catch (e) {}
  const combatLive = () => { try { return !!(_G.tbfight && !_G.tbfight.over); } catch (e) { return false; } };
  try {
    entry.diagFirst = posDiag(vid);
    const st0 = _G.forageFavorAction(vid, favor);
    entry.stages.push({ stage: 'readiness-first', ready: !!st0.ready, reason: st0.reason || null, action: st0.action || null });
    let st = st0;
    if (!st.ready) {
      const positioned = armMoveAdjacent(vid, entry);
      if (!positioned) { entry.outcome = 'blocked-positioning'; ctx.outingArm.push(entry); return; }
      entry.diagAfterPosition = posDiag(vid);
      st = _G.forageFavorAction(vid, favor);
      entry.stages.push({ stage: 'readiness-after-position', ready: !!st.ready, reason: st.reason || null, action: st.action || null });
      if (!st.ready) { entry.outcome = 'blocked-readiness'; ctx.outingArm.push(entry); return; }
    }
    if (st.action !== 'forage_start') { entry.outcome = 'unexpected-action:' + (st.action || '?'); ctx.outingArm.push(entry); return; }
    if (combatLive()) { entry.outcome = 'blocked-combat'; ctx.outingArm.push(entry); return; }
    // R62-UNLOAD (env-gated): the diag8 run proved the joint press dies on
    // a full pack ('Your pack is full' / 'Still full'), and the game itself
    // names the remedy ('leave some for the woods'). With OUTING_UNLOAD=1
    // the arm drops the two bulk wood rows (Branch, Bark strip) via the
    // real dropItem verb BEFORE departing, so the outing can carry a haul.
    if (process.env.OUTING_UNLOAD === '1') {
      const preU = packSnap();
      const dropped = [];
      for (;;) {
        let idx = -1;
        try {
          const inv = _G.state.scholar.inventory || [];
          idx = inv.findIndex(it => it && (it.material === 'branch' || it.material === 'bark'));
        } catch (e) { idx = -1; }
        if (idx < 0) break;
        let it = null;
        try { it = _G.state.scholar.inventory[idx]; } catch (e) { it = null; }
        try { _G.dropItem(idx); } catch (e) { break; }
        if (it) dropped.push((it.name || it.material || '?') + 'x' + (it.units || 1));
      }
      entry.stages.push({ stage: 'unload', dropped, prePack: preU, postPack: packSnap() });
    }
    const dep = armConvoAction(vid);
    entry.stages.push({ stage: 'depart', ok: dep.ok, line: dep.line || null, blocker: dep.blocker || null, offered: dep.offered || null });
    if (!dep.ok) { entry.outcome = 'blocked-depart'; ctx.outingArm.push(entry); return; }
    let foraged = null;
    try {
      // R62-DIAG2 candidate filter (mirrors the competent forage trip):
      // stocked, non-haven, non-ruin, unblocked tiles only, nearest first.
      // Raw travelTargets include picked-clean patches, which is why the
      // first arm died at 'Nothing left to take here' three times.
      const cands = [];
      for (const tt of ((_G.travelTargets ? _G.travelTargets() : []) || [])) {
        let t = null;
        try { t = _G.tileAt(tt.x, tt.y); } catch (e) {}
        if (!t || t.type === 'haven' || t.type === 'ruin' || (t.stock || 0) <= 0) continue;
        const _home = homePoint();
        if (Math.abs(tt.x - _home.x) + Math.abs(tt.y - _home.y) > 3) continue;
        let blocked = null;
        try { blocked = _G.travelBlockage ? _G.travelBlockage(tt.x, tt.y) : null; } catch (e) {}
        if (blocked) continue;
        cands.push({ x: tt.x, y: tt.y, d: tt.d, type: t.type, stock: t.stock });
      }
      cands.sort((a, b) => a.d - b.d);
      entry.stages.push({ stage: 'forage-candidates', cands: cands.slice(0, 6) });
      let tried = 0;
      for (const pick of cands.slice(0, 3)) {
        tried++;
        try { _G.travelTo(pick.x, pick.y); } catch (e) {}
        if (combatLive()) { entry.stages.push({ stage: 'travel-out-combat', target: { x: pick.x, y: pick.y } }); break; }
        if (_G.map.px !== pick.x || _G.map.py !== pick.y) { entry.stages.push({ stage: 'readiness-out', target: { x: pick.x, y: pick.y }, ready: false, reason: 'travel-did-not-arrive' }); continue; }
        let st2 = null;
        try { st2 = _G.forageFavorAction(vid, favor); } catch (e) {}
        entry.stages.push({ stage: 'readiness-out', target: { x: pick.x, y: pick.y }, ready: !!(st2 && st2.ready), reason: st2 ? (st2.reason || null) : 'err', action: st2 ? (st2.action || null) : null });
        if (st2 && st2.ready && st2.action === 'forage_together') {
          // Press up to 3 times on this target: an empty press means the
          // entry cell's 3x3 has no green — step to the green (rendered
          // detail grid) and press again, like the game's own guidance.
          let pressed = null, packFull = false;
          for (let press = 0; press < 3; press++) {
            const preDiag = sweepDiag();
            const prePack = packSnap();
            const capMarkJoint = _CAP.length;
            const fg = armConvoAction(vid);
            const jointSaid = _CAP.slice(capMarkJoint, capMarkJoint + 10);
            const postPack = packSnap();
            let runAfter = null;
            try { runAfter = ((_G.state.village.favorLedger || {})[vid] || {}).forageRun || null; } catch (e) {}
            const haulKcal = runAfter ? [...(runAfter.playerHaul || []), ...(runAfter.partnerHaul || [])].reduce((n, i) => n + (Number(i.kcalEach) || 0) * (Number(i.units) || 0), 0) : 0;
            entry.stages.push({ stage: 'forage-together', press, ok: fg.ok, line: fg.line || null, blocker: fg.blocker || null, forageCount: runAfter ? (runAfter.forageCount || 0) : null, haulKcal, sweepDiag: preDiag, prePack, postPack, jointSaid });
            if (fg.ok && runAfter && (runAfter.forageCount || 0) > 0 && haulKcal > 0) { pressed = fg; break; }
            if (fg.line && /pack is full|Still full/.test(fg.line)) { packFull = true; entry.stages.push({ stage: 'forage-pack-full' }); break; }
            if (fg.ok && fg.line && fg.line.indexOf('Nothing came of that press') >= 0) {
              // DIAG: solo press on the same cell right after the failed
              // joint press — separates "sweep finds nothing" (solo also
              // null + the game's own line in _CAP) from "joint path
              // drops a real haul" (solo harvests food).
              const capMark = _CAP.length;
              let soloRes = null, soloErr = null;
              try { soloRes = _G.doAction('forage'); } catch (e) { soloErr = String(e && e.message); }
              const soloSaid = _CAP.slice(capMark, capMark + 8);
              const soloPost = packSnap();
              entry.stages.push({ stage: 'forage-solo-probe', res: soloRes == null ? 'null' : 'truthy', err: soloErr, said: soloSaid, postPack: soloPost });
              const step = armStepToGreen(vid, entry);
              entry.stages.push({ stage: 'forage-step-to-green', moved: step.moved, steps: step.steps || 0, reason: step.reason || null, target: step.target || null });
              if (!step.moved) break;
              continue;
            }
            break;
          }
          if (pressed) { foraged = pressed; break; }
          if (packFull) break;
          continue;
        }
      }
      if (!cands.length) entry.stages.push({ stage: 'forage-candidates-empty' });
    } catch (e) { entry.stages.push({ stage: 'travel-out-error', err: String(e && e.message) }); }
    if (!foraged) { entry.outcome = 'blocked-forage'; ctx.outingArm.push(entry); return; }
    try {
      const tt = armTrailTalk(vid);
      entry.stages.push({ stage: 'trail-talk', ok: tt.ok, line: tt.line || null, lines: tt.lines || null, blocker: tt.blocker || null, transcript: tt.transcript || null });
    } catch (e) { entry.stages.push({ stage: 'trail-talk-error', err: String(e && e.message) }); }
    try {
      const home = homePoint();
      const beforeHome = { node: [_G.map.px, _G.map.py], dayTicks: (_G.state.scholar || {}).dayTicks, dayPart: _G.dayPart };
      const hopRes = armTravelHome(entry);
      entry.stages.push({ stage: 'travel-home', result: hopRes.ok ? 'ok' : ('failed:' + (hopRes.blocker || '?')), hops: hopRes.hops, before: beforeHome, after: { node: [_G.map.px, _G.map.py], dayTicks: (_G.state.scholar || {}).dayTicks, dayPart: _G.dayPart } });
      if (combatLive()) { entry.outcome = 'blocked-combat-home'; ctx.outingArm.push(entry); return; }
      let st3 = null;
      try { st3 = _G.forageFavorAction(vid, favor); } catch (e) {}
      entry.stages.push({ stage: 'readiness-home', ready: !!(st3 && st3.ready), reason: st3 ? (st3.reason || null) : 'err', action: st3 ? (st3.action || null) : null });
      if (st3 && st3.ready && (st3.action === 'forage_deliver' || st3.action === 'forage_end')) {
        const dv = armConvoAction(vid);
        entry.stages.push({ stage: 'deliver', ok: dv.ok, line: dv.line || null, blocker: dv.blocker || null });
        if (!dv.ok) { entry.outcome = 'blocked-deliver'; ctx.outingArm.push(entry); return; }
      } else { entry.outcome = 'blocked-deliver-readiness'; ctx.outingArm.push(entry); return; }
    } catch (e) { entry.stages.push({ stage: 'deliver-error', err: String(e && e.message) }); entry.outcome = 'blocked-deliver-error'; ctx.outingArm.push(entry); return; }
    try {
      const v = _G.state.village, f2 = (v.favorLedger || {})[vid], p2 = (v.promises || {})[vid];
      entry.final = { favorState: f2 ? f2.state : null, promiseKept: p2 ? (p2.kept === true) : null,
        deliveredKcal: f2 && f2.forageRun ? (f2.forageRun.deliveredKcal || 0) : 0,
        playerKcal: f2 && f2.forageRun ? (f2.forageRun.deliveredPlayerKcal || 0) : 0,
        partnerKcal: f2 && f2.forageRun ? (f2.forageRun.deliveredPartnerKcal || 0) : 0 };
      entry.outcome = entry.final.promiseKept ? 'delivered-promise-kept' : 'delivered-promise-NOT-kept';
    } catch (e) { entry.outcome = 'delivered-final-read-error'; }
    ctx.outingArm.push(entry);
  } catch (e) { entry.outcome = 'attempt-error'; entry.err = String(e && e.message); ctx.outingArm.push(entry); }
}


function armTravelHome(entry) {
  // R237-FIX (v2): travelTo only offers d<=3 targets, so a direct trip
  // home fails (null) once the outing has wandered further than 3 nodes
  // from Haven — and a creek on the direct path blocks it outright. Walk
  // home in hops toward Haven: each hop takes the untried travelTargets
  // entry nearest home that is strictly closer than where we stand. A
  // blocked hop tries the NEXT route instead of giving up (the creek
  // between (6,3) and (4,4) killed the first version, which returned on
  // the first failed hop). A real player walks home tile by tile, around
  // the creek; this is the same honest path, through the same verb.
  const home = homePoint();
  const tried = new Set();
  for (let hop = 0; hop < 8; hop++) {
    if (_G.map.px === home.x && _G.map.py === home.y) return { ok: true, hops: hop };
    const curD = Math.abs(_G.map.px - home.x) + Math.abs(_G.map.py - home.y);
    let best = null;
    for (const tt of ((_G.travelTargets ? _G.travelTargets() : []) || [])) {
      const key = tt.x + ',' + tt.y;
      if (tried.has(key)) continue;
      const d = Math.abs(tt.x - home.x) + Math.abs(tt.y - home.y);
      if (d >= curD) continue;
      if (!best || d < best.d) best = { x: tt.x, y: tt.y, d };
    }
    if (!best) return { ok: false, hops: hop, blocker: 'no-closer-target', curD };
    tried.add(best.x + ',' + best.y);
    let r = null, rErr = null;
    try { r = _G.travelTo(best.x, best.y); } catch (e) { rErr = String(e && e.message); }
    entry.stages.push({ stage: 'travel-home-hop', hop, to: [best.x, best.y], result: r === true ? 'ok' : (r === null ? 'null-not-a-target' : (r && r.blockType ? 'blocked:' + r.blockType : String(r))), err: rErr, at: [_G.map.px, _G.map.py] });
    if (rErr) return { ok: false, hops: hop, blocker: 'travel-error', err: rErr };
    if (_G.map.px !== best.x || _G.map.py !== best.y) continue; // blocked route — try the next one
  }
  return { ok: _G.map.px === home.x && _G.map.py === home.y, hops: 8, blocker: 'hops-exhausted' };
}

function outingContinueFavor(ctx, vid, favor) {
  // R237: drive an ALREADY-LIVE run to completion. The conversational
  // driver sometimes starts an outing (dlg:favor_action via its generic
  // fallback) and never walks it out; the dawn arm previously skipped
  // live runs entirely (r62 shape), so a live run sat at Haven forever
  // while new starts were refused ("Finish your current outing...").
  // This continues it: forage together -> one trail-talk press -> home
  // -> unload. Same public verbs as the start path; never a direct
  // performForageFavor call.
  const entry = { day: gday(), vid, name: null, favorId: favor.id || null, stages: [], continued: true };
  try { entry.name = vname(_G, vid); } catch (e) {}
  const combatLive = () => { try { return !!(_G.tbfight && !_G.tbfight.over); } catch (e) { return false; } };
  try {
    entry.diagFirst = posDiag(vid);
    let st = _G.forageFavorAction(vid, favor);
    entry.stages.push({ stage: 'readiness-first', ready: !!st.ready, reason: st.reason || null, action: st.action || null });
    // R237-FIX: a live run at Haven with an empty haul reports not-ready
    // ("Forage together on green ground first") — that is NOT a
    // positioning failure. The pair is already together; the move is to
    // travel OUT to green ground, not to re-position at Haven. Only a
    // non-green-ground block goes through the positioning path.
    const greenFirst = !st.ready && st.reason && /green ground first/.test(st.reason);
    if (!st.ready && !greenFirst) {
      const positioned = armMoveAdjacent(vid, entry);
      if (!positioned) { entry.outcome = 'blocked-positioning'; ctx.outingArm.push(entry); return; }
      entry.diagAfterPosition = posDiag(vid);
      st = _G.forageFavorAction(vid, favor);
      entry.stages.push({ stage: 'readiness-after-position', ready: !!st.ready, reason: st.reason || null, action: st.action || null });
      if (!st.ready && !(st.reason && /green ground first/.test(st.reason))) { entry.outcome = 'blocked-readiness'; ctx.outingArm.push(entry); return; }
    }
    if (greenFirst) entry.stages.push({ stage: 'forage-from-home', greenFirst: true });
    if (greenFirst || st.action === 'forage_together') {
      let foraged = null;
      try {
        const cands = [];
        for (const tt of ((_G.travelTargets ? _G.travelTargets() : []) || [])) {
          let t = null;
          try { t = _G.tileAt(tt.x, tt.y); } catch (e) {}
          if (!t || t.type === 'haven' || t.type === 'ruin' || (t.stock || 0) <= 0) continue;
          const _home = homePoint();
          if (Math.abs(tt.x - _home.x) + Math.abs(tt.y - _home.y) > 3) continue;
          let blocked = null;
          try { blocked = _G.travelBlockage ? _G.travelBlockage(tt.x, tt.y) : null; } catch (e) {}
          if (blocked) continue;
          cands.push({ x: tt.x, y: tt.y, d: tt.d, type: t.type, stock: t.stock });
        }
        cands.sort((a, b) => a.d - b.d);
        entry.stages.push({ stage: 'forage-candidates', cands: cands.slice(0, 6) });
        for (const pick of cands.slice(0, 3)) {
          try { _G.travelTo(pick.x, pick.y); } catch (e) {}
          if (combatLive()) { entry.stages.push({ stage: 'travel-out-combat', target: { x: pick.x, y: pick.y } }); break; }
          if (_G.map.px !== pick.x || _G.map.py !== pick.y) { entry.stages.push({ stage: 'readiness-out', target: { x: pick.x, y: pick.y }, ready: false, reason: 'travel-did-not-arrive' }); continue; }
          let st2 = null;
          try { st2 = _G.forageFavorAction(vid, favor); } catch (e) {}
          entry.stages.push({ stage: 'readiness-out', target: { x: pick.x, y: pick.y }, ready: !!(st2 && st2.ready), reason: st2 ? (st2.reason || null) : 'err', action: st2 ? (st2.action || null) : null });
          if (st2 && st2.ready && st2.action === 'forage_together') {
            for (let press = 0; press < 3; press++) {
              const fg = armConvoAction(vid);
              let runAfter = null;
              try { runAfter = ((_G.state.village.favorLedger || {})[vid] || {}).forageRun || null; } catch (e) {}
              const haulKcal = runAfter ? [...(runAfter.playerHaul || []), ...(runAfter.partnerHaul || [])].reduce((n, i) => n + (Number(i.kcalEach) || 0) * (Number(i.units) || 0), 0) : 0;
              entry.stages.push({ stage: 'forage-together', press, ok: fg.ok, line: fg.line || null, blocker: fg.blocker || null, forageCount: runAfter ? (runAfter.forageCount || 0) : null, haulKcal });
              if (fg.ok && runAfter && (runAfter.forageCount || 0) > 0 && haulKcal > 0) { foraged = fg; break; }
              if (fg.line && /pack is full|Still full/.test(fg.line)) break;
              if (fg.ok && fg.line && fg.line.indexOf('Nothing came of that press') >= 0) {
                const step = armStepToGreen(vid, entry);
                entry.stages.push({ stage: 'forage-step-to-green', moved: step.moved, steps: step.steps || 0, reason: step.reason || null, target: step.target || null });
                if (!step.moved) break;
                continue;
              }
              break;
            }
            if (foraged) break;
            continue;
          }
        }
        if (!cands.length) entry.stages.push({ stage: 'forage-candidates-empty' });
      } catch (e) { entry.stages.push({ stage: 'travel-out-error', err: String(e && e.message) }); }
      if (!foraged) { entry.outcome = 'blocked-forage'; ctx.outingArm.push(entry); return; }
      try {
        const tt = armTrailTalk(vid);
        entry.stages.push({ stage: 'trail-talk', ok: tt.ok, line: tt.line || null, lines: tt.lines || null, blocker: tt.blocker || null, transcript: tt.transcript || null });
      } catch (e) { entry.stages.push({ stage: 'trail-talk-error', err: String(e && e.message) }); }
    } else if (st.action !== 'forage_deliver' && st.action !== 'forage_end') {
      entry.outcome = 'unexpected-action:' + (st.action || '?');
      ctx.outingArm.push(entry);
      return;
    }
    try {
      const home = homePoint();
      const beforeHome = { node: [_G.map.px, _G.map.py], dayTicks: (_G.state.scholar || {}).dayTicks, dayPart: _G.dayPart };
      const hopRes = armTravelHome(entry);
      entry.stages.push({ stage: 'travel-home', result: hopRes.ok ? 'ok' : ('failed:' + (hopRes.blocker || '?')), hops: hopRes.hops, before: beforeHome, after: { node: [_G.map.px, _G.map.py], dayTicks: (_G.state.scholar || {}).dayTicks, dayPart: _G.dayPart } });
      if (combatLive()) { entry.outcome = 'blocked-combat-home'; ctx.outingArm.push(entry); return; }
      let st3 = null;
      try { st3 = _G.forageFavorAction(vid, favor); } catch (e) {}
      entry.stages.push({ stage: 'readiness-home', ready: !!(st3 && st3.ready), reason: st3 ? (st3.reason || null) : 'err', action: st3 ? (st3.action || null) : null });
      if (st3 && st3.ready && (st3.action === 'forage_deliver' || st3.action === 'forage_end')) {
        const dv = armConvoAction(vid);
        entry.stages.push({ stage: 'deliver', ok: dv.ok, line: dv.line || null, blocker: dv.blocker || null });
        if (!dv.ok) { entry.outcome = 'blocked-deliver'; ctx.outingArm.push(entry); return; }
      } else { entry.outcome = 'blocked-deliver-readiness'; ctx.outingArm.push(entry); return; }
    } catch (e) { entry.stages.push({ stage: 'deliver-error', err: String(e && e.message) }); entry.outcome = 'blocked-deliver-error'; ctx.outingArm.push(entry); return; }
    try {
      const v = _G.state.village, f2 = (v.favorLedger || {})[vid], p2 = (v.promises || {})[vid];
      entry.final = { favorState: f2 ? f2.state : null, promiseKept: p2 ? (p2.kept === true) : null,
        deliveredKcal: f2 && f2.forageRun ? (f2.forageRun.deliveredKcal || 0) : 0,
        playerKcal: f2 && f2.forageRun ? (f2.forageRun.deliveredPlayerKcal || 0) : 0,
        partnerKcal: f2 && f2.forageRun ? (f2.forageRun.deliveredPartnerKcal || 0) : 0 };
      entry.outcome = entry.final.promiseKept ? 'delivered-promise-kept' : 'delivered-promise-NOT-kept';
    } catch (e) { entry.outcome = 'delivered-final-read-error'; }
    ctx.outingArm.push(entry);
  } catch (e) { entry.outcome = 'attempt-error'; entry.err = String(e && e.message); ctx.outingArm.push(entry); }
}
function outingDawnArm(ctx) {
  if (!OUTING_SEEK) return;
  try {
    if (_G.over || (_G.state.scholar || {}).dead) return;
    if (_G.tbfight && !_G.tbfight.over) return;
    if (_G.state.activeContest) return;
    if (_G.dayPart !== 0) return;
    const day = gday();
    if (ctx._outingDawnDay === day) return;
    ctx._outingDawnDay = day;
    ctx.outingArm = ctx.outingArm || [];
    ctx._outingTried = ctx._outingTried || {};
    const v = _G.state.village || {};
    const ledger = v.favorLedger || {};
    for (const key of Object.keys(ledger)) {
    // R237-CONTINUE: drive live runs first — a run the conversational
    // driver started (and never walked out) blocks every new start
    // ("Finish your current outing..."), so it must be finished, not
    // skipped. Cap 3 tries per favor, same as starts.
    for (const key of Object.keys(ledger)) {
      const f = ledger[key];
      if (!f || f.kind !== 'forage_help' || !f.forageRun || f.forageRun.returned) continue;
      if (f.forageRun.bearer !== _G.villagerId) continue;
      const ck = f.id + ':continue:' + day;
      const tries = ctx._outingTried[ck] || 0;
      if (tries >= 3) continue;
      ctx._outingTried[ck] = tries + 1;
      outingContinueFavor(ctx, f.vid, f);
    }
      const f = ledger[key];
      if (!f || f.kind !== 'forage_help' || f.state !== 'promised') continue;
      if (f.forageRun) continue;
      if (day < (f.meetDay ?? ((f.promisedDay ?? f.askedDay ?? 0) + 1))) continue;
      const sk = f.id + ':start:' + day;
      const tries = ctx._outingTried[sk] || 0;
      if (tries >= 3) continue;
      ctx._outingTried[sk] = tries + 1;
      outingAttemptFavor(ctx, f.vid, f);
    }
  } catch (e) { (ctx.outingArmErrors = ctx.outingArmErrors || []).push({ day: gday(), err: String(e && e.message) }); }
}
async function oneSeed(seed) {
  const t0 = process.hrtime.bigint();
  const { Game, manifest } = await loadGame({ seed, mode: 'journey-social-life-r277', fullTelemetry: true, narration: true });
  // text capture ON (emit = the one text stream)
  const captured = [];
  _G = Game; _CAP = captured;
  let capDropped = 0; // r141 M6: emit-trim accounting (see below)
  // r141 M6 (correction 3): emit-time classification of naming-beat lines.
  // Each burst/settle/witness/tale line is recorded WITH the scholar's
  // position at the moment it was emitted — the only position that
  // decides whether the line reached them. (Day-slice attribution was
  // wrong: a slice covers the previous day's parts, where the scholar
  // may have been at Haven, while its stranded flag reads the next
  // morning's position. probe-r141-emittime proved it: 108 classified
  // lines on seed 41802, 0 emitted away.)
  const newsLines = [];
  // r226 (B5) FUNERAL INSTRUMENT: emit-stream lines matching /funeral/i
  // (the funeral-mend voice is say() = emit(text,'narration'), so it
  // flows through this wrap already — this serializes a filtered subset
  // of the already-captured stream, same pattern as r223 crisis
  // MOURN_RE). Read-only: no Game call, no RNG, no new wrap.
  const funeralLines = [];
  try {
    const _emit = Game.emit;
    Game.emit = function (...a) {
      try { captured.push({ d: (Game.state.scholar || {}).day || 0, s: a[1] || 'narration', t: String(a[0] || '').slice(0, 300) }); } catch (e) {}
      try {
        const t = String(a[0] || '');
        let kind = null;
        if (gc.isGossipBurstLine(t)) kind = 'burst';
        else if (gc.isSettleLine(t)) kind = 'settle';
        else if (/came back from the treeline white-faced/.test(t)) kind = 'witness';
        else if (/The fire settles\./.test(t)) kind = 'tale';
        if (kind) {
          let atHaven = true, atHavenGate = true;
          try { atHaven = Game.scholarAtHaven(); } catch (e2) {}
          // r154 M6 re-alignment: second classification under the gate's
          // own definition — playerAtHaven() (radius-1). The strict
          // on-tile test (atHaven) and the gate test (atHavenGate)
          // diverge exactly on the radius-1 ring.
          try { atHavenGate = Game.playerAtHaven(); } catch (e2) {}
          newsLines.push({ day: (Game.state.scholar || {}).day || 0, kind, atHaven: !!atHaven, atHavenGate: !!atHavenGate });
        }
        // r226 (B5): funeral lines, with day, straight off the stream.
        if (/funeral/i.test(t)) funeralLines.push({ d: (Game.state.scholar || {}).day || 0, s: a[1] || 'narration', t: t.slice(0, 300) });
      } catch (e) {}
      // r141 M6: the 50k trim drops the OLDEST entries, so any index
      // recorded before a trim points past the new array's end. Track how
      // many entries were dropped so daily slices can use GLOBAL indices
      // (dropped + length) instead of raw array indices.
      if (captured.length > 50000) { capDropped += captured.length - 50000; captured.splice(0, captured.length - 50000); }
      try { return _emit.apply(this, a); } catch (e) { return a[0]; }
    };
  } catch (e) {}
  await setupGame(Game);
  const ctxShared = { mootNotes: [], talkReqSeen: {}, captured, funeralLines, lureDecisions: [], darkSnaps: [], armEvents: [], springEvents: [], expiredEvents: [], proposeCalls: [], successions: [], nightlyNews: [], bondProposed: [], counterSettles: [], counterAnswers: [], confrontEvents: [], funeralMends: [], wantResolutions: [] };
  // r154 (B) BOND-PROPOSED LIVE CAPTURE: wrap Game.tele BEFORE runDays.
  // The harness wraps tele itself inside runDays and chains through
  // _origTele, so this wrap still fires (same pattern as the harness's
  // own _liveDeaths capture). initiatorKind is judged against
  // Game.villagerId AT FIRE TIME, so a mid-run succession cannot
  // misattribute the initiator. Read-only: the original tele runs first.
  try {
    const _tele = Game.tele;
    Game.tele = function (type, data) {
      let r;
      try { r = _tele.apply(this, arguments); } catch (e) { throw e; }
      try {
        if (type === 'bond_proposed' && data) {
          const initiatorId = data.initiator;
          let targetName = data.target;
          try { if (data.kind !== 'link') targetName = vname(Game, data.target); } catch (e2) {}
          ctxShared.bondProposed.push({
            day: (Game.state.scholar || {}).day || 0,
            initiator: vname(Game, initiatorId), initiatorId: String(initiatorId),
            initiatorKind: (String(initiatorId) === String(Game.villagerId)) ? 'scholar' : 'villager',
            target: targetName, targetId: String(data.target),
            kind: data.kind || '?', outcome: data.outcome || '?',
            chance: (data.chance === undefined ? null : data.chance),
          });
        }
      } catch (e) {}
      return r;
    };
  } catch (e) {}
  // r141 succession tracking: the mantle can pass mid-run, so the bearer
  // at decision time is recorded, not the end-of-run scholar. Capture the
  // initial bearer AFTER the ctxShared literal (r136 captured before it,
  // so the assignment was swallowed and initialBearer stayed null).
  try { ctxShared.lastBearer = Game.villagerId; ctxShared.initialBearer = vname(Game, Game.villagerId); } catch (e) { ctxShared.lastBearer = null; ctxShared.initialBearer = null; }
  // r112: wrap npcInviteDecision (driver-side, read-only) to record
  // every party/lure decision. If the method is not on Game, record
  // the miss — plots-status counts are then the fallback read.
  try {
    const orig = Game.npcInviteDecision;
    if (typeof orig === 'function') {
      ctxShared.decisionWrapped = true;
      Game.npcInviteDecision = function (invitee, inviter, opts) {
        const d = orig.call(this, invitee, inviter, opts);
        try {
          ctxShared.lureDecisions.push({
            day: (Game.state.scholar || {}).day || 0,
            kind: (opts && opts.kind) || 'party',
            inviter: vname(Game, inviter), invitee: vname(Game, invitee),
            // succession-proof: the bearer AT CALL TIME, not the end scholar.
            // party.js:206 always passes villagerId, so party decisions are
            // bearer-initiated by construction; lure inviters are plot roles.
            bearer: vname(Game, Game.villagerId),
            inviterWasBearer: inviter === Game.villagerId,
            chance: d && d.chance, accept: d && d.accept, veto: d && d.veto || null,
            inputs: d && d.inputs || null, reasons: d && d.reasons || [],
          });
        } catch (e) {}
        return d;
      };
    } else { ctxShared.decisionWrapped = false; }
  } catch (e) { ctxShared.decisionWrapped = 'wrap-error: ' + e.message; }
  // r120: wrap armPlot (arming-time motive) + simNpcAmbush (spring trace).
  // Both read-only: call through, record, return the original result.
  try {
    const origArm = Game.armPlot;
    if (typeof origArm === 'function') {
      ctxShared.armWrapped = true;
      Game.armPlot = function (leader, accomplices, target, motive) {
        const ev = { day: (Game.state.scholar || {}).day || 0 };
        try {
          ev.leader = vname(Game, leader); ev.target = vname(Game, target);
          ev.inviterPending = null;
          ev.accomplices = (accomplices || []).map(a => vname(Game, a));
          ev.passedMotive = motive ? { score: motive.score, reasons: motive.reasons || [] } : null;
          const mb = Game.motiveBetween ? Game.motiveBetween(leader, target) : null;
          ev.motiveAtArming = mb ? { score: mb.score, reasons: mb.reasons || [] } : null;
          ev.grievanceTargetToLeader = Game.grievanceBetween ? Game.grievanceBetween(target, leader) : null;
          ev.grievanceLeaderToTarget = Game.grievanceBetween ? Game.grievanceBetween(leader, target) : null;
          ev.accompliceMotives = (accomplices || []).map(a => {
            try { const m = Game.motiveBetween(a, target); return { who: vname(Game, a), score: m.score, reasons: m.reasons || [], grievance: Game.grievanceBetween(a, target) }; } catch (e2) { return { who: vname(Game, a), error: String(e2.message) }; }
          });
          ev.trust = { leader: trustOf(Game, leader) };
          for (const a of (accomplices || [])) ev.trust[vname(Game, a)] = trustOf(Game, a);
          try { const g = Game.npcGoal ? Game.npcGoal(leader) : null; ev.leaderGoal = g || null; } catch (e2) {}
        } catch (e2) { ev.error = 'armWrap: ' + e2.message; }
        const plot = origArm.call(this, leader, accomplices, target, motive);
        try { ev.plotId = plot && plot.id; ev.inviter = plot ? vname(Game, plot.inviter) : null; } catch (e2) {}
        ctxShared.armEvents.push(ev);
        return plot;
      };
    } else { ctxShared.armWrapped = false; }
  } catch (e) { ctxShared.armWrapped = 'wrap-error: ' + e.message; }
  try {
    const origSpring = Game.simNpcAmbush;
    if (typeof origSpring === 'function') {
      ctxShared.springWrapped = true;
      Game.simNpcAmbush = function (plot) {
        const ev = { day: (Game.state.scholar || {}).day || 0, plotId: plot && plot.id };
        try { ev.leader = vname(Game, plot.leader); ev.target = vname(Game, plot.target); ev.inviter = vname(Game, plot.inviter); } catch (e2) {}
        const r = origSpring.call(this, plot);
        try { ev.outcome = r && r.outcome; ev.caseId = r && r.caseId; } catch (e2) {}
        ctxShared.springEvents.push(ev);
        return r;
      };
    } else { ctxShared.springWrapped = false; }
  } catch (e) { ctxShared.springWrapped = 'wrap-error: ' + e.message; }
  // r132: detect newly-expired plots (read-only before/after diff of npcPlotTick).
  try {
    const origTick = Game.npcPlotTick;
    if (typeof origTick === 'function') {
      ctxShared.expireWrapped = true;
      Game.npcPlotTick = function () {
        let before = [];
        try { before = ((Game.betrayalState() || {}).plots || []).map(p => ({ id: p.id, expired: !!p.expired, leader: vname(Game, p.leader), target: vname(Game, p.target), inviter: vname(Game, p.inviter) })); } catch (e) {}
        const r = origTick.call(this);
        try {
          const after = ((Game.betrayalState() || {}).plots || []);
          for (const p of after) {
            if (p.expired && !before.find(b => b.id === p.id && b.expired)) {
              ctxShared.expiredEvents.push({ day: (Game.state.scholar || {}).day || 0, plotId: p.id, leader: vname(Game, p.leader), target: vname(Game, p.target), inviter: vname(Game, p.inviter), armedDay: p.day });
            }
          }
        } catch (e) {}
        return r;
      };
    } else { ctxShared.expireWrapped = false; }
  } catch (e) { ctxShared.expireWrapped = 'wrap-error: ' + e.message; }
  // r141 (j) BOND INSTRUMENT: wrap proposeLink / proposeCovenant /
  // proposeTrade (driver-side, read-only). r181 CORRECTION: the r141
  // claim ("any call observed is scholar-initiated") is WRONG on the
  // current base — src/js/bond-initiation.js:840 calls G.proposeLink to
  // FORMALIZE an already-staged proposal the scholar accepted, so the
  // call's initiator is the proposal's proposer, not the caller. The wrap
  // records initiatorKind 'engine' (execution step); the TRUE
  // scholar-vs-villager split is the bond_proposed tele (1), which judges
  // the initiator at fire time. On the r181 panel all 15 calls formalize
  // ACCEPTED villager link proposals (same day + target as the villager's
  // bond_proposed 'accepted' event — proven by
  // scripts/test-journey-social-r181-proposelabel.js).
  // r154 (B): pendingBefore/pendingAfter added — a 'counter' result with
  // pendingBefore=true is the hierarchy.js "offer on the table" guard
  // (line 645: returns 'counter' WITHOUT scoring), not a fresh staged
  // counter. targetId kept raw: r149's vname() on a village id produced
  // garbage names ("A man, maybe 30s", "Someone").
  try {
    const scholarName = vname(Game, Game.villagerId);
    ctxShared.proposeWrapped = {};
    for (const method of ['proposeLink', 'proposeCovenant', 'proposeTrade']) {
      const origFn = Game[method];
      if (typeof origFn === 'function') {
        ctxShared.proposeWrapped[method] = true;
        Game[method] = function (targetId, opts) {
          let pendingBefore = null;
          try { pendingBefore = !!(Game.state && Game.state.pendingCounter); } catch (e2) {}
          const r = origFn.call(this, targetId, opts);
          try {
            let resultSummary = null;
            try { resultSummary = JSON.stringify(r).slice(0, 200); } catch (e2) { resultSummary = String(r).slice(0, 200); }
            let pendingAfter = null;
            try { pendingAfter = !!(Game.state && Game.state.pendingCounter); } catch (e2) {}
            ctxShared.proposeCalls.push({
              day: (Game.state.scholar || {}).day || 0,
              method, target: vname(Game, targetId), targetId: String(targetId),
              // r181: 'engine' — this call EXECUTES an already-staged
              // proposal (bond-initiation.js acceptLink); acceptedBy is
              // the bearer who accepted it, not the proposal's proposer.
              // The true initiator is the bond_proposed tele (1).
              acceptedBy: scholarName, initiatorKind: 'engine',
              result: resultSummary,
              pendingBefore, pendingAfter,
            });
          } catch (e2) {}
          return r;
        };
      } else { ctxShared.proposeWrapped[method] = false; }
    }
  } catch (e) { ctxShared.proposeWrapped = 'wrap-error: ' + e.message; }
  // r154 (B) COUNTER-ANSWER INSTRUMENT: wrap answerCounter (read-only
  // record). The only sim caller is the driver settle in policy.daily
  // (app.js UI buttons are the real-player path); any call observed is
  // a settle. linkFormed is checked after the call via linkWith.
  try {
    const origAns = Game.answerCounter;
    if (typeof origAns === 'function') {
      ctxShared.answerWrapped = true;
      Game.answerCounter = function (how) {
        let before = null;
        try { before = (Game.state || {}).pendingCounter || null; } catch (e2) {}
        const r = origAns.call(this, how);
        try {
          let resultSummary = null;
          try { resultSummary = JSON.stringify(r).slice(0, 300); } catch (e2) { resultSummary = String(r).slice(0, 300); }
          let linkFormed = null;
          try { linkFormed = !!(before && before.targetId && Game.linkWith && Game.linkWith(before.targetId)); } catch (e2) {}
          ctxShared.counterAnswers.push({
            day: (Game.state.scholar || {}).day || 0,
            how: how || '?',
            targetId: before ? String(before.targetId) : null,
            tribute: before ? (before.tributeKcalPerWeek || null) : null,
            result: resultSummary,
            linkFormed,
          });
        } catch (e2) {}
        return r;
      };
    } else { ctxShared.answerWrapped = false; }
  } catch (e) { ctxShared.answerWrapped = 'wrap-error: ' + e.message; }
  // r181 (B1) CONFRONT INSTRUMENT: wrap confrontDoubt / confrontTheft
  // (read-only record). A confrontation fires only from convoTurn inside
  // an active conversation; the wrap stamps the driver's current sitting
  // so the analyzer can count confessions per sitting (double-confession
  // watch, r163 open item 3). Outcome values: 'confessed' | 'deflected' |
  // 'attacked' | 'cleared' | 'pressed' | 'already-confessed' | 'moot'
  // (confrontDoubt) and 'confessed' | 'deflected' | 'attacked'
  // (confrontTheft). The original runs first and its return is untouched.
  try {
    ctxShared.confrontWrapped = {};
    // RE-ENTRANCY (journey-social r172 2026-11-10): confrontDoubt routes
    // theft doubts to confrontTheft, so ONE theft press fired BOTH wraps
    // and the analyzer counted a phantom theft+doubt double (panel s69;
    // the confirm re-run's 43702 "double" was the same single press).
    // Record only the outermost wrapped call, and label the event by the
    // doubt's real path (a theft doubt resolves via confrontTheft even
    // when the outer call is confrontDoubt).
    let confrontDepth = 0;
    for (const method of ['confrontDoubt', 'confrontTheft']) {
      const origFn = Game[method];
      if (typeof origFn === 'function') {
        ctxShared.confrontWrapped[method] = true;
        Game[method] = function (vid, doubtId) {
          const outermost = confrontDepth === 0;
          confrontDepth++;
          let r;
          try { r = origFn.call(this, vid, doubtId); } finally { confrontDepth--; }
          if (!outermost) return r;
          try {
            let label = method;
            try {
              const d = (Game.state.codex.doubts || []).find(x => x && x.id === doubtId);
              if (d && d.theft) label = 'confrontTheft';
            } catch (e2) {}
            ctxShared.confrontEvents.push({
              day: (Game.state.scholar || {}).day || 0,
              sitting: currentSitting ? currentSitting.seq : null,
              vid: String(vid), tag: currentSitting ? currentSitting.tag : null,
              method: label, outcome: (r && r.outcome) || null,
            });
          } catch (e2) {}
          return r;
        };
      } else { ctxShared.confrontWrapped[method] = false; }
    }
  } catch (e) { ctxShared.confrontWrapped = 'wrap-error: ' + e.message; }
  // r239 (B5) FUNERAL-MEND PER-FUNERAL INSTRUMENT: wrap _funeralMend
  // (read-only record). The return {mended, shorted, spent} classifies
  // each funeral: FULL <=> shorted==0 AND spent==1500*mended (every
  // shaken link paid in full, +8 each); PARTIAL <=> mended>0 AND
  // (shorted>0 OR spent<1500*mended — a thin pantry bought back only
  // part of the -8); NONE <=> mended==0. r226 had totals only
  // (funeralMendStats: funerals / linksMended / kcalSpent). No RNG, no
  // state mutation — the original runs first, its return is untouched.
  try {
    const origMend = Game._funeralMend;
    if (typeof origMend === 'function') {
      ctxShared.mendWrapped = true;
      Game._funeralMend = function (nm, shaken) {
        const r = origMend.call(this, nm, shaken);
        try {
          const mended = (r && r.mended) || 0, shorted = (r && r.shorted) || 0, spent = (r && r.spent) || 0;
          ctxShared.funeralMends.push({
            day: (Game.state.scholar || {}).day || 0,
            dead: nm || '?', shaken: (shaken || []).length,
            mended, shorted, spent,
            full: mended > 0 && shorted === 0 && spent === 1500 * mended,
          });
        } catch (e2) {}
        return r;
      };
    } else { ctxShared.mendWrapped = false; }
  } catch (e) { ctxShared.mendWrapped = 'wrap-error: ' + e.message; }
  // r239 (B6) WANT-RESOLUTION INSTRUMENT: wrap convoWantEngage
  // (read-only record). The pure state transition — kind 'deflect' ->
  // stage 3 'deflected', 'commit' -> stage 3 + resolution, 'engage' ->
  // stage 2, 'stated' -> stage 3 'stated'. Recording stageBefore makes
  // the direct stage-3-'deflected'-from-stage-0 count measurable (r226
  // had only the 20/21 next-sitting resurface proxy). No RNG, no state
  // mutation — the original runs first, its return is untouched.
  try {
    const origEngage = Game.convoWantEngage;
    if (typeof origEngage === 'function') {
      ctxShared.engageWrapped = true;
      Game.convoWantEngage = function (vid, kind) {
        let before = null, wantId = null;
        try { const c = Game.convoGet(vid); before = c && c.want ? (c.want.stage || 0) : null; wantId = c && c.want ? (c.want.id || '?') : null; } catch (e2) {}
        const r = origEngage.call(this, vid, kind);
        try {
          let after = null, res = null;
          try { const c = Game.convoGet(vid); after = c && c.want ? (c.want.stage || 0) : null; res = c && c.want ? (c.want.resolution || null) : null; } catch (e2) {}
          ctxShared.wantResolutions.push({
            day: (Game.state.scholar || {}).day || 0,
            vid: String(vid), wantId, kind: kind || '?',
            stageBefore: before, stageAfter: after, resolution: res,
          });
        } catch (e2) {}
        return r;
      };
    } else { ctxShared.engageWrapped = false; }
  } catch (e) { ctxShared.engageWrapped = 'wrap-error: ' + e.message; }
  // r181 (M1-DIAG) PLOT-GATE WRAPS (PLOTGATE=1 only): wrap
  // considerBetrayalPlot + armPlot (read-only records). considerBetrayalPlot
  // is the daily gate: an eligible pair (motive >= threshold) still needs
  // the 40% roll AND >=2 recruited accomplices. The wrap records the best
  // pair it found, the accomplice count for that pair, and whether armPlot
  // fired inside the call — so a silent panel names its blocking gate
  // instead of guessing. Pure reads only (motiveBetween / recruitAccomplices
  // consume no RNG), so a PLOTGATE re-run reproduces the panel villages.
  if (process.env.PLOTGATE) {
    try {
      ctxShared.plotGate = ctxShared.plotGate || { days: [], arms: [], considers: [] };
      const origArm = Game.armPlot;
      if (typeof origArm === 'function') {
        Game.armPlot = function (leader, accomplices, target, motive) {
          const r = origArm.call(this, leader, accomplices, target, motive);
          try { ctxShared.plotGate.arms.push({ day: (Game.state.scholar || {}).day || 0, leader: vname(Game, leader), target: vname(Game, target), score: motive && motive.score }); } catch (e2) {}
          return r;
        };
      }
      const origConsider = Game.considerBetrayalPlot;
      if (typeof origConsider === 'function') {
        Game.considerBetrayalPlot = function () {
          const armsBefore = ctxShared.plotGate.arms.length;
          let best = null;
          try {
            const roster = this.npcIds();
            const cands = [...roster, this.villagerId];
            for (const a of roster) for (const b of cands) {
              if (a === b) continue;
              const m = this.motiveBetween(a, b);
              const th = this.isPlayer(b) ? 45 : 35;
              if (m.score >= th && (!best || m.score > best.score)) best = { a, b, score: m.score, threshold: th };
            }
          } catch (e2) {}
          let nAcc = null;
          if (best) { try { nAcc = (this.recruitAccomplices(best.a, best.b) || []).length; } catch (e2) {} }
          const r = origConsider.call(this);
          try {
            ctxShared.plotGate.considers.push({
              day: (Game.state.scholar || {}).day || 0,
              best: best ? { a: vname(Game, best.a), b: vname(Game, best.b), score: Math.round(best.score * 100) / 100, threshold: best.threshold } : null,
              nAccomplices: nAcc,
              armed: ctxShared.plotGate.arms.length > armsBefore,
            });
          } catch (e2) {}
          return r;
        };
      }
    } catch (e) { ctxShared.plotGate = 'wrap-error: ' + e.message; }
  }
  const policy = makePolicy(Game, ctxShared);
  ctxShared.bondSnaps = [];
  // wrap daily to tag moot narration: capture day-lines when a moot fired
  const innerDaily = policy.daily;
  policy.daily = function (G2, ctx) {
    const m0 = ctx.socialMoots || 0;
    const c0 = captured.length;
    innerDaily(G2, ctx);
    if ((ctx.socialMoots || 0) > m0) {
      const lines = captured.slice(c0).slice(0, 60);
      let petKind = '?';
      try { const p = G2.state ? G2.state.pendingPetition : null; petKind = (p && (p.kind || p.id)) || '?'; } catch (e) {}
      ctxShared.mootNotes.push({ day: (G2.state.scholar || {}).day || 0, mootFired: true, petitionKind: petKind, nLines: lines.length, lines });
    }
    const d = (G2.state.scholar || {}).day || 0;
    // r154 (B) COUNTER-SETTLE: a real player answers the counter on the
    // table (app.js buttons); the r149 driver never did. Settle once per
    // day so a staged counter does not sit unanswered while villagers
    // re-raise around it. 'accept' forms the link on their terms; the
    // record carries the tribute + pantry so the report can judge
    // whether the price was survivable. Blocked (exiled/joined) settles
    // return null from the _blockIfNotHaven wrap and are recorded as such.
    try {
      const pc = G2.state ? G2.state.pendingCounter : null;
      if (pc && typeof G2.answerCounter === 'function') {
        let pantryKcal = null;
        try { pantryKcal = Math.round(((G2.state.village || {}).pantry || []).reduce((t, i) => t + (i.kcalEach || 0) * (i.units || 1), 0)); } catch (e2) {}
        const res = G2.answerCounter('accept');
        let resSummary = null;
        try { resSummary = JSON.stringify(res).slice(0, 300); } catch (e2) { resSummary = String(res).slice(0, 300); }
        let linkFormed = null;
        try { linkFormed = !!(pc.targetId && G2.linkWith && G2.linkWith(pc.targetId)); } catch (e2) {}
        ctxShared.counterSettles.push({ day: d, targetId: pc.targetId || null, tribute: pc.tributeKcalPerWeek || null, pantryKcalAtSettle: pantryKcal, result: resSummary, linkFormed });
      }
    } catch (e2) {}
    // r141 succession tracking (read-only): note mantle passes.
    try {
      const b = G2.villagerId;
      if (ctxShared.lastBearer !== null && b !== ctxShared.lastBearer) {
        ctxShared.successions.push({ day: d, from: vname(G2, ctxShared.lastBearer), to: vname(G2, b) });
      }
      ctxShared.lastBearer = b;
    } catch (e) {}
    // r141 M6 (read-only, correction 3): nightly haven-news census,
    // aggregated from the emit-time classification (newsLines), NOT from
    // a text slice — a slice conflates WHEN a line was emitted with
    // WHERE the scholar was the next morning. Counts per kind are split
    // by the scholar's position AT EMIT TIME: plain counts = lines
    // delivered at Haven (the debate alive), *Away counts = lines
    // emitted while away (the defect — must be 0). newsLines is never
    // trimmed, so index slicing over it is safe. Stranded is still the
    // daily-exit notion (where they spent the night), kept for context.
    // No Game call changes, no RNG.
    try {
      const n0 = ctxShared._newsIdx || 0;
      const dayLines = newsLines.slice(n0);
      ctxShared._newsIdx = newsLines.length;
      // r154: shared helper — strict (on-tile) AND gate (radius-1) counts.
      const agg = aggregateNightlyNews(dayLines);
      const { burst, settle, witness, tale, burstAway, settleAway, witnessAway, taleAway,
        burstAwayGate, settleAwayGate, witnessAwayGate, taleAwayGate } = agg;
      let stranded = false;
      try { stranded = !G2.scholarAtHaven(); } catch (e2) {}
      ctxShared.nightlyNews.push({ day: d, stranded, burst, settle, witness, tale, burstAway, settleAway, witnessAway, taleAway, burstAwayGate, settleAwayGate, witnessAwayGate, taleAwayGate });
    } catch (e2) {}
    if (d === 30 || d === 60 || d === 90) ctxShared.bondSnaps.push(bondSnap(G2));
    if (d === 30 || d === 60 || d === 90 || d === 120) ctxShared.darkSnaps.push(darkSnap(G2));
    // r181 (M1-DIAG) PLOT-GATE CENSUS (PLOTGATE=1 only): per-day motive
    // maximum + live conflicts. Read-only pure reads; no RNG consumed.
    if (process.env.PLOTGATE) {
      try {
        const vv2 = G2.state.village || {};
        const roster2 = (G2.npcIds && G2.npcIds()) || [];
        const cands2 = [...roster2, G2.villagerId];
        let maxM = null;
        for (const a of roster2) for (const b of cands2) {
          if (a === b) continue;
          let m = null;
          try { m = G2.motiveBetween(a, b); } catch (e2) {}
          if (!m) continue;
          const th = (G2.isPlayer && G2.isPlayer(b)) ? 45 : 35;
          if (!maxM || m.score > maxM.score) maxM = { a: vname(G2, a), b: vname(G2, b), score: Math.round(m.score * 100) / 100, threshold: th, eligible: m.score >= th, reasons: m.reasons };
        }
        ctxShared.plotGate = ctxShared.plotGate || { days: [], arms: [], considers: [] };
        ctxShared.plotGate.days.push({
          day: d, roster: roster2.length,
          conflicts: (vv2.conflicts || []).map(c => ({ a: vname(G2, c.a), b: vname(G2, c.b), tension: c.tension, resolved: !!c.resolved, known: !!c.known })),
          maxMotive: maxM,
        });
      } catch (e2) {}
    }
  };
  const result = await runDays(Game, policy, { days: DAYCAP, manifest });
  const ms = Number(process.hrtime.bigint() - t0) / 1e6;
  const cen = census(Game, seed);
  // end-state trust table + talk-request answer rate
  const vv = Game.state.village || {};
  const trustTbl = (vv.roster || []).map(vid => ({ who: vname(Game, vid), trust: trustOf(Game, vid) }));
  trustTbl.sort((a, b) => b.trust - a.trust);
  // gossip read: village rep record + per-villager rumor spread (r110)
  let repSample = null;
  try {
    const rep = vv.rep || {};
    const keys = Object.keys(rep);
    repSample = { n: keys.length, sample: keys.slice(0, 5).map(k => ({ k: String(k).slice(0, 40), v: rep[k] })) };
  } catch (e) {}
  let rumorSpread = [];
  try {
    for (const vid of (vv.roster || []).slice(0, 5)) {
      let per = null;
      try { const p = Game.getPerson(vid) || {}; per = p.rumors || p.rep || p.reputation || null; } catch (e) {}
      rumorSpread.push({ who: vname(Game, vid), rumors: per ? JSON.stringify(per).slice(0, 300) : null });
    }
  } catch (e) {}
  let bondEnd = null;
  try { bondEnd = bondSnap(Game); } catch (e) {}
  let darkEnd = null;
  try { darkEnd = darkSnap(Game); } catch (e) {}
  // r154 (B): pending counter at village end — an unanswered counter is
  // the loop's smoking gun if the settle never fired for it.
  let pendingCounterEnd = null;
  try { const pc = Game.state ? Game.state.pendingCounter : null; pendingCounterEnd = pc ? { targetId: String(pc.targetId), tribute: pc.tributeKcalPerWeek || null, day: pc.day || null } : null; } catch (e) {}
  // r181 (C1) SCATTERING CAPTURE: r159's 42703 village ended at d46 with
  // 5 alive and the corpus could not confirm the scattering path
  // (game.js: pantry empty for 3+ hungry days -> people walk away, the
  // village ends without extinction). Record the flag + hunger count so
  // a scattered ending is confirmed from the record, not by elimination.
  let scatteringEnd = null;
  try {
    const vvend = Game.state.village || {};
    scatteringEnd = {
      scattered: !!vvend.scattered,
      hungryDays: vvend.hungryDays || 0,
      aliveEnd: (vvend.roster || []).length,
      endReason: result.endReason,
    };
  } catch (e) { scatteringEnd = { error: 'scatteringEnd: ' + e.message }; }
  // r226 (B5): funeral-mend stats at village end (read-only). If the
  // Game never sets funeralMendStats, this serializes null and the
  // analyzer reports the instrument as unobserved, not as zero.
  let funeralMendStats = null;
  try { funeralMendStats = (Game.state.village || {}).funeralMendStats || null; } catch (e) {}
  // r141 M6: end-state naming census (read-only) — which debates kicked
  // and settled, and what is still queued for the scholar's return.
  let namingEnd = null;
  try {
    namingEnd = Object.entries((Game.state.codex || {}).monsters || {}).map(([mid, e]) => ({
      mid, reported: !!e.reported, namingKicked: !!e.namingKicked,
      villageName: e.villageName || null, proposals: Object.keys(e.proposals || {}).length,
      queued: (Game.state.pendingHavenNews || []).filter(q => q.mid === mid).length,
    }));
  } catch (e) {}
  let ambushLines = [];
  try {
    ambushLines = captured.filter(c => /ambush|sprang|trap|betray|stands accused|Word reaches you/i.test(String(c.t || ''))).slice(0, 200);
  } catch (e) {}
  // r141: scholar name (for the analyzer's player-vs-NPC inviter split)
  // + one bond sample (to see whether the engine records an initiator).
  let scholarName = null;
  try { scholarName = vname(Game, Game.villagerId); } catch (e) {}
  let bondSample = null;
  try {
    const b = vv.bonds || {};
    const k = Object.keys(b)[0];
    bondSample = k ? { key: String(k).slice(0, 80), val: JSON.stringify(b[k]).slice(0, 500) } : null;
  } catch (e) {}
  const evidence = {
    seed, manifest, ms: Math.round(ms / 1000) + 's',
    days: result.days, endReason: result.endReason,
    gameDay: (Game.state.scholar || {}).day,
    scatteringEnd,
    funeralLines: ctxShared.funeralLines, funeralMendStats,
    funeralMends: ctxShared.funeralMends, mendWrapped: ctxShared.mendWrapped,
    wantResolutions: ctxShared.wantResolutions, engageWrapped: ctxShared.engageWrapped,
    scholarName,
    initialBearer: ctxShared.initialBearer, successions: ctxShared.successions,
    social: (function () {
      const ctx = ctxShared.ctx || {};
      return {
        fullConvs: ctx.socialConvs || 0,
        naturalEnds: ctx.socialNaturalEnds || 0,
        forced: ctx.socialForced || 0,
        quickTalks: ctx.socialTalks || 0,
        feasts: ctx.socialFeasts || 0,
        moots: ctx.socialMoots || 0,
        cries: ctx.socialCries || 0,
        switch: ctx.socialSwitch || 0,
        transcripts: ctx.socialTranscripts || [],
        met: (ctx.metSet || new Set()).size,
      };
    })(),
    trustTbl, repSample, rumorSpread, bondSnaps: ctxShared.bondSnaps, bondEnd, bondSample,
    decisionWrapped: ctxShared.decisionWrapped, lureDecisions: ctxShared.lureDecisions,
    proposeWrapped: ctxShared.proposeWrapped, proposeCalls: ctxShared.proposeCalls,
    answerWrapped: ctxShared.answerWrapped, counterAnswers: ctxShared.counterAnswers,
    counterSettles: ctxShared.counterSettles, pendingCounterEnd,
    confrontWrapped: ctxShared.confrontWrapped, confrontEvents: ctxShared.confrontEvents,
    ...(process.env.PLOTGATE ? { plotGate: ctxShared.plotGate } : {}),
    bondProposed: ctxShared.bondProposed,
    armWrapped: ctxShared.armWrapped, armEvents: ctxShared.armEvents,
    springWrapped: ctxShared.springWrapped, springEvents: ctxShared.springEvents,
    expireWrapped: ctxShared.expireWrapped, expiredEvents: ctxShared.expiredEvents,
    darkSnaps: ctxShared.darkSnaps, darkEnd, ambushLines,
    nightlyNews: ctxShared.nightlyNews, namingEnd,
    mootNotes: ctxShared.mootNotes,
    talkReqSeen: ctxShared.talkReqSeen,
    outingArm: ctxShared.outingArm || [], outingArmErrors: ctxShared.outingArmErrors || [],
    pantryDawn: ctxShared.pantryDawn || [], pantryDawnErrors: ctxShared.pantryDawnErrors || [],
    f5reask: ctxShared.f5reask || null, f5reaskErrors: ctxShared.f5reaskErrors || [],
    census: cen,
    fallenFull: ((Game.state.village || {}).fallen || []).map(f => {
      let nm = '?'; try { nm = vname(Game, f.villagerId); } catch (e) {}
      return { who: nm, day: f.day, cause: f.cause || '?' };
    }),
    telemetryDeaths: (result.samples.deaths || []).length,
    pacing: result.pacing ? {
      meanVerbsPerDay: result.pacing.meanVerbsPerDay,
      meanPolicyCallsPerDay: result.pacing.meanPolicyCallsPerDay,
      meanTicksPerDay: result.pacing.meanTicksPerDay,
    } : null,
    pacingDays: (result.pacing ? result.pacing.perDay : []).slice(0, 140).map(r => ({ d: r.day, v: r.verbs, p: r.policyCalls })),
    samples: {
      pop: result.samples.pop, trust: result.samples.trust, pantry: result.samples.pantry,
      knowledge: result.samples.knowledge, deaths: result.samples.deaths,
    },
  };
  return { Game, evidence, ctxShared };
}

(async () => {
  fs.mkdirSync(OUTDIR, { recursive: true });
  const seedsOut = [];
  for (const seed of SEEDS) {
    console.log(`=== seed ${seed} (DAY_CAP=${DAYCAP}) ===`);
    const { evidence, ctxShared } = await oneSeed(seed);
    seedsOut.push(evidence);
    const outFile = path.join(OUTDIR, `journey-social-life-r277-${seed}.json`);
    // r277: write-flap resilience — the host intermittently refuses writes
    // (EPERM) in bursts of ~a minute; a single refused chunk truncates the
    // evidence file to 0 bytes and aborts the panel. The sim content is
    // deterministic, so retrying the SAME bytes changes nothing about the
    // evidence — it only survives the burst. Each attempt writes a FRESH
    // temp name (never the truncated target — an emptied file stays
    // refused) and renames onto the target only on success. (Same family
    // as the repo's robust_write; r268 lost its 45829 JSON to exactly this.)
    const payload = JSON.stringify(evidence, null, 1);
    let written = false;
    for (let attempt = 1; attempt <= 20 && !written; attempt++) {
      const tmpFile = `${outFile}.tmp${attempt}`;
      try {
        fs.writeFileSync(tmpFile, payload);
        fs.renameSync(tmpFile, outFile);
        written = true;
      } catch (e) {
        try { fs.unlinkSync(tmpFile); } catch (_) {}
        console.error(`write attempt ${attempt}/20 failed (${e.code || e.message}); retrying in 10s`);
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 10000);
      }
    }
    if (!written) throw new Error(`evidence write failed after 20 attempts: ${outFile}`);
    console.log(`day ${evidence.gameDay} endReason=${evidence.endReason} ms=${evidence.ms}`);
    console.log(evidence.census.slice(0, 6).join('\n'));
  }
  console.log('DONE');
})().catch(e => { console.error('FATAL', e && e.stack || e); process.exit(1); });
