# sim-bankfood-a — banked evening food vanishes? NO-GO (vanish does not reproduce; banks retain)

Run: oversight-flesh-out-loop, run fleshout-20261104T1445Z, arm
sim-bankfood-a (arm 1 of 2), axis food-economy. Worktree sim-bankfood-a.
Backlog item #1610 (open since 2026-10-31, evidence/2026-10-31/
sim-strandfix2-b.md, NO-GO). POLICY-SIDE ARM ONLY: one new policy file
(bankfood-diag.js), one new driver, one analyzer, two diagnostic
probes, one proof test; zero edits to any existing policy file, zero
src/js changes, zero policy-default flips. Sibling trees never
touched; main tree never touched. Nothing is pushed, bumped, or
live-verified by this worker (coordinator merges via --ff-only);
report 'merged locally, pending ship' readiness.

## Prereg (binding; committed BEFORE any judged sim)

evidence/2026-11-04/sim-bankfood-a-prereg.md (commit 65f1256b8),
plus evidence/2026-11-04/sim-bankfood-a-prereg-addendum.md (commit
ad21008eb, committed BEFORE the wider sweep — see §1 for why the
gate changed and why the pilot numbers stand).
Pinned base 03844d5a5 (worktree HEAD at prereg writing time).
Instruments commit 9630886d (policy + driver + analyzer + proof +
probes); driver-upkeep fix a45f5c15 (the trace driver's policy
object bypassed the wrapper's upkeep, so the true-morning snapshot
never fired — caught on the smoke seed, fixed, re-verified).

Primary metric: share of evening-bank events (variant legs, evening
bank kcal > 0 recorded post-bank) whose kcal is still in the
canonical pack at the next true morning (pre-daily snapshot), PLUS
morning pack-eat firings on stranded mornings.
GO for "reproduced": vanish on >= 2 seeds with a traced mechanism
(bank > 0, next-morning canonical pack 0, morning scholar kcal not
accounting for it, mechanism stage named). GO for "fix lands": fix +
proof test green + pilot re-run retention on reproducing seeds +
median death-day delta >= -5d. No reproduction on the 16-seed wider
sweep => INSUFFICIENT-DATA (but see Verdict: the sweep did NOT come
back empty, so the verdict below is NO-GO on positive evidence,
not an empty-sample INSUFFICIENT-DATA).

Panel note (§15, as in every prior strand arm):
scripts/balance-panel.js cannot express the nighttravel+woodcarry+
woodwarm strand stack, the 30-day evening census, or an env-gated
single-mechanism probe. Comparison here is control-vs-variant legs
on identical seeds through the census analyzer, never labeled a
panel comparison.

## Verdict: NO-GO (the vanish does not reproduce)

| clause | bar | result |
|--------|-----|--------|
| Vanish reproduces, >= 2 seeds, traced mechanism | >= 2 seeds with bank > 0 -> morning pack 0, mechanism named | 0 seeds, 0 events: 8/8 banked events with a following morning RETAINED (see §3). FAIL (the claim, not the instrument) |
| Fix lands | fix + proof green + retention + death-day delta >= -5d | No fix: nothing to fix. The engine behavior is correct; the old finding's premise was wrong (see §4). N/A |
| Guardrails | median death-day delta >= -5d | Variant vs off survival IDENTICAL on all 16 seeds x 2 legs (daysAlive + endReason match exactly). PASS (neutrality proof) |

## 1. THE BANK SET, RE-DERIVED (the pilot's real finding)

The original gate (woodcarry.bucket === 'creek', travel-refused)
never fires on current master: 0 creek-bucket evenings on all 16
pilot leg-seeds (8 seeds x guard + ON), confirmed by TWO
independent drivers (bankfood OFF legs and strandfix-control legs
agree exactly on every seed, including survival/endReason).
This is the #1647 warning, verified: the old strand set is empty.

What DOES occur on current master is a different stranding:
nighttravel 'out-of-reach' (haven not offered at all, so no hop is
even attempted), scholar sleeping away at a field tile for
multiple nights. Seed 15003: 9 away evenings at a creek tile (map
1,7, loop-days 22-30; day 22 'blocked-combat', then 'out-of-reach').
Seed 15376: 4 away evenings. The other 14 wider-sweep seeds: 0
away evenings. The prereg addendum widens the evening/morning
gates to this re-derived stranded-away population (nighttravel
outcome in {travel-refused, out-of-reach} + away position; the
woodcarry bucket is recorded when present but never required).
GO thresholds are unchanged; the pilot's 0-event result under the
ORIGINAL gate stands as reported and is never rewritten.

