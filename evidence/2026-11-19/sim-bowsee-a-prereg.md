# sim-bowsee-a — PREREG (frozen BEFORE any judged sim)

**Arm:** sim-bowsee-a · **Loop A run:** fleshout-20261120T0515Z
**Type:** BUILD + MEASURE (pilot) — finding #2590's OPEN serve half
(departure-site seeing: a party-mate's bow seeds bow knowledge at
the departure craft), scale-onramp axis.
**Frozen:** 2026-11-20 ~05:30 UTC, before any judged sim.
**Branch:** `sim-bowsee-a` (worktree
`~/workspace/worktrees/sim-bowsee-a`). **Base:** master 0d925556a
(rebased from 8cd4c0181 onto the ship loop's version bump; version
files only, zero overlap with this arm's files).
**Builds on:** `evidence/2026-11-19/sim-spearstage-a.md` + prereg
(NO-GO: gate 49/49, served 0, volley rise +0.000),
`evidence/2026-11-19/sim-speargate-a.md` (gate fix landed),
`evidence/2026-11-19/sim-bowknow-a.md` + prereg (NO-GO: mentoring
serves 0 on band 107051–107058; gate 108/108 both legs; instrument
gap — lv[bow] reach unrecorded).

## §0. The design call (frozen, not a sim)

The bowknow verdict closed the home-teaching path and named this
one: the departure craft is the moment a spear-holder needs the
knowledge, and the knowledge is standing right there — a
party-mate's equipped bow, visible while the party gears up at the
departure site. The code was read in full before designing
(`src/js/game.js` `villagerStageBow` ~7813–8020;
`src/js/villager-build.js` `villagerWeaponCraftDay` ~1302–1530;
`src/js/villager-agency.js` `startExpedition` ~468–600;
`src/js/villager-brain.js` `vbrainExecuteDepart` ~1189–1252;
`src/js/win-plan.js` `winPlanDepart` ~673–744):

- The departure craft (`villagerStageBow` step 3) reads the shared
  `v.weaponCraft` record and never seeds it — a spear-holder with
  lv[bow] = 0 never attempts, however many bows stand beside them.
- Party launches call `startExpedition` for the holder first, then
  each companion, in one tick on a shared target — so the party
  gears up together at the departure site. The holder's staging
  runs while companions are still at home; a companion's staging
  runs just after the holder stepped out (their equipped gear is
  still on their person, one tile out).
- The party a departing villager belongs to is the win-plan party:
  the plan they hold, or a plan that lists them as a companion.
  The holder is the plan's key in `v.winPlan`; the companions are
  `plan.party`. Solo (non-plan) expeditions have no party-mates by
  definition — DEPARTSEE cannot fire for them, and the instrument
  records them as `hasParty: false` so the pilot can say how much
  of the spear pool was even eligible.
- The stash/armory alternative stays closed by design (individual
  ownership, Steve 2026-10-09; spearstage measured fromStash /
  fromArmory 0). Mentoring stays as built (default-off BOWKNOW,
  not landed, unset on both legs here) — this arm does not touch it.

**Chosen mechanism — DEPARTSEE=1 (departure-site seeing):** in
`villagerStageBow`, step 3, immediately before the craft-pick
loop — and nowhere else — if DEPARTSEE is on: find the departing
villager's win-plan party (their own plan, or the first plan
listing them as a companion); mates are the plan holder plus
`plan.party`, minus the crafter. If any mate currently has an
EQUIPPED volley-capable bow (`S.equipment.volleyWeaponOf`, the
SPEARGATE read — a spear in the ranged slot does not count) and
the crafter's lv[bow] is 0, set lv[bow] = 1 in the crafter's own
`v.weaponCraft` record, with a `weapon_see` telemetry event
(`{vid, by: mateVid, item: 'bow', site: 'departure'}`) and — when
the scholar is at home to witness it — one spoken line naming
mate and crafter. The crafter still needs materials and still
faces the blind 35% craft roll; a blind success still teaches
(the PRACTICE rule). Seeding fires only for a crafter who has
already failed alreadyHad / stash / armory and reached the craft
attempt — a crafter served from the stash never gains knowledge
they did not use. One flag, one rule addition, no new system.
Default OFF in live play (env `DEPARTSEE=1`); the turn-on
decision is the coordinator's, NOT this arm's. Rationale, in
plain words: standing at the trailhead with your party, you can
SEE how your mate's bow is strung — so you can try to make one
before you leave, with what you are carrying and what the pile
holds.

