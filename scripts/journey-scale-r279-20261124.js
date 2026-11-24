// scripts/journey-scale-r279-20261124.js — journey-scale r279 driver cloned
// from the r273 driver (which cloned r251). PLAYTEST LEG, NOT a
// lever round: SINGLE ARM, the r244-r251 control policy verbatim
// (scalecourt-traderoad-r113-linkraise-sit + muster ON + march ON,
// MUSTER_HOLD=sitting, STAGE_CAPSTONE=off, ANSWERMAIL off). The sub-cap
// lever is NOT re-run (r245 judged it PARTIAL; composition stays a
// branch). This run plays leg 3 SCALE on current master and judges
// reachable/fun/winnable.
// POLICY CHANGE vs r273: none — the r273 driver verbatim INCLUDING the
// r273 fruitless-march stand-down (7 fruitless march days -> stand the
// muster down + 30-day re-call cooldown). This panel is the BAND-WIDE
// measurement of that fix (proven on one seed in r273: muster hunger
// 251 -> 52, national 45 -> 70 days on seed 106282). No other policy
// change.
// PRE-REGISTER: evidence/2026-11-24/journey-scale-r279-prereg.md
// (binding; Q1: PLAYTEST — national /8, table offered /8, full seat /8,
//   wave-4 kills, wave-5 faced, standing-199 stall, survival to 140d.
//   Interesting iff >=3/8 national OR a new blocker class OR a fixable
//   defect in the table-approach path. Q2: blocker taxonomy. Q3:
//   regression guards (r244 verbatim). Q4: people check. Q5: census +
//   spotter + W5-INSTANCE. Q6: dialogue watch (carried).
//   Horizon: DAYCAP=140 loop-days (the leg window d80-140), death-aware
//   stop (+10d tail max).
//   Seeds: FRESH 106319-106326 (freshness search: repo evidence/**/*.md
//   + scripts/**/*.js + docs/ + goal hidden_files/**/*.md + perseed
//   corpus filenames — 0 hits everywhere. r273 spent 106277-106285;
//   106301-106308 is SPENT by sim-reseedexpiry-b (Nov 20 prereg); the
//   106286 hit in sweep .json contents is outside the prereg search
//   scope but the next clean 9-block starts at 106319 regardless.
//   106319-106327 is the next clean 9-block, recorded in the prereg,
//   do not reuse).
//   Pilot: seeds 106319-106321 first. Pilot gates: crash,
//   census errors > 0, 0 census rows, reconciliation residual != 0,
//   teleOnly > 0, 0 trustset rows by d60, 0 national-gate rows, or no
//   vetbar rows by d60 -> STOP and diagnose (INCOMPLETE, not a verdict).
// Usage: SEEDS=106319,106320,106321 ARM=B node scripts/journey-scale-r279-20261124.js
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SEEDS = (process.env.SEEDS ? process.env.SEEDS.split(',').map(s => parseInt(s, 10)) : [106319, 106320, 106321, 106322, 106323, 106324, 106325, 106326]);
const DAYCAP = parseInt(process.env.DAYCAP || '140', 10);
const SUBJECT_FIRST = process.env.WANT_SUBJECT === '1';
const GOSSIP_FIRST = process.env.GOSSIP_FIRST === '1';
// R55 PROBE: extra talks with a pinned NPC on extra days (probe-only runs;
// inert before the first probe day, so a probe run matches the quad run
// through day 90).
const PROBE_VID = process.env.PROBE_VID || null;
const PROBE_DAYS = (process.env.PROBE_DAYS || '').split(',').map(s => parseInt(s, 10)).filter(n => !isNaN(n));
const PROBE_SEED = parseInt(process.env.PROBE_SEED || '85003', 10);
const ARM = (process.env.ARM || 'A').toUpperCase();
const ARML = ARM.toLowerCase(); // corpus filenames are lowercase (the analyzer reads journey-scale-r279-a|b-...)
const SORTIE = false; // r239: the sortie step is INERT (the r219/r223 decision stands — the sortie-gate call is still owed, not made here). The r215-owed W5-INSTANCE blank is read from the monster census, not the sortie ledger.
const MUSTER = true; // r239: the MUSTER step runs — r227 verbatim, r228 arm B carried forward as the policy.
const MARCH = true; // r239: the titan-muster MARCH step runs — walk a READY muster to the lair tile so the coalition fight starts; no longer a lever, it is the competent policy.
// r239 Q6: which predicate holds the muster + march steps? 'active' (arm A,
// r239 verbatim — hold whenever tableActive(), mercy window included) or
// 'sitting' (arm B — hold only while a table sequence is actually live).
const MUSTER_HOLD = (process.env.MUSTER_HOLD || 'active').toLowerCase();
if (MUSTER_HOLD !== 'active' && MUSTER_HOLD !== 'sitting') throw new Error('MUSTER_HOLD must be active|sitting, got ' + process.env.MUSTER_HOLD);
// r243 Q1 STAGE (the r239-owed precondition — a delivered capstone while
// the herald still lives): 'herald' stages the military tribute the first
// day a herald-class titan is located (omen stage >=2) AND present in the
// world. The stage arms, holds the herald's muster call until the tribute
// is payable (2 living wave-4 veterans, the real delivery verb, real price
// — two veterans leave), then delivers via ladderDeliverCapstone and
// disarms. The delivery timing is the staged choice (deliver now instead
// of waiting for national, the competent-player default that kills the
// herald first); the village, the herald, the coalition and the fight are
// all real play. 'off' disables staging (natural history). Arm-independent:
// both arms stage identically; the arms diverge only in MUSTER_HOLD after
// delivery. Abandon: herald slain before delivery, or tribute not payable
// by day 120 (the muster is released so the village keeps its herald
// fight). A capstone delivered by the natural R113 verb while the herald
// lives satisfies the stage without intervention ('natural').
const STAGE_CAPSTONE = (process.env.STAGE_CAPSTONE || 'off').toLowerCase();
if (STAGE_CAPSTONE !== 'herald' && STAGE_CAPSTONE !== 'off') throw new Error('STAGE_CAPSTONE must be herald|off, got ' + process.env.STAGE_CAPSTONE);
let stageWatch = [];
let stageState = null;
const EVIDIR = process.env.EVIDIR ? path.resolve(process.env.EVIDIR) : path.join(ROOT, '..', '..', 'goals', 'the-scattering-roguelite-survival-game', 'hidden_files', 'evidence', '2026-11-24');
const PELLET_DECLINE = process.env.PELLET_DECLINE === '1';
const TEND_PEER = process.env.TEND_PEER === '1'; // r92 Q2b: press tendLink on below-40 peer links after courtship (offered verb only)
fs.mkdirSync(EVIDIR, { recursive: true });

const { mulberry32, loadGame, setupGame, runDays } = require('./sim-harness');
const REGINST = require('./regionalstep-instrument-20261107'); // r107 Q1: regional-gate recorder (require, not a copy)
const LIINST = require('./ladder-instrument-20261109'); // r112 Q1: Standing-ladder trace (require, not a copy)
const CAPSRENDER = require('./ladder-caps-render'); // r197: honest caps column (delivered vs seat-open, not a collapsed 'delivered')
const TRINST = require('./traderoad-instrument-20261109'); // r122 Q1+Q2: trade-road trace + wild wave-4 watch (require, not a copy)
const DCINST = require('./deathcensus-instrument-20261110'); // r125 Q2: death-cause census (require, not a copy)
const SCINST = require('./scholarcount-a-driver'); // r130 Q1/Q3: scholar-counts census (require, not a copy; main() is require.main-guarded, so requiring it runs nothing)
const FILL_ARM = process.env.FILL_ARM === '1'; // r105 Q1: select the r102 narrowed-fill policy variant; unset = r104 control policy
// r122: SINGLE LEG (a BUILD + MEASURE of the trade road and the
// wild-w4 question — the policy is the new lever, the ladder is the
// same ladder r112 measured). The sit layer is OFF for this run
// (PILOT ADDENDUM — see the prereg): the table offer is STANDING
// (Steve 2026-11-06), so a competent player chasing the FULL seat lets
// the lesser seat wait instead of taking it at d90 and ending the run
// before a charter could seal (~d95+ on the pilot's pace). The modal
// layer stays armed but is inert without a sit. Q3 is re-scoped to
// lesser-seat PRICED, not taken (the offer stands; the price is the
// measurable half).
const SIT = false;
process.env.SEATDRIVE = '0'; process.env.MODALPLAY = '1';
const SUBCAPOFF = process.env.SUBCAPOFF === '1'; // r276 Q1: arm C only — use the sub-cap-off linkraise policy
const LR = SUBCAPOFF
  ? require('./policies/scalecourt-traderoad-r113-linkraise-subcapoff-sit')
  : require('./policies/scalecourt-traderoad-r113-linkraise-sit');
const AM = null; const ANSWERMAIL = false; // r244 Q1 NO-GO: answermail stays a branch — off on both arms; the ledger writes below still emit null stats so the analyzer's ANSWERMAIL section reads zeros.
const scalecourt = LR.sitPolicy;
const { walkTo } = require('./policies/competent-nofallback'); // r239 MARCH: the competent hop-by-hop walk (travelTargets/travelTo, honest travel costs + encounter risk) — require, not a copy

let _G = null, _currentSeed = null, capture = [];
// R24 table-approach instruments: weekly seat samples + global-answer notes,
// reset per seed in playSeed().
let seatWatch = [], globalNotes = [], poolWatch = []; // R31: weekly league-pool samples {day, pool, pantry}
let villageWatch = []; // R31: weekly village census {day, villages:[{id,name,dist,known,rumored,generated,opinion,codexGiven,linkKind,linkTrust,linkAge}]}
let trustWatch = [], trustEvents = [], prevHist = {}; // R34: DAILY link-trust snapshots + new link.history entries as they appear (history is capped at 40, so daily diffing preserves the engine's own book)
let betrayWatch = [], betraySubjects = {}; // R42: accepted-betrayal subjects + daily person snapshots
let hungerWatch = []; // R42: daily hunger-window instrument (READ-ONLY — every field is a read)
let tableWatch = []; // R42: daily table-approach instrument (READ-ONLY — every field is a read; tableSeat() is the same call progression.js makes at arc transitions, seatSample already calls it weekly)
let dutyWatch = []; // R65 Q2: daily duty-gate instrument (READ-ONLY — every field is a read)
let wsplitWatch = []; // R66 Q1: daily weaponless-split instrument (READ-ONLY — every field is a read)
let fusionWatch = []; // R90 Q2: daily fusion-reactor instrument (READ-ONLY — every field is a read)
let fusionFeast = []; // R90 Q2: day-attributed feast grant/refusal lines from capture (READ-ONLY)
let natGateWatch = []; // R103 Q1: daily national-staging gate snapshot (READ-ONLY — every field is a read; polityOf / foreignPolities / hierarchyState are the engine's own read APIs)
let mornTrace = []; // R97 Q1: overnight-window position snapshots (READ-ONLY)
let scRows = []; // r130 Q1/Q3: scholar-counts daily census rows (SCINST.snapshotLadder)
let scKillSamples = []; // r130 Q1: kill-time veteran samples (SCINST.wrapKillRecorder)
let scKillErrors = []; // r130 Q1: kill-recorder errors (must stay 0)
let vetbarWatch = []; // r133 Q2: daily vetbar rows (READ-ONLY — every field is a read: readiness(4/5).veterans, shadow old-rule counts, _ladderLivingVeterans(3/4), villageBlooded(), roster size)
let spotterWatch90 = []; // r223 Q5 (r207-owed): the d90 spotter/foodXp snapshot — the end-only census() snapshot cannot read a collapse-heavy band (empty rosters on 0/4 survival). Same shape as census().spotterWatch, taken while the roster still lives.
let monsterWatch = []; // r223 Q5/W5-INSTANCE (r207-owed): daily worldMonsters() snapshot {day, monsters:[{id,wave,tx,ty,mx,my,hp,maxHp,veteran,lingerKey}]} — the live wave-5 entity census, so the analyzer can tell one wounded Editor fought again from fresh full-HP spawns. READ-ONLY.
let fightInst = []; // r223 W5-INSTANCE (r207-owed): per-fight entity identity rows (scholar startCombat + villager fieldFight). READ-ONLY wrappers, forward exactly.
let sortieWatch = [];
let musterWatch = []; // r227 Q1 MUSTER (r239): one row per day with a located titan - {day, titan, stage, present, ready, bladesAllied, bladesHaven, called, committed, held, council} - plus a 'none' row is never written (absence of a row IS the no-located-titan day).
let marchWatch = []; // r239 Q1 MARCH  one row per ready-muster titan per day - {day, titan, stage, lair, from, arrived, onTile, pending, held} - plus a 'none' row is never written (absence of a row IS the no-ready-muster day).
let titanEnd = null; // r227 Q1: end-state snapshot of state.titans (omens, musters, slain, outcomes) + verb-call log - the engine's own engagement record (refused / fought -> slain / fled).
let _councilSat = {}; // r227 Q1: titans the war council has sat for (once per titan per seed - the played beat, said aloud; the daily decision reads titanCallReadiness, the same computation the council shows).
let _marchFruitless = {}; // r273: consecutive arrived-but-no-pending march days per titan — a roaming titan the march chases without ever engaging (106282: 64 days, 0 pending). Carried into r276.
let _fruitlessStanddown = {}; // r276: day a titan's muster was stood down for fruitless marching — the muster step holds the re-call for 30 days (a season) so the stand-down sticks.
const TITANVERBS = { calls: [], errors: [] }; // r227 Q1 (r226 pattern): wraps on the four muster verbs - catches any call outside the muster step. Pure logging, forwards exactly. // r223 (r215-owed W5-INSTANCE): one row per day with lingerers — {day, seen, minHp, sumHp, held, called, cleared, broke} — plus a 'none' row is never written (absence of a row IS the no-lingerer day).
let raiseDebug = []; // r223 PROBE (RAISE_DEBUG=1): bondChoices calls where a link raise is pending — the flag state + offered choices + THEM lines so far. Read-only logging, no game effect.

// R27 dedup instrument (journey-scale r27 2026-10-24): day-attributed capture
// of the two BIGGER-STAGE beat classes — game.js Beat 4 (scalePointerW4) vs
// scaleDiscovery._sdNextAct. Both fire = the pre-fix double-pitch signature.
let beatWatch = []; // {day, cls, line}
const BEAT4_RX = /cleared the board!|get me standing/i;
const SDNEXTACT_RX = /can't stage what's coming|get me a network/i;

// R99 water-refusal instrument (driver-only, prereg Q1): day-attribute the
// two fillWater refusal lines — "The cistern is dry" (cistern clean < 1)
// and "Your pack is full" (canCarry(1) false) — so the walk-out classifier
// can corroborate a cistern-dry vs pack-full separator per day. Read-only
// classification of the say capture, same pattern as govWatch.
let waterWatch = []; // {day, cls, line}
const WATER_DRY_RX = /cistern is dry/i;
const WATER_FULL_RX = /pack is full.*water is heavy/i;

// R29 governance instrument: day-attributed capture of the three mechanisms
// the LEAD national beat names — tribute routing, court calendar, famine
// reserves — plus the first-court staging itself. Classes:
//   govAnnounce — the GOVERNANCE LAYER line (first-court staging)
//   tribArrive  — subordinate tribute arrives in Haven's pantry (linkTick)
//   tribShort   — tribute short / light / arrears (shortfall said aloud)
//   courtPost   — any court/calendar line AFTER the govAnnounce day (the
//                 classifier marks candidates; the analyzer splits pre/post
//                 by firstCourtDay, since cap() cannot know the future)
//   granaryDraw — league-granary / pool draw lines (famine relief)
//   feastCourt  — the first-court granary feast payout line
let govWatch = [];
const GOV_RX = /governance layer: online/i;
const TRIB_ARRIVE_RX = /tribute from .* arrives|tribute .* arrives —|their fields, our fire/i;
const TRIB_SHORT_RX = /tribute (short|arrives light)|arrears/i;
const COURT_RX = /court|calendar/i;
const GRANARY_DRAW_RX = /league granary opens|draws .* from the league granary|pantry stands empty — and the league granary/i;
const FEAST_RX = /shared granary opens/i;
function govClass(s) {
  if (GOV_RX.test(s)) return 'govAnnounce';
  if (TRIB_ARRIVE_RX.test(s)) return 'tribArrive';
  if (TRIB_SHORT_RX.test(s)) return 'tribShort';
  if (GRANARY_DRAW_RX.test(s)) return 'granaryDraw';
  if (FEAST_RX.test(s)) return 'feastCourt';
  if (COURT_RX.test(s)) return 'courtLine';
  return null;
}

