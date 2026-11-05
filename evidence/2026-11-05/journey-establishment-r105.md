# Journey leg ESTABLISHMENT — r105 run note (2026-11-05, Lane A)

## Prereg
`evidence/2026-11-05/journey-establishment-r105-prereg.md` (+ addendum
`...-prereg-addendum.md`, committed a461c7fc7 BEFORE scoring seeds
1502–1504; driver + analyzer + proof committed 9757c1ef2 BEFORE any
scored seed). Driver
`scripts/journey-establishment-r105-20261105.js` (r104 driver clone +
five duty-use wraps), analyzer
`scripts/analyze-journey-establishment-r105-20261105.py`. Seeds 1501–1504
(IDENTICAL to r102/r103/r104), competent policy, 42-iteration horizon,
death-aware tail (never hit — 1501 ended by `village_lost`, not by the
tail). Base: master fc8390511 at branch time.

## Leg question
r104 proved diplomat held by 9 villagers and herbal_medicine by 3, firing
0 rows. This run built the duty/craft instrument r104 named and asked: of
the duty/craft/social holdings — diplomat, herbal_medicine/herbal_remedy,
field_dressing, preserve_food, wound_care/triage — which are ever USED by
villagers in-window, which are held-but-unused, and which are structurally
unread for villagers at all?

