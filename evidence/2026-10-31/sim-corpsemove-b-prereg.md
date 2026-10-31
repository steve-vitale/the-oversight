# sim-corpsemove-b — prereg (committed BEFORE any judged leg)

Run: Loop B fleshout-loop-b-20261031T1430Z, arm sim-corpsemove-b,
axis food-economy. DIAG ONLY: new files only (this prereg, driver +
splitter + analyzer + proof, evidence, corpora, table). Zero src/js
changes, zero policy-default flips, zero edits to any existing policy
file or existing script. Nothing is merged by this worker (the
coordinator merges); report status: committed on branch, pending
coordinator merge, no ship.

Pinned game base: this commit's parent (prereg adds only itself).

## Question (from sim-toolloss-b §9, claimed for this run)

On the 15215 ON trajectory (sim-toolloss-b, gap corpus), Gabriela
Ludwig's corpse (corpse_17_xrt0hz, villagerId gen_gyft62f) reads node
(2,5) on mornings 17-18 and node (4,4) on morning 19, items unchanged,
still unlooted. What moves the body home from the creek to Haven, by
what mechanism? Candidate mechanisms to discriminate (do not assume):
(a) body-recovery duty — the village recovers a dead bearer's body
(the corpses.js recoverBearer / pendingBurials path); (b) a
return-home routine of the successor or another villager carrying the
body during their day; (c) corpse relocation at succession itself;
(d) map-node recentering / a global node shift touching all corpses;
(e) any other code path that writes c.node / c.mx / c.my on a corpse.
BEARER IDENTITY FIRST on every snapshot (the toolloss design rule):
any tier/position-change claim records WHO moved/owns what — the
snapshot bearer (scholar id + name), the corpse's villagerId + name,
and the corpse's recovered/deathKnown flags — or it is a recording
artifact until proven otherwise.

## Substrate (verbatim from sim-toolloss-b)

POLICY=nighttravel, COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0,
DEPOSITGATE=1, WOODCARRY=1, WOODWARM=0 guard / 1 ON, DAYS=30, NO
prototype policy. Driver: scripts/corpsemove-trace-b.js, adapted from
scripts/toolloss-gap-b.js with READ-ONLY additions in kind and NO
behavior change: the policy stack, env gates, and day loop are the
toolloss-gap substrate unchanged.

## Instrument (READ-ONLY additions, new driver only)

- Every morning snap AND every evening row carries a full corpse
  snapshot: for every corpse, id, villagerId, corpse name, node
  (x,y), mx, my, items (id, name, units), looted, buried, recovered,
  deathKnown, dayDied, cause — plus the snapshot bearer's scholar
  id + display name FIRST in the row, and the village pendingBurials
  list (corpseId, villagerId, name, day) as stored at that moment.
- Gap lines (everything said between one daily's return and the next
  daily's entry) stored for mornings 17-20, and full day transcripts
  stored for loop-days 17-19, so the move's bracket carries its
  narration verbatim.
- No verb calls, no state writes, no RNG draws beyond the base
  policy stack. No file writes from the game-loaded process: the
  driver prints one JSON line per seed to stdout; a foreground exec
  redirects stdout to an evidence .jsonl and stderr to a log file,
  and an idle process (scripts/split-corpsemove-b.js, new) splits
  the .jsonl into per-seed corpus files. The .jsonl lives in
  evidence/ until split, then is deleted. NEVER stage judged corpora
  in /tmp.

## Seeds and stages

- JUDGED TRAJECTORY: seed 15215, ON leg (WOODWARM=1) — the trajectory
  the observation came from. Its morning/evening corpse table IS the
  judged corpus; a rerun that does not reproduce the 17-18 creek /
  19 Haven readings on corpse_17_xrt0hz-equivalent (same villagerId,
  same death day) is a trajectory-divergence failure, reported
  loudly, not judged.
- PILOT: ON leg on the toolloss 8-seed band (15003, 15009, 15091,
  15211, 15215, 15220, 15221, 15337) — run BEFORE any confirm spend.
  The pilot's job is census, not rate: does any other bearer corpse
  in the band move node, and if so on what day relative to its death
  day? A second moved bearer corpse with the same day-offset
  strengthens the mechanism claim; a moved corpse with a different
  offset or no narration is a bracket failure for that corpse, named
  as such.
- CONFIRM TRIGGER: none pre-spent. If the pilot shows a bearer corpse
  moving with an offset or narration pattern DIFFERENT from 15215's,
  a 12-16 seed confirm band is proposed to the coordinator, NOT run
  inside this arm (diag scope: one mechanism, one bracket).
- Death-aware horizon: DAYS=30 as in the substrate; dead villages
  stop simulating per the harness (no fixed-200d horizon is imposed).

## DIAG-GO bar (binding)

DIAG-GO iff the 15215 corpse table covers every morning AND evening
from loop-day 15 through loop-day 20 for corpse gen_gyft62f AND the
node change is bracketed to a SINGLE loop-day segment (one
evening -> next morning, or one morning -> same-day evening) with
the mechanism NAMED and traced to a code path (file + function +
caller + the condition that fires it, with the verbatim say line if
one exists), OR the bracket plus the excluded mechanisms are named
and the residue is stated as an explicit unknown. A table that
merely re-shows "node changed" without the bracket is NO-GO.
Bearer-identity failure (a position claim without scholar id/name
and corpse villagerId on the bracketing snapshots) is NO-GO even if
the bracket is otherwise tight.

## Sense-check (narrated vs silent)

Search the bracketing segment's gap lines + full day lines for any
line naming the body coming home, a grave dug, or a burial, and
report verbatim whether the move is narrated anywhere. A move with
no narration anywhere is reported as a narration gap (finding, NOT
built — diag only, no narration code is written by this arm).
A move WITH narration is not a silent teleport even if the carrier
is the anonymous village ("they") rather than a named villager.

## Exclusions to record explicitly

For each candidate in the Question, record INCLUDED / EXCLUDED with
the evidence: (a) recovery path — check pendingBurials due-day vs
move day and the recovered flag flip; (b) carrier routine — check
whether any villager's day transcript (successor Dakota's day 18
included) carries the body during the day, and whether the move
falls in a day segment at all; (c) succession relocation — check
whether the move coincides with the succession morning (day 17) or
later; (d) recentering — check whether OTHER corpses change node on
the same segment; (e) other writers — grep the code for writers of
corpse node/mx/my and say which were live on this trajectory.

## Metric review (carried, not changed mid-run)

Pre-registered metrics bind this run: bracket tightness (single
segment), mechanism trace (file/function/caller/condition), bearer
identity on bracketing snapshots, narration presence verbatim.
A miss is NO-GO, never re-scored against a friendlier metric
mid-run. Metric doubts go under "metric review" in the evidence
file for the NEXT run. §15 panel: NOT APPLICABLE, declared here —
zero game-root changes, so there is no before/after game delta for
scripts/balance-panel.js to compare. The before/after here is
morning vs evening snapshots on the same legs, and it is never
labeled a panel comparison.
