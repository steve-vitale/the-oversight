# sim-food-economy-round-1730-b — Loop B coordinator evidence (run fleshout-loop-b-20261030T1730Z)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261030T1730Z, axis food-economy (converging).
Loop A live on scale-onramp at run start (1639Z claim: tributecost-a + refusalsay-a, NOT touched;
a new Loop A run, 1747Z, started during this run and landed on scale-onramp — also NOT touched).
Sibling trees never touched: sim-warmthdisp-b (held superseded branch), all gapscomp-*/journey* trees.

## Arm 1 — sim-sickstale-b: stale sick-record tick fix (sim-findings #1542) — LANDED

Branch sim-sickstale-b, merged locally pending ship. Fix commit c5ecd7ab8 (rebased tip b0dffbdcd):
`removeVillager` now deletes `v.sick[vid]` for every removal kind (after the phoenix early-return,
so a phoenix-saved villager keeps their illness), and `villageSicknessTick` skips-and-deletes
dead/off-roster records before hurting (covering old saves). No disease definition, pool, vector,
or cure touched. No `[needs-eyes]` — the fix is narration-silent (say lines and death sequences
bit-identical before vs after on all 9 seeds).

Proof, re-run by the coordinator on the rebased tip (17/17 GREEN, twice: after each rebase):
- Deterministic repro (seed 4242): pre-fix stale hits killed 1 / exiled 1 / old-save ghost 1,
  live control 80→77; post-fix 0 / 0 / 0, live control still 80→77.
- Pilot 10301–10308, competent, 180d death-aware: stale hits 2 → 0, live sickness hits 564 → 564,
  days/endings identical per seed.
- Seed 9983: stale 3 → 0 (gen_mr1pr0r d27, henry_zhang d28, gen_925shtf d36), live 56 → 56, days 38 → 38.
- Balanced panel (§15): compare decision `review_required`, but every paired metric delta is
  exactly 0 (table 0→0, national 0→0, village deaths 37→37); the review flag comes only from
  luck-instrument `insufficient`/`not_observed` on small samples — investigated, not waived.
- `check.js --quick`: 284 passed, 6 failed on both runs — all 6 reproduce on the pre-fix base
  (measurement-proof freshness ×2, mobile-combat cadence, occupation panels, phone-frame proof
  freshness, racks voice). Pre-existing, none touching sickness/removal. Phone-frame proof
  refresh needs real browser receipts, which this node-only arm cannot produce — carried, not waived.

COORDINATOR ADJUDICATION (clause (b), §14): the prereg's clause (b) required the pre-fix 9983
trace to show the elif_demir day-32 row (52→49). That row does not exist on this run's base:
across ~20 commits since the parent arm's base — including the contest-death fix itself —
9983's trajectory moved and elif survives all 38 days here. Per §14 this is recorded as MISSED
AS WRITTEN, not re-scored. The landing does NOT rest on clause (b): clauses (a), (c), (d), (e)
pass as written, and clause (b)'s intent — stale hits reproduced on 9983 and eliminated — is
satisfied by three real stale rows, all eliminated, plus the pilot and the deterministic repro.
Requiring the elif row would be unmeetable on any base containing the contest-death fix, since
that fix is what changed elif's trajectory; the bar is base-invalid, which is what the
metric-review section (in evidence/2026-10-30/sim-sickstale-b.md) is for. If Steve disagrees
with landing on this adjudication, the revert is the single fix commit c5ecd7ab8.
Verdict on the record: letter-NO-GO on clause (b) (base drift), substance GO, fix LANDED on
its independent proof. Evidence: evidence/2026-10-30/sim-sickstale-b.md (+ prereg, traces ×18,
pilot summaries, repro before/after JSONs, panel .json.gz ×2 and compare .md/.json).

## Arm 2 — sim-wakeforage-b: wake-tile forage yield DIAG (sim-findings #1513) — LANDED, DIAG-GO

Branch sim-wakeforage-b, merged locally pending ship (rebased tip a778b53e2). DIAG ONLY:
zero src/js changes, zero policy-default changes, no panel compare (pre-registered standing).
Proof 40/40 GREEN on the rebased tip, re-run by the coordinator; branch's own files
byte-identical to the worker's original tip across both rebases.

Recorder neutrality proven: fresh woodday-driver baselines on pinned base 7074478fb reproduce
exactly under the recorder on every per-seed creek/still/rescued count, both legs, 0 errors.
Drift noted, not hidden: vs the walktree base, 15009's still night is gone on this base and
rescued counts shuffled on four other seeds; the 15215 strand itself is identical (guard
nights 7–9, ON 7–16, same evening woods).

Answer to #1513, measured (one forage press on the wake tile at the morning snap, in a
discarded replay instance — the press is disclosed as the instrument, never bot behavior):
- Day-need (2200 kcal, prereg-fixed): 0/9 stranded field mornings cover it (max 720). A single
  wake-tile press is never a day's food.
