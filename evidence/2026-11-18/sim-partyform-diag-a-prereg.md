# sim-partyform-diag-a — prereg (FROZEN)

Run fleshout-20261118T2015Z, Loop A, axis scale-onramp. Arm
sim-partyform-diag-a — DIAGNOSIS ONLY, no gameplay fix lands from
this arm. Finding #2547: why a party-stage plan with a willing,
geared holder finds NO companion in 35 days.

## Named case (from sim-scale-onramp-round-1515.md + the committed
## seedplan-b corpus, perseed-wildavoid-seedplan-b-arm s104607)

Yuki Mori, seed 104607, days 106–140: avoided the same Influencer
4x (d106–107), plan seeded/retargeted (stage 'party', target
'influencer', needWave 4, node (0,4)); dawnbidCensus 35 rows, party
[] on every row, holder alive, at Haven? NO — holderNode (0,4) /
(0,3) / (3,3) / (1,4), never (4,4); health 54→37→13; holder
armed+armored throughout. dawnbidScores: ZERO rows for Yuki in 35
days (gen_xm7o5tp + marcus_webb scored; Yuki never). winPlanStats:
partyInvites 0, partyWaits 0, partyDepartures 0.

Correction to the 1515Z reading: dawnbidCensus is an END-OF-DAY plan
existence census, NOT a bid record. "Bid at dawn for 35 straight
days" is UNPROVEN — the corpus proves the plan EXISTED 35 days and
was NEVER SCORED (0 vbrainScorePick rows). The diagnosis must
establish which dawn-path gate never fires for her.

## Second stall shape in the same corpus (control case, 104606)

David Kim, seed 104606, days 58–150: 97 census rows, 93 score rows,
party [] throughout. companionPool (61 rows): eligible 0 on 48/61
days, 1 on 13/61; first-fail totals away 251, notRanger 228,
trustLow 0, notAtHaven 0. On the 13 eligible days the dawn commit
was party_launch with diana_osei — and EVERY depart row holds on
vidBlock 'range-0' (the holder himself can never leave Haven).
Shape B is already named from committed data; the diag run checks
whether it reproduces live and whether Yuki's shape A shares any
of its gates.

## Primary metric

The named mechanism + counts, for every wave-4 plan holder on the
pilot band: per stalled day — (a) holder away? (purpose/duration),
(b) holder node vs Haven, (c) objective kind/state at dawn,
(d) objPick / objRefreshPick / vbrainScorePick / winPlanDepart /
winPlanHavenTick calls for the holder that day, (e) findCompanion
eligibility breakdown (the poolReplica first-fail counts), (f)
holder range (npcMaxDist) and launch block (deriveLaunchBlock).
GO: a mechanism identified with counts reproduced on ≥1 seed —
either Yuki's exact stall (0 score calls over ≥30 stalled days with
the blocking condition named per day) or a named equivalent
(e.g. bid-time Haven-idle pool size 0 on ≥30 stalled days with the
binding filter counted, or holder range-0 blocking every launch
attempt).

## Horizon + seeds + policies

150d, death-aware (never a fixed 200d). Seeds 104601–104608 (the
1515Z/1715Z pilot band) — DELIBERATE REUSE for reproduction, not a
fresh measurement; the seedplan-b confirm already used fresh band
104701–104712. Policy: competent verbatim
(scripts/policies/competent.js). Env: VETREENGAGE=1 PARTYSIZE4=1
FLEEREPAIR2=1 WILDAVOID=1 WILDSEEDPLAN=1 MODE=arm — the same env as
the seedplan-b arm leg, so the trajectory is comparable.

## Method

The seedplan fix is HELD on branch sim-wildavoid-seedplan-b and NOT
on master; this arm does NOT check out that branch and does NOT
merge or touch it. The fix's game.js diff (two call sites,
env-gated) is staged in this worktree as a DIAGNOSTIC-ONLY harness,
clearly marked in the driver header, and REVERTED before any commit
that carries diag results — the committed tree stays pure master +
diag instrument + evidence. If the Yuki stall does not reproduce
bit-identically on this tree's later master, the committed seedplan-b
corpus remains the primary evidence and the live run is reported as
a mechanism check (which gates fire), not as a reproduction.

New instrument scripts/partyform-diag-driver.js: wraps objPick,
objRefreshPick, vbrainScorePick, winPlanDepart, winPlanHavenTick,
objTick (dawn re-pick gate), and records the daily holder snapshot
(away/objective/node/range/pool) for every wave-4 plan holder. Pure
reads + call counters; no state writes, no RNG. Proof test
scripts/test-partyform-diag-a.js: (1) instrument reports the pool
truthfully on a fixture (ranger vs forager vs away members);
(2) a range-0 holder's launch attempt is recorded as blocked with
the right reason; (3) a holder away at dawn gets 0 score calls in
the instrument. Balanced panel (scripts/balance-panel.js) per
MEASUREMENT.md §15 applies ONLY if game code changes — this is a
pure-diag arm with no game-code change, so the reproduction analysis
attaches instead.

## Metric review (to fill at closeout)

- Whether "35 days of bidding" survives: census ≠ bid.
- Whether shape A (never scored) and shape B (scored, pool empty /
  holder range-0) are distinct mechanisms or one.
- Whether the seedplan-b confirm-band holders (104705/104708)
  show either shape.
