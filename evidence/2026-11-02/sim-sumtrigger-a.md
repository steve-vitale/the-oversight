# sim-sumtrigger-a — sum-trigger muster call (ready by sum, not by every link)

Run: fleshout-loop-a-20261102T0250Z, arm sim-sumtrigger-a, axis scale-onramp.
Worktree branch: sim-sumtrigger-a. Anchor: pilot runs on worktree HEAD
8dc12023 (policy variant + replay + validator; prereg 0b579d59f
committed BEFORE any judged sim). Prereg:
evidence/2026-11-02/sim-sumtrigger-a-prereg.md — judged against it
below; no bar was changed mid-run. POLICY-SIDE ONLY: zero `src/js`
changes, no gates, stages, deed bars, or win prices touched, no
trustedAt / trustedOpinion / quota (6/2) / need (10) values changed,
nothing from the #1538 steve-call queue built. No [needs-eyes]
(policy measurement only, nothing player-facing ships).
Panel (§15): NOT APPLICABLE — trigger-moment census with an
event-triggered intervention (sound-at-refusal via a startCombat
interceptor), not a sweep-compare policy run; the panel driver
consumes sweep-compare rows under its observer, which this replay
harness cannot produce. Same declaration class as quotatrigger /
muster3 / musterroster-adopt. Before/after is done directly on
identical seeds against the quotatrigger corpus. No panel fabricated.

## Verdict: GO (pilot) — the sum trigger fires on 6/8 seeds, every projection exact, every fight won the same day

All five prereg bars PASS (validator scripts/test-sumtrigger-a.js,
0 fails, rerunnable from the corpus alone):

1. Trigger defined on 6/8 pilot seeds (bar >= 6/8 — PASS; baseline
   every-link trigger: 5/8). The one gain is 95425, the bleed seed:
   it fires at its FIRST refusal (day 157) before the bleed, where
   the every-link rule never fired at all.
2. Sounded yield >= 10 on EVERY sounded seed, AND projectedAllies ==
   soundedAllies on every sounded seed (bar — PASS, 6/6 exact).
   Projection fidelity is not assumed: the projection generates
   through the call's own generator, so the sounded call reproduces
   the projection blade for blade (7, 10, 11, 13, 11, 17 allies).
3. Fight outcome + muster casualties RECORDED for every sounded
   call (bar — PASS, 6/6). Every sounded call fought the same day,
   the Herald died the same day, the fight result was 'won' 6/6.
4. Guardrails on every sounded seed (bar — PASS): link count
   unchanged 3->3 on all 6, every responder verified, instrument +
   muster + interceptor + projection errors all 0.
5. Median survival no worse than baseline (bar — PASS): median
   gameDays 134.5d vs baseline median 108d on identical seeds.

Per the prereg, NO confirm is run in this arm: a confirm needs the
next 12 screen qualifiers and the quotatrigger screen stopped at
95446 — resuming it at 95447 is a follow-up run's job,
pre-registered there. This is a pilot GO, not a confirm GO.

## Pilot table (8 seeds, DAYS=180, frozen quotatrigger stack)

| Seed | First contact | Trigger | Proj allies+Haven | Sounded | Haven | Fought | Slain | Tail |
|---|---|---|---|---|---|---|---|---|
| 90111 | day 72 | day 97 | 7+3=10 | 7 | 3 | day 97 | yes | won day 152 (lesser seat) |
| 95411 | day 72 | UNDEFINED | max 4+3=7 | — | — | — | — | died day 82 |
| 95423 | day 115 | UNDEFINED | max 6+3=9 | — | — | — | — | died day 117 |
| 95425 | day 157 | day 157 (1st refusal) | 10+3=13 | 10 | 3 | day 157 | yes | survived 181 |
| 95434 | day 138 | day 138 | 11+3=14 | 11 | 3 | day 138 | yes | survived 180, maxWave 5 |
| 95437 | day 180 | day 180 | 13+3=16 | 13 | 3 | day 180 | yes | survived 180 |
| 95438 | day 86 | day 86 | 11+2=13 | 11 | 2 | day 86 | yes | won day 90 (lesser seat) |
| 95446 | day 71 | day 71 | 17+2=19 | 17 | 2 | day 71 | yes | won day 93 (lesser seat), maxWave 5 |

Validator (scripts/test-sumtrigger-a.js, corpus-only): trigger-rate
PASS 6/8, yield bars PASS 6/6, outcomes PASS 6/6, guardrails PASS,
median PASS 134.5 >= 108. Overall GO.

