# sim-ammo-a — PREREG (frozen BEFORE any judged sim)

**Arm:** sim-ammo-a · **Loop A run:** fleshout-20261120T2015Z
**Type:** BUILD + MEASURE (pilot) — finding #2590's serve half, ammo first:
the served bow departs with pocket ammo, scale-onramp axis.
**Frozen:** 2026-11-20 ~21:25 UTC, before any judged sim, before the
AMMO lever is implemented (the instrument + probe below are design
research, never judged — see §0.4).
**Branch:** `sim-ammo-a` (worktree
`~/workspace/worktrees/sim-ammo-a`). **Base:** master c0ac4c3c9
(rebased from the registration base fca0aa6c3; the fast-forward
pulled in Loop B's 9b14b0b93 dmgcheck-b evidence + the sense3-b
landings; no rebase conflicts, no local commits replayed).
**Builds on:** `evidence/2026-11-20/sim-roll35-a.md` + prereg
(NO-GO: the learned 60% roll doubles servings to 10, but 0
served-bow volleys — 5 engaged served fights entered with 0 ammo,
and the two best-armed served leads, 5 and 8 arrows, both evaded),
`evidence/2026-11-20/sim-evade-a.md` + prereg (NO-GO: evade
mechanism proven live, 8 attributable served, 1 served-bow volley;
the ammo wall sized at 17/25 engaged meetings entering with 0
ammo), `evidence/2026-11-19/sim-bowsee-a.md` (NO-GO: knowledge
seeding non-binding, materials wall), `evidence/2026-11-19/
sim-bowknow-a.md` (NO-GO: mentoring serves 0),
`evidence/2026-11-19/sim-speargate-a.md` (gate fix landed).

## §0. The design call (frozen, not a sim)

The roll35 verdict named this lever exactly: "the served bow needs
arrows: pocket ammo for the served bow at departure, or an ammo
supply the crafter can draw on." The evade-a evidence sized it the
same way: "the pocket-ammo craft (arrow: stick 2 + stone 1 +
fiber 1, one batch of 5 per departure at the blind 35%) needs pile
materials the village may not hold."

The code was read in full before designing. `villagerPocketAmmo`
(`src/js/game.js`, gap-ammo 2026-10-27, Triage A4) already runs at
every departure, AFTER `villagerStageBow`, from `startExpedition`
(`src/js/villager-agency.js`: stageBow then pocketAmmo — the order
is already right, the staged bow IS visible to the pocket step):
a bow-holder pockets, in order, (1) their own stashed ammo,
(2) sling stones from the communal pile, (3) ONE craft attempt per
departure for bow/crossbow ammo from the communal pile, using the
EXISTING arrow/bolt recipes (arrow: stick 2 + stone 1 + fiber 1,
makes 5; bolt: stick 2 + stone 1, makes 5) at the player's craft
odds exactly (blind 35%, learned 85%; a blind success teaches —
the PRACTICE rule). So the departure packing already exists; what
it does NOT do is give the JUST-SERVED bow any priority — the
freshly staged crude bow faces the same blind 35% lottery as any
old bow, with the same pile-materials gate.

### §0.1 The frozen rule — AMMO=1 (the served-bow quiver)

In `villagerPocketAmmo`, step 3, at the departure arrow/bolt craft
attempt — and nowhere else — when the carrier's bow was staged
THIS departure (a served bow: `village.bowOpenByVid[vid]` has
`day === today` and `source` in `crafted` / `fromStash` /
`fromArmory`), the craft rate becomes lv ≥ 2 ? 0.85 : **0.60**.
The 85% learned rate for a carrier who has actually made arrows
is untouched; the 35% blind rate stays for everyone else
(alreadyHad bows, non-served carriers, the home craft). One flag,
one threshold swap on the SAME single draw — the craft still
consumes exactly one `Math.random()` draw per attempt, so the RNG
streams stay aligned in count and the legs diverge only where a
pick's outcome flips. Default OFF in live play (env `AMMO=1`); the
turn-on decision is the coordinator's, NOT this arm's. The return
carries `ammoServed` (true when the served rate fired) and
`ammoRate` (the rate used on the attempt, null when no attempt
ran), so the instrument reads the lever off the return, never
from a re-read. Rationale, in plain words: a villager who has
just made a bow at the trailhead — who has the wood in their
hands and the shape fresh in mind — should not face lottery odds
on the arrows to go with it; the quiver stays hard (2-in-5 still
fail and the materials are lost, the same honesty as today), but
it is no longer a coin the village must win twice (once for the
bow, once for the arrows) to arm one fighter. The 85% rate still
waits on the other side of the first success, so the PRACTICE
rule keeps its meaning: making arrows is what makes you learned
at making them.

