# sim-ammo-a — the served bow departs with pocket ammo (finding #2590, ammo first)

**Arm:** sim-ammo-a · **Loop A run:** fleshout-20261120T2015Z
**Type:** BUILD + MEASURE (pilot) — finding #2590's serve half, ammo first.
**Verdict: NO-GO** — the primary fails 1/6 = 0.167 against a 0.50 bar.
The lever is reverted (§9); the branch is instrument + evidence only.
**Prereg:** `evidence/2026-11-20/sim-ammo-a-prereg.md` (frozen 2026-11-20
~21:25 UTC, before any judged sim, before the lever existed).
**Base at freeze:** master c0ac4c3c9. **Rebased before the pilot** onto
master 1fcd7edba (adoption round record: dmgcheck BAND VARIANCE #2627
resolved, sense3 GO #2619, reseed NO-GO METRIC-BROKEN #2626 HELD
unmerged; + the journey-succession r258 self-witness fix in
`betrayal.js`) — clean rebase, no conflicts, all proofs re-run green
after it (§1). **Pilot anchor:** d8f4b5502 (lever + instrument commit).
**Builds on:** roll35 (NO-GO: servings 5→10, 0 volleys), evade-a
(NO-GO: evade live, ammo wall 17/25), bowsee-a, bowknow-a, speargate-a.

## §1. The lever as played

AMMO=1 (env-gated, default off): in `villagerPocketAmmo` step 3, at the
departure arrow/bolt craft attempt, when the carrier's bow was staged
THIS departure (served — `bowOpenByVid[vid].day === today`, source
`crafted`/`fromStash`/`fromArmory`), the craft rate becomes
lv ≥ 2 ? 0.85 : **0.60** — the learned first-make rate instead of the
blind 35%. The 85% learned rate is untouched; everyone else keeps the
blind 35%. One threshold swap on the same single `Math.random()` draw:
zero new draws. The return carries `ammoServed`/`ammoRate` for the
instrument. Scope: served-bow carriers only, arrow/bolt ammo only.

Proof, at the pilot anchor d8f4b5502 (all re-run green after the rebase
to 1fcd7edba): `test-ammo-a.js` **52/52** (flag-off blind 35% fails a
0.50 roll; flag-on served 60% crafts 5 arrows on the same roll;
non-served still 35%; lv ≥ 2 still 85%; failing roll at 60% loses
materials, pile never negative; no materials = no attempt, zero
draws; sling/stone path untouched; flag-off repeat byte-identical;
draw-neutrality: exactly one draw per attempt on both legs),
`test-depmat-a.js` 43/43, `test-roll35-a.js` 41/41,
`test-spearstage-a.js` 26/26, `test-speargate-a.js` 31/31,
`test-bowcraft-a.js` 58/58, `test-bowknow-a.js` 19/19, analyzer
`--selftest` 75/75. Fidelity: the ctl leg reproduces the unjudged
2-seed probe exactly on seeds 107071/107072 (same days, deaths,
ammoRows, depmatRows) — the rebase changed nothing on this band.

## §2. The pilot

Horizon 150d death-aware, competent verbatim policy, fresh band
**107071–107078, 8 seeds**. Both legs:
`VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1
BOWOPEN=1 SPEARGATE=1 DEPMAT=1 ROLL35=1`; ctl AMMO unset, arm AMMO=1.
Legs differ ONLY by env — no code change between legs. `EVADEOBS`,
`BOWKNOW`, `DEPARTSEE` unset on both legs. Ctl leg ran ~2 min, arm leg
~21 min, both exit 0, **instrument errors 0** on all 16 per-seed files.
Corpora: `evidence/2026-11-20/perseed-ammo-a-{ctl,arm}/` (8 seeds each).
Analysis: `evidence/2026-11-20/ammo-a-analysis.json`.
§15 panels: `evidence/2026-11-20/ammo-a-panel*.json.gz/.json/.md`
(decision `review_required`, 8 paired cases).

## §3. The verdict (frozen bars, judged as written)

