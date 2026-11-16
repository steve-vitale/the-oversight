# sim-killfail-a — DIAG-GO: why launched wave-4 parties get 0 kills

Run: fleshout-20261116T0825Z (Loop A), axis scale-onramp, arm
sim-killfail-a. Branch `sim-killfail-a`. Base at arm start: master
`2b552433e` (coordinator evidence, round 0645Z). Prereg:
`evidence/2026-11-16/sim-killfail-a-prereg.md` (frozen before any
judged sim). DIAG, instrument-only: NO src/js change in this arm.

**Adoption note:** the 0825Z coordinator timed out before closeout.
This evidence file was written by the adopting coordinator from the
worker's finished analysis (`killfail-a-analysis.json`, analyzer exit
GO) and the per-seed corpora, both verified on disk in the worktree.
No number here is re-scored or re-derived: every table below is the
analyzer's output, quoted. Proof test re-run on this tip: 115/115
green (see §Proof).

## Verdict: DIAG-GO

All five pre-registered bars pass:

| Bar | Result |
|---|---|
| ≥90% of launched wave-4+ fights classified, all fields | 9/9 = 100.0% — PASS |
| Population floor ≥5 launched fights | 9 — PASS |
| Corpus 8/8 main + 8/8 replication parse, 0 instrument errors | 8/8 + 8/8, 0 errors — PASS |
| Replication matches main (launched fights + kills) | main 9 fights / 0 kills, repl 9 fights / 0 kills — PASS |
| Ranked failure-mode table produced, every non-kill fight carries a primary mode, `other` rows named | 9/9 carry a primary mode, `other` 0 — PASS |

Proof test `scripts/test-killfail-a.js`: **115/115 green** on this
tip (incl. D1 repeatability + D2 wrap neutrality, seed 102041 60d).
§15 panel compare main→replication: **review_required, no material
signal** — before=after identical on all 8 paired seeds (table win
rate 1→1, national scale access 1→1, village deaths 60.5→60.5).
The two legs are the same policy on identical seeds, so the compare
is a replication/neutrality check, and it passes.

## The answer, in plain words

Launched wave-4 parties do reach the beast and do fight it — and
still never kill it. Nine launched fights on a fresh 8-seed band,
zero kills. The modal outcome is not even a fight: six of the nine
parties see the beast and give it room. The three that do fight
deal 3–16% of the monster's health and then run, or die. The
village knew the beast's trick in none of the nine fights — not
one — and every launch left Haven two-strong, below the gate's
three-person bar, even though a third person had joined by the time
of contact in all nine. Ammo is not the binding factor here: six
of nine fighters carried a working ranged weapon with ammunition,
none was dry, and every fighter wore armor at P≥12. The wild
comparison says the same thing louder: 38 wild wave-4 fights on
the same band, also zero kills. This is a wave-4-wide failure, not
a launch-specific one — the launched parties fail the same way the
wild fights fail, just earlier (they mostly evade before contact).

## Population

- Seeds 102041–102048 (fresh band, verified fresh per prereg),
  150d death-aware, policy tableseat-nowait
  (`TABLESEATNOWAIT=1 LEANLINKRESCUE=1` on both legs).
- Launch events (broad): 68 total, 28 broad wave-4+, 5 strict.
  Launched wave-4+ party fights: **9** (seed 102044: 3, seed
  102047: 6; the other six seeds produced zero launched fights).
- Wild wave-4+ fights (comparison set, same band): **38**.
- The 9 launched fights are the population. The 28 broad events
  that produced no fight are not fights — the launch-to-meeting
  gap is a separate question (rumorplan's 27 target-null trips
  already measured it: evade 22, fled 13).

## Outcome table — launched fights (9)

| Outcome | n | What it means |
|---|---|---|
| evade | 6 | Saw the beast, gave it room, no contact fight (0 rounds, 0 damage) |
| mFlee | 1 | Monster fled after 1 round (28 damage, 3% of its HP) |
| vDie | 1 | Fighter died (Wanjiru vs Reunion, 2 rounds, dealt 6%, took 51) |
| vFlee | 1 | Party fled after 3 rounds (dealt 16%, took 73, fighter left at 6 HP) |
| vKill | 0 | — |

## Ranked primary failure modes (9 non-kill fights, frozen precedence)

