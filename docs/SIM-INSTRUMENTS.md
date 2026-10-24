# Sim instruments — shared helpers, runner gate, and method rules

Gap Phase 2, bundle W2-instruments. This doc is the closure record for the
bundle's instrument/method/telemetry items: each item names either the code
that closes it or the standing rule that binds future runs. Nothing here
claims an engine fix that does not exist — engine bugs are listed under
"Left open" with their reason.

## The kit (scripts/sim-instrument-kit.js)

One module replaces the per-arm re-inventions. Proof:
`node scripts/test-sim-instrument-kit.js`.

| Gap | Kit function | Rule |
|-----|--------------|------|
| 123 villageEats dupes | `dedupeVillageEats` | Key (vid, day); census rows dedupe before counting. |
| 176 succession masks ledgers | `lineageLedgerSum` | Sum takes/gives across the succession lineage, never per-vid only. |
| 217 n-floor | `deathCauseSetDiff(..., {minEvents: 3})` | A novel cause needs ≥3 events to count as a mode. Tool default, not a verdict — §14 pre-registration still binds the run. |
| 357 over-other ambiguity | `splitEndReason` | Never infer a win from `endReason`; use persisted `won`/`table`/`nomad` flags. Unknown stays unknown. |
| 358 generic combat | `isGenericCombat` | Bare 'combat' with no killer is quarantined, never counted as a monster kill. |
| 456 scholar-death kind | `scholarKind` | Victim == scholar vid ⇒ kind 'scholar', whatever the tele said. |
| 467 reposition schema | `repositionRow` | Rows need outcome + result + fightSeq; incomplete rows are invalid, not pooled. |
| 468 ±1d join | `linkDeathToFight` | Fight-seq first, same-day victim/monster second, nearest PRIOR fight (≤3d, flagged weak) last. Never forward, never same-mid other-day. |
| 482 telemetry keys | `telemetryKeyKind` | `wins`/`winRate`/`medianDays` are summary-only; never expected per-seed. |
| 515/544 cause labels | `canonicalDeathCause` | thirst→dehydration, starved→starvation, for SET COMPARISONS ONLY; raw cause preserved on the row. |
| 517 death-tele dupes | `dedupeDeathRows` | Key (day, who, kind, canonical cause, fightSeq). |
| 525/530/543 kind pollution | `filterPersonDeaths` | Kill rows and monster victims excluded; roster set enforced when supplied. |
| 554/562 via mis-tag | `resolveVia` | Key on `by` vs scholar vid, never on the tag. |
| 760 win-path gap | `winPath` | seat ≠ invitation; regional and ever-national are first-class axes. |
| 870 repro ms | `normalizeRepro` | Strip ms-valued diag keys recursively before byte-compare. |
| 883 post-unlock attribution | `attributeWindowDeaths` + `scripts/analyze-postunlock-deaths.js` | Re-links fightBasis-'none' rows through the kit join or the recorded nearest fight (weak, flagged); no fight in window stays unlinked with reason. Proof: `node scripts/test-postunlock-deaths.js`. |

## The pilot gate (gap 888 — named deliverable)

