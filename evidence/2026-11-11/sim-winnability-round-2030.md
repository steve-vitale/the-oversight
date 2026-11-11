# Loop B 2030Z coordinator evidence — proof refresh b6 + survival-collapse control

- **Run:** fleshout-loop-b-20261111T2030Z, axis scale-onramp / winnability chain
- **Claim:** `hidden_files/lever-claims/fleshout-loop-b-20261111T2030Z.json`
  (arms sim-proofrefresh-b6 + sim-survivalcontrol-b; master d33ca69f9 at claim)
- **Coordinator:** timed out before the panel finished; the main session
  adopted the run (loop-closeout skill) and completed arm 1. Arm 2 had
  already landed on master before the timeout.
- **Master tip at adoption:** `51bd2542c` (arm 2's merge); arm 1's branch
  rebased onto it (no manifest files moved by arm 2 — see below).

## Arm 1 — sim-proofrefresh-b6: GO, 12/12

The measurement proof is current again. The b5 panel went stale when the
1830Z mournblooded arm landed `13e6f40ae` (one manifest key:
`src/js/standing.js`). The fresh 64-case panel was generated on the
1f27fd269-based branch (68 jobs: 64 observer-on + 4 observer-off proof
cases; 32 cached before the timeout, 36 completed in the adoption).
`scripts/balance-proof.json` re-points at
`evidence/2026-11-11/neutral-proofrefresh-b6.json.gz`
(digest `06f38709…22da7`). `scripts/test-proofrefresh-b6.js`: **12 passed,
0 failed** — proof-update exits 0, workflow 9/9, cache-flags 4/4, ontology
138 systems, neutrality match on all 4 proof cases, 64 rows / 64 combos,
neutrality reproduces the b5 AND reconcile panels (regeneration moved no
verdict), sourcesStable true, and both stale-input negative checks fail
validate on this tip as they must. Evidence:
`evidence/2026-11-11/sim-proofrefresh-b6.md`, prereg
`evidence/2026-11-11/sim-proofrefresh-b6-prereg.md`, proof
`scripts/test-proofrefresh-b6.js`.

Master-move check (prereg rule): master moved 1f27fd269 → 51bd2542c during
the panel window (arm 2's three commits). The diff touches ONLY `evidence/`
and `scripts/survivalcontrol-*.js` — no manifest file. Panel kept, branch
rebased onto the explicit new master SHA, all proof legs re-run on the
rebased branch before the `--ff-only` merge.

Telemetry check for the b6 panel: ATTEMPTED and REFUSED by the tool
itself — it cannot parse the gzipped panel
("Unexpected token '\u001f' … is not valid JSON", exit 1). Same refusal
class as the survivalcontrol telemetry refusal (wrong input class, not a
measurement). Recorded, not waived; baseline not rolled. The panel's wall
numbers are its own validated rows, not a balance arm's per-seed files.

## Arm 2 — sim-survivalcontrol-b: MASTER_CHANGE, already landed

**Verdict: MASTER_CHANGE — 1/8 survived vs 6/8 on the vetphantom fix
leg, same seeds (190391–190398), median 126d vs 150d.**
The collapse is NOT band variation and NOT the phantom returning
(0 phantom days on all 8 seeds — the vetphantom roster-check fix holds).
Villages die fighting, ~24 median days earlier, with the same combat-heavy
death profile (95% combat / expedition / wild; starvation 0, sickness 0,
thirst 0). Wall: wins 0/8, national 0/8, table 0/8, wave-5 2/8, wave-4
8/8, blooded 0/8 alive at end (190398 died blooded, holding veterans).
Tribute ready 0/8 — there is no pair to pay with, because the second
veteran dies before the village does. The tributedeliv fresh band
(190411–190418: 1/8, median ~130d) agrees with this control band, and both
disagree with the old base — the shape of a code change, not a band quirk.
Follow-up owed: **bisect**, candidates in order (1) reconcile merge,
(2) dawn scorer, (3) mournblooded standing.js. The tributedeliv-b §8
survival-collapse question is now ANSWERED; the bisect is queued as the
next arm. Evidence: `evidence/2026-11-11/sim-survivalcontrol-b.md`,
prereg, summary `survivalcontrol-b-summary.json`, corpus
`evidence/2026-11-11/perseed-survivalcontrol-b/` (8 per-seed JSONs).
Landed on master as `35c0a109d` (prereg), `dfef3e152` (instrument,
41/41 green), `51bd2542c` (evidence + corpus + summary).

## Scale wall (round aggregate)

| | Vetphantom fix leg | Survivalcontrol (current master) |
|---|---|---|
| Survived | 6/8 | **1/8** |
| Median survival | 150d | **126d** |
| Wins / national / table | 0 / 0 / 0 | 0 / 0 / 0 |
| Wave-5 unlocks | 3/8 | **2/8** |
| Wave-4 unlocks | 8/8 | 8/8 |
| Deaths (band) | 707 | 615 (fewer — villages die sooner) |
| Blooded (end) | 5/8 | 0/8 alive |

The wall got taller on current master: wave 4 still unlocks everywhere,
but survival collapsed and wave 5 thinned. The b6 panel re-proves the
instrument on this same master, so the next arm's measurements rest on a
current proof.

## Infrastructure notes

- Host write flap hit both arms: the survivalcontrol driver needed three
  passes (probe-wait-rebuild per the write-flap skill); the b6 panel's
  first 32 cases survived the coordinator timeout in the cache and the
  adoption resumed cleanly. No work lost anywhere.
- Heartbeat script is slow (~9 min) and failed twice during the flap.
- The `safe-commit.sh` index clobber struck on both survivalcontrol
  commits; repaired both times with the ls-tree pipe.
- sim-findings.md: appended the vetSays `/elder/` → "Elderberry" filter
  quirk, the flap + slow-heartbeat notes, and marked the survival-collapse
  question [decided] with the MASTER_CHANGE answer.

## Closeout (adoption)

- Arm 1 branch rebased onto explicit master `51bd2542c`; proof legs
  re-run green on the rebased tip; merged `--ff-only`; worktree released;
  branch deleted.
- Claim `fleshout-loop-b-20261111T2030Z.json` deleted; lock
  `fleshout-loop-b.lock` (run_id `fleshout-loop-b-20261111T2030Z`) deleted
  after verification.
- Tracker updated (this round's entry); run note appended to
  `~/memory/2026-11-11.md`.
- Next blanks, in order: (1) survival-collapse BISECT (reconcile merge →
  dawn scorer → mournblooded standing.js), same 8-seed control on the
  pre-reconcile base first; (2) the 210405 redactor residue — an
  instrument-level witness for the clearing path; (3) say-cap /
  say-bucketing fixes for the next first-numbers arm; (4) treeline filler
  repetition + twin-name duplication; (5) the siege design's next step —
  the apex drive-off verb (decision-pack 163/256 UNRULED, Steve calls).
