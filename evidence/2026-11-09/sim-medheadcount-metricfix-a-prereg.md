# sim-medheadcount-metricfix-a — PRE-REGISTRATION (binding)

**Arm:** sim-medheadcount-metricfix-a (DIAG + held-lever re-run, zero new game
design) · **Run:** fleshout-20261110T0216Z (Loop A) · **Axis:** food-economy
(converging, NOT converged) · **Branch:** sim-fightblend-reask-a (slug kept
for traceability — see redirect note) · **Base master:** `1fc09bbe3`
(verified: worktree `git log --oneline -1` reads `1fc09bbe3`; main-tree tip
identical; worktree tree clean, 0 untracked at prereg time) ·
**Policy:** competent ONLY (scripts/policies/competent.js, UNMODIFIED) ·
**Env:** PLENTYDEPRI=1, DEPOSITGATE=1 · **Horizon:** 150d death-aware cap ·
**Seeds:** 96009–96024 (16, confirm band — the owed re-run of the confirm).

**Prereg committed BEFORE any judged computation.**

## Redirect note (why this file is not a fightblend prereg)

The original brief for this run (fightblend re-ask on the frozen band) was
issued on a STALE tracker blank and was STOPPED by coordinator redirect
before any fightblend sim ran and before any fightblend prereg was
committed (worktree verified clean at redirect time; no fightblend work
exists to undo). The freeze + band-level fightblend re-ask already landed
as sim-bandfreeze-b (commit `52e8caec0`, verdict MIXED), and Loop B's
sim-fightblend-reask-b (`a81cb2d07`) retired the single-seed attribution
route. Re-running that re-ask would duplicate landed work. This arm is
re-pointed at the metric revision from the just-landed medic-headcount
confirm (below). The worktree slug and branch stay
`sim-fightblend-reask-a` for traceability; the arm name in this file is
the work being done.

## The question

