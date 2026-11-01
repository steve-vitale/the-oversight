# Loop A round 1706Z — scale-onramp, 1 adopted arm + 1 new DIAG arm, merged locally pending ship

Run: fleshout-loop-a-20261101T1706Z (scheduled 10:15 CST, started 17:06Z).
Axis: scale-onramp (converging, NOT converged). Sibling Loop B live on
food-economy throughout (1543Z claim: dipslide2 + haulsize; its 1543Z
coordinator evidence landed mid-run as 1a78c5dbe, dipslide2 NO-GO +
haulsize NO-GO) — NOT touched. No game-code change in this run: both arms
DIAG only, zero src/js, no balance lever flipped, no version bump, no push.
Rotation file left at 3: convergence-directed axis work overrides the
rotation this run (same precedent as 1415Z).

## Pre-registration (coordinator, before any worker sims)

Claim written before any sims:
hidden_files/lever-claims/fleshout-loop-a-20261101T1706Z.json
(scale-onramp; arms sim-stay-a, sim-heraldarr-a). Arms chosen from the
1415Z next blanks after re-reading the tracker and the live Loop B claim:
- (1) staying/morale arm, sharpened (1415Z blank 1) — ADOPTED, not new.
  The orphaned Loop A 1555Z worker sim-stay-a had written its prereg +
  instrument but run no judged sims, with no live process and a heartbeat
  69 min stale at adoption. Its design was NOT restarted: the worker
  verified prereg + instrument matched, committed them BEFORE any judged
  sim, rebased cleanly onto current master, re-ran proofs, then ran the
  pilot. No prereg bar was changed.
- (4) Herald arrival path (1415Z blank 4) — NEW arm sim-heraldarr-a:
  wrapped proof of the follow re-entry candidate, prereg committed
  before any judged sim in its own tree.
Both arms pre-registered their own headers in-worktree BEFORE any judged
sims (stay: fe2a8f84b; heraldarr: c9f2e6620, plus a pre-pilot control
correction 0cc2eee28 and a pre-verdict instrument v2 fix 6a77456a4).
Panel §15: inapplicable — DIAG-only censuses/proofs with no before/after
intervention. No compare fabricated. The stay arm judges candidate vs its
own fresh baseline leg on identical seeds (per its prereg, the 1415Z
corpus is a yardstick, never the comparator).

## Arm sim-stay-a (adopted; rebased, merged --ff-only; proofs re-run on the rebased tip: policy 6/6, analyzer 8/8; diff guard zero src/js): PILOT-GO, CONFIRM NO-GO

Band: sortiedpr PLAYED band verbatim, 180d death-aware. Policy instrument:
holdline crew enlargement (assign up to 2 free villagers/day to patrol
after the base daily; HOLDLINE=1; no fieldFight wrap, no opts mutation —
the prereg's mechanism verdict stands: no honest policy can refuse an
engine-morale flee).

Pilot (seeds 75101–75108) — PILOT-GO, all four bars:
- G1 corpus validity PASS; det-gate (holdline-off on 75101) reproduces
  the baseline leg exactly.
- G2 staying signal PASS via two signals: a round-4+ surviving fight
  (Brian Otieno vs The Influencer, 850 HP, 93 dmg, ally Chantal joined)
  and a ≥91-HP damage conversion (Ursula Weber vs herald, 112 dmg,
  mFlee, not a Peacemaker 0-damage drive-off). DPR doubling NOT met
  (7.5 < 22); the bar needs any one signal.
- G3 death guard PASS: candidate vDie share 21.7% vs baseline 28.0%
  (−6.26pp).
- G4 sense PASS: transcripts read, quoted, judged in the arm evidence.
- Baseline drift vs 1415Z reported, fresh baseline governs: fresh
  baseline offered only 26 wave-4 fights (1415Z: 67), DPR 10 (1415Z: 11.0).

Confirm (fresh seeds 75111–75122) — NO-GO, landing case killed:
- Round-4+ surviving fights on ≥2 seeds: PASS (3 seeds, incl. an 8-round
  hold by Diana Osei).
- ≥1 ≥91-HP damage conversion: FAIL (0; the pilot's single conversion
  did not reproduce, candidate kills 0).
- Median sustained DPR ≥22: FAIL (5 — never close in either band).
- Death guard PASS (+3.55pp); corpus validity PASS.
Per prereg this is a measurement result, not a re-score: the holdline
crew layer does not earn a landing case.

Key finding — fight-level staying bought with village-level lives. The
layer fired (1,212 new patrol assignments in the pilot leg; baseline 0
as negative control; joined fights 2→26). But median survival fell
~63 days in both bands (166→103 pilot, 167→104 confirm), total deaths
rose (262→400, 470→575), and the ledger names it: "patrol combat"
deaths 0 in both baselines vs 142/176 in candidate legs. National-ever
collapsed in confirm (2/12 vs 9/12). Wave-5 reach is 0 in every leg;
the scale wall is unmoved.

