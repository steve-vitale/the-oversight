# sim-scale-onramp-round-0315 — coordinator evidence (Loop A, run fleshout-20261116T0315Z)

Axis: scale-onramp (converging). Loop B live on "winnability chain"
(claim fleshout-loop-b-20261116T0130Z, arms gatereach/aidgate/
covenantsmoke; aidgate-b heartbeat 03:10Z at run start) — NOT touched.
This run took the 0115Z review's next blank (8): veterans survivorship —
the next lever must aim at launch conditions — by first measuring the two
breaks the vetparty NO-GO named, instead of building another blind lever.
Both arms are DIAGs (instrument-only, no game change, no default flip),
run in parallel against ONE shared fresh band.

## Pre-registration (run-level)

- Shared band: seeds **100861–100868** (8-seed pilot), horizon 150d
  death-aware, policy competent verbatim (sha `74a890f0844e`).
  Band-freshness check (coordinator, before any sim): grep over all
  `evidence/*/sim-*-prereg.md` and `evidence/*/sim-*.md` — zero hits for
  `10086[0-9]`; rg sweep over all of `evidence/` — only decimal-fragment
  false positives (e.g. `14796.466210086763`) inside old October corpus
  floats, zero `.md` hits. Each arm's prereg re-records the check.
- Arm GO bars are the frozen instrument-validity bars in each arm's
  prereg (classification completeness, corpus parse, neutrality,
  proof green). No lever was built this run, so no lever GO bar applies.
- Claim: `hidden_files/lever-claims/fleshout-20261116T0315Z.json`
  (axis scale-onramp; arms dawnbid-a, ammocensus-a). Findings #2404 and
  #2405 claimed at run start.

## Arm 1 — sim-dawnbid-a (DIAG-GO, claims finding #2404)

Branch `sim-dawnbid-a`, 7 commits, rebased onto master `655949b97`
(Loop B's aidgate-b landing + journey endgame r219 moved master under
the run; rebase clean 7/7, no conflicts), merged ff-only as
`5b03a5ba4`. Proof `scripts/test-dawnbid-a.js` 50/50 on the instrument
tip and 50/50 in the post-revert (`DAWNBID_SEED_CALL=off`) shape on
merged master. `src/` diff across the 7 commits: 0 lines — the vetparty
seed call was re-landed verbatim ONLY to create the subject to diagnose,
then reverted on the branch; the landing is instrument + corpora +
evidence only.

Question: why did 105 of 106 seeded wave-4 plans in vetparty-a never
produce a depart row? The recorder could not distinguish "dawn never bid
the party_launch candidate" from "plan churned before dawn".

Answer — 24/24 seeded wave-4+ plan instances classified, unknown 0
(share 1.0 ≥ 0.90 bar); corpus 16/16 files parse (8 control + 8
instrument, identical seeds); neutrality proven (D1/D2 green, D3 drift
smoke clean on all 8 seeds); proof 50/50.

| Bucket | n | Share |
|---|---|---|
| launched | 1 | 0.042 |
| target-killed (plan holder killed the target another way) | 2 | 0.083 |
| selected-blocked | 8 | 0.333 — all `selected-not-executed` |
| bid-not-selected | 0 | 0 |
| plan-churned-before-dawn | 0 | 0 |
| candidate-not-bid | 13 | 0.542 — 11 `no-companion-party`, 2 `not-scored` |

Pooled: 262 scored dawns, 69 bids (26.3%), 69 selections — a bid is
always selected. The two buckets this DIAG was built to distinguish are
both empty; the loss is entirely downstream of the bid. Two gates:

1. **The profile gate (8/24):** every `selected-not-executed` holder is
   a non-ranger (0 EXPLORE candidates in 12–41 dawns). The dawn scorer
   bids `party_launch` for any plan holder, but `agencyTick` skips
   non-wanderers/explorers before ever calling `vbrainExecuteDepart`.
   Brian Otieno (seed 100861) bid the return trip on 21/21 dawns over 40
   days, at Haven, never departed. The one launcher (visjoin_105) is a
   ranger.
2. **The companion pool (11/24):** plans sit at party stage for weeks
   with no eligible companion at Haven. Even the one ranger holder
   (owen_smith, 49 dawns) never found one.
