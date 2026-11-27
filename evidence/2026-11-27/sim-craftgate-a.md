# sim-craftgate-a — home-duty craft-gate DIAGNOSTIC

**Verdict: DIAG-NO-GO (UNASSIGNED) — the decomposition works, but the
frozen bar assumed every empty fighter could be a gate candidate, and
three of the eight never-supplied fighters carry weapons the gate
cannot serve at all.**
**Arm:** sim-craftgate-a · **Loop A run:** fleshout-20261127T1915Z · **Axis:** scale-onramp
**Prereg:** `evidence/2026-11-27/sim-craftgate-a-prereg.md` (frozen 2026-11-27 ~14:00 UTC, before any judged sim)
**Analysis:** `evidence/2026-11-27/craftgate-a-analysis.json` · **Corpus:** `evidence/2026-11-27/perseed-craftgate-a/` (8 seeds)
**Determinism re-run:** `evidence/2026-11-27/perseed-craftgate-a-rerun/` (seed 110801)
**Branch:** `sim-craftgate-a` · **Base:** `1d266ccf9` (the sim-launchfit-b evidence-only landing)
**Instruments:** `scripts/craftgate-driver-a.js`, `scripts/craftgate-instrument-a.js`, `scripts/analyze-craftgate-a.js`, `scripts/test-craftgate-a.js`
**Substrate:** `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1 SPEARGATE=1 BOWOPEN=1`, competent-player policy verbatim, 150d death-aware horizon, seeds **110801–110808** (verified fresh band).

## §0 The question, in plain words

Home-duty craft makes 85 of every 100 arrows a fighter holds at a
wave-4 meeting — but most ranged fighters never get a batch: on the
last band, 131 of 149 empty-quivered fighters had never once been
handed ammunition. This arm opened the gate that decides whether a
bow-carrier at home gets arrows — at home + short of ammo + materials
in hand — and watched it day by day, carrier by carrier.

**Short answer:** the gate is almost never open, and when it is shut
the reason is nearly always the same one: **fiber**. On this band, 8
fighters entered wave-4+ meetings empty having never received a batch
in their life. Five of them carry bows — and their 136 needing-days
split 96 to "the pile has no fiber" and 40 to "the carrier was away
from home". Not one of their needing-days ever saw an open gate: zero
cooldown days, zero attempt-eligible days, zero failed attempts. The
other three cannot be decomposed at all, because the gate was never
built for them: two carry slings and one carries a searcaster, and the
home-duty craft only makes arrows and bolts. Stones come only from the
departure pile and fusion cells only from rare loot — a slinger or a
searcaster has no at-home supply path in the game as built. The frozen
verdict bar (every never-supplied fighter gets a primary cause) fails
on those three — which is why this arm reports DIAG-NO-GO even though
the instrument answered the question it was asked.

## §1 Verdict — judged only against the frozen prereg §2 bars

| Bar (prereg §2) | Result | Pass |
|---|---|---|
| Pool floor: distinct empty-quivered fighters ≥ 10 | **18** (77 empty rows) | ✅ |
| Attribution completeness ≥ 0.90 | **1.000** (1,091/1,091 units; unknown 0) | ✅ |
| Gate coverage ≥ 0.90 | **0.978** (136 observed + 3 unobserved short-days) | ✅ |
| Decomposition complete: unassigned = 0 | **3 unassigned** (ruth_goldstein, giulia_bianchi, elif_demir) | ❌ |
| Mechanism re-measure: ammo-at-entry vs 0.70 (report-only) | **0.607** (219/361) | report |
| **Verdict** | **DIAG-NO-GO, UNASSIGNED** | ❌ |

The miss is on the decomposition bar only, and §3 explains why it is a
finding about the game rather than a failure of the instrument: the
three unassigned fighters carry a sling (×2) or a searcaster (×1).
The duty's code skips both — `ammoId` must be `arrow` or `bolt` — so
they never appear in a gate row in 150 days, and no primary cause
exists for them under the frozen taxonomy. The bar as frozen assumed
the never-supplied pool sits inside the gate's population. It does not.
See §10 for the proposed bar revision (scope the bar to craftable
weapons; report slinger/searcaster empties as their own finding).

## §2 The pool — 18 empty fighters, 8 never supplied

| Measure | This band |
|---|---|
| Distinct empty-quivered fighters at wave-4+ entry | **18** (77 empty rows) |
| Never supplied (zero matching-ammo production events, any source) | **8** |
| Never supplied, excluding starting-kit | **8** (identical — no starting-kit batch reached any of them) |
| Supplied before, spent it | 10 |
| Repeat empties (empty at > 1 meeting) | 15 of 18 |

