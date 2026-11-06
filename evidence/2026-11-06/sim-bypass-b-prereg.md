# sim-bypass-b — PRE-REGISTRATION (bypass-damage mitigation lever)

- Run: `fleshout-loop-b-20261106T2300Z`, arm sim-bypass-b, axis scale-onramp /
  winnability chain (Steve 2026-11-03 re-point)
- Arm: `sim-bypass-b`, branch `sim-bypass-b`,
  worktree `~/workspace/worktrees/sim-bypass-b`
- Base: `4a60f7f56` (worktree HEAD at prereg time; master has since moved
  to `987766c0ccc5e007794fa3b843f5bbb952f2c40e` — rebase onto the explicit
  current master SHA before finishing, re-run proof green, report both SHAs)
- Policy: competent verbatim, BOTH legs. The lever is game code, not a
  fight policy: baseline = competent on K=6 code (no cap), armed =
  competent on K=6 + bypass-cap code. No policy file is created or
  changed in this arm.
- Horizon: 150d death-aware (villages stop at death / win; +10d tail max),
  same as survivaltime — the wave-4 kill window lives at days ~45–140.
- Seeds: **88001–88008** (8 seeds, identical on both legs).
- Instruments: `scripts/bypass-instrument-20261106.js`,
  `scripts/bypass-driver-20261106.js`,
  `scripts/bypass-analyze-20261106.js` (copies of the survivaltime
  family, renamed — see Instrument lineage below). Proof:
  `scripts/test-bypass-20261106.js`.
- Corpus: `evidence/2026-11-06/perseed-bypass-b/` (16 files).

## Seed-band reuse (local_seed_band_freshness — full search)

- **Band 88001–88008 is REUSED BY DESIGN — it is NOT fresh and is NOT
  claimed fresh here.** Original naming: `evidence/2026-11-06/
  sim-survivaltime-b-prereg.md` (2026-11-06, arm sim-survivaltime-b),
  which verified the band fresh that morning and ran the 16-file corpus
  `evidence/2026-11-06/perseed-survivaltime-b/` on it. The band is
  referenced again in `evidence/2026-11-06/sim-winnability-round-2130.md`
  (a round summary pointing at the same survivaltime corpus, not a new
  claim). No other prereg, screen, extension band, forbidden list, or
  claim names 88001–88008 (full `evidence/` grep for `88001` returns
  only the three files above).
- Why reuse: this arm is the direct follow-up on the SAME question the
  survivaltime band measured (median rounds in lost wave-4 TB fights on
  identical seeds). Re-running the same seeds on current master (K=6)
  first confirms the survivaltime numbers reproduce as the baseline
  leg, then measures the new lever on identical seeds — the comparison
  is seed-matched twice over (this arm's baseline vs armed, and this
  arm's baseline vs survivaltime's armed). A new band would lose the
  second match for no gain.
- The reuse is recorded here, beside the original naming, per the
  freshness skill: reuse only with the release recorded in a prereg —
  this prereg is that record, directed by the run brief
  (fleshout-loop-b-20261106T2300Z).

## The lever (game code, one mechanism)

- **Bypass cap: a scripted lethal hit can take at most half the
  target's life in one blow.** In `Game.tbDamage` (src/js/game.js),
  after ALL mitigation (armor curve, brace, ability defense, godpath
  absorbs, Gilded Guard) and before `t.hp -= final`, a hit flagged
  `opts.bypassDamage` is capped at `max(1, floor(0.5 * targetMaxHp))`,
  with an honest say line when the cap bites. The flag is set ONLY on
  the two scripted-lethal call sites:
  - Eulogy narrated ending (`src/js/sigW4.js`, `tbDamage('p', 9999,
    'the narrated ending', ...)` — the doom that fires every monster
    turn once the 5 verses run out).
  - Finale title card (`src/js/sigW5.js` `fiFinale`,
    `tbDamage('p', roll([150,200]), 'the falling title card', ...)`).
  - NOT flagged: falling sky (40–60), rolling credits (10–20),
    Nielsen gaze (roll [50,80]) — ordinary-magnitude scripted hits
    that already flow through armor; the cap would not bite them for
    a 100-HP scholar and flagging them would mislabel the mechanism.
  - No wave-4 monster band change (damage 35–95, HP 850–1500, pierce
    0.2–0.5 untouched). No gate/price/deed/readyDemand change. No new
    item, recipe, or system. No change to the Eulogy verses,
    contradict/rewrite counterplay, or the Finale feed-or-finish
    choice — the doom still kills within two firings; the cap only
    removes the one-shot from full health.
