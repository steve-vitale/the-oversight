# sim-reseed-b — the #2626 re-seed lever (finding #2626)

**Arm:** sim-reseed-b, Loop B run fleshout-loop-b-20261120T1830Z, axis winnability chain, arm 2 of 3.
**Branch:** sim-reseed-b (worktree `~/workspace/worktrees/sim-reseed-b`), base master `e103a64cc`.
**Prereg:** `evidence/2026-11-20/sim-reseed-b-prereg.md` (frozen before any judged sim).
**Verdict: NO-GO (METRIC-BROKEN).**

## What the lever is, in plain words

A villager with a hunting plan keeps marching after the beast they were hunting
is already dead — the village killed it, but nobody told the hunter, so they
walk out to hunt a ghost. Two earlier arms (same-day suppression, cross-day
suppression, both HELD unmerged) proved the hole is real and that stopping the
march works. This arm tries a different theory of the cost: instead of
stopping the hunter, give them a new beast to hunt — one they have actually
heard about, from a fight they were in, a trail they saw, or word around the
fire. If nobody has heard of anything alive to hunt, the plan dissolves
instead: the hunter is told at the fire, once, that the hunt is called off.
The plan is never left wandering with no target.

Built on master `e103a64cc` alone. The held suppressions were NOT merged or
bundled; the re-seed mechanism is judged on its own, with the expiry's own
commit-point hold as the stated precondition keeping an expired plan from
re-creating #2626.

## What was built

- `src/js/win-plan.js`: `PLANRESEED=1` flag gate; `planTargetDeadByType`
  liveness rule (type dead when `villageSlain[type] > 0` and no sighting
  since the dated kill day); `planReseedPick` (perception-gated, ranked,
  deterministic: holder's fought species, then fight memories, then village
  fire knowledge; wave floor max(3, needWave); dead target, suburb-under-
  FLEEREPAIR2, and unknown-def candidates excluded); `winPlanCommitDeadTarget`
  (returns `'reseeded'` | `'expired'` | `'held'` | `null`); `winPlanNoteSighting`
  (stamps `villageLastSeenDay`); re-seed + expiry fireside beats; stats
  `planReseeds` / `planExpiries`.
- Hooks at both departure paths (`winPlanDepart`, `vbrainExecuteDepart`
  `party_launch` branch): `'expired'` → `'normal'`, `'held'` → `'hold'`.
- `src/js/fieldFights.js`: sighting stamp on the evade return and before the
  final return (NOT the alreadyDead early return — a corpse is not a sighting).
