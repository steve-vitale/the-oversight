# sim-fiberfetch-a — EVIDENCE (pilot, 8 seeds × 2 legs)

**Arm:** sim-fiberfetch-a · **Loop A run:** fleshout-20261121T0015Z
**Verdict: NO-GO** — the primary fails 0 fetch-attributable volleys
against a bar of ≥ 1, and two further bars fail (consistency,
starvation). Kill class (§14a): **CONCEPT-DEAD** on the primary,
with **METRIC-BROKEN** notes on bars 4 and 6 (§8). The lever +
substrate are reverted (§9); the branch is instrument + evidence
only.
**Prereg (frozen 2026-11-21 ~01:20 UTC, before any judged sim):**
`evidence/2026-11-21/sim-fiberfetch-a-prereg.md`
**Builds on:** `evidence/2026-11-20/sim-ammo-a.md` + prereg
(NO-GO on the primary 1/6: the served bow's quiver works at the
trailhead, but the binding constraint was read as FIBER supply —
pile fiber 0 at the attempt in 20 rows/leg, no-mats 17×/leg; §7
named the next mechanism: "a fiber fetch"),
`evidence/2026-11-20/sim-depmat-a.md` (trailhead bundle served 5
attributable bows, 0 served-bow volleys; unscoped cascade),
`evidence/2026-11-20/sim-evade-a.md` (NO-GO: a served bow CAN
volley — Ximena, seed 107051 d35, 2 shots / 2 hits / 27 dmg),
`evidence/2026-11-20/sim-roll35-a.md` (NO-GO: 0 served-bow
volleys, 5 engaged served fights entered with 0 ammo),
`evidence/2026-11-20/sim-speargate-a.md` (gate fix LANDED on
master).
**Anchor:** faa5d65a9 (worktree `~/workspace/worktrees/
sim-fiberfetch-a`). **Base:** master faa5d65a9. No push, no version
bump, no live verification — coordinator merges.

## Bars (frozen prereg — a miss on any bar is NO-GO, never re-scored)

| # | Bar | Ctl | Arm | Verdict |
|---|-----|-----|-----|---------|
| 0 | Substrate-served (attributable-served ≥ 3) | 0 | **5** | PASS |
| 1 | Pool floor (served-bow engaged meetings ≥ 3, raw) | 0 | **3** | PASS |
| 2 | **PRIMARY — fetch-attributable served-bow volleys ≥ 1** | 0 | **0** | **FAIL** |
| 3 | Served-with-ammo rate rise (arm share strictly > ctl) | 0/0 = 0.000 | 1/3 = 0.333 | PASS |
| 4 | Consistency (departures within 5% AND spearSeen within 10%) | 198 dep / 32 seen | 216 dep (+9.1%) / 7 seen (−78.1%) | **FAIL** |
| 5 | Guardrail deaths per engaged meeting (arm ≤ ctl, pair-inclusive) | 119.40 (597 / 5) | 62.18 (684 / 11) | PASS |
| 6 | Guardrail starvation (arm ≤ ctl + 2, totals AND villager-only) | 0 (villager 0) | **3** (villager 3) | **FAIL** |
| 7 | Guardrail median survival (arm ≥ 0.80× ctl) | 143.5d | 145.5d (bar 114.8d) | PASS |

**Instrument errors 0** on all 16 per-seed files.

## §1. The lever (what was built)

FIBERFETCH — at the departure arrow-craft attempt for a served
bow, if pile fiber is the SOLE shortfall, the crafter gathers the
missing fiber at the departure site (deterministic, zero draws —
the DEPMAT site-supply pattern applied to fiber). Scope guard:
fires ONLY at the arrow-craft attempt for a served bow, never at
the bow craft, never for non-served departures. Built on the
rebuilt DEPMAT + ROLL35 + AMMO substrate (recovered from the
evidence + proof tests, env-gated OFF). Proof tests on this base,
all green before the pilot: `test-fiberfetch-a.js` 71/71,
`test-depmat-a.js` 43/43, `test-roll35-a.js` 41/41,
`test-ammo-a.js` 52/52, `test-spearstage-a.js` 26/26,
`test-speargate-a.js` 31/31, `test-bowcraft-a.js` 58/58,
`test-bowknow-a.js` 19/19, analyzer `--selftest` 85/85. The
fetch is independent of the AMMO rate (proof F10: AMMO unset,
fetch still serves 5 arrows); the pilot runs AMMO=1 alongside
anyway (the arm is the whole stack against live). The ctl leg is
the LIVE game (substrate OFF) — unlike the ammo arm, whose ctl
was the substrate ground.

