# Journey leg ESTABLISHMENT — r134 run note (2026-11-12, Lane A)

## Adoption (stale-lock recovery)
- This run (scheduled 10:45 CST) found the lock held by run
  `2026-11-12T13:31:22Z` (landing r128), 3h12m old, with NO registry
  entry for that run_id and no heartbeat. Per the overlap guard:
  previous run DEAD, lock deleted, stale-lock recovery, proceeded.
  The r128 run itself COMPLETED and LANDED (commit `87f00547d` in
  master, worktree released, rotation-a already `1`); its lock file
  survived its own closeout — the anomaly is recorded here, not
  repaired beyond the recovery. Nothing held to adopt: no
  `journey-landing` worktree or branch remains on disk.
- Rotation read `1` (establishment); write `1→2` at closeout.
- Base: local master `ea1ef5a75` (sim-cut7confirm-b tip). Pre-flight:
  main tree clean, disk 39%. Flap-watch ALL-OK at run start
  (16:45–16:49Z). Registration took ~204s (slow host; internal reap).
  Heartbeat loop runs from the goal hidden_files dir (not /tmp, r128
  lesson), 10-min cadence.

## Leg questions (named by r133's metric review — both of them)

**Q1 (primary — LADDER STALL DIAGNOSIS).** r133: specialist-ladder
moves per window 34 (d1–14), 24 (d14–28), 4 (d28–dEnd) on the AFTER
panel, and the BEFORE panel shows the same shape — the unit cap does
not cause it. This run DIAGNOSES it from the committed r133 panel
data (no new sims for Q1). No game-code fix from Q1 in this run
(pre-registered).

**Q2 (people-check dial — CANNED GUARD LINES).** r133: "Something in
them almost softens — then doesn't. Not yet." 11× and "They hear the
warmth in it." 11×, both rising, firing as generic go-on responses —
e.g. after a gossip line about Joyce humming at the beans, where
nothing soft was happening. Mechanism (read from code,
`src/js/convo-mood.js` `convoMoodShift` guard branch): when a
villager's recent lived memory (last 5 days) holds a hurt, the FIRST
warming move per conversation is absorbed — mood does not move — and
one of a 2-line pool is queued as a held beat. Fix: rewrite the guard
pool into 6 observational lines that describe the villager holding
the moment at arm's length instead of claiming softening/warmth the
exchange didn't contain. Same trigger, same once-per-conversation,
same absorbed move — only the spoken lines change. Feel/copy change
→ `[needs-eyes]` in the commit message.

