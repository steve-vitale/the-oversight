# sim-fleeguard-b — prereg (finding #2602)

**Arm:** sim-fleeguard-b, run fleshout-loop-b-20261124T2230Z.
**Type:** BUILD — default-OFF lever, pilot (8 seeds, before/after on identical seeds).
**Finding:** #2602, "WINNABLE FIGHTS END ON THE FLEE CALL, NOT ON DAMAGE"
(`evidence/2026-11-24/sim-fleecall-b.md`, DIAG-GO). Named next build
from Loop B arm sim-fleecall-b (run 20261124T2130Z).
**Base at run:** master tip `b48b195db` (fleecall DIAG-GO merged;
worktree `~/workspace/worktrees/sim-fleeguard-b`).

## Question

On band 109501–109508, 11 of 20 fled launched fights end on the
"hopeless" branch — "sees how this ends" — judged on an imagined
fight: the engine compares rounds-to-kill against rounds-until-the-
lead-drops **as if the lead wore protection-4 armor**
(`fieldFights.js` FIGHTBLEND-B, `vTakenP4`), while the leads on this
band wear protection 27–37. On live numbers the sharpest case was
winning (monster 0.8 rounds from death, lead 5.7 rounds from
dropping) and still fled. The DOORFLEE2 comment in the same file
already sketches a live-numbers hold for door fights (env-gated,
door-only). This arm generalizes that guard to every wild wave-4+
fight: when the hopeless read fires, re-check with LIVE numbers
(real armor / real damage taken) before fleeing.

## Lever

`FLEEGUARD=1` (env flag, default OFF — off-mode byte-identical).
In `src/js/fieldFights.js`, situational morale, immediately after
the DOORFLEE2 block: when the P4 read says hopeless (round ≥ 2,
wave ≥ 4, not learn-first, not sealed), re-read the SAME race on
live numbers — live party HP left vs live damage taken per round,
same 1.1 winning margin — with the DOORFLEE2 lesson kept as
LEADER-SURVIVAL-ONLY: the leader's live HP must exceed their
incoming rate times the rounds left to kill (`vHp > leaderRate *
rtk`). If both hold, the fight holds (`hopeless = false`, `winning
= true`, `fleeAt = 0.05`), logs "(Live-numbers guard)", counts
`rec.fleeguardHold`. The bravery floor ("past holding", low HP) is
untouched — the guard applies to the hopeless race only. No RNG is
drawn. A party losing on live numbers flees exactly as before.

## Why kill share is NOT the primary (allystart metric review)

The allystart metric review (evidence/2026-11-24/sim-allystart-b.md)
says a kill-share bar of ≥ 0.15 set against a mechanism that moves
something else is a mis-scoped bar: damage tripled and kills moved
0 → 1. The same applies here, sharper: the guard can only move the
hopeless flees that are live-winning. The fleecall reconstruction
identifies ~2 of the 11 (seed 109505 d118 Network Note, clearly;
seed 109505 d105 Congregation, marginally — leader-survival rule
45 HP vs 3.8/round × 11 rounds = 41.8). A 0.15 kill-share bar needs
4 kills out of ~27 meetings; the mechanism's addressable pool is ~2
fights. Setting it as primary would be designing a NO-GO. The
fleecall metric review names the re-measure instead: "the same
within-one-round share plus the hopeless-flee count on this band —
the guard should move hopeless flees at high lead HP, not floor
flees at 5–10 HP." Kill share stays a reported secondary, never
re-scored into a verdict.

## Corpus (frozen baseline — re-run, not copied)

Band 109501–109508, 150d death-aware, policy
`scripts/policies/competent.js` verbatim, default env. Baseline
numbers (fleecall/basedmg corpus,
`evidence/2026-11-24/perseed-basedmg-b-ctl/`, analyzer-verified
this run before freezing — DIAG-GO, 0 parse errors):

- Launched wave-4+ meetings: **27** (pair-inclusive, engaged)
- Kill share: **0/27**; vFlee 20, vDie 7
- Hopeless flees: **11/20**; floor flees: **9/20**; learn 0
- Within-one-round share: **1/20 = 5.0%**
- Median survival 142.5d; national 0/8; full-seat wins 0/8;
  wave 4 unlocked 8/8; wave 5 unlocked 4/8; community lost 5/8
- Starvation deaths (allystart ctl leg): 1 total / 0 villager

Both legs of THIS run are fresh sims on this branch: the ctl leg
(FLEEGUARD unset) must reproduce the baseline exactly (zero-drift
check: 27 meetings, 0 kills, 20 flees, 11 hopeless / 9 floor) —
a drift invalidates the comparison. The arm leg (FLEEGUARD=1) runs
the identical seeds.

## Frozen definitions (per leg)

- **Judged population:** pair-inclusive engaged launched wave-4+
  expedition meetings, as defined by `legStats(dir,
  { minPlanParty: 1 })` in `scripts/analyze-fightcap-a.js`
  (the basedmg population: 27 on the baseline).
- **Flee variant:** the fleecall classification from the terminal
  log line (`hopeless` / `floor` / `learn` / `committed-floor`),
  cross-checked against the engine's own `rec.fleeHopeless` flag
  (recorded per row by the driver) — ONE-DIRECTIONAL (see
  CORRECTION below): a `hopeless` variant requires
  `fleeHopeless == true`; a `floor` variant carries no constraint
  on the flag.
- **Hopeless-flee count:** fled meetings classified `hopeless`.
- **Floor-flee count:** fled meetings classified `floor` (must NOT
  move — the guard never touches the floor).
- **Guard fires:** total `rec.fleeguardHold` across the leg's
  judged meetings (driver row field `fleeguardHold`).