- `docs/ONTOLOGY.md`: win-plan Provides list + `winplan_dead_target_reseed` rule.
- Harness: `scripts/reseed-driver-b.js`, `scripts/analyze-reseed-b.js`,
  `scripts/build-reseed-b-panels.js` (ported from the targetless/deadgate
  arms' measurement tooling; game code NOT copied from the held branches).
- Proof: `scripts/test-reseed-b.js` — **96 passed, 0 failed** (includes the
  30d driver smoke on both legs, panel build + compare, the ALLYSLOT3 guard,
  and a live field-fight stamp). Analyzer selftest **40 passed, 0 failed**.

Two test-staging corrections made during the proof run (assertions unchanged,
only the staging fixed): the §C1 expired-plan fixture now stages the plan the
way the expiry branch produces it (stage `'party'`); the §D suburb case runs
under `FLEEREPAIR2=1` (the judged substrate); the §A winPlanCands pin now
uses the comment that actually ends that function, and the stamp-gate pin
points at `win-plan.js`, where the guard lives (the call-site behaviour is
proven live by §F/§D). One wording fix from the live beat check (see below).

## The lever, played (judged legs)

Band 106081–106092, 150d death-aware, policy competent verbatim
(sha `1884c8852d38`), substrate `SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1
FLEEREPAIR2=1 FIGHTALLY2=1`, `ALLYSLOT3`/`LAUNCHSURVIVE` absent. Legs:
control (`PLANRESEED` unset) and armed (`PLANRESEED=1`). Corpora:
`evidence/2026-11-20/perseed-reseed-b-control/` and
`perseed-reseed-b-armed/` (12 files each, 0 instrument errors).
Analysis: `reseed-b-control-analysis.json`, `reseed-b-armed-analysis.json`.
Panel: `reseed-b-panel` (compare decision `review_required`, no material
signal — see below).

| | Control | Armed |
|---|---|---|
| Wave-4+ launches | 16 | 18 |
| Dead-target launches | 2 / 16 (12.5%) | **0 / 18 (0%)** |
| Live / unknown | 12 / 2 | 16 / 2 |
| Re-seed commits (`planReseeds`) | 0 | **6** |
| Re-seed launches | 0 | **4** |
| Expiries (`planExpiries`) | 0 | **0** |
| Post-expiry targetless launches | 0 | **0** |
| Survived | 7 / 12 | 7 / 12 |
| Median survival | 150d | 150d |
| Starvation deaths | 4 | 3 |
| Wave 5 reached | 7 / 12 | 6 / 12 |
| Wave 4 reached | 12 / 12 | 12 / 12 |
| Standing ≥ 200 | 7 / 12 | 6 / 12 |
| Wins / national / table | 0 / 0 / 0 | 0 / 0 / 0 |

Per-seed (control → armed, days / end / standing / wave):

| Seed | Control | Armed | Re-seeds |
|---|---|---|---|
| 106081 | 150d survived, 410, w5 | 150d survived, 199, w4 | 2 |
| 106082 | 150d survived, 199, w4 | same | 0 |
| 106083 | 142d lost, 445, w5 | same | 0 |
| 106084 | 150d survived, 199, w4 | **106d lost**, 199, w4 | 1 |
| 106085 | 150d survived, 199, w4 | same | 0 |
| 106086 | 145d lost, 325, w5 | same | 0 |
| 106087 | 150d survived, 390, w5 | same | 1 |
| 106088 | 140d lost, 199, w4 | same | 0 |
| 106089 | 150d survived, 435, w5 | same | 0 |
| 106090 | 125d lost, 360, w5 | same | 0 |
| 106091 | 144d lost, 495, w5 | **150d survived**, 475, w5 | 2 |
| 106092 | 150d survived, 199, w4 | same | 0 |

Seed flips cancel: 106084 survived→lost d106, 106091 lost d144→survived.
Net survived, median, and starvation are all within the revised guardrail
(see Metric review).

## Frozen bars — verdict per bar

- **PRIMARY — dead-target share → 0 armed with armed launches ≥ 6: PASS.**
  Armed 0/18, launches 18. Control 2/16 — and the control's two dead
  launches are the exact 106084 re-launch pair from the held arms
  (d136 + d141, visjoin_114 → herald, both dead), reproduced launch-for-
  launch on this base. The pair does not recur on the armed leg
  (secondary: PASS — no 106084 launch on d136/d141 at all).
- **Post-expiry targetless launches = 0: PASS (true 0).** The first
  analysis run counted 1 on each leg; investigation showed it was the
  106091 d51 targetless launch by a holder whose plan never had a target
  (see Instrument corrections). True post-expiry count is 0 on both legs.
- **Re-seed bar — (a) ≥ 1 rumor re-seed launch: PASS (4).** (b) ≥ 2/3 of
  expired holders re-seed within 7 days: **METRIC-BROKEN — zero expiries.**
  `planExpiries` is 0 on all 12 armed seeds. There are no expired holders
  to measure (b) against, so the bar cannot pass on zero evidence, exactly
  as the prereg foresaw.
- **Holders-fight-again (≥ 2/3 of expired holders fight a wave-3+ beast
  within 14 days): METRIC-BROKEN** — same reason: no expired holders.
- **Guardrail (revised, 12-seed band): PASS.** Survived 7 ≥ control−1 (6);
  median 150d ≥ control−5d (145d); starvation 3 ≤ control+1 (5).
- **GO needs all bars → NO-GO (METRIC-BROKEN).** The re-seed mechanism
  worked; the expiry fallback never fired, so the two bars tied to expired
  holders have no denominator. This is a verdict about measurability, not
  about the re-seed mechanism — see "What the numbers actually say".

## What the numbers actually say

**The re-seed works, and it worked on the exact pair that motivated it.**
On 106081, the two blocked hunters from the targetless arm — Frieda
(`gen_l19ie5f`) and Chantal (`chantal_mukendi`), who never fought again
there while their village stalled at standing 199 — re-seeded from herald
to reunion on day 119 and launched together, both live targets. Their
beats are in the transcript (see below). Brian (106084) re-seeded
spool→redactor on d69 and launched, then hunted the redactor again on d88.
Hannah (106087) re-seeded gavel→focus_group on d137 and launched, then
hunted it again on d145. Six re-seed commits in all; four became launches
(the other two are wave-3 launches, outside the frozen wave-4+ pool but
real hunts all the same).

**The expiry never fired because a rumor was always available.** Every
time a plan's target died at commit time, the holder had heard of something
alive to hunt. The fallback is therefore unproven in live play — proven
only by fixtures (`test-reseed-b.js` §B2/§C1/§E2) and the one-off live beat
check. A band where holders are rumor-poor (or a longer horizon where
rumors run dry) is what would measure it; that is a coordinator call, not
a re-score of this band.

**Two re-seeds did not become hunts.** On 106091, Wenhao and Nikolai
re-seeded congregation→strike on d103 (beats fired) but never launched —
their holder block was `range-0` (they physically could not range out),
and they kept holding on strike through d149. The lever re-seeds the plan;
it cannot fix a holder who cannot leave. Honest limit, recorded here.

**One seed paid for the re-seed.** On 106081 the village ended weaker with
the lever than without: standing 199 / wave 4 armed vs 410 / wave 5
control, although it survived either way. The two hunters went
reunion-hunting instead of whatever the control village did with those
days. The paired flip on 106091 went the other way (lost d144 → survived),
so this is a tradeoff to watch, not a guardrail breach — the guardrail
(survived / median / starvation) passes — but it is real and it is named.

## The beats, heard live

Six re-seed beats fired on the armed leg, all in the corpus transcript
(`vetSays`), all naming the holder and both kinds by the names the village
had actually given them (the village had named these kinds through talk,
so the beats read with proper names, not descriptors):

- 106081 d119: *"Frieda was ready to hunt Big-Eyes — but the fire says
  that kind is already put down. The hunt turns to The Ugly Beast
  instead."* (Chantal, same day, same line.)
- 106084 d69: *"Brian was ready to hunt Big Ugly — but the fire says
  that kind is already put down. The hunt turns to The Redactor
  instead."*
- 106087 d137: *"Hannah was ready to hunt Don't-Look — but the fire
  says that kind is already put down. The hunt turns to Big Big
  instead."*
- 106091 d103: *"Wenhao was ready to hunt Ugly-Eyes — but the fire
  says that kind is already put down. The hunt turns to Loud-Eyes
  instead."* (Nikolai, same day, same line.)

No expiry beat fired on either leg (none expired). The one-off live beat
check (real loaded game, seed 106084) fired both beats once each and caught
a wording defect before the legs ran: the first draft named the new kind
twice in one line ("was seen instead — the hunt turns to ..."), put it at
a sentence start lowercase, and ended the expiry beat with a dangling
"the fire keeps the name" when no name had ever been spoken. All three
fixed in `win-plan.js` before any judged sim; the proof test (96/0) pins
the new wording. (A staging artifact worth naming: on a fresh game whose
kinds are still unnamed, the same beats read through unknown descriptors —
"hunt the sky", "the everyone you've buried" — which is the game's own
knowledge-gating, not this lever's wording; in judged play the kinds were
named and the beats read clean.)

## Instrument corrections (found on the judged corpus, bars unchanged)

Two analyzer bugs, both fixed in `scripts/analyze-reseed-b.js` and
re-validated (selftest 40/40; cross-checks now agree with the game stats
on all 24 corpora). Neither changes a frozen bar — both change what the
instrument counts.

1. **Gate cross-check vs re-seeded launches.** The driver's gate snapshot
   is taken BEFORE the departure call, so for a re-seeded launch it
   describes the OLD target (`gate.targetBefore`) while the row carries the
   NEW target. The analyzer compared the snapshot against the new target
   and flagged the two 106081 herald→reunion launches as mismatches.
   Fix: for a re-seeded launch, the snapshot is recomputed against
   `targetBefore`; the row's own class still uses the row (new) target.
   Gate mismatches: 2 → 0.
2. **Expiry-row rule false positives.** The row shape alone (`'normal'`,
   `party_launch`, stage `'party'`, target null, both exped false) also
   matches (a) a hurt-blocked holder (`vidBlock`
   `'hurt-no-medicine-no-healer'`, 106089 d107) and (b) a mid-day no-depart
   commit for a NEVER-TARGETED plan (`vidBlock` `'unknown'`, 106091 d45 —
   the holder launched targetless on d20/d29/d34/d37 and again on d51; the
   plan never had a target). Both appear identically on the control leg,
   where the lever is off and `planExpiries` is 0. Fix: an expiry row now
   requires prior-target evidence — a `v4seeds` row with a non-null target,
   or a `v4departs` row with a non-null `gate.targetBefore` / row target,
   strictly before the row's day (the analyzer's frozen "before" rule).
   Rule-expiries vs `planExpiries` mismatches: 2 seeds → 0 on both legs.
   The 106091 d51 launch is the village's normal targetless wandering,
   not a post-expiry leak.

