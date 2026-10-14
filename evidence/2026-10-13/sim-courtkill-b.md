# Scale-wall r18 arm 1 — COURTKILL: deliberate wave-3 hunting on the courtship road

> **⚠ CORRECTION 2026-10-14** (`evidence/2026-10-14/simulator-audit.md` §3): the dmg-audit instrument read HP *after* `tbEnd`, when a lost fight had already replaced the dead bearer, and never counted the player's strikes. Re-run corrected: **25/91 fights (27%) killed the bearer**, not 1/104; player damage was 9,491, not 0. Conclusions here that rest on "103/104 survive" are void.


Run: oversight-flesh-out-loop-b 2026-10-13T20:45:42Z, arm 1 (courtkill). Worktree: ~/workspace/worktrees/sim-wavekill-b.
Axis: scale-onramp (blocking). Canon: docs/CANON.md, docs/MONSTER-WAVES.md read first. No game-code changes — policy-side lever + tooling only. Highbeam Deer untouched; no monster stats touched.

## Context (r17 tablerecon finding)

The wave-4 unlock gate is a TWO-RUNG bind — 0/16 runs met both rungs:
- Rung 1: 4 wave-3 ledger kill points (kills only, per-type cap 2) — 0/8 on the courtship road (leadcourt/belongseek). The policy flees every wave-3 fight at fight start (legacy `outmatched`: 240-420 HP wave-3 monster vs ~120 maxHp scholar trips `totalMhp > 2.5*pmax`) and again at 35% HP mid-fight — the ledger never sees a wave-3 kill.
- Rung 2: regional+ scale — 6/16 on the survival road, all with 0 kill points.
The courtship road has scale but no kills; the kill road has kills but no scale.
Question: can the COURTSHIP road produce BOTH?

## Pre-registration (written BEFORE the pilot)

- Lever: COURTKILL (scripts/policies/courtkill.js, gate COURTKILL=1, default OFF) on leadcourt/belongseek → courtkill-lead / courtkill-belong. Two halves, both engine-honest:
  - SEEK: after wave-3 unlocks, every 3rd day (healthy scholar: hp≥60%, kcal≥200, not exiled) the scholar travels out to thicket/ruin/forest/grove nodes — each node entry rolls the real checkEncounter (thicket 15%, ruin 12%) — and walks up to visible wave-3 world monsters on the detail grid (beginPathWalk/pathStep, contact → engine startCombat, bounded 12 steps). Then comes home. Stands down once 4 wave-3 ledger points are banked.
  - COMMIT: live wave-3 fights are marked ctx._huntCommit; competent.fight's two flee points honor it — no start-of-fight walk-away (the <50% HP suicide guard stays), mid-fight flee threshold 35% → 12%. Rationale (r16 dmgmath): wave-1/2+3 fights are attrition and winnable, not burst deaths (103/104 scholars survived); wave-3 is 4-6 rounds at mid build. Counters found-but-not-executed (wave-3 has no `counter` field by design — signature-mechanics space) — pure attrition, no trick play.
  - CRITICAL INVARIANT: base.daily runs FIRST and fully — proposeLink/tendLink/tribute fire exactly as before. The hunt leg is additive. One playstyle holding both rungs.
- Primary metric: seeds meeting GO per policy.
- GO: ≥3 wave-3 ledger kill points AND regional+ held ≥5d. (Wave-4 needs 4 pts; GO at 3 proves the road produces kills while holding scale.)
- KILL: <2/8 GO on both armed policies, OR courtship regression (proposals+tends+tributes down >30% vs baseline), OR median survival down >15d vs baseline.
- Horizon: 150d death-aware (dead villages stop; matches r16/r17).
- Seeds: 11/22/33/44/55/66/77/88. Policies: courtkill-lead/courtkill-belong (COURTKILL=1) vs leadcourt/belongseek (gate off, identical seeds).
- Honest expectation recorded here: the commit half fires on EVERY wave-3 encounter (not just hunt-leg ones), so even modest hunt-leg encounter rates should move w3pts off zero. The risk is scholar death in committed fights dragging the scale rung down — the GO's AND condition prices that in. If wave-3 unlocks are rare on these seeds, hunts never fire and the arm dies by design (that itself names the bind: the unlock, not the hunting).
- No confirm spend without a GO pilot (§9).

## Step 1 — the instrument

`scripts/policies/courtkill.js` (new): withCourtKill(base) factory → courtkill-lead, courtkill-belong. Gate COURTKILL=1, default off.
`scripts/policies/competent.js` (policy-side, 2 hooks): start-of-fight `huntCommitted` override (keeps hp<50% guard); mid-fight flee 0.35 → 0.12 when ctx._huntCommit. Gate off = byte-identical (proven: courtkill-lead.daily ≡ leadcourt.daily on identical seeds, 18/18 proof).
`scripts/test-courtkill-r18.js` (18/18 green): gate-off delegation identical; locked→no hunt; unlocked→hunt legs run; rung-met→stand down; wave-3 @60% gate-on holds vs gate-off flees (RED); @30% mid-fight gate-on holds vs gate-off flees (RED); @40% start still flees (suicide guard); engagement walks up to a visible redactor → real fight (308 HP, 1 step); ignores non-wave-3.
`scripts/sweep-courtkill-r18-20261013.js`: 4-arm sweep reusing r17's instruments (food-coupling, scale-repro, tablerecon table instrument — finalizeTable export added, additive only).

