# sim-53007-bisect-b — Amendment 1 (written BEFORE any judged corpus exists)

**Date:** 2026-11-09 ~04:30Z. **Status of the arm when written:** prereg committed (`35af82042`); no judged corpus has been written — the current-master re-verification sim ran three times but every corpus write was refused by the write flap (0-byte files removed, nothing committed), and the midpoint extraction failed the same way. No headline has been judged. Nothing in the prereg's bars has been judged yet.

## Finding — G2 as written conflates recorder neutrality with master movement

The prereg's G2 compares the armed re-verification corpus against the committed 53007-a corpus for 53007. But master moved between 53007-a (`6680d7924`) and this arm (`55b5e5aae`) — the fightblend landing moved fieldFights.js. If the armed re-verification differs from the committed corpus, the prereg's G2 cannot tell whether the recorder moved it or the master moved it. A neutrality proof must compare armed vs unrecorded on the SAME master/tree.

**G2 revised (binding):** for every run in this arm (current-master re-verification + each midpoint run), an unrecorded control runs on the same tree (`DIAG_RECORDER=0`, same seed, same leg, same horizon) and `neutralityCompare` must PASS armed vs unrecorded. Unrecorded controls live in `evidence/2026-11-08/perseed-53007-bisect-b-unrec/` under the same RUN name as their armed twin. The armed-vs-committed-53007-a comparison is retained as the endpoint-stability check under GO bar 1 (headline only: 150d + sit d95 + standing ≥ 500), not as the neutrality proof.

## Finding — RUN naming must carry the midpoint SHA, and the proof must read files by path

The bisect corpus dir will hold several files with seed 53007 (re-verification + one or two midpoints). The analyzer's `loadDir` keys by seed and would collide. **RUN names (binding):** current-master re-verification keeps `RUN=doorwalk-baseline` (matching 53007-a naming); medic-duty midpoint uses `RUN=medic-b74dc3007`; double-night midpoint uses `RUN=doublenight-ff252c1ac`. The proof test reads corpora by explicit file path, never `loadDir`, for the bisect dirs; legs for the second midpoint SKIP when its files are absent (the stop rule may never run it).

## What does NOT change

- Substrate, seeds, horizon, policy, recorder, classification rule, GO bar, stop rule, G1/G3 bars, DIAG-only, no game-code change.
- Flap note: the flap is ACTIVE at amendment time (probe fails, corpus writes EPERM, tar extraction EPERM). All git writes remain probe-gated; no write is forced.
