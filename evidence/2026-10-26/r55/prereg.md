# journey-social r55 — PRE-REGISTRATION (lane B, leg 5; written before any r55 seed ran)

Rotation-b file read 5 at run start. This run plays 5 and writes 6 at closeout.

## Leg question (r55 = THE MAIN-MENU FIX RUN for r54's split verdict)

r54's menu fix moved OFFERS (pooled unsteered subject-no-offer 96.3% ->
59.1%, rate PASS) but not PICKS (late unsteered picks 0/0/1/0 — F1 FAIL,
split). r54's mechanism, stated not proven: natural PICKS flow through the
MAIN menu, not the subject menu. The driver reaches the subject menu
unsteered only via late fallback, while the main menu still caps
discussed-'others' behind asks (topicCapMood).

Code fact (conversation.js, main-menu fallback path, verified before this
prereg): the off-thread menu fills topics in order — t2fresh (up to
topicCapMood), then asks (up to topicCapMood), then t2discussed (only while
topicsAdded < topicCapMood). Late in a run the asks alone (personal,
gossip, spread_rumor, past, goal, village, plans) fill the 5-slot budget,
so the t2discussed loop never fires for 'others' — even though MAXC is 7
and two view slots sit empty. The subject-menu re-list (r54) cannot fix
picks that never visit the subject menu.

r55 implements r54's named next fix, 'others' ONLY:
- MAIN-MENU DISCUSSED-'OTHERS' EXEMPTION (conversation.js, main-menu
  t2discussed loop): 'ask:others' rides past the topicsAdded cap, mirroring
  the r53 fresh exemption and the r54 subject-menu re-list. Still bounded
  by MAXC (7, the view's room) and by the threadAsk exclusion, and only
  while 'others' is not the current thread (mirrors r54's guard). No cap,
  no budget, no menu-size change; no other discussed topic moves.
- Pager rank is unchanged (r54's rank 3 already puts 'ask:others' in the
  social-verbs band, ahead of default rank-4 topics).

Design note (why re-offering discussed-'others' on the main menu is not a
repeat): same as r54 — the pick recomputes at serve time and lines come
through the said-ledger (CONVERSATIONS.md "No repeats, ever"); a re-served
unchanged pick serves a different pool line or the honest exhaustion path.

## Seeds / policy / instrument

Seeds: fresh block 5101-5104. 5101/5102 = steering arm (daily
seeded-speaker steering kept, as r52-r54); 5103/5104 = no-steering arm.
Smoke 5105, 30d. Horizon DAYCAP=140, death-aware. Policy unchanged from
r54: warm-competent + 3 gossip-first convos/day (deep mode) + 1
others-steered convo/day.

Instrument changes (only), forked from the r54 driver:
1. PICK MENU TAG: every 'ask:others' pick records the menu it came from
   (main vs subject, read from choosingSubject at pick time), and every
   'others' offer is counted per menu (main-offer vs subject-offer). This
   is the measurement r54's metric review named: picks tagged by menu, so
   the next run can measure which menu natural picks actually come from.
2. PROBE FLAG: subject-no-offer probes record convoSawOthers — whether
   this convo already offered or picked 'others' on an earlier turn. This
   splits r54's uninterpretable same-pick residual into correct
   non-offers (already asked this convo) vs genuine misses.
3. Analyzer fork: per-seed + pooled main-menu offer rate, late picks by
   menu, and the convoSawOthers split of menu-problem probes.

## Pre-registered bindings (a miss is NO-GO, never re-scored)

- F1-picks (SAME bar r54 failed, reused verbatim): late (d91-140)
  UNSTEERED others picks >= 2 on >= 2/4 seeds. Steered picks excluded.
  This is the bar the main-menu fix is judged by — not re-scored.
- F1m (mechanism, new): pooled unsteered MAIN-menu 'others' offers occur
  on >= 3/4 seeds, AND main-menu picks account for the majority of late
  unsteered picks when F1-picks passes. If F1-picks fails, F1m still
  reports whether offers moved (offer/pick split, as r54) — it does not
  rescue a failed F1-picks.
- F1a (attribution, carried + extended): subject-no-offer probes split by
  convoSawOthers; probes with convoSawOthers=true are correct non-offers
  (already asked this convo) and are excluded from the genuine-miss
  count. Reported, not separately gated — F1-picks is the gate.
- M1 FORMATION (guard): deep2 pairs >= 10 per seed.
- M3-COND (guard): pooled late close-read true-positive rate >= 40%.
- M4-REVISED (guard): same-speaker knack repeats = 0 per seed.
- M5 PEOPLE (guard): 5 transcripts sense-read in full, 0 fabricated-
  shared-history flags.
- M6 GUARDRAIL (report-only): alive-at-horizon + scattered reported
  honestly; arena-death load carried, not re-litigated.
- NO-REGRESSION: scripts/check.js --quick at the standing profile
  (r54: 279 passed, 8 failed, same pre-existing set) in the worktree;
  the r55 proof test must FAIL pre-fix and PASS post-fix, demonstrated
  in that order.

## Metric review (carried, not re-scored)

- r54's proposed F1 split is ADOPTED here as F1-picks + F1m (above):
  F1-picks judges picks under the existing driver policy; F1m judges the
  menu fix's direct effect on main-menu offers. The split does not lower
  the picks bar — it is the same bar r54 failed.
- r54's F1a residual (same-pick 93.4% of the capped probe sample, not
  splittable with persisted fields) is addressed by instrument change 2
  (convoSawOthers), not by a metric revision: probes with
  convoSawOthers=true leave the genuine-miss count.
- Carried nits from r54's M5 (not this run's fix): Nino double-invite
  options; Omar unanchored favor callback. Documented, not fixed here.
- G1 crack control carried for comparability only, not gated (r54: all
  'rise'; talk volume vs bond relationship remains the crack thread's
  own question).
