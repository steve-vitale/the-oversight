# sim-vetshape-a — is the veterans-bar SHAPE the binding constraint on the standing-99 pin? (axis scale-onramp)

Run: fleshout-20261024T2315Z. Worktree: `~/workspace/worktrees/sim-vetshape-a`
(branch sim-vetshape-a). Axis: scale-onramp (standing directive — still stands:
wins only via default-OFF instruments, lesser seat only, wave 5 still 0).
Sibling arm running in parallel: vetkill-diag (encounter/kill opportunity or
killer survivorship classification). This arm is step 2 of the 2215Z run's
named next blank, run as its own arm.

## Canon read first

- docs/CANON.md (manifest), docs/MONSTER-WAVES.md (wave 4: The Mirror Draft,
  standing >= 100; wave 5: The Producers, standing >= 200 AND wave-4 faced;
  readiness demands table: wave 4 veterans 1 killed wave-3+, wave 5 veterans 2
  killed wave-4+), docs/TABLE.md (combat-readiness gate, design call #4
  2026-10-16: readiness gates the standing unlock), docs/MEASUREMENT.md
  §§9-12, 14-15 (pilot gate, death-aware horizons, pre-registration, metric
  binding, balanced panels).
- Code authority: src/js/standing.js `waveCombatReadiness(w)` — demands as
  recalibrated 2026-10-18: wave 4 = armored 3 @P>=10, armed 5, tricks 3,
  veterans 1; wave 5 = armored 4 @P>=15, armed 6, tricks 3, veterans 2.
  The VETSHAPE instrument (2026-10-17, already in standing.js, default OFF):
  VETSHAPE=1 counts DISTINCT killer vids with wave-(w-1)+ kills in
  state.waveKillLog, living-OR-DEAD; unset = pristine living-only behavior.
  This arm does NOT edit src/js/standing.js, does NOT move readyDemand
  numbers, does NOT flip any default. Policy-side probe only (environment
  flag + sweep script).
- Prior run: evidence/2026-10-24/sim-standing99-diag-a.md (seeds 73671-73678,
  tableseat-nowait substrate, DIAG-GO). Its corpus is the reason this probe
  is sharp: on all 3 end-stuck seeds the wave-4 readiness bar's ONLY binding
  bar at end is veterans = 0 living killers (73674: at pin and end, short
  ['veterans']; 73675: same; 73677: armor also short at pin, cleared by end,
  short ['veterans'] at end). Armor/armed/tricks all clear on all three.
  So the shape question is exactly: do DEAD wave-3+ killers exist in the
  ledger on those seeds? If yes, living-or-dead counting releases the bar;
  if the ledger holds no killers at all, shape cannot be the constraint.

## PRE-REGISTRATION (binding — written BEFORE sweeping, judged against it, never re-scored)

- Substrate (both columns, identical seeds): tableseat-nowait —
  leanlinkrescue courtship (LEANLINKRESCUE=1) + seat legs only
  (TABLESEATNOWAIT=1), no wait leg.
- Baseline: tableseat-nowait with VETSHAPE unset. Armed: tableseat-nowait
  with VETSHAPE=1. Both columns wrapped with the ALREADY-EXISTING
  standing99-diag recorder (STANDING99=1 on both arms) so daily rd4/rd5
  readiness + computed gated standing are recorded identically in both
  columns. STANDING99 appears nowhere in src/js (verified by grep) — it is
  a recorder-only gate, and the diag arm proved that recorder neutral on
  this exact substrate (G2 identical days/gameDays/ts/starvation, 8/8).
  The ONLY delta between columns is therefore VETSHAPE, as required.
  NOTE (stated before sweeping): recorder-neutrality (G2 in the diag arms)
  does NOT apply here — armed intentionally changes gate arithmetic, so
  baseline vs armed trajectory identity is NOT expected and must NOT be
  claimed.
- Seeds: 73671-73678 (the SAME band as sim-standing99-diag-a — reuse is
  intentional; this is the shape probe on the measured band).
