# sim-strandfix2-b — evening flip-bank + morning pack-eat: NO-GO

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261031T0741Z,
arm sim-strandfix2-b, axis food-economy. Worktree sim-strandfix2-b.
POLICY PROTOTYPE ONLY: one new policy file, zero edits to any existing
policy file, zero src/js changes, zero policy-default flips. Sibling
trees never touched; main tree never touched. Nothing is merged by this
worker (the coordinator merges); do NOT push, bump, or verify live.

## Prereg (binding; committed BEFORE any judged leg)

evidence/2026-10-31/sim-strandfix2-b-prereg.md (commit ff58d1bf4).
Pinned base e1e0052ba (worktree HEAD at prereg writing time; the prereg
commit adds evidence only, so all legs run on pinned-base game code
verbatim plus the new files below, which the proof's tracked-diff guard
does not need to re-prove here because no existing file was touched —
verified by git status: only new files in the instruments commit).
Instruments commit d2d47036 (policy + driver + analyzer + proof, pure
11/11 at commit time).

Primary metric: the stranded-evening census on seed 15215, guard + ON
legs, extracted exactly as in tickfell-a (still = woodcarry bucket
creek + rescued false; rescued = bucket creek + rescued true; strand
= maximal run of still evenings on consecutive loop-days;
both-evening = a loop-day still on BOTH control legs).
Prevention-counts restatement (from the prereg, in the arm's own
words): a both-evening counts as converted if the variant leg
PREVENTS it (no creek still evening that day because the strand ended
earlier through a recorded flip-bank / pack-eat chain) as well as if
rescued same-day; a prevented day counts only with a recorded causal
link, and the GO bar is written on still-count FALL, so a single tail
rescue that leaves the count unchanged cannot pass.

## Instruments (new, this arm only)

- scripts/policies/strandfix2-diag.js — the prototype (env-gated
  STRANDFIX2=1/0). Morning: stranded-morning gate as prior arms; if
  pack food kcal > 0, Game.eat() once, nothing else (no walk, no
  forage, no fell — position preserved exactly). Evening: after
  inner.daily (bridge decision + warmth fire already ran), on a still
  creek evening only — clock >= 449: last-light bank (up to 2
  forages); clock <= 448 and 449 - clock <= 80: flip-bank (BFS walk
  to a gather stance + gatherFallen until branches >= 2, then forage
  presses, until clock >= 449 or 5 verbs); clock <= 448 and needed >
  80: skip 'flip-too-far'. One honest say line per acted evening.
  Never calls travelTo, buildBridge, takeWood, cutTree, clearBrush.
- scripts/strandfix2-trace-b.js — driver adapted from
  strandfix-trace-b.js with ONLY the prereg-disclosed changes
  (wrapper swap, STRANDFIX2 + PRESSB FATAL gates, store attach as
  row.sf2Morning / row.sf2Evening, fullDaySay on still evenings, on
  flip-bank evenings, and on morning-eat mornings, file naming).
- scripts/analyze-strandfix2-b.js (pure reads: strand extraction,
  both-evening table with causal links, fall, det-gate, guardrails).
- scripts/test-strandfix2-b.js (proof, 17/17 — see Proof).
- §15 panel: not applicable, as declared in the prereg and by every
  prior strand arm — scripts/balance-panel.js runs sweep-compare
  registry policies on 150-day horizons with its own scorecard; it
  cannot express the nighttravel+woodcarry+woodwarm strand stack, the
  30-day creek-evening census, or an env-gated single-mechanism
  probe. The comparison here is control-vs-variant legs on identical
  seeds through the census analyzer, and is never labeled a panel
  comparison. The paired compare is evidence/2026-10-31/
  sim-strandfix2-b-compare.md, generated from the census JSON
  (evidence/2026-10-31/sim-strandfix2-b-census.json).

## Verdict: NO-GO (judged exactly against the prereg)

