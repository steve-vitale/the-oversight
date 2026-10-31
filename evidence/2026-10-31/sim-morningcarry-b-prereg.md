# sim-morningcarry-b — PRE-REGISTRATION (binding, committed BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261031T0841Z,
arm sim-morningcarry-b, axis food-economy. Worktree sim-morningcarry-b.
POLICY PROTOTYPE ONLY: one new policy file, zero edits to any existing
policy file, zero src/js changes, zero policy-default flips. Sibling
trees never touched; main tree never touched. The coordinator merges;
this worker does NOT push, bump, or verify live.

## Canon read before designing

docs/CANON.md first, then docs/PRESERVATION.md (the ladder: cleaned
~2d < cooked ~5d < smoked 30d < rendered 90d < pemmican 120d; rot can't
be smoked back) and docs/TIME-ECONOMY.md (ticks/day-parts, metabolic
burn ~2200 kcal/day in endDay, fell 96 ticks + 80 kcal, bridge 96
ticks + 60 kcal, forage 16 ticks). No canon doc covers the
morning-carry blank itself — stated here instead of inventing canon.
Standing rules that bear on it: "no silent actions" (every act
narrated), perception law (Steve 2026-10-28: decisions from what the
villager senses — its own tile, its own pack, its own clock; the probe
reads only the vessel's own pack, the haven pantry it stands in, and
its own clock), and "if you don't know, it doesn't show" (unknown
food is not food until identified — eat()/eatOne() both refuse
edible===false items, and unknown lumps carry kcalEach 0).

## The trace that shapes this probe (DIAG, run BEFORE this prereg, NOT judged)

Trace driver scripts/morningcarry-trace-b.js + analyzer
scripts/analyze-morningcarry-trace-b.js, control stack only, seed
15215, guard + ON legs, on CURRENT master (base 003a9c2f3). Corpora:
evidence/2026-10-31/sim-morningcarry-b-corpus-trace-{guard,on}.
Findings (the probe is built around them, not around assumptions):

1. STRAND SET, ZERO DRIFT: guard still evenings 7-9, ON still
   evenings 7-16 — identical to jointgate-b on the older base.
   Strand mornings wake at 0-52 kcal (guard M8 44, M9 0, M10 0;
   ON M8 44, M11 31, M15 52, rest 0). Overnight stomach burn is
   ~2210 kcal (evening 2254 -> morning 44).
2. WHERE PACK FOOD GOES OVERNIGHT: the dawn sweep (endDay's
   sweepSpoiled, src/js/food.js) removes every stack with
   spoilDay <= the new day, announced ("Overnight, X went bad").
   On late evenings sleep itself refuses (dayTicks 465/451, under
   the 2-batch floor), so dawn accounting lands during the morning
   waits instead — same sweep, same boundary, different bracket.
   Day-foraged unknown lumps carry spoilDay = forageDay + 2 on
   the strand's stacks (one D+1 exception noted in the trace
   census) and survive exactly one dawn. Evening-foraged known
   banks vanished by morning on strandfix2-b; the spoil rule for
   evening forage is NOT re-derived here and is NOT a GO input —
   the probe sidesteps it entirely (see 4).
3. STRAND-MORNING PACKS HOLD NO KNOWN FOOD, EVER: on all 3 guard
   + 9 ON strand mornings, pack known-kcal = 0. What the pack DOES
   hold is unknown food (unknown shoots / unknown berries, lumps
   with species inside, edible false, kcalEach 0, foodState
   'unknown') — which eat()/eatOne() refuse outright. The morning
   waits already attempt a pack-eat (competent.upkeep runs
   competentEat 3x/day) and find "Nothing edible" — the game's own
   wake meal is already in place and already starves on this pack.
   Consequence: a wake pack-eat half that merely re-calls eat()
   AFTER the upkeeps would fire 0 times by construction. This
   probe therefore places half (a) FIRST — in the wrapper upkeep,
   before competent's upkeep — so it is genuinely the first bite
   of the day, and meters it strictly.
