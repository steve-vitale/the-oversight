# sim-fourthseat-a — EVIDENCE (DIAG — recorder only)

**Arm:** sim-fourthseat-a · **Loop A run:** fleshout-20261128T0015Z · **Branch:** `sim-fourthseat-a`
**Prereg:** this file's §0, frozen 2026-11-28 ~01:00 UTC, before any judged sim.
**Type:** DIAG (instruments + evidence only — no game-code or policy change).
**Base at prereg:** 4504aa4d4 (worktree HEAD).
**Corpus:** `evidence/2026-11-27/perseed-fourthseat-a/` (8 per-seed JSONs).
**Analysis:** `evidence/2026-11-27/fourthseat-a-analysis.json`.

## §0. Pre-registration (frozen before any judged sim)

**Question** (from sim-partydmg-a §8.3, finding #2574): why does the 4th
party seat never appear in wave-4 fights? On the partydmg band (22 fought
expedition wave-4 fights) every fight had exactly 3 fighters — damage
share lead 52.4% / ally1 20.9% / ally2 26.7% / ally3 0 — but that band ran
on a flagged substrate (FIGHTALLY2=1, PARTYSIZE4=1, VETREENGAGE=1,
SENSEEXPED=1). This arm asks the same question on **plain master, no env
flags**, and instruments every layer that could cap the seat: recruitment
(does a 4th companion even exist?), sense (does `villagerFightAllies`
ever return a 3rd id?), engine (does `fieldFight` ever take a 3rd ally?),
and call-in (does the shout ladder ever reach a 3rd join?).

**Primary metric (instrument validity):** classify EVERY fought wave-4
`fieldFight` meeting on the 8-seed band — party-size distribution,
per-seat arrival round + damage, and a named blocker for the missing
4th seat on each seed.

| Frozen bar | Bar | Measured |
|---|---|---|
| Fought wave-4 meetings (pool floor) | ≥ 8 | **141** |
| Classification coverage (fought wave-4 meetings classified) | 1.000, 0 unclassified | **1.000, 0 unclassified** |
| Per-seat damage reconciliation (seat dealt sums to `mDealt`) | residual 0 on every fought fight | **0 on all 141** (log parse + corrected roundsDetail check; see §4) |
| Arrival-round consistency (every joined seat has a known arrival round) | 0 unknown | **0 unknown** (86 joins, all with a known round; 55 solo fights, no join to check) |
| Instrument errors | 0 | **0** |

**Verdict: DIAG-GO.** Every frozen bar is met. The instrument is valid
and the question is answered, not just measured.

**Secondaries:** (a) does a 4th companion ever exist in these villages
(max launch party size; max expedition companions at any fight; max
`winPlan.party` length); (b) how often is the party capped by
recruitment vs by call-in (blocker-layer shares); (c) the sense ledger —
`villagerFightAllies` return-length distribution in the wild.

**Band:** seeds **112201–112208** (fresh — verified before the prereg:
word-boundary grep over all `evidence/*/sim-*-prereg.md` names them in no
prereg — partydmg-a's prereg §6 line 217 already records the fallback
112201–112208 as unused — no evidence filename contains them, and
`sim-findings.md` contains none; no dedicated forbidden/contaminated band
list exists in the goal hidden_files). **Horizon:** 150d death-aware
(reachability lever, waves 4–5; partydmg's band unlocked wave 4 on 8/8
seeds by 150d). **Policy:** competent verbatim, single leg. **Flags:**
NONE — plain master. The driver loud-stops if any of
VETREENGAGE / PARTYSIZE4 / FIGHTALLY2 / ALLYSLOT3 / SENSEEXPED /
FLEEREPAIR2 / DMGPIN / PINQUAD is set, so the corpus cannot be mislabeled
as a plain-master baseline. This corpus also serves as the determinism
cross-check for the sibling arms' baselines: per-seed fought wave-4
counts are recorded for the coordinator to compare.

**Judged population:** fought wave-4 `fieldFight` meetings, ALL origins
(expedition / world-tick / patrol / aid / other), where fought means
rounds ≥ 1. Wave-5 meetings are recorded in the same corpus and reported
as context, not judged. Evades (0 rounds) are counted, not classified
as fights. The scholar's own grid fights (`tbFight`) use a different
seat system (grid placement, party.js) and are out of scope for the seat
classification; if the scholar ever leads a `fieldFight`, the row records
`partyMembers` / `partyCap` at entry.

**Blocker taxonomy (frozen, first match wins):**
- `no-4th-companion` — no 4th companion exists at fight time: expedition
  companions sharing the lead's target < 3 AND `winPlan.party` < 3 AND no
  pinned quad of 3. (Recruitment / launch cap binds first.)
- `sense-cap-2` — a 4th companion exists, but the sense at fight time
  returned < 3 ids (`villagerFightAllies` caps at 2 on plain master).
- `call-site-cap` — the sense returned 3 but the caller passed < 3
  `allyVids` into `fieldFight`. (Should not occur; a loud finding if it does.)
- `engine-slice-2` — 3 `allyVids` passed but the engine sliced to 2
  (ALLYSLOT3 off).
- `fight-ended-first` — 3 allies were available to the engine but the
  fight ended (flee / death / kill) before the 3rd shout could fire.
- `call-in-never-reached` — 3rd seat open and fight long enough, but the
  shout ladder never called the 3rd ally.
- `unclassified` — none of the above explains the row (fails the GO bar).

**Seats:** seat 1 = lead, seat 2 = ally1 (`allyVid`), seat 3 = ally2
(`ally2Vid`), seat 4 = ally3 (`ally3Vid`). Arrival round: door join = 0
(pre-round), shout join = `rec.shoutRound` / `shout2Round` /
`shout3Round`, cross-checked against the `R<n>:`-prefixed "charges in"
log lines. Per-seat damage: lead = `mDealt - allyDealt`; ally1 =
`allyDealt - ally2Dealt - ally3Dealt`; ally2 = `ally2Dealt`; ally3 =
`ally3Dealt` (the engine feeds each ally's damage into the shared
`allyDealt` total as well as its own tally — fieldFights.js:2200,
2683, 2723, 2729).

**Pre-pilot substrate checklist (§14b):** (1) Contact — wave-4 field
fights occur on plain master (partydmg band: 38 wave-4+ meetings, 22
fought; the engine stages them without flags). (2) Pool sizing — floor
8 vs an expected ~20 fought meetings. (3) Verb existence — no new verb
needed; this is a recorder, not a lever. (4) Horizon fit — 150d
contains wave-4 unlocks on 8/8 partydmg seeds.

**Code facts to be VERIFIED by the corpus, not assumed:** sense caps at
2 off-mode (party-wiring.js — 3rd id only with ALLYSLOT3=1 AND
launch.length ≥ 3); engine slices `allyVids` to 2 off-mode and gates
the 2nd/3rd door joins and shouts on FIGHTALLY2=1 / ALLYSLOT3=1
(fieldFights.js:1358, 1395, 1410, 3022, 3058, 3081); launch picks one
companion by default, a 2nd only with VETREENGAGE=1, a 3rd only with
PARTYSIZE4=1 (villager-brain.js:196–340). The corpus must show these
in live fights, not cite them.

**Canon:** no canon doc covers the 4th party seat in wave-4 fights.
PARTY.md covers the scholar's party cap (3 → 4 day 14 → 5 day 30) and
that party members auto-join fights; MONSTER-WAVES.md covers wave-4
bands and gates. The seat caps live in code comments citing findings
(#2496, #2515, #2572, #2583, #2619), not canon — if the corpus shows a
cap the code comments misdescribe, the evidence file says so.

**Single leg, no §15 panel:** a single-leg diagnostic — there is no
before/after pair to compare, so no balanced panel is fabricated. The
frozen bars above are the judge. **No game-code or policy change lands
from this arm.**

**Convergence state:** **converged** (diagnostic; DIAG-GO — the
question is answered with a complete classification on a plain-master
band; the remaining work is a build decision, not more measurement).

## §1. Results

**Answer in one sentence:** the 4th party seat never appears on plain
master because a 4th companion never exists — recruitment caps the
party at holder + 1, the win-plan system never aims a hunt at wave 4,
and no fight ever starts with more than the lead, so the seat has
nothing to sit in. Every deeper cap (sense, engine slice, shout ladder)
is live in code but never gets a chance to bind, except in one narrow
case: 57 sense calls where 3 companions did co-travel, and the sense
returned at most 2 every time.

**Corpus:** 8 seeds, 150d death-aware, competent policy, **no env
flags** (plain master; driver loud-stops if any of the 8 lever flags is
set; `flagsSet: []` on all 8 files). 173 wave-4+ meetings (155 wave-4,
18 wave-5); **141 fought wave-4** meetings judged, 14 evaded (0 rounds,
counted not classified). 0 instrument errors. Anchor
`28ecdd47f116` (instruments commit); wiring/fights/brain/party/policy
SHAs identical on all 8 files.

**Per-seed table** (determinism cross-check for the coordinator —
fought wave-4 counts + `mDealt` totals):

| Seed | Days | End | Max wave | Standing | Deaths | Fought w4 | mDealt |
|---|---|---|---|---|---|---|---|
| 112201 | 109 | village-lost | 4 | 199 | 104 | 22 | 732 |
| 112202 | 146 | village-lost | 4 | 199 | 138 | 26 | 1428 |
| 112203 | 150 | survived | 5 | 465 | 93 | 10 | 364 |
| 112204 | 150 | survived | 4 | 199 | 71 | 5 | 473 |
| 112205 | 150 | survived | 4 | 199 | 121 | 34 | 2580 |
| 112206 | 150 | survived | 4 | 199 | 90 | 16 | 1086 |
| 112207 | 150 | survived | 4 | 199 | 79 | 7 | 396 |
| 112208 | 137 | village-lost | 5 | 390 | 109 | 21 | 1491 |
| **Total** | — | 3 lost / 5 survived | — | — | **805** | **141** | **8550** |

**Seats (141 fought wave-4):** 1 fighter 55 fights (39.0%), 2 fighters
86 (61.0%), 3 fighters **0**, 4 fighters **0**. Party size at fight
start: **1 on all 141** — no wave-4 fight ever starts with an ally at
the door, including the 57 aid fights (`allyFromStart` false on all 58
aid rows; the aid caller passes `allyVids` but never the from-start
flag). By origin: expedition 5, aid 57, world-tick 79. By outcome:
lead flees 106 (75.2%), lead dies 16, monster flees 15, lead kills 4
(2.8% — 3 of the 4 kills had 2 fighters; the 1 solo kill is Omar's
5-round Reunion fight, §3).

**Damage (8,550 total):** lead 5,804 (67.9%), ally1 2,746 (32.1%),
ally2 0, ally3 0. The second fighter, when present, does a real
third of the damage — the seat works when it is filled; it is never
filled past seat 2. Ally1 arrival round: median 2; round 2: 64,
3: 10, 4: 6, 5: 1, 6: 3, 7: 2 — the first hopeless shout is the only
call-in that fires in practice.

**Blocker classification (141/141, first match):**

| Blocker | Fights | Meaning |
|---|---|---|
| `no-4th-companion` | **141 (100%)** | No 4th companion existed at fight time on any layer |
| `sense-cap-2` | 0 | Never reached — a 4th companion never existed to be sensed |
| `call-site-cap` | 0 | Never reached |
| `engine-slice-2` | 0 | Never reached |
| `fight-ended-first` | 0 | Never reached |
| `call-in-never-reached` | 0 | Never reached |
| `unclassified` | **0** | — |

**Does a 4th companion ever exist? No, on any layer:**
- Max expedition companions sharing the lead's target at any fought
  wave-4 fight: **2**. Max `winPlan.party` at a fight: **1** (the plan
  holder alone — plans carry no companions). Max pinned quad: **0**.
  Max sense return at a fight: **2**. Fights with a 4th companion
  present: **0**.
- Launches: 918 departs, 883 `party_launch` actions, but only **181**
  returned `launch` (702 `party_launch` actions held — the plan wanted
  to launch and the depart said no). Launched parties: 166 pairs
  (holder + 1), 15 solo, **max partySize 2, companion2 never set**.
- Win plans never aim at wave 4 at all: 912/918 departs have a null
  target, 6 target wave-3 monsters (`redactor` 5, `spool` 1), **0 target
  a wave-4+ monster**, 0 have `needWave ≥ 4`. The daily wave-4 plan
  census is **0 rows on all 8 seeds** — no villager holds a wave-4 plan
  at any end-of-day. (This was first suspected to be a recorder bug;
  it is real: the departs rows prove plans exist and none is wave-4.
  See §5.)
- Sense ledger in the wild: **42,495 calls**, return-length
  distribution 0: 358, 1: 1,766, 2: 40,371, **max 2, never 3**. The
  one place the sense cap visibly binds: **57 calls where 3 expedition
  companions co-travelled** (max `expedCompanionN` anywhere is 3) — the
  sense returned 1 on 37 of them and 2 on 20, **never 3**. But no
  wave-4 fight ever happens while 3 companions co-travel (max at a
  fight: 2), so the sense cap binds in the wild and never at a fight.

**The second, quieter finding — the call-in ladder only fires when the
lead is losing.** In 52 of the 55 solo fights, allies were passed to
the fight and the sense returned them (44 with senseN = 2) — but nobody
joined, because the lead never shouted. Only 3 solo fights had no ally
passed at all. The shout requires the lead's morale to break; leads
either flee in round 1 (33 of the 55 solo fights last exactly 1 round)
or hold the line without ever breaking. So even seat 2 is gated on
losing, not on need — and seat 3's ladder rung (3rd shout) never gets
asked for because seat 2's rung is the last one the engine reaches.

**Wave-5 context (not judged):** 18 fought wave-5 fights — same shape:
1 fighter 9, 2 fighters 9, never 3; outcomes lead flees 15, lead dies
2, monster flees 1, lead kills 0; mDealt 880 (lead 704 / ally1 176).
Max expedition companions at a wave-5 fight: 0.

**Code facts VERIFIED live by the corpus (prereg §0):** the sense caps
at 2 (max return 2 in 42,495 calls); the engine never fields a 3rd
ally (0 seats 3/4 in 141 + 18 fights); launch picks at most one
companion (max launch party 2, companion2 never set). The code
comments describing these caps are accurate on plain master.

## §2. Wall numbers (scale-onramp axis)

The scale wall holds on this band: **national 0/8, wins 0/8**.
Wave 4 unlocked 8/8, wave 5 unlocked 2/8, median survival 150d
(survival days 109, 137, 146, 150×5), community lost 3/8. Standings:
199 on five seeds (the regional cap band), 390 and 465 on the two
wave-5 seeds. Deaths 805: monster-caused 686 (85.2%), villager-caused
119 (14.8%); top causes villager combat 312, expedition 275, combat
99, the wild 51. The villages survive to wave 5 and then stall at
regional standing — the same wall this axis is measuring, now with the
party-seat mechanism behind it pinned down: wave-4 fights are fought
solo or in pairs, the lead flees 3 times in 4, and the village kills a
wave-4 beast in only 4 of 141 fights.

## §3. Sense-testing

Two full transcripts read, judged on what the people in them are
doing — not on counts.

**Joined fight (seed 112201, day 48, expedition, The Big Beast
"Strike"):** Vinod walks into the monster alone, strikes twice while
his health falls 40 → 13, shouts for help, and Raul charges in on
round 2. Vinod still flees in round 3 with the monster at 1,017 of
1,081 health — the pair dealt 5.9% of it. This reads as a real social
moment (a shout answered by someone nearby) and a real mechanical
failure at the same time: the help arrives late, it is one person, and
the two of them together cannot dent a wave-4 beast. The missing seats
do not read as villagers refusing to help — Raul comes the moment he
is asked. They read as nobody else being asked, because nobody else
was recruited into the expedition.

**Solo fight (seed 112208, day 110, world-tick, "Reunion" / Big Big):**
Omar fights a wounded Reunion alone for five rounds and kills it —
the only solo wave-4 kill in the corpus. The snapshot says two allies
were passed to the fight and the sense returned two. But Omar never
shouts: he keeps "holding the line," working the trick, binding his
wounds, standing on one foot reciting a poem — and the monster dies
without either ally ever being called. This is the call-in ladder
working exactly as written and exactly wrong for the player: a lead
who is holding does not ask for help, so help that is standing by
never arrives. The missing seat here is not "nobody to call" — two
people were there to call. It is a ladder that only rings when the
lead is already losing.

**Verdict on the law:** the missing 4th seat reads as a **mechanical
cap, not a social limit** — at every layer. Villagers do not recruit a
4th companion (launch caps at holder + 1), they do not plan wave-4
hunts (0 wave-4 targets in 918 departs), and they do not start fights
together (party size at start 1 on all 141). Where the social moment
does exist — the shout — it works: allies answer. The cap is upstream
of the social moment, in recruitment and planning, and the one live
sense-cap datapoint (57 calls with 3 co-travellers, sense never
returning the 3rd) shows the next layer would bind too if recruitment
ever produced a 4th.

## §4. Metric review

The frozen bars were met as written, but one check needed a
correction in its implementation, disclosed here in full — the
**metric itself was right, the analyzer's first reading of the
engine's finish-log was wrong**.

**What happened:** the first analyzer run classified 141 fights by
blocker but flagged 40 of them `unclassified` on a single problem,
`roundsDetail-residual`, so coverage printed 0.716 against the frozen
1.000. The log-parse check on the same 40 rows was 0 — the log
itemizes every point of damage — so the two checks disagreed, and the
disagreement was in the instrument, not the data.

**Root cause (engine semantics, verified on the corpus):** a
`roundsDetail` entry records the round's **strike-phase delta only**.
Damage dealt before round 1 — the opening volley, the ambush opening
strike, and the contact finish against a monster already below its
break line ("X closes in and strikes with the [weapon] for N") —
lands in `rec.flPreRoundDealt` and never appears in any roundsDetail
entry. All three channels are lead-only. On the 40 flagged rows the
residual was exactly twice the pre-round damage (the lead's total and
the fight total were each short by the same amount): 35 rows explained
by volley/ambush, 5 by the contact finish (e.g. seed 112203 day 136
Eulogy: all 14 damage was the contact finish; roundsDetail showed
`d0` in every round while the log parsed 14).

**Correction:** the analyzer now reconciles `rdSum + preRound ==
mDealt` and `rdLead + preRound == leadDealt`, where `preRound` is the
engine's own `rec.flPreRoundDealt` when the row carries it, else the
log-derived volley + ambush + contact total. The corrected identity
was verified **independently before the fix was applied**: it holds on
141/141 fought fights. The analyzer was then fixed, the same corpus
re-analyzed (no new sims — analysis only), and coverage printed
1.000 with 0 unclassified, rdResidual 0 and logResidual 0 on all 141.
A selftest fixture (f6, contact finish pre-round) now pins the rule;
proof test 90/90.

**Is this re-scoring? No.** The frozen bar is "seat dealt sums to
`mDealt`, residual 0 on every fought fight." The row arithmetic and
the independent log parse both measured that bar at 0 on all 141 from
the start. The roundsDetail check as first implemented measured a
different quantity (strike-phase deltas) and was mislabeled as the
bar. The correction fixes the instrument to measure the frozen bar;
the corpus, the seeds, the bars, and the blocker taxonomy are
unchanged. The pre-round finding itself is recorded in §5 as an
engine fact, not hidden.

**What the metric did not cover (honest gaps):** the frozen bars judge
instrument validity, not the answer's depth — they say nothing about
whether the 4th seat *should* exist, only that its absence is fully
classified. The sense-cap layer has only 57 live datapoints (calls
with 3 co-travellers); the engine-slice and shout-ladder layers have
zero live datapoints on plain master, because recruitment never
produces a 4th companion for them to act on. A flagged-leg follow-up
(PARTYSIZE4=1 etc.) would be needed to observe those layers — that is
a new arm, not a re-score of this one.

## §5. Instrument notes

- **Driver** `scripts/fourthseat-driver-a.js` — wraps `fieldFight`
  (rich w4fights rows: entry + 4th-companion snapshot at fight time +
  post-call record), `villagerFightAllies` (senseCalls ledger),
  `vbrainExecuteDepart` + `winPlanDepart` (light departs), daily
  planCensus. `rowSeq` resets per seed (partydmg-a §6 lesson). Reuses
  the fight-origin taxonomy and `recoverMHpStart` from the partydmg
  driver. Write-robust against the host write flap.
- **Analyzer** `scripts/analyze-fourthseat-a.js` — `classifyFight`,
  `blockerFor`, `arrivalRounds` (door = 0 / shout round, cross-checked
  vs log "charges in" lines), `roundsDetailSums` (uses `dealt`, not
  `mDealt` — a real bug caught by the proof test). Log strike parse
  reuses `parseStrikes` from `analyze-speardmg-a.js`.
- **Proof test** `scripts/test-fourthseat-a.js` — **90/90** (analyzer
  selftest 25 checks in-process + 65 live across seeds 7, 42, 99;
  staged spear-lead + machete-ally Eulogy fights through the vm
  expeditionMonster trick). Two real bugs caught and fixed during
  proofing: (a) `roundsDetailSums` read `r.mDealt` (always 0) instead
  of `r.dealt`; (b) the proof fixture initially used lead HP 40 (dies
  round 1 before morale eval) and took the first fought row — changed
  to HP 100 and preference for joined + damage-dealing rows.
- **RoundsDetail pre-round correction (this run):** the analyzer's
  first reconciliation flagged 40/141 fights; root cause was the
  engine's finish-log recording strike-phase deltas only, with
  pre-round volley/ambush/contact-finish damage in
  `rec.flPreRoundDealt`. Corrected identity verified 141/141 before
  the fix was applied; selftest fixture f6 pins it. The driver now
  also records `flPreRoundDealt` on each row for future arms (the
  112201–112208 corpus predates the field; the analyzer falls back to
  the log-derived total for those rows).
- **planCensus = 0 — investigated, real, not a bug:** the daily census
  returned 0 wave-4 plans on all 8 seeds despite 918 departs rows.
  The departs rows explain it: 912/918 plans have a null target and
  the other 6 target wave-3 monsters; no plan anywhere targets wave 4
  or carries `needWave ≥ 4`. The census filter (`planIsWave4`) is the
  same predicate the departs analysis uses, so 0 census rows is the
  correct report of "no wave-4 plan ever exists at end-of-day." The
  `winPlanDepart` wrap recorded 0 rows for the same reason (its
  wave-4 filter never matched), not because the function is uncalled.
- **Aid door-join never fires:** `allyFromStart` false on all 58 aid
  rows, so party size at fight start is 1 on all 141 fights. The aid
  caller passes `allyVids` but not the from-start flag — recorded
  here, not changed (DIAG arm).
- **Launch friction (secondary):** 702 of 883 `party_launch` actions
  returned `hold` — plans want to launch parties far more often than
  departs let them. Out of this arm's scope to explain; noted for a
  launch-focused arm.
- **Safe-commit index clobber** struck twice (after the prereg commit
  and after the instruments commit): committed files showed as
  staged-deleted in the main index. Repaired both times with
  `git ls-tree -r HEAD -- <paths> | git update-index --add
  --index-info`, verified `git status` clean + `git diff HEAD` empty
  + hash-object matches HEAD blob. Worktree clean at 28ecdd47f before
  the corpus ran.
- **Heartbeat:** one attempt skipped ("registry lock held > 120s");
  retried later and landed.

## §6. Next arm

The question is answered; the next work is a **build decision, not
more measurement** — and it is Steve's call, because it touches the
launch caps (PARTYSIZE4 / VETREENGAGE) and the win-plan target
selection, both live game systems.

If Steve wants the layers below recruitment observed, the follow-up
is a flagged-leg arm on the same band: PARTYSIZE4=1 + VETREENGAGE=1
(recruitment produces a 3rd/4th companion) with the same recorder,
asking whether the sense, the engine slice, or the shout ladder then
binds — the layers this arm could not observe because recruitment
never produced a 4th. A second, smaller question this corpus raises
and leaves open: why 702 of 883 `party_launch` actions return `hold`
(launch friction), and whether the shout ladder should fire on need
rather than only on the lead losing (52 fights where allies stood by
uncalled). Either is a DIAG arm of the same shape; neither should be
folded into a build arm without a prereg of its own.

## §7. Village assessment (plain words)

The villages on this band meet the big wave-4 monsters the way a
single person meets a bear: alone, usually, and they run. In 141
fought wave-4 fights, nobody ever had three companions — most fights
had one person, the best had two, and the second person only arrived
after the first one shouted for help while already losing. The
villages never even try to hunt these monsters as a plan: in 918
departures, not one plan named a wave-4 monster as its target. And
yet the help is there — in 52 fights where one person fought alone,
friends were standing by who could have joined, and nobody called
them, because the rule is that you only call for help when you are
already losing. Three villages out of eight died outright; the other
five survived to the end of the count but none reached the wider
standing the game needs, and none won. The wall is not that villagers
will not help each other — when asked, they come. The wall is that the
village never puts a hunting party together in the first place.
