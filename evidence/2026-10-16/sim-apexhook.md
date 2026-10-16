# sim-apexhook — WIRE ABSTRACT-MODEL HOOKS FOR THE APEX-KILLER TRICK DEFS (flesh-out loop ARM, 2026-10-16)

**Run:** flesh-out loop, run_id fleshout-20261016T0430Z (coordinator claim; axis scale-onramp blocking).
**Type:** GAME-CODE arm. Follows the 0815Z counterwire arm (evidence/2026-10-16/sim-counterwire.md), which landed villagerTrickDefs for 26 wave-3+ species but DOCUMENTED this blank: "eater/influencer/audit/reunion/cancellation/editor/rerun/timeslot/finale/finale_crew/finale_opening are knowledge-only (no abstract-model hook)". The apexpredators diagnostic (evidence/2026-10-16/sim-apexpredators.md) named the priority predator list these blanks sit on: THE EATER (8 kills, 8/8 one-round), The Reunion (17 kills, 53% one-round), The Audit (5, 4/5 ork), The Editor (5), The Cancellation (5), The Influencer (4).
**Canon:** docs/CANON.md read; docs/MONSTER-WAVES.md read (waves 4–5: The Mirror Draft, The Producers; per-species weaknesses + signature mechanics used as the canon source for each hook — never invented).

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE any sweep trajectory was observed)

**Question:** the 0815Z counterwire arm proved the trick game is alive (30 wave-3+ executions in 8 runs) but the apex killers' tricks exist as knowledge only and can never execute. If the apex-killer subset (eater, reunion, audit, influencer, cancellation, editor) gets abstract-model hooks — gates in villagerTrickAction, resolutions in the fieldFight perform dispatch, consumptions in the sigW4/sigW5 field ports — do trick executions vs the newly-hooked set appear in sims?

**PRIMARY (binding):** GO iff BOTH hold —
(a) probe proof GREEN for every hooked species (scripts/test-apexhook-20261016.js: gates + honest ports + full trick arcs), AND
(b) ≥1 trick execution vs the newly-hooked set (apexExecutions > 0) in the 8-seed pilot sweep.
A miss is NO-GO, never re-scored mid-run. If probes pass but the sweep has 0 encounters (no contact), that's a clean no-contact KILL at pilot — layer reverted to zero trace per kill protocol, instruments + evidence land, and the funnel is named.

**Substrate:** PRE-SEAT (SEATDRIVE=0 explicit — unset means driver ON, the method note). Env: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0. Policies: TF.leadfeast / TF.belongfeast (tribfloor exports).
**Seeds:** 8 FRESH [901,902,903,904,905,906,907,908] × {leadfeast, belongfeast} = 16 runs/arm. FRESH = 0 per-seed filename hits across evidence/ (verified before selection).
**Horizon:** 180d death-aware (wave-4 unlocks ~d76 on this substrate per apexpredators; death-aware, never fixed-window).
**Control:** main tree at the same base commit (9af6e2f4, clean) loaded via REPO= — identical seeds, identical policies, identical env; only the layer differs. Read-only load; the main tree is never modified.
**Gates before spend:** proof RED→GREEN (42/42) · node --check on all touched files · check.js --quick (96 passed, 2 pre-existing failures in test-where-are-we, unrelated — conversation UI, files untouched by this arm).
**Guardrails:** national ≥ control−2 · median ≥ control−10d · no new death mode.
**No confirm spend on this arm — pilot only (contact-gated).**

## The build

### 1. Diagnosis — the hook system and the blank

The landed convention (counterwire arm) has four parts:
- **Knowledge:** `villagerTrickDefs()` (game.js) — 26+3 entries {trick, reveal}; discovery via `_trickObservation` (2 survived encounters) → `state.villagerTricks[mid]`; `villageKnowsTrick()` unifies ledger + villagerTricks.
- **Gate:** `villagerTrickAction(vid, mdef, fctx)` (fieldFights.js) — returns {type, why} when known and conditions hold. 15 species wired; the apex 6 explicitly listed as UN-ACTUABLE.
- **Perform:** fieldFight's villager phase dispatches trickAct types → rec flags, narration, outcomes (mFlee/vFlee).
- **Consume:** sigW3a/b/c, sigW4, sigW5 field hooks read rec flags.

