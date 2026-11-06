# journey-scale r103 — PRE-REGISTER (lane A, leg 3 SCALE, days 80–140 + tail)

**Run id:** laneA-scale-2026-11-06T0715Z (scheduled 00:45 CST 2026-11-06).
Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success only
(a pilot-gate stop is not success; rotation stays 3).
**Base:** master@fc7608ba3 at worktree creation.
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price,
nor gate change in this run.
**Perception law (2026-10-28) stands** — all instruments read-only;
pickers press offered menu items only.
**DELIVER OVER MEASURE (2026-11-01):** this run does NOT re-prove
r100's or r102's water verdicts. It does NOT test a new fill placement:
the phenomenon a placement would eliminate (dry walk-outs) is absent
on this base — two consecutive same-base controls at 0 dry (r100,
r102) — so any placement test would land INSUFFICIENT-DATA a third
time. The r102 metric-review fill-placement question is DEFERRED until
the phenomenon reappears on some base, not answered here. This run
pivots the scale leg to its live question: the national-staging block.

## Standing context (read before scoring)
- r102 (2026-11-05, matched band 85501–85504, base e39227114):
  control dry walk-outs 0/10, arm dry 0/9 — INSUFFICIENT-DATA, second
  run running. Resets 0 both quads. National staged 0/4 both quads;
  courtNational answers 0/4. Census: 85504 banked 3 seasoned peers
  (lead 45/48d; covenants 59/32d, 54/31d) yet no national beat staged
  — the peers are MIXED across shapes (1 lead + 2 covenant), no single
  shape reaching 3. That mixed-shape reading is a hypothesis from the
  end-of-run census, not an instrumented fact: the census counts peers
  at the end, not per-shape seasoned counts over time, and never
  checks the rung gate or the defer table. This run instruments exactly
  that.
- Scale leg verdicts carried: REACHABLE partly (regional 3/4, national
  0/4), FUN yes, WINNABLE not yet (no national, no global, no full
  seat on any seed in either r102 quad).
- Canon (read): docs/CANON.md, docs/SCALE.md. Staging gates, from
  hierarchy.js `_checkNational` + `polityOf` / `_belongPolity` /
  `_covenantPolity` / `_tradePolity` (verified against the code this
  run, not paraphrased): the beat stages only when (a) NOT
  nationalLive, NOT pendingNational, NOT scaleRefused, scholar NOT
  exiled; (b) networkLive AND (day − networkLiveDay) ≥ 30 (one rung
  per season); (c) one of four polity candidates exists and is not
  deferred past today — LEAD (Haven primary of ≥3 seasoned subs),
  BELONG (Haven subordinate in good standing to a primary whose realm
  holds ≥4), COVENANT (≥3 seasoned covenant links), TRADE (≥3 seasoned
  trade links); shape priority lead → belong → covenant → trade.
  Seasoned = 30+ days old AND trust 40+ (conquered links: the season,
  not the trust; MERCY-grace links count while mercyUntil holds).

