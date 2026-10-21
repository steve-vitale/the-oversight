# sim-sharegate-b — threshold-gated confirm of the SURPLUSFEED upkeep-skip tradeoff

Run: fleshout-loop-b-20261021T1257Z, arm sim-sharegate-b, axis food-economy.
The named next of sim-surpluskeep-diag-b (DIAG-open, evidence/2026-10-21/
sim-surpluskeep-diag-b.md, landed 440cacf77 + 406893331): "a threshold-gated
confirm arm (pre-register gate-crossing weeks + post-gate trust trajectories,
not trim dose)."

## Pre-registration (binding, docs/MEASUREMENT.md §§9–12, 14–15 — written BEFORE any sims)

- **Lever** (policy-side, env-gated SHAREGATE_B=1, default OFF, ZERO src/js
  changes): keep the SURPLUSFEED glut-trim (ENGINE code,
  src/js/game.js surplusFeedGovernor, env-gated SURPLUSFEED=1 — the
  hypothetical scripts/policies/surplusfeed.js does not exist anywhere; the
  trim rides the engine verb, so the layer does not re-implement it), but
  gate the UPKEEP-SKIP in a new layer scripts/policies/sharegate-b.js:
  never skip a tend/tribute week when the link's trust < 40 (the
  _linkSeasoned floor), and cap consecutive quietly-skipped weeks at 2 per
  link. The trim fires; the upkeep cut is threshold-gated. Gate OFF =
  pure delegation to the base leadfeast/belongfeast (byte-identical; the
  proof's RED/DET phases pin it). Every gate decision is voiced (say);
  the engine's tendLink/payTribute verbs do the paying (their
  mourning/bare-pantry refusals are never re-litigated — attempted-tracking
  wrap, like sim-upkeepgate-b's). Voice every skip/trim honestly; no
  silent actions.
- **Paired design isolating the gate**: control = SURPLUSFEED=1 (governor
  on, no gate) + base policy; armed = SURPLUSFEED=1 + SHAREGATE_B=1 +
  sharegate variant policy. Same commit, identical seeds (8 fresh seeds
  9011–9018 x {leadfeast, belongfeast} x {control, armed} = 32 runs).
- **PRIMARY (all must hold; any miss = NO-GO, never re-scored per §14)**:
  1. armed rot (rotFresh+rotPreserved corpus totals) <= 0.90x control
     (the trim still works under the gate);
  2. gate-crossing skips on the armed side = 0 — a quiet skip on a link
     with trust < 40, or a third consecutive quiet skip, anywhere in the
     armed corpus;
  3. post-gate trust trajectories never cross trust-40 on the armed side —
     for every armed link the second pass decided on, its dawn trust never
     drops below 40 after the first gate decision;
  4. trust-crater weeks (a link going trust >= 90 → < 40 within a window
     containing ≥ 1 quiet skip) = 0 on the armed side.
- **Guardrails (all must hold)**: starvation deaths armed <= control;
  median survival armed >= control − 10d; realm dissolutions (national-lost
  edges) armed <= control; national (end-state) armed >= control − 2;
  laundering 0 (armed shareSurplus <= 1.05x control — the layer moves only
  existing pantry kcal through engine verbs, never conjures/stores); no
  new death mechanism (death-cause sets identical).
- **Horizon**: 180d death-aware (dead villages stop, +10d tail max — the
  sim-harness death stop), FEASTSCALE_R13=1 + SEATDRIVE=0 explicit (env
  trap honored). Pilot 8 seeds; confirm (12–16) ONLY if pilot passes.
- **Balanced panel** per §15: attempted; the env-gated-policy-treatment
  inexpressibility class is known (SURPLUSFEED/SHAREGATE_B are not panel
  case identity; the §15 contract substrate and metrics don't cover the
  pre-registered primaries). Attempt, document, never ship a bogus compare.
- **Kill protocol**: zero-trace on pilot miss — DELETE
  scripts/policies/sharegate-b.js; instruments, sweep driver, proof,
  evidence, and corpus land as the verdict record.

## Canon

docs/CANON.md + docs/PRESERVATION.md read first. The feast is the village's
social engine; tribute/tendLink are the REALM's upkeep engine — real pantry
kcal for trust, priced honestly (partial pantries aid partially; thin
tribute accrues arrears, said aloud). "Rot can't be smoked back into food"
untouched. The sharegate layer speaks in the villager's register (a named
villager decides to tend anyway — not a System intervention). Purify/skill
lanes untouched.

