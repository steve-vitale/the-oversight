# sim-dmg-bands — companion damage vs wave-4 HP bands DIAG (axis scale-onramp)

Run fleshout-20261022T2125Z, worker sim-dmg-bands (DIAG, instrument-only,
zero src/js).

Canon read first: docs/CANON.md + docs/MONSTER-WAVES.md (wave 4 = The
Mirror Draft; bands anchored: damage 35-95, HP 850-1500, pierce 0.2-0.5).
The band edges (L 850-1050 / M 1051-1250 / H 1251-1500) come from that
anchor, not from invention. No canon doc covers armor/equipment — stated,
not invented.

## Named next this arm answers

- sim-stagemuster (pilot NO-GO, evidence/2026-10-22/sim-stagemuster.md):
  staged companions in wave-4 TB fights die without landing kills — 0
  damage-majority villager wave-4 kills across 76 staged fights. "The
  bottleneck for the scale wall is not getting companions into the mirror
  room; it is what happens once they're there... companion damage output
  vs wave-4 bands (35-95 dmg, HP 850-1500)."
- sim-wave4engage-r2 (KILLED-AT-PILOT,
  evidence/2026-10-22/sim-wave4engage-r2.md): "instrument companion
  damage-vs-wave-4-bands first, then test a fight-level intervention."
  Its probe measured (6 fights): scholar 1333 vs companion 1269 aggregate
  — companions land REAL damage roughly matching the scholar, but wave-4
  HP pools (850-1500) outscale the party's combined fight output.

This arm builds that instrument and measures the corpus. A sibling arm is
testing scholar-softens/companions-close as the fight-level intervention;
this arm's band table is its targeting data.

## PRE-REGISTRATION (§14 binding — written BEFORE the corpus sweep)

- Design: 8 FRESH seeds (65561-65568, filename-verified 2026-10-22 — 0
  filename hits across evidence/ + scripts/) x {leadfeast, belongfeast}
  = 16 paired configs, 180d death-aware (dead villages stop simulating;
  the harness breaks on Game.over), on the pre-seat substrate
  (FEASTSCALE_R13=1, SEATDRIVE=0) with the dmgbands instrument
  (DMGBANDS=1). NO lever arms, NO game-code changes — DIAG only. Proof
  gates (scripts/test-dmgbands-20261022.js) ALL GREEN (57/57) before the
  sweep, incl. real-sim determinism (60d x2 byte-identical) and the
  DMGBANDS-unset no-op det-gate.
- PRIMARY (DIAG-GO, binding): (a) attribution coverage — >=95% of all
  wave-4 encounter companion damage (TB companion + field villager) sits
  in named band cells {L, M, H}; (b) zero unattributed — TB other-source
  damage on wave-4 monsters = 0 AND orphan kills (wave-4 kills unlinkable
  to an encounter record) = 0. GO = (a) AND (b).
- SECONDARY (reported, non-binding): the band table (per monster x band:
  fights, kills, killRate, companion dmg/fight, scholar dmg/fight, pool
  range, kill-time villager kills, damage-majority villager kills);
  kill-fight vs non-kill companion damage/fight; wall numbers (national /
  table / wins, wave 4-5 unlocks, median survival).
- Instruments: scripts/dmgbands-instrument-20261022.js (TB per-source
  tbDamage attribution scholar/companion-byVid/other on wave-4 monsters;
  field per-villager mDealt; startCombat HP-pool census; kill linkage
  TB-via-fightId / field-via-activeField; orphan-kill residual). No
  balanced panel (§15): single DIAG corpus, no treatment arms — nothing
  to compare; stated, not skipped.
- INSTRUMENT REFINEMENT (pre-sweep, 2026-10-22): the first 11/16 sweep
  configs revealed measured TB pools 2-3x the canon anchor (eulogy
  2308-2683, reunion 3025-3483 vs defs 900-1400). Root-caused to the
  OVERTIME RERUN mechanic (src/js/overtime.js overtimeScaleFight: wave-4+
  monsters return at +25% HP/tier with +1 packmate per 2 tiers via
  campaignInjectMonster — the m_crew_N fighters). The instrument now
  records rerunTier per TB encounter (Game.overtimeTier()); the analyzer
  derives baseBand = bandOf(pool / (1+0.25*tier)) so rerun encounters
  land in their monster's named band cell with the tier as the named
  mechanism multiplier. Metric (a) is judged on the pre-registered
  measured-band form (§14); the base-band read is reported alongside as
  the refined instrument. Mid-fight joiners (reinforcements after the
  census) are tracked informationally, not as errors.
