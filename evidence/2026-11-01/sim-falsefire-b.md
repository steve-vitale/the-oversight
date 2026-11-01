# sim-falsefire-b — DEFINITION SETTLED, DEPLOYABILITY NOT ESTABLISHED: Q1 NO-GO + Q2 NO-GO (pilot too quiet)

Run: oversight-flesh-out-loop-b, arm sim-falsefire-b, axis food-economy.
Worktree sim-falsefire-b, branch sim-falsefire-b. Settles the dipslide
sensor program's open question from Loop B round 1725Z
(evidence/2026-11-01/sim-food-dipslide3-multisweep-round-1725.md):
whether "survived slide" should count as a false alarm at all — plus
the hairline-only gap (two separated sub-5% evenings confirming
unflagged). DIAG ONLY: zero src/js changes, zero policy-default
flips, zero edits to any existing script or policy file. New files
only, all named *-falsefire-b.*: prereg, analyzer, proof test,
evidence, corpus. The depositgate driver, the dipslide analyzers,
and the competent policy are REUSED VERBATIM, never edited. This
worker does NOT push, bump, verify live, or merge into master; the
coordinator merges.
Status to coordinator: committed on branch sim-falsefire-b, pending
coordinator merge.

## Verdicts: judged literally against the prereg bars — no re-scoring

Prereg: evidence/2026-11-01/sim-falsefire-b-prereg.md, commit
1aa0f4163e0f3ce8a0c27f512fd98a28bafabc00, written and committed
BEFORE any judged sweep or judged re-analysis (pure proof tests
48/48 ran before the prereg commit; the analyzer fix below
implements the prereg's stated censored-rate rule and changes no
prereg word). The settled definition, in plain words: a sensor
warning is a false alarm only if the pantry climbs back to where
it was when the warning fired within ten evenings — a slide that
stays down for ten evenings and only then recovers, or ends in
collapse, was a real slide worth warning about, even if the village
survives.

Q1 — FALSE-FIRE DEFINITION SETTLED, DEPLOYABILITY NO-GO.

- (FF-1) POOLED JUDGED RATE: PASS. (1 corpus false + 1 pilot
  false) / (12 confirmed − 3 censored trues) = 2/9 = 22.2% <= 25%.
  Pooled observed rate (censored trues counted as true) = 2/12 =
  16.7%. Per-band judged rates: corpus 1/8 = 12.5% (observed 1/10
  = 10%); pilot 1/1 = 100% (observed 1/2 = 50%).
- (FF-2) PILOT SENSITIVITY: FAIL. Pilot confirms 2 (51602, 51604)
  against the >= 3 bar. The pilot band was quiet: only 2 of 8
  seeds fired at all, vs dipslide3's 10/20.
- (FF-3) PILOT JUDGED RATE: FAIL. 1/1 = 100% > 25%: the pilot's
  single uncensored fire (51602) was a genuine quick recovery.
Q1 GO requires FF-1 + FF-2 + FF-3. Two fail, so Q1 is NO-GO: the
sensor is STILL NOT DEPLOYABLE as a slide warning. The definition
itself stands as settled either way (that is the settlement, stated
in the prereg before judging); what fails is the deployability
verdict under it. The pooled pass does NOT rescue the verdict:
the prereg requires all three bars, and the fresh band — the leg
that must certify deployability — fails two of them.

Q2 — SEPARATED-WIGGLE EXTENSION: NO-GO BY THE LETTER (flag stands,
adoption withheld).

- (W-1) EXTENSION INCIDENCE: PASS. Pilot extension-resting
  confirmations 0 <= 2. Corpus extension-resting confirmations
  also 0 (see below).
- (W-2) EXTENSION NOT LOAD-BEARING: FAIL. Pilot sensitivity
  excluding extension-resting confirmations = 2 − 0 = 2 < 3.
Q2 GO requires W-1 + W-2, so Q2 is NO-GO. Read this failure
correctly: it is pilot quietness, NOT extension incidence. Nothing
rested on the extension on either band (0 extension-resting
confirmations across all 28 seeds) — but the band cannot certify
the >= 3 non-extension floor, so per the prereg the extension is
NOT adopted for verdict purposes. The flag stands (the gap is
closed definitionally: separated shapes are now classified and
counted), but any future deploy claim must first decide in its own
prereg whether separated shapes confirm or are rejected. The
firing rule never changed in this arm, so NO verdict changes vs
the dipslide3 rule on firing — only flagging changed, exactly as
pre-registered.

## Corpus re-analysis (judged, no new sims): dipslide3's 10 fires re-scored