**Scope discipline (the roll35 precedent):** the rate change fires
for served-bow carriers only. A served bow is the population the
finding measures; alreadyHad bows are the control class — the
probe shows they already leave with ammo 12/15 times, so they
need no help and must not move.

### §0.2 The site-supply half is DROPPED — measured, not guessed

The brief's alternative form ("draws arrows from village stock,
or a quiver is crafted alongside the bow") was tested by the
probe before freezing (§0.4): across 53 pocketAmmo rows on the
fresh band, the pile NEVER lacked arrow materials
(`pileStick0`/`pileStone0`/`pileFiber0` all 0; the one served
departure had stick 199 / stone 258 / fiber 33 in the pile) and
the fail reason was NEVER `no-mats` (0/53). The one served
departure left empty because the blind 35% craft FAILED with
materials plentiful. A site-supply half would fire on ~0
departures — it is dropped as vacuous on measured evidence, and
the lever is the rate alone. If the pilot's pile profile ever
shows `no-mats` firing, the metric review says so and the next
arm re-opens the supply question; it is not re-litigated here.

### §0.3 Draw-neutral by construction

The rate change swaps a threshold on the existing single draw —
zero new `Math.random` draws, verified by grep over the diff and
by counting draws in the proof test (an AMMO-on call consumes
exactly one draw with a craft attempt, zero without, identical
to flag-off). The DEPMAT + ROLL35 substrate is draw-neutral by
construction (depmat/roll35 proofs). The recorder is pure reads.
Draw-neutrality is a property of the mechanism, not a promise of
byte-identical corpora — a flipped craft puts arrows in a pack,
and the villages can still diverge from there.

### §0.4 Design research before freezing (NOT a judged sim)

Two unjudged probe seeds + one fidelity smoke ran BEFORE this
prereg was frozen, on the substrate only (DEPMAT=1 + ROLL35=1,
AMMO unset — the lever did not exist yet). No bar was judged on
them; they size the design, exactly as the roll35 prereg's §0
"Unjudged diagnostic sizing" did from prior corpora (there were
no prior corpora with pocketAmmo rows, so a probe was run
instead). Probe corpora:
`evidence/2026-11-20/perseed-ammo-a-probe/` (seeds 107071,
107072, MODE=ctl, substrate only, 0 instrument errors),
smoke corpus `evidence/2026-11-20/perseed-ammo-a-smoke/`
(seed 107051, MODE=ctl, substrate only, 0 instrument errors).

Probe findings (2 seeds, 53 pocketAmmo rows, 0 errors):
- Fail reasons: already-capped 36, craft-ok 8, craft-fail 5,
  no-ranged 4, **no-mats 0**. Pile material zeros: stick 0,
  stone 0, fiber 0. Pile arrows seen: 0 rows (arrows are never
  stocked in the pile — "draws arrows from village stock" has no
  stock to draw on; the craft is the only arrow source).
- The ONE served departure (seed 107071, day 34, non-spear,
  crude_bow crafted via site vine): pile stick 199 / stone 258 /
  fiber 33, craft ran, blind 35% FAILED, carriedAfter 0. The
  roll is the wall, not the materials — §0.2's drop.
- Bow-holders already leave with ammo 12/15 times
  (allBowWithAmmo); the gap is served bows specifically (0/1).
