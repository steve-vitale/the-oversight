# Journey leg: DEEPENING (days 40–80) R39 — run note

**Run:** oversight-playtest-loop LANE A, 2026-10-23 23:08 CDT scheduled run.
**Rotation:** read **2** (deepening); wrote 2→3 at end. No prior lock at run start;
lock `playtest-loop-20261024T040900Z` created/deleted; standing heartbeat held
(<15 min all run).
**Base:** master@7d6f735c9 (no mid-run ship-loop landing; no rebase needed).
**Pre-reg:** `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-24/journey-deepening-r39-prereg.md` (written BEFORE any sim).

## Question
**Does the wider world become visible during deepening?** Steve's gap (2026-10-13):
"nothing in-world points at national/regional — 128 days of competent play produced
zero mentions." The scaleDiscovery pointer system + hierarchy FIRST CONTACT were built
in response. This run measures whether the pointers fire under competent d40–80 play
and sense-reads every fired beat.

## What ran
- 4-seed competent pilot, seeds 39001–39004, DAYCAP=80, death-aware. PINNED policy
  scripts/policies/competent.js. Natural unlocks only.
- Driver: scripts/journey-deepening-r39-20261023.js (new; modeled on r38). Harness-only
  wraps, zero src/js gameplay changes. Panel telemetry keeps r38 keys
  (w3fights / engaged.w3 / fightsTotal / fightsByWave.3) + sd* keys.
- Per-seed JSONs, 12 transcripts, beat dumps:
  `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-24/journey-deepening-r39-*`

## Verdicts (binding metrics)
- **M1 (pointers fire) GO:** 4/4 seeds fired the neighbor pointers (knock.system d10–11,
  hunger.villager d12–25); 2/4 fired regional-ladder pointers — 39002: region.villager
  (Gertrude d27) → realm.traveler (d35) → nextAct.system (d55) → echo (d56);
  39003: nextAct.system (d60) granting region via system. Steve's gap is CLOSED for the
  pointer layer: the ladder becomes visible in-world during deepening.
