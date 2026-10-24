# sim-tableseat-round-1955 — COORDINATOR RUN EVIDENCE (fleshout-20261024T1955Z, axis scale-onramp)

**Run:** fleshout-20261024T1955Z · **Axis:** scale-onramp (standing directive — still
stands: see convergence note) · **Type:** coordinator run — 2 arms, both landed
locally, pending ship (no push, no version bump).
**Commits:** arm 1 `799a152ce` (rebased from `52c8a610b`), arm 2 `359413a20`
(rebased from `4cb4825b7` via `bc5962943`); this evidence committed separately.
**Sibling lanes NOT touched:** B loop food-economy (live claim 1830Z, arms
pantrystarve + leg2decide), gap-w4-narr, panel-contract-rulings. Zero `src/js`
changes in either arm — policy-side only.

## Why this round: the 1822Z next blank

The 1822Z round left one explicit blank: "a take-the-table policy, not a stronger
courtship drive" (backlog line 906: no beat-answering policy had ever taken the
table seat — table waiting reached 5/8 with wins 0/16). sim-tablesit had already
proved the seat/wait legs are never exercised against competent (0 attempts:
competent never reaches national), while leanlinkrescue reaches national
reliably (confirm: final 6/8, ever 8/8). This round composes the two: leanlink
courtship to open the door, seat legs to walk through it.

## PRE-REGISTRATION (binding, shared by both arms, written before any sweep)

- Baseline: leanlinkrescue-only (`LEANLINKRESCUE=1`), identical seeds, same
  instrument per arm (each arm ran its own baseline replication).
- Seeds (pilot): 73601–73608. Freshness: no filename/script hits at run start;
  workers re-verified with filename-level checks only.
- Horizon: 180 loop-days, death-aware (runDays breaks on `Game.over`).
- Primary: table entered (`tableDone` ever) armed ≥ baseline entered + 2.
- Deciding cost bar (from sim-scalemetric, binding): starvation deaths armed
  total ≤ baseline total + 2 AND arm-only starvation (armed starvation deaths on
  seeds where the paired baseline row had none) ≤ 2 AND median days armed ≥
  0.8 × baseline median days. All four conditions must pass or NO-GO.
- Proof gates: G1 det-gate (gate off = leanlinkrescue-only days on seed 73601);
  G2 pre-national read-only (seeds where neither arm reached national match on
  days/gameDays); G3 corpus integrity (16/16 rows, days > 0, counters present).
- Landing rule: GO → policy lands as its own commit, default-OFF only, NO
  default flips. NO-GO → policy deleted, instruments + evidence only.
- Balanced panel (§15): attempted by both arms; see metric review.

## Arm results (both judged on the pre-registered bar, no re-scoring)

### Arm 1 — sim-tableseat-a: GO (seat + wait)
Commit `799a152ce` (policy `scripts/policies/tableseat.js`: leanlinkrescue.daily
wrapped with tablesit seat leg before courtship + wait leg after; `TABLESEAT=1`
gate, off = leanlinkrescue-only). Evidence
`evidence/2026-10-24/sim-tableseat-a.md`, corpus `perseed-tableseat-a/` (16).
- Primary PASS: entered armed 3 vs baseline 0 (need ≥ 2). Seats on days 129,
  142, 161, all lesser seats, 3/3 attempts taken, 15 table answers, all Feared.
- Cost bar PASS: starvation 5 vs 5 (≤ +2); arm-only 0 (≤ 2); median 161 vs 173,
  ratio 0.93 (≥ 0.8). G1/G2/G3 all PASS. Paired court counters identical on all
  8 seeds — the delta is the seat legs alone.
- Post-rebase proof (coordinator, on merged master base): full sweep re-ran
  VERDICT GO with numbers identical; det-gate PASS. The only aggregate diff
  was the `anchorCommit` field (rebase base) — restored, worktree clean.

