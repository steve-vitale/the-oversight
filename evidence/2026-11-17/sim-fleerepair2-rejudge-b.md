# sim-fleerepair2-rejudge-b — B1 re-judged on the diagnosis band (measurement only)

**Arm:** sim-fleerepair2-rejudge-b (Loop B run fleshout-loop-b-20261118T0026Z) ·
**Branch tip:** `1725b9336` (sim-fleerepair2-b: evidence + panel) — NO code change
in this run · **Prereg:** `evidence/2026-11-17/sim-fleerepair2-rejudge-b-prereg.md`
(frozen before any sims in this run) · **Band:** diagnosis 103601–103608 ·
**Horizon:** 150d death-aware · **Policy:** competent verbatim · **Substrate
both legs:** `VETREENGAGE=1 PARTYSIZE4=1` · **Armed leg adds:**
`FLEEREPAIR2=1` · **Ctl leg:** the existing diagnosis corpus (NOT re-run) ·
**Armed leg:** new run, anchor `1725b9336d50`.

## Verdict: NO-GO per the frozen prereg — B2 misses by one kill

B1 is finally judgeable, and it passes cleanly: the gate fires 15 times, all
9 suburb hunts disappear, zero launched suburb meetings on the armed leg
against 3 on control. But the verdict rule is conjunctive, and B2 misses:
wave-4 kills fall 6 → 5, the whole gap on one seed (103602), where the
village that stops launching suburb hunts never meets the two wave-4
monsters it killed on control. The gate removes no killing power — both
lost kills were wild meetings, not launched hunts — but the frozen bar is
absolute (armed >= control) and the prereg forbids re-scoring, so the arm
stays HELD. Every other bar passes, and the gate saves lives (deaths
744 → 703, expedition deaths 237 → 227).

| Bar | Result | Numbers |
| --- | --- | --- |
| B1 (PRIMARY): launched meetings vs a leave-counter species (suburb) | **PASS** (non-vacuous: ctl 3 ≥ 1) | ctl 3 → armed 0; suburb launches 9 → 0; gate blocked 15 |
| B2 (no-kill-loss): wave-4 kills armed ≥ control | **FAIL** | 6 → 5 (all on seed 103602: 2 → 1) |
| B3 (guardrail): expedition deaths armed ≤ control ×1.10 AND total deaths armed ≤ control ×1.10 | **PASS** | exped 237 → 227 (cap 260.7); total 744 → 703 (cap 818.4) |
| B4: proof green on final tip | **PASS** | `scripts/test-fleerepair2-b.js` 29/29, 0 fail |
| Instrument | **CLEAN** | 8/8 files both legs, 0 instrument errors, missingHp 0, recMismatch 1/1 (diagnostic only, same both legs) |
| B5: balanced panel, no uninvestigated regression | **INVESTIGATED** | `review_required` decision label; ZERO `regression_watch` rows (24 not_observed, 6 no_material_signal, 1 descriptive); village deaths/run 93 → 87.875 |

## Calibration verification (run FIRST — passed)

Verified directly from the per-seed diagnosis files, not just the derived
analysis: seed 103602 carries 9 `v4departs` rows with target `suburb`,
result `launch` (days 90–125), and 6 suburb meetings, of which the
analyzer's launched join counts 3 (day 90 Ruby, day 125 Dmitri, day 126
Emma), round-1-zero 2, wise leaves 3 — exactly the counts the 2230Z
evidence expected. All other seeds: 0 suburb launches, 0 launched suburb
meetings. Calibration gate PASSES: the phenomenon exists on this band, so
B1's 0 on the armed leg is a real zero, not a vacuous one.

