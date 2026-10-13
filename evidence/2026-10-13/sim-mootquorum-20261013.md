# sim-mootquorum — MOOT QUORUM advisory→binding upgrade path (2026-10-13)

## Pre-registered header
- **Lever**: Steve's MOOT QUORUM call ("binding moots need >50% of living villagers; below quorum, verdicts advisory only") — the advisory→binding upgrade path.
- **Primary metric**: verdict-binding correctness on instrumented moots + exile-rate delta.
- **GO threshold**: verdicts correctly marked binding/advisory per attendance on ALL instrumented cases AND exile rate within ±5pp of the identical-seed baseline AND ≥3 sense-tested transcripts reading as villagers, not rules.
- **Horizon**: 180d (WIN-PATH HORIZON 180, Steve 2026-10-13), death-aware (dead villages stop).
- **Seeds/policies**: 11/22/33/44 × competent/winseek = 8 runs per arm, identical seeds before/after.
- **Instrument** (identical both arms): at day ≥30, force a player theft case and rig exactly ONE moot to below-quorum attendance; lift the rig after the advisory so the re-convened moot draws natural attendance.

## What I found
The sibling (blitz-succession, 8e70c94d, already in master) landed the MARKING: `mootQuorum()` computes living/present/quorum(>50%), `conductTrial` narrates the half-fire honestly, and `finishTrial` marks advisory + suppresses all binding consequences. That half was correct and complete.

The UPGRADE PATH — "the charge stands open until a quorate moot sits" — was not implemented. Four gaps, all real:
1. The advisory branch kept `c.trial` set and left the player's crimes stamped with `caseId` → the no-double-jeopardy half-heat discount applied to an undecided charge, and `forcePlayerAccusation`/`justiceDemandMoot` filtered the crimes out as "judged". The charge could never be re-heard.
2. `playerCaseOpen()` ignored `advisory` status → the justice ladder was not frozen behind the open charge.
3. `forcePlayerAccusation` / `considerPlayerAccusation` ignored `advisory` → a duplicate second case could open on the same crimes.
4. No daily tick ever re-convened the moot. The NPC tick (`npcMootTick`) and player tick (`playerCaseTick`) only touch `status === 'open'`, and `callMoot` refuses cases with `c.trial` set. The advisory verdict was terminal in practice — the fiction promised a re-hearing that never came.

Edge-case readings (documented for Steve to overrule): **exiled** villagers are NOT counted as living (they're removed from the roster into `v.exiles` — they're no longer villagers of the village); **absent** members (hunting, traveling) stay in the roster and count. A 2-person village with both present = quorum. Proven in test §4.

## What I built (src/js/betrayal.js only, +55/−4)
1. Advisory branch of `finishTrial`: stamps `c.advisoryDay`, clears `c.trial` (re-convene re-draws attendance), releases the charged crimes (`caseId = null` — nothing was decided, so no half-heat discount and the charge filters see them again), and adds the voiced promise: *"Again," someone says, feeding the fire. "The whole village this time — no more half-fires."*
2. New `mootAdvisoryTick()`, hooked into `betrayalDailyFull` before the convening ticks: 3+ days after the advisory, the case re-opens (`status='open'`) and the normal `playerCaseTick`/`npcMootTick` machinery calls a fresh moot with re-drawn attendance. If the accused are gone (dead/exiled/fled), the case goes `dormant` — nobody left to try. Re-call line uses "The accused" (whoTag gives 'you' for the player — "You answers" would be ungrammatical).
3. `playerCaseOpen`, `forcePlayerAccusation`, `considerPlayerAccusation` now treat `advisory` like `open`/`dormant` (ladder frozen, no duplicate case).
4. The death-closure ("one voice for the dead") now also closes `advisory` cases as `resolved/accused_died`.

## Proof (RED → GREEN)
`scripts/test-moot-quorum.js` — 37 assertions on the real code path (rigged attendance only):
- RED on pristine HEAD: the sibling's marking assertions pass, all 4 upgrade-path assertions fail (`advisory clears the trial tally`, `advisoryDay stamped`, `mootAdvisoryTick exists` → harness error, missing function).
- GREEN after: 37/37.
- Covers: NPC guilty-advisory (no exile, roster intact, ADVISORY narrated), NPC acquit-advisory, re-open timing (not day+0/+2, yes day+3), reconvene → binds, player case (crime released, ladder frozen, no duplicate case, reconvene binds), 2-person quorum edge, exiled excluded from living.

