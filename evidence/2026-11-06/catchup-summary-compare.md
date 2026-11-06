# catchup-summary-compare — before/after judgement (sim-catchup-summary-a)

Scope: FULL 31 seeds (15003, 15009, 15091, 15211, 15215, 15220, 15221, 17001, 17002, 17003, 17004, 17005, 17006, 17007, 17008, 17009, 17010, 17011, 17012, 17013, 17014, 17015, 17016, 17017, 17018, 17019, 17020, 17021, 17022, 17023, 17024). Before corpus: fresh pre-fix baseline (verbatim uncapped delivery) sim-catchup-summary-a-baseline. After corpus: summary delivery sim-catchup-summary-a-corpus.

## Verdict: GO

- (a) THE WALL — max single-day delivery (framing + summary lines in one loop-day), after: 3 lines (seed 15221, loop-day 37). Budget <= 3. Summary lines that failed to parse: 0. Internally inconsistent summary lines: 0. PASS
- Primary (c) — stranded sleep burst events, after: 0 in 18 windows (before: 0 in 18). Stranded settle lines, after: 0 (before: 0). Summary/framing lines said inside a stranded window, after: 0. PASS
- Guardrail (i) — NO SILENCING, ledger-based (re-registered per the 2115Z metric review): EFFECTIVE said_after == kicked, exact, per kind per seed (effective said = verbatim lines + summary counts). PASS — 0 lines silenced on all 31 seeds. Phase-shift report (descriptive only, no band): non-stranded sleep burst rate after 8.6% (150/1737) vs before (verbatim) 8.6% (150/1737).
- Guardrail (b)/(ii-a) — REVISED ledger conservation (after leg): effective said + stillHeld == kicked per kind per seed. PASS — 0 lines lost on all 31 seeds.
- Guardrail (ii-b) — held-volume accounting per away stretch (queue-snapshot method, preregistered — the cap-a Correction 1 method: held/delivered from live awayNaming queue snapshots; the queue still holds VERBATIM entries, summarization happens at delivery only; ledger (b) is the conservation judge; position-based held and DH-excess delivered retained as diagnostics). Lost == 0 on every stretch. PASS
- Guardrail (ii-c) — reconciliation: effective said_after − said_before == relayDropped + stillHeld_before − stillHeld_after per kind per seed (before leg is verbatim delivery, relayDropped expected 0). PASS
- Guardrail (iii-b) — trajectory identity before/after: all 31 seeds identical (daysAlive, endReason, stranded nights, stranded/non-stranded sleep windows). PASS
- Before-leg loss (ledger; verbatim delivery, expected 0): word 0 / debate 0 / settle 0 lines across 31 seeds.
- My-gate loss (after leg, revised ledger): word 0 / debate 0 / settle 0.
- Queue-snapshot notes (drain not snapshot-evidenced, or terminal-stretch/end-held mismatch): 0.
- Lines with unknown fire-time position (position-method diagnostic): 0.

## Per-seed table (after leg; b = before, a = after)

