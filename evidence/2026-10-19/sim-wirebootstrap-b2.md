# sim-wirebootstrap-b2 — trapline bootstrap drive (backlog #633)

Run: `fleshout-loop-b-20261019T1630Z` (loop B, second axis). Worker tree: `sim-wirebootstrap-b2`.
Salvage: orphan tree `sim-wirebootstrap-b` from the dead run `fleshout-loop-b-20261019T1530Z`
(stale-lock recovery already performed by the coordinator). All five salvaged scripts copied
byte-identical except `sweep-wirebootstrap-b.js` OUTDIR (`perseed-wirebootstrap-b` → `-b2`).

## Pre-registration (metric binding, MEASUREMENT.md §14)

- **Primary**: runs with ≥1 trap set by day 30 (the #633 fragility metric — baseline 4/8 seeds
  had zero traps in 180d; this pilot's control showed 7/16 zero-trap runs).
- **GO**: armed ≥ 12/16 runs with first-trap ≤ day 30 AND armed total traps set ≥ 1.25× control.
- **Horizon**: 180d death-aware (dead villages stop, +10d tail max).
- **Policies**: leadfeast / belongfeast (FEASTSCALE_R13=1, SEATDRIVE=0). WIREBOOTSTRAP=1 armed;
  unset = control (byte-identical — proven by det-gate 16/16).
- **Guardrails**: villager starvation deaths ≤ control+1 (paired per run); median survival no
  worse than −10d; no new death mode (revised ≥2-event rule).
- **Wall** (report-only): national / table / wins, wave 4–5 unlocks, median/max survival.

## Lever played

`scripts/policies/wirebootstrap.js` (policy-side, zero src/js, default OFF, env-gated
WIREBOOTSTRAP=1): a bootstrap drive. The scholar (1) shops hawkers for snare_wire — one
hawker conversation/day, buys only when the ware IS snare_wire and affordable from a surplus
(≥1.5× price in pack finished-food; never the last meal; polite pass otherwise); (2) takes
the engine's wire-tackle path via `setTrap('snare')` when holding wire on wild ground (wire
+ 2-use improvised snare, no recipe knowledge — the Steve 2026-10-05 honest tackle). The
drive goes permanently quiet once any trap is set — a bootstrap, not a trap factory.

Proof: `scripts/test-wirebootstrap-b.js` — **14/14 GREEN** (RED honesty: gate-off = strict
no-op, zero verbs, zero ctx writes; GREEN: buy/pass/thin-pack/one-per-day/no-hawker/
holding/wire-path-set/set-refused/tra traps-settled-quiet; ENGINE: wire path consumes wire
+ 2-use snare with recipe L0, RED without wire; SMOKE: 6-day live run, no errors).
Det-gate: `scripts/det-gate-wirebootstrap-20261019.js` — **16/16 IDENTICAL** (8 seeds ×
2 policies × 60d, layer OFF). Note: a VM service restart killed the first det-gate attempt
mid-run (~35 min in); re-ran from scratch post-reboot, passed clean.

## Before/after (16 runs/arm: seeds 31701–31708 × {leadfeast, belongfeast}, 180d death-aware)

| metric | control | armed | verdict |
|---|---|---|---|
| runs with first-trap ≤ d30 | 0/16 | 4/16 | MISS (bar 12/16) |
| total traps set | 38 | 31 | 0.82× — MISS (bar 1.25×) |
| median first-trap day | 93 | 28 | — |
| trapline kcal | 42,350 | 58,050 | — |
| trap catches | 79 | 104 | — |
| median survival (days) | 158 | 118 | −40d — guardrail MISS (bar −10d) |
| starvation deaths | 4 | 5 | 1 paired fail (see below) |
| national / table / wins | 0/0/0 | 0/0/0 | — |
| wave max | 4 | 4 | — |

Paired starvation guardrail: 1 fail — belongfeast s31702: control 1 → armed 5.
New-death-mode check: armed-only keys `experiment`(1), `The Landlord`(1), `Sunbasker`(2),
`The Reunion`(1) — all monster-name keys from perturbed trajectories; the layer has no
kill verb. Judgment: not a layer-attributable new death mode (see metric review).

**Mechanism attribution** (the 4 armed by30 runs):
- belongfeast s31708, firstDay 25 — **mechanism**: 1 hawker check, wire in hand day 21
  (NOT bought — see sense section), layer SET path fired day 25 → 2-use snare → 2 catches.
- leadfeast s31702 (d6), belongfeast s31702 (d6), belongfeast s31704 (d28) — **trajectory
  noise**: wb telemetry all zero; the teach/craft channel fired earlier on RNG-perturbed
  trajectories, not via the layer.

Layer engagement totals: 6 hawker checks / 16 runs, **0 wire wares offered**, 0 wire bought,
1 wire set (from non-bought wire). The ACQUIRE leg never fired once.

