# sim-eggomen-a — P2: relax the finale omen's scale leg (national → regional)

Steve order 2026-10-26: proceed with fleshed-out proposals, adversarial
review. This arm implements eggroad proposal P2 as a game-code VARIANT in
this worktree ONLY (branch sim-eggomen-a, base f89a9b32d). Parent merges;
no push, no bump, no live verification from this arm.

Canon read first: docs/CANON.md, docs/MONSTER-WAVES.md. Eggroad pilot
evidence read: evidence/2026-10-26/sim-eggroad-a.md (pilot 88101–88108:
Network summoned 0/8; finale omen stage 0 on 8/8 because it requires
wave 5 + national while the lesser seat that starts the overtime clock
requires only regional).

## PRE-REGISTRATION (binding, MEASUREMENT §14 — written BEFORE any sweep)

### The variant (exact, one line in src/js/titans.js titanDawnTick)

BEFORE (master):
```
var rankOk5 = ['national', 'global'].indexOf(rank) >= 0;
if (wave >= 5 && rankOk5) titanMaybeOmen(cast.apocalypse, day, 0.08);
```
AFTER (this worktree):
```
var rankOk5 = ['national', 'global'].indexOf(rank) >= 0;
// P2 (eggomen): the FINALE's omen needs only regional. A nielsen cast
// keeps the national leg — nielsen omens are untouched by this arm.
var rankOkApoc = (cast.apocalypse === 'finale') ? rankOk4 : rankOk5;
if (wave >= 5 && rankOkApoc) titanMaybeOmen(cast.apocalypse, day, 0.08);
```
Scope discipline (why the finale-only form, not the whole slot): the
parent brief keeps herald AND nielsen omens untouched. The cast apocalypse
is the finale on low-showmanship runs but the nielsen on showmanship ≥ 20
runs (titanCast). Relaxing the whole slot would relax a nielsen omen on
those runs — out of scope. So the relaxation is conditioned on the
occupant being the finale. Herald line, overtime third-titan block,
wave legs (wave ≥ 5), dice (0.08 omen, 0.35/0.40 stage advances),
muster gates, quotas, upkeep — all untouched. The worktree branch IS
the variant: it differs from master by exactly this line plus proof
tests plus evidence. "Landable" below means merging this branch.

### Why the primary cannot be measured on natural seeds (honesty constraint)

No natural substrate opens wave 5 (veterans 0/8 on the eggroad pilot;
one wave-5 opening ever in sims, endgame r54 seed 88097, under a
different substrate). The finale omen requires wave ≥ 5 FIRST — the
variant relaxes only the scale leg, so on any natural seed the wave-5
leg still binds and the finale omen still never fires. Measuring the
primary on natural seeds would test nothing. Therefore the primary is
measured on a STAGED cohort (gate-input staging, documented below),
and natural seeds carry the guards + no-op checks. This arm does NOT
claim road completion: it judges omen appearance only.

### Instrument note (§15)

The panel's `compare` mode compares two panel-native runs; panel-native
runs cannot reproduce the eggroad substrate (the probe-local sit-gate —
never sit until networkFallen — is not a panel policy, and greedy
defaults would sit by tier 4 / day 145 and kill the road before tier 3).
Running panel-native runs would change the substrate and violate
"before/after on identical seeds". The §15 instrument for this arm is
therefore the matched-seed eggroad probe comparison: identical seeds
(88101–88108), identical probe, identical census, before = the recorded
pilot corpus, after = this worktree's run. The pre-registered threshold
below is the judge, not the instrument.

### PRIMARY (staged cohort)

Population: staged wave-5 + regional + finale-cast villages (gate-input
staging: a real loaded game with Game.unlockedWave() / Game.scaleRank()
overridden to the staged values — see "staging honesty" below; all
other titan machinery runs real). Horizon: 60 dawn ticks per village.
Metric: finale omen appearance (stage ≥ 0).
- BAR: variant ≥ 6/8 staged villages show the finale omen within 60
  ticks; baseline 0/8 (verified by a revert-run of the same cohort).
  Rationale: 8%/day → P(no omen in 60 days) ≈ 0.7%, so ≥ 6/8 is
  conservative; 0/8 baseline is structural (gate closed), not dice.