## 2. DIRECT PROBES (diagnostic, not judged sims)

Two no-policy probes, seed 15215, canonical pack snapshots at
every stage (pre-sleep, post-sleep/post-roll, post-upkeep x3,
post-eat):

- Known-edible probe (720 kcal Muscadine-style stack, spoilDay
  day+2, plus an in-shell nut stack): pack 2120 -> 2120 across the
  night in BOTH the normal-sleep variant and the late-band variant
  (dayTicks >= 449, sleep refuses, wait rolls the day). The engine
  does NOT take pack food overnight. Upkeep competentEat then eats
  the starting pack food (2120 -> 800, scholar to cap) — that is
  normal eating, visible in scholar kcal, not a vanish.
- Lump probe (engine-made unknown lump, 14 units, spoilDay day+2):
  lump 14 -> 14 across the night AND across 3 upkeep cycles, in
  both variants. Upkeep does not touch lumps.

Conclusion from probes alone: overnight engine handling removes
neither known food nor lumps. Any in-stack vanish would have to
come from the stack path — which the pilot/wider sweep then
tested directly.

## 3. THE WIDER SWEEP (16 seeds, guard + ON, off + variant)

Corpora: evidence/2026-11-04/sim-bankfood-a-corpus-{guard,on}-
{off,variant} (16 files each, 64 total); censuses
sim-bankfood-a-census-{guard,on}.json. Proof test corpus mode:
184/184 green (files present, errs 0, det-gate).

Stranded-away seeds: 2/16 (15003: 8 away evenings; 15376: 4).
Bank events (evening acts on stranded-away evenings): 9 per leg
(guard and ON agree exactly). Of those, 8 banked (post-bank pack
> 0) with a following morning in the horizon; 1 (15003 loop-day
30: 195 kcal known Blackberry + 9 lump units) falls on the final
census day and has no following morning — CENSORED, not judged.

Retention chain, per banked event (post-bank canonical pack ->
first-upkeep pack = true post-sleep morning -> daily-entry
morning-phase packBefore):

| seed/loop-day | post-bank | first-upkeep | morning-phase | verdict |
|---|---|---|---|---|
| 15003/25 | lump 7 | lump 7 | lump 7 | RETAINED |
| 15003/26 | lump 7 | lump 7 | lump 7 | RETAINED |
| 15003/27 | lump 7 | lump 7 | lump 6* | RETAINED (see note) |
| 15003/29 | lump 6 | lump 6 | lump 6 | RETAINED |
| 15376/8 | lump 27 | lump 27 | lump 27 | RETAINED |
| 15376/9 | lump 33 | lump 21* | lump 21 | RETAINED, partial spoil (see note) |
| 15376/10 | lump 27 | lump 27 | lump 27 | RETAINED |
| 15003/30 | edible 195 + lump 9 | — (no day 31) | — | CENSORED |

* Notes: (a) 15003/27 morning lump 6 vs first-upkeep 7: one
unknown-nuts unit leaves between the true morning (pre-upkeep)
and the daily-entry morning, i.e. during the upkeep cycle; the
responsible upkeep verb is not traced, and the true-morning
snapshot already shows 7 — this is not an overnight loss. (b) 15376/9: post-bank lumps were berries 12 @ spoilDay 10,
shoots 10 @ 12, roots 6 @ 16, nuts 5 @ 68; at dawn day 10 the
berries form (spoilDay 10 <= day 10) is swept by the engine's
documented dawn rule while the other three forms persist — a
per-form spoil-clock sweep, announced by design, not a vanish:
21 of 33 units remain, all forms with later clocks intact. A
fresh berries lump foraged day 10 (spoilDay 12) then survives
dawn day 11 intact.

Vanished at first upkeep: 0/8. Vanished at morning: 0/8.
Vanished with scholar kcal 0: 0/8. Morning pack-eat firings: 0 —
but the cause is now traced, not mysterious: morning edible pack
is 0 on every stranded morning because the banks contain no
edible-now food (unknown lumps, inedible until identified). The
phase's precondition is never met. The single edible bank (195
kcal) has no following morning to fire on.

Flips: every flip-mode evening moved the clock only +18-19 ticks
(walk + gathers + presses on picked-clean patches cost ~0 ticks)
and none reached 449 (flipped: false everywhere). Stranded
evenings end at clocks 139-404; most are flip-too-far outright.
The flip half is inert on this population, as it was on the old
one — the flip does not manufacture evening time.

## 4. WHY THE OLD FINDING DOES NOT REPRODUCE (measured, not inferred)

