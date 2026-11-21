# sim-d3refreeze2-b — SECOND D3 re-freeze + re-judge of the profilegate-confirm B5 clause — GO

**Arm:** sim-d3refreeze2-b, second re-freeze + re-judge · **Loop B run:**
fleshout-loop-b-20261121T2030Z, axis winnability chain
**Verdict: GO — D3 passes 16/16 under the frozen corrected bound, so
the profilegate-confirm verdict on this evidence becomes GO.** The
dawnbidScore bound (first needWave>=4 dawnbidScore row, any part)
clears all 16 seeds, including the two the pool-row bound flagged:
106759 (bound 95, div 96) and 106764 (bound 55, div 56). B1–B4 are
NOT re-judged here (they pass on the confirm evidence and stand).
This is an instrument verdict, not a lever verdict — for the third
time running, the lever passes every frozen bar that measures the
game; the drift check's bound is now the one the causal argument
proves conservative, and it passes. **No default flip is decided
here** — the PROFILEGATE4 default flip is a separate decision, not
this arm's.
**Type:** RE-JUDGE, no src/ change, no new sims. Pure re-analysis
of committed corpora.
**Branch:** `sim-d3refreeze2-b` · **Worktree:**
`~/workspace/worktrees/sim-d3refreeze2-b`
**Base:** worktree HEAD `320165c5a` (coordinator rebases at landing).
**Policy:** competent verbatim, sha256 `1884c8852d38` (12-char prefix).
**Band:** seeds 106751–106766 (16 seeds, the confirm arm's band,
re-used — a re-analysis, not a fresh band) · **Horizon:** 150d
death-aware.
**Prereg:** `evidence/2026-11-21/sim-d3refreeze2-b-prereg.md`
(frozen ~20:53 UTC, before the judged D3 re-run; two proof-test
corrections before any judged leg — see §7 — and nothing amended
after).

## 1. The re-freeze — what changed, and what did not

The D3 drift check's `firstLeverDay` changed in exactly one place:
**first needWave>=4 pool row on the ON leg → first needWave>=4
dawnbidScore row on the ON leg, any part.** The dawnbidScore row
carries the plan's needWave as `row.plan.needWave` (a top-level
`row.needWave` does NOT exist — verified from the corpora before
freezing: a scan on `r.needWave` finds zero rows on 106759 while
`r.plan.needWave` finds the day-95 part-3 row). The fallback (first
depart row carrying a non-null companion2) is retained; a seed with
no dawnbidScore row and no fallback depart that diverges is DRIFT;
with no divergence it is IDENTICAL. The pool-row scan is REMOVED.
Everything else is byte-identical in behavior: the fingerprint
(waveKillLog, vetsW3/W4 counts, roster dead flags, wave4Slain,
ready4/ready5), the verdict rule (firstDiv >= leverDay → CLEAN),
the corpora, the bars B1–B4, and the re-judgment rule (GO iff D3
passes 16/16 under the corrected bound). The proof test verifies
the copy-diff (comments stripped, only the two `firstLeverDay`
scan lines differ) and the bound values before any judged leg.

## 2. D3 result per seed (the judged re-run)

Corrected bound (dawnbidScore) —
`evidence/2026-11-21/d3refreeze2-b-drift.log`, exit 0,
**16/16 CLEAN/IDENTICAL + 0 DRIFT — NO PRE-LEVER DRIFT**:

| Seed | Corrected bound (dawnbidScore) | part | First divergence | Verdict |
| --- | --- | --- | --- | --- |
| 106751 | 68 | 3 | 75 | CLEAN |
| 106752 | 62 | 0 | 69 | CLEAN |
| 106753 | 44 | 0 | 47 | CLEAN |
| 106754 | 63 | 0 | 67 | CLEAN |
| 106755 | 87 | 0 | 88 | CLEAN |
| 106756 | null | — | null | IDENTICAL |
| 106757 | 100 | 1 | 104 | CLEAN |
| 106758 | null | — | null | IDENTICAL |
| **106759** | **95** | **3** | **96** | **CLEAN (96 ≥ 95)** |
| 106760 | null | — | null | IDENTICAL |
| 106761 | 144 | 1 | null | IDENTICAL |
| 106762 | null | — | null | IDENTICAL |
| 106763 | 55 | 0 | null | IDENTICAL |
| **106764** | **55** | **3** | **56** | **CLEAN (56 ≥ 55)** |
| 106765 | 92 | 3 | 95 | CLEAN |
| 106766 | null | — | null | IDENTICAL |

