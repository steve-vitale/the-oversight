# journey-scale r72 — Lane A, leg 3 SCALE (2026-11-02)

**Run id:** laneA-scale-2026-11-02T10:45CST (scheduled 10:45 CST 2026-11-02).
Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success.
**Base:** master@8471c5da3 at branch creation (journey-deepening r86 tip).
**Pre-register:** evidence/2026-11-02/journey-scale-r72-prereg.md
(written and committed before any scored seed ran).
**Change set at closeout:** ONE src/js change (foreign-react narration
cycling, Q2) + ONE proof test + ONE test-file re-seed (capable-bot
section 7, seed 10→11 — see Tests) + tooling (r72 driver/analyzer,
labels/seeds/EVIDIR only — diff verified) + evidence. ZERO src/data.
Gating freeze honored; perception law honored (all instruments read-only;
the pickers only press offered menu items, never engine state).

## Infrastructure notes (loud, first)
- **No lock contention at start:** no playtest-loop.lock existed; this
  run created it and deletes it at closeout.
- **Pre-flight clean:** main-tree `git status` empty, disk 23%,
  `git pull` already up to date, worktree-reap ran (6/16 active —
  all dirty/held lane-B and build trees, correctly untouched).
- **Registration was slow, not stuck:** worktree-register took ~5 min
  (git reset under heavy sibling load), same as r67/r68/r71. No action.
- **Heartbeat:** manual heartbeat at registration verified landed
  (16:45Z), plus a setsid+nohup loop re-beating every 10 minutes;
  registry freshness re-verified mid-run (16:47Z beat 7 minutes old
  at the 16:55Z check — never near the 15-minute threshold).
- **Safe-commit index clobber struck on BOTH commits**, same class as
  r66–r71: after each correct private-index commit, the worktree's
  main index lied (prereg commit: 3 files staged-as-deleted +
  untracked; fix commit: staged reverts + unstaged fix). Repaired
  via HEAD-blob cacheinfo, verified each time: `git status` clean,
  `git diff HEAD` empty, hash-object matches HEAD. Both commits
  themselves were correct.

## Verdicts (binding questions, answered)

### 1. SCALE CONTINUITY (report-only + verdicts)
Fresh quad 85061–85064, r71 instrument clone, SUBJECT_FIRST +
GOSSIP_FIRST, DAYCAP 180, death-aware stop. Pilot gate passed on
85061 (no crash, 6 pilgrimages, day-90 transcript present).

| seed | end | day | pop | pantry | rank | seat | arc | maxWave | pilg |
|---|---|---|---|---|---|---|---|---|---|
| 85061 | SCATTERED (hunger, 5th day) | 105 | 10/10 | 0 | regional | lesser | 4 | 4 | 6 |
| 85062 | SCATTERED (hunger, 3rd day) | 101 | 4/4 | 0 | regional | lesser | 4 | 4 | 7 |
| 85063 | DEAD (dies out) | 173 | 0/0 | 0 | regional | none | 3 | 4 | 4 |
| 85064 | SCATTERED (hunger, 3rd day) | 117 | 6/6 | 0* | regional | lesser | 4 | 4 | 2 |

\* 85064's end snapshot shows pantry 2,472 kcal on the scatter day
while the narration says the pantry echoes — the scatter fired on
the third hungry day after a 19-day bleed (43,931 → 325 kcal,
d98→d116); the snapshot kcal likely counts stock that is not an
edible meal. Noted as an observation, not a defect claim.

- **A hunger band, not a climb band.** All four villages ended before
  the cap (101–173 days), three by scattering on a hungry streak,
  one by dying out. Lesser seat 3/4 (all priced, waiting, announced,
  none sat); full seat 0/4; wave 5 reached 0/4; national 0/4, global
  0/4 at end (85063 was national+global *voiced* mid-run but ended
  regional). The scale-leg shape
  is unchanged in its essentials, but the direction to watch is
  food: the climb's waiting period is exactly when the pantry
  bleeds out (courtPoor days 23, 53, 79, 17 across the band).
