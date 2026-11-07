# Journey — deepening — run r110

Lane A, leg 2 (deepening, days 40–80). Scheduled Fri 2026-11-06 16:45 CST.
Worktree `journey-deepening`, branch `journey-deepening`, base master `05ad9ff56`.
Prereg: `evidence/2026-11-06/journey-deepening-r110-prereg.md` (committed `e1b59710` before any seed ran).

## Pre-registered question

Does the merged villager bond-initiation system (`5ba7f167f`, merged 2026-11-06 19:01Z) reach the
wild — in telemetry, not just in its own panels? Primary: **V-INIT-BOND-TELEMETRY** — PRESENT iff ≥1
`bond_proposed` tele event across the panel. Secondaries: P-KEEP with the bare-"forgot" fix, RE-ASK
over all four variants, DEBRIEF-CAPTURE (every village-lost seed attributed), SURV-CONTROL-4
(descriptive). Seeds 95201–95204 (fresh band, verified), smoke 95200, DAYCAP=100, competent policy,
convo days [45, 60, 80]. Tooling: driver `scripts/journey-deepening-r110-20261106.js`, analyzer
`scripts/analyze-journey-deepening-r110-20261106.js`, proof test 33/33 green
(`scripts/test-journey-deepening-r110-pkeep-20261106.js`).

## Verdicts

- **V-INIT-BOND-TELEMETRY: PRESENT — with a split.** 110 `bond_proposed` tele events across 4 seeds,
  9 person-bond decisions, 6 accepted (67%), 6 initiated bonds at end, 0 instrument errors. The
  system fires in the wild. But the scholar-facing half is a dead letter (see below).
- **P-KEEP (revised metric): PRESENT.** NAMED 2 / 2 revisited-alive. Both are clean Quinton-class
  "I won't forget it" lines (Pedro 95202 day 60, Christian 95204 day 80). Old-rule continuity: 0
  want-only structural hits scoring SILENT. r109's bare-"forgot" false positive class is gone.
- **RE-ASK: orphans 2, both fromSeed-origin, true-no-thread 0.** Both are the variants r109's scan
  missed: variant 3 "I hate to ask twice" (Mariana 95202 day 45) and variant 4 "the need hasn't gone
  anywhere" (Jessica 95204 day 80). Both favors predate the convo days, so they are re-asks of real
  threads, not orphans.
- **DEBRIEF-CAPTURE: 2/2 attributed.** Both losses are `scatter-hunger` (pantry 0 kcal). r109's
  unattributed-loss gap is closed.
- **SURV-CONTROL-4: 2/4 survived → funnel unchanged.** Control lineage r107 2/4, r108 3/4, r109 2/4,
  r110 2/4. Losses day 45 and day 68, both hunger scatters.

## The headline: the bond system works between villagers, and dies on the way to the player

The merged system fires constantly in the wild — and the player never experiences it.

- **NPC→NPC person bonds: 9 decisions, 6 accepted (67%).** 95201: Ingrid→Marcus accepted (chance 78).
  95202: 1 accept (Pedro→Ruth, depth 2 by end), 1 refuse (Wanjiru→Onni, chance 12). 95203: 1 accept
  (day 19, depth 2), 2 refusals. 95204: 3 accepts, 3 initiated bonds — including Jessica→Tom on
  day 86 at chance 28, witnessed in the wild: *"Jessica and Tom shake on it. 'Bonded. Whatever
  comes, we face it together.'"* 6 initiated bonds stand at panel end (warmth 40–72, depth 1–2).
- **Scholar-targeted person proposals: 9 staged, 9 expired, 0 decisions.** Nine times a villager
  staged a bond proposal to the current scholar as a talk request (95201: 3× to the same scholar;
  95204: 3× to the same scholar; 95202: 1×; 95203: 2×). Every one expired unanswered after 3 days.
  The scholar never decides one — never accepts, never refuses, never even sees it in a sitting.
- **Link ideas raised to the scholar: 42 staged, 41 expired, 1 still pending at scatter, 0 accepted.**
  Villagers raise link ideas as talk requests roughly 10 times per seed; the scholar answers none
  of them. The 3 links that do exist (one per surviving seed, all to village_0, all active at end,
  trust 36–55) came from the scholar's own direct proposals, not from answering a raised idea.
- **Sitting-based V-INIT: 0 bond sittings in 20 transcripts.** Same as r109's 0/9. The telemetry and
  the sittings agree: the system fires around the player, never at the player.

In plain words: villagers now ask each other to stick together, and sometimes it takes. But when a
villager asks *you*, the ask sits in a talk request nobody opens, and dies in three days. The
player-facing half of the merged system is unreached by competent play. What this run cannot tell
is whether a real player would see those talk requests on the live build — the sim's competent
policy answers other talk requests and never answers a bond or link one. **Follow-up: a live-player
check whether bond/link talk requests surface, and whether the policy should answer them.** If the
requests do surface and the policy is the gap, the fix is policy-side; if they don't surface, the
fix is in the game.