- **Thin-band warning (stated plainly, not hidden):** the served
  population is thin on this band — 1 served departure in 2
  probe seeds, `spearSeen` 0, `attributableServed` 0, 0
  served-bow engaged meetings. The villages here are bow-rich
  and bow-knowing (48 alreadyHad of 53 departures, lv[bow] ≥ 1
  on all 53 attempts), so the stageBow craft step rarely fires.
  The pilot's pool floor (bar 0, ≥ 3 served-bow engaged
  meetings) is the judge of whether this band can support the
  primary metric at all; a THIN-POOL verdict is an honest
  verdict about the band, not a failure of the lever — and the
  evidence must say which it is.

Fidelity smoke (seed 107051, substrate DEPMAT+ROLL35): the ammo
driver reproduces the roll35 ARM corpus on that seed EXACTLY —
spearSeen 3/3, crafted 2, craftedFail 3, noSource 0,
departures 10, deaths 56, days 145, wave 5, rate-0.60 picks 2
(1 crafted / 1 failed). The substrate rebuild is faithful; the
thin serve population on the fresh band is a band property, not
a code artifact.

**Canon:** `docs/CANON.md` read (manifest) and
`docs/MONSTER-WAVES.md` read. No canon doc covers departure
pocket ammo, the served-bow quiver, launch gear-up, or the
ranged-slot rules — said here rather than inventing canon. The
mechanism respects "If you don't know, it doesn't show": the
carrier must already hold a served bow, and the rate rewards
that making rather than conjuring arrows. Arrows stay earthly
craft, not System magic; no monster stats, wave pacing, or
damage formulas are touched.

## The question

Depmat + roll35 (fresh band 107071–107078, gate ON, DEPMAT
bundle + ROLL35 rate live): the bow serve works where the
pipeline fires, and the served bow still leaves the trailhead
with an empty quiver two times in three. **Does replacing the
blind 35% arrow-craft rate with a learned 60% rate — served-bow
carriers only, at the departure craft attempt — put arrows into
served bows' packs, and do those quivered served bows reach the
fight with ammo in hand?**

## Primary metric (BINDING, §14)

Wave-4+ engaged meetings + staging departures, from the live
corpora (never snapshots). Legs differ ONLY by AMMO; the DEPMAT
bundle + ROLL35 rate are ON on BOTH legs (ctl = the substrate
ground) and the SPEARGATE gate is ON on BOTH legs. BOWKNOW,
DEPARTSEE, and EVADEOBS are UNSET on BOTH legs (knowledge
seeding is proven non-binding and must not leak into this
measurement; the evade fix is proven and is NOT re-landed here,
so the evade wall stands at its background rate — evade-on-a-
served-quivered-bow is the NEXT arm, not this one).

- **(0) Pool floor:** arm served-bow engaged meetings ≥ 3
  (the RAW population below — if the band cannot field 3, the
  primary is unjudgeable and the verdict is THIN-POOL).
- **(1) Substrate-served:** arm `attributableServed` ≥ 3
  (spear + site-supplied + crafted, read straight off
  depmatRows — without served bows the primary has no
  population).
- **(2) PRIMARY — served-bow ammo at entry — BINDS.** The RAW
  population: ALL wave-4+ engaged meetings (any origin, any
  party — the quiver matters whenever the bow is carried into a
  fight, and the probe shows most wave-4+ fights are
  world-tick/aid, outside any launched party), lead served by
  the mechanism (attributable-served, served day ≤ meeting
  day), outcome engaged (rounds > 0, outcome in vKill/vDie/
  vFlee/mFlee). **GO iff ≥ 50% enter with ≥ 1 arrow** (arm
  `servedEngagedWithAmmo / servedEngaged ≥ 0.50`). The roll35
  band's anchor is 0/5 on exactly this population (the five
  engaged served fights in the roll35 sense-test notes, all 0
  ammo). The pair-inclusive ammo census is reported beside it,
  NOT binding.