| seed | days | end | stranded nights | b stranded sleep w/e | a stranded sleep w/e | b stranded settle | a stranded settle | b non-stranded sleep w/e | a non-stranded sleep w/e | traj same | stranded-pos violations | stranded summaries | max delivery lines/day |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 15003 | 60 | survived | 0 | 0/0 | 0/0 | 0 | 0 | 60/3 | 60/3 | yes | 0 | 0 | 0 |
| 15009 | 60 | survived | 0 | 0/0 | 0/0 | 0 | 0 | 60/7 | 60/7 | yes | 0 | 0 | 0 |
| 15091 | 35 | village-lost | 0 | 0/0 | 0/0 | 0 | 0 | 35/6 | 35/6 | yes | 0 | 0 | 0 |
| 15211 | 60 | survived | 0 | 0/0 | 0/0 | 0 | 0 | 60/2 | 60/2 | yes | 0 | 0 | 0 |
| 15215 | 54 | village-lost | 0 | 0/0 | 0/0 | 0 | 0 | 54/4 | 54/4 | yes | 0 | 0 | 0 |
| 15220 | 60 | survived | 0 | 0/0 | 0/0 | 0 | 0 | 60/6 | 60/6 | yes | 0 | 0 | 0 |
| 15221 | 48 | village-lost | 5 | 5/0 | 5/0 | 0 | 0 | 42/1 | 42/1 | yes | 0 | 0 | 3 (day 37) |
| 17001 | 60 | survived | 0 | 0/0 | 0/0 | 0 | 0 | 60/7 | 60/7 | yes | 0 | 0 | 0 |
| 17002 | 60 | survived | 0 | 0/0 | 0/0 | 0 | 0 | 60/3 | 60/3 | yes | 0 | 0 | 0 |
| 17003 | 60 | survived | 0 | 0/0 | 0/0 | 0 | 0 | 60/7 | 60/7 | yes | 0 | 0 | 0 |
| 17004 | 60 | survived | 0 | 0/0 | 0/0 | 0 | 0 | 60/3 | 60/3 | yes | 0 | 0 | 0 |
| 17005 | 60 | survived | 0 | 0/0 | 0/0 | 0 | 0 | 60/3 | 60/3 | yes | 0 | 0 | 0 |
| 17006 | 60 | survived | 0 | 0/0 | 0/0 | 0 | 0 | 60/8 | 60/8 | yes | 0 | 0 | 0 |
| 17007 | 60 | survived | 3 | 3/0 | 3/0 | 0 | 0 | 57/6 | 57/6 | yes | 0 | 0 | 0 |
| 17008 | 60 | survived | 0 | 0/0 | 0/0 | 0 | 0 | 60/3 | 60/3 | yes | 0 | 0 | 0 |
| 17009 | 60 | survived | 0 | 0/0 | 0/0 | 0 | 0 | 60/4 | 60/4 | yes | 0 | 0 | 0 |
| 17010 | 60 | survived | 4 | 4/0 | 4/0 | 0 | 0 | 56/3 | 56/3 | yes | 0 | 0 | 3 (day 13) |
| 17011 | 60 | survived | 0 | 0/0 | 0/0 | 0 | 0 | 60/4 | 60/4 | yes | 0 | 0 | 0 |
| 17012 | 60 | survived | 0 | 0/0 | 0/0 | 0 | 0 | 60/5 | 60/5 | yes | 0 | 0 | 0 |
| 17013 | 60 | survived | 0 | 0/0 | 0/0 | 0 | 0 | 60/8 | 60/8 | yes | 0 | 0 | 0 |
| 17014 | 60 | survived | 0 | 0/0 | 0/0 | 0 | 0 | 60/5 | 60/5 | yes | 0 | 0 | 0 |
| 17015 | 31 | village-lost | 0 | 0/0 | 0/0 | 0 | 0 | 31/3 | 31/3 | yes | 0 | 0 | 0 |
| 17016 | 60 | survived | 2 | 2/0 | 2/0 | 0 | 0 | 58/5 | 58/5 | yes | 0 | 0 | 3 (day 13) |
| 17017 | 60 | survived | 0 | 0/0 | 0/0 | 0 | 0 | 60/6 | 60/6 | yes | 0 | 0 | 0 |
| 17018 | 60 | survived | 0 | 0/0 | 0/0 | 0 | 0 | 60/5 | 60/5 | yes | 0 | 0 | 0 |
| 17019 | 36 | village-lost | 0 | 0/0 | 0/0 | 0 | 0 | 36/2 | 36/2 | yes | 0 | 0 | 0 |
| 17020 | 60 | survived | 3 | 3/0 | 3/0 | 0 | 0 | 57/5 | 57/5 | yes | 0 | 0 | 3 (day 10) |
| 17021 | 52 | village-lost | 0 | 0/0 | 0/0 | 0 | 0 | 52/6 | 52/6 | yes | 0 | 0 | 0 |
| 17022 | 60 | survived | 0 | 0/0 | 0/0 | 0 | 0 | 60/6 | 60/6 | yes | 0 | 0 | 0 |
| 17023 | 60 | survived | 0 | 0/0 | 0/0 | 0 | 0 | 60/9 | 60/9 | yes | 0 | 0 | 2 (day 11) |
| 17024 | 60 | survived | 1 | 1/0 | 1/0 | 0 | 0 | 59/5 | 59/5 | yes | 0 | 0 | 2 (day 48) |

## Delivery (wall) per seed — (a): framing + summary lines per loop-day; budget <= 3