## Panel (matched band 2501–2516, 16 seeds, competent + withDelegate + HUNTSTAFF=2, 42d)
Analyzer: `scripts/analyze-journey-establishment-r134-20261112.py`
(full output in goal hidden_files `r134-analyzer.txt`; panels in
`evidence/2026-11-12/journey-establishment-r134-{before,after}-seed*.json`).
Band 2501–2516 is a DELIBERATE MATCHED REUSE (r133's band) — the §15
before/after comparison requires identical seeds. Amendment 1: the
4-seed pilot showed r133-after is NOT a clean BEFORE (master moved
between r133's panel and this run; 2/4 pilot seeds diverged), so the
binding comparison re-pointed to a fresh matched BEFORE panel
(`r134-before`, 16 seeds, fix OFF, current master). The pilot AFTER
files (2501–2504) stand — the driver is deterministic.

- **Q1 STALL verdict: RUNG-MATH.** Diagnostic table (r133-after panel):
  - d1–d14: butcher G=44 W=16 NEW=3 RES=49 | cook G=220 W=39 NEW=23
    RES=231 | preserver G=82 W=21 NEW=4 RES=59 | builder G=45 W=6
    NEW=4 RES=47
  - d14–d28: butcher G=87 W=19 NEW=7 RES=91 | cook G=243 W=40 NEW=9
    RES=244 | preserver G=178 W=29 NEW=6 RES=161 | builder G=56 W=8
    NEW=2 RES=57
  - d28–dEnd: butcher G=40 W=15 NEW=0 RES=40 | cook G=181 W=37 NEW=2
    RES=172 | preserver G=87 W=21 NEW=2 RES=72 | builder G=41 W=8
    NEW=0 RES=38
  - Pantry median at window start: d1=39,770, d14=34,363, d28=74,108
    (n=16/16/16)
  - NEAR-MISS (1–4 foodXp at d28, spec still 0 at dEnd): 9 villagers
    (butcher 4, cook 3, preserver 2; e.g. seed 2502 Dominic preserver
    3→3, seed 2511 Lucas butcher 4→4)
  - SATIETY: False (preserver RES w3/w1 = 72/59 — work ROSE; cook
    172/231 = 74%, not ≤25%; pantry fat at 74k but work does not stop)
  - SATURATION: False (W w3 ≤ 0.5×w1 on 0/4 specialties; w3 workers
    already-moved share 0.909)
  - RUNG-MATH: True (RES w3/w1 = 322/386 = 83%, NEW w3/w1 = 4/34 =
    0.12 ≤ 0.25)
  - Plain words: work continues at ~83% rate with the same breadth of
    workers, but the 0→positive metric saturates — the regular workers
    all crossed rung 1 by d28, and rung 2 needs ~25 granting days,
    rung 3 ~55, beyond the 42-day leg. The stall is partly a metric
    artifact (0→positive counts only first crossings) and partly rung
    math. Whether the leg should show rung-2/3 crossings in 42 days,
    or rung 1 is the leg's job (it does that: 34 moves in w1), is a
    design question for Steve — no lever landed in this run.
- **Q2a GUARD COUNT: ratio AFTER/BEFORE = 1.00 — GO** (BEFORE 16 lines
  / 64 convos = 0.25/convo, old lines 8+8; AFTER 16 lines / 64 convos,
  all 6 new lines used 5/3/3/2/2/1; old lines surviving in AFTER: 0).
- **Q2b BREADTH: 6 distinct lines — GO** (bar ≥4).
- **Q2c HONESTY (sense-read, all 16 transcripts in full): GO** — zero
  guard lines claiming softening/warmth the scene didn't contain. The
  exact r133 case is fixed on the nose: seed 2516 Kevin, after the
  Joyce-hums-at-the-beans gossip, now gets "The moment passes without
  landing. Not yet." instead of "Something in them almost softens."
- **Q2d GUARDS CARRIED: invitations answered 23/24 = 96% — PASS**
  (accept 18, decline 5, unanswered-spoken 1, offered 24); **Q3 null
  lines 0 — PASS**; **M3 survival-42 16/16** (bar 12); **M4 0
  starvation deaths 16/16** (bar 12).
- **Q2e SPOTTER GUARD: foodXp['spotter'] total = 0** (in the
  descriptive ladder line).
- **REGRESSION: CLEAN** — ladder + funnel keys identical BEFORE vs
  AFTER on all 16 seeds. The line-only fix moved nothing else. (This
  settles the pilot's seed-2501 pantry gap: master movement, not the
  fix.)
- **Q2 verdict: GO (as a breadth improvement — see Reconciliation
  with r184 below).** The fix lands.
- Proof test `scripts/test-journey-establishment-r134-moodguard.js`:
  **23/23 green** (guard absorbs first warming move, beat is a
  new-pool line, flush changes no mood/trust, second move lands,
  no-hurt warms immediately, grace absorbs first cooling move;
  det-gate: r134 driver twice, 5d seed 2501, byte-identical outputs).
  Proof-test repair at closeout: the synthetic corpora still wrote the
  BEFORE side under the r133-after tag while the Amendment-1 analyzer
  loads r134-before, so J–O failed 17/6 (BEFORE read as 0 convos /
  missing JSONs). Fixed the test to write r134-before files; re-run
  23/23. The game fix and the panels were never affected — only the
  test's corpus tags.

## Reconciliation with r184 (landed during this run)
Lane B's r184 (deepening leg, commit `83925055`, landed on master
while this run was in flight) investigated the SAME guard-beat
question and reached the opposite verdict on the premise: the beat
fires only on genuine warming moves — MISS 0/23 across its corpora
(r183 after-corpus 0/16, fresh panel 0/7, re-probe 0/5) — because
`moodguard` is called only in the guard branch, so a 0% MISS rate is
by construction. Its correction: the beat is SPOKEN only when the
player later picks `goon` — the continuer reveals a held beat queued
by an earlier warming move; the trigger is the last non-goon pick,
never the goon pick or the preceding THEM line. The r133 "fires as a
generic go-on response" framing was wrong, and r184 retires the
"rising counts" observation: counts of a correctly-firing guard are
not a defect signal. "No fix is owed; the dial is closed."

What this means for r134's Q2: the TRIGGER defect my Q2 set out to
fix does not exist — the beat was firing correctly all along, and
this panel's 16 firings are the guard working, not a malfunction.
What remains true from r133/r134 is narrower: the POOL is 2 lines,
so the same lines recur verbatim (11× each on r133, 8+8 on
r134-before). The fix landed here changes only the spoken lines (2→6
observational lines, same trigger, same once-per-conversation, same
absorbed move, regression CLEAN, trajectories identical). It is a
breadth/variety improvement, not a defect repair — and the old lines
were not lying: in r184's Yara example the "almost softens" line
lands precisely because the warmth before it was earned. The new
lines are calibrated not to overclaim when the warming move is small
(a yes, an "And?"), which is where the old line read canned on this
panel. Steve's call whether the variety is worth it or the dial stays
closed — flagged `[needs-eyes]` so he can judge it on his phone.
Q2's registered bars still read GO (they measured the fix as
specified: pool widened, mechanism unchanged, lines honest); the
premise correction is recorded here rather than re-scored.

