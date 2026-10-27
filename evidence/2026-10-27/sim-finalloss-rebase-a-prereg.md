# sim-finalloss-rebase-a — RE-BASELINE PRE-REGISTRATION (binding, written BEFORE sweeping)

Run: fleshout-20261027T0755Z, arm sim-finalloss-rebase-a, axis scale-onramp.
Coordinator call (recorded in the run claim): RE-BASELINE known instances
from the current-base corpus — do NOT pin to the old base. Pinning to the
old base would perpetuate unreachable instances; the adopt corpus
(evidence/2026-10-27/perseed-finalloss-adopt-a/) already classifies 16
current-base final-loss cases inside F1–F13.

DIAG / MEASUREMENT ONLY: zero src/js changes, no default flips, no
combat/tb/channel code changes, no lever proposal. In particular the
TB CHANNEL RESET (whether a turn-based fight should inherit wounds from
the open-field fight) is a STEVE-CALL design question: traced only,
never proposed as a lever, never smuggled into a commit or evidence
recommendation. The Haven pile-up intended-behavior question is
documented only — NO restore-rule change (that would be a Steve-call).
The F1 blocked-restore narration silence (the one genuinely silent case
in the adopt corpus) is a finding to report, not something to fix in
this measurement arm.

Canon read first: docs/CANON.md, then docs/MONSTER-WAVES.md (wave 4 =
The Mirror Draft, standing >= 100; bands damage 35-95, HP 850-1500,
pierce 0.2-0.5), then docs/MEASUREMENT.md §§9-12, 14-15 (staged runs,
pilot gate, death-aware horizons, pre-registration binding, balanced
panel as instrument).

## Adoption by reference (from the adopt prereg + preserved dead prereg)

This arm ADOPTS, verbatim except for the adaptations listed below:
- The candidate-cause set F1–F13, classification definitions, G1/G2
  gates, cost bar, and cross-checks (a)–(f) from the adopt prereg
  (evidence/2026-10-27/sim-finalloss-adopt-a-prereg.md), which itself
  adopts the dead prereg preserved byte-identical at
  ~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/sim-finalloss-a-prereg-preserved-20261027.md
  (READ, never modified by this arm).
- The restore-code reading (game.js tbEnd aftermath), the tbEnd
  pre/post snapshot model, the verdict-tick rule (first tick
  RECORDED AFTER the tbEnd, stale same-day ticks skipped), tick-epoch
  removal ordering, verdict precedence (F10 is a classified verdict,
  never a failure; post-present mismatch with a present verdict tick
  is F13, while post-present mismatch with an absent verdict tick is
  decided by the removal evidence with the mismatch flagged), and the
  analyzer implementation notes (finalloss-diag installed before the
  inner policy's daily work; remover naming from the caller stack's
  file:line lines, never the fn-name list alone).
- The substrate: seeds 73671–73678, tableseat-nowait policy (composed
  upon, never edited), 180d death-aware horizon. Armed =
  tableseat-nowait + the five w4dmg-a recorders verbatim +
  seq51gap-diag verbatim + finalloss-diag verbatim from current
  master (NO recorder edits, no new game code, no src/js changes).
- The rule that a cause not in F1–F13 may NOT be claimed from rows
  alone: report UNEXPLAINED or UNOBSERVABLE with counts, never forced.
- The balanced-panel note: balance-panel.js has no corpus-ingest
  mode, so paired identical-seed tables (baseline vs armed, same
  seeds, same policy) are the comparison of record. No panel file is
  produced or faked. scripts/telemetry-check.js is NOT run on
  recorder rows.

## Adaptations forced by the re-baseline (complete list; nothing else changes)

1. RUN/ARM IDENTITY: run fleshout-20261027T0755Z, arm
   sim-finalloss-rebase-a, worktree ~/workspace/worktrees/sim-finalloss-rebase,
   corpus evidence/2026-10-27/perseed-finalloss-rebase-a/, sweep
   scripts/test-finalloss-rebase-a-sweep.js, proof
   scripts/test-finalloss-rebase-a.js. The adopt sweep/proof are
   copied and renamed only; the analyzer logic is unchanged except
   adaptation 3.
