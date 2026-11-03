# Wave-5-fought wall, competent-policy population diagnostic (run fleshout-20261103T0940Z, Loop A, axis scale-onramp, arm sim-w5faced-a, 0815Z blank 3)

Diagnostic only: zero `src/js` changes, zero policy changes, zero default
flips. New files only: prereg, instrument, driver, analyzer, proof test,
per-seed corpus, this evidence file. No file overlaps the sibling arm
sim-sortietarget-a (`src/js/havenGrowth.js`, `src/js/app.js` untouched).

## Prereg and staging (judged on the prereg, per MEASUREMENT §§9–12, 14–15)

- Prereg: `scripts/w5faced-competent-prereg-20261103.md`, commit
  c3aa943dc — committed BEFORE any judged sim.
- Instruments: `scripts/w5faced-competent-instrument-20261103.js`,
  `scripts/w5faced-competent-driver-20261103.js`,
  `scripts/w5faced-competent-analyze-20261103.js`, commit 4daf2b73a.
  Proof test `scripts/test-w5faced-competent-20261103.js` → 30/30
  (campaignOnly split, fight-start pre-call capture, tbEnd pre-call
  fighter snapshot + fightSeq join, analyzer fixture rates).
- Policy: `scripts/policies/competent.js` `{competent}` VERBATIM, default
  env. This is the point of the arm: what an ordinary competent village
  meets, not what the 0316Z closecommit seat-driving stack could force.
- Horizon: 180 days, death-aware (runDays ends on death/win). Pilot 8
  fresh seeds 98901–98908 (19m07s); confirm 12 fresh seeds 98911–98922
  (18m03s) triggered by the prereg rule (pilot instrument clean — see
  diagnostic-complete below). Total N = 20. Anchor commit for all 20
  legs: 4daf2b73a.
- What was NOT re-run: the 0316Z closecommit selected-unlocked-seed
  corpus (`evidence/2026-11-03/sim-w5faced-a.md`). Its verdict stands
  for selected seeds; this arm measures the unselected population rate
  that corpus could not give.

## Diagnostic verdict: COMPLETE (all 5 prereg criteria met)

1. Pilot instrument clean: `instrumentErrors` = 0 on all 20 seeds.
   Wrapper fire totals over N = 20: target 1240, cast 324, spawn 985,
   trigger 1, start 412, tbEnd 418, field 1567, remove 765. Every zero
   below is therefore a measured zero with a firing wrapper behind it —
   except trigger, whose single fire (seed 98908, a non-w5 trigger) is
   itself the measurement: `triggerEncounter()` is a rare path in
   competent play, and its w5 count of 0 is a genuine rarity, not
   instrument silence.
2. Fight identity captured at fight start on every start row
   (startWrapFires = startRows on every seed); tbEnd rows carry a
   pre-call fighter snapshot. No post-return `tbfight.id` wrap exists
   anywhere in this arm (the 0815Z failure mode). tbEnd→start join:
   4/4 wave-5 starts joined by fightSeq. Caveat, reported not hidden:
   `monsterId` on tbEnd rows is readable on 0/418 rows — the fight
   object carries no monsterId pre-call; fighter ids carry the join.
   Fights not started via `startCombat` (arena etc.) therefore cannot
   be monster-attributed from tbEnd alone; no wave-5 fight in this
   corpus falls in that class (all 4 w5 starts are startCombat rows).
3. Analyzer reproduces the per-seed chain for every seed; aggregate
   below reports population rates (denominator = all 20 runs) first,
   conditional rates labeled second.
4. Confirm ran (12 seeds) under the prereg rule; N = 20 total.
5. Sense read done on the recovered 98903 transcript (see below; the
   /tmp says wipe and the exact-reproduction replay are documented
   under Infrastructure).

## Leg (a) — SPAWN SCARCITY, population rates (denominator = 20 runs)

