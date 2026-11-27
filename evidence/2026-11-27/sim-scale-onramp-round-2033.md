# sim-scale-onramp-round-2033 — coordinator record (ADOPTION CLOSEOUT)

- **Run:** fleshout-20261127T2033Z, Loop A, axis scale-onramp (converging)
- **Arms:** sim-fibersupply-a (DIAG-GO), sim-speardmg-a (DIAG-GO) — both landed
- **Record written by:** run fleshout-20261127T2215Z (adoption closeout — see
  Infrastructure). The 2033Z coordinator merged both arms, then timed out
  before writing its round record, running the telemetry check, or deleting
  its lock and claim. Nothing in this file re-judges the arms: both verdicts
  are the workers' frozen-prereg verdicts, verified against the merged
  commits below.
- **Loop B live throughout:** run fleshout-loop-b-20261127T2130Z, axis
  winnability-chain (arms departfit-b + reunionwild2-b) — NOT touched.

## Arm 1 — sim-fibersupply-a: DIAG-GO

**Question (1915Z next blank #1):** fiber supply to the pile — where does
fiber come from during play? (craftgate-a: 704/721 no-materials days
fiber-short, pile fiber mean 9.4 vs stick 46.4 / stone 250.7.)

- **Commits on master:** 8ae0d2ea6 (instrument; proof 53/53 on 3 seeds +
  analyzer selftest 17/17), 64916995a (DIAG-GO), e0a213d09 (pilot corpus +
  determinism rerun). Prereg 166234bde frozen before any judged sim.
- **Band:** 111701–111708, 150d death-aware, competent verbatim policy,
  substrate `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1
  SENSEEXPED=1 SPEARGATE=1 BOWOPEN=1`. All five frozen bars pass.
- **Answer, in plain words:** fiber comes from exactly one place — a
  villager gathering fallen branches. Every piece of fiber in the pile
  arrived as the 50% side-effect of a deadfall haul: 308 pieces in from
  606 hauls (0.342/day), no other recurring source fired once. What takes
  it out is villagers sitting at home making arrows: home craft took 104
  fiber, against 8 at departures and 11 stolen. The ledger closes
  (308 in − 123 out = 185 vs summed final pile 186, residual 1). The
  pile sits low not because the village as a whole is short — the band
  took in two and a half times what it spent — but because two kinds of
  village live side by side: in four villages one person gathers deadfall
  constantly and the pile ends holding 21–69 fiber; in the other four
  almost nobody gathers at all. One village made 9 deadfall hauls in 151
  days, its pile held zero fiber on every single day, and a bow-carrier
  named Sam Wilson walked out 8 times to find nothing to make arrows
  with — while the pile held 234 stone. The shortage is a habit that
  never forms, not a tap that runs dry. And no villager ever notices: the
  game itself teaches them that "strong fibers are everywhere", and still
  nobody goes looking for fiber as such — it only ever arrives as a
  by-product of fetching sticks.
- **Thinnesses (recorded, not hidden):** bar (1) passes at pile-zero
  0.275 against a 0.25 bar, the margin living entirely in the desert
  seeds; bar (2) passes at 8 need events, and all 8 come from one seed
  (111707, fiber 0 all 148 days). Determinism: fiber hash identical on
  the seed 111701 rerun.
- **No canon doc covers fiber supply, foraging yields, or the village
  pile specifically** (prereg §7); nothing here invents canon.
- **Evidence:** evidence/2026-11-27/sim-fibersupply-a.md;
  corpora `perseed-fibersupply-a/` + `perseed-fibersupply-a-rerun/`;
  analysis `fibersupply-a-analysis.json`.

## Arm 2 — sim-speardmg-a: DIAG-GO

**Question (1915Z next blank #3, finding #2544):** the spear-fight damage
diagnostic — spearlead-a found 5 spear-led wave-4 fights with 0
conversions, but the spear's fight damage was unmeasured.

- **Commits on master:** 4e563bc0f (prereg, frozen before any judged sim),
  e40b32bb6 (instruments; proof 43/43 + analyzer selftest 34/34),
  94a3b49eb (analyzer fix — melee-slot spear half counted once; residue
  now reconciles exactly), 8f868aa31 (corpus + rerun corpus + analyses +
  evidence). Master tip at adoption.
- **Band:** 111801–111808, 150d death-aware. All five frozen bars pass
  (pool 16 ≥ 8, spear fights 9 ≥ 5, parse coverage 1.000, residual 0.000,
  0 instrument errors).
- **Answer, in plain words:** the spear's fight damage is small — 5.1%
  of party damage (79.4 of 1565) — not because its strikes are weak, but
  because it almost never gets to strike. Across 16 fought expedition
  wave-4 fights, spear fighters landed 5 strikes total (0.56 per spear
  fight), 0 vKills in 16 fights, 0 spear-led vKills, against the ~111/round
  the kill line needs. When a spear strike does land it hits for 26–40
  damage, in line with a bow+melee fighter's 30.4 mean and well above an
  other-melee-only fighter's 15.0. The spear is an opportunity-starved
  weapon, not a weak one. Three seeds had zero expedition wave-4 fights
  at all; seed 111808 carries 6 of the 16 fought fights and 59.1 of the
  79.4 spear-attributed damage.
- **No canon doc covers spears as thrown weapons, and no canon doc covers
  spear melee damage either** — the fold-in rule lives in `fieldFights.js`
  comments, not canon; the attribution rule is this arm's measurement
  convention, frozen in the prereg, not a canon claim.
- **Evidence:** evidence/2026-11-27/sim-speardmg-a.md;
  corpora `perseed-speardmg-a-arm/` + `perseed-speardmg-a-rerun/`;
  analyses `speardmg-a-analysis.json` + `speardmg-a-rerun-analysis.json`.

## Wall (this run's judged corpora, 16 configs)

| Corpus | national | wins | wave 4 | wave 5 | median survival |
|---|---|---|---|---|---|
| fibersupply (8) | 0/8 | 0/8 | 8/8 | 0/8 | 114.5d |
| speardmg (8) | 0/8 | 0/8 | 8/8 | 3/8 | 132d |
| **Pooled** | **0/16** | **0/16** | **16/16** | **3/16** | — |

Competent-only single-leg DIAGs, no seatdrive — national/table/wins 0 is
the expected measurement profile, not a regression. Wave 5 appears on the
speardmg band (3/8 seeds, one seed standing 550) and never on the
fibersupply band. Deaths on the speardmg band: 750 (monster 636).

## Metric review

Both arms are single-leg diagnostics judged on frozen prereg bars; there
is no before/after pair, so no §15 balanced panel was fabricated — the
frozen bars are the judge, per §14. Neither verdict was re-scored:
fibersupply's thin margins (bar 1 at 0.275 vs 0.25; bar 2 all from one
seed) are recorded in the arm evidence §10 as what the NEXT prereg should
restate, and speardmg's prereg expectation (a larger spear share) was
overturned by the measurement itself — the bars judged parse completeness,
not the share, so DIAG-GO stands. A future fiber prereg should require
need events spread across ≥ 2 seeds and a pile-zero bar that survives
excluding desert seeds.

## Telemetry deviation check

Run by the adoption (2215Z) on both corpora: `telemetry-check.js` REFUSED
both inputs by design — "refusing recorder-corpus input: all 8 --current
rows carry top-level anchorCommit, so they are sweep recorder rows, not
runs." Same refusal as the 1915Z run. **No LOUD lines; baseline NOT
rolled.** Recorder corpora are compared with sweep-compare tables, never
against a run baseline here.

## Infrastructure

- **Stale-lock recovery:** lock `fleshout-20261127T2033Z` (created
  20:34:06Z) still live at 22:32Z (~119 min, past the 90-min fallback).
  No registry tree or heartbeat for the run; `ps` shows no live
  coordinator process; both of the run's workers report done (fibersupply
  21:17Z, speardmg 22:17Z). The coordinator merged both arms and then
  timed out mid-closeout. Lock deleted and claim retired to `.DEAD` by
  this adoption; the fibersupply worktree/branch were already fully
  released, the speardmg worktree was left prunable and was released here
  (`worktree-release.sh sim-speardmg-a merged`, worktree removed, branch
  deleted).
