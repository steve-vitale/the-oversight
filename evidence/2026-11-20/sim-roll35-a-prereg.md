# sim-roll35-a — PREREG (frozen BEFORE any judged sim)

**Arm:** sim-roll35-a · **Loop A run:** fleshout-20261120T1705Z
**Type:** BUILD + MEASURE (pilot) — finding #2590's serve half, the
35% blind craft roll on the spear-serve path, scale-onramp axis.
**Frozen:** 2026-11-20 ~17:20 UTC, before any judged sim.
**Branch:** `sim-roll35-a` (worktree
`~/workspace/worktrees/sim-roll35-a`). **Base:** master f43abed42.
**Builds on:** `evidence/2026-11-20/sim-depmat-a.md` + prereg
(NO-GO: DEPMAT serves 5 attributable, 0 served-bow volleys, 5/5
evades; the 35% roll eats 10/15 site-supplied spear picks),
`evidence/2026-11-20/sim-evade-a.md` + prereg (NO-GO: evade
mechanism proven live, 8 attributable served, 1 served-bow volley;
the 35% roll eats 17/25 site-supplied spear picks; the ammo wall
sized at 17/25 engaged meetings entering with 0 ammo),
`evidence/2026-11-19/sim-bowsee-a.md` (NO-GO: knowledge seeding
non-binding, materials wall), `evidence/2026-11-19/sim-bowknow-a.md`
(NO-GO: mentoring serves 0), `evidence/2026-11-19/sim-speargate-a.md`
(gate fix landed).

## §0. The design call (frozen, not a sim)

The depmat verdict named this lever exactly: "the 35% roll eats
two-thirds of servings: 10 of 15 site-supplied spear picks fail
(28 of 43 overall) — the roll, not the materials, is now the
binding constraint." Evade-a confirmed it on the scoped band:
17 of 25 site-supplied spear picks fail the blind 35% roll
(crafted 8). The code was read in full before designing
(`src/js/game.js` `villagerStageBow` ~7813–8020): step 3 picks
the first rung the crafter knows (LADDER `['bow', 'crude_bow']`)
whose materials are covered by own pack + communal pile, then
rolls `const rate = pick.level >= 2 ? 0.85 : 0.35` — one
`Math.random()` draw, a blind success teaches (the PRACTICE
rule: lv 1 → 2). The DEPMAT substrate is REBUILT on both legs
from the depmat prereg §0 + proof test (`scripts/test-depmat-a.js`,
43/43 on the recovered code): the trailhead bundle, crude_bow
only, site-supplies the branch/vine shortfall, `weapon_craft_site`
telemetry, `depmatSite`/`siteMats` on the return, witnessed line
when the scholar is at home. The depmat lever code was reverted
on NO-GO, so the rebuild is verified BEFORE the pilot with the
depmat proof test and a fidelity check against the depmat arm
corpus on the same band (see the checklist below).

**The roll population, measured before freezing (not a sim):**
every site-supplied spear pick on both prior bands is a lv-1
crude_bow crafter — depmat arm 15/15 (lv[crude_bow]=1, lv[bow]
0 or 1, never ≥ 2), evade arm 25/25 (same). The observed fail
shares (10/15 = 67%, 17/25 = 68%) match the 35% rate. The 35%
gate is circular: the PRACTICE rule grants lv 2 only after a
35% success, so the population can never become "learned" except
by luck. **Any rate that only rewards lv ≥ 2 is a no-op on the
wall this pilot measures** — including the brief's example form
(35% + 15pp per lv[bow] above 1, cap 85%), which would move
nothing here (lv[bow] ≤ 1 on every site-supplied spear pick)
and would cut the lv-2 rate from 85% to 50%. It is NOT frozen.

