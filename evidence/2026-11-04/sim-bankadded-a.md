# sim-bankadded-a — BANK-ADDED edible retention: INSUFFICIENT-DATA

Run: oversight-flesh-out-loop, run fleshout-20261105T0515Z, arm
sim-bankadded-a, axis food-economy. MEASUREMENT/DIAGNOSIS ONLY:
no game-code change, no policy change, no win-price / deed-gate /
food-number change. Prereg:
`evidence/2026-11-04/sim-bankadded-a-prereg.md` (committed BEFORE
any judged sim). Analyzer: `scripts/analyze-bankadded.js` (proof
`scripts/test-bankadded-a.js` 33/33, re-run green in closeout).
Screen corpus:
`evidence/2026-11-04/sim-bankadded-a-screen-guard-variant/` (64
files, seeds 17025–17088, 60d, nighttravel + woodcarry + bankfood
stack). Census corpus: `evidence/2026-11-04/sim-bankadded-a-corpus/`
(strandnarr-s17063.json).

## Blank

The substrate arm (sim-bankretain-substrate-a, 2230Z) confirmed
retention 3/3 for CARRIED-source edible food at stranded evenings,
but all 3 judged events had bank-added edible delta 0. This arm
closed the narrow BANK-ADDED case: an evening phase that ADDS
edible food to the bank on a stranded evening, judged at the
following stranded morning.

## Verdict — INSUFFICIENT-DATA (1 judged event at the 64-seed cap)

The pre-registered GO bar was >= 3 distinct judged bank-added
events with a unanimous retention verdict. The screen reached its
64-seed cap with **1** judged event. The bar is not met and is
not re-scored: flip-mode delta > 0 events (5 judged) are screen
context only, never counted toward the bar, per the prereg.

The single judged event was **RETAINED** — suggestive, not judged:
seed 17063, loopDay 13, source 'banked' (pack-before edible 0),
+325 kcal, retained at the true post-sleep morning, morning
disposition 'upkeep-eaten'. It replicated exactly on the census
leg (same seed, loopDay, delta, verdict — see below). One retained
event does not carry a verdict; it says the mechanism did not
vanish the one time it was observed.

## Yield tables

Step 0 — substrate corpus re-analysis (24 seeds, 17001–17024):
0 bank-mode evenings, 0 bank-added events, 0 judged, 0 censored.
Confirms the prereg's expectation (the substrate arm's 3 judged
events were all delta-0 carried). allJudged 3 (carried only).

Screen — variant corpus, 64 seeds (17025–17088), 6 + 2 blocks of 8:

| | count |
|---|---|
| Seeds screened | 64 |
| Bank-mode evenings | 1 |
| Bank-added (delta > 0) | 1 |
| Bank-added judged | 1 (RETAINED) |
| Bank-added censored | 0 |
| Flip-mode delta > 0 (context only) | 5 judged, 0 censored |
| All judged (bank + flip + carried) | 9 |
| All censored | 0 |
| Raw mode counts | bank 1, flip 21, skip 8 |

Bank-mode evenings are the rare pool: 1 in 64 seeds produced a
single bank-mode evening, and it was the bank-added event. The
screen's product is this yield table — an empty 8-seed block was
the expected outcome for a rare-evening pool, and six of eight
blocks were empty.

Census — strandnarr leg, seed 17063 (the only candidate seed):
replication EXACT. Screen event (loopDay 13, +325, RETAINED) ==
census event (loopDay 13, +325, RETAINED). No DISAGREED. Census
totals: 1 seed, 1 bank-mode evening, 1 bank-added judged
(RETAINED), 0 censored.

## Morning narration (seed 17063)

SENSE-TESTING LAW: the morning record shows the scholar waking
stranded (forest_floor, tile 1,4, travel-refused the prior day)
with 325 kcal still held at wake — the bank-added food persisted
overnight and was not gone by morning. The analyzer's disposition
is 'upkeep-eaten' (retained-then-eaten counts as retained, per
the adopted accounting). The strandnarr transcript corpus carries
no bank/pantry narration beat for this morning (6 transcript
entries total in the file) — a capture thinness, not a game
finding: nothing in the transcript contradicts the retention,
and nothing narrates it either.

## Metric review

The metric held: no re-scoring, no friendlier bar. The 64-seed
cap bound the screen as designed. What the run actually proved
is the RARITY of the pool, not the retention verdict: bank-mode
evenings occur ~1 per 64 seeds under this stack, so a 3-event bar
needs a different substrate, not more of the same screen. Proposed
next substrate (not built here): a bank-screened band
pre-filtered on bank-mode evenings, or a probe-given-food leg
that stages a bank-added evening directly. Either would need its
own prereg.

## Closeout provenance

The arm's worker timed out with the screen at 48 seeds and the
verdict unwritten (coordinator report, run fleshout-20261105T0515Z).
The main session completed the arm per the prereg: extension
sweep seeds 17073–17088 (16 files, same driver/legs/env), analyzer
re-run on the full 64-seed corpus, census leg for the single
candidate seed (17063), replication check, and this evidence file.
No game code was touched at any point in this arm.

## Files

- Prereg + instrument: 8cba76e7a, 9d5535cb5 (landed with this run).
- Screen corpus: 64 files (17025–17088), this commit.
- Census corpus: strandnarr-s17063.json, this commit.
- Analyzer reports (not repo files): goal hidden_files
  bankadded-step0-substrate.json, bankadded-screen-64.json,
  bankadded-final.json.
