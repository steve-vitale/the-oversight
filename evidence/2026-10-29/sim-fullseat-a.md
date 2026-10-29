# sim-fullseat-a — full-seat PURSUIT on the tableseat substrate (axis scale-onramp)

Run: fleshout-20261029T1715Z. Arm: sim-fullseat-a (backlog #920).
Worktree: `~/workspace/worktrees/sim-fullseat-a` (branch sim-fullseat-a).
Base commit: 84eba8a86 (master at registration; no move during the run).
Prereg: evidence/2026-10-29/sim-fullseat-a-prereg.md (commit 09547502,
BEFORE any judged leg). Instruments: commit 0afa37a8. This evidence +
corpus + analyzer + sweep fix + pursuit-policy DELETION land in one
commit (NO-GO landing rule — see below).

## Canon read first

- docs/CANON.md, docs/TABLE.md, docs/PROGRESSION.md, docs/MONSTER-WAVES.md.
- Full seat (code authority): `deedGateReady()` + `tableSeat()` —
  national/global scale, wave bars 5/5/4/3/2 distinct fought, 3+
  contests, 3+ crises, stage ≥ 2, food deeds (sentimentTaught +
  feastSurgeUsed). Lesser: waves 4/4/3, 2+ contests, 2+ crises,
  regional+ scale, stage ≥ 2, food deeds.
- #1223 (MEASURE ONLY — Steve call required before any move; NOTHING
  changed here): docs/PROGRESSION.md:20 and docs/MONSTER-WAVES.md:354
  still say the deed gate needs stage ≥ 3, and in-code comments
  repeat it; docs/TABLE.md was corrected to stage ≥ 2 on 2026-10-28
  (sim-fullseat-stage-a fixture proof). This arm judges against the
  REAL gate functions (code's ≥ 2 bar). If Steve later rules ≥ 3,
  every full-seat count here must be re-read with stage as an added
  blocker — on this band stage blocked 0/16 seeds, so the verdict
  would NOT change (see attribution).

## VERDICT: NO-GO (pilot 8+8, seeds 76001–76008, horizon 180d, death-aware)

The pursuit moved real gates and still produced ZERO full-seat offers.
Judged exactly against the prereg — no re-scoring:

| condition | bar | result |
|---|---|---|
| PRIMARY: ON full offers ≥ 2/8 OR full entered ≥ 1/8 | ≥ 2 offers or ≥ 1 entered | **FAIL** — offers 0/8, entered 0/8 |
| Guard 1: starvation ON total ≤ OFF total + 2 | ≤ 2 | **FAIL** — ON 5, OFF 0 |
| Guard 2: arm-only starvation ≤ 2 | ≤ 2 | **FAIL** — 5 (76001: 1, 76004: 4) |
| Guard 3: median days ON ≥ 0.8 × OFF median | ≥ 103.2 | PASS — ON 167 vs OFF 129 |
| Substrate reproduction (reported, not the GO bar) | OFF lesser ≥ 1, national ever ≥ 4 | **PASS** — lesser 2, national ever 6 |

Per the prereg, pilot NO-GO stops the run — no confirm seeds.
CORRECTION, stated plainly: the sweep's first summary.json computed
`starvationTotal` from a nonexistent row field and wrote NaN (cost1
showed FAIL for the wrong reason). The corpus rows themselves carry
`starvationDeaths` correctly; scripts/analyze-fullseat-a.js recomputes
from the rows (OFF 0, ON 5) and the summary.json was patched with a
correction note. The verdict is unchanged — cost1 fails on real
numbers (5 > 0 + 2) — but the first summary's NaN must never be
quoted. The sweep script is fixed in the same commit.

## Wall numbers (this band's judged corpora, 16 configs)

| | OFF (substrate) | ON (pursuit) |
|---|---|---|
| won | 2 | 0 |
| median days / max days | 129 / 180 | 167 / 180 |
| national ever / final | 6 / 6 | 8 / 2 |
| table invited ever (tableWaiting) | 2 | 6 |
| table entered | 2 (both lesser) | 0 |
| entered FULL / entered lesser | 0 / 2 | 0 / 0 |
| full offers (preview seat full) / full ready | 0 / 0 | 0 / 0 |
| gate-full ever (deedGateReady ok any day) | 0 | 0 |
| wave 4 / wave 5 reach (unlock) | 6 / 0 | 6 / 0 |
| max arc | 4 | 4 |
| starvation deaths total | 0 | 5 |
| lesser previews skipped (ON only) | — | 98 |
| pursuit verbs fired (ON) | — | patrols 43, channels 3025, feasts 7 |

Cumulative across the three full-seat rounds on substrate-family
bands (1955Z 32 configs + 2115Z diag 16 + this 16 = 64 configs): full
seats entered 0/64, full offers 0/64. The full seat is still
decoration, now on a pursuing policy too — not merely untested.

## What the pursuit MOVED (the verbs ran, and they worked)

- Food deeds: OFF blocked 5/8 (always the surge half — sentiment
  landed 8/8 OFF, surge only 3/8); ON blocked 1/8 (only 76004, which
  died day 89 before its hosted feast's buff burned in combat).
  Channeling + weekly feasts + patrolling while feasted closed the
  surge gap the diag arm named.
- Wave-4 bar: OFF median end distance 3 (blocked 7/8); ON median 1
  (blocked 5/8), with w4 cleared outright on 76001, 76003, 76005
  (max-reach). Patrols put more wave-4 monsters in front of the
  village, and the village fought them.
- Table reach: OFF tableWaiting 2/8; ON 6/8. Declining the lesser
  seat kept villages in the game (national ever 8/8 ON vs 6/8 OFF)
  and at Arc IV longer — the window stayed open.
- Stage, contests, crises, w1, w2: never binding on either arm
  (0/16 blocked except one early-death OFF seed on w2/contests).
  The full seat's non-wave bars are all reachable on this band.

## What the pursuit could NOT move: wave 5 (8/8 blocked, distance 2)

Wave 5 never unlocked on any seed (unlockedWave max 4 both arms),
so 0 wave-5 monsters existed to fight anywhere. The bar is not
"hard to fill" — it is unreachable on this band, exactly as the
diag arm found, and pursuit did not change that. This run
decomposes the lock further, into TWO locks:

1. **Standing ≥ 200 (t5).** Max standing touched 199 on 76001 ON
   and 76007 (both arms), 197 on 76003 ON, 192 on 76005 ON and
   76008 OFF — four seeds within 8 points, none crossing. The
   diag band pinned at 99; this band pins at 199. Standing
   approaches the bar and stalls (and decays: 76003 ON peaked 197
   and ended at 100; 76008 ON peaked 99 and ended at 20).
2. **Readiness (`waveUnlockReady(5)`), NEVER ready on any of the 16
   rows.** Even where standing components clear t5, readiness
   blocks: 76007 OFF (capped 227 ≥ 200, hold `defer5`, short
   `veterans` alone); 76001 ON (capped 207, `defer5`, short armor /
   weapons / veterans); 76007 ON (capped exactly 200, `defer5`,
   short armor / weapons / veterans). `veterans` is short on ALL
   16 rows; armor/weapons short on most. Pushing standing to 200
   alone will NOT unlock wave 5 — the readiness gate must be
   audited next (what armor / weapons / veterans readiness
   requires, and whether any policy can move it).

## Per-seed gate attribution (end seat + max-reach distances; full table in corpus)

ON arm, the seeds that reached national but got no full offer — the
brief's exact question, answered per seed:

| seed | ON days/end | end seat | binding at end (max-reach dist) | closest-approach note |
|---|---|---|---|---|
| 76001 | 107, village-lost | lesser | w3 + w5 (w3 1, w4 0, w5 2) | max standing 199, `defer5` (armor/weapons/veterans); surge day 22; 10 lesser skips; 1 starvation death |
| 76002 | 155, village-lost | lesser | w4 + w5 (w4 2, w5 2) | 45 lesser skips; overtime tier 6 (cap); decayed global → regional; max standing 172 |
| 76003 | 180, survived | none (arc 3, no table) | w3 + w5 (w3 3, w5 2) | never reached Arc IV despite national ever; max standing 197, ended 100; surge day 116 |
| 76004 | 89, village-lost | none | w3 + w4 + w5 + food (all) | died early; 4 starvation deaths; surge never landed; max standing 99 |
| 76005 | 167, village-lost | lesser | **w5 ONLY** (everything else 0) | THE closest approach: global max, Arc IV, table waiting, 27 lesser skips, surge day 26 — blocked by w5 alone (unlock uw4, max standing 192) |
| 76006 | 180, survived | lesser | w4 + w5 (w4 1, w5 2) | table waited from day 90 but 0 leg actions — see rank-gate note; surge day 18 |
| 76007 | 120, village-lost | lesser | w4 + w5 (w4 1, w5 2) | max standing 199, capped 200, `defer5`; 9 skips; overtime tier 4 |
| 76008 | 180, survived | lesser | w4 + w5 (w4 3, w5 2) | decayed national → regional (end standing 20); 7 skips; surge day 159 |

OFF arm for comparison: 2 lesser wins (76007 day 90, 76008 day
171); 76003 OFF pinned at standing 99 exactly (the diag band's
99-pin, alive on current master); 76006 OFF died day 40.

**Rank-gate note (substrate behavior, not a bug in this arm):**
the seat legs fire only at national+ rank, but the lesser seat
itself needs only regional+. On 76006 ON the table waited from
day 90 while the village sat at regional rank, so the legs took
0 actions across 90 preview days (wrapper previews 90, leg
previews 0). The same rank gap explains smaller wrapper-vs-leg
preview gaps on 76005 (74 vs 38) and 76002 (65 vs 59): previews
seen while regional never reach the legs. Harmless for the FULL
chase (full needs national/global regardless), but it means
regional-ranked villages with waiting tables are never served by
these legs — a follow-up arm should decide whether the legs'
rank gate should match the seat's own scale bar.

## The cost of refusing the lesser seat (why the guards failed)

- Wins 0 ON vs 2 OFF: every OFF win was a lesser seat the ON arm
  was designed to decline. Refusal converts wins into longer,
  harder grinds — median days rise (167 vs 129) while wins vanish.
- Starvation 5 ON vs 0 OFF, all arm-only: on a band where the
  substrate starves nobody, pursuit + refusal starved villagers
  (76004: 4 deaths by day 89; 76001: 1). Patrol travel, feast
  pantry spends, and longer unseated grinding cost food the
  substrate never spent. The pursuit is not free.
- Overtime: declining accrues the waiting cost to its cap —
  tier 6 on 76002, 76005 (sense replay) and 76006; tier 5 on
  76005 (pilot), tier 4 on 76007. The village fights strictly
  harder monsters (+150% HP, +72% damage at tier 6) for declining,
  and still never reaches full.
- Rank decay: ON national final only 2/8 despite national ever
  8/8 — villages that decline decay back to regional while
  waiting (76002, 76005, 76007, 76008 all ended regional). The
  window does not just stay open; it rots.

## Sense-testing read (NON-MEASURED replay, seed 76005 ON, narration on)

File: evidence/2026-10-29/sim-fullseat-a-sense.txt (240-line ring;
seat day/ending match the measured run — village-lost day 167,
tableWaiting true, tableDone false — narration did not diverge
the ending).
Judgment — meaning, coherence, consequences:
- **Method limit, stated plainly:** the ring is a trailing buffer
  covering only days 166–167, so the table announcement (~day 92)
  and the 27 lesser-skips are NOT in the readable transcript. This
  read cannot judge the invitation beat or the refusal beat
  directly — only their consequences.
- What IS legible: the waiting cost is voiced constantly as
  RERUN ×6 on every fight ("+150% HP, +72% damage, +3 in the
  pack") — the price of declining is honest in combat even
  though the table itself is never mentioned in the final days.
  No line says "the table still waits" or "you declined the
  lesser seat" — a village that refused 27 times hears nothing
  about its refusal except harder monsters.
- The end reads coherently as a failed chase: bearer Kamala
  Balasubramanian dies to the Algorithm in the wild on day 167
  ("No one is left to pick up the Codex. The village dies out —
  quietly, the way villages do") while the table waits
  unanswered. Refusal's endgame here is not a decision but a
  death in the field — the village kept playing and lost.
- Villagers read like people in the readable window (Pascaline
  naming the beast "Big-Eyes" while nobody agrees; Maya of
  Emberhold arriving with 1,805 kcal "honestly counted"; Petra's
  "If they're watching, let them watch me work"). No robotic or
  repeated dialogue flagged in this window.

## Proof gates

- G1 pursuit det-gate: PASS (seed 76001, FULLSEATPURSUIT unset:
  pursuit policy == tableseat-nowait, 129/129 days, ts counters
  identical, no fs keys).
- G2 diag neutrality (re-proof on current master): PASS (seed
  76001: bare vs +diag, 129/129 days, starvation identical).
- G3 corpus integrity: PASS (16/16 rows, days > 0, endSnap with
  dist + diag block on every row; corpus
  evidence/2026-10-29/perseed-fullseat-a/ + summary.json).
- G4 determinism: PASS (ON seed 76005 re-run byte-identical
  modulo corpusFile/corpusSha, 167/167 days, matching the pilot row).
- G5 pre-national read-only: N/A as a comparison (0 comparable
  seeds — every seed reached national in at least one arm, ON
  8/8 ever). Diagnostic, not a failure, per prereg.
- Balanced panel (§15): attempted (`balance-panel.js compare` on
  the corpus summary twice). It printed `review_required` and
  wrote NO output (no compare .md, no out dir) — not an ingestion
  of the corpus as a before/after comparison (a different failure
  mode from the 1955Z/2115Z throw, same consequence). The
  sweep-compare tables above are this run's before/after
  comparison, on identical seeds, judged against the prereg bar.

## Metric review

- The pre-registered bar worked as written; no mid-run re-scoring.
  One instrument bug found and corrected (see Verdict): the
  sweep's first summary summed a nonexistent `starvationTotal`
  field. Lesson for the next arm: aggregate field names must be
  asserted against row shape in a unit check before the sweep
  (the analyzer now serves as that check).
- "Median days" as a cost bar is confounded in BOTH directions on
  seat arms: wins end runs early (lowering it) and refusals grind
  longer (raising it). The 0.8× floor passed here only because
  refusal raised the median; a future refusal arm that dies fast
  could trip it while being better. Consider median days among
  non-winning, non-declining runs — or judge starvation alone
  for refusal arms — next time.
- "Full offer" (preview seat full, any ready state) vs "gate-full
  ever" (deedGateReady ok any day): both are 0/8 ON here, so the
  distinction did not matter this run. On a band where the gate
  passes but the table never waits (Arc IV gap, cf. 76003), the
  two will diverge — keep reporting both.
- G5 (pre-national read-only) is uninformative when the pursuit
  arm reaches national on every seed; future pursuit arms should
  pre-register G5 as diagnostic-only from the start, as this
  prereg did.

## Landing + what the next arm should do

- LANDING (NO-GO rule): the pursuit policy file
  (`scripts/policies/fullseat-pursuit.js`) is DELETED in this
  commit — killed arms leave no trace on master. Instruments +
  evidence + corpus land: the sweep (with a header note that
  re-runs need the policy restored from git history, commit
  0afa37a8), the analyzer, this evidence, the prereg, the
  16-row corpus + corrected summary, the sense transcript.
  ZERO src/js. No default flips. No push, no version bump, no
  live check — merged locally, pending ship.
- NEXT ARM (in order): (1) audit `waveUnlockReady(5)` readiness —
  what armor / weapons / veterans readiness requires, which
  component is actually movable, and whether any policy can move
  it (veterans short on 16/16 rows is the lead); (2) standing-199
  dynamics — what stalls standing one point below t5 and what
  decays it (76003: 197 → 100); (3) only then a pursuit variant
  (e.g. decline-until-deadline, or take-lesser-after-day-X) —
  a variant without the readiness answer will re-measure the
  same wall. Do NOT chase the stage bar (#1223) without a Steve
  call, and do NOT move any deed bar — this arm's job was to
  measure, and the measurement says the bar is not the problem;
  the unlock + readiness chain is.

## Findings outside this arm (reported, NOT touched)

- Standing pins at 99 (76003 OFF, 76004 ON) and at 199 (76001 ON,
  76007) — the pin, not just the bar, deserves its own arm.
- Rank-gate mismatch: seat legs require national+, the lesser
  seat requires regional+ (76006 ON: 90 preview days, 0 leg
  actions). Coordinator call whether the legs' gate should match
  the seat's scale bar.
- Post-refusal silence: a village declining the lesser seat 27+
  times hears nothing about its refusal except harder monsters
  (overtime voicing). Whether the table should re-voice a
  declined seat is a design question, not a bug claim.
- Post-finale routine chatter note (1955Z/2115Z) not re-tested
  here (no wins ON, no finale in the sense window).

## Convergence state

Axis scale-onramp: CONVERGING, not converged. The full seat is
now 0/64 across three substrate-family rounds, and this run
decomposed the wall to its two locks (standing-200 + readiness)
with a closest approach of one lock (76005: w5 only). The
standing directive stands until the tracker records this axis
converged on measured evidence. Claim file + lock are the
coordinator's to retire, not this worker's.
