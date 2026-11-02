# Loop A round 0045Z — scale-onramp adoption instruments (coordinator evidence)

Run: fleshout-loop-a-20261102T0045Z, axis scale-onramp, Loop A.
Claim: fleshout-loop-a-20261102T0045Z.json (axis scale-onramp, arms
quotatrigger / trustbleed / heraldkill). Sibling Loop B live on
food-economy throughout (2330Z claim at plan time) — NOT touched.
All three arms DIAG/policy-side only: zero `src/js` changes, no
gates, stages, deed bars, or win prices touched, nothing from the
#1538 steve-call queue built. No [needs-eyes] (measurement only).
This round takes the 2315Z next blanks (1), (2), (4) in order, per
DELIVER OVER MEASURE: decision-grade instruments that decide a
delivery spec, no game-code change this round.

## Arm 1 — quotatrigger: NO-GO at pilot

Verdict: NO-GO (pilot) — the trusted-tier call always closes the
ceiling, but the trigger itself is too rare.
Evidence: evidence/2026-11-01/sim-quotatrigger-a.md +
perseed-quotatrigger-a/ (pilot, 8 seeds, DAYS=180, frozen
musterroster stack). Prereg committed BEFORE any judged sim;
no bar changed mid-run.
- Trigger defined on 5/8 pilot seeds (bar >= 6/8 — FAIL, the
  only failed bar). Among trigger-defined seeds, ready-after-
  commit is 5/5 (bar >= 2/3 — PASS) and every guardrail holds
  (link count unchanged 3->3 on all 5, every responder
  verified, instruments clean).
- Per the prereg pilot gate, NO confirm spend was made.
- When the moment exists, the call closes the ceiling with
  room to spare (sounded yields 11–17, need 10, before Haven
  even commits). On 3/8 seeds the moment never arrives; one
  of those (95423) would probably have been ready anyway
  under a less strict trigger.
- The race is decided BEFORE contact, not during it: trust
  holds flat or bleeds while the Herald is in contact, so a
  seed either arrives at first contact already trusted, or
  (almost) never gets there. The one gap-climb seed (90111)
  paid off from the quiet gap, not from the refusals.
- Deliverable: the delivery spec in the arm evidence, not a
  built change. This is NOT a concept kill.

## Arm 2 — trustbleed: recovery EXISTS; the 2315 bleed is sounded-muster hunger, not refusals

Verdict (prereg rule): recovery EXISTS — and the 2315 bleed
is not a refusal doom loop.
Evidence: evidence/2026-11-01/sim-trustbleed-a.md +
perseed-trustbleed-a/. Prereg committed BEFORE any judged
sim; no bar changed mid-run.
- Recovery EXISTS: >= 1 link on >= 2 pilot seeds re-reaches
  the trusted tier (trust >= 70 AND opinion >= 10) after the
  first refused Herald attempt — met on THREE seeds: 90111
  (all three links, days 76–77), 90221 (Stonebridge day 91,
  Thornfield day 89), 90220 (Thornfield day 172).
- The named recovery mechanism is the ordinary relationship
  system, not anything refusal-specific: weekly grain tending
  (+8 per link), weekly tribute (+1, paid or waived),
  shared-granary court feasts (+10; on 90260 the feast's +7
  is gagged by mourning — "theirs waits"), accepting a linked
  fire's road food (+4). Refusals do not interrupt it.
- The 2315 bleed is REAL but misattributed: on the
  intervened 90111 twin (call sounded day 72), the bleed
  reproduces exactly (69→4, 48→0, 57→0, all links broken day
  103, village lost day 107, 92 refused attempts). Its cause
  is NOT the refusals — it is the sounded-but-unfed muster:
  −2 trust per mustered link per day of hunger upkeep,
  firing every day from day 73 to day 107 while the muster
  is fed 0–270 of 7,000–9,000 kcal/day. The refusals keep
  coming because the muster never reaches 10 blades, so the
  Herald is never fought, the muster never resolves, and the
  hunger never stops. That is the doom loop — sounded-muster
  hunger, not refusal.
- Screen: 60 seeds scanned (90201–90260), 6 qualifiers
  (10%); pilot band 7 seeds, not 8 — a screen outcome, not
  a moved bar. Confirm (12–16 seeds) was NOT run.
- Deliverable: the delivery spec in the arm evidence, not a
  built change.

