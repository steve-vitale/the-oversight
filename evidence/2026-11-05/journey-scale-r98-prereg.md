# journey-scale r98 — PRE-REGISTER (lane A, leg 3 SCALE, days 80–140 + tail)

**Run id:** laneA-scale-2026-11-05T00:45CST (scheduled 00:45 CST 2026-11-05).
Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success only
(a pilot-gate stop is not success; rotation stays 3).
**Base:** master@b79821db8 at lock creation (re-verify at branch creation).
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price,
nor gate change in this run.
**Perception law (2026-10-28) stands** — all instruments read-only;
pickers press offered menu items only.
**DELIVER OVER MEASURE (2026-11-01):** this run does NOT re-prove r97's
verdicts (pilgrimage reset mover = COMPETENT thirst walk; 28/28 resets;
national 0/4; people check 1 real + 1 real-with-fixed-framing). It
answers r97's single carried micro-question with the instrument r97 named.

## Standing context (read before scoring)
- r97 (2026-11-04 afternoon, seeds 85501–85504): the pilgrimage stale-restart
  loop's mover is competent.daily's thirst walk home (28/28 resets COMPETENT,
  counter-corroborated). The retry holds because the scholar arrives at the
  target night WITH water in the body. The open mechanism is the overnight
  hydration drain itself: first-attempt nights drain ~58–64 hydration at the
  target tile (85503: 72→8; 85504: 86→28, then 50→0 nightly), while retry
  nights at the SAME tile drain only ~14 (92→78; 86→72). Tile alone does not
  explain it, entry hydration alone does not explain it (both attempts walk
  out at 86–92), and this run's trace does not capture pack water,
  tent/shelter state, or tile water at sleep — so no mechanism is claimed.
- Code facts (read, not assumed — they shape the instrument, not the verdict):
  - Sleep burns one day's metabolism via `calories.resolveDay` →
    `hydrationBurn(sch, {weather, dayTicks})` = 30 + dayBurn (12 neutral,
    ×1.5 clear = 18, ×0.75 cold = 9) + floor(dayTicks/32). Minimum burn on a
    neutral day is 30+12+0 = 42. A 14-point overnight drain is therefore
    IMPOSSIBLE from the burn alone — it requires a drink during the window
    (sleep loop or morning waits) of ~+28 or more. The question is what the
    scholar drinks, and why only on retry nights.
  - `competent.upkeep` runs `drinkSafe` 3× per loop-day — including BEFORE
    each morning wait, i.e. inside the overnight window between sleep and
    daily(). drinkSafe fills a bottle when the tile offers water
    (creek/well/spring/river/pond/haven) and the pack holds < 3L, and drinks
    (+50 hydration, ctx.drank +1) when hydration < 70 AND pack water exists.
    So the overnight drink, if any, is plausibly upkeep's drinkSafe — gated
    on pack water carried into the morning, or tile water to fill from.
  - Pack water is `Game.state.scholar.water` (array of 1L entries; length =
    liters carried). Shelter is `s.insideTent`. Tile water offering is
    `Game.playerTile().type` in {creek, wetland, pond} (haven well at Haven).
- Canon (read): docs/CANON.md (no-silent-actions law), docs/SCALE.md
  (national = one primary with ≥3 seasoned subordinates, or
  BELONG/COVENANT/TRADE/CONQUEST/REFUSE roads; one rung per season).

## Tooling (new instrument only; zero src/js)
- **mornTrace2 (Q1):** policy clone
  scripts/policies/scalecourt-nogate-morntrace2.js = r97 morntrace clone
  PLUS logging-only fields in `_mornSnap` (no behavior line changed):
  `packWater` = `(s.water||[]).length`, `tileType` =
  `Game.playerTile ? (Game.playerTile()||{}).type : null`,
  `insideTent` = `!!s.insideTent`, `weather` = `Game.state.weather`,
  `dayTicks` = `s.dayTicks || 0`, `drank` = `(ctx && ctx.drank) || 0`.
  Delta rows gain `dDrank` (drank since the previous snapshot).
  Snapshots at entry / postCompetent / postCourt exactly as r97. Diff vs the
  r97 clone must contain ONLY added logging fields + the export name. The
  standing scalecourt-nogate.js, postrace clone, and r97 morntrace clone are
  untouched; this clone is this run's instrument only.
- Driver: scripts/journey-scale-r98-20261105.js = r97 driver,
  labels/seeds/EVIDIR only (85501–85504, DAYCAP 180), PLUS copying
  ctx.mornTrace daily and writing journey-scale-r98-morntrace2-<seed>.txt
  at end. The r97 postrace output is kept (same file stem, r98 label) so Q1
  can cross-check mornTrace2 against postrace eval/walk rows.
