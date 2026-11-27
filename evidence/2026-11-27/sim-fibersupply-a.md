# sim-fibersupply-a — fiber-supply diagnosis (craftgate-a §13 arm #1)

- **Arm:** sim-fibersupply-a, Loop A run fleshout-20261127T2033Z
- **Verdict: DIAG-GO** (all five frozen bars pass — see §1)
- **Legs:** single leg (MODE=ctl), 8 seeds 111701–111708, 150d death-aware horizon, competent verbatim policy, substrate `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1 SPEARGATE=1 BOWOPEN=1` on base 3df52548c
- **Prereg:** `evidence/2026-11-27/sim-fibersupply-a-prereg.md` (commit 166234bde; frozen before any judged sim)
- **Instrument:** `scripts/fibersupply-driver-a.js` + `scripts/analyze-fibersupply-a.js` + `scripts/test-fibersupply-a.js` (commit 8ae0d2ea6; reuses the Nov 21 instrument with the home-craft wrap added — see §11); proof test 53/53 GREEN on 3 seeds (31031, 7, 42); analyzer selftest 17/17
- **Corpora:** `evidence/2026-11-27/perseed-fibersupply-a/` (8 files) + `perseed-fibersupply-a-rerun/` (seed 111701); analysis `evidence/2026-11-27/fibersupply-a-analysis.json`
- **Determinism:** fiber hash `0b492597017163639d86aa119d74ce4d908899c141d0bd3795352bd9ad90d929` — **identical** on the seed 111701 rerun
- **No canon doc covers fiber supply, foraging yields, or the village pile specifically** (prereg §7); nothing here invents canon.

## §0 The answer in plain words

Fiber comes from exactly one place: a villager gathering fallen
branches. Every piece of fiber in the pile on this band arrived as
the 50% side-effect of a deadfall haul — 308 pieces in, 606 hauls,
no other recurring source fired once. What takes it out is villagers
sitting at home making arrows for themselves: the home craft took
104 fiber, against 8 at departures and 11 stolen. And the pile sits
low not because the village as a whole is short — the band took in
two and a half times what it spent — but because the two kinds of
village live side by side. In four villages one person gathers
deadfall constantly and the pile ends the run holding 21–69 fiber.
In the other four almost nobody gathers at all: one village made 9
deadfall hauls in 151 days, its pile held zero fiber on every single
day, and a bow-carrier named Sam Wilson walked out 8 times to find
nothing to make arrows with — while the pile held 234 stone. The
shortage is a habit that never forms, not a tap that runs dry. And
no villager ever notices: the game itself teaches them that "strong
fibers are everywhere", and still nobody goes looking for fiber as
such — it only ever arrives as a by-product of fetching sticks.

## §1 Verdict — judged only against the frozen prereg §2 bars

| Bar (prereg §2) | Result | Pass |
|---|---|---|
| (0) Instrument validity: proof test green + 0 instrument errors on all 9 per-seed files | proof 53/53 ×3 seeds; **0 errors** on 8 pilot + 1 rerun | ✅ |
| (1) Supply gap quantified: named source + rate AND named sink + rate AND pile-zero ≥ 0.25 | source **assign/deadfall 0.342/day**; sink **homeCraft 0.115/day**; pile-zero **0.275** (248/901 days) | ✅ |
| (2) Fiber-need events ≥ 5 (no-mats departures with pile fiber 0) | **8** | ✅ |
| (3) Personal-vs-pile separation measured (census every seed, scholar mean stated) | census present 8/8; scholar mean **0.00**, max **0**; villagers max **0** | ✅ |
| (4) Home sink directly attributed (homeCraft out ≥ 1) AND ledger closes (sum \|residual\| ≤ 5) | homeCraft out **104** in 116 rows (137 attempts, 91 batches); sum \|residual\| **1** | ✅ |
| **Verdict** | **DIAG-GO** | ✅ |

Two honest thinnesses, recorded not hidden: bar (1) passes at 0.275
against a 0.25 bar — the margin lives entirely in the desert seeds
(§4); bar (2) passes at 8, and **all 8 need events come from one
seed (111707)**. The bars judge as frozen; §10 says what the next
prereg should restate.