| clause | bar | result |
|--------|-----|--------|
| (a) still-count fall >= 2 on >= 1 leg, causally linked | guard fall 0; ON fall -1 (lengthened) | FAIL |
| (b) no strand lengthening, either leg | guard 3 -> 3, maxRun 3 -> 3 PASS; ON 10 -> 11, maxRun 10 -> 11 FAIL | FAIL |
| (c) guardrails | ticks-short unchanged (1, day 7, both legs) PASS; non-strand still counts unchanged PASS; deaths: ON day unchanged (17 = 17) PASS, but guard variant introduces a vessel death day 23 ('the night') where its control leg has none — FLAG, see §5 | FAIL (flag) |

Both-evenings (7, 8, 9) stay still on BOTH variant legs: conversions
0, preventions 0. The design's two working halves (flips fire,
branches persist) never meet a gate they can open, and its food half
never fires at all (0 morning eats on every variant leg). The ON
strand does not shorten — it gains a night.

## Pilot gate (before any confirm spend) — PASS on instrument function

8 seeds, ON variant leg only, into
sim-strandfix2-b-corpus-pilot-on-variant: 8/8 files present, errs 0,
all 8 seeds survived 30 days, every 15215 ON still evening carries an
sf2Evening record (acts or skips with clock + reason), 5 evening acts
on 15215. Pilot files are NEVER mixed into judged corpora. The pilot
already surfaced the two findings the confirm legs then judged (§4):
banked pack food vanishes by morning (0 morning eats), and branches
persist to the next night's warmth gate.

## 1. THE STRAND SET RE-DERIVED (this arm's own control legs)

Zero drift from tickfell-a / lackingline on the control legs:

| leg | creek | still | rescued | strand (15215) | ticks-short |
|-----|-------|-------|---------|----------------|-------------|
| guard control | 4 | 3 | 1 | nights 7-9 | 1 (day 7) |
| ON control | 10 | 10 | 0 | nights 7-16 | 1 (day 7) |
| guard variant | 4 | 3 | 1 | nights 7-9 | 1 (day 7) |
| ON variant | 11 | 11 | 0 | nights 7-17 | 1 (day 7) |

Per-seed control tables (census JSON): every other seed's creek
evenings are all rescued or absent, on every leg (15003 1/0/1, 15091
1/0/1, 15211 2/0/2, 15337 1/0/1, both legs; 15009, 15220, 15221 have 0
creek evenings). All 8 seeds survived 30 days on every judged leg;
errs 0 on all legs. DET-GATE: the OFF legs reproduce the kcalshort
control legs EXACTLY on per-seed creek/still/rescued counts and still
days, on BOTH legs (analyzer detGate match=true, mismatches=[]).
The instrument is proven behavior-neutral when OFF.

## 2. THE JUDGED LEGS, EVENING BY EVENING (seed 15215)

Guard variant (warmth OFF, so no warmth spend anywhere):

| day | control | variant | variant evening act |
|-----|---------|---------|---------------------|
| 7 | still, ticks-only (4 logs, 2254 kcal, 47 left) | still, ticks-only | bank: 2 forages, clock 465 -> 465 (foodless 3x3, 0 ticks, 0 yield) |
| 8 | still, kcal-only | still, kcal-only | skip flip-too-far (clock 273, needed 176) |
| 9 | still, kcal-only | still, kcal-only | FLIP: walk + 2 gathers + forage, clock 403 -> 453, branches 0 -> 2, pack 0 -> 720 |
| 10 | rescued | rescued | — (not still; morning pack 0, the 720 banked the night before is gone) |

ON variant (warmth ON):

