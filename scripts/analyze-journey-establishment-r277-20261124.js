#!/usr/bin/env node
// Journey-establishment r277 panel scorer (read-only): scores the
// pre-registered bars from the per-seed JSONs. No game state is touched.
// R277 revisions vs r274: (1) Q1b STRANDED-GUARD BEARER-END EXCUSE —
// a stranded dawn with no social sit (accept/start) and no work-favor
// sit is a BAR MISS only when the stranded run's bearer is LIVING.
// When every stranded entry that dawn has bearerDead=true, the dawn
// counts CLOSED-BEARER-END (excused): a dead bearer's run can only
// close via the Haven BEARER-END menu, never via a social sit (r274
// metric review §3; r274 panel: 109003 d21, bearer dead, closed d21
// with no sit). The binding bar (Q1, closed within 2 dawns) is
// unchanged. (2) Q4 GUARDRAILS bar vs the r274 journey-regime means
// (deaths 42.9, popAlive 9.0, pantryKcal 35903/seed, starvationDeaths 0).
// (3) Comparisons updated to r274's numbers throughout.
// R274 revisions vs r271: (1) Q3 SILENT-ARRIVAL MARKER JOIN — the
// r271 name test read 3 of 4 arrivals SILENT, but the run note's
// proposed fix (capture the arrival-time name) is wrong: the r271
// JSONs show the rosterArrivals name and the end-census name are
// identical, because nameOf at the dawn diff already returns the
// learned first name. The LINES are descriptive for generated
// drifters ("a tired cook walks in", "A frightened family cries —
// relief, mostly"), with no name in the line at all. The join voice
// is the marker "Haven grows by one" (membership.js + betrayal.js
// visitor-invite + descriptive variants all end with it; trader /
// visitor lines lack it). An arrival is now NARRATED if a marker
// line falls on the diff day or the day before, split into
// NARRATED-BY-NAME (line contains the arrival's name) vs
// NARRATED-DESCRIPTIVE (marker present, no name — the game spoke,
// descriptively). SILENT only when no marker line is in the window.
// (2) Q4 GUARDRAILS section — per-seed guardrails.* / c3.* from the
// r274 driver emit, panel sums, per-seed means vs the r271
// journey-regime means (the bar) and vs the r132 sweep-regime
// baseline means (info only — different driver, different seed
// count). (3) 8-seed fractions: SPOTTER >= 20, LADDER >= 6/8,
// FASTER-ID >= 4/8, VILLAGE >= 6/8. F2 scholar deaths scaled:
// <= 4/panel WATCH, >= 5 investigate. (4) Comparisons updated to
// r271's numbers throughout.
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
// asks were E1-case. R265 REVISES the split to the MAJORITY rule
// (r246 metric review §2): E1-case iff case picks are >= 50% of the
// sitting — the any-pick rule mislabels a 1/12 meander as case-eaten. (2) BOWCRAFT GEAR-COUNT (r245 metric review) —
// the /bow/i telemetry scan is blind (crafting emits generic keys),
// so bows are counted in the end-census `equipped` lists per seed;
// the telemetry scan stays as a secondary line. (3) WARN-HEED WATCH
// — warn_you sittings vs warnLog deliveries (r150 fix, first live
// panel); an engaged sitting with no warning delivered is a defect
// finding. (4) SETTLED-FAVOR + DRY2 WATCHES — settledFavorLines
// (named vs bare) and dryLines extracts (r265 / r256 fixes, first
// live read). (5) SELFWIT WATCH — ambush deaths whose witness list
// contains the victim (r258 fix). (6) DAY-DESYNC line — the driver's
// dayDesync summary (r245 seed 101955: d40 missing, d42 doubled).
// Comparisons updated to r245's numbers throughout.
// R265 revisions vs r247: (1) Q1 RETIRED TO RATE-ONLY (r247 metric
// review §9 — the tenth fresh-band re-read closed the r231
// settled-ledger fix's verification arc; the per-sit classification,
// E1 split, LOST-ask and stage-0 lines are removed, not stubbed —
// the rate (favorless sits / raised asks) stays as a standing guard).
// The driver still records the trace FIELDS. (2) WINPLAN JUDGED ON
// planSeeds/partyDepartures/plans, NEVER on ignited — PLANWAKE wakes
// the store live on the first Haven tick by design, so ignited reads
// true even with zero plans; the store-woken line reports the wake
// separately from the seeding. (3) STRANDED-CLOSE lines — a stranded
// run whose bearer is dead is now closable (BEARER-END); closes are
// tracked from strandedLog + endLog (days from first-stranded to
// close) and EXCLUDED from the END bar's opportunities (a different
// mechanism's close). (4) Comparisons updated to r247's numbers
// throughout.
// R271 revisions vs r268: (1) Q1 STRANDED-CLOSE RE-PANEL — the
// bar now reads the re-panel: every stranded run must close within
// 2 dawns of first stranding on the fixed code (r268 menu fix +
// r269 MOOT-CLOSE, both live); a close is an endLog honest end OR
// a moot-close telemetry row (vid+kind match, day >= first
// stranded). r268 comparison: 2 stranded runs, 0/2 closed (NO-GO
// on pre-fix code). (2) Q2 MOOT-CLOSE LIVE — mootCloseTele rows
// counted panel-wide, joined to stranded runs; a moot-closed run
// must not reappear as stranded after its moot day. (3)
// SLEEP-RETRY totals — dayPhaseLog sleepRetry {tried, advanced}
// counted per seed and printed beside the desync line, so the
// panel can tell whether retries shrink the repeat+skip pairs.
// (4) Comparisons updated to r268's numbers throughout.
// Usage: node scripts/analyze-journey-establishment-r277-20261124.js <seed...>
//   EVID defaults to the goal hidden_files evidence dir for 2026-11-23.
'use strict';
const fs = require('fs');
const path = require('path');
const EVID = process.env.EVID || '/home/hatch/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-11-24';
const seeds = process.argv.slice(2).map(s => parseInt(s, 10));
if (!seeds.length) { console.error('usage: analyze-journey-establishment-r277-20261124.js <seed...>'); process.exit(2); }

