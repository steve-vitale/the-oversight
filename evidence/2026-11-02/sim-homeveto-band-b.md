# sim-homeveto-band-b — homeward-extension band search (DIAG-NO-BAND: no fresh band qualifies in 8 bands / 64 seeds)

Run: oversight-flesh-out-loop-b, arm sim-homeveto-band-b (Loop B,
food-economy tracker blank 1 from run
fleshout-loop-b-20261102T1135Z). Worktree sim-homeveto-band-b,
branch sim-homeveto-band-b.
Prereg: evidence/2026-11-02/sim-homeveto-band-b-prereg.md (committed
02f7a3931 BEFORE any sim). Instrument:
evidence/2026-11-02/sim-homeveto-band-b-prereg.md's screener +
proof committed 97252abaa (screener 10/10 checks, predecessor
proof re-run 21/21, both re-run post-commit below).
Convergence state: the extension remains unjudged on a natural
band — not disproven, not proven. The search itself is now
measured: 80 armed seeds (this run's 64 + the 1030Z pilot's 8
+ the 1135Z ablation's 8) have produced ZERO armed-policy
homeward vetoes, and the one fresh homeward episode found
here was stopped at the approach, exactly as on 62801-62808.

## What was built (policy-side ONLY, zero game-code change)

Nothing in any policy file changed. This run reuses, byte-identical
(verified by the proof test's git check, re-run post-commit):
scripts/policies/competent-homewardstep-b.js (full guard),
scripts/policies/competent-homewardstep-outwardonly-b.js
(outward-only variant), scripts/homext-abl-b-driver.js,
scripts/analyze-homext-abl-b.js. New in this run:
scripts/analyze-homeveto-screen-b.js (armed-leg screener:
per-seed and band homeward-veto counts from exact driver
fields, no episode logic duplicated) and
scripts/test-homeveto-screen-b.js (its proof). Zero src/js,
zero competent.js edits, zero policy-default flips.

## Screening (ALL 8 budgeted bands, disclosed, none qualifies)

Per band, BOTH legs fresh with the ablation driver (30d,
competent, DEPOSITGATE=0, COMPETENT_FEAST=0, SEATDRIVE=0,
PLENTYDEPRI=0, packcomp flags not 1): baseline 'competent'
under the SHADOW guard (episodes via the analyzer's
screening mode) and armed 'competent-homewardstep-b' (full
guard, homeward vetoes via the new screener). Qualifier
(prereg): baseline homeward-hop pocket episodes >= 2 AND
armed homeward vetoes >= 1. Screening stops at the first
qualifier; no band qualified, so all 8 bands were run.
Banned bands were never touched (see prereg).

| Band | Base away | Armed away | Armed vetoes (silent) | Armed homeV | Base episodes (homeward) | Result |
|---|---|---|---|---|---|---|
| 1. 64001-64008 | 0 | 0 | 0 (0) | 0 | 0 (0) | FAIL both legs |
| 2. 64101-64108 | 7 | 6 | 12 (9) | 0 | 0 (0) | FAIL both legs |
| 3. 64201-64208 | 15 | 10 | 25 (23) | 0 | 1 (0) | FAIL both legs |
| 4. 64301-64308 | 19 | 19 | 43 (39) | 0 | 2 (0) | FAIL leg (b); episodes non-homeward |
| 5. 64401-64408 | 10 | 9 | 19 (12) | 0 | 1 (0) | FAIL both legs |
| 6. 64501-64508 | 0 | 0 | 7 (5) | 0 | 0 (0) | FAIL both legs |
| 7. 64601-64608 | 6 | 0 | 30 (27) | 0 | 2 (1) | FAIL: 1 < 2 episodes, 0 vetoes |
| 8. 64701-64708 | 1 | 1 | 30 (29) | 0 | 0 (0) | FAIL both legs |
| TOTAL 64 seeds | 58 | 45 | 166 (144) | 0 | 6 (1) | 0 qualifiers |

Episode detail (baseline legs; all others are
non-homeward unless noted):
- Band 3, 64203: days 4-8 at (4,2), E fails all 5 days,
  non-homeward entry. Armed: away 0 on this seed (1
  outward veto) — prevented by the outward guard.
- Band 4, 64307: days 19-20 at (4,1)->(3,0) and days
  28-29 at (4,2), E fails both days each, both
  non-homeward. Armed: away 0, 36 outward vetoes — the
  outward guard diverts both camps entirely.
- Band 5, 64406: days 4-12 at (3,3), E fails days 5-12,
  death-linked day 12 (player starvation, villager
  gen_k6ii9vq), non-homeward entry. Armed: the scholar
  still camps 9 days, but at (3,4) with day-end sims
  PASSING direct every day — an escapable camp, not a
  pocket (see sense-testing). Same villager dies day 12
  under armed too, of sickness, not starvation: with the
  succession caveat, no "life saved" is claimed.
- Band 7, 64601: days 17-20 at (3,0), E fails all 4
  days, HOMEWARD entry — the run's only baseline
  homeward episode, and the same pocket tile and entry
  shape as 61807 (see below). Armed: away 0, 29 outward
  vetoes, home every night. Band 7, 64605: days 29-30
  at (1,7), E fails both days, non-homeward.
- Band 3, 64206 (no episode): 10 away day-ends with
  strandDeathDays [14, 22] but day-end sims passing —
  escapable camps, not pockets; survived 7/8 on band 3
  on both legs (64206 loopDays 26).

The pattern is now four-for-four across runs: on 62801-62808
(3 homeward episodes, 0 armed homeward vetoes), on the
1135Z ablation (same band, same 0), and on all 8 fresh
bands here (1 homeward episode, 0 armed homeward vetoes).
The outward guard keeps answering the homeward question
before the homeward step is ever attempted under guard —
and on 64601 it does so on the very pocket shape that
fires at 61807: the armed scholar is vetoed at the
approach hop (1,4)->(1,2) on day 17 and then at the first
step out of haven (4,4)->(4,1) daily, so it never walks
the (2,0)->(3,0) entry step at all.

## DIAG leg (diagnostic ONLY — not judged, not a verdict)

Per the prereg's no-qualifier branch, the diagnostic is a
reconstruction on seed 61807 itself (the only seed with
known homeward firing), run fresh on all three legs with
the same driver (30d, identical substrate). The analyzer's
mechanical output on this single hand-picked seed is
quoted below for the shape only. ITS PRINTED "VERDICT: GO"
IS NOT THIS RUN'S VERDICT: a single pre-used seed chosen
because it fires cannot judge the extension (selection
bias), and this run's verdict is DIAG-NO-BAND. No GO or
NO-GO for the extension is claimed anywhere in this file.

Diagnostic numbers (61807, 3 legs, identical seeds):

| | Baseline (shadow) | Outward-only | Full |
|---|---|---|---|
| Away day-ends / episodes (homeward) | 6 / 1 (1) | 4 / 1 (—) | 4 / 0 |
| Homeward vetoes / total vetoes (silent) | 0 / 0 | 0 / 3 (2) | 2 / 3 (1) |
| Outward-only pass-throughs | — | 2 | — |
| Mean daily haul | 215.1 | 237.2 | 280.7 (1.18x outward) |
| Failed-trip share | — | 0.233 | 0.233 |
| Median survival / starv seeds | 30d / 1 | 30d / 0 | 30d / 0 |
| Veto-created pockets / false opens | — | — | 0 / 0 |
| Extension-only preventions (diagnostic arithmetic) | — | — | 1 |

The shape, hop by hop (day 4; haven (4,4)):
- Baseline: walks out (4,4)->(2,4)->(1,4)->(1,2)->(1,1)->
  (2,0), every step E-passing in the armed sense, then the
  HOMEWARD hop (2,0)->(3,0) with E FAIL (4 lateral legs
  exhausted) — the shadow log marks it the entry hop.
  The scholar ends day 4 at (3,0) with a failing day-end
  sim, camps (3,0) days 4-9 (kcal 1210 -> 293 -> 0 -> 210
  -> 0 -> 0), and comes home day 10 at 2030.
- Outward-only: the identical walk-out; the (2,0)->(3,0)
  hop passes through twice with outwardOnlyPass=true.
  Day 4 ends at (3,0) sim FAIL; day 5 an outward veto
  (the leg's one spoken line, day 5) pulls the scholar
  to (3,1), where it camps days 5-7 on passing sims and
  comes home day 8 at kcal 90. Because day 4 ends on
  failing ground, the conservative rule still counts an
  outward episode (days 4-7 away, containing a failing
  day-end) — so outward episodes = 1, full episodes = 0,
  and the diagnostic arithmetic gives extensionOnly = 1.
- Full: the (2,0)->(3,0) hop is VETOED (spoken, first
  veto of that destination; veto-origin sim PASSES — the
  scholar stays on escapable (2,0)), a second destination
  (1,0) is vetoed spoken the same day, and the repeat
  (3,0) attempt is vetoed silent (veto memory working).
  Day 4 ends at (2,0) kcal 930 with a LATERAL-passing
  day-end sim; home day 5 at 1430; full episodes = 0.
  Trajectories diverge exactly at day 4 (full ends
  (2,0) kcal 930 vs outward (3,0) kcal 1210), as they
  should when the extension fires.

Reconciliation with the sim-latescape-b note: that note's
"guard fences the pocket edge days 5-7, home day 8, but
the day-4 failing day-end anchors the run as one episode
so prevented = 0" describes the OUTWARD-ONLY shape above
(days 5-7 at (3,1), home day 8) — or equivalently the
latescape substrate's own guard — not the homewardstep
guard's full leg. Under the homewardstep guard the day-4
entry step itself is vetoed, so no day-4 failing day-end
exists under full, and the anchor argument does not
apply to the full leg. What the note gets right, and
this reconstruction confirms, is the trip shape: out
through escapable ground, then a homeward step into
no-escape ground. A judging band needs that shape on
fresh seeds with the approach hops surviving the
outward guard — which is exactly what 64601 failed to
provide (its approach hop E-fails under guard).

## Balanced panel (§15, context never verdict)

No judged pilot exists, so no panel compare is owed or
claimed. As wall-number context only, a combined campaign
(`node scripts/balance-panel.js --out
/tmp/homeveto-band-b-panel --policies
competent,competent-homewardstep-b --seeds
64601,...,64608 --days 30 --par 4` — 16 cases, 0 reused,
sourcesStable true, neutrality matched on both policies,
proof seed 64601, 0 warnings) on the nearest-to-qualifying
band 7 gives IDENTICAL rows on both legs: survived 8/8,
won / national / table / entered / vests 0, wave reach 2
on 6/8, maxArc 3 on 7/8 (64603 arc 2 both legs). Raw panel
archived as evidence/2026-11-02/sim-homeveto-band-b-panel.json.gz.
The panel substrate independently corroborates the driver
on band 7: the guard changes no panel outcome there,
because its work (diverting 64601/64605 at the approach)
sits below the panel's 30-day resolution.

## Wall numbers (in-window only, never pooled across arms)

Driver substrate, all 16 screening legs: median survival
30d on every leg; survived 126/128 seed-legs (band 3
7/8 on both legs, all other legs 8/8); maxWaveUnlocked never above 3
(bands 1-4 and 6 carry one wave-3 seed each; bands 5, 7,
8 top out at wave 2); wave 4-5 unlocks 0 on all 64 seeds
on both legs. Panel substrate, band 7: national / table /
wins 0 on both legs (expected 30-day pre-seat profile,
not a regression). Diagnostic seed 61807: driver
maxWaveUnlocked baseline 2 / outward 1 / full 2 — a
substrate difference on one diagnostic seed, not a wall
claim. No wall movement is shown or claimed: this run
measures whether the extension can be judged at all, not
the scale wall.

## Sense-testing (transcripts, not just counts)

- The veto line reads true wherever it speaks: "You don't
  walk there — you couldn't get home from there." On
  61807-full it speaks twice on day 4 (two different
  destinations, correct per per-destination memory) and
  the scholar reroutes and comes home fed the next day.
  On 61807-outward-only it speaks once, on day 5, at the
  step that pulls the scholar off the pocket edge to
  (3,1) — and the scholar then camps three days on
  escapable ground and walks home at kcal 90, honest
  hardship resolved by walking home.
- The silent-repetition pattern recurs on a fresh band:
  64601-armed speaks on days 17-18 only, then refuses
  (4,4)->(4,1) silently three times a day for two weeks
  (29 vetoes, 2 spoken) while ending every day home and
  fed. Same shape as 62808's 68-veto pattern, same
  design question carried from the predecessors: memory
  suppressing every repeat may under-narrate a
  permanently refused route (a once-per-route reminder
  after long silence would read more human). This is a
  narration question about the outward guard, not a bar
  failure and not extension evidence.
- 64406-armed reads as the guard's promise kept in a
  different form: the scholar still camps out 9 days, but
  on (3,4) instead of (3,3) — ground it can leave from,
  every night's sim passing — while the baseline scholar
  sat 9 days on failing ground to a starvation death.
  The reroute is one tile, and that tile is the whole
  difference. Nothing robotic in the reroutes: diverted
  scholars forage elsewhere, bed down where they can
  leave from, or come straight home fed.
- What the transcripts never contain in this run: a
  homeward veto line. In 64 armed seeds the extension
  never speaks, because it never fires — the same silence
  as on 62801-62808, now on fresh ground.

## Village assessment (plain words)

Across 64 fresh villages, most scholars simply sleep home
every night: three whole bands (64001, 64501, 64701) end
almost no day away from haven, and the rest camp out only
a handful of nights. Where trouble does show up, it is
the same story the earlier runs told: a scholar walks a
plausible route out to good ground, the ground turns out
to be a trap it cannot walk home from, and it sits there
while its food runs down — four days on a north-edge tile
at 64601, nine days at 64406, five days at 64203. Given
the guard, none of those camps forms as a pocket: the
scholar is turned back at the approach and comes home fed
instead, or — at 64406 — camps one tile over, on ground
it can leave. The one village that carried a true
homeward trap, 64601, is the clearest proof of the
problem this run was sent to solve: its baseline scholar
walks the exact route that fires the extension at 61807,
step for step to the same (3,0) tile — but under guard
it is stopped two steps earlier, at the approach, so the
homeward eyes never open. The fence around the far ground
works; whether the eyes on the way back would work, on a
trip that actually gets that far, is still unproven after
80 armed seeds without a single firing. The village is
not suffering for the extension's absence — it is
protected by the outward guard before the extension
could matter.

## Verdict: DIAG-NO-BAND (no GO / NO-GO for the extension)

- NO BAND QUALIFIES within the 8-band budget: the best
  band on episodes (band 4, 2 episodes) carries 0
  homeward episodes and 0 armed homeward vetoes; the
  best band on homeward episodes (band 7, 1) falls short
  of the >= 2 bar and also carries 0 armed homeward
  vetoes. Armed homeward vetoes are 0 on all 64 seeds.
- Per the prereg, NO pilot was run and NO extension
  verdict (GO or NO-GO) is claimed. The 61807 diagnostic
  arithmetic (extensionOnly = 1 on one hand-picked seed)
  is documented above as a shape, not scored as evidence.
- No confirm spend in this run (prereg): there is no
  pilot verdict to confirm. The coordinator's next call
  is a substrate call, not a seed-count call (see metric
  review).

## Metric review (for the NEXT run, never a re-score)

- The qualifier's two legs fail INDEPENDENTLY, and that
  matters for the next design: even the band with a
  homeward episode (band 7) fails the armed-veto leg,
  and even bands with outward-veto-rich armed legs fail
  the episode leg. Raising the budget from 8 to, say, 16
  bands would most likely buy more of the same two
  independent zeros (observed rates: baseline homeward
  episodes 1/64 seeds, armed homeward vetoes 0/64 seeds
  here, 0/80 armed seeds counting the predecessors).
  The next prereg should change the SUBSTRATE, not the
  budget — as the ablation's metric review already
  proposed, but sharpened by 64601: screen for trips
  whose approach hops all E-pass under guard while the
  homeward entry hop E-fails (the 61807 shape as a
  judged band rule), rather than for baseline episodes
  alone. 64601 shows why baseline episodes alone cannot
  qualify: its entry hop E-fails, but so does its
  approach hop, so the guard eats the approach first.
- INSTRUMENT QUESTION (open, mechanism unpinned): on
  61807 day 4, the approach hops (1,4)->(1,2),
  (1,2)->(1,1), (1,1)->(2,0) E-FAIL in the baseline
  shadow log but E-PASS in the full-guard leg, with
  identical history up to the first veto. On 64601 the
  shadow and armed evaluations AGREE (approach E-fails,
  vetoed). So the shadow log predicts armed vetoes on
  64601 but mispredicts them on 61807. Until that
  evaluation-time difference is pinned down, shadow-hop
  screening for "approach-clean" trips must be treated
  as a hypothesis to validate, not a screen to trust:
  the next run should compare shadow vs armed E on the
  same hops before using shadow logs to select a band.
  This question does not touch this run's verdict (the
  verdict uses armed veto counts and baseline episodes,
  never shadow E predictions).
- The no-harm bars were never reached (no pilot), so
  their calibration is untested on a firing band; they
  are carried unchanged to the next prereg, including
  the 1.00x per-seed haul floor, which the diagnostic
  (1.18x on 61807) suggests will bind in the right
  direction when a firing band exists.
- The silent-repetition narration question (62808, now
  64601 and 64307: 36 vetoes, 2 spoken lines, both day
  19) is carried, unchanged, as a Steve-call design
  question about the outward guard's narration — not
  about the extension.
- Screening yield note (carried, updated): homeward-hop
  pockets on fresh natural bands run rarer than the
  1030Z screening suggested (1 episode in 64 fresh
  seeds here vs 4 in 48 there — band luck dominates);
  armed homeward firing under guard runs at 0/80 seeds
  across all runs to date. Any future natural-band
  search budget should assume a near-zero hit rate, and
  a constructed-trip substrate should be preferred.
- Blanks filled or documented: none filled (no game or
  policy change — correctly, since there is no judged
  effect to land). Documented: (a) the 8-band screening
  ledger above; (b) the 61807 diagnostic shape with
  hop-level detail and the latescape-note reconciliation;
  (c) the shadow-vs-armed E divergence as an open
  instrument question; (d) the 64406 one-tile reroute
  (escapable camp, not a guard failure) so a later run
  does not misread armed-away-9 as a pocket.

## Corpora

- evidence/2026-11-02/sim-homeveto-band-b-prereg.md
- evidence/2026-11-02/sim-homeveto-band-b.md (this file)
- evidence/2026-11-02/sim-homeveto-band-b-screen{1,2,3,4,5,6,7,8}-{baseline,armed}.jsonl (+ .log)
- evidence/2026-11-02/sim-homeveto-band-b-diag61807-{baseline,outwardonly,full}.jsonl (+ .log)
- evidence/2026-11-02/sim-homeveto-band-b-diag61807-analyze.txt
  (analyzer output on the DIAGNOSTIC seed only — its
  printed VERDICT is NOT this run's verdict; see DIAG leg)
- evidence/2026-11-02/sim-homeveto-band-b-panel.json.gz
  (+ sim-homeveto-band-b-panel.log: band-7 panel context, 16 cases)
- scripts/analyze-homeveto-screen-b.js + scripts/test-homeveto-screen-b.js