Applied the settled definition to the dipslide3 corpus files
(seeds 51311–51330) with the new analyzer. NO analyzer discrepancy:
the confirmed seeds, candidate days, confirmed days, and candidate
levels match dipslide3's published tables exactly on all 10 fires,
and the extension-resting count is 0, as expected from the
published windows (none reaches candidate level). The re-analysis
changes the SCORE of those fires, not their existence.

| seed | cand (level) | conf | shape | fire | reason | recDay | cens | end |
|---|---|---|---|---|---|---|---|---|
| 51312 | 9 (21,800) | 14 | clean | true | sustained-slide | — | no | survived |
| 51314 | 23 (12,250) | 28 | clean | true | sustained-slide | — | yes (2 ev) | survived |
| 51315 | 8 (22,500) | 13 | clean | true | sustained-slide | — | no | survived |
| 51316 | 9 (21,250) | 14 | clean | FALSE | quick-recovery | 15 | no | survived |
| 51318 | 9 (21,300) | 14 | clean | true | sustained-slide | — | no | survived |
| 51319 | 8 (19,500) | 13 | clean | true | sustained-slide | — | no | survived |
| 51320 | 9 (24,600) | 14 | clean | true | sustained-slide | — | no | survived |
| 51324 | 8 (21,350) | 13 | clean | true | sustained-slide | — | no | survived |
| 51326 | 19 (11,681) | 24 | clean | true | sustained-slide | — | yes (6 ev) | survived |
| 51328 | 11 (16,271) | 16 | clean | true | sustained-slide | — | no | survived |

Corpus judged rate 1/8 = 12.5% (observed 1/10 = 10%). Old
survived-seed rate for comparison: 10/20 = 50%. The settled
definition moves the corpus from "half the fires false" to "one
fire false" — and that one fire deserves a close look (below).

THE CORPUS FALSE FIRE IS A 5-KCAL EDGE CASE. 51316's pantry:
candidate day 9 at 21,250, confirmed day 14 at 20,100, then day 15
at 21,255 — FIVE kcal above the candidate level (+0.02%) — then
falls again to 15,700 by day 24. Under the settled definition this
is a quick recovery and counts as false, because the rule counts
ANY evening at or above the level. But a 5-kcal bounce is the same
hairline class the tolerance rule was built to forgive inside the
confirmation window, now reappearing one evening past it. The
verdict does NOT change (the prereg fixes the rule and forbids
re-scoring), but metric review (1) carries this forward: the
recovery test has no noise margin, and its single corpus false
rides on rounding-sized noise. A future arm may propose a recovery
margin — it would be a NEW definition in a new prereg, not a
correction to this one.

CENSORED CORPUS TRUES: 51314 (confirmed day 28, only days 29–30
observed: 5,903 → 5,450, both far below 12,250) and 51326
(confirmed day 24, days 25–30 observed: 5,400 → 6,671, all below
11,681). Both are true as observed; both are excluded from the
judged denominator per the prereg's conservative rule. Neither
carries the corpus pass: the observed rate (10%) also passes.

## Pilot band 51601–51608 (judged sims, armed only, 30d competent)

All 8 seeds verified first try (rows == daysAlive each), no
EPERM-flap retry needed. Census validity: all 8 valid, zero null
pantry rows. 7/8 survived; 51608 collapsed (village-lost, day 28).

| seed | end | days | cand (level) | conf | shape | ext | fire | reason | recDay | cens | levelSD | wave |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 51601 | survived | 30 | — | — | — | no | — | — | — | — | — | 2 |
| 51602 | survived | 30 | 17 (18,300) | 22 | clean | no | FALSE | quick-recovery | 27 | no | — | 2 |
| 51603 | survived | 30 | — | — | — | no | — | — | — | — | — | 2 |
| 51604 | survived | 30 | 19 (15,072) | 24 | clean | no | true | sustained-slide | — | yes (6 ev) | — | 2 |
| 51605 | survived | 30 | — | — | — | no | — | — | — | — | — | 2 |
| 51606 | survived | 30 | — | — | — | no | — | — | — | — | — | 2 |
| 51607 | survived | 30 | — | — | — | no | — | — | — | — | — | 2 |
| 51608 | village-lost | 28 | — | — | — | no | — | — | — | — | 12 | 2 |

Eligible candidates that never confirmed: 51601 (21, 28, 29),
51603 (25, 26), 51608 (11, outside its final run). 51604's later
candidate 20 is tolerance-restored (confirms under tolerance, not
under dipslide2) but carries nothing — the seed already confirmed
on candidate 19. Pilot old survived-seed rate for comparison: 2/7
= 28.6% (also above the old 25% cap). Pilot collapse earliness:
judged (1 collapsed seed) but NOT passing — 51608 never confirmed,
so earliness is undefined, not >= 3.