**Draw-neutral by construction:** the seeding block performs no
`Math.random` / `R()` draw on either leg — it reads equipped gear
and writes one record field. Verified by grep over the diff
before the pilot (no `Math.random`, no `R(` in the added block).
Note the bowknow lesson, carried forward honestly: seeding
changes WHICH craft attempts fire, which consumes `Math.random`
differently downstream, so the legs' RNG streams can still drift
and departure counts can move (bowknow: +9 departures on the arm
leg). Draw-neutrality is a property of the mechanism, not a
promise of byte-identical corpora — the consistency bars below
are partition-based for exactly that reason.

**Canon:** `docs/CANON.md` read (manifest). No canon doc covers
launch gear-up, the ranged-slot rules, or weapon-craft knowledge
seeding — said here rather than inventing canon. The mechanism
respects the standing rule "If you don't know, it doesn't show":
nothing is conjured — a mate's bow is SEEN at the departure
site, and seeing is what already seeds knowledge (the BOWCRAFT
rule); this widens what counts as seen from equipped-at-home to
equipped-at-the-departure-site. Bow-craft is earthly knowledge,
not System magic, so a seeing-seeded L1 stays on the human-skill
side of the line.

## The question

Bowknow (band 107051–107058, gate ON, BOWCRAFT live): 108
spear-holder departures passed, 0 served, volley rise +0.030 —
and the pilot could not tell "never taught" from "taught but no
materials / failed roll", because lv[bow] reach was unrecorded.
**Does letting a party-mate's equipped bow seed lv[bow] = 1
exactly at the departure craft attempt put bows into
spear-holders' hands at departure — and does that reach the fight
as a volley? And, measured this time: how often does the seeding
fire, and when it fires but no bow is served, is it no materials
or a failed roll?**

## Primary metric (BINDING, §14)

Wave-4+ engaged meetings + staging departures, from the live
corpora (never snapshots). Legs differ ONLY by DEPARTSEE; the
SPEARGATE gate is ON on BOTH legs (ctl = bowknow's arm ground,
replication target — see below).

- **Pool floor:** arm `spearSeen` ≥ 10 (bowknow band: 108).
- **Gate replication (both legs):** `spearPassed / spearSeen == 1.0`
  on ctl AND arm (the gate must still take on this base/band with
  the gate on in both legs); `spearSeen` arm ≈ ctl (within ±3 —
  legs are seeded-identical, DEPARTSEE must not change who
  departs with a spear).
- **alreadyHad consistency ±3:** `arm.alreadyHad ≈ ctl.alreadyHad`
  (both legs gate-on; no ±spearSeen term — that term belonged to
  the gate-off control).
- **noSource consistency — PARTITION formula:** `arm.noSource ≈
  ctl.noSource − (arm.staged − ctl.staged)` (within ±3). Every
  departure partitions into staged / craftedFail / noSource;
  seeded-identical non-spear departures cancel, so a served
  spear-holder leaves noSource by exactly one.
- **SERVED:** `arm.staged − ctl.staged ≥ 3`, where staged =
  fromStash + fromArmory + crafted. The attributable yield of
  departure-site seeing: bows actually put into spear-holders'
  hands at departure.
- **Volley rate:** among wave-4+ pair-inclusive engaged meetings,
  volley-fire share arm − ctl ≥ +0.10 (bowknow band ctl 0.333).