(a) THE OLD BANKS WERE NOT KNOWN-EDIBLE BANKS. The 2026-10-31
corpus action records (re-read for this arm) show the bank
forages yielding ONLY unknown units (14/16/18/5 units of
"unknown shoots/berries/nuts") — the press estimate E (540/630/
810/720) is not edible-now pack kcal. The old evidence's
"known-edible" names came from say lines (believed names), while
the stacks were lumps. A morning pack-eat phase gating on
edible-now food could never fire on such a bank — and on current
master it never does (0 firings), for exactly that reason.

(b) THE OLD PACK READING CANNOT BE RECONCILED WITH A CANONICAL
READ. The old strandfix2 policy file never landed on master, so
its evening pack estimator is unrecoverable; what is certain is
that evening packAfter equaled the press estimate E exactly in
all four banks while morning packBefore read 0 under an
unrecorded estimator. This arm's instrument closes that hole by
recording the canonical inventory snapshot (edible / gross /
lump split) at every stage — and under canonical reads, nothing
vanishes.

(c) WHAT DOES REMOVE PACK FOOD OVERNIGHT IS ONLY THE DOCUMENTED
SPOIL CLOCK, per form. Fresh banks (spoilDay = forage day + 2)
survive the next dawn by the rule's own arithmetic; only a form
whose spoilDay has arrived is swept, with the other forms
untouched (§3 note b). The old banks, foraged fresh on their
evenings, cannot have been swept the next dawn under this rule.

(d) THE OLD STRAND POPULATION IS GONE. The travel-refused creek-
bucket evenings that framed the old finding do not occur on
current master at all (0/16 pilot leg-seeds, two drivers). The
finding's stage no longer exists; its re-derived replacement
(out-of-reach strands) retains banks.

Consequence, stated plainly: "What you banked waits for morning"
is still not a line any design may carry — not because the night
takes banked food, but because stranded banks are unknown lumps
that morning pack-eat cannot eat. A fed-morning design must source
its food in the morning itself (the selecttrim press position) or
at haven departure (a pack-food carry alongside the wood carry),
never the night before — the same named-next as 2026-10-31, now
with the mechanism proven rather than guessed. The one open
sub-question: known-edible bank retention in-stack (1 censored
event, 195 kcal, no following morning) — a longer horizon or a
mid-strand edible bank would settle it; the probes already show
known food surviving sleep + upkeep in isolation.

## 5. VILLAGE ASSESSMENT (plain words)

On the two stranded seeds, the story reads like a genuinely bad
week, not a robot loop. On 15003 the scholar is stuck at a creek
tile for nine nights, slowly starving (morning kcal 2310 -> 447
across the strand), gathering deadfall, working picked-clean
patches, and looting a dead villager's kit mid-strand (+18
trauma). The narration is honest throughout: unknown finds are
called unknown ("Not food until identified — sort them at camp"),
the late-work line promises no morning food, and the one known
haul (Blackberry, day 30) is named as known. The morning phase's
silence is honest too — there is no edible food, so there is no
eat line to fake.

On the other 14 seeds the scholar never leaves haven at all in
30 days — and on three seeds (15003, 15091, 15215) the village
dies out around a scholar sitting at haven at ~2300 kcal, with
villagers starving days 14-20. That homebound-while-the-village-
starves pattern is NOT this arm's question and is NOT chased
here, but it is the reason the bank set is so small: most seeds
never strand, because most scholars never go out. It is filed
below as a new finding.

## 6. REACHABILITY / WALL NUMBERS (observed, NOT attributed)

A 30-day strand census does not read national / table / wins —
stated plainly, not fabricated. What the corpus reads: median
survival 30 days (census boundary; 13/16 seeds at 30, village-
lost at 24/28/30 on 15003/15091/15215); maxWaveUnlocked 2 on 3
seeds, 3 on 13 seeds, identical on guard and ON legs. Wave reach
is NOT a GO input on a strand census and no lever-effect claim
is made from it.

## 7. SENSE TEST (law — read end to end)

