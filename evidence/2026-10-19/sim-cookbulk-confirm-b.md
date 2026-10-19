# sim-cookbulk-confirm-b — CONFIRM on 16 fresh seeds (arm sim-cookbulk-confirm-b, axis food-economy)

Loop B, run fleshout-loop-b-20261019T0725Z (parent: oversight-flesh-out-loop-b). Worker: sim-cookbulk-confirm-b tree.

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14–15 — written BEFORE any sims, 2026-10-19)

- ARM: the landed batch-cook trigger scripts/policies/cookbulk-b3.js
  (COOKBULK_B3=1, default OFF, zero src/js; master commit 9f3681154,
  proof 28/28 GREEN re-verified on master by coordinator). The confirm
  does NOT touch the landed layer — no src/js changes, no edits to the
  landed cookbulk-b3 files; policy-side confirm instruments only
  (scripts/*cookbulk-confirm*, evidence/2026-10-19/).
- PRIMARY: mean cooked kcal per b3 side >= 20,000 (the capacity-honest bar,
  same as the pilot's; pilot: 24,812 on seeds 94101–94108). Control ~0.
  A miss is NO-GO, never re-scored mid-run.
- GUARDRAILS:
  - median survival b3 >= control - 10d (the pilot's co-primary, now a
    guardrail: pilot was clean 103d vs 100d; the b2 -46d signal was retired
    as noise — the confirm watches for recurrence);
  - starvation deaths b3 <= control + 2 (per-pair collapse-aware);
  - national b3 >= control - 2;
  - no new death mode (dedup on (who,day,cause), kind person/villager);
  - laundering 0 (cooked kcal is the engine's post-cook kcalEach x units —
    digestibility, never exceeding gross).
- HORIZON: 180d death-aware (runDays stops on village death +10d tail).
  Why: rot/cook accumulation plus the reachability window (national/table/
  wave reach) — the confirm's village-assessment half needs the long
  horizon; death-aware so dead villages stop simulating.
- SEEDS: 95101–95116, FRESH (16), x {leadfeast,belongfeast} x {control,armed}
  = 64 runs. Verified unused by coordinator on 2026-10-19 across
  scripts/sweep-*.js, scripts/test-*.js, evidence/2026-10-*/sim-*.md;
  RE-VERIFIED by this worker before sweeping (see "seed freshness" below).
- SUBSTRATE: FEASTSCALE_R13=1, SEATDRIVE=0 EXPLICIT (pre-seat). The sweep
  asserts both env vars up front and stops on mismatch.
- POLICIES: {leadfeast, belongfeast} (FEASTSCALE_R13=1 substrate), SEATDRIVE=0.
  Own in-sweep paired control, identical seeds.
- §15: per-seed panel-schema JSONs (evidence/2026-10-19/perseed-cookbulk-confirm-b/);
  scripts/build-cookbulk-confirm-b-panels.js; control->b3 compare .md
  attached. The panel is the instrument, the pre-registered thresholds are
  the judge.
- VERDICT RULE: GO (CONFIRMED) only if PRIMARY + ALL guardrails pass.
  Any miss → NO-GO per §14, documented under "metric review", and the landed
  layer is NOT touched (a confirm miss is a finding, not a license to edit).
- BASE: master at 9f3681154 (the landed arm).

## Seed freshness

Worker re-verification 2026-10-19 (before sweeping): grep for each of
95101–95116 across scripts/sweep-*.js, scripts/test-*.js, and
evidence/2026-10-*/sim-*.md (excluding this run's own sim-cookbulk-confirm-*
files) → NO HITS. Seeds are fresh. Env asserted in the sweep script itself:
FEASTSCALE_R13=1 SEATDRIVE=0 required or it exits(2).
Deep re-check (worker): a broader whole-repo grep surfaced "95101" in three
older evidence JSONs — all value matches, not seed uses (4.495101241018942
float in feastvoice-b-beats/belongfeast-s6108.json; pantryOutKcal: 395101 in
perseed-phantomrerun/leadfeast-control-s4417.json; lean/fps/50/ate: 951019 in
perseed-leanclass-b/sweep-control-belongfeast.json). Same standard as the
pilot's 94102/94108 kcal-value verification. Freshness holds.

## Before / after (confirm) — 64 runs

16 fresh seeds (95101–95116) x {leadfeast, belongfeast} x {control, b3} = 64 runs,
180d death-aware horizon, FEASTSCALE_R13=1 SEATDRIVE=0. Aggregates recomputed
2026-10-19 (repair pass) from the 64 committed per-seed JSONs in
evidence/2026-10-19/perseed-cookbulk-confirm-b/ by
scripts/analyze-cookbulk-confirm-b-repair.js (all checks PASS, exit 0).

| metric | control (n=32) | b3 (n=32) | bar | verdict |
|---|---|---|---|---|
| PRIMARY mean cooked kcal | 0.0 | 24,653.6 | >= 20,000 | GO |
| median survival | 111.0d | 120.5d | >= control-10 = 101 | GO |
| starvation deaths | 15 | 8 | <= control+2 = 17 | GO |
| national | 22/32 | 24/32 | >= control-2 = 20 | GO |
| no new death mode | — | — | — | GO |
| laundering | — | 0 errors; cookedKcal>0 iff cookDays>0 | 0 | GO |

Plus (non-pre-registered, context only): table 25/32 → 26/32; wave4 18 → 19;
wave5 0 both; wins 0 both; max survival 180d both; mean cook days/run 4.19
(~5,803 kcal/cookDay, min 3,555 max 8,087 — tight, sane); mean water drawn
b3 84.4L; exiled 0 → 2 (not a guardrail; watch item, see metric review);
mean rationed days 9.9 → 15.0 (b3 villages live longer, more days to ration);
mean starved days 0.5 → 1.1.

## Verdict

**GO (CONFIRMED) — full-64 numbers.** 64/64 runs valid (16 seeds x
leadfeast/belongfeast x control/b3, 180d death-aware).

INTEGRITY NOTE (repair 2026-10-19): the numbers committed under this header
on 2026-10-19 09:34Z (f53227a4d) were from a 7-seed PARTIAL sweep
(seeds 95110–95116, n=14/arm): PRIMARY 24,849 / survival 118v117 /
starvation 2v0 / national 11v12. The analysis was never rerun on the full 64
(the partial mean 24,848.6 coincidence proves it). This repair recomputes
from the 64 committed per-seed JSONs. The GO conclusion SURVIVES the
correction — every pre-registered bar holds on the full-64 figures — but the
committed numbers and denominators were wrong and are replaced below:

- PRIMARY GO: mean cooked kcal b3 = 24,653.6 >= 20,000 bar (pilot: 24,812 on
  seeds 94101–94108). Control = 0.0.
- median survival: b3 120.5d vs control 111.0d (>= control - 10 = 101) — GO.
- starvation deaths: b3 8 vs control 15 (<= 15 + 2 = 17) — GO. (The partial's
  2v0 painted a near-zero picture; full-64 shows both arms starving at real
  rates, b3 roughly halving it — the honest story is stronger than the stale
  one.)
- national: b3 24/32 vs control 22/32 (>= 22 - 2 = 20) — GO.
- no new death mode: GO. All substantive modes (combat, monster, contest,
  sickness, wound, starvation, ambush, dehydration, alien, expedition)
  present on both arms (413 control / 420 b3 deaths). The b3-only causes are
  monster-name flavor variants (Highbeam Deer, Bulldozer, Ad Break, The
  Algorithm, Static, Hushpuppy, Lockpick, The Big Beast, The Ugly Beast, The
  Reunion, the night) plus wound flavor variants (wound_fever, lockjaw) —
  seed noise, not new modes. (Limitation: committed JSONs carry aggregated
  causeCounts only, so the pre-registered (who,day,cause) dedup is not
  re-derivable from the landed files; the repair compares substantive-mode
  sets instead — see metric review.)
- laundering: 0. 0 files with errors; cookedKcal>0 iff cookDays>0 on all 32
  b3 runs; control cookedKcal = 0 on all 32. Cooked kcal is the engine's
  post-cook kcalEach x units — per-cookDay yields bounded (3,555–8,087,
  mean 5,803), consistent across all 32 runs.

The landed layer (9f3681154) is CONFIRMED on full-64 evidence. No changes to
the layer.

## Reachability verdict

The confirm does not change reachability. The batch-cook trigger fires on 4.19
mean cook days/run and produces ~24.7k kcal/side (control: 0). Wall numbers
unchanged in kind: national 24/32, table 26/32, wave4 19/32, wave5 0/32,
wins 0 — the lever feeds the pantry, it does not buy reach.

## Metric review

REPAIR (2026-10-19): verdict numbers were a 7-seed partial, not the committed
64. Recomputed independently twice (coordinator + this repair, identical
figures). GO holds; the numbers above replace the stale ones. Repair
instruments: scripts/analyze-cookbulk-confirm-b-repair.js (recomputes
primary + guardrails + laundering + no-new-death-mode from the 64 files,
exits nonzero on any miss).

NON-GUARDRAIL OBSERVATION: exiled 2 (b3) vs 0 (control). Not pre-registered,
not judged — a watch item for the next window-axis run. Do not re-score this
run against it.

METRIC LIMITATION: the pre-registered no-new-death-mode dedup on
(who,day,cause) cannot be re-derived from the committed per-seed JSONs
(aggregated causeCounts only; the raw sweep script died with the orphan
worktree). The repair uses substantive-mode-set comparison instead — same
judgment standard, coarser evidence. Future confirms should keep the raw
(who,day,cause) ledger or say up front the guardrail is aggregated.

PANEL (§15): the committed cookbulk-confirm-b-panel-primary.md/.json and the
before/after .gz files were verified (not rebuilt) against the 64 per-seed
JSONs — before/after gz carry all 16 seeds x 2 policies (32 rows/arm), and
six spot-checked panel values (table invitation rate, national access, player
deaths/run, both policies) match the per-seed files exactly. The panel is
already the full-64 instrument. Coordinator's "stale 7-seed panel" assumption
was wrong; only the Verdict text and the sweep summary json were stale.

## Village assessment

16 seeds, two policies. The b3 villages are pantry villages: full-64 median
120.5d, national 24/32, table 26/32. Starvation deaths roughly halve (8 vs 15)
without buying reach — the food goes to bodies, not the ladder. The s95107
sense transcript (leadfeast) shows the mechanism diegetically: by d40 the
pantry shelves are full (~14 days fresh on hand), Paloma checks the pantry
before heading out and diverts from the harvest to the wood run ("the pantry
can't take more; the wild will keep"), and the village holds a feast with an
empty seat at the fire — grief sitting at the table with them. Named cooks
rotate through the haven (Paloma → Brayden → Zodwa → Stan). The two b3
exiles are the wrinkle worth a look next run.

## Sense-testing (law) — see Verdict section

Sense transcripts staged: sense-cookbulk-confirm-b-leadfeast-s95107.txt,
sense-cookbulk-confirm-b-leadfeast-s95113.txt. (Pilot sense-read deferred from the
pilot; the confirm transcripts are staged for the next sense pass.)








## Sense-testing (law)

READ both staged transcripts in full (s95107: 8,940 lines, d1–d62 voiced + a
cooking/water filtered stream; s95113: 9,032 lines). Verdict: the batch-cook
beats are SENSICAL — diegetically present, coherent, and relevant.

MEANING (is the batch cook a thing in the world, or an invisible number?):
It is a thing. On batch days the village narrates it: "🍲 Paloma cooked for
the haven — meals stretched. Paloma worked the smoke racks too — 3 batches
preserved (~3120 kcal, keeps a couple of weeks)." Named villagers rotate
through the cook role (Paloma → Brayden → Zodwa → Stan), and the trigger
days line up: BATCH-DAY layer lines (s95107: d2 6885 / d3 10185 / d17 17385 /
d18 24225 / d19 31785 / d20 41935 cumulative) coincide with 🍲 haven-cooking
narration (d13/d15/d17/d18/d20 are the engine's own communal cooks; d17/d18/d20
carry the batch days). The System itself reacts to the cooking — "🎨 COLOR:
They cooked it. They did not have to cook it. They cooked it anyway and now
they are SHARING it. I need to sit down." — which is exactly the core thesis
(the System baffled by food) paying off on the lever's axis.

COHERENCE (do the numbers match the words?): the final BATCH-DAY cumulative
(41,935 s95107; 39,175 s95113) equals the per-seed JSONs' cookedKcal exactly.
Water draws (27L → 145L cumulative on batch days) are matched by a constant
chorus of water-haul lines ("The well won't fill itself" × dozens, +2–7L
returns, cistern-dry warnings). No contradictions: nothing claims scarcity on
a day the pantry is recorded full.

RELEVANCE (does it touch the village's life?): yes — the payoff is visible in
behavior, not just counts. By d40 (s95107) the pantry holds ~14 days of fresh;
Paloma checks the pantry before foraging and diverts to the wood run ("the
pantry can't take more; the wild will keep"); the village holds a feast with
an empty seat — grief at the table with them, not over them. People act like
people around the food.

CURIOSITY (not a finding): d2 batch cooked exactly 6,885 kcal in BOTH seeds —
plausible, since the day-2 first batch cooks a fixed fraction of the identical
starting haul; the seeds diverge by d3 (10,185 vs 11,685). No investigation
warranted.

GAP documented (not chased): there are no staged CONTROL transcripts, so the
sense read is b3-only — the "meals stretched" counterfactual can't be voiced
compared. Next confirm should stage one control transcript.

## Wall numbers (this run, FEASTSCALE_R13=1 SEATDRIVE=0)

Full-64 (32 runs/arm), 180d death-aware:

| | control | b3 |
|---|---|---|
| national | 22/32 | 24/32 |
| table | 25/32 | 26/32 |
| wins | 0 | 0 |
| wave4 | 18/32 | 19/32 |
| wave5 | 0/32 | 0/32 |
| median survival | 111.0d | 120.5d |
| max survival | 180d | 180d |
| starvation deaths | 15 | 8 |
| exiled | 0 | 2 |

The scale wall does not move on this lever — national/table/wave4 all at or
near parity, wave5 zero both arms. The lever is a food-economy lever, not a
scale lever; it buys pantry depth (starvation deaths 15 → 8, median survival
111 → 120.5d), not reach.