Regression: `test-blitz-succession.js` 30/30, `test-npc-moot-20261012.js` 17/17, `test-moot-justice-aftermath.js` 27/27, `test-justice.js` 61/61. `test-moot.js` (38/1) and `test-player-trial.js` (78/2) fail identically on pristine — pre-existing, not mine.

## Before/after (8 identical seeds × competent/winseek, 180d death-aware)

| | before (marking only) | after (+ upgrade path) |
|---|---|---|
| instrumented moots | 8 | 8 |
| correctly marked advisory, no binding fired | 8/8 | 8/8 |
| re-opened | 0 | 8/8 |
| reached a binding verdict | 0 | 8/8 (cold_war 1, weregild 3, acquitted 3, accused_died 1) |
| exiles (all causes) | 0/8 runs | 0/8 runs (Δ 0pp) |
| natural (unforced) advisory moots | 0 | 0 |
| wins / national / table / wave 4–5 | 0 / 0 / 0 / 0 | 0 / 0 / 0 / 0 |
| max wave reach | 3 | 3 |
| median survival (game-days) | 78–84 | 108–117 |

**Verdict: GO.** All three pre-registered conditions hold: (1) 8/8 instrumented moots correctly marked per attendance, before and after; (2) exile-rate delta 0pp (well within ±5pp); (3) 4 sense-tested transcripts below, all reading as villagers.

Notes: the median-survival gap is downstream trajectory divergence (binding verdicts — weregild food costs, cold-war social fallout — move the village state; the before-arm's stranded advisory is the bug being fixed), not a lever side-effect. Natural advisory moots never occurred in 16 runs: at 88%-per-voter attendance, below-quorum moots ~never happen in healthy villages — the rule bites only in dying/small villages, which is exactly where Steve's call matters.

## Sense-test (SENSE-TESTING LAW — read, don't count)
Captured via `scripts/dump-quorum-transcripts.js` (direct conductTrial, contiguous log):

- **T1 guilty-advisory**: the half-fire is framed before the count ("whatever the fire says is advisory only — no exile, no conviction"), the ceremony still plays ("1 for guilty. 0 against... 'Guilty.'"), then the honest correction ("only 3 of 12 are here... this is the fire's ADVISORY sense, not a verdict. No exile. No sentence. The charge stands open until a quorate moot sits.") plus the voiced re-call promise. Coherent.
- **T4 acquit-advisory**: "only 2 of 12 are here, so this isn't a clearing either... not proven tonight. The charge stands open." The important nuance — a thin moot can't clear you either — is stated plainly. No double-jeopardy gaming.
- **T2 re-call**: "Word goes around the fires: the moot sits again tonight, and this time the village is HERE. The accused answers — properly, in front of everyone." Reads as village gossip, not rules.
- **T3 reconvened verdict**: normal moot machinery, fresh attendance draw. (In the dump it awaited a player vote — the test's doing; the 2-day `trialVoteTick` backstop resolves it in-game.)

All four read as villagers with reasons, not as rule recitations. No fabricated history, no filler loops.

## Village assessment
Seed-11 competent (the traced run): the village lost its first bearer (Carmela McGrath, killed by a belltoad on d34 — mantle passed to Sujon Das with the full grief beat), then the second bearer too. Early mortality is brutal in this seed set — 6 of 8 villages died before day 130, all `village-lost`. The forced theft case played out as designed in every run: advisory at the half-fire, re-call three days later, binding verdict (mostly weregild — the village took its price in food — or acquittal). Nobody was exiled for a single theft; the village priced it, which feels right for the crime. The justice ladder stayed frozen behind the advisory charge exactly as the "one formal track" rule demands, and no duplicate case ever opened.

## Blanks filled / documented
- Filled: the advisory→binding upgrade path (the four gaps above).
- Documented (not chased): exiled-vs-living reading of the quorum denominator (above — Steve can overrule); natural advisory moots ~never fire at 88% attendance (appended to sim-findings.md).

## Wall numbers (this suite)
national 0/8, table 0/8, wins 0/8, wave 4–5 unlocks 0/8, median survival 108–117 game-days (after). The lever is a justice-system completion, not a wall lever — wall numbers identical before/after, as expected.

## Files
- `src/js/betrayal.js` (+55/−4) — the lever
- `scripts/test-moot-quorum.js` — RED→GREEN proof (37 assertions)
- `scripts/measure-quorum-sweep.js` — before/after instrument (SEEDS/POLICIES/DAYS env-overridable; /tmp/quorum-before.json, /tmp/quorum-after.json)
- `scripts/dump-quorum-transcripts.js` — transcript capture for sense reads
