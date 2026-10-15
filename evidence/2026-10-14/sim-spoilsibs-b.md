# SIM-SPOILSIBS — tribute + cooking laundering siblings audit (ARM, food economy)

Date: 2026-10-14 · Loop: oversight-flesh-out-loop-b · Worker tree: sim-spoilsibs
Run id: loop-b-20261015T000543Z · Axis: food economy (scale-wall lens)
Claims: sim-findings item #82 (spoilsmoke siblings: tribute payments, direct cooking calls)

## Pre-registration (MEASUREMENT.md §§9–12, 14 — binding)

- **Primary metric:** laundered kcal through the sibling vectors — kcal of
  already-spoiled pantry stacks whose spoilDay is reset (re-dated) or that are
  marked safe by (a) the tribute payment/receipt path, (b) any direct cooking
  call outside the duty drive fixed by spoilsmoke. Measured with a universal
  at-scan instrument (daily pantry scan: tag first-seen-spoiled stacks with
  the raw isSpoiled(it,0) boundary; any tagged stack whose spoilDay later
  exceeds the scan day is a launder event) — per sim-findings #100 the check
  runs during the sim, never post-hoc.
- **GO:** crafted proof shows each vector clean on pristine master (negative
  assertions; FOIL confirms the detector fires on real laundering) AND the
  8-seed cohort launders 0 kcal. A vector with ZERO laundering on pristine
  closes as a diagnostic (no game change), per the arm brief.
- **Guardrails (conditional on a fix landing — none expected):** median >=
  control-10d; national >= control-2/16; table/wins/exiled/wave5 unchanged.
  No fix is being landed, so guardrails are reported as the cohort's wall
  numbers only (no before/after pair exists).
- **Horizon:** 180d death-aware (+10d tail max) — dead villages stop early.
- **Seeds:** 11/22/33/44/55/66/77/88 · **Policies:** leadcourt, belongseek
  (named-export unwrap per #69; SMOKE=1 gate before spend).
- **Canon:** docs/PRESERVATION.md — "Rot can't be smoked back into food.
  Spoiled meat is discarded honestly."

## Plan-time corrections (brief was stale)

The arm brief said the siblings "were never audited (MEMORY.md sim-findings
2026-10-14: OPEN)". sim-findings item #82 is in fact **[fixed] since the
2026-10-14 08:29 loop-B run**: the smoke-siblings arm (landed 1bdcf05c, on
master) audited every convert()/preserve/cook entry point in src/js and
landed the last unguarded one (G.cookAll batch meat pipeline). This arm
therefore became an **independent verification**: re-trace both vectors in
code, write a fresh negative proof, run a fresh cohort with a universal
laundering instrument, and either land a fix (laundering found) or close as
a verified-clean diagnostic (no game change).

**Non-overlap with sibling arm sim-hungerdepth2c (plan-time check):** that arm
touches src/js/game.js only, in the resolveOneAssignment prodthrottle
redirect hook (THROTTLEBEAT ~L5822–5845, prodThrottleEngaged ~L13882–13894,
prodThrottleHungerExempt ~L13903–13911). This arm makes NO game-code changes
(diagnostic close) — non-overlap holds trivially. The tribute side, if it
had needed a fix, would have been hierarchy.js (payTribute/_removePantryKcal),
a different file entirely.

## The audit

### Vector (a) — tribute payments: VERIFIED CLEAN

Three sub-paths traced in src/js/hierarchy.js:

1. **Payer side** (`payTribute`, ~L799 → `_removePantryKcal`, L767): pure
   removal — units decremented or the stack spliced out, freshest-first
   (pantry sorted by spoilDay ascending, taken from the fresh end).
   `_removePantryKcal` contains ZERO spoilDay writes (only a sort-key read);
   no conversion, no `safe=true` marking. A spoiled stack used for tribute is
   DESTROYED at full value — it is never re-dated. Not the spoilsmoke class.