4. THE PANTRY CAN ARM A DEPARTURE: on the strand's arming morning
   (day-7 haven morning, vessel inside haven, kcal 2364, wood 4),
   the pantry holds 21,968 kcal, of which ~20,650 kcal is
   spoilDay-366 staples (Rice 65x200, Canned soup 30x250, Dried
   beans) that NO dawn sweep can take. Carry capacity is 24 kg;
   pack weight at departure is 8.4 kg (wood 4 + gear) — ~15.6 kg
   of headroom. The vessel leaves haven with pack known-kcal 0
   on every haven morning: the routine never packs food for the
   road. Half (b) supplies exactly that, preferring longest-shelf
   pantry items first.
5. THE CHAIN THAT COULD RESCUE: guard day-8 and ON day-8 evenings
   fail on kcal alone (wood 4, ticksLeft 191, kcal 0) — the ONLY
   evenings in either strand where food is the sole failing gate.
   If day-7 departure food (spoilDay 366) survives the night and
   is eaten at the day-8 wake, the day-8 evening bridge gate
   (wood 4, kcal >= 60, ticks >= 96) is in reach on BOTH legs.

## Prior art read in full before designing (all priced, none repeated)

- sim-strandfix2-b (2026-10-31, NO-GO): evening flip-bank + morning
  pack-eat. Evening banks of 540-810 kcal read pack 0 next morning;
  morning pack-eat never fired once. Evening banking is CLOSED as
  a route. This arm does not bank in the evening at all.
- sim-jointgate-b (2026-10-31, DIAG-GO): fed+axe+roomy never jointly
  hold on strand mornings (tool 7/7, kcal 7/7, ticks 4/7 on 15215
  ON); the strand seed never holds an axe. This arm does not fell,
  does not need an axe, and works the bridge's kcal gate, not the
  fell gate.
- sim-strandfix-morning-b (2026-10-30, NO-GO): morning wood-seek
  fails on the tool gate. This arm never seeks wood in the morning.
- sim-waitsalign-a (2026-10-31, DIAG-GO): the 448 too-late-sleep
  line. This arm never touches the sleep clock.
- sim-selecttrim-a (2026-10-31, DIAG-GO): routine trim saves 1-3
  ticks. This arm never trims the routine.

## The design: morning-side food, two separately-metered halves

Prototype policy scripts/policies/morningcarry-diag.js, env-gated
MORNINGCARRY=1/0, wrapping the warmed stack (nighttravel +
woodcarry + woodwarm). No other file is edited. Each half records
into its own store; the driver reports both separately.

HALF (a) — WAKE PACK-EAT (wrapper upkeep, BEFORE inner.upkeep):
  Once per game day, at the first upkeep after a day change (the
  wake upkeep — dawn lands in sleep or in the morning waits, and
  the first upkeep after it is the first bite of the day):
  gate = previous evening still-creek (ctx._wcLast bucket creek +
  rescued false, carried across loop-days in ctx) AND wake NOT at
  haven (insideHaven false AND tile != 'haven') AND not game-over
  AND not in combat. If gated and pack known-kcal > 0 (kcalEach >
  0, edible !== false, unspoiled per Game.isSpoiled where
  available) and scholar kcal < kcalCap: call Game.eat() ONCE and
  record kcalBefore/After, packKnownBefore/After, dayTicks.
  If gated but pack known-kcal = 0: record skip 'nothing-known'
  (no say line — the routine's own "Nothing edible" beat already
  speaks, and a second identical line would be narration spam).
  If not gated: record skip reason. One honest say line per
  acted morning, naming what was eaten and the kcal gained.
  Nothing else in the morning: no walk, no forage, no fell, no
  brush, no travel call. Position preserved exactly.
