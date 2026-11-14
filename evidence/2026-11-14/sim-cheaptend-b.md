# sim-cheaptend-b — EVIDENCE (BUILD arm: cheaper tend — engine drive gate 20k → 10k)

Run: fleshout-loop-b-20261114T1808Z (Loop B, adoption worker completing the
interrupted arm of run fleshout-loop-b-20261114T1557Z)
Axis: winnability chain. BUILD arm — game-code cheaper tend, the HOLDING
lever after scaleclimb. One game-code change only.
Branch: sim-cheaptend-b — worktree ~/workspace/worktrees/sim-cheaptend-b
Base: master f524932d6 (branch base; master has since moved to dcae77800 —
see G3 note). Prereg: evidence/2026-11-14/sim-cheaptend-b-prereg.md
Date: 2026-11-14

## VERDICT: NO-GO (evidence-only — do NOT merge)

G2(a) absolute bar MISSES BY ONE DAY: median held-days armed 44 vs the
pre-registered ≥45, even though ever-counted is 8/8. The marginal half
passes decisively (pooled held-days 465 vs 322, +143; median 44 vs 31.5;
ever-counted 8/8 vs 7/8) and the cost bar passes cleanly (zero starvation
deaths armed), but the prereg requires BOTH halves — a miss on either half
is NO-GO, never re-scored mid-run. Per the prereg, a borderline pilot gets
NO 12–16 seed confirm to rescue it; the confirm is licensed only on a
clear GO. This is reported as-is. The gate cut is killed with the numbers
that killed it; the next arm on this axis is the pantry-first hold or the
national-beat answer, not a re-measure of the gate.

- G1 instrument validity: PASS (0 errors, 0 unattributed dip points,
  0 unclassified links, 16/16 configs captured).
- G2(a) absolute: NO-GO — ever-counted 8/8 ✓, median held-days 44 < 45 ✗.
- G2(b) marginal: PASS — ever 8 ≥ 7 ✓, median 44 > 31.5 ✓, pooled
  465 ≥ 362 ✓.
- G2 overall: NO-GO (both halves required).
- Cost bar: PASS — starvation total armed 0 ≤ 6 ✓, arm-only starvation
  deaths 0 ≤ 4 ✓, median survival armed 147.5d ≥ 112.4d ✓.
- Guardrail (§14c): PASS — no seed's armed villager combat deaths exceed
  its baseline leg by >50% (worst +13.9% on 93214; armed total 490 vs
  baseline 517 — fewer combat deaths armed overall).
- G3 lever-only: PASS-with-owed-proof-refresh — exactly one src/js change
  vs the branch base (hierarchy.js only) + the stated test update; proof
  §2 gate 6/6 and §3 recorder 11/11 green; §1 static 31/32, the single
  fail being the G3 check's comparison against current master, where the
  ship loop has since bumped src/js/build.js (see G3 note). check.js
  --quick adjudicated below: 325 passed / 15 failed, every failure in
  {proof-staleness, base drift, load timeout} — none attributable to the
  lever. The measurement-proof refresh rides the next round (round 18
  becomes owed on landing, fusionoffer precedent).

## The lever, in plain words

Haven's villages answer their own mail through a daily engine drive that
tends each allied village once a week — but only when the pantry holds
more than 20,000 food-energy. On thin-pantry villages the pantry sat at
4–12k most days, so the drive almost never tended: on the baseline leg it
was blocked 1,820 times and tended only 48 times. This arm cut the bar
to 10,000 — still enough food left over after a full round of tending
that the village can't tend itself bare. The change lives inside a hook
that is OFF by default in the shipped game; both pilot legs ran with it
switched on, so the test proves the 10k value for whenever the drive
ships, not a flip of the drive itself.

## Before / after (identical seeds 93211–93218, 150d death-aware, competent-scaleclimb-b both legs, ANSWERMAIL_DRIVE=1 both legs)

| metric | baseline (20k gate) | armed (10k gate) | bar | pass? |
|---|---|---|---|---|
| ever-counted (polity ever stood) | 7/8 | 8/8 | ≥6/8 (a) / ≥7 (b) | ✓ / ✓ |
| median held-days (days diplomacy > 0) | 31.5 | 44 | ≥45 (a) / >31.5 (b) | ✗ / ✓ |
| pooled held-days | 322 | 465 | ≥362 (b) | ✓ |
| end-state diplomacy > 0 (reported, never the judge) | 3/8 (median 0) | 7/8 (median 102) | — | — |
| drive tends paid | 48 | 264 | — | — |
| drive tends blocked by pantry | 1,820 | 690 | — | — |
| gate-window tends (paid on 10–20k pantry days) | 2 | 192 | — | — |
| engine tends (all channels) | 99 | 498 | — | — |
| policy tends | 53 | 51 | — | — |
| starvation deaths (total) | 4 | 0 | ≤6 | ✓ |
| median survival | 140.5d | 147.5d | ≥112.4d | ✓ |
| villager combat deaths (total) | 517 | 490 | guardrail per seed | ✓ |
| links seasoned (median) | 3 | 3 | — | — |
| instrument errors | 0 | 0 | 0 | ✓ |
| unattributed dip rises / falls | 0 / 0 | 0 / 0 | 0 | ✓ |
| unclassified links | 0 | 0 | 0 | ✓ |

