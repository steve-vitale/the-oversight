# sim-atimescale-b — Does any already-tried A destination close over days 5-8?

Run: oversight-flesh-out-loop-b, arm sim-atimescale-b
(coordinator brief 2026-11-02, run fleshout-loop-b-20261102T2030Z,
axis food-economy). Worktree sim-atimescale-b, branch
sim-atimescale-b. Prereg: evidence/2026-11-02/
sim-atimescale-b-prereg.md (committed 82fe83f48 BEFORE any
judged read or spot-check leg; tools committed 2eef69d0d).
This worker does NOT push, bump, verify live, merge, or rebase;
the coordinator lands the branch. Status to coordinator:
committed in worktree, pending coordinator merge.

## Verdict (judged against the prereg header, never re-scored)

- **NO-GO — 0 confirmed multi-day A setups in 40 tries.**
  GO required >= 1 confirmed setup (walk-out clean AND day-5
  end at the destination with E passing AND some day-end
  6/7/8 at the destination with E false AND a contiguous
  camp from day 5 through the closing day). None closed.
- The multi-day extension does not rescue the A story on this
  corpus: of the 14 clean-entry tries, 2 camped through day 8
  with the lateral escape alive at every day-end, 4 broke
  camp on day 7 (scholar back home), and 8 broke camp on
  day 8. No clean-entry leg ever saw a day-end E failure at
  the destination on days 6, 7, or 8.
- This is a construction verdict (DIAG-ONLY), not a guard
  verdict: no armed legs ran, no vetoes, no episode counts.

## What was built (new files ONLY, zero game-code change)

- scripts/atimescale-b-analyze.js — multi-day A-closing reader
  for one archived destfirst stage-2 A leg: walk-out + walk-E
  (per destfirst-b-confirm.js), day-5 end/E, and days 6-8 end
  position + E (via/directOk/legs), with contiguous-camp logic.
- scripts/test-atimescale-b.js — proof 8/8 (7 analyzer
  fixtures: close day 7, close day 8, pass-through, broken
  camp, walk-out-E failure, day-5 already closed, leg ends
  early; plus a reused-files-unmodified check).
- evidence/2026-11-02/sim-atimescale-b-read-<seed>-<dest>-
  from-destfirst-A.txt — one per-try read file for all 40
  tries (DAY lines for days 5-8 + the ATIMESCALE line).
- UNCHANGED, verified by the proof test's git check: all of
  src/js, scripts/policies/competent.js, the construct
  policy/driver, and every destfirst/shapes instrument. Zero
  src/js changes, zero default flips, zero bundled fix.

## Procedure, honestly stated (read this before reusing the numbers)

The judged data are the ARCHIVED destfirst stage-2 A legs,
not new legs — and that is by prereg design, licensed by the
spot-check below. Those legs already ran 30 days under the
destfirst procedure (homeconstruct driver,
POLICY=construct-shadow, CONSTRUCT_SHAPE=A,
CONSTRUCT_DAY_A=5, DAYS=30) with competent.daily untouched
on days 6-8, so their days 5-8 records ARE the multi-day
extension. Re-running all 40 would be a deterministic replay
of the same legs, not new evidence.

### Determinism spot-check (not judged): 3/3 PASS

Re-ran 69701 dest 6,2 (clean-entry), 69709 dest 5,8
(walk-out-E failure near-miss), and 69703 dest 0,0
(clean-entry) with the destfirst procedure verbatim (routes
rebuilt from the archived day-5 construct steps). Days 5-8
end positions AND full dayEndReturnSim records matched the
archive exactly on all 3 legs (12/12 day records). The
archive is a faithful replay; the judged read stands on it.

## Full ledger (40 tries, seed | dest | walkout | walkE | day5E | closing | reason)

