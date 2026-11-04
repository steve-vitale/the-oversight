# Kill-conversion / killer-survival decomposition — Loop A, run fleshout-20261104T0215Z, arm sim-killconv-a

Axis: scale-onramp (standing directive: the scale wall). DIAG-ONLY
arm: zero src/js, zero policy-file changes, zero gate/price/deed/
standing changes. This arm answers tracker blank 2: why a village
banks at most one wave-4 kill, and why every killer dies within
days — fight lethality vs post-kill exposure, kept split. It
proposes and makes NO fix — the fix arm is named precisely at the
end, with its numbers.

## Pre-registration (committed before any judged leg)

`evidence/2026-11-04/sim-killconv-a-prereg.md` (commit 712d6af43)
+ addendum (commit 8c1004502). Policy `scripts/policies/competent.js`
`{competent}` VERBATIM at this anchor, default env. Horizon 140
days, death-aware. Balanced panel (§15): INAPPLICABLE — a pure
diagnostic with no variant; no comparison is fabricated. The
instrument is the census; the pre-registered threshold is the
judge. Proof `scripts/test-killconv-20261104.js` 2/2 before the
pilot leg and re-run green after the analyzer fixes.

DIAG-GO bar (all must hold on the 8-seed pilot 99101–99108):
(a) every TB exposure classified with 0 unclassified;
(b) every killer traced to end of run with a named death cause or
alive status; (c) one named conversion lever with numbers;
(d) sense-test: at least 3 fight transcripts read and judged.
If pilot GO, confirm on +8 seeds (99109–99116).

## Calibration gate — DIVERGED, re-baselined (before the judged leg)

The unmodified tbfinish driver rerun on seed 99107 at this anchor
gives 71 days / village-lost / 0 wave-4 spawns / 0 TB / 0 kills /
maxWave 3, against 2315Z's 38 days with the same wave-4 shape
(0/0/0). A full band move in survival length with the wave-4
shape unchanged. Per the prereg, the judged baseline for this arm
is its own pilot leg below — tbfinish/ready5 numbers are NOT
cited as this arm's baseline; any comparison to them is
descriptive, anchor-move-aware, never a before/after claim.

## Judged legs (this anchor only)

Instrument commits: c65a01624 (round-1 capture, field
decomposition, killer tracing), 9865f33b (leader-death
classification, opening actor stamps, post-call field kill
attribution), 10b68d05 (analyzer display fix). The pilot was run
TWICE with the same seeds: run 1 (RUN=killconv) exposed two
instrument bugs (companion-fled misclassified as 'fled';
post-call field kills unlinked); run 2 (RUN=killconv2, fixed
instrument) reproduced run 1's seed totals EXACTLY on all 8 seeds
(deterministic re-run, RNG-neutral fixes proven) and is the
judged pilot. Confirm (RUN=killconv) on 99109–99116.

### Per-seed (pilot run 2 / confirm)

| seed | days | end | maxWave | spawnsW4 | TB | fieldW4 | kills |
|------|------|-----|---------|----------|----|---------|-------|
| 99101 | 140 | survived | 4 | 7 | 1 | 0 | 1 |
| 99102 | 127 | lost | 4 | 10 | 3 | 5 | 1 |
| 99103 | 118 | lost | 4 | 11 | 6 | 7 | 1 |
| 99104 | 139 | lost | 4 | 4 | 6 | 3 | 0 |
| 99105 | 84 | lost | 4 | 9 | 9 | 3 | 2 |
| 99106 | 96 | lost | 4 | 2 | 1 | 2 | 0 |
| 99107 | 71 | lost | 3 | 0 | 0 | 0 | 0 |
| 99108 | 68 | lost | 3 | 0 | 0 | 0 | 0 |
| 99109 | 99 | lost | 4 | 6 | 3 | 3 | 0 |
| 99110 | 140 | survived | 4 | 16 | 5 | 4 | 2 |
| 99111 | 71 | lost | 4 | 1 | 0 | 0 | 0 |
| 99112 | 98 | lost | 4 | 3 | 2 | 1 | 0 |
| 99113 | 72 | lost | 4 | 4 | 0 | 2 | 0 |
| 99114 | 70 | lost | 4 | 3 | 1 | 0 | 0 |
| 99115 | 89 | lost | 4 | 15 | 7 | 7 | 0 |
| 99116 | 94 | lost | 4 | 6 | 4 | 5 | 0 |