## Proof results (pre-sweep — all green)

scripts/test-sharegate-b.js (run with FEASTSCALE_R13=1 SEATDRIVE=0 per the
Usage header):

- (a) trust-30 fixture: two weeks at trust 30, lean pantry → both weeks
  covered (cover-fray), tendLink called twice, quiet skips = 0, voice line
  present ("wearing thin (trust 30)"). The gate never skips below the
  floor.
- (b) skip cap: 5 eligible weeks at trust 50 →
  skip,skip,cover-cap,skip,skip — max consecutive quiet skips exactly 2.
- (c) belong trust-30: payTribute covered both weeks, no skips.
- (d) bare-pantry refusal: engine returns 0 → attempt recorded as
  cover-fray with kept=false, paid=0; counted refused-not-covered; no
  layer cover-voice fires over the engine's own bare-pantry refusal.
- ENGAGE (8802 leadfeast-sharegate, SURPLUSFEED=1 + SHAREGATE_B=1, 150d):
  gate fires on the exemplar shape (coverTend = 17), trim still fires
  (trimKcal > 0), every quiet skip at trust >= 40, and the INDEPENDENT
  week ledger (rebuilt from the upkeep instrument — tend events, dawn
  tdw stamps, cover attempts; a base-pass late-week tend keeps the week,
  a refused cover is an honest engine refusal) shows zero gate-crossing
  weeks. One timing subtlety found and fixed during proof: the layer
  evaluates trust at decision time (daytime); dawn snapshots can lag it
  (linkTick settles at the week boundary — trust 48 at the d28 decision
  vs 38 at the d28 dawn). The ledger samples decision-time trust when the
  layer decided that week, dawn otherwise; the kept/skip reconstruction
  stays fully instrument-based.
- RED (SHAREGATE_B unset): variant ≡ base byte-identical rows,
  leadfeast-sharegate≡leadfeast and belongfeast-sharegate≡belongfeast,
  pilot's exact control env (SURPLUSFEED=1), seeds 8801/8802, 60d — 4/4
  pairs identical.
- DET: gate-off repeat byte-identical; gate-on repeat byte-identical.

One design addition during proof: the gate's covers ride feastscale's
trackTribute wrap (the same feast-contribution accounting as the base
pass) — the kcal was really paid, so the feast layer sees it; no shadow
ledger. Follows the sim-upkeepgate-b precedent.

PROOF GREEN — the pilot sweep may proceed. The gate-off path is inert;
the gate-on path is deterministic.

## Sweep results (pilot: 32 runs, 8 fresh seeds 9011–9018 x {leadfeast, belongfeast} x {control, armed}, 180d death-aware, FEASTSCALE_R13=1/SEATDRIVE=0)

Wall numbers (paired, armed / control, n=16):
won 0/16 / 0/16, national (end-state) 8/16 / 8/16, national (ever-hit) 10/16 / 11/16,
table 9/16 / 8/16, wave-4 12/16 / 11/16, wave-5 0/16 / 0/16,
median 127d / 152.5d, max 180d / 180d, exiled 0/16 / 0/16.
The wall stands (zero wins, wave-5 0/32, pre-seat) — this arm does not attack the wall.

Engagement: the trim fired on 32/32 runs (trimKcal 3.29M control / 2.99M armed
corpus; trimEvents 10183 / 9228). The gate fired on 15/16 armed runs
(coverTend 2–10 on leadfeast; coverTrib 0–4 on belongfeast; 193 gate voice
lines captured). The belong road is nearly inert under the gate (0–4 covers
per run, rot identical per pair to the kcal) — the gate is a lead-road lever.

### PRIMARY verdict (binding, judged as written)

1. armed rot <= 0.90x control: **PASS** (0.863x — 2.55M vs 2.96M kcal).
   The gate's extra upkeep spend leans the pantry further than the trim alone.
