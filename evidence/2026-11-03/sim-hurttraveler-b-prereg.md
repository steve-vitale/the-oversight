# sim-hurttraveler-b — PREREG (binding, MEASUREMENT.md §14)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261103T2130Z.
Worker tree: ~/workspace/worktrees/sim-hurttraveler-b. Branch base:
master at run start (2d8f1f02c lineage; see commit log).
Axis: food-economy. Arm: the hurt-traveler blank — tracker blank 2,
sim-findings item #1720 (claimed by this run; coordinator owns the
backlog file, this worker does not edit it).
Canon read first: docs/CANON.md, docs/PRESERVATION.md (food ladder;
pack food moves only what fits in the pack). No canon doc covers
away-return timing or hurt-traveler narration — the mechanism below
is code-read, not invented canon, and the fix narrates only state
the engine already holds.

## DIAG (pristine master, before any fix — corpus
## evidence/2026-11-03/perseed-hurttraveler-b/, instrument
## scripts/sweep-hurttraveler-b.js + scripts/analyze-hurttraveler-b.js)

Competent policy, seeds 96101–96108, 100d death-aware cap:
23 hurt-traveler away lines, all the full-meal template, all with
take == want (generous meals, 1,088–1,618 kcal — NOT a ration story).

TRUE REASON THEY ARE STILL OUT (code-read, then confirmed per case):
- Departures are health-gated, returns are NOT. Objective departures
  pass objHealGate (villager-objectives.js objDepart: hurt villagers
  are patched or sat out before leaving; LEAVE exempt from sit-out).
  But the return branch (game.js npcNodeTravel, ~16932–16941) fires
  on ONE condition only: partsAway >= away.duration. There is no
  health check, heal check, or early-return trigger anywhere on the
  return path. hurtVillager (game.js ~8065) records damage and death
  but never touches v.away.
- So every sampled case is the same mechanism with different errands:
  the villager left (healthy enough to pass the gate, or walking out
  under LEAVE), was hurt WHILE away — 23/23, all on the same trip,
  22 by monster, 1 by sickness — and the trip's clock has not run
  out yet, so the meal branch still counts them away and feeds them
  from the pack. No case was hurt before departure.
- By away purpose (23): expedition 11, forage 4, visit 2, water 2,
  guard 2, explore 1, leave 1. By return-clock remainder at meal time:
  partsLeft <= 0 on 9 (clock run out, return lands on the next
  day-part tick — including 3 already standing on the haven node,
  dist 0, still ledger-away), 1–4 on 7, 5–8 on 2, 9+ on 5
  (incl. the LEAVE walk-out, partsLeft 819 of a 999-part trip).
- DOCUMENTED NON-FIX (out of scope, behavior change): expedHurt
  (villager-agency.js ~531) "cuts the expedition short" by capping
  st.exped.duration — but nothing ever writes that cap back into
  v.away.duration (the only away writers are the two departure
  setters), so the away clock is unaffected. Not fixed here: a
  behavior fix needs its own proof, and this arm's brief prefers
  narration unless a failing turn-home trigger is proven. No such
  trigger exists to fail — there is no health-based return trigger
  at all — so option (ii) is NOT available on this evidence, and
  inventing a new turn-home behavior would violate the brief.
  Fix shape is therefore (i) narration, below.

## FIX SHAPE (i) — narration only

Extend awayHungerVoice (game.js ~30052) with a state-derived reason
sentence, appended to all three templates (full/short/empty — the
blank is "why still out", independent of meal size; all 23 observed
cases are full-meal, but the sentence is the same helper everywhere):
- Purpose phrase from v.away[vid].purpose (the authoritative record):
  expedition/explore → "still out on a long trek"; forage → "still
  out foraging"; water → "still out fetching water"; traps → "still
  out checking the snares"; visit → "still out visiting <target
  first name>" (obj.targetVid via displayName; purpose-only fallback
  if the target cannot be named — never a borrowed name, never
  "Someone" for a known target); guard → "still out walking with
  <target first name>"; haul → "still out on a haul"; hunt → "still
  out hunting"; leave → "walked away from Haven and hasn't come
  back"; unknown purpose → no purpose clause (clock clause only).
- Clock clause from the SAME arithmetic as npcNodeTravel's return
  branch (partsAway = (day − sinceDay)*4 + (dayPart − sincePart)):
  partsLeft > 0 → "the trip isn't over yet"; partsLeft <= 0 →
  "due home — the trip's time is up, they just haven't walked in
  yet"; obj.state === 'returning' → "already walking home".
