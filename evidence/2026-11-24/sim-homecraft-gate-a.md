# sim-homecraft-gate-a — EVIDENCE (DIAG-GO)

**Arm:** sim-homecraft-gate-a · **Loop A run:** fleshout-20261124T2315Z (judged work),
adopted + verified by Loop A run fleshout-20261125T0215Z.
**Type:** DIAG (instrument + evidence only — no game-code fix lands).
**Branch:** `sim-homecraft-gate-a` (worktree `~/workspace/worktrees/sim-homecraft-gate-a`).
**Base at freeze:** `ebc163fe8`. **Prereg:** `evidence/2026-11-24/sim-homecraft-gate-a-prereg.md`
(frozen 2026-11-25 ~00:10 UTC, before any judged sim).
**Band:** fresh 8 seeds 110701–110708, horizon 150d death-aware, competent policy verbatim,
substrate `VETREENGAGE=1 + PARTYSIZE4=1 + FLEEREPAIR2=1 + FIGHTALLY2=1`, `SENSEEXPED=1`,
`SPEARGATE=1`, `BOWOPEN=1`.
**Analysis:** `evidence/2026-11-24/homecraft-gate-a-analysis.json`
(analyzer `scripts/analyze-homecraft-gate-a.js`, driver `scripts/homecraft-gate-driver-a.js`,
proof `scripts/test-homecraft-gate-a.js`).
**Canon:** `docs/CANON.md`, `docs/PRESERVATION.md`, `docs/MONSTER-WAVES.md`,
`docs/BALANCING.md` read. **No canon doc covers ammunition supply specifically** — said
here rather than inventing one (same gap as aidammo). Arrow-crafting is a human skill
(CANON.md), never an alien ability. PRESERVATION.md covers the food ladder only; the
arrow/bolt recipes live in `src/data/recipes.json`.

## §0. The question, in plain words

The aidammo ledger proved home-duty craft supplies 0.849 of the ammunition fighters
hold at wave-4+ entry — but 131 of the 149 fighters who walked into a wave-4 fight with
an empty quiver had NEVER received a single batch in their whole life. This arm asked
WHY those 131 never receive a batch.

**Answer, in one line:** they never receive a batch because the pile almost never holds
the materials — above all fiber. On the days a bow-carrier was home, short of ammo, and
off cooldown, own+pile together could not cover the recipe 93% of the time, and no
villager's own carried materials EVER covered a recipe alone. The pile is the only
source, and the pile is usually empty of fiber. A second, smaller story: 1 in 4 of the
never-served fighters carry a sling, for which no home-duty recipe exists at all.

## §1. Verdict — judged ONLY on the frozen prereg bars

| Bar (prereg §2) | Result | Pass |
|---|---|---|
| Pool floor: never-received empty fighters ≥ 10 | 20 | ✅ |
| Classification completeness ≥ 0.90 | 1.000 (20/20 named, residual 0) | ✅ |
| Instrument bars: 0 errors, analyzer selftest green, proof green | 0 errors; selftest 57/57; proof 29/29 | ✅ |

**Verdict: DIAG-GO (kind CLASSIFIED).** All three frozen bars pass. No bar was
re-scored; the aidammo re-measure below is report-only by prereg design.

**Adoption verification (this run, not the 2315Z run):** the analyzer was re-run over
the pilot corpus with `--selftest-pass --proof-pass` after actually running both
(selftest 57/57, proof 29/29) — the output reproduces the committed
`homecraft-gate-a-analysis.json` **deep-equal** (verdict, bars, classification table,
gate stats, hashes). The judgment was verified, not trusted blindly. Determinism
re-run: seed 110701 re-run after the analyzer-fix commit reproduces the pilot
gate-hash exactly (`f7fbbe77aaca0a45a8904a435520450773ce09e001025434fbc078786b85c976`);
the whole-file diff is one field, `anchorCommit` (36a58fdfdbc6 pilot vs dbfba6b6c0a1
rerun — the rerun was run after the analyzer-only fix commit; the driver is
untouched). Determinism holds.

## §2. Per-cause classification — the 20 never-received empty fighters

