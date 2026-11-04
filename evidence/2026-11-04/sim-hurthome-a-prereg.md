# sim-hurthome-a — PREREG (binding, MEASUREMENT.md §14)

Run: oversight-flesh-out-loop, run fleshout-20261104T0545Z (Loop A).
Worker tree: ~/workspace/worktrees/sim-hurthome-a. Axis: food-economy.
Arm: hurt-traveler turn-home behavior DIAG — the behavior half of
sim-findings travel/health item #1720 left open by Loop B 2130Z
(sim-hurttraveler-b, evidence/2026-11-03/sim-hurttraveler-b.md).

## CONTEXT (not re-litigated)

- Away-ration formula story: CLOSED (Loop B 1930Z awayration2-adopt:
  dawn sizing is masked, pantry-plentiful days already take full
  want, pantry-empty days have nothing more to draw).
- Hurt-traveler narration half: CLOSED (Loop B 2130Z hurttraveler GO:
  awayHungerVoice now states the state-derived reason — purpose +
  return-clock — for staying out).
- OPEN, this arm: whether hurt travelers actually TURN HOME, and
  when. The 2130Z diag proved there is NO health-based return
  trigger to have "failed" (see code read below), so this arm
  measures the behavior that the clock-only return rule produces.
  DIAG ONLY: zero src/js, no default flip, no policy default
  change, no gate/price/deed/readyDemand change. Any behavior fix
  the diag suggests is DOCUMENTED as the named next arm, not landed.

## CODE READ (done before judging; pins every definition below)

Canon read first: docs/CANON.md, docs/MAP.md (way home: only a
villager's RETURN walk may step through beyond coordinates, because
return retraces ground — §6). No canon doc covers away-return
timing or hurt-traveler behavior — the mechanism below is
code-read, not invented canon.

- Departures ARE health-gated: objDepart (villager-objectives.js
  ~978) runs objHealGate first — hurt villagers are patched or sat
  out before leaving (LEAVE walk-outs exempt from sit-out only).
- Returns are NOT health-checked: npcNodeTravel (game.js ~16932)
  fires on ONE condition only:
  `shouldReturn = partsAway >= (away.duration || 4)`, where
  `partsAway = (s.day - away.sinceDay) * 4 + (dayPart - away.sincePart)`.
  No health check, heal check, or early-return trigger exists
  anywhere on the return path. hurtVillager records damage/death
  but never touches v.away.
- The away test is the LEDGER: v.away[vid] present. Node distance
  does NOT define away — the 2130Z diag found 3/23 cases already
  standing on the haven node (dist 0) but still ledger-away, and
  the meal branch still counted them away. This arm uses the
  ledger test, same as awayHungerVoice.
- The hurt threshold is the VOICE GATE: awayHungerVoice (game.js
  ~30100) fires only at hp <= 7 (`if (hp > 7) return`). The 3–7
  range in the original finding was the OBSERVED meal-hp shape,
  not a gate. This arm pins hp <= 7 (alive: hp >= 1) so the
  census covers exactly the population the voice line speaks
  about. The hp distribution is reported, so the 3–7 subset is
  visible without redefining the census mid-run.
- Dawn is DAY_PARTS[0]: endDay (game.js ~32382) ends with
  `dayPart = 0` and the line `— DAY N DAWN —`. A dawn sample is
  therefore the state observed immediately after endDay returns
  with dayPart === 0, plus the run's opening day-7 morning
  (setup leaves dayPart === 0; no villager can be away yet, so
  this sample can open no episode — it is recorded for
  completeness, not counted as an episode source).
- Away writers are exactly two departure setters (objDepart in
  villager-objectives.js ~988; the agency expedition setter in
  villager-agency.js ~310). Away deleters on the paths that
  matter: the npcNodeTravel return branch (game.js ~16941) and
  expedDeath (villager-agency.js ~560, which deletes v.away after
  registerDeath — so death must be recorded BEFORE the original
  registerDeath call, from the pre-call scan state).
- DOCUMENTED DISCONNECT (context only, not judged, not fixed):
  expedHurt (villager-agency.js ~531) "cuts the expedition short"
  by capping st.exped[vid].duration, but nothing ever writes that
  cap back into v.away[vid].duration. The instrument records
  exped.duration vs away.duration at episode open so the next
  arm can see whether the cap ever coincides with a turn-home.

## EPISODE DEFINITION (pinned; never moved mid-run)

A hurt-away EPISODE is one away-trip spell that contains at least
one hurt dawn:

- OPEN: at a dawn sample, villager vid has v.away[vid] present
  AND v.health[vid] <= 7 (and >= 1), AND no episode is already
  open for that trip. Trip key = sinceDay + '|' + sincePart + '|'
  + purpose of the away record at open. A healed-then-rehurt
  villager on the SAME trip does NOT open a second episode; the
  episode extends (hurt dawns counted, healed dawns noted).
- DAWN COUNTING: every dawn while the episode is open and the
  villager is still ledger-away increments dawnsObserved; dawns
  with hp <= 7 increment hurtDawns. (A trip that heals above 7
  and stays out still counts its hurt dawns; the episode does
  not close on healing, because the question is "when do they
  turn home", and healing-then-returning is a turn-home outcome.)
- CLOSE, first of: (a) away record deleted with the villager
  alive → RETURNED, returnDay = current scholar day, returnPart
  = current dayPart; (b) villager death while the episode is open
  (registerDeath wrapper, pre-call away state) → DIED-AWAY,
  deathDay = current day; (c) run end (100d cap or village over)
  with the episode still open → CENSORED.
- CLASSIFICATION (mutually exclusive, exactly one per episode,
  in this priority order — death first, because expedDeath
  deletes the away record in the same call):
  1. died-away — death while the episode is open.
  2. turn-home same-day — returned, returnDay == episodeDay.
  3. turn-home next-day — returned, returnDay == episodeDay + 1.
  4. stayed-out >= 3 days — returned with
     returnDay >= episodeDay + 2 (out on the episode day and at
     least the two following days), OR still away at the
     episodeDay + 2 dawn with no return/death before run end
     (censored flag set, but the >= 3-days fact is already
     observed — the villager was away at dawns episodeDay,
     episodeDay + 1, episodeDay + 2).
  5. censored-early — run ended before the episodeDay + 2 dawn
     and before any return/death, so the >= 3-days question is
     unanswered for that episode. Reported separately, never
     silently folded into another bucket.
- Task categories map exactly: "turn-home same/next day" =
  buckets 2 + 3 (reported split AND combined); "stayed-out
  >= 3 days" = bucket 4; "died-away" = bucket 1; bucket 5 is the
  disclosed remainder that keeps "every episode classified"
  honest. No episode may be left unclassified.

## PILOT DESIGN (single cell; this is a census, not an A/B)

- Policy: competent (scripts/policies/competent.js), unchanged.
- Horizon: 100d death-aware cap (dead villages stop; the
  harness's own tail; never a fixed 200d). Why 100d: it is the
  prior away-travel horizon (hurttraveler-b diag + awayration2
  corpus both ran 100d and both yielded hurt-traveler material —
  23 meal lines on 8 seeds), so the episode census is
  comparable to the corpus that posed the question.
- Seeds: PILOT 97101–97108 (fresh interval). Interval-disjointness
  verified before choosing: away-travel bands already consumed
  include 96101–96124 (explicitly NOT reused); Nov 3/4 evidence
  filenames and .md files show no 9710x use, and the other
  consumed 97xxx bands found are 973xx/974xx, plus 99101–99120
  and 98916–98921 elsewhere. The sweep FATALs on any seed list
  other than the pilot list (or the expansion list below).
- Instrument: scripts/sweep-hurthome-a.js + scripts/analyze-
  hurthome-a.js (new files only; wrappers read-only: advancePart
  post-scan, endDay post-dawn-sample, registerDeath pre-call,
  hurtVillager last-hurt record, say transcript capture — no RNG
  reads, no game-value writes). Per-seed JSONs under
  evidence/2026-11-04/perseed-hurthome-a/.
- Env: PLENTYDEPRI=1, DEPOSITGATE=1 (shipped defaults, explicit,
  same as the hurttraveler-b corpus).

## PRE-REGISTERED DIAG-GO (judged against this header, §14)

- PRIMARY (census): episode census >= 20 hurt-away episodes
  across the 8-seed pilot, EVERY episode classified into
  buckets 1–5 above (unclassified count must be 0).
- SECONDARY (reported, not separately gated): turn-home rate =
  (same-day + next-day returns) / (episodes ending by return or
  death, i.e. buckets 1–4 minus died-away... precisely:
  (buckets 2 + 3) / (buckets 2 + 3 + 4-returned), with
  died-away and censored-stayed reported alongside, never
  folded into the denominator silently); median
  days-out-while-hurt = median(returnDay − episodeDay) over
  returned episodes and (deathDay − episodeDay) over died-away
  episodes, reported separately as well as pooled; died-away
  share = bucket 1 / all episodes.
- NARRATION AUDIT (required for GO): a sample of 5 stay-out
  evenings — an evening = dusk (dayPart 2) or night (dayPart 3)
  on a day whose dawn opened or continued an episode that was
  still open at the NEXT dawn (i.e. a genuinely stayed-out
  night, not the return night). Sample = first 5 such evenings
  across the corpus, at most one per episode, preferring
  distinct seeds. For each: all say-lines that evening naming
  the villager (first name) plus that day's away-voice line if
  any. Judge per evening: does ANY line give a reason for
  staying out (errand, companion, clock, wound, decision)?
  Report the 5 verdicts with quotes. GO requires the audit to
  be COMPLETE (5 evenings found and judged); it does not
  require any particular reason-giving rate — the rate is the
  finding, not a bar to clear.
- DIAG-GO = census >= 20 AND unclassified == 0 AND audit
  complete (5/5 evenings judged). A GO here means "the behavior
  is measured", not "the behavior is good": a 0% turn-home
  rate on a complete census is a GO finding that names a fix,
  not a failure of the arm.
- ONE PRE-DECLARED EXPANSION (the only allowed response to a
  short census): if the pilot yields < 20 episodes, run
  EXPANSION seeds 97109–97116 (same policy, horizon, instrument)
  and judge the pooled 16-seed census against the same >= 20
  bar. After the expansion, judge — never expand again, never
  lower the health threshold, never widen the away test, never
  extend the horizon to manufacture episodes. Lowering hp <= 7
  mid-run to manufacture episodes is FORBIDDEN; if the census
  still falls short, report INSUFFICIENT-DATA and write the
  threshold question under metric review.
- INSUFFICIENT-DATA = pooled (pilot + expansion, if run)
  census < 20, or fewer than 5 stay-out evenings found in the
  pooled corpus. Report as such; no turn-home rate is claimed
  on a short census (a rate may be shown as descriptive only,
  labelled short-census, never as the verdict).
- §15 BALANCED PANEL — DECLARED INAPPLICABLE (before the
  pilot, not after the fact): this is a single-cell instrument
  census on pristine master with no behavior change, no armed
  cell, and no before/after comparison to run a panel over.
  There is no delta for scripts/balance-panel.js to compare,
  and fabricating a compare file would be dishonest. If a
  future fix arm runs, the panel becomes mandatory for it.

## SENSE TEST (after pilot, before verdict)

Read transcripts of stay-out evenings and turn-home days and
judge whether the behavior reads as a person making a choice
(reasons, consequences) vs robotic repetition. Quote, don't just
count: at least one quoted stay-out evening and one quoted
turn-home (return line + surrounding beats) in the evidence,
judged against the episode's own snapshot (purpose, clock,
hp, last hurt).

## PROOF TEST (green before any pilot claim)

scripts/test-hurthome-a.js — fixture/state tests, zero game
change:
(a) classifier buckets are exhaustive and exclusive over
synthetic episode streams (same-day, next-day, later-return,
died-away, censored-stayed, censored-early — each lands in
exactly its bucket; death-before-return priority holds when
both fire in one part);
(b) dawn sampler opens exactly one episode per trip (heal +
rehurt on the same trip extends, never re-opens; a new trip
after a return opens a new episode);
(c) instrument wrappers consume no RNG and write no game
values (seeded RNG stream identical across N dawn samples +
return scans on fixture state; health/away records
byte-identical before/after).
Live determinism leg (in the sweep run log, not the proof
test): seed 97101 run twice with the instrument; per-seed
JSONs byte-identical except ms.

## VERDICT RULES (§14 — a miss is NO-GO, never re-scored)

- DIAG-GO (census >= 20, unclassified == 0, audit 5/5) →
  evidence + instrument + corpora land on this branch as
  measurement; the suggested fix (if any) is DOCUMENTED as
  the named next arm only. No src/js lands from this arm.
- INSUFFICIENT-DATA (pooled census < 20, or < 5 stay-out
  evenings) → report as such; no rate verdict, no fix claim.
- A miss on unclassified > 0 is an INSTRUMENT failure, not a
  game finding: fix the instrument, re-run the affected seeds
  only, and say so. Never re-score the census to hide it.

## METRIC REVIEW (to be filled in the evidence file, not here)

Reserved: whether the dawn (vs meal-time) episode definition,
the trip-keyed (vs hurt-spell) episode unit, and the >= 20 bar
were the right instruments, judged AFTER the pilot — never
revised mid-pilot.
