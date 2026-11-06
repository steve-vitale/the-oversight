# Winnability round 0730 — killerwild DIAG (no build) + linkseek GO/GO (Loop B, 2026-11-06)

Run: fleshout-loop-b-20261106T0730Z, axis scale-onramp / winnability chain.
Loop A live on scale-onramp for the first part of the run (0615Z claim, arms
sim-stageally-a + sim-finishprobe-a) — NOT touched; Loop A landed mid-run
(coordinator closeout 2adba271a: stageally GO merged, finishprobe DIAG-GO /
Stage-2 NO-GO merged) and its next run (0821Z, food-economy lingerer-gorge +
moot-summon) started after — NOT touched. No new sims by this run beyond the
two arms below. Two policy-side arms, non-overlapping files, shared pilot
band 56001–56008 (verified fresh: 0 hits in all committed preregs + 0 hits
in all evidence .md; only substring hits were commit-hash fragments).
No gate/price/deed/readyDemand change in either arm. No game-code change
in either arm.

## Outcome: 2 arms LANDED, merged locally pending ship

- sim-killerwild-b — DIAG, no Stage 1 build (merged b5fb49607).
- sim-linkseek-b — GO (pilot) + GO (confirm, stronger) (merged 430fd80ac).
- The policy IS the lever on linkseek: `scripts/policies/linkseek.js`
  lands as the competent-variant; `competent` stays the pinned scale-free
  baseline.

## Arm 1 — killerwild: DIAG, no build

Evidence: evidence/2026-11-06/sim-killerwild-b.md (+ prereg efacb3243,
addendum e3ecb0fab + number fix c944a616b, corpus
perseed-killerwild-b/, proof scripts/test-killerwild-20261106.js 20/20,
re-run green on the rebased tip and on merged master). Baseline =
tbretreat-refind policy (the current best), 56001–56008, 150d death-aware.

Verdict: DIAG. First wave-4 killers do NOT die in the wild on this band —
they die at home, where retreat doesn't exist. Death channels, dead first
killers (n=5): TB-home 4, other:combat 1, TB-wild 0, field 0, arena 0,
expedition 0, contest 0. Across all 84 scholar deaths: 81 at haven, 3 away.
Trigger coverage on the 4 TB-home first-killer deaths: haven-hold 1,
no-fire 2, no-fire-other-fighter 1. Refind fires on the band: 15 total —
10 haven-holds, 2 exits, 1 consumed-worldEdge, 2 open.

Why no build: the brief's leading candidate (killer-aware earlier retreat
trigger) is falsified on this band — at haven the flee direction is null,
so the trigger holds at any threshold, proven by the one fired TB-home
death (dale, Audit, s0.69/m0.763, held and died). The no-fire deaths were
also at haven (no barrier line on any fatal death day), so firing would
have held too. Alternatives examined and rejected in the addendum:
last-stand/fight-harder (no identified gap — competent already presses
abilities; no per-turn trace shows a missing action), avoid-haven (not a
defined policy mechanism; monsters come to haven), party levers (Loop A's
live arm, not duplicated), NPC protection (engine-driven). No
policy-actionable lever replaces the trigger on this evidence.

Baseline primary (prereg rule): first killers alive 14d after first blood
= 2/8 (1/8 excluding the anomalous 56001 Tumelo seed — see findings).
First killers blooded on 5/8 seeds (7 killers ever); 3 seeds faced wave 4
7–11 times and killed nothing. Kill-to-death median 5.5d (n=6).

Wall (baseline): wins 0/8, national 0/8, table 0/8, wave-4 unlocks 8/8,
wave-4 faced 8/8, wave-5 unlocks 1/8 (56004, standing 250 — never faced
wave 5), readiness-5-ready days 0/8, median survival 87.5d, survived
horizon 0/8. Wave 4 is now universally reached and faced (8/8) — the
unlock is no longer the wall on this band; the wall sits past it.

