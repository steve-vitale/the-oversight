# sim-fieldfinish2-a — field-kill conversion BUILD with survivability companion (PILOT NO-GO, game code REVERTED)

Run: Loop A worker, axis scale-onramp (converging, NOT converged), run
fleshout-20261031T1850Z. Arm type: BUILD — one narrow game-code change in
src/js/fieldFights.js ONLY (committed-finish override at the in-round break
check + 40% survivability companion floor), plus policy-side instrument
copies. Pre-registration: evidence/2026-10-31/sim-fieldfinish2-a-prereg.md
(committed BEFORE any judged sims, commit f554d59a9). This evidence file was
written by the recovery coordinator of run fleshout-20261031T2058Z (stale-lock
recovery of the 1850Z run: lock 120+ min old, tree heartbeat 76+ min stale,
no worker processes, tree writes quiet 22+ min; soleprotect + rosterlot
already merged on master; this arm adopted, judged, reverted, and landed
here). The worker's pilot corpora, analysis, and panel were complete at
adoption; the verdict below is judged from those artifacts, re-verified by
the coordinator (direct corpus tabulation, det-gate re-check, proof re-run).

## Question (from sim-fieldkill-a, 1702Z)

Field fights never kill wave-3 monsters because the fight exits before
death: the monster's break line below 15% of max HP (36–63 HP for wave-3
max HP 240–420) makes it flee instead of dying, and 10 of 11 killable-state
fights ended with the monster fleeing at 16–44 HP, one strike from death.
Prior HOLD/NOFLEE pilots are the warning: removing flee raised kills but
collapsed villages — the break line is load-bearing villager protection.
This lever was therefore NARROW and SURVIVABILITY-PAIRED, never a flee
removal: override the in-round break check ONLY when all six gates hold
(lead alive; lead HP <= this fight's own biggest proven single lead
strike; villager >= 60% HP; intent engage; this round's strike landed
damage; arena not sealed), and once a finish is committed, flee at 40%
HP instead of holding to the 5% winning floor.

## Base pin, seeds, policy (per prereg, re-verified)

- Base pin: 00e1bd4db (Loop B 1630Z evidence commit). The prereg commit
  touches only the prereg file, so the baseline leg's game code is
  byte-identical to the pin. Judged comparisons are lever-vs-baseline on
  identical seeds, never against fieldkill-a's corpus.
- Pilot seeds (8): 87104, 87109, 87119, 87124, 87140, 87115, 87123, 87127.
  Confirm (11 seeds) NOT run — the pilot gate failed (below), and the
  prereg forbids confirm after a pilot failure.
- Policy stack, identical both legs: withFullseatDiag(withSeatDrive(
  withWinDefer(leadfeast))), FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1
  WINDEFER=1 SEATDRIVE=1 FULLSEAT=1, plus the fieldfinish2-diag recorder
  (FIELDFINISH2=1). Horizon: 200 loop-days, death-aware (harness
  Game.over stop; dead villages stop simulating).
- Panel (§15): evidence/2026-10-31/sim-fieldfinish2-a-panel-compare.md
  (+ .json, + before/after panel .json.gz). The panel is the instrument;
  the prereg GO thresholds below are the judge. Panel decision:
  review_required; national scale access 0.875 -> 0.25, regression_signal.

## Pilot numbers (8 seeds, lever vs baseline on identical seeds)

