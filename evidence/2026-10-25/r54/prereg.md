# journey-social r54 — PRE-REGISTRATION (lane B, leg 5; written before any r54 seed ran)

Rotation-b file read 5 at run start. Note: r53's prereg recorded the same
read (5) and said it would write 6 at closeout; the file still reads 5, so
r53's closeout write evidently did not persist (its landing was finished by
a successor run after a heartbeat failure — the rotation write likely died
with the original run). This run plays 5 and writes 6 at closeout. Playing
5 is also r53's named next on the merits (below), so no queue-jump is
involved.

## Leg question (r54 = THE FIX RUN for r53's diagnosis)

r53's menu fix (others exempt from freshCap in both menu loops) did NOT move
natural play: pooled UNSTEERED subject-no-offer 1383/1436 = 96.3% (above
r52's 90.5%), late unsteered others picks 0/4 seeds — F1 NO-GO, decisive.
The r53 funnel analyzer (run 2026-10-25 against the committed r53 evidence,
800 capped probe turns) split the 478 menu-problem turns (pick exists, page 1
of the subject menu lacks 'ask:others') as:
- 67.8% served-same-pick: 'others' discussed and its pick UNCHANGED since
  serving -> not in t2fresh -> the subject menu NEVER lists t2discussed, so
  no freshCap-scoped fix can ever surface it. THE dominant blocker.
- 16.3% never-served + 15.9% served-changed-pick: 'others' IS fresh, but
  paged out — menuMore=true on ~90% of fresh cases. Root cause in code
  (conversation.js finish()): the pager sorts content by rank and
  'ask:others' is rank 4 (default, sorts last), paged at size ~4-5 once
  the menu exceeds 7 items. A fresh 'others' in a long subject menu lands
  on page 2+ almost always.
- 322/800 probes had no pick at all (neutral) — no 'others' content exists
  at that moment; not a menu bug, not counted in the 478.

r54 implements r53's named fix candidates (a) and (b) in substance:
1. PAGER RANK (src/js/conversation.js finish()): 'ask:others' moves from
   rank 4 (default, last) to rank 3 — the social-verbs band, with
   ask:gossip / ask:spread_rumor. 'others' is the village's social life
   surfacing, not small talk; it pages with the other social verbs. This
   is a rank change only: no cap, no budget, no menu-size change.
2. SUBJECT-MENU DISCUSSED-'OTHERS' RE-LIST (conversation.js subject menu):
   after the asks loop, the subject menu appends 'ask:others' when it sits
   in t2discussed and is not already listed — 'others' ONLY, not all
   discussed topics (discussed topics generally stay behind by design).
   Precedent: gossip verbs already ride after the cap in the subject menu.
   The main menu needs no structural change: it already lists t2discussed
   (behind asks, within topicCapMood), and the rank lift helps it too.
Design note (why re-listing discussed-'others' is not a repeat): the pick
recomputes at serve time, and 'others' lines come through the said-ledger
(no verbatim repeats — CONVERSATIONS.md "No repeats, ever"); a re-served
unchanged pick serves a different pool line or the honest exhaustion path,
never the same line twice. The r54 proof test asserts exactly that.

## Seeds / policy / instrument

Seeds: fresh block 5001-5004. 5001/5002 = steering arm (r52/r53 daily
seeded-speaker steering kept); 5003/5004 = no-steering arm. Smoke 5005,
30d. Horizon DAYCAP=140, death-aware. Policy unchanged from r53:
warm-competent + 3 gossip-first convos/day (deep mode) + 1 others-steered
convo/day. The crack-control arms are carried for comparability; G1 is not
re-litigated as a primary (r53 answered the steering question far enough
for this run's purpose — the menu fix is the question).
Driver: r53 driver forked. ONE instrument change: on subject-no-offer
probe turns, record inBuilt = whether 'ask:others' is in
convoGet(vid).offeredReplies (the full pre-pagination built list). A
post-fix no-offer turn then splits into not-built (cap/exclusion remains)
vs built-but-paged (rank still burying it) — the distinction r53's probe
could not make.

## Pre-registered bindings (a miss is NO-GO, never re-scored)

- F1 MENU FIX (primary, SAME bar r53 failed): pooled UNSTEERED
  subject-no-offer rate BELOW r53's 96.3% AND late (d91-140) UNSTEERED
  others picks >= 2 on >= 2/4 seeds. Steered picks excluded from both
  counts. The bar is reused unchanged — this is a new fix judged by the
  old bar, not a re-score.
- F1a (attribution): post-fix subject-no-offer turns with a pick split by
  inBuilt; discussed-same-pick probes must show 'ask:others' offered
  (the re-list working) on the pooled majority, and fresh probes must
  show page-1 offers (the rank lift working). Reported, not separately
  gated — F1 is the gate.
- M1 FORMATION (guard): deep2 pairs >= 10 per seed.
- M3-COND (guard): pooled late close-read true-positive rate >= 40%.
- M4-REVISED (guard): same-speaker knack repeats = 0 per seed.
- M5 PEOPLE (guard): 5 transcripts sense-read in full, 0 fabricated-
  shared-history flags.
- M6 GUARDRAIL (report-only): alive-at-horizon + scattered reported
  honestly.
- NO-REGRESSION: scripts/check.js --quick green in the worktree, plus
  the conversation/gossip/moot test subset green. The r54 proof test
  (scripts/test-journey-social-r54-others-menu.js) must FAIL pre-fix and
  PASS post-fix, demonstrated in that order.

## Metric review (carried, not re-scored)

- r53's F1 bar is reused verbatim (above). r53's G2R/M4 revisions stand
  as applied in r53 (matcher broadening + same-speaker knack bar carried
  in the driver). r54 adds inBuilt to the probe — a new instrument field,
  not a metric revision: it does not change any binding, it explains
  misses.