| seed | returns with delivery | max lines in one day | worst day | framing lines | burst summaries | settle summaries | summary counts w/d/s |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 15003 | 0 | 0 | — | 0 | 0 | 0 | 0/0/0 |
| 15009 | 0 | 0 | — | 0 | 0 | 0 | 0/0/0 |
| 15091 | 0 | 0 | — | 0 | 0 | 0 | 0/0/0 |
| 15211 | 0 | 0 | — | 0 | 0 | 0 | 0/0/0 |
| 15215 | 0 | 0 | — | 0 | 0 | 0 | 0/0/0 |
| 15220 | 0 | 0 | — | 0 | 0 | 0 | 0/0/0 |
| 15221 | 2 | 3 | 37 | 2 | 2 | 1 | 4/4/1 |
| 17001 | 0 | 0 | — | 0 | 0 | 0 | 0/0/0 |
| 17002 | 0 | 0 | — | 0 | 0 | 0 | 0/0/0 |
| 17003 | 0 | 0 | — | 0 | 0 | 0 | 0/0/0 |
| 17004 | 0 | 0 | — | 0 | 0 | 0 | 0/0/0 |
| 17005 | 0 | 0 | — | 0 | 0 | 0 | 0/0/0 |
| 17006 | 0 | 0 | — | 0 | 0 | 0 | 0/0/0 |
| 17007 | 0 | 0 | — | 0 | 0 | 0 | 0/0/0 |
| 17008 | 0 | 0 | — | 0 | 0 | 0 | 0/0/0 |
| 17009 | 0 | 0 | — | 0 | 0 | 0 | 0/0/0 |
| 17010 | 1 | 3 | 13 | 1 | 1 | 1 | 4/4/5 |
| 17011 | 0 | 0 | — | 0 | 0 | 0 | 0/0/0 |
| 17012 | 0 | 0 | — | 0 | 0 | 0 | 0/0/0 |
| 17013 | 0 | 0 | — | 0 | 0 | 0 | 0/0/0 |
| 17014 | 0 | 0 | — | 0 | 0 | 0 | 0/0/0 |
| 17015 | 0 | 0 | — | 0 | 0 | 0 | 0/0/0 |
| 17016 | 1 | 3 | 13 | 1 | 1 | 1 | 3/3/1 |
| 17017 | 0 | 0 | — | 0 | 0 | 0 | 0/0/0 |
| 17018 | 0 | 0 | — | 0 | 0 | 0 | 0/0/0 |
| 17019 | 0 | 0 | — | 0 | 0 | 0 | 0/0/0 |
| 17020 | 1 | 3 | 10 | 1 | 1 | 1 | 1/1/2 |
| 17021 | 0 | 0 | — | 0 | 0 | 0 | 0/0/0 |
| 17022 | 0 | 0 | — | 0 | 0 | 0 | 0/0/0 |
| 17023 | 1 | 2 | 11 | 1 | 1 | 0 | 1/1/0 |
| 17024 | 1 | 2 | 48 | 1 | 1 | 0 | 1/1/0 |

## Summaries delivered, quoted (sense-test pool, prereg (e))

Every framing/burst-summary/settle-summary line said on the after leg, in transcript order per seed. sA in the ledger table is EFFECTIVE said (verbatim lines + these summary counts).

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

### Seed 17001 — no summaries delivered

### Seed 17002 — no summaries delivered

### Seed 17003 — no summaries delivered

### Seed 17004 — no summaries delivered

### Seed 17005 — no summaries delivered

### Seed 17006 — no summaries delivered

### Seed 17007 — no summaries delivered

### Seed 17008 — no summaries delivered

### Seed 17009 — no summaries delivered

### Seed 17010 (3 delivery lines)

- day 13 (daily, framing): While you were away, the haven argued over what to call it — they catch you up at the fire:
- day 13 (daily, burst): They argued over names for 4 beasts — 4 words, 4 debates: "The Loud Beast" (2), "Old Ugly" (2), "Judge Hoot" (2), "The Big Beast" (2).
- day 13 (daily, settle): They settled names for 5 beasts: "The Loud Beast", "Old Ugly", "Judge Hoot", "Big-Eyes", "Ugly-Eyes".

### Seed 17011 — no summaries delivered

### Seed 17012 — no summaries delivered

### Seed 17013 — no summaries delivered

### Seed 17014 — no summaries delivered

### Seed 17015 — no summaries delivered

### Seed 17016 (3 delivery lines)

- day 13 (daily, framing): While you were away, the haven argued over what to call it — they catch you up at the fire:
- day 13 (daily, burst): They argued over names for 3 beasts — 3 words, 3 debates: "Mister Never" (2), "The Loud Stare" (2), "The Big Beast" (2).
- day 13 (daily, settle): They settled names for 1 beast: "Big Loud".

### Seed 17017 — no summaries delivered

### Seed 17018 — no summaries delivered

### Seed 17019 — no summaries delivered

### Seed 17020 (3 delivery lines)

- day 10 (daily, framing): While you were away, the haven argued over what to call it — they catch you up at the fire:
- day 10 (daily, burst): They argued over names for 1 beast — 1 word, 1 debate: "The Loud Beast" (2).
- day 10 (daily, settle): They settled names for 2 beasts: "Big Big", "The Loud Beast".