### Arm 2 — sim-tableseat-nowait-a: GO (seat, no wait)
Commits `bc5962943` (policy `scripts/policies/tableseat-nowait.js`: seat legs
only, wait leg omitted; `TABLESEATNOWAIT=1` gate) + `359413a20` (instrument +
evidence + corpus). Evidence `evidence/2026-10-24/sim-tableseat-nowait-a.md`,
corpus `perseed-tableseat-nowait-a/` (16 + summary.json).
- Primary PASS: entered armed 3 vs baseline 0. Same 3 seeds, same seat days
  (129/142/161), same lesser seats, same Feared path, 3/3 attempts, 0 failures.
- Cost bar PASS: starvation 5 vs 5; arm-only 0; median 161 vs 173, ratio 0.93.
  G1/G2/G3 all PASS.
- Post-rebase proof (coordinator, twice — master moved under the first proof):
  full sweep re-ran VERDICT GO with numbers identical both times; det-gate
  PASS both times.

### Cross-arm finding: the wait leg adds nothing on this band
Seat-only replicates seat+wait exactly — same seats, same wins, same medians,
same starvation. The one wait-stranded day (73605, seat+wait arm: village did
not make it back to Haven in time one day, sat the next) cost a day with no
verdict change. Waiting is not required for conversion here; whether it matters
on bands where the seat is not ready for longer is untested (backlog).

## Wall numbers (this run's judged corpora, 32 configs)

| | baseline (pooled 16) | armed (pooled 16) |
|---|---|---|
| national ever | 10/16 | 10/16 |
| national final | 2/16 | 8/16 |
| table invited ever | 10/16 | 10/16 |
| table entered | 0/16 | 6/16 |
| wins | 0/16 | 6/16 |
| wave 4 | 14/16 | 12/16 (dip is a win artifact: 73601 wins day 129 before wave 4) |
| wave 5 | 0/32 | 0/32 |
| median survival | 173d | 161d (win-censored: winners stop at 129/142/161) |

Baselines replicate exactly across two independent workers (same seeds, same
instrument family): median 173, starvation 5, entered 0, wins 0 in both. The
win is real and replicable, not a one-worker artifact.

## Reachability verdict

- The table and the win flag are now REACHABLE on the leanlinkrescue substrate
  — via the lesser seat, Feared path, first-option answers. Before this round
  wins were 0 everywhere on courtship substrates; the seat leg converts
  waiting into winning 3/8 per arm, 6/16 pooled.
- National alone does NOT reach the table: seeds 73606/73607 reached national
  at arc 3 and never saw a preview. Arc IV gates the table, not national.
- The full seat is still untested (all 6 seats were lesser). Wave 5 is still
  0/32 — the wall past national stands, and the win here does not climb it.
- What the seat does NOT do: it does not move scale itself (national ever
  unchanged 10/16). It converts invitations that already arrive; it does not
  create them.

## Village assessment (plain words)

These villages court, climb, and reach national on 5 of 8 seeds — then the
story splits. Left alone, a village that gets invited to the table never sits
down: invitations arrive, the village grinds on, decays from global back to
regional, and dies with the invitation unanswered. Give the same village a
policy that sits when the seat is ready, and the invitation turns into a win —
the audit reading the run aloud ("a lesser seat, priced for what you built"),
the sanctity line ("EVERYONE. SIT. WATCH."), the villagers going still, then
standing a little straighter, and "Show mercy" resolving into terror pledged
as a shield over every village. Where no invitation came, the legs did nothing
at all — byte-identical to baseline. The legs are a door-opener, not a thumb
on the scale. The one thin note: after the finale, routine village chatter
resumes immediately, slightly undercutting the ending's finality.

## Sense-testing notes (both arms, non-measured replays, seed 73601)

Both sense reads pass on meaning: the seat scene is coherent, the audit prices
the real run (waves 1–3 faced, 10 contests, 3 crises; war-path bars honestly
show wave 4/5 unmet), villagers react in-scene, the ledger earns the light
road. Two artifacts, both documented as findings, not gaps in the scene:
first-option answering walks Feared every time (path diversity untested), and
the win leaves the stasis-kids thread open by design (non-hosts ending).

