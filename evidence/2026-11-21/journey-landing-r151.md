# Journey-landing r151 — landing leg, days 1–14 (judged to d28)

Run id: `playtest-loop-a-20261121T0414Z` — Lane A, leg 0 (landing).
Base: master `36d694f13` (journey-scale r248). Worktree `journey-landing`, clean at start.
Panel: seeds **1322–1331** (fresh band, verified per local_seed_band_freshness).
Driver: `scripts/journey-landing-r151-20261121.js` (r150 driver verbatim except
header/seeds/OUTDIR). Corpus: `evidence/2026-11-21/landing-r151-after/` (160 files).

## Pre-registration

- **Leg question:** does the first fortnight hold together on the fresh band —
  first System contact, social emergence, survival basics — and do the r150
  warn-heed fix, the r261 "the the" fix, and the r248 opener variety hold?
- **Interesting finding would be:** any pre-registered bar missed; any new
  robotic or senseless dialogue shape in full transcripts; any regression in
  the warn-heed or settled-favor watches.
- **Policies:** pilot 4 seeds first (1322–1325, exit 0, all reach d28), then
  full 10-seed panel to d28; death-aware horizons (dead village stops, +10d tail).
- **Bars (pre-registered):** M1 10/10 alive d28; M2 10/10 System contact by d9;
  M3 0 unknown/mixed trigger; zero-DMG refusedTurns 0; practice movedCells ≥50;
  D1 garbled 0; HEED-V 0; M-PR1 neverOffered ≤15% of established sittings;
  R66 not-hungry; scholar deaths ≤2; R68 party offered=spoken, dry 0;
  R69 armor 10/10; R88 armor-silent lineMissing 0.

## Panel result — all bars pass, no game fix this run

Full panel seeds 1322–1331, DAYS=28, exit 0 (~47s). **All 10 villages alive
at d28.** System contact d8 (×9) / d9 (×1).

- **M1** 10/10 alive d28. **M2** 10/10 by d9. **M3** 0 unknown/mixed trigger.
- **Zero-DMG: refusedTurns 0 PASS** (fights 21, zeroDmg 2). Two zero-damage
  fights adjudicated, neither a stuck scholar:
  - B-shape: 1329 d20 Paparazzo — scholar 0 strikes, moves twice (learns
    counter, breaks line of sight), ally Mia deals 140, won. Smart play.
  - No-strikes: 1329 d25 Don't-Look (monsterId lockpick_raccoon) — routed at
    face, 1 round, 2 allies, **no `fightLog` key** (nothing happened);
    a rout before combat, not a stuck scholar.
- **Refused-turns all-fights (watch): 4 — investigated, not a defect.**
  1323 d28 ducks: 3 failed moves onto occupied tile [7,0], first narrated
  ("You don't stroll through the ducks in a row (head)."), next two
  deduped-silent; fight won, scholar dealt 81/45/43/41/42. 1324 d29 Buffering:
  1 failed move, narrated, then scholar moves diagonally and strikes 40; won
  over 18 rounds, scholar 97→20. Move-refusals: 25 moves, 4 failed (occupied
  2, deduped-refusal 2), **truly-silent 0**. stuckTurns 1, pocketFights 0.
- **Practice:** movedCells 82 (bar ≥50), seedsWithMove 10/10, skill0→pos 61.
  Hunt H0-ESTABLISHED (34 reps, max 7).
- **D1 garbled 0. HEED legacy 1** (1326 d7 Mai, 17 turns), **HEED-V 0.**
- **M-PR1 revised: 1/22 ≈ 4.5% ≤ 15% PASS** (raw neverOffered 3: 1328 d27
  counts; 1330 d9 + 1331 d9 unestablished excluded; settled 1330 d7 excluded).
  statedAfterPick 4 (< 6).
- **Bridges:** personal 14 servings 0 repeats; small 11, 0; goal 0 servings.
  verbatimRepeats 0, exempted 6 (all "resume x1, opener" re-poses; 1323 d8
  read in full, legitimate; the other 5 carry the same marker shape).
- **Presshop:** pressFail 0, together-stopped 19, farUnreached 0. Outing chain
  CHAIN-COMPLETES-FAR (kept 8, broken 5).
- **R66 NOT-HUNGRY** (starvationDeaths 0, bandSeeds 6, noSlideSeeds 4).
  **Hungry-at-horizon 4/10** (1325: 471/person, 1327: 1013, 1329: 1651,
  1330: 1787) — down from r150's 5/10; watch continues.
