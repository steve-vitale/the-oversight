# sim-d3refreeze2-b — PREREG, the SECOND D3 re-freeze + re-judge (frozen before any judged leg)

**Arm:** sim-d3refreeze2-b, second re-freeze + re-judge of the
profilegate-confirm B5/D3 clause · **Loop B run:**
fleshout-loop-b-20261121T2030Z (axis: winnability chain) ·
**Branch:** `sim-d3refreeze2-b` · **Worktree:**
`~/workspace/worktrees/sim-d3refreeze2-b`
**Base at arm start:** worktree HEAD `320165c5a`. Do NOT rebase; the
coordinator rebases at landing.
**Frozen:** 2026-11-21 ~20:53 UTC, BEFORE any judged leg (the D3
re-run is the judged leg; everything in §"Pre-freeze verification"
below was measured from the committed corpora before this freeze,
read-only).
**Policy:** competent verbatim, sha256 `1884c8852d38` (12-char prefix;
inherited from the confirm arm — no new sims run, so no policy is
re-probed here).
**Band:** seeds 106751–106766 (16 seeds, the confirm arm's band —
RE-USED deliberately; this is a re-analysis of the same corpora, not a
fresh band, so the fresh-band rule does not apply — see §"Seed-band
freshness" below).
**Horizon:** 150d death-aware (the confirm corpora's horizon).
**Corpora (READ-ONLY):**
`evidence/2026-11-21/perseed-profilegate4-confirm-b-off/` and
`evidence/2026-11-21/perseed-profilegate4-confirm-b-on/` (16 files
each, committed on master by the confirm arm). Never rewrite them;
analyzer outputs go to NEW files in this worktree.

## The question (the d3refreeze evidence's next blank #1)

The profilegate-confirm arm
(`evidence/2026-11-21/sim-profilegate-confirm-b.md`, 16 fresh seeds
106751–106766) passed bars B1–B4 but failed B5 on D3 alone: seed
106751 diverges day 75 vs the frozen first-lever-day (first
world-tick v4 seed row) day 111. The first re-freeze
(`evidence/2026-11-21/sim-d3refreeze-b.md`, LANDED c8a2d61fa)
re-froze the bound as the first needWave>=4 pool row and cleared
106751 (CLEAN, 75 ≥ 74) — but flagged two more seeds, 106759
(bound 97, lever acted day 95) and 106764 (bound 64, lever acted
day 55), both proven false positives of the same class: the lever
acts at mid-day scorings (parts 1–3) that part-0-only pool rows
never observe. Finding #2639 in the goal
`hidden_files/sim-findings.md` records both rounds. This arm
re-freezes the bound a second time — the dawnbidScore bound —,
re-runs D3 on THESE corpora — no new sims — and re-judges B5.

## The one authorized change

`firstLeverDay` in the D3 drift check: **first needWave>=4 pool row
on the ON leg → first needWave>=4 dawnbidScore row on the ON leg,
any part.** The dawnbidScore row carries the plan's needWave as
`row.plan.needWave` (a top-level `row.needWave` does NOT exist —
verified from the corpora before freezing: a scan on `r.needWave`
finds zero rows on 106759 while `r.plan.needWave` finds the day-95
part-3 row). The fallback (when no needWave>=4 dawnbidScore row
exists) is unchanged in shape from d3refreeze: the first depart
row carrying a non-null companion2 is RETAINED only as the last
resort; a seed with no needWave>=4 dawnbidScore row and no
divergence is IDENTICAL, and a seed with no needWave>=4
dawnbidScore row that DOES diverge is DRIFT (leverDay null, same
as the old check's null handling). The pool-row scan is REMOVED —
it was the defective bound.

The corrected bound's justification, as frozen in the d3refreeze
evidence §9: the gate cannot act before a scored dawn for a
needWave>=4 holder, and the dawnbidScore rows observe every
scoring (any part) — they are the complete record, while the pool
row is its part-0 subset. For seed 106759 the corrected bound
computes **day 95** (first needWave>=4 dawnbidScore row, part 3)
vs the pool-row bound's **day 97**; the divergence (day 96) is on
or after the corrected bound, so the seed is CLEAN under it. For
seed 106764 the corrected bound computes **day 55** (part 3) vs
the pool-row bound's **day 64**; the divergence (day 56) is on or
after it, so the seed is CLEAN under it.

No other change vs the landed `-d3refreeze-b` drift check. The
fingerprint function, the verdict rule (firstDiv >= leverDay →
CLEAN), the corpora, the bars B1–B4, and the re-judgment rule below
are untouched. Do NOT modify the landed `-d3refreeze-b` or
`-confirm-b` instrument files (new `-d3refreeze2-b` copies
instead). Do NOT touch `src/js` at all. Do NOT touch Loop A's
trees/branches or the sibling arms' trees.

**Post-hoc amendment is forbidden.** The bound above is frozen in
this prereg and in the refreeze drift check. It may not be amended
after the judged D3 re-run to match whatever the re-run reports. If
D3 fails under this bound, the verdict is NO-GO and the failure is
reported, never re-scored — and NO third bound is invented in this
arm; the bound question goes back as a finding.

## Pre-freeze verification (measured from the committed corpora before freezing — read-only)

The band-wide bound table below was computed from the committed ON
corpora before this freeze (first needWave>=4 dawnbidScore row via
`row.plan.needWave`, its part, first needWave>=4 pool row, first
world-tick v4 seed row, first divergence day — same fingerprint as
the drift check). It is recorded here so the frozen bound's
expected D3 outcome is on the record BEFORE the judged re-run, in
the same spirit as the d3refreeze prereg's "verified before
freezing" sections. The judged re-run must still actually run and
produce its own table; this section is the prediction, not the
verdict.

| Seed | First dawnbidScore (needWave≥4) | part | Pool-row bound | Old bound (world-tick) | First divergence | D3 under frozen dawnbidScore bound |
| --- | --- | --- | --- | --- | --- | --- |
| 106751 | 68 | 3 | 74 | 111 | 75 | CLEAN (75 ≥ 68) |
| 106752 | 62 | 0 | 62 | 26 | 69 | CLEAN |
| 106753 | 44 | 0 | 44 | 43 | 47 | CLEAN |
| 106754 | 63 | 0 | 63 | 62 | 67 | CLEAN |
| 106755 | 87 | 0 | 87 | 33 | 88 | CLEAN |
| 106756 | null | — | null | 28 | null | IDENTICAL |
| 106757 | 100 | 1 | 103 | 29 | 104 | CLEAN |
| 106758 | null | — | null | 34 | null | IDENTICAL |
| 106759 | 95 | 3 | 97 | 95 | 96 | CLEAN (96 ≥ 95) |
| 106760 | null | — | null | 35 | null | IDENTICAL |
| 106761 | 144 | 1 | 148 | 33 | null | IDENTICAL |
| 106762 | null | — | null | 53 | null | IDENTICAL |
| 106763 | 55 | 0 | 55 | 38 | null | IDENTICAL |
| 106764 | 55 | 3 | 64 | 55 | 56 | CLEAN (56 ≥ 55) |
| 106765 | 92 | 3 | null → fallback 94 | 44 | 95 | CLEAN (95 ≥ 92) |
| 106766 | null | — | null | 41 | null | IDENTICAL |

**Expected D3 under the frozen bound: 16/16 CLEAN/IDENTICAL + 0
DRIFT.** The two seeds the pool-row bound flagged are cleared
under the dawnbidScore bound, and no other seed flips: every
firstDiv ≥ firstDbV4, and the five null-bound seeds have no
divergence. The claim in the d3refreeze evidence ("that bound
clears all 16 seeds") is verified by this pre-freeze computation,
not assumed — but the judged re-run must still reproduce it.

Cross-checks run before freezing (read-only, same corpora):
- First needWave>=4 dawnbidScore ≤ first needWave>=4 pool row on
  every seed (dawnbidScore rows are the complete record; pool rows
  are their part-0 subset). Strictly earlier on 106751 (68 < 74),
  106757 (100 < 103), 106759 (95 < 97), 106761 (144 < 148),
  106764 (55 < 64), 106765 (92, no pool row at all).
- The mid-day mechanism is visible in the bound table itself:
  the first dawnbidScore row is at part 1–3 on six seeds (106751
  part 3, 106757 part 1, 106759 part 3, 106761 part 1, 106764 part
  3, 106765 part 3) — the pool row, being part-0-only, cannot see
  any of these first scorings.
- Zero departs with a wave-4 target (algorithm, audit,
  congregation, eater, eulogy, herald, influencer, reunion, strike,
  suburb — the wave-4 set read from the corpora's own kill logs)
  occur before the first needWave>=4 dawnbidScore on any seed, so
  no depart-channel lever action precedes the dawnbidScore bound.
  (Carried from the d3refreeze prereg's cross-check; the bound
  definition is the same one that prereg computed the table with.)
- The two `findCompanion` call sites are both dawn-scoring paths:
  villager-brain.js:239 (dawn-bid candidate builder) and
  win-plan.js:1093 (`winPlanDepart` → `launchParty`, the legacy
  depart gate — departs are recorded in dawnbidDeparts).
- The companion2-depart fallback never fires on these corpora:
  every seed with no needWave>=4 dawnbidScore row also has no
  companion2 depart and no divergence (106756, 106758, 106760,
  106762, 106766). It is retained in the instrument for shape
  parity with d3refreeze and proven by a synthetic case in the
  proof test, not by a real seed.

## Primary metric (frozen)

D3 drift on the confirm corpora under the corrected (dawnbidScore)
first-lever-day bound: first divergence day ≥ first-lever-day on
every seed, where first-lever-day = first needWave>=4 dawnbidScore
row on the ON leg, any part (fallback: first companion2 depart;
null + divergence = DRIFT).

## Re-judgment rule (frozen)

**If D3 passes under the corrected bound on these same corpora
(16/16 CLEAN or IDENTICAL), the confirm verdict on this evidence
becomes GO** (B1–B4 already pass and are NOT re-judged here; only
B5/D3 is re-judged). If D3 does not pass, the verdict stays NO-GO
on B5/D3 and the failing seeds + chains are reported honestly — a
NO-GO is a result, not a failure — and NO third bound is invented
in this arm. **No default flip in this arm** (the PROFILEGATE4
flip is a separate decision after the re-judge lands).

## Instrument (new -d3refreeze2-b files; the -d3refreeze-b and -confirm-b files untouched)

- **Drift check:**
  `scripts/profilegate4-d3refreeze2-b-drift-check.js` — a copy of
  `scripts/profilegate4-d3refreeze-b-drift-check.js` with ONLY
  `firstLeverDay` changed: first needWave>=4 dawnbidScore row on
  the ON leg, any part (via `row.plan.needWave`; fallback first
  companion2 depart; null handled as the old check handles null).
  Header updated to name the re-freeze; the fingerprint function
  and verdict rule are byte-identical.
- **Proof test:** `scripts/test-d3refreeze2-b.js` — proves the bound
  change and the re-run before any judged leg: (a) the OLD
  (pool-row) bound computes 97 for 106759 and 64 for 106764 while
  the CORRECTED (dawnbidScore) bound computes 95 and 55; (b) the
  pool-row check flags 106759/106764 DRIFT and the corrected check
  calls them CLEAN; (c) the corrected per-seed bound table matches
  the frozen table above (all 16 seeds, read from the committed
  corpora); (d) the verdict logic on synthetic corpora (CLEAN /
  DRIFT / IDENTICAL / null-bound + divergence / companion2-depart
  fallback); (e) the drift check is a copy of the d3refreeze check
  with ONLY `firstLeverDay` changed (diff, ignoring the header
  comment); (f) the corpora dirs are unmodified in git status
  (read-only); (g) no `src/` change in this arm (git diff vs base
  empty for `src/`).
- **D3 re-run output (new files):**
  `evidence/2026-11-21/d3refreeze2-b-drift.log` (the corrected
  check's stdout, teed) and
  `evidence/2026-11-21/d3refreeze2-b-drift-oldbound.log` (the
  landed d3refreeze check re-run as a control — it must reproduce
  the d3refreeze arm's D3: 14/16 CLEAN + 106759/106764 DRIFT —
  proving the re-run reads the same corpora). A second control,
  the confirm (world-tick) check, is also re-run to
  `evidence/2026-11-21/d3refreeze2-b-drift-worldtick.log` and must
  reproduce 15/16 CLEAN + 106751 DRIFT.

## Run procedure (frozen — execute verbatim)

1. Write this prereg FIRST; freeze before any judged leg. (Done —
   this file, ~20:53 UTC, before the D3 re-run.)
2. Build the instrument (drift check + proof test copies per
   §Instrument). No `src/` change, ever, in any commit.
3. Proof test GREEN before the judged D3 re-run:
   `node scripts/test-d3refreeze2-b.js`. Expected: all pass. If
   anything fails, STOP and report, do not proceed to the judged
   re-run.
4. Judged D3 re-run (pure re-analysis, no sims), telemetry to the
   new log files:
   `node scripts/profilegate4-d3refreeze2-b-drift-check.js
   evidence/2026-11-21/perseed-profilegate4-confirm-b-off
   evidence/2026-11-21/perseed-profilegate4-confirm-b-on | tee
   evidence/2026-11-21/d3refreeze2-b-drift.log`
   and the pool-row control:
   `node scripts/profilegate4-d3refreeze-b-drift-check.js <same dirs>
   | tee evidence/2026-11-21/d3refreeze2-b-drift-oldbound.log`
   and the world-tick control:
   `node scripts/profilegate4-confirm-b-drift-check.js <same dirs>
   | tee evidence/2026-11-21/d3refreeze2-b-drift-worldtick.log`
5. Verify the corpora are untouched (`git status --short --
   evidence/2026-11-21/perseed-profilegate4-confirm-b-off
   evidence/2026-11-21/perseed-profilegate4-confirm-b-on` empty).
6. Write the evidence note (`evidence/2026-11-21/sim-d3refreeze2-b.md`):
   the D3 result per seed, the verdict (GO iff D3 passes under the
   corrected bound), the 106759/106764 chains read as
   sense-testing, a metric-review section (§14), and the wall
   numbers for this corpus (carried from the confirm analysis —
   same corpora, no new sims).
7. Update sim-findings.md #2639 (in the goal hidden_files dir,
   outside the repo): mark fixed with the evidence link if D3
   passes; otherwise record honestly why it still fails. Do NOT
   touch the tracker — the coordinator updates it.
8. Commit ONLY via this worktree's OWN
   `scripts/safe-commit.sh`; verify each commit by blob hash;
   repair index clobber if it strikes (see the arm brief). Do NOT
   push, do NOT bump versions, do NOT verify live, do NOT rebase.

## Substrate (frozen — identical to the confirm arm, carried exactly)

Policy competent verbatim, sha256 `1884c8852d38`; env flags on both
legs `SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FIGHTALLY2=1
ALLYSLOT3=1 LAUNCHSURVIVE=1` (ALLYSLOT3 inert on this base, as the
confirm prereg records); legs differ ONLY by `PROFILEGATE4` (off
leg: unset; on leg: `1`); anchor base `df4867134`
(`df4867134afaf556232c4a7c377a4595b644a55c`); horizon 150d
death-aware. **ZERO `src/js` changes in this arm.**

## Wall numbers (reported every run — carried from the confirm analysis, same corpora)

Wins 0, national by scaleRank ≥ 2: 0, national by standing ≥ 200:
5/16 ON (6/16 OFF), table seats 0, wave-4 unlocked 16/16, wave-5
unlocked 5/16 ON (6/16 OFF), median survival 151d ON (150.5d OFF),
total deaths 1293 ON (1254 OFF), starvation deaths 11 ON (10 OFF),
standing-199 stall ×9 ON (×8 OFF). Source: the confirm evidence
§3.4 (analyzer-computed from these same corpora); recomputed here
only as a carry-over, not re-derived from new sims.

## Seed-band freshness

No new sims in this arm, so no new band is assigned. The band
106751–106766 is RE-USED deliberately: it is the confirm arm's
band, and this arm re-analyzes the confirm arm's committed
corpora (`perseed-profilegate4-confirm-b-off/` and
`-on/`), not fresh sims. Per
`~/workspace/custom-skills/local_seed_band_freshness/SKILL.md`, a
named band is treated as used — and here the use is the
re-analysis itself, authorized by the arm brief and by the
d3refreeze prereg, which named the same reuse. No fresh-band
search is required for a re-analysis; the reuse is recorded here
so a later reader does not mistake it for a fresh band.

## Sense-testing (SENSE-TESTING LAW)

Read transcripts. Re-read the 106759 (day 95 part-3 scoring →
day-96 divergence) and 106764 (day 55 part-3 scoring → day-56
launch → divergence) chains and judge whether they read as people
choosing to go. Quote real `vetSays` lines and real
dawnbidScore/pool rows. Judge meaning, coherence, consequences —
never just counts. The evidence carries a "metric review" section.

## Instrument limitations (pre-registered, not hidden)

1. **The dawnbidScore bound observes scorings, not the plan's
   planting.** A needWave>=4 plan is planted (by agency-flee,
   agency-evade, or a world-tick seed) before its first scored
   dawn. The bound is conservative for the GATE's action — the
   gate can only act at a scoring — but a plan planted days
   earlier is not itself a lever action, and the fingerprint only
   diverges when the gate changes a walk-out. The bound is the
   earliest the gate could act, not the earliest the plan
   existed.
2. **The fallback observes the launch, not the scoring.** The
   companion2-depart fallback (kept from d3refreeze) resolves a
   bound only when no needWave>=4 dawnbidScore row exists; it
   fires on the depart day, which is later than the first
   scoring. On these corpora it never fires (every null-bound
   seed has no divergence), so it changes no verdict here.
3. **D3 is a pure re-analysis.** It judges drift on committed
   corpora; it cannot detect any substrate difference the
   recorder never captured. D1/D2 for these corpora stand as the
   confirm arm measured them (D2 full-band 0 divergences).
4. **Balanced panel §15: N/A for a re-judge arm — no
   before/after.** This arm changes zero `src/` lines and runs
   zero new sims, so there is no new game-code before/after pair
   for `scripts/balance-panel.js` to compare. The §15 function
   is served by the confirm arm's panel
   (`profilegate4-confirm-b-panel.{json,md}`, `review_required`
   on deaths/100d), which this arm carries, not rebuilds.
5. **Telemetry check:** the corpora are recorder corpora; the
   telemetry script refuses them by design. The wall numbers
   above are the confirm analyzer's, carried over — no LOUD
   line is asserted from a fresh telemetry run.
6. **Write flap:** intermittent EPERM on fresh-file writes is
   ACTIVE at run start (registry writes EPERM ~20:33Z). Probe
   before writing (`git update-ref refs/heads/probe HEAD` —
   PROBE_OK at ~20:53Z); writes are verified by size/readback;
   a blocked final commit leaves files on disk intact for
   coordinator adoption, never forced.

## Files

- Prereg: `evidence/2026-11-21/sim-d3refreeze2-b-prereg.md` (this file)
- Instrument: `scripts/profilegate4-d3refreeze2-b-drift-check.js`,
  `scripts/test-d3refreeze2-b.js`
- D3 re-run outputs (new):
  `evidence/2026-11-21/d3refreeze2-b-drift.log`,
  `evidence/2026-11-21/d3refreeze2-b-drift-oldbound.log`,
  `evidence/2026-11-21/d3refreeze2-b-drift-worldtick.log`
- Corpora (preserved, read-only):
  `evidence/2026-11-21/perseed-profilegate4-confirm-b-off/` (16 files),
  `evidence/2026-11-21/perseed-profilegate4-confirm-b-on/` (16 files)
- Confirm analysis (comparison):
  `evidence/2026-11-21/profilegate4-confirm-b-analysis.json`
- Evidence: `evidence/2026-11-21/sim-d3refreeze2-b.md`
- `src/` diff: 0 lines (re-analysis only; no game-code change).
