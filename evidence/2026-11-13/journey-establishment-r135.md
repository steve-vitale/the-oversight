# Journey leg ESTABLISHMENT — r135 run note (2026-11-13, Lane A)

## Adoption (stale-lock recovery)
- This run (scheduled 04:45 CST) found the lock held by run
  `2026-11-13T07:44:52Z` (landing r129), heartbeat 17 min stale, last
  file write 10:25:25Z, no running node/jest process. Per the overlap
  guard: previous run DEAD, lock deleted, stale-lock recovery,
  proceeded. The r129 run itself COMPLETED and committed `6b99d6a90`
  (gate NO-GO — person-trust FORAGE 1 vs 2, merge blocked by design);
  its branch and worktree are PRESERVED unmerged for the
  trust-panel-bar decision — do NOT touch `journey-landing`, its
  branch, or its worktree.
- Rotation read `1` (establishment); write `1→2` at closeout.
- Base: local master `5e779a1b5`. Pre-flight: main tree clean, disk
  39%. Registration took ~148s (registry-lock queue behind a sibling
  reaper). Registry purpose label wrongly reads "establishment r130"
  (registration typo; run is r135) — cosmetic, recorded not repaired.
  Heartbeat loop runs from the goal hidden_files dir (not /tmp, r128
  lesson), 10-min cadence. A service restart ~11:08Z killed the loop
  (and SIGTERM'd the BEFORE panel mid-run at seed 2609); loop
  restarted (PID 1811). Registry-lock contention from two sibling
  reapers delayed heartbeats twice (11:18→11:32 gap; a manual
  heartbeat landed 11:33:57Z) — the tree was never at reaper risk (4h
  threshold), but the overlap-guard margin thinned to ~12 min once.

## Leg questions (named by r134's metric review + r134 panel)

**Q1 (diagnostic — RUNG-2/3 VISIBILITY).** r134: specialist ladders
move early then stall, and the rung math says rung 2 needs ~25
granting days, rung 3 ~55 — beyond the 42-day leg at first glance.
This run DIAGNOSES it from the committed r134-after panel (16 seeds,
2501–2516, no new sims for Q1). No game-code fix from Q1 in this run
(pre-registered).

**Q2 (primary — THE FIELD ASK FIRES DRY).** r134-after panel
recount: 19 field asks → 12 closers, ALL "There's more, but that's
for another fire." — a promise of more when there is nothing more.
Mechanism (`src/js/villager-agency.js`): `agencyChoices` offers the
field ask whenever `npcFieldLessons` is non-empty, but that counts
stale entries (teachable-plant entries whose plants the player
already knows; fought species already observed/slain in the codex).
The teach block then finds nothing to teach and the first closer
tried wins every fresh sitting. Fix: new `agencyFieldTeachable(vid)`
mirroring the teach block (teachable monsters > 0, OR teachable
plants > 0 AND an untaught plant exists in the data pool, OR places
> 0, OR monsters ≥ 2 for the generic line); `agencyChoices` offers
the field ask only when it holds; plus spend-on-delivery in
`agencyTeachPlant` (move `t.shift()` after the no-untaught-plant
return, so a dry teach burns nothing). Expedition ask untouched;
closer pool untouched; `npcFieldLessons` untouched. Menu-offer
change → `[needs-eyes]` in the commit message.

## Panel (matched band 2601–2616, FRESH, 16 seeds, competent + withDelegate + HUNTSTAFF=2, 42d)
Analyzer: `scripts/analyze-journey-establishment-r135-20261113.py`
(full output `journey-establishment-r135-analyzer3.log`; panels in
`evidence/2026-11-13/journey-establishment-r135-{before,after}-seed*.json`).
Seed band 2601–2616 verified FRESH (substring + word-boundary grep
over all `evidence/**/*prereg.md`; only 5-digit bands 26011–26015 /
26021–26025 / 26031–26035 / 26051–26055 and sim bands 62601/92601
hit; `2616` in preregs: 0 hits).
- BEFORE pilot (2601–2604): 3 field asks, all 3 dry (100% — the
  question is live, not 0). BEFORE full: seeds 2605–2609 completed,
  then the service restart SIGTERM'd the process; 2610–2616 re-run;
  16/16 complete. BEFORE: 13 field asks → 6 "There's more" closers,
  7 lessons; expedition asks 10.
- AFTER pilot (2601–2604) + full (2605–2616) on the fixed tree:
  16/16 complete. Trajectories IDENTICAL to BEFORE on all 16 seeds
  (endDay, alive, pantry, deaths all match) — the driver is
  deterministic and the fix touches only conversation menus.

## Q1 verdict: R2-REACHABLE
Rung math pinned from code (`src/js/food.js` `specialistSkill` +
`src/js/game.js` `grantFoodXpCredit`): rung 1 at foodXp ≥5, rung 2 at
≥15, rung 3 at ≥30; above 5 XP accrues 2:1, so rung 2 needs 25
granting units from 0, rung 3 needs 55.
- Per-window table (r134-after panel, 16 seeds):
  - d1–d14: butcher R2X=0 R3X=0 fx15=0 fx30=0 | cook R2X=0 R3X=5
    fx15=0 fx30=0 | preserver R2X=1 R3X=2 fx15=0 fx30=0 | builder
    R2X=1 R3X=0 fx15=0 fx30=0
  - d14–d28: butcher R2X=0 R3X=1 fx15=2 fx30=0 | cook R2X=7 R3X=1
    fx15=12 fx30=0 | preserver R2X=2 R3X=7 fx15=3 fx30=0 | builder
    R2X=1 R3X=0 fx15=2 fx30=0
  - d28–dEnd: butcher R2X=1 R3X=0 fx15=1 fx30=0 | cook R2X=13 R3X=0
    fx15=14 fx30=0 | preserver R2X=1 R3X=4 fx15=4 fx30=0 | builder
    R2X=3 R3X=0 fx15=4 fx30=0
  - Panel totals: spec 1→2 crossings R2X=30 | spec 2→3 R3X=20 |
    foodXp 15-crossings=42 | foodXp 30-crossings=0
- R2X split: self-taught (foodXp ≥15 at crossing) = 28 | holder (+1
  at 5 XP, foodXp <15) = 2. **Rung 2 IS reached inside 42 days** —
  r134's "~25 granting days, beyond the leg" estimate was too
  pessimistic.
- R3X split: self-taught (foodXp ≥30 at crossing) = 0 | holder = 20.
  **Rung 3 by mastery is beyond the leg** (the code comment itself
  says mastery takes "a full season of steady work"); rung 3 in the
  panel is entirely the occupation bonus. No lever owed — whether the
  leg should show rung-3 mastery is a Steve design question.
- NEAR-MISS-2 (5–14 foodXp at d28, still <15 at dEnd): 40 villagers.
  Nearest to 15 at dEnd: 14 XP (Vasyl butcher, Marcus cook, Darkhan
  preserver).
- NOTE: the full analyzer's Q1 section first reported R2-BEYOND-LEG
  on 0/16 panels — a tooling bug, not a finding (see Analyzer
  repairs below). The standalone rung diagnostic
  (`journey-establishment-r135-rung.log`, holder/self-taught split)
  and the repaired full analyzer agree: R2-REACHABLE.

## Q2 verdict: GO (all three bars)
- **Q2a CLOSER COUNT: "There's more" BEFORE=6 AFTER=0 (bar AFTER =
  0) → GO.**
- **Q2b NO LESSON HIDDEN: field-ask lessons BEFORE=7 AFTER=7 (bar
  AFTER ≥ BEFORE − 1) → GO.**
- **Q2c ASK→LESSON RATE: AFTER asks=7 closers=0 (bar 0 closers) →
  GO.** Every field ask now ends in a lesson.
- **Q2d GUARDS: invitations answered 20/21 = 95% — PASS** (accept
  18, decline 2, unanswered-spoken 1, offered 21); **Q3 null lines 0
  — PASS**; **M3 survival-42 16/16** (bar 12); **M4 0 starvation
  deaths 16/16** (bar 12).
- **Q2e SPOTTER GUARD: foodXp['spotter'] total = 0** (spotter never
  gains foodXp; R2X/fx15 all 0).
- **REGRESSION: CLEAN** — trajectories identical BEFORE vs AFTER on
  all 16 seeds. The menu-only fix moved nothing else.
- Proof test `scripts/test-journey-establishment-r135-fieldgate.js`:
  **22/22 green** (source checks A–H, analyzer synthetic corpora
  J–O, live seeds 2601–2603 P, det-gate Q–U: driver twice, 5d seed
  2601, byte-identical outputs). Fail-control verified on unfixed
  code (A–D false, E/G true, F true after the escaped-form fix).
- Proof-test repairs at closeout (all test-side or gate-side; the
  game fix and the panels were never affected):
  1. Gate plant branch read `cx.plants[p.id]` where `cx` IS the
     plants map — it threw inside the gate's try/catch and silently
     returned false, so the first proof run showed the plant
     scenario failing while the turn still taught. Fixed to
     `cx[p.id]`; the live-seed plant scenario now passes
     end-to-end. The try/catch masking is a known property of this
     gate (fail-closed for the menu) — the proof test's plant
     scenario is the guard against it going forward.
  2. Check A regex couldn't cross the `)` in `(k.monsters || 0) >=
     2`; check D regex was missing a closing brace (the fail-control
     couldn't distinguish it — it read false on unfixed code as
     expected); check B regex was written against the buggy
     `cx.plants` form. All three fixed; re-run 22/22.
  3. Generic-fallback scenario needed a stale plant entry for the
     ask to be offered at all (`npcFieldLessons` must be non-empty)
     — the generic line is reached THROUGH a stale entry, which the
     test now models, plus a check that the stale entry survives the
     turn (spend-on-delivery through the generic path).

## Analyzer repairs (tooling, this run)
- The full analyzer's Q1 section passed r135 seeds (2601–2616) to
  the r134 panel loader (band 2501–2516) → 0/16 loaded →
  "R2-BEYOND-LEG" on empty data. Fixed with positional `R134_SEEDS`
  (2501–2516).
- That exposed a second latent bug: `(jr134 or {}.get('cookLog') or
  [])` — `or` precedence returns the whole dict when jr134 is
  truthy, so the loop iterated dict keys (strings) and crashed on
  `.get('day')`. Fixed all four sites (cookLog/mendLog/huntLog/
  daily) with `((jr134 or {}).get(...) or [])`. Both bugs were
  invisible until jr134 actually loaded.
- The analyzer's Q1 R3 boilerplate "(expected 0 — ...a crossing
  would overturn the math...)" is stale: 20 crossings ARE expected
  (all holders, per the rung-log split). Not re-scored; recorded
  here. The full analyzer's Q1 near-miss seed labels read the r135
  counterpart (positional pairing); the rung log carries the true
  r134 seed labels.

## Village assessment (AFTER panel, plain words)
Sixteen villages ran the full 42 days; all 16 survived to day 42
and none lost the village. 152 people alive at the end across the
panel (4–12 per village; seed 2605: 4 alive — the thinnest village;
seeds 2601 and 2610: 12). Wave 4 reached on 10/16 seeds, wave 3 on
the other 6 — the leg's horizon pushes past wave 1 into the wave-3/4
fights, as a competent player's establishment should. Pantries are
fat by day 42 (median ~57k kcal; seed 2613: ~106k; thinnest seed
2605: ~13k) — food is not the binding pressure in this window; the
binding pressure is who learns what. Deaths 33–68 per village (753
total), mostly fighting, not hunger — zero starvation deaths
anywhere. Practice moves everywhere: 596 competence moves across the
panel windows; 670 treat ticks. Specialist ladders move early (Sung
cook 0→2, preserver 0→2 on seed 2601). Parties form: Divya/Manuel
name APEX SNACKS and take roles ("Roles. Not ranks — promises."),
with the one-of-each rule voiced on the handoff.

## People check (16 AFTER convo transcripts, read in full)
Villagers read like people, and every field ask now delivers a real
lesson — the fix reads in the wild, not just in the proof test:
Micaela (2607) teaches Açaí; Irving (2608) a burned farmhouse;
Anna (2609) Bitter Manioc; Nicole (2612) Poison Hemlock plus a
monster lesson (Lockpick); Chester (2612) a cellar full of jars;
Tshepiso (2612) Gum Acacia; Kieran (2616) Death Cap. The expedition
ask is untouched and healthy (10 asks, 10 lessons: cellar, Murumuru,
White Crossberry, Chickweed, Pedunculate Oak Acorn, Egusi Melon,
Bamboo Shoot, Cupuaçu, Açaí). Good moments: Sung (2601) "I think
we're an experiment someone forgot to label" and "A full night's
sleep... That's my whole theology now."; Jorge (2601) teaching
slope-reading for water, "how their grandmother did it"; Viola
(2602) "I did the count twice. The count doesn't change."; Deivis
(2602) "some people here are performing, not surviving" and "Watch
the quiet ones."; Madison (2603) "Shock's underrated."; María
(2603)/Alex (2613) "Tunes outlast everything."; Simone (2610)/Wanda
(2615) "I'd rather be boring to the sky. Boring things get left
alone."; Gerald (2611) "Someone saved me the last of the stew once...
I think about that bowl more than I think about the monsters.";
Hoani (2614) "rural New Zealand. I still dream in its weather — rain
on a tin roof"; Rabi (2613) "I miss being bored."; Amara (2613)
"Food is the first promise. Everything else — trust, plans, hope —
comes after."; Amina (2616) "I count portions out loud before
eating. It doesn't bring anyone back. It just keeps my hands from
shaking."; Victor (2616) "Do you ever wonder what the aliens eat?
Like, do they have potlucks?"; the nonverbal conversations (Rizky,
Dehua, Namfon, Rania, Aiman) all read well — the one-English-word
gag ("Food?" / "Water?" / "Fuck you.") lands each time without
feeling broken. Invitation declines carry character (Mario trust 24,
Hendrik trust 15, Leah trust 42 — declines name real reasons).
Accept-then-back-out: 0×. YOU lines truncated mid-sentence (Howard
2604, Desmond 2604) are the known driver artifact (80-char label
slice), not a game defect.

Standing watch — recurring canned lines (documented, NOT fixed in
this run: prereg scope is the field ask only; these are
conversation-flow items for a later run):
- "There's more, but that's for another fire." — **0×** (BEFORE: 6×;
  r134: 12×). Gone.
- Taken-kin pod-dream closing ("The pods get into my sleep some
  nights. Row on row of them, humming like a held note — and I wake
  up reaching for something that isn't there.") — **4×** (r134: 2×;
  Anna 2607, Atlas 2609, Brendan 2610, Nicole 2612), verbatim across
  different villagers and kin. Reads fine once; repetitive across a
  panel.
- Recap stitch ("X — Still on Y") — **5×**: María 2603 ("We need
  to — Still on whether you still sing."), Chester 2612 ("Don't laugh
  yet — Still on whether you're staying."), Alex 2613 ("Can I be
  honest? Still on whether you still sing."), Marta 2615
  ("Interesting — Still on the gossip."), Brendan 2610 ("Well now —
  Still on that taken person."). Mostly reads fine; occasionally
  abrupt.
- Slope-reading lesson ("how they read a slope for water, how their
  grandmother did it") — **4×** verbatim (Jorge 2601, Fernando 2607,
  Chester 2612, Marcus 2613), different teachers, same line.
- "Walked in like they'd never left." — **5×** (Alikhan 2601 Sung +
  Rosa, Ji-won 2611 Devon, Marcus 2613 Grace, Manuel 2614 Rosa,
  Marta 2615 Jada).
- "Take it for what it's worth." (gossip closer) — **3×** (Rajbir
  2605, Henry 2607, Marta 2615).
- "A beat. Then, as if shaking something off:" (colon fragment, no
  continuation) — **0×** this panel (BEFORE 2602: 1×; r134: 1×). Not
  observed.
- "Control group" theory — **0×** this panel (r134: 2×). Not
  observed.
- Minor odd lines, not defects: Amara (2613) "They're already
  drifting away. "Later."" (abrupt ending); "A pause. When they speak
  again, it's about something else entirely." (names the drift;
  honest but flat).

## Verdicts
- **Reachable: YES.** Rung 2 is reached inside the leg (30
  crossings); every field ask now delivers a lesson when offered.
- **Fun: YES.** Conversations read like people; the fix removes the
  one recurring false promise that made the field ask feel broken.
  The recurring template lines above are the next variety
  candidates, not this run's scope.
- **Winnable: YES for the leg.** All 16 villages survive to day 42
  with wave 4 reached on 10/16 and parties forming with roles. The
  winnability chain beyond the leg (wave-4 kills → veterans → wave 5)
  is still the open hunt, unchanged by this fix.

## Metric review
- Q1's diagnosis is done: rung 2 IS reached in the leg (30
  crossings, 28 self-taught), rung 3 by mastery is not (0
  self-taught) and the occupation bonus does that work instead. The
  next establishment question should ask whether rung-3 mastery
  belongs in the leg at all (Steve design question), not re-measure
  rung 2. The full analyzer's Q1 section needed two repairs to say
  so — both are now fixed in the committed analyzer, and the
  standalone rung diagnostic is the cross-check.
- Q2's fix is exactly scoped: dry asks gone (13→7 asks, 6 closers→0),
  lessons intact (7→7), trajectories identical. The gate's try/catch
  masks body bugs as "not teachable" (fail-closed for the menu);
  the proof test's live-seed plant scenario is the standing guard
  against that — keep it in the proof test.
- Breadth test C15–C17: PRE-EXISTING failures, identical on unfixed
  master (44 passed, 3 failed both ways) — stale expectations from
  the one-lesson rule (journey-succession 2026-10-12), which changed
  `agencyTurn` to one lesson per ask without updating the test (it
  still expects +2 breadth and a spent entry from one ask). NOT a
  regression from this fix, and NOT a gate failure:
  `test-breadth-20261010.js` is not on the green list (it was among
  the stale/unlisted tests in the 2026-10-14 census), so check.js
  never runs it. Test-maintenance debt for a later run, recorded
  here, not fixed silently.
- ENCOUNTER-GEAR RULE (Steve 2026-11-13, landed in MEMORY.md during
  this run): every test must stage the average gear + party a player
  actually has when they reach the content. It does not change this
  run's panels — the journey driver plays the live village state
  (12 villagers, real gear/progression, competent + withDelegate),
  not a staged solo-scholar fixture — but it binds future
  combat-fixture panels: derive the loadout from measured play data
  and write it into the prereg, never invent gear.
- The reaper's registry-lock hold (whole run, 9–14 min) delayed two
  heartbeats this run; the overlap-guard margin thinned to ~12 min
  once. Heartbeat-first on long-idle trees + a manual heartbeat when
  the loop's beat is overdue remain the mitigations. The lock
  self-contention fix is still owed (needs a Steve nod).

## Telemetry
`telemetry-check.js` vs the r132 baseline (guardrails.deaths,
guardrails.popAlive, guardrails.pantryKcal, c3.starvationDeaths,
AFTER panel 16 files): **quiet, no large deviations**. Baseline NOT
rolled forward: the AFTER panel is a fix-on panel on a matched band,
and the baseline stays the r132 control until a future run decides
otherwise (same call as r133/r134). Measurement-proof refresh still
owed since r129 — no retained panel was available to refresh it
against in this run; still owed.

## Landing
- Gate (pre-rebase): `node scripts/check.js --quick` —
  **330 passed, 10 failed in 1509s** (r134: 335/5 in 813s; the gate
  ran ~2× slower — box load avg 11.08/11.69 at gate time on 1.5
  shared CPUs). The 10:
  - 4 non-timeout: `test-measurement-proof-update.js` (balance-proof
    staleness — pre-existing since r133), `test-measurement-workflow.js`
    (8/9 — pre-existing), `test-phone-frame-proof.js` (receipts —
    pre-existing), `test-measurement-cache-flags.js` (0/4 — the
    documented load artifact: the failing sub-check is panel
    completion under the spawn/timeout budget, AGENTS.md 2026-11-12).
  - 6× 120s TIMEOUT (exit null, no assertion failed):
    `test-living-garden-deed-attainment.js`,
    `test-one-person-army-deed-attainment.js`,
    `test-occupation-panels.js`, `test-trust-observer-neutrality.js`,
    `test-capable-bot-20261014.js`, `test-synergy-stall.js`.
  - Adjudication (adoption, 2026-11-13 ~07:06 CST): the same 4
    timeout tests (trust-observer-neutrality, synergy-stall,
    capable-bot, deed-attainment) timed out on r134's rebased tip
    and passed standalone — the established load-artifact pattern
    for exactly these tests. This run adds occupation-panels (same
    sim-heavy class; its shown assertions all pass before the
    120s cut). The fix cannot slow sims (menu gate, pure reads;
    BEFORE/AFTER trajectories byte-identical on 16 seeds).
    Standalone anchors, run by the adoption coordinator:
    living-garden FULL re-run with a 900s timeout — **PASS 8/8
    in ~609s** (`journey-establishment-r135-livinggarden-rerun.log`);
    cache-flags A/B — gate run at the 30s cap 0/4, re-run with
    300s timeouts **4/4** (`journey-establishment-r135-cacheflags-300s.log`),
    the documented load artifact (AGENTS.md 2026-11-12); the 30s
    cap stays, no code change. The 4 non-timeouts: proof-update +
    workflow 8/9 are the measurement-proof staleness pair
    (pre-existing since r133; refresh round 11 still owed);
    phone-frame is the stale-receipt class (pre-existing). **None
    of the 10 is attributable to the villager-agency.js fix.
    Gate: GO after adjudication.**
  - Commit: `bf245117c` (96 files: the fix in
    `src/js/villager-agency.js`, proof test, driver, analyzers,
    prereg, run note, panels, gate log). Safe-commit index
    clobber struck (all 95 new files staged-as-deleted + MM on
    the fix); repaired with `git ls-tree -r HEAD` +
    `update-index --add --index-info`; status empty, diff HEAD
    empty, hashes match HEAD. [FILL: rebase, merge, rotation,
    lock.]
