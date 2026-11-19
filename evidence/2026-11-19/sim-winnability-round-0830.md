# Loop B round — fleshout-loop-b-20261119T0830Z (adoption closeout)

Run `fleshout-loop-b-20261119T0830Z`, axis winnability chain. Coordinator
timed out with arm 2's closeout unfinished; this file is the adoption's
record. Arm 1 was already complete; arm 2 is verified and landed
evidence-only below. Merged locally, pending ship.

## Arm 1 — sim-freestrike-b: NO-GO phenomenon-absent (COMPLETE, on master)

Order the free-action Rage strike ahead of the turn verbs (finding #2584's
named next step). The ordering works exactly as designed — on the after leg
the free strike lands first on 19/19 carrier fires, verbs still fire
afterwards, the benign peaceful ending is preserved in the wild — but the
thing it was built to fix does not happen on this substrate: the before leg
shows **0 harmful pre-emptions in 15 observable carrier fires**. Per the
frozen prereg, a 0 before-leg harmful rate is NO-GO phenomenon-absent,
never GO. No confirm run. The game-code change is NOT merged; the branch
holds the lever. Evidence `evidence/2026-11-19/sim-freestrike-b.md`
(master `5de43bcf0`).

## Arm 2 — sim-fightcap-b: NO-GO (adoption-verified, evidence-only on master)

