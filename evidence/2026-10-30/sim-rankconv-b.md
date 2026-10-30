# sim-rankconv-b — what converts standing into regional rank? (DIAG, backlog #1493)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261030T1130Z.
Axis: food-economy. Arm: sim-rankconv-b — DIAGNOSIS ONLY.
Zero src/js changes, zero policy-default changes, zero default flips.
Instruments/recorders only.
Base pin (prereg HEAD): fe1e46f53044453d864b195bb087929d05d993b6.
Prereg (committed BEFORE any judged leg): evidence/2026-10-30/sim-rankconv-b-prereg.md
(commit e578350e6; index-clobber variant hit on that commit — staged
deletions of byte-identical files — repaired via HEAD-blob cacheinfo,
verified `git status` empty and worktree hashes equal to HEAD blobs).
Master did NOT move under this run: HEAD at end is still e578350e6
plus this arm's own commits only; no rebase was needed.

## Answer first (plain words)

NOTHING in standing converts into regional rank. Standing and rank are
two different systems that happen to share a village:

- RANK comes only from played relationships: a player proposes a link
  (proposeLink / proposeCovenant / proposeTrade), the other village
  accepts or counters, the first bond ages 21 days, and the Regional
  Dawn fires (state.networkLive = true) — that flag IS regional rank
  (scaleRank() reads only networkLive / nationalLive / globalLive,
  hierarchy.js:2042-2048). National then needs a polity (3 seasoned
  subordinates, or a belong, covenant, or trade polity) + 30 days as
  regional + an ANSWERED national beat (stageNationalBeat /
  _checkNational). Refuse the beat and the scale is refused forever.
- STANDING feeds WAVE unlocks, not rank (villageStandingTotal, the
  number the unlock gate reads: t4 = 100, t5 = 200). Its diplomacy
  source counts only SEASONED REGIONAL+ links (standing.js
  _linkRegionalPlus) — diplomacy points presuppose the polity that
  rank also requires. Standing cannot manufacture rank; at most it
  rides along after rank exists. Standing's only rank-adjacent role
  is bidForPrimacy (standing ≥ 90% of theirs, SCALE.md), which flips
  an EXISTING subordinate link to primary — it presupposes a link.
