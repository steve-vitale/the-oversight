# sim-guardcasc-b — Diagnostic: the guard→succession cascade (seed 69604)

Run: oversight-flesh-out-loop-b, arm sim-guardcasc-b
(coordinator brief 2026-11-03, run
fleshout-loop-b-20261103T0856Z, axis food-economy).
Worktree sim-guardcasc-b, branch sim-guardcasc-b.
Base: 5440b7747 (includes guarde-deploy d29ede83f).
Prereg: evidence/2026-11-03/sim-guardcasc-b-prereg.md
(committed a6724fb6f BEFORE any judged leg;
instruments committed ec842726b before the pair
ran; trace driver + extended proof committed
before the trace legs were read).
This worker does NOT push, bump, verify live,
merge, or rebase; the coordinator lands the
branch. Status to coordinator: committed in
worktree, pending coordinator merge.

## Verdict (judged against the prereg header, never re-scored)

- **DIAG-COINCIDENCE — with REPRO-YES.** The
  69604 cascade reproduces exactly on the current
  base (all three levels, zero entry vetoes on
  days 5-6), and the death resolves to
  RNG-CASCADE, not to a reroute-caused death.
  The distinction, stated plainly: the veto
  REALLY rerouted the day and the RNG cascade
  REALLY diverged the legs — but the death
  itself is not attributable to the veto. The
  veto changed the dice, not the situation:
  both scholars woke day 6 on the same tile
  (2,8), exposed, starving, 18 kcal apart, and
  the armed scholar died that night in a fight
  whose encounter was a night-part roll, while
  the shadow scholar's night on the same tile
  rolled a cold snap instead. A guard veto
  demonstrably re-rolls a scholar's fate
  through succession — that trajectory effect
  is real — but this death is not evidence the
  veto killed her, and it must not be cited as
  a guard lethality case.
- **Correction to the homewardac shorthand.**
  The 1636Z summary said the armed scholar was
  dead "by day-6 start" with its successor
  starting day 6 at haven. That shorthand is
  misleading and is corrected here: the scholar
  did NOT die overnight. She survived the
  night 5->6 sleep (sleep-exit: alive at (2,8)
  on 276 kcal), woke day 6, lived through day
  6, and died that night in a boulder fight.
  The day-6 record start (successor at haven)
  describes policy.daily entry, not dawn (see
  the timing rule below) — the successor takes
  over DURING day 6, after the fight, not
  before it.

## (a) Reproducibility on the current base — REPRO-YES

Day-1 identity: PASS (identical start/end
pos/kcal/hydration, forage additions, say
count). Fresh pair vs original pair (analyzer
repro levels, deployed guard):

| Level | Result |
|---|---|
| R-SHADOW (fresh shadow days 1-6 start/end pos/kcal + construct reports = original) | PASS, 0 diffs |
| R-VETO (fresh armed day-5 veto (2,8)->(1,8), spoken, E-fail) | PASS (vetoCause 'escape', allowPrime false) |
| R-OUTCOME (fresh armed player death day 6 'the wild' + successor-signature day-6 record start) | PASS (death gen_5rd3jnj, record start (4,4)/1500, mantle seq 499/501) |
| Deploy delta (entry vetoes on fresh armed days 5-6) | NONE — 0 entry vetoes; the deploy predicts no change here, and none occurred |

Day 5/6 record differences fresh-vs-original
are ONLY added hop-log fields (allowPrime,
vetoCause, entryBlockers) from the deploy —
zero changed values on any hop. The judged
window (days 1-6 + death day 6) reproduces
exactly.

Disclosed later-day drift (outside the judged
window, NOT a repro failure): first differing
say-day is day 16 (shadow) / day 17 (armed);
maxWave 3 (original) -> 2 (fresh) on both
legs; the fresh armed leg has NO day-28 arena
player death (original: successor Colton died
day 28 in the arena). The current base moved
since 2026-11-02 (e.g. the w5window game
change), and later-day content moved with it.
No judged-window number is affected.

## (b) Death attribution — the resolved chain

Death tele (fresh and original, identical):
day 6, kind villager, who gen_5rd3jnj
(Ingrid Kelleher), cause "the wild",
player=true. Shadow leg: no player death at
any day in the window (indeed none in 30d on
the fresh leg).