### Seed 17021 — no summaries delivered

### Seed 17022 — no summaries delivered

### Seed 17023 (2 delivery lines)

- day 11 (daily, framing): While you were away, the haven argued over what to call it — they catch you up at the fire:
- day 11 (daily, burst): They argued over names for 1 beast — 1 word, 1 debate: "Ugly-Eyes" (2).

### Seed 17024 (2 delivery lines)

- day 48 (daily, framing): While you were away, the haven argued over what to call it — they catch you up at the fire:
- day 48 (daily, burst): They argued over names for 1 beast — 1 word, 1 debate: "The Big Beast" (2).

## Ledger per seed (k = kicked, sB = said before (verbatim), sA = EFFECTIVE said after (verbatim + summary counts), hB/hA = still-held before/after, rD = before-leg dropped (expected 0), mL = my-gate lost)

| seed | word k/sB/sA/hB/hA/rD/mL | debate k/sB/sA/hB/hA/rD/mL | settle k/sB/sA/hB/hA/rD/mL |
| --- | --- | --- | --- |
| 15003 | 15/15/15/0/0/0/0 | 15/15/15/0/0/0/0 | 13/13/13/0/0/0/0 |
| 15009 | 25/25/25/0/0/0/0 | 25/25/25/0/0/0/0 | 23/23/23/0/0/0/0 |
| 15091 | 16/16/16/0/0/0/0 | 16/16/16/0/0/0/0 | 15/15/15/0/0/0/0 |
| 15211 | 23/23/23/0/0/0/0 | 23/23/23/0/0/0/0 | 23/23/23/0/0/0/0 |
| 15215 | 15/15/15/0/0/0/0 | 15/15/15/0/0/0/0 | 14/14/14/0/0/0/0 |
| 15220 | 22/22/22/0/0/0/0 | 22/22/22/0/0/0/0 | 22/22/22/0/0/0/0 |
| 15221 | 30/30/30/0/0/0/0 | 30/30/30/0/0/0/0 | 30/30/30/0/0/0/0 |
| 17001 | 24/24/24/0/0/0/0 | 24/24/24/0/0/0/0 | 24/24/24/0/0/0/0 |
| 17002 | 17/17/17/0/0/0/0 | 17/17/17/0/0/0/0 | 17/17/17/0/0/0/0 |
| 17003 | 28/28/28/0/0/0/0 | 28/28/28/0/0/0/0 | 28/28/28/0/0/0/0 |
| 17004 | 21/21/21/0/0/0/0 | 21/21/21/0/0/0/0 | 20/20/20/0/0/0/0 |
| 17005 | 26/26/26/0/0/0/0 | 26/26/26/0/0/0/0 | 26/26/26/0/0/0/0 |
| 17006 | 26/26/26/0/0/0/0 | 26/26/26/0/0/0/0 | 26/26/26/0/0/0/0 |
| 17007 | 23/23/23/0/0/0/0 | 23/23/23/0/0/0/0 | 23/23/23/0/0/0/0 |
| 17008 | 23/23/23/0/0/0/0 | 23/23/23/0/0/0/0 | 23/23/23/0/0/0/0 |
| 17009 | 23/23/23/0/0/0/0 | 23/23/23/0/0/0/0 | 23/23/23/0/0/0/0 |
| 17010 | 33/33/33/0/0/0/0 | 33/33/33/0/0/0/0 | 33/33/33/0/0/0/0 |
| 17011 | 13/13/13/0/0/0/0 | 13/13/13/0/0/0/0 | 11/11/11/0/0/0/0 |
| 17012 | 26/26/26/0/0/0/0 | 26/26/26/0/0/0/0 | 26/26/26/0/0/0/0 |
| 17013 | 19/19/19/0/0/0/0 | 19/19/19/0/0/0/0 | 19/19/19/0/0/0/0 |
| 17014 | 29/29/29/0/0/0/0 | 29/29/29/0/0/0/0 | 29/29/29/0/0/0/0 |
| 17015 | 8/8/8/0/0/0/0 | 8/8/8/0/0/0/0 | 8/8/8/0/0/0/0 |
| 17016 | 33/33/33/0/0/0/0 | 33/33/33/0/0/0/0 | 33/33/33/0/0/0/0 |
| 17017 | 30/30/30/0/0/0/0 | 30/30/30/0/0/0/0 | 29/29/29/0/0/0/0 |
| 17018 | 26/26/26/0/0/0/0 | 26/26/26/0/0/0/0 | 24/24/24/0/0/0/0 |
| 17019 | 15/15/15/0/0/0/0 | 15/15/15/0/0/0/0 | 15/15/15/0/0/0/0 |
| 17020 | 29/29/29/0/0/0/0 | 29/29/29/0/0/0/0 | 29/29/29/0/0/0/0 |
| 17021 | 19/19/19/0/0/0/0 | 19/19/19/0/0/0/0 | 18/18/18/0/0/0/0 |
| 17022 | 25/25/25/0/0/0/0 | 25/25/25/0/0/0/0 | 24/24/24/0/0/0/0 |
| 17023 | 32/32/32/0/0/0/0 | 32/32/32/0/0/0/0 | 32/32/32/0/0/0/0 |
| 17024 | 31/31/31/0/0/0/0 | 31/31/31/0/0/0/0 | 30/30/30/0/0/0/0 |

