# Loop B adoption round 2246Z — sim-adoption-round-2246

Run: `fleshout-loop-b-20261110T2246Z` (Loop B, winnability chain).
Coordinator timed out before closeout; adopted by the main session.
This file is the round record the coordinator did not reach.

## Arms adopted

### 1. sim-medcure-ev-b — GO, LANDED

Re-measure of the medcure question with event capture (tick-phase
snapshots), after medcure-b's NO-GO on G2 (79/82 duty cures invisible to
the daily snapshot).

- Verdict: GO against the prereg G1–G4 bar. Episode-join 100%.
- M1 (wound-fever cause): 0/21 fever deaths with a healer present vs 4/8
  without — the earlier 2.4%/24% census shape is now a valid re-measure.
- Proof 19/19; analyzer GO. Adoption worker a00b573f.
- Landed on master: `19813d717` (event-capture instrument + analyzer v2),
  `3e2290210` (re-measure evidence + corpus), `8ea7879df` (pilot corpus,
  band 160501–160508: 8 competent + 8 bare + sweep).
- Branch deleted after merge. Worktree released.

### 2. sim-proofrefresh-b2 — GO, LANDED

Measurement-proof refresh round 2. The proof had re-staled by one
game-file move (the answermail-drive landing in hierarchy.js); b2
regenerates the neutral panel on the new tip.

- Verdict: GO on the rebased tip. Fresh 64-case neutral panel
  (16 seeds x 4 policies x 150d). Trio 9/9 + 9/9 + 4/4; ontology 135;
  proof test 10/10; stale-input negative check 10/10.
- Retained panel is now `neutral-proofrefresh-b2`. The measurement proof
  is CURRENT again. Adoption worker 4ec804f7.
- Landed on master: `ecc7f8a77`, `56d0a3506`, `151d33876`.
- Branch deleted after merge. Worktree released.

### 3. sim-conjurefix-b — NO-GO, HELD (not merged)

The conjured-fight fix (finding #2100): monsters must exist as placed
world instances before a villager can fight them; no more fights summoned
by name out of thin air.

- Verdict: NO-GO — do not merge. The defect is eliminated
  (0 conjured kills/fights on the pilot band), but the fix fails the
  pre-registered kill guards and cost bar: total kills fall below the
  guard, deaths/100 village-days rise past the bar, and the panel flags
  player deaths/100d as a regression signal. Panel review_required.
- Fix needs retune, not a merge. Adoption worker b169e9be.
- Branch KEPT at `90d42bdf1` (judged evidence — NO-GO). Findings filed.
- Hygiene: the `sim-conjurefix-b` worktree directory is orphaned — the
  branch is kept and the files are intact (fix present in
  `src/js/villager-agency.js`), but it is no longer a registered git
  worktree (its `.git` pointer is gone). Do not delete the directory
  until the branch's contents are verified complete; the next Loop B
  closeout owns the cleanup.

## Wall numbers — NOT updated by this round

The coordinator's telemetry comparison produced numbers that look like a
breakthrough (national 13/64, table 60/64, wins 15/64). The coordinator
itself flagged these as a **spurious regime artifact** — panels from
different regimes compared against each other — and they are NOT adopted
as wall state here.

Last trusted wall state stands: national 0, table 0, wins 0 on the
competent panel. The only full-seat win ever observed remains the Lane B
r171 probe seed 89704 (forcedrift policy, pre-ruling code).

## Telemetry

Deviation flagged spurious regime artifact by the coordinator. No baseline
roll-forward on the strength of this round's numbers.

## Closeout state

- Coordinator evidence file: this file, written by main-session adoption.
- Lock + claim: already deleted by the coordinator before timeout.
- Branches: medcure-ev-b and proofrefresh-b2 deleted after merge;
  conjurefix-b kept (NO-GO).
- Tracker + memory + goal entry: main session (see convergence-tracker
  review note, ~/memory/2026-11-10.md).
- Master at closeout: `6d7212cda` (includes the knowfood-a landing from
  the sibling Loop A 2215Z adoption, which merged between this round's
  arms and this file).