2. gate-crossing skips = 0: **PASS** — the independent week ledger
   (scripts/sharegate-metrics.js: tend/tribute events + dawn tdw/tpw stamps
   + cover attempts; a base-pass late-week tend keeps the week, a refused
   cover is an honest engine refusal) finds 0 skip-weeks with trust < 40
   and 0 runs of >= 3 consecutive skip-weeks across all 16 armed runs.
   The gate's own guarantee holds perfectly.
3. post-gate trust trajectories never cross trust-40: **FAIL as written**
   (24 links) — all 24 are birth-trust artifacts (see metric review).
4. trust-crater weeks = 0: **FAIL as written** (15) — all 15 are
   birth-trust artifacts (see metric review).

### Guardrails (binding, judged as written)

- starvation deaths armed <= control: PASS (14 <= 15).
- median survival armed >= control − 10d: **FAIL** (127d vs 152.5d, −25.5d).
- realm dissolutions armed <= control: **FAIL** (5 vs 4 lost-edges).
- national armed >= control − 2: PASS (8 >= 6).
- laundering 0: PASS (armed shareSurplus 4.51M <= 1.05x control 4.87M —
  the layer moves only existing pantry kcal through engine verbs).
- no new death mechanism: **FAIL as written** — the cause SETS differ by
  singleton narrative labels only (armed: 'the terms of service',
  'the redactor', 'sweeps week' ×1 each; control: 'grief counselor',
  'the ugly beast' ×1 each). Combat/monsters/sickness/starvation dominate
  both sides identically (123/121, 37/35, 22/21, 15/14).

### Verdict: KILLED-AT-PILOT

Per §14 the pre-registered bars bind — a miss is NO-GO, never re-scored.
Two primaries and three guardrails miss as written. The layer
scripts/policies/sharegate-b.js is deleted zero-trace below; instruments,
sweep driver, proof, analysis, evidence, and the 32-run corpus land as the
verdict record.

What the kill does NOT mean: the gate is proven to work exactly as designed
(bar 2: zero gate-crossing weeks on the independent ledger, 16/16 armed
runs). What it means: (a) the target mechanism — the 8802-style skip-driven
trust crater — did not reproduce on ANY of the 8 fresh seeds on either side
(honest order-aware crater count: 0 armed, 0 control); there was nothing
for the gate to prevent in this pilot. (b) The survival and dissolution
guardrails cannot clear at n=8 against butterfly chaos (below).

### The honest recomputation (metric review input, not a re-score)

- Order-aware craters (trust reaches >= 90, THEN a later day < 40, with >= 1
  skip-week between): **0 armed, 0 control.** The as-written counts (15/20)
  treated birth-trust as a crater: hierarchy.js _formLink births every link
  at trust 30, so any link that rose to 100 counted its own birth as the
  "min < 40". The 8802 exemplar shape (9 skipped weeks → 100→7) fired
  nowhere in this pilot on either side — mechanism not reproduced.
- Bar 3's design flaw: the gate COVERS newborn links at trust 30
  (cover-fray) — that IS its job. "Post-gate trust never below 40" is
  unsatisfiable by construction whenever the gate tends a newborn or
  reformed link. Honest revision for the next run: count only crossings
  from >= 40 to < 40.
- Bar 1's design tension: both arms share the trim (SURPLUSFEED=1), so
  "armed rot <= 0.90x control (trim still works)" conflates two things.
  Trim efficacy is proven by engagement (trimKcal > 0 on 32/32 runs);
  the 0.863x ratio measures the gate's extra pantry lean (real upkeep
  spend), not trim function. Next run: separate the bars.
- Survival (−25.5d median): paired inspection shows butterfly, not a
  mechanism. 9015: BOTH arms spiral from d21 (identical first 7 deaths —
  verified bit-identical in fresh processes); control recovers to 180d,
  armed dies d42 after a single 1560-kcal d27 cover. 9017: −90d.
  9016: +73d WITH 10 covers. Covers do not monotonically harm; n=8 cannot
  separate lever effect from chaos. A survival verdict needs more seeds.
- Dissolutions (5 vs 4): the single extra edge is 9014-belongfeast
  (1→2), via a 'walked' break at trust 79 — not a trust crater; the gate
  paid tribute through on a bare pantry (cover-cap attempts, mostly engine-
  refused, all voiced by the engine).
