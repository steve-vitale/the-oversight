# sim-belongcost-b — belongfeast PD=1 cost concentration DIAG (measurement only)

Run: oversight-flesh-out-loop-b-20261024T1130Z (cron), axis food-economy.
Worker tree: ~/workspace/worktrees/sim-belongcost-b.
ADOPTED by run oversight-flesh-out-loop-b-20261024T1330Z, worker tree
~/workspace/worktrees/sim-belongcost-adopt-b — see "## Adoption" below.
The pre-registration below is the dead run's, carried verbatim; it binds
this completion exactly as written.
DIAG arm: claims backlog #889. ZERO src/js changes. No new lever — the
measurement instrument is the only change (death-row/transcript retention).

## Adoption (sim-belongcost-adopt-b, 2026-10-24, run fleshout-loop-b-20261024T1330Z)

The 1130Z run died mid-pilot (EPERM flap on the pd0-dg1-belongfeast
first-seed write, then executor end). Its tree
~/workspace/worktrees/sim-belongcost-b was treated as READ-ONLY reference:
never modified, never committed from. Copied verbatim into this tree:
scripts/sweep-belongcost-b.js, scripts/analyze-belongcost-b.js,
scripts/test-belongcost-b.js (reference only — its P8 targets the dead
runner path, so it is superseded here, not run), the dead draft of this
evidence file, and the 18 complete per-seed JSONs + 3 sweep summaries
(belongfeast dg0 both pd, 16 files; leadfeast dg1 pd0 s94101-94102,
2 files). The dead tree's 0-byte `.tmp-32774` partial was NOT copied
(discarded, as briefed).

INVENTORY VERIFIED (before any new sim): every copied per-seed file
parses, is nonzero, and retains deathRows {day, who, whoName, kind,
cause, ctx, sayWin, teleWin} + daySeries. Confirmed missing/invalid:
belongfeast dg1 both pd (16 seed-configs), leadfeast dg1 pd0
s94103-94108 (6), leadfeast dg1 pd1 all (8) — exactly the briefed set;
seed band 94101-94108 and the 6-cell list confirmed against the dead
evidence/scripts, no discrepancy.

COMPLETED ONLY THE MISSING 30 SEED-CONFIGS. No complete config was
re-run. New runner scripts/run-belongcost-adopt-b.sh (the dead runner
re-ran whole cells when a summary was short; this one runs only missing
seeds and lets the sweep's own by-seed merge rebuild summaries — the
leadfeast pd0 dg1 summary merged 2 old + 6 new rows to 8). Sweep
stdout/stderr streamed to the pipe, never redirected to a file;
per-seed JSONs written straight into this tree's corpus dir, never
/tmp. All 4 missing cells verified on attempt 1 — no process-level
WRITE FAIL occurred in this run, but EPERM write waits stretched the
30-seed completion to ~40 min wall (sim time is ~2s/seed; the rest is
writeRobust retry waits). No write was forced, no ref surgery.

Instrument proof (this tree): scripts/test-belongcost-adopt-b.js —
18/18 green, including a live 100d determinism leg (belongfeast pd0
dg0 s94101 re-run into a scratch dir, deleted afterwards: deathRows
count + cause multiset + daySeries length identical to the adopted
corpus file) and the missing-seed computation legs (leadfeast pd0 dg1
missing = 94103-94108; belongfeast pd0 dg0 complete; belongfeast pd1
dg1 all missing). Analyzer: scripts/analyze-belongcost-b.js, report
evidence/2026-10-24/belongcost-b-analyzer-report.txt (this tree).

## Canon