`scripts/pilot-gate.js` refuses a confirm stage when a NO-GO analyzer report
exists for the run (exit 3), or when no pilot verdict is on file at all
(exit 2); one NO-GO beats any number of GO reports. `scripts/run-sweep-gated.sh`
is the runner-family wrapper (`run-sweep-gated.sh <report> -- <command>`).
`scripts/run-pdvalue-b.sh` now gates inline: any SEEDS list containing a
confirm seed (94011+) runs the gate against `$PILOT_GATE_REPORT` (default
`evidence/2026-10-24/pdvalue-b-pilot-verdict`) before any cell runs;
pilot-only seed lists are ungated. `PILOT_GATE_ALLOW_MISSING=1` is a
deliberate coordinator override, never a default. Proof (gate CLI, wrapper,
and the runner's own gate block extracted verbatim):
`node scripts/test-pilot-gate.js` — shows a confirm attempt REFUSED after a
NO-GO report and ALLOWED otherwise.

## System voice in probes (gaps 349, 610)

`scripts/sim-harness.js` `loadGame({ captureSysSay: array })` routes
`Game.sysSay` into the array instead of the default no-op, without turning
on full narration. Default behavior is unchanged when the option is absent,
so existing sim trajectories are untouched. Sense probes that need System
voice must use this (or `narration: true`) and must NOT claim sysSay
silence as absence of System voice. Proof:
`node scripts/test-sim-harness-syssay-capture.js`.

## Robust writes (gaps 852, 621)

`scripts/sim-write-robust.js` `writeFileRobust` (atomic temp+rename,
read-back hash verification, retries with backoff) generalizes the
postunlock2-b chunked writer (already-resolved gap 886) for any sweep
verdict/summary writer. It does not cure the container EPERM flap; it makes
a sweep survive it instead of dying on a 0-byte JSON. Proof:
`node scripts/test-sim-write-robust.js`.

## Standing method rules (documentation-class items)

These items close as binding rules, not code — the failure was a run
discipline, and the next run's pre-registration must cite the rule:

- **248 control baseline drift / 335 committed trajectories perishable:**
  controls live INSIDE the sweep; after any game-code landing, re-sweep
  baselines before comparing. A trajectory captured on an old master is a
  historical artifact, not a baseline.
- **359 engine-day vs runDays drift:** report both counters; never present
  an engine day as a run day at run boundary (drift up to 2 days).
- **376 daily sampling misses final-day unlocks:** daily `unlockedWave()`
  sampling must be cross-checked against end-of-run beats; a final-day
  unlock found only in beats still counts.
- **390 SEATDRIVE-unset ≠ driver ON:** winning-substrate sweeps wrap with
  `withSeatDrive` explicitly and assert sittings > 0; an unset flag proves
  nothing about the driver.
- **399 table-topic confound:** topic overlays exclude `/red table/i`,
  `/speaker at the table/i`, and narrator lines before counting table topics.
- **490 policy tick-consumption stalls the clock:** tick-heavy layers get a
  clock budget; a layer that refuses sleep (or equivalent) must be
  budgeted or it silently shortens the village day it measures.
- **614 policy layers consume game RNG:** any layer that calls engine verbs
  consumes RNG; A/A comparisons across layer/no-layer arms must account
  for the shifted stream, not treat trajectories as RNG-matched.
- **850 daily-wrapper observer effect:** wrappers must be name-neutral
  (no policy-sounding names in the daily path) or the wrapper itself is a
  treatment; report wrapper identity in the run record.
- **851 sense-replay policy-id steering:** replays use the EXACT policy id
  of the original run; a replay under a different policy id is a different
  run, and trajectory-safety claims from it are conditional.
- **864 summary-merge silent failure:** never re-split a captured payload;
  on verify failure, re-invoke node for a fresh merge (already the
  run-pdvalue-b.sh rule; the gated wrapper extends it to other runners).
- **145 A/A absolute bar / 126/225 median guardrail:** the absolute bar and
  the median guardrail are BELOW the A/A noise floor on the cited runs.
  These are §14 metric-review decisions (relative bar / report-only
  guardrail), not instrument changes — a worker must not re-score a run
  mid-flight. Metric doubts go under 'metric review' in the run record.
- **101 laundering at convert time / 120 policy-clobber floor / 140
  person-fight coverage / 173 predation drought / 190 gorge both-sides /
  528 task-lead duties / 865 tribute channel:** instrument REQUIREMENTS
  for the next run in each area (measure at convert time, never post-hoc;
  no `Object.assign` policy wrap without a distribution-floor check;
  person-fight seeds must actually produce person-fights; gorge telemetry
  on both arms; per-day taskLeads snapshots; tribute-channel taxonomy).
  The kit functions above are the building blocks; the next run's
  instrument must wire them and show the coverage, or the gap re-opens.

## Left open (not closed by this bundle — see coordinator report)

Engine, content, or run-work items that an instrument library cannot close
without a design decision, a profiling run, or a live re-run:
101 (in part — convert-time hook still needs the laundering site),
104/112/151 (seed-88 determinism root cause unknown),
110 (leadcourt seed-202 ~50x/day perf, unprofiled),
118/119 (contest-driver wall-clock budget; time-freeze subsidy),
180 (beg-beat dedupe — narration content, W4 bundle),
429 (sprite validation 216 failures — content),
531 (food-skill name heuristic → data-driven ratings),
535 (wound→fever chain attribution),
601 (portionwindfall registerDeath hook call-through),
684 (check.js --quick pre-existing failures — verify at landing),
786 (safe-commit new-file index desync — cause undetermined; see report),
793 (stale-base re-verify — needs a fresh run on current master, not a lib),
574 (long-horizon transcript divergence — method note stands),
plus any (d)→(c) reclassifications in the coordinator report (none made
from this bundle: no item here required a new Steve design ruling to
state its instrument fix, though 126/225/145 await his §14 metric-review
decision as noted above).