- Master moved once under the adoption (journey-establishment r286
  3fd6e9e70, already an ancestor at adoption start — it sits between the
  two arms' commits in the log). Zero file overlap with either arm.
- No EPERM flap observed during the adoption. Safe-commit clobber: (see
  commit note on the round-record commit).

## Findings backlog

- Fiber finding (sim-findings.md, 2026-11-27 craftgate fiber entry)
  marked `[answered]` by this adoption: the named next arm ran and
  answered it (deadfall-only source, habit-not-tap shortage).
- Spear finding #2544 marked `[answered]`: the spear-fight damage
  diagnostic ran (5.1% share, opportunity-starved, 0 vKills).
- Aidammo re-run finding stays `[open]` — it is the 2215Z run's next arm.

## scale-onramp stays converging (NOT converged)

The ammo-supply question is now answered end to end (home-duty craft is
the supplier, the gate is almost never open, fiber is the binding
shortfall and it arrives only as a deadfall by-product, slingers /
searcasters have no path at all), and the spear's fight contribution is
quantified (5.1%, opportunity-starved) — but villages still reach wave 5,
survive, and never reach national or win. The directive stands until the
tracker records this axis converged on measured evidence. Next blanks, in
order: (1) total party damage / weapon quality, not leadership (findings
#2601 / 2026-11-27 leadworst entry — even a best-armed lead in every
meeting only lifts median dpr to ~70.5 vs ~111 needed); (2) aidammo
re-analysis under the fixed analyzer; (3) slinger/searcaster supply path
— Steve design call; (4) thrown-spear opening — Steve design call.
food-economy stays converging (untouched; sibling loop B).
Claim retired; lock deleted by adoption.
