# sim-pairarming-a — why armed counts fall while a wave-5 pair holds

Run `fleshout-20261112T1815Z`, Loop A, axis scale-onramp. Adoption run:
the dead 1715Z run left this arm unfinished (prereg + instrument only,
no driver, analyzer, proof, or corpus). The coordinator finished it in
the arm's worktree. Instrument-only diagnostic: zero `src/js` changes.

## 1. Prereg (from `sim-pairarming-a-prereg.md`, read in full)

**The question** (r9 §5, §8.5): on the r9 base, seed 190398 holds a
wave-5 pair for 19 days (d131–149) with armed 4–5 vs demand 6 and
never qualifies; armed falls 4 → 3 over the block. WHY do armed
counts fall while a pair holds — not whether pairs form.

**Base:** `ee30f22a2` (the r9 cut base, 385th commit in the window).
**Band:** seeds 190391–190398, 150d, competent policy. **Fix mode
only, fix-swap required:** the base predates the r131 roster-check
fix, so `src/js/standing.js` is swapped in uncommitted from
`5157782a4` (sha256 `f8fda4295a99…`) and restored byte-identical
afterwards. **GO bar (instrument validity ONLY):** unattributed armed
drops ≤ 1 across the band AND 100% deferral-hold-day gear coverage
AND replay identity on 100% of days vs the r9 corpus. The mechanism
finding itself is REPORTED, never judged.

**Verdict: GO.** Unattributed armed drops **0** (bar ≤ 1). Gear
coverage **100%** (every vetfirst daily day has a gear snapshot on
all 8 seeds). Replay identity **100%** (0 mismatched days on all 8
seeds, occurrence-aligned). Instrument errors **0**. Analyzer exit 0.
Proof 72/72 green before any judged sim.

## 2. The mechanism finding — the pair-arming problem is a headcount problem, not a gear problem

Seed 190398 is the ONLY seed in the band that holds a pair: one
block, **d131–149 (19 days)**, veterans 2 throughout, capped standing
515–540 (far above the 200 deferral line), peak wave 4. Armed never
reaches the demand of 6. The armed trajectory over the hold:

| days | armed | armored | living roster | what happened |
|---|---|---|---|---|
| d129–130 | 5 | 5 | 5 | pair forms d131 (Ingrid's veteran kill, on camera) |
| d131 | 4 | 4 | 4 | **scholar Kebede Balcha dies in the wild** |
| d132–137 | 5 | 4 | 5 | a joiner arrives armed; armed recovers |
| d138 | 4 | 4 | 4 | **Alberto Palacios (visiting joiner) dies to a monster** |
| d139–145 | 3 | 3 | 3 | **scholar Boris Kowalski dies in the wild** |
| d146–149 | 4 | 3 | 4 | a joiner arrives armed; armed recovers to 4 |
| d150 | 3 | 2 | 3 | **scholar Amine Touimi dies — and he was a veteran: the pair ends (veterans 2 → 1)** |

Two layers, both measured:

**(a) The headcount ceiling is the binding constraint.** On **19/19
hold days the living roster is 3–5 people** — always below the 6 the
readiness bar demands. Even with every living person armed, armed ≤
roster < 6. The village cannot qualify no matter what it does with
gear. The ceiling, not the gear, is what keeps wave 5 shut.

**(b) Deaths are the armed drops — all three of them.** Every armed
drop on a hold day is a death (class counts across the band:
`death/scholar-death` 2, `death/death` 1; unattributed 0). Two of the
three are the scholar dying in the wild (d131 Kebede Balcha, d139
Boris Kowalski); the third is a visiting joiner killed by a monster
(d138 Alberto Palacios). **No gear was lost, transferred, or stolen
on any hold day** — the gear-loss classes the instrument was built to
distinguish recorded zero events. The hypothesis the instrument was
built for (gear loss) is rejected by the data.

**Scholar churn.** Three scholars die in 19 days (Kebede → Boris →
Amine), and the third death ends the pair itself, because Amine was
one of the two veterans. Ingrid Vik is the through-line: she makes
the pair with her veteran kill on d131 and inherits the scholarship
on d150 after three scholars die. The pair survives 19 days of
scholar deaths and ends on the horizon day because a
veteran-scholar dies — not because wave 5 unlocked.

## 3. Sense-testing — the shortfall is entirely voiceless

During the 19-day hold, the six vetSays lines are System
kill-announcements ("Ingrid just put down The Suburb... on CAMERA.
That's a veteran kill, folks. REMEMBER the name") and fight reports.
The three casts are veteran ability casts. **Nobody says anything
about:** the pair holding, the armed shortfall, the scholar dying
twice, the wave-5 door staying shut, or the village being 1–2 armed
people short of the next wave. The System celebrates veteran kills
on camera while the village quietly fails to qualify and the scholar
dies twice in the wild. Same voicelessness pattern as the r10
tribute finding (0 mentions of tribute/table/seat on a
tribute-ready seed): the game never tells anyone what is blocking
progress. This is a finding, not a measurement artifact — see §9.

## 4. Wall numbers (band, 150d, seeds 190391–190398)

| seed | days | end | standing | scale | maxWave | deaths |
|---|---|---|---|---|---|---|
| 190391 | 86 | village-lost | 199 | regional | 4 | 88 |
| 190392 | 144 | village-lost | 199 | regional | 4 | 77 |
| 190393 | 150 | survived | 425 | regional | 5 | 76 |
| 190394 | 43 | village-lost | 150 | village | 4 | 52 |
| 190395 | 150 | survived | 199 | regional | 4 | 96 |
| 190396 | 87 | village-lost | 199 | regional | 4 | 80 |
| 190397 | 150 | survived | 225 | regional | 5 | 74 |
| 190398 | 150 | survived | 199 | regional | 4 | 96 |

Survived **4/8**, regional **7/8**, village 1/8. Wins **0**,
national **0**, table **0**. Wave-5 **2/8**, wave-4 8/8. Median
**150d**, deaths **639**, standing 150–425. Day-identical to the r9
and r10 corpora on all 8 seeds (replay identity 100% — the gear
instrument did not perturb the runs).

Death causes (639): villager combat 272, expedition 126, combat
126, the wild 82, monster 14, Spool 2, a stranger 2, the arena 2,
ambush 3, contest 3, a wound that wouldn't close 3, the night 1,
Big-Eyes 1, alien 1, starvation 1.

## 5. Method

- **Instrument** (`scripts/pairarming-instrument-20261112.js`, 512
  lines): daily gear snapshot (`PA.gearSnapshot`) replicating the
  engine's armed/armored/veterans counts from member rows (scholar
  equipped weapon, villager melee/ranged, CARRIED weapons count;
  armor points vs demand 15), cross-checked against
  `waveCombatReadiness(5)` every day (mismatch → instrument error);
  day-pair attribution (`PA.diffGearDays`) over classes death
  (registerDeath row / death-flag-no-row / scholar-death with
  succession named) / departure / gear-loss (transferred vs
  stolen/vanished) / veteran-loss / other / unattributed; hold
  detection (`PA.findHoldBlocks`: pair-hold = veterans ≥ 2, peak < 5;
  deferral-hold = pair-hold + capped standing ≥ 200; ceiling =
  roster < 6).
- **Driver** (`scripts/pairarming-driver-20261112.js`): adapted from
  the r9 driver; same legGuard (fix marker + exact fix sha), same
  shadowOldCount, `RUN=pairarming-pilot`, outDir
  `evidence/2026-11-12/perseed-pairarming-a/`, writes
  `pairarming-s<seed>-pairarming-pilot-fix.json`, refuses to
  overwrite an existing corpus file.
- **Analyzer** (`scripts/pairarming-analyze-20261112.js`): GO bar per
  §1; writes `pairarming-a-summary.json`; exit 0 iff complete +
  classifiable + 0 instrument errors.
- **Proof** (`scripts/test-pairarming-a.js`): **72/72 green** before
  any judged sim (§1 engine APIs; §2 gear snapshot vs engine rule,
  live + stub; §3 attribution classes incl. simultaneous-gain and
  over-explained; §4 hold detection; §5 replay-identity incl.
  duplicate-day occurrence alignment; §6 GO-bar table; §7 seed-band
  identity + leg guard; §8 corpus completeness + large-file r9
  reads; §9 roster-check live).

## 6. What went wrong mid-run, and the fixes (all proven, all in the corpus)

Three instrument bugs surfaced on the FIRST band run, each found by
reading the data rather than by re-running blind:

1. **Over-explained check ignored simultaneous gains (190391
   d75).** Three armed members died and one armed joiner arrived
   the same day: net drop 2, 3 explained events — the check
   compared losses against the net drop and flagged a false
   instrument error. Fix: a day explains (drop + gains) loss
   events. The data was right; the check was wrong. Proof leg §3
   added (simultaneous-gain case).
2. **Replay comparison collapsed duplicate days (190394 d43).**
   Both drivers emit TWO snapshots for the village-loss day (the
   in-day snapshot, then a post-loss flush with the roster
   emptied), and both skip day 3. A plain day→entry map kept the
   LAST duplicate and compared this run's in-day snapshot (roster
   1) against r9's post-loss flush (roster 0) — a false mismatch.
   Fix: occurrence-aware alignment (occurrences consumed in
   order). The r10 deep-diff was index-aligned and found 0 diffs
   for the same reason. Proof legs §5 added (same-order clean,
   swapped-order mismatches).
