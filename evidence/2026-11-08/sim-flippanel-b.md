# sim-flippanel-b — real §15 panel verdict on the flip-point before/after (NO-GO)

**Arm:** sim-flippanel-b (DIAG, zero src/js) · **Run:** fleshout-loop-b-20261108T1830Z (adoption of dead 1630Z run) · **Axis:** scale-onramp / winnability chain · **Tracker blank:** (2) — "a real §15 panel verdict on the flip is still owed" (2026-11-08 1030Z review) · **Branch:** sim-flippanel-b, cut at master `6680d7924` · **Prereg:** evidence/2026-11-08/sim-flippanel-b-prereg.md (commits 27017c842 + amendment 2c1c84917) · **Proof:** scripts/test-flippanel-b.js — 25/31 PASS (all instrument legs green; the 6 failures ARE the NO-GO verdict, not tooling failures).

## Verdict: NO-GO

Judged only against the prereg's binding GO bar. The real §15 balanced panels do **not** confirm the flip between the collapsed tip `cf22937b8` and the healed tip `c9fea16ee` on the frozen band 53001–53008. Two independent GO-bar failures: (c) capable-leg median survival regressed by 1 day (90.5d vs 91.5d), and (d) death-guardrail regressions on the risk-aware policy (playerDeaths per run regression_signal, villageDeaths per run regression_watch). The capable-leg flip signature is absent entirely: sits 6/8 on both legs (paired delta 0, bar ≥ +2) and median delta −1d (bar ≥ +30d). The instruments disagree, and the evidence says which villages each instrument saw (see "Instrument disagreement" below).

## GO bar judgment (binding, prereg)

- (a) Compare returns a valid decision (not `invalid`): **PASS** — decision `review_required` (capable `review_required`, risk-aware `review_required`).
- (b) Capable leg, healed table-sitting rate ≥ collapsed: **PASS** — 6/8 vs 6/8 (0.75 vs 0.75).
- (c) Capable leg, healed median survival ≥ collapsed: **FAIL** — 90.5d vs 91.5d (−1d).
- (d) NO `regression_signal` or `regression_watch` on `villageDeaths` or `playerDeaths` in ANY policy: **FAIL** — risk-aware `playerDeaths` per run is `regression_signal` (5.375 → 6.875, +1.5/run, 95% interval 0.375 to 3, excludes 0); risk-aware `villageDeaths` per run is `regression_watch` (59.75 → 64, +4.25). Capable `playerDeaths`/`villageDeaths` per run are `no_material_signal` (2.125 → 2.0 and 59.375 → 53.5, both improved). Note: capable `playerDeaths100Days` is `regression_watch` (1.94 → 2.21) — the per-100-days variant is not one of the (d) metric ids, but it is recorded here as an investigation note; the verdict does not hinge on it.
- Vocabulary (prereg): `review_required` driven by a death-guardrail regression is NO-GO. This `review_required` is driven by the risk-aware death regressions (plus capable bearer-survival regressions, see below), not by a `won` move. **Verdict: NO-GO.**

## Panel numbers (the judged legs)

Panels: evidence/2026-11-08/panel-flippanel-b/{before,after}/panel.json.gz (16 cases each: 8 seeds × policies capable + risk-aware, 150d). Compare: evidence/2026-11-08/panel-flippanel-b/compare.json + compare.md (decision `review_required`).

| Leg × policy | Median survival | Sits | Wins | Entered | National | Player deaths | Village deaths |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Collapsed × capable | 91.5d | 6/8 | 6/8 | 6/8 | 7/8 | 17 | 475 |
| Healed × capable | 90.5d | 6/8 | 6/8 | 6/8 | 7/8 | 16 | 428 |
| Collapsed × risk-aware | 69.0d | 0/8 | 0/8 | 0/8 | 0/8 | 43 | 478 |
| Healed × risk-aware | 67.0d | 0/8 | 0/8 | 0/8 | 0/8 | 55 | 512 |

Capable per-seed days — collapsed: [90, 152, 99, 90, 92, 91, 75, 136]; healed: [91, 91, 93, 92, 90, 90, 82, 90]. The healed capable days cluster tightly (82–93d) while the collapsed days spread (75–152d); the medians are nevertheless 90.5d vs 91.5d. Risk-aware per-seed days — collapsed: [137, 55, 59, 94, 60, 94, 74, 64]; healed: [119, 62, 56, 109, 52, 71, 144, 63].

## Endpoint-reproduction tolerance (prereg, proof test)

- Paired sits delta healed − collapsed: **0** (bar ≥ +2/8) — FAIL.
- Paired median delta healed − collapsed: **−1d** (bar ≥ +30d) — FAIL.
- Absolute bands: collapsed capable median 91.5d (band 40–100d) PASS; healed capable median 90.5d (band 115–150d) FAIL; sits collapsed 6/8 (band 0–2/8) FAIL; sits healed 6/8 (band 2–6/8) PASS.
- Per the prereg, a band miss with the GO bar followed would be recorded as a finding, not a re-score. Here the GO bar itself fails, so the band misses are part of the NO-GO record: the panel does not reproduce the doorwalk control headlines.