## Village assessment (plain words)

- **95201 — starved at day 45.** 6 living at the end, pantry empty, 8 dead (4 of starvation). They
  knew 47 things, killed 22 beasts, reached wave 3, never had a regional day. Krystian and Oliver
  sought comfort while grieving; Ingrid and Marcus bonded on day 19. The village scattered hungry.
- **95202 — reached the region, then starved at day 68.** 4 living, pantry empty, 10 dead (sickness
  ×3, thirst ×3). 17 regional days, first regional day 52, one link to village_0 (trust 55).
  Pedro repaid the player's help with "I won't forget it" — and the player deflected. Pedro→Ruth
  bonded, depth 2.
- **95203 — survived to day 101, regional scale (standing 199).** 4 living, pantry 4,066. 14 dead,
  mostly in the wild. First regional day 47, 54 regional days. The survivors knew little (median
  12 plants). Denise's taken kin Pearl is still unasked-about — the player promised to ask the
  System, and the promise stands open.
- **95204 — the healthy village.** Survived to day 101, wave 4, regional scale (standing 199),
  9 living, pantry 29,278, only 3 dead. Deep knowledge (median 43 plants), 81 beasts slain, 44
  meat kills with 11 dinners. Three bonds formed. Jessica — who dreams of Columbus, Ohio, pockets
  a thing after a declined invitation, teaches plants at the hollow — bonds with Tom on day 86.

Food is the binding constraint in deepening: both losses are hunger scatters; both survivors have
food. Wave 4 reached on 3/4 seeds; w3fights 10, engagedW3 20 across the panel. Meat channel works
on survivors (haul→reveal→test→cook: 95204 44/17/16/11).

## People check (20 transcripts read in full)

Conversations are, on the whole, human. Jessica's arc across three sittings is a person, not a
menu: she dreams of a street in Columbus that keeps getting longer, pockets a thing after the
player declines to walk with her, teaches four plants at the hollow, re-asks about the pantry run
on day 80, and bonds with Tom on day 86. Tom: "I used to be a truck driver who worried about being
on time. Now I worry about being alive. Same worry, bigger font." Ruth the librarian trades
knowledge for food. Nina, day 60: "I asked Denise about your read on people here — Denise's gone"
— a villager noticing a death, unprompted. Jerop speaks only Swahili; the conversation ends where
language couldn't reach, and that is the system working as designed. The Milo-class beat lands
twice and lands well: "Right. Forget it." *They won't forget. Debts unpaid just sit there.*

Nits and blanks (all small, all documented, none fixed this run — they are dialogue-line issues,
not system breaks):

1. **"Out on the road" fires in face-to-face sittings (2×).** Ellis and Jessica, day 80, both say
   "Wait — I'm out on the road. I can't ask you to meet me at dawn when I'm miles away" — while
   sitting in conversation with the scholar. A location contradiction; the line should not fire
   when the villager is present.
2. **Christian's bond line has no decision.** Day 45: "Can I ask you something? ... I want us to
   stick together. Properly. Watch each other's backs." The conversation treats it as settled
   ("Good. That's settled, then. Onward.") without the player ever agreeing. Bond language as
   flavor, not a choice — and the same villager's staged proposal to the scholar (day 33) expired
   silently. The two halves don't connect.
3. **A Swahili-only speaker staged a bond proposal.** Jerop (visjoin_58, no shared words) proposed
   a bond to the scholar on day 74. Bond proposals don't gate on shared language.
4. **Nathan's betrayal-accept sitting never touches the want.** Day 80, betrayal accepted, then a
   string of aphorisms ("Pain shared is pain halved", "Bodies mend...") with the want stuck at
   stage 0, resolution unestablished. Fortune-cookie drift after a betrayal accept.
5. **Stray lines:** Denise (seek_taken): "It'll pass." tacked onto an ask about her taken kin Pearl.
   Irving (curious): "Could be wrong, though." dangling after a refusal to talk about the past.
6. **D-THING: the pocketed thing is never named.** Jessica pockets a thing day 45; her day-60
   sitting carries the `pocketed` want label but the thing itself is never mentioned or returned.
   The thread persists as a label, not a payoff (see metric review).