2. KNOWN INSTANCES REPLACED (see "New known-instance set" below).
   The old instances (seq51/73672 day 148, seq45/73673 day 112)
   are RETIRED, not re-derived: the adopt arm proved them
   unreachable on current master (73672 ends day 118 won, 73673
   ends day 32 village-lost). They are cited as retired, never
   substituted by near-miss lookalikes. Identity of a new instance
   is (seed, day, origin maxHp); seq numbers are REPORTED from the
   rerun, never assumed — the adopt-corpus seqs below are the
   observed values to confirm, not values to force. A rerun case
   matches a known instance iff seed, day, and origin maxHp all
   agree AND it classifies the same way under the tightened F9.
3. TIGHTENED F9 DEFINITION (adopted from the adopt finding, now
   binding): a fight-end row in the same day's second phase, or
   visible in the post-run count, ENDS the lift. F9 is reserved
   for lifts with NO fight-end row at all before the NEXT count
   (the next seq51gap tick after the verdict tick, or the
   post-run snapshot when the run ends). Implementation in the
   rebase analyzer: a candidate F9 (old-logic verdict) is
   re-examined — scan tbEnd rows for the same seq with rowIdx
   greater than the removal rowIdx up to the next count; if any
   such fight-end exists, the case is classified by that
   fight-end's outcome: lost + post-present at predicted HP/tile
   => RESTORED (F6, flagged delayed-count); won => REMOVED-
   AFTERWARDS (F8, killed in the re-fight); any other outcome is
   classified by its own tbEnd leg and flagged. If no such
   fight-end exists AND the entity is absent from the post-run
   snapshot, F9 stands. Under this definition the adopt corpus
   holds 0 F9 (its single old-definition F9, reunion seq38 day
   168, becomes delayed-RESTORED: fight fmgpspj04_6rwvac ends
   lost, restored at 1200 HP, visible in the post-run count).
   The old-definition F9 count (1) is reported alongside for
   traceability, but the binding verdicts use the tightened
   definition.
4. REPLICATION JUDGE REPLACED: plain replication FIRST must match
   the ADOPT band exactly — wins 4/8, national-ever 7/8,
   national-final 5/8, table invited 5/8, entered 4/8, wave-4
   5/8, wave-5 0/8, median 130d, deaths 284, starvation 2 — or
   STOP and report the deviation. The 1920 band (wins 2/8,
   national-ever 6/8, national-final 5/8, table 4/8, entered
   2/8, wave-4 6/8, wave-5 0/8, median 152d, deaths 307,
   starvation 1) is reported for base-movement context only
   and is NOT a judge. Armed-vs-baseline equality (G2) is
   additionally required, as in the adopt arm.
5. DIAG-GO LEG (1) REPLACED: every SELECTED new known instance
   (all three) re-derives in this rerun. Legs (2) and (3) stand
   as in the adopt prereg, adapted: (2) every final-loss case
   in this corpus is classified inside F1–F13 (no forced cause
   from rows alone); (3) the instrument gates (G1 det-gate, G2
   neutrality, cost bar, cross-checks (a)–(f)) pass as adapted.
   Any leg missing = DIAG-NO-GO.
6. No other adaptation. In particular the F1 definition is NOT
   narrowed: the adopt finding stands that for dawn-pinned
   lingerers the origin tile IS the Haven tile, so Haven
   stacking DOES block through the origin-tile check (the dead
   prereg's "Haven occupancy does not block" holds only when
   the origin tile is not the Haven tile).

## New known-instance set (all real cases IN the adopt corpus)

Selected from evidence/2026-10-27/perseed-finalloss-adopt-a/
(per-seed armed files + summary.json), covering the three required
shapes. Adopt-corpus seqs are observed values, to be confirmed
in the rerun (see adaptation 2):