function cap(line) {
  if (line == null) return;
  const s = String(line);
  if (capture.length && capture[capture.length - 1] === s) return;
  capture.push(s);
  // day-attribute the two beat classes (the r26 say/emit wrapper calls cap)
  try {
    if (BEAT4_RX.test(s)) beatWatch.push({ day: gday(), cls: 'beat4', line: s.slice(0, 160) });
    else if (SDNEXTACT_RX.test(s)) beatWatch.push({ day: gday(), cls: 'sdNextAct', line: s.slice(0, 160) });
    const gc = govClass(s);
    if (gc) govWatch.push({ day: gday(), cls: gc, line: s.slice(0, 200) });
    if (WATER_DRY_RX.test(s)) waterWatch.push({ day: gday(), cls: 'cistern-dry', line: s.slice(0, 200) });
    else if (WATER_FULL_RX.test(s)) waterWatch.push({ day: gday(), cls: 'pack-full', line: s.slice(0, 200) });
    if (/FEASTED ×/.test(s)) fusionFeast.push({ day: gday(), cls: 'feast-grant', line: s.slice(0, 200) });
    else if (/reactor hums its steady note/.test(s)) fusionFeast.push({ day: gday(), cls: 'feast-refusal-reactor', line: s.slice(0, 200) });
    else if (/Feast buff refused: devotion gate/.test(s)) fusionFeast.push({ day: gday(), cls: 'feast-refusal-devotion', line: s.slice(0, 200) });
    else if (/FUSION REACTOR: the pellet goes in/.test(s)) fusionFeast.push({ day: gday(), cls: 'pellet-installed', line: s.slice(0, 200) });
  } catch (e) {}
}
function gday() { try { return (_G.state && _G.state.scholar && _G.state.scholar.day) || 0; } catch (e) { return 0; } }
function vname(vid) { try { return _G.displayName(vid) || vid; } catch (e) { return vid; } }
function person(vid) { try { return _G.getPerson(vid) || {}; } catch (e) { return {}; } }
// R39 betrayal instrument (READ-ONLY): snapshot an accepted-betrayal
// subject's person state so the run can tell whether an accept changed
// anything after the talk. No engine input is touched.
function personSnap(vid) { try { const p = person(vid); const roster = (_G.state.village || {}).roster || []; return { dead: !!p.dead, trust: ((_G.state.village.trust || {})[vid] ?? null), inRoster: roster.indexOf(vid) !== -1 }; } catch (e) { return { err: String(e && e.message) }; } }
function pantryKcal() {
  try {
    return ((_G.state.village || {}).pantry || [])
      .reduce((t, i) => t + (i.kcalEach || 0) * (i.units || i.count || 1), 0);
  } catch (e) { return 0; }
}
// r223 arm B SORTIE STEP (r215-owed W5-INSTANCE — driver-local, policy-side,
// no src/js change). Gates verbatim from scripts/policies/partyfinish.js
// (sim-partyfinish-a sortie-only driver, 2026-10-28): the village marches
// only when the treeline is weak enough that a mustered party can plausibly
// finish it — risk-weighted finish (Steve 2026-10-27), not unconditional.
// Called once per policy day, after the base daily. Every day with
// lingerers records exactly one sortieWatch row (called, or held + the
// first failing gate) so the analyzer can tell "no lingerer" (no row)
// from "gates held" (held row). Inert in r239 (SORTIE false).
let _sortieLastDay = null;
function sortieStep(G, ctx) {
  const day = gday();
  let lingerers = [];
  try { const ms = (typeof G.worldMonsters === 'function') ? G.worldMonsters() : []; lingerers = (ms || []).filter(m => m && m.lingering && (m.hp || 0) > 0); } catch (e) { lingerers = []; }
  if (!lingerers.length) return; // no row: absence IS the no-lingerer day
  let minHp = Infinity, sumHp = 0, w5 = 0;
  for (const m of lingerers) { const hp = m.hp || 0; if (hp < minHp) minHp = hp; sumHp += hp; if ((m.wave | 0) === 5) w5 += 1; }
  const row = { day, seen: lingerers.length, w5seen: w5, minHp, sumHp, held: null, called: false, cleared: null, broke: false };
  const hold = (why) => { row.held = why; sortieWatch.push(row); };
  // Sanctity (partyfinish.sanctityOk): no fight/encounter/table in flight.
  try {
    if (G.over) return hold('over');
    if (G.tbfight && !G.tbfight.over) return hold('tbfight');
    if (G.pendingEncounter) return hold('pendingEncounter');
    if (typeof G.tableActive === 'function' && G.tableActive()) return hold('tableActive');
    const s = (G.state || {}).scholar || {};
    if (G._sleeping || s.insideTent) return hold('sleeping');
  } catch (e) { return hold('sanctity-error'); }
  if (_sortieLastDay != null && day - _sortieLastDay < 6) return hold('cooldown');
  if (!(minHp <= 80)) return hold('minHp');
  if (!(sumHp <= 300)) return hold('sumHp');
  let healthy = 0;
  try {
    const v = G.state.village || {};
    const me = G.villagerId;
    healthy = (v.roster || []).filter(id => id !== me && !(v.away && v.away[id]) && ((v.health || {})[id] === undefined || (v.health || {})[id] > 40)).length;
  } catch (e) { healthy = 0; }
  if (healthy < 2) return hold('muster');
  const pantry = pantryKcal();
  if (pantry == null || pantry < 12000) return hold('pantry');
  _sortieLastDay = day;
  let ret = null;
  try { ret = (typeof G.answerLingerer === 'function') ? G.answerLingerer('sortie') : null; } catch (e) { row.held = 'sortie-error:' + String((e && e.message) || e).slice(0, 80); sortieWatch.push(row); return; }
  row.called = true;
  if (ret && typeof ret.cleared === 'number') row.cleared = ret.cleared;
  if (ret && ret.broke) row.broke = true;
  try { ctx.sortieCalls = (ctx.sortieCalls | 0) + 1; } catch (e) {}
  sortieWatch.push(row);
}
// r227 Q1 MUSTER STEP (the r223-owed blank — driver-local, policy-side,
// no src/js change). The competent player answers a located titan: sit
// the war council once per titan (the played beat), then sound the call
// and commit Haven's own the moment the coalition is completable.
// Called once per policy day, after the base daily, next to the sortie
// step. Every day with a located titan records exactly one musterWatch
// row per titan (called, ready, or held + the first failing reason) so
// the analyzer can tell "no located titan" (no row) from "the coalition
// was short" (held row). Runs in r239 (MUSTER true).
// Rules (frozen in the prereg):
//   - the call is sounded ONLY when the projection completes the muster
//     (titanCallReadiness total >= need): a hopeless call burns trust
//     -8 per refusing link for blades that cannot finish the fight.
//   - Haven's own are committed (two taps, back-to-back) only after the
//     call, up to the 3-blade cap; the step never outfits allies.
//   - a muster standing for a titan no longer present (or slain) is
//     stood down, so upkeep stops.
// Fidelity caveat (prereg): the driver sounds/commits from anywhere;
// in real play these are camp self-bar verbs (the player must be at
// camp). The sim OVERSTATES availability: a null here is a strong null.
let _musterLastDay = null;
// r239 Q6 — live-sitting reads (READ-ONLY, every field is a read). ta =
// tableActive() (mercy window included); ts = a table sequence actually
// live (winDeferred, or tableDone && phase != 'done'). Prefers the engine
// query tableSitting() when present (arm B); otherwise computes the same
// reads inline (arm A, pre-fix engine) so both arms record comparable
// values. A row is a MERCY row iff ta && !ts.
function tablePredicates(G) {
  let ta = false, ts = null;
  try { ta = (typeof G.tableActive === 'function') ? !!G.tableActive() : false; } catch (e) { ta = false; }
  try {
    if (typeof G.tableSitting === 'function') ts = !!G.tableSitting();
    else {
      const pg = (typeof G.progState === 'function') ? G.progState() : null;
      const T = (typeof G.tableState === 'function') ? G.tableState() : null;
      ts = !!((T && T.winDeferred) || (pg && pg.tableDone && T && T.phase && T.phase !== 'done'));
    }
  } catch (e) { ts = null; }
  return { ta, ts };
}
// r243 Q1 STAGE STEP (the r239-owed precondition). Runs once per policy
// day, BEFORE the muster step. Arms the stage the first day the herald is
// located (omen stage >=2) AND present in the world, then tries the real
// delivery verb each day until the military tribute is payable (2 living
// wave-4 veterans — the price leaves with the delivery). While armed, the
// herald's muster call is held (see musterStep 'stage-wait'); other titans
// are unaffected. Abandons: herald slain before delivery, or tribute not
// payable by day 120 (the muster is released so the village keeps its
// herald fight). A capstone delivered by the natural R113 verb while the
// herald lives satisfies the stage without intervention ('natural'). Every
// error is recorded on stageWatch — no silent catches (AGENTS.md rule 6).
function stageStep(G, ctx) {
  const day = gday();
  if (!stageState) stageState = { armedDay: null, deliveredDay: null, kind: null, via: null, abandoned: null, reason: null, waitRows: 0 };
  const st = stageState;
  if (st.deliveredDay != null || st.abandoned) return;
  let herald = null;
  try {
    const tst = (G.state || {}).titans || {};
    const o = (tst.omens || {}).herald;
    const slain = !!(tst.slain && tst.slain.herald);
    const def = ((G.data && G.data.titans) || {}).herald;
    const ms = (typeof G.worldMonsters === 'function') ? (G.worldMonsters() || []) : [];
    const present = !!(def && ms.some(m => m && m.id === def.monster));
    herald = { stage: o ? o.stage : 0, slain, present };
  } catch (e) { stageWatch.push({ day, event: 'step-error', reason: 'herald-read:' + String((e && e.message) || e).slice(0, 80) }); return; }
  if (!herald) return;
  if (herald.slain) { st.abandoned = 'herald-slain'; st.reason = 'herald slain before delivery (day ' + day + ')'; stageWatch.push({ day, event: 'abandoned', reason: st.abandoned }); return; }
  let delivered = null;
  try { delivered = (typeof G.ladderCapstoneDelivered === 'function') ? G.ladderCapstoneDelivered() : null; } catch (e) { stageWatch.push({ day, event: 'step-error', reason: 'delivered-read:' + String((e && e.message) || e).slice(0, 80) }); return; }
  if (delivered) {
    st.deliveredDay = day; st.kind = delivered; st.via = 'natural';
    stageWatch.push({ day, event: 'delivered-natural', kind: delivered, heraldStage: herald.stage, heraldPresent: herald.present });
    return;
  }
  // Arming needs the herald locatable AND present; once armed, the
  // delivery attempt runs regardless of presence (the herald is alive —
  // presence only gated arming — and the mercy window opens at delivery;
  // if the herald returns, present-held rows accrue). The day-120
  // deadline applies while armed even on absent days.
  if (st.armedDay == null) {
    if (herald.stage < 2 || !herald.present) return; // not yet locatable+present: nothing to arm for
    st.armedDay = day; stageWatch.push({ day, event: 'armed', heraldStage: herald.stage });
  }
  if (day >= 120) { st.abandoned = 'never-ready'; st.reason = 'tribute not payable by day 120'; stageWatch.push({ day, event: 'abandoned', reason: st.abandoned }); return; }
  let ready = null;
  try { ready = (typeof G.ladderCapstoneReady === 'function') ? G.ladderCapstoneReady('military_tribute') : null; } catch (e) { stageWatch.push({ day, event: 'step-error', reason: 'ready-read:' + String((e && e.message) || e).slice(0, 80) }); return; }
  if (!ready || !ready.ready || (ready.payable | 0) < 2) {
    st.waitRows++;
    if (st.waitRows <= 3 || st.waitRows % 10 === 0) stageWatch.push({ day, event: 'wait', reason: (ready && ready.reason) || 'not-ready', veterans: (ready && ready.veterans) || 0, payable: (ready && ready.payable) || 0, heraldPresent: herald.present });
    return;
  }
  let ret = null;
  try { ret = (typeof G.ladderDeliverCapstone === 'function') ? G.ladderDeliverCapstone('military_tribute') : null; } catch (e) { ret = { ok: false, reason: 'deliver-error:' + String((e && e.message) || e).slice(0, 80) }; }
  if (ret && ret.ok) {
    st.deliveredDay = day; st.kind = 'military_tribute'; st.via = 'verb';
    stageWatch.push({ day, event: 'delivered-verb', kind: 'military_tribute', veterans: (ret.veterans || []).slice(), names: (ret.names || []).slice() });
  } else {
    stageWatch.push({ day, event: 'deliver-refused', reason: (ret && ret.reason) || 'unknown' });
  }
}
function musterStep(G, ctx) {
  const day = gday();
  let titans = [];
  try {
    const st = (G.state || {}).titans || {};
    const defs = (G.data && G.data.titans) || {};
    const ms = (typeof G.worldMonsters === 'function') ? (G.worldMonsters() || []) : [];
    for (const tid of Object.keys(st.omens || {})) {
      if (st.slain && st.slain[tid]) continue;
      const o = st.omens[tid];
      if (!o || o.stage < 2) continue;
      const def = defs[tid];
      if (!def) continue;
      const present = ms.some(m => m && m.id === def.monster);
      titans.push({ tid, def, present, stage: o.stage });
    }
  } catch (e) {
    musterWatch.push({ day, titan: null, held: 'step-error:' + String((e && e.message) || e).slice(0, 80) });
    return;
  }
  // Stand down any muster whose titan is gone (present false, or slain
  // since the last check) — upkeep stops, the committed come home.
  try {
    const st = (G.state || {}).titans || {};
    for (const tid of Object.keys((st.musters || {}))) {
      if (st.slain && st.slain[tid]) continue; // victory releases the committed at tbEnd
      const m = st.musters[tid];
      if (!m || (!((m.allies || []).length) && !((m.haven || []).length))) continue;
      const def = ((G.data && G.data.titans) || {})[tid];
      if (!def) continue;
      const ms = (typeof G.worldMonsters === 'function') ? (G.worldMonsters() || []) : [];
      const present = ms.some(x => x && x.id === def.monster);
      if (!present) {
        try { if (typeof G.titanStandDown === 'function') G.titanStandDown(tid); } catch (e) {}
        musterWatch.push({ day, titan: tid, stage: null, present: false, ready: null, bladesAllied: (m.allies || []).length, bladesHaven: (m.haven || []).length, called: false, committed: 0, held: 'stood-down', council: null });
      }
    }
  } catch (e) {}
  if (!titans.length) return; // no row: absence IS the no-located-titan day
  for (const t of titans) {
    const row = { day, titan: t.tid, stage: t.stage, present: t.present, ready: null, bladesAllied: null, bladesHaven: null, called: false, committed: 0, committedVids: [], held: null, council: null, ta: null, ts: null };
    const hold = (why) => { row.held = why; musterWatch.push(row); };
    // Sanctity (partyfinish.sanctityOk): no fight/encounter/table in flight.
    // r239 Q6: the table hold follows MUSTER_HOLD — 'active' holds on
    // tableActive() (mercy included, r239 verbatim); 'sitting' holds only
    // while a table sequence is actually live (a deliberate titan hunt is
    // not ambient pressure, and the engine's titan gate never checks
    // tableActive). ta/ts are recorded on every row either way.
    const _tp = tablePredicates(G);
    row.ta = _tp.ta; row.ts = _tp.ts;
    try {
      if (G.over) { hold('over'); continue; }
      if (G.tbfight && !G.tbfight.over) { hold('tbfight'); continue; }
      if (G.pendingEncounter) { hold('pendingEncounter'); continue; }
      if (MUSTER_HOLD === 'sitting' ? _tp.ts : _tp.ta) { hold(MUSTER_HOLD === 'sitting' ? 'tableSitting' : 'tableActive'); continue; }
      const s = (G.state || {}).scholar || {};
      if (G._sleeping || s.insideTent) { hold('sleeping'); continue; }
    } catch (e) { hold('sanctity-error'); continue; }
    if (!t.present) { hold('absent'); continue; }
    let ready = false;
    try { ready = (typeof G.titanMusterReady === 'function') ? !!G.titanMusterReady(t.tid) : false; } catch (e) { hold('ready-error:' + String((e && e.message) || e).slice(0, 80)); continue; }
    row.ready = ready;
    try {
      const m = (((G.state || {}).titans || {}).musters || {})[t.tid] || null;
      row.bladesAllied = m ? (m.allies || []).length : 0;
      row.bladesHaven = m ? (m.haven || []).length : 0;
    } catch (e) {}
    if (ready) { musterWatch.push(row); continue; } // muster complete - the meeting flow fights it
    // r273 FRUITLESS STAND-DOWN (106282: the herald stayed ready 64 days — carried into r276
    // while the march never engaged it, and the standing muster's hunger
    // bled every allied link −2/day until the trade league dissolved and
    // national lapsed): after a fruitless stand-down, hold the re-call
    // for 30 days (a season) so the stand-down sticks instead of
    // re-sounding the call the next morning (a re-sounded call costs
    // trust per call — never sound daily).
    if (_fruitlessStanddown[t.tid] != null && day - _fruitlessStanddown[t.tid] < 30) { hold('fruitless-cooldown'); continue; }
    // Sit the war council ONCE per titan (the played beat, said aloud).
    // The daily decision reads titanCallReadiness directly - the same
    // computation the council shows - so the capture is not spammed
    // with a council sitting every day the muster is short.
    if (!_councilSat[t.tid]) {
      try { if (typeof G.titanWarCouncil === 'function') G.titanWarCouncil(t.tid); } catch (e) {}
      _councilSat[t.tid] = day;
    }
    let proj = null;
    try { proj = (typeof G.titanCallReadiness === 'function') ? G.titanCallReadiness(t.tid) : null; } catch (e) { hold('projection-error:' + String((e && e.message) || e).slice(0, 80)); continue; }
    if (!proj || proj.total == null) { hold('no-projection'); continue; }
    row.council = { total: proj.total, need: proj.need, alliesProj: proj.alliesProj, havenProj: proj.havenProj, ready: !!proj.ready };
    if (proj.total < proj.need) { hold('short:' + (proj.need - proj.total)); continue; }
    // r243 STAGE: while the stage is armed (herald located+present, tribute
    // not yet delivered), hold the herald's call even when the coalition
    // completes — the village delivers its tribute first, so the mercy
    // window opens while the herald still lives. The row records the
    // projection, so the hold is a choice, not a shortage. Other titans
    // are unaffected. Pre-delivery ta is false, so this is never a mercy row.
    if (t.tid === 'herald' && stageState && stageState.armedDay != null && stageState.deliveredDay == null && !stageState.abandoned) { hold('stage-wait'); continue; }
    // The coalition completes on this call: sound it, then commit
    // Haven's own (two taps, back-to-back in the same step).
    try {
      if (typeof G.soundTitanCall !== 'function') { hold('no-call-fn'); continue; }
      G.soundTitanCall(t.tid);
      row.called = true;
    } catch (e) { hold('call-error:' + String((e && e.message) || e).slice(0, 80)); continue; }
    try {
      if (typeof G.titanCommitOwn === 'function') {
        const r1 = G.titanCommitOwn(t.tid);
        if (r1 === 'confirm') {
          const r2 = G.titanCommitOwn(t.tid);
          if (r2 && r2 !== 'confirm') {
            const m = (((G.state || {}).titans || {}).musters || {})[t.tid] || null;
            row.committed = m ? (m.haven || []).length : 0;
          }
        } else if (r1) {
          const m = (((G.state || {}).titans || {}).musters || {})[t.tid] || null;
          row.committed = m ? (m.haven || []).length : 0;
        }
        // Record WHO marched (vids) at commit time — the end-state muster
        // drops the dead at the next dawn reconcile, so only the ledger
        // can join a committed blade to a later death.
        try { const m = (((G.state || {}).titans || {}).musters || {})[t.tid] || null; row.committedVids = m ? (m.haven || []).map(h => h.vid) : []; } catch (e) { row.committedVids = []; }
      }
    } catch (e) { row.held = 'commit-error:' + String((e && e.message) || e).slice(0, 80); musterWatch.push(row); continue; }
    // Re-read readiness + blades after the call/commit.
    try { row.ready = (typeof G.titanMusterReady === 'function') ? !!G.titanMusterReady(t.tid) : row.ready; } catch (e) {}
    try {
      const m = (((G.state || {}).titans || {}).musters || {})[t.tid] || null;
      row.bladesAllied = m ? (m.allies || []).length : 0;
      row.bladesHaven = m ? (m.haven || []).length : 0;
    } catch (e) {}
    try { ctx.musterCalls = (ctx.musterCalls | 0) + 1; } catch (e) {}
    musterWatch.push(row);
  }
}
// r239 Q1 TITAN-MARCH: walk a READY muster to the lair.
// Called once per policy day, AFTER the muster step, for each titan with
// omen stage >=2, a live world monster, and a READY muster. The walk is
// the competent walkTo (require, not a copy): hop-by-hop travelTo with
// honest travel costs, encounter risk, and blockage stops — the player
// verb, not a teleport. When the scholar steps adjacent to the titan the
// engine sets pendingEncounter and the harness answers it after daily
// with startCombat, which the titan wrapper lets through ONLY with a
// complete muster (allies injected). One row per ready-muster titan per
// day (marched / on-tile / held + the first failing reason); absence of
// a row IS the no-ready-muster day. The step never marches without a
// ready muster, never outfits allies, never touches the finale/nielsen
// campaign gates. Holds use the r227-braced pattern: hold(...) then
// continue INSIDE the if — the bare-continue bug (r227 pilot) must not
// recur here.
// r273 FRUITLESS STAND-DOWN (106282): the march arrived at the herald's — carried into r276
// tile 64 days running and no encounter ever started — the roaming titan
// kept moving and the standing muster bled −2 trust/day on every allied
// link until the trade league dissolved and national lapsed. A competent
// player stands the muster down after a week of empty walks instead of
// marching the realm to death: 7 arrived-but-no-pending days stands the
// muster down (the hunger bleed stops with the muster — titans.js upkeep
// returns early on an empty muster) and the muster step holds the re-call
// for 30 days. A pending encounter resets the count — the march did its job.
function noteFruitlessMarch(G, t, row) {
  if (!row.arrived) return; // blocked/held days are not arrivals — they neither count nor break the chain
  if (row.pending) { _marchFruitless[t.tid] = 0; return; }
  _marchFruitless[t.tid] = (_marchFruitless[t.tid] | 0) + 1;
  if (_marchFruitless[t.tid] >= 7) {
    try { if (typeof G.titanStandDown === 'function') G.titanStandDown(t.tid); } catch (e) { console.error('r276 fruitless-standdown: titanStandDown failed for ' + t.tid + ': ' + (e && e.message)); }
    _fruitlessStanddown[t.tid] = gday();
    _marchFruitless[t.tid] = 0;
    row.held = 'fruitless-standdown';
  }
}
function marchStep(G, ctx) {
  const day = gday();
  let titans = [];
  try {
    const st = (G.state || {}).titans || {};
    const defs = (G.data && G.data.titans) || {};
    const ms = (typeof G.worldMonsters === 'function') ? (G.worldMonsters() || []) : [];
    for (const tid of Object.keys(st.omens || {})) {
      if (st.slain && st.slain[tid]) continue;
      const o = st.omens[tid];
      if (!o || o.stage < 2) continue;
      const def = defs[tid];
      if (!def) continue;
      const mon = ms.find(m => m && m.id === def.monster);
      if (!mon) continue; // located but not present in the world: nothing to march against
      let ready = false;
      try { ready = (typeof G.titanMusterReady === 'function') ? !!G.titanMusterReady(tid) : false; } catch (e) { ready = false; }
      if (!ready) continue; // short muster: the muster step owns the held rows; the march waits
      titans.push({ tid, def, mon, stage: o.stage, tx: mon.tx, ty: mon.ty });
    }
  } catch (e) {
    marchWatch.push({ day, titan: null, held: 'step-error:' + String((e && e.message) || e).slice(0, 80) });
    return;
  }
  if (!titans.length) return; // no row: absence IS the no-ready-muster day
  for (const t of titans) {
    const row = { day, titan: t.tid, stage: t.stage, lair: [t.tx, t.ty], from: null, arrived: false, onTile: false, pending: false, held: null, ta: null, ts: null };
    const hold = (why) => { row.held = why; marchWatch.push(row); };
    // Sanctity (partyfinish.sanctityOk): no fight/encounter/table in flight.
    // r239 Q6: same MUSTER_HOLD rule as the muster step — the march walks a
    // ready muster to the lair, and a mercy window is not a live sitting.
    const _tp = tablePredicates(G);
    row.ta = _tp.ta; row.ts = _tp.ts;
    try {
      if (G.over) { hold('over'); continue; }
      if (G.tbfight && !G.tbfight.over) { hold('tbfight'); continue; }
      if (G.pendingEncounter) { hold('pendingEncounter'); continue; }
      if (MUSTER_HOLD === 'sitting' ? _tp.ts : _tp.ta) { hold(MUSTER_HOLD === 'sitting' ? 'tableSitting' : 'tableActive'); continue; }
      const s = (G.state || {}).scholar || {};
      if (G._sleeping || s.insideTent) { hold('sleeping'); continue; }
    } catch (e) { hold('sanctity-error'); continue; }
    // r243 STAGE: belt-and-braces — a ready herald muster must not march
    // while the stage is armed (the call is held, so no ready muster should
    // exist; this guards a muster completed by another route).
    if (t.tid === 'herald' && stageState && stageState.armedDay != null && stageState.deliveredDay == null && !stageState.abandoned) { hold('stage-wait'); continue; }
    try { row.from = [G.map.px, G.map.py]; } catch (e) { row.from = null; }
    if (row.from && row.from[0] === t.tx && row.from[1] === t.ty) { row.onTile = true; row.arrived = true; noteFruitlessMarch(G, t, row); marchWatch.push(row); continue; }
    // Walk to the lair tile. walkTo stops at blockages, at a live fight,
    // and at a pending encounter (travelTo refuses) — the row records
    // where the walk actually ended.
    try {
      if (typeof walkTo !== 'function') { hold('no-walkto-fn'); continue; }
      // r249 ROUTE-AROUND (carried): the march walks like a competent human — when
      // the shortest path's first step is refused (a fallen tree guarding
      // the approach), go around it instead of sitting at the haven edge
      // for weeks (r249 seed 103927: 28 days blocked at (4,4) with a ready
      // muster, 14+ blades; deepening r248's 105061 sat 9 days the same
      // way — the march only resolved when the herald wandered adjacent).
      // The game offers the "Go around" button and the policy library
      // implements it (routeAround, opt-in COMPETENT_ROUTE_AROUND=1, set
      // by capable) — the march enables it for its own walk only, then
      // restores the caller's setting so no other policy step changes.
      const _prevRA = process.env.COMPETENT_ROUTE_AROUND;
      process.env.COMPETENT_ROUTE_AROUND = '1';
      try { walkTo(G, t.tx, t.ty); } finally { if (_prevRA === undefined) delete process.env.COMPETENT_ROUTE_AROUND; else process.env.COMPETENT_ROUTE_AROUND = _prevRA; }
    } catch (e) { hold('walk-error:' + String((e && e.message) || e).slice(0, 80)); continue; }
    try {
      const px = G.map.px, py = G.map.py;
      row.arrived = (px === t.tx && py === t.ty);
      if (!row.arrived) { hold('blocked-at:' + px + ',' + py); continue; }
    } catch (e) { hold('arrive-error:' + String((e && e.message) || e).slice(0, 80)); continue; }
    try { row.pending = !!(G.pendingEncounter && G.pendingMonsterId === t.def.monster); } catch (e) { row.pending = false; }
    try { ctx.marchCalls = (ctx.marchCalls | 0) + 1; } catch (e) {}
    noteFruitlessMarch(G, t, row);
    marchWatch.push(row);
  }
}
// r227 Q1 TITAN-MUSTER: driver-side wraps (zero src/js change, no behavior
// change) on the four muster verbs - soundTitanCall / titanCommitOwn /
// titanWarCouncil / titanSelfDo - so the analyzer can tell whether the
// muster step is the only caller. Installed per seed in playSeed, after
// loadGame. A 0 with a working router path means the verbs are never
// reached except through the step.
function installTitanVerbWraps(G) {
  if (!G || TITANVERBS._installed) return;
  TITANVERBS._installed = true;
  try {
    ['soundTitanCall', 'titanCommitOwn', 'titanWarCouncil', 'titanSelfDo'].forEach(function (fn) {
      if (typeof G[fn] !== 'function') { TITANVERBS.errors.push(fn + ':missing'); return; }
      const orig = G[fn];
      G[fn] = function () {
        let caught = null, ret;
        try { ret = orig.apply(this, arguments); } catch (e) { caught = e; }
        try { TITANVERBS.calls.push({ day: gday(), fn, arg: String(arguments[0]), ok: caught === null, err: caught ? String(caught && caught.message || caught).slice(0, 120) : null }); } catch (e2) {}
        if (caught) throw caught;
        return ret;
      };
    });
  } catch (e) { TITANVERBS.errors.push('wrap:' + String(e && e.message)); }
}
function links() { try { return _G.hierarchyState ? (_G.hierarchyState() || []) : []; } catch (e) { return []; } }
function linkOther(l) { try { if (l.a && l.b) return l.a === 'haven' ? l.b : l.a; return l.primary === 'haven' ? l.subordinate : (l.primary || l.a); } catch (e) { return null; } }
function snapshotTrust() {
  try {
    const day = gday();
    for (const l of links()) {
      if (!l || l.status !== 'active') continue;
      const other = linkOther(l);
      trustWatch.push({ day, other, kind: l.kind || (l.primary ? 'primary-sub' : '?'), trust: l.trust | 0, formedDay: l.day | 0, poolLive: !!l.poolLive, chartered: !!l.chartered, lastKeptDay: l.lastKeptDay ?? null, mourningUntil: l.mourningUntil ?? null, arrears: l.arrears || 0, pendingDefense: !!l.pendingDefense, pendingCrisis: !!l.pendingCovenantCrisis });
      const key = (l.id || (other + '|' + (l.kind || '')));
      const seen = prevHist[key] || (prevHist[key] = new Set());
      const hist = Array.isArray(l.history) ? l.history : [];
      for (const h of hist) { const k = (h.day + '|' + h.kind + '|' + h.note); if (!seen.has(k)) { seen.add(k); trustEvents.push({ day: h.day, snapDay: day, other, kind: l.kind || (l.primary ? 'primary-sub' : '?'), noteKind: h.kind, note: h.note }); } }
    }
  } catch (e) {}
}


