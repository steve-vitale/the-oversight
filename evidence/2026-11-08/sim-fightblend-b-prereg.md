# sim-fightblend-b — prereg

**Arm:** sim-fightblend-b (game-code BUILD — the NUMERATOR-AWARE shape:
judge the HP trajectory as if protection were 4, not just the incoming)
· **Run:** fleshout-loop-b-20261108T1630Z · **Axis:** scale-onramp /
winnability chain (converging, NOT converged) · **Tracker blank:** (1)
· **Findings:** #1943 · **Branch:** sim-fightblend-b, base master
`93e7bea26` at run start (post-adoption; flipsocial-b tip) · **Base for
sweeps:** this worktree, before (baseline) and after (candidate) the fix
— no detached checkouts, no archive trees.

## The question

Does judging the field-fight hopeless/flee trajectory on the HP
trajectory **as if protection were 4** — a parallel hypothetical HP that
falls by protection-4-mitigated incoming, with the morale read run on
that hypothetical HP and the P4 incoming rate — restore the C1 fight
shape? Candidate (b) (`evidence/2026-11-08/sim-fightloop-b.md`, NO-GO)
read fully raw (protection 0) and over-fled: the 53002 Kieran day-4
fight fled at 2 rounds / 82 HP instead of the C1 shape (5–7 rounds,
30–45 HP). The middle shape (`evidence/2026-11-08/sim-midshape-a.md`,
NO-GO) judged only the denominator at protection 4 and under-fled:
53002 byte-identical to baseline, never hopeless; unit leg splits by
protection. The midshape verdict: the gap between them is not a judgment
value — it is the HP trajectory itself (the fighter's live HP still
carries his worn protection, so the less-armored fighter falls into the
floor before the judgment turns hopeless and the armored one rides the
winning line to the kill). This arm is the named next arm from the
midshape evidence — the numerator-aware shape, NOT the blend variant
(partial mitigation), which is a different arm and is not substituted
here.

## The fix — exact construction

In `src/js/fieldFights.js` only, in the `fieldFight` morale path:

- Capture `vHpStart` at fight start (where `vHp` is initialized from
  the village health map, before any round). The hypothetical HP is
  `vHpHypo = vHpStart - rec.vTakenP4` — the HP the fighter *would*
  have if every blow had landed through protection 4.
- Track a parallel accumulator of **protection-4 incoming damage**,
  re-implemented from the midshape evidence description (midshape's fix
  was reverted and leaves no code): the monster-phase `total` as it
  stands after board/ability modifiers (freeze tag, hogtie, peacemaker,
  godpath `fieldIncoming`) but before armor absorption — with
  `this.armorReduction(4, pierce)` applied in place of the worn value
  (same `Math.min(total - 1, Math.round(total * r))` clamp, so at least
  1 lands), regardless of actual `varmor`/`allyArmor` (even 0).
  Computed once per monster hit, right after the `GPf.fieldIncoming`
  block, from the pre-armor `total`. `wornDamage` (shawl avoidance),
  unbreakable brace, and shield wall are NOT applied to the P4 total
  (the (b) raw read's and midshape's exclusions), and no RNG draw is
  made (re-running `wornDamage` for the parallel total would draw RNG
  and split the streams).
- Lead hits accumulate into `rec.vTakenP4`; ally hits into
  `rec.allyTakenP4` (leech share split at the mitigated ratio —
  `Math.floor(p4Total / 2)` to the leader when leech fires, the rest to
  the ally — so the party P4 total is exactly the P4 incoming). The
  current-ally P4 total resets when a new ally is called in (shout
  branch and ally-from-start setup, where `allyEntryHp` is set),
  mirroring the existing `_allyTakenLive` (current-ally-only) read.
  Initialized `vTakenP4: 0, allyTakenP4: 0` in the `rec` literal.
- The morale trajectory read uses the hypothetical HP and the P4
  totals: solo `mDprHypo = rec.vTakenP4 / round`,
  `rtd = (vHpStart - rec.vTakenP4) / Math.max(1, mDprHypo)`; party
  variant `rtd = ((vHpStart - rec.vTakenP4) + (allyEntryHp -
  rec.allyTakenP4)) / Math.max(1, (rec.vTakenP4 + rec.allyTakenP4) /
  round)`. `hopeless = rtd < rtk * 0.85` and `winning = rtk <= rtd *
  1.1` unchanged in form — only their inputs change (numerator and
  denominator together).