Pooled 16 seeds: median survival 95 days, max 140 (censored,
2 survivors). Wins 0/16, national 0/16, table 0/16 — the scale
wall stands: 14/16 villages face wave 4, none banks 2 living
veterans for more than a day (see Q4).

### TB census (pilot / confirm / pooled)

| | exposures | kill | fighter-died | fled | unended | unclassified | orphans | instr errors |
|--|--|--|--|--|--|--|--|--|
| pilot | 26 | 4 | 22 | 0 | 0 | 0 | 0 | 0 |
| confirm | 22 | 2 | 20 | 0 | 0 | 0 | 1 scripted-rout | 0 |
| pooled | 48 | 6 | 42 | 0 | 0 | 0 | 1 scripted-rout | 0 |

Kill rate per TB exposure: pilot 0.154, confirm 0.091, pooled
0.125. Field fights pooled: 42 (vDie 16, vFlee 21, vKill 1,
evade 2, mFlee 2) — field kill rate 0.024. A wave-4 meeting in
the field ends in flight half the time and death more than a
third; it almost never ends in a kill.

## Q1. Damage accounting per TB fight

- Damage per leader strike (pooled, n=171 hits): median 44,
  mean 47.8, zero zero-damage hits. Pilot median 45, confirm
  median 29 (weapon mix differs by seed; pooled 44 is the
  working figure). Requested median 35 vs dealt median 44:
  dealt EXCEEDS requested — buffs (OVERCHARGED ×1.25, training
  ×1.15, controlled +25%, all transcript-verified) outweigh
  beast armor (def 8–14). Armor is NOT the binding reducer.
- Ability damage in wave-4 TB fights: ZERO across all 48
  exposures (0 ability-or-trick hits on monsters). Ability
  presses exist (Rage, repeatedly) but Rage deals no damage by
  design and no damaging ability is ever pressed here.
- Weapon tiers in kills: Phase blade, Machete, Hardlight knife,
  Trailblazer Machete, Harvest Scythe, Sling (field), and one
  companion kill where the scholar fought unarmed (lead 47,
  ally 419). Unarmed fighters deal ~6/strike (99102 d112: 2
  strikes, 12 damage, no weapon).
- Why dealt fraction is only ~0.10 in lost fights (pooled
  median fracMax 0.106, fracStart 0.117): TOO FEW STRIKES, not
  too little damage per strike and not fights ending too
  early alone. Lost fights land a median 2 strikes (spread
  0,0,0,1,1,1,2×7,3×3,4×5,11) in a median 5 rounds — 0.40
  strikes/round. 2 strikes × 44 = 88 damage against a median
  900-HP beast. Even striking every round for all 5 rounds
  gives 220 (0.24). The gap decomposes exactly: strikes/round
  0.40 → 1.0 is 2.5x (the tbfinish waste: flee/rage/move
  turns), rounds 5 → 20.5 is 4.1x (staying), 2.5 × 4.1 =
  10.2x = the gap to a kill. Damage per strike would need
  450 (10x) to close it alone — not a lever. Ally damage
  helps where parties exist (median 64 in the 4 pilot lost
  fights with ally damage) but only 4/22 pilot lost fights
  had any ally damage at all.

## Q2. Why fights end in fighter death

- Fighters die TO THE BEAST, nothing else: all 42 pooled lost
  fights end with the leader dead (HP ≤ 0). No mid-fight
  starvation/disease death appears in TB.
