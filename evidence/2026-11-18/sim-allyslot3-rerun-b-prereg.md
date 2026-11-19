# sim-allyslot3-rerun-b — FROZEN prereg (Loop B 2330Z run, arm sim-allyslot3-rerun-b)

**Frozen:** 2026-11-19 ~00:20 UTC, BEFORE any judged sim. Base master
`046ae5859` + cherry-picks from held branch `sim-allyslot3-b`: substrate
sense fix `f97f61922` (→ `1eaff1e00`), lever `ddc7e78ed` (→ `41edabbb2`),
driver `b4a499a2b` (→ `69e12cc5a`), analyzer `01d86f43d` (→ `554c1f366`),
plus the rerun analyzer fix `6f3139b18` (finding #2564, loose join).
Branch `sim-allyslot3-rerun-b`.
**Lever:** the 3rd-ally slot (ALLYSLOT3=1, env-gated, default OFF).
`villagerFightAllies` returns a 3rd ally ONLY when the fighter is on a
launched quad (3 launch companions on the same expedition target); the
field-fight engine gains a third ally body (ally3Vid/Hp/gear/strikes/
wound settlement) mirroring the FIGHTALLY2 second slot; the wild router
carries 3 allyVids when the flag is on. Non-launched meetings stay
capped at 2 everywhere. No other lever is judged here.

## Substrate (rides along, NEVER re-judged)

- Sense fix (sim-launchparty-sense-a, re-judge tip d01eaf0a5): meeting
  sense prefers the launch party, cap 2. HELD (NO-GO on the
  arrival-price cost bar, finding #2538). Cherry-picked as `1eaff1e00`
  because the lever commit depends on it: without the `launch` list in
  `party-wiring.js` the slot's sense code has nothing to fill the 3rd
  seat from. The first cherry-pick of the lever alone CONFLICTED on
  `party-wiring.js` for exactly this reason (the sense fix is NOT on
  master — the old pilot's "already upstream via arm-1" claim was
  wrong for this file); the substrate pick resolved it and all four
  picks then applied cleanly.
- PARTYSIZE4 (sim-partysize4-b): wave-4+ launches go out as quads;
  partyQuads counter on both launch paths. ON master, env-gated
  `PARTYSIZE4=1`, default OFF.
- Shared flags on BOTH legs: LAUNCHPARTY=1, PARTYSIZE4=1,
  VETREENGAGE=1, FLEEREPAIR2=1, **FIGHTALLY2=1**. The fifth flag is a
  deliberate, documented substrate addition, not a re-judgement: the
  3rd ally can only join after the 2nd (the hopeless-shout chain is
  ally1 → ally2 → ally3), so without FIGHTALLY2 the slot could never
  fire and the pilot would measure nothing (SUBSTRATE-MISSING by
  construction). Both legs carry it, so the ONLY difference between
  legs is ALLYSLOT3.
- The field-engine damage carrier (finding #2552) is NOT built here.

## Join decision — finding #2564 (coordinator decision, this run)

The old pilot was NO-GO METRIC-BROKEN because the analyzer's field-4
join required the fight's monster to be the launch target
(`if (l.target && e.mid !== l.target) continue;`), which excluded the
one live-fire row (arm, seed 104437, day 133, the Reunion vs a Herald
launch: ally3Vid gen_353ni1r, ally3Dealt 23 of 239 vs 1322 HP, 7
rounds, vFlee). **The target==mid rule is DROPPED.** Keep the 21-day
window + launch-party membership; count off-target meetings. The d133
row is the analyzer test case: under the loose join it counts as 1/1
fielded. Verified two ways before freezing: (a) the analyzer selftest
carries a synthetic d133 row and asserts 1/1 (11/11 green); (b) the
fixed analyzer run over the OLD arm corpus returns field-4 1/1 on
seed 104437, ally3Dealt 23 — the real row now counts. Do NOT re-score
the old pilot; this run judges a fresh band only.

## Band choice + measured pool (finding #2566 — floor from measured rate)

**Seed-band freshness:** band 104720–104727 checked fresh — no
`evidence/**/*.md` names any 10472x seed, no filename contains 10472,
no commit message or branch names 10472, and no exact seed
104720–104727 appears in any prereg. (Adjacent band 104701–104712 was
used by sim-wildavoid-seedplan-b; it does not overlap.) The
`hidden_files/` grep hits for "10472" are substring false positives
inside old JSON/hash files, not seed-band namings.

**Survey (control-only quick pass, NOT a judged sweep):** the driver
ran MODE=ctl on 104720–104727, 150d, competent, substrate flags,
before this prereg was frozen. Corpus:
`evidence/2026-11-18/evidence/2026-11-18/perseed-allyslot3-rerun-b-survey-ctl/`
(8 files, 0 instrument errors; the run was interrupted by a machine
restart after 5 seeds and resumed for the last 3 — per-seed files are
independent, the resumed run exited 0). Measured pool:

| | Survey (ctl, 8 seeds) |
| --- | --- |
| Launches (wave-4+; analyzer `launches`) | 22 |
| Quad launches | 11 |
| Launched quad meetings (loose join) | 6 |
| Field-4 denominator (ally2-joined) | 3 |
| Median survival | 136d |
| Wall: wins / national / wave 5 / wave 4 / standing ≥200 / survived | 0 / 0 / 5 / 7 / 5 / 4 |

Per-seed launches: 104720 0, 104721 5 (4 quads), 104722 5 (4 quads),
104723 2 (0 quads), 104724 0, 104725 3 (0 quads), 104726 7 (3 quads),
104727 0. Launches concentrate on 3 seeds; 3 seeds launch nothing.
Denominator meetings: 104721 ×2, 104722 ×1. Seed 104726 has 3 quad
launches and 2 meetings but denom 0 (ally2 never joined there).

**Pool floor (set FROM this measured rate, not above it):** ≥6
launches/leg (measured 22 — floor is ~27% of measured) and ≥2
denominator meetings on the arm leg (measured 3 — floor below measured
with 1 of slack for delivery variance). The old pilot's floor failed
because it was set at ≥6 on a band measured at 4; this band measures
5.5× richer on launches and delivers a denominator at all.

## Primary metric (BINDING, §14)

**Field-4 rate on the arm leg.** Denominator: launched quad meetings
on the arm leg where the second ally joined (rec.ally2Vid present) —
i.e. fights where the engine had the chance to field the 3rd ally
(the hopeless-shout chain reached slot 2). Numerator: those where
the third ally ALSO joined (rec.ally3Vid present) AND ally3Vid is a
member of the joined launch party. Join: 21-day window + launch-party
membership, NO target==mid rule (finding #2564). **GO bar: rate ≥
0.80.** **Pool floor: ≥6 launches/leg AND ≥2 denominator meetings
on the arm leg.** If the arm leg has fewer than 2, the pilot is
NO-GO, kind METRIC-BROKEN (the band delivered no pool to judge the
slot). If launches fall below 6 on either leg, same kind.

Why this denominator: a launched quad meeting that never turns
hopeless never shouts, so no ally joins at all — scoring those
meetings against the slot would punish the lever for fights it was
never in. The ally2-joined denominator is the honest "had its
chance" set. The control leg's field-4 rate is 0 by construction
(no ally3 slot exists there); its ally2-join rate is reported for
comparison.

**Sense rate (reported, not binding):** among launched quad meetings
on the arm leg, the share where the sense returned all 3 launch
companions (alliesN==3 and allyVids ⊆ launch party). Expected near
1.0; it is the direct proof the slot exists in the sense.

## Secondary (REPORTED, not binding)

- **4th-member damage share (finding #2567):** ally3Dealt / total
  damage across fielded quad fights (from the field-4 table's
  ally3DealtTotal against the fought rows' mDealt), plus the
  size-4 damage share (mDealt / mHpStart on launched quad meetings,
  arm vs ctl, loose join). No binding threshold: n≈3–6 meetings
  cannot support one; the old pilot's single fight (23 damage, party
  fled after 7 rounds) says nothing about whether quads win more.
- Raw field-4 rate over ALL launched quad meetings (arm vs ctl).
- Per-seed launch/quad/meeting table.

## Cost bars (BINDING guardrails, §14 — a GO with a breached guardrail is NO-GO)

- Starvation: arm total ≤ ctl total + 2 (same bar as partysize4-b).
- Median survival: arm ≥ 0.8 × ctl.
- Community loss (village deaths): arm total village deaths ≤ ctl
  total + 16 (2 per seed × 8 seeds — the same per-seed slack shape as
  the starvation bar, applied to the analyzer's village-death total).

## Instrument bars (BINDING)

- 0 instrument errors on both legs; 8/8 per-seed files per leg;
  frozen seeds 104720–104727 on both legs; driver determinism
  (pilot seed, 60d, twice) in the proof test.

## Design

- Horizon: 150d, death-aware (never fixed 200d). Reachability lever
  (waves 4–5, national, table, wins) — 150d is the §10 guide for the
  wave-4/5 window, and the measured band's median survival sits at
  136d (survey) / 150d (old band).
- Seeds: 104720, 104721, 104722, 104723, 104724, 104725, 104726,
  104727 (8, pilot gate). Policies: competent verbatim only — the
  pilot's question is a mechanism question (does the slot field the
  4th member), not a playstyle question; the balanced panel runs the
  same policy on both legs.
- Legs: ctl = substrate flags, ALLYSLOT3 unset; arm = substrate
  flags + ALLYSLOT3=1. Same branch code both legs.
- Panel: `scripts/balance-panel.js` compare (instrument, not judge)
  via a cloned panel builder (`scripts/build-allyslot3-rerun-b-panels.js`).
- Proof: `scripts/test-allyslot3-b.js` — staged harness probe
  (villagerFightAllies against a live expedition, pre/post), slot
  raise + controls (flag off → cap 2; non-launched → cap 2; trio
  unaffected), staged quad fight fielding 4 on the arm leg and 3 on
  the control leg (the observable effect, not just assertions).
  On this tip: 18/18, `test-partyquads-b.js` 29/29,
  `test-launchparty-sense-a.js` 12/12, analyzer selftest 11/11.

## Fixture (encounter-gear rule, Steve 2026-11-13)

The staged proof fixtures stage a geared wave-4 hunting party as the
launch leaves them (holder + 3 launch companions, armed, on one
shared target) — the average gear/party a player has when they reach
wave-4 content — never a fresh un-geared solo scholar. The pilot's
driver stages the geared fight through the competent policy.

## Metric review

- The primary denominator (ally2-joined) is the one place this
  prereg could drift: it excludes launched quad meetings that never
  shouted twice. That exclusion is pre-registered here, before any
  numbers are seen, with the reason stated (no-shout fights never
  gave the slot its chance) — it is not a mid-run re-score. The raw
  field-4 rate over ALL launched quad meetings is reported alongside
  so a later reader can see the exclusion's size.
- The join change (#2564) is a BETWEEN-run metric revision, made
  before this run's judged sims and frozen here — it is not a
  re-score of the old pilot (which keeps its NO-GO METRIC-BROKEN
  verdict) and not a mid-run change. The next run inherits the loose
  join as the definition.
- The pool floor (≥6 launches, ≥2 denominator) is set from the
  survey's measured rate (22 launches, 3 denominator meetings per 8
  seeds) with slack below measured on both clauses — the direct
  repair of finding #2566. If the arm leg still delivers denom < 2,
  the verdict is METRIC-BROKEN and the arm returns to the queue; it
  is not re-scored on the sense rate.
- The survey is a pool measurement, not a judged sweep: it ran
  control-only, before freezing, and its numbers set the floor.
  No metric was re-scored: this file is frozen before the lever
  legs run and before any judged sim.