2. **Receipt side** (Haven as primary, `linkTick` ~L1035–1041): the
   subordinate's abstract `pantryKcal` is debited; Haven pushes a NEW stack
   `{ name: 'Tribute grain from X', spoilDay: _day + 21 }` — a transfer of
   fresh dated grain, not a re-date of any existing stack.
3. **tendLink aid** (SUBAID-AID-CREDIT, ~L887): payer removes via
   `_removePantryKcal(1500)`; the recipient's abstract `pantryKcal` += paid.
   No stack manipulation on the receiving side.

Note (NOT chased — new finding, see below): `_removePantryKcal` does not
exclude spoiled stacks, so a village down to only rotten food pays tribute
with it at full value (trust/arreas credit). This is an accounting-generosity
question, not the spoilDay-reset laundering class, and the payer has no
control over which stacks are taken (freshest-first is automatic) — no player
exploit exists. Filed as open finding #N; needs Steve's design call.

### Vector (b) — direct cooking calls: VERIFIED CLEAN

Every entry point that rewrites spoilDay, independently re-traced in code:

| Entry point | Guard | Verified |
|---|---|---|
| duty-drive `convert()` (game.js ~L6228) | eligible-loop skip `isSpoiled(it,0)` | ce1c680c, L6136–6140 |
| `preserveFood` (food.js L685) | `dropRotten` pre-pass (idx + batch) | L690–703 |
| `renderFat` (food.js L770) | `!this.isSpoiled(inv[i])` target filter | L773 |
| `makePemmican`/`pemmicanPlan` (food.js L832) | `this.isSpoiled(it)` pick filter | L847 |
| G.cookAll batch meat (food.js ~L2817) | spoiled pre-pass discards rot | 1bdcf05c, L2798–2809 |
| `cookFood` per-item | bonus-aware guard | 2026-10-08 |
| `askSpecialist` any-task | `if (this.isSpoiled(it))` discard | L1095–1104, 2026-10-08 |
| `cleanCarcass` | `dropRotten` pre-pass | L624–634 |

Fresh-creation paths that write spoilDay (`cleanCarcass`/`askSpecialist`
butcher sd=day+2, stack-merge min at L2229/L366/L442) create or shrink dates
only — no laundering class. The sibling's full audit matches mine exactly;
all three commits (ce1c680c, 1bdcf05c, the 2026-10-08 guards) verified on
master.

## Proof (REAL negative assertions)

`scripts/test-spoilsibs-20261014.js` — full src/js harness, seeded RNG before
eval, no Game.save stub. 9/9 PASS on current master:

- A1 (payTribute full): 5000 kcal paid (1000 fresh + 4000 spoiled destroyed);
  launderedKcal=0; spoiled stack GONE, never re-dated; narration fired.
