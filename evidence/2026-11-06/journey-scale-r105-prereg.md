# journey-scale r105 — PRE-REGISTER (lane A, leg 3 SCALE, days 80–140 + tail)

**Run id:** laneA-scale-2026-11-06T1900Z (scheduled 12:45 CST 2026-11-06).
Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success only
(a pilot-gate stop is not success; rotation stays 3).
**Base:** master@5ba7f167f at first scored seed (worktree created on
master@8a975ad45, rebased onto 5ba7f167f before any seed ran — the
bond-initiation branch landed mid-setup, 15 commits; no overlap with
the r104 driver/analyzer/policies this run clones; prereg base line
amended before the prereg commit).
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price,
nor gate change in this run.
**Perception law (2026-10-28) stands** — all instruments read-only
except the FILL_ARM policy variant (presses only the offered
fillWater verb at Haven, a menu item a player can press) and the
TEND_PEER arm (the offered tendLink verb, as r103/r104); pickers
press offered menu items only.
**DELIVER OVER MEASURE (2026-11-01):** this run tests the lever r104
named — the fill-placement question it reopened — it does not
re-prove r104's diagnostic.

## Standing context (read before scoring)
- r104 (95701–95704, TEND_PEER=1, no fill arm) REOPENED the
  fill-placement question: **3 dry walk-outs on 95704**, all RETRY
  trips to the same village (village_spl_27_26314), days 61, 63, 68:
  packW 0→0, cistern 0/0, refusals "cistern-dry" ×3–4 each. The
  morntrace shows the deeper shape: packW stayed 0 for days 50–60
  while the cistern still held water (33L → 4L) — the scholar walked
  out dry while water sat in the cistern, and only on day 61 was
  there nothing left to fill with. The fill-placement question is
  exactly this: the pack is never filled before the walk-out.
- r102's narrowed fill arm exists (policy
  scripts/policies/scalecourt-nogate-morntrace3-fillnarrow.js):
  topUpBeforeWalk fills to 3L after competent.daily and before
  courtship walks, gated on walk-imminent (dist > 2) AND water-needed
  (< 3L), with skip counters proving the narrowing (fillSkipStudy=14,
  0 study-day unloads). Its r102 verdict was INSUFFICIENT-DATA: the
  control had dry 0, so the arm's 0 dry carried no evidence. r104 now
  proves the phenomenon CAN occur on this base — so a matched
  arm-vs-control on a fresh band can judge the arm.
- Diff-verified this run: fillnarrow = morntrace3 + topUpBeforeWalk
  (+ its call) + one display-only `|| it.name` in packTop ids. The
  only behavior delta is the fill arm.
- r102's footprint warning stands as the bound: the narrowed arm's
  fills diverged 85501 by 23 days (died d127 vs control d150) — a
  1L fill costs a tick, a cistern liter, and a kilogram of pack room.
  This run judges the arm on BOTH halves: dry elimination AND
  survival footprint.
- TEND_PEER stays ON in both quads (r104 continuity): the tend
  question narrows to cadence/gate (r104 metric review item b) and is
  carried report-only here, not re-judged.
- V-INIT-BOND context CHANGED this run: villager-initiated bonds
  LANDED 2026-11-06 (merged 5ba7f167f, rides the next ship) —
  villagers propose bonds (warmth 15–49, at visits / daily pair
  tick / talk requests) and raise village-link ideas; targets decide
  by character (5–95%). This panel runs ON that base, so any
  NPC-initiated bond proposal in the sittings is the live system,
  not the old blank. The carried V-INIT-BOND count is reported, not
  judged.
- Scale leg verdicts carried: REACHABLE partly (regional 3/4,
  national 0/4), FUN yes, WINNABLE not yet (no national, no global,
  no full seat on any seed in r102–r104).
- Canon (read): docs/CANON.md, docs/SCALE.md. Seasoned = 30+ days
  old AND trust 40+ (conquered: the season, not the trust; MERCY
  grace counts while mercyUntil holds). National stages only when the
  rung is ready (networkLiveDay + 30) AND one shape qualifies AND it
  is not deferred past today; shape priority lead → belong →
  covenant → trade.