| stage | seeds reaching it | rate |
|---|---|---|
| unlocked wave 5 | 1 (98903) | 1/20 |
| fight-candidate wave-5 spawn (campaignOnly excluded) | 1 (98903) | 1/20 |
| faced >= 1 distinct wave-5 kind | 1 (98903) | 1/20 |
| fought >= 1 wave-5 fight (start or field) | 1 (98903) | 1/20 |
| killed >= 1 wave-5 monster | 0 | 0/20 |
| campaignOnly wave-5 spawns (finale_crew/opening) | 0 seeds, 0 rows | 0 total |

Totals over 20 runs: target→5 calls 6 (all on 98903), cast→5 1, spawns
5 (all fight-candidate, all on 98903), trigger→5 0, starts 4, fields 0,
distinct faced kinds 2. The 0316Z campaignOnly-inflation caveat did not
bite here: raw spawnW5 (5) already equals fight-candidate spawnW5 (5) —
but the split is now in the instrument, so a future corpus cannot
silently re-inflate.

Per-seed table (days, end, scale, maxWave, max gated standing, distinct
w4 faced at end, distinct w5 faced at end):

| seed | days | end | scale | maxWave | maxStanding | w4 | w5 |
|---|---|---|---|---|---|---|---|
| 98901 | 94 | village-lost | village | 3 | 95 | 0 | 0 |
| 98902 | 29 | village-lost | village | 2 | 20 | 0 | 0 |
| 98903 | 107 | village-lost | village | 5 | 225 | 5 | 2 |
| 98904 | 129 | village-lost | village | 4 | 145 | 2 | 0 |
| 98905 | 111 | village-lost | village | 4 | 140 | 1 | 0 |
| 98906 | 112 | village-lost | village | 4 | 140 | 1 | 0 |
| 98907 | 34 | village-lost | village | 3 | 0 | 0 | 0 |
| 98908 | 157 | village-lost | village | 4 | 199 | 5 | 0 |
| 98911 | 110 | village-lost | village | 3 | 95 | 0 | 0 |
| 98912 | 179 | village-lost | village | 4 | 199 | 5 | 0 |
| 98913 | 158 | village-lost | village | 4 | 199 | 4 | 0 |
| 98914 | 85 | village-lost | village | 4 | 199 | 3 | 0 |
| 98915 | 132 | village-lost | village | 4 | 150 | 2 | 0 |
| 98916 | 144 | village-lost | village | 4 | 135 | 7 | 0 |
| 98917 | 53 | village-lost | village | 3 | 40 | 0 | 0 |
| 98918 | 180 | survived (cap) | village | 4 | 125 | 4 | 0 |
| 98919 | 34 | village-lost | village | 2 | 0 | 0 | 0 |
| 98920 | 67 | village-lost | village | 4 | 160 | 3 | 0 |
| 98921 | 180 | survived (cap) | village | 4 | 175 | 4 | 0 |
| 98922 | 29 | village-lost | village | 3 | 0 | 0 | 0 |

## The wall's first leg is NOT spawn scarcity — it is the readiness-5 release

Nineteen of twenty competent villages never unlock wave 5, and the
reason splits cleanly in the standing data (`src/js/standing.js`,
`villageStandingTotal()` — read, not assumed):

- **4 seeds pin at exactly 199** (98908, 98912, 98913, 98914) with raw
  standing 200–340 and capped standing 200–340, wave-4 faced, and
  `holdKind: defer5`. Code: `capped >= t5 && !rd5.ready && peak < 5`
  holds the gated total at t5−1 = 199. Direct check of their daily
  snapshots: **zero readiness-5-ready days on all four seeds**. Their
  end readiness is short on armor, weapons, AND veterans (98914: weapons
  + veterans) — 98908 ends armored 0, armed 1, veterans 0 against demands
  4 / 6 / 2. They did not fail to find wave-5 monsters; they never
  opened the door, because on no day did they simultaneously field the
  demanded armor, weapons, and 2 living wave-4+ veterans.
