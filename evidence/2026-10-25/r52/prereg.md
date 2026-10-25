# Journey social r52 — THE SERVE SPLIT + THE FUNNEL SPLIT (lane B, leg 5) — PRE-REGISTRATION

Written BEFORE any r52 seed ran. This run answers r51's metric review and
open items verbatim; it does not re-score r51.

## Leg question (r51's three open items, in order)

1. G2-REVISED (serve vs deflection): r51's wrap-serve count counts a
   grievance-topic pick as a "serve" even when the generator deflects
   (4703: 2 wrap serves, 0 matcher hits, saved transcript a deflection:
   "Victor? I'd rather not. Some doors stay closed."). r52 saves ALL
   wrap-serve transcripts and classifies each: grievance-line (matcher
   hit), deflection (deflection phrasing, no grievance line), or other
   (wrap served but neither — a matcher gap, flagged, never renamed).
   A serve counts only when a grievance line is delivered.
2. FUNNEL SPLIT (the scarce step): r51's top blocker is still
   subject-no-offer (362–392 of 414 convos never offer 'others'), and
   changed picks go unoffered 26–55 times per seed. The re-offer works
   when the menu is reached; reaching the menu is scarce. r52 splits
   every subject-no-offer turn: does t2pickOther (menuCheck) return a
   non-neutral pick at that moment? If yes, the gap is a MENU problem
   (pick exists, not offered — e.g. pagination/topic order). If no,
   it is a PICK problem (nothing to say). Also recorded: menu:more
   present, fresh-topic count visible, speaker trust.
3. CRACK TRACE (fade visibility): r51's seeded crack faded on 2/4 seeds
   (v ROSE by day 7: 50→56, 54→56) vs r50's stickier cracks, with only a
   day-7 snapshot. r52 records the seeded pair's v/depth DAILY for the
   first 14 days after seeding, so stick vs fade is a trajectory, not
   a snapshot. Open sub-question carried: is the fade the pair's own
   dynamics, or did the per-day gossip reset crowd out crack
   maintenance? (Not decidable in one run; the daily trace is the
   evidence the next run needs.)

## Design stance for this run

DIAGNOSTIC + TOOLING ONLY. No src/js change. r51's metric revision
(serve = grievance line delivered) is applied to the driver/analyzer,
not to game code. Any mechanism failure found here is the NEXT run's
fix candidate, not a mid-run change. (Figure-it-out-yourself does not
mean change-the-game-mid-measurement.)

## Substrate (r51 exactly, no game change)

Warm-competent + 3 gossip-first/day (per-day reset, r51) + 1
others-steered/day + seeded-speaker probe (30d, forceOthersOnce, does
not consume the natural steer). DAYCAP 140, death-aware. Seeded crack:
first depth>=2 NPC-NPC pair, recordGrievance 'ambushed' 60, seeded at
end of day. Driver: scripts/journey-social-r52-20261025.js (r51 fork;
new fields only: deflection classification, subject-no-offer probe,
seeded daily trace, save-ALL wrap serves).

## Seeds (fresh block, verified: no 4801–4804 in prior social drivers)

4801, 4802, 4803, 4804. Smoke seed 4805, 30 days (r51 smoke rule).

## Pre-registered bindings (§14 — a miss is NO-GO, never re-scored)

- G2R SERVE SPLIT: every wrap-serve convo on every seed carries a
  class (grievance-line / deflection / other). Bar: classification
  coverage 100%, and 'other' ≤ 25% of wrap serves pooled (above that,
  the matcher — not the game — is the finding).
- F1 FUNNEL SPLIT: pooled subject-no-offer probe turns ≥ 20, and one
  side (menu-problem vs pick-problem) ≥ 60% of probed turns. Bar:
  dominant side named; a 50/50 split is a NO-GO (no diagnosis).
- G1R CRACK TRACE: on every seed where a pair seeds, daily v/depth
  recorded for seedDay..seedDay+14 (gaps only if the pair dies or the
  village ends). Each seeded pair classified stick / fade / rise
  (fade = v drops ≥10 by d7 then returns within 10 of pre by d14;
  rise = v above pre by d7, as r51; stick = v still ≥10 below pre at
  d14 or depth dropped).
- S1 REOFFER (regression guard, r51): natural late (d91–140) re-offer
  picks ≥ 2 on ≥ 2/4 seeds.
- M1 FORMATION (guard): deep2 NPC-NPC pairs ≥ 10 on ≥ 3/4 seeds.
- M3-COND (guard, conditional-only headline): pooled late close-read
  TP rate ≥ 40%.
- M4 KNACK (guard): 0 verbatim repeated knack lines across seeds.
- M5 PEOPLE (guard): ≥ 4 transcripts sense-read in full, 0
  fabricated-shared-history flags.
- M6 GUARDRAIL (guard): ≥ 5 alive at horizon on ≥ 3/4 seeds.

## Metric review (carried, not changed mid-run)

- Gossip counts: r51 is the baseline (per-day reset). r47–r50 gossip
  counts are NOT comparable and must not be trended.
- Wrap-serve counts from r47–r51 overstate grievance deliveries by
  the deflection share; r52's split is the first honest serve count.
- If F1 lands on menu-problem, the next run's fix candidate is the
  subject-menu offer path (pagination/topic order), not the pick
  generator. If pick-problem, the candidate is the pick generator's
  gating (trust/depth/why conditions).
