# sim-shape2-a — DRAFT-ARMED-HOLDER-AS-LEAD (shape 2)

Run `fleshout-20261121T0715Z`, Loop A, axis scale-onramp. Adoption closeout
of the timed-out 0715Z round; the pilot was run by the adoption coordinator,
not the original worker.

Finding #2628 / #2599 (shape 2 of the lead-side program): at a wave-4+
fight launch, the launch rule goes and fetches a living armed holder as the
lead, even when they are not the natural lead and not in earshot. The gun
tier beats the bow tier; the natural lead is never replaced when already
armed; the draft fires for a holder moved far from the fight.

## Prereg (frozen)

- Prereg: `e12b830c6` (+ amendment `0d0541a06`: defensive miss code
  `error` + dead-lead fallback, pre-lever). Band 107161-107168 verified
  fresh before the run (no prior prereg or forbidden band touches it).
- Lever: `Game._shape2DraftLead` (pure, zero draws) called from
  `resolveWildMonsterEncounter` (world-tick router, after the head reorder)
  and `expeditionMonster` (villager-agency.js, after the monster pick).
  Env-gated `SHAPE2=1`; unset = the old launch.
- Proof test `scripts/test-shape2-a.js` 53/53 GREEN (run by the adoption
  coordinator before the pilot), analyzer selftest 101/101.
- Substrate env (both legs): `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1
  FIGHTALLY2=1 SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1`;
  arm leg adds `SHAPE2=1`. LEND unset both legs.
- Bars (frozen): (a) villager searcaster-holder-days arm >= 40;
  (b) armed leads arm >= 2 (the discriminating bar); (c) armed volleys
  fired arm >= 1 (a FIRST volley from a drafted holder); (d) armed-holder
  entries arm >= 3; (e) SEPARATED guardrail (deaths per engaged meeting
  arm <= ctl x 1.1; median survival arm >= ctl x 0.8); starvation guardrail
  (villager starvation deaths arm <= 7).

## Run

- Lever + instrument commit: `638205b2c` (game.js +141/-11,
  villager-agency.js +14; driver/analyzer/panel builder/proof test).
- Smoke, seed 107161, both legs exit 0: ctl 91d village-lost, maxWave 4,
  v4lends 0; arm 105d village-lost, maxWave 5, v4lends 0. Corpora valid,
  draft recorder logging decisions.
- Pilot: 8 ctl + 8 arm, seeds 107161-107168, 150d, competent verbatim.
  Both legs exit 0; 8/8 corpora each; 0 instrument errors; coverage
  complete 8/8 both legs. (Seed 107161's corpora are the smoke files —
  the pilot re-ran only 107162-107168; the driver refuses to overwrite
  an existing corpus. Same anchor, same env, same driver.)
- Analyzer: `scripts/analyze-shape2-a.js --ctl
  evidence/2026-11-21/perseed-shape2-a-ctl --arm
  evidence/2026-11-21/perseed-shape2-a-arm --out
  evidence/2026-11-21/shape2-a-analysis.json` (stdout copy:
  `shape2-a-analysis-stdout.json`).
- Panel: `scripts/build-shape2-panels-a.js --out
  evidence/2026-11-21/shape2-a-panel` + `balance-panel.js compare`
  (before/after JSON.gz + `shape2-a-panel.json/.md`).

## Verdict: NO-GO on participation

| Bar | Arm | Ctl | Bar | Result |
| --- | --- | --- | --- | --- |
| (a) holder-days | 162 | 180 | >= 40 | PASS |
| (b) armed leads | 0 | 0 | >= 2 | **FAIL** |
| (c) armed volleys | 0 | 0 | >= 1 | **FAIL** |
| (d) armed-holder entries | 1 | 10 | >= 3 | **FAIL** |
| guardrail (separated) | deaths/engaged 6.22 vs 5.98 (bar <= 6.58); median 150d vs 141.5d (bar >= 113.2) | | | PASS |
| starvation | 3 vs 5 | | <= 7 | PASS |

The draft did not put an armed holder in front of a wave-4+ fight — because
the armed holder it was built for (the searcaster holder) essentially never
existed at launch time. The mechanism itself works; the pool is empty.

## What the draft did

- 866 draft decisions on the arm leg; **fired 3, all bow tier, all via
  the expedition router, all reached** (the drafted holder led the fight
  and volleyed):
  - 107161 d82 suburb: nikos_papadopoulos -> app_mgpsphlx626 (crossbow,
    3 shots / 1 hit / 20 dmg, vFlee).
  - 107162 d54 algorithm: ruby_callaghan -> meera_reddy (crossbow,
    3 shots / 2 hits / 43 dmg, vFlee).
  - 107168 d42 influencer: gen_jaorpxy -> gen_1toend6 (crude_bow,
    2 shots / 2 hits / 29 dmg, vFlee).
- **0 gun drafts fired.** Only 1 gun-tier miss was ever recorded
  (`gun:sheltered`); the gun tier was never reached because no living
  gun holder passed the filters at any wave-4+ launch decision.
- Miss reasons (863 misses): not-wave4 565, raid 156, aid 81,
  lead-already-armed 35, bow:sheltered 16, bow:low-health 3, bow:range0 1,
  no-living-holder 5, gun:sheltered 1.