READ docs/CANON.md first, then docs/PRESERVATION.md (the food ladder — the
plenty-depri throttle sits on the production side of the ladder, easing
hauling when the pantry reads plentiful so the glut doesn't rot). **No
canon doc covers plentydepri's tradeoff** — the tradeoff is a measured
property of the landed lever, not a designed value (pdtradeoff-b,
pdvalue-b). Documented here, not invented. No canon doc covers a
belongfeast-specific PD=1 cost mechanism either; if the chains below
name one, it is a measurement finding, not canon.

## The question (backlog #889, from sim-pdvalue-b LEVER verdict)

pdvalue-b (fresh seeds 94001-94008, 64 configs) passed its rot primary
4/4 but failed guardrails on belongfeast only: starvation +0.020/100vd
(belongfeast dg0, on the bar) and +0.053/100vd (belongfeast dg1), plus
NEW death modes (dehydration, alien — kinds absent from control) on
belongfeast cells, while leadfeast passed clean — with no transcript
explaining the payment. This arm asks ONLY why those belongfeast deaths
happen. It does NOT re-litigate the PD=1 value verdict and does NOT
re-score its guardrails.

## BRANCH DECISION (step 1: offline corpus inspection)

OFFLINE CORPUS: BLIND. The pdvalue pilot corpus
(evidence/2026-10-24/pdvalue-b-corpus/, 64 per-seed JSONs + 8 sweep
summaries) retains ONLY aggregate `deathCauses` counts per run (e.g.
pd1-dg0-belongfeast-s94003: dehydration 3, no names/days; pd1-dg1-
belongfeast-s94003: alien 2, dehydration 1, no names/days). The sweep
instrument (scripts/sweep-pdvalue-b.js) aggregated the harness death
capture (`W.deaths`, day/kind/who/cause) into counts and discarded the
rows; no transcripts, no per-death pantry/water state, and no say/tele
window were retained in any per-seed or sweep file (verified by key
inspection of all 72 corpus files). The offline attribution the brief
allows as step 1 is therefore IMPOSSIBLE from this corpus — no death
can be attributed to a named chain from counts alone.

BRANCH TAKEN: FRESH PILOT (step 2). A fresh paired pilot with
death-row/transcript retention instrumented BEFORE sweeping. No new
sims were run before this branch decision; the offline inspection above
is the whole step-1 record.

## PRE-REGISTRATION (bound per §14 — a miss is NO-GO, never re-scored)

- Substrate: FEASTSCALE_R13=1, SEATDRIVE=0 (asserted FATAL in every
  script), 100d death-aware horizons (dead villages stop; +10d tail max),
  policies {belongfeast, leadfeast}. SEATDRIVE=0 is the pre-seat regime:
  wins are structurally 0 — said here, not chased.
- Cells: belongfeast x {pd0,pd1} x {dg0,dg1} (the failing cells) PLUS
  leadfeast x {pd0,pd1} x dg1 as control contrast (dg1 only: pdvalue's
  leadfeast cells both passed, and dg1 is the cell where the pdvalue
  guardrail starvation delta on leadfeast was largest, +0.019 — the
  closest-to-failing clean cell, hence the sharpest contrast; dg0
  omitted by design, stated here, not silently narrowed). 6 configs.
- Seeds: PILOT ONLY 94101-94108 (8 fresh seeds). 6 configs x 8 seeds =
  48 configs. NO CONFIRM: this is a DIAG read; a confirm would be a
  separate run's decision. The runner (scripts/run-belongcost-b.sh)
  mechanically REFUSES any seed list other than the pilot band, and
  refuses to run when a NO-GO/DIAG-NO-GO report exists in the evidence
  file — the pdvalue 1030Z anomaly (a confirm launched after a kill)
  must be mechanically impossible here, not procedurally discouraged.
- C1 freshness: band 94101-94108 verified absent from ALL corpora
  (per-seed "seed" fields in this worktree's corpus dirs, sibling
  trees' 2026-10-24 evidence filenames, pooled blocks 9250-9265,
  92801-92816, 92831-92846, pdvalue 94001-94008 and its aborted confirm
  band 94011-94026). The analyzer re-asserts C1 and aborts on any hit.
- DEATH-ROW INSTRUMENT (the only instrument change vs pdvalue-b,
  declared here): per config the sweep retains, alongside the pdvalue
  schema fields: (a) every death row {day, who-id, who-name, kind,
  cause} as captured by the inherited registerDeath wrapper (kept
  byte-identical in capture semantics, including its no-call-through
  behavior shared by the whole sweep family — see Metric review, this
  is a shared-arm confound, not a belongcost invention); (b) a
  per-death context snapshot taken at capture time {pantryFreshDays,
  pantryKcalLive, roster size, hungry count (npcNeeds hunger>70),
  7d freshDays trail, 7d hungry trail, cumulative depri decisions/kcal
  to that day, cumulative DG shareEased to that day}; (c) a transcript
  window per death {last 8 Game.say lines, last 8 tele events} —
  truncated 170 chars. Daily series {day, pop, hungry, freshDays,
  pantryKcal} retained per config. Nothing else changes: rot capture,
  inflow channels, DG ledger, FATAL env asserts, death-aware horizons,
  writeRobust EPERM handling are byte-identical to pdvalue-b.
- ATTRIBUTION CHAINS (named BEFORE sweeping; a death counts as
  attributed only if it matches a chain AND its transcript window
  names the mechanism or its context is unambiguous):
  - C1 PANTRY-EMPTY STARVATION: cause starvation AND pantryFreshDays
    <= 1 at death AND hungry count >= 1.
  - C2 EASE-SHORTFALL STARVATION: cause starvation AND depri easing
    active in the prior 7d (depri decisions > 0 in window) AND
    pantryFreshDays <= 4 (the plentiful-sensor threshold).
  - C3 WATER-SHORTFALL DEHYDRATION: cause dehydration AND (say/tele
    window mentions water/thirst/drink, OR pantryFreshDays <= 1 with
    hungry count >= 1 — thirst with an empty pantry is the same
    shortfall family, stated here).
  - C4 ALIEN-CONTACT: cause alien/alien_beam (or a monster kind) AND
    tele window names alien/monster contact for that villager in the
    prior 7d, OR the death row itself carries an alien killer context.
  - U UNATTRIBUTED: no chain matches, or the window is empty/silent.
    U deaths are reported as unattributed, never forced into a chain.
- EXCESS DEFINITION: per belongfeast cell and cause kind, excess =
  max(0, PD1 deaths - PD0 deaths) on identical seeds; total excess E =
  sum over belongfeast cells x kinds {starvation, dehydration, alien}.
  Attributed A = number of PD1 deaths in those cell/kind buckets that
  match chains C1-C4, capped at the bucket's excess (a bucket cannot
  contribute more attributed deaths than its excess).