## Village assessment (AFTER panel, plain words)
Sixteen villages ran the full 42 days; all 16 survived to day 42 and
none lost the village. 150 people alive at the end across the panel
(8–12 per village; seed 2506 and 2509: 12 alive; seed 2512 and 2514:
8). Wave 4 reached on 10/16 seeds, wave 3 on the other 6 — the leg's
horizon pushes past wave 1 into the wave-3/4 fights, as a competent
player's establishment should. Pantries are fat by day 42 (median
~88k kcal; seed 2503: ~150k) — food is not the binding pressure in
this window; the binding pressure is who learns what. Two villages
run thinner: seed 2516 at ~11.8k kcal and seed 2508 at ~23.6k — worth
watching, not alarming, with zero starvation deaths anywhere. Practice
moves everywhere: 181 skill 0→positive moves and 22,064 practice reps
across the panel — villagers genuinely get better at daily work by
doing it. Specialist ladders move early and then stall (34 moves in
d1–d14, 24 in d14–d28, 5 in d28–dEnd on the matched pair) — see Q1:
the work continues, the first-crossing metric saturates. Healing
happens: 670 care ticks, 389 tends, 46 medics seen — but most treating
is tending, not curing, which matches the known medic-cure gap. The
kitchen runs: 3,321 cook-duty calls, 119 rack events, 658 specialist
cooks. Hunters keep hunting: held kills (pellet holder) 60 vs
not-held 214, kcal ratio 0.51.

## People check (16 AFTER convo transcripts, read in full)
Villagers read like people, and the new guard lines read honestly in
context — none claims a softening the scene didn't earn. The six lines
all fire in fitting moments: DeShawn (2501) "They let the words sit
there, unanswered." after gossip; Saengkaew (2501, taken son Aibek)
"They hear you out, but something in them stays guarded." after she
asks about the System and the player agrees; Yakov (2502) "Something
in them stays shut, for now." after teaching Groundnut; Mai (2503)
"They nod — and keep their distance, for now." after comfort;
Francesca (2506) "They take it in and give nothing back. Not yet.";
Easton (2507) "They let the words sit there, unanswered." Good
moments: Larry the dentist (2501, Columbus, Ohio annoyed mornings);
Saengkaew's pod-dream + owed promise ("You'd do that? Ask it?...
Thank you. Really."); Deborah (2502) sharing stockpile (+4 wood, +4
fiber) and teaching Groundnut; Karl/Yakov (2502) "A full night's
sleep... Eight hours where nothing needs me"; Carmen's party naming
(2505) "THE ENSEMBLE" (Teresa, Carmen, Dehua — broadcast + Codex
note); David (2506) "Do you believe in anything?... That's not naive.
That's load-bearing."; Kirandeep (2510) "Yeah." / long quiet / "Me
too." (left someone behind); Nora (2512) trap-line fright ("Nora's
hand finds your sleeve"); Helga (2516) "Just: 'Yeah.' A long quiet.
'Me too.'"; Soo (2515) mourning Felipe ("The fire feels smaller
without Felipe. The rest of us will have to be bigger."). Invitation
declines carry character: Ellie (2508, trust 16), Mabel (2510, trust
25), Miguel (2511, trust 34) — declines name real reasons, consistent
with the rulings. No accept-then-back-out this panel; the r133
instance does not recur.