| Bar | Frozen bar | Arm | Result |
|---|---|---|---|
| (0) Pool floor | served-bow engaged meetings ≥ 3 | 6 (ctl 6) | PASS |
| (1) Substrate-served | attributable-served ≥ 3 | 4 (ctl 5) | PASS |
| (2) **PRIMARY** — served-bow engaged meetings entering with ≥ 1 arrow | arm share ≥ 0.50 (roll35 anchor 0/5) | **1/6 = 0.167** | **FAIL** |
| (3) Secondary — served-bow volleys fired ≥ 1 | ≥ 1 | 1 | PASS |
| (4) Guardrail starvation | arm ≤ ctl + 2, totals AND villager-only | arm 1 (villager 0) vs ctl 1 (villager 0) | PASS |
| (5) Guardrail median survival | arm ≥ 0.80 × ctl | 150d vs 150d | PASS |

**Verdict: NO-GO.** A miss on any bar is NO-GO, never re-scored — and
the primary misses by a wide margin, not a rounding error.

## §4. Before / after on identical seeds

| | ctl (AMMO off) | arm (AMMO on) |
|---|---|---|
| Departures (pocketAmmo rows) | 328 | 297 |
| Served departures (bow staged this departure) | 12 | 12 |
| Served departures leaving with ≥ 1 arrow | 4/12 | 6/12 |
| Served arrows carried, mean | 1.67 | 2.50 |
| Lever rows (served rate fired) | 0 | 10 (6 crafted / 4 failed) |
| Rate actually used — 0.60 picks (crafted/failed) | 0 | 10 (6/4) |
| Rate actually used — 0.35 picks (crafted/failed) | 26 (12/14) | 12 (6/6) |
| Rate actually used — 0.85 picks (crafted/failed) | 40 (34/6) | 44 (36/8) |
| Fail reasons — craft-fail / already-capped / no-ranged / craft-ok / no-ammo-id / stock-draw / no-mats | 20 / 191 / 26 / 46 / 5 / 23 / 17 | 18 / 169 / 28 / 48 / 5 / 12 / 17 |
| Pile fiber 0 at the attempt (rows) | 20 | 20 |
| Pile arrows ever seen in the pile | 0 | 0 |
| All bow rows leaving with ammo | 112/140 | 103/130 |
| Served-bow engaged meetings (PRIMARY population) | 6 | 6 |
| …entering with ≥ 1 arrow | 1 | 1 |
| Served-bow volleys fired | 1 | 1 |
| Attributable-served (spear + site + crafted) | 5 | 4 |
| Site-supplied / site-crafted / site-crafted-fail | 21 / 5 / 5 | 23 / 4 / 5 |
| Bow stage: crafted / crafted-fail / noSource / spearSeen / spearPassed / alreadyHad | 12 / 11 / 20 / 10 / 10 / 285 | 12 / 13 / 20 / 9 / 9 / 252 |
| Roll35 site-spear picks: crafted / failed (fail share) | 10: 5/5 (0.50) | 9: 4/5 (0.556) |
| Pair-inclusive meetings (win / kill / vDie / vFlee) | 15 (1/1/3/11) | 16 (1/1/3/12) |
| Pair-inclusive win share | 0.067 | 0.0625 |
| Deaths total | 687 | 684 |
| Starvation (villager-only) | 1 (0) | 1 (0) |
| Median survival | 150d | 150d |
| Community lost (village-lost) | 0 | 1 (seed 107077, day 131) |
| Wave 4 unlocked / wave 5 unlocked (seeds) | 8 / 3 | 8 / 4 |
| National / wins / table win rate | 0 / 0 / 0 | 0 / 0 / 0 |
| Standing | 199 regional on 5 seeds; 490 / 265 / 740 on the rest | same (see §8 drift) |

§15 panel (8 paired cases, `review_required`): village deaths per run
85.875 → 85.5 (no material signal); deaths per 100 days 56.96 →
58.31 (`regression_watch` — the day-131 village loss compresses the
arm's days); community loss 0 → 0.125 (`regression_watch` — the one
lost village); national access 0 → 0, table win rate 0 → 0 (no
material signal). Table entry/sitting rates not observed on either
leg (reported null, never faked).

