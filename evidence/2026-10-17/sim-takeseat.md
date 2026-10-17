# sim-takeseat — the take-seat driver for the feastscale substrate (flesh-out loop, 2026-10-17)

Axis: scale-onramp. Run: fleshout-20261017T1223Z (worker: sim-takeseat).
Answers the 'no-driver' gate named by sim-feastblow
(evidence/2026-10-17/sim-feastblow.md): on the true feastscale substrate
(leadfeast/belongfeast, SEATDRIVE=0), foodDeeds 15/16, seat-earned 15/16,
invitation staged 15/16, announced 14/16, tableDone 0/16, won 0/16 — the
chain ran to completion and had nowhere to go, because base courtship
has NO seat-taking verb (only capable.js's tableRoad and the seatdrive
layer take the seat). This arm MEASURES what a policy that takes the
seat when the engine says takeable can reach — completing the
national→table→wins chain on base courtship (mission item 3: content
reachability).

Canon read: docs/CANON.md (manifest) + docs/TABLE.md (full). The table
PRICES the run, never gates on godhood; lesser seat = waves 1-3 faced
(4/4/3), 2+ contests, 2+ crises, regional+, stage≥2, food-thesis deeds.
tablePreview() is null when the invitation is not staged, the seat is
'none', tableDone, or BEFORE DAY 90 ("nonexistent — no spoilers");
tableTakeSeat() re-checks the preview and locks via tableScene.
The layer never manufactures an invitation, never forces a not-ready
seat, never answers the table modal.

## Pre-registration (binding, MEASUREMENT.md §§9–12, 14)
Written BEFORE the pilot sweep. Substrate asserted up front by
scripts/sweep-takeseat-20261017.js (SWEEP STOP on mismatch):
- SUBSTRATE: FEASTSCALE_R13=1, SEATDRIVE=0 EXPLICIT (unset now means
  driver ON after c004b9dd — pinned OFF, same as the feastblow census).
  Policies: leadfeast / belongfeast (require('./feastscale') — the true
  feastscale substrate). ARMED adds the takeseat layer (TAKESEAT=1);
  CONTROL is the bare feastscale policy. Identical seeds per road.
- SEEDS: 8 FRESH seeds 9701–9708 × {leadfeast, belongfeast} ×
  {armed, control} = 32 runs. Fresh = 0 filename hits across evidence/
  (verified 2026-10-17; 9701–9708 appear only in unrelated 2026-10-12
  journey contexts, not in any scale-wall/feast sweep — documented, not
  hidden).
- HORIZON: 180d death-aware (matches the feastblow census; dead villages
  stop simulating, +10d tail max).
- PRIMARY (GO) = tableDone armed (TAKESEAT=1) ≥ control + 3 on the
  feastblow substrate. Control expected: invitations staged ~15/16,
  tableDone 0/16 (the feastblow replication check — if control does NOT
  replicate staged-invitations/zero-tables, stop and report the substrate
  mismatch loudly before any verdict).
- SECONDARY (measured, not binding): wins, announced→table conversion
  rate, seat-earned day, median survival.
- GUARDRAILS (kill conditions): median survival armed < control−10d;
  national armed < control−2; any new death mode on armed.
- COMPLETION: 32/32 runs complete; det-gate byte-identical (gate OFF,
  60d, seed 9701); 0 instrument errors.
- CONVERGENCE verdict per run: converging | converged | parked | killed-at-pilot.

