# Loop B round 1543Z — food-economy: dipslide recovery-rule pilot NO-GO + haul-ceiling decomposition pilot NO-GO, merged locally pending ship

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261101T1543Z, axis
food-economy (second axis). Sibling Loop A live on scale-onramp for the
whole run (1415Z claim at run start: muster + wave4leth, NOT touched;
A closed that run and opened a new 1706Z run mid-way through this run's
landing: stay + heraldarr, also NOT touched). This run took the 1430Z
closeout's next blanks in order, skipping (1) HUNGER WINTER relief
passivity (steve-call candidate, still needs a ruling first): blank
(2) dipslide next design and blank (4) haul-size question. No B lock
at run start; claim written before any sims
(lever-claims/fleshout-loop-b-20261101T1543Z.json, deleted at closeout).

Pre-flight: main tree clean, disk 21%. Reaper ran clean (other lanes'
active trees untouched). Registration queued ~5 min each behind the
registry flock held by another lane; no registration failed.

## Arm 1 — sim-dipslide2-b: recovery-to-candidate-level pilot NO-GO, DIAG only

Worker commits rebased onto c7bf25a51 clean, proof re-run green
post-rebase 22/22 pure, merged --ff-only as a0c0e6c06 (prereg
c33fe60e8, closeout a0c0e6c06 after rebase; original branch commits
f9925b79b / b13a1f07a). Coordinator re-ran the proof on the rebased
branch: scripts/test-dipslide2-b.js 22/22 pure.

Design picked (one of the three named in the 1430Z closeout): (c)
recovery-to-candidate-level — a candidate confirms only if the pantry
NEVER climbs back to the candidate evening's level at any evening in
the 5-evening window. Fresh seeds 51301–51308, competent, 30d,
depositgate-armed substrate. Prereg committed BEFORE any judged sweep.

- (p1) FALSE-FIRE RATE: PASS trivially, 0/8 = 0% vs 25% cap — but 0%
  by silence, which is what (p2) exists to catch.
- (p2) SENSITIVITY: FAIL. Zero pilot seeds have a confirmedDay in
  their final engaged run. The sensor confirms nowhere in the band.
- Verdict: pilot NO-GO, judged exactly against the prereg. NO confirm
  band run. Confirm seeds 51311–51322 were RESERVED but never run and
  remain fresh for a future run.

The one case that matters: 51308, old-rule fire (candidate day 10,
confirmed day 15), killed under the new rule by a single evening's
+215 kcal uptick (+0.99%) on day 11, after which the pantry falls every
evening to 17,658 by day 15 and 12,641 by day 23. That is the THIRD
hairline bounce doing (c)'s work in program history (51207 +389,
51211 +186, 51308 +215 — all under 2.3%, all one-evening upticks on
trajectories that keep falling). A rule that lets a single evening's
+1% decide between "slide" and "dip" measures noise, not recovery.
Old rule fires only 1/8 in final runs on this band vs 4/12 on the
51201–51212 band — band variance warning, not a re-score.

Sense test: 51308 day-15 voice still says shelves full while the
total store slides (level-vs-stock gap, every dipslide arm's finding);
day-10 transcript reads like people (paired outings, gossip
distorting across retellings, a first grave landing as crisis). One
mildly robotic note, recorded not chased: Ellie's "Not today. Sorry.
(Low trust — reluctant.)" repeats three times on day 10. The known
"pot stays full" line did NOT reproduce in this band.

Panel §15: inapplicability declared with the prior arms' reasoning
(within-trajectory instrument comparison, no game-code change, no
lever); no compare fabricated. Zero src/js, zero policy-default
flips. New files only, all *-dipslide2-b.*.

## Arm 2 — sim-haulsize-b: haul-ceiling decomposition pilot NO-GO, DIAG only

Worker commits rebased onto a0c0e6c06 clean (rebase stopped at the 2nd
pick with the documented stop-at-pick quirk — pick in both done and
todo lists, tree clean, pick unapplied with 0 NO_TARGETS markers;
recovered with git rebase --continue, all 3 commits exactly once),
proof re-run green post-rebase 30/30 pure, merged --ff-only as
cd9a07fea (prereg 9a0e45fb3, amendment c93e9fa1b, closeout cd9a07fea
after rebase; original branch commits 8a0b11e9f / 5cc47f309 /
143c5d1ad). Coordinator re-ran the proof on the rebased branch:
scripts/test-haulsize-b.js 30/30 pure.

Question: why is 8 nuts / <2,000 kcal the ceiling? Fresh seeds
51501–51508, competent, 30d, DEPOSITGATE=0 (keep 2,000). Prereg +
amendment v2 committed BEFORE any judged sim. Judged exactly against
the prereg bars:

- PRIMARY (successful-trip stopping reason, >= 6/8 seeds): NO-GO at
  5/8. POLICY_ONE_TRIP attributes 5/8 seeds (51501, 51502, 51503,
  51507, 51508, share 1.0); the other 3 (51504, 51505, 51506) are
  UNATTRIBUTED by the prereg's own >= 5-trip-day floor (1, 0, and 4
  successful-trip days). No re-score: POLICY_ONE_TRIP being unanimous
  across successful days (64/64) does NOT convert 5/8 into a GO.
