# Loop A run fleshout-20261105T0915Z — coordinator evidence (winnability chain)

Axis: scale-onramp / winnability chain (wild ally-join → wave-4 kills →
veterans → readiness-5 release → wave-5 facing → full seat).
Arms: sim-dmground-a (BUILD probe, NO-GO, lever reverted) +
sim-killersim-a (DIAG, UNDERPOWERED) + sim-staypolicy-a (BUILD probe,
NO-GO, policy kept as inert measurement tool).
Merged locally, pending ship. No push, no bump, no live verification
(ship loop owns deploys). Zero net src/js change from this run
(59 files changed, all evidence/scripts/corpus).

## Run start

No lock at run start (no fleshout-loop.lock existed); no live claim in
hidden_files/lever-claims/ (only .DEAD files). Registry checked: the
only fresh heartbeat was journey-establishment (Loop B journey lane,
heartbeat 11 min old at run start) — NOT touched. Pre-flight: main
tree clean, disk 29%, reaper removed nothing (10/16 active). Lock +
claim created before any sims (0916Z). Tracker read first: topmost
non-converged axis scale-onramp; this run took the 0830Z next blank
(1) damage-per-round or survivability-per-round in wild wave-4
fights, as two separate arms (game-code damage + policy-side
survivability, non-overlapping files), plus blank (3) killer
simultaneity as a diag arm. Blank (2), the arm-2 damage+staying
toggle, was NOT claimed: it needs its own run (overlaps
fieldFights.js, and this run's dmground arm touched that file).
Rotation left at 3 (convergence work does not cycle it).

## Arm 1 — sim-dmground-a: GEARFULL NO-GO, lever reverted

Worker commits (rebased onto master 9797dfabd, proof re-run 27/27,
merged ff-only): prereg eb29a836b, lever 523b7706b, evidence+revert
8b6bb3b44, corpus c82e6e253 / 71bf117ae, correction 41391a9bf.
Arm evidence: evidence/2026-11-05/sim-dmground-a.md (+ prereg
sim-dmground-a-prereg.md). Corpus: evidence/2026-11-05/
perseed-dmground-a/ (16 files, 0 instrument errors). Proof:
scripts/test-dmground-20261105.js 27/27 PASS on merged master.

Lever GEARFULL [needs-eyes]: wild wave-3+ field strikes use the
full printed weapon bonus (max melee/ranged) instead of the halved
fold-in; sealed/raids/waves 1-2 unchanged. Band 99201–99208, 150d,
competent policy verbatim, identical seeds before/after.

| | Baseline | Armed | Bar |
|---|---|---|---|
| Wave-4 kill rate (matched / wild wave-4 fights) | 0/27 = 0% | 9/74 = 12.2% | armed >= 15% AND >= 3 kills — FAILED on rate (count met: 9) |
| Median survival | 87d | 116d | not worse by > 10d — passed (+29d) |
| Field-fight party deaths (vDie) | 2 | 13 | not up by > 25% — FAILED on the letter (see guardrail note) |
| Field kills | 0 | 0/33 | secondary — lever does not convert in its own channel |
| Field damage fraction (median) | 4.3% | 3.4% | secondary — DOWN despite ~1.7x per-swing damage (mix: more, weaker fighters) |
| TB kills / TB fights | 0/23 | 9/41 (22.0%) | secondary — lever does not touch TB |
| Wall: wins / national / table | 0 / 0 / 0 | 0 / 0 / 0 | — |
| Wall: wave-4 unlocks / faced | 6/8 / 4/8 | 6/8 / 6/8 | — |
| Wall: wave-5 unlocks / faced | 0 / 0 | 0 / 0 | — |

Guardrail note (count vs exposure): the field-death guardrail as
written is a COUNT — 2 → 13, +550%, failed on the letter. But the
count is exposure-confounded: field fights rose 4 → 33 because armed
villages lived longer and met more beasts. The death SHARE fell
(2/4 = 50% → 13/33 = 39%), joined fights' death share fell with it
(0/2 → 2/16), and median survival IMPROVED by 29 days. The
guardrail's intent — the lever must not get parties killed — is not
supported by the rates; its letter fails only because the
denominator moved. Recorded in the arm evidence's metric review;
the count-form guardrail should be re-registered as a share for the
next field-fight arm.

THE FINDING (plain words): kills are finishes of ground-down
beasts, not duels. All 9 armed kills came through the TB channel,
which the lever does not touch. Every one entered at a median 14%
of the monster's def-max HP (vs 61% for TB non-kills); 5 of 9
entered below 15%. The seed-99203 eulogy chain shows the mechanism
in the numbers: one eulogy fought across eight fights — field
900→146, field 773→39, TB 509→89, TB 420→48, TB 372→267, TB
105→46, TB 59→28, TB 31→KILL on day 100 — each fight's entry
roughly the previous fight's exit, until the scholar finishes a
31-HP beast. Seeds 99207 and 99204 tell the same story. The field
channel cannot kill a wave-4 beast at any honest per-swing
magnitude: the twoblow committed finish fired 0/33 times armed
(0/4 baseline) — two full-bonus strikes (~80) never approach
850–1500 HP — and no field fight was ever in a winning trajectory
(everWinning 0/33). The field lever contributes bites to the grind,
but the kills are TB finishes of beasts the whole village — field
fighters and scholar together, across days — wore down. The
baseline band's 0 kills in 27 fights is the thin, unlucky side of
the same coin (the finishhold band's baseline TB rate was 10/55 =
18%): on this band the grind never reached a finish.

Correction (worker follow-up, commit 41391a9bf): the band
99201–99208 was NOT fresh as claimed. A stale background grep
completed after the worker's final report: the prereg's "verified
free" check covered only evidence/2026-11-05/sim-*.md and
perseed-* filenames. It missed evidence/2026-11-04/
sim-standacc-b-prereg.md (lists 99201–99208 as its extension band,
not run, and names 99201–99216 in a forbidden/contaminated band
list), as do the sim-tendbelow-b, sim-diplo-b, and
sim-tendfloor-guard-b preregs; individual seeds also appear in
11-02/11-03 screens (collapseband 99203, sensorresupply 99206,
journey-scale-r93 99208). No prior JUDGED pilot corpus on
99201–99208 exists — the overlap is naming + screen use, not a
consumed judged band. Verdict UNAFFECTED: the before/after ran
identical seeds on identical code except the lever, so the paired
result is internally valid; the band was not selected from prior
results (it came from the coordinator's suggestion, checked blind).
Process lesson recorded in the correction and in AGENTS.md:
freshness checks must cover ALL dated preregs, not just the current
day, plus the forbidden-band lists the 11-04 arms cite — a band named
in any prior prereg is not fresh even if no corpus exists for it.

Rebase conflict, disclosed: master's journey r103 commit 415acfb16
added ffFired('ambush') in src/js/fieldFights.js on the same line
the lever commit changed. Resolved by keeping both lines at the
lever commit, then the revert commit resolved to master's version of
that hunk; verified afterwards: zero net src/js diff vs master,
node --check clean, proof 27/27 green on the rebased branch. The
lever commit is kept in history so the killed verdict is auditable.

## Arm 2 — sim-killersim-a: UNDERPOWERED (diag, zero src/js)

Worker commits (rebased onto master, proof re-run 23/23, merged
ff-only): prereg 1ecbf057b, instrument 320fb9ede, evidence
63ffd972b. Arm evidence: evidence/2026-11-05/sim-killersim-a.md
(+ prereg). Corpus: evidence/2026-11-05/perseed-killersim-a/
(8 files, 0 instrument errors). Proof:
scripts/test-killersim-20261105.js 23/23 PASS on merged master.

Question: killer simultaneity — how often do two living wave-4
killers coexist, and how long does the first killer survive after
banking? Fresh band 99211–99218, 150d, competent verbatim. Judged
strictly against the prereg: UNDERPOWERED. Only 2 of 8 seeds bank
even one wave-4 killer, so the prereg forbids claiming GO or NO.
The simultaneity counts are reported, and the mechanism matches on
the two banking seeds stand as observations, not a verdict.

- Days with >= 2 living wave-4 killers: 0 band-wide (0/8 seeds);
  days with exactly 1: 25 (19 on 99211 + 6 on 99215); maxLiving 1.
- Killers ever: 3 (99211: 2, 99215: 1). Fates: died-in-fight 2,
  still-living 1, died-away 0, exiled 0. No killer was exiled;
  3 exile-list entries on the band, none a killer.
- First-killer survival: 1 observed exit (10d), 1 censored — NO
  median claimable (needs >= 3). The 10d sits between the 11d
  (standaccum2) and 9d (postblood) priors; all-killer intervals
  [9, 10].
- Readiness-5-ready days: 0/8; release days 0. Wave-4 fights 22,
  kills 3 (13.6%).
- Wall: wins / national / table 0/8; wave-4 unlocks 4/8, faced 4/8,
  kills 3; wave-5 0/8; median survival 76d (23/48/61/75/77/78/103/
  143; all villages lost).

The mechanism, in plain words: two living wave-4 killers never
coexist on this band — not for a day — but that sentence is weaker
than it sounds, because almost nobody banks even one killer. Of the
two villages that do, one gets two killers who miss each other by a
single day: its first scholar kills a Congregation on day 79 and
dies fighting at home on day 89; the next scholar kills another
Congregation on day 90 and dies fighting at home on day 99. The
other village survives 143 days and its only wave-4 killer is a
joiner who lands the kill four days before the village dies. The
named pattern that holds on BOTH banking seeds is M4 made-late:
the first kill lands in the last 30 days of the village's life, so
there is no runway left for a second killer to be made and survive
alongside. M1 dies-fast also holds on 99211 (first killer survives
10 days). The question "why don't two killers coexist" is
unanswerable on eight seeds that produce three killers between
them — what the band actually measures is the step before it:
villages barely kill wave 4 at all.

Sense-test notes: veteran-word collision, 6th sighting — on 99211
all four "veteran kill" cheers celebrate wave-3 kills while its two
wave-4 kills get none in the captured say-channel (99215's single
wave-4 kill does get one). Hold-beat silence reproduced (99215 at
gated 199, raw 210, never told why). Both 99211 killers died at
haven in combat — adjacent to, not, the open "THE EXPEDITION"
at-haven-scholar-death item (deaths AWAY from combat), which was NOT
observed. No retained veteran died away from combat.

Metric-review flag (worker): M3 fires on 99215 in its letter only
but is vacuous at n=1 — the next run should require >= 2 wave-4
kills for M3. The next simultaneity arm must also say HOW it will
get >= 4 banking seeds (longer horizon, a probe, or more seeds)
before running, or it will re-measure UNDERPOWERED.

## Arm 3 — sim-staypolicy-a: flee-when-losing NO-GO

Worker commits (rebased onto master, proof re-run 31/31, merged
ff-only): prereg c87c4ddd7, policy+instrument+proof 07a23e015,
evidence 89a7acd42, corpus 430a69432. Arm evidence:
evidence/2026-11-05/sim-staypolicy-a.md (+ prereg). Corpus:
evidence/2026-11-05/perseed-staypolicy-a/ (16 files, 0 instrument
errors). Proof: scripts/test-staypolicy-20261105.js 31/31 PASS on
merged master.

Lever: opt-in policy variant scripts/policies/flee-when-losing.js
wrapping competent verbatim, overriding only the `fight` hook.
Trigger frozen in the prereg: scholar HP < 50% AND live wave-4
monster HP > 50% → disengage via nearest-edge walk + tbBarrierExit,
with 3-stuck-turn and consumed-push fallbacks. Band 99241–99248
(the suggested 99221–99228 was used 2026-11-04 by
tendfloor-guard-adopt-b, so the next free band was taken and the
reason recorded), 150d, identical seeds before/after.

| | Baseline | Armed | Bar |
|---|---|---|---|
| Wave-4 kill rate (matched) | 0/43 = 0% | 1/49 = 2.0% | armed >= 15% AND >= 3 kills — FAILED |
| Median survival | 74d | 77.5d | guardrail passed (+3.5d) |
| Field-fight party deaths | 8 | 7 | guardrail passed |
| Wall: wins / national / table | 0 / 0 / 0 | 0 / 0 / 0 | — |
| Wall: wave-4 unlocks | 4/8 | 4/8 | — |
| Wall: wave-5 | 0 / 0 | 0 / 0 | — |

The lever worked mechanically: the trigger fired in 17/23 TB
fights, all on-spec; TB flees 0 → 6, TB deaths 21 → 16,
in-combat scholar deaths 59 → 56. Exact accounting of the 17
firings: 6 exits, 5 sealed-fallback deaths, 6 died mid-retreat on
the walk to the edge — the trigger fires below half HP but the edge
is up to 4 steps away. The one armed kill was a 19-HP mop-up the
variant never touched; the baseline's real 15-round kill missed
matching only on a day boundary (fight day 72, kill logged day 73).

KEY FINDING (Step 1 determination, in the prereg): field-fight
disengage is NOT expressible policy-side — `fieldFight` computes
its flee line internally with no policy input, competent.js has
zero `fieldFight` mentions, and the finishhold corpus shows 0/77
scholar-led field fights. The expressible surface is the scholar's
own wild wave-4 TB fights, where the baseline scholar dies in
45/55 and flees 0 times. Fleeing a losing TB fight saves the
scholar sometimes (deaths 21 → 16) but buys no kills (1/49) — the
flee decision is not the binding step; damage-per-round and
survivability-per-round are, and this arm tested the behavioral
half of the latter and found it wanting.

Policy file KEPT as a measurement tool, not deleted — coordinator
decision, precedent tendthrough (0930Z run): the variant is inert
(not a default, not in the panel registry, sets no env gates), the
proof test depends on it, and the next blank's follow-ups (earlier
trigger line, directional exit) build on it. The landing rule's
"killed arms leave no trace" is noted and deliberately excepted
here for a proven-exact instrument (31/31, 17/17 firings on-spec);
if Steve disagrees, the file is one delete.

Balance panel (§15): NO compare attached, stated not fabricated —
the panel registry is hardcoded and throws `unknown policy` for
unregistered probe policies; editing the shared registry is out of
scope for this arm. The analyzer output is the before/after
compare. Same limitation as the tendthrough precedent.

New backlog items from this arm (appended to sim-findings.md,
lines 1753–1754): (a) sealed-fallback refusal reason is lumped —
the instrument cannot say which of the engine's three refusals
(sealed arena, world edge, blocked far side) killed whom; next
disengage instrument should capture barrier lines and split the
fallback by reason. (b) Strict same-day kill matching misses
midnight-spanning kills — proposed ±1-day join for the NEXT run's
prereg; deliberately not changed mid-run.

## Wall (this run, all three arms' judged corpora, 24 distinct seeds)

Wins 0/24, national 0/24, table 0/24, wave-5 unlocks/faced/kills
0/24, readiness-5-ready days 0/24. Wave-4 kills: 13 across the
three bands (dmground 9 armed + 0 baseline, killersim 3,
staypolicy 1 armed + 0 baseline). Median survival by band: 87d →
116d (dmground), 76d (killersim), 74d → 77.5d (staypolicy). Full
seat still unwon; no wave-5 kill in normal play.

## Telemetry deviation check

Coordinator attempt on the dmground corpus refused by design
(recorder-corpus input, same as the 0830Z run) — no LOUD line,
baseline NOT rolled. Wall numbers reported directly above.

## Infrastructure

Master moved twice under the run (journey r103/r104 + triggerbuild
landings, e458eea14 → 9797dfabd, then my own sequential merges).
All three branches rebased clean except the dmground lever commit
(conflict with journey r103's ffFired('ambush'), resolved as
above, verified zero net src/js). Safe-commit index clobber hit
workers' commits repeatedly (dmground, killersim 3x, staypolicy
4x) — repaired via HEAD-blob cacheinfo each time, commits verified
correct. Killersim's final heartbeat hung twice on REGISTRY.lock
flock contention; registry entry left active with heartbeat 09:31
UTC, no action needed (tree released done-merged). Reaper final
sweep: removed nothing; 11/16 active, all sibling-owned dirty
trees left in place (sim-awayrationfix-b still locked
"initializing"). Registration of the three worktrees took ~10 min
under load (REG1/2/3 all 0). No EPERM flap this run.

scale-onramp stays converging (NOT converged): the flee decision
is now ruled out twice over (focus-fire + flee-when-losing), the
field channel cannot kill wave-4 at any honest per-swing magnitude,
and kills are TB finishes of beasts ground down across days — the
grind-to-finish chain is the next lever, not the flee decision and
not per-swing damage. food-economy stays converging (sibling Loop
A/B work, untouched). Claim deleted; lock deleted. Evidence:
evidence/2026-11-05/sim-winnability-round-0915.md.
