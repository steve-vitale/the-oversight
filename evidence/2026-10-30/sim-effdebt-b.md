# sim-effdebt-b — forage effort debt below zero: census, mechanism, verdict

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261030T1928Z,
arm sim-effdebt-b, axis food-economy. Worktree sim-effdebt-b.
DIAG ONLY: measurement, zero src/js changes, zero policy-default
changes, no behavior probe built, run, or judged. The replay
presses are measurement instruments on discarded instances
(wakeforage method, disclosed as such), never bot behavior in
a judged leg, never a landed change. Sibling loop A trees,
gapscomp-*/journey* trees, and the main tree were never
touched. The conditional fix did NOT trigger (see Verdict):
no clamp was landed, and none should be on this evidence.

## Prereg (binding; committed BEFORE any judged sweep)

evidence/2026-10-30/sim-effdebt-b-prereg.md (commit da98474dc).
Pinned base c1b310c9614fa3f7f006da5c38ada73833134178
(worktree HEAD at prereg time). Primary question (backlog
#1552): is negative-kcal forage effort an intended "effort
debt" or a missing clamp?
DIAG-GO bar: census complete on 8 seeds with the mechanism
named + verdict stated + a sense read of one negative press
(does the game show or tell anything about going negative?
If silent, say so). NO-GO only if the instrument cannot
observe kcal across presses at all.
Conditional-fix rule (prereg, judged as written): a fix
lands ONLY if (1) forage is missing a funds-check that
sibling actions HAVE in the same action family (a pre-spend
refusal — a post-spend clamp alone does NOT count, because
clamp and refusal are different semantics), AND (2)
below-zero is NOT the engine's shared rule for effort, AND
(3) a pilot of the minimal clamp shows zero negative
presses with positive-kcal behavior identical per seed.
Any failure, or an ambiguous mechanism, means NO fix.

## Instruments (and two disclosed instrument fixes)

- Census driver: scripts/sweep-effdebt-b.js, adapted from
  scripts/wakeforage-trace-b.js with NO behavior change
  except a READ-ONLY tap: it wraps Game.doAction/Game.eat
  per instance and logs kind + kcalBefore/After + added
  say lines (+ pack diff for forage presses), calling the
  original verbatim and writing nothing to game state.
  Same policy stack as wakeforage (nighttravel +
  woodcarry + woodwarm over competent), same morning/
  evening recording, same substrate env gates.
  Analyzer: scripts/analyze-effdebt-b.js (pure reads).
  Proof: scripts/test-effdebt-b.js (104/104, see below).
- Replay: scripts/wakeforage-replay-b.js verbatim, control
  + press per fresh stranded field morning, with the
  judged-morning equality gate (mismatch aborts loudly,
  never substitutes).
- Instrument fix 1 (before any evidence was written):
  the first tap version logged only doAction/eat, so a
  negative press looked "restored by eat" — eat was
  merely the next TAPPED event. The real floor happened
  in untapped code between the press and the eat (see
  Mechanism: the setter-trap probe). The tap was
  extended to microMove, pathStep, and eatOne, and BOTH
  legs were re-run on the fixed tap. Press counts are
  identical before/after the fix (tap is behavior-neutral:
  guard 459, ON 458 on both versions) — only restoration
  attribution changed, and the corrected numbers below
  are fixed-tap numbers throughout. No number from the
  first tap version is quoted anywhere.
- Instrument fix 2 (restoration definition, same cause):
  the analyzer's first "restoration" (first later tapped
  event with kcalAfter >= 0) was replaced by the
  probe-validated definition: food gain from eat/eatOne
  events between the press and the next morning snap,
  plus that snap's kcal. A press counts as 'ate-food'
  only if food gain alone climbs out of the debt;
  otherwise it counts as 'floored-without-food' (next
  clamped spend or overnight floor — mechanism proven by
  the probe, not assumed). The probe itself
  (scripts/debug-effdebt-floor.js, a kcal setter trap
  logging the stack of every negative-to->=0 write) was
  a temporary debug script, run on the judged ON stack
  and DELETED before commit; its findings are quoted
  below, its code is not a deliverable.

## Fresh census — 8 seeds x 2 legs, 30 loop-days

