# Journey scale — r125: survival attribution (Lane A leg 3, days 80–140)

Run: `laneA-20261109T2245CST` · 2026-11-10 ~04:43–06:30 UTC · base `91650a90f`
(local master; origin/master diverged, see LOUD items) · worktree `journey-scale`
(+ throwaway `journey-scale-attr` for the WITHOUT arm — never merged).

## Prereg (binding; full text in journey-scale-r125-prereg.md + Amendment A1)

r123's survival collapse (0/4 alive at horizon, 488 vs 646 band days) had no
attributed cause. This run answers it with a matched A/B on the same 4 seeds
(97901–97904): Arm A reuses r123's published band (WITH wideduty); Arm B
re-runs the same seeds on the pre-wideduty base (surgical revert of
`48c93b22b` in a throwaway tree) with a new death-cause census instrument.
Do NOT re-run the ladder band until the attribution lands.

- Q1 ATTRIBUTION: Arm B ≥548 lived days AND ≥1 alive at horizon →
  wideduty IMPLICATED. ≤488 AND 0/4 alive → EXONERATED. Else INCONCLUSIVE.
- Q2 CENSUS: unattributed deaths = 0 on Arm B; every multi-death day (≥3)
  attributed. Q3 MECHANISM: fever/wound deaths + cures + duty-held days,
  Arm B vs Arm A. Q4 PEOPLE CHECK: read Arm B transcripts d90/d120 in full;
  senseless count 0 for clean. Q5 CENSUS: plain-words village assessment
  per seed, Arm B.

## Q1 — ATTRIBUTION: INCONCLUSIVE (by the binding bars)

| | lived days | alive at horizon (d140) | person deaths |
|---|---|---|---|
| Arm A (WITH wideduty, r123) | 488 | 0/4 | 73 |
| Arm B (WITHOUT wideduty, r125) | 525 | 1/4 (97903) | 84 |
| delta | +37 (+7.6%) | +1 seed past the horizon | +11 |

The IMPLICATED bar (≥548 AND ≥1 alive) is NOT met: the alive half is met
(97903 lived to d152, 6 people standing at d140) but the days half falls
23 days short. The EXONERATED bar is also not met. Verdict: INCONCLUSIVE.
Direction favors WITHOUT wideduty slightly — longer-lived villages, one
past the horizon — but not by the margin the prereg demanded, and Arm B
buried MORE people (84 vs 73) getting there: higher turnover, not fewer
deaths. Removing the widened medic duty did not restore r113-level
survival (646 days) either. The wideduty lever is not the collapse's
cause on this evidence; the cause stays open.

## Q2 — CENSUS: complete, books close on all four seeds

The census instrument (`scripts/deathcensus-instrument-20261110.js`,
proof `scripts/test-deathcensus-20261110.js` 4/4 GREEN) drains two sources
every policy day plus once after runDays: the memorial roll
(`village.fallen`) and the telemetry death hook. Deaths are the UNION,
keyed by villager id, each row carrying its source. Arm B: unattributed 0,
errors 0, books close on all four seeds (initial + joins == final +
rostered deaths + leavers).

Three gaps found by the pilot gate and fixed before any band spend
(prereg Amendment A1):
1. **Alien-kill gap (engine):** the alien kill path calls registerDeath +
   removeVillager but never pushes `v.fallen` — an alien-killed villager is
   in telemetry and NOT in the memorial roll (pilot: Milton, d48).
   Reported as a finding; not fixed here (a src change needs its own
   prereg/proof). Tele-only rows: 97901 ×1, 97904 ×1.
2. **Final-endDay gap (instrument):** deaths in the last endDay are
   invisible to every snapshot instrument — the pilot's last survivor died
   in endDay d129 unseen. Fixed: the driver calls `drain()` after runDays
   (idempotent, no daily row).
3. **Guest deaths (instrument):** a death path can push a NON-rostered
   villager into the current village's fallen — Bing (visjoin_105) died
   d106 in a wave-4 fight ('The Big Beast') and sits in Haven's fallen
   although he never joined Haven. Guest deaths belong in the census but
   NOT in the roster books; the census reports rostered vs guest
   separately (Arm B: 83 rostered + 1 guest = 84).

Duplicate-day note (observed, not a defect): days 2, 4, 30 carry two
daily rows each — the ladder instrument's rows show the identical
duplicates, so policy.daily is invoked twice on those days by the
driver/harness. Deaths are index-diffed, so no double-count.

## Q3 — MECHANISM: neither wideduty story shows in the numbers

| | cures (duty) | fever deaths | wound deaths | field-fight deaths |
|---|---|---|---|---|
| Arm A | 56 | 1 | 1 | 68 (93%) |
| Arm B | 53 | 1 | 3 | 75 (89%) |

