# journey-social r56 — PRE-REGISTRATION (lane B, leg 5; written before any r56 seed ran)

Rotation-b file read 5 at run start. r55's closeout rotation write never
landed (the r55 run timed out before closeout; the adoption run verified
and merged but did not advance the file) — so this run plays 5 and writes
6 at closeout. No anomaly: r55 is the last social work on master.

## Leg question (r56 = THE PICK-CONVERSION + RESIDUAL-SPLIT RUN)

r55's headline, not re-litigated: 372 unsteered 'others' offers -> 7
picks (1.9%). The main-menu fix is proven at unit level but marginal at
driver scale (13 main-menu offers vs 362 subject-menu offers). r55's
metric review named two next steps, both taken here — NO third menu
exemption is applied in this run:

1. RESIDUAL SPLIT (instrument, named by r55): 454 same-pick probes with
   inBuilt=false — the subject-menu re-list not firing. Candidates:
   thread==='others' guard, reactive/generic-question-owned menus
   (choosingSubject still set while a question owns the menu — a CORRECT
   non-offer the probe could not see), topic2Asks gating ('others' not
   in t2list at that moment). New probe flags: thread, reactiveQ id,
   genericQ kind, pendingQ, inT2list.
2. CONVERSION MECHANISM (policy, proposed by r55's metric review): judge
   picks-per-offer under a driver policy that LINGERS on menus instead of
   grabbing the first fresh ask. The current policy's fallbacks ('more',
   kind-temper, fresh asks) systematically skip an offered 'others' —
   r56 tests whether the gap is that policy artifact or whether the
   machinery still blocks picks when the policy weighs 'others'.

## Arms / seeds / policy / instrument

Seeds: fresh block 5201-5204. Smoke 5205, 30d. Horizon DAYCAP=140,
death-aware. Policy otherwise unchanged from r55 (warm-competent + 3
gossip-first convos/day, deep mode, + 1 others-steered convo/day).

ARMS (the only policy difference):
- 5201/5202 = CONTROL: r55 policy verbatim + new probe flags.
- 5203/5204 = LINGER: control + the linger step (below).
- ALL four seeds keep seeded-speaker steering ON. Steering is not a
  funnel variable (seeded-speaker convos are excluded from the natural
  funnel), so holding it constant isolates the linger effect. The r55
  steering/no-steering crack control is not repeated; G1 is
  carried-not-gated and the seeded crack is measurable on all seeds.

LINGER RULE (exact, driver only — no src/js change in this run):
in deep mode, after the gossip + ans steps and before the steer block,
if arm is linger and NOT forceOthersOnce and choices offer 'ask:others'
fresh (not picked yet this convo), pick it. It does NOT set
othersSteered/othersDoneToday — it is a natural pick under the linger
policy, so it stays in the unsteered funnel; it sets lingerPick for
attribution. The daily steer still runs for convos where 'others' is
not offered. Linger mirrors the steer's pick-quality behavior (it picks
the offered 'others' regardless of the underlying pick's why, as the
steer does); neutral picks remain visible in the funnel's pickProblem
split.

PROBE FLAGS (new, on every subject-no-offer probe, read from the same
convoGet the probe already uses): thread (c.thread), reactiveQ
(c.reactiveQ id), genericQ (c.genericQ kind), pendingQ (bool),
inT2list (whether 'ask:others' is in Game.topic2Asks(vid), null if
unreadable). No game code changes; the flags are reads only.

INSTRUMENT CHANGES (only): arm field in per-seed JSON + verdicts;
lingerPick flag on convos; probe flags above; analyzer fork adds the
residual split + conversion-by-arm; verdicts file rewritten after
every seed (r55's end-only verdicts write needed the assembler after
the restart split — this run does not repeat that).

## Pre-registered bindings (a miss is NO-GO, never re-scored)

- R1 SPLIT (instrument + content): probe flags present on >= 95% of
  same-pick probes; analyzer reports the inBuilt=false same-pick
  residual split into question-owned (reactiveQ or genericQ present) /
  thread-guard (thread==='others', not question-owned) / gated
  (inT2list===false, neither of the above) / unexplained (the rest).
  GO = split reported AND unexplained < 50% of the residual. If
  unexplained dominates, the finding is that the residual needs a
  deeper instrument, not a fix.
- R2 CONVERSION (linger arm): linger-arm unsteered picks per unsteered
  offer (all days) >= 25%, AND late (d91-140) unsteered picks >= 2 on
  >= 1/2 linger seeds. The 25% bar is set well above r55's 1.9% and
  below the fresh-offer ceiling (re-offered convos cannot freshly
  convert; the analyzer reports picked/offered and
  picked/(offered - offeredNotFresh-class) side by side so the bar can
  be judged against its ceiling). Control arm reported alongside
  (expectation: near r55's ~2%).
- F1-picks (r55 bar, REPORT-ONLY, not gated): late unsteered picks
  >= 2 on control seeds — reported, not judged, because a 2-seed
  control arm cannot satisfy a >= 2/4-seeds bar as written.
- M1 FORMATION (guard): deep2 pairs >= 10 per seed.
- M3-COND (guard): pooled late close-read TP rate >= 40% (pooled
  across arms, as before; per-arm rates reported).
- M4 (guard): same-speaker knack repeats = 0 per seed.
- M5 PEOPLE (guard): 5 transcripts sense-read in full, 0
  fabricated-shared-history flags, <= 1 weak read (r55's proposed
  quality floor, adopted here).
- M6 GUARDRAIL (report-only): alive-at-horizon + scattered reported
  honestly; arena-death load carried, not re-litigated.
- NO-REGRESSION: scripts/check.js --quick at the standing profile
  (r55: 279 passed, 8 failed, same pre-existing set) in the worktree.
  No src/js change is planned, so no proof test is owed unless a fix
  emerges — then red pre-fix, green post-fix, in that order.

## Metric review (carried, not re-scored)

- F1-picks as a bar measures the OLD policy (gossip-first fallbacks
  that skip 'others'); r56's R2 replaces it for the linger question.
  If linger converts, the next run's question is player preference
  (would a real player pick 'others' when offered?) — answerable only
  via content quality + real-play reasoning, not driver counts. If
  linger does NOT convert, the blocking turns become r57's question.
- r55's F1m menu-occurrence bars are retired (the main menu is not a
  pick surface at driver scale; occurrence without conversion is not
  a finding).
- Carried blanks, not this run's fix unless a probe lands on them:
  Nino double-invite options; Omar unanchored favor callback; Carlos
  loop wart (repeated question + turns past the leave line); Stan
  gossip treadmill.
- Design note (why re-serving discussed-'others' is not a repeat):
  the pick recomputes at serve time and lines come through the
  said-ledger (CONVERSATIONS.md "No repeats, ever" — convoPick tracks
  said lines by TEXT across all threads); a re-served unchanged pick
  serves a different pool line or the honest exhaustion path.