- Horizon: 180 loop-days, death-aware (runDays breaks on Game.over).
- Primary GO requires BOTH:
  (1) RELEASE: armed releases at least 2 of the 3 end-stuck seeds
  {73674, 73675, 73677} to wave-4 readiness, where 'released' means rd4
  ready becomes true on at least 1 day AND the gated standing total reaches
  >=100 (or a wave-4 fight is recorded — the per-seed table reports which
  criterion fired), vs 0 released among those 3 seeds in my own baseline;
  AND (2) the scalemetric deciding cost bar: armed starvation total <=
  baseline starvation total + 2, AND armed median days >= 0.8x baseline
  median days.
  If (1) fails (0-1 releases), the verdict is NO-GO for the shape lever —
  a decided outcome, not a wasted run: the bar's shape is not the binding
  constraint on this band, and the next lever is encounter/kill opportunity
  or killer survivorship (per the sibling vetkill arm's classification).
  Do NOT re-score a NO-GO against a friendlier metric (e.g. 'any seed
  moved' or 'rd5 flickered').
- Gates:
  (G1) baseline replication — my own VETSHAPE-unset baseline must match
  the published sim-standing99-diag-a baseline aggregates on this band
  (won 4/8, national ever 8/8, final 7/8, wave 4 5/8, wave 5 0/8,
  starvation 3, median 150, deaths 261); investigate and report ANY
  mismatch, do not hide it.
  (G2) corpus integrity: 16/16 rows, every row carrying rd4/rd5 readiness
  + gated standing + wave reach + win/table outcomes.
  (G3) det-gate: a VETSHAPE-unset run through my sweep script equals the
  unwrapped tableseat-nowait run on one seed (days/counters identical) —
  the flag, not the sweep, must be the only delta. (Recorder surface is
  present by design in the wrapped run — the recorder is pure-read, proven
  neutral in the diag arm — so the det-gate compares days/gameDays/ts
  counters, not trajectory absence.)
- GO means GO CANDIDATE as an instrument, default-OFF only — landing
  VETSHAPE as default play is a coordinator/Steve call, NOT made by this arm.
- Balanced panel (§15): attempt `scripts/balance-panel.js compare` on the
  corpus; if it throws (known failure on per-seed rows), record exactly why
  and use sweep-compare tables as the comparison.
- Sense-testing law: one NON-MEASURED narration-on replay read of one
  seed — a released seed if any release occurs (does the release feel
  earned and communicated, or does the door just silently open?), else
  stuck seed 73675 (confirm VETSHAPE changes gate arithmetic only, not
  narration — that silence is itself a finding). Sense file written
  alongside this evidence file.

## Instrument

- `scripts/test-vetshape-a-sweep.js` (sweep + --detgate + --sense modes),
  modeled on `scripts/test-standing99-diag-sweep.js` (loadGame/setupGame/
  runDays, per-config incremental corpus writes via
  `scripts/sim-postunlock2-b-writer.js`). Reuses `scripts/policies/
  standing99-diag.js` (recorder) and `scripts/policies/tableseat-nowait.js`
  (substrate) unchanged. No new policy file: the armed column is the
  substrate + VETSHAPE env flag only.
- `scripts/test-vetshape-a.js` (proof test: release + cost-bar computation
  on synthetic rows; the sweep gates G1/G3 live in the sweep script).
- Existing VETSHAPE unit proof re-run, not duplicated:
  `scripts/test-vetshape-20261017.js` on current master.
- Corpus: `evidence/2026-10-24/perseed-vetshape-a/` (16 rows + summary.json).

## RESULTS — NO-GO for the shape lever (pilot 8+8, seeds 73671–73678, horizon 180d, death-aware)

Sweep: `node scripts/test-vetshape-a-sweep.js` (exit 0). Corpus:
`evidence/2026-10-24/perseed-vetshape-a/` (16/16 rows + summary.json,
per-config incremental writes via the chunked writer subprocess).
Gates: G1 baseline replication PASS (all 8 aggregates exact), G2 corpus
integrity PASS, G3 det-gate PASS (seed 73671,
sweep-script VETSHAPE-unset run == unwrapped tableseat-nowait: days 93/93,
gameDays 93/93, ts identical). Engine-gated validation PASS (16/16 rows:
computed gated == engine gated at end).

### Verdict against the pre-registered bar

- RELEASE: baseline 0/3, armed 0/3 of {73674, 73675, 73677}. Required >= 2
  armed releases. FAIL — and not marginally: VETSHAPE moved NOTHING on
  any stuck seed (identical days, wave reach, gated, hold, starvation).
- COST BAR: PASS, trivially — armed starvation 3 == baseline 3 (<= 3+2),
  armed median 150 == baseline 150 (>= 0.8x150). The cost bar passes
  because the lever is inert here, not because it is cheap.
- VERDICT: NO-GO for the shape lever, as pre-registered. This is a decided
  outcome, not a wasted run: the bar's shape is NOT the binding constraint
  on this band. Per the brief, the next lever is encounter/kill opportunity
  or killer survivorship (the sibling vetkill arm's classification). NOT
  re-scored against any friendlier metric: no 'any seed moved' claim is
  made (see the 73676 criterion flip below — it changed a label, not an
  outcome, and is reported as such, not as a release).

### Per-seed release table (baseline vs armed)

| seed | base days/wave/won | base rd4 ready? / maxGated / maxRd4Vet | base end gated/hold | armed days/wave/won | armed rd4 ready? / maxGated / maxRd4Vet | armed end gated/hold | released? (criterion) |
|------|--------------------|----------------------------------------|---------------------|---------------------|-----------------------------------------|----------------------|------------------------|
| 73671 | 93 / 4 / 0 | yes d65 / 199 / 2 | 199 defer5 | 93 / 4 / 0 | yes d65 / 199 / 2 | 199 defer5 | base yes (ready+gated); armed yes (ready+gated) |
| 73672 | 106 / 4 / 1 | yes d63 / 199 / 1 | 199 defer5 | 106 / 4 / 1 | yes d63 / 199 / 2 | 199 defer5 | base yes; armed yes |
| 73673 | 134 / 4 / 1 | yes d105 / 172 / 1 | 172 none | 134 / 4 / 1 | yes d105 / 172 / 2 | 172 none | base yes; armed yes |
| 73674 | 180 / 2 / 0 | NO / 99 / 0 | 99 defer4 | 180 / 2 / 0 | NO / 99 / 0 | 99 defer4 | NO in both |
| 73675 | 180 / 3 / 0 | NO / 99 / 0 | 99 defer4 | 180 / 3 / 0 | NO / 99 / 0 | 99 defer4 | NO in both |
| 73676 | 174 / 4 / 0 | NO / 100 / 0 | 100 floor | 174 / 4 / 0 | yes d117 / 100 / 1 | 100 floor | base yes (wave4); armed yes (ready+gated) — criterion label only, outcomes identical |
| 73677 | 98 / 3 / 1 | NO / 99 / 0 | 99 defer4 | 98 / 3 / 1 | NO / 99 / 0 | 99 defer4 | NO in both |
| 73678 | 150 / 4 / 1 | yes d93 / 172 / 2 | 172 none | 150 / 4 / 1 | yes d93 / 172 / 2 | 172 none | base yes; armed yes |

Stuck-seed kill ledgers (post-run pure read of state.waveKillLog,
distinct killer vids, wave-3+): 73674 living 0 / dead 0 in BOTH arms;
73675 living 0 / dead 0 in BOTH arms; 73677 living 0 / dead 0 in BOTH arms.
There are NO wave-3+ killers at all on the stuck seeds — living or dead —
so living-or-dead counting has nothing to count differently. The veterans
bar reads 0 because the village never killed a wave-3+ monster, not because
its killers died. That is the whole NO-GO in one line.

The instrument itself WORKS where dead killers exist, which is what makes
this NO-GO diagnostic rather than inconclusive: armed maxRd4Vet rose on
73672 (1→2), 73673 (1→2), and 73676 (0→1, flipping its release criterion
from wave4 to ready+gated on day 117) — gate arithmetic demonstrably
changed — while every outcome on every seed stayed identical (days, wave
reach, wins, national, table, starvation all equal baseline per seed).
Shape changes the count; the count changes nothing on this band, because
the stuck seeds' ledgers are empty.

### Wall numbers (identical in both columns — every aggregate equal)

- Won: 4/8. National ever: 8/8. National final: 7/8 (73676 ends regional).
  Table waiting: 5/8. Entered (tableDone): 4/8. Seat takes: 4, attempts 4,
  failed 0. (The corpus does not separately instrument lesser vs full seat
  in the seat counter; no full-seat claim is made here.)
- Wave 4 reach: 5/8. Wave 5 reach: 0/8. Max arc: 4. Median survival: 150
  loop-days (per-seed days: 93, 106, 134, 180, 180, 174, 98, 150).
  Max days 180 (three seeds run the full horizon).
- Starvation: 3 total (73672: 1, 73675: 1, 73678: 1). Deaths: 261 total,
  identical in both columns.
- Death-cause shares (both columns identical): villager combat 106
  (40.6%), villager-vs-villager combat 71 (27.2%), player arena 38 (14.6%),
  expedition 16 (6.1%), monster 11 (4.2%), ambush 3, sickness 3,
  starvation 3, wound 2, rest 1 each (Suburb, dehydration, Nevermore,
  contest x2, alien, expedition-player, night).
- Four-realm formation: NOT instrumented in this corpus (rows carry
  rank/arc, not realm formation) — not claimed, not inferred.
- ScaleRank reading (reported raw, not interpreted): final rank global on
  7/8 seeds, regional on 73676, national on 73678; national ever/final use
  the sweep's rank>=national threshold, so global counts toward national
  exactly as in the diag arm's aggregates.
- Trap acquisition by source, counter discovery/counter-kill rate,
  young-link succession survival, tier-2 and wave-3 reach: not instrumented
  in this sweep's rows (the release question needed readiness + ledger,
  not those counters) — listed here as unmeasured, not zero.

### Village assessment (plain words)

The village on this band is the same village the diag arm measured, and
VETSHAPE does not change its story at all. Five seeds get through the
wave-4 door and four sit at the table; three seeds stall one point short
of it (standing 99) for the entire back half of their runs — not because
the door demands something exotic, but because nobody in those villages
ever killed a wave-3 monster. The door's other bars (armor, weapons,
tricks) are all cleared on the stuck seeds; the only bar left is veterans,
and the ledger that would fill it is empty. One stuck seed (73674) never
even reached wave 3, so there was nothing wave-3 to kill; the other two
reached wave 3 and still recorded no wave-3 kill across 180 and 98 days.
The question the shape lever cannot answer — and the sibling vetkill arm
must — is whether wave-3 monsters are ever met and fought on those seeds,
or whether the village never gets the chance. Food is not the binding
story here: starvation is 3 deaths in 261, and the cost bar passes by
identity.

### Sense-testing read (NON-MEASURED replay, seed 73675, VETSHAPE=1)

File: `evidence/2026-10-24/sim-vetshape-a-sense.txt` (240 ring lines,
180 days, survived, maxWave 3, tableWaiting false, tableDone false).
The game's ONLY readiness narration is one d180 System line: "The next act
is still waiting — blood your fighters (0 of 1 veterans)." The count is
honest and the bar is named — but nothing ever says what a veteran IS, how
a fighter becomes one, or that wave-3 monsters are the path; no wave-3
monster is named and no kill is narrated anywhere in the ring. VETSHAPE
changes gate arithmetic only, not narration: the count is still 0 because
the ledger is still empty, so the replay reads exactly like a baseline
stuck seed. That silence is itself the finding: the village is told the
number, never the path, and on this seed there is no path in play at all.

### Balanced panel (§15) — attempted, does NOT ingest this corpus

Attempted: `node scripts/balance-panel.js compare --before
evidence/2026-10-24/perseed-vetshape-a/summary.json --after <same>
--out /tmp/panel-vetshape-attempt`. Result: the SAME known failure as
1955Z/2115Z/2215Z — `TypeError: Cannot read properties of undefined
(reading 'days')` in `scripts/lib/balance-scorecard.js` `comparePanels`,
no output written. The panel requires panel-driver output (panel.json.gz
with observer/contract digests and panel records), not per-seed sweep
rows; running a full panel would measure the panel's own fixed policies,
not this arm's tableseat-nowait substrate. The sweep-compare tables above
are the before/after comparison for this run, on identical seeds, judged
against the pre-registered bar. (Panel-contract work belongs to the live
panel-contract-rulings lane — not touched.)

### Existing VETSHAPE unit proof re-run (NOT duplicated — reported as run)

`node scripts/test-vetshape-20261017.js` on current master: 10 passed,
6 failed. Every failure is a STALE EXPECTATION from the 2026-10-18 demand
recalibration, not a shape regression — read carefully:
- All SHAPE assertions pass: gate-off counts living killers only, gate-on
  counts the dead killer, scholar counted identically both modes,
  sub-threshold (w2) kills excluded both modes, waves 1-3 never gated.
- The 6 failures assert the OLD demands (wave-4 veterans demand 2,
  wave-5 demand 3). Current code (standing.js demands table) is wave-4
  veterans 1, wave-5 veterans 2: e.g. gate-off fixture shows short
  ["tricks"] (veterans met at 1, not short), and the lone-dead-killer
  fixture now CLEARS the wave-4 bar (1 meets demand 1). These are the
  recalibration working, not the instrument breaking.
- The proof's det-gate ALSO diverges (4/4 combos vs its 2026-10-17
  baseline, one combo endReason village-lost vs survived) — expected: its
  baseline predates a week of game changes, so it cannot distinguish
  instrument drift from game drift on current master. The CURRENT-master
  det-gate for this arm is G3 above (PASS, same-master wrapped vs
  unwrapped), and the diag arm's G2 proved the recorder neutral on this
  substrate. This old proof was NOT edited: updating its demand numbers
  is a maintenance call for its owner, and editing it here would muddy
  this arm's evidence. No src/js was touched by this arm at all.

