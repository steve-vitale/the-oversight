# sim-bowknow-a — PREREG (frozen BEFORE any new sim)

**Arm:** sim-bowknow-a · **Loop A run:** fleshout-20261120T0215Z
**Type:** BUILD + MEASURE (pilot) — finding #2590's OPEN serve half
(bow-knowledge reach for spear-holders), scale-onramp axis.
**Frozen:** 2026-11-20 ~03:40 UTC, before any new sim.
**CORRECTION 2026-11-20 ~03:53 UTC (pre-sim, no sim has run):**
the chosen mechanism below is amended from pack-seeing to
MENTORING. Reason, from the code read after the first freeze:
the duty's own loop calls `eq.autoEquip(p, defs)` for every home
villager, and the bowcraft proof (test-bowcraft-a.js S3) shows a
pack bow is seated by that call and seen the NEXT duty day — so
pack-seeing accelerates seeding by at most one day and cannot
plausibly move SERVED ≥ 3. Mentoring — the brief's named
alternative ("the bowcraft duty teaches/mentors spear-holders")
— is the stronger home mechanism: knowledge, unlike a bow,
does not go away on expedition, so a knower at home can teach
spear-holders who never handled a bow. The frozen bars, seeds,
policies, horizon, and judge are UNCHANGED by this correction;
only the mechanism and its proof fixture change. The pack-seeing
reasoning is kept in the record below (struck through in prose,
not deleted) so the next reader sees why it was passed over.
**Branch:** `sim-bowknow-a` (worktree
`~/workspace/worktrees/sim-bowknow-a`). **Base:** master at the
spearstage adoption (904545499; includes speargate 416e81241,
spearstage 677d40057, BOWCRAFT live d56fbe819).
**Builds on:** `evidence/2026-11-19/sim-spearstage-a.md` + prereg
(NO-GO: gate 49/49, served 0, volley rise +0.000, 48/49 passed
spear-holders in noSource), `evidence/2026-11-19/sim-bowcraft-a.md`
+ confirm, `evidence/2026-11-19/sim-speargate-a.md`.

## §0. The design call (frozen, not a sim)

The spearstage verdict closed the gate half and opened the serve
half: a departure craft needs PERSONAL bow knowledge (lv[bow] ≥ 1)
plus materials, and spear-holders almost never have either. The
knowledge-seeding code was read in full before designing
(`src/js/villager-build.js` `villagerWeaponCraftDay` ~1300–1470;
`src/js/game.js` `villagerStageBow` ~7813–8020):

- Knowledge seeds two ways: OWN HANDS (a ladder weapon the
  villager wears, carries, or keeps in their own stash → L1) and
  BOWCRAFT SEEING (a ladder weapon EQUIPPED by another villager
  at home right now → L1 for everyone at home). A bow in a pack
  or in the stash is never seen — the code comment says so
  explicitly.
- The departure craft (`villagerStageBow` step 3) never seeds
  knowledge — it reads the shared `v.weaponCraft` record.
- The stash/armory alternative #2590 names is CLOSED by design,
  not by omission: individual ownership (Steve 2026-10-09) — no
  communal armory; the armory pile holds deposited ranged weapons
  only, and spearstage measured fromStash 0 / fromArmory 0. There
  are no bows sitting there to hand out, so stocking them would
  be a new system, not a lever. NOT built.
- Mentoring (a knower teaches a spear-holder) was considered and
  is the CHOSEN mechanism (see the correction header): it needs
  a knower at home, but knowledge — unlike a bow — does not go
  away on expedition, so the trigger is far wider than seeing.
  A knower is any home villager with lv[bow] ≥ 1; they teach
  spear-holders (armed but ranged-less) at home, one learner per
  mentor per duty day, witnessed aloud when the scholar is home.
  Teaching is a human skill transfer (Steve: skills can be taught
  villager-to-villager; bow-craft is earthly knowledge, not System
  magic) — canon-consistent. If this pilot NO-GOs, the next lever
  is departure-site seeing.
