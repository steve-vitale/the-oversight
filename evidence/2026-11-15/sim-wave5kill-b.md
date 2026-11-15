# sim-wave5kill-b — DIAG on wave-5 killing: GO (instrument valid, blocker named)

Loop B run `fleshout-loop-b-20261115T1630Z`, axis winnability chain, arm
sim-wave5kill-b (DIAG on wave-5 killing — the next binding link after
the gorgeprice2 CONFIRM GO). Branch `sim-wave5kill-b`. Binding prereg:
`evidence/2026-11-15/sim-wave5kill-b-prereg.md` — bars FROZEN there,
judged here without alteration. No game code changed in this arm;
no sims re-run.

## The finding being diagnosed

Gorgeprice2 CONFIRM GO (`evidence/2026-11-15/sim-gorgeprice2-b.md`,
commit `740838f3c`): armed villages unlock wave 5 at 10/16 (control
4/16) but make only 11 wave-5 kills total across 16 villages. The
lever gets villages TO wave 5; it does not make them kill there.

## Verdict: DIAG GO

Judged by `scripts/analyze-wave5kill-b.js` on the committed
gorgeprice2 CONFIRM corpora (16+16 files, seeds 100521–100536,
policy `competent-answercourt-b`, 150d). **GO: 0 unclassified
seeds, 0 instrument errors, and the blocker is named with counts
below.** The instrument answered the question.

## Judged numbers — armed leg (the lever ON)

| Metric | Armed (16 seeds) |
|---|---:|
| Wave-5 unlocked | 10/16 |
| Wave-5 kills total | 11 |
| Kills per unlocked village | **1.1** |
| Kills per faced village | 1.1 (all 10 unlocked villages faced) |
| Deaths to wave-5 monsters | 12 (all villagers, **0 scholar**) |
| Kill : death ratio | **0.92** — about one villager life per kill |
| Class counts (unlocked) | NEVER-FACED 0, FACED-NOT-KILLED 5, KILLED 5 |
| Median survival, unlocked | 150d (horizon cap) |
| Instrument errors / unclassified | 0 / 0 |

## Judged numbers — control leg (contrast)

| Metric | Control (16 seeds) |
|---|---:|
| Wave-5 unlocked | 4/16 |
| Wave-5 kills total | 14 |
| Kills per unlocked village | **3.5** |
| Deaths to wave-5 monsters | 16 (all villagers, **0 scholar**) |
| Kill : death ratio | 0.88 |
| Class counts (unlocked) | NEVER-FACED 0, FACED-NOT-KILLED 0, KILLED 4 |
| Instrument errors / unclassified | 0 / 0 |

The control villages that unlock kill more per village (3.5 vs
1.1) — but that is partly selection, not lever harm: only 4/16
control villages unlock, and they are the wave-4-kill-rich ones
(7, 7, 12, 6 wave-4 kills; mean 8.0), while the armed leg opens
the door to 10 villages including ones with only 3 wave-4 kills
(armed unlocked mean 4.0). The lever widens the door; the weaker
villages it lets through are the ones that then fail to kill.

## Per-seed table — armed leg (10 unlocked)

| Seed | Unlock d | First faced d | Faced (distinct) | W5 kills | Deaths to W5 (sch/vil) | vet5 unlock→end | Ready days after unlock | Dominant short bar | Days / end |
|---:|---:|---:|---:|---:|---:|---:|---:|---|---:|---|
| 100521 | 77 | 107 | 2 | 0 | 0 (0/0) | 2→1 | 13 | veterans (48d) | 150 survived |
| 100522 | 89 | 91 | 6 | 3 | 3 (0/3) | 2→1 | 22 | veterans (15d) | 150 survived |
| 100525 | 107 | 127 | 3 | 0 | 0 (0/0) | 2→0 | 20 | armor+veterans+weapons (16d) | 145 village-lost |
| 100527 | 106 | 109 | 3 | 1 | 1 (0/1) | 2→0 | 9 | armor+veterans+weapons (21d) | 150 survived |
| 100528 | 77 | 78 | 4 | 5 | 5 (0/5) | 2→0 | 34 | veterans+weapons (14d) | 145 village-lost |
| 100529 | 130 | 136 | 1 | 0 | 0 (0/0) | 2→1 | 8 | veterans (14d) | 150 survived |
| 100530 | 125 | 133 | 2 | 1 | 2 (0/2) | 2→2 | 24 | veterans (3d) | 150 survived |
| 100532 | 108 | 123 | 3 | 0 | 0 (0/0) | 2→1 | 12 | armor+veterans+weapons (22d) | 150 survived |
| 100533 | 85 | 125 | 3 | 1 | 1 (0/1) | 2→0 | 32 | veterans (22d) | 150 survived |
| 100534 | 137 | 151* | 1 | 0 | 0 (0/0) | 2→0 | 2 | veterans (14d) | 150 survived |