## §15 balanced-panel compare

`scripts/build-wirebootstrap-panels-b2.js` → `evidence/2026-10-19/wirebootstrap-panel-b2.{md,json}`
(+ `-before.json.gz` / `-after.json.gz`). Panel decision: **review_required**. Notable:
leadfeast communityLost regression_signal (0.5 → 1.0, paired delta +0.5); belongfeast
survival30/60 regression_watch (−0.125). Wall metrics no_material_signal (0/0/0 both arms).
The panel is the instrument; the pre-registered threshold is the judge. The community-loss
signal is consistent with the RNG-perturbation mechanism documented in metric review, not
with the bootstrap mechanism (which barely engaged).

Telemetry deviation check vs `telemetry-baselines/scale-wall.json`: LOUD on
national/table/wins disappearance — **documented regime artifact**: the baseline's own
`_regime` note says never compare the pre-seat substrate (SEATDRIVE=0, this pilot) against
the winseat baseline. Not a same-run finding.

## Village assessment

What the villages looked like: 16 control villages on the pre-seat feast substrate. The
#633 fragility reproduced harder than the original finding — **7 of 16 control runs set
zero traps in up to 180 days** (leadfeast 31703/31705/31706?/31707/31708, belongfeast
31701/31705/31707). Where the trapline did engage, it engaged LATE (median first trap day
93) and only where the trust-15 teach beat fired. The organic channel is real but
seed-gated: the s31707 sense transcript shows it at its best — Caleb teaching Linh to tie
a snare, the scholar learning "Wire Snares (Level 1): a loop of wire on a game trail…
Check at dawn," then a living dawn trapline with honest empty-checks ("Snares were empty.
They'll keep.") and real catches (+149/+241/+315 kcal to the pantry).

Who thrived and died and why: villages died to combat, not hunger — wave 4 reached on
13/16 control runs, wave 3 on the rest; `village-lost` endings dominate, starvation deaths
only 4 across 16 runs. The trapline, where it existed, paid real food (42k kcal control).
Nobody reached national/table/wins — structurally ~0 on this pre-seat substrate (regime
artifact, not a lever effect).

What knowledge was missing: the wire-tackle path (wire in hand → snare, no recipe) is
engine-real but undiscoverable — no villager teaches it, no codex entry points at it, and
the hawker channel that could sell the wire offers it at ~1% per conversation (see metric
review). The blank #633 named is confirmed and still open.

## Sense section (SENSE-TESTING LAW — transcripts read, not just counted)

Three armed transcripts (`evidence/2026-10-19/wirebootstrap-sense-b2/`, belongfeast
31705/31707/31708, 35d, narration on):

1. **The hawker shopping reads like a person, when it happens** — but it almost never
   happens. Six checks in sixteen 180-day runs; the 'hawker' choice often isn't even
   offered (the villager's spirit rolls 0 at conversation time). The polite pass
   (`hawker_no`) is honest. The drive is a ghost: present, polite, and unfed.
2. **The wire-path tackle reads as an honest bootstrap** (s31708): "(The snare wire
   becomes the snare — improvised, 2 uses.) You set a Snare here. Check it tomorrow."
   Two opossum catches at ~1200 kcal on the bone, then "The Snare broke. You'll need
   another." The 2-use limit is honored and narrated. The uncleaned meat rotting
   ("went bad — beyond saving. You leave them for the flies") is the food-reality
   system working as designed. This leg is PROVEN — keep it.
3. **The wire in s31708 was stolen, not bought.** "Taken: Rain Shell x1, Hunting spear
   x1, Sharpened stick x1, Snare wire x1. You take … snare wire from Stephen. Your hands
   know what they did. (+14 trauma)" — the base policy's theft verb (allowed, socially
   punished, trauma applied) supplied the wire; the layer's SET leg used it. The layer's
   ACQUIRE leg contributed nothing. Irony noted: theft is already a working wire channel.
4. **The village reads like people.** Around the fire after Marisol kills "The Living
   Wire": "Marisol has been quiet all evening, and now everyone knows why… 'So it
   bleeds.' … 'So — what are we calling it?'" The teach beat ("Hands patient. It takes
   three tries."), the dawn trapline patter ("Wire doesn't lie."), Miguel's "That snare
   line needs checking. Talk later, work now." — this is a living village. Nothing
   robotic in the sampled lines.

## Metric review (REQUIRED)

1. **The primary missed, and 3 of the 4 armed "successes" are not the mechanism.**
   Only belongfeast s31708's day-25 trap came via the layer's SET path; the other three
   by30 runs are trajectory noise (see §2). The honest mechanism-attributable by30
   count is 1/16, not 4/16. The metric is not re-scored — the miss stands as NO-GO —
   but the next arm must measure mechanism-attributed engagement (wireBought/wireSets >
   0), not raw first-trap day.
