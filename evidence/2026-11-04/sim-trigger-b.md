# Trigger-mechanism diag — Loop B verdict (run fleshout-loop-b-20261104T2330Z, arm sim-trigger-b)

Axis: winnability chain, veterans track A follow-up (vetencounter
blank #1). INSTRUMENT ONLY, zero src/js. No default, gate, price,
deed, or readyDemand number changed.

## Pre-registration (committed before any judged sim)

Full text: `evidence/2026-11-04/sim-trigger-b-prereg.md`
(commit 79f2bf1a2). In short: competent policy verbatim, default
env, seeds 99101–99108 (the gearbar band re-run on current
master), 150d death-aware horizon, stack-classified fights
(precedence contest > feast > trap > world > other), the wild
chain judged on WORLD fights only, detail-coord `monsterTurn`
traces, and TRIGGER decomposed by first co-location episode
end into player-left-the-tile / monster-unseen-on-tile /
player-present-never-engaged, with terminal fates correlated
by REMOVAL events, never by monster id. DIAG-GO iff: (1) all
8 seeds classified; (2) TRIGGER binds on >= 6/8 seeds under
the wild-only definition (bar stays 6/8, NOT lowered to 5/8
after vetencounter's 5/8); (3) a single dominant sub-cause
accounts for BOTH unlocked-but-unmet seeds AND is the
plurality sub-cause band-wide; (4) instrument errors 0 on
all judged seeds; (5) unlock/faced pattern and per-seed
days / peak gated / any-class fights / kills match
vetencounter exactly. Balanced panel (§15): INAPPLICABLE for
a pure diagnostic — stated, not fabricated.

## Verdict — DIAG-GO (judged strictly against the prereg)

1. All 8 seeds classified, none forced: 2 UNLOCK (99107,
   99108), 2 TRIGGER (99102, 99106), 4 FACED-WILD (99101,
   99103, 99104, 99105).
2. TRIGGER binds on 6/8 seeds under the wild-only
   definition — the bar met exactly, not lowered. Binding
   counts: TRIGGER 6 (99101, 99102, 99103, 99104, 99105,
   99106), UNLOCK 2 (99107, 99108). Vetencounter's
   sensitivity recount is confirmed as the verdict: 99101
   moves from SPAWN to TRIGGER once its 7 non-world fights
   are excluded (first world fight day 101, gaps 6 / 0 /
   30), and no other seed's binding moves.
3. The dominant sub-cause is player-left-the-tile: it
   accounts for ALL player-reaching unfought instances on
   BOTH unlocked-but-unmet seeds (99102: 4/4, 99106: 1/1)
   and is the band-wide plurality 18/18 — no tie, no
   second sub-cause at all after the first-episode rule is
   applied correctly (see "The first-episode correction"
   below). Zero instances fall in monster-unseen-on-tile
   or player-present-never-engaged as a FIRST-episode end.
4. Instrument errors 0 on all 8 seeds (760 daily
   snapshots; 48 post-unlock wave-4 spawns, 22 post-unlock
   wave-4 casts, 42 wave-4 fights of which 31 world-class,
   321 wave-4 monsterTurn calls).
5. Sanity check PASSED exactly: unlocks 6/8, any-class
   faced 4/8, and per-seed days / peak gated / any-class
   wave-4 fights / wave-4 kills match vetencounter on all
   8 seeds (see comparison table below).
Proof: `scripts/test-trigger-20261104.js` — 21/21 PASS
(8 classification-precedence fixtures, 8 analyzer fixtures
incl. break/binding precedence, first-episode sub-causes,
villager-only separation, determinism, and detail-contact
traces; live harness smoke; off/on neutrality leg on seed
99108 at 30d: identical days, endReason, and kill-log
length with the instrument on vs off). No balanced-panel
comparison exists for a diag, so none is fabricated and
none is attached (per §15, stated not omitted silently).

## THE TRIGGER ANSWER (plain words)

The village meets the monster and walks away from it — and
now that is measured, not inferred. Of the 18 wave-4
monsters that ever shared the player's tile without ever
being fought, all 18 ended their first stay because the
player left the tile. Seventeen of the 18 never even got
one contact turn: the player entered a tile, the monster
spawned on it, and the player was home by the next
snapshot, before the game ever ran a single monster turn
with that monster. The one exception proves the shape of
the rule rather than breaking it: the 99102 eulogy that
spawned on day 83, was abandoned the same day, wandered
for five days, wandered back onto the player's tile on
day 88 — and then spent seven contact turns unseen at
distance 3–4 until the trail went cold. Even there, the
first stay ended by departure; the lost trail was the
second stay's ending, not the first's.

What "walks away" means mechanically, from the traces: the
competent player's day pattern is go out and come home.
Tile-entry spawns land on the tile the player just
entered, and the player's next action is very often
another step toward home — travel does not run a contact
turn for the tile being left, so a monster spawned on an
entry tile gets zero contact turns unless the player
happens to act on that tile first. Followers do not save
it: the 99106 influencer (follows=true) followed the
player four times on its spawn day — the say lines say
so, four times over — and still never got a contact turn,
because the player never stopped moving; it held at the
treeline when the player reached safe ground, then
wandered until the village died four days later. When
the player DOES stop, the contact path works: the 99103
eulogy stalked for 55 contact turns over five days,
curious then hungry, closing from distance 2 to contact
and a fight; the 99105 congregation committed to combat
three times from its territorial stance and was killed.
Staying is the whole difference — and competent play, as
scripted, almost never stays on a wave-4 spawn tile.

## Per-seed table (wild-only)

| seed | days | end | unlock day | w4 spawns post (tile-entry / background) | w4 fights any-class (world / contest / feast / trap / other) | first world fight | w4 kills | break | binding (gaps unlock→spawn / spawn→reach / reach→fight) |
|------|------|-----|------------|------------------------------------------|---------------------------------------------------------------|-------------------|----------|-------|----------------------------------------------------------|
| 99101 | 150 | survived | 65 | 15 (13 / 2) | 13 (6 / 3 / 1 / 2 / 1) | 101 | 3 | FACED-WILD | TRIGGER (6 / 0 / 30) |
| 99102 | 116 | lost | 80 | 6 (4 / 2) | 0 | — | 0 | TRIGGER | TRIGGER |
| 99103 | 121 | lost | 59 | 12 (8 / 4) | 17 (17 / 0 / 0 / 0 / 0) | 71 | 1 | FACED-WILD | TRIGGER (0 / 1 / 11) |
| 99104 | 150 | survived | 94 | 9 (8 / 1) | 8 (5 / 0 / 0 / 0 / 3) | 107 | 3 | FACED-WILD | TRIGGER (0 / 0 / 13) |
| 99105 | 52 | lost | 48 | 2 (2 / 0) | 4 (3 / 1 / 0 / 0 / 0) | 51 | 1 | FACED-WILD | TRIGGER (0 / 0 / 3) |
| 99106 | 59 | lost | 47 | 4 (1 / 3) | 0 | — | 0 | TRIGGER | TRIGGER |
| 99107 | 72 | lost | — | 0 | 0 | — | 0 | UNLOCK | UNLOCK |
| 99108 | 48 | lost | — | 0 | 0 | — | 0 | UNLOCK | UNLOCK |

Band totals: 48 post-unlock wave-4 spawns (36 tile-entry,
12 background), 22 post-unlock wave-4 casts, 42 wave-4
fights (31 world, 4 contest, 1 feast, 2 trap, 4 other),
8 wave-4 kills. Zero pre-unlock wave-4 spawns on any seed
(the pool gate holds; no anomaly flag fired).

## Target-seed timelines (the evidence for player-left)

99102 (unlocked day 80, died day 116, peak gated 199):
- Day 83, eulogy spawns on the player's entry tile (5,4)
  at detail (2,5). Say: "Something moves out there — The
  Eulogy." By the same day's snapshot the player is back
  at (4,4) and the monster sits at (5,4) with 2 villagers
  on its tile. Zero contact turns on day 83. It wanders
  (7,4) → (4,5) over days 84–87. Day 88 it is back on the
  player's tile and 7 contact turns run: player detail
  (4,4), monster (0,7) → (2,7), distance 4 → 3, line of
  sight never established, no stance ever set, lostSight
  0 → 7, removed by the lost-trail rule with "It lost
  your trail." First episode ended by departure (day 83);
  terminal fate lost-trail (day 88). The two dimensions
  are different facts and both are reported.
- Day 90, eulogy spawns on the player's entry tile (1,7).
  Player home by snapshot; monster wanders (1,6) →
  (3,8) for 26 days; alive when the village dies. Zero
  contact turns. Villagers never share its tile.
- Day 97, algorithm spawns 7 tiles away (background);
  shares a villager tile on 5 snapshot days; no villager
  fight ever fires for it; alive at village death.
  (Villager-only reach: the only such instance
  band-wide. The villager tick contributed nothing here.)
- Day 103, eulogy spawns 7 tiles away (background); never
  reaches a player or villager tile; alive at death.
- Day 108, eater spawns on the player's entry tile (3,4);
  day 110, algorithm spawns on the player's entry tile
  (4,3). Both wander, both alive at village death, zero
  contact turns between them; villagers share their tiles
  on 3 and 1 snapshot days respectively, no fights.
  Zero wave-4 fights, zero wave-4 kills, four wanderer
  casts that never became contacts.

99106 (unlocked day 47, died day 59, peak gated 150):
- Days 50–53, three background spawns 8 / 4 / 7 tiles away
  (eater, reunion, eulogy). None reaches a player or
  villager tile; all alive at village death.
- Day 55, influencer spawns on the player's entry tile
  (8,4) at detail (3,4). Say: "Something moves out there
  — The Influencer." It follows the player four times
  that day ("It followed you. The Influencer is here."
  ×4) but never gets a contact turn — the player never
  stops moving — then holds when the player reaches safe
  ground and wanders (3,5) → (2,6) until the village dies
  four days later. Zero wave-4 fights, zero wave-4
  casts, zero wave-4 kills, zero contact turns.

## The non-world fights (why the wild-only recount matters)

99101's 7 non-world wave-4 fights, all excluded from the
wild chain by the fixed precedence:
- Day 66, field evade (hannah_kim vs congregation,
  class other): a villager-agency seek fight (awareness
  opts), not a world instance — the villager went
  looking, the world did not bring the monster.
- Day 69, feast influencer (class feast): a feast draw,
  the same contamination vetencounter flagged.
- Days 82 / 123 / 123, contest reunion / strike / eulogy
  (class contest): contest casts, real facings for the
  wave-5 gate, not wild encounters.
- Days 140 / 141, trap congregations (class trap): two
  tile-entry congregations (spawned days 125 / 131) that
  wandered 15 / 10 days, separated from the player the
  same day they spawned, and were eventually fought
  through the player's pit-trap path. Their fight events
  are trap-class by the fixed precedence (trap > world),
  though their removal records carry fight-settlement
  stacks — so the instance table counts them fought via
  settlement while the event table counts them trap.
  Robustness note: if they were counted as unfought
  instead, both would classify player-left (separation
  snapshots exist from their spawn days), taking the
  band plurality from 18/18 to 20/20 — the verdict does
  not depend on this call. Their fights (days 140/141)
  also postdate 99101's first world fight (day 101), so
  99101's binding is TRIGGER under either treatment.
99104's 3 non-world fights (days 116 / 116 / 120, class
other): diana_osei villager-agency seeks (awareness
opts), all vFlee — same seek path as 99101's day-66
evade, none a world instance.
99105's 1 non-world fight (day 49, class contest): a
contest congregation, the day before the wild
congregation fight. Wild-only moves 99105's first fight
from day 49 (contest) to day 51 (world), gap 1 → 3;
binding stays TRIGGER.
99103's 17 fights are all world-class — the recount
changes nothing there, and its TRIGGER binding (gap 11)
is untouched.

## Contact when it works (the contrast)

Fought world instances show what a contact turn sequence
looks like when the player stays: 99103's eulogy
(spawned day 63) wandered a week, then 55 contact turns
over days 70–74, stance curious → hungry, closing
distance 2 → 0, final turn fight + removal. 99101's
strike (spawned day 94) took 20 contact turns to contact
(curious → hungry, min distance 0). 99105's congregation
(spawned day 48) took 8 contact turns across days 49–51,
territorial throughout, and committed to combat three
times from range (territorial warn-then-commit fires
startCombat without contact) before being killed.
Unfought player-reaching instances, by contrast: 17 of
18 with ZERO contact turns, the 18th (99102's day-83
eulogy) with 7 unseen turns at distance 3–4 and no stance
ever set. The contact path is not broken — it is simply
almost never given a turn.

## Probe numbers vs vetencounter's band numbers (sanity check)

| seed | vetencounter days / peak gated / w4 fights any-class / w4 kills | this run days / peak gated / w4 fights any-class / w4 kills | match |
|------|--------------------------------------------------|---------------------------------------------------|-------|
| 99101 | 150 / 199 / 13 / 3 | 150 / 199 / 13 / 3 | exact |
| 99102 | 116 / 199 / 0 / 0 | 116 / 199 / 0 / 0 | exact |
| 99103 | 121 / 180 / 17 / 1 | 121 / 180 / 17 / 1 | exact |
| 99104 | 150 / 199 / 8 / 3 | 150 / 199 / 8 / 3 | exact |
| 99105 | 52 / 140 / 4 / 1 | 52 / 140 / 4 / 1 | exact |
| 99106 | 59 / 150 / 0 / 0 | 59 / 150 / 0 / 0 | exact |
| 99107 | 72 / 50 / 0 / 0 | 72 / 50 / 0 / 0 | exact |
| 99108 | 48 / 20 / 0 / 0 | 48 / 20 / 0 / 0 | exact |

Trajectories reproduced exactly on every shared number
(the only src change since vetencounter's run base is the
ship version bump's `src/js/build.js` stamp, display
only). The trigger recorder did not perturb the
trajectories it measured — and the wild-only recount
confirms vetencounter's sensitivity analysis exactly:
99101's first world fight is day 101, as predicted.

## Wall numbers (this corpus, baseline observations, not wall movement)

Wins 0/8. National 0/8, table 0/8 (scaleRank "village" on
all 8; no seed leaves village scale). Wave-4 unlocks 6/8,
wave-4 faced any-class 4/8 (99101, 99103, 99104, 99105),
wave-4 faced wild 4/8 (same four seeds), wave-5 unlocks
0/8, wave-5 faced 0/8. Readiness-5-ready days 0/8
(readiness5.ready false on all 8 at end; veterans bar:
0 on seven seeds, 1 on 99105 against a demand of 2).
Median run-days 94 (days sorted 48 / 52 / 59 / 72 / 116 /
121 / 150 / 150; 2 seeds censored at the 150d horizon:
99101, 99104 survived). Death-cause shares for villages
generally: not instrumented by this arm — not reported,
not guessed (as in vetencounter).
World-full pressure (continuity): post-unlock snapshots
at or above the monster cap — 99101: 86/87, 99102:
38/38, 99103: 64/64, 99104: 58/58, 99105: 6/6, 99106:
13/14. Background-spawn distances (continuity): band
median 6.5 tiles from the player tile (per-seed medians
5–7); the background channel's contribution to the
target seeds was far wanderers that never reached a
player or villager tile, except 99102's algorithm (5
villager-tile snapshot days, no fight).