\* 100534 first faced on series day 151 — the series runs two days
past the 150d horizon (tail days); the facing is real, not an
analyzer artifact.

## Per-seed table — control leg (4 unlocked)

| Seed | Unlock d | First faced d | Faced (distinct) | W5 kills | Deaths to W5 (sch/vil) | vet5 unlock→end | Ready days after unlock | Dominant short bar | Days / end |
|---:|---:|---:|---:|---:|---:|---:|---:|---|---:|---|
| 100524 | 101 | 110 | 7 | 3 | 3 (0/3) | 2→0 | 47 | veterans+weapons (3d) | 150 survived |
| 100527 | 72 | 96 | 6 | 3 | 3 (0/3) | 2→0 | 58 | armor+veterans+weapons (19d) | 150 survived |
| 100534 | 103 | 107 | 4 | 6 | 7 (0/7) | 2→3 | 41 | weapons (8d) | 150 survived |
| 100536 | 117 | 129 | 2 | 2 | 3 (0/3) | 2→1 | 2 | armor+veterans+weapons (19d) | 150 survived |

## The binding blocker, named with counts

Two blockers, in order. Neither is "never faced" — every unlocked
village in both legs faced wave 5 (10/10 armed, 4/4 control;
median unlock→first-faced lag 11 days armed, 10.5 control).

**Blocker 1 — FACED-NOT-KILLED (5 of 10 armed unlocked villages,
the bigger half).** Seeds 100521, 100525, 100529, 100532, 100534
face 1–3 distinct Producer types, kill NOTHING, and lose NOBODY
to wave 5 (0 deaths in all five). The village meets the Producers
and the encounter ends with no kill and no death — the fight is
fled, avoided, or never joined. These five villages account for 0
of the 11 kills while holding half the unlocked leg. This is the
binding blocker: the chain stalls at the meeting, not at the
door and not at the kill.

**Blocker 2 — KILLED-BUT-AT-1:1 (5 of 10 armed unlocked
villages).** The villages that DO kill pay about one villager
life per kill (11 kills / 12 deaths armed; 14 / 16 control), and
the deaths eat the veteran pipeline itself: living wave-4
killers (`vet5`) end at 0 in 5 of 10 armed unlocked villages and
at 1 in 4 more — only 100530 still holds 2 at run end. The door
opens exactly when `vet5` hits 2 (all 14 unlocked seeds in both
legs have `vet5AtUnlock` = 2 — the readiness gate binds exactly),
then veterans die and the bar re-shorts: `veterans` appears in
the dominant short list for 10/10 armed unlocked seeds, and
post-unlock readiness holds only a median ~16 days of the 30–70
days after unlock. Wave-5 killing consumes the exact resource
(living wave-4 killers) the readiness gate demands, so the
village cannot keep the door open or staff the next fights. The
grind is self-throttling.

**A third, silent fact: the scholar never fights wave 5.** 0 of
28 deaths to wave-5 monsters across both legs are the scholar.
The scholar — the village's strongest fighter, the one the
competent policy drives — never dies to a Producer, which in this
corpus means the scholar is never the one in the wave-5 fight
(the corpus records no scholar wave-5 kills either, and no party
records at all). Villagers fight the Producers alone, in ones,
and die one-for-one. The party that the winnability chain
assumes (party up → kill in a party) is not present at wave 5.

## Named next lever