- **1 seed releases** (98903): readiness-5 turns ready on exactly d95
  (armored 4, armed 6, tricks 23, veterans 2 — the veterans bar moves
  0 → 1 on d92 → 2 on d95), gated standing hits 200, the peak ratchet
  records wave 5, and standing never drops below 200 again (225 at end)
  even as readiness collapses the next day (weapons short d96;
  armor+weapons+veterans short d98+). The endGate still prints
  `holdKind: defer5` because current readiness is short — the ratchet
  floor, not the current hold, is what keeps it at 225. Any reader who
  takes the end snapshot's holdKind at face value will misread this
  seed; the daily trajectory is the evidence.
- **15 seeds never reach the bar at all** (raw < 200 at end), 8 of them
  with wave-4 faced. Facing wave-4 kinds is not the binding constraint
  (98916 faced 7 wave-4 kinds and still ended at 135).

**Correction to the 0316Z closeout's correction.** 0316Z concluded
readiness "does NOT keep wave 5 out of the pool" from a seed that
unlocked at 250 with readiness short at end. That observation is
consistent with this corpus, but the inference is too strong: readiness
gates the RELEASE, not the pool once released. The ratchet reconciles
both: a seed that releases once (98903 here) keeps its wave even as
readiness collapses, exactly as 0316Z's seed did. The correct statement
is: readiness-5 is the population gate — no ready day, no unlock, no
spawns, no fights — and the pool gate (`unlockedWave()` standing +
wave-4 faced) is downstream of it. Any future arm that treats standing
200 as the wave-5 gate without the readiness condition will measure the
wrong mechanism on 19/20 competent runs.

## Leg (b) — THIN CONVERSION, chain on the one unlocked seed (98903)

Unlock d95 at standing 200 (pool full, 6 kinds: cancellation, editor,
rerun, spoiler, timeslot, network_note). Window: 12 days (d95 → death
d107). Chain:

| stage | count | detail |
|---|---|---|
| target→5 calls (post-unlock) | 6 | of 10 post-unlock target calls |
| fight-candidate spawns | 5 | rerun d95 (dist 5), spoiler d98 ×2, cancellation d100 (dist 0), editor d103 (dist 0); 0 campaignOnly |
| cast→5 (wanderer channel) | 1 | editor d96; trigger→5 0 |
| fights (starts) | 4 | all d106, all player-TB, all vs cancellation/editor; field fights 0 |
| kills | 0 | TB joins 4/4; results lost / fled / lost / lost; monsters alive at tbEnd with 831–1174 HP |
| distinct faced kinds | 2 | cancellation, editor — the full-seat bar (2) MET |
| deed progress at end | w5 = 2, dist to 2 = 0 | endGate: wavesOk true, all wave bars met; binding blocker = foodDeeds only (feastSurgeUsed missing) |
| removed without a fight | 3 spawned, never fought | rerun + both spoilers: no fight, no removal row — still wandering at village death |

Conditional rates (labeled, denominator = the 1 unlocked seed):
faced|unlocked 1/1, fought|faced 1/1, killed|fought 0/1. Faced kinds per
unlocked day: 2/12 = 0.167 — faster than 0316Z's ~1 per 25–30 unlocked
days, because this seed's spawns arrived at the player's tile (dist 0)
and converted to fights the same stretch. The conversion story here is
not "spawns don't convert": 2 of 5 spawned instances were fought
(cancellation once, editor three times across re-fights — 4 starts
total); the remaining 3 instances (rerun + 2 spoilers) never converted
and never left, which is the non-conversion residue (see next blank).
The conversion story is lethality + survival: 4 fights, 0
kills, and the fights killed the village (see sense read).

## Sense-testing (transcript read, seed 98903, d95–107; 1520 lines)

- **The arrival lands, as in 0316Z.** d95: "You've gotten too big for
  the story. Ratings are GREAT, by the way — but you're threatening
  the narrative now. So the narrative is fighting back. Meet the
  PRODUCERS."
