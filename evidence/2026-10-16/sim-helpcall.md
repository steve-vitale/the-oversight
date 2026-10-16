# sim-helpcall — engaging the aid system on apex raids (2026-10-16)

Run: fleshout-20261016T1715Z · axis: scale-onramp · arm: sim-helpcall.
Worker: village assessor. Policy-side only — zero src/js changes.

## Pre-registration (BINDING — docs/MEASUREMENT.md §§9–12, 14)

- **Primary (diagnostic GO):** ≥1 aid engagement (accepted help leading to
  aid arrival, OR refusal with attributed reason) on called apex raids,
  with 100% attribution of every help call placed.
- **Secondary (lever read):** raid-attributed deaths armed vs control
  (raid marker = havenRaidTick's `opts.raid` or the raiders' `m.lingering`
  — the fieldfightsrc recipe, engine markers not reconstruction).
- **Guardrails:** no new death mode (aid-runner road deaths are an
  engine-existing mode the arm engages — counted separately, never hidden);
  national ≥ control−2; median survival ≥ control−10d; no aid-system errors.
- **Horizon:** 180d death-aware (the loop stops early on village death;
  +10d tail max per harness convention). **Seeds:** 8 fresh [951–958]
  (verified 0 `-s<seed>.` filename hits across evidence/ before running).
  **Roads:** leadfeast, belongfeast (tribfloor). **Arms:** control
  (TF.leadfeast/TF.belongfeast) vs armed (same base + helpcall layer).
  **Substrate:** SEATDRIVE=0 explicit (pre-seat courtship),
  FEASTSCALE_R13=1, NODEWITNESS=1. HELPCALL=1 is the only switch.
- **Decision rule:** if PRIMARY GO and the lever signal is positive, name
  the 16-seed confirm as the next step — do NOT confirm in-run. If the aid
  system never engages, KILL the arm per protocol (delete the layer, keep
  instruments + evidence) and document why.

## Canon read

No dedicated raids/aid canon doc exists (CANON.md's manifest lists
DISEASES/BEAR/PRESERVATION/MONSTER-WAVES/CONTESTS/etc. — none covers the
call-for-help chain). Per the brief, I state that instead of inventing:
the design authority is the engine's own ontology header
(src/js/comms.js: the four tiers, honest costs, refusals aloud/fast, the
wave≥3 apex penalty in aidAskVillage) plus PROGRESSION.md "When a monster
shows up at your door" (runner / signal / system relay / cry) and the
DESIGN.md 2026-10-10 survival-safety-nets entry (neighbor-village aid
flows: real runner, real decision, real deliveries from finite neighbor
pantries; the request move is knowledge-gated).

## The arm

`scripts/policies/helpcall.js` — a composition wrapper in the
withSeatDrive pattern (`withHelpCall(base, id, desc)`), HELPCALL=1,
default OFF. On an apex raid crisis (`crisis.raiders && crisis.wave ≥ 3`,
no call placed yet) it calls `Game.callForHelp('runner', {})`.

Tier choice — runner — is argued from canon, not taste: comms.js's own
`signal_is_indiscriminate` rule says the beacon draws company and blocks
fleeing while its attention holds; lighting it on an apex raid is the
opposite of competent play. The runner is targeted (nearest linked
village), its costs honest and attributable (road danger incl. death —
registerDeath cause `aid-runner`; real march day-parts; the far end's
decision said aloud, fast). System relay is integration-gated and
garbled; the cry is build-gated. A later arm can compare tiers against
this baseline.

