# sim-staying-b — GATE-NO-GO at fixture stage (no pilot spent)

Arm: PARTY-AS-ONE-BODY (T tile joining + P party wound floor + S shared
blows + H party hopelessness hold + M simultaneity), all-or-nothing at
pilot, per prereg `evidence/2026-10-29/sim-staying-b-prereg.md`.

## Verdict

**GATE-NO-GO.** The fixture gate requires all three legs; leg (a) fails
decisively, so per prereg no pilot sweep was spent, the game code was
killed (reverted), and the proposed party-wound-floor ruling is
**withdrawn** with the code. Evidence + scripts stay; the full rule is
preserved only as `sim-staying-b-game-code.patch` for audit, not as live
code. No merge, no push, no version bump, no live claim.

- GATE (a) wounded kills >= 20/40: **FAIL — 0/40**
- GATE (b) fresh median party survival >= 4 rounds: PASS (4)
- GATE (c) solo identity (solo fixtures byte-identical to base): PASS

## Staged fixture table (40 fights per cell, full rule = stage 5)

| stage | rule | party wounded kills/drives/dies | party wounded roundsMed/mDealtMed | party fresh kills/drives/dies | party fresh roundsMed/mDealtMed | solo identity |
|---|---|---|---|---|---|---|
| 0 | base | 0/26/0 | 3 / 173 | 0/1/0 | 2 / 126 | baseline |
| 1 | +T tile joining | 0/26/0 | 3 / 173 | 0/1/0 | 2 / 126 | identical (summary) |
| 2 | +P party floor | 0/26/0 | 3 / 173 | 0/1/0 | 2 / 126 | byte-identical |
| 3 | +S shared blows | 0/25/0 | 3 / 173 | 0/0/0 | 2 / 123 | byte-identical |
| 4 | +H hopeless hold | 0/30/1 | 3 / 176 | 0/0/1 | 4 / 203 | byte-identical |
| 5 | +M simultaneity (FULL) | 0/29/4 | 3 / 177 | 0/0/4 | 4 / 208 | byte-identical (--gate PASS) |

Reading, in plain words: putting the whole party on one shared health
line, sharing the blows, refusing to run while allies stand, and striking
first still does not kill a wounded wave-4 beast. The held parties deal
about 177–208 damage where 300 is needed for a wounded beast and 700+
for a fresh one. The hold does buy survival (fresh parties last 4 rounds
instead of 2), but survival without killing power converts fled fights
into deaths at the margin (4 deaths per cell at stage 5 vs 0–1 before) —
the retreatdiag warning, measured, not just predicted.

What each facet did, alone in sequence:
- T (tile joining): nothing at size 2 — byte-identical to base, as
  designed (the refactor is behavior-preserving; its value would be
  larger tile parties, which the pilot would have measured).
- P (party floor): nothing at size 2 — the leader still breaks, or the
  hopeless branch fires first, in the same rounds.
- S (shared blows): roughly neutral — one drive-off flipped each way;
  redistributing damage does not add damage.
- H (hopeless hold): the only facet that moved survival — fresh
  roundsMed 2 → 4, damage 123 → 203, and more drive-offs on wounded
  beasts (25 → 30), at the cost of 1 death per cell.
- M (simultaneity): no kill gain; deaths 1 → 4 per cell, most plausibly
  RNG-reshuffle noise on 40-fight cells (phase order swaps which draws
  land where), not a systematic effect — medians barely moved.

## Base-leg break decomposition (the arm's own base corpus)

Control shape reproduced EXACTLY (extracts-base.json, checksummed):
meetings 1272, judgedA 24, kills 0, wall won 3, natEver 7, entered 3,
median 146d, deaths 286, recorder errs 0/0. Base judged fights are ALL
solo (0 party fights on the judged cut — no shout join ever fired there).

24 fought wave-4 field fights, engine-true break taxonomy (fleeLearn is
also set by the wound-floor branch for learning villagers, grep-proven
in fieldFights.js, so round-1 learn-intent flees count as wound-floor):
- PARTY-DEATH (leader died): 8/24 (3 in round 1 — wounded leaders
  entering fights die to a single 60–71 hit)