### Metric review

- The pre-registered bar worked as designed: the release criterion (rd4
  ready + gated >= 100, or wave-4 recorded) cleanly separated the released
  seeds from the stuck ones, and the kill-ledger post-read gave the
  mechanism behind the NO-GO. No metric revision is proposed for the next
  run: the same bar should be reused by any follow-up that claims a
  release on this band.
- One instrumentation note for the next run: the 73676 baseline case
  (wave 4 reached, rd4 never ready in the daily trajectory, gated lifted
  to 100 by the peak floor) shows the wave4-fallback criterion doing real
  work — without it, a seed that DID reach wave 4 would read as unreleased.
  Keep the fallback, and keep reporting which criterion fired per seed.
- The 'entered FULL' wall number is not instrumented in this corpus (seat
  counter does not distinguish lesser vs full seat). If the coordinator
  wants that number next run, it needs a seat-kind field in the policy
  counters, not a re-read of this corpus.

### Findings outside this arm (for the coordinator's backlog — NOT chased)

- Stuck seeds reach wave 3 and record zero wave-3 kills (73675: 180 days,
  73677: 98 days) — encounter/kill opportunity question, owned by the
  sibling vetkill arm; do not duplicate here.
- 73674 never reaches wave 3 at all (wave 2 in 180 days) — why a national
  village stalls below wave 3 is a separate decomposition, not this arm's.
- Sense replay: the readiness line names the veterans count but never the
  path to it (no 'kill a wave-3 monster' guidance anywhere in 240 lines) —
  a narration blank for a future arm, not a gate change.
- Old proof `scripts/test-vetshape-20261017.js` carries stale demand
  numbers (wave-4 veterans 2, wave-5 veterans 3) vs the 2026-10-18
  recalibration (1 / 2) — maintenance item for its owner.
- No EPERM flap hit this run: all 16 corpus writes + summary + sense
  write succeeded on first attempt through the chunked writer (WRITE-RETRY
  lines: none). Safe-commit index clobber DID strike after the commit
  (the known class from the repo's AGENTS.md lessons: all 21 committed
  files showed as staged deletions in the worktree index, worktree files
  byte-identical to HEAD): repaired with `git update-index --add
  --cacheinfo` against HEAD blobs, then verified `git status --short`
  empty + `git diff HEAD` empty. The commit itself was correct throughout;
  only the index lied. No reset was used.
