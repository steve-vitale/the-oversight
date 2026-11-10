# journey-landing r123 — PRE-REGISTER (Lane A, leg 0 LANDING, days 1–14 judged, horizon to d28)

**Run id:** playtest-loop-a-20261110T0445Z (scheduled Tue 2026-11-10 04:45 CST, started ~10:45Z).
Rotation read 0 → leg 0 LANDING; write 0→1 at closeout (verified by read-back).
**Base:** local master `53185abea` (sim-meleefirst-b adoption, pending ship). Branch: `journey-landing` (worktree).
**Lock:** created 10:43:25Z, run_id `2026-11-10T10:43:25Z`. Heartbeat loop `/tmp/hbloop-r123.sh` (PID 4306, every 10 min).
**Numbering note:** Lane A leg counters are per-leg; the last landing run was r122, so this run is r123.
**Pre-flight deviations (LOUD, recorded, standing state):** `git pull --ff-only` FAILED — local master diverged from origin/master (same standing state as r120/r121/r122/r167; ship loop owns reconciliation). Proceed on local master, no merge/push/rebase of origin; landing is ff-only into local master. Main tree clean at run start; disk 34%.

## Seed band — DELIBERATE REUSE (r122 metric review, binding)

**Seeds 1142–1151 (the r121 band, reused on purpose).** r122's metric review
binds the next landing run: "re-test on a band where the defect reproduces,
or seed the panel from the r121 defect seeds." This run seeds the panel from
the r121 defect seeds (1143 Blanca d11 gallowdeer walk-toward-edge; 1148 Jian
d25 arena no-op-same-tile) — the full r121 band, so the carried bindings are
re-judged on the same ten villages. The judge is the WITHIN-RUN before/after
delta on identical seeds (§15), never a cross-run comparison, so the reuse
cannot contaminate the verdict. The band is not in the forbidden-band list.
No new fresh band is burned on a question whose defect seeds are known.

**Design — BEFORE/AFTER on matched seeds (§15, §9):** both drivers run the
SAME seeds 1142–1151, DAYS=28. BEFORE = r122-before driver verbatim except
seeds/OUTDIR/header (it is the r121 driver: Q1 press-stop, Q2 stepping hop,
r121 curious first-reveal fix in src). AFTER = r122-after driver verbatim
except seeds/OUTDIR/header (BEFORE + flee gates: COMPETENT_DIRECTIONAL_FLEE=1
COMPETENT_EXIT_VERIFIED_FLEE=1 COMPETENT_FLEE_REPAIR=1; DPS_RACE off,
FIGHT_ASSESS off — flee decisions untouched, execution only).
Drivers:
- scripts/journey-landing-r123-before-20261110.js (OUTDIR landing-r123-before)
- scripts/journey-landing-r123-20261110.js (OUTDIR landing-r123-after)
Analyzers: scripts/analyze-landing-r122-fleeloop.js (Q1);
scripts/analyze-landing-r118-outingchain.js; scripts/analyze-landing-r121-presshop.js;
scripts/analyze-landing-r104-20261105.js (DIR via argv);
scripts/analyze-landing-r112-practice.js (DIR via argv);
scripts/analyze-landing-r113-navlog.js; scripts/analyze-landing-r107-commit-offer.js
(WITH the r122 settled-favor exclusion); scripts/analyze-landing-r117-huntpractice.js;
scripts/analyze-landing-r117-zerodmg-v2.js; scripts/analyze-landing-r120-scholar-turns.js;
plus transcript greps for the Q8 line (see below).
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price, or gate
change in this run. **Perception law (2026-10-28) stands** — all instruments
read-only; pickers press offered menu items only.
**DELIVER OVER MEASURE (2026-11-01):** Q1 is driver-env only (zero src/js).
A game-code fix is in scope ONLY for Q8 (pre-registered below, root cause
established pre-panel by reading the code and the r122 transcript).

## Canon

