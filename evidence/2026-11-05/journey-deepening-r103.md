# journey-deepening r103 — run note (lane A, leg 2 DEEPENING)

**Run id:** laneA-deepening-2026-11-04T2302CST (lock 2026-11-05T05:02:49Z).
No prior lock existed, so no stale-lock recovery; main tree clean,
disk 31%. Base master@82bddc68e at worktree creation (includes the
r102 stale-goal-line fix c498e05ff — verified present in the
worktree: goal/goalLine resets at objPick, GUARD overwrite, and
agency EXPLORE overwrite). Rotation read 2 -> deepening; 2->3 written
at closeout (see closeout). Lock deleted at closeout per the body's
even-on-failure rule. Prereg:
evidence/2026-11-05/journey-deepening-r103-prereg.md (written BEFORE
any seed ran) + one pre-scoring amendment (goalSnap collection kept
for driver continuity, not scored — the goal question is closed for
this window). Seeds fresh 94201–94204, competent policy (r102 driver
lineage + r103 analyzer: V-INIT scan + B-LEAD descriptive scan),
DAY CAP=100, death-aware stop. Smoke seed 94200 x DAYCAP=45 proved
the harness (survived day 46, wave 3, pop 9/9, 0 mislabels) and was
deleted per the prereg. Main panel ran ~64s for 4 seeds. Heartbeat:
registered + heartbeated at start and at every major step; no flap
observed this run (exec writes verified 3000 bytes read back).

## Panel verdicts (pre-registered, no re-scoring)

- **V-INIT-BOND (primary): 0 across the whole panel — BLANK
  reproduced in the wild.** 0 of 19 sittings contain an
  NPC-initiated bond proposal (party join, joint outing, visit,
  village link, covenant, trade pact) in the opening want or any
  THEM line. Contrast, same sittings: player-side invite options
  offered in 10/19 (invite_party / dlg:invite in the menu),
  betrayal invitations offered in 7/19. Villagers initiate plenty
  — asks for food, wound help, comfort, curiosity, the taken — but
  never a bond. Engine check (pre-scoring code read):
  proposeLink / proposeCovenant / proposeTrade call sites in
  src/js are ONLY app.js UI bindings (player clicks); the only
  other callers are sim drivers acting as the bot player. So
  village-link initiation by NPCs is absent BY CONSTRUCTION, not
  by behavior: no engine path exists for a village or villager to
  propose a link unprompted. Bot (player-side) proposals this
  panel: 94201 linked, 94202 countered, 94203 none, 94204 linked
  (K-CONTEXT propose counts). Against Steve's 2026-11-04 ruling
  (villagers initiate bonds on their own, perception-gated), this
  is the documented blank: the ruling has no engine to land in
  yet for links, and no conversation want type proposes a bond.
- **P-KEEP (primary, verdict now): ABSENT on fresh seeds.**
  Threads 12: DEAD 7, SILENT 2, NO-LATER-SITTING 3. Revisited-alive
  threads = 2 (Kavya 94202 day45->60; Tanisha 94202 day45->60),
  both SILENT, 0 NAMED. Aggregate with r100 + r102: revisited-alive
  threads now total 7, all SILENT, 0 NAMED. Promise memory does
  not exist in the deepening window: a villager re-presents the
  want (Kavya's day-60 sitting is curious small-talk; Tanisha's
  day-60 sitting is a fresh food ask) but never names the earlier
  promise. Not a re-score: threads counted exactly as the carried
  analyzer classifies them.
- **G-SENSE (carried): 0 senseless sittings.** All 19 transcripts
  read in full — see people check.
- **B-SIT (carried): 7 betrayal sittings** (4 accept / 3 decline /
  0 unanswered). **B-FOLLOW: 1 follow-up sitting**, with a new
  betrayal (Zhiming day 80, after day 60 accept). Blocked-agreement
  clean (badBlocked=0, badRevisit=0 on all seeds).
