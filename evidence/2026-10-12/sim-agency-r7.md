# Long-run sim — LEVER 3 sub-run r7: villager goal arcs — do goals live? (2026-10-12)

Worker: sim-agency-r7. Sub-lever: VILLAGER GOAL ARCS. Teach/learn proper is
r1/r2/r4/r6's lane, routines r5's — not redone (evidence/2026-10-12/
sim-agency-r5.md, sim-agency-r6.md read first; their documented blanks
carried below).

Canon read: docs/CANON.md, docs/CONVERSATIONS.md, docs/PARTY.md. No canon
doc covers villager goals as a system — the goal list lives in
src/data/characterGen.json and behavior is scattered across a dozen
modules (mapped in full below rather than invented).

## The village, in plain words

12 seeds × 200 days, competent policy. Brutal as ever: all 12 runs ended
village-lost, median day 78, best day 189. Combat is the great killer —
64.6% of player deaths, 68.3% of villager deaths; player starvation takes
31.3% (the mid-game food wall, still binding). Every run reached Arc 3;
wave 2 in 6/12, wave 3 in 6/12; no wins, no table. Breadth 52.7, stage 2.9.

Every village gets its contender (exactly 1.0 lead-goal villagers per
village across all 12 — the gen guarantee holds). The contender makes
noise constantly: 232 challenges issued (~19/run). The bot never engages
— every single one ages out unanswered. The rivalry beats exist for the
human player, not the sim.

The escape-goal villagers walk out (11 LEAVE departures): 8 died alone
out there (combat, starvation, disease — no danger checks, alone at a far
node), 2 were still away at day 200 (limbo — duration 999 outlasts the
run), 1 was exiled in absentia by a moot 63 days after walking out.
Nobody came back — the "some come back changed" path (30% on duration
elapse) is unreachable inside a 200-day horizon.

Who thrived: lead-goal villagers ranged as wanderers (75%) and died
fighting (5 combat deaths of 12); survive-goal villagers all ranged out
(7/7 departed on expedition). Who died: everyone, eventually — but the
escape-goal villagers died *of their goal*, alone past the ridge.

What was missing: the 'feed' goal didn't live. "Nobody goes hungry if I
can help it. That's the whole thing" — while foraging at exactly the
population rate (14.9% objective share vs 35.7% for 'belong'). The goal
was a label. That's the blank.

## Do goals live? — the full behavior map (measured + code-read)

Ranging (npcRangeProfile) differentiates: lead 75% wanderer, escape
27% explorer / 36% wanderer, prove 80% wanderer, protect 50% homebody,
heal 40% homebody / 0% wanderer, peace 50% homebody. The ±1 goal
modifiers show through the temperament/occupation noise.

Objective behavior per goal (sampled every 10d, 12×200d):
- escape: 100% LEAVE — never eats, rests, forages, or does chores. Ever.
- feed: 14.9% FORAGE — indistinguishable from noise (belong 35.7%,
  protect 20.9%, survive 20.0%). **THE BLANK (filled — see dial).**
- lead/prove/alone/survive/protect/belong/heal/understand: forage/chore/
  visit mixes driven by temperament, not goal. No goal reads the FORAGE,
  EAT, REST, or chore pickers except escape (and now feed).
- The 7 pure-label goals (understand, remember, home, record, legacy,
  joy, peace): ZERO behavior comparisons anywhere in src/js. They exist
  only as spoken lines (askAbout reveals, goalWant card text, convo
  templates). Honest labels, but labels.

Leadership arcs in sims: 232 challenges issued, 0 arc resolutions, 0
goal changes across 2400 villager-days. _maybeResolveContendArc needs 4+
stand-downs; the bot never confronts, so the gate never opens. The arcs
are not stalled — they are player-gated, and the player here is a bot.
All three beats (leave/refocus/respect) fire correctly when driven
(sense-test §5), including the honest goal rewrite on refocus
(lead→prove/protect/survive) and the 4-stand-down gate.

