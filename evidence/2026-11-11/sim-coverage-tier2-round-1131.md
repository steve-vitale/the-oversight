# sim-coverage-tier2-round-1131 — Loop B 1131Z coordinator evidence (Coverage Tier 2 — ADOPTION, 3 arms LANDED)

Run fleshout-loop-b-20261111T1131Z, axis coverage Tier 2 first numbers —
duties / kin-naming-childbirth-keepsakes / standing points (scale-onramp
converging, NOT converged; directive stands). Claim
fleshout-loop-b-20261111T1131Z written before any sims.

## Run-start closeout (timed-out coordinator adoption)

The 1131Z coordinator died on the 7200s timeout with all three arms
part-done; this run adopted all three in the main-session adoption
pattern. No new run was started. Master moved under the adoption:
0be63dbce (sim-relayfirst-a, Loop A 1115Z) → f2e411b6c (dutyfirst-b2)
→ 28875b1b1 (journey crisis r180, landed by its own adoption
coordinator mid-run) → ae53134ae (kinfirst-b) → f9164718b
(standfirst-b). The reconciliation landing was in flight throughout
(coordinator 2, reconcile-forward-2); zero file overlap with any arm.
Rebase discipline held throughout: `git rev-parse master` read in the
MAIN tree immediately before EACH rebase, rebase onto the explicit SHA,
`master..HEAD` re-verified after. No rebase stop-at-pick quirk struck
on any arm this round (three clean rebases).

