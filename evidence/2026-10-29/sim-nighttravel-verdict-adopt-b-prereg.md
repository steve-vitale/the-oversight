# sim-nighttravel-verdict-adopt-b — PREREGISTRATION (written BEFORE any judging of the adopted pilot)

Run: oversight-flesh-out-loop-b adoption, arm sim-nighttravel-verdict-adopt-b,
axis food-economy (nighttravel bank verdict). This run ADOPTS the stranded
0330Z loop-B run's pilot corpora verbatim; it does not re-scan seeds
11000–11447 and does not re-judge any earlier run's verdict. The governing
thresholds are adopted verbatim from the bank prereg
(evidence/2026-10-28/sim-nighttravel-bank-b-prereg.md, committed
bf3b685c9, cherry-picked here as 24e8677fb) — this file states them again
so the adoption's judge is on record BEFORE the analyzer output is read.

## Canon read before judging

- docs/CANON.md (manifest) — read first.
- docs/ABILITY-REFUSALS.md — pantry doors/ledger canon; this arm moves the
  PLAYER through the lodge door at evening time via insideevening's own
  evening step; it does not change the gate, the ledger, or any refusal.
- docs/TIME-ECONOMY.md (ticks/day-parts) — node travel free by engine law;
  the lodge detail walk bills walkStepKcal() per landed square plus 1 tick
  per step; arrival runs treelineAmbush / checkEncounter.
- No canon doc covers "travel home at evening time" as a policy rule — this
  is a player-behavior lever, not a system, so no canon is invented for it.
  Authority for the reach rule is the engine itself
  (travelTargets()/travelTo()/travelBlockage) plus prior arm evidence.

## Perception law (Steve 2026-10-28, binding)

Nighttravel's "home" is the villager's OWN haven: state.village.px/py
(engine default 4,4). The sense channel is lived-in knowledge: the player
knows home because they live there, and the reach check offers ONLY nodes
the engine already offers in Game.travelTargets() — revealed tiles within
Manhattan d <= 3, or adjacent tiles — places the player can see or has
revealed, never a roster, crew list, or snapshot. No list-fed wiring exists
in this arm.

## Policy (unchanged, policy-side only)

scripts/policies/nighttravel.js extends insideevening: competent.daily runs,
then the night step as the evening's LAST step before the harness's sleep.
Blocked-combat / blocked-tent / game-over: no travel, no entry. Already on
the haven tile: delegate to insideevening's eveningStep unchanged. Away:
REACH = the haven node appears in Game.travelTargets() — a single honest
travelTo hop, no force, no route-around, no blockage clearing, no multi-hop
trek. Not offered: 'out-of-reach', sleep away. Offered: ONE travelTo hop;
position unchanged: 'travel-refused'; fight live after the hop:
'travel-arrived-combat', no entry attempt; death on the hop: 'travel-died';
otherwise delegate to insideevening's eveningStep for the walk + 'Go
inside' leg. Zero src/js changes, zero default flips, no driver adopts the
policy. The driver is scripts/nighttravel-trace-b.js (30 loop-days, tap
days = last 5 loop-days, genuine thief tap, nofeast substrate
COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1, asserted FATAL).

## Adopted pilot corpora (copied verbatim, read-only source)

- Control: evidence/2026-10-29/sim-nighttravel-verdict-b-corpus-insideevening/
  (8 files, seeds 11031/11149/11307/11322/11360/11390/11429/11439).
- Policy: evidence/2026-10-29/sim-nighttravel-verdict-b-corpus-nighttravel/
  (same 8 seeds).
- Wedge: evidence/2026-10-29/sim-nighttravel-verdict-b-wedge-insideevening/
  (s11149 only).
All 17 copied files verified before judging: each parses as JSON, each
non-zero (71–100 KB). The wedge file is byte-identical (md5
ab5c8505b6819349afc1258cb282d4f3) to the corpus insideevening s11149 file.
The pilot seeds are exactly the bank's first 8 qualifiers (bank proof
B1–B8 green, re-run in this tree before judging): pilot
11149,11031,11307,11390,11429,11439,11322,11360; extension
11376,11384,11077,11133,11211,11299,11408,11438; confirm 20 seeds
11094,11112,11365,11435,11277,11370,11445,11074,11246,11288,11308,11335,
11349,11366,11409,11433,11037,11208,11251,11273. Bank 36 = full staging.

## Wedge step (step 1, declared now)

