# Winnability round 1130 — hold NO-GO (killed at confirm) + proposefirst NO-GO (pilot) (Loop B, 2026-11-06)

Run: fleshout-loop-b-20261106T1130Z, axis winnability chain.
The 0930Z run's hold arm was adopted by this run (its first worker died
10:28:32Z on a transport failure; the adoption worker was cancelled; a
third worker closed it out). The 0930Z stageally-confirm-b arm was already
landed earlier (637b0fba1, NO-GO on fresh band 53001–53008) — prior-round
business, not judged here. Loop A live arms (mootgate, gorgeharness) NOT
touched. No gate / price / deed / readyDemand change in either arm. No
game-code change in either arm. The 1130Z coordinator timed out at 7200s;
closeout finished end-to-end in the main session.

## Outcome: 0 levers landed; 2 policy-free subsets merged

- sim-hold-b — NO-GO, killed at confirm (merged 079b7ede2: instruments +
  evidence + corpus + panel only; policy / driver / test NOT landed).
- sim-proposefirst-b — NO-GO at pilot (merged 00978727: analyzer +
  evidence + corpus + panels only; policy / driver / test / sweep-compare
  registration NOT landed).
- Proof: hold 42/42 (worker tree, post-rebase verified in main session);
  proposefirst 12/12 re-run after the analyzer fix (main session). Gate
  on the proposefirst tree: 283 passed / 7 failed in 351s, all 7 standing
  families (measurement-proof-update, measurement-workflow,
  mobile-combat-cadence, occupation-panels, phone-frame-proof,
  capable-bot base failure, establishment-r20-fixes).

## Arm 1 — hold: NO-GO (killed at confirm)

Evidence: evidence/2026-11-06/sim-hold-b.md (+ prereg, corpus
perseed-hold-b/, panel panel-hold-both/, instruments
scripts/hold-analyze-20261106.js, hold-eater-analyze-20261106.js,
hold-instrument-20261106.js — verified NO gate test consumes them).
Baseline = linkseek (landed policy), armed = linkseek-hold (hold tend
guard 6000 + answer beats), 150d death-aware, pilot 58001–58008,
confirm 59001–59008.

Pilot GO: clause 1 end-rank national+ 0→4, clause 2 holds-all-3 1→4,
survival guard 72→82d (1.14x), ledger guard 2 vs 1.

Confirm NO-GO: clause 1 YES (2→4, exactly at bar), clause 2 YES
(4→5), survival guard YES (92→81d, 0.88x), wave-4 ledger guard NO —
armed 1 vs baseline 5 (0.2x, bar 0.5x). The confirm cell alone is 1
vs 5 — not a thin-cell artifact: the baseline confirm legs banked
kills on 59002 (2), 59006 (1) and 59007 (2), and the armed legs on
those same seeds banked 0, 0, 0. The one armed ledger point is 59001,
where the armed leg died at d61 after forming its realm at d58.

Pooled (n=16 per leg): national+ armed 8 vs baseline 2; holds-all-3
9 vs 5; wins 0/0; wave-5 unlock 0/0, wave-5 faced 0/0; ledger-5 0/0;
readiness-5-ready days 0/0 — no leg ever stood ready, so
release-after-ready could not be tested by this arm either. The
wave-4 ledger pooled reading sits exactly ON the bar (armed 3 vs
baseline 6 = 0.5x) while the confirm cell fails it — metric review
flags the per-stage vs pooled ambiguity for the NEXT prereg, not
re-scored. Median survival pooled 81 vs 78d (1.04x).

The mechanism works: renegotiation lapses 48→0, guard-blocked tend
weeks 150→37, landed tends 174→234. What it did NOT do:
speaker-death is unchanged (−1200 vs −1192, 150 vs 149 events) — the
deaths themselves don't stop. 0 wins / 0 wave-5 / 0 ready days on all
32 legs. In the worker's words: "Grain answers grief; it does not
win fights."

Food-pressure watch: armed starvation deaths doubled on the pilot
panel (12 vs 6), thirst 3 vs 0 — plausible tend-grain pressure
(1,500 kcal × 234 tends + 52 gifts); median survival still rose.

Metric review (for the NEXT prereg): the kills guard as written is
fragile at n=8/cell — judge the guard pooled OR accept single-cell
kills; realm span measures survival as much as holding (pair with a
survival-matched reading or judge holds-all-3 alone); the kills
metric needs a wider band or a larger confirm; future hold variants
should meter grain spend against pantry depth; the say-filter
300-line cap fills by ~day 32–41 (per-week sampling or a higher cap
belongs in the next instrument revision).

Do NOT re-run hold as a winnability arm. Its pieces — answer beats,
tend guard 6000 — are measured facts for the next arm.

## Arm 2 — proposefirst: NO-GO (pilot, kills guard)

Evidence: evidence/2026-11-06/sim-proposefirst-b.md (+ prereg, corpus
perseed-proposefirst-b/, panels panel-proposefirst-before/after/both/,
analyzer scripts/proposefirst-analyze-20261106.js). Baseline =
linkseek, armed = linkseek-proposefirst (propose on first contact,
travel only after acceptance), 150d death-aware, pilot 72001–72008.
Confirm band 78001–78008 reserved, stays unused (confirm only on
pilot GO).