Population: 27 empty fighters at wave-4+ entry (132 empty instances, ammo-capable
ranged weapon, `ammoAtEntry == 0`, lead + allies, all origins, evades included).
7 of the 27 DID receive a batch in life and spent it before the fight — cause
**(d) spent-before-fight** (nina_petrova, visjoin_114, maya_singh, priya_nair,
ines_duarte, gen_u2rv2t8, gen_q08rk94). The remaining 20 never received one.

| Cause | n | Share of 20 | What it means |
|---|---|---|---|
| (a) no-materials | 12 | 60% | On home days short of ammo, own+pile could not cover the recipe on ≥ half those days |
| (c1) no-craftable-weapon | 5 | 25% | Entry weapon is a sling (`stone` ammo) — no home-duty recipe exists |
| (c3) attempted-all-failed | 2 | 10% | Attempts fired, every roll failed (blind 35%) |
| (b) rarely-home | 1 | 5% | Away on ≥ 75% of carrier days (≥ 5 carrier days) |
| (c-scholar) scholar-excluded | 0 | 0% | — (analyzer fix: snapshot-time isScholar; brian_otieno/dmitri_sokolov were villagers in-window, reclassified (a)) |
| (c0) never-home-carrier | 0 | 0% | — |
| (c2) never-attempted | 0 | 0% | — the duty fires when it should |
| (e) village-never-crafts | 0 | 0% | — every village crafted at least once (1–18 home-duty batches) |
| residual (unclassified) | 0 | 0% | — |
| **Total never-received** | **20** | **100%** | completeness 1.000 |

Bucket aggregates per cause (window = first-carrier-day .. first-empty-meeting-day):

- **(a) no-materials (12):** mean 50.4 carrier days each; 458 home-short days, of
  which 438 (95.6%) had insufficient materials; 147 away days; only 9 eligible days
  and 8 attempts between all twelve. These fighters lived long bow-carrying lives at
  home — the duty simply never had anything to work with. Fighters: gen_081twa2,
  brian_otieno, elijah_scott (110702), jesse_cortez, gen_ri5nrm6, carlos_diaz,
  ursula_weber, gen_whqnffw, dmitri_sokolov, visjoin_145, wanjiru_kamau, gen_xf91g6d.
- **(c1) no-craftable-weapon (5):** all slings (stone ammo), all with 0 carrier days
  under the bow/bolt accounting — the duty never sees them as carriers at all, and
  even if it did, no recipe exists for stone. Fighters: visjoin_117, ella_johnson,
  gen_ae5mcuz, dale_hoffman (110701/110702), visjoin_118 (110706).
- **(c3) attempted-all-failed (2):** visjoin_104 (110701, crossbow/bolt, 3 carrier
  days, 1 eligible day, 1 attempt, 0 successes) and elijah_scott (110708,
  crude_bow/arrow, 3 carrier days, 1 eligible day, 1 attempt, 0 successes). Both
  lost a single blind 35% roll and never got a second eligible day before their
  first empty meeting. Bad luck on a thin margin, not a broken duty.
- **(b) rarely-home (1):** rosa_mendez (110702, crude_bow, 6 carrier days, 5 away,
  1 home-short day — which was also a no-materials day). The desk expectation that
  rarely-home would take a large share did NOT materialize.

Desk-expectation check (prereg §1c, frozen): (a) bulk ✅ (12/20); (b) bulk ❌ (1/20);
(c0) real share ❌ (0/20 — departure-staged bows were not the story); (c2) ~0 ✅ (0/20);
(e) rare ✅ (0/20). The ledger wins over the desk: the binding constraint is materials,
not absence, not departure staging, not a duty that fails to fire.

Alternative definition (starting-kit counts as "received"): altNeverReceived = 20,
neverWithStartingKit = 0 — no fighter's "received" status changes; nobody in the
population was saved by their day-0 endowment.

## §3. The pile-material story — fiber is the binding material

Pooled over 1019 pile-days (8 seeds): the pile was below arrow-recipe need
(2 stick + 1 stone + 1 fiber) on **488 days (47.9%)**. Medians: stick 7, stone 256,
fiber **1**. Days at zero: stick 10, stone 12, fiber **482 (47.3%)**. Stone is
effectively never the constraint; fiber is the constraint on nearly half of all days.

