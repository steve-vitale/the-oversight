# Journey leg: SCALE (days 80–140) — 2026-10-12 r5

Run 5 of the refocused village-journey sim loop. Worktree `journey-scale-r5`
(oversight-playtest-loop). Main tree untouched until landing.

## Pre-registration (staged methodology, MEASUREMENT.md §§9–12)

- **Question:** the previous playtest run (run_id 2026-10-13T00:26:21Z, worktree
  `journey-scale`) died mid-run after a scalecourt pilot on fresh seeds 60001–60004
  that formed ZERO links and proposed ZERO times. Was the scale on-ramp even
  visible on those seeds? Which road gets closest to national by day ≤90 —
  scalecourt (covenant-road) or winseek (multi-road: proposeLink-as-subordinate,
  covenant, bidForPrimacy)? And WHY did scalecourt never propose?
- **Primary metric:** national reached by day ≤90 (binary per seed).
- **Secondary:** regional reached (day), links formed, proposals made, decline/accept text.
- **GO/interesting:** ≥1 national in 4 winseek runs → on-ramp open. 0/4 with a
  NEWLY-mapped mechanical wall → interesting. 0/4 with the same food wall as
  r4/scale3 → confirming; document and move on.
- **Horizon:** 140d cap; death-aware (harness stops at pop-zero / Game.over).
- **Seeds:** 60001, 60002, 60003, 60004 (same as the dead run → direct comparability).
- **Policies:** scalecourt (fixed — see §1) vs winseek. Fight/contest drivers are the
  journey-deepening r5/r7 lineage (flee-boxed-safe, standoff-aware) for both, so the
  comparison isolates courtship, not fight skill.
- **People check:** day 85/105/125 conversations, sense-read (SENSE-TESTING LAW).

## Stale-lock recovery

Lock from run_id 2026-10-13T00:26:21Z existed; registry heartbeat for its tree
(`journey-scale`) was 74 min stale (>15 min → DEAD per the guard). No live
processes. Deleted the lock, proceeded. The dead tree holds uncommitted work
(4 evidence JSONs + 1 script) from a DIFFERENT run_id — left untouched per the
same-owner rule; its findings are superseded by §1 below.

## 1. The dead run's "0 proposals" was a script bug, not a game finding

