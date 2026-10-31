# sim-scale-onramp-round-1315-a — coordinator evidence (Loop A, run fleshout-20261031T1315Z)

Axis: scale-onramp (standing directive: the scale wall is the blocking axis).
Worker arm landed: sim-sighit-a (commit 0fe9bc4ee, merged locally, pending ship).
Zero src/js changes in this run. No version bump, no push — the ship loop owns deploys.

## Run shape (what actually happened)

- Stale-lock recovery at takeover: the prior Loop A run's lock (1107Z, 124 min old)
  and its worktree heartbeats (12:17Z, 54 min old) were both stale per the loop
  rule, and no 1107Z worker process was running (only loop B's windowcarry trace).
  The 1107Z claim was retired to .DEAD with a note; its branches/trees were left
  untouched for the main-session closeout (which later wrote
  fleshout-loop-20261031T1107Z-handoff.note and deleted the loop lock mid-takeover
  — the lock was recreated 13:29:32Z with the same run id).
- Three arms were planned (sighit / allycap / patrolsilent). Only sim-sighit-a
  registered: the container EPERM flap blocked the other two registrations
  across 5+ attempts 13:13–13:35Z (ref-write EPERM; allycap branch created
  orphaned with no worktree, patrolsilent neither). Those two arms are DEFERRED,
  not killed — they remain open for a later run. The claim was narrowed to
  ['sim-sighit-a'] before the worker spawned.
- The worker's own commit was blocked 8 times by the flap (safe-commit /tmp
  index-lock EPERM); the coordinator retried and landed it on attempt 4
  (14:11Z). A stale main-tree .git/index.lock (12:59Z, no process holding it)
  blocked the first ff-only merge; it was removed and the merge succeeded.
  A stray 0-byte test-c.lock in the main tree (13:50, probe debris, no owner)
  was removed to restore the clean-tree invariant.

## sim-sighit-a — verdict (judged against its prereg, confirm sample alone)

Question: does the wave-4 monster signature hit cap fight rounds at party scale?
Instrument: forced-meeting fixture band through real Game.fieldFight
(spearxbow-a P2-BOW party shape; NOSIG leg zeroes the signature in-fixture
while still calling the original, preserving RNG draws and side effects).
Proof: scripts/test-sighit-a-20261031.js, 32/32 green — re-verified by the
coordinator in the worktree before commit and again on merged master.

- DIAG-NO-GO (pooled): R1 median rounds NOSIG >= MAIN + 1? NO (2 vs 2).
  R2 mean paired delta rounds >= 0.5? NO (0.396, misses by ~0.10).
  R3 median leader HP NOSIG >= MAIN + 10? YES (64 vs 50, +14).
  R1+R2 miss, so pooled NO-GO — never re-scored mid-run.
- Eater-only YES (reported, never promoted to judge): the eater's every-round
  signature is the only one that moves the median round count (1 -> 2,
  mean paired delta +0.75, median leader HP 20.5 -> 60.5).
  Congregation (+0.583 paired, median 2 -> 2), suburb (+0.25, 2 -> 2),
  audit control (0, 2 -> 2) are not round-capped.

## Before/after numbers (identical streams; MAIN = signature live, NOSIG = zeroed)

Confirm: 96 fights (4 beasts x 2 legs x 12 streams 201-212); pilot 64 fights
(gate PASS: join 100%, wrapper-match 100%, sig-add presence 1.0 all beasts).
All 96 confirm + 64 pilot fights ended vFlee in both legs; kills/drive-offs
0/160, vDie 0 everywhere. Removing the signature changes NO fight's outcome.

Pooled, MAIN vs NOSIG: median rounds 2 / 2; mean rounds 1.83 / 2.23;
median total damage 100.5 / 110; median DPR 53.25 / 51.75 (falls in NOSIG
because extra rounds dilute the same volley-led damage);
median leader HP left 50 / 64; median ally HP left 39 / 48.5;
median volley 30 / 30 (identical — volley fires before any signature);
ally down 33% / 17%.