- The full-meal template's "far from the haven's shelves" is DROPPED:
  it is false on the 3/23 cases already standing on the haven node
  (dist 0, still ledger-away) and adds nothing beyond "away from
  the haven". The reason sentence replaces it, not filler.
- HARD CONSTRAINTS (narration-only property preserved): no
  Math.random reads, no amount/draw/outcome changes, no new state
  writes except the existing _awayVoice day-marker bookkeeping.
  The helper reads only v.away, objOf, agencyState (read-only
  encounters tail is NOT quoted — monster ids are internal labels,
  not prose), displayName, day/dayPart. Any helper failure falls
  back to the purpose clause or to silence (never a wrong reason).

## PILOT DESIGN (before/after on identical seeds)

- Seeds: 96101–96108 (the diag seeds). Policy: competent.
  Horizon: 100d death-aware cap (dead villages stop; the harness's
  own tail; never a fixed 200d). Rationale: the diag's 100d window
  already yields 23 hurt lines — far above the sample floor — and
  matches the awayration2 corpus window.
- Cells: BASELINE = diag corpus above (pristine master); ARMED =
  same instrument, same seeds, fix applied. No other src change.
- PRIMARY METRIC (one): among sampled hurt-traveler cases in the
  armed corpus, the share whose line carries the TRUE reason
  (purpose + clock clause matching the snapshot's away record,
  sense-judged case by case; target names must match obj.targetVid).
  GO: >= 7/8 of sampled cases TRUE (sample = up to 8 cases, one per
  seed where a line exists, first line per seed; if a seed has no
  line it contributes nothing to the denominator and the sample
  floor is 5 seeds with lines — below that, INSUFFICIENT-DATA, not
  GO). Sense-judged: a line counts TRUE only if a reader can tell
  from the line alone what errand holds them out and whether the
  trip is ongoing, ending, or a walk-out.
- TRAJECTORY-IDENTITY PROOF (required for a narration-only land):
  armed per-seed JSONs must equal baseline with ONLY the voice
  line text differing (analyzer --compare mode strips `line` and
  requires byte-equality of everything else, including deaths,
  daysAlive, waveReach, and every snapshot field). Any other diff
  is a FAIL of the narration-only property, whatever the primary
  metric says.
- GUARDRAILS (judged per-seed matched, not pooled vibes): no new
  death mode (death-cause sets identical by construction under
  identity proof); no survival regression beyond identity (daysAlive
  identical under identity proof). If identity fails, guardrails
  fail with it — the arm is NO-GO, not "close enough".
- PROOF TEST (green before any pilot claim):
  scripts/test-hurttraveler-b.js — fixture Game proving (a) each
  purpose phrase + clock clause renders from a hand-built away
  record (RED on pristine: no reason sentence present; GREEN with
  the fix), (b) no Math.random consumption (seeded RNG stream
  identical before/after N voice calls), (c) no state mutation
  beyond _awayVoice bookkeeping (health/pack/away records
  byte-identical before/after the call).

## VERDICT RULES (§14 — a miss is NO-GO, never re-scored)

- GO (primary >= 7/8 TRUE AND identity proof passes AND proof test
  green) → the fix lands as its own commit (game.js voice change +
  test + evidence). Confirm seeds do NOT run: narration-only with
  trajectory identity proven needs no 12–16-seed confirm, and the
  brief's panel rule (§15) is declared inapplicable below.
- NO-GO (primary < 7/8, or identity fails, or proof test red) →
  KILL the arm: revert the game-code change with no trace (keep
  prereg + instrument + corpora + evidence + proof of the kill).
- INSUFFICIENT-DATA (fewer than 5 seeds with lines in the armed
  corpus) → report as such; no landing, no kill claim.
- §15 PANEL: inapplicable if the fix is narration-only and
  trajectory identity is proven — there is no behavior delta for a
  balanced panel to compare, and fabricating a compare file would
  be dishonest. Declared here, not after the fact. If identity
  FAILS (i.e. the change turns out behavioral), the panel MUST be
  run before any landing claim, and this prereg's GO is void.

## SENSE TEST (after pilot, before verdict)

Read >= 3 armed transcript lines around the changed voice and judge
in plain words: does a hurt traveler staying out now read as a
person with a reason, or still as an unexplained pattern? Check the
line never invents a reason the state doesn't support (no borrowed
names, no generic "Someone" where a name is known, no quoted
monster ids, no ETA the clock doesn't state).

## METRIC REVIEW (to be filled in the evidence file, not here)

Reserved: whether the 7/8 bar, the per-seed-first-line sample, and
the identity proof were the right instruments, judged AFTER the
pilot — never revised mid-pilot.