| day | control | variant | variant evening act |
|-----|---------|---------|---------------------|
| 7 | still, ticks-only | still, ticks-only | bank: 2 forages, clock 465 -> 465 (0 yield) |
| 8 | still, kcal-only | still, kcal-only | skip flip-too-far (post-warmth clock 321) |
| 9 | still, kcal-only | still, kcal-only | bank: 2 forages, clock 451 -> 467 (already flipped by warmth), pack 0 -> 540 |
| 10 | still, wood-only | still, wood-only | skip flip-too-far (clock 322) |
| 11 | still, both | still, both | bank: 2 forages, clock 449 -> 449 (already flipped; 0 yield — patch picked clean) |
| 12 | still, both | still, both | skip flip-too-far (clock 321) |
| 13 | still, both | still, both | bank: 2 forages, clock 450 -> 466 (already flipped), pack 0 -> 630 |
| 14 | still, wood-only | still, wood-only | skip flip-too-far (clock 322) |
| 15 | still, both | still, both | FLIP: walk + 2 gathers + forage, clock 402 -> 453, branches 0 -> 4, pack 0 -> 810 |
| 16 | still, both | still, both | skip flip-too-far (clock 274); warmth MISSES branches-available (branches 4 persist) |
| 17 | (no creek evening — vessel dies day 17) | still | skip flip-too-far (clock 273); warmth MISSES branches-available; vessel dies day 17 'the wild', as on control |

Morning eats: 0 on the guard variant leg, 0 on the ON variant leg,
0 on every other seed's variant legs — the morning phase never fires
once in the entire confirm band, because morning pack food is 0 on
every stranded morning (see §4).

## 3. THE BOTH-EVENING TABLE (judged, with causal links)

| day | guard variant | ON variant | link (recorded act before / eat that morning) |
|-----|---------------|------------|-----------------------------------------------|
| 7 | still | still | none (d7 evening bank acts exist, but they are the evening OF day 7, not before it; no morning eat day 7 — first strand morning is a haven-departure morning, prev-not-stranded) |
| 8 | still | still | evening act recorded (d7 bank forages) — but the bank yielded 0 food, so the link is to an empty act, not to a rescue; morning eat day 8: none (pack 0) |
| 9 | still | still | none (d8 evenings skip flip-too-far on both legs) |

No both-evening is rescued, none is prevented, and the strand-ending
link check finds no strand ending on either variant leg (guard strand
ends day 10 on both legs by the control leg's own rescue; ON strand
ends on neither leg within the window — it runs longer on variant).

## 4. WHY IT FAILS: THREE PRICED FINDINGS (measured, not inferred)

(a) BANKED FOOD DOES NOT SURVIVE THE NIGHT. Evening banks of 540
(ON d9), 630 (ON d13), 720 (guard d9), 810 (ON d15) kcal — Muscadine
Grapes, Hickory Nuts, Burdock, all known-edible — read pack 0 on the
very next morning, with morning scholar kcal still 0. The food is
gone without being eaten into scholar kcal (evening kcal 356/634
likewise reads 0 by morning: overnight metabolism takes the stomach,
and something in the night — endDay/sleep handling — takes the pack
with it; the corpus records the disappearance, not its internal
mechanism, and no mechanism is guessed here). Consequence: the
morning pack-eat phase is structurally inert — not under-powered,
inert. Previous-evening food, in pack or stomach, cannot feed the
next morning. Any future fed-morning design must source its food in
the morning itself (the selecttrim press position) or at haven
departure (a pack-food carry alongside the wood carry — named next,
not built here), never the night before.

(b) THE FLIP FIRES BUT OPENS NOTHING AT WOOD < 4. The two true
flips (guard d9: 403 -> 453; ON d15: 402 -> 453) both deliver roomy
next mornings (256 ticks left, confirmed on d10 guard / d16 ON
morning records). Guard d10 was already rescued on control, so the
flip changes nothing there. ON d16 is wood 0 — roomy, fed (evening
kcal 630, morning 0, routine-fed during the day), and still
wood-blocked; a bridge needs 4 logs and no flip manufactures one.
The waitsalign lesson cuts the other way here too: most still
evenings sit at post-warmth clocks 321-322 or 273-274 (needed 127+
or 175+), outside the 80-tick flip window — only the ~401-403
evenings are flippable, and those are exactly the evenings where
warmth already failed or the fire already flipped the night.