3. Control leg: 9 wave-4 seed calls, 0 instances — all hit hunt-stage
   target-null plans, so the seed bounced. The 141 `party_launch` commits
   / 58 launches there are all target-null plans: the launch machinery
   works; wave-4 targeting never engages.

Reachability: 1 launch in 24 seeded plans (4.2%), 0 wave-4 kills through
a launched party. In plain words: villagers who survive a wave-4 monster
do remember it and do want to go back — but the person who remembers
usually never leaves the village, and even the travellers who remember
usually can't find anyone to go with them.

Sense-testing: the launched party fights together ("George reads the
sterile streets — you can't kill a suburb. They walk out."), and
Wanjiru's target-kill reads as a real finish in the wild.

Evidence: `evidence/2026-11-15/sim-dawnbid-a.md` + prereg
`evidence/2026-11-15/sim-dawnbid-a-prereg.md`; instrument
`scripts/dawnbid-driver-20261115.js`, `scripts/analyze-dawnbid-a.js`,
`scripts/test-dawnbid-a.js`; corpora
`evidence/2026-11-15/perseed-dawnbid-a-{control,on}/`.

## Arm 2 — sim-ammocensus-a (DIAG-GO, claims finding #2405)

Branch `sim-ammocensus-a`, 3 commits, merged ff-only as `4761c34bd`
(master had not yet moved at that point). Proof
`scripts/test-ammocensus-a.js` 40/40 green, re-run green on merged
master. `src/` diff: 0 lines — pure recorder, no game change.

Question: how often do "armed" villagers carry ammo-less ranged weapons
into wave-4 fights, and does the gate's all-armed bar count them?

Answer — 133/133 wave-4 meetings fully classified (0 unclassified);
corpus 8/8 files parse, 0 instrument errors; neutrality proven (60d
determinism legs recorder-on ≡ recorder-off ≡ recorder-on-again);
proof 40/40.

- Fighters: **23 armed-with-ammo / 23 armed-no-ammo / 87 unarmed.**
  Among fighters carrying a ranged weapon (46), **exactly half (50%)
  are dry.** Across all 462 persons at meetings, 95/214 ranged carriers
  (44.4%) are dry.
- Dry needs: stone 72, arrow 20, bolt 3 — slings dominate; wrong ammo 0
  (absence, not confusion). 56 of 95 dry carriers have no melee fallback.
  58 unarmed persons hold a spear in the ranged slot; 0 carry an
  unequipped ranged weapon in the pack.
- Volley fired 23/133 meetings (66 shots, 30 hits, 593 dmg) — matches
  the armed-with-ammo count exactly.
- Gate's all-armed bar: 19 rows (only 3 seeds — 5 seeds had 0 gate
  rows). Gate-counted-armed dry-any 2/29 (6.9%), dry-only 0/29,
  **over-count 0/19**. The armed bar never bit — all 9 avoids were
  party-size. **Caveat: this does NOT exonerate the gate** — the gated
  subset is too small and too selected; `gearOf` still never checks
  ammunition in code. Recorded as a new open finding, not a closed
  question.
