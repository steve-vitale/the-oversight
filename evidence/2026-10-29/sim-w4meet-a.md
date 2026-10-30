# sim-w4meet-a — WAVE-4 MEETING-SHAPE CENSUS, WIDER BAND (16 SEEDS)

Run: flesh-out loop, run fleshout-20261030T0420Z. Axis: scale-onramp
(blocking axis, converging, NOT converged). Worker: sim-w4meet-a.
DIAG arm, MEASUREMENT ONLY — zero src/js game changes, no default
flip, no deed-bar move, no gate change.
Preregistration (binding, committed BEFORE any judged analysis):
evidence/2026-10-29/sim-w4meet-a-prereg.md (commit b265470d).
Instruments: commits 299d1d85 (sweep + analyzer) and 00315b64
(engineAllies read fix, fieldparty not breakline).
VERDICT: DIAG-NO-GO — decided by exactly ONE leg: the prereg's
outcome-taxonomy completeness leg (OTHER = 0) fails with exactly
one row, a NAMED discovery (the first wave-4 expedition EVADE —
see below). Every other leg PASSES: seed completeness 16/16,
determinism PASS, sense PASS (all 20 fought logs read), fixtures
PASS (32 checks), shape taxonomy OTHER = 0, unlock-vs-contact
pair reported, ranked next named. The NO-GO is a taxonomy
technicality with a one-line fix for the next run's prereg, not a
data failure — but metric binding forbids re-scoring it away here,
so the verdict stands as NO-GO and the fix is proposed under
"metric review" for the NEXT run.

## Plain words first

On current master, wave-4 meetings are still rare, still
concentrated, and still unwinnable-as-fought — but the wider band
proves the concentration is a heavy tail, not a one-seed fluke.
21 wave-4 meetings on 16 seeds: 13 on seed 75102 (as before) plus
8 more spread across 4 new seeds (75110, 75113, 75114, 75116).
Nine seeds unlock wave 4, but only 5 ever meet a wave-4 monster —
unlocking still overstates contact, nearly twofold. Zero kills,
again, across all 21 meetings; 8 end in death, 12 in flight, and
1 — the new discovery — in a clean evasion.

Who meets them: almost always a villager out alone or with
whoever happens to share the tile — never an expedition party
(crew size 0 at all 21 meetings). Tile mates are present at 15
meetings, join at only 5, and add 3–6 damage against beasts
holding 618–1,285 HP. Fighters at tile-mate meetings die MORE
often (6 deaths in 10) than lone fighters (1 in 5) or joined
fighters (1 in 5) — company at this scale is not rescue.

Warned or not: mostly not. 13 of 21 meetings are unwarned — no
prior contact with the beast type, no counter known — and every
first meeting on every new seed is unwarned. All 8 warned meetings
sit on the 75102 chain, where the same wounded beasts keep coming
back. A village meeting wave 4 for the first time meets it blind.

Would a readiness gate on the MEETING have helped? It would have
blocked 14 of 21 meetings — and every one of the 7 deaths among
them — but it would not have produced a single win: the 7
meetings it lets through (villages fully ready by the gate's own
read) also end with 0 kills, 5 flights, 1 death, 1 evasion. The
binding bar at meeting time is veterans: all 14 blocked meetings
are short on living wave-3 killers, and only that bar. And 3 of
the blocked meetings are raids — the beast comes to the village,
so "don't meet it" is not an option the village has; a meeting-
gate for raids needs a design answer, not just a threshold.

## Header (pre-registered) vs result

- COMPLETENESS: 16/16 valid seeds AND all six recorders errs 0
  with overflow empty AND joins 100% AND every universe row
  assigned a shape + outcome class AND taxonomy OTHER = 0.
  RESULT: 16/16 rows valid; joins 2248/2248, 0 errors, 0 branch
  mismatches, 0 wave disagreements; shape OTHER = 0; taxonomy
  OTHER = 1 (the evade row, named below) → FAIL on the taxonomy
  leg alone. All other completeness conditions PASS.