- Beast damage (finishers split out): normal monster-turn
  damage median 29/round (pilot 32, confirm 26), mean 31.1,
  over 139 damaging rounds. Fighter HP is 100, so ~3–4
  damaging rounds kill — fights stretch to a median 5 rounds
  because monsters telegraph/hold (tbfinish's 48% damaging
  turns), not because fighters hold ground.
- Eulogy finishers: 8/48 fights end by the round-6 narrated
  finisher (3780–6269 damage after armor) — the same clock
  as 2315Z, still only deciding fights whose fighter survives
  to round 6. The other 34 lost fights end to normal damage
  first. Median damage taken in lost fights 118.5 (finishers
  included).
- Entering HP decides some fights before they start: 99104
  d131 enters at 24 HP, dies round 2 with 0 strikes. Same-day
  double fights with no recovery kill: 99105 d70 influencer
  enters at 40.65 HP (the HP left after that day's congregation
  kill) and dies. One curiosity from numbers only (transcript
  not read): 99110 d108 influencer killer enters at 35 HP,
  takes 0 damage, ends at 59 HP — healing happens mid-fight
  (mechanism not verified here).

## Q3. The kills: what was different

| killer | seed | day | beast | via | channel | party | rounds | strikes | lead | ally | beast start/max | weapon |
|--------|------|-----|-------|-----|---------|-------|--------|---------|------|------|-----------------|--------|
| gen_o1uj9aa | 99101 | 134 | eulogy | player | TB | 3 | 6 | 4 | 407 | 84 | 440/900 | Phase blade |
| visjoin_98 | 99102 | 107 | influencer | wild | field | 1 | 2 | — | — | — | 20/~850-1050 | Sling |
| app_mgpspie3545 | 99103 | 74 | eulogy | companion | TB | 2 | 2 | 1 | 46 | 25 | 65/900 | Machete |
| gen_5yg74m1 | 99105 | 70 | congregation | player | TB | 1 | 15 | 13 | 928 | 0 | 920/920 | Hardlight knife |
| nino_kapanadze | 99105 | 72 | congregation | player | TB | 1 | 20 | 18 | 694 | 0 | 668/900 | Trailblazer Machete |
| lena_ruiz | 99110 | 108 | congregation | companion | TB | 4 | 16 | 15* | 47 | 419 | 450/900 | (leader unarmed) |
| nadia_khoury | 99110 | 108 | influencer | player | TB | 5 | 7 | 5 | 368 | 305 | 637/850 | Harvest Scythe |

\* 99110 congregation strikes/damage are party totals; the
killing blow was the companion's (ally 419 vs lead 47).

Three things distinguish kills, in order:
1. PRE-WOUNDED BEASTS: 6 of 7 kills are against beasts that
   entered below max HP (440, 20, 65, 668, 450, 637) — the
   wound-mill is already the conversion path. Only ONE kill
   in 16 villages is a fresh full-HP solo kill (99105 d70
   congregation, 920/920, 13 strikes, 15 rounds, fighter
   surviving at 40.65 HP).
2. LONG FIGHTS: the two solo kills took 15 and 20 rounds —
   3–4x the median lost fight's 5 rounds. Kills are what
   happens when a fighter survives long enough to land
   13–18 strikes (or a party lands them: 99110's two kills
   had ally damage 419 and 305).
3. PARTY DAMAGE: 4 of 7 kills had substantial ally damage
   (84, 25, 419, 305). Solo fighters kill only pre-wounded
   beasts or not at all in this band — except the one
   15-round congregation kill.

Field vs TB split: 6 TB kills, 1 field kill. Field fighting
is the worse conversion channel (1/42) despite being the
more common meeting type for villagers — field fighters flee
(21/42) or die (16/42) against full-HP beasts.

## Q4. Killer survival: every killer traced