- Bow leads rose 23 -> 28, bow volleys 18 -> 22 (the 3 drafted volleys
  are inside), but bow-lead kills fell 3 -> 0 and bow-lead flees rose
  13 -> 22: the drafted bow holders fled; no kill conversion.
- Armed entries COLLAPSED on the arm leg (10 -> 1) and pooled world-tick
  fights fell 221 -> 101 while tick presence stayed similar (13433 vs
  12238 ticks): the draft reshuffles which fights happen where, and the
  arm leg's natural armed entries mostly vanished with the reshuffle.
  (The stdout summary's arm `poolFights` prints 0 — a duplicate-key
  shadowing in the console object: `armPool.fights` overwrites
  `armPres.poolFights`. The saved JSON's `arm.presence.poolFights` is
  101. Not a verdict input; the judge never reads poolFights.)

## The pool is still empty

- Near-miss: unarmed launches ctl 87 / arm 78; of those, **66 on both
  legs had NO living armed holder at all** (presence 21/87 ctl, 12/78
  arm). Lendable 0 both legs. The lendpool finding repeats: ~85% of
  unarmed arm launches had no living holder to draft or lend to.
- Grants: ctl 6, arm 4 — all contest-prize, all to villagers with 0
  prior leads (buckets 1/2+ empty both legs). The gun still never
  reaches a fighter who leads.
- Holder-days look healthy (162) only because a handful of holders sit
  on the gun for weeks without fighting: 4 arm holders (sofia_chen 40d,
  ruth_goldstein 16d, henry_zhang 50d, farid_ahmed 56d with 0 cell-days).
  The gun is held, not fought with.

## Finding #2635 (gun-vanish sink census, folded in)

- Ctl: 9 sink rows — 7 unexplained (77.8%): 2 `vanish:unexplained`,
  5 `new-holder:unexplained`; 1 grant-contest-prize, 1 corpse-take.
- Arm: 5 sink rows — 4 unexplained (80.0%): 4 `new-holder:unexplained`,
  1 corpse-take; **0 vanishes** on the arm leg.
- 0 transfers, 0 holder-died, 0 dropEvents on both legs.
- #2635 stays OPEN: the census is thin (5 rows on the arm leg) and 80%
  unexplained — the gun still appears from nowhere 4 times, and no
  vanish fired on the arm leg to explain against. The draft did not
  create a cause; it only watched a smaller pool.

## Wall (arm leg, 8 seeds)

- Wins 0/8, national 0/8, table 0/8 (all 8 seeds regional).
- Wave-5 reached 3/8 (107161, 107165, 107168); wave-4 8/8.
- Median survival 150d (ctl 141.5d); community-lost 3/8 (ctl 4/8);
  villager starvation deaths 3 (ctl 5).
- Per-seed arm: 107161 105d lost, standing 225, maxWave 5;
  107162 150d survived, 199, wave 4; 107163 119d lost, 199, wave 4;
  107164 127d lost, 199, wave 4; 107165 150d survived, 300, wave 5;
  107166 150d survived, 199, wave 4; 107167 150d survived, 170, wave 4;
  107168 150d survived, 430, wave 5.
- Panel compare: `review_required` — table win 0 -> 0, national 0 -> 0,
  community loss 0.5 -> 0.375, village deaths 75.5 -> 73.875; no
  material signal on any row.

## Closeout

- **Lever revert (hash-verified).** SHAPE2 lines removed from
  `src/js/game.js` and `src/js/villager-agency.js`;
  `git diff 9070aaf70 -- src/` empty at the final tip. Own commit:
  `2464bf2e9`.
- **Post-revert proof.** `node scripts/test-shape2-a.js` after the
  revert: exit 1; 10 checks passed (fixture/setup legs that never call
  the lever), 0 FAIL lines, then FATAL TypeError:
  `Game._shape2DraftLead is not a function` at the test's first direct
  call to the removed method (test-shape2-a.js:213) — the test aborts
  instead of degrading gracefully, so there is no counted failure list;
  the abort itself is the expected signature of the removed lever.
  The lever-specific legs fail by design (the lever is gone); the rest
  stays green. Analyzer selftest 101/101 is lever-independent (it runs
  on fixtures) and stays green.
- Instrument + evidence only: the driver/analyzer/panel builder/proof
  test land (they are the measurement, not the lever); 0 src/js delta.

## Commits

- `e12b830c6` — prereg (band 107161-107168 verified fresh)
- `0d0541a06` — prereg amendment (defensive miss code + dead-lead
  fallback, pre-lever)
- `638205b2c` — SHAPE2 lever + instrument + proof test 53/53,
  analyzer selftest 101/101
- [COMMIT-LEVER-REVERT] — revert SHAPE2 from game.js +
  villager-agency.js (NO-GO participation; src/ hash-verified identical
  to base 9070aaf70)
- `c591db4a3` — instrument + evidence (corpora, analysis, panel, logs)

## Next lever

Shape 2 answers its own question and closes it: the draft works (3/3
bow drafts reached and volleyed) but the gun tier never fires because
there is no living gun holder at launch time on ~85% of unarmed
launches. The next lever is supply-side or presence-side, not another
draft shape: get a gun + cells into a living villager who actually
fights, or get a holder to the fight — the draft cannot draft what
does not exist. #2628 / #2599 stay OPEN on participation. #2635 stays
OPEN (census thin, 80% unexplained).
