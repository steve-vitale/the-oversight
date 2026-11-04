# sim-exphurt-a — VERDICT: INSUFFICIENT-DATA for SPEC-READY (prereg gate missed); DIAG FINDINGS STAND + SPEC DRAFTED

Run: oversight-flesh-out-loop, run fleshout-20261104T1445Z (Loop A).
Worker tree: ~/workspace/worktrees/sim-exphurt-a. Axis: food-economy.
Arm: EXPHURT DISCONNECT write-back (findings backlog #1699).
Binding prereg: evidence/2026-11-04/sim-exphurt-a-prereg.md (read in
full before judging; this verdict is judged against it, §14).
Canon read first: docs/CANON.md, docs/PRESERVATION.md,
docs/PARTY.md. No canon doc covers away-return timing or
hurt-return narration — the mechanism below is code-read, not
invented canon. DIAG + SPEC only, as briefed: the hurthome
turn-home fix is NOT re-litigated, no gate/price/deed change, no
sibling files touched (sim-bankfood-a untouched; sim-fracchoice-b's
deploy-fraction work not duplicated).

## THE QUESTION, IN ONE SENTENCE

An expedition's hurt clock (st.exped.duration, capped by expedHurt)
and its away clock (v.away.duration, never written back) disagree —
does a hurt return still read, in its homecoming line, as a normal
homecoming, and can that be fixed with a narration-only hook?

## INSTRUMENT (event-based, per warning #1697)

scripts/exphurt-a-lib.js + scripts/sweep-exphurt-a.js +
scripts/analyze-exphurt-a.js, built on the hurthome-fix-c event
instrument (hurthome-b-lib.js, UNCHANGED): cases open on hurt
EVENTS (hurtVillager post-wrapper + per-part scan net), never on
dawn samples. Added: per-case expedition-clock snapshots
(expedDuration at open AND at last hurt, exped legs,
encounters-hurt flag — raw village.agency read, never
agencyState(), which mutates) and closing-part return-line capture
(lines in the closing day+part naming the villager, classified as
expeditionReturn line / landed hurthome line / mentions-hurt).
Corpus: evidence/2026-11-04/perseed-exphurt-a/ (competent, 100d
death-aware cap, PLENTYDEPRI=1, DEPOSITGATE=1, seeds 99901–99908).
Proof: scripts/test-exphurt-a.js 21/21 green BEFORE the pilot;
hurthome-b-lib proof still 20/20 green.

## PILOT GATE — MISSED ON ONE LEG (this is the verdict's hinge)

- 8 pilot seeds complete: PASS. Instrument errors: 0: PASS.
  Unclassified cases: 0 (all 25 cases in exactly one outcome
  bucket): PASS.
- Expedition hurt cases opened: 6, bar >= 8: MISS. The bar was
  calibrated on hurthome-a's dawn-episode rate (1.75/seed across
  ALL trip purposes); the event instrument's expedition-only rate
  is 0.75/seed (6/8). Different unit, wrong bar — see metric
  review, not a quiet threshold move.
- The pre-declared confirm (99909–99916) was NOT triggered: it
  fires only if returned-hurt expedition cases number < 5, and
  they number exactly 5. Running it anyway would be a post-hoc
  expansion, so it was NOT run. Judging stops at the pilot, per
  §14: a miss is NO-GO for SPEC-READY, never re-scored.
- Consequence, stated plainly: SPEC-READY is NOT claimed. What
  follows is a DIAG result (measured, proof-backed) plus a DRAFT
  spec (complete, ready for a re-run arm to confirm). The draft
  spec is not a GO, and no hook was implemented — LAND requires
  SPEC-READY first.

## THE NUMBERS (pooled, 8 pilot seeds, 25 cases)

- By purpose: expedition 6, visit 5, forage 5, leave 5, water 2,
  guard 2. By outcome: returned-hurt 18, healed-away 3, died 4.
- D (disconnect prevalence, pre-registered, at open): 1/6 = 0.167
  (denominator bar >= 8: MISS — 6, not 8). Exped-shorter: 1/6.
  Median signed gap (away − exped): 0.
- D descriptive (at last hurt, same cases): 2/6 = 0.333. The one
  case that disconnects at open (Gilberto, exped 4 vs away 9,
  gap 5) plus Abderrazak (open 20 vs 20, last-hurt 12 vs 20,
  gap 8, legs 11 — exactly the expedHurt cap formula legs+1):
  the cap lands DURING the episode, so at-open understates
  divergence. See metric review.
- M1 (PRIMARY, the blank): 0/5 = 0.000 — NO expedition homecoming
  line mentions hurt, exactly as the baseline expectation said.
  The blank is confirmed, not merely suspected.
- M2: 5/5 = 1.000 — every announced hurt expedition return IS
  covered by SOME hurt-mentioning line: the landed hurthome line,
  firing immediately before the homecoming line in the same tick.
- M3: 5/5 = 1.000 announced — but only because all 5 expedition
  hurt returns happened while the player was at Haven. The
  silence branch is real in-corpus for another purpose: Meera
  (visit, s99906) returned hurt with the player away and ZERO
  closing-part return lines. For expeditions the silence branch
  is unmeasured here, not disproven.