THE PILOT FALSE FIRE IS A GENUINE REVERSAL, NOT NOISE. 51602's
window (candidate 17 at 18,300): days 18–22 run 17,900 → 14,900 →
15,472 → 16,117 → 16,401 — below-level wiggles only, a clean
slide. Days 23–26 hover 15,579–16,930, still below level. Then day
27 jumps to 22,097 (+20.7% over level), day 28 holds 21,421, day 29
reaches 30,148. The village genuinely turned its pantry around
within 5 evenings of confirmation. Under the settled definition
this is a false fire, and rightly so: the warning's prediction (a
sustained slide) did not hold. Contrast 51316: both count as
false, but only 51602 looks like a real reversal. The definition
does not distinguish them — metric review (2) notes the
magnitude question for a future arm, without re-scoring either.

THE PILOT TRUE FIRE IS A SLIDE THAT NEVER COMES BACK (AS FAR AS
THE WINDOW SEES). 51604's window (candidate 19 at 15,072): days
20–24 run 14,300 → 14,738 → 13,700 → 12,660 → 14,300, endpoint
below level, clean. Days 25–30 keep falling: 14,183 → 13,278 →
12,542 → 12,655 → 10,786 → 10,500. Censored only because the window
ends (6 of 10 horizon evenings observed); the trajectory gives no
reason to expect a day-31 recovery to 15,072. This is the settled
definition working as designed: a real, sustained slide on a
village that survives is a TRUE warning, not a false alarm.

THE COLLAPSING VILLAGE NEVER GOT A WARNING — BECAUSE THE GATE
STOOD DOWN. 51608 is the program's second collapse (after pilot
51101) and the first on a fresh band since then. Its pantry falls
almost the whole month (38,000 → 700, starvation deaths days 21,
27, 28), with one bizarre day-25 spike to 38,085 from 1,365 that
collapses again immediately. But the sensor never fires: the gate
is engaged only on days 1–4, 8–9, and 11, so the final engaged run
is day 11 ALONE, the level stand-down is day 12, and the seed's
only eligible candidate (day 11) cannot confirm because its D+5
(day 16) is disengaged. The sensor's final-run counting — which
every dipslide arm has relied on — has nothing to score once the
gate stands down early. This is a GATE-COVERAGE finding, not a
scoring finding: on the one village that dies, the instrument
that decides "engaged" goes quiet on day 12 while the pantry
falls for 16 more days. Flagged for the coordinator (see metric
review 3); it is not chased mid-run, and it does not change any
bar here.

## Sense test (SENSE-TESTING LAW: read, don't just count)

The confirming evenings read like a real pantry slide to a player
— with the same voice gap every dipslide arm has diagnosed. On
51602's confirmation evening (day 22, total 16,401, down from
18,300): "Yuki checks the pantry before heading out — the shelves
are full, ~7 days of fresh on hand… leaves the harvest standing
and turns to the wood run instead. The pantry can't take more;
the wild will keep." On 51604's (day 24, total 14,300, sliding to
10,500): "Linh checks the pantry before heading out — the shelves
are full, ~6 days of fresh on hand… leaves the harvest standing
and turns to the water run instead." In both cases the fresh
slice looks healthy while the whole store slides — a warning
firing here would read to a player as a village noticing a slide
its own voice is not announcing, which is exactly what a warning
is for. The settled definition's split reads sensibly too: 51602's
warning would feel, in hindsight, like a reasonable alarm about a
slide that genuinely reversed (day 27's "shelves are full, ~8 days
of fresh" at 22,097, on the way to 30,148), while 51604's reads
like a warning that stays true to month's end. The one line that
does NOT read sensibly is 51608's: on day 28, as villagers starve
("Cristian starved. Slowly. Nobody eats much tonight."), the line
is "The pot stays full and nobody touches it." — the known "pot
stays full" prose line, reproducing here 1/8 after 0/20 on
dipslide3, in the grimmest possible context (a full pot beside
starving people). Recorded only, not re-litigated; the line was
already filed by the depositgate arm.

## Reachability + wall numbers (measured in-window; 30d limit stated)

A 30d pre-seat window CANNOT measure national / table / wins —
those are late-game states, and this sweep carries no such fields.
NO wall movement is claimed. In-window, pilot band: 7/8 survived
30 days (median 30, max 30); collapses 1/8 (51608, village-lost
day 28); wave reach max 2 (8/8 reach wave 2); waves 3–5 not reached
in 30 days (expected — early window). Arc II/III/IV, regional →
national, table, win flag: not reachable in this window, not
measured, not claimed. Collapse supply program-wide is now n = 2
(51101 + 51608); collapse earliness remains measured only on
51101, since 51608 never confirmed.

## Balanced panel (§15)

No panel compare is fabricated, per the prereg's inapplicability
declaration (same reasoning as the prior arms): this arm changes
no game code, runs no lever, and its primary metric is a
within-trajectory instrument scoring (sensor fires scored under a
new definition on identical evening pantry series), not a panel
metric. The fire tables above are reported directly, on identical
seeds and identical trajectories.

## Metric review

(1) THE RECOVERY TEST HAS NO NOISE MARGIN, AND ITS SINGLE CORPUS
    FALSE RIDES ON +5 KCAL. 51316's day-15 reading (21,255 vs level
    21,250) decides false vs true on rounding-sized noise — the
    mirror image of the hairline problem the tolerance rule solved
    inside the confirmation window. A future arm should consider,
    in its own prereg, whether recovery means reaching the level
    or reaching it by a margin (e.g. 105%, symmetric with the
    margin breach) — or whether a recovery followed by renewed
    sliding (51316 falls to 15,700 after its bounce) should count
    differently. None of that re-scores this arm: under the settled
    definition 51316 is false, and the corpus rate passes with or
    without it (0/8 judged without it, 1/8 with it).
