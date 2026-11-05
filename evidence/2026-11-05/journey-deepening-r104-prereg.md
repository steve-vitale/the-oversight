# Journey leg: DEEPENING (days 40–80) R104 — "DO PROMISES GET NAMED NOW?" — 2026-11-05

## Pre-registration (written BEFORE any seed runs, and BEFORE the fix is panel-tested)

Rotation read 2 (deepening) at run start; r104 plays deepening, writes 2->3
at closeout. (Note: r103's note claims 2->3 was written at its closeout, but
the rotation file still read 2 at this run's start — either the write failed
or the note is wrong. This run plays deepening per the file and writes 3 at
closeout.) Base: master e938cda83 at worktree creation. Policy: competent
(r102 driver lineage, unchanged policy wraps). Seeds: fresh 94301–94304
(fresh-band check: no 943xx band in evidence; r103 used 94201–94204, r102
94101–94104). Horizon: DAYCAP=100, death-aware stop. Smoke seed 94300
(outside the main band) x DAYCAP=45 proves the r104 driver before the main
run; smoke outputs deleted after the check.

## Pre-registration amendment #1 — SEED-BAND CORRECTION (written BEFORE the re-run panel, 2026-11-05 ~11:00 UTC)

The 94301–94304 band named above is CONTAMINATED: the run's
freshness check covered only the current day's evidence, which the
2026-11-05 AGENTS.md lesson (Loop A 0915Z dmground) now forbids as a
freshness check. A full check (all dated preregs + all dated .md +
evidence filenames) finds seeds 94301–94308 were run 2026-10-24 by
sim-pantrystarve-b (8-seed pilot corpus, 150d, competent) — the
94301–94304 panel already run this morning reuses those seeds. Its
P-KEEP finding (2 NAMED) is real evidence the fix fires in the wild
(the prior use was a different sim measuring pantry starvation, and
cannot manufacture repay lines), but the pre-registered "fresh"
claim is void, so the verdict CANNOT rest on that panel. The panel is
re-run on 92101–92104, verified fresh by the full check: 0 filename
hits, 0 .md mentions (including all preregs), 0 hits in the
forbidden-band lists the run could find, across all evidence dates.
(The 94xxx–97xxx ranges are saturated: 944xx/945xx/947xx named in
prior notes, 94601–94728 a planned casecount band with corpus files,
951xx cookbulk, 961xx awayration2/hurttraveler, 971xx arrears/hurthome,
981xx used, 881xx eggroad/endgame. 92101–92104 is the first clean
band found by exact-boundary checks.) The 943xx panel outputs are
KEPT as evidence and disclosed in the run note as the superseded
first panel; the verdict is judged ONLY on the 921xx re-run. All
other pre-registered definitions, thresholds, and carried instruments
are unchanged. Smoke seed for the re-run: 92100 x DAYCAP=45 (deleted
after the check, per the original prereg).

## The intervention (one fix, landed before the panel)

Root cause (code-read, this run, before any seed ran): P-KEEP was judged
ABSENT in r103 (0 NAMED across 7 revisited-alive threads, r100+r102+r103
aggregate) NOT because the engine cannot name a promise, but because the
only path to the naming lines is seed-gated and the seeds cannot survive
the sitting spacing:

- `ask_favor` resolve on 'promised' plants a `repay` seed
  (convo-wants.js: `resolve` → `{wantId:'repay', note: favor.short +
  ' you promised', favorId}`).
- `repay.opener` names the promise in every state: open → "About
  {short} — have you had a chance?"; fulfilled → "You came through on
  {short}. I won't forget it."; broken → "You said you'd help with
  {short}. ...It's done now. Forget it." It settles on speak via
  `repay.onSurfaced` → `favorSettleOnSurfaced` (fulfilled→'thanked',
  broken→'acknowledged'), so each promise is named exactly once.
- BUT `repay.pick()` returns 0 — seed-driven only — and
  `convoCheckSeeds` deletes seeds older than 7 days. Convo days are
  45/60/80 (15–20 days apart), and favor deadlines are 0–2 days, so by
  the next sitting the seed is dead AND the favor is settled — and no
  path selects `repay` from the favor record itself. The naming lines
  exist and are correct; they are unreachable in this window.
- The water/forage `repay` shortcuts at the top of `convoSelectWant`
  already prove the pattern: select `repay` directly from a live favor
  record, `fromSeed: false`, `seedFavorId` set.