| Metric | Baseline | Lever | Prereg bar | Verdict |
| --- | ---: | ---: | --- | --- |
| Converted field kills (wave >= 3, vKill, committedFinish true) | 0 | 0 | >= 2 | FAIL |
| Wave-3 field vKills (any mechanism) | 0 | 0 | lever > baseline | FAIL (equal) |
| Committed fights, wave >= 3 | 0 | 0 | — | — |
| Committed fights, all waves | 0 | 61 (wave 1: 46, wave 2: 15) | — | — |
| Committed-fight outcomes (all waves) | — | 57 vKill, 4 mFlee | — | — |
| Median survival (gameDays) | 118.5 | 90 | >= 0.8 x control (94.8) | FAIL as written (see note) |
| Max survival | 197 | 97 | — | — |
| National-ever | 7 | 2 | >= control - 2 (5) | FAIL (see note) |
| Table-ever / wins | 7 / 7 | 7 / 7 | reported | — |
| Wave-4 reach / wave-5 reach | 4 / 0 | 5 / 0 | reported | — |
| Field villager deaths, wave-3 rows (vDie) | 4 | 5 | <= control + 3 (7) | PASS |
| Field meetings / TB meetings | 104 / 16 | 71 / 36 | — | — |
| Field outcomes (vFlee / mFlee / evade / vDie) | 55 / 40 / 9 / 0 | 46 / 18 / 4 / 3 | — | — |
| TB outcomes (lost / won / routed) | 8 / 5 / 3 | 23 / 11 / 2 | — | — |
| mBreak-driveoff trigger count | 33 | 2 | — | — |
| Killable-state / near-killable fights | 4 / 9 | 1 / 6 | — | — |
| Below-break / zero-damage fights | 34 / 39 | 3 / 21 | — | — |
| Village-lost endings | 1 (87109, day 146) | 1 (87123, day 20) | — | — |

Lever-leg per-seed ends: 7 over-other wins by day 97 (87104/87109/87119/
87115/87127 at regional, 87124/87140 at global), 1 village-lost (87123,
day 20). Baseline-leg ends: 7 wins (days 90–197, national/global mix),
1 village-lost (87109, day 146).

## Verdict: PILOT NO-GO — confirm NOT run, game code REVERTED

P1 (effect) FAILS outright and is divergence-independent: the rule never
engaged its target class. In 71 lever-leg wave-3 field fights, zero met
the six gates; zero wave-3 field kills on either leg; zero converted
kills. The 61 committed fights are ALL wave 1–2, where single strikes
can already cover the break-line remainder — and where the baseline
already wins kills without the rule (baseline wave-1 vKill 51, wave-2
vKill 27). The rule converts fights that were already winnable and
never touches the wave-3 manufacture gap it was built for.

P2 and P4 FAIL as written, but their reading is confounded (see metric
review): the lever leg did not collapse — it won EARLIER at LOWER
scale (7 wins by day 97, only 2 national, vs baseline 7 wins with 7
national over days 90–197). Median survival here is "days until
Game.over", and winning ends the run; a leg that wins lesser seats
early scores a short median and a low national count without any
village dying. Village-lost is 1v1. P3 PASSES cleanly (5 <= 7).

The mechanism story, stated plainly: the one-strike gate is out of
reach for wave-3 beasts. At the break check a wave-3 monster holds
36–63 HP; the gate demands that this fight's own biggest single lead
strike already be >= that remainder. Villager single strikes almost
never prove that large against wave-3 HP pools, so the override never
fires where it matters. The companion floor never fired either
(committedFloorN 0, committedDeaths 0) because no wave-3+ fight ever
committed — the survivability pairing is untested, not failed.

## What the rule DID do (post-hoc, not preregistered)

Once the rule fired on wave-1/2 fights (57 converted to vKill), the
lever trajectories diverged from baseline — kill credit, deed bars,
and table timing all move downstream of kills, so every downstream
number (TB outcomes, national timing, win day) is post-divergence,
not a clean ceteris-paribus comparison. The most plausible chain for
the early lesser wins is: more low-wave kills -> faster deed progress
-> earlier table at regional scale, before national standing accrues.
This is a post-hoc reading, not a judged claim, and it is NOT a reason
to keep the rule: a rule that accelerates the lesser-seat win while
leaving the full-seat veteran gap untouched moves the wall numbers
the wrong way (national 7 -> 2).

## Revert verification (coordinator, before landing commit)

- `git checkout -- src/js/fieldFights.js` in the worktree, then:
- `git diff -- src/js/fieldFights.js` EMPTY (vs HEAD).
- `git diff 00e1bd4db -- src/js/fieldFights.js` EMPTY (byte-identical
  to the prereg base pin).
