# sim-feastdrive-b — the feast drive (pilot, judged)

**Arm:** sim-feastdrive-b (run fleshout-loop-b-20261107T1230Z, axis
scale-onramp / winnability chain) · **Policy-side only, zero src/js,
zero default flips, no changes to any existing policy file.** New
policy file composing the feast drive onto the FROZEN staged substrate
(`scripts/policies/competent-stageally-a.js`, unmodified).
**Prereg:** `evidence/2026-11-07/sim-feastdrive-b-prereg.md` (v2 FROZEN).
**Base:** prereg base master 2cf4d19f0; this adoption rebased onto
master 2016a7ed0 (explicit SHA read in the main tree immediately
before the rebase; 19a98e478 linkdrive + batch-ship version bump).
**Band:** 53001–53008 (deliberately reused balanced panel band).
**Horizon:** 150d death-aware. **Policies:** baseline = frozen staged
policy (diag corpus, no re-run); armed = staged + feast drive
(`scripts/policies/competent-feastdrive-b.js`, v2 frozen composition:
donate-down + feast-at-dusk).

## Adoption note

This run adopted the cancelled 1049Z run's uncommitted work: the
policy file, the proof test (35/35), the sweep-compare registration,
and the diag (8 files) + dusk (5 files) corpora. Adopted as-is and
committed as `3a94346ea` (after rebase; pre-rebase adoption commit
`f48fec375`). Nothing in the frozen composition or any frozen
threshold was changed. One measurement bug was fixed (see below):
the analyzer's starvation counter read an array as an object and
always returned 0; the fix counts the records the prereg defines.
The verdict is the same under either count, and the true counts are
reported here.

**Write flap (active today):** the first armed-leg attempt died on an
EPERM write after seeds 53001–53002, leaving a 0-byte
53003 file. The 0-byte file was deleted and seeds 53003–53008 were
re-run in a fresh process (seeds are independent; same seeds, same
policy, same code — no re-run of 53001/53002). The re-baseline leg
ran clean in one pass. No write was ever claimed on a failed exit
code.

## Verdict: GO (on the frozen primary + cost bar)

| Bar (frozen) | Baseline (diag) | Armed | Verdict |
|---|---|---|---|
| `feastSurgeUsed` ≥ 3/8 seeds | 1/8 (53005 only) | **5/8** (53004, 53005, 53006, 53007, 53008) | PASS |
| `foodDeeds` complete ≥ 2/8 seeds | 1/8 | **5/8** | PASS |
| Starvation deaths ≤ control + 2 total | 6 total [1,0,2,0,3,0,0,0] | **6 total** [1,0,2,0,2,0,0,1] | PASS (6 ≤ 8) |
| Median survival ≥ 0.8× control | 114.5d | **111d** (0.97×) | PASS |

**Primary metric GO, cost bar GO. Verdict: GO.** The drive does what
the diag said was missing: the feast surge now gets spent. But read
the secondary regression below before landing — the deed is bought
at a price the frozen bars do not price.

## Before / after (identical seeds, 150d death-aware)

| Seed | Days B/A | w4+ kills B/A | Pair days B/A | Spent B/A | Feasts (A) | Grants/draws/faced (A) | Donated kcal (A) |
|---|---|---|---|---|---|---|---|
| 53001 | 106/106 | 1/1 | 0/0 | –/– | 0 | 0/0/0 | 0 |
| 53002 | 150/143 | 1/1 | 0/0 | –/– | 0 | 0/0/0 | 1,860 |
| 53003 | 92/92 | 2/2 | 0/0 | –/– | 0 | 0/0/0 | 0 |
| 53004 | 88/135 | 1/3 | 0/0 | –/✓ | 6 | 6/3/2 | 13,165 |
| 53005 | 89/45 | 0/0 | 0/0 | ✓/✓ | 3 | 3/3/1 | 9,900 |
| 53006 | 150/116 | 8/4 | 51/0 | –/✓ | 2 | 2/2/2 | 6,025 |
| 53007 | 150/150 | 4/1 | 11/0 | –/✓ | 2 | 2/2/1 | 2,680 |
| 53008 | 123/86 | 0/5 | 0/14 | –/✓ | 8 | 8/8/4 | 20,415 |
| **Total** | **median 114.5/111** | **17/17** | **62/14** | **1/5** | **21** | **21/18/10** | **53,845** |

First-spend days (armed): 53004 d59, 53005 d20, 53006 d91,
53007 d39, 53008 d38. First-feast days match the first-grant days
on every spent seed except 53004 (feast d17, grant d59 — the
reactor was online until d59; 27 reactor skips). Draws driven off:
0 on all 8 seeds — every draw was faced, none driven off, which
also means the choice-price gap (34/34 driven off in the old
choiceprice finding) does not bind this band under the drive.

