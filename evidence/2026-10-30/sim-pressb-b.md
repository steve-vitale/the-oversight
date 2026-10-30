# sim-pressb-b — morning-press behavior: the bot eats breakfast it knows is there

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261030T1928Z,
arm sim-pressb-b, axis food-economy. Worktree sim-pressb-b.
POLICY-SIDE ARM ONLY: one NEW policy file
(scripts/policies/pressb-diag.js, env-gated, default off), zero
src/js changes, zero edits to scripts/policies/competent.js, no
competent-default flip in this arm. Sibling trees, claims, and
branches never touched. The main tree never touched.

## Prereg (binding; committed BEFORE any judged leg)

evidence/2026-10-30/sim-pressb-b-prereg.md (commit 61160f8b,
plus pre-leg amendment 50af90ae: replay comparators for ALL
control stranded field mornings, for the naive depletion table).
Pinned base c1b310c9614fa3f7f006da5c38ada73833134178 (worktree
HEAD at prereg time). Primary question (backlog #1553): on
stranded field mornings, does a competent-policy variant that
presses forage on the wake tile before traveling fire where
the food is and bank the proven yield, without breaking the
morning routine?
Bars (judged exactly as written; see Verdict for the one bar
whose definition the run itself proved incomplete):
(a) FIRE RATE >= 80% on denominator mornings (actionable
stranded + field wake + live pre-press sweep holding a known
food species); (b) BANKING RATIO >= 80% (variant pressE /
same-base replay proven E over corresponding control mornings,
comparator coverage 100%); (c) NO MORNING-ROUTINE REGRESSION
(no seed loses > 10 daysAlive, no new bearer death cause, no
worsened endReason, errs 0, evening row every loopDay, off-
target fires 0); (d) determinism re-runs byte-identical; proof
green. On GO the verdict is LAND CANDIDATE for the coordinator
— competent defaults are NOT flipped by this arm. The
coordinator's kill triggers (press fires but banks ~0, or the
routine breaks) are the substantive kill test; neither holds
(see below).

## Instruments

