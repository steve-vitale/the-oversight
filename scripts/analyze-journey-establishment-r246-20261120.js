#!/usr/bin/env node
// Journey-establishment r246 panel scorer (read-only): scores the
// pre-registered bars from the per-seed JSONs. No game state is touched.
// R242 revisions vs r241: (1) Q1c WIDENED — the LOST-ask trigger now
// covers ANY favorless ask whose kinded ask never surfaces later
// (r241 metric review: "the class names the mechanism, the surfacing
// names the harm"); the old E1-only Q1c line is replaced by a LOST-ASK
// line listing every never-surfaced favorless sit with its class.
// (2) Q5 MOOT-PATH — per-exile block: path from the pronouncement
// text (moot "X is exiled." vs freeloader "It's done."), warning lines
// before the exile day, moot/case lines naming the person (mootLines),
// cases naming them as accused (caseLog), and the case-thread-held
// proxy (a held sitting inside a case's open window with betrayal:*
// picks). (3) Q1b F5 FLOOR — per-seed raise-rate min/max + the
// tie-breaker verdict (r241 re-opened the floor: thin 6.6% vs fat
// 22.4%). Comparisons updated to r241's numbers throughout.
// R246 revisions vs r245: (1) E1 SPLIT (r245 metric review) — E1
// (opener never ran) splits into E1-case (≥1 betrayal:* case-thread
// pick in the sitting) vs E1-plain (no case picks); both r245 LOST
// asks were E1-case. (2) BOWCRAFT GEAR-COUNT (r245 metric review) —
// the /bow/i telemetry scan is blind (crafting emits generic keys),
// so bows are counted in the end-census `equipped` lists per seed;
// the telemetry scan stays as a secondary line. (3) WARN-HEED WATCH
// — warn_you sittings vs warnLog deliveries (r150 fix, first live
// panel); an engaged sitting with no warning delivered is a defect
// finding. (4) SETTLED-FAVOR + DRY2 WATCHES — settledFavorLines
// (named vs bare) and dryLines extracts (r247 / r256 fixes, first
// live read). (5) SELFWIT WATCH — ambush deaths whose witness list
// contains the victim (r258 fix). (6) DAY-DESYNC line — the driver's
// dayDesync summary (r245 seed 101955: d40 missing, d42 doubled).
// Comparisons updated to r245's numbers throughout.
// Usage: node scripts/analyze-journey-establishment-r246-20261120.js <seed...>
//   EVID defaults to the goal hidden_files evidence dir for 2026-11-20.
'use strict';
const fs = require('fs');
const path = require('path');
const EVID = process.env.EVID || '/home/hatch/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-11-20';
const seeds = process.argv.slice(2).map(s => parseInt(s, 10));
if (!seeds.length) { console.error('usage: analyze-journey-establishment-r246-20261120.js <seed...>'); process.exit(2); }

