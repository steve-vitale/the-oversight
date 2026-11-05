# awaynaming-rereg-compare — before/after judgement (sim-awaynaming-rereg-a)

Scope: FULL 31 seeds (15003, 15009, 15091, 15211, 15215, 15220, 15221, 17001, 17002, 17003, 17004, 17005, 17006, 17007, 17008, 17009, 17010, 17011, 17012, 17013, 17014, 17015, 17016, 17017, 17018, 17019, 17020, 17021, 17022, 17023, 17024). Before corpus: fresh pre-fix baseline (r141 relay behavior) sim-awaynaming-rereg-a-baseline. After corpus: uncapped awayNaming gate sim-awaynaming-rereg-a-corpus.

## Verdict: GO

- Primary — stranded sleep burst events, after: 0 in 17 windows (before: 0 in 17). Stranded settle lines, after: 0 (before: 0). PASS
- Guardrail (i) — NO SILENCING, ledger-based (re-registered per the 2115Z metric review): said_after == kicked, exact, per kind per seed. PASS — 0 lines silenced on all 31 seeds. Phase-shift report (descriptive only, no band): non-stranded sleep burst rate after 7.9% (140/1767) vs before (relay) 11.6% (205/1767).
- Guardrail (ii-a) — ledger conservation (after leg): said + stillHeld == kicked per kind per seed. PASS — 0 lines lost on all 31 seeds.
- Guardrail (ii-b) — held-volume accounting per away stretch (queue-snapshot method, preregistered — the cap-a Correction 1 method: held/delivered from live awayNaming queue snapshots; ledger (ii-a) is the conservation judge; position-based held and DH-excess delivered retained as diagnostics). Lost == 0 on every stretch. PASS
- Guardrail (ii-c) — reconciliation: said_after − said_before == relayDropped + stillHeld_before − stillHeld_after per kind per seed. PASS
- Guardrail (iii-b) — trajectory identity before/after: all 31 seeds identical (daysAlive, endReason, stranded nights, stranded/non-stranded sleep windows). PASS
- Relay measured loss (before leg, ledger): word 4 / debate 4 / settle 0 lines dropped by the r141 relay (20-cap + flush filters) across 31 seeds — recovered by the uncapped gate iff (ii-a) passes.
- My-gate loss (after leg, ledger): word 0 / debate 0 / settle 0.
- Queue-snapshot notes (drain not snapshot-evidenced, or terminal-stretch/end-held mismatch): 0.
- Lines with unknown fire-time position (position-method diagnostic): 0.

## Per-seed table (after leg; b = before, a = after)

| seed | days | end | stranded nights | b stranded sleep w/e | a stranded sleep w/e | b stranded settle | a stranded settle | b non-stranded sleep w/e | a non-stranded sleep w/e | traj same | stranded-pos violations |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 15003 | 60 | survived | 0 | 0/0 | 0/0 | 0 | 0 | 60/4 | 60/3 | yes | 0 |
| 15009 | 60 | survived | 0 | 0/0 | 0/0 | 0 | 0 | 60/7 | 60/7 | yes | 0 |
| 15091 | 56 | village-lost | 0 | 0/0 | 0/0 | 0 | 0 | 56/8 | 56/6 | yes | 0 |
| 15211 | 60 | survived | 0 | 0/0 | 0/0 | 0 | 0 | 60/3 | 60/2 | yes | 0 |
| 15215 | 54 | village-lost | 0 | 0/0 | 0/0 | 0 | 0 | 54/5 | 54/4 | yes | 0 |
| 15220 | 60 | survived | 0 | 0/0 | 0/0 | 0 | 0 | 60/7 | 60/6 | yes | 0 |
| 15221 | 48 | village-lost | 5 | 5/0 | 5/0 | 0 | 0 | 42/5 | 42/1 | yes | 0 |
| 17001 | 60 | survived | 0 | 0/0 | 0/0 | 0 | 0 | 60/7 | 60/7 | yes | 0 |
| 17002 | 60 | survived | 0 | 0/0 | 0/0 | 0 | 0 | 60/7 | 60/5 | yes | 0 |
| 17003 | 60 | survived | 0 | 0/0 | 0/0 | 0 | 0 | 60/10 | 60/6 | yes | 0 |
| 17004 | 60 | survived | 0 | 0/0 | 0/0 | 0 | 0 | 60/6 | 60/3 | yes | 0 |
| 17005 | 60 | survived | 0 | 0/0 | 0/0 | 0 | 0 | 60/7 | 60/3 | yes | 0 |
| 17006 | 60 | survived | 0 | 0/0 | 0/0 | 0 | 0 | 60/8 | 60/8 | yes | 0 |
| 17007 | 60 | survived | 3 | 3/0 | 3/0 | 0 | 0 | 57/9 | 57/7 | yes | 0 |
| 17008 | 60 | survived | 0 | 0/0 | 0/0 | 0 | 0 | 60/5 | 60/1 | yes | 0 |
| 17009 | 60 | survived | 0 | 0/0 | 0/0 | 0 | 0 | 60/8 | 60/4 | yes | 0 |
| 17010 | 60 | survived | 4 | 4/0 | 4/0 | 0 | 0 | 56/6 | 56/2 | yes | 0 |
| 17011 | 60 | survived | 0 | 0/0 | 0/0 | 0 | 0 | 60/6 | 60/4 | yes | 0 |
| 17012 | 60 | survived | 0 | 0/0 | 0/0 | 0 | 0 | 60/5 | 60/5 | yes | 0 |
| 17013 | 60 | survived | 0 | 0/0 | 0/0 | 0 | 0 | 60/9 | 60/8 | yes | 0 |
| 17014 | 60 | survived | 0 | 0/0 | 0/0 | 0 | 0 | 60/5 | 60/4 | yes | 0 |
| 17015 | 31 | village-lost | 0 | 0/0 | 0/0 | 0 | 0 | 31/4 | 31/3 | yes | 0 |
| 17016 | 60 | survived | 2 | 2/0 | 2/0 | 0 | 0 | 58/4 | 58/1 | yes | 0 |
| 17017 | 60 | survived | 0 | 0/0 | 0/0 | 0 | 0 | 60/8 | 60/4 | yes | 0 |
| 17018 | 60 | survived | 0 | 0/0 | 0/0 | 0 | 0 | 60/8 | 60/5 | yes | 0 |
| 17019 | 36 | village-lost | 0 | 0/0 | 0/0 | 0 | 0 | 36/3 | 36/2 | yes | 0 |
| 17020 | 60 | survived | 3 | 3/0 | 3/0 | 0 | 0 | 57/6 | 57/5 | yes | 0 |
| 17021 | 60 | survived | 0 | 0/0 | 0/0 | 0 | 0 | 60/9 | 60/6 | yes | 0 |
| 17022 | 60 | survived | 0 | 0/0 | 0/0 | 0 | 0 | 60/5 | 60/4 | yes | 0 |
| 17023 | 60 | survived | 0 | 0/0 | 0/0 | 0 | 0 | 60/14 | 60/9 | yes | 0 |
| 17024 | 60 | survived | 0 | 0/0 | 0/0 | 0 | 0 | 60/7 | 60/5 | yes | 0 |