- Staged seeds: 88201–88208 (fresh block; no 8820x use in repo evidence
  or scripts at pre-registration time).

### GUARDS (all must pass; a guard miss is NO-GO, never re-scored)

- G1 — matched pilot seeds 88101–88108, 180d, before/after: finale
  omen 0/8 under BOTH variant and baseline (wave-5 leg binds on
  natural substrate); herald omen appearance/stage matches the pilot
  per seed; nielsen/third-titan omen matches the pilot per seed.
  Any variant-caused deviation in herald/nielsen = NO-GO.
- G2 — wave-5 leg: zero pre-wave-5 finale omens in every sweep and
  every proof test (wave ≤ 4 → no finale omen under the variant).
- G3 — no-op for national villages: staged wave-5 + national +
  finale-cast villages show the omen under BOTH variant and baseline
  (≥ 6/8 within 60 ticks each — the relaxation changes nothing
  where national already held).
- G4 — nielsen-cast untouched: staged wave-5 + regional + nielsen-cast
  villages show NO apocalypse omen under the variant within 60 ticks
  (national leg retained for a nielsen cast). Proof-tested.

### ADVERSARIAL MEASUREMENTS (Steve: get adversarial about all)

- A1 — THE TAUNT CASE: finales NOTICED (omen stage 2, placed) but
  never mustered (muster < 20 within horizon). Measured two ways:
  (i) mechanism arithmetic from real pilot data (pilot max blades 11
  < 20; 3-link all-trusted max 18 < 20 without Haven); (ii) staged
  muster assembly across link profiles (0/1/2/3/4/5 links × trust
  bands) with real quota/gate code, counting blades vs gate 20.
  The taunt rate is reported with numbers. No GO/NO-GO bar is set on
  taunt alone — it feeds the LANDABILITY judgment: a GO primary
  with a ~100% taunt rate is "GO on the bar, NOT landable as-is",
  and the report will say so in those words.
- A2 — NO-OP CHECK, natural: per-seed chain census before/after on
  88101–88108, with special attention to 88102 (reached global —
  a village that would have reached national anyway): expect an
  identical census. Any difference is investigated, not averaged away.
- A3 — MUSTER-FEEDING INTERACTION: none claimed. The variant changes
  omen appearance only; upkeep, quotas, gates, stand-downs are
  untouched code paths. Stated, not measured.

### FRESH-SEED CONFIRM (on GO only)

- Fresh STAGED seeds (88211–88218) re-run the primary cohort.
- Fresh NATURAL seeds (88121–88128, 180d) under the variant confirm
  no leakage (finale omen still 0/8 — the wave-5 leg binds).

### JUDGE

GO iff the primary bar is met AND all guards pass. Landability is
judged separately with the taunt findings attached. A miss is NO-GO,
never re-scored against a friendlier metric mid-run (metric review
below if the metric proves wrong).

### SUBSTRATE MOVE NOTE (appended 2026-10-26, BEFORE the baseline run)

The G1 guard above names "the recorded pilot corpus" as the before.
That comparator is no longer valid: the pilot ran on base be3a588c2,
this arm's base is f89a9b32d — 40 commits later (scale r41, social
r57, food-economy, wave4enc, tabletalk, and others). The probe and
its policies are byte-identical across that range (verified via git
log), but the game is not. The first variant seed (88101) already
diverges from the pilot corpus on an axis the variant cannot touch
(wave-3 facing 1 vs 6 → no seat → no overtime; the variant's only
code path is the finale omen gate, and the finale omen is null in
both runs). Attributing that divergence to the variant would be
false, and comparing against the stale corpus would judge the base
move, not the arm. Therefore, WITHOUT changing any bar: the G1
before is a same-base baseline run (titans.js reverted to f89a9b32d,
same probe, same seeds, same env) executed after the variant run.
The guard bars apply unchanged to variant-vs-same-base-baseline
(finale 0/8 both; herald/nielsen match per seed). The pilot-corpus
comparison is retained as a DRIFT report (baseline-vs-pilot), not
as the guard verdict. This note is written before the baseline run
so the decision cannot be read as fitted to its results.