HALF (b) — HAVEN-DEPARTURE PACK CARRY (wrapper daily, BEFORE
  inner.daily, same position as woodcarry's own morning carry):
  gate = starts at haven (insideHaven true OR tile 'haven') AND
  not game-over AND not in combat AND havenStoresAccess() !==
  'none' AND pack known-kcal < DAYWANT (2000). While pack known
  < DAYWANT and takes < 40: pick the best pantry index (pantry
  items with kcalEach > 0, edible !== false, unspoiled, not
  bonded; sort spoilDay descending — null spoilDay counts as
  longest — then kcalEach descending) and call takeFromPantry
  (one unit per call; the engine enforces weight, and a take that
  moves nothing ends the loop). Record per take (name, kcalEach,
  spoilDay) plus packKnownBefore/After, pantryKcalBefore/After,
  dayTicksBefore/After. One honest say line per acted morning,
  naming units + kcal packed. takeFromPantry costs no ticks and
  draws no RNG at ordinary take rates (the trust/-2 + 0.3 say
  branch fires only at trailing-7d net take rate >= 3000; the
  2000/day carry sits below it — any 'Someone watches' / 'Caught'
  line on a judged leg is reported, not hidden).
  DAYWANT = 2000 pack known-kcal: the fair-share norm (Steve
  2026-10-06) and ~one overnight burn (~2210) — a full day's
  food, not a snack and not a hoard. Pantry takes are the
  vessel's own day food front-loaded, not an extra draw: the
  routine eats pack first, pantry second.

What this design deliberately does NOT do, and why: it never banks
food in the evening (strandfix2 closed that route); it never fells
(no axe on this seed — jointgate); it never trims the routine or
touches the sleep clock (selecttrim/waitsalign ceilings); it never
calls travelTo, buildBridge, takeWood, or cutTree.

## Substrate (asserted FATAL in the driver)

POLICY=nighttravel, COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0,
DEPOSITGATE=1, WOODCARRY=1, WOODWARM=0 (guard) / 1 (ON),
MORNINGCARRY=0 (control/OFF) / 1 (variant), DAYS=30, PRESSB unset/0
and STRANDFIX unset/0 (both FATAL if 1: neither is in this stack).
Seeds: the 8-seed pilot band 15003, 15009, 15091, 15211, 15215,
15220, 15221, 15337 (the bank's first 8, including the sole strand
seed 15215). Control legs run through the existing trace driver
(unmodified, MORNINGCARRY unset); variant and OFF legs run through
the new morningcarry driver (same warmed stack, probe wrapper
gate 0 = OFF). OFF legs must reproduce the trace control legs
exactly on per-seed creek/still/rescued counts (det-gate, as in
strandfix2-b). RNG-stream note: variant legs take pantry food
(and, on armed mornings, eat at wake), which changes routine
decisions downstream; post-first-take trajectory divergence from
control is EXPECTED and is reported as divergence, never hidden
and never mistaken for a lever effect on its own — only the
prereg's strand-count bars judge the arm.

## Horizon + why (death-aware, never a fixed 200d by default)

DAYS=30, death-aware: the harness stops at Game.over (dead
villages stop simulating; the +10d tail is the harness's own end
handling). 30 days covers the whole strand (control guard nights
7-9, ON nights 7-16, plus the day-17/18 tail) and 12 post-strand
guardrail days, and matches every prior strand arm's census
window, so counts compare exactly. A 150-day panel would measure
a different question on a different substrate and cannot express
this stack (see §15 below). Wall numbers (national/table/wins)
are NOT observable on a 30d pre-seat census and will be reported
as such, not fabricated.

## Primary metric + GO threshold (judged exactly as written)

Primary metric: the stranded-evening census on seed 15215, guard
+ ON legs, extracted exactly as in tickfell-a / jointgate-b
(still = woodcarry bucket creek + rescued false; rescued =
bucket creek + rescued true; strand = maximal run of still
evenings on consecutive loop-days; both-evening = a loop-day
still on BOTH control legs).

GO iff ALL of:
  (a) still-count FALL >= 2 on the 15215 ON variant leg vs its
      same-WOODWARM control leg, AND the fall is causally linked
      to recorded morningcarry actions on that leg (at least one
      half-(a) firing on a strand morning within the control
      strand's day range — the morning before a rescued or
      prevented evening in the shortened strand, or a strand
      morning whose fed day ends the strand);
  (b) strand length does NOT increase on EITHER variant leg vs
      its control (total still count AND maximal still-run, both
      non-increasing);
  (c) GUARDRAILS (all must hold):
      - no earlier death: no seed's vessel death / game-over day
        moves earlier on a variant leg vs its control;
      - no new death mode: no death cause on a variant leg absent
        from that seed's control leg;
      - no newly ticks-short evening on any seed (per-leg
        ticks-short still-evening count <= control);
      - no increase in creek still counts on any non-strand seed;
      - median survival on the pilot band not worse than control
        (both legs pooled: variant median daysAlive >= control
        median daysAlive).
Otherwise NO-GO. A pilot with zero half-(b) acts on 15215 is NOT a
pass: it is a substrate finding, and the confirm legs are still
run ONLY if the pilot sniff below passes (records complete on
every still evening, errs 0, mechanism evaluated on real haven
and strand mornings); if the pilot records are incomplete or the
driver crashes, the lever is KILLED-AT-PILOT and no confirm
spend follows.

## Staging

- PILOT (sniff only, never judged): 8 seeds, ON variant leg only.
  Pass iff 8/8 files present, errs 0, every 15215 ON still evening
  carries a complete record, half (b) evaluated on 15215 haven
  mornings (act or honest skip with reason), and half (a)
  evaluated on 15215 strand mornings (act or 'nothing-known'
  skip). Pilot files are NEVER mixed into judged corpora.
- CONFIRM (judged): 8 seeds x 6 legs (guard/ON x
  control/variant/OFF) + determinism re-run of the ON variant leg
  (byte-identical corpus required, as in strandfix2-b).
- SENSE TEST (law): read the say lines of every half-(a) firing
  morning and every half-(b) day-7 departure end to end, plus the
  rescued evening's narration. The fix must be NARRATED (wake-eat
  line, departure-carry line, bridge line where applicable),
  never silent. A conversion with no narration in the transcript
  is reported as a sense failure even if the census passes.