Spears are excluded throughout (65 spear rows at entry carry no ammo
id and are never empty quivers — the capable-only rate is 0.740, §7).
The 77 capable-empty rows are concentrated: 15 of the 18 empty
fighters met a wave-4+ monster empty more than once (the aidammo band's
149 rows spread over ~143 fighters with only 6 repeats; this band's
emptiness sits in a small set of repeat fighters). Of the 8
never-supplied, 5 carry bows (§3) and 3 carry weapons the gate cannot
serve (§3a).

## §3 The decomposition — the five bows

| Fighter (seed\|vid) | Needing-days | No-materials (fiber) | Away | Primary cause |
|---|---|---|---|---|
| 110801 \| lena_ruiz | 28 | 17 | 11 | pile-materials-absent |
| 110802 \| luis_fernandez | 7 | 2 | 5 | carrier-absent |
| 110803 \| catalina_reyes | 16 | 12 | 4 | pile-materials-absent |
| 110803 \| gen_aybqefl | 59 | 45 | 14 | pile-materials-absent |
| 110804 \| brian_otieno | 26 | 20 | 6 | pile-materials-absent |
| **Total** | **136** | **96 (71%)** | **40 (29%)** | **4 fiber, 1 absent** |

No tie anywhere (every primary is a strict plurality). And the
striking column is the missing one: **zero cooldown days, zero
attempt-eligible days, zero failed attempts** across all 136
needing-days. A never-supplied bow-carrier on this band never once had
an open gate. Either they were away from home, or the pile was short
of fiber — and when they were home with the gate shut, it was always
fiber (96/96 no-materials days short on fiber; the shortfall is
fiber-only in every case).

- **gen_aybqefl (110803)** is the sharpest single case: 59 needing-days
  over the run — 45 of them fiber-blocked, 14 away — and one empty
  wave-4 meeting. A villager who needed arrows for two months of game
  time and never once had the gate open for them.
- **luis_fernandez (110802)** is the only carrier-absent primary: away
  5 of 7 needing-days. The exception that bounds the fiber story —
  away-ness is real, just smaller than fiber (29% of needing-days
  against 71%).

### §3a The three the gate cannot serve (unassigned)

| Fighter | Weapon | Empty meetings | Gate rows |
|---|---|---|---|
| 110803 \| ruth_goldstein | sling (stone) | 5 | 0 |
| 110804 \| giulia_bianchi | searcaster (fusion_cell) | 2 | 0 |
| 110804 \| elif_demir | sling (stone) | 2 | 0 |

Zero gate rows in 150 days each, zero ledger events, zero attempts.
The duty only crafts `arrow`/`bolt`; a slinger's stones come only
from departure pile stones and a searcaster's cells only from rare
loot (kill loot supplied 0 ammo units on this band, same as aidammo).
There is no at-home supply path for either weapon in the game as
built. This is a design gap, not an instrument gap — the next arm
must either extend the duty or name departure/loot as the intended
path for these weapons (see §14).

## §4 Fiber is the binding constraint (band-wide)

The pool's fiber story is not a small-sample artifact — it holds
across every candidate on the band:

| Gate state, all candidates (3,601 rows) | Days | Share of needing-days |
|---|---|---|
| Away (carrier-absent) | 1,208 | 54% |
| No-materials | 721 | 32% |
| Attempt-eligible (gate open) | 186 | 8% |
| Cooldown | 114 | 5% |
| Stocked (not needing) | 1,372 | — |

- **Shortfall material on no-materials days: fiber 704/721 (98%)**,
  stick 37, stone 27. All 721 no-materials days are
  **bothShort** — the pile AND the carrier's own pack are short at
  once. Nobody in the village has fiber when the gate is shut; it is
  not a distribution problem.
- **The pile itself:** mean stick 46.4, stone 250.7, **fiber 9.4**.
  The pile holds a full arrow recipe (2 stick + 1 stone + 1 fiber)
  on 65% of days, but a full bolt recipe (2 stick + 1 stone, no
  fiber) on 97% of days. The one material the arrow recipe needs
  that the bolt recipe does not is the one the pile does not hold.
- **At-home carrier census (daily means):** 3.13 candidates per
  village-day, 1.45 at home, 1.37 short of ammo — but only 0.08
  materials-sufficient. On a typical day, a village has more than
  one bow-carrier home and short, and essentially none of them can
  craft.
- **"Home" means home:** 0 gate rows show a not-away carrier off the
  Haven tile, and 0 rows show a carried-but-unequipped bow
  (autoEquip gap 0). The aidammo hypothesis "carriers rarely home"
  is answered in its tile sense — when a carrier is not away, they
  ARE at Haven; the away-ness that matters is expedition absence
  (54% of needing-days), not wandering.

