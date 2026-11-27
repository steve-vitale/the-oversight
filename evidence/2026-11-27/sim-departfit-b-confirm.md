# sim-departfit-b — CONFIRM: departure-fitness check replicates (16 seeds)

## 1. Verdict — GO (confirm, frozen bars B1–B5 all pass)

The pilot GO replicates on the fresh 16-seed extension band
111401–111416: launched parties depart with loaded bows (post-load
loaded share 278/279 = **99.6%**, baseline 220/261 = 84.3%),
launch count holds well inside the guardrail (295 vs 307 = **0.96**),
median survival is a touch better (151d vs 150d), no death-cause
share moves more than 1.6pp, and the instrument is clean with
determinism verified per leg. The arm verdict stands **GO**.

The confirm sharpens the pilot's named cost rather than hiding it:
the unbounded hold still strands ammo-starved villages — on 111404
it is the difference between a village that survives to wave 5 with
standing 585 and one that dies on day 78 while held (68 no-ammo
holds). The aggregate bars pass because the hold also saves villages
(111406: dead day 114 on baseline, survives 150d to wave 5 on the
arm). The softer hold named in the pilot remains the next arm; this
confirm lands the check as built, it does not claim the hold is
finished.

## 2. Prereg (frozen, no amendments)

Confirm prereg:
`evidence/2026-11-27/sim-departfit-b-confirm-prereg.md` (frozen
before any judged confirm sim; committed 7aea20f5f). Seeds
111401–111416, competent verbatim, 150d death-aware, no env flags.
Paired legs on identical seeds: BASELINE = pre-lever master
(instrument only), CONFIRM = + departure-fitness check. The lever
code is unchanged since the pilot (HEAD bece5f46f at prereg freeze;
no game-code change between pilot and confirm).

Continuation note (this run): the 1930Z run timed out mid-confirm
after the ctl leg finished (16/16 files on disk, uncommitted, last
write 21:41:48Z; no live process). The continuation verified no
writer was live (mtimes frozen over 2+ min, no node processes),
verified the ctl corpus parses, committed it (e9ff52a2e), restored
the lever (`git checkout HEAD -- src/js/villager-brain.js`, hash
2096213e… matches HEAD), re-checked band freshness (no other
`.md` under `evidence/` names 111401–111416), then ran the arm leg
on identical seeds with the pilot's unchanged instrument / driver /
analyzer / panel builder. Nothing in the prereg was re-frozen or
edited.

## 3. Method

- Lever (`src/js/villager-brain.js`, 5a288c977, unchanged):
  `Game.winPlanDepartFitness(vid, members)` — per launch member,
  gear up if unarmed and pocket ammo if a volley carrier is dry,
  then re-read; still unarmed or still dry → hold with the voiced
  'no-ammo' line. No HP gate anywhere. Members: holder + commit
  companions only.
- Instrument / driver / analyzer / panel builder: the pilot's
  (`scripts/departfit-b-instrument.js`,
  `scripts/departfit-driver-b.js`, `scripts/analyze-departfit-b.js`,
  `scripts/build-departfit-panels-b.js`), unchanged.
- CTL leg: pre-lever `src/js/villager-brain.js` from daf148c13
  swapped in, arm leg on current HEAD, lever restored and hash
  verified after each swap.
- Proof: `scripts/test-departfit-b.js` — 14/14 PASS on the pilot
  (lever + instrument unchanged since; no re-run needed for
  unchanged code — the confirm's own determinism reruns are the
  live proof instead, see B5).

## 4. Results (judged only against the frozen bars)

| Bar | Result |
|---|---|
| B1 post-load loaded share ≥ 0.80 (arm launches) | **PASS** — 278/279 = 0.996 (baseline post-load 220/261 = 0.843; arm pre-load 247/279 = 0.885) |
| B2 launches within ±25% of baseline | **PASS** — 295 vs 307 = 0.961 |
| B3 median survival not worse by > 10d | **PASS** — 151d vs 150d (+1d) |
| B4 no death-cause share moves > 15pp | **PASS** — worst 'the wild' 8.5% → 6.9% (1.6pp); deaths 1596 vs 1450 |
| B5 0 instrument errors; determinism byte-identical | **PASS** — 0 errors both legs; seed 111401 re-run per leg: arm byte-identical except the `run` label; ctl identical except the `run` label + `anchorCommit` (commits landed between legs; all sim output identical) |

## 5. The distributions

**Loaded share (launches):** baseline pre-load 196/261 = 75.1%,
post-load 220/261 = 84.3% — the departure loaders lift the share
~9 points on this band (vs ~6 on the pilot band). This band's
villages are better stocked than the pilot's (baseline 84.3% vs
53.3%), so the famine is band-dependent; the check still lifts the
share to 99.6%. Arm pre-load 247/279 = 88.5%, post-load 278/279 =
99.6%. The single carrier that still reads dry on the arm leg is
NOT a check miss: Marco Jackson (seed 111415, day 29, crude bow,
0 arrows) is stamped with role `party` — a `plan.party` member who
is neither the holder (gen_n6lp0g1) nor the commit companion
(quinn_murphy). The launch code only starts expeditions for the
holder + commit companions, while the instrument stamps holder +
`plan.party` + commit companions, so the instrument carries a stale
`plan.party` entry into the stamp and the check never sees him.
On the launch's own member set the share is 278/278. The
instrument's member list should still be tightened to the launched
set in a follow-up (pilot §5, still open).