- HOPELESS (trajectory flee, round >= 2): 9/24
- WOUND-FLOOR (below the bravery line): 7/24 — ALL round 1
- LEARN-WITHDRAWAL (round >= 3 learn exit): 0/24 — the learn branch
  never fired on the judged set
- OTHER: 0
- Round-1 ends: 10/24 (7 flees + 3 deaths)
- Solo medians: rounds 2, damage dealt 9 (vs ~1000-HP beasts — the wild
  survival gap is wider than the kitted-fixture gap)

## Sense (full rule, fixtures — read, not just counted)

SENSE 2, fresh audit party (vFlee, 3 rounds, 166 dealt, partyHold=true)
is the rule working as specified and showing its limit:

> "the person in their 60s, with restless hands is already here —
> charges in with [the leader]!"
> "the person in their 30s, with thick glasses looks at the person in
> their 60s, with restless hands standing with them — and does not run.
> Not while they stand."
> R3: "[ally] strikes for 4", then "Assessment hits [ally] for 70
> (0 left)", "[ally] goes down!", then "[leader] sees how this ends —
> and runs while running still works."

The hold buys one round; the ally dies; the leader, alone again, flees
honestly. A played fight between people, not a number — and still not
a kill. SENSE 1 (wounded influencer party, mFlee, 4 rounds, 212 dealt,
partyHold=false) shows the tile join and shared blows reading cleanly
(the ally soaks 34 then 66 and goes down; the beast breaks at 88 HP).

## What this kills, and what it does not

- KILLED: PARTY-AS-ONE-BODY as a kill lever, all five facets together.
  The party-wound-floor ruling proposed in the prereg is withdrawn.
  Staying longer is not the missing system; damage/survivability is,
  as retreatdiag said.
- NOT killed: tile joining as a component (it was behavior-preserving
  and its pilot value at larger party sizes is unmeasured, not
  disproven); the base decomposition above (it stands as the arm's
  diag deliverable); the instruments (recorder, sweep, analyzer,
  fixture gate — all reusable by the next arm).
- NOT run: pilot sweep (prereg forbids spend on a gate NO-GO),
  confirm, check.js --quick to completion (attempted on the full rule,
  ran 11+ min without completing under sibling load, killed to proceed
  with the mandated revert — reported as unmeasured, not green).

## EPERM flap impact (this session)

Container write(2) EPERM flap blocked every exec-side write channel
(/tmp, workspace, /dev/shm, .git objects alike) for long stretches.
Mitigations that held: print-first summaries, JUDGEDJSON compact
fallback for the sweep (full rows are ~130KB and uncopyable), extracts
file assembled via file-tool writes and checksummed exactly (1272 /
24 / 0 / 3 / 7 / 3 / 286), fixture OUT-SKIPPED fallback, safe-commit
retries, index-clobber repair after every commit. One stage-1 file was
lost to a parallel rm/write race and rewritten from the run log.
No computed result was lost; no bar was changed for the flap.

## Files

- Prereg: evidence/2026-10-29/sim-staying-b-prereg.md
- Base extracts (checksummed): evidence/2026-10-29/extracts-base.json
- Base solo baseline: evidence/2026-10-29/staying-b-base-solo.json
- Stage outputs: evidence/2026-10-29/staying-b-fixtures-stage{0,1,2,3,4,5}.json
  (stage 0/1 are summaries + outcome strings; stages 2–5 carry full cells)
- Killed rule, audit only: evidence/2026-10-29/sim-staying-b-game-code.patch
  (fieldFights.js 194+/45-, game.js 34+/2-; deleted lines 47, under the
  safe-commit guard — the guard was never tripped because the code was
  reverted, not committed)
- Instruments: scripts/policies/staying-b-diag.js,
  scripts/test-staying-b-sweep.js, scripts/test-staying-b.js
  (incl. --extracts mode), scripts/test-staying-b-fixtures.js
- Branch: gaps-staying. Game code: REVERTED (git diff HEAD -- src/ empty).
  Nothing merged, pushed, bumped, or live-claimed.