## §5 Seed 110804 — the desert of this band

Seed 110804 is this band's 110501: 150 days survived, wave 4 reached,
standing 199, regional — and **5 home-duty batches in 150 days**,
lead ammo rate **0/13** at wave-4+ entry. Its never-supplied fighter
(brian_otieno, 26 needing-days, 20 fiber-blocked) met 11 wave-4+
meetings empty. Seed 110805 is nearly as thin (3 batches, 0/2 — only
2 encounters). Against them, 110802 (15 batches, lead 25/39) and
110807 (26 batches, lead 20/39) are well supplied. The variance is
between villages, as on the aidammo band.

### Per-seed table

| Seed | Days | End | Wave | Standing | Home-duty batches | Lead ammo rate | Encounters |
|---|---|---|---|---|---|---|---|
| 110801 | 133 | village-lost | 4 | 199 | 16 | 2/9 = 0.222 | 17 |
| 110802 | 150 | survived | 5 | 550 | 15 | 25/39 = 0.641 | 63 |
| 110803 | 150 | survived | 4 | 199 | 20 | 5/12 = 0.417 | 14 |
| 110804 | 150 | survived | 4 | 199 | 5 | 0/13 = 0.000 | 14 |
| 110805 | 115 | village-lost | 4 | 100 | 3 | 0/2 = 0.000 | 2 |
| 110806 | 150 | survived | 4 | 199 | 13 | 0/0 | 0 |
| 110807 | 150 | survived | 5 | 440 | 26 | 20/39 = 0.513 | 44 |
| 110808 | 150 | survived | 4 | 199 | 7 | 1/1 = 1.000 | 9 |

## §6 Attempts, odds, and duty cadence

- **Attempts: 177, successes 105 (59%).** Blind (level 1): 30/88 =
  **34%** against the frozen 35%. Learned (level 2): 75/89 = **84%**
  against the frozen 85%. The craft odds in code are exactly what
  the game claims — the gate is not failing on rolls; it is failing
  to open.
- **Duty cadence:** 1,147 duty calls over 1,147 pile-census days, but
  only 1,107 days carried gate rows — the duty skipped a day on
  110803 (149 calls / 150 days) and doubled one on 110807 (151 /
  150). The 3 unobserved short-days on duty-missing days are the
  only coverage gap (0.978). No duplicate gate rows anywhere.
- **Intra-day contention (diagnostic, not a bar):** 186
  attempt-eligible rows but 177 attempt rows. The 9 unlinked rows
  are villagers whose pre-call snapshot showed fiber in the pile,
  but an earlier villager in the same duty call consumed the last
  fiber before the duty reached them. The snapshot is pre-call; the
  duty consumes as it goes. Those 9 days were effectively
  no-materials at decision time — the fiber shortage is, if
  anything, slightly understated.

## §7 The mechanism, re-measured (0.577 → 0.607)

| Measure | This band | Aidammo band (110501–110508) |
|---|---|---|
| Ammo-at-entry, lead + allies, all origins | **219/361 = 0.607** | 203/352 = 0.577 |
| Ammo-at-entry, lead only, all origins | 53/139 = 0.381 | 62/124 = 0.500 |
| Ammo-at-entry, capable-only (spears excluded) | 219/296 = 0.740 | 203/309 = 0.657 |
| Spear share at entry | 65/361 = 18.0% | 43/352 = 12.2% |

By origin (lead + allies): expedition 0.599, world-tick 0.647, aid
0.588 — no origin is near 0.70, same as aidammo. The capable-only
rate (0.740) is the highest yet measured, but it is flattered by the
denominator: this band's empty quivers concentrate in a few repeat
fighters (§2), and the lead-only rate (0.381) is the worst yet — the
person the fight is about is the least likely to be armed. The
headline 0.607 still misses 0.70, and the bar is still missed on the
lead figure by a wide margin.

### §7a The ledger, re-confirmed

| Source | Batches | Units | Share of units at entry |
|---|---|---|---|
| Home-duty craft | 105 | 525 | 778 (71.3%) |
| Departure craft | 21 | 105 | 237 (21.7%) |
| Departure pile stones | 23 | 94 | 76 (7.0%) |
| Starting kit | 2 | 2 | 0 |
| Kill loot | 0 | 0 | 0 |
| Other | 1 | 1 | 0 |

Attribution completeness **1.000**; delivery: 63/105 home-duty batches
reached a wave-4+ meeting (60%), 15/21 departure-craft, 18/23
pile-stones. Home-duty is still the supplier and delivery still works
— the binding problem is the gate opening, and the gate opens on
fiber.