- K1 — F1 Haven pile-up (dominant mechanism, 6/16 in the adopt
  corpus): seed 73671, day 167, origin maxHp 150 — moderator
  (adopt seq 27). Adopt verdict: BLOCKED (F1); origin tile
  (4,4) — the Haven tile — occupied at restore time by reunion
  (adopt seq 47, 900 HP). Adopt fightId fmgpspj1c_dx2n6n,
  result lost. Chosen over the other five F1 cases because it
  is the first-listed case of the day-167 three-way Haven
  pile-up (moderator + reunion + chorus_line on the same tile
  the same day), which is the pile-up's clearest exhibit.
- K2 — RESTORED-exact: seed 73675, day 169, origin maxHp 1200 —
  reunion (adopt seq 38). Adopt verdict: RESTORED (F6);
  restored at 1200 HP, present at the post-run count. Adopt
  fightId fmgpspizt_ebynzg, result lost, chain length 1 on
  that day. Chosen because it is the terminal case of the
  reunion day-167/168/169 saga and the case that resolves
  the old-definition F9 under the tightened definition.
- K3 — REMOVED-AFTERWARDS: seed 73677, day 112, origin maxHp
  850 — influencer (adopt seq 39). Adopt verdict:
  REMOVED-AFTERWARDS (F8); restored at 388 HP to the Haven
  tile, then lifted for a new fight the same day, that fight
  ends won (fmgpspijk_flgohj) before the count — killed in
  the re-fight. Adopt fightId fmgpspijb_4ilh19, result lost.
  Explicitly NOT the retired known instance: different seed
  (73677, not 73672), different day (112, not 148), different
  monster history — the shared id/maxHp (influencer/850) is
  a roster coincidence, stated here so no reader mistakes
  this for a near-miss substitution.

## DIAG-GO rule (binding — judge ONLY against this prereg)

DIAG-GO iff ALL of:
(1) every selected new known instance (K1, K2, K3) re-derives
    in this rerun (same seed/day/origin-maxHp case, classified
    the same way under the tightened F9);
(2) every final-loss case in this corpus is classified inside
    F1–F13 (no forced cause from rows alone — report
    UNEXPLAINED/UNOBSERVABLE with counts if needed, never
    forced);
(3) the instrument gates from the adopt prereg pass as
    adapted (G1 det-gate, G2 recorder neutrality 8/8,
    cost bar, cross-checks (a)–(f)).
Any leg missing = DIAG-NO-GO. Pre-registered metrics bind the
run — a miss is NO-GO, never re-scored mid-run; metric doubts
go under a "metric review" section for the NEXT run.

## Replication gate (STOP condition, before any classification)

Plain replication (baseline, unarmed) on seeds 73671–73678 must
match the adopt band exactly: wins 4/8, national-ever 7/8,
national-final 5/8, table invited 5/8, entered 4/8, wave-4
5/8, wave-5 0/8, median 130d, deaths 284, starvation 2. Any
field differing => STOP, report the deviation field-by-field,
do not proceed to classification, do not re-score. Armed
must then equal baseline field-by-field (G2); any armed
deviation is a recorder-neutrality failure, not a new band.

## Sense section (opportunistic, NON-MEASURED, never census)

As in the adopt prereg: read finalloss-relevant narration for
the new known instances if a narration-on replay touches them;
judge whether a player watching would see anything coherent.
Sense evidence comes from a NON-MEASURED replay, never from
census rows. Do NOT chase other blanks.

## Wall numbers (report for the coordinator's band compare)

National-ever/final, table invited/entered, wins, wave-4,
wave-5, wave-4 kills, median survival, death-cause shares —
for both the baseline and armed corpora on identical seeds.

## Metric review

Every evidence file carries a "metric review" section (§14).
Metric doubts go there for the NEXT run, never a mid-run
re-score.
