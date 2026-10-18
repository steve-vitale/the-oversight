# sim-foodvoice2-b — food-voice fixes: departure pool + pantry-check per-day gate (loop B, run fleshout-b-20261018T0030Z, axis food-economy)

Fills findings #504 and #505 (evidence/2026-10-17/sim-foragelead-b.md,
sense-test): both are voice-only blanks in the food-economy narration.

- #504: the away-forage departure line `"Back before dark. Probably."`
  (src/js/villager-objectives.js, `objDepart`) is a SINGLE template fired
  VERBATIM per departure — up to 6 identical lines in one day on the
  corpus (belongfeast-7628; 5/day on four other seeds; 3,024 verbatim
  beats across 32 runs). It needs a pool like the other ambient lines.
- #505: the prodthrottle pantry-check beat (src/js/game.js,
  `resolveOneAssignment`) repeats PER RESOLUTION — up to 15 in one day
  (belongfeast-7634 d64, all spoken by Enes) with a WOBBLING fresh-days
  count (~18→~12→~14→~12 across parts) as the pantry shifts between
  day-parts. It reads as the engine recomputing, not a person checking.

PRECEDENT: sim-nothingedible-voice-b (0d57b8e4, engine-side per-day voice
gate in src/js/game.js, landed PERMANENTLY with [needs-eyes]): voice-only
fixes land permanently; det-gate must prove byte-identical state
trajectories; the narration stream is the only allowed difference.

## PRE-REGISTERED (binding, docs/MEASUREMENT.md §§9–12, 14) — written BEFORE any fix

- PRIMARY (a) departure pool: on the exact 32 corpus pairs
  (seeds 7621–7628 + 7631–7638 × {leadfeast, belongfeast}, FEASTSCALE_R13=1,
  SEATDRIVE=0, 180d death-aware), re-run with the fix armed: max per-day
  VERBATIM repetitions of any single departure line ≤ 2, AND the forage
  pool holds ≥ 4 distinct lines. Control corpus: 3,024 verbatim beats,
  max 6/day.
- PRIMARY (b) pantry-check gate: same 32 pairs, armed: the redirect beat
  ("the shelves are full") fires ≤ 1 per day AND the hunger-exempt beat
  ("the hungry eat first") fires ≤ 1 per day, each with a single computed
  fresh-days count per day (no within-day wobble). Control corpus: 9,818
  redirect beats (max 15/day) + 44 exempt beats (max 4/day), count wobbling
  ~18→~12 within one day.
- GUARDRAILS: (a) det-gate — per-day state trajectories byte-identical
  control (FOODVOICE2_GATE='0') vs armed on 8 seeds × {leadfeast,
  belongfeast} × 180d death-aware (the nothingedible dayHash schema;
  narration stream the ONLY allowed difference); (b) wall metrics on the
  full 32 pairs: national/table/wins/wave4/wave5 identical or within ±2,
  median survival REPORT-ONLY (expected identical), starvation deaths
  within ±2, no new death mode with n≥3.
- GO → both fixes land PERMANENTLY (voice-only precedent). Player-facing
  narration → commit message carries [needs-eyes]. Findings #504/#505
  marked [fixed] in sim-findings.md.
- NO-GO → revert game.js + villager-objectives.js edits zero-trace; commit
  evidence + proof as KILLED AT PILOT.
- Horizon: 180d death-aware (dead villages stop, +10d engine tail max) —
  matches the corpus that filed the findings.
- Seeds: 7621–7628 + 7631–7638 × {leadfeast, belongfeast} (the exact
  corpus the census filed the findings on) — 32 pairs, same policies and
  env as the census. RED census runs statically ON the corpus (no sims);
  GREEN re-runs the same pairs with the fix.
- Control substrate: FOODVOICE2_GATE='0' (both gates + pool OFF) — restores
  the exact pre-fix voice world on identical seeds. Armed: gate on.

## The levers (voice-only, prose-only — no game-state moves)