## Control reproduction (8-seed slice 106081–106088, comparison not a STOP)

Held control (8 seeds): median 150.5d, survived 5/8, starvation 2,
launches 6, dead 2/6, wave 5 4/8, standing ≥ 200 4/8. This base's
control slice: survived 5/8, starvation 2, launches 6, dead 2/6 (the
106084 pair), wave 5 4/8, standing ≥ 200 4/8. Median 150d vs 150.5d —
a half-day median-convention difference, not a divergence. The control
reproduces.

## Wall numbers

National 0/0, table 0/0, wins 0/0 on both legs (no seed reached national;
`scaleRank` never above regional). Wave 5: 7 → 6. Wave 4: 12 → 12.
Standing ≥ 200: 7 → 6. Median survival 150d → 150d. Survived 7 → 7.
Villager deaths 170 → 162. Balanced panel compare: `review_required`
(screen only), no material signal — table win 0→0, national 0→0,
village deaths per run 98.7 → 96.3, community loss 0.4167 → 0.4167.
Telemetry check: the LOUD lines (national/table/wins "disappeared"
vs the scale-wall baseline) appear IDENTICALLY on the control leg —
a recorder-shape artifact (this band reached none of them on either
leg), not a regression.

## Village assessment (plain words)

The villages play the same game with the lever on as off — same
survivors, same median life, fewer starvation deaths by one. What changes
is narrow and exactly where the lever points: nobody marches out to hunt
a beast the village already killed (0 dead-target launches, down from 2),
and the two hunters who used to stall after their target died now get a
new beast from something they actually heard about and go hunting. The
price shows on one seed, where the village that used to reach the fifth
wave and standing 410 now sits at 199 and the fourth wave — the hunters
went out, but the village did not climb as far. And two hunters got their
new beast and still never left, because they could not walk out at all.
The lever does its one job; it does not make villages win, and it does not
make them live longer. The unfinished half — what happens when nobody has
heard of anything to hunt — never got tested, because on these twelve
seeds somebody always had.