Standing watch — recurring canned lines (documented, NOT fixed in
this run: prereg scope is the guard pool only; these are
conversation-flow defects for a later run):
- Old guard lines "Something in them almost softens" / "They hear the
  warmth in it.": **0×** (r133: 11× each). Gone.
- Taken-kin pod-dream closing — **2×** (r133: 5×; both in seed 2505,
  Teresa + Rocco, and both deflect on "I don't know anything" — a
  real branch, not a copy). Down, and resolving honestly.
- "Take it for what it's worth." (gossip closer) — **2×** (r133: 4×).
- "Sorry — I shouldn't load that on you. What's up?" (deflect pivot)
  — **6×** (r133: 3×, rising). Next conversation-flow candidate.
- Field-teaching closer "Remember the leaf, the stem, the smell —
  that's the whole of it." — **1×** (r133: 3×). Variants persist
  ("Leaf, stem, smell").
- "There's more, but that's for another fire." (field ask when the
  villager knows zero places — the r184 SPEND-FIRST finding) —
  **12×**, identical on BEFORE. The most frequent canned closer on
  the panel; the field ask fires when there is nothing to teach.
- Accept-then-back-out: **0×** (stays gone). Stitched fragments:
  **0×**. Recap stutter: **0×**.
- New watch items (not fixed, noted): the "control group" theory
  ("we're the control group... somewhere there's a village that got
  instructions") recited verbatim by two different villagers (Mabel
  2510, Maeve 2512); Priya (2509) "A beat. Then, as if shaking
  something off:" — a beat line ending in a colon with no
  continuation after it. Minor odd lines, not defects: Otto (2503)
  "That was me — headed out for water." (gossip self-correction,
  slightly confused); Dehua (2505) "Still on your useful old-life
  skills. Extremely normal, all of it." Leo's "Their whole posture
  softens around you." (2508/2512) is a favor-scene line, NOT the
  guard pool — correctly untouched.

## Metric review
- Q1's diagnosis is RUNG-MATH, and the metric itself is half the
  story: 0→positive counts only first crossings, so it must saturate
  once the regular workers hold rung 1. The next establishment
  question should measure rung-2/3 crossings per window and XP per
  worker, not just first crossings — and the design question for
  Steve is whether rung 2 should be reachable inside 42 days at all
  (~25 granting days at current rates) or whether rung 1 is the leg's
  job. Proposed next dial: rung-2 visibility (crossings + XP-per-
  worker distribution). No lever landed here; the diagnosis is the
  deliverable.
- The delegate assigns the same fit people (91% of w3 workers already
  held a spec) — assignment saturation is not the stall, but the
  delegate is not spreading work to new blood. Watch when the
  role-formation work lands; a spreading dial may belong there, not
  in the ladder.
- Preserving continues past need (pantry 74k median at d28, still 72
  preserver resolutions in w3) — pantry satiety fails as the stall
  mechanism, but the behavior itself (preserving food the village
  does not need) is worth one line in a future pantry question.
- Q2's pool works: 6 lines, all used (5/3/3/2/2/1), count ratio
  exactly 1.00, zero regressions. Watch whether 6 lines stay fresh
  over more panels; the deflect pivot (6×, rising) and the "another
  fire" closer (12×) are the next conversation-flow candidates, not
  this run's scope.
- Pilot lesson (process): r133-after was NOT a clean BEFORE because
  master moved between runs. The Amendment-1 pattern — re-baseline
  in-run with a matched fix-off panel when master moves — worked and
  should be the default whenever a run's BEFORE corpus predates a
  master move.

## Telemetry
`telemetry-check.js` vs the r132 baseline (guardrails.deaths,
guardrails.popAlive, guardrails.pantryKcal, c3.starvationDeaths, AFTER
panel 16 files): **quiet, no large deviations**. Baseline NOT rolled
forward: the AFTER panel is a fix-on panel on a matched band, and the
baseline stays the r132 control until a future run decides otherwise
(same call as r133).

## Landing
- Gate: `node scripts/check.js --quick` — **335 passed, 5 failed in
  813s**, the identical known pre-existing set as r133/r185
  (balance-proof staleness; measurement-workflow 8/9; phone-frame
  receipts; 2× 120s deed-attainment timeouts). Zero new failures from
  the fix; proof test 23/23.
- Commit: [FILL at commit time].
- Rebase/merge: [FILL at merge time].
- Rotation 1→2 written. Lock deleted.