### Timeline (trace driver: bearer identity at every boundary)

| Step | Armed leg | Shadow leg |
|---|---|---|
| Day 5, say-index 60 (first divergence) | "You don't walk there — you couldn't get home from there." (veto (2,8)->(1,8), spoken, E-fail) | "Travel 1 tile to creek." (walks on) |
| Day 5 reroute | (2,8)->(2,6)->(2,8); forage success at (2,6): +7 unknown shoots (inedible until identified) | (2,8)->(1,8)->(0,8)->(2,8); two failed forages at (1,8)/(0,8) |
| Day-5 end | (2,8), 920 kcal | (2,8), 980 kcal |
| Night 5->6 sleep | Survives: 920 -> 276 kcal, wakes exposed | Survives: 980 -> 294 kcal, wakes exposed |
| Day-6 parts (before policy.daily) | Wakes stiff/cold, "stomach is a fist", STARVING spiral; waits the day; night: boulder encounter, fight (takes 23/19/18/18/19/17), "You go down", death line, keepsakes buried, mantle to Colton Ochoa | Wakes stiff/cold, "stomach is a fist", STARVING spiral; cold snap shivers (-20 x3 -> 234 kcal by daily entry); waits; night: cold snap, stays up shivering, no fight |
| Day-6 policy.daily entry | Colton Ochoa at haven (4,4)/1500; attempt (2,8)->(4,8) not offered | Ingrid at (2,8)/234; attempt (2,8)->(4,8) moved; ends (4,8)/164 |
| Day 7 | Colton at haven, fed (2180) | Ingrid at (4,8), 49 -> 0 kcal, survives |

### The timing resolution (the prereg's open question, settled)

The original corpus looked contradictory: the
armed day-6 record start is the successor
signature ((4,4)/1500, attempt not offered),
while the day-6 sayLines show Ingrid waking
exposed, fighting, and dying. The trace driver
settles it: the succession falls BETWEEN
sleep-exit (loop 5: Ingrid alive at (2,8)/276,
day 6) and daily-entry (loop 6: Colton at
haven/1500). The death therefore happened in
the harness parts loop of day 6 (waits +
driveFights, which run BEFORE policy.daily),
in the night boulder fight — NOT in the
night 5->6 sleep. The death/mantle say lines
are tagged loopDay 5 by the trace driver
because its loop counter only advances at
daily entry; their game day is 6 (tele day 6,
say day 6). Rule for future preregs (see
control list): a day-record start describes
POLICY.DAILY ENTRY, after that game day's
parts loop has already run — never read it as
dawn, and never read a successor-signature
record start as "died overnight" without the
sleep-exit identity.

### Attribution test (prereg, applied)

DOWNSTREAM would require the death's proximate
mechanism to depend on a reroute-created
state. The evidence shows the opposite on
every element:
- Same tile at nightfall of day 6: both
  scholars at (2,8) when the parts-loop night
  events fired (shadow's move to (4,8) happens
  later, inside policy.daily).
- Comparable hunger: sleep-exit 276 (armed)
  vs 294 (shadow) — 18 kcal apart; both woke
  with "stomach is a fist", both in the
  STARVING spiral, both "energy restored".
  The 60-kcal day-5-end gap did not cross any
  threshold: the shadow scholar later reached
  0 kcal (day 7) and lived.
- Death by fight damage, not hunger: the
  boulder landed 23/19/18/18/19/17 across six
  exchanges; the death cause is "the wild",
  not starvation, and the scholar's pack was
  if anything BETTER provisioned after the
  reroute (inedible shoots, but shoots).
- The divergent event is the encounter roll:
  same tile, same night phase, shadow rolled
  a cold snap, armed rolled a boulder. The
  roll differs because post-veto RNG
  consumption diverged (different hops and
  forages on day 5) — the veto changed which
  random numbers were drawn, not the
  scholar's situation when they were drawn.
Verdict on attribution: RNG-CASCADE. The
cascade (veto -> divergence -> succession)
is real as a trajectory effect; the death is
coincidence in the causal sense.

## (c) Pattern vs singleton — corpus re-derivation

