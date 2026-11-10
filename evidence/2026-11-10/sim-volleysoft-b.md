# sim-volleysoft-b — size a volley-softened finish (DIAG + SIZING, zero src/js)

- Arm: sim-volleysoft-b (Loop B, DIAG + SIZING arm, run fleshout-loop-b-20261110T0429Z)
- Branch: sim-volleysoft-b; base anchor `91650a90faa83df2e948d6c803e1735940252eb9`
  (worktree `~/workspace/worktrees/sim-volleysoft-b`)
- Prereg: evidence/2026-11-10/sim-volleysoft-b-prereg.md (committed `219c47f27`
  BEFORE any judged computation in this run). Instruments:
  `scripts/volleysoft-analyze-20261110.js` (wild corpus analyzer),
  `scripts/test-volleysoft-b.js` (proof + constructed sizing, **17 passed, 0 failed**).
- Verdict: **DIAG — the wild window is field-unmeasurable (0 volley-softened
  meetings in 58 wave-4 field fights on a fresh band), and the constructed
  sizing says the FS-shaped finish cannot take the window anyway (0/115 at
  FS sizing; median remainder 133 HP vs a ~68 HP FS window).** Zero src/js
  changes in this arm (instrument + proof + evidence + corpora only). No
  gate / price / deed / readyDemand / win-price change; no rounds-cap or
  armor change. The design question — whether the wound-mill ruling covers
  volley-crippled beasts — is NOT decided here.

## Premise corrections (the headline — read this first)

1. **"Flees free" is wrong for wave 4.** The brief's framing — a beast the
   volley drops below its break line "flees free with no finish attempt" —
   holds only for kinds carrying a flee component. `var mCanFlee =
   !!(mdef && mdef.flee)` (fieldFights.js:699); only lockpick_raccoon
   (wave 1) carries `flee` in src/data/monsters.json — NO wave-3+ kind
   does (census in this run: 23 wave-4+ kinds, 0 with flee). A
   volley-softened wave-4 beast does NOT flee: the volley-break block
   sets fsMetBelowBreak + fsNoCommitWhy 'volley-damage', sets NO outcome,
   and falls through to rounds, where the in-round break check takes the
   committedHold branch every round. The exclusion's real cost for wave 4
   is narrower: the fighter loses the free riskless contact strike (one
   lroll([4+wb,8+wb]) blow, no return damage) and loses the FS commit
   (whose beast-holding half is redundant here — the beast holds anyway —
   leaving only the fighter-morale hold, fsHoldLogged, as the commit's
   causal channel). The wild leg recorded what actually happens next
   instead of assuming a flee — and the constructed leg measured the
   fighter-flee share (27/115) as the pool a commit could in principle hold.
2. **The suggested band 99651–99658 is NOT fresh.** It was used 2026-11-05
   by sim-toggle-rescreen-b / gearoff / sigoff / trickoff confirms
   (evidence/2026-11-05/perseed-toggle-rescreen-b/gearoff-9965{1..8}.json
   + transcripts). Collision recorded in the prereg so the next worker
   does not repeat it. Rejected as used: 99671–99678, 99682–99687
   (killersurvive-b pilot), 99702–99707 (holdbeat-a), 99711–99718,
   99721–99728. **Fresh band used: 99591–99598** — verified 0 hits per
   seed in all 695 preregs, all dated .md, all evidence filenames, and
   scripts/; the five preregs naming a forbidden/contaminated list
   contain no 9959x seed.

## Wild leg (fresh band 99591–99598, competent, 150d death-aware)

Driver: scripts/finishersize-driver-20261106.js, RUN=volleysoft-wild
(~7 min, 8/8 seeds, instrument errors 0). Analyzer:
scripts/volleysoft-analyze-20261110.js.