- **(3) Secondary — served-bow volley — BINDS.** Served-bow
  volleys fired ≥ 1 on the band (raw population: volley.shots
  > 0, rangedId bow/crude_bow, lead served). The pair-inclusive
  served-bow volley join is reported beside it, NOT binding.
- **(4) Guardrail — starvation — BINDS.** `arm.starvation ≤
  ctl.starvation + 2` AND `arm.starvationVillager ≤
  ctl.starvationVillager + 2` (the scalemetric cost bar from the
  task brief: totals AND arm-only).
- **(5) Guardrail — median survival — BINDS.**
  `arm.medianDays ≥ 0.80 × ctl.medianDays` (the scalemetric
  cost bar from the task brief).
- **No consistency bar.** The primary is a within-arm share —
  the roll35 metric review's prescription (judge within-run,
  not the paired totals, for a day-2 lever). Departure totals
  and the partition are reported as diagnostics, never
  re-scored. A miss on any bar is NO-GO, never re-scored.
- **Instrument errors 0** on all per-seed files.

**GO threshold:** pool floor met AND substrate-served met AND
primary share ≥ 0.50 AND secondary volley ≥ 1 AND starvation
holds AND median survival holds.

## Secondary metrics (supporting, not binding)

- **The quiver, sized by fail reason:** pocketAmmo fail-reason
  split on served departures per leg (craft-ok / craft-fail /
  no-mats / stock-draw / already-capped), the served-carried
  mean, and the rate actually used (`ammoRate` on the row:
  0.60 served, 0.35 blind, 0.85 learned-at-lv2) — so the pilot
  can say whether the 60% rate fired where it was supposed to
  and whether the empties that remain are blind-rate picks or
  learned-rate picks that still failed.
- **The supply profile:** pile stick/stone/fiber zeros at
  served departures per leg (the §0.2 drop, re-checked live —
  if `no-mats` ever fires, the metric review re-opens supply).
- **The serve split:** site rows by spear vs non-spear per leg;
  knowing-noSource spear-holders; pile-vine-empty rate at spear
  departures (the substrate's health, carried over from
  roll35).
- **Volley-capable share at wave-4+ meeting entry per leg;
  spear share at the fight per leg. Staging by source per leg.
  Mean volley damage, ranged-at-entry share, trio+ population
  beside the primary, never substituted. Kill share,
  damage/round, community loss, median survival — reported as
  diagnostics, NOT binding here; only the guardrails bind as
  cost. Wall numbers every run: national / table / wins, wave-4
  and wave-5 unlocks, median survival, per leg. Table not
  instrumented by this driver — reported as null, never faked.

## Horizon, seeds, policies

- **Horizon:** 150d, death-aware (same as bowopen/speargate/
  bowcraft/spearstage/bowknow/bowsee/depmat/evade/roll35 bands,
  for comparability). Dead villages stop simulating (+10d tail
  max).
- **Seeds (FRESH 8-seed pilot band): 107071, 107072, 107073,
  107074, 107075, 107076, 107077, 107078.** Freshness check
  (skill local_seed_band_freshness), run 2026-11-20 ~21:10 UTC,
  before this prereg was frozen:
  `grep -rn "107071\|107072\|107073\|107074\|107075\|107076\|107077\|107078"
  evidence/*/sim-*-prereg.md` returns **nothing** — no prereg
  names any seed in this band. `grep -rln "10707"
  evidence/*/sim-*-prereg.md` returns five files whose matches
  are embedded JSON numbers inside corpora pasted into preregs,
  not band designations (verified: none of the five names
  107071–107078 as a band). No forbidden/contaminated band list
  names it; no live claim names it (the live claim
  `fleshout-20261120T2015Z.json` names this run's arms, not
  seeds — checked before freezing). The band is fresh. The two
  probe seeds (107071, 107072) are re-run as full judged pilot
  seeds — the probe corpora are unjudged design research and are
  NOT counted toward the pilot (the pilot writes fresh corpora
  under `perseed-ammo-a-{ctl,arm}`).
