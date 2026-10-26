# Loop B round 1237 — food-economy (coordinator evidence)

Run: fleshout-loop-b-20261026T1237Z. Axis: food-economy (second
non-converged axis). Loop A live on scale-onramp for the whole run
(1230Z claim: w3rederive + woundprice + defnarr) — NOT touched.
Master moved once under the run (journey succession r49, lane B) —
zero file overlap with either arm; both branches rebased clean in
their own worktrees, proofs green after every rebase and on merged
master. No EPERM flap this run. check.js --quick was started but
ABORTED by the coordinator after ~6 min with no output (loop A
still live, so a partial result would have been unattributable);
clean attributable evidence is the arm proofs re-run on merged
master (substrate 134/0, cookdiv 26/1 where the 1 failure is the
verdict). check.js left no stray tree changes. Safe-commit index clobber hit both
worker commits — repaired via HEAD-blob cacheinfo each time, commits
verified correct, main tree clean at closeout.

## Pre-registration (both arms, headers in arm evidence)

Arm 1 sim-cookdiv-b: distinct cooks >= 2 on >= 6/8 seeds AND total
voice >= 0.80x R baseline AND median survival >= 0.80x baseline AND
starvation <= baseline + 2 (pilot 8 seeds, leadfeast/pd0/dg1, 100d).
Arm 2 sim-substrate-b: DIAG-GO iff every racks-bound day lands in
exactly one substrate class, the dominant state is named with its
share, and a named next step follows (pilot 8 seeds,
competent-nofeast, 100d). No metric was re-scored mid-run.

## Arm 1 — sim-cookdiv-b (8d6411586): PILOT NO-GO, rule Y KILLED

Rule Y ("yesterday's speaker yields"): under landed rule R, when the
cook who would speak is the most recent R speaker, the voice is
silenced and the day slot stays open for the next cook. Reminders
always speak; yielding suspends at the 7-silence threshold, so R's
coverage guarantee survives.

- Bar (a) distinct cooks >= 2 on >= 6/8: PASS, 7/8 (only zero-voice
  9751 misses).
- Bar (b) band voice >= 0.80x R: FAIL, Y 107 vs R 156 (0.686x).
- Bars (c) median, (d) starvation, (e) max voiceless run <= 6,
  (f) neutrality: all PASS (median 100d vs 100d, starvation 3 vs 3,
  voiceless runs 3, 0, 6, 6, 6, 2, 6, 3; numerics identical).
- Proof: 26 PASS / 1 FAIL, and the single failure IS the verdict.
- No confirm spend. The variant was killed: src/js/game.js reverted
  to HEAD content (zero RACKSVOICE_ROTATE identifiers, syntax OK);
  this commit holds tooling + evidence + corpus only, zero src/js
  diff. It lands as a completed DIAG measurement (dominance baseline
  + yield-trap diagnosis), not as a game change — the killed rule
  leaves no trace in the game.

The named reason — the yield trap: the speaker baton passes only on
voices. When the second cook's follow-up evaluation is a frozen
silence, it spends the day slot without passing the baton, so the
first cook keeps yielding to an absent second cook until the
threshold forces a voice. 9756 voices only on days 36, 48, 60, 78
over 22 racks-bound days — exactly 6 silent days, then a voice,
repeating. The diversity win is real (9757: all-Miguel 41 under R
becomes Miguel 27 / Grace 26 under Y, voice total actually rising
53 vs 41), but the volume collapse on 9752/9753/9754/9756 kills it.

Dominance baseline under R is now measured, not anecdotal: 9750
Sierra 12 / Malik 1; 9752 Mason 6 / Theo 14; 9753 Courtney 32 /
Owen 2; 9754 Jenny 20 alone; 9755 Otto 9 alone; 9756 Grace 18 /
Hassan 1; 9757 Miguel 41 alone. Sense-testing passes: rotated
voices read as different people speaking, not the same line under
different names. Next rotation arm must start from the yield trap
(an expiring yield, or first-candidate-slot rotation) and must carry
a second-cook SHARE bar alongside distinct — 9754 passes distinct at
Jenny 5 / Oscar 1 while still first-cook-dominated.

Wall (R and Y identical — voice never leaks into state):
national-or-better 7/8, table 0/8, wins 0/8 (SEATDRIVE=0 construction
zeros), wave-4 4/8, wave-5 0/8, median 100d capped, deaths 50
(arena 28, starvation 3).

## Arm 2 — sim-substrate-b (407a5f296): DIAG-GO, LANDED

Substrate-state hunt for P-RACKS-NOELIG (1130Z blank 3), on the
competent-nofeast band, seeds 9750–9757, 16 configs (cap0 neutrality
control + cap1 substrate corpus). Proof 134/0 after rebase.
Neutrality first: cap0 vs cap1 numeric fields identical on 8/8
seeds; the recorder wraps only Game.say and delegates identically.

Classification complete: 327 racks-bound days, 327 day rows, each
with exactly one class, 0 unclassified. Dominant state:
S-NO-FORAGE-DUTY, 326/327 days (99.7%). S-FORAGED 1 (0.3%);
S-THROTTLED 0, S-THROTTLED-PARTIAL 0.