| killer | kill day | death day | cause | survived | same fight? |
|--------|----------|-----------|-------|----------|-------------|
| gen_o1uj9aa (99101) | 134 | 135 | the wild | 1d | no |
| visjoin_98 (99102) | 107 | 122 | contest | 15d | no |
| app_mgpspie3545 (99103) | 74 | 81 | the wild | 7d | no |
| gen_5yg74m1 (99105) | 70 | 70 | the wild | 0d | no (same day, after the fight) |
| nino_kapanadze (99105) | 72 | 72 | the arena | 0d | no (same day, after the fight) |
| lena_ruiz (99110) | 108 | 117 | the wild | 9d | no |
| nadia_khoury (99110) | 108 | 109 | the wild | 1d | no (died in the NEXT TB fight, d109 eulogy) |

0/7 killers alive at end (ready5's 0/4 pattern holds, now
0/7 pooled). Median post-kill survival 1 day. NO killer dies
in the kill fight itself — every death is post-kill exposure
(the wild 5, contest 1, arena 1). Two die the same day as
their kill.

Reconciliation — BOTH blockers are real, in this order:
(a) KILL RARITY is primary: 7 kills across 16 villages, max
2 per village. A village needs 2 living veterans at once;
only 99105 and 99110 ever record 2 kills, and 99105's two
killers never overlap (gen dies d70, nino kills d72).
(b) KILLER ATTRITION is secondary but decisive at the
margin: 99110 DOES hold 2 living veterans simultaneously —
lena (d108 kill, dies d117) and nadia (d108 kill, dies
d109) overlap d108–d109, exactly one day — then nadia dies
in the next fight and the window closes. Whether the door
opened on a standing-sufficient day in that window was NOT
instrumented in this arm (no standing tracking) and is
NOT claimed either way — it is the precise follow-up
question (see findings).
Narrative note: 99105's nino is the companion who fled
the d71 congregation fight (leader luis died); after the
mantle transfer she becomes scholar, kills d72, and dies
the same day in the arena. Fleeing a fight does not end a
villager's story — sometimes it starts the next chapter.

## Q5. The SINGLE biggest conversion lever — STAYING

A fresh wave-4 beast has a median 900 HP. At the median 44
damage per leader strike, killing it takes 20.5 strikes.
A lost fight lands 2 strikes in 5 rounds. The gap is 10.2x,
and it factors as:

- strike density 0.40 → 1.0 strikes/round (2.5x) — recover
  the flee/rage/move waste tbfinish measured; AND
- rounds survived 5 → 20.5 (4.1x) — the fighter must live
  four times longer in the fight.

Neither factor alone closes the gap; together they are the
whole gap. No other single lever is in range: damage per
strike would need 450 (10x); beast HP would need 90 (a 10x
cut — a canon/stat call, not a fix arm); ally damage at
current party rates adds ~64 per fight (0.07 of a beast).
The next fix arm is therefore LONGER STAYING (tbfinish's
flee-repair arm, now confirmed from the damage side: repair
the flee so wasted turns become strikes, plus in-fight
recovery so the fighter survives to spend them) — NOT more
damage, NOT lower beast HP, NOT a gate/price/deed change.
Second lever, smaller: the wound-mill (6/7 kills already
run on pre-wounded beasts) — more beasts arriving wounded,
or fighters finishing crippled beasts they meet (Steve's
2026-10-27 wound-mill ruling), multiplies conversion
without touching any stat.

## Sense-testing (6 transcripts read and judged)

READ: 99105 d70 congregation kill; 99101 d134 eulogy kill;
99103 d74 eulogy kill (companion Taiga); 99105 d83 reunion
death (Rage loop); 99104 d131 eulogy death (entered at 24
HP); 99102 d107 field kill log.
- Kills read as people winning fights: "The Congregation
  falls", style score, "You came back bloody. Nobody asks.
  Someone saves you the good seat by the fire." Companions
  react ("Remind me not to cross you." / Taiga laughs,
  disbelieving. "Did you SEE that?"). Coherent, not a
  counter incrementing.
