# sim-launchfunnel-a — unified launch-funnel census (DIAG, GO)

**Arm:** sim-launchfunnel-a · **Loop A run:** fleshout-20261117T1215Z (adopted by run
fleshout-20261117T1415Z after the 1215Z coordinator died) · **Axis:** scale-onramp
**Type:** DIAG, instrument-only. No game-code change, no default flipped, no lever built.
**Branch:** `sim-launchfunnel-a` · **Base at arm start:** master `f9b33757a`
**Policy:** competent verbatim (`scripts/policies/competent.js`),
sha256 `df9b7dff4de498779655b04db29782023840d8b2a4ed19a0ecbe86db9c71438c`
**Band:** seeds 103411–103418 (8 seeds) · **Horizon:** 150d death-aware
**Prereg:** `evidence/2026-11-17/sim-launchfunnel-a-prereg.md` (frozen before any judged sim)

## The question (trickteach-b's named next step)

sim-trickteach-b PILOT NO-GO'd one-observation-teaches: the mechanism moved
(trick-known at wild contact 42%→78%) but the armed leg launched **0** wave-4
fights, so the judged population never formed. Its closeout names the next step:
"diagnose why launches are 0–5 per 8 villages before re-running any trick lever".
This arm is that diagnosis: a UNIFIED launch-funnel census on ONE fresh band,
ranking where plan instances die across six stages: seed-attach → dawn bid →
profile gate → companion pool → launch → gate. The trick-teaching lever is NOT
rebuilt (killed, stays killed).

## Verdict: GO

All five frozen bars pass on the census (`vre`) leg; the analyzer's verdict is
`GO` (`evidence/2026-11-17/launchfunnel-a-analysis.json`, re-run by the adoption
and reproduced byte-identical).

| Bar | Result |
| --- | --- |
| 1. Taxonomy completeness | PASS — 12/12 instances classified, 0 `unknown`, 8/8 files parse per leg, 0 instrument errors on every file |
| 2. Population floor (≥5 instances) | PASS — 12 instances opened on the census leg |
| 3. Ranked-leak verdict | PASS — binding stage named with count + share (below) |
| 4. Instrument validity | PASS — proof 44/44 green (re-run by adoption); D1 repeatability + D2 wrap neutrality green (60d, seed 103411); D2 full-band `rec`≡`vre` trajectories, 0 divergences; D3 drift CLEAN on all 8 seeds (first divergence day ≥ first-lever-day + 2 everywhere); wave-4 id set matches `src/data/monsters.json` exactly (10 ids) |
| 5. Balanced panel (§15) | DONE — `launchfunnel-a-panel.{json,md}` + before/after `.json.gz`, OFF→VRE compare; decision `review_required` (see Panel) |

## The ranked funnel (census leg, `vre`, VETREENGAGE=1)

31 wave-4+ seed rows landed; 17 attached to a plan, 14 did not (8 target-null).
12 plan instances opened. Where they died, frozen precedence:

| Stage | Count | Share |
| --- | --- | --- |
| **candidate-not-bid — BINDING** | **8** | **66.7%** |
| launched-no-meeting | 2 | 16.7% |
| plan-churned-before-dawn | 1 | 8.3% |
| launched-fought-no-kill | 1 | 8.3% |
| bid-not-selected | 0 | 0% |
| selected-blocked | 0 | 0% |
| launched-killed | 0 | — |
| target-killed (outside a launch) | 0 | — |
| unknown | 0 | — |

**The binding stage is the dawn bid, and inside it the companion pool.**
`candidate-not-bid` subs: `no-companion-party` 7, `not-scored` 1. The pool census
over 87 scored dawns: **81 dawns with 0 eligible companions (93%)**, 5 with 1,
1 with 2, 0 with 3+. First-fail tally on pool rows: away 241, notRanger 198,
selfOrScholar 174, eligible 7. The gate never gets a chance to say anything:
`bid-not-selected` 0 and `selected-blocked` 0 — nothing that bids is ever
refused downstream. The one joined gate row in the whole census is `null`
(the sofia fight below; trick unknown, party of 3, all armed and armored).

**The master-default leg (`off`) is dry.** 5 wave-4+ seed rows (all agency
flee/evade paths, live on both legs), 0 attached, **0 instances opened**.
On master default there is no funnel to rank — the seed source is nearly dry,
exactly the thinness the prereg said to report as a stage-0 finding. The
funnel only exists because the VETREENGAGE seed call plants it.

## The three launches (all that survived the funnel)