The 1130Z hypothesis does not describe these villages: on
racks-bound days, foraging isn't stopped — it's never assigned.
Duty forage returns in the whole band: 3 lines, all Sierra on seed
9750 (2 on the single FORAGED bound day, d47). Voiced throttle
redirects by from-task: harvest (garden) 573, fish nets 93,
forage 0. Competent never assigns forage duty; the only route to a
forage resolution is a forage task lead. The throttle IS engaged
nearly every day — just on garden/fish: every one of the 327 bound
days carries exactly one voiced garden/fish redirect. Median fresh
pantry stock at the first bound line: 59.5 days-on-hand; median
pantry total 58,778 kcal. Eligible about-to-rot surplus is present
on 327/327 bound days, so "no eligible forage" is also false, and
the day-level NOELIG zero is confirmed again (0 plain racks-full
lines without eligible surplus).

Named next step (not a policy swap): an inflow-source hunt — thread
stockPantry inflows by source per day on racks-bound days to answer
where full racks come from when nobody forages.

Caveats recorded in the arm evidence: (1) Rule R drift — current
master runs the reminder voice gate, not gate B alone, so 450/763
plain bound lines carry voiceSpokenToday=false (reminder-silenced);
the plainvoice gate-B taxonomy's "impossible combo" no longer
holds, and any future voice taxonomy must be rebuilt on rule R.
Day classification here never uses voice, so this verdict is
unaffected. (2) Say recorders can't see silent throttle redirects
(1 voiced/day gate) or the scholar's own forage trips (policy ctx,
not Game.say); exposure here is negligible (3 forage-duty lines
total), but a forage-heavy policy arm must thread the throttle
ledger and ctx.forageTrips before trusting a NO-DUTY label
village-wide. (3) Drift vs the noelig corpus: 7/8 seeds reproduce
noelig numerics exactly; 9752 drifted (batches 132 -> 106,
resolutions 41 -> 39). The verdict rests on this run's own paired
corpus.

Wall (corpus): national 0/8, table 0/8, wins 0/8 (SEATDRIVE=0
construction zeros), wave reach {2: 4, 3: 4}, wave-4 0/8,
wave-5 0/8, median 100d capped, deaths 43.

## Scale wall (this run's judged corpora)

Cookdiv band: national-or-better 7/8, table 0/8, wins 0/8,
wave-4 4/8, wave-5 0/8, median 100d. Substrate band: national 0/8,
table 0/8, wins 0/8, wave-4 0/8, wave-5 0/8, median 100d. Neither
band moves the wall — both are SEATDRIVE=0 measurement corpora, not
scale arms. Judge future food-economy arms against these bands, not
against the WINSEAT baseline.

## Telemetry deviation check

Substrate corpus: 3 LOUD lines (national 12 -> 0, table 16 -> 0,
wins 16 -> 0). Cookdiv corpus: 3 LOUD lines (national 12 -> 21 over
24 double-counted R/Y/B files, table 16 -> 0, wins 16 -> 0). All are
the known ingestion-shape artifact class (recorder rows carry
nationalEver/won, not top-level national/wins; substrate zeros are
SEATDRIVE=0 construction). Baseline NOT rolled.

## Balanced panel

Attempted on both arms; cannot ingest recorder corpora (runner
requiring --out, spawns its own sims). No panel fabricated; paired
identical-seed tables are the comparison of record.

## Village assessment (plain words)

The racks-full village is not a village that stopped foraging — it
is a village that never sends anyone to forage in the first place,
while its gardens and fish nets keep it fed for nearly two months
of stored food. The cook who speaks for the racks is usually the
same person day after day, and the one rotation tried here did make
a second cook speak — but only by silencing so many days that the
kitchen went quieter overall. The blanks filled: where the racks
silence comes from (no forage duty, garden/fish throttle instead),
and why the first rotation failed (the yield trap). The blanks
left: where full racks come from with no foragers, and a rotation
that shares the voice without quieting the kitchen.

## Metric review

No metric proved wrong this run; both headers judged as written.
Carried forward, not re-scored: (a) any future change-only voice
arm must pre-register a SINGLE ratio bar (1035Z joint-unsatisfiability
finding stands); (b) any future rotation arm must carry a
second-cook share bar alongside distinct cooks (9754 shows distinct
alone is gameable by a 5/1 split).

## Next blanks, in order

1. Inflow-source hunt on racks-bound days (substrate next step).
2. Yield-trap successor rotation (expiring yield or
   first-candidate-slot rotation, with a second-cook share bar).
3. Plain-silenced indistinguishability (deferred blank 2 from
   1130Z — a player still cannot tell a swallowed complaint from
   quiet cooking).
4. Any other reminder interval N is a new arm, not a retune.
5. Rule-R voice taxonomy rebuild (gate-B taxonomy no longer holds
   under the reminder gate).

Evidence: evidence/2026-10-26/sim-cookdiv-b.md + corpus
(8d6411586) and sim-substrate-b.md + corpus (407a5f296).
Merged locally, pending ship.
