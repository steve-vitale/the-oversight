# Break-it r15 — shows & broadcast (2026-10-11)

Hostile-player attack on `src/js/contests.js` (show/summons/watch paths), `broadcast.js`, `contestEngine.js`.
Prior rounds r10–r14 + shows-break (2026-10-09/10) already covered: 2/week budget, stunt double-prize,
care-package farming, reqKcal honesty, countdown recast, resolve-time eligibility recheck, prize idempotency,
whim announcement (contests), TV-doesn't-kill, broadcast frame save/load, eligibility off-board panel.
This round attacked what was NOT covered.

## K1 (BROKE + FIXED): same-week ratings-summons re-summon loop

**The attack.** The ratings dip flag `v._dipping` is computed once per week in `contestTick` and frozen
for the whole week. The fame-seeker F1 fix (2026-10-10) moved viewership +2 (+recordMoment +1) on a
delivered stunt so "the numbers tick up" — but moving the number cannot move the frozen flag. The same
dip re-summoned the player the next dawn: "RATINGS SUMMONS — the numbers are soft" while the numbers
had just gone up. Incoherent, and a real cost loop (200 kcal + 4 trauma per stunt).

**Proof (before).** Realistic week-2 simulation, days 15→20, proper week-boundary handling, stunt
delivered day 15: **21/40 runs re-summoned on days 16–20** (`/tmp/verify-dip.js`).

**Fix.** `src/js/contests.js`, `_showEnd` summons-win branch: clear `vv._dipping = false` alongside the
+2 viewership bump. The stunt worked — the week is no longer dipping. One flag, and it also stands down
the dip's other readers for the rest of the week (75% contest share, +0.15 scheduling). Phone-it-in and
refuse do NOT clear it (they promise nothing, move nothing — by design).

**Proof (after).** `scripts/test-shows-breakit-r15-20261011.js` E2: dip flag asserted cleared; 60 same-week
dawns post-stunt, **0 re-summons**; 486/486 × 3 seeds (424242, 777001, 999983).

## Held (attacked, did not break)

- **S1 — phase-graph termination sweep:** every choice of every phase of all **44 contests**
  (playable + givesChoice +1-shifted + watch) and all **30 shows** (player + villager-watch + together)
  resolves to a valid phase index or a known terminal (WIN/LOSE/MIXED/SHOW_VILLAGER/DIE/REFUSE/VERDICT/
  MOOT_JUDGE/MAW_JUDGE). Zero bad targets, zero choiceless (stuck) phases. The givesChoice shift path —
  the real array the modal uses — swept separately.
- **E1 — 2/week budget:** forced-favorable RNG, 20 ticks/day; exactly 2 scheduled, week rollover resets
  cleanly, every returned event consumes exactly one slot, no phantom consumption.
- **E3 — watch-mode bet:** 2x payout fires exactly once; post-verdict re-entry is a no-op, kcal unchanged.
- **L1 — villager-show modal:** won/lost/mixed/refused all clear `activeContest` and lift the broadcast frame.
- **H1 — show-path whim:** the 10% whim is announced ("The System's whim: X is *interesting*"), same rule
  as the contest whim.
- **D1 — dead code:** broadcast.js + contestEngine.js loaded in index.html and runtime-wired; all 44
  contest templates pickable at some wave; all 30 shows have authored SHOW_BEATS; ticker non-empty
  when live; crowd row covers every beat type.

## Sibling sweep (same bug class: frozen state a resolving action should clear)

- `apCarePackage` 4-day `lastPackageDay` gate — held (all fan paths funnel through it).
- `apClubBoon` 5-day `lastBoonDay` gate + announced rewards + honest pantry handling — held.
- Ratings milestones: the +5 bar ratchets per milestone — not farmable — held.
- The three `_dipping` readers (summons branch, contest share, scheduling) all clear with the one flag.

## Canon gaps (noted, not built — no copy lies about them)

- **Pilot episode:** docs/CONTESTS.md says the first challenge is a pilot episode and "the System says
  so out loud" — no implementation anywhere (grep: zero hits). The product never claims it, so this is
  a missing feature, not a lie.
- **"The show is restless" teaser:** canon says the player can see a pull approaching (gossip/System
  teasers) — not implemented as a scheduling teaser.

## Regressions

- test-shows-break-20261010.js: 81/81 · test-break-contests-20261010.js: 50/50 ·
  test-fameseeker-20261010.js: 41/41 · test-break-contest-r10.js: 20/20 — all green.
- Ontology: 63/63 validated.

## Files

- `src/js/contests.js` — the one-line dip-clear fix (+8-line comment).
- `scripts/test-shows-breakit-r15-20261011.js` — 486 assertions × 3 seeds.
