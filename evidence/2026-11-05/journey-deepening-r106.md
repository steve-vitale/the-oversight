# journey-deepening r106 — run note (lane A, leg 2 DEEPENING)

**Run id:** laneA-deepening-2026-11-05T2153Z (lock 2026-11-05T21:53:39Z).
No prior lock existed, so no stale-lock recovery; main tree clean,
disk 25%. Base master@25de3b127 at worktree creation. Rotation read 2
-> deepening; 2->3 written at closeout with verified write + retry
(see rotation note). Lock deleted at closeout per the body's
even-on-failure rule. Prereg:
evidence/2026-11-05/journey-deepening-r106-prereg.md (written BEFORE
any seed ran; freshness section completed BEFORE the panel ran).
Seeds fresh **92401–92404**, competent policy (r105 driver lineage +
r106 analyzer), DAY CAP=100, death-aware stop. Smoke seed 92400 x
DAYCAP=45 proved the harness (survived day 46, wave 3, pop 8/8, 0
mislabels) and was then re-run x DAYCAP=55 to prove the NEW day-52
sitting (day-52 sitting fired, goalSnap day 52, survived day 56, wave
4, pop 11/11, 0 mislabels); smoke outputs deleted per the prereg. The
55-day smoke is a deviation from the prereg's stated DAYCAP=45, made
transparently: the 45-day smoke cannot reach the new instrument (day
52), so the smoke was extended to cover it. The smoke is a harness
proof, not a scored metric; no verdict depends on the smoke cap.
Heartbeats: registration 22:08Z, manual 22:11Z, 600s loop throughout.

## Panel verdicts (pre-registered, no re-scoring)