- Record-only: `rec.vHpHypoLeft` / `rec.allyHpHypoLeft` set at the
  close (hypothetical HP left, clamped ≥ 0), so the judgment's own
  trajectory is readable fight by fight. The driver records them (pure
  reads, see Sweeps).
- NOTHING else changes: `rec.vTaken` (actual damage taken), live HP,
  settlement (`hurtVillager`/`sealDamageResult`), narration, the floor
  flee (still reads live HP), the committed-finish hold, trick holds,
  war cry / rally, and all round caps are byte-identical in behavior.
  No RNG draws added or removed, so baseline and candidate share the
  same RNG stream until the first morale decision differs. Player
  turn-based fight paths are NOT touched — this arm is the villager
  field fight only.
- The armor curve (`armorReduction`, `src/js/game.js`): reduction =
  effP / (effP + 6), pierce 0 on the cliffhanger. The P4 judgment lands
  60% of pre-armor incoming, vs 54.5% live at protection 5 — the same
  denominator as midshape. What changes vs midshape is the numerator:
  the hypothetical HP falls by the P4 total, so the fighter's
  *trajectory* is the C1 trajectory, not only his incoming rate.

**Why this shape should restore C1 (the trajectory-identity
argument):** on the 53002 fight, the hypothetical trajectory through
round 6 is exactly C1's live trajectory. The pre-armor totals per round
are fixed by the shared RNG stream (armor is arithmetic; no draw count
depends on the protection value; no morale decision differs before
round 6 — see Prediction), and the P4 mitigation of those totals is
exactly the mitigation C1's actually-worn protection 4 applied. C1's
live HP at round 6 was 38 (P4 cumulative 62); the hypothetical HP at
round 6 is 100 − 62 = 38; mDealt, monster HP, and rtk are the same —
so the round-6 read is hopeless exactly as in C1, and the flee fires
through the hopeless branch (which precedes the floor check) at round
6. The live HP at that moment is higher (43 — see HP-left note below),
but the floor cannot pre-empt a hopeless flee: the hopeless branch
breaks first.

**HP-left treatment (stated explicitly, per the run brief):** the
fighter's BODY still wears protection 5 — only the judgment imagines
protection 4. So at the round-6 flee the actual HP left is 100 − 57 =
43, not C1's 38 (C1's body wore protection 4 and had taken 62). The
primary bars the rounds (5–7) and the hopeless label; HP left is
barred LOOSELY at 35–60 (expected point value 43) with this reasoning
written down — a candidate fleeing at round 6 with 43 HP is the C1
shape with the better armor still on the body, not a miss. HP left
below 35 or above 60 at a 5–7-round hopeless flee would still fail
the bar as written.

**Degenerate case (finding #1016):** if `vTakenP4` is 0 (no damage
taken), `mDprHypo = 0` and `rtd = vHpStart / Math.max(1, 0) =
vHpStart` — the same degenerate shape as the live code (hopeless
false). The construction neither fixes nor worsens #1016; no division
by zero is introduced (`Math.max(1, mDprHypo)` already guards it).

**Ally-tanking shape (finding #1461):** if a root fight shows the ally
tanking every post-shout hit with leader incoming exactly 0 while the
leader still flees on trajectory, record it in the evidence file; do
not re-scope this arm.

**Hopeless/floor interaction (midshape watch item, recorded not
re-litigated):** the floor flee still reads LIVE HP, so a fighter
whose live HP collapses into the floor never gets to be "hopeless".
Under this shape the hypothetical HP falls FASTER than live HP (P4 >
P5 mitigated), so the judgment should turn hopeless before the floor
fires on the 53002 fight — but on the unit leg the less-armored
fighter's live HP still falls faster than his hypothetical HP (P3
taken > P4 taken), so the floor can still pre-empt the judgment there.
Record which leg, if any, the floor decides.

## Reproduction note (verified on THIS master before binding)

The baseline leg (unfixed worktree, master `93e7bea26`) reproduces the
decisive fight P2 **exactly**: 53002 Kieran Lorenz day-4 vs cliffhanger
— vKill, 10 rounds, 87 taken, 13 HP left, never hopeless, varmor 5,
tail "R10: the man in his 30s strikes for 11 (0 left)". All 8 gseq-1
root fights are IDENTICAL to midshape-a's roots on `6680d7924` (the
band is trajectory-stable across the rebase to `93e7bea26` for the
first fights). Baseline band: median 150d, sits 6/8
(`takeseatStats.seatTaken`), starvation 3, wave-5 reach 4/8, national
0/8, wins 0. The control is this run's baseline leg, not the
fightloop-b or midshape-a numbers.

