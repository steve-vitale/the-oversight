# Journey — social life r268 (Lane B, leg 5)

Run: `playtest-loop-2-20261123T0200Z`. Base master `86e5bd38e`. Worktree `journey2-social`, branch `journey2-social`. Lock `playtest-loop-2.lock` run_id `playtest-loop-2-20261123T0200Z` (created 07:55:38Z; delete at closeout after same-call run_id verification). Heartbeat loop pid 25438, 5-min beats (registry heartbeat fresh at closeout check).

## Pre-registration

**Leg question:** do conversations across a full run stay meaningful — the NPC wants something, options engage or deflect it, endings resolve/plant/owe — and do the settled-favor re-ask, the dry-fallback resume, and the trail press actually fire in the wild?

**Seeds:** 45829–45832 (FRESH — 0 prereg hits each; backup 45837–45840 unused). DAYCAP 140. Driver `scripts/journey-social-life-r268-20261123.js`, analyzer `scripts/analyze-journey-social-r268-20261123.js` (r266 files verbatim except seeds, OUTDIR `evidence/2026-11-23`, filenames/mode r268, Arm A moved to dawn, Arm D F5W-as-binding). Panel runs on the FIXED code (Arm B proof-green before launch).

**Binding metrics (prereg `journey-social-life-r268-prereg.md`):**
- M4-SPLIT conversational ≤ 12 panel-wide
- F6 dry 0 panel-wide (Arm B fix)
- TRAIL distinct ≥ 6 AND max recurrence per seed ≤ 4
- F5W total ≥ 1 panel-wide (Arm D: widened, both pools — legacy F5 printed, not binding)
- Arm B proof tests green; determinism re-run identical

**Watch-only:** M12-native, M6, B6, M9, M10, FACE, outing kept/attempts ≥ 25%.

## Verdict: NO-GO

| Metric | Bar | Result | Verdict |
|---|---|---|---|
| M4-SPLIT conversational | ≤ 12 | **24** (per-seed 5 / 7 / 4 / 8) | NO-GO |
| F6 dry | 0 | **0** | GO |
| TRAIL distinct | ≥ 6 | **0** (presses 0) | NO-GO |
| F5W total | ≥ 1 | **0** | NO-GO |

Three of four binding bars miss. The F6 bar — the one this run fixed in the game — holds clean in the wild. The other three are diagnosis items, not re-scores (metric binding §14).

## Panel

- 45829: d140 survived, 3 alive, 141 full convs, 122 natural ends, 20 feasts, 0 moots.
- 45830: d132 survived, 6 alive, 160 full convs, 152 natural ends, 18 feasts, 1 moot.
- 45831: d108 village-lost, 0 alive, 96 full convs, 83 natural ends, 15 feasts, 2 moots.
- 45832: d140 survived, 8 alive, 155 full convs, 135 natural ends, 20 feasts, 1 moot.
- Panel: 531 transcripts, 170 near-dup flags (146 instructional, 24 conversational). Bonds proposed 116 (villager-initiated 115, scholar 1; accepted 30, refused 13, staged 49, expired 24). Successions 29 across the panel. Plots 9, all grievance-linked at arming (9/9). Springs 9 (escaped 8, killed 1).
- Watch: B6 GO (0 deflected from stage 0, 560 resolutions). M6 GO (re-aligned gate definition; strict on-tile away total 45 reported as the known metric/gate discrepancy, does not fail M6). M9 HOLDS. M10 HOLDS. FACE HOLDS. M12-native threeTimes per-seed totals 6 / 11 / (see analyzer log).
- **Outing: 0 attempts on all 4 seeds** (kept 0, delivered 0 kcal). r265 had 21 attempts, 8 kept (38.1%). The outing chain never even attempted on this panel — no promised outing ever reached the dawn arm. Cause NOT established (not the Arm A move: the outing arm runs first in upkeep, untouched, and the F5 arm opened zero sittings). Flagged loud for the next run; do not assume a seed effect.

## Arm B (GAME FIX, landed) — resume-pick dry fall-through

