# sim-fullseat-a — PRE-REGISTRATION (written BEFORE any judged sims, 2026-10-31)

Run: Loop A worker, arm sim-fullseat-a, axis scale-onramp, run
fleshout-20261031T1702Z. Sibling Loop B live on food-economy — NOT
touched.
Arm type: DIAG ONLY — measurement, zero src/js changes, zero
policy-default flips, zero gate/demand numbers moved, zero edits to
existing policy files. The deliverable is the census + verdict; no
lever fix is built here. New files only: one combined sweep (reusing
the proven regtable/vet2 recorders unchanged), one splitter (copy of
the vet2 splitter pattern), one analyzer, one proof test, this
prereg, and the evidence file.

Backlog item: full-seat bars w4>=3 + w5>=2 reachability on any stack
(sim-scale-onramp-round-1535-a, "Next blanks" #4: the 0/19 there "must
not be quoted as 'the full seat is unreachable,' only as 'unreached on
this band'"). Prior arms, quoted as prior-base context only (never
re-judged here):
- sim-regtable-a (base 18da20b58): 10/19 table at regional, ALL lesser,
  fullOk false on all 16 table days, firstFullDay null on 19/19; w5 0
  on all 16 table days, w4 peaks at 2 (87120); full gate fails on
  `waves` on all 16 table days and on scale on the 10 regional ones.
- sim-vet2-a (base 9f22a0838): firstVet2Day null on 19/19; only 4
  wave-4+ kills in 19 runs (3 scholar, 1 companion, kill-time-keyed);
  wave 5 0/19.
- The task brief's "87109/87135 single-bar no-seat stories": 87109
  (global, w3 2/3 — one distinct wave-3 fight short of the LESSER bar)
  and 87135 (national, food deeds false alone) are no-SEAT stories, not
  near-miss FULL-seat stories. They are re-measured here, but they do
  NOT count as near-miss full seats unless this base's rows show them
  within one bar of full. Do NOT assume they reproduce.

## Primary question

On THIS base, with the wavegate win-pursuit stack, is the full seat
reachable on any seed — and if not, which single bar is binding, and
by how much, on each seed's closest approach? "Closest approach" is
defined below (max component vector over the run), NOT the end-of-run
vector alone: a village that once held w4=2 and ended at w4=1 (a
killer died) is closer than its end row says, and the gate reads
living-at-the-time counts, so the max matters. The verdict also
names, per near-miss seed (defined below), the single binding bar at
its closest approach, and states whether any stack measurable here
reaches full (firstFullDay non-null on any seed).

## Code canon (read before sims — not invented)

- src/js/progression.js:613 deedGateReady() — the FULL seat gate.
  `ok` requires waves 5/5/4/3/2 distinct fought blow-by-blow,
  contests >= 3, crises >= 3, stage >= 2, foodDeeds
  (sentimentTaught && feastSurgeUsed), AND scale national/global
  (Steve ruling 2026-10-27, enforced in `ok`). Verified by reading
  the code in this worktree before writing this prereg.
- src/js/table.js tableSeat() — full first (deedGateReady().ok);
  failing that, LESSER iff w1>=4, w2>=4, w3>=3, contests >= 2,
  crises >= 2, scaleOk (regional/national/global), stage >= 2,
  foodDeeds. Below the lesser bar the table does not come.
- src/js/progression.js checkArc() — tableWaiting set when want >= 3
  AND seatNow is 'full' OR 'lesser'. Table days are therefore priced
  by seat type, recorded daily by the regtable recorder.
- docs/TABLE.md "The seat: full / lesser / none" (Steve 2026-10-11:
  "the table prices the run, never gates on godhood"); docs/MONSTER-
  WAVES.md wave-5 gate: standing >= 200 AND wave-4 faced
  (standingCfg t5=200); wave-4 gate: standing >= 100 + readiness.
- Veterans rule (standing.js isLiving, as re-implemented by
  vet2-diag): a wave-4+ killer counts as a veteran only while living
  at the daily snapshot; a killer who dies on their blood day never
  counts (vet2-a 87135 Maeve case). This arm reuses vet2-diag
  unchanged, so the same rule applies.

## Base pin

- Worktree HEAD at prereg time: f536e3ad33da39ed7c4ed6cc6202772
  87405bed3 ("sim-scale-onramp-round-1535-a: coordinator evidence").
  This base is NEWER than both the vet2 base (9f22a0838) and the
  regtable base (18da20b58). Trajectories on the same seeds may
  therefore differ from both prior corpora. This arm judges ONLY its
  own corpus on THIS base; prior numbers are quoted as prior-base
  context, never as current data. Agreement with them is reported as
  a consistency check, not assumed. Seed labels do not transfer
  across bases (1535Z base-drift warning).

## Seed plan (fixed now; no band-shopping)

