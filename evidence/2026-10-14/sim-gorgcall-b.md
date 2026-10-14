# GORGCALL — wave-4/5 gorge call-for-help (loop B, 2026-10-14) — KILLED AT PILOT

ARM on the food-economy axis as a lens on the scale wall. POLICY-SIDE ONLY
(scripts/policies/gorgcall.js, GORGCALL=1, default OFF) — no game-code
changes. Answers sim-findings "WAVE-4/5 LINGERERS ARE UNDRIVABLE (steve-call)"
with measured evidence; does NOT presume the design answer.

The question: wave-4/5 lingerers gorge Haven's pantry at the treeline
(havenGrowth.js havenGrowthDaily: 500–1500 kcal/night via raidPillage) and
the beat says "Drive it off, or call for help." Combat can't answer them
(0/17 drive-off kills, sim-predation-b.md). The gorgedrive arm answers
waves 1–3 with combat; "call for help" measured 0/24. This arm plays the
lever: on a gorge night with a lingering wave-4/5 monster, the scholar
CALLS FOR HELP via the existing comms.js tiers (runner / signal / system —
cry deliberately excluded, build-gated; honest costs only, never free)
instead of fighting it alone. Tracked end to end: help summoned, help
ARRIVES, gorge episodes ended, kcal saved. Wave-4/5 only — never touches
wave-1/3 answering (gorgedrive owns that).

## Pre-registered header (docs/MEASUREMENT.md §§9–12, 14)

- **Primary metric**: share of wave-4/5 gorge episodes with ≥1 help arrival
  while the episode is live (armed runs), plus armed w4/5 gorged kcal vs
  identical-seed baseline.
- **GO threshold**: ≥4 wave-4/5 gorge episodes on the 8-seed pilot AND ≥50%
  arrival share AND armed w4/5 gorged kcal ≤ baseline − 2× the A/A spread,
  plus guardrails (national ≥ baseline − 2; wave-5 ≥ baseline − 1;
  median survival REPORT-ONLY). Else KILL AT PILOT.
- **A/A noise-floor calibration** (sharepol finding): two invocations per
  side on identical seeds; the bar is ≥2× the measured A/A spread. Here the
  A/A pair is leg A (baseline) vs leg B (armed-but-unfired): 8/8 per-seed
  identical → spread 0, det-gate PASSED, comparisons trustworthy.
- **Horizon**: 180d death-aware (same as r26/r27/predation censuses so the
  numbers are comparable). Why: wave-5 unlocks land ~d57–116; the gorge is a
  post-unlock phenomenon. Dead villages stop simulating (+10d tail max).
- **Seeds**: 11/22/33/44/55/66/77/88 (standard set), identical seeds
  before/after.
- **Policies**: leadfeast (leadcourt + FEASTSCALE_R13=1 — the wave-5 road)
  baseline vs leadfeast+gorgcall (GORGCALL=1). Gate-off proven byte-identical
  to raw leadfeast (proof PART 2; SMOKE gate).
- **Pre-screen** (before fixing GO): 8 seeds × leadfeast × 180d → 1 wave-4/5
  episode (s44, sub-day, 0 gorge nights). <4 → per the brief, a constructed
  scenario (deterministic gorge-night fixture) proves the mechanism end to
  end, and the pilot measures reachability on the road.
- **Convergence report**: killed-at-pilot.

## The answer layer (scripts/policies/gorgcall.js)

Opt-in via GORGCALL=1, default OFF. On a day with a live lingering wave-4/5
entity (entity-tracked per the LINGERER DRIFT finding; wave resolved from
the def per ENTITY-WAVE-MISSING):

1. Ensure the door is real: `Game.raiseAidCrisis(name, wave)` only when no
   crisis is active (player-declared, reactive — the gorge beat is the
   trigger; raids normally raise their own first).
2. `Game.callForHelp(tier)`: system relay when `integrationStage() >= 2`
   (instant, all links; garbled + a favor owed), else signal fire (fast;
   smoke draws company, hostile eyes read it). Runner is the ESCALATION:
   if the episode still lives 2+ days after the first call with no help
   arrived and none marching, a runner goes to the highest-trust link
   (slow, real road danger).