- The late-work line ("You work late at the creek — N deadfall
  gathers and M forages — until the night is too far gone for real
  sleep") is honest: it names the work and promises nothing
  about morning. It deliberately does NOT carry the old flip
  line's bank clause.
- Forage narration on strand evenings is honest about unknowns
  (lump lines, "sort them at camp") and about knowns (Blackberry
  named with parts/uses on deeper knowledge).
- Morning eats: nothing to read — the phase never fires, so no
  morning narration exists to judge. That silence is correct
  (no edible food), not a sense failure.
- One sense gap, small: the per-form dawn spoil sweep (berries
  swept while shoots/roots/nuts persist) is narrated only if the
  player happens to read the spoil line in the overnight log;
  the morning record shows the consequence (fewer lump units)
  without naming the form. A player counting lumps would notice
  the drop but not its reason. Filed below, not fixed here
  (voice-only, out of scope).

## 8. METRIC REVIEW (revisions apply to the NEXT run, never mid-run)

- The primary metric held: canonical pack at every stage is the
  right instrument, and the first-upkeep snapshot (true morning,
  before any upkeep eat) is the stage that settles the question.
  The old arm's single "morning pack" number conflated stages
  and estimators; future bank arms must keep the stage chain.
- The reproduced bar (>= 2 seeds with vanish) was the right bar
  and it failed cleanly on positive evidence — retention, not
  absence. No re-scoring was attempted against "flips fired" or
  "lumps persisted" as substitute wins; retention IS the result.
- The addendum gate change was a correction to the re-derived
  phenomenon, not a loosening: thresholds, horizon, and the
  no-gate-change rule are untouched, and the pilot's old-gate
  numbers stand unaltered. Future arms on re-derived sets should
  pre-register the gate as "stranded-away (outcome + position)"
  rather than reusing a census proxy that a base change can
  silently empty.
- Metric gap for the next run: the 30-day horizon censored the
  only edible bank (day 30). An edible-bank retention question
  needs either a longer horizon or a strand that starts earlier
  (seed 15376's strand starts day 8 — the shape to look for).
- NOT re-barred: the vanish bar stands. A future claim that
  banked food vanishes must meet the same stage-chain evidence.

## Proof

- scripts/test-bankfood-b.js: pure 22/22 GREEN (packSnap splits,
  pressTotals incl. the packSnap-lump-flag contract, gather BFS,
  stranding gates); corpus mode 184/184 GREEN on the wider guard
  corpora (files present + parse, bankfood errs 0, det-gate).
- Determinism note: variant vs off survival/endReason identical
  on all 16 seeds x 2 legs; guard vs ON censuses identical.
  No byte-determinism re-run was performed (not required: no
  game-code change, no fix landed).
- Det-gate: bankfood OFF legs reproduce independent strandfix-
  control legs exactly on all 16 pilot leg-seeds (creek/still/
  rescued counts, still-day lists, survival, endReason).
- Corpora: pilot + wider sweep under evidence/2026-11-04/
  sim-bankfood-a-corpus-{guard,on}-{off,variant} (16 files each),
  pilot strandfix controls sim-bankfood-a-corpus-{guard,on}-
  control (8 files each), censuses sim-bankfood-a-census-
  {guard,on}.json, sweep logs sim-bankfood-a-pilot-sweep.log and
  sim-bankfood-a-wider-sweep.log. All on branch sim-bankfood-a,
  for the coordinator to merge.
- Pinned base 03844d5a5; prereg 65f1256b8; instruments 9630886d;
  driver-upkeep fix a45f5c15; addendum + lump-flag fix ad21008eb;
  evidence + corpora in the final commit below.

## Out-of-scope findings (for the coordinator to append to the
findings backlog — NOT chased here, NOT edited into hidden_files
by this worker)

- [open] 2026-11-04 — out-of-reach strands — scholars strand away
  for multiple nights with nighttravel 'out-of-reach' (haven not
  offered); the old travel-refused creek-bucket census misses
  them entirely (seed 15003: 9 nights at creek tile 1,7; seed
  15376: 4 nights; sim-bankfood-a wider sweep).
- [open] 2026-11-04 — homebound scholar, starving village —
  seeds 15003/15091/15215 lose the village (starvation deaths
  days 14-20) while the scholar never leaves haven and sits at
  ~2300 kcal; 14/16 wider-sweep seeds never leave haven in 30
  days (sim-bankfood-a pilot + wider sweep).
- [open] 2026-11-04 — flip-band inert on re-derived set —
  stranded evenings end at clocks 139-404; flip acts move the
  clock +18-19 ticks and never reach 449; most evenings are
  flip-too-far (sim-bankfood-a wider sweep).
- [open] 2026-11-04 — per-form lump spoil sweep is silent at
  the point of counting — a dawn sweep removes one lump form
  (berries 12 @ spoilDay 10 at dawn day 10) while other forms
  persist; the morning record shows fewer lump units without
  naming the form (sim-bankfood-a, seed 15376).
- [open] 2026-11-04 — edible-bank retention in-stack unjudged —
  exactly one known-edible bank occurred in-stack (15003 day 30,
  195 kcal Blackberry) and it fell on the final census day with
  no following morning; probes show known food surviving sleep
  + upkeep in isolation, but in-stack edible retention needs a
  longer horizon or an earlier strand (sim-bankfood-a).