- DETERMINISM GATE: one seed re-run into a scratch dir; row JSON
  byte-identical.
  RESULT: seed 75102 re-ran byte-identical (analyzer --detgate
  DETGATE-PASS); scratch dir removed after the diff → PASS.
- SENSE BAR: ALL fought wave-4 transcripts read end to end when
  fought <= 40 (prereg ALL rule fired: fought = 20).
  RESULT: all 20 fought logs read end to end, plus the 1-line
  evade log (a pre-contact meeting, read though it never counts
  toward the bar) → PASS.
- FIXTURE BAR: taxonomy, tile rule, shape mapping, warned
  signals, readiness shortfall, join rule proven on synthetic
  rows before judging.
  RESULT: FIXTURES-PASS (32 checks, 0 fails) → PASS.
- UNLOCK-VS-CONTACT PAIR (reporting leg): per seed, wave-4
  unlock count AND wave-4 meeting count both reported.
  RESULT: reported per seed below; unlock 9/16, contact 5/16 →
  PASS as a reporting leg.
- LEVER LICENSE (per shape, >= 5 meetings): wild LICENSED (16);
  raid INSUFFICIENT-DATA (4); other INSUFFICIENT-DATA (1).
  Counts only for raid/other, NO lever judgment from them.
- No re-scoring: no metric was changed mid-run. The analyzer
  exits non-zero (MACHINE-LEGS-FAIL) on the completeness leg;
  sense was judged by reading, not by the exit code.

## Wall numbers (this band, 16 seeds, tableseat-nowait, 180d — REPORT-ONLY)

- Wins: 9/16, all lesser seats (full 0). National ever: 13/16.
  National final: 11/16. Table reached: 12/16. Table entered:
  9/16 (every entered seat won a lesser seat).
- Wave reach (unlock flag): wave 1: 16/16, wave 2: 16/16,
  wave 3: 14/16, wave 4: 9/16, wave 5: 0/16.
- Median survival: 118d (analyzer convention — upper-middle row;
  days sorted [31, 86, 90, 99, 101, 114, 115, 115, 118, 128, 150,
  160, 165, 180, 180, 180]; statistical median 116.5d, noted for
  comparability).
- Deaths: 527 total. Starvation: 3.
- Death causes (527): villager:combat 219 (41.6%),
  villager:villager combat 140 (26.6%), player:the wild 63
  (12.0%), villager:expedition 42 (8.0%), villager:monster 18
  (3.4%), rest small. This band does not starve; it is killed
  in combat, as before.

## Q(e) — unlock vs contact per seed (the pair, never reach alone)

| Seed | Days / end | Wave reach | Unlocked 4 | Wave-4 meetings | First meeting |
|---|---:|---:|---:|---:|---|
| 75101 | 115 / over | 4 | yes | 0 | none |
| 75102 | 86 / lost | 4 | yes | 13 | d55 wild/resolve eulogy FLEE r2 solo |
| 75103 | 90 / over | 3 | no | 0 | none |
| 75104 | 101 / over | 4 | yes | 0 | none |
| 75105 | 165 / over | 4 | yes | 0 | none |
| 75106 | 115 / over | 3 | no | 0 | none |
| 75107 | 114 / over | 4 | yes | 0 | none |
| 75108 | 31 / lost | 2 | no | 0 | none |
| 75109 | 180 / survived | 3 | no | 0 | none |
| 75110 | 118 / over | 4 | yes | 2 | d51 other/other eater EVADE r0 solo |
| 75111 | 99 / over | 3 | no | 0 | none |
| 75112 | 128 / over | 3 | no | 0 | none |
| 75113 | 150 / lost | 4 | yes | 3 | d127 raid/resolve influencer FLEE r2 tile |
| 75114 | 160 / lost | 4 | yes | 1 | d115 wild/resolve audit FLEE r3 joined |
| 75115 | 180 / survived | 2 | no | 0 | none |
| 75116 | 180 / survived | 4 | yes | 2 | d139 wild/resolve audit FLEE r3 joined |