End feast gates: baseline armed-no-feast 5, grant-refused 2
(53004/53006, v1.1 recomputed classification), spent 1; armed
armed-no-feast 3 (53001/53002/53003), spent 5. Instrument errors:
0 on all 24 corpus files (diag 8, armed 8, re-baseline 8).

## The secondary regression — pair days 62 → 14

This is the run's real finding and the reason the GO carries a
landing caveat. Pair production collapses under the drive: 62 pair
days baseline (51 on 53006, 11 on 53007) fall to 14 (all 14 on
53008, where the baseline had 0). Villages also survive less:
3/8 survived baseline, 1/8 armed; three villages die much earlier
(53005: 89→45d, 53008: 123→86d, 53006: 150→116d). The median
survival bar hides this — 111d vs 114.5d — because 53004 lived
longer armed (88→135d). Wave-4+ kills total is unchanged (17 vs
17), only redistributed: 53006 loses 4 kills, 53008 gains 5.

The re-baseline leg rules out base drift as the cause (see below):
the staged baseline reproduces EXACTLY on the new base, so the
pair/survival movement is the drive's doing. The mechanism is
visible in the numbers: the drive donates 53,845 kcal off the
scholar's pack and lights 21 feasts that draw 18 scavengers into
fights. Feasts buy the deed and the kills, and the village pays
in earlier deaths — the pantry the scholar gives away is food the
village then lacks, and every feast is another fight. Starvation
deaths do not rise (6→6), so the price is paid in monster kills,
not empty bellies: total deaths fall 597→520 only because armed
villages live fewer days; deaths per 100 days are flat (63.6→62.7
in the panel).

## Why 3 seeds never feast (the drive's other half)

53001, 53002, 53003 end armed-no-feast. The drive is
haul-dependent, not guaranteed:

- **53001:** donate-down fired 0 times, 0 kcal moved, 82
  gives-short dusk skips. The scholar is armed from d15, the
  feast plan is ok with a deep pantry (have 37,628 vs cost 1,600
  on d60), at haven — but the scholar personally carries no
  donation-ready surplus above the half-cap keep on any day, so
  the giving gate never opens. The drive cannot manufacture gives;
  it can only move surplus the scholar actually hauls.
- **53002:** donate-down fired on 7 days and moved 1,860 kcal —
  but never 1,500 kcal inside any 7-day window (240 + 30 + 450 +
  420 + 60 + 360 + 300, spread over d42–d131). The gate is a
  rolling 7-day window; a slow trickle never opens it. 91
  gives-short skips.
- **53003:** 0 kcal moved, 51 gives-short + 5 reactor skips.

So the drive works where the scholar hauls a real surplus and
fails where the scholar is lean or the surplus trickles. A
follow-up that wants the deed on more seeds should look at the
giving gate itself (a longer window, or counting cumulative gives
since arming), not at the feast step — the feast step fires
whenever the gate opens (21 feasts on 5 seeds, 0 host-refusals
after the gate).

## Base drift — re-baseline (clearly labeled, NOT the frozen baseline)

Because the adoption rebased the branch (2cf4d19f0 → 2016a7ed0:
linkdrive landed, measurement proof refreshed r5, batch-ship
version bump), the staged baseline was re-run on the new base as
`perseed-feastdrive-b-rebaseline/` (POLICY=staged, same band, same
days). **It reproduces the frozen diag baseline EXACTLY:** median
114.5d, w4+ kills 1/1/2/1/0/8/4/0, spent 1/8, foodDeeds 1/8,
pair days 62 (51 on 53006, 11 on 53007), survived 3/8, starvation
6, end gates armed-no-feast 5 / grant-refused 2 / spent 1, 0
instrument errors, per-seed days identical (106/150/92/88/89/
150/150/123). **No base drift.** The frozen diag baseline stands
as the judged baseline; the re-baseline exists only to attribute
the armed leg's movement to the drive. (Note: the re-baseline
files carry the v1.1 classifier's `grant-refused` end-gate label
for 53004/53006; the frozen diag files still carry the v1 label
`grant-no-draw` for those seeds — same seeds, same meaning, the
label differs because the classifier was corrected after the diag
corpus was written. Not re-scored, not re-run.)

## Balanced panel (§15 — instrument, not judge)

`evidence/2026-11-07/feastdrive-panel.md` (+ .json, .json.gz pair),
built by `scripts/build-feastdrive-panels-20261107.js` from the
diag (before) and armed (after) corpora, paired seeds, contract
metrics only (table / playerDeaths / gear / luck / NPC metrics
null, never faked — same limitation as the sibling linkdrive
panel). Decision **review_required** (8 paired cases):

