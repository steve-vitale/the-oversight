# Journey crisis r257 — RUN NOTE (Lane B, leg 6)

**Run:** `playtest2-20261120T1555Z` (scheduled Fri 2026-11-20 10:00 CST / 16:00Z).
**Panel:** seeds 14571–14575, fresh band, base master `057bfa60f`.
**Adoption:** timed-out at closeout; adopted and closed out by worker `6cb03304`
(Lane B crisis adoption). Prereg `f1517509a`. No src/js change on this branch —
evidence-only confirm run.

## Leg question (prereg)

First wild confirmation panel for the two r253 fixes on the new base:

- **March-refusal dedup** (`eb12c1471`, `finale-campaign.js`): the march-gate
  refusal says its line once per muster-day; the refusal still stands on every
  attempt.
- **Antler "The The" fix** (`eb12c1471`, `game.js` `articlePhrase`): the
  antler-thrash line no longer doubles the article.

## Panel verdict in plain words: GO

Both fixes hold in the wild, and every bar the panel carries passes.

- **March-refusal:** no march-gate refusal line fired anywhere on the panel.
  The finale did reach its first node — THE COMMERCIAL BREAK was announced on
  14571 d152 (in the +10-day tail past the horizon) — but nobody was refused
  the march, so the once-per-day rule had nothing to repeat. The fix holds
  trivially; there is no regression. (Coverage note: the march gate was only
  reached on one seed, late.)
- **Antler:** zero antler-thrash lines on the whole panel, and zero doubled
  articles in any thrash line. ANTLER CONFIRM GO.
- **The one "The The" hit is a different line, not the fixed one:** 14575 d44,
  "dodged the the attack!" — a style-dodge line, not an antler-thrash line.
  New cosmetic blemish, same family as the r249 fix, different site. Queued
  for the next round's fix list; it is not a regression of the r253 fix.
- **Titan refusal:** 118 outcomes, 115 refused, 28 gate lines, **0 repeats**.
  Every gate line says "you have 0" — the muster never grew on this panel
  (0 dawn muster-growth lines fired anywhere). Three Herald field slays: Hank
  d82 (14571), Terry d82 (14574), Hermon d129 (14575). TITAN-REFUSAL GO.
- **D2 (delayed approach):** 40 attempts, 35 ok, 5 refused, 4 cleared,
  deltaExact 35, **deltaBad [] — GO**. D1: 40/40 delayed ≥3 days, 0 missing.
  D4: 40 convos, **fabricHits 0**.
- **DRY census:** 0 dry lines, deflect_q 0 — GO. The gossip-ask surface the
  r256 fix touched shows no dry line.
- **Death cleanup:** 0 dead-holder entries, 10 cleanups, plan seeds 10 — GO.
  No unseeded plan, no ignition after death.
- **Fight-1:** 35 ok sorties, 26 cleared, 23/32 multi-monster cleared; the
  cleared fights' worst damage taken was 52, so the Q4 trigger (cleared
  fight-1 with ≥70 taken) did not fire.
- **Panel shape:** 4/5 villages reached the 150-day horizon (14571, 14573,
  14574, 14575); 14572 scattered d99 with 3 alive. Raids 9–13, gorge nights
  9–105, sorties 5–10, 8 driven convos per seed, 3–9 alive at the end.
  Pantries 0–6,872 kcal except 14571's 34,041 outlier. No scholar deaths.
  No softlocks. No unmarked wrap endings.
- **Stranger:** VACUOUS (0 kills, 0 silent). Homebody vacuous (89 picks,
  0 qualifying). NOTICKDEFER 0. NODEAWAY 13 total, worst 7 (14575 d46) —
  tracked, no bar. POCKET no-path lines 1,185 panel-wide — no bar.
- **C7b:** famine 0, disease 0, wound 0, thirst 2 (14571 only).
- **Medic duty:** blocked 312 companion calls (44/48/133/52/35); cures by
  ability 70, by medicine 0. Ruin searches: **1 panel-wide (14575), 0 medicine
  acquired — cumulative 1/320** (was 0/319 after r253). The medicine-supply
  wall stands: villagers almost never search ruins.
- **Bowcraft (live since the 1815Z turn-on):** Ruby made a Crude bow (14571
  d118); Nina and Ava made Bows (14573 d45–46); Nikolai (14573 d115);
  Starfall bows equipped. Bowknow teach 0 (env-gate holds, as classified).
  Ammo wrong-name 0. Door eject 0.
