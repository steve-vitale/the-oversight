# sim-depmat-a — PREREG (frozen BEFORE any judged sim)

**Arm:** sim-depmat-a · **Loop A run:** fleshout-20261120T0315Z
**Type:** BUILD + MEASURE (pilot) — finding #2590's OPEN serve half
(departure-site materials: the trailhead bundle — the craft attempt
may gather the missing green materials at the departure site),
scale-onramp axis.
**Frozen:** 2026-11-20 ~03:55 UTC, before any judged sim.
**Branch:** `sim-depmat-a` (worktree
`~/workspace/worktrees/sim-depmat-a`). **Base:** master 59711ccc5
(the bowsee arm's committed tree: game.js byte-identical to the
bowsee base for the staging path; DEPARTSEE reverted, SPEARGATE
landed).
**Builds on:** `evidence/2026-11-19/sim-bowsee-a.md` + prereg
(NO-GO: DEPARTSEE seeds 17 departures, 5 spear-holders, all 5
seeded spear-holders land in noSource; SERVED 2 < 3, only 1
attributable; volley bar passes on drift sling volleys, not served
bows; partition formula proven false twice),
`evidence/2026-11-19/sim-bowknow-a.md` (NO-GO: mentoring serves 0),
`evidence/2026-11-19/sim-speargate-a.md` (gate fix landed).

## §0. The design call (frozen, not a sim)

The bowsee verdict named this lever exactly: on the control leg
**55 spear-holder departures already knew the bow (lv[bow] ≥ 1
at the attempt) and all 55 went without — noSource, every one.**
Knowledge seeding of any kind is proven non-binding and is NOT
re-tested as the serve path here. The wall is MATERIALS at the
moment of leaving.

The code was read in full before designing (`src/js/game.js`
`villagerStageBow` ~7813–8020; `src/js/villager-build.js`
`villagerWeaponCraftDay` ~1302–1530; `src/js/storage.js`
stash inflow ~1335–1370; recipes `src/data/recipes.json`):

- The departure craft (step 3) picks the first rung the crafter
  knows (LADDER `['bow', 'crude_bow']`) whose materials are covered
  by own pack + communal pile. `crude_bow` needs branch 1 + vine 1;
  `bow` needs wood 1 + vine 2.
- The pile receives materials only from the open-village inflow
  (6% per batch, 1–3 units, rolled branch 35% / wood 20% / bark
  30% / vine 10% / hide 5%) — vine is the rarest inflow by
  construction, and armor crafts compete for the same pile.
- A pile reservation was considered and REJECTED as the mechanism:
  there is nothing to reserve. The unjudged diagnostic probe below
  shows the pile holds vine 0 on 32 of 34 spear departures on seed
  107051 — reservation would serve ~0. The deficit is SUPPLY at
  the moment of leaving, not contention.
- The 35% blind roll stays as-is. The roll is not the measured
  wall (craftedFail is 8 on the whole ctl band vs 255 noSource);
  if the roll dominates after materials are supplied, that is the
  next arm, named by this run's seeded/site split.

