# sim-winnability-round-2130 — Loop B 2130Z round record (adoption-landed)

**Run:** `fleshout-loop-b-20261119T2130Z` · **Loop:** B · **Axis:** winnability chain ·
**Base:** master `5e38f3f7b` (1815Z adoption closeout; bowcraft turn-on live on this base) ·
**Ship during adoption:** `7d71cb971` (batch ship `5e38f3f7b-20261119-234211`, bowcraft turn-on now live).
**Coordinator closeout:** flap-blocked, NOTHING merged; this file is the round record the
coordinator could not write (fresh-file writes EPERM). Tracker review entry in
`hidden_files/convergence-tracker.md` is the companion record.

## Arm 1 — sim-rageholder-survey-b: GO (finding #2614 ANSWERED)

Survey of 4 fresh bands, 32 seeds, 150d, competent verbatim, survey substrate
(SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1 — the laterage
substrate exactly): 483 encounters, 61 holder-fights, 38 contact, 25 Rage fires,
0 errors, 0 mismatches. Designated band **106151–106158: 33 holder-fights / 19 contact /
12 fires, rate 0.243** (floor was ≥8; best band 4× the floor). Other bands: 106141–106148
16/11/10, 106121–106128 10/7/2, 106131–106138 2/1/1. Lumpiness reproduced: seeds 106151
(15) + 106158 (16) carry 31 of 33. Proof test 16/16 (worker + adoption re-run).
Branch tip `b9b64d708` (prereg) on instrument `d2ead8d9d`, based on `5e38f3f7b`.
Survey wall: wins 0/32, national 0/32, wave-5 13/32, 2,847 deaths, 36 starvation.

Corpora note: only 12/32 corpora reached disk during the flap; the other 20 were
recovered by the adoption from `@@FALLBACK` dumps in `rageholder-survey-b-legs.log`
(recovery script rebuilt at `~/workspace/recover-rageholder-corpora.js` after a VM
replacement wiped /tmp; recovered 20/20, 0 failures). The analyzer re-run from disk
reproduced every band number exactly (encounters / holder / contact / fires / rates
identical across all 4 bands); the committed survey JSON is the worker's richer
in-memory record (totals + provenance), verified against the from-disk re-run.

## Arm 2 — sim-dmgshape-rerun-b: NO-GO, kind METRIC-BROKEN (finding #2605)

Designated band 106081–106088, full substrate (survey substrate + ALLYSLOT3=1 ported
+ LAUNCHSURVIVE=1), 150d, competent verbatim, policy sha `150229eda010`. **8 launches,
4 with a first fight against the target (floor 6), 3 fled first-fights (floor 4).**
Instrument green (classification 4/4, reconciliation 0.0%, 0 errors, 8/8 files);
decomposition on n=3 fled (12 rounds, 138 dmg): D_meas 12.7/round vs the 111 winning
shape, gap 98.3, baseCeiling 60.8 (61.9% of gap, bar 25% PASS), accounted 0.694
(bar 0.70, misses by 0.006). One kill in the population: 106081 d114 herald vs Kaua,
aid origin. No expedition first-fight exists — the any-origin definition is what
found anything at all. Proofs re-run by the adoption: test 8/8, analyzer selftest
28/28 — the coordinator's 7/8 + 22/23 was the flap (section-D "corpus file written"
check), NOT a real failure. Branch tip `d4fd409d9` (instrument) on port `735fce64f`
on prereg `dbadda2b5`, based on `5e38f3f7b`.
**Landing is EVIDENCE-ONLY via cherry-pick (prereg + instrument + evidence commit);
the ALLYSLOT3 port `735fce64f` MUST NEVER MERGE.**
Finding #2617 filed this run: 4/8 launches re-launched a target TYPE whose last fight
predated the launch (both holders twice, after a kill) — the plan store holds a target
past its death. Finding #2616 EXTENDS: designation does not survive a policy move
either (17 → 9 → 8 across survey / rerun / this leg).
Wall: wins 0/8, national 0/8, table 0/8, wave-5 4/8, wave-4 8/8, standing ≥200 4/8,
standing-199 stall 4/8, median survival 150.5d, survived 5/8.

## Infrastructure — write flap 22:03Z–~23:41Z (~98 min, longest on record)

Fresh/empty file writes refused (EPERM) across the whole run; git ref/.lock writes
failed; safe-commit's mass-deletion guard refused the dmgshape evidence commit twice
(correct behavior — the flap empties the private index). The flap cleared on a VM
replacement (new boot `d3ff2111`, writes passing from 23:41Z). Flap debris in the main
tree: `docs/ONTOLOGY.md` and `sw.js` both truncated to 0 bytes — restored byte-identical
from HEAD (md5-verified) by the adoption; never committed. Two 0-byte `docs/.probe*`
files removed. No work lost on either arm.

## Landing (adoption)

- Rageholder: rebased onto current master, proofs re-run, merged ff-only.
- Dmgshape: evidence-only cherry-pick (prereg `dbadda2b5` + instrument `d4fd409d9` +
  evidence commit); port `735fce64f` verified NOT an ancestor of master before and after.
- Panel compare + telemetry-check: see below (adoption report).
- Gate: check.js --quick on the merged tip (adoption report).

## Next blanks (unchanged order)

1. Laterage re-run on designated band 106151–106158 (price the pool floor from the 19
   contact holder-fights, not 33). 2. The damage question (#2605) on a band surveyed
   under the FULL substrate AND current policy, or with a floor priced from a
   same-substrate pilot. 3. The dead-target launch check (#2617). 4. Standing-199 stall.