- **Policies:** competent verbatim. **Substrate both legs:**
  `VETREENGAGE=1 + PARTYSIZE4=1 + FLEEREPAIR2=1 + FIGHTALLY2=1`,
  `SENSEEXPED=1`, `BOWOPEN=1`, `SPEARGATE=1`, `DEPMAT=1`,
  `ROLL35=1`. BOWCRAFT is always-on in code on both legs (live
  ground, not a flag). BOWKNOW, DEPARTSEE, and EVADEOBS are
  UNSET on both legs. **Ctl = same code, AMMO unset; arm = same
  code, AMMO=1.** The legs differ ONLY by env — no code change
  between legs. The driver asserts the flags match the MODE
  label and each corpus file records `depmatOn` +
  `depmatPresent` + `roll35On` + `roll35Present` + `ammoOn` +
  `ammoPresent` + `speargateOn` + `speargatePresent` +
  `bowopenOn` + `bowopenPresent` + `bowknowOn` + `wiringSha` +
  `gameSha`.
- **Instrument:** `scripts/ammo-driver-a.js` (clone of
  `scripts/roll35-driver-a.js`, RUN=ammo-a,
  OUTDIR=perseed-ammo-a-{ctl,arm} — env-parametrized; the
  `depmatRows` recorder is UNCHANGED, plus the NEW `ammoRows`
  recorder — a pure-read wrap of `Game.villagerPocketAmmo`
  capturing, per departure, rangedId/ammoId, servedThisDepart,
  carriedBefore/After, stashedBefore, pile stick/stone/fiber +
  pile arrow stock, ammoCraft level, pocketed/crafted/
  craftedOk, `ammoServed`/`ammoRate` from the return, and the
  derived fail reason); analyzer
  `scripts/analyze-ammo-a.js` — cloned from the roll35
  analyzer with the judge re-pointed to this prereg's bars
  (pool floor, substrate-served, primary ammo-at-entry share,
  secondary volley, starvation + median-survival guardrails)
  plus the quiver fail-reason / pile-profile / rate-split
  diagnostics and `--selftest` covering the new bars (75/75
  green at freeze). Per-seed JSONs under
  `evidence/2026-11-20/perseed-ammo-a-{ctl,arm}/`.
  **§15 panel:** `scripts/build-ammo-panels-a.js` (cloned
  from the roll35 builder, re-pointed at the ammo corpora)
  + `node scripts/balance-panel.js compare`; the compare `.md`
  is attached to the evidence file. The panel is the
  instrument, the frozen bars above are the judge.
- **PILOT ONLY.** No 12–16 seed confirm in this run unless the
  pilot GOes and the evidence judges a confirm warranted; the
  coordinator decides the confirm from the pilot verdict.

## Encounter-gear fixture (Steve 2026-11-13)

The verdict turns on whether a departing served-bow carrier
leaves with arrows, so the fixture is the departure itself,
staged by the competent policy: a geared scholar fighting with
a party, never a fresh un-geared solo scholar. The proof test
(`scripts/test-ammo-a.js`, GREEN before the pilot) runs on a
LIVE loaded village with real roster/gear — a geared fighter
holding a freshly staged crude bow (served this departure),
knowing arrows at lv 1, a stocked pile — and proves: (a) AMMO
off = the served carrier's arrow craft faces the blind 35%
rate (old behavior — a roll of 0.50 fails); (b) AMMO on = the
same served carrier faces the learned 60% rate at lv 1 (a roll
of 0.50 succeeds, crafts 5 arrows) with `ammoRate` 0.60 and
`ammoServed` true on the return; (c) with the flag on and a
failing roll at the learned rate (0.99), the attempt records
craftedFail and the pile is never driven negative; (d) a
NON-served bow-holder (alreadyHad bow) with the flag on still
faces the blind 35% (a roll of 0.50 fails — the scoping);
(e) a served carrier at lv[arrow] = 2 with the flag on still
faces the learned 85% (a roll of 0.80 succeeds — the learned
rate is untouched); (f) a served carrier with a stone-sling
(ammo `stone`, no pile recipe) is untouched by the flag (no
craft attempt, no `ammoServed`); (g) flag unset = old behavior
byte-identical (the (a) control IS the byte-identity proof for
the flag); (h) draw-neutrality: an AMMO-on call consumes
exactly one Math.random draw with a craft attempt, zero
without — identical to flag-off. The substrate is proven by
`scripts/test-depmat-a.js` (43/43) and
`scripts/test-roll35-a.js` (41/41) on the rebuilt code, and the
existing landed proofs (`test-spearstage-a.js`,
`test-speargate-a.js`, `test-bowcraft-a.js`,
`test-bowknow-a.js`) are re-run on this base before the pilot.
The pilot's per-seed corpora carry the encounter averages
(party size, gear, abilities, ranged-at-entry) beside the
verdict in the evidence file.

