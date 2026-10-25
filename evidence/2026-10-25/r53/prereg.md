# journey-social r53 — PRE-REGISTRATION (lane B, leg 5; written before any r53 seed ran)

Rotation-b file read 5 at run start (r52's note said it would write 6, but the
file still reads 5 — discrepancy noted, not silently "fixed" mid-run; this run
plays 5 and writes 6 at closeout). Base: master at run start (see run note).

## Leg question (r53 = THE FIX RUN for r52's diagnosis)

r52 answered its three diagnostic questions and left a fix list. r53
implements the top of that list and measures whether the fix moves natural
play — it does NOT re-score r52's metrics against friendlier bars:

1. THE MENU FIX (src/js/conversation.js, both menu loops): 'others' is the
   village's social life surfacing (bonds, rifts, deeds) — like the gossip
   verbs before it, it rides AFTER the fresh-topic cap instead of inside it.
   FreshCap (1–2) still bounds small talk; topicCapMood still bounds the
   whole menu; only 'ask:others' is exempt from freshCap counting. No other
   topic is exempted. Design call made by this run (r52 deferred it here):
   surfacing 'others' may displace one generic ask (personal/gossip) from a
   full menu — that is the intended tradeoff, and the funnel metric below
   is the judge.
2. MATCHER BROADENING (driver/analyzer only): hist + old-rift grievance
   forms join the grievance matcher; "doors stay closed" LEAVES the
   deflection matcher (it sits inside genuine forgiven lines); only
   "rather not" (and kin) marks a true deflection.
3. T2PICKS PERSISTENCE (driver): the full per-seed t2picks list lands in the
   per-seed JSON, so the finer funnel split (freshCap truncation vs
   discussed-exclusion vs re-offer gate) is measurable next run.
4. CRACK CONTROL: the seeded-crack arm SPLITS — 2 seeds keep r52's daily
   seeded-speaker steering, 2 seeds get NO steering after the seed. This
   tests r52's named confound (steering itself may be the healer).
5. KNACK BAR REVISION (analyzer): same-speaker repeats only; cross-speaker
   retells are reported as circulation, never counted as repeats.

Seeds: fresh block 4901–4904. 4901/4902 = steering arm; 4903/4904 =
no-steering arm. Smoke 4905, 30d. Horizon DAYCAP 140, death-aware.
Policy: warm-competent + 3 gossip-first convos/day (deep mode, per-day
reset) + 1 others-steered convo/day, as r52 — the others-steering stays so
the STEERED surface is comparable; the NATURAL surface (unsteered convos)
is what the menu fix must move.

## Pre-registered bindings (a miss is NO-GO, never re-scored)

- F1 MENU FIX (primary): pooled NATURAL subject-no-offer rate BELOW r52's
  90.5% AND late (d91–140) NATURAL others picks >= 2 on >= 2/4 seeds.
  (Steered picks excluded from both counts; r52's funnel pooled steered +
  natural probe turns, so the comparison is directional, stated as such.)
- G1 CRACK CONTROL: no-steering arm — seeded pair's v at day+7 still >= 10
  below pre-seed OR depth dropped, on >= 1/2 seeds; AND steering arm
  replicates r52 recovery (v >= pre-seed by day+14) on >= 1/2 seeds.
  If BOTH arms recover, the crack-heals finding stands and steering is
  exonerated; if ONLY the steering arm recovers, steering is the healer.
- M1 FORMATION (guard): deep2 pairs >= 10 per seed.
- M3-COND (guard): pooled late close-read true-positive rate >= 40%.
- M4-REVISED (guard): same-speaker knack repeats = 0 per seed.
- M5 PEOPLE (guard): 5 transcripts sense-read in full, 0 fabricated-shared-
  history flags.
- M6 GUARDRAIL (report-only, not gating): alive-at-horizon + scattered
  reported honestly. r52 already opened the arena-deaths question for
  Steve's loop; this run does not re-litigate it and does not hide it.
- NO-REGRESSION: scripts/check.js --quick green in the worktree, plus the
  conversation/gossip/moot test subset green. The r53 proof test
  (scripts/test-journey-social-r53-others-menu.js) must FAIL pre-fix and
  PASS post-fix, demonstrated in that order.

## Metric review (carried, not re-scored)

- r52's G2R 'other' clause and M4 letter are superseded by items 2 and 5
  above, as r52's own metric review proposed. The revision applies to THIS
  run because r52 proposed it for the next run — it is not a mid-run
  re-score of r52.