## Metric review (binding section)

- Pre-registered metrics held: no re-scoring. The deciding cost bar from
  sim-scalemetric (starvation totals + arm-only + median ≥ 0.8×) judged both
  arms cleanly; both arms passed all four conditions with margin.
- "Table invited ever" is NON-DISCRIMINATING: baseline already 5/8, armed 5/8.
  Future seat arms must judge on entered/won, never on invited.
- First-option answering is a measurement confound for path reachability: all
  seats resolve Feared, so this run says nothing about other doors. Next seat
  arms pre-register a path-diversity check.
- Balanced panel (§15): ATTEMPTED by both arms, NOT INGESTED — `balance-panel.js
  compare` throws `TypeError: Cannot read properties of undefined (reading
  'days')` at `balance-scorecard.js:44` because it expects panel-driver
  output, not per-seed sweep rows. No compare `.md` exists; the paired
  sweep-compare tables in each arm's evidence are this run's before/after
  comparison. Filed as a findings item for the live panel-contract lane
  (not touched).
- Metric for the NEXT run: seat arms must pre-register which paths their
  answering rule can walk, and judge entered per path, not just entered total.

## Telemetry deviation check

Command: `node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-10-24/perseed-tableseat-a/*.json' --current
'evidence/2026-10-24/perseed-tableseat-nowait-a/*.json' --metrics
national,table,wins,exiled`.
LOUD lines: "national disappeared: baseline 12 -> current 0 (n=17 files)" and
"wins disappeared: baseline 16 -> current 0 (n=17 files)". VERDICT: both are
artifacts, baseline NOT rolled. (1) The script accepts a single `--current`,
so it ingested only the second dir (n=17 = 16 rows + summary.json). (2) The
baseline's own `_regime` note forbids comparing pre-seat/courtship substrates
against it ("telemetry-check will fire a spurious LOUD 'wins disappeared'").
(3) Per-seed rows carry `nationalEver`/`entered`/`won`, not top-level
`national`/`wins` paths, so the check reads 0 by construction — while the
arms' own aggregates measure entered 6/16 and wins 6/16. The check's 0s are
field-shape artifacts, the opposite of a real disappearance.

## Infrastructure notes

- EPERM flap: container `.git` ref-write denials blocked worktree registration
  6 times from ~19:53Z; cleared ~20:28Z (~35 min, matching the 1822Z precedent).
  No ref surgery, no force flags; the run waited it out and both trees
  registered clean once writes cleared. No commits were attempted during the
  flap.
- Safe-commit index clobber hit on all 3 worker commits (bogus staged-as-
  deleted entries, worktree files byte-identical to HEAD); repaired each time
  with `git update-index --cacheinfo` from HEAD blobs; commits verified correct.
- Master moved 3 times under this run from sibling lanes (journey-deepening
  r43 `321326004`, journey-succession r43 `8f4f66b87`, plus the arm-1 merge
  itself as seen by arm 2): arm 1 rebased once, arm 2 rebased twice, all with
  zero file overlap, all proofs re-ran green after every rebase.
- Rotation file left at `3`: convergence-directed work does not cycle the
  lever rotation (the tracker, not the rotation, is the plan).

## Convergence note

scale-onramp stays CONVERGING, not converged. Wins are now real (6/16 armed)
but only through a default-OFF courtship instrument plus default-OFF seat
legs, only through the lesser seat, only on the Feared path, with wave 5 still
at 0. The directive stands until the tracker records this axis converged on
measured evidence. Next blanks, in order: (1) a seat-answering variant that
walks doors other than Feared (path diversity); (2) full-seat reachability;
(3) whether waiting matters on bands where the seat stays unready longer.
food-economy stays converging (untouched; sibling B loop live).
Claim deleted; lock deleted.

## Findings

Backlog line 906 (take-the-table policy) marked fixed by this run. New items
appended: first-option Feared artifact; arc-IV gates table; wait leg adds
nothing on this band; full seat untested; perishable national window;
duplicate death labels; balance-panel ingestion gap; post-finale chatter.