- **85061 — the village that priced the seat and scattered.** Lesser
  seat, arc 4, food deeds banked, fusion installed — then the fifth
  hungry day walks everyone off in different directions at d105.
  The table waits for no one, again (r71's 85051 priced and died;
  this band prices and scatters).
- **85062 — the small village that scattered anyway.** Four people,
  lesser seat, arc 4, court poor for 53 days — the climb's poor
  court is a long grind even before hunger ends it at d101.
- **85063 — the long village that talked to the world and died.**
  173 days, national and global voiced, 22 contests, wave-4 faced
  3 times — but food deeds never banked (seat none, stage 3), and
  attrition (Theo to the Old Gavel, Miguel to the Eulogy, Dirk to
  an unclosing wound) empties it by d173. Wealth of contact without
  the deeds is still regional, and then it is gone.
- **85064 — the rich village that bled out.** 43,931 kcal at d98,
  then a 19-day bleed to 325, then three hungry days and a scatter
  at d117 — with a lesser seat waiting the whole time. The waiting
  period has a price, and this band pays it in food.

### 2. FOREIGN NOD-BACK VARIATION FIX GATE: GATE MET — fix lands
Diagnosis (proof test before any change): 4 passed / 6 failed —
three consecutive foreign-react nods returned the identical line
"They answer at length. They nod back, slowly." (r71's Nina line,
verbatim, reproduced in fixture), and the same fixed-line repeat
held for smile and pointself. Mechanism proven at code level: the
nvRespond react branch used one fixed narration per kind, while
the fluent nv: pool already cycles via convoPickCycle.
Fix (gate clauses a–b met): the react branch now selects its
narration through convoPickCycle with per-kind 3-variant pools
(first entry preserves the old line in each pool). NO trust,
temper, exposure, or routing behavior changed — the diff touches
only the narration selection (20 insertions, 5 deletions in
conversation.js). Proof: the new test runs **10 passed, 0 failed**,
asserting on the narration pool strings contained in the returned
lines, so foreign-text variation cannot fake the pass.
Clause (c) adjudication, documented not hidden: the new test is
green, gossip 11/11 green, goal-opener 7/7 green — but
test-speak-it-back.js cannot run on this base at all (harness
error at init, `Game.state` null, before any nvRespond code;
proven pre-existing by running it against the unmodified file,
identical error). It therefore provides no signal for or against
the fix, and its mediated-reaction section is untestable here
without migrating that old eval-boilerplate test to the shared
harness — carried as its own item below, not silently counted as
green. Clause (d) is the broader guard (see Tests).
No in-band transcript instance of the fix exists (no foreign /
nonverbal sitting fired in this band's 5 transcripts) — the proof
test, not the quad, is the evidence for Q2.

### 3. PEOPLE CHECK (sense law — all 5 transcripts read in full)
5 of 5 fully real in structure, with two small named wrinkles below.
No fabricated shared history, no filler loops, no static menus.
Only 5 transcripts exist (not 8): 85061/85062/85064 ended before
day 120, so no day-120 sitting fired for them.
- **85061 d90 Vasyl (favor → subject → gossip):** real. A concrete
  water-haul ask (7 liters, first light, two of us, half the trips),
  an honest subject deflect, then a coherent gossip arc (James out
  for water, Elijah out to find someone, Elijah back). The favor
  itself never gets answered because the player diverted to gossip
  — the picker's doing, not NPC incoherence. Real.
- **85062 d90 Amihan (favor → subject → gossip):** real with a
  wrinkle. Same water-haul shape (9 liters), then a Windfall chain
  that names the SAME contest win twice with flipped attribution:
  "I won Windfall. On camera." followed two beats later by "Did
  you hear? You won Windfall on the cameras." The analyzer
  correctly reports 0 repeat pairs (wording differs), but the
  content repeats with the winner swapped. Carried as an
  observation: does the gossip walk-down dedupe by event, or can
  one event serve twice with different pronouns? Not proven
  same-event from the transcript alone (two separate Windfall
  contests are possible) — a check for a later run, not a defect.
- **85063 d120 Miguel (curious/grief):** real, and the band's best.
  Grief opening ("Every laugh out there feels wrong today"), a
  sleep question, then singing ("In the shower. Which is now the
  creek. So yes, badly." / "Old songs from Manila... Tunes outlast
  everything."). Ends resolved ("Thanks. I just... need some air.").
- **85063 d90 Ingrid (curious):** real, short. A plan question met
  honestly ("One day at a time." / "Honest. I can work with
  honest."), then the player leaves. Thin, not broken.
- **85064 d90 Jack (curious):** real with a grammar seam. The
  fun-before question is met with a deflect, and the reply reads
  "Okay, but what about It was. But lifetimes come back around.
  They do." — "what about It was" is a template fill slip (the
  reply template expects a noun after "what about" and got a
  sentence fragment). Small wording seam, named, not a defect.
- Subject-first routing, same cause as r71: subject was taken at
  turn 0 in 2/5 sittings (both favor wants, where the menu offered
  it); the other 3 turn-0 menus were want-answer menus with no
  subject option. Gossip reached 2/5 sittings, 0 fallback pairs.

### 4. DUTY COUNTS (report-only, continuity)
Quad totals: villager-days 1,727; knower-days 846; armed knowers
845 (real 663, both 182, stick-only 0) + weaponless-knower days 1
(85064, knows hunting_spear — eligible 0, see below); eligible
days 0; attempts (Cd advances) 0; unexplained non-attempts 0;
stick-blocked days 0.
Weapon-craft lines 0/4 seeds; deadfall-duty lines 0/4 seeds — the
ELEVENTH consecutive 0/4 for both duties (r61–r72). The armed-gate
classification reproduces on fresh seeds and a moved base: the
duty's eligible population is structurally ~empty on the
competent scalecourt path. The band's single weaponless-knower day
(85064) was again not eligible — the analyzer's block shares put
it under "mats" (materials-blocked, the r69 variant recurring on
exactly one day), while the other 845 knower-days are armed-gate
blocked. So the duty's eligible population stays structurally ~0,
now with both documented blockers present in one band.

## BARRIER PIN (standing instrument)
Barrier entries: 85061: 1, 85062: 0, 85063: 0, 85064: 1 — all the
SAME signature as r67/r68/r70/r71: sleep() refusing during an
active fight via sayOncePerFight, with inCombat=true, tbfight=true,
over=false. The guard WORKING as designed, not a guard-break. The
pin stands in its r55 form; it does not overturn.

## PELLET-BEAT FIRING (report-only)
The pellet honesty flicker ("NO HUNGER ON THE RECORD — THE PELLET
HUMS WHERE THE FIRE SHOULD BE") fired on 85063 only — the one seed
whose food deeds are unbanked at the table approach (seat none).
85061/85062/85064 banked their deeds and priced the lesser seat;
no flicker. Beat states match deed states again (r71's rule
reproduces); the fusionReactorOnline days 60–120 trace stays queued
— this band shows no beat/deed inconsistency to trace.

## FUN / REACHABLE / WINNABLE (scale leg, plain words)
- REACHABLE: yes, and painfully so. Every seed reached regional and
  the table approach (lesser priced on 3/4); courts, covenants,
  pilgrimages, and table omens all fired. The thin spots are
  conversational (Windfall attribution, Jack's template seam) and
  the never-firing self-craft duties (eleven bands of zero).
- FUN: mostly. The conversations are genuinely good this band
  (Miguel on singing, Vasyl's water haul, Amihan's gossip roundup),
  and the climb produces distinct village stories — but this band's
  stories all end the same hungry way, which dulls the ladder's
  top: three villages price a seat they never sit because the
  pantry empties during the wait.
- WINNABLE: not shown, again. The lesser seat waits on 3/4; the
  full seat stays unwon (wave 5 reached 0 everywhere, best wave-4
  breadth 4 on 85064); national on 0/4 at end this band. The new
  shape to watch is the wait itself: sitting is a commitment with
  no way back, so the sim does not auto-sit — and the villages
  that wait starve first.

## Metric review
- Census scalars unchanged from r51's list, plus fusion/ability
  columns (reads, not scores), plus the r61 end-state class and
  the weapon-craft-line and deadfall-duty-line counts. The gossip
  analyzer reports; it does not re-score any prior metric.
- No metric was re-scored mid-run. The Q2 gate was applied as
  written except for the documented clause-(c) adjudication: the
  speak-it-back proof is void on this base (pre-existing init
  failure, identical before/after the fix), not failed-by-the-change;
  the other three targeted proofs are green and clause (d) below is
  the broader guard. The metric itself (distinct narrations) was
  not re-scored or loosened.
- Carried, still open: the Windfall-attribution check (§3); Jack's
  "what about It was" template seam (§3); the ontology doc's stale
  villagerAmmoCraftDay Provides entry (code has it 5×, doc 0× —
  suite refresh discarded, not landed); the speak-it-back
  harness migration (old eval boilerplate fails at init on this
  base); the 85061 pilgrim-stall question (6 pilgrimage starts,
  0 studies — one splinter target pinned for 79 days, see
  Telemetry); the fusionReactorOnline days 60–120 trace (r70
  follow-up, still queued — this band's beat states all match deed
  states, so it did not reproduce as an inconsistency); r65
  bank-trace finding; r63 mantle-pass proof; r58
  Irving-displacement, subject-menu, Boris nod-loop (different
  sitting shape from this run's nod fix — do not conflate); r56
  chooseAbility-unguarded note; r55 barrier pin form (guard
  confirmed working, not overturned).

## Telemetry deviation check (step 14 — NOT rolled)
`node scripts/telemetry-check.js --baseline
.../telemetry-baselines/scale-census.json --current
'evidence/2026-11-02/journey-scale-r72/journey-scale-r72-trust-*.json'
--metrics census.day,census.popAlive,census.pantryKcal,census.maxWave,census.pilgrimages`
→ one LOUD line, investigated same-run, EXPLAINED (band variance +
mechanism noted, not a bug):
- `census.pilgrimages swung -72%: baseline 69 -> current 19
  (n=4 files)`: the baseline is an old band's SUM, not a threshold,
  and this band's pilgrimage count is bounded by construction —
  a pilgrimage starts only for an unstudied below-bar village while
  the scholar is healthy (HP > 70%) and not exiled. This band ended
  early and hungry (101–173 days, courtPoor 17–79 days, all pantries
  0 at end), and its pilgrimages stalled rather than vanished:
  85061 started 6 pilgrimages but completed 0 studies, its pilgrim
  pinned to one splinter target (The Hungry Road, opinion 0) for
  79 days — the walk never closed within the 14-day stale window,
  so no new trip could start. That stall is a carried question
  (above), not a telemetry defect: the counter, the gate, and the
  band's hunger shape jointly explain 19 vs 69, and no game code in
  the r71→r72 range touches pilgrimage logic (the only src/js
  change is narration selection). The baseline is NOT rolled on
  this run's numbers (r68's decision stands).

## Tests
- `node --check` clean on the r72 driver, analyzer, proof test, and
  conversation.js (before and after the fix).
- Foreign-react proof: pre-change 4 passed / 6 failed (verbatim
  repeat on all three kinds); post-change **10 passed, 0 failed**.
- Gossip analyzer proof: `node scripts/test-gossip-r67.js` — 11
  checks passed (instrument unchanged, still green).
- Goal-opener-deep proof (r67's fix): `node
  scripts/test-goal-opener-deep-r67.js` — 7 passed, 0 failed
  (convoPick fix still green on this moved base).
- Speak-it-back: PRE-EXISTING init failure on this base, identical
  with and without the fix (see §2) — carried, not counted green.
- Gossip analyzer on the scored quad: 0 repeat pairs / 0 fallback
  pairs across 5 transcripts.
- check.js --quick (pre-rebase, on the branch code):
  **283 passed, 7 failed in 467s** (log at
  evidence/2026-11-02/journey-scale-r72/checkquick.log). Six are the
  SAME pre-existing assertion failures as r69 (same files, same fast
  exits: godpath/test-measurement-proof-update,
  godpath/test-measurement-workflow,
  godpath/test-mobile-combat-cadence,
  godpath/test-occupation-panels,
  godpath/test-phone-frame-proof, and
  test-establishment-r20-fixes-20261020.js with the same racks-full
  "next day voices once more" gate assertion). The 7th was
  test-capable-bot-20261014.js section 7 — see the re-seed item
  below. No quick-list test imports this run's new scripts.
- **Capable-bot section 7 re-emergence + re-seed (clause (d)
  investigation, same run):** the quick suite's 7th failure was the
  strict player-first food-deed assertion, with the deed banked
  first by a villager (`v:gen_sn57813`) — the same fixture
  sensitivity r69 re-seeded (seed 9→10). A/B proof this run: the
  failure reproduces IDENTICALLY with the r72 narration change
  reverted (39 passed / 1 failed, same first earner) and with it
  applied — so it is base drift since r69, not a regression from
  this run's change. Following the file's own standing procedure
  (re-seed, never loosen the assertion): seed 10→11 restores the
  full file to **40 passed, 0 failed** with the strict assertion
  intact, and the seed-chain comment was updated in the file's own
  style. The re-seed is re-verified post-rebase below, since a
  rebase can shift the stream again.
- Suite side effect, checked not assumed: `git status` after the
  suite run showed one stray modification, docs/ONTOLOGY.md (the
  suite's ontology refresh adding a villagerAmmoCraftDay Provides
  entry that the code has but the doc lacks). Discarded per the
  stray-change rule (`git checkout -- docs/ONTOLOGY.md`) — a
  legitimate-looking refresh, but out of this run's scope; carried
  as an observation below, not landed here.
- Post-rebase proofs (on master 40e62ed8b, after a clean 3/3 rebase):
  foreign-react proof 10/10 GREEN, gossip 11/11, goal-opener 7/7,
  capable-bot 40/0 (seed 11 holds on the rebased base — the rebase
  did not shift the stream again).
- Post-rebase control quad (not a re-score): because the rebase
  range holds game code (sim-npcdeadfilter-a's betrayal.js dead
  filter, +27/-1), the quad was re-run on the new base as a CONTROL
  (same seeds, same driver, separate evidence dir
  journey-scale-r72-rebase) — the scored measurement stays the
  pre-rebase quad above. Control result: **all four seeds
  byte-identical in census outcome** (same end day, pop, pantry,
  rank, seat, arc, abilities, courtLines) and **all 5 transcripts
  byte-identical** to the scored quad; gossip analyzer identical
  (0 repeat / 0 fallback). The dead-filter change moves nothing on
  this band — the scored quad stands unchanged on the new base,
  proven by re-execution rather than by a zero-game-code argument.

## Landing (filled at closeout)
Master at worktree creation: 8471c5da3. At closeout master had
moved to 40e62ed8b (14 commits: Loop B evidence + gatediseng +
homeward + heralddepart + npcdeadfilter results — one
conversation-adjacent game change in the range: betrayal.js dead
filter, +27/-1). The branch was rebased cleanly onto 40e62ed8b
(3/3 picks, no conflicts, no stop-at-pick quirk), proofs re-run
green after the rebase (foreign-react 10/10, gossip 11/11,
goal-opener 7/7, capable-bot 40/0), and the control quad above
proves the measured quad stands unchanged on the new base.
Merged locally via `git merge --ff-only journey-scale` → master
(verified: master tip equals the branch tip after merge), pending
ship (no bump, no push, no live verify — ship loop owns those).
Branch commits: 7edb3a834 (prereg + driver/analyzer), f375ce36b
(Q2 fix + proof test), d6d401c58 (quad + analyses + run note +
capable-bot re-seed), plus this landing section as the final
branch commit, merged by a second fast-forward. Worktree released
+ branch deleted at closeout; final main-tree status clean.
Rotation file written 3→0 at closeout and verified by reading it
back. Playtest lock deleted at closeout. Heartbeat loop stopped
at closeout.