- `git diff 00e1bd4db -- src/` EMPTY (no src changes anywhere).
- The killed arm leaves NO trace in src/. Retained: this evidence file,
  prereg, pilot corpora (jsonl + per-seed JSONs + analysis JSONs),
  panel compare files, and the analyzer
  (scripts/fieldfinish2-analyze-20261031.js) — all contain no
  game-code change. NOT retained: the proof test (fails post-revert
  by design, see disposition) and six instrument files lost during
  recovery (see loss note). Worktree scratch dirs deleted before
  commit per the prereg's I/O discipline.

## Instrument loss during recovery (coordinator, LOUD)

Six uncommitted instrument files present in the adopted worktree at
revert time (listed in the worktree status after the revert) were found
missing before the landing commit, with no commit, delete, or
rebase by the coordinator in between (policies/ dir mtime
2026-10-31 20:59Z): scripts/fieldfinish2-sweep-20261031.js,
scripts/fieldfinish2-split-20261031.js,
scripts/fieldfinish2-panels-20261031.js,
scripts/fieldfinish2-det-20261031.sh,
scripts/fieldfinish2-det-compare-20261031.js, and
scripts/policies/fieldfinish2-diag.js. They were never committed
anywhere (no branch or master copy exists), so they are LOST, not
misplaced — this is a new surface of the container's silent-loss
class (cf. the 2026-10-30 registry truncation), reported loudly
here rather than papered over. What survives, and why the verdict
still stands: the judged corpora (jsonl + per-seed JSONs), the
analysis JSONs, the panel compare files, the analyzer
(scripts/fieldfinish2-analyze-20261031.js, landed), the prereg, and
this evidence file. The verdict is reproducible from the corpus +
analyzer; only re-running the identical sweep is lost. Rebuild
recipe, from the prereg (NOT a reconstruction — nothing was
rebuilt or committed on this basis): the sweep is a copy of the
fieldkill sweep with recorder module + env name swapped, and the
diag recorder is a copy of fieldkill-diag.js with exactly one added
captured field per field-fight row (committedFinish +
committedRounds) and the env gate renamed FIELDKILL ->
FIELDFINISH2. A future arm that needs the sweep must rebuild it
from that recipe and re-prove det-gate + determinism before
judging any new sims. No file was fabricated to fill this gap.

## Proof-test disposition (post-revert, by design)

The proof test passed 81/81 BEFORE the revert (proving the rule
worked in the real engine). AFTER the revert it passes 78/81, and
the 3 failures are exactly the engine-positive legs asserting the
reverted rule (committed finish fires; committed fight ends vKill;
kill log carries committed line) — by-design failures on reverted
code, not regressions. The proof test is therefore NOT landed: a
test asserting reverted behavior must not ship on master. The
analyzer (landed) carries the corpus-arithmetic legs, which remain
green. This section corrects the "81 passed, 0 failed" line below,
which is pre-revert truth only.

## Instrument verification (coordinator re-runs)

- Det-gate (recorder ON vs OFF, seeds 87104/87127): dayHash arrays
  BYTE-IDENTICAL and end fields identical on both seeds — the recorder
  is pure (no RNG draw, no game-state write). The OFF leg's zero
  daily/fight counts are expected (recorder off records nothing).
- Corpus determinism: judged pilot seed 87104 re-run to a scratch dir
  is BYTE-IDENTICAL to its judged JSON.
- Proof test scripts/test-fieldfinish2-20261031.js, PRE-REVERT: 81
  passed, 0 failed (synthetic analyzer legs + engine
  positive/negative cases + 8 corpus seeds). The 11 confirm seeds
  report "CORPUS MISSING (skipped)" because confirm never ran —
  expected, not a failure. Post-revert it is 78/81 (see disposition
  above) and is NOT landed.
