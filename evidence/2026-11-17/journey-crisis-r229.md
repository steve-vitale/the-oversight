# Journey crisis r229 — run note (Lane B, leg 6)

**Run:** playtest-loop-2, 2026-11-17T06:56:08Z. **Base:** master `6fb6ea002`.
**Policy:** oracleV2, 150d death-aware +10d tail. **Seeds:** 14491–14495 (fresh band,
verified zero hits in all dated preregs; forbidden bands untouched).
**Worktree:** journey2-crisis (registered after a VM restart killed the first
registration mid `git reset --hard`; orphan dir + stale branch cleaned, re-registered
clean onto the new master). **Coordinator timed out at 3600s** before expansion
verification; adopted in the main session — expansion had in fact completed
(both seeds exit 0, EXPAND-DONE 07:53:11Z), analyzer + people check + gate run
by the adoption coordinator. Lock run_id `2026-11-17T06:56:08Z`.

**Rotation:** read 6, played 6, writes 7 (succession next) at closeout.

## Panel

| seed | days | end | raids | gorge | sorties | convos | alive | pantry |
|---|---|---|---|---|---|---|---|---|
| 14491 | 122 | game-over | 5 | 10 | 2 | 7 | 1 | 0 |
| 14492 | 149 | game-over | 13 | 47 | 7 | 8 | 3 | 0 |
| 14493 | 107 | game-over | 6 | 23 | 5 | 8 | 1 | 0 |
| 14494 | 150 | horizon | 10 | 21 | 5 | 8 | 5 | 0 |
| 14495 | 94 | game-over | 7 | 26 | 3 | 7 | 1 | 0 |

**4/5 game-over, median 122d** (r228: 5/5, median 135d). One village reached the
horizon. Pantry hit 0 on every seed (d53–d85). Deaths: the wild dominates, then
monsters; starvation 5, thirst 4 (all on 14495), wounds 4, disease 0. Scholar
deaths 0 on all five seeds. Arena deaths 5 (r228: 8).

## Verdicts (pre-registered metrics bind)

- **D1 DRY CENSUS: GO.** 0 dry lines on 38 transcripts; deflect_q 0. The r192
  fixes hold on the crisis leg for the sixth straight clean panel
  (r201, r208, r216, r223, r228, r229). The DRY2 stonewall path survived 4
  consecutive dlg:doubt presses on 14494 d27 without going dry — the r231 fix
  design stays owed, but no new dry serving on this leg.
- **C1 (bend, not break): GO.** All four game-overs are attrition endings
  (roster ground down by wild/monster/arena deaths + starvation/thirst/wounds,
  pantry 0 at the end); none is a softlock or siege-mechanic failure. No
  softlock seed.
- **C2: GO.** Raids fire on all seeds; fought resolutions present (19 ok sorties,
  31 sortie fights); D1 snapshots all delayed ≥3 attempts (22/22); deltaBad
  empty; D3 drift unknown 0 (labels: player-drawn-off 6, sortie-clear 15,
  moved-on-valve 30).
- **C2b: GO.** Every boundary-firable case fired or refused with a recorded
  reason. The 3 refusals (all 14493 d107–108) are no-fighters with the reason
  recorded; R70 judges gorge+sorties on all 5 seeds.
- **C3 (people check): GO.** All 38 transcripts read in full; fabricHits 0.
  No double confession — the guard fires correctly (Cuauhtémoc d74, Grace d67
  ×3, Otto d28). No voiceLine prefix stacking ≥3. Monster display names vary
  by villager in the naming debate (The Moderator / The Loud Beast;
  Cliffhanger / The Ugly Beast) — by design, not the rumortarget flip.
- **C3b SETTLED-FAVOR CONFIRM: GO.** The one "settled, and counted" line
  (Zhanbolat d40) fires after a real shared beat (wound cleaned + thanked).
  The "Nobody's settled it" lines name genuinely open cases. 0 false
  settlements.