Per-seed table (held = held-days; ever = polity ever stood; dipEnd =
end-state diplomacy; starv = starvation deaths; vCD = villager combat
deaths; dT/dB = drive tends / drive blocked; gW = gate-window tends):

| seed | leg | days | end | held | ever | dipEnd | starv | vCD | dT | dB | gW | polity bar day |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 93211 | baseline | 132 | lost | 0 | n | 0 | 0 | 83 | 8 | 126 | 1 | — |
| 93211 | armed | 111 | lost | 45 | Y | 102 | 0 | 52 | 19 | 66 | 16 | 67 |
| 93212 | baseline | 150 | survived | 110 | Y | 102 | 0 | 70 | 16 | 245 | 0 | 42 |
| 93212 | armed | 150 | survived | 110 | Y | 102 | 0 | 78 | 51 | 36 | 23 | 42 |
| 93213 | baseline | 96 | lost | 8 | Y | 0 | 0 | 60 | 2 | 165 | 0 | 83 |
| 93213 | armed | 103 | lost | 20 | Y | 102 | 0 | 64 | 30 | 22 | 26 | 84 |
| 93214 | baseline | 68 | lost | 5 | Y | 102 | 0 | 79 | 2 | 55 | 0 | 64 |
| 93214 | armed | 149 | lost | 22 | Y | 0 | 0 | 90 | 11 | 187 | 5 | 63 |
| 93215 | baseline | 105 | lost | 63 | Y | 136 | 2 | 56 | 12 | 239 | 0 | 42 |
| 93215 | armed | 150 | survived | 110 | Y | 136 | 0 | 43 | 55 | 156 | 52 | 42 |
| 93216 | baseline | 150 | survived | 73 | Y | 0 | 0 | 52 | 3 | 381 | 1 | 61 |
| 93216 | armed | 150 | survived | 43 | Y | 102 | 0 | 53 | 45 | 109 | 43 | 109 |
| 93217 | baseline | 149 | lost | 47 | Y | 0 | 1 | 61 | 3 | 300 | 0 | 59 |
| 93217 | armed | 146 | lost | 98 | Y | 102 | 0 | 63 | 42 | 51 | 25 | 48 |
| 93218 | baseline | 150 | survived | 16 | Y | 0 | 1 | 56 | 2 | 309 | 0 | 51 |
| 93218 | armed | 80 | lost | 17 | Y | 136 | 0 | 47 | 11 | 63 | 2 | 64 |

Reading the seeds: the lever did what it was built to do — drive tends
paid on 192 previously-blocked pantry days (vs 2), and five seeds hold
much longer (93211: 0→45 days, 93215: 63→110, 93217: 47→98). The
one-day miss turns on two seeds. 93216 is the inversion: the armed leg
formed its polity 48 days later (bar day 109 vs 61) and held 43 days
against the baseline's 73 — more tends did not mean an earlier polity,
because changing the gate changes what happens downstream and the same
seed no longer plays the same village after the change point. 93218
held about the same (17 vs 16) but the village died at day 80 instead
of surviving 150 — with FEWER combat deaths armed (47 vs 56), so the
earlier death is not more fighting; it is the same chaotic divergence.
The median of [17, 20, 22, 43, 45, 98, 110, 110] is 44 — one day short
of 45. That is within noise, and the prereg still binds: NO-GO stands.

## Wall numbers (national / table / wins, wave 4–5 unlocks, median survival)

| | baseline | armed |
|---|---|---|
| national | 0/8 | 0/8 |
| table | 0/8 | 0/8 |
| wins | 0/8 | 0/8 |
| wave 4 unlocked | 8/8 | 8/8 |
| wave 5 unlocked | 2/8 | 2/8 |
| median survival | 140.5d | 147.5d |
| first regional day (median) | 32 | 32 |

