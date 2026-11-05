# Journey leg: DEEPENING (days 40–80) R106 — "DO PROMISES GET NAMED NOW, WITH DENSER SITTINGS?" — 2026-11-05

## Pre-registration (written BEFORE any seed runs; no game-code change planned)

Rotation read 2 (deepening) at run start; r106 plays deepening, writes 2->3
at closeout WITH verified write + retry (see rotation note below).
Base: master 25de3b127 at worktree creation.
Policy: competent (r105 driver lineage, unchanged policy wraps).
Seeds: fresh 92401–92404. Horizon: DAYCAP=100, death-aware stop.
Smoke seed 92400 (outside the main band) x DAYCAP=45 proves the r106
driver before the main run; smoke outputs deleted after the check.

Freshness check for 92401–92404 (full check per the 2026-11-05 AGENTS.md
lesson — ALL dated preregs + all dated .md + evidence filenames +
forbidden-band lists, not just today's files): COMPLETED before the
panel ran. Boundary-aware seed-context patterns (`"seed": 9240x` /
`seed=9240x` / `SEEDS=…9240x` / `s9240x` across evidence/ + scripts/ +
docs/): 0 hits. Filename hits for 9240*: 0. Word-boundary .md mentions
of 92400–92404: 0. Scripts/ hits: 0 (covered by the seed-context grep).
Forbidden band 99201–99208 (standacc-b list) does not contain 9240x;
the files mentioning 99201 are the forbidden-list references themselves.
Smoke seed 92400 cleared the same way (0 .md hits, 0 filename hits).
Exact-string greps over JSON corpora were NOT used as a freshness
check — they drown in kcal values (r105 lesson). Band 92401–92404
verified fresh.

## Rotation note (5th sighting — sequence now consistent)

r105 deepening read 2, wrote 3 (verified at the time — and scale r100's
3->0 write at 18:42:48Z proves the 3 stuck). Landing r106's 0->1 did NOT
stick (r107 found the file still 0, mtime = scale r100's write). Landing
r107 wrote 1 at 20:07:33Z (verified). Establishment r105 read 1, wrote 2
at 21:49:52Z (verified — the file's mtime at this run's start). This run
reads 2, consistent with that chain: the writes that are verified by
read-back stick; the silent ones intermittently don't (correlates with
EPERM flap windows). This run's closeout write is verified by read-back
and retried up to 3 times, 60s apart, if it mismatches — and the
read-back result is recorded in the run note either way.

## The question (P-KEEP, primary, verdict now — denser cadence)

r105 validated the revised P-KEEP metric (proof test 12/12; scores
PRESENT 2/5 on r104's panel) but the fresh-seed verdict was ABSENT 0/2
revisited-alive — the binding constraint was the DENOMINATOR, not the
metric: 5 of 11 promise-makers died before any later sitting, and the
15–20-day sitting spacing (days 45/60/80) left few revisits to judge.
The coverage bound is exactly: same bearer survives to the next sitting
AND no live seed pre-empts AND the favor is still
fulfilled/broken/promised-with-obligation. This run widens the
denominator with the instrument change r105's metric review proposed:

- **Instrument change (pre-registered, not a re-score): CONVO_DAYS
  [45, 60, 80] -> [45, 52, 60, 80].** A fourth sitting day at day 52
  gives threads opened at day 45 a 7-day revisit window, and threads
  opened at 52 get revisited at 60/80. More sittings = more
  revisited-alive threads to judge. Nothing else in the driver changes
  (same policy wraps, same sitting mechanics: up to 3 sittings per day,
  revisit target first, stop after the first betrayal sitting).
- **Verdict**: PRESENT if NAMED (revised regex OR structural) >= 1
  among revisited-alive threads; ABSENT if 0. The old-regex count is
  reported alongside for comparability (r103: 0/2; r104: 0/5; r105:
  0/2). No re-scoring: threads are counted exactly as the r106
  analyzer classifies them.

INTERESTING if NAMED >= 1 (denser cadence lets the fix's naming reach
the wild — the coverage bound was the binding constraint) OR if NAMED
= 0 with MORE revisited-alive threads than r105's 2 (the denominator
widens but the naming still doesn't fire — the fix's reach is narrower
than its proof test, and the next question is why).

## Analyzer fix (pre-registered, r105 metric-review quirk)

`classifyPromiseThreads` pools deaths across all seeds when
classifying DEAD. Both DEAD calls in r105 were verified own-seed, but
a same-vid death in another seed would misclassify. The r106 analyzer
tags each death with its seed and filters the lookup to the thread's
seed. Proof test extended with a cross-seed case (12 -> 13 checks):
same vid dies in ANOTHER seed only -> NO-LATER-SITTING, not DEAD.
The r105 proof test is untouched (it tests the r105 analyzer).

## Carried context (reported, not re-judged)

- V-INIT-BOND (r103 primary, now carried): same scan, same
  definitions. Expectation 0 — nothing in this run touches bonds.
  build-bond-initiate is NOT merged (branch exists, no merge commit);
  this run does not build it and does not touch it.
- G-SENSE: all transcripts read in full; senseless sittings counted
  (expectation from r105: 0). Any senseless sitting is read and named,
  not just counted. A senseless repay sitting would be a routing
  defect, named as such.
- D-THING (descriptive, r95 open item): sittings ending in a declined
  invitation that leaves a pocketed thing, and whether any later
  sitting revisits that thing. Still open; this run does NOT fix it.
  Carried with the same count method.
- B-SIT / B-FOLLOW / B-LEAD (carried): betrayal sittings, follow-ups,
  and betrayal lead-ins, same scans as r105.
- S-TRACE (carried): standing-trace verdict, same scan as r105.
- Survival/descriptive: endReason, maxGameDay, wave reached, pop at
  end, per seed — descriptive only, not a winnability verdict (fresh
  seeds, small panel). A large survival swing would be reported and
  investigated, not claimed as a fix effect (no fix is planned).
- G-ASSIGN/G-STEER/G-STICK goalSnaps are collected by the driver for
  continuity but NOT scored: the goal question is closed for this
  window. (With 4 convo days, G-STICK has 4 snaps; the >=3 threshold
  still holds.)

## Watch item (not a metric, not a pre-registered fix)

r105 noted Donna's home line firing twice in one sitting, one word
apart ("I'll make it a home" / "I'd make it a home") — the repeat
ledger tracks by exact text, so a tense change slips through. If this
panel reproduces a near-duplicate line in a sitting, it is named in
the run note. A fix follows ONLY if it is a clear ledger defect with
a proof test, disclosed as post-panel, not pre-registered.

## What this run does NOT do

- Does not build the NPC bond-proposer system (V-INIT-BOND). That is
  a builder brief, not a tweak; build-bond-initiate owns it in
  another worktree.
- Does not fix D-THING (pocketed thing never revisited). Carried with
  its count method.
- Does not change succession release or seed priority (the two halves
  of r105's coverage bound). The open design question — whether the
  re-ask should ALSO name the old promise's outcome (kept / broken /
  released with its maker) — is Steve's design call, not a tweak.
  Not built here.
- Does not re-judge villager goals, standing trace, betrayal sittings,
  beast-trick teaching, or the standing/scale two-rulers finding.
  Those are carried as context only.

## Contingency

This run plans NO game-code change — it is a measurement re-test with
a denser sitting cadence. If the panel finds a routing defect (a repay
sitting that never fires where the record says it should, a senseless
repay sitting), ONE fix may follow, proven by a proof test before any
panel re-run. A fix found this way is disclosed as post-panel, not
pre-registered.

## Metric review (required section in the run note)

No pre-registered metric is re-scored mid-run. If a metric proves
wrong, it is written here and the revision proposed for the NEXT run.