## §8 Sense-testing — two meeting transcripts, read in full

**110801 d100 — Lena vs the Herald, bow, 0 arrows (world-tick).** The
fight opens with the game's own narration naming the failure: *"Lena
has Bow but no arrows — the string stays drawn, useless."* Ten rounds,
help arrives twice (June, Hannah), Lena flees. Lena Ruiz is the
never-supplied fighter with 28 needing-days in §3 — 17 of them
fiber-blocked — and the transcript is her gate history in one line.
The numbers and the narration agree exactly.

**110802 d46 — Joel vs The Reunion, crude bow, 5 arrows
(expedition).** All five arrows trace to a departure craft; the volley
fires 2/2 for 28 damage, then five rounds of melee with help arriving
(Nikos, Luigi), field medicine used, and still a villager flee. Reads
sensibly: an armed fighter who lands the opening volley and still
cannot finish a wave-4 monster. The supply story holds — Joel had
exactly the tail of a 5-arrow departure batch.

(One narration quirk, noted not judged: the Algorithm's attacks are
named "Your Move" / "Recommended For You" in the log while the
encounter row's monster id is `algorithm` — flavor naming, pre-existing,
outside this arm.)

## §9 Wall numbers (background, not verdict bars)

| Measure | This band (110801–110808) |
|---|---|
| National standing reached | **0/8** |
| Full-seat wins | **0/8** |
| Wave 4 unlocked | 8/8 |
| Wave 5 unlocked | 2/8 |
| Median survival | 150 days |
| Villages lost | 2/8 |
| Starvation deaths | 1 of 798 |

Death causes (798 total): monster 719 (90%), villager 78, person 1.
By cause: villager combat 305, expedition 305, combat 109, the wild
26, monster 17, arena 7, wound 6. The wall did not move: no national,
no wins.

## §10 Metric review

- **Primary metric** (decomposition of the never-supplied pool):
  8 never-supplied; 5 decomposed (4 pile-materials-absent, 1
  carrier-absent); 3 unassigned. The DIAG-NO-GO is judged as frozen.
  The miss is informative, not instrumental: the three unassigned
  fighters are slingers/searcasters, outside the duty's population
  by code design (§3a). The instrument observed them correctly (0
  gate rows, 0 ledger events) — there was nothing to decompose under
  the frozen taxonomy.
- **Proposed bar revision for the NEXT run:** scope the
  decomposition bar to craftable-weapon fighters (bow/crossbow) and
  carry slinger/searcaster empties as a separate named finding with
  its own count, rather than letting them fail the bar. The pool
  floor and attribution bars are unaffected. This is a proposal for
  the next prereg, not a re-score of this one.
- **Pool floor:** 18 distinct ≥ 10 ✅ (distinct = (seed, vid) pairs
  — see the namesake correction below).
- **Attribution completeness:** 1.000 ≥ 0.90 ✅ — the ledger is
  airtight on this band for the second time running.
- **Gate coverage:** 0.978 ≥ 0.90 ✅.
- **Mechanism re-measure:** 0.607 vs 0.70, still a miss; lead-only
  0.381 is the honest comparable figure.
- **Namesake correction (analyzer bug, fixed mid-run, before
  judging):** the first analyzer run keyed fighters by vid alone,
  but vid is a NAME-based id that recurs across villages (11 name
  collisions on this band). That merged different people and hid one
  never-supplied fighter (7 → 8 after the fix). The fix scopes all
  per-fighter maps by (seed, vid) in `analyze-craftgate-a.js`
  (emptyFighterPool, gateDecomposition) and the delivery matching in
  `analyze-aidammo-a.js` (ledgerStats meetingsByVid). Both
  `--selftest` suites gained a cross-seed namesake case and re-ran
  green (30/30 each) before the pilot was re-judged. The aidammo
  band's 131/149 figure was computed per-fighter on its own band and
  is not restated here — but any future re-use of its meetingsByVid
  should use the fixed matching.
- **Interpretation note (frozen taxonomy, §1a):** `no-weapon` /
  `not-craftable` gate rows are NOT needing-days — a fighter who no
  longer carries a craftable weapon has no ammo need that day. They
  are reported as diagnostics (0 rows on this band), never as a
  cause. The prereg's table lists them under cause 'other'; the
  analyzer implements the needing-day definition (candidate-day
  with carried < 5), which excludes them. No bar turns on the
  difference (0 rows either way).
- **§15 panel:** not applicable (single-leg DIAG, no before/after)
  — stated in prereg §4.

