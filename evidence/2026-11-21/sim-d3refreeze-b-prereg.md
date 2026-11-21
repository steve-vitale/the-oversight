# sim-d3refreeze-b — PREREG, the D3 re-freeze + re-judge (frozen before any judged leg)

**Arm:** sim-d3refreeze-b, re-freeze + re-judge of the profilegate-confirm
B5/D3 clause · **Loop B run:** fleshout-loop-b-20261121T1630Z (axis:
winnability chain) · **Branch:** `sim-d3refreeze-b` · **Worktree:**
`~/workspace/worktrees/sim-d3refreeze-b`
**Base at arm start:** worktree HEAD `c7be183e0`. Do NOT rebase; the
coordinator rebases at landing.
**Frozen:** 2026-11-21 ~18:01 UTC, BEFORE any judged leg (the D3 re-run
is the judged leg; everything in §"Pre-freeze verification" below was
measured from the committed corpora before this freeze, read-only).
**Policy:** competent verbatim, sha256 `1884c8852d38` (12-char prefix;
inherited from the confirm arm — no new sims run, so no policy is
re-probed here).
**Band:** seeds 106751–106766 (16 seeds, the confirm arm's band —
RE-USED deliberately; this is a re-analysis of the same corpora, not a
fresh band, so the fresh-band rule does not apply).
**Horizon:** 150d death-aware (the confirm corpora's horizon).
**Corpora (READ-ONLY):**
`evidence/2026-11-21/perseed-profilegate4-confirm-b-off/` and
`evidence/2026-11-21/perseed-profilegate4-confirm-b-on/` (16 files
each, committed on master by the confirm arm). Never rewrite them;
analyzer outputs go to NEW files in this worktree.

## The question (the 1530Z round record's next blank #1)

The profilegate-confirm arm
(`evidence/2026-11-21/sim-profilegate-confirm-b.md`, 16 fresh seeds
106751–106766) passed bars B1–B4 but failed B5 on D3 alone: seed
106751 diverges day 75 vs the frozen first-lever-day (first
world-tick v4 seed row) day 111. The 1530Z round record proves the
bound non-conservative on a closed causal chain and authorizes this
re-judge as the next run's blank (1). Finding #2639 in the goal
`hidden_files/sim-findings.md` records it. This arm re-freezes the
bound, re-runs D3 on THESE corpora — no new sims — and re-judges B5.

## The one authorized change

`firstLeverDay` in the D3 drift check: **first world-tick v4 seed row
on the ON leg → first needWave>=4 pool row on the ON leg.** The
fallback (when no needWave>=4 pool row exists) is unchanged in shape:
the old fallback (first depart row carrying a non-null companion2)
is RETAINED only as the last resort; a seed with no needWave>=4 pool
row and no divergence is IDENTICAL, and a seed with no needWave>=4
pool row that DOES diverge is DRIFT (leverDay null, same as the old
check's null handling). The world-tick fallback is REMOVED — it was
the defective bound.

The corrected bound's justification, as frozen in the confirm
evidence §9: the gate cannot act before a needWave>=4 plan exists,
and the first needWave>=4 pool row is the first scored dawn for a
needWave>=4 holder the recorder observes. For seed 106751 the
corrected bound computes **day 74** (first needWave>=4 pool row: 3
eligible foragers, bid luis_fernandez) vs the old bound's **day 111**
(first world-tick v4 seed row). The divergence (day 75) is on or
after the corrected bound, so the seed is CLEAN under it.

No other change vs the landed `-confirm-b` drift check. The
fingerprint function, the verdict rule (firstDiv >= leverDay →
CLEAN), the corpora, the bars B1–B4, and the re-judgment rule below
are untouched. Do NOT modify the landed `-confirm-b` instrument
files (new `-d3refreeze-b` copies instead). Do NOT touch `src/js`
at all. Do NOT touch Loop A's trees/branches or the sibling arms'
trees.

**Post-hoc amendment is forbidden.** The bound above is frozen in
this prereg and in the refreeze drift check. It may not be amended
after the judged D3 re-run to match whatever the re-run reports. If
D3 fails under this bound, the verdict is NO-GO and the failure is
reported, never re-scored.

## Pre-freeze verification (measured from the committed corpora before freezing — read-only)

The band-wide bound table below was computed from the committed ON
corpora before this freeze (first needWave>=4 pool row, first
needWave>=4 dawnbidScore, first world-tick v4 seed row, first
divergence day — same fingerprint as the drift check). It is recorded
here so the frozen bound's expected D3 outcome is on the record
BEFORE the judged re-run, in the same spirit as the poolfirstfail
prereg's "verified before freezing" sections. The judged re-run must
still actually run and produce its own table; this section is the
prediction, not the verdict.

| Seed | First pool row (needWave≥4) | First dawnbidScore (needWave≥4) | Old bound (world-tick) | First divergence | D3 under frozen pool-row bound |
| --- | --- | --- | --- | --- | --- |
| 106751 | 74 | 68 | 111 | 75 | CLEAN (75 ≥ 74) |
| 106752 | 62 | 62 | 26 | 69 | CLEAN |
| 106753 | 44 | 44 | 43 | 47 | CLEAN |
| 106754 | 63 | 63 | 62 | 67 | CLEAN |
| 106755 | 87 | 87 | 33 | 88 | CLEAN |
| 106756 | null | null | 28 | null | IDENTICAL |
| 106757 | 103 | 100 | 29 | 104 | CLEAN |
| 106758 | null | null | 34 | null | IDENTICAL |
| 106759 | 97 | 95 | 95 | 96 | **DRIFT (96 < 97)** |
| 106760 | null | null | 35 | null | IDENTICAL |
| 106761 | 148 | 144 | 33 | null | IDENTICAL |
| 106762 | null | null | 53 | null | IDENTICAL |
| 106763 | 55 | 55 | 38 | null | IDENTICAL |
| 106764 | 64 | 55 | 55 | 56 | **DRIFT (56 < 64)** |
| 106765 | null → fallback 94 | 92 | 44 | 95 | CLEAN (bound 94 via companion2 depart, 95 ≥ 94) |
| 106766 | null | null | 41 | null | IDENTICAL |

**Expected D3 under the frozen bound: 14/16 CLEAN/IDENTICAL + 2
DRIFT (106759, 106764).** The two expected flags were each
verified by hand from the corpora before freezing, and each is a
false positive of the SAME class as 106751's: the lever acted at a
mid-day scoring (part 1–3), which the part-0-only pool rows never
observe. The chains:

- **106759** — ON day 95 part 3: holder app_mgpsphmr523 (needWave 4,
  target influencer) scores `party_launch` with companion
  rosa_mendez (**forager** — excluded by the OLD gate, so the scoped
  gate acted); OFF day 95 part 3, same holder, same plan: no
  party_launch candidate, pick `party_wait`. Divergence day 96
  (kill log: OFF two extra wave-3 kills, ON two wave-2 instead;
  v3 4 → 2). First pool row day 97 — two days AFTER the lever acted.
- **106764** (the confirm arm's own gate-act fixture seed) — ON day
  55 part 3: holder rosa_mendez (needWave 4, target influencer)
  scores `party_launch` with gen_7r67xop (**forager**); OFF day 55
  part 3: party_launch with adaeze_nwosu (the old gate's pick). ON
  day 56 part 1: rosa_mendez commits party_launch with brian_otieno
  and LAUNCHES (dawnbidDeparts seq 907, 3-person party vs the
  influencer); OFF day 56 part 1: party_wait, no launch candidate.
  Divergence day 56 (ON one extra wave-3 kill @3:ad_break, v3 5
  vs 4). First pool row day 64 — nine days AFTER the lever acted.
- **106765** — ON day 92 part 3: holder nina_petrova (needWave 4,
  target herald) scores `party_launch` with sigrun_eiriksdottir
  (**homebody**); day 94 part 2 commits party_launch with
  gen_vutzhft (**forager**) and LAUNCHES (dawnbidDeparts seq 1157,
  4-person party). OFF day 92 part 3 and day 94 part 0: party_wait
  both times, no launch. Divergence day 95 (ON extra kills, v4 1 →
  0, v3 3 → 2). The ON leg has NO needWave>=4 pool row in 150 days
  (the pool-row population is itself downstream of the lever: the
  day-94 launch changed the holder's trajectory) — but the frozen
  fallback resolves the bound anyway: the day-94 v4departs row for
  the same launch carries a non-null companion2
  (nikos_papadopoulos, targetWave 4), so firstLeverDay = 94 and the
  seed reads CLEAN (95 ≥ 94). Note the fallback bound (94) is later
  than the first lever action (day 92, the scored dawn) — the
  fallback observes the launch, not the scoring — but it still
  clears this seed because the divergence (95) follows the depart
  (94). (Correction history: the first proof run caught this —
  the pre-freeze table first recorded 106765 as DRIFT on a null
  bound; the proof's bound-table check showed the fallback fires
  at 94. The table and the expected D3 above were corrected before
  any judged leg ran.)

Cross-checks run before freezing (read-only, same corpora):
- First needWave>=4 dawnbidScore ≤ first needWave>=4 pool row on
  every seed (pool rows are the part-0 subset of scored dawns).
- Zero departs with a wave-4 target (algorithm, audit,
  congregation, eater, eulogy, herald, influencer, reunion, strike,
  suburb — the wave-4 set read from the corpora's own kill logs)
  occur before the first needWave>=4 dawnbidScore on any seed, so
  no depart-channel lever action precedes the dawnbidScore bound.
  (The earlier "early depart" hits on 106757/106763/106765 were
  wave-3 targets — chorus_line, redactor, callback — needWave-3
  plans where the scoped gate is closed by construction.)
- The two `findCompanion` call sites are both dawn-scoring paths:
  villager-brain.js:239 (dawn-bid candidate builder) and
  win-plan.js:1093 (`winPlanDepart` → `launchParty`, the legacy
  depart gate — departs are recorded in dawnbidDeparts).

**Consequence, recorded before freezing:** the pool-row bound as
frozen here is EXPECTED to fail D3 on 106759 and 106764, for the
same reason the world-tick bound failed on 106751 — the recorder
observes the gate's action only at part-0 scored dawns, while
`findCompanion` also runs at mid-day scorings (parts 1–3). (106765
is rescued by the companion2-depart fallback at day 94, not by the
pool row — see its chain above.)
The dawnbidScore bound (first needWave>=4 dawnbidScore row, any
part) is the bound the causal argument actually proves
conservative ("the gate cannot act before a scored dawn for a
needWave>=4 holder" — confirm evidence §9), and under it all 16
seeds are CLEAN/IDENTICAL (every firstDiv ≥ firstDbV4; the five
null-bound seeds have no divergence). **This prereg does NOT
freeze the dawnbidScore bound.** The 1530Z round record and this
run's brief freeze the pool-row bound; changing the frozen bound
to the dawnbidScore formulation is a coordinator decision for the
next run, exactly as the world-tick → pool-row correction was a
decision for this run. This arm runs the frozen pool-row bound
verbatim, reports its measured outcome, and proposes the
dawnbidScore bound as the next re-freeze with the three closed
chains as its evidence. No bar is re-scored mid-run; the
re-judgment rule below is applied to the measured D3 table.

## Primary metric (frozen)

D3 drift on the confirm corpora under the corrected (pool-row)
first-lever-day bound: first divergence day ≥ first-lever-day on
every seed, where first-lever-day = first needWave>=4 pool row on
the ON leg (fallback: first companion2 depart; null + divergence =
DRIFT).

## Re-judgment rule (frozen)

**If D3 passes under the corrected bound on these same corpora
(16/16 CLEAN or IDENTICAL), the confirm verdict on this evidence
becomes GO** (B1–B4 already pass and are NOT re-judged here; only
B5/D3 is re-judged). If D3 does not pass, the verdict stays NO-GO
on B5/D3 and the failing seeds + chains are reported honestly — a
NO-GO is a result, not a failure. **No default flip in this arm**
(the PROFILEGATE4 flip is a separate decision after the re-judge
lands).

## Instrument (new -d3refreeze-b files; the -confirm-b files untouched)

- **Drift check:** `scripts/profilegate4-d3refreeze-b-drift-check.js`
  — a copy of `scripts/profilegate4-confirm-b-drift-check.js` with
  ONLY `firstLeverDay` changed: first needWave>=4 pool row on the
  ON leg (fallback first companion2 depart; null handled as the old
  check handles null). Header updated to name the re-freeze; the
  fingerprint function and verdict rule are byte-identical.
- **Proof test:** `scripts/test-d3refreeze-b.js` — proves the bound
  change and the re-run before any judged leg: (a) the OLD bound
  computes day 111 for seed 106751 while the CORRECTED bound
  computes day 74; (b) the old check flags 106751 DRIFT and the
  corrected check calls it CLEAN; (c) the corrected per-seed bound
  table matches the frozen table above (all 16 seeds, read from
  the committed corpora); (d) the verdict logic on synthetic
  corpora (CLEAN / DRIFT / IDENTICAL / null-bound + divergence);
  (e) the drift check is a copy of the confirm check with ONLY
  `firstLeverDay` changed (diff, ignoring the header comment);
  (f) the corpora dirs are unmodified in git status (read-only);
  (g) no `src/` change in this arm (git diff vs base empty for
  `src/`).
- **D3 re-run output (new files):**
  `evidence/2026-11-21/d3refreeze-b-drift.log` (the corrected
  check's stdout, teed) and
  `evidence/2026-11-21/d3refreeze-b-drift-oldbound.log` (the
  landed confirm check re-run as a control — it must reproduce
  the confirm arm's D3: 15/16 CLEAN + 106751 DRIFT — proving the
  re-run reads the same corpora).

## Run procedure (frozen — execute verbatim)

1. Write this prereg FIRST; freeze before any judged leg. (Done —
   this file, ~18:01 UTC, before the D3 re-run.)
2. Build the instrument (drift check + proof test copies per
   §Instrument). No `src/` change, ever, in any commit.
3. Proof test GREEN before the judged D3 re-run:
   `node scripts/test-d3refreeze-b.js`. Expected: all pass. If
   anything fails, STOP and report, do not proceed to the judged
   re-run.
4. Judged D3 re-run (pure re-analysis, no sims), telemetry to the
   new log files:
   `node scripts/profilegate4-d3refreeze-b-drift-check.js
   evidence/2026-11-21/perseed-profilegate4-confirm-b-off
   evidence/2026-11-21/perseed-profilegate4-confirm-b-on | tee
   evidence/2026-11-21/d3refreeze-b-drift.log`
   and the old-bound control:
   `node scripts/profilegate4-confirm-b-drift-check.js <same dirs>
   | tee evidence/2026-11-21/d3refreeze-b-drift-oldbound.log`
5. Verify the corpora are untouched (`git status --short --
   evidence/2026-11-21/perseed-profilegate4-confirm-b-off
   evidence/2026-11-21/perseed-profilegate4-confirm-b-on` empty).
6. Write the evidence note (`evidence/2026-11-21/sim-d3refreeze-b.md`):
   the D3 result per seed, the verdict (GO iff D3 passes under the
   corrected bound), the 106751 day-67–75 chain read as
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

## Sense-testing (SENSE-TESTING LAW)

Read transcripts. Re-read the 106751 day-67–75 chain (day-67
agency-flee → day-68 party_launch pick → day-74 gate-open launch
→ day-75 divergence) and judge whether it reads as people
choosing to go, plus the 106759/106764/106765 chains above. Quote
real `vetSays` lines and real pool/dawnbid rows. Judge meaning,
coherence, consequences — never just counts. The evidence carries
a "metric review" section.

## Instrument limitations (pre-registered, not hidden)

1. **Pool rows are part-0-only.** The recorder writes a
   companionPool row only for a wave-4+ plan holder scored at
   dayPart 0 (driver line ~946). Mid-day scorings (parts 1–3)
   run `findCompanion` and can commit party_launch without any
   pool row — this is exactly why the pool-row bound flags
   106759/106764/106765. The dawnbidScore rows observe every
   scoring (any part) and are the complete record; the pool row
   is a subset. Recorded here before freezing, per §Pre-freeze
   verification.
2. **The pool-row population is downstream of the lever.** A
   launch changes who holds plans and who is at Haven, so the
   ON leg's pool rows are not the OFF leg's recomputed — 106765
   has zero ON pool rows while its OFF leg has fifteen. A bound
   built on the pool rows inherits that feedback.
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
6. **Write flap:** intermittent EPERM on fresh-file writes has
   struck this program repeatedly. Writes are verified by
   size/readback; a blocked final commit leaves files on disk
   intact for coordinator adoption, never forced.

## Files

- Prereg: `evidence/2026-11-21/sim-d3refreeze-b-prereg.md` (this file)
- Instrument: `scripts/profilegate4-d3refreeze-b-drift-check.js`,
  `scripts/test-d3refreeze-b.js`
- D3 re-run outputs (new):
  `evidence/2026-11-21/d3refreeze-b-drift.log`,
  `evidence/2026-11-21/d3refreeze-b-drift-oldbound.log`
- Corpora (preserved, read-only):
  `evidence/2026-11-21/perseed-profilegate4-confirm-b-off/` (16 files),
  `evidence/2026-11-21/perseed-profilegate4-confirm-b-on/` (16 files)
- Confirm analysis (comparison):
  `evidence/2026-11-21/profilegate4-confirm-b-analysis.json`
- Evidence: `evidence/2026-11-21/sim-d3refreeze-b.md`
- `src/` diff: 0 lines (re-analysis only; no game-code change).