## Held-volume accounting per away stretch (CORRECTED method, prereg Correction 1: held = after-leg awayNaming queue depth at the last evening of the stretch + mid-stretch drops; delivered = held for returned stretches (full drain at the return, unit-proven), = mid-stretch drops for terminal stretches; lost = held − delivered. posHeld = superseded position-method diagnostic (expected ~0 on the verbatim-gate substrate); dhExcess = superseded DH-excess diagnostic (expected to undercount). qMax/qEnd = after-leg queue snapshots; morningR/eveningR = queue depth at the return day's morning/evening snapshots — the drain evidence.)

| seed | stretch days | return day | held (q) | delivered (q) | lost | qMax | qEnd | mid-stretch drops | morningR | eveningR | drain evidenced | posHeld w/d/s | dhExcess w/d/s | unknown pos |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 15003 | 55 | 56 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | yes | 0/0/0 | 0/0/0 | 0 |
| 15009 | 57 | 58 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | yes | 0/0/0 | 0/0/0 | 0 |
| 15220 | 53 | 54 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | yes | 0/0/0 | 0/0/0 | 0 |
| 15221 | 32,33,34,35,36 | 37 | 7 | 7 | 0 | 7 | 7 | 0 | 7 | 0 | yes | 0/0/0 | -3/-3/-1 | 0 |
| 17001 | 60 | TERMINAL | 0 | 0 | 0 | 0 | 0 | 0 | — | — | — | 0/0/0 | 0/0/0 | 0 |
| 17007 | 5,6,7 | 8 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | yes | 0/0/0 | 0/0/0 | 0 |
| 17007 | 39,40 | 41 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | yes | 0/0/0 | 0/0/0 | 0 |
| 17009 | 51 | 52 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | yes | 0/0/0 | 0/0/0 | 0 |
| 17010 | 9,10,11,12 | 13 | 12 | 12 | 0 | 12 | 12 | 0 | 13 | 0 | yes | 4/4/5 | -4/-4/-5 | 0 |
| 17012 | 43 | 44 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | yes | 0/0/0 | 0/0/0 | 0 |
| 17014 | 34 | 35 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | yes | 0/0/1 | 0/0/0 | 0 |
| 17016 | 11,12 | 13 | 4 | 4 | 0 | 4 | 4 | 0 | 7 | 0 | yes | 3/3/1 | -3/-3/-1 | 0 |
| 17016 | 49 | 50 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | yes | 0/0/0 | 0/0/0 | 0 |
| 17016 | 55 | 56 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | yes | 0/0/0 | 0/0/0 | 0 |
| 17020 | 7,8,9 | 10 | 2 | 2 | 0 | 2 | 2 | 0 | 4 | 0 | yes | 1/1/2 | -1/-1/-2 | 0 |
| 17020 | 60 | TERMINAL | 0 | 0 | 0 | 0 | 0 | 0 | — | — | — | 0/0/0 | 0/0/0 | 0 |
| 17021 | 46 | 47 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | yes | 0/0/0 | 0/0/0 | 0 |
| 17021 | 52 | TERMINAL | 0 | 0 | 0 | 0 | 0 | 0 | — | — | — | 0/0/0 | 0/0/0 | 0 |
| 17023 | 47 | 48 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | yes | 0/0/0 | 0/0/0 | 0 |
| 17024 | 36 | 37 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | yes | 1/1/0 | 0/0/0 | 0 |
| 17024 | 46,47 | 48 | 0 | 0 | 0 | 0 | 0 | 0 | 2 | 0 | yes | 0/0/0 | -1/-1/0 | 0 |

## Metric binding

Judged strictly against evidence/2026-11-06/sim-catchup-summary-a-prereg.md. A miss is NO-GO, never re-scored.
