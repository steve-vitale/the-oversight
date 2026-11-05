# Journey leg: DEEPENING (days 40–80) R105 — "DO PROMISES GET NAMED NOW, MEASURED RIGHT?" — 2026-11-05

## Pre-registration (written BEFORE any seed runs; no game-code change planned)

Rotation read 2 (deepening) at run start; r105 plays deepening, writes 2->3
at closeout. (Rotation-write discrepancy, second sighting: r104's note
says it wrote 3 at ITS closeout, but the file still read 2 at this run's
start — the same failure r104 reported about r103. The closeout write
appears to fail silently; this run plays deepening per the file and
writes 3 at closeout, and flags the write for a check. If the file
still reads 2 at the NEXT run's start, the write path itself is broken.)
Base: master b02eb9706 at worktree creation (sim-pantryspoil-a merged
into master after this run's pull: pantry spoil line now states the unit
count — narration only, does not touch conversation routing). Policy:
competent (r104 driver lineage, unchanged policy wraps). Seeds: fresh
92201–92204. Horizon: DAYCAP=100, death-aware stop. Smoke seed 92200
(outside the main band) x DAYCAP=45 proves the r105 driver before the
main run; smoke outputs deleted after the check.

Freshness check for 92201–92204 (full check per the 2026-11-05 AGENTS.md
lesson — ALL dated preregs + all dated .md + evidence filenames +
forbidden-band lists, not just today's files): loose 922xx/923xx scan
over evidence *.md returned 0 hits for 922xx; the single 923xx hit is
a commit-hash fragment (4923106a1) in a 2026-10-25 note, not a seed.
Filename hits for 922/923 are three-digit seeds (s922/s923, Oct 16
witnesslearn), a different namespace from the five-digit 92201–92204
band. Exact five-digit check COMPLETED before the panel ran: 0
seed-context hits (`"seed": 9220x` / `seed=9220x` / `SEEDS=…9220x` /
`s9220x` across evidence/ + scripts/ + docs/), 0 filename hits for
92201–92204 as a seed token, 0 word-boundary .md mentions, 0 hits in
scripts/, 0 hits in the standacc-b forbidden list (99201–99208) and
the other forbidden-band preregs checked. A naive exact-string scan
did list files containing 92201–92204 as substrings — investigated and
all false positives: digits inside floats (e.g. 8.298233922025991)
and kcal values (e.g. `"pantryFreshBefore":92201`), never a seed.
Band 92201–92204 verified fresh; smoke seed 92200 cleared the same
way (0 .md hits, 0 filename hits).

## The question (P-KEEP, primary, verdict now — metric revised per r104)

r104's scored verdict was ABSENT (0 NAMED / 5 revisited-alive) while
its transcripts showed the fix firing in the wild: Ruth's day-80
`repay` sitting named a 35-day-old broken promise ("About the pantry
run — I keep turning it over. It's done now, but I haven't forgotten
it.") — and the pre-registered regex did not match the stale-opener
wording. r104's metric review proposed the revision; THIS run adopts
it as the pre-registered metric (not a mid-run re-score):

- **Revised regex** (same scan, same thread definition as r100/r102/
  r103/r104: a thread opens when a sitting ends with `want final:
  resolution=promised`; later sittings with the SAME villager are
  scanned on THEM lines only): old words PLUS the stale-opener
  vocabulary — `/promis|missed|debt|\bowe\b|owed|forget it|forgot|
  turning it over|still on my mind|had a chance|keep thinking|
  coming back to it/i`.
- **Structural NAMED**: a later sitting whose `want: ` line is `repay`
  counts as NAMED-STRUCTURAL. `repay` only surfaces for an unsettled
  promise (live seed or the r104 favor-record select), so a repay
  sitting IS the villager naming the promise, whatever its wording.
  The analyzer prints the sitting's opener so each structural hit is
  verified by eye in the run note. (Edge case, disclosed not hidden:
  the one-favor ledger means the repay sitting names the CURRENT
  favor; if a newer ask buried the thread's promise, the structural
  hit names the newer one. The run note checks the favor-short in
  each structural hit's opener.)
- **Verdict**: PRESENT if NAMED (regex OR structural) >= 1 among
  revisited-alive threads; ABSENT if 0. The old-regex count is
  reported alongside for comparability (r103: 0 NAMED / 2
  revisited-alive; r104: 0 / 5). No re-scoring: threads are counted
  exactly as the r105 analyzer classifies them.

INTERESTING if NAMED >= 1 (the blank is filled under the corrected
measure — the r104 fix reaches the wild and the metric now sees it)
OR if NAMED = 0 with threads present (the fix is proven in its proof
test but reaches the wild under NEITHER measure — a routing gap worth
naming precisely).

Contingency: this run plans NO game-code change — it is a measurement
re-test under the revised metric. If the panel finds a routing defect
(a repay sitting that never fires where the record says it should, a
senseless repay sitting), ONE fix may follow, proven by a proof test
before any panel re-run. A fix found this way is disclosed as
post-panel, not pre-registered.

## Carried context (reported, not re-judged)

- V-INIT-BOND (r103 primary, now carried): same scan, same
  definitions. Expectation 0 — nothing in this run touches bonds. A
  nonzero count would be a surprise, reported, not re-scored. The
  bond-initiation blank still needs a system (perception-gated NPC
  proposer); build-bond-initiate is in flight in another worktree,
  NOT merged — this run does not build it and does not touch it.
- G-SENSE: all transcripts read in full; senseless sittings counted
  (expectation from r104: 0). Any senseless sitting is read and named,
  not just counted. A senseless repay sitting would be a routing
  defect, named as such.
- D-THING (descriptive, r95 open item): sittings ending in a declined
  invitation that leaves a pocketed thing, and whether any later
  sitting revisits that thing. Still open; this run does NOT fix it.
  Carried with the same count method.
- B-SIT / B-FOLLOW / B-LEAD (carried): betrayal sittings, follow-ups,
  and betrayal lead-ins, same scans as r104.
- S-TRACE (carried): standing-trace verdict, same scan as r104.
- Survival/descriptive: endReason, maxGameDay, wave reached, pop at
  end, per seed — descriptive only, not a winnability verdict (fresh
  seeds, small panel). A large survival swing would be reported and
  investigated, not claimed as a fix effect (no fix is planned).
- G-ASSIGN/G-STEER/G-STICK goalSnaps are collected by the driver for
  continuity but NOT scored: the goal question is closed for this
  window.

## What this run does NOT do

- Does not build the NPC bond-proposer system (V-INIT-BOND). That is
  a builder brief, not a tweak; build-bond-initiate owns it in
  another worktree.
- Does not fix D-THING (pocketed thing never revisited). Carried with
  its count method.
- Does not re-judge villager goals, standing trace, betrayal sittings,
  beast-trick teaching, or the standing/scale two-rulers finding.
  Those are carried as context only.

## Metric review (required section in the run note)

No pre-registered metric is re-scored mid-run. If a metric proves
wrong, it is written here and the revision proposed for the NEXT run.