## §2 The quantified ledger (band, 901 village-days)

| Flow | Fiber | Rate / village-day |
| --- | --- | --- |
| IN — deadfall duty (only recurring source) | 308 | 0.342 |
| OUT — home arrow-craft (`villagerAmmoCraftDay`) | 104 | 0.115 |
| OUT — departure arrow-craft (`villagerPocketAmmo`) | 8 | 0.009 |
| OUT — closed-village skim (theft) | 11 | 0.012 |
| Net (in − out) | +185 | — |
| Final pile fiber, summed over 8 seeds | 186 | — |

The ledger closes: 308 in − 123 out = 185, against a summed final
pile of 186 (residual 1, on seed 111703 — census-timing jitter, see
§2a). The home sink is now **directly attributed, not inferred**:
the new `homeCraft` wrap recorded 116 rows (137 attempts, 91
batches), and the stash ledger cross-checks exactly — 104
`take|fiber` lines, one per pile-funded home craft. The 7
`take|Plant fiber` lines are the skim (11 fiber over 7 thefts).
No other source fired: no betrayal +4 (residual 1 rules it out on
this band), no scholar deposit (the competent policy never deposits;
scholar personal fiber is 0 on every census day — §5), no forage /
expedition / loot yield gives fiber.

- Deadfall: 606 hauls, 308 fiber (**0.51/haul** — the 50% coin, as
  coded), 1,230 sticks (2.03/haul). No other recurring source exists
  (prereg §1a census, re-confirmed by the proof test's static
  checks on this base).
