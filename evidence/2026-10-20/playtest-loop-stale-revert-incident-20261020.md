# INCIDENT: conversation release shipped a stale-base revert — 5 landed fixes missing from live (2026-10-20)

**Severity:** HIGH. Silent revert of five proof-tested, landed fixes. Live on both
version.json endpoints as of 2026-10-20 15:13 CDT.
**Detected by:** oversight-playtest-loop (lane A) pre-flight, run_id 2026-10-20T20:15:00Z.
`git pull` failed with "divergent branches"; investigation below is read-only forensics.

## Timeline (CDT)
- 10:50–11:33 — conversation release commits authored (3329c74bf, dedc46db7,
  347cce498): "Repair conversation intent, offered replies and speech boundaries",
  "Connect favor requests to real actions and explicit blockers",
  "Prepare versioned conversation release and Muse calibration handoff".
- 12:24 — ship loop bumps b9441dd46-20261020-172432, pushes (origin fast-forward).
- 12:45 — establishment r20 closeout lands 78a0fe390 (preserver signal + racks voice gate).
- ~14:45 — sim-contestgrant lands 9ff3cdbd4 (backlog #698, noteGearHandled).
- Earlier today — sim-killbeat 5898e0238 and journey-social r34 1779fca45 landed.
- 14:42 — version bump 347cce498-20261020-194257 (on the release line).
- 14:59 — a86496f72 "Reconcile Muse and Codex conversation release on shared
  history [needs-eyes]" pushed to origin/master. **Built on a base predating the
  r20/contestgrant/killbeat/join-request landings — their game.js/contests.js/
  party-formal.js changes are absent from the release tree.**
- 15:13 — this run's pre-flight finds local master (7d3560680) diverged from
  origin/master (a86496f72). Both version.json endpoints serve
  347cce498-20261020-194257 → **the revert is live**.

## The five reverted fixes (present in local master 7d3560680, absent in live a86496f72)
1. **r20 preserver competence signal** — commit 78a0fe390. `src/js/game.js:6143`:
   `else { try { if (this.specialistSkill && this.specialistSkill(vp, 'preserver') >= 2) mult = 1.3; } catch (e) {} }`
   Effect live: fishermen/smokers show no ⭐ on cook duty; the M2 blank
   (division of knowledge invisible at assignment) is back.
2. **r20 racks-full voice gate** — commit 78a0fe390. `src/js/game.js:6984-6990`
   (`_racksFullVoice` per-cook-day gate). Live has the old ungated line back:
   the identical "racks are already full" line can fire 3x per cook-day again.
3. **sim-contestgrant noteGearHandled** — commit 9ff3cdbd4 (backlog #698).
   `src/js/contests.js:4392`. Live: contest-granted weapons no longer teach
   recipe L1 (breaks Steve's 2026-10-09 gear-discovery canon ruling).
4. **sim-killbeat final-blow attribution** — commit 5898e0238.
   `src/js/party-formal.js:619` (`partyVictoryBeat(monstersDown, deadFighters)`).
   Live: the beat again names every party member for any fight ("Tariq, Aurora
   brought down The Understudy. Together.") — killbeat fiction unusable as
   evidence for who killed what.
5. **journey-social r34 join-request honesty** — commit 1779fca45.
   `src/js/game.js:19330`. Live: overheard invites store the generic
   'wants you to join' instead of the spoken invitation verbatim.

Verification method (reproducible): for each item,
`git show a86496f72:src/js/<file> | grep -c "<marker>"` returns 0 while
`git show 7d3560680:src/js/<file> | grep -c "<marker>"` returns ≥1.
Markers: "establishment r20" (game.js), "backlog #698" (contests.js),
"KILLBEAT ATTRIBUTION" (party-formal.js), "JOIN-REQUEST HONESTY" (game.js).

## Why accidental, not intentional
The removed blocks carry explicit comments naming their purpose, dates, and
backlog numbers; the release restored the old lines verbatim without replacement
logic. The release's own changes (conversation.js +271/-~,
convo-{beats,dialogue,wants}.js, villager-agency.js, voice-piper.js speech
boundaries, carexplore.js favor wiring) are orthogonal to all five fixes.

## Recommended recovery (ship loop / main agent — NOT this loop; no push authority here)
1. In the main tree: `git merge origin/master` (plain 3-way merge — **never
   rebase, never reset --hard, never force-push**; rebase/force would orphan
   one side). Merge-base is 699c56ba8; the five fix regions are additions in
   local vs untouched-in-origin, so a 3-way merge keeps both sides' work.
2. Post-merge, verify all five markers present
   (`grep -c` per the method above; expect ≥1 each).
3. Re-run the five proof tests (scripts/test-establishment-r20-fixes-*.js,
   test-contestgrant fixture, killbeat proof, test-join-request-line-20261020.js).
4. Normal ship: bump, push master + main, verify BOTH version.json endpoints.
5. Note: local master also holds ~15 instrument/evidence-only loop commits
   (sim-readiness-audit, sim-wintrack-audit, journey-deepening r25, etc.) that
   are not live either — the merge carries those too.

## What this run did and did not do
- Did NOT play the landing leg. No unified base exists: local master has the
  fixes but predates the 475-line conversation release; origin has the release
  but not the fixes. The leg's core (conversation sense-reads, V4' people check)
  would test superseded code on either base — findings would be stale by
  construction.
- Did NOT land game-code changes (would compound the divergence).
- Rotation file left at 0 (landing still up next); lock created and deleted.
- This report is the run's evidence (evidence-only commit, merges cleanly).

## Metric review (§14)
Run aborted pre-registration (no leg played, no metrics bound). No metric
re-scored. The incident above is the run's finding.