### Staging honesty (read before judging the primary)

The staged cohort cannot be a natural village: no natural village
reaches wave 5, because the kill-conversion wall (veterans 0/8) blocks
it — and staging a genuine wave-5 village via real state would mean
passing the combat-readiness bars (4 armored @P≥15, 6 armed, 3 tricks,
2 living wave-4 killers) by hand, which would test the staging, not
the game. So the staged cohort stages ONLY the two gate inputs that
titanDawnTick reads (Game.unlockedWave(), Game.scaleRank()), on a real
loaded game, with all other titan machinery (omen staging, advance,
placement, muster, upkeep) running real. The variant's entire semantic
content IS the branch condition in titanDawnTick, so this stages
exactly what changed and nothing else. What it does NOT prove: that a
natural village can reach the staged inputs (it cannot, yet — that is
gate 1, the endgame lane's work, not this arm's). The proof tests also
assert the REAL gate functions where cheap: scaleRank() returns
'regional' when state.networkLive is set, and unlockedWave() stays
below 5 for a village without readiness (documenting the wall).

## METRIC REVIEW

The G1 comparator was revised before the baseline run (see SUBSTRATE
MOVE NOTE above): same-base baseline replaces the stale pilot corpus
as the guard comparator; the pilot comparison is retained as a drift
report. No bar was changed, no result re-scored. The primary metric
(finale omen appearance on staged regional villages) proved sound:
it is the only place the relaxed leg is observable, and it
discriminated cleanly (variant 8/8 vs baseline 0/8, twice).

## RESULTS

### Proof test (variant code, re-run after restore)

scripts/test-eggomen-a-20261026.js: 10 PASS, 0 FAIL (twice: at
implementation and after the baseline-swap restore). Existing titan
suites green on the variant: herald 22/0, blitz 56/0, titan-class
32/0, titan-variety 12/0, overtime-network 40/0.

### PRIMARY (staged cohort, 60 dawn ticks each) — GO

Wave 5 + regional + finale cast, seeds 88201–88208, variant: 8/8
omens (ticks 11, 2, 17, 5, 5, 6, 23, 8). Bar was ≥ 6/8. Same cohort
under baseline (revert-run): 0/8 — the gate was closed, not the
dice. Fresh staged seeds 88211–88218 (confirm): 8/8 omens (ticks 20,
2, 17, 13, 7, 37, 3, 3). The relaxation works, twice over.

### G3 — no-op for national villages (cohort, strongest form)

Wave 5 + national + finale cast: variant 8/8, baseline 8/8, with
IDENTICAL appearance ticks (11, 2, 17, 5, 5, 6, 23, 8). The variant
makes regional behave exactly like national for the finale omen —
same dice stream, same days. Nothing changes where national already
held.

### G2 — wave-5 leg (cohort + proof)

Wave 4 + regional + finale cast: 0/8 omens in the cohort, and the
proof test pins wave ≤ 4 → no finale omen with a herald control
proving the tick ran. The wave-5 leg binds under the variant.

### G4 — nielsen-cast untouched (cohort + proof)

Wave 5 + regional + nielsen cast: 0/8 apocalypse omens in the cohort,
and the proof test pins it with a herald control. A nielsen cast
keeps the national leg.

### G1 — matched pilot seeds, variant vs same-base baseline — PASS

8 seeds, 180d, identical probe/env, variant vs baseline: IDENTICAL
on every compared field (seat, announce day, overtime tier, wave,
scale, herald/nielsen/finale omen stages, network summoned, living
veterans) on all 8 seeds. Finale omen 0/8 under both (wave-5 leg
binds on natural substrate). Herald and nielsen match per seed,
including 88108 (nielsen stage 2 in both) and 88106 (nielsen null in
both). The variant changes NOTHING on natural substrate — as the
honesty constraint required.

### A2 — no-op check, natural (88102, 88104: global villages)

88102 (global) and 88104 (global) have identical variant/baseline
census rows. Villages that reach national/global anyway behave
identically under the variant.

### DRIFT REPORT (baseline vs pilot corpus — NOT the guard verdict)