- Pack-seeing (counting pack-carried bows in the seeing snapshot)
  was the FIRST freeze and is NOT built: the duty autoEquips
  every home villager each call (test-bowcraft-a.js S3 proves a
  pack bow is seated by that call and seen the next duty day),
  so pack-seeing accelerates seeding by at most one day and
  cannot plausibly move SERVED ≥ 3. Passed over with reason,
  not silently.

**Chosen mechanism — BOWKNOW=1 (mentoring):** in
`villagerWeaponCraftDay`, after the seeing snapshot, if BOWKNOW
is on: mentors = home villagers with lv[bow] ≥ 1 in their own
`v.weaponCraft` record; learners = home villagers who are armed
but hold no volley-capable ranged weapon and have lv[bow] = 0
(the spear-holders the gate passes). Pair them in roster order,
one learner per mentor per duty day; each taught learner gains
lv[bow] = 1, recorded in their own record, with a `weapon_teach`
telemetry event and — when the scholar is at home to witness it
— one spoken line naming mentor, learner, and the bow. The stash
/communal pile stays unseen; the departure craft still never
seeds. One flag, one rule addition, no new system. Default OFF
in live play (env `BOWKNOW=1`); the turn-on decision is the
coordinator's, NOT this arm's. Rationale, in plain words: a
villager who knows how a bow is made can SHOW a spear-holder
how it is strung — the spear-holder still needs materials and
still faces the 35% blind craft roll, so knowledge opens the
door without handing them a bow.

**Canon:** `docs/CANON.md` read (manifest). No canon doc covers
launch gear-up, the ranged-slot rules, or weapon-craft knowledge
seeding — said here rather than inventing canon. The mechanism
respects the standing canon rule "If you don't know, it doesn't
show": nothing is conjured — a carried bow is SEEN, and seeing is
what already seeds knowledge; this widens what counts as seen
from equipped-only to equipped-or-carried at home.

## The question

Spearstage (band 107041–107048, gate ON, BOWCRAFT live): 49
spear-holder departures passed, 48 landed in noSource, served 0,
volley rise +0.000. **Does letting a bow-knower at home teach
spear-holders put bow knowledge into their hands, so the gate
serves them at departure — and does that reach the fight as a
volley?**

## Primary metric (BINDING, §14)

