# Journey landing r291 — prereg (Lane A, leg 0)

Run: playtest-loop-20261128T0145Z. Leg 0 landing, horizon DAYS=28 (days 1–14
judged, horizon d28). Base master `ab3c2637a` (includes r288 scale
sim-scalecensus-a, sim-fourthseat-a, sim-callfirst-a evidence-only
landings). Rotation read `0`; closeout writes `0→1`. Worktree
`journey-landing`, branch `journey-landing`.

## Question
1. Q1 GO re-check on a fresh band with the current master: does the
   landing leg still play end to end (alive, System contact, contests
   fire and close, no new defect class)?
2. M-PR2 under the r289 metric-review re-scoping: participant deaths OR
   ended contests only. r289's literal reading fired on 2 monster kills
   inside a still-open contest; the re-scoped reading is 0. This band is
   the first judged under the re-scoped metric.
3. Mantle-latency watch, now written in (r289 metric review): r284
   latency 0–1, r289 one case at 2 (1408, scholar died away from Haven).
   Bar: max mantle latency ≤ 2.
4. Scholar-death watch re-read (bar ≤ 2): bands so far 1 (r158), 5
   (r284), 2 (r289).
5. Orphaned invite lines re-count (r289: 6/29 ask_favor sittings, 21%;
   r284: 9/39, 23%) — the carried dialogue blank. Counted, not fixed
   here (conversation-engine change, owed to a conversation build arm).

## Pre-registered metrics (binding, MEASUREMENT.md §14)
- M-PR1 (primary): on the panel band, TERMINATED contests left open in
  the ledger (open entry + a participant death joined to it). Bar 0.
  r289 baseline: 0.
- M-PR2 (re-scoped, r289 metric-review adoption): every contest death
  autopsy with context LEDGER has a non-null contestOutcome, scoped to
  autopsies where the deceased is a contest participant OR the contest
  has ended. Bar 0 nulls (r289: 0 under this scoping; 2 under the
  literal reading, both monster kills in a still-open contest).
- Stay-green watches (carried from r62/r158/r284/r289): System contact
  <= d10; 0 starvation deaths; villages alive at d28 unless killed by a
  contest/monster (death-aware horizon, +10d tail max); scholar deaths
  <= 2; mantle latency <= 2 (new, per r289); 0 pocket fights; zero-DMG
  refused-turns 0; commit-offer <= 15%; HEED-V 0; plenty-voice present.

## Seeds / policies
- Pilot: seeds 1412–1414 (3 seeds), DAYS=28, competent verbatim. If the
  pilot does not play (no System contact, FATALs, villages dead early),
  stop and document — do not burn the full band.
- Full panel (only if pilot plays): seeds 1412–1421, policy competent
  verbatim, DAYS=28, FAVOR_ACCEPT default ON.
- Seed band freshness: 1412–1421. Searched all preregs under evidence/
  (`grep -rln "1412" evidence/ --include="*prereg*"`) and all *.md under
  evidence/ for the band strings ("1412–1421", "1412-1421", "seeds
  1412", "1412, 1413"); the only prereg hits are the transplant
  "14+12" family naming (sim-transplant15e-1412-prereg.md and its
  p12/p2/p23/p3conv siblings — "1412" there means families 14+12, not
  seed 1412) and seeds 14125/14137 listed in
  sim-lackingline4-b-prereg.md (5-digit seeds, not 1412). No .md names
  the band 1412–1421. Landing bands used: 1362–1371 (r155, re-run by
  r158), 1372–1381 (r156), 1382–1391 (r157), 1392–1401 (r284),
  1402–1411 (r289). 1412–1421 is the next fresh band.
- No src/js change planned. Any fix follows a panel finding, with a
  proof test (red → green).
- Staged contest-heavy probe (r284 metric-review proposal for a live
  refusal/arena-loss terminal read): NOT in this run. It needs its own
  prereg as a dedicated driver arm; the panel + people check + gate
  fill this run.

## People check
Read full transcripts for at least one seed: do villagers act like people
in the first fortnight (sense-testing law)? Note any contest-death grief
lines after a ledger-closed death, and count orphaned invite lines.
Watch: the warn_you line shared verbatim across seeds (r289: Ellis 1403
d8 / Raj 1406 d9, same words) and the wry closing "Well. That was almost
a conversation. We're improving." (1402 d13) — voice duplication watches,
not defects unless they spread.

## Verdicts
Reachable / fun / winnable for the landing leg, in plain words.

## Metric review (filled after the run)
- (to fill)

## Tooling
Driver: scripts/journey-landing-r291-20261128.js (r289 driver verbatim
except header, default seeds 1412–1421, OUTDIR landing-r291-after).
Analyzers: evidence/2026-11-28/journey-landing-r291-analyzers.sh (r289
script verbatim except header). M-PR1 checker:
hidden_files/evidence/2026-11-28/mpr1-check-r291.py (r289 checker
verbatim except header).