Clause 1 PASS — median first-proposal day 27→7, a 20-day gain (bar
≥7 days); both legs proposed on 8/8 seeds. Clause 2 PASS — pooled
seasoned links 20 armed vs 18 baseline. Guards: survival PASS
(median 87→108 days, 1.24x); wave-4 ledger FAIL — 2 armed vs 8
baseline (bar ≥4). The guard miss is concentrated: 6 of the
baseline's 8 ledger points sit on ONE seed (72001, the only baseline
leg with ready days — 29 — and a wave-5 unlock). The pooled bar
still fails as written, and that is the verdict.

The answer, in plain words: asking on first meeting works — and it
costs you the negotiation. The ask itself is twenty days earlier:
villages are known on day 4, and the new policy proposes on day 7
on all eight seeds (the three days are the pantry guard — the
pantry does not clear 12,000 kcal until day 7 — not travel, not the
old day-25 rule). Villages still say yes: 27 proposals, 20 formed
outright, 7 answered with a counter-offer, 0 declines, 0 shut doors,
and every counter was answered the next day and formed a link. More
links form in total, and more of them season (20 vs 18).

But the cold ask changes WHAT forms. A proposal made before the
village has been visited and its codex studied lands in the counter
band far more often (7 of 27, vs 0 of 22 for the warmed policy), and
a counter is not a "no" — it is an offer to flip the table. The
counter's terms, in the game's own words: "They won't bow to Haven.
But they'll TAKE Haven — 5,000 kcal/week, them primary." Answering
"accept" — which the policy does whenever the pantry holds 25,000
kcal or less, i.e. almost always in the first weeks — forms the bond
with Haven as the subordinate. Four of the seven counters were
answered that way, and those four links can never count toward
Haven's realm: the realm needs three seasoned bonds where Haven is
primary. They are also never tended (the tending verb refuses any
bond where Haven is not primary), so they bleed untended from trust
40 to zero while Haven owes them tribute — the wrong way round. The
three counters answered "sweeten" (pantry rich enough for the 1,500
kcal gift) re-judged at Haven's terms and formed Haven-primary, like
the outright forms.

So the early ask buys three weeks and spends them on bonds that
point the wrong way. The warmed policy's travel-and-study leg —
walking to the village, studying its codex at the fire for +3
opinion — was not dead time. It was the warming that kept the ask
out of the counter band. Realms: 3/8 seeds armed vs 6/8 baseline;
national+ end rank 3/8 vs 4/8. The kills guard is the formal NO-GO,
and it is real too, not a re-score: total wave-kill-log entries are
IDENTICAL pooled (339 vs 339) — the armed legs kill as much overall
and face wave 4 nearly as often (5/8 vs 6/8), but bank fewer wave-4
ledger points. The difference is wave-4-specific.

Wall (pilot, per leg): wins 0/8 both; national+ 4/8 baseline vs 3/8
armed; global 4/8 vs 3/8; table (end) 0/8 both — no sitting anywhere
(table touched at peak 4/8 vs 3/8); wave-4 unlock 7/8 vs 5/8, faced
6/8 vs 5/8; wave-5 unlock 2/8 (72001, 72004) vs 0/8; ready days 29
(all on 72001) vs 0; median survival 87 vs 108; survivors (150d)
0/8 vs 1/8. The analyzer does not tabulate wave-5 facing; no
wave-5 kill is recorded in any judged ledger this round.

Metric review (for the NEXT run): the ledger-4 guard is pooled, and
one seed supplies 75% of the baseline total (72001: 6 of 8). A pooled
guard with a single-seed driver is fragile in both directions — a
future arm should pre-register a per-seed or median ledger guard.
The balanced-panel compare.json reads "invalid — unmatched policies":
a known artifact of the flag-flip shape, not a comparison failure
(see the arm evidence). The analyzer fix (endVets number-guard;
global counted in the national+ wall) changed no judged number —
the verdict was re-run after the fix and is unchanged.

Do NOT re-run propose-first as a winnability arm. The measured fact
for the next arm: the travel leg's marginal value is the opinion it
banks before the ask.

## Wall (both arms, pooled)

- Wins 0 everywhere; table sittings 0 everywhere (table touched at
  peak on some legs, never sat).
- National (end rank): hold 0/0 both stages; proposefirst 4/8
  baseline vs 3/8 armed.
- Wave-5 unlock: hold 0/0 (32 legs); proposefirst 2/8 baseline vs
  0/8 armed (72001, 72004). Wave-5 kills: none recorded in any
  judged ledger this round (hold ledger-5 0/0 pooled).
- Readiness-5-ready days: hold 0/0 (32 legs); proposefirst 29
  baseline (all on 72001) vs 0 armed. Release-after-ready remains
  untestable by either arm.
- The wall is still wave-4 kills + killer survival — now with the
  added shape: diplomacy mechanisms that buy realm and holding do
  not buy kills, and an early ask that buys speed spends realm
  direction. The next lever goes after where killers actually die,
  out in the wild, not who picks up the Codex after them — and not
  through holding or asking earlier.