Per-round probe (unfixed tree, `/tmp/probe-fightblend-rounds.js`,
doorwalk seed 53002, 6 days): the Kieran fight's cumulative
`roundTotals` are mDealt/vTaken 8/10, 16/18, 27/26, 34/36, 43/46,
51/57, 60/64, 71/71, 82/80, 93/87 — the per-round sequence the
Prediction below is grounded in.

## Proof (written with the fix, run before any judged candidate sweep)

`scripts/test-fightblend-b.js` (legs selectable by `LEG=unit|fight53002|all`, default `all`):
- **Unit leg — decision invariant to protection:** the same scripted
  field fight run at two worn-protection values straddling the retune's
  bump (rain_poncho prot 3 vs good_boots prot 5). Fixture, calibrated
  on unfixed code this run (seed 53002, first adult non-scholar
  fighter, HP 70, sharpened_stick wb 3, cliffhanger pack 1, `rng: ()
  => 0.5`, intent `fight`, no allies; each protection in its own
  process so the roster is identical): unfixed P3 → `vFlee`, 2 rounds,
  vTaken 22, mDealt 22, 48 HP left, hopeless; unfixed P5 → `vKill`, 8
  rounds, vTaken 63, mDealt 88, 7 HP left, never hopeless. (Identical
  to the fightloop-b and midshape-a calibrations — the fixture is
  stable across both rebases.) Assert on fixed code the hopeless/flee
  outcome (outcome, flee round, `fleeHopeless`) is IDENTICAL while
  `vTaken` differs, and `vTakenP4` is identical across the two legs,
  greater than worn-5 taken and less than worn-3 taken (protection 4
  absorbs between the two), and the hypothetical HP left
  (`vHpHypoLeft`) is identical across the two legs. On unfixed code
  this leg fails 9 assertions (verified this run: 2 passed, 9 failed
  — outcome/rounds/fleeHopeless diverge, `vTakenP4`/`vHpHypoLeft`
  null) — the instrument fails on unfixed code as designed.