## Arm 3 — heraldkill: HURTS 5/5, unanimously

Verdict: HURTS — killing the Herald hurts the titan road,
unanimously on all 5 kill seeds.
Evidence: evidence/2026-11-01/sim-heraldkill-a.md +
perseed-heraldkill-a/ (judged 6 JSONs, reference 3, probe
11). Prereg committed BEFORE any judged sim; no bar moved
after seeing results.
- After a villager field kill, the Herald is never replaced,
  its omen freezes at stage 2, no slain credit lands, the
  call still forms a muster (and Haven still commits blades)
  against a monster that is not there, and the dead Herald
  keeps striking — 26 phantom escalation lines across the 5
  seeds, eating pantry kcal and cutting allied trust for a
  fight that can never start. The road's first titan becomes
  un-fightable, un-re-summonable, and un-credited, while
  still charging its costs.
- Validator 99/99; heraldarr2 parameterized leg 1209/1209.
- Reproduction note: the kill phenomenon reproduced EXACTLY
  on current master on all 9 re-run seeds — same kill days,
  killers, lairs, removals, end fields. The moved-base worry
  in the prereg did not materialize for these seeds.
- Deliverable: the delivery spec in the arm evidence, not a
  built change. Whether re-placement SHOULD exist is a design
  question for a future arm, not built here.

## Landing

All three branches merged via --ff-only onto master and
verified in the log (quotatrigger e645d7f46, trustbleed
716781d93 + 3a9fa9a8b, heraldkill 978ff20cf chain).
Worktrees released and removed; main tree clean. One
worktree-removal note: the trustbleed directory had a .git
pointer loss during remove, resolved by the branch being
absent and the worktree list empty — no work lost.
Merged locally, pending ship (coordinator evidence only;
no game-code change this round).

## Telemetry deviation check

Ran `node scripts/telemetry-check.js --baseline
telemetry-baselines/scale-wall-preseat.json --current
<perseed-glob> --metrics national,table,wins,exiled` for
all three corpora. The check REFUSED all three by design:
every per-seed row carries top-level anchorCommit, so they
are sweep recorder rows, not runs — recorder corpora are
compared with sweep-compare tables, never against a run
baseline here. No --allow-recorder-corpus override, no
baseline reseed. Baseline NOT rolled. This is the known
telemetry-check limitation (same as the 2330Z round), not
a deviation and not a finding.

## Metric review

- Prereg bars honored on all three arms; no bar moved after
  seeing results.
- Quotatrigger pilot gate honored: trigger 5/8 missed the
  >= 6/8 bar, so no confirm spend — the NO-GO is a pilot
  verdict, not a concept kill.
- Trustbleed screen yielded 7 seeds, not the aimed 8 — a
  screen outcome (6 qualifiers in 60 scanned), not a moved
  bar; the verdict rule fires cleanly on 7.
- Heraldkill determinism held exactly across the re-run;
  the moved-base worry did not materialize.
- Telemetry refusal is by design (see above); the check
  must not be forced past it.

## Next blanks (for the next Loop A run)

1. Trusted-tier trigger rarity: the moment arrives on only
   5/8 seeds — a less strict trigger, or earlier trust
   building, is the open lever. The call itself closes the
   ceiling whenever the moment exists.
2. Sounded-muster hunger: a sounded muster that never
   resolves starves trust at −2/link/day until the village
   breaks — the muster must resolve or be fed. This is the
   2315 bleed's true mechanism.
3. Herald-kill consequences: killing the Herald bricks the
   titan road with no re-placement and no slain credit —
   whether re-placement or credit should exist is a design
   question, not a measurement.
4. The 2315Z muster ceiling (9/10) stands with the quota
   timing now characterized: faces adopted, ceiling closed
   by the trusted-tier trigger when it occurs.

## Closeout (main-session recovery)

The coordinator reached completion of all three arms but
hit the 7200s execution timeout before closeout: this
evidence file, the telemetry check, the tracker update,
the findings append, the memory note, and claim/lock
deletion were all unfinished. The main session recovered
them: verified the three arm merges in the log, the arm
evidence files, and zero live processes; wrote this
evidence; ran the telemetry check (refused by design, see
above); appended the tracker review and findings lines;
appended the memory note; retired the claim to .DEAD and
deleted the lock. Main tree clean at merge.
