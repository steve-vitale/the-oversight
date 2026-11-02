# sim-falseclose-b — false-close proxy arrival condition (instrument only)

Run: fleshout-loop-b-20261102T084841Z, axis food-economy, arm sim-falseclose-b.
Blank: Loop B 0741Z next blank #4. Prereg:
evidence/2026-11-02/sim-falseclose-b-prereg.md (committed as a00192eca,
BEFORE any judged sim). This arm is an INSTRUMENT arm: no game change, no
policy change, no default flip. Zero src/js edits, zero competent.js edits.

## What was built

- scripts/policies/competent-latescape-b.js — byte-identical port of the
  predecessor policy (sim-latescape-b blob, sha256 8c6e6d84…), with ONE
  added instrumentation field and no behavior change: every hop-log entry
  gains `arrived`, set after the real travelTo call returns, true iff the
  scholar's post-travel position equals the hop destination. Vetoed hops
  (orig never called) record arrived=false. Diff vs the predecessor file
  is confined to the `arrived` lines (verified with diff; see bar D4).
- scripts/falseclose-b-driver.js — port of the predecessor driver,
  behavior-identical; the only delta is the policy it loads.
- scripts/analyze-falseclose-b.js — the arrival-conditioned proxy. It
  reports the OLD proxy count and the NEW proxy count side by side per
  seed, and classifies every old-proxy entry as counted-new (with its
  evidence class) or dropped (with its reason). No silent drops.
- scripts/sweep-compare.js — additive panel registration for
  competent-latescape-b (same 6-line convention as the routeblock /
  fertrot / entrywindow registrations already in the file; the variant
  stays default-OFF). Needed for the §15 panel attempt only.
- scripts/test-falseclose-b.js — proof test, 15/15 (see below).

## Arrival condition (as preregistered)

OLD proxy (comparison only, NEVER quoted): an armed vetoed hop on loopDay
d counts iff the same-seed baseline hop log for loopDay d contains that
exact hop AND the baseline day-end position that day equals haven.
NEW proxy (quotable): the OLD conditions PLUS baseline ARRIVAL at the hop
destination that day, evidenced by (a) AUTHORITATIVE: a baseline hop entry
for that exact hop with arrived === true; or legacy fallbacks for
predecessor corpora — (b) a forage event that day at the destination,
(c) a later hop that day departing from the destination, (d) day-end
position equal to the destination. Day-start position is NOT evidence.

## Bars vs results (§14 binding)

| Bar | Result | Verdict |
|---|---|---|
| D1 diagnostic 61802: OLD = 3, NEW = 0, forages byte-identical | OLD 3, NEW 0, foragesIdentical=true (live re-run with the new driver; legacy-corpus re-analysis agrees: OLD 3, NEW 0) | PASS |
| D2 fresh band 62201–62208: per-seed OLD vs NEW table complete, every old entry classified | 8/8 seeds both legs; OLD total 24, NEW total 0, all 24 classified dropped (see table) | PASS |
| D3 positive control counted by NEW proxy: fixture (arrived=true) + fake-game arrived semantics | Fixture F3: NEW = 1, evidence arrived-field; fake-game G1/G2/G3 prove the field (accepted → true, refused → false, vetoed → false) | PASS |
| D4 no behavior change: policy diff confined to `arrived`; diagnostic trajectories match the predecessor's 61802 row | Diff confined to `arrived` lines; 61802 away 0/0, failed-trip share 0.333 both legs, armed vetoes 3 — exactly the predecessor's row | PASS |
| D5 proof test green before and after the judged runs | 15/15 before the judged runs; re-run green after (see Infrastructure) | PASS |

VERDICT: GO — for quoting the proxy only. The arrival-conditioned count
may now honestly be quoted as false closes. This verdict lands no guard,
flips no default, and changes no game behavior.

## Diagnostic (seed 61802, both legs, new driver)

```
61802 | old 3 | new 0 | counted [] | dropped ["4,4->4,6 @d14 [no-arrival-evidence]" x3] | foragesIdentical=true
```

The trace reads exactly as the predecessor described it, now with the
arrival field as ground truth. Baseline day 14:

```
4,4->4,6 arrived=false (x3, shadow attempts, engine refused)
4,4->4,3 arrived=true | 4,3->3,4 arrived=true | 3,4->5,4 arrived=true
forages @4,3, @3,4, @5,4 — day-end home (4,4)
```

Armed day 14 is identical except the three attempts are vetoed
(vetoed=true, arrived=false) before the engine can refuse them. The
scholar never stood on (4,6); the old proxy's 3 were never false
closes. Corpus-wide, the diagnostic baseline leg logs 122 hops, 61 with
arrived=true — the field is live, not stuck false.

