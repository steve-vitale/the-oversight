# Journey landing r284 — prereg (Lane A, leg 0)

Run: playtest-20261124T1632Z. Leg 0 landing, horizon DAYS=28 (days 1–14
judged, horizon d28). Base master `8616c6b2f` (includes r283 scale, merged
this run). Rotation read `0`; closeout writes `0→1`. Worktree
`journey-landing`, branch `journey-landing`.

## Question
1. Q1 GO re-check on a fresh band with the r158 contest-ledger fix in
   place: does the landing leg still play end to end (alive, System
   contact, contests fire and close, no new defect class)?
2. Live exercise of the death-terminal fix (r158's owed item):
   death/refusal/arena-loss terminals fire ~1 in 66 contests, so a
   10-seed panel (~22 contests) usually cannot exercise the fix live.
   This run adds a dedicated UNSCORED probe: 2 panel seeds re-run to
   DAYS=56 to raise the contest count and hunt a live terminal. The
   probe is not scored against M-PR1/M-PR2; any terminal it catches is
   reported as the live exercise.

## Pre-registered metrics (binding, MEASUREMENT.md §14)
- M-PR1 (primary): on the panel band, TERMINATED contests left open in
  the ledger (open entry + a participant death joined to it). Bar 0.
  r158 baseline: 0.
- M-PR2: every contest death autopsy with context LEDGER has a non-null
  contestOutcome; bar 0 nulls (r158: 0).
- Stay-green watches (carried from r62/r158): System contact <= d10;
  0 starvation deaths; villages alive at d28 unless killed by a
  contest/monster (death-aware horizon, +10d tail max); scholar deaths
  <= 2; 0 pocket fights; zero-DMG refused-turns 0; plenty-voice present.

## Seeds / policies
- Pilot: seeds 1392–1394 (3 seeds), DAYS=28, competent verbatim. If the
  pilot does not play (no System contact, FATALs, villages dead early),
  stop and document — do not burn the full band.
- Full panel (only if pilot plays): seeds 1392–1401, policy competent
  verbatim, DAYS=28, FAVOR_ACCEPT default ON.
- Probe (unscored): seeds 1392, 1393 re-run to DAYS=56, same driver,
  OUTDIR landing-r284-probe-after.
- Seed band freshness: 1392–1401. Searched all preregs under evidence/
  and hidden_files/evidence/ for the band; the only "1392" hits are kcal
  values in old transcripts (e.g. "+1392 kcal" meal lines) and finding
  #1392 in sim-travelfirst-a-prereg.md — no seed-band reservation.
  Landing bands used: 1362–1371 (r155, re-run by r158), 1372–1381
  (r156), 1382–1391 (r157). 1392–1401 is the next fresh band.
- No src/js change planned. Any fix follows a panel finding, with a
  proof test (red → green).

## People check
Read full transcripts for at least one seed: do villagers act like people
in the first fortnight (sense-testing law)? Note any contest-death grief
lines after a ledger-closed death, and any orphaned invite lines (r283's
carried dialogue blank — count them here too if they appear).

## Verdicts
Reachable / fun / winnable for the landing leg, in plain words.

## Metric review (filled after the run)
- (to fill)

## Tooling
Driver: scripts/journey-landing-r284-20261124.js (r158 driver verbatim
except OUTDIR landing-r284-after, header, default seeds 1392–1401).
Analyzers: evidence/2026-11-24/journey-landing-r284-analyzers.sh (r158
script verbatim except header). M-PR1 checker:
hidden_files/evidence/2026-11-24/mpr1-check-r284.py (r158 checker
verbatim except header).
