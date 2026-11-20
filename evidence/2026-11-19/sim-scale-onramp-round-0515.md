# sim-scale-onramp round 0515Z — ADOPTION CLOSEOUT of timed-out run (2 NO-GO, both LANDED)

**Run:** fleshout-20261120T0515Z, Loop A, axis scale-onramp
**Adoption closeout:** the coordinator timed out at ~07:17Z before bookkeeping.
Both arms were already built, judged, and merged locally; this adoption
verifies them from the commits, re-runs the gate fresh, writes this round
record, and deletes the claim + lock.
**Base at round start:** master 8cd4c0181 (ship bump 0d925556a is the
version-bump commit on top of it). **Master at adoption close:** bdebb2259
(Loop B sim-dmgshape-b landed on top of both arms during the adoption;
the gate below ran on that tip, so it covers both arms + the sibling
landing).
**Claim:** `lever-claims/fleshout-20261120T0515Z.json` (arms
sim-searsupply-resume-a + sim-bowsee-a) — deleted at closeout.
**Lock:** `fleshout-loop.lock` held run_id `fleshout-20261120T0515Z`
(2026-11-20T05:15:00Z) — deleted LAST, same call as the read.

## Arms

### Arm 1 — sim-searsupply-a: NO-GO (SUPPLY), lever REVERTED

Resume of the 0215Z HALTED pilot (3/16 seeds) to the full 8×2 pilot on
fresh band 107051–107058, 150d, competent verbatim, substrate
SENSEEXPED=1 + PARTYSIZE4=1 + VETREENGAGE=1 + FLEEREPAIR2=1 +
FIGHTALLY2=1. SEARSUPPLY=1: contest-prize searcaster grants bundle +2
fusion cells; searcaster/cell prizes redirect to the most fight-proven
living villager; tier-4 cell weight 1/15 → 4/18. Draw-neutral by
construction (zero new `Math.random` draws). Proof test 32/32 GREEN
(pre-revert, re-proven on the resume base); analyzer selftest 45/45.

Frozen bars (full band, analyzer judge):

| Bar | Ctl | Arm | Result |
|---|---|---|---|
| 1. Searcaster-holder-days ≥ 40 | 23 | 22 | FAIL |
| 2. Armed-holder entries ≥ 3 | 0 | 4 | PASS |
| 3. Armed volleys fired ≥ 1 | 0 | 0 | FAIL |
| 4. Guardrail (exposure-normalized) | 6.72 deaths/engaged, median 150d | 4.56 (bar ≤ 7.40), median 150d (bar ≥ 120) | PASS |

The lever fixed the cells and not the gun: cell appearances 13 vs 2,
grants 9 vs 3, cell-holder-days 316 vs 0 — but 1 searcaster grant per
leg, so holder-days cannot clear a 40-day floor. The one gun that did
arrive was delivered as designed (day-128 contest prize redirected to
ella_johnson + 2 cells, 22 holder-days, 4 wave-4 entries) and never
fired — she never leads; on day 150 the lead fires a crude-bow volley
(2 shots, 29 damage) while her searcaster (64–68 per hit) sits in the
second row. The balanced-panel `review_required` is the retired
raw-deaths metric (arm met more monsters: 191 vs 123 engaged); the
frozen exposure-normalized guardrail is the judge. Game code reverted
before commit (`src/js/contests.js` −66 lines, `src/js/game.js` −12
lines; 0 `SEARSUPPLY` refs in `src/js/` — verified by grep in this
adoption). Evidence: `evidence/2026-11-19/sim-searsupply-a.md`
(+ prereg, analysis, panels, 16 corpora). Commit `0fd416c5d`
(ancestor of master — verified).
Finding #2599: stays ANSWERED at the supply level; the next lever must
raise the GUN rate itself (searcaster-weighted tier-4 contest prize, or
more tier-4 prizes reaching villagers) AND weight the recipient toward
expedition holders, who are the leads. A cells-only lever cannot move a
holder-days floor set by the gun's grant rate. The #2599 findings entry
was already updated by the coordinator before it timed out.

### Arm 2 — sim-bowsee-a: NO-GO (served-short + partition drift), lever REVERTED