Wavegate band = 19 seeds (pilot 8 + confirm 11), identical to the
vet2/regtable band:
87104, 87115, 87119, 87127, 87137, 87140, 87109, 87120, 87121,
87124, 87126, 87134, 87107, 87135, 87132, 87123, 87103, 87138,
87128.

- Pilot (8): 87109, 87135 (longest unwon runs on prior bases —
  the no-seat stories), 87120, 87132, 87138 (prior-base vet5
  holders), 87104, 87121, 87115 (prior-base table/win cases).
  Pilot GO requires: recorder rows on every pilot seed, errs 0
  on every recorder, kill capture reconciled against the final
  waveKillLog (cc2, both writers), det-gate pass (below), and the
  census table computable on every pilot seed (max vector, table
  day seat + full components at table day, binding bar at closest
  approach). A pilot failure on instrument grounds discards the
  pilot corpus (files deleted, not retained as judged data), the
  prereg is amended BEFORE any re-run, and the pilot re-runs fresh
  (vet2-a precedent).
- Confirm (11): 87103, 87107, 87119, 87123, 87124, 87126, 87127,
  87134, 87137, 87140, 87128. No other quantity is judged on the
  confirm beyond the same census table per seed.

## Policy stack (identical to wavegate/regtable/vet2, plus one new combination)

- withRegtableDiag(withVet2Diag(withWavegateDiag(withFullseatDiag(
  withSeatDrive(withWinDefer(TF leadfeast)))))),
  FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
  FULLSEAT=1 WAVEGATE=1 VET2=1 REGTABLE=1, 200d death-aware cap
  (harness Game.over stop; dead villages stop simulating, +10d tail
  max per the run's horizon rule — never a fixed 200d horizon as a
  target, the cap is a ceiling).