Armed share (post) median 1.0 both legs (arm min 0.67 on one
launch; ctl min 0.5). HP (post) median 87 arm vs 85 ctl, share
< 50 HP 6.1% vs 8.3% — the check does not gate HP and the HP shape
doesn't move.

**Per-seed (ctl L/H → arm L/H; arm check checked / loadedByCheck / heldNoAmmo):**

| Seed | ctl L/H | arm L/H | arm check | story |
|---|---|---|---|---|
| 111401 | 25 / 5 | 15 / 18 | 20 / 0 / 5 | holds cost 10 launches; village survives either way |
| 111402 | 18 / 2 | 24 / 41 | 64 / 3 / 40 | hold loop: wave 5 → wave 4, standing 490 → 199 |
| 111403 | 11 / 3 | 11 / 3 | 13 / 0 / 0 | check fires, changes nothing; village-lost d92 both legs |
| 111404 | 34 / 3 | 23 / 72 | 91 / 4 / 68 | worst cost: survives 150d wave 5 st 585 → dies d78 held, st 195 |
| 111405 | 23 / 5 | 23 / 5 | 25 / 0 / 0 | identical; village-lost d120 both legs |
| 111406 | 47 / 0 | 32 / 1 | 32 / 3 / 1 | SAVED: dies d114 wave 4 → survives 150d wave 5 st 295 |
| 111407 | 8 / 0 | 8 / 0 | 8 / 3 / 0 | identical; village-lost d144 both legs |
| 111408 | 21 / 0 | 16 / 3 | 18 / 1 / 2 | wave 4 → wave 5, st 199 → 450 |
| 111409 | 0 / 9 | 0 / 9 | never fired | no party_launch ever bids; identical |
| 111410 | 6 / 2 | 6 / 2 | 5 / 0 / 0 | identical |
| 111411 | 13 / 1 | 28 / 1 | 28 / 5 / 0 | launches more than double; wave 5, st 275 → 370 |
| 111412 | 30 / 12 | 34 / 15 | 47 / 3 / 11 | wave 4 → wave 5, st 199 → 485 |
| 111413 | 15 / 3 | 15 / 3 | 15 / 0 / 0 | identical |
| 111414 | 13 / 4 | 14 / 11 | 21 / 1 / 6 | wave 5 both; st 410 → 585 |
| 111415 | 20 / 4 | 13 / 15 | 22 / 4 / 9 | wave 5 → wave 4, st 270 → 199; the dry Marco row lives here |
| 111416 | 23 / 0 | 33 / 3 | 36 / 6 / 3 | wave 4 → wave 5, st 199 → 575 |

**The hold loop, plainly (confirm band):** 145 no-ammo holds
total (vs 1,100 on the pilot's 8 seeds) — smaller on this band,
but concentrated: 111404 (68) + 111402 (40) = 108 of 145. A held
launch re-bids on every agency tick, so a stranded village spins
the check dozens of times; the voice dedups to once per
holder-day, so the player hears the hold once a day. The check
loads 33 carriers where ammo exists (loadedByCheck) and holds
where it does not. The cost is real on two seeds and the benefit
is real on three (111406 saved, 111411/111416/111412 unlock more)
— the aggregate bars pass, but the per-seed story is bimodal,
same shape as the pilot.

**Double-craft interaction:** `ammo_craft` attempts 577 arm vs
505 ctl (+72; ok 339 vs 313). Larger than the pilot's +3: on this
better-stocked band the check's earlier pocket attempt does buy
extra crafts where materials exist. `weapon_craft` 121 vs 137
(−16). No bar covers this; it is reported, not judged.

## 6. Sense-test

Same line, same reading as the pilot: a village that cannot arm
its bows waits visibly and says so once a day, instead of walking
out dry. The stranded villages (111402, 111404) are the honest
cost — they survive (111402) or die (111404) with their win plan
sitting at Haven because no arrows can be found, and the hold
counts say so in the corpus. The sim corpus does not retain
spoken lines (quietLog); the line itself is proven by the
fixture test (14/14), not by a corpus grep.

## 7. Wall numbers (both legs — competent verbatim, 150d, 16 seeds)

| | ctl | arm |
|---|---|---|
| Wins | 0/16 | 0/16 |
| National | 0/16 | 0/16 |
| Table (waiting-or-done flag) | 16/16 | 16/16 |
| Wave-4 unlocked | 16/16 | 16/16 |
| Wave-5 unlocked | 7/16 | 8/16 |
| Median survival | 150d | 151d |
| Deaths | 1596 | 1450 |

The wall doesn't move: no village reaches national, none wins,
on either leg. The check fixes departure loadout, not the scale
on-ramp. Wave-5 unlocks tick up one seed (8 vs 7) and deaths fall
146 — both inside noise on 16 seeds; the panel agrees (below).

Panel (§15): `node scripts/balance-panel.js compare` →
decision `review_required`; no material signal on any metric
(table sitting 1 → 1, national 0 → 0, wins 0 → 0, community
loss 0.375 → 0.3125 with the interval covering 0, village deaths
99.75 → 90.625 per run with the interval covering 0). The panel
confirms the legs are the same villages; the frozen bars are the
judge.

Telemetry deviation check: the default invocation REFUSES this
corpus by design (recorder-corpus guard: per-seed files carry
top-level `anchorCommit`; the 2026-10-25 audit rule says recorder
corpora are never compared against run baselines). With
`--sweep-rows --allow-recorder-corpus` it reproduces the
launchfit artifact exactly: LOUD national 12 → 0 and wins 16 →
0, table 16/16 quiet. Per the baseline's own `_regime` note this
is the documented regime artifact (baseline = win-seat full-stack
regime, 16/16 wins; this band = competent verbatim with no seat
stack, wins structurally ~0). No investigation item.

## 8. Blanks filled / documented, and metric review

**Filled (landed in this arm, confirmed):** the departure-fitness
check — armed + loaded before launch, in the brain departure
path, voiced, no HP gate. The confirm proves the pilot GO was
not a band artifact: on a fresh, better-stocked band the share
still lifts (84.3% → 99.6%) with launches, survival, and deaths
all inside their guardrails.

**Documented (not fixed here):**
- The unbounded hold strands ammo-starved villages (111404 dies
  held; 111402 loses a wave-5 unlock). Next arm (named in the
  pilot prereg, still open): the softer hold — hold only when ALL
  ranged carriers are dry, or hold N days then launch anyway.
- The held launch re-bids every agency tick (~6 checks/day while
  held). Cheap but churny; a once-per-day check is a possible
  refinement alongside the softer hold.
- The one dry carrier on the arm leg is a stale `plan.party`
  entry outside the check's member list (see §5), not a check
  miss. The instrument's member list (holder + plan.party +
  commit companions) should be tightened to the launched set in a
  follow-up; the same over-inclusion biases the baseline share
  downward.
