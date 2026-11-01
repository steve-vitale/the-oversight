# sim-entrywindow-confirm-b — PREREG (committed BEFORE any judged sim)

Run: oversight-flesh-out-loop-b (confirm worker), axis food-economy,
arm sim-entrywindow-confirm-b. Worktree sim-entrywindow-confirm-b,
branch sim-entrywindow-confirm-b. This is the CONFIRM of
sim-entrywindow-b (PILOT GO 2026-11-01: failed-trip share 0.258 ->
0.058, mean daily haul 633.7 -> 967.9, starvation deaths 2 -> 0,
away day-ends 30 -> 17, on pilot band 60121-60128). No new lever,
no new rule, no variant: the confirm judges the pilot's FROZEN
rule, unchanged, on a fresh 12-seed band. This worker does NOT
push, bump, verify live, or merge into master; the coordinator
merges. Status to coordinator: committed on branch, pending
coordinator merge.

## Canon (read before writing anything)

docs/CANON.md read first, then docs/MAP.md (the travel/entry
area). No canon doc covers entry-window rotation specifically:
the rule below is NOT invented canon — it is the pilot's frozen,
measured rule (sim-entrywindow-b-prereg.md), REUSED VERBATIM.
The policy file scripts/policies/competent-entrywindow-b.js is
READ-ONLY for this run: never edited, never re-frozen, no
fertile bonus added, no yield-aware ranking, no walked-through
extension. Those are future arms (pilot evidence, candidates
1-3), not this confirm. Instrument files
scripts/entrywindow-b-driver.js and
scripts/analyze-entrywindow-b.js are likewise REUSED VERBATIM.
Any new file in this run is named *-entrywindow-confirm-b.*.

## Frozen rule (verbatim from the pilot prereg)

During competent.daily only, a tile the scholar has itself
worked whose entry window FROM THE SCHOLAR'S CURRENT POSITION
currently holds ZERO harvestable cells sorts as 99 steps
farther for forage-target choice; every other tile is left
exactly alone — no fertile bonus, no filtering. Mechanism,
caveats (scorch counted as harvestable at menu time; chain
approximation for tries 2-3; visited = foraged-only;
first-visit tiles untouched), and spillovers are exactly as
stated in sim-entrywindow-b-prereg.md and are not re-litigated
here.

## Substrate (fixed, matches the pilot exactly)

Competent policy vs competent-entrywindow-b, 30 days,
DEPOSITGATE=0 (keep 2,000). Env (FATAL if violated on the
judged CLI path): COMPETENT_FEAST=0, SEATDRIVE=0,
PLENTYDEPRI=0, DEPOSITGATE=0,
POLICY=competent|competent-entrywindow-b, DAYS=30. The * =1
flags barred in packcomp (COMPETENT_STANDING_HOME,
COMPETENT_ROUTE_AROUND, COMPETENT_TRIPHOME_ROUTE_AROUND,
WOODCARRY, WOODWARM, MORNINGCARRY, WINDOWCARRY, STRANDFIX,
PRESSB, FEDEVENING) must NOT be 1. Identical seeds both arms.

## Fresh confirm band: 60201-60212 (verified BEFORE this prereg)

REQUIRED ORDER, step 1, executed before this file was written:

- Pilot band 60121-60128, census band 60101-60108, and fertrot
  reserve 60129-60132 are NOT reused (the reserve is only 4
  seeds anyway, and the confirm needs 12).
- Single-pass rg scans of ALL of evidence/ in this worktree
  for the seed field in both spellings — pattern covering
  `"seed":602(0[1-9]|1[0-2])` and `"seed": 602(0[1-9]|1[0-2])`
  with a non-digit boundary — returned ZERO hits (rg exit 1 =
  no matches). A second single-pass rg scan of ALL of
  evidence/ for .md mentions — word-boundary pattern
  `602(0[1-9]|1[0-2])` over `*.md` — returned ZERO hits.
- The first five candidates (60201-60205) were additionally
  confirmed clean by individual per-seed scans (field files 0,
  .md mentions 0 each) before the single-pass band scan.
- Method note, stated honestly: the rg scans cover text files
  under evidence/; compressed panel archives (.json.gz) are
  not decompressed by rg, the same method the pilot used.
  The band is in the unused 602xx series (prior 60xxx use is
  the 601xx pilot/census/reserve series plus the 522xx
  gatediseng series), disjoint from every judged band named
  in the pilot prereg, the pilot evidence, and the 2230Z
  round evidence.