## §5. Why it missed — the mechanism, departure by departure

**The lever fired exactly as designed — at the departure.** Ten
served-rate picks on the arm (6 crafted, 4 failed) against zero on
ctl. Served-with-ammo rose 4/12 → 6/12; the two departures the lever
flipped were Katarina (seed 107073, day 85: blind 35% failed on ctl,
learned 60% crafted 5 arrows on the arm) and gen_iq204w4 (seed
107077, day 10: same flip). The quiver works at the trailhead.

**But the lever moved no fought meeting.** The primary's 6 meetings
are byte-identical on both legs — same seeds, days, villagers,
monsters, outcomes, rounds, volleys, log lines. The one quivered
meeting (Vasyl, seed 107074, day 73: 5 arrows in, 4 shots, 2 hits,
27 damage, fled after 4 rounds) exists identically on ctl: Vasyl
crafted his 5 arrows at the blind 35% on ctl too — he got lucky, the
lever didn't cause his quiver. The two flipped departures never
reached a wave-4+ engaged fight with their arrows: Katarina's
day-88 meeting (ctl, 0 arrows, fled) doesn't exist on the arm at all
— her history diverged — and gen_iq204w4 met a wave-4 Strike on day
40 carrying 4 arrows and **evaded** (rounds 0, no fight) — the evade
wall eating a quivered served bow, exactly the named next arm.

**Five of the six primary meetings are one villager: Lelisa**
(app_mgpsphrw599, seed 107075, served day 96). She fought five
times with an empty bow (days 98, 100, 101, 111, 111 — two flees, a
10-round melee kill, a flee, then death in round 1) because her
departure could not craft at ANY rate: pile fiber **0** (stick 6,
stone 839, fiber 0) on day 96, and fiber **still 0** when she
departed again on day 101 — the village never got fiber in five
days. No craft attempt ran, so no rate could fire. Her companion
Mateo Alvarez hit the same empty pile the same day and died in a
Strike meeting that day. The probe's "materials never bind" was a
2-seed artifact: on the full band, `no-mats` fires 17 times per leg
and fiber sits at 0 on 20 rows per leg. **The prereg's §0.2 drop of
the site-supply half — judged vacuous on probe evidence — does not
survive the pilot**: for the one served carrier who actually fights,
fiber supply is the binding constraint, not the roll.

**A second, definitional gap.** The frozen primary counts only
spear-holder served leads (`servedByVid`: site-crafted spear
carriers). The lever's "served" is broader — any carrier whose bow
was staged this departure. Under the broader population the arm is
2/9 = 0.222 (ctl 2/10 = 0.20) — still far below 0.50, so the verdict
is robust to the definition; the gap changes the margin, not the
verdict. The broader count adds visjoin_96 (seed 107076, day 116:
7 arrows in, 4-shot volley, 2 hits, 32 damage, died in 3 rounds) —
but she too carried 7 arrows on ctl, crafted at the blind 35%
there. No quivered served fight on the arm is attributable to the
lever; every one is background luck or the learned 85% rate.

**The cost side is quiet but not clean.** Starvation and median
survival both pass, but seed 107077's village was lost on the arm
(day 131, standing 375, maxWave 5 — ctl survived 150d, standing 199,
maxWave 4) while 6 of 8 seeds are byte-identical between legs. The
loss follows 120 days of divergent history after the day-10/11 craft
flips; it is RNG divergence, not a proven lever cost — but the
median-survival guardrail (150 vs 150) hides it, so it is named
here, not hidden. Departures drifted 328 → 297, almost all of it on
107077 (85 → 56 depmatRows) and 107073 (12 → 10).

## §6. Sense test — read the fights, not just the counts

The game narrates the miss in plain words. Lelisa's five fights all
open with the same line:

> "Lelisa has Crude bow but no arrows — the string stays drawn, useless."