Pre-flight: main tree clean, EPERM write flap ACTIVE all run (probe-gate
with unique filename per attempt + unlink on every outcome; windows
brief, seconds-long; chunked writes + retry). Reaper runs suppressed
per standing rule (nothing removed = no message; the 05:28 CST
reconcile-forward removal was reported to Steve separately and is NOT
this run's). Active 9–12/16 during the run.

## Arm 1 — sim-dutyfirst-b2 (duties first numbers) — GO, LANDED f2e411b6c

Branch sim-dutyfirst-b2, 5 commits on master f2e411b6c (proof 81/81
green pre- and post-rebase and on merged master):
- defd69cf4 — 0835Z worker's prereg, rebased onto explicit master
  b09cf584e (adoption of the stranded 0835Z arm; the 0835Z run wrote
  the prereg and no sims — superseded by this live run)
- b3efe874c — instrument + driver + analyzer + proof (81/81)
- e24979a1b — control leg corpus
- 661d57b4d — neutral leg corpus
- 2061eeedc — evidence (GO)

Pilot (seeds 190311–190318, 150d, competent, 1,122 village-days): GO —
all 5 pre-registered checks pass: 0 unclassified assignTask calls /
resolutions / deposits / resolve-call rows, 15 wraps live in the
pilot (villagerHuntResolve proven live in a fixture and dead under
competent — 0 calls in 1,122 village-days, the zero IS the finding),
neutrality 8/8 exact, 0 instrument errors, per-seed tables for
metrics 1–8.

Headline: the duty board is four jobs, one lead carrier, and a pantry
that keeps saying no. Competent only ever staffs water, fish,
deadfall, and cook — 3,634 asks, 2,543 accepted (70%), 1,091 refused
(30%). Eleven of fifteen duties are never staffed at all: hunt, scout,
patrol, tend, teach, mend, stone, and garden get zero assignTask
calls on every seed. One villager takes 3–4 task-lead domains and
holds them 50–129 days; the top three villagers do 59–91% of all
resolutions. The pantry is usually full, so the throttle redirects
2,534 forage/garden/fish resolutions to wood, stone, and water before
they touch food — forage duty completes exactly once in eight seeds,
garden brings in zero harvest, fish is the only food duty that feeds
(198,695 kcal). 46.9% of pantry inflow comes from duties. Medic duty:
holder in place 1,064 of 1,122 village-days.

Wall: wins 0/8, national 0/8, table 0/8, wave-4 8/8, wave-5 3/8,
median survival 141d, 5/8 village-lost. Evidence:
evidence/2026-11-11/sim-dutyfirst-b.md. Findings appended to the
backlog by the adoption (see the arm evidence for the full list).

## Arm 2 — sim-kinfirst-b (kin / naming / childbirth / keepsakes first numbers) — GO, LANDED ae53134ae

Branch sim-kinfirst-b, 4 commits on master ae53134ae (proof 58/58
green pre- and post-rebase):
- 37f7048e5 — 1131Z worker's prereg
- b38a3b473 — instrument + driver + analyzer + proof (58/58 green)
- aa90a69ff — analyzer birth-signature fix + summary + 16-file
  perseed corpus (adoption commit; the analyzer false-positived
  worldgen children as births — age 1–4, named, no birthDay — so
  births now count ONLY on the birth-code signature: unnamed +
  birthDay)
- ae53134ae — evidence (GO), rebased onto explicit master 28875b1b1
  (read fresh; the r180 landing moved master under the adoption)

Pilot (seeds 190341–190348, 150d, competent, 1,043 village-days): GO —
all 6 pre-registered checks pass: 0 unclassified kin events, 24 wraps
live in the pilot (nameBaby / bestowUseName proven live in a fixture
and dead under competent — 0 calls, the zero IS the finding),
neutrality 8/8 exact (days + end pantry kcal + full death-event
list), 0 instrument errors, engagement floor 2,118 keepsakeGrow
events.

Headline: keepsakes grow every day and die with every mantle; births
and naming never happen. Keepsakes grow constantly — 2,118
keepsakeGrow calls, 1,679 real growth, 80 level beats (32 L1, 28 L2,
20 L3) — and then the growth is thrown away: every mantle buries the
dead bearer's keepsakes (334 buried) and the successor starts over at
bond 0. All 16 keepsakes held at the end of the three surviving
villages sit at bond 0, level 0. Births are a structural zero (0 on
all 8 seeds — the birth gate opens at day 270, no village lived that
long). Naming is a player-only rite the competent driver never plays:
0 nameBaby calls, 0 bestowUseName calls, 0 babies auto-named, 0
naming offers ever seen. The thread home fires almost never: 32
thread checks, 1 clue in 1,043 village-days (seed 190347: the Photo
Album still says the name of Lamia Shoukry, a sister Taken at the
Scattering). The keepsake's powers barely exist in play: Lucky Break
consulted 2 / fired 0, Hold consulted 133 / fired 0, no L2 keepsake
action ever pressed, L3 enhancement offer never fired — 20 keepsakes
reached L3, 1,679 maybe-offer checks, 0 offers; offerRelicEnhancement
8 calls, all other-relic.

Wall: wins 0/8, national 0/8, table 0/8, wave-5 5/8, wave-4 3/8,
survivors 3/8, median survival 135.5d, 791 deaths, 81 mantles, 86
player deaths, standing 125–560 (all regional). Evidence:
evidence/2026-11-11/sim-kinfirst-b.md. 5 findings appended to the
backlog (births 0 structural zero; keepsake bond dies at mantle;
thread home 1 clue in 1,043 village-days; keepsake powers never fire
incl. L3 offer 0 despite 20 L3 crossings; naming player-only,
0 calls).

## Arm 3 — sim-standfirst-b (standing points first numbers) — GO, LANDED f9164718b

Branch sim-standfirst-b, 2 commits on master f9164718b (proof 52/52
green pre- and post-rebase):
- 34791c918 — 1131Z worker's prereg + instrument/driver/analyzer/proof
  (52/52 green)
- f9164718b — evidence + analyzer clone-helper fix + neutral 190358
  re-run (adoption commit), rebased onto explicit master ae53134ae
  (read fresh)

Adoption notes: the dead run's neutral seed 190358 was killed SIGTERM
and never wrote its file; the adoption re-ran ONLY neutral 190358 with
the same driver/policies (139d, village-lost, ladder stage 2 / 39
counted, deaths 73, errors 0). The analyzer had never run — on first
run it crashed with `ReferenceError: clone is not defined` (the `clone`
helper is used 8 times in summarizeSeed and was never defined); the
adoption added the one-line helper and re-ran the analyzer + the 52/52
proof after the fix. The proof passed before and after — it tests the
classifiers, not summarizeSeed, which is why the crash survived the
proof (see Metric review).

Pilot (seeds 190351–190358, 150d, competent, 935 village-days): GO —
all 6 pre-registered checks pass: 0 unclassified standing events
(1,994 events), 9 wraps live in the pilot (ladderCashOut,
ladderCapstoneReady, ladderDeliverCapstone, feastBundleBuyOut proven
live in a fixture and dead under competent — all Haven-panel actions
competent never calls), neutrality 8/8 exact, 0 instrument errors,
engagement floor 500 counted ladder points band-wide (bar ≥5).

Headline: every village reaches National by day 50 — and it is
Explore that carries them there. Peak stage 3 (National) on all 8
seeds, first National day 25–50, all three stage rewards land on
every seed (24 grants: trader, shelter, link). Explore ends 21–42 on
every seed, always capped at 24, fed by codex breadth (88–175);
Fight, the track the ladder was built to reward, is the weakest
everywhere (1–7 points at end). Forage swings with the roster (0–30)
because summed XP dies with the villagers who earned it. Talk gets
nothing from links (0 seasoned regional+ links) and everything from
contests survived (10–21). The old Standing bar tells the opposite
story: the gated total sits at 199 — the wave-5 deferral — on 5 of 8
seeds (248 deferral-days, veterans the binding bar), wave 4 unlocks
on all 8 seeds (days 34–79), wave 5 on only 2 (days 95, 117). The
feast bundle never completes: 16 feasts, 48 bundle checks, best sheet
5 of 6 slots, 0 completions, 0 buy-outs. The capstone is never even
read: `ladderCapstoneReady` called 0 times on any seed, so no
capstone was ready, delivered, or refused. The lesser seat reads as
offered on 6 of 8 seeds at end (all on peak stage); the full seat is
unreached everywhere.

Wall: wins 0/8, national 0/8, lesser seat 6/8, full seat 0/8, wave-4
8/8, wave-5 2/8, survivors 0/8, median survival 131d (analyzer prints
132 — median-definition difference, per-seed days list is the source
of truth), 585 deaths, standing 100–470. Evidence:
evidence/2026-11-11/sim-standfirst-b.md. 6 findings appended to the
backlog.

## 0835Z round closeout note (never written by the dead 0835Z run — recorded here)

- **vetfirst-b: NO-GO, landed as evidence.** Branch sim-vetfirst-b
  merged 071df74d5. Verdict NO-GO on the veterans first-numbers bar:
  bar disagreement on seed 190305, wraps artifact (the proof re-run
  after the fix is 47/47 PASS — the instrument is sound; the NO-GO
  is the measured bar, not the tool). Veterans first numbers are
  measured but NOT GO — the tracker checkbox stays unchecked until a
  re-judged run passes.
- **proofrefresh-b4: LANDED 2ffa6c482.** Panel on a16ce1cc8 (the r131
  cook/mend fix), rebased onto c3d89858f; trio 9/9 + 9/9 + 4/4;
  ontology 135; stale-input negative check 12/12. **The measurement
  proof is FRESH again** — the staleness pair in the standing gate
  failure set should now be green (verify at the next gate).
- **dutyfirst-b (0835Z): prereg only, no sims** — superseded by the
  LIVE dutyfirst-b2 run, landed this round as f2e411b6c (Arm 1
  above). Nothing of the 0835Z dutyfirst arm survives except its
  prereg lineage.

## Wall (this run's judged corpora, 24 seeds, 3 bands)

Wins 0/24, national 0/24, table 6/24 — all six are lesser seats, all
on the standfirst band; full seat 0/24. Wave-5 reached 10/24, wave-4
reached 24/24, median survival 131–141d per band. The scale wall
stands: the 199 standing gate reproduced on the standfirst band
(gated 199 on 5/8 seeds, veterans the binding bar) and the dutyfirst
band's 46.9% duty pantry share does not move the wall; the veteran
bar remains the wave-5 choke (vetfirst NO-GO, see 0835Z note above).

## Telemetry deviation check

Ran `node scripts/telemetry-check.js --baseline <scale-wall.json>
--current '<per-seed-glob>' --metrics national,table,wins,exiled` on
all three corpora. The script REFUSES all three (exit 2): "refusing
recorder-corpus input: all 16 --current rows carry top-level
anchorCommit, so they are sweep recorder rows, not runs. Recorder
corpora are compared with sweep-compare tables, never against a run
baseline here." No LOUD lines, no investigation item. Baseline NOT
rolled — correct: these are first-numbers census corpora, not
win-seeking runs, and the baseline is a WINSEAT-regime baseline. Same
refusal class as the 0615Z and 1015Z runs.

## Metric review (§14)

Each arm pre-registered instrument validity (first-numbers census)
and was judged only against its header: dutyfirst 5/5, kinfirst 6/6,
standfirst 6/6 — all GO. No metric was re-scored mid-run. The three
GO verdicts are instrument-validity verdicts: the instruments are
proven, the numbers are first numbers, no confirm band was spent.
Revisions proposed for the NEXT run, not this one: (1) standfirst —
capstone readiness needs a driver that plays the Haven panel (or a
direct readiness probe); the pilot cannot judge readiness in lived
play at all. (2) standfirst — the proof tests classifiers, not the
analyzer's aggregation path; a proof run of the analyzer on a real
corpus is the missing coverage (the adoption ran it on the real
16-file corpus and it now completes). (3) kinfirst — births are
structurally unmeasurable at a 150d horizon (gate opens day 270);
a birth measurement needs a longer horizon or a seeded-pregnancy
driver. (4) dutyfirst — the sense-test corpus covers days ~1–18
only (400-line cap fills early); the same early-days caveat as the
siblings. (5) standfirst — the analyzer's `medianDays` (132)
differs by one from the standard median of the per-seed days (131);
the analyzer's median definition should be pinned or the field
dropped.

## Infrastructure

- Safe-commit index clobber hit the kinfirst analyzer-fix commit (D
  + ?? + MM variant) and the standfirst evidence commit (D + ?? + MM
  variant) — repaired via `git ls-tree -r HEAD | git update-index
  --add --index-info` each time, hashes verified, commits correct,
  main tree clean at closeout. The clobber is now routine after
  every safe-commit on this tree.
- EPERM write flap active all run (probe-gate with unique filename
  per attempt + unlink on every outcome; one probe-blindness
  sighting avoided by the unique-filename rule). No work lost.
- check.js --quick NOT re-run: zero src/js in all three arms
  (scripts + evidence only); standing 294/6 pre-existing profile
  recorded by the 0230Z run and re-recorded by journey-succession
  r177 hours earlier. Gate staggering held: the reconciliation
  coordinator and the r180 adoption coordinator were running gates
  on other trees during this adoption — proofs only, no check.js
  run concurrently.
- kinfirst release took ~9 min (550s) blocked on REGISTRY.lock
  behind a sibling's slow `git worktree add`; dutyfirst release
  ~8 min (488s) on the same contention. Worktree registration is
  the slow path under sibling load, not the flap.
- Findings appended to the backlog: dutyfirst (see arm evidence),
  kinfirst 5, standfirst 6.

## Tracker state

scale-onramp stays converging (NOT converged): wins still 0
everywhere, national 0, table 6/24 but all lesser seats, full seat
0; the 199 gate reproduced once more and the veteran bar remains the
wave-5 choke. food-economy stays converging (untouched; sibling B
loop). Coverage Tier 2: duties [x], kin/naming/childbirth/keepsakes
[x], standing points [x] — measured this run. Veterans stays [ ]
(NO-GO, see 0835Z note). Justice/moot, titans/heralds,
relay/network NOT marked — that update belongs to the Loop A 1115Z
coordinator, not this run. Next blanks, in order: (1) justice/moot
first numbers (next unchecked Tier 2 item); (2) titans/heralds;
(3) relay/network; (4) siege (SUBSTRATE-MISSING — needs a design
note first). Claim deleted; lock deleted. Evidence:
evidence/2026-11-11/sim-coverage-tier2-round-1131.md (coordinator
evidence, this file).
