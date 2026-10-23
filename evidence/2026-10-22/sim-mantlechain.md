# sim-mantlechain — mantle-promotion chain as a veteran-death accelerant (DIAG, instrument-only)

Run: fleshout-20261022T2125Z · arm sim-mantlechain · axis scale-onramp · worker sim-mantlechain tree
Date: 2026-10-22 · DIAG arm: zero src/js, zero game change. Instrument namespace `mantlechain`, disjoint by design.

## The finding being diagnosed

sim-vetwindow DIAG (evidence/2026-10-22/diag-vetwindow.json): "the mantle-promotion
chain is a veteran-death accelerant: the mantle passes to trusted veteran villagers
(Saleh→Shuting→Sanne; Ethan→Mia; Mai→Nadia→Saleh across 3/4 DIAG runs), then the
new scholar leads the next wave-4 party and dies in it. Veterans don't just die as
fighters — the succession system concentrates risk on them."

Code-grounded mechanism (ledger.js playerDeath + villager-build.js mantleBecome):
on scholar death the mantle passes to the highest-trust living villager
(`candidates.sort((a,b)=>(trust[b]||0)-(trust[a]||0))` — trust decides). Veterans
earn trust through the blood channel (+25 standing per wave-3+ ledger kill point),
so the succession rule systematically hands the mantle — and the scholar's
obligation to lead wave-4 parties — to the village's proven killers.

This arm does NOT build a lever (the named next is a new-scholar restraint window
— named, not built). It builds the instrument that attributes veteran deaths to
the chain vs baseline fighter risk.

## PRE-REGISTRATION (§14 binding — written BEFORE any sims)