She fights on anyway — binds a wound mid-fight for +20 HP, strikes
for 23–25 a round in melee, and the System celebrates her on camera
twice ("Lelisa just put down Ad Break... on CAMERA. That's a veteran
kill, folks. REMEMBER the name." day 93; "Lelisa just put down The
Commercial Break..." day 101). She is a veteran killer — and she dies
on day 111 to Your Move, hit for 16 with 0 HP left, still holding the
empty bow. The villagers act like people here: the fighter fights
with what she has, the System remembers her name, and the empty
quiver is a visible, voiced fact in the fight — not a silent number.
The defect is the supply, not the narration: nothing in the village
fetches fiber, and nobody's departure fixes it.

Vasyl's one quivered fight reads right, too: "Vasyl sees The Strike
coming and nocks an arrow — the fight opens at range (4 shots)" —
two hit for 13 and 14, two bury themselves in the dirt, "(spent)".
He flees after 4 rounds with 1 arrow left. A quivered served bow
does what the design hoped — once, on background luck, on both legs.

## §7. Village assessment (plain words)

The villages are bow-rich and bow-knowing — 285 of 328 ctl
departures already had a bow — and the bow-serve pipeline works
where it fires. The served bow is no longer the gap: the lever puts
arrows in packs at the trailhead (6 of 12 served departures leave
quivered, up from 4). The gap is what happens next. The villagers
who get quivers mostly never meet a wave-4 monster while holding
them; the one villager who meets wave-4 monsters five times over
cannot get arrows at any price because the village pile has no
fiber — and nobody goes and gets fiber. The villages survive to
wave 5 on 3–4 of 8 seeds and sit at regional standing, but none
reaches national, none wins, none takes a seat. The quiver is a real
improvement to a departure that doesn't change any fight the
villages actually have.

## §8. Metric review (§14)

- **Finding #2590 (serve half, ammo first): stays open.** The
  primary misses 1/6 against 0.50. The lever is proven to work at
  the departure and proven not to move the fight. The next lever is
  named, in order: (1) **fiber supply** — the quiver must not
  depend on pile fiber the village never stocks (a fiber fetch, a
  quiver crafted alongside the bow from the bow's own materials, or
  arrows drawn from a stock the village actually holds); (2)
  **evade-on-a-served-quivered-bow** — the named next arm, which
  ate one of the lever's two flipped departures (gen_iq204w4, 4
  arrows, evaded). The rate itself (60% vs 35%) is settled: it
  moves departures 4/12 → 6/12 and moves no meeting.
- **The primary is a within-arm share on the RAW population (this
  prereg).** The miss is the share (quivers empty at the fight),
  not the pool (6 ≥ 3 — the probe's thin-band warning did not
  materialize) and not the substrate (4 ≥ 3 served). The verdict
  is not re-scored. The population definition (spear-holder
  served leads) is narrower than the lever's served definition;
  under the broader any-carrier population the arm is 2/9 = 0.222
  vs ctl 2/10 = 0.20 — still NO-GO, so the gap changes the
  margin, not the verdict. The next arm should define "served" as
  the lever defines it (bow staged this departure, any carrier),
  or say why it keeps the spear restriction.
- **The §0.2 supply drop is overturned by the pilot.** The prereg
  dropped the site-supply half as vacuous on 2-seed probe evidence
  (0 no-mats in 53 rows). The full band shows no-mats 17 rows per
  leg and fiber 0 on 20 rows per leg — and the primary population's
  dominant villager is blocked by fiber 0 on two departures five
  days apart. A 2-seed probe cannot judge a supply question; the
  next arm's prereg must size supply on the full band, not a probe.
- **The guardrails are the scalemetric cost bar (this prereg).**
  Both pass — starvation 1 vs 1 (villager 0 vs 0), median survival
  150d vs 150d. But the median hides a lost village (107077, arm,
  day 131) and the panel flags community loss 0 → 0.125 and deaths
  per 100 days 56.96 → 58.31 as `regression_watch`. The guardrails
  pass as frozen; the loss is reported beside them, not inside
  them. A future cost bar should count villages lost, not only
  medians.
