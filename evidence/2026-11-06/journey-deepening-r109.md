# journey-deepening r109 — run note (lane A, leg 2 DEEPENING)

**Run id:** laneA-deepening-2026-11-06T1745Z (lock 2026-11-06T17:43:40Z).
No prior lock existed, so no stale-lock recovery; main tree clean,
disk 27%. Base master@1e8db620d at worktree creation (local master 4
ahead of origin/master, 0 behind — the ship loop owns the push).
Rotation read 2 -> deepening; 2->3 written at closeout with verified
write + retry. Prereg:
evidence/2026-11-06/journey-deepening-r109-prereg.md (committed
0a0a2db71 BEFORE any scored seed ran; proof test 21/21 — 13 carried
r108 checks + 8 new r109 checks, see below). Seeds fresh **92905–92908**
(+ smoke 92909, DAYCAP=45: survived day 45, wave 3, pop 8/8,
0 mislabels; smoke outputs deleted per the prereg), competent policy
(r105 driver lineage VERBATIM — CONVO_DAYS [45, 60, 80], DAYCAP=100,
death-aware stop). Safe-commit index clobber hit once (4 files
staged-as-deleted after the private-index commit); repaired per the
2026-10-23 lesson (update-index --add --cacheinfo from HEAD blobs;
status clean, diff HEAD empty, all hashes match).
Heartbeat incident mid-run: the registry flock stalled ~7 min on Lane
B's simultaneous worktree registration (journey2-endgame), and the
600s heartbeat loop died silently sometime after 18:00Z — the last
heartbeat went 14 min stale (18:07:21 -> 18:21:20) before a manual
heartbeat landed 1 min inside the 15-min threshold and the loop was
restarted with nohup. No duplicate run started (the lock held). Lesson
for the next run: verify the loop process is alive, not just that a
heartbeat once landed.

## Panel verdicts (pre-registered, no re-scoring)

