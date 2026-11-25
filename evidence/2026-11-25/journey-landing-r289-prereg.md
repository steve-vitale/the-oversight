# Journey landing r289 — prereg (Lane A, leg 0)

Run: playtest-20261125T0230Z. Leg 0 landing, horizon DAYS=28 (days 1–14
judged, horizon d28). Base master `23b9a721e` (includes r288 scale, r286
deepening, sim-fleeguard-b live-numbers guard, sim-wilddeath-b DIAG-GO
instruments). Rotation read `0`; closeout writes `0→1`. Worktree
`journey-landing`, branch `journey-landing`.

## Question
1. Q1 GO re-check on a fresh band with the current master: does the
   landing leg still play end to end (alive, System contact, contests
   fire and close, no new defect class)?
2. Scholar-death watch re-read: r284 had 5 scholar deaths on 3/10
   seeds vs the ≤2 bar (r158: 1). Is that band variation or a deadlier
   regime? This band is the re-read the r284 metric review asked for.
3. Orphaned invite lines re-count (r284: 9/39 ask_favor sittings, 23%;
   r283 scale: 5/19, 26%) — the carried dialogue blank. Counted, not
   fixed here (conversation-engine change, owed to a conversation
   build arm).

## Pre-registered metrics (binding, MEASUREMENT.md §14)
- M-PR1 (primary): on the panel band, TERMINATED contests left open in
  the ledger (open entry + a participant death joined to it). Bar 0.
  r284 baseline: 0.
- M-PR2: every contest death autopsy with context LEDGER has a non-null
  contestOutcome; bar 0 nulls (r284: 0).
- Stay-green watches (carried from r62/r158/r284): System contact <= d10;
  0 starvation deaths; villages alive at d28 unless killed by a
  contest/monster (death-aware horizon, +10d tail max); scholar deaths
  <= 2; 0 pocket fights; zero-DMG refused-turns 0; commit-offer <= 15%;
  HEED-V 0; plenty-voice present.

## Seeds / policies
- Pilot: seeds 1402–1404 (3 seeds), DAYS=28, competent verbatim. If the
  pilot does not play (no System contact, FATALs, villages dead early),
  stop and document — do not burn the full band.
- Full panel (only if pilot plays): seeds 1402–1411, policy competent
  verbatim, DAYS=28, FAVOR_ACCEPT default ON.
- Seed band freshness: 1402–1411. Searched all preregs under evidence/
  and hidden_files/evidence/ for the band; the only hits are commit
  hashes (e.g. 141126b07) and unrelated seed ranges (11390, 51401–51422)
  — no seed-band reservation. Landing bands used: 1362–1371 (r155,
  re-run by r158), 1372–1381 (r156), 1382–1391 (r157), 1392–1401 (r284).
  1402–1411 is the next fresh band.
- No src/js change planned. Any fix follows a panel finding, with a
  proof test (red → green).
- Staged contest-heavy probe (r284 metric-review proposal for a live
  refusal/arena-loss terminal read): NOT in this run. It needs its own
  prereg as a dedicated driver arm; the panel + people check + gate
  fill this run. The death terminal already fired live in r284's panel
  (1397 Siege); refusal + arena-loss stay proof-test-only.

## People check
Read full transcripts for at least one seed: do villagers act like people
in the first fortnight (sense-testing law)? Note any contest-death grief
lines after a ledger-closed death, and count orphaned invite lines.

## Verdicts
Reachable / fun / winnable for the landing leg, in plain words.

## Metric review (filled after the run)
- (to fill)

## Tooling
Driver: scripts/journey-landing-r289-20261125.js (r284 driver verbatim
except OUTDIR landing-r289-after, header, default seeds 1402–1411).
Analyzers: evidence/2026-11-25/journey-landing-r289-analyzers.sh (r284
script verbatim except header). M-PR1 checker:
hidden_files/evidence/2026-11-25/mpr1-check-r289.py (r284 checker
verbatim except header).