docs/CANON.md read at run start. No canon doc covers the flee execution, the
arena entry tile, or the competent-policy gates — Q1 rests on code
(competent.js flee(), game.js tbPlayerMove/findPath) + panel, not invented
canon. docs/CONTESTS.md covers contests-are-played (the 1148 death fight is
a contest-arena fight — it WAS played blow by blow; the defect is the
scholar's flee execution inside it). docs/CONVERSATIONS.md is the canon doc
for Q8 (dialogue) — read before building the fix.

## Q1 (PRIMARY) — THE FLEE THAT NEVER LEAVES: MECHANISM RE-TEST ON DEFECT SEEDS

**Basis:** r121 proved the defect in the corpus (1148: 9 moves to (0,0), 0
strikes, died; 1143: 5 moves toward edge (0,3), 0 strikes, died). r122 built
the fleeloop instrument (proof-tested on synthetic r121-shape fixtures) and
ran it on fresh seeds 1152–1161: flee-loop deaths 0 → 0 — the defect never
reproduced, so the gates' mechanism is UNPROVEN. This run re-tests on the
band where the defect reproduced.
**Pre-registered metric (binding, judged BEFORE vs AFTER on identical seeds):**
- BEFORE-VALIDITY (r122 metric review): if the BEFORE side shows 0
  flee-loop deaths, the run is UNTESTED on mechanism, not GO — the verdict
  is UNTESTED regardless of the AFTER number.
- If BEFORE shows ≥1 flee-loop death: AFTER flee-loop deaths = 0 AND scholar
  fight deaths AFTER ≤ BEFORE AND keptTotal(AFTER) ≥1 (outing chain still
  completes under the new flee behavior) → GO.
- If AFTER has a flee-loop death, NO-GO on Q1 — adjudicate by case (which
  gate failed to fire, and why: sealed arena? push consumed? walk stalled?).
- If AFTER has 0 flee-loop deaths but scholar deaths rise elsewhere,
  adjudicate by case (name the fights), do not call it a pass on the first
  clause alone.
- A flee-loop death is defined as in r122: scholar dies in a fight with 0
  player-strikes AND ≥3 player-moves logged.

## Q2 — M-PR1 SETTLED-FAVOR EXCLUSION (carried, re-measured both sides)

Revised instrument (r122): settled sittings excluded from never-offered.
**Metric (binding, judged on both corpora with the revised instrument):**
per-seed (≥3-turn rule) never-offered ≤1 sitting on ≥8/10 seeds, AND the
settled-favor exclusion fires on the r121 shape (1150 d9 Henry — seed 1150
is in this band). M-PR2: promised/(picked − away-guard) ≥ 80%.

## Q3 — PRACTICE

movedCells d1→d28, attributed, seedsWithMove, skill0→pos, practiceReps.
Hunt reps 0 watch (H1-ESTABLISHED carries — hunt-assignment policy question).
**Bar:** GO if movedCells ≥ 50 with 10/10 seeds moving (r121: 97, r122: 103).

## Q4 — ENGAGEMENT REGRESSION LINES

M-PR1 (see Q2) and M-PR2 (≥80%) both hold → GO.

## Q5 — M7 GOAROUND (R84/R85)

R84 kcal arrivals ≥ 80%; R85 complete ≥ 80% → GOAROUND-HOLDS / RESCUE-GO.

## Q6 — DOORSTEP-OUTINGLIVE (M6)

Carried UNTESTED watch: 0 real triggered steps = UNTESTED, not GO (r115's rule).

## Q7 — MELEE-FIRST SLOT RULE: LANDING SANITY (descriptive, no bar)

Since r122, sim-meleefirst-b landed (melee-first/ranged-fallback slot rule;
proven GO on its own 32-seed panel, E1 30/30). This run re-measures landing
fight shape on the AFTER corpus vs the r121 corpus: scholar strike share,
ally damage share, fight wins/losses, zero-DMG invariant. Descriptive only —
no bar, no verdict; a landing-band sanity check on a rule proven elsewhere.
If the landing numbers move sharply vs r121, name the fights and file it.

## Q8 — OBSERVE-FALLBACK MISFIRE: BUILD THE MISSING POOL (game-code fix)

**Basis (read pre-panel, not run):** r122 filed that "I just said — did you
miss it?" fired once each in 3 sittings (1153-day7, 1154-day7, 1157-day10)
while the want was still unasked (stage 0). I read the 1153-day7 transcript
in full and the code: the observe handler (conversation.js:6652) draws
`drawTruthLine('observedReact', vid)` — but NO `observedReact` pool exists
in `truthLinePools` (truth.js): the only reference in src/ is the call site.
`drawTruthLine` returns `''` for a missing pool, so the handler ALWAYS serves
the hardcoded default `'"Something on your mind?"'`. First observe in a
sitting: spoken. Second observe in the SAME sitting: the line is already in
the per-sitting ledger → sayLine self-blocks → convoTurn tail fallback
(conversation.js:7169) serves `convoSelfRepeatLine` → first pool entry "I
just said — did you miss it?". Deterministic, not a fluke: the accusation
fires about a QUESTION she asked ("Something on your mind?"), not anything
she told the player — the favor only surfaces at turn 15. The r122
adjudication stands.
**Fix (one src change):** add a real `observedReact` pool to
`truthLinePools` (~8 distinct reactions to being watched, in the observeCalm
shape), so repeated observes draw fresh lines without replacement per game
and never self-block into the accusation. The hardcoded default stays as the
fallback if the draw ever returns empty. No other call site changes.
**Proof test:** new `scripts/test-journey-landing-r123-observe-react.js` —
drives two observes in one sitting on a live harness game: second react
differs from the first AND no "I just said" line appears in the sitting;
plus a drawTruthLine('observedReact') unit check (non-empty, distinct across
draws). BEFORE (unfixed code): the test must FAIL (second observe serves
the accusation); AFTER: ALL GREEN.
**Panel re-run (r121 pattern):** after the fix lands in the worktree, the
AFTER driver re-runs on seeds 1142–1151; Q8 metric: 0 "I just said — did
you miss it?" firings across the post-fix AFTER transcripts (grep), and the
census JSONs byte-identical to the pre-fix AFTER corpus except transcript
files (dialogue-only effect, as in r121). If the census moves elsewhere,
adjudicate before calling it done.
**Pre-registered metric (binding):** proof test ALL GREEN post-fix AND 0
"I just said" firings on the post-fix AFTER corpus → GO. If the pool change
moves any non-transcript census number, the fix is NOT done until the
movement is adjudicated.

## Carried bindings (judged fresh on the AFTER corpus)

- **M1 ALIVE-D14:** 10/10 villages alive at d28.
- **M2 SYSTEM CONTACT:** 10/10 (systemDay d8–d9).
- **M3 FIGHT-LOG:** 0 unknown/mixed trigger.
- **M5 PEOPLE:** PASS (sense-read below — read full transcripts).
- **Zero-DMG invariant:** 0 violations.
- **Miriam line:** 0 "That's settled".
- **R66 HUNGRY:** report hungry share + starvation deaths (r122: 5/10, 0 deaths).
- **R73 narrow windows:** report NARROW / kept-inside-narrow.
- **Mantle latency:** report max (r122: max 2 on 1161, sampling-lag watch).
- **1130-d6 amnesia shape:** 0 recurrences.
- **Scholar-turns watch:** verb totals; no living 0-strike ≥3-move fight.
- **Deflect-fallback repetition:** worst sitting count (r122: 3× — carried
  voice-pass candidate, Issue 2: dlg:subject acknowledgment repeats verbatim
  up to 3× in one sitting — NOT this run's fix; Q8 is the observe pool only).
- **6394 flat fall-through:** 0 occurrences.
- **Kill-mean trend:** report per-seed mean.
- **Poison re-test:** count live re-tests.
- **Scholar-eats-first:** held design question, not changed.

## Metric review (placeholder — filled at closeout)

- (to be written in the run note)
