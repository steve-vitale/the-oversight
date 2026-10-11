# Long-run sim: TRAVEL & REGIONAL lever r2 (2026-10-11)

Lever 8. Worktree `sim-travel-r2`. Canon read first: CANON.md, SCALE.md
("Bar (provisional v1, tune in playtest)" — this run is that tuning).
Builds on the prior round's grief-coalescing lever (commit 1a7a742c, in-tree).

## The lever: viewership accrual — "a season+ of being worth watching"

**Documented blank from last round:** the viewership-40 global bar was nearly
free by day 7. Probed it (`scripts/probe-viewership-20261011.js`): the cause
was worse than "fast accrual". `havenViewership()` in `src/js/ledger.js`
computed its base ONCE — `(pantryKcal)/2000 + codexBreadth*1.5 + arc*5 +
showmanship` — and froze it forever on first read. A fat pantry (44,170 kcal
on seed 1, day 2) read as fame: viewership sat at 35.5 on day 2 and was still
31.9 on day 49 while the live recomputation of the same formula had drifted
to 110. Two bugs in one line: (1) pantry counted as fame, (2) the number was
never deed-reactive after init — and recordMoment fired ~0.5/day, so the +1s
were noise. The frozen snapshot also silently inflated every fame-gated
system: membership applicant odds (`view/200`), applicant reputation quality
(`view > 20`), comms relay "a name the planet knows" (`view >= 40`), sigW3c
ad tiers (12/25) — a day-7 village read as planet-famous everywhere.

**The change** (`src/js/ledger.js`, `havenViewership()`; ontology rule added):
- Init base = `max(12, arc*5 + min(20, showmanship) + min(15, codexBreadth*0.5))`.
  Pantry term REMOVED (a full pantry is prosperity, not fame); codex capped
  at 15; floor 12 = the audience-drift's resting state (contests.js decays
  toward 12, never below) and the show-beat gate's "the show is watching"
  threshold — a quiet fire rests at 12 instead of fighting the ecosystem.
- Ledger showmanship now feeds the number LIVE via `v._viewShoMark` (the
  canon-listed driver — "viewership climbs on ... ledger showmanship" —
  that was dead code; previously it only counted in the one-time init).
