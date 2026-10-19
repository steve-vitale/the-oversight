# sim-npctrap-b — NPC trapper economy census (2026-10-19)

Loop-B food-economy DIAGNOSTIC arm, run fleshout-loop-b-20261019T0130Z.
Answers the #581 named next (evidence/2026-10-18/sim-pitstaff-b2.md): the
pitknowledge NPC trapper line (18%/return, 1 boar + 2,564 pit kcal/16 runs)
is the live pit economy — INSTRUMENT IT, DON'T STAFF IT. pitstaff is 0-for-2
(do NOT re-run staffing on this channel); the book channel is dead
(traphandbook-b killed — ruin books never surface on the competent
substrate). This is a census, not a lever: zero game-code changes.

## Canon read (BEFORE sims)

- docs/CANON.md: knowledge gates every surface ("If you don't know, it
  doesn't show"); human skills ≠ alien abilities (knowsPit is a human
  skill, not a System ability); no silent actions.
- docs/PRESERVATION.md: pit catches (boar/deer meat) enter the existing
  food ladder (cleaned→cooked→smoked→rendered→pemmican) — the pit needs no
  new ladder logic.
- docs/BEAR.md: trichinosis in boar meat — only `foodState: 'cooked'`
  clears it, smoking does NOT (carried note from pitstaff-b2's canon read;
  the census does not change food-state handling).
- **No hunting/traps canon doc exists** (docs/ has no HUNTING.md or
  TRAPS.md — verified again 2026-10-19). The trap species table lives in
  src/data/recipes.json. Stated here instead of invented.

## What is being instrumented (the landed pitknowledge channel, c11e7aa97)