Scan: 24 pairs, analyzer candidate definition
(prereg, fixed). Homewardac pilotA 69501-69508
+ pilotC 69601-69608 (16 pairs) + cband judged
8 pairs (69702/69704/69706/69707/69709/69713/
69714/69717). The cband band files were
verified byte-identical duplicates of the
judged legs (all 16 legs: days, deaths, and
sayLines identical) and were NOT rescanned,
to avoid double-counting the same 8 pairs.

Result: **1 candidate / 24 pairs — only 69604
itself.** Full table:
evidence/2026-11-03/sim-guardcasc-b-corpus-scan.txt.
Notable controls:
- 11 pairs have armed vetoes on construction
  days (A-69501/69504, C-69604, CBAND-69702/
  69704/69706/69707/69709/69713/69714/69717);
  only 69604 pairs a veto with a death in its
  window and a successor.
- Many pairs show IDENTICAL player deaths on
  both legs (same day, same bearer, same
  cause: e.g. A-69502 day-15 sickness both
  legs) — player deaths are usually
  seed-determined, not guard-determined.
- A-69501 is the near-miss that justifies the
  window: armed veto day 5, armed player death
  day 16 vs shadow day 11 (same bearer, both
  "the wild") — a veto-adjacent divergence,
  but outside [5,7], so not a candidate.
No fresh seeds were screened (prereg fixes
none, and none were needed: the count and the
attribution agree).

## (d) Sense test (transcripts, not just counts)

Quoted, armed leg day 6 (fresh = original):
- Veto (day 5): "You don't walk there — you
  couldn't get home from there."
- Death: "🕯️ Ingrid Kelleher is dead — the
  wild. The village stops. Somebody screams.
  Somebody else starts digging."
- Mantle: "🌟 "MANTLE TRANSFER DETECTED. ...
  Oh! New face! Same job! Whole new set of
  tricks. We hardly noticed. (That is a lie.
  We noticed. The audience CRIED.)"" /
  "🪞 You wake up somebody else. Colton Ochoa,
  35 — a welder. Their hands know different
  work now: Iron Stomach."
- The fight itself reads as a played fight,
  not a roll: strikes land (2/1/2/1/2), the
  boulder SNAPS without warning six times,
  the Codex learns "Snap Decision", then
  "You go down." The death scene is coherent
  and human — a scholar out too far, at night,
  meeting something that kills her, and the
  village mourning and carrying on.
Judgement: the death reads as a wild-night
death, NOT as a reroute death. Nothing in the
death scene recalls, refers to, or depends on
the vetoed step; the scene would read
identically if the veto had never fired and a
different night roll had spawned the boulder.
The cascade is visible only in the ledger
(same seed, different fate), never in the
fiction — and the ledger, once traced, shows
the same tile and the same hunger. Sense and
causation agree here: this is a scholar who
died in the wild, after a reroute, not because
of it.

## Wall numbers (fresh pair only, honestly limited)

- Survived 30/30 days on both legs
  (endReason survived; scholar death is not
  village death — succession continues the run).
- Max wave reach: 2 on both legs (fresh);
  original legs reached 3 — base drift, not a
  guard effect (shadow leg moved identically).
- National / table / wins: 0/2 — the 30d
  construction window does not reach them.
- Wave 4-5 unlocks: 0. No wall movement is
  shown or claimed by a diagnostic pair.

## Metric review (for the NEXT run, never a re-score)

- The prereg's three-level reproducibility
  (R-SHADOW / R-VETO / R-OUTCOME) plus the
  deploy-delta list (entry vetoes on judged
  days) worked exactly as designed: it
  separated "reproduces" from "reproduces for
  the deploy's reason". Keep all four for any
  future re-run across a guard change.
- The candidate definition's window
  ([vetoDay, vetoDay+2]) did real work: it
  excluded A-69501's day-16 death, which a
  windowless "veto then death" screen would
  have falsely counted. Keep the window, and
  keep the shadow-alive clause — without it,
  the many identical both-legs deaths would
  flood the screen.
- The successor-signature clause (record
  start haven + 1500, or mantle line) is
  necessary but NOT sufficient for timing:
  it fires for any pre-daily succession and
  cannot distinguish sleep-deaths from
  parts-deaths. Future preregs must pair it
  with identity tracing (see control list).
- The day-1 identity STOP condition passed
  silently and should stay: it is what lets a
  re-run claim "same seed, same start" at all.