| Primary mode | n | Fights |
|---|---|---|
| evaded | 6 | Leonora/influencer d51, Carlos/congregation d58, Aisling/eulogy d60, Saule/strike d72, Desmond/reunion d78, Carlos/strike d82 |
| drove-off | 1 | Franz/influencer d54 (1 round, 28 dmg, monster fled) |
| died | 1 | Wanjiru/reunion d86 (2 rounds, 84 dmg, took 51) |
| out-damaged | 1 | Carlos/influencer d72 (3 rounds, 146 dmg = 16%, took 73, fled at 6 HP) |
| other | 0 | — |

## Flag prevalence (multi-label, denominator 9 launched fights)

| Flag | n | Share |
|---|---|---|
| trick-unknown | 9 | 100% — the village knew the trick in none of the nine |
| launched-short | 9 | 100% — every launch left Haven two-strong (party 2, gate bar 3) |
| evaded | 6 | 67% |
| out-damaged | 3 | 33% (dealt <25% of monster HP at entry) |
| mauled | 2 | 22% (took ≥50% of fighter HP at entry) |
| drove-off | 1 | 11% |
| died | 1 | 11% |
| dry-fighter | 0 | 0% — no fighter was dry |
| no-working-range | 0 | 0% — every contact party had a working ranged weapon |
| under-geared | 0 | 0% — every fighter armored P≥12 and effectively armed |
| party-short (at contact) | 0 | 0% — contact party was 3 in all nine |

Two facts deserve emphasis because they cut against the priors.
First, **the launch leaves short but the meeting does not**: launched
party size is 2 on all nine, contact party size is 3 on all nine —
a third person joins en route or at the meeting (allyFromStart
false on the sampled rows). The gate's party-3 bar is met at contact
and the fight still fails, so "launch as 3" alone does not fix the
kill. Second, **trickAfter is false on all nine too**: even the
three fought encounters taught the village nothing — one survived
encounter records one observation and two are needed to teach, so
the trick stays unknown after the fight as well as before it. The
trick pipeline is starved at the observation step, not just at the
gate: wave-4 encounters are rare (9 launched + 38 wild across 8
villages in 150 days) and a single meeting does not teach.

## Per-fight table (every launched fight)

| Seed/Day | Fighter (class, ammo) | Monster | Launch→Contact | Trick | Armor P / HP in | mHP in | Out | Rds | Dealt (%mHP) | Taken | Primary |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 102044 d51 | Leonora Lao (unarmed) | influencer | 2→3 | no | 22 / 91 | 1011 | evade | 0 | 0 (0%) | 0 | evaded |
| 102044 d54 | Franz DeLuca (armed, 9 arrows) | influencer | 2→3 | no | 50 / 100 | 880 | mFlee | 1 | 28 (3%) | 0 | drove-off |
| 102044 d86 | Wanjiru Kamau (armed, 5 bolts) | reunion | 2→3 | no | 21 / 46 | 1322 | vDie | 2 | 84 (6%) | 51 | died |
| 102047 d58 | Carlos Diaz (armed, 5 arrows) | congregation | 2→3 | no | 12 / 100 | 939 | evade | 0 | 0 (0%) | 0 | evaded |
| 102047 d60 | Aisling Tang (unarmed) | eulogy | 2→3 | no | 27 / 73 | 972 | evade | 0 | 0 (0%) | 0 | evaded |
| 102047 d72 | Saule Kozhakhmetova (armed, 4 stones) | strike | 2→3 | no | 22 / 69 | 1012 | evade | 0 | 0 (0%) | 0 | evaded |
| 102047 d72 | Carlos Diaz (armed, 5 arrows) | influencer | 2→3 | no | 12 / 79 | 907 | vFlee | 3 | 146 (16%) | 73 | out-damaged |
| 102047 d78 | Desmond Clarke (unarmed) | reunion | 2→3 | no | 39 / 88 | 1373 | evade | 0 | 0 (0%) | 0 | evaded |
| 102047 d82 | Carlos Diaz (armed, 7 arrows) | strike | 2→3 | no | 36 / 85 | 1185 | evade | 0 | 0 (0%) | 0 | evaded |