Round-1 single hits, MAIN (pre-sig / sig delta / post-sig pre-armor, median):
- Congregation (Absolution 12/12, base [50,70]): 62 / 61 / 123.5, range [109,137],
  100% above band top, final median 93.
- Eater (Gorge 5, Smack-Rush 7): 65.5 / 56.5 / 121, range [102,153],
  100% above band top, final median 86.
- Audit, control (Field Audit 7, Assessment 5): 58.5 / 0 / 58.5, range [46,74],
  0% above top; all 12 audit pairs identical on rounds and HP — instrument clean.
- Suburb (HOA Fine 6, Property Tax 6): 39 / 41 / 80.5, range [69,104],
  100% above band top, final median 77.
All-rounds sig share of incoming damage: eater 0.518 (17/17 hits inflated),
congregation 0.367, suburb 0.369, audit 0. Pre-signature totals in-band on 100%
of hits everywhere — no unmodeled layer. The congregation beam / suburb tax
fall disproportionately on the unarmored ally (median sig delta 63.5 / 40 on
ally hits vs 0 on leader hits); the eater hits leader (69) and ally (53) alike.

## Reachability verdict

Wave-4 beasts are reachable as fights but not as winnable fights at P2-hide
party scale, with or without the signature: ~110 median total damage vs
1000-1400 HP, 2-round vFlee wall intact after signature removal. The wall
numbers (national / table / wins, wave reach) are NOT OBSERVABLE on this
substrate — a fixture band has no village trajectory, no scale ladder, no win
flag — stated structurally per the prereg, never as 0s. The bound this band
establishes: at the largest party fieldFight can field (leader + 1 sensed ally)
in the best earnable armor, signature removal still leaves 96/96 fights vFlee
in a median 2 rounds with 0 kills.

## Village assessment, in plain words

Two villagers walk up to a wave-4 beast in cured-hide armor, loose their
arrows, and then the beast's signature does its work — but at this party
scale the signature mostly does not end the fight sooner, it just makes the
ending bloodier. The Congregation's beam drops the unarmored companion in one
136-point blow while the armored leader walks away at 64 health. The Eater is
the exception: every hit carries an extra gorge, the leader ends at about 20
health — one more mouthful from dead — and taking the gorge away buys a whole
round and 40 health. Against the Audit there is nothing extra at all. In every
case the pair runs, having scratched about a tenth of the beast's health. The
signature explains the bruises, not the retreat.

## Sense-testing (worker, 4 full MAIN confirm transcripts read)

Fights read as people fighting (ally enters via co-presence, flee is a spoken
judgment call) with two narration blanks, flagged not fixed: (1) sigW4's
beam/gorge/tax say() lines never land in rec.log, so a signature hit reads as
one inflated base blow, not its own event; (2) the 1-round eater vFlee ends
with no flee line at all. Beasts unnamed in logs is knowledge-gating, coherent;
volley "arrow/bow" wording is accurate for this bow-carrying tier.

## Blanks filled or documented

- FILLED (closed question, one exception): pooled, the wave-4 signature is NOT
  the round-cap and NOT the kill-blocker at party scale; the eater alone is
  round-capped by its signature; the signature's pooled price is leader health
  (+14 median HP) and ally survival (ally down 33% -> 17%).
- DOCUMENTED (in worker evidence + this file; backlog append blocked at closeout
  by the EPERM flap — a later run can append these 4 items from the evidence
  files): signature narration gap; silent 1-round eater flee;
  ally-as-signature-sponge; eater-shaped lever as the single signature-shaped
  lever.
- Ranked next arms (worker, not chased here): (1) eater-shaped signature lever
  on live sorties; (2) sigW4 narration wire-in to rec.log (game change);
  (3) morale/damage-race wall measurement (flee rule + damage race).