Its `makePolicy().daily` shadowed `BASE.daily` WITHOUT calling it — and both
scalecourt's and winseek's courtship live in `daily`. Its 4 scalecourt legs
measured a competent-only village that never courted. Proof: re-running the
same seeds with `BASE.daily` called (this run's DIAG mode, days 1–40) shows
rumors firing (villages known by day 5–15 via rumor/seen), a proposal on day 25
and an answered accord on day 26 on every seed. The on-ramp is visible; the
seeds are fine. The dead run's 4 JSONs remain in its tree, uncommitted —
superseded, do not cite their "0 links" result.

## 2. Full legs (this run)

Harness `scripts/journey-scale5-20261012.js` (new; DIAG mode + full legs + fixed
convo driver using startConvo/r.choices/endConvo — the first version used
talkTo and produced non-advancing transcripts, fixed mid-run). Canon re-read:
CANON.md, SCALE.md (hierarchy.js ontology headers).

| seed | policy | died day | cause | max scale | links (end) | proposals | notes |
|------|--------|----------|-------|-----------|-------------|-----------|-------|
| 60001 | scalecourt | 107 | combat | regional | 1 | 46 | 46 proposals, almost all prereq-refused |
| 60002 | scalecourt | 71 | combat | regional | 1 | 32 | links broke; opinions −28 |
| 60003 | scalecourt | 142 | survived | regional | 5 | 55 | 2 SEASONED covenant links (trust 46/45); 11 covenant crises answered |
| 60004 | scalecourt | 92 | combat | regional | 1 | 59 | 59/59 prereq-refusals — pure spam |
| 60001 | winseek | 44 | combat | regional | — | 84 | hunt patrols = suicide |
| 60002 | winseek | 30 | combat | regional | — | 1 | dead before courtship |
| 60003 | winseek | 23 | combat | village | — | 38 | dead day 23 |
| 60004 | winseek | 28 | combat | regional | — | 26 | dead day 28 |

**0/8 reached national. 7/8 reached regional** (winseek-60003 died too early).

### The national wall, mapped precisely (seed 60003, 142 days, link table dumped)

Covenant polity needs 3 SEASONED covenant links (30+ days old, trust 40+):
- Ashford: covenant, day 51, trust 46 → SEASONED ✓
- Thornfield: covenant, day 56, trust 45 → SEASONED ✓
- Third covenant link: NEVER FORMED. Stonebridge opinion 2, The Bloodied −2 —
  both below the opinion-10 prerequisite bar the whole run.

Trust 40+ IS reachable (46/45 via pool weeks + tending) — the binding
constraint is the THIRD covenant accept, blocked on opinions. Opinions move via
codex study (+3, once, requires the trip), broadcast wins (+2, region-wide),
and time. The policy did none of the targeted climb — it just re-proposed.

### Winseek: the hunt road is suicide

Winseek's "seek encounters 3x/week, engage every fight, never flee at start"
killed all 4 villages by day 23–44 (13–16 deaths each, nearly all combat).
It reached regional in 3/4 (it proposes on day 1–3, no day-25/pantry gate) but
cannot survive to test the on-ramp. Policy-design finding, not a game bug —
documented, not fixed.

## 3. Village assessment (plain words)

**Seed 60003 (the 142-day survivor).** Four people walked out of day 142: Lena
(ER nurse), Sofia (community gardener), James (carpenter), Emma (veterinarian).
Six died along the way — David Kim to something alien on day 108, one villager
starved on day 112, Obonyo the carpenter in combat on day 139. The village held
FIVE live bonds at the end: a lead link plus two covenant and two trade leagues,
11 covenant crises answered, 15 contests survived, pantry ~21k kcal. They were
TWO seasoned covenant bonds into the national bar and never got the third —
Stonebridge wouldn't take their calls. Nobody leads a nation; the region knows
Haven's name (opinions 23–29 on three fires) but the league never became a polity.

**Seeds 60001/60002/60004 (died days 71–107).** The familiar arc: regional by
~day 47, one lead link, a flurry of refused covenant/trade proposals, then
wave-2/3 combat ground the roster down (pop 9→1) and the village was lost
fighting. The pantry was never the killer here — combat attrition was.

**What they knew:** the run didn't sample codex breadth (harness gap — the
covenant road's knowledge economy is unmeasured this run). What they could do:
field 5-link diplomacy, answer covenant crises, survive 15 contests. Who led:
the scholar (Bearer) throughout — no succession crisis in the survivor. Who
was miserable: the dead. What was missing: the third covenant bond, and any
national beat — 17 runs across r3+r4+r5, still zero.

## 4. People check — 3 transcripts + 2 re-runs, sense-tested

**Verdict: villagers act like people.** (r4's 7 transcripts + these 3.)

- **60003-day125 (Lena, curious want):** "Have you ever hurt someone? Since all
  this started." Player answers honestly; she receives it with gravity ("That
  couldn't have been easy to say"); gossip surfaces ("Sofia just walked away
  from Haven. Didn't look back"); "I've got theories. Most of them are just
  fear with better lighting." Resolution=engaged, closing "Alright. One thing
  at a time. That's how we get through." A person with a hard question, not a
  menu.
- **60001-day85 (Sofia, curious want):** "What got you through the first week?"
  → "Shock's underrated. It's the body's way of buying you time." Gossip with
  a live detail ("that stray dog — the one that bit two people — lets James
  touch it"). Closing "Careful out there. I mean it." (mood=hungry — the
  closing fits the day).
- **60003-day85/105 (Obonyo, Swahili-only):** the language barrier is real —
  mime, gesture, "the conversation ends where language couldn't reach." My
  convo driver bailed immediately (no nonverbal options in its pick list — a
  driver gap, not a game bug); a real player would gesture back to the trap-line
  invitation. Noted for the driver, not the game.
- **Mood-beat template smell (r4): RESOLVED on master.** The single-entry pools
  were widened to 3 variants each in commit 80e0a14c (r4's own fix). Both my
  transcripts hitting "The ease drains out of it, a little." is coincidence
  under random pick — verified the pool now has 3 lines and convoPick is
  random with run-ledger awareness. No action.

## 5. Blanks

**FILLED — the proposal spam → the climb (policy fix, worktree).**
`scripts/policies/scalecourt.js`: courtship now (a) only proposes at/above the
opinion-10 bar the game enforces, and (b) does the climb the refusal names —
one codex pilgrimage per unstudied below-bar village (walkTo their fire,
studyVillageCodex +3 once, walk home; hp>70% gate, 14-day timeout, fight-safe).
Before: 59/59 prereq-refusals on seed 60004. After: 1 proposal, 0 refusals.
Proof: `scripts/test-scalecourt-climb-20261012.js` — BEFORE (via
POLICY_PATH=/tmp/scalecourt-before-r5.js) shows the spam; AFTER shows no
proposal below the bar, pilgrimage starts, study fires, opinion 5→8. Both
green. Regression: test-courtship-climb-20261011.js 12/12 of its passing tests
still pass; its 5 failures (A2–A6 decline-line copy) fail identically on
pristine master — pre-existing, not mine. (Noting for the record: the decline
copy the test expects seems to have drifted from the code.)

**DOCUMENTED, not fixed:**
1. **Third-covenant-bond wall** — opinions are the binding constraint on the
   covenant road to national. The climb verbs exist (codex +3, broadcast +2);
   the policy now uses them. Whether 3 seasoned covenant links are reachable
   in a real run is lever territory for the longsim loop.
2. **Winseek suicide** — the aggressive hunt road dies by day 23–44. By design
   (its brief says engage); documented.
3. **Dead run's orphaned evidence** — 4 JSONs + script in the `journey-scale`
   tree (different run_id), uncommitted. Superseded by this run; left for the
   reaper/owner.
4. **Convo driver gap** — my driver (and the dead run's) has no nonverbal
   gesture picks, so it abandons language-barrier conversations a real player
   would play. Driver improvement, not game content.

## 6. Verdict: reachable / fun / winnable

- **Reachable: PARTIAL, improved.** Regional is reliably reachable (7/8 this
  run; courtship → links → Dawn plays). National remains UNREACHED in 17 runs
  across r3+r4+r5 — but the wall is now mapped to a single missing bond, not a
  fog. The covenant road's climb is now actually walked by the policy.
- **Fun: YES, where it plays.** The conversation system keeps delivering
  (Lena's hard question; Sofia's stray-dog gossip). The region reads as alive
  — opinions moving, crises answered, links with real trust numbers.
- **Winnable: the leg still doesn't close.** No national beat has ever staged
  in any journey run. The competent player now courts correctly and still dies
  at the regional rung — usually to wave-2/3 combat attrition around day
  70–120, with the pantry adequate. The food wall moved; the combat wall at
  scale is the next lever.

## Files

- This note: `evidence/2026-10-12/journey-scale-r5.md`
- Harness: `scripts/journey-scale5-20261012.js` (DIAG mode, fixed convo driver,
  LINKTABLE=1 link-table dump)
- Fix: `scripts/policies/scalecourt.js` (the climb before the knock + walkTo)
- Proof: `scripts/test-scalecourt-climb-20261012.js` (BEFORE via
  POLICY_PATH=/tmp/scalecourt-before-r5.js, AFTER default)
- Evidence: `evidence/2026-10-12/journey-scale5-{60001,60002,60003,60004}-{scalecourt,winseek,diag}.json`
- Transcripts: `/tmp/journey-scale5-transcript-{60001-day85,60003-day85,60003-day105,60003-day125}.txt`
  (transient; key excerpts quoted above)