Counting-definition note (not a discrepancy): the analyzer counts 11
suburb seed events on the ctl leg while a raw grep of `v4seeds` rows with
target `suburb` finds 14 (8 on 103602 vs the analyzer's 5). The analyzer
counts seed calls that create/retarget a plan; the raw rows include
repeat calls against an already-targeted plan. The 2230Z evidence's "six
suburb seed rows" on 103602 is the same family of counting. Launches and
launched meetings — the judged quantities — agree exactly between the raw
files and the analyzer.

## Before / after — diagnosis band 103601–103608

| Metric (8 seeds) | Control (diagnosis corpus) | Armed (`FLEEREPAIR2=1`) |
| --- | --- | --- |
| Launches (deduped by vid/day) | 20 | 13 |
| Suburb seed events (`mid='suburb'`) | 11 | 15 |
| Gate blocked (`blocked=true`) | 0 | 15 |
| Suburb-hunt launches | 9 | 0 |
| Launched suburb meetings | 3 | 0 |
| Launched suburb meetings, round-1-zero / wise leaves | 2 / 3 | 0 / 0 |
| Wave-4 kills | 6 | 5 |
| Deaths (total / expedition / starvation) | 744 / 237 / 2 | 703 / 227 / 2 |
| Villages survived | 7/8 (lost 103608 d45) | 7/8 (lost 103608 d45) |
| Launched meetings (any target), mean damage share | 4, 0.0107 | 2, 0.0484 |
| Wall: national standing / rank / table / wins / wave 4 / wave 5 | 2 / 0 / 0 / 0 / 7 / 2 | 2 / 0 / 0 / 0 / 7 / 2 |
| Median survival (days) | 151 | 151 |

Per-seed, armed vs control (only the seeds that move):

- **103601:** identical (deaths 83, kills 1, launches 0). Gate blocked 2
  suburb seeds with no behavioral difference.
- **103602:** the whole story. Launches 9 → 0 (all 9 were suburb hunts);
  the village instead launches 2 hunts against Ad Break (days 102, 105).
  Deaths 137 → 108, expedition deaths 36 → 26. Wave-4 kills 2 → 1 (see
  §The one lost kill).
- **103603, 103604, 103606, 103608:** byte-identical trajectories
  (kills, deaths, launches all equal). 103608 dies day 45 on both legs.
- **103605:** kills 0 → 0, deaths 102 → 90, launches 0 → 0 — but suburb
  seed events 1 → 7, all 7 blocked. Without a suburb plan occupying the
  slot, the villagers keep meeting the Suburb in the wild and the seed
  call fires (and is blocked) after every flee. The gate is a sieve the
  village keeps pouring through, not a one-time refusal.
- **103607:** launches 1 → 3 (two extra non-suburb hunts on armed),
  kills 1 → 1, deaths 83 → 83. Blocking the suburb seeds freed the plan
  slot for other hunts.

## The one lost kill (B2, seed 103602)

Control's two wave-4 kills, and what the armed leg did instead:

- **Day 98, Ruby vs the Herald (717 dealt, 7 rounds, world-tick).** Ruby
  met it in the wild with James called in as help — not a launched hunt
  (no launch targeted the Herald). On the armed leg Ruby's day-98 meeting
  never happens: after the first gate block (day 89) the village's
  trajectories diverge — different dawn bids, different positions, a
  different encounter stream.
- **Day 127, Dmitri vs the Algorithm (485 dealt, 5 rounds, world-tick).**
  The gate record on the fight says it plainly: Dmitri's plan was stage
  `hunt`, target `suburb` — he was OUT on a suburb hunt when he met the
  Algorithm in the wild and killed it. The suburb hunt itself delivered a
  wave-4 kill of a different monster, met en route. On the armed leg
  Dmitri never goes on the suburb hunt, so never meets that Algorithm.
- **Armed's one kill: day 133, contact finish vs a 1-HP Herald**
  (mHpStartRec 1, rounds 0, 23 dealt — "Rawiri does not let it slip
  away… The Herald falls"). A finishing blow on a nearly-dead monster
  met in the wild, not a hunt kill.

So the B2 miss is trajectory divergence, not removed killing power: the
gate takes away no fight, no weapon, no kill — it takes away 9 wasted
launches, and the chaotic encounter stream then deals different hands.
One kill on one seed is within the noise of this system, and the gate
simultaneously saves 10 expedition deaths on the same seed. But the
frozen bar is `armed >= control`, the count is 5 < 6, and the prereg
forbids re-scoring against a friendlier metric. The verdict is NO-GO.
Whether a one-kill bar on 8 seeds is the right instrument for a lever
whose effect is removing wasted launches is a metric-review question for
the NEXT run, not a re-score in this one.

## Sense-testing

Read the 'leave' lines and `vetSays` on the armed leg (seed 103602).

- The wise leave still reads as people making a decision, and it still
  fires — on wild meetings, which the gate does not touch: *"Miles reads
  the sterile streets — you can't kill a suburb. They walk out.
  (Navigation is victory.)"* (day 89), *"Sigrun reads the sterile
  streets…"* (day 113), *"Rawiri reads the sterile streets…"* (day 114).
  Before the trick is known the same villagers stand and fight it for
  3–4 rounds (129 and 265 damage dealt, days 88–89) and flee wounded —
  the learning path is intact on the armed leg too.
- The round-1 leave does not pre-empt the monster's round-1 action: on
  day 89 Miles walks out and the Suburb still lands HOA Fine for 22
  afterwards; on day 114 Rawiri walks out and takes Property Tax for 20
  (18 HP left). That is the engine's existing round resolution, untouched
  by this arm — the leave is a decision, not an escape hatch.
- Silence, again. No `vetSays` line on the armed leg ever voices a suburb
  hunt plan being made, a launch against the Suburb, or the gate's
  refusal — the gate returns null silently. The 2230Z evidence already
  noted this as the same silence family as the empty morning (finding
  #2493) and the picked homebody (finding #2495); it is unchanged here,
  and out of scope for this measurement-only run (no voice line built).

## Metric review

- **B1 is now judged, and the calibration gate did its job twice.** On
  the fresh band it stopped a vacuous GO; on this band it confirmed a
  real one (ctl 3 launched meetings). The metric (count of launched
  meetings vs a leave-counter species) is the right one; the band is the
  population that has it.
- **B2's bar is brittle at this sample size, and this run proves it.**
  A one-kill difference on 8 seeds, produced by trajectory divergence
  in the wild-encounter stream rather than by anything the lever removes,
  flips the whole verdict — while the same seed shows the lever saving 10
  expedition deaths. The bar as frozen counts a kill the lever could
  never have produced (a wild meeting en route to a suburb hunt) as a
  loss. Proposal for the NEXT run, not a re-score here: judge B2 on a
  larger band (12–16 seeds), or on launched-hunt kills only, or with a
  one-kill tolerance — and pre-register whichever revision before the
  sweep. The verdict stands as NO-GO under the frozen bar.
- **B3's guardrail is not noise, in the other direction.** Total deaths
  −41 with expedition deaths −10: the gate saves villagers by not
  sending them on futile expeditions. The guardrail compares leg totals
  as frozen, and it passes with room.
- **Drift check:** did not fire (null) — correctly, since the lever
  fired (blocked 15), so the legs are not expected to be identical. The
  4 non-diverging seeds are trajectory-identical between legs, which is
  the determinism the single-seed diagnosis relied on.
- **recMismatch 1/1 on both legs.** The Pack Hunt / Bird Strike recovery
  hole (findings #2497/#2501) reads the same on ctl and armed — diagnostic
  only per the prereg, no verdict moves.
- **Balanced panel (B5):** `review_required` decision label, with ZERO
  `regression_watch` rows (24 not_observed, 6 no_material_signal, 1
  descriptive). The label is the panel's standing verdict for a
  screen-size (non-confirmation) panel, not a flagged regression: the
  only moving observed metrics are village deaths per run (93 → 87.875,
  down) and per 100 days (66.91 → 63.56, down), both
  `no_material_signal`. No uninvestigated regression.
- **Launched-meeting mean share 0.0107 → 0.0484** is the shape the fix
  promises: fewer zero-share launched meetings (the suburb leaves were
  the 0-share bulk on control), though n=2–3 meetings makes it
  descriptive, not a claim.

## Infrastructure notes (for the record, not the verdict)

- **OUTDIR pathing trap.** The driver hardcodes
  `path.join(REPO, 'evidence', '2026-11-17', OUTDIR)`, so OUTDIR must be
  a bare directory name. This run passed a full `evidence/2026-11-17/…`
  path, and the 8 per-seed files landed nested at
  `evidence/2026-11-17/evidence/2026-11-17/perseed-fleerepair2-rejudge-b-arm/`.
  The sims themselves were valid (anchor `1725b9336d50`, errors 0, all 8
  seeds); after the run completed the directory was moved to the intended
  `evidence/2026-11-17/perseed-fleerepair2-rejudge-b-arm/` and the empty
  nested dirs removed. File contents are untouched; only the run log's
  `file:` fields still cite the nested path. Next run: pass the bare
  dirname.
- **No write flap in this run.** All 8 seeds wrote cleanly on the first
  attempt (log 8 lines, stderr empty). The sibling arm (sim-seekgate-b)
  ran concurrently on the same band in its own worktree; no shared writes
  were touched.
- **Analyzer exit code 1** is the NO-GO verdict (B2 fail), not an
  instrument failure — the analysis JSON was written normally. The
  original `fleerepair2-b-analysis.json` (fresh panel) was NOT
  overwritten: this run wrote `fleerepair2-rejudge-b-analysis.json` via
  the `FLEEREPAIR2_ANALYSIS_OUT` env var, and the original still reads
  suburb launches 0/0, w4kills 6→7.

## Limitations and next arms

1. **The arm stays HELD on B2.** The fix works exactly as designed
   (B1 passes non-vacuously, deaths down, no regression), but the frozen
   conjunctive verdict is NO-GO. The coordinator's next call: re-judge
   B2 under a revised, pre-registered bar (larger band, launched-kill
   scope, or one-kill tolerance) — or accept the one-kill miss as the
   price of removing wasted launches. Do NOT re-score this run.
2. **The SEEK clause is not covered** (winPlanFightGate walks a
   standing-stage party into any wave-3+ beast once the trick is known,
   including a suburb) — already in sim-findings.md from the 2230Z run.
3. **Pre-existing suburb plans** keep targeting the suburb; the gate only
   blocks new seeding/retargeting. A follow-up that retires live suburb
   plans needs its own prereg.
4. **The gate is silent.** No voice line marks a refused suburb hunt
   (see §Sense-testing). Measurement only here; a voice line is a build
   arm, not this run.
5. **The 103605 re-seed sieve:** with no suburb plan to hold, villagers
   re-meet the Suburb and re-trigger the (blocked) seed call 7 times on
   one seed. Harmless (all blocked), but it means the gate fires
   repeatedly rather than once — worth a line in any follow-up that
   voices or logs the refusal.

## Files

- Prereg: `evidence/2026-11-17/sim-fleerepair2-rejudge-b-prereg.md`
- Evidence (this file): `evidence/2026-11-17/sim-fleerepair2-rejudge-b.md`
- Armed corpus: `evidence/2026-11-17/perseed-fleerepair2-rejudge-b-arm/`
  (8 files) — ctl leg is the existing diagnosis corpus
  `evidence/2026-11-17/perseed-fleerepair2-b-diag/` (8 files)
- Analysis: `evidence/2026-11-17/fleerepair2-rejudge-b-analysis.json`
- Balanced panel: `evidence/2026-11-17/fleerepair2-rejudge-b-panel-before.json.gz`,
  `evidence/2026-11-17/fleerepair2-rejudge-b-panel-after.json.gz`,
  `evidence/2026-11-17/fleerepair2-rejudge-b-panel.json`,
  `evidence/2026-11-17/fleerepair2-rejudge-b-panel.md`
- Run logs: `evidence/2026-11-17/fleerepair2-rejudge-b-arm.log`,
  `fleerepair2-rejudge-b-arm.err`
- No code changed; no new analyzer or test files (branch instruments
  reused as-is; proof `scripts/test-fleerepair2-b.js` 29/29 on tip
  `1725b9336`).