The fight-ally cap (finding #2559 family): a launched quad used to fight
as three — the sense capped at two companions. The lever opens a third
companion slot, only for a launched quad, only when the third companion
stands near the fight. Legs differ ONLY by ALLYSLOT3 (shared substrate
both legs: SENSEEXPED=1, PARTYSIZE4=1, VETREENGAGE=1, FLEEREPAIR2=1,
FIGHTALLY2=1). Seeds 104770–104777, 150d, competent.

- **Primary 1 — 4th-member damage share: PASS.** 246/1344 = 0.183 pooled
  over 2 fielded fights (bar ≥ 0.10). Both on seed 104771, fighter Rosa
  Mendez, 4th member Katarina Novak: d58 Congregation 141/686 (20.6%),
  d76 Spoiler 105/658 (16.0%).
- **Primary 2 — kill share on joined quad meetings: FAIL.** 0/18 arm
  (bar ≥ 0.20; needed 4 kills), 0/9 ctl. Talk-downs 0/0.
- Pool floor PASS (launches 15 ctl / 24 arm; meetings 9 / 18). Cost bars
  all PASS (community loss 5/8 both; starvation 3/2 both; median 142.5d /
  147d). Instrument errors 0.
- GO required both primaries. **Verdict NO-GO: the cap lifts but quads
  still do not kill — that IS the #2559 answer.** The cap was a real
  constraint on damage and not the constraint on killing. Binding now:
  (a) launch parties decay by death before the fight (10/21 sense-miss
  causes); (b) damage/round ~50 vs the ~111 winning shape. The matched
  pair shows it directly: the same d58 Congregation fight dealt 435/999
  (43.5%) with two allies, 686/999 (68.7%) with Katarina — and still fled.
- Field-4 rate 2/13 = 0.15 (reported only); sense rate 5/18 = 0.28 — far
  below senseexped-b's 0.892, because the sense rate here is a
  party-survival metric as much as a sense metric.
- Balanced panel: decision `review_required`, carried by village deaths
  +3.375/run (regression_watch); community loss flat, no extra village
  lost. The arm launches more (24 vs 15) and fights more, so it takes
  more exposure.
- No 12–16-seed confirm: pilot NO-GO, prereg gates the confirm on GO.

### Adoption verification (independent of the worker's numbers)

The adoption re-aggregated both primaries from the raw per-seed corpora
with its own code (CORRECTED join, finding #2570): arm 18 meetings, 0
kills; damage 246/1344 = 0.183 over exactly the 2 fielded fights above;
field-4 2/13, sense 5/18. Every number matches the analyzer. Evidence
`evidence/2026-11-19/sim-fightcap-b.md`; analysis
`fightcap-b-analysis.json`; corpora `perseed-fightcap-b-{ctl,arm}/`.

Proofs on the rebased tip: analyzer selftest 28/28;
`test-allyslot3-b.js` 18/18 (lever proof, branch only);
`test-fightcap-b.js` 12/13 — the one failure is §C's hardcoded anchor
pin (`eccc08af2`): the driver records `git rev-parse HEAD` faithfully,
so the pin breaks on any commit after the base. Sections §A/§B all pass.
The test was NOT loosened.

Gate (adoption, rebased tip, solo): **338 passed, 6 failed in 1012s, 0
attributable** — log `evidence/2026-11-19/fightcap-b-check-adoption.log`.
The 6 are the standing set: deed-attainment 120s timeouts (living-garden,
one-person-army), measurement-proof staleness pair, cache-flags (solo
GREEN 4/4 in 38s — load artifact), phone-frame stale receipt.
Ladder-bundle control absent — cleared. The worker's gate (329/15) carried
9 extra failures, all cleared on the re-run: 7 EPERM/flap-caused, 1
ontology failure from the flap-emptied ONTOLOGY.md (restored from HEAD by
the adoption, never committed), 1 occupation-panels (green in the
adoption gate).

### Landing (evidence-only)

Branch history was lever → tooling → prereg, so a plain ff-merge would
have dragged the lever in. Cherry-picked onto master:

- `333f39e0b` tooling (driver, analyzer, panel builder, measurement
  proof test)
- `41e1961a9` prereg + survey corpus
- `c48e5494b` NO-GO evidence (adoption-verified)

Verified: lever `5a5343363` NOT an ancestor of master; zero `src/`
changes; main tree clean. Branch `sim-fightcap-b` kept with the lever
intact (`5a5343363` + `e0663932d` + `4aa091c1d` + `7d907760b`);
worktree released done-abandoned and removed.

On master the landed tooling reads: analyzer selftest 28/28;
`test-fightcap-b.js` §A+§B 8/8; §C 0/2 — the driver refuses to run
without the lever code ("FIGHTCAP STOP: the ALLYSLOT3 lever code must be
present on BOTH legs"), which is the expected held-lever state, matching
the partyfunnel precedent. `test-allyslot3-b.js` stays on the branch
inside the lever commit.

## Findings

- **#2559 ANSWERED** (line 2564): the 4th member, when fielded, deals a
  real share (16–21% per fight, 18.3% pooled) and lifts the party from
  43.5% to 68.7% of a wave-4 monster's health in the matched pair — but
  launched quads still kill nothing (0/18). The cap was not the binding
  constraint on killing. Damage/round (~50 vs ~111 winning shape) and
  party survival to the fight are.
- **#2567 (3rd-ally damage unmeasured at n=1):** now measured at n=2
  fielded fights — 18.3% pooled, still 0 kills. Closed by this arm's
  numbers; the damage question is answered, the kill question stays open
  on other levers.

## Wall (pooled, both arms' bands)

| | national | table/wins | wave-4 | wave-5 | median survival |
| --- | ---: | ---: | ---: | ---: | ---: |
| freestrike ctl/arm | 0/0 | 0/0 | 8/8 both | 2/8 → 4/8 | 142.5d / 146d |
| fightcap ctl/arm | 0/0 | 0/0 | 8/8 both | 3/8 both | 142.5d / 147d |

The winnability wall stands: no national, no wins, wave-5 faced but the
door never converts.

## Adoption notes / infra

- The write-flap blocked this adoption for ~46 min (window ~10:10–10:56Z,
  boot 1fa0676a): heartbeat EPERM, ONTOLOGY.md emptied to 0 lines in the
  worktree (restored from HEAD), analyzer selftest + proof tests EPERM on
  /tmp writes, registry heartbeat unwritable. The adoption worked read-only
  (verification + gate-failure classification from the worker's log) until
  writes recovered, then proceeded. A fresh empty file in the main tree
  (`evidence-TEST.tmp`, 0 bytes) vanished on its own before the landing
  (reaper sweep presumed).
- Index clobber struck on the adoption's safe-commit (all 31 files
  staged-deleted); repaired via the `ls-tree -r` pipe, hash-verified.
- Rebase onto master `385f07995` clean 3/3, no stop-at-pick quirk.
- Freestrike worktree released done-abandoned, branch kept (lever held,
  `f490ff656`).
- Claim `fleshout-loop-b-20261119T0830Z.json` retired to .DEAD; lock
  `fleshout-loop-b.lock` deleted last after run_id verification.
- Proof refresh round 21 (measurement-proof pair) still owed — this round
  changes no `src/` on master, but the pair is stale on master generally.