Bank (first 8 of the wakeforage bank): 15003, 15009,
15091, 15211, 15215, 15220, 15221, 15337. Horizon
justification (prereg): the question is stranded/
early-game effort debt — the known instances sit on
strand days 8–16, inside 30 loop-days; a longer horizon
would answer a different question about late-game debt
frequency. Death-aware: all 16 legs survived 30 days
(ceiling effect of the window + banking selection, not
a survival claim); endReason/daysAlive per seed below.

Per-seed census (presses = doAction('forage') calls in
the judged trajectories; yielding = kcal fell, i.e. a
harvest happened; refused = kcal unchanged, i.e. a
pre-harvest refusal: worked-out / nothing-left /
pack-full; would-be-debt = presses with kcalBefore < 60):

| leg / seed | presses | yielding | refused | would-be-debt (<60) | negative | min kcalAfter |
|---|---|---|---|---|---|---|
| guard 15003 | 49 | 19 | 30 | 0 | 0 | 2236 |
| guard 15009 | 78 | 13 | 65 | 6 | 1 | -60 |
| guard 15091 | 48 | 11 | 37 | 0 | 0 | 1999 |
| guard 15211 | 67 | 13 | 54 | 0 | 0 | 690 |
| guard 15215 | 47 | 21 | 26 | 6 | 3 | -60 |
| guard 15220 | 42 | 17 | 25 | 0 | 0 | 2046 |
| guard 15221 | 81 | 0 | 81 | 0 | 0 | 2280 |
| guard 15337 | 47 | 16 | 31 | 0 | 0 | 2129 |
| guard TOTAL | 459 | 110 | 349 | 12 | 4 | -60 |
| ON 15003 | 49 | 19 | 30 | 0 | 0 | 2236 |
| ON 15009 | 78 | 13 | 65 | 6 | 1 | -60 |
| ON 15091 | 48 | 11 | 37 | 0 | 0 | 1999 |
| ON 15211 | 67 | 13 | 54 | 0 | 0 | 690 |
| ON 15215 | 46 | 22 | 24 | 16 | 9 | -60 |
| ON 15220 | 42 | 17 | 25 | 0 | 0 | 2046 |
| ON 15221 | 81 | 0 | 81 | 0 | 0 | 2280 |
| ON 15337 | 47 | 16 | 31 | 0 | 0 | 2129 |
| ON TOTAL | 458 | 111 | 347 | 22 | 10 | -60 |
| BOTH LEGS | 917 | 221 | 696 | 34 | 14 | -60 |

Refused-press breakdown (both legs): 639 "worked out"
(step to another green patch), 41 "nothing left to
take here today", 16 pack-full. Refusals spend nothing
— that is why a would-be-debt press that is refused
never goes negative, and why would-be-debt (34) exceeds
negatives (14): 20 of the 34 sub-60 presses were refused
before harvest.
Negative presses concentrate hard: 13 of 14 are on
15215 (the stranded seed) and 1 on 15009; the other 6
seeds never go negative in 30 days. The debt is a
starvation-corner phenomenon, not a general one: it
happens when a hungry villager presses forage with
under 60 kcal in hand, which on this bank is
essentially the strand.

## Every negative press (all 14)

kcalBefore -> kcalAfter is exactly -60 in every row
(the ACTION_COSTS.forage deduction, unclamped). "Rest"
is the corrected definition: 'ate-food' = food gain
between press and next morning snap climbs out of the
debt alone; 'floored-without-food' = no such food gain
— the balance was floored by the next clamped spend or
the overnight floor (probe-proven mechanism, below).
Morning snap is the next morning's kcal in all rows:
no debt survives the night on any row.

