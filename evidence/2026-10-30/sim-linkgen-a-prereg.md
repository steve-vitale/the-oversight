# sim-linkgen-a — PRE-REGISTRATION (frozen before any judged sim)

Run: Loop A, axis scale-onramp. MEASUREMENT ONLY — no src/js change;
the gating freeze (Steve 2026-10-27/28) stands. This arm decomposes two
findings from sim-bladequota-a (evidence/2026-10-30/sim-bladequota-a.md,
same-day addendum + leadcourt analysis — read first, NOT re-quoted as
this run's data):
(1) Competent leg: 0 active links on all 16 bladequota seeds.
(2) Leadcourt leg: links that DO form can carry empty rosters
(generated=false, rosterSize 0 every linked day, e.g. Emberhold/
Thornfield on seed 76102).

## Canon read first
- docs/CANON.md (manifest). No canon doc covers regional link formation
  or village roster generation specifically; docs/MAP.md states the one
  map, walking everywhere, nothing teleports. The source of truth is
  code, verified below, not invented:
- src/js/hierarchy.js proposeLink/judgeLink/_formLink: proposal needs
  knowsVillage (knower-traced lore, 2026-10-29; player legacy counts
  generated=true, or rumored + a DELIVERED village rumor); score >= 55
  accepts, 35–54 counters (played: accept/sweeten/walk), < 35 declines
  with -5 opinion (cold-ask); opinion <= -20 is a shut door (silence).
  Base score 38 + rep standing/2 (cap 20) + opinion/2 + strength term
  (+/-10..15) + RNG 20-10. A cold proposal with no relationship scores
  ~38 +/- noise: it lands in the COUNTER band more often than ACCEPT.
- scripts/policies/competent.js contains NO proposeLink call (verified
  by grep over all proposeLink callers: only app.js UI + scale policies).
  scripts/policies/leadcourt.js proposes from day >= 25, one/day,
  pantry > 12,000 kcal, only to knowsVillage villages not already
  linked, until 3 Haven-primary subordinates stand; it answers counters
  (sweeten if pantry > 25,000, else accept).
- src/js/game.js genVillages: stubs with population 8–12, generated=
  false, NO roster. genVillageRoster is called ONLY from catchUpSim.
  catchUpSim runs ONLY on approach (checkVillageProximity, dist <= 2;
  dist <= 1 = visit, dist 2 = seen-nearby), on talk/join/betrayal
  interactions (all require presence at the fire), and in debug
  scenarios (not in sims). _formLink does NOT generate a roster.
  _linkedVillageWeek (linkTick, Haven-primary subs only) advances
  village.day by 7/week and moves pantryKcal WITHOUT generating a
  roster and WITHOUT roster deaths. catchUpSim records lore BEFORE the
  daysToSim early return: if village.day >= scholar day on approach
  (weekly ticks can push it there), the approach records knowledge but
  generates NO roster that day — a deferred-generation trap to test.
- Perception law (Steve 2026-10-28): villagers know who's around only
  through their own senses. This instrument records ONLY traced
  knowledge (lore how/day, generated flag, delivered rumors, approach
  distance) and proposes NO roster-fed or list-fed decision. Any
  "fix" suggestion that feeds a roster/list into a decision is out of
  scope for this measurement arm and must be flagged as violating the
  law, not recommended.

## Hypotheses (to be confirmed or killed by the band, not assumed)
- H1: competent's zero links are NO-ATTEMPT (the policy never calls
  proposeLink), not blocked proposals — because competent contains
  zero scale code by design. A blocked/declined story would require
  attempts that the code does not make.
- H2: leadcourt attempts DO happen, and their outcome split (accept /
  counter-answered / counter-unanswered / decline / blocked-unknown /
  shut-door) names the binding stage for link formation under a
  courting policy.
- H3: a linked village gains a roster ONLY via a catchUpSim event with
  player distance <= 2 (approach/visit/sighting) or a presence
  interaction; link formation alone, tribute weeks, and time passing
  never generate one. Hence linked-but-never-visited villages stay
  rosterless to run end.
- H4: the daysToSim<=0 early return can defer generation on an
  approach of a linked village whose weekly ticks pushed village.day
  to scholar day — observable as approach events that record lore but
  leave generated=false.

## Primary metrics
- (1) Per seed per leg: proposals attempted (proposeLink calls, any
  caller), outcome split (ACCEPT / COUNTER / DECLINE / BLOCKED-UNKNOWN
  / SHUT-DOOR, classified at call time from knowsVillage-before,
  opinion-before, and return value — NO extra judgeLink call, which
  would draw RNG and bend the trajectory), counters answered
  (accept/sweeten/walk/unanswered-at-end), links formed, first-link
  day, active links at end.
- (1b) Knowledge on-ramp per seed: for each other village, first-known
  day + how (lore how / generated flag / delivered rumor), first
  approach day + distance, villages never known, villages known but
  never proposed to (and why: already linked / pantry gate / day gate
  / cooldown — recorded from the wrapper + daily state, not inferred).
- (2) Per linked village: link day, generated-ever (bool), first-gen
  day, generation trigger (catchUpSim event: distance at call, how,
  linked-at-call, village.day vs scholar day at call), rosterSize +
  alive adults at link day / first-gen day / end, still-ungenerated
  at end (bool), approach events that did NOT generate (lore-only
  approaches, H4).
