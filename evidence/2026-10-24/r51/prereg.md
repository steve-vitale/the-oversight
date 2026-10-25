# journey-social r51 — PRE-REGISTRATION (lane B, leg 5, social life)
Written BEFORE any r51 seed runs. Run date: 2026-10-24 CDT (evening).
Rotation-b: 5 -> 6 on successful landing (crisis next).

## Leg question (r51): THE RE-OFFER + THE MATCHER
r50 left two instrument fixes and one design question. This run settles all three:
  1. THE MATCHER: r50's M5 failed on the letter — 0 served grievance prose
     saved — because its line-matcher misses the actual serve phrasing.
     Root cause (verified in source BEFORE this prereg): the serve line is
     "I still haven't forgiven that/them" (memdepth.js convoGrievanceLine),
     but r50's matcher only knew "hasn't forgiven" / "still hasn't" /
     "not...forgiven" — "haven't forgiven" matches NONE of those. Fix: add
     haven'?t forgiven / hasn'?t forgiven to the matcher, and save serve
     convos from the WRAP record (t2pickOther why=grievance/vgrievance)
     so a future matcher miss can never again lose the prose.
  2. THE GOSSIP CAP: r50's driver caps gossip-first picks at 3 PER RUN —
     runState.gossipPicks is never reset — while its own header says
     "3 gossip-first convos/day". DECISION: that is a driver bug, not a
     design. Fix: reset gossipPicks daily (same place othersDoneToday
     resets). r51 gossip metrics are therefore NOT comparable to r47-r50;
     r51 is the new gossip-behavior baseline. (Metric review carries this.)
  3. THE RE-OFFER (design question, DECIDED here per Steve's
     figure-it-out-yourself directive): 'others' re-offers when its pick
     CHANGES. Rationale: the read is dynamic — deepest bond, newest
     grievance — so "discussed once" is the wrong freshness key; and the
     codebase already blesses re-asks after change (t2clock +
     t2changeLine: "You asked me that before. It's a different question
     now."). Rule (C): a spent 'others' counts fresh again iff the current
     t2pickOther differs from the last served pick in person or why, and
     the new why is not 'neutral' (random roster picks are noise, not news).
     Legacy saves with said-but-unrecorded servings stay one-shot (safe).
     The src fix lands IFF S1 below goes GO and checks stay green;
     otherwise it is reverted before landing and the run reports NO-GO.

## Seeds / horizon / policy
Seeds: 4701-4704 (fresh). Horizon: DAYCAP=140, death-aware (dead/scattered
village stops; +10d tail max, as r50). Policy: warm-competent + 3
gossip-first convos/day (deep mode, now actually per-day) + 1
others-steered convo/day (r48 steering). Seeded-crack probe repeated
exactly as r50 (first depth>=2 NPC-NPC pair gets recordGrievance
'ambushed', 60 at end of day; 30d seeded-speaker steering) so the
serve-rate before/after is comparable (r50: 2/4).

## Bindings (a miss is NO-GO, never re-scored mid-run)
  S1 REOFFER (primary, re-tests r50 S1): late-window (d91-140) natural
     'others' picks >= 2 on >= 2/4 seeds. (r50 baseline: 1/4 seeds.)
  G1 SEEDED SERVE: seeded grievance serve within 30d on >= 3/4 seeds.
     (r50 baseline: 2/4 — serves fired only where 'others' was fresh.)
  G2 MATCHER: on every seed with >= 1 wrap serve, >= 1 serve transcript
     saved AND matcher count > 0; every saved serve transcript must read
     as a genuine grievance line on manual sense-read (0 false positives).
  M1 formation: deep2 NPC-NPC pairs >= 10 on every seed whose village ends
     with >= 5 alive. (r50 range: 16-29.)
  M3-cond: pooled late close-read TP rate (lateTP/lateClose) >= 40%.
     (r50 pooled: 6/12 = 50%.)
  M4 knack stay-green: knack lines served with 0 verbatim repeats.
  M5 people: >= 6 transcripts sense-read (bondy + late + seeded +
     wrap-served), 0 fabricated-shared-history flags, >= 1 genuine serve
     transcript read (ties to G2).
  M6 guardrail: >= 3/4 seeds end with >= 5 alive. (r50: 3/4.)
  GOSSIP SANITY (landing gate for the driver fix, report-only metric):
     gossipPicks > 3 on all 4 seeds (proves the per-day reset works).
     If not, investigate before landing the driver change.
  SRC-FIX LANDING GATE: S1 GO + check.js --quick green + proof tests
     green. Else revert src change, land instruments only, report NO-GO.

## What would count as interesting
- Re-offered picks clustering late (surface restored) vs early only.
- Seeded serves firing on speakers whose 'others' was spent pre-seed
  (the exact r50 failure mode, now fixed or not).
- Matcher capturing natural (unseeded) serves, not just seeded ones.
- Any re-offer that serves a stale/wrong person (pick-change logic bug).

## Metric review (filled after the run)
- Gossip comparability break (per-day reset) — r51 is the new baseline.
- (filled after the run; revisions apply to the NEXT run only.)
