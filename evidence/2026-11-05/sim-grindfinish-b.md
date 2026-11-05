# Grind-to-finish chain decomposition — DIAG-NO (arm sim-grindfinish-b)

Run: fleshout-loop-b-20261105T1322Z. Axis: scale-onramp / winnability chain
(wild ally-join → wave-4 kills → veterans → readiness-5 release → wave-5
facing → full seat). Tracker's freshest open blank: the grind-to-finish
chain, from the 2026-11-05 0915Z run (sim-dmground-a). Prereg:
`evidence/2026-11-05/sim-grindfinish-b-prereg.md` (committed BEFORE any
judged sim). Instrument: `scripts/grindfinish-instrument-20261105.js`
(dmground base + chain fields). Driver:
`scripts/grindfinish-driver-20261105.js`. Analyzer:
`scripts/grindfinish-analyze-20261105.js`. Proof:
`scripts/test-grindfinish-20261105.js` 26/26 (fixtures + live smoke +
off/on neutrality). Corpus:
`evidence/2026-11-05/perseed-grindfinish-b/` (8 files, seeds 99309–99316,
150d, competent policy verbatim, 0 instrument errors).

## Verdict — DIAG-NO. The chain is not the binder.

The grind-to-finish chain WORKS mechanically — and that is exactly why it
is not the binder. On this band the chain's plumbing is sound (lift 88%,
continuation 13/14, re-find 36% in 7 days), the kills that DID happen did
NOT come through it (both kills fresh-entry, non-lifted, pending-live),
and the grind's price is what binds: each grind step costs a scholar's
life, and villages run out of lives before the beast runs out of HP.

| Pre-registered rule | Measured | Holds? |
|---|---|---|
| D4-gap: wounded-entry TB kill rate >= 15% AND >= 3 wounded-entry kills AND fresh-entry kill rate <= 5% | wounded 0/3 = 0% (0 kills); fresh 2/9 = 22.2% (2 kills); wounded-entry fights = 3 (< 5, thin band) | **NO** — fails on every leg: no wounded kills, fresh kills at 22%, thin sample |
| D2: TB→TB reset share (no field fight between) >= 50% | 0/14 = 0% reset; 13 continuation, 1 further-wounded | NO |
| D3: strict 7-day re-find share < 25% | 4/11 = 36.4% re-found within 7d | NO |
| D1: lifted share of TB fights < 20% | 30/34 = 88.2% lifted | NO |
| **DIAG-GO (D4-gap AND any loss channel)** | | **NO** |

No Stage 2: the prereg runs a lever only on DIAG-GO. No game-code change
was made at any point; no gate, price, deed-gate, readyDemand, VETSHAPE,
flee/retreat, or food change. DIAG ONLY.

## The four chain measures

### (a) field→TB — the lift covers the chain (finding #1167 is stale for lifted fights)

- TB fights: 34. Lifted (pre-call tile-monster alias id === mid, so
  tbWorldHpFor enters the fighter at world HP): 30/34 = 88.2%.
  Fresh (def-range roll): 4/34.
- Lift fidelity: 29/30 lifted fights entered at exactly the alias's
  world HP. The one mismatch (seed 99315 d92 reunion) entered 6 HP
  below the pre-call alias read (877 → 871) — mechanism unidentified
  (damage between the alias read and the fighter build, or a second
  wounding path); it does not affect any verdict input, and is logged
  as a finding below.
- Lifted-entry fracHi median 0.60; fresh-entry fracHi median 0.86.
  Lifted beasts enter moderately wounded; fresh rolls enter near full.