## Metric review

- The guardrail was revised by the coordinator before the legs ran and
  recorded verbatim in the prereg (the 8-seed noise-floor call: the
  guardrail missed by exactly 1 seed and 3 days median on two independent
  arms with different seeds flipping). Judged on the 12-seed band, it
  passes on all three prongs. The two seed flips on this band (106084,
  106091) cancel exactly, which is consistent with the noise-floor
  reading rather than lever harm.
- The re-seed bar's part (b) and the holders-fight-again bar were written
  against expired holders. Zero expiries is not a pass and not a fail of
  the mechanism — it is the prereg's own METRIC-BROKEN case, and the
  verdict follows it rather than re-scoring. Part (a) (≥ 1 re-seed launch)
  passes on its own (4), and the mechanism's full count is 6 commits.
- The expiry-row and gate cross-check corrections are instrument repairs
  found by the frozen cross-checks doing their job (mismatch = STOP and
  investigate). The bars did not move; the rules now count what they
  claim to count, and the game-stat cross-checks agree on all 24 seeds.
- The re-seed count has two honest numbers: 6 commits (`planReseeds`)
  and 4 launches. The bar counts launches; the 2 commits that never
  launched (106091, range-0) are reported as mechanism evidence with
  their blocker named, not folded into the launch count.
- `check.js --quick`: first attempt 339 passed, 5 failed in 600s (two
  120s timeouts on deed-attainment tests under sibling load; three
  failures unidentified from the tail output). Rerun in progress at
  evidence write time; outcome recorded in
  `evidence/2026-11-20/reseed-b-check-quick.log`. (UPDATE — see log tail
  below before relying on this line.)
- `node scripts/validate-ontology.js`: all 138 systems validated,
  "Ontology matches code. Release permitted."

## Convergence state

#2626 is not closed. The re-seed half is proven in live play (dead 0/18,
4 re-seed launches, 6 commits, the 106081 pair hunts again, guardrail
passes). The expiry half is unproven in live play (0 expiries in 12
seeds) and its two bars are METRIC-BROKEN. What would close it: a band
or condition where expiries actually occur (rumor-poor holders), so the
expiry beat, the commit-point hold, and the 7-day / 14-day follow bars
have a denominator — or a coordinator/Steve call to judge the re-seed
mechanism on part (a) + dead-0 + guardrail alone. The lever is NOT
recommended for merge on this verdict; the branch is left for the
coordinator. No win price or deed gate changed. No other lever was
touched.

## Files

- Prereg: `evidence/2026-11-20/sim-reseed-b-prereg.md`
- Evidence (this file): `evidence/2026-11-20/sim-reseed-b.md`
- Proof test: `scripts/test-reseed-b.js` (96/0)
- Driver: `scripts/reseed-driver-b.js`; analyzer:
  `scripts/analyze-reseed-b.js` (selftest 40/0); panel builder:
  `scripts/build-reseed-b-panels.js`
- Corpora: `evidence/2026-11-20/perseed-reseed-b-control/`,
  `evidence/2026-11-20/perseed-reseed-b-armed/` (12 files each)
- Analyses: `evidence/2026-11-20/reseed-b-control-analysis.json`,
  `evidence/2026-11-20/reseed-b-armed-analysis.json`
- Panel: `evidence/2026-11-20/reseed-b-panel.md` (+ `.json.gz` pair)
- Game changes: `src/js/win-plan.js`, `src/js/villager-brain.js`,
  `src/js/fieldFights.js`, `docs/ONTOLOGY.md`