| Seed | Days | End | MaxWave | Standing | Rank | W4 field | W4 field kills | W4 kills | Scholar deaths |
|---|---|---|---|---|---|---|---|---|---|
| 99591 | 140 | lost | 5 | 530 | regional | 15 | 1 | 6 | 12 |
| 99592 | 102 | lost | 4 | 199 | regional | 6 | 0 | 2 | 11 |
| 99593 | 66 | lost | 4 | 199 | regional | 0 | 0 | 1 | 5 |
| 99594 | 138 | lost | 4 | 199 | regional | 4 | 1 | 2 | 14 |
| 99595 | 83 | lost | 4 | 199 | regional | 4 | 0 | 2 | 14 |
| 99596 | 146 | lost | 4 | 140 | regional | 19 | 0 | 0 | 18 |
| 99597 | 87 | lost | 4 | 199 | regional | 5 | 0 | 4 | 7 |
| 99598 | 125 | lost | 4 | 199 | regional | 5 | 0 | 1 | 12 |
| **Band** | **median 113.5d** | **8/8 lost** | **w4 8/8, w5 1/8** | — | — | **58** | **2** | **18** | **93** |

### The window in the wild: 0

| Measure | Value |
|---|---|
| Wave-4 field fights | 58 |
| Wave-4 field fights with a volley that dealt damage | **2** |
| Volley-softened meetings (volley drops below break, prereg bar) | **0** |
| Volley-touched meetings already below break at entry | 0 |
| Volley kills (wave 4) | 0 |
| fsNoCommitWhy 'volley-damage' rows (wave 4) | 0 |
| Below-break meetings (all) | 3 |
| Below-break kills | 2 |
| Contact finishes attempted / kills | 3 / 2 |
| FS met-below-break commits | 0 |
| Addressable \|A\| / convertible \|C\| (adopt-a definition) | 1 / 0 |

The two wave-4 volley rows were nowhere near the window: 99591 d140 eater,
entry 950/950, volley 15 dmg → 935 left, vFlee in 5 rounds (fighter at 21 HP);
99597 d71 eulogy, entry 582/900, volley 63 dmg → 519 left, vFlee in 3 rounds
(fighter at 34 HP). The volley barely fires at wave 4 in the wild at all —
2/58 fights — because field fighters almost never carry ammo at fight time
(same finding as sim-volley-a: carried ammo 0/1179). Per the prereg, the
primary reads **DIAG (field-unmeasurable at 8 seeds)**: 0/8 seeds, 0 per
wave-4 field fight. The band was NOT extended mid-run to chase the window.

The 3 below-break meetings were all wall-delivered heralds, and all 3
resolved without any FS commit: 99591 d122 and 99594 d129, 1-HP heralds
killed by the contact strike itself (22 dmg, 0 rounds); 99596 d132, a
45-HP herald — contact strike 10 → 35 left, FS gate declined above-tail
(35 > 3×10), the beast held, and the fighter died in 2 rounds (see the
sense-test read). The analyzer's single addressable meeting is that
45-HP herald: addressable but above-tail, convertible 0, outcome vDie.

The dominant wild wave-4 shape is the walk-away: **49 of 58 field fights
end vFlee** (2 vKill, 6 vDie, 1 evade; rounds median 2.5). Fighters meet
the fourth wave, take a look, and leave — the field kills almost nothing
at this tier on this band.

### Neighboring shape (wave 3, observed, outside the prereg bar)

99596 d59–61, a buffering ground down across four meetings — the
trail-chaining the grind instrument was built to see: d59 Tom volleys
73→43, 15 rounds, walk-away; d60 Tom meets it at 43, volleys to 29,
15 rounds, walk-away; d60 Keerati meets it at 29, volleys to 10, 15
rounds, walk-away; d61 Tom volleys it dead at 10 HP (0 rounds). Two of
those meetings carry fsNoCommitWhy 'volley-damage' at wave 3. The chain
is real; it is wave 3, so it does not count toward the wave-4 window,
and it is recorded here as an observation, not a re-score.