- **RNG divergence.** Six of eight seeds are byte-identical
  between legs (same days, deaths, standing, depmatRows). 107073
  diverges mildly (deaths 56 → 58); 107077 diverges hard (village
  lost day 131, maxWave 5 vs 4, depmatRows 85 → 56). The drift
  seeds are named; no bar turned on the drift except through the
  panel's per-100-days watch. The verdict does not get re-scored.
- **Draw-neutrality is a property of the mechanism, not of the
  corpora.** A flipped craft puts arrows in a pack, so the streams
  diverge by design once the rate fires. This review does not
  re-litigate the divergence as a mechanism failure.
- **Instrument quirk (not a verdict input).** The top-level
  `meetings`/`kills`/`wins` counters read 0 on both legs and
  `ctlMeetings`/`armMeetings` are empty lists in the analysis —
  the raw-meeting detail aggregation isn't populated for the raw
  population (only the pair census populates it), so
  `deathsPerEngaged` also reads null on both legs. The verdict
  doesn't use those counters (the primary reads `ammoRaw` from
  `v4encounters` + `servedByVid`, verified by re-deriving the 6
  meetings from the corpora), but the next arm should populate or
  drop the empty arrays rather than leave a 0 that looks like a
  count.
- **Encounter-gear fixture.** The verdict turns on departing
  served-bow carriers, staged by the competent policy — a geared
  scholar fighting with a party, never a fresh un-geared solo
  scholar. The proof test ran on a live loaded village with real
  roster/gear; the pilot's per-seed corpora carry the encounter
  averages beside the verdict.

## §9. Revert (NO-GO closeout)

Per the depmat/roll35/evade precedent (instrument + evidence only):
the AMMO lever **and** the DEPMAT+ROLL35 substrate re-land are
reverted from `src/js/game.js` before the final commit — the branch's
final tree differs from master 1fcd7edba in no `src/` file. The lever
commit (d8f4b5502) stays in branch history, so the next arm can
re-land the substrate from it exactly as this arm re-landed roll35
from the prereg + proof test. Proof results at d8f4b5502 (AMMO 52/52,
DEPMAT 43/43, ROLL35 41/41, SPEARSTAGE 26/26, SPEARGATE 31/31,
BOWCRAFT 58/58, BOWKNOW 19/19, analyzer selftest 75/75) are recorded
here and in the commit message; the proof tests fail on the reverted
tree by design, as the roll35/evade tests do on master (their lever
code is not on master either, and none of these arm tests is on the
green list). Nothing is pushed, no version bumped, nothing verified
live. Branch rebased onto current master 1fcd7edba, clean, ready for
coordinator `--ff-only` merge, pending ship.

## §10. Files

- Prereg (frozen): `evidence/2026-11-20/sim-ammo-a-prereg.md`
- This evidence: `evidence/2026-11-20/sim-ammo-a.md`
- Analysis: `evidence/2026-11-20/ammo-a-analysis.json`
- §15 panels: `evidence/2026-11-20/ammo-a-panel-before.json.gz`,
  `ammo-a-panel-after.json.gz`, `ammo-a-panel.json`, `ammo-a-panel.md`
- Pilot corpora (8 seeds each):
  `evidence/2026-11-20/perseed-ammo-a-ctl/`,
  `evidence/2026-11-20/perseed-ammo-a-arm/`
- Pilot logs: `evidence/2026-11-20/ammo-a-ctl.log/.err`,
  `ammo-a-arm.log/.err`
- Unjudged design-research probe + fidelity smoke (pre-prereg):
  `evidence/2026-11-20/perseed-ammo-a-probe/`,
  `perseed-ammo-a-smoke/`, `ammo-a-probe*.log/.err`,
  `ammo-a-smoke.log/.err`
- Instrument: `scripts/ammo-driver-a.js`,
  `scripts/analyze-ammo-a.js`, `scripts/build-ammo-panels-a.js`,
  `scripts/test-ammo-a.js`
- Lever (reverted, history only): `src/js/game.js` `villagerPocketAmmo`
  step 3 at commit d8f4b5502.
