# Journey leg: DEEPENING (days 40–80) R100 — "WHEN A PROMISE IS MADE, DOES IT COME BACK?" — 2026-11-04

## Pre-registration (written BEFORE any seed runs)

Rotation read 2 (deepening) at run start; r100 plays deepening, writes 2->3
at closeout. Base: master 96ee2136a at worktree creation. Policy: competent
(pinned, r95 driver lineage + r100 changes below). Seeds: fresh 93901–93904
(fresh-band check: r95 used 93801–93804, r94 93701–93704). Horizon: DAYCAP=100,
death-aware stop. Smoke seed 93900 (outside the main band) x DAYCAP=45
proves the r100 driver before the main run; smoke outputs deleted after
the check.

Context: r95 (same leg, same day) answered its question — betrayal
sittings, when sought, read SENSE, and follow-up sittings happen — and its
strongest single finding was Stan (93804): on the day-60 revisit he names
the missed day-45 forage promise himself ("We missed the promise...
Debts unpaid just sit there."). r95's metric review left two items, and
this run answers the first as its question and fixes the second as its
tooling deliverable. It does NOT re-judge wave 4 (r90), the knowledge
economy (r91, carried as context only), beast-trick teaching (r92), or
the standing/scale two-rulers finding (r93, carried as context only).
No game change is pre-committed: if promise threads read senseless, the
fix (if any) is judged on its own proof test; if they read coherent,
the instrument result is the finding.

## Question: promise follow-through in the deepening window

A promise thread opens when a sitting ends with `want final:
resolution=promised` (a favor accepted, a forage promised — the engine's
own marker, logged every sitting by the r95 lineage). Threads are
classified from later sittings with the SAME villager, read in full:

- NAMED — a later sitting's THEM lines name the promise, the missed
  promise, a debt, or something owed (keywords: promise, missed,
  debt, owe/owed, "forget it" debt talk). Stan's day-60 line is the
  reference shape.
- SILENT — the villager is sat with again at a later convo day and
  no later sitting names the promise at all.
- DEAD — the villager dies before any later sitting day (reported,
  never counted as silent: the dead cannot keep promises).
- NO-LATER-SITTING — the villager is alive but never sat with again
  in-window (instrument composition, not a verdict on the game).

A thread's class is co-occurrence evidence from transcripts, never
claimed as a causal consequence of the promise itself. Betrayal
accepts/declines are NOT promise threads unless their sitting also
ends resolution=promised; the pocketed declined thing is a plant,
not a promise, and stays in r95's open item, not this run's metric.

## Pre-registered bars

- P-KEEP (primary): report thread counts by class. INTERESTING if
  either (a) NAMED appears in more than one shape / more than one
  seed (Stan generalizes), or (b) SILENT is >= 50% of threads that
  got a later sitting with the villager alive (promises evaporate —
  a people-blank). If zero promise threads open, document and move
  on per the pilot rule — do not manufacture threads by re-scoring.
- P-SENSE (primary, strict): 0 SENSELESS sittings among all
  transcripts read in full. A sitting is SENSELESS only on a full
  read (contradiction, voided thread, fabricated history), never on
  a count.
- P-BLOCKED-FIX (tooling, must pass): the r95 blocked-revisit flag
  is fixed — the revisit target is prepended ONLY when it is in the
  talkable candidate list, and `blocked` is logged ONLY when no
  sitting with that villager follows that day. Proven by proof-test
  fixtures (talkable target prepended + sat; untalkable target not
  prepended; blocked logged only on no-sitting) AND by the panel's
  own sittingLog/revisitAttempts agreement (every `blocked` entry
  has no same-day sitting with that villager; every revisit sitting
  is not also logged blocked).
- Carried, not re-judged: K-CONTEXT (lessons ok/total, moots,
  proposals), M5 winnable (descriptive, by endReason), STAY-GREEN
  (0 mislabels), rotation bound (max consecutive dlg:more/dlg:details
  <= 2), S-TRACE (standing verdicts, reported not judged).

## R100 driver changes (harness only, zero game code)

1. Seed band 93901–93904; all output filenames r95 -> r100.
2. Blocked-revisit fix (r95 metric review): in the convo-day loop,
   compute talkable = info.some(x => x.id === revisitVid); pass
   (talkable ? revisitVid : null) to orderSittingCandidates; after
   the day's sittings, push {day, vid, status:'blocked'} ONLY if
   no sitting with that villager ran that day. orderSittingCandidates
   itself is unchanged (pure, proof-tested); the caller stops feeding
   it an untalkable target.
3. Analyzer gains a P-KEEP scan: promise threads from `want final:
   resolution=promised` lines, later-sitting mention scan on THEM
   lines only (YOU lines excluded — the picker naming a promise is
   not the villager remembering it), death read from the seed JSON
   census/death log where available, else from sitting absence.
   Betrayal scan, S-TRACE, K-CONTEXT carried from the r95 analyzer.

## Metric review (carried open items, not this run's bars)

- Declined-thing plants (r95 open): two r95 declines left a pocketed
  thing never revisited in-window. Still open; a future run may
  pre-register whether declines should plant a revisit.
- Stay-repeat shape (r94 candidate, still open): no sitting this
  lineage has pressed dlg:stay 4x since r94, so no new evidence
  either way.

## Canon note

No dedicated promise-follow-through section exists in
docs/CONVERSATIONS.md (searched: accepted favors + People journal,
company-favor release, water-run milestone — promises are tracked
as obligations with kept/early-end status, closed promises stay
closed). The governing rule for this run is Steve's sense-testing
law (2026-10-11): a promise that vanishes without a trace in a
later sitting with the same person reads as a villager who does not
remember — a people defect, not a count defect.
