# sim-d3refreeze-b — D3 re-freeze + re-judge of the profilegate-confirm B5 clause — NO-GO (instrument, again)

**Arm:** sim-d3refreeze-b, re-freeze + re-judge · **Loop B run:**
fleshout-loop-b-20261121T1630Z, arm 1 of 3 · **Axis:** winnability chain
**Verdict: NO-GO under the frozen corrected bound — D3 fails 14/16,
and both flags are proven false positives of the same class as the
one this arm was built to fix.** The pool-row bound (first
needWave>=4 pool row) flags seeds 106759 and 106764, where the lever
demonstrably acted at mid-day scorings the part-0-only pool rows
never observe. The 106751 flag this arm was built to clear IS
cleared (CLEAN, 75 ≥ 74). B1–B4 are NOT re-judged here (they pass
on the confirm evidence and stand). This is an instrument verdict,
not a lever verdict — for the second time running, the lever passes
every frozen bar that measures the game and fails only a drift
check whose bound the corpus proves wrong. No default flip. The
follow-up is a second re-freeze — the dawnbidScore bound (first
needWave>=4 dawnbidScore row, any part) — and a D3 re-run on these
same corpora, no new sims. That bound clears all 16 seeds on the
evidence in this file.
**Type:** RE-JUDGE, no src/ change, no new sims. Pure re-analysis
of committed corpora.
**Branch:** `sim-d3refreeze-b` · **Worktree:**
`~/workspace/worktrees/sim-d3refreeze-b`
**Base:** worktree HEAD `c7be183e0` (coordinator rebases at landing).
**Policy:** competent verbatim, sha256 `1884c8852d38` (12-char prefix).
**Band:** seeds 106751–106766 (16 seeds, the confirm arm's band,
re-used — a re-analysis, not a fresh band) · **Horizon:** 150d
death-aware.
**Prereg:** `evidence/2026-11-21/sim-d3refreeze-b-prereg.md`
(frozen ~18:01 UTC, before the judged D3 re-run; one correction
before any judged leg — the 106765 fallback, see §9 — and nothing
amended after).

## 1. The re-freeze — what changed, and what did not

The D3 drift check's `firstLeverDay` changed in exactly one place:
**first world-tick v4 seed row on the ON leg → first needWave>=4
pool row on the ON leg.** The fallback (first depart row carrying a
non-null companion2) is retained; a seed with no pool row and no
fallback depart that diverges is DRIFT; with no divergence it is
IDENTICAL. The world-tick fallback is REMOVED. Everything else is
byte-identical in behavior: the fingerprint (waveKillLog, vetsW3/W4
counts, roster dead flags, wave4Slain, ready4/ready5), the verdict
rule (firstDiv >= leverDay → CLEAN), the corpora, the bars B1–B4,
and the re-judgment rule (GO iff D3 passes 16/16 under the
corrected bound). The proof test verifies the copy-diff (comments
stripped, only the two `firstLeverDay` scan lines differ) and the
bound values before any judged leg.

## 2. D3 result per seed (the judged re-run)

Corrected bound (pool row) — `evidence/2026-11-21/d3refreeze-b-drift.log`,
exit 1, **14/16 CLEAN/IDENTICAL + 2 DRIFT**:

| Seed | Corrected bound (pool row) | First divergence | Verdict |
| --- | --- | --- | --- |
| 106751 | 74 | 75 | CLEAN |
| 106752 | 62 | 69 | CLEAN |
| 106753 | 44 | 47 | CLEAN |
| 106754 | 63 | 67 | CLEAN |
| 106755 | 87 | 88 | CLEAN |
| 106756 | null | null | IDENTICAL |
| 106757 | 103 | 104 | CLEAN |
| 106758 | null | null | IDENTICAL |
| **106759** | **97** | **96** | **DRIFT (96 < 97)** |
| 106760 | null | null | IDENTICAL |
| 106761 | 148 | null | IDENTICAL |
| 106762 | null | null | IDENTICAL |
| 106763 | 55 | null | IDENTICAL |
| **106764** | **64** | **56** | **DRIFT (56 < 64)** |
| 106765 | 94 (fallback: companion2 depart) | 95 | CLEAN |
| 106766 | null | null | IDENTICAL |

