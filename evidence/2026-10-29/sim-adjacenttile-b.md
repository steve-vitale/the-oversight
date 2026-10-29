# sim-adjacenttile-b — EVIDENCE (adjacent-tile guard fix, NEW prereg)

## Standing of the prior run (never re-scored)
`sim-standinghome-retry-b` PASSED under its own prereg (pilot GO, pooled
GO) and that verdict STANDS. This run is a NEW run under a NEW prereg
(`evidence/2026-10-29/sim-adjacenttile-b-prereg.md`, committed as
6edae4e8b BEFORE any judged after-leg), per docs/MEASUREMENT.md §14,
attacking only the retry run's documented blind spot: seed 10772 days
10–11, player at trail_edge (4,3), one hop from haven with a CLEAR hop,
never walked home because the standing step's already-home guard used
`Game.playerAtHaven()` (Manhattan distance ≤ 1 = "at haven", a
narration-presence gate) while the player was NOT on the haven tile.

## The change (policy-side ONLY, default OFF, inside the gated instrument)
In `goHomeStanding` (scripts/policies/competent.js) ONLY: the
`Game.playerAtHaven()` already-home check is DELETED. The already-home
guard is now the tile check alone (map px/py == haven px/py → skip).
Everything else in the step is unchanged: gate OFF → no-op; game-over /
combat → skip; inside a tent → skip; haven tile not on this board →
skip; the walk is still Arm B's `walkHome` (engine `travelTo` steps,
one hop at a time — docs/MAP.md §6: NO TELEPORT, ever).
- `Game.playerAtHaven` itself is NOT changed (src/js, wide blast
  radius). No src/js touched anywhere. No default flips (the
  instrument stays default OFF). No other guard or gate touched.
  scripts/policies/nighttravel.js untouched (sibling arm's area).

## Substrate (identical to the standinghome-retry run)
`GRANT_THIEF=1`; harness gates FATAL `COMPETENT_FEAST=0 SEATDRIVE=0
PLENTYDEPRI=0 DEPOSITGATE=1`; `COMPETENT_ROUTE_AROUND` UNSET;
`COMPETENT_TRIPHOME_ROUTE_AROUND=1` in BOTH legs (before leg = the retry
run's after behavior); `COMPETENT_STANDING_HOME=1` in the AFTER leg.
Horizon 30 days, death-aware. The ONLY difference between legs is the
already-home guard (playerAtHaven vs tile check).

## Staging verification (before any judged after-leg)
All 24 banked before-leg files (retry run's after corpora) parse, are
non-zero, and reproduce the retry run's published after-leg numbers
exactly: pilot refused 0, hop-clear 0, standing 10752 day 12 only,
starvation 4; confirm refused 0, hop-clear 2 (10772 only), standing
10762 day 13 + 10770 day 5, starvation 7; adjacent-away census EXACTLY 2
evenings in all 24 seeds — both 10772, loopDays 10–11, hop-clear at
(4,3) trail_edge, kcal 588 → 106. No file was corrupt, so no before
seed was re-run. The "other hop-clear seeds" band is therefore EMPTY:
10772 is the only hop-clear seed in the corpus, which is why the pilot
is 10772 + the three standing-firing controls, as pre-registered.
- Proof test `node scripts/test-adjacenttile-b.js` → PROOF-GREEN before
  any judged after leg: placement cases (10757 (3,3) creek detour,
  10752 (1,4) rubble detour, at-haven and in-tent no-fire, gate-off
  neutrality) all PASS, and THE FIX CASE passes: fresh 10772 game,
  player placed at (4,3), `playerAtHaven()` asserted TRUE off-tile,
  hop clear → gate ON reaches (4,4) and banks a fired day, 0 detour
  steps.

## Pilot verdict under the NEW prereg: GO
Before → after (10772, 10752, 10762, 10770):
- 10772 conversion 2/2: PASS. After-leg loopDay 10 evening at-home
  (4,4), standing step fired day 10; loopDay 11 evening at-home (4,4)
  by trajectory (day 10's rescue put the scholar home). Before-leg
  loopDays 10–11 were both hop-clear at (4,3).
- Pooled pilot hop-clear: 2 → 0. Bar: after ≤ 1. PASS.
- Controls: 10752 fired [12]→[12], 10762 [13]→[13], 10770 [5]→[5],
  refused 0→0 on all three. PASS — the guard change does not disturb
  existing standing behavior.
- G1 causal-window starvation deaths: 0 (player 0). HOLD. The new day-10
  step's window is days 10–17; the after leg has NO starvation death
  on 10772 at all (before: 1 player starvation death, day 11).
- G2 honesty violations: 0. HOLD. The one new standing evening (day 10)
  ends on the haven tile; the step moves only via `walkHome` engine
  travel (placement proof).
- Pooled pilot total starvation REPORTED-NOT-JUDGED: 5 → 4 (the −1 is
  the avoided 10772 player death; 10752's 4 villager deaths, days
  25–26, persist unchanged, outside the day-12 window).
- Refused 0 → 0 (reported, not judged). Median survival 30 → 30 days.
- OVERALL PILOT: GO (all bars hold) → confirm spend authorized.

## Confirm verdict (13 seeds) + POOLED verdict: GO
Before → after (10758, 10759, 10760, 10761, 10763, 10764, 10765, 10766,
10767, 10768, 10769, 10771, 10773):
- Hop-clear 0 → 0 (bar ≤ 0). Refused 0 → 0. G1 0. G2 0. Controls
  n/a (no standing fires in this band either leg). Pooled total
  starvation 6 → 6. Days alive identical per seed, including the two
  early village-lost endings (10760 day 28, 10761 day 22, unchanged).
- POOLED (pilot + confirm, 17 seeds): hop-clear 2 → 0 (bar ≤ 1) PASS;
  10772 2/2 PASS; G1 0 HOLD; G2 0 HOLD; controls OK; refused 0 → 0
  (reported); pooled total starvation 11 → 10 (reported, not judged
  — the −1 is the avoided 10772 player death); median survival
  30 → 30 days.
- OVERALL POOLED: GO. Verdicts computed by
  `scripts/test-adjacenttile-b.js` (verdict mode), not hand-counted.
- Single-variable cleanliness: 16 of the 17 judged seeds are IDENTICAL
  on every reported metric (hop, refused, standing census, starvation,
  wave, days alive). ONLY 10772 diverged, exactly at the rescue. The 7
  unrun seeds (10750, 10751, 10753, 10754, 10755, 10756, 10757) are
  provably no-op under this change per the prereg (zero away evenings
  of every kind, zero standing fires in the before leg).

## 10772 trajectory (reported, not judged beyond the bars)
- Deaths 17 → 13. The avoided death is the day-11 player starvation
  death; later deaths differ by trajectory divergence (the rescued
  scholar lives to fight different fights — e.g. after-leg day-17
  "the wild" player death instead of day-11 starvation). No starvation
  death occurs in the after leg on 10772 at all.
- Max wave unlocked 3 → 2 on 10772 only (all other judged seeds
  identical). This is trajectory divergence within a 30-day horizon,
  not a judged metric and not a reachability claim in either
  direction: rescuing the scholar changes which fights happen, so a
  wave-3 unlock that the before leg reached by day 30 is not reached
  in the after leg's different 30 days. Disclosed, not hidden; the
  prereg judges hop-clear/G1/G2/controls, and all four hold.

## Sense-test (transcript, seed 10772 after leg, days 10–11)
The rescue reads as a real return home, not a teleport and not a ledger
artifact. Method: a narration-on diagnostic replay
(`scripts/debug-adjacenttile-10772.js`, `loadGame` with
`narration: true` — the harness silences `say` by default, which is why
the first replay captured 0 lines) whose 12 evenings match the judged
after-pilot corpus evening-by-evening (position, kcal, standing fired
— all 12 identical), so its narration is faithful to the judged leg.
A gate-off replay likewise matches the banked before corpus
evening-by-evening, so the before/after narration contrast is valid.
- Day 10, after the day's wandering ("Travel 1 tile to wetland" …
  "Travel 3 tiles to trail edge" …), the standing step walks the
  scholar home, narrated verbatim: "Travel 1 tile to Haven." … "You
  walk back into Haven. 13 Codex entries. The village is glad to see
  you." One tile, one honest travel line, arrival narration — the same
  shape as an ordinary walk home, which is what it is.
- That night at home, the sleep sequence says: "⚠ STARVING: health and
  energy falling. You went to bed on an empty stomach." … "Village
  meal: +2154 kcal, +1L water from the communal pantry." Day 11 ends
  at home at kcal 2074 (before leg: day 11 ended at (4,3) at kcal 106).
- Before-leg contrast, same days: day 10 ends "You camp wild tonight —
  no pantry meal. Eat from your pack."; day 11 ends the same way, then
  "🕯️ Linh Singh is dead — starvation. The village stops. Somebody
  screams. Somebody else starts digging." and "The Codex turns a page:
  Linh Singh, 11 days. The mantle passes to Arlo Carter." The guard
  change is the difference between camping wild one tile from home and
  eating the village meal at the fire.
- Known blank, NOT built here (same class as the retry run's
  detour-narration blank): the standing step's walk has no "heading
  home at day's end" line of its own — it arrives as a plain travel
  line, so a player cannot tell a standing-step return from a trip
  return. Documented, not built: this arm is policy-side only.

## Village assessment (plain words)
Before the fix, these 17 villages are healthy home-every-night villages
with exactly one exception: one seed's scholar stands one tile from
home for two evenings, starving in plain sight of Haven, and dies there
on the second night while the village meal is one hop away. With the
fix, that scholar walks the one tile home on the first evening, eats
the village meal, and lives — and nothing else in any of the 17
villages changes at all: no other seed's evenings, deaths, waves, or
survival move by even one count. The fix closes the mechanism's last
known boundary in this corpus: every away evening in all 24 seeds is
now either at-home, refused-and-rescued, or out of the step's reach
(combat, tent, cross-node) — there are no remaining adjacent-away
evenings in the after legs.

## Reachability verdict
No reachability movement is claimed. Max wave in the judged legs is 3
(before, 10772 only) / 2 (after, 10772 trajectory divergence); all
other seeds max wave 1–2 both legs, unchanged. The 30-day horizon
cannot observe regional, national, table, or win reach, and this arm
never touched those systems. Vests, Arc II/III/IV, and wave 4–5 reach
are untouched by this run.

## Wall numbers (every run)
National / table / wins: NOT OBSERVABLE in a 30-day horizon — reported
as such, never as movement. Wave 4–5 unlocks: none in any leg. Median
survival: 30 days (both legs, pooled judged seeds). No wall movement
is claimed or implied.

## Panel limitation (per prereg, same as the retry run)
No scripts/balance-panel.js compare is attached: the panel's contract
metrics do not include hop-clear / stranded evenings. Panel-style
guard metrics (deaths, starvation, wave reach) are reported from the
corpora above instead. This is the prereg's stated limitation, not a
skipped step.

## Metric review (for the NEXT run — this run was judged only on the
new prereg above)
- The 10772 2/2 requirement did its job: a pooled-only bar (≤ 1) could
  have passed with day 11 still stranded; the separate 2/2 bar forced
  both evenings home. Keep the separate index-case bar for any future
  guard-narrowing run.
- G1's 7-day window was never stressed here: the after leg has zero
  starvation deaths on the rescued seed, so the verdict is insensitive
  to any window length on this data. The window's bite remains the
  retry run's 10752 cluster (+13/+14 days), disclosed there.
- The pooled halving bar was nearly vacuous at pooled level (before =
  2, bar ≤ 1): with so few hop-clear evenings in the corpus, the 2/2
  index bar carried the verdict and the pooled bar was a guard against
  trajectory-created hop-clear evenings (none occurred). A future run
  with a corpus richer in hop-clear evenings should re-weight toward
  the pooled bar.
- Wave 3 → 2 on 10772 is a metric-review note, not a verdict item:
  max-wave-unlocked inside 30 days is trajectory-sensitive, and a
  rescue that changes who lives necessarily changes which fights
  happen. Future preregs should not judge wave reach on a rescued
  seed's 30-day window without a longer horizon.

## Blanks filled or documented
- FILLED (and GO, pending coordinator merge): the adjacent-tile blind
  spot — the standing go-home rule now walks home a villager standing
  one tile from Haven, closing the retry run's documented boundary.
  10772's two hop-clear evenings → at-home, player starvation death
  avoided, zero causal-window deaths, zero honesty violations.
- DOCUMENTED (not built): the standing step's return has no
  "heading home" line of its own (plain travel line only); the
  detour-narration blank from the retry run stands unchanged.
- NOT BUILT, per prereg: any src/js change (playerAtHaven untouched),
  any default flip, any other guard/gate change, nighttravel.js.

## Files (this run)
- evidence/2026-10-29/sim-adjacenttile-b-prereg.md (NEW prereg,
  committed 6edae4e8b before any judged after-leg)
- evidence/2026-10-29/sim-adjacenttile-b.md (this file)
- evidence/2026-10-29/sim-adjacenttile-b-corpus-after-pilot/
  (4 files: 10752, 10762, 10770, 10772)
- evidence/2026-10-29/sim-adjacenttile-b-corpus-after-confirm/
  (13 files)
- scripts/test-adjacenttile-b.js (placement + fix-case proof, staging
  check, prereg verdict computation)
- scripts/debug-adjacenttile-10772.js (diagnostic narration replay;
  NOT a judged leg — its evenings match the judged corpus exactly)
- scripts/policies/competent.js (goHomeStanding guard: tile check
  alone; comment updated; no other change)
- Verdict lines: pilot GO (10772 2/2, hop-clear 2→0, controls OK,
  G1 0 HOLD, G2 0 HOLD, pooled starvation 5→4 reported-not-judged);
  pooled GO (hop-clear 2→0, 10772 2/2, G1 0 HOLD, G2 0 HOLD,
  controls OK, refused 0→0, pooled starvation 11→10
  reported-not-judged, median survival 30→30).
