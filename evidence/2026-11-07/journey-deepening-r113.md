# journey-deepening r113 — the scholar-facing half of bonds (2026-11-07)

Leg 2 DEEPENING (days 40–80). Run r113, Lane A, run id `laneA-20261107T0845Z`.
Branch `journey-deepening`, base master `f043aa772`. Seeds 95601–95604 (smoke 95600),
fresh by the full-scope check (all dated preregs + evidence + forbidden lists, 0 hits).
Policy competent, DAYCAP=100, CONVO_DAYS [45, 60, 80]. Rotation 2→3.

## Questions (preregistered)

**Q1 (PRIMARY) — Scholar-facing bond/link requests: policy gap or game gap?**
r110 proved the merged bond system fires villager-to-villager (110 tele events,
9 decisions, 6 accepted) but the scholar-facing half was a dead letter: 9 staged
bond proposals to the scholar → 9 expired, 0 decisions; 42 link ideas → 41 expired,
1 pending, 0 accepted; 0 bond sittings in 20 transcripts. The game side is wired
(staging writes `talkRequests`, the talk-request opener is priority #1, the menu
prepends `bond:`/`link:` choices while a proposal is pending) — but the sim never
sits the request-holder (neither the policy's daily talk nor the driver's sittings
look at `talkRequests`) and the driver's picker never takes a `bond:`/`link:` choice.
Verdict, checked in order: REACHED (≥1 scholar-targeted decision) → POLICY-GAP
(≥1 expired request whose talkable holder was never talked to while live) →
GAME-GAP (0 staged, or every expired holder untalkable for the whole window).