- DIAG-GO iff A/E >= 0.80 AND E > 0 (the excess reproduces on fresh
  seeds AND >=80% of it carries a named mechanism chain with
  transcript/context support). DIAG-NO-GO iff A/E < 0.80, OR E = 0
  (the pdvalue excess does not reproduce on fresh seeds, so there is
  nothing to attribute — the question is unanswerable on this pilot,
  reported as NO-GO on the attribution claim, not as a cleared lever),
  OR the corpus is blind again (instrument failure). A miss is NO-GO,
  never re-scored against a friendlier chain or denominator mid-run.
- WATCH (report-only): wall numbers per cell (national/table/wins,
  wave 1-5 unlocks, median/max survival), death-cause shares,
  PD=1-vs-PD=0 deltas, villager behavior (SENSE-TESTING LAW: transcripts
  read, beats quoted — never just counts).
- Instruments: scripts/sweep-belongcost-b.js (derived from
  scripts/sweep-pdvalue-b.js with the declared deltas above),
  scripts/analyze-belongcost-b.js (attribution analyzer; C1 gate,
  excess/attribution arithmetic, per-death table),
  scripts/test-belongcost-b.js (proof: derivation, determinism,
  schema, FATAL asserts, analyzer exit semantics, C1, runner
  confirm-refusal), scripts/run-belongcost-b.sh (pilot-only runner).
  Instruments namespaced belongcost-*.
