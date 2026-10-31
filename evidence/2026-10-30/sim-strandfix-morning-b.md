# sim-strandfix-morning-b — strand-morning joint food+wood recovery: DESIGN measurement

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261031T0117Z,
arm sim-strandfix-morning-b, axis food-economy. Worktree
sim-strandfix-morning-b. DIAG ONLY: measurement, zero src/js
changes, zero policy-default flips, zero edits to any existing
policy file, ONE new default-OFF policy file
(scripts/policies/strandfix-morning-diag.js, env-gated
STRANDFIX=1/0, shipped OFF and left OFF). No behavior is
landed or enabled by this arm; a GO verdict would have
certified the DESIGN measurement for the coordinator / Steve,
not flipped anything. Sibling trees, claims, branches, and
Loop A work (sim-w4join-a, sim-ammo-a) never touched. The
main tree never touched. Nothing is merged by this worker
(the coordinator merges); the branch commits below are on
sim-strandfix-morning-b for the coordinator to merge.

## Prereg (binding; committed BEFORE any judged leg)

evidence/2026-10-30/sim-strandfix-morning-b-prereg.md (commit
b13a5825e), plus prereg addendum
evidence/2026-10-30/sim-strandfix-morning-b-prereg-addendum.md
(commit 3e4a9692c, written after the pilot and BEFORE any
confirm leg: pilot tool-gate finding, analysis-only
toolGate derivation, behavior and GO bars frozen — see
§1). Pinned base for game code 7917b1d19cd9b898e54c168a5cf4f201ff02f53c
(worktree HEAD at prereg writing time; the prereg and
addendum commits add evidence/tooling only, so all legs run
on pinned-base game code verbatim). Primary metric:
stranded nights (still-evening count) on the strand seed(s)
vs control, across guard + ON legs. GO threshold, judged
exactly as written: GO iff (a) strand nights fall by >= 3
on a strict majority of strand legs (a strand leg = a
variant leg on which a strand exists, against its
same-WOODWARM control leg; a variant leg with no strand
where its control strands counts with fall = the full
control length — see Metric review for the denominator
resolution) AND (b) at least 1 both-evening is converted
to rescued / bridge-built (a variant-leg evening row with
rescued true on a loop-day that is a still evening on the
same-WOODWARM control leg, AND whose variant morning
carries a strandfix attempt). §15 panel: declared
applicable in paired form only — the official panel driver
cannot express the strand stack (see Panel section); the
paired compare .md is attached, never presented as an
official panel run.

Prior evidence read in full before designing anything:
sim-kcalshort-b.md, sim-fedexile-b.md, sim-warmfuel-b.md,
sim-tickbudget-b.md, sim-strandbank-b.md (see Prereg for
the priced-strand summary: ON 9/13 kcal-short, 7/13
wood-short, 5 both-evenings; fed-morning wood-seeking
conversion 0/4; warmth spends 4 bridge logs; 8 ticks-short
evenings; strand set 15215 only).

## Instruments (reuse, no reinvention)