UNLOCK ≠ CONTACT, still: 9/16 unlock wave 4, 5/16 meet a wave-4
monster, 4 seeds unlock with zero meetings (75101, 75104, 75105,
75107). The gap narrowed vs the 8-seed corpus (where contact was
1 seed) but did not close: contact is still barely over half of
unlock. First-meeting days on contact seeds: d51, d55, d115,
d127, d139 — the wave-4 window opens early on two seeds and past
day 100 on three.

## Q1 — what shape are wave-4 meetings? (universe N = 21)

### By shape

| Shape | n | Fought | Kills | FLEE | DEATH | EVADE/other-outcome |
|---|---:|---:|---:|---:|---:|---:|
| wild (field) | 16 | 16 | 0 | 10 | 6 | 0 |
| raid | 4 | 4 | 0 | 2 | 2 | 0 |
| other (expedition) | 1 | 0 | 0 | 0 | 0 | 1 (EVADE) |
| TOTAL | 21 | 20 | 0 | 12 | 8 | 1 |

### By outcome, in full

- KILL: 0. PRE-CONTACT-KILL: 0. WAVE-4 KILL COUNT: 0 — fought
  and pre-contact alike, on all 16 seeds.
- DRIVE-OFF: 0. PRE-CONTACT-SCATTER: 0. Wave-4 beasts do not
  scatter on sight and are not driven off in-band.
- FLEE: 12 — HOPELESS-BRANCH 8, FLOOR-BRANCH 4, LEARN-BRANCH 0,
  CAP 0, TRICK-EXIT 0.
- DEATH: 8 (38% of meetings; 40% of fought meetings).
- EVADE (named discovery, taxonomy OTHER): 1 — see below.
- Totals: 39 rounds, 405 damage dealt (mean 19.3/meeting),
  1,568 taken (mean 74.7/meeting). Zero-dealt fought meetings: 4.

### The named discovery: the first wave-4 EVADE

Seed 75110, day 51, expedition channel, Ellis vs The Eater,
rounds 0, outcome 'evade', 0 damage both ways, beast unharmed
(mHpLeft 1107, within its [950, 1150] def range; mHpStart null —
the expedition path records no live start HP). The whole log:

```
Ellis saw The Eater in time and gave it room.
```

'Evade' is a standard engine outcome (182 across all waves
band-wide, 8% of all 2,248 meetings; fieldFights.js: the
pre-fight awareness check — "saw it, gave it room" — decides
contact, not outcome). The w4shape taxonomy never had to cover
it because its band held zero wave-4 evades. The wider band
surfaced the first one, and it matters beyond taxonomy: this is
the ONLY wave-4 meeting in-band where a villager's senses beat
the beast — awareness, not armor, decided contact. It is also
the only meeting by a fully-ready village (9/12/15/1) that cost
nothing. Whether evasion is a learnable, priceable meeting shape
or a one-off awareness roll is a question for the next arm, not
a claim here.

## Q(a) — who meets: party size, fighter, joins

### By party (recorded state only — no engine "party" exists)

| Party | n | FLEE | DEATH | OTHER | Kills |
|---|---:|---:|---:|---:|---:|
| solo-tile (tile 0) | 6 | 4 | 1 | 1 (evade) | 0 |
| tile-mates present, not joined | 10 | 4 | 6 | 0 | 0 |
| joined (ally fought) | 5 | 4 | 1 | 0 | 0 |

Tile mates were present at 15/21 meetings (tile counts 1–6),
yet allies joined at only 5 (33% of tile-present meetings).
Joined-ally damage: 6, 5, 4, 6, 3 — against beasts holding
618–1,088 HP at the time. The join is real but negligible at
wave-4 scale, as before, now on 5 joins instead of 3.
Tile-mates-present-but-not-joined is the DEADLIEST seat in the
house: 6 deaths in 10, vs 1 in 5 solo-tile fought and 1 in 5
joined. Company that does not join does not help; if anything
it marks the fights that were already going worst (aid-caller
crisis fights dominate the tile-mates class).