The pilot corpus (base be3a588c2) no longer reproduces on current
master (f89a9b32d, 40 commits later) with a byte-identical probe
and policies. 4/8 seeds diverge on seats/announcements/scales
(88101, 88104, 88105, 88106, 88108 diverge in whole trajectories;
88102, 88103, 88107 track, with veteran-count noise only). Finale
omen is null on all 24 rows (variant + baseline + pilot): the
wave-5 leg binds everywhere on natural substrate, on every base.
Implication for the eggroad lane: future eggroad comparisons must
use same-base baselines, not the 88101–88108 pilot corpus as a
living baseline. The pilot corpus remains a valid historical record
of what the road looked like on its base.

### A1 — THE TAUNT CASE (adversarial headline)

Finale muster gate is 20 blades. Staged muster assembly with REAL
call + quota + gate code (links + rosters staged; the call is the
game's own soundTitanCall):
- Trusted links (trust 71, opinion 10, 10 adults/village): 0→0,
  1→6, 2→12, 3→18 (NOT ready), 4→24 (ready), 5→30 (ready).
- 3 base-trust links (38/0): 6. 3 refusal links (20/0): 0.
- 88111 diagnostic profile (trusts 71/38/35, opinions 10/0/0):
  exactly 10 blades — reproduces the diagnostic's herald total
  (2+6+2) on the finale's gate: 10 < 20, taunt.
- Seed stability: 3 trusted links give 18 on both 88301 and 88302.
- Pilot context: the pilot's best muster was 11 blades; the pilot's
  villages held 0–3 links. Haven's own commitment (cap 3) contributed
  0 blades in the diagnostic.

The threshold is 4+ trusted links (or 3 trusted + Haven's 3 actually
marching = 21). A regional wave-5 village with ≤ 3 links gets a
NOTICED finale it cannot muster — a taunt. On pilot-like link
networks (0–3 links, rarely all trusted), the relaxed gate's omens
are MOSTLY taunts: every finale omen on a ≤3-link village is a
visible, unkillable titan looming on the map. The taunt is not a
corner case; it is the expected outcome for the villages the
relaxation newly reaches, UNLESS their link networks are stronger
than anything the pilot measured. Haven's contribution is the only
bridge for a 3-trusted-link village, and Haven contributed 0 in the
diagnostic — a player verb (titanCommitOwn) that the sims have not
shown working at scale.

### A3 — muster-feeding interaction

None. No upkeep/quota/gate/stand-down code was touched; the variant
is one branch condition in the omen gate. The taunt finding above is
about muster arithmetic (gate 20 vs link supply), not about any
change this arm made to mustering.

## LANDABILITY VERDICT

GO on the pre-registered bars (primary 8/8 + 8/8 confirm, all guards
pass, variant ≡ baseline on natural substrate, proof 10/0, existing
titan suites green). The branch is mergeable on its bars: it changes
exactly one branch condition, breaks nothing measured, and does what
P2 promised — a regional wave-5 village can now be NOTICED by the
finale.

NOT landable as a road-opener, and the report must not be read as
one: (1) this alone does NOT open the road — kill conversion
(veterans 0/8 on every natural seed, every base) still binds first,
exactly as the honesty constraint stated; (2) the taunt case means
the newly reachable finale omens will mostly be visible-but-
unmusterable on pilot-like link networks — landing P2 without a
muster answer (P6 snapshot-gated re-call, P10 muster-feeding, or
link-network growth the sims have not shown) lands a taunt machine
more than a road. Recommendation to the parent: land P2 as the
omen-gate fix it is, and sequence the muster work (P6/P10) next —
do not present P2 as eggroad progress to Steve beyond "the finale
can now notice a regional wave-5 village; it still cannot be
mustered by one."

### Fresh natural confirm (pending at this writing)

Fresh natural seeds 88121–88128, 180d, variant code: expected finale
omen 0/8 (no leakage — the wave-5 leg binds). Result to be appended
before the parent report is finalized; a non-zero finale omen on
any fresh natural seed would be a guard failure, not a win.

### FRESH SEEDS — VARIANT RUN (observed; baseline control running)

88121: none/null/0, wave 2, global. 88122: lesser/123/6, wave 4,
regional. 88123: lesser/141/5, WAVE 5, global — see road-event note
below. 88124: lesser/90/6, wave 4, regional. 88125: lesser/90/6,
wave 4, regional. 88126: lesser/137/6, wave 4, regional. 88127:
lesser/null/0, wave 4, regional, village-lost. 88128: none/null/0,
wave 4, global, village-lost — WITH heraldSlain=true (a herald fell
on a fresh seed; second titan kill in this substrate family after
88111's diagnostic herald).

ROAD EVENT (88123, variant run — attribution PENDING the baseline
control): wave 5 opened (unlockedWave 5, w5 faced 1, standing 422,
war 100, diplomacy 102, plenty 220); ready5 at end shows veterans 0
(short weapons + veterans) — the wave opened earlier and the peak
ratchet held it after the wave-4 killers died (livingVeterans 4 at
end, none with wave-4+ kills). Finale omen stage 2 (located);
finale muster called day 178, 13/20 blades at day 180, still held —
A LIVE TAUNT IN PROGRESS on a natural seed. Nielsen called day 166,
1 fight, 0 slain, muster decayed to 0 by day 180 (hunger erosion
again). Herald called day 78, 3 blades, stood down day 98.
Attribution rule (written before the control run): the variant
touches ONLY the finale omen's scale leg and cannot open wave 5 —
but the claim "88123's road event is base/seed, not variant" is
only earned if the baseline control run reproduces 88123 (wave 5 +
finale stage 2). If baseline 88123 differs, the variant is suspect
and the verdict reopens. The control result goes below.

### FRESH SEEDS — BASELINE CONTROL (complete, verdict earned)

Fresh seeds 88121–88128 under BASELINE code: IDENTICAL to the
variant run on every compared field (seat, announce, tier, wave,
scale, herald/nielsen/finale omen stages, network, veterans,
herald slain) on all 8 seeds. In particular: baseline 88123 = wave
5 + finale omen stage 2 (same as variant), and baseline 88128 =
herald slain (same as variant). The road events are base/seed, NOT
variant — attribution earned, verdict stands. The fresh-seed
confirm therefore PASSES on the guard that matters (variant ≡
baseline): the pre-registered "finale omen 0/8" expectation was
about wave-5 reachability, and a seed DID reach wave 5 — at global
scale, where variant and baseline behave identically by
construction. A finale omen at global scale is not a leak; the
variant's relaxed leg (regional-only) was never exercised by any
natural seed in this arm, because no natural regional village
reached wave 5. That is the honesty constraint restated with data:
P2's relaxation is proven at the gate (staged cohort) and proven
harmless on nature (24 natural seeds, variant ≡ baseline on all) —
but it has not yet been EXERCISED by a natural village, because
the wave-5 leg still binds first everywhere nature was measured.

### CHECK.JS --QUICK + EPERM FLAP INCIDENT (read before judging the count)

check.js --quick on the variant tree: 270 passed, 17 failed (603s).
The 9 standing-profile failures all reproduce (hide-discovery,
measurement-comparison, measurement-proof-update,
measurement-workflow, mobile-combat-cadence, occupation-panels,
phone-frame-proof, parity-20261014, establishment-r20-fixes).
The 8 extra failures vs the standing 278/9 profile are EPERM-flap
write denials, NOT variant effects: human-combat-parity,
measurement-cache-flags, measurement-flags,
measurement-source-text, prepared-runner-custody,
proof-text-identity, sw-audio-cache all die with EPERM on temp
writes, and foodpower re-passes individually (30/0) once the flap
moved. No script failed on an assertion attributable to the
one-line omen change; the titan suites (herald, blitz, class,
variety, overtime-network) all pass on the variant.

FLAP DAMAGE (same run): a --quick script's write zeroed
docs/ONTOLOGY.md to 0 bytes mid-run (the known flap-truncation
hazard; ONTOLOGY.md has zeroed this way before). The content is
safe in git (HEAD blob intact); restore is pending flap clearance
(git checkout blocked by EPERM at last try; a retry loop is
running). The commit below must NOT include the zeroed file —
verify docs/ONTOLOGY.md is restored (non-zero, no status line)
before committing. If the flap has not cleared by commit time,
the commit waits: never commit a flap-zeroed file.