- deathMech: the identical-sets bar is too strict for n=16 with rare
  narrative labels. Next run: "no new non-singleton cause".

### Sense-testing (SENSE-TESTING LAW — read, not counted)

193 gate voice lines across the armed corpus. The cover reads as a villager
choosing to tend anyway: "Stella says the bond with Emberhold is wearing
thin (trust 30) — one more quiet week and the friendship goes cold. The
grain goes anyway; a lean pantry is no excuse to let a friend go hungry."
— followed by the engine's own "🌾 Haven sends 1,500 kcal of grain..."
(the WHY from the villager, the WHAT from the engine; a coherent beat).
The honest skip states its math: "Willow looks at the thin pantry and lets
Emberhold's grain wait this week — the bond is still strong (trust 92),
and it can stand one quiet week." Nothing robotic; the trust numbers are
the real ones. (Minor: three same-day skips for three villages read
slightly repetitive in sequence — each is a separate honest decision.)

### Village assessment (plain words)

Sixteen paired villages on the feast courtship road. The lead road:
courts sat on most seeds and the villages ran 42–180 days, living or dying
by the mid-game gauntlet — combat and monsters first (123/121 combat,
37/35 monster deaths), sickness second (22/21), starvation a steady third
(15/14). The trim kept every pantry lean (it fired on all 32 runs) but
villages ate steadily; no village starved because the trim took food —
the starving villages were already spiraling before the gate ever acted
(9015: identical d21–24 deaths on both arms, verified bit-identical in
fresh processes). The belong road: villages died younger (40–180d), courts
sat rarely, and the gate barely engaged — rot identical per pair to the
kcal, 0–4 covers per run. Who thrived: villages that survived the d21–35
sickness/combat cluster ran to 150d+ with national live; who died: the
early-spiral villages, on both arms alike. The blank filled: the upkeep
skip is now threshold-gated in the instrument record with a perfect
independent-ledger guarantee — but the lever is killed, because the
mechanism it targets didn't show up to the fight on fresh seeds and the
survival guardrail can't clear butterfly noise at n=8.

### Balanced panel (§15) — inexpressible, no bogus compare shipped

Same class as the parent/sibling arms: SURPLUSFEED and SHAREGATE_B are
absent from the panel's flagNames (verified by grep — zero hits), the
§15 contract substrate is not this sweep's substrate, and the contract
metrics don't cover the pre-registered primaries (gate-crossing weeks,
trust trajectories, trim→upkeep attribution). Attempt documented; no
compare shipped. The before/after is the paired analysis above on
identical seeds, commit, and instruments (scripts/analyze-sharegate-b.js
+ scripts/sharegate-metrics.js).

### Telemetry deviation check

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json
--current 'evidence/2026-10-21/perseed-sharegate-b/flat/*.json'
--metrics national,table,wins,exiled` → one LOUD line: "wins disappeared:
baseline 16 -> current 0 (n=32 files)". Investigated: the baseline is a
richer policy stack; the BARE feastscale+SURPLUSFEED substrate this pilot
runs on has 0 wins on BOTH arms (control 0/16, armed 0/16 — the parent
surpluskeep arm measured 0/32 on the same substrate class). Not a lever
effect — the paired design shows the gate doesn't move wins. Baseline NOT
rolled. Per-seed flats: evidence/2026-10-21/perseed-sharegate-b/flat/
(32 files).

### Convergence state

**KILLED-AT-PILOT.** The gate mechanism is proven (0 gate-crossing weeks,
independent ledger, 23/23 proof) but the lever is killed: the 8802-style
skip-driven trust crater did not reproduce on 8 fresh seeds (0 honest
craters either side), the belong road is inert under the gate, and the
survival/dissolution guardrails cannot clear butterfly noise at n=8.
food-economy stays converging; the wall is unmoved (wins 0/32, wave-5
0/32). Named next (coordinator/Steve decision, NOT this arm's): the
threshold-gated confirm needs a design that reproduces the 8802 shape —
gate-crossing weeks as the treatment with a bigger seed budget — or a
ruling that the 8802 exemplar was seed-rare/substrate-gone (the substrate
moved 9c634ebac → 7554f2c6a between the diag and this arm). DO NOT
resurrect this layer without that reproduction.