## Constructed sizing (the deliverable)

Test: scripts/test-volleysoft-b.js, 17/17. Bow-ONLY fighter (bow + 4
arrows + ally, fighter 100 HP), 30 seeded streams per entry HP, 270
fights through the real `Game.fieldFight` (seed 87104 family). Entry HPs
just above the break line: audit 180/200/220 of 1200, herald 120/140/160
of 800, influencer 150/170/190 of 950. (Correction during the run: the
first pass used influencer 140 HP — 14.7% of 950, already below the break
line at entry — and its 14 contact attempts were volley-missed
met-below-break fights, not volley-softened ones. The shape was fixed to
150/170/190 to meet the prereg bar; the bar itself was not moved.)

| Measure | Value |
|---|---|
| Fights | 270 |
| Volley-softened meetings | **115** (audit 51, herald 34, influencer 30) |
| Volley kills | 0 |
| Contact attempts among volley-softened | 0 |
| fsNoCommitWhy 'volley-damage' | 115 |
| FS commits | 0 |
| mFlee outcomes | 0 (premise check: no volley-softened beast flees) |
| Post-volley remainder R | **median 133 HP, range [83..172]** (audit med 162, herald 103, influencer 133) |
| Bow strike [15,19] kill share (R ≤ strike) | **0/115** |
| Bow FS-window share (R − strike ≤ 3× strike, i.e. R ≤ 60–76) | **0/115** |
| Spear strike [19,23] kill share | 0/115 |
| Spear FS-window share (R ≤ 76–92) | **1/115** |
| Outcomes WITHOUT any finish | vKill 23 (20%), **vDie 65 (57%)**, vFlee 27 (23%) |
| Rounds, median (range) | 3 (1–6) |
| Fighter HP lost, median overall | 100 (deaths dominate: 65/115 end vDie) |
| Fighter HP lost, median among vKill fights | 71 |
| Fighter HP lost, median among vFlee fights | 73 |
| vDie fights, rounds median | 4 |
| Fled fights inside the FS window (convertible-by-hold) | **0** |
| Killed fights inside the FS window | 0 |

By kind: audit 0/51 vKill, 20 vFlee, 31 vDie (the worst shape — the big
beast at a 162-HP median remainder never dies to a bow fighter); herald
16 vKill / 2 vFlee / 16 vDie; influencer 7 / 5 / 18.

### What a volley-softened finish would need — the sizing

- **At FS sizing it converts nothing.** The FS window needs the remainder
  within four strikes of the bow (R ≤ 4×[15,19] = 60–76 HP). The
  smallest remainder observed in 115 meetings is 83 HP; the median is
  133 HP — **2.0× the FS window at the median, 1.8× even at the
  spear's top end.** A strike of ≥ 34 would be needed to put the median
  remainder in the FS window; no carried weapon strikes that hard (bow
  [15,19], spear [19,23]).
- **To cover the median remainder at bow sizing needs an ~8-strike
  window** (133 / 17 ≈ 7.8 strikes) — i.e. not a finish but a full
  re-fight, held for ~8 strikes. The fighter already loses that re-fight
  57% of the time (vDie) and walks away 23% of the time; holding them in
  it is the risk, not the reward. A commit's hold would keep the fighter
  in a fight they die in more often than they win.
- **The free strike itself is pure upside and nearly worthless.** The
  contact exchange is riskless (the beast is below its break line and
  turning — no return damage), so a volley-softened contact strike costs
  nothing — but it kills 0/115 and moves the remainder from ~133 to
  ~116, still 1.7× the FS window. The strike is not the lever; the hold
  would have to be, and the hold's pool (fled fights inside the window)
  is 0.
