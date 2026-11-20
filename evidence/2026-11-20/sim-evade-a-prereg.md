# sim-evade-a — PREREG (frozen BEFORE any judged sim)

**Arm:** sim-evade-a · **Loop A run:** fleshout-20261120T1315Z
**Type:** BUILD + MEASURE (pilot) — finding #2590's serve half, the
evade wall: DEPMAT serves 5 attributable bows but 0 served-bow
volleys, because every served spear-holder who leads a wave-4+
meeting EVADES. Scale-onramp axis.
**Frozen:** 2026-11-20 ~14:16 UTC, before any judged sim.
**Branch:** `sim-evade-a` (worktree
`~/workspace/worktrees/sim-evade-a`). **Base:** master 57b085a44
(rebased from 407168f1d; the rebase was a clean fast-forward, 5
commits, zero overlap — verified, not assumed).
**Builds on:** `evidence/2026-11-20/sim-depmat-a.md` + prereg
(NO-GO: DEPMAT serves 5 attributable, 0 served-bow volleys, 5/5
evades; the lever fires day 2 and cascades the villages apart),
`evidence/2026-11-19/sim-bowsee-a.md` (NO-GO: knowledge seeding
non-binding, materials wall), `evidence/2026-11-19/sim-bowknow-a.md`
(NO-GO: mentoring serves 0), `evidence/2026-11-19/sim-speargate-a.md`
(gate fix landed).

## §0. The diag (frozen, measured before freezing — not a sim)

The diag was run BEFORE this prereg froze, on the depmat corpora
plus a 2-seed unjudged probe (seeds 107057/107058, DEPMAT=1,
EVADEOBS/DEPMATSCOPE unset, evade driver probe mode — its corpora
are `evidence/2026-11-20/perseed-evade-a-probe/`, never judged).
The probe reproduces the depmat arm leg EXACTLY on both seeds
(depmatRows byte-equal, deaths equal, standing/maxWave/days/bowOpen
equal, v4gates equal, 0 v4encounter rows differing beyond the new
recorder fields) — the DEPMAT recovery is faithful, proven by
reproduction, not asserted. The diag names the wall in three parts:

**1. The gate says nothing for 3 of the 5 served meetings, and the
trick hold withholds seek for the other 2.** From the depmat arm
corpora (gate rows) + the probe's `trickHoldFired` ground truth
(winPlanStats.trickHolds delta across the gate call):

| Served meeting | needWave | planTarget | isTarget | trickKnown | Gate result | Trick hold fired? |
|---|---|---|---|---|---|---|
| gen_w13jb2y d52 influencer | null | null | NO | false | null | NO |
| yara_haddad d144 audit | null | influencer | NO | false | null | NO |
| yara_haddad d148 rerun | null | influencer | NO | false | null | NO |
| gen_y4t6xan d68 eulogy | 4 | null | YES | false | null | YES |
| gen_y4t6xan d70 audit | 4 | null | YES | false | null | YES |

isTarget is false for the first three because the village had no
standing wave need (needWave null) and the plan targeted nothing /
a different species — those meetings are incidental: the party was
ranging, not hunting that beast. The trick hold fires for the last
two (needWave 4 + full armed/armored party of 3 + trick unknown).
The trick hold fires band-wide, not just here: trickHolds 36 ctl /
21 arm across the depmat band, seekContacts 21 / 16.

**2. The awareness check then decides, at evade probability
0.48–0.76 — and 5/5 evades is ordinary, not a served curse.**
Probe-measured inputs per served meeting (evadeP replicates the
fieldFights.js formula WITHOUT the godpath fieldEvade term, so it
reads as a floor — beast_calm is held on 3 of the 5):

| Meeting | tracking | abilities | evadeP (floor) | Outcome |
|---|---|---|---|---|
| gen_w13jb2y d52 influencer | 101 | game_sense, tracker, beast_calm | 0.71 | evade |
| yara_haddad d144 audit | 7 | game_sense, tracker, beast_calm | 0.48 | evade |
| yara_haddad d148 rerun | 23 | game_sense, tracker, beast_calm | 0.61 | evade |
| gen_y4t6xan d68 eulogy | 150 | game_sense, tracker | 0.75 | evade |
| gen_y4t6xan d70 audit | 173 | game_sense, tracker | 0.76 | evade |