Carried: FIZZLE-FIX HOLDS (0 dry lines in 20 sittings). B-SIT: 20 transcripts, 5 betrayal
sittings (accept 3, decline 2, unanswered 0). B-FOLLOW: 2 followup sittings, 1 with a new
betrayal. B-LEAD: 1 betrayal lead-in (Jessica day 45: "Walk with me? I want another pair of eyes
on something."). RAJ-PHOTO: 0 curious-plant threads this panel. Goals lines: `bonds` 0 on all
seeds — bonds are not a goal; `bank_veterans` 1 line total (95204) — the drive's footprint in
goals lines is near-absent on the base game. G-STICK: 95204 11/11 top goals unchanged across days
45/60/80 — see metric review. Knowledge depth is seed-luck dependent (last-living median plants:
95201: 24, 95202: 40, 95203: 12, 95204: 43).

## Reachable / fun / winnable (deepening)

- **Reachable:** yes — wave 4, regional scale, village links, and villager bonds all fire in the
  wild on ordinary seeds. The one unreachable piece is the scholar-facing bond proposal.
- **Fun:** yes, in the conversations — Jessica's arc, Tom's line, the repay beat. The weak spots
  are the nits above, all line-level.
- **Winnable:** funnel unchanged (2/4). The two survivors reached regional standing 199; no full
  seat is expected in this leg. The winnability chain's binding link in deepening is food, not
  combat: both losses scattered hungry with the pantry at zero.

## Metric review (required)

- **V-INIT-BOND-TELEMETRY:** the pre-registered rule (≥1 tele event) was a floor and was satisfied
  trivially (110 events). It cannot distinguish "the system fires" from "the player experiences
  it". Proposed revision for the next run: judge the scholar-facing half separately
  (scholar-targeted decisions ≥1) alongside the fire-rate.
- **P-KEEP (revised, minus bare "forgot"):** worked. 2/2 NAMED, both Quinton-class, 0 false
  positives. Keep the revised rule.
- **RE-ASK (4 variants):** worked. Both orphans are variant 3/4 re-asks, both fromSeed-origin,
  0 true no-thread. Keep.
- **DEBRIEF-CAPTURE:** worked. 2/2 attributed (both scatter-hunger). Keep.
- **D-THING "mentioned":** too weak. Jessica's day-60 sitting scores mentioned=true via the
  `pocketed` want label, but the thing itself is never named. Proposed revision: "mentioned"
  should require the thing to be named or returned in dialogue, not just the want label persisting.
- **G-STICK:** 11/11 on 95204 labels stability as "stuck", but goals are lasting pursuits by
  design, so the label misleads. Proposed: report top-goal stability as a distribution, not a
  stuck-count.
- **SURV-CONTROL-4:** 2/4, funnel unchanged. Keep the control.

## Infrastructure

- **EPERM flap (~23:13Z):** a `cp` of the proof test was refused, leaving a 0-byte file (removed by
  hand before retrying); a `git update-ref` probe failed, then succeeded after ~100s; one heartbeat
  registry write failed, then succeeded 23:18:06Z. Per the write-flap skill: probed, removed the
  orphan, retried — no data lost. Probe ref deleted at closeout.
- **Rotation stuck at 2 — 6th sighting.** r107, r108, r109 each read 2 and wrote 2→3 with verified
  read-back; this run again read 2 (file mtime 2026-11-06T22:10:23Z, a write at 22:10Z with no
  known writer in this lane's closeout path). This run plays deepening per the file and per r109's
  handoff. Flag for the main session; not this run's question.
- **Safe-commit index clobber — again.** The prereg commit (`e1b59710`) was correct, but the
  worktree index showed all 4 files staged-as-deleted afterward. Repaired the documented way
  (`git ls-tree HEAD | git update-index --add --index-info`); verified status clean, diff empty,
  hashes match HEAD.
- **Stale-lock recovery:** a lock existed with run_id `2026-11-06T22:08:05Z` and no registry entry
  or heartbeat — previous run dead. Deleted it, created own lock run_id `2026-11-06T22:44:22Z`.
- **One-brain order (Steve 2026-11-06 17:12 CST):** noted as context; does not change this run's
  question. The bond findings here feed it: bond proposals and link raises are a second
  decision channel that never reaches the one scorer — a later-phase fold-in, per the order.
- **MEMORY.md edited mid-run by another session** (drive entries reworded; "practice moves
  competence 0 cells" dropped from the drive evidence line). Noted, not reverted.
- **Telemetry:** `telemetry-check.js` quiet (4 files, 4 metrics, no large deviations). Baseline stands.
- **Regression gate:** PENDING — `node scripts/check.js --quick` running; result to be added before closeout.
- **Heartbeat:** loop pid 21037, heartbeat fresh throughout (last verified 23:23:41Z).

## Evidence

- Per-seed JSONs + 20 transcripts: `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-11-06/journey-deepening-r110-seed9520{1,2,3,4}.json`, `journey-deepening-r110-transcript-9520*-day*.txt`
- Analysis log: `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/journey-deepening-r110-analysis.log`
- Panel log: `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/journey-deepening-r110-panel.log`
- Check log: `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/journey-deepening-r110-check.log`
- Smoke seed 95200 outputs deleted after verification (per prereg).