**Chosen mechanism — ROLL35=1 (the learned first-make rate):**
in `villagerStageBow`, step 3, at the departure craft attempt —
and nowhere else — for the `crude_bow` rung ONLY, when the
crafter is a SPEAR-HOLDER (the ranged slot holds a non-ammo
weapon — the same spearSeen read the gate uses), the craft rate
becomes lv ≥ 2 ? 0.85 : **0.60**. The 85% learned rate for a
crafter who has actually made one is untouched; the 35% blind
rate stays for everyone else (non-spear-holders, the `bow` rung,
the home craft). One flag, one threshold swap on the SAME single
draw — the roll still consumes exactly one `Math.random()` draw
per pick, so the RNG streams stay aligned in count and the legs
diverge only where a pick's outcome flips. Default OFF in live
play (env `ROLL35=1`); the turn-on decision is the
coordinator's, NOT this arm's. Rationale, in plain words: a
spear-holder who already knows how a crude bow is made — who
has seen one, been taught, handled the wood — should not face
lottery odds on their first make; the first bow stays hard
(2-in-5 still fail and the materials are lost, the same honesty
as today), but it is no longer a coin the village must win
twice (once for the materials, once for the roll) to arm one
fighter. The 85% rate still waits on the other side of the
first success, so the PRACTICE rule keeps its meaning: making
one is what makes you learned.

**Spear-holder-only scoping (the depmat metric review's item
(3), built INTO this arm):** the roll change fires for
spear-holders only. The DEPMAT substrate itself is UNSCOPED
(per the depmat §1 recovery — it is the common substrate on
both legs, so its 28 non-spear picks behave identically on both
legs until the first roll flip); the JUDGED difference is the
roll, and scoping it keeps the divergence footprint to the
handful of spear picks whose outcome flips, instead of every
crude_bow craft in the village.

**Draw-neutral by construction:** the roll change swaps a
threshold on the existing single draw — zero new `Math.random`
draws, verified by grep over the diff and by counting draws in
the proof test (a ROLL35-on call consumes exactly one draw with
a pick, zero without, identical to flag-off). The DEPMAT
substrate is draw-neutral by construction (depmat proof). The
recorder is pure reads. Draw-neutrality is a property of the
mechanism, not a promise of byte-identical corpora — a flipped
pick puts a bow in a hand, and the villages can still diverge
from there; the consistency bar below is built for exactly
that reason.

**Canon:** `docs/CANON.md` read (manifest). No canon doc covers
the departure craft roll, the spear-serve path, launch gear-up,
or the ranged-slot rules — said here rather than inventing
canon. The mechanism respects "If you don't know, it doesn't
show": the crafter must already know crude_bow, and the rate
rewards that knowledge rather than conjuring it. Bow-craft
stays earthly knowledge, not System magic.

**Unjudged diagnostic sizing (design research, NOT a judged
sim):** the depmat + evade arm corpora on band 107051–107058
were read before freezing. Site-supplied spear picks: depmat
15 (5 crafted / 10 failed), evade 25 (8 / 17). At 60%, the
seeded draws convert where the draw falls in [0.35, 0.60) —
expected ≈ +4 crafted on the depmat-shaped band (≈ 9 served)
and ≈ +7 on the evade-shaped band (≈ 15 served). The pilot
judges it; these numbers size the bars, not the verdict.

## The question

Depmat + evade (band 107051–107058, gate ON, DEPMAT bundle
live): the materials wall is cleared where the bundle fires,
the evade wall is proven openable (served leads now engage 3
vs evade 2 with the evade fix — NOT re-landed here, NOT
re-tested), and the roll eats two-thirds of servings. **Does
replacing the blind 35% first-make rate with a learned 60%
rate — spear-holders only, crude_bow only, at the departure
craft attempt — put more bows into spear-holders' hands, and
do those extra served bows reach the fight as volleys?**

## Primary metric (BINDING, §14)