Per seed, the famine is village-specific, not universal:

| Seed | Median stick/stone/fiber | Days below arrow need | Home-duty batches |
|---|---|---|---|
| 110701 | 224 / 398 / 36 | 4 / 149 | 18 |
| 110702 | 19 / 134 / 0 | 137 / 150 | 3 |
| 110703 | 6 / 243 / 1 | 17 / 87 | 8 |
| 110704 | 7 / 527 / 0 | 148 / 150 | 2 |
| 110705 | 6 / 97 / 0 | 31 / 35 | 1 |
| 110706 | 6 / 253 / 2 | 1 / 149 | 6 |
| 110707 | 6 / 563 / 0 | 148 / 149 | 1 |
| 110708 | 8 / 454 / 12 | 2 / 150 | 6 |

Three villages (110702, 110704, 110707) essentially never hold fiber — median 0,
below need on 137–148 of ~150 days — and between them produced 6 home-duty batches
in 450 village-days. Two villages (110701, 110708) keep fiber in double digits and
produced 24 batches. The pile story is a fiber-supply story: whatever brings fiber
to the pile (foraging, duties, loot) either happens in a village or it doesn't, and
when it doesn't, the arrow duty is dead for the whole run. (110706 is the odd one:
median fiber 2 yet only 1 day below need — its pile hovers just above the line.)

## §4. Carrier home-share — absence is not the story

- 53 distinct bow/bolt carriers across the band; 3191 carrier-days, 2170 at home —
  **home share 0.680**. Carriers are home about two days in three.
- Carrier-day buckets: away 1021 (32.0%), stocked 619 (19.4%), cooldown 114 (3.6%),
  no-materials 1339 (42.0%), eligible 98 (3.1%).
- On home + short + no-cooldown days (1437): pile-sufficient **98 (6.8%)**,
  own-sufficient **0 (0.0%)**, no-materials 1339 (93.2%). **No villager's own carried
  materials EVER covered a recipe alone** — the pile is the only source, and the
  pile is usually short. The duty's "own carried first, then pile" order is
  irrelevant in practice: the own half is always empty.
- Attempts 84, batches made 45 (53.6% success — between the blind 35% and learned
  85% rates, as expected for a mixed population). Home-duty calls 1019 (one per
  pile-day); home-duty batches 45. The duty fires rarely because it is almost never
  eligible, not because it fails when eligible — see §9 for the two caveats.

## §5. Production sources, re-measured on this band

Ledger totals (8 seeds): 77 batches / 349 units — home-duty 45 batches / 225 units,
departure-pile-stones 18 / 62, departure-craft 12 / 60, starting-kit 2 / 2. Spends
112 / 235 units. Batches delivered (still held at a wave-4+ meeting): home-duty 22,
departure-pile-stones 8. Units at entry: 336, of which home-duty 314 — **dominant
share 0.935**, attribution completeness 1.000 (336/336 units, 0 unknown). The aidammo
finding stands on this fresh band: when a fighter DOES have ammo, it is home-duty
ammo. The problem was never delivery — it is that 20 of 27 empty fighters were never
served at all.

Ammo at entry (all origins, lead + allies): 65/222 ranged fighters with ammo
(**0.293**, capable-only 65/197 = 0.330). By origin: aid 34/100, expedition 9/45,
world-tick 22/77. Spear fighters 25 (excluded from the capable rate, as in aidammo).

## §6. Aidammo re-measure — THIN-POOL (report-only, never a verdict bar)

Per the task brief and prereg §2: the aidammo mechanism re-measure on this band is
**THIN-POOL — only 4 pair-inclusive engaged wave-4+ meetings vs the floor of 10**.
Aidammo verdict on this band: DIAG-NO-GO / THIN-POOL. Ammo-at-entry 0.293 vs the
0.70 bar, dominant source home-duty 0.935 — reported, not judged. The DIAG verdict
in §1 stands on its own frozen bars; the thin aidammo pool changes nothing about it.
(The 4 meetings: 1 win — a talk-down, see §8 — 1 villager death, 2 villager flees,
0 monster kills; mean damage share 0.090; volleys fired 0, because there were no
arrows to shoot.)