3. **`loadR9Daily` hit execSync's 1 MB maxBuffer.** Seven of the
   eight r9 per-seed files are 1.1–2.2 MB (only 190394, at 349 KB,
   loaded); the catch silently reported the other seven
   "unreadable" and the analyzer's per-seed lines read as 0
   mismatches — which looked clean but meant no comparison had
   run. Fix: 64 MB maxBuffer. Proof legs §8 added (real large-file
   reads of the 190391/190398 corpora). Lesson: a "0 mismatches"
   line is meaningless without a days-compared count next to it —
   the analyzer now prints replay days per seed, and the summary
   carries the uncomparable list.

**Band re-run.** Run 1's verdict was already GO (unattributed 0,
coverage 100%, replay 100% after fixes 2–3), but its stored corpus
carried the stale false error from bug 1, so the analyzer exited 1.
Rather than rewriting evidence post-hoc, the run-1 corpus was
archived to `perseed-pairarming-a-v1/` (with its summary) and the
band re-run with the fixed instrument. The re-run was SIGTERM'd
mid-way (~7 min in, cause unobserved — the tree stayed registered
and active, heartbeat fresh; no reaper removal); 5 of 8 seeds were
already written, and the remaining 3 were run on their own. Run 2
reproduces run 1 exactly on every wall number and on the mechanism
finding, with instrument errors 0 and analyzer exit 0.

## 7. Metric review

The prereg's GO bar was instrument validity only, and it held:
unattributed 0, coverage 100%, replay 100%. The mechanism finding
(§2) is reported, not judged — no threshold was set on it, and none
should be retrofitted. One metric-review note: the prereg's hold
definition (pair-hold + capped ≥ 200) correctly isolated the single
hold in the band, but the ceiling (roster < 6) turned out to be the
binding constraint, not a side condition — a future arm that asks
"why doesn't the pair qualify" should pre-register the ceiling as
its own metric, not as a footnote. The armed demand (6) vs the
living roster (3–5) is the number that matters.

## 8. Blanks filled and findings

- **Blank #5 from the 1624Z review (answered):** why armed counts
  fall while a wave-5 pair holds. Answer: they fall because armed
  people die — including the scholar, twice in 19 days — and they
  never reach 6 because the living roster is 3–5, below the demand.
  Gear loss plays no part (0 events). The pair-arming problem is a
  headcount problem with a death churn on top.
- **Finding (open): the wave-5 door is gated on headcount the
  village cannot reach.** A village holding a pair for 19 days with
  standing 515–540 still cannot qualify because it has 3–5 living
  people and the bar demands 6 armed. Whether the demand or the
  headcount is the wrong lever is a design question (Steve-call):
  the measurement only establishes that the bar is unreachable
  from inside this village's state.
- **Finding (open): scholar churn in the wild.** Three scholars
  die in 19 days, all "the wild", and the third death ends the
  pair because the scholar was a veteran. The scholar is the
  village's most exposed person and the pair's single point of
  failure at once.
- **Finding (open): the shortfall is voiceless (§3).** Nobody in
  the village notices or names the armed shortfall, the scholar
  deaths, or the shut wave-5 door. Same family as the r10
  voiceless-tribute finding.

## 9. Telemetry appendix

Telemetry deviation check on this corpus: see §10. Baseline NOT
rolled (refusals recorded, as with r10/stallcut57).

## 10. Telemetry deviation check

Attempted (2026-11-12, on the run-2 corpus):

```
node scripts/telemetry-check.js --baseline ~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/scale-wall.json --current 'evidence/2026-11-12/perseed-pairarming-a/pairarming-s*-pairarming-pilot-fix.json' --metrics national,table,wins,exiled
```

**REFUSED, exit 2:** "refusing recorder-corpus input: all 8
--current rows carry top-level anchorCommit, so they are sweep
recorder rows, not runs. Recorder corpora are compared with
sweep-compare tables, never against a run baseline here." Same
refusal class as the r10 and stallcut57 arms this run. Baseline NOT
rolled. Blooded 4/8 (for the record).
