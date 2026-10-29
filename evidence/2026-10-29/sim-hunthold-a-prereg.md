# sim-hunthold-a — PREREGISTRATION (binding, committed BEFORE any judged run)

Run: build-gaps, arm build-pickdepart.
Axis: scale-onramp (blocking axis, converging, NOT converged).
Worker: build-pickdepart.
Assignment: HUNT-HOLDS-THROUGH-DANGER lever candidate (SECOND step from
sim-pickdepart-a, AFTER the sim-departhold-a recorder DIAG-GO).
POLICY-SIDE ONLY, zero src/js, default OFF: HUNTHOLD=1 is the only
on-switch. Unset, the lever installs nothing and the engine runs
byte-identically (proven by the fixtures' env-gate proof, not
asserted). A GO verdict means GO CANDIDATE as an instrument,
default-OFF only — landing this as live game behavior is a
coordinator/Steve call, NOT made by this arm. No default flips.

## Canon read first

docs/CANON.md, then docs/MONSTER-WAVES.md (wave law) and the prior
evidence in this worktree: evidence/2026-10-29/sim-pickdepart-a.md
(+ sim-pickdepart-a-prereg.md) and sim-departhold-a.md (+
sim-departhold-a-prereg.md, + departhold-a-analysis.json).
CANON GAP (restated from pickdepart/departhold, not invented):
no CANON-registered doc covers departure gates, the daily pick
lottery, travel-to-known-monsters, or field-fight returns.
docs/MAP.md covers the map/travel surface generally, not these
gates. The mechanism below is derived from code, verified by
reading src/js/villager-objectives.js (objMaybeDepart, objDanger,
objTightenOrDefer, objHealGate, objDepart, objPick, objTick)
before this prereg was written. Nothing here is invented canon.

## The recorder verdict this lever is designed from (not re-litigated)

sim-departhold-a DIAG-GO, all four legs pass, on the fresh band
(seeds 75101-75108, tableseat-nowait substrate, 180d death-aware):

- Primary universe: 2 wave-4 HUNT picks (both seed 75106, eulogy,
  d135 part 536). One superseded by a needs pick (EAT, part 539,
  0 departure evaluations); one departed pick-linked (d137
  part 544, after 5 sick-held evaluations, then danger go/1).
  ZERO wave-4 overwrites; wave4OverwrittenEvals = 0;
  wave4Evals = 6, other = 0, otherHeld = 0,
  overwriteWithoutVerdict = 0, orphanOverwrites = 0.
- The overwrite mechanism itself is PROVEN REAL on non-wave-4
  picks: 2 recorded tighten-overwrites, both seed 75106,
  villager visjoin_102, murkcap wave 1 — d108 part 429 danger
  tighten/4, and d109 part 432 danger tighten/5 — each replacing
  a HUNT with a HAVEN_CHORE indoor, with full verdict chains.
  In the base game neither overwrite leaves a pick record, a
  departure record, or a narration line.
- Leg 3 answered on branch (b): zero wave-4 overwrites AND
  every primary pick's fate explained by recorded events. The
  fresh band did NOT reproduce the nikos d173 chain, and no
  wave-4 pick met a non-'go' danger verdict in it.

DESIGN CONSEQUENCE, STATED PLAINLY: the lever's premise is NOT
"wave-4 hunts are being killed by danger overwrites in the
measured band" — the band shows zero of those. The premise is
the narrower, code-proven one: the overwrite path is
wave-blind (objMaybeDepart -> objDanger -> objTightenOrDefer /
inline defer overwrites a HUNT on ANY non-'go' verdict,
regardless of wave), it fired twice on wave-1 hunts with
tighten verdicts, and the pickdepart inference (a wave-4 hunt
vanishing between pick and dawn re-pick) names exactly this
path. A lever that holds HUNTs through moderate danger
therefore addresses a proven mechanism on the exact code path
a wave-4 hunt takes — but its wave-4 effect must be PROVEN
by this run's own chains (a held-then-departed wave-4 pick),
not assumed from the wave-1 sightings. If no wave-4 pick is
held and then departs, the pilot fails its mechanism leg even
if wave-1 holds abound. That is the guard against building a
lever chasing a non-mechanism for wave-4.