Old-bound control — `evidence/2026-11-21/d3refreeze-b-drift-oldbound.log`,
exit 1 — reproduces the confirm arm's D3 exactly: **15/16 CLEAN +
1 DRIFT (106751 only, bound 111, div 75)**. The re-run reads the
same corpora; the control proves it.

**Re-judgment rule applied:** D3 does not pass (14/16), so the
confirm verdict on this evidence stays **NO-GO on B5/D3**. B1–B4
stand as the confirm arm measured them (B1 PASS, B2 PASS, B3 PASS
with margin, B4 tracked 0.1198 pooled). No default flip.

## 3. The two flags are false positives — closed chains

Both flags have the same shape as 106751's: the lever acted at a
mid-day scoring (part 1–3), which the part-0-only pool rows never
observe. The pool-row bound is late in both cases; the dawnbidScore
bound (first needWave>=4 dawnbidScore, any part) and the old
world-tick bound both clear both seeds — the pool row is the odd
bound out in all three comparisons.

**106759 — the lever acted day 95, the bound says 97.** ON day 95
part 3: holder app_mgpsphmr523 (needWave 4, target influencer)
scores `party_launch` with companion rosa_mendez (**forager** —
excluded by the OLD gate, so the scoped gate acted). OFF day 95
part 3, same holder, same plan: no party_launch candidate at all,
pick `party_wait`. Divergence day 96 (kill log: OFF two extra
wave-3 kills, ON two wave-2 instead; v3 4 → 2) follows directly
from the ON holder going out while the OFF holder waits at Haven.
First pool row day 97 — two days AFTER the lever acted. Bounds for
this seed: world-tick 95 CLEAN, dawnbidScore 95 CLEAN, pool-row 97
DRIFT.