- NO new recorder policy file: regtable-diag, vet2-diag,
  wavegate-diag, fullseat-diag are reused UNCHANGED. The only new
  instrument code is the sweep (composition + both-writers kill
  capture copied from vet2-sweep, say-capture install order:
  wavegate first, then regtable, exactly as regtable-sweep) and the
  analyzer. Say capture is NOT part of the judged corpus (regtable
  finding: sysSay misses the endgame table's voice); the sense read
  uses a scratch say()-wrap probe on ONE near-miss seed, its end
  fields verified identical to that seed's judged JSON, and the
  probe output is explicitly scratch, not judged corpus.
- Horizon justification: death-aware 200d ceiling matches the
  prior arms on this stack, so band status re-derives comparably;
  the question is reachability, not survival time, and the prior
  bands' median survival (90d) means most roads close at the win
  or death well before the ceiling. The ceiling binds only the
  longest runs (prior max 197d).

## Census per seed (all from the judged corpus — no other source)

1. Table reach + seat type: first table day (first daily row with
   tableWaiting or tableDone), seat at table day, rank at table day,
   win day/end, end rank/seat.
2. Full-gate components AT table day (regtable daily rows):
   full.{w1..w5, contestsN, crisesN, stage, foodDeeds, scale, ok}.
3. Closest approach: per-component MAX over all daily regtable
   rows (w1..w5, contestsN, crisesN, stage), foodDeeds ever true?,
   scale ever national/global?, firstFullDay (any row fullOk true),
   and the binding bar set at the max vector: every component whose
   max is below its full bar (w1 5, w2 5, w3 4, w4 3, w5 2,
   contests 3, crises 3, stage 2, foodDeeds, scale). "Single-bar
   near miss" = exactly ONE binding component at the max vector.
   Note the max vector is a per-component max, not a single day's
   vector: a seed whose max vector passes every bar component-wise
   but never on one day is reported as "component-wise pass, never
   simultaneous" and does NOT count as reaching full — fullOk on a
   single daily row is the only full-reach evidence.
4. Veterans census (vet2 rows + kill capture): maximum living
   vet5 set size on any day and the day span it held (first/last
   day at that size), vet5 holders by name, wave-5 kills (count,
   by killer, kill-time scholar/companion keying), wave-4 kills by
   killer (kill-time-keyed, both writers), vet5 deaths + whether a
   replacement ever reached vet5.
5. Wave-5 unlock chain: maxWave/unlockedWave over the run, standing
   peak (fullseat unlock standing max, wavegate rows), wave-4
   faced? (wavegate rows), wave-5 end blocker (wavegate row
   classification on the last row, own-base).
6. Near-miss table-day transcript (sense test, SENSE-TESTING LAW):
   the seed with the smallest total distance-to-full at its table
   day (sum of per-component shortfalls, scale counted as 1 if
   unmet) gets a scratch say()-probe read: what the table actually
   says to that village, judged for meaning, not counts.

## Primary metric + DIAG-GO threshold (binding)

Primary metric: the band's full-seat reachability verdict, determined
by (a) firstFullDay non-null count over 19 seeds, and (b) the binding
bar distribution at closest approach over 19 seeds.

DIAG-GO iff ALL of:
- Usable judged seeds 19/19 (pilot 8 + confirm 11, fixed band, no
  substitutions).
- Recorder errors 0 on all 19 seeds (wavegate errs, vet errs,
  regtable errs, capture errs all 0).
- Cross-checks pass on 19/19: (i) regtable tableDay agrees with
  the wavegate-row tableWaiting/tableDone derivation on the same
  run; (ii) det-gate passed (below); (iii) kill capture reconciled
  against the final waveKillLog (both writers; exact-duplicate
  calls deduped exactly as vet2-a); (iv) derived final unlockedWave
  == post-run engine unlockedWave() on all 19 seeds. A single
  succession-shaped exception of the vet2-a 87135 class (exact
  capture vs daily census disagreeing because the mantle passed
  between kill moment and daily snapshot, machine-checked shape)
  may be explained in writing per the prereg's read-only
  explanation clause and does not fail the gate; any other
  mismatch fails it.
- Det-gate: recorder ON vs OFF on 2 pilot seeds — dayHash arrays
  byte-identical and end fields identical (gameDays, won, national,
  table, maxWave, endScaleRank, endReason) on both seeds. The OFF
  leg runs the identical stack WITHOUT regtable/vet2 layers (and
  without the kill capture); wavegate/fullseat stay ON in both legs
  (they are substrate instruments, as in vet2-a/regtable-a).
- Determinism leg: one pilot seed re-run to a worktree scratch dir
  (never /tmp, never the judged corpus) is byte-identical to its
  judged JSON.
- Verdict sections stated: (a) full seat reachable or not, with
  seed/day evidence; (b) the binding bar, in plain words, with the
  distance on the closest seeds; (c) whether the 87109/87135
  stories reproduce on this base and whether either is a full-seat
  near miss (judged, not assumed).

A miss on any gate item is NO-GO for the DIAG-GO verdict (the census
tables may still be reported, but the verdict line reads NO-GO with
the failing item named). No re-scoring against a friendlier metric
mid-run; metric doubts go under "metric review" for the NEXT run.

## Panel (§15)

NOT APPLICABLE — single-base DIAG census, no before/after lever
comparison exists in this arm; none fabricated (same declaration as
vet2-a/regtable-a). The det leg compares recorder-on vs recorder-off
trajectories of the SAME stack; it is a neutrality proof, not a
panel comparison, and its numbers never enter the census tables.

## Runner discipline (binding)

Stdout runner + idle splitter throughout: the game-loaded sweep
prints one JSON line per seed to stdout (foreground exec,
stdout→file + stderr→file, never a backgrounded pipe); the splitter
(no game loaded) writes the per-seed JSONs with the resilient
writer. Judged corpora are NEVER staged in /tmp. Scratch dirs live
in the worktree and are deleted before commit.

## Addendum (appended BEFORE confirm spend and BEFORE any verdict, pilot data inspected only for instrument adjudication)

Pilot cc3 adjudication, 87109 day 81: one capture/census mismatch
whose machine shape differs from the vet2-a 87135 class in exactly
one respect — the kill-time scholar (gen_xv4uwtn, BOTH capture
scholar reads agreeing: Game.villagerId == state.scholar.villagerId)
never appears on any daily row. The daily series shows rapid mantle
churn around the day (Leo day 79 → Lucas day 80 → Maya day 81 →
Daniyar day 82), so the mechanism is the same — the mantle passed
between the kill moment and the daily snapshot — except the interim
holder held it between two snapshots and is invisible to daily rows.
The analyzer's machine check (prior daily row scholar == capture
scholar) cannot see interim holders; that is an instrument blind
spot, recorded here, not a new mechanism. The kill is wave 1
(cliffhanger, via companion, by Daniyar), so its keying moves NO
census number in this arm (vet5, w4/w5 kills, full components, and
table/seat are all unaffected either way it is keyed).

RULE, stated now and applied to the confirm corpus unchanged: a cc3
mismatch counts as explained (does not fail the gate) iff ALL of:
(i) both capture scholar reads agree at the kill moment; (ii) the
daily series shows mantle churn bracketing the kill day, or a prior
daily row scholar == capture scholar; (iii) the kill's wave/keying
cannot move any census number in this arm (verified per mismatch
in the evidence). Any mismatch failing (i)–(iii) fails the gate.
The pilot's other cc3 mismatches (87135 day 135 x3, 87138 day 82)
are the prior-row class and were already covered by the original
clause.

## Metric review (for the NEXT run — mandatory section in evidence)

To be filled at evidence time, including: whether the max-vector
definition (per-component max vs single-day vector) changed any
seed's verdict, and whether the pilot gate's cc2 clause earned its
keep again.
