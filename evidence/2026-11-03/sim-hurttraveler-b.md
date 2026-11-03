# sim-hurttraveler-b — VERDICT: GO, NARRATION-ONLY FIX LANDS ON THIS BRANCH

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261103T2130Z.
Worker tree: ~/workspace/worktrees/sim-hurttraveler-b. Axis: food-economy.
Arm: the hurt-traveler blank — tracker blank 2, sim-findings item #1720
(claimed by this run; coordinator owns the backlog file).
Binding prereg: evidence/2026-11-03/sim-hurttraveler-b-prereg.md (read
in full before judging; this verdict is judged against it, §14).
Canon read first: docs/CANON.md, docs/PRESERVATION.md. No canon doc
covers away-return timing or hurt-traveler narration — the mechanism
below is code-read, not invented canon, and the fix narrates only
state the engine already holds. No gate/price/demand changes. No other
lane touched (no scale-onramp, win, gap, or journey files).

## LEVER PLAYED

None, in the balance sense: this is a narration fix, not a lever.
The awayHungerVoice line (src/js/game.js, sim-awayvoice-b 2026-10-25)
now states the villager's true, state-derived reason for staying out
(new helper awayReasonSentence), replacing the filler tail "far from
the haven's shelves". No amount, draw, outcome, or RNG stream changes.

## DIAG — THE TRUE REASON THEY ARE STILL OUT (pristine master)

Instrument: scripts/sweep-hurttraveler-b.js + scripts/analyze-hurttraveler-b.js.
Corpus: evidence/2026-11-03/perseed-hurttraveler-b/ (competent,
seeds 96101–96108, 100d death-aware cap). 23 hurt-traveler lines,
all the full-meal template, all take == want (1,088–1,618 kcal —
generous meals; NOT a ration story, confirming the closed
away-ration finding).

Mechanism (code-read, then confirmed on every case):
- Departures ARE health-gated: objDepart (villager-objectives.js)
  runs objHealGate first — hurt villagers are patched or sat out
  before leaving (LEAVE walk-outs exempt from sit-out only).
- Returns are NOT health-checked: the return branch (game.js
  npcNodeTravel) fires on ONE condition, partsAway >= away.duration.
  No health check, no heal check, no early-return trigger exists
  anywhere on the return path. hurtVillager records damage/death
  but never touches v.away.
- Therefore every sampled case is the same mechanism with different
  errands: the villager left fit, was hurt WHILE away — 23/23 on the
  same trip (22 by monster, 1 by sickness; every last hurt the same
  day as the line, except one next-day line on the same trip) — and
  the trip's clock had not run out, so the meal branch still counts
  them away and feeds them from the pack. ZERO cases were hurt
  before departure. No existing turn-home trigger exists to have
  "failed" — so the brief's behavior option (ii) was unavailable on
  this evidence, and inventing a new turn-home behavior would have
  violated the brief. Narration (i) was the honest fix.
- By away purpose (23): expedition 11, forage 4, visit 2, water 2,
  guard 2, explore 1, leave 1. By return-clock remainder at meal
  time: partsLeft <= 0 on 9 (clock run out, return lands on the next
  day-part tick — including 3 already standing on the haven node,
  dist 0, still ledger-away, which is why "far from the haven's
  shelves" was false and had to go), 1–4 on 7, 5–8 on 2, 9+ on 5
  (including the LEAVE walk-out, partsLeft 819 of a 999-part trip).
- DOCUMENTED, NOT FIXED (behavior change, needs its own proof):
  expedHurt (villager-agency.js) "cuts the expedition short" by
  capping st.exped.duration — but nothing ever writes that cap back
  into v.away.duration (the only away writers are the two departure
  setters), so the away clock is unaffected. Named here for a
  future arm; this arm does not touch it.

## THE FIX (what changed, exactly)

src/js/game.js, awayHungerVoice + new awayReasonSentence:
- Purpose phrase from v.away[vid].purpose: expedition/explore →
  "still out on a long trek"; forage → "still out foraging"; water
  → "still out fetching water"; traps → "still out checking the
  snares"; visit → "still out visiting <target first name>";
  guard → "still out walking with <target first name>"; haul →
  "still out on a haul"; hunt → "still out hunting"; leave → "They
  walked away from Haven and haven't come back." Target names come
  from the trip's own obj.targetVid via displayName — never a
  bystander, never "Someone" for a known target; unknown purposes
  fall back to the clock clause only, never an invented errand.
- Clock clause from npcNodeTravel's own arithmetic (partsAway =
  (day − sinceDay)*4 + (dayPart − sincePart)): partsLeft > 0 →
  "the trip isn't over yet"; partsLeft <= 0 → "due home — the
  trip's time is up, they just haven't walked in yet"; obj.state
  === 'returning' → "already walking home".
