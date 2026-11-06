# catchup-summary-compare — before/after judgement (sim-catchup-summary-a)

Scope: PILOT 8 seeds (17021, 15003, 15009, 15091, 15211, 15215, 15220, 15221). Before corpus: fresh pre-fix baseline (verbatim uncapped delivery) sim-catchup-summary-a-baseline. After corpus: summary delivery sim-catchup-summary-a-corpus.

## Verdict: GO

- (a) THE WALL — max single-day delivery (framing + summary lines in one loop-day), after: 3 lines (seed 15221, loop-day 37). Budget <= 3. Summary lines that failed to parse: 0. Internally inconsistent summary lines: 0. PASS
- Primary (c) — stranded sleep burst events, after: 0 in 5 windows (before: 0 in 5). Stranded settle lines, after: 0 (before: 0). Summary/framing lines said inside a stranded window, after: 0. PASS
- Guardrail (i) — NO SILENCING, ledger-based (re-registered per the 2115Z metric review): EFFECTIVE said_after == kicked, exact, per kind per seed (effective said = verbatim lines + summary counts). PASS — 0 lines silenced on all 8 seeds. Phase-shift report (descriptive only, no band): non-stranded sleep burst rate after 8.3% (35/423) vs before (verbatim) 8.3% (35/423).
- Guardrail (b)/(ii-a) — REVISED ledger conservation (after leg): effective said + stillHeld == kicked per kind per seed. PASS — 0 lines lost on all 8 seeds.
- Guardrail (ii-b) — held-volume accounting per away stretch (queue-snapshot method, preregistered — the cap-a Correction 1 method: held/delivered from live awayNaming queue snapshots; the queue still holds VERBATIM entries, summarization happens at delivery only; ledger (b) is the conservation judge; position-based held and DH-excess delivered retained as diagnostics). Lost == 0 on every stretch. PASS
- Guardrail (ii-c) — reconciliation: effective said_after − said_before == relayDropped + stillHeld_before − stillHeld_after per kind per seed (before leg is verbatim delivery, relayDropped expected 0). PASS
- Guardrail (iii-b) — trajectory identity before/after: all 8 seeds identical (daysAlive, endReason, stranded nights, stranded/non-stranded sleep windows). PASS
- Before-leg loss (ledger; verbatim delivery, expected 0): word 0 / debate 0 / settle 0 lines across 8 seeds.
- My-gate loss (after leg, revised ledger): word 0 / debate 0 / settle 0.
- Queue-snapshot notes (drain not snapshot-evidenced, or terminal-stretch/end-held mismatch): 0.
- Lines with unknown fire-time position (position-method diagnostic): 0.

## Per-seed table (after leg; b = before, a = after)

| seed | days | end | stranded nights | b stranded sleep w/e | a stranded sleep w/e | b stranded settle | a stranded settle | b non-stranded sleep w/e | a non-stranded sleep w/e | traj same | stranded-pos violations | stranded summaries | max delivery lines/day |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 17021 | 52 | village-lost | 0 | 0/0 | 0/0 | 0 | 0 | 52/6 | 52/6 | yes | 0 | 0 | 0 |
| 15003 | 60 | survived | 0 | 0/0 | 0/0 | 0 | 0 | 60/3 | 60/3 | yes | 0 | 0 | 0 |
| 15009 | 60 | survived | 0 | 0/0 | 0/0 | 0 | 0 | 60/7 | 60/7 | yes | 0 | 0 | 0 |
| 15091 | 35 | village-lost | 0 | 0/0 | 0/0 | 0 | 0 | 35/6 | 35/6 | yes | 0 | 0 | 0 |
| 15211 | 60 | survived | 0 | 0/0 | 0/0 | 0 | 0 | 60/2 | 60/2 | yes | 0 | 0 | 0 |
| 15215 | 54 | village-lost | 0 | 0/0 | 0/0 | 0 | 0 | 54/4 | 54/4 | yes | 0 | 0 | 0 |
| 15220 | 60 | survived | 0 | 0/0 | 0/0 | 0 | 0 | 60/6 | 60/6 | yes | 0 | 0 | 0 |
| 15221 | 48 | village-lost | 5 | 5/0 | 5/0 | 0 | 0 | 42/1 | 42/1 | yes | 0 | 0 | 3 (day 37) |

## Delivery (wall) per seed — (a): framing + summary lines per loop-day; budget <= 3

| seed | returns with delivery | max lines in one day | worst day | framing lines | burst summaries | settle summaries | summary counts w/d/s |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 17021 | 0 | 0 | — | 0 | 0 | 0 | 0/0/0 |
| 15003 | 0 | 0 | — | 0 | 0 | 0 | 0/0/0 |
| 15009 | 0 | 0 | — | 0 | 0 | 0 | 0/0/0 |
| 15091 | 0 | 0 | — | 0 | 0 | 0 | 0/0/0 |
| 15211 | 0 | 0 | — | 0 | 0 | 0 | 0/0/0 |
| 15215 | 0 | 0 | — | 0 | 0 | 0 | 0/0/0 |
| 15220 | 0 | 0 | — | 0 | 0 | 0 | 0/0/0 |
| 15221 | 2 | 3 | 37 | 2 | 2 | 1 | 4/4/1 |