function load(seed) {
  const p = path.join(EVID, `journey-establishment-r277-seed${seed}.json`);
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
    // R265: a stranded-close entry (BEARER-END — a dead bearer's run
    // closed by the successor) is NOT a broken-live END opportunity;
    // the STRANDED-close lines track it separately. Counting it here
    // would inflate the END bar by a different mechanism's close.
    if (t.strandedClose) continue;
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
let strandedSocial = 0, strandedNoSocial = 0, strandedBearerEnd = 0, strandedCommits = 0, strandedWorkFavor = 0, strandedDaysTotal = 0;
// R265 STRANDED-CLOSE: a stranded run whose bearer is dead is now
// closable (BEARER-END). strandedClosed counts runs closed by the
// successor's honest end (endLog 'ended'/'end-via-deliver' for the
// stranded vid after the first stranded day); strandedCloseDetail
// lists each close with days from first-stranded to close (bar: ≤2).
let strandedClosed = 0;
const strandedCloseDetail = [];
const strandedRunKeys = new Set();
// R271 MOOT-CLOSE (r269 fix, first live read): mootCloseTotal counts
// mootCloseTele rows panel-wide (an evicted favor's live joint run
// closed its books, 0 deposited); mootClosedStranded counts stranded
// runs closed by a moot row (vid+kind match, moot day >= first
// stranded day); mootReappear lists moot-closed runs that reappear
// as stranded after their moot day (a defect — the close did not
// hold); mootSeedLines list per-seed rows.
let mootCloseTotal = 0, mootClosedStranded = 0; const mootReappear = [], mootSeedLines = [];
// R242 Q5 MOOT-PATH panel counters.
let q5Exiles = 0, q5Heard = 0, q5Present = 0, q5Unheard = 0, q5UnheardAbsent = 0, q5SameDay = 0;
// R245 COUNTER WATCH (r244 metric review: comma-only): counterTotal
// counts COUNTER LEARNED say lines captured by the driver; counterProse
// lists labels containing ", " (a finding — the comma class the r244
// fix eliminates); counterEmdash lists labels containing an em/en dash
// (report-only watch — the r244 open item, same fix shape, not yet
// fired on any panel); counterOk lists guarded / proper-name labels.
// R265: REACT WATCH RETIRED for this leg (r246 metric review §3 —
// second live panel at max 1 on all 5 seeds, 0 sittings >= 3; the
// defect was a scale-leg shape). Computation + output removed.
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
let bowCraftTotal = 0; const bowSeedLines = [];
let bowGearTotal = 0; const bowGearSeedLines = [];
let warnTotal = 0, warnNamed = 0, warnDeepen = 0, warnAbsentSeeds = 0; const warnUnnamed = [], warnSeedLines = [], warnUnobserved = [];
let settledNamed = 0, settledBare = 0; const settledSeedLines = [];
let dryTotal = 0; const drySeedLines = [];
let selfWitTotal = 0, selfWitObservable = 0; const selfWitDetail = [];
let desyncTotal = 0; const desyncSeedLines = [];
// R265 SPOTTER CUMULATIVE second number + SILENT-ARRIVAL + WINPLAN.
let spotterCumulativeTotal = 0, spotterMaxSkillPanel = 0, spotterCumulativePresent = 0; const spotterSeedLines = [];
let arrivalTotal = 0, arrivalSilent = 0, arrivalNamed = 0, arrivalDescriptive = 0;
let winplanSeededSeeds = 0, winplanDepartedSeeds = 0, winplanDeparturesTotal = 0, winplanTriosTotal = 0, winplanQuadsTotal = 0;
let winplanSeedsTotal = 0, winplanReseedsTotal = 0, winplanExpiriesTotal = 0, winplanFightsTotal = 0;
let winplanLaunchBeats = 0, winplanExpiryBeats = 0, winplanReseedBeats = 0;
// R268 LAUNCHVOICE: depart beats ("sets out … — the fire marks the
// trail") counted separately from the re-seed "new trail" beats;
// winplanDepartBeatSeeds counts seeds with >= 1 depart beat (Q3 bar).
let winplanDepartBeats = 0, winplanDepartBeatSeeds = 0;
// R268 DAY-DESYNC PHASE ATTRIBUTION: desyncPhaseAttributed counts
// desync events joined to a dayPhaseLog entry whose phase deltas
// explain the jump; desyncPhaseUnattributed counts events with no
// phase explanation (diagnostic NO-GO if > 0); desyncPhaseDetail
// lists each event with its four phase deltas.
let desyncPhaseAttributed = 0, desyncPhaseUnattributed = 0; const desyncPhaseDetail = [];
// R271 SLEEP-RETRY: sleepRetryTried counts dayPhaseLog entries
// where the driver retried sleep after a refusal; sleepRetryWon
// counts retries that advanced the day (the repeat+skip pairs
// should shrink vs r268's 29 events if the retry works).
let sleepRetryTried = 0, sleepRetryWon = 0; const sleepRetrySeedLines = [];
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
// SPOTTER BAR: panel foodXp['spotter'] total >= 20 AND every panel
// seed contributes > 0 (was 0 on all 5 r138 seeds).
// LADDER BAR: >= 1 villager reaches 5 XP (skill 1) on >= 6/8 seeds.
// FASTER-ID BAR: threshold benefit fires on >= 4/8 seeds
// (NO-OPPORTUNITY if the scholar handles no plants — bumpCalls = 0).
let spotterTotal = 0, spotterSeedsPositive = 0, ladderSeeds = 0, fasterIdSeeds = 0;
// R274 GUARDRAILS (Q4): sums of the driver-emitted guardrails.* / c3.*
// per seed; judged on per-seed means vs the r274 journey-regime means.
let guardrailsPresent = 0, guardrailsDeaths = 0, guardrailsPop = 0, guardrailsPantry = 0, guardrailsStarv = 0;
const guardrailsSeedLines = [];
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
// R265 Q1 RATE-ONLY (r247 metric review §9 — the tenth fresh-band
// re-read closed the r231 settled-ledger fix's verification arc, so
// the per-sit classification, E1 split, LOST-ask and stage-0 lines
// are retired; the RATE (favorless sits / raised asks) stays as a
// standing guard). A favorless sit = a social sit that raised
// ask_favor but never attached a favor kind on any pick. The driver
// still records the trace FIELDS. favorlessRepeats counts repeat
// favorless asks per villager (a concentration read, not a class);
// favorlessReseeds counts contentless re-seeds after a favorless sit.
let favorlessTotal = 0, favorlessReseeds = 0;
const favorlessRepeats = {};
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
  if (d.guardrails) {
    guardrailsPresent++;
    guardrailsDeaths += d.guardrails.deaths || 0;
    guardrailsPop += d.guardrails.popAlive || 0;
    guardrailsPantry += d.guardrails.pantryKcal || 0;
    guardrailsStarv += (d.c3 || {}).starvationDeaths || 0;
    guardrailsSeedLines.push(`  seed ${seed}: deaths=${d.guardrails.deaths} popAlive=${d.guardrails.popAlive} pantryKcal=${d.guardrails.pantryKcal} starvationDeaths=${(d.c3 || {}).starvationDeaths}`);
  } else {
    guardrailsSeedLines.push(`  seed ${seed}: guardrails ABSENT (pre-r274 driver — schema-mismatch class, see run note)`);
  }
  if (seedSpotter > 0) spotterSeedsPositive++;
  if (seedLadder) ladderSeeds++;
  // R265 SPOTTER CUMULATIVE (r246 metric review §1): the binding bar
  // reads end-holding only, which scholar turnover zeroes. The second
  // number sums tenure-end XP (dead scholars' knowledge, kept in
  // spotterTenure) + end foodXp for persons who never held the role
  // (tenure persons are excluded — the final tenure entry IS their end
  // XP). Max skill reached comes from the bump log (skill before each
  // call). Absent on pre-r247 corpora — reported as such, not scored.
  if (d.spotterTenure) {
    spotterCumulativePresent++;
    const tenureVids = new Set(d.spotterTenure.map(t => String(t.vid)));
    let seedCumulative = 0;
    for (const t of d.spotterTenure) if (typeof t.spotterXp === 'number') seedCumulative += t.spotterXp;
    for (const fx of (d.foodXpEnd || [])) if (!tenureVids.has(String(fx.id))) seedCumulative += fx.spotter || 0;
    spotterCumulativeTotal += seedCumulative;
    const skills = (d.bumpLog || []).map(b => b.spotterSkill).filter(x => typeof x === 'number');
    const seedMaxSkill = skills.length ? Math.max(...skills) : 0;
    if (seedMaxSkill > spotterMaxSkillPanel) spotterMaxSkillPanel = seedMaxSkill;
    spotterSeedLines.push(`seed ${seed}: cumulative spotter ${seedCumulative} (end-holding ${seedSpotter}; tenures ${d.spotterTenure.map(t => `${t.name || t.vid}:${t.spotterXp ?? '?'}`).join(', ') || 'none'}); max skill ${seedMaxSkill}`);
  } else {
    spotterSeedLines.push(`seed ${seed}: cumulative spotter ABSENT — pre-r247 corpus (end-holding ${seedSpotter})`);
  }
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
  // R274 DEEPEN CLAUSE: the 4th+ heed deepens through the
  // dlg:heed:deepen pool (convo-dialogue.js, 5 lines + fallback),
  // which never calls convoWantWarning — so a deepened warning is
  // invisible to warnLog (r274 panel: Victor 109001 d36, heed 4,
  // "...I keep seeing it. Whatever it was, out past the treeline...").
  // The driver records heed/details lines in rec.heedLines; a sitting
  // with no warnLog delivery is NAMED-VIA-DEEPEN when a recorded heed
  // line matches a deepen-pool substring below. The generic ACK
  // fallbacks ("Good. I mean it — watch yourself out there." /
  // "Promise me that. Please." / "Thank you. I needed to hear you
  // say it.") match none of these, so a heed that fell back to
  // generic still reads UNNAMED — the r150 defect shape, unchanged.
  // On a pre-r274 corpus heedLines is absent, so the clause is inert
  // and every old-bar number reproduces.
  const DEEPEN_SUBS = ['walk out sure and not walk back', 'out past the treeline', 'You hear me, right? Not the words', 'laid awake listening', 'still have you here tomorrow'];
  const warnLog = (d.warnLog || []).filter(w => w && w.vid);
  const warnAbsent = !Array.isArray(d.warnLog);
  if (warnAbsent) { warnAbsentSeeds++; warnSeedLines.push(`seed ${seed}: warnLog ABSENT (pre-r246 JSON — instrument missing, not a finding)`); }
  for (const s of (d.wedgeSits || [])) {
    if (!(s.picks || []).some(p => p.wantId === 'warn_you')) continue;
    warnTotal++;
    const delivered = warnLog.some(w => String(w.vid) === String(s.vid) && w.day === s.day);
    if (delivered) warnNamed++;
    const engaged = (s.picks || []).some(p => p.id === 'dlg:heed' || p.id === 'dlg:details');
    const deepenLine = (!delivered && (s.heedLines || []).find(h => h && h.line && DEEPEN_SUBS.some(sub => String(h.line).includes(sub))));
    if (deepenLine) { warnDeepen++; warnNamed++; warnSeedLines.push(`seed ${seed} d${s.day} ${s.name || s.vid}: warn_you NAMED-VIA-DEEPEN — "${String(deepenLine.line).slice(0, 120)}"`); }
    if (warnAbsent) { if (engaged) warnUnobserved.push(`seed ${seed} d${s.day} ${s.name || s.vid}: warn_you engaged but warnLog absent — unobservable`); }
    else if (engaged && !delivered && !deepenLine) warnUnnamed.push(`seed ${seed} d${s.day} ${s.name || s.vid}: warn_you engaged (heed/details pressed) but no warning delivered`);
    else if (!engaged) warnSeedLines.push(`seed ${seed} d${s.day} ${s.name || s.vid}: warn_you sitting ended before engagement (${delivered ? 'warning delivered anyway' : 'no warning'})`);
  }
  // R246 SETTLED-FAVOR + DRY2 WATCHES (r265 / r256 fixes, first live
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
  desyncSeedLines.push(`seed ${seed}: loop-days ${dl.length}, game days ${dsFirst}→${dsLast}, net drift ${dsNet}, jitter repeats ${dsRepeats} skips ${dsSkips}${dsNet === -1 ? ' — ONE GAME-DAY SHORT (r245 101955 shape)' : (dsNet === 1 ? ' — ONE GAME-DAY LONG (daily-phase roll, see PHASE lines)' : '')}`);
  if (!Array.isArray(d.dayDesync)) desyncSeedLines.push(`seed ${seed}: driver dayDesync ABSENT (pre-r246 JSON — recomputation above is the diagnosis)`);
  else if ((d.dayDesync || []).length !== dsRepeats + dsSkips) desyncSeedLines.push(`seed ${seed}: driver dayDesync ${(d.dayDesync || []).length} vs recomputed jitter ${dsRepeats + dsSkips} — MISMATCH (investigate)`);
  // R268 DAY-DESYNC PHASE ATTRIBUTION (r265 metric review §3 — the
  // third recurrence of the −1 drift earns the clock-jitter
  // diagnostic): join each driver desync event to the dayPhaseLog
  // entry for its second loop day and read the four phase deltas
  // (parts = startDay→afterPartsDay, daily = afterPartsDay→
  // afterDailyDay, sleep = afterDailyDay→afterSleepDay, wedge =
  // afterSleepDay→daily day). A loop iteration advances the game day
  // by exactly +1 in total (the sleep); a repeat (total 0) names the
  // phase that advanced nothing where +1 was due, a skip (total 2)
  // names the phase that advanced twice (or two phases at +1 each
  // where only the sleep should have advanced). On a pre-r271 corpus
  // dayPhaseLog is absent — the lines below print nothing, so the
  // fork proof reproduces the old desync lines exactly.
  if (!Array.isArray(d.dayPhaseLog)) {
    if ((d.dayDesync || []).length) desyncPhaseDetail.push(`seed ${seed}: dayPhaseLog ABSENT (pre-r271 JSON — ${(d.dayDesync || []).length} desync event(s) unattributable on this corpus)`);
  } else {
    const phaseByLoop = Object.fromEntries(d.dayPhaseLog.map(ph => [ph.loopDay, ph]));
    for (const ev of (d.dayDesync || [])) {
      const curLoop = (ev.loopDays || [])[1];
      const ph = phaseByLoop[curLoop];
      const dailyCur = dl.find(x => x.loopDay === curLoop);
      if (!ph || !dailyCur) { desyncPhaseUnattributed++; desyncPhaseDetail.push(`seed ${seed}: ${ev.kind} ${ev.kind === 'repeat' ? 'd' + ev.day : 'd' + ev.from + '→d' + ev.to} loopDays [${(ev.loopDays || []).join(', ')}] — UNATTRIBUTED (no phase entry for loopDay ${curLoop})`); continue; }
      const dParts = (ph.afterPartsDay - ph.startDay);
      const dDaily = (ph.afterDailyDay - ph.afterPartsDay);
      const dSleep = (ph.afterSleepDay - ph.afterDailyDay);
      const dWedge = (dailyCur.day - ph.afterSleepDay);
      const total = dailyCur.day - ph.startDay;
      const jumped = [];
      if (dParts !== 0) jumped.push(`parts ${dParts > 0 ? '+' : ''}${dParts}`);
      if (dDaily !== 0) jumped.push(`daily ${dDaily > 0 ? '+' : ''}${dDaily}`);
      if (dSleep !== 1) jumped.push(`sleep ${dSleep > 0 ? '+' : ''}${dSleep}`);
      if (dWedge !== 0) jumped.push(`wedge ${dWedge > 0 ? '+' : ''}${dWedge}`);
      // R268 SLEEP-LINE JOIN: what sleep() actually said on the
      // event's game days — a refusal line on a sleep+0 day is the
      // mechanism; a "Sleep takes you" line on a sleep+1 day is the
      // confirmation. Absent on pre-instrument corpora (the pilot's
      // first run) — the phase attribution still stands without it.
      const slDays = ev.kind === 'repeat' ? [ev.day] : [ev.from, ev.to];
      const sl = ((d.sleepLines || []).filter(x => slDays.indexOf(x.day) !== -1).map(x => 'd' + x.day + ': ' + String(x.line).slice(0, 120)));
      const slTag = (d.sleepLines === undefined) ? 'sleep lines ABSENT (pre-r271-instrument JSON)' : (sl.length ? 'sleep: ' + sl.join(' | ') : 'sleep: no refusal/success line on the event days');
      const explained = (ev.kind === 'repeat' && total === 0) || (ev.kind === 'skip' && total === (ev.to - ev.from));
      if (explained && jumped.length) { desyncPhaseAttributed++; desyncPhaseDetail.push(`seed ${seed}: ${ev.kind} ${ev.kind === 'repeat' ? 'd' + ev.day : 'd' + ev.from + '→d' + ev.to} loopDays [${(ev.loopDays || []).join(', ')}] — phases startDay=${ph.startDay} parts ${dParts > 0 ? '+' : ''}${dParts} daily ${dDaily > 0 ? '+' : ''}${dDaily} sleep ${dSleep > 0 ? '+' : ''}${dSleep} wedge ${dWedge > 0 ? '+' : ''}${dWedge} (total ${total > 0 ? '+' : ''}${total}) — ${jumped.join(', ')} — ${slTag}`); }
      else { desyncPhaseUnattributed++; desyncPhaseDetail.push(`seed ${seed}: ${ev.kind} ${ev.kind === 'repeat' ? 'd' + ev.day : 'd' + ev.from + '→d' + ev.to} loopDays [${(ev.loopDays || []).join(', ')}] — UNATTRIBUTED (phases startDay=${ph.startDay} parts ${dParts > 0 ? '+' : ''}${dParts} daily ${dDaily > 0 ? '+' : ''}${dDaily} sleep ${dSleep > 0 ? '+' : ''}${dSleep} wedge ${dWedge > 0 ? '+' : ''}${dWedge}, total ${total > 0 ? '+' : ''}${total} does not match the event) — ${slTag}`); }
    }
  }
  // R271 SLEEP-RETRY totals from dayPhaseLog (read-only counts).
  if (Array.isArray(d.dayPhaseLog)) {
    const tried = d.dayPhaseLog.filter(ph => ph.sleepRetry && ph.sleepRetry.tried).length;
    const won = d.dayPhaseLog.filter(ph => ph.sleepRetry && ph.sleepRetry.tried && ph.sleepRetry.advanced).length;
    sleepRetryTried += tried; sleepRetryWon += won;
    if (tried) sleepRetrySeedLines.push(`seed ${seed}: sleep retries ${tried}, advanced the day ${won}`);
  }
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
  // R265 Q1 RATE-ONLY (r247 metric review §9): every social sit that
  // raised ask_favor but never attached a favor kind on any pick is a
  // favorless ask. Counted only — no per-sit classification, no E1
  // split, no LOST-ask, no stage-0 lines (retired, not stubbed).
  for (const s of socialSits) {
    const picks = s.picks || [];
    const raised = picks.some(p => p.wantId === 'ask_favor');
    if (!raised) continue;
    const kinded = picks.find(p => p.wantId === 'ask_favor' && p.wantFavorKind);
    if (kinded) continue;
    favorlessTotal++;
    const repKey = `${s.name || '?'} (${s.vid})`;
    favorlessRepeats[repKey] = (favorlessRepeats[repKey] || 0) + 1;
    const te = s.traceEnd || null;
    if (te && te.seedAfter && !te.seedAfter.favorId) favorlessReseeds++;
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
    if (social) strandedSocial++; else { const workFavor = (d.wedgeSits || []).some(s => s.day === day && s.mode === 'work'); if (workFavor) { strandedWorkFavor++; lines.push(`seed ${seed}: stranded d${day} with NO social sit — wedge working a live favor (not a miss)`); } else { const bearerEnd = sLog.filter(s => s.day === day).every(s => s.bearerDead); if (bearerEnd) { strandedBearerEnd++; lines.push(`seed ${seed}: stranded d${day} with NO social sit — bearer-end close (bearer dead; closes at Haven, not via a sit — excused)`); } else { strandedNoSocial++; lines.push(`seed ${seed}: stranded d${day} with NO social sit (accept/start) — BAR MISS`); } } }
  }
  const firstStrandedDay = sLog.length ? Math.min(...sLog.map(s => s.day)) : null;
  if (firstStrandedDay !== null) {
    strandedCommits += (d.commitLog || []).filter(c => c.ok && c.day > firstStrandedDay).length;
  }
  // R271 MOOT-CLOSE: per-seed rows + join to stranded runs. A moot
  // row's type maps to the run kind (forage return -> forage_help,
  // water return -> water_haul); its partner is the run's vid.
  const mootRows = (d.mootCloseTele || []);
  mootCloseTotal += mootRows.length;
  const mootKindOf = (t) => t === 'favor_forage_return' ? 'forage_help' : (t === 'favor_water_return' ? 'water_haul' : null);
  if (mootRows.length) mootSeedLines.push(`seed ${seed}: ${mootRows.length} moot-close(s): ${mootRows.map(r => `${r.type} partner=${r.partner} d${r.day}`).join('; ')}`);
  // R265 STRANDED-CLOSE: for each distinct stranded run, did the
  // successor's honest end close it? A close is an endLog entry with
  // outcome 'ended'/'end-via-deliver' for the stranded vid on or
  // after the run's first stranded day. Days from first-stranded to
  // close (bar: ≤2). On a pre-r265 corpus there are no closes — the
  // wedge never attempted the end — so the line reads 0 there, not a
  // miss. A stranded run still open at end is listed, not scored.
  // R271: a moot-close row (vid+kind match, moot day >= first
  // stranded) also counts as a close — the evicted run's books are
  // closed, 0 deposited. A moot-closed run that reappears as
  // stranded after its moot day is a defect (the close did not hold).
  for (const key of [...new Set(sLog.map(s => String(s.vid) + ':' + s.kind))]) {
    const [kvid, kkind] = key.split(':');
    const firstDay = Math.min(...sLog.filter(s => String(s.vid) === kvid && s.kind === kkind).map(s => s.day));
    const bearerDead = sLog.some(s => String(s.vid) === kvid && s.kind === kkind && s.bearerDead);
    const close = (d.endLog || []).find(e => String(e.vid) === kvid && (e.outcome === 'ended' || e.outcome === 'end-via-deliver') && e.day >= firstDay);
    const moot = mootRows.find(r => String(r.partner) === kvid && mootKindOf(r.type) === kkind && (r.day ?? 0) >= firstDay);
    if (close) {
      strandedClosed++;
      const gap = close.day - firstDay;
      strandedCloseDetail.push(`seed ${seed}: ${key} (bearer ${bearerDead ? 'DEAD' : 'living'}) closed d${close.day}, ${gap} dawn(s) after first stranded d${firstDay}${gap <= 2 ? '' : ' — OVER the 2-dawn bar'}`);
    } else if (moot) {
      strandedClosed++;
      mootClosedStranded++;
      const gap = (moot.day ?? firstDay) - firstDay;
      const reapp = sLog.some(s => String(s.vid) === kvid && s.kind === kkind && s.day > (moot.day ?? 0));
      if (reapp) mootReappear.push(`seed ${seed}: ${key} moot-closed d${moot.day} but stranded again after (defect — close did not hold)`);
      strandedCloseDetail.push(`seed ${seed}: ${key} (bearer ${bearerDead ? 'DEAD' : 'living'}) moot-closed d${moot.day}, ${gap} dawn(s) after first stranded d${firstDay}${gap <= 2 ? '' : ' — OVER the 2-dawn bar'}${reapp ? ' — REAPPEARED as stranded after the moot (defect)' : ''}`);
    } else {
      lines.push(`  STRANDED-OPEN seed ${seed}: ${key} (bearer ${bearerDead ? 'DEAD' : 'living'}) first stranded d${firstDay}, still open at end`);
    }
  }
  // Canned lines from this seed's convo transcript — R230 per-sitting
  // presence (see cannedDistinct): split on sitting headers; a needle
  // scores at most once per sitting block. Raw counts stay in
  // cannedTotals as the audit trail only.
  try {
    const txt = fs.readFileSync(path.join(EVID, `journey-establishment-r277-convo-seed${seed}.txt`), 'utf8');
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
  // R265 WINPLAN (PLANWAKE live): the raw-state snapshot — stats
  // counters + plan stages. Judged on planSeeds/partyDepartures/
  // plans, NEVER on ignited: the store now wakes on the first Haven
  // tick by design, so ignited reads true even with zero plans. A
  // null stats = the store never woke (instrument error post-fix).
  // partyDepartures > 0 is the first launch signal on this leg.
  if (d.winPlanEnd === undefined) lines.push(`  WINPLAN: ABSENT — pre-r247 corpus`);
  else if (!d.winPlanEnd) lines.push(`  WINPLAN: null (instrument error)`);
  else {
    const wps = d.winPlanEnd.stats || {};
    const dep = wps.partyDepartures || 0, trios = wps.partyTrios || 0, quads = wps.partyQuads || 0;
    const seeded = wps.planSeeds || 0;
    if (seeded > 0) winplanSeededSeeds++;
    if (dep > 0) winplanDepartedSeeds++;
    winplanDeparturesTotal += dep; winplanTriosTotal += trios; winplanQuadsTotal += quads;
    winplanSeedsTotal += seeded; winplanReseedsTotal += wps.planReseeds || 0; winplanExpiriesTotal += wps.planExpiries || 0;
    winplanFightsTotal += wps.partyFights || 0;
    const plans = (d.winPlanEnd.plans || []).map(pl => `${pl.name || pl.vid}:${pl.stage || '?'}${pl.target ? '/' + pl.target : ''}${pl.partySize ? ' party' + pl.partySize : ''}`).join(', ') || 'none';
    lines.push(`  WINPLAN: storeWoken=${!!d.winPlanEnd.stats} plans=[${plans}] stats={seeds:${seeded} invites:${wps.partyInvites || 0} departures:${dep} trios:${trios} quads:${quads} fights:${wps.partyFights || 0} reseeds:${wps.planReseeds || 0} expiries:${wps.planExpiries || 0} stageAdv:${wps.stageAdvances || 0} gearHolds:${wps.gearHolds || 0}}`);
    const lb = (d.winplanLines || []).filter(l => /new trail/i.test(l.line));
    const eb = (d.winplanLines || []).filter(l => /called off/i.test(l.line));
    const rb = (d.winplanLines || []).filter(l => /already put down/i.test(l.line));
    // R268 LAUNCHVOICE: the DEPARTBEAT depart line ("sets out … —
    // the fire marks the trail") — counted separately from the
    // re-seed "new trail" beats. A depart beat per launch, never
    // more: beats > departures on a seed would be a double-speak
    // defect, not a pass.
    const db = (d.winplanLines || []).filter(l => /sets out .* — the fire marks the trail/i.test(l.line));
    winplanLaunchBeats += lb.length; winplanExpiryBeats += eb.length; winplanReseedBeats += rb.length;
    winplanDepartBeats += db.length;
    if (db.length > 0) winplanDepartBeatSeeds++;
    if (db.length > dep) lines.push(`  WINPLAN DEPART-BEAT DEFECT: ${db.length} depart beats but only ${dep} departures — the dedup stamp double-spoke`);
    for (const l of (d.winplanLines || [])) lines.push(`  WINPLAN LINE d${l.day}: ${String(l.line).slice(0, 200)}`);
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
  // R274 SILENT-ARRIVAL WATCH (r246 metric review §11), MARKER JOIN:
  // end-members never in the start roster are arrivals. The driver's
  // rosterArrivals diff dates each one; a join with no arrivalLines
  // narration is SILENT — a blank, documented not landed. The r246 pair
  // (Lena Ruiz, Nathan Lee, 101961, d41-43) had no line anywhere.
  // The join voice is the marker "Haven grows by one" (membership.js
  // + betrayal.js visitor-invite + the descriptive generated-drifter
  // variants all end with it; trader/visitor lines lack it). The r271
  // NAME TEST is retired: the r271 JSONs prove the rosterArrivals name
  // and the end-census name are identical (nameOf at the dawn diff
  // already returns the learned first name) — the LINES are
  // descriptive for generated drifters ("a tired cook walks in",
  // "A frightened family cries — relief, mostly"), with no name in
  // the line at all. A marker line in the ±1-day window (line day =
  // diff day − 1, systematic — the line fires the day the person
  // walks in, the dawn diff sees them the next dawn) counts as
  // narrated, split into NARRATED-BY-NAME (line contains the
  // arrival's name) vs NARRATED-DESCRIPTIVE (marker present, no
  // name — the game spoke, descriptively). SILENT only when no
  // marker line is in the window.
  const arrivals = (d.census || []).filter(x => !startIds.includes(String(x.id)));
  arrivalTotal += arrivals.length;
  let seedSilent = 0;
  for (const a of arrivals) {
    const ra = (d.rosterArrivals || []).find(r => String(r.id) === String(a.id));
    const day = ra ? ra.day : null;
    const marker = (d.arrivalLines || []).filter(l => (day === null || l.day === day || l.day === day - 1) && String(l.line).includes('Haven grows by one'));
    const named = marker.filter(l => String(l.line).includes(a.name));
    const anyDay = (d.arrivalLines || []).filter(l => day !== null && (l.day === day || l.day === day - 1));
    if (!d.rosterArrivals) lines.push(`  ARRIVAL ${a.name} (${a.id}): day UNKNOWN (rosterArrivals ABSENT — pre-r247 corpus); marker lines: ${marker.length}`);
    else if (named.length) { arrivalNamed++; lines.push(`  ARRIVAL ${a.name} (${a.id}) d${day}: NARRATED-BY-NAME (${named.length} line(s)) — ${String(named[0].line).slice(0, 160)}`); }
    else if (marker.length) { arrivalDescriptive++; lines.push(`  ARRIVAL ${a.name} (${a.id}) d${day}: NARRATED-DESCRIPTIVE (${marker.length} line(s)) — ${String(marker[0].line).slice(0, 160)}`); }
    else { seedSilent++; arrivalSilent++; lines.push(`  ARRIVAL ${a.name} (${a.id}) d${day}: SILENT — no "Haven grows by one" line in the window${anyDay.length ? ` (${anyDay.length} arrival line(s) that day, none the join marker)` : ' (no arrival lines that day at all)'}`); }
  }
  lines.push(`seed ${seed}: arrivals=${arrivals.length} silent=${seedSilent}`);
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
console.log(`SPOTTER BAR (primary): panel foodXp['spotter'] total = ${spotterTotal} (bar: >= 20); seeds with > 0 = ${spotterSeedsPositive}/${seeds.length} (bar: every panel seed) — GO iff total >= 20 AND every seed > 0`);
console.log(`SPOTTER CUMULATIVE (r277 — r246 metric review §1, SECOND NUMBER beside the binding end-holding bar: tenure-end XP summed across scholars, so a turnover seed isn't read as no-knowledge; r274: panel cumulative 150, end-holding 93; r265: panel cumulative 54, end-holding 47): ${spotterCumulativePresent ? `panel cumulative ${spotterCumulativeTotal} (end-holding ${spotterTotal}); max skill reached on any seed ${spotterMaxSkillPanel}` : `ABSENT — pre-r247 corpus (end-holding ${spotterTotal})`}`);
for (const l of spotterSeedLines) console.log(`  ${l}`);
console.log(`LADDER BAR: ${ladderSeeds}/${seeds.length} seeds with >= 1 villager at 5+ spotter XP / skill 1 (bar: >= 6/8 panel seeds)`);
console.log(`FASTER-ID BAR: threshold benefit fired on ${fasterIdSeeds}/${seeds.length} seeds (${bumpBenefitTotal} benefit plays in ${bumpCallsTotal} bump calls; bar: >= 4/8 seeds; NO-OPPORTUNITY if bumpCalls = 0 on every seed)`);
console.log(`CODEX PLANTS (report-only): ${codexPlantsTotal} plants identified at end across ${seeds.length} seeds (fieldwork = field-click identifications)`);
console.log(`GUARDRAILS (r277 Q4 — driver-emitted guardrails.* / c3.* per seed; panel sums across ${seeds.length} seeds, per-seed means in parens; BAR: each mean within ±30% of the r274 journey-regime mean — deaths 42.9, popAlive 9.0, pantryKcal 35903/seed, starvationDeaths 0; the r132 sweep-regime baseline means — deaths 38, popAlive 11.25, pantryKcal 73248/seed — are INFO ONLY, different driver and seed count): deaths ${guardrailsDeaths} (${seeds.length ? (guardrailsDeaths / seeds.length).toFixed(1) : '?'}/seed), popAlive ${guardrailsPop} (${seeds.length ? (guardrailsPop / seeds.length).toFixed(1) : '?'}/seed), pantryKcal ${guardrailsPantry} (${seeds.length ? Math.round(guardrailsPantry / seeds.length) : '?'}/seed), starvationDeaths ${guardrailsStarv} — guardrails present on ${guardrailsPresent}/${seeds.length} seeds`);
for (const l of guardrailsSeedLines) console.log(l);
console.log(`STRANDED BAR: ${strandedDawns} stranded dawns on ${strandedRunKeys.size} runs; worked-on-stranded=${strandedWorked} (must be 0); guard fires=${guardFires}; social-sit dawns=${strandedSocial}/${strandedDaysTotal} (${strandedDawns} entries; misses=${strandedNoSocial}; bearer-end-excused dawns=${strandedBearerEnd}; wedge-working-a-live-favor dawns=${strandedWorkFavor}); new commits after first stranding=${strandedCommits} (NO-OPPORTUNITY if 0 stranded dawns — mechanism then carried by the proof test)`);
console.log(`STRANDED-CLOSE BAR (r277 Q1 RE-PANEL, FOURTH BAND — a stranded run must close within 2 dawns of first stranding on the fixed code, by honest end OR moot-close; r274: 1 stranded run, closed 0 dawns (GO); r268: 2 stranded runs, 0/2 closed — NO-GO on pre-fix code): ${strandedClosed}/${strandedRunKeys.size} stranded runs closed; GO iff every stranded run closed within 2 dawns`);
for (const d of strandedCloseDetail) console.log(`  ${d}`);
console.log(`MOOT-CLOSE (r277 Q2 — r269 fix; r274: 0 evictions (NO-OPPORTUNITY); a moot-closed run must not reappear as stranded after its moot day; NO-OPPORTUNITY if 0 evictions — mechanism then carried by the r269 proof test): ${mootCloseTotal} moot-close(s) panel-wide, ${mootClosedStranded} of them closing a stranded run; reappeared after moot: ${mootReappear.length}${mootReappear.length ? ' — DEFECT' : ''}`);
for (const l of mootSeedLines) console.log(`  ${l}`);
for (const l of mootReappear) console.log(`  ${l}`);
console.log(`END BAR: ${closedOps}/${allOps} broken-live forage opportunities closed within 2 dawns (qualifying only — excluded-tail / never-ready / bearer-changed not counted; NO-OPPORTUNITY seeds: ${noOppSeeds})`);
console.log(`THREAD BRANCH (carried watch): ${threadClosed}/${threadOps} paged (Yara-shape) opportunities closed within 2 dawns; ${pagedEndSits}/${totalEndSits} end sits paged (NO-OPPORTUNITY if 0 paged ops — mechanism then carried by the proof test)`);
console.log(`TRAVEL BRANCH: ${travelClosed}/${travelOps} clearable-blockage (Pablo-shape) opportunities closed within 2 dawns; ${clearSits}/${totalHomeSits} homeward sits hit a clearable blockage or cleared one (NO-OPPORTUNITY if 0 travel ops — mechanism then carried by the proof test)`);
console.log(`TRUST GUARD: ${trustDrops} trust drops on end presses (must be 0)`);
console.log(`JAM BAR (report-only): ${jamTotal} jam-days across panel (r84 panel: ~15 on seed 994 alone)`);
console.log(`VILLAGE BAR: ${villagePass}/${seeds.length} seeds alive at d40 (bar: >=6/8)`);
console.log(`Q2 SITTING CLOSES (revised, full-transcript bar): ${engineCut}/${totalSittings} CUT sittings (engine-ended, 0 closing beats after last THEM, no closing line); ${engineCutWithClosing} engine-ended WITH closing beats; ${noCloseOther} other no-close — GO iff 0 cut; WATCH 1-2 (read each in full); NO-GO >= 3 or an open-question cut`);
for (const d of engineCutDetail) console.log(`  ${d}`);
const f5Rates = wantSeedRates.filter(r => r.rate !== null);
const f5Min = f5Rates.length ? Math.min(...f5Rates.map(r => r.rate)) : null;
const f5Max = f5Rates.length ? Math.max(...f5Rates.map(r => r.rate)) : null;
const f5Shape = f5Min !== null && f5Min < 0.07 && f5Max !== null && f5Max > 0.15;
console.log(`Q1b WANT-RAISE (r221 Q1, standing guard — villagers must raise wants for the joint-favor wedge to have anything to accept): panel ${wantRaisedTotal}/${wantSitsTotal} social sits raised ask_favor (${wantSitsTotal ? (100 * wantRaisedTotal / wantSitsTotal).toFixed(1) : 'n/a'}%); any-want sits ${wantAnyTotal}/${wantSitsTotal}; zero-raise seeds ${wantZeroSeeds}/${seeds.length}; zero-raise + no-want seeds ${wantNoWantSeeds}/${seeds.length} (defect shape) — GO iff rate >= 10% AND no zero-raise seed; WATCH a zero-raise seed that shows other wants; NO-GO a zero-raise + no-want seed; F5 FLOOR: thinnest seed ${f5Min === null ? '?' : (100 * f5Min).toFixed(1) + '%'}, fattest ${f5Max === null ? '?' : (100 * f5Max).toFixed(1) + '%'} — thin<7% while fat>15% shape ${f5Shape ? 'RECURS (r233 thin 5.8–6.2%, r240 closed at 16.4% min, r241 thin 6.6%, r242 thin 6.5% (finding to build arm), r243 CLOSED at 10.3% min, r244 thin 7.4% pre-fix / 13.9% re-panel, r245 thin 14.9% fat 34.0% — no F5 floor shape; r246 thin 9.1% fat 34.3% — no F5 floor shape)' : 'absent on this band'}`);
for (const l of wantSeedLines) console.log(`  ${l}`);
console.log(`  ask_favor kinds panel: ${JSON.stringify(wantKindTotals)}`);
console.log(`Q1 FAVORLESS ASK — RATE-ONLY GUARD (r277 — r247 metric review §9: the per-sit classification, E1 split, LOST-ask and stage-0 lines are retired; the tenth fresh-band re-read closed the r231 verification arc): ${favorlessTotal} favorless sits of ${wantRaisedTotal} raised asks (${wantRaisedTotal ? (100 * favorlessTotal / wantRaisedTotal).toFixed(1) : 'n/a'}%; r274: 4/92 = 4.3%; r247 matched band: 0/41 = 0.0%; r265 matched band: 1/48 = 2.1%; r246 fresh band: 3/69 = 4.3%; r245: 4/70 = 5.7%; r244: 3/61 = 4.9% pre-fix, 0/60 re-panel; r243: 2/53 = 3.8%; r242: 2/70 = 2.9%; r241: 1/55 = 1.8%; r240: 1/70 = 1.4%; r233: 1/53 = 1.9%; r232: 2/77 = 2.6%; r231: 13/82 = 15.9%) — GO iff rate < 20%; WATCH rate 20-32.8%; NO-GO rate >= 32.8%`);
console.log(`  favorless repeats per villager: ${JSON.stringify(favorlessRepeats)}; contentless re-seeds after favorless sits: ${favorlessReseeds}/${favorlessTotal}`);
console.log(`Q5 EXILE WARNING HEARD (r277 — moot-path instrument + same-day fix, r274: 4 exiles all moot HEARD 3, PRESENT 1, UNHEARD 0; r265: 3 exiles all moot HEARD 3, PRESENT 0, UNHEARD 0; r246: 2 exiles both moot HEARD 2, PRESENT 0, UNHEARD 0; r245: 2 exiles both moot HEARD 2, PRESENT 0, UNHEARD 0; r244: 7 exiles pre-fix all moot HEARD 7, 3 exiles re-panel HEARD 3; r243: 4 exiles all moot, HEARD 3 PRESENT 1 UNHEARD 0, same-day 2): ${q5Exiles} exiles on the panel, paths ${JSON.stringify(q5ByPath)}; same-day open+resolve ${q5SameDay}; HEARD (advance notice) ${q5Heard}, PRESENT-at-sentencing ${q5Present}, UNHEARD ${q5Unheard}, UNHEARD-instrument-absent ${q5UnheardAbsent} (pre-r242 corpus — not silence evidence) — freeloader exile with no warning line = silent-exile defect trigger; UNHEARD moot exile = finding (documented + proposed); PRESENT-at-sentencing means the player was in the room and voted at the sentencing moot`);
console.log(`Q6 POLICY FORAGING (r246 — r233 F4 named question, report-only): scholar bumpCalls vs wedgeSits vs joint forage_help commits per seed (F4 shape = bumpCalls <= 2 with wedgeSits >= 50)`);
for (const l of q6Lines) console.log(l);
console.log(`COUNTER LABEL WATCH (r277 — comma-only per r244 metric review; judged on COUNTER LEARNED say lines; r274: 189 lines, 0 comma-clause, 0 em-dash; r265: 141 lines, 0 comma-clause, 0 em-dash; r246: 100 lines, 0 comma-clause, 0 em-dash; r245: 110 lines, 0 comma-clause, 0 em-dash; r244: 111 lines pre-fix with 5 real comma-clause, 90 lines re-panel with 0): ${counterTotal} COUNTER LEARNED lines, ${counterProse.length} comma-clause labels (FINDING if > 0), ${counterEmdash.length} em-dash labels (watch only), ${counterOk.length} guarded/proper-name labels`);
for (const l of counterProse) console.log(`  COMMA-CLAUSE LABEL — ${l}`);
for (const l of counterEmdash) console.log(`  em-dash label (watch) — ${l}`);
for (const l of counterOk) console.log(`  ok — ${l}`);
console.log(`REACT WATCH — RETIRED for this leg (r277 — r246 metric review §3: the defect was a scale-leg shape; kept on scale only).`);
console.log(`BOWCRAFT WATCH (r277 — gear-count per r245 metric review: bows counted in the end-census equipped lists; r274: 22 bows equipped; r265: 20 bows equipped; r246 corpus: crude_bow x4, bow x3, crossbow x3 = 10; r245 corpus: crude_bow x3, bow x3, crossbow x1 = 7; telemetry /bow/i scan kept as the secondary line — its 0 is the blind-scan confirmation, not a finding): ${bowGearTotal} bows equipped panel-wide; ${bowCraftTotal} bow-key telemetry events panel-wide`);
for (const l of bowGearSeedLines) console.log(`  ${l}`);
for (const l of bowSeedLines) console.log(`  ${l}`);
console.log(`WARN-HEED WATCH (r277 — r150 fix; r274: 39 sittings, 16 delivered (1 via the deepen arc), 0 engaged-unnamed; r265: 20 sittings, 4 delivered, 0 engaged-unnamed; r246: 8 sittings, 5 delivered, 0 engaged-unnamed — all 8 sittings one voice (Tom, 101965); GO = every engaged warn_you sitting names a danger): ${warnTotal} warn_you sittings, ${warnNamed} with a warning delivered (${warnDeepen} via the deepen arc); ${warnUnnamed.length} engaged sittings with NO warning delivered (FINDING if > 0)${warnAbsentSeeds ? `; warnLog absent on ${warnAbsentSeeds} seeds — ${warnUnobserved.length} engaged sittings unobservable (not findings)` : ''}`);
for (const l of warnSeedLines) console.log(`  ${l}`);
for (const l of warnUnnamed) console.log(`  WARN-HEED FINDING — ${l}`);
for (const l of warnUnobserved) console.log(`  ${l}`);
console.log(`SETTLED-FAVOR WATCH (r277 — r247 fix; r265: 0/0, no opportunity; r246: 0/0, no opportunity; report-only): ${settledNamed} named "It's already handled — {short}" lines, ${settledBare} bare lines`);
for (const l of settledSeedLines) console.log(`  ${l}`);
console.log(`DRY2 WATCH (r277 — r256 fix; r265: 0 dry lines; r246: 0 dry lines; report-only, expect 0): ${dryTotal} "lost my train of thought" lines`);
for (const l of drySeedLines) console.log(`  ${l}`);
console.log(`SELFWIT WATCH (r277 — r258 fix; r265: 0 observable; r246: 0 observable — no death carried a witness list; report-only; victim in own witness list is a defect finding): ${selfWitTotal} self-witness ambush deaths (${selfWitObservable} deaths carried a witness list — the observable denominator)`);
for (const l of selfWitDetail) console.log(`  SELFWIT FINDING — ${l}`);
console.log(`DAY-DESYNC (r277 — r265 metric review §3 diagnostic: third recurrence of the −1 drift; r265: net drift −1 on seed 101970, 8 jitter repeats / 7 skips; r247: net −2; r245 seed 101955: d40 missing, d42 doubled; net drift recomputed from the daily arrays, driver summary cross-checked when present): net drift ${desyncTotal} across the panel (0 = clock jitter only; -1 per seed = one game-day short); phase attribution ${desyncPhaseAttributed} attributed / ${desyncPhaseUnattributed} unattributed — GO iff every desync event is attributed AND at least one mechanism is named; SLEEP-RETRY (r277 driver): ${sleepRetryTried} retries, ${sleepRetryWon} advanced the day (r274: 88 retries, 86 advanced; net drift +1/seed from the opening-days daily-phase roll)`);
for (const l of sleepRetrySeedLines) console.log(`  ${l}`);
for (const l of desyncSeedLines) console.log(`  ${l}`);
for (const l of desyncPhaseDetail) console.log(`  PHASE — ${l}`);
console.log(`SILENT-ARRIVAL WATCH (r277 — r246 metric review §11; MARKER JOIN: "Haven grows by one" in the ±1-day window; r271 name test retired — the r271 corpus re-reads 1 named + 3 descriptive, 0 SILENT; r274: 1 arrival, NARRATED-BY-NAME, 0 SILENT; r246: 2 silent joins on 101961, d41-43, no line anywhere): ${arrivalTotal} arrivals on the panel, ${arrivalNamed} NARRATED-BY-NAME, ${arrivalDescriptive} NARRATED-DESCRIPTIVE, ${arrivalSilent} SILENT (a silent join is a blank — documented, not landed)`);
console.log(`WINPLAN (r277 — PLANWAKE live + LAUNCHVOICE; judged on planSeeds/partyDepartures/plans, NEVER on ignited — the store now wakes on the first Haven tick by design; r274: planSeeds 21, partyDepartures 69, plans 8/8 seeds, 66 depart beats; r265 matched band: planSeeds 14, partyDepartures 57, plans 5/5 seeds, 0 depart beats; r247 matched band: planSeeds 0, partyDepartures 0, plans 0): plans seeded on ${winplanSeededSeeds}/${seeds.length} seeds (planSeeds ${winplanSeedsTotal}); partyDepartures ${winplanDeparturesTotal} on ${winplanDepartedSeeds}/${seeds.length} seeds (trios ${winplanTriosTotal}, quads ${winplanQuadsTotal}); partyFights ${winplanFightsTotal}; reseeds ${winplanReseedsTotal}; expiries ${winplanExpiriesTotal}; launch beats "new trail" ${winplanLaunchBeats} (DEPARTBEAT default-ON this base); expiry beats "called off" ${winplanExpiryBeats}; reseed beats "already put down" ${winplanReseedBeats}; DEPART beats "sets out — the fire marks the trail" ${winplanDepartBeats} on ${winplanDepartBeatSeeds}/${seeds.length} seeds — GO iff planSeeds > 0 on ≥1 seed AND partyDepartures > 0 on ≥1 seed; Q3 LAUNCHVOICE GO iff depart beats > 0 on ≥1 seed AND beats ≤ departures on every seed`);
console.log(`Q3 RECAP PARAPHRASE (report-only, per-sitting presence, R230 revision): distinct=${cannedDistinct['recap-paraphrase']} of ${totalSittings} sittings (raw ${cannedTotals['recap-paraphrase']}) — report-only iff < 6 distinct; OVER-REPRESENTED iff >= 6 distinct (second formulation owed)`);
console.log(`R214 PARTING POOL (report-only, in-the-wild serves, distinct): see=${cannedDistinct['parting-plain-see']} care=${cannedDistinct['parting-plain-care']} tomorrow=${cannedDistinct['parting-plain-tomorrow']} (raw see=${cannedTotals['parting-plain-see']} care=${cannedTotals['parting-plain-care']} tomorrow=${cannedTotals['parting-plain-tomorrow']})`);
console.log(`Q3 CANNED LINES (report-only, r135 watch, distinct/raw): ${CANNED.map(([k]) => `${k}=${cannedDistinct[k]}/${cannedTotals[k]}`).join(' ')} pod-dream-open=${podDreamOpen} (r210 panel: paraphrase=2 walked-in=0, rest 0 across 5 convo files; r225 distinct: paraphrase=4 walked-in=3; r230 distinct: paraphrase=2 walked-in=0; r240 distinct: paraphrase=2 walked-in=0; r241 distinct: paraphrase=2 walked-in=1 take-it=1; r242 distinct: paraphrase=1; r243 distinct: paraphrase=0; r244 distinct: paraphrase=1 pre-fix, 0 re-panel; r245 distinct: paraphrase=2; r246 distinct: paraphrase=2)`);