## The lever (exact rules, fixed before any judged run)

Plain words first: a villager who decided to go back for a
beast, and finds the road looking moderately dangerous, now
WAITS instead of quietly swapping the hunt for housework.
They stay home, the hunt stays decided, and the danger check
runs again next part. They walk only when the check says go.
When the danger is severe, they still stay home and take
indoor work, exactly as before. And the wait ends: after
about two days of waiting, if the danger still has not
eased, they give up and take indoor work exactly as before.
Nothing here marches anyone into danger, and nobody waits
forever.

Rules (scripts/policies/hunthold.js, HUNTHOLD=1 gated):

1. SCOPE: pre-ready HUNT objectives in objMaybeDepart only
   (pre.kind == 'HUNT', pre.state == 'ready'), any wave.
   The overwrite code is wave-blind, so the lever is
   wave-blind too; wave-4 is the judged universe, all-wave
   is the secondary census. The player's own departures do
   not run through objMaybeDepart and are untouched.
2. HELD VERDICTS: 'ask' (score 2-3) and 'tighten' (score 4-5)
   ONLY. On a held verdict with budget left, the lever
   returns early WITHOUT calling the engine: the objective
   stays 'ready' with its hunt fields untouched, no RNG is
   drawn, no departure happens, no overwrite happens, and
   the danger check runs again next part. The hold is NOT
   courage and NOT a march: no held villager departs on a
   non-'go' verdict, ever.
3. NEVER HELD: 'go' (engine departs, as before) and 'defer'
   (score 6+, engine overwrites to indoor work, as before).
   Defer means stacked recent violence (attacks, deaths,
   raid warnings) — a person stays home; waiting does not
   change that. An unknown verdict is never held: the lever
   delegates to the engine.
4. ENGINE EARLY RETURNS UNTOUCHED: sick, away, engaged,
   agency-owned, heal-sat-out-earlier-today, or not at
   haven — the lever delegates to the engine and consumes
   NO hold budget. The hold budget is spent only on a real
   danger verdict rendered for a villager standing at haven.
5. BUDGET: at most 6 held evaluations per picked objective
   (MAX_HOLD = 6 — about two days of departure checks; the
   sick-hold precedent in the recorder band is 5 held
   evaluations over two days, then a go departure). The
   counter rides the objective as o.dangerHold and is
   cleared by every fresh objPick, so a new decision never
   inherits an old wait. On the 7th ask/tighten evaluation
   the lever delegates to the engine, which overwrites
   exactly as before; the villager then does indoor work
   and may decide fresh at dawn, including re-picking the
   hunt while it is still offered (age 0-3). Exhaustion
   restores base behavior — it adds no new terminal state.
6. NARRATION (canon: no silent actions): on the FIRST hold
   for an objective, and only when the player is at haven,
   the villager says one waiting line naming the beast by
   village descriptor (monsterDisplayName, via
   articlePhrase when available). Later holds for the same
   objective are silent — a held hunt must not spam the
   log every part. The line is a narration write only; it
   draws no RNG and moves no game state.
7. WHAT THE LEVER DOES NOT TOUCH: pick weights, the offer
   window (age 0-3), the heal gate, the ask-companion rule
   (a HUNT still never drags a companion — perception law:
   the companion has not seen the beast), the departure
   gates' age-blindness (a held hunt may still depart
   stale, as a sick-held hunt already could), or any gate
   retune (gating freeze stands). Needs picks are not
   overridden: a held objective is 'ready', and 'ready'
   objectives are never re-picked by dawn or mid-day
   re-pick — exactly as a sick-held objective already
   behaves — and the budget bounds the wait; the
   held-starvation guard below scores whether any holder
   starves while holding.