3. Never re-call under an answered door (help marching or at the door —
   calling again would stack parties and favors owed against one monster).
   One call per monster per day; no re-call for the same entity within 2
   days. No links → no call, said aloud. The policy's own raised crisis is
   resolved ('moved-on') when the episode ends — a lingering generic crisis
   would BLOCK a later raid's crisis (one at a time; raid crises carry
   crisis.raiders → the-siege beat). Table sanctity honored; never clobbers
   a live fight/pending encounter; never calls asleep/in the tent.
4. The policy NEVER fights and never presumes the arrival ends the gorge.

Proof: scripts/test-gorgcall-20261014.js — **35/35 GREEN** (real RED:
gate-off invokes callForHelp 0×, no crisis raised, gorge beat pristine;
non-aggression: gate-off byte-identical to raw leadfeast over 20d; GREEN:
wave-5 lingerer → crisis + exactly one callForHelp with an honest tier,
cost named aloud, wave-2 lingerer untouched, once-per-day hold;
ARRIVAL: help arrives with named faces or every ask refuses aloud;
ESCALATION: unanswered episode → runner, once per episode).
SMOKE=1 instrument-honesty gate passes (fails loudly if the suite ever runs
policy-less).

## RESULTS

### Pre-screen (leg A: leadfeast × 8 seeds, 180d)

1 wave-4/5 episode in 8 runs: s44 day-99 Cancellation, sub-day
(firstDay=lastDay=99), 0 gorge nights, resolution drive-failed — raided at
night, engaged and driven off before the first dawn gorge loop. **The
phenomenon the arm targets does not occur on this road**: wave-4/5
lingerers here never survive to a gorge night. (Predation's 24-run sweep
found 2 w5 gorge episodes on fifthlink; the leadfeast 8-seed road gives
~0.)

### Pilot (leg B: leadfeast+gorgcall × 8 seeds, identical seeds)

The policy never fired (0 calls, 0 arrivals, daysSaw=0 on all 8 seeds) —
the one s44 episode was sub-day and already being answered by contact when
any daily could see it. **8/8 per-seed numbers identical to baseline**
(survDays, endReasons, waves, ranks) — the layer is provably inert on this
road: no effect, no harm, no perturbation. Guardrails all hold trivially.

| | baseline (A) | armed (B) |
|---|---|---|
| national | 4/8 | 4/8 |
| table seeds | 2/8 | 2/8 |
| wins | 0/8 | 0/8 |
| wave-4 / wave-5 | 4 / 3 | 4 / 3 |
| median / max survival | 123d / 165d | 123d / 165d |
| w4/5 gorge episodes | 1 (0 nights) | 1 (0 nights) |
| w4/5 gorged kcal | 0 | 0 |
| help calls / arrivals | 0 / 0 | 0 / 0 |
| ends | 8/8 village-lost | 8/8 village-lost |
| instrument errors | 0 | 0 |

### Constructed scenario (deterministic gorge-night fixture)