- **Before/after leg — the 53002 Kieran day-4 fight shape:** replay the
  frozen-band fight on baseline vs candidate code and assert the
  candidate returns the C1 behavior — `vFlee` with `fleeHopeless`, 5–7
  rounds, HP left 35–60 (expected point value 43 — see HP-left
  treatment) — while the baseline reproduces the P2 behavior (10
  rounds, `vKill`, 13 HP). Read off the pilot corpora's `fieldFights`
  streams (same driver, same seeds), not a separate harness. Root-fight
  keys (each seed's FIRST field fight, gseq 1, on this master —
  identical to midshape-a's roots): 53001 g1 d8 Declan Baumann vs
  hushwolf; 53002 g1 d4 Kieran Lorenz vs cliffhanger; 53003 g1 d4 Jorge
  Silva vs lockpick_raccoon; 53004 g1 d6 David Kim vs hushwolf; 53005
  g1 d5 Robin Gordon vs nightcourt; 53006 g1 d5 Rosa Mendez vs
  gallowdeer; 53007 g1 d7 Diego Miranda vs nightcourt; 53008 g1 d5
  Frank Giordano vs sanjun.
- **No-regression leg:** `node scripts/check.js --quick` on the fixed
  tree (or each failing line named in the evidence file with its cause),
  attributed against a re-run on the reverted tree — record the full
  failure list, never just a count.

**Prediction (not a bar — the pilot judges):** for 53002 the
trajectory-identity argument above predicts a STRONG pass: vFlee with
fleeHopeless at round 6, HP left 43 (live taken 57 at round 6). The
unit leg is near-boundary, not guaranteed by construction: the
judgment itself (hopeless/winning per round) is identical across
protections by construction — same hypothetical HP, same P4 rate, same
mDealt — but the floor reads live HP, which falls faster on P3. Rough
numbers (mDealt 11/round; cliffhanger HP 80 at `rng: () => 0.5`; P4
~10/round): hypothetical rtd/rtk stay winning through round 4 by
razor margins (round 4: winning iff rtk 3.27 ≤ rtd 3.0 × 1.1 = 3.3),
lapse at round 5 (neither winning nor hopeless), and the floor then
fires on both legs at round 5 (live P3 ≈ 14 HP, live P5 ≈ 31 HP, both
below the ~40% break line) — predicted both `vFlee` 5r,
`fleeHopeless` false. If the round-4 winning margin flips the other
way, both legs floor at round 4 instead (live P3 ≈ 25, live P5 ≈ 39,
both below the line) — still identical. The split risk is a round
where P3 is below the line and P5 above it; the instrument, not the
construction, decides. For 53002 the floor cannot pre-empt: the
hopeless branch precedes the floor check, and live HP at round 6 (43)
sits above any plausible break line for Kieran in any case.

## Sweeps — pilot first, confirm only on GO

- **Instrument:** `scripts/combatdiv-20261107.js` (the combatdiv driver)
  — doorwalk baseline leg, policy `competent-doorwalk-b`,
  `TAKESEAT_B=1`, door drive off, 150d death-aware. Corpora:
  `evidence/2026-11-08/perseed-fightblend-b-baseline/` (already run,
  8/8, 0 instrument errors) and
  `evidence/2026-11-08/perseed-fightblend-b-candidate/`. One read-only
  instrument addition vs the midshape-a run: the `fieldFights` row
  records `vHpHypoLeft` / `allyHpHypoLeft` from the returned record
  (null on the unfixed leg, where the fields do not exist) alongside
  the retained `vTakenP4` / `allyTakenP4` reads. Pure reads, no
  game-state writes, no RNG draws. The driver's `fieldFights` streams
  carry `outcome` / `rounds` / `vTaken` / `vTakenP4` / `vHpLeft` /
  `vHpHypoLeft` / `fleeHopeless` per fight.
- **Baseline leg runs FIRST, on the unfixed worktree** (before the fix is
  applied — DONE, see Reproduction note), so the before/after is
  identical seeds, identical code except the fix.
- **Pilot seeds:** 53001–53008, FROZEN — the bisect's diagnostic band,
  reused deliberately. **Horizon:** 150d death-aware (`runDays` stops on
  village death / win, +10d tail max). **Policy:** doorwalk baseline leg,
  as the bisect, loadoutcensus, combatdiv, fightloop-b, and midshape-a
  did — the same substrate the collapse was measured on.
- **Confirm (only if pilot GO):** FRESH band **53801–53812**, 12 seeds,
  same policy/horizon, baseline + candidate legs. **Freshness check
  (re-verified by this arm, per the seed-band skill — do not trust the
  midshape-a note):** grep over ALL `evidence/*/sim-*-prereg.md` for
  precise `5380[1-9]|5381[0-2]` → hits only in the 0245Z fightloop
  prereg (which names 53801–53812 as its own reserved confirm band),
  the fightloop-b prereg (re-verification + reservation), the
  midshape-a prereg (re-verification + reservation), and the darkwit
  prereg's coordinator correction (which cites it as "the
  verified-fresh confirm band for the fight-loop fix" — a citation, not
  a use). Grep over ALL `evidence/*/sim-*.md` for each of 53801–53812
  → hits only in those preregs/evidence plus `sim-flipsocial-b.md:11`,
  `sim-scale-adoption-round-2216.md:59`, and
  `sim-winnability-round-1530.md:70` — all three are statements of
  non-use ("53801–53812 stays fresh", "No confirm band spent"), not
  uses. No judged corpus directory names any 538xx seed.
  Forbidden/contaminated lists named in preregs (standacc-b 99201–99208
  et al.) name no 538xx seed (the precise grep over all sim `.md`
  covers every list file naming a seed). **No judged corpus uses any of
  53801–53812: the band is fresh and remains reserved for this arm's
  confirm.** Rejected bands, recorded so the next worker does not repeat
  them: 53201–53212 (named in sim-doorwalk-b-prereg.md,
  sim-doorwalk-confirm-b-prereg.md, sim-feareddoor-b-prereg.md — used);
  53701–53712 (53704/53707/53708 used by sim-compvet 2026-10-18);
  53501–53512 and 53601–53612 (named in preregs — used).
- **Balanced panel (§15):** `scripts/balance-panel.js` run on the before
  tree (unfixed worktree, `--seeds 53001,53002,53003,53004,53005,53006,53007,53008 --policies capable,risk-aware,socialite,winseek --days 150`) and again on the after tree (fixed worktree, same seeds/policies/days); `compare --before <before-panel>/panel.json.gz --after <after-panel>/panel.json.gz --out evidence/2026-11-08/fightblend-b-panel-compare` and the compare `.md` attached to the evidence file. The panel is the instrument; the pre-registered GO bars below are the judge.