- The sticky pool still carries spikes (recordMoment +1, arena acts, stunt
  +2) and real spends (OBJECT −3, declines −10/−3): fame earned and spent,
  nothing refills it. No daily decay added (decay would have broken the
  pinned scale-ladder decline assertion and isn't canon).
- The 40 bar is UNCHANGED (canon provisional) — the accrual was fixed
  instead of moving the goalposts.

## Before/after on identical seeds (12 seeds × 200d, winseek policy)

before = grief-fixed engine + improved policy (`sweep-travel-before2-s1.json`);
after = + this lever (`sweep-travel-viewership-s1.json`).

| measure | before | after |
|---|---|---|
| viewership @ day 7 | 35–41 (every seed) | **12–15 (every seed)** |
| national | 0/12 | **1/12** (seed 11, day 43) |
| global (Watchers) | 0/12 | 0/12 (bar now binds: seed 11 peaked 34.5, died day 60) |
| max link trust | 36–57 band | 36–66 band (no trust regression) |
| regional (first link) | 12/12, day 3–8 | 12/12, day 3–8 (unchanged) |

Trajectory (seed 1 probe): before 35.5 frozen → after 12 → 13 (d7) → 23
(d14) → 30.5 (d21, showmanship 0→14, arc 1→3, codex 8→28). The number now
CLIMBS WITH DEEDS instead of freezing at the pantry snapshot.

## Reachability verdict per rung

- **village → regional**: healthy, unchanged (12/12, day 3–8).
- **regional → national**: 1/12 organic (seed 11, day 43). The ladder is
  walkable; the binding constraints remain survival (median ~30d) + realm
  formation timing, not the trust math (prior round's fix holds: maxTrust
  62 on seed 11).
- **national → global**: mechanics staged correctly (proof test: 45 stages,
  12 doesn't); organic 0/12 — the bar now does its job. Seed 11 reached
  national but peaked at 34.5 viewership and died at day 60: global stayed
  unearned, exactly as "a season+ of being worth watching" intends.
- **national is a live state (observed in the wild)**: seed 11's trace is
  `village → regional(d3) → national(d43) → regional(d50) → national(d56)` —
  the realm came apart at day 50 (break-it r4's revoke, said aloud) and the
  village re-climbed by day 56. The dissolve/reform machinery works
  end-to-end in a real sim, not just in unit tests.

## Proof & regressions

- `scripts/test-viewership-deed-20261011.js` — 12 assertions × 3 seeds
  (42, 7, 99), ALL PASS: fresh read equals the deed formula; pantry
  200,000 kcal moves nothing; 200 codex entries cap at 15; showmanship +5
  feeds live (no double-count on re-read); recordMoment still +1; spends
  are not refilled; 45+ national stages The Watchers, 12 does not;
  viewershipBoard intact.
- Regressions, all matching pristine-HEAD baselines exactly (verified via
  patch-save/restore, identical FAIL sets): test-scale-ladder 6/0/6
  (pre-existing BELONG failures, blank 3 — reproduced on pristine HEAD
  before claiming), test-national-shapes 3 (pre-existing wave-5-gate,
  blank 3), test-ledger 93/2 (pre-existing mantle), test-sig-gavel 24/24,
  test-fameseeker 41/41, test-break-contests-r13 23/23, test-shows-breakit-r15
  486/486, validate-ontology 74/74 (ONTOLOGY.md regenerated).
- One caught-during-work regression, fixed: the first formulation had no
  init floor (fresh games rested at ~8.5), which broke r13's pinned "drift
  floors at 12" and fought the ecosystem's resting state. The `max(12, …)`
  floor resolved it — r13 green, no test touched.

## Village assessment (plain words)

The winseek villages still court hard and die young (11/12 village-lost,
median ~30d), but their fame now has a shape: they start unknown (12, the
show barely watching), and the ones that do notable things — contests,
arena acts, showmanship plays — climb toward 20–35 over a month. Nobody
gets to be planet-famous by hoarding grain anymore. Seed 11's village is
the type specimen of the new world: it built a real realm (trust 62),
sat its court at day 43, LOST the realm at day 50 when the relationships
broke, and earned it back by day 56 — the scale ladder as a lived thing,
not a threshold. It died at day 60 still short of the Watchers (34.5/40):
the audience hadn't watched long enough, and the game said so honestly.

## Blanks filled vs documented

- FILLED: viewership-40 bar nearly free by day 7 (documented blank 2 from
  last round) — fixed at the accrual, bar unchanged at 40.
- FILLED (drive-by, same area): six fame-gated systems were reading the
  inflated snapshot (applicant odds/quality, relay "planet knows" line,
  sigW3c ad tiers) — they now get the honest number; each threshold's
  designed gradient works as its author intended.
- DOCUMENTED (unchanged): duplicate-ish village names (Emberhold / Emberhold
  the Red Table) confuse rumors and first-sight lines — still open, still
  not this lever.
- DOCUMENTED (verified identical on pristine HEAD, not mine): test-scale-ladder
  BELONG-section failures (6 on seeds 11/3333 — the blank-3 family, broader
  than the 3 documented last round; same FAIL lines pre/post my change),
  test-national-shapes wave-5-gate assertions (3), test-ledger mantle (2).

## Files

- `src/js/ledger.js` — viewership retune (+ontology rule; single-line,
  validator-safe)
- `docs/ONTOLOGY.md` — regenerated (one rule added, nothing else)
- `scripts/test-viewership-deed-20261011.js` — proof, 12 asserts × 3 seeds
- `scripts/probe-viewership-20261011.js` — trajectory probe
- `scripts/sweep-travel-viewership-s1.json` — 12-seed before/after data

No `[needs-eyes]`: numbers-only retune, no copy/combat/UI change. The
fame-gated pacing shifts (fewer early applicants, later "planet knows")
are the designed gradients finally working — documented here for Steve
to overrule.