- Why this shape (from reading the code, not from the brief alone):
  - There is NO armor-bypassing damage path in TB combat. Every
    monster hit flows through `tbDamage`, and the armor block applies
    to every hit with prot > 0. The "armor-ignoring" hits in the
    survivaltime corpus are 9999-magnitude scripted doom hits: the
    curve DOES apply (9999 → 1214–6269 applied in the corpus) but
    cannot matter at that magnitude. So "apply the armor curve at a
    reduced rate to bypass damage" is not a real option — the bypass
    hits already get the full curve. The per-hit cap is the only
    briefed shape that bites.
  - Verified in the corpus: ALL 11 hits ≥100 applied in the
    survivaltime corpus (both legs) are the Eulogy's 'the narrated
    ending', req 9999, rounds 6–7. No wave-4 burst hit ≥100 exists:
    wave-4 attack patterns are beam/direct/single/rush (see
    src/data/monsters.json), all through tbDamage + armor. The
    "burst" half of the brief's "doom/burst family" has no wave-4
    member; the mechanism covers the doom half and, by the same flag,
    the Finale's card (wave 5, unmeasured here).
  - Why 50% of max HP and not lower: 50% keeps a scripted blow a
    near-death event (full health → half; half health → dead on the
    next firing) and keeps the Eulogy's "It finishes next round"
    telegraph honest to within one round. A 25% cap would let a
    scholar tank four doom firings and make contradict/rewrite
    pointless — the counterplay, not the gear, is the point of the
    doom. A current-HP halving cap was rejected: it asymptotes (each
    hit takes half of what is left, so the scholar never quite dies)
    and would make every fight's tail interminable.
  - The cap sits AFTER all mitigation so the ledgers
    (fightDamageTaken, villager _taken, the instrument hit log)
    record the capped number, and so godhood absorbs / brace still
    do their work first. A naked scholar is capped too (the cap is a
    property of the scripted hit, not of gear) — noted, not hidden.

## Sizing (from the survivaltime armed corpus, 88001–88008, judged)

- Lost wave-4 TB fights (armed leg, n=46): median 7 rounds. 7/46
  contain a ≥100 doom hit, all Eulogy, all ending round 6–7. The
  other 39 die on ordinary damage: median 14.7 applied/round,
  median applied/hit 17, p90 27, max 44 — all under the 50-HP cap,
  so the cap does not touch them.
- Static estimate of the cap's effect: a doom fight's scholar
  survives the doom turn at ~50 HP, then the Eulogy re-fires doom
  the next monster turn for another 50 → death ~1 round later,
  unless the scholar kills the Eulogy or flees in between (at
  ~20 dmg/round vs 850+ HP, a kill in the extra round is not
  expected; the competent policy does not flee mid-fight or
  contradict verses). So the 7 doom fights extend ~6–7 → ~7–8
  rounds. Median over 46 fights: 7 → 7 or 8.
- **Honest sizing verdict, stated before the pilot: the primary bar
  (≥12) is very likely OUT OF REACH for this mechanism.** Reaching
  12 rounds needs applied/round ≈ 8.3 in lost fights; the cap moves
  only the 7 doom fights by ~1 round each and leaves the 39
  ordinary-damage fights at 14.7/round. No bypass-scoped mechanism
  can move the median to 12 — that needs another ~2× on ordinary
  damage (a damage/avoidance lever), and a cap low enough to bite
  the median ordinary hit (≤10 HP) would delete the wave-4 damage
  band into decoration, which is not this arm's brief and not
  defensible under canon. The pilot's value is the ceiling
  measurement itself: it proves, on identical seeds, how far the
  bypass family goes — and if the primary misses, the lever is
  KILLED per the brief, with the next blank named (damage /
  avoidance; the Reunion owns 22/46 lost fights at 6.5 rounds).