// R39 trust-setter instrument: redefine every active link's `trust` as an
// accessor (backing value in a WeakMap, so no extra key lands on the link
// object and JSON/save shape is unchanged) that logs every NONZERO
// assignment with the day, the link, before/after, and the call stack.
// Gains routed through _trustGain and direct-assignment drops both pass
// through the setter, so the stack names the writer in both cases. Install
// is idempotent per link object (a replaced link object installs fresh at
// its current trust, never logging a phantom delta). Driver-only.
let trustSetLog = [];
// R52 BARRIER instrument (driver-only, prereg Q2): log EVERY sayOncePerFight
// call — day, message, inCombat() at call time, tbfight present/over, and
// caller stack — so the r50→r51 barrier-line loss can be pinned to a call
// path (no-attempt vs dedup vs broken guard) instead of hypothesized.
// No engine input is touched; the wrapper forwards to the original.
let barrierLog = [];
const _trustVals = new WeakMap();
function installTrustSetters() {
  try {
    for (const l of links()) {
      if (!l || l.status !== 'active') continue;
      if (_trustVals.has(l)) continue;
      _trustVals.set(l, l.trust);
      Object.defineProperty(l, 'trust', {
        configurable: true, enumerable: true,
        get: function () { return _trustVals.get(l); },
        set: function (v) {
          const ov = _trustVals.get(l);
          _trustVals.set(l, v);
          if (v !== ov) {
            let st = '';
            try { st = (new Error().stack || '').split('\n').slice(0, 6).join(' | '); } catch (e) {}
            trustSetLog.push({ day: gday(), other: linkOther(l), kind: l.kind || (l.primary ? 'primary-sub' : '?'), before: ov, after: v, delta: v - ov, stack: st });
          }
        }
      });
    }
  } catch (e) {}
}

const CONVO_DAYS = [90, 120];
const convoFiles = [];
// conversation driver — engage-first (from journey-scale r19/r20).
const ENGAGE = ['dlg:help', 'dlg:commit', 'dlg:heed', 'dlg:stay', 'dlg:comfort', 'dlg:empathize',
  // R215 Q4 (r206-owed): a confided secret is answered, not walked away
  // from — secret:promise/comfort/offer are real choices
  // (conversation.js:5109-5111) the r206 picker never took (Omar d120
  // walked away from "I'm saving a candy bar... I haven't told anyone").
  'secret:promise', 'secret:comfort', 'secret:offer',
  'dlg:more', 'dlg:details', 'dlg:askwhy',
  'gq:open:take', 'gq:open:unsure', 'agency:ask_field', 'alive:want:share_news', 'alive:want:ask_favor', 'alive:want:warn_you', 'alive:want:seek_comfort', 'alive:want:curious',
  // R133 Q1: a mimed invitation is answered before any other gesture —
  // nv:accept precedes nv:nod so the policy answers the mime instead of
  // nodding past it (a competent player who sees "come with me" answers it).
  'nv:accept', 'nv:nod', 'nv:smile', 'nv:pointself', 'nv:listen', 'betrayal:accept'];
const ENGAGE2 = ['goon', 'ask:gossip', 'ask:lately', 'ask:personal', 'alive:event:mourning', 'ask:fears', 'ask:you', 'teach'];
const DEFLECT = ['dlg:cant', 'gq:open:honest_pass', 'betrayal:decline', 'nv:decline'];
const GQYN = ['gq:yn:unsure', 'gq:yn:honest_pass', 'gq:yn:no', 'gq:yn:yes'];
// R33 picker cap: at most ONE consecutive dlg:more/goon press (a real player
// does not press "go on" 8 times running), and NEVER goon after a deflect
// in the same conversation (r32's Domfeh defect: the picker re-asked after
// the NPC's no). st = {consec, deflected}, maintained by runConversation.
function pickChoice(choices, turn, st) {
  const list = choices || [];
  // R40 WANT-SUBJECT variant: at turn 0, take dlg:subject (the subject menu,
  // where alive want items are offered) instead of the usual first engage
  // choice. Later turns are unchanged, so any want surfacing is attributable
  // to reaching the subject menu, not to a different picker throughout.
  if (SUBJECT_FIRST && turn === 0) { const subj = list.find(x => x && x.id === 'dlg:subject'); if (subj) return subj; }
  if (GOSSIP_FIRST && st && !st.gossipDone) { const g = list.find(x => x && x.id === 'ask:gossip'); if (g) { st.gossipDone = true; return g; } }
  const stretchBlocked = !!(st && st.consec >= 1);
  const goonBlocked = !!(st && st.deflected);
  const skip = (id) => (stretchBlocked && (id === 'dlg:more' || id === 'goon')) || (goonBlocked && id === 'goon');
  for (const id of ENGAGE) { if (skip(id)) continue; const c = list.find(x => x && x.id === id); if (c) return c; }
  const ans = list.find(x => x && x.id && x.id.indexOf('ans:') === 0 && x.id.indexOf('honest_pass') === -1);
  if (ans) return ans;
  for (const id of GQYN) { const c = list.find(x => x && x.id === id); if (c) return c; }
  // R30 picker fix (Keisha confession case): dlg:react engages the NPC's own want;
  // teach (in ENGAGE2) hijacked it into a 5-plant lecture. React first, teach after.
  const reactFirst = list.find(x => x && x.id === 'dlg:react');
  if (reactFirst && turn < 6) return reactFirst;
  for (const id of ENGAGE2) { if (skip(id)) continue; const c = list.find(x => x && x.id === id); if (c) return c; }
  for (const id of DEFLECT) { const c = list.find(x => x && x.id === id); if (c) return c; }
  const react = list.find(x => x && x.id === 'dlg:react');
  if (react && turn < 6) return react;
  return list.find(x => x && x.id === 'leave') || null;
}
function runConversation(day, vid, isNv) {
  const fp = path.join(EVIDIR, `journey-scale-r279-${ARML}-transcript-${_currentSeed}-day${day}${isNv ? '-nv' : ''}.txt`);
  const L = [];
  const log = (s) => L.push(s);
  let gossipPicks = 0; // r70 fix: MUST live outside the try — the try-scoped let was invisible at the post-try log line, throwing ReferenceError and losing every transcript.
  try {
    const nm = vname(vid);
    const p = person(vid);
    // R55 open-thread logging (read-only): what unfinished business, if
    // any, is planted for this NPC before the talk starts.
    try { const sd = ((_G.state.village || {}).convoSeeds || {})[vid]; const cc0 = _G.convoGet(vid); log(`(pre-talk seed: ${sd ? (sd.wantId + ' planted d' + sd.day) : 'none'}; takenWantDay=${(cc0 && cc0.takenWantDay) || 0}; convoCount=${(cc0 && cc0.count) || 0})`); } catch (e) { log('(pre-talk seed: unreadable)'); }
    const r0 = _G.startConvo(vid);
    if (!r0) { log(`THEM: (no line — startConvo returned null for ${vid})`); fs.writeFileSync(fp, L.join('\n')); return fp; }
    const c = _G.convoGet(vid);
    const want = (c && c.want) || {};
    log(`=== seed ${_currentSeed} day ${day} — conversation with ${nm} (${vid}) ===`);
    log(`occupation=${p.formerOccupation || p.occupation || '?'} temperament=${(p.personality && p.personality.temperament) || p.temperament || '?'} trust=${((_G.state.village.trust || {})[vid] ?? '?')} dead=${!!p.dead}`);
    log(`want: ${want.id || 'none'} (stage ${want.stage || 0})`);
    log(`open thread: ${(c && c.thread) || '?'} fromSeed=${!!(want && want.fromSeed)}`);
    log(`picker: ${SUBJECT_FIRST ? 'subject-first' : 'control'}${GOSSIP_FIRST ? ' gossip-first' : ''}`);
    log('');
    log(`THEM: ${r0.line || '(no line)'}`);
    // R133 Q2 (driver fix): r0.line is only the opener — beats spoken at
    // open (a held-then-spoken invite, a bond/link raise) land in
    // c.transcript but never in r0.line, so the old log hid them (Thabo
    // r132: the invite label was in the transcript while the file showed
    // only the grief line). Log every further opening THEM entry so a
    // later read sees the whole spoken opening.
    try {
      const _ot = (c.transcript || []).filter(e => e.who === 'them').map(e => String(e.text));
      if (_ot.length > 1) { log(`(opening: ${_ot.length} THEM lines spoken at open)`); _ot.slice(1).forEach(t => log(`THEM: ${t}`)); }
    } catch (e) {}
    let r = r0;
    const pickSt = { consec: 0, deflected: false, gossipDone: false }; // R33 picker-cap state (+r70 gossip-first flag)
    const convoAccepts = []; // R46: one entry per betrayal:accept pick IN THIS CONVO, armed captured BEFORE the pick is played
    for (let turn = 0; turn < 8; turn++) {
      let choices = (r.choices && r.choices.length) ? r.choices : null;
      if (!choices) { try { choices = _G.convoChoices(vid); } catch (e) { choices = []; } }
      if (turn === 0) log(`(turn0 choices: ${(choices || []).map(x => x && x.id).join(', ') || 'NONE'})`);
      if (process.env.CHOICELOG === '1') log(`(turn${turn} choices: ${(choices || []).map(x => x && x.id).join(', ') || 'NONE'})`);
      const pick = pickChoice(choices, turn, pickSt);
      if (!pick || pick.id === 'leave') { if (!pick) log(`!! DRIVER DROP: unhandled choices: ${(choices || []).map(x => x && x.id).join(', ') || 'NONE'}`); log('YOU: (leave)'); break; }
      // R34: update cap state from the pick just made.
      if (pick.id === 'dlg:more' || pick.id === 'goon') pickSt.consec += 1; else pickSt.consec = 0;
      if (DEFLECT.indexOf(pick.id) !== -1) pickSt.deflected = true;
      if (pick.id === 'ask:gossip') gossipPicks += 1;
      log(`YOU: [${pick.id}] ${pick.label}`);
      // R46: armed/ordinary split — same predicate as acceptInvite's ambush
      // branch (active unsprung plot naming this villager as inviter with the
      // player as target). Read BEFORE convoTurn consumes the pending invite;
      // null only if the betrayal state is unreadable.
      if (pick.id === 'betrayal:accept') {
        let armed = null;
        try {
          const bs = (typeof _G.betrayalState === 'function') ? _G.betrayalState() : null;
          const plots = (bs && bs.plots) || [];
          const me = _G.villagerId;
          armed = plots.some(q => q.active && !q.sprung && q.inviter === vid && (me == null || q.target === me));
        } catch (e) { armed = null; }
        convoAccepts.push({ armed });
      }
      // R133 Q1: the trap-line answers are recorded the same way (the
      // analyzer counts mime-shown → answered from the transcripts; the
      // betrayWatch row is the per-seed aggregate). No armed split: a
      // mimed invite is an ordinary outing unless a plot names this
      // villager — acceptInvite springs it, and the transcript's outcome
      // line shows which it was.
      if (pick.id === 'nv:accept' || pick.id === 'nv:decline') {
        betrayWatch.push(Object.assign({ day, vid, name: nm, event: pick.id === 'nv:accept' ? 'nvaccept' : 'nvdecline', armed: null }, personSnap(vid)));
      }
      r = _G.convoTurn(vid, pick.id);
      if (r.line) log(`THEM: ${r.line}`);
      if (r.ended) { log('(ended by engine)'); break; }
    }
    // R55: want stage/thread just before close (endConvo may clear the want).
    try { const cw = _G.convoGet(vid); const wpre = (cw && cw.want) || {}; log(`pre-close: want ${wpre.id || 'none'} stage ${wpre.stage || 0} thread ${cw.thread || '?'}`); } catch (e) {}
    let endR = null;
    try { endR = _G.endConvo(vid, 'done'); } catch (e) { log('endConvo ERROR: ' + (e && e.message)); }
    if (endR && endR.line) log(`closing line: ${endR.line}`);
    // R46: EVERY accept is recorded (r44's first-accept-only guard undercounted
    // 85003 2->1). Daily snapshots stay keyed by first-registered subject.
    // Fallback: if the pick-time capture missed (e.g. an accept path outside
    // the turn loop), one accept with armed=null is recorded from the transcript.
    if (!betraySubjects[vid] && (convoAccepts.length || L.join('\n').indexOf('[betrayal:accept]') !== -1)) {
      betraySubjects[vid] = { day, vid, name: nm, want: want.id || null, stage: want.stage || 0 };
    }
    const _accs = convoAccepts.length ? convoAccepts : (L.join('\n').indexOf('[betrayal:accept]') !== -1 ? [{ armed: null }] : []);
    for (const _a of _accs) {
      betrayWatch.push(Object.assign({ day, vid, name: nm, event: 'accept', armed: _a.armed }, personSnap(vid)));
    }
    const c2 = _G.convoGet(vid);
    const t = (c2 && c2.transcript) || [];
    const themLines = t.filter(e => e.who === 'them').map(e => String(e.text));
    const dupes = themLines.filter((x, i) => themLines.indexOf(x) !== i);
    if (dupes.length) log(`!! VERBATIM REPEATS: ${dupes.slice(0, 3).join(' || ').slice(0, 240)}`);
  } catch (e) {
    log('CONVO ERROR: ' + (e && e.stack || e));
  }
  log(`(gossip picks this sitting: ${gossipPicks})`);
  fs.writeFileSync(fp, L.join('\n'));
  return fp;
}