- Analyzer: scripts/analyze-journey-scale-r98-20261105.js = r97 analyzer,
  labels only, PLUS a drain classifier: for every pilgrimage night (a
  postCourt row at a target tile followed by the next entry row), compute
  drain = postCourt hyd − entry hyd; segment trips by (vid, contiguous
  days) into FIRST attempt vs RETRY (a trip to a vid after a stale drop of
  a trip to that vid); tabulate drain against packWater@postCourt,
  tileType@postCourt, insideTent@postCourt, predicted burn
  (30 + dayBurn(weather@postCourt) + floor(dayTicks@postCourt/32)),
  dDrank over the night, and packWater delta (postCourt → entry).

## Q1 — OVERNIGHT HYDRATION DRAIN (binding; closes r97's micro-question)
**Question:** on the r97 band, what makes first-attempt pilgrimage nights
drain ~58–64 hydration while retry nights at the same tile drain only ~14?
**FINDING clause (pre-registered, not re-scored):** the mechanism is
identified if EITHER (i) first-attempt vs retry nights separate cleanly on
ONE candidate — packWater@postCourt, insideTent@postCourt, or
tileType@postCourt — with ≥3 nights on each side and the separating value
matching the drain gap (e.g. packWater 0 on all first attempts and ≥1 on
all retries, with dDrank ≥ 1 on the retry nights); OR (ii) the predicted
burn alone accounts for the drain on both sides within ±10 points
(drain ≈ burn, no drink needed — this would falsify the drink hypothesis;
note the 39–42 minimum burn makes a 14-point retry drain unexplainable
this way, so (ii) can only fire if retry drains on this band are actually
≥39). If nights split across candidates, or <3 nights occur on either
side, the verdict is INCONCLUSIVE on count with the traced instances
reported as-is — no re-scoring against a friendlier threshold.
**What would count as interesting:** pack water 0 vs ≥1 separating the
two drain regimes — that names a concrete fix (competent carries/fills
water before a pilgrimage, or drinkSafe fills at the target tile). A
burn-only answer is also interesting: it would mean dayTicks/weather, not
water, sets the drain, and the retry difference is exertion, not drinking.
**Pilot gate:** seed 85503 runs first; if its mornTrace2 shows no
pilgrimage trip at all, OR the new fields (packWater, tileType,
insideTent, weather, dayTicks, drank) read null/empty on all rows,
STOP and report (instrument failure, not a game finding). A field that
never populates is a broken instrument, not a game finding.

## Q2 — CENSUS CONTINUITY (report-only; r93–r97 metric unchanged)
Seasoned-peer count AND scatter-day gap per seed; national count
reported alongside, not the judge. No threshold, no verdict.

## Q3 — PEOPLE CHECK (sense law; corpus rule as r96/r97)
One full sitting read in full from a surviving seed at day 90 if one
exists (85503/85504 pattern from r96/r97); no day substitution if none
survives to day 90. Corpus size is reported, not padded. Verdict:
real vs filler/faked-history, with quoted lines.

## Metric review (carried)
- Q1's FINDING clause is new for this run; r97's count gate (≥3 resets
  sharing a segment) is NOT reused — the question changed from "which
  mover" to "which mechanism", so the gate changed with it, stated here
  before any seed runs.
- Telemetry baseline: scripts/telemetry-check.js step 14 runs at
  closeout against telemetry-baselines/scale.json; baseline NOT
  rolled forward without a LOUD-line investigation.

## Fix gate (clause (a) discipline, as r96/r97)
A src/ change lands only if this run's trace identifies a concrete
mechanism AND the fix is a policy-instrument-proven or shipped-study
mechanic change — a trace alone does not meet the gate. Otherwise
the change set stays tooling + evidence + run note.

## Infrastructure note (this run, before any seed)
Worktree registration was BLOCKED at run start by an EPERM write flap
(first observed 2026-11-05 ~06:44 UTC, earliest artifact a sibling
`flap-mimic.lock` 06:36): git ref writes fail (`couldn't write
.../refs/heads/journey-scale.lock`), registry atomic writes fail, and
probes show O_EXCL file creation refused filesystem-wide (/tmp,
~/workspace, .git) while plain writes flap on/off minute to minute.
`git pull` state verified current (origin/master is an ancestor of local
HEAD, ahead 7 / behind 0 — the ORIG_HEAD write failure was the flap, not
divergence). ~13 failed register attempts across direct tries and retry
loops; one isolated O_EXCL success 07:08:24 (same second the two Lane A
sibling loops heartbeated — the only window in ~70 min); the flap cleared
~07:48:30 (O_EXCL 3/3) and the tree registered 07:54:59, heartbeat
07:55:07Z (verified by registry read-back). No evidence file anywhere in
the repo was written 06:30–07:48 UTC — the flap stranded every loop, and
the two Lane A siblings' heartbeats went 36+ min stale through no fault
of their own (a live run looking dead — the 2026-10-17 hazard). The
prereg is committed from the worktree BEFORE any scored seed runs,
exactly as r97 did. Probe-design bug found during the wait (own goal,
not a game finding): an O_EXCL probe that creates its file but fails the
write leaves a 0-byte file behind, so all later probes fail EEXIST and
the loop goes blind — probe files must be unlinked on every outcome or
use unique names. Lane B (journey2-social r136) was retrying the same
flap in parallel with its own tight loop.