| 69701 | 6,2 | true | true | true | — | camped-through-day8-E-passing |
| 69701 | 6,6 | false | null | true | — | walkout-incomplete |
| 69702 | 0,4 | false | null | true | — | walkout-incomplete |
| 69702 | 0,5 | false | null | true | — | walkout-incomplete |
| 69703 | 0,0 | true | true | true | — | camp-broken-day8 |
| 69703 | 1,5 | true | true | true | — | camp-broken-day8 |
| 69704 | 0,0 | false | null | true | — | walkout-incomplete |
| 69704 | 0,2 | false | false | true | — | walkout-incomplete |
| 69705 | 5,7 | false | null | true | — | walkout-incomplete |
| 69705 | 5,8 | false | null | true | — | walkout-incomplete |
| 69706 | 0,2 | false | null | true | — | walkout-incomplete |
| 69706 | 0,3 | false | null | true | — | walkout-incomplete |
| 69707 | 5,2 | true | true | true | — | camp-broken-day8 |
| 69707 | 5,3 | true | true | true | — | camped-through-day8-E-passing |
| 69708 | 5,0 | false | null | true | — | walkout-incomplete |
| 69708 | 6,0 | true | true | true | — | camp-broken-day8 |
| 69709 | 5,8 | true | false | false | — | walkout-E-failed |
| 69709 | 6,3 | false | null | true | — | walkout-incomplete |
| 69710 | 5,0 | false | null | true | — | walkout-incomplete |
| 69710 | 5,1 | false | null | true | — | walkout-incomplete |
| 69711 | 0,5 | true | true | true | — | camp-broken-day8 |
| 69711 | 0,6 | true | true | true | — | camp-broken-day8 |
| 69712 | 5,0 | true | true | true | — | camp-broken-day7 |
| 69712 | 5,1 | true | true | true | — | camp-broken-day7 |
| 69713 | 6,8 | false | null | true | — | walkout-incomplete |
| 69713 | 7,1 | false | null | true | — | walkout-incomplete |
| 69714 | 0,5 | false | true | true | — | walkout-incomplete |
| 69714 | 0,6 | true | true | true | — | camp-broken-day7 |
| 69715 | 0,2 | false | null | true | — | walkout-incomplete |
| 69715 | 1,4 | false | null | true | — | walkout-incomplete |
| 69716 | 0,5 | true | false | false | — | walkout-E-failed |
| 69716 | 1,4 | false | null | true | — | walkout-incomplete |
| 69717 | 5,5 | false | true | true | — | walkout-incomplete |
| 69717 | 5,6 | false | null | true | — | walkout-incomplete |
| 69718 | 0,1 | true | true | true | — | camp-broken-day8 |
| 69718 | 0,8 | false | null | true | — | walkout-incomplete |
| 69719 | 5,6 | true | true | true | — | camp-broken-day7 |
| 69719 | 7,7 | true | true | true | — | camp-broken-day8 |
| 69720 | 0,0 | true | false | true | — | walkout-E-failed |
| 69720 | 0,2 | true | false | true | — | walkout-E-failed |

Breakdown: walkout-incomplete 22 (engine-blocked routes, as
at destfirst); walkout-E-failed 4 (pocket already at entry —
outward prevention, not homeward rescue); clean-entry 14, of
which camp-broken-day7 4, camp-broken-day8 8,
camped-through-day8-E-passing 2. No leg lost the village
before day 8 (daysAlive 30 on 39 legs, 29 on the
walkout-incomplete 69708-5,0 leg — reported, not dropped).

## Why A never closes (the mechanism, sharply)

Four days of foraging from the destination do not kill the
lateral escape: in both through-camp cases the day-end E
stayed lateral legs=1, direct still failing, on days 5, 6,
7, and 8 alike. And the camp itself is short-lived: 12 of
14 clean-entry scholars are back home by day 8's end, so
the window for a closing is mostly 2-3 days, not 4. The
one near-miss that LOOKS like a multi-day pocket —
69709 dest 5,8, camped at the destination days 5-7 with E
false at every day-end — fails the walk-out clause (its
final walk-out hop E-failed), so it is the known
outward-prevention case, not a closing. Context only, not
re-scored: the 69707-5,3 leg was still camped at its
destination past day 8 (days 9-11, E passing), so even a
longer window on that leg shows no closing through day 11;
the 69701-6,2 leg returned home on day 9.