function seatSample() {
  try {
    const seat = (_G.tableSeat ? _G.tableSeat() : {}) || {};
    const pg = (_G.progState ? _G.progState() : {}) || {};
    return {
      day: gday(),
      seat: seat.seat || 'none',
      detail: seat.detail || null,
      arc: pg.arc || 0,
      tableWaiting: !!pg.tableWaiting,
      tableAnnounced: !!pg.tableAnnounced,
      nationalLive: !!_G.state.nationalLive,
      globalLive: !!_G.state.globalLive,
      viewership: (_G.state.village || {}).viewership == null ? null : Math.round(_G.state.village.viewership),
    };
  } catch (e) { return { day: gday(), err: String(e && e.message) }; }
}

// r223 Q5 spotter snapshot (r207-owed d90 timing): the r139 wiring grants
// spotter XP silently — this is the live read of it on the scale leg
// (census line, not a bar). Factored so census() (seed end) and the d90
// hook in policy.daily share one shape. Read-only (r210 end-only pattern:
// live getPerson first, wrapper second).
function spotterSnapshot() {
  try {
    const roster = (_G.state.village || {}).roster || [];
    return roster.map(id => {
      let p = null; try { p = person(id); } catch (e) {}
      const fx = (p && p.foodXp) || (p && p._src && p._src.foodXp) || {};
      let skill = null; try { skill = (_G.specialistSkill && p) ? _G.specialistSkill(p, 'spotter') : null; } catch (e) {}
      return { id: String(id), name: vname(id), alive: !(p && p.dead), foodXpSpotter: fx.spotter || 0, spotterSkill: skill };
    });
  } catch (e) { return null; }
}

// r223 W5-INSTANCE entity fingerprint (r207-owed): the stable identity
// available for a world-monster entity at a fight. lingerKey is the
// per-entity token (lingerers only); wild monsters carry no engine
// instance id (spawnWorldMonster builds {id,tx,ty,wave,mx,my,hp,...} with
// no seq), so the fingerprint is (id + hp + tile + position + veteran)
// joined against the daily monsterWatch census — a fought-and-survived
// beast keeps its wounds, a fresh spawn is full HP.
function monsterFingerprint(m) {
  if (!m) return null;
  return { key: m.lingerKey || null, id: m.id || null, wave: (m.wave != null ? (m.wave | 0) : null),
    tx: (m.tx != null ? (m.tx | 0) : null), ty: (m.ty != null ? (m.ty | 0) : null),
    mx: (m.mx != null ? (m.mx | 0) : null), my: (m.my != null ? (m.my | 0) : null),
    hp: (m.hp != null ? Math.round(m.hp) : null), maxHp: (m.maxHp != null ? Math.round(m.maxHp) : null),
    veteran: !!m.veteran };
}

function census() {
  const L = links();
  const day = gday();
  const active = L.filter(l => l && l.status === 'active');
  const lead = active.filter(l => l.primary === 'haven');
  const seasoned = lead.filter(l => ((day - (l.day | 0)) >= 30) && (l.trust | 0) >= 40);
  const capText = capture.join('\n');
  const countMark = (re) => { const m = capText.match(re); return m ? m.length : 0; };
  const rank = (() => { try { return _G.scaleRank(); } catch (e) { return '?'; } })();
  return {
    seed: _currentSeed,
    day: day,
    over: !!_G.over,
    overCause: _G.overCause || null,
    popAlive: (_G.state.village.roster || []).filter(id => !person(id).dead).length,
    popTotal: (_G.state.village.roster || []).length,
    pantryKcal: Math.round(pantryKcal()),
    links: active.map(l => ({ kind: l.kind || (l.primary ? 'primary-sub' : '?'), primary: l.primary === 'haven', other: (l.a && l.b) ? (l.a === 'haven' ? l.b : l.a) : (l.primary === 'haven' ? l.subordinate : (l.primary || l.a)), trust: l.trust, ageDays: day - (l.day | 0), status: l.status })),
    leadActive: lead.length,
    leadSeasoned: seasoned.length,
    scaleRank: rank,
    nationalLive: (rank === 'national' || rank === 'global'),
    nationalDay: (() => { try { return _G.state.nationalDay || null; } catch (e) { return null; } })(),
    globalDay: (() => { try { return _G.state.globalDay || null; } catch (e) { return null; } })(),
    networkLiveDay: (() => { try { return _G.state.networkLiveDay || null; } catch (e) { return null; } })(),
    // the actual voicing markers of the national/global transitions (r21 metric
    // review: "GOVERNANCE LAYER: online" stages the realm, "The shared granary
    // opens" resolves the court — the old /rises national/ markers matched
    // only drama-card text that never reaches the say-capture)
    nationalVoiced: /governance layer: online|the shared granary opens/i.test(capText),
    globalVoiced: /species agency: unlocked/i.test(capText),
    primaryDemandsFired: countMark(/demand|tribute/gi),
    defenseFired: countMark(/defense call|call for aid|defend us/gi),
    maxWave: (() => { try { return _G.unlockedWave ? _G.unlockedWave() : null; } catch (e) { return null; } })(),
    tableSeat: (() => { try { return (_G.tableSeat ? _G.tableSeat() : {}).seat || null; } catch (e) { return 'err'; } })(),
    tableSeatDetail: (() => { try { return (_G.tableSeat ? _G.tableSeat() : {}).detail || null; } catch (e) { return null; } })(),
    arcNow: (() => { try { return (_G.progState ? _G.progState().arc : null); } catch (e) { return null; } })(),
    tableWaiting: (() => { try { return !!_G.progState().tableWaiting; } catch (e) { return null; } })(),
    tableAnnounced: (() => { try { return !!_G.progState().tableAnnounced; } catch (e) { return null; } })(),
    seatWatch: seatWatch.slice(),
    poolWatch: poolWatch.slice(),
    villageWatch: villageWatch.slice(),
    trustWatch: trustWatch.slice(),
    trustSetLog: trustSetLog.slice(),
    trustEvents: trustEvents.slice(),
    betrayWatch: betrayWatch.slice(),
    betraySubjects: Object.assign({}, betraySubjects),
    hungerWatch: hungerWatch.slice(),
    tableWatch: tableWatch.slice(),
    villageTotal: (() => { try { return (_G.state.otherVillages || []).length; } catch (e) { return null; } })(),
    villageKnownEnd: (() => { try { return (_G.state.otherVillages || []).filter(v => _G.knowsVillage ? _G.knowsVillage(v) : (v.generated || v.rumored)).length; } catch (e) { return null; } })(),
    poolEverMax: poolWatch.reduce((m, x) => Math.max(m, x.pool || 0), 0),
    covLinks: links().filter(l => l && (l.kind === 'covenant') && l.status === 'active').map(l => ({ other: (l.a === 'haven' ? l.b : l.a), trust: l.trust, ageDays: day - (l.day | 0), poolLive: !!l.poolLive })),
    globalNotes: globalNotes.slice(),
    convoFiles: convoFiles.slice(),
    // R27 dedup instrument: day-attributed BIGGER-STAGE beats + scaleDiscovery state
    beatWatch: beatWatch.slice(),
    natGateWatch: natGateWatch.slice(),
    // R29 governance instrument: day-attributed mechanism lines + link tribute state
    govWatch: govWatch.slice(),
    firstCourtDay: (() => { const g = govWatch.find(x => x.cls === 'govAnnounce'); return g ? g.day : null; })(),
    leaguePoolKcal: (() => { try { return _G.leaguePool ? _G.leaguePool() : null; } catch (e) { return null; } })(),
    linkTribute: L.map(l => ({ other: l.primary === 'haven' ? l.subordinate : (l.primary || l.a), primaryHaven: l.primary === 'haven', tributePerWeek: l.tributeKcalPerWeek || 0, tributePaidWeek: l.tributePaidWeek ?? null, arrears: l.arrears || 0, trust: l.trust })),
    scalePtrW4: (() => { try { return !!_G.state._scalePtrW4; } catch (e) { return null; } })(),
    scalePtrW5: (() => { try { return !!_G.state._scalePtrW5; } catch (e) { return null; } })(),
    sdState: (() => {
      try {
        const sd = (typeof _G.scaleDiscovery === 'function') ? _G.scaleDiscovery() : null;
        if (!sd) return null;
        const out = {};
        for (const k of Object.keys(sd)) {
          const v = sd[k];
          out[k] = (v && typeof v === 'object') ? { day: v.day, via: v.via } : v;
        }
        return out;
      } catch (e) { return null; }
    })(),
    // r223 Q5: spotter/foodXp snapshot at seed end (r207's end-only read,
    // kept) — see spotterSnapshot(); the d90 read lives in spotterWatch90.
    spotterWatch: spotterSnapshot(),
    spotterWatch90: spotterWatch90.slice(),
    // r276 Q2-WINPLAN (ported from deepening r269): a read-only raw-state snapshot
    // of village.winPlanStats + the plan table (stages, targets, party
    // sizes). NEVER call Game.winPlanStats(): its stateOf() materializes
    // the winPlan store, and the store's EXISTENCE is the ignition gate
    // (winPlanHavenTick) — calling it would ignite the plan system in a
    // village where it sleeps and change the run. A plain property read
    // creates nothing: null stats = the system never ignited.
    winPlanEnd: (() => {
      try {
        const vv = (_G.state && _G.state.village) || {};
        const wps = vv.winPlanStats || null;
        const plans = vv.winPlan || null;
        return {
          ignited: !!plans,
          stats: wps ? { ...wps } : null,
          plans: plans ? Object.entries(plans).map(([vid, p]) => ({ vid: String(vid), name: vname(vid), stage: (p && p.stage) || null, target: (p && p.target) || null, partySize: (p && p.party ? p.party.length : 0) })) : [],
        };
      } catch (e) { return null; }
    })(),
  };
}