Tracking XP is past the +0.30 cap for three of the five (101/150/
173); every served lead holds game_sense (+0.10) and tracker
(+0.05). P(all 5 evade at those probabilities) ≈ 0.12. The
population rate agrees: among gate-null expedition meetings the
evade rate is 68.7% ctl / 72.3% arm (46/67, 34/47) — the served
leads evade at the population rate for their meeting kind. There
is no served-specific curse to fix; there is a base rate to
survive or bypass.

**3. The evade teaches nothing — the closed loop.** The probe
records `obsBefore` = `obsAfter` = 0 on ALL FIVE served meetings:
an awareness-evade records no trick observation. Code-read,
certain: `rec.outcome = 'evade'` is set ONLY at
fieldFights.js:930, inside the awareness early-return, which
exits before the settlement block at ~2967 that calls
`noteVillagerTrickObservation` for vFlee/mFlee/evade survivals —
so the settlement's 'evade' case is unreachable, and the ONLY
villager-side caller of the observation function never sees an
evade. `finishFieldEscape` (godpath.js) records no observation
either. Corpus-confirmed: one villager evaded the same species
three times (owen_smith vs algorithm, ctl) with trickAfter false
every time. The two promises in the code are both broken by this:
`noteVillagerTrickObservation` promises an evade ("saw it in
time") brings home an observation, and the trick hold's own
comment promises "surviving it teaches the trick after two
observations, so the seek opens on its own." Neither can happen
through an evade today. The loop is closed: no trick → no seek →
evade → no observation → still no trick → no seek → evade…

**Secondary wall (named, not the lever): ammo.** 2 of the 5
served meetings had ammo 0 at entry (gen_y4t6xan both) — even on
contact those volley 0 shots. The pocket-ammo craft (arrow: stick
2 + stone 1 + fiber 1, one batch of 5 per departure at the blind
35%) needs pile materials the village may not hold. If the volley
bar misses on ammo after evade is fixed, that is the next arm.

**The 35% roll is NOT the binding wall for the volley bar** (the
roll eats 10/15 site-supplied spear picks, but serving already
passed its bar at 5 — the volley bar fails on evade, not on
serving). Candidate (c) is not built. Knowledge seeding is proven
non-binding and is NOT re-tested.

## The lever (frozen, not a sim)

**EVADEOBS=1 (the evade-wall fix, candidate (b)):** in
`fieldFight` (src/js/fieldFights.js), inside the awareness
early-return — the `if (RR() < evade)` branch that sets
`rec.outcome = 'evade'` — before returning, call
`this.noteVillagerTrickObservation(vid, mdef.id)` for villagers
only (`vid !== 'player'`, mirroring the settlement guard; the
scholar has his own observation channel). Gated by env
`EVADEOBS=1`, default OFF. One observation per awareness-evade,
exactly as a vFlee/mFlee survival records today; the 2-observation
bar, the trick learning, the say line, and the telemetry are the
existing `_trickObservation` mechanics, untouched. The evade
still evades (outcome 'evade', rounds 0) — the fix records the
observation, it does not force contact. No new system, no new
rule: the code's own comments already promise this behavior, and
the settlement already lists 'evade' as an observing outcome.
Draw note: `_trickObservation` draws no RNG itself (telemetry +
fixed-string say + journal note); the proof test counts draws
around the evade path and documents any draw the say/telemetry
path consumes.

**DEPMATSCOPE=1 (the substrate scoping, candidate (a)):** the
recovered DEPMAT trailhead bundle fires only for spear-holders
(the departure's ranged slot holds a non-ammo weapon — the same
spearSeen read the gate uses). Gated by env `DEPMATSCOPE=1`,
default OFF (unscoped DEPMAT is the faithful recovery, proven
43/43 + probe reproduction). This is substrate hygiene the depmat
metric review prescribes as the precondition for judging anything
on this finding — the bundle fired on 28 non-spear villagers
from day 2 and widened the cascade footprint from 15 picks to
43. It is NOT the wall fix: scoping alone cannot move the volley
bar except by volume. The arm judges the bundle (scoped serve +
evade-observation) with each part separately instrumented, and
this deviation from "ONE lever" is stated here, not hidden: (a)
alone dodges the assigned wall, (b) alone re-runs a comparison
the lineage already proved broken.

**Recovery (done, unjudged):** DEPMAT re-implemented from the
depmat prereg + proof test (trailhead bundle, crude_bow only,
site-supplies branch/vine shortfall, `weapon_craft_site`
telemetry, `depmatSite`/`siteMats` on the return, witnessed line
when the scholar is at home via `playerAtHaven()`). Proof test
`scripts/test-depmat-a.js` **43/43 GREEN** on the recovered code.
The recovery is UNSCOPED (DEPMATSCOPE unset = depmat behavior);
scoping is the separate flag above.

**Canon:** `docs/CANON.md` read (manifest). No canon doc covers
launch gear-up, the ranged-slot rules, or weapon-craft knowledge
seeding — said here rather than inventing canon. The fix respects
"If you don't know, it doesn't show": an evade still teaches
only the trick of the beast actually met, only after two survived
encounters, and the trick is the village's shared knowledge, not
a conjured weapon. Bow-craft stays earthly knowledge; the trick
is learned by living through the meeting, the same fiction as
the existing non-lethal observation channel (Steve 2026-10-13).

## The question

Depmat (band 107051–107058, gate ON, DEPMAT unscoped): 5
attributable bows served, 0 served-bow volleys, 5/5 evades, the
legs diverged −30% / −74%. **Does letting an awareness-evade
record a trick observation — on a spear-holder-only trailhead
bundle — open the seek gate and put served bows into engaged
wave-4+ fights as volleys?**

## Primary metric (BINDING, §14)

Wave-4+ engaged meetings + staging departures, from the live
corpora (never snapshots). Legs differ by env ONLY: ctl =
SPEARGATE=1, DEPMAT/EVADEOBS/DEPMATSCOPE unset; arm =
SPEARGATE=1 + DEPMAT=1 + EVADEOBS=1 + DEPMATSCOPE=1. BOWKNOW
and DEPARTSEE are UNSET on both legs.

- **(1) Pool floor:** arm `spearSeen` ≥ 10.
- **(2) Gate replication (both legs):** `spearPassed / spearSeen
  == 1.0` on ctl AND arm.
- **(3) ATTRIBUTABLE-SERVED ≥ 3 — BINDS.** Counted straight from
  the recorder: depmat rows with `spearHolder` true AND
  `depmatSite` true AND `source === 'crafted'`, on the arm leg
  (DEPMATSCOPE on: every site row must be a spear row — the
  analyzer asserts 0 non-spear site rows beside the count).
- **(4) Served-bow volley join ≥ 1 — BINDS.** Wave-4+ pair-
  inclusive engaged meetings where the fighter's vid is in the
  served set (a depmatSite-crafted spear row on an earlier-or-
  same day) AND the meeting's `rangedId` is `bow` or
  `crude_bow` AND `volley.shots > 0`.
- **(5) Consistency — DRIFT-TOLERANT, rate-based — BINDS.**
  Total departures arm vs ctl: `|arm.total − ctl.total| /
  ctl.total ≤ 0.05` AND `spearSeen` arm within ±10% of ctl
  (the depmat rate form; the partition formula stays retired).
- **(6) Guardrail — deaths per engaged meeting — BINDS.**
  `arm.deathsPerEngaged ≤ ctl.deathsPerEngaged` (pair-inclusive
  engaged meetings; exposure-normalized). Totals reported beside
  the ratio (depmat metric review: the ratio reads a thinning
  denominator).
- **(7) EVADEOBS fires — BINDS (mechanism bar).** Arm-leg
  wave-4+ evade meetings with `evade.obsAfter > evade.obsBefore`
  ≥ 1 — the fix is live in the sim, not just the proof test. A
  volley miss with this bar passing is a NO-GO with the mechanism
  proven (the next arm inherits a working observation channel);
  a miss on this bar means the fix never fired in live play.
- **Control identity / replication:** ctl `depmatOn == false`
  AND ctl `evadeobsOn == false` AND ctl staging reproduces the
  depmat ctl corpus on this band (spearSeen 108, spearPassed 108,
  alreadyHad 195, noSource 255, staged 0, craftedFail 8,
  departures 458, volley 7/21 pair, starvation 3, median 150d,
  deaths 854, wave 4 8/8, wave 5 4/8) — reported per seed, any
  divergence recorded, never hidden, never re-judged.
- **Instrument errors 0** on all per-seed files.

**GO threshold:** pool floor met AND gate replication holds on
both legs AND attributable-served ≥ 3 AND served-bow volley join
≥ 1 AND consistency holds AND guardrail holds AND the EVADEOBS
mechanism bar holds.
**A miss on any bar is NO-GO, never re-scored.**

## Secondary metrics (supporting, not binding)

- **The evade-wall attribution, per leg:** gate-null expedition
  evade rate; evadeP calibration (observed evade rate vs mean
  recorded evadeP in bins — evadeP is a floor, the godpath term
  unmeasured); trickHoldFired counts; trick-known species per
  seed at run end (villageCounterObs ≥ 2 + villagerTricks); seek
  rate (seekContacts, standingContacts); engaged wave-4+
  meetings; served-lead meetings split by gate result (seek /
  null-trick-hold / null-isTarget-false / avoid) and outcome.
- **The serve split (scoping attribution):** site rows by spear
  vs non-spear per leg (arm must be spear-only); site-supplied
  split by outcome (crafted / craftedFail); knowing-noSource
  spear-holders; pile-vine-empty rate at spear departures.
- **The ammo wall:** served-bow meetings with ammoAtEntry 0
  (volley impossible even on contact), split by outcome.
- **Volley-capable share at wave-4+ meeting entry per leg; spear
  share at the fight per leg. Staging by source per leg. Mean
  volley damage, ranged-at-entry share, trio+ population beside
  the primary, never substituted. Kill share, damage/round,
  community loss, starvation (totals + villager-only), median
  survival — reported as diagnostics, NOT binding here; only the
  deaths-per-engaged guardrail binds as cost. Wall numbers every
  run: national / table / wins, wave-4 and wave-5 unlocks, median
  survival, per leg. Table not instrumented by this driver —
  reported as null, never faked.

## Horizon, seeds, policies

- **Horizon:** 150d, death-aware (same as bowopen/speargate/
  bowcraft/spearstage/bowknow/bowsee/depmat bands, for
  comparability). Dead villages stop simulating (+10d tail max).
- **Seeds (REUSED 8-seed pilot band, deliberate paired
  before/after — NOT a fresh designation): 107051, 107052,
  107053, 107054, 107055, 107056, 107057, 107058.** Freshness
  check (skill local_seed_band_freshness), run 2026-11-20
  ~14:10 UTC, before this prereg was frozen:
  `grep -rn "107051" evidence/*/sim-*-prereg.md` returns six
  files — `sim-bowknow-a-prereg.md` (this band's first use),
  `sim-searsupply-a-prereg.md` (sibling arm, finding #2599,
  HALTED mid-pilot, no verdict, no shared state), `sim-bowsee-a-
  prereg.md`, `sim-depmat-a-prereg.md` (the prior arm on this
  finding; its ctl corpus is the replication target),
  `sim-cellgate-a-prereg.md` (sibling arm, same Loop A 1315Z
  run — a DIFFERENT lever, wave-gated searcaster volley, finding
  #2599-adjacent; no shared state with this driver, no shared
  flags, no shared corpora), and `sim-gunrate-a-prereg.md`
  (sibling arm, same run, different lever — gunrate; no shared
  state). `grep -c "10705[1-8]"` over goal
  `hidden_files/sim-findings.md` — **3** (references, not
  designations); over goal `hidden_files/convergence-tracker.md`
  — **6** (references, not designations); `grep -rl "10705[1-8]"`
  over goal `hidden_files/lever-claims/` — **no file** (the live
  claim `fleshout-20261120T1315Z.json` names this run's arms
  `sim-presence-a` + `sim-evade-a` but lists no seeds). No OTHER
  live claim names this band. Reuse is deliberate: the depmat ctl
  corpus on identical seeds is the paired before, this arm's ctl
  leg (DEPMAT/EVADEOBS/DEPMATSCOPE unset, same substrate) must
  reproduce it, and the arm leg differs by exactly the frozen
  flags — the cleanest before/after this finding can get.
- **Policies:** competent verbatim. **Substrate both legs:**
  `VETREENGAGE=1 + PARTYSIZE4=1 + FLEEREPAIR2=1 + FIGHTALLY2=1`,
  `SENSEEXPED=1`, `BOWOPEN=1`, `SPEARGATE=1` (the gate ON).
  BOWCRAFT is always-on in code on both legs (live ground, not
  a flag). BOWKNOW and DEPARTSEE are UNSET on both legs
  (default-off arms from other runs, not landed — neither
  knowledge path may leak into this measurement). **Ctl = same
  code, all three flags unset; arm = same code, DEPMAT=1 +
  EVADEOBS=1 + DEPMATSCOPE=1.** The legs differ ONLY by env — no
  code change between legs. The driver asserts the flags match
  the MODE label and each corpus file records `depmatOn` +
  `depmatPresent` + `evadeobsOn` + `evadeobsPresent` +
  `depmatscopeOn` + `depmatscopePresent` + `speargateOn` +
  `speargatePresent` + `bowopenOn` + `bowopenPresent` +
  `bowknowOn` + `wiringSha` + `gameSha`.
- **Instrument:** `scripts/evade-driver-a.js` (clone of
  `scripts/depmat-driver-a.js`, RUN=evade-a,
  OUTDIR=perseed-evade-a-{ctl,arm,probe} — env-parametrized;
  the fieldFight wrap is EXTENDED with the evade-input recorder
  — tracking/bravery/temper/potential/abilities/monster
  profile/night/recomputed evadeP/awareness flag/obs
  before-after per wave-4+ meeting — and the gate wrap records
  the trickHolds delta as `trickHoldFired`); analyzer
  `scripts/analyze-evade-a.js` — cloned from the depmat analyzer
  with the judge re-pointed to this prereg's bars (attributable-
  served, served-bow volley join, rate-based consistency,
  deaths-per-engaged guardrail, EVADEOBS mechanism bar) plus the
  evade attribution (gate-null evade rate, evadeP calibration,
  trick-hold counts, trick-known species, seek rate, served-lead
  gate/outcome split, ammo-0 split, site spear/non-spear split)
  and `--selftest` covering the new bars. Per-seed JSONs under
  `evidence/2026-11-20/perseed-evade-a-{ctl,arm}/`.
  **§15 panel:** `scripts/build-evade-panels-a.js` (cloned from
  the depmat builder, re-pointed at the evade corpora)
  + `node scripts/balance-panel.js compare`; the compare `.md`
  is attached to the evidence file. The panel is the
  instrument, the frozen bars above are the judge.
- **PILOT ONLY.** No 12–16 seed confirm in this run; the
  coordinator decides the confirm from the pilot verdict.

## Encounter-gear fixture (Steve 2026-11-13)

The verdict turns on whether a served lead ENGAGES a wave-4+
meeting and fires a volley, so the fixture is the meeting
itself, staged by the competent policy: a geared fighter with
the party a player actually has at that point, never a fresh
un-geared solo fighter. The proof test
(`scripts/test-evade-a.js`, GREEN before the pilot) runs on a
LIVE loaded village with real roster/gear — a geared fighter
holding a hunting spear in the ranged slot, knowing crude_bow
(lv 1), an empty pile, a wave-4 trick-bearing monster — and
proves: (a) EVADEOBS off = two awareness-evades of the same
species record 0 observations and the trick stays unknown (old
behavior — the bug, reproduced, and the flag-off control IS the
byte-identity proof); (b) EVADEOBS on = the first evade records
obs 1, the second records obs 2 and the trick is learned
(villageKnowsTrick true, counter_observed telemetry ×2,
counter_discovered ×1), while the evade still evades (outcome
'evade', rounds 0 — the fix records, it does not force contact);
(c) a vFlee survival still records exactly 1 observation (no
double-count — the settlement path is untouched); (d) the
scholar's evades take no villager observation (vid 'player'
excluded); (e) DEPMATSCOPE on = a non-spear villager with the
flag on gathers nothing at the site (noSource, no site
telemetry), and with the scope off the same villager is served
(the unscoped recovery, unchanged); (f) the evade path draws no
extra RNG itself beyond what the observation's own say/telemetry
consumes — counted and documented, not assumed. The existing
landed proofs (`test-spearstage-a.js`, `test-speargate-a.js`,
`test-bowcraft-a.js`, `test-bowknow-a.js`, `test-depmat-a.js`)
are re-run on this base before the pilot to confirm the landed
pieces still pass. The pilot's per-seed corpora carry the
encounter averages (party size, gear, abilities, ranged-at-entry)
beside the verdict in the evidence file.

