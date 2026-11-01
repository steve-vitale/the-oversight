# sim-strandwide-b — COMPARE (matched-seed census, NOT a panel comparison)

Run: oversight-flesh-out-loop-b, arm sim-strandwide-b, run
fleshout-loop-b-20261101T0119Z. Prereg:
evidence/2026-11-01/sim-strandwide-b-prereg.md (commit 6c0b469f,
before any judged leg). Base ee159dbc3. Horizon 30d,
death-aware. Every cell below runs the strandtile analyzer
verbatim on per-seed corpora; seeds are identical across
the compared cells.

## §15 panel non-applicability (declared in the prereg, confirmed here)

scripts/balance-panel.js runs sweep-compare POLICY_REGISTRY
policies on 150-day horizons with its own scorecard. It cannot
express the nighttravel+woodcarry+woodwarm stack, a 30-day
per-day creek census, creek-tile evenings, or a policy that is
not in the registry — and registering creekseek would require
editing scripts/sweep-compare.js, an existing script outside
this arm's new-files-only scope. No panel result is fabricated;
the panel tool was not invoked on this corpus. The comparison
below is the matched-seed census the prereg specified, and it
is never labeled a panel comparison.

## Matched comparison 1: creekseek-stack vs P1 nighttravel-stack (identical seeds)

crTile = creek-tile evenings; conf = confirmed nights;
FR = failed-return nights; NA = no-attempt nights;
eps = strand episodes (days, end story).

### Band G1 (17519-17526, 8 seeds each)

| seed | P1 crTile/conf/FR/NA/eps | CS crTile/conf/FR/NA/eps |
|------|--------------------------|--------------------------|
| 17519 | 0/0/0/0/— | 0/0/0/0/— |
| 17520 | 0/0/0/0/— | 0/0/0/0/— |
| 17521 | 0/0/0/0/— | 0/0/0/0/— |
| 17522 | 0/0/0/0/— | 0/0/0/0/— |
| 17523 | 8/7/7/0/[7-13] SUCCESSION | 13/11/11/0/[7-13] SUCCESSION, [18-21] SUCCESSION |
| 17524 | 0/0/0/0/— | 0/0/0/0/— |
| 17525 | 0/0/0/0/— (1 genuine absence, never creek) | 0/0/0/0/— (same) |
| 17526 | 0/0/0/0/— | 0/0/0/0/— |
| TOTAL | 8/7/7/0/1 episode | 13/11/11/0/2 episodes |

G1 delta: creek-tile evenings +5 (13 vs 8), confirmed nights
+4 (11 vs 7), failed-return nights +4 (11 vs 7), episodes +1.
The entire G1 delta sits on seed 17523 (see causal read below).

### Band G2 (17527-17542, 16 seeds each)

| seed | P1 crTile/conf/FR/NA/eps | CS crTile/conf/FR/NA/eps |
|------|--------------------------|--------------------------|
| 17527-17532, 17534, 17535, 17537-17539, 17541 | 0 each | 0 each |
| 17533 | 1/1/0/1/— (blocked-combat night, day 27) | 1/1/0/1/— (identical) |
| 17536 | 0 (1 genuine absence, never creek) | 0 (same) |
| 17540 | 0 (1 genuine absence, never creek) | 0 (creek VISIT day 16, evening at haven — see below) |
| 17542 | 0 (village-lost day 22) | 0 (village-lost day 22) |
| TOTAL | 1/1/0/1/0 episodes | 1/1/0/1/0 episodes |

G2 delta: ZERO on every strand number (creek evenings 1 vs 1,
episodes 0 vs 0). The policy did not generalize to G2: no G2
seed offered a creekseek-convertible away evening that stuck.

### Pooled G1+G2 (24 seeds each — the prereg's POLICY bar cell)

- Creek-tile evenings: creekseek 14 vs P1 9 (delta +5).
- Confirmed nights: 12 vs 8 (delta +4).
- Failed-return nights: 11 vs 7 (delta +4).
- No-attempt nights: 1 vs 1 (the shared 17533 blocked-combat night).
- Strand episodes: creekseek 2 vs P1 1 (delta +1 episode,
  both creekseek episodes on 17523, outside the named set).
- Unclassified nights: 0 vs 0. Classification completeness
  on the pooled P1+CS cells: 20/20 confirmed nights carry a
  FAILED-RETURN or NO-ATTEMPT story (100%).

The pooled POLICY bar is met on its pooled terms — and the
per-band split above is the honest caveat: the whole delta
comes from G1; G2 contributes nothing to either side.

## Causal read: the two creekseek moves in 712 creekseek evenings

Move records pooled across all 24 creekseek legs (712
evenings: 24 x 30 minus 8 for the day-22 village loss on
17542): at-haven skip 682, already-creek 13, moved-to-creek
2, no-creek-offered 11, combat skip 4.

1. 17523 day 18 — THE episode-creating move. Baseline day 18:
   villager ends competent.daily on trail_edge, out-of-reach,
   sleeps there day 19, home day 20. Creekseek day 18: the same
   away ending, then the policy steps to the creek
   ("You make for the creek to drink before night."),
   nightStep out-of-reach, creek night; days 19-22 already-creek;
   episode days 18-21, camp-final day 22, succession morning
   day 23. The move CAUSED the episode: same seed, same days,
   different evening tile, and the only policy action that day
   was the creek step.
2. 17540 day 16 — a creek VISIT, correctly NOT a creek night.
   Baseline day 16: meadow morning, haven evening
   (walk-no-path). Creekseek day 16: meadow -> creek (distance
   2, moved-to-creek), then nightStep travels home; evening at
   haven, same walk-no-path outcome. The visit counts nowhere
   in the strand numbers — the evening snap is at haven — and
   the pair proves the policy's visit/night distinction is
   real, not definitional.

Episode 1 on 17523 (days 7-13) is byte-identical across
policies: competent.daily itself puts the villager at the
creek and creekseek skips (already-creek) every evening, so
no trajectory divergence exists until the day-18 move. The
policy preserved one episode exactly and created one new one.

Episode 2's failed-return signal is pure out-of-reach: its
nights carry NO blocked-crossing flag (creekseek G1 blocked
nights = 7, all episode-1 nights), because the villager is
already AT the creek — no crossing is attempted during the
day. The flag is corroboration, never a requirement, and
episode 2 confirms an out-of-reach-only episode is real under
the prereg's signal set.

## Matched comparison 2: P3 deed-seeking vs P1 on identical G1 seeds (substrate census)

P3 G1: 38 creek-tile evenings, 31 confirmed nights, 0
failed-return, 31 no-attempt, 11 camps (ends: succession 5,
moved-elsewhere 5, horizon 1), unconfirmed haven-following 6,
end-of-run 1. P1 G1 on the same seeds: 8 creek evenings, 7
confirmed, 7 failed-return, 1 camp. Deed-seeking puts
villagers at creeks at ~5x the P1 rate on identical seeds
(38 vs 8) — but with no return mechanism every one of its
nights is NO-ATTEMPT, so P3 camps are substrate, never
strands, and are never pooled into any strand number. The
P1-vs-P3 gap on identical seeds is the next arm's design
question (why competent.daily ends at haven), not this arm's
verdict input.

## Base check (not a comparison cell)

P1 17513/17511 on this base reproduce strandtile exactly:
17513 episode days 5-9 SUCCESSION, 17511 singleton day 10
MOVED-ELSEWHERE, all per-seed counts identical to
strandtile's pilot cell. Zero drift across the base move
5aa816b4e -> ee159dbc3 on the shared named seeds.