## §2. Before / after (identical seeds 107101–107108, 150d, competent verbatim)

Legs differ ONLY by env. Ctl: `SPEARGATE=1` + substrate OFF.
Arm: `SPEARGATE=1 + DEPMAT=1 + ROLL35=1 + AMMO=1 + FIBERFETCH=1`.
Common both legs: `BOWOPEN=1 + SENSEEXPED=1 + VETREENGAGE=1 +
PARTYSIZE4=1 + FLEEREPAIR2=1 + FIGHTALLY2=1`. BOWKNOW, DEPARTSEE,
EVADEOBS unset both legs.

Per-seed (days / end / wave / deaths):

| Seed | Ctl | Arm |
|------|-----|-----|
| 107101 | 124d lost w4 68 | 141d lost w4 83 |
| 107102 | 150d surv w4 60 | 150d surv w5 96 |
| 107103 | 150d lost w4 80 | 122d lost w5 97 |
| 107104 | 150d surv w5 60 | 100d lost w4 63 |
| 107105 | 150d surv w5 94 | 150d surv w5 54 |
| 107106 | 137d lost w5 83 | 150d surv w4 93 |
| 107107 | 73d lost w4 81 | 150d surv w5 127 |
| 107108 | 97d lost w4 71 | 97d lost w4 71 |
| **Totals** | **597 deaths, median 143.5d, wave-5 3/8, lost 5/8, national 0/8, wins 0/8** | **684 deaths, median 145.5d, wave-5 4/8, lost 4/8, national 0/8, wins 0/8** |

Run notes: the first pilot attempt was killed by a VM restart
(01:24 UTC, `uptime` 1 min — the restart killed the running
driver silently, no pilot seed file landed). Heartbeat
re-established first, writes re-probed, pilot re-run from scratch
afterward: ctl 8/8 in ~18 min, arm 8/8 in ~14 min, 0 instrument
errors. Probe seeds 107101/107102 reproduce their probe-arm
numbers exactly (days 141/150, deaths 83/96, v4encounters 39/22)
— the driver is deterministic on the same env.

The substrate works — the fetch never fires:

| | Ctl | Arm |
|---|---|---|
| Departures (ammoRows) | 199 (198 counted) | 216 |
| Served departures | 1 | **20** |
| Served with ammo (carriedAfter ≥ 1) | 0 | **14** (mean carried 3.5) |
| Served with 0 ammo | 1 | 6 — ALL craft-fail at the 60% rate, fiber plentiful (pile fiber 3–40) |
| Attributable-served | 0 | **5** (site-supplied spear 7, site-crafted 5, site-crafted-fail 2) |
| **Fetch rows** | 0 | **0** |
| Fetch-served rows / with ammo | 0 / 0 | **0 / 0** |
| Served `no-mats` | 0 | **0** |
| Pile-fiber-0 at served departures | 0 | **0** |
| Pile fiber 0 (all rows) | 26 | 17 |
| `no-mats` (all rows) | 4 | 23 |
| Fail reasons (all rows) | already-capped 37, no-ranged 110, no-ammo-id 32, craft-ok 8, no-mats 4, stock-draw 3, craft-fail 5 | already-capped 80, no-ranged 38, craft-fail 15, craft-ok 39, no-mats 23, stock-draw 19, no-ammo-id 2 |

The pool, exactly at the floor: arm served-bow engaged meetings
(raw) **3** — 1 entering with ammo (Sam Wilson, §4), 2 entering
with 0 ammo; **1 served-bow volley** (Sam's, 2 shots / 2 hits /
34 dmg) — and **0 fetch-attributable volleys**, because no fetch
ever fired. Pair-inclusive beside it, NOT binding: served
meetings 0 on both legs (all 3 raw meetings are outside launched
parties — expedition / world-tick origin); unserved meetings 5
on arm (2 with 0 ammo); served-bow volley joins 0.

## §3. The autopsy (why the primary failed — mechanism found)

