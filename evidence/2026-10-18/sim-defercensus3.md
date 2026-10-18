# sim-defercensus2b — 3-substrate wave-4 readiness deferral census on current master (2026-10-18)

Run: flesh-out loop arm sim-defercensus2 (run_id fleshout-20261018T0715Z), axis scale-onramp (the blocking axis).
Canon: docs/CANON.md + docs/MONSTER-WAVES.md (read first; the gate is design call #4 — four bars: armored 4 @ P>=15 / armed 5 / tricks 3 / veterans 2). ZERO src/js changes, ZERO scripts/policies changes — read-only diagnostic arm. Instruments + evidence only.

LINEAGE: this is the second defercensus arm today. The 0515Z arm (evidence/2026-10-18/sim-defercensus2.md, 16 runs, courtship substrate only, DIAGNOSTIC GO) stands as its own record and is NOT overwritten — this file is the 3-substrate extension on 8 fresh seeds (48 runs).

## The question

After the crisistier (real raid crisis tiers), fieldfeast-kill, vetrel (companion veteran channel), reposition (movement-kind execution), nodewitness (witness observation channel), tricktag (companion kill attribution), and vetdemand (demand analysis) landings: WHERE does the wave-4 readiness gate bind NOW, on which substrate? Three composed policy substrates:

- (a) **courtship** — pre-seat courtship baseline: plain TF.leadfeast / TF.belongfeast (no driver). SEATDRIVE=0 explicit (sim-villagevoice 2026-10-16 method note: SEATDRIVE unset != driver active; pre-seat runs set SEATDRIVE=0). VETREL / REPOSITION / NODEWITNESS unset.
- (b) **readiness** — the landed readiness substrate: VETREL=1 + REPOSITION=1 + NODEWITNESS=1, composed as withVetrel(withReposition(TF base)). SEATDRIVE=0 explicit.
- (c) **winseat** — full win-side stack with the seat driver explicitly composed: withSeatDrive(withWinDefer(withVetrel(withReposition(TF base)))). VETREL=1 REPOSITION=1 NODEWITNESS=1, SEATDRIVE=1 explicit.

8 fresh seeds (51331, 51342, 51353, 51364, 51375, 51386, 51397, 51408 — verified unused in evidence/) x {leadfeast, belongfeast} x {a, b, c} = 48 runs, 180d death-aware. All substrates share FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 (+ WINPURSUIT=1 WINDEFER=1 set in-process; the windefer wrapper is composed only on winseat — on (a)/(b) the env is inert, exactly matching the 0515Z corpus composition).

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE the sweep)

**Deferral-day method** (reused EXACTLY from scripts/wave4census-lib-20261017.js, same as the 0515Z arm): a deferral day mirrors the defer4 hold in `Game.villageStandingTotal()` (src/js/standing.js): raw Standing >= t4 (=100) AND !ready AND peak < 4 — the Standing door is open and readiness alone holds it shut. Binding = intersection of the engine's OWN `short` set (`Game.waveUnlockReady(4)` -> `waveCombatReadiness(4)`, the four named bars: armor / weapons / tricks(=counters) / veterans) over all deferral days:
- single bar — present in `short` on ALL deferral days
- `multi:a+b` — 2+ bars co-bind (non-empty intersection, >1)
- `none-single` — deferral days exist, intersection empty (rotating bind)
- `standing` — zero deferral days AND peak < 4 (scale/on-ramp bound, not readiness)
- `unlocked` — peak >= 4 during the run (readiness was satisfied, not binding)

**PRIMARY (diagnostic GO, binding):** 100% attribution of deferral days to bars with 0 unattributed rows — GO = 48/48 runs classified, every wave-4-unlock deferral tagged to its binding bar(s). `none-single`, `standing`, `unlocked` are honest attributions, not failures. The verdict names the binding bar per substrate with counts (not a lever GO/KILL — this is a census). Fidelity: re-run completed runs and confirm the classification reproduces byte-identical (det-gate on 4 fixed seeds per substrate, byte-identical re-runs). A miss is NO-GO, never re-scored.

**Per-run census fields:** binding-bar label; wave-4 unlocks (maxWave); firstW4Day; deferralArmorMargin = rd.armored − 4 at the LAST wave-4-unready day (the butcharmor metric, scripts/judge-butcharmor-20261018.js).