**Producer re-engagement party.** A villager who has FACED a
Producer (deed-feed `w5 > 0`) seeks out a party — other living
wave-4 killers and armed villagers they have actually perceived —
and goes back after that Producer type together, instead of the
current flee/avoid. It attacks Blocker 1 directly (the five
faced-not-killed villages) and Blocker 2's 1:1 trade by putting
more than one fighter in the fight. Pilot scope (appendix below):
fresh band, GO bar kills per unlocked village ≥ 2× control with
kill:death no worse than the 0.92 measured here. The persistent-
party build already in flight (one-brain scorer pursuit) is the
natural home — this lever is its wave-5 test case, not a seventh
system. If the party build lands first, re-measure this diag on
its corpora before building anything separate.

## Village assessment (plain words)

What the villages looked like: ten armed villages got through
the wave-5 door — earlier than control (median unlock day ~106
vs ~102, with the earliest at day 77) — and then split cleanly
in half. Five met the Producers, looked at them, and came home
with nothing: no kill, no corpse, no story. Five fought, and
every kill cost a villager: seed 100528 is the sharpest picture,
5 kills and 5 deaths, the village dead by day 145 anyway. The
villages that kill best are the ones that were already richest
in wave-4 kills before the door opened — the lever widened the
door to villages that weren't ready to kill through it.

Who died and why: 12 villagers to wave-5 monsters in the armed
leg, 16 in control, and not one scholar. The deaths are all
villagers fighting alone — the record never shows a party, never
shows the scholar beside them, never even names the dead. The
wave-5 dead are the village's wave-4 killers themselves: the
veterans the readiness gate counted on are the ones who walk
into the Producer fights and don't walk back, which is why the
readiness bar re-shorts behind them.

What was missing: a reason to go back. A village that faces a
Producer and flees has no drive to re-engage with a party, no
knowledge channel that turns a survived facing into a hunt, and
no party to go back with. The readiness gate measures whether
the village CAN fight wave 5 (armor, weapons, veterans) but
nothing measures whether it WILL — and half the time, it won't.

## Sense-testing (read the lines)