Contender death mid-arc: handled. removeVillager's LEADERSHIP HYGIENE
(betrayal.js) clears heat/challenge/alliances; _contendArc prunes dead
ids. 9 lead-goal villagers were removed in sims; challengeDays ==
challengesIssued (232 == 232) — no ghost challenge ever lingered.

Goal changes: NONE, ever, outside the leadership refocus (which never
fired in sims). No machinery exists for any other goal to change or
resolve — no "family found", no "wound healed → heal resolved", no "feed
fulfilled". The 16 non-lead goals are static for the whole run. Stated
plainly: goals are birthmarks, not arcs — except 'lead', which has an
arc only a human can walk.

## The dial (exact numbers — one dial, in villager-objectives.js only)

'feed' goal → forage drive, in objPick's FORAGE candidate:

1. **Gate**: feed-goal villagers forage when pantry < 6000 (others: <
   4000) — they feel the dip before anyone else.
2. **Weight**: +1.5 FORAGE weight for feed — when food is short they go
   out first (crisis 4→5.5, short 2.5→4.0, early-worry 1.5→3.0).

Guards kept: the homebody stay-home rule still wins (feed+homebody at
pantry 3000, hunger low → never forages); a full pantry (8000) still
closes the gate. The escape early-return sits above this code — no
interaction. Pure candidate-weight change: no new RNG draws, no mechanic
touched.

## Before/after on identical seeds (12 seeds × 200d)

- **Mechanism (driven proof test)**: pantry 5000, hunger low — feed
  FORAGE 153/300 picks vs control ('belong') 0/300. Pantry 3000 — feed
  245/400 vs control 210/400 (+8.75pp, clears the 5pp noise bar).
  Homebody guard intact (0/200), full pantry closed (0/200).
  scripts/test-feed-goal-forage-r7.js GREEN; RED-checked pre-dial
  (0/300 → assertion fails on the gate).