Wave-4+ engaged meetings + staging departures, from the live
corpora (never snapshots). Legs differ ONLY by ROLL35; the
DEPMAT bundle is ON on BOTH legs (ctl = the depmat arm ground,
replication target — see below) and the SPEARGATE gate is ON
on BOTH legs. BOWKNOW, DEPARTSEE, and EVADEOBS are UNSET on
BOTH legs (knowledge seeding is proven non-binding and must
not leak into this measurement; the evade fix is proven and
is NOT re-landed here, so the evade wall stands at its
background rate).

- **(0) Pool floor:** arm `spearSeen` ≥ 10 (depmat arm band: 28).
- **(1) Gate replication (arm):** `spearPassed / spearSeen
  == 1.0` on the arm leg.
- **(2) Gate replication (ctl):** `spearPassed / spearSeen
  == 1.0` on the ctl leg.
- **(3) ATTRIBUTABLE-SERVED ≥ 3 — BINDS.** Counted straight
  from the recorder: depmat rows with `spearHolder` true AND
  `depmatSite` true AND `source === 'crafted'` on the arm leg
  — staged bows the mechanism caused. Recorded beside it, NOT
  binding: the raw staged count (`arm.staged − ctl.staged`).
- **(4) Served-bow volley join ≥ 1 — BINDS.** Wave-4+ pair-
  inclusive engaged meetings where the fighter's vid is in the
  served set (a depmatSite-crafted spear row on an earlier-or-
  same day) AND the meeting's `rangedId` is `bow` or
  `crude_bow` AND `volley.shots > 0`. Volleys fired by served
  bows, NOT the raw volley share.
- **(5) Consistency — FULL PARTITION formula — BINDS.**
  The roll change moves rows ONLY between `craftedFail` and
  `crafted` — a flipped pick was a failed craft, never a
  noSource departure — so `noSource` and total departures are
  mechanism-invariant, and any move in them is cascade/drift.
  Two parts, both must hold:
  (a) partition residual `|arm.noSource − (ctl.noSource −
  (arm.staged − ctl.staged) − (arm.craftedFail −
  ctl.craftedFail))| ≤ 3` — the bowsee partition formula
  completed with the `craftedFail` term whose absence the
  bowsee metric review proved false (equal-craftedFail
  assumption broken twice);
  (b) total departures `|arm.total − ctl.total| / ctl.total
  ≤ 0.05`.
  NOT used, and why (stated here, not hidden): the bowknow
  form (`arm.noSource ≈ ctl.noSource − (arm.staged −
  ctl.staged)`) prices the staged gain against noSource, but
  the roll draws its extra crafts from craftedFail — it would
  fail by the staged gain (≈ 4–7) even when the villages hold
  together. The gate-off parenthetical shape (`ctl.noSource +
  arm.spearSeen − arm.staged`) is not used either: the bowsee
  prereg's formula-provenance section says it is off by the
  whole spear pool on a both-legs-gate-on design. `spearSeen`
  is not in the bar: serving eats its own pool by design
  (evade-a: 104 → 37), so a spearSeen bar would bind against
  success.
- **(6) Guardrail — SEPARATED form — BINDS.**
  `arm.deathsTotal ≤ ctl.deathsTotal` AND
  `arm.deathsPerEngaged ≤ 1.10 × ctl.deathsPerEngaged`
  (pair-inclusive engaged meetings). The strict ratio failed
  twice while absolute deaths FELL (depmat 775 < 854, evade
  808 < 878) because engaged meetings thinned faster than
  deaths — the ratio reads a thinning denominator. The
  separated form binds the hard cost (no more deaths overall)
  and tolerates a 10% ratio slip on a thin denominator
  (16–25 meetings). Both parts must hold; totals reported
  beside the ratio.
- **(7) Starvation ≤ ctl + 2 — BINDS.** Totals AND
  villager-only (the bowsee scalemetric reading).