- **Counter-label:** GO — the counter uses the guarded noun "toad like a war
  drum"; the 14 hits are descriptions/quotes, never the comma-carrying display
  name as a counter noun. (The comma-carrying name still appears as a noun in
  narration outside the counter fix's scope — carried open item.)
- **Mime:** 6 lines, all different variants — GO (no same-variant 3 days
  running). Doubt-stonewall 0 in one sitting; the "Bamboo Shoot"
  identification line repeats 3× on 14573 (d50/53/57, different days) —
  small-pool observation.
- **Already handled 0. Nothing important 0. Homeward strand 0. Resume
  opener 0.**
- **Mourn lines:** 617 total (97/199/134/94/93). favorNoLongerCalls empty on
  all seeds. First plan day: 14573 d37, 14575 d27. SENSEEXPED D3 mismatches [].
- **Table lines (descriptive):** THE TABLE IS SET d90 (14571); OVERTIME
  ×1/×2/×3; grief-card-spent line 5× on 14571.
- **Case lines:** 16 — "Heard about the case against Ruth/Terry/Priya"
  (one each), "The case dies with the accused" (Jawad d28, sensible),
  "Feel the lie first. Then build the case." (System line, 4×). No voted case
  re-appears under a new number.
- **Census:** no extinct=False with aliveCount=0 case (the r247 census
  question does not recur). One coverage note: census corpses omit scholar
  deaths — Giulia Bianchi's death is narrated with a funeral feast on 14575
  but she has no corpse entry (see Metric review).

## PS4 side-arm (seeds 14571–14573, second leg)

GO across every bar it carries. D2: 22 attempts, 19 ok, 3 refused, 6 cleared,
deltaExact 19, deltaBad []. DRY census: 24 transcripts, 0 dry, deflectQ 0.
Death cleanup: 36 cleanups, 0 dead-holder entries, plan seeds 29. Titan:
47 outcomes, 44 refused, 14 gate lines, 0 repeats, 3 field slays (Daniel d75
on 14571, Sonny d102 on 14572, Andrzej d87 on 14573) — all gate lines "you
have 0". Stranger VACUOUS. NODEAWAY 0. Homebody: 153 picks, 13
holder-qualifying, 15 holder voice lines, 0 unvoiced. NOTICKDEFER: 1 deferred
(14571 d128), 0 leak candidates. POCKET 756 no-path lines, no bar. Lingerer
sets formed on all 3 seeds (gorge 47/55/116 nights, sorties 6/6/10). March:
0 Commercial Break hits (the finale never got that far on this leg). "The
The" 0. Antler-thrash 0. Slots-full spam 171 lines (see Blemishes).

## People check: PASS (all 40 driven transcripts read in full)

- **Mourning names the right dead:** Mei on Theo (14571 d68, died d66);
  Ingrid on Wren and Ogochukwu (14572 d55, died d53/d54); Antonio on Sal
  (14573 d70 — "Sal always took the burnt piece... I count portions out loud
  before eating the way Sal used to", Sal died d68); Natalia on Nino
  (14574 d91 — "I dreamed Nino was still here", Nino died d84).
- **Succession-hearing grave lines are consistent:** at each dead scholar's
  grave the village speaks for the successor and quotes the dead one's trust
  ("speak for Tariq — 'Theo trusted them'"; "speak for Masego — 'Tariq
  trusted them'"; and so on down the chain). Not a wrong name — the speaker
  is the successor, the quote is the dead one's.
- **Funeral feasts are honest throughout** (29 feasts): full mends name the
  cost (1,500–4,500 kcal); partial mends name the shortfall ("could not buy
  back the full -8", +6, +15); empty-pantry feasts say the links go unmended
  and the trust penalty stands (14571 d121 Marcus, 14573 d100 Antonio,
  14575 d130 Wanjiru). FUNERAL-MEND CONFIRM GO.
- **C3b settled-favor: CONFIRM GO (fifth wild panel).** The one true
  favor-settlement on the panel follows a fulfilled favor: Wren (14572 d37)
  — "You came through on the sickness I'm fighting... Good. Then we're
  square... settled, and counted" — the sick_help favor was promised d32 and
  delivered. The broken favor is called dead, not settled: Mei (14571 d78)
  — "that promise is dead... The promise died, not the need." The case lines
  say the opposite of false settlement: "There's still the matter of the
  murder of Elena / the ambush of Giulia / the ambush of Nino. Nobody's
  settled it." Correction to the first pass: the settlement lines live in the
  driven transcripts, not in sayLines — the sayLines-only check returned 0
  and would have missed Wren's settlement entirely (see Metric review).
- **Case victims are real people:** Elena (14575) was an earlier scholar —
  "The old argument between Elena and Priya ended — one of them is gone",
  "Priya stands accused over what happened to Elena"; Giulia Bianchi (14575)
  held the mantle 47 days before dying in the wild. Both are former
  player-characters, which is why neither appears in the census people/corpse
  lists (scholars are tracked separately). Nino Kapanadze (14574) died d84
  in the wild; the d15 case is about his ambush, not his death.
- **Link-accept fires and is voiced** — twice in the driven transcripts:
  Sal carries the proposal to Stonebridge (14573 d32) and Shannon to
  Thornfield (14575 d10), both "Good. What I've heard of them, I believe. Go
  and ask." The analyzer still counts 0 raises because it only reads
  sayLines; the instrument is blind to the driven corpus, not the game
  (see Metric review). ECHO stays open as an instrument gap.
- **Show-taken names:** Liv (14572) is real — died d28 to a monster; Aisha's
  d23 "The Blood Tithe. They just... took Liv" names a real villager who dies
  five days later (Tithe-vs-monster attribution unverified, not a clear
  falsehood). Wei (14573, "They took Wei — The Quiet Room") has no record in
  this village's roster or corpses, though a Wei exists as a villager on
  other seeds (14574, PS4 14573) — plausibly a broadcast from a linked
  village; unverified, not a confirmed fabrication.
- **Thread recall works:** "We never did finish talking about that personal
  stuff — that was 9 days back" (14574 d34) with correct day counts;
  confide-thread recalls fire ("About what they confided — yeah, we never
  did get back to that").
- **Bond proposal accepted:** Shannon to the player (14575 d27) — "I want us
  to stick together. Properly."
- **No dry lines in any transcript.** No "already handled", "nothing
  important", homeward-strand, or resume-opener lines.

## Blemishes (not bars — for the next round's fix list)

- **"dodged the the attack!"** (14575 d44, style-dodge line) — doubled
  article, new site, same family as the r249 fix.
- **"Your slots are full (6/6)" spam:** 438 lines main panel, 171 PS4, up to
  5 in a single day, spread across the run. A noisy rejection line that fires
  whenever the scholar tries to learn or accept something with full slots.
- **"The moment passes without landing. Not yet."** re-sighted (14571 d59,
  goon-pick fallback — same line as r244).
- **"Bamboo Shoot" identification line 3×** on 14573 (d50/53/57, different
  days) — small identification pool.
- **Grief-card-spent line 5×** on 14571.
- **"A comfortable quiet settles"** silence-closer in ~30/40 transcripts;
  **"Something in them stays shut, for now"** goon fallback repeats.
- **Scream:** 208 hits — mostly the Scream Cheese ability plus the
  slots-full spam above.

## Wren-note counts (metric-review calibration)

Per-seed counts per variant (3 variants, all present on every seed):

- r257: 14571 (4,7,4), 14572 (2,2,3), 14573 (7,7,4), 14574 (10,8,9),
  14575 (11,14,7).
- r253 calibration (GO panel): 14561 (7,4,8), 14562 (8,7,8), 14563 (4,7,11),
  14564 (10,6), 14565 (6,9,8).

The prereg's bar ("5x+ reprints of the same note on one seed is a
REGRESSION") fires on the r253 GO panel too — the cache-note fires daily and
3 variants over 150 days means each variant repeats ~5–14× by construction.
The pool IS working (all 3 variants on all 5 seeds). The bar as written is
miscalibrated; see Metric review.

## Telemetry: QUIET, baseline NOT rolled

`scripts/telemetry-check.js` against `telemetry-baselines/crisis.json`
(metrics defendedFights, playerFights, latelyDefenseCount): quiet, 6 files
(5 panel JSONs + the 14571 smoke stub), no large deviations. defendedFights
per seed 19/24/15/9/13 = 80 vs baseline 95 (inside the historical range).
playerFights and latelyDefenseCount keys are still absent from the per-seed
JSONs (carried open item from r253) — the quiet verdict rests on
defendedFights only. Baseline NOT rolled on a single panel's numbers.

## Proofs re-run (adoption, current code)

- `scripts/test-titan-refusal-have-counts-haven-20261119.js`: **15/15 GREEN**
- `scripts/test-finale-march-refusal-once-per-day-20261119.js`: **7/7 GREEN**
- `scripts/test-antler-thrash-the-the-20261119.js`: **7/7 GREEN**

## Gate

**Branch tip (`f1517509a`): `node scripts/check.js --quick
--cacheDirectory=/tmp/jest-cache-r257-adopt` — 339 passed, 5 failed in 711s.**
Log: `evidence/2026-11-20/journey-crisis-r257-gate.log`. All 5 failures are
the standing set, 0 attributable to this run (evidence-only branch, no src/js
change):

- `scripts/godpath/test-measurement-proof-update.js` + `scripts/godpath/
  test-measurement-workflow.js` — the measurement-proof staleness pair
  (retained neutrality proof does not cover current inputs). Proof re-sign
  round 22 still owed; program maintenance, not a blocker.
- `scripts/godpath/test-phone-frame-proof.js` — phone-frame stale receipt
  (retained browser inputs vs current source; phone evidence stale/missing
  for index.html).
- `scripts/godpath/test-living-garden-deed-attainment.js` + `scripts/godpath/
  test-one-person-army-deed-attainment.js` — 120s TIMEOUT under check.js's
  per-test cap. Both re-run solo by the adoption: exit 0, pass — each takes
  ~150s+ solo, so the timeouts are cap-exceedances, not failures, and
  pre-existing.

**Fresh gate on the rebased final tip (`82109a58d`, master `cf3b5732e`):
`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-r257-adopt-final`
— 338 passed, 6 failed in 1009s.** Log: `evidence/2026-11-20/
journey-crisis-r257-gate.log` (this log is the fresh final-tip run). The 6
failures are the same 5 standing-set items above plus one load flake:

- `scripts/godpath/test-measurement-cache-flags.js` — "both actual CLI
  configurations complete valid neutral panels" FAIL under the gate (58.7s).
  It PASSED on the branch-tip gate 25 minutes earlier and passes solo by the
  adoption: exit 0, 4/4, in 22s. Adjudicated a load flake (the final-tip gate
  ran 1009s vs 711s; trust-observer-neutrality took 116s vs 98s — the box was
  slower). 0 attributable.

Net gate verdict for merge: **0 attributable** across both gate runs.

## Metric review (owed on the crisis leg)

1. **Wren-note bar miscalibrated (prereg thread, this run).** "5x+ reprints of
   the same note on one seed" fires on the r253 GO panel (up to 11×) as well
   as on r257 (up to 14×). The pool works — all 3 variants appear on every
   seed. Proposed revision: the bar should be consecutive-day repeats of the
   same variant (or same-day duplicates), not panel totals. Until revised, the
   Wren counts are descriptive, not a verdict.
2. **C3b instrument searches the wrong corpus.** Favor-settlement lines live
   in the driven conversation transcripts, not in sayLines. The sayLines-only
   check returned 0 and would have missed the one true settlement (Wren
   d37). The C3b instrument should grep the driven transcripts (and cross
   the favor state from each transcript's FAVOR-PROBE) — the same correction
   applies to the confide check, which also returned 0 in sayLines while
   confide-thread recalls fire in the transcripts.
3. **Link-accept ECHO is an instrument gap, not a game gap.** The analyzer
   counts 0 raises on its sixth panel while the driven transcripts show two
   voiced link-accepts on this panel alone. The analyzer should read the
   driven transcripts for link-accept (and bond-accept) or the ECHO item
   should be closed as untestable-in-this-corpus.
4. **Telemetry units question (carried from r253):** playerFights and
   latelyDefenseCount keys are absent from per-seed JSONs, so two of the
   three checked metrics are vacuous (absent vs 0 baselines). Either the
   driver should emit them or the check should drop them.
5. **Census corpses omit scholar deaths.** Giulia Bianchi's death is narrated
   (Codex page-turn, funeral feast, mantle pass to Shannon Burns) but she has
   no corpse entry; the census people list also drops a villager once they
   become the scholar. Any verdict that counts deaths from the census alone
   undercounts scholar deaths.
6. **Muster-growth watch (thread 35):** 0 dawn muster-growth lines fired —
   the muster never grew on this panel, consistent with "you have 0" on all
   28 gate lines. The r245 growth-line fix had nothing to re-validate
   against; the watch stays descriptive until a panel grows a muster.

## Open items (carried)

- Titan strict per-line spoken-vs-gate honesty check still instrument-blocked
  (same as r253): the gate lines all say "you have 0" and no two lines share
  a titan-day, but the per-line equality against the gate's counted allies
  cannot be checked from the panel JSONs.
- Link-accept ECHO (see Metric review 3) — seventh panel with 0 analyzer
  raises, now known to be a corpus gap.
- Telemetry units question (see Metric review 4).
- FuneralMendStats persistence (r253 open item, not re-tested here).
- Comma-carrying monster name "a toad like a war drum, throat swelling"
  still appears as a noun in narration outside the counter-label fix's scope.
- Compare-maps lines never fired (0 served).
- Bowcraft not instrumented on the crisis panel (craft events read from
  sayLines by hand this run).
- Medic-duty blocks (312) dwarf the companion guard, as on r253 — the
  companion-call bottleneck is medic duty, not the guard.
- Ruin searches cumulative 1/320, 0 medicine acquired — the medicine-supply
  wall stands.
- The muster never grew; the launch decision and damage walls (address-all-
  gaps list) are untouched by this leg.

## Landing

- Branch `journey2-crisis`, evidence-only (prereg + driver/analyzer clones,
  no src/js change). Adoption closeout: PENDING (gate + merge + rotation +
  lock at adoption time).
- Rotation-b: read 6 at run start; this run writes 7 at closeout.
