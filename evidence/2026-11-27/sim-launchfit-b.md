# sim-launchfit-b — DIAG: do launched parties depart spent? (fresh band)

## 1. Verdict — DIAG-GO (all four frozen bars pass)

The departure-stamping driver works and the question is answered on a fresh
band. The two halves of the ragecarry lead split:

- **HP: Alberto is the outlier, not the pattern.** Launch members depart at
  median 85 HP (q1 71, q3 98). Only 10.8% of members depart under 50 HP and
  1.8% under 25 HP; 6 of 489 members (1.2%) sit at Alberto's ≤ 20 HP. A
  spent departure exists as a tail — it is not the shape of launches.
- **Loadout: the half-armed shape does NOT confirm — it was an accounting
  artifact. The unloaded-weapons half DOES confirm, and it is a village-level
  ammo famine.** Honest per-member armed share is median 1.0 (every member
  armed on all but the weakest launch; 3 unarmed members of 489). The
  launchready 0.5 reproduces exactly on this band when recomputed its way
  (armed non-holders ÷ party size) — because its numerator excluded the
  holder while its denominator included them. Meanwhile 105 of 245 ranged
  carriers (43%) depart with ZERO ammunition, and the famine is per-village:
  seed 111101 loads 0 of 47 volley carriers; seed 111108 loads 1 of 12;
  seeds 111102/111104 load 19/20 and 26/30. Alberto's "sling, no stones"
  is the pattern for ranged carriers in ammo-starved villages.

The named next fix stands as prescribed (departure-fitness check: arm +
load before launch), and it is NOT built here — this arm measures only.
The fix's real target is ammunition at departure, not HP and not melee
arming: the party is armed and mostly healthy, but in the worst villages
its bows are ornaments.

## 2. Prereg (frozen, no amendments)

Prereg: `evidence/2026-11-27/sim-launchfit-b-prereg.md` (frozen before any
judged sim; committed 1b683ec6f). Seeds 111101–111108, competent verbatim,
150d death-aware. Freshness re-verified by this arm before freezing: no
prereg names 111101–111108 or the fallback 111201–111208; no per-seed
files; no forbidden list names the band.

## 3. Method

- Driver: `scripts/launchfit-driver-b.js` (one process per seed,
  sim-harness `loadGame`/`runDays`). Instrument:
  `scripts/launchfit-b-instrument.js` wraps `Game.winPlanDepart` and
  `Game.vbrainExecuteDepart`; at every hold/launch departure it stamps
  BEFORE the original call (departure instant; pure read, no RNG touch)
  one row with `members[]` per party member (holder + plan.party + brain
  companions): HP (+ source), melee/ranged item + bonus, volley (ranged
  def carries `weapon.ammo`), ammo count in the member's own items,
  `loaded` (volley AND ammo > 0), armorP, armed (gearOfReplica
  convention). Conventions inherited verbatim from
  `scripts/ammocensus-driver-20261115.js` (entryId/countAmmo, spear-in-
  ranged-slot recorded not counted).
- Analyzer: `scripts/analyze-launchfit-b.js`. Analysis JSON:
  `evidence/2026-11-27/launchfit-b-analysis.json`.
- Proof: `scripts/test-launchfit-b.js` — 5/5 PASS (quartile math, Alberto
  vs bowman stamp classification on a fake Game, install stamps launch /
  drops normal, analyzer on a synthetic corpus, real-corpus self-check).
  One driver bug fixed during the run (competent is a policy object, not
  a factory; commit 8268385f5). The safe-commit index clobber struck on
  that commit — repaired via the ls-tree/update-index route; commits
  verified correct, tree clean.
- Run incident: the first full-band exec was SIGTERMed by the runtime at
  ~13 min with 6/8 seeds written; seeds 111107–111108 were re-run in a
  second exec (same command, same RUN, exit 0). Per-seed files are
  complete and refuse-overwrite guarded, so no seed ran twice and no file
  was overwritten.

## 4. Results (judged only against the frozen bars)