## Fresh band (62201–62208, 30d, competent, DEPOSITGATE=0, both legs)

| Seed | Old | New | Counted | Dropped |
|---|---|---|---|---|
| 62201 | 0 | 0 | — | — |
| 62202 | 0 | 0 | — | — |
| 62203 | 0 | 0 | — | — |
| 62204 | 0 | 0 | — | — |
| 62205 | 24 | 0 | — | 24 × (4,4)->(6,4), days 23–30, 3/day, all no-arrival-evidence |
| 62206 | 0 | 0 | — | — |
| 62207 | 0 | 0 | — | — |
| 62208 | 0 | 0 | — | — |
| TOTAL | 24 | 0 | 0 | 24 |

Forages identical between legs on all 8 seeds (the guard changed nothing
on this band — every vetoed attempt was an engine refusal the guard got
to first). Band freshness: 62201–62208 checked against the 0741Z banned
list (61401–61408, 61501–61508, 61601–61608, 61701–61708, 61801–61808,
61901–61916, 61308, 60307) and against Nov evidence + sim-findings —
no prior use found.

### Sense-test: 62205 is the 61802 shape at 8× volume, not a new phenomenon

All 8 days (23–30) are byte-identical in shape: the baseline scholar
attempts (4,4)->(6,4) three times (arrived=false every time), then
actually walks (4,4)->(4,3)->(3,4)->(4,2), forages there, and ends home.
It never stood on (6,4) once in 8 days. The old proxy would have
reported 24 false closes on this band; the truth is 0. The over-count
is systematic, not a one-off: any persistently-refused hop a scholar
keeps attempting inflates the old proxy 3× per day for as long as the
pattern repeats. (Side observation, not a bar: armed veto memory on
62205 works as designed — 24 vetoes, 23 silent, exactly 1 spoken line,
on day 23.)

No live positive control appeared on the fresh band (NEW = 0 on all 8
seeds). That is not a miss: the prereg requires a positive control via
fixtures + fake-game semantics (both pass), and a live count > 0 was
explicitly NOT required. A band with zero true false closes is a
legitimate instrument result — the instrument's job here was to stop
24 phantom closes from being quoted, and it did.

## Balanced panel (§15, context never verdict)

- Base campaign (competent, 8 seeds, 30d): 8 cases, saved.
- Lever campaign (competent-latescape-b, 8 seeds, 30d): 8 cases, saved.
- Base-vs-lever compare: decision INVALID — "Unmatched policies /
  Unmatched cases". Verbatim refusal, same as the predecessor and
  sim-stayhome-b: comparePanels requires identical options (policies,
  seeds, days) in both panels. Attached as-is
  (sim-falseclose-b-panel-compare.md + .json). The comparator is not
  overridden; the run is judged from driver tables.
- Both-policy campaign (competent + competent-latescape-b, 8 seeds,
  30d): 16 cases, 0 reused, sourcesStable=true, neutrality matched on
  BOTH policies on proof seed 62201 (0 warnings). Per-seed outcomes
  identical both legs: survived 8/8, won / national / table 0, wave
  reach 1:2 / 2:5 / 3:1, maxArc 3 on all 8. Raw panel archived as
  sim-falseclose-b-panel.json.gz. The panel agrees with the driver
  tables; it does not override the prereg verdict.

## Wall numbers (in-window only, never pooled across arms)

30d pre-seat window: national / table / wins 0 both legs (expected
measurement profile, not a regression); median survival 30d both legs
(all 8 fresh-band seeds survived to day 30 on both legs; diagnostic
61802 survived both legs); wave reach 1–3 both legs (panel, identical
per seed); vests 0 both legs (panel rows). Full seat 0 / wave 5 reached
0 stand as last measured (Loop A lane) — UNCHANGED in kind by this
instrument run.

## Village assessment (plain words)

Nothing about the village changed — this arm fixed a measuring stick,
not the village. But the measuring stick was lying in a specific, now
understandable way: when a scholar keeps trying a path the ground
itself won't let them take — three tries a day, day after day — the
old count wrote down "the guard wrongly stopped them" once per try,
even though the scholar never once stood where the guard stopped them
going. The new count only writes it down when the scholar actually
arrived there and the day still ended at home — that is, when the
guard really did cost them a trip that would have worked. On the two
bands measured here, that stricter count is zero: the guard, on these
seeds, never wrongly closed a real trip. The next guard prereg may now
quote the arrival-conditioned number without the asterisk.

## Metric review (never a re-score)