- **Control identity / replication:** ctl `depmatOn == true`
  AND ctl `roll35On == false` AND ctl staging reproduces the
  depmat ARM corpus on this band (spearSeen 28, spearPassed
  28, alreadyHad 224, noSource 51, staged 17, craftedFail 29,
  departures 321, volley 8/16 pair, starvation 3 (villager 2),
  median 148.5d, deaths 775, wave 4 8/8, wave 5 4/8) —
  reported per seed, any divergence recorded, never hidden,
  never re-judged (this run judges roll35, not depmat; the
  base moved since depmat — commit db6f4d7ce already flipped
  seed 107055 once — so exactness is reported, not assumed).
- **Instrument errors 0** on all per-seed files.

**GO threshold:** pool floor met AND gate replication holds on
both legs AND attributable-served ≥ 3 AND served-bow volley
join ≥ 1 AND consistency holds AND guardrail holds AND
starvation holds.
**A miss on any bar is NO-GO, never re-scored.** In
particular: served-but-unvolleyed is a NO-GO on the join bar;
a roll change that moves nothing (served ≈ ctl) is a NO-GO on
the served bar — it would mean the learned rate does not reach
spear-holders in live play, and the evidence must say so, with
the site split showing whether it was no picks, no flips, or
no meetings.

## Secondary metrics (supporting, not binding)

- **The roll, sized by attempt class (the diagnostic this arm
  owes):** roll fail share among site-supplied spear picks vs
  all other craft attempts, per leg, with the rate actually
  used (`roll35Rate` on the row) — so the pilot can say
  whether the 60% rate fired where it was supposed to and
  whether the fails that remain are blind-rate picks (non-spear
  / bow rung / pile-stocked) or learned-rate picks that still
  failed.
- **The ammo wall (evade-a's named next wall, sized here, NOT
  the lever):** ammo-at-entry census for engaged meetings —
  how many enter with 0 ammo, split served-lead vs unserved —
  so the next arm inherits the size, not a guess.
- **The serve split:** site rows by spear vs non-spear per leg
  (the roll change must not move non-spear rows — the analyzer
  asserts the non-spear site split is unchanged in shape);
  site-supplied split by outcome (crafted / craftedFail);
  knowing-noSource spear-holders; pile-vine-empty rate at
  spear departures.
- **Volley-capable share at wave-4+ meeting entry per leg;
  spear share at the fight per leg. Staging by source per leg.
  Mean volley damage, ranged-at-entry share, trio+ population
  beside the primary, never substituted. Kill share,
  damage/round, community loss, median survival — reported as
  diagnostics, NOT binding here; only the guardrail binds as
  cost. Wall numbers every run: national / table / wins, wave-4
  and wave-5 unlocks, median survival, per leg. Table not
  instrumented by this driver — reported as null, never faked.

## Horizon, seeds, policies

- **Horizon:** 150d, death-aware (same as bowopen/speargate/
  bowcraft/spearstage/bowknow/bowsee/depmat/evade bands, for
  comparability). Dead villages stop simulating (+10d tail max).