(a) DEPARTURE POOL (src/js/villager-objectives.js, `objDepart`): the
forage entry of the purpose-line map becomes a 5-line pool in the
speaker's wry-terse register (original line first). Selection is a
deterministic vid+day string hash plus a per-day sequence on the Game
object (`_fvDepartDay`/`_fvDepartSeq`, off-state like the nothingedible
precedent — saves and state fingerprints untouched). Zero engine-RNG
draws: narration never moves game state. Lines:
  1. "Back before dark. Probably." (original)
  2. "Gone looking. Don't wait up."
  3. "There's food out there. Going to find it."
  4. "Out for a forage. If I'm late, start without me."
  5. "Bringing dinner back. One way or another."
Sense note: all five are spoken quotes in the same register as the
original — a tired, laconic villager heading out, not a menu rotation.

(b) PANTRY-CHECK PER-DAY GATE (src/js/game.js, `resolveOneAssignment`):
both pantry-check beats voice only on their first occurrence each day
(`_throttleBeatDay` / `_throttleExemptDay` off-state day flags); the
fresh-days count is computed ONCE per day per beat (`_throttleBeatDays` /
`_throttleExemptDays`) so the number is stable within the day. Repeats
within the day make no say() call at all — the day's telling stands
(nothingedible precedent). The ledger counters (`v.throttleRedirects`,
`v.throttleExemptDepth`) keep incrementing per occurrence — the village
ledger stays a truthful measure; only the VOICE is gated. The redirect
branch itself (alt-task resolution) is untouched.

FOODVOICE2_GATE='0' disables both gates and restores the single original
departure line (testing only; in the browser the gates are always on).