- Home craft: 137 attempts, 91 batches (**66%** — the blind/learned
  mix; craftgate's band measured 59%). The duty ran on every
  village-day it could (home calls = days on 5/8 seeds; the other
  three miss exactly one day each, the village-lost day).
- Departure craft: 12 attempts in the pocketAmmo ledger (8 arrow,
  1 fiber each spent before the roll; 4 bolt, 0 fiber), 4 ok / 8
  fail among the ammoRows craft rows. The departure craft reads
  ONLY the pile, never the carrier's pack (prereg §1b).
- Departures overall: 155. No-ranged 67, no-ammo-id (spears) 26,
  already-capped 23, stock-draw 17, craft-fail 8, craft-ok 4,
  no-mats 9, no-recipe 1. **Served departures: 0** — nobody was
  served a bow at a departure on this band (Nov 21: 1).

### §2a Day-level reconciliation

Per-seed residuals are 0 on seven seeds and 1 on 111703 (sum
|residual| 1). The day-level unexplained-day counts (198 days
band-wide, max |day residual| ≤ 4) are census-timing jitter: the
census is an end-of-day snapshot while events land during the day,
so a haul after the snapshot reads as a jump the next day. The
totals close to 1 fiber on 308 in, so there is no unattributed
drain and no wrap-blind move left on this band — the home-craft
wrap closed the Nov 21 gap it was built to close.

## §3 Per-seed table

| Seed | Days | End | Pile-zero days | Fiber in | Fiber out | Final pile | Need events† | Departures | Hauls | Top hauler (share) |
|---|---|---|---|---|---|---|---|---|---|---|
| 111701 | 105 | village-lost | 1/101 | 73 | 15 | 58 | 0 | 3 | 137 | greta_hansen (64/73 = 88%) |
| 111702 | 109 | village-lost | 30/106 | 8 | 8 | 0 | 0 | 25 | 16 | gen_w64v72v (2/8 = 25%) |
| 111703 | 127 | village-lost | 1/125 | 75 | 39 | 37 | 0 | 17 | 159 | gen_m3d447r (72/75 = 96%) |
| 111704 | 59 | village-lost | 1/57 | 74 | 5 | 69 | 0 | 18 | 146 | gen_iitkl83 (71/74 = 96%) |
| 111705 | 120 | village-lost | 1/118 | 14 | 13 | 1 | 0 | 37 | 31 | gen_8hfjuh1 (6/14 = 43%) |
| 111706 | 150 | survived | 2/147 | 49 | 28 | 21 | 0 | 12 | 90 | gen_v02jl3v (45/49 = 92%) |
| 111707 | 151 | survived | 148/148 | 3 | 3 | 0 | 8 | 23 | 9 | gen_vuxy7qk (2/3 = 67%) |
| 111708 | 101 | village-lost | 64/99 | 12 | 12 | 0 | 0 | 20 | 18 | james_okonkwo (5/12 = 42%) |
| **Band** | — | 2 survived / 6 lost | **248/901 = 0.275** | **308** | **123** | **186** | **8** | **155** | **606** | **top hauler 267/308 = 87%** |

† Need events = departures hitting `no-mats` with pile fiber 0 at
the attempt. All 8 are on 111707; none involved a served bow
(served departures on the band: 0).

Pile means (census-weighted, 901 days): **fiber 19.0, stick 86.2,
stone 264.2** — against craftgate's 9.4 / 46.4 / 250.7. The mean
hides the split: the four rich villages hold pile fiber 21–69 at
run end (means 29–49), the four starved ones hold 0–1 (means
0–3.7). Pile-recipe availability: arrow recipe 637/901 days
(**70.7%**, craftgate 65%), bolt recipe 871/901 (**96.7%**,
craftgate 97%). The one material the arrow recipe needs that the
bolt recipe does not is still the one the pile does not hold — on
the days that matter, in the villages that matter.

## §4 The three mechanisms (refined from Nov 21)

**1. The tap is one villager's habit — and the habit sometimes
never forms.** Deadfall hauls per village-day range 0.06–1.25 by
seed, and one villager does 87% of all hauling band-wide (267/308).
In 111703 one villager hauled 159 times; in 111707 the whole village
hauled 9 times in 151 days. The difference between a rich village
and a desert village is not the tap's rate — it is whether anyone
takes the job up at all. The Nov 21 stick-throttle hypothesis is
NOT supported again: the village with the most hauls (111703, 159)
holds pile sticks ≥ 6 on 122 of 125 days, and sticks sit ≥ 6 on
750/901 days band-wide (83%) while hauls continue. (The census's
`deadfallStaffed` snapshot — assignments read at end of day —
remains unreliable as a staffing measure and is not used as
evidence here; the haul counts and the who-table are.)
**2. The home craft eats first — now attributed row by row.** The
home arrow-craft took 104 fiber — 85% of all outflow, 13× the
departure craft's 8. It spends the trickle as it arrives, so no
buffer builds for departures *within* a village. But this band
refines the Nov 21 story: in the rich villages the home craft does
NOT starve the pile — inflow outruns it and fiber accumulates to
37–69. The home craft is the dominant sink, but it is not the
reason the desert villages are empty. The reason they are empty is
mechanism 1: nothing arrives.
**3. The departure craft is pile-only and last in line.** It reads
only the communal pile, never the carrier's pack, and runs after
the home craft has had the day's fiber. With the pile empty at the
attempt, it fails before the roll (`no-mats`), so no arrows are
made and none are burned — the fighter simply leaves empty-handed.
Seed 111707 is the pure case (§4a). The one no-mats on 111708 is
the contrast: pile stone 0, fiber 1 — a stone-short departure, not
a fiber one — the only non-fiber no-mats on the band.

### §4a Seed 111707 — the desert of this band

Seed 111707 survived 150 days at regional standing 199 — and its
pile held **zero fiber on all 148 census days**. Its whole fiber
history is three deadfall hauls (d2 Elena, d4–d5 Shannon), each
spent at home within days, and then nothing for 146 days. A
bow-carrier named Sam Wilson departed on d7, d24, d28 (and five
more times) to find the pile holding 6 sticks and 17, then 178,
then 234 stone — and 0 fiber every time. Arrow recipe available
0/148 days; bolt 146/148. Twenty-three of 23 departures saw pile
fiber 0. This is the craftgate gate in one village: the pile holds
everything the arrow recipe needs except the one material that
only ever arrives as a by-product of fetching sticks, and nobody
fetched sticks.

## §5 Personal vs pile

- Scholar personal fiber: mean **0.00**, max **0**, across all 901
  census days. The scholar NEVER held fiber on this band (Nov 21:
  mean 0.03, max 1) — the competent policy never works the
  scholar's fiber sources at all (clearBrush, tree deadfall,
  carexplore), and the scholar crafted 0 fiber recipes
  (`fiberCrafts` empty on all 8 seeds).