The wave-5 fights are silent in the record. Across all 32
corpora, wave-5 monster names appear in exactly ONE linkLine —
a System whisper in control seed 100527 (day 86): "📻 The System
whispers it, for once not delighted: the Finale. Every season
needs its climax. This one is yours." That is an unlock beat,
not a fight line. Around seed 100528's five wave-5 deaths
(days 80, 86, 92, 103, 116), 23 linkLines fall within ±2 days —
and none of them is about the fights: garden-sowing, eating,
aid offers, and broadcast kill-lines for wave-1/2 beasts
("📺 Lucia killed Big Loud out past the ridge — alone — and
walked home. 2 rounds."). Around 100522's three deaths and
100530's two deaths there are ZERO linkLines within ±2 days.
The deaths rows name the monster and the day but never the
victim — no villager name, no party, no flee, no ability, no
last words. Villagers DO act like people elsewhere in the same
lines (sowing, eating together, accepting aid with thanks), but
at wave 5 the record shows nothing at all: the corpus cannot
say whether villagers party up, flee sensibly, or walk in solo
and die — because nothing about the fight is recorded. That is
a recorder gap, logged as a finding below — not a verdict on
villager behavior. The one honest read the lines support: the
broadcast kill-lines that DO exist always show a villager
fighting ALONE ("Lucia killed Big Loud — alone"), which matches
the 1:1 kill:death trade and the absent scholar. If wave-5
fights are also fought alone, the 1:1 trade is exactly what
alone would cost.

## Wall numbers (scale wall — Steve 2026-10-12)

Confirm band, 150d (same corpora as gorgeprice2): national
15/16 both legs, table 0/16 both, wins 0/16 both, wave-4 16/16
both, wave-5 4/16 → 10/16, median survival 127.5 → 150 days.
The wall is unmoved at the top (no table, no wins on this
substrate). The chain's binding link is now precise: not
wave-5 access (10/16 unlocked), not wave-5 meeting (10/10
unlocked faced), but wave-5 KILLING — 5/10 unlocked villages
kill nothing, and the 5 that kill pay one villager per kill
while their veteran count bleeds to zero.

## Metric review (§14)

- The per-seed (not per-encounter) classification was the
  honest narrowing the corpus forced, and it separated the
  blockers cleanly: 0 NEVER-FACED, 5 FACED-NOT-KILLED, 5 KILLED
  — the classes are not degenerate, and the 0/5/5 split IS the
  diagnosis. No bar change is proposed.
- `w5` (distinct types faced) understates encounters by
  construction — repeat fights against one Producer type are
  invisible — so FACED-NOT-KILLED is a lower bound on exposure:
  a village could have fled the same Spoiler five times and it
  reads as one facing. The per-encounter recorder (next arm's
  first deliverable) would sharpen this, not overturn it.
- The kill:death ratio (~0.92 armed, ~0.88 control) is stable
  across legs and is the number the next lever must move: a
  lever that doubles kills while holding the ratio at ~1:1 is
  still buying each kill with a villager. The pilot GO bar in
  the appendix therefore pairs the kills bar with a ratio floor.
- The control contrast (3.5 kills/unlocked) flatters control
  through selection — only the kill-rich villages unlock there.
  The right comparator for the next lever is kills per unlocked
  village on a FRESH band with the lever on vs off, not this
  control leg's 3.5.
- Veteran attrition (`vet5` 2→0 in half the armed unlocked
  leg) was not in the prereg's primary metric but fell out of
  the frozen veteran-attrition read — it is reported here as
  Blocker 2's mechanism, not re-scored into the GO bar.

## Findings backlog

- Wave-5-kills backlog line updated with the verdict (see
  sim-findings.md): DIAG GO — blocker named (5/10 armed
  unlocked FACED-NOT-KILLED, kill:death 0.92, vet5 bleeds to 0
  in 5/10); next lever Producer re-engagement party.
- Wave-5 deaths are silent: 0 fight lines in 32 corpora for 28
  deaths to wave-5 monsters; deaths rows carry no victim name,
  no party, no flee. Recorder gap — a future recorder should
  capture per-encounter party, flee, and fight lines. (This run.)
- The scholar never dies to a wave-5 monster (0/28 deaths) and
  the corpus records no scholar wave-5 fight: the strongest
  fighter is absent from the Producers' fights. (This run.)
- Readiness re-shorts after unlock: the wave-5 door opens
  exactly at vet5 = 2, then veteran deaths re-short the bar
  (veterans in the dominant short for 10/10 armed unlocked
  seeds; median ~16 ready days post-unlock). The gate measures
  a moment, not a durable state. (This run.)

## Convergence state

Axis winnability chain: this arm DIAGNOSES — the gorgeprice2
finding is now decomposed with counts and a named next lever
(Producer re-engagement party). No lever built here, by design:
the diag first, the build second. Next on the chain is the
re-engagement party pilot (appendix) or the persistent-party
build's wave-5 re-measurement — whichever lands first.

## Appendix — pilot prereg scope for the next lever (not run here)

**Lever:** Producer re-engagement party (villagers who faced a
Producer form a party from perceived living wave-4 killers and
armed villagers and go back after that type together).
**Data:** fresh seed band (verify unused per the seed-band
freshness skill before assigning; never 100521–100536).
**Horizon:** 150d, death-aware; policy `competent-answercourt-b`.
**Primary metric:** wave-5 kills per wave-5-unlocked village.
**GO bar:** armed ≥ 2× control on kills per unlocked village
AND kill:death ratio armed ≥ 0.92 (no worse than the diag's
measured trade) AND FACED-NOT-KILLED share among unlocked armed
≤ 2/10. **NO-GO** otherwise; a pilot NO-GO is evidence-only.
**Instrument (first deliverable of that arm):** per-encounter
recorder — party size at fight, flee vs fight outcome, fight
lines — without which the next diag repeats this one's blind
spot. **Judge:** the frozen prereg of that run, not this
appendix.

## Reproduction

- Analyzer: `node scripts/analyze-wave5kill-b.js
  evidence/2026-11-15/perseed-gorgeprice2-b-confirm-control
  evidence/2026-11-15/perseed-gorgeprice2-b-confirm-on`
  (read-only; prints JSON with per-seed + pooled).
- Proof: `node scripts/test-wave5kill-b.js` — 10/10 checks
  (classes, guards, ratio, veteran attrition, frozen wave-5 id
  set vs `src/data/monsters.json`).
- Corpora: `evidence/2026-11-15/perseed-gorgeprice2-b-confirm-{control,on}/`
  (16+16 files, seeds 100521–100536, policy
  `competent-answercourt-b`, 150d), commit `740838f3c`.
