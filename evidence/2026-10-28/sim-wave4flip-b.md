# sim-wave4flip-b — band-seed 10421 wave-4 flip: ANSWERED (journey-landing r64)

Run: fleshout-loop-b-20261028T0805Z, axis food-economy, arm
sim-wave4flip-b. MEASUREMENT ONLY: zero src/js changes, zero default
flips. Prereg: evidence/2026-10-28/sim-wave4flip-b-prereg.md, committed
as 1adc45be7 BEFORE any judged sweep in this arm. Instruments:
scripts/test-wave4flip-b.js (verbatim parameterization of the
committed test-caughtlift-fix-b.js band function — loop body diffed
identical except the argv seed list), scripts/test-wave4flip-diverge-b.js
(read-only daily wave-4 unlock snapshots),
scripts/test-wave4flip-frame-b.js (read-only r64 framing-line capture).
Harness: sim-harness loadGame/setupGame/runDays, seed before eval,
full src/js list minus DOM-only files, Game.save never stubbed.
Bisection bases were built by `git archive` extraction (src + scripts
+ index.html only; the 3.2G evidence tree was NOT copied), never by
checkout churn in this worktree and never touching the main tree.

Canon: docs/CANON.md read first; docs/MONSTER-WAVES.md is the wave-law
reference (wave 4 = village standing >= 100 + combat-readiness bars:
armored 3 @ P>=10, armed 5, tricks 3, veterans 1 with a wave-3+ kill).
Nothing invented: this arm attributes an observed flip.

## VERDICT: ANSWERED — the flipping change is journey-landing r64

Per-base wave reach for seed 10421 (competent policy, 100d
death-aware cap, worker band substrate):

| Base | Code state | 10421 wave | Runs |
|------|-----------|-----------|------|
| W0 "pre-divedeep" | 3cb5f8b82 tree + caughtlift-fix src hunks only (worker-after reconstruction) | 4 | full band + standalone |
| W1 "post-divedeep" | 98784fc00 (== W0 + divedeep fix) | 4 | standalone |
| W2 "post-barwhy" | 60f873319 (== W1 + barwhy fix) | 4 | standalone x2 |
| W3 "post-r64" | 6eb84f967 (== W2 + r64) | 3 | full band + standalone + frame run |

Exactly one step moves 10421 (4 -> 3): W2 -> W3, i.e. commit
6eb84f967 "journey-landing r64: case-framing fix". The divedeep fix
and the barwhy UI change are EXONERATED on this seed: 10421 stays
wave 4 across both. The answer threshold in the prereg is met in
full: W0 reproduces worker wave 4, W3 reproduces coordinator wave 3,
exactly one step moves, the step's result repeats (W3 wave 3 three
times: full band, standalone, frame run; W2 wave 4 twice), and the
guard band shows the move is seed-10421-specific (below).

The W2 -> W3 tree diff is exactly r64's commit, and its ONLY
runtime-code delta is src/js/betrayal.js (+65 lines: the
betrayalCaseFrame function + convoMenuPage wrapper hook) and
src/js/conversation.js (+4 lines: per-sitting caseFramed reset).
r64's three scripts/ files (journey driver + analyzer + framing
proof test) are never loaded by the sim harness. So the flipper
lives inside r64's runtime code, not in its tooling — and not in
any other commit in the chain.

Bands are guardrails, not verdicts: this verdict does NOT re-judge
the caughtlift arm. Its GO stands; the band guardrail (8/8, wall
zeros) still passes on both endpoint bases.

## Full guard bands (10420-10427, both endpoint bases)

Only seed 10421 moves. Every other seed is identical W0 -> W3,
including the grant lines and the day-28 village loss:

| Seed | W0 wave | W3 wave | Notes (identical both sides unless noted) |
|------|---------|---------|------------------------------------------|
| 10420 | 2 | 2 | 28d, village-lost |
| 10421 | 4 | 3 | THE FLIP; 100d survived both sides |
| 10422 | 3 | 3 | 100d survived |
| 10423 | 4 | 4 | 100d survived — the other wave-4 seed, unmoved |
| 10424 | 2 | 2 | Light Fingers Level 1 grant line |
| 10425 | 2 | 2 | |
| 10426 | 3 | 3 | Light Fingers Level 1 grant line |
| 10427 | 3 | 3 | Level 2 + stranger-teaches JACKPOT line |