async function playSeed(seed) {
  _currentSeed = seed;
  if (LR) LR.resetLinkraiseStats();
  if (AM) AM.resetAnswermailStats();
  capture = [];
  beatWatch = [];
  govWatch = [];
  waterWatch = [];
  convoFiles.length = 0;
  seatWatch = [];
  poolWatch = [];
  villageWatch = [];
  globalNotes = [];
  trustWatch = [];
  trustEvents = [];
  trustSetLog = [];
  barrierLog = [];
  prevHist = {};
  betrayWatch = [];
  betraySubjects = {};
  hungerWatch = [];
  tableWatch = [];
  dutyWatch = [];
  wsplitWatch = [];
  fusionWatch = [];
  fusionFeast = [];
  posTrace = [];
  mornTrace = [];
  natGateWatch = []; // R103: reset per seed like every other watch (r103 fix — the first panel run accumulated rows across seeds)
  scRows = []; scKillSamples = []; scKillErrors = []; // r130: scholar-counts census reset per seed
  vetbarWatch = []; // r133: vetbar reset per seed
  spotterWatch90 = []; monsterWatch = []; fightInst = []; sortieWatch = []; raiseDebug = []; _sortieLastDay = null; musterWatch = []; marchWatch = []; stageWatch = []; stageState = null; titanEnd = null; _councilSat = {}; _marchFruitless = {}; _fruitlessStanddown = {}; TITANVERBS.calls = []; TITANVERBS.errors = []; TITANVERBS._installed = false; // r223: d90 spotter + world-monster census + fight-instance rows + sortie rows + raise-debug rows reset per seed; r227: muster ledger + titan snapshot + verb-call log reset per seed; r239: march ledger reset per seed; r243: stage ledger + stage state reset per seed; r276: fruitless-march counters reset per seed
  console.log(`\n===== SEED ${seed} (trade road — charter pursuit) =====`);
  const { Game } = await loadGame({ seed, mode: 'journey-scale-r279-want-arm' + ARM });
  _G = Game;
  installTitanVerbWraps(Game); // r227 Q1: wrap the four muster verbs (pure logging) so the analyzer can tell whether the step is the only caller
  const _say = Game.say.bind(Game);
  Game.say = function (...a) { cap(a[0]); try { return _say(...a); } catch (e) { return a[0]; } };
  if (typeof Game.sayOncePerFight === 'function') {
    const _sopf = Game.sayOncePerFight.bind(Game);
    Game.sayOncePerFight = function (...a) {
      try {
        let st = '';
        try { st = (new Error().stack || '').split('\n').slice(1, 7).join(' | '); } catch (e) {}
        let inC = null, tb = null, tbOver = null;
        try { inC = Game.inCombat(); } catch (e) {}
        try { tb = !!Game.tbfight; tbOver = !!(Game.tbfight && Game.tbfight.over); } catch (e) {}
        barrierLog.push({ day: gday(), msg: a[0], inCombat: inC, tbfight: tb, tbfightOver: tbOver, stack: st });
      } catch (e) {}
      return _sopf(...a);
    };
  }
  if (typeof Game.emit === 'function') {
    const _emit = Game.emit.bind(Game);
    Game.emit = function (...a) { cap(a[0]); try { return _emit(...a); } catch (e) { return a[0]; } };
  }
  await setupGame(Game);
  const regInst = REGINST.install(Game); // r107 Q1: regional-gate recorder (read-only; wraps diplomacy verbs, snapshots daily)
  const liInst = LIINST.install(Game); // r112 Q1: Standing-ladder trace (read-only snapshot + delegating wrappers)
  const trInst = TRINST.install(Game); // r122 Q1+Q2: trade-road trace + wild wave-4 watch (read-only snapshot + delegating wrappers)
  const dcInst = DCINST.install(Game); // r125 Q2: death-cause census (read-only snapshot, no wrappers)
  // r130 Q1: kill-time veteran sampling (read-only wrapper on the two
  // kill-log choke points; records livingVeterans + legacy at each kill).
  try { SCINST.wrapKillRecorder(Game, scKillSamples, scKillErrors); } catch (e) { scKillErrors.push('install: ' + String(e && e.message)); }
  // r223 W5-INSTANCE (r207-owed): fight-instance wrappers, installed
  // AFTER the shared instruments (they wrap the already-wrapped
  // startCombat/fieldFight). Read-only, forward exactly, never throw:
  //   startCombat — the fight is instantiated by species id, NOT lifted
  //     from the tile entity, so the entity must be read BEFORE the
  //     call: the player-tile monster via playerMonster() (fallback:
  //     scholar.monster), plus pendingMonsterId / feastDraw for
  //     pending-instantiated fights (wanderer contact, feast draw).
  //   fieldFight — the m entity arg IS the instance (wounds persist
  //     onto m.hp); record its fingerprint pre-call, outcome post-call.
  // A wrapper error must never break a fight: every read is guarded and
  // the push happens in its own try/catch after forwarding.
  try {
    if (typeof Game.startCombat === 'function') {
      const _origSC = Game.startCombat;
      Game.startCombat = function (...a) {
        let ent = null, pending = null, feast = null;
        try { const pm = (typeof Game.playerMonster === 'function') ? Game.playerMonster() : null; const m = pm || ((Game.state && Game.state.scholar) || {}).monster || null; ent = monsterFingerprint(m); } catch (e) {}
        try { pending = Game.pendingMonsterId || null; } catch (e) {}
        try { const fd = ((Game.state && Game.state.scholar) || {}).feastDraw || null; feast = fd ? { monsterId: fd.monsterId || null, veteran: !!fd.veteran } : null; } catch (e) {}
        const r = _origSC.apply(Game, a);
        try {
          let wave = null;
          try { const def = (Game.data && Array.isArray(Game.data.monsters)) ? Game.data.monsters.find(m => m && m.id === ((a && a[0]) || pending)) : null; wave = (def && def.wave != null) ? def.wave : null; } catch (e) {}
          fightInst.push({ day: gday(), via: 'scholar', monsterId: ((a && a[0]) != null ? String(a[0]) : (pending != null ? String(pending) : null)), wave, ent, pending: pending != null ? String(pending) : null, feast });
        } catch (e) {}
        return r;
      };
    }
  } catch (e) {}
  try {
    if (typeof Game.fieldFight === 'function') {
      const _origFF = Game.fieldFight;
      Game.fieldFight = function (vid, mdef, m, opts) {
        let ent = null;
        try { ent = monsterFingerprint(m); } catch (e) {}
        const rec = _origFF.apply(Game, arguments);
        try {
          fightInst.push({ day: gday(), via: 'field', vid: (vid == null ? null : String(vid)), monsterId: (mdef && mdef.id) || null, wave: (mdef && mdef.wave != null) ? (mdef.wave | 0) : null, ent, outcome: (rec && rec.outcome) || null, rounds: (rec && rec.rounds != null) ? (rec.rounds | 0) : null });
        } catch (e) {}
        return rec;
      };
    }
  } catch (e) {}
  // r223 PROBE (RAISE_DEBUG=1, read-only): wrap bondChoices to log every
  // call where a link raise is pending for that villager — the
  // linkRaiseSpoken flag, whether a convo record exists, the offered
  // choice ids, and the THEM lines spoken so far. Answers HOW link:accept
  // can be offered in a sitting where the raise was never voiced (the
  // Felipe d130 Claudete shape). No RNG, no state mutation: the wrapper
  // forwards exactly and only appends to raiseDebug.
  // ALSO (same flag): wrap convoRecordSpokenBeat to log every flag-setting
  // call while a raise is pending — the exact call that flips
  // linkRaiseSpoken, with its tag + line. The flag can only be set here
  // (or reset in startConvo), so this closes the mechanism question.
  try {
    if (process.env.RAISE_DEBUG === '1' && typeof Game.bondChoices === 'function') {
      const _bc = Game.bondChoices.bind(Game);
      Game.bondChoices = function (vid) {
        const out = _bc(vid);
        try {
          const pend = (typeof Game.pendingLinkRaise === 'function') ? Game.pendingLinkRaise(vid) : null;
          if (pend) {
            const c = (typeof Game.convoGet === 'function') ? Game.convoGet(vid) : null;
            const tr = (c && Array.isArray(c.transcript)) ? c.transcript : [];
            raiseDebug.push({ day: gday(), vid, village: pend.villageId || null, linkRaiseSpoken: c ? !!c.linkRaiseSpoken : null, convoExists: !!c, convoActive: c ? !!c.active : null, offered: (out || []).map(o => o.id), them: tr.filter(e => e && e.who === 'them').map(e => String(e.text || '').slice(0, 100)) });
          }
        } catch (e) {}
        return out;
      };
      if (typeof Game.convoRecordSpokenBeat === 'function') {
        const _rsb = Game.convoRecordSpokenBeat.bind(Game);
        Game.convoRecordSpokenBeat = function (vid, line, opts) {
          try {
            const pend = (typeof Game.pendingLinkRaise === 'function') ? Game.pendingLinkRaise(vid) : null;
            if (pend) raiseDebug.push({ day: gday(), vid, flagCall: true, tag: (opts && opts.tag) || null, line: String(line || '').slice(0, 100) });
          } catch (e) {}
          return _rsb(vid, line, opts);
        };
      }
    }
  } catch (e) {}
  let regLastSnapDay = -1;
  const policy = Object.create(scalecourt);
  policy.id = 'journey-scale-r279-want-scalecourt-arm' + ARM;
  policy._ctx = null;
  const baseDaily = scalecourt.daily.bind(scalecourt);
  const baseSetup = scalecourt.setup ? scalecourt.setup.bind(scalecourt) : null;
  policy.setup = function (G, ctx) { if (baseSetup) baseSetup(G, ctx); policy._ctx = ctx; };
  policy.daily = function (G, ctx) {
    const hadPendingGlobal = !!((G.state || {}).pendingGlobal);
    installTrustSetters(); // R42: catch links formed during the day's actions, before the policy step moves them
    // R55 PELLET-DECLINE arm (measurement only): hide ONLY the fusion_reactor
    // offer from competent's take step; restore the pending offer afterwards
    // so the player passes on the pellet day after day. Other offers pass
    // through untouched. When PELLET_DECLINE is unset this block is inert.
    // R56 FIX (journey-scale r57 Q2 — r55 nopellet duplicates): the r55
    // wrapper restored the WHOLE pre-daily sheet after daily, even when
    // the policy had consumed it (chooseAbility clears the sheet) — so
    // the same sheet came back the next day and the unguarded push in
    // chooseAbility stacked a second entry (r55 nopellet: survivor x3,
    // green_thumb x2). A consumed sheet must never return its taken
    // choices: untouched sheet -> full restore (pellet pending again);
    // consumed sheet -> ONLY the fusion entry stays pending; a fresh
    // pump-opened sheet after a take is left alone (the engine moved on).
    let savedChoices = null, filteredChoices = null;
    if (PELLET_DECLINE) { try { const sc = G.state && G.state.scholar; if (sc && Array.isArray(sc.abilityChoices)) { savedChoices = sc.abilityChoices; filteredChoices = savedChoices.filter(c => ((c && c.id) || c) !== 'fusion_reactor'); sc.abilityChoices = filteredChoices; } } catch (e) {} }
    try { baseDaily(G, ctx); } finally { if (PELLET_DECLINE && savedChoices !== null) { try { const sc = G.state && G.state.scholar; if (sc) { const fusion = savedChoices.find(c => ((c && c.id) || c) === 'fusion_reactor'); const cur = sc.abilityChoices; if (cur === filteredChoices) { sc.abilityChoices = savedChoices; } else if ((cur === null || cur === undefined) && fusion) { sc.abilityChoices = [fusion]; } } } catch (e) {} } }
    // r276: NO ANSWERMAIL STEP — r244 judged it NO-GO (fires, moves nothing
    // about national); the composition stays a branch. The Q1 lever this run
    // is the sub-cap lift, which lives in the linkraise policy itself
    // (SUBCAPOFF=1 selects the subcapoff-sit composition above), not here.
    // r223 SORTIE STEP (r215-owed W5-INSTANCE): after the base daily,
    // the village answers a lingering beast when the gates allow. INERT
    // in r239 (SORTIE false) — the paired control never sorties.
    if (SORTIE) { try { sortieStep(G, ctx); } catch (e) { try { sortieWatch.push({ day: gday(), seen: null, held: 'step-error:' + String((e && e.message) || e).slice(0, 80) }); } catch (e2) {} } }
    // r243 STAGE STEP: before the muster step, stage the capstone delivery
    // (the r239-owed precondition — a delivered capstone while the herald
    // still lives). Arm-independent: both arms stage identically; the arms
    // diverge only in MUSTER_HOLD after delivery.
    if (STAGE_CAPSTONE === 'herald') { try { stageStep(G, ctx); } catch (e) { try { stageWatch.push({ day: gday(), event: 'step-error', reason: 'stageStep:' + String((e && e.message) || e).slice(0, 80) }); } catch (e2) { console.error('stageStep error:', e && e.message); } } }
    // r227 MUSTER STEP: after the base daily, the village answers
    // a located titan when the coalition is completable.
    if (MUSTER) { try { musterStep(G, ctx); } catch (e) { try { musterWatch.push({ day: gday(), titan: null, held: 'step-error:' + String((e && e.message) || e).slice(0, 80) }); } catch (e2) {} } }
    // r239 MARCH STEP: after the muster step, walk a READY muster
    // to the lair so the coalition fight starts.
    if (MARCH) { try { marchStep(G, ctx); } catch (e) { try { marchWatch.push({ day: gday(), titan: null, held: 'step-error:' + String((e && e.message) || e).slice(0, 80) }); } catch (e2) {} } }
    // R92 Q2b TEND-ARM (instrument only, TEND_PEER=1): after courtship, press
    // the offered Haven-panel verb tendLink on each active PEER link below
    // the seasoned trust bar, pantry-gated like the courtship block. On base
    // code this refuses every peer (primary null); on fixed code it tends.
    // LEAD links are untouched here (win-plan may tend them in-game).
    if (TEND_PEER) { try { const _links = (typeof G.hierarchyState === 'function' ? G.hierarchyState() : []); for (const _l of _links) { if (!_l || _l.status !== 'active') continue; const _isPeer = (_l.kind === 'covenant' || _l.kind === 'trade') && (_l.primary == null); if (!_isPeer) continue; if ((_l.trust || 0) >= 40) continue; if (pantryKcal() <= 12000) continue; try { const _paid = G.tendLink(_l.id); if (_paid > 0) ctx.tendPeer = (ctx.tendPeer || 0) + 1; } catch (e) {} } } catch (e) {} }
    installTrustSetters(); // R42: catch links formed during the policy step, for tomorrow's actions
    snapshotTrust(); // R42: daily trust snapshot AFTER the day's policy step, so the snapshot is the day's closing trust
    const gd = gday();
    // R42: daily person snapshot for every accepted-betrayal subject (read-only).
    for (const vid of Object.keys(betraySubjects)) { try { betrayWatch.push(Object.assign({ day: gd, vid, name: betraySubjects[vid].name, event: 'daily' }, personSnap(vid))); } catch (e) {} }
    // R39 hunger-window instrument (READ-ONLY): opening state for this day —
    // hungryDays here is the count AFTER yesterday's endDay, so the row for
    // the scatter day itself carries opening hungryDays 4 and the four rows
    // before it carry 0..3 (a fed day resets the count to 0, visible here).
    try { if (ctx && ctx.posTrace) posTrace = ctx.posTrace.slice(); } catch (e) {}
    try { if (ctx && ctx.mornTrace) mornTrace = ctx.mornTrace.slice(); } catch (e) {}
    try { hungerWatch.push({ day: gd, pantry: Math.round(pantryKcal()), hungryDays: ((_G.state.village || {}).hungryDays || 0), pilgrim: !!(ctx && ctx._pilgrim), pilgrimVid: (ctx && ctx._pilgrim) ? ctx._pilgrim.vid : null, returning: !!(ctx && ctx._returning), pilgrimages: (ctx && ctx.pilgrimages) | 0, climbStudies: (ctx && ctx.climbStudies) | 0, proposedPeer: (ctx && ctx.proposedPeer) | 0, courtPoorDays: (ctx && ctx.courtPoorDays) | 0, pool: (_G.leaguePool ? _G.leaguePool() : null) }); } catch (e) {}
    // R39 table-approach instrument (READ-ONLY): the seat priced daily, so
    // the run can name exactly which lesser bar fails at global and when
    // (if ever) arc 4 / tableWaiting / tableAnnounced arrive. tableSeat()
    // detail for a full seat is the deedGate object, not the lesser
    // w1/w2/w3 shape — the analyzer reads both shapes.
    try { const _seat = (_G.tableSeat ? _G.tableSeat() : {}) || {}; const _pg = (_G.progState ? _G.progState() : {}) || {}; tableWatch.push({ day: gd, seat: _seat.seat || 'none', detail: _seat.detail || {}, arc: _pg.arc || 0, tableWaiting: !!_pg.tableWaiting, tableAnnounced: !!_pg.tableAnnounced, tableDone: !!_pg.tableDone, scaleRank: (() => { try { return _G.scaleRank(); } catch (e) { return '?'; } })(), globalLive: !!_G.state.globalLive, overtimeTier: (_G.overtimeTier ? _G.overtimeTier() : null) }); } catch (e) {}
    // R113 Q1 ladder snapshot (READ-ONLY): one row per policy day.
    try { if (liInst) liInst.snapshot(ctx); } catch (e) {}
    // R113 Q1+Q2 trade-road snapshot (READ-ONLY): one row per policy day.
    try { if (trInst) trInst.snapshot(ctx); } catch (e) {}
    // R125 Q2 death-census snapshot (READ-ONLY): fallen + telemetry
    // diffs and the daily context row, one row per policy day.
    try { if (dcInst) dcInst.snapshot(ctx); } catch (e) {}
    // r130 Q1/Q3 scholar-counts snapshot (READ-ONLY): livingVeterans
    // (NEW rule — the scholar counts) + livingVeteransLegacy (OLD
    // rule — payable) + payable, one row per policy day, BEFORE the
    // delivery verb below so the row is the pre-delivery state.
    try { const _sc = SCINST.snapshotLadder(Game); if (_sc) scRows.push(_sc); } catch (e) { scKillErrors.push('snapshot d' + gd + ': ' + String(e && e.message)); }
    // r133 Q2 vetbar snapshot (READ-ONLY): the fixed-engine readiness
    // veterans vs the ladder veterans, PLUS the shadow old-rule counts
    // (the same kill-log scan with the PRE-FIX vp-only liveness test —
    // scholar counts, roster NOT required). A shadow > fixed day is a
    // day the old engine would have read a phantom veteran; the fixed
    // engine must never disagree with the ladder (r4==l3, r5==l4).
    // Same point as the scholar-counts row (after baseDaily, before the
    // delivery verb), so the row is the pre-delivery state.
    try {
      const _log = (Game.state && Game.state.waveKillLog) || [];
      const _roster = ((Game.state && Game.state.village && Game.state.village.roster) || []);
      const _sid = Game.villagerId;
      const _oldIsLiving = (vid) => {
        if (vid === _sid) return true;
        try { const vp = Game.vpOf(vid); return !!(vp && !vp.dead); } catch (e) { return false; }
      };
      const _shadow = (minW) => {
        const seen = new Set();
        for (const e of _log) {
          if (!e || !e.by || ((e.w | 0) < minW)) continue;
          if (!_oldIsLiving(e.by)) continue;
          seen.add(e.by);
        }
        return seen.size;
      };
      let _r4 = null, _r5 = null, _l3 = null, _l4 = null, _blooded = null;
      try { _r4 = (Game.waveCombatReadiness(4) || {}).veterans; } catch (e) {}
      try { _r5 = (Game.waveCombatReadiness(5) || {}).veterans; } catch (e) {}
      try { _l3 = Game._ladderLivingVeterans(3); } catch (e) {}
      try { _l4 = Game._ladderLivingVeterans(4); } catch (e) {}
      try { _blooded = Game.villageBlooded(); } catch (e) {}
      vetbarWatch.push({ day: gd, roster: _roster.length, r4: _r4, r5: _r5, l3: _l3, l4: _l4, shadow4: _shadow(3), shadow5: _shadow(4), blooded: _blooded });
    } catch (e) {}
    // r223 Q5 (r207-owed): d90 spotter snapshot — same shape as the
    // seed-end census() read, taken while the roster still lives. The
    // end-only snapshot cannot read a collapse-heavy band.
    try { if (gd === 90) { const _s90 = spotterSnapshot(); if (_s90) spotterWatch90 = _s90.slice(); } } catch (e) {}
    // r223 W5-INSTANCE (r207-owed): daily live world-monster census —
    // every monster on a tile (state.worldMonsters), fingerprinted. The
    // analyzer joins fight rows to these rows by entity key / hp
    // trajectory. Read-only; worldMonsters() is the engine's own read
    // API (game.js:20567). A row with zero live monsters is still a row
    // (the absence is data — no wave-5 entity alive that day).
    try {
      const _wms = (typeof _G.worldMonsters === 'function') ? _G.worldMonsters() : [];
      monsterWatch.push({ day: gd, monsters: (_wms || []).map(m => monsterFingerprint(m)).filter(Boolean) });
    } catch (e) {}
    // R113 Q1 DELIVERY VERB (pre-registered in the prereg — a competent
    // player at National with a ready capstone delivers it; the delivery
    // entry point is wired-exempt, app.js panelHaven only, so no sim
    // policy ever calls it). Free deeds first, the costly tribute last.
    // The attempt is logged by the instrument's ladderDeliverCapstone
    // wrapper AND counted here, so a silent non-attempt is visible.
    try {
      if (liInst) {
        const _rows = (liInst.t && liInst.t.daily) || [];
        const _last = _rows[_rows.length - 1];
        if (_last && (_last.stage | 0) >= 3 && !_last.delivered) {
          const _kind = LIINST.pickCapstoneOrder(_last.capstones);
          if (_kind) {
            ctx.capstoneAttempts = (ctx.capstoneAttempts | 0) + 1;
            try { _G.ladderDeliverCapstone(_kind); } catch (e) { ctx.capstoneAttemptErrors = (ctx.capstoneAttemptErrors | 0) + 1; }
          }
        }
      }
    } catch (e) {}
    // R103 Q1 national-gate instrument (READ-ONLY): the exact staging gates
    // from hierarchy.js _checkNational + polityOf/_belongPolity/_covenantPolity/
    // _tradePolity, snapshotted daily so the run can name which gate blocks the
    // national beat and for how long. Seasoned mirrors _linkSeasoned exactly:
    // 30+ days old AND trust 40+ (conquered: the season, not the trust; MERCY
    // grace counts while mercyUntil holds). Belong's candidate is the best
    // Haven-subordinate link by (good-standing, realm size).
    try {
      const _day = gd;
      const _links = links();
      const _seasoned = (l) => { try { if (!l || l.status !== 'active') return false; if ((_day - (l.day | 0)) < 30) return false; if (l.conquered) return true; if (l.mercyUntil && _day < l.mercyUntil) return true; return (l.trust | 0) >= 40; } catch (e) { return false; } };
      const _lead = _links.filter(l => l && l.status === 'active' && l.primary === 'haven');
      const _cov = _links.filter(l => l && l.status === 'active' && l.kind === 'covenant');
      const _trd = _links.filter(l => l && l.status === 'active' && l.kind === 'trade');
      let _belong = null;
      try {
        for (const l of _links) {
          if (!l || l.status !== 'active' || l.subordinate !== 'haven' || !l.primary) continue;
          let _realm = null; try { const _bp = _G.polityOf ? _G.polityOf(l.primary) : null; _realm = _bp ? _bp.size : null; } catch (e) {}
          let _fps = 0; try { const _all = _G.foreignPolities ? _G.foreignPolities() : []; for (const _f of _all) if (_f.primary === l.primary) _fps = (_f.subs || []).length; } catch (e) {}
          const _cand = { other: l.primary, trust: l.trust | 0, arrears: l.arrears || 0, age: _day - (l.day | 0), realm: _realm, foreignSubs: _fps, good: ((l.trust | 0) >= 50 && (l.arrears || 0) === 0 && (_day - (l.day | 0)) >= 14) };
          const _better = !_belong || (_cand.good && !_belong.good) || (_cand.good === _belong.good && (_cand.realm || 0) > (_belong.realm || 0));
          if (_better) _belong = _cand;
        }
      } catch (e) {}
      let _foreignMax = 0;
      try { const _all = _G.foreignPolities ? _G.foreignPolities() : []; for (const _f of _all) _foreignMax = Math.max(_foreignMax, 1 + ((_f.subs || []).length)); } catch (e) {}
      let _leadPol = null, _belPol = null, _covPol = null, _trdPol = null;
      try { _leadPol = _G.polityOf ? _G.polityOf('haven') : null; } catch (e) {}
      try { _belPol = _G._belongPolity ? _G._belongPolity() : null; } catch (e) {}
      try { _covPol = _G._covenantPolity ? _G._covenantPolity() : null; } catch (e) {}
      try { _trdPol = _G._tradePolity ? _G._tradePolity() : null; } catch (e) {}
      const _netDay = (() => { try { return _G.state.networkLiveDay || null; } catch (e) { return null; } })();
      natGateWatch.push({ day: _day, rank: (() => { try { return _G.scaleRank(); } catch (e) { return '?'; } })(), nationalLive: !!_G.state.nationalLive, globalLive: !!_G.state.globalLive,
        networkLive: !!_G.state.networkLive, networkLiveDay: _netDay, rungReady: (!!_G.state.networkLive && _netDay != null && (_day - _netDay) >= 30),
        exiled: !!((_G.state.scholar || {}).exiled), scaleRefused: !!_G.state.scaleRefused,
        pendingShape: (_G.state.pendingNational || {}).shape || null, pendingDay: (_G.state.pendingNational || {}).day ?? null,
        leadActive: _lead.length, leadSeasoned: _lead.filter(_seasoned).length,
        covActive: _cov.length, covSeasoned: _cov.filter(_seasoned).length,
        tradeActive: _trd.length, tradeSeasoned: _trd.filter(_seasoned).length,
        belong: _belong, foreignMax: _foreignMax,
        leadPolity: _leadPol ? { shape: _leadPol.shape, size: _leadPol.size } : null,
        belongPolity: _belPol ? { shape: _belPol.shape, size: _belPol.size } : null,
        covPolity: _covPol ? { shape: _covPol.shape, size: _covPol.size } : null,
        tradePolity: _trdPol ? { shape: _trdPol.shape, size: _trdPol.size } : null,
        defer: (() => { try { return Object.assign({}, _G.state._natDefer || {}); } catch (e) { return {}; } })(),
        viewership: (_G.state.village || {}).viewership == null ? null : Math.round(_G.state.village.viewership) });
    } catch (e) {}
    // R90 Q2 fusion instrument (READ-ONLY): the pellet's installed/online/ability
    // triple that fusionReactorOnline() ANDs together, snapshotted AFTER baseDaily
    // but BEFORE endDay's build tick — same point as dutyWatch. A flip in the
    // online() value with no change in these three fields would falsify the
    // mechanism reading; a flip WITH a field change names the transition.
    try { const _sc = (_G.state.scholar || {}); const _fr = _sc.fusionReactor || {}; let _on = null, _has = null; try { _on = (typeof _G.fusionReactorOnline === 'function') ? !!_G.fusionReactorOnline() : null; } catch (e) {} try { _has = (typeof _G.hasAbility === 'function') ? !!_G.hasAbility('fusion_reactor') : null; } catch (e) {} fusionWatch.push({ day: gd, scholarVid: _G.villagerId || null, installed: !!_fr.installed, onlineFlag: (_fr.online === undefined ? null : !!_fr.online), sinceDay: (_fr.sinceDay === undefined ? null : _fr.sinceDay), online: _on, hasAbility: _has, holder: (_G.state.fusionReactorHolder || null), abilities: (_sc.abilities || []).map(a => ((a && a.id) || a)) }); } catch (e) {}
    // R65 Q2 duty-gate instrument (READ-ONLY): the weaponCraft knowledge map
    // (vid -> {recipeId: level}), the weaponCraftCd last-attempt-day map,
    // the assignments map's deadfall entries, roster size, and whether the
    // player is at Haven (the witness gate for the counted craft line).
    // Snapshotted AFTER baseDaily but BEFORE endDay runs the build tick,
    // so the maps carry attempts through the previous day's endDay — the
    // analyzer derives attempt days from the raw maps, never from this
    // row's day alone.
    try { const _v = (_G.state.village || {}); const _wc = _v.weaponCraft || {}; const _wcd = _v.weaponCraftCd || {}; const _asg = _v.assignments || {}; let _ah = null; try { _ah = (_G.playerAtHaven ? _G.playerAtHaven() : null); } catch (e) {} dutyWatch.push({ day: gd, roster: (_v.roster || []).length, weaponCraft: JSON.parse(JSON.stringify(_wc)), weaponCraftCd: Object.assign({}, _wcd), deadfallAssigned: Object.keys(_asg).filter(vid => _asg[vid] && _asg[vid].task === 'deadfall'), atHaven: _ah }); } catch (e) {}
    // R66 Q1 weaponless-split instrument (READ-ONLY): per home-roster
    // villager, own equipped/pack/stashed itemIds, weaponCraft record,
    // weaponCraftCd value, away/dead flags; plus the camp-pile materials
    // snapshot. Same point as dutyWatch (after baseDaily, before endDay's
    // build tick); gearDay arming inside the tick is handled by the
    // prereg's transition rule, not by this snapshot.
    try { const _v2 = (_G.state.village || {}); let _mats = null; try { const _st = (_G.stashState ? _G.stashState() : null); _mats = (_st && _st.materials) || null; } catch (e) {} if (!_mats) _mats = ((_v2.stash && _v2.stash.materials) || {}); const _rows = []; for (const _vid of (_v2.roster || [])) { if (_vid === _G.villagerId) continue; let _p = null; try { _p = _G.getPerson ? _G.getPerson(_vid) : null; } catch (e) {} if (!_p) { _rows.push({ vid: _vid, missing: true }); continue; } const _idOf = (e) => (e && (e.itemId || e.id)) || e; _rows.push({ vid: _vid, dead: !!_p.dead, away: !!((_v2.away || {})[_vid]), equipped: Object.values(_p.equipped || {}).map(e => e && e.itemId).filter(Boolean), pack: (_p.items || []).map(_idOf).filter(Boolean), stashed: (_p.stashed || []).map(_idOf).filter(Boolean), wc: JSON.parse(JSON.stringify(((_v2.weaponCraft || {})[_vid] || {}))), cd: ((_v2.weaponCraftCd || {})[_vid] ?? null) }); } wsplitWatch.push({ day: gd, pile: JSON.parse(JSON.stringify(_mats)), rows: _rows }); } catch (e) {}
    // R24: detect the Watchers answer (scalecourt answers 'feast' in baseDaily)
    if (hadPendingGlobal && !(G.state || {}).pendingGlobal) {
      globalNotes.push({ day: gd, how: 'feast', globalLive: !!G.state.globalLive, viewership: (G.state.village || {}).viewership });
    }
    // R24: weekly seat sample for the table-approach arm
    if (gd % 7 === 0) { seatWatch.push(seatSample()); try { poolWatch.push({ day: gd, pool: _G.leaguePool ? _G.leaguePool() : null, pantry: Math.round(pantryKcal()) }); } catch (e) {}
      try {
        const lk = {}; for (const l of links()) { const oid = l.primary === 'haven' ? l.subordinate : (l.primary || l.a); if (l.a && l.b) { const oid2 = l.a === 'haven' ? l.b : l.a; lk[oid2] = l; } lk[oid] = l; }
        villageWatch.push({ day: gd, villages: ((_G.state.otherVillages || []).map(v => {
          const l = lk[v.id]; const known = _G.knowsVillage ? _G.knowsVillage(v) : !!(v.generated || v.rumored);
          return { id: v.id, name: v.name, dist: Math.abs((v.x||4)-4)+Math.abs((v.y||4)-4), known: !!known, rumored: !!v.rumored, generated: !!v.generated, rumorDay: v.rumorDay || null, opinion: v.opinion || 0, codexGiven: !!v._codexOpinionGiven, linkKind: l ? (l.kind || (l.primary ? 'primary-sub' : null)) : null, linkTrust: l ? (l.trust||0) : null, linkAge: l ? (gd - (l.day|0)) : null };
        })) });
      } catch (e) {} }
    if (CONVO_DAYS.includes(gd)) {
      let vid = null;
      try {
        const roster = (G.state.village.roster || []).filter(id => id !== G.villagerId);
        for (const id of roster) {
          const p = person(id);
          if (p.dead) continue;
          try { const comm = G.commLevel ? G.commLevel(id) : { level: 'full' }; if (comm.level === 'none') continue; } catch (e) {}
          let cnt = -1;
          try { const c0 = G.convoGet(id); cnt = (c0 && c0.count) || 0; } catch (e) {}
          if (cnt < 2) { vid = id; break; }
        }
        if (!vid && roster.length) vid = roster.find(id => !person(id).dead) || null;
      } catch (e) {}
      if (vid) { try { convoFiles.push(runConversation(gd, vid)); } catch (e) {} }
      // R133 Q4: a nonverbal sitting on the same days (the r132 driver
      // skipped comm-'none' villagers, so the trap-line class never
      // appeared in the Q4 transcripts). First living comm-'none' roster
      // villager; saved as *-nv.txt. No invite is staged — the sitting
      // shows whatever the villager brings, mime included.
      let nvid = null;
      try {
        const roster = (G.state.village.roster || []).filter(id => id !== G.villagerId);
        for (const id of roster) {
          const p = person(id);
          if (p.dead) continue;
          try { const comm = G.commLevel ? G.commLevel(id) : { level: 'full' }; if (comm.level !== 'none') continue; } catch (e) { continue; }
          nvid = id; break;
        }
      } catch (e) {}
      if (nvid) { try { convoFiles.push(runConversation(gd, nvid, true)); } catch (e) {} }
    }
    // R55 PROBE: extra talks with a pinned NPC on extra days (probe-only).
    if (PROBE_VID && PROBE_DAYS.includes(gd) && _currentSeed === PROBE_SEED) {
      try { convoFiles.push(runConversation(gd, PROBE_VID)); } catch (e) {}
    }
    // R107 Q1: regional-gate snapshot for this day (read-only; one row per day).
    try { const _rgd = gday(); if (_rgd !== regLastSnapDay) { regLastSnapDay = _rgd; regInst.snapshot(); } } catch (e) {}
  };
  const result = await runDays(Game, policy, {
    days: DAYCAP,
    manifest: { seed, mode: 'journey-scale-r279-want-arm' + ARM, date: new Date().toISOString().slice(0, 10), node: process.version },
  });
  // R125 Q2: drain the death census AFTER runDays — the final endDay's
  // deaths happen after the last snapshot; drain() catches them
  // (idempotent; writes no daily row).
  try { if (dcInst) dcInst.drain(); } catch (e) { console.error('deathcensus drain failed:', e && e.message); }
  // R107 Q1: finalize the regional-gate recorder (read-only) and emit the corpus.
  let regFin = null;
  try { regInst.snapshot(); } catch (e) {}
  try { regFin = regInst.finalize(); } catch (e) {}
  try { regInst.uninstall(); } catch (e) {}
  // R113 Q1: finalize the ladder trace (read-only) and emit the corpus.
  let liFin = null;
  try { liFin = liInst.finalize(); } catch (e) { liFin = { daily: [], deliveries: [], fights: [], errors: [{ day: -1, where: 'finalize', err: String(e && e.message) }] }; }
  try { liInst.uninstall(); } catch (e) {}
  // R113 Q1+Q2: finalize the trade-road trace + wild watch (read-only).
  let trFin = null;
  try { trFin = trInst.finalize(); } catch (e) { trFin = { daily: [], beatAnswers: [], wildFights: [], errors: [{ day: -1, where: 'finalize', err: String(e && e.message) }] }; }
  try { trInst.uninstall(); } catch (e) {}
  // R125 Q2: finalize the death-cause census (read-only).
  let dcFin = null;
  try { dcFin = dcInst.finalize(); } catch (e) { dcFin = { daily: [], deaths: [], teleDeaths: [], joins: [], leavers: [], errors: [{ day: -1, where: 'finalize', err: String(e && e.message) }], summary: { deaths: 0, byCause: {}, multiDeathDays: [], teleDeaths: 0, telePerson: 0, teleMonster: 0, joins: 0, leavers: 0, deathDepartures: 0, initialRosterLen: 0, finalRosterLen: null, booksClose: false, unattributed: -1 } }; }
  try { dcInst.uninstall(); } catch (e) {}
  const ctx = policy._ctx || {};
  const c = census();
  // R113 Q1: ladder summary on the census (the analyzer reads the
  // daily/event files for the stage table; this is the seed-end rollup).
  c.ladderChain = {
    rows: (liFin.daily || []).length, errors: (liFin.errors || []).length,
    peakStage: (liFin.daily || []).reduce((m, x) => Math.max(m, (x.peakStage == null ? 0 : x.peakStage) | 0), 0),
    stage1Day: (() => { const r = (liFin.daily || []).find(x => (x.stage | 0) >= 1); return r ? r.day : null; })(),
    stage2Day: (() => { const r = (liFin.daily || []).find(x => (x.stage | 0) >= 2); return r ? r.day : null; })(),
    stage3Day: (() => { const r = (liFin.daily || []).find(x => (x.stage | 0) >= 3); return r ? r.day : null; })(),
    countedEnd: (() => { const r = (liFin.daily || [])[(liFin.daily || []).length - 1]; return r ? r.counted : null; })(),
    shortfallEnd: (() => { const r = (liFin.daily || [])[(liFin.daily || []).length - 1]; return r ? r.shortfall : null; })(),
    cappedEnd: (() => { const r = (liFin.daily || [])[(liFin.daily || []).length - 1]; return r ? r.capped : null; })(),
    tracksEnd: (() => { const r = (liFin.daily || [])[(liFin.daily || []).length - 1]; return r ? r.tracks : null; })(),
    bundleStages: (() => { const r = (liFin.daily || [])[(liFin.daily || []).length - 1]; return (r && r.detail) ? (r.detail.bundleStages || []) : []; })(),
    bundleBonusEnd: (() => { const r = (liFin.daily || [])[(liFin.daily || []).length - 1]; return (r && r.detail) ? (r.detail.bundleBonus | 0) : 0; })(),
    capstoneReady: (() => { const out = {}; for (const k of ['trade_charter', 'feast_embassy', 'military_tribute']) { const r = (liFin.daily || []).find(x => x.capstones && x.capstones[k] && x.capstones[k].ready); out[k] = r ? r.day : null; } return out; })(),
    capstoneDelivered: (() => { const r = (liFin.daily || []).find(x => x.delivered); return r ? { kind: r.delivered, day: r.day } : null; })(),
    deliveries: (liFin.deliveries || []).length,
    deliveriesOk: (liFin.deliveries || []).filter(x => x.ok).length,
    deliveryAttempts: (ctx.capstoneAttempts | 0),
    deliveryAttemptErrors: (ctx.capstoneAttemptErrors | 0),
    seatLesserDay: (() => { const r = (liFin.daily || []).find(x => x.seat === 'lesser' || x.seat === 'full'); return r ? r.day : null; })(),
    seatFullDay: (() => { const r = (liFin.daily || []).find(x => x.seat === 'full'); return r ? r.day : null; })(),
    fights: (liFin.fights || []).length,
    fightsByWave: (() => { const m = {}; for (const f of (liFin.fights || [])) { if (f.wave != null) m[f.wave] = (m[f.wave] | 0) + 1; } return m; })(),
    // R113 Q1: sentiment-taught day (r111 metric review — the exact day
    // the lesser seat's slow leg lands) + end-of-run kill attribution.
    sentimentTaughtDay: (() => { const r = (liFin.daily || []).find(x => x.sentimentTaught === true); return r ? r.day : null; })(),
    killAttrEnd: (() => { const r = (liFin.daily || [])[(liFin.daily || []).length - 1]; return (r && r.killAttr) ? r.killAttr : null; })(),
    vetkillRows: ((liFin.waveKillLog || []).length),
    bankedHeadStartEnd: (() => { const r = (liFin.daily || [])[(liFin.daily || []).length - 1]; return (r && r.detail && r.detail.bankedHeadStart != null) ? r.detail.bankedHeadStart : 0; })(),
  };
  // R113 Q1: trade-road rollup (the analyzer reads the daily/event
  // files for the step table; this is the seed-end summary).
  c.tradeRoad = {
    rows: (trFin.daily || []).length, errors: (trFin.errors || []).length,
    firstTradeProposalDay: (() => { const r = (trFin.daily || []).find(x => (x.trN | 0) >= 1); return r ? r.day : null; })(),
    maxTradeLinks: (trFin.daily || []).reduce((m, x) => Math.max(m, (x.trN | 0)), 0),
    maxTradeSeasoned: (trFin.daily || []).reduce((m, x) => Math.max(m, (x.trSeasoned | 0)), 0),
    firstSeasonedTradeDay: (() => { const r = (trFin.daily || []).find(x => (x.trSeasoned | 0) >= 3); return r ? r.day : null; })(),
    maxSubs: (trFin.daily || []).reduce((m, x) => Math.max(m, (x.subs | 0)), 0),
    subCapSkips: (LR ? (LR.linkraiseStats().raisesSkippedSubCap | 0) : null),
  subCapOffPass: (LR ? ((LR.linkraiseStats().raisesPassedSubCapOff | 0) || 0) : null), // r276 Q1: raises the lifted guard let through (0 on the control arm — the counter does not exist there)
    beatAnswers: (trFin.beatAnswers || []).map(b => `${b.shape}:${b.how}@d${b.day}`).join(','),
    charterStagedDay: (() => { const r = (trFin.beatAnswers || []).find(b => b.shape === 'trade'); return r ? r.day : null; })(),
    covenantWalks: (trFin.beatAnswers || []).filter(b => b.shape === 'covenant' && b.how === 'walk').length,
    sealedDay: (() => { const r = (trFin.daily || []).find(x => (x.charteredLinks | 0) >= 1); return r ? r.day : null; })(),
  };
  // R113 Q2: wild wave-4 rollup (villager-class field fights by outcome).
  c.wildW4 = {
    rows: (trFin.wildFights || []).length, errors: (trFin.errors || []).length,
    villagerW4Calls: (trFin.wildFights || []).filter(f => f.cls === 'villager' && (f.wave | 0) >= 4).length,
    villagerW4ByOutcome: (() => { const m = {}; for (const f of (trFin.wildFights || [])) { if (f.cls === 'villager' && (f.wave | 0) >= 4) m[f.outcome || '?'] = (m[f.outcome || '?'] | 0) + 1; } return m; })(),
    villagerW4Deaths: (trFin.wildFights || []).filter(f => f.cls === 'villager' && (f.wave | 0) >= 4 && f.outcome === 'vDie').length,
    scholarW4Calls: (trFin.wildFights || []).filter(f => f.cls === 'scholar' && (f.wave | 0) >= 4).length,
    villagerW1_3: (() => { const m = {}; for (const f of (trFin.wildFights || [])) { if (f.cls === 'villager' && (f.wave | 0) >= 1 && (f.wave | 0) <= 3) m[f.outcome || '?'] = (m[f.outcome || '?'] | 0) + 1; } return m; })(),
  };
  // R125 Q2: death-cause census rollup (the analyzer reads the
  // deathcensus corpus for the cause tables; this is the seed-end
  // summary with the reconciliation verdict on it).
  c.deathCensus = {
    rows: (dcFin.daily || []).length, errors: (dcFin.errors || []).length,
    deaths: ((dcFin.summary || {}).deaths | 0),
    byCause: ((dcFin.summary || {}).byCause || {}),
    multiDeathDays: ((dcFin.summary || {}).multiDeathDays || []),
    telePerson: ((dcFin.summary || {}).telePerson | 0),
    telePersonHaven: ((dcFin.summary || {}).telePersonHaven | 0),
    teleMonster: ((dcFin.summary || {}).teleMonster | 0),
    teleOnly: ((dcFin.summary || {}).teleOnly | 0),
    fallenOnly: ((dcFin.summary || {}).fallenOnly | 0),
    rosteredDeaths: ((dcFin.summary || {}).rosteredDeaths | 0),
    guestDeaths: ((dcFin.summary || {}).guestDeaths | 0),
    joins: ((dcFin.summary || {}).joins | 0),
    leavers: ((dcFin.summary || {}).leavers | 0),
    booksClose: !!((dcFin.summary || {}).booksClose),
    unattributed: ((dcFin.summary || {}).unattributed | 0),
    dutyDays: (dcFin.daily || []).filter(d => d.dutyHolder != null).length,
    healerDays: (dcFin.daily || []).filter(d => d.healerId != null).length,
  };
  c.proposedLead = (ctx.proposedLead | 0) || (ctx.proposed | 0);
  c.linkraise = LR ? LR.linkraiseStats() : null; // r108 Q1: raise ledger (null on the baseline leg)
  c.answermail = (ANSWERMAIL && AM) ? AM.answermailStats() : null; // r244 Q1: answer-the-mail ledger (null on the control arm)
  c.sit = SIT; // r109 Q1: which leg this seed ran (true = sit+modal live)
  c.won = !!_G.won; // r109 Q1: a table terminal sets Game.over + Game.won (table.js x4)
  c.tableState = (() => { try { const T = (_G.tableState ? _G.tableState() : null) || null; if (!T) return null; return { phase: T.phase || null, path: T.path || null, branch: T.branch || null, seat: T.seat || null, seatTaker: T.seatTaker || null, failedDoors: (T.failedDoors || []).slice() }; } catch (e) { return null; } })();
  // r109 Q1: sit + modal counters off the policy ctx (seatdrive sd*, modalplay mp*), plus the modalplay door/beat records.
  c.sitStats = { previewSeen: ctx.sdPreviewSeen | 0, attempts: ctx.sdSeatAttempts | 0, taken: ctx.sdSeatTaken | 0, takenDay: ctx.sdSeatDay || null, takenKind: ctx.sdSeatKind || null, failed: ctx.sdSeatFailed | 0, guardRefused: ctx.sdGuardRefused | 0, noScholar: ctx.sdNoScholar | 0, driveError: ctx.sdDriveError | 0 };
  c.modalStats = { doorsPlayed: ctx.mpDoorsPlayed | 0, answers: ctx.mpAnswers | 0, drained: !!ctx.mpDrained, doorNoHonest: ctx.mpDoorNoHonest | 0, witnessTaken: ctx.mpWitnessTaken | 0, trialSkipped: ctx.mpTrialSkipped | 0, conscriptRefused: ctx.mpConscriptRefused | 0, driveError: ctx.mpDriveError | 0,
    doors: (ctx._modalplay && ctx._modalplay.doors) ? ctx._modalplay.doors.slice() : [],
    beats: (ctx._modalplay && ctx._modalplay.beats) ? ctx._modalplay.beats.slice() : [] };
  c.raiseTalks = c.linkraise ? (c.linkraise.raiseTalks || []) : [];
  c.proposedPeer = ctx.proposedPeer | 0;
  c.pilgrimages = ctx.pilgrimages | 0;
  c.climbStudies = ctx.climbStudies | 0;
  c.courtPoorDays = ctx.courtPoorDays | 0;
  c.pilgrimagesPoor = ctx.pilgrimagesPoor | 0;
  c.proposedPeerPoor = ctx.proposedPeerPoor | 0;
  c.courtCounters = ctx.courtCounters | 0;
  // R55: fusion/ability reads (read-only, seed end).
  try { const sc = Game.state.scholar || {}; c.fusionInstalled = !!((sc.fusionReactor || {}).installed); c.fusionHolder = (Game.state.fusionReactorHolder || null); c.abilitiesHeld = (sc.abilities || []).map(a => ((a && a.id) || a)); c.choseAbility = ctx.choseAbility | 0; c.pelletDeclineArm = PELLET_DECLINE; } catch (e) { c.fusionInstalled = null; }
  c.courtAccords = ctx.courtAccords | 0;
  c.tended = ctx.tended | 0;
  c.tendPeer = ctx.tendPeer | 0;
  c.fillTopUps = ctx.fillTopUps | 0;
  c.fillTopUpLiters = ctx.fillTopUpLiters | 0;
  c.fillUnloads = ctx.fillUnloads | 0;
  c.fillSkipStudy = ctx.fillSkipStudy | 0;
  c.fillSkipFull = ctx.fillSkipFull | 0;
  c.defenseCalls = ctx.defenseCalls | 0;
  c.courtNational = ctx.courtNational | 0;
  const deaths = [];
  try {
    for (const e of (Game.state.telemetry || [])) {
      if (e && e.type === 'death') deaths.push({ day: e.day, who: e.who, cause: e.cause, player: !!e.player });
    }
  } catch (e2) {}
  c.deathLog = deaths;
  const out = { arm: ARM, sortie: SORTIE, census: c, notes: (ctx.notes || []).slice(-20),
    // R113 telemetry fix (r110 metric review): the scale driver's census
    // never emitted these keys, so telemetry-check's fightsTotal /
    // fightsByWave.4 / maxGameDay always read 0. fightsTotal counts
    // startCombat-called fights (uprising/party-betrayal direct builds
    // bypass startCombat and are excluded — same scope as the ladder
    // instrument); fightsByWave keys are wave numbers as strings.
    fightsTotal: (liFin.fights || []).length,
    fightsByWave: (() => { const m = {}; for (const f of (liFin.fights || [])) { if (f.wave != null) m[String(f.wave)] = (m[String(f.wave)] | 0) + 1; } return m; })(),
    maxGameDay: c.day }; 
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r279-${ARML}-trust-${seed}.json`), JSON.stringify(out, null, 1));
  // r244 Q1: the answermail ledger per seed (mechanism proof).
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r279-${ARML}-answermail-${seed}.json`), JSON.stringify({ seed, arm: ARM, answermail: ANSWERMAIL, stats: (ANSWERMAIL && AM) ? AM.answermailStats() : null }, null, 1));
  // r223: the sortie ledger — one row per lingerer day (called or held).
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r279-${ARML}-sortie-${seed}.json`), JSON.stringify({ seed, arm: ARM, sortie: SORTIE, rows: sortieWatch }, null, 1));
  // r227 Q1 MUSTER corpus: the per-day muster ledger + the engine's own
  // titan end-state (omens, musters, slain, outcomes) + the verb-call log.
  try {
    titanEnd = (() => {
      try {
        const st = (_G.state || {}).titans || {};
        return {
          omens: JSON.parse(JSON.stringify(st.omens || {})),
          musters: JSON.parse(JSON.stringify(st.musters || {})),
          slain: JSON.parse(JSON.stringify(st.slain || {})),
          outcomes: JSON.parse(JSON.stringify(st.outcomes || [])),
        };
      } catch (e) { return { error: String((e && e.message) || e).slice(0, 120) }; }
    })();
    fs.writeFileSync(path.join(EVIDIR, `journey-scale-r279-${ARML}-muster-${seed}.json`), JSON.stringify({ seed, arm: ARM, muster: MUSTER, musterHold: MUSTER_HOLD, rows: musterWatch, titanEnd, verbCalls: TITANVERBS.calls, verbErrors: TITANVERBS.errors }, null, 1));
    fs.writeFileSync(path.join(EVIDIR, `journey-scale-r279-${ARML}-march-${seed}.json`), JSON.stringify({ seed, arm: ARM, march: MARCH, musterHold: MUSTER_HOLD, rows: marchWatch, titanEnd }, null, 1));
    // r243 STAGE corpus: the staging ledger + end state (armed/delivered/via/abandoned) so the analyzer can verify the precondition was staged and the arms staged identically.
    fs.writeFileSync(path.join(EVIDIR, `journey-scale-r279-${ARML}-stage-${seed}.json`), JSON.stringify({ seed, arm: ARM, stage: STAGE_CAPSTONE, state: stageState, rows: stageWatch }, null, 1));
    fs.writeFileSync(path.join(EVIDIR, `journey-scale-r279-${ARML}-march-${seed}.txt`), marchWatch.map(r => `d${r.day} ${r.titan || '-'} stage=${r.stage == null ? '-' : r.stage} lair=${r.lair ? r.lair.join(',') : '-'} from=${r.from ? r.from.join(',') : '-'} arrived=${r.arrived ? 1 : 0} onTile=${r.onTile ? 1 : 0} pending=${r.pending ? 1 : 0} held=${r.held || '-'} ta=${r.ta == null ? '-' : (r.ta ? 1 : 0)} ts=${r.ts == null ? '-' : (r.ts ? 1 : 0)}`).join('\n'));
    fs.writeFileSync(path.join(EVIDIR, `journey-scale-r279-${ARML}-muster-${seed}.txt`), musterWatch.map(r => `d${r.day} ${r.titan || '-'} stage=${r.stage == null ? '-' : r.stage} present=${r.present ? 1 : 0} ready=${r.ready == null ? '-' : (r.ready ? 1 : 0)} blades=${r.bladesAllied == null ? '-' : r.bladesAllied}+${r.bladesHaven == null ? '-' : r.bladesHaven} called=${r.called ? 1 : 0} committed=${r.committed}${(r.committedVids || []).length ? ' vids=' + r.committedVids.join(',') : ''} held=${r.held || '-'} ta=${r.ta == null ? '-' : (r.ta ? 1 : 0)} ts=${r.ts == null ? '-' : (r.ts ? 1 : 0)}${r.council ? ' proj=' + r.council.total + '/' + r.council.need : ''}`).join('\n'));
  } catch (e) { console.error('muster write failed:', e && e.message); }
  // r223 PROBE (RAISE_DEBUG=1): the bondChoices ledger for pending raises.
  if (process.env.RAISE_DEBUG === '1') fs.writeFileSync(path.join(EVIDIR, `journey-scale-r279-${ARML}-raisedebug-${seed}.json`), JSON.stringify({ seed, arm: ARM, rows: raiseDebug }, null, 1));
  // R109: one file per raise-answer talk (the r108 blank — the talks were
  // invisible to the instruments). Read by the people check in full.
  try {
    (c.raiseTalks || []).forEach((t, i) => {
      const nm = (() => { try { return vname(t.vid) || t.vid; } catch (e) { return t.vid; } })();
      const lines = (t.lines || []).map(l => `${l.who === 'them' ? 'THEM' : 'YOU'}: ${l.text}`).join('\n');
      fs.writeFileSync(path.join(EVIDIR, `journey-scale-r279-${ARML}-raisetalk-${seed}-${i + 1}.txt`),
        `=== seed ${seed} day ${t.day} — raise-answer talk with ${nm} (${t.vid}), village ${t.village}, outcome ${t.outcome} ===\n${lines || '(no lines recorded — the conversation opened no transcript)'}\n`);
    });
  } catch (e) { console.log(`  raise-talk emit error seed ${seed}: ${e && e.message}`); }
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r279-${ARML}-capture-${seed}.txt`), capture.join('\n'));
  const beatLines = capture.filter(s => /lead|subordinate|tribute|national|defense|feast|primary|demand|swear|allegiance|granary|court/i.test(s)).slice(0, 120);
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r279-${ARML}-beats-${seed}.txt`), beatLines.join('\n'));
  const momentLines = capture.filter(s => /governance layer: online|the shared granary opens|species agency: unlocked|one fire was a village|coordination layer: online/i.test(s));
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r279-${ARML}-moments-${seed}.txt`), momentLines.join('\n'));
  // R24 table-approach arm: every line that voices the approach (or its absence)
  const tableLines = capture.filter(s => /table is being set|ARC IV|the ledger still wants|lesser seat|full seat|the table has your name|does not come|NO HUNGER ON THE RECORD|THE DEEDS ARE NOT|priced for what you built|the ring of pale light/i.test(s));
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r279-${ARML}-want-${seed}.txt`), tableLines.join('\n'));
  // R29 governance dump: every classified mechanism line, day-attributed
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r279-${ARML}-gov-${seed}.txt`), govWatch.map(g => `d${g.day} [${g.cls}] ${g.line}`).join('\n'));
  // R103 nat-gate dump: one row per policy day (the staging gates, read-only).
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r279-${ARML}-natgate-${seed}.txt`), natGateWatch.map(n => `d${n.day} rank=${n.rank} nat=${n.nationalLive} glob=${n.globalLive} netLive=${n.networkLive} netDay=${n.networkLiveDay} rung=${n.rungReady} exiled=${n.exiled} refused=${n.scaleRefused} pend=${n.pendingShape || '-'}@${n.pendingDay == null ? '-' : n.pendingDay} lead=${n.leadSeasoned}/${n.leadActive} cov=${n.covSeasoned}/${n.covActive} trade=${n.tradeSeasoned}/${n.tradeActive} belong=${n.belong ? (n.belong.other + ':t' + n.belong.trust + '/a' + n.belong.arrears + '/age' + n.belong.age + '/realm' + n.belong.realm + '/good' + (n.belong.good ? 1 : 0)) : '-'} foreignMax=${n.foreignMax} polities=${JSON.stringify({ lead: n.leadPolity, belong: n.belongPolity, cov: n.covPolity, trade: n.tradePolity })} defer=${JSON.stringify(n.defer)} view=${n.viewership}`).join('\n'));
  // R107 Q1 regional-gate dump: one row per policy day + the per-seed corpus JSON
  // (same shape as the regionalstep corpus — daily rows with .gate — so
  // regionalstep-analyze-20261107.js reads it directly).
  try {
    const _regDaily = ((regInst.t && regInst.t.daily) || []).slice();
    fs.writeFileSync(path.join(EVIDIR, `journey-scale-r279-${ARML}-reggate-${seed}.txt`), _regDaily.map(d => `d${d.day} gate=${d.gate || '?'} rank=${d.scale || d.scaleRankSnap || '?'} netLive=${d.networkLive ? 1 : 0} known=${d.knownCount} bestDet=${d.bestDet} bestVill=${d.bestVillageId || '-'} propose=${d.proposeCalls} raisesAcc=${d.acceptLinkRaiseCalls} counters=${d.proposeCounter} links=${d.activeLinks}/${d.everLinks} oldestAge=${d.oldestActiveAge} firstLink=${d.firstLinkDay} accord=${d.firstAccordDay}`).join('\n'));
    fs.writeFileSync(path.join(EVIDIR, `journey-scale-r279-${ARML}-regional-${seed}.json`), JSON.stringify({ seed, arm: 'journey-scale-r279-' + ARM, policy: 'scalecourt', daily: _regDaily, regionalAttempts: (regFin && regFin.regionalAttempts) || [], talkCalls: (regFin && regFin.talkCalls) || [], firstLinkDay: (regFin && regFin.firstLinkDay) || null, firstAccordDay: (regFin && regFin.firstAccordDay) || null, instrumentErrors: ((regInst.t && regInst.t.instrumentErrors) || []).slice() }, null, 1));
    const _gateTally = {};
    _regDaily.forEach(d => { _gateTally[d.gate || '?'] = (_gateTally[d.gate || '?'] | 0) + 1; });
    console.log(`  regGate seed ${seed}: rows=${_regDaily.length} gates=${JSON.stringify(_gateTally)} propose=${(_regDaily.length ? _regDaily[_regDaily.length - 1].proposeCalls : 0)} links=${(_regDaily.length ? _regDaily[_regDaily.length - 1].activeLinks : 0)}/${(_regDaily.length ? _regDaily[_regDaily.length - 1].everLinks : 0)} errors=${(((regInst.t && regInst.t.instrumentErrors) || []).length)}`);
  } catch (e) { console.log(`  regGate seed ${seed}: EMIT-ERROR ${e && e.message}`); }
  // R99 water-refusal dump: every cistern-dry / pack-full fill refusal, day-attributed
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r279-${ARML}-water-${seed}.txt`), waterWatch.map(w => `d${w.day} [${w.cls}] ${w.line}`).join('\n'));
  // R34 trust dump: daily snapshots + engine-book events, human-readable
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r279-${ARML}-trust-${seed}.txt`), trustWatch.map(t => `d${t.day} ${t.kind} ${t.other} trust=${t.trust} formed=d${t.formedDay} poolLive=${t.poolLive} lastKept=${t.lastKeptDay} mournUntil=${t.mourningUntil} arrears=${t.arrears} pendDef=${t.pendingDefense} pendCrisis=${t.pendingCrisis}`).join('\n'));
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r279-${ARML}-trustevents-${seed}.txt`), trustEvents.map(e => `d${e.day} ${e.kind} ${e.other} [${e.noteKind}] ${e.note}`).join('\n'));
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r279-${ARML}-trustset-${seed}.txt`), trustSetLog.map(e => `d${e.day} ${e.kind} ${e.other} ${e.before}->${e.after} (delta ${e.delta}) :: ${e.stack}`).join('\n'));
  // R39 hunger-window dump: one row per policy day (opening state).
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r279-${ARML}-morntrace3-${seed}.txt`), mornTrace.map(r => `d${r.day} ${r.stage} at=(${r.px},${r.py}) hyd=${r.hyd} pilgrim=${r.pilgrim || '-'} ret=${r.returning ? 1 : 0} packW=${r.packWater} tile=${r.tileType} tent=${r.insideTent ? 1 : 0} wx=${r.weather} ticks=${r.dayTicks} drank=${r.drank} packKg=${r.packKg} cap=${r.carryCap} cist=${r.cistClean}/${r.cistDirty} top=${r.packTop}` + (r.dThirst != null ? ` dThirst=${r.dThirst} dForage=${r.dForage} dStanding=${r.dStanding} dDetours=${r.dDetours} dDrank=${r.dDrank}` : '')).join('\n'));
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r279-${ARML}-postrace-${seed}.txt`), posTrace.map(r => `d${r.day} ${r.stage} ${r.vid} at=(${r.px},${r.py}) target=(${r.tx},${r.ty}) dist=${r.dist}` + (r.stage === 'walk' ? ` after=(${r.px2},${r.py2}) dist2=${r.dist2}` : '') + (r.reason ? ` reason=${r.reason}` : '')).join('\n'));
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r279-${ARML}-hungerwatch-${seed}.txt`), hungerWatch.map(h => `d${h.day} pantry=${h.pantry} hungryDays=${h.hungryDays} pilgrim=${h.pilgrim ? h.pilgrimVid : '-'} returning=${h.returning} pilg=${h.pilgrimages} studies=${h.climbStudies} propPeer=${h.proposedPeer} courtPoor=${h.courtPoorDays} pool=${h.pool}`).join('\n'));
  // R39 table-approach dump: one row per policy day (opening seat price).
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r279-${ARML}-wantwatch-${seed}.txt`), tableWatch.map(t => `d${t.day} seat=${t.seat} arc=${t.arc} wait=${t.tableWaiting} ann=${t.tableAnnounced} done=${t.tableDone} rank=${t.scaleRank} glob=${t.globalLive} ot=${t.overtimeTier} detail=${JSON.stringify(t.detail)}`).join('\n'));
  // R39 betrayal dump: accept + daily person snapshots for accepted subjects.
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r279-${ARML}-betray-${seed}.txt`), betrayWatch.map(b => `d${b.day} ${b.event} ${b.name} (${b.vid})` + (b.event === 'accept' ? ` armed=${b.armed === null ? 'unknown' : (b.armed ? 'armed' : 'ordinary')}` : '') + ` dead=${b.dead} trust=${b.trust} inRoster=${b.inRoster}`).join('\n'));
  // R52 barrier dump: every sayOncePerFight call, day-attributed.
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r279-${ARML}-barrier-${seed}.txt`), barrierLog.map(b => `d${b.day} inCombat=${b.inCombat} tbfight=${b.tbfight} over=${b.tbfightOver} msg=${b.msg} :: ${b.stack}`).join('\n'));
  // R52 armor dump: every capture line mentioning armor/craft/bark, for the
  // armor-move pin (Q1). Read-only extraction from the say capture.
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r279-${ARML}-armor-${seed}.txt`), capture.filter(s => /armor|bark|craft/i.test(s)).join('\n'));
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r279-${ARML}-duty-${seed}.txt`), dutyWatch.map(d => `d${d.day} roster=${d.roster} atHaven=${d.atHaven} deadfall=[${d.deadfallAssigned.join(',')}] wcd=${JSON.stringify(d.weaponCraftCd)} wc=${JSON.stringify(d.weaponCraft)}`).join('\n'));
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r279-${ARML}-wsplit-${seed}.json`), JSON.stringify(wsplitWatch, null, 1));
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r279-${ARML}-fusion-${seed}.txt`), fusionWatch.map(f => `d${f.day} scholar=${f.scholarVid} installed=${f.installed} onlineFlag=${f.onlineFlag} sinceDay=${f.sinceDay} online=${f.online} hasAbility=${f.hasAbility} holder=${JSON.stringify(f.holder)} abilities=[${(f.abilities || []).join(',')}]`).join('\n'));
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r279-${ARML}-fusionfeast-${seed}.txt`), fusionFeast.map(f => `d${f.day} [${f.cls}] ${f.line}`).join('\n'));
  // R113 Q1 ladder dumps: one daily row per policy day + the wrapper
  // event logs (capstone deliveries, fights with wave attribution).
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r279-${ARML}-ladder-${seed}.txt`), (liFin.daily || []).map(d => {
    const tr = d.tracks ? `fight=${d.tracks.fight} forage=${d.tracks.forage} craft=${d.tracks.craft} talk=${d.tracks.talk} explore=${d.tracks.explore}` : 'tracks=-';
    const ct = d.countedTracks ? `cfight=${d.countedTracks.fight} cforage=${d.countedTracks.forage} ccraft=${d.countedTracks.craft} ctalk=${d.countedTracks.talk} cexplore=${d.countedTracks.explore}` : 'ctracks=-';
    const caps = CAPSRENDER.renderCaps(d); // r197: 'delivered' only for the delivered kind; other kinds read 'seat-open'
    // Mechanism counts (r122 fix — the pilot showed the reasons alone
    // cannot say HOW short the tribute/charter are): living wave-4+
    // veterans on hand, sealed chartered trade links, bundle done.
    const mech = d.capstones ? `vets=${(d.capstones.military_tribute && d.capstones.military_tribute.veterans != null) ? d.capstones.military_tribute.veterans : '-'} charterLinks=${(d.capstones.trade_charter && d.capstones.trade_charter.charteredLinks != null) ? d.capstones.trade_charter.charteredLinks : '-'} bundle=${(d.capstones.feast_embassy && d.capstones.feast_embassy.bundle != null) ? (d.capstones.feast_embassy.bundle ? 1 : 0) : '-'}` : 'mech=-';
    const det = d.detail ? `led=${d.detail.fightLedger} fXp=${d.detail.fieldXp} cXp=${d.detail.craftXp} links=${d.detail.links} cont=${d.detail.contests} disc=${d.detail.discovery} brd=${d.detail.breadth} aLinks=${d.detail.activeLinks} bb=${d.detail.bundleBonus} bStages=[${(d.detail.bundleStages || []).join(',')}] banked=${d.detail.bankedHeadStart == null ? 0 : d.detail.bankedHeadStart}` : 'detail=-';
    // R113 attribution columns: today's scholar vid, sentiment taught
    // yet, and the running wave-4+ kill attribution (same-day scholar
    // rule; the analyzer's day-joined join is authoritative).
    const attr = `scholar=${d.scholarVid || '-'} sent=${d.sentimentTaught == null ? '-' : (d.sentimentTaught ? 1 : 0)}` + (d.killAttr ? ` kAttr=w4:${d.killAttr.w4total}/sch:${d.killAttr.w4scholar}/vil:${d.killAttr.w4villager}/null:${d.killAttr.w4null}/dist:${d.killAttr.w4distinctVillagers}/liv:${d.killAttr.w4livingVillagers}` : ' kAttr=-');
    return `d${d.day} stage=${d.stage} peak=${d.peakStage} counted=${d.counted} cap=${d.cap} next=${d.nextThreshold == null ? '-' : d.nextThreshold} ${d.nextStageName || '-'} short=${d.shortfall} ${tr} ${ct} capped=[${(d.capped || []).join(',')}] ${det} caps: ${caps} ${mech} delivered=${d.delivered || '-'} seat=${d.seat} ${attr}`;
  }).join('\n'));
  // R113 Q1 veteran-attribution corpus: the waveKillLog rows (wave >= 3),
  // the per-channel counters, and the daily scholar-vid map — the
  // analyzer attributes every kill and every killer's fate from this.
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r279-${ARML}-vetkill-${seed}.json`), JSON.stringify({ seed, arm: 'journey-scale-r279-' + ARM, waveKillLog: (liFin.waveKillLog || []), waveKillByChannel: (liFin.waveKillByChannel || {}), scholarVidsByDay: (liFin.scholarVidsByDay || {}), deaths: (liFin.deaths || []), finalRoster: (liFin.finalRoster || []), instrumentErrors: (liFin.errors || []).slice() }, null, 1));
  // R125 Q2 death-census corpus: the daily context rows, the fallen
  // deaths with causes, the telemetry death rows, joins/leavers, and
  // the reconciliation summary — the analyzer scores the attribution
  // from this.
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r279-${ARML}-deathcensus-${seed}.json`), JSON.stringify({ seed, arm: 'journey-scale-r279-' + ARM, daily: (dcFin.daily || []), deaths: (dcFin.deaths || []), teleDeaths: (dcFin.teleDeaths || []), joins: (dcFin.joins || []), leavers: (dcFin.leavers || []), teleOutOfScope: (dcFin.teleOutOfScope || []), summary: (dcFin.summary || {}), instrumentErrors: (dcFin.errors || []).slice() }, null, 1));
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r279-${ARML}-deathcensus-${seed}.txt`), (dcFin.deaths || []).map(d => `d${d.day} ${d.name || d.vid} (${d.vid}) cause=${d.cause || '?'}${d.monsterName ? ' monster=' + d.monsterName : ''}`).join('\n'));
  // r130 Q1/Q3 scholar-counts corpus: per-day new vs legacy veteran counts
  // + payable + kill-time samples, with the instrument's own summary.
  try {
    const scSummary = SCINST.summarize(scRows);
    fs.writeFileSync(path.join(EVIDIR, `journey-scale-r279-${ARML}-scholarcount-${seed}.json`), JSON.stringify({ seed, arm: 'journey-scale-r279-' + ARM, summary: scSummary, killTimeSamples: scKillSamples, killTimeErrors: scKillErrors, daily: scRows }, null, 1));
    fs.writeFileSync(path.join(EVIDIR, `journey-scale-r279-${ARML}-scholarcount-${seed}.txt`), scRows.map(r => `d${r.day} new=${r.livingVeterans == null ? '-' : r.livingVeterans} legacy=${r.livingVeteransLegacy == null ? '-' : r.livingVeteransLegacy} payable=${r.payable == null ? '-' : r.payable} trib=${(r.deeds && r.deeds.military_tribute) ? (r.deeds.military_tribute.ready ? 'ready' : r.deeds.military_tribute.reason) : '?'} delivered=${r.delivered || '-'}`).join('\n'));
  } catch (e) { console.error('scholarcount write failed:', e && e.message); }
  // r133 Q2 vetbar corpus: the daily readiness-vs-ladder rows + the
  // shadow old-rule counts. The analyzer scores Q2 from this file alone.
  try {
    fs.writeFileSync(path.join(EVIDIR, `journey-scale-r279-${ARML}-vetbar-${seed}.json`), JSON.stringify({ seed, arm: 'journey-scale-r279-' + ARM, daily: vetbarWatch }, null, 1));
    fs.writeFileSync(path.join(EVIDIR, `journey-scale-r279-${ARML}-vetbar-${seed}.txt`), vetbarWatch.map(r => `d${r.day} roster=${r.roster} r4=${r.r4} l3=${r.l3} shadow4=${r.shadow4} r5=${r.r5} l4=${r.l4} shadow5=${r.shadow5} blooded=${r.blooded}`).join('\n'));
  } catch (e) { console.error('vetbar write failed:', e && e.message); }
  // r223 W5-INSTANCE corpus: the per-fight entity rows (scholar + field),
  // the daily live world-monster census, and the d90 spotter snapshot —
  // the analyzer scores the wave-5 one-vs-successive question from this.
  try {
    fs.writeFileSync(path.join(EVIDIR, `journey-scale-r279-${ARML}-w5inst-${seed}.json`), JSON.stringify({ seed, arm: 'journey-scale-r279-' + ARM, fights: fightInst, monsterDays: monsterWatch, spotterWatch90: spotterWatch90.slice() }, null, 1));
    fs.writeFileSync(path.join(EVIDIR, `journey-scale-r279-${ARML}-w5inst-${seed}.txt`), fightInst.map(f => `d${f.day} ${f.via} ${f.monsterId || '?'} w${f.wave == null ? '?' : f.wave} ent=${f.ent ? ((f.ent.key || (f.ent.id + '@' + f.ent.tx + ',' + f.ent.ty + ':' + f.ent.mx + ',' + f.ent.my)) + ' hp' + f.ent.hp + '/' + f.ent.maxHp + (f.ent.veteran ? ' vet' : '')) : '-'}${f.outcome ? ' ' + f.outcome + ' r' + f.rounds : ''}`).join('\n'));
  } catch (e) { console.error('w5inst write failed:', e && e.message); }
  // R113 Q1+Q2 trade-road corpus: the daily trade snapshots, the beat
  // answers, the wild-fight log, and the scholar-vid map — the analyzer
  // scores the trade road and the wild wave-4 question from this.
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r279-${ARML}-traderoad-${seed}.json`), JSON.stringify({ seed, arm: 'journey-scale-r279-' + ARM, policy: 'scalecourt-traderoad-r122', daily: (trFin.daily || []), beatAnswers: (trFin.beatAnswers || []), wildFights: (trFin.wildFights || []), scholarVidsByDay: (trFin.scholarVidsByDay || {}), instrumentErrors: (trFin.errors || []).slice() }, null, 1));
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r279-${ARML}-traderoad-${seed}.txt`), (trFin.daily || []).map(d => `d${d.day} subs=${d.subs} trade=${d.trSeasoned}/${d.trN} cov=${d.covN} viable=${d.viable} sealed=${d.sealed} chartered=${d.charteredLinks} cand=${d.candidates} pool=${d.pool == null ? '-' : d.pool} pendCtr=${d.pendingCounter ? 1 : 0} pend=${d.pendingShape || '-'}`).join('\n'));
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r279-${ARML}-wildfights-${seed}.txt`), (trFin.wildFights || []).map(f => `d${f.day} ${f.cls} ${f.vid || '-'} ${f.mid || '?'} w${f.wave == null ? '?' : f.wave} ${f.outcome || '?'} rounds=${f.rounds == null ? '-' : f.rounds}`).join('\n'));
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r279-${ARML}-beatanswers-${seed}.txt`), (trFin.beatAnswers || []).map(b => `d${b.day} ${b.shape || '?'} -> ${b.how} (${b.out || '-'})`).join('\n'));
  fs.writeFileSync(path.join(EVIDIR, `journey-scale-r279-${ARML}-ladderevents-${seed}.txt`), [
    ...((liFin.deliveries || []).map(x => `d${x.day} DELIVER ${x.kind || '?'} ok=${x.ok ? 1 : 0} reason=${x.reason ? String(x.reason).replace(/\s+/g, '_') : 'none'}`)),
    ...((liFin.fights || []).map(x => `d${x.day} FIGHT ${x.monsterId || '?'} wave=${x.wave == null ? '?' : x.wave}`)),
    ...((liFin.errors || []).map(x => `d${x.day} INSTRUMENT-ERROR ${x.where}: ${x.err}`)),
  ].join('\n'));
  const govCount = (cls) => govWatch.filter(g => g.cls === cls).length;
  console.log(`seed ${seed}: day=${c.day} over=${c.over} won=${c.won} pop=${c.popAlive}/${c.popTotal} pantry=${c.pantryKcal} lead=${c.leadActive}/${c.leadSeasoned} rank=${c.scaleRank} natVoiced=${c.nationalVoiced} globVoiced=${c.globalVoiced} proposed=${ctx.proposed|0} lrAns=${LR ? (LR.linkraiseStats().raisesAnswered + '/' + LR.linkraiseStats().raisesSeen) : '-'} lrErr=${LR ? LR.linkraiseStats().errors : '-'} lrTalks=${(c.raiseTalks||[]).length} tended=${ctx.tended|0} defense=${ctx.defenseCalls|0} seat=${c.tableSeat} arc=${c.arcNow} tW=${c.tableWaiting} tDone=${c.tableState ? (c.tableState.phase || '-') : '-'} sit=${c.sitStats.taken}/${c.sitStats.previewSeen} sdFail=${c.sitStats.failed} sdGuard=${c.sitStats.guardRefused} door=${(c.modalStats.doors||[]).map(d=>d.door).join(',')||'-'} mpAns=${c.modalStats.answers} govAnn=${govCount('govAnnounce')} tribArr=${govCount('tribArrive')} tribShort=${govCount('tribShort')} courtLines=${govCount('courtLine')} granDraw=${govCount('granaryDraw')} feast=${govCount('feastCourt')} fusion=${c.fusionInstalled} abilities=${(c.abilitiesHeld||[]).join(',')}`);
  // R113 Q1: one-line ladder rollup per seed (the analyzer prints the stage table).
  try { const _l = c.ladderChain || {}; console.log(`  ladder: rows=${_l.rows} err=${_l.errors} peak=${_l.peakStage} s1=${_l.stage1Day == null ? '-' : 'd' + _l.stage1Day} s2=${_l.stage2Day == null ? '-' : 'd' + _l.stage2Day} s3=${_l.stage3Day == null ? '-' : 'd' + _l.stage3Day} countedEnd=${_l.countedEnd} shortEnd=${_l.shortfallEnd} capped=[${(_l.cappedEnd || []).join(',')}] tracks=${JSON.stringify(_l.tracksEnd)} bundleStages=[${(_l.bundleStages || []).join(',')}] bb=${_l.bundleBonusEnd} banked=${_l.bankedHeadStartEnd} sent=${_l.sentimentTaughtDay == null ? '-' : 'd' + _l.sentimentTaughtDay} kAttr=${JSON.stringify(_l.killAttrEnd)} vetkillRows=${_l.vetkillRows} ready=${JSON.stringify(_l.capstoneReady)} delivered=${_l.capstoneDelivered ? (_l.capstoneDelivered.kind + '@d' + _l.capstoneDelivered.day) : '-'} deliv=${_l.deliveriesOk}/${_l.deliveries} attempts=${_l.deliveryAttempts} lesser=${_l.seatLesserDay == null ? '-' : 'd' + _l.seatLesserDay} full=${_l.seatFullDay == null ? '-' : 'd' + _l.seatFullDay} fights=${_l.fights} byWave=${JSON.stringify(_l.fightsByWave)}`); } catch (e) {}
  // R113 Q1+Q2: one-line trade-road + wild-w4 rollup per seed.
  // R125 Q2: one-line death-census rollup per seed.
  try { const _d = c.deathCensus || {}; console.log(`  deathCensus: rows=${_d.rows} err=${_d.errors} deaths=${_d.deaths} byCause=${JSON.stringify(_d.byCause)} multi=${JSON.stringify(_d.multiDeathDays)} teleP=${_d.telePerson} telePHaven=${_d.telePersonHaven} teleM=${_d.teleMonster} teleOnly=${_d.teleOnly} fallenOnly=${_d.fallenOnly} rostered=${_d.rosteredDeaths} guest=${_d.guestDeaths} joins=${_d.joins} leavers=${_d.leavers} booksClose=${_d.booksClose} unattributed=${_d.unattributed} dutyDays=${_d.dutyDays} healerDays=${_d.healerDays}`); } catch (e) {}
  // r130 Q1/Q3: one-line scholar-counts rollup per seed.
  try { const _s = SCINST.summarize(scRows); console.log(`  scholarcount: rows=${scRows.length} killSamples=${scKillSamples.length} killErr=${scKillErrors.length} peakNew=${_s.peakLivingVeterans} peakLegacy=${_s.peakLivingVeteransLegacy} scholVetDays=${_s.scholarVeteranDays} newReadyDays=${_s.newReadyDays} legacyReadyDays=${_s.legacyReadyDays} everReadyNew=${JSON.stringify(_s.everReady)} everReadyLegacy=${JSON.stringify(_s.everReadyLegacy)} firstReadyNew=${JSON.stringify(_s.firstReadyDay)} firstReadyLegacy=${JSON.stringify(_s.firstReadyDayLegacy)}`); } catch (e) {}
  // r133 Q2: one-line vetbar rollup per seed.
  try { const _dis4 = vetbarWatch.filter(r => r.r4 !== r.l3).length, _dis5 = vetbarWatch.filter(r => r.r5 !== r.l4).length, _ph4 = vetbarWatch.filter(r => (r.shadow4 | 0) > (r.r4 | 0)).length, _ph5 = vetbarWatch.filter(r => (r.shadow5 | 0) > (r.r5 | 0)).length; const _phDays4 = vetbarWatch.filter(r => (r.shadow4 | 0) > (r.r4 | 0)).map(r => r.day); const _phDays5 = vetbarWatch.filter(r => (r.shadow5 | 0) > (r.r5 | 0)).map(r => r.day); console.log(`  vetbar: rows=${vetbarWatch.length} disagree4=${_dis4} disagree5=${_dis5} phantomDays4=${_ph4} [${_phDays4.join(',')}] phantomDays5=${_ph5} [${_phDays5.join(',')}]`); } catch (e) {}
  // r223 W5-INSTANCE: one-line rollup per seed (the analyzer prints the grouping).
  try { const _w5 = fightInst.filter(f => (f.wave | 0) === 5); const _w5k = new Set(_w5.map(f => (f.ent && f.ent.key) || (f.ent ? (f.ent.id + '@' + f.ent.tx + ',' + f.ent.ty) : 'none'))); console.log(`  w5inst: fights=${fightInst.length} w5=${_w5.length} w5keys=${_w5k.size} monsterDays=${monsterWatch.length} spotter90=${spotterWatch90.length}`); } catch (e) {}
  // r227 Q1: one-line muster rollup per seed (the analyzer prints the ledger).
  try { const _mu = musterWatch; const _called = _mu.filter(r => r.called).length; const _ready = _mu.filter(r => r.ready).length; const _held = {}; for (const r of _mu) if (!r.called && r.held) _held[r.held] = (_held[r.held] | 0) + 1; const _oc = ((titanEnd && titanEnd.outcomes) || []); const _slain = _oc.filter(o => o.outcome === 'slain').length; const _fought = _oc.filter(o => o.outcome === 'fought' || o.outcome === 'slain' || o.outcome === 'fled').length; const _refused = _oc.filter(o => o.outcome === 'refused').length; console.log(`  muster: arm=${ARM} rows=${_mu.length} called=${_called} readyDays=${_ready} held=${JSON.stringify(_held)} outcomes=${JSON.stringify({ slain: _slain, fought: _fought, refused: _refused })} verbCalls=${TITANVERBS.calls.length} verbErr=${TITANVERBS.errors.length}`); } catch (e) {}
  try { const _ma = marchWatch; const _arr = _ma.filter(r => r.arrived).length; const _ont = _ma.filter(r => r.onTile).length; const _pen = _ma.filter(r => r.pending).length; const _mheld = {}; for (const r of _ma) if (r.held) _mheld[r.held] = (_mheld[r.held] | 0) + 1; console.log(`  march: arm=${ARM} rows=${_ma.length} arrived=${_arr} onTile=${_ont} pending=${_pen} held=${JSON.stringify(_mheld)}`); } catch (e) {}
  try { const _t = c.tradeRoad || {}; const _w = c.wildW4 || {}; console.log(`  trade: rows=${_t.rows} err=${_t.errors} firstTrade=${_t.firstTradeProposalDay == null ? '-' : 'd' + _t.firstTradeProposalDay} maxTrade=${_t.maxTradeLinks} maxSeasoned=${_t.maxTradeSeasoned} seasoned3=${_t.firstSeasonedTradeDay == null ? '-' : 'd' + _t.firstSeasonedTradeDay} maxSubs=${_t.maxSubs} subCapSkips=${_t.subCapSkips} covWalks=${_t.covenantWalks} charterStaged=${_t.charterStagedDay == null ? '-' : 'd' + _t.charterStagedDay} sealed=${_t.sealedDay == null ? '-' : 'd' + _t.sealedDay} beats=[${_t.beatAnswers || '-'}]`); console.log(`  wildW4: fights=${_w.rows} err=${_w.errors} villW4=${_w.villagerW4Calls} byOutcome=${JSON.stringify(_w.villagerW4ByOutcome)} villW4Deaths=${_w.villagerW4Deaths} scholW4=${_w.scholarW4Calls} villW1-3=${JSON.stringify(_w.villagerW1_3)}`); } catch (e) {}
  try { const _ng = natGateWatch[natGateWatch.length - 1] || {}; console.log(`  natGate final: d${_ng.day} rank=${_ng.rank} rung=${_ng.rungReady} lead=${_ng.leadSeasoned}/${_ng.leadActive} cov=${_ng.covSeasoned}/${_ng.covActive} trade=${_ng.tradeSeasoned}/${_ng.tradeActive} belong=${_ng.belong ? (_ng.belong.other + ':t' + _ng.belong.trust + '/realm' + _ng.belong.realm + '/good' + (_ng.belong.good ? 1 : 0)) : '-'} pend=${_ng.pendingShape || '-'} foreignMax=${_ng.foreignMax} rows=${natGateWatch.length}`); } catch (e) {}
  return c;
}