8. DOCUMENTED SCOPE LIMIT — FRESH-PICK-IN-CALL HUNTS ARE
   NOT HELD: when objMaybeDepart picks a fresh HUNT inside
   its own re-pick branch (idle/done -> objPick -> danger
   in the same call) and the verdict is non-'go', the engine
   overwrites it in that same call and the lever does not
   restore it. Restoring would require reconstructing the
   fresh objective's clock (partsLeft = 2*hdist+3) from
   overwritten fields — a guess, not a hold. The observed
   overwrite population justifies the scope: both proven
   overwrites in the recorder band were pre-ready
   evaluations (pick part 428 -> eval 429; pick part 431
   -> eval 432), not fresh-pick-in-call overwrites. The
   analyzer reports fresh-pick-in-call overwrites
   separately, so this limit is measured, not hidden. A
   HUNT picked by objTick's mid-day decision-gap pick, or
   at dawn, IS a pre-ready objective at its next departure
   evaluation and IS held — the nikos pattern as inferred
   (d173 part 690 pick, vanishing before the d174 dawn
   pick) is a pre-ready pattern, not a fresh-pick-in-call
   pattern, on the parts available.

PERCEPTION LAW: the lever reads only the villager's own
objective and the engine's own danger verdict for that
villager's own hunt tile. No roster, snapshot, or list is
consulted; no companion is asked (HUNT never asks); no
live-monster lookup exists. The danger verdict's gossip
input is the engine's pre-existing input, not a new feed.

## Fresh bands (this arm's own corpora, OFF vs ON)

- Seeds 75101-75108 (8, pilot) — the departhold band
  verbatim. scripts/policies/tableseat-nowait.js VERBATIM,
  LEANLINKRESCUE=1, TABLESEATNOWAIT=1, FIELDPARTY=1,
  RETURNS=1, FUNNEL=1, DEPARTHOLD=1 IN BOTH CORPORA (the
  recorder is the instrument and must run in both), 180d
  death-aware, competent policy tableseat-nowait.
  Sweep script (new): scripts/test-hunthold-a-sweep.js
  (adapted from test-departhold-a-sweep.js, same resume +
  flap-patient write + read-back verification discipline).
  Install order in the sweep: hunthold FIRST, then the
  recorders — so the departhold recorder wraps OUTSIDE the
  lever and records held evaluations. A held evaluation
  records as the recorder's 'other-held' action (post still
  'ready', danger present, no heal sat-out); the analyzer
  maps other-held + ask/tighten danger to held-by-lever
  (see below). Delegated evaluations in the ON corpus may
  carry a duplicated danger record (the lever's pre-check
  plus the engine's identical re-check — objDanger is
  pure: it reads gossip/weather/distance/temperament/goal
  and writes nothing, so the two records agree exactly);
  the analyzer dedupes exact duplicate danger records
  (same verdict, same score) and uses the first.
- TWO corpora on identical current-master code:
  evidence/2026-10-29/perseed-hunthold-off/ (HUNTHOLD unset
  — the before-leg) and evidence/2026-10-29/
  perseed-hunthold-on/ (HUNTHOLD=1 — the after-leg). The
  lever policy file is committed BEFORE either sweep runs,
  and nothing else is committed until both sweeps +
  analysis are done (lottery contamination lesson).
- The judged baseline is the fresh OFF sweep, NOT the
  departhold corpora: master has moved since the recorder
  landed, so the departhold-ON corpus is reported as a
  drift comparison only, never as the judged baseline.
- CONFIRM (seeds 75101-75116, 16) ONLY if the pilot
  passes every leg below AND time remains; a pilot verdict,
  GO or NO-GO, is a complete result either way. The
  confirm bar is stricter (see below): the pilot proves
  the mechanism, the confirm proves the effect size.

## Primary universe and taxonomy (binding)

PRIMARY UNIVERSE: every pick record in the ON corpus whose
chosen.kind == 'HUNT' and whose chosen.huntMid maps to a
wave-4 monster in src/data/monsters.json. Each such pick
gets EXACTLY ONE class by the departhold priority order
(departed-pick-linked, died-before-departure,
overwritten-danger, superseded-by-needs-pick,
candidate-null-after-pick, superseded-by-re-pick,
held-ready-at-end, gate-blocked, horizon, unknown),
adapted ONLY as follows (all adaptations pre-registered
here, before seeing any ON number):

- HELD-BY-LEVER: an evaluation with recorder action
  'other-held' whose danger records are non-empty and
  every record's verdict is in {ask, tighten} counts as
  a lever hold. (The engine alone never produces
  other-held with a danger record: on 'go' it departs,
  on non-'go' it overwrites for HUNT, and the heal
  sat-out path records held-ready/heal-sat-out instead.)
  A pick's chain notes: heldLeverEvals (count),
  heldThenDeparted (class departed-pick-linked AND
  heldLeverEvals > 0 before the departure),
  heldBeforeOverwrite (class overwritten-danger AND
  heldLeverEvals > 0 before the overwrite — the budget
  exhausted, base behavior restored).