Findings appended to hidden_files/sim-findings.md (3): Tumelo record
disagreement (companion fallen 'combat' + health 0, yet dead-flag alive,
speaks at the grave, engine credits a living veteran — needs a code read
of companion TB-death vp.dead vs fallen); haven concentration (81/84
scholar deaths at haven — raid-by-design vs encounter-at-scholar-location
needs a code read); no-fire mechanism (56006 never fired the trigger in
12 wave-4 fights — needs a per-turn fight trace).

## Arm 2 — linkseek: GO (pilot) + GO (confirm, stronger)

Evidence: evidence/2026-11-06/sim-linkseek-b.md (+ prereg cf77307bc,
corpus perseed-linkseek-b/ — 16 pilot + 16 confirm legs + 2 analysis
JSONs, panels panel-linkseek-*/, proof scripts/test-linkseek-20261106.js
11/11, re-run green on the rebased tip and on merged master). Baseline
competent verbatim vs armed linkseek (competent + travel-to-known + codex
study + leadcourt propose/answer/tend verbatim), 150d death-aware.

Verdict: GO on both cells, confirm stronger than pilot. The standaccum
blank #1 is answered: villages were never strangers — they were never
asked. Under competent play the scholar knows other villages by day 4 on
15/16 seeds (rumor day 2–3, or smoke seen while foraging) and then never
once proposes a bond — competent contains no ask at all (0 proposeLink
calls on 16/16 baseline seeds, pinned by a live 30-day spy test). When
the seeking policy asks, villages say yes: 47 proposals, 45 accepted
outright, 2 counter-offers — both answered the next day and formed;
0 declines, 0 shut doors. Bonds form at trust 30, season at 30 days if
trust holds 40+, and the moment the third subordinate seasons, the realm
exists and all three pay at once: diplomacy 0 → 102 in a single step.

Pilot (56001–56008): seasoned link + diplomacy >0 on 4/8; 24/24 proposals
formed, 0 counters. Guards: median survival 86 → 97 (1.13×); wave-4
ledger 6 → 3 (exactly the 0.5× boundary — thin, see metric review).
Confirm (57001–57008, fresh seeds): seasoned link on 7/8 (57008
seasoning-blocked: its only link bled 47 → 6 and dissolved). Guards:
survival 90 → 100 (1.11×); ledger4 3 → 9 (kills UP).
Pooled 16 seeds: seasoned links 11/16 armed vs 0/16 baseline; end-rank
national+ 8/16 armed vs 0/16 baseline; wins 0/16 both; wave-5 unlocks
baseline 1/16, armed 0/16 (veterans still bind — diplomacy pays the
standing, the door still needs 2 living veterans).

Mechanism (verified in code): LEAD regional+ needs `polityOf('haven')` =
≥3 *seasoned* subordinates — two seasoned bonds are a pact, not a realm.
This resolves the pilot's "seasoned but diplomacy 0" seeds. Correction to
standaccum shorthand: a seasoned *splinter* link DOES count once the
polity exists (57007 d113).

What still blocks it is the HOLD, not the ask: trust bleeds (40 → 8,
47 → 6) faster than weekly +8 tends on ~half the seeds.

Wall (pilot + confirm pooled, 16 seeds per leg): baseline wins 0/16,
national+ (end) 0/16, table (end) 0/16, wave-4 unlock 14/16, wave-4 faced
14/16, wave-5 unlock 1/16, median 88d, survivors 1/16. Armed wins 0/16,
national+ (end) 8/16, table (end) 0/16, wave-4 unlock 13/16, wave-4 faced
13/16, wave-5 unlock 0/16, median 99d, survivors 1/16. Panel (pilot):
peak-rank national+ 4/8 armed vs 0/8; table ever-reached 3/8 armed vs
0/8, entered 0/8 both. National is a LIVE state, not a title: it clears
when the realm dissolves (56007/56008 peaked national, ended regional).

## Wall (this run's judged corpora pooled)

- Wins 0 everywhere (killerwild 0/8, linkseek 0/32 configs).
- National: killerwild 0/8; linkseek end-rank 8/16 armed vs 0/16
  baseline — the first measured national reach on a diplomacy road.