**The trigger never occurs, because serving and fiber-shortage
live in different parts of the run.** On the arm leg, the 20
served departures fall on days 13–138 with pile fiber **3–55**
at the attempt (minimum 3 — never 0, never even 1 short). The 17
pile-fiber-0 rows fall on days 2, 92–107, and 136 — AFTER the
serving stops on their seeds (107101 served d99–d106, fiber-0
d136; 107107 served d27–d87, fiber-0 d92–d107) or BEFORE serving
starts (107106 fiber-0 on day 2, first served d36). Bows are
served mid-game when the pile holds fiber; fiber runs out late
when the village is already dying and no bows are served. The
two populations are disjoint in time on every seed. The fetch's
trigger — served AND fiber-short — is vacuous in live play, not
just rare: it never even came within one unit (minimum pile fiber
at a served departure is 3, need is 1).

**The premise was wrong at served departures.** The ammo band's
"pile fiber 0 (20 rows/leg), no-mats 17×/leg" was read as the
fiber wall — but re-counted from the ammo corpora, only **2 of
12 served departures per leg** were fiber-short (2 served
`no-mats`, 2 served pile-fiber-0, identical on both ammo legs).
The 20 pile-fiber-0 rows were overwhelmingly NON-served
departures. The village does stock fiber when it serves bows.
The fetch attacks a wall that barely exists where it matters:
~2 firings per band on the ammo band, 0 on this band — and each
firing still needs a 60% craft, a wave-4+ fight, and a volley to
reach the primary. Expected fetch volleys per band: well under 1.
The bar (≥ 1) was fair as a minimum meaningful effect; the
concept could not deliver one.

**The remaining served gap is the ROLL wall, not the materials
wall.** All 6 served departures that left with 0 ammo failed
their 60% craft with fiber plentiful (pile fiber 3, 5, 12, 18,
35, 40). 6/20 served bows leave empty on a failed roll — the
fetch, by design, cannot help them. The quiver's binding
constraint on this band is the 60% rate, and the two served-bow
engaged meetings that entered with 0 ammo both died (vDie) with
0 shots fired. The next lever for the serve half, if any, is the
roll — not supply.

**Consistency (bar 4) — the bar measures what the substrate
moves by design.** Departures 216 vs 198 (+9.1%): the rise is
concentrated on the seeds where the substrate serves most
(107107: 49→60 rows, 4 served; 107102: 28→34, 6 served;
107103: 23→32, 3 served), and dawn-bid departures run far higher
on the arm leg (107106: 116 vs 13; 107107: 78 vs 34) — arming
villagers makes them depart more. SpearSeen 7 vs 32 (−78.1%):
per seed, ctl 107102:9 / 107105:7 / 107107:15 / 107108:1 (rest 0)
vs arm 107102:2 / 107106:2 / 107107:2 / 107108:1 (rest 0). The
mechanism: a spear-holder who is served a bow stops being a
staging candidate — later departures show them as alreadyHad,
not as a spear-holder to be counted. On ctl they are never
served, so they recur as candidates departure after departure
(107107 ctl: 15 spearSeen across 49 departures). Serving
spear-holders necessarily drains the spearSeen pool; the bar as
frozen fails exactly when the substrate works. See §7.

**Starvation (bar 6) — fails by one death on n=3.** Arm 3
(villager 3) vs ctl 0: one starvation death each on 107103,
107104, 107106. The bar (ctl + 2 = 2) is tight when ctl sits at
0, and at n=3 it cannot distinguish mechanism from noise. The
plausible mechanism is the arm's extra fighting: 684 vs 597
deaths, more kill calls, more expedition days — fewer foragers
at home. But the count is three single deaths on three seeds;
the evidence does not over-claim it. See §7.

**Deaths per engaged meeting (bar 5) passes, but read it with
the panel.** Absolute deaths rose (684 vs 597, +87) while deaths
per engaged meeting fell (62.18 vs 119.40 pair-inclusive) — the
arm fights more and dies more in total, fewer per fight. The
§15 panel flags the same signal as `regression_watch` on village
deaths per run (+10.9, 95% interval −6.4 to +26.1, includes 0).

## §4. Sense-test (transcripts of served fighters)

The fetch never fired, so there is no fetch say line to
sense-test — no villager anywhere strips fiber at a trailhead in
either leg. That silence is itself the result: the line is
written, proven (F2), and unheard.

The one served-bow volley is Sam Wilson, seed 107107, served
day 35 (spear-holder, site vine, roll35 0.60, craftedOk; pocketed
5 arrows at the 60% AMMO rate with pile fiber 3 — just enough, no
fetch needed), volley day 44 vs The Eater (wave 4, 1095 HP):