Commit `e69b2724a`: `src/js/conversation.js` + proof test `scripts/test-journey-social-life-r268-resume-fallthrough-20261123.js` + prereg.

Root cause (verified in code): the resume pick draws the thread's next beat and speaks it with full ledger protection — but the beat is the thread's last spoken line, often still inside the 48-entry run-ledger window, so `sayLine` run-blocks it and falls back to the dry line ("...Sorry, lost my train of thought."). Same dry-risk shape at the `more`, resume-offer Yes, and `follow:` sites. Fix: shared helper `convoLiveBeat(vid)` — returns the beat unless ledger-blocked (via existing pure predicate `convoWouldBlock`), else null; blocked beats fall through to each site's existing graceful line.

Proof: 36/36 GREEN with the fix; RED check (fix stashed) 28/32, failing exactly the 4 fix-dependent assertions and reproducing the panel defect verbatim (David Kim d82 shape). **Wild confirmation: F6 dry 0 panel-wide on the r268 panel** — the fix holds where r266 saw the dry line.

## Arm A (report-only) — F5-REASK dawn scan

The r266 end-of-day scan could not catch the window. r268 moved the scan to dawn upkeep, before any sitting opens. Result: **scanned 12,233; askFavor sightings 4,457; distinct seeds 208; settled-at-last-sight 0; attempted 0; reasks 0.**

Diagnosis: no seed EVER survives to a settled favor. Every seed's last sighting is unsettled — then it vanishes (consumed by a sitting or expired). Any sitting on a seeded villager consumes the seed while the favor is still 'asked', and the favor settles later with no seed left. The settled re-ask branch is structurally unreachable under a talkative player: the seed's lifetime is bounded by the next sitting, not by the favor's settlement. The dawn scan was the right interception point and it proves the window does not exist — the next step is a design change (seed survives sittings until the favor settles, or the re-ask triggers on settlement without a seed), not a better scan. Filed for the next run; F5W 0 is consistent (no serving exists to count).

## Arm C (investigation, no landing) — M4 template-slot variety

r268 conversational 24 breaks down as: **template-frame pairs 10** (plant teaching ×4, place/landmark ×6 — same frame, different slot) + **hunger-plea family ~5** (one plea body, many openers: "Please — have you got anything to spare?" / "I hate to ask, but…" / "I'm running on empty —…" / "I'm past hungry —…") + **mood-beat "Something eases in their shoulders" ×2** + **same-opening content pairs ~7** (rinse-the-cup, braid-grass, "About what you make of all this", "Every person I help/patch up", walk-to-cache/ridge, "Huh. Let me think about that").

Findings:
1. **The frame rotation already exists and already fails.** `convoTeachPlantLine` (r125) and `convoTeachPlaceLine` (r183) each have 4 frames with per-sitting frame-index tracking. Yet r266 shows the same frame twice in one sitting with only 2 teachings (45814 jovan d93: "crush the leaf" ×2; 45814 wanjiru d112: "remember the shape" ×2; 45816 mia d24: same ×2). The r268 panel repeats the shape (gen_b6wdwd1 serves "This one — Water Hemlock" AND "This one — Greenbrier Shoots" AND "This one — Purslane" AND "This one — Papaya" in one sitting — frames 1 and 4 reused across 4+ teachings, i.e. pool exhaustion past 4, plus same-frame pairs within the first 4). The per-sitting `teachFramesUsed` tracking does not survive the agency-ask path — exact mechanism NOT yet established (candidates: the teaching is served through a path where `convoGet` returns a fresh/null convo object, or the sitting is re-opened mid-transcript). Filed as the next-run investigation; do NOT widen frames 4→8 blindly — any same-frame pair flags regardless of pool size, so widening cannot move the M4 count on its own.
2. **Even reclassifying all 10 template flags leaves 14 > 12.** The bar does not fail on template noise alone. The hunger-plea family is the biggest real-content gap: one plea body with varied openers reads as the same plea repeated. The mood-beat pool ('up:warm', 2 lines) guarantees repeats on the second warming. These are content-variety gaps, not classifier noise.
3. No Arm C landing this run: nothing conclusive to land; the fix shape (rotation survival + plea-body variety + mood-pool widening) needs its own proof test and panel.