- Strict field→TB links (lifted TB entry == most recent prior field
  fight's mHpLeft, same mid): 1 in the whole band (seed 99310).
- Door-flee re-engages: 0. Pending-live TB fights: 3 (both kills are
  among them). WorldOrigin (titan/lingering) TB fights: 23/34.
  Veteran TB fights: 0.

The 2026-10-26 #1167 claim — "TB fights rebuild monster HP from the
def's HP range and never inherit field wounds" — does NOT describe
current behavior for tile-monster fights: the sim-w4tbkill-a phase B
lift (2026-10-28) covers 88% of TB fights and is faithful 29/30.
The remaining reset surface is the NON-lifted channel: wanderer-contact
(pending-live) fights roll fresh — and, on this band, both kills came
through exactly that channel (see (d)).

### (b) TB→TB — no reset at all; the grind continues, one scholar at a time

- Successive TB pairs (same mid): 14. Reset (entry > prev exit): 0.
  Continuation (entry == prev exit): 13. Further-wounded: 1.
  Reset share with no field fight between: 0/14. Gap median 1 day.
- Every pair's previous fight ended 'death' (lost). The mechanism is
  the lingerer restore (game.js:45511): a lingering raider returns at
  min(pre-HP, fighter end HP), floored at 1 — so the next scholar
  faces the beast at exactly the HP the last scholar left it.
- Headline chain (seed 99313, algorithm, days 63–65): one beast fought
  SIX times — 750→624→508→451→267→209→114, each fight 5–7 rounds,
  each ending in the scholar's death. Six scholars died on those two
  days (3 on d63, 3 on d65; roster 7 → 3 → 0), and the village died
  with the beast at 114 HP — one fight from a kill. The grind works.
  Its price is a life per step, and the village had six lives left.
- Seed 99312 (reunion, days 108–111): 715→630→410→341 across four
  fights, scholars dying on d108 (×2), d109, d110, d111; roster 0 at
  the end. Same shape.
- The single further-wounded pair (seed 99315, audit, d81→d117,
  1189→1100 over 36 days, no field fight between) is an unexplained
  HP drop of the #1169 class (see findings).

### (c) re-find — the wounded do get re-met; the field side is nearly absent

- Wounded field exits (0 < mHpLeft < defHpLo): 11 band-wide.
  Re-found at exactly that HP: 4/11 = 36.4% — all within 7 days
  (median gap 2.5d), 3 by a later field fight, 1 by a lifted TB entry.
- But the FIELD side of the grind barely exists on this band: 11
  field fights total (vs 34 TB), and 3 of 8 seeds had ZERO field
  fights (99313, 99314, 99316). Field endings: flee 6, death 5,
  kill 0. Field damage per fight: 0–102 (median ~46 over 2–3 rounds).
- The re-find rate is not the leak (36% > 25% bar) — the leak is
  that villagers almost never meet wave-4 beasts in the field at all
  on this band. The beasts the village fights are lingerers at the
  treeline (23/34 TB fights carry worldOrigin), not wild wanderers.

### (d) kill conversion — kills came fresh, not wounded (n = 2, read carefully)

| TB entry bucket (entryFracHiPrimary) | Fights | Kills | Kill rate |
|---|---|---|---|
| wounded (< 0.25) | 3 | 0 | 0% |
| middle [0.25, 0.75) | 22 | 0 | 0% |
| fresh (>= 0.75) | 9 | 2 | 22.2% |
| Field wounded / middle / fresh | 0 / 8 / 3 | 0 | — |

- The 2 kills: seed 99309 d73, strike, entry 1003 (fracHi 0.84),
  solo scholar Giulia Bianchi, 17 rounds, 1003 damage dealt, won;
  seed 99316 d54, congregation, entry 925 (fracHi 0.84), party of 4,
  10 rounds, 925 damage, killer Valeria Quispe (companion). BOTH are
  non-lifted, pending-live (wanderer-contact) fights — fresh def-range
  rolls, not ground-down beasts. Both killers were dead by the run's
  end (living killers at end: 0/2 seeds).
- The 3 wounded-entry TB fights (the only ones): 99312 d111 reunion
  entry 341 (died, 6 rounds, 73 damage, exit 268); 99313 d65 algorithm
  entry 267 (died, 58 damage, exit 209) and entry 209 (died, 95
  damage, exit 114). All three are the TAIL of the 99313/99312
  grind chains — the village reached the wounded entries only by
  spending its last scholars, then died with the beast still standing.
- The middle bucket — 22 moderately-wounded lifted fights — produced
  ZERO kills. The grind stalls in the middle: fights end in death
  before the kill, the next scholar continues at the exit HP, and the
  village runs out of scholars first.
- Caveat, stated plainly: n = 2 kills cannot overturn dmground's n = 9
  (all wounded-entry). What this band DOES show is that the wounded-only
  kill story does not reproduce here, the wounded-entry sample is too
  thin to judge (3 fights), and the fresh channel killed at 22% while
  the lifted channel killed at 0% (0/30). That inversion — not the
  grind's plumbing — is the finding to chase next.

## Per-seed table

| seed | days | end | w4 fights (F/TB) | w4 kills | lifted TB | strict F→TB | TB pairs (reset/cont) | wounded exits / refound7d | killers (living) | rank | standing |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 99309 | 92 | village-lost | 4 (1/3) | 1 | 2/3 | 0 | 0 | 1 / 0 | 1 (0) | village | 160 |
| 99310 | 70 | village-lost | 8 (3/5) | 0 | 4/5 | 1 | 2 (0/2) | 3 / 2 | 0 (0) | village | 160 |
| 99311 | 50 | village-lost | 0 (0/0) | 0 | — | 0 | 0 | 0 / 0 | 0 (0) | village | 70 |
| 99312 | 111 | village-lost | 7 (2/5) | 0 | 5/5 | 0 | 4 (0/4) | 2 / 0 | 0 (0) | village | 150 |
| 99313 | 65 | village-lost | 7 (0/7) | 0 | 7/7 | 0 | 5 (0/5) | 0 / 0 | 0 (0) | village | 100 |
| 99314 | 103 | village-lost | 3 (0/3) | 0 | 3/3 | 0 | 0 | 0 / 0 | 0 (0) | village | 125 |
| 99315 | 121 | village-lost | 10 (5/5) | 0 | 4/5 | 0 | 1 (0/0) | 5 / 2 | 0 (0) | village | 150 |
| 99316 | 68 | village-lost | 6 (0/6) | 0 | 5/6 | 0 | 2 (0/2) | 0 / 0 | 1 (0) | village | 199 |
| BAND | med 81 | all lost | 45 (11/34) | 2 | 30/34 | 1 | 14 (0/13) | 11 / 4 | 2 (0) | — | — |

## Wall numbers

Wins 0/8, national 0/8, table 0/8, wave-4 unlocks 7/8, wave-4 faced
7/8, wave-5 unlocks 0/8, wave-5 faced 0/8, readiness-5-ready days 0
(band total), median survival 81d (range 50–121d; every village
lost). TB endings band-wide: death 32, kill-or-rout 2, fled 0.
Field endings: flee 6, death 5, kill 0. Scholar deaths band-wide: 59
(51 in-combat in the wild). 1-HP arrivals: 0 (field entries at 1 HP,
TB entries at 1 HP, field exits at 1 HP — none on this band; the
fieldfinish stuck state did not appear).

## Sense-testing (narration)

Read the seed-99313 death-day say lines end to end (days 63–65) and
the seed-99309 kill day (d73). The deaths read coherently and grimly:
each scholar named, keepsakes buried, succession speeches at the
grave ("Jesse trusted them. We saw it. Give them the fire's
hearing."), graves dug by the fire the next morning. The mechanics and
the fiction agree that the village is bleeding people — but the fiction
never notices WHY: six people die "in the wild" across two days and no
line ever names the algorithm, says the same beast is still out there,
or says it is down to 114 HP. The village grinds a beast down with its
own lives and the story never sees the pattern. That is the sense
blank for a future narration arm: the grind is invisible in the
fiction, so a player would read six unrelated deaths, not one siege
being won an inch at a time.

The 99309 strike kill has the gap dmground already noted: a wave-4
kill, the village's first blood at that scale, passes without a "we
killed it" beat in the captured say lines (the carcass line exists —
"Fatty, dark, faintly of thunder" — but no triumph beat). Giulia
Bianchi kills a 1003-HP strike solo over 17 rounds on d73 and is dead
herself on d74. The same day's 9 identical SHUTDOWN lines (the
strike's picket-line mechanic) read as spam in the log — the
monster's signature, not this arm's concern, but worth a look by a
narration pass.

## What the village looked like (plain words)

Eight villages, all dead by day 121, none past village rank, none
near the table. They unlocked wave 4 (7 of 8) and then died at the
treeline: the wave-4 beasts that mattered were lingerers besieging
Haven, and the village met them the only way it knew how — one
scholar at a time, each dying in 5–7 rounds after dealing 50–180
damage, the next scholar walking out the next morning (sometimes the
same day) to face the same beast at exactly the HP the last one left
it. Twice a beast was killed outright in a single fresh fight — a
wanderer met in the wild, not a siege — and both killers died within
days anyway. The field never contributed: villagers met wave-4 beasts
in the field 11 times in 8 villages, dealt a median ~46 damage in
2–3 rounds, fled or died, and never killed one. Nobody banked a
veteran (living killers at end: 0), nobody saw a readiness-5 day.

## Metric review

- The D4 bar was NOT judgeable on this band: wounded-entry TB fights
  = 3 (< 5 thin-band guard), and the two kills that did happen fell
  in the fresh bucket. The DIAG-NO rests on the prereg's rule as
  written (D4-gap fails + no loss channel material), not on a
  re-scored metric. The thinness itself is informative: wounded
  entries are rare because villages die before the grind reaches
  them — the grind's tail is short, not because the chain resets
  (it doesn't: 0 resets) but because the scholars run out.
- The strict linkage (exact-HP equality) held up: 13/14 TB→TB pairs
  are exact continuations and lift fidelity is 29/30, so exact-HP
  matching is not excluding real links on this corpus. The one
  lift-fidelity mismatch (99315 d92 reunion, alias 877 → fighter 871)
  is a real 6-HP pre-fight discrepancy with no identified mechanism —
  no verdict input depends on it (the fight counts lifted either way
  and its entry frac is as recorded), but it is logged as a finding
  rather than explained away.
- The same-day kill-matching limitation (Loop A sim-staypolicy-a,
  2026-11-05: midnight-spanning kills score 0 matched) does not bite
  here: unmatched kills = 0, both matched kills dealt 100% of entry
  HP on the same day, and no death-ending TB fight dealt more than
  68% — no hidden kill is suspected in this corpus. The rule stays
  as-is for this verdict; the ±1-day join is a next-run revision.
- The 150d horizon was longer than the villages: median survival 81d,
  max 121d. The horizon did not bind — death-awareness did its job —
  but a fatter band (more seeds, or a longer-lived substrate) is the
  only way to get a judgeable wounded-entry sample. 8 seeds / 150d
  gave 34 TB fights but only 3 wounded entries; the next run on this
  question needs the grind to reach its tail more often, which means
  villages that survive the middle, not more days on dead ones.

## Telemetry / balanced panel

- Telemetry check: attempted; the tool REFUSED the recorder corpus
  ("refusing recorder-corpus input: all 8 --current rows carry
  top-level anchorCommit, so they are sweep recorder rows, not runs.
  Recorder corpora are compared with sweep-compare tables, never
  against a run baseline here."). No LOUD lines, no deviation to
  investigate — the tool declines this corpus shape. No
  `--update-baseline` was run (reseeding a baseline from a DIAG
  corpus would be wrong). Wall numbers are reported directly above,
  never fabricated into a compare.
- Balanced panel (§15): no compare `.md` is attached. The panel's
  `compare` mode takes panel-generated `.json.gz` inputs produced by
  running the panel itself; it does not consume recorder corpora,
  and a DIAG corpus has no before/after pair to panel (same limit as
  dmground recorded).

## Next blank (per the prereg's diagnostic-intermediates rule)

**The grind step's price, not the chain's plumbing.** The chain works:
wounds persist, the lift carries them into TB, lingerers restore at
the fighter's end HP, re-finds happen. What binds is that a TB fight
on this band ends death-or-win (32 death, 2 won, **0 fled**) — every
grind step is all-in, and the village pays a scholar per ~100 HP of
beast. The next lever must attack survival-per-TB-fight (rounds held,
damage taken per round) or retreat-and-refind (a TB fight the scholar
can walk away from with the wounds kept — the door-flee stash already
honors wounds at 1 HP, but the competent policy never uses a TB
retreat on this band). Do NOT re-run a chain-plumbing probe: the lift
and the lingerer restore are measured working. Do NOT re-run a
per-swing damage lever: GEARFULL is the ceiling of that family and is
measured. The fresh-kill inversion (pending-live wanderer fights
2/9 killed; lifted siege fights 0/30) is the second question to carry:
whether the scholar-initiated wild fight and the forced treeline
siege are different fights with different odds, and which one the
village should be choosing.

## Findings outside this arm (appended to sim-findings.md)

- Grind-step price: each TB grind step costs a scholar's life
  (99313: 6 scholars for 636 HP; roster 7→0 in 2 days).
- TB fights are all-in: 0/34 fled on this band; the competent policy
  never retreats a TB fight, so every grind step is death-or-win.
- Fresh-kill inversion: pending-live (non-lifted) TB fights killed
  2/9 while lifted TB fights killed 0/30 — the wild fight and the
  siege fight may have different odds.
- Unexplained HP drops of the #1169 class: 99309 eulogy 624→399 and
  99315 audit 1189→1100 with no recorded fight between (fieldfinish
  1-HP arrivals were 0 on this band). Plus a 6-HP lift discrepancy:
  99315 d92 reunion entered TB at 871 against a pre-call alias read
  of 877 — same class, smaller scale, mechanism unidentified.
- Narration blank: the grind is invisible in the fiction — six
  scholars die to one beast across two days with no line naming the
  beast or its remaining HP.

## Files

- Prereg + instrument + driver + analyzer + proof (26/26): 76b36329e
  (landed before any judged sim).
- Corpus: `evidence/2026-11-05/perseed-grindfinish-b/` (8 files).
- This file: `evidence/2026-11-05/sim-grindfinish-b.md`.
- DIAG ONLY: zero src/js changes, zero default flips, zero
  combat-code changes. No [needs-eyes] flag: measurement only.
  Ready to merge, pending ship (coordinator merges via --ff-only;
  no push, no bump, no live verification by this worker).