| Bar | Result |
|---|---|
| B1 stamp coverage ≥ 0.80 | **PASS** — 232/232 departures stamped complete (coverage 1.0) |
| B2 ≥ 10 launches, distributions complete | **PASS** — 220 launches, 489 launch members |
| B3 verdict stated with numbers | **PASS** — see §1/§5 |
| B4 0 instrument errors; determinism byte-identical | **PASS** — 0 errors; seed 111101 re-run into `perseed-launchfit-b-rerun/` is byte-identical (`cmp` clean) |

Band totals: 232 departs (220 launch, 12 hold), all 232 via the `brain`
source — `winPlanDepart` never fired on this band, so the live departure
path is the brain path; the stamp covers it. Stages: hunt 163, party 57,
standing 6, table 6. Party size 2 on 28/29 smoke-seed launches; band-wide
489 members / 220 launches ≈ 2.2 per launch.

## 5. The distributions

**HP at departure (launch members, n=489):** median 85, q1 71, q3 98, min
10, max 100. Share < 50 HP: 0.108 (53 members); share < 25 HP: 0.018 (9).
Holders (n=220) median 84, min 10, share < 50 0.114; non-holders (n=269)
median 86, share < 50 0.104 — the holder is not systematically more spent
than the party. Holds (n=12) sit at median 81 HP — holding is not how
spent parties are caught; they launch anyway.

**Alberto-like cases (HP ≤ 20, n=6):** Shaun Mokgatle (111101 d47, 10 HP,
starfall bow, 0 arrows — the Alberto shape in miniature, sling replaced by
a bow with no arrows); Rafael Torres (111103 d17, 19 HP; d20, 10 HP —
same villager twice, three days apart); Germaine Makuala (111103 d20, 15
HP); Jorge Silva (111105 d65, 14 HP — but his sling is LOADED, 4 stones:
HP and ammo fail independently); Yaritza Bastidas (111106 d57, 20 HP).
Seed 111103 — the band's village-lost seed (d83) — holds 3 of the 6.
Alberto is the tail of a real distribution, not a one-off anecdote, but
the tail is 1.2%, not the pattern.

**Armed (n=489):** honest armed share per launch median 1.0 (q1 1, q3 1,
min 0.5, zero-armed launches 0). Only 3 members unarmed. Melee bonus
median 12; ranged bonus median 18. Recomputed the launchready way (armed
non-holders ÷ party size) the median is exactly 0.5 — the 0.5 was the
holder missing from the numerator, not villagers departing unarmed.

**Loaded (volley carriers, n=245):** loaded 140 (57.1%), ammo median 2,
105 carriers at 0 ammo (42.9%). Per seed the famine is all-or-nothing:
111101 0/47 loaded, 111108 1/12, 111105 15/43, 111103 13/18, 111107 8/10,
111106 58/65, 111104 26/30, 111102 19/20. A village either has arrows and
stones or it has none; the departing bow is loaded or it is an ornament.
Ammo counted is carried ammo only (person.items) — stashed/pantry ammo
cannot fire a volley, so carried is the right read for the fight.

**HP-source caveat:** 483/489 members read from `village.health`; 24 read
the default-100 fallback (person.health undefined and no map entry). Those
24 default to full health, so the HP distribution is very slightly
flattered — the < 50 share is a floor, not a ceiling. The bias is small
(4.9% of members) and cannot move the verdict.

## 6. Sense-test

The rows read as people, not ledgers. Raj Owens departs day 6 at full
health with a bow and no arrows — the village's first expedition already
carries the famine. Shaun Mokgatle (111101 d47) walks out at 10 HP with a
starfall bow and an empty quiver: the Alberto shape, alive and walking, on
a seed where nobody's bow ever loads. Jorge Silva at 14 HP with a loaded
sling is the counter-shape — the game lets a nearly-dead villager march
with a working weapon, and no departure check stops either of them. The
departures that should worry a reader are not the 10-HP ones (rare) but
the ordinary ones: a healthy pair, both armed, one bow with no arrows,
walking out to a wave-4 fight the village has already decided to seek.
That is a loadout failure, not a courage failure, and it reads as one.

## 7. Wall numbers (this band — competent verbatim, 150d, 8 seeds)