- **SURV-CONTROL-3 (primary): 2/4 survived — the funnel count did not
  move on the new base.** 92906, 92908 survived to day 102, wave 4;
  92905 lost day 33, 92907 lost day 25. r108 was 3/4, r107 2/4 on the
  old base; 2/4 vs 3/4 on n=4 is variance, not movement — no claim
  either way on the count. **But the SHAPE moved: both losses are
  early (days 25, 33) where r108's single loss was day 77.** The
  prereg's INTERESTING clause names a different cause split, and this
  is one — descriptive, not a verdict on any landing (none of the
  base changes since r108 touches expeditions or hunger). Cause split
  (VILLAGER deaths only — the death log mixes monster kills in):
  92905 lost 8 villagers (4 monster, 1 Choir Toad, 1 starvation,
  1 sickness, 1 wild) and the scholar died in the day-31 Buffering
  fight (player HP -1, result 'lost'); the village still had 6 alive
  at the end. 92907 lost 6 villagers (2 wounds that wouldn't close,
  1 sickness, 1 starvation, 1 Performance Review, 1 "something huge,
  rooting in the underbrush"), 0 fights started, pantry empty at the
  day-25 census — consistent with the hunger-scatter trigger, but the
  seed JSON does not record which of the three village-lost triggers
  fired (scatter / extinction / scholar-death-no-successor), so the
  trigger is UNATTRIBUTED — see the instrument gap below. Survivors:
  92906 a 2-person remnant (12 villager deaths: 5 monster, 7 wild;
  wave 4, standing max 150); 92908 intact 7/7 (9 villager deaths:
  3 monster, 2 wounds, 2 wild, 1 arena, 1 starvation; wave 4,
  standing max 225 — the highest in the r105–r109 line). All seeds
  reached wave 3; none reached wave 5. Meat channel alive on all
  seeds (kills 14/22/7/22, tests 6/6/2/3, reveals 5/6/2/3,
  dinners 9/4/3/4). Fights total 4/16/0/13.
- **P-KEEP-REVISED (standing rule): NAMED 1/2 revisited-alive —
  PRESENT as computed. The NAMED is a FALSE POSITIVE on content.**
  Onni (92908 day 45 -> 60/80): the day-80 sitting's line "I've been
  the outsider so long I forgot what inside feels like. I think I'm
  remembering." matched the promise regex on the bare word "forgot" —
  but nothing in day 60 or day 80 names the day-45 food promise: no
  repay opener, no promise verb, no "the food I needed". The day-80
  sitting is about belonging, not the debt. True on-content count:
  NAMED 0/2. The panel is NOT re-scored (metric binding §14): the
  verdict stands as computed, and the defect + fix go in metric
  review below. The other revisited thread is genuinely SILENT:
  Grace (92906 day 60 -> 80) — the day-80 sitting re-asks for food
  ("I'm going hungry — do you have anything to eat?") as if the
  day-60 promise never happened. 2 DEAD threads (Hilda's seek_taken
  promise — she died after day 45; Grace's day-80 ask — she died
  days 94–96). 0 old-rule over-counts (structOld SILENT = 0).
- **RE-ASK (adopted this run): 0 threads as computed — BUT the scan
  is defective: it covers only 1 of 4 re-ask variants.** The prereg
  called the re-ask opener "the single line" at convo-wants.js:1966;
  the code actually cycles FOUR variants (convo-wants.js:1962–1967).
  Grace's day-60 sitting opens on variant 3 — "About the food I
  needed — I hate to ask twice, but it's still open. Will you?" — a
  genuine re-ask sitting the scans missed entirely. On content the
  panel has >=1 re-ask sitting; its thread origin is outside the
  panel (a fromSeed favor — promised before day 45, outside convo
  days), so no panel thread scores RE-ASK even with the fixed scan.
  RE-ASK-ORPHAN 0 as computed — same defect. NOT re-scored; the fix
  is proposed in metric review. (Onni's day-60 food ask is a fresh
  ask line, not a re-ask opener — the need recurs, the re-ask FORM
  doesn't always fire.)
- **FIZZLE-WATCH: 0 dry lines in 9 sittings (7 ask_favor) — the
  FIZZLE-FIX HOLDS in the wild.** No "...Sorry, lost my train of
  thought." anywhere in the panel. Oscar's "...sorry, lost it." is a
  trailing-off line, not the dry line — correctly not counted.
- **D-THING (carried): pocketed=2, testable=1, mentioned=0 — the
  first testable non-return in the r107–r109 line.** Onni (92908 day
  60 -> 80): the day-60 decline pockets a small thing; the day-80
  sitting exists but never mentions it — the later sitting carries a
  different live want (ask_favor stage 2, fromSeed: belonging) and
  the pocketed thread stays silent. Descriptive (n=1), not a fix
  claim: a pocketed thing does not always come back when a later
  sitting has other business. (r108: 1/1 mentioned.)
- **RAJ-PHOTO (watch): plants=0 under the curious-want definition —
  but the shape reproduces OUTSIDE it.** Thabo (92906 day 45,
  ask_favor): "Can I tell you something? I'm saving a candy bar for
  when things get better. I haven't told anyone." — a personal
  confidence planted, then four plant-teachings, never returned to
  in the sitting, and no later sitting with Thabo exists. The scan
  requires `want: curious`, so it misses this. The watch question
  (should a confidence survive the sitting?) extends beyond curious.
- **V-INIT-BOND (carried): 0 across the whole panel — blank stands.**
  0 of 9 sittings contain an NPC-initiated bond proposal.
  Player-side invite options offered in 4/9, betrayal invitations
  in 5/9. build-bond-initiate is still NOT merged (branch exists,
  no merge commit). The blank still needs a system.
- **G-SENSE (carried): 0 senseless sittings.** All 9 transcripts
  read in full — see people check.
- **B-SIT (carried): 5 betrayal sittings** (3 accept / 2 decline /
  0 unanswered). **B-FOLLOW: 3 follow-up sittings**, 2 with a new
  betrayal. **B-LEAD (descriptive): 2 lead-ins** — "Come see what I
  found" twice. Blocked-agreement clean (badBlocked=0, badRevisit=0
  on all seeds).
- **S-TRACE (carried): EXPLAINED 2/2.** Both surviving seeds explain
  cleanly (first regional day 47/48 at standing 25, war-only);
  the two early losses are NO-REGIONAL-DAYS (never read regional).
  G-mismatch 1 (92908 day 45 Dat: top food_security, obj
  HAVEN_CHORE, goal party_up — descriptive, goal question closed).
  G-STICK: 92906 stuck 5/5, 92908 stuck 2/2 — every villager present
  on all three sample days kept one goal the whole window
  (party_up/safety). G-STALE: 2 items (idle/done carrying safety /
  party_up) — reported, not counted as defects per the analyzer's
  framing. K-CONTEXT lessons 20/20, 44/49, 13/13, 37/43; bot
  proposed a link on 3/4 seeds (2 linked, 1 counter); diplomacy 0
  everywhere, as in r102–r108; mislabels 0.

## Village assessment, in plain words

Two villages out of four made it through the deepening window, and
both losses came fast — one in the first month, one barely into it —
where last run's loss came at day 77. The talking stays the bright
half, but it is thinner this time: only nine sittings, because two
villages were gone before the first conversation day. Onni dug up a
buried food cache for the player and then spent two sittings trying
to belong — an outsider learning what inside feels like — while the
food he was promised never came back up. Grace asked for food three
times in three sittings and got a tool pressed into her hand instead.
A nurse sat down just to talk like people used to, and remembered
the ordinary mornings he rushed through. One village ended as two
people — a paramedic and a farmer — holding a place that used to
hold nine.

- **92905 (lost, day 33, wave 3):** 8 villagers dead in 33 days;
  the scholar died fighting Buffering on day 31 and the village
  was lost two days later with 6 people still alive. The meat
  channel ran well (14 kills, 6 tests, 5 reveals, 9 dinners) and a
  Focus Group was killed the same day the scholar died — the fight
  log calls that one 'routed' even though the monster is dead (see
  watch items). Standing never got past 25; the village never read
  regional.
- **92906 (survived, day 102, wave 4, regional, standing max 150):**
  the remnant — 12 villagers dead across the run, ending at 2
  people: Daniyar the paramedic (trust 53, 22 plants) and Cecília
  the farmer (trust 25, 1 plant). Grace's protector monologue, her
  re-asked food favor, and the oiled tool pressed into the player's
  hand live here; Hilda's question about the taken ("about
  Rebecca?") was promised an answer she did not live to hear.
  Lessons 44/49 — the best-taught village of the panel.
- **92907 (lost, day 25, wave 3):** 6 villagers dead in 25 days,
  zero fights started, pantry empty at the end. The village was
  killing monsters and eating them (7 kills, 2 tests, 3 dinners)
  and still scattered or lost its scholar — the record does not say
  which, and that gap is this run's instrument finding.
- **92908 (survived, day 102, wave 4, regional, standing max 225):**
  the strong village — 7/7 alive at the end, a seasoned link
  (village_1, age 74, trust 50), standing 225, the highest in the
  r105–r109 line. Onni's buried cache (+1625 kcal) and his outsider
  sittings live here; Spool was killed twice (days 45, 63), and a
  66-round Ad Break fight on day 64 ended lost with the player at
  -12 HP. Lessons 37/43.

## People check (all 9 transcripts read)

G-SENSE 0 senseless. Notes, not defects:

- **Grace (92906, blacksmith, earnest):** day 45 a protector
  monologue ("Someone has to be the wall. I've got broad
  shoulders."); day 60 the re-ask — "About the food I needed — I
  hate to ask twice, but it's still open. Will you?" — promised,
  then "Here. I made an extra." (a tool pressed into the hand);
  day 80 hungry again ("I'm going hungry — do you have anything to
  eat?"), promised. The day-60 promise is never named on day 80 —
  genuinely SILENT. SENSE.
- **Hilda (92906, mushroom grower, stoic):** day 45 "Have you ever
  asked? About the taken — about Rebecca?" — promised to ask the
  System about the pods. "Even asking is more than the silence."
  SENSE. (Thread DEAD — she died after day 45.)
- **Thabo (92906, taxi driver, dry):** day 45 the candy-bar
  confidence ("I'm saving a candy bar for when things get better.
  I haven't told anyone."), then four plant teachings and the
  confidence never returns. SENSE as a conversation; the plant is
  abandoned (watch item).
- **Oscar (92906, nurse, withdrawn):** day 80 "Can we talk? Just...
  talk. Like people used to." — a regret exchange ("I didn't say
  what I needed to say. To someone. Now I can't." / "I regret the
  ordinary days I rushed through... Anchorage mornings..."), then
  "...sorry, lost it." and drifting away. SENSE — the most human
  sitting of the panel.
- **Onni (92908, chimney sweep, cautious):** day 45 a food ask,
  promised; betrayal accept, a buried cache dug up (+1625 kcal).
  Day 60 a betrayal decline, a small thing pocketed, then a fresh
  food ask ("It's been too long since a real meal."). Day 80 a
  belonging sitting — "I've been the outsider so long I forgot what
  inside feels like. I think I'm remembering." / "I just want
  someone to need me here." SENSE — and the day-80 "forgot" line is
  the P-KEEP false positive (see metric review), not a promise
  named.
- Flat notes, stated not hidden: the stock promise-accept line
  ("Thank you. I won't forget who fed me when it mattered.") fires
  after every food promise in the panel (Onni d45, Grace d60,
  Grace d80) — fifth panel running. Same class as r106–r108 — a
  fix follows only if it is a clear ledger defect with a proof test.

## All-tracks read (Steve 2026-11-06 11:48 CST, REWARD ALL PATHS)

Descriptive only — no new metric this run. Goal tops across the
panel: party_up and safety dominate, food_security next;
bonds/knowledge/build_standing/gear_up tops are 0 on every seed.
Goal-line counts are food_security-heavy (235/291, 95/126 on the
survivors) while tops are party_up/safety — the village talks
food, plans togetherness. What DOES differentiate per person is
plant knowledge (92908: Onni 34, Oliver 35, Katarina 34, Cecilia 9,
Nhung 3, Hamish 0, Mikhail 0) and trust (23–99). What does NOT:
agencyXP tracks are village-level aggregates in this census
(identical tracking/survival/bravery per villager), so per-person
role formation across the five tracks (combat, field, social, craft,
strange) is NOT measurable from the current instruments. The
five-track role-formation instrument is proposed in metric review.

## The blanks this run fills

1. **SURV-CONTROL-3 answers the new-base question on the count:
   2/4 — the funnel count did not move.** The shape moved earlier
   (both losses days 25/33 vs r108's day 77) — flagged for r110,
   not claimed as a base effect.
2. **FIZZLE-FIX holds in the wild.** 0 dry lines in 9 sittings,
   7 of them ask_favor — the r146 fix fires (or rather, doesn't
   need to) on fresh seeds.
3. **Two analyzer defects found by reading transcripts, disclosed
   here, NOT re-scored:** the P-KEEP "forgot" false positive (Onni
   d80) and the RE-ASK single-variant coverage (Grace d60 variant 3
   missed). Fixes proposed for r110 in metric review.
4. **D-THING first testable non-return.** A pocketed thing does not
   always come back when the later sitting has other business
   (Onni d60 -> d80).
5. **Loss-attribution instrument gap.** The driver records
   endReason=village-lost without the debrief, so 92907's trigger
   is unattributed. A base-policy re-run probe
   (scripts/probe-loss-r109-20261106.js) DIVERGED on both seeds
   (92905 day 74 vs panel day 33; 92907 day 21 vs day 25) — the
   driver's policy wraps move the trajectory, so the base policy
   cannot attribute driver losses. The probe is kept as the
   documented negative result; the fix is capturing
   Game.villageDebrief() inside the driver run (metric review).
6. **"Routed" with a dead monster reproduces (2nd panel).** 92905
   day-31 Focus Group: monster HP -1, result 'routed' — same shape
   as r108's Ad Break. The kill IS counted in w3killsByType, so
   only the fight-result label misleads. Elevated from watch item
   to named finding; the fix belongs to the fight-result vocabulary
   (what 'routed' means when the monster dies but the party
   leaves), not this run.

## Watch items (not metrics, not fixes)

- **66-round Ad Break fight (92908, day 64, lost, player at -12
  HP):** the sponsor-creature adds drag the fight past an hour of
  game time. Feel note, not a defect — the mechanic worked as
  designed and the party fled with 5 survivors.
- **Stock promise-accept line, fifth panel running** (see people
  check). Same class as r106–r108.
- **Thabo's candy-bar plant under ask_favor** — the curious-plant
  shape outside the curious want (see metric review proposal).
- **Grace's chronic food re-asks:** three sittings, three food
  asks, one promise never repaid and never named again. SILENT
  working as designed — the need outlives the promise.
- **92906's 2-person remnant:** a village can "survive" to day 102
  with 2 people. Whether that counts as surviving is a design
  question, not a metric — the control counts it as survived per
  the pre-registered rule.

## Telemetry deviation check

`node scripts/telemetry-check.js` against
hidden_files/telemetry-baselines/deepening.json, metrics w3fights,
engaged.w3, fightsTotal, fightsByWave.3, current = fresh 929xx
4-seed panel: **quiet (4 files, 4 metrics, no large deviations).**
No LOUD lines, no investigation, no baseline roll.

## Metric review

- **P-KEEP's revised rule produced a false NAMED on fresh seeds,
  and the fix is now specified.** The promise regex's bare "forgot"
  matches belonging musings ("I forgot what inside feels like")
  that name no promise. The r108 evidence-preference fix only
  moved the CITED line; the classification still uses the raw
  regex. PROPOSED for r110: drop bare "forgot" from PROMISE_MENTION
  (keep "forget it" — the repay dismissal — and the REPAY_OPENER
  vocabulary, which covers every genuine return: "haven't forgotten
  what you said you'd do", "I won't forget it"). Proof test with
  Onni's day-80 lines as the negative case (must score SILENT) and
  Colin/Aubrey repay lines as positives. This panel is NOT
  re-scored: Onni stands NAMED as computed.
- **RE-ASK's scan covers 1 of 4 variants — under-counted, fix
  specified.** The re-ask opener pool is four lines
  (convo-wants.js:1962–1967), not one; Grace's day-60 variant 3
  proves it. PROPOSED for r110: REASK_OPENER covers all four
  variants (grounded in the source, proof test with all four), and
  RE-ASK-ORPHAN is reported as "origin outside the panel window"
  (a fromSeed favor predates convo days) rather than "a re-ask
  without a thread". This panel is NOT re-scored: RE-ASK stands 0
  as computed, with >=1 re-ask sitting disclosed on content.
- **RAJ-PHOTO proposal:** widen the curious-plant scan to any
  sitting whose opener is a personal confidence ("Can I tell you
  something? ... I haven't told anyone."), regardless of want id —
  Thabo's candy bar proves the shape lives under ask_favor too.
  Needs design care (the opener pool spans wants); proposed for
  r110, not built here.
- **Driver instrument proposal:** capture Game.villageDebrief()
  (game.js:9773) into the seed JSON at seed end, so a village-lost
  trigger is attributable without a re-run. The base-policy probe
  proved re-runs diverge; in-run capture is the only route.
- **Five-track role-formation instrument (Steve 2026-11-06 11:48):**
  per-villager XP/skill movement split by the five tracks, so the
  self-improvement drive can be measured by role formation across
  ALL paths, not kill counts. Proposed as a follow-up job, not
  built here.
- **No pre-registered metric was re-scored mid-run.** SURV-CONTROL-3
  is judged exactly as pre-registered (2/4 → funnel count
  unchanged). The P-KEEP and RE-ASK defects are instrument
  corrections disclosed here, not re-scores: the analyzer's numbers
  stand in the analysis log, and the run note records what the
  content actually shows.

## Harness

scripts/journey-deepening-r109-20261106.js (r105 lineage: only
output filenames, header, seed band 92905–92908, EVIDIR date, and
the policy id — CONVO_DAYS [45, 60, 80] verbatim, same policy
wraps, same sitting mechanics), scripts/analyze-journey-deepening-r109-20261106.js
(r108 lineage + RE-ASK class + RE-ASK-ORPHAN scan + FIZZLE-WATCH
dry-line scan), scripts/test-journey-deepening-r109-pkeep-20261106.js
(21 checks: 13 carried r108 + 4 RE-ASK + 1 REASK_OPENER grounding
+ 3 FIZZLE), scripts/probe-loss-r109-20261106.js (diagnostic probe;
DIVERGED on both seeds — kept as the documented negative result).

## Closeout (filled after the check gate)
- check.js --quick: 283 passed, 7 failed in 421s (log /tmp/r109-checkquick.log;
  goal hidden_files copy saved at closeout — see below). All 7 adjudicated,
  none new, none caused by this run (r109 makes NO game-code change —
  tooling + evidence only): 6 standing pre-existing (same as r108's 6 —
  proof-update, workflow freshness, mobile-combat-cadence,
  occupation-panels, phone-frame-proof stale receipt,
  establishment-r20-fixes racks-full) + capable-bot (39 passed, 1 failed:
  "real capable player combat earns the food deed at first use" — fails
  standalone deterministically on this base too, same assertion it has
  failed intermittently: passed r107, failed the 278/12 run, timeout-failed
  r108; seed 42 grants day 36, seed 1234 unobserved — a base-health item
  for the main session, not this run). trust-observer-neutrality and
  measurement-cache-flags PASSED this run (both failed r108's gate).
  No failure touches conversation / convo-wants / betrayal code or the
  r109 tooling.
- Proof test re-run green after the rebase (21/21).
- Master moved during the run (1e8db620d -> dc76d9bf6, Loop B
  sim-winnability-round-1630: partydamage + pyrrhic, scripts/evidence
  only, zero src/js changes); rebased onto dc76d9bf6 explicitly,
  re-verified log, merged ff-only.
- Merged locally, pending ship (no bump/push/live-verify — ship loop
  owns those).
- Rotation 2 -> 3 written at closeout, verified by read-back.
- Heartbeat loop restarted with nohup after the mid-run death; final
  heartbeat before release verified fresh.