- **C3c: CLOSED, holds.** Every resume opener names the actual thread. One
  garbled quote: 14494 d28's opener quotes a truncated narration fragment
  ("'Halfway to the tree line, Naomi freezes. Fresh tracks — big. We go
  back now. Quietly. You do. NPC: The wild…'") — the thread (grief) is
  right, the quote is cut mid-line and carries the "NPC:" prefix of the
  next line. Minor blemish, not a regression. Filed in findings.
- **C3d CONFIRM: GO.** Every recap served while a favor/want was live names
  that want ("Still on that wound care", "Still on that water haul", "Still
  on that debt", "Still on whether they can trust you"). Zero "Nothing
  important" recaps. The r231 fix holds in the wild.
- **WRAP-CHECK: GO.** 38/38 marked, unmarked 0.
- **C7b: GO.** Buried list per seed reported; corpse-cause counts panel-wide:
  famine 5, disease 0, wound 4, thirst 4.
- **Q6: descriptive only (retired).** Gorge-after-clear id-matched 0.
- **NODEAWAY PANEL METRIC: 0 / 0 / 0** (totalAcrossRefusals 0, aliveBenchNodeAway
  0, aliveBenchRefusals 0, worst null) vs r228's 38 / 9 / worst-7. Sharp drop,
  reported as descriptive per the prereg — never lever attribution with n=5.
  Compositional: the only 3 refusals were no-fighters (village empty, 0
  living besides the player), so the muster-availability surface never
  engaged and the nodeAway question never arose. This panel does NOT answer
  whether the muster-vs-travel tension resolved; the next crisis run needs a
  band where musters are attempted with a living bench.
- **FUNERAL-MEND CONFIRM: GO.** 36 funeral feasts, all honest amounts (1,500
  standard; partials 484 / 200 / 2,800 stated aloud with the links they feed).
  0 silent mends, 0 over-claims. The one "shortfall" line on the panel is a
  tribute shortfall (14494 d49: "1,500 of 4,000 kcal... rides as arrears"),
  said aloud with honest numbers — not a funeral-mend issue.
- **STAGE-0 SURFACING WATCH:** nothing to record — no stage-0 ask_favor want
  sat a full sitting with dlg:help never offered in the driven transcripts
  (dlg:help was offered directly where a want was live).
- **ARENA WATCH (descriptive):** 5 arena deaths (14491: 3, 14492: 1, 14494: 1)
  vs r228's 8. No bar.
- **CASCADE WATCH (descriptive):** 0 scholar deaths; no lingerer-killed scholar.
  Gorge nights 127, sorties 22.
- **Stranger (A1–A7, descriptive):** 0 alien kills on all 5 seeds — VACUOUS.
  Encounter-eligible days 1 / 0 / 0 / 0 / 0; the channel never opens under
  home-based play, as expected.
- **Supply (S1–S5 not run, RUINROAD parked):** 5 ruin searches panel-wide, 0
  med acquisitions, pharmacy 0 days everywhere. Cumulative stays 0/306
  (0/301 + 5). Medicine still owned by the build brief.
- **Medic-duty:** ability cures 18 / 0 / 22 / 26 / 0, medicine cures 0
  everywhere; blocked 53 / 0 / 72 / 107 / 0.
- **Missed-window:** corrected 3 (2 valve-expiry + 1 drawn-off).
- **Fight-1:** cleared 9 / broke-after-1 10; cleared openers vKill 6 / mFlee 3;
  broke openers vFlee 9 / vDie 1. Multi-monster cleared 7/16. No cleared
  fight-1 with vTaken ≥ 70 (Q4 standing; max cleared vTaken is 66).

## Village assessment (plain words)

Four villages died the way villages die here: slowly, then all at once. The
pantry emptied on every seed and never came back; the living dwindled to one
or three people picking through the last days while the monsters kept coming
to the treeline. The fifth village, 14494, held — five people alive at day
150, still fighting, still naming parties (The Thornbacks) and still
grieving out loud. The people in these villages talk like people: they
mourn the dead by name, they remember who took the burnt piece, they dream
about soup and roads, they refuse to confess twice, and when you ask them
what they were talking about, they tell you — the wound, the water, the
debt. The crisis leg bends the same way it did on r228: raids, gorge
nights and sorties all fire; nothing here is a dead end or a softlock.

## Blanks filled / findings

- No game-code change this run. The branch carries the prereg, the
  live-roster driver (convo targets picked from the living roster only —
  r228 burned 2 sittings on dead villagers; this run burned 0) and the
  NodeAway analyzer. Evidence-only landing.
- **Blemish 1 (minor, findings):** resume-opener quote truncation, 14494 d28
  — the quoted line is cut mid-sentence and carries the next line's "NPC:"
  prefix inside the quote. Thread named correctly; quote rendering only.
- **Blemish 2 (minor, findings):** tautological recap template, 14494 d48
  Grace — "We started on what you're hoping for, then got onto what you're
  hoping for" (the "started on A, then got onto B" shape with A == B).
  Names the live topic, just clumsily.
- **Live-roster fix validated:** 0 sittings burned on dead villagers this
  run (r228: 2). The driver change does what it says.
- **NodeAway collapse is compositional, not an answer** (see verdicts) — the
  muster-vs-travel design question stays open.

## Telemetry

`telemetry-check.js` vs `telemetry-baselines/crisis.json` (defendedFights,
playerFights, latelyDefenseCount): **QUIET** — 5 files, 3 metrics, no large
deviations. Baseline NOT rolled (single-panel variance; the units question
from the r201 metric review — means vs sums — is still carried).

## Gate

`node scripts/check.js --quick` in the worktree: **334 passed, 6 failed in 653s**
(log `evidence/2026-11-17/journey-crisis-r229-gate.log`). The 6 failures are the
standing set, **0 attributable**: measurement-proof-update +
measurement-workflow (retained-proof staleness), phone-frame-proof (stale
receipt), ladder-bundle (ambient-raid control, standing), living-garden +
one-person-army (120s timeouts — load artifacts, both known to pass
standalone on quiet boxes). The branch carries no src/js changes, so
attribution is trivially clean.

## Metric review

(1) Q6 retired to descriptive-only — done r201. (2) Dialogue-only fixes are
NOT trajectory-neutral while voiceLine draws RNG — pre/post trajectory
comparisons stay descriptive. (3) For supply-gated fixes, the unit test is
the proof and the panel is a regression check only. (4) Telemetry baseline
units — verify crisis.json units before any roll (carried; this run does
not roll). (5) The `want`-thread label is a function of the CURRENT favor,
but the topic ledger stores it as a snapshot — every consumer that trusts
the stored label can misname the favor after a change (r208 lapse fixed;
settled-line gate bypass fixed; resume openers read L.open[].label directly
— C3c watches them). (6) Median-death-day movement is a panel-level
descriptive, not a per-change claim. (7) The funeral-mend public line is a
SECOND consumer of a stored-vs-live value — check stated numbers against
computed values. (8) Analyzer panel-wide dedupe maps must be seed-scoped.
(9) C3c close-out rule: the targeted harness judges the watch; a panel with
no qualifying case is no longer "UNMEASURED" once the harness has spoken.
(10) C3d promotion rule: a watch graduates to CONFIRM when a fix for it
lands; the panel then judges the fix in the wild. (11) NEW this run: the
NodeAway panel metric needs an alive bench to mean anything — a 0/0/0
panel on an empty-village band is compositional, not a resolution. A future
crisis run that wants to judge the muster-vs-travel tension should check
the bench is alive before reading the metric. (12) NEW this run: resume
openers quote a stored line — a truncation in the quote renders the "NPC:"
prefix of the next line inside the quote (14494 d28). The quote path
should cap at a sentence boundary, not a character count.