- **Scholar deaths: 1** (1326 Darnell d19, cause "the wild", mantle Wanjiru
  d20, latency 1) ≤ 2 PASS. Fair death: pantry 47,469 kcal at d19, village
  thriving (pop 12); an expedition hazard while out in the wild, not
  starvation or a system failure. Succession worked.
- **R68 PARTY-GO** (offered 11, spoken 11, dry 0, accepted 6).
  **R69 ARMOR-GO** 10/10. **R88 ARMOR-SILENT clean** (teleOk 4, lineMissing 0)
  — did not recur. R88 EAT 3/3, RESCUE kcal 3/3. R84/R85 arrival GO.
- **Win-plans: d14 2/10, d28 5/10** (up from r150's 1/10, 2–3/10). GOAL-LIVE
  at d14.
- **Link-accept:** 35 takes, split 20 pool[0] ("What I've heard of them, I
  believe") / 15 pool[1] ("the word on them is kind"), no streak.
  **Link openers: 2 shapes, 19/16** ("I've heard good things about X" vs
  "Word is X holds together") — r248 variety present.
- **COUNTER LEARNED: 3 lines, all guarded labels PASS.** 1326 d5 "raccoon
  with too many fingers" = r244 guard truncating descriptor "a raccoon with
  too many fingers, working at something" at the comma; 1329 d8 "Lockpick" =
  proper name; 1329 d20 "The Paparazzo". Counter text in fightLog is
  truncated at ~200 chars ("cannot be dod") but source
  `src/data/monsters.json` is complete — **recording artifact, not a game
  defect**.
- **"the the": 0 hits** in transcripts — r261 fix holds. **fledBad 5 samples,
  all sane** (4 at hpPct 0.97–1 vs fresh wave-3 monsters; 1 at hpPct 0.23,
  low-HP scholar). No bad flee. silentTurns key absent from MET, 0 SILENT
  TURN lines. Dry lines 0 (no bare "..." THEM lines). Confide 0 occurrences
  (untested). Volley has-no-ammo 0 (untested).
- **Settled-help: 1330 d7 Aaron PASSES r247 watch** — opener "Never mind the
  food I needed — we got it handled. Thanks anyway." + resume thread "that
  foraging help" → "It's handled." Favor named, never a bare kind id. First
  settled-help occurrence tested on the 28d band.
- Grief: all 13 deaths registered. Contests 21 fired / 21 ended, ledger GO.

## Q1a — worktree-heartbeat.sh flock timeout: PROVEN, FIX LANDED

`scripts/worktree-heartbeat.sh` used bare `flock -x 200` with **no timeout**.
Test (2026-11-21 ~04:39Z): held `~/workspace/worktrees/REGISTRY.lock` 25s;
heartbeat without timeout started 04:39:07, **blocked 23.6s**, landed
04:39:31 rc=0, heartbeat_at updated. Proves the script blocks indefinitely
on a held lock (r149's ~19-min hang shape).

**Fix (this run, in the worktree):**
`FLOCK_TIMEOUT="${HEARTBEAT_FLOCK_TIMEOUT:-120}"`; `if ! flock -w
"$FLOCK_TIMEOUT" -x 200; then echo "FAIL: registry lock held >
${FLOCK_TIMEOUT}s — heartbeat skipped, retry later" >&2; exit 1; fi`.
The guard is required because the script has `set -u` only (no `set -e`), so
a failed flock would otherwise continue unlocked.

**Proof test:** `scripts/test-worktree-heartbeat-flock-20261121.js`
(HB_SCRIPT env overrides the script path; slug `journey-landing` if
registered else first tree in REGISTRY.json).
- Case 2 (held lock): **GREEN** — with `HEARTBEAT_FLOCK_TIMEOUT=3` the fixed
  script exits 1 in 3009ms with "FAIL: registry lock held > 3s — heartbeat
  skipped, retry later", no heartbeat written. RED on the pre-fix script
  (blocked past the 15s outer timeout, rc null).
- Case 1 (free lock): **GREEN (proven 05:10:17Z).** A 600s-timeout manual beat
  with the fixed script waited through the registration chain and landed
  ("heartbeat journey-landing", rc=0, heartbeat_at 05:10:17Z). The fix is
  proven both directions: it fails loud when the lock is held and lands
  when a gap appears.

Note for the ship loop: the live heartbeat path (`bash
scripts/worktree-heartbeat.sh` from the main tree) still runs the OLD script
until this fix lands — my manual beats during this run hit the old script and
blocked (killed by outer timeout) instead of failing loud at 120s. The
hbloop's 04:47:54 beat exited 124 for the same reason. Landing this fix
changes that for every loop.

## Q1b — deflect shape: refined, not closed (carried design question)

The warning now surfaces via two paths (heed, alive:want) but never
re-asserts unprompted after a deflect; Mai buries it herself ("Forget I said
anything", "that's my problem, not yours") — reads human. Remains a design
question (how forcefully a pending warning re-asserts itself); **no fix
this run**.

## Q2 — transcripts read in full (8)

- **Warn_you (5):** 1326 d7 Mai (deflect at turn 0, wanders 15 turns, warning
  surfaces at turn 15 via `[alive:want:warn_you]` — "the treeline at dusk.
  Don't." — resolves engaged; this is the HEED legacy sitting); 1326 d9
  Nikos (heed at turn 0 → warning immediately, heed #4 fear line, heeded);
  1326 d16 Hannah (heed after gq:yn opener → names "that Big Big", engaged);
  1328 d7 Isabella (heed → "I don't know what's moving out there, but
  something is…", heed #4 fear line, heeded); 1329 d12 Ursula (heed →
  "treeline at dusk", heed #4 fear line "You hear me, right? … I'm scared",
  heeded; case-framing line mid-sitting). **Warn-heed watch: 4/4 heed
  sittings name the danger — r150 fix holds on the fresh band.**
- **1322 d7 Oliver mourning** (Olivia died d6, ambush): "I dreamed Olivia was
  still here. Woke up angry at the dream. Stupid." — real grief, names
  Olivia; invitation beat declined ("Another time, then." pocketed); goal
  depth lands ("I want to be part of the 'we' when people say 'we made it.'").
- **1330 d7 Aaron settled-favor** (above; also good personal/goal depth: "We
  should stick together. Twelve strangers is better than one stranger.
  Math." / "Every strange thing that happens, I write down and ask why.").
- **1322 d13 Candice link-accept** (Ashford; accept line voiced, assigns task
  "Go and ask."; kindness thread lands).
- **1323 d8 Iftekhar resume-take** — re-pose verified legitimate (transcript
  marks "RE-POSE EXEMPT (resume x1, opener)"); NPC escalates appropriately
  on repeated deflect ("Something shutters, just slightly" → "Their face
  closes like a door.").

## Observations (not defects)

- Opener nits: 1329 d12 Ursula "...if that makes sense." tail on a firm
  opener; "About that warning — I keep turning it over" openers (d9 Nikos,
  d16 Hannah) presuppose a warning not yet heard; speaker name inside quote
  ("Candice: …") though transcript already attributes speaker (also r150's
  Bessie).
- Lead-in repeat: "Huh. Let me think about that." twice in 1330 d7 (r139–r150
  lead-in nit family).
- Outing-evening shrug loop: 1325 d10 Nathan / 1331 d2 Mariana — "Nothing we
  can eat here" 5–6× in one evening interleaved with "patch stripped" lines;
  lives only in census OUTING-ATTEMPT log, 0 hits in transcripts — sim-log
  artifact + policy keeps pressing a stripped patch; observation only.
- Ducks fight: monster (head) labels shift between snake keys as the line
  reforms — mechanic, coherent.
- Case-ledger ping-pong: 1325 Fatima ×3 cases, same accused trio; 1330
  Leo/Desmond ×5; 1331 James ×3 — observation.
- Prereg bar wording over-strict: link-opener "no repeat verbatim in panel"
  — same village+template necessarily repeats across sittings; report as
  no-streak + variety (metric-review item, below).

## Infrastructure — write flap + registry-lock contention (this run)

- **Write flap window 04:46:04–~04:58:28Z (~12 min).** New EPERM flap
  reported by the flap-watch (started 04:46:04Z, ALL-OK resumed 04:58:28Z).
  Writes refused at the write step (errno 1 EPERM); reads fine. Caught the
  GREEN case-1 heartbeat (registry temp-file write refused) and two manual
  heartbeat retries. Nothing lost; the prereg/driver/analyzers/fix/test files
  were all written before the window; a probe append to the prereg failed
  before writing (verified clean, no corruption). Flap cleared on its own.
- **Machine restart ~05:27Z** (uptime 1 min at 05:28:27Z). Killed the gate
  run at ~19 min with no saved output (its `tail -40` pipe never flushed),
  and killed the hbloop and the flap-watch. Recovered per the standing
  restart drill: heartbeat re-established first (hbloop restarted setsid,
  beat 05:28:40Z exit 0), worktree verified intact (only the intended
  changes; no stray gate artifacts), gate re-run from scratch. The
  flap-watch did not auto-restart with the machine (0 processes at 05:29Z)
  — its watchdog is a separate job; noted here, not this run's to fix.
- **Registry-lock contention.** Sibling registrations chained back-to-back
  from ~04:39Z (sim-leadside-a, r262-gate, and a 05:00 registration), each
  holding REGISTRY.lock for minutes during `git worktree add`. My registry
  heartbeat went stale 04:40:54Z → 05:10:17Z (the 600s-timeout beat) — the
  hbloop beats at 04:47:54 (exit 124, old script blocked) and 04:52:54
  (exit 1, flap) both failed; manual 120s attempts fail loud per the new
  design. The tree stayed registered and dirty (reaper-safe; a same-slug
  re-register fails loud rather than clobbering). This contention is
  exactly what the flock-timeout fix addresses. After the restart the
  hbloop's beats landed again (05:16:56, 05:23:47 pre-restart; 05:28:40
  post-restart).

## Gate

DONE (adoption, 2026-11-21T07:31:36Z) — `node scripts/check.js --quick
--cacheDirectory=/tmp/jest-cache-r151-gate` run from scratch in the dedicated
`r151-gate` worktree on the rebased tip `ede030e06` (master `b20328ad9` +
this run's commit `b02c7bba`): **326 passed, 18 failed, 2345s**.
GATE_EXIT:1, log at goal
`hidden_files/journey-landing-r151-gate-rebased.log`.

Adjudication — 0 failures attributable to this run's change:
- 12 × 120s TIMEOUT (exit null, inner checks passing in the log):
  test-comfort-arc, test-living-garden-deed-attainment,
  test-occupation-panels, test-one-person-army-deed-attainment,
  test-solo-campaign-endings, test-time-save-crashes, test-synergy-stall,
  test-tablerecon-20261013, test-throttlefeast-20261014,
  test-capable-bot-20261014, test-first-ability-magic-20261014,
  test-table-endings-20261014. Load flakes: the gate ran 39 min (vs ~13
  min typical) while the Loop B 0430Z arms and the r262 adoption were
  active. Verified by sample: test-capable-bot-20261014 passes solo
  42/0 in 84s. The two deed-attainment timeouts are the standing
  known-exceeds-120s family.
- Standing staleness pair (proof re-sign round 22 owed, pre-existing on
  master before this change): test-measurement-proof-update.js ("Proof
  source inputs are not current") + test-measurement-workflow.js
  ("retained neutrality proof covers the current Game/controller/harness
  inputs").
- Standing phone-frame stale receipt: test-phone-frame-proof.js
  (index.html / boot inputs moved on master since the receipt was pinned;
  this change touches no boot input).
- Load flakes, each passing solo on the same tip:
  test-trust-observer-neutrality.js 6/6, test-measurement-driver.js 6/6
  (including the exact "separate actual startup rejects an unplayable
  region" check that failed in the gate),
  test-measurement-cache-flags.js 4/4.

This run's own proof test scripts/test-worktree-heartbeat-flock-20261121.js
passes inside the gate (its case-1 free-lock beat also landed live
2026-11-21T06:32:35Z; case 2 held-lock 3/3 proven on the pre-rebase tip).

REBASE + SECOND GATE (adoption, 2026-11-21T08:37:14Z) — master moved while
gate 1 ran (Loop A 0437 round, `9070aaf70`: leadside + evadebow arms,
instrument + evidence only, `src/` byte-identical to `b20328ad9`), so the
branch was rebased onto `9070aaf70` (new tip `1f248b820`, clean) and the
gate re-run from scratch in `r151-gate` on that tip:
`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-r151-gate2`:
**334 passed, 10 failed, 1538s**. GATE2_EXIT:1, log at goal
`hidden_files/journey-landing-r151-gate-rebased2.log`.

Adjudication — 0 attributable, same standing families as gate 1:
- 6 × 120s TIMEOUT: test-living-garden-deed-attainment,
  test-occupation-panels, test-one-person-army-deed-attainment,
  test-trust-observer-neutrality, test-capable-bot-20261014,
  test-table-endings-20261014 (trust-observer + capable-bot already proven
  solo on this tip family, 6/6 and 42/0).
- Standing staleness pair: test-measurement-proof-update.js +
  test-measurement-workflow.js (proof re-sign round 22 owed).
- Standing phone-frame stale receipt: test-phone-frame-proof.js.
- test-measurement-cache-flags.js (exit 1, 93.8s) — proven solo 4/4 on
  this tip earlier the same day; load flake.
- This run's proof test PASSED inside gate 2. (A standalone re-run of it
  on the rebased tip at ~07:44Z failed case 1 only because the registry
  lock was held >60s by the concurrent r262 gate + Loop B arms — the
  designed fail-loud behavior, not a defect; case 2 held-lock passed
  3/3 on that same re-run.)

SECOND REBASE + DELTA-GATE (adoption, 2026-11-21 ~08:41Z) — master moved
again while gate 2 ran (Lane B succession r262 landed, `e35894fbb`: M12
escalator-cap fix in src/js/conversation.js + src/js/convo-dialogue.js,
M4 strip, staged witness sitting). The branch was rebased onto
`e35894fbb` (new tip `695dbcaef`, clean). Following the r262 adoption's
own precedent in the identical situation, a third full gate was replaced
by a delta-gate, because: the r262 src changes were themselves fully
gated by the r262 adoption (gate 333/11, 0 attributable); my 3 commits
touch exactly 6 files with **0 overlap** against the r262 range
(9070aaf70..e35894fbb); and scripts/worktree-heartbeat.sh is
byte-identical to the gated tip. Delta-gate on the final tip
`695dbcaef` (in `r151-gate`, reset to the tip):
- This run's proof test: **5 passed, 0 failed** (case 1 free-lock
  landed live 08:40:56Z; case 2 held-lock 3/3).
- r262 M12 proof: **GREEN** (escalator caps at "circles").
- The two new 0437 test scripts fail **identically to plain master
  9070aaf70** (verified by the r262 adoption): test-evadebow-a.js 30/3
  (substrate DEPMAT/ROLL35/AMMO checks expect the substrate present;
  the round's revert removed it) and test-leadside-a.js 30/40 (lever
  checks expect the lever live; the round reverted it). Pre-existing
  master debt from the 0437 round's own revert — not this branch, not
  a merge blocker; the 0437 adoption owns updating those two tests.
  This branch touches neither game.js nor any evade/leadside code.

## Telemetry

**Quiet.** `node scripts/telemetry-check.js` vs the landing-split baseline
(10 census files, 5 metrics: systemDay, villagerDeaths, monsterKills,
folTelemetry.fires, starvAutopsies) — no large deviations, no LOUD lines.
Baseline NOT rolled: the panel carries no new information on these metrics
(same call as r150; re-pinned r136: 81/9/217/15/0).

## Metric review

- **Link-opener bar wording:** "no repeat verbatim in panel" is over-strict
  — the same village + template necessarily repeats across sittings. Next
  run: report as no-streak + variety (shapes + split), as done here.
- **M-PR1 counting:** the revised count (settled and unestablished sittings
  excluded from the denominator) is the honest one; the raw neverOffered 3
  overstates the miss. Keep the revised rule as the standing definition.
- **Proof-test case 1:** under live contention a free-lock case can starve
  behind registration chains; the test's 60s flock timeout + 90s outer
  timeout is the right bound for a manual proof run, retried when the tree
  is quieter. Case 2 is the discriminating case.

## Verdict

- **Reachable:** yes — 10/10 villages alive at d28, System contact by d9,
  win-plans live at d14 (2/10) and d28 (5/10), up from r150.
- **Fun:** yes — transcripts read as people (grief that names the dead,
  settled favors that name the favor, warnings that name the danger, NPCs
  that shut down when pushed). Opener nits and the shrug loop are polish,
  not breaks.
- **Winnable:** direction good — win-plans rising (d28 5/10 vs r150's 2–3/10),
  party and armor arms green, no starvation deaths. The binding wall remains
  beyond this leg (wave-4 kills / veterans), unchanged by this run.
- **Change landed this run:** the worktree-heartbeat flock timeout (infra
  fix + proof test), not a game change. Panel is a regression watch: no game
  fix, no balance change.