- **Seeds (REUSED 8-seed pilot band, deliberate paired
  before/after — NOT a fresh designation): 107051, 107052,
  107053, 107054, 107055, 107056, 107057, 107058.** Freshness
  check (skill local_seed_band_freshness), run 2026-11-20
  ~17:15 UTC, before this prereg was frozen:
  `grep -rln "107051" evidence/*/sim-*-prereg.md` returns
  eight files — `sim-bowknow-a-prereg.md` (this band's first
  use), `sim-searsupply-a-prereg.md` (sibling arm, finding
  #2599, HALTED mid-pilot, no verdict, no shared state),
  `sim-bowsee-a-prereg.md`, `sim-depmat-a-prereg.md`,
  `sim-evade-a-prereg.md` (the prior arms on this finding;
  the depmat ARM corpus is the replication target named
  above), `sim-cellgate-a-prereg.md` (sibling arm, finding
  #2599-adjacent, no shared state), `sim-gunrate-a-prereg.md`
  (sibling arm, different lever, no shared state), and
  `sim-presence-a-prereg.md` (sibling arm, same 1705Z run,
  different lever, no shared state). `grep -c "10705[1-8]"`
  over goal `hidden_files/sim-findings.md` — **4**
  (references, not designations); over goal
  `hidden_files/convergence-tracker.md` — **9** (references,
  not designations); `grep -rl "10705[1-8]"` over goal
  `hidden_files/lever-claims/` — **no file** (the live claim
  `fleshout-20261120T1705Z.json` names this run's arms
  `sim-draftmiss-a` + `sim-lend-a` + `sim-roll35-a` but lists
  no seeds). No OTHER live claim names this band. Reuse is
  deliberate: the depmat arm corpus on identical seeds is the
  paired before, this arm's ctl leg (DEPMAT=1, same substrate)
  must reproduce it, and the arm leg differs by exactly one
  flag — the cleanest before/after this finding can get.
- **Policies:** competent verbatim. **Substrate both legs:**
  `VETREENGAGE=1 + PARTYSIZE4=1 + FLEEREPAIR2=1 + FIGHTALLY2=1`,
  `SENSEEXPED=1`, `BOWOPEN=1`, `SPEARGATE=1` (the gate ON).
  BOWCRAFT is always-on in code on both legs (live ground, not
  a flag). BOWKNOW, DEPARTSEE, and EVADEOBS are UNSET on both
  legs. **Ctl = same code, DEPMAT=1; arm = same code, DEPMAT=1
  + ROLL35=1.** The legs differ ONLY by env — no code change
  between legs. The driver asserts the flags match the MODE
  label and each corpus file records `depmatOn` +
  `depmatPresent` + `roll35On` + `roll35Present` +
  `speargateOn` + `speargatePresent` + `bowopenOn` +
  `bowopenPresent` + `bowknowOn` + `wiringSha` + `gameSha`.
- **Instrument:** `scripts/roll35-driver-a.js` (thin clone of
  `scripts/depmat-driver-a.js`, RUN=roll35-a,
  OUTDIR=perseed-roll35-a-{ctl,arm} — env-parametrized; the
  `depmatRows` recorder is EXTENDED — `roll35Rate` from the
  staging return, beside lv[crude_bow] / lv[bow], pile + own,
  `depmatSite` / `siteMats`); analyzer
  `scripts/analyze-roll35-a.js` — cloned from the depmat
  analyzer with the judge re-pointed to this prereg's bars
  (attributable-served, served-bow volley join, FULL-partition
  consistency, SEPARATED guardrail, starvation) plus the roll
  fail-share-by-class and ammo-at-entry diagnostics and
  `--selftest` covering the new bars. Per-seed JSONs under
  `evidence/2026-11-20/perseed-roll35-a-{ctl,arm}/`.
  **§15 panel:** `scripts/build-roll35-panels-a.js` (cloned
  from the depmat builder, re-pointed at the roll35 corpora)
  + `node scripts/balance-panel.js compare`; the compare `.md`
  is attached to the evidence file. The panel is the
  instrument, the frozen bars above are the judge.
- **PILOT ONLY.** No 12–16 seed confirm in this run unless the
  pilot GOes and the evidence judges a confirm warranted; the
  coordinator decides the confirm from the pilot verdict.

## Encounter-gear fixture (Steve 2026-11-13)

The verdict turns on whether a departing spear-holder is SERVED
and whether the served bow volleys, so the fixture is the
departure itself, staged by the competent policy: a geared
scholar fighting with a party, never a fresh un-geared solo
scholar. The proof test (`scripts/test-roll35-a.js`, GREEN
before the pilot) runs on a LIVE loaded village with real
roster/gear — a geared fighter holding a hunting spear in the
ranged slot, knowing crude_bow (lv 1), an empty pile — and
proves: (a) ROLL35 off = the spear-holder's departure craft
faces the blind 35% rate (old behavior — a roll of 0.50 fails);
(b) ROLL35 on = the same spear-holder faces the learned 60%
rate at lv 1 (a roll of 0.50 succeeds, crafts and stages a
crude bow) with `roll35Rate` 0.60 on the return; (c) with the
flag on and a failing roll at the learned rate (0.99), the
staging records craftedFail and the pile is never driven
negative; (d) a NON-spear-holder with the flag on still faces
the blind 35% (a roll of 0.50 fails — the scoping); (e) a
spear-holder crafting the `bow` rung with the flag on still
faces the blind 35% (the crude-only rule); (f) a spear-holder
at lv[crude_bow] = 2 with the flag on still faces the learned
85% (a roll of 0.80 succeeds — the learned rate is untouched);
(g) flag unset = old behavior byte-identical (the (a) control
IS the byte-identity proof for the flag); (h) draw-neutrality:
a ROLL35-on call consumes exactly one Math.random draw with a
pick, zero without — identical to flag-off. The DEPMAT rebuild
is proven by `scripts/test-depmat-a.js` (43/43) on the rebuilt
code, and the existing landed proofs
(`test-spearstage-a.js`, `test-speargate-a.js`,
`test-bowcraft-a.js`, `test-bowknow-a.js`) are re-run on this
base before the pilot. The pilot's per-seed corpora carry the
encounter averages (party size, gear, abilities, ranged-at-entry)
beside the verdict in the evidence file.

## Pre-pilot substrate checklist (§14b)

1. **Contact:** launched wave-4 meetings occur on the substrate
   — depmat band: 28 spear-holder departures (arm leg), 16
   pair-inclusive engaged meetings per 8 seeds. The spearSeen
   floor (≥ 10) is sized to that known density.
2. **Pool sizing:** the attributable-served bar (≥ 3) is sized
   against the depmat pilot (5 served on the unscoped bundle at
   35%) and the sizing above (≈ +4 expected at 60% on the
   depmat-shaped band). The volley bar (≥ 1) is sized against
   the evade-a result (1 join from 8 served, with the evade fix
   ON) — with the fix OFF here, the background evade rate is
   higher, so the bar judges whether the volume increase pushes
   a volley through; a join miss with served ≥ 3 is a NO-GO
   with the volume proven, and the next arm inherits a bigger
   served population, not a failed mechanism.
3. **Mechanism pre-check (frozen, not a sim):** the proof test
   (`scripts/test-roll35-a.js`, GREEN before the pilot) proves
   the learned-rate rule on a live village (see the fixture
   section above), and `scripts/test-depmat-a.js` (43/43) proves
   the rebuilt substrate. The analyzer `--selftest` covers the
   new judge shapes (GO / NO-GO served-zero / NO-GO
   volley-join-zero / full-partition consistency / separated
   guardrail / starvation / roll fail-share / ammo census).

## Metric review (to be written after the pilot — frozen bars judge as written)

- Finding #2590: claimed by this arm; on GO the serve half is
  confirmed — the learned first-make rate puts bows into
  spear-holders' hands and the served bows fire volleys. On
  NO-GO the finding stays open with the failing bar named, and
  the next lever is named (the roll split + ammo census in the
  instrument tell the next arm whether to attack the ammo wall,
  the evade wall again, or the crude-only rule).
- The consistency bar is the full partition formula (this
  prereg): if it misfires on the judged corpus, the metric
  review says so — the verdict does not get re-scored — and
  names whether the misfire is the staged↔craftedFail swap
  (expected), a noSource move (cascade), or a total-population
  drift.
- The guardrail is the separated form (this prereg): if the
  ratio part misfires while absolute deaths fall, the review
  says so — the verdict does not get re-scored — and the next
  arm inherits the separated form as the standing guardrail.
- RNG divergence: if the arm leg's departure counts drift from
  ctl, the review names the drift seeds and whether any bar
  turned on it — the verdict does not get re-scored, but the
  next arm needs the drift sized.
- Draw-neutrality is a property of the mechanism, not of the
  corpora: a flipped pick puts a bow in a hand, so the streams
  diverge by design once the rate fires. The review must not
  re-litigate this as a mechanism failure.
