# journey-landing r136 — PREREG (Lane A, leg 0 LANDING)

**Run id:** playtest-loop-20261115T114401Z (scheduled Sun 2026-11-15 05:45 CST).
**Base:** local master at run start (`874d97c00`, version bump 79060b74b).
**Rotation:** read 0 → write 0→1 at closeout on success. Next leg: establishment.
**Worktree:** `~/workspace/worktrees/journey-landing` (branch `journey-landing`).
Heartbeat at registration; 10-min hbloop for the whole run.

## Q1 (PRIMARY) — Decide the two r135 metric-review items, with proofs

r135 deferred two metric decisions to this run. Both are decided here, in
the prereg, before any panel runs.

### Q1a — person-trust bar shape: ADOPT absolute ±1 for small counts

r135 metric review: "a baseline count of 1 under ±25% admits only exactly
1, so any single-errand flip fails the test. Proposed for the NEXT run: an
absolute ±1 allowance for baseline counts under 4 (or equivalent)."

**Decision: adopt.** `withinTol` in `scripts/test-person-trust-20261108.js`
becomes: baseline 0 → got ≤ 2 (unchanged); baseline 1–3 → ±1 absolute;
baseline ≥ 4 → ±25% (unchanged). The baseline counts themselves do NOT
move (FORAGE stays 1); only the bar shape changes, with a comment citing
the r135 metric review and this prereg. This is a test-bar change, not a
loosening of the game: the panel the bar guards is unchanged, and the bar
still fails on a 2-errand flip at count 1 (3 vs 1) and on a ±2 flip at
count 2 (4 vs 2).

**Proof (binds):**
- New `scripts/test-person-trust-bar-shape.js` requires the test file's
  exported `withinTol` and asserts the boundaries: (got 2, want 1) PASS —
  the r129 flip that failed the old bar; (0, 1) PASS; (3, 1) FAIL;
  (4, 2) FAIL; (1, 2) PASS; (200, 187) PASS; (140, 187) FAIL; (0, 0)
  PASS; (3, 0) FAIL. It also asserts the OLD ±25% rule would have failed
  (2, 1), so the change is doing the work claimed.
- Full `node scripts/test-person-trust-20261108.js` passes on current
  master (panel FORAGE 1 vs baseline 1 — passes under both bars; the
  bar-shape test above is what proves the new rule).

### Q1b — HEED counter verbatim weighting: ADD HEED-V, legacy keeps reporting

r135 metric review: "the counter should weigh verbatim repetition, not
just offer-count."

**Decision: add HEED-V to `scripts/analyze-landing-q1-dialogue.js`.**
A legacy-HEED sitting (≥10 turns, heed/details offered ≥3×, never taken)
counts as a REAL filler loop (HEED-V) only if some non-warning THEM line
(≥20 chars, so "Okay."-style stubs don't count) is delivered verbatim
2+ times in that sitting. Warning lines themselves are excluded — D2
already covers warning-line repeats. HEED-V ⊆ HEED by construction; both
counts print side by side; the legacy count keeps reporting unchanged.

**Proof (binds):**
- On the r135 corpus: HEED = 1, HEED-V = 0. The Dauletkhan sitting
  (1150 d6) was read in full: its brush-offs are all distinct lines
  ("...Never mind me. What were you going to say?", "Anyway — people
  stuff. What did you want?", "Anyway — that's my problem, not yours.",
  "I could go on about myself all day...", "Alright, I'm listening."),
  and the want ends engaged (stage 3). The verbatim discriminator must
  read 0 there.
- Synthetic fixture: the same sitting with one THEM line duplicated
  verbatim must read HEED-V = 1. Proven by
  `scripts/test-analyze-landing-q1-dialogue-heedv.js` (black-box: runs the
  analyzer on the r135 corpus + a /tmp fixture dir and asserts the
  counts).
- HEED-V is a PROPOSAL this run: it is reported, not binding. It binds
  from r137 if it discriminates on this run's panel (HEED-V = 0 where the
  flagged sitting reads clean on sense-read, HEED-V = 1 only on a real
  verbatim repeat).

## Q2 — Fresh landing panel (regression watch)

Driver: the r135 driver verbatim except OUTDIR `landing-r136-after` and
header. Seeds 1142–1151, DAYS=28. Corpus in goal hidden_files
`evidence/2026-11-15/landing-r136-after/`. Master has moved since r135
(scale r207, establishment r210, deepening r212, sim landings) — this
panel is the regression watch on the new master.

**Bars (bind, judged against r132/r134/r135):**
- M1 ALIVE-D14: 10/10 alive at d28.
- M2 SYSTEM CONTACT: 10/10 by d9.
- M3 FIGHT-LOG: 0 unknown/mixed trigger.
- Zero-DMG invariant PASS.
- Practice: movedCells d1→d28 ≥ 50, seedsWithMove 10/10.
- Pocket watch: 0 pocket fights, 0 stuck turns.
- D1 watch: 0 garbled-label renders.
- HEED: legacy count reported; HEED-V reported (proposal, not binding).
- M-PR1: max per-seed never-offered ≤ 1 (r129 bar).
- Personal bridge: 0 repeats in a sitting. Small bridge: 0 repeats.
- Presshop farUnreached reported (carried shape, r131→r135 = 1 each).
- R66 HUNGRY: starvation deaths 0, starvingWarnings 0.
- 1130-d6 amnesia shape: 0 recurrences. Miriam line: 0 "That's settled".
  Deflect-fallback: 0 `fellBack`.
- Nodloop: LOOP=0.
- Pilot first: seeds 1142–1145; expand to all 10 unless the pilot is
  broken (a broken pilot is a loud failure, not a quiet skip).

## Q3 — People check (M5, sense-read)

Read 5 full transcripts from the Q2 panel. Bar: each sitting shows the
NPC wanting something, options engaging or deflecting it, endings
resolving / planting / owing. No fabricated shared history, no filler
loops, no static menus. Second-sample hunt: the want-thread resume WATCH
(curious/dream thread, r134 — resume acknowledges without re-asking, one
sample): report whether a resume take on a curious thread recurs and
whether it acknowledges without re-asking.

## Q4 — Telemetry

`telemetry-check.js` on the Q2 panel vs
`telemetry-baselines/landing-split.json` (re-seeded r131). LOUD lines are
same-run investigation items. Baseline is NOT rolled unless the panel
carries new information (r134/r135 precedent: byte-identical panel → no
roll).

## Policies / seeds

- Landing panel: seeds 1142–1151, 28d, r135 driver verbatim except
  OUTDIR/header.
- Person-trust panel: seed 84101, 30d, `scripts/policies/competent`.
- No threshold, bar, price, or gate changes in this run except the Q1
  items above (bar-shape change + HEED-V instrument addition, both with
  proofs). No src/js changes expected; if the panel surfaces a game
  defect, fix in the worktree with a proof test, or document and carry.