## TRAIL (NO-GO, report-only per prereg)

Presses 0, distinct 0, max recurrence 0 on all 4 seeds. The trail press (`performForageTalk`) never fires at all — not a width problem, an availability problem. Next run: check the `performForageTalk` pool size and its call conditions; the press may be gated behind a state the panel never reaches.

## Village assessment (plain words)

Three of four villages survived to the end of the window, and the fourth (45831) held to day 108 before being lost — these are talkative, feast-heavy villages (15–20 feasts each) where people propose bonds constantly (116 proposals, 115 from villagers themselves). The social fabric is dense: bonds form, successions pass the mantle 29 times, moots happen. What is missing is the *outward* life: nobody ever goes on a promised outing together (0 attempts), nobody ever presses the trail talk, and nobody ever comes back to a settled favor. The village talks a lot indoors and never walks out together. The people are alive and bonded; the shared ventures are not firing.

## People check (sense-testing)

Read the analyzer's printed M4 candidates and the per-seed best transcripts (see `journey-social-life-r268-analyzer.log`, 705 lines). Conversations cohere: hunger pleas are honest and specific, grief lines ("I rinse the cup twice. It doesn't bring anyone back.") land, teachings name real plants and places. The failures are repetition, not nonsense: the same plea body with a new opener, the same teaching frame with a new plant, the same mood beat on the second warming. A player hears the village repeat itself — the words make sense, they just run out. No fabricated shared history spotted in the printed candidates; no filler loops beyond the capped recap escalator (M9 holds).

## Metric review (for the NEXT run, §14 — bars never re-scored)

1. **M4-SPLIT bar (≤12 panel-wide):** the bar held as written and failed honestly (24). Do not relax it. The review question is whether template-with-slot pairs belong in the conversational count at all — the r129/r130 analyzer already normalizes place frames for its own tally, but the M4 scan does not. If the next run normalizes known teaching frames in the scan, say so in its prereg and judge the residual (non-template) count against 12.
2. **F5W bar (≥1):** the bar is fine; the path is unreachable (see Arm A). Do not lower the bar — fix the seed lifetime.
3. **TRAIL bar (distinct ≥6):** the bar assumes the press fires. If the next run finds the press gated behind an unreachable state, the bar should be re-scoped to the gate, not the count.
4. **Outing watch:** 0 attempts breaks the watch's premise (kept/attempts undefined). If the next panel also shows 0 attempts, promote outing-attempts to a binding bar or open a defect investigation — a chain that never attempts is not a watch item.
5. **npcGoal / goal-branch mismatch (filed r268, from proof-test debugging):** a villager's `npcGoal` reads 'alone' outside the turn but the goal branch serves 'belong' lines inside it (proven by instrumentation; stable in a clean single-section run, flips only after prior sections ran). Suspects: goal mutation via `game.js:5488` / leadership fix-up `game.js:2546` mutating shared `data.villagers` entries across `newRun` generations, or `bgGoals` re-rolled at generation. NOT fixed this run; affects only test staging, not the Arm B fix's correctness.

## Determinism

Seed 45829 re-run to a separate OUTDIR (`/tmp/r268-determinism`, the panel JSON kept in evidence): the two JSONs differ in exactly one field — `"ms": "31s"` vs `"ms": "120s"` (wall-clock runtime). All game content byte-identical. **Determinism: identical modulo runtime.**

## Telemetry

No canonical baseline exists for the current metric set (`telemetry-baselines/social.json` is an October snapshot on stale `l3.*` keys). Ad-hoc comparison: baseline built from the r266 panel JSONs in /tmp (`/tmp/r268-social-baseline.json`, seeded from `{}` then reseeded — the "newly appeared" lines on the reseed step are seeding artifacts, not deviations), r268 checked against it with `telemetry-check.js` on the real-signal metrics (`social.moots`, `social.fullConvs`, `social.transcripts`, `bondProposed`, `confrontEvents`, `outingArm`, `mootNotes`, `funeralMendStats.funerals`). **LOUD ×1, explained, baseline NOT rolled** (ad-hoc /tmp artifact, not committed):