## Summaries delivered, quoted (sense-test pool, prereg (e))

Every framing/burst-summary/settle-summary line said on the after leg, in transcript order per seed. sA in the ledger table is EFFECTIVE said (verbatim lines + these summary counts).

### Seed 17021 — no summaries delivered

### Seed 15003 — no summaries delivered

### Seed 15009 — no summaries delivered

### Seed 15091 — no summaries delivered

### Seed 15211 — no summaries delivered

### Seed 15215 — no summaries delivered

### Seed 15220 — no summaries delivered

### Seed 15221 (5 delivery lines)

- day 30 (daily, framing): While you were away, the haven argued over what to call it — they catch you up at the fire:
- day 30 (daily, burst): They argued over names for 1 beast — 1 word, 1 debate: "Big Big" (2).
- day 37 (daily, framing): While you were away, the haven argued over what to call it — they catch you up at the fire:
- day 37 (daily, burst): They argued over names for 3 beasts — 3 words, 3 debates: "The Big Beast" (2), "Loud-Eyes" (2), "Big Ugly" (2).
- day 37 (daily, settle): They settled names for 1 beast: "Big Big".

## Ledger per seed (k = kicked, sB = said before (verbatim), sA = EFFECTIVE said after (verbatim + summary counts), hB/hA = still-held before/after, rD = before-leg dropped (expected 0), mL = my-gate lost)

| seed | word k/sB/sA/hB/hA/rD/mL | debate k/sB/sA/hB/hA/rD/mL | settle k/sB/sA/hB/hA/rD/mL |
| --- | --- | --- | --- |
| 17021 | 19/19/19/0/0/0/0 | 19/19/19/0/0/0/0 | 18/18/18/0/0/0/0 |
| 15003 | 15/15/15/0/0/0/0 | 15/15/15/0/0/0/0 | 13/13/13/0/0/0/0 |
| 15009 | 25/25/25/0/0/0/0 | 25/25/25/0/0/0/0 | 23/23/23/0/0/0/0 |
| 15091 | 16/16/16/0/0/0/0 | 16/16/16/0/0/0/0 | 15/15/15/0/0/0/0 |
| 15211 | 23/23/23/0/0/0/0 | 23/23/23/0/0/0/0 | 23/23/23/0/0/0/0 |
| 15215 | 15/15/15/0/0/0/0 | 15/15/15/0/0/0/0 | 14/14/14/0/0/0/0 |
| 15220 | 22/22/22/0/0/0/0 | 22/22/22/0/0/0/0 | 22/22/22/0/0/0/0 |
| 15221 | 30/30/30/0/0/0/0 | 30/30/30/0/0/0/0 | 30/30/30/0/0/0/0 |

## Held-volume accounting per away stretch (CORRECTED method, prereg Correction 1: held = after-leg awayNaming queue depth at the last evening of the stretch + mid-stretch drops; delivered = held for returned stretches (full drain at the return, unit-proven), = mid-stretch drops for terminal stretches; lost = held − delivered. posHeld = superseded position-method diagnostic (expected ~0 on the verbatim-gate substrate); dhExcess = superseded DH-excess diagnostic (expected to undercount). qMax/qEnd = after-leg queue snapshots; morningR/eveningR = queue depth at the return day's morning/evening snapshots — the drain evidence.)

| seed | stretch days | return day | held (q) | delivered (q) | lost | qMax | qEnd | mid-stretch drops | morningR | eveningR | drain evidenced | posHeld w/d/s | dhExcess w/d/s | unknown pos |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 17021 | 46 | 47 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | yes | 0/0/0 | 0/0/0 | 0 |
| 17021 | 52 | TERMINAL | 0 | 0 | 0 | 0 | 0 | 0 | — | — | — | 0/0/0 | 0/0/0 | 0 |
| 15003 | 55 | 56 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | yes | 0/0/0 | 0/0/0 | 0 |
| 15009 | 57 | 58 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | yes | 0/0/0 | 0/0/0 | 0 |
| 15220 | 53 | 54 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | yes | 0/0/0 | 0/0/0 | 0 |
| 15221 | 32,33,34,35,36 | 37 | 7 | 7 | 0 | 7 | 7 | 0 | 7 | 0 | yes | 0/0/0 | -3/-3/-1 | 0 |

## Metric binding

Judged strictly against evidence/2026-11-06/sim-catchup-summary-a-prereg.md. A miss is NO-GO, never re-scored.