Wave-4+ engaged meetings + staging departures, from the live
corpora (never snapshots). Legs differ ONLY by BOWKNOW; the
SPEARGATE gate is ON on BOTH legs (ctl = spearstage's arm ground).

- **Pool floor:** arm `spearSeen` ≥ 10 (spearstage band: 49).
- **Gate replication (both legs):** `spearPassed / spearSeen == 1.0`
  on ctl AND arm (the gate must still take on this base/band with
  the gate on in both legs); `spearSeen` arm ≈ ctl (within ±3 —
  legs are seeded-identical, BOWKNOW must not change who departs
  with a spear).
- **alreadyHad consistency ±3:** `arm.alreadyHad ≈ ctl.alreadyHad`
  (both legs gate-on; no ±spearSeen term — that term belonged to
  the gate-off control).
- **noSource consistency — PARTITION formula (replaces the frozen
  spearstage formula per its metric review):**
  `arm.noSource ≈ ctl.noSource − (arm.staged − ctl.staged)`
  (within ±3). Every departure partitions into staged /
  craftedFail / noSource; seeded-identical non-spear departures
  cancel, so a served spear-holder leaves noSource by exactly
  one. The old formula (arm.noSource vs ctl.noSource +
  arm.spearSeen) is retired — it fails by construction when
  served ≥ 4.
- **SERVED:** `arm.staged − ctl.staged ≥ 3`, where staged =
  fromStash + fromArmory + crafted. The attributable yield of
  bow-knowledge reach: bows actually put into spear-holders'
  hands at departure.
- **Volley rate:** among wave-4+ pair-inclusive engaged meetings,
  volley-fire share arm − ctl ≥ +0.10 (spearstage band ctl 0.50).
- **Control identity:** ctl `bowknowOn == false` AND ctl staging
  matches the spearstage arm leg (staged ≈ 1, noSource ≈ 130 on
  this band's shape — reported, never hidden). Any ctl staged bow
  is reported by source.

**GO threshold:** pool floor met AND gate replication holds on
both legs AND consistency bars hold AND served ≥ 3 AND
volley-rate rise ≥ +0.10 AND all cost bars pass (below).
**A miss on any bar is NO-GO, never re-scored.** In particular:
knowledge-seeded-but-served-0 is a NO-GO on the served bar —
it would mean mentoring does not reach spear-holders in live
play, and the evidence must say so.

**Cost bars (binding guardrails):** pair-inclusive kill share
arm ≥ ctl − 0.05; mean damage/round arm ≥ 0.9 × ctl; median
survival arm ≥ 0.8 × ctl; deaths per engaged wave-4+ meeting
(exposure-normalized) arm ≤ ctl × 1.10; community loss
arm ≤ ctl + 0.125; starvation arm ≤ ctl + 2 (totals AND
villager-only). Instrument errors 0 on all per-seed files.

## Secondary metrics (supporting, not binding)

- Bow-knowledge reach: share of spear-holder departures with
  lv[bow] ≥ 1 at departure per leg (read from the corpus where
  recorded; if unrecorded, reported as uninstrumented, never
  faked) + home weapon_craft telemetry (bow crafts per leg).
- Volley-capable share at wave-4+ meeting entry per leg; spear
  share at the fight per leg. Staging by source per leg.
- Mean volley damage, ranged-at-entry share, trio+ population
  beside the primary, never substituted. Wall numbers every run:
  national / table / wins, wave-4 and wave-5 unlocks, median
  survival, per leg. Table not instrumented by this driver —
  reported as null, never faked.

## Horizon, seeds, policies

- **Horizon:** 150d, death-aware (same as bowopen/speargate/
  bowcraft/spearstage bands, for comparability). Dead villages
  stop simulating (+10d tail max).
- **Seeds (fresh 8-seed pilot band): 107051, 107052, 107053,
  107054, 107055, 107056, 107057, 107058.** Freshness check
  (skill local_seed_band_freshness): `grep -rIno "10705[0-9]"`
  over `evidence/ --include="*.md"` — **0 hits**; over
  `evidence/ --include="*prereg*.md"` for 107051–107058 —
  **0 hits**; `grep -c "10705[1-8]"` over goal
  `hidden_files/sim-findings.md` — **0**, over goal
  `hidden_files/convergence-tracker.md` — **0**, over goal
  `hidden_files/lever-claims/` — **0 files** (checked
  2026-11-20 ~03:35 UTC, before this prereg was frozen).
  The only "10705" hits anywhere are 5-digit seeds 10705 /
  10706 / 10707 in `evidence/2026-10-28/` (a different seed
  family, not this 6-digit band). Neighbouring used bands
  avoided: 107001–107008 (bowsource), 107011–107018 (bowcraft
  confirm), 107021–107028 (slingstone / arrowsupply),
  107031–107038, 107041–107048 (spearstage). Band
  107051–107058 is fresh.
- **Policies:** competent verbatim. **Substrate both legs:**
  `VETREENGAGE=1 + PARTYSIZE4=1 + FLEEREPAIR2=1 + FIGHTALLY2=1`,
  `SENSEEXPED=1`, `BOWOPEN=1`, `SPEARGATE=1` (the gate ON —
  this arm measures the serve half on top of the landed gate).
  BOWCRAFT is always-on in code on both legs (live ground, not a
  flag). **Ctl = same code, BOWKNOW unset; arm = same code,
  BOWKNOW=1.** The legs differ ONLY by env — no code change
  between legs. The driver asserts the flag matches the MODE
  label and each corpus file records `bowknowOn` +
  `bowknowPresent` + `speargateOn` + `speargatePresent` +
  `bowopenOn` + `bowopenPresent` + `wiringSha` + `gameSha`.
- **Instrument:** `scripts/bowknow-driver-a.js` (thin clone of
  `scripts/speargate-driver-a.js`, RUN=bowknow-a,
  OUTDIR=perseed-bowknow-a-{ctl,arm} — env-parametrized, no
  fork of the recorder); analyzer
  `scripts/analyze-bowknow-a.js` — cloned from the spearstage
  analyzer with the judge re-pointed to this prereg's bars
  (gate-on-both-legs, partition noSource formula), `--selftest`
  covering the new bars. Per-seed JSONs under
  `evidence/2026-11-19/perseed-bowknow-a-{ctl,arm}/`.
  **§15 panel:** `scripts/build-bowknow-panels-a.js` (cloned
  from the spearstage builder, re-pointed at the bowknow
  corpora) + `node scripts/balance-panel.js compare`; the
  compare `.md` is attached to the evidence file. The panel is
  the instrument, the frozen bars above are the judge.
- **PILOT ONLY.** No 12–16 seed confirm in this run; the
  coordinator decides the confirm from the pilot verdict.

## Encounter-gear fixture (Steve 2026-11-13)

The verdict turns on whether a departing spear-holder is SERVED,
so the fixture is the departure itself, staged by the competent
policy: a geared scholar fighting with a party, never a fresh
un-geared solo scholar. The proof test
(`scripts/test-bowknow-a.js`, GREEN before the pilot) runs on a
LIVE loaded village with real roster/gear — a geared fighter
holding a hunting spear in the ranged slot with a party, plus a
second villager at home who KNOWS the bow (lv[bow] ≥ 1 in their
own record) but holds no bow — and proves: (a)
BOWKNOW off = the spear-holder's lv[bow] stays 0 after the duty
(old behavior — knowledge is never taught); (b) BOWKNOW on = the
same spear-holder gains lv[bow] = 1 from the mentor
(the new teaching rule); (c) a bow in the village stash pile
still does NOT seed (the pile stays unseen — the boundary of
the rule); (d) an EQUIPPED bow still seeds on both legs
(the BOWCRAFT baseline, unchanged); (e) flag unset = old
behavior byte-identical (the (a) control IS the byte-identity
proof for the flag). The existing landed proofs
(`test-spearstage-a.js`, `test-speargate-a.js`,
`test-bowcraft-a.js`) are re-run on this base before the pilot
to confirm the landed pieces still pass. The pilot's per-seed
corpora carry the encounter averages (party size, gear,
abilities, ranged-at-entry) beside the verdict in the evidence
file.

## Pre-pilot substrate checklist (§14b)

1. **Contact:** launched wave-4 meetings occur on the substrate
   — spearstage band: 49 spear-holder departures, 10
   pair-inclusive engaged meetings per 8 seeds. The spearSeen
   floor (≥ 10) is sized to that known density.
2. **Pool sizing:** the served bar (≥ 3 staged) is sized
   against the bowcraft confirm (15 home bows / 8 seeds) and
   the spearstage pool (49 spear departures): if mentoring
   seeds even a tenth of the spear-holders, the bar clears; if
   no knower is ever home with a spear-holder, the bar
   fails loudly and honestly.
3. **Mechanism pre-check (frozen, not a sim):** the proof test
   (`scripts/test-bowknow-a.js`, GREEN before the pilot) proves
   the mentoring rule on a live village (see the fixture
   section above). The analyzer `--selftest` covers the new
   judge shapes (GO / NO-GO served-zero / NO-GO volley-flat /
   partition-formula / thin-pool).

## Metric review (to be written after the pilot — frozen bars judge as written)

- Finding #2590: claimed by this arm; on GO the serve half is
  confirmed — mentoring puts bow knowledge into
  spear-holders' hands and the gate serves them. On NO-GO the
  finding stays open with the failing bar named, and the next
  lever is named (departure-site seeing).
- The partition noSource formula introduced here replaces the
  spearstage frozen formula; if it misfires on the judged
  corpus, the metric review says so and the analyzer's
  selftest is corrected before any re-run.