- Latency: all 5 returned-hurt expedition cases closed 1 part
  after the hurt event — the landed hurthome fix working as
  designed. The away clock no longer delays hurt returns at all.
- Coverage: hurt-return lines 18 vs returned-hurt cases 18;
  retro-opened 2. Instrument health clean.

## SENSE TEST — ALL 5 RETURNED-HURT EXPEDITION RETURNS, QUOTED

Every pair reads the same way: a true hurt line, then a
celebration that erases it in the same tick. Judgment: the
homecoming line is the return's lasting meaning — it is what a
skimming player remembers — and it never carries the hurt.

1. Gilberto, s99901 (hp 4, the disconnect case, exped 4 vs away
   9): "🧭 Gilberto returns from the wilds hurt (health 4/100)
   — the trip cut short." then "🧭 Gilberto is back from far
   past the north (strange meat (unknown flesh — test it
   cautiously), 2 stories, a new scar) (Ask them what they
   saw.)" The scar is the only wound nod; the line celebrates
   the trek, not a hurt man coming home early.
2. Abderrazak, s99904 (hp 4): hurt line, then "🧭 Abderrazak
   is back from past the south (+2004 kcal for the pantry, 2
   stories, a new scar) (Ask them what they saw.)" Same shape.
3. Ashwin, s99905 (hp 5): hurt line, then "🧭 Ashwin is back
   from far past the north (+4449 kcal for the pantry, +100
   kcal of meat, strange meat, 5 stories) (Ask them what they
   saw.)" No scar even — pure haul celebration after a hurt
   return at hp 5.
4. Ashwin again, s99905 (hp 3, second expedition): hurt line,
   then "🧭 Ashwin is back from past the north (+686 kcal for
   the pantry, 4 stories, a new scar) (Ask them what they
   saw.)" At hp 3, the homecoming still reads as a routine
   return.
5. Theo, s99906 (hp 7): hurt line, then "🧭 Theo is back from
   far past the south (+1886 kcal for the pantry, strange meat,
   3 stories) (Ask them what they saw.)" Same shape.

Judgment: the pair is tonally contradictory — "trip cut short"
followed instantly by a haul-and-stories celebration. The landed
hurthome line does its job; the homecoming line undoes it. This
is a narration blank, not a behavior blank: nothing about
survival, pantry, or timing needs to change for the return to
read as hurt.

## SPEC — DRAFT (complete, NOT go: awaits a confirming re-run)

Write site (exact): src/js/villager-agency.js,
expeditionReturn(vid, playerAtHaven), the playerAtHaven line
block — the `bits`/`suffix`/`pick(dirs)`/`this.say(...)` block.
The expedition record `ex` is already captured before
`delete st.exped[vid]` at the function's top, so its encounters
stay readable; the returnee's hp is readable as
v.health[vid] at that point.

- Which event writes: nothing writes a clock. The carrier is the
  homecoming line itself, fired by expeditionReturn when the
  returnee is hurt AT return.
- Predicate (recommended, no new threshold invented): hp at
  expeditionReturn time in 1..7 — the same gate as
  shouldHurtReturn and awayHungerVoice. Do NOT use
  encounters-includes-'hurt' as the predicate: it would also
  fire for villagers hurt mid-expedition but healed before
  return, widening the hook beyond "a hurt return reads as
  hurt." (Encounters-hurt stays as instrument corroboration.)
- Which line fires: the SAME expeditionReturn line, with a hurt
  clause appended to its suffix when the predicate holds — e.g.
  the bits list gains a hurt clause (wording for the landing arm
  to finalize; the requirement is the word "hurt" in the line,
  so the M1 classifier and any player skimming both see it).
  Healthy returns keep the template byte-identical.