The two seeds the pool-row bound flagged are cleared, and no other
seed flips: every firstDiv ≥ firstDbV4, and the five null-bound
seeds have no divergence. The claim in the d3refreeze evidence
("that bound clears all 16 seeds") is verified by the judged
re-run, not assumed — the pre-freeze computation predicted exactly
this table, and the judged run reproduced it row for row.

Pool-row control —
`evidence/2026-11-21/d3refreeze2-b-drift-oldbound.log`, exit 1 —
reproduces the d3refreeze arm's D3 exactly: **14/16 CLEAN + 2
DRIFT (106759, bound 97, div 96; 106764, bound 64, div 56)**. The
re-run reads the same corpora; the control proves it.

World-tick control —
`evidence/2026-11-21/d3refreeze2-b-drift-worldtick.log`, exit 1 —
reproduces the confirm arm's D3 exactly: **15/16 CLEAN + 1 DRIFT
(106751 only, bound 111, div 75)**.

**Re-judgment rule applied:** D3 passes (16/16), so the confirm
verdict on this evidence becomes **GO**. B1–B4 stand as the confirm
arm measured them (B1 PASS, B2 PASS, B3 PASS with margin, B4
tracked 0.1198 pooled). No default flip is decided in this arm.

## 3. The two cleared flags — closed chains, re-read under the new bound

Both flags have the same shape as 106751's: the lever acted at a
mid-day scoring (part 3), which the part-0-only pool rows never
observe. The dawnbidScore rows observe every scoring, so the
bound is exact to the scoring that acted.