- **The treeline siege reads as a real village event.** d103 raid
  (Big Ugly, The Editor, The Reunion, The Cancellation); "Nobody met
  The Cancellation — it's still out there at the treeline. It'll gorge
  every night until it's driven off." Nightly gorge lines follow
  (1,000 kcal, then 1,373 kcal) with the honest sortie-or-endure choice.
- **Day 106 is a mantle burn, not a fight.** Four successive scholar
  deaths in wave-5 fights — Regina Nie, Valeria Quispe, Sung Hussain,
  Omar Farouk, each "You go down" then a death line and a grave beat —
  ending "No one is left to pick up the Codex. The village dies out —
  quietly, the way villages do." The Editor's cuts read vividly
  ("The scissors open... YOUR POSITION... CUT — you are suddenly
  elsewhere"), but the outcome is not a contest: the village's
  leadership chain dies in one day against monsters still holding
  831+ HP. Faced-2 was bought with the village's life, the day before
  it died.
- **Rerun and Spoiler are narratively absent, stronger than 0316Z.**
  0316Z's Rerun was announced once, then silent for 13 days. Here both
  kinds have ZERO mentions in the ENTIRE run transcript (10,144 lines)
  despite spawning (rerun d95, spoilers d98) — no arrival line, no
  treeline line, nothing. A player in this village never learns they
  exist.
- **Nothing says a wave-5 fight matters for the full seat.** "wave-5"
  and "full seat" never appear in the window; the table mentions are
  the Red Table village, not the endgame table. A player finishing
  this run learns they met the Producers and died to them; nothing
  tells them the second distinct kind was ever the missing piece, or
  that they had in fact met it.

## Wall numbers (descriptive only, N = 20)

national 0/20, table waiting 0, table done 0, wins 0/20, wave-4 unlocked
13/20, wave-5 unlocked 1/20, median survival 110.5d (range 29–180d),
ends: village-lost 18, survived-to-cap 2 (98918, 98921 — both village
rank, maxWave 4). Scale rank is `village` on all 20 seeds, including
the wave-5 seed: national standing is not what unlocked wave 5 here,
and no seed approached national. Arc II/III/IV reach is NOT reported:
this instrument carries no Arc fields, and no Arc number is claimed
from it — that is a coverage gap for a future instrument, not a zero.
Death-cause shares beyond endReason are likewise not instrumented
(all ends are `village-lost` except the 2 cap survivors); the one
attributed death chain is 98903's day-106 wave-5 fight deaths, read
from transcript, not from a death-cause counter.

## Village assessment, in plain words

No competent village in this band thrived to anything bigger than a
village. Most died trying to get there — half before day 111 — and the
two that survived to the 180-day cap were still single villages that
had faced wave-4 beasts but never come close to wave 5. Four villages
did the hard part — they faced wave-4 monsters, they built standing
past 200 on paper — and then sat pinned at 199 because on no single
day did they have enough armored fighters, armed fighters, and two
living veteran killers at the same time. The one village that did put
that combination together for a single day opened the fifth wave, met
two of its monsters at its own door, could not kill either, and lost
its last four leaders in one day of fighting them. So the wall, as a
competent village experiences it, is three walls in sequence: first
you must assemble a ready fighting force on one day (almost nobody
does); then the monsters you meet are far too strong to kill (the one
village that met them killed none); and the monsters that don't come
to the door at all — the Rerun, the Spoilers — never even announce
themselves.

## Metric review (for the NEXT run only; this run is judged on its prereg)

- The staged counts bound the question fairly: population rates first,
  conditional rates labeled, campaignOnly split applied, fight-start
  capture honored (4/4 joins, 0 post-return reads). The single-seed
  chain is reported as a single-seed chain — the population verdict
  (1/20) does not lean on it alone; the 199-pin mechanism rests on 4
  seeds plus code, and the release-day anatomy on daily snapshots.
- `tbEnd` monsterId readability is 0/418: future instruments should
  join via fightSeq (as here) and never cite a tbEnd monsterId count.
  The trigger wrapper's total fire count (1) must travel with any
  trigger→5 zero cited from this corpus.
- Panel note: no before/after comparison exists in this diagnostic arm
  (no lever, no variant, one policy), so `scripts/balance-panel.js`
  has nothing to compare; the analyzer output over the 20-file corpus
  is the instrument record. No telemetry-baseline roll-forward is
  claimed here — that is the coordinator's call (the telemetry-check
  invocation refuses recorder corpora by design, as in 0316Z/0815Z).