- `outingArm` 8 → 0 (disappeared): the outing chain's seed-volatility, already flagged in r266 (all 8 attempts on one seed; r265's own LOUD line was 56 → 21), has now reached zero attempts panel-wide. Same family, taken to zero — which is why the run note promotes it to a next-run investigation rather than treating it as a fresh regime.
- Quiet on the rest: moots 7 → 4, fullConvs 581 → 552, transcripts 581 → 552, bondProposed 114 → 116, confrontEvents 22 → (within bar), mootNotes 8 → (within bar), funerals 16 → (within bar).

## Handover / adoption notes

- Commits on `journey2-social`: `e69b2724a` (Arm B fix + proof test + prereg), `58a6f9221` (r268 driver + analyzer). Worktree status clean at panel end; index-clobber after each safe-commit repaired via `git ls-tree HEAD -- <paths> | git update-index --add --index-info` (verified `git status --short` empty + `git diff HEAD` empty after each).
- Panel JSONs: `evidence/2026-11-23/journey-social-life-r268-45829.json` … `-45832.json`. Analyzer log: `evidence/2026-11-23/journey-social-life-r268-analyzer.log` (705 lines). Panel log: `evidence/2026-11-23/journey-social-life-r268-panel.log`.
- **Not yet done at run-note time:** `check.js --quick` gate; closeout (merge, release, rotation-b 5→6, lock delete, hbloop kill, memory note, tracking entry). If the occurrence cap hits first, adoption picks these up: the work is committed and the evidence is landed.
- **Do NOT touch `src/js` in the worktree while any panel re-run is in flight** (the driver loads the game from disk per seed).
- Next-run owed items (from this run + r266): (1) F5 seed-lifetime design (seed survives sittings until settlement, or settlement-triggered re-ask); (2) teach-frame rotation survival through the agency-ask path (prove with a two-teachings-one-sitting test); (3) hunger-plea body variety + mood-beat 'up:warm' pool widening; (4) TRAIL press availability (`performForageTalk` pool/conditions); (5) outing 0-attempts investigation; (6) npcGoal/goal-branch flip; (7) M4 template-frame normalization decision in the prereg.

## Gate (finisher, 2026-11-23)

`node scripts/check.js --quick` on the rebased tip (master `80e7da0bc`, branch tip `5a71f6cd3`), run 09:47–10:12Z, **334 passed, 10 failed in 1485s — 0 attributable**:
- Standing set (4): measurement-proof staleness pair (`test-measurement-proof-update.js`, `test-measurement-workflow.js` — "Proof source inputs are not current"); `test-measurement-cache-flags.js`; `test-phone-frame-proof.js` (phone receipt stale).
- Load timeouts (6, all 120s check.js timeouts, each passed its early assertions): `test-living-garden-deed-attainment.js`, `test-one-person-army-deed-attainment.js`, `test-occupation-panels.js`, `test-trust-observer-neutrality.js`, `test-synergy-stall.js`, `test-capable-bot-20261014.js`.
- All 6 timeouts re-ran green standalone (log `journey-social-life-r268-timeout-reruns.log`): living-garden 231s, one-person-army 172s, occupation-panels 39s, trust-observer-neutrality 51s, synergy-stall 33s, capable-bot 45s — all exit 0.
- Gate log: `evidence/2026-11-23/journey-social-life-r268-gate.log`. (First gate launch was killed by a sibling check.js already running; second launch killed by the 09:23Z VM restart; third launch completed. A VM restart also killed the original heartbeat loop pid 25438 — restarted as pid 2002, beat verified.)
- Arm B proof test re-run on the rebased tip: `scripts/test-journey-social-life-r268-resume-fallthrough-20261123.js` 36/36 GREEN (see rebase step below).