- **P-KEEP (primary): PRESENT — NAMED 2 / 4 revisited-alive
  (old-regex NAMED 2).** The denser cadence did what r105's metric
  review asked: revisited-alive threads doubled (r105: 2, r106: 4)
  and both NAMED hits came at the NEW day-52 sitting. Threads 10:
  NAMED 2, SILENT 2, DEAD 4, NO-LATER-SITTING 2.
  - Quinton (92402 day 45 -> 52): the day-52 `repay` sitting names
    the food promise in plain words — "You came through on the food
    I needed. I won't forget it." — then the debt beat ("...Fine.
    But I don't like owing." The debt stays on their face.) and a
    betrayal walk to his thinking place. The r104 fix firing in the
    wild, at the earliest revisit.
  - Milo (92403 day 45 -> 52): the day-52 `repay` sitting names the
    pantry run — "You said you'd help with the pantry run. ...It's
    done now. Forget it." — same debt beat, same "don't like owing"
    line. Two repay sittings, two namings, both at day 52.
  - The two SILENT threads name the coverage bound's remaining
    halves precisely: Olivia (92401 day 45, seek_taken promise to ask
    the System about Carl) is revisited at day 52 on a LIVE
    ask_favor seed and at day 60 on a fresh food ask — the seed
    keeps priority, the old promise is never named. Shufen (92403
    day 52, pantry-run promise) is revisited at day 60 on a
    `curious` question ("What's the most useful thing you've
    learned?") — the sitting opens on something else, so the repay
    voice never gets its turn. Third half, now named: question-first
    openings pre-empt the repay record-select exactly as live seeds
    do.
  - The four DEAD are all own-seed (verified by eye against the
    death logs; the seed-scoped lookup changes no verdict this
    panel — the proof test, not the panel, proves the fix): Olivia
    d60->d90, Kamel d45->d52-blocked, Ines d80->d84, Milo d60->d69.
  - Metric honesty: both NAMED hits match the OLD regex too
    ("won't forget", "Forget it"). The revised-regex-only
    vocabulary (stale-opener words: "turning it over", "still on my
    mind") did NOT fire in a live panel this run — the PRESENT
    verdict comes from the cadence, not the vocabulary. The revised
    metric stays validated (proof test 13/13, scores PRESENT 2/5 on
    r104's panel), but the new words remain unexercised in the wild.
- **V-INIT-BOND (carried): 0 across the whole panel — blank stands.**
  0 of 22 sittings contain an NPC-initiated bond proposal.
  Player-side invite options offered in 9/22, betrayal invitations
  in 8/22. build-bond-initiate is still NOT merged (branch exists,
  no merge commit). The blank still needs a system.
- **G-SENSE (carried): 0 senseless sittings.** All 22 transcripts
  read in full — see people check.
- **B-SIT (carried): 8 betrayal sittings** (4 accept / 4 decline /
  0 unanswered). **B-FOLLOW: 2 follow-up sittings**, 1 with a new
  betrayal. **B-LEAD (descriptive): 6 sittings** with betrayal
  lead-ins — "Walk with me?", "Come see what I found.", "Come get
  air with me." (Olivia, Kamel, Quinton, Stan, Ines, Shufen).
  Blocked-agreement clean (badBlocked=0, badRevisit=0 on all seeds).
- **D-THING (descriptive, r95 open item — still open):** 3 declines
  leave a pocketed thing (Olivia 92401 day 60, Kamel 92402 day 45,
  Shufen 92403 day 60); 0 revisited in a later sitting, 0 mentioned.
  All three are last-sitting cases (maker died after, or no later
  sitting with that villager existed), so the count method still
  cannot distinguish "never comes back" from "no later sitting
  existed". The pocketed thing still never comes back. Same count
  method as r105.
- **S-TRACE (carried): EXPLAINED 3/4, NO-REGIONAL-DAYS 1/4**
  (92404 lost day 35, before the deepening window). G-mismatch 0
  on every seed and day (the r102 fix holds). G-STICK: 92401 stuck
  1/2 (Lena, top null), 92402 n/a (0 villagers on all days), 92403
  stuck 7/8 (same shape as prior runs), 92404 n/a (no snaps).
  G-LINES: food_security dominates (199/227, 128/137, 142/200,
  28/39); bonds 0, knowledge 0, build_standing 0, gear_up 0
  everywhere except gear_up 1 in 92404's lines. G-STALE: 3 items
  (92402 day 52 Nino idle/done carrying safety; 92403 day 45
  Dmitri and day 52 Chloe idle/done) — reported, not counted as
  defects per the analyzer's framing. K-CONTEXT lessons 11/33,
  37/37, 17/40, 6/13; bot proposed a link on 3 of 4 seeds
  (propose=2 linked, 1 counter); diplomacy 0 everywhere, as in
  r102/r103/r104/r105; mislabels 0.
- **Survival (descriptive, not a winnability verdict): 0/4
  survived** — all village-lost (92401 day 90, 92402 day 84, 92403
  day 69, 92404 day 35). Standing max 255/25/150/0. All seeds
  reached at least wave 3; none reached wave 5. Meat channel alive
  on all seeds (kills 31/19/11/19, tests 7/3/2/2, reveals 6/3/2/1,
  dinners 6/4/1/0 — 92404 ate no monster dinner in 35 days).
  Fights total 64 (r105: 63) — the fight LOAD is unchanged; the
  outcomes are worse. Deaths are fight-heavy on every seed
  (combat + villager-combat dominate: 49/67, 33/49, 29/39, 29/40;
  starvation only 1/7/1/1). 92401's pantry hit 0 at day 85 (pop 3);
  92403 died to fights with a 19.6k pantry at day 50; 92404 lost
  at day 35 with 6 alive (same shape as r105's 92203, lost day 36).
  This is a descriptive flag, not a verdict on the instrument
  change: one extra sitting day (~30 kcal, no new mechanics) cannot
  plausibly kill villages, and the fight load matches r105's. With
  n=4 fresh seeds on a moved base, this is seed variance + base
  drift — but the direction is bad enough to name: the NEXT run
  should carry a same-base control (re-run the r105 driver on the
  current base, the establishment-r105 M0 precedent) before anyone
  claims the deepening funnel moved. Not run here: it was not
  pre-registered, and the run's question is P-KEEP, not survival.

## Village assessment, in plain words

No village held through the deepening window this time — and the
talking is the bright half of a dark panel. Two villagers, Quinton
and Milo, looked the player in the eye seven days after a promise
and named it: the food came through, the pantry run is done, and
they don't like owing. The villages that died, died fighting: the
fight count is the same as r105's panel, but the fights went worse
— rosters ground down to one last person standing (Farid on 92401,
Ines on 92402), or to five people with a full pantry and nobody
left to hold the line (92403), or to six people gone by day 35
before the window even opened (92404). The villages still barely
link — one link each, none seasoned — and their people still mostly
ask for the same things (food, water, hands) rather than each other.

- **92401 (lost, day 90, wave 4, regional, standing max 255):** the
  talker who kept her promises in sight — Olivia's seek_taken
  promise (ask the System about Carl) went unnamed through two
  revisits, but her day-60 food promise was made and the village
  fought on to day 90 with Farid last standing, pantry 0. Lessons
  11/33 — it knew the least of the panel and lasted the longest.
- **92402 (lost, day 84, wave 3, regional, standing max 25):** the
  thinnest village — 7 starvation deaths, pantry 800 at day 70,
  Ines last standing. But it holds the panel's cleanest naming:
  Quinton's day-52 repay sitting. Lessons 37/37 — it knew
  everything it was taught and starved anyway.
- **92403 (lost, day 69, wave 4, village, standing max 150):** the
  richest village — 19.6k pantry at day 50 — died to fights anyway,
  with Milo's day-52 repay sitting as its naming. Lessons 17/40.
- **92404 (lost, day 35, wave 3):** no sittings at all — the village
  was gone before the first convo day, ground down by early fights
  (40 death records, 29 combat). It still tested monster meat twice
  in 35 days and ate none of it.

## People check (all 22 transcripts read)

G-SENSE 0 senseless. Notes, not defects:

- **Olivia (92401, lifeguard, dry):** day 45 a seek_taken promise
  (ask the System about Carl); day 52 grieving, betrayal accept to
  her thinking place ("Don't tell the others. Everyone needs one
  place."); day 60 a food re-ask, promised, betrayal decline
  ("Another time, then." A small thing, pocketed.); died before day
  90. SENSE — and the seed-priority half of the coverage bound in
  person.
- **Ariki (92401, army medic, fidgety) / Nathan (92401, mechanic,
  stoic):** day-45 curiosity — regret ("I regret the ordinary days
  I rushed through. All those Arkhangelsk mornings...") and trust
  ("I just haven't finished trusting most of them yet."). SENSE.
- **Onni (92401, chimney sweep, cautious):** day 80 a buried bundle
  dug up — food, still good (+1334 kcal to the pantry). "Back home
  I was background. Here, I get to be foreground." SENSE. (The
  five-pick "Tell me more" aphorism chain is driver repetition, not
  a game defect — same pattern as prior runs.)
- **Quinton (92402, lifeguard, withdrawn):** day 45 a re-ask ("I
  hate to ask twice, but it's still open."); day 52 THE repay
  sitting ("You came through on the food I needed. I won't forget
  it." / "I don't like owing."); day 60 grieving, gossip naming
  real people and a real contest ("You won The Moot on the
  cameras."). SENSE — the fix firing, and a person grieving after.
- **Kamel (92402, appliance repair, dry):** day 45 "The food I
  needed — I haven't stopped thinking about it.", promised,
  betrayal decline, pocketed thing; died before day 52. SENSE.
- **Madison (92402, tattoo artist, withdrawn):** day 45 hungry
  ("It's been too long since a real meal. I'm slowing down —
  stupid, clumsy."); promised. SENSE.
- **Stan (92402, exterminator, dry, trust 20):** day 60 shaking
  hands, "Please — do you have anything to eat? Anything at all?"
  — he asks at trust 20, which reads right for hunger; decline
  ("Right — another time.", no pocketed line — the decline line
  varies). SENSE.
- **Ines (92402, florist, warm):** day 80 a water-haul ask with a
  real number ("Water's almost gone — 0 liters."), dawn creek plan,
  betrayal accept to the ridge. SENSE. Last living villager of her
  village; died as it was lost.
- **Shufen (92403, dry cleaner, sardonic):** day 45 a forage ask
  with a real place, honest road deflect; day 52 the pantry-run
  re-ask, promised; day 60 a question ("What's the most useful
  thing you've learned?") answered with hunger ("How to be hungry
  and keep going anyway." / "The fundamental skill."). SENSE —
  and the question-first half of the coverage bound.
- **Milo (92403, lifeguard, warm):** day 45 a forage ask, promised;
  day 52 THE repay sitting ("You said you'd help with the pantry
  run. ...It's done now. Forget it." / "I don't like owing."); day
  60 a re-ask ("I hate to ask twice..."), promised; died before
  day 69. SENSE.
- **Carlos (92403, barber, stoic, trust 40):** day 45 "Do you still
  count the days?" — "I count meals, not days. Three meals since
  the rain. Two since the alarm. Days are for people with
  calendars. I have a stomach." Day 52: "Never mind the food I
  needed — we got it handled. Thanks anyway." — a need resolving
  off-screen, named. Day 60: first memory ("Mine's Columbus, Ohio,
  I think — heat on pavement, someone's hand huge around mine. Or
  I invented it."). SENSE — the best voice in the panel.
- Flat notes, stated not hidden: the stock promise-accept line
  ("Thank you. I won't forget who fed me when it mattered.") fires
  after nearly every food promise in the panel; the ask_field
  deflection ("There's more, but that's for another fire.") fired
  twice (Nathan, Kamel); the "You won The Box / The Moot on the
  cameras" gossip fired twice (Olivia, Quinton). All readable,
  all templated — the same class as r105's "goon" mood lines.
- Watch item NOT reproduced: no near-duplicate line (the r105
  Donna "I'll make it a home" / "I'd make it a home" case) appears
  in any of the 22 sittings. The repeat ledger's tense-change gap
  is unobserved this panel, neither confirmed nor cleared.

## The blanks this run fills

1. **P-KEEP is PRESENT on fresh seeds — the coverage bound was the
   binding constraint, and the cadence widened it.** Revisited-alive
   threads doubled (2 -> 4) with one added sitting day, and both
   namings happened at that new day, seven days after the promise.
   The r104 fix reaches the wild when a same-bearer revisit happens
   quickly. The question is closed as a metric question; what
   remains open is the coverage itself (see metric review).
2. **The coverage bound now has three named halves, all traced to
   code/behavior:** succession release (r105), live-seed priority
   (r105, Olivia again here), and question-first openings (new:
   Shufen day 60 — a sitting that opens on a question never gives
   the repay record-select its turn).
3. **The seed-scoped death lookup is proven by test (13/13) and
   changes no panel verdict** — no cross-seed collision occurred in
   this panel. The r105 quirk is closed as an instrument defect.
4. **r102 fix confirmation (carried):** goal mismatch 0 on all
   fresh seeds/days — the stale-goal-line reset holds on the live
   code.
5. **V-INIT-BOND blank re-confirmed on fresh seeds:** 0/22, same
   mechanism (UI-only propose functions). Still needs a system.

## Telemetry deviation check

`node scripts/telemetry-check.js` against
hidden_files/telemetry-baselines/deepening.json, metrics w3fights,
engaged.w3, fightsTotal, fightsByWave.3, current = fresh 924xx
4-seed panel: **quiet (4 files, 4 metrics, no large deviations).**
Sums: fightsTotal 64 (baseline 60), w3fights 18 (baseline 18),
engagedW3 15 (baseline 23). No LOUD lines, no investigation, no
baseline roll. (First invocation used a worktree-relative glob and
found no files — re-run with the absolute goal-evidence path.)

## Metric review

- **The revised metric is validated, but this panel's PRESENT came
  from the cadence, not the vocabulary.** Both NAMED hits match the
  old regex. The stale-opener words ("turning it over", "still on
  my mind", "keep thinking", "coming back to it") remain
  unexercised in a live panel — they fired only in the proof test
  and in r104's retrospective Ruth scoring. Proposed for the NEXT
  run (not this one): no metric change is needed; the metric sees
  what fires. The open question is coverage, not measurement.
- **Coverage is the open question now, and it has three halves.**
  The denominator this panel was 4 revisited-alive of 10 threads;
  4 more threads died with their makers and 2 had no later sitting.
  Widening further (a fifth sitting day, or sittings that revisit
  the repay record before opening on a question/seed) is an
  instrument or design change for the next run to propose — NOT a
  re-score of this one. The question-first half (Shufen) is a
  design question in the same class as r105's re-ask-naming
  question: should a sitting with an unsettled promise lead with
  the repay voice before opening on a question? That is Steve's
  call, not a tweak. Not built here.
- **Survival 0/4 is a flag for the next run, not a verdict on this
  one.** The prereg carries survival as descriptive only. The
  next run should carry a same-base control (r105 driver on the
  current base, the establishment-r105 M0 precedent) before
  claiming the deepening funnel moved in either direction.
- **D-THING stays open** (3 pocketed, 0 revisited, 0 mentioned)
  with the same count method as r105. All three this panel are
  last-sitting cases, so the method still cannot separate "never
  comes back" from "no later sitting existed".
- **V-INIT-BOND definition held:** betrayal lead-ins stay out of
  V-INIT-BOND (B-LEAD split kept, 6 this panel); the two repay
  sittings are P-KEEP evidence, not bond proposals.
- No pre-registered metric was re-scored mid-run. P-KEEP, V-INIT,
  and the carried instruments are reported exactly as pre-registered;
  the smoke cap (45 -> 55) is the one deviation, disclosed above —
  it touches no scored metric.

## Harness

scripts/journey-deepening-r106-20261105.js (r105 lineage: only
output filenames, header, seed band 92401–92404, and CONVO_DAYS
[45, 52, 60, 80] changed). Analyzer:
scripts/analyze-journey-deepening-r106-20261105.js (r105 scans
carried + seed-scoped death lookup + filename/band changes only).
Proof test:
scripts/test-journey-deepening-r106-pkeep-metric-20261105.js
(13/13; not on the green list, same precedent as the r105 test —
do not add it). No game-code change this run. Per-seed JSONs + 22
transcripts: goal hidden_files evidence 2026-11-05
(journey-deepening-r106-seed9240*.json,
journey-deepening-r106-transcript-9240*.txt). Prereg + this note in
repo evidence/2026-11-05/.

## Regression gate

`node scripts/check.js --quick` with
--cacheDirectory=/tmp/jest-cache-playtest, single run, 1218s:
**282 passed, 8 failed** — vs r105's 277/13. All 8 are in the
standing pre-existing set (r105 deepening's 11 + r105
establishment's 6); NO new failures. The 8:
test-measurement-proof-update, test-measurement-workflow,
test-mobile-combat-cadence (same 2 sub-failures as r104/r105),
test-occupation-panels (retained-neutrality family),
test-measurement-cache-flags (4 sub-failures),
test-phone-frame-proof (3 sub-failures, stale phone receipt),
test-trust-observer-neutrality (120s timeout, exit null),
test-establishment-r20-fixes (1 sub-failure: racks-full voice
"next day voices once more", expected 2 got 1 — the known r103
baseline failure). The 5 timeout flakes from r105's gate
(synergy-stall, capable-bot, table-endings, throttlefeast,
first-ability-magic) all PASSED this run (slowest: trust-observer
120s, solo-campaign-endings 115s, capable-bot 95s) — a sibling
Lane B gate ran concurrently (journey2-succession-r142), so the
single 120s timeout is load, not a regression. This run changed
NO src/js (only new scripts/ + evidence/), so none of the 8 can
be caused by it. Targeted proof on the touched area: P-KEEP
metric 13/13.

## Infrastructure notes

- **Runtime restart killed the first registration mid-flight**
  (~22:0xZ): `git worktree add` had created the worktree and
  branch, but the registry entry was never written, and the
  worktree was left locked ("initializing" — git's own checkout
  lock). Recovery: `git worktree unlock`, `git worktree remove
  --force`, `git branch -d journey-deepening`, then a clean
  re-run of worktree-register.sh (succeeded 22:08Z, registry entry
  with run_id 2026-11-05T21:53:39Z, heartbeat 22:08:03Z). The
  restart also wiped /tmp — the prereg draft staged there was
  lost and rewritten directly into the worktree. Lesson: never
  stage run artifacts in /tmp across a restart boundary; the
  worktree (or goal hidden_files) is the durable place.
- **Rotation-write discrepancy, 5th sighting — sequence now
  consistent, cause narrowed.** r105's 2->3 DID stick (scale r100
  read 3 and wrote 0 at 18:42:48Z); landing r106's 0->1 did NOT
  stick; r107's 0->1 and establishment r105's 1->2 both stuck
  (verified by read-back; establishment's write is this run's
  start-state, mtime 21:49:52Z). No script writes the rotation
  file (grep over scripts/ + docs/ finds only a comment in an old
  landing driver) — each run's closeout shell write is the only
  writer. Verified-by-read-back writes stick; silent ones
  intermittently don't, correlating with EPERM flap windows. This
  run's closeout write is verified by read-back with up to 3
  retries, 60s apart.
- safe-commit index clobber hit the prereg commit (4 files
  staged-as-deleted + untracked; commit 0ee263b39 correct);
  repaired with `git update-index --cacheinfo` from HEAD blobs,
  verified clean `git status` + empty `git diff HEAD` + matching
  hashes.
- Registration was slow (~3 min) under REGISTRY.lock contention;
  the register script itself was healthy, just queued. Heartbeat
  loop held throughout (600s loop, log:
  goal hidden_files/journey-deepening-r106-heartbeat.log).
- No EPERM flap this run (one restart, no flap).
- Rotation 2 -> 3 at closeout — verified by read-back (see closeout).

## Closeout (filled after the check gate)
- check.js --quick: 282 passed, 8 failed in 1218s (all 8
  pre-existing, no new failures — see above).
- Rebased onto master 555f59160 (sim-bankkiller-b landed while the
  gate ran); proof test re-run green after the rebase (13/13).
- Merged locally, pending ship (no bump/push/live-verify — ship loop
  owns those). Merge hash in the memory log.
- Rotation 2 -> 3 written at closeout, verified by read-back (see
  rotation note in the prereg + memory log for the retry count).