- Balanced panel per §15: env-gated -> the documented #797 "Unmatched
  flags" invalidity by construction (as in pdtradeoff/pdvalue); the
  verdict is judged on the analyzer's manual paired rows. The metric is
  NOT re-scored.

## Metric review (pre-sims)

- The registerDeath wrapper inherited from the sweep family replaces
  Game.registerDeath WITHOUT calling through: death side-effects
  (corpse/deed/grief bookkeeping in corpses.js) are suppressed in BOTH
  arms of every config in this sweep family, including pdvalue. That
  is a shared-arm confound: paired PD0/PD1 comparisons within this
  sweep remain valid (both arms share it), but absolute death rates
  here are not directly comparable to runs using a call-through
  instrument, and grief-mediated knock-ons are absent by construction.
  Stated here so no reader mistakes a suppressed grief chain for a
  finding. Changing the wrapper would break comparability with the
  pdvalue design; it is NOT changed.
- npcNeeds carries hunger/fear/social/energy only — there is NO thirst
  field to snapshot. Dehydration attribution therefore rests on cause
  + transcript window + pantry context (chain C3), and a silent
  dehydration death lands in U honestly.
- Death rows carry villager IDs (gen_*); display names are resolved
  via Game.npcName at capture time when available, else "Someone".
  IDs are reported in the table only where the name is unavailable.
- The analyzer's ms field is never byte-compared (pdvalue metric
  review: wall-clock ms gap). Trajectories are compared, not timings.
- MID-PILOT INSTRUMENT AMENDMENT (2026-10-24, pre-analysis — the
  pilot was incomplete, no verdict rendered, so this amends the
  pre-registration rather than re-scoring anything): writeRobust retry
  budget raised 60 -> 300 attempts (declared delta 5 in the sweep
  header). Cell pd0-dg1-belongfeast failed its first-seed write on
  four consecutive fresh-process attempts, each burning the full 120s
  budget inside one EPERM-flap window, while direct spot writes from
  other processes succeeded between windows. UNPROVEN: the first
  300-budget run (post-reconstruction test P2) ALSO burned the full
  ~10min budget and failed on the same file — flap windows can exceed
  10min, so the budget raise is retained but not claimed as the fix;
  fresh-process retry + waiting out windows is the mitigation.
  The same flap then TRUNCATED the sweep script itself to 0 bytes
  (a plain open('w') + write during a window) — recovered by
  re-derivation from scripts/sweep-pdvalue-b.js via stdout capture
  (no file writes) and re-writing through the file tools, verified
  byte-identical (20517 bytes, node --check clean) against the
  derivation. Lesson recorded for the coordinator: never patch a
  sweep script with a truncating open during a flap — derive to
  stdout and verify bytes. The retry-budget change does not affect
  any output field (per-seed JSONs carry no retry info; diag ms is
  never compared), so corpus files written before the amendment stay
  valid and comparable.

## Results

COMPLETE PILOT (8 fresh seeds 94101-94108, 48 configs, 100d
death-aware, FEASTSCALE_R13=1/SEATDRIVE=0, policies {belongfeast,
leadfeast}). Full analyzer output:
./belongcost-b-analyzer-report.txt. Wins are structurally 0 on every
cell (SEATDRIVE=0, pre-seat regime — said in pre-reg, not chased).

EXCESS (belongfeast, PD1−PD0 on identical seeds, cost kinds only —
the pre-registered verdict arithmetic, NOT re-scored):

| cell | starvation | dehydration | alien |
|---|---|---|---|
| belongfeast dg0 | PD0 7 → PD1 3, excess 0 | 1 → 1, excess 0 | 1 → 0, excess 0 |
| belongfeast dg1 | PD0 5 → PD1 2, excess 0 | 1 → 0, excess 0 | 0 → 2, excess 2 |