- **Costs, spelled out:** the strike costs nothing (no return damage, no
  ammo — the bow is already drawn; one action, no round runs). The
  commit's hold costs the rounds the fighter would otherwise spend
  fleeing (median 3 rounds per fight, median 71–73 HP lost even in the
  fights the fighter survives) and displaces the fighter's own flee
  decision (23% of volley-softened fights) — in a fight the fighter dies
  in 57% of the time. Any build that holds the fighter must carry that
  death rate as its cost bar.
- **The wild rate makes any build unmeasurable at this scale anyway:**
  0 volley-softened meetings in 58 wild wave-4 field fights, with the
  volley firing in only 2/58. A build run must judge on construction
  (this 270-fight driver) and would need a much wider wild screen to see
  even one wild meeting.

## Lever spec (pre-registered for a future build run — NOT built here)

- **Primary metric:** volley-softened committed kills / |V|, where |V| =
  volley-softened meetings (prereg definition) with remainder R ≤ W ×
  strike, W = tail width chosen by the build. GO ≥ 0.50, with every |V|
  meeting firing a commit.
- **Cost bar:** fighter deaths in volley-softened fights must not exceed
  the no-finish construction baseline (57% vDie, 23% vFlee on matched
  streams) by more than +10pp; wild field-fighter deaths (vDie) must not
  rise vs this band's 6/58. A build that holds fighters in a 57%-death
  fight and moves the death rate up fails the cost bar even if it kills.
- **Band / horizon:** FRESH band, verified at build time the way this
  run verified 99591–99598 (preregs + dated .md + filenames + scripts;
  99591–99598 is now used, never reuse it). 150d death-aware, competent
  policy verbatim. Construction judged on the 270-fight driver in
  scripts/test-volleysoft-b.js (same shapes, same streams); wild leg is
  the guard, not the judge.
- **Pre-build decisions required (Steve-call, in order):** (1) whether
  the wound-mill ruling covers volley-crippled beasts at all — the
  design question this arm did not decide; (2) tail width W. **Do NOT
  build at W = 4 (FS sizing): it covers 0/115 (bow) and 1/115 (spear)
  and the spec would be vacuous.** W = 8 covers ~50% of the remainder
  distribution (median 133 vs 8×17 = 136) but is a 7-strike hold, a
  different lever ("press the advantage") needing its own prereg and
  fighter-risk analysis — not a finish. If neither decision lands, the
  honest spec outcome is DON'T BUILD: the window exists by construction
  (115/270) but is unmeasurable in the wild (0/58) and untakeable at
  finish sizing (0/115).
- **What the build must NOT do:** extend the FS gate to volley-softened
  meetings without the sizing (this file is that sizing, and it says
  no); touch the break line, the 60% HP gate, the engage-intent gate,
  MAX_ROUNDS, or any win price / deed gate / readiness bar.

## Sense-test read