- Deaths read as fights lost: "You go down." / "OH. Oh no.
  ...The gamblers are very quiet." / mantle transfer with
  grief ("The village stops. Somebody screams. Somebody
  else starts digging." / keepsakes buried, never taken).
  The death is narrated, not silent.
- FLAGS (all flavor/logic, none blocking the verdict):
  1. Veteran-kill celebration for a mop-up: the System
     announces Taiga's 65-HP mop-up as "That's a veteran
     kill, folks" — narration does not distinguish fresh
     kills from finishing wounded beasts (see findings).
  2. Hold-beat veteran timing: in the 99101 kill's own
     end-of-fight block, the deferral beat says "blood
     your fighters (0 of 2 veterans)" immediately after
     the kill — the beat may read pre-kill state (see
     findings; needs a check, not claimed as a bug).
  3. Rage loop persists, unchanged since 2315Z: 99109 d94
     (4 Rage presses, 0 strikes) and 99116 d92 (4 Rage
     presses, 0 strikes) — a person would not press Rage
     four times while dealing nothing.
  4. Field kill log is honest: "Przemysław has Sling but no
     arrows — the string stays drawn, useless." then melee
     strikes for 9 and 12 finish an 11-HP beast. The log
     says plainly what the weapon cannot do.

## Metric review (§14 — no in-run re-scoring)

- No metric was re-scored. GO legs were judged exactly as
  pre-registered on the pilot; confirm checked census
  stability on the same legs.
- Classification correction (documented, not a re-score):
  run 1 classified 2 exposures 'fled' that were in fact
  leader-dead + companion-fled (99103 d71, 99105 d71).
  The rule is now leader-death-first with companion-fled
  as a note. The fix changed 2 pilot classifications and
  no kill counts; run 2 reproduced all other numbers
  exactly.
- Orphan rule widened with proof: run 1's 'untouched
  monster' test misclassified the 99116 d77 orphan (audit
  fled at 783/1100 — a prior wound, not a fresh beast).
  A dedicated debug run
  (`scripts/killconv-orphan-debug-20261104.js`, seed
  99116) proves the shape: startCombat with before==after
  null, tbEnd('routed') round 1 inside the call, zero
  player strikes/moves inside ANY startCombat across the
  run, and the 783 HP exactly matching the d74 field
  fight's mHpLeft. The orphan is a zero-turn scripted
  rout of a previously wounded beast — a non-exposure,
  not an unclassified exposure. The analyzer now classes
  routed+fled orphans as scripted-rout; anything else
  stays unclassified.
- Round-1 residual gap (named, bounded): player round-1
  actions are STILL uncaptured (0/48 openingActions). The
  debug run explains why structurally: tbBeginTurn for
  round 1 fires INSIDE startCombat, before the exposure
  exists (21 in-start tbBeginTurn calls on 99116), and the
  player's round-1 action lands with no open turn record.
  But round-1 DAMAGE is now captured (openingHits): 2
  hits across 48 exposures, both ally strikes (Samorn 10,
  Nadia, actors stamped) — negligible, and it confirms
  tbfinish's "round 1 is not a player strike" from the
  other side. The full pending-turn spec (open the round-1
  turn during startCombat into a pending buffer, attach it
  after the call, attribute actions until the next
  tbBeginTurn) is specified here for the next instrument,
  not built here.
- /tmp wipe: the confirm-analysis scratch copy in /tmp was
  wiped mid-run by the known sibling-cleanup class (the
  orphan debug log survived). No data was lost — all
  per-seed JSONs live in evidence/ and were re-analyzed
  from there with a committed SEEDS filter. Do not stage
  analysis intermediates in /tmp.
- Heartbeat queue: registry-lock heartbeats block behind
  other runs' looping heartbeats (flock, no timeout) —
  one heartbeat waited 4+ minutes, another was killed
  while queued. Heartbeats landed eventually every time;
  the queue is shared-infra congestion, not a run failure.

## Verdict — DIAG-GO, confirmed