TOTAL excess E=2, attributed A=1, rate 0.500 (bar ≥0.80).
CONTROL CONTRAST (leadfeast dg1): starvation 4 → 2 (excess 0),
dehydration 0 → 0, alien 2 → 1 (excess 0).

THE PDVALUE STARVATION/DEHYDRATION EXCESS DID NOT REPRODUCE. On
fresh seeds, belongfeast PD=1 starvation is LOWER than PD=0 on both
dg cells in raw counts (7→3, 5→2) and in exposure-normalized rates
(watch-only, not the verdict metric): dg0 0.116 → 0.050/100vd, dg1
0.073 → 0.029/100vd; leadfeast dg1 likewise 0.060 → 0.027/100vd.
Dehydration is flat or down (dg0 1→1, dg1 1→0). There is no
belongfeast starvation/dehydration cost left to attribute on this
pilot — the question's premise fails on the starvation/dehydration
half, and that half is reported as unreproduced, not as cleared.

THE ONLY EXCESS IS 2 ALIEN DEATHS, BOTH ON ONE SEED (94108),
belongfeast pd1 dg1:

- d60 Nikolai (alien, C4 per the analyzer): pantry 5,200 kcal,
  fresh 2.1d, pop 6, hungry 0, depriDec7d 0. The analyzer's C4 match
  rests SOLELY on a tele trust line about ANOTHER villager —
  "hannah_kim stood down a monster and walked home" (d59) — not on
  any alien/monster contact named for Nikolai. His own window is a
  food-spiral story (d59 "WARNING: reserves critical. Eat tomorrow
  or the spiral begins", "You camp wild tonight — no pantry meal",
  acorns spoiled, a stranger's cache gift "— W."). The death row
  asserts cause=alien; the transcript never shows Nikolai meeting
  anything alien. This is a WEAK match, flagged honestly: the
  analyzer's regex counts it, the causal read does not trust it.
- d68 Hannah (alien, U): pantry 7,246 kcal, fresh 3.4d, pop 4,
  hungry 0, depriDec7d 0. Window: sleeping rough, "Word gets around
  the haven. Whatever that thing was — everyone's talking about it
  now", "Hannah is calling it 'Big Big.'" No alien/monster contact
  is ever named — the village itself does not know what the thing
  is. Unattributed, correctly.

SEED-LEVEL CONTRAST KILLS THE LEVER STORY FOR THE ALIEN EXCESS:
seed 94108 is a bloodbath in EVERY dg1 arm (14–16 deaths each,
combat-dominated), and alien deaths appear on it in THREE of four
arms — belongfeast pd1 (2), leadfeast pd0 (2: Hannah d54, Dieu
d78), leadfeast pd1 (1: Hannah d62) — and 0 in belongfeast pd0.
Hannah dies alien on this seed under three different policies on
three different days. That is a seed property (an alien-heavy world),
not a PD=1 belongfeast channel. The 0→2 "excess" is the control arm
of one policy happening to draw 0 on a seed where the other policy
drew 2.

THE U STARVATIONS ARE THE SAME STORY IN MINIATURE. Three PD=1
belongfeast starvations fail every chain because the pantry was
FULL: Pavel d31 (fresh 17d, 23,881 kcal, hungry 0, depriDec7d 7),
Sidney d13 (fresh 12.1d, 21,200 kcal, hungry 0, depriDec7d 7),
Luna d19 (fresh 11.6d, 23,490 kcal, hungry 0, depriDec7d 7). But the
pattern is NOT PD-specific: leadfeast pd0 dg1 has Norman d23
(starvation, fresh 17.3d, 22,300 kcal, hungry 0, depriDec7d 0) and
belongfeast pd0 dg1 has Sam d61 (fresh 8d, 42,261 kcal, hungry 2).
An individual starving while the pantry holds 21–42k kcal, with
nobody else hungry, happens in both arms — it is a baseline
distribution/away-individual phenomenon (Luna's own window shows
her camping wild — "You camp wild tonight — no pantry meal" —
while the haven talks over full shelves), not a PD=1 cost. The
depriDec7d=7 correlation in the PD=1 cases is what PD=1 looks like
when it runs constantly (depriK 40–176k across these runs), not
evidence depri caused these deaths — C2's fresh≤4 gate correctly
refuses them, and the PD0 cases refuse any depri story outright.
The two chain-matched starvations that DO exist are ordinary
shortfall deaths, not a belongfeast-specific mechanism: Ciro d29
(C1: pantry 0 kcal, fresh 0, hungry 1, village down to pop 8 with
fresh trail 2.5→0) and Theo d87 (C2: fresh 3.1d, 14,589 kcal, 1
depri decision in 7d — a thin C2, noted as such; his window shows
a village meal served the same day he starved, the same
individual-vs-pantry gap as the U cases).
Norman's dehydration (dg0, C3 via the "DEHYDRATED: find and treat
water today" window line) is a named water failure, but it is 1
death matched against a PD0 dehydration count of 1 — no excess.

WALL NUMBERS (per cell, out of 8 — analyzer; national / table+wins /
wave≥4 / wave≥5 / median / max survival):
- belongfeast pd0 dg0: 4 / 0 / 4 / 0 / 92d / 100d
- belongfeast pd1 dg0: 4 / 0 / 2 / 0 / 98.5d / 100d
- belongfeast pd0 dg1: 4 / 0 / 4 / 0 / 100d / 100d
- belongfeast pd1 dg1: 5 / 0 / 4 / 0 / 100d / 100d
- leadfeast pd0 dg1: 5 / 0 / 3 / 0 / 100d / 100d
- leadfeast pd1 dg1: 6 / 0 / 7 / 0 / 100d / 100d
No wave 5 anywhere, no table anywhere (structural). Pooled
death-cause shares: combat 53.1% (241), sickness 12.8% (58),
monster 10.4% (47), wound 5.3% (24), starvation 5.1% (23),
contest 3.7% (17), ambush 3.3% (15), alien 1.3% (6),
dehydration 0.7% (3) — 454 deaths total.

## Metric review (post-run)

- Pre-registered metrics bound the run and were NOT re-scored. The
  verdict is the analyzer's A/E on the pre-registered chains and
  buckets; the exposure-normalized starvation rates above are
  watch-only context and change nothing about the verdict.
- WEAK-C4 CAVEAT (analyzer limitation, found by the causal read):
  classify() regexes the whole 8-line window for "alien|monster"
  without checking WHO the contact names. Nikolai d60's C4 match
  comes from Hannah's monster event. If that match is disallowed
  (contact must name the deceased), A falls to 0/2 — the verdict
  is DIAG-NO-GO either way, so this caveat strengthens rather than
  overturns the verdict, but any future DIAG must bind the window
  match to the deceased's id/name before counting C4. Proposed
  revision for the NEXT run only: C4 requires the window line to
  contain the deceased's who/whoName or an explicit alien-killer
  context field on the death row.
- The registerDeath no-call-through confound from pre-reg stands:
  grief/corpse side-effects are suppressed in both arms, so paired
  comparisons hold but absolute rates are not comparable to
  call-through runs. Nothing in this pilot's story depends on grief
  mediation (the candidate chains are pantry/water/contact), so
  the confound does not touch the verdict.
- npcNeeds has no thirst field (pre-reg): dehydration attribution
  rests on cause + window + pantry context, as designed. Norman's
  C3 came from an explicit DEHYDRATED window line — the mechanism
  worked as intended where the game actually narrates thirst.
- The "new death modes" framing from pdvalue does not survive the
  seed-level contrast: a mode present in PD=1 and absent from its
  paired PD=0 cell on one seed is not a new mode if the same seed
  shows it in the other policy's control arm (leadfeast pd0 dg1
  alien ×2 on s94108). Future guardrail wording should require the
  mode to be absent from ALL control arms on that seed, not just
  the paired cell — proposed for the next run's pre-reg, not
  applied retroactively here.