## Static read-site census (prereg; proved behaviorally by the proof test)
- diplomat: ZERO villager-aware read sites (all reads are the player
  bearer's `abilityLevel('diplomat')`; no action; no incident trigger).
- herbal_medicine/herbal_remedy: ZERO villager-aware read sites
  (treatDisease/treatVillager player-only; care gates on OCCUPATION).
- wound_care → triage: ONE villager-aware read (villagerCareTick reach 2).
- field_dressing: ONE villager-aware read (villagerHuntResolve 0.60→0.78).
- preserve_food: ZERO villager-aware read sites (cook duty uses
  specialistSkill = occupation + foodXp only).
- wound_care (skill): only a player-side read.

## Instrument (what was built)
- Five read-only driver-side wraps (original called once, log after, no
  RNG draws — the r104 armor-wrap pattern): villagerHuntResolve,
  villagerCareTick, healerRounds, villagerTreatTick, resolveOneAssignment
  (cook branch). Plus the r104 holdings census, unchanged.
- Proof test `scripts/test-journey-establishment-r105-dutyuse.js`:
  **27/27 PASS** (seeds 7, 42, 99 + 1–5 as needed). P1: holder kill pays
  1.300x (660→858 kcal, muskrat, seed 1). P2a: specialistSkill unchanged
  by learned preserve_food (0→0). P2b: baseline medic tends 1, triage
  medic tends 2, herbal-holding non-medic adds 0. P3: NPC-held diplomat
  leaves player level 0 and an identical convo moves trust 20→21 both
  ways. P4: all wrap reads change no state — with one catch found and
  fixed in the test: `sickDiseases()` is NOT pure (seList() lazy-inits
  `scholar.statuses`), so the driver reads raw statuses instead.

## Panel verdict (BINDING metrics, unfixed code)
- M0 INSTRUMENT-NEUTRALITY: **PASS 4/4 vs the same-base control.**
  The prereg's M0 reference (the r104 panel) was stale — 63 commits
  landed between r104's base (6b516a7ea) and this base (fc8390511),
  including r104's own patient_aim fix. The r104 DRIVER (unmodified)
  was re-run on fc8390511 as the control (files in goal hidden_files
  `evidence-2026-11-05-control-r104/`); r105 reproduces the control
  EXACTLY on all four seeds (endDay/aliveEnd/pantryKcalEnd + lesson
  sets identical; seed 1501 byte-identical on daily, deaths, skillRows,
  teleTypes, census, holdingsEnd, contestCounts, matTrace, all 623
  teleAll rows). The stale-panel comparison is printed for the record
  (FAIL on all four seeds — expected, record only).
- M1 USE CLASSIFICATION: **MIXED (DUTY-DEAD + HOLDINGS-DECORATIVE).**
  - diplomat: HELD-UNUSED, INERT — 9 holders, 0 uses.
  - herbal_remedy: HELD-UNUSED, INERT — 5 holders, 0 uses.
  - field_dressing: HELD-UNUSED, villager-aware — 6 holders, 0 uses.
    The mechanism works (P1: 1.300x) but the opportunity never arises:
    **villagerHuntResolve was NEVER called on any seed (hunt calls 0,
    kills 0)** — the competent policy never assigns the 'hunt' task
    (it assigns water, wood, garden, deadfall, fish, cook — no hunt).
    The duty exists, the ability works, nobody is ever sent to hunt.
  - preserve_food: HELD-UNUSED, INERT — 7 holders, 0 uses. In the wild:
    David the plumber (1503, spec 0) worked the racks twice holding it —
    day 37 preserved 560 kcal at the blind rate ("keeps a couple of
    weeks"); day 39 racks full. Hamza/Linda (spec 2, occupation
    preservers) ran at the specialist rate from occupation, not holding.
  - wound_care: HELD-UNUSED, INERT — 4 holders, 0 uses.
  - triage: **USED (1 use)** — Regina the nurse (1501, day 23), sole
    medic, holding triage, tended Hassan 4→2 daysLeft = 2 tends in one
    tick (reach 2 firing exactly as designed). Holders=4.
- M2 CARE-VISIBILITY: careTicks 152, tends 49, medics seen 10 distinct.
  healerRounds 17 — caregivers Regina, Chen, Maureen (all
  occupation-medics who ALSO hold herbal_remedy + triage). The rounds do
  NOT read the holdings: Regina healed Ava 1→16 HP on day 23 holding
  NEITHER, then Hassan 28→43 HP on day 24 holding both — the round
  happens by occupation either way. villagerTreatTick changed the
  player's sickness once: Maureen eased the player's disease on day 14,
  seed 1502 (`easedUntil` set). Cook/racks: 193 cook-duty calls, 43 rack
  events, 7 at specialist skill, 9 holder-cook calls, 2 holder-blind;
  keeps "for weeks" 4 vs "a couple of weeks" 34 — the racks run blind
  most of the time.
- M3 SURVIVAL-42: **3/4.** 1502/1503/1504 alive at 42; 1501 ended day 24
  (`village_lost`, pantry 0, 8 alive — the nightly meal ate the last 980
  kcal and the village was lost; no starvation death records, the loss
  ends the run first).
- M4 PANTRY-GUARDRAIL: **4/4 by the pre-registered keywords** — but see
  the correction below: one thirst death (Aubrey, the PLAYER, day 8,
  seed 1502, cause 'dehydration') is NOT caught by the keywords
  ('starvat'/'hunger'/'thirst'). Honest count: 1 thirst death in-panel.
- M5 PEOPLE: **PASS 6/6** (1501 skipped — game over, correct per the
  r81 fix). See below.

## The blank filled — and the one left open
FILLED: the duty/craft half now has actor-attributed use. Triage is the
only one of the six that ever fires for villagers (Regina, day 23) — and
only because she is a nurse who happens to hold it. The other five are
held and never used, for two different reasons the run separates cleanly:
(1) STRUCTURALLY-INERT — diplomat, herbal_remedy, preserve_food,
wound_care have no villager-aware read site at all, so no villager can
ever use them however often they are held; (2) OPPORTUNITY — field_dressing
works and is held by 6, but the hunt duty is never staffed, so it can
never fire. The care system runs on OCCUPATION, not on knowledge: a
villager who LEARNS herbal_medicine is never a tender or healer unless
their old job already made them one. That is the design fact to put to
Steve: knowledge earned in play does not change who can doctor, dress
game, or work the racks — only the starting occupation does.
LEFT OPEN (the next run's question, not a fix in this run): staffing
hunts. The competent policy never assigns 'hunt'. Whether staffing hunts
(a policy change — a new `competent-hunt` variant, preregistered,
before/after on identical seeds) changes the establishment funnel is the
r106 question. It was NOT changed here: a policy change is a lever with
food-economy consequences, not a drive-by fix, and M1 was pre-registered
against the unstaffed policy.

## Village assessment, in plain words
Four villages started with 12 people each. Three are still standing at
day 42–44; one is lost. 1501 is the lost one (village_lost day 24, pantry
0 — the only seed where the pantry never recovered; 8 alive at the end,
15 death records, mostly fights). 1502 is the hard one (wave 3, pantry
20.6k, 9 alive, 43 death records — 15 villager-combat + 15 combat + 10
expedition; the player Aubrey died of dehydration on day 8 and the
village carried on under a successor). 1503 is the lean one (wave 3,
pantry 5.2k, 8 alive, the most lessons at 23). 1504 is the steady one
(wave 3, pantry 51.2k, 6 alive, 4 contests all ended). Living villagers
end holding the same spread r104 found (every living villager holds ≥1
granted ability; the duty/craft six are held by 4–9 villagers each) —
and, the new census, almost none of those holdings ever do anything.
Nobody on any final roster is dead; the 119 death records are
fight/expedition/wound/sickness records. Two villages changed bearers
mid-run by succession without scattering (1501's Fernando died day 9 of
sickness; 1502's Aubrey died day 8 of dehydration).

## Contests (r101 metric-review rule applied)
Fired/ended per seed (control = r105, identical): 3/1, 2/2, 4/2, 4/4.
Under the corrected rule (exclude fired within 2 days of run end):
1501's whoate (fired day 24, endDay 24) is excluded — ZERO stuck
contests on any seed. No seed fired zero contests.

## People check (M5), in plain words
Six held conversations read as people with business (1501 skipped):
- 1502 Maureen (veterinarian): a pantry-run ask she is still pressing,
  commits the player to a dawn expedition ("east treeline, before the dew
  dries"), teaches Asian Persimmon and Wild Garlic, gossips about Ivy,
  deflects about Yara ("Someone should talk to Yara. Not me, though.").
- 1502 Chen (pharmacist): fighting sickness, deflects, gossips, then the
  goon pick escalates to an outing ("Come get air with me. I need to
  think out loud.") and the driver accepted a betrayal walk to the ridge.
- 1503 Willie (locksmith): wants to be remembered — "I don't need a
  statue. I need one good story that outlives me." — a legacy thread,
  coherent and wry ("I used to be a locksmith who worried about being on
  time. Now I worry about being alive. Same worry, bigger font.").
- 1503 Elie (bartender): pantry-run ask with an honest road constraint
  ("I'm out on the road... Find me when I'm back"), gossips that Willie
  set out on a long trek and Diana is back.
- 1504 Pavel (bush pilot): a wound needing a second pair of hands, a
  Haven-door condition, teaches Maracujá and Chickweed, naming-debate
  gossip ("Carlos is pushing 'Big-Eyes'").
- 1504 Myroslav (night security guard): emotional honesty ("Most people
  perform. I'm tired of performances."), a haul request, taught
  Spicebush, shares a cellar full of jars ("I'll show you on the map
  sometime. It's real.").
Flat notes, stated not hidden: repeated "goon" picks return templated
mood lines ("Something eases in their shoulders") — readable as mood, not
nonsense. Driver hygiene (not a game bug, same as r102/r103/r104): the
people-check driver picked a betrayal:accept verdict on 3 of 6 convos
(Chen, Pavel, Myroslav) while sampling; held-convo drivers should avoid
story verdicts. Also: several medics in the care logs show as stranger
descriptors ("A person, maybe 40s, with a crooked nose") — the
displayName knowledge gate working as designed ("if you don't know, it
doesn't show"), not a bug, but it makes the care-actor lists noisy.

## Telemetry deviation check (step 14)
Baseline: `telemetry-baselines/establishment.json` (r40 re-seed).
Command: `node scripts/telemetry-check.js --baseline
.../telemetry-baselines/establishment.json --current
'evidence/2026-11-05/journey-establishment-r105-seed*.json' --metrics
guardrails.deaths,guardrails.popAlive,guardrails.pantryKcal,c3.starvationDeaths`
- LOUD: `guardrails.deaths` 41 -> 119 (+190%).
- Quiet: popAlive, pantryKcal, starvationDeaths.
- Verdict: same class as r85/r86/r99/r101/r102/r103/r104, now an eighth
  consecutive panel — and the number is the same KIND of artifact:
  rosterDead is [] on all four seeds and villager-combat / expedition /
  wound / sickness rows dominate every seed's death list, so most death
  records are fight records, not village deaths. The baseline counts a
  different death regime (r40-era). **Baseline NOT rolled forward** in
  this run; the roll needs its own regime note (per the baselines
  NOTES.md) and is not done silently here.

## Metric review (for the NEXT run, not this one)
- M0 re-baselining is now a standing rule: whenever master has moved
  since the last panel, M0 is judged against a same-base control run of
  the previous driver — a panel-to-panel comparison across a moved base
  is not an instrument check. (This run's addendum is the first use.)
- M4's keyword set misses 'dehydration': the one thirst death in-panel
  (Aubrey, player, day 8, 1502) was not counted. Next run's M4 keywords:
  add 'dehydrat' (and check 'thirst' already covers 'thirsty').
- The next question after duty-use is HUNT STAFFING: preregister a
  `competent-hunt` policy variant (assign 'hunt' to a hunter-competent
  villager when idle) and ask whether staffing hunts changes the
  establishment funnel (pantry, survival, field_dressing fires) on
  identical seeds 1501–1504. Do NOT fold it into a holdings run — it is
  a policy lever, and its before/after is the measurement.
- The triage use is 1/152 care ticks. Whether triage's reach-2 matters
  at scale (more medics holding it, more sick) is a follow-up, not a
  claim from one firing.
- Still standing, unchanged: scholar-day labels skip/repeat (all ordering
  uses telemetry sequence index); census `equipped` first-row duplication
  (r99); player codex start snapshot is missing (end snapshot only);
  armor lessons are not skill_lesson rows and armor-craft attempts are
  near-zero in-window (craftLog 0/0/2/0 this panel).
- `ability_used` double-emission (pre-existing, not introduced here):
  a composite `activateAbility('purify.cleanse')` emits TWO rows. The
  analyzer counts first evidence only, so rates are unaffected.
- The diplomat "incident" half: no trigger found in src/js. If a later
  run finds an incident offer, it corrects this prereg — until then the
  incident is treated as unimplemented, and the trust-2x half is
  player-only by code.

## Reachable / fun / winnable (establishment)
- Reachable: MIXED — triage is reachable and fires (Regina, day 23);
  field_dressing is reachable as a holding but unreachable as a use
  (no hunts are ever staffed); diplomat, herbal_remedy, preserve_food,
  wound_care are held and structurally unreachable as villager tools.
- Fun: FLAT on this axis — the care system works (tends, rounds,
  easings all fire with named actors and honest narration), but the
  holdings the game grants villagers for these jobs do not change what
  anyone can do. A player who teaches a villager herbal medicine and
  then watches a stranger-nurse do all the tending will feel the gap.
- Winnable: PARTIAL, same shape as r101/r102/r103/r104 — survival, wave
  progression (to wave 3 on three seeds), contests, and teaching all work
  in-window; no scatter except 1501's village_lost. The establishment
  risk this panel is food, not fights: 1501 lost with a fat roster and
  an empty pantry, and no NPC hunt duty fired on any seed to refill one.

## Infrastructure notes
- Registration was slow (~4 min) under REGISTRY.lock flock contention;
  the register script itself was healthy, just queued. Heartbeat loop
  held throughout (600s loop, log:
  goal hidden_files/journey-establishment-r105-heartbeat.log).
- safe-commit index clobber hit BOTH commits this run (prereg commit:
  4 files staged-as-deleted; addendum commit: 1 file staged-as-deleted
  + 1 stale index blob); repaired with `git update-index --cacheinfo`
  from HEAD blobs, verified clean `git status` + empty `git diff HEAD`
  and correct `git show --stat` each time.
- check.js --quick: **284 passed, 6 failed in 468s** — identical to the
  standing r106/r107 set, no new failures. The 6:
  test-measurement-proof-update, test-measurement-workflow,
  test-occupation-panels (the "retained neutrality proof covers the
  current inputs" family — the proof is stale on master itself),
  test-mobile-combat-cadence (same 2 sub-failures as r104),
  test-phone-frame-proof and test-establishment-r20-fixes (the two known
  baseline failures from r103). This run changed NO src/js (only new
  scripts/ + evidence/), so none of the 6 can be caused by it; r104's
  timeout flakes (trust-observer-neutrality, capable-bot) passed clean
  this time with no sibling suite running concurrently. Targeted proofs
  on the touched areas: duty-use 27/27.
- No EPERM flap this run.
- Rotation advanced 1 -> 2 (deepening next) — verified by read-back at
  closeout.

## Closeout (filled after the check gate)
- check.js --quick: 284 passed, 6 failed in 468s (standing set, no new
  failures — see above).
- Merged locally, pending ship (no bump/push/live-verify — ship loop
  owns those). Merge hash in the memory log.
