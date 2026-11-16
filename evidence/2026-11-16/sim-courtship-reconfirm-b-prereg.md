# sim-courtship-reconfirm-b — PREREG (re-confirm of the courtship-rework2 PILOT GO)

Run: fleshout-loop-b-20261116T0430Z (Loop B), arm sim-courtship-reconfirm-b
Axis: winnability chain. Re-confirm of the BFS-pathfinding courtship-deeds
lever — the confirm OWED on the rework2 PILOT GO, re-run after the 2330Z
confirm stopped on G3 tip drift with the band unspent.
Branch: sim-courtship-reconfirm-b — worktree ~/workspace/worktrees/sim-courtship-reconfirm-b
Base: master at worktree creation (tip 655949b97 — the aidgate PILOT NO-GO
landing; includes the covenantsmoke revision 6ca37144b as an ancestor)
Date: 2026-11-16 (run starts 2026-11-16T04:30Z)
Findings backlog: claims "2026-11-15 — winnability chain — THE
PILGRIMAGE STALLS ON FAR VILLAGES" (sim-findings.md, [claimed] by
sim-courtship-rework2-b; [fixed] only if THIS re-confirm holds the pilot
GO). The covenant-road item ("THE COVENANT ROAD IS GATED BY
OPINION", [claimed] by sim-courtship-b) stays [claimed] — this arm
does not re-claim it. (Coordinator updates the backlog; this arm does
not edit sim-findings.md.)

## Canon note (read first)

docs/CANON.md was read, then docs/MAP.md (travel canon), then the
frozen confirm prereg (evidence/2026-11-15/sim-courtship-confirm-b-prereg.md),
the 2330Z confirm evidence (sim-courtship-confirm-b.md), the smoke
revision (sim-covenantsmoke-b.md), and the pilot evidence
(sim-courtship-rework2-b.md), in full. This prereg INHERITS the frozen
G1/G2/G3 + cost bar and combination rule verbatim from the confirm
prereg — it does not redesign them. Travel canon, in one line
(docs/MAP.md, and game.js `travelBlockage` header): **blockages offer
multiple ways through — cut, clear, bridge, swim, or go around, never
one mandatory path** — and `travelTo` at d>1 checks every tile on a
shortest path for entry blockages from the approach side. The covenant
shape, in one line: Haven holds ≥3 SEASONED covenant peer links (kind
'covenant', no primary/subordinate; seasoned = 30+ days old AND
trust 40+), the rung (regional a full season: networkLiveDay + 30)
has passed, and no higher-priority shape's beat is pending/live —
then "The Founding Council" stages (pact/pool/walk). Peer proposals
need opinion 10+ first.

## What is being confirmed (inherited, not redesigned)

The pilot (8 seeds, band 100761–100768) went GO on all gates:
covenant staged 8/8, all answered 'pact', all sat; zero-movement
continuation pilgrim-days 0 band-wide (was 54 on seed 100646 in
round 1); stale drops 0 (was 4); every pilgrimage (24/24) ended in
a study within 2 days of its start; cost bar PASS (starvation 1 vs
5, median survival 175d vs 150d). The lever is the BFS-pathfinding
courtship policy (scripts/policies/competent-courtship-b.js, landed
682f7354e): `bfsNextStep` plans the shortest orthogonal walk with
`Game.travelBlockage` as the passability oracle; `walkTo` takes
the first BFS step per hop; the greedy nearest-first step survives
only as the no-path / off-board fallback; the never-steps-away
guard is removed (BFS-distance is the progress measure). Same two
deeds, same prices, same gates; zero src/js.

The 2330Z confirm (sim-courtship-confirm-b) went CONFIRM NO-GO on
G3 alone, by tip drift, not by the lever: test-covenant-b 32/33
against the recorded 33/33 — the smoke's opinion-timing assumption
(~day 150) was falsified by journey r137 (opinion-10 by day 59 on
seed 100401). No judged sim ran; band 100621–100636 was NOT spent.
The smoke revision arm (sim-covenantsmoke-b, landed 6ca37144b)
revised the assertion to the new timing (structural judge over the
propose-stream split at op10Day) and re-checked the substrate:
test-covenant-b 40/40, test-courtship-b 57/57, test-onlylead-b
29/29, test-onlylead2-b 26/26 (its known drift was the same dead
assumption, fixed in the same commit). This re-confirm re-runs the
confirm on the same frozen shape, on the same reserved band, with
the REVISED recorded baselines below.

This arm is a SWEEP ONLY — zero src/js expected, zero policy
edits. Both policies are already on master. The only new code is
instrument wiring for the re-confirm RUN (driver dirFor branch +
panel builder, same construction as the confirm's).

## Seed-band freshness (re-verified BEFORE any judged sim, 2026-11-16)

Per ~/workspace/custom-skills/local_seed_band_freshness/SKILL.md —
exact-seed grep over all dated preregs
(evidence/*/sim-*-prereg.md), the convergence tracker, scripts/,
and evidence filenames, on the current tree (base 655949b97):

- CONFIRM BAND 100621–100636 (16 seeds): seeds 100622–100635 hit
  ONLY in sim-courtship-confirm-b-prereg.md (the reservation).
  Seeds 100621 and 100636 hit additionally as band endpoints in
  sim-aidgate-b-prereg.md, sim-gatereach-b-prereg.md,
  sim-grecorder-a-prereg.md, sim-producergate-b-prereg.md,
  sim-producerparty-b-prereg.md, sim-transplant2b-fresh-prereg.md
  — every one a reservation / NEVER-avoid list mention ("confirm
  band, still unspent", "USED by transplant/courtship preregs" =
  named/reserved, not spent), never a judged corpus. Tracker
  mentions = the reservation carried forward ("confirm band
  100621–100636 stays fresh"; "courtship re-confirm UNBLOCKED,
  band 100621–100636 unspent"). scripts/ hits = ONLY
  scripts/onlylead-driver-20261115.js and
  scripts/build-courtship-confirm-panels-20261115.js (the confirm's
  own instrument wiring — the reservation, not a corpus).
  Evidence filenames = 0 hits. No perseed dir, no panel, no
  judged corpus exists on any seed in the band. The evidence-wide
  `grep -rln "100621"` hits outside the courtship line are the
  known substring noise (float literals in 2026-11-07 corpora,
  e.g. 0.9910062187817061) and reservation mentions in journey
  preregs. FRESH — re-verified on this tip after the 2330Z check;
  no new corpus landed on the band since. This prereg spends it
  as the confirm band.
- SPENT BANDS (never reuse): 100601–100608 (1630Z pilot),
  100641–100648 (1810Z re-pilot), 100761–100768 (rework2 pilot).

## Primary metric + GO bars (binding, §14) — inherited verbatim

COMBINATION RULE (carried from the pilot): **GO requires G1 AND
G2 AND G3 AND the cost bar; any FAIL = CONFIRM NO-GO, never
re-scored mid-run.** A miss is written under "metric review"
with a revision proposed for the NEXT run.

- G1 INSTRUMENT VALIDITY — GO iff the driver captures a full
  per-day link roll + shape-candidate roll + DAILY MAX-KNOWN-
  OPINION read + DAILY SCHOLAR POSITION + pilgrim state on all
  32 configs (16 seeds × covenant-baseline / courtship-armed),
  0 instrument errors, EVERY staged beat classified by shape
  with sat/unsat, UNCLASSIFIED ≤1 per 8 seeds on the armed leg
  (≤2 band-wide at 16 seeds), and the pilgrim rollup present on
  every armed record. Any instrument error, unclassified shape
  beyond the bar, staged beat without a shape, or missing
  pos/pilgrim field = NO-GO.
- G2 THE LEVER — GO iff on the courtship leg, COVENANT BEATS
  STAGED on ≥6/16 seeds AND every staged covenant beat is
  answered 'pact' and sat (READING, frozen from the pilot:
  a beat that stages on the day the village dies is EXCLUDED
  from the sat denominator, not counted unanswered — it was
  never answerable), AND the stall read holds: zero-movement
  continuation pilgrim-days band-wide ≤16 AND per-seed ≤8 on
  EVERY seed, AND stale drops band-wide ≤8. A miss on any
  clause = NO-GO, never re-scored mid-run. Lead beats staged
  on the courtship leg are reported (expectation: 0 — the leg
  proposes no lead links); a lead staging means the isolation
  failed and the confirm is re-examined, not re-scored.
- G3 LEVER-ONLY — GO iff zero `src/js` changes in the branch
  diff and the proof tests are green at the recorded baselines
  (REVISED baselines — see revision note below):
  test-courtship-rework2-b.js 59/59,
  test-courtship-rework-b.js 58/58, test-courtship-b.js 57/57,
  test-covenant-b.js 40/40, test-onlylead-b.js 29/29,
  test-onlylead2-b.js 26/26. A CHANGE from any recorded number
  is a failure — no test is edited to go green.
  Any src/js change = NO-GO.

### G3 baseline revision (explicit, recorded here — the only
### change from the frozen confirm prereg)

The 2330Z confirm's recorded baselines were
test-covenant-b 33/33 and test-onlylead2-b 24/25 (known drift).
Both are REVISED by the covenantsmoke arm (landed 6ca37144b,
evidence sim-covenantsmoke-b.md), which is an ancestor of this
base tip:

- test-covenant-b: 33 → **40** checks. The §2 smoke's dead
  opinion-timing assertion ("no acceptance in the 60d window",
  opinion-10 only at ~day 150) was replaced by a structural
  judge over the propose-stream split at the day opinion-10 is
  first met (day 59 on seed 100401), plus §1b negative controls
  (6 checks) proving the new assertion still discriminates.
  Cause: journey r137 (ce0f28a46), conversation.js — deflected
  question-wants re-posed, more answered questions, opinion
  moves earlier. The new baseline is 40/40.
- test-onlylead2-b: 24/25 (known drift) → **26** checks, 26/26.
  The drift was the same dead assumption in the §2
  substrate-negative seed check (seed 100421 reaches opinion-10
  day 53 on this tip and forms the link); replaced by the same
  timing split at the 200d horizon, with its own note. The
  "known drift" is FIXED, not carried.

G3 is judged against the REVISED baselines above. The revision
is a test-maintenance change in its own landed commit, with the
new opinion-timing numbers recorded — not a re-score of this
run's numbers.

### G3 proof re-run on THIS tip (before any judged sim)

Run on base 655949b97, before the prereg was frozen:

- test-courtship-rework2-b.js **59/59** ✓
- test-courtship-rework-b.js **58/58** ✓
- test-courtship-b.js **57/57** ✓
- test-covenant-b.js **40/40** ✓ (revised baseline)
- test-onlylead-b.js **29/29** ✓
- test-onlylead2-b.js **26/26** ✓ (revised baseline)

All six green at their recorded baselines. G3 passes on this
tip; the re-confirm proceeds to judged sims. Zero `src/js` in
the branch diff (instrument wiring only — driver dirFor +
panel builder, prereg, evidence).

Cost bar (veto, pilot form, KEPT): starvation deaths pooled
courtship ≤ baseline + 2 AND median survival courtship ≥ 0.8×
baseline median. Guardrail (§14c): villager (non-scholar)
combat deaths are a co-primary read on every seed — the evidence
names any seed where courtship deaths exceed the before leg by
>50%. SPLIT (analysis, not a second bar): the evidence ALSO
reports starvation per seed split by lever spend (aid kcal paid
before the death day) AND by scholar absence (pilgrim-days before
the death day), so the bar's verdict can be read against the
lever's own spend and its own absence instead of the weather.
SPLIT (analysis, pilot metric review #3): the walkRefusals
counter is split into BFS-step refusals vs greedy-fallback
vetoes, so a genuinely walled-in village does not look like a
walk that keeps failing.

## Method (staged, §§9–12, 14–15)

- RE-CONFIRM (16 seeds × 2 policies = 32 configs, 200d
  death-aware, identical seeds, BOTH legs run fresh). Horizon
  200d because the covenant road needs it (pilot: first beat
  day 62 even on the fastest staging seed; round 1: first beat
  day 62). Seeds (exact literals): 100621, 100622, 100623,
  100624, 100625, 100626, 100627, 100628, 100629, 100630,
  100631, 100632, 100633, 100634, 100635, 100636. Policies:
  competent-covenant-b (baseline — the road walked, no opinion
  lever) vs competent-courtship-b (BFS rework — the same road +
  courtship deeds with the walk fixed), identical seeds. The
  courtship leg is the judged leg; the covenant leg is the
  control.
- DRIVER: scripts/onlylead-driver-20261115.js (extended — see
  instrument changes below; same recorder, same shape-candidate
  roll). Per-seed JSON to
  evidence/2026-11-16/perseed-courtship-reconfirm-b-control/
  (baseline) and evidence/2026-11-16/perseed-courtship-reconfirm-b-on/
  (courtship). Zero src/js. RUN=courtship-reconfirm-b. The driver
  refuses to overwrite an existing per-seed file (exit 3), so a
  run interrupted by a runtime restart resumes from verified
  checkpoints: validate each completed file as complete JSON
  with 0 instrument errors, never re-run a completed config,
  never overwrite a valid per-seed file.
- ANALYZER: scripts/analyze-onlylead-b.js (unchanged — the
  pilgrim rollup already reads the driver's pos/pilgrim fields).
  Writes evidence/2026-11-16/courtship-reconfirm-b-analysis.json.
- BALANCED PANEL (§15): panels are built in the
  scripts/balance-panel.js schema from the two per-seed dirs
  (new builder scripts/build-courtship-reconfirm-panels-20261116.js,
  same construction as the confirm builder), and the compare
  itself is run through scripts/balance-panel.js
  (`node scripts/balance-panel.js compare --before
  <panel>-before.json.gz --after <panel>-after.json.gz --out
  evidence/2026-11-16/courtship-reconfirm-b-panel`) — the panel is
  the instrument, the pre-registered G2 bar is the judge. Built
  for the record whether the confirm is GO or NO-GO (onlylead2
  precedent).
- ENV: defaults, matching the courtship-b legs — COUNTER_ANSWER
  unset, COMPETENT_FLEE_REPAIR unset, ANSWERMAIL_DRIVE unset. No
  other env.
- ENCOUNTER-GEAR RULE (Steve 2026-11-13): no staged fixtures —
  the driver observes the policies' own play; nothing is staged.

## Instrument changes (frozen BEFORE the confirm — all in this prereg)

1. DRIVER — scripts/onlylead-driver-20261115.js: `dirFor` maps
   RUN=courtship-reconfirm-b to
   perseed-courtship-reconfirm-b-control / -on under
   evidence/2026-11-16 (covenant → control, courtship → on).
   No other driver change. The 2330Z RUN=courtship-confirm-b
   mapping is NOT overwritten.
2. PANEL BUILDER — scripts/build-courtship-reconfirm-panels-20261116.js
   (new; same construction as the confirm builder, new RUN / dirs /
   seeds / observer digest).
3. PROOF — no new proof test. The six pilot proof tests are
   re-run on this tip and recorded at their baselines (see G3).

## Wall numbers (every run)

National / table / wins, wave 4–5 unlocks, median survival —
reported for both policies in the evidence file.

## Sense-testing (SENSE-TESTING LAW)

Quote the staged beat + answer lines the driver captures and judge
whether the Founding Council reads like a played ceremony — AND
read the pilgrimage lines: does the start line name the village
and the road, does the stale turn-home line say WHY the scholar
turns, does the return line distinguish a completed study
("codex now read") from a turn-home ("codex stays unread")? Do
the deeds arrive as played lines with named villages and
remembered gifts, or as ledger entries? Judge meaning and
coherence, never just counts. In particular: does any pilgrimage
line repeat daily, and does a stall — if any trip still goes
stale — read aloud instead of vanishing?

## Evidence

- Prereg: this file.
- Instrument substrate (on master, unchanged):
  scripts/policies/competent-scaleclimb-b.js and
  scripts/policies/competent-covenant-b.js (the covenant road).
- Lever: scripts/policies/competent-courtship-b.js (BFS rework,
  landed 682f7354e — no change in this arm).
- Driver: scripts/onlylead-driver-20261115.js (extended: dirFor
  for RUN=courtship-reconfirm-b).
- Analyzer: scripts/analyze-onlylead-b.js (unchanged).
- Proof: re-verified on this tip: scripts/test-courtship-rework2-b.js,
  scripts/test-courtship-rework-b.js, scripts/test-courtship-b.js,
  scripts/test-covenant-b.js, scripts/test-onlylead-b.js,
  scripts/test-onlylead2-b.js.
- Panel builder: scripts/build-courtship-reconfirm-panels-20261116.js
  (new).
- Per-seed JSON: evidence/2026-11-16/perseed-courtship-reconfirm-b-control/
  (16 files) and evidence/2026-11-16/perseed-courtship-reconfirm-b-on/
  (16 files).
- Analysis: evidence/2026-11-16/courtship-reconfirm-b-analysis.json.
- Panel (GO and NO-GO, for the record):
  evidence/2026-11-16/courtship-reconfirm-b-panel.*
- Evidence: evidence/2026-11-16/sim-courtship-reconfirm-b.md
  (per-seed per-shape tables with ALL failing gates + rung naming,
  opinion trajectories per leg, pilgrim stall table, deeds table,
  walkRefusals split, wall numbers, sense-testing, metric review).

## Convergence state

Courtship-deeds rework round 2 re-confirm on a 200d horizon. The
verdict is GO / NO-GO against G1/G2/G3 + the cost bar above. If
GO, the findings-backlog item ("THE PILGRIMAGE STALLS ON FAR
VILLAGES") is marked [fixed]; the BFS-reworked courtship policy
is already on master (682f7354e) — a confirm GO closes the item,
it does not land new game code. If NO-GO, evidence-only record;
no game change. Killed arms leave no trace.