(c) BRANCHES PERSIST AND BLOCK WARMTH — A REAL, SMALL EFFECT THAT
DOES NOT RESCUE. Branches gathered d15 (0 -> 4, plus bark strips)
are still 4 on d16 and d17 mornings, and warmth misses
'branches-available' on both nights — the ON leg's wood-bleed stops
once branches exist. But it stops too late: warmth successes on d8-d14
already walked wood 4 -> 0, and branches cannot restore logs. The
guard leg (warmth OFF) shows the same gathers working (0 -> 2 on d9)
with no wood effect at all, since there is no warmth spend to block.
Branch preservation is a genuine mechanism, proven twice, whose
rescue value is zero on this strand because the wood it protects is
already gone by the time it can be gathered (the first flippable
evening is d9 guard / d15 ON, after the bleed).

(d) THE ON STRAND LENGTHENS BY ONE NIGHT (the cost side). Variant
ON still days run 7-17 vs control 7-16. The d15 flip gives a roomy
d16 morning; the d16 routine keeps the villager out one more night
(d17 still evening, warmth blocked by branches, wood 0), and the
vessel still dies day 17 'the wild' exactly as on control. The design
does not merely fail to shorten the strand — on the ON leg it keeps
the villager stranded through the night the control leg's succession
had already ended the strand by. (On control, d17 has no creek
evening because the vessel's day-17 death/succession intervenes; on
variant the vessel reaches a d17 still evening first.)

## 5. GUARDRAILS AND ADVERSE TRAJECTORIES (reported, not hidden)

- Ticks-short: unchanged on both legs (1 still evening, day 7, both
  legs, both arms). The design creates no new time failure anywhere
  on the band — its evening spends run after the bridge decision, so
  they cannot create a ticks-short evening by construction, and the
  census confirms it.
- Non-strand seeds: creek still counts unchanged on all 7 other
  seeds, both legs. No spillover.
- Deaths: ON vessel death day 17 'the wild' on both legs (unchanged).
  GUARD FLAG: the guard variant vessel dies day 23 'the night'
  (inside haven, kcal 2110, evening completed) where the guard
  control vessel never dies in 30 days, and 'the night' appears as a
  vessel-death cause on no control leg. The death is 13 days after
  the strand ends and 14 days after the last flip-bank act; whether
  it is lever-caused or RNG-stream divergence (evening verbs draw
  the engine's yield lotteries, shifting every later lottery — the
  selecttrim RNG-stream effect, same class) cannot be separated on
  one seed. It is reported as a guardrail flag under the prereg's
  strict reading (a vessel death where control has none), and the
  verdict does not rest on it: clauses (a) and (b) already fail.
- Wave reach (observed, NOT attributed): control legs maxWave 1
  (guard waveKills 1:5, ON 1:6); variant legs maxWave 2 (guard
  1:7/2:2, ON 1:11). Post-strand trajectory divergence on one seed
  is not a lever-effect claim, and wave reach is not a GO input on a
  30-day strand census; it is recorded so the coordinator does not
  mistake it for a wall movement.
- Wall numbers: on a 30-day pre-seat census, national / table / wins
  are NOT observable — stated plainly, not fabricated. Median
  survival is 30 days on every leg (all seeds survived 30 days);
  that is a census boundary, not a survival finding.

## 6. SENSE TEST (law — read end to end)

The acted evenings ARE narrated, and the narration is honest about
the work — but false about the bank, which is the sense failure:
- Guard d9 flip: "You gather fallen limbs from under the tree. +1
  branch +1 bark strip. Slow, but free." (x2), the patch line ("You
  work the patch: 19x Hickory Nuts, 8x Muscadine Grapes ... This
  patch is picked clean"), then "You work late at the creek — 2
  deadfall gathers and 1 forage — until the night is too far gone
  for real sleep. What you banked waits for morning." The gathers,
  the patch, and the late night are all true. "Waits for morning" is
  false as measured: morning pack is 0. A player reading that line
  would expect morning food and find none — the line promises what
  the night takes away. Any future version of this design must not
  carry that clause unless banking is proven to survive the night.