- A pick with heldLeverEvals > 0 and no later pick, no
  linked departure, no overwrite, alive at corpus end,
  classes as held-ready-at-end with the lever flag (it
  survived to the end still waiting under the lever).
- UNEXPLAINED other-held: any other-held evaluation whose
  danger records are empty, or contain a verdict outside
  {ask, tighten} (defer, go, unknown), is unexplained and
  breaks the instrument leg (P3). In the OFF corpus ANY
  other-held evaluation on a wave-4 HUNT objective is
  unexplained (the lever is off; the engine should never
  produce one) and likewise breaks P3.

SECONDARY CENSUS (reported, not judged, except the
held-starvation guard which spans all waves): the same
taxonomy + held annotations applied to ALL HUNT picks
(all waves) in the ON corpus; the per-pick verdict chain
for every primary-universe pick, quoted in the evidence;
the departhold-ON drift comparison (primary universe +
departed counts, reported, not scored).

## Pre-registered GO threshold — PILOT (binding; a miss is NO-GO)

PRIMARY METRIC: pick-linked wave-4 HUNT departures, with
the mechanism proven by chains, not by counts alone. PILOT
GO iff ALL of:
  (P1) MECHANISM: at least one ON primary pick has
      heldLeverEvals >= 1 AND is class departed-pick-linked
      with the departure AFTER the hold(s) — the
      held-then-departed pattern, observed in a chain.
      Wave-1 holds alone never satisfy P1.
  (P2) COUNT NOT WORSE: ON primary departed count >= OFF
      primary departed count. (Pilot n is tiny — the
      pilot proves the mechanism exists; the confirm
      band, below, is where strict improvement is judged.)
  (P3) COMPLETENESS + INSTRUMENT: 100% of ON primary
      picks classified into a named mechanism, ZERO
      'unknown'; ZERO unexplained other-held evaluations
      on wave-4 HUNT objectives in EITHER corpus; every
      wave-4 HUNT objective evaluation in the ON corpus
      carries its danger verdict or a named no-attempt
      reason (no recorder action 'other'); every ON
      'overwritten' evaluation carries a danger verdict +
      subtype.
  (P4) RECORDER/LEVER HYGIENE: diag errs == 0 and
      overflow empty in every row for every recorder
      (fieldparty, returns, funnel, departhold) and the
      lever store (hunthold errs == 0), in BOTH corpora;
      the recorder is installed in both corpora; the
      lever store is present in ON rows and null in OFF
      rows.
  (G1) STARVATION: starvationDeaths ON <= OFF (totals
      across the band).
  (G2) WALL: wins ON >= OFF wins; wave-4 reach ON >= OFF
      wave-4 reach (counts of seeds reaching wave 4).
  (G3) NO NEED-OVERRIDE STARVATION: zero held villagers
      starve while holding, any wave: no ON HUNT pick
      (any wave) with heldLeverEvals >= 1 has its
      villager die of starvation while the pick is still
      open (no linked departure, and no later pick with
      day strictly before the death day). Day-granular,
      as the deaths channel is; a same-day later pick
      does not clear the guard.
  If the primary universe is empty in either corpus, the
  verdict is INSUFFICIENT-DATA, not GO — an empty
  universe proves nothing about the mechanism.
Departures and meetings are judged as OUTCOMES (counts
reported alongside), NEVER as take-rate over
trajectory-dependent triples as primary (lottery metric
review).

## Guards / reported (NOT re-scored into PILOT GO)

- MEDIAN SURVIVAL: median days per corpus (OFF vs ON).
- DEATH TOTAL: deaths total per corpus (OFF vs ON).
- NEEDS SUPERSESSION: superseded-by-needs-pick counts
  (primary + secondary), OFF vs ON — the lever does not
  touch needs supersession (it holds only departure
  evaluations); a rise here is reported, not scored.