- **Kill share:** vKill / judged meetings.
- **Within-one-round share:** fled meetings with
  `mHpRemaining <= dpr` (dpr = 0 counts as NOT within one round),
  per the fleecall frozen definitions.
- **Starvation deaths:** `deaths` rows with cause starvation
  (total and villager-only), per seed file.
- **Median survival:** median `gameDays` across the 8 seeds.
- **Villager combat deaths (co-primary, §14c):** vDie meetings
  in the judged population (party dies in a launched fight).
- **Wall numbers:** national / table / wins, wave 4–5 unlocks,
  median survival — reported every run.

## Frozen bars — judge ONLY against these

| Bar | Pass condition |
|---|---|
| **Pool floor** | judged meetings ≥ 10 on BOTH legs |
| **Zero drift (ctl)** | ctl reproduces baseline exactly: 27 meetings, 0 kills, 20 vFlee, 7 vDie, 11 hopeless / 9 floor |
| **Primary: hopeless-flee count** | arm ≤ ctl − 2 |
| **Mechanism: guard fires** | total `fleeguardHold` on the arm leg ≥ 2 |
| **Floor untouched** | arm floor-flee count = ctl floor-flee count (±1 — a held fight may later floor-flee; a move of ≥ 2 either way is a fail) |
| **Co-primary: villager combat deaths** | arm vDie meetings ≤ ctl + 1 |
| **Cost: starvation** | arm starvation deaths ≤ ctl + 2 (total and villager) |
| **Cost: survival** | arm median survival ≥ 0.8 × ctl |
| **Instrument health** | 0 parse errors (incl. variant/flag cross-check); analyzer selftest green; determinism byte-identical on re-run; proof test green |

Verdict: GO iff ALL bars pass; else NO-GO naming the failed bar,
with the §14a kill classification (CONCEPT-DEAD / METRIC-BROKEN /
SUBSTRATE-MISSING) in the evidence file. Kill share and the
within-one-round share are reported secondaries with NO threshold
— they never re-score the run. No re-scoring; metric review
section in the evidence file. Sense-test: full transcripts of ≥2
fled fights on the arm leg + ≥1 held fight (guard-fired log),
judged as sensible human call vs mechanical tripwire. Panel:
before/after through `scripts/balance-panel.js` (§15); the panel
is the instrument, the bars above are the judge.

## Horizon + seeds + policies

- Horizon **150d, death-aware** (§10: reachability lever, waves
  4–5; the baseline survival distribution median is 142.5d, so
  150d covers the band with the +10d tail rule — dead villages
  stop simulating).
- Seeds **109501–109508** (the fleecall band, exact literals).
- Policies: **competent verbatim** (policy sha verified at run
  time against the prereg value `1884c8852d38`); no second policy
  — the lever's question is the flee call inside the competent
  expedition, and the band is the fleecall band (the §2
  multi-policy read is the panel's paired-seed comparison, not a
  second bot policy).
- Substrate (landed code, both legs):
  `SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1
  FIGHTALLY2=1`; carrier flags FIELDCAPDMG/RAGEFREE/FREESTRIKE
  asserted OFF on both legs. Arm leg adds `FLEEGUARD=1` only.

## Pre-pilot substrate checklist (§14b)

1. **Contact:** hopeless flees occur on the substrate — 11/20
   fled meetings on the frozen corpus. PASS.
2. **Pool sizing:** addressable pool is the 11 hopeless flees;
   the bar (−2) is a fraction of the pool, and the live-winning
   subset is ~2 by reconstruction — the bar is set AT the
   reconstructed pool, not above it. PASS (tight by design — see
   the kill-share note above).
3. **Verb existence:** the morale read, the P4 parallel totals,
   and the DOORFLEE2 hold all exist in `fieldFights.js`; the
   guard re-uses their exact variables. PASS.
4. **Horizon fit:** the frozen corpus stages 27 launched wave-4+
   meetings inside 150d. PASS.

## Instruments (to be built after this prereg commits)

- Driver: `scripts/fleeguard-driver-b.js` (port of
  `scripts/basedmg-driver-b.js`; MODE=ctl/arm; records
  `fleeguardHold`, `fleeHopeless`, `vTakenP4`, `vHpHypoLeft`
  per encounter row — the fleecall blank: the P4 totals finally
  in the corpus).
- Analyzer: `scripts/analyze-fleeguard-b.js` (reuses the
  fleecall classification + `legStats` population; judges the
  frozen bars; `--selftest`).
- Proof: `scripts/test-fleeguard-b.js` (staged fights: guard
  holds a live-winning fight and still flees a genuinely losing
  one; floor flee untouched; wave gate; off-mode byte-identical).
- Panel builder: `scripts/build-fleeguard-b-panels-20261124.js`
  (accordanswer pattern; compare via `balance-panel.js`).

## CORRECTION 2026-11-24 (before any judged sim ran)

The flee-variant cross-check as first written was wrong in one
direction, and the staged exploration caught it before the pilot:
the floor branch (`fieldFights.js`, the `(vHp / vHpMax) <
fleeAt` block) sets `rec.fleeHopeless = hopeless` — whatever the
hopeless read was that round — so a floor flee ("past holding")
can legitimately carry `fleeHopeless == true`. Observed in
staging: algorithm/60/false flees on the floor line at 0.20 HP
with `fleeHopeless == true`, `fleeLines == 0`. The cross-check is
therefore ONE-DIRECTIONAL: `hopeless` variant ⟹
`fleeHopeless == true` (a hopeless-branch flee always sets it);
`floor` variant ⟹ no constraint on the flag. The frozen bars
are unchanged — only this instrument definition is corrected,
and no judged number exists yet to re-score.