- Table: ever-reached 3/8 armed (linkseek pilot panel) vs 0/8 baseline;
  entered 0 everywhere.
- Wave-5 unlocks: killerwild 1/8 baseline (never faced); linkseek
  baseline 1/16, armed 0/16. Wave-5 kills: 0 across the run.
- No seed banks 2 living wave-4 killers and sits, in either arm.
- Median survival: killerwild 87.5d; linkseek 88d baseline / 99d armed.

## Telemetry deviation check

- killerwild: the tool REFUSES recorder corpora by design (same as every
  prior killer-chain arm) — no LOUD lines, wall numbers reported directly.
- linkseek: run by the coordinator on the per-seed glob — 3 LOUD lines
  (national 12 → 0, table 16 → 0, wins 16 → 0), investigated, NOT a
  regression: the baseline file's own regime note forbids comparing
  pre-seat substrates against the winseat regime, and the per-seed rows
  carry no top-level national/table/wins fields (counted as 0). The arm's
  own paired comparison shows national+ 8/16 armed vs 0/16 baseline.
  Baseline NOT rolled.
- Balance panel (§15): linkseek combined panel (both policies, 16 cases,
  sourcesStable, neutrality proofs match, cohort issues none) in
  evidence/2026-11-06/panel-linkseek-both/; the `compare` tool returned
  "invalid — unmatched policies" (a flag-flip tool, not a policy-vs-policy
  tool), so the matched-seed paired comparison is the §15 instrument here
  (awayeve precedent). Single-policy panels + invalid compare kept as
  record. Killerwild is a single-policy diag — no panel compare applies.

## Infrastructure

- Pre-flight: main tree clean (0 lines), disk 25%, reaper active 6/16,
  removed nothing sibling-owned. B lock created 07:30:25Z; claim written
  before any sims. Loop A live throughout the first half (0615Z); its
  trees and arms were never touched.
- Registry-lock contention all run: registration of the two trees took
  ~7 min (queued behind sibling registrations); the reaper took ~7 min
  at run start; heartbeats occasionally slow. Nothing failed; every
  queued operation eventually landed. The lock is a throughput tax under
  concurrent lanes, not a correctness problem.
- Master moved under the run (Loop A 0615Z closeout 2adba271a, journey
  r109 ×3, plus this run's own killerwild merge b5fb49607 between the
  two arm landings). Both branches rebased clean in their own worktrees
  (4/4 each, zero conflicts), proofs green after every rebase and on
  merged master (killerwild 20/20, linkseek 11/11).
- Safe-commit index clobber hit both workers' commits (killerwild 3 of 4,
  linkseek all 4) — repaired via HEAD-blob cacheinfo each time, commits
  verified correct, main tree clean at closeout. No EPERM flap blocked
  this run. check.js --quick (linkseek worker): 283 passed, 7 failed —
  all 7 pre-existing on the pristine base (verified by stashing the
  registry edit); none touches sweep-compare/linkseek/standing/hierarchy.
  Zero src/js on master from this run (linkseek's only shared-file change
  is the additive panel-registry entry in scripts/sweep-compare.js).
- Linkseek worker caveat: its final heartbeat call hung on a slow /
  contended registry write and was killed after its memory note landed;
  tree state re-verified clean immediately after; heartbeats had
  succeeded repeatedly during the run.
- Loop A's 0615Z coordinator re-verification note (from its tracker
  entry, read at closeout): stageally's GO pair route did NOT reproduce
  on the merged tip (55007 killed 1, not 6) — confirm on reserved band
  53001–53008 is owed before anyone leans on the GO. Recorded here, not
  re-run.

## Metric review (for the NEXT run, not this one)

- The pilot ledger guard read exactly at its boundary (linkseek pilot
  ledger4 6 → 3, 0.5×) and reversed on confirm (3 → 9, kills UP). A
  guard that flips sign between pilot and confirm on a 6-vs-3 denominator
  is noise-prone; future linkseek-style arms should pre-register the
  ledger guard on pooled counts or a higher floor, not a single-cell
  ratio. The confirm's kill direction (UP) is the number to cite.