Pilot: (a) 26/26 TB exposures classified, 0 unclassified,
0 unended, 0 orphans, 0 instrument errors; (b) 5/5 killers
traced with named death causes; (c) STAYING named with
numbers; (d) 6 transcripts read and judged. Confirm on
99109–99116 reproduces the shape: 22/22 classified, 0
unclassified, 1 proven scripted-rout orphan, 2/2 killers
traced, same lever math (2 strikes in 5–6 rounds vs ~20
needed). The GO covers the diagnostic on the current
anchor only. It does NOT test release-after-ready (the
99110 one-day two-veteran overlap is reported as an
overlap, not as a release result).

## Findings for the coordinator (append to sim-findings.md — NOT edited here)

- [open] 2026-11-04 — hold-beat veteran timing — deferral beat reports "0 of 2 veterans" in the same end-of-fight block as a TB kill (99101 d134); check whether the beat reads pre-kill state. (sim-killconv-a evidence)
- [open] 2026-11-04 — veteran-kill narration vs mop-up — System celebrates a 65-HP mop-up as a veteran kill (99103 d74); narration does not distinguish fresh kills from finishing wounded beasts. (sim-killconv-a evidence)
- [open] 2026-11-04 — two-veteran overlap without known release outcome — 99110 held 2 living veterans d108–d109; standing/release not instrumented in this arm; a follow-up arm should check whether the door opened on a standing-sufficient day. (sim-killconv-a evidence)
- [open] 2026-11-04 — Rage loop persists — 4x Rage presses with 0 strikes in single fights on confirm seeds (99109 d94, 99116 d92); same loop as 2315Z, unrepaired. (sim-killconv-a evidence)
- [open] 2026-11-04 — field-fight kill recording path — field kills are recorded by the comms wrapper AFTER fieldFight returns (fieldCall null); instruments must use lastField stamps or same-day attribution. (sim-killconv-a evidence)
- [open] 2026-11-04 — round-1 player turn structurally uncaptured — tbBeginTurn for round 1 fires inside startCombat before the exposure exists; pending-turn spec noted for the next instrument. (sim-killconv-a evidence)

## Proof and landing

- `scripts/test-killconv-20261104.js`: 2/2 (stub: opening
  capture + def stamp + field decomposition + kill/death
  stamping + post-call lastField stamps; live-harness smoke
  40d seed 99101, zero instrument errors) — before the
  pilot leg and re-run green after the analyzer fixes.
- Arm commits on branch sim-killconv-a: prereg 712d6af43,
  prereg addendum 8c1004502, instruments c65a01624,
  instrument fix 9865f33b, analyzer display fix 10b68d05.
  This evidence file + the 24 per-seed JSONs
  (`perseed-killconv-a/`: pilot run 1, pilot run 2, confirm)
  + the orphan debug script + the analyzer seed-filter
  commit on the same branch, pending coordinator merge
  --ff-only, pending ship (the ship loop owns version
  bumps, pushes, live verification).
- check.js --quick NOT re-run in full: zero src/js changed,
  same standing caveat as prior tooling-only landings; the
  arm's own proof (2/2) was run before the judged legs and
  after the analyzer fixes.
- Telemetry deviation check: not run by this arm (the
  coordinator runs it after evidence; the judged leg
  diverges from 2315Z by the documented anchor move, so a
  deviation on this band is expected, not an instrument
  artifact — the calibration control is the evidence).
- Worktree note (for the coordinator): safe-commit index
  clobber hit 4 of 5 worker commits (staged-as-deleted /
  stat-dirt variants); repaired with HEAD-blob cacheinfo
  each time and verified (`git status` clean apart from
  new per-seed JSONs, worktree bytes hash-identical to
  HEAD) before proceeding. All commits verified intact.
- /tmp caution: do not stage analysis intermediates in
  /tmp (sibling cleanup wiped the confirm scratch copy
  mid-run); the evidence JSONs were never at risk.