- BUDGET EXHAUSTION: heldBeforeOverwrite picks (primary
  + secondary) — the lever delaying, then losing, an
  overwrite is expected behavior, not a failure.
- FRESH-PICK OVERWRITES: overwritten-danger picks whose
  overwrite evaluation has freshPickInCall true — the
  documented scope limit, counted in both corpora.
- SENSE BAR: >= 1 full verdict chain quoted VERBATIM
  from the ON corpus (pick -> held evaluations with
  verdicts -> departure or overwrite), with a judgment
  of whether the villager reads like a person waiting
  or an errand queue idling (SENSE-TESTING LAW). The
  chain must show the hold verdicts, not just the class.

## Pre-registered GO threshold — CONFIRM (binding)

Confirm runs ONLY after a pilot GO, on seeds 75101-75116
with the identical substrate and install order, OFF vs ON.
CONFIRM GO iff ALL of: (P1) mechanism (as pilot, on the
confirm band); (P2-strict) ON primary departed count >
OFF primary departed count; (P3) completeness + instrument
(as pilot); (P4) hygiene (as pilot); (G1), (G2), (G3) (as
pilot, on the confirm band). A confirm miss is overall
NO-GO: the lever stays default-OFF, and the evidence
records a proven mechanism without a confirmed effect —
not a kill of the mechanism (kill discipline: a missed
bar is not a kill; root-cause and confirm the lever
itself is wrong before killing).

## Instruments (new, scripts/ + scripts/policies/ only)

- scripts/policies/hunthold.js: the lever (above).
  Zero src/js changes.
- scripts/test-hunthold-a-sweep.js: the two-corpus sweep
  (OFF then ON, identical seeds, resume + flap-patient
  writes + read-back verification, as in the departhold
  sweep). Row adds hunthold: the lever store
  (holds, narrated, errs, installed) or null when OFF.
- scripts/test-hunthold-a.js: analyzer (pure reads over
  both corpora + src/data/monsters.json wave lookup).
  Outputs: primary-universe pick list with class +
  held annotations + verdict chain per pick; per-corpus
  class counts; secondary all-wave census; guards;
  held-starvation check; fresh-pick overwrite census;
  departhold-ON drift comparison (reported, not scored);
  --sense prints full chains verbatim; --confirm switches
  P2 to the strict bar. Machine legs: unknown count
  asserted 0 for GO, unexplained-other-held asserted 0,
  determinism (two runs, same output), wave-lookup
  coverage (every huntMid resolved or listed
  unknown-wave). Exit 1 unless the verdict is GO (the
  analysis JSON is still written before exiting).
- scripts/test-hunthold-a-fixtures.js: lever fixtures on
  a stub engine (no harness, no RNG): OFF env-gate proof
  (HUNTHOLD unset -> methods identical, no wraps);
  go -> delegates + departs; ask -> holds (engine not
  called, objective still ready, counter 1); tighten ->
  holds; defer -> delegates + overwrites; 6 holds then
  7th delegates (budget exhaustion); sick/away/engaged/
  agency/heal-sat-out/not-at-haven -> delegates, no
  budget consumed, no danger call by the lever; unknown
  verdict -> delegates; non-HUNT / non-ready -> delegates
  untouched; narration fires once per objective and only
  when the player is at haven; objPick wrap clears the
  counter; analyzer heldByLever mapping (ask/tighten ->
  held; defer/go/empty -> not held). Exit 1 on any
  failure.

## Metric review (for the NEXT run — never a mid-run re-score)

Doubts go here in the evidence file, for the next run's
prereg. In particular: (a) whether MAX_HOLD = 6 is the
right budget, or whether the budget should count days
rather than evaluations (a villager at haven only some
parts accrues evaluations slower); (b) whether the
fresh-pick-in-call scope limit should be closed by a
restore-based hold, and what clock a restored objective
should carry; (c) whether 'ask' should stay in the held
set or whether ask-holds should ask a companion first
for non-HUNT kinds (out of this lever's scope — HUNT
never asks); (d) whether leg P2's pilot bar (not-worse)
is too weak a pilot bar when the primary universe is
n = 2, and whether the confirm band should be 16 or 24
seeds; (e) whether a held hunt should say its waiting
line every dawn rather than once per objective.
