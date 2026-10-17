# sim-w3wire — EXTEND THE LEDGER CONVENTION TO WAVE-3+ (flesh-out loop ARM, 2026-10-17)

**Run:** flesh-out loop, run_id fleshout-20261017-044712 (coordinator claim; axis scale-onramp blocking).
**Type:** GAME-CODE arm — **STOPPED BEFORE ANY CODE WAS WRITTEN (lane block).** Zero src/ changes. Evidence + diagnostic instrument only.
**Spec sources:** docs/CANON.md, docs/MONSTER-WAVES.md, evidence/2026-10-16/sim-counterwired.md (diagnostic), evidence/2026-10-16/sim-counterwire.md (the LANDED counterwire arm), evidence/2026-10-16/sim-nodewitness.md, evidence/2026-10-16/sim-apexpredators.md.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE any sweep trajectory was observed)

**Question:** extend the monster-counter/trick ledger convention to wave-3+ species so the witness learning channel has somewhere to store hyper-lethal observations and the perform-check path can execute them: (1) `counter` fields on the engine-real wave-3+ defs in src/data/monsters.json, (2) waveLedger.js accepts w3+ counter entries, (3) fieldFights.js witness capture records w3+ observations into the ledger, (4) checkMonsterCounter covers w3+ species.

**PRIMARY (binding):** hyper-lethal (w3+) trick learnings recorded to the village knowledge ledger ≥2 vs 0 baseline on identical seeds (GO).
**SECONDARY:** ≥1 w3+ trick performance in live fights.
**GUARDRAILS (binding):** national ≥ control−2; median survival ≥ control−10d; no new death mode.
**Horizon:** 180d death-aware (dead villages stop simulating, +10d tail max) — matches the trick-game line.
**Seeds:** 8 fresh × {leadfeast, belongfeast} × {control, armed} = 32 runs.
**Policies:** leadfeast / belongfeast.
**Substrate:** pre-seat — SEATDRIVE=0 explicit (sweeps that don't compose the seatdrive wrapper run pre-seat).
**Layer:** env-gated W3WIRE=1, default OFF (guard-classified per precedent).

## VERDICT: STOP — lane-blocked, layer deleted, NO-GO on the pre-registered bar

**No sweep was run. No src/ file was touched. The worktree contains only the diagnostic instrument (scripts/test-w3wire-20261017.js, 9/9 green) and this evidence file.**

The brief's own lane clause fired: *"Before writing any code, determine where the live checkMonsterCounter path for w3+ fights runs: if it requires game.js, STOP and report the exact block to the coordinator — do not cross the lane."* The investigation found the block is wider than (4): **every** concrete step (1)–(4) requires game.js edits to be default-off-clean, because five game.js code paths read `mdef.counter` unconditionally. game.js is loop B's file this run (fleshoutb-20261017-044925, sim-phantomfood-b — zero overlap confirmed via their claim file).

Proven by the diagnostic (scripts/test-w3wire-20261017.js, deterministic, seeded before eval, in-memory injection only — zero repo change):
- A1–A4: current state is clean — 0/32 w3+ defs carry `counter`; villagerTrickDefs covers 27/27 spec ids; checkMonsterCounter(redactor, wait) = false; counterTeachable() ≠ redactor.
- B1–B4: injecting ONE def.counter with W3WIRE unset produces four behavioral divergences no env flag can stop from waveLedger.js/fieldFights.js:
  - B1: `_trickObservation` reroutes w3+ knowledge from `villagerTricks` to `monsterCounters` (game.js:30758)
  - B2: `counterTeachable()` admits the w3+ species to the Haven beasttricks topic (game.js:30641)
  - B3: `monsterCounterKnown` → true; `scoreLedgerKill` scores the 2-pt counter bonus (game.js:30537 gate)
  - B4: `checkMonsterCounter` perform-discovery opens (game.js:30564)

### The exact game.js blocks (loop B's file — do not touch)

1. **game.js:30537** `if (!mdef || !mdef.counter) return false;` — discoverMonsterCounter's gate; the SOLE writer of state.monsterCounters. No W3WIRE gate can be added from waveLedger.js/fieldFights.js.
2. **game.js:30746/30758** — `_trickObservation`: `if (!mdef.counter && !defs[mid]) return false;` then `if (mdef.counter) { return this.discoverMonsterCounter(mid, ...) }`. Adding def.counter STEALS the w3+ channel the landed counterwire arm built (villagerTricks) — control runs would change behavior even with W3WIRE unset.
3. **game.js:30641** `if (!mdef.counter || known[mdef.id]) continue;` — counterTeachable: w3+ species become beasttricks-teachable at Haven (new discovery channel, new 💡 beats, no flag).
4. **game.js:30564** `checkMonsterCounter(mid, ev)` + its 7 TB call sites (31858, 31874, 32569, 32963, 33037, 36221, 36399): perform-discovery opens for w3+ defs whose trick maps to the 17 existing kinds; genuinely-new w3+ kinds (gavel-confess, callback-farewell, eulogy-contradict, algorithm-tank, eater-poison-meal, cancellation-offscript, spoiler-prone, nielsen-boring, network_note-bad_note, audit-inefficient, reunion-novelty, editor-contradict, timeslot-boring, finale-end-first, finale_crew-kill-crew, finale_opening-meet-arrival, strike-meet-demand, congregation-argue, influencer-kill-followers, suburb-leave, terms_of_service-examine, focus_group-bore, ad_break-look_away) need NEW switch cases + new ev observation wiring in the TB handlers.
5. **game.js:30835** `if (mdef.counter) { return this.discoverMonsterCounter(mid, 'node-witnessed'); }` — noteNodeWitnessKill: the witness path reroutes too.

## Supersession: the brief was written against a stale spec

The brief's (1) ("add `counter` fields ... to src/data/monsters.json") DIRECTLY CONTRADICTS a landed, documented design decision. The counterwire arm (evidence/2026-10-16/sim-counterwire.md, landed 2026-10-16) explicitly decided:

> "Deliberately NOT `counter` fields on the defs: the `counter` field is the waves-1–2 ledger convention (monsterCounterKnown requires it; counter-known kills score 2 ledger points)."

with the scoring decision (Steve 2026-10-07 figure-it-out-yourself, documented for overrule): **"The reward is fight-lethality reduction, NOT ledger points"** — waves 2–3 bars are the only ledger consumers; w3+ ledger points would be dead currency; the value of the counter game is not dying.

What already exists (so the brief's goals are already served, differently):
- **Storage for hyper-lethal observations:** `villagerTrickDefs()` covers all 27 spec-named w3+ ids; `noteNodeWitnessKill` + `_trickObservation` record into `state.villagerTricks` (nodewitness: 2 hyper-lethal learnings — eater, cancellation — plus algorithm pure-witness).
- **Perform-check execution:** 15 field-AI actuation gates landed in villagerTrickAction (fieldFights.js); the pilot measured 30 w3+ trick executions in 8 runs. The 3 dead w1 perform-kinds (blindside/face_it/eyes) were FIXED in checkMonsterCounter's switch (game.js COUNTERWIRE 2026-10-16 comment).
- **Witness→ledger recording (brief's (3)):** moot — the witness path already records w3+ observations; the store is villagerTricks by deliberate design, not monsterCounters.

## Lever played (exact numbers)

None. Zero src/ changes, zero data changes, zero policy changes. The only artifacts are the diagnostic instrument and this evidence file (both committed).

## Before/after on identical seeds

N/A — STOP before any sweep spend (no layer exists to measure).

## Reachability verdict

N/A — no layer. The wave-3+ trick reachability question is owned by the landed counterwire arm (30 executions/8 runs) and the nodewitness arm (2 hyper-lethal learnings); this arm adds no new reachability data.

## Village assessment (plain words)

Nothing changed in the village — this run's work was reading the code the previous runs wrote. The villages from yesterday's arms are the relevant picture: they learn fast (18 counter tricks by day 95, villagers bringing observations home, witness reports from real deaths) and, since the counterwire arm, they increasingly fight with the tricks (30 w3+ executions in 8 pilot runs — farewells spoken, confessions made, boring fights fought, suburbs walked away from). The representation gap the brief targeted (6/9 w3 species + w4/5/6 with zero knowledge representation) is already closed by villagerTrickDefs + the 15 actuation gates. The remaining gap per the counterwire arm's own metric review is the execution window — trick RESOLUTIONS, not more wiring.

## Blanks filled or documented

- DOCUMENTED (the finding): the five exact game.js blocks any def.counter approach requires, with line numbers — the precise edit spec for a future game.js-owning arm, IF Steve overrules the landed deliberate-NO.
- DOCUMENTED (supersession): the brief's (1) contradicts the landed counterwire scoring decision; (3) is moot (villagerTricks is the working store); (4)'s w1 portion is already fixed; (4)'s w3+ portion needs new TB perform kinds in game.js.
- FILLED (instrument): scripts/test-w3wire-20261017.js — 9/9 deterministic checks proving the lane block (current-state + in-memory injection divergences).

### The edit spec (for the coordinator — hand to a future game.js-owning arm only with Steve's overrule of the deliberate-NO)

If Steve ever overrules "no def.counter on w3+":
1. monsters.json: add `counter` {kind, trick, reveal} to the 27 defs (escaped-\uXXXX style, append-only splice) — new perform kinds needed for ~24/27 tricks (list in the block section above); only redactor-quiet→'wait', eater-poison→'offer_food'+qualifier, herald-reposition→'move_x2' map to existing kinds.
2. game.js checkMonsterCounter: add the new kind cases + ev observation wiring at the 7 TB call sites.
3. game.js discoverMonsterCounter/_trickObservation/counterTeachable/noteNodeWitnessKill: add the W3WIRE gate (process.env pattern per NODEWITNESS precedent) at the five blocks above.
4. Decide scoring (the landed decision says lethality, not ledger — overruling that is a Steve call, not a worker call).

## Metric review (§14)

- The PRIMARY (≥2 hyper-lethal learnings to the ledger) could not be evaluated — the layer was STOPped before spend. Per §14 this is NO-GO on the pre-registered bar, never re-scored: the arm is recorded as killed-by-lane, not as a negative result about the design.
- Metric honesty: the brief's PRIMARY presumed the ledger (monsterCounters) is the right store; the landed counterwire arm's scoring decision (one day older than the brief) says villagerTricks is. Had the arm run, the PRIMARY would have measured a bookkeeping change over an already-working channel — the metric was aimed at the wrong store.
- Proposed revision for any future attempt: PRIMARY = w3+ trick RESOLUTIONS >0 (the counterwire arm's own proposed metric: trick-attributed kill OR mFlee/vFlee with ≥2 trick actions — resolutions, not bookkeeping), SECONDARY = field-death-rate within wave-3+-reached runs. And the pre-registration must cite the landed counterwire evidence, not just the diagnostic.

## Convergence state

**scale-onramp: converging (no movement this run).** The arm is killed-by-lane with zero trace; the axis state is unchanged from the counterwire/nodewitness arms (learning funnel open, execution window the binding constraint). The useful output is the negative result: the def.counter route is blocked on the game.js lane AND on a landed design decision — the coordinator should not re-brief this arm shape.

## Proof artifacts

- scripts/test-w3wire-20261017.js — 9/9 green (lane-block proof: current state + in-memory injection divergences; deterministic, seeded-before-eval, zero repo change)
- This evidence file.

## Telemetry deviation check

N/A — no sweep ran, no per-seed JSONs produced. Nothing to compare against the baseline.