## The three findings that matter

### 1. 95423: the weakest-link counterexample dissolves — the blocker is arrears, not the untrusted link

The quotatrigger evidence's "6+6+2 = 14" was a quota sum, not a
yield. Emberhold (trust 72, opinion 20) carries arrears 3000, and
`soundTitanCall` REFUSES any link with arrears > 0 — Emberhold
sends nobody. The faithful projection on all 11 day-115 refusals
is 0 + 4 + 2 = 6 allies; with Haven (3 at burst start, decaying to
0 within the burst — see below) the best moment is 9/10: NOT
READY. The naive quota-sum (ignoring refusals) hits 10 on all 11
rows and would have sounded a 9-blade muster that cannot fight —
the validator flags this seed as the sole naive/faithful
divergence. Two consequences, both pre-registered as the fork, now
measured: (a) NO weakest-link veto holds — the untrusted link
(46, base quota 2) still counts its 2; what blocks 95423 is a
refusal, not a weak link. Had Emberhold's arrears been clear, the
faithful projection would be 4 + 4 + 2 = 10 + Haven = ready, and
the untrusted link would NOT have blocked it. (b) A deploy rule
that sounds on quota-sum alone over-sounds: it must respect the
call's refusal rule, or it sends musters that fail the hard gate.
This arm's trigger is the faithful rule, and 95423 correctly never
fires under it.

### 2. 90111: ready-by-sum fires WITHOUT every link trusted — at exactly 10

90111's trigger (day 97) is the cleanest no-veto demonstration in
the pilot: Emberhold trusted (92, quota 6, capped to 3 free
faces), Stonebridge at trust 49 (base quota 2), Thornfield at
trust 68 — two points under the tier (base quota 2) — for 3 + 2 +
2 = 7 allies + 3 Haven = exactly 10. Under the every-link rule
this seed waited for the gap climb to 100/84/83 (day 88); under
the sum rule it fires as soon as the SUM clears 10, untrusted
links and all. The fight was won the same day with zero allied
casualties. Caveat, disclosed not hidden: 90111 is the one seed
where the pre-registered generation side effect visibly moved the
timeline. The quotatrigger run's trigger was day 88 at trusts
100/84/83; the sum run's is day 97 at 92/49/68, after a longer
burst (refusals days 72–75, then 93–97, vs 72–75 then 88) — the
projection-time generation at the 32 pre-trigger refusals consumed
seeded RNG and shifted the trust climb itself, not just its
timing. The other five sounded seeds fired on their FIRST refusal
row (1 projection row each), where generation happens at the
trigger refusal exactly as the call would do it, and their trigger
days match the quotatrigger baseline exactly (138, 180, 86, 71,
157). So: the side effect is real, bounded to seeds with long
pre-trigger refusal tails (here 1/8), and it does not touch the
verdict — but a deployed projection UI would carry the same
generate-to-count cost, and any deploy arm must decide whether
projection generation happens lazily (at the call) or eagerly
(at the check). The tail flip on 90111 (baseline: village-lost
day 99; sum: lesser-seat win, gameDays 152) is entangled with
that divergence AND with the earlier, different fight — it is a
tail observation (n=1), never a claim that the sum trigger wins
runs.

### 3. Fight outcome + muster casualties, measured for the first time

Quotatrigger could not record these; this instrument can, and the
picture is better than the fear and worse than free:

- 6/6 sounded calls convert to a same-day fight, result 'won',
  Herald slain the same day, no later refusals, no later fights,
  muster released after victory. The ready muster does not linger
  — it fights at once and wins, on all six seeds.
- Allied casualties: ZERO on 5/6 fights. The exception is 95438:
  4 of 11 allied responders died in the fight itself (all day 86,
  cause 'combat': Theo Okafor and Sam Silva of Stonebridge, Cole
  Olsen of The Red Table, Kira Fischer of The Red Table III) —
  4 of 13 muster members (31%). The fight was still won the same
  day and the village still won the lesser seat day 90. The cost
  is real, named, and concentrated, not spread thin.
- Haven casualties: ZERO in-fight on all 6 seeds. The run-end fate
  check flags 4 Haven blades 'off-roster' (90111: 2, 95434: 2),
  but the deaths lookup corrects the reading: all four died WEEKS
  after their fights as later bearers (days 121/122 'the wild',
  147 'the wild', 152 'contest') — not in the titan fight. The
  end-of-run fate check conflates fight deaths with later bearer
  deaths; the day-matched deaths lookup is the honest casualty
  count, and it says the titan fights cost Haven nothing.