**Historical comparison (pre-registered):** compare explicitly against the two corpora — wave4reach (2026-10-16: armor+veterans co-bound 21, veterans-bound 10, armor-bound 1) and sim-vetdemand (2026-10-17: gate-level 0/4 flip runs release on the composed win stack; armor co-binds at every observed deferral snapshot) — plus the 0515Z defercensus2 corpus (16 runs: veterans 6 single + 10 multi:armor+veterans; veterans 100% of 1,529 deferral days; armor co-bind 90.5%; 0/16 unlocks). Say what moved.

## Results

**PRIMARY: GO — 48/48 runs attributed (100%), 0 instrument errors, 0 unattributed.** Per-seed JSONs: evidence/2026-10-18/perseed-defercensus2b/ (48 files; substrate-prefixed). Fidelity/det-gate: see below.

### Binding-bar counts per substrate

| binding | courtship (n=16) | readiness (n=16) | winseat (n=16) |
|---|---|---|---|
| veterans (single) | 5 | 7 | 7 |
| multi:armor+veterans | 5 | 4 | 4 |
| armor (single) | 0 | 0 | 0 |
| weapons (single) | 0 | 0 | 0 |
| counters/tricks (single) | 0 | 0 | 0 |
| none-single | 1 | 0 | 0 |
| standing | 3 | 2 | 2 |
| unlocked | 2 | 3 | 3 |

**Veterans is in the binding set on every run that deferred on readiness** (all 11 non-unlock/standing courtship runs, all 11 readiness, all 11 winseat). Weapons bind on 0. Tricks/counters bind on 0.

### Deferral-day anatomy

| bar | courtship (1,236 days) | readiness (1,136 days) | winseat (857 days) |
|---|---|---|---|
| veterans | 1,217 — **98.5%** | 1,136 — **100%** | 857 — **100%** |
| armor | 727 — 58.8% | 670 — 59.0% | 533 — 62.2% |
| weapons | 86 — 7.0% | 12 — 1.1% | 12 — 1.4% |
| tricks (counters) | 0 — 0% | 0 — 0% | 0 — 0% |

### Distance-to-threshold (median max / demand)

| bar | demand | courtship | readiness | winseat |
|---|---|---|---|---|
| veterans | 2 | 1 (range 0..2) | 0 (range 0..2) | 0 (range 0..2) |
| armor (P>=15) | 4 | 4 (margin −2) | 4 (margin 0) | 4 (margin 0) |
| weapons | 5 | non-binding | non-binding | non-binding |
| tricks | 3 | satisfied many times over (14+ known at deferral) | same | same |

deferralArmorMargin medians: courtship −2, readiness 0, winseat 0 (n=16 each; all non-null).

### Wave-4 unlocks

| substrate | unlocks | firstW4Day |
|---|---|---|
| courtship | 2/16 | 104 (belongfeast-s51331), 121 (leadfeast-s51342) |
| readiness | 3/16 | 110 (belongfeast-s51342), 62 (belongfeast-s51408), 67 (leadfeast-s51408) |
| winseat | 3/16 | 110 (belongfeast-s51342), 62 (belongfeast-s51408), 67 (leadfeast-s51408) |

7 of 8 unlocks released cleanly: on the unlock day the veteran count went 1→2, ready=True, short=[]. The 8th (s51408, seen on both readiness and winseat — same seed, identical early trajectory) released via the **transient-veteran mechanism**: a d58 wave-3 companion kill (benoit_lambert, via='companion' — the vetrel/tricktag channel working) plus a d62 wave-3 scholar kill (gen_z5ufm4o) gave 2 LIVING veterans at the gate-evaluation instant; the fail-closed gate opened honestly (peak 0→4); the scholar died in combat later the same day. The one-way peak ratchet kept the release. Post-day-62 snapshots read vets=1 (benoit, confirmed living at day 75 via vpOf). Documented, not a bypass — the taxonomy's `unlocked` label is honest ("readiness was satisfied"), but the bar was satisfied transiently.

### Wall numbers

| substrate | national | table | wave-4 | wave-5 | wins | village-lost | median survival |
|---|---|---|---|---|---|---|---|
| courtship | 12/16 | 13/16 | 2/16 | 0/16 | 0/16 | 8/16 | 177d |
| readiness | 12/16 | 11/16 | 3/16 | 0/16 | 0/16 | 6/16 | 107d |
| winseat | 12/16 | 8/16 | 3/16 | 0/16 | 7/16 | 5/16 | 90d (win-truncated) |

Note: winseat and readiness unlock the SAME seeds on the SAME days (51342→d110, 51408→d62/d67) — the unlocks are seed-determined and substrate-invariant between (b) and (c); the seat driver changes the ending (7/16 wins, runs truncate ~d90), not the gate.