**Q2 — "Out on the road" spoken face-to-face (r110 nit #1, game-code fix).**
r110 transcripts showed it twice: an away-flagged villager in a LIVE sitting
refusing a dawn-meet commit with "Wait — I'm out on the road… miles away" —
spoken to the scholar sitting across from them. The `away` flag means away from
Haven, not absent from the scholar. Fix (src/js/convo-wants.js, proof 9/9):
(a) the commit-site refusal KEEPS refusing (the dawn meet still can't be promised
while out) but the words are now true face-to-face: "Wait — I'm away from Haven,
out on the road. I can't promise a dawn meet while I'm out — find me when I'm
back, and we'll set it then." (b) the action-site away block is skipped while
the villager is in an active conversation with the scholar (presence read from
the conv map); outside a sitting (the journal path) the block still fires.

## Before-panel (driver before the Q1 fix; game code with the Q2 fix)

4 seeds, all survived: 95601 d101 wave 5 pop 8; 95602 d100 wave 4 pop 9;
95603 d101 wave 4 pop 5; 95604 d100 wave 4 pop 9. 29 transcripts.

- **Q1: POLICY-GAP.** staged=84 (11 bond + 73 link), decided=0, expired=84,
  expiredTalkableUntalked=57, expiredUntalkable=0. All four seeds POLICY-GAP.
  Of the 84, 57 holders were never talked to while live; the other 27 were
  talked to but only by the daily walk-out talk (the ask is delivered, never
  answered). **BOND-CHOICE: 0 sittings ever offered a bond/link choice** — the
  target gap dominates; the choice gap can't fire because no sitting reaches
  a request-holder.
- Q2: AWAY-LINE oldLine=0, newLine=2 — the new line fires in sittings, the old
  line is gone.
- BOND-TELEMETRY: tele=184, proposals=16, decisions=16, accepts=9 (56%),
  linkRaises=4, initiatedBonds=9 — the system reaches the wild.
- Secondaries: P-KEEP PRESENT 2/5; RE-ASK orphans 1 (fromSeed); FIZZLE HOLDS
  (0 dry); S-TRACE 4/4 EXPLAINED; DEBRIEF 0 losses; D-THING 2 pocketed,
  0 testable; B-SIT 6 sittings (4 accept / 2 decline / 0 unanswered).

## Q1 driver fix (conditional on POLICY-GAP — built, proof 18/18)

Driver-only, zero src/js. (1) The daily wrapper answers a live bond/link
request FIRST with a real sitting played in full, before the policy runs its
day — at most one request-sitting per day, each staged request attempted once.
(2) `pickChoice` takes `bond:`/`link:` at ENGAGE priority (after betrayal,
before generic engage), accept/decline alternating by sitting index, bond
before link — the betrayal pattern, measuring that BOTH paths work.
(3) Convo-day sitting order puts live request-holders first (backstop).
Proof: `scripts/test-journey-deepening-r113-q1fix-20261107.js`, 18/18
(selection, live-window edges, alternation, betrayal-outranks-bond, fallback).

## After-panel (same seeds, same game code, Q1 driver fix)

- **Q1: REACHED.** staged=45, decided=39, expired=6. All four seeds REACHED
  individually (10/12, 6/6, 15/17, 8/10). **BOND-CHOICE: 38 sittings offered
  a bond/link choice, 38 answered, 0 unanswered.**
- The 6 expired: 3 talked-while-live (day-granular join — a talk that day
  doesn't prove the talk saw the request; staging can land after the
  policy's talk), 3 never talked to (one-request-per-day cap + talkability
  on the live days). The fix answers 39/45 (87%).
- Q2: AWAY-LINE oldLine=0, newLine=10.
- BOND-TELEMETRY: tele=104, proposals=53, decisions=14, accepts=7 (50%),
  linkRaises=13, initiatedBonds=14. (Proposal counts rise because answered
  asks raise trust/warmth, which stages more proposals.)
- Secondaries: P-KEEP PRESENT 7/15; RE-ASK orphans 8 (7 fromSeed, 1
  true-no-thread: Quinn day 75, "creek water run"); FIZZLE HOLDS;
  S-TRACE 4/4 EXPLAINED; DEBRIEF 2/2 attributed; D-THING 8 pocketed,
  4 testable, **0 named** (revised-metric miss, see metric review);
  B-SIT 21 sittings (12 accept / 9 decline / 0 unanswered); V-INIT
  bondSittings=1 (first ever); B-LEAD 6.
- G-SENSE: all 79 transcripts read in full; **0 senseless sittings**.

## The survival cost (flagged, not a verdict)

The fix answers the asks — and the same seeds lose 2 villages that survived
before: before 4/4 survived, after 2/4 (95602 scattered from hunger day 60;
95603 scholar died day 93 with no successor, pop 0). SURV-CONTROL-4's rule
says ≥2/4 survive → funnel unchanged, so this is not a rule breach — but
the direction is down and the mechanism is visible, not just numbers:
request sittings cost day-parts, and in 95602 the scholar was in bond
sittings while Wei begged for food from day 6 to day 40. Four seeds is
small; this is a flag for the next run, not a verdict. And the fix is
driver-only (the sim's competent player) — the game itself is unchanged.
Whether a real player should answer every ask is a design question, not
something this run decides.

## Village assessment (plain words)

- **95601 — survived to day 101, 6 left, wave 5 reached.** Bill the withdrawn
  line cook became the village's hinge (trust 26→90); Grace the warm teacher
  declined a bond on day 27 ("Not like that. Not yet.") and accepted one on
  day 44 — the same person changing her mind over six weeks. Quinn the
  bartender bonded at 95 trust. The village thinned late (four died in the
  wild, days 93–99) but held.
- **95602 — scattered day 60 from hunger, 4 left.** Wei the beekeeper begged
  for food from day 6 to day 40 ("My hands shake when I try to work") while
  the scholar's mornings went to bond sittings; the pantry never recovered.
  Thirst day 59, starvation day 60. The hunger was visible in every sitting
  for fifty days — the scatter was earned, not a surprise. Regina saw it
  coming: "The stores. Have you looked at the stores? We're running thin."
- **95603 — died day 93 when the scholar died with no successor, 0 left.**
  Pavel the dry bush pilot carried the village's humor ("Do try to stay
  alive. The paperwork otherwise is murder."); Ewura the dentist kept
  dreaming of the pods; Teresa counted days so someone would. A village of
  strong voices with nobody to inherit it. The whole remaining village died
  the same day the scholar did.
- **95604 — survived to day 100, 8 left.** Miguel the intense dockworker,
  Tashi the steady arborist (bonded day 80), Emma the Spanish-only tailor
  whom nobody could understand but everyone trusted (trust 100). The gossip
  network worked: the creek-water rumor, the grey-meat story, the Echo win —
  the village talked about itself.

**All-tracks read:** goal tops across the panel are party_up (dominant),
safety, build_standing, food_security. No craft or strange tops — the drive
leans party/safety/standing/food; craft and strange never top anyone's goals
in this leg.

**Reachable / fun / winnable:** reachable — every piece of content in the
leg fired (bonds, links, betrayals, seek-taken, gossip, language barriers).
Fun — the villages read like people: grief woven into food asks, a pilot's
dry humor, a dentist dreaming of pods, a village gossiping about the scholar.
Winnable — no full win in this leg (deepening isn't the win leg); 2/4
survived to day 100 with wave 4–5 reached, but the survival cost above is
the honest caveat.

## What the transcripts showed (sense notes)

- Bond/link decisions read naturally both ways: accept — "Stick together,
  then." / decline — "Right — another time." The alternation produces both
  paths in the wild.
- The new away line fires 10×, all in sittings, all true ("I'm away from
  Haven, out on the road… find me when I'm back"). The old "miles away" line
  never appears.
- The goon-loop replays the talk-request opener verbatim after a decision
  (~8 sittings: Grace day 27, Ewura day 34, Maya day 44, Miguel day 79,
  Tashi day 80…). The NPC returns to their ask after it's decided — mildly
  robotic; the line is their ask, so it reads as returning to the point, but
  it should move on. Carried as a wrinkle, not fixed this run.
- D-THING: "A small thing, pocketed." fires 8× and is never named later
  (0/4 testable). The pocketed thing stays a mystery the game never pays off.
- Language nit (r110 #2) now live: Chantal (French-only) had a bond accepted
  day 75; Emma (Spanish-only) had a link accepted day 27 and declined days
  6/24/62 — decisions without shared words. The Q1 fix's comm check doesn't
  gate these (their comm level isn't 'none'). Game-side fix needed: gate
  bond/link choices on shared language.
- Wei day 40 (95602): betrayal accepted, then "Maybe not today. The fire's
  got me." — the NPC agrees, then can't follow through (too weak/hungry).
  Human, but the accept-then-refuse is worth a look.
- Manuel day 45 (95602): eight turns of self-narration ("I need to prove
  myself") with no resolution — a monologue, not a conversation. The
  dlg:more loop, known pattern.

## Metric review

- **Analyzer bug, fixed mid-run:** the `lastSeenStaged` corroboration scanned
  unbounded, so a day-12 request read lastSeenStaged=95 from a day-92
  re-staging by the same villager. Fixed (matched on the staging's own
  identity, bounded to the live window) + proof case 8. Verdict counts were
  never affected (corroboration-only field). Analyzer proof now 29/29.
- **After-panel overwrote the before-panel files:** the after-panel writes
  the same seed-JSON and transcript filenames, so the before record survives
  only in `deepening-r113-before-analysis.txt`. Next run: write after-panel
  outputs to a separate directory (or suffix the filenames).
- **D-THING revised metric works, the game misses:** 4 testable cases, 0
  named. The metric is now measurable; the behavior is the miss.
- **Q1 "talkedWhileLive" is day-granular:** a talk on the staged day doesn't
  prove the talk saw the request (staging can land after the policy's talk).
  The 3 talked-but-expired cases are consistent with that.
- **Analyzer back-compat:** the r110 corpus re-analyzed with the fixed
  analyzer reproduces r110 exactly (staged=51: 9 bond + 42 link; expired=50;
  POLICY-GAP on all 4 seeds and the panel). Two bugs found and fixed by that
  check (pair-dedup collapsing repeat stagings; end-roster talkability
  mislabeling holders who died later).

## Infrastructure notes

- Registry heartbeat went stale ~25 min mid-run (sibling reaper held
  REGISTRY.lock via flock while doing slow git status calls); queued
  heartbeats landed when it released. Decision: do NOT bypass the flock.
- safe-commit index clobber struck 3× this run (commits d37337ae2,
  756f56309, c3799ca46 all correct; the main index showed committed files
  as staged-deleted after each). Repaired each time with the HEAD-blob
  `git update-index --add --index-info` recipe, verified status clean +
  diff HEAD empty. Third sighting in this worktree this week — the pattern
  (clobber after every safe-commit) is worth a look by whoever owns the script.
- First check.js --quick run's result was lost (background session ended
  without delivering output); re-ran with output to a file.

## Telemetry

`telemetry-check.js` quiet on the baseline metrics (w3fights, engaged.w3,
fightsTotal, fightsByWave.3) and on survived/wave/pop/bondTele/bondProp.
No LOUD lines; baseline not rolled forward.

## Regression

`check.js --quick` on the rebased tip: **276 passed, 14 failed in 1779s**
(log `evidence/2026-11-07/journey-deepening-r113-checkquick.log`). All 14
adjudicated pre-existing or load: the 6 standing families from r106
(measurement proof-update + workflow freshness ×2 scripts;
mobile-combat-cadence "Continue does not wrap the announced round a second
time"; occupation-panels "real CLI workflow completed"; phone-frame-proof
stale receipt ×3 assertions; establishment-r20-fixes voice-gate "next day
voices once more: expected 2, got 1") + measurement-cache-flags
(flaky/load, 93.3s) + 6 load timeouts at 120.2–120.3s
(solo-campaign-endings, time-save-crashes, time-save-failures, synergy-stall,
throttlefeast, capable-bot) + trust-observer-neutrality (load error at
line 16, same script timed out in r106). Three of the timeouts are new vs
r106's 12 (time-save-crashes, time-save-failures, throttlefeast); table-endings
passed this time. Two `check.js --quick` gates shared the box (the
finishersize gate started 1 min before this one), which is the load
explanation. No failure touches conversation / convo-wants / betrayal /
hierarchy / scale code or the r113 tooling (no r113 string anywhere in the
log). This run changed one src/js file (convo-wants.js, Q2 wording +
presence gate); none of the 14 can be caused by it — the failing scripts
are measurement, mobile-cadence, phone-frame, cache-flag, and timeout
families, all pre-existing on the base.

**Closeout (recovery, Lane A run laneA-20261107T1045Z):** the r113
coordinator timed out before closeout (lock laneA-20261107T0845Z, heartbeat
09:52:09Z stale, no live process; main session confirmed dead). Recovered:
rebased onto master 2cf4d19f (explicit SHA; base moved twice under the
branch), proof tests re-run green 18/18 + 9/9 + 29/29 on the final tip,
gate re-run on the rebased tip (above), note + gate log committed here,
merged ff-only. Rotation already 3 (written by r113).

## Carried (not fixed this run)

- r110 nit #2 (language-gated bond/link): now live, see above.
- r110 nit #3 (Nathan's betrayal-accept fortune-cookie drift): not observed
  this run (no Nathan sitting).
- r110 nit #4 (stray lines — Denise "It'll pass.", Irving "Could be wrong,
  though."): not observed this run.
- r110 nit #5 (D-THING pocketed thing never named): confirmed again, 0/4.
- r110 nit #6 (Christian's bond line with no decision): not observed.
- The goon-loop opener replay and the Wei accept-then-refuse are new
  wrinkles for the next run.

## Commits (worktree branch `journey-deepening`)

- d28460404 — prereg + driver (Q1 request-telemetry instrument, seeds
  95601–95604 fresh)
- 03d3ca655 — Q2 away-line fix + r113 analyzer + proof tests 9/9 + 27/27
  (analyzer proof later 29/29 after the corroboration fix)
- d2896465b — Q1 driver fix (proof 18/18) + analyzer lastSeenStaged fix

Merged locally, pending ship. No version tag; the ship loop owns that.