## The layer (scripts/policies/takeseat.js)
TAKESEAT=1 (default OFF — gate off = pure delegation, byte-identical,
pinned by the proof's RED phase and det-gate). Wraps
leadfeast/belongfeast via require('./feastscale') (the
reposition/feastblow composition pattern). After the base's upkeep:
takeSeatDrive(Game, ctx) — the EXACT preconditions of capable.js
tableRoad (~l694-727): !pg.tableDone && Game.tablePreview() &&
pv.ready → Game.tableTakeSeat(). Task additions: invitation must also
be ANNOUNCED (pg.tableAnnounced — announced→table is a measured
secondary), luxury-move safety (never while the game is over, never
while a fight is live — feastblow precedent). ENGINE-HONEST: preview
null (not staged / not earned / pre-day-90) = the engine's answer, never
bypassed; the layer never manufactures invitations, never forces a
not-ready seat, never takes twice (engine's tableDone guard + the
policy's own ctx.tsSeatTaken guard), never answers the table modal
(another layer's measurement). Zero src/js changes — policy-side only.

## Metric review
Per §14 the pre-registered metrics bind the run; the pilot GOES — no
re-scoring was needed. PRIMARY said "tableDone armed ≥ control + 3":
armed 13/16 vs control 0/16 — a +13 delta, more than 4× the threshold.
The control replicated the feastblow substrate exactly as pre-registered
(invitation staged 14/16 ≈ the census's 15/16, tableDone 0/16) — no
substrate mismatch, no loud stop. No metric proved wrong: tableDone is
the honest driver metric, wins stay SECONDARY (the modal is another
layer's measurement), and the guardrails held (below).
- Instrument note: runDays does not return ctx, so the layer's ctx
  driver counters (tsSeatTaken etc.) read 0 in the JSONs — the same
  instrument behavior the feastblow evidence recorded for fbFacedCtx.
  The read-only tablegate capture is authoritative: takeSeatCalls
  13/13 ok on armed (one per seated run), 0/0 on control. The engine
  fired tableScene exactly once per seated run — never twice, never on
  control.

## Results
Pilot ran 2026-10-17 ~12:40–14:20 UTC (~105 min wall for 32 runs; the
long-lived runs cost more).
Substrate asserted up front (FEASTSCALE_R13=1, SEATDRIVE=0 explicit).

| road | arm | foodDeeds | seat | waiting | announced | tableDone | arcIV | national | won |
|---|---|---|---|---|---|---|---|---|---|
| leadfeast | armed | 7/8 | 7/8 | 7/8 | 7/8 | 7/8 | 7/8 | 7/8 | 0/8 |
| leadfeast | control | 7/8 | 7/8 | 7/8 | 7/8 | 0/8 | 7/8 | 7/8 | 0/8 |
| belongfeast | armed | 7/8 | 7/8 | 7/8 | 6/8 | 6/8 | 7/8 | 4/8 | 0/8 |
| belongfeast | control | 7/8 | 7/8 | 7/8 | 6/8 | 0/8 | 7/8 | 3/8 | 0/8 |

**PRIMARY: GO — armed 13/16 vs control 0/16 (Δ=+13, threshold ≥+3).
The takeseat layer is MEASURED and kept.** Every announced armed run
sat (13/13); every control invitation expired unanswered. The two armed
runs that did not sit were never announced by the engine — engine-honest
refusals, not layer misses:
- belongfeast/s9703 armed: invitation staged d42, village died d82 —
  before the day-90 floor; tablePreview() null pre-floor, the layer
  never manufactured a seat.
- belongfeast/s9707 armed: village died d24; no seat earned at all.
Seat-earned days median d106 (armed); every seated run sat the SAME dawn
it was announced (13/13: announced day == seat day) — the driver takes the
first honest opportunity and never waits artificially.
**SECONDARY (non-binding):** wins 0/16 both arms — the seat opens the
door; the layer never answers the table modal (by design: "only opens
the door"). The modal is another layer's measurement (the seatdrive
stack's windefer drives it; on this road there is no modal driver yet).
Announced→table conversion: armed 13/13 announced runs; control 0/13.
Median survival armed d182 vs control d165 (Δ=+17 — the layer harms
nothing; the delta is noise-level). All guardrails GO: national armed
11/16 vs control 10/16 (≥ control−2); scholar combat deaths armed 82 vs
control 88; no new death mode on armed (death-cause shares
armed≤control on every real cause; the absolutes are inflated by the
known tele double-registration race — feastblow noted it — the armed/
control comparison is the guardrail).

**THE CHAIN IS COMPLETE TO THE DOOR.** On base courtship with the true
feastscale substrate: foodDeeds hold → seat earned (lesser) → invitation
staged → announced → **the seat is now taken**. The 'no-driver' gate the
feastblow census named is filled: 13/16 tables sat where 0/16 sat
before. What remains is the table modal itself — wins 0/16 because no
policy on this road plays the seven doors. That is the named next gate,
not this arm's miss (pre-registered SECONDARY, non-binding).

Convergence verdict: **converging** — the axis's blocking gate
(scale-onramp's national→table→wins chain) now runs to the door; the
next binding question is the modal (does anything play the table once
seated?), which this arm does not measure.

## Village assessment — what the take-seat reads like
Sense-read (SENSE-TESTING LAW) on armed seated runs: leadfeast/s9702
(seated d124, survives to d182), belongfeast/s9708 (seated d114, survives
to d182), leadfeast/s9701 (seated d90, died d90 in seed-identical combat —
the control died the same dawn without sitting; the death is seed-driven,
not layer-driven).

The arrival chain (beats captured verbatim via the tablegate instrument):
- d123 s9702: "The table is being set — a lesser seat, priced for what
  you built. They are watching to see who comes to it."
- d123: "◈ ARC IV — THE INEFFICIENCY. SYSTEM: 'ROUNDING ERROR
  RECLASSIFIED: ANOMALY. Organic consumption yields impossible output.
  Recalculating. Recalculating.' — They finally see it. The thing they
  laughed at — needing to EAT — is the engine. Their confusion is your..."
  — the food thesis lands in the System's own register, on the eve of the
  table. Coherent with the core thesis.
- d124 s9702: "◈ THE TABLE IS SET. A ring of pale light waits — take your
  seat from Haven when you are ready. Nothing is final until you sit."
- d124: "◈ THE TABLE — it is not a table. It's a ring of pale light, and
  around it, things with too many angles to be faces. Above it all — the
  audience. Trillions of eyes, and every one of them knows your name. The
  System speaks, and for once it isn't performing: 'HUMANITY PRESENTS ITS
  CASE.'" — the arrival lands with real stakes and the audience present.
- d124: "◈ THE AUDIT — the System reads your run back to you, and the
  galaxy listens. A lesser seat — national standing, waves 1–3 faced
  (18/5/3), 14 contests survived, 3 crises weathered. The table does not
  rise. It prices." — the audit reads the RUN's real numbers aloud. Every
  number in it matches the run's telemetry.
Judgment: the sequence is coherent and legible — set → Inefficiency →
announced → scene → audit, every transition narrated, every price
honest. Nothing robotic.

Do villagers react to the table? YES — the journey-endgame r11
once-per-villager table-sitting opener fires on the seated run
(8/10 villagers remarked on the re-run probe of s9702, all 'waiting'
kind; the predicate convoTableSitting() reads true post-sit). Verbatim
opener lines (captured at fire time via an instrument wrap of
convoTableOpener — the exact line each villager opens with):
- d124 mara_vasquez: "Can I be honest? Did you see their faces? Too many
  angles. I keep wondering what they want from us."
- d125 ursula_weber: "You know — The table's here. The ring — the light —
  it's just sitting there. Waiting on you."
- d126 (a newer villager): "Nobody's sleeping. The sky is waiting and
  nobody knows what to do with their hands. What are you going to tell
  it, as it were?"
- d127 ruth_goldstein: "Nobody's sleeping. The sky is waiting and nobody
  knows what to do with their hands. What are you going to tell it?
  Extremely normal, all of it."
- d128 elena_petrova, d130 marcus_webb, d145 (a newer villager): "The
  table's here. The ring — the light — it's just sitting there. Waiting
  on you."
Judgment: villagers register the table as the most newsworthy thing that
has ever happened to them; they open with it ahead of secrets and small
talk (priority #2 after talk requests, by design); named villagers get
voiced prefaces ("Can I be honest?", "You know —") and Ruth's dry kicker
("Extremely normal, all of it") shows personality leaking through. They
ask the player what they will tell it — the conversation has a want,
not just a statement. DOCUMENTED BLANK (not chased this run): the
waiting pool is 3 lines — with 8 villagers remarking, "The table's
here..." repeats verbatim 4×. Once-per-villager keeps it from looping,
but the pool is thin for a village that talks. A pool-depth pass belongs
on the findings backlog.
- (Corrected reading, s9708 d107: "THE TABLE IS SET. THE VILLAGE IS ONE
  ANIMAL. IT IS VERY WELL FED AND IT WOULD LIKE TO HIT SOMETHING." is an
  AUDIENCE ability's flavor text (abilities.json:4632), not a villager
  voice — the system speaking through a grant, not the village talking.)

What the sit does NOT do (the named next gate): the table modal
(phase 'paths', the seven doors) opens and nobody answers it — wins 0/16
on both arms. The seated run continues with the table "waiting on you"
indefinitely (s9702 lived 58 days post-sit; the 'waiting' remarks keep
their once-per design, no loops). The run's story at that point is
honestly unresolved — the door is open, no one walks through. The modal
driver is another layer's measurement (the seatdrive stack's windefer
drives it; on this road there is none yet).

## Blanks filled / documented
- **MEASURED (pilot)**: 32-run armed/control pilot on the feastscale
  substrate (8 fresh seeds 9701–9708 × {leadfeast, belongfeast} ×
  {armed, control}, 180d death-aware, SEATDRIVE=0, FEASTSCALE_R13=1).
  Completion gates all GO. PRIMARY GO → layer KEPT.
- **FILLED**: the 'no-driver' gate — the chain now runs to the door:
  tableDone armed 13/16 vs control 0/16. The take-seat driver is
  scripts/policies/takeseat.js (TAKESEAT=1, default OFF; zero src/js
  changes). Every announced run sits the same dawn (13/13); the engine's
  refusals (pre-day-90, never-announced, early death) were honored, never
  forced.
- **SENSE-READ (mission item 4)**: the arrival chain reads coherently as
  a story (set → Inefficiency → announced → scene → audit, all narrated,
  all honest). Villagers react to the table through the r11 once-per
  opener (8/10 remarked on the s9702 probe; verbatim lines quoted
  above) — they act like people, with voiced prefaces and personality
  kickers, asking the player what they'll tell it.
- **DOCUMENTED (next gate, not this arm's)**: the table modal opens and
  nobody answers — wins 0/16 both arms. Completing the chain needs a
  modal driver on this road (the seatdrive stack has windefer; the
  feastscale road has none). Filed below to sim-findings.md.
- **DOCUMENTED (blank)**: the table-remark waiting pool is 3 lines —
  verbatim repetition across 8 remarking villagers. Filed to
  sim-findings.md as a pool-depth pass.
- **INSTRUMENT NOTE**: runDays does not return ctx, so the layer's ctx
  driver counters read 0 in the JSONs (same as feastblow's fbFacedCtx).
  The tablegate capture is authoritative: takeSeatCalls 13/13 ok on
  armed, 0/0 on control; tableScene fired exactly once per seated run.

## Instruments (kept per protocol)
- scripts/policies/takeseat.js — the layer (kept if PRIMARY GO;
  deleted zero-trace if NO-GO per kill protocol).
- scripts/test-takeseat-20261017.js — proof test: RED-pinned (gate OFF
  never drives), GREEN, 8 adversarial cases, det-gate byte-identical
  (gate OFF, 60d, seed 9701). 13/13 green.
- scripts/sweep-takeseat-20261017.js — 32-run pilot sweep (substrate
  assertion, tablegate arrival-path capture, live death capture,
  per-seed JSONs with driver counters + captured table beats).
- evidence/2026-10-17/perseed-takeseat/ — 32 per-seed JSONs + sweep.log.
- evidence/2026-10-17/sim-takeseat.md — this file.