- The raw lever jsonl carries 61 `"committedFinish":true` rows; the
  analyzer's committedFightsN=0 is CORRECT, not a counting bug — the
  analyzer counts wave >= 3 only, and all 61 committed rows are wave
  1–2 (verified by direct tabulation: wave 1: 45 vKill + 1 mFlee;
  wave 2: 12 vKill + 3 mFlee; wave 3: 0 committed of 71 fights;
  wave 4: 0 committed).

## Sense-testing (SENSE-TESTING LAW)

The prereg requires judging at least 2 converted-kill transcripts and
2 non-converted flights. That section is VACUOUS for wave 3 by the
mechanism's own non-firing, and that vacuity IS the finding: the
intended moment — a healthy fighter holding for one more blow against
a wave-3 beast, then landing the killing blow — never occurred in
8 seeds of play, so there is no transcript in which it reads as a
believable decision. Wave-1/2 committed kills carry no fight logs
(only wave-3 rows carry full logs), so they cannot be sense-read
either; their log line as implemented ("<Name> holds — <monster> is
one blow from falling, and they are still strong enough to finish
it. (Committed finish)") is the prereg's wording verbatim. No
narration for the finish exists outside the fight log. A future arm
must not claim the finish "reads well" until a wave-3 converted kill
exists to read.

## Metric review (mandatory, §14)

- P1 behaved: it cleanly separates "rule fires on target" from "rule
  fires somewhere". The wave >= 3 restriction is what makes the
  verdict honest — without it, 61 committed fights would have
  falsely passed the arm.
- P2/P4 as written do NOT distinguish "rule harms scale" from "rule
  accelerates an early lesser win". Median gameDays and national-ever
  both move when a leg wins earlier at lower scale. Next run's prereg
  should judge survival/death guardrails on village-lost counts and
  death causes, and judge scale on a fixed-horizon national check
  (e.g., national by day 90 on both legs), not on end-of-run totals
  under a win-ends-run stop rule. This revision applies to the NEXT
  run; it does not re-score this pilot (P1 alone fails the gate).
- The panel's national regression_signal is consistent with the
  early-lesser-win reading, not with village collapse — the panel
  decision review_required is the correct call, and the prereg judge
  overrules any panel-only verdict either way.
- Horizon note: no horizon mismatch exists between legs. Both legs ran
  the 200-day death-aware cap; lever seeds end at ~90 because they
  WON (Game.over), not because of a shorter cap. Baseline seeds that
  end at 90 won then too. The day-90 clustering is the finding, not
  an artifact.

## Wall numbers (judged band, both legs, never pooled)

Baseline: national 7/8, table 7/8, wins 7/8, wave-4 4/8, wave-5 0/8,
median 118.5d, max 197d. Lever: national 2/8, table 7/8, wins 7/8,
wave-4 5/8, wave-5 0/8, median 90d, max 97d. Full seat 0, wave 5
reached 0 stands on both legs. Arc reach, four-realm formation, trap
acquisition by source, counter discovery rates, and young-link
succession survival are NOT in this corpus — reported as unmeasured,
not as zero.

## Blanks filled or documented

- FILLED (answered, NO-GO): the narrow committed-finish lever does not
  manufacture wave-3+ killers — the one-strike gate never engages at
  wave 3. The 1702Z blank (3) "field-kill conversion lever WITH a
  survivability companion" is answered in the negative for this gate
  shape; the companion remains untested.
- DOCUMENTED (next arms, this run's DIAG follow-ups): (a) the exact
  wave-3 gate gap — how far short the biggest proven strike falls
  from the break remainder, fight by fight from the wave-3 logs
  (sim-finishgate-a); (b) the contact-break class the prereg
  explicitly excluded — wave-3 beasts met already below the break
  line (sim-contactbreak-a). Both are analyzer-only on this corpus;
  neither re-runs sweeps or judges against another base.
- NOT re-opened: engine-cap decision (steve-call), full-seat price
  voicing (steve-call), second-veteran manufacture as a whole (the
  gap stands; only this gate shape is closed).