## Historical comparison (what moved)

1. **The gate is now demonstrably clearable on all three substrates: 8/48 unlocks.** The 0515Z corpus (same courtship composition, different seeds) had 0/16; the fresh-seed courtship baseline clears 2/16. This is seed variance around a rare event, not a substrate change — but it retires the "0/16, never" reading: the courtship road CAN walk through the door (~1/8), the readiness road clears ~1/5.
2. **Veterans still binds everywhere it matters** — 98.5–100% of deferral days across all three substrates, in the binding set on 100% of readiness-deferred runs. Replicates wave4reach (veterans-bound 10/32, co-bound 21/32) and the 0515Z census directionally.
3. **Armor's co-bind share FELL: ~59–62% now vs 90.5% in the 0515Z corpus.** The armor bar is closer on the composed substrates (median deferralArmorMargin 0 on readiness/winseat vs −2 courtship; median maxArmored 4 = demand on all three). Armor is the secondary co-binder, no longer the near-constant companion it was.
4. **Weapons/tricks remain structurally non-binding** (tricks 0% of deferral days on all substrates — counters are learned 5–8x over demand; weapons ≤7%).
5. **The vetrel companion channel is now observed end-to-end in the census**: the d58 companion wave-3 kill (via='companion', tricktag attribution) is half of the transient-veteran release on s51408 — the first census-observed unlock traceable through the companion-veteran channel.
6. **vetdemand's "armor co-binds at every observed deferral snapshot" is softened**: armor co-binds at ~60% of deferral days here, not ~100%. The composed win stack releases (3/16 on winseat) with armor at/above demand at release.

## Village assessment (plain words)

The modal village on all three substrates: opens the Standing door around day 50–80 (raw 100), grinds wave-3 overtime with raw Standing climbing to 250–480, learns counters prodigiously (14+ known), arms its fighters — and usually never unlocks wave 4 because it cannot keep two killers alive at once. The kill channel eats its own: everyone who lands a wave-3 killing blow is a marked fighter, and the wave-3 overtime meatgrinder kills veterans about as fast as the village makes them (median max living veterans 0–1 on every substrate).

What the readiness layers changed: vetrel's deliberate wave-3 hunts manufacture the second veteran more often (3/16 unlocks vs 2/16; the d62 transient release is the mechanism made visible), but the hunts cost village life — median survival 107d on readiness vs 177d on courtship, and the vetrel proof's survival guardrail is the reason. The armor bar, meanwhile, quietly stopped being the co-binder it was: villages hold 4 armored at P>=15 about as often as not on the composed substrates (margin median 0).

Who thrived: the scholars and companions who learned counters and stood down wave-3 monsters; the 7/16 winseat villages that took the seat and won (wins truncate ~d90, before the overtime grind). Who died and why: the killers — the scholar who landed the releasing blow died the same day on s51408; the armed roster bleeds to the overtime (belongfeast courtship runs lost 78-death sieges). What was missing: a second LIVING killer at the same time, and the luck/timing for both to be alive at the gate instant. Not knowledge (counters 5x over), not weapons.

## The named next

Unchanged in direction, sharpened by the transient-veteran finding: **the veteran bar is now the only structural bind, and it is clearable but fragile** — the gate evaluates living veterans at an instant, and the village must have two killers alive simultaneously. The vetrel channel manufactures the second killer but doesn't keep them alive (the d62 scholar died hours after the release). The next experiments are about veteran SURVIVAL through the release window (companion-survival is half-built in vetrel; the scholar has no equivalent), or Steve's #427 ruling on the 2-living-veteran demand shape. The armor bar needs no new work on this evidence (margin median 0 on composed substrates).

## Metric review (§14 — binding, never re-scored)

