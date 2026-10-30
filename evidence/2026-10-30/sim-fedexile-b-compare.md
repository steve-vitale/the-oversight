# sim-fedexile-b — paired before/after (§15 compare)

§15 DEVIATION (stated on its face): the official balance-panel driver cannot express this arm — its policies are sweep-compare registry policies, not the nighttravel+woodcarry+woodwarm strand stack, and the 23-metric contract has no strand-length / fed-morning / wood-seeking metrics (same standing as sim-pressb-b, sim-armorstock, sim-shellrevive-b). This compare pairs unfed control (PRESSB=0) and fed variant (PRESSB=1) legs seed-by-seed on the pre-registered metrics, plus guardrail metrics (survival, death causes, wave reach). The panel is the instrument here in paired form; the pre-registered DIAG-GO bars in the prereg are the judge. This is a DIAG census with a paired comparison, not a before/after lever claim — no behavior is landed by this arm.

Pairs: 10 seeds (identical seeds, 30 loop-days, same base). Control creek/still/rescued 18/10/8; variant 25/17/8. Guard control 12/3/9; guard variant 13/4/9.

## PRIMARY: fed-vs-unfed strand-length delta (still evenings, paired per strand)

- paired strands: 1 (unpaired: 0)
- deltas (variant − control): [7] — median 7
  - seed 15215 strand 0: control 7–16 (10) → variant 7–23 (17) — delta 7

## PRIMARY: death-delay (bearer-death day, variant − control)

  - seed 15003: bearer day null → null — delay null (CENSORED: a leg has no bearer death) — same cause null — end survived → survived — daysAlive 30 → 30 — waves 2 → 2
  - seed 15009: bearer day 18 → 18 — delay 0 — same cause true — end survived → survived — daysAlive 30 → 30 — waves 2 → 2
  - seed 15091: bearer day 8 → 8 — delay 0 — same cause true — end survived → survived — daysAlive 30 → 30 — waves 2 → 2
  - seed 15211: bearer day null → null — delay null (CENSORED: a leg has no bearer death) — same cause null — end survived → survived — daysAlive 30 → 30 — waves 2 → 2
  - seed 15215: bearer day 17 → 23 — delay 6 — same cause true — end survived → survived — daysAlive 30 → 30 — waves 1 → 2
  - seed 15220: bearer day null → null — delay null (CENSORED: a leg has no bearer death) — same cause null — end survived → survived — daysAlive 30 → 30 — waves 2 → 2
  - seed 15221: bearer day 31 → 31 — delay 0 — same cause true — end survived → survived — daysAlive 30 → 30 — waves 1 → 1
  - seed 15337: bearer day null → null — delay null (CENSORED: a leg has no bearer death) — same cause null — end survived → survived — daysAlive 30 → 30 — waves 2 → 2
  - seed 15376: bearer day 17 → 17 — delay 0 — same cause true — end survived → survived — daysAlive 30 → 30 — waves 2 → 2
  - seed 15439: bearer day null → null — delay null (CENSORED: a leg has no bearer death) — same cause null — end survived → survived — daysAlive 30 → 30 — waves 3 → 3

## PRIMARY: wood-seeking conversion on fed mornings (fired mornings → same-day wood-seeking)

- fed mornings: 4 — wood-seeking: 0 — rate 0.000 (gain-line mornings: 0)
- variant strand mornings total: 17 — skipped mornings: 13 — skipped-seeking: 0
- fed mornings with next-day lines recorded: 4 — next-day seeking: 0
- fed mornings with positive daytime wood delta: 0 — scan/delta disagreements: 0
  - seed 15215 day 10: morning kcal 0, wood 3, press E 540 — seeking not-seeking — daytime delta 0 — next-day not-seeking — evening binding wood-short
  - seed 15215 day 14: morning kcal 0, wood 2, press E 900 — seeking not-seeking — daytime delta 0 — next-day not-seeking — evening binding wood-short
  - seed 15215 day 18: morning kcal 236, wood 0, press E 810 — seeking not-seeking — daytime delta 0 — next-day not-seeking — evening binding wood-short
  - seed 15215 day 22: morning kcal 780, wood 0, press E 990 — seeking not-seeking — daytime delta 0 — next-day not-seeking — evening binding wood-short

## GUARDRAILS

- strand mornings in table: 27 — complete (morning + evening + day lines): 27 — incomplete: 0
- recorder errors control/variant: 0/0 — stalls: 0
- evening binding mix, control strands: {"null":1,"kcal-short":2,"wood-short":7}; variant strands: {"null":1,"kcal-short":2,"wood-short":14}
- median survival (all judged legs): 30 days; wave reach (control/variant): wave 1 10/10, wave 2 8/9, wave 3 1/1, wave 4 0/0, wave 5 0/0
- national / table / wins: NOT OBSERVABLE on 30-day evening legs (pre-seat, no field) — structural 0 on this window, not a game verdict; see evidence file.

## VERDICT (bars a–c here; bar d determinism + proof judged by scripts/test-fedexile-b.js)

- (a) paired table complete: PASS
- (b) delta quantified: PASS
- (c) conversion counted: PASS