## Ledger per seed (k = kicked, sB/sA = said before/after, hB/hA = still-held before/after, rD = relay dropped, mL = my-gate lost)

| seed | word k/sB/sA/hB/hA/rD/mL | debate k/sB/sA/hB/hA/rD/mL | settle k/sB/sA/hB/hA/rD/mL |
| --- | --- | --- | --- |
| 15003 | 15/15/15/0/0/0/0 | 15/15/15/0/0/0/0 | 13/13/13/0/0/0/0 |
| 15009 | 25/25/25/0/0/0/0 | 25/25/25/0/0/0/0 | 23/23/23/0/0/0/0 |
| 15091 | 22/22/22/0/0/0/0 | 22/22/22/0/0/0/0 | 21/21/21/0/0/0/0 |
| 15211 | 23/23/23/0/0/0/0 | 23/23/23/0/0/0/0 | 23/23/23/0/0/0/0 |
| 15215 | 15/15/15/0/0/0/0 | 15/15/15/0/0/0/0 | 14/14/14/0/0/0/0 |
| 15220 | 22/22/22/0/0/0/0 | 22/22/22/0/0/0/0 | 22/22/22/0/0/0/0 |
| 15221 | 30/30/30/0/0/0/0 | 30/30/30/0/0/0/0 | 30/30/30/0/0/0/0 |
| 17001 | 25/25/25/0/0/0/0 | 25/25/25/0/0/0/0 | 24/24/24/0/0/0/0 |
| 17002 | 16/16/16/0/0/0/0 | 16/16/16/0/0/0/0 | 16/16/16/0/0/0/0 |
| 17003 | 25/25/25/0/0/0/0 | 25/25/25/0/0/0/0 | 25/25/25/0/0/0/0 |
| 17004 | 21/21/21/0/0/0/0 | 21/21/21/0/0/0/0 | 20/20/20/0/0/0/0 |
| 17005 | 29/29/29/0/0/0/0 | 29/29/29/0/0/0/0 | 29/29/29/0/0/0/0 |
| 17006 | 26/26/26/0/0/0/0 | 26/26/26/0/0/0/0 | 26/26/26/0/0/0/0 |
| 17007 | 24/24/24/0/0/0/0 | 24/24/24/0/0/0/0 | 22/22/22/0/0/0/0 |
| 17008 | 24/24/24/0/0/0/0 | 24/24/24/0/0/0/0 | 24/24/24/0/0/0/0 |
| 17009 | 23/23/23/0/0/0/0 | 23/23/23/0/0/0/0 | 23/23/23/0/0/0/0 |
| 17010 | 32/29/32/0/0/3/0 | 32/29/32/0/0/3/0 | 32/32/32/0/0/0/0 |
| 17011 | 11/11/11/0/0/0/0 | 11/11/11/0/0/0/0 | 11/11/11/0/0/0/0 |
| 17012 | 28/28/28/0/0/0/0 | 28/28/28/0/0/0/0 | 26/26/26/0/0/0/0 |
| 17013 | 18/18/18/0/0/0/0 | 18/18/18/0/0/0/0 | 18/18/18/0/0/0/0 |
| 17014 | 24/24/24/0/0/0/0 | 24/24/24/0/0/0/0 | 24/24/24/0/0/0/0 |
| 17015 | 8/8/8/0/0/0/0 | 8/8/8/0/0/0/0 | 8/8/8/0/0/0/0 |
| 17016 | 21/21/21/0/0/0/0 | 21/21/21/0/0/0/0 | 21/21/21/0/0/0/0 |
| 17017 | 27/27/27/0/0/0/0 | 27/27/27/0/0/0/0 | 25/25/25/0/0/0/0 |
| 17018 | 26/26/26/0/0/0/0 | 26/26/26/0/0/0/0 | 24/24/24/0/0/0/0 |
| 17019 | 14/14/14/0/0/0/0 | 14/14/14/0/0/0/0 | 13/13/13/0/0/0/0 |
| 17020 | 30/29/30/0/0/1/0 | 30/29/30/0/0/1/0 | 29/29/29/0/0/0/0 |
| 17021 | 19/19/19/0/0/0/0 | 19/19/19/0/0/0/0 | 19/19/19/0/0/0/0 |
| 17022 | 21/21/21/0/0/0/0 | 21/21/21/0/0/0/0 | 21/21/21/0/0/0/0 |
| 17023 | 32/32/32/0/0/0/0 | 32/32/32/0/0/0/0 | 32/32/32/0/0/0/0 |
| 17024 | 31/31/31/0/0/0/0 | 31/31/31/0/0/0/0 | 31/31/31/0/0/0/0 |