> "Sam walks straight into The Eater. No avoiding it."
> "Sam sees The Eater coming and nocks an arrow — the fight opens
> at range (2 shots)."
> "  loosed — it takes The Eater for 17 (1078 left)."
> "  loosed — it takes The Eater for 17 (1061 left)."
> "Sam lowers the bow — The Eater is on them now. (2/2 hit)"
> "R1: Gorge hits Sam for 30 (45 left)"
> "R1: Sam walks in open-handed — and it goes wrong. … (Walk In —
> failed)" / "  still off-balance from the failed parley, Sam takes
> it worse. (Peacemaker — exposed)"
> "R2: Gorge hits Sam for 45 (0 left)"

The volley is real and naturally narrated — nothing robotic.
Sam dies in round 2. The volley (34 dmg vs 1095 HP) does not
change the outcome, and the failed parley that follows it reads
as the fight it is. The other two served-engaged meetings both
died with 0 ammo and 0 shots: visjoin_78 (107102 d91 vs the
Algorithm, served d80, entered with 0 — the 5 arrows from d80
did not survive to the fight) and gen_jfbdo6b (107107 d61 vs the
Algorithm, served d33, the d33 60% craft failed). No vetSays line
in days 30–50 mentions Sam, fiber, arrows, or bows — the served
fighters do not comment on their quivers; the volley speaks in
the fight log, not in says. Nothing here needs Steve's eyes on
feel: the mechanism is unheard because it never fires, not
because it reads wrong.

## §5. §15 balanced panel

`scripts/build-fiberfetch-panels-a.js` + `node
scripts/balance-panel.js compare` → decision
**review_required** (`evidence/2026-11-21/fiberfetch-a-panel.md`
attached). 8 paired cases; screen only. Village deaths per run
74.6 → 85.5 (+10.9, `regression_watch`, 95% exploratory interval
−6.4 to +26.1 — includes 0); village deaths per 100 days 61.8 →
65.0 (+3.2, `regression_watch`); community loss 0.625 → 0.5
(no material signal); first-bearer survival through day 30/60
unchanged (1 → 1); table win rate 0 → 0; national access 0 → 0.
No weighted score. The panel is the instrument, the frozen bars
are the judge — the panel's `regression_watch` agrees with the
guardrail story in §3 (more fighting, more deaths in total) and
does not overturn any bar.

## §6. Village assessment (plain words)

The villages that got the trailhead bundle arm more fighters and
send them out more — but the fiber fetch itself does nothing in
live play, because the pile always has fiber when a bow is being
made. The one bow that shot did its job cleanly and still died:
a wave-4 monster has over a thousand health and a served bow
scratches it for 34. The villages fight more, die more, and end
up in the same place: no wins, no national standing, on either
leg. The fetch is a fix for a shortage that happens after the
bows stop being made — it arrives too late to matter, every time.

## §7. Metric review (frozen bars judge as written — no re-score)

- **Primary (bar 2):** the miss is the TRIGGER, not the roll,
  the pool, or the substrate. Substrate served 5 (bar 0 pass),
  pool fielded 3 (bar 1 pass, exactly at the floor), the roll
  quivered 14/20 served — but the fetch fired 0 times, so 0
  fetch-attributable volleys. The review names the population
  the miss lives in: the raw population, at the trigger link.
- **Consistency (bar 4):** the miss is BOTH halves, and both
  halves measure what the substrate moves by design (§3). A
  future prereg that judges a working bow-serve substrate needs
  a consistency bar that does not count serving as drift — the
  current bar cannot tell a working substrate from a cascade.
  The verdict does not get re-scored.
- **Starvation (bar 6):** the miss is one death past the bar on
  n=3 with ctl at 0. A future prereg needs a starvation bar with
  a floor (not ctl + 2 when ctl is 0) or a larger band before it
  can judge a 1-death difference. The verdict does not get
  re-scored.
- **Deaths per engaged meeting (bar 5):** passes, but the
  pair-inclusive meeting counts are thin (ctl 5, arm 11) and the
  absolute death count rose — the review records both, and the
  panel's `regression_watch` agrees.
- **RNG divergence:** the legs diverge by design once the
  substrate flips a craft; departure counts drift with it (§3).
  The review must not re-litigate divergence as a mechanism
  failure — but the consistency bar as frozen DOES score it,
  which is the bar's flaw, not the mechanism's.
- **Draw-neutrality** is a property of the mechanism, not of
  the corpora: a fetched fiber would put arrows in a pack, so
  the streams would diverge once the fetch fired. It never fired,
  so the streams diverged on the substrate alone.