## Pre-pilot substrate checklist (§14b)

1. **Contact:** launched wave-4 meetings occur on the substrate
   — depmat band: 108 spear-holder departures, 21 pair-inclusive
   engaged meetings per 8 seeds ctl, 16 arm. The spearSeen floor
   (≥ 10) is sized to that known density.
2. **Pool sizing:** the attributable-served bar (≥ 3) is sized
   against the depmat pilot (5 served on the unscoped bundle;
   scoping removes only the 28 non-spear picks, the 15 spear
   picks stand). The volley bar (≥ 1) is sized against the
   evadeP floor (0.48–0.76 per served meeting) plus the trick
   chain: the first evade of a species records obs 1, the second
   opens the trick and the seek — the pilot judges whether that
   chain completes on this band.
3. **Mechanism pre-check (frozen, not a sim):** the proof test
   (`scripts/test-evade-a.js`, GREEN before the pilot) proves the
   evade-observation rule on a live village (see the fixture
   section above). The analyzer `--selftest` covers the new judge
   shapes (GO / NO-GO volley-join-zero / NO-GO mechanism-zero /
   rate-consistency / guardrail / evade attribution).

## Metric review (to be written after the pilot — frozen bars judge as written)

- Finding #2590: claimed by this arm; on GO the serve half is
  confirmed — departure-site materials put bows into
  spear-holders' hands AND the served bows fire volleys. On
  NO-GO the finding stays open with the failing bar named, and
  the next lever is named (the evade attribution in the
  instrument tells the next arm whether to attack the
  isTarget-false meetings, the ammo wall, or the 35% roll).
- The paired before/after design is fragile for day-2 levers
  (depmat metric review): if the rate-based consistency bar
  misfires on the judged corpus, the metric review says so — the
  verdict does not get re-scored — and names whether scoping
  sufficed or the next arm must judge within-run.
- RNG divergence: if the arm leg's departure counts drift from
  ctl, the review names the drift seeds and whether any bar
  turned on it — the verdict does not get re-scored, but the
  next arm needs the drift sized.
- evadeP is a floor, not the true probability: the godpath
  fieldEvade term (detection modifiers) is unmeasured in the
  recorder. The review must not re-litigate a calibration gap
  between recorded evadeP and observed evade rate as a mechanism
  failure — the direction (observed above the floor) is the
  expected sign.
- Draw-neutrality is a property of the mechanism, not of the
  corpora: a learned trick opens seek where today the gate
  returns null, so the streams diverge by design once the fix
  fires. The review must not re-litigate this as a mechanism
  failure.