- Variant: scripts/policies/pressb-diag.js — withPressb(inner,
  store), PRESSB=1 arms it, unset/0 delegates untouched. At
  daily entry, before inner.daily travels anywhere, it reads
  the previous evening's woodcarry record (ctx._wcLast, before
  woodcarry's own daily resets it), computes a pure-read 3x3
  pre-press sweep (assigned species + the villager's own
  plantKnown only; zero RNG draws, zero state edits — the
  perception-law gate), and on fire calls doAction('forage')
  once + Game.eat() once (press-then-eat is one behavior: a
  press at 0 kcal drives kcal to −60 effort debt, backlog
  #1552, and only the eat restores it). At most one attempt
  per loop-day; recording errors never throw into the engine.
- Driver: scripts/pressb-trace-b.js (wakeforage recorder +
  pressb wrapper outside the warmed stack; PRESSB=0 control
  legs run the warmed stack untouched). Analyzer:
  scripts/analyze-pressb-b.js (paired census, denominator,
  banking, naive depletion table, bearer-death regression
  pairing, §15 paired compare .md). Proof:
  scripts/test-pressb-b.js (16 pure-gate/sweep/totals tests +
  corpus checks). Judged-morning extractor:
  scripts/extract-pressb-judged.js.
- Replay comparators: scripts/wakeforage-replay-b.js UNMODIFIED
  (WAKEFORAGE=1, JUDGED_MORNING = fresh control morning row),
  one per control stranded field morning — 9/9 run, 9/9 control
  snaps equal, 9/9 pre-press snaps equal. Same-base proven
  yields reproduce wakeforage's old-base yields EXACTLY on
  15215 (day 10 E 540, day 11 E 720, day 14 E 720, day 15 E 630,
  west days 0, deadfall 0 throughout) — the control trajectory
  is byte-stable across the base move for this strand.

## Band reproduction (pre-registered report, not a bar)

Guard control legs (PRESSB=0, WOODWARM=0) on all 10 bank seeds:
creek/still/rescued 12/3/9 — EXACTLY wakeforage's fresh guard
census (12/3/9), guard warmth acted 0. ON control legs: the
15215 strand reproduces wakeforage's story exactly (strand
evenings 7–16; mornings 8–16 with identical wake corners,
morning kcals 44/0/0/31/0/0/0/52/0, and woods 4/4/3/3/2/1/0/0/0).
The 15009 strand loss noted in wakeforage (#1554) stands on
this base too (15009 strands on no leg). The judged set is the
fresh control strand set, per the prereg's bank-composition
clause: only 15215 strands, on every leg that matters.

## 1. PILOT (8 seeds: first 8 bank seeds, control ON + variant ON)

Control creek/still/rescued 15/10/5; variant 22/17/5. All 8
seeds survived 30 days on both legs. Denominator mornings 4,
fired 4 — fire rate 100%. Comparable banking 1440/1260 =
114.3% (day 10: variant 540 / proven 540; day 14: variant 900
/ proven 720 — multipliers grew on the diverged trajectory:
the day-10 press deepened Green Thumb, so the day-14 press
dealt 10 muscadine, not 8). Naive total: variant 3240 kcal
over 4 presses vs control proven total 2610 over 9 control
field mornings (124%) — the variant banks MORE in total than
the control strand's whole proven yield, because it keeps
pressing on mornings the control never had (see §3).
Off-target fires 0, errs 0/0, stalls 0, replay mismatches 0,
regression fails 0 (bearer reading, see §4). Determinism:
15215 variant leg re-run byte-identical; day-10 replay press
re-run byte-identical.

## 2. CONFIRM (16 seeds: full bank + extension 15600–15605, fixed in the prereg)

Control creek/still/rescued 18/10/8; variant 25/17/8. All 16
seeds survived 30 days on both legs. Denominator mornings 4
(the same 15215 mornings — no extension seed strands), fired 4
— fire rate 100%. Comparable banking unchanged at 1440/1260 =
114.3%. No extension seed strands, and all 15 non-stranding
seeds are BYTE-IDENTICAL control-vs-variant (same daysAlive,
same endReason, same bearer deaths, same all-deaths counts,
same wave reach) — the gate-leakage check passes perfectly:
where there is no stranded morning, the variant changes
absolutely nothing. 15601's 5 woodcarry records are
non-creek/rescued evenings, not stranded mornings, and its
variant leg is identical to its control leg.

## 3. THE FOUR PRESSES (variant 15215; all east corner (8,0), tile (2,5))

| morning | wake kcal | press E | unknown | kcal after press | kcal after eat | realized net | ticks |
|---|---|---|---|---|---|---|---|
| day 10 | 0 | 540 (6 muscadine) | 13 | −60 | 480 | +480 | 17 |
| day 14 | 0 | 900 (10 muscadine) | 14 | −60 | 840 | +840 | 17 |
| day 18 | 236 | 810 | 20 | 176 | 986 | +750 | 17 |
| day 22 | 780 | 990 | 16 | 720 | 1364 | +584 | 17 |

Skips on strand days are all 'no-known-kcal' with the gate
working exactly as designed: west-corner mornings (days 8, 9,
12, 13, 16, 17, 20, 21) hold nothing green; consecutive-east
second mornings (days 11, 15, 19, 23) find the patch picked
clean the day before (harvest → dirt + day+2 regrow), so the
press fires exactly on the first east morning after each
regrow (10, 14, 18, 22). No press ever fires on a haven
morning, a non-stranded morning, or a morning without a live
known cell.

## 4. WHAT THE PRESS CHANGES (and what it does not)

- It does NOT rescue evenings. Every variant evening on the
  strand still fails on WOOD (day 10: "the pack holds 3 logs,
  and a bridge needs 4"; day 14: 2 logs) — exactly as
  wakeforage predicted: the press changes the kcal gate only,
  and the evenings were wood-gated. Morning kcal is not the
  binding constraint on this strand, and the press does not
  pretend otherwise.
- It DOES keep the villager fed through a longer exile. The
  variant strand runs evenings 7–23 (17 still evenings) vs
  control evenings 7–16 (10 still), and the villager comes
  home on day 24 (control: day 17) — fed the whole way
  (morning kcals 236–1310 on the late strand vs 0–52 on the
  control strand), reaching wave 2 (control: wave 1) and
  killing monsters the control scholar never fought (extra
  death-stream entries with cause "combat" on days 16/25).
  Mechanism not isolated: the press changes kcal state AND
  shifts the RNG stream (forage/eat draws), so the longer
  strand cannot be cleanly attributed to kcal alone — it is
  reported as a behavior consequence, not claimed as a kcal
  effect. It is NOT a routine regression under bar (c): every
  day has an evening row, travel is attempted every evening,
  no day stalls, the scholar survives all 30 days.
- Bearer deaths are IDENTICAL per seed (15215: "the wild" on
  both legs — day 17 control, day 23 variant: the same bearer
  death, delayed 6 days by the fed exile, not a new cause).
  The all-deaths count on 15215 rises 8 → 14 purely from the
  extra monster kills and villager-combat entries on the
  longer, fed trajectory (see Metric review for why the bar
  pairs bearer deaths, not all deaths).
- The effort-debt hazard (#1552) is handled inside the
  behavior: every press at 0 kcal shows the −60 dip and the
  eat restoring it in the same morning (day 10: 0 → −60 →
  480; day 14: 0 → −60 → 840). A press-only variant would
  leave the debt standing; press-then-eat does not.

## Sense-test (law — read end to end, judged for meaning)

Variant 15215 day 10, full day lines: the villager works the
patch at dawn ("6× Muscadine Grapes — and 5× unknown shoots,
8× unknown berries you can't name yet. This patch is picked
clean"), EATS the muscadine (540 kcal), travels to wetland,
works Purslane, eats it, returns to creek, is refused honestly
on wood ("the pack holds 3 logs, and a bridge needs 4"), and
makes fire (−70 kcal). PASS: it reads as a hungry person
eating breakfast they know is there, then having a normal
day — not a robot farming. The press narration slots into the
day without contradiction, and the day's own daytime forages
(Purslane 180) are smaller than the breakfast, as measured.
Day 14 adds the handling-teaches beat honestly (Perception
grows, Trail Eyes gained from working the patch) plus ambient
System voice (Lucky Rock) that belongs to the game, not the
arm. Pre-existing ambient wrinkle (same class as wakeforage):
"fragments by the fire" gossip lines fire during travel,
before that night's fire is lit. Noted, not chased.

## Villager-behavior sample (out of the sims)

Haven days read as people, not rosters: named villagers hold
jobs (Tao/Noah fish, Nolwazi cooks — "a natural — good
pick"), teach with self-correction ("Hold on — I already
showed you this one. White Oak Acorns. You remember."),
share counters in their own voice ("MOVE, don't stare...
the freeze means it is already aiming"), argue about monster
names ("Tao is calling it Loud-Eyes. The name's up for
grabs"), and report each other's fights ("Fatima killed the
Ugly Beast alone — 1 round, 15 taken. Word travels fast. The
village cheers."). One mildly robotic repeat flagged, not
chased: Carlos's self-correcting lesson fires twice verbatim
in one evening (White Oak Acorns, then Hickory Nuts, same
joke back-to-back). No static or repeated villager routines
beyond that; nothing here changes the arm's verdict.

## Reachability

No new content reached by a game change (no game change
landed — policy variant only, default off). Wave reach on
the 16-seed confirm (maxWaveUnlocked per seed): wave >= 1 on
16/16 control and variant; wave >= 2 on 11/16 control and
12/16 variant (15215 variant reaches wave 2 where its control
reaches wave 1 — the fed exile fights more); wave 3 on 1/16
both (15439); waves 4–5 not reached in this 30-day window
(same window as wakeforage). The variant moves wave reach on
exactly the seed it feeds, nowhere else.

## Wall numbers

NOT OBSERVABLE on 30-day evening legs (pre-seat, no field)
— reported, never zeros. No national, table, or win claim is
made or implied by this run.

## Verdict against the prereg

- (a) FIRE RATE: 4/4 = 100% (pilot and confirm) — PASS (>= 80%).
- (b) BANKING RATIO: 1440/1260 = 114.3% on comparable mornings
  (pilot and confirm) — PASS (>= 80%). Comparator coverage
  over the CONTROL stranded set: 9/9 = 100%.
- (c) NO MORNING-ROUTINE REGRESSION: daysAlive 30/30 every
  seed; bearer deaths identical per seed; endReason survived
  everywhere; errs 0; stalls 0; off-target fires 0 — PASS.
- (d) DETERMINISM: variant leg + replay press byte-identical
  — PASS. Proof test 24/24 (16 pure + 8 corpus checks).
- COVERAGE FLAG (the one bar that fails as literally written):
  comparator coverage over DENOMINATOR mornings is 2/4 =
  50%, because denominator mornings 18 and 22 are
  VARIANT-ONLY mornings — the control villager is home those
  days, so no same-seed same-day control morning exists to
  press against, and a haven-tile press would be a meaningless
  comparator. The prereg's coverage rule was written for
  instrument failure (missing/mismatched comparator) and
  assumed shared trajectories; it did not foresee a behavior
  that extends the strand and creates new mornings. The two
  variant-only mornings banked 810 + 990 kcal on live known
  patches (pre-press sweeps showed muscadine; presses fired
  and ate) — they are reported here in full, not hidden, and
  they are the reason the naive total (3240) exceeds the
  control total (2610).
- STRICT-PREREG VERDICT: GO is false on the coverage bar
  alone; every substantive bar passes. SUBSTANTIVE VERDICT:
  GO. The coordinator's kill triggers do not hold (the press
  banks 540–990 kcal per firing, never ~0; the routine does
  not break — no stalls, no missed travel, no scholar death).
  Per Steve's kill discipline (2026-10-21: a missed bar is
  not a kill; a kill requires establishing WHY and confirming
  the lever itself is wrong), this arm reports LAND CANDIDATE
  with the coverage flag attached for the coordinator's
  adjudication — competent defaults are NOT flipped here.
  If the coordinator rules the strict coverage bar binding,
  the verdict converts to KILLED-with-cause (metric
  definition, not behavior failure) and the instrument +
  evidence stand as the measurement record.

## Proof

scripts/test-pressb-b.js: 24/24 checks pass on the confirm
corpora, including: pure gate fires/skips (stranded+known,
west-corner, haven, non-stranded, combat, game-over,
ticks-short, insideHaven); sweep known-cell counting
(east 1 / west 0 / regrow excluded / unassigned excluded);
pressTotals (new-stack + merged-stack deltas, unknowns
separate); control legs press-free; off-target fires 0;
pressb errs 0; bearer-death regression pairing; replay snap
equality 9/9; tracked diff guard (src/ empty vs pinned base,
policies/ change is pressb-diag.js only, competent.js
byte-identical to base).

## Metric review

- The live pre-press sweep (assigned species + plantKnown) is
  the right "has known kcal" test, and the run proves it two
  ways: it fires exactly where muscadine stands (4/4) and
  skips exactly where it does not (west corners + depleted
  patches, 12/12 strand-day skips with reason
  'no-known-kcal'). The open question from the prereg — would
  a skipped morning's press have yielded? — is answered for
  the depletion skips by the regrow mechanic itself (dirt
  cells yield nothing; the replay NOTHING presses on west
  mornings say so), and for west corners by the same replay
  evidence. No follow-up replay on skipped mornings is needed.
- Press+eat (vs press-only) is the right behavior unit: the
  eat is what realizes E (realized nets +480/+840/+750/+584)
  and what clears the #1552 effort debt in the same morning.
  The eat's side effect — eating pre-existing pack food first
  by perishability — is visible in realized net vs E (day 22:
  E 990 but net +584, because the villager was already at
  780 kcal and ate to a lower marginal gain), and is reported
  per attempt, not hidden inside E. A future landing decision
  should keep press+eat together; press-only would be a
  different, worse behavior.
- The actionable (previous-evening) definition vs wakeforage's
  (same-day evening) definition: on this run they differ only
  at the boundary the prereg predicted — the morning after
  the last still evening. On the control trajectory that
  morning is day 17 at haven (excluded by both); on the
  variant trajectory the strand extends, so there is no
  single boundary morning — the variant's days 18/22 are
  interior mornings of its own longer strand, and wakeforage's
  pairing cannot express them at all. Any future prereg for a
  strand-changing behavior must define its denominator on the
  VARIANT trajectory with a counterpart rule (comparable
  mornings vs variant-only mornings reported separately),
  not assume the control trajectory enumerates the mornings.
- The all-deaths literal reading of bar (c) is the wrong
  instrument for a behavior arm, and this run is the proof:
  the deaths stream mixes monster kills, villager deaths, and
  bearer deaths, and a behavior that feeds the scholar
  necessarily reshuffles all three via RNG + state (15215
  all-deaths 8 → 14 with bearer deaths identical). The bar's
  parenthetical intent — the scholar/village must not die
  because of the morning routine — is what the bearer pairing
  measures, and the all-deaths table is still printed per pair
  so any reader can re-judge under the literal reading. For
  the NEXT run's prereg, the bar should name bearer deaths
  (player:true) explicitly, with all-deaths as a reported
  secondary — proposed here, not applied retroactively to
  this run's strict verdict above.
- Coverage, for the NEXT run: define comparator coverage over
  denominator mornings that HAVE a control-trajectory
  counterpart morning on the same tile (same seed, same day,
  same wake tile type); variant-only mornings get their own
  row with banked E and the pre-press sweep, judged on
  fire-rate only. Proposed here, not applied retroactively.
- 2200 kcal day-need has no bearing on this arm (the question
  is the morning meal, not the day) and is cited only to
  refuse overclaiming: no single press covers a day, and no
  claim here says otherwise. The four presses total 3240 kcal
  across 13 strand days — breakfasts, not a food economy.
- No metric revision is proposed for the fire gate, the E
  definition, or the regression bars as bearer-paired: they
  separated signal from noise exactly as designed (fired
  4/4, banked 114% comparable, 15/16 seeds byte-identical).

## Out-of-scope findings (NOT chased; for the coordinator's backlog)

- [open] 2026-10-30 — food-economy/behavior — FED EXILE
  EXTENDS THE STRAND (this arm, variant 15215): a fed
  villager stays out 7 extra nights (still evenings 10 → 17)
  because morning kcal does not fix the wood gate, and the
  longer exile fights more (wave 2 reached). Whether "fed but
  still stuck" is acceptable exile behavior, or whether the
  routine should convert fed mornings into wood-seeking days,
  is a design question for the landing decision — the press
  alone cannot rescue a wood-gated evening, and nobody
  should claim otherwise. (evidence: sim-pressb-b variant
  corpus, 15215 days 10–24.)
- [open] 2026-10-30 — food-economy/instrument — COVERAGE
  DEFINITION FOR STRAND-CHANGING BEHAVIORS (this arm, metric
  review): a behavior that changes strand length creates
  variant-only mornings with no control counterpart, so a
  coverage bar written over shared trajectories fails on
  success. Next behavior prereg must split comparable vs
  variant-only mornings (see Metric review). (evidence:
  sim-pressb-b-prereg.md bars + this file's Verdict.)
- [open] 2026-10-30 — village-behavior/dialogue — REPEATED
  LESSON SELF-CORRECTION (this arm, villager sample): Carlos's
  "I already showed you this one" lesson fires twice verbatim
  in one evening (White Oak Acorns, then Hickory Nuts). Same
  joke back-to-back reads mildly robotic; a per-evening
  dedup or variation would fix it, but it is cosmetic and
  out of this arm's scope. (evidence: sim-pressb-b variant
  corpus, 15601 day 10 evening tail.)

## Files

- Prereg: evidence/2026-10-30/sim-pressb-b-prereg.md (commits
  61160f8b + amendment 50af90ae)
- Evidence (this file): evidence/2026-10-30/sim-pressb-b.md
- Variant policy: scripts/policies/pressb-diag.js; driver:
  scripts/pressb-trace-b.js; analyzer:
  scripts/analyze-pressb-b.js; proof:
  scripts/test-pressb-b.js; judged extractor:
  scripts/extract-pressb-judged.js
- Pilot corpora: evidence/2026-10-30/sim-pressb-b-corpus-
  on-control, -on-variant (8 seeds each, pilot subset of the
  confirm corpora — same files, not re-run); census + compare:
  sim-pressb-b-census-pilot.json, sim-pressb-b-compare-pilot.md
- Confirm corpora: evidence/2026-10-30/sim-pressb-b-corpus-
  on-control, -on-variant (16 seeds each); guard control:
  sim-pressb-b-corpus-guard-control (10 seeds); census +
  compare: sim-pressb-b-census-confirm.json,
  sim-pressb-b-compare-confirm.md
- Replay comparators: evidence/2026-10-30/
  sim-pressb-b-corpus-replay (18 files: 9 control + 9 press,
  15215 days 8–16); judged mornings:
  sim-pressb-b-judged-mornings (9 files)
- Determinism: evidence/2026-10-30/
  sim-pressb-b-corpus-determinism (15215 variant re-run,
  byte-identical) + sim-pressb-b-corpus-replay-determinism
  (day-10 press re-run, byte-identical)