- Villagers' personal fiber: **0 at every census moment**
  (end-of-day scan of each villager's carried items; max 0 on all
  seeds). Nobody holds fiber overnight. The home and departure
  crafts read carried items first — the zero census means there is
  effectively nothing to draw on.
- The two fiber economies never meet: the scholar's personal fiber
  never reaches the pile (no deposit under the competent policy),
  and pile fiber never reaches a personal pack except through the
  skim (7 thefts) — which steals it into nowhere, not into a usable
  pack.

## §6 Sense-testing — transcripts read in full

**Seed 111707's entire fiber life (4 say-lines, 151 days).** The
village's fiber story fits in four lines: three deadfall narrations
("🍂 Elena gathers deadfall — 1 stick + 1 fiber. The pile grows.
(2 sticks now.)", then Shannon twice) and one unseen theft ("The
stash count is off. 1 plant fiber missing. Nobody saw anything.
Everybody suspects something."). After d5, silence — 146 days in
which no villager gathers, mentions, seeks, or notices fiber, while
Sam Wilson's bow goes out empty 8 times. The shortage is invisible
to the villagers themselves; nothing in the village ever treats
fiber as a need.

**Seed 111707 d69 — Min vs the Suburb (world-tick), no ranged
weapon.** Four rounds, help arrives twice (Nora, Gino), Min flees
at 41 HP with the monster at 1204/1300. A second fight the same day
ends in one round. James vs the Suburb on d75 reads the monster
right: "James reads the sterile streets — you can't kill a suburb.
They walk out. (Navigation is victory.)" These read sensibly: a
village fighting wave-4 monsters with melee and wits, no bows in
the picture at all — the fiber shortage is upstream of the fight,
in the pile, not in the fight log.

**The Cordage irony (3 seeds).** On 111702 (d63), 111705 (d57),
and 111706 (d89) the game teaches a villager: "📖 LEARNED:
Cordage (Level 1). Twist plant fibers into string. Dogbane,
nettle, yucca — **strong fibers are everywhere**." The knowledge
exists, in the villagers' own words — and still nobody gathers
fiber as such, on any seed. Fiber is narrated only as a by-product
of gathering sticks, once as a theft, and in plant-knowledge
entries ("fiber: tough stalk fiber for rough cordage", "fiber:
leaves weave into mats and cordage"). That is the sense-test
verdict, same as Nov 21 and sharper: the village knows fiber is
everywhere and still never goes looking for it.

## §7 Wall numbers (background, not verdict bars)

| Measure | This band (111701–111708) |
|---|---|
| National standing reached | **0/8** |
| Full-seat wins | **0/8** |
| Wave 4 unlocked | 8/8 |
| Wave 5 unlocked | **0/8** |
| Median survival | 114.5 days |
| Villages lost | 6/8 |
| Starvation deaths | 3 of 558 |

Death causes (558 total): villager combat 239, expedition 118,
combat 84, the wild 36, monster 32, thirst 9, wound 8, arena 7,
sickness 6, contest 4, ambush 3, starvation 3, named beasts 4
(The Ugly Beast, The Big Beast, Old Croaker, Buffering), alien 2,
a stranger 2, dehydration 1. The wall did not move: no national,
no wins — and on this band not even a wave-5 unlock (Nov 21: 3/8;
craftgate: 2/8). Six of eight villages were lost by day 127.

## §8 Determinism

Rerun of seed 111701 with identical env
(RUN=fibersupply-a-rerun, OUTDIR=perseed-fibersupply-a-rerun):
fiber hash `0b492597017163639d86aa119d74ce4d908899c141d0bd3795352bd9ad90d929`
— **identical to the pilot**. The per-seed summary line is also
identical field for field (105 days, village-lost, wave 4,
standing 199, 59 deaths, 92 fiberEvents, 76 fiberSays). The
instrument draws no RNG and adds no divergence of its own. (The
analyzer's `--rerun` fiber hash covers the judged fields —
fiberCensus, fiberEvents, fiberCrafts, fiberSays, fiberStashLog,
ammoRows, depmatRows, deaths, days, endReason, won, scaleRank,
maxWave, standing — masking the mode/leg/run/anchorCommit labels;
the vetfirst `daily` telemetry is excluded by design, since it
carries process-scoped sequence numbers — a clarification of the
prereg's field list, recorded here rather than silently applied.)

## §9 Blanks — what this diag did not measure

- Own-funded home arrow crafts (a villager spending fiber they
  carry, without touching the pile): unmeasured. The census shows
  villagers hold no fiber at day's end, so the remainder above the
  104 pile-funded takes is small, but the instrument cannot count
  it. (Same blank as Nov 21.)
- WHY one villager takes up deadfall and another does not
  (dawn-bid choice vs policy staffing): outside this instrument.
  The who-table is measured; the chooser is not. This is now the
  binding question for the fiber line — see §13.
- Intraday order (home craft before departures): inferred from the
  daily structure and the 104-vs-8 ratio, not directly timestamped;
  the instrument records day, not hour.
- Why seed 111707's village never staffs deadfall while its
  neighbours do — same blank as above, at village level.
- Table metrics are null in the panels (not instrumented by this
  driver — left null, never faked), as in the Nov 21 and craftgate
  arms.

## §10 Metric review

- **Primary metric** (supply gap quantified): all five bars pass —
  DIAG-GO as frozen. The instrument is valid (0 errors, ledger
  closes to 1 fiber on 308 in), the dominant source (deadfall,
  0.342/day) and sink (home craft, 0.115/day) are named with
  rates, and the pile-zero share (0.275) clears the corrected
  0.25 bar.
- **Bar (1) margin:** 0.275 vs 0.25 is thin, and the share is
  bimodal — the four desert seeds contribute 243 of the 248
  zero-days; the four rich seeds contribute 5. The bar's
  population (all village-days) still mixes the two regimes, as
  the Nov 21 review warned. The operational populations tell the
  sharper story and are reported alongside: pile-zero at
  departures 33/155 (21.3%), need events 8 (all on 111707), arrow
  recipe 70.7% of days. A future prereg should consider stating
  the bar on departure rows or on bow-holding village-days — this
  run's bar is judged as frozen, not re-scored.
- **Bar (2) concentration:** all 8 need events come from one
  seed. The bar passes, but the need is thinner on this band than
  on Nov 21's (65 across seeds). The desert-seed concentration is
  itself the finding (§4a), not an instrument artifact — the
  departures and their pile snapshots are recorded row by row.
- **Bar (4) close:** the home sink is now directly attributed
  (116 rows, 104 fiber) and the stash-ledger cross-check matches
  exactly (104 `take|fiber` lines). The Nov 21 wrap-blind gap is
  closed; the residual (1) is census-timing jitter, not a leak.
- **Bar (3) starker than Nov 21:** scholar personal fiber is
  exactly 0 on every census day (Nov 21: mean 0.03, max 1). The
  stranded-economy premise is stronger on this band, not weaker.
- **§15 panel:** not applicable (single-leg DIAG, no before/after)
  — stated in prereg §4.
- **Mechanism re-measure (report-only):** the craftgate gate
  numbers move slightly on this band (arrow recipe 70.7% vs 65%;
  bolt 96.7% vs 97%) — the pile is a little better supplied here,
  because the rich villages accumulate. The binding story is
  unchanged: fiber is the material the pile does not hold on the
  days that matter, in the villages that matter.

## §11 Proof (how to reproduce)

- Analyzer selftest: `node scripts/analyze-fibersupply-a.js --selftest` → **17/17 PASS** (judge shapes incl. pile-zero 0.247/0.253 boundary, homeCraft 0, residual 6, fiber-hash identical/differing/label-masked).
- Proof test on live loaded villages (seeds 31031, 7, 42): `node scripts/test-fibersupply-a.js` → **53/53 PASS** each (deadfall attribution, pocketAmmo −1, census separation, scholar craft personal-only, stashLog/say capture, craft-day wraps zero-fiber, **M8 homeCraft wrap**: duty call spending pile fiber records a homeCraft row with dFiber −1, attempts ≥ 1, batches 1, pile before/after).
- Pilot: `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 MODE=ctl EVIDENCE_DATE=2026-11-27 OUTDIR=perseed-fibersupply-a SEEDS=111701,...,111708 RUN=fibersupply-a node scripts/fibersupply-driver-a.js` → exit 0, 8/8 valid corpus files, 0 instrument errors on every seed.
- Analyzer: `node scripts/analyze-fibersupply-a.js --seeds 111701,...,111708 --ctl evidence/2026-11-27/perseed-fibersupply-a --rerun evidence/2026-11-27/perseed-fibersupply-a-rerun --seed 111701 --out evidence/2026-11-27/fibersupply-a-analysis.json` → DIAG-GO.
- Determinism re-run: same env, `OUTDIR=perseed-fibersupply-a-rerun RUN=fibersupply-a-rerun SEEDS=111701` → fiber hash `0b492597017163639d86aa119d74ce4d908899c141d0bd3795352bd9ad90d929` — **identical to the pilot**.

## §12 Canon

No canon doc covers fiber supply, foraging yields, or the village
pile specifically (CANON.md read; recorded in the prereg, not
invented). PRESERVATION.md covers the food ladder, not materials.
Fiber is a foraged material with no preservation ladder and no
village-side production. Arrow-crafting is a human skill, never an
alien ability — the home-duty craft this arm measures is on the
right side of that line. Nothing in this DIAG changes canon. One
canon-adjacent observation for a future call (not a ruling): the
game teaches villagers that "strong fibers are everywhere"
(Cordage, Level 1) while no villager ever seeks fiber — if a lever
lands on fiber supply, whether fiber should be gatherable on
purpose, farmable, or fetchable at the trailhead is a design call,
not a measurement.

## §13 Next arm (named, not built)

Two levers, in order, both named from the rows:

1. **Trailhead fiber fetch at the departure arrow-craft attempt**
   (re-named from Nov 21, premise now measured twice). The failure
   is at the departure — 8 no-mats events with pile fiber 0, all on
   one seed — and the departure craft reads only the pile while the
   home craft drains the same-day trickle first. When a bow-holder
   departs and the pile is short of the arrow recipe's fiber, the
   departing villager gathers 1 fiber at the trailhead (or from the
   departure site) before the craft attempt, so the craft can
   proceed. It closes the exact measured gap without re-throttling
   the deadfall duty and without taxing the home craft (legitimate
   use).
2. **The deadfall habit (diagnostic).** This band's binding
   difference between villages is whether anyone takes up deadfall
   at all (9 hauls in 151 days vs 159). The next diagnostic should
   open the dawn-bid / policy-staffing choice that assigns deadfall
   and ask why it never fires in a desert village — the chooser,
   not the who-table. Until that is measured, any deadfall
   re-throttle is tuning blind.

## §14 Infrastructure notes

- Write-flap: probes (`git update-ref refs/heads/probe HEAD`)
  passed before the prereg write, before the instrument commit,
  and before the pilot. Machine uptime was ~2h at prereg time
  (restart ~19:06 UTC — inside the flap's known post-restart
  shape). No flap window hit this run.
- Safe-commit clobber struck on the prereg commit (file showed
  staged-deleted + untracked) and on the instrument commit (all
  three files MM); repaired each time with
  `git ls-tree -r HEAD -- <paths> | git update-index --add --index-info`
  and verified `git status --short` empty + `git diff HEAD` empty +
  blob hashes match HEAD. Expect it on the evidence commit too.
- No jest run on this arm (no game code touched; DIAG arm —
  instruments + evidence only). No game code touched.
- The coordinator's claim file for this arm
  (`lever-claims/fleshout-20261127T2033Z.json`) is the
  coordinator's to delete at closeout; this arm wrote no claim
  file itself (task brief carried the arm assignment).
- Findings outside this arm: none appended to sim-findings.md —
  the slinger/searcaster supply gap and the thrown-spear opening
  are already recorded (craftgate §13/§14); no new out-of-arm
  finding surfaced on this band.