## Instrument disagreement (the finding)

The doorwalk baseline leg (the instrument that defined the flip) reproduces the flip on this band: collapsed median 70.5d, sits 0/8; healed median 145d, sits 4/8 (healerbisect controls, 1030Z round). The capable panel policy does not: 91.5d → 90.5d, sits 6/8 → 6/8. The capable bot is strong enough to carry collapsed-code villages to the table (6/8 sits even collapsed, 6/8 wins), so the code difference between the endpoints is invisible to it. The flip is a property of weak play, not of the code under a strong policy: the #15/#16 landings help weak (doorwalk) play enormously and change strong (capable) play not at all. The risk-aware leg adds a second instrument difference: under a cautious policy the healed code kills more (playerDeaths 43 → 55, villageDeaths 478 → 512), while under capable it kills slightly fewer. Neither instrument is wrong; they see different villages. The §15 panel verdict on the flip is NO-GO because the flip does not survive the change of instrument — the doorwalk flip stands as a doorwalk result, not a panel result.

## Investigation notes (not re-scores)

1. **Risk-aware death increase on the healed leg.** Player deaths per run 5.375 → 6.875 (`regression_signal`, paired 95% interval excludes 0) and village deaths 59.75 → 64 (`regression_watch`). Under a cautious policy the healed code is deadlier. Small sample (8 seeds); the mechanism is unexamined. A follow-up should read the risk-aware death causes on the healed leg before anyone leans on the heal under cautious play.
2. **Capable bearer-survival regression.** First bearer survives through day 30: 0.875 → 0.5 (`regression_signal`); through day 60: 0.375 → 0 (`regression_watch`). The first bearer dies earlier on the healed leg under capable, even though total player deaths fall (2.125 → 2.0) — the deaths concentrate on the first bearer. Not a (d) metric, recorded as an investigation note.
3. **Capable NPC class access falls.** Eligible NPC named-class access 0.1688 → 0.0831 (`regression_signal`) on capable; 0.1161 → 0.0872 (`regression_watch`) on risk-aware. The healed leg's NPCs reach named classes less often. Not a (d) metric; the mechanism is unexamined.
4. **Accepted player ability events fall on capable:** 96.625 → 74 (`descriptive`). The healed leg's capable bot accepts far fewer abilities. Descriptive only; possibly the healed villages need fewer abilities because they are stronger, or the ability economy changed. Unexamined.

## Wall numbers (this run's judged panels)

National / table / wins, wave 4–5 unlocks, median survival. The panel carries no wave metric; wave reach is from the committed doorwalk corpora (53001: collapsed maxWave 4, healed maxWave 5; both villages village-lost, regional, standing 199 → 275).
- Capable: national 7/8 both legs; table (sits) 6/8 both; wins 6/8 both; median 91.5d → 90.5d.
- Risk-aware: national 0/8 both; table 0/8 both; wins 0/8 both; median 69.0d → 67.0d.
- Full seat: 0 everywhere (all wins are the lesser seat; the smoke 53001 capable win on both legs was lesser, light, feared path).
- Telemetry deviation check: NOT run as a `--sweep-rows` check — the panel compare is the sanctioned §15 comparison for this arm (the telemetry-check tool refuses recorder/panel inputs by design, same as the 1030Z/1530Z corpora). No LOUD lines, no compare; baseline NOT rolled.

## Sense-testing