**106759 — the lever acted day 95 part 3, the bound says 95.** ON
day 95 part 3: holder app_mgpsphmr523 (needWave 4, target
influencer) scores `party_launch` with companion rosa_mendez
(**forager** — excluded by the OLD gate, so the scoped gate
acted); the row's pick is `party_launch` (`override:
win_plan:party_launch`, corePick WATER). OFF day 95 part 3, same
holder, same plan: no party_launch candidate at all, pick
`party_wait`. Divergence day 96 (kill log: OFF two extra wave-3
kills, ON two wave-2 instead; v3 4 → 2) follows directly from the
ON holder going out while the OFF holder waits at Haven. First
pool row day 97 — two days AFTER the lever acted. Bounds for this
seed: world-tick 95 CLEAN, dawnbidScore 95 CLEAN, pool-row 97
DRIFT. The dawnbidScore bound agrees with the world-tick bound
here; the pool row is the odd bound out.

**106764 — the lever acted day 55 part 3, the bound says 55.** ON
day 55 part 3: holder rosa_mendez (needWave 4, target influencer)
scores `party_launch` with gen_7r67xop (**forager**); OFF day 55
part 3: party_launch with adaeze_nwosu (the old gate's pick). ON
day 56 part 1: rosa_mendez commits party_launch with brian_otieno
and LAUNCHES (dawnbidDeparts seq 907, 3-person party vs the
influencer); OFF day 56 part 1: party_wait, no launch candidate.
Divergence day 56 (ON one extra wave-3 kill @3:ad_break, v3 5 vs
4) is the launched party's fight. First pool row day 64 — nine
days AFTER the lever acted. Bounds for this seed: world-tick 55
CLEAN, dawnbidScore 55 CLEAN, pool-row 64 DRIFT. This is the
confirm arm's own gate-act fixture seed — the seed the confirm
proof used to demonstrate the gate acting.

**106765 — cleared under the bound itself now, not the fallback.**
The ON leg has NO needWave>=4 pool row in 150 days, and the
d3refreeze arm cleared it only via the companion2-depart fallback
(bound 94, div 95). Under the dawnbidScore bound it is CLEAN on
the bound itself: first needWave>=4 dawnbidScore day 92 part 3
(the day-92 party_launch pick with sigrun_eiriksdottir,
**homebody**), divergence day 95. The fallback never fires on
these corpora — every null-bound seed (106756, 106758, 106760,
106762, 106766) has no companion2 depart and no divergence — so
the fallback changes no verdict here; it is retained for shape
parity and proven by a synthetic case in the proof test.

**Why the dawnbidScore bound is the right one — the mechanism,
read from the data.** The recorder writes a companionPool row
only for a wave-4+ plan holder scored at dayPart 0 (driver line
~946). Mid-day scorings (parts 1–3) run `findCompanion` and can
commit party_launch without any pool row. The dawnbidScore rows
observe every scoring (any part) and are the complete record; the
pool row is a subset. The bound table itself shows the mechanism:
the first dawnbidScore row is at part 1–3 on six seeds (106751
part 3, 106757 part 1, 106759 part 3, 106761 part 1, 106764 part
3, 106765 part 3) — the pool row, being part-0-only, cannot see
any of these first scorings. First needWave>=4 dawnbidScore ≤
first needWave>=4 pool row on every seed, strictly earlier on six
of them. The two `findCompanion` call sites are both dawn-scoring
paths: villager-brain.js:239 (dawn-bid candidate builder) and
win-plan.js:1093 (`winPlanDepart` → `launchParty`).

## 4. The 106751 chain, re-read (the flag the first re-freeze cleared)

Day 67, BOTH legs — gen_ggt7q0q meets the influencer via
agency-flee (`expeditionMonster`, villager-agency.js:764) and the
needWave>=4 plan is seeded. Day 68, ON — a dawnbidScore picks
`party_launch` on that plan (first needWave>=4 dawnbidScore day
68, part 3 — the corrected bound for this seed). Day 74, ON — the
first gate-open pool row (3 eligible foragers, bid luis_fernandez)
and the first committed launch (holder + Luis + Omar + Daniyar,
four named people, trust 90/90/35); OFF day 74 — no depart at
all. Day 75 — the daily fingerprints diverge (kill-log: OFF one
extra cliffhanger kill; the ON party is out on the road). The
dawnbidScore bound is day 68; the divergence is day 75. CLEAN
with a 7-day margin. The old bound (day 111) is 37 days late;
the pool-row bound (day 74) is exact to the launch but 6 days
later than the first scoring that acted.

## 5. Sense-testing (SENSE-TESTING LAW — read the chains as people)

**106759, day 95–96, reads as a person choosing to go.** The
holder (app_mgpsphmr523) has a needWave-4 plan against the
influencer; at the third scoring of the day he bids for a party
with Rosa Mendez, a forager the old gate would have excluded —
the scoped gate is exactly what lets this bid exist — while the
same man, same plan, same day in the OFF leg waits at Haven
(party_wait). The next day's kill log is the consequence: the ON
holder is out and the fighting differs. One dawn choice, made by
a named person, with a named companion, at a mid-day scoring the
pool-row recorder never saw. The mechanism and the story agree:
the lever changes who walks out, and the walk-out is visible in
the world.

**106764, day 55–56, reads the same way from the other side.**
Rosa_mendez bids at mid-day with a forager, commits the next
part, and launches a 3-person party (herself + brian_otieno +
vasyl_shevchenko) against the influencer — while the OFF leg's
same woman, same plan, same day, waits at Haven (party_wait).
The difference between the legs is one dawn choice, made by a
named person, with a named companion. The ON party's fight lands
in the kill log the next day (@3:ad_break). The mechanism and the
story agree.

**The gap the fiction does not cover stands.** No `vetSays` line
in the ON corpus marks the day-95 launch, the day-56 launch, or
the day-94 launch. A fresh check of all 16 ON files (554 vetSays
lines) finds 5 lines matching launch/party — all five are combat
threat warnings ("Your party: just you. You are outnumbered —
fight like it."), none a departure announcement. When a party
walks out to hunt a wave-4 monster, the village still never says
it is happening. The holds ARE voiced (villager-brain.js:736/:768)
— do not re-file them as silent.

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
instrument clause. The lever's GO verdict is about the lever
(party-gate relaxation fills the pool, launches rise, cost within
bar); the wall is a separate, still-open problem.

## 7. Instrument validity

- Proof test `scripts/test-d3refreeze2-b.js`: **35 passed, 0
  failed** — pool-row bound 97/64 vs dawnbidScore bound 95/55 for
  106759/106764; pool-row check flags both DRIFT, corrected check
  calls both CLEAN; world-tick control still flags 106751 DRIFT
  (bound 111); corrected per-seed bound table matches the frozen
  table (16 seeds); first-scoring parts match (six mid-day);
  synthetic verdict logic (CLEAN / DRIFT / IDENTICAL / null-bound
  + divergence / companion2-depart fallback / top-level-needWave
  field guard); copy-diff (only the `firstLeverDay` scan lines
  differ, comments stripped); corpora unmodified in git status; no
  `src/` change.
- Proof history (recorded, not hidden): the first proof run went
  **33/35** with two failures, both in my own test, both corrected
  before any judged leg ran. (1) The prereg-table cross-check
  needle used '—' for every seed missing from the frozen part
  table, but the prereg records part-0 seeds as `0` — the test's
  needle was wrong, the prereg was right. (2) The no-src/ check
  used `git diff --quiet HEAD -- src/` via execSync, which timed
  out at 180s on this slow tree — an infrastructure timeout, not a
  src/ change; the equivalent property is now checked with `git
  status --porcelain -- src/` (empty), the same mechanism the
  corpora check already proved completes. Re-ran green at 35/35.
  The proof caught real errors in my own test, which is what the
  proof gate is for.
- Judged D3 re-run: corrected check exit 0 (16/16 CLEAN/IDENTICAL,
  NO PRE-LEVER DRIFT, as frozen-predicted); pool-row control exit 1
  (reproduces the d3refreeze arm's D3 exactly: 14/16 +
  106759/106764 DRIFT); world-tick control exit 1 (reproduces the
  confirm arm's D3 exactly: 15/16 + 106751 DRIFT). All three logs
  committed.
- Corpora verified untouched after the re-run (`git status
  --porcelain` on both corpus dirs empty). No `src/` change in
  this arm (`git status --porcelain -- src/` empty).
- `check.js --quick`: NOT run — zero `src/` changes and zero
  new sims in this arm; the proof test (35/35) is the
  substantive gate for a scripts-only re-analysis. Recorded
  honestly, not green.
- Write flap: ACTIVE at run start (registry writes EPERM ~20:33Z).
  Probe `git update-ref refs/heads/probe HEAD` OK at ~20:53Z
  before the first write; every file verified by size/readback
  after writing (prereg 18,622 bytes, proof test 15,848 bytes);
  no write failed during this arm.

## 8. Blanks filled / documented

**Filled by this arm (evidence + instrument, no src/ change, no
new sims):** the 106759 and 106764 D3 flags are cleared under the
corrected bound (CLEAN, 96 ≥ 95 and 56 ≥ 55); the pool-row and
world-tick controls reproduce the two earlier arms' D3 exactly;
the dawnbidScore bound is now measured band-wide — it is earlier
than or equal to the pool-row bound on every seed, strictly
earlier on six, and it clears all 16; the confirm verdict on this
evidence becomes GO under the frozen re-judgment rule.

**Documented, not built (findings backlog — see sim-findings.md
#2639, updated this run):**
- The D3 bound question is closed on this corpus: three bounds
  were tried (world-tick, pool-row, dawnbidScore); the
  dawnbidScore bound is the one the causal argument proves
  conservative ("the gate cannot act before a scored dawn for a
  needWave>=4 holder") and it passes 16/16. No fourth bound is
  needed or proposed.
- The companion2-depart fallback never fires on these corpora
  and observes the launch, not the scoring — keep it as the last
  resort; do not promote it above the dawnbidScore.
- Sense gap (stands): ordinary wave-4+ party departures have no
  fiction line — re-confirmed on the 106759/106764/106765 launch
  chains (554 vetSays lines, 5 launch/party matches, all combat
  warnings).
- The scale wall stands (see §6): national/table/wins 0/16 on
  both legs; nine ON villages at exactly 199 standing. The
  lever's GO does not move the wall.

## 9. Metric review

1. **The frozen corrected bound passes D3 16/16, and the
   re-judgment rule fires as written.** The dawnbidScore bound
   was frozen in the prereg (per the d3refreeze evidence's named
   next step and this run's brief) and the D3 re-run was judged
   against it exactly as written: 16/16, GO. The bound was not
   corrected mid-run and the verdict follows the frozen rule. The
   two controls (pool-row 14/16, world-tick 15/16) reproduce the
   earlier arms' D3 exactly, which is the evidence that the
   re-run read the same corpora and that the bound — not the
   re-run — is what changed the verdict.
2. **The proof gate caught real errors in my own test before any
   judged leg.** The first proof run (33/35) showed a wrong
   needle in the prereg-table cross-check (part-0 seeds recorded
   as `0`, not '—') and a git-timeout in the no-src/ check (diff
   --quiet exceeding 180s on this slow tree). Both were fixed in
   the test before the judged re-run; the judged table then
   matched the frozen prediction exactly (16/16). No metric
   change follows; the lesson is the same one the d3refreeze arm
   recorded — a new bound's per-seed table should be computed by
   running the actual check, not by hand, before freezing. (This
   run did run the check in the proof; the errors were in the
   test's own assertions, not the table.)
3. **B1–B4 are not re-judged, by design.** The re-judgment rule
   freezes them as the confirm arm measured them. No B1–B4
   revision is proposed; the only open instrument question was
   the D3 bound, and §9(1) closes it on this corpus.
4. **The three-bound comparison is the honest summary of the
   instrument's state.** For 106759: world-tick 95 CLEAN,
   dawnbidScore 95 CLEAN, pool-row 97 DRIFT. For 106764:
   world-tick 55 CLEAN, dawnbidScore 55 CLEAN, pool-row 64 DRIFT.
   For 106751: world-tick 111 DRIFT, dawnbidScore 68 CLEAN,
   pool-row 74 CLEAN. Two of the three candidate bounds agree on
   every seed; the dawnbidScore bound is the one that agrees with
   the world-tick bound on the two flagged seeds AND with the
   pool-row bound on 106751. The bound the other two agree with
   is the scored dawn — and it passes.
5. **A note on what GO does and does not mean.** GO here means
   the profilegate lever passes every frozen bar on this
   evidence (B1–B4 as the confirm arm measured them, B5/D3 as
   re-judged here). It does not mean the game is winnable — the
   wall numbers (§6) still show zero national/table/wins — and
   it does not decide the PROFILEGATE4 default flip, which is a
   separate decision for after this re-judge lands.

## 10. Files / disposition

- Prereg: `evidence/2026-11-21/sim-d3refreeze2-b-prereg.md`
  (frozen ~20:53 UTC, before the judged D3 re-run; the two
  proof-test corrections recorded before any judged leg).
- Instrument: `scripts/profilegate4-d3refreeze2-b-drift-check.js`,
  `scripts/test-d3refreeze2-b.js` (35/35 green).
- D3 re-run outputs (new):
  `evidence/2026-11-21/d3refreeze2-b-drift.log` (corrected bound:
  16/16 CLEAN/IDENTICAL, exit 0),
  `evidence/2026-11-21/d3refreeze2-b-drift-oldbound.log`
  (pool-row control: 14/16 + 106759/106764 DRIFT, exit 1),
  `evidence/2026-11-21/d3refreeze2-b-drift-worldtick.log`
  (world-tick control: 15/16 + 106751 DRIFT, exit 1).
- Corpora (preserved, read-only):
  `evidence/2026-11-21/perseed-profilegate4-confirm-b-off/` and
  `perseed-profilegate4-confirm-b-on/` (16 files each).
- Evidence: this file.
- **Disposition: GO — D3 passes 16/16 under the frozen corrected
  bound; the profilegate-confirm verdict on this evidence becomes
  GO. No default flip decided here. The instrument + evidence
  commit is ready to merge; the coordinator merges via --ff-only
  and reports 'merged locally, pending ship'. No push; no version
  bump; no live verification.**

## 11. Coordinator filing note — sim-findings.md #2639 (write flap blocked the edit)

The #2639 update below could NOT be written into
`hidden_files/sim-findings.md` in this arm: fresh-file writes are
being refused intermittently (EPERM) at run close — the 2MB backup
copy failed three times and a 5.6KB tail backup failed too, so the
in-place edit was not attempted without a backup. The coordinator
should apply this update (change the entry's marker from `- [open]`
to `- [fixed]` and append the UPDATE block to the end of the #2639
line):

[UPDATE 2026-11-21 (Loop B arm sim-d3refreeze2-b, run
fleshout-loop-b-20261121T2030Z, evidence/2026-11-21/sim-d3refreeze2-b.md,
re-judge landed — verdict becomes GO): the dawnbidScore bound (first
needWave>=4 dawnbidScore row, any part) clears all 16 seeds —
106759 CLEAN (bound 95, div 96) and 106764 CLEAN (bound 55, div 56),
both proven false positives of the pool-row bound; the pool-row
control reproduces 14/16 + 2 DRIFT and the world-tick control
reproduces 15/16 + 106751 DRIFT, proving the re-run read the same
corpora. Proof 35/35 (first run 33/35 caught two test bugs before
any judged leg). D3 passes 16/16 under the frozen corrected bound,
so the profilegate-confirm verdict on this evidence becomes GO.
Finding FIXED; no default flip decided here.]
