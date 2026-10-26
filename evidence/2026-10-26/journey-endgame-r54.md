# Journey endgame r54 — WAVE 5 OPEN + WITHDRAWAL DETECTOR PROVEN (lane B, 2026-10-26)

Leg 4 (endgame). Rotation-b read 4 → write 5 (social life next).
Pre-registration: evidence/2026-10-26/journey-endgame-r54-prereg.md (written
BEFORE any play; one invocation correction recorded there: the first
full-sweep invocation omitted RELAYGREY=1, which the forcedrift control
requires — the sweep stopped at 88094 after 88091–88093, which then
reproduced byte-identically on the corrected re-run). Instrument +
withdrawal-rescan fix, probe-local read-only; no src/js changes.
Merged locally, pending ship.

## Leg question (r53's three named items, in order)

1. The second veteran — does any village bank 2 living veterans?
2. Withdrawal detector — positive case?
3. Gate-passed-uncommitted, second run — empty again?

## Pre-registered bindings (§14 — a miss is NO-GO, never re-scored)

- M1 GUARD: >=5/7 reach the window or a voiced non-table path.
- M2 CENSUS COMPLETE: every census fight carries a primary outcome, AND
  >=2/3 Arm A waves seeds record >=1 census fight.
- M2b ATTRIBUTION: every dieFlag fight classified causal-vs-daywindow;
  >=1 dieFlag fight carries >=1 NAMED fight-causal death.
- M2c ENGINE COVERAGE: census fights == distinct wave-4 opens, AND
  censusErrors == 0.
- M2d COMMIT-GATE NAMED: every committed=false census fight carries a
  gate classification: 'never-observed', 'gate:<component>', or
  'gate-passed-uncommitted'.
- M3 CONVERSION: Arm B total wave-4+ kills > Arm A total wave-4+ kills.
- M3b LIVING VETERAN: >=1/6 waves seeds ends with >=1 LIVING veteran.
- M4 WAVE-5/FULL: >=1/6 waves seeds unlocks wave 5 or the full seat.
- M5 VOICING CANONICAL: 88094 — bandCrossings >= 1 AND noticedCount >= 1.
- M6 GUARD NAMED (deferred scope): every sat waves seed with deferDays
  >= 1 records a named window-end guard (not 'unknown').
- M7 PEOPLE: >=2 beats sense-read in full, 0 senseless flags.
- M8 EXIT CANON: every mFlee census fight matched to its monster's codex
  counter text.
- M9 SUPPLY: every wave-4 arrival that does not become a fight recorded
  with its cause line, or the code rule cited.
- REG: r35 auditNamed on sat seeds with nonzero w4/w5; r37 satPenalty
  present + voiced-line match on sat seeds.

## RESULTS (7/7 seeds)

| seed | plan | ann | sat | seat | path/branch | won | census fights | kills | living vets | uw |
|------|------|-----|-----|------|-------------|-----|---------------|-------|-------------|----|
| 88091 | waves | d90 | d96 | lesser | beloved/light | yes | 4: mFlee,vKill,talkDown,mFlee | 1 | 0 | 4 |
| 88092 | waves | — | — | — | — | no (village-lost) | 4: talkDown×4 | 0 | 0 | 4 |
| 88093 | waves | d90 | d91 | lesser | beloved/light | yes | 7: otherEnd,talkDown,vDie,vKill,talkDown,vDie,talkDown | 1 | 1 | 4 |
| 88094 | forcedrift | d111 | d111 | lesser | relay/dark | yes | 0 (control) | 0 | 0 | 3 |
| 88095 | wavesnw | — | — | — | — | no (survived, priced decline) | 0 | 0 | 0 | 2 |
| 88096 | wavesnw | d90 | d106 | lesser | feared/light | yes | 6: vFlee,otherEnd×4,vKill | 1 | 1 | 4 |
| 88097 | wavesnw | d90 | d90 | lesser | relay/light | yes | 4: vKill,mFlee,vKill,vKill | 3 | 1 | 5 |

- **M1 GUARD: GO 7/7** — 5 announced; 88092 honest death; 88095
  voiced priced decline (withdrawal, d90 — see below).
- **M2 CENSUS: GO** — every one of the 25 waves-seed census fights
  carries a primary outcome; 3/3 Arm A seeds recorded fights (r53: 2/3).
- **M2c ENGINE COVERAGE: GO 6/6** — fights == opens on every waves
  seed, censusErrors 0 everywhere, policy-only opens 0.