- NEW POLICY (one file): scripts/policies/strandfix-morning-diag.js.
  Wraps OUTSIDE the warmed stack:
  strandfix(warmed(woodcarry(nighttravel))). On a stranded
  field morning (previous evening travel-refused / creek /
  not rescued; away from haven; not game-over; not combat)
  it tries, BEFORE inner.daily: PHASE 1 secure kcal
  (morning kcal >= 80 -> already-fed, no verb; else wake-3x3
  known food + ticksLeft >= 17 -> forage + eat, priced;
  else pack food > 0 -> eat only; else skip), then PHASE 2
  wood-seek (BFS over non-blocking cells of the OCCUPIED
  tile's own 9x9 detail grid to a stance adjacent to the
  nearest tree/bigtree/bush — smallest path, tie bigtree >
  tree > bush, then row-major — microMove step by step,
  then cutTree on tree/bigtree (kcal >= 80, ticks >= 96,
  max 2 fells) / clearBrush on bush (kcal >= 40, ticks
  >= 32), looping over adjacent wood cells until pack >= 4
  or a floor stops it). It NEVER stacks with pressb
  (variant legs run STRANDFIX=1 with PRESSB unset/0), NEVER
  calls travelTo, draws NO RNG itself (BFS/verb order
  fixed; forage/cutTree lotteries are the engine's own),
  and writes game state only through forage, eat,
  microMove, cutTree, clearBrush. It REQUIRES pressb-diag.js
  helpers (prePressSweep, pressTotals) — require-only reuse,
  no edit to pressb-diag.js or any existing policy file.
- DRIVERS: (i) FRESH BASELINES: scripts/woodday-trace-b.js
  VERBATIM (WOODDAY=0), OUTDIR override only, guard + ON.
  (ii) CONTROL LEGS: scripts/kcalshort-trace-b.js VERBATIM,
  OUTDIR override only, guard + ON. (iii) VARIANT + OFF
  legs: scripts/strandfix-trace-b.js, adapted from
  scripts/pressb-trace-b.js with ONLY the prereg-disclosed
  changes (wrapper swap, strandfix store attached as
  row.strandfixAttempt / row.strandfixSkip, fullDaySay on
  still evenings AND strandfix-attempt mornings, file
  naming, log wording; the internal store variable name
  pbStore is retained from the template — cosmetic, the
  store it holds is the strandfix store). No existing
  driver file is edited. All drivers share the substrate
  env (asserted FATAL): POLICY=nighttravel,
  COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0,
  DEPOSITGATE=1, WOODCARRY=1, DAYS=30, bank 15003, 15009,
  15091, 15211, 15215, 15220, 15221, 15337, 15376, 15439.
- ANALYZER: scripts/analyze-strandfix-morning-b.js (new,
  pure reads): raw-gate classification imported from
  scripts/analyze-kcalshort-b.js with attribution and mode
  mapping (all-three -> ticks-plus-both, wood+ticks ->
  ticks-plus-wood, kcal+ticks -> ticks-plus-kcal), strand
  extraction, det-gate comparison, attempt table (every
  attempt/skip joined to its loop-day evening + morning
  rows), paired control-vs-variant comparison, death
  pairing, wall numbers, and the §15 paired compare .md.
  The analyzer also carries the addendum's toolGate
  derivation (a wood-unchanged cutTree verb counts as a
  TOOL refusal when the day's own say lines carry the
  engine's axe hint) and the rescued-evening class fix
  (a rescued evening row reports class 'rescued', never
  'neither/other') — both analysis-only, both committed
  in the addendum commit BEFORE the confirm legs.
- PROOF: scripts/test-strandfix-morning-b.js (26 checks,
  all green — see Proof). One post-legs proof correction,
  disclosed: the corpus coverage check originally demanded
  every strand morning appear in the attempt table, but a
  strand's FIRST morning is a haven departure morning whose
  policy record is a prev-not-stranded skip (the
  previous-evening gate cannot fire on it — see §5). The
  check was corrected to demand exactly that (first
  mornings must carry the prev-not-stranded skip; later
  mornings must carry an attempt or gate-fired skip). The
  correction changes no judged number — censuses and GO
  inputs come from the analyzer, frozen before the legs —
  and it makes the check stricter in the right place, not
  looser.

## 1. PILOT GATE (before any confirm spend) — PASS on instrument function

First 8 bank seeds, ON-variant leg only, into
sim-strandfix-morning-b-corpus-pilot-on-variant: 8/8 files
present, errs 0, all 8 seeds survived 30 days, strand seed
15215 present with strand mornings recorded, strandfix gate
reached (8 attempts on 15215, 0 instrument errors). Pilot
strand: 15215 nights 7–17 (11 still evenings) — identical
to the judged variant ON strand (§3), a consistency check,
not a judged number. Pilot files are NEVER mixed into
judged corpora (separate OUTDIR, quoted only as gate
numbers). A pilot with zero wood conversions does NOT fail
the sniff test (conversion is the judged outcome) — and
the pilot did surface the tool gate (below), which is a
pilot finding, not a pilot failure: the instrument ran,
fired, recorded, and did not crash.

PILOT DISCOVERY — THE TOOL GATE (fourth gate, unanticipated
by the prereg's food/wood/ticks pricing): on pilot strand
mornings 10, 11, 13, 14, 15 the policy's cutTree verbs
change no wood and stop at 'verb-nochange', while the day
lines name the cause verbatim: "Your Stone knife can't
fell a giant — it takes branches, not trunks. You need an
axe." The villager's best woodcutting tool on those
mornings is a Stone knife (whittle tier); felling needs
axe tier (fell tier 4), pruning needs saw/axe tier (prune
tier 3). Clearing brush cannot substitute: the wake tile
holds 0 bushes on every strand morning. PruneBranches and
gatherFallen yield branch MATERIAL, not pack wood, so they
cannot fill the bridge pack either. On this tile, for this
villager, NO engine verb yields pack wood until an axe-tier
tool arrives — and one does arrive by day 17 (+5 wood in a
single fell, no bearer death in between, no recorded
acquisition event in this corpus — the mechanism is
UNRECORDED here and is stated as a limitation, not
guessed). Day 17 still ends still, on ticks alone. The
addendum froze the behavior and GO bars and added only the
toolGate analysis derivation; the confirm legs ran the
pilot behavior verbatim.

## 2. FRESH BASELINES + STRAND SET RE-DERIVED (this pin, not inherited)

| leg | creek | still | rescued | warmth acted | log-spent |
|-----|-------|-------|---------|--------------|-----------|
| base guard (woodday driver) | 12 | 3 | 9 | 0 | 0 |
| base ON (woodday driver) | 18 | 10 | 8 | 6 | 4 |
| control guard (kcalshort driver) | 12 | 3 | 9 | 0 | 0 |
| control ON (kcalshort driver) | 18 | 10 | 8 | 6 | 4 |
| OFF guard (strandfix driver, STRANDFIX=0) | 12 | 3 | 9 | 0 | 0 |
| OFF ON (strandfix driver, STRANDFIX=0) | 18 | 10 | 8 | 6 | 4 |

Exactly kcalshort's, fedexile's, strandbank's, warmfuel's,
and tickbudget's fresh numbers. ZERO DRIFT on this base
(fifth consecutive base: wakeforage, pressb, kcalshort,
warmfuel/tickbudget, now this pin). The strand set is
re-derived, not inherited: only 15215 strands, on both
legs, guard nights 7–9, ON nights 7–16 (control). 15009 has
ZERO creek evenings on every leg — it does not strand,
does not even visit a creek evening. All 10 seeds survived
30 days on every leg; errs 0 on every leg.

DET-GATE (binding, before any GO judgment): the OFF legs
reproduce the fresh baselines EXACTLY on per-seed
creek/still/rescued counts, strand nights, and evening
woods, on BOTH legs (analyzer detGate match=true,
mismatches=[]). The OFF legs also match the kcalshort
control legs exactly on both legs (OFF-vs-CONTROL
match=true). The instrument is proven behavior-neutral
when OFF; the control leg for the GO judgment is the
kcalshort control leg, cross-checked by the OFF leg, and
the two agree — no control disagreement suspends the
judgment.

## 3. THE JUDGED LEGS (confirm, all 10 seeds each)

| leg | creek | still | rescued | strand (15215) |
|-----|-------|-------|---------|----------------|
| control guard | 12 | 3 | 9 | nights 7–9 |
| variant guard | 13 | 4 | 9 | nights 7–10 |
| control ON | 18 | 10 | 8 | nights 7–16 |
| variant ON | 20 | 11 | 9 | nights 7–17 |

The variant does not shorten either strand — it LENGTHENS
both by exactly one night (fall -1 on both legs). The
extra guard evening is day 10 (ticks-only, §5); the extra
ON evening is day 17 (ticks-only, §5). Variant creek
evenings rise by 1 (guard) and 2 (ON: the extra still
evening day 17 plus the return-day rescued evening day 18).
No other seed strands on any leg; no other seed's
creek/still/rescued counts move between control and
variant on either leg (per-seed tables in the census
JSON). The variant moves exactly the seed it feeds, and
moves it the wrong way.

## 4. PER-EVENING RAW-GATE TABLES (never the bridge skip alone)

### Control guard (15215, nights 7–9)

| evening | class | logs | kcal | kcalGap | ticks | warmth |
|---------|-------|------|------|---------|-------|--------|
| day 7 | ticks-only | 4 | 2254 | 0 | 47 | off |
| day 8 | kcal-only | 4 | 0 | 60 | 239 | off |
| day 9 | kcal-only | 4 | 0 | 60 | 109 | off |

Control guard is pure food (+ the ticks opener), identical
to kcalshort's guard table. It ends by RESCUE on day 10
(bridge built: 4 logs, 180 kcal, 110 ticks — see §5).

### Control ON (15215, nights 7–16) — identical to kcalshort's ON table

| evening | class | logs | kcal | kcalGap | ticks | warmth lit / spent |
|---------|-------|------|------|---------|-------|--------------------|
| day 7 | ticks-only | 4 | 2254 | 0 | 47 | — |
| day 8 | kcal-only | 4 | 0 | 60 | 239 | — |
| day 9 | kcal-only | 4 | 0 | 60 | 109 | lit, 1 log |
| day 10 | wood-only | 3 | 240 | 0 | 238 | — |
| day 11 | both | 3 | 0 | 60 | 111 | lit, 1 log |
| day 12 | both | 2 | 0 | 60 | 239 | lit, 1 log |
| day 13 | both | 1 | 0 | 60 | 111 | lit, 1 log |
| day 14 | wood-only | 0 | 240 | 0 | 238 | — |
| day 15 | both | 0 | 0 | 60 | 111 | — |
| day 16 | both | 0 | 0 | 60 | 111 | — |

Control ON counts: ticks-only 1, kcal-only 2, wood-only 2,
both 5. Zero unclassified, zero kcalLive fallbacks on
strand evenings.

### Variant guard (15215, nights 7–10)

| evening | class | logs | kcal | kcalGap | ticks |
|---------|-------|------|------|---------|-------|
| day 7 | ticks-only | 4 | 2254 | 0 | 47 |
| day 8 | kcal-only | 4 | 0 | 60 | 239 |
| day 9 | kcal-only | 4 | 0 | 60 | 109 |
| day 10 | ticks-only | 4 | 500 | 0 | 93 |

The guard variant's extra evening is a TICKS-SHORT evening
created by the food phase's own 17 ticks (§5) — the same
shape as fedexile's and tickbudget's guard day-10 artifact,
now with a morning-recovery policy instead of a press.

### Variant ON (15215, nights 7–17)

| evening | class | logs | kcal | kcalGap | ticks | warmth lit / spent |
|---------|-------|------|------|---------|-------|--------------------|
| day 7 | ticks-only | 4 | 2254 | 0 | 47 | — |
| day 8 | kcal-only | 4 | 0 | 60 | 239 | — |
| day 9 | kcal-only | 4 | 0 | 60 | 109 | lit, 1 log |
| day 10 | wood-only | 3 | 586 | 0 | 217 | lit, 1 log |
| day 11 | both | 2 | 30 | 30 | 109 | — |
| day 12 | wood-only | 2 | 450 | 0 | 235 | — |
| day 13 | both | 2 | 34 | 26 | 109 | — |
| day 14 | wood-only | 2 | 1066 | 0 | 217 | lit, 1 log |
| day 15 | wood-only | 1 | 164 | 0 | 101 | lit, 1 log |
| day 16 | wood-only | 0 | 680 | 0 | 209 | — |
| day 17 | ticks-only | 5 | 2278 | 0 | 23 | missed (ticks-short) |

Variant ON counts: ticks-only 2, kcal-only 2, wood-only 5,
both 2. Zero unclassified. Read the movement against
control: the food phase CONVERTS 3 of the 5 control
both-evenings into wood-only evenings (days 12, 15, 16 —
evening kcal 450, 164, 680 where control held 0) and
narrows the remaining 2 both-evenings' kcal gaps (days 11,
13: gaps 30 and 26 where control held 60). Food help is
real but partial, and it never rescues: every converted
evening is still wood-short, because the wood gate is the
tool gate (§5), not a kcal gate. Ticks pass on every
variant ON evening except days 7 (47) and 17 (23).

## 5. THE ATTEMPT TABLES (every recovery attempt, fully priced)

Coverage rule (stated, not hidden): a strand's FIRST
morning is a haven departure morning — the villager wakes
at haven, leaves during the day, and ends stranded. The
previous-evening gate cannot fire on it (previous evening
not still), so day 7 appears only as a prev-not-stranded
skip on every leg. Actionable mornings start on day 8
(waking at the creek). The tables below cover 100% of
actionable strand mornings on variant legs: ON days 8–17
(2 gate-fired skips + 8 attempts), guard days 8–10 (2
gate-fired skips + 1 attempt), plus boundary mornings
(days 11 guard / 18 ON, pack-ready skips on rescued
evenings, flagged in the census JSON).

### Variant ON attempts (15215, days 10–17; days 8–9 are pack-ready skips, §below)

| morning | mKcal / mWood / mTicks | food phase (E, realizedNet, ticks) | walk (steps, ticks) | wood phase (delta, kcalSpent, ticks, stop) | evening class |
|---------|------------------------|-------------------------------------|---------------------|---------------------------------------------|---------------|
| day 10 | 0 / 3 / 256 | forage-eat, E 540, net +480, 17 ticks | 2 steps, 4 ticks | delta 0, kcal 4, ticks 4, verb-nochange, cutTree@5,0 3->3, TOOL-GATE | wood-only |
| day 11 | 100 / 2 / 128 | already-fed | 0 steps | delta 0, kcal 0, ticks 2, verb-nochange, cutTree@5,0 2->2, TOOL-GATE | both (gap 30) |
| day 12 | 0 / 2 / 256 | SKIP no-known-kcal | 3 steps, 3 ticks | delta 0, kcal 0 (walk clamped at 0 kcal), ticks 3, kcal-floor, no verb | wood-only |
| day 13 | 104 / 2 / 128 | already-fed | 0 steps | delta 0, kcal 0, ticks 2, verb-nochange, cutTree@4,0 2->2, TOOL-GATE | both (gap 26) |
| day 14 | 0 / 2 / 256 | forage-eat, E 990, net +930, 17 ticks | 2 steps, 4 ticks | delta 0, kcal 4, ticks 4, verb-nochange, cutTree@5,0 2->2, TOOL-GATE | wood-only |
| day 15 | 234 / 1 / 128 | already-fed | 0 steps | delta 0, kcal 0, ticks 2, verb-nochange, cutTree@5,0 1->1, TOOL-GATE | wood-only |
| day 16 | 0 / 0 / 256 | SKIP no-known-kcal | 3 steps, 3 ticks | delta 0, kcal 0 (walk clamped at 0 kcal), ticks 3, kcal-floor, no verb | wood-only |
| day 17 | 2368 / 0 / 128 | already-fed | 0 steps | delta +5, kcal 80, ticks 96, pack-ready, cutTree@4,0 0->5 | ticks-only (23) |

ON totals, priced end to end: food phase fired on 2/8
attempts (days 10, 14): E 1,530 kcal total (540 + 990),
realized nets +480 and +930 (total +1,410), 34 ticks.
Food phase already-fed on 4/8 (days 11, 13, 15, 17:
morning kcal 100, 104, 234, 2368). Food phase skipped
no-known-kcal on 2/8 (days 12, 16: morning kcal 0, no
known food in the wake 3x3). Wood phase: total kcalSpent
88 (walk 4 + 4, fell 80; the clamped 0-kcal walks on days
12 and 16 record 0 kcal spent because microMove's
walkStepKcal is clamped at 0 kcal — the walk cost is
absorbed by the clamp, stated, not hidden), total
wood ticks 116 (walk 4 + 3 + 4 + 3, verb-nochange 2-tick
sizing costs, fell 96). WoodDelta > 0 on 1/8 attempts
(day 17 only). Pack >= 4 reached on 1/8 mornings (day 17
only). TOOL-GATE on 5/8 attempts (days 10, 11, 13, 14,
15): every cutTree verb on those mornings is a tool
refusal, proven by the engine's own hint line in the
day's say lines (analyzer toolGate=true on all five).
KCAL-FLOOR stops on 2/8 (days 12, 16: food skipped, morning
kcal 0, no verb affordable — brush would need 40 kcal and
there are no bushes anyway). The forage-eat mornings
record the effort-debt shape pressb documented: day-10
guard forage at 0 kcal drives kcal to -60 before the eat
restores it (kcalAfterPress -60, kcalAfterEat 390) — the
forage effort is NOT clamped, unlike the fell's
Math.max(0, ...) clamp; the debt is real and the eat
repays it.

ON gate-fired skips (days 8, 9): morning kcal 44 and 0,
morning wood 4 (pack-ready — the bridge's wood is already
in hand), food skipped no-known-kcal. These mornings'
problem is pure kcal (evenings kcal-only), and the policy
correctly attempts nothing for wood — but it also cannot
feed the villager (no known food in the wake 3x3), so the
kcal-only evenings stand. Boundary morning day 18:
pack-ready skip (wood 5, morning kcal 2118), evening
rescued — the return day, not a strand morning.

### Variant guard attempt (15215, day 10; days 8–9 are pack-ready skips)

Day 10: morning kcal 0, wood 4 (pack-ready), morning
ticksLeft 128. Food phase forage-eat: known muscadine, E
450, kcalAfterPress -60, kcalAfterEat 390, realizedNet
+390, ticksSpent 17. Wood phase: pack-ready, no verb.
Evening: ticks-only, 4 logs, 500 kcal, 93 ticks. Control
guard day 10 builds the bridge (rescued, 4 logs, 180 kcal,
110 ticks). The arithmetic is exact: 110 - 17 = 93 < 96.
This is the fedexile/tickbudget guard day-10 shape for a
third policy: a morning feeding behavior's 17 ticks strand
the bridge day. Attribution is reported as
PRESS-ASSOCIATED, not press-isolated: tickbudget isolated
its day-10 case with probe routine totals (18 == 18), but
this driver carries no tick probes, and the forage verb
draws engine RNG that can shift the routine — so the
evidence claims the observed 17-tick difference with the
counterpart outcome, not an isolated sole cause. The
guard strand therefore runs 7–10 (4 nights) against
control 7–9 (3 nights): the recovery ADDS a night on the
warmth-off leg by feeding the villager into a
time-short bridge day. Boundary morning day 11:
pack-ready skip (wood 4, morning kcal 130), evening
rescued.

### Day 17 ON: the one morning everything works — and still strands

Day 17 is the only morning on either leg where the joint
recovery completes: already-fed (2368 kcal), no walk
needed (wake cell adjacent to a bigtree), one fell
(0 -> 5 wood, 80 kcal, 96 ticks, pack-ready). And the
evening still strands — on ticks alone (5 logs, 2278 kcal,
23 ticks). Post-entry tick arithmetic, exact from recorded
snapshots: morning ticksLeft 128 - fell 96 = 32 left after
the wood phase; evening ticksToDayEnd 23; the routine
spends 9 ticks in between. The fell is 96 of the 105
post-entry ticks spent that day. Without the fell there
would be no bridge wood (0 logs); with it, there is no
bridge time (23 < 96). The recovery's own tick cost is
the binding gate on the one morning the tool gate lifts.
Warmth that night misses ticks-short (23 < 48 fire cost):
the villager sleeps cold after its fed, wooded, bridgeless
day. No counterpart exists for a decisive claim (the
control villager is home by day 17) — this is observed
arithmetic, stated as such.

## 6. CONVERSION RATES (the measured quantities, not assumptions)

- Attempts with woodDelta > 0: ON 1/8 (0.125), guard 0/1
  (0.000). Pooled attempts: 1/9 (0.111).
- Mornings reaching pack >= 4: ON 1/8 (day 17 only),
  guard 0/1 (guard attempt morning already held 4 — it
  does not count as reaching, it counts as pack-ready).
- Fed mornings reaching pack >= 4: ON 1/8 (the fed
  denominator here is attempts, since every attempt
  morning is a fed-or-already-fed morning except the two
  no-known-kcal skips — the fedexile 0/4 shape is now
  1/8 with the tool gate named as the reason for the
  other seven: 5 tool-gate, 2 kcal-floor).
- Both-evenings converted to rescued / bridge-built: 0
  on both legs (bar (b) inputs: guard converted 0,
  converted ticks-plus-both 0; ON converted 0, converted
  ticks-plus-both 0). No variant-leg evening row is
  rescued on a control-still loop-day with a strandfix
  attempt that morning. The food phase's both -> wood-only
  conversions (3 evenings) are gate-narrowing, not
  rescues, and are never counted toward bar (b).
- Strand falls: guard -1 (3 -> 4), ON -1 (10 -> 11).
  Majority of strand legs with fall >= 3: 0/2 under
  either denominator reading (variant-strand-only or
  either-leg-strands — both legs strand on both sides,
  so the readings agree here).

## 7. VERDICT AGAINST THE PREREG — NO-GO (design-measurement verdict only)

- (a) Strand nights fall by >= 3 on a strict majority of
  strand legs: FAIL. Falls are -1 (guard) and -1 (ON);
  0/2 legs meet >= 3. The variant lengthens both strands.
- (b) At least 1 both-evening converted to rescued /
  bridge-built: FAIL. Converted both-evenings total 0.
- Det-gate: PASS (OFF == fresh baselines, both legs;
  OFF == control, both legs). Determinism: PASS (15215
  variant ON re-run byte-identical). Proof: PASS
  (26/26, see Proof). Pilot: PASS (instrument function).
  None of these rescue the GO bars — a miss is NO-GO,
  never re-scored against a friendlier metric (the
  both -> wood-only narrowing is reported in §4/§6 and
  explicitly NOT counted toward bar (b)).
- NO-GO means: this morning-recovery DESIGN, as built
  (forage+eat, then micro-walk + fell/brush), does not
  move the strand. It does NOT mean morning recovery is
  impossible — it means the next design must reckon with
  the gates this measurement names in order: (1) TOOL
  (axe in hand, or bushes on the tile — without either,
  no pack wood exists to seek); (2) TICKS (a fell costs
  96 ticks, and on the one morning it succeeds it strands
  by time; a morning behavior must budget ticks, as
  tickbudget already warned, and the day-7 routine hole
  still has no morning behavior to budget); (3) KCAL
  (the food phase works when known food is in the wake
  3x3 — E 540/990, nets +480/+930 — but 2/8 ON attempt
  mornings hold no known food and wake at 0 kcal, and
  the guard's fed mornings strand by time anyway).
  The landing decision stays with the coordinator / Steve;
  nothing here flips STRANDFIX on, and the policy file
  remains default-OFF measurement only.

## 8. DEATH-DELAY, WALL NUMBERS, REACHABILITY

Death-delay (bearer-death day, variant minus control;
CENSORED where either leg has no bearer death):
- 15215 ON: control day 17 ("the wild") -> variant NONE
  in window (no bearer death on the variant leg at all in
  30 days) — CENSORED, in the survival direction: the
  fed, longer exile outlives the control bearer's day-17
  death. This is NOT a delay number and is never reported
  as one. Variant all-deaths 14 vs control 8 (extra
  monster kills / villager-combat entries on the longer
  trajectory, same class as fedexile's finding, not new
  bearer deaths).
- 15215 guard: no bearer death on either leg — CENSORED
  both. Variant all-deaths 12 vs control 6; wave reach
  1 -> 3 (the longer, fight-richer warmth-off trajectory
  fedexile and tickbudget also saw).
- Every other seed: delay 0 (same bearer-death day both
  legs: 15009 day 18 contest, 15091 day 8, 15221 day 31,
  15376 day 17) or CENSORED (no bearer death either leg).
  No seed's endReason worsens; all 10 seeds survived 30
  days on every leg (endReason survived 10/10, all legs).
- Wall numbers (structural zeros on this 30-day pre-seat
  substrate, reported, never claimed as a wall
  measurement): national 0/10, table 0/10, wins 0/10 on
  all legs. Median survival 30 days (ceiling — all seeds
  survived the window; banking selection, not a survival
  claim). Wave reach ON legs: wave >= 1 on 10/10 control
  and variant; wave >= 2 on 8/10 control and 9/10 variant
  (15215 variant reaches wave 2 where its control reaches
  wave 1); wave 3 on 1/10 both (15439); waves 4–5 on 0/10.
  Guard variant: 15215 reaches wave 3 (control wave 1).
  No new content reached by a game change (no game change
  landed — policy variant only, default off). Creek/bridge
  content reached (control ON: 18 creek evenings, 8
  rescued; variant ON: 20 creek evenings, 9 rescued;
  guard legs as in §3).

## 9. SENSE-TEST (law — read end to end, judged for meaning)

Judged variant ON corpus, seed 15215, day 17 — the only
morning the joint recovery completes. The day opens with
the recovery verb itself ("The big tree comes down with a
crack that echoes. +5 wood. The ground is clear now."),
then a full, varied, person-shaped day: a Trail compass
held against shaking, travel to wetland, gossip fragments
("Noah telling Tao about you. Someone's added a flourish
that wasn't there this morning"), a haven argument about
naming ("Tao is calling it 'Big Big.' Nobody agrees yet"),
worked-out patches, a Loud-Eyes pacing at the boundary
("unwilling. Something else is already here"), a Field
Dressing lesson learned by doing, and an ability gained
(Bribe, L1, with its own voice line) — then the creek
refusal, honest about time: "No bridge tonight — 23 ticks
left in the day, and a bridge takes 96 ticks." PASS on
mechanism, with the same quiet gap the strand arms keep
finding: nothing in the narration connects the morning
fell's 96 ticks to the evening's 23-tick shortfall, and
the warmth miss that follows (fire cost 48 > 23) is
recorded but not narrated as a cold night. A player
reading only the story would see a fed, wooded villager
run out of day for no stated reason — the numbers are
honest at every step; the connection between them is not
spoken. Two ambient wrinkles, same class as prior arms,
not verdict failures: "fragments by the fire" gossip on a
fireless night, and a "Your pack is full" line mid-day
(the fell + forage fill the pack before the routine's
forage attempts). Day 10 guard reads the same way at
smaller scale: a muscadine press and eat in the morning,
a normal day, and a 93-vs-96 refusal that names time
honestly without remarking how close the bridge was.

Villager-behavior sample (out of the sims): haven days in
these corpora carry no full transcript (the driver records
full day lines on still evenings and attempt mornings
only — coverage limit, stated, same as tickbudget). The
sample is therefore the strand days themselves, which read
as people (above), plus the day-17 ability-gain and
learning beats that belong to the game, not the arm. No
static or repeated villager routines beyond fedexile's
already-filed Tao catchphrase note (not re-observed here
— no teaching lines appear in these transcripts). Nothing
here changes the arm's verdict.

## Village assessment (plain words)

The banked villages are the same working villages the
strand arms have always seen: all 10 survived 30 days on
every leg. The story this arm adds is a fourth locked
door on a strand that already had three. The villager
wakes hungry, and this time something actually tries to
help it in the morning: it forages what it knows, eats,
walks to the big trees it can see from its own tile, and
raises its knife — and the trees refuse it, because it
does not hold an axe. Five mornings in a row the same
refusal, spoken plainly by the game itself. Twice it
cannot even feed itself first, because nothing it knows
grows beside its sleeping place. Once, late, it holds an
axe — nobody in the record says how it got one — and it
fells a giant in one morning, fills its pack, spends its
day well, and still sleeps out, because felling cost the
very hours the bridge needed. The strand is not one
failure but a sequence of gates, each honest: food, then
tool, then time. Feeding the villager without an axe
leaves it fed and stuck; giving it wood without time
leaves it wooded and stuck. The village at home is not
poor through any of this — the home pantry grows while
the field villager carries nothing — it is distant, and
the distance is now priced in four currencies: kcal,
logs, ticks, and the tool in hand.

## Panel (§15)

The official balance-panel driver cannot express this arm
— its policies are sweep-compare registry policies, not
the nighttravel+woodcarry+woodwarm strand stack, and the
23-metric contract has no strand-length / recovery-cost /
conversion metrics (same standing as sim-fedexile-b and
sim-tickbudget-b). The §15 compare attached to this
evidence is the paired compare .md written by
scripts/analyze-strandfix-morning-b.js (per-seed paired
control-vs-variant on the pre-registered metrics +
guardrail metrics: survival, death causes, wave reach),
with this deviation stated on its face. Running the
official driver on a different stack / horizon would
measure a different question and is NOT done as a
substitute. The compare .md is never presented as an
official panel run.

## Proof

scripts/test-strandfix-morning-b.js: 26/26 checks pass on
the judged corpora, including: pure strand-gate cases;
BFS target choice (adjacent stance, path-length primary,
kind tie-break, walled-ring stance, bush stance, no-wood
null); verb floors (fell 80 kcal / 96 ticks / fell-cap 2,
brush 40 kcal / 32 ticks below 80); raw-gate classification
for all eight prereg classes + kcalLive fallback + null
handling; toolGate line-scan positives and negatives;
det-gate comparison function; corpus checks (10/10 seeds
on all 8 judged legs; errs 0 on every leg; det-gate OFF ==
fresh baselines on both legs; attempt-table coverage with
the first-morning rule; determinism byte-identical; src/
diff empty vs pinned base 7917b1d19; scripts/policies/
diff exactly the one new file).
Instrument notes (disclosed): (1) the first analyzer
invocation failed on the missing determinism directory
(the determinism leg had not run yet) before writing any
output; the determinism leg was then run (15215 variant ON
re-run, byte-identical) and the analyzer re-run — its
judgments were identical across both invocations, and only
the complete second run's outputs are judged. (2) The
proof's coverage rule was corrected after the confirm legs
(see Instruments) — no judged number changed. (3) The
strandfix driver's internal store variable retains the
template name pbStore; the store it holds is the strandfix
store (verified by the attempt counts in every leg log).

## Metric review

- Strand length in still evenings (vs days-to-return incl.
  the rescue day) is the right "exile days" unit here: the
  rescue day is a travel day, not a stuck night, and the
  evidence reports strand day-ranges so the reader can
  re-judge under either unit (control ON 7–16 + return
  day 17; variant ON 7–17 + return day 18; control guard
  7–9 + return day 10; variant guard 7–10 + return day 11).
  The falls are -1 under both units (the return day shifts
  with the strand).
- The "majority of strand legs" denominator resolution
  (prereg addendum note, stated here so the verdict can
  be re-judged): the prereg's bar text contains two
  clauses in tension — variant legs with no strand "do
  not enter the denominator" vs a variant leg with no
  strand "counts as a fall equal to the full control
  length". The evidence judges under the either-legs
  reading (denominator = pairs where either leg strands;
  elimination counts with fall = control length) AND
  reports the variant-strand-only reading alongside. On
  this run both legs strand on both sides, so the readings
  agree (0/2 under either) and the resolution does not
  affect the verdict. A future prereg should pick one
  clause and delete the other.
- The converted-both-evening bar's strict reading (class
  exactly 'both', not ticks-plus-both) is what is judged:
  converted ticks-plus-both totals 0 on both legs too, so
  the strict-vs-loose choice does not affect this verdict
  either. A future prereg should still state the class
  set explicitly, since a run with an all-three conversion
  and no both conversion would hinge on it.
- The food phase's both -> wood-only conversions are the
  run's one metric-design caution: a future prereg that
  counted gate-narrowing as progress would call this arm
  a partial success, but the bars as written count only
  rescues — and the strand lengthened, so no honest
  re-scoring rescues the verdict. Gate-narrowing belongs
  in the evidence as a mechanism note (it is, §4/§6), not
  as a verdict input.
- The first-morning coverage rule (day-7 mornings are
  haven departure mornings, actionable only from day 8)
  is a standing property of any previous-evening-gated
  morning behavior, not a quirk of this policy: pressb,
  fedexile, and tickbudget all share it, and every future
  morning-behavior prereg should state it in the bar
  rather than discovering it in the proof.
- The walk-at-0-kcal clamp (microMove costs recorded as 0
  kcal when kcal is already 0) means wood-phase kcalSpent
  understates walk cost on starving mornings by up to 6
  kcal (3 steps x 2). The evidence reports the recorded
  (clamped) number and names the clamp; no verdict hinges
  on 6 kcal, but a future cost table should quote
  walkStepKcal x steps alongside the recorded delta.
- No metric revision is proposed for the raw-gate classes,
  the det-gate, or the GO bars: they separated the gates
  cleanly (food vs tool vs time vs kcal-floor), which is
  exactly why the verdict can say the recovery feeds
  (E 1,530, nets +1,410) and walks (10 steps recorded)
  without ever converting a both-evening — instead of
  just "NO-GO".

## Out-of-scope findings (NOT chased; for the coordinator's backlog)

- [open] 2026-10-31 — food-economy/tool-gate — MORNING
  WOOD-SEEK NEEDS AN AXE IN HAND (this arm): on 15215
  strand mornings the villager's Stone knife (whittle
  tier) cannot fell (needs axe tier) or prune (needs
  saw/axe tier), the wake tile holds 0 bushes, and
  prune/gather yield branch material, not pack wood — so
  no engine verb yields pack wood until an axe-tier tool
  arrives (day 17, mechanism unrecorded). Morning
  wood-seek designs must budget the tool gate before kcal
  or ticks matter. (evidence: this file, §§1, 5, 6.)
- [open] 2026-10-31 — food-economy/tick-budget — FELL
  COST STRANDS THE ONE MORNING IT SUCCEEDS (this arm,
  variant ON day 17): the fell's 96 ticks leave 32 ticks
  after the wood phase, and the routine spends 9 more,
  ending at 23 < 96 with a full pack (5 logs) and 2278
  kcal. A morning behavior that spends a day-part on wood
  must budget ticks against the evening bridge, not just
  kcal against the fell. (evidence: this file, §5.)
- [open] 2026-10-31 — instruments — AXE ARRIVAL
  UNRECORDED BETWEEN STRAND DAYS 15 AND 17 (this arm):
  the villager's woodcut tier rises from whittle (Stone
  knife, days 10–15 hint lines) to fell-capable (day 17
  fell succeeds) with no bearer death and no inventory
  record in this corpus. A future arm that judges tool
  gates must record cutInfo / inventory per morning, or
  the arrival mechanism stays a gap. (evidence: this
  file, §§1, 5.)

## Files

- Prereg: evidence/2026-10-30/sim-strandfix-morning-b-prereg.md
  (commit b13a5825e); addendum:
  evidence/2026-10-30/sim-strandfix-morning-b-prereg-addendum.md
  (commit 3e4a9692c)
- Evidence (this file): evidence/2026-10-30/sim-strandfix-morning-b.md
- Policy (new, default-OFF): scripts/policies/strandfix-morning-diag.js
- Driver: scripts/strandfix-trace-b.js; analyzer:
  scripts/analyze-strandfix-morning-b.js; proof:
  scripts/test-strandfix-morning-b.js (26/26)
- Census + paired compare: evidence/2026-10-30/
  sim-strandfix-morning-b-census.json,
  sim-strandfix-morning-b-compare.md
- Fresh baselines (woodday driver): evidence/2026-10-30/
  sim-strandfix-morning-b-corpus-base-guard, -base-on
- Control legs (kcalshort driver): evidence/2026-10-30/
  sim-strandfix-morning-b-corpus-control-guard, -control-on
- OFF det-gate legs (strandfix driver, STRANDFIX=0):
  evidence/2026-10-30/sim-strandfix-morning-b-corpus-off-guard,
  -off-on
- Variant legs (strandfix driver, STRANDFIX=1):
  evidence/2026-10-30/sim-strandfix-morning-b-corpus-variant-guard,
  -variant-on
- Pilot (gate-only, never mixed into judged corpora):
  evidence/2026-10-30/
  sim-strandfix-morning-b-corpus-pilot-on-variant
- Determinism: evidence/2026-10-30/
  sim-strandfix-morning-b-corpus-determinism (15215 variant
  ON re-run, byte-identical)