## §7. Wall numbers (scale-onramp axis)

| Metric | This band (8 seeds) |
|---|---|
| National reached | 0 / 8 |
| Table reached | null (not instrumented by this driver — never faked) |
| Wins (seedWins) | 0 / 8 |
| Wave-4 unlocked | 7 / 8 |
| Wave-5 unlocked | 5 / 8 |
| Median survival | 150d (5 seeds survived to 150; 110703 lost day 87, 110705 lost day 35, 110706 lost day 149) |
| Scale ranks at end | regional 7, village 1 |
| Communities lost | 3 / 8 |
| Starvation deaths | 7 |

Death causes, 700 deaths band-wide: villager combat 266 (38.0%), expedition 246
(35.1%), combat 92 (13.1%), the wild 28 (4.0%), monster 20 (2.9%), sickness 8,
starvation 7, a wound that wouldn't close 6, ambush 4, the arena 4, contest 3,
thirst 3, dehydration 2, alien 2, named monsters (The Callback 2, Gavel 2, The
Reunion 1, The Timeslot 1, Big-Eyes 1, Grief Counselor 1), a stranger 1. Combat
in all its forms is ~86% of deaths; hunger/thirst/sickness together are ~3%.
The wall stands: waves unlock (7/8 wave 4, 5/8 wave 5), but nothing reaches
national, let alone the table — same picture as the standing directive.

## §8. Sense-testing (SENSE-TESTING LAW — meaning, not counts)

Three full meeting transcripts read in full, plus the craft-narration channel:

**1. The Spoiler, seed 110704 day 137 (vFlee, party of 3).** The transcript names
the empty quiver honestly and in the fiction's own voice: *"Rahul has Crude bow
but no arrows — the string stays drawn, useless."* The fight itself reads
coherently — Rage, Blooded, the Spoiler's prophecy ("IN THREE ROUNDS, RAHUL WILL
BLEED") and its payoff ("the announced thing happened — the voiceover grows
LOUDER"). The party deals 387 damage (24.6% of 1571 HP) across 4 rounds and flees.
Nothing in the transcript contradicts the ledger: Rahul (gen_whqnffw) is classified
(a) no-materials, and the transcript shows him fighting with a useless bow. The
supply story and the fight story agree.