- A miss is NO-GO — never re-scored mid-run (§14). Metric doubts go under
  "metric review" for the next run.

## Proof gates (run BEFORE the sweep — scripts/test-dmgbands-20261022.js)

E0 shape; E1 det-gate (DMGBANDS unset -> install no-op, methods identical,
child process); E2 env-gate; E3 synthetic RED->GREEN fixtures through the
real install() on a stub Game (bandOf boundaries 849/850/1050/1051/1250/
1251/1500/1501/null; resolveDmgSource scholar/companion/monster/other
mapping; TB census pool/band/staged; tbDamage per-source attribution with
monster-on-monster exclusion; kill linkage TB + field-via-activeField +
orphan residual; encJSON strips internals; wave-1 kills ignored); E4
real-sim determinism (60d leadfeast s65561 x2, serialized encounter
tables byte-identical); D2 180d run completes with a terminal endReason
(death-aware: the village may die early) and zero install.missing errors.

RESULT 2026-10-22: **57 PASS, 0 FAIL** — ALL GREEN (stale base 4945cf38c).

ADOPTION RE-RUN 2026-10-22/23 on f2daadf3d (run fleshout-20261023T0120Z,
worker sim-dmg-bands): env per Usage header + pre-reg substrate
(FEASTSCALE_R13=1 SEATDRIVE=0 DMGBANDS=1). **66 PASS, 0 FAIL** — ALL
GREEN. (Gate count rose 57->66: the pre-sweep instrument refinement added
rerunTier + mid-fight-joiner gates. E4 60d determinism byte-identical;
D2 180d terminal endReason, zero install.missing errors.)

## Corpus sweep

16/16 configs on f2daadf3d (ADOPTION: stale-base 14/16 partial corpus
deleted 2026-10-22 — no mixed bases; per-JSON anchorCommit verified
f2daadf3d on all 16). Seeds 65561-65568 x {leadfeast, belongfeast},
180d death-aware, substrate FEASTSCALE_R13=1 SEATDRIVE=0, DMGBANDS=1.
Per-seed JSONs: evidence/2026-10-22/perseed-dmg-bands/
(dmgbands-<policy>-s<seed>.json x16).

## Results

Corpus: 146 wave-4 encounters — 127 TB (scholar fight + companions), 19
field (villager off-screen). 8 kills, 0 orphan kills, 0 instrument
errors, 2 mid-fight joiners (tracked informationally, damage kept).

### Band table (per monster x BASE band; overtime tiers in parens)

| monster | band | fights | kills | killRate | compDmg/fight | schDmg/fight | poolRange | tiers |
|---|---|---|---|---|---|---|---|---|
| algorithm | M | 1 | 0 | 0 | 0 | 273 | 1057-1057 | t0:1 |
| audit | M | 1 | 0 | 0 | 0 | 0 | 1111-1111 | t0:1 |
| congregation | L | 14 | 1 | 0.1 | 0 | 231.1 | 1298-2553 | t1:1 t3:10 t6:3 |
| congregation | M | 5 | 0 | 0 | 0 | 0 | 1859-2658 | t3:4 t6:1 |
| congregation | UNK | 2 | 0 | 0 | 7 | 0 | 675-675 | t0:2 |
| eater | L | 21 | 0 | 0 | 0 | 8.7 | 950-2588 | t0:2 t5:9 t6:10 |
| eater | M | 19 | 0 | 0 | 0 | 5.5 | 2419-2850 | t5:9 t6:10 |
| eater | UNK | 1 | 0 | 0 | 26 | 0 | 1065-1065 | t6:1 |
| eulogy | L | 9 | 0 | 0 | 4.6 | 77.7 | 900-2284 | t0:7 t5:2 |
| eulogy | M | 6 | 0 | 0 | 0 | 167.5 | 1051-2419 | t0:5 t5:1 |
| eulogy | UNK | 1 | 0 | 0 | 13 | 0 | 675-675 | t0:1 |
| herald | UNK | 1 | 0 | 0 | 34 | 0 | 700-700 | t0:1 |
| influencer | L | 12 | 1 | 0.1 | 1.3 | 225 | 850-2333 | t0:5 t1:1 t5:6 |
| influencer | UNK | 3 | 0 | 0 | 10 | 0 | 592-835 | t0:3 |
| reunion | H | 14 | 0 | 0 | 0 | 9.9 | 1337-3498 | t0:1 t2:1 t6:12 |
| reunion | L | 3 | 0 | 0 | 11.3 | 0 | 866-900 | t0:3 |
| reunion | M | 6 | 0 | 0 | 6 | 51.5 | 1200-3123 | t0:1 t2:1 t6:4 |
| strike | L | 2 | 2 | 1.0 | 0 | 1309.5 | 1002-1565 | t0:1 t2:1 |
| strike | M | 4 | 4 | 1.0 | 223.8 | 1034.3 | 1072-1662 | t0:3 t2:1 |
| strike | UNK | 1 | 0 | 0 | 14 | 0 | 1108-1108 | t2:1 |
| suburb | H | 20 | 0 | 0 | 3.9 | 139.7 | 1300-3720 | t0:13 t1:3 t6:4 |