- Band recorded here, before any judged sim: 60201, 60202,
  60203, 60204, 60205, 60206, 60207, 60208, 60209, 60210,
  60211, 60212. No other band is judged by this run.

## Primary metric + GO threshold (the pilot's pair + cost bars, exactly)

PRIMARY (judged as a PAIR):
  (a) failed-trip day share = pooled failed-trip days / pooled
      loopDays (failed = >= 1 forage attempt, 0 successes).
      GO needs armed share <= baseline share - 0.10.
  (b) mean daily haul = band mean of seed mean-daily-hauls
      (mean over loopDays of day-row edible + shelled kcal).
      GO needs armed >= baseline (not down — no tolerance).
  JUDGE: the mean-of-means, as in the pilot; the pooled figure
  is diagnostic only and never rescues a mean-of-means miss.
CONFIRM GO requires BOTH (a) and (b) pass AND both cost bars
pass AND the secondary away bar pass (below). A miss on any
leg is NO-GO, never re-scored against a friendlier metric
mid-run.
COST BARS (both required): median survival (inst.daysAlive)
armed >= 0.8x baseline; starvation deaths armed <=
baseline + 1.
SECONDARY (judged as a cost signal, fertrot 60108 lesson):
away day-ends (days ending away from the haven), band total
armed <= baseline total + 5 AND no 60108-shaped seed — a
seed with armed away day-ends >= 10 while baseline is 0,
with starvation deaths — fails the arm even if the pair
passes. The per-seed away-day table is the evidence, and a
60108-shaped seed is called out by name whether or not it
trips the formal bar.
ENGAGEMENT (interpretability only, pilot precedent): the
confirm is uninterpretable as a signal test (not a NO-GO on
the pair — the pair still judges) if band-wide penalized
menus total < 10 on the armed leg. Reported alongside the
verdict either way.
WATCH ITEMS (reported, NOT bars): (1) 60126-class divergence
— any seed worsening on BOTH pair legs (share up AND haul
down) is named per-seed with its mechanism read, but does
not by itself fail the band; a class of such seeds would be
the yield-aware-variant case for a future arm, not a
re-score here. (2) The pack-full ceiling — pack-full failures
rose 2 -> 16 at pilot; the confirm reports failByReason on
both legs and whether pack-full is again the only
non-empty-window failure mode on the armed leg.
DIAGNOSTICS ONLY (never rescue a primary miss): finished-pack
value at returns, unload total, wave reach, panel numbers.
Finished-pack and unload are reported, never judged.

## Balanced panel (section 15) — combined panel pre-declared

One COMBINED panel: both policies, same seeds, same days, one
campaign (pilot precedent; single-policy panels cannot match
a new-policy arm):

```
node scripts/balance-panel.js --out /tmp/entrywindow-confirm-panel-b \
  --policies competent,competent-entrywindow-b \
  --seeds 60201,60202,60203,60204,60205,60206,60207,60208,60209,60210,60211,60212 \
  --days 30 --par 4
```

The compare .md is attached to the evidence file. Panel
numbers are context, never verdict: the panel runs its own
substrate and its survival/death definitions differ from the
driver's judged cost bar. If the tool refuses the combined
run, that refusal is reported, not worked around by
fabricating a compare.

## Sense test (SENSE-TESTING LAW)

One transcript slice read for meaning in the evidence file:
is the rotation choice narratively visible or invisible? Is
any stranding marked? Report visibility ONLY. This run ADDS
NO NARRATION.

## Wall numbers (in-window only)

This 30d pre-seat window cannot measure national / table /
wins: no seed can reach national in 30 days. In-window
survival, wave reach, and deaths are reported; national 0 /
table 0 / wins 0 in this window is not a wall movement claim.

## Metric review (in the evidence file, not here)

The evidence file carries a "metric review" section. No
metric, threshold, seed, or rule may change mid-run; doubts
go there for the NEXT run.

## Commit order (this file + test BEFORE any judged sim)

This prereg and scripts/test-entrywindow-confirm-b.js are
committed FIRST. The policy, driver, and analyzer are reused
verbatim and need no commit. The existing proof test
(scripts/test-entrywindow-b.js, pure 14/14) and the new
confirm test are re-run AFTER this commit and BEFORE the
confirm sims. The confirm (60201-60212) runs only after that
commit lands. NO JUDGED SIM (no confirm seed, either leg)
has run before this commit.