Sense verdict: DESPERATE. Tarek's death is mixed (an awful empty-sling
line, then one silent arithmetic kill line); Nompumelelo's too-late-
answered shout and Brian's "not volume, a promise" War Cry hold read as
genuinely desperate. The confirm round-8 transcript (Diana working the
trick while ally Hang goes down beside her) is quoted as observation.
Field-death narration noted as observation only, not chased.

Secondary ammo census (backlog #1718): dryness persists on the current
base — pilot candidate 20/30 ammo-needing fighters dry, 18 of them having
departed before the fight (departure pocketing not converting pile stone
into carried ammo); pile means (stone 250–417) are not the constraint.
Confirms sim-ammo-a without re-litigating it.

Arm evidence: evidence/2026-11-01/sim-stay-a.md + corpus
evidence/2026-11-01/sim-stay-a/{baseline,candidate,holdline-off}/.

## Arm sim-heraldarr-a (rebased, merged --ff-only; proof re-run on the rebased tip: synthetic 25/25, synthetic + corpus legs 92/92; diff guard zero src/js): INSUFFICIENT-DATA (arrival episode)

Question: can a villager who has followed a Herald arrive via the follow
re-entry path at Haven (the 1415Z (4,4) arrival candidate)? The arrival
episode did not occur on this pilot at all, so the candidate is neither
proven nor refuted as the (4,4) arrival path. What IS proven: the follow
mechanism itself, plus a code-level constraint that rules follow out as
a safe-tile landing in general.

Prereg bars vs pilot (seeds 95301–95308, contact-gated):
- 8 complete pilot seeds, capture errors 0: PASS (8/8 JSONs, 0 errs).
- Contact gate (≥1 seed with a Herald contact): FAIL — 0 contacted, 0
  scholar + 0 villager contacts → per prereg INSUFFICIENT-DATA, no
  confirm band (neither pre-stated live-signal condition holds: 0 herald
  follow-enter, 0 contacted seeds).
- Follow classification on 100% of from-tile-monster travelTo calls:
  PASS — 1,049 classified, 0 tracked-herald mismatches (followEnter 228,
  followHoldSafe 274, followBlockedOccupied 109, oldMonsterNotFollows
  384, noTravel 54).
- Every herald tile change recorded or UNATTRIBUTED: PASS — 5/5 change
  windows attributed (1 spawn + 4 wander), 0 unattributed.
- Every haven-tile arrival window listed: PASS as a reported zero —
  0 windows, no landing class to name.
- Controlled leg green: PASS (8/8 steps) — follow-enter onto a non-safe
  tile fires for the Herald ("It followed you. The sky is here.");
  follow-hold onto safe Haven fires (unchanged + "The sky stops at the
  treeline…"); follows:false control (gallowdeer) does not follow.
- Neutrality (ON vs OFF end fields) PASS on 95304 (prereg choice rule:
  first contacted seed if any, else 95304). Determinism PASS, stronger
  than allowed: 95303 re-run byte-identical. Proof test green: PASS.
- Sense-test DONE: follow/hold lines are player-readable (event + cause
  named); the pilot's Herald story is silence (lair line, then 9 days of
  southward wandering, run ends).

Two corrections to the 1415Z phrasing, confirmed at runtime: (A) follow
re-entry DOES check isSafeTile on the destination — the "without a
safe-tile check" description is incorrect; (B) the Herald's follows field
is the truthy string "it does not follow. It precedes." — fiction says
it doesn't follow, code treats it as follows=true. Consequence:
follow-enter CANNOT land a monster on a safe tile, so the heraldplace
(4,4) arrival needs a different landing step.
Raid-pin rival still suspect, not verdict: havenRaidTick can pin nearest
monsters straight onto Haven (no safe check) with lingering re-pins, but
on this pilot it never touched the Herald (raidBorn false, lingering
false, 0 pin moves on every located dawn).

Why the gate failed (structural): 5/8 seeds win via the lesser seat on
days 90–100 (over-other), censoring the titan window; the one located
Herald (95303, lair (8,4) day 81) wanders south and the run ends day 90
before any meeting. Base drift vs heraldplace's anchor (1 win / 6
located / 1 contacted there vs 5 wins / 1 located / 0 contacted here) is
reported, never pooled. Branch/line consistency: followEnter 228 =
"It followed you" 228; holdSafe 274 = treeline 274; blockedOccupied 109
= boundary 109.

Instrument v1→v2 (pre-verdict, heraldplace precedent): v1 double-counted
nested wander moves as travelOther events, breaking chain continuity;
v2 removes travelTo-diff move events, synthesizes follow legs from
travelEvents, and fixes the dawn-spawn window boundary. V2 re-ran the
same band and reproduced v1's trajectories exactly; v1 corpus is
superseded, v2 is the judged corpus.

Wall numbers (this band/stack, orientation only): won 5/8,
national/global 8/8, table 5/8, wave-4 6/8, wave-5 0/8, median survival
100d. Full seat and wave-5 fights still unshown; the wins here are
lesser-seat wins, not scale reach. #1538 remains pending and untouched.