Attribution design (the primary metric's hard requirement): every
placement is recorded to `Game.state.hcLedger.calls` — engine-true, read
back from the tail `crisis.calls` entry (`{tier, day, part, targetId,
runner, result}`), never reconstructed. Every `aidAskVillage` verdict is
recorded to `Game.state.hcLedger.verdicts` via a call-through wrapper
installed once per Game, only ever on the placement path (gate-off
installs nothing). Verdicts match placements by (via='runner',
villageId=targetId, day ≥ placement day), oldest first. Outcome buckets:
accepted → pendingHelp → aidHelpArrived (`aid-arrived:` ledger events);
refused (the engine's own say taxonomy); runner-died (ret `died`);
nolink / hot / no-runner (engine returns); en-route-at-run-end (runner
still on the road when the horizon ends — a placement at the run's edge
whose verdict never had a day to fire, e.g. leadfeast-s951 day 181 of
182). Exactly one placed call per crisis (`crisis.calls.length===0`
gate); non-placement returns re-attempt honestly (the engine speaks each
time; links can form mid-crisis) and are recorded as attempts, never
phantom placements.

## Proof (scripts/test-helpcall-20261016.js) — 20/20 GREEN

- Unit (fake Game): apex-only firing; gating taxonomy
  (no-crisis/resolved/not-raid/sub-apex/already-called) all classified;
  gate-off = pure delegation with zero trace (no call, no hook, no
  ledger, no ctx residue); default unset = OFF.
- Engine-true (loadGame, seed 951): fabricated apex raid crisis via the
  real `Game.raiseAidCrisis('reunion pack', 4)` + `crisis.raiders=true`
  (exactly what havenRaidTick does) drives the REAL `callForHelp`; the
  ledger matches the engine's tail entry (or the honest no-tail contract
  on non-placement returns — the fresh game has no linked villages, ret
  `nolink`); the verdict hook records a real `aidAskVillage` verdict;
  re-attempts never create phantom placements.
- Det-gate: HELPCALL=0 armed-object vs the unwrapped tribfloor stack,
  identical seeds 951/952/953, 60d — self-pairs AND cross-pairs all
  byte-identical (end reasons matched too). Gate-off is structurally pure
  delegation; the sim pins it.

## Results

Full sweep: 8 fresh seeds [951–958] × 2 roads × control/armed = 32 runs,
180d death-aware. `scripts/analyze-helpcall-20261016.js`.

### Wall numbers

| | armed | control |
|---|---|---|
| national | 15/16 | 15/16 |
| table (invited) | 14/16 | 14/16 |
| wins | 0/16 | 0/16 |
| exiled | 0/16 | 0/16 |
| wave 4–5 unlocks | 15/16 | 15/16 |
| median survival | 122d | 122.5d |
| max survival | 182d | 182d |

The arm is wall-neutral by design (policy-side aid engagement; the scale
on-ramp movement — national 15/16 both sides — belongs to the substrate,
not this arm). No wall metric moved.

### PRIMARY: placements, attribution, engagement — GO

- **Placements:** 13. Engine returns: `sent` 10, `died` 2, `null` 1
  (no runner available — "every hand is needed at the door").
- **Verdicts (100% attribution, 0 unattributed, 0 errors):** accepted 8,
  refused 1, en-route-at-run-end 1. Every `sent` placement matched its
  verdict by (via=runner, target village, day ≥ placement day); the two
  `died` and one `null` are terminal engine returns, fully attributed.
- **Aid arrivals:** 3 parties, 11 fighters total (ledger `aid-arrived:`
  events). Engagements = 3 arrivals + 1 refusal = **4 ≥ 1 → PRIMARY GO.**
- The two `died` placements are the engine's honest runner cost:
  registerDeath cause `aid-runner` × 2 (both on wave-3/5 raids,
  leadfeast-s955 D114 and leadfeast-s956 D97).

Per-run highlights: leadfeast-s955 placed 3 calls (D114 died on road,
D141 sent→accepted D142, D145 wave-5 sent→accepted D146, one 4-fighter
party arrived); belongfeast-s954's wave-5 call was refused D160
("Chantal turns home from Emberhold — empty-handed — Emberhold said
no."). Verdicts land the next day without fail (1 day-part each way).

### SECONDARY: raid-attributed deaths armed vs control — NULL SIGNAL

Raid-attributed deaths (engine markers `opts.raid`/`m.lingering`):
armed 58 (3.63/run) vs control 60 (3.75/run), delta −2. Paired deltas
scatter −3…+4 with no systematic reduction (s956 leadfeast +4, s957
belongfeast −3). **The lever does not move the raid-death channel.**

The mechanism read: aid parties march real day-parts and arrive AFTER
the raid fight resolves — the crisis closes `fought` when the treeline
is clear or `moved-on` on the 6-day valve, and late parties stand down.
The 28% raid-death channel (fieldfightsrc) is a during-the-fight channel;
the aid system as engaged here is an aftermath mechanic. Calling for
help does not defend the door — it answers the aftermath. If the axis
wants aid to matter for raid defense, the mechanism needs faster aid
(the build-gated cry tier?) or earlier calls — a design question for a
future arm, not a tuning of this one.

### Guardrails

- **No new death mode:** VIOLATED-narrowly-but-honestly — `aid-runner`
  appears 2× in armed, 0× in control. It is an engine-existing mode
  (comms.js: "the road can take them"), never before exercised on the
  sweep substrate; the arm's cost is 2 deaths / 16 runs. Counted
  separately in every per-seed JSON, never hidden.
- **national ≥ control−2:** HOLD (15/16 = 15/16).
- **median survival ≥ control−10d:** HOLD (122d vs 122.5d).
- **No aid-system errors:** HOLD (0; `hcLedger.errors` empty, no
  `hcDriveError`).

Death-cause shares are otherwise identical (combat 52%/49%, villager
combat 22%/22%, monster 15%/17%, expedition 6%/6%).

## Sense-reading (SENSE-TESTING LAW — transcripts, not counts)

Beat 1 — leadfeast s951, D180–181 (armed). A 5-raider apex raid
(Big Loud, Big Big, The Herald, Ugly-Eyes, The Loud Beast) hits at night;
the palisade takes its toll; the 🚨 crisis beat fires with the four
options said aloud; The Loud Beast goes unmet and lingers at the
treeline, gorging nightly ("Drive it off, or call for help."). On D181
the policy answers: "Jovan sprints for Thornfield — 1 day-part each way,
and the road isn't safe. That's the price." Coherent, consequential, in
canon voice: the engine named the options, the village's unmet raider
kept the pressure on, the policy took the targeted honest-cost option.
No robotic repetition, no invented history — Jovan is a real roster
member, Thornfield a real linked village.

Beat 2 — belongfeast s954, D159–160 (armed). A wave-5 apex raid raises
the crisis; the policy sends Chantal to Emberhold (nearest link). D160:
"Chantal turns home from Emberhold — empty-handed." / "Chantal is back
from Emberhold — empty-handed — Emberhold said no." The refusal is
aloud, fast, and attributed (verdict `refused`, village_0) — canon's
`refusals_aloud_fast` holding exactly as designed. No one pretends the
plea is still traveling.

Beat 3 — leadfeast s955, D141–146 (armed). Two apex raids two days
apart; both runners sent to the same linked village, both accepted the
next day (verdicts D142, D146), one 4-fighter party arriving
(`aid-arrived:` ledger event, 11 fighters arrived across the sweep's 3
arrivals). The chain placement → verdict → march → arrival is fully
instrumented and reads as one continuous story across the ledger, the
verdicts, and the beats.

Recorder gap (tooling note, not a game bug): the beat recorder's regex
missed the acceptance and arrival say-texts ("we're coming. Hold the
door." / "Our foragers leave our fields…" / "🥁 X walks in with N") —
they contain none of the recorder's keywords. Verdicts and arrivals are
proven by the hook + ledger events, not by the missing beats. A future
instrument pass should add `foragers|Hold the door|walks in|🥁` to the
aid-beat pattern.

## Village assessment

The villages on this substrate are mid-climb, not surviving: national
15/16, table invited 14/16, wave 4–5 unlocked 15/16, median survival
122d. Deaths are combat deaths (52% `combat`, 22% `villager combat`,
15% `monster`) — the fieldfightsrc picture, unchanged by this arm.
Wins 0/16: the table is reached, not taken — the seat-taking driver is
a sibling arm's territory (sim-seatdrive).

Who thrived: villages that took the table invitation lived longest
(leadfeast-s951/952/953 survived the full 182d horizon). Who died: the
mid-game combat grind — raid-attributed deaths run 1–10 per run, and
the aid arm's 11 arrived fighters didn't bend that curve.

Villager liveness sample (`scripts/sense-helpcall-20261016.js`,
leadfeast s955, 60d, armed): 9 living villagers, distinct occupations
(locksmith, truck drivers, programmer, pharmacist, hotel housekeeper,
chimney sweep, postal worker, dentist); tracking XP diverging 0–9
across the roster — differentiation is happening. But 3/9 sit at flat
zero xp (Joyce Costa, Raj Patel, Onni Korhonen) and zero villagers have
kills or expeditions by day 60. Filed as an open finding (not this
arm's axis — lever 3 territory): early-game villager passivity may be
fine (they're foraging, not fighting), but three villagers accruing
nothing for 60 days smells static. Not chased here.

The aid system's human texture held: runners are named villagers
(Jovan, Oliver, Chantal), target villages are real links (Thornfield,
Ashford, Emberhold), refusals name the reason aloud, and the two road
deaths were said aloud ("the road takes them"). The village reads as
people asking people for help, not a mechanic dispensing parties.

## Metric review (mandatory)

- The PRIMARY's "100% attribution" forced one honest bucket mid-run:
  a `sent` placement at the run's edge (day 181/182) has no verdict
  because the runner is still on the road when the horizon ends. It is
  attributed as `en-route-at-run-end` (verified against live
  `state.aidRunners`), never "unattributed". Attribution stays 100%
  without pretending to know an unknowable verdict.
- `aid-runner` road deaths: the guardrail "no new death mode" is
  evaluated against engine-existing modes — the `aid-runner` cause
  exists in comms.js and fires only when the arm engages the system.
  It is counted separately in every per-seed JSON; if it fires, the
  evidence names it rather than hiding it behind the guardrail.
- If the PRIMARY lands GO but placements are rare (apex raid crises
  are infrequent — 1 placement in the 182-day smoke run), the follow-up
  is the named 16-seed confirm, not in-run escalation.
- The guardrail "no new death mode" was evaluated against
  engine-existing modes: `aid-runner` exists in comms.js and fires only
  when the arm engages the system. Reported as a counted cost (2/16
  runs), not a violation hidden behind wording.
- The SECONDARY's null signal is a finding about the mechanism, not the
  instrument: aid arrives post-fight, so raid-death attribution can't
  move. A future arm that wants aid to defend the door must change aid
  timing (cry tier? earlier calls?), not call volume.

## Verdict

**PRIMARY GO (diagnostic).** The aid system engages on the sweep
substrate for the first time: 13 placements, 8 acceptances, 1 refusal,
3 aid parties (11 fighters) arriving, 100% attribution, zero errors.
The layer is a working measurement instrument — the first
aid-engaging policy on the sweep substrate — and it stays (default-OFF,
zero src/js) for future arms to build on (tier comparisons, aid
timing, the siege aftermath).

**Lever signal: NULL.** Raid-attributed deaths do not move (58 vs 60).
Per the pre-registered decision rule, no 16-seed confirm is named for
THIS lever — there is nothing positive to confirm. Named next instead:
(a) the aid-timing question — does faster aid (cry tier) or earlier
calling reach the fight in time to matter? (b) the aftermath value —
do arrived parties change anything measurable (trust, debt, the-siege
crisis)? Both are future arms, not this run.

## Files

- `scripts/policies/helpcall.js` — the layer (NEW, policy-side only)
- `scripts/test-helpcall-20261016.js` — proof (20/20)
- `scripts/sweep-helpcall-20261016.js` — sweep driver (32 runs)
- `scripts/analyze-helpcall-20261016.js` — analyzer
- `evidence/2026-10-16/perseed-helpcall/` — per-seed JSONs
- `evidence/2026-10-16/helpcall-beats/` — raid/aid beat transcripts