The 1934Z closeout wedge was: pilot chain parked 25:50 at 0:19 CPU, 8
control files 0 bytes. Test, in order: (a) if the copied wedge file is
already valid (parses, non-zero, complete per-seed record), that IS the
repro evidence — the s11149 insideevening run completed, the park does
NOT reproduce on this evidence, and no re-run is spent for show; (b) only
if the copied wedge file were corrupt/partial would that single seed be
re-run deterministically under a hard timeout (timeout 600), and a park
>10 min at near-zero CPU would be recorded as REPRODUCED with process
evidence and the verdict judged on the copied corpora instead of blocking.
Outcome (a) already holds on the copied file (see above), so no wedge
re-run is spent.

## Primary metric, GO threshold, minimum-n rule, guards (judge ONLY against these)

Adopted verbatim from the bank prereg. An evening is AWAY iff its
preStepTile is not 'haven'. Evenings with eveningOutcome 'game-over' are
excluded from every count. Population partition (disjoint, policy leg, in
order): blockedGuard ('blocked-combat'/'blocked-tent', excluded from the
primary denominator); havenUnknown ('haven-unknown', excluded); expeditionAway
(travelOffered === false, 'out-of-reach', NEVER pooled); blockedPathAway
('travel-refused' AND travel.hopReturnKind starts with 'block:', NEVER
pooled); withinReach (travelOffered === true AND NOT blockedPathAway —
the primary population); unclassifiedAway (any remainder, excluded,
investigated, never silently dropped).

PRIMARY (M1r, pooled over the judged band): within-reach conversion =
(withinReach away evenings ending inside on the haven tile: inside === true
AND tile === 'haven') / (all withinReach away evenings). Non-conversions
inside the denominator: travel-refused with null/non-block return,
travel-arrived-combat, travel-died, travelled-home-but-entry-failed.

- GO requires pooled withinReach n >= 8 AND pooled M1r >= 0.50 AND guards
  G1 AND G2 AND G3-fixed all hold on the pooled band.
- G1 (survival): median daysAlive on the policy leg >= control median - 2.
- G2 (starvation): starvation-caused deaths on the policy leg <= control + 2.
- G3-fixed (honesty, zero-tolerance): zero evenings where (a) entry
  completed while inCombat/pendingEncounter was live, (b) entry completed
  from a tent, (c) a travel hop that MOVED did not land on the haven node,
  or (d) a hop used force / more than one travelTo call. A refused hop
  (arrival == departure) is verified by arrival == departure AND outcome
  'travel-refused'; it is NOT a (c) violation. The legacy raw-false count
  is reported for transparency and is NOT the guard.
- Minimum-n: if pooled withinReach n < 8 at any stage verdict, the verdict
  is INSUFFICIENT-DATA — not GO and not NO-GO, no landing.
- NO-GO iff pooled M1r < 0.50 (with n >= 8) or any guard fails on the
  pooled band — OR a stage gate below fails conclusively before confirm
  is spent.

## Staged gates (adopted verbatim)

- PILOT GATE: both legs present for all 8 seeds, partition sums hold on
  every seed, no unresolved unclassified investigation. If pilot pooled
  withinReach n >= 8 AND pilot M1r < 0.50, pilot FAILS conclusively — STOP,
  verdict NO-GO on the pilot corpus, no extension, no confirm (fast kill).
  Otherwise pilot PASSES to extension: either n < 8 (extension mandatory),
  or n >= 8 with M1r >= 0.50 and guards holding on the pilot. A pilot-only
  guard failure does NOT by itself stop the run — guards are judged pooled
  — but it is reported and re-checked pooled.
- EXTENSION GATE: pool pilot + extension (16 seeds). n < 8 → STOP,
  INSUFFICIENT-DATA. Pooled M1r < 0.50 with n >= 8 → STOP, NO-GO. Any guard
  fails pooled → STOP, NO-GO. Otherwise ONLY THEN is confirm spent, and
  ONLY THEN is the verdict judged on the pooled bank (pilot + extension +
  confirm).
- The pilot-only and pilot+extension-only rates are staging diagnostics,
  never the verdict once confirm has run. The verdict is the pooled bank.

## Extension + confirm sourcing (only if gates pass)

Extension (8) and confirm (20) are run FRESH, both legs, on the bank seeds
above, with the same driver and substrate — never from scan rows (scan
rows are selection inputs, not judged corpora). Do NOT re-scan seeds
11000–11447.

## Balanced panel (MEASUREMENT.md §15 — explicit, not a fake)