(async () => {
  const results = [];
  for (const seed of SEEDS) {
    try {
      results.push(await playSeed(seed));
    } catch (e) {
      console.log(`SEED ${seed} CRASH: ${e && e.stack || e}`);
      results.push({ seed, crash: String(e && e.message || e) });
    }
  }
  console.log(`\n===== R227 ARM ${ARM} SUMMARY =====`);
  for (const r of results) {
    if (r.crash) { console.log(`seed ${r.seed}: CRASH ${r.crash}`); continue; }
    console.log(`seed ${r.seed}: day=${r.day} over=${r.over} won=${r.won} pop=${r.popAlive}/${r.popTotal} lead=${r.leadActive}/${r.leadSeasoned} rank=${r.scaleRank} natV=${r.nationalVoiced} globV=${r.globalVoiced} proposed=${r.proposedLead} lr=${r.linkraise ? (r.linkraise.raisesAnswered + '/' + r.linkraise.raisesSeen + ' err' + r.linkraise.errors) : '-'} lrTalks=${(r.raiseTalks||[]).length} tended=${r.tended} defense=${r.defenseCalls} seat=${r.tableSeat} arc=${r.arcNow} tW=${r.tableWaiting} sit=${r.sitStats ? (r.sitStats.taken + '/' + r.sitStats.previewSeen) : '-'} door=${r.modalStats ? ((r.modalStats.doors||[]).map(d=>d.door).join(',')||'-') : '-'} gAns=${(r.globalNotes||[]).length}`);
  }
})().catch(e => { console.error('DRIVER ERROR:', e && e.stack || e); process.exit(2); });