## Held-volume accounting per away stretch (CORRECTED method, prereg Correction 1: held = after-leg awayNaming queue depth at the last evening of the stretch + mid-stretch drops; delivered = held for returned stretches (full drain at the return, unit-proven), = mid-stretch drops for terminal stretches; lost = held − delivered. posHeld = superseded position-method diagnostic (expected ~0 on the relay substrate); dhExcess = superseded DH-excess diagnostic (expected to undercount). qMax/qEnd = after-leg queue snapshots; morningR/eveningR = queue depth at the return day's morning/evening snapshots — the drain evidence.)

| seed | stretch days | return day | held (q) | delivered (q) | lost | qMax | qEnd | mid-stretch drops | morningR | eveningR | drain evidenced | posHeld w/d/s | dhExcess w/d/s | unknown pos |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 15003 | 55 | 56 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | yes | 0/0/0 | 0/0/0 | 0 |
| 15009 | 57 | 58 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | yes | 0/0/0 | 0/0/0 | 0 |
| 15220 | 53 | 54 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | yes | 0/0/0 | 0/0/0 | 0 |
| 15221 | 32,33,34,35,36 | 37 | 7 | 7 | 0 | 7 | 7 | 0 | 7 | 0 | yes | 0/0/0 | 1/1/0 | 0 |
| 17007 | 5,6,7 | 8 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | yes | 0/0/0 | 0/0/0 | 0 |
| 17007 | 39,40 | 41 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | yes | 0/0/0 | 0/0/0 | 0 |
| 17009 | 51 | 52 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | yes | 0/0/0 | 0/0/0 | 0 |
| 17010 | 9,10,11,12 | 13 | 12 | 12 | 0 | 12 | 12 | 0 | 13 | 0 | yes | 0/0/0 | 4/4/5 | 0 |
| 17014 | 34 | 35 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | yes | 0/0/0 | 0/0/1 | 0 |
| 17016 | 11,12 | 13 | 4 | 4 | 0 | 4 | 4 | 0 | 7 | 0 | yes | 0/0/0 | 3/3/1 | 0 |
| 17016 | 58 | 59 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | yes | 0/0/0 | 0/0/0 | 0 |
| 17020 | 7,8,9 | 10 | 2 | 2 | 0 | 2 | 2 | 0 | 4 | 0 | yes | 0/0/0 | 1/1/2 | 0 |
| 17020 | 52 | 53 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | yes | 0/0/0 | 0/0/0 | 0 |
| 17023 | 47 | 48 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | yes | 0/0/0 | 0/0/0 | 0 |
| 17024 | 36 | 37 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | yes | 2/2/0 | 0/0/0 | 0 |
| 17024 | 46 | 47 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | yes | 0/0/0 | 0/0/0 | 0 |

## Metric binding

Judged strictly against evidence/2026-11-05/sim-awaynaming-rereg-a-prereg.md. A miss is NO-GO, never re-scored.