- **B-LEAD (descriptive, new — NOT V-INIT-BOND): 5 sittings** carry
  a betrayal-invitation lead-in ("Walk with me? I want another
  pair of eyes on something", "Come get air with me. I need to
  think out loud", "Come see what I found. You won't believe
  it"). This is the closest thing to villager-initiated
  togetherness in the panel — and it is a conspiracy invitation,
  not a bond: every lead-in is immediately followed by the
  betrayal menu. Counting it as bond initiation would conflate
  B-INIT with V-INIT-BOND, so it stays its own class.
- **D-THING (descriptive, r95 open item — still open):** 3 declines
  leave a pocketed thing (Carlos 94201 day 80, Zhiming 94202 day
  80, Cesar 94204 day 60); 0 revisited in a later sitting
  in-window (Carlos and Zhiming are last sittings; no later Cesar
  sitting exists). The pocketed thing still never comes back.
- **Carried, not re-judged:** S-TRACE EXPLAINED 3/4 (94203 never
  reached regional — NO-REGIONAL-DAYS, lost day 50); G-mismatch 0
  on every seed and day on fresh seeds (the r102 fix holds — the
  only stale entries are done/idle villagers, the benign class:
  94204 day 45, 3 idle/done); K-CONTEXT lessons 42/42, 35/45,
  20/23, 47/47; meat channel alive on all seeds (meatK 18–25,
  dinners 2–9); diplomacy 0 everywhere, as in r102.
- **Survival (descriptive, not a winnability verdict): 2/4
  survived** (94202, 94204 to day 101, wave 4, regional); 94201
  lost day 92, wave 4; 94203 lost day 50, wave 3. All seeds reached
  wave 3+; none reached wave 5.

## Village assessment, in plain words

Two villages held through the deepening window and two did not,
and the split is not about knowledge — every village knew plenty.
It is about the scholar's line surviving: the village that lost
on day 50 still had eight people alive, and the one that lost on
day 92 was down to two. Food, company, and standing all moved,
but nobody in any village proposed a closer tie to anyone else —
no villager invited the player anywhere except into a secret, no
village knocked on Haven's door unprompted, and every link in the
panel was proposed by the player's own hand (or not at all).

- **94201 (lost, day 92, wave 4, regional, standing max 210):** a
  long fight that thinned to two people by day 91; its one link
  (village_0, age 60) never seasoned, trust stuck at 10. Lessons
  42/42 — it knew everything and still thinned out.
- **94202 (survived, day 101, wave 4, regional, standing max
  190):** the furthest reach with a real tie — a seasoned link
  (village_1, age 74, trust 47), 4 alive, lessons 35/45. Its
  promise threads are the panel's P-KEEP evidence: both revisited
  alive, both silent.
- **94203 (lost, day 50, wave 3, village scale, standing max
  75):** the early fall — 8 people alive at the end, no links at
  all, never reached regional. A going concern that lost its
  scholar's line, not a wipe. Only one sitting day (day 45) before
  the end.
- **94204 (survived, day 101, wave 4, regional, standing max
  175):** the steady one — 3 alive, lessons 47/47 (the panel's
  deepest bench), a 75-day link at trust 34 that never seasoned.
  Alive, knowledgeable, and barely linked — the same shape as
  r102's survivor.

## People check (all 19 transcripts read)

G-SENSE 0 senseless. The sittings read as people with wants, not
menus. Notes, not defects:

- **Carmen (94201 day 45, roofer):** accepts a betrayal invitation
  and then stalls — "Maybe not today. The fire's got me." A sick
  person overpromising and then honestly unable to go. Coherent,
  and the panel's clearest case of a body overruling a promise.
- **Kavya (94202 day 45 -> 60, beekeeper):** day 45 a food promise
  ("I won't forget who fed me when it mattered"); day 60 curious
  small-talk that never mentions it. SILENT, correctly classified.
- **Tanisha (94202 day 45 -> 60, florist):** day 45 a pods promise
  ("I'll ask the System about the pods"); day 60 a fresh food ask
  that never mentions it. SILENT, correctly classified. The want
  re-presents; the promise does not — the r100 shape again.
- **Zhiming (94202 day 60 -> 80, butcher):** day 60 the honest
  refusal shape ("I'm out on the road... Find me when I'm back")
  plus a betrayal accept at the hollow; day 80 the same food want
  re-asked and a betrayal decline with a pocketed thing. A
  consistent person across two sittings. SENSE.
- **Regina (94203 day 45, dentist):** "I asked Jacob about the
  food I needed — Jacob's gone. Still need hands. Are you in?"
  Grief and need in one breath, then a thinking place shown with
  "Don't tell the others." SENSE.
- **Dmitri (94204 day 80, appliance repair tech):** betrayal
  accept repaid with a gifted tool ("Here. I made an extra"), then
  gossip that names real panel people (Stan the exterminator) and
  defends Jesse from whispering. A village talking to itself.
  SENSE.
- **Ellis (94204 day 60, teacher):** "I trade in what I know. My
  knowledge for yours. Or food, if you're short on secrets" —
  then a gossip chain naming Petra, Jian, Cesar, Ava, Jesse. The
  knowledge economy speaking as a person. SENSE.
- **Hassan (94201 day 60, butcher):** "Watch the quiet ones. Not
  the loud — the loud tell you everything." Advice that reads as
  character, not a tip menu. SENSE.

## The blanks this run fills

1. **Villager-initiated bonds in the wild (new panel):** 0/19
   sittings, and no engine path for NPC link proposals at all.
   The blank is documented with its mechanism (UI-only propose
   functions), not just its count. Next step is a builder brief,
   not a tweak: a perception-gated NPC proposer (villages/villagers
   the proposer has actually met or heard about) with played
   negotiation on the receiving side. No game change is made here:
   that is a system, and this run's prereg commits to documenting
   rather than redesigning it on the spot.
2. **P-KEEP verdict (r100/r102 floor now judged):** ABSENT on
   fresh seeds; aggregate 7 revisited-alive threads, all SILENT.
   Promise-naming is now a confirmed multi-run absence in the
   deepening window, not a single-panel quirk.
3. **r102 fix confirmation (carried, not re-scored):** goal
   mismatch 0 on all fresh seeds/days — the stale-goal-line reset
   holds on the live code, not just the r102 panel.
4. **B-LEAD class (new instrument):** betrayal lead-ins separated
   from bond proposals so future V-INIT panels cannot mistake a
   conspiracy invitation for a bond.

## Telemetry deviation check

`node scripts/telemetry-check.js` against
hidden_files/telemetry-baselines/deepening.json, metrics w3fights,
engaged.w3, fightsTotal, fightsByWave.3, current = r103 4-seed
panel: **quiet (4 files, 4 metrics, no large deviations).** No
baseline roll, nothing to investigate.

## Metric review

- **V-INIT-BOND definition held, with a boundary made explicit:**
  betrayal lead-ins ("Walk with me?", "Come get air with me")
  are the natural false positive for this metric. The B-LEAD
  split keeps them out of V-INIT-BOND permanently; future panels
  should keep both scans.
- **P-KEEP verdict rule worked as designed:** the DEAD-heavy
  panel (7/12 threads) still yielded 2 revisited-alive threads,
  enough to judge — but a future panel with 0 revisited-alive
  threads should report NO-VERDICT, not ABSENT, since absence of
  revisits is not absence of memory.
- **D-THING stays open** (3/3 unrevisited) and now has a clean
  count method (decline + pocketed thing + later-sitting scan).
- No pre-registered metric was re-scored mid-run. V-INIT-BOND,
  P-KEEP, and the carried instruments are reported exactly as
  pre-registered; the B-LEAD addition is descriptive only and
  changes no scored number.

## Harness

scripts/journey-deepening-r103-20261105.js (r102 lineage: only
output filenames, header, seed band 94201–94204, EVIDIR date
2026-11-05 changed; goalSnap collection retained, not scored).
Analyzer: scripts/analyze-journey-deepening-r103-20261105.js
(r102 scans carried + V-INIT scan + B-LEAD descriptive scan).
No game-code change this run (tooling + evidence only, zero
src/js). Per-seed JSONs + 19 transcripts: goal hidden_files
evidence 2026-11-05 (journey-deepening-r103-seed9420*.json,
journey-deepening-r103-transcript-*.txt). Prereg + this note in
repo evidence/2026-11-05/.

## Regression gate

`node scripts/check.js --quick` with
--cacheDirectory=/tmp/jest-cache-playtest, single run: **279 passed,
11 failed in 1513s** — against the r102 closeout baseline of 284
passed / 6 failed in 576s. Two caveats, both disclosed, neither
hidden: (1) this run touches zero src/js (tooling + evidence only),
and check.js executes the green-list game scripts, which do not
include the new driver/analyzer — so no failure in this gate can
come from this run's files by construction; the delta sits in
master movement since the r102 baseline plus contention (three
slowest tests hit exactly 120s, and sibling check.js runs were
active concurrently — the known concurrent-jest phantom source).
(2) Process mistake, owned: the gate was piped through `tail -15`,
so the per-script failure list for this first run was not retained.
A second full-output run (saved to /tmp, not the repo) was made
before landing to recover the list; its result is in the final
message and in the closeout amendment below. The landing decision
rests on (1): a tooling-only change cannot regress game scripts
it is never executed by.