- Kill-rate expectation: the extra round adds a little outgoing
  damage; Eulogy kills are rare either way. The secondary (≥10%)
  should HOLD near the survivaltime armed 16.4% — the cap does not
  take kills away, and the denominator (traced fights) may grow
  slightly as more villages reach wave 4. The Finale-card effect
  (a P=27 scholar takes ~82 post-armor → capped at 50) is real but
  unmeasured here: wave 5 is unreached on this band.

## Primary metric (binding)

- **Median rounds survived in LOST wave-4 TB fights ≥ 12** (same
  definition as survivaltime: median `rounds` over traces with
  ending `scholar-death` — the analyzer reports it; the evidence
  file recomputes it from the corpus by hand as a cross-check).
- GO iff armed median ≥ 12. NO-GO otherwise. No re-scoring, no
  friendlier metric, no re-thresholding after the run. If the pilot
  misses, the lever is KILLED.

## Secondary metrics (binding as stated, reported alongside)

- **Wave-4 TB kill rate (log kills / traced TB fights) ≥ 10% on the
  armed leg** — hold the survivaltime gain (armed 16.4% on this
  band). Definition (survivaltime's, midnight-proof): numerator =
  wave-4 entries in `waveKillLog` (`w >= 4`); denominator = traced
  wave-4 TB fights on that leg.
- **Median survival (village days) ≥ 0.8× baseline** (guard).
- **Starvation deaths ≤ baseline + 2** (guard).
- Reported (not judged): scholar deaths per wave-4 kill (survivaltime:
  baseline 19/1, armed 46/9 ≈ 5.1); doom-hit counts per leg (how many
  lost fights contain a ≥100 hit, and what the cap did to them —
  capped-hit count from the hit log: req ≥100 with dmg ≤ 50);
  Eulogy fights' rounds before/after; wins / national / table;
  wave-4/5 unlocks, faced, kills; readiness-5-ready days; living
  wave-4 killers at end; field wave-4 fights/kills.

## Instrument lineage (copies, renamed only — plus two fixes)

- `bypass-instrument-20261106.js`: copy of
  `survivaltime-instrument-20261106.js` (which layers on
  `stageally-instrument-20261106.js`, unchanged). One deliberate
  change: the closeTrace won-branch kill join is the midnightkill
  ±1-day join (kill day within ±1 of the fight day, SAME beast
  `mid`, killer fought in the fight) instead of survivaltime's
  same-day join — the survivaltime evidence's log-vs-matched gap
  was exactly one midnight-spanning kill, and the ±1-day join is
  the sibling arm's fix (sim-midnightkill-b). The primary (log
  rate) does not depend on the matcher; the matched rate does.
- `bypass-driver-20261106.js`: copy of the survivaltime driver,
  renamed (RUN names `bypass-baseline` / `bypass-armed`, OUTDIR
  `perseed-bypass-b`, OFF env `BYPASS_OFF`).
- `bypass-analyze-20261106.js`: copy of the survivaltime analyzer
  with TWO deliberate fixes, both documented here: (1) legs are
  grouped by `run.run` (bypass-baseline / bypass-armed), NOT by
  `run.policy` — verified 2026-11-06: the survivaltime analyzer as
  shipped groups by policy ('baseline' on both legs) and merges the
  legs into one bucket (75 fights, 10 kills on the survivaltime
  corpus); the split in the survivaltime evidence was computed
  outside the analyzer. Grouping by run is what makes the
  comparison possible; the metrics themselves are unchanged.
  (2) the pyrrhic match uses the same ±1-day + same-beast join as
  the instrument. Everything else (damageByRound, sizeNextLever,
  rally rows, best-round composition) is carried verbatim.

## Canon

- `docs/CANON.md` + `docs/MONSTER-WAVES.md` read first. Wave-4 bands
  (damage 35–95, HP 850–1500, pierce 0.2–0.5) are anchored and
  UNTOUCHED. The doom-countdown ruling holds (doom deaths flow
  through maybeCheatDeath — "unkillable means unkillable"; the cap
  does not touch that path, it only bounds the hit that triggers
  it). The Eulogy's counterplay (contradict verses, rewrite the
  ending) is untouched — the cap does not replace it. Steve's
  2026-11-05 tier-protection rule is the justification: "if a
  fighter in full gear and armor appropriate for the tier still
  can't survive, the gear isn't good enough" — a hit that ignores
  all protection by magnitude is exactly that case. No gate/price/
  deed number moves.

## Metric review (filled after the run)