scripts/scenario-gorgcall-20261014.js — seed 42, 30d lived-in leadfeast,
fixture link (engine's own _formLink, trust 65), pantry stocked, a wave-5
Cancellation pinned at the treeline with the scholar moved off-tile (the
harness auto-resolves contact encounters). 14 days, armed policy.
Raw: evidence/2026-10-14/gorgcall-scenario.json.

- **Help summoned**: 1 call, day 32, tier system (stage 3), "relayed".
  (An earlier policy revision called 3× in 4 days — stacking parties and
  favors against one monster; fixed same-run: no re-call under an answered
  door. Proof re-run 35/35.)
- **Help ARRIVES**: day 33 — "🥁 Darius Haddad of Emberhold walks in with
  4 — Darius Haddad. 'We're here. Where's the teeth?' (They showed up.
  Trust remembers.)"
- **Gorge episodes ended by help: 0.** The gorge continued 7 nights
  (d32–38) WITH help at the door from d33: 7,980 kcal gorged. Episode
  resolution: moved-on (the valve), not answered.
- Refusals read aloud with reasons (Stonebridge, trust < ask: "Stonebridge
  has its own mouths. We're sorry. Truly." / "We don't believe the teeth
  are that big.").
- The policy's raised crisis was created and resolved tightly (1/1) —
  no raid-crisis theft.

### GO verdict — KILL AT PILOT

- Episodes on the pilot: 1 < 4 → **KILL per the pre-registered bar.**
- The constructed scenario sharpens the kill: the aid chain DOES answer
  apex lingerers (call → arrival, both honest and legible), but the answer
  doesn't end the gorge — arrived help stands at the door while the
  monster eats (aidFight is dormant in production; nobody routes the party
  into the lingerer). The lever fails its purpose twice: unreachable
  trigger on the road, ineffective answer when triggered.
- Guardrails: no regressions anywhere (8/8 identical).

Per the brief, the mechanism proof (35/35) + the gap documentation IS the
blank filled — it feeds the steve-call item (see Blanks).

## Reachability verdict

- Waves 1–5: unlock on the road (w4: 4/8, w5: 3/8 seeds both legs).
  Wave-4/5 *gorge episodes*: effectively unreachable on leadfeast (1
  sub-day episode, 0 gorge nights, 16 runs) — the s88 hollow does not
  reproduce here.
- Arc reach: not instrumented on this arm (no arc tracking in the sweep).
- National 4/8, table 2/8, wins 0/8 — identical both legs.
- Death-cause shares: not instrumented on this arm; all 8 ends
  village-lost both legs (median 123d).
- The "call for help" verb IS reachable end to end (constructed scenario:
  call → march → arrival with named faces, costs charged: tickAction,
  attracted+1 on signal, favor owed on system, aidDebtKcal/trust on
  acceptance, road danger on runner). What doesn't exist is the apex
  *answer*: no production path routes arrived help into the lingering
  monster.

## Village assessment

Sixteen villages, sixteen scatterings (8/8 village-lost both legs, median
123d, max 165d). The road's story: early collapses (s11/s66/s77/s88 dead
by d47–53, waves 1–2, village/regional) and long grinds (s22/s33/s44/s55
to d123–165, waves 4–5, national/global, 2 table seeds, 0 wins). Nobody
wins; the wall numbers (national 4/8, table 2/8) match the predation
baseline. The gorge never figures in any village's death on this road —
the pantry-predation hollow is a fifthlink phenomenon, not a leadfeast
one. Who thrived: villages that reached national/global lived 2–3× longer
but still scattered; who died: the depleted early. What was missing is
not the call verb (it exists and fires honestly) but any *fighting*
answer at the apex — the villages that met a wave-5 lingerer fought it
personally and lost (0/17), or endured it.

The scenario village (seed 42, 44 days): the call went out on day 32
("◈ Cheryl begs the System to carry a call against the lingering The
Cancellation — the relay is enthusiastic and already translating. A favor
will be owed. That's the price of being carried."), Emberhold answered
with a named party on day 33, Stonebridge refused aloud twice with
reasons — and the Cancellation ate 7,980 kcal over 7 nights anyway while
its would-be rescuers stood at the door. The fiction holds; the
mechanics don't cash the beat's promise.

## Sense-testing (read the beats, not just the counts)

- The decision lines read as a village deciding, costs named, never a
  meter: signal ("Hostile eyes will read it too, and the treeline will
  crowd. That's the price of being heard."), system ("A favor will be
  owed. That's the price of being carried."), runner ("The beacon bought
  nothing. The road is dangerous and the runner is gone from Haven's
  hands. That's the price of the second try."), no-link ("No linked fire
  to call to — but no fire is linked. The beacon stays dark. Haven stands
  alone.").
- Arrivals read as people: "🥁 Darius Haddad of Emberhold walks in with
  4 — Darius Haddad. 'We're here. Where's the teeth?' (They showed up.
  Trust remembers.)"
- Refusals read as decisions with reasons, trust numbers named: "trust 30
  < ask 35" said aloud; "We don't believe the teeth are that big. Come
  back when they are."
- The gap the beats expose: after "We're here. Where's the teeth?" —
  nothing. No fight, no plan, no standing-down. The help waits at the
  door while the gorge beat fires nightly. That silence is the finding.

## Blanks filled / documented

- **WAVE-4/5 LINGERERS ARE UNDRIVABLE (steve-call)** — fed, not closed:
  (a) the aid chain DOES scale to apex lingerers as a *summons* (call →
  arrival proven 35/35 + constructed scenario), but (b) the arrival does
  not end the gorge — aidFight is dormant in production and no path routes
  arrived help into the lingerer; (c) on the leadfeast road the trigger
  condition itself barely occurs (1 sub-day episode, 0 gorge nights, 16
  runs). The design question sharpens: the beat promises two verbs;
  combat is measured 0/17 and the call is measured reachable-but-
  ineffective. If the apex lingerer is meant as an unanswerable siege,
  the beat should say "Endure it"; if call-for-help is the intended
  answer, the arrival needs a fight path (aidFight or equivalent).
- **Documented, not chased**: (a) re-call spam — the first policy revision
  stacked 3 system relays in 4 days against one monster (3 favors owed, 3
  parties); fixed same-run with the answered-door hold. Any future
  caller-side lever needs the same guard. (b) Trust calibration for apex
  asks: aidAskVillage at wave≥3 needs trust ≈57+ for signal to have any
  acceptance chance (score = trust + R·24 − 12 − 10 − 5 ≥ 45) — the aid
  chain's apex answer is gated on high-trust links, not just any link.
  (c) A policy-raised generic crisis BLOCKS a later raid's crisis
  (raiseAidCrisis: one at a time) and steals its crisis.raiders path —
  the tight crisis lifecycle (resolve when the episode ends) is load-
  bearing, not cosmetic.

## Metric review (§14)

The pre-registered GO binds and the run is judged against it: KILL AT
PILOT (1 episode < 4; arrival share unmeasurable on the road). For the
NEXT run on this question: (1) the road matters more than the seeds —
  leadfeast's 8-seed set produces ~0 gorge nights; the phenomenon lives on
  fifthlink (2 episodes/16 runs) or in constructed scenarios. Pre-register
  the road, not just the seeds. (2) "Episodes with arrival" was the wrong
  primary — arrival is necessary but not sufficient; the decision-relevant
  metric is *gorge nights after arrival* (did the answer end the episode?).
  (3) The A/A pair (baseline vs armed-unfired, 8/8 identical) doubled as
  the det-gate and the no-harm proof — a cheap pattern worth reusing for
  any never-firing layer.

## Repro

- `SMOKE=1 node scripts/sweep-gorgcall-20261014.js` (instrument-honesty gate)
- `node scripts/test-gorgcall-20261014.js` (35/35)
- `POLICY=leadfeast SEEDS="11,22,33,44,55,66,77,88" DAYS=180 OUT=evidence/2026-10-14/gorgcall-A.json node scripts/sweep-gorgcall-20261014.js`
- `POLICY="leadfeast+gorgcall" SEEDS="11,22,33,44,55,66,77,88" DAYS=180 OUT=evidence/2026-10-14/gorgcall-B.json node scripts/sweep-gorgcall-20261014.js`
- `node scripts/scenario-gorgcall-20261014.js` → evidence/2026-10-14/gorgcall-scenario.json
- Commits (worktree sim-gorgcall-b): eee65bbb (policy + proof), ae31212a
  (sweep driver + SMOKE), f2c19833 (answered-door hold + escalation proof
  + scenario). Policy-side only; default OFF; nothing to land — killed arm.

## Wall numbers (this run)

| policy | seeds | national | table | wins | wave-4 | wave-5 | median surv |
|---|---|---|---|---|---|---|---|
| leadfeast (A) | 8 | 4 | 2 | 0 | 4 | 3 | 123d |
| leadfeast+gorgcall (B) | 8 | 4 | 2 | 0 | 4 | 3 | 123d |
