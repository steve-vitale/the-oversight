# sim-nighttravel-verdict-adopt-b — nighttravel bank verdict: GO (pooled bank, 36 seeds)

Run: oversight-flesh-out-loop-b adoption of the stranded 0330Z loop-B run.
Preregistration (written BEFORE any judging):
evidence/2026-10-29/sim-nighttravel-verdict-adopt-b-prereg.md — thresholds
adopted verbatim from the bank prereg
(evidence/2026-10-28/sim-nighttravel-bank-b-prereg.md). Bank instruments
committed bf3b685c9, cherry-picked here as 24e8677fb (clean, no conflicts).
Policy-side arm ONLY: scripts/policies/nighttravel.js + trace/analyzer/proof
instruments. Zero src/js changes, zero default flips, no driver adopts the
policy. Landing per the bank prereg's GO rule is the default-OFF policy
instrument only — NOT a game change, and this adoption does not merge to
master itself; the coordinator merges.

## Verdict: GO (pooled bank)

Pooled bank (pilot 8 + extension 8 + confirm 20 = 36 seeds, both legs fresh
except the pilot, which was adopted verbatim from the stranded run):

- PRIMARY M1r: 19 / 22 = 0.864, bar 0.50 — PASS, with minimum-n met (n = 22 >= 8).
- G1 (survival): median daysAlive policy 30 vs control 30 (>= control - 2) — PASS.
- G2 (starvation): analyzer starvation-cause counts policy 8 vs control 12
  (<= control + 2) — PASS.
- G3-fixed (honesty, zero-tolerance): 0 violations; 115/115 refused hops
  verified (arrival == departure, outcome 'travel-refused'); 0 moved hops
  landing off-haven; 0 mid-fight/tent entries; 1 unforced hop each — PASS.
- Partition sums hold on every seed; unclassifiedAway = 0 everywhere.
- Secondary: streaks broken 19/45; away taps converted 4/25; within-reach
  taps converted 4/5.
- Proofs: test-nighttravel-b.js (T1–T9) PROOF-GREEN on pooled 36;
  test-nighttravel-rerun-b.js (R1–R11) PROOF-GREEN on pooled 36, on pooled
  16, and on the pilot; test-nighttravel-bank-b.js (B1–B8) BANK PROOF GREEN;
  test-nighttravel-verdict-adopt-b.js (A1–A6) ADOPTION PROOF GREEN.