## SENSE (SENSE-TESTING LAW)

Transcript beats read in full (say + tele windows), judged for
meaning, not counts:

- COHERENT AND CONSEQUENTIAL: Luna d19's window is the pilot's
  best scene. While Luna starves, the haven talks over full
  shelves: "Elif lingers by the full pantry and laughs. 'Full
  shelves, full bellies. Mending the palisade today — the fence
  won't fix itself.'" / "Darius looks at the full shelves and
  waves off the day's share. 'No more into the store — we eat
  at the fire, and the shelves keep.'" Then the spiral line:
  "STARVING: health and energy falling. The spiral has started."
  The village's plenty-talk and one villager's starvation sit in
  the same window and contradict each other in a way that MEANS
  something — distribution failure narrated as complacency, not
  as a bug. This is villagers acting like people, and it is also
  exactly why the U starvations cannot be waved away as noise:
  the game itself stages the gap between full shelves and an
  empty belly.
- COHERENT BUT UNNAMED (the attribution problem in miniature):
  Hannah d68's window argues about the thing without naming it:
  "Whatever that thing was — everyone's talking about it now."
  / "Hannah is calling it 'Big Big.' They'll fight it out — weigh
  in if you want." A village that names its monster "Big Big"
  because it does not know what it is, is believable — and it is
  why the alien cause label cannot be treated as narration. The
  death row says alien; the villagers say "that thing." A DIAG
  that trusts the label over the story would have claimed a
  chain the game never told.