Wave-4 reach: W0 2/8 (10421, 10423) — exactly the worker's band;
W3 1/8 (10423 only) — exactly the coordinator's master re-run.
National/table/wins 0/8, lift calls 0, median 100d on both sides.
The W0 band reproduces the worker's reported rows seed-for-seed,
so the W0 reconstruction is faithful — the pilot gate passed on
the first attempt, and the P0/P1 control bases in the prereg were
therefore not needed (prereg step 1 runs them only if the pilot
fails).

## Determinism: no same-base flip, no run-order effect

- W0 10421: wave 4 in-band (2nd seed of the band process) AND
  wave 4 standalone (fresh process, alone). Same.
- W3 10421: wave 3 in-band AND wave 3 standalone AND wave 3 in the
  frame-capture run. Same.
- No base gave different 10421 waves across repeats, so this is
  NOT non-deterministic noise and NOT run-order noise. A single-
  commit attribution is licensed, and it is r64.

## Divergence: where the two runs split (read-only snapshots)

Daily wave-4 unlock inputs for 10421, thinned to every 10th day.
Days 1-71 are IDENTICAL on W2 and W3 (same kills, roster, tricks,
ledger, waves). First visible split at the day-81 snapshot:

| Day | W2 (pre-r64) | W3 (post-r64) |
|-----|--------------|---------------|
| 71 | wave 3, kills 12, roster 8, ledger [10,4,0] | identical |
| 81 | wave 3, kills 19, roster 7, ledger [12,7,0], armed 7, tricks 21 | wave 3, kills 14, roster 8, ledger [10,5,0], armed 8, tricks 19 |
| 91 | gated 65 (war 25 + plenty 40), veterans 1, roster 10, kills 21, ready true | gated 45 (war 25 + plenty 20), veterans 1, roster 8, kills 15, ready true |
| 100 | gated 110 (war 50 + plenty 60), WAVE 4, veterans 1, roster 10, kills 22 | gated 65 (war 25 + plenty 40), WAVE 3, veterans 0 (the day-91 veteran died), roster 7, kills 15, ready false |

So W3 fails wave 4 on BOTH gates by day 100: standing 65 < 100
AND no living veteran (readiness short on veterans). This is not
a narrow threshold miss and not an unlock-pacing quirk: the W3
village fights less, kills less, and loses its veteran late.
The divergence window is days 71-81; the cascade after it (fewer
kills -> less war standing -> no veteran -> no wave 4) is the
whole story of the flip, and it starts a full month before the
wave-4 door would have opened.

## Mechanism class (traced to the channel, not to a single beat)

What r64 actually adds to a run, measured in the W3 10421 run
(frame-capture instrument, read-only sayLine wrapper):

- Day 12: `"There's still the matter of the ambush of Hanan. Nobody's settled it."`
- Day 30, 54, 58: `"There's still the matter of the ambush of Ivy. Nobody's settled it."`

Four framing beats, all before the day 71-81 divergence window.
That is the player-visible delta of r64, and it is real: the
player in a W3 run HEARS the case named before its menu; the W2
player does not.

Why a spoken line can move a sim at all (code-read, confirmed by
the capture, not assumed): sayLine writes every spoken line —
diegeticAct-exempt from blocking, but NOT exempt from ledgering
— into the per-conversation ledgers AND the run-wide 48-entry
no-repeat window (conversation.js sayLine). Each framing beat
therefore occupies ledger slots and shifts which later NPC lines
get run-blocked (and replaced by dry lines) in subsequent
conversations. r64's own note says "Presentation only: no case
mechanics, no gating, no option-set change" — the menu options
are indeed unchanged (the wrapper returns the original menu),
and the competent policy reads no spoken lines (grep of
scripts/policies/competent.js: its only say is one line it speaks
itself). So the channel is conversation-STATE shift through the
ledgers, not policy reaction to words and not RNG consumption by
sayLine itself (no Math.random in the sayLine path read). Which
downstream beat first changes a number, and through what
consequence, is NOT traced here — that is the named next arm
below, not a gap papered over. The commit attribution does not
depend on it: only r64's runtime code differs between W2 and W3.

## Sense note (what the player would see differently)