Wins 0/8, national 0/8, table 8/8 (progState tableWaiting-or-done flag —
same convention as muster-b; all 8 villages reach the waiting state,
none seats), wave-5 unlocked 4/8 (111102, 111104, 111105, 111106),
median survival 150d (6/8 survive to 150; 111103 village-lost d83,
111108 village-lost d128). Standing at end: 125–590.

Telemetry deviation check (§15 artifact): `telemetry-check.js` against
`hidden_files/telemetry-baselines/scale-wall.json` fires LOUD on national
(baseline 12 → current 0) and wins (16 → 0). Per the baseline's own
`_regime` note this is the documented regime artifact — the baseline is
the win-seat full-stack regime (FEASTSCALE/TRBFLOOR/WINPURSUIT/SEATDRIVE
on, 16/16 wins); this band is competent verbatim with no seat stack, where
wins are structurally ~0. No investigation item: the LOUD is the baseline
refusing the comparison it warns against. The §15 panel compare is
attached as this check plus the §5 reference comparison against the
ragecarry corpus; there is no candidate leg to compare, so no panel
verdict is drawn.

## 8. Blanks filled / documented, and metric review

**Documented (not fixed here):**
- Launch fitness is answered: HP is healthy-ish (median 85) with a real
  1.2% Alberto tail; arming is complete (median armed share 1.0); the
  binding departure failure is ammunition — 43% of ranged carriers
  depart unloaded, 0/47 on the worst seed. Next fix (not this arm): a
  departure-fitness check (arm + load before launch), aimed at ammo, not
  HP.
- Findings line 2748 is answered by this arm (coordinator to annotate):
  the half-armed shape is refuted as a holder-exclusion artifact; the
  unloaded-weapons half confirms as a village-level ammo famine.
- Outside-arm note (appended to sim-findings.md by the coordinator if
  adopted — none filed by this arm; nothing outside the arms surfaced).

**Metric review (frozen bars NOT re-scored):** B1's 0.80 floor did its job
a second time — it distinguishes a working instrument (1.0 here) from the
launchready census join (0.047). B2's "≥ 10 launches" was far exceeded
(220); a future departure instrument could afford a per-seed floor
instead. The prereg's §15 wording promised a panel compare for a
single-leg measurement; the honest artifact is the telemetry check plus a
reference comparison, and the baseline's own regime note explains the
LOUD — future single-leg preregs should name the telemetry check (not a
panel compare) as the §15 artifact. The one real instrument gap: 24
members fell back to default-100 HP; a future stamp should also read the
roster `person.health` first (it already does — those 24 had no health
anywhere, which is itself a small coverage note for the village-health
map).

## 9. Closeout state

- Branch `sim-launchfit-b`, HEAD `8268385f5` (driver fix) on master tip
  (worktree branch; coordinator merges via --ff-only). Commits: prereg
  1b683ec6f, instrument+driver+analyzer+proof 43eda02c9, driver fix
  8268385f5. Per-seed JSONs + analysis JSON + this evidence committed on
  the branch with the tooling (see §10). No src/js touched.
- Proof test green on the run (5/5, T5 real-corpus check included).
- Worktree contains the run corpus + evidence uncommitted; no src/js
  touched.
- **Ready to merge, pending ship.** Do NOT push, do NOT bump versions.
  The ship loop owns deploys.
- Verdict for the coordinator: **DIAG-GO** — the instrument answers the
  question; Alberto is the outlier, the half-armed shape is an artifact,
  the unloaded-weapons shape confirms as a village-level ammo famine.
  Next arm: the departure-fitness check build (arm + load before launch),
  aimed at ammunition.

## 10. Files

- `evidence/2026-11-27/sim-launchfit-b-prereg.md` (1b683ec6f)
- `scripts/launchfit-b-instrument.js`, `scripts/launchfit-driver-b.js`,
  `scripts/analyze-launchfit-b.js`, `scripts/test-launchfit-b.js`
  (43eda02c9, driver fix 8268385f5)
- `evidence/2026-11-27/perseed-launchfit-b/launchfit-b-s11110[1-8].json`
- `evidence/2026-11-27/perseed-launchfit-b-rerun/launchfit-b-s111101.json`
  (B4 determinism proof)
- `evidence/2026-11-27/launchfit-b-analysis.json`
- This evidence file: `evidence/2026-11-27/sim-launchfit-b.md`