2. **RNG hygiene finding (new, for the backlog): the layer's hawker enumeration
   consumes game RNG.** `hawkers()` calls `Game.tradeSpirit(vid)` daily for every
   roster villager; `tradeSpirit` lazily rolls `_tradeSpiritRolled` via `R()` once per
   unrolled villager (betrayal.js:3116-3118). The engine itself only rolls this via
   trade verbs or scamDaily-with-pending-scams, so the layer's daily enumeration is
   usually the FIRST roll — shifting the game RNG stream on every armed run. Evidence:
   armed leadfeast s31701 (no unrolled villagers left) ran byte-identical to control;
   s31702 diverged to a wholly different trajectory (d106 vs d180) with the layer never
   firing (all wb counters zero). The det-gate (16/16 IDENTICAL) only pins the OFF side;
   the ON side's perturbation is mechanism+RNG mixed, as the det-gate header warned.
   **Recommendation for the next arm**: enumerate hawkers RNG-clean — mirror
   tradeSpirit's deterministic gates (entrepreneurial flag, shopkeep-blood occupations)
   plus already-rolled `_tradeSpiritRolled`, never triggering the roll. Villagers the
   engine hasn't rolled yet are simply not shopped until the engine rolls them through
   its own verbs.
3. **The ACQUIRE leg is broken by the numbers.** `hawkerOffer` builds the ware with
   `R() < 0.5` → tool (uniform over ~40 tool-class items) else food. P(snare_wire per
   hawker conversation) ≈ 0.5 × 1/40 ≈ 1.25%. Six checks in sixteen runs → expected
   wire wares ≈ 0.075; observed 0. The drive as designed can essentially never buy
   wire. A working acquire leg needs a targeted verb ("ask for wire"), a different
   source, or much higher wire weighting — a design decision for the next arm, not a
   tuning tweak.
4. **Guardrail misses are noise-driven, but they are misses.** Median survival −40d and
   the belong-s31702 starvation pair (5 vs 1) both trace to RNG-perturbed trajectories
   on seeds where the layer never fired — not to the bootstrap mechanism. Under metric
   binding they still count. The RNG-clean fix (§2) removes this confound class for
   the next arm.
5. **Telemetry-check LOUD is a regime artifact** (baseline `_regime` note excludes the
   pre-seat substrate). Not investigated further.
6. **Panel compare**: review_required with a leadfeast community-loss regression_signal
   — consistent with the perturbation story; the bootstrap mechanism barely engaged,
   so the panel mostly measured noise. The instrument worked; the judge (pre-reg) says
   NO-GO.

## Convergence verdict

**KILLED-AT-PILOT** (metric-broken, NOT concept-dead). Classification:
- The SET leg (wire in hand → improvised 2-use snare → honest narration → catches) is
  PROVEN in live sims and reads beautifully. Keep the design.
- The ACQUIRE leg (hawker shopping for wire) is broken by the ware math (~1%/convo)
  and never fired. Needs redesign, not tuning.
- The layer's RNG hygiene (tradeSpirit enumeration) confounds sim measurement; fix
  before any re-run.
- Next arm (new run, not this one): RNG-clean hawker enumeration + a targeted wire
  acquisition channel; primary = mechanism-attributed engagement (wireSets > 0 with
  wireBought > 0), not raw first-trap day.

Kill protocol executed: `scripts/policies/wirebootstrap.js` deleted zero-trace.
Instruments kept: `scripts/test-wirebootstrap-b.js` (14/14 GREEN proof),
`scripts/sweep-wirebootstrap-b.js`, `scripts/det-gate-wirebootstrap-20261019.js`,
`scripts/probe-wirepack-20261019.js`, `scripts/sense-wirebootstrap-b2.js`,
`scripts/build-wirebootstrap-panels-b2.js`, per-seed JSONs
(`evidence/2026-10-19/perseed-wirebootstrap-b2/`), panel compare
(`evidence/2026-10-19/wirebootstrap-panel-b2.*`), sense transcripts
(`evidence/2026-10-19/wirebootstrap-sense-b2/`).

## Run notes

- Stale-lock recovery: the coordinator performed it before this run (previous loop-B run
  `fleshout-loop-b-20261019T1530Z` died mid-development; its orphan tree
  `sim-wirebootstrap-b` was salvaged).
- VM service restart ~17:16 UTC killed the first det-gate attempt (~35 min in); re-ran
  from scratch, 16/16 IDENTICAL. No work lost (all files under ~/workspace).
- Sim cost: det-gate ~15 min (16×60d×2), control sweep ~35 min, armed sweep ~40 min,
  sense ~2.5 min.
- #633 marked with the honest outcome (NOT fixed) — see sim-findings.md.