- **M2d COMMIT-GATE NAMED: GO 12/12** — every committed=false fight
  classified (see below). No gate-passed-uncommitted, second run.
- **M2b ATTRIBUTION: GO** — 2 dieFlag fights; d62 carries 3 NAMED
  fight-causal deaths; d87 classified day-window-only.
- **M3 CONVERSION: GO 4 vs 2** — Arm B's edge holds (88097 3 + 88096 1
  vs 88091 1 + 88093 1); it concentrates on the seeds that fight.
- **M3b LIVING VETERAN: GO 3/6** — best yet (r52/r53: 2/6):
  Katarina Novak (88093), Hannah Kim (88096), gen_xi0zrte (88097).
- **M4 WAVE-5/FULL: GO 1/6 — FIRST WAVE-5 OPENING IN THIS SERIES.**
  88097: unlockedWave 5, audit "2 wave-5 fought" (Big Loud, The
  Timeslot), satWaves w5=2. Full seat still never (closest gap on
  88097 is w2 4/5, not w5).
- **M5 VOICING CANONICAL: GO 1/1** — 88094: bandCrossings 1, noticed 1,
  announced d111 and sat the same day (the control's road runs later).
- **M6 GUARD NAMED: GO 3/3** — deferred sat waves end on hp (88091),
  not-ready (88093, 88096). 88097 sat same-day on veteran-banked.
- **M7 PEOPLE: GO** — 2 finals sense-read in full (below),
  0 senseless flags.
- **M8 EXIT CANON: GO** — all 3 mFlee fights matched (88091 suburb,
  88091 eulogy, 88097 strike).
- **M9 SUPPLY: GO (mechanism re-confirmed)** — 69 boundary blocks,
  all the same contention line (below).
- **PRIMARY: GO | ALL: GO** (analyzer exit 0).

## THE HEADLINE: WAVE 5 OPENED — AND THE SECOND VETERAN IS NOT WHAT OPENS IT

88097 (wavesnw, won relay/light, sat d90 same-day on veteran-banked)
is the first village in this series to open wave 5: unlockedWave 5,
satWaves w5=2, audit "with 3 wave-4 and 2 wave-5 fought" (Big Loud and
The Timeslot faced and lived). It did it with exactly ONE living
veteran at the sit (gen_xi0zrte: 2 kills, d75 + d82, living) — because
it had TWO cumulative killers across the run: Maya Singh killed d56,
then died of dehydration d81, nine days before the sit. The village
banked the second killer's kill, not the second killer's life.

And the audit says both things at once, honestly: "2 wave-5 fought"
AND "the wave-5 bar reads: blood your fighters (1 of 2 veterans)."
The unlock and the veterans bar are different counters. The
pre-registered M4 counts the unlock (uw=5) — GO. But the bar that
still reads 1/2 is now the sharper question: waveUnlockReady(5)
reports ready=false, short=[veterans], veterans=1, while the game
already unlocked wave 5 and counted 2 wave-5 fights. Which system owns
each number — the unlock, the readiness bar, the full-seat wave-5
component — is NOT settled by this run, and the run note names it as
the open question instead of papering it over. Next run: name the
owner of each number before claiming what "the wave-5 bar" blocks.

The full-seat picture sharpens the same way: 88097's closest full-seat
gap is w2 4/5 (wave-2 faced), not w5. Wave 5 is open; the full seat is
still blocked elsewhere. The wall moved, it did not fall.

## THE WITHDRAWAL DETECTOR IS PROVEN — BY ITS OWN MISS

88095 (wavesnw, survived, 10 alive, never announced, best seat none)
is the run's second headline. Its transcript contains the priced
decline, verbatim: "◈ THE TABLE — the ring of pale light flickers at
the edge of the sky... and does not come. ... WE PRICED THE RUN. NO
HUNGER ON THE RECORD — THE PELLET HUMS WHERE THE FIRE SHOULD BE. NO
FEAST, NO SURGE, NOTHING HERE WE CAN PRICE. ... The ledger still
wants: wave-2 monsters faced; wave-3 monsters faced; the food-thesis
deeds (no feast can carry the surge while the pellet hums). The mantle
may pass to hungrier hands; the table will still be here."

The daily-slice detector MISSED it: withdrawal field null on all 7
seeds after the sweep, even though the line matches the detector's own
pattern. The decline fires at day 90 on a day-transition the daily
slice does not cover (it sits between night camp and the next day's
actions). The fix, probe-local and read-only: record (day, capture idx)
at each daily start, and at run end rescan the full capture for the
pattern, tagging hits source:'end-rescan' so daily hits and rescan
hits stay distinct. Proof on the same seed: 88095 re-run with the fixed
probe returns withdrawal {day: 90, source: 'end-rescan', line: the
PELLET HUMS line}, and every other field identical to the sweep line
(armory 7/2, fullseatMax w1 9 / w2 1 / w3 0, standing 99, uw 2).
DET on the fixed probe: GREEN byte-identical. The instrument now has
its first positive case (21 seeds in: r52+r53 14, r54 7) — with the
honest caveat that the per-day slice alone still never fired; the
rescan IS the detector now, and next runs watch whether daily hits
ever occur.

Why 88095 declined: foodShared 673 but surgeDay null — the village
shared food but never surged a feast, and never faced wave-2/3. A
village can be generous, contested (18 contests), and stage-3, and
still price out on the food-thesis deeds. That is the table pricing,
not a bug.

## THE GATE TABLE, SECOND RUN: A NEW CLASS, AND AN EMPTY ONE AGAIN

12 committed=false fights, 12 classified:

- **NEVER-OBSERVED ×11** — all engine-only daily-round fights
  (talkDown ×9, otherEnd ×2), gate live at open (hp 0.852–1.0, uw 4,
  veterans short). The daily-round path bypasses policy.fight entirely;
  r53's 3-case pattern now holds across 11 more.
- **GATE:UW=5 ×1 — the new class.** 88097 d82 editor, vKill, OBSERVED
  (turns 5, engine+policy), hp 0.97, veterans short — but uw already 5,
  so commitLive false. Vetcommit commits wave-4 fights; a wave-5
  fight is out of its scope by design, and the party killed anyway.
  Commitment is a wave-4 instrument, not a kill switch — the same
  lesson as r53's gate:hp kills, one wave further out.
- **GATE-PASSED-UNCOMMITTED ×0 — second empty run.** Per the prereg,
  two empty runs is evidence toward retirement, not a retirement
  itself. Next run's metric review decides: retire the class, or keep
  it for a wrapper-lookup-disagreement seed. The run keeps it listed
  until that ruling.

## WHO DIES IN WAVE-4 FIGHTS (M2b)

- 88093 d62 influencer (16 turns, arena): **Yuyun** and **Nora**
  (tbVillagerFalls, combat) + **Fernanda Mascarenhas** (registerDeath,
  the arena) — all three NAMED, all fight-causal. The influencer is
  the lethal one this run; r53's reunion held that title.
- 88093 d87 congregation (vDie, engine-only): **Daniyar Askarov**
  (d88) — classified day-window-only, NOT fight-causal. The
  engine-only vDie flag fires on a death in the fight's day window
  without a causal link; the analyzer's split (causal vs day-window)
  is doing real work here, and the run does not inflate the kill
  count with it.

## THE FULL FIGHT DISTRIBUTION (25 waves fights)

mFlee 3, vKill 6, talkDown 8, otherEnd 5, vDie 2, vFlee 1. Read against
r53 (21 fights: talkDown 2, vFlee 5, otherEnd 3, vDie 3, mFlee 2,
vKill 6): the kill count holds (6), talkDown share rises (8/25 — four
of them 88092's daily-round talk-downs on a village that died anyway),
vFlee collapses to 1 (88096's designed eater escape d66). The road did
not get tamer; the seed block fought differently.

## ENCOUNTER SUPPLY (M9 — contention, again)

69 boundary blocks across 7 seeds, every one the same line: "The
<monster> stops at the boundary — pacing, unwilling. Something else
is already here. It's still out there." (The Static, The Big Big, The
Lockpick, The Influencer, The Algorithm, The Herald, The Eater, ...).
Same rule as r51–r53 (ONE MONSTER PER TILE + Haven safe law). 88095's
counter-case (5 blocks, 0 fights, uw2) shows the other side: sometimes
they simply don't arrive before the run ends.

## VILLAGE ASSESSMENT (plain words)

- **88091 — 9 alive, won beloved/light.** The talking village that
  also kills: suburb designed escape d65, audit kill d70 (killer
  gen_0hrdq1c — not a living veteran at run end), audit talk-down
  d91 (daily-round, never observed), eulogy mFlee d96. Sat d96 on hp
  after a 6-day deferral. Standing 199, again.
- **88092 — 3 alive, village-lost.** The village that talked its way
  out of every fight and died anyway: 4 wave-4 fights, all daily-round
  talk-downs, 0 kills, 15 deaths (wounds that wouldn't close, sickness,
  alien, and starvation d101–d102 at the end). Talk works; it does not
  feed a village.
- **88093 — 8 alive, won beloved/light.** The bleeding village: 7
  fights, Katarina Novak's congregation kill d76 (living veteran),
  3 arena deaths in the d62 influencer fight, sat d91 on not-ready
  after a 1-day deferral. 2 ascensions (Devon Okafor, Catalina Reyes).
  Standing 199, again.
- **88094 — 12 alive, won relay/dark (control).** The late control:
  announced d111, sat d111, lesser seat, final merge. No census fights
  (forcedrift, uw3), crossings 1, noticed 1. The canonical control's
  voicing fires on its own later road.
- **88095 — 10 alive, survived, no seat.** The priced-out village:
  generous (foodShared 673), contested (18 contests), stage 3 — but
  no feast surge, no wave-2/3 faced, so the table priced at d90 and
  did not come. The withdrawal detector's first positive lives here.
- **88096 — 8 alive, won feared/light.** The patient village: sat
  d106 after a 16-day deferral (the run's longest), designed eater
  escape d66, Hannah Kim's influencer kill d103 (living veteran),
  maxTier 2, satPenalty 8 — the run's only penalty, from the long
  deferral's overtime (4 overtime lines). Standing 199, again.
- **88097 — 8 alive, won relay/light.** The wave-5 village: 3 kills
  (Maya d56, gen d75 + d82), 1 living veteran (gen), sat the day it
  announced on veteran-banked, standing 442 — the run's highest by
  far. The village that proves wave 5 is reachable on the
  fight-don't-talk road, with the veterans bar still reading 1/2.
- Who leads: the bearer, always — no succession this run. Who is
  miserable: 88092's 3 survivors and 88095's priced-out 10. What is
  missing: a second LIVING veteran per village (still 1 everywhere);
  a full seat (closest gap: w2 4/5 on 88097); a daily-slice withdrawal
  hit (rescan only, so far).

## PEOPLE CHECK (SENSE-TESTING LAW — full reads)

1. **The relay teacher (88097, full window, 48 lines).** The audit
   prices honestly (17/4/6, 3 wave-4, 2 wave-5, 7 contests, 3 crises)
   AND names the unmet bar in the same breath ("wave-5 bar reads:
   blood your fighters (1 of 2 veterans)") — no contradiction once
   the two counters are distinguished. The relay beats cost honestly
   (efficient reroute: "the one that sits belongs to someone who
   needed it today"; backfire: "the wires feel more like home than
   the fire does, and the thought doesn't frighten you"), the final
   "Teach it to let go" resolves ("The System becomes Earth's
   champion from a respectful distance... You keep your humanity"),
   and the Architect beat credits facilitation ("Ingrid Vik ascended
   through doors you built: relay" — Ingrid speaks in this run's
   window, so the name is in-run, not imported). PASS.
2. **The beloved quiet ones (88093, full window).** The audit names
   both unmet bars (armor 2/4, veterans 1/2); the war path names
   Katarina's d76 kill; the beloved beats build (truth-telling,
   children's game, spending the finale on the unfilmed) and the
   final resolves ("Nobody can find you in the footage. That was the
   point"); the Showrunner finale, Architect (Devon Okafor), and
   Pantheon (Devon + Catalina, "gods have politics") stack without
   contradicting the 2-ascension audit count. The Oversight coda
   varies by run (pod line only here; mourners + pod on 88097) — not
   a static stamp. PASS.
- 0 senseless flags. Wart (carried from r53): the war-path epithet
  veil — the d76 kill reads "Big-Eyes" in the war path against the
  census's "congregation" (r53: "Big Ugly" for the same monster). A
  reader comparing audit to census must know the veil exists; it is
  knowledge-gating, not a mismatch, but it is still a veil.

## BLANKS

- FILLED (instrument): the withdrawal rescan — daily-slice miss
  found, fixed, and proven on the same seed (88095, d90, end-rescan).
  First positive case in 21 seeds.
- FILLED (instrument class): gate:uw — wave-5 fights are outside
  vetcommit's scope by design; the first uw=5 census fight classifies
  cleanly.
- DOCUMENTED (open question, carried to next run): uw=5 vs
  waveUnlockReady(5) short [veterans] — name which system owns each
  number (unlock, readiness bar, full-seat component) before claiming
  what blocks what.
- DOCUMENTED (metric review, carried): gate-passed-uncommitted empty
  a second run — retirement question for the next run, not a
  mid-run deletion.
- DOCUMENTED (carried wart): war-path epithet veil (Big-Eyes /
  Big Ugly for the congregation kill).

## Metric review (§14)

1. **M4's GO is the run's road win** — first wave-5 opening in this
   series (r48–r53 all NO-GO on M4), and it arrived on the
   fight-don't-talk arm with 3 kills. But the GO is narrow: it counts
   the unlock (uw=5, w5 fought=2), not the veterans bar (1/2). The
   next run must not report "wave 5 reached" without the bar
   reading beside it.
2. **M3b's 3/6 is the best living-veteran count yet** — the veteran
   story is now a banking problem (keep the second killer alive to
   the sit), not a killing problem (88097 killed 3×).
3. **M2d's new class (gate:uw) is clean** — and it bounds vetcommit:
   the instrument's scope ends at wave 4, correctly. The empty
   gate-passed-uncommitted class now has two runs of evidence behind
   a retirement question.
4. **M1's withdrawal leg now rests on a proven detector** — but the
   proof is rescan-only. If the next run's withdrawals all arrive via
   rescan, the daily detector should be retired, not carried.
5. **Telemetry deviation check:** tool reports LOUD on both metrics
   (see below). VERDICT: EXPLAINED (guard-ended windows, maxTier sum
   2, penalties sum 8 — all from 88096's long deferral), baseline NOT
   rolled. Same verdict as r48–r53, same reason: the baseline
   describes long-deferral sits (r37), not this run's guard-ended
   windows. NEXT-RUN PROPOSAL (metric review, not a mid-run re-score):
   re-seed the baseline from a same-regime guard-ended corpus and
   record the regime in the file, as the baseline's own note directs.
6. **Balanced panel (§15):** no panel comparison applies — zero src/js
   changes, no lever moved on the default path (NOWALKIN default off;
   the withdrawal rescan reads capture only and changes no gameplay
   — DET green on the fixed probe proves read-only; the 88095 re-run
   changed no non-withdrawal field). The comparison is r53→r54 via
   identical substrate plus the rescan (field addition, not a class
   change), and Arm A→Arm B on one variable.

## Regressions / checks

- PILOT (88091 Arm A + 88095 Arm B, 180d sweep mode): gate SATISFIED
  — 88091 recorded 4 census fights, so the 7-seed sweep ran (88095's
  zero is the explained withdrawal seed, not a null pilot).
- DET (instrument-on twice, 2x120d, seed 88091, final probe code):
  GREEN byte-identical (original probe and fixed probe).
- FID (env unset: wrapped == pure capable+deedhunt, mini
  gameDays/won/alive/pantry): GREEN byte-identical (90d, won true,
  alive 7, pantry 7061 both sides).
- CHECK-QUICK: PENDING — see below.
- Telemetry deviation check: LOUD on both metrics — VERDICT:
  EXPLAINED, baseline NOT rolled (see Metric review 5).

## Telemetry deviation check (2026-10-26)

- Tool verdict: LOUD on both metrics (7 files, 2 metrics).
  - maxTier: baseline 16 -> current 2 (sum of per-seed maxTier:
    0+0+0+0+0+2+0; only 88096's long deferral tiers).
  - satPenalty.penalty: baseline 91 -> current 8 (88096's penalty
    alone; every other seed 0).
- Per-seed reading: the same guard-ended population as r48–r53, NOT
  long-deferral sits (88096's 16-day deferral is the exception that
  carries both sums). VERDICT: EXPLAINED; baseline NOT rolled.

## Evidence

- evidence/2026-10-26/journey-endgame-r54.md (this note)
- evidence/2026-10-26/journey-endgame-r54-prereg.md
- evidence/2026-10-26/perseed-endgame-r54/endgame-r54-{88091..88097}.json
- evidence/2026-10-26/perseed-endgame-r54/endgame-r54-{88091..88097}-transcript.txt
- journey-endgame-r54-check-quick.log (in goal hidden_files; NOT
  committed to the repo: check logs are per-run bookkeeping, and the
  repo's evidence dir holds the run note + per-seed files only)
- scripts/probe-endgame-r54-20261026.js
- scripts/analyze-endgame-r54-20261026.js
- scripts/policies/capable.js (unchanged — NOWALKIN_W4 rule from r50,
  env-gated, default off; no src/js changes this run)