- A2 (payTribute short): 3000/5000 paid, remainder accumulated (arrears ride
  on linkTick's week-boundary settlement per hierarchy.js, not here);
  launderedKcal=0.
- A3 (linkTick receipt): "Tribute grain from" arrives with sd=day+21;
  both anchor stacks (spoiled + fresh) untouched; launderedKcal=0.
- FOIL: detector fires on synthetic spoilDay-reset laundering (1000 kcal)
  — the negative assertions are not vacuous.

## Cohort results (16 runs, 180d death-aware, universal at-scan instrument)

SMOKE=1 green (policy unwrap + 2-day runs + tribute fixture, all PASS).
Instrument: daily pantry scan tagging first-seen-spoiled stacks (raw
isSpoiled(it,0)); any tagged stack later re-dated past the scan day =
launder event (sim-findings #100: at-scan, never post-hoc). Tribute
arrivals counted once at first sight, verified ~21d fresh dating (diff 20
or 21 — the push lands after the policy daily scan on its arrival day).

| metric | leadcourt (8) | belongseek (8) |
|---|---|---|
| launderKcal (primary) | **0** | **0** |
| launder events | 0 | 0 |
| tribute arrivals, all fresh-dated | 185 (0 bad dates) | 0 |
| national | 4/8 | 6/8 |
| table | 0/8 | 0/8 |
| wins | 0 | 0 |
| wave4 / wave5 unlocks | 5 / 0 | 0 / 0 |
| exiled | 1 | 1 |
| median / max survival | 97d / 161d | 146d / 180d |

Raw per-seed JSON was scratch (deleted after aggregation; the table above is the record). Note the belonging road shows ZERO tribute arrivals: its links never put Haven in the primary seat (leadcourt's 185 all came through subordinate-pays-primary).
its links never put Haven in the primary seat (leadcourt's 185 all came
through subordinate-pays-primary). Both roads' receipt and payment paths
are covered by the crafted fixture proof regardless.

Instrument honesty note: the first instrument version double-counted
arrivals (per-day, 1543) and then mis-dated them (all "bad") because the
push happens after the policy daily scan on the arrival day — a
scan-phase off-by-one, NOT a game bug. Both were caught, fixed (WeakSet
dedup + accept diff 20/21), and re-run before judging. Final: 185/185
fresh-dated, 0 launder events.

### Guardrail / wall numbers

Diagnostic arm — no fix landed, so there is no before/after pair; the
cohort's numbers ARE the wall state on current master:

- **national 10/16, table 0/16, wins 0/16**
- **wave4 unlocks 5/16 (all leadcourt), wave5 0/16**
- **median survival 97d (leadcourt) / 146d (belongseek); max 161d / 180d**
- exiled 2/16. The scale wall stands where the sibling arms left it:
  leadcourt reaches further up the Standing ladder (wave4 5/8) but dies
  earlier; belongseek survives longer with fewer unlocks.

## SENSE check

Tribute beats read honestly. A1's line: "Tribute paid: 5,000 kcal walks out
of the pantry toward them. The relationship holds." — amount named,
direction named, consequence named. A2's short line: "Tribute short — 3,000
of 5,000 kcal so far this week. They'll count it. Arrears grow teeth." —
the shortfall is public and the consequence is felt, not a silent number.
The duty-drive's preserved note and the smoke-siblings cookAll refusal
("The X went bad — cooking won't save it. You leave it for the flies.")
are the same voice — consistent, no new dialogue needed. No [needs-eyes].

## Blanks filled / documented

- **VERIFIED-CLEAN (no game change):** the spoilsmoke sibling class is closed
  across all of src/js. Tribute (payment + receipt + aid) never resets
  spoilDay on an existing stack; every cooking/preserve entry point refuses
  spoiled food at conversion time. Diagnostic close — KILL protocol for game
  code (reverted byte-clean trivially: nothing was changed); instruments and
  this evidence committed.
- **DOCUMENTED (not chased):** open finding — `_removePantryKcal` spends
  spoiled stacks at full value when they're all that's left (tribute, aid,
  feast pours, oaths all share it). Filed below.

## Metric review

The pre-registered GO was "proof clean AND cohort launders 0 kcal" — this is
a diagnostic arm, not a fix arm, so there is no before/after pair and no
guardrail adjudication to perform; the cohort's wall numbers are reported
as-is. The primary metric was met exactly as specified (see cohort table).
No metric re-scoring was needed; none is proposed. The one pre-registration
gap: the cohort cannot exercise `payTribute` itself (player verb, no policy
presses it) — that side is covered by the crafted fixture (A1/A2), not the
sweep. Filed with the batch-policy gap (#161) as the same class of coverage
hole: UI-verb paths need either a policy that presses them or fixture-level
proofs. This run has the fixture proofs.

## Convergence

food-economy axis: the spoilsmoke sibling class is CLOSED — verified twice
independently (smoke-siblings audit + this arm). The scale wall itself is
untouched by this arm (diagnostic, no game change); the wall numbers above
are the honest cohort state.