On the W0 side the player hears no case-framing line, and by day
100 the village has fought its way to the Mirror Draft (wave 4):
50 war standing, 60 plenty standing, a living veteran, 22 kills
in the log. On the W3 side the player hears, four times across
the run, a villager name the unsettled ambush before its menu —
the honest-menu fix working as designed — and by day 100 the
village is a weaker place: 25 war standing, the veteran dead,
15 kills, still facing wave 3. The framing line itself is good
craft; its sim cost is that a "presentation-only" line is not
free — it moves the conversation ledgers, and on this seed the
ledger shift compounds into a lost wave. That cost is a property
of the ledger system, not of this one line's wording.

## Village assessment (plain words)

Seed 10421's village is the same village on both sides for the
first ten weeks: same fights, same deaths, same slow climb. Then
in the last month the two versions of the village part ways. The
one without the framing line kills more, keeps a veteran alive,
and earns its way to the next draft of monsters. The one with
the framing line fights less well, buries its veteran, and never
quite earns the standing to meet the Mirror Draft. Nothing about
the village's food, gear, or courage changed between the two —
only what its people said to each other about an unsettled
ambush, and what those words pushed out of the conversation
afterward. A single spoken sentence, compounded over a month of
talk, is enough to cost a village its next wave.

## Metric review

- Prereg judged as written: primary metric = 10421 maxWaveUnlocked
  per base; answer threshold met (single step, repeats, guard
  band seed-specific). No metric re-scored mid-run. The P0/P1
  controls were not run because the prereg conditions them on a
  pilot failure that did not happen.
- "Wave reach" is maxWaveUnlocked (an unlock metric, per the
  prereg's own note): the divergence table shows the unlock flip
  rides on real kill/standing differences (kills 22 vs 15,
  standing 110 vs 65), not on unlock pacing alone — so the
  metric's weakness does not bite here.
- W0 is a reconstruction, not a surviving commit: its band
  reproduces the worker's rows seed-for-seed (including the
  day-28 loss and all three grant lines), which is the fidelity
  evidence the prereg asked for. Had W0 and W1 disagreed, the
  reconstruction would have been part of the verdict; they agree
  (both wave 4), so it is moot for attribution.
- One prereg wording risk, disclosed: the diverge instrument's
  say-line filter (/standing|ready|.../) matched garden "turned
  and ready" lines and captured ~69KB of irrelevant beats on the
  W2 side. The judged numbers never came from that filter; the
  framing capture used a separate, exact filter
  (/Nobody's settled|still the matter of/) and is quoted above.
  A future probe should filter dialogue lines, not narration.

## Balanced panel (section 15)

Standing panel exception, stated not faked (as in the 0630
coordinator evidence and the caughtlift-fix evidence):
scripts/balance-panel.js has no corpus-ingest mode for
fixture/band output. The judged comparison here is direct on
identical seeds across code bases (same instrument, same seeds,
same policy, same horizon) — the panel's headline metrics
(wave reach, national, table, wins) reported directly per base.
The per-base JSON rows are in this evidence file's tables and in
the run logs listed below, so a future ingest mode can re-attach
the comparison without re-running.

## Named next arm (NOT done here — measurement only)

- r64-ledger-mechanism: daily-snapshot + day-stamped transcript
  diff for 10421 on W2 vs W3 across days 58-81, to find the first
  downstream beat whose consequences differ after the day-58
  framing line, and to say whether the channel is a blocked beat
  losing its consequence, a dry-line substitution, or a
  last-beat/resume shift. Question it answers: is EVERY added
  spoken line a sim-moving change (ledger-shift class), or does
  r64's line hit a specific beat? That decides whether journey
  landings need a band-guardrail rule for "presentation-only"
  dialogue changes.

## Run logs (scratch, removed before commit — rows above are the record)

- W0 full band, W3 full band, W0/W2/W3 standalone 10421 repeats,
  W2/W3 diverge snapshots, W3 frame capture: all under
  .wave4flip-bases/ in this worktree during the run, deleted
  before the evidence commit (they are reproducible from the
  committed instruments + the base hashes in the table).

## Infrastructure

- No main-tree touch, no push, no bump, no live verification
  (ship-loop line). Worktree branch sim-wave4flip-b only.
- Safe-commit index clobber hit the prereg commit (phantom staged
  deletions); repaired via HEAD-blob cacheinfo and re-verified
  (commit content correct, worktree clean) — same class as the
  0630 run.
- No EPERM flap on .git ref writes this run. No jest (arm proof
  scripts are the attributable verification; no src/js changed,
  so check.js is not the gate here — stated, not claimed).
- Heartbeat kept on the registered tree during the run.