- National 0 → 0 (no_material_signal); wins 0 → 0 (descriptive).
- Survival60 1.0 → 0.875 (**regression_watch**, −0.125).
- CommunityLost 0.625 → 0.875 (**regression_watch**, +0.25).
- Village deaths/run 74.6 → 65.0 (no_material_signal; runs are
  shorter — per 100 days 63.6 → 62.7, flat).

Per §15 this does NOT override the prereg verdict (already GO on
the primary bar); the panel's regression_watch flags are the same
story as the pair-days collapse above, in contract-metric form:
the drive costs the village survival while it buys the deed.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json --current 'evidence/2026-11-07/perseed-feastdrive-b-armed/*.json' --metrics national,table,wins,exiled`:
**REFUSED** — "refusing recorder-corpus input: all 8 --current rows
carry top-level anchorCommit, so they are sweep recorder rows, not
runs." No LOUD line, no deviation — the refusal is by design (same
as the firstkiller/regionalstep arms; this arm made no Game-root
change, zero src/js, so there is no Game-telemetry baseline to
deviate from). The wall numbers below are the instrument's own.

## Reachability verdict

- Waves 1–5: wave-4 unlocked 8/8 armed (7/8 baseline), wave-5
  unlocked 1/8 (53008, both legs). Wave-5 kills: 2 on 53006
  baseline, 0 armed (53006's wave-5 kills went with its earlier
  death); 53008 armed reached wave 5 and made 5 wave-4+ kills
  but no wave-5 kill.
- Arc II/III/IV: arc 3 reached (seatDetail stage 3 on sampled
  seeds); no village reached the table in either leg.
- Regional → national: 0 links formed on any seed in either leg
  (0 regional, 0 national, 0 table, 0 wins). The scale wall is
  untouched by this lever — the feast deed is a seat ingredient,
  not a scale lever. Standing: baseline max 415 (53006), armed
  max 410 (53008); readiness-5 never released on any seed.
- The food deed itself is now reachable: `foodDeeds` completes
  on 5/8 armed seeds vs 1/8 baseline. The second half of the seat
  (sentiment taught + surge spent) was the blank; the drive
  fills it on the seeds where the scholar hauls surplus.

## The village, in plain words

Eight villages, same eight starting points, two ways of living.
Without the drive, the villages feast almost never: the devotion
arms early, the pantry is full, but the scholar gives away
practically nothing all week, so the old rule — give first, then
feast — never opens, and the surge the System armed sits unspent
for 150 days. With the drive, the scholar starts handing over the
extra food they carry, the weekly giving crosses the line, and
the fires get lit: 21 feasts, 18 scavengers drawn to the light,
10 faced and beaten while the blessing is live, the surge spent
on five of eight villages. The feast nights themselves read like
people, not a ledger — villagers stand up around the fire and tell
the room how they put a beast down, in their own words, and the
System answers in its own strange voice.

But the villages pay for it. The food the scholar gives away is
food the village no longer has to fall back on, and every feast
calls another hungry thing out of the dark. Three villages that
lived to 150 days without the drive die at 45, 86, and 116 days
with it. The pairs — two villagers who have learned to fight
together, the thing the whole winnability chain needs — nearly
vanish: 62 pair-days become 14. One village (53008) is the
exception that proves the shape: it feasts eight times, makes
five wave-4 kills, banks 14 pair-days — and still dies on day 86.
The drive proves the deed can be earned. It does not prove the
price is worth paying yet.

Death causes (both legs, monster-dominated): baseline 597 deaths
— villager combat 272, combat 119, expedition 79, the wild 47,
monster 30, sickness 11, starvation 6; armed 520 deaths —
villager combat 245, combat 97, the wild 55, expedition 56,
sickness 16, starvation 6. No new death shape appears under the
drive; the same dangers kill people sooner.

## Blanks filled / documented

- **Filled (this arm):** the feast-surge blank — the drive spends
  the surge on 5/8 seeds (was 1/8) and completes `foodDeeds` on
  5/8 (was 1/8). Policy-side only; nothing in the game changed.
- **Documented (findings backlog):** the pair-days collapse under
  the drive (62→14) and the haul-dependence of donate-down (3/8
  seeds never feast because the scholar carries no surplus / the
  surplus trickles below the 7-day window). Both appended to
  `hidden_files/sim-findings.md`.
- **Not chased (out of scope):** the choice-price gap (Steve call
  pending) — draws were faced 10/10 here, so it does not bind
  this band under the drive; the reactor block (by design, 2
  seeds in the diag) — the drive correctly skips feasting while
  it hums.

## Metric review

1. **The analyzer's starvation counter was wrong and is now
   fixed.** It indexed `teleDeaths` (an array of death records)
   as an object, so it always reported 0. True counts: baseline
   6, armed 6 (re-baseline 6). The frozen cost bar still passes
   (6 ≤ 6+2) and the verdict is unchanged, but every prior
   evidence file that quoted this analyzer's starvation total
   quoted 0 — the diag evidence for this arm and any sibling arm
   using `feastdrive-analyze-20261107.js` should be re-read with
   the corrected count. The fix is covered by
   `scripts/test-feastdrive-panels-20261107.js` (fixture + corpus
   smoke, 19/19).
2. **The cost bar does not price what this drive costs.** The
   frozen bar counts starvation deaths and median survival only.
   The drive passes both while cutting pair days 62→14, cutting
   survivors 3→1, and raising community loss 0.625→0.875. For the
   NEXT run, propose adding pair-days (or survived count) to the
   cost bar for any lever that moves food out of the village or
   draws extra fights: a deed bought with the village's pairs is
   not a free deed. This is a proposal for the next prereg, not a
   re-scoring of this one.
3. **The "arm-only" phrase in the cost bar is ambiguous.**
   The prereg's precise definition is the total (armed ≤ control
   + 2); judged on that, PASS (6 ≤ 8). Under the strictest
   per-seed reading ("no starvation death on a seed where the
   control had none"), 53008's single armed starvation death
   (control 0) would flag. One death on one seed, against a total
   that is unchanged, is reported here as a caveat, not a
   verdict change — but the next prereg should pick one reading
   and write it plainly.
4. **Median survival hides distribution movement.** 53004 living
   47 days longer armed nearly cancels three villages dying
   34–44 days earlier. The median bar passed at 0.97× while the
   survived count fell 3→1. Next runs should report survived
   count alongside the median (done here).

## Proof

- `scripts/test-feastdrive-20261107.js`: **35/35 PASS** — run
  green before the rebase and re-run green after the rebase onto
  2016a7ed0 (no threshold or composition change).
- `scripts/test-feastdrive-panels-20261107.js`: **19/19 PASS** —
  panel metric-mapping fixtures, analyzer starvation-count
  fixtures, real-corpus smoke (both corpora complete, 8 files,
  0 instrument errors; compare .md exists, 8 paired cases).
- No `check.js` run: this arm changed zero src/js and zero
  green-list files (new policy file + scripts + evidence only);
  the arm's own proof tests are the verification. The panel
  builder is a new script; its proof is the 19/19 above.

## Convergence state

Axis scale-onramp / winnability chain: **converging, not
converged** — the feast-deed link of the chain now moves (5/8),
but the drive's pair/survival cost is an open tradeoff and the
scale wall (national / table / wins) is still 0/0/0. The next arm
on this axis should be a cost-taming variant (cap donations, or
a longer giving window so lean seeds can feast) judged with
pair-days in the cost bar — or a different link of the chain.

## Files

- Prereg (v2 FROZEN): `evidence/2026-11-07/sim-feastdrive-b-prereg.md`
- Baseline corpus: `evidence/2026-11-07/perseed-feastdrive-b-diag/` (8 files, base 2cf4d19f0)
- Armed corpus: `evidence/2026-11-07/perseed-feastdrive-b-armed/` (8 files, base 2016a7ed0)
- Re-baseline corpus: `evidence/2026-11-07/perseed-feastdrive-b-rebaseline/` (8 files, base 2016a7ed0 — labeled, not the judged baseline)
- Panel: `evidence/2026-11-07/feastdrive-panel.md` (+ `.json`, `-before.json.gz`, `-after.json.gz`)
- Policy: `scripts/policies/competent-feastdrive-b.js` (v2 frozen composition, adopted)
- Driver / instrument / analyzer: `scripts/feastdrive-driver-20261107.js`, `scripts/feastdrive-instrument-20261107.js`, `scripts/feastdrive-analyze-20261107.js` (starvation-count fix)
- Panel builder: `scripts/build-feastdrive-panels-20261107.js`
- Proof: `scripts/test-feastdrive-20261107.js` (35/35), `scripts/test-feastdrive-panels-20261107.js` (19/19)
- Panel registration: `scripts/sweep-compare.js` (additive entries, staged + feastdrive)

## Wall numbers (every run)

| | Baseline | Armed |
|---|---|---|
| National | 0/8 | 0/8 |
| Table (sat) | 0/8 | 0/8 |
| Wins | 0/8 | 0/8 |
| Wave-4 unlock | 7/8 | 8/8 |
| Wave-5 unlock | 1/8 | 1/8 |
| Median survival | 114.5d | 111d |
| Wave-4+ kills (total) | 17 | 17 |
| Pair days (total) | 62 | 14 |