| Seed | Holder → target | Launches | Outcome |
| --- | --- | --- | --- |
| 103413 | devon_okafor → eulogy | d78 (part-1), d86 (dawn), d95 (dawn) | launched-no-meeting — never re-met the target in window [78, 151]. Note: devon met the eulogy wild on d77, fled after 3 rounds (dealt 85, took 50), then launched the next day and never found it again. |
| 103416 | sofia_chen → eulogy | d47 (dawn, with ethan_hunt), d52 (part-1, with gen_tl2gb3k) | **launched-fought-no-kill** — met the eulogy d60 (see Sense-testing). |
| 103416 | ethan_hunt → algorithm | d64 (dawn, with gen_ufc1zv0) | launched-no-meeting — no encounter with the algorithm in window [64, 88]. (He had met it wild on d62, two days *before* launching, and fled.) |

**0 launched kills in 12 instances. 0 target kills outside launches.** The one
fight a launched party got dealt **77 damage of ~909 HP (8.5%)** and fled at 2 HP.

## Per-seed table (census leg)

| Seed | Days | End | Standing | Max wave | Instances | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 103411 | 107 | village-lost | 199 | 4 | 0 | — |
| 103412 | 62 | village-lost | 100 | 4 | 0 | — |
| 103413 | 150 | survived | 199 | 4 | 1 | devon → eulogy, launched ×3, no meeting |
| 103414 | 150 | survived | 150 | 4 | 1 | app_mgpsphnl458 → herald, seeded d149, never scored |
| 103415 | 144 | village-lost | 199 | 4 | 4 | sigrun → eulogy + visjoin_98 retargeting herald→influencer→herald; all candidate-not-bid |
| 103416 | 150 | survived | 430 | 5 | 5 | sofia → eulogy (fought), ethan → algorithm, david → editor (wave 5, never scored), visjoin_99 → herald, visjoin_137 → suburb |
| 103417 | 150 | survived | 199 | 4 | 0 | — |
| 103418 | 143 | village-lost | 199 | 4 | 1 | visjoin_115 → reunion, plan deleted d120 before any dawn |

Five of eight seeds sit at standing 199 — the defer-veterans pin, not a stall
in this census (that mechanism is measured elsewhere).

## Wall numbers (both national definitions)

| | OFF leg | VRE leg (census) |
| --- | --- | --- |
| Wins | 0/8 | 0/8 |
| National by standing ≥ 200 | 1/8 | 1/8 |
| National by scaleRank ≥ 2 | 0/8 | 0/8 |
| Table seats | 0/8 | 0/8 |
| Wave 4 unlocked | 7/8 | 8/8 |
| Wave 5 unlocked | 1/8 | 1/8 |
| Median survival | 151d | 147.5d |
| Total deaths | 460 | 517 |
| Starvation deaths | 3 | 5 |

Cross-check: the OFF leg's wall is **byte-identical in every number to the
sibling arm sim-part2night-a's wall** (same band, same policy, pure master,
different recorder) — deaths 460, starvation 3, survivals [48, 69, 151, 151,
151, 151, 151, 152]. Two pure-read recorders on the same villages produce
identical trajectories; the recorder neutrality the prereg designed for holds.

## Balanced panel (§15) — OFF→VRE contrast

`scripts/balance-panel.js compare` on the OFF→VRE panels; decision
**review_required**. The panel is the instrument, NOT the judge (the frozen
bars above are); this contrast measures the vetreengage bundle, not a lever
under test.

| Metric | Before (OFF) | After (VRE) | Delta | Status |
| --- | --- | --- | --- | --- |
| Survival to day 60 | 0.875 | 1.0 | +0.125 | no_material_signal |
| Village deaths per run | 57.5 | 64.625 | +7.125 | regression_watch |
| Village deaths per 100 days | 50.12 | 51.10 | +0.98 | regression_watch |
| Community loss | 0.25 | 0.5 | +0.25 | regression_watch |

The seed call buys a funnel (0 → 12 instances, 0 → 3 launches) and pays for
it in deaths (+57 village deaths band-wide, starvation 3 → 5). The deaths
are the expedition-death price the seedland arm already named — launches
send pairs out, and pairs die out there. Nothing in the panel overturns the
DIAG verdict; it is reported as the bundle's cost, not hidden.

## Sense-testing (SENSE-TESTING LAW)

The one launched-party meeting end to end — seed 103416, day 60, Sofia Chen's
party meets The Eulogy (gate `null`, trick unknown, party of 3, all armed and
armored). The fight log, verbatim:

> Sofia walks straight into The Eulogy. No avoiding it.
> R1: Sofia strikes for 24 (885 left) — Sofia's gear absorbs 24. — R1: Final Chapter hits Sofia for 29 (50 left)
> R2: Sofia stops mid-fight and binds the wound — field medicine, +20 HP. — Sofia's gear absorbs 27. — R2: Final Chapter hits Sofia for 34 (36 left)
> Sofia is losing — shouts for help! Esther charges in!
> R3: Sofia strikes for 25 (860 left) — R3: Esther strikes for 28 (832 left) — Sofia's gear absorbs 28. — R3: Final Chapter hits Sofia for 34 (2 left)
> Sofia sees how this ends — and runs while running still works.

