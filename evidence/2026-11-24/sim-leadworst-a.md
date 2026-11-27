# sim-leadworst-a — EVIDENCE (finding #2601: the launch lead is the worst-armed fighter in the party)

**Arm:** sim-leadworst-a · **Loop A run:** fleshout-20261127T1915Z (adoption/completion of the
stranded 20261125T0215Z arm; the dead run's uncommitted probe + instruments were verified
against the frozen prereg, committed as `25457c65d`, and rebased onto current master tip
`accf09d0c` — clean rebase, no stops — as `eb2d0af4e`).
**Axis:** scale-onramp (the blocking axis; standing directive applies).
**Prereg:** `evidence/2026-11-24/sim-leadworst-a-prereg.md` (frozen 2026-11-25 ~02:45 UTC,
before any judged sim). All verdicts below are judged ONLY against its frozen bars.
**Anchor commit (what the band actually ran on):** `eb2d0af4e809` (rebased tip).
**Band:** fresh seeds 110721–110728, 150d death-aware, competent verbatim
(sha256 first 12 `1884c8852d38`), substrate `SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1
FLEEREPAIR2=1 FIGHTALLY2=1 SPEARGATE=1 BOWOPEN=1`, control (LEADWORST unset) vs probe
(LEADWORST=1) on identical seeds. Driver `scripts/leadworst-driver-a.js`,
analyzer `scripts/analyze-leadworst-a.js`, proof `scripts/test-leadworst-a.js`
(**67 passed, 0 failed**, re-run green after the rebase), analyzer `--selftest` green.
Instrument errors: 0 on both legs. Ontology validated after the probe commit
(138 systems, release permitted).
**Corpus:** `evidence/2026-11-24/perseed-leadworst-a-ctl/` + `perseed-leadworst-a-arm/`
(8 seeds each); compare `evidence/2026-11-24/leadworst-a-analysis.json`; Part A
`evidence/2026-11-24/leadworst-a-partA-analysis.json`; arm leg
`evidence/2026-11-24/leadworst-a-arm-analysis.json`; §15 panel
`evidence/2026-11-24/leadworst-a-panel.md` (+ `.json`, `-before.json.gz`, `-after.json.gz`),
built by `scripts/build-leadworst-a-panels.js`.

## Verdicts

- **Part A DIAG: DIAG-GO.** Pool 13 (floor 10) ✓ · lead rank quantified 13/13 (100%, bar ≥90%) ✓ ·
  seed race answered with numbers ✓ · swap counterfactual computed ✓ · selftest + proof green ✓.
- **Part B probe: NO-GO** (primary kill-share bar missed; all other bars passed). Kill share
  ctl 0.0% (0/13) vs arm 0.0% (0/11), delta 0.0pp — bar needs probe kills ≥ 2 AND delta
  ≥ 5pp. Cost bars pass: starvation arm 1 vs ctl 6 (bar ≤ ctl+2) · villager starvation arm 1
  vs ctl 4 (bar ≤ ctl+2) · median survival arm 141.5d vs ctl 148d (bar ≥ 0.8× ctl).
- **Disposition: evidence-only, lever HELD on the branch** (per the ammosupply precedent).
  The probe code (`winPlanLeadSwap` + brain hook) stays on `sim-leadworst-a`, reverted
  before any landing. The DIAG instruments and evidence land; no game-code change ships
  from this arm. No `winPlanDepart` parity port (that was a landing condition, and the
  probe did not GO).

## Part A — the diagnosis, in numbers (control leg only)

**H1 (worst-armed lead) — CONFIRMED.** The lead is the worst-armed party member in 7/13
judged meetings (53.8%, bar ≥50%). Median lead wb 8 vs median best party wb 18
(median gap 5); median lead rank 2; rank distribution {best: 6, middle: 1, worst: 6}.
The basedmg-b picture reproduces on a fresh band: the launch lead really is the
worst-armed fighter in the party more often than not.

**H2 (seed race, not choice) — NOT confirmed as stated, but answered.** 29 Haven-seed
events; 14 (48.3%) had ≥1 OTHER eligible seeder alive at Haven — just under the 50%
bar. The frozen bar counts the question answered in either direction, so this still
supports DIAG-GO. Two softeners on the "race picks the wrong person" story: all 29
seed events engaged via village-slain (0 personally-fought — the personally-fought
seeder barely exists on this band), and when a choice existed the best available
seeder was typically only 0.5 wb better than the seeder (median best gap 0.5;
seeder best-armed in 7/14 ranked events, worst-armed in 8/14 — ties allow both).
So about half the time there is no choice at all, and when there is one it usually
barely matters at seed time. Profiles: wanderer 26, explorer 3.

**H3 (swap counterfactual) — REFUTED as a number.** Giving the median meeting's lead
the party's best observed wb lifts damage/round 42.8 → 48.5 (+8%, bar ≥25%). The
lead-only swap is a small lever on damage: the lead's own strikes are only part of
a party's output, and the best party weapon is itself weak.

## Part B — the probe, in numbers (control vs probe, identical seeds)