## Snapshot undercount, re-measured at the trigger

At first-refusal triggers the snapshot still undercounts sounded
yield, by the generated-roster contribution exactly: 95438:
snapshot 0 -> sounded 11 (all three links rosterless); 95437:
4 -> 13; 95446: 6 -> 17; 95434: 7 -> 11; 95425: 8 -> 10
(Stonebridge generated 6 adults, quota 2 -> +2). Range 2–11. On
90111 the trigger snapshot (7) equals the sounded yield (7) —
not a counterexample, but the side effect: 32 earlier projection
rows had already generated those rosters, so by day 97 there was
nothing left to undercount. Projection == sounded on 6/6 is the
strong form of the fix: counting generation makes the projection
exact, not merely less wrong.

## Haven availability moves inside a burst — the first row is the decision

HavenProj is not a stable number across a refusal burst. On 95423
it decays 3 -> 2 -> 0 across the 11 same-day refusals; on 95411 it
grows 0 -> 1 -> 3 across days 72–75. (Mechanism not established —
villagers engage and free up as the day's other business runs;
reported as observed, not explained.) Neither seed's verdict
hinges on the pick: 95423's best moment is 9, 95411's best is 7.
But a deploy rule must project at the moment it sounds, never
from a cached Haven count — and "sound at the first ready
moment" is load-bearing, because a ready muster observed late in
a burst may already have lost its Haven blades. 95411's first
row (4 allies + 0 Haven = 4) is also a small honesty note: at
first contact Haven sometimes has nobody free at all.

## Sense-test (SENSE-TESTING LAW — transcripts read)

All 6 trigger calls read humanly: one fire answering at a time,
named people, the trust-holds line carrying the social
consequence. No list-fed narration — quota and refusal still come
from trust/opinion/arrears only; the roster only names who
answers. The duplicate-first-name wrinkle from quotatrigger
persists unchanged (90111: Kenji Ford + Kenji Delgado; 95438:
Kira Khan + Kira Fischer; 95446: Grace Garcia + Grace Petrov;
95438 also has Fatima Sato + Nadia Sato sharing a surname).
Named people, but the collisions read slightly less like distinct
villagers. Carried as a finding, not new.

## Wall numbers (bands kept separate, never pooled)

Sum pilot (intervened, 8 seeds): national(end) 5/8, table 5/8,
won 3/8, wave-4 8/8, wave-5 2/8 (95434, 95446), median survival
134.5d, max 181d; ends: lesser-seat win (over-other) 3,
village-lost 2, survived 3.
Quotatrigger baseline (same 8 seeds): national(end) 6/8, table
4/8, won 2/8, wave-4 8/8, wave-5 2/8, median 108d, max 180d; ends:
over-other 2, village-lost 3, survived 3.
Read: wave reach identical; the win/table/national deltas are
single-seed tail moves (90111 flips lost->lesser-win with
national 1->0; that is the entangled tail above, n=1 each way)
and must not be claimed as an improvement. No full-seat win on
any pilot seed under either trigger — wins here are lesser-seat
wins, as in the baseline.
Death-cause shares, sum (274 deaths) vs baseline (277): combat
114 vs 115, villager combat 73 vs 72, the wild 43 vs 45,
expedition 14 vs 14, monster 11 vs 12, sickness 4 vs 3, contest 4
vs 5, wound 4 vs 3, arena 2 vs 2, ambush 2 vs 2, starvation 1 vs 2,
Static Kite 1 vs 1, plus sum-only dehydration 1 and baseline-only
'a stranger' 1. The intervention does not distort the death
profile — the muster fight's 4 casualties are inside the normal
'combat' share, not a new death shape.

## Village assessment (plain words)

The village's friendships are still the whole story, but the sum
rule changes which friendships count. On six seeds the village
had done enough of the slow work — not necessarily all of it, but
enough added up — so when the Herald came, the call went out,
seven to seventeen blades marched alongside two or three of
Haven's own, and the sky-tyrant died the same day. On the bleed
seed the village no longer had to watch its friendships wear
thinner while it waited for a perfect moment that never came: it
was ready on the first day, and it went. On two seeds the village
simply had not done the work — one barely acquainted, one with a
friendship in arrears — and no counting trick makes ten blades
out of that. The fight itself is not free: on one seed four named
allies did not come home. But the muster is not a death sentence
either — five fights cost no allied lives at all, and Haven's own
blades all came home from every fight. The call is ready when the
sum says so, and the sum is honest now: it counts the people the
call itself brings into being.

