# Journey: crisis leg (6) r22 — the menu that wouldn't end (2026-10-18)

## Pre-registration (MEASUREMENT.md §§9–12, 14)

- **Leg:** 6 — crisis, r22. Fresh angle: **THE MENU THAT WOULDN'T END.**
  r21's found-not-fixed #1: the beat-matrix menu path produces 8 choices —
  `pre(2).concat(beatMenu)` has no cap in finalizeMenu; MAXC only gates the
  alive/pivot sections of the fallback path. Steve's one-screen rule
  (390×844, moment-to-moment play never scrolls) is non-negotiable.
- **Leg question:** Do crisis conversations still violate the one-screen
  rule — does the beat-matrix path produce uncapped choice lists in a
  crisis context (muster/mourning/outbreak lately event active)?
- **Interesting finding criteria:**
  - (a) reproduce an uncapped beat-path menu in a staged crisis convo
    (lately event active + crowded villager), on pre-fix code;
  - (b) fix: cap the beat-matrix concat at the same MAXC budget the rest
    of the pipeline uses, with the alive/event items still leading (r21)
    and the structural 'leave' exit preserved;
  - (c) RED→GREEN proof on seeds 7/42/99 + no-regression suites;
  - (d) sense-read 3 full transcripts in a real crisis playthrough while a
    lately event is active (oracleV2 15d + staged siege, r20/r21 pattern).
- **Seeds:** proof 7, 42, 99 (crisis-proof convention); sense-read 2101
  lineage (fresh seed 3201/3202 for telemetry if needed).
- **Primary metrics (binding, §14):**
  - M1: RED→GREEN on seeds 7/42/99 — pre-fix, the staged beat-path menu
    exceeds MAXC (7) content choices; post-fix, buildMenu returns ≤ MAXC
    content choices with alive/event items leading, exactly one event
    choice when an event is active, no duplicate ids, and 'leave' present.
  - M2: no regressions — crisis + convo check.js suites green, r20 muster
    game test green, r21 event-queue test green (6/6), check.js --quick green.
  - M3: 3 full crisis-conversation transcripts SENSE-read during an active
    lately event — NPC wants something, options engage/deflect, endings
    resolve/plant/owe; census in plain words.
- **Kill rule:** if the cap starves an earned/structural verb in practice
  (a verb present on pre-fix menus vanishes from every menu state in the
  sense-reads — e.g. teach, offer_help, the want menu), scope the fix
  differently — NO-GO. Not triggered (see below).
- **Horizon:** proof: staged, same-day. Sense-read: oracleV2 establish 15d
  + staged wave-4 siege, convos while mustered/mourning.
- **Method:** scripts/test-crisis-menu-cap-20261018.js (RED→GREEN proof);
  scripts/diag-crisis-menu-cap-20261018.js (sense-read pilot).

## Metric review (§14)

- **M1: HIT (3/3 seeds, 13/13 assertions each).** RED→GREEN confirmed both
  directions via patch round-trips:
  - Beat-path cap (conversation.js): pre-fix 11 items / 10 content on the
    stacked crisis staging (mourning event + 2 threads + 2 memories + news
    beat + doubt + held beats + threadLog); post-fix 7 items (6 content +
    silence), event leads, leave pinned, no dups. RED verified by running
    the test before the fix (1 fail = the cap assertion); GREEN after.
  - Wrapper cap (villager-agency.js): pre-fix a stubbed live betrayal case
    pushed the capped beat menu to 10; post-fix 8, betrayal leads, event
    survives the trim. RED verified via patch round-trip on
    villager-agency.js alone (12 pass / 1 fail pre-fix).
- **M2: HIT.** check.js --only crisis 11/11; --only convo 13/13; r20 muster
  game test 35/35; r21 event-queue test 6/6 (seeds 7/42/99); shelter-verb
  35/35; check.js --quick 96/97 — the single failure is
  test-sprites-valid-20261014 (dustboar/sunback/sweeps_week/cliffhanger
  sprites), verified byte-identical on pristine HEAD via patch round-trip:
  pre-existing, unrelated to this change.