- What it must NOT overwrite: (1) the landed hurthome line in
  src/js/game.js npcNodeTravel — untouched, still fires first;
  (2) haul/trust/deeds/pantry — the hook sits AFTER all of those
  in expeditionReturn and touches none; (3) the RNG stream —
  pick(dirs) is still drawn exactly once, unconditionally, as
  today (a hook that conditions the draw would cascade seeds,
  warning #1698); (4) the playerAtHaven gate — the hook fires
  only where the line already fires; the player-away silence
  branch is a SEPARATE blank, not this hook.
- What the spec deliberately does NOT do: write expedHurt's cap
  back into v.away.duration. Post-fix evidence says the clock
  half of #1699 is behaviorally moot: hurt returns fire at
  latency 1 part regardless of either clock (5/5 here), and the
  observed divergences (gaps 5 and 8) changed no outcome. A
  future arm that wants clock parity must first prove a case
  where the two clocks diverging changes an outcome — this
  corpus contains none. Coordinator decision: whether #1699
  closes on the narration hook alone, or stays open for the
  clock half, is a backlog call, not this arm's.
- LAND guardrails for the confirming arm (carried from the
  prereg, unchanged): hook proof green + same-seed pilot re-run
  with M1 >= 0.8 among announced expedition returns + median
  daysAlive delta (matched seeds) >= −5d + instrument errors 0
  + diff touching ONLY expeditionReturn's line block. Baseline
  for that guardrail, this pilot: median daysAlive 83
  (days 32, 37, 65, 78, 88, 100, 100, 100).

## REACHABILITY + VILLAGE ASSESSMENT (plain words, diag window)

Window honestly stated: competent policy, 100d death-aware cap,
seeds 99901–99908 — an early/mid window, not a full-arc run, and
a DIAG corpus, not a scale panel. Nothing here claims scale
verdicts.
- Survived to 100d: 3/8 (99904, 99905, 99906); village-lost: 5/8
  (days 32–88). Median daysAlive 83.
- Wave reach: wave 4 on 6/8, wave 3 on 2/8, wave 5 on 0/8.
  National / table / wins: 0/8, rank village on all 8 — the
  scale wall is untouched by this measurement arm, as expected.
- Deaths recorded: 97 across 8 seeds (7, 11, 19, 11, 14, 14, 5,
  16). Hurt travelers are a small part of that story: only 4 of
  25 hurt cases died, and every hurt expedition return made it
  home in 1 part. The village dies to the wider world, not to
  hurt returns lingering — the fix holds, and the remaining
  blank is what the homecoming SAYS, not whether anyone gets
  home.
- Who thrived / died and why: nobody in particular — survival
  tracks early pantry/monster luck, not return narration. The
  blank this run documents is the record itself: hurt returns
  are narrated twice in one tick, and the second, lasting line
  forgets the hurt.

## §15 BALANCED PANEL — DECLARED INAPPLICABLE (prereg-bound)

No panel compare file is attached, deliberately: single-cell
diag on current master, no armed cell, no delta for
scripts/balance-panel.js to compare. Declared in the prereg
BEFORE the pilot. A future LAND arm MUST run the panel on its
before/after re-run.

## WHAT LANDS, WHAT DOES NOT

- LANDS ON THIS BRANCH (coordinator merges; worker does not
  push, bump, or verify live): prereg; instrument + proof test;
  pilot corpus (8 per-seed JSONs + sweep summary); this
  evidence; the draft spec above.
- DOES NOT LAND: no game-code change; no hook; no hurthome-rule
  change; no gate/price/deed change; no sibling files. The
  confirm band was not run (not triggered — see pilot gate).

## PROOF

- scripts/test-exphurt-a.js: 21/21 green (disconnect boundary
  incl. the Aki 2-vs-14 fixture, missing-duration handling, exact
  current expeditionReturn + landed hurthome templates, closing-
  part day+part+name filtering, pooled M1/M2/M3/D fixtures).
- scripts/test-hurthome-b.js: 20/20 green (lib unchanged).
- Determinism leg: NOT run — no before/after comparison is
  claimed, and the instrument reuses the fix-c harness whose
  determinism was established there. Stated, not implied.
- Instrument errors: 0 across all 8 judged seeds. No
  unclassified cases. Retro-opened 2 (both consistent with the
  fix-c coverage mechanism).

## METRIC REVIEW (for the NEXT run, not a revision of this one)

- The pilot gate's expedition-case bar (>= 8) was miscalibrated
  for this unit: expedition cases run 0.75/seed on the event
  instrument, not hurthome-a's 1.75 dawn-episodes/seed across all
  purposes. Next run: budget 16 seeds up front (expected ~12
  expedition cases) instead of 8 + a narrowly-triggered confirm.
- D at open understates divergence: the expedHurt cap lands
  DURING the episode (Abderrazak: open 20 vs 20, last-hurt 12 vs
  20). The instrument already records expedDurationAtLastHurt;
  the next run should pre-register D-at-last-hurt alongside
  D-at-open (descriptive here: 2/6 vs 1/6) and judge D on the
  pre-registered one, not the friendlier of the two.
- M1/M2/M3 worked exactly as designed; closing-part capture is
  clean (0 errors, lines 18 = cases 18). Keep the trio, but the
  next run should ALSO pre-register M1 over ALL returned-hurt
  expedition cases (not just announced ones), so the
  player-away silence branch — proven real by Meera's visit
  return — is inside the metric instead of beside it.
- "Turn-home" language note: latency is now 1 part for every
  hurt expedition return, so latency no longer discriminates
  anything in this question; future arms should not re-measure
  it as a primary.
- Convergence state for this axis (food-economy, exphurt blank):
  BEHAVIOR FIXED (hurthome fix, 1220Z), NARRATION MEASURED + SPEC
  DRAFTED (this arm), SPEC-READY PENDING on a confirming re-run
  at adequate N. The axis itself is not converged.

## SENSE-TESTING LAW — SCOPE NOTE

Beyond the hurt-return corpus: no wider dialogue verdict is
claimed — transcript capture was instrumented for hurt-traveler
lines, return lines, and lines naming case villagers only. The
one pattern found beyond the census (a silent hurt return when
the player is away, Meera s99906) is flagged above as a finding
for the backlog, not a verdict on the silence branch generally.