**99596 d59–61, Tom and Keerati vs Buffering (wave 3).** Four meetings,
one beast ground down 73 → 43 → 29 → 10 → dead by volley. The fiction
is coherent: a wounded thing that keeps coming back, two villagers
taking turns at it, the kill finally arriving at range. Two warts: the
"wounded past its line — and holds its ground" line repeats every round
(same wart vetfinish noted — true, but four times a fight it reads as
filler); and twice a fighter walks away at the round cap from a beast
at 29 and 10 HP with 54–56 HP left themselves — the 15-round cap ends
the fight while the beast is one or two strikes from dead. The mirage
misses explain why no strike landed (Buffering's trick), so the walk-away
reads as earned, not broken — but a 10-HP beast surviving because the
clock ran out is a blank worth naming (see findings note).

**99596 d132, Agnes vs The Herald (45 HP).** "Agnes closes in and
strikes with the sharpened stick for 10 (35 left) — but The Herald
holds its ground, wounded, and still coming." Then a 9-damage strike,
a 25-damage omen, and "The Naming" for 59 — Agnes dies. A 35-HP beast
kills a 73%-HP fighter in two rounds. The FS gate declined correctly
(35 > 3×10, above-tail), and the fighter died anyway: the gate's
selectivity has a body count, and it is visible in the fiction. The
herald's named attacks (First Omen, The Naming) hit like a wave-4
beast should.

**The daily texture.** "Teresa and Sarah lingered over the fire
together" repeats day after day with different pairings — a routine
line, not a conversation; it reads as the village idling, not living.
The deathSays sample is mostly the instrument's "deadfall" false
positive (gathering lines matching /dead/), not actual deaths — a
known instrument quirk, harmless.

## Village assessment (plain words)

Eight villages on a fresh band, and all eight lost. The strongest,
99591, lived 140 days, reached standing 530, unlocked the fifth wave,
killed six wave-4 beasts — and still lost. The weakest, 99593, died on
day 66 with a single wave-4 kill. The villages fought the fourth wave
58 times in the field and killed twice — both times a 1-HP herald the
wall had already delivered to the floor. The other 56 times the fighter
walked away (49), died (6), or slipped past (1). Nobody reached
national, nobody sat at the table, nobody won. The chain binds where
vetfinish left it: past the veterans bar, at wave-5 facing and the
climb to national — the villages that bank kills still cannot turn them
into a seat. The bow, the weapon this arm is about, barely appears at
wave 4: two volleys in 58 fights, both against healthy beasts, both
ending in a walk-away. The volley-softened window the design question
asks about does not exist in these villages' lives — it exists only
when you put it there on purpose, and when you do, the fighter holding
the bow dies more often than not.

## Wall numbers (national / table / wins, wave 4–5, median survival)

Wild leg (current master, anchor `91650a90faa8`): median survival
113.5d (range 66–146), won 0/8, national 0/8 (regional 8/8), table
sittings 0, wave-4 unlock 8/8, wave-5 unlock 1/8, wave-4 kills 18 (all
channels), wave-5 kills 0, field wave-4 kills 2, scholar deaths 93,
instrument errors 0. No win movement either way; nothing to investigate
on the telemetry side (telemetry-check refused the recorder corpus, as
expected — see below).

## Metric review (§14a, to carry to the next run)

- The prereg's primary (wild window rate, DIAG-GO if ≥ 1 meeting) read
  0 — DIAG field-unmeasurable, as the prereg provided for. No re-score,
  no band extension. The constructed sizing is the deliverable and it
  does not depend on the wild count.
- The volley-softened definition counts only meetings the volley itself
  drops below break. The neighboring shape — met already below break
  with volley damage (wall-delivered, volley-touched) — is counted
  separately (0 on this band) and stays a different shape; a future run
  that wants it must prereg it, not fold it in.
- The hypothetical strike is a counterfactual draw on a separate stream,
  so its shares (0/115 kill, 0/115 FS-window) are sizing estimates, not
  engine outcomes. The real fight's RNG is untouched by the draw — the
  engine numbers (outcomes, rounds, HP lost) are engine outcomes.
- Test-design correction, made during the run (bar not moved): the first
  constructed pass used influencer 140 HP (14.7% of 950 — already below
  the break line at entry). Its 14 contact attempts were volley-missed
  met-below-break fights. The shape was fixed to 150/170/190 HP and the
  test re-run green (17/17); the first pass's sizing numbers (remainder
  median 128, 0/116 FS-window) agree with the corrected pass (133,
  0/115) within noise.
- The wild leg's w4field count (58) is thin for a window this rare; a
  future run that wants a wild volley-softened count should screen 16+
  seeds and should first check whether field fighters carry ammo at
  wave-4 fight time on its band — the volley cannot fire without it,
  and it fired in only 2/58 fights here.

## Findings for the backlog (coordinator files these)