## §8. Kill classification (§14a)

- **CONCEPT-DEAD (primary):** the mechanism was staged (proof
  71/71 — the fetch serves 5 arrows whenever pile fiber is the
  sole shortfall at a served departure), the metric was fair
  (≥ 1 fetch-attributable volley on 8 seeds is the minimum
  meaningful effect), and the concept failed on its merits: the
  wall it attacks does not exist where it matters. Pile fiber is
  never short at a served departure in live play (0/20 here,
  minimum 3; 2/12 on the ammo band) because serving and
  fiber-shortage live in different parts of the run (§3). A lever
  whose trigger fires ~0–2 times per band, each firing still
  needing a 60% craft, a fight, and a volley, cannot move the
  serve half. Do not retry the narrow fetch without a new
  mechanism. The next lever for the serve half, if any, is the
  ROLL wall (6/20 served leave empty on failed 60% crafts) — or
  a BROADER fetch (any departure, any shortfall), which is a new
  mechanism, not a re-score.
- **METRIC-BROKEN (bars 4 and 6, noted, not the kill):** the
  consistency bar counts serving as drift (spearSeen drains as
  spear-holders are served; departures rise as armed villagers
  depart more), and the starvation bar fails by one death on
  n=3 with ctl at 0. Both need re-scoping in any future prereg
  that judges a working substrate. Neither changes this
  verdict — the primary is CONCEPT-DEAD on its own.
- Finding #2590's serve half stays OPEN. The substrate
  (DEPMAT + ROLL35 + AMMO) serves bows and quivers 14/20 of
  them, and a served bow CAN volley (Sam Wilson, 2/2/34) — but
  the quivered bows still die with the fight unwon, and the
  fiber fetch adds nothing. The evade wall stands as the named
  next arm (evade-on-a-quivered-bow), after the roll wall.

## §9. Revert (NO-GO closeout)

Per the depmat/roll35/ammo/evade precedent (instrument +
evidence only): the FIBERFETCH lever **and** the DEPMAT+ROLL35+
AMMO substrate re-land are reverted from `src/js/game.js`
before the final commit — the branch's final tree differs from
master faa5d65a9 in no `src/` file. The lever commit stays in
branch history, so the next arm can re-land the substrate from
it exactly as this arm re-landed roll35/ammo from the prereg +
proof test. Proof results at the lever commit (FIBERFETCH 71/71,
DEPMAT 43/43, ROLL35 41/41, AMMO 52/52, SPEARSTAGE 26/26,
SPEARGATE 31/31, BOWCRAFT 58/58, BOWKNOW 19/19, analyzer
selftest 85/85) are recorded here and in the commit message;
the proof tests fail on the reverted tree by design, as the
roll35/ammo/evade tests do on master (their lever code is not on
master either, and none of these arm tests is on the green list).
Nothing is pushed, no version bumped, nothing verified live.
Branch clean, ready for coordinator `--ff-only` merge, pending
ship.

## §10. Files

- Prereg (frozen): `evidence/2026-11-21/sim-fiberfetch-a-prereg.md`
- This evidence: `evidence/2026-11-21/sim-fiberfetch-a.md`
- Analysis: `evidence/2026-11-21/fiberfetch-a-analysis.json`
- §15 panels: `evidence/2026-11-21/fiberfetch-a-panel-before.json.gz`,
  `fiberfetch-a-panel-after.json.gz`, `fiberfetch-a-panel.json`,
  `fiberfetch-a-panel.md`
- Pilot corpora (8 seeds each):
  `evidence/2026-11-21/perseed-fiberfetch-a-ctl/`,
  `evidence/2026-11-21/perseed-fiberfetch-a-arm/`
- Unjudged design-research probe (pre-prereg):
  `evidence/2026-11-21/perseed-fiberfetch-a-probe-ctl/`,
  `evidence/2026-11-21/perseed-fiberfetch-a-probe-arm/`
- Instrument: `scripts/fiberfetch-driver-a.js`,
  `scripts/analyze-fiberfetch-a.js`,
  `scripts/build-fiberfetch-panels-a.js`,
  `scripts/test-fiberfetch-a.js`
- Lever + substrate (reverted, history only): `src/js/game.js`
  `villagerStageBow` step 3 (DEPMAT) + `villagerPocketAmmo`
  step 3 (ROLL35, AMMO, FIBERFETCH) at the lever commit.