| leg / seed / loopDay | tile (cell) | kcal before -> after | yield (pack diff) | restoration | morning snap |
|---|---|---|---|---|---|
| guard 15009 d16 | forest_floor (0,1) | 0 -> -60 | unknowns only | floored, food gain 0 | 0 |
| guard 15215 d8 | wetland (7,0) | 44 -> -16 | unknowns only | floored, food gain 0 | 0 |
| guard 15215 d9 | creek (0,0) | 0 -> -60 | unknowns only | floored, food gain 0 | 0 |
| guard 15215 d10 | wetland (8,8) | 0 -> -60 | 6x Purslane | ate-food, gain 3330 | 2345 |
| ON 15009 d16 | forest_floor (0,1) | 0 -> -60 | unknowns only | floored, food gain 0 | 0 |
| ON 15215 d8 | wetland (7,0) | 44 -> -16 | unknowns only | floored, food gain 0 | 0 |
| ON 15215 d9 | creek (0,0) | 0 -> -60 | unknowns only | floored, food gain 0 | 0 |
| ON 15215 d10 | wetland (8,8) | 0 -> -60 | 8x Purslane | ate-food, gain 240 | 31 |
| ON 15215 d11 | wetland (7,0) | 31 -> -29 | unknowns only | floored, food gain 0 | 0 |
| ON 15215 d12 | wetland (0,8) | 0 -> -60 | unknowns only | floored, food gain 0 | 0 |
| ON 15215 d13 | creek (0,0) | 0 -> -60 | unknowns only | floored, food gain 0 | 0 |
| ON 15215 d14 | wetland (8,8) | 0 -> -60 | 8x Purslane | ate-food, gain 240 | 52 |
| ON 15215 d15 | wetland (7,0) | 52 -> -8 | unknowns only | floored, food gain 0 | 0 |
| ON 15215 d16 | wetland (0,8) | 0 -> -60 | unknowns only | ate-food, gain 900 | 2340 |