## Freshness (seed-band skill, full scope — all dated preregs + all
## dated .md + evidence filenames + forbidden-band lists)
Band **92701–92704** verified fresh BEFORE any seed runs. Word-boundary
.md mentions of 92701–92704 across evidence/ + scripts/ + docs/: 0.
Filename hits for 9270*: only `s9270` corpora (seed 9270, a different
4-digit seed — same precedent as r107's `s9260`). The one prereg naming
"927" (`sim-creekpath-armc-b-prereg.md`) is commit hash `927de35c2`.
Other 927xx hits are commit-hash fragments and kcal values. Absent from
the tendbelow forbidden list (99001–99008, 99009–99024 contaminated,
99041–99052, 99101, 99201–99216, 99217–99232, 99401–99412, 99601–99612,
99701–99708, 99801–99808, 98701–98716, 89701–89707, 83601–83800,
16101–16116, 99901–99912). Smoke seed 92700 cleared the same way
(0 word-boundary .md hits, no s92700 filenames).

## Tooling (driver + analyzer clones; zero src/js)
- **Driver:** scripts/journey-scale-r103-20261106.js = r99 driver,
  labels/seeds/EVIDIR only (92701–92704, DAYCAP 180, CONVO_DAYS
  [90, 120], policy scalecourt-nogate-morntrace3 UNCHANGED), PLUS one
  read-only daily instrument (`natGateWatch`): per day — scaleRank,
  nationalLive/globalLive, networkLive/networkLiveDay, rung-ready,
  exiled, scaleRefused, pendingNational shape/day, per-shape active
  and seasoned counts (lead/covenant/trade, seasoned by the canon
  rule incl. conquered-season-only and mercy grace), best belong
  candidate (trust/arrears/age + primary realm size), largest foreign
  polity size, `_natDefer` table, viewership. No engine input is
  touched; every field is a read (polityOf / foreignPolities /
  hierarchyState are the engine's own read APIs).
- **Analyzer:** scripts/analyze-journey-scale-r103-20261106.js =
  r102 analyzer, labels only (PREFIX default journey-scale-r103,
  seeds 92701–92704), PLUS a nat-gate section: `classifyNatGate(row)`
  (exported, `require.main` guard) names the blocking gate per day —
  STAGED / PENDING / REFUSED / EXILED / RUNG / NO-SHAPE / DEFERRED /
  STAGE-EXPECTED — and the run note reports days-in-each-gate per seed
  plus the closest shape at the final blocking day.
- **Proof test:** scripts/test-journey-scale-r103-natgate-20261106.js
  — unit checks for `classifyNatGate` on synthetic rows covering every
  gate state, plus row-shape validation (seasoned ≤ active, counts ≥ 0,
  rung math). Must be green before any scored seed runs. Not on the
  green list (same precedent as the r102/r105/r106/r107 proof tests —
  do not add it). Driver emission of natGate rows is proved by the
  smoke run (rows present, fields sane), reported in the run note.

## Q1 — NATIONAL-STAGING BLOCK (primary, diagnostic, binding)
**Question:** on fresh seeds, which gate blocks the national beat, and
for how long? For each seed: days spent in each gate state (RUNG /
NO-SHAPE / DEFERRED / REFUSED / EXILED / PENDING / STAGED), the
closest shape at the last blocking day (per-shape seasoned counts vs
the 3 bar), and the first day any shape qualifies (if ever).
**Verdict (diagnostic, not pass/fail on the game):** the run NAMES the
dominant blocking gate per seed. No threshold — this is a mechanism
trace, and the note must say so.
**What would count as interesting:** (a) a seed reaching
STAGE-EXPECTED (candidate + rung ready + not deferred, yet no beat
stages) — a staging defect, named as such; (b) NO-SHAPE persisting
with one shape stuck at 2/3 seasoned while peers exist in other
shapes — the r102 mixed-shape hypothesis confirmed as the mechanism;
(c) RUNG dominating late (regional rung never matures because the
village dies first or networkLive arrives too late) — a pacing fact.
**Pilot gate:** smoke seed 92700 × DAYCAP=45 runs first (proves the
driver + natGate emission); then seed 92701; if either crashes or
pilgrimages == 0, STOP.

## Q1b — DRAIN RESIDUAL (report-only; r102 metric-review item)
r102's Q1c left a 4-night base residual (drain 14 vs pred ~0, drank
1, identical in both quads). If outside-±10 non-cap nights reproduce
on fresh seeds, name the mechanism from the night rows (packW, tile,
hyd, drank, position); if they do not reproduce, the per-night formula
is dropped per the r102 metric review and only the separator check is
carried. No threshold, no verdict.

## Q2 — CENSUS CONTINUITY (report-only; r93–r102 metric unchanged)
Seasoned-peer count AND scatter-day gap per seed; national count
reported alongside, not the judge. Rank transitions, courtNational
answers, seat/arc/tableWaiting as before. No threshold, no verdict.

## Q3 — PEOPLE CHECK (sense law; corpus rule as r96–r102)
One full sitting read in full from a surviving seed at day 90 if one
exists, else day 120; no day substitution if none survives to either.
Corpus size is reported, not padded. Verdict: real vs
filler/faked-history, with quoted lines.

## Q4 — WATER CONTROL (report-only; phenomenon-absence check)
Walk-out dry/partial/wet counts as r99/r100/r102, on the fresh band.
Expectation: dry 0 (phenomenon absent on this base). Any dry walk-out
is named with its day and the refusal lines — it would reopen the
fill-placement question the prereg defers. Not a verdict.

## Fix gate (clause (a) discipline, as r96–r102)
A src/ change lands only if this run's trace identifies a concrete
mechanism AND the fix is a policy-instrument-proven or shipped-study
mechanic change — a trace alone does not meet the gate. This run's
instrument is read-only: if Q1 names a mechanism, the fix is proposed
for the next run with its own prereg. No src/js change is expected
from this run.

## What this run does NOT do
- Does not test a fill placement or re-judge the water verdicts
  (r100/r102 stand: phenomenon absent on this base).
- Does not build the NPC bond-proposer system (V-INIT-BOND — a builder
  brief, not a tweak; build-bond-initiate owns it in another worktree).
- Does not change succession release, seed priority, the
  question-first-openings design question, win prices, deed gates, or
  any balance number.
- Does not re-judge villager goals, standing trace, betrayal sittings,
  beast-trick teaching, or the standing/scale two-rulers finding.
  Those are carried as context only.

## Metric review (required section in the run note)
No pre-registered metric is re-scored mid-run. If a metric proves
wrong, it is written here and the revision proposed for the NEXT run.