**Chosen mechanism — DEPMAT=1 (the trailhead bundle):** in
`villagerStageBow`, step 3, inside the craft-pick loop, for the
`crude_bow` rung ONLY — when the crafter knows crude_bow
(lv[crude_bow] ≥ 1) but own pack + pile fall short on branch
and/or vine, the shortfall (at most 1 branch + 1 vine — exactly
the recipe's need) is gathered from the brush at the departure
site itself and the pick proceeds. The site materials are never
deducted from the pile (they were never in it); they are consumed
by the attempt exactly like pile materials — a failed roll loses
them, the same honesty as the player path ("the woods keep
them"). The 35% / 85% roll is untouched. A `weapon_craft_site`
telemetry event fires (`{vid, item: 'crude_bow', mats: [...]}`),
the return object carries `depmatSite: true`, and — when the
scholar is at home to witness it — one spoken line names the
gathering. Crude_bow only, by fiction: a green branch and a vine
cord grow at the village edge; a seasoned wood stave for a real
bow does not. One flag, one rule addition, no new system.
Default OFF in live play (env `DEPMAT=1`); the turn-on decision
is the coordinator's, NOT this arm's. Rationale, in plain words:
standing at the trailhead about to leave, you can snap a green
branch and twist a vine cord from the brush right there — the
materials for a crude bow are at the departure site, not deep in
the woods. This is the NPC analogue of the player's `gatherFallen`
(deadfall: branch + bark, no tool, always available).

**Draw-neutral by construction:** the site-supply block performs
no `Math.random` / `R()` draw on either leg — it reads pile + own
counts and writes two fields. Verified by grep over the diff
before the pilot and by counting draws in the proof test. Note
the bowsee lesson, carried forward honestly: a site-supplied pick
FIRES the craft roll (1 draw) where today 0 draws fire, so the
legs' RNG streams can still drift and departure counts can move.
Draw-neutrality is a property of the mechanism, not a promise of
byte-identical corpora — the consistency bar below is rate-based
for exactly that reason.

**Canon:** `docs/CANON.md` read (manifest). No canon doc covers
launch gear-up, the ranged-slot rules, or weapon-craft knowledge
seeding — said here rather than inventing canon. The mechanism
respects "If you don't know, it doesn't show": nothing is
conjured from nothing — the crafter must already KNOW crude_bow,
and the materials are green growth at the departure site, the
same fiction as gatherFallen. Bow-craft is earthly knowledge,
not System magic, so a site-built crude bow stays on the
human-skill side of the line.

**Unjudged diagnostic probe (design research, NOT a judged sim):**
before freezing, a 1-seed probe (seed 107051, ctl code as-is,
`/tmp/depmat-probe.js`, corpus `/tmp/depmat-probe-107051.json`)
wrapped `villagerStageBow` and recorded pile + own branch/vine/
wood, lv[bow] / lv[crude_bow], and the staging source per
departure. It reproduces the bowsee ctl corpus for 107051
exactly (74 departures, spear 34, alreadyHad 7, craftedFail 2,
noSource 65) and sizes the deficit:

- 32 of 34 spear departures go noSource; all 32 know crude_bow
  (lv[crude_bow] = 1, lv[bow] = 0 — every one); ZERO know `bow`.
- The deficit is vine: 28 of 32 are short on vine only, 4 on
  branch + vine. Pile vine is 0 on 32/34 spear departures; pile
  branch is usually plentiful (13–54). Nobody carries vine or
  branch in their own pack.
- So on this seed the site bundle would make all 32 pickable at
  the blind 35% rate (≈11 expected crafts) — and the crude_bow-
  only rule covers the whole knowing population, because nobody
  knows `bow`. The probe does NOT judge anything: it sizes the
  mechanism before the prereg freezes. The pilot judges it.

## The question

Bowsee (band 107051–107058, gate ON, BOWCRAFT live): 108
spear-holder departures passed, 0 served on ctl, 2 staged on the
arm (1 attributable); 55 knowing spear-holders on ctl went
without for lack of materials. **Does letting the departure
craft gather the missing branch/vine for a crude bow at the
departure site put bows into spear-holders' hands at departure
— and do those served bows reach the fight as a volley?**

## Primary metric (BINDING, §14)

Wave-4+ engaged meetings + staging departures, from the live
corpora (never snapshots). Legs differ ONLY by DEPMAT; the
SPEARGATE gate is ON on BOTH legs (ctl = bowsee's ctl ground,
replication target — see below). BOWKNOW and DEPARTSEE are UNSET
on BOTH legs (knowledge seeding is proven non-binding and must
not leak into this measurement).

- **(1) Pool floor:** arm `spearSeen` ≥ 10 (bowsee band: 108).
- **(2) Gate replication (both legs):** `spearPassed / spearSeen
  == 1.0` on ctl AND arm (the gate must still take on this
  base/band with the gate on in both legs).
- **(3) ATTRIBUTABLE-SERVED ≥ 3 — BINDS.** Counted straight from
  the recorder: depmat rows with `spearHolder` true AND
  `depmatSite` true AND `source === 'crafted'` — staged bows
  the mechanism caused (site-supplied then crafted spear rows).
  Recorded beside it, NOT binding: the frozen raw staged count
  (`arm.staged − ctl.staged`, staged = fromStash + fromArmory +
  crafted), which the bowsee metric review showed can include
  RNG-divergence crafts the mechanism did not cause.
- **(4) Served-bow volley join ≥ 1 — BINDS.** Wave-4+ pair-
  inclusive engaged meetings where the fighter's vid is in the
  served set (a depmatSite-crafted spear row on an earlier-or-
  same day) AND the meeting's `rangedId` is `bow` or
  `crude_bow` AND `volley.shots > 0`. Volleys fired by served
  bows, NOT the raw volley share (the bowsee volley bar passed
  on drift sling volleys, not served bows).
- **(5) Consistency — DRIFT-TOLERANT, rate-based — BINDS.**
  Total departures arm vs ctl: `|arm.total − ctl.total| /
  ctl.total ≤ 0.05` AND `spearSeen` arm within ±10% of ctl.
  The bowsee partition formula is RETIRED, not reused: it
  assumes equal totals and equal craftedFail (proven false
  twice), and — decisively — the mechanism is EXPECTED to move
  noSource down (that IS the serve), so a noSource consistency
  bar would bind against success. The rate form prices in the
  drift and judges only whether the legs still stage the same
  population.
- **(6) Guardrail — deaths per engaged meeting — BINDS.**
  `arm.deathsPerEngaged ≤ ctl.deathsPerEngaged` (pair-inclusive
  engaged meetings; exposure-normalized). The mechanism must
  not buy bows with lives.
- **Control identity / replication:** ctl `depmatOn == false`
  AND ctl staging reproduces the bowsee ctl corpus on this band
  (spearSeen 108, spearPassed 108, alreadyHad 195, noSource 255,
  staged 0, craftedFail 8, volley 7/21 pair) — reported per seed,
  any divergence recorded, never hidden, never re-judged (this
  run judges depmat, not bowsee).
- **Instrument errors 0** on all per-seed files.

**GO threshold:** pool floor met AND gate replication holds on
both legs AND attributable-served ≥ 3 AND served-bow volley join
≥ 1 AND consistency holds AND guardrail holds.
**A miss on any bar is NO-GO, never re-scored.** In particular:
site-supplied-but-served-0 is a NO-GO on the served bar — it
would mean departure-site materials do not reach spear-holders
in live play, and the evidence must say so, with the site split
showing whether it was no knowledge, a failed roll, or a
still-short rung.

## Secondary metrics (supporting, not binding)

- **The wall population, measured:** per leg, spear rows with
  (lv[bow] ≥ 1 or lv[crude_bow] ≥ 1) at the attempt and source
  noSource — the knowing-but-empty-handed; split by rung known
  and by missing material (from the pile + own snapshot: vine /
  branch / wood shortfall per rung). The site-supplied split:
  site-supplied rows by outcome (crafted / craftedFail /
  noSource — a site row can still land noSource only if the pick
  loop takes another path; recorded, not assumed).
- **lv[crude_bow] beside lv[bow] (the bowsee metric-review fix):**
  per departure, `lvCrudeBefore` / `lvCrudeAfter` recorded
  beside `lvBowBefore` / `lvBowAfter` — lv[bow]-only recording
  misleads on crude_bow attempts.
- **Pile snapshot per departure:** pile branch/vine/wood and own
  carried branch/vine/wood at the craft attempt, so the deficit
  profile (which material, how often the pile is empty) is in
  the corpora, not re-derived.
- **Volley-capable share at wave-4+ meeting entry per leg; spear
  share at the fight per leg. Staging by source per leg. Mean
  volley damage, ranged-at-entry share, trio+ population beside
  the primary, never substituted. Kill share, damage/round,
  community loss, starvation (totals + villager-only), median
  survival — reported as diagnostics, NOT binding here; only
  the deaths-per-engaged guardrail binds as cost. Wall numbers
  every run: national / table / wins, wave-4 and wave-5 unlocks,
  median survival, per leg. Table not instrumented by this
  driver — reported as null, never faked.

## Horizon, seeds, policies

- **Horizon:** 150d, death-aware (same as bowopen/speargate/
  bowcraft/spearstage/bowknow/bowsee bands, for comparability).
  Dead villages stop simulating (+10d tail max).
- **Seeds (REUSED 8-seed pilot band, deliberate paired
  before/after — NOT a fresh designation): 107051, 107052,
  107053, 107054, 107055, 107056, 107057, 107058.** Freshness
  check (skill local_seed_band_freshness), run 2026-11-20
  ~03:50 UTC, before this prereg was frozen:
  `grep -rln "107051|...|107058" evidence/*/sim-*-prereg.md`
  returns exactly three files — `sim-bowknow-a-prereg.md` (this
  band's first use; its ctl corpus is this run's REPLICATION
  target), `sim-searsupply-a-prereg.md` (sibling arm, same Loop
  A 0215Z run, a DIFFERENT lever — contest-prize searcaster
  supply, finding #2599 — HALTED mid-pilot at 3/16 seeds, no
  verdict; no shared state with this driver, no shared flags,
  no shared corpora), and `sim-bowsee-a-prereg.md` (the prior
  arm on this finding; its ctl corpus is the replication target
  named above). `grep -c "10705[1-8]"` over goal
  `hidden_files/sim-findings.md` — **3** (the #2590 line citing
  the bowsee band and two #2599 lines citing the searsupply
  band — references, not designations); over goal
  `hidden_files/convergence-tracker.md` — **5** (the 0215Z and
  0515Z run entries citing the shared band — references, not
  designations); `grep -rl "10705[1-8]"` over goal
  `hidden_files/lever-claims/` — **1 file**
  (`fleshout-20261120T0315Z.json`) — this run's OWN coordinator
  claim, which names both arms (`sim-gunrate-a`,
  `sim-depmat-a`) and explicitly reuses band 107051–107058 for
  both as paired before/after on identical seeds. No OTHER live
  claim names this band. Reuse is deliberate: the bowsee ctl corpus
  on identical seeds is the paired before, this arm's ctl leg
  (DEPMAT unset, same substrate) must reproduce it, and the arm
  leg differs by exactly one flag — the cleanest before/after
  this finding can get.
- **Policies:** competent verbatim. **Substrate both legs:**
  `VETREENGAGE=1 + PARTYSIZE4=1 + FLEEREPAIR2=1 + FIGHTALLY2=1`,
  `SENSEEXPED=1`, `BOWOPEN=1`, `SPEARGATE=1` (the gate ON —
  this arm measures the serve half on top of the landed gate).
  BOWCRAFT is always-on in code on both legs (live ground, not
  a flag). BOWKNOW and DEPARTSEE are UNSET on both legs
  (default-off arms from other runs, not landed — neither
  knowledge path may leak into this measurement). **Ctl = same
  code, DEPMAT unset; arm = same code, DEPMAT=1.** The legs
  differ ONLY by env — no code change between legs. The driver
  asserts the flag matches the MODE label and each corpus file
  records `depmatOn` + `depmatPresent` + `speargateOn` +
  `speargatePresent` + `bowopenOn` + `bowopenPresent` +
  `bowknowOn` + `wiringSha` + `gameSha`.
- **Instrument:** `scripts/depmat-driver-a.js` (thin clone of
  `scripts/bowsee-driver-a.js`, RUN=depmat-a,
  OUTDIR=perseed-depmat-a-{ctl,arm} — env-parametrized, no fork
  of the recorder; the `departSeeRows` recorder is EXTENDED —
  `lvCrudeBefore` / `lvCrudeAfter`, pile `{branch, vine, wood}`
  + own `{branch, vine, wood}` at the attempt, `depmatSite`
  (from the staging return), and `siteMats` — so the judged
  numbers can separate "knew but no vine" from "site-supplied
  but failed roll" and the attributable count is read straight
  off the rows); analyzer `scripts/analyze-depmat-a.js` —
  cloned from the bowsee analyzer with the judge re-pointed to
  this prereg's bars (attributable-served, served-bow volley
  join, rate-based consistency, deaths-per-engaged guardrail)
  plus the depmat aggregation and `--selftest` covering the new
  bars. Per-seed JSONs under
  `evidence/2026-11-20/perseed-depmat-a-{ctl,arm}/`.
  **§15 panel:** `scripts/build-depmat-panels-a.js` (cloned
  from the bowsee builder, re-pointed at the depmat corpora)
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
(`scripts/test-depmat-a.js`, GREEN before the pilot) runs on a
LIVE loaded village with real roster/gear — a geared fighter
holding a hunting spear in the ranged slot, knowing crude_bow
(lv 1), an empty pile — and proves: (a) DEPMAT off = the
spear-holder's staging records noSource and the pile is untouched
(old behavior — the departure never gathers); (b) DEPMAT on =
the same spear-holder gathers the missing branch + vine at the
site, the craft attempt fires, and with a succeeding roll crafts
and stages a crude bow (the new trailhead-bundle rule), with
`weapon_craft_site` telemetry and `depmatSite` on the return;
(c) with the flag on and a failing roll, the staging records
craftedFail and the pile is never driven negative; (d) a
spear-holder who knows `bow` only (no crude_bow) gathers nothing
even with the flag on — the crude-only rule; (e) with the flag on
and the pile HOLDING the materials, the craft proceeds from the
pile and no site telemetry fires (the site tops up only the
shortfall); (f) flag unset = old behavior byte-identical (the
(a) control IS the byte-identity proof for the flag); (g)
draw-neutrality: a DEPMAT-on call consumes ZERO Math.random draws
itself — with a pick exactly one (the craft roll), without a pick
zero. The existing landed proofs (`test-spearstage-a.js`,
`test-speargate-a.js`, `test-bowcraft-a.js`, `test-bowknow-a.js`)
are re-run on this base before the pilot to confirm the landed
pieces still pass. The pilot's per-seed corpora carry the
encounter averages (party size, gear, abilities, ranged-at-entry)
beside the verdict in the evidence file.

## Pre-pilot substrate checklist (§14b)

1. **Contact:** launched wave-4 meetings occur on the substrate
   — bowsee band: 108 spear-holder departures, 21 pair-inclusive
   engaged meetings per 8 seeds. The spearSeen floor (≥ 10) is
   sized to that known density.
2. **Pool sizing:** the attributable-served bar (≥ 3) is sized
   against the probe: on seed 107051 alone, 32 knowing spear
   departures are site-eligible at the blind 35% rate (≈11
   expected crafts). If the site bundle fires but the roll eats
   every attempt, the bar fails loudly and honestly — and the
   instrument says which it was (site-supplied craftedFail).
3. **Mechanism pre-check (frozen, not a sim):** the proof test
   (`scripts/test-depmat-a.js`, GREEN before the pilot) proves
   the trailhead-bundle rule on a live village (see the fixture
   section above). The analyzer `--selftest` covers the new
   judge shapes (GO / NO-GO attributable-served-zero / NO-GO
   volley-join-zero / rate-consistency / guardrail /
   depmat aggregation).

## Metric review (to be written after the pilot — frozen bars judge as written)

- Finding #2590: claimed by this arm; on GO the serve half is
  confirmed — departure-site materials put bows into
  spear-holders' hands and the served bows fire volleys. On
  NO-GO the finding stays open with the failing bar named, and
  the next lever is named (the site split in the instrument
  tells the next arm whether to attack the 35% roll, the
  crude-only rule, or vine supply further upstream).
- The partition noSource formula is RETIRED by this prereg (see
  bar 5): if the rate-based consistency bar misfires on the
  judged corpus, the metric review says so — the verdict does
  not get re-scored.
- RNG divergence: if the arm leg's departure counts drift from
  ctl (the bowsee +3 / bowknow +9 pattern), the review names
  the drift seeds and whether any bar turned on it — the verdict
  does not get re-scored, but the next arm needs the drift sized.
- Draw-neutrality is a property of the mechanism, not of the
  corpora: a site-supplied pick fires the craft roll where
  today none fires, so the streams diverge by design. The
  review must not re-litigate this as a mechanism failure.