- No metric was moved mid-run. The one
  judgement made after the numbers (the
  record/say timing resolution) is a reading
  of the trace instrument, not a re-score:
  the verdict word comes from the prereg's
  attribution test applied to the resolved
  chain.

## What a future guard prereg must control for (deliverable)

1. Succession-aware integrity: a pair whose
   armed leg successions before the judged
   day FAILS integrity (as 69604 failed C
   integrity) and must be analyzed as a
   cascade leg, not dropped silently. The
   integrity failure IS the finding.
2. Veto-death attribution: a player-death
   window [vetoDay, vetoDay+2] after ANY veto
   day, with the shadow leg as the control
   for the same window, and the attribution
   test from this prereg (same tile? same
   hunger? threshold crossed? encounter roll
   vs state difference?) applied before any
   lethality claim.
3. The record/say timing rule settled here:
   day-record starts describe policy.daily
   entry, AFTER that game day's parts loop;
   tele day + say seq fix the death's game
   day; identity tracing (bearer at
   sleep-exit vs next daily-entry) fixes
   whether death fell in sleep, parts, or
   policy.daily. Never read a
   successor-signature record start as "died
   overnight".
4. Deploy-delta reporting: when the guard
   instrument changes between the original
   event and the re-run, list entry vetoes on
   the judged days BEFORE any reproducibility
   claim (here: 0, so REPRO-YES is clean).
5. Base-drift disclosure: when the base moves
   between the original event and the re-run,
   report the first differing say-day and any
   maxWave/death changes outside the judged
   window (here: say day 16/17, maxWave 3->2,
   day-28 arena death absent) rather than
   claiming full-run identity.

## Findings for the coordinator (sim-findings format; NOT
written to hidden_files/sim-findings.md — coordinator appends)

- [open] 2026-11-03 — guard-succession-cascade
  — 69604 DIAG-COINCIDENCE (this run): the
  veto->divergence->succession cascade
  reproduces exactly on the deployed guard
  (REPRO-YES, 0 entry vetoes days 5-6), but
  the death is RNG-cascade, not
  reroute-caused: both scholars woke day 6 at
  (2,8) exposed and starving (276 vs 294
  kcal), and the armed scholar died that
  night in a boulder fight while the shadow
  scholar's same-tile night rolled a cold
  snap. Corpus scan 1/24 candidates (only
  69604). Do NOT cite 69604 as a guard
  lethality case.
- [open] 2026-11-03 — guard-succession-cascade
  — day-record starts describe policy.daily
  entry, after the game day's parts loop
  (this run's trace): the 69604 scholar did
  NOT die overnight — she survived sleep
  (276 kcal) and died in the day-6 parts-loop
  night fight, with the successor entering at
  policy.daily. Future preregs must use
  identity tracing (sleep-exit vs next
  daily-entry bearer) to place a death, never
  a successor-signature record start alone.
- [open] 2026-11-03 — guard-succession-cascade
  — cband band files are byte-identical
  duplicates of the judged legs (all 16 legs
  verified); scanning both would double-count
  the same 8 pairs (this run's evidence).

## Census (proof, not judged evidence)

scripts/test-guardcasc-b.js: ALL PASS (11
checks — candidate fixture + 4 controls,
day-1 identity fixture, original-corpus 69604
candidate + first-divergence index 60 +
reproLevels identity, reused-files-unmodified,
trace-driver boundary + bearer-change
detection on a 7d armed 69604 run).
Predecessor proof re-run post-run (regression,
not re-authored): scripts/
test-homewardconstruct-b.js ALL PASS (15/15)
on this base — the deploy already in base
breaks nothing here.

## Corpora

- evidence/2026-11-03/sim-guardcasc-b-prereg.md
- evidence/2026-11-03/sim-guardcasc-b.md (this file)
- evidence/2026-11-03/sim-guardcasc-b-repro69604-{shadow,armed}.jsonl (+ .log)
- evidence/2026-11-03/sim-guardcasc-b-repro69604-analysis.json
- evidence/2026-11-03/sim-guardcasc-b-trace69604-{shadow,armed}.jsonl (+ .log)
- evidence/2026-11-03/sim-guardcasc-b-corpus-scan.txt
- scripts/analyze-guardcasc-b.js
- scripts/guardcasc-b-trace-driver.js
- scripts/test-guardcasc-b.js