- **Primary metric**: of veteran wave-4 deaths, the share that are
  chain-accelerated vs baseline-fighter.
  - IN-SCOPE = a person with ≥1 wave-4+ waveKillLog kill (kill day ≤ death day —
    the standing.js readiness "VETERANS" bar's own definition) who died in a
    wave-4 fight (fightWave ≥ 4, basis 'live-tbfight' preferred, 'same-day'
    combat-cause-gated fallback).
  - chain-accelerated = in-scope AND died as the mantle-holder (player death)
    AND the mantle was acquired ≤ N=30 days before the death.
  - baseline-fighter = in-scope AND NOT chain-accelerated (died as a plain
    fighter/companion, or held the mantle longer than 30 days). Buckets
    exhaustive by construction → 0 unattributed is a plumbing check.
- **DIAG-GO bar**: ≥95% of in-scope veteran wave-4 deaths chain-accelerated AND
  0 unattributed. A miss is NO-GO, never re-scored mid-run.
- **Horizon**: 180d death-aware (dead villages stop; the long horizon is needed
  because the chain only manifests late — succession chains observed d107-161
  on the DIAG substrate).
- **Seeds**: 65471–65478 (8 fresh seeds, the armorydrive confirm band) ×
  {leadfeast, belongfeast} armed = 16 configs.
- **Policies**: AD.armedFor(leadfeast/belongfeast) — the competent non-seat
  policy stack (armory drive armed). KILLDISC v2 stack, ARMORYDRIVE=1.
- **Substrate env**: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1
  SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1 — exactly the substrate the vetwindow
  DIAG ran on, where the chain was observed (3/4 runs).
- **Secondary (not binding)**: the accelerant factor — per wave-4-fight
  participation death hazard: fresh successors (≤30d) vs veteran
  non-successor participants.

## Design calls (Steve 2026-10-07: figure it out yourself, document it)

1. **N=30 days**: the "fresh successor" window. Chosen from the DIAG
   observations: Saleh succeeded → died as scholar 8 days later; the chains
   complete within a month of game time. Documented, not canon.
2. **Veteran = ≥1 wave-4+ kill**: the readiness gate's own definition
   (standing.js), not invented.
3. **Death→fight linkage**: live tbfight first; same-day combat_start fallback
   gated to combat causes only (cause 'combat', 'split-fight:*', 'raid*', or a
   monster name) — a same-day starvation death is never mis-scored.
4. **Corpus = the exact substrate where the chain was observed** (not a fresh
   substrate): DIAG measures whether the observed pattern is systematic.
5. **Wall numbers reported every run** (national / table / wins, wave 4-5
   unlocks, median survival).

## Convergence state

NO-GO (binding bar missed — see Metric review; the mechanism is confirmed
under the intended contrast, but the pre-registered operationalization was
wrong). scale-onramp stays converging.

## Results

Corpus: 16 configs (seeds 65471–65478 × {leadfeast, belongfeast} armed),
180d death-aware, pinned substrate
FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1
ARMORYDRIVE=1. Proof test 28/28 GREEN (DET byte-identical, analyzer
RED→GREEN, live smoke, D2). Instrument errors: 0. Per-seed JSONs:
evidence/2026-10-22/perseed-mantlechain/mantlechain-s<seed>-<base>.json.

### Primary (binding): 62.5% — NO-GO

8 in-scope veteran wave-4 deaths (veteran = ≥1 wave-4+ kill by death day;
wave-4 fight via live-tbfight or combat-cause-gated same-day basis):

| config | day | who (succession→death) | trust@succ | vet@succ | bucket |
|---|---|---|---|---|---|
| s65471/belongfeast | d119 | Alejandro (+16d) | 99 | yes (hunting_guide) | chain-accelerated |
| s65472/leadfeast | d63 | Liam (+41d) | 100 | no (farmer) | baseline-fighter |
| s65472/leadfeast | d86 | Hannah (+16d) | 100 | yes (chef) | chain-accelerated |
| s65475/leadfeast | d131 | Colleen (+41d) | 91 | no (sign_painter) | baseline-fighter |
| s65475/leadfeast | d140 | Helene (+9d) | 100 | no (paramedic) | chain-accelerated |
| s65475/leadfeast | d149 | Mia (+9d) | 100 | no (gardener) | chain-accelerated |
| s65477/belongfeast | d96 | Carolina (+9d) | 100 | yes (lifeguard) | chain-accelerated |
| s65477/leadfeast | d89 | Shuting (+38d) | 90 | no (carpenter) | baseline-fighter |

5/8 chain-accelerated, 3/8 baseline-fighter, 0 unattributed.
DIAG-GO bar (≥95% + 0 unattributed): MISSED → NO-GO per §14, not re-scored.

### What the data actually says (the mechanism, confirmed)

1. **The chair is the accelerant, not the freshness.** 8/8 in-scope veteran
   wave-4 deaths were AS THE MANTLE-HOLDER (scholar deaths); 0/8 died as
   plain fighters/companions. The intended contrast (chain vs plain-fighter)
   is 8–0. The 30-day freshness window split the scholars (5 died ≤30d,
   3 survived 38–41d then died) — the bar's operationalization, not the
   mechanism, missed.
2. **The mantle goes to the trusted, not the blooded.** 157 successions;
   median successor trust 91 (min 0); only 3/157 (2%) went to already-veterans
   (trusts 99, 100, 100). The succession rule (trust decides — ledger.js)
   feeds the village's most-trusted people into the scholar's chair.
3. **Veterans-at-succession die fastest.** All 3 already-veteran successors
   (Alejandro, Hannah, Carolina) died as scholars within 16 days — 3/3 chain.
   The 3 baseline scholars were non-veterans at succession who survived the
   first month, blooded themselves in the chair, and died at +38–41d.
4. **Fresh-scholar per-fight hazard: 2.11×** (clean single-fight-day
   linkage; 64 multi-fight-day fights excluded): fresh successors
   (≤30d) die in 70.2% of wave-4 fights they join (33/47) vs 33.3% for
   veteran non-successor participants (2/6). Full-corpus computation: 1.67×.
   The scholar is in EVERY wave-4 fight ('p'); companions join only nearby
   ones — exposure × hazard compounds.
5. **Succession cascades are real.** 10/16 configs had 4–8 successions inside
   2-day windows. Extreme: s65477/leadfeast d89 — Shuting→Xavier→Somchai→
   Sanne→Saleh, FOUR scholars dead in ONE day in Reunion fights (chain
   continued d90 Saleh→Baoguo: an 8-link chain d43–d90).
6. **Death→fight linkage basis**: 116 deaths with fightWave≥4: 19
   live-tbfight, 97 same-day. The death tele fires after tbEnd('lost') sets
   the fight over, so scholar TB deaths are essentially always same-day
   basis — the combat-cause gate is load-bearing (verified: non-combat
   same-day deaths never score).

### Wall numbers (this corpus)

national 6/16 · table (standing≥200 proxy) 0/16 · won 0/16 · wave4 15/16 ·
wave5 0/16 · median survival 151d. The wave-5 door remains the binding wall.

## Sense pass

READ the succession beats — the finding is a blank, flagged per the
SENSE-TESTING LAW:

The succession moment is voiced by the SAME two canned lines every time
(157 successions): "The Codex doesn't pause for grief. X blinks — and it's
already there, overlaying everything, syncing. No pen. No paper. The mantle
just... transfers." + the System's "MANTLE TRANSFER DETECTED..." joke. On
s65477/leadfeast d89 — four scholars dead in one day — the identical beat
fired FOUR times in a row, word for word. The village's own grief beat
("X's gone... You're not X.") fired only 8 times across 157 successions.
The emotional core of the village-as-protagonist continuity reads as a
rubber stamp: the System jokes while the village buries four scholars in a
day and says nothing personal. Consequence, not just counts: the chain the
instrument measured is INVISIBLE in the fiction — the game never marks that
the same chair killed four trusted people in 24 hours.

(Sense-positive: the beats that DO fire read as people — Xavier's "There's
two of them. We can't do this scattered — we need a real team. A named one.
People fight harder for a name." lands exactly where the instrument says
the dying happens.)

## Metric review

The pre-registered bar (≥95% chain-accelerated within 30d) MISSED at 62.5%
— but the miss is in the operationalization, not the theory. The DIAG's
"3/4 runs" observation sampled chains where successors died within days;
the full corpus shows the accelerant is the CHAIR (8/8 as mantle-holder, 0
as plain fighters) with freshness as a gradient (veterans-at-succession:
3/3 dead ≤16d; non-veterans: die at 70%/fight or blood themselves and die
at +38–41d). A 30-day binary was the wrong cut — it punished the mechanism
for the scholars who survived a month.

Proposed for the NEXT run: primary = share of in-scope veteran wave-4
deaths that are mantle-holder deaths at ANY succession age (this run: 8/8
= 100%); secondary = the freshness gradient (≤30d vs >30d per-fight
hazard). The ≥95% bar shape was right; the window was wrong.

## Named next

**The new-scholar restraint window** (named, NOT built — DIAG arm): a
fresh successor (≤N days in the chair) does not lead wave-4 parties —
the village holds them back while they learn the office, exactly as the
readiness gate holds the wave door. The instrument now exists to measure it:
before/after on the chain-accelerated share and the fresh-scholar per-fight
hazard. Design questions for the build run: N's value, whether the
restraint is voiced (the village insisting) or systemic, and what the
restrained scholar does instead (Steve 2026-10-07: routine calls are
worker's; feel changes are Steve's — this one changes feel → [needs-eyes]
when built).

## Design calls made this run

1. N=30d freshness window (pre-registered; proved the wrong cut — see
   Metric review).
2. Veteran = ≥1 wave-4+ kill (standing.js's own definition).
3. Same-day death→fight linkage gated to combat causes (instrument +
   analyzer both enforce).
4. Corpus = the exact substrate where the DIAG observed the chain
   (measurement, not exploration).
5. table reported as standing≥200 proxy, labeled.