Canon note: no dedicated canon doc covers these beats (docs/CONVERSATIONS.md
covers the dialogue UI contract, not ambient beats; docs/SYSTEM-VOICE.md is
the System narrator's TTS bible — a different surface; these are the
villagers' own ambient voices). Steve's "No silent actions" rule is
preserved — the first occurrence each day still narrates the decision in
full; only the repeats are silenced.

## Results

PART A (RED, static on the pre-fix corpus, 32 runs):
departure-line: 3,024 verbatim beats, max verbatim/day 6, 674 days with
verbatim repeats. Pantry-check: redirect 9,818 beats (max 15/day), exempt
44 beats (max 4/day), fresh-days wobble on 540 of 3,243 beat-days. RED OK.

PART B (det-gate, 8 seeds x {leadfeast,belongfeast} x 180d death-aware):
control (FOODVOICE2_GATE='0') vs armed — 16/16 byte-identical per-day
state trajectories (nothingedible dayHash schema; narration stream the
only allowed difference). DET-GATE OK: the voice gates move zero game
state (pantryFreshDays() is pure arithmetic — no RNG; departure pool is a
vid+day string hash + off-state per-day sequence — zero engine-RNG draws).

PART C (GREEN, armed census on the exact 32 corpus pairs):
- departure-line: max verbatim/day 2 (bar <= 2), all 5 pool lines used
  (bar >= 4). PRIMARY (a) GO.
- pantry-check: redirect max 1/day (bar <= 1), exempt max 0/day
  (bar <= 1), fresh-days wobble days 0 (bar 0). PRIMARY (b) GO.
  Honesty note: the hunger-exempt beat fired 0 times on BOTH sides
  (armed and same-tree control) — the branch simply doesn't trigger
  on current-tree hunger mechanics (the corpus's 44 exempt beats were
  older-code). The exempt gate is verified structurally (same code
  path and day-flag pattern as the redirect gate, det-gate shows the
  branch's voice moves no state) but not behaviorally exercised on
  these seeds.
- Wall vs the old corpus: national 19 vs 23, table 27 vs 30 — BREACHED
  as literally computed; investigated under metric review (substrate
  drift — corpus predates current tree code). Same-tree armed-vs-control
  comparison: see metric review — PASSES.

## Metric review (mandatory)

- CORPUS STALENESS (the one honest miss in this run's instrumentation):
  the pre-registered guardrail compared armed-on-current-tree vs the
  sim-foragelead-b corpus, which was generated on an OLDER base — sibling
  landings moved the tree underneath it (armorstock, reunioncost,
  journey-social r21, dismissal, huntdefense...). National 19 vs 23 and
  table 27 vs 30 is code drift, not an arm effect: the arm cannot move
  game state by construction (det-gate 16/16) and the same-tree
  before/after proves it. Per §14 the corpus-miss is recorded, not
  re-scored: the judge stands, but the instrument was wrong.
- CORRECT COMPARISON (same tree, same seeds, gate on/off): full 32-pair
  control census (FOODVOICE2_GATE='0') on this tree, scripts/
  compare-foodvoice2-armed-control.js. Wall metrics IDENTICAL on all 32
  pairs: national 19/19, table 27/27, wins 0/0, wave4 1/1, wave5 0/0
  (all within the ±2 band at delta 0), starvation deaths 24/24, median
  survival 137d/137d (report-only, identical), 32/32 identical end
  day+reason, death-cause shares byte-identical (1,365 deaths, 18 modes,
  zero count deltas — no new death mode). Guardrail PASSES on the
  correct comparison.
- REVISION FOR THE NEXT RUN: never pre-register a corpus guardrail
  without pinning the code base it was generated on; prefer the det-gate
  control census (FOODVOICE2_GATE='0' on the current tree) as the
  before/after — it is the honest comparison and costs ~7 min for 32
  pairs.
- BALANCED PANEL (§15): not run as a separate instrument. For a
  voice-only arm the det-gate IS the before/after comparison and is
  strictly stronger than a statistical panel diff: the panel's role is
  detecting game-state movement, and the det-gate proves per-day
  byte-identity of state trajectories (16/16) plus 32/32 identical wall
  tuples on the full pair set. The pre-registered judge (thresholds)
  was applied to the det-gate + same-tree wall comparison.
- Convergence: converged (voice-only fix, lands permanently).

## Sense read

Read aloud from a real armed transcript (leadfeast-7621, d4-d26) —
SENSE-TESTING LAW, transcript not counts:

- d4: Luis heads out to forage. "Gone looking. Don't wait up."
- d10: Jovan heads out to forage. "Bringing dinner back. One way or
  another."
- d11: Islam heads out to forage. "Back before dark. Probably."
- d14: Katarina heads out to forage. "Out for a forage. If I'm late,
  start without me."
- d21: Luis heads out to forage. "There's food out there. Going to
  find it."

All five are spoken quotes in the speaker's wry-terse register — a
tired, laconic villager heading out the door, each a thing a person
actually says, never a menu rotation. Same-day departures vary:
on d14 Katarina and Jovan get DIFFERENT send-offs (the within-day
uniqueness guard); d22 Nora vs Luis likewise. A 6th+ departure on a
busy day can recycle a line (max verbatim/day 2, rare) — acceptable:
the tell was N identical lines/day, and that is gone.

Pantry beat (Deirdre, d13): "🌿 Deirdre checks the pantry before
heading out — the shelves are full, ~6 days of fresh on hand…
leaves the harvest standing and turns to the wood run instead. The
pantry can't take more; the wild will keep." One telling per day
stands; the fresh-days count is stable within the day (was
~18→~12 within-day wobble). The ledger counters
(v.throttleRedirects / v.throttleExemptDepth) keep counting
truthfully — verified: armed totals redirect 2,904 ledgered
occurrences vs 1/day voiced; control 11,030 occurrences voiced.

VERDICT: GO on every gate → both fixes land PERMANENTLY (voice-only
precedent). Findings #504/#505 marked [fixed] in sim-findings.md.

Repo hygiene: `node scripts/check.js --quick` — 96 passed, 1 failed
(scripts/test-sprites-valid-20261014.js: dustboar/sunback/sweeps_week/
cliffhanger calm/aggro sprites missing — PRE-EXISTING, unrelated: the
test loads sprites.js + godhood.js in a vm context and never touches
game.js or villager-objectives.js; my patch cannot affect its outcome).
Documented, not chased (sprite content belongs to the content lanes).
