# sim-selblock-a — EVIDENCE (DIAG GO)

**Arm:** sim-selblock-a · **Loop A run:** fleshout-20261117T2315Z · **Axis:** scale-onramp
**Type:** DIAG (classification only, finding #2498). No game change lands from this arm.
**Branch:** `sim-selblock-a` · **Worktree:** `~/workspace/worktrees/sim-selblock-a`
**Base at arm start:** `77a37fe91` · **Prereg:** `evidence/2026-11-17/sim-selblock-a-prereg.md` (frozen).
**Policy:** competent verbatim (`scripts/policies/competent.js`),
sha256 `df9b7dff4de498779655b04db29782023840d8b2a4ed19a0ecbe86db9c71438c`
**Band:** seeds 103411–103418 (8 seeds) · **Horizon:** 150d death-aware.
**Verdict: DIAG GO** — classification complete (12/12 named, 0 unknown),
instrument D-checks green, OFF-leg replication exact, proof test 26/26.

## The question (finding #2498)

sim-profilegate-b widened the companion profile gate and filled the pool
(empty dawns 81/87 → 3/99), launches rose 3 → 7 instances, but 12
instances now die at `selected-blocked` (OFF: 0) — a party is selected at
dawn and then blocked from departing. This arm says WHAT blocks a selected
party, instance by instance. It classifies; it does not fix.

## Before / after (identical seeds, quoted from the frozen profilegate-b analysis)

| Metric | OFF (control) | ON (PROFILEGATE=1) |
| --- | --- | --- |
| Scored dawns / empty | 87 / 81 (0.931) | 99 / 3 (0.0303) |
| Mean eligible / dawn | 0.08 | 2.98 |
| Launched instances (any-commit) | 3 | 7 |
| **Selected-blocked instances** | **0** | **12** |
| Wave-4+ launch events (secondary) | 8 | 38 |
| Median survival (gameDays) | 147.5 | 116.5 |
| National standing / rank / table / wins | 1 / 0 / 0 / 0 | 1 / 0 / 0 / 0 |

Not re-measured here: this is a DIAG over the profilegate-b corpus, and
the re-analysis below reproduces those numbers exactly (C4–C6 in the
proof test), so the before/after stands as quoted.

## Classification — the answer in one paragraph

A selected party is blocked, in 12 of 12 instances, because **the person
holding the plan cannot walk out of Haven, or the person picked to walk
with them cannot**. The holder is a homebody in 8 of the 12 instances
(and a forager in 3, unknown-profile late joiner in 1): homebodies have
travel range 0, so the dawn bid picks a companion and the depart gate
then refuses the holder themselves — `inviter-range-0` names 6 of the 12
first blocks and 79 of all 113 blocked selections. The remaining first
blocks are scheduling and sickness, not the gate: 3 instances commit at
the last part of the day with no tick left to execute (`no-tick-after-commit`),
1 holder is sick, 1 holder is hurt with no medicine and no healer, and 1
holder does walk out while the picked companion never starts because the
companion is sick. **Zero instances are unexplained.** The pool fill did
not create a new mystery block: it let homebody holders bid at dawn, and
homebody holders cannot depart — the jam moved from "no companion to pick"
to "the picker cannot walk". The fix, if Steve wants one, is a design
call about homebody holders (let them hand the plan to a walker, or stop
seeding/bidding plans on range-0 holders), not a recorder gap and not a
depart-gate bug.

## Per-instance classification table (first blocked selection names the instance)

Classification rule (frozen, from `classifySeed`): the FIRST blocked
selection resolves the instance; every blocked selection is also listed
so a later block is not hidden. Backing row = the depart row (result +
`vidBlock`/`companionBlock`) or skip row that produced the reason.
Profiles come from the nearest `companionPool` member rows.

| # | Seed | Holder [profile] | Target | 1st block day / kind | Companion [profile] | Reason (backing row) | All selections (n) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 103413 | naran_tumen [homebody] | herald | d121 dawn | devon_okafor [forager] | **inviter-sick** — depart `hold`, vidBlock `sick` (census: holderSick true, health 37) | sick 1, range-0 1 (2) |
| 2 | 103413 | omar_farouk [homebody] | influencer | d141 dawn | devon_okafor [forager] | **inviter-range-0** — depart `hold`, vidBlock `range-0` | range-0 8, danger-gate 1, not-at-haven 1 (10) |
| 3 | 103414 | giulia_bianchi [homebody] | eater | d65 mid-day part-1 | app_mgpspjp5330 [forager] | **inviter-range-0** — depart `hold`, vidBlock `range-0` | range-0 28, danger-gate 3, night 2, not-at-haven 2 (35) |
| 4 | 103414 | visjoin_73 [homebody] | reunion | d100 dawn | meera_reddy [forager] | **inviter-range-0** — depart `hold`, vidBlock `range-0` | range-0 24, danger-gate 7, night 1 (32) |
| 5 | 103414 | visjoin_85 [homebody] | eulogy | d105 dawn | giulia_bianchi [homebody] | **inviter-range-0** — depart `hold`, vidBlock `range-0` | range-0 5 (5) |
| 6 | 103414 | visjoin_134 [unknown*] | eater | d137 part-3 | visjoin_131 [unknown*] | **no-tick-after-commit** — sole score row part 3, zero depart/skip rows that day | no-tick 1, companion-range-0 1 (2) |
| 7 | 103416 | david_kim [homebody] | congregation | d85 part-3 | ethan_hunt [explorer] | **no-tick-after-commit** — sole score row part 3, zero depart/skip rows that day | no-tick 1 (1) |
| 8 | 103417 | sofia_chen [forager] | eater | d145 part-3 | visjoin_113 [homebody] | **no-tick-after-commit** — sole score row part 3, zero depart/skip rows that day | no-tick 1, companion-range-0 1 (2) |
| 9 | 103418 | visjoin_58 [forager] | influencer | d70 mid-day part-1 | visjoin_59 [homebody] | **inviter-hurt** — depart `hold`, vidBlock `hurt-no-medicine-no-healer` (census: health 7, not sick) | hurt 1, sick 1, companion-sick 1, companion-range-0 2, no-tick 1 (6) |
| 10 | 103418 | yuki_mori [homebody] | reunion | d71 mid-day part-1 | thabo_maseko [forager] | **inviter-range-0** — depart `hold`, vidBlock `range-0` | range-0 10, danger-gate 1 (11) |
| 11 | 103418 | thabo_maseko [forager] | influencer | d73 dawn | gen_9vcqa7j [forager] | **companion-not-started:sick** — depart `launch`, holder on expedition, companionBlock `sick` | companion-sick 1, companion-range-0 2 (3) |
| 12 | 103418 | visjoin_59 [homebody] | reunion | d77 mid-day part-1 | naran_tumen [homebody] | **inviter-range-0** — depart `hold`, vidBlock `range-0` | range-0 3, selected-not-executed 1 (4) |

\* visjoin_134 / visjoin_131: profile genuinely not in the corpus — neither
ever appears as a `companionPool` member (late joiners; visjoin_134's plan
seeds on day 137, the same day as the block). The daily roster carries no
profile field. The REASON is still named (verified part-3 score row + zero
depart/skip rows); only the holder/companion profile is unknown, and it
does not change the reason.

**First-block tally (the frozen metric):** inviter-range-0 6,
no-tick-after-commit 3, inviter-sick 1, inviter-hurt 1,
companion-not-started:sick 1 — **12/12 named, 0 unknown.** Matches the
profilegate-b analysis sub-tally exactly, verified instance by instance
against the backing rows (not just the summary).

**All-selections tally (113 blocked selections across the 12 instances):**
inviter-range-0 79 (70%), danger-gate 12, companion-not-started:range-0 6,
no-tick-after-commit 4, night 3, not-at-haven 3, inviter-sick 2,
companion-not-started:sick 2, inviter-hurt 1, selected-not-executed 1.
Two things the first-block tally hides: (a) the danger-gate is the
second-most-common block overall (12) — on days the holder's own range-0
does not fire first, a danger veto stops the depart instead (e.g.
visjoin_73 d111–116, six straight danger-gate days); (b) the companion
side of range-0 appears 6 times — a homebody companion picked by a
walking holder also cannot start (e.g. thabo_maseko d76/d81, both
companion visjoin_59/naran_tumen homebodies). The homebody problem is
two-sided: holder-side 79, companion-side 6, and the companion-side
count is UNDERSTATED because on most days the holder's own hold fires
first and the classifier never reaches the companion check.

**Holder profiles:** homebody 8, forager 3, unknown 1. **First-pick
companion profiles:** forager 6, homebody 4, explorer 1, unknown 1.
Across all 113 selections the picked companions are homebody 70,
forager 40, wanderer 1, explorer 1, unknown 1 — the widened gate mostly
picks people who cannot walk (homebodies), which is why the block rate
is so high: the pool filled with range-0 people.

## What each reason means, in plain words

- **inviter-range-0 (6 instances, 79 selections).** The plan holder is a
  homebody (travel range 0) or otherwise cannot leave Haven. They hold a
  wave-4 plan, they bid at dawn, a companion is picked — and the depart
  gate says the holder cannot go. The bid repeats day after day
  (giulia_bianchi: 35 blocked selections over 46 days; visjoin_73: 32
  over 32 days) until the plan is deleted. This is the binding stage,
  and it is structural: the seed call plants plans on any profile
  (86/87 holders non-ranger already, per profilegate-b), the widened
  gate lets any profile be picked, but nothing stops a range-0 holder
  from bidding — or hands their plan to someone who can walk.
- **no-tick-after-commit (3 instances, 4 selections).** The commit is
  made at part 3, the last part of the day; no depart tick follows it.
  All three verified: exactly one score row that day, part 3, commit
  `party_launch`, zero depart rows and zero skip rows. Two of the three
  holders are nearly dead (visjoin_134 health 11, david_kim health 4 on
  the census) and the third (sofia_chen, health 55) was already on an
  expedition that day. A scheduling edge, not a gate: the bid arrives
  too late in the day to act on.
- **inviter-sick (1) / inviter-hurt (1).** The holder is sick (naran_tumen,
  health 37, census holderSick true) or badly hurt with no medicine and
  no healer in camp (visjoin_58, health 7). Honest gates: a sick or
  dying holder should not walk out. These two are the system working
  as designed.
- **companion-not-started:sick (1 instance first, 2 selections total).**
  The holder DOES walk out (thabo_maseko d73, census holderExped true)
  and the picked companion never starts because the companion is sick.
  The party of one still departs — the launch is recorded — but the
  instance counts as blocked because the companion never joined. Same
  shape for the 6 companion-range-0 selections: holder walks, homebody
  companion stays.
- **danger-gate / night / not-at-haven (0 first-blocks, 18 selections
  total).** Secondary blocks that fire on days the primary block does
  not: a danger veto at the door, night falling before the depart, or
  the holder away from Haven when the tick runs. Real gates, never the
  first block of an instance — which is why they do not appear in the
  first-block tally.
- **selected-not-executed (0 first-blocks, 1 selection).** visjoin_59
  d80: a mid-day part-1 commit with no depart or skip row at all. The
  plan was deleted the same day (close plan-deleted@80) — the commit
  happened and the plan vanished before any tick could execute it. A
  plan-deleted-same-day artifact, not a missing instrument row.

## Instrument verification (what was checked, and what could have fooled it)

- **No hidden unknowns.** Across the whole ON corpus, 399 depart
  `hold` rows carry `winPlanAction: party_launch` and ZERO have
  `vidBlock: unknown` — every hold names its block. The `unknown`
  bucket (`inviter-exped-failed-unknown`) fires nowhere in the 12.
- **Duplicate depart rows are one event, not two blocks.** Several
  blocked days carry 2–3 identical depart rows (same result, same
  blocks) — the brain execute wrap logs once per execute call and a day
  can run the depart more than once. The classifier takes the first
  matching row; duplicates never change a reason (verified: deduped
  rows agree on every instance). The `companionBlock: unknown` that
  appears beside a `range-0` holder block means only "the replica found
  no block for the companion" — the holder's hold is what blocked, and
  the companion check never runs.
- **The three no-tick cases are real, not missing rows.** Each has
  exactly one score row that day (part 3, `party_launch`) and zero
  depart/skip rows — the recorder logs every execute call for a wave-4
  holder, so zero rows means no tick ran after the commit, not a
  dropped row.
- **D1 repeatability GREEN.** Seed 103411, 60d, VETREENGAGE=1,
  PROFILEGATE unset, recorder ON, run twice on this tip
  (`perseed-selblock-a-d1a` / `-d1b`, scratch, deleted after comparison):
  trajectories identical except the `run` label — the only byte-level
  difference between the two files. Both: 60d, survived, standing 175,
  regional, maxWave 4, 41 deaths, 0 instrument errors.
- **D2 wrap neutrality GREEN.** Same seed/days, recorder OFF
  (`perseed-selblock-a-d2`, MODE rec0): daily snapshots deep-equal,
  deaths deep-equal, fingerprint (days/gameDays/standing/maxWave/
  death-count/endReason/pantry) identical to the recorder-ON run.
  (Note: at 60d on seed 103411 the funnel has not started yet —
  `v4seeds` 6, `dawnbidCensus` 0 — so D1/D2 prove trajectory identity,
  not depart-recorder exercise. That is the frozen profilegate-b D2
  shape, kept as specified in the prereg.)
- **OFF-leg replication EXACT.** Re-running the analyzer over the
  existing OFF corpus reproduces the frozen analysis on every compared
  field (funnel buckets, funnel subs, pool shape, wall incl. deaths
  517 / starvation 5, median 147.5). The ON re-analysis matches the
  frozen ON summary the same way (funnel, subs, pool, wall incl.
  deaths 786 / starvation 3, median 116.5). Proof test C4–C6.
- **Proof test green: 26/26** (`scripts/test-selblock-a.js`): 6 static
  (src/ diff empty, lever reverted, prereg + evidence exist), 13
  analyzer fixtures (one synthetic instance per frozen bucket + the
  unknown bucket + first-block precedence), 6 corpus checks (12
  selected-blocked / 0 unknown / frozen sub-tally / OFF + ON
  replication). One service restart mid-run killed the first D1a
  driver run (empty output dir, no file); re-run clean — no write-flap
  EPERM struck this run.

## Village assessment (plain words)

Eight villages, same eight on both legs. The widened gate did what it
was asked to do — the dawn pool filled, and foragers and homebodies got
picked. But look at who holds the plans: mostly homebodies. Giulia
Bianchi holds a plan to kill the Eater for 47 days and bids for a
companion 35 times, and 28 times the morning ends the same way — she
cannot leave Haven, so nobody leaves. Her village watches the same bid
break every morning for a month and a half. visjoin_73 is the same story
for 32 days against Reunion. These are not people failing to act; they
are people the game lets plan a walk they can never take. The three
forager holders show the other edges: one bids at the last hour of the
day and the day simply runs out (sofia_chen), one walks out alone
because the companion she picked is sick (thabo_maseko), one is too hurt
to stand (visjoin_58, health 7). The villages are not short of plans or
companions any more. They are short of walkers holding the plans — and
of anyone, person or System, noticing that the holder cannot walk and
doing something about it: handing the plan on, or not bidding it.

## Sense-testing (SENSE-TESTING LAW)

Read the transcripts. The fiction is alive where the game acts and
silent exactly where this stage blocks. On the blocked days, the
`vetSays` stream talks about door fights ("Giulia and Enrique met them
at the door — 2 put down"), veteran kills on camera, and teaching
("Yuki taught everyone about Ground Elder") — 15 lines across the
blocked days of seeds 103413/103414/103418, and **not one of them says
a picked party stayed home, or why**. The homebody silence profilegate-b
noted for Jesse Cortez (picked day 78, stays home, zero lines) holds
across all 12 instances: no line ever names a blocked departure. The
bid reads as a promise the morning breaks silently — now measured
across 113 broken selections, not one anecdote. Finding #2499 (picked
homebody gets no fiction line) stands, and this arm extends it: the
silence covers every block reason, not just range-0.

## Metric review

- **The frozen bar was met with margin, not scraped.** 12/12 named
  against a bar of ≥10, unknown 0 against a bar of ≤2. The
  profilegate-b sub-tally (6/3/1/1/1) survived per-instance
  verification unchanged — no sub-reason failed its backing-row check,
  so the prereg's "a sub-reason that fails counts as unknown" clause
  never triggered.
- **First-block vs all-selections is the honest tension in the metric.**
  The frozen metric judges the first block per instance, which is what
  the funnel reports — but the all-selections tally is where the
  design question lives (danger-gate 12, companion-range-0 6, both
  invisible in the first-block tally). A future arm that judges a fix
  should pre-register on BOTH: first-block share AND all-selection
  share, or a fix that only moves the first block will look like a win
  while the same mornings keep breaking one tick later.
- **D1/D2 at 60d do not exercise the depart recorder** (no wave-4
  census rows by day 60 on seed 103411). The prereg kept the frozen
  profilegate-b D2 shape deliberately; the instrument's depart-side
  validity rests instead on the corpus checks (399 hold rows, 0
  unknown vidBlock) and the fixture suite (S1–S13). A future arm that
  changes the recorder should D-check at 150d on a seed with live
  departures, not 60d.
- **No re-run, no lever, no panel — by design.** The corpus already
  carried the depart-gate state, so the prereg's contingency (add a
  skip-reason capture, re-apply PROFILEGATE, re-run the band) never
  triggered. The classification is a pure re-read of the frozen
  measurement, which is why the OFF/ON replication checks matter more
  here than a fresh sim would.