| | control | probe (LEADWORST=1) |
|---|---|---|
| Judged pool (pair-inclusive engaged launched w4+) | 13 | 11 |
| Kills / kill share | 0 / 0.0% | 0 / 0.0% |
| Median damage/round | 42.8 | 53.8 (+26%) |
| Median lead wb / median best wb | 8 / 18 | 17 / 20 |
| Lead worst-armed share | 53.8% (7/13) | 36.4% (4/11) |
| Outcomes | 11 vFlee, 2 vDie | 10 vFlee, 1 vDie |
| Swap fire rate (brain launches) | 0/204 | 111/231 (48%), median lead-wb gain +10 |
| Starvation deaths (total / villager) | 6 / 4 | 1 / 1 |
| Median survival | 148d | 141.5d |
| National / table wins | 0 / 0 | 0 / 0 |
| Wave-4 unlocked / wave-5 unlocked | 8 / 4 | 8 / 3 |
| Community lost | 4/8 | 4/8 |
| Scale ranks | regional 8 | regional 8 |

The swap works mechanically — it fires on nearly half of brain launches, moves the
median lead from wb 8 to wb 17 (a +10 wb gain on swapped departures), and lifts
median damage/round 26%. It still kills nothing: 53.8 dpr against the ~111/round the
wave-4 band needs (MONSTER-WAVES.md: wave-4 damage 35–95, HP 850–1500 — "a 4–6 round
fight for a godhood build (~220 dmg/round)") is half the bar, and the arm leg's own
counterfactual says even a best-armed lead in EVERY meeting only reaches ~70.5 dpr
(+19.8%, still under the 25% lift bar). **Lead choice is not the binding constraint
on wave-4 kills; total party damage is.** The best weapon in the party (median wb
18–20) is itself too weak — the prereg's anticipated finding for the coordinator,
now measured. Lever (ii) (gear the holder by taking a companion's weapon) stays set
aside: nothing in this band overturns the standing rule that personal gear is never
taken, and the holder already takes the best deposited weapon via `villagerGearUp`.

Per-seed survival (days / end / standing / max wave): ctl — 110721 150 survived 445 w5 ·
110722 115 lost 325 w5 · 110723 150 survived 175 w4 · 110724 103 lost 300 w5 · 110725 146
lost 199 w4 · 110726 150 survived 410 w5 · 110727 150 survived 199 w4 · 110728 70 lost
145 w4. Arm — 110721 150 survived 500 w5 · 110722 80 lost 100 w4 · 110723 94 lost 125 w4 ·
110724 150 survived 199 w4 · 110725 150 survived 199 w4 · 110726 119 lost 199 w4 · 110727
133 lost 275 w5 · 110728 150 survived 450 w5. (Identical seeds diverge once the lever
changes behaviour — same starting conditions, different trajectories; that is the
design, not a bug. One visible consequence: arm-leg judged parties were less armored
than ctl's — mean armor P 20.9 vs 32.2, min armor P mean 12.6 vs 18.2 — because
different villagers lived to launch. It does not change the verdict: 0 kills either way,
and the counterfactual already prices a best-armed lead.)

## §15 balanced panel (instrument, not judge)

`evidence/2026-11-24/leadworst-a-panel.md` (8 paired seeds). Decision:
**review_required**. Village deaths per run 93.375 → 94.25 (paired delta +0.875,
95% exploratory interval −15.6 to +16 — noise, straddles zero); national 0 → 0,
table wins 0 → 0, community loss 0.5 → 0.5. The panel agrees with the judged
verdict: no win/national movement, survival-side movement inside noise.

## Encounter-gear fixture (Steve 2026-11-13)

The judged fixture is the encounter itself, staged by the competent policy: a geared
scholar fighting with a party, never a fresh un-geared solo scholar. Judged vFlee
meetings: party size 3 in both legs. Ctl: min armor P mean 18.2, mean armor P mean
32.2, 2.0 abilities per member. Arm: min armor P mean 12.6, mean armor P mean 20.9,
2.3 abilities per member. The fixture is encounter gear, as staged (see the
divergence note above for why the arm leg's armor reads lower).

## Sense-test (best + worst probe-leg meetings, read in full)

**Best — seed 110723, day 53, Mia vs The Suburb, 9 rounds, 887/1449 dealt (61%), fled
at 26 HP.** The swap fired at depart: Somchai (wb 17) → Mia (wb 28), stamp on the
plan. Reads as people, start to finish. Mia walks in, opens at range (4 shots,
3 hit, 91 damage), pins the Suburb with Pack Hunt ("Mia whistles once — wings,
teeth, claws"), fights two rounds alone, shouts for help — Somchai charges in on
round 3, Jeferson on round 4 — binds her own wound mid-fight (field medicine, +20
HP, round 7), and leaves with a sentence that sounds like a decision, not a
script: "Mia sees how this ends — and runs while running still works." The flee
itself is defensible: she was at 26 HP against hits of 22–28. This is the swap
working exactly as designed — and it still ends in a flee with the monster at
562 HP. The damage gap is not a leadership gap.

**Worst — seed 110721, day 65, Aaliyah vs The Eater, 4 rounds, 74/1067 dealt, Aaliyah
dies.** Aaliyah (wb 7, sling) walks straight in alone, fights two rounds alone
(18, then 15 damage a round), shouts — Mateo (wb 18) charges in on round 3,
Meera on round 4 — and Aaliyah dies the same round both allies arrive
("Smack-Rush hits Aaliyah for 37 (0 left)"). It reads as people too: she binds her
wound mid-fight, the bond line lands ("Aaliyah and Mateo have bled together — it
steadies them"), and the death feels like bad luck arriving a round late rather
than a senseless script. The mechanism note: Mateo was NOT in this expedition's
dawn party (likeliest source depart is day 58, Aaliyah + Meera, no swap) — he
arrived on a shout. The swap only re-weights the dawn party; the best-armed
fighter in the village often arrives on rounds 3–4, after the holder has already
fought alone. The opening fighter is whoever walks into the monster, not
necessarily the plan lead. That bounds the swap's reach in a way the damage
numbers alone don't show. (Appended to `sim-findings.md`.)

## Metric review

- **H2's 50% bar was near-missed (48.3%)** and the frozen "answered either direction"
  clause already handles that — no revision needed. The near-miss plus the 0.5 wb
  median best gap says the seed-race question is mostly settled: the race exists
  (about half of seeds have a choice) but the choice rarely matters.
- **The kill-share bar was the right judge but a blunt one at 0/0.** Both legs at zero
  kills means the bar can't distinguish "swap does nothing" from "swap helps but the
  damage gap is bigger than the swap." The secondary dpr (+26%) and the arm
  counterfactual (+19.8% even with a perfect lead) do distinguish them — the swap
  helps, the gap is bigger. Proposal for the NEXT run: any follow-up arm on wave-4
  kills should pre-register a damage-bar secondary (e.g. median dpr ≥ 80) as a gate
  before re-testing kill share, so a partial close is visible instead of another 0/0.
- **Lead-rank definition held up.** Fighters[0] is the villager the fight opened on,
  which is what the prereg froze. The plan-lead vs fight-lead distinction (worst
  meeting) is a mechanism finding, not a metric error — but a future instrument
  should record both the plan lead at depart and the opening fighter, so the swap's
  reach is measured directly instead of inferred from logs.
- **No re-scoring happened.** H1 confirmed, H2/H3 refuted, Part B NO-GO — all judged
  against the frozen bars as written.

## Convergence state

Scale-onramp axis: still the blocking axis. Wall numbers on this band: national 0/8
both legs, table 0, wins 0, wave-4 unlocked 8/8, wave-5 4 ctl / 3 arm, median
survival 148d ctl / 141.5d arm. The launch-lead finding (#2601) is now measured
and closed as a lever: the lead really is worst-armed most of the time (H1), the
seed race is real but low-stakes (H2), and re-weighting the lead does not move
kill share (Part B NO-GO). The binding constraint sits one level down — the
party's best weapon, not who holds it. Next lever on this axis should attack
total party damage or weapon quality, not leadership.

## Canon note

`docs/CANON.md` and `docs/MONSTER-WAVES.md` read; wave-4 band (damage 35–95, HP
850–1500) cited from canon. No canon doc covers the launch lead, the plan-seeding
race, or lead selection — said here rather than inventing canon. Launch mechanics
cited from code (`win-plan.js`, `villager-brain.js`, `villager-agency.js`
`startExpedition`, `game.js` `villagerGearUp`, `companion-score.js`).

## Telemetry deviation check

`node scripts/telemetry-check.js` against
`hidden_files/telemetry-baselines/scale-wall.json` REFUSED the corpus by design:
the per-seed files carry top-level `anchorCommit`, so the tool treats them as
sweep recorder rows, not runs ("compared with sweep-compare tables, never against
a run baseline here"). No baseline was rolled forward. The raw wall numbers are
above (national 0, table 0, wins 0 both legs) — no LOUD deviation to investigate,
and no `--update-baseline` was run.

## Adoption note (for the coordinator)

Adopted from the dead 20261125T0215Z run: the prereg + probe + instruments were the
dead worker's uncommitted state, verified file-by-file against the task brief
(villager-brain.js +19, win-plan.js +82, ONTOLOGY.md one-line Provides update,
scripts 646/1585/458 lines — no contamination, no unrelated files). Committed as
`25457c65d`; the safe-commit clobber struck (main index showed the six files
staged-deleted after the commit) and was repaired with the `ls-tree -r |
update-index --add --index-info` pipe — commit verified correct, status + diff
empty afterwards. Rebased clean onto `accf09d0c` (no stops); proof re-run green
(67/67) on the rebased tip; both legs ran on the rebased anchor `eb2d0af4e809`.
Worktree left clean, branch rebased, evidence-only — ready for the coordinator to
merge the evidence + instruments (probe code HELD on the branch, to be reverted
before any landing commit).