Monsters met: influencer ×3, reunion ×2, strike ×2, congregation
×1, eulogy ×1. Monster HP at entry 880–1373 (wave-4 band
850–1500). Gate rows joined to the fights: all read result null —
the gate was not consulted on these meetings (wild meetings bypass
it; expedition meetings consult it only via `winPlanFightGate`).
Target named: none of the nine plans named a beast
(`targetAfter` null on the sampled launch rows; needWave null) —
these are rumor-born hunt-stage launches, the rumorplan
population, exactly as the prereg specified.

## Wild comparison (same band, same classifier)

| | Launched (9) | Wild (38) |
|---|---|---|
| Kills | 0 (0%) | 0 (0%) |
| Median rounds | 0 | 3 |
| Median damage/round | 42* | 15 |
| Median damage fraction | 0 | — |

\* The launched median damage/round is computed over the three
fought fights only; the six evades contribute 0 rounds and 0
damage. Read it as: when a launched party does fight, it deals
roughly triple the wild per-round damage — and still loses,
because the monster has ~1,000 HP and the party leaves after 1–3
rounds. The failure is wave-4-wide, not launch-specific, per the
prereg's metric-review rule.

## Per-seed table

| Seed | Days | End | Won | Rank | Standing | MaxWave | Launch events | Launched fights | Kills | Wild fights |
|---|---|---|---|---|---|---|---|---|---|---|
| 102041 | 100 | over-other | yes | global | 199 | 4 | 0 | 0 | 0 | 5 |
| 102042 | 97 | over-other | yes | global | 199 | 4 | 0 | 0 | 0 | 0 |
| 102043 | 90 | over-other | yes | global | 199 | 4 | 4 | 0 | 0 | 4 |
| 102044 | 94 | over-other | yes | global | 199 | 4 | 26 | 3 | 0 | 11 |
| 102045 | 97 | over-other | yes | global | 199 | 4 | 0 | 0 | 0 | 2 |
| 102046 | 90 | over-other | yes | global | 199 | 4 | 0 | 0 | 0 | 10 |
| 102047 | 90 | over-other | yes | global | 199 | 4 | 38 | 6 | 0 | 6 |
| 102048 | 93 | over-other | yes | national | 199 | 4 | 0 | 0 | 0 | 0 |

## Wall numbers (both legs, identical)

| | Main | Replication |
|---|---|---|
| Wins (driver `won` — seat taken under tableseat-nowait) | 8/8 | 8/8 |
| National at end (scaleRank ≥ 2) | 8/8 | 8/8 |
| National (standing ≥ 200, analyzer wall) | 0/8 | 0/8 |
| Wave-4 unlocked | 8/8 | 8/8 |
| Wave-5 unlocked | 0/8 | 0/8 |
| Median survival | 93.5d | 93.5d |
| Deaths (all causes) | 484 | 484 |
| Starvation deaths | 1 | 1 |
| Scholar deaths | 32 | 32 |

Read the two national lines together, as launchdef-a and
gateconfirm-a did: every seed sits at standing 199 — the
global-seat ceiling under this policy — and none reaches
standing 200. The driver's `won` flag is a seat taken under the
tableseat-nowait policy, not a full-seat win. Nothing here moves
a wall number; this is a DIAG, and the wall is reported for the
record, both definitions, without conflating them.

## Sense check — one launched fight, end to end

Seed 102047, day 72. Carlos Diaz, armed with a bow (5 arrows),
hatchet, armor P12, 79 HP, with Daniella Kimpiatu (bow, phase
blade, P15) and Aisling Tang (machete, P27) at contact. The party
left Haven on a hunt-stage plan naming no beast — a rumor-born
launch, two-strong at departure, three at the meeting. They walk
straight into The Influencer (HP ~907). The fight log, verbatim
from the corpus:

> "Carlos walks straight into The Influencer. No avoiding it."
> "Carlos sees The Influencer coming and nocks an arrow — the
> fight opens at range (2 shots)."
> "loosed wide — the arrow buries itself in the dirt. (spent)"
> "loosed — it takes The Influencer for 18 (889 left)."
> "Carlos lowers the bow — The Influencer is on them now. (1/2 hit)"
> "R1: Carlos strikes for 29 (stalker's opening +4) (860 left)"
> "Carlos's gear absorbs 31."
> "R1: Ratio hits Carlos for 21 (58 left)"
> "R2: Carlos strikes for 27 (833 left)"
> "Carlos's gear absorbs 40."
> "R2: Ratio hits Carlos for 26 (32 left)"
> "Carlos is losing — shouts for help! Daniella charges in!"
> "Carlos's gear absorbs 39."
> "R3: Ratio hits Carlos for 26 (6 left)"
> "R3: Carlos strikes for 23 (810 left)"
> "R3: Daniella strikes for 49 (761 left)"
> "Carlos sees how this ends — and runs while running still works."