function load(seed) {
  const p = path.join(EVID, `journey-establishment-r246-seed${seed}.json`);
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}
// A broken-live forage run, reconstructed per seed from the wedge logs:
// every travelOutLog entry whose pre-state was broken (or whose end
// record exists) is one run-opportunity, keyed by vid + break-cluster.
// R138 FIX (pilot): the r85 grouping keyed by vid only, so a villager
// with TWO broken runs in one seed (pilot Raul: d6 and d23) collapsed
// into one opportunity whose endDay was the LAST close — misread as a
// 2-dawn-window FAIL. An opportunity closes when its run ends; the
// next broken entry for the same vid opens a new one.
function opportunities(d) {
  const ops = [];
  const cur = new Map(); // vid -> currently open opportunity
  for (const t of (d.travelOutLog || [])) {
    if (t.kind !== 'forage_help') continue;
    const key = String(t.vid);
    const broken = (t.preRun && t.preRun.promiseKept === 'broken') || (t.end && t.end.preRun && t.end.preRun.promiseKept === 'broken') || t.outcome === 'ended' || t.outcome === 'end-via-deliver' || (t.outcome || '').startsWith('end-');
    if (!broken) continue;
    let op = cur.get(key);
    if (!op) { op = { vid: key, name: t.name, firstDay: t.day, outcomes: [], endDay: null }; ops.push(op); cur.set(key, op); }
    op.outcomes.push({ day: t.day, outcome: t.outcome });
    if (t.outcome === 'ended' || t.outcome === 'end-via-deliver') { op.endDay = t.day; cur.delete(key); }
  }
  return ops;
}
let allOps = 0, closedOps = 0, noOppSeeds = 0, trustDrops = 0, jamTotal = 0, villagePass = 0;
// R138 STRANDED BRANCH: previous-bearer live runs (the r137 next
// blank). strandedDawns counts strandedLog entries; strandedRuns
// counts distinct vid:kind runs; strandedWorked counts travel-out
// work on a stranded run (the r137 failure signature — must be 0);
// guardFires counts wedgeTravelOut guard trips (mid-dawn succession
// — 0-work by construction, reported separately); strandedSocial
// counts stranded dawns on which the wedge still sat socially
// (mode 'accept' or 'start'); strandedNoSocial lists stranded dawns
// with no social sit (a miss against the bar); strandedCommits
// counts new favor commits after a run first stranded.
let strandedDawns = 0, strandedRunsTotal = 0, strandedWorked = 0, guardFires = 0;
let strandedSocial = 0, strandedNoSocial = 0, strandedCommits = 0, strandedWorkFavor = 0, strandedDaysTotal = 0;
const strandedRunKeys = new Set();
// R242 Q5 MOOT-PATH panel counters.
let q5Exiles = 0, q5Heard = 0, q5Present = 0, q5Unheard = 0, q5UnheardAbsent = 0, q5SameDay = 0;
// R245 COUNTER WATCH (r244 metric review: comma-only): counterTotal
// counts COUNTER LEARNED say lines captured by the driver; counterProse
// lists labels containing ", " (a finding — the comma class the r244
// fix eliminates); counterEmdash lists labels containing an em/en dash
// (report-only watch — the r244 open item, same fix shape, not yet
// fired on any panel); counterOk lists guarded / proper-name labels.
// R245 REACT WATCH: reactMaxTotal is the panel max consecutive
// dlg:react picks in one sitting; reactWatch lists sittings at >= 3.
// R245 BOWCRAFT WATCH: bowSeedLines list /bow/i telemetry keys per
// seed; bowCraftTotal counts them panel-wide.
// R246 BOWCRAFT GEAR-COUNT (r245 metric review): the telemetry scan is
// blind, so bows are counted in the end-census `equipped` lists —
// bowGearTotal counts bow itemIds panel-wide, bowGearSeedLines list
// them per seed. The telemetry scan stays as the secondary line.
// R246 WARN-HEED WATCH: warnTotal counts warn_you sittings,
// warnNamed counts those with a warning delivered for the same vid
// on the same day, warnUnnamed lists engaged sittings (dlg:heed or
// dlg:details pressed) with no delivery — the r150 defect shape.
// R246 SETTLED-FAVOR WATCH: settledNamed / settledBare count the
// "It's already handled" lines by kind. R246 DRY2 WATCH: dryTotal
// counts "lost my train of thought" lines (expect 0). R246 SELFWIT
// WATCH: selfWitTotal counts ambush deaths whose witness list holds
// the victim id (defect finding). R246 DAY-DESYNC: desyncTotal
// counts day skips/repeats in the drivers' daily arrays.
let counterTotal = 0; const counterProse = [], counterEmdash = [], counterOk = [];
let reactMaxTotal = 0; const reactWatch = [], reactSeedLines = [];
let bowCraftTotal = 0; const bowSeedLines = [];
let bowGearTotal = 0; const bowGearSeedLines = [];
let warnTotal = 0, warnNamed = 0, warnAbsentSeeds = 0; const warnUnnamed = [], warnSeedLines = [], warnUnobserved = [];
let settledNamed = 0, settledBare = 0; const settledSeedLines = [];
let dryTotal = 0; const drySeedLines = [];
let selfWitTotal = 0, selfWitObservable = 0; const selfWitDetail = [];
let desyncTotal = 0; const desyncSeedLines = [];
let e1CaseTotal = 0, e1PlainTotal = 0;
const q5ByPath = {};
// R138 THREAD BRANCH: end attempts where the wedge had to page (the
// Yara shape — menu paged by betrayal/agency prepends, cancel on page
// 2+). threadOps counts broken-live opportunities whose end sits paged;
// threadClosed counts those closed within 2 dawns of first-seen-broken.
let threadOps = 0, threadClosed = 0, pagedEndSits = 0, totalEndSits = 0;
// R138 TRAVEL BRANCH: end/travel-out sits whose homeward walk first hit
// a clearable blockage (fallen_tree / rubble / washed_out — the Pablo
// shape). travelOps counts broken-live opportunities with such a hit;
// travelClosed counts those closed within 2 dawns of first-seen-broken.
let travelOps = 0, travelClosed = 0, clearSits = 0, totalHomeSits = 0;
const CLEARABLE = { fallen_tree: 1, rubble: 1, washed_out: 1 };
function homeHit(h) {
  if (!h) return false;
  if ((h.clears || []).length > 0) return true;
  return !!(h.blocked && CLEARABLE[h.blocked.blockType]);
}
// R139 Q2 (canned-line variety watch, r135 standing watch): verbatim
// repeats across the panel convo transcripts. The r138 metric review
// widened the recap needle: the verbatim ' — Still on ' missed the
// paraphrase "that's still where we are", so recap-paraphrase counts
// 'still where we are' alongside it (report-only watch).
const CANNED = [
  ['pod-dream', 'The pods get into my sleep some nights'],
  ['recap-stitch', ' — Still on '],
  ['recap-paraphrase', 'still where we are'],
  ['slope-reading', 'how their grandmother did it'],
  ['walked-in', "Walked in like they'd never left"],
  ['take-it', "Take it for what it's worth"],
  ['stew-bowl', 'Someone saved me the last of the stew once'],
  ['parting-plain-see', 'See you around.'],
  ['parting-plain-care', 'Take care out there.'],
  ['parting-plain-tomorrow', 'Same time tomorrow, maybe.'],
];
const cannedTotals = Object.fromEntries(CANNED.map(([k]) => [k, 0]));
// R230 Q3 REVISION (r225 metric review): per-sitting presence totals —
// the txt prints each sitting TWICE (turn log + FULL-TRANSCRIPT), so raw
// indexOf counts 2x. A needle in a sitting counts once in
// cannedDistinct; cannedTotals (raw) is kept only as the audit trail.
// Prereg bar uses the distinct total: >= 6 distinct sittings -> a
// second paraphrase formulation is owed (r221 distinct: 1, r225: 4).
const cannedDistinct = Object.fromEntries(CANNED.map(([k]) => [k, 0]));
// R210: pod-dream OPENING watch (r139 metric review — the closing
// needle scores 0 on a sitting that OPENS on the pods, e.g. Darnell
// 5005). Counts sittings whose OPENING line contains 'rows of pods'.
// Report-only, same watch as the CANNED lines.
let podDreamOpen = 0;
// R217 Q1 (sitting closes): ENGINE-CUT sittings — the transcript ends
// '(ended by engine)' with no subsequent 'closing:' line. Graceful =
// a 'closing:' line, or the sitting running its full 8 turns.
// engineCutWithClosing counts engine-ended sittings that DID get a
// closing line; noCloseOther counts sittings with neither an engine end
// nor a closing line (loop exhausted / choices empty / no pick).
let totalSittings = 0, engineCut = 0, engineCutWithClosing = 0, noCloseOther = 0;
const engineCutDetail = [];
// R139 SPOTTER BARS (primary, replaces the r135–r138 Q3 guard):
// SPOTTER BAR: panel foodXp['spotter'] total >= 10 AND every panel
// seed contributes > 0 (was 0 on all 5 r138 seeds).
// LADDER BAR: >= 1 villager reaches 5 XP (skill 1) on >= 3/4 seeds.
// FASTER-ID BAR: threshold benefit fires on >= 2/4 seeds
// (NO-OPPORTUNITY if the scholar handles no plants — bumpCalls = 0).
let spotterTotal = 0, spotterSeedsPositive = 0, ladderSeeds = 0, fasterIdSeeds = 0;
let bumpCallsTotal = 0, bumpBenefitTotal = 0, codexPlantsTotal = 0;
// R221 Q1 (want-raise rate, r217 metric-review carry): per dawn social
// sit (wedge mode 'accept'/'start'), did the NPC raise an ask_favor
// want at any turn? The driver records every pick's wantId on the sit
// rec, so the analyzer scores it read-only — no driver change.
// raisedAnyWant counts sits where ANY want was visible (wantId != null
// on any pick); raiseKinds tallies ask_favor kinds. A seed with 0
// raises AND 0 any-want sits across the leg is the defect shape.
let wantSitsTotal = 0, wantRaisedTotal = 0, wantAnyTotal = 0, wantZeroSeeds = 0, wantNoWantSeeds = 0;
const wantKindTotals = {};
const wantSeedLines = [];
// R242 F5 FLOOR: per-seed raise rates for the tie-breaker read.
const wantSeedRates = [];
// R230 Q1 FAVORLESS-ASK CLASSIFIER (read-only, from the driver trace):
// A contentless seed in; B seeded favor gone; C seeded favor present
// but opener null anyway; D fresh pick with no live need (should be
// impossible per pick()); E other (trace attached for the run note).
let favorlessTotal = 0, favorlessReseeds = 0;
const favorlessClasses = {};
const favorlessRepeats = {};
const favorlessDetailAll = [];
// R230 Q1 re-measure: stage-0-deflected detector (the r225 defect shape
// — a dlg:cant / deflect_q pick while the ask_favor want is at stage 0,
// followed by the want reaching stage 3, resolves an unvoiced want as
// refused unheard; must be 0 on the fixed code) + stage-0-surfaced
// proxy (a villager whose favorless sit is followed in a LATER sitting
// by a kinded ask_favor — same villager, not identity-matched).
let stage0DeflectedTotal = 0, stage0SurfacedTotal = 0;
const stage0DeflectedDetail = [], stage0SurfacedDetail = [];
// R242 Q1c WIDENED (r241 metric review): the LOST-ask trigger is no
// longer scoped to case-thread E1 — ANY favorless ask whose kinded ask
// never surfaces later is a LOST ask (defect finding), regardless of
// class. lostAskDetail lists every never-surfaced favorless sit; the
// old caseThreadE1* counters stay as the mechanism detail (which
// LOST asks were case-thread E1s).
let caseThreadE1Total = 0;
const caseThreadE1Detail = [];
const lostAskDetail = [];
// R240 Q6 POLICY FORAGING (r233 F4 named question, report-only):
// per seed, scholar bumpCalls vs wedgeSits vs joint forage_help
// commits — the three numbers already in the JSON. A seed with
// bumpCalls <= 2 AND wedgeSits >= 50 is the F4 shape.
const q6Lines = [];
const lines = [];
for (const seed of seeds) {
  const d = load(seed);
  const ops = opportunities(d);
  const endAttempts = (d.endLog || []).length;
  const ended = (d.endLog || []).filter(e => e.outcome === 'ended' || e.outcome === 'end-via-deliver').length;
  const drops = (d.endLog || []).filter(e => (e.outcome || '').startsWith('end-trust-drop'));
  trustDrops += drops.length;
  jamTotal += (d.jamLog || []).length;
  const alive40 = d.aliveAt40;
  if (alive40 != null && alive40 > 0) villagePass++;
  // Thread-branch accounting from the end log: an end attempt paged
  // when pagesTurned > 0 (or menuPages > 1 with a paged sit rec).
  const paged = (d.endLog || []).filter(e => (e.pagesTurned || 0) > 0);
  pagedEndSits += paged.length; totalEndSits += endAttempts;
  // Travel-branch accounting: homeHops with a clear or a clearable
  // block on any end/travel-out sit this seed.
  for (const e of (d.endLog || [])) { totalHomeSits++; if (homeHit(e.homeHops)) clearSits++; }
  for (const t of (d.travelOutLog || [])) { if (t.homeHops) { totalHomeSits++; if (homeHit(t.homeHops)) clearSits++; } }
  // R139 SPOTTER accounting from the end foodXp snapshot + bump log.
  let seedSpotter = 0, seedLadder = false;
  for (const fx of (d.foodXpEnd || [])) { seedSpotter += fx.spotter || 0; if ((fx.spotter || 0) >= 5) seedLadder = true; }
  spotterTotal += seedSpotter;
  if (seedSpotter > 0) spotterSeedsPositive++;
  if (seedLadder) ladderSeeds++;
  const bumpCalls = (d.bumpLog || []).filter(b => b.pid).length;
  const bumpBenefit = (d.bumpLog || []).filter(b => b.benefit).length;
  bumpCallsTotal += bumpCalls; bumpBenefitTotal += bumpBenefit;
  if (bumpBenefit > 0) fasterIdSeeds++;
  const codexTotal = (d.codexPlantsEnd && d.codexPlantsEnd.total != null) ? d.codexPlantsEnd.total : null;
  if (codexTotal != null) codexPlantsTotal += codexTotal;
  // R245 COUNTER WATCH (r244 metric review: comma-only): judge the
  // r246 label on the COUNTER LEARNED say lines. A label is a FINDING
  // when it contains ", " (the comma class). Em-dash labels go to the
  // separate watch line; long noun phrases without a comma pass.
  for (const cl of (d.counterLines || [])) {
    counterTotal++;
    const m = String(cl.line || '').match(/COUNTER LEARNED\s*[\u2014\u2013-]\s*(.+?)\s*:/);
    const label = m ? m[1] : '?';
    if (/, /.test(label)) counterProse.push(`seed ${seed} d${cl.day}: "${label}"`);
    else if (/[\u2014\u2013]/.test(label)) counterEmdash.push(`seed ${seed} d${cl.day}: "${label}"`);
    else counterOk.push(`seed ${seed} d${cl.day}: "${label}"`);
  }
  // R245 REACT WATCH (r246 wind-down fix, first live panel): per
  // sitting, the max run of consecutive dlg:react picks. The fix
  // retires react at reactDryCount >= 2; a landed beat resets the
  // count, so a run >= 3 is a WATCH candidate, adjudicated against
  // the transcript in the run note (finding only if the dead-react
  // pool cycles verbatim with no landed beat between).
  let seedReactMax = 0;
  for (const s of (d.wedgeSits || [])) {
    let run = 0, sitMax = 0;
    for (const p of (s.picks || [])) {
      if (p && p.id === 'dlg:react') { run++; if (run > sitMax) sitMax = run; } else run = 0;
    }
    if (sitMax > seedReactMax) seedReactMax = sitMax;
    if (sitMax >= 3) reactWatch.push(`seed ${seed} d${s.day} ${s.name || s.vid}: ${sitMax} consecutive dlg:react picks`);
  }
  if (seedReactMax > reactMaxTotal) reactMaxTotal = seedReactMax;
  reactSeedLines.push(`seed ${seed}: max consecutive dlg:react ${seedReactMax}`);
  // R246 BOWCRAFT GEAR-COUNT (r245 metric review — the /bow/i
  // telemetry scan is blind: crafting emits generic weapon_craft /
  // ammo_craft / craft keys, so 0 bow-key events coexist with bows
  // in hand). Count bow itemIds in the end-census `equipped` lists
  // per seed; the telemetry scan stays as the secondary line.
  const bowGear = [];
  for (const c of (d.census || [])) for (const it of (c.equipped || [])) if (/bow/i.test(String(it))) bowGear.push(`${c.name || c.id}:${it}`);
  bowGearTotal += bowGear.length;
  bowGearSeedLines.push(`seed ${seed}: ${bowGear.length} bows equipped (${bowGear.join(', ') || 'none'})`);
  const bowKeys = {};
  for (const [k, v] of Object.entries(d.teleTypeCounts || {})) if (/bow/i.test(k)) { bowKeys[k] = v; bowCraftTotal += v; }
  const tc = d.teleTypeCounts || {};
  bowSeedLines.push(`seed ${seed}: bow tele keys ${JSON.stringify(bowKeys)}; ammo_craft ${tc.ammo_craft || 0} armor_craft ${tc.armor_craft || 0} craft ${tc.craft || 0}`);
  // R246 WARN-HEED WATCH (r150 fix, first live panel): a warn_you
  // sitting is any wedge sit whose picks carry wantId warn_you. It is
  // NAMED when warnLog holds a warning delivery for the same vid on
  // the same day. An ENGAGED sitting (dlg:heed or dlg:details pressed)
  // with no delivery is the r150 defect shape. A sitting that ends
  // before any engagement is reported, not faulted. When warnLog is
  // ABSENT (pre-r246 JSON), engaged sittings are UNOBSERVABLE — they
  // are listed, never faulted.
  const warnLog = (d.warnLog || []).filter(w => w && w.vid);
  const warnAbsent = !Array.isArray(d.warnLog);
  if (warnAbsent) { warnAbsentSeeds++; warnSeedLines.push(`seed ${seed}: warnLog ABSENT (pre-r246 JSON — instrument missing, not a finding)`); }
  for (const s of (d.wedgeSits || [])) {
    if (!(s.picks || []).some(p => p.wantId === 'warn_you')) continue;
    warnTotal++;
    const delivered = warnLog.some(w => String(w.vid) === String(s.vid) && w.day === s.day);
    if (delivered) warnNamed++;
    const engaged = (s.picks || []).some(p => p.id === 'dlg:heed' || p.id === 'dlg:details');
    if (warnAbsent) { if (engaged) warnUnobserved.push(`seed ${seed} d${s.day} ${s.name || s.vid}: warn_you engaged but warnLog absent — unobservable`); }
    else if (engaged && !delivered) warnUnnamed.push(`seed ${seed} d${s.day} ${s.name || s.vid}: warn_you engaged (heed/details pressed) but no warning delivered`);
    else if (!engaged) warnSeedLines.push(`seed ${seed} d${s.day} ${s.name || s.vid}: warn_you sitting ended before engagement (${delivered ? 'warning delivered anyway' : 'no warning'})`);
  }
  // R246 SETTLED-FAVOR + DRY2 WATCHES (r247 / r256 fixes, first live
  // read): count the driver's extracts. A bare "It's already handled"
  // is a watch item only if the favor carried a speakable short —
  // the JSON extract has no short, so bare lines are reported with
  // their day/line for the run note to adjudicate. On a pre-r246
  // corpus the extracts are absent — reported as such, not as 0.
  if (!Array.isArray(d.settledFavorLines)) settledSeedLines.push(`seed ${seed}: settledFavorLines ABSENT (pre-r246 JSON — instrument missing, not a finding)`);
  if (!Array.isArray(d.dryLines)) drySeedLines.push(`seed ${seed}: dryLines ABSENT (pre-r246 JSON — instrument missing, not a finding)`);
  for (const sf of (d.settledFavorLines || [])) { if (sf.named) settledNamed++; else settledBare++; }
  if ((d.settledFavorLines || []).length) { const sn = (d.settledFavorLines || []).filter(x => x.named).length, sb = (d.settledFavorLines || []).filter(x => !x.named).length; settledSeedLines.push(`seed ${seed}: settled-favor lines named ${sn}, bare ${sb}`); }
  dryTotal += (d.dryLines || []).length;
  for (const dl of (d.dryLines || [])) drySeedLines.push(`seed ${seed} d${dl.day}: DRY LINE — ${String(dl.line || '').slice(0, 120)}`);
  // R246 SELFWIT WATCH (r258 fix): an ambush-cause death whose witness
  // list contains the victim id is the defect shape. Most telemetry
  // death entries carry no witnesses — those are reported as
  // unobservable, not as passes.
  for (const dt of (d.deaths || [])) {
    if (!dt.witnesses) continue;
    selfWitObservable++;
    if ((dt.cause === 'ambush' || /ambush/i.test(String(dt.kind || ''))) && dt.witnesses.some(w => String(w) === String(dt.id))) {
      selfWitTotal++;
      selfWitDetail.push(`seed ${seed} d${dt.day}: ${dt.who} (${dt.id}) is in their own ambush witness list [${dt.witnesses.join(', ')}]`);
    }
  }
  // R246 DAY-DESYNC (r245 seed 101955: d40 missing, d42 doubled):
  // the fork proof on the r245 corpus showed repeat/skip pairs are
  // SYSTEMATIC clock jitter — 51 pairs across the 5-seed panel, every
  // seed showing several (a repeat then a skip, netting to zero) — not
  // a one-seed quirk. The finding-relevant metric is NET DRIFT:
  // (lastDay - firstDay + 1) - loopDays. 0 = jitter only; -1 = one
  // game-day short (the r245 101955 shape: last day 42, not 43).
  // Recomputed from `daily`; the driver's dayDesync list (repeats +
  // skips with loop days) is the cross-check, not the verdict.
  const dl = d.daily || [];
  let dsRepeats = 0, dsSkips = 0;
  for (let i = 1; i < dl.length; i++) {
    const prev = dl[i - 1].day, cur = dl[i].day;
    if (cur === prev) dsRepeats++;
    else if (cur > prev + 1) dsSkips++;
  }
  const dsFirst = dl.length ? dl[0].day : null, dsLast = dl.length ? dl[dl.length - 1].day : null;
  const dsNet = (dsFirst != null && dsLast != null) ? (dsLast - dsFirst + 1) - dl.length : null;
  desyncTotal += (dsNet || 0);
  desyncSeedLines.push(`seed ${seed}: loop-days ${dl.length}, game days ${dsFirst}→${dsLast}, net drift ${dsNet}, jitter repeats ${dsRepeats} skips ${dsSkips}${dsNet !== 0 ? ' — ONE GAME-DAY SHORT (r245 101955 shape)' : ''}`);
  if (!Array.isArray(d.dayDesync)) desyncSeedLines.push(`seed ${seed}: driver dayDesync ABSENT (pre-r246 JSON — recomputation above is the diagnosis)`);
  else if ((d.dayDesync || []).length !== dsRepeats + dsSkips) desyncSeedLines.push(`seed ${seed}: driver dayDesync ${(d.dayDesync || []).length} vs recomputed jitter ${dsRepeats + dsSkips} — MISMATCH (investigate)`);
  // R221 Q1 WANT-RAISE accounting from the wedge-sit pick records.
  // Denominator: dawn social sits only (mode 'accept'/'start').
  const socialSits = (d.wedgeSits || []).filter(s => s.mode === 'accept' || s.mode === 'start');
  let seedRaised = 0, seedAnyWant = 0;
  const seedKinds = {};
  for (const s of socialSits) {
    const picks = s.picks || [];
    const raised = picks.some(p => p.wantId === 'ask_favor');
    const anyWant = picks.some(p => p.wantId != null);
    if (raised) {
      seedRaised++;
      // Kind tally is PER SIT, not per pick: the want stays ask_favor
      // across the sitting's turns, and only the commit-turn pick
      // carries the favor kind — counting picks would count one ask
      // many times (and as '(no-kind)' on every non-commit turn).
      // First kinded kind wins; an ask that never materialized into a
      // committable favor on any pick counts as '(no-kind)' for the sit.
      const kinded = picks.find(p => p.wantId === 'ask_favor' && p.wantFavorKind);
      const k = kinded ? kinded.wantFavorKind : '(no-kind)';
      seedKinds[k] = (seedKinds[k] || 0) + 1;
      wantKindTotals[k] = (wantKindTotals[k] || 0) + 1;
    }
    if (anyWant) seedAnyWant++;
  }
  wantSitsTotal += socialSits.length; wantRaisedTotal += seedRaised; wantAnyTotal += seedAnyWant;
  if (seedRaised === 0) {
    wantZeroSeeds++;
    if (seedAnyWant === 0) wantNoWantSeeds++;
  }
  wantSeedLines.push(`seed ${seed}: want-raise ${seedRaised}/${socialSits.length} social sits raised ask_favor (any-want sits ${seedAnyWant}); kinds ${JSON.stringify(seedKinds)}${seedRaised === 0 ? (seedAnyWant === 0 ? ' — ZERO-RAISE + NO-WANT (defect shape)' : ' — ZERO-RAISE (watch)') : ''}`);
  wantSeedRates.push({ seed, raised: seedRaised, total: socialSits.length, rate: socialSits.length ? seedRaised / socialSits.length : null });
  // R230 Q1 FAVORLESS-ASK CLASSIFIER: every social sit that raised
  // ask_favor but never attached a favor kind on any pick is a
  // favorless ask. Classify from the driver's trace (read-only).
  const favorlessSitsThisSeed = [];
  for (const s of socialSits) {
    const picks = s.picks || [];
    const raised = picks.some(p => p.wantId === 'ask_favor');
    if (!raised) continue;
    const kinded = picks.find(p => p.wantId === 'ask_favor' && p.wantFavorKind);
    if (kinded) continue;
    const ts = s.traceStart || null, te = s.traceEnd || null;
    let cls = 'E', why = '';
    if (!ts) { cls = 'E'; why = 'no traceStart (pre-trace sit or instrument miss)'; }
    else if (ts.fromSeed && !ts.seedFavorId) { cls = 'A'; why = `contentless seed in (note "${ts.seedNote || ''}", seed day ${ts.seedLive ? ts.seedLive.day : '?'})`; }
    else if (ts.fromSeed && ts.seedFavorId && (!ts.ledgerFavor || ts.ledgerFavor.id !== ts.seedFavorId)) { cls = 'B'; why = `seed favor ${ts.seedFavorId} gone (ledger: ${ts.ledgerFavor ? ts.ledgerFavor.id + '/' + ts.ledgerFavor.state : 'null'})`; }
    else if (ts.fromSeed && ts.seedFavorId && ts.ledgerFavor && ts.ledgerFavor.id === ts.seedFavorId) { cls = 'C'; why = `seed favor present (${ts.ledgerFavor.id}/${ts.ledgerFavor.state}/${ts.ledgerFavor.kind}) but opener attached nothing`; }
    else if (!ts.fromSeed && !ts.need) { cls = 'D'; why = 'fresh pick with no live need (pick() should return 0)'; }
    else if (!ts.fromSeed) {
      // AMENDMENT A1: split class E by whether the want opener ran.
      // E1 opener never ran (resume/earlier thread pre-empted it);
      // E2 opener ran, returned null; E3 opener returned a line but
      // the sitting opened on another thread (ledger-blocked);
      // E4 probe missing (pre-probe JSON).
      const po = ts.probeOpen || null;
      if (!po) { cls = 'E4'; why = `fresh pick, live need ${ts.need ? ts.need.kind + '/u' + ts.need.urgency : 'null'} but no kind attached (no opener probe — pre-A1 JSON)`; }
      else {
        const wo = po.filter(e => e.method === 'wantOpener' && e.wantId === 'ask_favor');
        const bf = po.filter(e => e.method === 'buildFavor');
        if (wo.length === 0) { cls = 'E1'; why = `opener NEVER RAN (openThread ${ts.openThread || '?'}, resumedOnce ${!!ts.resumedOnce}, need ${ts.need ? ts.need.kind + '/u' + ts.need.urgency : 'null'})`; }
        else if (!wo.some(w => w.hasLine)) { cls = 'E2'; why = `opener ran, returned NULL (buildFavor calls: ${bf.length ? bf.map(b => b.kind + ':' + (b.ok ? 'ok' : 'NULL')).join(',') : 'none'})`; }
        else { cls = 'E3'; why = `opener returned a line but sitting opened on ${ts.openThread || '?'} (ledger-blocked line or stale-opener miss; wantFavor at start: ${ts.wantFavor ? ts.wantFavor.kind : 'null'})`; }
      }
    }
    else { cls = 'E'; why = `unmatched trace ${JSON.stringify(ts)}`; }
    favorlessTotal++;
    favorlessClasses[cls] = (favorlessClasses[cls] || 0) + 1;
    const repKey = `${s.name || '?'} (${s.vid})`;
    favorlessRepeats[repKey] = (favorlessRepeats[repKey] || 0) + 1;
    const reseeded = te && te.seedAfter ? (te.seedAfter.favorId ? 'seeded-with-favor' : 'CONTENTLESS-RESEED') : 'no-seed-after';
    if (te && te.seedAfter && !te.seedAfter.favorId) favorlessReseeds++;
    // R230 stage-0-deflected: a deflect pick at stage 0 followed by
    // the want reaching stage 3 (picks record the pre-turn stage).
    let s0d = false;
    for (let i = 0; i < picks.length; i++) {
      const p = picks[i];
      if (p.wantId === 'ask_favor' && (p.stage || 0) === 0 && (p.id === 'dlg:cant' || p.id === 'deflect_q')) {
        if (picks.slice(i + 1).some(q => q.wantId === 'ask_favor' && (q.stage || 0) === 3)) { s0d = true; break; }
      }
    }
    if (s0d) { stage0DeflectedTotal++; stage0DeflectedDetail.push(`seed ${seed} d${s.day}: ${repKey} class ${cls} — STAGE-0-DEFLECTED (deflect at stage 0, want reached stage 3)`); }
    favorlessSitsThisSeed.push({ vid: String(s.vid), day: s.day, name: s.name || '?', cls, sit: s });
    // R246 E1 SPLIT (r245 metric review): E1 (opener never ran)
    // splits by whether the sitting's picks include a betrayal:*
    // case-thread pick. E1-case = the case thread crowded the opener
    // out (both r245 LOST asks were E1-case); E1-plain = some other
    // thread pre-empted it. The old caseThreadE1* counters stay as
    // the case-thread mechanism detail.
    if (cls === 'E1') {
      const casePicks = picks.filter(p => String(p.id || '').startsWith('betrayal:')).length;
      const helpPressed = picks.some(p => p.id === 'dlg:help');
      const openThread = (ts && ts.openThread) || '?';
      if (casePicks > 0) e1CaseTotal++; else e1PlainTotal++;
      caseThreadE1Total++;
      caseThreadE1Detail.push(`seed ${seed} d${s.day}: ${repKey} — ${casePicks > 0 ? 'E1-case' : 'E1-plain'}, openThread ${openThread}, case picks ${casePicks}/${picks.length}, dlg:help pressed ${helpPressed ? 'YES' : 'NO'}${helpPressed ? '' : ' (ask never offered a hearing)'}`);
    }
    const maxStage = picks.reduce((m, p) => Math.max(m, p.stage || 0), ts ? (ts.stage || 0) : 0);
    favorlessDetailAll.push(`seed ${seed} d${s.day}: ${repKey} class ${cls} — ${why} (stage max ${maxStage}, ${reseeded}${te && te.seedAfter ? `, seed day ${te.seedAfter.day}` : ''})${s0d ? ' STAGE-0-DEFLECTED' : ''}`);
  }
  // R230 stage-0-surfaced proxy: for each favorless sit this seed, did
  // the SAME villager raise a KINDED ask_favor in a later social sit?
  // (Index order = wedge order = chronological; same-day later sits count.)
  // R242 WIDENED LOST TRIGGER: a favorless sit with NO later kinded ask
  // is a LOST ask, whatever its class — record it here.
  for (let fi = 0; fi < favorlessSitsThisSeed.length; fi++) {
    const fs0 = favorlessSitsThisSeed[fi];
    const si = socialSits.findIndex(s2 => s2 === fs0.sit);
    const later = socialSits.slice(si + 1).some(s2 => String(s2.vid) === fs0.vid && (s2.picks || []).some(p => p.wantId === 'ask_favor' && p.wantFavorKind));
    if (later) { stage0SurfacedTotal++; stage0SurfacedDetail.push(`seed ${seed}: ${fs0.name} (${fs0.vid}) favorless d${fs0.day} (class ${fs0.cls}) — kinded ask_favor raised in a later sitting`); }
    else lostAskDetail.push(`seed ${seed}: ${fs0.name} (${fs0.vid}) favorless d${fs0.day} (class ${fs0.cls}) — LOST (no kinded ask_favor raised in any later sitting)`);
  }
  // R138 STRANDED accounting from strandedLog + wedge sits/commits.
  const sLog = (d.strandedLog || []);
  strandedDawns += sLog.length;
  for (const s of sLog) strandedRunKeys.add(String(s.vid) + ':' + s.kind);
  for (const t of (d.travelOutLog || [])) {
    if ((t.outcome || '').startsWith('unworked: previous bearer')) strandedWorked++;
    if (t.outcome === 'prev-bearer-stranded') guardFires++;
    // Work on a stranded run by any other shape: a travel-out entry
    // for the stranded vid on a stranded day that moved or pressed.
    if (t.moved || t.press) {
      const hit = sLog.some(s => String(s.vid) === String(t.vid) && s.day === t.day);
      if (hit) strandedWorked++;
    }
  }
  const strandedDays = [...new Set(sLog.map(s => s.day))];
  // R244 (r243 metric review §2): the STRANDED summary prints social
  // sits against DISTINCT stranded days, not the entry count.
  strandedDaysTotal += strandedDays.length;
  for (const day of strandedDays) {
    const social = (d.wedgeSits || []).some(s => s.day === day && (s.mode === 'accept' || s.mode === 'start'));
    if (social) strandedSocial++; else { const workFavor = (d.wedgeSits || []).some(s => s.day === day && s.mode === 'work'); if (workFavor) { strandedWorkFavor++; lines.push(`seed ${seed}: stranded d${day} with NO social sit — wedge working a live favor (not a miss)`); } else { strandedNoSocial++; lines.push(`seed ${seed}: stranded d${day} with NO social sit (accept/start) — BAR MISS`); } }
  }
  const firstStrandedDay = sLog.length ? Math.min(...sLog.map(s => s.day)) : null;
  if (firstStrandedDay !== null) {
    strandedCommits += (d.commitLog || []).filter(c => c.ok && c.day > firstStrandedDay).length;
  }
  // Canned lines from this seed's convo transcript — R230 per-sitting
  // presence (see cannedDistinct): split on sitting headers; a needle
  // scores at most once per sitting block. Raw counts stay in
  // cannedTotals as the audit trail only.
  try {
    const txt = fs.readFileSync(path.join(EVID, `journey-establishment-r246-convo-seed${seed}.txt`), 'utf8');
    for (const [k, needle] of CANNED) {
      let n = 0, i = -1;
      while ((i = txt.indexOf(needle, i + 1)) !== -1) n++;
      cannedTotals[k] += n;
    }
    const blocks = txt.split(/^-- .+ occ=.+ --$/m).slice(1);
    for (const block of blocks) {
      for (const [k, needle] of CANNED) {
        if (block.includes(needle)) cannedDistinct[k]++;
      }
    }
    for (const ln of txt.split('\n')) {
      if (ln.startsWith('OPENING:') && ln.includes('rows of pods')) podDreamOpen++;
    }
    // R217 Q1 REVISED (r214 metric review): a sitting is CUT only when
    // the full transcript shows NO closing beat after the final grace
    // beat AND the last THEM line is an open question/invitation/
    // promise. The driver records beatsAfterLastThem per sitting; the
    // open-question half is a human read (the analyzer flags the
    // sitting; the run note adjudicates). Engine-ended sittings WITH
    // closing beats are closes, not cuts — and so is any sitting with
    // >= 1 closing beat even when endConvo returned no closing line
    // (the want-close beat speaks into the transcript instead).
    const closes = d.sittingCloses || [];
    for (const sc of closes) {
      totalSittings++;
      const who = `${sc.name || '?'} (${sc.vid || '?'})`;
      if (sc.beatsAfterLastThem === null || sc.beatsAfterLastThem === undefined) {
        noCloseOther++; engineCutDetail.push(`seed ${seed}: UNKNOWN-BEATS — ${who} (anchor not found in transcript; read in full, never a CUT)`);
      } else if (sc.endedByEngine && sc.beatsAfterLastThem === 0 && !sc.closingLine) {
        engineCut++; engineCutDetail.push(`seed ${seed}: CUT — ${who} (engine-ended, 0 closing beats after last THEM: "${(sc.lastThem || '').slice(0, 80)}")`);
      } else if (sc.endedByEngine) engineCutWithClosing++;
      else if (!sc.closingLine && (sc.beatsAfterLastThem || 0) === 0) { noCloseOther++; engineCutDetail.push(`seed ${seed}: NO-CLOSE (other) — ${who}`); }
    }
    if (!closes.length) {
      // Fallback: legacy txt-shape scoring (driver without sittingCloses).
      const sittings = txt.split(/\n-- /).slice(1);
      for (const s of sittings) {
        totalSittings++;
        const cut = s.includes('(ended by engine)');
        const closed = /closing:/.test(s);
        const who = (s.split('\n')[0] || '').slice(0, 60);
        if (cut && !closed) { engineCut++; engineCutDetail.push(`seed ${seed}: ENGINE-CUT — ${who}`); }
        else if (cut && closed) engineCutWithClosing++;
        else if (!cut && !closed) { noCloseOther++; engineCutDetail.push(`seed ${seed}: NO-CLOSE (other) — ${who}`); }
      }
    }
  } catch (e) { lines.push(`seed ${seed}: (convo transcript unreadable: ${e.message})`); }
  // END BAR per opportunity: broke >=2 days before the run's end AND
  // bearer is the player AND ending was ready on >=1 dawn after
  // breaking. Bearer/ready are approximated from the end log: an
  // end-not-ready entry naming the bearer block excuses the run;
  // an end attempt that closed within 2 dawns of first-seen-broken
  // passes. Runs first seen broken on the final 2 days are excluded.
  let seedPass = true; const seedNotes = [];
  for (const op of ops) {
    // R244 (r243 metric review §1): allOps counts QUALIFYING
    // opportunities only — excluded-tail, never-ready (condition c
    // unmet) and bearer-changed runs never enter the denominator.
    // It is incremented in the closed branch and at the FAIL point.
    const excluded = (d.endDay - op.firstDay) < 2;
    // R138 thread branch: did any end attempt for THIS run (days
    // firstDay..endDay) have to page?
    const opPaged = (d.endLog || []).some(e => String(e.vid) === String(op.vid) && e.day >= op.firstDay && (op.endDay === null || e.day <= op.endDay) && (e.pagesTurned || 0) > 0);
    if (opPaged) threadOps++;
    // R138 travel branch: did any end/travel-out sit for THIS run
    // (days firstDay..endDay) hit a clearable blockage on the way home?
    const opTravel = (d.endLog || []).some(e => String(e.vid) === String(op.vid) && e.day >= op.firstDay && (op.endDay === null || e.day <= op.endDay) && homeHit(e.homeHops))
      || (d.travelOutLog || []).some(t => String(t.vid) === String(op.vid) && t.day >= op.firstDay && (op.endDay === null || t.day <= op.endDay) && homeHit(t.homeHops));
    if (opTravel) travelOps++;
    if (excluded) { seedNotes.push(`${op.name}: first-seen-broken d${op.firstDay}, run ended d${d.endDay} (<2d left — excluded)`); continue; }
    const closedIn2 = op.endDay !== null && (op.endDay - op.firstDay) <= 2;
    if (closedIn2) { allOps++; closedOps++; if (opPaged) threadClosed++; if (opTravel) travelClosed++; seedNotes.push(`${op.name}: broken d${op.firstDay}, closed d${op.endDay} — PASS${opPaged ? ' (PAGED)' : ''}${opTravel ? ' (TRAVEL-HIT)' : ''}`); continue; }
    // Prereg condition (c): ending must have been ready on >=1 dawn
    // after breaking. A run whose every end attempt was not-ready on
    // bearer/event grounds never met (c) — excused, not failed.
    const attempts = (d.endLog || []).filter(e => String(e.vid) === String(op.vid));
    const notReady = attempts.filter(e => (e.outcome || '').startsWith('end-not-ready'));
    const excusable = attempts.length > 0 && notReady.length === attempts.length &&
      notReady.every(e => /previous bearer|current event|Finish the fight/i.test(e.outcome || ''));
    if (excusable) { seedNotes.push(`${op.name}: broken d${op.firstDay}, ending never ready (${notReady.map(e => e.outcome).join(' | ')}) — EXCUSED (condition c unmet)`); continue; }
    // R138 bearer-change excuse (r136 metric-review proposal (a)): the
    // bearer died/changed mid-window and the ending is permanently
    // not-ready for the successor (the Hiroshi shape) — out of scope,
    // recorded with the cause, not counted as a failure.
    const bearerChanged = attempts.some(e => /previous bearer/i.test(e.outcome || ''));
    if (bearerChanged) { seedNotes.push(`${op.name}: broken d${op.firstDay}, bearer changed mid-window (ending not-ready for successor) — EXCUSED (bearer-change scope boundary)`); continue; }
    allOps++; seedPass = false; seedNotes.push(`${op.name}: broken d${op.firstDay}, outcomes ${JSON.stringify(op.outcomes)} — FAIL`);
  }
  if (!ops.length) { noOppSeeds++; seedNotes.push('(no broken-live forage runs — NO-OPPORTUNITY on this seed)'); }
  lines.push(`seed ${seed}: endDay=${d.endDay} aliveAt40=${alive40} aliveEnd=${d.aliveEnd} wave=${d.waveReached} standingEnd=${(d.standingEnd === undefined || d.standingEnd === null) ? '?' : d.standingEnd} pantryEnd=${d.pantryKcalEnd} endAttempts=${endAttempts} ended=${ended} trustDrops=${drops.length} jamDays=${(d.jamLog || []).length} strandedDawns=${sLog.length} strandedRuns=${new Set(sLog.map(s => String(s.vid) + ':' + s.kind)).size} brokenWaterDawns=${d.brokenWaterDawns} endDisabled=${!!d.endDisabled} spotter=${seedSpotter} ladder=${seedLadder ? 'YES' : 'no'} bumpCalls=${bumpCalls} bumpBenefit=${bumpBenefit} codexPlants=${codexTotal === null ? '?' : codexTotal}`);
  // R240 Q6 POLICY FORAGING (r233 F4): scholar solo-forage volume vs
  // sitting volume vs joint-forage commits on this seed.
  const q6Wedge = (d.wedgeSits || []).length;
  const q6JointForage = (d.commitLog || []).filter(c => c.ok && c.kind === 'forage_help').length;
  q6Lines.push(`  Q6 seed ${seed}: bumpCalls=${bumpCalls} wedgeSits=${q6Wedge} jointForageCommits=${q6JointForage}${(bumpCalls <= 2 && q6Wedge >= 50) ? ' — F4 SHAPE (scholar barely solo-forages while sits fill the day)' : ''}`);
  // R240 SCHOLAR-DEATH LOCATIONS (r231 watch hit 3; companion-guard
  // exposure hypothesis): for each scholar (player) death, the last
  // scholarDawns record on or before the death day — where the scholar
  // was at the last dawn before dying. Absent on the r231 corpus
  // (no scholarDawns recorded) — reported as UNKNOWN, never scored.
  for (const dt of (d.deaths || []).filter(x => x.player)) {
    const sd = (d.scholarDawns || []).filter(x => x.day <= dt.day);
    const last = sd.length ? sd[sd.length - 1] : null;
    if (!last) lines.push(`  scholar death d${dt.day} (${dt.who || '?'}, ${dt.cause || '?'}): last-dawn location UNKNOWN (no scholarDawns record)`);
    else lines.push(`  scholar death d${dt.day} (${dt.who || '?'}, ${dt.cause || '?'}): last dawn d${last.day} at (${last.px},${last.py}) atHaven=${last.atHaven} insideHaven=${last.insideHaven}`);
  }
  if ((d.teleTypeCounts || null)) lines.push(`  telemetry types: ${JSON.stringify(d.teleTypeCounts)}`);
  for (const n of seedNotes) lines.push(`  ${n}`);
  // R231 ROSTER RECONCILIATION (r225 anomaly, recurred r230): start
  // roster - end roster = vanished; each vanished id must have a
  // villager death record (telemetry kind villager/person) or a
  // rosterDepartures entry. Match by ID: the death record's `who`
  // is the villager id (corpses.js), but its resolved name is the
  // KNOWN name at end of run, which differs from the start-census
  // name — name-only matching undercounts (proven on the r230
  // corpus: 101204/101205 read UNACCOUNTED=2 by name). The name
  // match stays as a fallback for corpora without ids.
  const startIds = (d.startCensus || []).map(x => String(x.id));
  const endIds = new Set((d.census || []).map(x => String(x.id)));
  const vanishedIds = startIds.filter(id => !endIds.has(id));
  const depById = Object.fromEntries((d.rosterDepartures || []).map(rd => [String(rd.id), rd]));
  const villDeaths = (d.deaths || []).filter(dt => dt.kind === 'villager' || dt.kind === 'person');
  // R240 REMOVAL LOG: the removeVillager how for each vanished id
  // ('killed'/'ambushed' = death; 'fled'/'splinter'/'exiled' = left
  // alive). Absent on pre-r241 corpora — reported as unknown.
  const rmById = Object.fromEntries(((d.removalLog || []).map(r => [String(r.vid), r])));
  let unaccounted = 0;
  for (const sid of vanishedIds) {
    const nm = (d.startCensus || []).find(x => String(x.id) === sid);
    const name = nm ? nm.name : sid;
    const dep = depById[sid];
    const deathRec = villDeaths.find(dt => (dt.id && dt.id === sid) || dt.who === name);
    const rm = rmById[sid];
    const rmTag = rm ? ` [removal: ${rm.how} d${rm.day}]` : ' [removal: UNKNOWN — pre-r241 corpus]';
    if (deathRec) lines.push(`  ${name} (${sid}): vanished, death recorded d${deathRec.day} (${deathRec.cause || '?'})${rmTag}`);
    else if (dep) lines.push(`  ${name} (${sid}): vanished d${dep.day}, NO death record — departure logged (deadAtDeparture=${!!dep.deadAtDeparture})${rmTag}`);
    else { unaccounted++; lines.push(`  ${name} (${sid}): vanished, NO death record, NO departure record — UNACCOUNTED${rmTag}`); }
  }
  lines.push(`seed ${seed}: roster reconcile start=${startIds.length} end=${(d.census || []).length} vanished=${vanishedIds.length} departuresLogged=${(d.rosterDepartures || []).length} villagerDeaths=${villDeaths.length} UNACCOUNTED=${unaccounted}`);
  // R240 REMOVAL SUMMARY: non-death departures are the pilot's new
  // shape — name each one (a villager who leaves alive is a story the
  // player should hear; the driver records the how, the run note
  // judges whether the game told it).
  const rmCounts = {};
  for (const r of (d.removalLog || [])) rmCounts[r.how] = (rmCounts[r.how] || 0) + 1;
  const nonDeath = (d.removalLog || []).filter(r => r.how !== 'killed' && r.how !== 'ambushed');
  lines.push(`  removals by how: ${JSON.stringify(rmCounts)} (log ${d.removalLog ? d.removalLog.length : 0} entries${d.removalLog ? '' : ' — ABSENT, pre-r241 corpus'}); non-death departures: ${nonDeath.length}`);
  for (const r of nonDeath) lines.push(`  NON-DEATH DEPARTURE d${r.day}: ${r.name} (${r.vid}) — ${r.how}`);
  // R240 EXILE NARRATION: did the game say the departure aloud? Each
  // exileLines entry is a dawn SAY line the player would have seen.
  // A non-death departure with zero exile lines is a SILENT departure.
  const exLines = (d.exileLines || []);
  lines.push(`  exile narration lines: ${exLines.length}${d.exileLines ? '' : ' (ABSENT — pre-r241 corpus)'}`);
  for (const e of exLines.slice(0, 12)) lines.push(`    d${e.day}: ${String(e.line).slice(0, 200)}`);
  if (exLines.length > 12) lines.push(`    ... +${exLines.length - 12} more`);
  // R242 Q5 MOOT-PATH (r241-owed instrument): per exile, the path from
  // the pronouncement text, whether the player heard anything about
  // this person before the exile, and whether a case thread about
  // them was ever held. Pronouncement texts (grounded in code):
  // moot — `${Name} is exiled. "Take what you can carry and go." ...`
  // (betrayal.js resolveCase, :2227); freeloader — `It's done.
  // "Take what you can carry and go." ...` (game.js freeloadVote).
  // A moot exile the player heard nothing about is an UNHEARD moot
  // exile (finding, documented + proposed); a freeloader exile with
  // no warning line at all is the carried silent-exile defect
  // trigger. Case-thread-held is a PROXY: a wedge sit on a day when
  // a case naming the person was open (caseLog dawn range) AND the
  // sit pressed betrayal:* picks — the run note confirms from the
  // transcript, since the picks may belong to another case.
  const q5ExilesThisSeed = (d.removalLog || []).filter(r => r.how === 'exiled');
  const mootL = (d.mootLines || []);
  const caseL = (d.caseLog || []);
  if (d.mootLines === undefined) lines.push(`  Q5 mootLines: ABSENT — pre-r242 corpus (moot/case channel not recorded)`);
  if (d.caseLog === undefined) lines.push(`  Q5 caseLog: ABSENT — pre-r242 corpus (betrayal-case snapshots not recorded)`);
  for (const ex of q5ExilesThisSeed) {
    q5Exiles++;
    const first = String((ex.name || '').split(' ')[0] || '');
    // Path from the pronouncement text. The moot says TWO "take what
    // you can carry" lines on the exile day — the sentencing line
    // ("The oldest among them stands... 'X — take what you can carry
    // and go.'") and the pronouncement ("X is exiled. 'Take what you
    // can carry and go.'...") — so taking the FIRST match misreads
    // the path (r242 first pass: 3/5 unknown). Prefer a line that
    // matches a path pattern; fall back to the first Take-carry line.
    const dayCarry = exLines.filter(e => e.day === ex.day && /Take what you can carry/i.test(e.line));
    const myCarry = first ? dayCarry.filter(e => new RegExp(first, 'i').test(e.line)) : [];
    const pron = (myCarry.length ? myCarry : dayCarry).find(e => / is exiled\.|^It's done\./i.test(e.line)) || (myCarry[0] || dayCarry[0] || null);
    let q5path = 'unknown';
    if (pron) {
      if (/^It's done\./i.test(pron.line)) q5path = 'freeload';
      else if (/ is exiled\./i.test(pron.line)) q5path = 'moot';
    }
    q5ByPath[q5path] = (q5ByPath[q5path] || 0) + 1;
    // A warning line counts for THIS exile only if it names the
    // exiled person AND matches the warning/gossip/vote wording —
    // the stage-1 gossip ("X isn't pulling weight") and stage-2
    // warning ("X gets told straight: pull weight or the village
    // will decide") both name their subject (game.js freeloadGossip
    // / freeloadWarning), so a warning about someone else (e.g. the
    // d23 gossip about the scholar Anjali the day before Morris and
    // Pavel were exiled) must NOT count for this person. The
    // pronouncement itself is on the exile day, not before it.
    const warnBefore = (first ? exLines.filter(e => e.day < ex.day && new RegExp(first, 'i').test(e.line) && /pull weight|pulling weight|village will decide|freeload|isn't pulling|exile/i.test(e.line)) : []);
    const mootNamed = first ? mootL.filter(e => e.day <= ex.day && new RegExp(first, 'i').test(e.line)) : [];
    // Cases naming this person as accused: dawn range where the case
    // was listed OPEN/dormant/advisory (the live states — betrayal.js
    // :1208). A case that later resolves stays in the array with a
    // terminal status (resolved/acquitted/exile/weregild); snapshots
    // after that point do NOT extend the open window, so the
    // case-thread-held proxy only counts sittings inside the live
    // window, never sittings after the case closed.
    const LIVE_CASE = { open: 1, dormant: 1, advisory: 1 };
    const myCases = [];
    for (const snap of caseL) {
      for (const c of (snap.cases || [])) {
        if ((c.accused || []).map(String).includes(String(ex.vid))) {
          let mc = myCases.find(m => m.id === c.id);
          if (!mc) { mc = { id: c.id, firstDay: null, lastDay: null, statuses: new Set(), resolution: c.resolution || null }; myCases.push(mc); }
          if (c.status) mc.statuses.add(c.status);
          if (c.resolution) mc.resolution = c.resolution;
          if (LIVE_CASE[c.status]) {
            if (mc.firstDay === null) mc.firstDay = snap.day;
            mc.lastDay = snap.day;
          }
        }
      }
    }
    const caseHeldProxy = [];
    for (const s of (d.wedgeSits || [])) {
      const picks = s.picks || [];
      if (!picks.some(p => String(p.id || '').startsWith('betrayal:'))) continue;
      const hit = myCases.find(mc => mc.firstDay !== null && s.day >= mc.firstDay && s.day <= mc.lastDay);
      if (hit) caseHeldProxy.push(`d${s.day} with ${s.name || s.vid} (case ${hit.id} open)`);
    }
    // PRESENT-AT-SENTENCING: moot-convening lines on the exile day
    // ("LIVE! THE MOOT", "call a moot", "The moot turns to you.
    // Your vote matters here") — the player was IN the room and
    // voted at the moot that sentenced this person, even if no line
    // named them in advance. That is not advance notice (HEARD is
    // about before the day), but it is not a silent exile either:
    // the player learns the accused at the moot itself. The verdict
    // is three-way: HEARD (advance notice) / PRESENT (in the room
    // at sentencing, no advance naming) / UNHEARD (neither).
    const presentLines = mootL.filter(e => e.day === ex.day && /LIVE! THE MOOT|call a moot|moot turns to you/i.test(e.line));
    const heard = warnBefore.length > 0 || mootNamed.length > 0 || caseHeldProxy.length > 0;
    const present = presentLines.length > 0;
    // On a pre-r242 corpus the moot/case channels are ABSENT, so an
    // UNHEARD verdict there is absence of evidence, not evidence of
    // silence — counted separately and labeled on the line.
    const q5Absent = (d.mootLines === undefined || d.caseLog === undefined);
    // SAME-DAY open+resolve (r242 metric-review blind spot): the exiling
    // case never appears LIVE in caseLog (opened + resolved between dawn
    // snapshots) — it is present only as a terminal snapshot, so its
    // firstDay stays null while its resolution reads 'exile'. A case
    // that was seen open (firstDay set) is not same-day, even if other
    // cases about the same person were never seen open.
    const sameDay = myCases.some(mc => mc.firstDay === null && mc.resolution === 'exile') && presentLines.length > 0 && !!pron;
    if (sameDay) q5SameDay++;
    if (heard) q5Heard++; else if (present) q5Present++; else if (q5Absent) q5UnheardAbsent++; else q5Unheard++;
    lines.push(`  Q5 EXILE d${ex.day}: ${ex.name} (${ex.vid}) — path=${q5path}${pron ? '' : ' (no pronouncement line on exile day)'}; warning lines before: ${warnBefore.length}; moot/case lines naming them: ${mootNamed.length}; cases naming them accused: ${myCases.length ? myCases.map(mc => `${mc.id} open ${mc.firstDay === null ? 'never (same-day open+resolve — below dawn resolution)' : 'd' + mc.firstDay + '–d' + mc.lastDay} [${[...mc.statuses].join('/')}]${mc.resolution ? ' → ' + mc.resolution : ''}`).join('; ') : 'none'}; case-thread-held proxy: ${caseHeldProxy.length ? caseHeldProxy.join('; ') : 'none'}; present at exile-day moot: ${presentLines.length} lines — ${heard ? 'HEARD (advance notice)' : (present ? 'PRESENT-AT-SENTENCING (in the room, no advance naming)' : (q5Absent ? 'UNHEARD — INSTRUMENT ABSENT (pre-r242 corpus, not evidence of silence)' : 'UNHEARD'))}${sameDay ? ' — SAME-DAY open+resolve (moot convening + pronouncement d' + ex.day + ', case never seen open in caseLog)' : ''}`);
    for (const w of warnBefore.slice(0, 4)) lines.push(`    warn d${w.day}: ${String(w.line).slice(0, 160)}`);
    for (const m of mootNamed.slice(0, 4)) lines.push(`    moot/case d${m.day}: ${String(m.line).slice(0, 160)}`);
  }
}
console.log(lines.join('\n'));
console.log('---');
console.log(`SPOTTER BAR (primary): panel foodXp['spotter'] total = ${spotterTotal} (bar: >= 10); seeds with > 0 = ${spotterSeedsPositive}/${seeds.length} (bar: every panel seed) — GO iff total >= 10 AND every seed > 0`);
console.log(`LADDER BAR: ${ladderSeeds}/${seeds.length} seeds with >= 1 villager at 5+ spotter XP / skill 1 (bar: >= 3/4 panel seeds)`);
console.log(`FASTER-ID BAR: threshold benefit fired on ${fasterIdSeeds}/${seeds.length} seeds (${bumpBenefitTotal} benefit plays in ${bumpCallsTotal} bump calls; bar: >= 2/4 seeds; NO-OPPORTUNITY if bumpCalls = 0 on every seed)`);
console.log(`CODEX PLANTS (report-only): ${codexPlantsTotal} plants identified at end across ${seeds.length} seeds (fieldwork = field-click identifications)`);
console.log(`STRANDED BAR: ${strandedDawns} stranded dawns on ${strandedRunKeys.size} runs; worked-on-stranded=${strandedWorked} (must be 0); guard fires=${guardFires}; social-sit dawns=${strandedSocial}/${strandedDaysTotal} (${strandedDawns} entries; misses=${strandedNoSocial}; wedge-working-a-live-favor dawns=${strandedWorkFavor}); new commits after first stranding=${strandedCommits} (NO-OPPORTUNITY if 0 stranded dawns — mechanism then carried by the proof test)`);
console.log(`END BAR: ${closedOps}/${allOps} broken-live forage opportunities closed within 2 dawns (qualifying only — excluded-tail / never-ready / bearer-changed not counted; NO-OPPORTUNITY seeds: ${noOppSeeds})`);
console.log(`THREAD BRANCH (carried watch): ${threadClosed}/${threadOps} paged (Yara-shape) opportunities closed within 2 dawns; ${pagedEndSits}/${totalEndSits} end sits paged (NO-OPPORTUNITY if 0 paged ops — mechanism then carried by the proof test)`);
console.log(`TRAVEL BRANCH: ${travelClosed}/${travelOps} clearable-blockage (Pablo-shape) opportunities closed within 2 dawns; ${clearSits}/${totalHomeSits} homeward sits hit a clearable blockage or cleared one (NO-OPPORTUNITY if 0 travel ops — mechanism then carried by the proof test)`);
console.log(`TRUST GUARD: ${trustDrops} trust drops on end presses (must be 0)`);
console.log(`JAM BAR (report-only): ${jamTotal} jam-days across panel (r84 panel: ~15 on seed 994 alone)`);
console.log(`VILLAGE BAR: ${villagePass}/${seeds.length} seeds alive at d40 (bar: >=3/4)`);
console.log(`Q2 SITTING CLOSES (revised, full-transcript bar): ${engineCut}/${totalSittings} CUT sittings (engine-ended, 0 closing beats after last THEM, no closing line); ${engineCutWithClosing} engine-ended WITH closing beats; ${noCloseOther} other no-close — GO iff 0 cut; WATCH 1-2 (read each in full); NO-GO >= 3 or an open-question cut`);
for (const d of engineCutDetail) console.log(`  ${d}`);
const f5Rates = wantSeedRates.filter(r => r.rate !== null);
const f5Min = f5Rates.length ? Math.min(...f5Rates.map(r => r.rate)) : null;
const f5Max = f5Rates.length ? Math.max(...f5Rates.map(r => r.rate)) : null;
const f5Shape = f5Min !== null && f5Min < 0.07 && f5Max !== null && f5Max > 0.15;
console.log(`Q1b WANT-RAISE (r221 Q1, standing guard — villagers must raise wants for the joint-favor wedge to have anything to accept): panel ${wantRaisedTotal}/${wantSitsTotal} social sits raised ask_favor (${wantSitsTotal ? (100 * wantRaisedTotal / wantSitsTotal).toFixed(1) : 'n/a'}%); any-want sits ${wantAnyTotal}/${wantSitsTotal}; zero-raise seeds ${wantZeroSeeds}/${seeds.length}; zero-raise + no-want seeds ${wantNoWantSeeds}/${seeds.length} (defect shape) — GO iff rate >= 10% AND no zero-raise seed; WATCH a zero-raise seed that shows other wants; NO-GO a zero-raise + no-want seed; F5 FLOOR: thinnest seed ${f5Min === null ? '?' : (100 * f5Min).toFixed(1) + '%'}, fattest ${f5Max === null ? '?' : (100 * f5Max).toFixed(1) + '%'} — thin<7% while fat>15% shape ${f5Shape ? 'RECURS (r233 thin 5.8–6.2%, r240 closed at 16.4% min, r241 thin 6.6%, r242 thin 6.5% (finding to build arm), r243 CLOSED at 10.3% min, r244 thin 7.4% pre-fix / 13.9% re-panel, r245 thin 14.9% fat 34.0% — no F5 floor shape)' : 'absent on this band'}`);
for (const l of wantSeedLines) console.log(`  ${l}`);
console.log(`  ask_favor kinds panel: ${JSON.stringify(wantKindTotals)}`);
console.log(`Q1 FAVORLESS ASK (r246 — ninth fresh-band re-read of the r231 settled-ledger fix): ${favorlessTotal} favorless sits of ${wantRaisedTotal} raised asks (${wantRaisedTotal ? (100 * favorlessTotal / wantRaisedTotal).toFixed(1) : 'n/a'}%; r245 fresh band: 4/70 = 5.7% (C 1, E1 3 — E1-case 2, E1-plain 1, LOST 2); r244 fresh band: 3/61 = 4.9% pre-fix (E1 2 + C 1, LOST 2), 0/60 re-panel (LOST 0); r243: 2/53 = 3.8%, E1 2/2 (surfaced 2/2, LOST 0); r242: 2/70 = 2.9%, E1 2/2 (surfaced 2/2, LOST 0); r241: 1/55 = 1.8%, C 1/1 (never surfaced — LOST per widened trigger); r240: 1/70 = 1.4%, E1 1/1; r233: 1/53 = 1.9%; r232: 2/77 = 2.6%; r231: 13/82 = 15.9%, E1 13/13); classes ${JSON.stringify(favorlessClasses)} (A contentless-seed / B seeded-favor-gone / C favor-present-opener-null / D fresh-no-need / E1 opener-never-ran / E2 opener-null / E3 line-blocked / E4 no-probe) — E1 split: E1-case ${e1CaseTotal}, E1-plain ${e1PlainTotal}; stage-0-deflected ${stage0DeflectedTotal} (must be 0); stage-0-surfaced ${stage0SurfacedTotal}/${favorlessTotal} (same villager kinded ask later, proxy); LOST asks ${lostAskDetail.length} (widened trigger — each is a defect finding, documented + proposed) — GO iff rate < 20% AND 0 stage-0-deflected AND every sit classified; WATCH rate 20-32.8% with residual mechanism named, or a new dominant class; NO-GO rate >= 32.8% OR any stage-0-deflected OR any class D / unclassified`);
console.log(`Q1c LOST ASK — WIDENED TRIGGER (r246 — r242 metric review: ANY favorless ask whose kinded ask never surfaces later is LOST, regardless of class; the class names the mechanism, the surfacing names the harm): ${lostAskDetail.length} LOST of ${favorlessTotal} favorless sits; E1-case sits ${e1CaseTotal}, E1-plain ${e1PlainTotal} (r245: 2 LOST, both E1-case; r244: 2 LOST pre-fix, 0 re-panel; r243: 2/2 E1, both surfaced — a day's delay, not a loss; LOST 0 on the r243 panel) — a LOST ask is a defect finding (documented with the full transcript, proposed not landed); a surfaced one is a day's delay`);
for (const d of caseThreadE1Detail) console.log(`  ${d}`);
for (const d of lostAskDetail) console.log(`  ${d}`);
for (const d of stage0DeflectedDetail) console.log(`  ${d}`);
for (const d of stage0SurfacedDetail) console.log(`  ${d}`);
for (const d of favorlessDetailAll) console.log(`  ${d}`);
console.log(`Q5 EXILE WARNING HEARD (r246 — moot-path instrument + same-day fix, proven r245: 2 exiles both moot HEARD 2, PRESENT 0, UNHEARD 0; r244: 7 exiles pre-fix all moot HEARD 7, 3 exiles re-panel HEARD 3; r243: 4 exiles all moot, HEARD 3 PRESENT 1 UNHEARD 0, same-day 2): ${q5Exiles} exiles on the panel, paths ${JSON.stringify(q5ByPath)}; same-day open+resolve ${q5SameDay}; HEARD (advance notice) ${q5Heard}, PRESENT-at-sentencing ${q5Present}, UNHEARD ${q5Unheard}, UNHEARD-instrument-absent ${q5UnheardAbsent} (pre-r242 corpus — not silence evidence) — freeloader exile with no warning line = silent-exile defect trigger; UNHEARD moot exile = finding (documented + proposed); PRESENT-at-sentencing means the player was in the room and voted at the sentencing moot`);
console.log(`Q6 POLICY FORAGING (r246 — r233 F4 named question, report-only): scholar bumpCalls vs wedgeSits vs joint forage_help commits per seed (F4 shape = bumpCalls <= 2 with wedgeSits >= 50)`);
for (const l of q6Lines) console.log(l);
console.log(`COUNTER LABEL WATCH (r246 — comma-only per r244 metric review; judged on COUNTER LEARNED say lines; r245: 110 lines, 0 comma-clause, 0 em-dash; r244: 111 lines pre-fix with 5 real comma-clause, 90 lines re-panel with 0): ${counterTotal} COUNTER LEARNED lines, ${counterProse.length} comma-clause labels (FINDING if > 0), ${counterEmdash.length} em-dash labels (watch only), ${counterOk.length} guarded/proper-name labels`);
for (const l of counterProse) console.log(`  COMMA-CLAUSE LABEL — ${l}`);
for (const l of counterEmdash) console.log(`  em-dash label (watch) — ${l}`);
for (const l of counterOk) console.log(`  ok — ${l}`);
console.log(`REACT WATCH (r246 — r246 wind-down fix live re-read, second live panel; RETIRE for this leg if the panel max stays 1 — r245 max 1 on all 5 seeds, 0 sittings >= 3; a run >= 3 is a candidate, adjudicated against the transcript): panel max consecutive dlg:react ${reactMaxTotal}; ${reactWatch.length} sittings at >= 3`);
for (const l of reactSeedLines) console.log(`  ${l}`);
for (const l of reactWatch) console.log(`  REACT-WATCH — ${l}`);
console.log(`BOWCRAFT WATCH (r246 — gear-count per r245 metric review: bows counted in the end-census equipped lists; r245 corpus: crude_bow x3, bow x3, crossbow x1 = 7; telemetry /bow/i scan kept as the secondary line — its 0 is the blind-scan confirmation, not a finding): ${bowGearTotal} bows equipped panel-wide; ${bowCraftTotal} bow-key telemetry events panel-wide`);
for (const l of bowGearSeedLines) console.log(`  ${l}`);
for (const l of bowSeedLines) console.log(`  ${l}`);
console.log(`WARN-HEED WATCH (r246 — r150 fix, first live panel; GO = every engaged warn_you sitting names a danger): ${warnTotal} warn_you sittings, ${warnNamed} with a warning delivered; ${warnUnnamed.length} engaged sittings with NO warning delivered (FINDING if > 0)${warnAbsentSeeds ? `; warnLog absent on ${warnAbsentSeeds} seeds — ${warnUnobserved.length} engaged sittings unobservable (not findings)` : ''}`);
for (const l of warnSeedLines) console.log(`  ${l}`);
for (const l of warnUnnamed) console.log(`  WARN-HEED FINDING — ${l}`);
for (const l of warnUnobserved) console.log(`  ${l}`);
console.log(`SETTLED-FAVOR WATCH (r246 — r247 fix, first live panel; report-only): ${settledNamed} named "It's already handled — {short}" lines, ${settledBare} bare lines`);
for (const l of settledSeedLines) console.log(`  ${l}`);
console.log(`DRY2 WATCH (r246 — r256 fix, first live panel on this leg; report-only, expect 0): ${dryTotal} "lost my train of thought" lines`);
for (const l of drySeedLines) console.log(`  ${l}`);
console.log(`SELFWIT WATCH (r246 — r258 fix, first live panel; report-only; victim in own witness list is a defect finding): ${selfWitTotal} self-witness ambush deaths (${selfWitObservable} deaths carried a witness list — the observable denominator)`);
for (const l of selfWitDetail) console.log(`  SELFWIT FINDING — ${l}`);
console.log(`DAY-DESYNC (r246 — r245 seed 101955: d40 missing, d42 doubled; net drift recomputed from the daily arrays, driver summary cross-checked when present): net drift ${desyncTotal} across the panel (0 = clock jitter only; -1 per seed = one game-day short)`);
for (const l of desyncSeedLines) console.log(`  ${l}`);
console.log(`  favorless repeats per villager: ${JSON.stringify(favorlessRepeats)}; contentless re-seeds after favorless sits: ${favorlessReseeds}/${favorlessTotal}`);
console.log(`Q3 RECAP PARAPHRASE (report-only, per-sitting presence, R230 revision): distinct=${cannedDistinct['recap-paraphrase']} of ${totalSittings} sittings (raw ${cannedTotals['recap-paraphrase']}) — report-only iff < 6 distinct; OVER-REPRESENTED iff >= 6 distinct (second formulation owed)`);
console.log(`R214 PARTING POOL (report-only, in-the-wild serves, distinct): see=${cannedDistinct['parting-plain-see']} care=${cannedDistinct['parting-plain-care']} tomorrow=${cannedDistinct['parting-plain-tomorrow']} (raw see=${cannedTotals['parting-plain-see']} care=${cannedTotals['parting-plain-care']} tomorrow=${cannedTotals['parting-plain-tomorrow']})`);
console.log(`Q3 CANNED LINES (report-only, r135 watch, distinct/raw): ${CANNED.map(([k]) => `${k}=${cannedDistinct[k]}/${cannedTotals[k]}`).join(' ')} pod-dream-open=${podDreamOpen} (r210 panel: paraphrase=2 walked-in=0, rest 0 across 5 convo files; r225 distinct: paraphrase=4 walked-in=3; r230 distinct: paraphrase=2 walked-in=0; r240 distinct: paraphrase=2 walked-in=0; r241 distinct: paraphrase=2 walked-in=1 take-it=1; r242 distinct: paraphrase=1; r243 distinct: paraphrase=0; r244 distinct: paraphrase=1 pre-fix, 0 re-panel; r245 distinct: paraphrase=2)`);