- The wake corner decides everything. West corner (0,0), 5 of 9 mornings: sweep is
  dirt/grass/water/grass, zero forageable cells, press yields NOTHING and spends nothing.
  East corner (8,0), 4 mornings: muscadine already KNOWN, 6–8 × 90 kcal = 540–720 edible kcal,
  plus 11–18 unknown units (chickweed/mayapple, never learned by day 15). East mornings pass
  all secondary bars (self-funding ≥60, bridge-covering, walktree Y* 152–204); west pass none.
- Forage fixes no wood-gated evening: deadfall is 0 on all presses, so a press alone rescues
  nothing — day 10's evening still fails on wood (3 logs, needs 4) even with 540 kcal in hand.
  It funds a fell, kcal-wise, on east mornings only; the axe gate and sense step from walktree
  still stand.
- Perception law: every harvested cell is within Chebyshev ≤1 of the wake cell (the 3×3
  perceptionHints scan), the known/unknown split is the villager's own plantKnown state, no
  whole-tile read feeds any yield. No new sense step is needed to forage the wake tile — the
  missing piece is the morning-press *behavior* (the bot travels away first, walking past known
  muscadine on east mornings).
Evidence: evidence/2026-10-30/sim-wakeforage-b.md (+ prereg and one pre-leg amendment).

## Wall numbers (this run)

No scale sweep was run — both arms are measurement/fix arms on pre-seat bands, so no scale
claim is made from them. Sickstale pilot (competent, 180d, 9 seed rows incl. 9983): wins 0/9,
national 0/9, table 0/9, before AND after — structural to the band, not an effect of the fix.
Overall wall UNCHANGED by this run: full seat 0, wave 5 0 stands (Loop A 1639Z's scale work
is the live scale picture; this run does not move it).

## Telemetry deviation check (§15 step 10)

`telemetry-check.js --baseline scale-wall.json --current 'sim-sickstale-b-trace-*-after.json'
--metrics national,table,wins,exiled --sweep-rows`: 3 LOUD lines (national 12→0, table 16→0,
wins 16→0), exiled clean. INVESTIGATED, all regime artifacts: the before leg fires the
identical 3 LOUD lines (0/9 on every metric before the fix too), and the baseline file's own
_regime note forbids comparing pre-seat substrates against this WINSEAT baseline ("wins are
structurally ~0 there"). Baseline NOT rolled. No new investigation item.

## Infrastructure

- Master moved four times under this run (journey r71, journey scale r58, Loop A 1747Z
  sweeten-a + recorderfix-a, plus the wakeforage merge itself between arms). Every landing
  followed the body rule: ff-only merge refused loudly on a moved master (twice, no harm,
  tree clean), rebase onto the new tip, proof re-run, then merge. No force, no conflicts.
- REBASE STOP-AT-PICK QUIRK (twice, both arms, same signature): a rebase stops at the 2nd
  pick with "local changes would be overwritten by merge" (game.js/betrayal.js named on
  sickstale), the pick appearing in BOTH the done and todo lists, worktree clean, the pick's
  changes unapplied. Recovery that worked both times: verify tree clean + pick unapplied,
  then `git rebase --continue` — it sails through all remaining picks. Do NOT edit the todo
  or abort on first sight; the duplicate done/todo entry is sequencer bookkeeping for the
  in-progress pick, not a double application (final logs show each commit exactly once).
  The first wakeforage rebase's stop had no named files; the sickstale stop named src files
  that were in fact untouched — treat both as the same transient class until proven otherwise.
- Safe-commit index clobber hit the workers' commits (repaired via HEAD-blob cacheinfo by
  the workers, verified clean); the coordinator's own commits below were verified clean
  (status empty after each).
- Worktrees released as merged, branches deleted: sim-wakeforage-b, sim-sickstale-b.
  sim-warmthdisp-b (held superseded branch) untouched, as documented by the 1644Z run.

## Metric review

- Sickstale clause (b): see adjudication above. Known-event bars must be re-validated on the
  run's actual base before committing — a bar naming a historical trace row is void if the
  base moved the trajectory. Proposed for the next run: no action needed for #1542 (closed
  by this landing); the rule carries forward to future known-event bars.
- Wakeforage: no metric dispute. Day-need 2200 held as prereg-fixed; the 0/9 verdict stands
  on the table, not on a re-scored bar.

## Next blanks (food-economy, in order)

1. The two Steve-call items carried from 1644Z (competent courtship drive;
   generation-dealt vs earnable vests) — still awaiting Steve's ruling, not worked here.
2. Panel tier-3+ watch item (#1545): re-read on a fresh band, not a re-judgment of the
   armorfetch panel — still owed; this run did not take it (two arms already in flight).
3. New opens from wakeforage (appended to sim-findings.md this run): forage effort debt
   below zero; morning-press behavior missing from the bot's routine; 15009 strand lost
   on the new base (drift watch for strand-built banks).

food-economy stays converging (NOT converged): #1542 now LANDED as a fix, #1513 now ANSWERED
as a measurement; no food-economy default flipped, no balance change landed. scale-onramp
untouched (sibling loop A lane). Claim deleted; lock deleted.
Evidence: this file. Merged locally, pending ship.
