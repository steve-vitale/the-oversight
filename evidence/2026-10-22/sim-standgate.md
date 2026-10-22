# sim-standgate — the standing half of the wave-5 door (flesh-out loop)

**run** fleshout-20261022T0437Z · **arm** sim-standgate · **axis** scale-onramp
**convergence** pending (this run's verdict)

## PRE-REGISTRATION (§14 — binding)

- **Primary (DIAG-GO):** ≥95% of all standing gains across the corpus
  attributed to named channels (blood / bonds / bread), 0 unexplained
  residuals. A miss IS the finding — name the gap, never re-score.
- **Design question:** is the 225 gate EARNABLE (standing has channels a
  player can deliberately push, independent of winning) or a WIN-PROXY
  (standing just tracks the win; the gate opens only for villages about to
  win anyway)?
  - EARNABLE iff ≥60% of gain-points occur pre-win AND pre-table, ≥2
    channels each contribute ≥15% of gain-points, and ≥1 run reaches
    standing ≥150 without winning.
  - WIN-PROXY iff ≥60% of gain-points occur post-win or within ≤15 days of
    a table win, or only one channel fires materially.
  - Otherwise MIXED. The verdict may not be re-scored against a friendlier
    rule mid-run.
- **Horizon:** death-aware 180d (never fixed-200d; dead villages stop +10d
  tail max via the harness).
- **Seeds:** 65501–65508 × {leadfeast, belongfeast} = 16 runs (one shared
  baseline — instrument-only, no lever arms: this is a diagnostic, not a
  lever test).
- **Policies:** scripts/policies/vgearconfirm.js `armedFor(...)` (VGEAR=1).
- **Substrate env:** FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1
  SEATDRIVE=1 VGEAR=1 KILLDISC=1; unset: SUCCGRACE RAIDDENSITY NODEWITNESS
  FULLSEAT VETREL REPOSITION VGEARBEATS.
- **Instrument:** scripts/standgate-lib.js (fresh namespace; builds ON
  scripts/w5gates-lib.js's decomposition — blood+bread-hybrid 125 + bread
  capped 100 = raw 225 vs the t5=200 gate — never re-derived). Proof:
  scripts/test-standgate-20261022.js (E0–E5 + DET, all green before the
  sweep).
- **Out of scope:** the readiness half of the door (armored/armed/tricks/
  veterans) — two live sibling arms own it; no duplication.

## The standing channels (engine truth, src/js/standing.js)

| channel | source | points | engine event |
|---------|--------|--------|--------------|
| blood   | war    | +25 per wave-3/4/5 ledger kill point (player AND villager kills via recordWaveKill) |
| bonds   | diplomacy | +34 per seasoned regional+ link (30+ days, trust 40+, polityOf regional+; polity collapse uncounts all) |
| bread   | plenty | +20 per quality≥1 feast (state.feastLog, capped at 60 entries; bread capped at 100 toward t5 — "bread alone cannot buy the fifth draft") |

## Results

**Sweep:** 16/16 runs completed (seeds 65501–65508 × leadfeast/belongfeast,
death-aware 180d, VGEAR winning substrate). Per-seed JSONs:
`evidence/2026-10-22/perseed-standgate/{leadfeast,belongfeast}/s*.json`.

### PRIMARY (DIAG-GO): **GO**

- 2,945 standing gain-points across the corpus: **100.00% attributed** to
  named channels, **0 unexplained residuals** (0 residual events).
- Attribution is per-day, per-channel, exact: Δpoints == Δcounter × perPoint
  on every channel, every run (proof test E0 pins the detector; E1–E3 pin
  the channels on fixtures; E4 pins the live per-points; E5 pins sgSample
  vs w5gates-lib gateVector agreement on 2 runs; DET pins
  instrument-neutrality — all in scripts/test-standgate-20261022.js,
  PROOF GREEN).

### Channel table (corpus, 16 runs)

| channel | gains (days) | pts | share of pts | first gain (min/median) |
|---------|--------------|-----|--------------|------------------------|
| bread (feasts ×20) | 92 | 1,840 | 62.5% | d21 / ~d34 |
| bonds (links ×34) | 8 | 680 | 23.1% | d57 / d57–84 |
| blood (wave-3+ kills ×25) | 16 | 425 | 14.4% | d43 / ~d76 |
| **total** | 116 | **2,945** | 100% | — |

Blood grain (by wave): wave-3 = 300 pts (11 kill-events), wave-4 = 125 pts
(5 kill-events), wave-5 = 0. No losses on any channel in this corpus (no
log-cap trim event, no polity collapse — the engine CAN produce both; the
proof test E2/E3 demonstrates the instrument attributes them).

Observed unlock-shape compositions (raw at end): e.g. leadfeast s65501 won
d90 with raw 307 = war 25 + bonds 102 + bread 180; belongfeast s65503 won
d90 with raw 260 = war 100 + bonds 0 + bread 160 (the blood+bread hybrid
from the w5gates decomposition: war 125 + bread-capped 100 = 225 ≥ 200).

### Verdict: **MIXED — earnable-shaped, not yet proven independent of winning**

Against the pre-registered rule:
- EARNABLE requires (a) ≥60% of gain-pts pre-win AND pre-table: **met**
  (pre-win 2,875 / post-win 70 / no-win 0 → 97.6% pre-win; pre-table 77.7%).
- (b) ≥2 channels each ≥15% of gain-pts: **met** (bread 62.5%, bonds
  23.1%; blood 14.4% just under the bar).
- (c) ≥1 run reaching standing ≥150 without winning: **FAILED** — 0/16.
  All 13 surviving runs won (median win ~d90); the 3 losing runs died at
  standing 0. On this substrate the "no-win" sample is degenerate — there
  is no variance to test against, so condition (c) was untestable, not
  disproven. Per §14, a missed bar is not re-scored: verdict **MIXED**.
- WIN-PROXY is rejected: gains are 97.6% pre-win, median first-gain day 27,
  flowing at village/regional rank (585/1,757/320/283 pts), long before the
  table. Standing does NOT just track the win — the channels fire while
  the run is still undecided.

What the data says plainly: every channel is deliberately pushable by a
player (host feasts → bread; court/polity-build → bonds; fight wave-3+
monsters → blood), and all three fire pre-win, pre-table, at village and
regional scale. The standing half of the wave-5 door is EARNABLE in
mechanism; the r3 finding that "the door is a lagging indicator" belongs
to the READINESS half (the sibling arms' bars), not the standing numbers.

### Wall numbers (16 runs)

national 11/16 · table 13/16 · wins 13/16 · exiled 0/16 ·
wave-4 unlocks 7/16 · **wave-5 unlocks 0/16** · median survival 90d
(max 117d, min 30d) · endReasons over-other 13 / village-lost 3.
Top death causes: combat 168, villager combat 115, sickness 19,
monster 17, starvation 16, expedition 16.

(Scale-onramp note: national reached on 11/16 here vs 0/12 in the
2026-10-12 scale-wall baseline — the standing numbers no longer block
scale; the readiness bars are the live constraint.)

### Village assessment

The winning runs read as feast-rich, link-rich villages that win through
the table at ~d90 without ever touching wave 5 (maxWave 4 on 7 runs).
leadfeast villages consistently build 3-link Haven realms (dip 102 on 6/8
runs); belongfeast villages mostly don't (dip 0–34). The 3 losing runs
starved/died early (d30–49, standing 0) — the mortality wall, not the
standing gate, decides their fate. Nobody fights a Producer: wave-5
remains unmeasured on this substrate (the r3 finding stands).

### SENSE-TESTING

The sweep's say-capture (4,000-line cap) covered only ~d1–41 — the three
largest single-day gains (+122/+102/+102 bonds, all d57+) fell outside it
(capture limitation, not a game finding). A focused filtered-capture
re-run of leadfeast/s65506 (blood first-gain d43, bonds d57) gives the
honest read:
- **Blood (SENSE-PASS):** d41 "⚔️ Desmond killed the Loud-Eyes alone —
  1 round, 8 taken. Word travels fast. The village cheers." The ledger
  point that moved the bar is a narrated, celebrated deed.
- **Bonds (SENSE-PASS):** d57 "📺 'But finales — FINALES need a LEGEND,
  sweetheart. More STANDING — blood, bonds, or bread — and look the Mirror
  Draft in the eye. The producers are WAITING.'" The System names the three
  standing channels aloud the same day the +102 polity-maturation gain
  lands. The fiction knows the mechanic.
- **Bread (SENSE-PASS, from the sweep corpus):** leadfeast/s65501 d34
  "🍖 FEAST 📺 — Valentina opens the pantry wide..." the same day the +20
  feast gain lands — a feast the player chose to host.

Every large standing gain in the corpus reads as a thing a player would
recognize as "that was a standing-raising deed."

## Convergence

**Converging.** The instrument is proven (PROOF GREEN, DET-neutral,
100.00% attribution on 2,945 gain-points, 0 unexplained). The standing
half of the wave-5 door is diagnosed: the gate numbers are earnable
pre-win by deliberate play across all three channels; the lagging-
indicator finding from r3 is attributed to the readiness half, not the
standing numbers. Named next for the coordinator: (1) the sense-probe
cap lesson — future sense captures must filter at write time (the
4,000-line all-lines cap covers only early game); (2) re-testing
condition (c) needs a substrate with non-degenerate no-win variance
(e.g. the no-win policy variant from finding #748).

## Metric review

1. The pre-registered earnability rule's third condition (≥1 run ≥150
   standing without winning) was untestable on this substrate — all 13
   survivors won by ~d90, all 3 losers died at 0. It is recorded as a
   MISS-that-is-unmeasured, not as evidence against earnability. Proposed
   revision for the NEXT run: replace it with a non-degenerate substrate
   condition (no-win policy arm), or drop the win-independence clause when
   the corpus has no no-win variance.
2. Blood's 14.4% share sits just under the 15% per-channel bar — with
   16 more runs it could move either way; the bar itself is a judgment
   call, not a law.
3. The analyzer's `--top` sense section silently printed empty windows
   before the cap limitation was understood — corrected by the focused
   filtered-capture probe; the corpus JSONs retain the (capped) raw lines
   for audit.
4. No balanced panel per §15: this arm is instrument-only with no lever
   arms — there is no before/after to panel. The §14 pre-registration is
   the judge, and it was honored (no re-scoring).
5. exiled is recorded (0/16) — backlog gap from r3 filled at the
   instrument level.
6. TELEMETRY DEVIATION CHECK (per the loop body §10): the LOUD lines from
   telemetry-check.js are regime artifacts, NOT real deviations —
   the scale-wall baseline's own _regime note says "DO NOT compare pre-seat /
   courtship / readiness substrates against this baseline" (it is the
   winseat full win-stack: SUCCGRACE=1 RAIDDENSITY=1, 16/16 wins; my regime
   is the vgear/killdisc substrate without those layers, 13/16 wins with
   3 early mortalities). The "won newly appeared" line is a key-name
   artifact (baseline "wins" vs per-run "won"). The baseline was NOT rolled
   forward: rolling a winseat baseline on a different regime would corrupt
   it.