- ROUND-CAP WALK-AWAY FROM A NEARLY-DEAD BEAST (open, observation):
  99596 d60, Keerati vs Buffering (wave 3): 15-round cap ends the fight
  with the beast at 10 HP and the fighter at 56 HP — the fighter walks
  away from a beast one strike from dead. Same shape d60 Tom (29 HP,
  fighter 54 HP). The mirage misses explain the 15 rounds, so the
  fiction reads as earned; the question is whether the cap should let a
  fighter finish a beast this close, or whether the walk-away is the
  intended price. Evidence: this file + perseed-volleysoft-b
  fs-s99596-volleysoft-wild.json (fieldFights d60, Buffering).
- (Not re-filed: the repeated committedHold narration line — a wart, not
  a defect, vetfinish holds it; the "lingered over the fire together"
  daily repeat — routine texture, same class; the 1-HP wall floor's
  invisibility in the fiction — grind-a holds it; the deathSays
  "deadfall" false positive — instrument quirk, harmless.)

## What was NOT touched (guardrails)

- Zero src/js changes in this arm. No FS-gate extension, no mBreak
  change, no rounds-cap change, no gate / price / deed / readyDemand /
  win-price change.
- No live verification, no push, no version bump (coordinator merges).

## Commits (this branch)

- `219c47f27` — prereg (safe-commit index clobber hit, repaired from
  HEAD with `git ls-tree HEAD -r | git update-index --add --index-info`,
  status + diff clean, hash verified)
- (analyzer + proof test + evidence + corpora, to commit next)

## Corpus

- evidence/2026-11-10/perseed-volleysoft-b/fs-s9959{1..8}-volleysoft-wild.json (8 files)
- Tooling: scripts/volleysoft-analyze-20261110.js,
  scripts/test-volleysoft-b.js (17/17); reused
  scripts/finishersize-driver-20261106.js,
  scripts/finishersize-instrument-20261106.js,
  scripts/finishersize-analyze-20261106.js,
  scripts/test-vetfinish-b.js (V2 shapes replicated, not re-run here)

## Convergence state

- VOLLEY-SOFTENED EXCLUSION (sim-findings.md, open, design decision):
  sized, not decided. Wild window 0/58 field fights on a fresh band;
  constructed window 115/270 meetings with median remainder 133 HP;
  FS sizing covers 0/115; a volley-softened finish at FS sizing is
  vacuous. The lever spec above is the buildable form, gated on two
  Steve-calls (ruling coverage + tail width W). Status: sized /
  awaiting design decision, not converged, not killed.
- Balance panel (§15): not run. The panel runs its own full panel and
  takes no corpus input (same precedent as grind-a, finishersize-a,
  adopt-a, vetfinish-b); the pre-registered primary is the wild window
  rate on identical seeds + the constructed sizing. No compare .md
  fabricated.
- Telemetry: `scripts/telemetry-check.js --baseline
  .../telemetry-baselines/scale-wall.json --current
  'evidence/2026-11-10/perseed-volleysoft-b/*.json' --metrics
  national,table,wins,exiled` REFUSED — "refusing recorder-corpus
  input: all 8 --current rows carry top-level anchorCommit". Recorded
  as the result, same as grind-a / finishersize-a / adopt-a / vetfinish-b.
  The baseline was NOT reseeded.
- Blanks filled: the volley-softened window is measured in the wild
  (0/58) and sized by construction (115 meetings, remainder distribution,
  strike/window coverage, fighter-risk costs), and the future build run
  has a pre-registered lever spec with GO threshold, cost bar, band, and
  horizon. Blank remaining: the design decision itself, and the chain
  past veterans — wave-5 facing / national, where this band also binds.

## Check status

- Proof tests on this tip: volleysoft 17/17. `test-vetfinish-b.js` was
  NOT re-run here (its V2 shapes are replicated inside
  test-volleysoft-b.js, which passes; zero src/js changes in this arm).
- `node scripts/check.js --quick` was NOT run (zero src/js changes;
  the 17/17 proof + 8-seed wild leg with 0 instrument errors are the
  regression evidence for an instrument-only arm). Stated as not run,
  not claimed.