- Wall numbers per leg: national-ever / national-final /
  table-waiting / table-entered / wins, wave 4 and wave 5 unlocks,
  median + max survival (actual days).

## DIAG thresholds (judge the arm against this header; a miss is NO-GO,
## never re-scored mid-run)
- DIAG-GO (1): competent pilot shows the SAME zero-link stage on
  >= 6/8 seeds (stages: NO-ATTEMPT / BLOCKED-UNKNOWN / DECLINE /
  COUNTER-UNANSWERED / SHUT-DOOR), AND leadcourt pilot shows >= 1
  proposal attempt on >= 6/8 seeds (the attempt stage is reachable
  under a courting policy, so the competent stage is a policy fact,
  not an engine block).
- DIAG-GO (2): >= 12 linked villages recorded across the leadcourt
  pilot with complete generation histories, AND either (a) a strict
  majority of linked villages share one end-state (generated-ever vs
  never-generated), or (b) 100% of generation events carry an
  approach/presence trigger (dist <= 2 at call, or a presence
  interaction) — i.e. the trigger rule is named with zero
  counterexamples. Either clause names the binding mechanism.
- DIAG-NO-GO: either clause fails (measurement inconclusive for that
  question; the other question's verdict still stands on its own).
- INSUFFICIENT-DATA: sweep aborted, or instrument errors on > 0 seeds
  (an instrument error voids that seed; >= 4 voided seeds voids the
  band). Instrument errors include: wrapper throw, snapshot throw,
  generation event with unrecorded trigger.

## Horizon + why (death-aware, never a fixed 200d)
Cap 200 game-days; a run stops early on Game.over. Links need day >= 25
(leadcourt gate) + courtship time + seasons; roster questions need
linked villages to live long enough to be visited or not — the ceiling
must reach past day 150. Actual days + endReason reported per seed;
median survival on actual days, not the cap.

## Seeds (fresh band, registered on THIS base)
- Pilot: 76201–76208 (8 seeds) × 2 legs (competent, leadcourt).
- Confirm: +76209–76216 (8 more per leg) ONLY if the pilot completes
  with 0 instrument errors AND at least one DIAG clause is still
  undecided (too few linked villages, or a split stage vote). If the
  pilot already decides both questions with margin (stage >= 7/8 and
  linked villages >= 16 with a strict-majority end-state), the pilot
  IS the band and no confirm spend is justified — stated here so a
  short band is a decision, not a shortcut.
- Base: worktree ~/workspace/worktrees/sim-linkgen-a, branch
  sim-linkgen-a, HEAD recorded in each corpus file's manifest at
  sweep time. Any base movement after this file forces a fresh band.

## Per-seed measurement (daily pure-read snapshot + event wrappers)
Wrappers record but never draw RNG and never write game state:
proposeLink (outcome classification at call time), answerCounter
(how + result), catchUpSim (village, day, player distance at call,
how, linked-at-call, village.day vs scholar day, roster before/after),
genVillageRoster (village, day — generation proof). Daily snapshot:
active links (village, trust, opinion, arrears, generated, rosterSize,
alive adults), other villages (known?, lore how/day, generated,
rosterSize, population, village.day, opinion, rumored, distance from
player, player pos), scale rank, wave, omen stage (background only).
No say/sysSay override on silent runs (say is emit-only, but silent
runs stay byte-identical to the harness baseline by not touching it);
transcript runs override say/sysSay and must match the silent run's
proposal/link/generation event sequences or be reported off-trajectory.

## Binding-stage decision rules
- (1) competent stage per seed: 0 attempts → NO-ATTEMPT; else the
  majority outcome among its attempts (ties → the earliest blocking
  outcome in pipeline order: BLOCKED-UNKNOWN > SHUT-DOOR > DECLINE >
  COUNTER-UNANSWERED). A seed with >= 1 accepted link is REACHED, not
  a shortfall.
- (1) leadcourt stage per seed: same rule over its attempts; seeds
  with >= 3 active links at end are REACHED (the leadcourt cap).
- (2) linked-village end-state: GENERATED (roster exists at end) vs
  NEVER-GENERATED (no roster at end) vs GENERATED-LATE (first roster
  after link day + 28). Trigger rule: every generation event must
  carry dist <= 2 or a presence caller; any event without one is a
  counterexample that kills H3 and is reported as its own finding.

## Sense-testing (one trace per mechanism)
- Mechanism (1): one leadcourt seed re-run with say/sysSay captured;
  read the proposal/counter/accept/decline lines for sense: does the
  courtship read as played negotiation, and does any line explain a
  decline or a shut door in terms a player could act on?
- Mechanism (2): one leadcourt seed re-run with say/sysSay captured;
  read the approach line ("You see smoke...") for a visited village
  vs the silence around a linked-but-unvisited village: does the
  fiction ever say the linked village has people, and does any line
  explain why it can send nobody?
- Both transcripts must match their silent runs' event sequences
  (proposal outcomes, link formations, generation events) or be
  reported off-trajectory and not quoted.

## No-comparison statement (§15)
Single-base measurement on two policies; no game-code lever, so no
balanced-panel file is fabricated. The competent-vs-leadcourt contrast
is a POLICY contrast on identical seeds, reported as such.

## Metric review (filled at evidence time, not mid-run)
Doubts about the metric, the stage rules, or the pilot-only band go
here and apply to the NEXT run, never to re-score this one.