- The arrival definition proved sufficient on both corpora: the
  authoritative field (a) decided every new-driver entry, and the
  legacy fallback decided the predecessor corpus identically (61802:
  OLD 3 → NEW 0 under both). No seed required a fallback class to
  disagree with the field, because no new-driver entry needed a
  fallback at all — the field is present on every hop the new driver
  logs.
- Legacy fallback limitation, stated honestly for the next run: classes
  (b) and (c) prove the scholar was ON the destination tile that day,
  not that THIS hop carried them there (they could have arrived via a
  different hop, including an unlogged homeward hop). On legacy corpora
  a counted fallback entry is therefore "arrived that day," slightly
  weaker than the field's "arrived via this hop." No legacy entry was
  counted on either corpus in this run, so nothing here rests on the
  weaker reading — but a future legacy re-analysis that DOES count a
  fallback entry should say so in its evidence.
- Fallback class (d) (day-end-at-dest) is unreachable through the gated
  counter in practice: a vetoed hop's destination is never haven
  (homeward hops bypass the guard), while the day-end-home gate
  requires day-end == haven. It is kept in the analyzer as defense in
  depth and unit-tested directly, not deleted mid-run to pretty up the
  code. A future cleanup may drop it with a prereg note.
- Per-occurrence counting (3 vetoes = 3 entries) is retained from the
  old proxy so the two counts stay comparable. If a future prereg wants
  "distinct hops falsely closed" instead of "vetoed attempts falsely
  closed," that is a definition change for the NEXT prereg, not a
  reinterpretation of this run's 0.
- Panel compare refusal: no metric doubt — the comparator's
  matched-policy rule is by design, and the both-policy campaign is
  the valid §15 artifact, as in the predecessor runs.

## Sim-findings lines (reported to coordinator — NOT appended by this worker)

- [fixed] 2026-11-02 — measurement / false-close proxy — The exact-hop
  proxy over-counted engine-refused attempts (61802 day 14, 3 entries;
  fresh band 62205, 24 entries over days 23–30); the arrival-conditioned
  proxy (scripts/analyze-falseclose-b.js, `arrived` field on the
  ported policy's hop log) counts 0 on both, with every old entry
  classified as dropped for no-arrival-evidence (sim-falseclose-b
  evidence). The arrival-conditioned count may now be quoted as false
  closes; the old count must not.

## Infrastructure

- Proof test scripts/test-falseclose-b.js: 15/15 before the judged runs
  (fixture old-vs-new cases F1–F6, fake-game arrived semantics G1–G3);
  re-run green after the judged runs (D5).
- check.js --quick: 284 passed, 6 failed in 557s (first run 284/6 in
  444s). Causality proven per the predecessor's method: all 6 failing
  tests fail identically with this arm's files removed (policy, driver,
  analyzer, proof test deleted; sweep-compare.js reverted to HEAD):
  test-measurement-proof-update.js, test-measurement-workflow.js
  (retained neutrality proof vs current inputs), test-mobile-combat-
  cadence.js (Continue round-wrap), test-occupation-panels.js (CLI
  workflow), test-phone-frame-proof.js (retained browser-input hashes
  vs current index.html/data), test-establishment-r20-fixes-20261020.js
  (racks-full voice next-day gate). None touches travel, guard, or
  sweep-compare registration — pre-existing staleness on this base, not
  caused by this arm. No green-list change made for them (loosening an
  assertion to go green is forbidden; quarantining is the coordinator's
  call, not a worker's silent edit).
- Safe-commit index clobber hit both worker commits (prereg + build):
  main index showed committed files as deleted+untracked; repaired via
  HEAD-blob cacheinfo each time, commits verified correct, trees clean
  (repo AGENTS.md third-sighting pattern).
- Held branches untouched: sim-latescape-b read ONLY via `git show`
  (policy, driver, test, corpora, evidence); never checked out, never
  merged. Sibling loop A trees/branches untouched.
- Corpora: sim-falseclose-b-diag-{baseline,armed}.jsonl/.log (61802),
  sim-falseclose-b-band-{baseline,armed}.jsonl/.log (62201–62208),
  sim-falseclose-b-panel.json.gz, sim-falseclose-b-panel-compare.md/.json.

## Commits (branch sim-falseclose-b, NOT merged — coordinator merges)

- a00192eca sim-falseclose-b prereg (before any judged sim)
- 41713e944 sim-falseclose-b build (policy port + arrived field, driver,
  analyzer, proof 15/15)
- [evidence commit hash recorded by coordinator on merge; files listed
  under Infrastructure above, plus this file and the sweep-compare.js
  panel registration]