## §11 Proof (how to reproduce)

- Analyzer selftest: `node scripts/analyze-craftgate-a.js --selftest` → **30/30 PASS** (pool, decomposition incl. tie order + namesake split, judge shapes, hash stability/change).
- Aidammo analyzer selftest (shared, fixed delivery matching): `node scripts/analyze-aidammo-a.js --selftest` → **30/30 PASS**.
- Proof test on a live loaded village (seed 7, sim-harness): `node scripts/test-craftgate-a.js` → **29/29 PASS** (gate replica all five states, carried-autoequip read + live duty seating, attempt wrap, pile snapshot, ledger smoke, fieldFight wrap, uninstall restores originals).
- Aidammo proof test (reuse check): `node scripts/test-aidammo-a.js` → **38/38 PASS**.
- Pilot: `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1 SPEARGATE=1 BOWOPEN=1 MODE=diag OUTDIR=perseed-craftgate-a SEEDS=110801,...,110808 RUN=craftgate-a node scripts/craftgate-driver-a.js` → exit 0, 8/8 valid corpus files, 0 instrument errors on every seed.
- Analyzer: `node scripts/analyze-craftgate-a.js --dir evidence/2026-11-27/perseed-craftgate-a --out evidence/2026-11-27/craftgate-a-analysis.json` → DIAG-NO-GO UNASSIGNED.
- Determinism re-run: same env, `OUTDIR=perseed-craftgate-a-rerun RUN=craftgate-a-rerun SEEDS=110801` → craftgate hash `968769711c9cd269089796121d09b31c3647201f47f1f76f905e8fe7838879f8` — **identical to the pilot**; ledger hash `d01b8f691df28591ae9ca868b122f487ae951f0e7683ce210aadd2bacac1f102` — **identical**. The two files differ in exactly one line: the `run` label (`craftgate-a` vs `craftgate-a-rerun`). The instrument draws no RNG and adds no divergence of its own.

## §12 Canon

No canon doc covers ammunition supply or the home-duty craft gate
specifically (CANON.md, PRESERVATION.md read; recorded in the prereg,
not invented). PRESERVATION.md covers the food ladder, not ammo.
Arrow-crafting is a human skill, never an alien ability — the
home-duty craft this arm measures is on the right side of that line.
Nothing in this DIAG changes canon. One canon-adjacent observation
for a future call (not a ruling): fiber is a foraged material with no
preservation ladder and no village-side production — if the lever
lands on fiber supply, the question of whether fiber should be
gatherable, farmable, or craftable at home is a design call, not a
measurement.

## §13 Next arm (named, not built)

Two levers, in order, both named from the gate rows:

1. **Fiber to the pile.** The gate opens on fiber and fiber alone:
   98% of no-materials days are fiber-short, the pile holds a bolt
   recipe 97% of days but an arrow recipe 65%, and the mean pile
   fiber (9.4) sits an order of magnitude below stick (46) and stone
   (251). The next instrument must answer where fiber comes from
   during play (forage yields? who gathers it? does it ever reach
   the pile?) before any lever is designed — a fiber-supply ledger
   in the shape of this arm's gate rows.
2. **Slinger / searcaster supply.** Two slingers and one searcaster
   entered wave-4+ meetings empty with no at-home path to re-arm.
   Either the duty extends to stones (and cells, if the design
   allows it) or departure/loot is named as their intended path and
   measured for it. A Steve design call on which before any build.

## §14 Infrastructure notes

- Write-flap: probes (`git update-ref refs/heads/probe HEAD`) passed
  before the prereg write, before the instrument commit, and before
  this evidence write. Machine uptime was 42 min at prereg time
  (restart ~19:06 UTC — inside the flap's known post-restart shape).
  No flap window hit this run.
- Safe-commit clobber struck on the prereg commit and on the
  instrument commit (committed files showed as staged-deleted +
  untracked in the main index); repaired each time with
  `git ls-tree HEAD -r -- <paths> | git update-index --add --index-info`
  and verified `git status --short` empty + `git diff HEAD` empty.
  Expect it on the evidence commit too.
- Analyzer bug found and fixed mid-run (the vid-namesake collision,
  §10) — the pilot corpus was NOT re-run; the fix is analyzer-only
  (same corpus, corrected reading), both selftests re-ran green
  before the re-judge, and the correction is recorded here rather
  than silently applied.
- No jest run on this arm (no game code touched; DIAG arm —
  instruments + evidence only). No game code touched.
- The coordinator's claim file for this arm (if any) is the
  coordinator's to delete at closeout; this arm wrote no claim file
  itself (task brief carried the arm assignment).