## Freshness (seed-band skill, full scope — all dated preregs + all
## dated .md + evidence filenames + forbidden-band lists)
Band **95901–95904** verified fresh BEFORE any seed runs, via
`git grep` word-boundary over `*.md` + `scripts/*` + `docs/*`
(tracked files).
- 95901–95904: **0 hits each** (word-boundary, all of *.md +
  scripts/* + docs/*). Smoke seed 95900: 0 hits. Filename hits for
  9590*: none.
- The only "9590" substring hit anywhere is inside a JSON data blob
  in evidence/2026-11-06/sim-hold-b-prereg.md (a numeric value
  inside meal-row data, not a seed name) — same class as r104's
  hash-fragment exemption; the exact-seed greps
  (95901|95902|95903|95904) in that file return nothing.
- Absent from the forbidden/contaminated lists named in the r104
  prereg (99001–99008, 99009–99024, 99041–99052, 99101,
  99201–99216, 99217–99232, 99401–99412, 99601–99612, 99701–99708,
  99801–99808, 98701–98716, 89701–89707, 83601–83800,
  16101–16116, 99901–99912).
- Rejected neighbours, each with its source:
  - 95701–95704: r104 scale (2026-11-06).
  - 95501–95504: 95504 in a 2026-11-02 prereg scan band.
  - 95301–95304: dated-.md hits (r104 prereg).
  - 95101–95104: sim-cookbulk-confirm-b used 95101–95116.
  - 93701–93704, 93901–93904, 94301–94504: dated-.md hits (r104 prereg).

## Tooling (driver + analyzer clones; zero src/js)
- **Driver:** scripts/journey-scale-r105-20261106.js = r104 driver,
  labels/seeds/EVIDIR only (95901–95904, DAYCAP 180, CONVO_DAYS
  [90, 120], policy scalecourt-nogate-morntrace3 UNCHANGED,
  natGateWatch instrument UNCHANGED) PLUS one env switch:
  **FILL_ARM=1** selects the r102 fillnarrow policy variant
  (scalecourt-nogate-morntrace3-fillnarrow); unset selects the r104
  control policy. Both quads run with **TEND_PEER=1** (the r103
  driver's own env-gated arm; no code change to the arm).
- **Analyzer:** scripts/analyze-journey-scale-r105-20261106.js =
  r104 analyzer, labels only (PREFIX default journey-scale-r105,
  seeds 95901–95904), nat-gate + walk-out sections UNCHANGED.
  **Fixes the r104 analyzer defect:** the default EVIDIR is the
  current 2026-11-06 path, not the stale 2026-11-05 one.
- **Proof test:** scripts/test-journey-scale-r105-natgate-20261106.js
  = r104 proof test, labels only (31 checks on classifyNatGate /
  summarizeNatGate) PLUS FILL_ARM switch checks (driver selects the
  fillnarrow policy when FILL_ARM=1 and the control policy otherwise;
  fillnarrow exports topUpBeforeWalk, control does not). Must be
  green before any scored seed runs. Not on the green list (same
  precedent as the r102/r103/r104 proof tests — do not add it).
  Driver emission of fillTopUps counts is proved by the arm quad's
  first seed (counter present in output, arm path exercised),
  reported in the run note.
- **Quads:** control EVIDIR evidence/2026-11-06/journey-scale-r105
  (PREFIX journey-scale-r105); arm EVIDIR
  evidence/2026-11-06/journey-scale-r105-arm (PREFIX
  journey-scale-r105-arm). Same seeds, same driver, same
  TEND_PEER=1; only FILL_ARM differs.

## Q1 — FILL ARM vs MATCHED CONTROL (primary, binding)
**Question:** on a fresh band where the dry-walk-out phenomenon is
known to occur, does the r102 narrowed fill arm eliminate dry
walk-outs, and at what survival footprint?
**Verdict (per-seed matched survival = end day of each quad's run
for that seed):**
- **PASS** — control dry ≥ 1 AND arm dry 0 AND every arm seed
  survives within 10 days of its matched control (arm end day ≥
  control end day − 10, per seed). The placement is vindicated: dry
  walk-outs gone without repeating r102's 23-day footprint.
- **PARTIAL** — arm dry < control dry (a reduction, not an
  elimination) with the footprint bound met, OR arm dry 0 but one
  seed costs > 10 days (footprint breach — name the seed and days).
  The note names which half held.
- **NO-GO** — arm dry ≥ control dry, OR the arm never fires
  (fillTopUps 0 on all seeds) while control dry ≥ 1. The block is
  placement-side (fills land on the wrong days) or gate-side (the
  narrowed gate never opens on this band).
- **INSUFFICIENT-DATA** — control dry 0 (phenomenon absent again,
  as r100/r102). The arm's 0 dry carries no evidence; reported
  exactly as the r102 prereg's arm requires. NOT a pass.
**What would count as interesting:** (a) arm eliminates dry
walk-outs within footprint — the r102 divergence was seed-specific
and the pre-court narrowed placement stands; (b) arm eliminates dry
but costs a village ≥ 20 days — the footprint IS the finding and
placement still costs; (c) control dry 0 again — the phenomenon is
base-fragile and r104's 95704 was seed-specific; (d) arm fires but
dry walk-outs persist — fills land while the cistern still has
water, then the cistern runs dry before the retry days — the
retry-gate (don't walk out dry) is the real fix, not the fill.
**Pilot gate:** smoke seed 95900 × DAYCAP=45 control runs first
(proves the driver executes: pilgrimages > 0, no crash); then seed
95901 control; if either crashes or pilgrimages == 0, STOP.

## Q1b — DRAIN SEPARATOR (report-only; r104 metric-review item)
Carried from r104: the per-night burn formula stays retired; only
the separator is carried (drain separates on pack water / tile
water) from the night rows. No threshold, no verdict. If a
multi-day dry stranding reproduces (r103's 92701 watch item: 10 days
at 0 hydration one tile from Haven), name its day/seed — it would
elevate the watch item toward a design question.

## Q2 — CENSUS CONTINUITY (report-only; r93–r104 metric unchanged)
Seasoned-peer count AND scatter-day gap per seed, per quad;
national count reported alongside, not the judge. Rank transitions,
courtNational answers, seat/arc/tableWaiting as before. tendPeer /
tended counts reported per seed, per quad (the tend cadence/gate
question is carried, not judged). No threshold, no verdict.

## Q3 — PEOPLE CHECK (sense law; corpus rule as r96–r104)
One full sitting read in full from a surviving seed at day 90 if one
exists, else day 120; no day substitution if none survives to either.
Corpus size is reported, not padded. Verdict: real vs
filler/faked-history, with quoted lines. Read from the CONTROL quad
(the standing policy's conversations); the arm quad's transcripts
are read only if the control has no surviving sitting.

## Q4 — WATER CONTROL (report-only; phenomenon-absence check)
Walk-out dry/partial/wet counts per quad, as r99/r100/r102/r103/r104,
on the fresh band. These counts ARE Q1's instrument; Q4 reports
them alongside the FIRST-vs-RETRY split and the cistern trace on dry
days. No separate threshold — the Q1 verdict consumes them.

## Fix gate (clause (a) discipline, as r96–r104)
A src/ change lands only if this run's trace identifies a concrete
mechanism AND the fix is a policy-instrument-proven or shipped-study
mechanic change — a trace alone does not meet the gate. This run's
only behavior change is the FILL_ARM env flag on the existing policy
variant (a policy choice, not a src change): if Q1 PASSES, the
standing policy is NOT changed here — the default-fill question goes
to the next run with its own prereg (and, if it touches the standing
policy, to Steve's call). No src/js change is expected from this run.

## What this run does NOT do
- Does not test a fill inside courtship's own walk step or a
  retry-gate (don't-walk-out-dry) — those are the Q1(d) follow-ups,
  not this run.
- Does not test the BELONG road (belong=- on all r104 rows; a
  belong-seeking policy arm is a separate question, not this run).
- Does not build the NPC bond-proposer system (V-INIT-BOND — a
  builder brief, not a tweak; build-bond-initiate owns it in another
  worktree).
- Does not change succession release, seed priority, the
  question-first-openings design question, win prices, deed gates, or
  any balance number.
- Does not re-judge villager goals, standing trace, betrayal sittings,
  beast-trick teaching, or the standing/scale two-rulers finding.
  Those are carried as context only.

## Metric review (required section in the run note)
No pre-registered metric is re-scored mid-run. If a metric proves
wrong, it is written here and the revision proposed for the NEXT run.
