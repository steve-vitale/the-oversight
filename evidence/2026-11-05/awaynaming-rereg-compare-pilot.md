# awaynaming-rereg-compare — before/after judgement (sim-awaynaming-rereg-a)

Scope: PILOT 8 seeds (17021, 15003, 15009, 15091, 15211, 15215, 15220, 15221). Before corpus: fresh pre-fix baseline (r141 relay behavior) sim-awaynaming-rereg-a-baseline. After corpus: uncapped awayNaming gate sim-awaynaming-rereg-a-corpus.

## Verdict: GO

- Primary — stranded sleep burst events, after: 0 in 5 windows (before: 0 in 5). Stranded settle lines, after: 0 (before: 0). PASS
- Guardrail (i) — NO SILENCING, ledger-based (re-registered per the 2115Z metric review): said_after == kicked, exact, per kind per seed. PASS — 0 lines silenced on all 8 seeds. Phase-shift report (descriptive only, no band): non-stranded sleep burst rate after 7.7% (35/452) vs before (relay) 10.6% (48/452).
- Guardrail (ii-a) — ledger conservation (after leg): said + stillHeld == kicked per kind per seed. PASS — 0 lines lost on all 8 seeds.
- Guardrail (ii-b) — held-volume accounting per away stretch (queue-snapshot method, preregistered — the cap-a Correction 1 method: held/delivered from live awayNaming queue snapshots; ledger (ii-a) is the conservation judge; position-based held and DH-excess delivered retained as diagnostics). Lost == 0 on every stretch. PASS
- Guardrail (ii-c) — reconciliation: said_after − said_before == relayDropped + stillHeld_before − stillHeld_after per kind per seed. PASS
- Guardrail (iii-b) — trajectory identity before/after: all 8 seeds identical (daysAlive, endReason, stranded nights, stranded/non-stranded sleep windows). PASS
- Relay measured loss (before leg, ledger): word 0 / debate 0 / settle 0 lines dropped by the r141 relay (20-cap + flush filters) across 8 seeds — recovered by the uncapped gate iff (ii-a) passes.
- My-gate loss (after leg, ledger): word 0 / debate 0 / settle 0.
- Queue-snapshot notes (drain not snapshot-evidenced, or terminal-stretch/end-held mismatch): 0.
- Lines with unknown fire-time position (position-method diagnostic): 0.

## Per-seed table (after leg; b = before, a = after)

| seed | days | end | stranded nights | b stranded sleep w/e | a stranded sleep w/e | b stranded settle | a stranded settle | b non-stranded sleep w/e | a non-stranded sleep w/e | traj same | stranded-pos violations |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 17021 | 60 | survived | 0 | 0/0 | 0/0 | 0 | 0 | 60/9 | 60/6 | yes | 0 |
| 15003 | 60 | survived | 0 | 0/0 | 0/0 | 0 | 0 | 60/4 | 60/3 | yes | 0 |
| 15009 | 60 | survived | 0 | 0/0 | 0/0 | 0 | 0 | 60/7 | 60/7 | yes | 0 |
| 15091 | 56 | village-lost | 0 | 0/0 | 0/0 | 0 | 0 | 56/8 | 56/6 | yes | 0 |
| 15211 | 60 | survived | 0 | 0/0 | 0/0 | 0 | 0 | 60/3 | 60/2 | yes | 0 |
| 15215 | 54 | village-lost | 0 | 0/0 | 0/0 | 0 | 0 | 54/5 | 54/4 | yes | 0 |
| 15220 | 60 | survived | 0 | 0/0 | 0/0 | 0 | 0 | 60/7 | 60/6 | yes | 0 |
| 15221 | 48 | village-lost | 5 | 5/0 | 5/0 | 0 | 0 | 42/5 | 42/1 | yes | 0 |

## Ledger per seed (k = kicked, sB/sA = said before/after, hB/hA = still-held before/after, rD = relay dropped, mL = my-gate lost)

| seed | word k/sB/sA/hB/hA/rD/mL | debate k/sB/sA/hB/hA/rD/mL | settle k/sB/sA/hB/hA/rD/mL |
| --- | --- | --- | --- |
| 17021 | 19/19/19/0/0/0/0 | 19/19/19/0/0/0/0 | 19/19/19/0/0/0/0 |
| 15003 | 15/15/15/0/0/0/0 | 15/15/15/0/0/0/0 | 13/13/13/0/0/0/0 |
| 15009 | 25/25/25/0/0/0/0 | 25/25/25/0/0/0/0 | 23/23/23/0/0/0/0 |
| 15091 | 22/22/22/0/0/0/0 | 22/22/22/0/0/0/0 | 21/21/21/0/0/0/0 |
| 15211 | 23/23/23/0/0/0/0 | 23/23/23/0/0/0/0 | 23/23/23/0/0/0/0 |
| 15215 | 15/15/15/0/0/0/0 | 15/15/15/0/0/0/0 | 14/14/14/0/0/0/0 |
| 15220 | 22/22/22/0/0/0/0 | 22/22/22/0/0/0/0 | 22/22/22/0/0/0/0 |
| 15221 | 30/30/30/0/0/0/0 | 30/30/30/0/0/0/0 | 30/30/30/0/0/0/0 |

## Held-volume accounting per away stretch (CORRECTED method, prereg Correction 1: held = after-leg awayNaming queue depth at the last evening of the stretch + mid-stretch drops; delivered = held for returned stretches (full drain at the return, unit-proven), = mid-stretch drops for terminal stretches; lost = held − delivered. posHeld = superseded position-method diagnostic (expected ~0 on the relay substrate); dhExcess = superseded DH-excess diagnostic (expected to undercount). qMax/qEnd = after-leg queue snapshots; morningR/eveningR = queue depth at the return day's morning/evening snapshots — the drain evidence.)

| seed | stretch days | return day | held (q) | delivered (q) | lost | qMax | qEnd | mid-stretch drops | morningR | eveningR | drain evidenced | posHeld w/d/s | dhExcess w/d/s | unknown pos |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 15003 | 55 | 56 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | yes | 0/0/0 | 0/0/0 | 0 |
| 15009 | 57 | 58 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | yes | 0/0/0 | 0/0/0 | 0 |
| 15220 | 53 | 54 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | yes | 0/0/0 | 0/0/0 | 0 |
| 15221 | 32,33,34,35,36 | 37 | 7 | 7 | 0 | 7 | 7 | 0 | 7 | 0 | yes | 0/0/0 | 1/1/0 | 0 |

## Metric binding

Judged strictly against evidence/2026-11-05/sim-awaynaming-rereg-a-prereg.md. A miss is NO-GO, never re-scored.
