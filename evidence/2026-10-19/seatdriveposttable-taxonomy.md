# sim-seatdrive-posttable — seated-table mortality taxonomy (2026-10-19)

**Corpus:** 16 armed runs (seeds 64201, 64201, 64202, 64202, 64203, 64203, 64204, 64204, 64205, 64205, 64206, 64206, 64207, 64207, 64208, 64208 x {leadfeast,belongfeast}), substrate seatdrive-win-side (SEATDRIVE=1), 180d death-aware. Control: the committed pre-seat corpus (n=16, SEATDRIVE=0, base e374e9a3a — reused, not re-run).

**Wall (armed):** national 10/16, table 8/16, wins 10/16, wave-4 8/16, wave-5 0/16, median survival 90d, max 109d.
**Wall (control):** national 10/16, table 12/16, wins 0/16, wave-4 11/16, wave-5 0/16, median survival 110d.

**End reasons (armed):** over-other 10, village-lost 6.

**Table outcomes (armed):** won 10, no-table 4, invitation-only 2.

**Invitation→sitting (the backlog distinction):** 12 invitations, 10 sittings → conversion 83.3% (control: 12 invitations, 0 sittings → 0%).

**Seated survival:** 10 seated runs, median 0d seated (sitting → death/end).

**Seated deaths:** 0 (during-table 0, post-table 0). Channels: . #1 margin over #2: nullx.
Waves: . Tiers at death: .

**Death rates:** armed pre-table 0.102/day → post-sitting 0/day (control: pre 0.080/day → post-table 0.157/day, 1.97x).

**Overtime dose-response (deaths per 100 tier-days, armed + fidelity OFF-side series):**

| tier | tier-days | deaths | deaths/100d |
|---|---|---|---|
| t0 | 1694 | 188 | 11.1 |
| t1 | 14 | 1 | 7.14 |
| t2 | 14 | 0 | 0 |
| t3 | 13 | 4 | 30.77 |
| t4 | 7 | 1 | 14.29 |
| t5 | 7 | 2 | 28.57 |
| t6 | 46 | 4 | 8.7 |

**Tier-stamp completeness:** 1314 daily recs, 0 null otier; 0 seated deaths, 0 null otier.

**Attribution:** 10/10 seated runs fully attributed (0 unattributed); 0 unattributed deaths total (armed corpus).

## Per-run seated trace

| run | end | nat | wave | table | tday | sat (seat) | seatedDays | phases | activeDays | done | seatedDeaths (dur/post) | unmet |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| leadfeast-s64201 | over-other:d109 | 1 | — | won | — | d109 (lesser) | 0 | done | 0 | d109 | 0 (0/0) | — |
| leadfeast-s64202 | over-other:d94 | 1 | — | won | — | d94 (lesser) | 0 | done | 0 | d94 | 0 (0/0) | — |
| leadfeast-s64203 | village-lost:d69 | 0 | — | no-table | — | — | — | — | 0 | — | 0 (0/0) | no-invitation |
| leadfeast-s64204 | over-other:d90 | 1 | 4 | won | d66 | d90 (lesser) | 0 | done | 0 | d90 | 0 (0/0) | — |
| leadfeast-s64205 | village-lost:d109 | 1 | 4 | no-table | — | — | — | — | 0 | — | 0 (0/0) | no-invitation |
| leadfeast-s64206 | village-lost:d22 | 0 | — | no-table | — | — | — | — | 0 | — | 0 (0/0) | no-invitation |
| leadfeast-s64207 | over-other:d90 | 1 | 4 | won | d51 | d90 (lesser) | 0 | done | 0 | d90 | 0 (0/0) | — |
| leadfeast-s64208 | over-other:d94 | 1 | 4 | won | — | d94 (lesser) | 0 | done | 0 | d94 | 0 (0/0) | — |
| belongfeast-s64201 | village-lost:d86 | 0 | — | invitation-only | d55 | — | — | — | 0 | — | 0 (0/0) | seat-never-taken,day-90-floor-unmet-at-invite,table-never-completed |
| belongfeast-s64202 | village-lost:d83 | 1 | — | invitation-only | d69 | — | — | — | 0 | — | 0 (0/0) | seat-never-taken,day-90-floor-unmet-at-invite,table-never-completed |
| belongfeast-s64203 | over-other:d90 | 0 | 4 | won | d69 | d90 (lesser) | 0 | done | 0 | d90 | 0 (0/0) | — |
| belongfeast-s64204 | over-other:d90 | 0 | 4 | won | d45 | d90 (lesser) | 0 | done | 0 | d90 | 0 (0/0) | — |
| belongfeast-s64205 | over-other:d90 | 1 | — | won | d70 | d90 (lesser) | 0 | done | 0 | d90 | 0 (0/0) | — |
| belongfeast-s64206 | village-lost:d22 | 0 | — | no-table | — | — | — | — | 0 | — | 0 (0/0) | no-invitation |
| belongfeast-s64207 | over-other:d102 | 1 | 4 | won | — | d102 (lesser) | 0 | done | 0 | d102 | 0 (0/0) | — |
| belongfeast-s64208 | over-other:d90 | 1 | 4 | won | d55 | d90 (lesser) | 0 | done | 0 | d90 | 0 (0/0) | — |

## Seated death rows (day-after-sitting indexed)

| run | day (d+after sit) | who | cause | channel | kwave | tier | pantry | roster | phase | path | branch | active |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