- **M2 (legibility) GO with one fix:** every fired beat sense-read end-to-end. All
  in-voice, knowledge-gated, producer-brain where required. **One blemish, FIXED:**
  the duplicate "next act / BIGGER STAGE" pitch (see Blanks #1).
- **M3 (winnable) GO:** 4/4 villages alive at day 81 (death-aware; no tail needed).
- **M4 (people) GO:** 12/12 transcripts sense-read; **0 senseless, 0 new blanks.** The
  r36/r38 `dlg:more` fortune-cookie blank did NOT recur this run.
- **Interesting-finding bar:** met — the duplicate pitch (new finding, fixed with
  proof) + ladder visibility confirmed + FIRST CONTACT never staged (see below).

## Village assessment (plain words)
- **39001 (8 alive, wave 2):** the steady ones. Trust 75–90 except Nia (16); plants
  31–37 — the knowledge economy reached everyone. Early combat deaths, then still.
  Never unlocked wave 3 (quiet seed; villagers still fought).
- **39002 (10 alive, wave 4):** the climbers. Ada the butcher at trust 100. The ladder
  visibly opened: Gertrude spoke of the bigger fire east (d27), a trader of the REALM
  (d35), the System demanded a bigger stage (d55). Reached wave 4 via Standing —
  the standing gate working in the wild. Deaths all combat.
- **39003 (10 alive, wave 3):** the talkers. Finn the glazier (trust 16) asked "Do you
  still sing? ...Tunes outlast everything." Dorothy's pantry-run favor declined with
  dignity ("They won't ask twice"). Gertrude dreams of humming pods (KIN.md alive).
- **39004 (6 alive, wave 2):** the struggling. Three starved (d17, d42×2), two sick,
  one contest death, one unclosed wound. Trust 20–48, plants 0–15 — the teach path
  never reached them; Yuraq speaks only Spanish (the honest no-shared-language beat).
  The knowledge economy's absence is legible as suffering.

Knowledge economy: teach/ask_field fired richly where trust was high (Otis: monster
lore "Big Big — It sits up", "White Noise — The heron is gone"); absent where the
village frayed (39004). The contrast is the finding.

## Blanks
1. **FILLED — duplicate "next act / BIGGER STAGE" pitch.** Root cause: SCALE-DISCOVERY.md
   Beat 4 (game.js `scalePointerW4`, 2026-10-12) and the 2026-10-13 blitz's
   `scaleDiscovery._sdNextAct` are the SAME beat built twice. On a wave-3-landing
   one-fire village both fire within a day — the producers' pitch (standing ask) and
   the System's pitch (network ask), near-identical openers, conflicting asks, two
   voices. Observed: 39002 both d55; 39003 d59+d60. Fix (ROOT-CAUSE FIRST, one gate):
   `_sdNextAct` returns early when `state._scalePtrW4` is set — Beat 4 owns the
   one-fire moment (the unlock-causing kill synchronously runs checkWaveUnlockBeat
   before the next daily tick, so the order is deterministic) and its text already
   names the current lever (standing, 2026-10-13). Proof test
   scripts/test-scalediscovery-nextact-dedup-20261023.js: RED 2-fail pre-fix
   (duplicate fires), GREEN 5/5 post-fix (dedup; no kill when Beat 4 absent;
   regional partition unchanged). Regression: test-blitz-scaledisc.js ALL GREEN;
   test-scale-pointers-20261012.js beat-4 section green after updating ONE stale
   assertion (network ask → standing ask, the deliberate 2026-10-13 design change;
   "update the test in the same commit and say so" per repo AGENTS.md). One
   PRE-EXISTING harness failure remains (wave-4 setup can't reach wave 4 under the
   standing gate — the test predates 2026-10-13; identical before/after my change;
   left for the owning loop).
2. **DOCUMENTED (not fixed — owning loop's lane):** FIRST CONTACT never staged on any
   seed (links=0, knownVillages 5–6). Root cause is coverage, not a bug: `proposeLink`
   is a player verb and the pinned competent policy never proposes — the motivation
   layer (knock/hunger nudges) fires reliably but nothing exercises the verbs.
   SCALE-DISCOVERY.md's own verification plan calls for a curiosity-following policy
   ("follows rumors, knocks when nudged, tends bonds... should climb to regional on
   the signals alone"). Proposed next-run instrument, not a fix.
3. **DOCUMENTED (texture, not a blank):** Otis's plant-teaching template
   ("This one — X. Leaf, stem, smell. You won't forget it now.") repeats verbatim 3×
   — same class as r38's Spool verbatim-repeat note. Knowledge transfer is real;
   the template is flat. Left for the owning loop.
4. Triage-label erratum: my beat classifier tagged game.js `scalePointerEcho`
   (🔥 "Whatever's out there...") as `natBeatEcho.villager` (scaleDiscovery's
   `_sdNationEcho` says "Whatever's coming..."). Triage labels only; the sense-reads
   and verdicts used the full lines. No echo duplication exists.

## Reachable / fun / winnable (deepening leg)
- **Reachable:** yes — the ladder pointers fire on earned state (4/4 neighbor, 2/4
  regional) and read legibly in the game text.
- **Fun:** yes — Gertrude's bigger-fire story, the trader's REALM whisper, the System's
  bigger-stage demand land as story, not UI.
- **Winnable:** yes — 4/4 villages alive at day 81; deaths are combat/starvation, not
  collapse. 39002 reached wave 4.

## metric review
- M1's low bar (≥1 region pointer on ≥1 seed) was a detection bar for a previously-
  missing phenomenon — met 2/4 with the full region→realm→nextAct chain on 39002.
  Proposal for next run: the useful metric is now FIRST CONTACT staging under a
  link-seeking policy variant (SCALE-DISCOVERY.md's curiosity policy), not pointer
  detection.
- M4's known-blank counting (r38 proposal) worked: 0 recurrences this run, cleanly
  separated from new senselessness (also 0).

## Telemetry
- `node scripts/telemetry-check.js --baseline hidden_files/telemetry-baselines/deepening.json
  --current 'hidden_files/evidence/2026-10-24/journey-deepening-r39-competent-*.json'
  --metrics w3fights,engaged.w3,fightsTotal,fightsByWave.3` →
  - `LOUD: w3fights swung -87%: baseline 8 -> current 1 (n=4 files)`
  - `LOUD: engaged.w3 swung -94%: baseline 18 -> current 1 (n=4 files)`
  - `LOUD: fightsTotal swung -68%: baseline 82 -> current 26 (n=4 files)`
  - `LOUD: fightsByWave.3 swung -87%: baseline 8 -> current 1 (n=4 files)`
- **Same-run investigation verdict: EXPLAINED, not a mechanism break. Baseline NOT rolled.**
  1. r38 (same policy, same horizon, 4 seeds): 50 player fights (6/20/10/14); r39: 26
     (1/13/6/6). Same order of magnitude — seed variance, not a break. The baseline
     (82) comes from an older, larger run; r38 already declined to roll it on 4 seeds.
  2. Wave-3 unlocks still happen naturally (39002 d56, 39003 d60, at the w2pts=4 gate);
     39002 reached wave 4 via the Standing gate. Gates working.
  3. Villager field fights continue (death censuses show villager-combat deaths on all
     seeds); the `fights` instrument counts player `startCombat` only.
  4. The one-line fix touches only `scaleDiscoveryDaily._sdNextAct` gating — zero
     combat code paths.
- Infra note: `node scripts/check.js --quick` hung with zero output for 8+ minutes
  (0.2% CPU, no log lines) and was SIGTERMed. Targeted verification stands in:
  proof test 5/5, blitz-scaledisc ALL GREEN, scale-pointers beat-4 green,
  validate-ontology.js 128/128. The hang is reported as-is, not worked around.

## Evidence
- Per-seed JSONs, 12 transcripts, beat dumps (sense-read sources):
  `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-24/journey-deepening-r39-*`
- Pre-reg: `.../hidden_files/evidence/2026-10-24/journey-deepening-r39-prereg.md`
- Driver + proof test: scripts/journey-deepening-r39-20261023.js,
  scripts/test-scalediscovery-nextact-dedup-20261023.js (committed this run).