Finding #2590's serve half, third knowledge lever in the chain
(speargate GO → spearstage SERVED 0 → bowknow SERVED 0 → bowsee SERVED
2). DEPARTSEE=1: at the departure craft attempt only, if a party-mate
has an EQUIPPED volley-capable bow, the crafter gains lv[bow] = 1
(`weapon_see` telemetry + witnessed line when the scholar is home).
Proof test 39/39 GREEN (pre-revert); analyzer selftest 51/51. Band
107051–107058 REUSED (paired before/after on identical seeds, one flag
apart); substrate adds BOWOPEN=1 + SPEARGATE=1, BOWKNOW unset both legs.
The ctl leg reproduces the bowknow ctl corpus EXACTLY on all 8 seeds.

Frozen bars:

| Bar | Result | Pass |
|---|---|---|
| 0. Pool floor: arm spearSeen ≥ 10 | 111 | YES |
| 1. Gate replication arm 1.000 | 111/111 | YES |
| 2. Gate replication ctl 1.000 | 108/108 | YES |
| 3. alreadyHad consistency ±3 | 195 vs 195, delta 0 | YES |
| 4. noSource consistency ±3 (partition) | arm 259 vs 253, delta 6 | NO |
| 5. SERVED: arm.staged − ctl.staged ≥ 3 | 2 − 0 = 2 | NO |
| 6. Volley-rate rise ≥ +0.10 | 0.435 − 0.333 = +0.101 | YES |
| 7. Starvation ≤ ctl + 2 | 2 vs 3 | YES |
| 8. Median survival ≥ 0.8× ctl | 150d vs 150d | YES |

Departure-site seeing seeds — and the craft starves for materials: 17
departures seeded (5 spear-holders), all 5 seeded spear-holders land in
noSource in the same call. One clean attributable chain (107054:
seeded day 97, departs again day 103, crafts a crude bow); the other
staged bow is RNG-divergence, so the attributable SERVED is 1, not 2.
The volley bar passes on drift sling volleys, not served bows (neither
served villager fought a wave-4+ meeting) — recorded as a pass, not as
mechanism proof. The wall is materials, not knowledge: 55 spear-holders
already knew the bow on ctl and all 55 went without. Game code reverted
(0 `DEPARTSEE` refs in `src/js/` — verified by grep; the bowsee commit
carries zero src changes). Evidence:
`evidence/2026-11-19/sim-bowsee-a.md` (+ prereg, analysis, panels, 16
corpora). Commit `6d1308c95` (ancestor of master — verified).
Finding #2590: stays OPEN on the serve half. Next lever named:
**departure-site materials** (a pile reservation / materials check at
the craft attempt, or the 35% blind roll) — judged on
attributable-SERVED with a served-bow volley join. Knowledge seeding is
proven non-binding and should not be re-tested as the serve path. The
#2590 findings entry was updated by THIS adoption (the coordinator's
findings update covered #2599 only).

## Wall numbers (this round)

- Searsupply band (16 configs): national 0/16, wins 0/16, wave 4
  16/16, wave 5 7/16 (ctl 4/8, arm 3/8), median survival 150d both
  legs, community lost 3/8 per leg. Standing pinned at the 199 wave-4
  floor on 4/8 ctl seeds and 5/8 arm seeds.
- Bowsee band (16 configs, same seeds): national 0/16, wins 0/16,
  wave 4 8/8 both legs, wave 5 4/8 both legs, median 150d both,
  community lost 2/8 both. Deaths 854 ctl / 867 arm.
- Scale-onramp stays converging (NOT converged): two supply/serve
  levers killed cleanly on measured bars; nothing reached national or
  the table on either band.

## Gate

`node scripts/check.js --quick` re-run FRESH by this adoption on the
merged tip bdebb2259 (both arms + Loop B dmgshape-b): **339 passed, 5
failed in 713s, 0 attributable.** Log:
`evidence/2026-11-19/check-quick-round-0515.log` (the coordinator's
partial 1-line log was superseded by this fresh run; the stale untracked
main-tree copy is removed by this commit's worktree flow — the branch
version supersedes). The 5 failures are exactly the standing set:

1. `test-measurement-proof-update.js` — "Proof source inputs are not
   current" (staleness pair; proof re-sign round 22 still owed).
