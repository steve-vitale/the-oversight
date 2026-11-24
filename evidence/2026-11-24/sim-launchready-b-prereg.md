# sim-launchready-b — prereg (frozen 2026-11-24 ~19:25Z, coordinator-run corpus DIAG)

## Question
Do launched parties depart spent — low HP, unloaded weapons — and is that
visible in the existing ragecarry confirm corpus? (Ragecarry confirm §10
next step: "measure launch-time HP/loadout on a fresh band before building
a fix".)

## Background (why this is a corpus DIAG, not a fresh band)
- Three worktree registrations for a fresh-band version of this arm failed
  (write flap 18:52Z/19:00Z; registry-lock queue behind Loop A + playtest
  registrations 19:22Z). The fresh-band measurement (departure-instant HP
  + loaded weapon + ammo per member) stays open as the next run's blank.
- The ragecarry CONFIRM corpus (12 seeds 107901–107912, arm leg, 150d,
  SENSEEXPED substrate) already records departures (`v4departs`: partySize,
  partyArmed) and dawn-census holder health (`dawnbidCensus`: holderHealth,
  holderGear) plus encounter flee HP fractions (`v4encounters.fleeHpFrac`).
  This DIAG measures what the corpus CAN answer and states plainly what it
  cannot (departure-instant loadout/ammo per member is NOT recorded).
- The Alberto case (107902 d66, ~14 HP, unloaded sling) comes from this
  corpus — the DIAG tests whether it is the pattern or the outlier.

## Corpus (frozen)
- `evidence/2026-11-24/perseed-ragecarry-b-confirm-arm/` — 12 arm-leg files,
  seeds 107901–107912. Control leg
  (`perseed-ragecarry-b-confirm-ctl/`, 13 files) as reference only, to check
  whether the pattern is arm-specific (it should not be: launch fitness is
  a departure property, not a carrier property).
- No new sims. No game-code change.

## Primary metric
Median holder HP at departure (joined dawn-census health on departure
rows), with the share of departures at low HP, the armed share at
departure, and the flee-HP-fraction distribution.

## Frozen bars (DIAG-GO requires all four)
- B1 — join rate: ≥ 80% of `v4departs` rows join to a same-(vid, day)
  `dawnbidCensus` row. Below that, the census cannot speak to departure
  health and the DIAG is NO-GO on instrument (the question then needs the
  fresh band, full stop).
- B2 — departure-fitness distribution complete: holderHealth at departure
  (joined rows), partyArmed share at departure, fleeHpFrac — medians +
  quartiles reported on ≥ 10 departures (arm leg). Control leg reported
  beside it for the same fields where recorded.
- B3 — verdict stated with numbers: is the "launch spent" signal present
  (median departure HP, share < 25 HP, share < 50 HP — absolute HP, max-HP
  scale stated or flagged unverified) and is Alberto an outlier or the
  pattern. The loadout half (loaded weapon / ammo at departure) is reported
  as UNMEASURABLE from this corpus, with the exact missing fields named.
- B4 — instrument health: 0 parse errors, analyzer selftest green,
  determinism byte-identical across two runs.

## Verdict rule
DIAG-GO if B1–B4 pass and the answer is stated with numbers. The bars judge
completeness, not direction: a high median departure HP (Alberto an
outlier) is still DIAG-GO. DIAG-NO-GO only if a bar fails (join rate below
the floor, too few departures, or the corpus cannot be parsed).

## Horizon / seeds / policies
- Horizon: the corpus's own 150d. No new horizon.
- Seeds: ragecarry confirm arm 107901–107912 (12); control 107901–107913
  (13) as reference.
- Policy/substrate: as recorded (SENSEEXPED + carrier substrate on the arm
  leg; the launch-fitness read does not depend on the carrier).

## Metric review (to be filled in the evidence file, NOT re-scored here)
- Whether dawn-census health is a fair proxy for departure health
  (departures happen at dawn; the census is the dawn bid — same morning).
- Whether the fresh-band instrument should stamp HP + loadout + ammo at
  the departure instant per member (the ragecarry §10 prescription).
