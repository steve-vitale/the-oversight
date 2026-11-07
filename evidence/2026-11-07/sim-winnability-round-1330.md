# sim-winnability-round-1330 — Loop B 1330Z round evidence

**Run:** fleshout-loop-b-20261107T1330Z · **Axis:** scale-onramp / winnability
chain · **Loop A live** on food-economy the whole run (1205Z,
sim-preserverleg2-a + sim-awayconfirm-a), NOT touched · **Claim:**
`lever-claims/fleshout-loop-b-20261107T1330Z.json` (deleted at closeout) ·
**Lock:** `fleshout-loop-b.lock` (deleted at closeout) · **Base at run start:**
c92a873f4 (master) · **Base at merge:** 4b99c6d12 (main-session round
evidence 0530 landed mid-run; takeseat rebased onto it clean, proof re-run
green) · **Final master:** 4cf289fd5.

**Arms:** (1) sim-takeseat-b — the sit drive (1230Z next blank #1), GO,
LANDED; (2) sim-feastcost-b — feast-drive cost taming with pair-days in
the cost bar (1230Z next blank #2), NO-GO, KILLED, branch deleted per the
killed-arms rule. Both policy-side, shared frozen band 53001–53008, 150d
death-aware. Re-point queue status: arm-2 toggle CLOSED, flee-repair is a
Steve call, standing accumulation answered by the veterans-lock
decomposition (unchanged).

## Arm 1 — sim-takeseat-b: GO, LANDED 4cf289fd5

Full evidence: `evidence/2026-11-07/sim-takeseat-b.md` (prereg
`sim-takeseat-b-prereg.md`, panel `takeseat-panel.md`, corpora
`perseed-takeseat-b-baseline/` + `perseed-takeseat-b-armed/`, 16 files, 0
instrument errors). Branch commits (rebased onto 4b99c6d12): prereg
ece7d8607, tooling 8efa4f70d, evidence 88ab24441, corpora 4cf289fd5. Proof
`scripts/test-takeseat-b-20261107.js` 23/23 green on the branch after
rebase AND on merged master.

The sit drive (new composite `scripts/policies/competent-linkfeast-b.js`:
frozen staged + linkdrive + feastdrive, both unmodified; sit drive
`TAKESEAT_B=1`, default OFF; zero src/js, zero policy edits) calls the
real `Game.tableTakeSeat()` verb on a preview-ready day, sampling at the
decision point 3× a day so encounter blocks are waited out.

Frozen bars, all passed: tables sat **5/8 armed vs 0/8 baseline** (sits
d90/90/90/93/94, all lesser, 5–6 doors offered, 0 entered by design);
substrate sanity baseline earns lesser 5/8; substrate guard **8/8
per-seed exact** (3 never-sat whole-run, 5 sat pre-sit over 87–91 days
each); cost bar — starvation 3→1 (arm-only 0), median survival
116.5d→**150d**, pair days 17→**65**. Panel `review_required`, no
regression signal (villageDeaths −5.375/run, communityLost 0.875→0.375).

What the run showed beyond the bars: the modal does not stall (runs
continued 7–60 days after every sit, `tableChoices` surfaced every
post-sit day). Sitting saves villages via sanctity — 4/5 sat villages
live to 150d where baselines died at 115–130d; 53006's standing climbs
399→834. But it is not safety: 53005 sat d90 and died d97 exactly as
baseline; 53003's sitter (David Kim) died the day he sat and his
successor killed a wave-5 Rerun on d113; 53006's successor died to
wave-5 Timeslot on d123 and succession carried the sitting on. Feast
draws keep fighting under sanctity (invited, not ambient): post-sit
wave-5 kills on 53003 (d113) and 53006 (d121). Sense-test: audits name
real deeds per run; villagers discuss the ring on d89, a day before
the day-90 floor — a floor leak in conversation content. Three
findings appended to `sim-findings.md`: sitter-dies-mid-sitting,
feast draws under sanctity, pre-day-90 table-talk.

## Arm 2 — sim-feastcost-b: NO-GO, KILLED (branch deleted)

Full evidence was on branch sim-feastcost-b (prereg 5c9a9d585,
policy+tooling fbe5b9c97, evidence+corpora ed695dd4e; proofs
`test-feastcost-20261107.js` 28/28, `test-feastcost-panels-20261107.js`
22/22, re-baseline reproduces the frozen staged baseline exactly).
**The branch is deleted and the variant is not landed** — killed arms
leave no trace. The verdict and mechanisms are recorded here and in
the findings backlog (#1869/#1870 updates, new #1872).

The tame (cumulative-gives-since-arming: the giving gate counts
cumulative gives since arming instead of a rolling 7-day window,
plus the donate-down keep) keeps the deed but does not tame the
cost: `foodDeeds` **5/8** (bar ≥4, PASS), pair days **28** (bar ≥35
of 62, FAIL — all 28 on 53004), survived **0/8** (bar ≥2, FAIL),
starvation 5 (PASS), median 98d (PASS). Panel `review_required` with
a regression signal: community loss 0.625→**1.0**, deaths/100d
63.6→69.6 (regression_watch), survival60 1.0→0.875.

Three corpus-proven mechanisms: (1) the dump is whole, not capped —
`donateDownToKeep` dumps the entire surplus above keep in one call
(53005: 9,900 kcal in a single transfer); donations fall only
54,045→35,930, not to the ~9,000 the prereg predicted (secondary
expectation wrong — recorded in metric review, no re-scoring).
(2) The cumulative gate is per-bearer, and bearers die — 53002's
1,860-kcal trickle fragments across 14 scholar deaths (240 / 30 /
1,290 / 300); the longest single-bearer run reaches 1,290 < 1,500,
so the gate never opens; 53001/53003 still donate 0. **#1870 stays
open** — a lean-seed fix must count gives per-village, not
per-bearer. (3) The fight half binds — feasts 19 (vs 21), faced
6/15 (vs 10/18); 53007 feasts 4× in 12 days, draws 4 scavengers,
dies d78 where both other legs lived to 150. **#1869 stays open** —
next arm should be a feast-frequency cap, same pair-days cost bar.
Sense-test: feast nights read like people, but the kill-story
template repeats up to 5× a night (new finding #1872, same repeat
class as #1278).

**Correction (coordinator-verified):** the 1230Z evidence's feastdrive
donated total is **54,045 kcal, not 53,845** — a 200-kcal arithmetic
slip; its own per-seed column sums to 54,045 (52,185 on the five
feast seeds + 53002's 1,860).

## Wall (takeseat corpora — the judged round)

National / table-sat / wins: baseline **0 / 0 / 0** → armed
**0 / 5 / 0** · Wave-4 unlocks 7/8 → 7/8 · Wave-5 unlocks 3/8 → 4/8
(53006 joins) · Wave-5 kills 0 → 2 seeds (53003, 53006) · Lesser
seats earned 5/8, sat 0/8 → 5/8 · Full seat 0/8 → 0/8 · Median
survival **116.5d → 150d**. Feastcost corpora (for the record):
national / table / wins 0 / 0 / 0; wave-4 unlock 8/8, wave-5 1/8.

## Telemetry deviation check

`node scripts/telemetry-check.js` on the takeseat armed corpus
REFUSES recorder-corpus input by design (same refusal as
sitstep2/feastdrive — "all 8 --current rows carry top-level
anchorCommit"). No LOUD line, no deviation signal; zero src/js
changed, so no Game-telemetry baseline exists to deviate from.

## Infrastructure

- Registry flock jammed most of the run (Loop A's
  sim-awayconfirm-a registration held fd 200 through the reaper;
  registrations ~8 min and ~3 min; the reaper itself took ~90s at
  open and ~5.5 min at closeout). No tree was at risk (4h reaper
  threshold; both trees heartbeated).
- Own goal (recovered): the coordinator launched a duplicate
  reaper in a second exec; killed the duplicate waiter (its flock
  child + bash) before it acquired the lock. No registry effect.
- Master moved once under the run (main-session round evidence
  0530, 4b99c6d12, 1 file, zero overlap); takeseat rebased clean
  (4/4 picks), proof re-run green, ff-only merge.
- Safe-commit index clobber hit all four takeseat commits, all
  three feastcost commits, and (per worker reports) was repaired
  via HEAD-blob cacheinfo each time, verified status empty + diff
  HEAD empty + hash-object matches. Coordinator commit below to
  be verified the same way.
- check.js --quick NOT re-run: zero src/js in either arm; the
  standing 280/7 pre-existing profile was just recorded by
  sibling runs on this master.

## Convergence

**scale-onramp: converging, NOT converged.** The chain now runs end
to end through a TAKEN seat: 5/8 lesser seats sat on the first ready
day (or within 3), the modal harmless, the guard 8/8, sitting
partly recovering the feast drive's pair cost (17→65 pair days).
But no village has walked a door (0/8 entered), no win exists
(0/8), national is 0/8, the full seat is 0/8. Next blanks, in
order: (1) the door arm — walk an earned door (binding blank);
(2) a feast-frequency cap with the same pair-days cost bar,
judged WITH sitting in the loop (sitting recovers pairs, so the
tame must be measured on the sat substrate, not the pre-seat
one); (3) the national Binding (LEAD realm formation); (4)
sitter-dies-mid-sitting, feast draws under sanctity, pre-day-90
table-talk — all Steve calls; (5) lean-seed giving must count
per-village, not per-bearer (#1870). food-economy stays
converging (NOT converged): untouched by this run (Loop A live).
Claim deleted; lock deleted.

Evidence: this file (coordinator round evidence) + arm evidence
`evidence/2026-11-07/sim-takeseat-b.md` (commit 4cf289fd5) and the
deleted feastcost branch's verdict recorded above (commits
5c9a9d585 / fbe5b9c97 / ed695dd4e, branch deleted per killed-arms
rule; findings backlog holds the mechanisms).