## Village assessment (plain words)

Picture eight villages playing competently. Two never
get the System's attention (standing peaks 50 and 20 —
the door never opens, nothing to diagnose there). Four
meet the fourth draft and fight it, killing eight times
between them. And two — the ones this arm was sent to
explain — live in villages the fourth draft keeps
visiting without ever being fought: monsters spawn on
the very tile the player stands on, the player walks
home, and the monster paces the map for days or weeks
until the village itself dies. The 99102 village spent
its last 36 days with wave-4 monsters on the map and
died without ever answering one; its day-83 eulogy even
came back and stood on the player's tile for seven
turns, unseen, before the trail went cold. The 99106
village had four days between its first wave-4 monster
on its own tile and its death, and spent them elsewhere
— its influencer followed four times in one day and
still never got the player to stop. What is missing is
not knowledge of the monsters and not opportunity in the
tile sense — it is a single stopped moment: the player
standing still on a monster's tile for one action. The
competent script, as written, does not stop. The
villages themselves are not robotic — villagers kill,
cheer, gossip, and report deaths in coherent voices, and
one villager went looking for wave-4 monsters on her own
initiative three times (99104's diana_osei seeks). The
robotic beat is the player's own: a competent script
that walks away from every fourth-draft spawn it did
not seek, and never pauses long enough for the contact
rules to run.

## Sense-test

- The spawn announcement itself is coherent ("Something
  moves out there — The Eulogy", 99102 day 83; "Something
  moves out there — The Influencer", 99106 day 55), and
  the follow beat is vivid ("It followed you. The
  Influencer is here." ×4, 99106 day 55). The narration
  promises a meeting; the movement that follows breaks
  the promise without a word — no second beat, no priced
  choice, no muster, unlike the lingerer sortie/endure
  beat vetencounter quoted as the model of a forced
  decision. The trigger gap is also a narration gap, now
  with the mechanism attached: the announcement fires on
  spawn, and then the player leaves before any contact
  turn can produce a second line.
- The lost-trail line is honest and well-placed ("You
  hold still behind cover. After a while, the sounds
  fade. It lost your trail.", 99102 day 88) — but it
  fires for a monster the player never saw, after seven
  turns at distance 3–4. "You hold still" is the wrong
  verb for a player who kept acting while the monster
  stood unseen across the grid; the line describes a
  hiding player, not an unseeing monster. A wording
  note for a future pass, not a verdict item.
- The 99106 influencer's four follow lines in one day
  read as urgency ("It followed you. The Influencer is
  here." ×4) — and then nothing. A follower that chases
  four tiles and never engages reads as a broken promise
  in the transcript, even though the code is behaving as
  designed (followers hold at safe ground; the player
  never stopped). The transcript gap and the mechanism
  gap are the same gap.
- No robotic villager behavior was flagged by this arm's
  corpus beyond the trigger gap itself: villagers kill,
  cheer, gossip, and report deaths in coherent voices.
  The seek fights (99104's diana_osei, three awareness
  fights, all vFlee) read as a villager with initiative
  rather than a script — she went looking, found
  fourth-draft monsters, and fled all three times, which
  is a coherent character beat, not a bug.
- Instrument limitation: the say sample here is pattern
  lines only (trail/contact lines, 38–242 per seed), so
  no post-unlock spawn announcement was captured for
  quotation on the faced seeds beyond the target-seed
  lines above — the spawn facts themselves come from
  the recorder, not the transcript, as in vetencounter.

## Metric review (for the NEXT run, §14 — no in-run re-scoring)

- The stack classes separated cleanly: zero wave-4 fights
  landed in `other` that should have been `world` on
  inspection — the 4 `other` fights are all
  villager-agency seeks (awareness opts, non-world
  monsters), and the 2 trap fights are trap-path fights
  by stack even though their monsters are world
  instances (precedence trap > world, fixed in the
  prereg). The one classification judgment a future run
  could revisit is whether trap-caught world monsters
  should count as wild-chain fights; it does not affect
  this verdict (see robustness note above).
- The first-episode rule REQUIRED a mid-analysis
  correction, and the correction is itself a finding
  about the instrument: the first version of the
  analyzer classified by removal whenever a removal
  existed, which counted 99102's day-83 eulogy as
  monster-unseen (its terminal fate) instead of
  player-left (its first episode's end). The corrected
  analyzer orders first departure vs first removal, and
  the proof test's fixtures still pass under the
  corrected rule (they were designed for both branches).
  Any future arm reusing this analyzer must keep the
  first-episode ordering — removal-first classification
  systematically misattributes return episodes.
- The plurality rule over instances (not seeds) fairly
  weights the band: the target seeds contribute 5 of 18
  instances, the faced seeds 13 — and all 18 agree, so
  no weighting dispute arises. Had the faced seeds'
  unfought instances disagreed with the targets', the
  seed-level story would have needed separate reporting;
  it did not.
- The 6/8 bar plus the plurality clause together were
  the right strength: at 6/8 the wild-only recount
  passes exactly, and the plurality clause (18/18,
  unanimous) is what makes the verdict a diagnosis
  rather than a bare count. A weaker bar would have
  passed vetencounter's contaminated 5/8 too; the
  combination forced the contamination analysis into
  the open and then confirmed it properly.
- Known blind spots, unchanged from the prereg:
  departure-and-return between markers is invisible
  (a same-day departure and return with no intervening
  monsterTurn call leaves no marker; snapshot separation
  catches departures that persist to the next snapshot,
  not intraday round trips); daily snapshots miss
  intraday reach (a monster wandering onto the player
  tile and off again between snapshots, with no fight,
  is missed by design — it can only shrink the TRIGGER
  count, never grow it, so it does not threaten this
  run's finding, which needs reach, not its absence);
  villager-tick exposure is measured in snapshot days,
  not ticks (ticks happen on tile entries only, so 5
  exposure days is an upper bound on tick chances, not
  a tick count).
- Daily snapshots plus tile-change markers proved
  sufficient for departure detection on this band: every
  one of the 18 unfought player-reaching instances shows
  separation evidence (snapshot separation, tile-change
  marker, or both) — zero fell back to the unclassified
  class, and zero `player-present-never-engaged`
  first-episodes occurred. The "present but never
  engaged" mechanism, as a first-episode story, did not
  happen once on this band.

## Next blanks, in order

1. BUILD: the trigger itself (this arm's verdict, now
   available to build on). The competent player never
   stops on a wave-4 spawn tile. The build question is
   what makes a player stop: a second beat after the
   spawn announcement (a priced choice in the lingerer
   sortie/endure shape), a contact rule that survives
   departure (followers that do not hold at safe ground
   — a design call, since havens are promised safe), or
   a policy change (the competent script pausing on
   spawn tiles). Note the constraint the build must
   respect: 17 of 18 failures had ZERO contact turns,
   so any fix that only tunes contact odds, stance
   commitment, or line of sight touches at most the
   18th instance. The fix must create a stopped moment,
   not improve the odds inside one.
2. Standing accumulation, part 2 (standaccum blank 3,
   still open): after blank 1, re-measure whether a
   village that both meets wave 4 and keeps two killers
   alive reaches 200 gated AND ready — the release this
   arm, like vetprod and vetencounter, never observed
   (readiness5.ready false on all 8; veterans 0 except
   99105's 1 against a demand of 2).
3. Wording note (small, not a build arm): the
   lost-trail line ("You hold still behind cover")
   misdescribes the unseen-at-distance case — it fires
   when the monster cannot see the player, not when the
   player hides. A future pass could split the line by
   whether the player acted during those turns.

## Proof and landing

- Proof: `scripts/test-trigger-20261104.js` — 21/21 PASS
  (8 classification-precedence fixtures, 8 analyzer
  fixtures incl. first-episode sub-causes, determinism,
  and detail-contact traces; live harness smoke; off/on
  neutrality leg on seed 99108 at 30d).
- Commits (this worktree branch sim-trigger-b;
  coordinator merges via --ff-only; merged locally, pending
  ship — no push, no bump, no live verification by this
  worker):
  - 79f2bf1a2 sim-trigger-b prereg (before any judged sim)
  - 8646c89c2 sim-trigger-b instruments + proof 21/21
    (zero src/js)
  - (analyzer first-episode fix + pilot + evidence commit
    below)
- Files: prereg + evidence in `evidence/2026-11-04/
  sim-trigger-b*.md`; per-seed JSON in
  `evidence/2026-11-04/perseed-trigger-b/` (8 files,
  trigger-pilot run); scripts
  `trigger-instrument-20261104.js`,
  `trigger-driver-20261104.js`,
  `trigger-analyze-20261104.js`,
  `test-trigger-20261104.js`.
- Index-clobber note: safe-commit.sh left bogus staged
  deletions in the main index after both commits (prereg +
  instruments); repaired each time via HEAD-blob
  `update-index --cacheinfo` and verified `git status`
  empty + `git diff HEAD` empty. The commits themselves
  were always correct.
- EPERM note: the host write flap was active through this
  run in both modes (EPERM throws and silent 0-byte
  "success" writes). The proof test and driver both carry
  retry loops with size verification now (driver: 120
  attempts × 10s; proof: 120 attempts × 5s); the pilot's
  8 corpus files all verified at full size (178KB–
  703KB) before analysis. The flap also repeatedly
  blocked fresh test processes at their first write for
  minutes at a time; a fresh start in a confirmed clear
  window (3 spaced probes OK) sailed through in 13s.
  No data was lost; no file was hand-edited back into
  shape.
- Worktree state at handoff: only committed work; no
  uncommitted leftovers beyond the pilot + evidence
  commit below (verified before reporting).