The scale wall stands. But the national 0/8 is NOT a holding failure —
it is a POLICY ARTIFACT, and this arm proves it. The First Court beat
(the national invitation) STAGED on 15 of 16 configs and sat unanswered
for 4–89 days each — nationalPendingDays per seed: armed
44/89/19/86/89/41/84/15, baseline 0/89/12/4/43/89/87/89 — because the
recovered scaleclimb policy counts a pending national beat but never
calls `answerNationalChoice` (0 calls on all 16 configs), and while one
is pending it proposes nothing (proposeBlockedPending ==
nationalPendingDays on every seed). The polity held; the court came; no
one in the room answered the invitation. The holding question is now
moot until a policy plays the beat — the next arm on this axis should
answer the First Court (or the holding work keeps measuring a door
nobody opens). Filed in the findings backlog (this extends the
scaleclimb entry on unanswered beats throttling late proposing).

Wave-5 note: the same 2 seeds unlock wave 5 on both legs (93212
baseline / 93214 armed swapped — chaotic divergence again, not a lever
effect). Wave-4 kills per seed are healthy (1–8); the winnability
chain's binding link remains the wave-4→veteran→readiness→wave-5→seat
road past the polity, not the holding itself.

## Village assessment (plain words)

Eight villages, same eight starting villages on both sides of the cut.
Before the cut, Haven's friendships kept dying of neglect: the drive
that was supposed to look after them was locked behind a pantry bar the
villages almost never cleared, so links seasoned and then quietly
un-seasoned while the pantry sat at 10k and the drive counted another
blocked day. After the cut, the villages actually get looked after —
264 tends paid instead of 48, and on seven of eight seeds the realm is
still standing at the end of the run where before it had already
dissolved (end-state diplomacy positive on 7/8 armed vs 3/8 baseline).
Nobody starved for it: zero starvation deaths armed against four
baseline, and the villages lived slightly longer on average. The
villages that died still died fighting — combat is still the killer
(490 villager combat deaths armed, 517 baseline) — but the friendships
outlasted the fighters more often than not. What the villages still
cannot do is take the next step: every one of them was offered the
national court and none of them answered it, so the realm stays a
regional pact no matter how long it holds. The blank this arm filled
is the tend gate; the blank it exposed is the unanswered court.

## Sense-testing (SENSE-TESTING LAW)

Quoted from the captured lines (armed leg). The early accord and tend
lines read like played relationships, with named answerers and
remembered gifts:

- d11, 93211: "⛓️ Judith brings it home: Haven bows to Thornfield — one
  organization, them primary. Tribute: 5,000 kcal/week. The
  relationship starts at trust 30. Everything from here is earned."
- d11, 93211: "🌾 Haven sends 1,500 kcal of grain to Emberhold's fire —
  not tribute, the other way around. Someone's grandmother over there
  will remember who fed her. (Trust +8.)"
- d11, 93213: "🏃 Wren of Stonebridge walks into Haven unannounced,
  pack-mules behind. 'Heard your bins are echoing. Stonebridge has
  grain to spare — 2,602 kcal, no tribute, no ceremony. Say the word.'"
- d12, 93212: "Three fires bow to Haven. But a realm isn't leverage —
  it's seasons. These bonds are young; tend them, keep the trust, and
  the court will come." (The court DID come — and sat unanswered; see
  Wall numbers.)
- d14, 93211: "🗣️ Word with the traders: Emberhold sent another fire
  grain when their stores ran thin — no tribute, no ceremony, just food
  on the road. That's a thing villages DO now."

Judgement: the formation and tending read as relationships, not meters
— gifts are remembered, neighbors arrive unannounced with grain, the
game says the court will come. The incoherence is downstream: the court
comes and nobody answers, and the holding then has no played line at
all. Recorder limit, stated (already in the findings backlog from
scaleclimb): the 150-line say cap fills by ~day 14 with early chatter,
so NO late polity-holding or dissolution line is captured on any seed —
the holding is judged from the numbers via the dip-decrement tracking,
not from a played line. The numbers' attribution is complete (0
unattributed rises/falls), which is what closes that gap for this arm.

## Balanced panel (§15)

Pseudo-panel compare per the prereg's stated route (the real
`scripts/balance-panel.js` compare cannot judge a policy/game-code
contrast — both panels must carry identical options.policies and
identical policy/harness sources; a changed src/js invalidates the
compare). Built with scripts/build-cheaptend-panels-20261114.js from
the driver's per-seed JSONs (pseudo-policy 'cheaptend' in both panels;
case identity is the seed): evidence/2026-11-14/cheaptend-panel.json /
cheaptend-panel.md (+ -before/-after .json.gz pair). Decision:
**review_required**, 8 paired cases, no material signal on any contract
metric (table win rate 0→0, national access 0→0, village deaths/run
73.6→72.1, community loss 0.625→0.625). The panel is the instrument;
the pre-registered G2 bar is the judge. The panel agrees with the
verdict's shape — nothing moved on the contract metrics — while the
driver's identical-seed numbers (held-days, gate-window tends) carry
the actual lever read.