- No panel compare .md is attached, by pre-registration (see "Balanced
  panel" below) — not by omission.

## Staged gates, as they actually fell

### Step 1 — wedge repro: NOT REPRODUCED (no re-run spent)

The 1934Z closeout wedge was: pilot chain parked 25:50 at 0:19 CPU, 8
control files 0 bytes. The stranded tree's wedge dir held one file:
insideevening s11149, 71,263 bytes, valid JSON, byte-identical (md5
ab5c8505b6819349afc1258cb282d4f3) to the corpus insideevening s11149 file.
Per the prereg's declared wedge test, a valid copied wedge file IS the
repro evidence: the s11149 insideevening run completed, the park does NOT
reproduce on this evidence, and no wedge re-run was spent for show. What
parked the 1934Z chain is therefore NOT established by this run — the
stranded run itself went on to complete all 16 pilot files (05:05–05:29Z),
and this adoption's own fresh extension + confirm legs (28 more seeds)
all completed without a park. The honest statement is: the park was a
transient of the dead run's chain, not a property of the instrument
demonstrated on any completed leg. It is not claimed as diagnosed.

### Pilot (8 seeds, adopted corpora) — INSUFFICIENT-DATA at pilot stage, extension mandatory

- withinReach 2/3 = 0.667, but n = 3 < 8 → pilot verdict
  INSUFFICIENT-DATA under the prereg's minimum-n rule, NOT a NO-GO and
  NOT a GO. The pilot gate passes to extension exactly as the prereg
  declares ("n < 8: extension is mandatory, exactly as in prior runs —
  this is the prereg's own trigger, not a choice after seeing the pilot").
  No conclusive pilot miss occurred (a conclusive miss needs n >= 8 with
  rate < 0.50), so no fast kill was triggered, and no re-scoring was done.
- Partition (policy leg): expedition 0, blockedPath 63, blockedGuard 3,
  havenUnknown 0, unclassified 0, away total 69. Streaks broken 2/14.
  Guards on pilot: G1 30 vs 30, G2 2 vs 3, G3-fixed 0 violations,
  63/63 refused hops verified.
- The pilot's real story is already visible here: the lever's trigger
  fires, but the hop is usually REFUSED by a blockage (63 of 69 away
  evenings), not out of reach (0) and not converted (2).

### Extension gate (pooled pilot + extension, 16 seeds) — PASS, confirm spent

- withinReach 7/8 = 0.875, n = 8 exactly meets minimum-n; G1 30 vs 30;
  G2 2 vs 3; G3-fixed 0 violations, 92/92 refused hops verified.
  Partition: expedition 8, blockedPath 92, blockedGuard 9, havenUnknown 0,
  unclassified 0, away total 117. Streaks broken 7/24. All extension-gate
  conditions hold, so the confirm band was spent — the only band the
  prereg permits spending after this gate.

### Confirm + pooled bank (36 seeds) — GO (numbers in "Verdict" above)

- Confirm contributed 14 withinReach evenings, 12 converted (pooled-36
  primary 19/22 minus pooled-16 7/8). The pooled rate
  stayed far above bar at every stage (pilot diagnostic 0.667 on n = 3,
  pooled-16 0.875, pooled-36 0.864) — no stage wobbled near the bar.
- The legacy (non-rerun) M1 rate, 19/157 = 0.121, is reported for
  comparability only and is NOT the judge: it pools expedition and
  blocked-path evenings the prereg explicitly excludes from the primary
  denominator. Quoting 0.121 as "the conversion rate" would misstate the
  preregistered estimand, which is conversion among within-reach evenings
  on away-prone seeds (see "Metric review").

## What the numbers actually mean (plain words)

When the player ends the day away from home but the haven node is actually
offered as a travel target AND the hop isn't blocked, they get home and
inside 19 times out of 22 — the lever works where its trigger genuinely
fires. But that trigger genuinely fires rarely: across 176 away evenings
on the policy leg, only 22 were within reach. The other 154 split into 115
evenings where the haven WAS offered but the hop was refused because the
path was blocked (washed out, fallen tree, rubble, creek — the engine's
own blockages, recorded honestly with arrival == departure), 20 evenings
where home was simply too far to be offered at all, and 19 evenings where
the player was in combat or in a tent and travel was correctly refused.
So the lever is not a broad fix for "nights spent away" — it converts a
narrow, real slice of them. The dominant population is blocked-path, and
that is a finding about the world (paths to home are often blocked at
evening), not about this policy: the policy correctly does not clear
blockages, and the day's own play already offers clearing rubble and
fallen trees (seen in the s11408 transcript: "You clear the rubble, stone
by stone. The path is clear."). Whether blockage-clearing before evening
is the next lever is a coordinator/Steve question, not a conclusion of
this run — this run's verdict is about the travel-home policy only.

## Before/after numbers (identical seeds, both legs)

| Band | Seeds | Policy withinReach | Converted | Rate | G1 | G2 | G3-fixed |
|---|---|---|---|---|---|---|---|
| Pilot (adopted) | 8 | 3 | 2 | 0.667 (n<8, diagnostic) | 30/30 | 2/3 | 0 viol |
| Pooled 16 | 16 | 8 | 7 | 0.875 | 30/30 | 2/3 | 0 viol |
| Pooled bank 36 | 36 | 22 | 19 | 0.864 | 30/30 | 8/12 | 0 viol |

Control vs policy survival: policy leg 36/36 villages survived 30 days;
control leg 35/36 (seed 11308 village-lost day 29 on control, survived 30
on policy — a single-seed observation, reported not claimed: the
nighttravel leg's extra inside nights may have helped, or it may be
noise; one seed proves neither).

## Reachability verdict (waves 1–5, regional → national, table, win flag)

NOT OBSERVABLE in 30-day trace corpora — reported, not claimed. The
traces instrument evening position/reachability only; they carry no
regional/national/table/win fields. What IS in the files: maxWaveUnlocked
per seed — policy leg wave 3 on 1/36 seeds, wave 2 on 28/36, wave 1 on 7/36;
control leg wave 3 on 1/36, wave 2 on 29/36, wave 1 on 6/36. No wave 4–5
unlock in either leg in 30 days. Wave kills: policy 221 wave-1 + 21 wave-2;
control 226 wave-1 + 22 wave-2. No national/table/win movement is claimed
from this run; the lever is a nightly-position policy, and a 30-day
position trace cannot move a scale-wall number.

## Wall numbers (every run)

- National: not observable in 30d traces (no field).
- Table: not observable in 30d traces (no field).
- Wins: not observable in 30d traces (no field); 0 win flags present.
- Wave 4–5 unlocks: 0/36 policy, 0/36 control.
- Median survival: 30 days both legs (policy 36/36 survived; control
  35/36, one village-lost day 29).

## Village assessment (plain words)

Thirty days in, these villages look alive and thin in the familiar way:
every policy village survived the month, villagers foraging, learning
counters from each other by the fire ("Buy it off — it steals FIRST and
fights second"), clearing rubble, knapping stone knives, naming each other
(Brayden, by the fire). Deaths in the traces are mostly villagers and
monsters killing each other in the wild (383 death rows control, 347
policy — monster-vs-villager combat dominates, plus dehydration and "the
wild" for the player character on a few rows), not village collapse: only
one village was actually lost, on the control leg. What was missing is
not food or fight — it is the evening itself: players end days scattered
across groves, meadows, creek banks and forest floors, and most such
evenings end away because the road home is blocked or too far, not
because the player chose to camp out. The blank this run fills is the
measurement of that slice: a night-travel-home behavior, played through
honest verbs, converts 19 of 22 genuine chances and breaks 19 of 45 away
streaks. The blank it documents but does not fill is the blocked path:
115 evenings where home was offered and the hop refused on a blockage.
That is the next question, not this lever's failure.

## Sense-testing (read transcripts, judged for meaning)

- TRAVELLED-HOME (converted, e.g. seed 11307 day 19, forest floor → haven,
  distance 1): the hop itself costs nothing (engine law: node travel is
  free), then the lodge walk bills 5 squares / 10 kcal / 5 ticks, and the
  tail reads "You walk back into Haven. 21 Codex entries. The village is
  glad to see you." / "Walking 5 squares (10 kcal)…" / "You step into the
  Haven hall." This reads as a played evening — a short walk home and an
  entry — NOT a teleport. One converted evening started at 20 kcal and
  ended at 10 kcal: tight, honest, and survivable; no free lunch is hidden
  in the hop because the entry walk still bills.
- BLOCKED-PATH (e.g. seed 11031 day 4, forest floor, block:washed_out):
  the tail says "The path is washed out." twice, the position is unchanged
  (arrival == departure), and the player sleeps away. The refusal reads
  honestly — the game tells the player why, in the world's own words.
- EXPEDITION-AWAY (out-of-reach, e.g. seed 11408 day 7, forest floor at
  (0,7), far from haven): the evening's 26-line tail ends with the day's
  foraging, a crafted knife, and a counter learned from Benoit — and NO
  line says "you bed down out here" or "home is too far tonight." Sleeping
  away reads as the honest boundary in the data (position unchanged,
  outcome 'out-of-reach'), but the played narration never marks the night
  itself. That is a small honesty gap, documented here, not a guard
  failure and not a verdict changer: a future pass could add one plain
  line for out-of-reach nights. It is NOT fixed in this run (instrument
  only; no src/js change is in scope for this arm).
- Villagers acting like people: the tails show gossip chains ("three
  retellings in, nobody remembers what actually happened"), lingering by
  the fire, teaching counters unprompted, and challenging orders in public
  ("Who put YOU in charge?"). Nothing in the judged corpora read robotic
  in the sense-testing sample; the one robotic-feeling beat is the
  unmarked away-night above, which is an absence of narration, not a
  repeated line.

## Blanks filled or documented

- FILLED (measurement): the nighttravel bank verdict itself — 36
  qualifiers staged, pilot + extension + confirm all run, GO on the
  pooled bank with all guards holding and all proofs green. The stranded
  arm is no longer stranded: its pilot is judged, its bank is fully spent,
  and the commit record (evidence + instruments only) is complete.
- DOCUMENTED (not filled): (1) blocked-path dominance — 115/176 away
  evenings refused on blockages; the next lever question is whether
  evening blockage-clearing (or daytime clearing habits) moves this
  population, and it must be pre-registered separately, never folded into
  this verdict. (2) Unmarked out-of-reach nights — no narration line for
  sleeping away when home is too far (see sense-testing). (3) The 1934Z
  chain park — not reproduced, not diagnosed; every leg completed in this
  run, so no instrument change is proposed for it. (4) Seed 11308's
  control-leg village loss vs policy-leg survival — single-seed
  observation, not a survival claim.

## Balanced panel (MEASUREMENT.md §15 — explicit, not a fake)

NO balance-panel compare .md is attached, as pre-registered in the bank
prereg and restated in this adoption's prereg before judging: this leg is
a 30-day position/reachability measurement of a POLICY-SIDE arm — zero
src/js changes, so there is no game-root delta for a panel to compare
(base panel vs lever panel would be identical by construction), and the
panel's registry policies do not include the trace policies
(insideevening/nighttravel) this arm measures. The before/after instrument
is the custom driver on identical seeds, and the pre-registered thresholds
above are the judge. If this lever ever becomes a game change, a panel
compare is run at that point; a policy-side trace cannot fake one now.

## Metric review (mandatory — doubts for the NEXT run, never a re-score)

- The estimand must stay quoted with its scope: "within-reach conversion
  among away evenings on away-prone seeds" (0.864), NOT a blind-band rate.
  The 2224Z blind-band finding (0 withinReach in 16 blind seeds) stands;
  this run's bank was enriched for away-prone seeds by design, and the two
  numbers describe different populations. Any future report that drops
  the qualifier is misquoting this run.
- The d <= 3 screen vs travelTargets' offer envelope: the screen enriched
  well (36 qualifiers from 448 scanned, 8.0%), but the judged withinReach
  yield was still thin (22 evenings from 36 seeds) because most offered
  hops hit blockages — the screen predicts nearness, not clear passage.
  A future run that wants a larger withinReach n should screen on
  clear-path evenings, NOT widen d or lower min-near after the fact; that
  revision is proposed here for the next run's prereg, not applied here.
- The haven (4,4) assumption held on every judged policy row (all hops
  targeted (4,4), all moved hops landed there); no revision needed.
- The legacy raw-false count (115) equals the refused-hop count exactly
  and is NOT a guard signal under G3-fixed; any reader who treats 115
  "landing failures" as violations is misreading the instrument — all 115
  are verified refusals (arrival == departure).
- The analyzer's starvation counts (policy 8, control 12) are
  telemetry-cause matches as the analyzer defines them, not a count of
  villages starved to death (only one village was lost in either leg);
  G2 is judged on those counts exactly as pre-registered, and the
  distinction is noted so the next run does not over-read G2 as mortality.

## Evidence files

- Prereg (this adoption): evidence/2026-10-29/sim-nighttravel-verdict-adopt-b-prereg.md
- Bank prereg + scan (cherry-picked): evidence/2026-10-28/sim-nighttravel-bank-b-prereg.md,
  evidence/2026-10-28/sim-nighttravel-bank-b-scan.json
- Pilot corpora (adopted verbatim): evidence/2026-10-29/sim-nighttravel-verdict-b-corpus-insideevening/,
  evidence/2026-10-29/sim-nighttravel-verdict-b-corpus-nighttravel/,
  evidence/2026-10-29/sim-nighttravel-verdict-b-wedge-insideevening/
- Extension corpora (fresh, this run): evidence/2026-10-29/sim-nighttravel-verdict-adopt-b-extension-insideevening/,
  evidence/2026-10-29/sim-nighttravel-verdict-adopt-b-extension-nighttravel/
- Confirm corpora (fresh, this run): evidence/2026-10-29/sim-nighttravel-verdict-adopt-b-confirm-insideevening/,
  evidence/2026-10-29/sim-nighttravel-verdict-adopt-b-confirm-nighttravel/
- Pooled corpora + analyses: evidence/2026-10-29/sim-nighttravel-verdict-adopt-b-pooled16-*,
  evidence/2026-10-29/sim-nighttravel-verdict-adopt-b-pooled36-*,
  evidence/2026-10-29/sim-nighttravel-verdict-adopt-b-analysis.json (pilot),
  evidence/2026-10-29/sim-nighttravel-verdict-adopt-b-analysis16.json,
  evidence/2026-10-29/sim-nighttravel-verdict-adopt-b-analysis36.json
- Proofs: scripts/test-nighttravel-b.js, scripts/test-nighttravel-rerun-b.js,
  scripts/test-nighttravel-bank-b.js (all cherry-picked), plus new
  scripts/test-nighttravel-verdict-adopt-b.js (A1–A6, this adoption).
- Instruments: scripts/nighttravel-trace-b.js, scripts/analyze-nighttravel-b.js,
  scripts/analyze-nighttravel-scan-b.js, scripts/policies/nighttravel.js (all cherry-picked).

## Landing note for the coordinator

GO lands the default-OFF policy instrument ONLY (scripts/policies/nighttravel.js
plus trace/analyzer/proof instruments, as a policy file no driver adopts by
default). NO driver adopts it, NO default flip, NO src/js change. This
worker does NOT merge to master — coordinator merges. Branch:
sim-nighttravel-verdict-adopt-b. Worktree contains only committed work at
handoff (verified before reporting).