- The gross-flip judge earned its keep again on the pilot boundary: the
  pilot's thin ledger guard must not be re-read as a kill cost — the
  confirm settles it.
- Killerwild's primary (first killers alive 14d after first blood) is
  reported 2/8 by rule and 1/8 excluding the Tumelo seed; the disagreement
  is a measurement question (companion TB-death records), not a verdict
  choice — the prereg's deadMap rule agrees with the engine's readiness
  count and is kept.
- The wave-5 unlock on linkseek baseline 56004 (gated 199 → 250, no
  snapshot showing readiness-5 met) is reported as observed with the
  mechanism as between-snapshot inference (a d110 wave-4 kill most likely
  made the second living veteran, readiness flickered true, wave 5
  unlocked, village collapsed the next day) — not as a named day/bar.
  Snapshot cadence cannot catch a one-day readiness flicker; a future
  arm that needs the unlock day should snapshot readiness per fight, not
  per day.
- The 199-hold keeps its name: on the three 199-held linkseek pilot seeds
  and the killerwild 56004 unlock, standing opened the door and veterans
  kept it shut. Diplomacy pays 102 and still does not move the veterans
  bar.

## Village assessment (plain words)

Two different villages in one run. In the first, eight villages play with
the best retreat policy yet built and all die before the season ends; the
fighters who blood a wave-4 beast die at home within days, most within
ten, two the very day they blood — not ambushed out in the wilds, but
standing at the fire while the beasts come to them, and the retreat that
saves a fighter in the wild is no help at home because home is where
they already are. In the second, sixteen villages each play twice: once
by a scholar who never asks, once by one who walks to the neighbors'
fires and asks. The ones who never ask know the neighbors' names by the
first week and die without ever shaking their hands. The ones who ask are
answered — three bonds each, tribute wagons at the gate, a realm that
pays 102 standing the moment it exists, villages climbing to national
and even global, three touching the table's edge. And still nobody wins:
the fifth wave's door still wants two living fighters who have killed its
beasts, and the bonds don't fight that fight. What the run filled is the
diplomacy blank — bonds are a live road now, measured, with a policy that
walks it. What it leaves is the holding of them, trust bleeding out
faster than grain can buy it back, and the veterans the door still waits
for.

## Next blanks, in order

1. Confirm stageally on the reserved fresh band 53001–53008 (Loop A's
   next blank #1, still owed — its GO rests on one seed and did not
   reproduce on the new base).
2. The HOLD — instrument per-link-week trust-bleed eaters (tribute
   shortfall vs speaker death vs defense refusal vs neglect) and test a
   hold lever (linkseek next blank #1).
3. What happens inside the fight once company is there — damage, staying,
   finishing with allies present (Loop A's next blank #2; TB survival
   still 17.3% with allies present).
4. Veterans-production + killer survival (still the wave-5 binding bar;
   linkseek next blank #2; killerwild sharpened the death channel to
   home fights).
5. First-proposal delay 25–58d (linkseek next blank #3).
6. Travel-leg marginal value — propose-first variant (linkseek next
   blank #5).
7. Balance levers (survival time / damage per strike / entry HP) —
   Steve call.
8. Withdrawn-table question — Steve call.
9. Flee-repair game-code port — Steve call.

scale-onramp stays converging (NOT converged): diplomacy is now a
measured live road (national reached 8/16 armed, table touched 3/8) and
the wild-death premise is corrected (killers die at home, not in the
wild), but wins are still 0 everywhere, wave-5 kills still 0, and no seed
banks two living wave-4 killers and sits. The binding constraint is now
two named problems: holding the realm, and veterans who survive the home
fight. food-economy stays converging (NOT converged): untouched by this
run (Loop A's 0821Z run is live on it now). Claim deleted; lock deleted.
Evidence: evidence/2026-11-06/sim-winnability-round-0730.md (this file).