- The mechanism FOR wideduty (more healer coverage → more cures → fewer
  sickness deaths) does NOT show: cures are flat (56 vs 53) and sickness
  deaths are negligible in both arms (2 vs 4). Villages do not die of
  fever; they die of combat.
- The mechanism AGAINST wideduty (duty pins villagers home) does not show
  as a death-count effect either: WITHOUT wideduty had MORE field-fight
  deaths (75 vs 68) and still lived longer. Healer coverage without the
  widening was already ~92% of days (483/525 healer-present days) — a
  medical-occupation villager was almost always available, so the
  widening barely changed coverage. Duty-held days (Arm B): 404/525.
- Both arms die the same way: combat-led collapse (~90% field-fight),
  ending in a multi-death last day (Arm B: d64×3, d114×4, d129×6, d152×4).
  The collapse is a combat problem, not a medic-duty problem.

Cause mix, Arm B (84 deaths): the wild 62, monster 8, Gavel 2, 'Old Loud'
1 (the Gavel's per-fight display name — same monster), combat 1 (the
fight-death default cause), ambush 1, alien 3 (two tele-only 'alien' kills
+ 'a stranger', the unnamed alien killer per alienPlayers.js:2454),
the arena 2, wound 3, sickness 1. Arm A (73): field-fight 68, contest 3,
fever 1, wound 1. 'a stranger' is an alien kill, not a stranger NPC;
'Old Loud'/'combat' are field-fight deaths the first analyzer pass
bucketed as "other" — fixed in the analyzer (monsterId on the row, and
'combat', now bucket field-fight).

## Q4 — PEOPLE CHECK: transcripts clean; two live defects in raise talks

Read in full: d90 transcripts ×4 (Rattikarn, Baraka, Ursula, Yaroslav),
d120 ×3 (Baraka, Ruth, Oliver; 97901 ended d114, no d120 exists), raise
talks ×13. Senseless count in the d90/d120 transcripts: **0 — clean.**