- ON d15 flip reads the same way (gathers + "You work the patch:
  9x Burdock ..." + the flip line). The branch persistence IS
  visible the next nights only indirectly (warmth misses are not
  narrated as a line — the fire simply does not light; the corpus
  records the miss, the transcript does not explain it. A player
  would notice only the absence of a fire line on nights that used
  to have one.)
- Morning eats: nothing to read — the phase never fires, so no
  morning narration exists to judge. A conversion with no narration
  would have been a sense failure; here there is no conversion at
  all, so the sense verdict is: acts narrated, bank promise false,
  morning phase silent by non-firing.

## 7. METRIC REVIEW (revisions apply to the NEXT run, never mid-run)

- Answered, Q1 (prereg): evening forage DOES yield bankable food on
  a known patch (540-810 kcal on flippable/bank evenings) — but the
  bank does not survive the night, so the question's premise was
  wrong in the deeper sense: the binding constraint is not yield,
  it is overnight persistence. The morning pack-eat half of this
  design is dead, not under-powered.
- Answered, Q2 (prereg): branches gathered in the evening DO survive
  the routine to the next night's warmth gate (4 -> 4 across d16/d17
  ON) — branch preservation is proven, and its rescue value is
  zero on this strand for the timing reason in §4(c).
- Confirmed, Q3 (prereg): a flipped morning converts to a bridge
  only at wood 4 — and no flipped morning on either leg held wood 4
  with a failing bridge (guard d10 already rescued; ON d16 wood 0).
- NOT re-barred: the fall >= 2 bar stands as written. A fall of 0
  (guard) and -1 (ON) is NO-GO under any honest reading; no
  re-scoring against "flips fired" or "branches persisted" is
  attempted, because the prereg binds the run and those are
  mechanism observations, not the judged outcome.
- Named next (for the coordinator, not built here): the fed-morning
  problem must be solved where food actually persists — morning
  acts at a known patch (selecttrim's preserved walk/press) or a
  haven-departure pack-food carry (the wood-carry pattern, for
  food). Evening banking is closed as a route: both pack and
  stomach food are gone by morning.

## Proof

- scripts/test-strandfix2-b.js: 17/17 GREEN (11 pure + 6 corpus:
  pilot 8 files, errs 0, records complete; confirm 6 legs x 8 files;
  det-gate both legs; variant records complete on 15215 still
  evenings).
- Determinism: ON variant leg re-run into
  sim-strandfix2-b-corpus-on-variant-det: byte-identical on all 8
  files (cmp clean).
- Det-gate: OFF legs byte-compare equal to control legs on every
  per-seed creek/still/rescued count and still-day list, both legs.
- Corpora: pilot sim-strandfix2-b-corpus-pilot-on-variant;
  confirm sim-strandfix2-b-corpus-{guard,on}-{control,variant,off};
  determinism sim-strandfix2-b-corpus-on-variant-det; census
  sim-strandfix2-b-census.json; compare
  sim-strandfix2-b-compare.md. All under evidence/2026-10-31/.
- Pinned base e1e0052ba; prereg commit ff58d1bf4; instruments
  commit d2d47036; evidence + census + compare + corpora in the
  final commit below (all on branch sim-strandfix2-b, for the
  coordinator to merge).

## Out-of-scope findings (appended by the coordinator, not chased here)

None chased mid-run. The overnight pack-food disappearance (§4a) is
the one mechanism finding that outlives this arm: if the engine
eats pack food overnight by design, every "bank food for later"
design in the backlog needs re-pricing; if it is a strand-trajectory
artifact (succession-adjacent inventory handling), it needs its own
isolation arm. Either way it is filed here, not fixed here.