CREW SIZE IS 0 AT ALL 21 MEETINGS. The fieldparty `crew`
(outdoor crew excluding the leader) is empty everywhere — no
wave-4 meeting in-band is an expedition party that set out
together. "Party size at meeting" is therefore tile co-location
(whoever happens to share the monster's tile), not a formed
party. Any future party lever must first explain where a party
would come from: the meetings have none to enlarge.

### By caller

resolve 13 (wild 9, raid 4), aid 7 (all wild), other 1
(expedition). Aid-caller meetings (7) are the crisis-response
shape: a villager answering someone else's trouble meets a
wave-4 beast. Scholar-led: 0/21. Tile-unknown villagers: 1
total (75113 d136) — tile reads are otherwise complete.

### Fighter gear at meeting (all 21)

- Armed: 21/21. armorP: range 3–60 (3, 4, 5, 5, 9, 9, 9, 9, 14,
  16, 22, 22, 22, 22, 29, 30, 30, 30, 50, 60, 60).
- veteranW3 (wave-3+ kill in the ledger): 0/21. No wave-4 fighter
  in-band is a wave-3 veteran — the same zero as before, now on
  21 fighters.
- New gear vs the old band: a phase_blade (Nora, 75114), a
  crossbow (Ellis, 75110, the evade), armorP 50 (Ellis) — the
  best-geared fighters still do not kill: Ellis evades (0
  damage, 0 taken), Nora flees after the band's best single
  meeting damage (58).
- Intents: engage 12, learn 9. Nine wave-4 meetings are led by a
  learn-intent villager — including 4 of the 8 deaths.
- No-arrow transcripts: present on the 75102 chain only (the
  old band's 8/13); NONE on any new-seed meeting — the new-seed
  fighters all carry melee weapons. The ammo gap is a 75102-
  fighter artifact, not a band-wide wave-4 property.

## Q(b) — warned vs unwarned (operational definition, prereg-fixed)

WARNED = prior meeting with the same beast type in the same seed
(W1) OR counter known for the type at the meeting (W2); W3 =
re-meet of the same wounded individual (prior meeting's mHpLeft
equals this meeting's mHpStart). LIMIT, carried from the prereg
wherever the unwarned share is quoted: scout sightings, rumors,
and heard shouts BEFORE contact are NOT captured by any recorder
in the stack, so they are UNMEASURED here — an "unwarned"
meeting means "no prior-type contact and no counter knowledge in
the corpus", NOT "the village had zero warning in fiction".

| Shape | n | Warned | Unwarned | W1 | W2 | W3 |
|---|---:|---:|---:|---:|---:|---:|
| wild | 16 | 8 | 8 | 8 | 2 | 7 |
| raid | 4 | 0 | 4 | 0 | 0 | 0 |
| other | 1 | 0 | 1 | 0 | 0 | 0 |
| TOTAL | 21 | 8 (38%) | 13 (62%) | 8 | 2 | 7 |

ALL 8 warned meetings sit on the 75102 chain. Every first
meeting on every new seed is unwarned, and every raid meeting
is unwarned (a raid beast is by definition a first contact for
that village). The only W2 (counter-known) meetings are the
3rd/4th eulogy meetings on 75102 (d57, d59) — the village learns
the eulogy's counter only after meeting it twice, and still
loses the fighter on d57. Warned does not mean safe: warned
meetings end 5 FLEE / 3 DEATH / 0 kills; unwarned end 7 FLEE /
5 DEATH / 1 EVADE / 0 kills. Warning changes nothing about the
outcome class in-band — it only changes how many times the
village has already lost to this beast.

### Chains: 14 individuals behind 21 meetings

W3 wound-continuity corrects the old band's type-count: the
75102 algorithm chain is TWO individuals (d64 beast 1000→986,
never re-met; d65 beast 1000→971→971→959→959 across 4
meetings), not one. Individuals: 75102: eulogy 1, algorithm 2,
audit 1, herald 1, reunion 1 (6); 75110: eater 1, reunion 1;
75113: influencer 1, eulogy 1, audit 1; 75114: audit 1; 75116:
audit 1, suburb 1. Total 14 individuals / 21 meetings; 7
re-meetings (W3), all on 75102. The audit is the most dispersed
beast (4 seeds); the eulogy chain is the only chain longer than
2 meetings. Wounds persist across re-meetings, but at observed
rates the chains do not close: the eulogy chain deals 47 over 4
meetings against 853 remaining HP; the d65 algorithm chain
deals 53 over 4 against 959 remaining.

### Below-floor arrivals (finding, reported not chased)

Three first-meetings arrive BELOW their def HP floor, with no
prior meeting of that beast in the seed's corpus: 75113 eulogy
at 675 (def [900, 1100]), 75116 audit at 825 (def [1100, 1300]),
75113 influencer at 637 (def [850, 1050]). Either these beasts
were wounded off-corpus before the recorded meeting, or spawn HP
ranges wider than the def ranges — the corpus cannot distinguish
the two, and this arm does not guess. Reported to the
coordinator as a findings item: the off-corpus wounding channel
(if it exists) is itself a meeting-shape question.

## Q(c) — meeting context

- Wild: field tiles (mTile recorded, e.g. 4,3), callers resolve
  9 / aid 7, days 55–145, beasts eulogy/algorithm/audit/herald/
  reunion/suburb, HP at meeting 675–1300.
- Raid: raid-depth (havenRaidTick) meetings, all resolve-caller,
  days 64, 73, 127, 136, beasts algorithm/audit/influencer/
  eulogy, HP at meeting 637–1100. The raid meeting reads like a
  defense that never had a chance, as before — now with a new-
  seed case (Maame vs influencer, d127, tile 6, still flees).
- Other: one expedition meeting (d51, eater, evade, no mTile —
  the expedition path records no live tile).
- No haven-approach vs wild-tile distinction is claimed beyond
  channel + caller + mTile: no recorder field draws it.

## Q(d) — readiness at meeting + the meeting-gate counterfactual

Demand, read LIVE from src/js/standing.js at analysis time
(standingCfg().readyDemand[4]): armored 3 at armorP >= 10,
armed 5, tricks 3, veterans 1 (living wave-3+ killer). At-meeting
readiness is Game.waveCombatReadiness(4) itself, recorded by
the fieldparty recorder at every meeting — the w5counts-a
exact-count method at meeting time.

| | Meetings | FLEE | DEATH | OTHER | Kills |
|---|---:|---:|---:|---:|---:|
| Gate would BLOCK (ready false) | 14 | 7 | 7 | 0 | 0 |
| Gate would LET THROUGH (ready true) | 7 | 5 | 1 | 1 (evade) | 0 |

Blocked by shape: wild 11, raid 3, other 0. Blocked shortfalls:
veterans short in 14/14 blocked meetings (the binding bar, every
time); armored short in 4; armed short in 2; tricks short in 0
(tricks at meeting range 13–24, demand 3 — never the constraint).
Readiness counts at meeting: armored 1–9, armed 2–12, tricks
13–24, veterans 0–1.

THE COUNTERFACTUAL, STATED PLAINLY: a full-demand meeting-gate
would have avoided 7 deaths and 7 flights — and produced zero
wins, because the 7 meetings it lets through also produce zero
wins (5 flights, 1 death, 1 evasion). The gate is a loss-avoider,
not a win-maker, on this band. Two of its let-through meetings
deserve names: Nora vs audit (75114, d115, ready 6/8/24/1,
joined, 58 dealt — the band's best fought meeting — still
flees) and Aria vs eulogy (75102, d57, ready, trick KNOWN,
still dies without dealing damage — the narration-beat turns
consume her damage entirely).

AVOIDABILITY (separate from blocking, never conflated):
- Raid blocked meetings (3: d64 DEATH, d73 FLEE, d136 DEATH):
  NOT avoidable by staying home — the beast comes to the
  village. A meeting-gate for raids cannot mean "the meeting
  does not happen"; what happens to the raid instead (does the
  village hide? does the beast rampage unopposed? does the
  System hold the wave?) is OUT OF SCOPE for this
  counterfactual and needs a Steve-call before any raid-gate
  is designed.
- Wild/other blocked meetings (11): the fighter went out.
  Avoidable in principle by not going out, at a foraging cost
  this arm does NOT price — the evidence says that and does
  not price it.
- Re-meetings (W3, 7): blocking the FIRST meeting of a chain
  changes the chain; the blocked count above counts meetings,
  not chains, and a blocked first-meeting is never silently
  counted as a blocked re-meeting — the chain table is printed
  alongside for exactly that reason.

## Q(f) — the clustering question: seed luck or structural?

STRUCTURAL-ISH, with the tail now visible. The 8-seed corpus had
all meetings on one seed; the 16-seed corpus has 13/21 (62%) on
75102 but 8 meetings on 4 further seeds. Contact is not a
one-seed fluke — it is a rare, heavy-tailed phenomenon: most
villages that unlock wave 4 never meet it (4/9 unlock seeds),
one village meets it repeatedly (13 meetings, 6 individuals),
and a minority meet it once or twice, always unwarned, always
without a kill. The wider band licenses wild-shape judgment
(n=16) and NOTHING else: raid (4) and other (1) stay
insufficient-data, counts only.

Drift diagnostic (corpus-to-corpus, NOT current numbers): the
first 8 seeds of this corpus reproduce the w4shape corpus
exactly on days, wave reach, and wave-4 meeting counts
(75102: 86 days, 13 wave-4 meetings on both) — the base has
NOT moved since w4shape. The new findings (evade, influencer,
suburb, below-floor arrivals, 4 new contact seeds) come from
the wider band, not from drift.

## Sense-testing law (all 20 fought logs read end to end + evade line)

S1 — the evade (75110 d51, Ellis vs Eater, 1 line): "Ellis saw
The Eater in time and gave it room." Coherent, and the only
wave-4 log in-band where a sense beats the beast. Its fighter
is the best-geared in-band (armorP 50, crossbow, ready
9/12/15/1) — but the log credits sight, not gear. Do not let
the evade become a gear story; it is a perception story.

S2 — the ready-but-lost fights. Nora vs audit (75114 d115,
ready, joined): Rage doubles her strikes, Mai joins for 6, Nora
still flees at 54 HP with the beast at 1,042/1,100. Maame vs
influencer (75113 d127, ready, raid, tile 6): two clean
exchanges, 19 dealt vs 618 remaining, honest flee line. The
flee lines land in every transcript now (no mid-log endings) —
the narration landings hold on new seeds too.

S3 — the wounded-entry death (75116 d139→d140, Miguel): d139
ends with Miguel at 1 HP after a joined audit flee; d140, the
next day, the suburb's Property Tax hits him for 43 and he is
dead before his second exchange. Same fighter, consecutive
days, no recovery window in between. The "nearly-dead-entry"
pattern from the death census is visible as a chain, not just
a death.

S4 — the eulogy's narration tax (75102 d57, ready, trick known):
Aria never strikes — both rounds are "contradicts the
narration" beats, then 42 + 40 damage and death. The signature
mechanic costs the whole fight, even when the village is ready
and knows the trick. This is one of the 4 zero-dealt meetings,
and it is by design, not by failure.

S5 — the new-seed fights read the same as the old chain: 1–3
rounds, decided immediately, field medicine buys less than a
round (Hugo binds +20, still flees at 28 HP; Vasylyna takes 62
in one exchange and floor-flees at 13). No robotic or repeated
dialogue flagged beyond the deliberate signature refrains.
Cross-cutting: (1) every fought meeting is decided in rounds
1–3 — wave-4 fights never build; (2) the ammo gap is gone on
new seeds (all melee fighters) — it was a 75102 artifact;
(3) joins add 3–6 damage in all 5 cases, never a turning point.

## RANKED NEXT (with numbers — no lever built here)

1. EVADE TAXONOMY FIX + EVADE MEASUREMENT (the NO-GO cause,
   cheapest next step). Next run's prereg adds PRE-CONTACT-
   EVADE (rounds < 1 AND outcome 'evade') as a named class; the
   census then re-judges clean. Separately: measure evade as a
   meeting shape band-wide (182/2,248 all-wave meetings here,
   8%) — at wave 4, is evasion awareness-gated, gear-gated, or
   luck? One wave-4 evade cannot answer that; a band that
   produces more of them (or a targeted awareness instrument)
   must come first.
2. MEETING-GATE DESIGN QUESTION (Steve-call, not a build).
   The counterfactual is priced: blocking 14 meetings avoids 7
   deaths + 7 flights and 0 wins; ready meetings still lose.
   Before any gate is built, Steve must rule on (a) what a
   raid meeting-gate means when the beast comes to the village
   (3 blocked raids in-band), and (b) whether a loss-avoiding
   gate is worth building when it cannot produce a win. This
   arm prices the gate; it does not recommend it.
3. BELOW-FLOOR ARRIVALS (finding, needs an instrument, not a
   lever). 3 first-meetings below def HP floor (eulogy 675,
   audit 825, influencer 637). If beasts arrive pre-wounded
   off-corpus, the meeting census is missing a wounding channel
   — the next instrument should record beast provenance (spawn
   HP vs meeting HP) before any chain arithmetic is trusted
   for new seeds.
4. TILE-MATES-FARE-WORST (n=10, 6 deaths) + CREW-EMPTY (0/21).
   If parties are the intended bridge to wave-4 kills, the next
   measurement is why tile co-location without joining is the
   deadliest seat — and where a real party would come from,
   since no meeting in-band has a crew. Do NOT judge a party
   lever from this band: joins are 5, and the party concept
   itself is unmeasured.
5. RAID-SHAPE WAVE-4 — INSUFFICIENT-DATA (n=4). Do not judge
   any raid-shape lever from 4 meetings. A raid-heavy band or
   a larger seed set must come first.

## Findings for the coordinator (reported, NOT appended by this worker)

- [evade taxonomy] The w4shape outcome taxonomy has no 'evade'
  class; the wider band surfaced the first wave-4 evade
  (75110 d51, Ellis vs Eater). Next prereg must add
  PRE-CONTACT-EVADE; this run's NO-GO is that one leg.
- [below-floor arrivals] 3 first-meetings below def HP floor
  (75113 eulogy 675, 75116 audit 825, 75113 influencer 637) —
  possible off-corpus wounding channel, needs a provenance
  instrument before chain arithmetic is trusted on new seeds.
- [raid-gate question] Steve-call: what does a meeting-gate
  mean for raid meetings (3 blocked in-band), where the beast
  comes to the village? Priced, not recommended.
- [algorithm individuals] W3 wound-continuity shows the 75102
  algorithm chain is 2 individuals, not 1 — type-count chain
  arithmetic overstates chain length. Future chain work must
  use W3-style individual tracking.
- [ammo gap scope] No-arrow transcripts occur only on 75102
  in-band; new-seed wave-4 fighters are all melee. The ammo
  gap is a seed-fighter artifact, not a band-wide wave-4 gap.

## Metric review (for the NEXT run — nothing re-scored here)

- OUTCOME TAXONOMY: the prereg copied w4shape's outcome list,
  which never needed 'evade' (0 wave-4 evades in its band).
  The wider band broke that assumption on its first new contact
  seed. Proposed revision for the NEXT run's prereg (not
  applied here): add PRE-CONTACT-EVADE (rounds < 1 AND outcome
  'evade') BEFORE the OTHER class, and add a pre-sweep
  taxonomy audit — list every distinct outcome value in a
  1-seed pilot corpus and confirm the taxonomy covers it —
  before the judged band runs. A taxonomy that can only fail
  on the judged band is a wasted band.
- SHAPE-OTHER vs TAXONOMY-OTHER: this run's verdict turned on
  keeping them apart (shape OTHER = 0 passes; outcome OTHER = 1
  fails). The brief's "OTHER = 0" bar is ambiguous between the
  two; future preregs should name which OTHER each leg means,
  as this one did in its metrics section — and the verdict
  section should quote both, as this one does.
- MEDIAN-DAYS CONVENTION (carried): the analyzer reports the
  upper-middle row (118d); the statistical median is 116.5d.
  This evidence quotes 118d for comparability and notes
  116.5d here.
- WARNED DEFINITION: W1/W2/W3 worked — every warned meeting
  is checkable from the corpus, and the unwarned caveat (scout
  sightings, rumors, pre-contact shouts unmeasured) held up:
  nothing in the transcripts contradicts it, and the evade log
  ("saw in time") shows the awareness channel exists without
  being recorded as a warned signal. Keep the definition, but
  note the evade log as the case that most strains it: Ellis
  WAS warned by his own eyes, and the corpus still classifies
  his meeting unwarned (no prior type, no counter known).
  A future warned definition should consider an awareness
  signal — but only once a recorder captures it; this run
  does not retrofit one.
- UNLOCK-VS-CONTACT PAIR: worked as a reporting leg (9/16 vs
  5/16, per seed). Keep it mandatory for every wave-4 arm.
- PARTY SPLIT: the solo / tile-mates / joined split worked,
  but "full party" was correctly refused (no engine party
  object; crew 0 everywhere). Future preregs should keep
  refusing it until a recorder defines one.
- Balanced panel (§15): not applicable — DIAG census on a
  fixed band, not a before/after lever comparison. No panel
  compare is claimed.

## Convergence note

Scale-onramp stays converging, NOT converged. This arm moves no
wall number — by design, it is diagnosis — but it widens the
citable wave-4 baseline from 8 to 16 seeds, proves the base
stable since w4shape (first 8 seeds reproduce exactly), and
prices the meeting-gate question with numbers: a full-demand
gate blocks 14/21 meetings and 7 deaths, and still produces 0
wins, because ready meetings lose too. The next arm that claims
movement on this axis must move one of those measured
quantities — a finished beast, a drive-off, an evasion that
repeats, a joined fight that changes its outcome — not
re-describe them. The verdict's NO-GO is the taxonomy's, not
the data's: the census itself is complete, deterministic, and
fully sense-read.

## Infrastructure notes

- Sweep compute ~27 minutes for 16 seeds (slower than w4shape's
  ~2.5 min for 8 — the new seeds carry larger meeting counts,
  e.g. 75109 with 251 meetings; per-seed cost, not a slowdown
  in the harness).
- Safe-commit index clobber hit all three worker commits
  (prereg, instruments, instrument fix) — repaired via
  HEAD-blob cacheinfo each time with hash verification, never
  reset, never forced, commits verified correct. Same clobber
  class as the 2026-10-29 loop notes.
- Analyzer fix mid-run (engineAllies source): committed
  separately (00315b64) BEFORE the evidence was written; the
  judged analysis JSON was regenerated after the fix, so the
  evidence quotes the fixed analyzer's output. No corpus row
  changed.
- Scratch dir (determinism re-run of s75102) removed after its
  diff; the worktree holds only committed work plus the corpus
  committed with this file.
- Analyzer exits non-zero (MACHINE-LEGS-FAIL) on the
  completeness leg only; fixtures FIXTURES-PASS (32 checks, 0
  fails); sense read 20/20 fought logs + the evade line
  (SENSE-OK by reading).
- No live verification, no push, no bump: this arm reports
  "ready for coordinator merge, pending ship" per assignment.
  The batch ship job owns pushes.

## Files

- Corpus: evidence/2026-10-29/perseed-w4meet-a/s75101–s75116-fresh.json
  (16 rows) + summary.json (corpusOk true).
- Analysis: evidence/2026-10-29/w4meet-a-analysis.json
  (recomputed from the corpus by the analyzer).
- Analyzer: scripts/test-w4meet-a.js (machine legs FAIL on the
  taxonomy leg only; fixtures 32 checks; --sense prints all
  fought wave-4 logs under the ALL rule; --detgate byte-compare).
- Sweep: scripts/test-w4meet-a-sweep.js (tableseat-nowait
  substrate verbatim + full w4shape recorder stack verbatim,
  corpus perseed-w4meet-a). Sweep log: sweep-w4meet-a.log.
- Prereg: evidence/2026-10-29/sim-w4meet-a-prereg.md (b265470d).
- Instruments: scripts/test-w4meet-a-sweep.js +
  scripts/test-w4meet-a.js (299d1d85, fix 00315b64).