## §15 panel (applicability, checked before judged legs)

scripts/balance-panel.js runs sweep-compare registry policies on
150-day horizons with its own scorecard and observer contract
(registry policies, community-exposure rows, 150d win/vest
scorecard). It cannot express the nighttravel+woodcarry+woodwarm
strand stack, the 30-day creek-evening census, or an env-gated
single-mechanism probe — the same declaration every prior strand
arm made and every coordinator accepted. The comparison here is
control-vs-variant legs on identical seeds through the census
analyzer, and is never labeled a panel comparison. The paired
compare is evidence/2026-10-31/sim-morningcarry-b-compare.md,
generated from the census JSON. If the panel tool is invoked on
this corpus it will be recorded with its output verbatim; no
panel result is fabricated.

## Metric review (carried in the evidence file; revisions apply to the
NEXT run, never mid-run)

Open questions noted before any judged leg, not resolved by re-scoring:
- Whether the day-8 fed routine keeps evening ticksLeft >= 96:
  a fed routine may work more ticks than the starved routine's
  ~65, and the bridge needs 96 left. The judged legs measure
  evening ticksLeft on fed days directly; a ticks-short rescue
  failure is a finding about fed-routine tick appetite, not a
  reason to re-bar.
- Whether departure-carried food survives the day-7 routine
  uneaten: competentEat runs in upkeep (before daily) and in no
  later phase of the same loop-day except the next loop-day's
  upkeeps, so day-7 carried food should reach the day-7 evening
  intact — but donateHaul / sortHaul / counterPlay in daily may
  move it, and the judged legs record the day-7 evening pack to
  settle it.
- Whether evening-foraged known food's spoil rule (strandfix2
  banks gone by morning) differs from day-foraged lumps'
  spoilDay = forageDay + 2 (this trace): the probe uses
  spoilDay-366 staples and measures carried survival directly,
  so the question cannot change this arm's verdict either way.
- Whether the GO bar's fall >= 2 on the ON leg is too coarse if
  the design shortens the guard leg by exactly 2 but the ON leg
  by exactly 1 (wood-bleed still blocks later ON evenings): under
  this prereg that is NO-GO, and the evidence file will say so
  rather than re-barring mid-run.