- Sense-testing: the "no arrows" line fires 23/23 dry fighters, 0 false
  positives — including Jesse (one of the #2064 fighters). But 7/23
  lines misname the ammo (dry sling/crossbow called "no arrows" —
  #1592 confirmed live, 30%).

Evidence: `evidence/2026-11-15/sim-ammocensus-a.md` + prereg;
instrument `scripts/ammocensus-driver-20261115.js`,
`scripts/analyze-ammocensus-a.js`, `scripts/ammocensus-detcompare.js`,
`scripts/test-ammocensus-a.js`; corpora
`evidence/2026-11-15/perseed-ammocensus-a/` (+ det legs).

## Wall numbers (this run's judged corpora, shared band 100861–100868)

| Leg | National | Table | Wins | Wave 4 | Wave 5 | Median survival |
|---|---|---|---|---|---|---|
| dawnbid control | 3/8 | 0 | 0 | 8/8 | — | 138.5d |
| dawnbid instrument (seed call on) | 4/8 | 0 | 0 | 8/8 | — | 123.5d |
| ammocensus (neutral recorder) | 3/8 | 0 | 0 | 8/8 | 3/8 | 138.5d |

Cross-check: the ammocensus neutral leg replicates the dawnbid control
leg exactly on national (3/8) and median survival (138.5d) — the same
baseline reproduced independently by two workers. The instrument leg's
4/8 vs 3/8 is the seed-call subject under diagnosis, not a lever claim;
the wall difference between legs on 8 seeds is noise (dawnbid evidence
§Wall). No movement on the wall: table 0, wins 0 everywhere, as in every
prior scale-onramp round.

## Telemetry deviation check

Ran `node scripts/telemetry-check.js` against the scale-wall baseline
for both corpora (`perseed-dawnbid-a-on`, `perseed-ammocensus-a`):
**REFUSED both by shape** — all rows carry top-level `anchorCommit`,
so they are sweep recorder rows, not runs (same pattern as the 0115Z
and 1415Z runs). Baseline NOT rolled. No LOUD lines, no investigation
item — the refusal is the instrument's declared behavior for recorder
corpora, not a deviation.

## Infrastructure

- No lock/claim collision: no fleshout lock at run start; Loop B live
  on winnability chain, untouched throughout.
- Pre-flight: main tree clean, disk 40%. `worktree-reap.sh` ran at
  start (11/16 active, 4 with uncommitted changes — all other loops',
  never touched).
- Worktree registration is slow under load (~7–8 min each: `git reset
  --hard` at ~19% CPU, load avg 9–14 with Loop B + two playtest loops
  sweeping concurrently). Both trees registered clean; heartbeats kept
  fresh.
- Safe-commit index clobber struck the ammocensus worker's commits
  (all 3, repaired via the ls-tree pipe) and the dawnbid worker's
  commits (every one, repaired the same way). Commits verified correct
  in both cases. No write-flap (EPERM) strike this run. No rebase
  stop-at-pick quirk (dawnbid rebased 7/7 clean).
- No `check.js` run: zero `src/` lines across both arms, zero green-list
  files touched — each arm's proof test is its gate (40/40 and 50/50
  green on merged master).
- Master moved twice under the run from sibling lanes (journey endgame
  r219, Loop B aidgate-b NO-GO landing) — zero file overlap with either
  arm; dawnbid rebased clean, ammocensus merged before the move.

## Findings backlog

- #2404 (seeded wave-4 plans never reach the dawn depart) — claimed by
  this run, now **fixed** (DIAG-GO: the decomposition is measured; the
  two downstream gates are named).
- #2405 (ranged weapons with no ammunition) — claimed by this run, now
  **fixed** (DIAG-GO: 50% of ranged fighters dry, census complete).
- #1486 (wave-4 fighters enter without arrows) — **fixed** by the
  ammocensus arm (same census answers it).
- 3 new open items appended by the ammocensus arm (gate over-count
  unmeasured on a small gated subset; sling-stone dominance; spear in
  the ranged slot, 58 persons).

## Metric review

Both arms judged only against their frozen instrument-validity bars —
no re-scoring, no friendlier metric. The dawnbid bars held: the
instrument answered a sharper question than the one it was built for
(the bid/churn distinction came back empty; the loss is downstream of
the bid), which is a valid DIAG outcome, not a metric failure. The
ammocensus bars held; its one caveat (gate over-count 0/19 on a small
gated subset) is recorded as an open finding rather than scored as an
exoneration. No metric revision proposed for the next run.

## Disposition

Both arms LANDED, merged locally pending ship (ammocensus `4761c34bd`,
dawnbid `5b03a5ba4`). No game change lands this run — both landings are
instrument + corpora + evidence. Claim deleted; lock deleted.

scale-onramp stays converging (NOT converged): the wave-4 re-engagement
chain is now decomposed to two named gates, but no lever has moved any
wall number — national still arrives only via the default-OFF courtship
+ seat instruments of earlier rounds, table 0, wins 0 everywhere.
Next blanks, in order: (1) the profile gate as a design call — should a
non-ranger plan holder be able to depart on a `party_launch`, or is the
agencyTick skip the intended shape? (2) companion-pool decomposition per
dawn — which `findCompanion` condition fails, and whether the pool needs
widening (Loop B's second-companion-pool item) or the wait needs
re-shaping; (3) seed-attach on target-null hunt-stage plans (control-leg
finding: the seed bounces on hunt-stage target-null plans); (4) the
gate/expedition-meeting link for launched pairs (Loop B's #2383 line);
(5) family-7 program decision (still open); (6) headcount-ceiling,
wild-Reunion mirror pack, answercourt landing decision, competent
seat-taking BUILD (all Steve-calls, unchanged).