## Telemetry deviation check

Attempted per the loop body:
`node scripts/telemetry-check.js --baseline
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/scale-wall.json
--current 'evidence/2026-11-14/perseed-cheaptend-b/*.json' --metrics
national,table,wins,exiled` — REFUSED by design (exit 2, logged in
evidence/2026-11-14/cheaptend-telemetry-check.log): "refusing
recorder-corpus input: all 16 --current rows carry top-level
anchorCommit, so they are sweep recorder rows, not runs. Recorder
corpora are compared with sweep-compare tables, never against a run
baseline here." Baseline NOT rolled. No LOUD line to investigate; the
refusal is recorded, not waived.

## Proof test + check.js --quick adjudication (G3)

Proof test scripts/test-cheaptend-b-20261114.js, re-run post-change
with --game (evidence/2026-11-14/cheaptend-proof-postchange-adopt.log):
§1 static 31/32, §2 gate 6/6, §3 recorder 11/11. The single §1 failure
is the G3-static check comparing src/js against CURRENT master: the
ship loop bumped src/js/build.js (version stamp only) on master after
this branch's base f524932d6. Against the branch base the src/js diff
is exactly hierarchy.js (13 insertions, 2 deletions — the named
constant + the gate line + comments). On the landing rebase the check
will pass (build.js will match master). The pre-change failing control
was recorded by the dead run (15k-paid + gate-value assertions fail on
old code) and the post-change run is green on those same assertions.

check.js --quick, run to completion in the tree
(evidence/2026-11-14/cheaptend-check-quick.log): **325 passed, 15
failed in 2143s.** Every failure adjudicated by name:

- Proof-staleness family (expected — the hierarchy.js change stales
  retained measurement proofs; refresh rides the next round, round 18
  owed on landing):
  - test-measurement-proof-update.js — "Proof source inputs are not
    current" (the documented fusionoffer precedent).
  - test-measurement-workflow.js — "retained neutrality proof covers
    the current Game/controller/harness inputs" (same family: Game
    changed, neutrality proof input hash stale).
  - test-measurement-cache-flags.js — 0/4, failing at its first
    sub-check ("both actual CLI configurations complete valid neutral
    panels"); re-run standalone, still 0/4
    (evidence/2026-11-14/cheaptend-cacheflags-standalone.log). Per
    the 2026-11-12 AGENTS.md lesson this test tracks box load, and
    the box was loaded (a second full check.js --quick from the
    sibling loop ran concurrently the whole time); the failing first
    sub-check is the same neutrality-proof staleness. Not a lever
    finding — the discriminating pristine-vs-fix A/B on a quiet box
    rides the proof refresh.
- Base drift (pre-existing on this base, not caused by the lever):
  - test-phone-frame-proof.js — retained phone receipt stale against
    index.html (and foreignSpeech/regions/statusEffects/table-endings/
    abilityActions inputs). index.html changed 140 lines between the
    branch base f524932d6 and current master; hierarchy.js is not
    among the stale inputs.
- Load timeouts (10 scripts, all exit null at exactly the 120s
  check.js cap, ZERO failed assertions in any of them — several show
  passing assertions before the cap, e.g. occupation-panels 5 ok,
  solo-campaign-endings 10 ok): test-living-garden-deed-attainment,
  test-occupation-panels, test-one-person-army-deed-attainment,
  test-solo-campaign-endings, test-time-save-crashes,
  test-trust-observer-neutrality (child 60s timeout under load —
  bare Error from spawnSync, no assertion failed), test-synergy-stall,
  test-throttlefeast-20261014, test-capable-bot-20261014,
  test-first-ability-magic-20261014, test-table-endings-20261014.
  Spot check: test-capable-bot-20261014 run standalone passes 42/0
  (evidence/2026-11-14/cheaptend-capablebot-standalone.log) — the
  cap, not the code, failed it. A second full check.js --quick
  (journey-scale, pid 16914) ran concurrently for the whole of this
  run on a 1.5-CPU box.
- No failure outside {proof-staleness, base drift, load timeout}.
  Nothing here is attributable to the 10k gate.

## Metric review (§14)

- Did G2 measure the lever? Yes — and the lever's real effect size is
  now measured: median held-days +12.5 (31.5→44), pooled +143
  (322→465), gate-window tends 2→192. The absolute bar (≥45) was set
  against scaleclimb's 14.5d median, but the drive-on control itself
  already reached 31.5 — so the bar sat only 13.5 above the control
  while the lever delivers ~12.5. The bar was not wrong, but it was
  tight against the control; the one-day miss is within noise (one
  seed's late polity formation flips it). NO re-scoring: the NO-GO
  stands, and the next run decides whether to retest the gate on a
  fresh band or move on — the prereg licenses a confirm only on a
  clear GO, and this is not one.
- Did the drive-on baseline meet the absolute bar on its own? No —
  baseline median 31.5 < 45 — but it met 70% of it, which is why the
  marginal half (not the absolute half) was the discriminating judge
  in practice. The marginal half passed decisively; the absolute half
  is what killed it.
- Did the cost bar's arm-only clause collapse to zero-tolerance? No —
  armed starvation deaths were 0 (baseline 4), so the clause never
  bound. The clause is sound as written.
- Did the dip-decrement/episode tracking close the scaleclimb G1 gap?
  Yes — 0 unattributed rises, 0 unattributed falls, 0 unclassified
  links on all 16 configs (scaleclimb had −408 unattributed). G1
  passes cleanly.
- End-state diplomacy as a secondary read: armed median 102 vs
  baseline 0 (7/8 vs 3/8 positive at end) — the held-days metric may
  understate the effect, since armed polities are more often still
  alive at the horizon. Reported, never used as the judge.
- Instrument note: the proof test's G3-static check compares against
  current master, not the branch base — on a branch whose base has
  drifted behind master it fails on the ship loop's version stamp
  alone. Future arms should compare against the merge-base (or the
  landing rebase, which resolves it).

## Adoption notes (run continuity)

Adopted from the dead run fleshout-loop-b-20261114T1557Z. Verified from
the tree, never from a worker claim: baseline corpus written 17:10–
17:22Z, BEFORE the hierarchy.js edit at 17:24:43Z, so the baseline ran
on old code (20k gate) — baseline stands, not re-run. Recomputed
baseline from the analysis JSON: pooled held 322, median 31.5,
ever-counted 7/8, median survival 140.5d, starvation 4, drive blocked
1,820, wave-5 2/8, national/table/wins 0/8. The dead run's
cheaptend-check-quick.log was inconclusive (1 line, killed mid-run);
re-run to completion here. Worktree heartbeat at start: OK
(HB_EXIT=0). Registry-lock contention heavy today; heartbeats queue
minutes — normal, nothing forced.

## Convergence state

BUILD — NO-GO against G2 (absolute half misses by one day; marginal
half passes; cost bar passes). No confirm licensed. The 10k gate value
is NOT licensed for whenever the drive ships. Next arm on this axis:
pantry-first hold (sibling arm sim-holdpantry-b) or the national-beat
answer — the First Court sits unanswered, and until a policy plays it
the holding work measures a door nobody opens. Axis line updates from
this run's numbers only.

## Files

- Prereg (committed 18a646516):
  evidence/2026-11-14/sim-cheaptend-b-prereg.md
- Instruments (committed 691d8f671): recovered scaleclimb policy
  scripts/policies/competent-scaleclimb-b.js (byte-identical to
  29a794df6), driver scripts/cheaptend-driver-20261114.js, analyzer
  scripts/analyze-cheaptend-b.js, panel builder
  scripts/build-cheaptend-panels-20261114.js
- Judged lever: src/js/hierarchy.js (ANSWERMAIL_TEND_PANTRY = 10000)
  + scripts/test-answermail-drive-a.js (gate assertion 20k→10k + new
  15k-pays test)
- Proof: scripts/test-cheaptend-b-20261114.js (+ logs
  cheaptend-proof-prechange/postchange/postchange-adopt)
- Per-seed corpus: evidence/2026-11-14/perseed-cheaptend-b/ (16
  files) + smoke evidence/2026-11-14/perseed-cheaptend-b-smoke/
- Analysis: evidence/2026-11-14/cheaptend-b-analysis.json
- Panel: evidence/2026-11-14/cheaptend-panel.{json,md} (+
  -before/-after .json.gz)
- Logs: cheaptend-b-pilot-baseline.log, cheaptend-b-pilot-armed.log
  (+ .err), cheaptend-b-analyzer-armed.log, cheaptend-panel-build.log,
  cheaptend-telemetry-check.log, cheaptend-check-quick.log,
  cheaptend-cacheflags-standalone.log,
  cheaptend-capablebot-standalone.log
- This evidence file: evidence/2026-11-14/sim-cheaptend-b.md