- Applied to all three templates (full/short/empty — the blank is
  "why still out", independent of meal size). Full-meal tail "far
  from the haven's shelves" dropped (false on dist-0 cases).
- HARD PROPERTIES (proven, not asserted): no Math.random reads,
  no amount/draw/outcome changes, no state writes beyond the
  pre-existing _awayVoice day-marker bookkeeping. Helper failure
  falls back to purpose-only or silence — never a wrong reason.

## PROOF (green before any pilot claim)

scripts/test-hurttraveler-b.js — RED observed on pristine (the
test asserts awayReasonSentence is a function; pristine has none —
assertion failed as expected), GREEN with the fix:
- Leg A (fixtures, real functions on hand-built state): every
  purpose + clock state renders its true reason; visit/guard name
  the true target and no bystander; unknown purpose invents no
  errand; no away record → no line; hp 8 → no line; one line per
  (vid,day); shelves filler absent. (One test-side fix during the
  run: the borrowed fixture context initially lacked
  awayReasonSentence, so the voice's guarded call yielded '' — a
  fixture bug, not a game bug; fixed in the test, all legs green.)
- Leg C (narration-only): 5 voice calls read Math.random 0 times
  and leave health/away records byte-identical.
- Leg B (live wiring): oneRun(96101, 100) twice, byte-identical
  hurt lines; every live line carries its snapshot's reason.

## PILOT — BEFORE/AFTER ON IDENTICAL SEEDS (prereg-bound)

Seeds 96101–96108, competent, 100d death-aware cap.
BASELINE = diag corpus; ARMED = evidence/2026-11-03/perseed-hurttraveler-b-armed/
(same instrument, same seeds, fix applied — the only src change).

- PRIMARY METRIC (GO >= 7/8 TRUE, sample = first line per seed):
  8/8 TRUE. Every sampled line names the true errand and clock
  state from its own snapshot (see sense test below). Sample floor
  (5 seeds with lines) cleared: all 8 seeds have lines.
- TRAJECTORY IDENTITY (required): analyzer --compare (line text
  stripped) reports identical=8, differ=0. Deaths, daysAlive,
  waveReach, and every snapshot field are byte-identical across
  cells. The narration-only property holds on real sims, not just
  fixtures.
- GUARDRAILS (per-seed matched): identical by construction under
  identity — no survival regression, no new death mode (death-cause
  sets identical, 119 deaths in both cells).
- Confirm seeds: NOT RUN. Per the prereg, narration-only with
  trajectory identity proven needs no 12–16-seed confirm.

VERDICT: GO. The fix lands as its own commit on this branch
(game.js voice change + test + evidence + both corpora). The
coordinator merges; this worker does NOT push, bump, or verify live.

## SENSE TEST (armed transcript lines, plain words)

First line per seed, judged against its snapshot — all TRUE:
- "Shannon eats away from the haven — 1,321 kcal from the pack —
  while hurt (health 6/100). They're still out on a long trek —
  due home — the trip's time is up, they just haven't walked in
  yet." (explore trip, clock run out — the reader now knows she is
  overdue, not mysteriously lingering.)
- "Benoit eats away from the haven — 1,296 kcal — while hurt
  (health 7/100). They're still out on a long trek — the trip
  isn't over yet." (expedition, 2 parts left.)
- "Brian eats away from the haven — 1,463 kcal — while hurt
  (health 4/100). They're still out foraging — the trip isn't over
  yet." (A forager hurt on the job, still on the job.)
- "Giulia eats away from the haven — 1,145 kcal — while hurt
  (health 6/100). They're still out foraging — due home — the
  trip's time is up, they just haven't walked in yet."
- "Henry eats away from the haven — 1,301 kcal — while hurt
  (health 6/100). They're still out fetching water — due home —
  the trip's time is up, they just haven't walked in yet."
- "Juliana eats away from the haven — 1,259 kcal — while hurt
  (health 4/100). They're still out on a long trek — the trip
  isn't over yet."
- "Jenny eats away from the haven — 1,571 kcal — while hurt
  (health 4/100). They're still out walking with Leo — due home
  — the trip's time is up, they just haven't walked in yet."
  (Guard trip; Leo is the trip's own targetVid, not a borrowed name.)
- "Nina eats away from the haven — 1,206 kcal — while hurt
  (health 7/100). They walked away from Haven and haven't come
  back." (The LEAVE walk-out, 819 parts left — the one case that
  is NOT a trip with an end in sight, and the line says so.)