## Metric review (no bar changed here)

1. FAITHFUL VS NAIVE (the pre-registered fork, now measured):
   faithful is the trigger; naive is reported alongside. The one
   divergence seed (95423) proves the fork mattered: naive would
   have sounded a 9-blade muster. Any future arm that cites
   "quota sum" without the refusal rule is citing the naive
   number and must say so.
2. GENERATION SIDE EFFECT (pre-registered, now bounded): 90111
   shows it moves trust trajectories on long pre-trigger tails
   (trigger 88 -> 97, trusts reshaped). 5/6 sounded seeds are
   unaffected (first-row triggers, days match baseline exactly).
   A deploy arm must choose lazy vs eager generation explicitly.
3. HAVEN FATE CONFLATION (instrument limitation, corrected by
   lookup): end-of-run 'off-roster' does NOT mean fight death.
   Day-matched deaths are the casualty count. A future instrument
   should record Haven fates at fight end + run end separately.
4. HAVENPROJ INSTABILITY: Haven availability moves within bursts
   (95423 3 -> 0 same day; 95411 0 -> 3 across days). Projections
   are momentary; never cache them.
5. NATIONAL DEFINITION: END scale rank, same as quotatrigger
   (not ever-national). 90111's national 1 -> 0 flip is an END
   rank flip after its lesser-seat win, not a claim about
   ever-national.
6. PANEL (§15): not applicable (see header). No panel fabricated.
7. CONFIRM DEFERRED: pilot GO only, per prereg. Confirm needs a
   resumed screen at 95447 with its own prereg; it is not
   improvised from this pilot.
8. CHECK SCOPE: unit proof (16/16) + corpus validator (GO, 0
   fails) are the run's tests. The repo-wide check.js green list
   was not run: this arm touches no src/js and changes no game
   behavior, and prior DIAG arms judged on the same basis.

## Corpus

evidence/2026-11-02/perseed-sumtrigger-a/ — pilot.stdout/.stderr
(combined 8-seed run lines), pilot-s<seed>.json (8 judged per-seed
files, each carrying projectionTrajectory, triggerProjection,
fightOutcome, transcript, wall fields, deaths, hashes).
Instruments: scripts/sumtrigger-replay-20261101.js,
scripts/sumtrigger-split-20261101.js, scripts/test-sumtrigger-a.js
(validator, GO 0 fails), scripts/test-sumtrigger-policy.js (unit
proof, 16/16), policy variant scripts/policies/sumtrigger.js.
Baseline: evidence/2026-11-01/perseed-quotatrigger-a/pilot-s<seed>.json
(quotatrigger corpus, identical seeds and stack).

## Blanks filled / documented

- FILLED (evidence): sum trigger judged on 8 seeds — 6/8 fire,
  projection exact 6/6, same-day fight + slain 6/6, casualties
  measured for the first time (95438: 4 allied dead; all other
  fights zero allied/Haven fight deaths), snapshot undercount
  closed by generation-counting (range 2–11 at first-row
  triggers), weakest-link veto disproven as the 95423 blocker
  (arrears is), no-veto firing proven on 90111 (7+3=10 with two
  untrusted links).
- DOCUMENTED (not fixed, out of scope or follow-up): (1)
  projection-time generation moves RNG on long pre-trigger tails
  (90111: trigger 88 -> 97); deploy must choose lazy vs eager
  generation; (2) Haven availability moves within bursts
  (95423 3 -> 0, 95411 0 -> 3) — projections are momentary;
  (3) roster first-name collisions inside a call (carried from
  quotatrigger); (4) confirm needs a resumed screen at 95447
  (follow-up run); (5) 90111 tail flip is entangled (divergence +
  different fight), n=1, not a claim.
- NOT touched per task bounds: #1538 steve-call queue, gates,
  stages, deed bars, win prices, trustedAt / trustedOpinion /
  quota / need values, sibling trees/branches, hidden_files
  (tracker/claims/findings — coordinator-owned).

## Convergence state

scale-onramp: converging, NOT converged. The WHEN-to-sound
question is now answered at pilot strength: the faithful sum
trigger fires more often than every-link (6/8 vs 5/8), never
over-sounds (projection exact, ready 6/6), and converts to a won
fight the same day 6/6 with measured, bounded casualties. But no
game change was built in this run (policy variant only, pending
coordinator merge + a deploy arm's lazy/eager generation call),
no confirm has run, and the full seat remains unwon on every
pilot seed (wins are lesser-seat wins, as in the baseline).