- The conversations have meaning: grief openings that resolve (Rattikarn,
  Yaroslav), a real question answered honestly (Ruth: "A full night's
  sleep..."; Oliver: "Patience..."), gossip grounded in real villagers
  ("Brandon is back" — Brandon is a real join who later died; "Giulia
  tracked a snare thief by scent alone").
- Baraka's nonverbal French scene is coherent but thin across sittings:
  the same 4 French lines at d90 and d120, the bot nodding 5× (picker
  artifact), and the d90 "come with me" mime never resolves or recurs.
- The 'goon' filler ("Take your time" / "Go on") lands flat after a
  complete answer (Ruth d120: "Their tone levels out — courteous,
  careful, further away").
- **DEFECT (carried from r123, reproduced exactly): Baraka unvoiced
  raise ×6 in 7 days** (97902 d10–d16, all "not-offered"). Baraka speaks
  only French, yet every raise-answer talk closes with a fluent-English
  dismissal from him ("Sure. I'll be around." / "Oh — okay. Later,
  then." / "Right. Go on, then."). The same raise re-fires daily with no
  cooldown. Not this run's to build (scope was the census instrument).
- **DEFECT (same family as r123's unanswered trap-line invitation):
  Stella's trap-line invitation is swallowed by the raise-answer
  template** (97904 d7): she offers "Walk my trap line with me?" and the
  player's reply is a link-proposal acceptance ("All right. Let's ask
  them." / "You carry the proposal to Stonebridge") — the walk is never
  actually answered. Counter-talks stay good: Tashi/Nathan raise a real
  unsettled ambush ("Nobody's settled it").

## Q5 — CENSUS: the four villages, in plain words (Arm B, no wideduty)

- **97901 (lived 114 days):** reached national standing on the ladder at
  d33, priced the lesser seat at d46, held 4 links (2 primary, 2 trade).
  Food was never the problem — the pantry ended at 104,041 kcal. 21
  villagers died, all in fights; the last day took 4 at once. A village
  that had plenty and still bled out in the wild.
- **97902 (lived 130 days):** ladder-national at d32, lesser seat d36,
  5 links, faced wave 5 twice. 18 deaths. The pantry ended nearly empty
  (800 kcal) — the only seed where food ran low at the end. Baraka, the
  French carpenter, was still there at d120, nodding across the language
  gap. Ended with 2 people standing at the last snapshot, then gone.
- **97903 (lived 152 days — the only village past the d140 horizon):**
  ladder-national at d29 (earliest), lesser seat d36, faced wave 5 nine
  times. 18 deaths, 6 joins. Six people were still standing at d140; the
  village lasted 12 more days and ended with 4 deaths on the last day.
  The longest-lived village of either arm, and still a combat ending.
- **97904 (lived 129 days):** ladder-national at d36, lesser seat d44,
  4 links. The highest turnover: 14 joins, 27 deaths (26 of its own + 1
  guest, Bing, who died fighting beside them). The first scholar, Tiana,
  was killed on d30 by a stranger who turned out to be an alien player.
  Ended with 6 deaths on the last day, including the final scholar.

All four: ladder stage 3 reached (d29–d36, same as r123's d29–d39),
lesser seat priced (d36–d46), full seat 0/4, rank stayed regional,
national standing as a village never fired (nationalDay null in both
arms — the ladder's "National Standing reached" line is the ladder's own
stage, not the village becoming national). No village won; no village
starved (hungryDays 0 everywhere at the end); every village ended in
combat.

## Metric review

- Q1's bars bound the run and were honored: INCONCLUSIVE is the verdict,
  not a re-score. The +37-day delta leans WITHOUT wideduty but the bar
  demanded +60; do not read this as exoneration or implication.
- Two metric-definition corrections made mid-run (recorded, not re-scored):
  the analyzer's first pass counted "alive" as alive-at-last-snapshot
  (4/4) and "lived" as last-daily-row day (523); the prereg's bars mean
  alive AT the d140 horizon (1/4) and lived = trust-census end day (525).
  Both fixed in the analyzer; the verdict is unchanged either way.
- The census instrument is the durable deliverable: union + drain + guest
  split, proof 4/4. It caught two real engine gaps (alien kill with no
  fallen push; non-rostered fight deaths in the village's fallen) that
  every snapshot instrument before it missed.

## Telemetry check

`telemetry-check.js` vs `scale.json` baseline, metrics
fightsTotal, fightsByWave.4, maxGameDay: **quiet** (4 files, 3 metrics,
no large deviations). Baseline NOT rolled forward.

## check.js --quick

Not run this run (tooling-only change: scripts/ + evidence/, no src/js in
the merged branch; proof test 4/4 is the relevant suite). Owed on the
next src/harness-touching run, same standing as r122/r123.

## LOUD items (carried, not this run's)

1. **Local master ahead ~355 / behind ~156 vs origin/master** (origin tip
   `a628aeaf3`, PR #121). No reconciliation, no merge, no push — the ship
   loop owns it. This run merged locally only. (Also: master moved during
   the run to `00528fb72` — journey-social-life r167 landed; the branch
   was rebased onto the explicit SHA at closeout, proof re-run, then
   merged.)
2. **Survival collapse cause still open.** Wideduty is not it on this
   evidence. Both arms die of combat; the next attribution step belongs to
   the combat side, not the medic side.
3. **Baraka unvoiced raise ×6 in 7 days** (reproduced exactly) and
   **Stella's trap-line invitation swallowed by the raise-answer
   template** — live dialogue defects, carried for a build run.
4. **Alien kill with no fallen push** (engine gap, alienPlayers.js ~2435)
   and **non-rostered fight deaths landing in the village's fallen**
   — found by the census; need a src fix with its own prereg/proof.

## Evidence

- Prereg + Amendment A1: `evidence/2026-11-10/journey-scale-r125-prereg.md`
- Arm B evidence (4 seeds): `evidence/2026-11-10/journey-scale-r125/`
  (trust/ladder/deathcensus/transcripts/raisetalks per seed)
- Pilot log: `evidence/2026-11-10/journey-scale-r125-pilot.log`
  (97904 ×3 runs: pilot 1 pre-fix, pilot 2 union+drain, pilot 3 +guest
  split — pilot 3 is the gated one); band log:
  `evidence/2026-11-10/journey-scale-r125-band.log`
- Tooling: `scripts/deathcensus-instrument-20261110.js`,
  `scripts/deathcensus-analyze-20261110.js`,
  `scripts/test-deathcensus-20261110.js`,
  `scripts/journey-scale-r125-20261110.js`
- Commits in `journey-scale`: `393630755` (prereg + instrument + analyzer
  + proof + driver), `c33e721a3` (cure-counter fix), `9f9632ce50`
  (union + drain), `3f049f15c` (no empty catches), `bda2853e1`
  (guest-death split). Safe-commit index clobber struck after every
  commit (staged-as-deleted / MM forms); repaired each time with the
  ls-tree pipe; never `git read-tree`.
- `journey-scale-attr` (throwaway, content = `17777346b` minus wideduty
  game.js): released UNMERGED, never merged.
- Rotation 3→0 written at closeout. Lock deleted at closeout.
- Merged locally, pending ship — no version tag; ship loop owns bump,
  push, live verification.
