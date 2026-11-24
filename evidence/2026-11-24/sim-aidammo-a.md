# sim-aidammo-a — aid / world-tick ammo-supply DIAGNOSTIC

**Verdict: DIAG-GO (DOMINANT-SOURCE) — the ledger names the supplier, and the supplier is home-duty craft.**
**Arm:** sim-aidammo-a · **Loop A run:** fleshout-20261124T2115Z · **Axis:** scale-onramp
**Prereg:** `evidence/2026-11-24/sim-aidammo-a-prereg.md` (frozen 2026-11-24 ~22:20 UTC, before any judged sim)
**Analysis:** `evidence/2026-11-24/aidammo-a-analysis.json` · **Corpus:** `evidence/2026-11-24/perseed-aidammo-a/` (8 seeds)
**Branch:** `sim-aidammo-a` · **Base:** `4c1bb482e` (the sim-ammosupply-a evidence-only landing)
**Instruments:** `scripts/aidammo-driver-a.js`, `scripts/analyze-aidammo-a.js`, `scripts/test-aidammo-a.js`
**Substrate:** `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1 SPEARGATE=1 BOWOPEN=1`, competent-player policy verbatim, 150d death-aware horizon, seeds **110501–110508** (verified fresh band).

## §0 The question, in plain words

The departure ammo-supply lever was just killed (sim-ammosupply-a, NO-GO THIN-POOL — it
supplied 0 batches). The bowopen recheck showed only 29 of 88 fighters walking into a fight
with ammunition. So the question moved off the departure and into the village itself: **where
does ammunition actually come from during play, and does it reach the people who fight the
big monsters?** This arm traced every batch of arrows, bolts, stones and fusion cells from
its source to the fighter holding it, across a fresh band of 8 villages.

**Short answer:** the village's own at-home craft makes almost all of it — 85 of every 100
arrows a fighter holds when they meet a wave-4 monster were made at home by a fellow
villager. The problem is not that ammunition never arrives (three quarters of what gets made
reaches a fight); the problem is that **most ranged fighters never get a batch in their whole
life** — 131 of the 149 fighters who walked into a wave-4 fight empty-quivered had never once
been handed ammunition. Production is real but narrow: it reaches the few bow-carriers who
happen to be home, and misses everyone else. And one whole village (seed 110501) made
nothing at all in 150 days — one single craft attempt, which failed.

## §1 Verdict — judged only against the frozen prereg §2 bars

| Bar (prereg §2) | Result | Pass |
|---|---|---|
| Pool floor: pair-inclusive engaged wave-4+ meetings ≥ 10 | **21** | ✅ |
| Mechanism re-measure: ammo-at-entry vs 0.70 (report-only, never a verdict bar) | **0.577** (203/352) | report |
| Attribution completeness ≥ 0.90 | **1.000** (1226/1226 units; unknown 0) | ✅ |
| Dominant source share ≥ 0.50 OR no-source-delivers proven | **home-duty 0.849** | ✅ |
| **Verdict** | **DIAG-GO, DOMINANT-SOURCE** | ✅ |

All three verdict bars pass. The mechanism bar is re-measured, not judged: 0.577 against 0.70
is still a miss — this arm measures the bar, it does not pass or fail on it. The DIAG-GO is
about the ledger: the attribution is complete and one source dominates. The next lever must
live in home-duty craft, not in departure.

## §2 The ledger — where ammunition comes from

### §2a Production (batches and units, 8 seeds)

| Source | Batches | Units | Share of units |
|---|---|---|---|
| Home-duty craft (`villagerAmmoCraftDay`) | 123 | 615 | 73.2% |
| Departure craft (`villagerPocketAmmo`) | 25 | 125 | 14.9% |
| Departure pile stones | 21 | 94 | 11.2% |
| Starting kit | 5 | 5 | 0.6% |
| Kill loot (ammo) | 0 | 0 | 0% |
| Other (unexplained gains) | 1 | 1 | 0.1% |
| **Total** | **175** | **841** | — |

- Home-duty craft ran 1,125 duty-days and produced 123 batches of 5 — about one batch every
  9 village-days. Departure craft was attempted 48 times and succeeded 25 (52%, a blend of
  the blind 35% and learned 85% rates). Departure pile stones added 94 units.