- **Sims**: the dial fires where it can — seed 10404's lone feed
  villager went 0% → 83% FORAGE share (trajectory diverged 37→59d).
  7/12 seeds have no feed villager at all (goal is ~6% of gen), so 10/12
  trajectories are near-identical — the dial is small and safe by
  construction. Aggregate feed FORAGE 14.9% → 11.1% is trajectory chaos
  on n=8 villagers (seed 11212's world died 79 days earlier post-dial;
  you can't compare shares across different worlds) — the driven test
  is the honest measure, and it is unambiguous.
- **No harm signal**: deaths 111 → 110; death-cause shares flat
  (combat ~70%, starvation 31→26% player / 9.5→6.6% villager —
  directionally fewer starvations, but noise); reachability identical
  (12/12 village-lost, Arc 3 everywhere, waves 2/3, 0 wins, 0 table);
  challenges 232→229, arcs still 0, goal changes still 0.
- **Regressions**: test-goal-lines-r7 GREEN, test-teachchore-lines-r5
  GREEN, test-daily-routine-transcripts GREEN, ontology 85/85.

No [needs-eyes]: sim-behavior weight change only — no UI, combat, or
player-feel change. (If Steve wants the 'feed' villager's eagerness
surfaced in a line — "X heads out early, the pantry's getting low" —
that's a future narration pass.)

## Sense-test verdicts (transcripts read, judged)

askAbout reveals (18/18 custom — Worker D's 2026-10-11 fix holds, no
fallthrough): all distinct, characterful, honest. The feed line
("Nobody goes hungry if I can help it") is now TRUE by behavior.

appealToGoal: 8/18 custom, 10 hit "This matters. You know it does."
(family, alone, escape, remember, home, record, answers, legacy, joy,
peace). Not dishonest — just flat. Appealing "This matters. You know
it does." to an 'escape' villager whose whole deal is leaving is
tone-deaf, but the mechanic works. Content gap, documented below.

talkReason: 4/18 goal-specific (prove/alone/family/lead — all excellent:
"I need something to do. Anything. Please." / "Have you seen anyone on
the roads? I'm asking everyone." / "We need to discuss how things are
run here."). The other 14 get "Just... talk." Fine.

Contention beats (driven): leave — "You run your village. I'll run
mine — somewhere else." Nobody stops them. Nobody should. Dignified,
good. Refocus — "I'm out of the running. I'd rather do real work."
Good, and the goal rewrite lands (lead→prove). Respect — "They won.
Fair." Good. Gate (4 stand-downs) sensible.

Escape lines: depart "walks away from Haven. They don't look back." —
good. Return "came back. They don't say where they went." — good line,
UNREACHABLE (duration 999). The no-return path's "the village notices"
is a code comment only — no spoken line fires. The village does not, in
fact, notice.

Lines that claim what behavior contradicts:
- feed: FIXED by this dial.
- heal ("I fix what I can"): contradicted — no NPC heal machinery
  exists; 'heal' villagers never heal anyone. Documented, not fixed.
- protect ("nobody here gets hurt"): weak — ranging −1 and patrol
  affinity only; GUARD is a companion role picked by trust/social, never
  by goal. Documented, not fixed.

## Reachability verdict

Standard metrics (12×200d competent): 0 wins, 0 table, Arc 3 in 12/12,
wave 2 in 6/12 → 7/12 post-dial, wave 3 in 6/12 → 7/12 (one seed each —
noise), median survival 78→77d. Content is reachable; the village can't
hold it (combat + the food wall). Goal content specifically: the
leadership arc is reachable only by a human who engages contenders (bot
never does — 232 ignored challenges); the escape arc is fully
"reachable" (walk out, usually die); the other 16 goals have no arc to
reach — they are static labels with spoken lines.

## Blanks filled vs documented

FILLED: the 'feed' goal now lives in the forage picker (gate 6000 +
+1.5 weight, guards intact). "Nobody goes hungry if I can help it" is
behavior now, not just a line. Proof test + before/after sims committed.

DOCUMENTED (not fixed — out of the one-dial discipline):
1. appealToGoal's generic fallback covers 10/18 goals ("This matters.
   You know it does.") — a writing task: 10 per-goal framing lines.
2. 'heal' villagers never heal anyone ("I fix what I can" is theater);
   needs the per-villager wound-care machinery first (r5 doc 2: the
   wound store is ~dead by design).
3. 'protect' doesn't guard — GUARD companions are picked by
   trust/social, never by goal ("nobody here gets hurt" is mostly a
   ranging penalty).
4. 7 goals (understand/remember/home/record/legacy/joy/peace) are pure
   labels — zero behavior. Honest as lines; if Steve wants them to
   live, each needs a behavior hook (record→codex writing? joy→morale?
   understand→scout?).
5. No goal-resolution machinery exists for any goal (family never found,
   heal never resolved, feed never fulfilled). Goals are birthmarks.
   Whether that's a design gap or the design is Steve's call.
6. The escape "came back changed" path is unreachable (duration 999 >
   any run); the no-return "gone" path has no spoken line. The LEAVE is
   effectively a delayed solo death (8/11 died out there).
7. Leadership arcs are player-gated content — proven working when
   driven, never engaged by the competent bot. If Steve wants sims to
   exercise them, the policy needs a contender-engagement behavior.

## Files

- `src/js/villager-objectives.js` — the dial (feedDrive gate + weight)
- `scripts/sweep-goals-r7.js` — goal-arc measurement sweep (per-goal
  expeditions/objectives/deaths, escape fates, leadership arcs, goal
  changes, standard metrics)
- `scripts/test-goal-lines-r7.js` — sense-test: all 18 goal lines
  (askAbout/appealToGoal/goalWant/talkReason/contention beats), GREEN
- `scripts/test-feed-goal-forage-r7.js` — dial proof test (gate/weight/
  guards), GREEN, red-checked pre-dial
- Raw: `/tmp/goals-r7-baseline.json`, `/tmp/goals-r7-after.json`
  (12 seeds × 200d identical, competent)