## Step 2 — pilot measurement (32 runs: 4 policies x 8 seeds, 150d death-aware)

Driver: scripts/sweep-courtkill-r18-20261013.js (reuses r17's food-coupling + scale-repro + tablerecon instruments). Full JSON: evidence/2026-10-13/sim-courtkill-b.json.

Per-seed (w3pts = wave-3 ledger kill points; regHeld = regional+ held days):

BASELINE leadcourt (gate off):  GO 0/8 | w3pts med/max 0/0 | regHeld med 48d | national 5/8 | daysMed 93
BASELINE belongseek (gate off): GO 0/8 | w3pts med/max 0/1 | regHeld med 46d | national 3/8 | daysMed 86
ARMED courtkill-lead (gate on): GO 0/8 | w3pts med/max 0/1 | regHeld med 48d | national 5/8 | daysMed 93
ARMED courtkill-belong (gate on): GO 0/8 | w3pts med/max 0/1 | regHeld med 47d | national 3/8 | daysMed 87

Wall (32 runs): national 16/32 · table 1/32 (courtkill-belong s22, lesser seat) · won 0/32 · wave-4 unlocks 0/32 · wave-5 0/32 · median 86d / max 150d · vests 0 · exiled 0/32.

The mechanism FIRED where it could:
- Hunts ran on all 5 unlock seeds (lead s22: 15 hunts, s66: 9; belong s22: 9, s66: 15, s88: 9) — wave-3 unlocked on 5/16 armed runs, matching the sibling arm-3 diagnostic exactly.
- Engagements: lead s66 walked up to 2 visible wave-3 monsters; belong s22: 1, s66: 3 (detail-grid approach → engine startCombat, proven in the unit probe).
- Commits: wave-3 fights were fought instead of fled — s66 lead logged 64 committed fight-turns across 5 DISTINCT wave-3 types faced (bestW [10,5,5]); s22 lead faced 2 types; s66 belong faced 2 types.

But conversion is ~zero:
- s66 lead: 5 distinct wave-3 types faced, 0 kills. s66 belong: 2 types faced, 0 kills.
- Armed total: 3 wave-3 points across 16 runs (lead s22: 1, belong s22: 1, belong s88: 1) vs baseline 1/16 (belong s66). The lever moved the needle from ~1pt/16runs to ~3pts/16runs — nowhere near the 3-4 pts/run the rung needs.
- The committed fights are LOSSES: the scholar burns cheat-death or disengages at 12% without the kill. Wave-3 (HP 240-420, dmg 20-70, pierce 0-0.25) is a 4-6 round fight AT MID BUILD (sim anchor: hunter kit lvl 2, fire-hardened spear, P=64) — the courtship scholar, spending its economy on tribute/tends rather than a godhood build, isn't at that anchor.

Courtship PRESERVED (the critical invariant): proposals/tends/tributes byte-identical medians baseline vs armed (lead 3/54/0 vs 3/54/0; belong 2/0/7 vs 2/0/7); per-seed trajectories nearly unperturbed (6/8 lead seeds end on the same day both arms); national 5/8→5/8 and 3/8→3/8; median survival 93→93 and 86→87. The hunt is safe — it just doesn't produce kills.

## Step 3 — sense-test (read as a player)

The village reads as a village throughout: "June Aguilar is dead — combat. The village stops. Somebody screams. Somebody else starts digging." Villager field-fight summaries ("Victor stood down the Night Court and kept walking — 4 rounds, bloodied but breathing") show the living world fighting alongside the scholar. Courtship beats fire on schedule in both arms (tends 60-110 on long lead runs). Nothing about the hunt reads as robotic — it's the same travel/encounter narration as normal play, and the engagement is literally the player-taps-monster walk-up. The known instrument gap stands: the scholar's own wave-3 fights don't surface in the say-line capture (regex has no monster names; sim-findings already carries this).

## Step 4 — verdict: KILLED AT PILOT

Pre-registered KILL was <2/8 GO on both armed policies. Result: 0/8 and 0/8. No confirm spend (§9).

Honest diagnosis: the theory was "the courtship road can produce both rungs if the scholar deliberately hunts wave-3." The measurement says the HUNTING works (seek + commit both fire, engine-honest, courtship intact) but the KILLING doesn't — the courtship scholar loses wave-3 fights at ~0-1 kills per 10 fights. The bind is not motivational (the scholar won't fight) but CAPABILITY: wave-3's attrition math vs a courtship-economy build. This CONFIRMS the sibling arm-3 diagnostic (sim-scale-wall-r18-villkill.md): "the wave-4 kill rung is scholar-only in practice with a realistic courtship-road ceiling of ~1 pt, not 4" — deliberate hunting raised the measured ceiling from 1pt/16runs to 3pts/16runs, still an order of magnitude short.

The two-rung bind stands as a DESIGN question (sim-findings, already open): either wave-3 kills need to be reachable by the courtship road (a stronger scholar, not a more willing one — a combat-build lever, not a hunting lever), or the wave-4 scale rung needs an alternate currency. Steve's call.

Convergence: scale-onramp stays the blocking axis. The lever is kept behind the default-OFF COURTKILL gate as a proof-tested instrument (r16-arm-B precedent: 18/18 proof green, gate-off byte-identical delegation proven) — a future combat-build lever can reuse the seek/commit machinery.