## Balanced panel (§15, context never verdict)

VACUOUS, stated deliberately: a DIAG-ONLY construction check
on archived shadow legs, not a before/after lever
comparison — no baseline/arm pair exists to panel, and the
panel expresses the guard policies, not the construct
instrument. No compare file is fabricated.

## Wall numbers (honestly limited, window-stated)

Construction legs, not natural play. Archived A legs (40):
daysAlive 30 on 39, 29 on 1; maxWaveUnlocked wave-2 on 11,
wave-3 on 29; national / table / wins 0 on every leg (no
national/table/win field exists in these leg records; 0 is
the destfirst context value for the same corpus, and no
wall movement is shown or claimed). Window-limited 30d
construction substrate — this arm's window (days 5-8) cannot
reach national/table/win by construction.

## Sense-testing (transcripts, not just counts)

Longest clean-camp case: 69701 dest 6,2 (camped days 5-8,
E passing throughout). It reads as a person out foraging,
not a mechanism: day 5 the scholar walks out to (6,2),
forages unknown shoots and nuts at (6,1), and camps; days
6-8 they work the tiles around the camp — hickory nuts at
(6,0) on day 6, empty forages on day 7, wild onion shoots
at (6,1) on day 8 — while the village carries on back
home (Paloma on the stone pile, water runs, teaching by
the fire: "Deirdre taught everyone about Pupunha"). The
honest strangeness: the scholar's kcal drains 1120 → 256
→ 67 → 0 across the camp, "You camp wild tonight — no
pantry meal. Eat from your pack," and "STARVING: health
and energy falling" on day 8 — yet they stay out one more
night and only walk home on day 9, despite the lateral
escape being open the whole time. That is shadow-leg
competent behavior (the instrument prescribes the camp by
leaving competent.daily alone), not a game verdict: a real
villager with an open way home and an empty belly would be
expected to use it sooner. No veto line appears anywhere
in this run, because shadow legs never veto.

## Village assessment (plain words)

Forty forced trips, followed for four nights each, and the
pocket that closes over days never shows up. Villages
screened on the destfirst band are full of plausible
pockets at a single moment, but a pocket that forms while
a person camps there — the thing shape A needs — does not
form in this window: the way out sideways stays open night
after night, and most campers simply go home before it
could ever close. The scholar's camp itself feels human
(foraging nearby ground, coming home hungry), which makes
the missing piece clearer: it is not the camper's behavior
that fails, it is the ground — nothing in these four days
takes the sideways escape away.

## Metric review (for the NEXT run, never this one)

- The prereg's contiguous-camp clause did real work: without
  it, the 69709 case (E false at the destination on days
  5-7) would read as a closing. Keep it.
- The window's binding constraint turned out to be camp
  duration, not day count: 12/14 clean camps end by day 8.
  A follow-up that merely widens the window to day 12 on
  this instrument would mostly re-test the same 2 legs.
  The next question is not "longer" but "what closes a
  lateral": a different construction (a camp the scholar is
  held in by something other than competent.daily's drift
  home, or a destination whose lateral chain itself
  depletes) — or acceptance that shape A needs a different
  substrate than destination-first screening.
- No metric is revised mid-run; the GO threshold (>= 1
  confirmed) stands as missed.

## Findings backlog notes (for the coordinator to append to hidden_files/sim-findings.md — do NOT edit that file from this lane)

- [open] 2026-11-02 — A-timescale — no already-tried A destination closes over days 5-8: 0/40 confirmed multi-day A setups; lateral escape survives 4 days of camping in both through-camp cases; camp duration (12/14 clean camps end by day 8) caps the closing window (sim-atimescale-b evidence).
- [open] 2026-11-02 — A-timescale — shadow-leg campers starve at camp with the way home open: 69701-6,2 drains 1120 → 0 kcal across days 5-8 and only returns day 9 despite a passing lateral escape (sim-atimescale-b sense test; instrument behavior, not a game verdict).