- SECONDARY (failed-trip reason): FAILED_WORKED_OUT on 8/8 seeds
  (share 1.0). The secondary has no confirm rule in the prereg, so
  no 12-seed confirm is run on it either. This is a finding, not an
  instrument failure — but the finding rides on the secondary.

The answer, in two stacked causes:

1. FAILED DAYS DOMINATE: 160/240 pilot days (67%) end with zero
   successful forage — reached patches are cell-picked-clean (~2-day
   regrow; tile stock does not deplete on a sweep, so candidates keep
   appearing while their cells stay unharvestable) and onward travel
   is often blocked (135 blocked day-level attempts).
2. ONE SWEEP PER SUCCESSFUL DAY: on the 64 successful-trip days
   (27%), the scholar stops after exactly ONE forage sweep — 64/64
   POLICY_ONE_TRIP — although 80–112 ticks remain (a trip costs 16),
   the pack sits at most 87% full, and 4+ stocked tiles remain.
   Knowledge is NOT the cap (unknown species ARE harvested into the
   lump); pack capacity is NOT the cap (max 87%); time is NOT the
   cap. One sweep is ~3 cells at 3–5 units each, nut-heavy, mostly
   unshelled or unknown value — which is why no finished pack ever
   clears the 2,000 keep (max finished 1,720; unload 0 band-wide).
   6/8 seeds are haul-size-shaped (max combined < 2,000), reproducing
   the shelling band's shape on fresh seeds: the ceiling is a band
   property, not a seed quirk. Seed 51505 returns home 28 times in
   30 days carrying zero food value (materials only) — return counts
   are not haul deliveries.

Next lever candidates, in evidence order (each needs its own prereg;
none claimed GO by this diag): (1) SECOND-TRIP / MULTI-SWEEP arm
(second forage trip after a successful first, judged on
successful-trip days only); (2) REGROW / PATCH-ROTATION arm (cell
regrow timing vs trip cadence, and/or rotation preferring unworked
tiles; judged on failed-trip rate — the bigger lever at 67% of days,
but needs its own decomposition first); (3) ROUTE-BLOCKAGE arm
(route-around / standing-home gates, currently OFF, vs failed-trip
rates; do NOT bundle with (1) or (2)). Plus the metric-review call:
the NEXT prereg should carry TWO primaries (successful-trip reason
and failed-trip reason, each with its own GO bar and confirm band)
and name the "primary NO-GO with complete secondary attribution"
branch explicitly.

Panel §15: inapplicability declared (within-trajectory diagnostic,
no game-code change); no compare fabricated. Zero src/js, zero
policy-default flips. New files only, all *-haulsize-b.*.

## Telemetry deviation check (coordinator, post-merge)

Both arms' pilot jsonl files were REFUSED by the tool itself
(single-JSON-document parse; multi-line jsonl fails at line 2) — the
same input-format limitation precedent as the 1430Z shelling
confirm-armed file, not a deviation. No investigation item. (The
1430Z missing-field LOUD class does not apply here because the tool
never got as far as field comparison.)

## Wall numbers

NOT measured by these 30d pre-seat windows: full seat 0 / wave 5
reached 0 stand as last measured (Loop A lane). In-window:
dipslide 8/8 survived 30d, wave max 2, collapses 0; haul 8 seeds × 30
days, wave max 2, unload 0 band-wide, collapses not the measured
quantity (pilot ran to the 30d horizon).

