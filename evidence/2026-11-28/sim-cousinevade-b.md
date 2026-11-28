# sim-cousinevade-b — DIAGNOSTIC evidence (classify the cousin evade, #2504 program)

**Arm:** sim-cousinevade-b · **Loop B run:** fleshout-loop-b-20261128T0830Z,
axis winnability-chain · **Branch:** `sim-cousinevade-b` (worktree
`~/workspace/worktrees/sim-cousinevade-b`)
**Type:** DIAGNOSTIC CLASSIFICATION — no new sims, no game-code change,
no policy change.
**Corpus (frozen, existing, committed on HELD branches — read-only via
`git show`):** fleerepair build-leg FIELD corpus
(`sim-fleerepair-b` tip `7f228e1e5`,
`evidence/2026-11-28/perseed-fleerepair-b-field-build/`, 8 seeds) +
emptybow armed-leg FIELD corpus (`sim-emptybow-b` tip `2d205acb0`,
`evidence/2026-11-28/perseed-emptybow-b-field/`, 8 seeds); band
112301–112308, 150d death-aware. Read-only extracts at
`/tmp/sim-cousinevade-b-corpus/` (via `git archive`); per-file sha256
provenance is recorded in `cousinevade-b-analysis.json`.
**Prereg:** `evidence/2026-11-28/sim-cousinevade-b-prereg.md` (frozen
2026-11-28 08:58 UTC, BEFORE any judged classification; commit
`054f024b0`).
**Question (finding #2504, the cousin evade; 2026-11-28 update):** on
fresh band 112301–112308, 27 of 37 launched wave-4+ expedition meetings
end in pre-fight awareness evades (rounds 0, no contact), all with
trick unknown — nearly three-quarters of launched meetings; build leg
23/36, armed leg 19/28. The prior classification arm (sim-evadeclass-b,
band 103601–103608) found 3/3 WISE — but that was n=3. This arm runs
the same program on n=42: was each evade WISE (the party sensed a
fight it could not win) or a WASTED LAUNCH?

## Verdict: DIAG-GO on classification — 15 WISE, 0 WASTED, 27 UNDECIDED; decision rule names NO-LEVER

| Check | Result |
| --- | --- |
| C0 population reproduced | **PASS** — 42 launched evades (23 build, 19 armed), exactly the frozen count; classifier exit 0 |
| C1 completeness | **PASS** — all 42 in the table with all frozen fields and a verdict + reason; ZERO UNCLASSIFIED |
| C2 splits reported | **PASS** — species split (Suburb 3 vs other 39) and leg split (build 23 / armed 19) below |
| C3 sense-test quote | **PASS** — log lines quoted below |
| C4 proof green | **PASS** — `scripts/test-cousinevade-b.js` 14/14 (verdict fixtures + launch-join fixtures + corpus-population check) BEFORE the evidence was written |
| C5 instrument | **PASS** — no verdict-required field missing on any evade (`mHpStartRec` 42/42, lead HP 42/42, gate 42/42); the launch join matches 42/42 under the frozen rule |
| C6 decision rule applied | **PASS** — frozen rule applied as written: wise share 15/42 = 35.7% < 60% (X), wasted share 0/42 = 0% < 25% (Y) → **NO-LEVER**. No re-scoring. |
| Instrument | **CLEAN except one scope sensitivity** — see Metric review: 12 armed evades flip WISE under per-leg scope; the frozen pooled-scope rule forces them UNDECIDED. Distance/terrain stays blocked (finding #2512); party HP beyond the lead stays unrecorded. |

**Answer in one line:** on this band the cousin evade is neither
exonerated nor condemned — 15 of 42 evades are certainly wise, none is
a wasted launch, and 27 cannot be judged from what the corpus records,
because the whole question turns on one kill: a single launched party
killed a wave-4 Reunion for 1276 damage, and that one fight sets the
"best a party ever did" bar so high that every evaded monster below it
falls into the undecidable middle. The evade is not the failure point
anyone can point at — but neither is it proven wise. The next lever
cannot be named from this classification, and the frozen rule says so.

## Damage-potential constants (computed by the classifier from the corpus)

Launched fought meetings (expedition-origin wave-4+, rounds ≥ 1), both legs pooled:

| Constant | Value | Derivation |
| --- | --- | --- |
| D_BEST | **1276** | max `mDealt` over 22 launched fought meetings (pooled). Set by ONE meeting: build s112308 d127, gen_5iofooe vs Reunion, vKill, 11 rounds, 1276 dealt vs 1265 HP — the only kill in the pooled fought set |
| D_TYP | **90** | median `mDealt` over the 19 launched fought meetings with `mDealt > 0` (sorted: 15, 15, 22, 30, 30, 45, 67, 74, 85, **90**, 90, 131, 131, 147, 189, 196, 196, 707, 1276) |
| Per-leg | build D_BEST 1276 / D_TYP 85 (fought n=13, nz 11); armed D_BEST 707 / D_TYP 110.5 (fought n=9, nz 8) | armed best is the s112308 d146 winnable flee: 707 dealt in 11 rounds, monster left at 233 HP, party fled anyway (the emptybow F2) |
| Fought-meeting shape | 3 of 22 dealt 0 | the #2500 round-1 flee shape; the other 19 dealt 15–1276 |

For scale: the evaded monsters' HP runs 976–1998 (median 1131). Against
D_TYP 90, a typical fighting meeting would need 11–22 meetings to
finish one — but against D_BEST 1276, the single kill proves a launched
party *can* finish one in a single meeting. The two standards disagree
by an order of magnitude, and that disagreement IS the classification's
result: the middle band (90, 1276] holds 27 of 42 evades.

## Classification table (every launched evade meeting in the corpus)

Meeting party is 3 on all 42 (alliesN = 2); gate allArmed/allArmored
true on all 42; trick known (by meeting and by launch) on 0/42; lead HP
is `vHpLeft`. Launch = latest in-window launch under the frozen join
(see Launch-join findings). HP = `mHpStartRec`.

| # | Leg / seed / day | Spotter vs species (wave) | Launch (day, size, target, match?) | Meeting party, lead HP | Trick (meeting / launch) | Monster HP | Verdict |
|---|---|---|---|---|---|---|---|
| 1 | build / 112305 / d41 | Tresor vs **strike** (w4) | d40, size 2, target buffering | 3, lead 85 | no / no | **1129** | **UNDECIDED** |
| 2 | build / 112305 / d43 | Helga vs **algorithm** (w4) | d42, size 2, target — | 3, lead 92 | no / no | **1189** | **UNDECIDED** |
| 3 | build / 112305 / d45 | Helga vs **reunion** (w4) | d45, size 2, target — | 3, lead 87 | no / no | **1278** | **WISE** |
| 4 | build / 112305 / d46 | Helga vs **algorithm** (w4) | d45, size 2, target — | 3, lead 90 | no / no | **1105** | **UNDECIDED** |
| 5 | build / 112305 / d57 | Zoltan vs **strike** (w4) | d54, size 2, target buffering | 3, lead 71 | no / no | **1120** | **UNDECIDED** |
| 6 | build / 112305 / d87 | Afnan vs **suburb** (w4) | d87, size 4, target influencer | 3, lead 100 | no / no | **1376** | **WISE** |
| 7 | build / 112306 / d65 | Hunter vs **reunion** (w4) | d64, size 2, target ad_break | 3, lead 97 | no / no | **1290** | **WISE** |
| 8 | build / 112306 / d79 | Jashim vs **spoiler** (w5) | d77, size 2, target ad_break | 3, lead 72 | no / no | **1300** | **WISE** |
| 9 | build / 112306 / d93 | Petra vs **eulogy** (w4) | d92, size 3, target eulogy **MATCH** | 3, lead 80 | no / no | **1087** | **UNDECIDED** |
| 10 | build / 112306 / d103 | Gina vs **editor** (w5) | d102, size 3, target eulogy | 3, lead 83 | no / no | **1700** | **WISE** |
| 11 | build / 112307 / d38 | Enes vs **suburb** (w4) | d35, size 2, target gavel | 3, lead 49 | no / no | **1398** | **WISE** |
| 12 | build / 112307 / d39 | Paolo vs **strike** (w4) | d39, size 2, target — | 3, lead 87 | no / no | **1131** | **UNDECIDED** |
| 13 | build / 112307 / d72 | Ethan vs **influencer** (w4) | d70, size 3, target eater | 3, lead 48 | no / no | **1011** | **UNDECIDED** |
| 14 | build / 112307 / d87 | Ivy vs **algorithm** (w4) | d87, size 4, target eater | 3, lead 78 | no / no | **1134** | **UNDECIDED** |
| 15 | build / 112307 / d87 | Zoe vs **editor** (w5) | d87, size 4, target eater | 3, lead 100 | no / no | **1726** | **WISE** |
| 16 | build / 112307 / d91 | Tuilelaith vs **network_note** (w5) | d90, size 4, target eater | 3, lead 97 | no / no | **1059** | **UNDECIDED** |
| 17 | build / 112307 / d97 | Ivy vs **network_note** (w5) | d95, size 4, target eater | 3, lead 99 | no / no | **1108** | **UNDECIDED** |
| 18 | build / 112308 / d63 | Lei vs **algorithm** (w4) | d63, size 2, target — | 3, lead 86 | no / no | **1022** | **UNDECIDED** |
| 19 | build / 112308 / d86 | Lei vs **eater** (w4) | d85, size 2, target — | 3, lead 91 | no / no | **979** | **UNDECIDED** |
| 20 | build / 112308 / d88 | Lei vs **eater** (w4) | d88, size 2, target — | 3, lead 63 | no / no | **982** | **UNDECIDED** |
| 21 | build / 112308 / d89 | Illari vs **audit** (w4) | d88, size 2, target — | 3, lead 90 | no / no | **1230** | **UNDECIDED** |
| 22 | build / 112308 / d101 | Desmond vs **eater** (w4) | d101, size 2, target — | 3, lead 100 | no / no | **1004** | **UNDECIDED** |
| 23 | build / 112308 / d129 | Lei vs **cancellation** (w5) | d127, size 2, target — | 3, lead 46 | no / no | **1998** | **WISE** |
| 24 | armed / 112305 / d41 | Tresor vs **strike** (w4) | d40, size 2, target buffering | 3, lead 85 | no / no | **1129** | **UNDECIDED** |
| 25 | armed / 112305 / d43 | Helga vs **algorithm** (w4) | d42, size 2, target — | 3, lead 92 | no / no | **1189** | **UNDECIDED** |
| 26 | armed / 112305 / d45 | Helga vs **reunion** (w4) | d45, size 2, target — | 3, lead 87 | no / no | **1278** | **WISE** |
| 27 | armed / 112305 / d46 | Helga vs **algorithm** (w4) | d45, size 2, target — | 3, lead 90 | no / no | **1105** | **UNDECIDED** |
| 28 | armed / 112306 / d65 | Hunter vs **reunion** (w4) | d64, size 2, target ad_break | 3, lead 97 | no / no | **1290** | **WISE** |
| 29 | armed / 112306 / d79 | Jashim vs **spoiler** (w5) | d77, size 2, target ad_break | 3, lead 72 | no / no | **1300** | **WISE** |
| 30 | armed / 112306 / d93 | Petra vs **eulogy** (w4) | d92, size 3, target eulogy **MATCH** | 3, lead 80 | no / no | **1087** | **UNDECIDED** |
| 31 | armed / 112306 / d103 | Gina vs **editor** (w5) | d102, size 3, target eulogy | 3, lead 83 | no / no | **1700** | **WISE** |
| 32 | armed / 112307 / d38 | Enes vs **suburb** (w4) | d35, size 2, target gavel | 3, lead 49 | no / no | **1398** | **WISE** |
| 33 | armed / 112307 / d39 | Paolo vs **strike** (w4) | d39, size 2, target — | 3, lead 87 | no / no | **1131** | **UNDECIDED** |
| 34 | armed / 112308 / d63 | Lei vs **algorithm** (w4) | d63, size 2, target — | 3, lead 86 | no / no | **1022** | **UNDECIDED** |
| 35 | armed / 112308 / d86 | Lei vs **eater** (w4) | d85, size 2, target — | 3, lead 91 | no / no | **979** | **UNDECIDED** |
| 36 | armed / 112308 / d88 | Lei vs **eater** (w4) | d88, size 2, target — | 3, lead 63 | no / no | **982** | **UNDECIDED** |
| 37 | armed / 112308 / d89 | Illari vs **audit** (w4) | d88, size 2, target — | 3, lead 90 | no / no | **1230** | **UNDECIDED** |
| 38 | armed / 112308 / d99 | Illari vs **influencer** (w4) | d96, size 2, target — | 3, lead 97 | no / no | **976** | **UNDECIDED** |
| 39 | armed / 112308 / d141 | Lei vs **reunion** (w4) | d141, size 2, target — | 3, lead 80 | no / no | **1287** | **WISE** |
| 40 | armed / 112308 / d142 | Lei vs **algorithm** (w4) | d141, size 2, target — | 3, lead 83 | no / no | **1008** | **UNDECIDED** |
| 41 | armed / 112308 / d145 | Ella vs **reunion** (w4) | d141, size 2, target — | 3, lead 59 | no / no | **1357** | **WISE** |
| 42 | armed / 112308 / d148 | Lei vs **congregation** (w4) | d146, size 4, target editor | 3, lead 88 | no / no | **1100** | **UNDECIDED** |

## Verdicts with reasons

**The 12 WISE-by-HP (non-Suburb).** Four are the same meetings on
both legs (the legs re-roll the same trajectories): Reunion 1278,
Reunion 1290, Spoiler 1300, Editor 1700. The build leg adds Editor
1726 and Cancellation 1998; the armed leg adds Reunion 1287 and
Reunion 1357 instead. Every one sits above the pooled D_BEST 1276. The Editor meetings (1700 on both legs, 1726 build) and the Cancellation
(1998, build) sit in the wave-5 HP band
(canon 1000–2200); no launched party in this corpus ever dealt more
than 1276 in a meeting, and the typical fighting meeting deals 90. A
party walking away from a 1700-HP Editor it has never learned the trick
for is not wasting a launch; it is refusing a mauling. The Reunion
1278 is the closest call in this group — 2 HP above D_BEST — and it is
WISE under pooled scope and under build scope; under armed scope it
would also be WISE (1278 > 707). No WISE-by-HP verdict is close under
its own leg's scope.

**The 3 Suburb (WISE by definition).** Build s112305 d87 (Afnan, HP
1376), build s112307 d38 (HP 1398, lead at 49 HP — the lowest lead HP
in the population), armed s112307 d38 (same meeting re-rolled, HP
1398). The canon trick for the Suburb IS to leave; the evade is the
correct play by definition, whatever the HP. The d38 lead at 49 HP
makes the point concrete: a hurt lead walking around a street that
cannot be killed is sense, not cowardice.

**The 15 middle-band UNDECIDED (all build leg).** HP 979–1230, between
D_TYP 90 and D_BEST 1276. These are the evades the frozen rules cannot
judge: the monsters are far above what a typical fighting meeting deals
(90) and below what the single best meeting ever dealt (1276). Take
build s112308 d86/d88: Lei's party met the Eater twice in three days
at 979 and 982 HP — the same Eater, unwounded between meetings — and
walked away twice. Was that wise? The party's own band never dealt
more than 90 in a typical meeting, which says wise; but the corpus's
one kill says a party *can* deal 1276, which says the question is
open. The frozen rules refuse to pick between the typical and the best,
and that refusal is the verdict. Note the two target-match meetings
are both in this group (petra_novak vs Eulogy d93, HP 1087, on both
legs): the only launches that met their actual target are undecidable
too.

**The 12 scope-flip UNDECIDED (all armed leg).** HP 976–1230 — the same
middle band, but these flip WISE under per-leg scope (armed D_BEST
707): s112305 d41/d43/d46, s112306 d93, s112307 d39, s112308
d63/d86/d88/d89/d99/d142/d148. The pooled D_BEST is set by the build
leg's single kill; the armed leg never had that kill, so its own best
is 707 and every one of these monsters exceeds it. The prereg's
invariance rule forces them UNDECIDED rather than letting the scope
choice decide the verdict. This is the classification's load-bearing
fact (see Metric review): whether the cousin evade is "mostly wise"
depends entirely on whether one build-leg kill counts as what launched
parties can do.

**Why zero WASTED is a real result, not a vacuous bar.** The WASTED bar
(HP ≤ D_TYP 90, target match) is reachable in principle — the band's
own fought meetings include a 15-damage and a 22-damage meeting, and
the allycap band's Eater was finished at 21 HP — but no evaded monster
in this corpus sat anywhere near 90 HP: the lowest evaded HP is 976
(armed s112308 d99, Influencer), more than 10× D_TYP. The evades all
sit at full-strength wave-4/5 HP. The classification does not
exonerate the launch program in general (launched parties still almost
never fight, and when they do they mostly deal 0–196); it says that on
this band, no evade walked away from a monster the party could
plausibly have finished.

## Species split

- **Launched evades (n=42):** Algorithm 8, Reunion 6, Strike 5, Eater
  5, Suburb 3, Editor 3, Spoiler 2, Eulogy 2, Influencer 2,
  Network Note 2, Audit 2, Cancellation 1, Congregation 1. Wave-5
  species appear (Editor 3, Network Note 2, Cancellation 1) — the
  recorder watches wave 4+, and evades are not a wave-4-only shape.
- **Per leg:** build — Algorithm 4, Strike 3, Eater 3, Reunion 2,
  Suburb 2, Editor 2, Network Note 2, Spoiler 1, Eulogy 1, Influencer
  1, Audit 1, Cancellation 1 (no Congregation); armed — Algorithm 4,
  Reunion 4, Strike 2, Eater 2, Spoiler 1, Eulogy 1, Editor 1, Suburb
  1, Audit 1, Influencer 1, Congregation 1 (no Network Note, no
  Cancellation).
- **Leave-counter:** the Suburb accounts for 3/42 launched evades.
  The cousin evade is NOT a Suburb story — it is a general wave-4/5
  awareness evade across 13 species. The FLEEREPAIR2 seed gate (which
  blocks plan seeding onto the Suburb) correctly does not touch it.

## Leg split (does the evade cluster on one leg?)

- **Launched evades:** build 23, armed 19 — no clustering; the legs
  re-roll the same four evade-prone seeds (112305–112308 carry all 42
  evades on both legs; 112301–112304 carry zero on both legs). Per-seed
  build: 112305: 6, 112306: 4, 112307: 7, 112308: 6. Armed: 112305: 4,
  112306: 4, 112307: 2, 112308: 9.
- **Fought meetings:** build 13, armed 9. The evade share of the pool
  is 23/36 (64%) build, 19/28 (68%) armed — the emptybow fix (which
  closed the failed-strike loop inside fights) did not move the evade
  share, as expected: it changes what happens inside a fight, not
  whether the party engages.

## Launch-join findings (the frozen join, measured)

- **Join rate 42/42, zero misses** under the frozen rule (latest
  in-window launch with the fighter or an ally in the party). The
  evadeclass-b join (which required target equality) would have left 5
  meetings joinless on this band; the frozen change (drop the target
  filter, latest launch wins) was load-bearing and is validated by the
  42/42 join.
- **Target match 2/42.** Only one distinct meeting met its launch
  target: petra_novak vs the Eulogy, s112306 d93, HP 1087, launch size
  3, on both legs. The other 40 evades met a monster that was NOT what
  the party launched after. The launch targets in the joined launches
  are mostly wave-3 kinds (buffering 3, ad_break 2, eulogy 4, eater 5,
  gavel 1, spool 1, focus_group 1, editor 2, influencer 1) or null
  (16) — the parties launch after rumors of one thing and meet
  another. This reframes the cousin evade: it is usually not a party
  refusing its target; it is a party meeting a stranger and giving it
  room. Whether the launch program should send parties after specific
  targets at all is a design question for the backlog, not this arm.
- **Launch sizes:** the joined launches are size 2 on 31 meetings,
  size 3 on 5, size 4 on 6. The meeting party is 3 on all 42 — a size-4
  launch still fields 3 at the meeting (the #2515 sense cap), and a
  size-2 launch fields 3 (the fighter plus two villagers who were not
  the launch companions). The meeting party is never the launch party
  as launched: finding #2511 holds on this band, all 42 rows.
- **Plan stage:** hunt 40, standing 2 (both s112308 meetings on the
  standing road). The evades are hunt launches, not standing launches.

## Trick knowledge (per monster kind)

- **0/42 evades had the trick known** — by the meeting
  (`trickBefore` false 42/42, `trickKnownByMeeting` false 42/42) and
  by the launch (`trickKnownByLaunch` false 42/42). The fleerepair
  pilot's "all with trick unknown" holds on both legs of this corpus.
- The corpus DOES record trick-learning elsewhere: `trickAfter`-true
  encounter rows exist for Eulogy (12 build / 10 armed), Algorithm
  (10 / 9), Reunion (6 / 6), Influencer (7 / 3), Eater (12 / 2),
  Editor (4 / 4), and others — villages learn tricks from fought
  encounters, never from an evade (an evade teaches nothing:
  `trickAfter` false on all 42). The evade is a knowledge dead end as
  well as a spent launch: the party learns nothing from the meeting it
  walks away from. That is the #2514 starvation shape in miniature —
  every evade is a meeting that could have taught the trick and didn't.
- Per-kind: the evaded kinds the villages know best elsewhere (Eulogy,
  Algorithm, Eater) are still unknown at the evade instant — the
  knowledge lives in other villages' fights, not in the evading
  party's village at that day.

## Sense-testing (what the player would actually see)

Every evade voices the same honest line, with the spotter named — the
log names the monster as the villagers know it, not by its System label:

- *"Tresor saw The Strike in time and gave it room."* (build s112305 d41)
- *"Helga saw The Algorithm in time and gave it room."* (build s112305 d43)
- *"Zoltan saw The Strike in time and gave it room."* (build s112305 d57)
- *"Afnan saw Big Ugly in time and gave it room."* (build s112305 d87, the Suburb — "Big Ugly" is the in-world nickname)
- *"Lei saw The Eater in time and gave it room."* (armed s112308 d86/d88 — twice in three days, same Eater)
- *"Ella saw The Loud Beast in time and gave it room."* (armed s112308 d145, the Reunion)

The lines read like people, not counters: a named villager saw the
thing in time and chose room over contact. No dialogue transcript is
captured by this driver; talk quality was not re-probed. Two things a
player would notice: the same villagers evade the same monsters
repeatedly (Lei meets the Eater twice and walks away twice; Helga meets
the Algorithm twice), and nothing in the line says WHY the party gave
it room — no "too big for us" or "we couldn't finish it" — the evade
is narrated as a bare decision, which is exactly what the
classification finds it to be: a decision the corpus cannot fully
judge.

## Village assessment (plain words)

Eight villages, two versions of each, and the same story in both: the
villages that hunt at all hunt on four seeds, and on those four seeds
the hunting parties walk out, meet a wave-4 or wave-5 beast, and turn
aside three times out of five without raising a weapon. They are not
starving and they are not collapsing — seven of eight build villages
and all eight armed villages live the full 150 days on one leg or the
other — they are villages that have learned to survive and not learned
to win. The parties that do fight are mostly the same story in
miniature: twenty or thirty damage a round against a thousand-health
beast, the lead down to a quarter of their health within a few rounds,
and then the run. Once — once in twenty-two fought meetings — a party
finished one: three villagers killed a Reunion in eleven rounds on day
127, and that single kill is now the standard every evade is judged
against. Nobody died in any of the 42 evade meetings; the evade cost
nothing but the launch, and the launch was already spent the moment the
party set out after a rumor of one monster and met another. The
villages feel alive here — people sense danger and give it room, and
the same people remember the same monsters — but the picture behind
the evades is stark: the parties almost never meet what they launched
after (2 of 42), never know the trick (0 of 42), and deal 90 damage on
a typical fighting meeting against beasts with a thousand health left.
The evade is the symptom a careful party shows; whether it is wise
depends on whether you believe one kill in twenty-two fights is what
parties can do, or what one party once did.

## Instrument notes (read before reusing this corpus)

- **HP is available for evades, and so is lead HP.** `mHpStartRec`
  (991–1998 here) and `vHpLeft` (46–100, median 86.5) are both recorded
  on evade rows. Leads are healthy at the meeting: the evade is not a
  hurt-lead flee (lowest lead HP 46, on build s112308 d129; median
  86.5). `mHpStart` stays null by recorder design.
- **Party HP beyond the lead is not in the corpus.** Allies' HP is
  recorded nowhere on the encounter, gate, depart, or seed row. The
  classification carries lead HP and the gate's allArmed/allArmored
  (true on all 42) as the party-state fields. A future recorder should
  stamp allies' HP on the encounter row — the frozen decision rule's
  "what the party knew" is lead-only until then.
- **Distance/terrain is a recorder gap (finding #2512, re-verified).**
  No encounter, gate, or depart row carries distance or terrain —
  verified by key-set inspection pre-freeze and again in the
  classifier run. It blocks only the "could the party have closed
  distance" sub-question; no verdict here depended on it.
- **The embedded gate snapshot can be stale.** The gate's `planTarget`
  disagrees with the joined launch's target on several rows (e.g.
  build s112305 d57: gate planTarget 'buffering' matches the launch,
  but armed s112308 d145: gate planTarget 'editor' while the joined
  launch target is null). The classification used the launch row (not
  the snapshot) for targetMatch, so no verdict rides on the snapshot;
  any arm reading `gate.planTarget` as "the plan at the meeting"
  inherits the staleness (evadeclass-b's caveat, confirmed here).
- **The launch join changed vs evadeclass-b, and the change was
  load-bearing.** Dropping the target-equality filter and taking the
  latest in-window launch joins 42/42; the old rule would have left 5
  joinless. The join outcome (targetMatch 2/42) is itself the finding:
  launched parties meet strangers, not targets.
- **Meeting party ≠ launch party (finding #2511, all 42 rows).** A
  size-4 launch fields 3 at the meeting; a size-2 launch fields 3
  (the fighter plus two non-companions). The sense cap (#2515) means
  the meeting party is whoever is near, not who launched.

## Telemetry deviation check (same-run item)

`telemetry-check.js` against `telemetry-baselines/scale-wall.json`
fires LOUD on BOTH classified corpora (national 12 → 0, table 16 → 0,
wins 16 → 0; exit 1 each leg; run with `--allow-recorder-corpus
--sweep-rows`, since the bare invocation refuses recorder-corpus
input). Investigated: the baseline's own `_regime` note says not to
compare pre-seat substrates against it ("wins are structurally ~0
there and telemetry-check will fire a spurious LOUD 'wins
disappeared'"). This band is a pre-seat substrate on both legs, and
the two source arms reported the IDENTICAL three LOUD lines on the
same corpora. Regime artifact, not a classification effect; no action.

## Metric review (for the NEXT run — the decision rule as frozen cannot name a lever on this band)

- **The decision rule fired its neither-branch, honestly.** Wise 15/42
  (35.7%) < 60% and wasted 0/42 (0%) < 25% → NO-LEVER. No re-scoring
  happened: the shares are the pooled-verdict shares the prereg froze,
  and the evidence reports NO-LEVER rather than picking the
  friendlier scope.
- **The scope choice decides the lever.** Under per-leg scope the
  verdicts are WISE 27 / UNDECIDED 15 — wise share 64.3%, which would
  cross X=60 and name lever A (DAMAGE). Under pooled scope they are
  WISE 15 / UNDECIDED 27 — 35.7%, NO-LEVER. The entire decision turns
  on whether the build leg's single kill (1276) sets the standard for
  the armed leg's evades. The frozen rule chose pooled scope and the
  invariance guard; the next run's prereg should freeze the scope
  question explicitly instead of inheriting it — either per-leg scope
  as primary (each leg judged against its own fought record) or a
  sturdier D_BEST (e.g. second-max, or max excluding kills, or a
  damage-per-round standard). Do NOT re-score this run against either:
  the NO-LEVER stands under the frozen rule.
- **D_BEST as a max is fragile on n=22 fought meetings.** One kill in
  22 meetings sets a bar 14× the typical damage (1276 vs 90) and
  swallows 27/42 evades into the middle band. The evadeclass-b band
  had the same form (D_BEST 86 vs D_TYP 38, ratio 2.3×) and it did not
  bite because the evaded HPs (991–1298) cleared the max by 11×. Here
  the evaded HPs (976–1998) straddle the max. A future classification
  should pre-register a middle-band plan (e.g. a per-party damage
  estimate from the meeting party's own fought record, or a
  rounds-to-kill vs rounds-to-drop race on the evaded HP) instead of
  leaving two-thirds of the population UNDECIDED.
- **`D_TYP` conditioning on mDealt > 0 (frozen pre-run) was
  load-bearing in the other direction:** the unconditioned median over
  all 22 fought meetings is 67.5, still far below the lowest evaded HP
  (976), so the zero-WASTED result is robust to the conditioning
  choice. The WASTED bar fails because the monsters are healthy, not
  because of the median's definition.
- **The 42-row population settles THIS band, not the evade question.**
  Fourteen times the evadeclass-b n=3, but still one band under one
  substrate. The evadeclass-b verdict (3/3 WISE) and this verdict (15
  WISE / 27 UNDECIDED / 0 WASTED) are consistent — nothing here
  overturns it — but the honest summary is that the evade is
  mostly-unjudged, not mostly-wise.
- **The leave-counter override fired 3 times and is a real WISE, not
  a free pass** — the canon trick for the Suburb IS to leave, and one
  of the three leads was at 49 HP.
- **C4 note:** `scripts/check.js --quick` was attempted twice and did
  not complete — first run timed out at 110s (28/344 scripts shown, no
  failures observed), second run was killed by a VM restart at ~09:16Z
  (uptime 1 min on recovery; /tmp swept, corpus extracts re-created
  from the held branches, classifier re-run byte-identical). The arm's
  proof (`test-cousinevade-b.js` 14/14, re-run green after the restart;
  analyzer selftest 17 checks) is green. The check.js run is recorded
  as incomplete, not claimed.

## Wall numbers (carried from the two source evidence files — no new sims)

| Metric | Fleerepair build leg | Emptybow armed leg |
|---|---|---|
| National | 0/8 | 0/8 |
| Table entered | 0/8 (TB leg; FIELD leg uninstrumented) | 0/8 |
| Wins | 0/8 | 0/8 |
| Wave 4 unlocked | 8/8 | 8/8 |
| Wave 5 unlocked | 3/8 | 3/8 |
| Median survival | 149d | 150d |
| Standing (final) | 199 modal (2 of 3 survivors at 199) | 199 modal (5 villages at 199) |

The scale wall stands exactly where the two source arms left it: every
village reaches wave 4, three reach wave 5, none reaches national, none
enters the table, none wins. Standing 199 is the modal stall on both
legs. This diagnostic moves no wall number.

## Convergence state

Axis (winnability chain): **not converged**. This arm closes finding
#2504's classification program on the 112301–112308 band with a
NO-LEVER verdict: 15 WISE / 0 WASTED / 27 UNDECIDED, and the frozen
decision rule names no next lever. The evade is not the failure point
anyone can point at — no evade walked away from a finishable monster —
but the classification cannot exonerate it either, because one kill
sets the standard so high that two-thirds of the evades are
unjudgeable from the corpus. The next work is NOT an evade lever; it
is (a) a sturdier damage standard for the NEXT classification (scope
and D_BEST form frozen up front), and (b) the two findings below,
which this classification surfaced and which bear directly on the
winnability chain: parties meet strangers, not targets (2/42), and
evades teach nothing (0/42 trick-known, trickAfter false on all 42).

## Blanks filled or documented

- **Filled:** the cousin-evade classification on the 112301–112308
  band — every launched evade in both committed corpora classified
  with party-knowledge fields and a verdict (classifier
  `scripts/classify-cousinevade-b.js`, proof
  `scripts/test-cousinevade-b.js` 14/14, analysis
  `evidence/2026-11-28/cousinevade-b-analysis.json`).
- **Filled:** the launch-join rule for this corpus — latest in-window
  launch wins, no target filter; joins 42/42 where the old rule left
  5 joinless; locked by proof-test regressions (zoltan d54 buffering
  launch; gen_3ghbpc8 d102 eulogy launch).
- **Documented, not chased:** the scope sensitivity — the decision
  flips with the D_BEST scope (pooled NO-LEVER vs per-leg lever A);
  the next classification must freeze scope and D_BEST form up front.
- **Documented, not chased:** parties meet strangers, not targets
  (targetMatch 2/42) — the launch program sends parties after one
  monster and they meet another; a design question for the backlog.
- **Documented, not chased:** evades teach nothing (trick known 0/42;
  trickAfter false on all 42) — the #2514 starvation shape in
  miniature.
- **Documented, not chased:** party HP beyond the lead is unrecorded
  — a recorder gap for the next classification (stamp allies' HP on
  the encounter row).
- **Documented, not chased:** distance/terrain recorder gap (finding
  #2512, re-verified on this corpus) — the "could the party have
  closed distance" sub-question stays blocked.
- **Documented:** VM restart at ~09:16Z during this run (uptime 1 min
  on recovery) killed the `check.js --quick` run and swept /tmp; the
  corpus extracts were re-created from the held branches and the
  classifier re-run byte-identical. No work lost; the safe-commit
  index clobber also struck once after the prereg commit (prereg
  staged-as-deleted in the main index, file intact) and was repaired
  with the `ls-tree | update-index --index-info` pipe; the commit was
  verified byte-identical to HEAD.

## Findings disposition (for the coordinator — this arm does NOT edit sim-findings.md)

- #2504 (cousin evade, claimed by this arm 2026-11-28): classification
  program complete on band 112301–112308 — 15 WISE / 0 WASTED / 27
  UNDECIDED, decision NO-LEVER under the frozen rule. Coordinator
  marks: the classification is DONE; the finding itself stays OPEN as
  a question (the evade is not exonerated corpus-wide — the next
  classification needs a sturdier damage standard), or fixed if the
  coordinator judges the program complete. The coordinator decides;
  this arm does not mark it.
- NEW (for the coordinator to append): launched parties meet strangers,
  not targets — 40 of 42 classified evades met a monster that was not
  the launch target (joined launches target wave-3 kinds or null);
  the launch program's targeting is the open question.
- NEW (for the coordinator to append): evades teach nothing — 0/42
  evades had the trick known and trickAfter is false on all 42; every
  evade is a meeting that could have taught the trick and didn't
  (#2514's shape in miniature).
- NEW (for the coordinator to append): party HP beyond the lead is
  unrecorded — the encounter row carries only the lead's `vHpLeft`;
  a future recorder must stamp allies' HP for a true party-HP
  classification.

## Files

- Prereg: `evidence/2026-11-28/sim-cousinevade-b-prereg.md` (frozen
  BEFORE classification, commit `054f024b0`)
- Corpora (held branches, read-only): `sim-fleerepair-b` tip
  `7f228e1e5` (`perseed-fleerepair-b-field-build/`, 8 seeds) +
  `sim-emptybow-b` tip `2d205acb0` (`perseed-emptybow-b-field/`, 8
  seeds); extracts at `/tmp/sim-cousinevade-b-corpus/` (re-created
  after the VM restart; per-file sha256 in the analysis JSON)
- Analysis: `evidence/2026-11-28/cousinevade-b-analysis.json`
  (classifier exit 0, population 42: 23 build, 19 armed; re-run
  byte-identical after the restart)
- Classifier: `scripts/classify-cousinevade-b.js` (imports the
  fleerepair analyzer's `analyzeDir` for the population verbatim)
- Analyzer (instrument import, byte-identical from `sim-fleerepair-b`,
  sha256 `38315e8eb35124e365d2117bc29f24f65946ce7c7fef7b6ae9ffb4a949028077`;
  identical on `sim-emptybow-b`): `scripts/analyze-fleerepair-b.js`
  (selftest 17 checks PASS)
- Proof: `scripts/test-cousinevade-b.js` (14/14 green, re-run green
  after the restart)
- Evidence: `evidence/2026-11-28/sim-cousinevade-b.md` (this file)
