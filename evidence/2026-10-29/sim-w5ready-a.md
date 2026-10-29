# sim-w5ready-a — wave-5 readiness audit (axis scale-onramp)

Run: fleshout-20261029T1715Z follow-up (coordinator run). Arm:
sim-w5ready-a — DIAG ONLY, following the landed full-seat arm
(evidence/2026-10-29/sim-fullseat-a.md, NO-GO).
Worktree: `~/workspace/worktrees/sim-w5ready-a` (branch sim-w5ready-a).
Base commit: ef9219748 (master at worktree cut; no move during the run).
Prereg: evidence/2026-10-29/sim-w5ready-a-prereg.md (commit
a30c3da6, BEFORE the judged analyzer leg).
Corpus (fixed, NOT re-run): evidence/2026-10-29/perseed-fullseat-a/
(16 rows: seeds 76001–76008 × OFF substrate / ON fullseat-pursuit).
Instrument: scripts/test-w5ready-a.js + output
evidence/2026-10-29/w5ready-a-analysis.json (recomputes every
distance from the rows; it never copies the worker's summary).
ZERO src/js changes. ZERO default flips. ZERO deed-bar moves.

## Canon read first

- docs/CANON.md, docs/MONSTER-WAVES.md (Wave 5: standing ≥ 200 AND
  wave-4 faced; readiness-gate section), docs/TABLE.md,
  docs/PROGRESSION.md.
- The brief's name `waveUnlockReady(5)` EXISTS in code:
  src/js/standing.js `waveUnlockReady(w)` delegates to
  `waveCombatReadiness(w)` for w = 4, 5. The analyzer proves the
  citation at run time by reading the demand line out of
  standing.js itself.
- Two veteran concepts, kept SEPARATE throughout (checked in
  draft — no conflation):
  - MONSTER veterans: hardened older-wave monsters (game.js
    castMonster/spawn path: veteran flag, +50% HP, +3 damage,
    +1 speed, scarred/elder/pack-leader variants). A hardened
    monster's kill logs its BASE wave in state.waveKillLog
    (`w: wave` in the log entry) — so killing a hardened wave-3
    monster counts as a wave-3 kill, never toward the wave-5
    villagers bar, and never as a later wave.
  - LIVING-VILLAGER veterans bar: distinct LIVING roster members
    with a waveKillLog kill at wave ≥ w−1 (standing.js
    waveCombatReadiness: `e.w >= w-1`, `isLiving(e.by)`; dead
    killers do NOT count under default behavior). The scholar
    counts as living (isLiving returns true for the scholar id),
    so demand 2 can be scholar + 1 villager, or 2 villagers —
    but the corpus records no killer identities, so whether a
    row held 0 or 1 living killers is UNMEASURED (deficit
    interval [1,2] stands, exact count does not).
  - VETSHAPE=1 (an instrument counting living-OR-DEAD killers)
    is OFF by default and is NOT the game; flipping its default
    would be a game change needing a Steve call.

## VERDICT: DIAG-GO (component-level; exact readiness counts unmeasured)

Judged exactly against the prereg — no re-scoring:

| leg | bar | result |
|---|---|---|
| 1. Components enumerated with citations | U1–U4, R1–R4, standing sub-sources, deed w5 as downstream | PASS — see component table; demand line read from standing.js by the analyzer |
| 2. 16/16 rows classified with distance | end-state unlock blockers + max-reach, per prereg distance definitions | PASS — 0 unclassified; analyzer structural checks pass (rd5ready false 16/16, unlockedWave < 5 16/16, deed w5 dist 2 end+max 16/16) |
| 3. Movable/fixed/Steve-call label per component | with mechanism reasoning + on-band sub-judgment | PASS — see movable verdict |
| 4. Standing-dynamics note | 76003 membership, 16/16 end-vs-peak deltas, pin-vs-shortfall | PASS — 76003 IS in the corpus (both arms); see dynamics note |
| 5. Sense read with method limit | ≥ 1 ON row tail judged | PASS — 76005 ON days 166–167; see sense read |

Declared corpus gap (in the prereg, confirmed by the audit):
exact readiness COUNTS (armored/armed/tricks/veterans numbers)
are NOT recorded in the corpus — rd5short carries names only.
Distances below are therefore exact for standing points,
booleans for faced/rung, and short-names + bounded deficit
intervals for readiness bars. No count is invented anywhere
in this file. The next instrument must record the four counts
per snapshot; until then, bar-level ranking is the judged
ranking.

## Component table — the full wave-5 unlock chain

### waveUnlockReady(5) — the four readiness bars (standing.js)

Demands from standingCfg().readyDemand[5] (sim starting points,
not canon — Steve can overrule; analyzer-verified):

| bar | demand | how it is read | blocks (end, /16) |
|---|---|---|---|
| armor | armored ≥ 4 at armorP ≥ 15 | living roster fighters with armor WORN at P ≥ 15 (S.equipment.armorOf; scholar via armorBonus()) | 11 |
| weapons | armed ≥ 6 | living roster fighters with a weapon TO HAND (equipped melee/ranged, or a weapon item carried) | 9 |
| tricks | counters known ≥ 3 | distinct monster ids in state.monsterCounters passing monsterCounterKnown() | 0 |
| veterans | living wave-4+ killers ≥ 2 | distinct living killers with waveKillLog entries e.w ≥ 4 | 16 |

### The rest of the chain (game.js unlockedWave + standing.js)

| component | threshold | blocks (end, /16) |
|---|---|---|
| U1 w3 rung | day ≥ 25 AND wave-2 ledger points ≥ 5 | 1 (76006-off, died day 40) |
| U2 gated standing | villageStandingTotal() ≥ 200 | 16 — split: 13 below-bar points shortfall, 3 defer5 hold (see below) |
| U3 wave-4 faced | waveEngaged(4) > 0 (distinct wave-4 monsters faced blow-by-blow) | 7 |
| U4 readiness | waveUnlockReady(5).ready (all four bars) | 16 (rd5ready false everywhere) |

Standing sub-sources (standing.js villageStanding): war =
wave-3+ ledger points × 25; diplomacy = seasoned regional+
links × 34 (seasoned = 30+ days, trust 40+, hierarchy.js
_linkSeasoned; regional+ via _linkRegionalPlus); plenty =
major feasts (quality ≥ 1) × 20, capped at 100 toward t5.
Gated-total layers: plenty cap (raw ≥ 200, capped < 200 →
held at 199), defer4 (raw ≥ 100, rd4 unready, peak < 4 →
held at 99), defer5 (capped ≥ 200, rd5 unready, peak < 5 →
held at 199), peak ratchet floor (peak ≥ 4 → gated never
below 100; peak ≥ 5 → never below 200).

DOWNSTREAM, not an unlock blocker: the deed w5 bar
(progression.js deedGateReady(): distinct wave-5 monsters
fought ≥ 2). Distance is 2 on all 16 rows (end and max) —
a consequence of the lock, since wave 5 never unlocked and
no wave-5 monster existed to fight. The brief's "blocked at
distance 2" is THIS deed distance; the unlock distance is
the multi-component table above and must never be quoted
as a single number.

## Per-row distance table (recomputed from corpus rows)

Columns: gated standing at end (distT5 = 200 − gated),
holdKind, end raw split (war/dipl/plenty/capped),
readiness short bars (bounded deficit in brackets),
w4faced, w3rung, peak gated standing (peak gap), end−peak
delta, deed w5 dist (end/max). Demand reminders:
armor deficit ∈ [1,4], weapons ∈ [1,6], tricks ∈ [1,3],
veterans ∈ [1,2] when short; 0 when not short.

| row | days/end | uw | gated (distT5) | hold | raw war/dipl/plenty/capped | rd5short | faced | rung | peak (gap) | Δ | deedW5 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 76001-off | 129 lost | 4 | 127 (73) | below-bar | 127 25/102/0/127 | armor[1,4], veterans[1,2] | no | yes | 127 (73) | 0 | 2/2 |
| 76001-on | 107 lost | 4 | 199 (1) | defer5 | 207 25/102/80/207 | armor, weapons[1,6], veterans | yes | yes | 199 (1) | 0 | 2/2 |
| 76002-off | 118 lost | 4 | 100 (100) | below-bar | 90 50/0/40/90 | armor, weapons, veterans | yes | yes | 147 (53) | −47 | 2/2 |
| 76002-on | 155 lost | 4 | 100 (100) | below-bar | 70 50/0/20/70 | armor, weapons, veterans | yes | yes | 172 (28) | −72 | 2/2 |
| 76003-off | 180 surv | 3 | 99 (101) | below-bar | 102 0/102/0/102 | veterans | no | yes | 99 (101) | 0 | 2/2 |
| 76003-on | 180 surv | 4 | 100 (100) | below-bar | 95 75/0/20/95 | armor, weapons, veterans | yes | yes | 197 (3) | −97 | 2/2 |
| 76004-off | 180 surv | 4 | 177 (23) | below-bar | 177 75/102/0/177 | veterans | yes | yes | 177 (23) | 0 | 2/2 |
| 76004-on | 89 lost | 3 | 99 (101) | below-bar | 122 0/102/20/122 | armor, veterans | no | yes | 99 (101) | 0 | 2/2 |
| 76005-off | 103 lost | 4 | 152 (48) | below-bar | 152 50/102/0/152 | armor, weapons, veterans | yes | yes | 152 (48) | 0 | 2/2 |
| 76005-on | 167 lost | 4 | 110 (90) | below-bar | 110 50/0/60/110 | armor, weapons, veterans | yes | yes | 192 (8) | −82 | 2/2 |
| 76006-off | 40 lost | 2 | 0 (200) | below-bar | 0 0/0/0/0 | armor, veterans | no | NO | 0 (200) | 0 | 2/2 |
| 76006-on | 180 surv | 4 | 110 (90) | below-bar | 110 50/0/60/110 | weapons, veterans | yes | yes | 110 (90) | 0 | 2/2 |
| 76007-off | 90 over | 4 | 199 (1) | defer5 | 227 25/102/100/227 | veterans | no | yes | 199 (1) | 0 | 2/2 |
| 76007-on | 120 lost | 4 | 199 (1) | defer5 | 280 100/0/180/200 | armor, weapons, veterans | yes | yes | 199 (1) | 0 | 2/2 |
| 76008-off | 171 over | 4 | 192 (8) | below-bar | 192 50/102/40/192 | veterans | no | yes | 192 (8) | 0 | 2/2 |
| 76008-on | 180 surv | 3 | 20 (180) | below-bar | 20 0/0/20/20 | armor, weapons, veterans | no | yes | 99 (101) | −79 | 2/2 |

Reading notes:
- Every row is blocked by ≥ 2 unlock components (range 2–5,
  median 4). NO row is blocked by a single component. Fixing
  veterans alone unlocks nothing unless standing and the
  other short bars clear at the same time.
- The 3 defer5 rows (76001-on, 76007-off, 76007-on) are the
  ONLY rows where standing points are not short: capped ≥
  200, gated pinned at 199 by the hold (bound t5−1 by
  construction). Their "distT5 = 1" is NOT earnable by +1
  standing — any capped ≥ 200 still holds at 199 until
  readiness clears. The other 13 rows are genuine points
  shortfalls (below-bar gaps 8–200; median 100).
- 76007-on is the purest readiness block: capped exactly
  200, faced yes, rung yes — readiness alone (armor/weapons/
  veterans) holds the door. 76007-off is the veterans-alone
  readiness row (short = [veterans] only) BUT it is still
  blocked by a second unlock component (w4faced = no) —
  it took a lesser seat on day 90 before facing a wave-4
  monster. There is no row blocked by veterans alone in the
  full chain.
- 76004-off is the closest two-blocker row: standing gap 23
  + veterans only.
- Peak gaps ≤ 8 on 6 rows (76001-on 1, 76003-on 3, 76005-on
  8, 76007-off 1, 76007-on 1, 76008-off 8) — the wall is
  approached closely at peak and then, on 5 rows, lost to
  decay (see dynamics note).

## Blocking-component ranking (end state, 16 rows)

1. veterans — 16/16 (100%). The binding constraint.
2. standing points shortfall (below-bar) — 13/16.
3. armor — 11/16. 4. weapons — 9/16.
5. wave-4 faced missing — 7/16.
6. defer5 hold (standing capped but readiness unready) — 3/16.
7. w3 rung missing — 1/16 (early-death row only).
8. tricks — 0/16. The counters bar is met at every end
   snapshot on both arms. It is not a blocker on this band
   (caveat: end snapshots only — the corpus has no daily
   readiness trace, so a mid-run tricks shortfall cannot be
   excluded, but nothing in the end data suggests one).

End-state short-bar instances by arm: OFF 14 (armor 4,
weapons 2, tricks 0, veterans 8) → ON 22 (armor 7, weapons 7,
tricks 0, veterans 8). Pursuit did NOT shrink the readiness
shortfall at end state — it grew it, while moving standing
peaks and w4faced (below). End state is a survival snapshot,
not a capability peak: armored/armed fighters die in the
fights that earn standing, so a longer, harder ON run can
show MORE short bars at the end even while gearing more
during the run. The analyzer reports end state because that
is what the corpus records; a daily readiness trace is the
ranked instrument fix.

## Movable-component verdict — the honest answer

| component | label | mechanism reasoning | moved on this band? |
|---|---|---|---|
| tricks (≥ 3 counters) | POLICY-MOVABLE, moot | Counters are learned by fighting + teaching; a policy can steer fights toward unknown monsters. | Moot: met 16/16 both arms. Nothing to move. |
| w3 rung | POLICY-MOVABLE, moot | Day floor + wave-2 ledger kills; any surviving competent run clears it. | Met 15/16; only miss is the day-40 death. |
| w4faced | POLICY-MOVABLE — proven | Patrols put wave-4 monsters in front of the village; facing is a policy verb outcome. | YES: false→true on 4 seeds (76001, 76003, 76006, 76007); true→false on 1 (76004 early death); still missing on 76008-on. The one component pursuit clearly moved. |
| standing points | POLICY-MOVABLE but NOT STICKY | War (kills), bonds (links), bread (feasts) are all policy verbs. | Peaks rose on 5/8 seeds (76001 +72, 76002 +25, 76003 +98, 76005 +40, 76006 +110) — then decay erased it at end on 5 rows (see dynamics). Movable up, not held. |
| armor | POLICY-MOVABLE, weakly (survival-confounded) | Bark armor is craftable and landed live; wearing it is a policy choice. But the bar counts LIVING armored fighters, and armored fighters are mortality-selected (standing.js recalibration comment: 34/47 armored died in the draft they unlocked). | NO at end state: short rows 4 → 7 under pursuit. Gearing without keeping fighters alive re-measures the wall. |
| weapons | POLICY-MOVABLE, weakly (survival-confounded) | Handing weapons out is a policy choice; the bar counts living armed fighters. | NO at end state: short rows 2 → 7 under pursuit. Same survival confound as armor. |
| veterans | POLICY-MOVABLE IN PRINCIPLE, UNMOVED ON BAND — the binding constraint | Needs ≥ 2 DISTINCT living wave-4+ killers surviving to the wave-5 window (scholar can be one). A policy could in principle spread killing blows across villagers (party fights, letting villagers land kills) and keep both killers alive. That requires wave 4 unlocked + faced + killed by the right people + survived — four stacked conditions, and the bar is read on LIVING killers only, so every killer death re-opens it. | NO: short 8/8 both arms; 0/8 seeds cleared it, including under a pursuit that raised wave-4 clears and w4faced. No band evidence it moves under current policies. |
| defer5 hold itself | consequence, not a lever | The hold lifts exactly when readiness clears; its existence and bound (t5−1) are code. | N/A — moves only via readiness. |
| demand numbers, t5 = 200, plenty cap 100, peak ratchet | GAME-CODE-ONLY numbers | Changing them is a src/js change, forbidden in this DIAG arm. | N/A. |
| demand recalibration, living-vs-dead veteran counting (VETSHAPE default), deed-bar moves, #1223 stage bar | STEVE-CALL | Design rulings, not policy verbs and not worker calls. | N/A — do NOT move without Steve. |
| deed w5 bar (2 distinct fought) | STEVE-CALL if moved; DOWNSTREAM anyway | Unfillable while wave 5 is locked; a policy cannot touch it before unlock. | N/A. |

HONEST ANSWER, stated plainly: no single component is cleanly
policy-movable TO THE BAR on this band. The one component
pursuit proved it can move (w4faced) is not the binding one.
The binding one (veterans, 16/16) has never cleared on this
band under any arm, and the two gear bars moved the WRONG WAY
at end state under pursuit. A pursuit variant that chases one
bar — more patrols, more feasts, more links — will re-measure
the same stacked wall (median 4 blockers per row). The next
variant, when it comes, must be designed around the stack:
spread wave-4 killing blows across ≥ 2 villagers AND keep
both killers alive to the window AND hold armor/weapons
counts up at the same time AND hold standing against
diplomacy decay — or it must come with a Steve call on the
bar itself. That is an audit conclusion, not a pursuit plan;
this arm runs no variant.

## Standing dynamics note (subordinate measurement)

- Seed 76003 IS in the corpus (both arms) — the fullseat note's
  197→100 is checkable here, and it checks out with one
  correction of emphasis: 76003-on peaked at gated 197 and
  ended at gated 100, but the end RAW is 95 (war 75, diplomacy
  0, plenty 20) — the 100 is the PEAK-RATCHET FLOOR (wave 4
  released, so gated never drops below t4 = 100), not a live
  total. The village's live standing fell to 95; the floor
  reports 100.
- End-vs-peak deltas, all 16 rows: 11 rows delta 0 (run ended
  at peak or never moved); 5 rows decayed: 76002-off −47
  (147→100, floor), 76002-on −72 (172→100, floor), 76003-on
  −97 (197→100, floor), 76005-on −82 (192→110),
  76008-on −79 (99→20). Every decayed row ends with
  diplomacy 0; every non-decayed row that ever held links
  ends with diplomacy 102 (3 links × 34), except 76006-on
  (never held links, delta 0). Corpus-measured pattern:
  standing decay ⟺ diplomacy collapse.
- Mechanism (code read, NOT corpus-measured at peak — peak
  component splits are not in the corpus): diplomacy is
  live-computed every read (standing.js villageStanding from
  hierarchyState + _linkSeasoned + _linkRegionalPlus), so any
  link dissolving, trust falling below 40, or polity loss
  subtracts 34 immediately. Plenty churns through the 60-entry
  feastLog cap (game.js hostFeast splices the oldest entries;
  new feasts can push old major feasts out of the window).
  War is ledger-cumulative (kills only add points, subject to
  the per-type cap) — no decay path was found in the code
  read, so war does not explain the drops; the drops sit on
  the diplomacy/plenty side, and the end splits (diplomacy 0
  on all 5 decay rows) point at diplomacy first. Peak
  component splits are UNMEASURED: the claim "diplomacy fell
  by X" for any single row cannot be quantified from this
  corpus, only the direction (diplomacy 0 at end after a
  high peak) and the floor arithmetic above.
- Pin vs shortfall (applied, not just stated): a gated total
  of exactly 199 with capped ≥ 200 and rd5 unready IS the
  defer5 hold (bound t5−1 by construction in
  villageStandingTotal) — 3 end rows, 3 peak rows, same three
  seeds. A peak of 197 (76003-on) is NOT a pin: capped never
  reached 200 at peak, so no hold was active; it is 3 points
  short, then decayed. Likewise the 99-pins: 76003-off
  (raw 102, gated 99 — defer4 hold, rd4 unready) and 76004-on
  (raw 122, gated 99 — defer4 hold). Below-bar rows that end
  at 100 (76002 both arms, 76003-on) are floor readings, not
  pins and not live totals — quoting "standing 100" for those
  rows without the floor note overstates live standing by
  5–30 points.

## Sense-testing read (76005 ON, days 166–167 ring)

File: evidence/2026-10-29/sim-fullseat-a-sense.txt (240-line
ring; seat day/ending match the measured run — village-lost
day 167, tableWaiting true, tableDone false).
METHOD LIMIT, stated up front: the ring covers only the final
two days, so the table announcement (~day 92), the 27 lesser
skips, and any earlier hold beats are NOT in the readable
window. This read judges the endgame window only, not the
invitation or refusal beats.

Judgment — the wall reads as REAL CONSEQUENCES with an
INVISIBLE SPECIFICATION:
- What is voiced and real: bearer deaths drive everything.
  Petra dies day 166, Pascaline day 167, Kamala day 167 —
  and each death carries the same line: "the dead hold no
  treaties. Every link Haven has shakes." That is the audit's
  diplomacy-decay mechanism spoken aloud in the fiction:
  the village's standing literally shakes when its bearers
  die. The mortality-selection engine behind the armor/
  weapons/veterans bars is visible here as people dying, not
  as numbers. The overtime price is also voiced constantly
  (RERUN ×6, +150% HP, +72% damage) — declining the lesser
  seat costs real blood.
- What is invisible: NOTHING in the window names wave 5, the
  fifth draft, or any readiness piece. No line says "you need
  2 living wave-4 killers," "4 fighters armored," or "weapons
  in hands." The table itself — waiting, per the header — is
  never mentioned in the final days. A player in 76005-on's
  position hears harder monsters and dying bearers, not a
  missing-pieces list.
- Structural reason (code, not just the window): the hold
  beat (_standingHoldBeat, standing.js) fires ONLY while a
  hold is live — defer5/defer4/cap with weekly reminders
  naming the short bars via _readinessBarLine. 76005-on ends
  BELOW-bar (gated 110), so no defer5 beat would be firing
  in this window at all: the 13 below-bar rows get no
  readiness voicing by construction, and the 3 defer5 rows
  get it only while capped ≥ 200. The readiness wall is
  therefore voiced exactly where it is closest (defer5) and
  silent everywhere else — including for villages 8 points
  from the bar at peak (76005-on peaked 192) that then
  decayed unheard.
- Villagers still read like people in this window (Pascaline
  naming the beast "Big-Eyes" while nobody agrees; Maya of
  Emberhold arriving with 1,805 kcal "honestly counted";
  Kamala's "You're not Petra" — flat fact, not a system
  line). No robotic or repeated dialogue flagged beyond the
  deliberate RERUN refrain, which is the overtime mechanic
  voicing itself, not filler.

## Metric review

- The prereg worked as written; no mid-run re-scoring. The
  distance definitions (exact standing points, boolean
  faced/rung, short-names + bounded intervals, deed w5 kept
  downstream) held up against all 16 rows with 0
  unclassified — the corpus gap declared in advance (exact
  readiness counts) was the only measurement limit, and it
  was a limit on precision, not on classification.
- "Distance 2" must never be quoted bare for wave 5 again on
  this band: it is the DEED distance (2 distinct wave-5
  fought, of which 0 exist), while the UNLOCK distance is a
  4-component stack (median 4 blockers/row). Future arms
  should quote both numbers with labels, or the wall will
  keep being misread as one lock.
- End-state snapshots flatter AND mislead: they flatter
  tricks (met everywhere at end) and mislead on armor/weapons
  (worse ON than OFF at end, confounded by longer exposure
  and fighter deaths). The next instrument needs a daily or
  max-reach readiness trace (four counts + short-names per
  snapshot), not just an end snapshot — otherwise the next
  pursuit arm will again argue about whether gearing "worked"
  from end-state shadows.
- Median convention note: by-policy medianDistT5 in the
  analyzer output is the index-4 element of the 8 sorted
  values (OFF 73, ON 100) — an upper median, reported for
  comparability with the analyzer, not a textbook median.
  The evidence text quotes ranges and the below-bar median
  (100 across the 13 below-bar rows) instead of leaning on
  that figure.
- Balanced panel (§15): not applicable — this is a DIAG
  audit on a fixed corpus, not a before/after comparison.
  No panel compare was attempted, and none is claimed.

## Landing + ranked next step

- LANDING (DIAG rule): instruments + evidence + analysis land;
  zero game code, zero policy files created or deleted, zero
  default flips. No push, no version bump, no live check —
  ready for coordinator merge, pending ship.
- RANKED NEXT STEP (fixed order, per brief): (1) THIS AUDIT —
  done: veterans 16/16 is the binding constraint, stacked
  with standing decay and gear mortality; tricks and w3rung
  are non-blockers; w4faced is the only proven-movable bar.
  (2) Standing dynamics — subordinate here; a full arm is
  warranted ONLY to record peak component splits + a daily
  readiness trace (the two corpus gaps named above), not to
  re-measure end states. (3) ONLY then a pursuit variant —
  designed around the stack (spread wave-4 killing blows,
  keep both killers alive, hold gear counts AND standing
  simultaneously), or accompanied by a Steve call on the bar
  itself. A variant without the readiness answer will
  re-measure the same wall. Do NOT chase the stage bar
  (#1223) without a Steve call; do NOT move any deed bar —
  the bar is not the problem, the unlock + readiness chain is.

## Findings outside this arm (reported, NOT touched)

- Below-bar silence: villages below the standing bar hear
  nothing about readiness (hold beats fire only in deferral).
  Whether a below-bar readiness readout belongs in the
  standing line or the table preview is a design question,
  not a bug claim.
- End-state "standing 100" readings on floor rows (76002
  both arms, 76003-on) overstate live standing (raw 70–95).
  Any future standing report should print raw + gated +
  floor separately.
- 76008-on's end war = 0 despite 5 distinct wave-3 types
  fought (diag.max w3 = 5): fought ≠ killed. War standing
  requires kills, and this village killed no wave-3+
  monster by end — a useful reminder that "faced" progress
  and "kills" progress are different currencies.
- 76006-off (died day 40) is the only w3rung-missing row and
  the only row blocked at every layer (5 blockers) — an
  early-death row, not a wall row; it should be excluded
  from any "closest approach" narrative.

## Convergence state

Axis scale-onramp: CONVERGING, not converged. The wave-5 wall
is now decomposed to named components with a ranking
(veterans > standing shortfall > armor > weapons > faced >
defer5 hold > rung; tricks 0), a proven-movable bar (faced),
a sticky problem (standing decay via diplomacy collapse),
and a binding constraint no policy has yet moved (living
veterans, 0/16 cleared). The full seat remains 0/64 across
the substrate-family rounds plus this audit's 0/16 unlocks.
The standing directive stands until the tracker records this
axis converged on measured evidence. Claim file + lock are
the coordinator's to retire, not this worker's.