All 15 remaining armed lines were also read and carry true reasons
(visit lines name Elif and Kavya, their trips' own targets;
Gonzalo's "still out visiting Kavya — already walking home" is
both halves state-true: the visit happened, obj.state is
'returning', and he is still ledger-away until the clock ticks).
Judgment: a hurt traveler staying out now reads as a person with a
reason — an errand, a companion, a clock — not as an unexplained
pattern. No line invents a reason the state doesn't support, no
borrowed names, no generic "Someone" where a name is known, no
quoted monster ids, no ETA the clock doesn't state.

## REACHABILITY + VILLAGE ASSESSMENT (watch metrics, plain words)

Window honestly stated: competent policy, 100d death-aware cap,
seeds 96101–96108 — an early/mid window, not a full-arc run.
Identical in both cells (identity proof):
- Survived to 100d: 3/8 (96102, 96105, 96108); village-lost: 5/8
  (d62–d93). Median days alive 93.
- Wave reach: wave 4 on 8/8 (maxWave 4 every seed); Arc III on 8/8
  (arc field 3 in every per-seed JSON).
- National / table / wins: 0/8 in both cells — the scale wall is
  untouched by this narration fix, as expected; competent alone at
  100d carries no scale push (same instrument-population note as
  the awayration2 arm). Nothing here claims otherwise.
- Deaths, 119 total both cells: the wild 58, monster 34, the arena
  5, a wound that wouldn't close 3, ambush 2, a stranger 3, plus
  singletons (contests, named beasts). The village dies to the
  wild and to monsters — the same world that hurts these travelers
  on their trips.
- Who thrived / died and why: nobody in particular — survival
  tracks early pantry/monster luck, not narration. The blank this
  run fills is the record itself: WHY hurt travelers are still out
  is now spoken in the game, from the trip's own state, instead of
  living only in a diag corpus. The pantry-empty story behind the
  meals themselves remains the food-economy question for another
  arm; this arm's question is closed.

## VILLAGERS ACT LIKE PEOPLE (SENSE-TESTING LAW)

Beyond the changed lines: no other robotic, static, or repeated
dialogue was judged in this corpus — the corpus was instrumented
for hurt-traveler lines only, so no wider dialogue verdict is
claimed. The one pattern found (the unexplained hurt traveler) is
fixed, not just documented.

## §15 BALANCED PANEL — DECLARED INAPPLICABLE (prereg-bound)

No panel compare file is attached, deliberately: the fix is
narration-only and trajectory identity is proven 8/8 (line text
stripped, everything else byte-identical). There is no behavior
delta for scripts/balance-panel.js to compare, and fabricating a
compare file would be dishonest. The prereg declared this
inapplicability BEFORE the pilot; the pilot's identity result is
what activates it. Had identity failed, the panel would have been
mandatory and the GO void — it did not fail.

## WHAT LANDS, WHAT DOES NOT

- LANDS ON THIS BRANCH (coordinator merges; worker does not push):
  src/js/game.js awayReasonSentence + awayHungerVoice reason
  sentence; scripts/test-hurttraveler-b.js; prereg + this evidence;
  diag + armed corpora; sweep + analyzer.
- DOES NOT LAND: no game-code change beyond the voice lines; no
  behavior change (expedHurt's st.exped/v.away clock disconnect is
  documented above, not fixed); no gate/price/demand changes; no
  other lane's files; no live verification (ship loop owns it).
- Confirm seeds 96109–96124: NOT RUN (prereg forbids them on a
  narration-only GO; no confirm is needed).

## METRIC REVIEW

- The 7/8 bar did its job: 8/8 TRUE with no borderline cases — every
  sampled line's errand and clock clause matched its snapshot
  exactly, including the two hard cases (LEAVE walk-out, returning
  visit). No friendlier re-scoring was needed or done.
- The per-seed-first-line sample was the right instrument: it
  forced one judgment per independent world instead of letting the
  7-line seed (96107) dominate. The remaining 15 lines were still
  read, and all were true — the sample did not hide a failure.
- Trajectory identity (line-stripped byte-equality) proved
  stronger than a "no RNG reads" fixture claim alone: it catches
  any accidental state write, not just RNG consumption. Future
  narration arms should keep both proofs (fixture + sim identity).
- One wording note for the NEXT narration arm, not a revision of
  this one: "due home — the trip's time is up, they just haven't
  walked in yet" is long, and "still out visiting X — already
  walking home" pairs two tenses. Both are state-true and read
  clearly in context; shortening them would risk losing the
  clock-state distinction (ongoing vs due vs returning) that is
  the whole point. Leave as is.
- Convergence state for this axis (food-economy, hurt-traveler
  blank): FIXED (narration). The axis itself is not converged —
  the pantry-empty story and the expedHurt clock disconnect remain
  open, as documented above, for future arms.