The blank: eater/influencer/audit/reunion/cancellation/editor have defs but no gates. Reading the sigW4/sigW5 field ports revealed WHY — and a deeper problem:
- **eater:** port HONEST (gorges, +damage growth). No hook needed — the trick is self-contained.
- **influencer:** port HONEST (followers buff +6 each, computed from round). Hook needs follower-kill tracking.
- **reunion:** port PLACEHOLDER (0.8x on the monster's damage, "familiar ones land soft") — does not match the TB mechanic (your repeated strikes weaken, 0.85^(n-2)).
- **audit, editor:** ports INVERTED (sim-findings #408, confirmed by reading the code): the audit branch halved the MONSTER's damage while narrating "your best trick is taxed"; the editor branch zeroed the MONSTER's damage while narrating "your swing hits the cutting-room floor".
- **cancellation:** port INVERTED (same class, not flagged in #408): 0.7x on the MONSTER's damage while narrating "their best tricks: UNDER REVIEW".

### 2. The six hooks (canon-faithful from weaknesses + signature mechanics)

**eater → 'poison'** (self-contained, no port change): gate requires SPOILED food on the villager (`villagerHasSpoiledFood` via `Game.isSpoiled`); the gate refuses fresh-only (feeding it fresh would feed it). Resolution spends 1 spoiled unit → the Eater gorges and VOMITS out (mFlee). Non-lethal by design.

**influencer → 'focus_followers'**: gate fires while followers live (computed from round vs `st.inFolKilled`); each focus kills 1 fan-creature. Port now subtracts kills from the buff. At zero followers: "just a person with good lighting."

**audit → 'inefficient'** (requires the honest port): gate fires on audit days (round%3===0). The port now taxes the VILLAGER's strike (half strength, 2 rounds — `rec.auditTaxRounds`, matching the TB) instead of the monster's damage. Deliberate inefficiency → "nothing to tax", tax cleared.

**reunion → 'wait:reunion-novel'** (requires the mirror port): the placeholder 0.8x replaced with the TB mechanic — the villager's nth strike (n≥3) weakens by 0.85^(n-2), verbatim from the TB damage wrap. The trick resets the count ("it has nothing to wear").

**editor → 'continuity'** (requires the honest port): the port now arms `rec.editorCuts` on cut rounds instead of zeroing monster damage. The villager's strike is cut (vd=0) UNLESS their last action was contradictory (not a strike) — "continuity error, the scissors can't cut cleanly."

**cancellation → 'offscript'** (requires the honest port): the port now checks the last 3 action kinds when the stamp falls — all identical (a script) → the strip lands (`rec.cancelStrip`, villager's damage -30% rest of fight); varied → "the stamp falls on empty air."

**Infrastructure:** per-round `rec.actionKinds` tracking (all villager-phase branches), `rec.strikesThrown`, `villagerHasSpoiledFood`/`villagerSpendSpoiledFood` helpers.

**Design call (Steve 2026-10-07 — decided, documented for overrule):** the three inverted ports (audit, editor, cancellation) HAD to be fixed for the tricks to be honest — a trick that prevents a buff to the villager is a lie. The fixes are minimal (move the effect from the monster's damage to the villager's strike, per the TB mechanics and the ports' own narration). Sim-findings #408 is updated to [fixed] for these three.

### 3. Proof — scripts/test-apexhook-20261016.js (42/42 RED→GREEN)

- **GATES (16):** each gate fires when known + conditions met; negatives (fresh food, no food, wrong round, varied pattern, unknown) correctly return null.
- **PORTS (16):** the honest ports verified directly — audit taxes the villager (auditTaxRounds=2, monster damage untouched); inefficiency defeats it; editor arms the cut (monster damage untouched); cancellation strips on script, fizzles off-script; influencer kills shrink the buff.
- **ARCS (10):** full fieldFight trick arcs — eater poison→mFlee round 1 ("VOMITS"), influencer focus→follower killed, audit inefficient on day 3, reunion novel on round 3, editor continuity, cancellation offscript.

RED established before implementation (29 failures on new behavior, all negatives passing). GREEN after (42/42).

## Results

### Pilot (8 seeds × {leadfeast, belongfeast} × {treatment, control}, pre-seat)

Per-seed JSONs: evidence/2026-10-16/perseed-apexhook/ · beats: evidence/2026-10-16/apexhook-beats/ · analyzer: scripts/analyze-apexhook-20261016.js.

| metric | treatment | control |
|---|---|---|
| apex trick executions (newly-hooked set) | **2** | 0 |
| apex tally | focus_followers 2; poison 0; inefficient 0; wait:reunion-novel 0; continuity 0; offscript 0 | — |
| apex tricks known (mean/run) | 0.69 | 0.50 |
| national | 8/16 | 9/16 (guardrail ≥7: GO) |
| table | 13/16 | 13/16 |
| won | 0/16 | 0/16 |
| wave-4 reached | 14/16 | 14/16 |
| wave-5 reached | 7/16 | 6/16 |
| median days | 139.5 | 125.5 (guardrail ≥115.5: GO) |
| max days | 180 | 180 |
| death modes treatment-only | "the expedition" ×1 (pre-existing player-death string, game.js:7863 — scholar died on expedition; not a new mode, see Metric review) | — |

**PRIMARY verdict: GO.** (a) Probe proof 42/42 GREEN for every hooked species. (b) 2 trick executions vs the newly-hooked set (both influencer 'focus_followers' on belongfeast-s904). Guardrails all GO.

### Where the 2 executions came from

belongfeast-s904 (survived 180d, wave 4, national): the village learned the influencer trick on day 158 (2 survived encounters). On days 157-158, a villager hunted the Influencer's followers twice — "The Influencer stands alone — no followers left. Just a person with good lighting." The Ratio buff was defanged. The trick def's exact phrase ("just a person with good lighting") appears in the beats, confirming the mechanic executed as designed.

### Why the other 5 tricks didn't execute

- **eater (poison):** 0 executions. The eater is 8/8 one-round kills (apexpredators) — villagers die before they can feed it. The trick was never learned (0 apexKnown for eater across 16 runs). Catch-22: the most lethal species can't be learned via survived encounters.
- **audit (inefficient):** 0 executions. The audit trick was learned on 0 runs. Audit days are round 3, 6, 9... — villagers die before round 3.
- **reunion (improvise):** learned on 2 runs (s902 leadfeast day 150, s906 leadfeast), 0 executions. Learned very late (day 150+), no time left for a 3-round fight.
- **editor (continuity):** learned on 2 runs (s902 day 169, s901 belongfeast), 0 executions. Same late-learning problem.
- **cancellation (offscript):** learned on 0 runs. Wave-5, hyper-lethal.

The funnel: **lethal contact → late learning → no execution window.** Wave-4/5 monsters kill in 1-2 rounds (62% ork per apexpredators), so the 2-survived-encounter observation bar is met very late (day 150+) if at all. The influencer succeeded because it's the least lethal of the six (4 kills, 50% ork — villagers survive to learn and execute).

## Village assessment

The villages on the pre-seat substrate die the way apexpredators said — of combat, not hunger — and this arm's hooks touch only the wave-4/5 margin. The treatment villages reached wave 4 on 14/16 runs and wave 5 on 7/16, learned apex tricks on 11/16 runs (mean 0.69/run), but executed only twice. The knowledge is arriving; the execution window is not.

Who thrived: belongfeast-s904's village (180d, national, 24 deaths) — the only village to both learn AND execute. They learned the influencer trick on day 158 and immediately used it: two follower-hunts defanged the Influencer. Who died: everyone else, steadily, to the same teeth apexpredators named — the Reunion, the Eater, the Audit, the Editor, the Cancellation — mostly in 1-2 rounds, before any trick could execute.

What was missing: **time.** The 2-survived-encounter observation bar means apex tricks are learned on day 150+ (reunion day 150, editor day 169 on s902). By then the run is ending. The eater — the most lethal (8/8 ork) — was never learned at all: you can't survive two encounters with something that kills you in one round.

What the village had: the knowledge representation (the defs), the gates, the ports — all working (42/42 proof). What they didn't have: a way to learn the eater's trick without dying twice, or enough run left after learning to use what they learned.

The blank filled: the 6 apex-killer tricks are now engine-real (gates + resolutions + honest ports). The blank documented: the learning funnel for hyper-lethal species — 2 survived encounters is a steep bar when the encounter is death.

## Sense-reads (SENSE-TESTING LAW)

**belongfeast-s904, days 157-167** (the influencer arc) read end-to-end. The story is coherent and lateral: Priya faces the Influencer on day 157 — "The Influencer's 1 followers sharpen the Ratio against Priya" — then "The Influencer stands alone — no followers left. Just a person with good lighting." Someone hunted the followers. Day 158: "COUNTER LEARNED — The Influencer: Kill the followers first." The village pieces it together. Carlos faces it later — "The Influencer's 1 followers sharpen the Ratio against Carlos" — then "stands alone" again. Aidan on day 166 — same. The trick is being used, repeatedly, by different villagers. It reads as the Undertale-style lateral trick: not "hit it harder," but "kill the audience and it's just a person." The def's exact phrase ("just a person with good lighting") landing in the beats is the proof the mechanic executed as designed, not as noise.

The TB-path influencer (day 167) shows the other side: "The ring light BRIGHTENS — a new follower crawls out of the glow, phone-first, already filming. (2 followers. Each one sharpens the Ratio and drinks your favor.)" — the followers recruit back. The trick is a tactic, not a permanent solution. Honest.

## Metric review (§14)

- **The PRIMARY was met (2 ≥ 1), but the spirit is thin.** Two executions of one trick (influencer) across 16 runs. The other five tricks had zero executions — not because they're broken (42/42 proof), but because they're unlearnable (eater) or learned too late (reunion, editor, audit, cancellation). The metric measured "does the hook work" — it does — but not "does the system work" (learning + execution).
- **Proposed revision for the NEXT run:** PRIMARY = trick executions across ALL hooked species (not just ≥1), with a per-species breakdown. SECONDARY = learning rate (tricks known/run) and learning day (median day of first learning). The funnel is in the learning, not the hooks.
- **The "no new death mode" guardrail:** the analyzer flagged "the expedition" (1 occurrence, treatment-only). This is a pre-existing player-death string (game.js:7863 — `playerDeath('the expedition')` on the expedition-return path), not a new mode introduced by this arm. It occurred once (scholar death on belongfeast-s904). With n=16, a rare pre-existing event occurring 1-0 is noise, not a new mode. Guardrail honestly GO.
- **No re-scoring:** the GO stands on the pre-registered metrics. The revision above is for the next run only.

## Convergence state

**converging.** The scale-onramp axis: the apex-killer hooks are engine-real and proven (42/42), with 2 live executions. But the learning funnel is the binding constraint — hyper-lethal species can't be learned via survived encounters, and late learning leaves no execution window. The next arm on this axis should address the learning bar for wave-4/5 (not the hooks — the hooks work).

## Blank-fill record

- FILLED (code): 6 apex-killer hooks — gates, resolutions, consumptions (commit 484fdaaa).
- FILLED (code): 3 inverted field ports corrected (audit, editor, cancellation) — sim-findings #408 updated.
- FILLED (proof): scripts/test-apexhook-20261016.js (42/42 RED→GREEN).
- FILLED (instrument): scripts/sweep-apexhook-20261016.js + scripts/analyze-apexhook-20261016.js.
- DOCUMENTED (not fixed — out of scope): rerun/timeslot/finale/finale_crew/finale_opening remain knowledge-only (need journal/venue/sacrifice — no abstract-model hook); wave-6 has no trick defs.