The confirm run (evidence/2026-11-09/sim-medheadcount-confirm-a.md) judged
the held medic-headcount lever NO-GO on a single clause: G2 NEW-MODES
failed on `"the redactor":2` — two villagers killed by The Redactor, a
wave-3 monster (src/data/monsters.json id `redactor`, name "The
Redactor"). Both deaths are fight deaths, the same mode as "monster" and
"the wild". The clause as wired trips on the LABEL, not the mode: the game
emits a monster's proper name as the death-cause label, and the confirm
before leg itself contains six such labels (the callback, highbeam deer,
sunback, grief counselor, buffering, spool — all count 1, below
threshold). The confirm's Metric review proposes the revision this arm
implements (not applied there, per metric binding): collapse causes
matching the game's monster roster into 'fight' alongside the fight-label
regex; prove the revised wiring on the pilot corpora first (must still
read "none" and verdict GO), then re-run this confirm band with the lever
+ the 10 test fixes re-applied. The metric itself (no new death-cause
MODE) does not change — only the label-to-mode classification, grounded
in the game's own data.

## Canon read

- `docs/CANON.md` read first. Area canon: no canon doc covers seed
  attribution or death-cause taxonomy — the question is answered from
  measurement, grounded in the game's own data file
  (src/data/monsters.json, 72 roster entries). The monster roster is
  data, not invented canon: name / shortName / id per entry.
- `~/workspace/the-scattering/AGENTS.md` (repo house rules) read.
  `docs/MEASUREMENT.md` §§9–12, 14–15 read (pilot gate, death-aware
  horizons, prereg, convergence, metric binding, balanced panels).
  `docs/SIMULATING.md` read (compare-never-eyeball, competent policy,
  never two games in one process, single-seed fragility).
- Prior record read: evidence/2026-11-09/sim-medheadcount-confirm-a.md
  (esp. § Metric review — THE REDACTOR), its prereg (the binding
  G1/G2/G3/G4 bars, carried below), evidence/2026-11-09/
  sim-medheadcount-suite-a.md §Fixes (the 10 test fixes), and the held
  lever patch (hidden_files/medheadcount-a-gamejs.patch).

## The metric revision (BINDING — this prereg binds the revised wiring)

In `scripts/analyze-medheadcount-a.js`, `causeMode(c)` gains one step,
AFTER the existing fight-label regex and BEFORE the fallback return:

- Load the monster roster once at startup from
  `src/data/monsters.json` (path relative to the analyzer script). Build
  a set of the lowercased `name`, `shortName`, and `id` of every roster
  entry (72 entries; verified present: `redactor`, `callback`,
  `sunback`, `mirror_stag`, `buffering`, `spool`, `gallowdeer` whose
  name is "Highbeam Deer").
- If the lowercased, trimmed cause label is in that set, return
  `'fight'` — exactly as the regex does for fight labels.
- If the roster file is missing or malformed, FAIL LOUDLY (exit 2)
  — never silently fall back to regex-only (a silent fallback would
  reintroduce the bug the revision fixes).
- The threshold is unchanged: a mode is "new" when absent in before
  and present with count ≥ 2 in after. The `G2 NEW-MODES` line format
  is unchanged. The `--leg` output is untouched (causeMode is not used
  there) — the pilot baseline pin (share 56.1%, zeroMedicSeeds 2/8,
  spawnSeedsWithMedic 4/8) must stay byte-identical.

Boundary, stated before seeing numbers: the revision collapses EXACTLY
the roster (name/shortName/id, case-insensitive, exact match). Fight-death
labels that are NOT roster names — e.g. `ugly-eyes`, `the ugly beast`,
`the night`, `loud-eyes`, `big-eyes` in the confirm corpora, which match
no roster entry — are NOT collapsed. If one of those trips the clause on
the re-run (present ≥2 in after, absent in before), the clause fails
honestly and the verdict is NO-GO; the evidence names the label and the
next run decides whether the roster needs the epithet or the cause
emission needs the monster id. Nothing is re-scored.

## Patch check (read-only, done before this prereg — not a judged computation)

`git apply --check` on
`hidden_files/medheadcount-a-gamejs.patch` against this tree: **APPLIES
CLEANLY** (22 insertions / 5 deletions, `src/js/game.js` only, no hand
port). Patch base was `8cee6a8d2`; tree base is `1fc09bbe3`. If the apply
itself ever fails, FAIL LOUDLY and report — do not hand-port.

## Seed-band freshness (re-verified this run, per the seed-band skill)

Band 96009–96024, re-verified 2026-11-09 in this tree:
- `grep -rhoE "\b960(0[9]|1[0-9]|2[0-4])\b"` over
  `evidence/*/sim-*-prereg.md`: hits only in
  sim-medheadcount-confirm-a-prereg.md (the confirm this run re-runs),
  sim-wallbase-a-prereg.md (names the band ONLY as a task-forbidden band
  avoided — not a use), and sim-wideduty-a-prereg.md (names the band
  only to RESERVE it for this confirm: "96009–96024 was NOT reused —
  it is the medheadcount-suite arm's verified-fresh owed confirm band").
- This re-run is the SAME confirm on the SAME band (the owed re-run the
  reservation names), not a new use. No other prereg, screen, or
  extension band claims any seed 96009–96024.

## Work order (binding)

0. **Prereg** (this file) — committed before any judged computation.
1. **Metric revision + pilot proof FIRST.** Edit the analyzer per § The
   metric revision. Then run it `--before/--after` on the pilot corpora
   (evidence/2026-11-08/medheadcount-a-corpus/ +
   medheadcount-a-corpus-after/) — it MUST print `G2 NEW-MODES ...
   none -> PASS` and `VERDICT: GO`, and `--leg` on the pilot before
   corpus must still pin share 56.1% / zeroMedicSeeds 2/8 /
   spawnSeedsWithMedic 4/8. If it does not, STOP: the wiring is wrong,
   no confirm leg runs. (The pilot corpora could not have caught the
   redactor case — their only new cause ≥2 was "combat", already
   collapsed — so the pilot proof pins the old behavior; the new
   behavior is proven by the proof-test L7 replay below on the
   committed confirm corpora, where "the redactor":2 is the exact
   failing case.)
2. **Proof test extension.** Add L7 to scripts/test-medheadcount-a.js:
   (a) replay — the analyzer `--before/--after` on the COMMITTED
   confirm corpora (evidence/2026-11-09/medheadcount-confirm-before/
   medheadcount-confirm-after/) must now read `G2 NEW-MODES ... none ->
   PASS` and `VERDICT: GO` (the exact failing case, re-read under the
   revised wiring); (b) synthetic — a built-in-/tmp pair where after
   adds `"the redactor":2` (absent in before) must read "none"; (c)
   synthetic control — a pair where after adds a genuinely new non-fight
   cause ≥2 must still FLAG it (the clause still bites). L7 runs on the
   levered tree; on a reverted tree it still passes (it tests the
   analyzer, not the lever) — record that.
3. **Before leg (base tree).** Lever NOT applied, tests NOT fixed.
   `PLENTYDEPRI=1 DEPOSITGATE=1 SEEDS=96009,…,96024 DAYS=150
   OUT=evidence/2026-11-09/medheadcount-metricfix-before/sweep-competent.json
   PERSEED_DIR=evidence/2026-11-09/medheadcount-metricfix-before
   node scripts/sweep-medheadcount-a.js` — 16 competent + 16 bare.
   Fresh dirs (no merge with the confirm corpora). Log to
   evidence/2026-11-09/medheadcount-metricfix-before-sweep.log.
   Recorder neutrality: all 16 bare==competent fingerprints must match
   (days, national/table/win, deathCauses, deathKeys, waveReach) — the
   same bar the confirm run met; a mismatch is a STOP, investigate, do
   not attribute.
4. **Panel-before (base tree).** `node scripts/balance-panel.js --out
   evidence/2026-11-09/medheadcount-metricfix-panel/panel-before
   --seeds 7,42 --days 150` — same invocation as the confirm run. Log
   kept. If interrupted, resume with the identical command (cases/
   cache is reused by the tool).
5. **Gate read on base tree.** `node scripts/check.js --quick` on the
   base tree (frozen; no other node work mid-gate). Record the
   pass/fail count as the standing-failure baseline.
6. **Apply the lever + the 10 test fixes.** `git apply` the held patch
   (verified clean above). Then the fixes, exactly as briefed in the
   suite file §Fixes with the confirm run's validated seeds/repairs
   (recorded below). Verify each of the 10 tests standalone on the
   final tree — ALL must be green. If a seed fails on the moved base
   (30d95ed8c → 1fc09bbe3), re-search per the suite procedure (first
   all-green seed wins, full test per candidate, no assertion changes)
   and record the change in the evidence file — a fixture re-seed is
   not a re-score.
7. **Proof test.** `node scripts/test-medheadcount-a.js` must read 7/7
   (+ L7 = 8 legs) on the levered tree. On a reverted tree it reads
   4/7 by design (L0/L1/L3 fail; L7 passes — analyzer, not lever).
8. **After leg (levered tree).** Same sweep invocation with
   `medheadcount-metricfix-after` dirs. Log kept.
9. **Panel-after (levered tree).** Same panel invocation with
   `panel-after`. Then `node scripts/balance-panel.js compare --before
   <panel-before>/panel.json.gz --after <panel-after>/panel.json.gz
   --out <prefix>`; compare.md + compare.json attached to the evidence.
   Commit panel.json.gz + compare files ONLY — never the cases/ cache
   (deleted before commit, per the medchannel precedent).
10. **Gate read on levered tree.** `node scripts/check.js --quick` on
    the final tree. GO requires no NEW failure attributable to the lever
    vs the base-tree read (standing failures carried, named).
11. **Judge.** `node scripts/analyze-medheadcount-a.js --before
    …-metricfix-before --after …-metricfix-after --seeds
    96009,…,96024` — G1/G2 per the bars below, with G2 new-modes
    under the REVISED classification. Telemetry deviation check (same
    baseline + flags as the confirm run) — reported, not a GO bar: the
    confirm run's three LOUD lines are the known regime mismatch (the
    scale-wall baseline is the WINSEAT regime; the identical lines fire
    on the before leg too). Any NEW LOUD line is investigated before
    finishing.
12. **Evidence + commit.** If GO: lever + test fixes stay applied and
    land with the evidence. If NO-GO: revert the lever + fixes from
    the tree exactly as the confirm run did (game.js restored to base;
    the 10 test files restored), and the evidence + instruments +
    corpora land as record. Either verdict is a complete result.

## The 10 test fixes (as briefed + validated by the confirm run)

Assertion repairs (apply exactly as sketched in suite §Fixes, no
assertion wording changed anywhere):
- feast-healing-use (scripts/godpath/test-feast-healing-use.js): after
  `K.fight(G, 'hushwolf', {party:true})`, derive the companion from the
  actual first-blow owner (`s.prog.feastSurgeBy` = v:X), falling back
  to the roster companion.
- pellet-q4 (scripts/test-pellet-q4-20261108.js): move `f =
  startFight(G)` before the grant; bearer derived from an actual
  villager fighter present; reactor granted to THEM.
- cornucopia-wired (scripts/godpath/test-cornucopia-wired.js): return
  line `!v.away[npc]` → `(!v.away[npc] || v.away[npc].purpose !==
  'forage')`.

Seed refreshes (new seed + header comment line in the file's own style,
no assertion changes; seeds are the confirm run's validated values):
- occupation-cohorts (scripts/godpath/test-occupation-cohorts.js +
  scripts/godpath/occupation-fixtures.json): npcOnlySeed 4058 → 4075.
- cornucopia-wired: TEST_SEED 7 → 8 (after repair (a)).
- titan-standdown (scripts/test-titan-standdown-20261019.js): 8991 → 8992.
- party-opening-turn (scripts/godpath/test-party-opening-turn.js):
  20 → 54.
- region-start (scripts/test-region-start-20261014.js): SEED
  20261015 → 20261016.
- table-ascension (scripts/test-table-ascension-20261013.js): SEED
  1313 → 1315.
- pellet-boost (scripts/test-pellet-boost-20261108.js): SEED
  20261108 → 20261109.
- capable-bot (scripts/test-capable-bot-20261014.js): seed 81 → 85.

Expected standalone counts on the final tree (confirm run): 6/6, 33/33,
21/21, 22/22, 9/9, 55/55, 17/17, 39/39, 19/19, 40/40.

## Pre-registered header (judged bar — the confirm prereg bars, G2 new-modes revised)

- PRIMARY (G1): medic-present village-days share ≥ 70% AND seeds with
  zero medic-days ≤ 2 of 16.
- GUARDRAILS (G2): median survival ≥ 0.8× before-leg control;
  starvation deaths ≤ before + 4; no new death-cause mode ≥ 2 under
  the REVISED classification (roster collapse + fight-label regex).
- PANEL (G3): §15 balanced panels before/after on the confirm corpora
  (scripts/balance-panel.js, seeds 7,42, 150d), compare attached; any
  regression_signal investigated, unexplained regression blocks GO.
  review_required with no regression_signal is a PASS (as in the pilot
  and the confirm). Watches carried: (a) the seed-42 capable watch —
  village deaths doubling, expedition-led (pilot 68.5 → 89.5, confirm
  50 → 107 with the village winning this time); if a THIRD panel
  shows the same seed-42 expedition-death doubling, the evidence asks
  whether the lever's roster reshuffle systematically pushes capable
  villages into more expeditions, rather than treating it as one-seed
  noise. (b) Capable table win rate / national on 2 pairs is screen
  noise, not a verdict.
- PROOF (G4): scripts/test-medheadcount-a.js green (all legs L0–L7,
  8 legs) on the levered tree; all 10 repaired/refreshed tests green
  on the levered tree; check.js --quick shows no NEW lever-attributed
  failure vs the base-tree read.
- SECONDARY (reported, not gated): wound_care / herbal_medicine
  lessons per run; triage holders who are not occupation-medics;
  medic joins by source; medic deaths; wall numbers (national /
  table / wins, wave reach 1–5, median survival).
- GO: G1 + G2 + G3 + G4 all pass. A miss is NO-GO, never re-scored.
  On NO-GO the lever + fixes are reverted from the tree before
  finishing and the evidence lands as record.
- HORIZON: 150d death-aware cap (same as the pilot and the confirm;
  villages that die stop simulating).

## GO/NO-GO rule (binding, stated before numbers)

GO iff ALL of: G1 share ≥70% AND zero-medic ≤2/16; G2 median
≥0.8×before AND starvation ≤before+4 AND new-modes none (revised);
G3 no regression_signal (review_required passes); G4 proof 8/8 on the
levered tree AND all 10 tests green AND no new lever-attributed
check.js --quick failure. Any miss → NO-GO, lever + fixes reverted,
evidence lands as record. A MIXED-style partial (e.g. G1 passes but G2
new-modes trips on a non-roster label) is NO-GO with the tripping label
named — never re-scored, never forced into a GO.

## Proof

`scripts/test-medheadcount-a.js` (L0–L7). The proof must FAIL on a
broken wiring: the L7 synthetic control (genuinely new non-fight cause
≥2) must still flag, and reverting the analyzer revision must make the
L7 replay leg fail on the committed confirm corpora (the redactor case
trips again). Never run concurrent jest; use
`--cacheDirectory=/tmp/jest-cache-sim-fightblend-reask-a`.

## Wall numbers (every run)

National / table / wins, wave 4–5 unlocks, median survival — reported
in the evidence file on both legs even though the competent policy
never walks a door by design (national 0/16, wins 0/16 expected on the
confirm band; table sits count, wave-4 unlocks, wave-5 unlocks, median
survival across the 16 seeds).

## Sense-test

Read transcripts/dialogue on at least one confirm seed (the corpora
carry lessons/joins/deaths/headcounts; the sense read is on the stories
the numbers tell, plus any dialogue the seed's beats carry); judge
meaning and coherence, quote one telling moment, good or bad.

## Non-goals

- No new game design, no default flips, no canon invention. The lever
  is the held patch, applied as-is; the metric revision is the only
  instrument change, and it changes classification, not the metric.
- No landing, no merge, no push, no bump, no live verification — report
  ready-to-merge; the coordinator lands it.
- No tracker edit (the coordinator owns the convergence tracker); no
  fightblend work (stopped by redirect — see above).
- Panel (§15): the balanced panel IS run here (G3), per the confirm
  prereg — this is a lever confirm, not a DIAG attribution.
- Telemetry deviation check: run and reported, not a GO bar (see step 11).
- Do NOT edit `sim-findings.md` — findings are listed in the evidence
  file; the coordinator files them.

## Metric review (placeholder — filled at end of run)

- (to be filled)