## Pre-pilot substrate checklist (§14b)

1. **Contact:** launched wave-4 meetings occur on the substrate
   — probe band: 4 pair-inclusive engaged meetings per 2 seeds,
   27 + 14 wave-4+ encounters. The pool floor (≥ 3 served-bow
   engaged meetings) is sized to the roll35 band's 5, with the
   thin-band warning above: if the band cannot field 3, the
   verdict is THIN-POOL and the evidence says so.
2. **Pool sizing:** the substrate-served bar (≥ 3) is sized
   against the roll35 pilot (10 served on the reused band) and
   the probe's warning (0 in 2 seeds on this fresh band) — the
   bar judges whether the substrate serves at all here. The
   primary share (≥ 0.50) is sized against the roll35 anchor
   (0/5): at 60% per craft, a served carrier who attempts the
   craft leaves quivered 3 times in 5, so a 5-meeting pool
   clears 0.50 in expectation; a share miss with served ≥ 3 is
   a NO-GO with the quiver proven or disproven by the
   fail-reason split, and the next arm inherits the split, not
   a guess.
3. **Mechanism pre-check (frozen, not a sim):** the proof test
   (`scripts/test-ammo-a.js`, GREEN before the pilot) proves
   the served-rate rule on a live village (see the fixture
   section above), and `scripts/test-depmat-a.js` (43/43) +
   `scripts/test-roll35-a.js` (41/41) prove the rebuilt
   substrate. The analyzer `--selftest` covers the new judge
   shapes (GO / NO-GO share 0.40 / NO-GO thin pool 2 and 0 /
   NO-GO substrate 2 / NO-GO volley 0 / starvation at and past
   ctl + 2 / median survival at and below 0.80x / share exactly
   0.50). The fidelity smoke reproduces the roll35 arm corpus
   on seed 107051 exactly (§0.4).

## Metric review (to be written after the pilot — frozen bars judge as written)

- Finding #2590: claimed by this arm; on GO the serve half is
  confirmed — the served bow departs with pocket ammo and the
  quivered bows reach fights with arrows in hand. On NO-GO the
  finding stays open with the failing bar named, and the next
  lever is named (the quiver fail-reason split + the evade wall,
  in that order — evade-on-a-served-quivered-bow is the named
  next arm).
- The primary is a within-arm share on the RAW population (this
  prereg): if it misfires, the metric review says whether the
  miss is the share (quivers empty), the pool (band too thin
  to judge), or the substrate (no bows served) — the verdict
  does not get re-scored — and names which population the miss
  lives in (raw vs pair-inclusive).
- The guardrails are the scalemetric cost bar (this prereg):
  starvation ≤ ctl + 2 (totals AND villager-only) and median
  survival ≥ 0.80× ctl. If either misfires, the review says so
  — the verdict does not get re-scored — and names whether the
  cost is starvation, survival, or both.
- RNG divergence: if the arm leg's departure counts drift from
  ctl, the review names the drift seeds and whether any bar
  turned on it — the verdict does not get re-scored, but the
  next arm needs the drift sized.
- Draw-neutrality is a property of the mechanism, not of the
  corpora: a flipped craft puts arrows in a pack, so the
  streams diverge by design once the rate fires. The review
  must not re-litigate this as a mechanism failure.