Arm evidence: evidence/2026-11-01/sim-heraldarr-a.md + prereg +
corpus evidence/2026-11-01/sim-heraldarr-a/ + analysis JSON.

## Wall numbers (this run, both arms)

- Stay baseline legs (fresh baseline, 20 seeds pilot+confirm):
  nationalEver 16/20, nationalFinal 8/20, table 6/20, entered 4/20,
  won 4/20 (telemetry-check --sweep-rows count; see below).
- Stay candidate legs: pilot median survival 103 (baseline 166),
  confirm 104 (baseline 167); wave-5 reach 0 in every leg.
- Heraldarr band: wave-5 0/8, full seat unshown, lesser-seat wins 5/8.
- Scale-onramp verdict: CONVERGING, NOT converged. No game change
  landed, no wave-5 or full-seat reachability shown, and the one staying
  lever that moved fight-level numbers moved village survival the
  wrong way.

## Telemetry deviation check

Ran: node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-11-01/sim-stay-a/baseline/*.json' --metrics
national,table,wins,exiled --sweep-rows
Result: LOUD table −62% (baseline 16 → current 6, n=20) and LOUD wins
−75% (baseline 16 → current 4, n=20). VERDICT: EXPLAINED, regime
artifact — NOT a regression, baseline NOT rolled forward. The stored
baseline's own _regime note labels it "winseat — full win-side win
stack, ~100%-win suite" and says DO NOT compare pre-seat / courtship /
readiness substrates against it ("wins are structurally ~0 there and
telemetry-check will fire a spurious LOUD 'wins disappeared'"). The stay
baseline legs run the sortiedpr PLAYED band, where wins are
structurally low (1415Z: won 1/8, table 3/8) — the LOUD lines are that
forbidden comparison, not a change in the game. The heraldarr corpus was
not fed to telemetry-check: it is a position instrument, not per-seed
telemetry rows (same precedent as the 1235Z titangate and 1415Z
heraldplace refusals).

## Metric review

No metric was re-scored mid-run. Stay judged exactly against its prereg
header (pilot GO, confirm NO-GO); heraldarr judged exactly against its
prereg header (contact-gate fail → INSUFFICIENT-DATA, no confirm spend).
Two metric notes for the NEXT run, both from the arms, neither applied
retroactively: (a) the stay confirm round-4+ bar counts survival
without damage (a 0-damage hold qualified — future bars should require
damage); (b) the stay DPR bar is miscalibrated for a staying lever
(it needs a damage lever, not a staying one). No panel compare was
produced and none is claimed: both arms are DIAG-only.

## Blanks filled or documented

Filled (measured): (a) holdline crew-enlargement verdict — pilot signal
real, confirm fails, village-level cost lethal (patrol-combat deaths
0→142/176); (b) follow mechanism + safe-tile hold proven in controlled
legs; (c) follow re-entry safe-tile correction + truthy-string follows
value; (d) ammo dryness re-confirmed on the current base (#1718).
Documented (open, not chased): (1) Herald (4,4) arrival still needs a
landing step that is not follow-enter — raid-pin is the named suspect,
unproven; next arrival arm needs a band with long runs (wins past day
120) so Herald episodes actually occur, must reuse the v2 instrument,
and must wrap raid-draft selection itself so a non-draft is
distinguishable from a draft-that-missed; (2) field-death narration
blank (observation only); (3) #1538 steve-call still pending; (4)
#1619 late wave-4 + fast lesser win and #1595 Herald HP drop remainder
(350) remain open, untouched by this run.
Findings-backlog appends: the patrol-combat cost, the follow safe-tile
correction, and the arrival-band censoring note are recorded in the
backlog file separately by the coordinator (see run note).

## Incident notes

- Orphan adoption: the 1555Z stay worker's tree was taken over only
  after verifying no live process, no file activity since 16:21Z, and a
  69-min-stale heartbeat; its prereg and bars were adopted verbatim.
  Sibling Loop B trees (dipslide2/haulsize, then dipslide3/multisweep)
  and journey trees were never touched.
- Master moved during landing, twice: Loop B's 1543Z coordinator evidence
  + a ship version bump, then the stay merge itself ahead of the
  heraldarr merge. Both worker branches were rebased in their own
  worktrees (clean, no conflicts) and proofs re-run on the rebased tips
  before --ff-only merges. Merges verified alone before any chained
  release/remove step, per the 1235Z lesson.
- Safe-commit index clobber struck worker commits in both arms and was
  repaired each time via --add --cacheinfo from HEAD blobs; all commits
  verified correct, both worktrees clean at release, main tree clean
  after merges.
- No check.js --quick claim is made: arm proofs are the run's
  verification and are green on merged master.

scale-onramp stays converging (NOT converged): the staying lever and the
Herald arrival mechanism are now both decomposed further, but no game
change landed and no wave-5 or full-seat reachability is shown.
food-economy untouched (sibling Loop B lane).

Coordinator evidence: evidence/2026-11-01/sim-scale-onramp-round-1706.md
(this file). Claim deleted; lock deleted. Merged locally, pending ship.