NO balance-panel compare .md is produced, as pre-registered in the bank
prereg before this adoption: this leg is a 30-day position/reachability
measurement of a POLICY-SIDE arm — zero src/js changes, so there is no
game-root delta for a panel to compare (base panel vs lever panel would be
identical by construction), and the panel's registry policies do not
include the trace policies (insideevening/nighttravel) this arm measures.
The before/after instrument is the custom driver on identical seeds, and
the pre-registered thresholds above are the judge. Wall numbers are
reported as not-observable-in-30d for the judged corpora, never claimed as
movement. If this lever ever becomes a game change, a panel compare is run
at that point; a policy-side trace cannot fake one now. (This adoption
therefore attaches no panel compare .md, by pre-registration, not by omission.)

## Horizon + why (death-aware, never a fixed 200d)

30 loop-days, same as prior runs: the question is evening conversion, and
the away pattern is visible inside 30 days. Dead villages stop simulating
(runDays endReason); no +10d tail is needed because sleep rolls the day
and the next loop-day records the outcome. A longer horizon is NOT used:
the binding constraint is trigger rarity per seed, addressed by the wider
bank, and 30d preserves comparability with 2126Z (2/2), 2224Z (0/0), and
2255Z (7/7, n = 7).

## Landing rule (adopted verbatim)

- GO: lands the default-OFF policy instrument ONLY —
  scripts/policies/nighttravel.js plus its trace/analyzer/proof instruments,
  as a policy file no driver adopts by default. NO driver adopts it, NO
  default flip, NO src/js change, NO competent.js / insideevening.js change.
- INSUFFICIENT-DATA or NO-GO: the branch stays HELD, unmerged as a landed
  lever, with the bank (scan JSON + qualifier order + staged corpora
  actually run) committed for the next run. A NO-GO does not delete the
  policy file on this evidence alone (kill discipline, Steve 2026-10-21:
  a missed bar is not a kill without a root cause); deletion, if ever
  proposed, is a separate coordinator decision. An INSUFFICIENT-DATA
  verdict is explicitly not a kill and not a pass.
- This adoption's kill wording: if pilot NO-GO, the arm is KILLED as a
  staged verdict (no extension, no confirm spent); no game-code trace is
  left because this arm is measurement/instrument only, and the evidence
  + instruments commit is the kill record.

## Sense-testing (mandatory, in the evidence file)

Read transcripts end-to-end for at least: one travelled-home evening (does
the hop + walk + entry read as a sensible played evening — what did the
player pay, what did the arrival narration say?); one expedition-away
(out-of-reach) evening (does sleeping away read as the honest boundary,
not a silent failure?); one blocked-path-away evening if any occur (does
the refusal read honestly?). Judge meaning, not counts: a converted
evening that reads as a teleport is a failure of the lever even if M1r passes.

## Village assessment (mandatory, in the evidence file)

Plain words: what the village looked like, who thrived and who died and
why, what knowledge/capabilities were missing, which blank was filled (fix)
or documented (evidence). Plus wall numbers for the judged corpora
(national / table / wins, wave 4–5 reach, median survival) even if zero or
not-observable — no wall movement claimed unless measured.

## Metric review (mandatory section in every evidence file)

Judged ONLY against this preregistration. No mid-run re-scoring:
expedition-away and blocked-path-away evenings stay out of the primary
denominator as defined here; a thin withinReach denominator does not rescue
or sink anything beyond the minimum-n rule stated above. If the metric
proves wrong (e.g. the d <= 3 screen proves too narrow/wide vs what
travelTargets offers, or the haven (4,4) assumption fails on a judged
seed), write it under "metric review" and propose the revision for the NEXT
run.

## Seeds and control (stated before any judged run)

- Scan: already done (bank prereg), blocks from 11000, 448 seeds, 36
  qualifiers. NOT re-run here.
- Pilot: first 8 qualifiers (both legs, fresh in the stranded run; adopted
  verbatim here): 11149,11031,11307,11390,11429,11439,11322,11360.
- Extension: next 8 qualifiers, run ONLY if the pilot gate passes:
  11376,11384,11077,11133,11211,11299,11408,11438.
- Confirm: rest of the bank (20), run ONLY if pilot+extension pass:
  11094,11112,11365,11435,11277,11370,11445,11074,11246,11288,11308,11335,
  11349,11366,11409,11433,11037,11208,11251,11273.
- Control (shared, identical seeds, SAME driver): insideevening-only policy.
- Substrate (both legs and scan, asserted FATAL in the driver):
  COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1.
- 10714 / 10720 prediction — POST-VERDICT DIAGNOSTIC ONLY, not part of
  this verdict, not a selection reason, not in any band.