- Under competent play, the chain never starts: the competent policy
  makes ZERO inter-village proposals on every seed measured (verb
  counts {} on all 21 seeds — no proposeLink, proposeCovenant,
  proposeTrade, answerAccord, answerNationalChoice, tendLink, or
  payTribute, ever). The villages it plays KNOW 3–6 other villages
  each and never court a single one. No link → no pending Dawn → no
  networkLive → rank village by construction, however high standing
  climbs. The region cannot rescue it either: _foreignPolitySim
  returns early unless networkLive is already true, so foreign
  polities (the BELONG road's precondition) are also 0 on every seed.
  All six roads to national are dead at step zero under competent
  play, except REFUSE — which is never even offered, because no
  national beat ever stages.

## The 9981 reproduction (exact)

Same seed, competent, 180d death-aware, current master. The wall face
reproduces EXACTLY, not approximately:

- Days 180 (cap), survived, rank village every one of 178 recorded
  days, max wave unlocked 3, Arc 3, table invited 0, entered 0, won 0.
- Standing trajectory (daily recorder): 0 through day 102, 25 on day
  103, 50 by day 110, 75 on day 159, 75 at day 160 and day 180.
  The wall's "75 by day 160" is the day-159 value, confirmed.
- Standing decomposition at end: total 75 = war 75 (3 wave-3+ ledger
  points × 25) + diplomacy 0 + plenty 0. Standing line, verbatim:
  "Standing 75 (war 75 · bonds 0 · bread 0) — wave 4 at 100, wave 5
  at 200". Gated total 75 (no deferral, no cap binding).
- Gate snapshot at end (the named blocking gate, from recorded state,
  not inferred from the numbers): links [] (zero active, zero ever —
  trajectory max linksActive = 0 on all 180 days), polityOf('haven')
  null, _belongPolity null, _covenantPolity null, _tradePolity null,
  _havenPolity null, networkLive false, networkLiveDay null,
  nationalLive false, globalLive false, _regionalPending null,
  pendingAccord null, accordUnanswered false, pendingNational null,
  scaleRefused false, foreignPolities [].
- Classification: NO-LINK, evidence fields as recorded above.
- DIAG-GO leg 1 satisfied: rank village at end AND standing ≥ 50
  reached (75).

## Fresh pilot band (8 seeds, 12311–12318) — DIAG-GO

| seed | days | end | rank | standing (war/dipl/plenty) | links | wave | blocker |
|------|------|-----|------|----------------------------|-------|------|---------|
| 12311 | 180 | survived | village | 140 (0/0/140) | 0 | 2 | NO-LINK |
| 12312 | 180 | survived | village | 95 (75/0/20) | 0 | 3 | NO-LINK |
| 12313 | 180 | survived | village | 225 (25/0/200) | 0 | 4 | NO-LINK |
| 12314 | 180 | survived | village | 70 (50/0/20) | 0 | 3 | NO-LINK |
| 12315 | 165 | village-lost | village | 170 (50/0/120) | 0 | 4 | NO-LINK |
| 12316 | 180 | survived | village | 125 (25/0/100) | 0 | 3 | NO-LINK |
| 12317 | 132 | village-lost | village | 235 (75/0/160) | 0 | 4 | NO-LINK |
| 12318 | 169 | village-lost | village | 345 (225/0/120) | 0 | 4 | NO-LINK |

Pilot wall: national 0/8, regional 0/8, table 0/8, wins 0/8, wave 4
4/8, wave 5 0/8, median survival 180 AT CAP, max 180.
Diplomacy is 0 on all 8 seeds; trajectory max links = 0 on all 8;
inter-village verbs {} on all 8; foreign polities 0 on all 8.
Seed 12313 passes the t5 standing bar (225 > 200) on feasts alone
and still sits at village rank — standing above both wave bars
buys waves, not rank. Seed 12318 reaches standing 345 with wave 4
unlocked and still never leaves village.
DIAG-GO leg 2 satisfied: every village-ranked pilot seed classified
with cited recorded gate fields (8/8 NO-LINK). Confirm authorized.

## Confirm band (12 seeds, 12401–12412) — pilot GO, same verdict

| seed | days | end | rank | standing (war/dipl/plenty) | links | wave | blocker |
|------|------|-----|------|----------------------------|-------|------|---------|
| 12401 | 180 | survived | village | 290 (150/0/140) | 0 | 4 | NO-LINK |
| 12402 | 180 | survived | village | 0 (0/0/0) | 0 | 3 | NO-LINK |
| 12403 | 140 | village-lost | village | 235 (75/0/160) | 0 | 4 | NO-LINK |
| 12404 | 180 | survived | village | 170 (50/0/120) | 0 | 4 | NO-LINK |
| 12405 | 180 | survived | village | 20 (0/0/20) | 0 | 3 | NO-LINK |
| 12406 | 127 | village-lost | village | 150 (50/0/100) | 0 | 4 | NO-LINK |
| 12407 | 180 | survived | village | 260 (200/0/60) | 0 | 4 | NO-LINK |
| 12408 | 33 | village-lost | village | 0 (0/0/0) | 0 | 1 | NO-LINK |
| 12409 | 180 | survived | village | 25 (25/0/0) | 0 | 3 | NO-LINK |
| 12410 | 43 | village-lost | village | 0 (0/0/0) | 0 | 2 | NO-LINK |
| 12411 | 180 | survived | village | 220 (100/0/120) | 0 | 4 | NO-LINK |
| 12412 | 180 | survived | village | 145 (25/0/120) | 0 | 4 | NO-LINK |

Confirm wall: national 0/12, regional 0/12, table 0/12, wins 0/12,
wave 4 7/12, wave 5 0/12, median survival 180 AT CAP, max 180.
Classification 12/12 NO-LINK with cited gate fields.

## Combined corpus (21 seeds: 9981 + pilot + confirm)

national 0/21, regional 0/21, table invited 0/21, entered 0/21,
wins 0/21, wave 4 11/21, wave 5 0/21, median survival 180 AT CAP
(14/21 survived to the cap; the median is the cap, not a death day).
Standing range 0–345; diplomacy 0 on 21/21; links 0 on 21/21 on every
recorded day; inter-village verbs 0 on 21/21; foreign polities 0 on
21/21. The wall snapshot's face (rank village 8/8, national 0/8)
reproduces on fresh seeds at 20/20 (pilot + confirm), and the
mechanism is now named instead of merely observed.

## Village assessment + sense read (SENSE-TESTING LAW)

Seed 9981, sample read around the standing jumps (sense leg:
evidence/2026-10-30/sim-rankconv-b-sense-9981.json — same seed,
deterministic re-run, day-stamped deaths + roster snapshots on days
30/60/100/103/110/150/159/160/180; day-1 snapshot missing because
the first daily hook fires on scholar day 2 — recorder limit, noted).

The village reads as people, not counters. Scholar chain, in order:
Rebecca Barbieri (day 30, trail crew, explorer) → Nia Price (days
60–103, lawyer, forager) → Pavel Dubinin (day 110, pilot, wanderer)
→ Omar Farouk (days 150–160, piano tuner, forager) → Tariq Mahmood
(day 180, electrician, forager). Scholar deaths, named and caused:
day 17 (wild), day 37 (wild), day 104 (wild), day 111 (contest —
Pavel Dubinin, the day after he took the mantle), day 161 (wild —
Omar Farouk, two days after standing hit 75), day 168 (wild — Raj
Patel). That is the wall's "five wild + one contest" chain exactly.
Standing jumps coincide with kill days, not with any social event:
day 103 (three monster kills, incl. paparazzo / redactor /
mirror_stag) lifts war to 25; day 159 (spool killed) lifts war to
75. The roster differentiates throughout — physical therapist,
baker, arborist, electrician, pottery instructor, mechanic, aquarium
keeper, HVAC tech; foragers, a wanderer, a homebody — with joiners
arriving (Khalid El Hassani, Nina Petrova, Nikos Papadopoulos,
Nathan Lee) and the wounded dying named ("a wound that wouldn't
close", days 22 and 57). Pantry never empties (9,246–24,853 kcal
across snapshots); starvation is absent from this village's story.

Robotic / static / repeated flags: NONE in this read. One honest
limit: the harness silences say/sysSay, so no villager dialogue
transcript was captured — the sense verdict here covers roster,
succession, deaths, and trajectory coherence, NOT dialogue quality.
The one thing that IS robotic about this village is not its people
but its foreign policy: six known neighboring villages, zero words
exchanged with any of them in 180 days. A village that knows its
neighbors, feasts, fights, buries its scholars, and never once
knocks on a neighbor's door is not acting like people at the
inter-village level — it is acting like a policy with no courtship
drive. That is the blank this diagnosis names; filling it (a
competent courtship drive, or a discoverable courtship path) is a
build decision for the coordinator/Steve, OUT of this DIAG arm's
scope — no game change is made here.

## Telemetry deviation check (same-run investigation)

  node scripts/telemetry-check.js --baseline
  hidden_files/telemetry-baselines/scale-wall.json
  --current 'evidence/2026-10-30/sim-rankconv-b-pilot-*.json'
  --metrics national,table,wins,exiled
Result: 3 LOUD lines (national 12 → 0, table 16 → 0, wins 16 → 0,
n=8 files); exiled clean. INVESTIGATED SAME-RUN: the KNOWN REGIME
ARTIFACT pre-stated in the prereg, not a regression — the baseline
is a WINSEAT regime baseline (full win-side win stack, WINPURSUIT=1,
SEATDRIVE=1), this arm is COMPETENT regime, and this arm's own gate
records show WHY the numbers are zero (no links exist at all), so
there is nothing to regress from. Baseline NOT rolled.

## Balanced panel (§15)

No panel compare is produced or claimed, honestly: a compare needs
a before/after pair and this arm is a single census state (DIAG
only). Comparing the census to itself would be a fabricated
artifact. The per-seed gate JSONs are this arm's census instrument;
the wall snapshot's panel (sim-wall-b-panel) remains the instrument
artifact for the reproduced leg.

## Proof

- scripts/test-rankconv-b.js --check: 7/7 classification fixtures
  GREEN (NO-LINK / DAWN-PENDING / UNSEASONED-REALM / NOT-BLOCKED /
  OTHER, incl. the accordUnanswered edge).
- Determinism gate: fresh child-process re-run of pilot seed 12311
  (evidence/2026-10-30/sim-rankconv-b-determinism-12311.json)
  reproduces the pilot row byte-equivalently on all 21 compared
  fields (days, endReason, rank, standing trajectory, link roll,
  gate snapshot, deaths, roster) plus endGate equality; only
  wall-clock ms differs (excluded from the comparison).
- No src/js changed, so no game test suite is implicated; no jest
  was run concurrently with anything (no jest at all — this proof
  is node scripts, not a jest suite). Stated, not hidden.
- Freshness: pilot seeds 12311–12318 and confirm seeds 12401–12412
  were verified absent from evidence/2026-10-30/*.md before the
  prereg, and the recorder refuses to overwrite existing outputs.

## Convergence state

DIAG-GO. Backlog #1493 is ANSWERED (not merely re-observed): the
blocking gate is NO-LINK on 21/21 seeds, and the named answer is
"nothing in standing converts to regional rank — proposals convert
to links, links aged 21 days convert to regional via the Dawn, and
a seasoned polity plus an answered beat converts to national."
Whether competent play SHOULD court (policy gap vs. design intent)
is a separate, still-open question for the coordinator/Steve — this
arm does not rule on it and does not change it.

## Out-of-scope findings (LISTED, NOT chased — coordinator appends)

1. COMPETENT HAS NO COURTSHIP DRIVE: competent.js contains no
   proposeLink/proposeCovenant/proposeTrade call; dedicated
   link-drive policies (fourthlink, killroad, leadcourt, belongseek)
   exist but competent never uses them. Is competent play supposed
   to court, or is courtship a winseek-only activity by design?
   Steve-call (design intent), then a build arm if the answer is
   "competent should court".
2. FOREIGN-POLITY CIRCULARITY: _foreignPolitySim returns early
   unless networkLive, so the BELONG road's precondition (a foreign
   polity of 4+) cannot form until Haven itself is already regional.
   Under a no-link policy the region never climbs at all — the
   off-screen world is gated on the player's own first Dawn.
   Design question, not a bug claim: is that the intended shape?
3. STANDING 345 WITHOUT RANK (seed 12318) and standing 225 on
   feasts alone past the t5 bar (seed 12313): standing's wave
   unlocks and rank are fully decoupled in the player's experience
   — a village can out-earn the t5 bar and still be a village.
   If the System ever narrates standing as "renown", the fiction
   will lie about rank. Wording/beat question for a future arm.
4. Sense-leg recorder limit: day-1 roster snapshot missing (first
   daily hook fires on scholar day 2). Cosmetic; future sense legs
   should seed the day-1 snapshot from setup instead of daily.

## Metric review (§14 — required section)

- Pre-registered metrics bound the run; no re-scoring occurred.
  DIAG-GO was judged against the prereg's three legs (9981 face,
  100% pilot classification with cited fields, named answer) — all
  three met. The confirm band ran only because pilot DIAG-GO held,
  per the prereg.
- Metric issue 1 (carried from the wall run, confirmed here):
  sweep-compare `table` counts invitations, the panel counts
  sittings. This arm quotes invited + entered as a pair (both 0
  here, so the distinction is moot for these numbers but the
  habit is kept).
- Metric issue 2: four-realm formation is NOT tracked by this
  recorder either — polity SHAPE is recorded (null on all seeds),
  which is the closest honest field. Do not relabel shape-null as
  "four-realm 0" without a definition; this file reports shape.
- Metric issue 3: runDays `deaths` counts monster deaths alongside
  villager deaths (pilot: 143 monster:combat + 72 villager-combat
  monster kills vs. a small villager-side remainder). Wall numbers
  in this file split them in prose where quoted; the analyzer's
  raw death table is the un-split stream and is labeled as such
  in the script's output context.
- Metric issue 4: median survival AT CAP (180) is censored — 14/21
  runs reach the cap. Labeled AT CAP wherever it appears.
- No metric revision is applied to this run's numbers. All
  revisions above are proposals for the NEXT run.