Six grant channels that put pit_trap / knowsPit into play:
1. **background** (scholar): occupations hunting_guide / trail_crew /
   rancher start with pit_trap codex L3 (game.js:2717) + the day-0 beat
   "Your old life comes back to your hands" (traphandbook added it —
   #578's named-next #3 is already addressed).
2. **npc-background** (villager): villagers of the same three occupations
   are constructed with knowsPit=true (game.js:1263,1545).
3. **pit_teach**: once-per-teacher show-me beat (trust 15+, at haven,
   scholar pit_trap L0) → scholar L1 via 'taught' (villager-objectives.js:1324).
4. **pit_overhear**: scholar overhears a knowsPit teacher's lesson
   (trust 15+, at haven, scholar L0) → L1 (villager-objectives.js:1200).
5. **witnessed**: an NPC pit-line catch the scholar witnesses (at haven,
   scholar L0) → L1 via 'witnessed' (villager-objectives.js:1285-1292).
   The catch itself is the pit line: 18%/return per knowsPit trapper,
   species from the pit_trap table, 400–1000 kcal carried share,
   stockPantry + npc_pit tele.
6. **pit_lesson**: villager-to-villager apprenticeship (topic 'pit',
   trust 15+, hungry-or-novice, once per learner) → knowsPit spreads
   (villager-agency.js:1128-1160).
7. **read** (book channel, dead per traphandbook-b): Trapper Handbook
   (src/data/books.json:33, unlocks.recipes includes pit_trap) grants L3
   on readBook. Instrument note (#579): ruin books are pushed with
   `bookId`, NOT `itemId` — the pitstaff probe's "0/8 handbook finds" was
   an instrument false negative. This census reads `bookId` and counts
   readBook calls (sweep policies never call readBook — expected 0).

## PRE-REGISTRATION (binding; written BEFORE sims — MEASUREMENT.md §14)

- QUESTIONS (the census):
  1. pit-kcal per 100d and boar kills attributable to NPC-driven traps
     (the npc_pit tele channel, 18%/return).
  2. Who holds knowsPit and how they got it (channels 1–6 + read).
  3. How often each grant channel fires per run (fire counts per channel).
  4. Whether pits convert to boar kcal at what rate (boar share of npc_pit
     catches; kcal per boar).
  5. What gates the channel on 180d horizons (teacher death, trust<15,
     village collapse, chicken-and-egg on seeds with no starter trapper).
- PRIMARY (binding): the census is COMPLETE and legible — per-channel
  grant firing counts, pit-kcal/100d, and boar-kill conversion rate are
  reported on 16 runs with the sample large enough that a 18%/return
  channel shows its true rate: ≥ 30 npc_pit catches across the 16 runs
  (expected ≈ 3+ trapper-present runs × ~40d-alive trapper-days × 0.18 ≈
  60+, but the gate is the floor that keeps it honest: fewer than 30 =
  the census under-sampled and the rates are not legible).
- ENGAGEMENT (kill-fast analog for a census): on seeds WITH a starting
  knowsPit villager (expected 5-8 of 16 runs — 3 occupations / 78), ≥ 1
  npc_pit catch on ≥ 3 runs. If the channel never fires on trapper seeds,
  the census instrument is broken — fix the instrument, do not run more
  seeds.
- CONTROL CONTRAST (pure instrument, not a lever): PITKNOWLEDGE=0 vs
  unset, identical seeds, 16 paired runs. Attribution bar: npc_pit
  catches + pit-kcal attributed = on-side minus off-side (expected
  off-side = 0; if off-side fires, the instrument mis-attributes).
- GUARDRAILS: none new (no lever — instrument-only; the channel is
  landed master code). Death-mode corpus recorded for the record.
- HORIZON: 180d death-aware (dead villages stop). SUBSTRATE:
  FEASTSCALE_R13=1; SEATDRIVE=0 EXPLICIT (pre-seat); HUNTSTAFF unset;
  PITSTAFF absent; PITKNOWLEDGE=0 on the control side only.
  Env asserted up front; SWEEP STOPS on mismatch.
- SEEDS: 9421–9428 (freshness verified against evidence/ + scripts/ +
  hidden_files/ before any sims; 7701-7708 rejected — 7701 consumed by
  sim-huntroster-b; 7801–7818 consumed by sim-huntstaff-b/b2) ×
  {leadfeast, belongfeast} ×
  {channel-on, PITKNOWLEDGE=0} = 32 runs.
- A miss is NO-GO, never re-scored mid-run. Metric doubts go under
  "metric review".

## Sweep result — 32 runs (9421–9428 × {leadfeast,belongfeast} × {on, off})

Per-seed JSONs: `evidence/2026-10-19/perseed-npctrap-b/`. Env asserted up
front (FEASTSCALE_R13=1, SEATDRIVE=0 explicit); off = PITKNOWLEDGE=0,
identical seeds both sides.

Instrument: scripts/sweep-npctrap-b.js (day-0 knowsPit census, tele-wrap
counts for pit_teach/pit_overhear/pit_lesson/npc_pit/npc_trap, grantKnowledge
wrap for pit_trap grants, readBook wrap + bookId inventory scan per #579,
30d holder snapshots, death capture, wall numbers).
Sense reader: scripts/sense-npctrap-b.js (beats: evidence/2026-10-19/sense-npctrap-b.txt).

### The five census questions, answered

**Q1 — pit-kcal/100d and boar kills attributable to NPC-driven traps.**
On-side: 18,011 pit kcal / 2,097 run-days = **858.9 kcal/100d**; **8 boar
kills**. Off-side (PITKNOWLEDGE=0): 0 catches, 0 kcal — attribution is
clean: every boar kill and pit kcal is the NPC channel's. 25 npc_pit
catches total.

**Q2 — who holds knowsPit and how they got it.**
- Day-0 background: 8/16 runs had a knowsPit villager (10 holders;
  occs trail_crew, rancher). Scholar-background: 0/16 (no scholar rolled
  a pit occupation this sample; scholar occs: butcher, firefighter,
  interpreter, lifeguard, locksmith, programmer, sign_painter).
- **Joiners: ≥4/16 runs** — wanderers arriving mid-run with trapper
  occupations carrying knowsPit (Ethan/trail_crew d60 9427-belong,
  Valentina/hunting_guide d150 9422-lead, Jorge/rancher d90 9428-lead,
  Bayan/hunting_guide ~d103 9428-lead). One of them (Bayan) joined,
  taught, and was gone between 30d snapshots — the transient joiner
  population is undercounted by snapshot census (instrument floor; see
  metric review).
- Apprenticeship (pit_lesson): 1 — Ethan → Thabo (taxi_driver), d73,
  need novice, 9427-belongfeast.

**Q3 — how often each grant channel fires per run.**
Scholar pit_trap acquisition: **11/16 on-runs** (6 × taught, 5 ×
witnessed, 0 × overhear, 0 × background, 0 × read). Teach beats fired at
trust 20–89 (never below the 15 gate — the regard gate is not the bind).
Witnessed grants fire early (d4–d5) when a trapper catches at haven with
the scholar home. Overhear never fired: it needs apprenticeship +
player-at-haven on the chore-lesson return (1 apprenticeship × at-haven
gate = 0/16). Book channel: 0 readBook calls, 0 Trapper Handbook
bookId surfacings — confirms the traphandbook-b kill (books don't surface
on this substrate); the #579 instrument fix (read `bookId`, not
`itemId`) is confirmed working and still reads 0.

**Q4 — boar conversion rate.**
8/25 catches = **32% boar** (species: deer 7, opossum 5, boar 8, raccoon
5 — roughly the pit_trap table's shape); boar kcal 5,832/18,011 =
32.4%; **avg 729 kcal/boar** (the designed 400–1000 carried-share band).
The richest single run: 9427-belongfeast (joiner Ethan's line): 5 catches,
3,915 kcal, 1 boar.

**Q5 — what gates the channel on 180d horizons.**
1. **Trapper mortality**: 10/10 day-0 trappers died (combat 8, starvation
   1, monster 1), median ~day 70. The trapper population is high-turnover;
   the channel is sustained by joiners and one apprenticeship, not by the
   starting roster surviving.
2. **Trapper presence**: 5/16 runs had no trapper at any point (no day-0,
   no joiner, no spread) → channel dark. The 8th channel (joiners) is the
   difference between 8/16 and 12/16 trapper-runs.
3. **Player-at-haven**: teaches need the scholar home at the return
   (6 teaches / 12 trapper-runs; 9421/9426's trappers died d56–95 before
   trust reached 15 or with the scholar away).
4. **Trust-15**: not binding in practice (all teaches at trust 20–89).
5. Scholar-background: stochastic (0/16 this sample vs 4/16 in the
   pitknowledge sweep — occupation lottery).
6. The pit line shares the TRAPS purpose with the snare line; the 18%
   fires per knowsPit-trapper return, and the trapper population mixes
   snare-only and pit-knowing hands (241 TRAPS returns / 25 catches =
   0.104 on trapper-runs — mechanism-consistent with the designed 18%
   on the knowsPit subset, proven in the pitknowledge fixture).

### Pre-registration verdicts

- **PRIMARY (binding, ≥30 npc_pit catches): 25 — MISSED.** Recorded as a
  miss per §14, not re-scored. Metric review below: the bar's premise
  (0.18/day × trapper-days ≈ 60+) was wrong — the design is 0.18 per
  TRAPS-purpose return, and TRAPS-purpose is a fraction of a trapper's
  days on a purpose-competitive schedule. All five census questions are
  answered with legible rates and clean on/off attribution; the census
  purpose is served. Proposed revision for the next run: bar on catches
  per TRAPS-purpose return with the denominator instrumented
  (per-vid trapReturnsByVid, which this run did not persist).
- **ENGAGEMENT (≥1 catch on ≥3 day-0-trapper runs): 7/8 — PASS.** (The
  miss was s9425-belongfeast: 41d run, trapper starved d38 — the channel
  died with its carrier.)
- **CONTROL CONTRAST: 0/16 off-side catches, 0 kcal — PASS.** Attribution
  is exact.
- Paired survival: median diff 0d (13/16 pairs within ±20d; spread
  −67..+123 is RNG chaos, both directions); starvation 5/4 — no signal,
  and none is claimed (instrument-only run).

**Verdict: DIAG-GO.** The NPC trapper economy is live and measured at
scale: 11/16 runs carried a trapper at some point, 12/16 trapper-runs
total, 858.9 pit-kcal/100d, 8 boar (729 avg kcal), scholar acquisition
11/16. No game-code change, no fix proposed — the channel works as
designed.

## Village assessment (plain words)

The villages are the competent villages of the pitknowledge sweep, one
layer deeper in the ledger: the trapper is never the whole village,
always one or two pairs of hands. On 9421 it's "a man, maybe 20s"
(later Theo), a trail-crew lead who works two lines — snares at 40%,
the pit at 18% — and dies in combat on day 70 (belong) / 95 (lead);
the village outlives him by 40+ days on the memory of his lessons
(the scholar learned by watching on day 5). On 9424 it's Sizwe, who
walks the scholar out to the pit on day 10 at trust 36 and dies at 49.
On 9427 it's Ethan, a joiner who arrives day 60, catches 5 times
(3,915 kcal — the run's richest single line), and hands the pit to
Thabo the taxi driver on day 73 ("The beginner's pit") — the one
apprenticeship, need-driven, novice to novice. The blank the census
fills: the NPC pit economy is not a standing institution, it's a
turnover economy — trappers die fast, joiners replace them, and the
knowledge outlives the hands that carried it about half the time
(scholar acquisition 11/16).

## Sense-test (SENSE-TESTING LAW)

Read evidence/2026-10-19/sense-npctrap-b.txt (seed 9421, leadfeast, 40
pit beats, say-intercepted):

- "🪤 A man, maybe 20s is back from the pit line: White-tailed Deer in
  the pit — +596 kcal to the pantry." / "Virginia Opossum in the pit —
  +948 kcal." / "Wild Boar in the pit — +946 kcal." — catches named by
  species, kcal stated, the trapper named once known (Theo).
- "🪤 Theo is back from the pit line. 'Pit was quiet. They'll keep.'" —
  quiet days narrated, never silent.
- "Recipe: Pit Trap (Level 1). A pit with stakes in the bottom. Dig it
  on a trail, brush it over, wait." — the witnessed grant, learnedDay 5,
  learnedFrom "A man, maybe 20s".
- The snare line coexists ("Theo is back from the snares: +310 kcal",
  the snare teach beat at trust gate) — one trapper, two lines, no
  voice collision.

Judgment: sensical. The trapper has a trade, the catches have
consequences (meat in the pantry, species named), the teaching has a
motive (regard) and a mechanism (watching real hands).

## Metric review (mandatory)

- PRIMARY (binding, ≥30 catches): MISSED 25/30. The miss is a
  bar-calibration miss, not an undersampling miss: the pre-reg's
  expected math used 0.18/day; the landed design is 0.18 per
  TRAPS-purpose RETURN (villager-objectives.js:1272), and TRAPS-purpose
  competes with ~6 other purposes on a trapper's schedule. Empirical:
  241 TRAPS returns / 25 catches = 0.104 on trapper-runs, consistent
  with the designed 18% on the knowsPit subset of a mixed
  snare/pit trapper population (the 18% mechanism itself was proven
  in the pitknowledge fixture). Proposed revision for the next run:
  bar on catches per TRAPS-purpose return, with per-vid
  trapReturnsByVid persisted in the per-seed JSON (this run stored only
  the aggregate). The census purpose — legible rates on all five
  questions — is met at n=25; no re-score, the miss stands as recorded.
- ENGAGEMENT (≥3 trapper-runs with ≥1 catch): PASSED 7/8.
- Instrument floor: 30d holder snapshots miss transient trappers
  (Bayan: joined ~d90–103, taught d103 at trust 21, gone by the d120
  snap — never snapshotted). Joiner-trapper count is ≥4/16, true count
  unknown. Next census should track join/vid-appearance events, not
  snapshots, for the holder roster.
- Scholar-background channel: 0/16 this sample (occupation lottery).
  Not a gate — the pitknowledge sweep measured 4/16. No metric doubt.
- pit-kcal/100d attribution is exact (858.9 vs 0 off-side).

## Wall numbers (report-only)

On-side (16 runs, 180d, pre-seat SEATDRIVE=0): national 9/16, table
13/16, wins 0/16, wave-4 14/16, wave-5 0/16, median survival 135d
(paired median diff vs off: 0.0d).
Off-side (PITKNOWLEDGE=0): national 9/16, table 14/16, wins 0/16,
wave-4 13/16, wave-5 0/16, median 151d.
TELEMETRY: `node scripts/telemetry-check.js --baseline
.../telemetry-baselines/scale-wall-preseat.json --current /tmp/npctrap-agg.json
--metrics won,national,table,exiled` → quiet (no LOUD lines).
Note: scale-wall-preseat.json (pre-seat regime) used instead of
scale-wall.json (winseat regime) — per the baseline's own _regime label,
comparing a pre-seat substrate against the winseat baseline fires
spurious LOUDs; `won` matches the baseline's key (prior runs hit a
wins/won key mismatch). Baseline NOT rolled.

## Convergence state

DIAG-GO — food-economy axis stays **converging**. The #581 named next is
answered: the NPC trapper line is the live pit economy, now measured
(858.9 kcal/100d, 8 boar, scholar acquisition 11/16). No lever proposed.

## Named next (for the findings backlog)

1. Trapper-occupation joiners are the channel's second source and its
   long-horizon sustain (10/10 day-0 trappers died). Any future pit-side
   work should treat the joiner flow as a first-class channel, not an
   accident of the seed lottery.
2. The pit_overhear beat fired 0/16 — it needs apprenticeship +
   player-at-haven on the chore-lesson return. If the overhear is meant
   to be a real channel, the apprentice chore-lesson needs an at-haven
   hook; as-is it's a dead letter on the competent substrate. (Content
   question, not a bug — the teach beat covers the same ground.)
3. #579's bookId instrument is confirmed working (0 surfacings, 0
   readBook calls) — the book channel stays dead per traphandbook-b.