- **Control identity / replication:** ctl `departseeOn == false`
  AND ctl staging reproduces the bowknow ctl corpus on this band
  (spearSeen 108, spearPassed 108, alreadyHad 195, noSource 255,
  staged 0, craftedFail 8, volley 7/21 pair) — reported per seed,
  any divergence recorded, never hidden, never re-judged (this run
  judges bowsee, not bowknow).
- **Cost bars (the scalemetric deciding cost bar):** starvation
  arm ≤ ctl + 2 on totals AND on villager-only (non-player)
  deaths — "arm-only deaths" in the brief is read as the
  villager-only starvation split, the bowknow/scalemetric
  reading — AND median survival arm ≥ 0.8 × ctl median.
  Instrument errors 0 on all per-seed files.

**GO threshold:** pool floor met AND gate replication holds on
both legs AND consistency bars hold AND served ≥ 3 AND
volley-rate rise ≥ +0.10 AND both cost bars pass.
**A miss on any bar is NO-GO, never re-scored.** In particular:
seeded-but-served-0 is a NO-GO on the served bar — it would mean
departure-site seeing does not reach spear-holders in live play,
and the evidence must say so, with the seed/outcome split
showing whether it was no mate bow, no materials, or a failed
roll.

**Formula provenance — this prereg REPLACES the frozen
spearstage formula, and says so:** the spearstage frozen
noSource bar (`arm.noSource` vs `ctl.noSource + arm.spearSeen`,
no term for staged) is satisfiable only while `arm.staged ≤ 3`
and meets SERVED exactly at 3 (spearstage metric review §76;
finding #2590). The partition formula adds the missing term —
minus `arm.staged` — so a served departure leaves noSource by
construction at any staged count. In the both-legs-gate-on shape
used here (and in bowknow), the `+ arm.spearSeen` term cancels:
the ctl leg already passes spear-holders over to the sources, so
`ctl.noSource` already contains them, and the partition formula
reduces to the bowknow form used above
(`arm.noSource ≈ ctl.noSource − (arm.staged − ctl.staged)`).
The coordinator brief's parenthetical
("ctl.noSource + arm.spearSeen MINUS arm.staged") is the
gate-off-ctl (spearstage) shape of the same partition principle;
it is NOT used here, because on this design it would expect
arm.noSource ≈ ctl.noSource + 108 − staged — off by the whole
spear pool. The bowknow form is the correct both-legs-gate-on
instantiation, and the judge implements that form.

## Secondary metrics (supporting, not binding)

- **lv[bow] reach (instrumented this run — the bowknow gap,
  closed):** per departure, `lvBowBefore` / `lvBowAfter` at the
  `villagerStageBow` call; share of spear-holder departures with
  lv[bow] ≥ 1 at the craft attempt per leg; seeded count and its
  split — seeded-then-crafted (served), seeded-then-craftedFail
  (failed roll), seeded-then-noSource (no materials). The judged
  numbers separate "never seeded" from "seeded but no materials /
  failed roll" for the first time on this finding.
- **Seeding opportunity:** departures with `hasParty` true and a
  mate bow visible (`mateBowVisible`), per leg — the pool the
  mechanism could ever touch. Solo departures (`hasParty`
  false) are ineligible by design and counted, not hidden.
- Volley-capable share at wave-4+ meeting entry per leg; spear
  share at the fight per leg. Staging by source per leg. Mean
  volley damage, ranged-at-entry share, trio+ population beside
  the primary, never substituted. Kill share, damage/round,
  deaths per engaged meeting, community loss — reported as
  diagnostics (the bowknow cost bars), NOT binding here; the
  scalemetric pair above binds. Wall numbers every run:
  national / table / wins, wave-4 and wave-5 unlocks, median
  survival, per leg. Table not instrumented by this driver —
  reported as null, never faked.

## Horizon, seeds, policies

- **Horizon:** 150d, death-aware (same as bowopen/speargate/
  bowcraft/spearstage/bowknow bands, for comparability). Dead
  villages stop simulating (+10d tail max).
- **Seeds (REUSED 8-seed pilot band, deliberate paired
  before/after — NOT a fresh designation): 107051, 107052,
  107053, 107054, 107055, 107056, 107057, 107058.** Freshness
  check (skill local_seed_band_freshness), run 2026-11-20
  ~05:25 UTC, before this prereg was frozen:
  `grep -rln "107051|...|107058" evidence/*/sim-*-prereg.md`
  returns exactly two files — `sim-bowknow-a-prereg.md` (this
  band's first use; its ctl corpus is this run's REPLICATION
  target) and `sim-searsupply-a-prereg.md` (sibling arm, same
  Loop A 0215Z run, a DIFFERENT lever — contest-prize searcaster
  supply, finding #2599 — HALTED mid-pilot at 3/16 seeds, no
  verdict; no shared state with this driver, no shared flags,
  no shared corpora). `grep -c "10705[1-8]"` over goal
  `hidden_files/sim-findings.md` — **2** (the #2590 line citing
  the bowknow band and the #2599 line citing the searsupply
  band — references, not designations); over goal
  `hidden_files/convergence-tracker.md` — **3** (the 0215Z run
  entry citing the shared band — references, not
  designations); `grep -rl "10705[1-8]"` over goal
  `hidden_files/lever-claims/` — **0 files** (no live claim
  names this band). Reuse is deliberate: the bowknow ctl
  corpus on identical seeds is the paired before, this arm's
  ctl leg (DEPARTSEE unset, same substrate) must reproduce it,
  and the arm leg differs by exactly one flag — the cleanest
  before/after this finding can get.
- **Policies:** competent verbatim. **Substrate both legs:**
  `VETREENGAGE=1 + PARTYSIZE4=1 + FLEEREPAIR2=1 + FIGHTALLY2=1`,
  `SENSEEXPED=1`, `BOWOPEN=1`, `SPEARGATE=1` (the gate ON —
  this arm measures the serve half on top of the landed gate).
  BOWCRAFT is always-on in code on both legs (live ground, not
  a flag). BOWKNOW is UNSET on both legs (default-off arm from
  another run, not landed — its mentoring must not leak into
  this measurement). **Ctl = same code, DEPARTSEE unset; arm =
  same code, DEPARTSEE=1.** The legs differ ONLY by env — no
  code change between legs. The driver asserts the flag matches
  the MODE label and each corpus file records `departseeOn` +
  `departseePresent` + `speargateOn` + `speargatePresent` +
  `bowopenOn` + `bowopenPresent` + `bowknowOn` + `wiringSha` +
  `gameSha`.
- **Instrument:** `scripts/bowsee-driver-a.js` (thin clone of
  `scripts/bowknow-driver-a.js`, RUN=bowsee-a,
  OUTDIR=perseed-bowsee-a-{ctl,arm} — env-parametrized, no fork
  of the recorder; ADDS the `departSeeRows` recorder — a pure-read
  wrap of `Game.villagerStageBow` capturing, per departure,
  `lvBowBefore` / `lvBowAfter`, `hasParty`, `mateBowVisible`,
  `mateBowVid`, and the staging `source` after the call);
  analyzer `scripts/analyze-bowsee-a.js` — cloned from the
  bowknow analyzer with the judge re-pointed to this prereg's
  bars (gate-on-both-legs, partition noSource formula,
  scalemetric cost pair) plus the departSee aggregation and
  `--selftest` covering the new bars. Per-seed JSONs under
  `evidence/2026-11-19/perseed-bowsee-a-{ctl,arm}/`.
  **§15 panel:** `scripts/build-bowsee-panels-a.js` (cloned
  from the bowknow builder, re-pointed at the bowsee corpora)
  + `node scripts/balance-panel.js compare`; the compare `.md`
  is attached to the evidence file. The panel is the
  instrument, the frozen bars above are the judge.
- **PILOT ONLY.** No 12–16 seed confirm in this run; the
  coordinator decides the confirm from the pilot verdict.

## Encounter-gear fixture (Steve 2026-11-13)

The verdict turns on whether a departing spear-holder is SERVED,
so the fixture is the departure itself, staged by the competent
policy: a geared scholar fighting with a party, never a fresh
un-geared solo scholar. The proof test
(`scripts/test-bowsee-a.js`, GREEN before the pilot) runs on a
LIVE loaded village with real roster/gear — a geared fighter
holding a hunting spear in the ranged slot with a party-mate who
carries an equipped bow, plus a win-plan party naming them both
— and proves: (a) DEPARTSEE off = the spear-holder's lv[bow]
stays 0 and no craft fires (old behavior — the departure never
seeds); (b) DEPARTSEE on = the same spear-holder gains lv[bow]
= 1 at the craft attempt and, with materials and a succeeding
roll, crafts and stages a bow (the new seeing rule); (c) a
party-mate with NO bow (spear / empty ranged slot) seeds nothing
even with the flag on; (d) with the flag on and a mate bow
visible but NO materials, lv[bow] becomes 1 yet the staging
records noSource — the seeded-but-no-materials split the pilot
must be able to see; (e) with the flag on, a mate bow, materials,
and a failing roll, the staging records craftedFail with lv[bow]
= 1 — the seeded-but-failed-roll split; (f) flag unset = old
behavior byte-identical (the (a) control IS the byte-identity
proof for the flag); (g) draw-neutrality: a DEPARTSEE-on call
with no materials consumes ZERO Math.random draws, and with
materials exactly one (the craft roll itself). The existing
landed proofs (`test-spearstage-a.js`, `test-speargate-a.js`,
`test-bowcraft-a.js`, `test-bowknow-a.js`) are re-run on this base
before the pilot to confirm the landed pieces still pass. The
pilot's per-seed corpora carry the encounter averages (party
size, gear, abilities, ranged-at-entry) beside the verdict in the
evidence file.