- **Kill loot supplied zero ammunition in 85 loot drops.** That matches the frozen ground
  (arrow/bolt/stone are in no kill-loot tier and are not alien-origin; only fusion cells can
  drop, and none did). The single "other" unit was 1 fusion cell appearing on seed 110502,
  day 54, carried by daniyar_askarov, with no wrapped production event behind it — most
  likely a contest prize or care-package cell, not a kill drop. One unit in 841: the
  residual is negligible and the ledger is not hiding a secret supply.
- **Starting-kit is a rounding error at wave-4 time:** only 5 starting units existed across
  the whole band, and **zero** starting-kit units were held at any wave-4 entry. The desk
  expectation that starting kit would bulk up the numbers was wrong — by the time villagers
  meet wave-4 monsters, every arrow they hold was made during play.
- **The departure stash never moved:** `departureStashMoved: 0` and `transfers: 0`. Nobody
  ever pocketed stashed ammunition, because nobody ever had any stashed — the stash path is
  dead in live play, which is consistent with the vestigial departure craft finding (#2602).

### §2b Units held at wave-4+ entry, by production source

| Source of the units | Units at entry | Share |
|---|---|---|
| Home-duty craft | 1,041 | **84.9%** |
| Departure craft | 104 | 8.5% |
| Departure pile stones | 81 | 6.6% |
| Starting kit / loot / other | 0 | 0% |
| **Total** | **1,226** | — |

Attribution completeness **1.000**: every one of the 1,226 units at entry traces to a known
production source (unknown 0). No unattributed spends (0), no unexplained losses. The
instrument is airtight on this band.

### §2c Delivery — does what gets made reach a fight?

| Source | Batches made | Batches reaching a wave-4+ meeting | Units delivered |
|---|---|---|---|
| Home-duty craft | 123 | 92 (75%) | 460 of 615 |
| Departure craft | 25 | 18 (72%) | 90 of 125 |
| Departure pile stones | 21 | 15 (71%) | 65 of 94 |

Delivery is **not** the binding problem: about three quarters of every batch made reaches a
wave-4+ meeting before the run ends. The units that never arrive are mostly held by villagers
who never meet a wave-4 monster, or spent in earlier fights (277 spend events, 607 units
spent across the band — volleys and lower-wave fights eat the stock).

## §3 The mechanism, re-measured (0.447 → 0.577)

| Measure | This band | Ammosupply band (110401–110408) |
|---|---|---|
| Ammo-at-entry, lead + allies, all origins | **203/352 = 0.577** | — |
| Ammo-at-entry, lead only, all origins | **62/124 = 0.500** | 17/38 = 0.447 |
| Ammo-at-entry, capable-only (spears excluded) | 203/309 = 0.657 | — |
| Spears among ranged-at-entry | 43/352 = 12.2% | — |

The re-measure lands close to the ammosupply band: lead-only 0.500 vs 0.447, both far under
the 0.70 bar. The 0.577 headline is higher only because **allies are better stocked than
leads** (allies 141/228 = 0.618 vs leads 62/124 = 0.500) — the lead figure is the
apples-to-apples comparison, and it confirms the ammosupply reading rather than overturning
it.

### §3a By origin of the meeting

| Origin | Lead + allies | Lead only |
|---|---|---|
| Expedition | 58/99 = 0.586 | 19/31 = 0.613 |
| Aid (called to help) | 46/77 = 0.597 | 16/30 = 0.533 |
| World-tick (monsters walk in) | 99/176 = 0.562 | 27/63 = 0.429 |

The ammosupply band's wide origin gap (expedition 5/7, world-tick 8/19, aid 4/12) does **not**
reproduce with allies counted — the three origins sit within 0.035 of each other. With leads
only, a gap survives (expedition 0.613 vs world-tick 0.429), in the same direction as
ammosupply, but smaller. Two readings, both in the evidence: (a) the small-n origin gap was
partly noise from 38 lead rows; (b) the gap is real for the person the fight is about and
allies dilute it because allies are usually the home-stocked ones. Either way **no origin is
near 0.70** — the shortage is everywhere, not in one meeting type. Aid is not a special
desert: aid fighters arrive with ammunition 0.597 of the time, the best of the three origins
with allies counted. The "aid supplies nothing" reading from the frozen ground (aidFight
grants no ammo) is true but beside the point — aid fighters bring whatever they already had,
and what they had is mostly home-duty craft.

### §3b The empty fighters — coverage, not replenishment

Of the 149 fighters who entered a wave-4+ meeting with an empty quiver:

| Empty fighter's history | Count |
|---|---|
| Had received a batch before, and spent it | 18 |
| **Never received a single batch in their whole life** | **131** |

88% of the empty-quivered had never been supplied at all. This is a **coverage** failure,
not a replenishment failure: the ammo exists (615 units made, 460 delivered), but it
concentrates in a small set of villagers while most ranged fighters never touch a batch.
The home-duty gate explains why: craft only happens for a bow-carrier who is **at home**
with fewer than 5 arrows and with materials in hand. The fighters who meet monsters are
the ones away from home — and the ones at home rarely meet monsters. Six villagers were
empty at more than one meeting (repeat empties).

## §4 Seed 110501 — the village that made nothing

Seed 110501 is the open question from the pilot, resolved:

- 150 days survived, wave 5 reached, standing 440, regional — a healthy village by every
  other measure.
- **Home-duty craft: 0 batches in 150 days.** Departure craft: 0 attempts. The only
  ammunition the whole village ever held was 2 batches of pile stones (8 units).
- Its leads entered wave-4 fights with ammunition **1 time in 17** (0.059). Its two bow
  carriers (Paolo Coronel, Ingrid Vik) appear as ranged fighters 11 times each and their
  final provenance queues are empty — they never held a single arrow in 150 days.
- The game's own telemetry confirms it: `ammo_craft: 1` in 150 days — exactly **one**
  ammo-craft attempt in the whole run (and it failed, since 0 batches resulted). The duty
  function ran 150 times (once a day) and almost always skipped before any craft attempt.

**Instrument gap, named:** this corpus cannot separate the two candidate causes — (a) the
bow carriers are rarely home, or (b) the pile never holds the materials (stick/stone/fiber)
an arrow batch needs. Pile materials and at-home bow-carrier counts are not in the sampled
state. The next instrument should snapshot both daily. The leading hypothesis is materials:
with a 35% blind craft rate, zero successes over any real number of attempts is impossible,
so attempts themselves must have been ~zero — and the gate that blocks an attempt is
"at home + short of ammo + materials in hand". A healthy 150-day village that cannot get
one arrow made is the sharpest single fact in this arm.

## §5 Pair pool — the fights themselves

- Pair-inclusive engaged wave-4+ meetings: **21** (floor 10 ✅). Funnel: 94 expedition
  encounters joined, 30 party-absent, 40 evade-excluded, 3 no-launch-plan.
- Outcomes: 2 wins (0.095), **1 kill (0.048)**, 4 villager deaths, 15 villager flees,
  1 monster flee. Damage per round 43.7. Volley fired in 6/21 meetings (0.29).
- The pool is thinner than the ammosupply band's 21/21 pair pool? No — same count (21),
  but the kill share is worse (1/21 vs the ammosupply band's higher kill share) and the
  flee share is 15/21. The wall did not move (see §8).

## §6 Sense-testing — two meeting transcripts, read in full

**110507 d97 — Jovan vs the Algorithm, starfall bow, 3 arrows.** The fight opens at range:
all three arrows hit, 95 damage. Jovan's rage fires at round 2, a 72-damage strike lands at
round 4. Fifteen rounds, party present (Aroha, Theo), the gate said seek — and still a
villager flee. Reads sensibly: a geared, arrowed fighter who lands the best opening volley
in the whole pair pool and still cannot finish a wave-4 monster. The supply story holds:
Jovan had exactly 3 arrows — the tail of a 5-arrow home-duty batch after earlier spends.

**110503 d150 — Simone vs the Algorithm, sling, 6 stones.** Two shots, one hit for 10, one
wide; then eight rounds of "tanking the prediction" — Simone deliberately takes hits soft,
"working the trick, not the damage race". Reads sensibly: a slinger who knows the monster's
trick and plays for it, not the damage race. Her 6 stones trace to departure pile stones
(this seed made 8 pile-stone batches / 32 units).

Both transcripts read like real fights with real supply stories — the ledger's numbers
match what the fighters actually do. (One narration quirk, noted not judged: the log names
the monster "Big-Eyes"/"Ugly-Eyes" while the encounter row's monster id is `algorithm` —
the display name and the id disagree. Pre-existing narration, outside this arm.)

## §7 The 110407 RNG-divergence caveat — checked

The ammosupply §9 caveat (one seed diverging on craft-attempt RNG draws) does not recur
here, and could not in the same way: this is a single-leg DIAG, so there is no inter-leg
divergence to claim a lever effect from. The determinism check (§10) re-ran seed 110501
with identical environment and produced a byte-identical corpus file — the instrument draws
no RNG and adds no divergence of its own.

## §8 Wall numbers (background, not verdict bars)

| Measure | This band (110501–110508) |
|---|---|
| National standing reached | **0/8** |
| Full-seat wins | **0/8** |
| Wave 4 unlocked | 8/8 |
| Wave 5 unlocked | 5/8 |
| Median survival | 147 days |
| Villages lost | 4/8 |
| Starvation deaths | 4 of 944 |

Death causes (944 total): expedition 401, villager combat 329, combat 109, monster 27,
the wild 37, ambush 5, contest 5, starvation 4, arena 4, thirst 2, alien 2, wound 7.
Monster-related deaths ≈ 92% of all deaths. The wall did not move: no national, no wins.

### Per-seed table

| Seed | Days | End | Wave | Standing | v4 enc | Lead ammo rate | Home-duty batches |
|---|---|---|---|---|---|---|---|
| 110501 | 150 | survived | 5 | 440 | 26 | 1/17 = 0.059 | 0 |
| 110502 | 140 | village-lost | 5 | 450 | 12 | 9/10 = 0.900 | 20 |
| 110503 | 150 | survived | 5 | 565 | 34 | 21/29 = 0.724 | 40 |
| 110504 | 144 | village-lost | 4 | 199 | 10 | 2/9 = 0.222 | 15 |
| 110505 | 117 | village-lost | 4 | 199 | 8 | 5/5 = 1.000 | 13 |
| 110506 | 150 | survived | 5 | 705 | 59 | 6/11 = 0.545 | 7 |
| 110507 | 127 | village-lost | 5 | 490 | 54 | 12/25 = 0.480 | 12 |
| 110508 | 150 | survived | 4 | 199 | 19 | 6/18 = 0.333 | 16 |

Seed spread is the story: 110502/110503/110505 are well supplied (0.72–1.00 lead rate);
110501 is an ammo desert (0.06); the rest sit at 0.22–0.55. Home-duty output tracks the
rate loosely (40 batches → 0.72; 0 batches → 0.06), but 110506 made only 7 batches and
still hit 0.545 — small villages with few bow carriers need little. The variance is
between villages, not between meeting origins.

## §9 Determinism check (prereg §2, not a verdict bar)

Re-ran seed 110501 with identical environment into
`evidence/2026-11-24/perseed-aidammo-a-rerun/` (command in §11). Ledger hash:
`be2ba5173e7170049ab00012bd880893d6dd8b82e5aa5a4245ec9bdd41de9d63` — **identical to the
pilot**, and the whole per-seed file is byte-identical (JSON equality). The instrument adds
no RNG draws; the 2-event ledger on 110501 is a real village property, not an instrument
artifact.

## §10 Metric review

- **Primary metric** (ammo-at-entry by origin, lead + allies): 0.577, re-measured against the
  frozen 0.70 bar. The DIAG does not pass/fail on it; it reports it. The lead-only
  comparable figure is 0.500, confirming the ammosupply band's 0.447 rather than overturning
  it.
- **Pool floor:** 21 pair-inclusive engaged meetings ≥ 10 ✅ (not a thin pool; the NO-GO
  thin-pool outcome did not recur).
- **Attribution completeness:** 1.000 ≥ 0.90 ✅ — the strongest instrument result in the arm.
  Zero unknown units, zero unattributed spends.
- **Dominant source:** home-duty 0.849 ≥ 0.50 ✅. The no-source-delivers alternative was not
  proven (1,226 non-starting-kit units at entry, far above the <10 floor) — and correctly so:
  a source does deliver; it just does not deliver to most fighters.
- **What this DIAG does not do:** it does not close finding #2544 (the ammo-at-entry bar
  itself is still missed) and it does not land a fix. It names where the next lever must
  live: the home-duty craft gate — who gets to craft, when, and with what materials — not
  departure, not loot, not aid. Finding #2602 (departure craft vestigial) is confirmed and
  extended: departure craft made 25 batches vs home duty's 123, and the departure stash
  path never fired once.
- **§15 panel:** not applicable (single-leg DIAG, no before/after) — stated in prereg §4.

## §11 Proof (how to reproduce)

- Analyzer selftest: `node scripts/analyze-aidammo-a.js --selftest` → **29/29 PASS**.
- Proof test on a live loaded village (seed 7, sim-harness):
  `node scripts/test-aidammo-a.js` → **38/38 PASS** (FIFO order/overspend/transfer-preserves-source,
  seed + daily-`other` catch, live home-duty craft, live departure stash/craft/stones, live
  volley spend consuming FIFO, kill-loot ground — no arrow/bolt/stone in any killItems tier,
  fusion_cell alien-origin lootTier 4; spear has no ammo id).
- Pilot: `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1 SPEARGATE=1
  BOWOPEN=1 MODE=diag OUTDIR=perseed-aidammo-a SEEDS=110501,...,110508 RUN=aidammo-a
  node scripts/aidammo-driver-a.js` → exit 0, 8/8 valid corpus files, 0 instrument errors.
- Analyzer: `node scripts/analyze-aidammo-a.js --dir evidence/2026-11-24/perseed-aidammo-a
  --out evidence/2026-11-24/aidammo-a-analysis.json` → DIAG-GO DOMINANT-SOURCE.
- Determinism re-run: same env, `OUTDIR=perseed-aidammo-a-rerun SEEDS=110501` → identical
  ledger hash (see §9).
- One analyzer wording fix landed after the pilot (the no-source-delivers detail string
  read "1226 (< 10)" as if 1,226 were below 10; the flag was always correct — "not proven"
  — but the parenthetical was misleading). Re-ran selftest (29/29) and the analyzer after
  the fix; verdict unchanged.

## §12 Canon

No canon doc covers ammunition supply specifically (CANON.md, MONSTER-WAVES.md,
BALANCING.md read; recorded in the prereg, not invented). Arrow-crafting is a human skill,
never an alien ability — the home-duty craft this arm measures is on the right side of
that line. Nothing in this DIAG changes canon.

## §13 Next arm (named, not built)

The next lever lives in the **home-duty craft gate**. The ledger proves home-duty is the
supplier (0.849 share) and proves delivery works (75% of batches reach a fight) — so the
lever is not "make more at departure" or "hand out ammo on aid". The open questions the
next instrument must answer, before any lever is designed:

1. **Materials:** does the pile hold stick/stone/fiber when a bow-carrier is home short of
   ammo? Seed 110501 suggests the gate almost never opens at all — the next instrument
   snapshots pile materials + at-home bow carriers daily.
2. **Coverage:** can the duty serve fighters who are away (carry-and-deliver), or must a
   fighter be home to be armed? 131 of 149 empty fighters never got a batch — the duty as
   built only arms people who happen to be home.
3. **Spear carriers (12% of ranged-at-entry)** need no ammo and are already counted
   correctly; any lever's headline rate should keep reporting capable-only (0.657) alongside
   the all-ranged figure (0.577) so spears never flatter the bar.

## §14 Infrastructure notes

- Write-flap: probes (`git update-ref refs/heads/probe HEAD`) passed before the prereg
  write, before both instrument commits, and before this evidence commit. No flap window
  hit this run. Machine uptime was 46 min at prereg time (restart ~21:33 UTC, inside the
  flap's known post-restart shape) — the run completed without a write refusal.
- Safe-commit clobber struck on the prereg and instrument commits (committed files showed
  as staged-deleted + untracked in the main index); repaired each time with
  `git ls-tree HEAD -r -- <paths> | git update-index --add --index-info` and verified
  `git status --short` empty + `git diff HEAD` empty. Expect it on the evidence commit too.
- No jest run on this arm. No game code touched (DIAG arm — instruments + evidence only).