## GO bars (binding, §14)

Primary metric: fight-level property on the pilot corpora (53001–53008, 150d, doorwalk leg), candidate vs baseline on identical seeds.

- **PRIMARY — GO (pilot):** (a) the 53002 Kieran day-4 fight returns to the C1 shape on the candidate leg: `vFlee` with `fleeHopeless`, 5–7 rounds, HP left 35–60 (expected 43 — see HP-left treatment) — AND the baseline leg reproduces the P2 shape (10 rounds, `vKill`, ~13 HP); (b) the unit leg: the same scripted field fight at two worn-protection values straddling the retune bump gives an IDENTICAL hopeless/flee outcome while `vTaken` differs; (c) all 8 combatdiv root fights' decision shapes reported baseline vs candidate (table in the evidence file — reporting bar, not a pass/fail bar per fight).
- **SECONDARY — non-inferiority (frozen band, 53001–53008, 150d, doorwalk leg, TAKESEAT_B=1):** candidate median ≥0.8× control median (control median 150d → bar ≥120d), sits ≥ control−1 (control sits 6/8 → bar ≥5/8), starvation ≤ control+2 (control 3 → bar ≤5, totals and arm-only). Control = the baseline leg run in this arm (current master `93e7bea26`), NOT the fightloop-b or midshape-a numbers (different masters).
- **GO = primary holds AND secondary holds. NO-GO = any bar missed, never re-scored against a friendlier metric mid-run.** If NO-GO: revert the game-code change completely (zero src/js diff) and commit prereg + instruments + evidence + corpora only.
- **Confirm GO (fresh band 53801–53812):** same primary (fight-level shapes: the 538-band root fights are whatever the fresh band's first-divergence fights are — judged on the same property, decision invariant to protection, via the unit leg re-run on the confirm code base) + secondary (non-inferiority vs the fresh-band baseline leg). Confirm NO-GO holds the fix for re-judgment; it does not land.
- **Proof bars:** `scripts/test-fightblend-b.js` green (unit leg + 53002 leg + check-quick); pilot corpora complete (8/8 seeds both legs, 0 instrument errors); panel compare `.md` attached.
- **Sense-test:** the 53002 Kieran fight read in plain words on both legs (who fought what, what changed, what it meant), plus the village assessment (what the villages looked like, who thrived/died and why).

## Scale-wall numbers (reported for baseline and candidate pilot corpora, and for the confirm band if run)

National / table / wins, wave 4–5 unlocks, median survival — per leg.

## Non-goals

- No blend-variant (partial mitigation) substitution; no candidate (a) substitution; no TB-fight-path changes; no loadout/equip-score changes; no retune-value changes. The fix touches the morale decision input only (numerator + denominator together).
- No landing, no merge, no push, no version bump — report ready-to-merge; the coordinator lands it.
- No new measurement arm on an already-proven constraint beyond this fix's own before/after (the re-point's standing rule).

## Metric review (pre-registered note)

- The re-scope from fightloop-b holds: the fight-level primary discriminated where band bars could not (the secondary passes while both primaries miss on midshape-a — the non-inferiority bar alone would have called that a GO). No re-scoring is available or used.
- The unit leg's identity bar is a genuine judgment, not a construction guarantee: the judgment inputs are identical across protections by construction, but the floor reads live HP, so two protections can still floor on different rounds even with an identical judgment. If the legs split by a round on the floor, that is a NO-GO on primary (b) — the bar as written — and the evidence will say the numerator-aware shape is not decision-invariant in outcome, not that the bar was too strict.
- The HP-left bar is deliberately loose (35–60 vs C1's 30–45) because the body keeps protection 5 while only the judgment imagines protection 4; the expected point value (43) is stated so a 43 is a pass with its reasoning, not a fudge. If the candidate flees at round 6 with HP outside 35–60, that is a miss on primary (a) as written.
- The `winning` read shares the `rtd` input with `hopeless`, so it moves with the fix too — that is the same decision input, not a second change. The floor flee reads live HP, not the trajectory, so it is untouched by design: protection still saves HP, and a fighter at 5% still runs.
- One known limit, stated before the read: the pilot reuses the frozen band the collapse was diagnosed on, so it can show the fix restores *that band's fights*; the fresh-band confirm is what shows it generalizes. A pilot GO with a confirm NO-GO holds the fix.
