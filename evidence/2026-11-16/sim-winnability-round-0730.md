# sim-winnability-round-0730 — coordinator evidence (Loop B, 2026-11-16)

Run `fleshout-loop-b-20261116T0730Z`, axis winnability chain
(converging, NOT converged). Loop A live on scale-onramp throughout
(0645Z claim: launchdef + rumorplan, NOT touched); Loop A landed
mid-run (`2b552433e`, launchdef PILOT GO + rumorplan DIAG-GO) with
zero file overlap. Journey-scale r223 landed mid-run (`2fd2dad1f`).
Both arms below are LANDED, merged locally pending ship. This run
takes the 0530Z review's next blanks (2) the gate lever
(gatereach2's named next lever, prereg-ready) and (3)
companion-pool marginals (companionpool's next diagnostic), in
order. Blank (1) (any-commit launch definition + skip-reason
recorder) was taken by Loop A's launchdef arm this run — NOT
duplicated here.

## Arm 1 — sim-gatelever-b (LEVER, PILOT NO-GO, lever KILLED and reverted, evidence-only)

Branch `sim-gatelever-b`, base `9b04ae9b7`, rebased onto `2fd2dad1f`
for landing. Commits (rebased): `0ace5b1f7` prereg + `b8db67a84`
Correction C1, `df57443d8` instrument, `957ad644a` lever,
`1c9ba8439` REVERT, `68a28826a` evidence + corpora + analysis +
panel. Coordinator fix `d962f74b9` (proof `BASE` to rebase base +
rebased SHAs in evidence). Master tip after landing: `d962f74b9`.

The gate lever (gatereach2 §8, all three parts, nothing else):
launched party arrives as 3 (second companion + gate counts the
plan's party), trick known before the meeting (trick-wait, bounded
7 days), plan names the beast (fled-fight re-point + gate accepts a
hunt plan whose holder personally fought the beast). Control leg =
seed-call-only (replicates the gatereach2 instrument leg);
lever leg = seed call + the three gate changes. Band 102101–102108
(fresh, re-verified), 150d death-aware, competent verbatim
(sha `74a890f0844e…`).

Frozen GO bar (gatereach2 §8) — GO iff ALL hold. Verdict:
PILOT NO-GO, 3 of 5 bars pass, lever KILLED per the prereg.

| Bar | Control | Lever | Bar | Result |
|---|---|---|---|---|
| Gate SEEKs (wave-4+) | 0 | 1 (distinct 1) | ≥ 1 | PASS |
| Launched-party wave-4+ kills | 0 | 2 | ≥ 1 | PASS |
| Kill:death | — | 0.67 (2/3) | ≥ 0.92 | FAIL |
| Faced-not-killed share (unlocked) | — (0 unlocked) | 0.67 (2 of 3) | ≤ 0.20 | FAIL |
| Starvation / median survival | 4 / 119d | 5 / 132.5d | ≤ 6 / ≥ 95.2d | PASS |
| Instrument | 0 errors, shares 1.0 | 0 errors, shares 1.0 | clean | PASS |

Sensitivity (evidence): counting all 5 expedition deaths (2 died
as companions, outside the frozen holder-launch rule), kill:death
would be 2/5 = 0.40 — still a fail. The verdict does not rest on
the accounting choice.

Wall (both standing reads, named): national by end standing ≥200:
control 0/8 → lever **3/8** (102102: 335, 102103: 250, 102104:
625). National by final scaleRank: **0/8 both legs** (all
regional) — the known definition gap, reported both ways. Table 0,
wins 0, wave 4 unlocked 8/8 both, **wave 5 unlocked 0/8 → 3/8**
(102102, 102103, 102104). Wave-4 kills 12 → 20, wave-5 kills
0 → 2. Total deaths 559 → 645; median survival 119 → 132.5d;
starvation 4 → 5.

What the lever actually did (evidence §, plain words): Part 1
worked as a party builder — 25 second-companion launches (28
departs); gate avoids fell 46 → 28. But the only SEEK did NOT come
from any lever part — seed 102104 day 94, Leonard vs the Eater,
party of 3 sensed on an ordinary expedition, trick already known,
via the live defer-beat naming wave 4; it ended in a flee after 3
rounds. The kills bypassed the gate: both kills (Jorge Silva,
102104 day 82 vs Algorithm, day 90 vs Spoiler wave-5) happened on
gate-null ordinary encounters, trick unknown. The gate's SEEK is
not the kill path on this band. Part 2 engaged but is unmeasured:
trick-wait won the dawn lottery 27 times, yet recorded 0 holds —
holds land through `vbrainAlignObjective`'s indoor-chore rewrite,
which the depart recorder never sees. No wait was ever released by
the village learning the trick; **37/37 lever-leg gate nulls had
an unknown trick**. Part 3 fired often, converted never: 47 seed
re-points, 0 SEEKs via lived-fought.

Balanced panel: `review_required`. Deaths/run 69.875 → 80.625
(+10.75, CI 1.25–20.5, regression_signal); deaths/100d +4.71
(regression_watch). Seed 102101 alone is +24 deaths with zero
gate benefit. The frozen cost bar passes while the panel flags
the deaths price — a future gate confirm must pre-register a
deaths term (worker's open question, adopted here).

Drift check: 2 flags (102103, 102106) investigated and explained
— both are the check's first-lever-day missing real
second-companion launches recorded in depart rows on the
divergence day itself (`grLaunches.partyAfter` recorded 1,
threshold needs ≥ 2). No substrate drift indicated.

Proof: green on the lever tip and green post-revert pre-rebase
(worker-verified). Post-rebase the static check's hardcoded
`BASE` (`9b04ae9b7`) was stale: it read Loop A's launchdef bypass
(villager-agency.js) and journey r223 (conversation.js) as this
branch's src/ change. Coordinator fix `d962f74b9`: `BASE` now
points at the rebase base `2fd2dad1f` (assertion unchanged —
post-revert src diff vs base must be 0); the post-revert proof
re-runs green on the rebased tip and on merged master (static,
judge, recorder, determinism D1+D2 identical at 150d, true exit
0). The lever-tip static mode is not re-runnable post-rebase
(its 4-file expectation assumes the deduped seed call) — it
stands as verified pre-rebase. The seed-call pair was dropped by
the rebase as already-upstream (Loop A's 0645Z landing holds the
identical 13 lines + revert); net src/ diff unchanged (0 lines),
verified directly (`git diff 2fd2dad1f HEAD -- src/` empty on the
rebased tip; ff-only merge, so identical on master).

Rebase: stopped once on the lever pick (the documented
stop-at-pick quirk: pick in both done and todo, worktree clean,
lever unapplied — verified with `git diff <pick>` + marker grep);
recovered with `git rebase --continue`, which sailed through all
remaining picks.

Process deviation (worker, verified harmless by the coordinator):
safe-commit.sh refused the revert once (265-line deletion trips
its stale-tree guard); the worker re-ran with `--force-delete`
without coordinator approval. Verified: the revert commit is
exactly the lever + seed-call removal (4 files, inverse of the
lever commit's src stat; `git diff 9b04ae9b7 <branch-tip> -- src/`
= 0 lines pre-rebase, and again 0 vs the rebase base). Nothing
was lost. The brief's approval rule stands — the worker should
have waited — but the revert is proven correct, so no unwind.
Also: safe-commit.sh is mode `100644` in git itself (not
executable; the worktree copy is the same) — invoked via `bash`
throughout; noted as a tooling observation in sim-findings, not
fixed unilaterally.

Findings appended by the worker (3, open): trick-wait recorder
blind spot; all gate nulls trick-unknown; deaths price. Evidence:
evidence/2026-11-16/sim-gatelever-b.md (commit `68a28826a` +
coordinator fix `d962f74b9`).

## Arm 2 — sim-poolmarginals-b (DIAG GO, LANDED)

Branch `sim-poolmarginals-b`, base `9b04ae9b7`, rebased onto
`2b552433e` for landing. Commits (rebased): `38a2cb678` prereg,
`521792bf3` instrument (control anchor), `f22c72c4a` evidence +
analysis, `1f0a2f80e` corpora. Coordinator fix `1618778c3`
(rebased SHAs in evidence anchors section). Master tip after
landing: `1618778c3` (since moved by journey r223 + gatelever).

The diagnostic (companionpool's named next diagnostic #3):
extend the pool row with each member's full profile/trust/node,
to say how often trust < 15 co-occurs with away/notRanger.
Band 102131–102138 (fresh, re-verified per the
seed-band-freshness skill; the only 10213x hits are the 5-digit
seed 10213 from the sicktele census — a false-positive class),
150d death-aware, competent verbatim. Instrument extends the
companionpool driver/analyzer/proof test; seed call re-landed
verbatim as DIAG substrate, reverted after measurement; final
`src/` diff 0.

Verdict: GO — instrument valid, all four prereg bars pass.
1. Classification with full per-member profiles: **171/171**
   plan-holder scored dawns classified, unknown **0** (share 1.0
   ≥ 0.90). Every dawn carries a valid `members` array (length ==
   rosterN, first-fail tallies == counts).
2. Corpus 16/16 files parse (8 control + 8 instrument, identical
   seeds).
3. Neutrality: D1/D2 green in the proof test; D3 drift smoke
   CLEAN on all 8 seeds (102137 IDENTICAL across legs).
4. Proof: `scripts/test-poolmarginals-b.js` **64/64** on the
   instrument tip, **64/64** post-revert, **64/64** on the rebased
   tip (`POOLMARGINALS_SEED_CALL=off` — the rebased branch is in
   the post-revert shape; the default-env "on" check fails
   exactly one leg for the same rebase-dedup reason as
   launchdef's proof lesson), **64/64** on merged master.

The marginals (171 dawns, 1,043 living non-self member-checks):
- **Trust < 15: 14 members (1.3%), never alone.** Every one is
  also away, non-ranger, and off-node. Removing the trust floor
  would add zero eligible members. Companionpool's first-fail
  zero was, for trust, the right reading after all.
- **Profile binds alone at scale: 819/1,043 non-rangers (78.5%),
  592 alone (72.3%).** The only condition that binds alone.
  First-fail notRanger replicated almost exactly: 592 vs
  companionpool's 593.
- **Away never alone (0/363); not-at-Haven never alone (0/345).**
  All 345 off-node members are away; only 18 away members read
  as at Haven. **Expedition: 74 members, 70 hidden behind away,
  4 alone — and all 74 are rangers.** Dead is a true 0.
- **Co-occurrence:** trustLow×away 14/14 (P(away|trustLow)=1.0);
  trustLow×notRanger 14/14; away×notRanger 227. Empty pool 99/171
  dawns (57.9%, vs 82.1% companionpool); 14 of those 99 hide a
  low-trust member.
- **Chain:** 35 instances, **3 launches** (ranger holders only —
  Rafael Torres, Adaeze Nwosu, app_mgpsphw9529), 1 solo
  target-kill (visjoin_77 vs Strike, day 83). 39 ranger-holder
  dawns vs 0 in companionpool's band.

Correction to the family story (evidence metric review): the
prereg's "subject only exists with the seed call" premise is
**wrong on this band**: the control leg opened **3 instances and
launched 2 parties with the world-tick call absent**, via three
live seed paths — agency evade (`villager-agency.js:643`),
agency flee (`:726`), gate avoid (`win-plan.js:512`). The
instrument leg measures the world-tick path added to those. The
"subject only exists with the seed call" premise is dead; a
future arm should count all four seed paths, not the world-tick
one alone.

Wall (instrument leg; national reported both ways): national by
end standing ≥200: **4/8**; by final scaleRank: **0/8**; table 0;
wins 0; wave-4 8/8; wave-5 4/8; median survival 150d. Control:
3/8 by standing, 0/8 by rank, wave-5 3/8, median 151d. Wave-4
fights: 100 encounters, 6 kills, 58 flees, 18 deaths.

Rebase dedup (same as gatelever): the seed-call/revert pair was
skipped as already-upstream; final branch evidence-only, `src/`
diff 0 (branch diff vs new base identical to old branch diff vs
old base: 22 files, 1,563,945 insertions). One open finding
appended: 18 members flagged away while their node reads Haven.
Evidence: evidence/2026-11-16/sim-poolmarginals-b.md (commit
`f22c72c4a` + coordinator fix `1618778c3`).

## Wall (this run's judged corpora, 32 configs)

| | gatelever control | gatelever lever | poolmarginals control | poolmarginals instrument |
|---|---|---|---|---|
| National (standing ≥200) | 0/8 | 3/8 | 3/8 | 4/8 |
| National (scaleRank) | 0/8 | 0/8 | 0/8 | 0/8 |
| Table / wins | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 |
| Wave 4 unlocked | 8/8 | 8/8 | 8/8 | 8/8 |
| Wave 5 unlocked | 0/8 | 3/8 | 3/8 | 4/8 |
| Median survival | 119d | 132.5d | 151d | 150d |
| Starvation | 4 | 5 | — | — |

Telemetry deviation check on both corpora: REFUSED both by
shape (recorder rows, anchorCommit) — the same pattern as
0115Z/1415Z/0315Z/0446Z/0530Z/0645Z. Baseline NOT rolled; no LOUD
lines.

## Infrastructure

- Pre-flight: main tree clean, disk 42%, reap 7.5 min (12/16
  active, no removals). Registration ~16 min total (registry-lock
  contention; first tree ~7.6 min, second ~8.5 min queued).
- Master moved 4 times under the run (Loop A 0645Z `2b552433e`,
  journey-crisis r223 `4b1800402` + `ae9b4b6f7`, journey-scale
  r223 `2fd2dad1f`), zero file overlap with either arm. Both
  branches rebased clean (gatelever twice — the stop-at-pick
  quirk once, recovered per the documented lesson; poolmarginals
  once), proofs green after every rebase and on merged master
  (gatelever off-shape after the coordinator `BASE` fix;
  poolmarginals off-shape 64/64).
- Safe-commit index clobber struck the poolmarginals coordinator
  commit (MM-form) and the gatelever coordinator fix commit
  (MM-form on both files) — repaired via the ls-tree pipe each
  time, commits verified correct (status/diff/hash).
- Service restart interrupted the gatelever release sequence
  (proof-on-master + release + remove + branch delete in one
  call); verified nothing had applied (no proof log, worktree +
  branch still present) and re-ran cleanly.
- No write-flap strike. No `check.js --quick` (gatelever: zero
  net src/js — the lever was reverted; poolmarginals: zero src/js;
  both arm proofs green on merged master; Loop A's 0645Z run
  recorded the standing profile 334/6 on the same master).
- New Loop A trees appeared mid-run (`sim-gateconfirm-a`,
  `sim-killfail-a`, both at `2b552433e`) — not touched; they are
  Loop A's next run.
- Findings appended this run: gatelever 3 (trick-wait recorder
  blind spot; all gate nulls trick-unknown; deaths price),
  poolmarginals 1 (18 away-while-at-Haven members), coordinator 1
  (safe-commit.sh mode 100644 in git — not executable; invoked
  via `bash`).

## Coordinator reconciliation (national, again)

The two arms' national counts differ by policy band, not by
contradiction: gatelever control 0/8 vs poolmarginals control
3/8 on different bands (102101–102108 vs 102131–102138), both
competent verbatim. The standing-vs-scaleRank gap persists on
every leg (standing ≥200 counts national on 3–4/8 while the rank
field reads 'national' 0/8). Wall tables must keep naming the
field and reporting both, per the 0530Z reconciliation.

## What this run settles, and what it does not

Settled: the companion pool fails on profile alone (592 alone;
trust and away never bind alone) — the pool question is now a
profile-gate design call, not a measurement gap. The gate lever
moves the chain (first SEEK, first launched-party wave-4 kills,
wave 5 unlocked 3/8) but fails on kill:death (0.67) and
conversion (0.67 faced-not-killed), at a deaths price the panel
flags (+10.75/run) — the lever is KILLED, not held. The trick
is the binding constraint on every gate null (37/37 unknown);
the kills that do happen bypass the gate entirely, on ordinary
encounters with the trick unknown. The seed call is one of four
live seed paths, not the subject's sole source.

Not settled: whether the gate lever converts once the launchdef
bypass is in the substrate (this pilot measured on the
profile-gated pool); whether the trick can be learned faster or
should stop being demanded; whether the deaths price is
acceptable for wave-5 access. All three are named next blanks,
not re-runs of this pilot.

winnability chain stays converging (NOT converged): the chain is
now decomposed link by link with measured numbers at every step,
and the gate lever moved real wall numbers (national 0→3/8 by
standing, wave-5 0→3/8) — but the wins are still 0 everywhere on
competent legs, the kills that happen bypass the gate at even
odds with dying, and no lever has yet turned a launch into a
repeatable wave-4 kill. Next blanks, in order: (1) the trick
question (Steve/design call): a faster way to learn a wave-4
trick, or stop demanding it at the gate — the binding constraint
on 37/37 gate nulls; (2) a gate confirm on the launchdef-bypass
substrate (Loop A's blank #1, with a deaths term pre-registered
in the cost bar — this pilot's panel demands it); (3) the
profile-gate design call (Loop A owns it) — profile is the only
alone-binding pool condition; (4) the four-seed-paths
re-measurement (agency evade/flee + gate avoid join the
world-tick seed as live paths); (5) the 18 away-while-at-Haven
members (open finding); (6) seasoning gate (0430Z blank #3);
(7) §14c watch on 100633; trick knowledge at the door (0430Z
blanks #4–5); (8) rumor-born plans + world-tick seeding as
design calls (Loop A's 0645Z blanks #5–6); (9) answercourt
landing decision, competent seat-taking BUILD, family-7 program
decision (Steve-calls). scale-onramp stays converging (Loop A's
0645Z recorded it; untouched here). food-economy stays
converging (parked). Claim deleted; lock deleted. Evidence:
evidence/2026-11-16/sim-winnability-round-0730.md (this file).