Totals: 14 negatives, 4 ate-food, 10 floored-without-
food. The wakeforage headline ("restored only by eating
after") is CORRECTED by this census: on the strand's
unknowns-only days, nothing is eaten at all — the
villager ends the day having foraged unknowns, talked,
and eaten nothing, and still wakes at 0. Eating restores
the debt only on the Purslane days (and the guard-d10 /
ON-d16 gains include the evening haven meal, not just
the pressed haul).

## Strand reproduction (wakeforage strands on this base)

Fresh stranded field mornings (evening bucket creek +
rescued false, wake tile not haven): guard days 8–9,
ON days 8–16, all seed 15215 — the same strand set as
wakeforage, with the same morning kcal (guard 44/0;
ON 44/0/0/31/0/0/0/52/0) and the same morning wood.
Replay: 11 controls, 11 presses, judgedDiffs EMPTY on
all 11 controls and all 11 presses — the replay snaps
are licensed, and the strand REPRODUCES EXACTLY on
this base (no drift):

| morning (15215) | wake | morn kcal | press yield E | unknown | press kcal path | say (cost named?) |
|---|---|---|---|---|---|---|
| guard d8 | (0,0) | 44 | 0 | 0 | 44 -> 44 (NOTHING, spends nothing) | "worked out" — no |
| guard d9 | (0,0) | 0 | 0 | 0 | 0 -> 0 (NOTHING) | "worked out" — no |
| ON d8 | (0,0) | 44 | 0 | 0 | 44 -> 44 (NOTHING) | "worked out" — no |
| ON d9 | (0,0) | 0 | 0 | 0 | 0 -> 0 (NOTHING) | "worked out" — no |
| ON d10 | (8,0) | 0 | 540 (6x Muscadine) | 13 | 0 -> -60 | yield "(540 kcal)" only — cost never named |
| ON d11 | (8,0) | 31 | 720 (8x) | 11 | 31 -> -29 | yield only — cost never named |
| ON d12 | (0,0) | 0 | 0 | 0 | 0 -> 0 (NOTHING) | "worked out" — no |
| ON d13 | (0,0) | 0 | 0 | 0 | 0 -> 0 (NOTHING) | "worked out" — no |
| ON d14 | (8,0) | 0 | 720 (8x) | 11 | 0 -> -60 | yield only — cost never named |
| ON d15 | (8,0) | 52 | 630 (7x) | 18 | 52 -> -8 | yield only — cost never named |
| ON d16 | (0,0) | 0 | 0 | 0 | 0 -> 0 (NOTHING) | "worked out" — no |

The morning-press negatives are the same four east
mornings wakeforage found, with identical E and unknown
counts (540/720/720/630; 13/11/11/18). West mornings
spend nothing at any balance — the empty sweep returns
before deduction, so a west press can never go negative.
The debt needs a YIELDING press at under 60 kcal: the
press takes its 60 after the harvest, whatever the
balance was.

## Mechanism (code read + setter-trap probe)

Cost path: doAction('forage') in src/js/game.js —
after a successful sweep, `scholar.kcal -=
S.calories.ACTION_COSTS.forage` (60, src/js/engine/
calories.js ACTION_COSTS). No floor, no pre-spend
refusal, and the press narration never names the cost.
The branch's pre-spend refusals are only canForage-
false, empty sweep, and pack-full — a kcal gate is not
among them. The HUD would print the negative raw
(app.js: Math.round(kcal)/cap, no floor), but the
press narration never speaks it: on all 14 census
negatives, ZERO say lines name the 60-kcal cost (the
3 "names kcal" rows name the YIELD — "6x Purslane
(180 kcal)" — never the cost).

Sibling cost paths, three families (census over all
kcal deductions in src/js, excluding DOM-only app.js):

(a) PRE-SPEND REFUSAL (funds-check — the action is
blocked when short, nothing deducted): ability kcal
handler (abilityActions.js: kcal < amount blocks with
"Not enough energy"); foodPower activateAbility
(foodPower.js: kcal < kc refuses, "Not enough energy");
tradeKnowledge food price (game.js: kcal < 300 refuses
'poor'); field-medicine heal (kcal < healCost refuses
"Too hungry to heal"); treat-other (kcal < 150 refuses);
contest bet and ember-heart (kcal >= cost gates the
bare deduction). These are spend-to-buy-or-burn
actions: the price buys a discrete effect, and refusing
a broke buyer costs nothing.
(b) POST-SPEND CLAMP (the action executes on empty;
only the floor differs): the doAction physical-labor
family — rest (Math.max(0, before − 40), with the
spent amount named honestly), cutTree (−80),
clearBrush (−40), blockage clearing (−60/−40/−80),
scavenge-book (−100), boil, fire, tent, walk steps
(microMove AND pathStep: Math.max(0, kcal − step)),
conversation open (−10). Clamp is NOT a funds-check.
(c) UNGATED BARE DEDUCTIONS (can go negative): forage
(−60), scavenge-loot (−100), thorns (−20/−50), and —
decisively — the engine's own metabolism: resolveDay
(engine/calories.js) deducts the full day need
unclamped, takes starvation damage on a negative
balance, and only then floors at 0, with the comment
"Negative kcal/hp are display/logic noise — the
spiral already did its damage above."

The setter-trap probe (judged ON stack, seed 15215)
proves what happens to a negative balance in practice:
- Day 8, press 44 -> -16: floored -16 -> 0 by
  startConvo (conversation.js:5162, the clamped −10
  talk cost) from talkRound — the villager's next
  conversation, not food, erases the debt. Same on
  day 9 (-60 -> 0, startConvo).
- Every hungry night transits negative in resolveDay
  itself (probe days 1/3/4/8/9: -250, -100, -6, -2250,
  -2250 — the day need deducted from a low or negative
  balance) before the floor to 0. Negative kcal is the
  metabolism's own nightly transit, not a forage-only
  state.
- Day 8 additionally shows an ungated -50 transit
  (thorns-class spend) before the same overnight floor.

Downstream effects of a negative balance (all measured
or code-proven, none hypothetical):
- Display: HUD prints the negative raw (e.g. "-60/3000
  kcal") — visible if the player is watching the bar,
  but the press narration never draws attention to it.
- Ability gating: foodPowerGate refuses every ability
  below 500 kcal — a negative balance gates IDENTICALLY
  to 0. No ability is lost or gained by the debt.
- Rest healing: crisis at kcal <= 0 blocks healing —
  negative identical to 0. No healing is lost or gained.
- Eating: adds kcal capped at cap — negative just needs
  more food to climb out; no special handling, no bonus.
- Death attribution: resolveDay damage on a negative
  balance is min(20, 2 + deficit/180). The marginal
  damage of -60 vs 0 at nightfall is 0.33 HP (14.55 vs
  14.22) — and in practice the debt is floored before
  nightfall anyway, so it contributes ~nothing. No
  census leg died, and no death in the corpus is
  attributable to a press: every negative press's day
  ends survived, and every negative balance is >= 0 by
  the next morning snap.
- Save/load: not probed directly (no save/load leg in
  this arm) — but the balance never survives the night
  in the census, so there is no negative balance left
  for a save to carry, on these trajectories. Stated as
  a boundary, not a claim.

## VERDICT: intended-as-shared-rule — NO FIX (DIAG only)

Below-zero forage effort is NOT a missing clamp. It is
the engine's normal transient state, for four converging
reasons:
1. The conditional's clause (1) FAILS: forage has no
   sibling funds-check in its own family to be missing.
   Its family (doAction physical labor: rest, cutTree,
   clearBrush, blockage clearing, steps, talk) uses
   CLAMP, not refusal — and the refusal family
   (abilities, trade, healing, bets) is a different kind
   of action: a price for a discrete effect, where
   refusing a broke buyer is coherent. A refusal on
   forage would be incoherent: foraging is HOW a
   starving villager gets food, and the strand proves
   presses at 0 are exactly the recovery path (east
   mornings fund the day from 0). Refusing them would
   block food acquisition at the moment of greatest
   need — a softlock, not a fix.
2. Clause (2) FAILS: below-zero is the engine's shared
   rule, not a forage outlier. Metabolism itself passes
   through negative every hungry night (probe + code
   comment), scavenge-loot and thorns are ungated too,
   and every clamped spend in the game erases a negative
   balance as a side effect (startConvo proven on days
   8–9). The debt is self-erasing by construction.
3. A clamp would NOT be behavior-preserving, so it
   cannot be justified as a silent repair: clamping
   forgives the cost whenever the balance is under 60
   (rest at 30 kcal pays 30, not 40 — that is what a
   clamp IS). On the strand it would gift up to 60 kcal
   per low press and change wakeforage's measured
   economics (day-10 press: 0→-60→+540=480 becomes
   0→0→+540=540). An unjustified 60-kcal gift on a
   balance-sensitive economy is worse than the open
   question — exactly what the prereg's conditional
   forbids.
4. The debt has no observable consequence in the
   census: no gate treats negative differently from 0,
   no death is attributable to a press, no debt
   survives the night (14/14 at >= 0 by next morning
   snap), and the only place it is visible is a HUD
   number between the press and the next clamped spend.

The REAL finding is silence, not arithmetic. The press
never names its 60-kcal cost (rest, by contrast, names
its spent amount honestly), never says the balance went
negative, and the debt is then silently forgiven by the
next conversation or step. Under the no-silent-actions
rule that is a narration gap: a player pressing forage
at 0 kcal is never told the press costs 60, never told
they went to -60, and never told a later chat wiped the
debt. The honest follow-up — if Steve wants one — is
narration (name the cost, or name the debt when a press
drives kcal negative), NOT a clamp and NOT a refusal.
That is a design call, recorded in sim-findings.md as a
steve-call item; it is not landed here.

DIAG-GO: census complete on 8 seeds x 2 legs (per-seed
tables above), mechanism named with cited checks,
verdict stated, sense read below, strand reproduction
11/11 licensed and exact, tap errs 0, determinism
byte-identical on both instruments. The prereg's
NO-GO condition (instrument cannot observe kcal across
presses) does not arise: the tap observes every press.

## Sense-test (law — read end to end, judged for meaning)

One negative press, 15215 ON day 8, full day lines
(corpus evening row, 22 lines):
The villager travels to wetland, notices "a small fish
flashing in the water", catches gossip fragments by the
fire, is refused on a worked-out patch ("step to another
green patch"), travels on, and on the second patch
forages at 44 kcal: "Unfamiliar unknown shoots — into
the bag... Unfamiliar unknown berries — into the bag...
A shot in the dark — you take what's green: 5x unknown
shoots, 3x unknown berries, 5x unknown berries. Into
the bag, unnamed. (Not food until identified — sort
them at camp.) This patch is picked clean — it'll
recover in a few days." The press drives kcal 44 -> -16
and says NOTHING about the 60-kcal cost or the negative
balance. The day continues coherently — a Hummice
follows, Green Thumb (L1) is gained mid-day with the
System's patter ("The plants lean toward you. They're
gossiping.") — and the evening refuses honestly on the
state as it stands by then: "The creek runs fast here —
no crossing without a bridge or a swim. No bridge
tonight — 0 kcal in hand, and the lashing takes 60."
"Sparks, then nothing. The tinder's too coarse — shred
it finer next time. (-0 kcal, 48 ticks of work, gone
either way.)" The evening line is honest (by evening
the balance has been floored to 0 by talk, so "0 kcal
in hand" is true when spoken), and the failed fire
names its own 0 cost with the same honesty the forage
press lacks. PASS as a coherent story — a hungry
villager foraging unknowns it cannot eat, refused on
wood/kcal at night — and the silence finding stands
inside it: the one line that should have named a cost
(the press) is the one line that names none, while the
lines around it (bridge refusal, fire failure) name
theirs. The debt is real in the numbers and invisible
in the story, and then quietly forgiven by a chat.

## Village assessment (plain words)

The banked villages are the same working villages
wakeforage saw: all 8 seeds survived 30 days on both
legs. The story this arm adds is about the body's
bookkeeping, not its pantry: a hungry villager can
work past empty — the game lets effort go 60 kcal
into the red — but the red ink never sticks. The next
conversation, the next step, or the night itself wipes
it clean, and the villager wakes at 0 either way, to
face the same hunger with the same honest refusals.
On the strand, that means the feared case (a morning
behavior that presses without eating and "leaves the
villager negative") is not a trap: the negative
morning press is already the normal state, it funds
itself the moment the muscadine is eaten, and even
uneaten it evaporates before it can hurt anyone. What
is missing is not a clamp or a refusal but a voice:
nobody in the game ever says the press cost anything.
The blank is narration, and it is documented, not
filled, because filling it with a clamp would pay the
villager 60 free kcal for being broke.

## Villager behavior sample (out of the sims)

- Routines with reasons: Fatima waters and weeds the
  beds before other work; the same villager checks the
  pantry ("~7 days of fresh on hand… leaves the harvest
  standing and turns to the wood run instead. The
  pantry can't take more; the wild will keep.") — a
  person making a judgment, not a loop ticking.
- Social life: gossip fragments travel and degrade
  ("The truth left this story two fires ago. What's
  left is better theater.") — lively, but the phrasing
  pool is small and repeats across nights; noted as
  flavor repetition, not a blank.
- Reactions: the Hummice follows the villager between
  tiles ("It followed you. The Hummice is here.") and
  the villager gains Green Thumb mid-day with a System
  voice — encounters and growth land in the story, not
  just the counters.
- One robotic note (not chased): seed 15221 presses
  forage 81 times in 30 days with ZERO yielding presses
  (all refused: worked-out / nothing-left / pack-full).
  Each refusal spends nothing and says so honestly, so
  it is harmless probing, not a bug — but a villager
  pressing an empty patch 81 times reads as persistence
  without learning. Whether the bot should remember a
  worked-out patch within the day is a policy question
  for a future arm, not a finding of this one.

## Reachability

No new content reached; no game change landed, so no
reachability change is claimed. Waves 1–2 in the
banked villages, waves 3–5 not reached in this 30-day
window (same window as wakeforage).

## Wall numbers

NOT OBSERVABLE on 30-day evening legs (pre-seat, no
field) — reported, never zeros. No national, table, or
win claim is made or implied by this run.

## Proof

scripts/test-effdebt-b.js: 104/104 checks pass,
including: census totals recomputed from tap logs on
both legs (917/221/696/34/14); every negative delta
exactly -60; no negative press names the 60 cost;
morning snap >= 0 on all 14 negatives; food/floored
split 4/10; 11/11 replay controls licensed
(judgedDiffs empty) and 11/11 presses with wakeforage-
exact kcal paths and E values; recorder + press
determinism byte-identical; mechanism code reads
(forage bare deduction, rest/cutTree/talk clamps,
ability + foodPower refusals, resolveDay unclamped
deduction + floor + "display/logic noise" comment).
Tracked diff guard: src/ and scripts/policies/ between
pinned base and final tree are EMPTY — the sweep
driver, analyzer, and proof are measurement scripts
only. Instrument notes (disclosed above): the tap's
step/eatOne extension + restoration-definition correction
(first tap version's "restored by eat" attribution was
wrong; both legs re-run on the fixed tap; press counts
identical); the setter-trap probe script deleted before
commit; the sweep driver's final log line still says
"walktree files" (a cosmetic leftover in the copied
driver, data unaffected).

## Metric review

- Counting EVERY forage press (not just morning
  presses) is the right census unit for an effort-debt
  question: the debt mechanism is press-shaped, and the
  census proves it — the 14 negatives include daytime
  presses on wetland/forest_floor tiles, not only wake
  tiles, and the strand's morning presses are the
  reproduction subset (4 of the 14 negatives are
  morning-press analogues on east mornings; the rest
  are ordinary hungry-day presses). A morning-only
  census would have undercounted the phenomenon 3.5x.
- 30 loop-days is the right horizon for this question:
  the strand days 8–16 sit inside it, and the census
  already shows the concentration (13/14 negatives on
  the stranded seed). A longer horizon would dilute the
  early-game census with late-game presses whose
  balances are rarely under 60.
- kcalBefore < 60 is the exact would-be-debt cut for a
  60-kcal deduction on a yielding press, and splitting
  refused presses out (20 of 34) keeps the count honest:
  refused presses spend nothing and can never go
  negative, at any balance.
- The tap's say-line capture is the right silence
  instrument, with one disclosed limit: the tap does
  not cover startConvo, so restoration attribution
  needed the setter-trap probe to be exact. The probe
  is the reason the evidence can say "floored by talk"
  rather than "restored by eat" — and the reason future
  arms should tap the clamped-spend family (talk, steps)
  whenever they attribute a balance change, not just
  the verb under study.
- No metric revision is proposed for the census, the
  restoration definition (as corrected), or the
  conditional-fix rule: the rule did its job — it
  stopped a clamp that would have gifted 60 kcal per
  low press and blocked nothing, by forcing the
  mechanism to prove a same-family funds-check first.
  A future prereg that wants to judge narration (does
  the press name its cost?) should name it as its own
  primary metric rather than re-asking the clamp
  question: this arm answers the clamp question
  (no), and leaves the narration question open by
  design.

## Out-of-scope findings (NOT chased; for the coordinator's backlog)

- [open] 2026-10-30 — food-economy/forage — (see
  sim-findings.md) FORAGE PRESS NEVER NAMES ITS COST:
  the press narration names yield kcal but never the
  60-kcal effort cost, and never says the balance went
  negative — then the debt is silently forgiven by the
  next clamped spend. Steve-call: narrate the cost/debt,
  or accept the silence? (evidence: sim-effdebt-b.md.)
- [open] 2026-10-30 — food-economy/policy — 15221
  PRESSES FORAGE 81 TIMES WITH ZERO YIELD: every press
  refused (worked-out / nothing-left / pack-full),
  spending nothing. Harmless probing, but persistence
  without learning — should the bot remember a
  worked-out patch within the day? (evidence:
  sim-effdebt-b.md census.)

## Files

- Prereg: evidence/2026-10-30/sim-effdebt-b-prereg.md
  (commit da98474dc)
- Evidence (this file): evidence/2026-10-30/sim-effdebt-b.md
- Census driver: scripts/sweep-effdebt-b.js; analyzer:
  scripts/analyze-effdebt-b.js; proof:
  scripts/test-effdebt-b.js
- Judged census corpora: evidence/2026-10-30/
  sim-effdebt-b-corpus-guard, -corpus-on (8 files each);
  census: sim-effdebt-b-census.json
- Judged-morning extracts: evidence/2026-10-30/
  sim-effdebt-b-judged-mornings/ (11 files)
- Replay corpora: evidence/2026-10-30/
  sim-effdebt-b-corpus-replay (22 files: 11 control +
  11 press)
- Determinism: evidence/2026-10-30/
  sim-effdebt-b-corpus-determinism (15003 ON re-run,
  byte-identical) + sim-effdebt-b-corpus-replay-
  determinism (15215 ON day-10 press re-run,
  byte-identical)
