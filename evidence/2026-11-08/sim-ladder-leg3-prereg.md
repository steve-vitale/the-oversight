# Victory-gating ladder, LEG 3 — PREREG (2026-11-08)

Build: overtime stretch + Haven panel bar + cash-out + banked points +
per-stage rewards + tribute-readiness fix (brief
`~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/victory-gating-build-brief-draft.md`,
§§(b.6), (b.7), (b.8), (b.10), (b.11), (c), (d), (f) + main-session calls
on (f)). Written BEFORE any proof/panel run. Metric binding
(MEASUREMENT.md §14): a miss is NO-GO, never re-scored.

## Base

Master `4fe571095f3acc05af99b30257da973f58b02486` — "journey-succession
r157: refresh neutral proof after teach fix (real panel seed 7 x 4 policies
x 150d, neutrality 4/4) + closeout evidence". The task briefed base
`2d604ef5b` (leg 2's merge); master moved twice under leg 3 before build
start: journey-deepening r119 landed first (`ff50fc3de`, `d7c29a721`,
`715c2918d` — ladder/trust snaps + analyzer joins + proof test 40/40), then
journey-succession r157 landed during worktree registration (`2a1b383d8`,
`ebe2329ba`, `4fe571095` — teach-narration fix in `src/js/conversation.js`
+ neutral-proof refresh in `scripts/balance-proof.json` + closeout
evidence; 301 files, almost all evidence transcripts). Neither move touches
any leg-3 scope file (overtime/app/metaProgression/ladder/table-endings
unchanged between `715c2918d` and `4fe571095` — verified by diff); the
r157 neutral-proof refresh is the CURRENT retained proof, and leg 3 will
refresh it again after its own changes per bar L3-8.
Appendix file map re-verified against this tip: `src/js/overtime.js`,
`src/js/app.js`, `src/js/metaProgression.js`, `src/js/ladder.js`,
`src/data/table-endings.json` all present; leg-2 API present and read in
the main tree at this tip — `Game.ladderCfg()`, `Game.villageLadder()`
(stage LIVE 0–3, peakStage monotonic, counted/total/capped/detail incl.
bundleBonus), `Game.ladderStage()`, `Game.ladderLine()`,
`Game.ladderCapstoneReady/Delivered()`, `Game.ladderDeliverCapstone(kind)`,
`Game.feastBundleBuyOut()` (no args, returns {ok, why?, spent,
bundleStage, cost: 8000, day}; writes a bundle feast-log entry, quality 0),
`tablePreview()` carries a `ladder` block, `tableActive()` true from
capstone delivery until finale resolves (mercy already wired by leg 2).

## Scope — and only this scope (leg 4 owns calibration panels + final proof refresh)

- `src/js/overtime.js` — `overtimeTick()`: tier interval stretches with
  ladder points, +1 day per 4 ladder points (brief §b.6, Q5 overtime only
  — no raid-cooldown stretch, no season-turn delay). `daysPerTier` stays 7
  in titans.json; the stretch is computed at runtime from the ladder's
  counted total. New helper `overtimeInterval()` (days per tier, testable).
  The tier announcement line names it ("the wait stretches — the village's
  standing buys time"). Only bites after announcement.
- `src/js/app.js` — `panelHaven()`: the ladder bar next to `tablePreview()`
  and `havenGrowthHTML()` (brief §b.7): stage name, counted points per
  track with capped tracks marked ("Fight 9 → 7 · capped"), the threshold,
  and the next rung's missing pieces in the `fullSeatShortfall` voice. One
  compact block, no new view, one-screen rule holds. ALSO the cash-out
  action in the same panel (brief §b.10, offered once the village holds at
  least Regional stage — read as PEAK stage ≥ 2, the same peak reading leg 2
  chose for the seat gate: a dip from deaths must not take away the
  dignified exit): "End the run as a Respected Village". ALSO the
  feast-bundle buy-out button calling `Game.feastBundleBuyOut()` (8000 kcal
  shown; refuses honestly when the pantry is short / stage already banked /
  exiled / away). AND the capstone delivery entry point: one Haven action
  per ready capstone calling `Game.ladderDeliverCapstone(kind)` when
  `ladderCapstoneReady(kind).ready`.
- Per-stage rewards (brief §b.8 + Q4 call — NOT memberBenefits; one
  concrete grant from existing systems per stage, growing with the stage):
  - Village → a river trader arrives today (a trader; sets
    `state.scholar.riverTrader` exactly as `evRiverTrader` does, so the
    panel's existing feed/trade/snub block appears). Small, immediately
    useful. WHY: the trader is the game's existing traveling-merchant
    system, and a Village-stage village most needs goods + news.
  - Regional → a free shelter rises: housing +2, no wood cost (a building;
    the `buildShelter()` write with its 10-wood price waived — the reward
    IS the waived cost). WHY: housing is the binding growth constraint at
    Regional scale, and a building is the visible "the village grows"
    reward.
  - National → a village bows to Haven: a link forms with the best-known
    unlinked village, Haven primary, standard 4000 kcal/wk tribute (a
    link; via the existing `_formLink`, perception-gated on `knowsVillage`
    — never a village the scholar never heard of). Fallback when no known
    unlinked village exists: a free shelter (the village builds upward
    while it waits to be known). WHY: at National the village most needs
    the scale the full seat demands, and a link is the biggest grant short
    of the seat. The grant that landed is recorded.
  Stage-completion detection rides the existing `ladderStageBeat` path
  (wrapped from metaProgression.js — ladder.js untouched for this): grant
  once per stage, recorded on `progState().ladderRewards` so it cannot
  repeat; a jump 0→2 grants both missed stages. The buys-time stretch
  (b.6) is also a per-stage reward in effect.
- `src/js/metaProgression.js` — banked-points store ONLY (storage pattern
  metaGet/metaSave; the Records rule itself is NOT rewritten):
  - WRITE: when a village is lost (game over) or cashes out (§b.10), its
    counted ladder points are banked into the Records store as
    `ladderBank: {points, at, kind: 'lost'|'cashout'}`. REPLACE (not
    accumulate): the bank holds the most recent fallen/cashed-out village's
    points only. Loss banking rides a `wipe()` wrap (game-over paths all
    end in `wipe()`; the wrap banks only when `over && villageLost &&
    !won && !alreadyBanked`); cash-out banks explicitly inside
    `ladderCashOut()` before ending the run. A table win does NOT bank
    (b.11 names loss/cash-out only) and does NOT clear the bank either —
    the bank is spent by use (below), not by winning.
  - READ SIDE (designed here, implemented in metaProgression.js because
    ladder.js is restricted to the tribute fix — see below): a
    `villageLadder` wrap applies the bank. `ladderBankedHeadStart()` returns
    `min(bank.points, 6)`; the wrapper adds it to `counted`/`total` (named
    in `detail.bankedHeadStart`, outside the per-track cap like the bundle
    bonus) ONLY while the current village's peak stage is 0 — i.e. only
    toward the Village rung. Once the village's peak reaches 1 the bank is
    SPENT: the wrapper clears it from the store and passes the ladder
    through untouched. Regional/National ignore the bank BY CONSTRUCTION:
    the wrapper never applies it past peak 0, and 6 points can never reach
    the 26-point Regional rung from below 12 anyway. Wave Standing is never
    banked (`standing.js` untouched, never read by the bank). Knowledge
    persists without cap (Records entries, as today). If the coordinator
    prefers the read inside `ladder.js` proper, it is a ~10-line change
    there (same flagged-amendment pattern as leg 2's bundle bonus) and this
    wrapper is removed then — flagged in the run note, not patched silently.
- `src/data/table-endings.json` — the Respected Village ending entry,
  composed like the others: `paths.respected-village` with one entry per
  ladder track (`track:<track>`, light moral only, `{title, lines}` — two
  spare second-person lines each, the file's voice). Cash-out reads the
  entry for the village's top counted track and says it aloud. The
  validator (`scripts/validate-table-endings.js`, green-listed) gains a
  minimal special case for this one non-path key (selectors track:* only,
  light only, lines required, finals forbidden) in the same commit as the
  JSON change — a design-change update, not a loosening.
- Cash-out (`Game.ladderCashOut()`, in metaProgression.js): guards (peak
  stage ≥ Regional, not already over/won/cashed-out); banks the village's
  counted points (capped read ≤6 by the read side); records the ending as
  a `table_won` frame — `recordLegend({outcome:'table',
  frame:'respected-village', choice:<title>})` + the frame written to the
  Records store's `table.frames` DIRECTLY (not via `metaNoteTable`, which
  would grant the "Reach the galactic table" achievement for a run that
  never reached the table — the frame is recorded, the false achievement
  is not); says the ending lines + a `recordMoment`; clears
  `tableWaiting`; sets `over=true, won=true`; `wipe()`; `save()`
  (mirroring the table-win ending sequence in table.js).
- SMALL BOUNDED FIX (leg-1 follow-up, coordinator-approved): tribute
  scholar-readiness gap — leg 1's `ladderCapstoneReady('military_tribute')`
  counts the scholar as a payable veteran, but leg 2's delivery honestly
  refuses when fewer than 2 non-scholar veterans exist. Fix the readiness
  check in `src/js/ladder.js` to count only non-scholar living wave-4
  veterans, so readiness and delivery agree. ONE function
  (`_ladderLivingVeterans` gains a non-scholar variant / the tribute branch
  filters the scholar — exact shape decided in the commit), plus a unit
  test. Nothing else in ladder.js changes.

## Bars (each is pass/fail; a miss is NO-GO, never re-scored)

- L3-1 OVERTIME STRETCH: `overtimeInterval()` returns 7 at 0 counted
  points, 10 at 12, 17 at 40; a real `overtimeTick()` raises the tier at
  the stretched interval (not at 7 days) on a 12-point village; the tier
  announcement names the stretch ("standing buys time"); the tier never
  falls when the interval grows; `daysPerTier` stays 7 in titans.json.
- L3-2 HAVEN PANEL BAR: the panel renders the ladder block (stage name,
  per-track counted with capped tracks marked, threshold, next rung's
  missing pieces) from `villageLadder()` — verified by the UI-proof route
  (see L3-7): app.js is DOM-only and not loaded in node tests, so the
  panel is proven by a node DOM-stub render of `panelHaven` if one exists
  for it, else by careful code read + the harness-level behaviour
  underneath, documented honestly. The P5 human phone check at 390×844 is
  LEG 4's, not this leg's — this leg does NOT claim a phone check.
- L3-3 PER-STAGE REWARDS: each grant lands exactly once per stage in unit
  tests — Village: a river trader is present today; Regional: housing +2
  with no wood spent; National: a link forms with a known unlinked
  village (Haven primary, trust 30, 4000 kcal/wk) OR, when no candidate
  exists, a shelter rises instead (fallback proven separately); a second
  stage-beat call does not re-grant; a 0→2 jump grants both stages.
- L3-4 CASH-OUT + BUY-OUT + CAPSTONE BUTTONS: cash-out offered only at
  peak stage ≥ Regional (refused below); a cash-out run records the
  Respected Village ending (legend frame `respected-village`, Records
  table frame present, ending lines said) and banks ≤6 points, then ends
  the run (`over && won`, save wiped); the buy-out button refuses honestly
  when the pantry is short / the stage already banked / exiled / away
  (the engine's refusals, surfaced by the button); capstone actions appear
  only when `ladderCapstoneReady(kind).ready` and call
  `ladderDeliverCapstone(kind)`.
- L3-5 BANKED POINTS: banking on loss (game over) and on cash-out; the
  bank REPLACES (a second fall overwrites the first — proven); a new
  village sees at most 6 banked points toward the Village rung (rigged:
  bank 40 → head start 6; counted 6 + bank 6 → Village opens at 12);
  Regional/National thresholds ignore the bank (rigged: counted 20 at
  Village peak + bank 6 → still Village, never Regional; a banked village
  at 25 counted + bank 6 → still not Regional via the bank); wave Standing
  never banked (standing.js untouched; `villageStanding()` reads no bank);
  the bank is spent (cleared) once the new village reaches Village peak.
- L3-6 TRIBUTE READINESS FIX: scholar-veteran + 1 non-scholar veteran
  reads NOT-ready (`veterans-short`, veterans 1); 2 non-scholar veterans
  reads ready; delivery and readiness agree in both directions.
- L3-7 PROOF HYGIENE: all new unit proofs green
  (`scripts/test-ladder-time-*.js`, `scripts/test-ladder-cashout-*.js`,
  per-stage reward tests); `node scripts/check-wired.js` on overtime.js /
  metaProgression.js / ladder.js shows nothing unwired of mine (new entry
  points carry `// wired-exempt` only where the pattern requires it —
  cash-out/buy-out/capstone are called from app.js, which check-wired
  scans); `node scripts/validate-ontology.js` green (new methods added to
  the @ontology provides lists; docs/ONTOLOGY.md regenerated by the
  generator, never hand-edited); `node scripts/check.js --quick` shows no
  NEW failure attributable to this leg (adjudicated pre-existing set
  carried from legs 1/2: mobile-combat-cadence, occupation-panels,
  establishment-r20, phone-frame-proof — the last stays red until a
  browser-capable agent refreshes receipts, owed, do not hand-edit proof
  hashes); `node scripts/validate-table-endings.js` green with the
  respected-village entry. No file outside overtime.js / app.js /
  metaProgression.js / table-endings.json + the ladder.js readiness
  one-function fix + tests + evidence + the validator special case is
  touched — progression.js / table.js / game.js / standing.js /
  hierarchy.js / tracks.js / tracks.json / feastBuff.js explicitly NOT
  touched.
- L3-8 MEASUREMENT PAIR: if the measurement-proof pair
  (test-measurement-proof-update / test-measurement-workflow) goes red
  because this change alters what the game reads, refresh the neutral
  proof the leg-1/leg-2 way (fresh panel seed 7 × 4 policies × 150d +
  scripts/balance-proof-update.js) in my own commit and say so. Do NOT
  leave the pair red on merge if a refresh fixes it. No balanced panel in
  this leg (leg 4 owns calibration panels). No fresh seed band needed.

## Explicitly NOT this leg (leg 4's)

- The P5 human phone check at 390×844 of the Haven panel bar.
- P6 (time actually bought on announced seeds) and P7 (mercy/cash-out)
  panel bars — the unit-level cash-out/overtime proofs here are not the
  panel bars.
- The full calibration refresh and final proof refresh.
- Any threshold/conversion retune (12/26/40 stand; the panel moves them).

## Worktree / process notes

- Worktree `build-ladder-leg3` (owner coord-victory-gating). Registration
  hit the EPERM write flap twice at build start (2026-11-08 ~12:40–12:53Z:
  `git worktree add` checkout reached 100% then "Could not reset index
  file to revision 'HEAD'"; `git update-ref` probes failed intermittently
  on `.git/refs/heads/*.lock`) — retried per the flap-response skill
  (probe first, wait, never route around with manual ref edits). Branch
  left behind by the first failed attempt was verified at master tip with
  zero unique commits before deletion.
- Commit early and often via `scripts/safe-commit.sh` (prereg first, then
  overtime, then panel, then cash-out/banked, then proofs); verify
  `git status --short` after every safe-commit and repair index clobber
  the documented way. Merge `--ff-only` to local master only after
  verifying the base is current and main-tree HEAD matches; never push,
  never bump versions, never verify live — the ship loop owns those.
  Report "merged locally, pending ship".
- Small commits, one task each. `[needs-eyes]` on the Haven panel bar, the
  cash-out action, and the per-stage reward beats — Steve checks those on
  his phone.
