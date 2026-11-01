# sim-freeface-a — pre-registration (written BEFORE any judged sims)

Arm: sim-freeface-a, Loop A run fleshout-loop-a-20261101T1935Z, axis
scale-onramp. Type: DIAG ONLY — zero src/js, zero policy-default
flips, zero edits to existing policy files, no routing/call design,
no gate threshold moved. Backlog #1538 (steve-call: route on
refused face? re-sound after a lost muster-fight?) stays pending;
this arm sizes the binding constraint behind the muster ceiling.

## Canon read first

- docs/CANON.md read. No dedicated titan/muster canon doc exists in
  docs/ (CANON.md's table lists none; only docs/ONTOLOGY.md mentions
  the titan call functions). Behavior below is therefore grounded in
  src/js/titans.js code, not invented canon; that gap is stated, not
  filled, by this arm.
- docs/MONSTER-WAVES.md checked: wave law, no titan/muster content.
- docs/ABILITY-REFUSALS.md supplies the honesty standard used for
  sense-testing: every action narrates honestly, including failures;
  a refusal the game can see coming must refuse before payment,
  and button text must read what the button does.

## Question

On seed 90111 (muster3 band 90101–90140) the Herald refuses 22
times days 87–89, all omen stage 2, call offered, have 0 / need 10
— but a sounded call would bring only 3 blades (ceiling 6 with a
full Haven commit), because only Emberhold holds free faces (3)
while trusted quota-6 Stonebridge and Thornfield show zero free
faces on all 22 muster3 snapshots. Why zero free faces?

## Ground facts verified on THIS base before judging

- soundTitanCall (src/js/titans.js): per link, quota 6 if trust >= 70
  AND opinion >= 10 else 2; takes up to quota-minus-already FREE
  faces via titanAlliedFaces.
- titanAlliedFaces(villageId, n, excluded): roster members alive,
  adult (age null or >= 18), health > 0 (or undefined), not in
  `excluded` — where soundTitanCall builds `excluded` from
  titanUniqueAllies over ALL non-slain musters, keyed
  villageId:id, speaker first (ordering only, never a count
  effect). Faces committed ONLY to a slain titan are FREE.
- MUSTER3-SNAPSHOT RECONCILIATION (required by the brief, stated
  here before judging): muster-diag's facesFree replicates the
  titanAlliedFaces COUNT exactly — same four filters, same
  committed map (non-slain musters, unique-allies dedup), uncapped
  (soundTitanCall then caps by quota-minus-already into
  wouldYield). The one deliberate difference: muster-diag does not
  apply the speaker-first ordering, which cannot change a count.
  This arm's `free` count must equal muster-diag's facesFree for
  the same village at the same refusal; the analyzer cross-checks
  every refusal record this way, and any mismatch is an instrument
  bug to report, never a number to silently reuse.

## Census policy stack (muster3's exactly)

`withFullseatDiag(withSeatDrive(withWinDefer(TF leadfeast)))`,
FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
FULLSEAT=1 + HERALD=1 + MUSTER=1 recorders + FREEFACE=1 (new
recorder, scripts/policies/freeface-diag.js), 200d death-aware cap
(runDays days:200, same death-aware horizon as muster3).

## Method

1. Instrument: scripts/policies/freeface-diag.js records, at each
   muster-refusal utterance (same regex gate as muster-diag) and
   daily across days 80–95 (once per scholar day, via the sweep's
   policy daily wrapper), the decomposition of EVERY active link's
   village: roster total, dead, underage, health<=0, committed
   (with muster ids), free — plus speaker identity and whether
   the speaker is among the free, the per-link quota/trust/
   opinion/arrears/wouldYield, and the full committed-map contents
   (every muster, slain flag, raw allies list). Partition order is
   code-filter order (dead → underage → unhealthy → committed →
   free), so every face lands in exactly one bucket.
2. Primary object: seed 90111's refusal window (days 87–89) plus
   its daily 80–95 trace, answering whether zero-free is chronic
   or window-specific.
3. Contrast (comparison only, never judged): mustercall-b's yielding
   seed 85106 — first from its existing corpus snapshots (counts
   only), then one contrast-only run of 85106 on the freeface
   stack if the pilot GOes, labeled contrast-only in evidence. A
   contrast run never counts toward any GO bar.
4. Pilot gate (contact-gated, 8 seeds before any confirm spend):
   pilot seeds = first 8 muster3-selected seeds, 90111 first:
   90111, 90113, 90114, 90121, 90124, 90132, 90139, 90101.
   Pilot GO requires: instrument fires on all 8, instrumentErrors
   0 + musterErrs 0 + freefaceErrs 0, AND a refused Herald state
   reproduced on current base on >= 1 pilot seed. If the contact
   gate fails, verdict is INSUFFICIENT-DATA — no band-shopping.
5. Confirm: all remaining muster3-selected seeds (90102, 90106,
   90117, 90119, 90126, 90129, 90116, 90140, 90127, 90105, 90118,
   90137), ONLY if pilot GO.
6. Same-base legs (as muster3): (a) screen-vs-sweep agreement —
   freeface per-seed gameDays/won/national/table/maxWave must match
   muster3's per-seed JSONs exactly on judged seeds (recorders must
   not move trajectories); (b) corpus determinism — seed 90111
   re-run through the freeface stdout runner reproduces its own
   pilot stdout line byte-identically.

## Pre-registered GO thresholds (§14 binding — a miss is NO-GO)

- DIAG-GO: decomposition reconciles exactly on 90111 AND names the
  cause of zero-free for BOTH Stonebridge and Thornfield (a counted
  cause, not a guess: roster N, dead D, underage U, committed C
  with muster ids), with the daily 80–95 trace showing whether
  zero-free is chronic or window-specific.
- DIAG-GO-SINGLE-CLUSTER: as above but only on 90111 (no second
  refused state in-band to contrast).
- INSUFFICIENT-DATA: pilot contact gate fails (no refused state on
  current base).
- A miss is NO-GO, never re-scored against a friendlier metric
  mid-run; metric doubts go under "metric review" for the NEXT run.

## Deliverables

- scripts/policies/freeface-diag.js (instrument),
  scripts/test-freeface-20261101.js (synthetic-roster proof),
  scripts/freeface-sweep-20261101.js (stdout runner),
  scripts/freeface-split-20261101.js (idle splitter),
  scripts/freeface-analyze-20261101.js (analyzer).
- Per-seed JSONs under evidence/2026-11-01/perseed-freeface/
  leadfeast/; evidence/2026-11-01/sim-freeface-a.md (this run's
  verdict + sense-testing) and this prereg file.
- Sense-testing: read the 90111 refusal transcript lines (the
  "sound the call, muster 10 allied blades (you have 0)" line vs
  the snapshot counts) and judge whether the narration is honest
  about the cause.

## Metric review (for the NEXT run — not a mid-run rescore)

None yet; filled at end of run if the metric proves wrong.