## Wall numbers (scale-onramp axis, quoted from profilegate-b)

National standing 1/8 each leg, national rank 0/8, table 0, wins 0,
wave 4 unlocked 8/8, wave 5 unlocked 1/8, median survival 147.5d OFF vs
116.5d ON. The wall did not move — and this arm says why one piece of
it does not: the launches the widened gate buys are capped by holders
who cannot walk, so the launch funnel stalls at selection even when the
pool is full.

## Finding #2498 — claim for the coordinator

**#2498 CLASSIFIED (DIAG GO, no fix in this arm).** Selected-blocked is
the homebody-holder stage: 6/12 instances first-block `inviter-range-0`
(79/113 selections), 3/12 `no-tick-after-commit` (part-3 commits), 1
each `inviter-sick`, `inviter-hurt`, `companion-not-started:sick`;
0 unknown. Next lever (a design call, not this arm): either stop
range-0 holders from bidding (or from holding wave-4 plans), or hand a
range-0 holder's plan to a walker — plus a fiction line when a picked
party stays home (extends #2499 to every block reason). The
`no-tick-after-commit` edge (part-3 commits with no tick left) is a
separate small fix candidate: do not accept a `party_launch` commit
after the last depart tick of the day.

## Disposition: DIAG GO — nothing to revert

No src/ change was made at any point (verified: `git diff` vs base
empty; proof test static checks). No lever was re-applied. Commits are
instrument + evidence only: prereg `3c10f03b8`, plus this evidence and
`scripts/test-selblock-a.js` (to be committed by this run's closeout).
Net src/ diff vs base: zero.

## Files

- Prereg: `evidence/2026-11-17/sim-selblock-a-prereg.md`
- Evidence: `evidence/2026-11-17/sim-selblock-a.md` (this file)
- Proof test: `scripts/test-selblock-a.js` (26/26 green)
- Corpus read (not re-run): `evidence/2026-11-17/perseed-profilegate-b-on/`
  (8 files), `perseed-profilegate-b-off/` (8 files),
  `evidence/2026-11-17/profilegate-b-analysis.json`
- D-check scratch legs (`perseed-selblock-a-d1a/d1b/d2`, 60d seed 103411):
  compared and deleted, not committed.