## Pre-pilot substrate checklist (§14b)

1. **Contact:** launched wave-4 meetings occur on the substrate
   — bowknow band: 108 spear-holder departures, 21 pair-inclusive
   engaged meetings per 8 seeds. The spearSeen floor (≥ 10) is
   sized to that known density.
2. **Pool sizing:** the served bar (≥ 3 staged) is sized against
   the bowcraft confirm (15 home bows / 8 seeds) and the bowknow
   pool (108 spear departures): if departure-site seeing seeds
   even a thirtieth of the spear-holders who depart with a
   bow-carrying mate, the bar clears; if no spear-holder ever
   departs with a bow-carrying mate, the bar fails loudly and
   honestly — and the instrument says which it was.
3. **Mechanism pre-check (frozen, not a sim):** the proof test
   (`scripts/test-bowsee-a.js`, GREEN before the pilot) proves
   the seeing rule on a live village (see the fixture section
   above). The analyzer `--selftest` covers the new judge shapes
   (GO / NO-GO served-zero / NO-GO volley-flat / partition-formula
   / thin-pool / seeded-split aggregation).

## Metric review (to be written after the pilot — frozen bars judge as written)

- Finding #2590: claimed by this arm; on GO the serve half is
  confirmed — departure-site seeing puts bow knowledge into
  spear-holders' hands and the gate serves them. On NO-GO the
  finding stays open with the failing bar named, and the next
  lever is named (the seeded split in the instrument tells the
  next arm whether to attack mate-bow availability, materials,
  or the 35% roll).
- The partition noSource formula used here is the bowknow form
  (both legs gate-on); if it misfires on the judged corpus, the
  metric review says so and the analyzer's selftest is corrected
  before any re-run.
- RNG divergence: if the arm leg's departure counts drift from
  ctl (the bowknow +9 pattern), the review names the drift
  seeds and whether any bar turned on it — the verdict does not
  get re-scored, but the next arm needs the drift sized.