Base-band aggregate: L 61 fights / 4 kills (0.1), comp 1.5/fight;
M 42 / 4 (0.1), comp 22.2/fight; H 34 / 0, comp 2.3/fight;
UNK 9 / 0, comp 14.6/fight.

Kill fights vs non-kill (companion dmg/fight): kill fights 8 — comp
111.9, scholar 1144. Non-kill fights 138 — comp 2.4, scholar 65.5.

Mechanism split: TB 127 fights / 8 kills, comp 8.0/fight, scholar
143.3/fight. Field 19 fights / 0 kills, comp 11.4/fight.

Kill-time villager kills: 0. Damage-majority villager kills: 1 (strike M).

### DIAG-GO verdict (pre-registered, §14 binding)

- (a) attribution coverage, MEASURED band: 1229 total companion dmg,
  243 in named bands {L,M,H} -> **19.8%** (bar >=95%) -> **NO-GO**
- (a-refined) coverage on BASE band (overtime scaling removed via
  rerunTier): **89.3%** in named bands — reported alongside per pre-reg
- (b) zero unattributed: TB other-source dmg = 0, orphan kills = 0 ->
  **GO**
- Overtime rerun encounters: 96/146 (66%). Mid-fight joiners: 2
  (informational). Instrument errors: 0.

**DIAG verdict: DIAG-NO-GO** (pre-registered form; a miss is NO-GO,
never re-scored mid-run).