- HUMAN DETAIL THAT EARNS ITS PLACE: the d60 cache gift ("Cache
  by the hollow. Dried meat, clean water. I can't stay. — W."),
  Theo d87's window pairing a village meal (+2200 kcal) with
  Farid's craft level-up and beard_moss grant, Ciro d29's
  flashback (Yuqing's drawing, burnt pancakes, "You told her the
  sun needed holding"), Sidney d13's synergy discoveries
  (Everybody's Friend, Tells, Airtight) firing while a villager
  starves unnoticed. None of this is filler loops or static menus:
  people learn, argue, gift, and die while the village talks
  about something else. That is the sense bar, and the retained
  windows clear it — which is precisely why the alien
  attribution fails honestly instead of conveniently: the windows
  are good enough to show when a chain is NOT there.
- ROBOTIC NOTE (minor, documented not chased): the barter line
  "X traded something with someone for something else. The
  barter economy stirs." recurs verbatim across deaths (Nino,
  Ester, Theo, Ciro) — a template line doing template work. It
  does not mislead, but it is the one beat that reads generated
  rather than lived. Not a DIAG finding, noted for the
  conversation lane.

## Verdict

DIAG-NO-GO — attributed 1/2 = 0.500, bar ≥0.80 with E > 0 required
(analyzer verdict, pre-registered). Substantively stronger than
the number alone: the pdvalue starvation/dehydration excess did
not reproduce at all on fresh seeds (counts and exposure rates
both fall under PD=1), and the only excess (2 alien deaths, one
seed) is contradicted as a lever channel by the same seed's alien
deaths in the control policy's arms, with its single attributed
death resting on another villager's monster mention. There is no
belongfeast-specific PD=1 cost chain in this pilot to name — the
DIAG question ("what chain pays the cost?") is answered by
"no reproduced cost, and the residual excess is seed noise with
un-narrated causes." This is an honest unexplained/no-chain
outcome, not a failure to paper over: the instrument worked (48/48
files retain death rows + windows), the pilot reproduced nothing
to attribute, and the verdict rule fired as written.

## Village assessment in plain words

Eight villages per cell, 100 days each, and the picture is
sturdier than the pdvalue scare suggested. Most villages live to
the horizon: medians 92–100 days, national reach 4–6 of 8 per cell,
wave 4 reached on 2–7 of 8 — but wave 5 on none, and the table on
none (structural under SEATDRIVE=0, so no village was ever going
to win here). Combat is the way villages bleed: over half of all
454 deaths are combat, then sickness, then monsters. Starvation
is a small share (5.1%) and it falls under PD=1, not rises. The
villages that die, die in two recognizable ways: the slow
pantry-empty collapse (s94105 dg0, five starvations in a week as
pop falls 7→2 with the pantry at zero — a real famine, narrated
by the talk dying around the fire) and the combat bloodbath
(s94108, 14–16 deaths in every arm, where the village keeps
fighting while its pantry drains to zero by day 71). The
full-pantry starvations are the third, quieter way: one person
starves while everyone else eats, usually away from the haven,
while the village congratulates itself on full shelves. That gap
— between what the pantry holds and who actually gets fed — is
the most human thing this pilot found, and it belongs to the
game as a whole, not to this lever.

## Blanks filled or documented

- FILLED (measurement): the dead 1130Z pilot is complete — 48/48
  configs with death-row/transcript retention, analyzer verdict
  rendered, instrument proof green (adopt test 18/18). The offline
  corpus blindness that motivated this DIAG is now closed for
  this question: the next run that needs death attribution has
  rows, contexts, and windows to work from.
- FILLED (causal): no belongfeast-specific PD=1 cost chain exists
  in this pilot — starvation/dehydration excess unreproduced,
  alien excess = seed noise (see Results). The pdvalue
  guardrail failure does not carry a mechanism with it.
- DOCUMENTED (not chased, per backlog discipline): (a) the
  full-pantry individual starvation gap — individuals starving
  with 21–42k kcal in the pantry, in both arms, often while
  camping wild; needs a distribution/away-eating investigation,
  not a lever tweak; (b) the C4 window-match weakness — future
  DIAGs must bind contact lines to the deceased; (c) the "new
  death mode" guardrail wording — require absence from all
  control arms on the seed, not just the paired cell; (d) alien
  deaths whose transcripts never name alien contact ("Big Big" /
  "that thing") — the cause label and the narration diverge, and
  attribution must trust the narration; (e) the verbatim barter
  template line, noted for the conversation lane.
- NOTHING ELSE CHANGED: zero src/js changes (measurement arm),
  no lever re-priced, no pdvalue verdict re-litigated. The
  pdvalue NO-GO on belongfeast guardrails stands as pdvalue's
  verdict; this DIAG adds that its mechanism does not reproduce
  — a fact the coordinator/Steve can weigh, not a re-score.

## Findings to append to hidden_files/sim-findings.md (coordinator appends — this worker does NOT edit that file)

- [open] 2026-10-24 — full-pantry individual starvation gap — villagers starve with 21–42k kcal + 8–17 fresh days in the pantry (Pavel d31, Sidney d13, Luna d19 under PD=1; Norman d23, Sam d61 under PD=0), hungry count 0, often while camping wild ("no pantry meal") as the haven talks over full shelves; a distribution/away-eating gap, not a PD=1 cost (sim-belongcost-adopt-b, evidence/2026-10-24/sim-belongcost-b.md).
- [open] 2026-10-24 — DIAG C4 window-match weakness — analyzer counts any alien/monster word in an 8-line window as contact for the deceased; Nikolai d60's C4 rests on Hannah's monster trust line; future DIAGs must bind the line to the deceased's id/name or carry an alien-killer context field (sim-belongcost-adopt-b).
- [open] 2026-10-24 — "new death mode" guardrail wording — a mode absent from the paired PD=0 cell but present in another policy's control arm on the same seed (alien ×2 leadfeast pd0 dg1 s94108 vs 0 belongfeast pd0 dg1) is seed noise, not a new mode; guardrail should require absence from all control arms on that seed (sim-belongcost-adopt-b).
- [open] 2026-10-24 — alien cause label vs narration divergence — alien deaths narrate as unnamed "that thing"/"Big Big" with no alien contact named; attribution must trust windows over cause labels (sim-belongcost-adopt-b).