**2. The Eulogy, seed 110707 day 125 (monster fled — the band's only pair win).**
*"Lorena walks straight into The Loud Beast. No avoiding it. R1: Lorena walks in
open-handed, talking — low, steady, unafraid. And impossibly, it listens. It stands
down. (Peacemaker: Walk In)"* A one-line non-violent resolution, coherent with the
Peacemaker fiction. One wrinkle worth a line: the log calls the monster "The Loud
Beast" while the data name is "The Eulogy" — the fight log's display name
(`monsterNoun`) and the roster name disagree. Cosmetic, not a ledger issue, but a
reader following the transcript into the data will trip on it.

**3. The Reunion, seed 110702 day 52 (villager death).** Jada walks in open-handed,
Walk In fails, Peacemaker leaves her exposed, and she dies in round 3 after dealing
13 damage — while Maya and gen_ae5mcuz stand by as a party of 3. Brutal and
coherent: a fresh scholar walking open-handed into the village-you-failed and paying
for it is the designed horror, and the transcript says so plainly rather than
hiding the death behind a roll.

**Craft narration — the channel is silent.** Zero workbench lines in 330 vetSays
lines across the band; the single arrow/bolt mention is a fireside lesson about
"arrow-shaped leaves with a sharp lemony tang" — not a craft. The craft `say` only
fires when the player is at haven (`atHaven`), and the competent policy is never at
haven during a craft: 105 tele `ammo_craft` events fired, 0 say lines. So the
home-duty craft is never *witnessed* in these sims — a villager makes arrows, or
fails to, and nobody in the fiction ever says so. That is a sense-testing gap, not a
verdict item: the prereg asked for ≥1 craft narration line to be read, and the honest
report is that the corpus contains none to read. If Steve ever watches a village,
the first thing he should check is whether the workbench ever speaks.

## §9. Consistency checks + instrument caveats (reported, never verdict bars)

- **Eligible-mismatch 14/98 — explained, real code behavior, not an instrument bug.**
  The prereg's consistency check ("every eligible day carries the attempted flag")
  fails on 14 of 98 eligible carrier-days. Verified from the corpus: in all 14 cases
  an earlier carrier in the SAME duty call attempted first (7 made a batch, 7 failed
  — and a failed attempt still consumes the materials, per `villagerAmmoCraftDay`:
  materials are taken before the roll), and in 12/14 the pile at snapshot could
  cover the recipe at most once. The snapshot is decision-time state taken before
  the call; the duty then processes carriers sequentially in roster order, sharing
  one pile. A later carrier who was eligible at snapshot time finds the pile spent
  when their turn comes, the code's material check fails, and no cooldown is set.
  The frozen "eligible ⇒ attempt by construction" assumption holds per-carrier only
  if the pile is untouched between snapshot and turn — which fails whenever an
  earlier carrier crafts. The classification is unaffected (no cause rule uses
  eligibleMismatch), but the snapshot overstates true eligibility by 14 rows, and
  the (a) story is if anything slightly understated: some "eligible" days were
  never really servable.
- **Tele attempts 105 vs gate attempts 84 — explained.** The game fires a tele
  `ammo_craft` event on every duty attempt (105), but the gate snapshot counts 84.
  The 21 gap is the duty's `autoEquip`: it seats a carried bow mid-call for a
  villager who had no equipped ranged weapon at snapshot time, so they attempt
  with no pre-row (the driver's own comment anticipates this: pre-reads use
  `ammoRangedKit` without autoEquip). The snapshot undercounts attempts by 20%.
  Again no verdict impact — the (c2)/(c3) rules read snapshot attempts, and the
  (a) rule (which dominates the table) is checked first — but a future analyzer
  should count tele attempts per vid, not snapshot rows, if attempt counts ever
  become a verdict bar.
- **Never-received fighters have 0 home-duty successes** ✅ (consistency check
  passes by construction of the classification).
- **madeBatches 45 = homeDutyBatches 45** ✅ (snapshot and ledger agree).
- **Recipes present in all 8 seeds** (arrow 8/8, bolt 8/8) — no data-level failure.

## §10. Metric review (§14)

- The frozen bars judged as written; no re-scoring. The pool floor (≥10) was
  comfortably met (20) on a fresh band one-quarter the size of aidammo's
  never-received population (131) — the phenomenon is smaller here because the
  fresh band has fewer empty fighters overall (27 vs 149), not because serving
  improved: the never-received share among empty fighters is 20/27 (74%) vs
  aidammo's 131/149 (88%).
- The classification taxonomy held: residual 0, and the bucket-order correction
  (prereg §9, cooldown before stocked) mattered in practice — a freshly crafted
  carrier reads stocked + cooldown the same day, and without the correction those
  days would have been mis-bucketed.
- The two instrument caveats in §9 (eligible-mismatch, tele-vs-snapshot attempts)
  are the metric's weak points: the snapshot is a before-call picture of a
  sequential shared-pile process, so "eligible" overstates servability and
  "attempts" understates it. For a future DIAG that needs exact attempt counts,
  the instrument should read the tele stream per vid (authoritative) instead of
  snapshot rows. For THIS arm the verdict never depended on attempt counts, so the
  caveats are recorded, not repaired.
- The craft-narration sense test (§8) could not be performed as written — the
  corpus contains no craft narration lines. A future arm that wants witnessed
  crafting should either run a policy that keeps the player at haven or read the
  tele stream instead of `say` lines.
- The aidammo re-measure floor (10 pair meetings) was not met (4) — the band's
  wave-4+ meeting rate is low because 3 of 8 villages lost early or never launched.
  The re-measure is report-only by design, so this is a thin-pool note, not a
  failure.

## §11. Next lever (named from the dominant cause)

**Finding #2544 stays OPEN.** This DIAG names WHY the 131 never receive a batch;
it does not close the finding.

Dominant cause (a) no-materials, 12/20 (60%): the next lever is **fiber to the
pile**. The pile's fiber supply is the binding constraint — median 1, zero on 47%
of pile-days, and three villages that never hold fiber at all. Candidate lever
shapes (for the next arm's prereg, not decided here): a fiber-yield or
fiber-prioritizing forage/duty change so the pile actually accumulates fiber; a
pile-stocking behavior (villagers depositing gathered fiber instead of carrying
it); or a recipe change dropping fiber from the arrow recipe. The (a) fighters
averaged 50 carrier days each — there is ample time for a fiber fix to reach them;
the lever is supply, not timing.

Secondary lever, from (c1) 5/20 (25%): **serve the sling**. Five fighters carried a
weapon the duty cannot serve at all. A stone-ammo home-duty recipe (or a sling
service equivalent) would close a quarter of the never-served population without
touching fiber. Smaller, cleaner, and independent of the fiber lever — a good
second arm.

Not a lever: (b) rarely-home (1/20) and (c3) bad luck (2/20) are too small to chase;
(c2) is 0 — the duty fires when it should.

## §12. Infrastructure notes

- **Write flap:** the prereg records a flap window at ~00:05 UTC (probe
  `git update-ref refs/heads/probe HEAD` failed machine-wide, EPERM/O_EXCL, while
  plain file writes succeeded; machine uptime 37 min at the time). The pilot
  corpora, sweep logs, and rerun logs carry NO flap mentions (0 EPERM/O_EXCL hits
  in `homecraft-gate-a-sweep.{log,err}` and `homecraft-gate-a-rerun.{log,err}`);
  the sweep and rerun completed. At adoption time (2026-11-25 ~02:30 UTC, machine
  uptime ~3h) the probe passes. The 2315Z run timed out before committing its
  evidence; this adoption recovers that work — nothing was re-run except the
  determinism re-check, which is a verification read, not a new sim.
- **Rebase:** adoption worker rebased the branch onto current master tip
  `4e81a9e94` (journey-crisis r287 run note; master had moved 16 commits past the
  branch base `ebc163fe8` — version bump, journey-deepening r286, wilddeath-b,
  fleeguard-b, partyassemble-b, journey-scale r288, journey-crisis r287 — and moved
  once more, r287 landing, during the adoption itself). Rebase clean, 4/4 picks, no
  conflicts, no stops. New branch tip `742da708f`. On the rebased tip: analyzer
  selftest 57/57, proof test 29/29, analyzer re-run over the pilot corpus still
  DIAG-GO and deep-equal to the committed analysis JSON. Zero src/js overlap with
  the master delta, as expected.

## §13. Adoption closeout

- Branch base `ebc163fe8` (sim-winnability-round-2130 adoption closeout).
- Branch commits: `11001b63f` (prereg freeze), `36a58fdfd` (gate-snapshot
  instruments + prereg §9 correction), `dbfba6b6c` (analyzer fix: (c-scholar)
  uses snapshot-time isScholar — (a) 10→12, (c-scholar) 2→0, verdict unchanged
  DIAG-GO; selftest 57/57).
- Uncommitted at adoption: `homecraft-gate-a-analysis.json`,
  `homecraft-gate-a-sweep.{log,err}`, `homecraft-gate-a-rerun.{log,err}`,
  `perseed-homecraft-gate-a/` (8 per-seed JSONs), `perseed-homecraft-gate-a-rerun/`
  (seed 110701 determinism replay) — all committed by this adoption.
- Rebase onto current master tip + proof re-run: pending (below).
- Rebase outcome (adoption, 2026-11-25 ~02:45 UTC): rebased cleanly onto master tip
  `4e81a9e94` (journey-crisis r287). New branch tip `742da708f` (adoption commit);
  full rebased tip list: `742da708f` (adoption corpus + analysis + evidence),
  `f569480c8` (analyzer fix), `619ea65c8` (instruments), `f94a5e19d` (prereg).
  On the rebased tip: analyzer selftest 57/57, proof test 29/29, analyzer re-run
  DIAG-GO deep-equal to the committed analysis JSON. Worktree clean
  (`git status --short` empty, `git diff HEAD` empty). **Ready: merged locally,
  pending ship** — coordinator merges via --ff-only; no push, no bump, no live
  verification by this worker.
