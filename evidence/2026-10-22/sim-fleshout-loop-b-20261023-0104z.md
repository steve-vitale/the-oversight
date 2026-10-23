# Run evidence: flesh-out loop-b fleshout-loop-b-20261023T0104Z (axis food-economy — 1 GO pilot + 1 NO-GO→PARKED, both landed)

Axis: food-economy (converging). scale-onramp held by loop A live claim
fleshout-20261022T232307Z.json throughout — zero file overlap by design.
Claim written before any sims; lock created/deleted per protocol. No
stale-lock recovery (no B lock at run start). STANDING DIRECTIVE
acknowledged; assignment from tracker + claims.

## Arm sim-scholardist-b — GO at pilot (landed 67ba0e496)

"The scholar's share": the DISTRIBUTION-side named next of the
scholarbowl-b NO-GO. Scholarbowl's thin-day half-choice FIRED (268
halves, 276.7k kcal saved) but thin-pool starvation moved only 8→7 —
saved kcal thickened bins while mouths starved. This arm keeps the
thin-day scholar draw cap (pantryFreshDays<2, halve the trust-scaled
villageMeal at the pantryDraw choke point) but routes the conserved
half DIRECTLY to the hungriest villager(s) — earmarked, never pooled —
via the engine's own "eaten at the fire" intake channel, voiced
first-person scholar + named recipient + recipient reaction (never a
silent override, #761 honored). Layer scripts/layers/scholardist-b.js,
env SCHOLARBOWL-style SCHOLARDIST=1, default-OFF, zero src/js.

Sweep: 32/32 configs (seeds 67401–67408 × {leadfeast,belongfeast} ×
{control,armed}, intentional paired reuse of scholarbowl-b's corpus),
180d death-aware, FEASTSCALE_R13=1/SEATDRIVE=0, base b7160b82f.
Mechanism fired at scale: 274 thin meals, 259 halves, 115 grants,
122,174 kcal moved, 114 voices, 0 errors. Engagement 16/16 PASS.
PRIMARY (binding): thin-pool starvation 8→4 (bar armed≤control−2) → GO.
Guardrails: g1 total starvation 15→10 PASS; g2 median survival 136→150d
PASS; g3 PASS-on-review (armed-only raw labels 'experiment' =
pre-existing food-knowledge injury path game.js:18123, 'The Ugly Beast' =
village-named monster → combat class; mechanism-class mapping holds);
g4 pantry 4.27→4.77 freshDays PASS (no collapse — recipients draw less,
pool reads thicker). Sense PASS (beats read as people: "You push half
your bowl across the fire to Onni — 'eat. You need it more than I do.'
Onni doesn't argue. The bowl comes back scraped clean."). Adverse
trajectories honestly investigated, not re-scored (§14): s67406-belong
combat collapse first (grants orthogonal to the cause), s67404-belong
exposure effect (+43d life). Panel §15: compare exit 2 review_required
(env-gated descriptive-by-construction, #796); manual paired analysis
judged; leadfeast neutral-positive, belongfeast regression_watch notes
(classified: contract-mislabeled combat-death metric #753 + the s67406
combat-collapse trajectory).

Wall (scholardist corpus): control national 9/16, table 11/16, wins
0/16, wave4 10/16, wave5 0/16, median 136d; armed national 11/16, table
10/16, wins 0/16, wave4 13/16, wave5 0/16, median 150d. The wave-5 door
remains the binding wall (0/32 unlocks).

Blank filled: the deferral-routing gap — conserved thin-day kcal now
reaches starving mouths by name through the engine's own intake
channel. Blanks documented: d1 thin-gate fires before burnHistory
stabilizes (thindefer-b metric-review #4, still open); harvest-ledger
attribution fiction (gift rides recipient's ownEat channel); trust
question (sustenance, not a social deed — no trust movement by design;
Steve-call if the real UI wants warmth). Metric review: PRIMARY exposure
sensitivity (corpus-total counts punish the arm for keeping villages
alive longer); food-knowledge injuries + village-named monsters mapped
at analysis time (analyzer fix for next run). Named next: confirm run
(12–16 seeds). The real choice UI (full/half/grant) is Steve's design
task — this measured the grant policy headless only.

## Arm sim-storageshed-b3 — NO-GO → PARKED (landed 4f192e317)

Unpark of the STORAGESHED storage-half lever (spec sim-storageshed-b.md,
autopsy sim-storageshed-b2.md) with the tracker-named primary:
preserved-rot/100d ≤ 0.80, overall AND per-policy. 32 configs (fresh
seeds 63001–63008 × {leadfeast,belongfeast} × {control,armed}), 100d
death-aware, FEASTSCALE_R13=1/SEATDRIVE=0. PRIMARY: overall 0.538 → GO,
leadfeast 0.281 → GO, belongfeast 2.316 → NO-GO. Root cause (measured):
single seed 63003 — armed preserved-rot 14,399 vs control 2,712,
driven by 91 vs 22 plenty-rack-days; the lever's equilibrium effect
(keeping food fresh extends plenty 4×) confounds the absolute —
preserved rot scales with plenty-regime length. Mechanism healthy:
per-plenty-day rack rate 0.567×/day on belongfeast (0.56–0.59× across
three runs, both policies). Without 63003 the leg is 0.93 — genuinely
noisy at n=8, not one seed from GO. Engagement 14/16 PASS (458
shed-days, 1.2M kcal shed). Guardrails all PASS (survival 100=100d,
starvation 7=7, national 11=11, no laundering; "the expedition" death =
pre-existing content cause, zero new registerDeath calls — canonicalizer
rule filed). rot/100d absolute 1.190 ok; fresh-rot/100d 1.238 (b2's
+53% trade reproduces milder at +24%). Proof 36/36, det-gate
byte-identical off, panel §15 invalid-by-contract (env-gated) with
manual paired analysis (no broad-balance footprint). Sense PASS.

PARKED, not killed (kill discipline): the miss is metric-design
(single-seed equilibrium confounding of an absolute proxy), not a lever
miss. Metric review for the next unpark: primary = per-plenty-day rack
rate ≤ 0.70 (stable behavioral measure across 3 runs), preserved-rot
as a ≥16-seed secondary. Blanks filled: (1) caught a spec-vs-patch bug —
the parked patch's shed block DESTROYED the shed half (units reduced,
no fresh copy), violating its own spec and PRESERVATION.md's
no-nonsensical-calorie-loss canon — ported the b2 re-implementation
(honest fresh copy) line-for-line; (2) refreshed
~/workspace/storageshed-parked.patch from the corrected
re-implementation (verified applying cleanly to master 2751fa0555;
post-rebase proof 36/36 with patch applied-then-reverted).

Wall (storageshed-b3 corpus): national 11→11, table 0, wins 0, wave-4
8→8, wave-5 0/16 both, median 100d (horizon-capped).
Reachability-neutral.

## Telemetry deviation check (Steve 2026-10-13)

scholardist-b corpus: 2 LOUD (national 12→20, wins 16→0, n=32) =
REGIME artifacts (winseat full-stack baseline vs SEATDRIVE=0 pre-seat
corpus, wins structurally 0) + n-mismatch; baseline NOT rolled.
storageshed-b3: per-seed corpus not committed per the no-cache rule —
worker's classification (same schema+regime artifacts) stands as the
recorded judgment; baseline NOT rolled.

## Convergence

food-economy stays converging: the distribution-side thin-pool lever is
now proven at pilot (scholardist GO — conserved kcal reaches mouths by
name; confirm named next), the storage half parks again with a stable
behavioral metric named for its next unpark (per-plenty-day rack rate
≤0.70); the thin-pool Lever-2 pool-thickness line is dead on both sides
(thindefer-b killed + scholarbowl NO-GO). Live open lines: #643
portion-law steve-call, expedition-recall design steve-call, storageshed
next-unpark metric named, scholardist confirm (12–16 seeds), the d1
thin-gate artifact, the real choice UI (Steve's design task). The
wave-5 door remains the binding wall on every substrate.

Claim deleted; lock deleted. Infra: worktree-register.sh attached
sim-storageshed-b3 to a stale same-slug branch (e9f5d5a7e vs master
b7160b82f) — caught via the register lesson, reset --hard to master
before briefing. Master moved 3× mid-run (loop-A vetbench, rogue P0,
playtest landings); both arms rebased clean with proofs re-verified
post-rebase, ff-only merges. The scholardist worker's handoff arrived as
an empty duplicate — verdict recovered independently from the committed
evidence (GO, 8→4) and the branch was landed by the coordinator.
Registry clean; main tree clean at closeout (67ba0e496).
