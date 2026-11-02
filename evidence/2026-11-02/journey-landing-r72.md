# Journey landing r72 — Lane A leg 0, days 1–14 + death-aware tail

Run: oversight-playtest-loop, Lane A only. Seeds 701–704 (fresh).
Driver: `scripts/journey-landing-r72-20261102.js` (clone of the r71 driver
plus the OUTING_PROBE and an `outing72` census field).
Preregistration: `evidence/2026-11-02/journey-landing-r72-prereg.md`
(this note's header carries the prereg reference; the prereg file states
the leg's question, gates, seeds, and policies).
Panel evidence (outside the repo, not committed):
`~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-11-02/landing-r72/`
(census JSONs, full transcripts, r41 system files).

## Verdicts

- **Q1 OUTING — GO.** A joint-foraging promise was kept end-to-end for
  the first time in this leg's history: 704 Yuki, promised day 10, met
  day 11, 260 kcal into the pantry (130 from the player, 130 from Yuki).
  The path fires: dawn wait → hall entry → adjacency → start line
  ("Yuki falls in beside you") → walk to a patch node → a split haul
  ("2× Blackberry for me, 2× Blackberry for you") → walk home →
  deliver ("You unload both shares… You both made the trip").
- **Q2 STAY-GREEN — GO on all four seeds** (table below).
- **Q3 PEOPLE CHECK — GO.** 0 depth fizzles, 0 empty beats, 0 fabricated
  shared history on every seed; 29 content beats across the quad.
  `more` offered 0 times — dead UI in landing for the fifth running run.
- **Q4 LOOT/ABILITIES REACH — report-only.** No loot-tier pack item was
  identified in the day-14 pack snapshots; 5 monster kills, all by
  villagers, none by the player; the monster-meat channel moved one step
  (702 hummice tested by Maya, day 8) but reached no dinner. No-opportunity
  for loot tiers in a fortnight, not a defect.

## Q2 stay-green table (final panel run only)

| seed | System day | villager deaths | grief beats | codas | theft | self-suff. | plenty days | starvation | end pop |
|------|-----------|----------------|-------------|-------|-------|-----------|-------------|------------|---------|
| 701 | 8 | 1 | 1 | 0 | 0 | 0.939 | 14 | 0 | 10 |
| 702 | 8 | 1 | 1 | 0 | 0 | 0.948 | 12 | 0 | 11 |
| 703 | 8 | 1 | 1 | 0 | 0 | 0.891 | 13 | 0 | 11 |
| 704 | 8 | 0 | 0 | 0 | 0 | 0.917 | 13 | 0 | 12 |

Gates: System contact day ≤10 ✓; death liturgy exact (grief beats ==
villager deaths, counting both `villager` and `person` death kinds — the
earlier "mismatch" on 702/703 was this run's own counting bug: each had
one `person` death by ambush) ✓; theft 0 ✓; self-sufficiency ≥0.70 ✓;
plenty-voice ≥1 ✓; starvation deaths 0 ✓. 701's player died day 13
(sickness) and the mantle passed to Elijah day 14; the village continued.

## Fixes landed in this run (both [needs-eyes]: dialogue + promise behavior)

### Fix 1 — away-commit guard (convo-wants.js, convo-dialogue.js)

The r71 blank explained: a villager away on expedition can still be
conversed with (the conversation abstraction treats them as present),
but the favor system requires presence — so every forage promise made
to an away villager was born unkeepable and rotted (−15 trust).
- `convoFavorCommit` now refuses `forage_help`, `water_haul`, and
  `stay_close` commits to an away villager FIRST, before the other
  gates, with the line: "Wait — I'm out on the road. I can't ask you to
  meet me at dawn when I'm miles away. Find me when I'm back, and we'll
  set it then." No promise is created; the favor stays `asked`.
- The `dlg:commit` handler now prefers the failure's own line instead
  of always saying "you already gave your word somewhere" (which was
  wrong when no commitment was open). A failed commit resolves
  heard/stated, never `promised`.
- Proof test `scripts/test-forage-away-commit-r72.js`: 27/27 PASS on
  fixed code; before-check via stash: 12 passed / 15 failed (all away
  assertions fail, home controls pass).
- Wild proof: the guard fired three times in the final panel (701 Arun
  day 10, 701 day 8, 704 day 11) — road line once each, no promise, no
  rot line. The 701 Arun sitting then declines cleanly ("Forget I
  asked. They won't forget. They'll just stop asking."), which is the
  census `declined` state: an honest no, not a broken promise.
- Driver fix alongside: the pinned picker re-pressed `dlg:commit` six
  times after a refusal (the want stayed uncommitted); it now skips
  `dlg:commit` after a refusal line, so the road line appears once.

### Fix 2 — door position refresh (game.js)

`enterBuilding()` and `exitBuilding()` never called
`ensureVillagerPositions()`, while `travelTo`, `microMove`, and
path-step code all do. Sequence: player outside → ensure deletes
inside-NPC positions (other side of the door, by design); player
enters → inside NPCs keep `pos=null`; every micro-adjacency check
(favor starts, tile Talk) then fails until the player happens to step.
Wild case: 701 Jorge days 12–13, home at dawn, same side of the door,
forage start blocked on a null position. Fix: call
`ensureVillagerPositions()` in both door verbs (same pattern as the
other movement verbs).
- Proof test `scripts/test-door-positions-r72.js`: 7/7 PASS on fixed
  code; before-check via stash: 4 passed / 3 failed.
- Open question carried forward (not a claim): whether the browser UI
  independently refreshes positions on render, which would mask this in
  live play. The engine invariant is still the correct fix.

## Q1 detail — what the probe learned (driver-only, v7→v15)

The outing is playable, but only through a narrow path a real player
must discover:

1. **Companions follow node travel, not micro-moves** (proven v11:
   Yuki stayed at micro (7,7) while the player walked to (4,2), and
   the outing then blocked on "Move next to your partner"). Joint
   presses happen at a node's ENTRY cell only.
2. **A press works one micro cell and picks it clean.** An entry cell
   holding only unknown plants yields a shrug ("Nothing we can eat
   here — wood and green we cannot name yet. We keep walking.") and
   unnamed berries, never food. The probe's answer — press at the entry
   cell, and on a shrug or dry press walk to the NEXT patch node — is
   the game's own suggested loop ("We keep walking").
3. **Entry-cell luck decides the haul.** Yuki's outing needed two
   nodes: (3,4) shrugged, (4,5) split blackberries. A player with
   narrow plant knowledge will shrug more often; that is the design
   working (knowledge gates food), but it means outings frequently end
   in honest shrugs rather than hauls.
4. **The meet window spans meetDay..dueDay** (Yuki: meet 11, due 12),
   not a single dawn — the earlier "single-dawn window" reading was
   wrong for asks made two days prior.

## Q1 — the two promises that did not keep

- **703 Wanjiru — explained, no fix this run.** Promised day 11
  ("Done. The south slope below the meadow, before the dew dries."),
  meetDay 12, dueDay 13. The day-13 dawn scan shows her away, not
  waiting; no attempt was possible; the promise broke. This is the
  away trap's second face: Fix 1 guards commits to already-away
  villagers, but a partner who leaves AFTER promising still strands
  the outing for the whole window. Widening the window further, or
  letting the meet slide to the partner's return, is a design call —
  not a senseless defect — so it is documented, not fixed.
- **701 Jorge — unexplained, next run's first repro item.** Promised
  day 11 ("Good. The creek bend, past the treeline, first light."),
  then the favor never appeared in ANY dawn scan, has no favorsEnd
  entry, and left no rot line. Ruled out: new-ask overwrite (the
  one-open-commitment guard in `convoFindFavorNeed` returns null while
  a promise is open) and ledger deletion (no deletion path found).
  What is needed is a targeted repro — promise day N, scan dawn N+1 —
  not another quad. This is the run's one open blank.
- Asked-never-committed (driver coverage limit, not a game defect —
  the driver sits one fresh villager per day and never re-sits):
  701 Cormac, 702 Thabo/Naomi, 703 Rafael, 704 Sigrun.

## Q3 people check — full-transcript notes

All 46 transcript files in the panel directory were read in full.
Detector counts: depthFizzles 0, depthEmptyBeats 0,
fabricHistoryFlags 0, `more` offered 0, content beats 7/6/9/7.

- Wants are real (curiosity, favors, comfort, gossip, beast-naming),
  options engage or deflect, endings resolve, plant, or owe. Decline
  paths carry consequence text ("They won't ask twice", "They'll just
  stop asking"), not boilerplate.
- Beast-naming threads work across seeds: sightings spread ("word
  travels fast around a fire"), votes accumulate, names differ by
  village ("Judge Hoot", "Ugly-Eyes", "Loud-Eyes").
- Nonverbal sits work: Hindi/Spanish speakers with no shared words,
  the "one English they know" beat (a warm "Fuck you" grin), endings
  that land ("The conversation ends where language couldn't reach").
- The honest-moot line fires correctly ("Never mind the food I needed
  — we got it handled. Thanks anyway.").
- Thin spots, not fizzles: 702 day 9 (short beats, resolves
  unestablished honestly) and 704 day 8 ("Anyway", "nod slowly, not
  quite done" — brief but honest, resolves unestablished).
- Adjudicated over-fire (third pattern): 704 day 5's "That's the whole
  of it." closes the NPC's own want question ("What's something from
  your old life that's actually useful here? That's the whole of it."),
  not a beat admission. The detector fires on substring anywhere.
- Standing wording note (from r71, still present): the forage commit
  line names a meeting spot ("East treeline, first light") while the
  mechanic gathers at Haven at dawn then walks out. Wording only;
  the mechanic is now proven to work.

## Village assessment, in plain words

Four small villages, all alive at day 14 with food in the pantry
(16k–26k kcal) and nobody starving. First System contact came on day 8
everywhere — early, calm, and survivable. Each village lost one person
or none: sickness, ambush, and one mantle pass (Stanley → Elijah on
701) that the village absorbed without scattering. Villagers killed
five monsters between them; the player killed none — the villages
fight their own fights, sometimes. People talk like people: they ask
for help they actually need, they remember being turned down, they
name the monsters together, and when they promise to forage with you
they now either mean it or tell you plainly they are miles away.
The one shadow is Jorge's vanished promise on 701 — a commitment the
village seems to have forgotten without saying so, which is exactly
the kind of quiet break this loop exists to catch.

## Reachable / fun / winnable

- **Reachable:** yes for the outing now — the start-to-deliver path
  is proven, though entry-cell luck and plant knowledge gate the haul.
  The `more` thread is still unreachable in landing (dead UI, fifth
  running run).
- **Fun:** yes, in the small human moments — the road-line refusal is
  funny and fair, beast-naming is a genuine village ritual, and a kept
  outing ends with both packs coming home. The thin sittings (702 day
  9, 704 day 8) are brief, not broken.
- **Winnable:** the leg holds — every village survives the fortnight
  with food, knowledge, and leadership intact, and System contact lands
  on day 8. The full seat is not this leg's question.

## Metric review (for the NEXT run)

- Adopted this run: the depth-share gate is retired (wants resolve in
  1–2 turns by design); the gate is now "0 sittings where a pursued
  continuer yields an empty beat" — scored 0 this run.
- Detector refinement proposed: a dry admission counts only when the
  beat carries no other content AND the line is not the want's own
  question line (704 day 5 pattern). Also: liturgy counting must
  include `person` deaths alongside `villager` deaths.
- `moreOffered` is 0 for the fifth running run: either fix the offer
  in landing or retire the more-thread gate from this leg's panel.
- Q1 scoring held as preregistered: GO = ≥1 outing KEPT, which Yuki
  met. The Wanjiru/Jorge gaps are reported as gaps, not folded into
  the pass.

## Telemetry

`node scripts/telemetry-check.js --baseline …/telemetry-baselines/landing-split.json
--current '…/landing-r72/journey-landing-r72-census-*.json'
--metrics systemDay,villagerDeaths,monsterKills,starvAutopsies` → two LOUD
lines, both investigated and explained as artifacts (same class as r71):

- `villagerDeaths disappeared: baseline 9 -> current 0` — artifact: the
  census JSONs carry no top-level `villagerDeaths` field (deaths live in
  `deaths[]` with kinds `villager`/`person`/`monster`), so the tool reads
  0. Actual villager deaths in this panel: 3 (701 sickness, 702 ambush,
  703 ambush). Not a real disappearance.
- `monsterKills swung -79%: baseline 24 -> current 5` — artifact of
  baseline vintage/scope: the current count (2+2+1+0 = 5) matches the
  census `deaths[]` monster entries exactly, and this run changed no
  combat code (dialogue + door positions only). Villagers fought and
  killed in-panel; no combat regression signal.

Baseline NOT rolled forward. No unexplained deviation.

## Regression

- Proof tests on the final tree: `test-forage-away-commit-r72` 27/27,
  `test-door-positions-r72` 7/7.
- `node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest`:
  **284 passed, 6 failed** — exactly the standing set. The first run of
  the suite in this session showed 283/7 with one extra failure, which
  investigation proved to be a test-probe artifact, not a game
  regression: the door-position fix lets the 4-day `runDays` campaign
  deliver a talk request that the old stream left pending, and
  `test-join-request-line-20261020.js` searched delivered requests too
  — a spent invite line satisfied its search, then `startConvo`
  correctly ignored the spent request ("their reason leads, once") and
  opened a forage ask instead. Fix (probe only, no assertion loosened):
  the loop now skips `delivered` requests; the test is green 6/6 with
  all six checks unchanged. The remaining 6 failures include the
  racks-voice test, proven pre-existing via a stash before-check
  (fails identically without these changes); the other five are
  godpath proof/freshness tests unrelated to dialogue, doors, or
  favors. No new failures.
- Test-probe fix file: `scripts/test-join-request-line-20261020.js`
  (delivered-filter in the request search loop).

## Evidence paths

- Run note: `evidence/2026-11-02/journey-landing-r72.md` (this file)
- Prereg: `evidence/2026-11-02/journey-landing-r72-prereg.md`
- Driver: `scripts/journey-landing-r72-20261102.js`
- Proof tests: `scripts/test-forage-away-commit-r72.js`,
  `scripts/test-door-positions-r72.js`
- Panel: goal `hidden_files/evidence/2026-11-02/landing-r72/`
  (census JSONs, transcripts, r41 system files)

## Infra notes

- Heartbeat kept under 15 minutes throughout (standing loop + manual
  beats); worktree `journey-landing` registered under
  `oversight-playtest-loop`.
- The `/tmp` quad logs were wiped mid-run by a sibling cleanup (known
  `/tmp` hazard); all panel evidence lives in the goal directory and
  survived. Probe iteration logs v7–v15 are summarized above, not
  recoverable from `/tmp`.
- No live verification, version bump, or push in this run — the batch
  ship loop owns those. Status: merged locally, pending ship.