- **M3: HIT with notes.** 9 full crisis conversations sense-read across
  seeds 3201/3202/3203 (oracleV2 15d + staged wave-4 siege, muster active,
  lately='naming' event live, villagers crowded with 2 threads + 2
  memories). Every beat-path menu in real play ≤8; the only >8 menus are
  the deliberate reactive+live-betrayal exemption (all items structural).
  - Kill rule FIRED once, then resolved: the first wrapper-cap version
    (raw tail-trim) starved 'teach' from every menu on the live-betrayal
    seed 3203 (control without the cap: teach present; with the cap:
    absent). Per the kill rule the fix was rescoped — the trim now cuts
    the expandable middle (pool reactions, recaps, topic asks) before
    leads and earned verbs (priority: confrontation > alive/event >
    want verbs > earned verbs > pool+topics). Re-run 3203: teach and
    dlg:invite reappear, e.g.
    `[agency:ask_expedition, alive:event:naming, alive:thread:goal,
    alive:memory:feast, teach, goon, leave, silence]` — the cut landed on
    ask:lately/ask:you/ask:goal. Kill rule NOT triggered on the rescoped
    fix. Earned verbs observed across the runs: teach, skill_learn,
    skill_teach, dlg:invite, invite_party, dlg:help/commit/cant,
    agency:ask_expedition/ask_field, offer paths.
- **Telemetry deviation check:** new leg-specific baseline seeded at
  `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/crisis-menu.json`
  (3 runs: maxMenu=32, convos=9, menuStats=89, verbsSeen=111). The seeding
  run printed the expected "newly appeared" LOUD lines (baseline was `{}` —
  artifact of first seeding, not a deviation); the follow-up check against
  the seeded baseline is quiet. No existing baseline was modified.

## The blank: the beat path had no menu budget, and the wrappers had their own (FIXED)