The fix (convo-wants.js, `convoSelectWant`, after the seed check so live
seeds keep priority): when the villager's current favor
(`convoGetFavor`) is in a voice-needing state — 'fulfilled' (thanks
owed), 'broken' (cool distance owed), or 'promised' with a matching open
obligation (reminder owed) — select `repay` directly from the record.
Settled states ('thanked', 'acknowledged', 'moot', 'declined', 'asked')
are excluded, so the check fires at most once per favor. No new lines,
no new system: it routes the existing `repay` want through the existing
default-want opener, which already calls `onSurfaced`. A proof test
covers: (a) a 'broken' favor with no live seed 15 days on selects
`repay` and the opener names it; (b) the same favor once 'thanked'
does NOT select `repay` (state-gated, no nag loop); (c) a live seed
still wins over the record check.

## Question 1: promise-keeping after the fix (P-KEEP, primary, verdict now)

Same scan as r100/r102/r103 (analyzer carried, unchanged definitions):
a promise thread opens when a sitting ends with `want final:
resolution=promised`. Later sittings with the SAME villager are scanned
on THEM lines only for debt/promise wording
(`/promis|missed|debt|\bowe\b|owed|forget it/i`). Classification: NAMED
if any later THEM line mentions it; SILENT if a later sitting exists but
never mentions it; DEAD if the villager died after the thread day;
NO-LATER-SITTING if no later sitting exists. Only revisited-alive
threads (NAMED or SILENT) judge the verdict.

Verdict: PRESENT if NAMED >= 1 in the fresh panel (the fix's voice
fires in the wild — a villager names a promise from a sitting 15+
days earlier); ABSENT if NAMED = 0 across all revisited-alive threads
(the fix did not reach the wild — investigate why, do not re-score).
No re-scoring: threads are counted exactly as the carried analyzer
classifies them. Before/after: r103 (pre-fix, same analyzer, seeds
94201–94204, 0 NAMED / 2 revisited-alive) vs r104 (post-fix, same
analyzer, fresh seeds 94301–94304). Fresh seeds, not identical ones:
the fix changes conversation flow, so identical seeds would diverge
after the first repay sitting; the comparison is panel-to-panel on the
same instrument with the same pre-registered threshold. The balanced
panel (MEASUREMENT.md §15) is the instrument for balance/survival
changes; this run's instrument is the carried P-KEEP analyzer, whose
pre-registered threshold is the judge — stated here so the choice is
not a mid-run re-score.

INTERESTING if NAMED >= 1 (the blank is filled in the wild) OR if
NAMED = 0 with threads present (the fix is proven in the proof test
but does not reach the wild — a routing gap worth naming precisely).

## Carried context (reported, not re-judged)

- V-INIT-BOND (r103 primary, now carried): same scan, same
  definitions. Expectation 0 — this fix does not touch bonds. A
  nonzero count would be a surprise, reported, not re-scored. The
  bond-initiation blank still needs a system (perception-gated NPC
  proposer); this run does not build it.
- G-SENSE: all transcripts read in full; senseless sittings counted
  (expectation from r103: 0). Any senseless sitting is read and named,
  not just counted. The fix adds no new lines, only routes existing
  ones — a senseless repay sitting would be a routing defect, named
  as such.
- D-THING (descriptive, r95 open item): sittings ending in a declined
  invitation that leaves a pocketed thing, and whether any later
  sitting revisits that thing. Still open; this run does NOT fix it
  (one fix per run). Carried with the same count method.
- B-SIT / B-FOLLOW (carried): betrayal sittings and follow-ups,
  same scan as r103.
- S-TRACE (carried): standing-trace verdict, same scan as r103.
- Survival/descriptive: endReason, maxGameDay, wave reached, pop at
  end, per seed — descriptive only, not a winnability verdict (fresh
  seeds, small panel). The fix routes conversation, not survival; a
  large survival swing would be reported and investigated, not
  claimed as a fix effect.
- G-ASSIGN/G-STEER/G-STICK goalSnaps are collected by the driver for
  continuity but NOT scored: the goal question is closed for this
  window.

## What this run does NOT do

- Does not build the NPC bond-proposer system (V-INIT-BOND). That is a
  builder brief, not a tweak; r103 documented the blank with its
  mechanism (UI-only propose functions).
- Does not fix D-THING (pocketed thing never revisited). One fix per
  run; D-THING stays open with its count method.
- Does not re-judge villager goals, standing trace, betrayal sittings,
  beast-trick teaching, or the standing/scale two-rulers finding.
  Those are carried as context only.

## Metric review (required section in the run note)

No pre-registered metric is re-scored mid-run. If a metric proves
wrong, it is written here and the revision proposed for the NEXT run.