Judgment: this reads like a party that went out to hunt and met
something it could not hurt, not like a party that went out to
kill a named beast and failed. The plan named nothing; the
meeting was unchosen ("walks straight into"); the damage is real
but trivial against ~900 HP (146 dealt, 16%); the call for help
lands and still does not turn the fight; the flee at 6 HP is the
sensible ending. Three rounds, then sense prevails. The evade
majority (6/9) is the same judgment made one step earlier — the
party sizes up the beast and gives it room. Nothing here is
broken in the fight engine: the fight is honest, the numbers are
honest, and the party loses honestly. The gap is upstream: no
named target, no trick known, no third launcher at departure.

## Metric review (for the next run, nothing re-scored here)

1. **Launched fights concentrate on 2 of 8 seeds.** 102044 and
   102047 produce all nine; six seeds produce none. The
   population floor (≥5) is met, but the spread is thin — a
   future DIAG on this population should pre-register a
   per-seed floor (e.g. launched fights on ≥3 seeds) or accept
   that two villages carry the whole decomposition.
2. **The analyzer does not carry fight logs into the analysis
   JSON.** The sense-check quote above was pulled from the
   per-seed corpus by hand. The next instrument revision should
   carry one log excerpt per primary mode into the analysis file,
   so the evidence writer does not have to re-join corpora.
   Same for wild per-fight rows (aggregates only in the
   analysis file).
3. **The `won` field needs its plain-words gloss in every
   evidence file.** Under tableseat-nowait it means a seat
   taken at standing 199, not a full-seat win. This file states
   both national definitions for that reason; future arms
   should keep doing so.
4. **Lever candidate (named, NOT built — prereg §Lever
   candidate):** trick-unknown dominates (9/9) alongside
   launched-short (9/9). The prereg's candidate is a
   trick-teaching lever (a survived encounter teaching in one
   observation instead of two), GO bar: launched wave-4+ party
   kill rate ≥ 2× this arm's main-leg rate on a fresh band, 8
   seeds. The party-arrives-as-3 lever is Loop B's gatelever-b
   — already measured, do NOT duplicate; this arm's number is
   its baseline. Note the contact-party finding, though: the
   meeting is already 3-strong, so a launch-as-3 lever must
   show it moves the KILL rate, not just the contact size.
5. **No re-scoring:** the flags, precedence, and join rules are
   the prereg's judge. The wild 0/38 is reported as the
   wave-4-wide reading the prereg required, not as a
   re-scored kill rate.

## Closeout

- Instrument commits: `4a44b5cef` (prereg), `e8e5b7c74`
  (instrument, proof 104/104), `686b49009` (analyzer fix,
  proof 113/113), `a4c378242` (analyzer fix 2, proof 115/115).
- This evidence commit: analysis JSON + §15 panel (json/gz/md)
  + per-seed corpora (main + replication, 8+8 files) +
  this file.
- Coordinator evidence for round 0825Z:
  `evidence/2026-11-16/sim-scale-onramp-round-0825.md`
  (separate commit, same adoption).
- Tracker: scale-onramp line updated by the adopting
  coordinator (re-read before updating, per the loop's rule).
- Findings appended to `sim-findings.md` (see below).
- Claim `fleshout-20261116T0825Z.json` + lock
  `fleshout-loop.lock` deleted by the adopting coordinator
  after verifying the run dead (coordinator timed out at the
  cron deadline; no hbloop process; no live processes in the
  tree; last heartbeat 10:21:23Z, adoption heartbeated
  10:29:45Z).

## Findings appended

- KILLFAIL RANKED ANSWER (this arm): trick-unknown 9/9 +
  launched-short 9/9 dominate; evade is the modal outcome
  (6/9); wild 0/38 kills — wave-4-wide failure, not
  launch-specific. Ammo/gear exonerated (0 dry, 0
  under-geared). Contact party is 3 in all nine despite
  launch-as-2 — a launch-as-3 lever must move the kill rate,
  not just contact size.
