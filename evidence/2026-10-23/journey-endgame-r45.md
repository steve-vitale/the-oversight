# Journey Endgame r45 — WAVE-SEEKING ON THE COURTSHIP ROAD (Lane B)

**Run id:** oversight-playtest-loop-2 / 2026-10-23 23:00 CDT occurrence (lane B).
**Worktree:** `journey2-endgame`. **Base:** master dfc9d4439 (pulled at run start; `git pull --ff-only` = already up to date).
Rotation-b read 4 at start (endgame); this run plays leg 4.

## PRE-REGISTRATION (MEASUREMENT.md §§9–12, 14 — written before the sweep ran)

**Leg question (r44 metric-review #5 + Blanks #1 carry):** r44 proved the FULL
seat is unreachable on the pure wave-seeking road — 0/5 full, 0/5 w5 contact,
4/5 villages dead before the window (mortality, not deeds, was the gate).
r43 proved the courtship road reaches the window (3/5 announced, w4=4–6) but
fills no wave-5s. The hypothesis: the full seat's wave bars are reachable
only via the COURTSHIP road (regional dawn → standing → unlocks →
tribute-fed survival), and a wave-seeking village that courts survives long
enough to actually FACE wave-5s. This run tests that: wave-seeking play ON
the courtship substrate (capable + deed-hunt layers).

**What would count as interesting:** ≥1/4 seeds face a wave-5 (the gate
opens once survival is secured — r44's diagnosis confirmed); a full seat
earned (the road to it exists); all four dying the r44 way anyway (the
deed-hunt overhead defeats courtship tribute — the road itself is the
problem, not the substrate); the voicing control firing on capable (r43's
canonical deployment restored after r44's misdeployment).

**Bindings (a miss is NO-GO, never re-scored mid-run):**
- M1 GUARD (r44 restatement): ≥3/4 seeds reach the window
  (announceDay != null) OR resolve via a voiced non-table path (reactor
  honesty beat / honest death-scatter / key-deferral) — counting coherent
  resolution, not just sits.
- M2 WAVE-5 CONTACT: ≥1/4 seeds faces ≥1 wave-5 (diag max.w5 ≥ 1) —
  the r44 wall (0/5) is the comparison.
- M3 FULL-SEAT REACH: ≥1/4 seeds earns the FULL seat (diag
  firstFullSeatDay != null). Strong hypothesis, falsifiable.
- M4 VOICING CANONICAL (carried, r44 metric-review #4): 87014
  (forcedrift, capable substrate — r41–r43 deployment): bandCrossings ≥ 1
  AND noticedCount ≥ 1.
- M5 PEOPLE: ≥2 beats sense-read in full, 0 senseless flags.
- REG (inherited, binding): r35 auditNamed on sat seeds with nonzero
  w4/w5; r37 satPenalty + maxTier present + voiced-line match on sat seeds.

**Substrate (PILOT, 4 seeds):** capable base (courtship via leadfeast,
real fleeing, abilities, feasts) + deed-seeking's deedPatrol (3x/week far
patrols) + surgeUpkeep + fullseat-diag outside everything. 87014 replaces
the deed-hunt with relaygrey FORCEDRIFT=1 (capable + the grey road, exactly
r43's canonical voicing-control deployment; CAPABLE_RELAYROAD='0' on that
seed only, waves seeds run capable's own natural relay road).
FULLSEAT=1, RELAYGREY=1 (per-seed), TELEMETRY_FULL=1. 180d, death-aware.
Seeds fresh 87011–87014. Baseline: r44's 0/5 contact, 0/5 full on pure
wave-seeking; r43's 3/5 window on pure courtship.

**Instrument:** scripts/probe-endgame-r45-20261023.js (r44 probe machinery
+ capable×deedhunt composition + r43's forcedrift control deployment),
scripts/analyze-endgame-r45-20261023.js (M1–M4 + binding-from-max reach
table + regs). Gates: DET (instrument-on twice byte-identical, 2x120d),
FID (diag+grey unset: wrapped == pure base, byte-identical), SMOKE (1x120d
pipeline end-to-end).

## RESULTS
(to be filled after the sweep)

## RESULTS (4/4 seeds, 180d, death-aware — sweep completed 2026-10-24 ~04:35Z)

Instrument gates: DET GREEN (byte-identical, 2x120d, seed 87011),
FID GREEN (FULLSEAT/RELAYGREY unset: wrapped == pure capable+deedhunt,
gameDays/won/alive/pantry byte-identical), SMOKE GREEN (pipeline end-to-end).

| seed | plan | announce | sat | end | alive | max reach |
|------|------|----------|-----|-----|-------|-----------|
| 87011 | waves | — | — | survived d180, reactor priced refusal voiced | 3 | w1=17 w2=9 w3=4 **w4=5** w5=0, standing 199, stage 3 |
| 87012 | waves | d90 | d92 lesser | won feared/light (final:mercy) | 9 | w1=19 w2=6 w3=6 w4=2 w5=0, standing 199 |
| 87013 | waves | d90 | d92 lesser | won beloved/light (final:audience) | 11 | w1=19 w2=10 w3=7 w4=1 w5=0, standing 199 |
| 87014 | forcedrift | d167 | d174 lesser | won relay/dark (final:voice) | 8 | w1=18 w2=8 w3=3 **w4=3 w5=1**, standing 347 |

Binding blockers (diag max reach): 87011 [w5:0/2, foodDeeds:sent+no-surge],
87012 [w4:2/3, w5:0/2], 87013 [w4:1/3, w5:0/2], 87014 [w3:3/4, w5:1/2].

- **M1 GUARD: GO 4/4** — 3 sits + 87011's voiced reactor refusal
  ("WE PRICED THE RUN. NO HUNGER ON THE RECORD — THE PELLET HUMS WHERE
  THE FIRE SHOULD BE"), counted per the restatement.
- **M2 WAVE-5 CONTACT: GO 1/4** — 87014 faced a wave-5 (the spoiler,
  killed d157 by the bearer — "On day 157, you put down Big Ugly").
  r44's wall (0/5) is broken: the gate OPENS in the endgame window.
- **M3 FULL-SEAT: NO-GO (binding)** — 0/4 earned the full seat.
- **M4 VOICING CANONICAL: GO 1/1** — 87014: bandCrossings=1, noticed=1.
  The control fires on the capable substrate, confirming r44's diagnosis
  (r44's misdeployment measured nothing; the voicing was never broken).
- **M5 PEOPLE: GO** — 3 beats sense-read in full (below), 0 senseless flags.
- **REG r35 / r37: GO** — 3/3 sat seeds: audit names w4/w5 aloud
  ("with 3 wave-4 and 1 wave-5 fought"); satPenalty present + matches the
  voiced "Every door's standing −M" line on all three.
- **PRIMARY: NO-GO** (M3 binding). **ALL: NO-GO.**

## THE STANDING-199 AUTOPSY (the run's central finding)

All three waves seeds stalled at standing 199 — the t5−1 hold bound. The
standing breakdown (re-run, deterministic, same trajectories):

- 87011: raw=277 (war 75 + diplomacy 102 + plenty 100), rd5 not ready
  (armor 2/4, weapons 3/6, **veterans 0/2**), unlockedWave=4
- 87012: raw=282 (war 100 + diplomacy 102 + plenty 80), rd5 not ready
  (**veterans 0/2**; armor 4/4, weapons 9/6, tricks 21 all met)
- 87013: raw=212 (war 50 + diplomacy 102 + plenty 60), rd5 not ready
  (**veterans 0/2**; armor 5/4, weapons 11/6, tricks 21 all met)
- 87014 (control): raw=347 (war 125 + diplomacy 102 + plenty 120),
  rd5 READY (armor 7, weapons 8, tricks 19, veterans 2), wave 5 opened

The hold is the **combat-readiness deferral** (design call #4, 2026-10-16),
not the plenty cap: capped ≥ 200 on all three, but readiness fails on the
**veterans bar** — 2 living roster members with a wave-4+ kill in
state.waveKillLog. The wave-kill log (correct field `w`, not `wave`):

- 87011/87012/87013: **0 wave-4+ kills** across 27/29/32 total kills —
  they faced 5/2/1 distinct wave-4s but killed none.
- 87014: 3 wave-4+ kills — eater (w4, d114, Naran via companion),
  influencer (w4, d107, bearer), spoiler (w5, d157, bearer).

The deed-hunt road produces FACINGS but not KILLS: it engages at fight
start (facing counts for the table's deed bars) then competent's mid-fight
eject bails when losing — against wave-4s (HP 850–1500, "a 4-6 round fight
for a godhood build") the village faces and flees, never landing the kill.
The hold is VOICED, not silent: the defer5 beats name the short bars aloud
("📡 The fifth draft stays in the wings — blood your fighters (0 of 2
veterans)"; 87011 heard 15 of them). The no-silent-gates rule holds.

**Design tension for Steve (documented, not filed):** the veterans bar
demands wave-4 KILLS — near-godhood combat — while TABLE.md law says the
table is "reachable by competent non-god play." The bar IS fillable
(87014 proves it: armor 7, weapons 8, tricks 19, vets 2) but only on the
combat-invested road; the wave-seeking road faces wave-4s 5/2/1 and kills
0/0/0. Per kill discipline this is a design conversation (is 2 living
wave-4 killers the right bar for competent play?), not a defect — the
mechanism works exactly as designed, and the 2026-10-18 recalibration
already moved these numbers once on measured evidence.

## VILLAGE ASSESSMENT (plain words)

**87011 — the refused.** Survived all 180 days with 3 alive (beekeeper,
bike messenger, mason), pantry 9.9k. It faced FIVE distinct wave-4s — the
most wave-4 deeds of any lane-B endgame seed — and the table priced the run
and withdrew: the bearer holds the fusion reactor pellet, "NO FEAST, NO
SURGE," so even the lesser seat's food-thesis deeds never completed. The
System named exactly what was missing and pointed at the mantle passing
to hungrier hands. An honest refusal, not a death.

**87012 — the feared.** Announced d90, sat d92 lesser, won feared/light
with 9 alive. Final live choice "Show mercy" — "the most frightening thing
you ever did... the terror pledged as a shield over every village,
forever." Mateo Alvarez ascended through the relay door the bearer built
(the architect beat, both true: "The galaxy will remember the god's name.
The village will remember who built the door.").

**87013 — the beloved.** Announced d90, sat d92 lesser, won beloved/light
with 11 alive, pantry 15.2k. The relay door was held at the sit
(lean 16, grey band, bond 2, 3 communes, 3 reroutes) — capable's natural
relay road works on the waves substrate.

**87014 — the dark merge.** Announced d167, sat d174 lesser, won
relay/dark with 8 alive. The bearer killed a wave-4 (influencer, d107)
and a wave-5 (spoiler, d157); Naran killed a wave-4 (eater, d114).
Standing 347. The dark road: the System's soft sell of the children as
nodes, "You say yes. The word is small," the pods opening "not like
morning. Like a barracks," Nergis and Cecilia witnessing with personal
stakes — then the final live choice "Become its voice" and the merge:
"Power immense. Self eroded. The System finally says your name right."

Who leads: the bearer on all four — no succession. Who is miserable: the
three who watched 87011's table refuse to come; Nergis and Cecilia, who
will remember the exact shape of the bearer's hand. What is missing: the
full seat, still — and on the waves road, the wave-4 kills that would open
the fifth draft.

**Mortality contrast with r44:** r44's pure wave-seeking road died 4/5
before the window. r45's wave-seeking + courtship road: 4/4 villages
survived (3/3/9/11/8 alive). Pairing the deed-hunt with the courtship
substrate fixed the mortality gate — r44's diagnosis ("survival, not
deeds, was the gate") is confirmed, and the NEXT gate is now precisely
named: the defer5 veterans bar.

## PEOPLE CHECK (SENSE-TESTING LAW — full reads)

1. **The reactor refusal (87011, full read).** The beat wants something
   (to price the run), engages (the ring of pale light flickers "and does
   not come"), resolves (names the missing food-thesis deeds, plants the
   mantle-passing hook). The surrounding life is people-shaped: gossip
   retellings that honestly drift ("Three retellings in, nobody remembers
   what actually happened — but everyone has opinions"), Ganesan sitting
   with feverish Miguel ("cool cloth, bitter tea, watching the
   breathing"), treeline gorges priced nightly (Loud-Eyes 800/1200,
   Anaconda Empress 1200, Eulogy 600), the Stonebridge raid, Greta's kid
   asking if the watchers have favorites. 0 senseless flags.
2. **The dark merge (87014, full 29-line seated window).** The audit reads
   the run back honestly ("3 wave-4 and 1 wave-5 fought, 14 contests
   survived, 3 crises weathered"); the war path names real kills on real
   days. The dark choice is specific and consequential (the pods, the
   uniforms, Nergis/Cecilia witnessing); the final choice resolves (the
   merge, "glorious" and eroding) and owes (the village grieves "the way
   weather feels rain"; the coda judges the bearer by their own verbs:
   "You had found a way to make listening feel like ownership").
   0 senseless flags.
3. **The feared win (87012, final beat).** "Show mercy" → the terror
   pledged as a shield; the architect beat credits both the god and the
   door-builder; the Oversight coda lands ("The oversight is the looking
   away... You did it on purpose, because you were busy"). 0 senseless.

## BLANKS

1. **DOCUMENTED (design, for Steve): the defer5 veterans bar is the
   full seat's binding constraint on the wave-seeking road.** See the
   autopsy above. Not a code defect — the mechanism (hold at 199, named
   bars, voiced beats, one-way release) works as designed. The question
   is tuning: is 2 living wave-4 killers reachable by competent non-god
   play? Evidence: 0/3 waves seeds produced a single wave-4 kill despite
   5/2/1 facings; the combat-invested control seed produced 3 kills and
   opened the door.
2. **DOCUMENTED (instrument): the wave-kill log's wave field is `w`,
   not `wave`.** The first autopsy pass filtered on `e.wave` and reported
   0 wave-4+ kills on 87014 — wrong; the field is `w` (entries: {d, mid,
   w, by, via, trick}). Corrected before any conclusion was drawn.
3. **No game-code blanks found this run:** no senseless dialogue in 3
   full beat reads, no dead ends, no unfireable beats observed. The one
   code-adjacent change is additive only (deed-seeking.js exports).

## Reachable / Fun / Winnable (endgame leg, r45)

- **REACHABLE:** the wave-5 gate OPENS in the endgame window (1/4 contact,
  vs r44's 0/5) — reachable, just gated behind wave-4 kills. The full
  seat: 0/4 — NO-GO as pre-registered. The lesser seat: 3/3 on announced
  waves seeds, all won.
- **FUN:** the beats are the game's best writing under pressure — the
  dark merge, the reactor refusal, the feared mercy. The defer5 hold
  beats name the short bars aloud; the player is told exactly what the
  fifth draft wants.
- **WINNABLE:** 3/4 won (all lesser); the fourth got an honest voiced
  refusal. Cumulative endgame (r40–r45): the table is winnable on the
  courtship road; the full seat's wave-5 prerequisite is now precisely
  the veterans bar.

## Metric review (§14)

1. **M1's restatement held again** — 87011's reactor refusal counted as
   coherent resolution (4/4). Keep the restated form.
2. **M2's GO is the finding** — 1/4 contact breaks r44's 0/5 wall. The
   gate opens; the bar was honest.
3. **M3's 0/4 is the finding, not a metric failure** — the binding-blocker
   datum (defer5 veterans 0/2 on all three waves seeds, closest approach
   87011's w4=5 facings) says exactly where the road ends. No revision
   proposed.
4. **M4's substrate rule is now proven** — the control fired on capable
   (1/1 crossings + notices) after r44's deed-seeking deployment measured
   nothing. The probe header carries the substrate requirement.
5. **The capable+deedhunt composition is validated** — DET/FID/SMOKE all
   green; the composition runs the courtship road (bonds, feasts,
   tribute) AND the deed-hunt (patrols, surge) without interference.
   4/4 villages survived vs r44's 1/5.
6. **Telemetry deviation check:** run below.

## Regressions / checks

- DET (instrument-on twice, 2x120d, seed 87011): GREEN byte-identical.
- FID (FULLSEAT/RELAYGREY unset: wrapped == pure capable+deedhunt):
  GREEN byte-identical (mini: gameDays/won/alive/pantry).
- SMOKE (87011, 120d): GREEN — pipeline end-to-end.
- Proof tests: the deed-seeking.js export is additive (keys verified:
  deedSeeking, deedPatrol, surgeUpkeep); no behavior change to the
  existing policy. Instrument gates above are the proof.
- Existing suites: check.js --quick (below).
- No src/js behavior changes. Tooling: probe-endgame-r45-20261023.js,
  analyze-endgame-r45-20261023.js (both committed under scripts/).

## Evidence

- evidence/2026-10-23/journey-endgame-r45.md (this note)
- evidence/2026-10-23/perseed-endgame-r45/endgame-r45-{87011..87014}.json
- evidence/2026-10-23/perseed-endgame-r45/endgame-r45-{87011..87014}-transcript.txt
- scripts/probe-endgame-r45-20261023.js
- scripts/analyze-endgame-r45-20261023.js

**Game-code changes this run:** scripts/policies/deed-seeking.js —
additive export of deedPatrol + surgeUpkeep (no behavior change).
**Tooling:** r45 probe/analyzer (new).

## Telemetry deviation check (2026-10-24 ~04:45Z)

- LOUD: maxTier swung -94% (baseline 16 -> current 1). LOUD:
  satPenalty.penalty swung -96% (baseline 91 -> current 4).
- VERDICT: EXPLAINED, not a behavior change. The overtime clock accrues
  per week waited after the announce; this sample sat quickly (87012/87013:
  2 days, tier 0; 87014: 1 week, tier 1/penalty 4) while the baseline was
  seeded on long-deferral sits (r37's 81001 rode 38 days/6 tiers). The
  mechanism is verified live: 87014's record {tier 1, losses 0, penalty 4}
  matches its voiced line "1 week kept waiting. Every door's standing −4"
  exactly (REG-r37 GO 3/3). Baseline NOT rolled — different population
  (quick-sit vs long-deferral); the baseline still describes sitting runs
  that wait out the clock.