## Infrastructure

- EPERM WRITE FLAP, SPREADING (this run, ~16:20–17:15Z+): registry
  heartbeat writes failed repeatedly (PermissionError on
  REGISTRY.json atomic write); safe-commit failed on a /tmp index
  lock write; git loose-object writes failed ("unable to write
  loose object file: Operation not permitted"); a /tmp probe write
  failed the same way. The flap is intermittent across paths and
  minutes — a sibling worker's commit and both coordinator merges
  succeeded in passing windows, and both releases succeeded. Lesson
  carried forward: when a closeout commit fails on EPERM, retry in a
  passing window (dipslide closeout succeeded on the second agent
  attempt with no retries needed); NEVER force ref surgery during
  the flap. Registry heartbeat_at for this run's trees stayed at
  15:52Z (last successful heartbeat) — 1h28m stale at landing, well
  under the 4h reaper threshold, and both trees were released
  normally after merging.
- REBASE STOP-AT-PICK QUIRK (haul arm, documented class): rebase
  stopped at the 2nd pick with the pick in both done and todo lists,
  tree clean, pick unapplied (0 NO_TARGETS markers in tree).
  Recovery per the standing lesson: verify tree clean + pick
  unapplied, then git rebase --continue — sailed through remaining
  picks, final log shows each commit exactly once. Do NOT edit the
  todo or abort on first sight.
- MERGE DISCIPLINE (1430Z lesson honored): each arm merged --ff-only
  ALONE and verified (log + proof re-run + tree clean) BEFORE any
  release step; releases/removals/branch deletions ran as separate
  verified steps afterwards. No premature-release chain.
- check.js --quick NOT re-run: zero src/js, zero green-list files
  on either arm; standing pre-existing profile untouched.
- Loop A note: A's 1415Z run closed and a new 1706Z run opened during
  this run's landing (stay + heraldarr, scale-onramp, DIAG only).
  Zero file overlap with either B arm; B's rebases landed on top of
  journey-social r80 / journey-scale r67, not on A's in-flight work.

## Verdicts

- sim-dipslide2-b: pilot NO-GO (sensitivity fail; recovery rule too
  brittle at 1% noise). DIAG only, landed.
- sim-haulsize-b: pilot NO-GO on primary (5/8 < 6/8); finding
  stands on the secondary (FAILED_WORKED_OUT 8/8) + unanimous
  POLICY_ONE_TRIP days (64/64). DIAG only, landed.
- food-economy stays converging (NOT converged): the sensor program
  now knows its recovery test must tolerate noise, and the haul
  ceiling is now decomposed into failed days (67%) + one-sweep days
  — but no default has flipped, no game change landed, and no wall
  movement is shown. scale-onramp untouched (sibling Loop A lane).

Next blanks, in order: (1) HUNGER WINTER relief passivity
(steve-call candidate — still needs a ruling before any work);
(2) dipslide tolerance design (recovery = climbing back ABOVE
candidate level by more than a noise margin, e.g. 5%, or staying
above it for 2 evenings running; or a smoothed-window test) — new
prereg, keep (p2), fresh band or the still-fresh 51311–51322
reservations; (3) shelling default-flip call (is the proven habit to
become default play, and on which trigger?); (4) haul-size follow-ups
in evidence order: second-trip/multi-sweep, regrow/patch-rotation,
route-blockage — each its own prereg, plus the two-primary prereg
shape for the failed-trip question; (5) P3 reset follow-ups — night-22
+3,005 silent inflow bridge (still undocumented), double endDays on
vessel-death days; (6) patrol-departure narration; (7) garden/fish/
traps early path (marginal 2.8% combined — ripening / assignment
path, not yield numbers); (8) creek clearance wood-bound — evening
wood-carrying before any creek-clearing lever; (9) rubble daytime-
clearing habit unmeasured; (10) washed_out scramble narration;
(11) 96-tick bridge edge unobserved; (12) a 120d window only if a
new horizon-cut episode appears.

Coordinator evidence: evidence/2026-11-01/sim-food-dipslide2-haulsize-round-1543.md
(this file). Claim deleted; lock deleted.
Merged locally, pending ship.