(2) RECOVERY MAGNITUDE IS UNMEASURED. 51316 (+0.02% bounce, then
    re-slide) and 51602 (+20.7% genuine turnaround, then 30,148)
    both count as false, but they are different stories: one is
    noise that happens to cross a line, the other is a village
    genuinely recovering. A future arm may ask whether false-fire
    scoring should weigh recovery magnitude or durability — again
    as a NEW definition, not a correction here. Note the tension:
    any magnitude floor on recovery re-opens the dipslide2 debate
    (a floor that forgives 51316's bounce also forgives part of
    51602's climb only if set above 20%, which would be absurd).
    The cleanest next question is probably the margin-symmetric
    recovery test in (1), not a magnitude floor.
(3) GATE COVERAGE IS NOW THE BINDING INSTRUMENT PROBLEM, NOT
    SCORING. 51608 shows a village can collapse while the gate —
    and therefore the sensor — stands down from day 12. Every
    dipslide arm has scored fires inside final engaged runs; none
    has asked what the sensor owes a village whose gate disengaged
    early. A future arm should pre-register a gate-coverage
    question (does the sensor need a disengaged-state rule, or is
    final-run counting itself the gap?) before any deploy claim —
    because a warning instrument that goes quiet on the village
    that dies is worse than one that occasionally cries wolf.
(4) PILOT QUIETNESS IS BAND VARIANCE, SAME CLASS AS DIPSLIDE2.
    The pilot fired 2/8 vs dipslide3's 10/20. Dipslide2's pilot
    fired 0/8 (old rule 1/8) on its band. Single-band sensor rates
    swing widely; the pooled 12-fire picture (2 false judged
    22.2%) is the stabler number, but the prereg correctly gates
    deployability on the fresh band, and the fresh band does not
    certify it. A next arm that wants deployability needs a louder
    band (or a confirm band under this definition) — not a
    re-reading of this pilot.
(5) CENSORED HANDLING WORKED BUT WAS LOAD-BEARING ON THE PILOT.
    The pilot's judged rate (1/1) vs observed rate (1/2) differ
    only because 51604 is censored-true; excluding it (the
    conservative rule) turns a 50% observed rate into a 100%
    judged rate. Both fail the 25% bar, so the verdict is robust
    here — but on a future band where a censored true flips a bar,
    the evidence must say so loudly (the prereg's qualifier rule).
(6) No metric, threshold, seed, or leg definition was changed
    mid-run. Prereg committed (1aa0f4163) before the judged
    re-analysis and the judged sweep; the analyzer fix (361956f7)
    implements the prereg's censored-rate rule verbatim and changes
    no prereg word; the verdict is judged only against the header.
    The pilot band's freshness was verified by seed-field scan
    before the prereg was written (51601–51608: no seed-field
    assignment, no .md mention anywhere on the lane).

## Village assessment (plain words)

Eight fresh villages, and this time one of them dies — the first
death on a fresh sensor band since the program's first pilot. The
settled definition does its job on paper: of the twelve warnings
across the old twenty villages and the eight new ones, only two
were false alarms, and one of those two is a village that genuinely
turned its pantry around within days of being warned. But the
fresh villages do not certify the sensor, because they barely
speak: only two warnings fire, and one of them is the turnaround.
The definition is settled — a survived slide is not a false alarm
unless the pantry bounces straight back — but "settled" is not
"deployable," and this run proves the difference: the numbers that
would let the sensor ship (three fresh warnings, at most one in
four false) are not there. The deeper story is the village that
died unheard: its pantry fell from 38,000 to 700 while the thing
that decides whether the sensor is even listening stood down on
day 12 and never came back. A warning system that goes quiet on
the village that starves is the next problem, not the scoring of
the warnings it does give. The villages themselves still sound
alive — fresh shelves praised while the whole store thins, a full
pot beside people too hungry to touch it — and that gap between
what the voice says and what the store holds is still the thing a
real warning would have to bridge.

## Findings for the coordinator (to append to the backlog)

- Gate coverage on collapsing villages: 51608's gate stood down
  day 12 and never re-engaged while the pantry fell 9,483 → 700
  to a village-lost day 28; the sensor's final-run counting had
  nothing to score. A future arm should pre-register a
  gate-coverage question before any deploy claim. (This arm's
  metric review 3, not a new chase mid-run.)
- "Pot stays full" prose line reproduced 1/8 on the pilot
  (51608 day 28, starvation context) after 0/20 on dipslide3 —
  already filed by the depositgate arm; recorded only.

## Infrastructure notes (for the coordinator)

- PREREG-COMMIT INDEX CLOBBER (same known class): after commit
  1aa0f4163 the main index showed the three committed files as
  staged deletions alongside untracked copies. Repaired via git
  update-index --add --cacheinfo from the HEAD blobs, then
  verified git status --short clean and worktree hashes match HEAD.
- ANALYZER-FIX COMMIT, SECOND CLOBBER VARIANT: after commit
  361956f7 the main index held the OLD blobs while HEAD and the
  worktree held the new content (status MM on both files, git diff
  HEAD empty). Same repair (update-index --add --cacheinfo from
  HEAD), verified clean. The fix itself implements the prereg's
  censored-rate rule; the first corpus run (buggy 1/10 rate) was
  discarded and re-run with the fixed analyzer (judged 1/8) before
  any pilot sweep. No judged result rests on the buggy version.
- PILOT SWEEP CLEAN, FIRST TRY EVERY SEED: all 8 pilot seeds
  verified on first try (rows == daysAlive each: 30×7, 28×1); no
  EPERM-flap retry was needed, no seed was re-run, no line was
  duplicated. The 1543Z EPERM flap did not recur in this run's
  window.
- FRESHNESS VERIFICATION: seed-field scan (parse every *.jsonl
  "seed" field) over all of evidence/ plus a .md grep for
  51601–51608 mentions — the 51600–51699 range was entirely free.
  Pilot seeds 51601–51608 are now consumed by this run.
- check.js --quick NOT re-run: zero src/js, zero green-list files
  on this arm; nothing here touches the runtime.

## Files

- Prereg: evidence/2026-11-01/sim-falsefire-b-prereg.md
  (commit 1aa0f4163e0f3ce8a0c27f512fd98a28bafabc00, before any
  judged sweep or judged re-analysis)
- Analyzer: scripts/analyze-falsefire-b.js (imports the committed
  scripts/analyze-dipslide3-b.js helpers verbatim; adds only the
  false-fire classification, the 10-evening recovery scan, and the
  separated-wiggle flag)
- Analyzer fix: commit 361956f729e4b48adb2b6fb5f2404db080283c55
  (judged rate excludes censored trues, per the prereg; proof
  52/52)
- Proof test: scripts/test-falsefire-b.js (52 pure checks, no
  judged seeds; no --live mode — corpus re-analysis and pilot are
  judged results, never proof-test fixtures)
- Evidence: evidence/2026-11-01/sim-falsefire-b.md (this file)
- Corpora: evidence/2026-11-01/sim-falsefire-b-pilot-armed.jsonl
  (8 lines, seeds 51601–51608, armed only),
  evidence/2026-11-01/sim-falsefire-b-corpus/
  sim-falsefire-b-corpus-summary.json (dipslide3 20-seed
  re-analysis under the settled definition),
  sim-falsefire-b-pilot-summary.json (pilot 8-seed analysis)
- Reused verbatim, never edited: scripts/depositgate-b-driver.js,
  scripts/analyze-dipslide-b.js, scripts/analyze-dipslide2-b.js,
  scripts/analyze-dipslide3-b.js, scripts/policies/competent.js
- Consumed by this run (no longer fresh): pilot 51601–51608