2. `test-measurement-workflow.js` — "retained neutrality proof covers
   the current Game/controller/harness inputs" (staleness pair).
3. `test-living-garden-deed-attainment.js` — 120s timeout.
4. `test-phone-frame-proof.js` — stale receipt.
5. `test-one-person-army-deed-attainment.js` — 120.1s timeout.

Zero mentions of searsupply / bowsee / departsee in the failures; both
arm commits carry zero live `src/` lever code (reverted), so the gate
outcome on this tree is identical to base by construction. The
searsupply arm's own worktree-level gate (338/6, all 120s timeouts)
agrees.

## Telemetry

`telemetry-check.js` was run by the coordinator on both arms, both legs
(logs `evidence/2026-11-19/telemetry-round-0515-sear.log` /
`-bow.log`, committed by this adoption, md5-verified against the
coordinator's copies): the tool **refuses recorder-corpus input
verbatim** — all 8 rows per leg carry top-level `anchorCommit`, so they
are sweep recorder rows, not runs; exit=2, no LOUD deviations, no
baseline rolled. Same refusal as the 2130Z adoption; the tool is working
as designed. No `telemetry-baselines/` dir exists in the main tree, so
no deviation check could run on these corpora.

## Metric review (§14)

- No bar was re-scored on either arm; both verdicts are the frozen-bar
  judges on the full bands.
- Searsupply: bar 1's floor measures the gun's grant rate, which the
  lever never touched — a supply lever that cannot move its own floor is
  mis-sized, not mis-measured. Revision: a lever that moves the gun
  rate itself, and a bar that counts grants as well as holder-days.
  The redirect heuristic is mis-aimed for bar 3 (picks a proven
  fighter, not a lead) — revision: a lead-weighted recipient.
- Bowsee: the partition formula's hidden assumption (equal total
  departures and equal craftedFail across legs) is false — proven false
  twice now (bowknow +4/+4, bowsee +3/−3 → delta 6). The next arm
  judging a knowledge/RNG-consuming lever must use a drift-tolerant
  consistency bar (rate-based, or a tolerance that prices in the drift)
  and say so in its prereg. The volley bar counts any share rise — a
  future arm should judge volley attribution (served-bow volleys), not
  the raw share. SERVED counts all staged bows, not attributable ones
  — the next arm should judge attributable-SERVED beside the frozen
  count and pre-register which one binds.
- The panel's raw-deaths flag on searsupply is the retired metric
  resurfacing in the panel instrument — it must not be re-introduced as
  a guardrail at judging time.

## Infrastructure

- VM restart ~07:19Z (uptime 12 min at 07:31Z) hit this adoption's
  start: worktree registration took ~18 min (`git reset --hard`
  starved under load 12–19; the worktree was half-populated for most
  of it). Registration completed clean; no work lost.
- The 0215Z adoption had already closed before this round started
  (its tracker review records claim + lock deleted; this adoption
  verified the lock file held 0515Z, not 0215Z, and no live 0515Z
  coordinator process existed — both arm trees `done-merged` in the
  registry, heartbeats 07:10–07:11Z).
- Write flap: none observed during this adoption (fresh-file + evidence
  writes probed OK at 07:45Z, ~26 min after the restart).
- Safe-commit index clobber: (recorded here if it strikes; repair via
  the ls-tree -r pipe, verify status empty + diff HEAD empty).
- Master moved twice during the adoption: Loop B dmgshape-b landed
  bdebb2259 on top of the arms; the gate ran on the new tip. The
  searsupply + bowsee merges themselves were ff-only and clean.

## Closeout

- Findings: #2599 searsupply update (coordinator, pre-timeout);
  #2590 bowsee update (this adoption).
- Tracker: scale-onramp review appended by this adoption (re-read
  immediately before writing; sibling Loop B wrote its 0130Z adoption
  review above during this run — untouched).
- Claim deleted; lock deleted LAST (same call as the read, run_id
  match). Worktree released done-merged, branch deleted.
- Evidence: this file + `evidence/2026-11-19/check-quick-round-0515.log`
  + `evidence/2026-11-19/telemetry-round-0515-*.log/.err` (committed
  by this adoption).