1. **100% attribution:** 48/48 runs classified, 0 instrument errors, 0 census errors across all substrates. `none-single` (1), `standing` (7), `unlocked` (8) are honest taxonomy outputs, not voids.
2. **Transient-veteran unlock (s51408 ×2):** classified `unlocked` — verified honest via waveKillLog (d58 companion w3 kill + d62 scholar w3 kill), gate code (fail-closed; release requires rd4.ready at evaluation), and post-hoc liveness (benoit_lambert living at day 75 via vpOf). The end-of-day snapshot reads vets=1 because the scholar died after the release; the taxonomy keys on peak>=4, which is the engine's own release record. Not re-scored; documented as mechanism.
3. **Same-seed unlock invariance (readiness vs winseat):** the identical unlock seeds/days across (b) and (c) is evidence the seat driver doesn't move the gate — reported as found, not adjusted.
4. **Gate-code currency:** verified before the sweep — waveCombatReadiness/waveUnlockReady/villageStandingTotal unchanged since the 0515Z census; VETSHAPE unset (pristine 2-living-veterans); crisistier/nodewitness/tricktag changes confirmed present in origin/master game code and identical in the worktree (git diff origin/master HEAD -- src/js/ empty).
5. **Det-gate + fidelity:** det-gate 4/4 byte-identical per substrate (courtship, readiness, winseat — instrument provably read-only, both-repeat); fidelity 2/2 per substrate re-runs reproduce byte-identical hashes with identical binding classification. Proof scripts/test-defercensus3-20261018.js: 12/12 GREEN (6 predicate-mirror fixtures + 3 SMOKE + 3 DET).
6. **Seeds:** 8 fresh (51331–51408), verified unused in evidence/ before the sweep.

## Convergence

**converging.** The diagnostic GO is met on current master with fresh seeds across all three composed substrates: 100% attribution, determinism proven, and the binding picture is now substrate-resolved: veterans binds 98.5–100% of deferral days on every substrate; armor co-binds ~60% (down from 90.5%); weapons/tricks non-binding; the gate clears 2–3/16 per substrate (8/48 total) including the first census-observed companion-channel unlock. The axis stays scale-onramp; the next step is veteran-survival through the release window or Steve's #427 ruling — not another census. No game change: zero src/js changes, zero scripts/policies changes — instruments + evidence only.

## Sense-testing (SENSE-TESTING LAW)

Two 60d transcript side-runs (courtship/leadfeast-s51331, winseat/belongfeast-s51342; fullTelemetry; SAY lines captured): evidence/2026-10-18/defercensus2b-transcripts/. Four reads:

**1. The trust gate is legible (courtship d1).** "Why should I listen to you?" (Trust too low.) / "You haven't earned that yet," / "Ask someone who trusts you." — refusals name their cause every time; a day-one stranger gets stonewalled and the fiction says why. Coherent.

**2. Teaching is a visible social act with memory (winseat d5–d8).** "Ming is showing everyone small hard green-yellow apples on a low thorny tree by the fire. 'See the leaves? Like that. Don't mix it up.' The journal grows — the human way." / "Ming showed [her] the Mesquite — 'remember it.' Word gets around." / "Hold on — I already showed you this one. Hickory Nuts. You remember." — knowledge moves person-to-person, the teacher remembers teaching, the learner is named. This is villagers acting like people.

**3. Friction has a voice (winseat d5–d6).** "A woman, maybe 50s plants themself in front of you. 'This isn't working. You know it, I know it. Say it out loud.'" / "Interesting. Nobody asked me." — dissent is specific and consequential-sounding, not flavor. (Whether the player can answer it is a separate blank — the line lands as an event.)

**4. The System's voice is unhinged on-model (winseat d7).** "Why do the small humans keep putting organic matter in their FACE-HOLES? We built you a fusion pellet! ...You BURIED it. WHY did you bury the pellet?!" / "Betrayal arcs test VERY well with our demographics!" — the alien-out-of-touch register from canon, performed not described. And the village reacts in-fiction: "Pablo grabs your arm. 'Tell me you hear that too.'"

Limitation (honest): the reads are SAY-line transcripts, not played conversations — the one-message-at-a-time dialogue box flow wasn't exercised. The lines cohere and carry consequences (trust blocks, teaching sticks, dissent events).

## Files

- scripts/defcensus3-sweep-20261018.js — 3-substrate sweep + SMOKE/DET/FIDELITY modes (this run)
- scripts/defcensus3-analyze-20261018.js — per-substrate analyzer (this run)
- scripts/test-defercensus3-20261018.js — proof: fixtures + SMOKE + DET per substrate (this run)
- scripts/defcensus3-transcripts-20261018.js — SAY-line transcript side-run (this run)
- scripts/probe-s51408-20261018.js — one-off transient-veteran diagnostic (this run; superseded by the evidence note)
- evidence/2026-10-18/perseed-defercensus2b/ — 48 per-seed JSONs (daily readiness snapshots + deferral-day armor-margin censuses + firstW4Day + deferralArmorMargin)
- evidence/2026-10-18/defercensus2b-transcripts/ — 2 SAY-line transcripts (sense-testing)
- evidence/2026-10-18/sim-defercensus3.md — this file
- ZERO src/js changes, ZERO scripts/policies changes (read-only arm)