- `ammo_craft` attempts rise +72 on the arm leg on this band
  (pilot: +3) — the check's earlier pocket attempt buys extra
  crafts where materials exist. No bar covers it; worth watching
  on the softer-hold arm.

**Metric review (frozen bars NOT re-scored):** B1's denominator
is selected launches (pilot §8, still true) — a holding lever's
share always flatters itself; the launch-count bar is the
counterweight and it passed with margin here (0.96 vs the 0.75
floor). B2's aggregate threshold masks a bimodal per-seed story
again (two villages stranded, one saved, three gain) — the
aggregate is the frozen judge and it passed, but per-seed hold
counts belong in the evidence for any hold lever (they are here).
The baseline post-load share moved 53.3% → 84.3% between bands,
so the famine's size is band-dependent while the check's lift is
not. The telemetry-check prescription needs a fix for recorder
corpora (default invocation refuses; the allowed invocation
reproduces a known regime artifact) — future preregs should name
the panel compare as the §15 artifact and the telemetry check as
the regime-artifact read, not a live investigation trigger.

## 9. Closeout state

- Branch `sim-departfit-b`. Commits this run: confirm ctl corpus
  e9ff52a2e, confirm arm corpus ed9bb8346. (The safe-commit index
  clobber struck on both commits — repaired each time via the
  ls-tree/update-index route; every commit verified correct, tree
  clean.)
- **Verdict for the coordinator: GO (confirm).** The arm verdict
  stands GO: B1–B5 all pass on the fresh 16-seed band. The game
  code STAYS (killed arms leave no trace; this one lives).
  **Ready to merge, pending ship.** Do NOT push, do NOT bump
  versions. The ship loop owns deploys. Master has moved since
  the branch base (Loop A fibersupply-a merged) — no rebase done;
  landing is the coordinator's call.
- Next arm (still open, from the pilot): the softer hold.

## 10. Files

- `evidence/2026-11-27/sim-departfit-b-confirm-prereg.md` (7aea20f5f, frozen)
- `evidence/2026-11-27/perseed-departfit-b-confirm-ctl/departfit-b-s11140[1-9].json`, `...-s11141[0-6].json` (e9ff52a2e)
- `evidence/2026-11-27/perseed-departfit-b-confirm-arm/departfit-b-s11140[1-9].json`, `...-s11141[0-6].json` (ed9bb8346)
- `evidence/2026-11-27/perseed-departfit-b-confirm-ctl-rerun/departfit-b-s111401.json`, `...-confirm-arm-rerun/departfit-b-s111401.json` (this commit, below)
- `evidence/2026-11-27/departfit-b-confirm-analysis.json`, `departfit-b-confirm-panel-before.json.gz`, `departfit-b-confirm-panel-after.json.gz`, `departfit-b-confirm-panel.json`, `departfit-b-confirm-panel.md` (this commit, below)
- This evidence file: `evidence/2026-11-27/sim-departfit-b-confirm.md`
- Lever: `src/js/villager-brain.js` — `winPlanDepartFitness` + call site + `holdVoice` 'no-ammo' kind (5a288c977)