**106764 — the lever acted day 55, the bound says 64.** ON day 55
part 3: holder rosa_mendez (needWave 4, target influencer) scores
`party_launch` with gen_7r67xop (**forager**); OFF day 55 part 3:
party_launch with adaeze_nwosu (the old gate's pick). ON day 56
part 1: rosa_mendez commits party_launch with brian_otieno and
LAUNCHES (dawnbidDeparts seq 907, 3-person party vs the
influencer); OFF day 56 part 1: party_wait, no launch candidate.
Divergence day 56 (ON one extra wave-3 kill @3:ad_break, v3 5 vs
4) is the launched party's fight. First pool row day 64 — nine
days AFTER the lever acted. Bounds for this seed: world-tick 55
CLEAN, dawnbidScore 55 CLEAN, pool-row 64 DRIFT. This is the
confirm arm's own gate-act fixture seed — the seed the confirm
proof used to demonstrate the gate acting.

**106765 — cleared, and why it is not a third flag.** The ON leg
has NO needWave>=4 pool row in 150 days (the pool-row population
is itself downstream of the lever: the day-94 launch changed the
holder's trajectory). But the frozen fallback resolves the bound:
the day-94 v4departs row for nina_petrova's herald launch carries
a non-null companion2 (nikos_papadopoulos, targetWave 4), so
firstLeverDay = 94 and the seed reads CLEAN (95 ≥ 94). The lever
acted earlier still — day 92 part 3, a party_launch pick with
sigrun_eiriksdottir (**homebody**); day 94 part 2 it commits with
gen_vutzhft (**forager**) and launches a 4-person party — but the
fallback bound (94) still clears the seed because the divergence
(95) follows the depart (94). The first proof run caught this: the
prereg first recorded 106765 as DRIFT on a null bound, and the
proof's bound-table check showed the fallback fires at 94. The
prereg and the expected D3 were corrected before any judged leg
ran.

**Why the pool row is late — the mechanism, read from the driver.**
The recorder writes a companionPool row only for a wave-4+ plan
holder scored at dayPart 0 (driver line ~946). Mid-day scorings
(parts 1–3) run `findCompanion` and can commit party_launch
without any pool row. The dawnbidScore rows observe every scoring
(any part) and are the complete record; the pool row is a subset.
Cross-checked before freezing: first needWave>=4 dawnbidScore ≤
first needWave>=4 pool row on every seed, and zero departs with a
wave-4 target occur before the first needWave>=4 dawnbidScore on
any seed (the wave-4 set — algorithm, audit, congregation, eater,
eulogy, herald, influencer, reunion, strike, suburb — read from
the corpora's own kill logs; the earlier wave-3 hits — chorus_line,
redactor, callback — are needWave-3 plans where the scoped gate is
closed by construction). The two `findCompanion` call sites are
both dawn-scoring paths: villager-brain.js:239 (dawn-bid candidate
builder) and win-plan.js:1093 (`winPlanDepart` → `launchParty`).

## 4. The 106751 chain, re-read (the flag this arm cleared)

Day 67, BOTH legs — gen_ggt7q0q meets the influencer via
agency-flee (`expeditionMonster`, villager-agency.js:764) and the
needWave>=4 plan is seeded. Day 68, ON — a dawnbidScore picks
`party_launch` on that plan. Day 74, ON — the first gate-open pool
row (3 eligible foragers, bid luis_fernandez) and the first
committed launch (holder + Luis + Omar + Daniyar, four named
people, trust 90/90/35); OFF day 74 — no depart at all. Day 75 —
the daily fingerprints diverge (kill-log: OFF one extra cliffhanger
kill; the ON party is out on the road). The corrected bound is day
74; the divergence is day 75. CLEAN. The old bound (day 111) is 37
days late; the corrected bound is exact to the day the party
walked out.

## 5. Sense-testing (SENSE-TESTING LAW — read the chains as people)

**106751, day 67–75, reads as a person choosing to go.** The
holder met the influencer alone, ran, and came back with a plan;
the next scored dawn he bid for a party, and on day 74 three named
foragers — Luis, Omar, Daniyar, trust 90/90/35 — walked out with
him. They met the influencer the same day and backed off (evade, 0
damage dealt): they sized it up and chose not to die on it. That
is a hunt with a history (the day-67 flee is the lived reason for
the day-74 launch), not a roster slot filling. The System's day-69
lines bracket the same stretch — *"FINALES need a NATION... Bind
fires under one head"* and the ARC IV inefficiency beat (*"needing
to EAT — is the engine"*) — the fiction tracks the village's
actual standing while the party is forming.

**106764, day 55–56, reads the same way from the other side.**
Rosa_mendez bids at mid-day with a forager, commits the next part,
and launches a 3-person party (herself + brian_otieno +
vasyl_shevchenko) against the influencer — while the OFF leg's
same woman, same plan, same day, waits at Haven (party_wait).
The difference between the legs is one dawn choice, made by a
named person, with a named companion. The ON party's fight lands
in the kill log the next day (@3:ad_break). The mechanism and the
story agree: the lever changes who walks out, and the walk-out is
visible in the world.

**The gap the fiction does not cover stands.** No `vetSays` line
in the ON corpus marks the day-74 launch, the day-56 launch, or
the day-94 launch — the confirm arm's ordinary-launch silence
finding (0 launch-mention lines across all 16 ON files) is
confirmed on these chains too. When a party walks out to hunt a
wave-4 monster, the village still never says it is happening. The
holds ARE voiced (villager-brain.js:736/:768) — do not re-file
them as silent.

## 6. The wall (scale numbers, this corpus — carried from the confirm analysis)

Same corpora, no new sims; the numbers are the confirm analyzer's,
carried over (confirm evidence §3.4):

| | OFF | ON |
| --- | --- | --- |
| standing ≥ 200 | 6/16 | 5/16 |
| national rank | 0/16 | 0/16 |
| table | 0/16 | 0/16 |
| wins | 0/16 | 0/16 |
| wave-4 unlocked | 16/16 | 16/16 |
| wave-5 unlocked | 6/16 | 5/16 |
| total deaths | 1254 | 1293 (+3.1%) |
| starvation deaths | 10 | 11 |
| median survival | 150.5d | 151d |
| villages survived to 150d | 11/16 | 10/16 |

No village reached national, the table, or a win on either leg.
Wave 4 unlocks everywhere; wave 5 on 5–6 of 16. Nine ON villages
sit at exactly 199 standing. The scale wall stands past regional;
this re-judge moves no wall number — it only re-judges the
instrument clause.

## 7. Instrument validity

- Proof test `scripts/test-d3refreeze-b.js`: **28 passed, 0
  failed** — old bound 111 vs corrected bound 74 for 106751; old
  check flags 106751 DRIFT, corrected check calls it CLEAN;
  corrected per-seed bound table matches the frozen table (16
  seeds); the two predicted DRIFT seeds (106759, 106764) and the
  106765 fallback resolution (bound 94, CLEAN) asserted;
  synthetic verdict logic (CLEAN / DRIFT / IDENTICAL / null-bound
  + divergence / companion2-depart fallback); copy-diff (only
  the `firstLeverDay` scan lines differ, comments stripped);
  corpora unmodified in git status; no `src/` change.
- Proof history (recorded, not hidden): the first proof run went
  **24/28** with three failures, all one root cause — my own
  pre-freeze table recorded 106765's bound as null (no pool row)
  and predicted DRIFT, but the frozen fallback (companion2
  depart) fires at day 94 and the seed is CLEAN. The prereg
  table, the expected D3 (13/16 + 3 DRIFT → 14/16 + 2 DRIFT),
  and the test's frozen table were corrected before any judged
  leg ran; re-ran green at 28/28. The proof caught a real error
  in my own freeze, which is what the proof gate is for.
- Judged D3 re-run: corrected check exit 1 (2 drift seeds, as
  frozen-predicted); old-bound control exit 1 (reproduces the
  confirm arm's D3 exactly: 15/16 + 106751 DRIFT). Both logs
  committed.
- Corpora verified untouched after the re-run (`git status
  --porcelain` on both corpus dirs empty). No `src/` change in
  this arm (`git diff --quiet HEAD -- src/` exit 0).
- `check.js --quick`: NOT run — zero `src/` changes and zero
  new sims in this arm; the proof test (28/28) is the
  substantive gate for a scripts-only re-analysis. Recorded
  honestly, not green.

## 8. Blanks filled / documented

**Filled by this arm (evidence + instrument, no src/ change, no
new sims):** the 106751 D3 flag is cleared under the corrected
bound (CLEAN, 75 ≥ 74), the old-bound control reproduces the
confirm arm's D3 exactly, and the pool-row bound is now measured
band-wide — it is late on two more seeds, not just the one the
1530Z record named.

**Documented, not built (findings backlog — see sim-findings.md
#2639, updated this run):**
- The pool-row bound is non-conservative for the same reason the
  world-tick bound was: pool rows are part-0-only, while
  `findCompanion` also runs at mid-day scorings. Proven on 106759
  (lever day 95, bound 97) and 106764 (lever day 55, bound 64).
  The next re-freeze is the dawnbidScore bound (first needWave>=4
  dawnbidScore row, any part) — under it all 16 seeds are
  CLEAN/IDENTICAL on the evidence in §2/§3 (every firstDiv ≥
  firstDbV4; the five null-bound seeds have no divergence), and
  the old world-tick bound agrees with it on both flagged seeds.
  That re-freeze + D3 re-run on these same corpora is the next
  blank in order; it needs no new sims.
- The companion2-depart fallback rescued 106765 (bound 94) but
  observes the launch, not the scoring (first action day 92) —
  the fallback is a weaker (later) observation than the
  dawnbidScore, and it only clears seeds whose divergence
  follows the depart. Keep it as the last resort; do not promote
  it above the dawnbidScore.
- Sense gap (stands): ordinary wave-4+ party departures have no
  fiction line — confirmed on the 106751/106759/106764/106765
  launch chains.

## 9. Metric review

1. **The frozen corrected bound fails D3 on two seeds, and both
   failures are proven false positives — but the verdict follows
   the frozen rule anyway.** The pool-row bound was frozen in
   the prereg (per the 1530Z round record and this run's brief)
   and the D3 re-run was judged against it exactly as written:
   14/16, NO-GO. The bound is not corrected mid-run and the
   verdict stands as measured. The correction is proposed for
   the NEXT run, not this one: re-freeze first-lever-day as the
   first needWave>=4 dawnbidScore row (any part) on the ON leg,
   re-run D3 on THESE corpora, and re-judge B5. If D3 passes
   under that bound (expected: 16/16 CLEAN), the verdict on
   this evidence becomes GO and the default flip can be decided
   then. This is the second consecutive run in which the D3
   clause fails on a bound the corpus proves wrong — the drift
   check's bound has now been wrong twice in the same direction
   (too late), on three seeds total (106751, 106759, 106764).
   The pattern says the bound should be derived from the
   scoring record (dawnbidScores, every part), not from a
   part-0-only subset of it.
2. **The proof gate caught a real error in my own freeze
   before any judged leg.** The first proof run (24/28) showed
   the pre-freeze table had 106765 wrong (null bound, predicted
   DRIFT) because I had not accounted for the companion2-depart
   fallback firing at day 94. The prereg and the test were
   corrected before the judged re-run; the judged table then
   matched the corrected prediction exactly (14/16 + 2 DRIFT).
   No metric change follows; the lesson is the poolfirstfail
   one — a new bound's per-seed table should be computed by
   running the actual check, not by hand, before freezing.
   (This run did run the check in the proof; the error was in
   the hand-computed table the proof was checked against.)
3. **B1–B4 are not re-judged, by design.** The re-judgment rule
   freezes them as the confirm arm measured them. No B1–B4
   revision is proposed; the only open instrument question is
   the D3 bound, and §9(1) names its next form.
4. **The three-bound comparison is the honest summary of the
   instrument's state.** For 106759: world-tick 95 CLEAN,
   dawnbidScore 95 CLEAN, pool-row 97 DRIFT. For 106764:
   world-tick 55 CLEAN, dawnbidScore 55 CLEAN, pool-row 64
   DRIFT. Two of the three candidate bounds agree on every
   seed; the pool row is the outlier on both flagged seeds.
   The next re-freeze should freeze the bound the other two
   agree with — the scored dawn — not a third new observable.

## 10. Files / disposition

- Prereg: `evidence/2026-11-21/sim-d3refreeze-b-prereg.md`
  (frozen ~18:01 UTC, before the judged D3 re-run; the 106765
  fallback correction recorded before any judged leg).
- Instrument: `scripts/profilegate4-d3refreeze-b-drift-check.js`,
  `scripts/test-d3refreeze-b.js` (28/28 green).
- D3 re-run outputs (new):
  `evidence/2026-11-21/d3refreeze-b-drift.log` (corrected bound:
  14/16 + 2 DRIFT, exit 1),
  `evidence/2026-11-21/d3refreeze-b-drift-oldbound.log`
  (old-bound control: 15/16 + 106751 DRIFT, exit 1).
- Corpora (preserved, read-only):
  `evidence/2026-11-21/perseed-profilegate4-confirm-b-off/` and
  `perseed-profilegate4-confirm-b-on/` (16 files each).
- Evidence: this file.
- **Disposition: NO-GO under the frozen corrected bound
  (B5/D3, 14/16) — no default flip. The 106751 flag is cleared;
  two new flags (106759, 106764) are proven false positives of
  the same class. The instrument + evidence commit is ready to
  merge; the follow-up (re-freeze to the dawnbidScore bound,
  re-run D3 on these corpora, re-judge B5) needs no new sims and
  is the next blank in order. No push; no version bump; no live
  verification. The coordinator merges via --ff-only and reports
  'merged locally, pending ship'.**