Why (a) missed: the canon-anchored bands describe the monster DEFS
(HP 850-1500), not what actually walks into wave-4 fights. Two named
mechanisms move pools out of the anchor: (1) OVERTIME RERUN —
66% of encounters, +25% HP/tier, measured pools 2-3x the anchor
(eulogy 2308-2683, reunion up to 3498, suburb up to 3720); the
refinement's baseBand = bandOf(pool/(1+0.25*tier)) recovers these to
their named cells. (2) BELOW-ANCHOR pools — 9 encounters: The Herald
(data wave:4, HP 700-900 — a 10th wave-4 monster missing from the
canon doc's 9-monster list; def below the anchor floor) plus sub-def
t0 census pools (congregation/eulogy 675 vs def 900-1100, influencer
592-835 vs def 850-1050; spawn-time scaler undetermined, census-honest).

Headline for the sibling fight-level arm (scholar-softens /
companions-close): 6 of the 8 corpus kills are The Strike — the
non-attacking monster (killRate 1.0). REAL combat kills of attacking
wave-4 monsters: 2 in 146 encounters (1.4%). Companions land 8
dmg/fight in TB vs the scholar's 143; villagers off-screen chip
11.4/fight and never kill. The targeting table is the base-band one
above: eater (41 fights, 0 kills), reunion (23, 0), suburb (20, 0)
are the volume; nothing dies except the Strike.

## Wall numbers

national=3/16, table=11/16 (invitation: Arc IV + seat bar, i.e.
tableWaiting||tableDone — none seated), won=0/16, wave4=12/16,
wave5=0/16, medianSurvival(non-winning)=134-137d, maxSurv=181d.
Deaths: combat 366, villager combat 145, monster 32, expedition 26,
starvation 14, sickness 7, contest 7, ambush 6, wound-unclosed 6,
dehydration 8 (long tail: Redactor/Performance Review/Choir
Toad/Big Big/alien/the night 1 each).

National reached in 3 configs (belongfeast s65562 d179,
leadfeast s65562/s65563 d181 — both survived the full horizon).
This is the first measured national reach on the pre-seat
substrate in this arm's corpus.

## Village assessment (plain words)

Fourteen of sixteen villages died; two walked the full 180 days.
The ones that died died fighting: combat accounts for 511 of ~620
recorded deaths. Villages look alive while they last — people
forage, haul water in pairs ("Nobody walks alone today"), gossip by
the fire with details that drift retelling to retelling, leave
branches by the stash without announcement. The wave-4 fights are a
scholar's war: "THE STRIKE! You're on your own" — staged companion
lists are empty in the sampled fights, the scholar lands ~143
dmg/fight while companions land ~8. When the scholar falls, the
village-as-protagonist machinery works as designed: Raj Medina went
down to two RERUN x6 Eaters on d143 and the Codex mantle passed to
Cuiping mid-grief while Rory said the line the design promised —
"You're not Raj... You'll have to earn this face" — and the dead
man's links shook as three neighbors pressed their tributes down.
The Eater is the wall's face: 41 encounters, 0 kills, eating 300
kcal of forage a turn while the party can't dent +150% HP pools.
Nobody sat at the table; nobody won; the wall stands, but for the
first time in this arm's corpus, villages are reaching national
ground (3/16) and hearing the table invitation (11/16).

## Sense test (SENSE-TESTING LAW)

Ran scripts/probe-dmgbands-sense-20261022.js (fixed 2026-10-22: the
original wrapped Game.emit with narration silenced — captured 0
lines; now passes narration:true to loadGame and wraps
Game.say/Game.sysSay). Read 3 wave-4 fight transcripts from leadfeast
s65565 (19,049 narration lines captured):

1. d77 THE STRIKE (band M, pool 1081, killed by scholar, 1117 dmg):
   the strike's identity lands — posted demands, picket line, grid
   shutdown rounds where "abilities sputter, items sit dead."
   Coherent, playable, funny-scary. Scholar alone (staged empty).
2. d143 THE EATER x2 (RERUN x6, pools 2745/2505, no kill): the rerun
   mechanic is voiced aloud ("you have seen this episode. It has
   seen you too. Overtime: +150% HP, +72% damage, +3 in the pack").
   The eater eats forage 300 kcal/turn, growing; the scholar goes
   down in round 3 having landed 0 damage. Death is consequential
   (see Village assessment).
3. Sense verdict: transcripts read as coherent fiction with real
   stakes and legible mechanics. Companions are the missing people:
   in the sampled fights nobody stages with the scholar — the
   "companions close" half of the sibling intervention is fighting
   an absence, not a weakness. Minor narration glitch noted: one
   line doubles the SYSTEM prefix ('📺 SYSTEM: "SYSTEM: ..."').

## Metric review (§14)

The pre-registered (a) bar (≥95% of companion damage in
canon-anchored measured bands) was the wrong ruler for the
phenomenon: the anchor describes defs, the fights are 66% overtime
reruns. The bar did its job anyway — the miss FORCED the rerunTier
refinement, which is the instrument's real product (base-band
table above). For the NEXT run, pre-register the GO bar on the
BASE band with the UNK residual budgeted: (i) below-anchor t0 pools
(spawn scaler undetermined), (ii) herald-type defs below the anchor
floor. Also split the "table" wall metric: tableWaiting
(invitation) vs tableDone (seated) — this corpus's 11/16 is
invitations, 0 seated. No re-scoring: verdict stands DIAG-NO-GO.

## Blanks filled / documented

- FILLED: sense probe narration capture (was 0 lines; now 19k lines
  via narration:true + Game.say/sysSay wrap).
- DOCUMENTED: The Herald — 10th wave-4 monster (src/data/monsters.json
  wave:4, HP 700-900), absent from docs/MONSTER-WAVES.md's 9-monster
  roster; def HP below the canon anchor floor. Canon-doc gap, not
  touched (Steve's doc).
- DOCUMENTED: 9 sub-def t0 pools at census (congregation/eulogy 675,
  influencer 592-835 vs defs 900-1100/850-1050) — spawn-time HP
  scaler undetermined; census reads maxHp||hp honestly.
- DOCUMENTED: doubled SYSTEM prefix in one narration line.
- DOCUMENTED (my error, fixed): first probe run crashed without the
  Usage env (env-trap class); re-ran per Usage, green.

## Convergence

Scale-onramp axis: NOT converged (standing directive). This arm is
DIAG — it does not move the wall; it arms the fight-level
intervention with the base-band targeting table and quantifies the
combat face of the wall (2 real wave-4 combat kills in 146
encounters; companions 8 dmg/fight vs scholar 143; 66% of wave-4
volume is overtime reruns at 2-3x canon pools). Verdict DIAG-NO-GO
on the pre-registered measured-band form; the refined instrument
(89.3% base-band coverage, zero unattributed) is the deliverable
the sibling arm builds on.