Read one day-record per leg for sense (panel rows' sample series + the committed doorwalk corpora). The villages are coherent: the collapsed 53001 doorwalk village runs 89 days, regional, standing gated 199, 3 wave-4 kills, 1 living veteran at the end, village-lost; the healed 53001 runs 106 days, regional, standing 275, 5 wave-4 kills, reaches wave 5, village-lost with the roster empty on the last day. Daily ledgers move sensibly (standing climbs, waves unlock, roster shrinks as people die, readiness bars track the veteran shortfall). The panel rows' day series are coherent (food routes vary by day: pantry, pack, personal-work, depositgate-eased, ration, alien-food). The smoke 53001 capable win on both legs was a lesser seat, light, feared path — the same story both legs tell. No robotic repetition, no incoherent jumps. The numbers disagree between instruments, but each instrument's villages read as real villages.

## Metric review

- The primary metric (capable-leg sits + median survival) is the flip signature as the balanced instrument sees it. The panel shows no flip; the doorwalk controls reproduce. The metric is not wrong — the instruments disagree, and the evidence says which villages each instrument saw (above). No re-score was performed; the NO-GO stands on the prereg bar.
- The 2-policy cut (capable + risk-aware, no socialite/winse ek columns) stands as pre-registered. The risk-aware column is what sank (d); the socialite/winse ek columns remain owed by a follow-up and are not claimed here.
- The frozen-controller overlay is vindicated by the digests: registrationDigest, observerDigest, and contractDigest are identical across legs (e7eb53f26474 / da3bb8dd3bad / 37bbb0fad947). The overlay made the harness identical without touching row-producing code.
- The smoke-gate override (prereg amendment 2c1c84917) stands: the smoke wall time (5m29s / 5m34s) was contention, compute 36s/case, and the full build fit (both legs built in ~31 min wall including the killed first attempt + detached resume). The gate fired and was overridden transparently before any judged leg.

## Infrastructure

- **Stale-lock recovery + adoption.** This run adopted the dead 1630Z run (lock 16:33:12Z; tree sim-flippanel-b heartbeat 17:10:50Z, 93 min stale; sole worker failed 18:30:50Z on a runtime transport error — sqlx pool timeout; coordinator last seen 18:20Z; no writes after 18:28:26Z, no processes). Orphaned prereg committed as 27017c842 (blob verified). Old claim retired to .DEAD with a note; old lock deleted; own lock + claim (1830Z) written before any sims. Loop A 1622Z live on scale-onramp the whole run (sim-midshape-a, sim-53007-a, sim-tenddrive-a) — NOT touched.
- **EPERM flap.** Writes refused ~18:45Z (probe `Operation not permitted` in /tmp and ~/workspace), then OK at 18:48:59Z, then refused again ~18:49:30Z — oscillating, minute-to-minute. The flap is also the likely cause of the 1630Z run's stale heartbeat (heartbeat writes refused) and its worker's transport failure. No evidence file was lost to it this run.
- **Extraction verification + overlay repair.** Both endpoint extracts verified by `src/js/game.js` hash vs the endpoint (before 5cf0cbe6… == cf22937b8; after 47f9bd10… == c9fea16ee) and by file lists (src/ complete on both legs, 0 missing). The dead run's frozen-controller overlay was INCOMPLETE on the after leg: 725 worktree `scripts/` files missing and 5 files differing (endpoint versions). Repaired by force-copying the worktree's `scripts/` onto the after extract; both legs now 0-diff vs the worktree's `scripts/`. The before leg was already 0-diff. Digests agreeing across legs confirms the repair.
- **Panel builds died once, resumed from cache.** The first two panel builds (launched as backgrounded exec, 19:22Z) both stopped at 8/16 cases with no output and no live processes (~19:34–19:38Z); the exec sessions vanished. Relaunched detached with nohup (PIDs 3393/3394) into the same out dirs; the tool resumed from the cases/ cache (8 cached jobs each) and both legs completed at 19:53Z (16 cases each). The 18 files in each cases/ dir (vs 16 cases) are cache artifacts; the panel.json.gz row counts are 16 each, as proven. The cases/ cache is NOT committed.
- **Safe-commit index clobber** struck three times this run (prereg commit, amendment commit, and the prereg commit's repair) — repaired via the documented `ls-tree | update-index --add --index-info` pipe each time (once as MM on the single file); blob hashes verified == HEAD after every repair; commits always correct.
- **Heartbeat script hung** once (registry flock held by a sibling ~4+ min); killed, retried, heartbeat landed 19:07:31Z and refreshed 19:27:24Z. The reaper was run at pre-flight: 9/16 active, no dead trees removed.
- **check.js --quick NOT re-run:** zero src/js, zero green-list files in this arm (DIAG-only: prereg, proof test, panels, evidence). The proof test is the arm's test (25/31, see above).

## Blanks filled / documented

- **Filled:** the real §15 panel verdict on the flip is now owed no longer — it is NO-GO, with the instrument disagreement named (capable masks the flip; risk-aware shows a death cost). The panel files, compare, and proof test are committed as the record.
- **Documented (not fixed):** the risk-aware death increase and capable bearer-survival regression under the healed code (investigation notes 1–2 above); the socialite/winse ek panel columns still owed; the panel-build exec-session kill (first attempt died at 8/16 with no output — the detached-relaunch pattern is the workaround, not a fix).

## Findings appended

- (appended to hidden_files/sim-findings.md by this run; see that file for the numbered entries — instrument disagreement on the flip, risk-aware death cost of the heal, capable bearer-survival regression, NPC class-access fall, panel-build exec-session kill.)

## Convergence

scale-onramp stays converging (NOT converged): the flip is now measured under the balanced panel and does not reproduce there, the full seat is still unreached (0 everywhere this run), wins still come only through the lesser seat, and the risk-aware leg shows the healed code costs deaths under cautious play. The doorwalk flip stands as a doorwalk result. Next blanks, in order: (1) the risk-aware death-cause read on the healed leg (why cautious play dies more); (2) the socialite/winse ek panel columns for this flip; (3) the middle-shape fight-judgment arm (Loop A sim-midshape-a, live at closeout); (4) the 53007 question (never heals anywhere in #1..#17); (5) the trial-by-combat staging question (steve-call, unchanged). food-economy stays converging (untouched; sibling Loop A live at closeout). Claim deleted; lock deleted. Evidence: evidence/2026-11-08/sim-flippanel-b.md (this file) + evidence/2026-11-08/sim-flippanel-b-prereg.md.
