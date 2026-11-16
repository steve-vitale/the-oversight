# sim-winnability-round-1515 — coordinator evidence (Loop A, fleshout-20261116T1515Z)

Axis: winnability chain. Stale-lock recovery + adoption of the dead 1315Z run's
three arms (tracker blanks #1 seed-call landing BUILD, #2 trick-learning DIAG,
#4 havenTick DIAG), shared band 102141–102148 (fresh, coordinator-verified by
the 1115Z/1315Z runs — reused, not reassigned), competent verbatim, 150d,
8-seed pilot. Flap watcher ALL-OK from ~13:11Z through closeout; no EPERM hit
in this run.

## Stale-lock recovery (1315Z)

Lock fleshout-20261116T1315Z (created 13:26:00Z) deleted at 15:26:42Z: 116 min
old (>90 min fallback) and all three tree heartbeats >15 min stale (seedland
14:57:35Z, tricklearn 13:29:40Z, haventick 13:59:28Z); all three workers done
(seedland cancelled-no-result, tricklearn BLOCKED-flap, haventick ON-leg
finished post-timeout). No live processes in any adopted tree; last write
15:18:12Z, writes stopped (verified: corpora 8/8 valid JSON per leg, ps clean).
Claim retired to fleshout-20261116T1315Z.json.DEAD + .note. Pre-flight: main
tree clean, disk 45%, reap done (14/16 active, no removals). Loop B's live
1321Z run (blanks #6/#9/#2-build, band 102201–102208) untouched throughout.

## Verdicts — all three arms LANDED, merged locally, pending ship

### sim-seedland-b — NO-GO (blank #1, BUILD killed-at-pilot)

Seed call + gate fix (already on master), judged vs frozen prereg. Seed calls
6 → 69, plan instances 0 → 17, launches 0 → 3 — the seed source works. But
all 3 launches ended holder-died (2, 33, 13 days) with zero launched-party
meetings in-window, so launched-party wave-4+ kills = 0 (bar ≥1, FAIL);
kill:death null (bar ≥0.92, FAIL); faced-not-killed 0.17 (bar ≤0.20, PASS);
cost bar clean (starvation 2 vs 2, median survival 150.5 vs 150.5, PASS).
Panel decision `review_required`: village deaths/run 76.5 → 90, expedition
deaths 98 → 189. Seed call REVERTED; branch net src/ diff 0. Proof 40/40
(post-revert shape; see gotcha below). Commits: prereg e8ce727d0, instrument
ca6d061ae, revert+evidence 961d995f2. Evidence: sim-seedland-b.md + prereg +
seedland-b-analysis.json + seedland-b-panel.md + 16 per-seed JSONs.

### sim-tricklearn-b — DIAG-NO-GO on power (blank #2 DIAG)

Instrument valid (proof 80/80; D1/D2 clean; replication identical), but the
wait question is under-powered: only 2 wait-window episodes opened (bar ≥3).
250 observation events (126 wave-4+); 37 tricks learned, every one at exactly
obs 2 (19 wave-4, 4 wave-5, 14 wave-3). Sources: fight-observed 184,
scholar-observed 6, taught 0, node-witnessed 0 — the taught/codex channel
never fired once. Gate consulted 29 times, trick unknown in all 29 — yet only
2 trick-holds. Launched wave-4+ fights: exactly 1 (evade, 0 rounds). Both
wait windows expired, both The Audit: 102142 D94, 0 observations (in-window
fight was an evade; evades record nothing); 102147 D49, 1 observation, second
took 59 days. The 2→1 threshold candidate would have saved exactly one of
the two windows; it treats the clock, not the gate. TrickAfter teaches: 23
fights flipped false→true. Commits: prereg d54149931, DIAG a9c5cdafc →
rebased d783402e0. Evidence: sim-tricklearn-b.md + prereg + analysis +
tricklearn-b-panel.md + 16 per-seed JSONs. Zero src/js change.

### sim-haventick-b — DIAG GO (blank #4 DIAG)

All six frozen bars pass (proof 75/75; D1/D2/D3 clean). HavenTick is the
dominant plan creator on master as-is: 23/50 episodes instrument (46%), 16/19
control (84%); launched 19 (76%) / 12 (92%). HavenTick launches DO kill
wave-4 beasts on pure master: Clarence Lombardi's party kills an Algorithm
(d132), Ruby Callaghan's a Strike (d79), Theo Lindqvist's a Congregation
(d146). HavenTick source split: heard 35, both 4, lived 0 of 39 — no creation
from personal fought experience alone. Big finding: 4 of 8 control seeds
never start any plan in 150 days (102141/144/145/148) while surviving to
wave 5 and slaying beasts (102141: 150d, standing 375, 70 wave kills) — verified
real, game counters agree (winPlanStats all zero). Commits: instrument
e0c9683a8, seed-call anchor fdfb12008, revert b4a6cb3d4, analyzer fix
e858e2b99, evidence 76f83fdf7. Evidence: sim-haventick-b.md + prereg +
haventick-b-analysis.json + 16 per-seed JSONs. Zero src/js change.

## Wall numbers (band 102141–102148, competent verbatim, 150d)

| | seedland ctrl → on | tricklearn | haventick ctrl → on |
|---|---|---|---|
| national by standing ≥200 | 4 → 6 | 4/8 | 4 → 6 |
| national by rank | 0/8 | 0/8 | 0/8 |
| table / wins | 0 / 0 | 0 / 0 | 0 / 0 |
| wave-4 / wave-5 reached | 8/8, 4 → 6 | 8/8, 4/8 | 8/8, 4 → 6 |
| median survival | 150.5d both | 150.5d | 150.5d both |
| deaths | — | 612 (starvation 2) | 612 → 720 |

The scale wall stands: national-by-rank, table, and wins are 0 on every leg.

## Telemetry deviation check

`telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json
--current 'evidence/2026-11-16/perseed-seedland-b-on/*.json' --metrics
national,table,wins,exiled --allow-recorder-corpus` fired three LOUD lines:
national 12 → 0, table 16 → 0, wins 16 → 0. VERDICT: regime artifact,
explained, not a bug. The baseline's own `_regime` note says verbatim not to
compare pre-seat substrates against it — wins are structurally ~0 there and
the check fires a spurious LOUD 'wins disappeared'. The baseline is the
"winseat — full win-side win stack" regime (WINPURSUIT policy stack); this
run's corpora are competent-verbatim on the pre-seat substrate, where the
panel reports 0/8 national-by-rank, 0 table, 0 wins on BOTH legs (control
and on identical) — no change introduced by this run. Baseline NOT rolled.

## Infrastructure / coordinator notes

- Rebase: all three branches rebased onto master 47477d874 (Loop B's 1321Z
  landing) then ff-merged; proofs re-run on rebased tips (tricklearn 80/80,
  haventick 75/75, seedland 40/40 post-revert shape). Trees released, worktrees
  removed, branches deleted. Master tip after merges: 961d995f2.
- Seedland rebase quirk: git skipped the BUILD commit e5e398153 as
  "previously applied" (patch-id equivalent in upstream history); the rebased
  revert commit therefore carries no game.js change. End state verified by
  blob hash: branch-tip game.js == master game.js == 440ef1b40 (no seed call);
  net src/ diff 0. The judged ON-leg ran with the call present (corpora prove
  it); nothing about the verdict changes.
- Seedland proof invocation gotcha (recorded for the next coordinator): the
  proof test defaults to SEEDLAND_SEED_CALL=on (on-tip shape). On a
  post-revert tip it must be run as `SEEDLAND_SEED_CALL=off node
  scripts/test-seedland-b.js` — a bare run fails 3 static checks by design
  (37/40), not a branch defect. Verified 40/40 with the documented invocation.
- Safe-commit index clobber struck on all three workers' commits and once on
  the coordinator side; repaired each time via the ls-tree pipe, commits
  verified correct by hash. No write-flap strike this run.
- Main-tree stray at closeout: `evidence/2026-11-16/journey-deepening-r226-analyzer.log`
  (sibling playtest-loop file, written 16:22:20Z, live) — left untouched, not
  committed (never commit another agent's files). Main tree therefore not
  clean at closeout through no fault of this run; this commit covers only
  this run's evidence file.
- Repo AGENTS.md (read this run per house rules): push discipline honored —
  no push, no bump, no live verification; merges ff-only on the local chain
  (no `git fetch origin` before merging — the ship loop owns origin; noted,
  not re-done).

## Metric review

- Seedland: bars held as frozen; bar 2 (kill:death) is null-denominator on a
  0-kill pilot and fails as specified — correct, not re-scored. The panel's
  `review_required` (expedition deaths) is a real second cost signal the
  prereg's cost bar does not price; next arm must watch expedition deaths
  alongside kill:death (finding appended).
- Tricklearn: bar 5 (power) failed on episodes (2 < 3) while obs events were
  plentiful (126) — the instrument measures learning fine; the GATE rarely
  consults the trick, so wait windows rarely open. A re-run on a band with
  more launches would power the wait question, not a bigger instrument.
- Haventick: no balanced panel (prereg asked for one; panel builder runs
  fresh multi-policy sims and cannot compare recorder corpora; D1/D2/D3 is
  the substitute, same as seedpaths/dawnbid/poolmarginals). Recorded in the
  evidence, not silently skipped.

## Convergence state

Winnability chain stays converging (NOT converged): blanks #1, #2-DIAG, #4
all CLOSED this run — #1 killed-at-pilot (seed call reverted; the seed source
is proven working and is no longer the binding link), #2-DIAG measured but
under-powered, #4 GO (havenTick counted, launches kill on master as-is) —
but wins are still 0 on competent legs, launched parties still get 0 kills
from the seed-call path, and no lever has yet turned a launch into a
repeatable wave-4 kill. Next blanks, in order: (1) launch survival +
re-encounter (new — the binding link after seedland: holders die in-window,
parties never re-meet the beast); (2) companion pool empty (new — 11/17
instances die candidate-not-bid); (3) trick question (Steve/design call —
faster learning vs stop demanding at the gate; now sharper: 2→1 saves 1 of 2
windows and treats the clock, not the gate); (4) profile-gate design call
(Loop A); (5) seasoning gate G1 ruling (Loop B held); (6) §14c watch on
100633; trick knowledge at the door; (7) rumor-born plans + world-tick
seeding as design calls; (8) answercourt landing decision, competent
seat-taking BUILD, family-7 program decision (Steve-calls). Scale-onramp
stays converging (untouched). food-economy stays converging (parked).
Findings appended to sim-findings.md: 3 seedland (re-encounter, companion
pool, expedition cost) + 3 haventick (dead holders' plans never die;
havenTick lived never creates; half the control villages never ignite) + 1
tricklearn (villager's first survived encounter is silent). Claim deleted;
lock deleted. Evidence: evidence/2026-11-16/sim-winnability-round-1515.md.