- Deferred by infrastructure, NOT killed: sim-allycap-a (second-ally engine-cap
  census) and sim-patrolsilent-a (patrol-silent seeds census) — registration
  blocked by the EPERM flap; allycap branch exists orphaned (no worktree, never
  registered, no commits) and patrolsilent has neither branch nor tree.

## Panel (§15) and telemetry (§10)

- Panel: NOT APPLICABLE, none fabricated — balance-panel.js is a
  policy-comparison driver on one frozen root; it cannot express a
  forced-meeting fixture band with a paired instrument leg (same rationale as
  volleyfix-b / partyvolley-b / spearxbow-a). Judge is the prereg comparison +
  determinism gate.
- Telemetry check: REFUSED BY DESIGN, no LOUD lines, baseline NOT rolled.
  `node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json
  --current 'evidence/2026-10-31/perseed-sighit-a/*.json' --metrics
  national,table,wins,exiled` refuses recorder-corpus input (all rows carry
  top-level anchorCommit) — same as the ammo/w4field precedent. A fixture
  corpus must not reseed the scale-wall run baseline.

## Corpus determinism note (read before reusing)

The full ~230KB corpus could not be landed as a file — the flap denied every
file write to it across ~25 minutes (initial write, 6-attempt retry loop, two
chunked-retry fixture processes, probes to the worktree, /tmp, and /dev/shm).
The committed corpus is a SUMMARY corpus (all judged fields, 48 pairs, leg
medians, per-beast/per-leg hit summaries, round-1 summaries, 4 transcripts;
per-fight array omitted). It is byte-deterministic: two SIGHIT_SUMMARY_OUT runs
give identical sha256 40925cee0cc29db84792a9ac719501d53eff59bed81a5976c18788f4638a39dd.
Re-run scripts/sighit-a-fixture-20261031.js (default mode, no env flags) to
regenerate the full corpus when the flap clears; the proof test re-derives
every verdict from the committed summary corpus (32/32 green).

## Metric review (applies to the NEXT run, never a re-score)

1. The pooled R1/R2 bars hid the eater: a pooled median round bar is the wrong
   shape when one beast's signature fires every round and others' every 2-3
   rounds. Future signature preregs should judge per-beast round-cap flags as
   co-primary with the pooled verdict.
2. R2's 0.5-round bar was missed by 0.104 (0.396 measured). A future prereg
   could pre-register the paired-delta distribution (share of pairs gaining
   >= 1 round: here 18/48 = 37.5%) alongside the mean, since the mean is dragged
   by the audit's exact zeros (12 pairs at 0 by control design).
3. NOSIG hit records must be labeled counterfactual wherever quoted:
   postSig/sigDelta in a NOSIG fight are would-be values (the wrapper still
   calls the original); only finalDmg is applied.
4. Median sig delta on leader hits (0 for congregation/suburb) is a target-mix
   artifact, not a signature absence: leader hits cluster on non-sig rounds
   because sig-round hits disproportionately meet the ally-share roll. Future
   reports should split sig deltas by round parity as well as by target.

## Convergence state

scale-onramp: CONVERGING, NOT converged. No game change landed in this run
(measurement only); the full seat remains 0 and wave 5 remains 0 on measured
bands. The binding constraints after this arm are the morale flee rule and the
damage race at P2-hide scale, plus the eater's every-round stack as the single
signature-shaped lever. No axis is recorded as converged.

## Files

- Worker commit (merged locally, pending ship): 0fe9bc4ee
  (evidence/2026-10-31/sim-sighit-a-prereg.md, evidence/2026-10-31/sim-sighit-a.md,
  evidence/2026-10-31/perseed-sighit-a/fixture-band.json,
  scripts/sighit-a-fixture-20261031.js, scripts/test-sighit-a-20261031.js)
- This coordinator file: evidence/2026-10-31/sim-scale-onramp-round-1315-a.md