That reads like a real fight: a party that sought a named beast, found it, hurt
it a little (77 of ~909), got mauled, called for help, and ran at 2 HP. The
gate said nothing (`null`) about a party of three that was, on paper, ready.
The damage number is the story: a launched party that does meet its target
still cannot dent a wave-4 monster.

`vetSays` lines on the band are voiced and specific where they are authored
— teaching moments read well ("Ella has been asking about the strange leaves
all week — 'but what IS it?' Tonight, an answer. Fireside lesson: Owen passes
around European Elder.") — but the combat beats repeat by template: the
door-defense line ("Scott, Edson and Wyatt met them at the door — 3 put down.
Scott, Edson, Wyatt are hurt.") recurs with only names and counts swapped,
and the SYSTEM veteran-kill call ("Oh — OH. Everybody saw that, right? Scott
just put down The Terms of Service... on CAMERA. That's a veteran kill, folks.
REMEMBER the name.") fires verbatim with only the monster's name changed,
six times on one seed. Repetition, not incoherence — but a player watching the
door would hear the same sentence every fight.

## Metric review

- The frozen bars judged the census as designed; no re-scoring. The D3 drift
  definition (first-lever-day = first world-tick seed row, falling back to
  first companion-2 depart) held: every seed diverges on/after its
  first-lever-day, no pre-lever drift.
- Join-rule edge, recorded not hidden: devon_okafor met the eulogy wild on
  d77, the day *before* his first launch (d78). The frozen window
  [launchDay, closeDay] excludes it, so the instance counts
  launched-no-meeting. The meeting happened; the launched party never
  re-met the target. A looser window (seed-day start) would call this
  fought-no-kill instead — the bucket counts would move 2/1, the binding
  stage would not.
- The OFF leg's pool census reads 0 scored dawns: the pool distribution is
  computed over plan-holder dawns, and with 0 instances there are no plan
  holders to census. That is a recorder-shape fact, not a missing population
  — the vre leg's 87 dawns are the pool number.
- Skip-reason footnote: 2 `night` skips on the vre leg (one is sofia_chen's
  d51 part-2 commit, blocked at the night tick — the sibling arm
  sim-part2night-a quantifies exactly that loss on pure master).

## Adoption note (run fleshout-20261117T1415Z)

The 1215Z coordinator died after the worker had run the sweep, analyzed, and
written `launchfunnel-a-analysis.json` (last write 14:35Z) but before the
balanced panel and this evidence file. Adoption verified, not re-ran, the
judged numbers: proof test re-run 44/44 green on the worktree tip; analyzer
re-run reproduces `launchfunnel-a-analysis.json` byte-identical; D3 drift
check re-run CLEAN on all 8 seeds (exit 0); the panel builder + compare were
run by the adoption (the worker's only missing bar-5 artifact). No corpus
file was overwritten; no number in this file differs from the worker's
analysis. Committed by adoption under `scripts/safe-commit.sh`.

## Findings (appended to `hidden_files/sim-findings.md`)

- The funnel's binding stage is the dawn bid via an empty companion pool
  (candidate-not-bid 8/12, no-companion-party 7; 81/87 scored dawns with zero
  eligible companions). Any arm that wants more launches must fill the pool
  or lower the bid's party requirement — the gate, the profile, and the
  launch itself are not the leak (0 bid-not-selected, 0 selected-blocked).
- A launched party that meets its target deals ~8.5% of a wave-4 monster's
  HP and flees at 2 HP. Even if the pool were full, the damage wall stands
  behind it.
- On master default the funnel does not exist (0 instances in 8 villages):
  the seed call is the only thing planting wave-4 plans. A trick lever, a
  gate lever, or a pool lever measured on master default measures nothing.

## Next blanks (in order)

1. The companion pool: why 93% of scored dawns have zero eligible
   companions (away 241 / notRanger 198 first-fails) — is the pool empty
   because rangers are out, or because the bid's eligibility is too narrow?
2. The damage wall behind the funnel: a launched party meeting its target
   deals 8.5% and flees. (The launch decision and damage are the two walls
   the 07:37 CST delivery named; this census pins the first, the fight log
   prices the second.)
3. The d77/d78 edge: a holder meets the target wild, flees, launches next
   day, never re-meets. Holder survival through the launch window / target
   re-encounter (finding from sim-seedland-b) is still the open question
   behind launched-no-meeting.