**Finding 1 — the beat path (r21 found-not-fixed #1, confirmed).**
`buildMenu`'s beat branch did `pre(2).concat(beatMenu)` with no MAXC cap.
In a crisis (lately event + crowded villager + stacked beat conditions:
news beat, doubts, held beats, theorize, recap, teach, invite) the
common menu after an opener grew to 11 choices — an unbounded swipe pile
in a dialogue box where ~4 are visible. Reproduced on seeds 7/42/99.

**Fix** (design calls mine — Steve overrules):
- `src/js/conversation.js` (beat branch): cap the combined list at the
  assembly path's MAXC budget (7 content choices), keeping the alive/event
  lead (r21) and pinning the structural 'leave' — a menu that strands the
  player is a dialogue-box softlock. Cuts land on the tail (discovery
  verbs, pool reactions); the want/goon lead is never cut. 'silence'
  rides after via finalizeMenu rule 4, as on every path.
- Post-fix stacked menu:
  `[alive:event:mourning, alive:thread:goal, goon, dlg:more, dlg:react,
  leave, silence]`.

**Finding 2 — the wrapper prepends (discovered live on seed 3202).**
`betrayal.js` and `villager-agency.js` wrap `Game.convoChoices` and
PREPEND urgent items after buildMenu/finalizeMenu ran — outside any
budget. A live betrayal case pushed a capped 8-choice beat menu to 10;
two live cases pushed to 13. (`party-formal.js` already self-caps at 7;
`truth.js` inserts confront: before leave and drops an ask: past 6.)

**Fix** (design calls mine — Steve overrules):
- `src/js/villager-agency.js` (outermost wrapper — all inner injections
  have landed): enforce the same 7-content+silence budget. Injected leads
  (agency/betrayal) keep priority; the trim cuts the expandable middle
  first (priority: confrontation > alive/event > want verbs > earned
  verbs > pool+topics — the kill-rule rescoping); 'leave' pinned,
  'silence' last.
- **Deliberate exemption:** reactive menus (ans:/gq: — the question owns
  the menu under the answers+2 contract) are exempt: every item there is
  structural to the hanging question, and prepends add urgency without
  cutting. A live betrayal confrontation + a hanging question can still
  reach 10 — documented, not a bug: both are "the conversation".
- Post-fix seed 3203 (two live betrayal cases): every non-reactive menu
  ≤8; reactive+betrayal menus 9–10 by design.

## People check (SENSE-TESTING LAW)

- **Blanca (3201):** opened with a hanging night-question AND a buried
  food cache — "I buried this before the Scattering. Seemed stupid to
  keep it secret." → +922 kcal to the pantry. A real choice with a real
  consequence. Her goal thread: "I interrogate the world instead of
  praying to it. Different strategy, same silence." Character intact.
  Event choice (naming the Flashbulb Moth) led and was picked first.
- **Dylan (3201):** hanging question about his taken kin (KIN.md canon);
  goal thread is grief — "Don't tell the others how much I talk about
  her. They'll think I'm not coping. They're right." / "Blood first. Then
  the family you choose." The event menu was capped at 8 and he picked
  through it naturally. Ends resolve.
- **Alma (3201):** agency asks (taught Shea, Staghorn Sumac — knowledge
  moving person to person), goal: "I don't need you to believe in me. I
  need you to watch." / "Back home I was invisible. Here, someone might
  actually see me." A person, not a menu.
- **3203 (two live betrayal cases):** menus stayed navigable — the
  confrontation leads, the conversation continues behind it, leave always
  present. No stranded states observed.
- Verdict: the capped menus read BETTER — the leads (event, want, goon)
  survive and the tail that got cut was the swipe-pile nobody missed.

## Census (plain words)

- Seed 3201 (d18, mid-siege, muster active, threat "The Congregation" at
  the treeline): 11 landed, all alive — Meera (lawyer), Blanca
  (esl_teacher), Dylan (musician), Alma (mortician), Claudete
  (appliance_repair), Nina (mechanic), Ingrid (physical_therapist), Benoit
  (baker), Olivia (social_worker), Emma (veterinarian), Zoe (journalist).
- Seeds 3202/3203: muster fired d18 both; 3203 ran two simultaneous live
  betrayal cases (case_4, case_6) — the village is mid-argument about both
  the monster outside and a traitor inside. Crisis leg indeed.

## Verdicts

- **Reachable:** YES. The cap only trims overflow; every verb remains
  reachable on uncrowded menus, one subject-change away, or next
  exchange. Nothing moved behind a gate.
- **Fun:** YES. Menus now lead with what's alive (r21) and never exceed
  8 outside the deliberate reactive+betrayal exemption. The 11–13-item
  swipe piles are gone; the leads are what a player wants anyway.
- **Winnable:** YES, unchanged. Menu ordering only; no sim-economy
  channel (same-seed behavior verified byte-identical in r21 for the
  analogous reorder; this run's changes are menu-assembly only).
- **One-screen rule:** HELD on the beat path and the wrapper chain
  (≤8 rendered incl. silence), with one documented exemption
  (reactive+live-betrayal, all items structural). The fallback path's
  deliberate earned-verb tail (up to 12 by the 2026-10-07/08/12
  starvation fixes) is now also capped at 8 by the wrapper — with
  earned verbs protected from the trim.
- **Convergence:** blank fixed + proven RED→GREEN both directions +
  kill-rule fired and rescoped + pilot sense-read + telemetry seeded.
  Done.

## Found but not fixed (for future runs)

1. **"Lost my train of thought" on the naming event (r21 #2, now with a
   live observation).** Alma picked `alive:event:naming` and got
   "...Sorry, lost my train of thought." — the event topic had no backing
   beat content for her at that moment, so it fell into the forgetful
   lines. Mostly a staging/content artifact, but the fragility is real:
   an event on-ramp that leads nowhere reads as a broken promise.
2. **Resume-opener label doubling (r21 #3, observed live twice).**
   "About About what they want — we never finished." when a planted
   label already starts with "About". Cosmetic.
3. **Reactive+live-betrayal menus reach 10 (deliberate exemption).** When
   a betrayal confrontation (up to 6 choices) coincides with a hanging
   question, the menu is 9–10 items — every item structural. Handled by
   the list scroll; revisit only if Steve finds it heavy.
4. **Reactive gq menus without 'leave' (observed, pre-existing).** A
   hanging generic-question menu (`[gq:open:take, gq:open:unsure,
   gq:open:honest_pass, agree, invite_party, silence]`) offers no 'leave'
   choice — exit is via the chat ✕ only. Pre-existing design, untouched
   by this run; flagging in case it's intentional or not.
5. **r20's open design question stands:** should an ACTIVE muster boost
   threat/muster priority over mourning/naming in t2LatelyEvent?
   Steve-call, not taken here.

## Files

- Fix: `src/js/conversation.js` (beat branch: ONE-SCREEN CAP at MAXC,
  alive lead kept, 'leave' pinned), `src/js/villager-agency.js`
  (outermost wrapper: same budget, priority trim, reactive exemption)
- Proof: `scripts/test-crisis-menu-cap-20261018.js` (RED→GREEN both
  fixes, 13/13 × seeds 7/42/99; wrapper assertions via stubbed live
  betrayal case)
- Diag: `scripts/diag-crisis-menu-cap-20261018.js` (sense-read pilot,
  seeds 3201/3202/3203; per-turn menu sizes + beat-path attribution +
  verb census; full transcripts in run logs)
- Evidence: `evidence/2026-10-18/journey-crisis-r22.md`,
  `evidence/2026-10-18/journey-crisis-r22-{3201,3202,3203}.{json,log}`
- Telemetry: new baseline
  `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/crisis-menu.json`
  (seeded from the 3 r22 runs; check quiet)
- Patch records: `~/workspace/crisis-r22.patch` (conversation.js
  RED-verification round-trip),
  `~/workspace/crisis-r22-agency.patch` (villager-agency.js round-trip)