- The loop body's wider metric list (four-realm formation, trap
  acquisition by source, counter discovery/kill rate, young-link
  succession survival, tier-2/wave-3 reach) is outside this arm's
  prereg and is NOT re-scored here, per §14 metric binding. A future
  arm that wants those numbers must pre-register them.

## Precise next blanks this diagnostic names

1. **The readiness-5 release problem (first, blocking).** Why do
   competent villages almost never field armored 4 + armed 6 + veterans
   2 on one day? The veterans bar is the prime suspect (short at end
   on 20/20 seeds, met transiently only on 98903's release day), but
   this instrument cannot say whether veterans fail to be MADE
   (wave-4+ kills not landing), fail to SURVIVE (made then killed), or
   fail to be COUNTED (waveKillLog attribution). Needs a
   veteran-acquisition/attrition instrument (waveKillLog entries +
   veteran deaths over time), measurement-only, policy-side — no game
   code. Until that is measured, any lever aimed at "wave-5 spawn
   rates" is aimed at the wrong stage on 19/20 runs.
2. **Rerun/Spoiler non-engagement + total narration silence
   (carried from 0316Z, now stronger).** 0316Z left "why a spawned,
   following wave-5 monster never converts" open; this corpus adds
   that two spawned kinds never even get a spoken line in 10,144
   lines. Needs a villager/world-monster behavior instrument, not a
   spawn-stage one — this instrument can show them lingering but
   cannot say why they never raid, fight, or speak.
3. **Wave-5 fight lethality (small sample, do not over-claim).** 4
   fights, 0 kills, monsters ending at 831–1174 HP while killing 4
   scholars in a day. A damage-per-fight measurement on a larger
   fought sample would be needed before anyone calls wave-5 fights
   unwinnable rather than merely un-won here.

## Infrastructure

- Safe-commit index clobber struck on both worker commits (prereg
  c3aa943dc, instruments 4daf2b73a) — repaired via HEAD-blob cacheinfo
  each time, commits verified correct, tree clean after repair.
- `/tmp` says wipe: the judged runs' say transcripts (written to
  `/tmp/w5faced-competent-says` by the driver) did not survive a
  service restart mid-run — same class as the 0316Z closeout. Recovery
  followed the 0316Z pattern: a transcript-only replay of seed 98903
  from a `/tmp` scratch script (NOT a judged run, NOT committed,
  writes nothing to the repo) reproduced the judged leg EXACTLY on
  every summary field (107d, village-lost, village, maxWave 5, gateW5
  2, targetW5 6, castW5 1, spawnW5 5, spawnFC 5, startW5 4, fieldW5 0,
  faced [cancellation, editor], errors 0, says 10144). The sense read
  above is from that replay's transcript, verified identical in
  summary — not from an assumed transcript. The scratch replay script
  lives only in /tmp and is not part of this arm's committed files.
- check.js --quick NOT re-run: zero `src/js`, zero default flips,
  standing profile from prior runs (same justification as 0815Z).

## Convergence state

scale-onramp stays converging (NOT converged): the competent-policy
population rate for wave-5 fought is now measured (1/20 faced, 0/20
killed, 0/20 wins, 0/20 national), and the binding stage is now
precisely located upstream of spawn — the readiness-5 release, pinned
at 199 on 4/20 runs — but no game change landed in this arm, the full
seat is still unwon in competent play, and wave-5 killed is still 0.

Diagnostic complete, merged-ready pending coordinator: prereg
c3aa943dc + instruments 4daf2b73a + corpus + this evidence (commit
below). No [needs-eyes] — a diagnostic with no game change and no UI
change.
