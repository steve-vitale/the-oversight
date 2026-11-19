# Journey-scale r243 — scale leg, raise-accept echo fix (Lane A)

- **Run:** r243, Lane A, scale leg (days 80–140), scheduled Wed 2026-11-18 17:45 CST (23:45 UTC). Run ID `2026-11-18T23:45:00Z-lane-a-scale-r243`. Rotation read `3` (scale, queue-jumped again — the tableActive work just landed; r242's closeout claimed 3→0 but the file read 3 at this run's start). Write 3→0 at closeout on success.
- **Base:** local master `046ae5859` (ship `ac1b82736-20261118-232437`, live-verified on both endpoints). Worktree `~/workspace/worktrees/journey-scale`, branch `journey-scale`.
- **Policy (frozen):** `scalecourt-traderoad-r113-linkraise-sit` + muster ON + march ON + `MUSTER_HOLD=sitting` + `STAGE_CAPSTONE=off` (natural history; stage retired now the tableSitting fix landed). Sortie INERT. SIT false. DAYCAP=140, death-aware stop (+10d tail max).
- **Seeds:** FRESH 103851–103858 (freshness search: 0 hits in all preregs; repo-wide hits only JSON data values, same caveat as r239). Single arm (the fix is in the base, so no A/B).
- **Prereg:** `evidence/2026-11-18/journey-scale-r243-prereg.md`.

## Q1 — THE BLANK: RAISE-ACCEPT ECHO FIX — GO (the fix lands)

The defect (r242 Q4, 13/13 on the band): when the player accepted a villager's
proposal to link with another village, the NPC answered by repeating the
player's own choice label verbatim — `YOU: "All right. Let's ask them."` →
`THEM: "All right — let's ask them." You carry the proposal to X.`

**The fix** (`src/js/bond-initiation.js`, landed in commit `e4ad4ec16`):
new `linkAcceptLine(vid, villageId, villageName)` — voiced accept lines keyed
to the lore `how` already used by `linkRaiseLine` (`visit` / `seen-nearby` /
`rumor` / `told` / default), 2 lines per `how`, `{V}` = village name
interpolated. Pool entries are COMPLETE lines (quoted speech + carry
narration) so the first-unledgered pick via `convoRunLedger` compares the
same string `sayLine` ledgers (the `declineLine` precedent). The carry
("You carry the proposal to X.") stays narration, never quoted speech, per
`docs/CONVERSATIONS.md`. `acceptLinkRaise` returns an additive `line` field;
`bondTurn` `link:accept` uses it with a voiced fallback. Lore tell,
`proposeLink`, telemetry, cooldowns, and the player's choice label are
byte-identical.

**Proof:**
- Unit proof `scripts/test-link-accept-voice-20261118.js`: **61/61 GREEN**
  with the fix; **RED pre-fix (27 passed, 11 failed, verified twice via
  `git show HEAD:` swap)** — including the routing failure showing the exact
  parrot line. Covers per-`how` staged raises, the default pool, no-pending
  paths, bondTurn routing (LAST THEM entry must be the voiced line — an
  any-entry read was found vacuous pre-fix and tightened), and the ledger
  pick (seed the first line's key → second line differs).
- Panel (same detector on both bands): **ECHO now 0 echoes / 9 accepted
  talks (16 raisetalk files)** vs **ECHO before 13 echoes / 13 accepted
  talks (19 files)** on r242. **Q1 ECHO VERDICT: GO.**
- **Q1 spoken-raise guard still passes:** 16 raise talks — 9
  properly-answered, 0 counter, 0 not-offered-spoken (DEFECT), 7
  not-offered-unspoken (correct hold), 0 failed/error. **SPOKEN-RAISE
  VERDICT: GO.**
- Landing rule met (proof GREEN + panel 0 echoes + guard GO + ≥1 accepted
  talk), so the fix stays in the branch and lands with this run.

**Analyzer note (fixed in-run, see Metric review):** the ECHO
before-measurement first read 0 r242 files — `countEchoes` globbed r242's
corpora under this run's seed numbers. Fixed to glob r242's own seeds
(103841–103848); proof test `test-journey-scale-r243-analyzer-20261118.js`
updated (case 55 fixture moved to seed 103841) and re-greened 126/126; the
analyzer re-run then read the before-line correctly as 13/13.

## Q2 — NATIONAL / DEED GATE (measurement, not a gate): 0/8 national

No village reached national, opened the deed gate, was offered the table, or
took a seat by d140. Every seed's blocker is the same wall — the LEAD road
needs more seasoned links:
- 103851: LEAD 0/3 seasoned (2 active) — needs 3 more. 103852: COLLAPSE d125
  (LEAD 2/3, COV 0/3, TRADE 0/3). 103853: LEAD 1/3 (1 active) — needs 2.
  103854: LEAD 1/3 (2 active) — needs 2. 103855: LEAD 2/3 (5 active) —
  needs 1. 103856: LEAD 1/3 (2 active) — needs 2. 103857: LEAD 2/3 (2
  active) — needs 1. 103858: LEAD 2/3 (2 active) — needs 1.
- Tribute: 103855 DELIVERED military_tribute d92 (ready d90, 2 attempts, 1
  veterans-short) — delivery did not open national (LEAD still 2/3).
  103858 READY-UNPAYABLE (ready d84, 26 attempts, all veterans-short).
  Other six seeds NEVER-READY.
- Lesser seat priced 8/8 (bar ≥4/8): HOLD. All eight villages hold the
  lesser seat (d38–d47); none reaches the full seat.

## Q3 — REGRESSION GUARDS (all HOLD/GO)

- Vetbar: **GO** (0 disagreements on all 8 seeds; phantom-days lists on
  103855/103856 are the known phantom-reading pattern, disagreements 0).
- Lived-days: mean 138.9 (total 1111 over 8 seeds) vs control 123 (+12.9%,
  guardrail ±25%): **HOLD**.
- Trap-line: 2 sittings, 2 answered, 0 defects: **HOLD**.
- Betrayal sibling: 3 turn-0 offers, invite label in opening on all 3,
  0 defects: **HOLD**.
- Nod-loop: 0 sittings with a ≥4 identical `nv:` react streak (worst 3x):
  **HOLD**.

## Q4 — PEOPLE CHECK (read in full)

All 16 raise talks + 2 full transcripts (103855 d120, 103858 d90) + the
nonverbal sittings. The fix works in the wild: all 9 accepted talks end
with the voiced line — `"Good. What I've heard of them, I believe. Go and
ask." You carry the proposal to X.` — the NPC answers in their own words.
One observation (not a defect): **the same voiced line appears 9/9** — the
pool has 2 lines per `how`, but every fresh run opens with the same first
pick, so the band never exercises line 2. Within a run the ledger would
rotate on a second talk; across runs it does not. See Metric review.

- **Raj (103855, d120 + d125):** the best talk in the band. A real
  conversation about missing hot meals and Ahmedabad mornings, the raise
  woven in naturally — and d125 follows up on it ("You missed a real hot
  meal. Soup, you said — with a spoon. Any of that turn up?"). Continuity,
  callback, meaning.
- **Nagisa (103853, d14–d21):** six straight days of not-offered talks with
  a Japanese-only speaker — the correct hold (no shared language, no raise
  offered), and the mime content is lovely and varied (a walking figure
  drawn in dirt, a held-up finger, a sleeve taken gently). Not a filler
  loop: each day's mime differs.
- **Aria (103858, d90):** opens with a real want — she's hungry, asks for
  food. The player promises to help; she pivots to the trap-line walk, the
  player goes, she presses a kept tool into their hand. The want advances
  stage 1→3, a promise is owed, a thing changes hands. The bar, met.
- **Henry (103855, d120):** "Panic is a luxury. I deal in what's next." A
  quiet cache-spot beat, then two teaching exchanges (Staghorn Sumac,
  Greenbrier Shoots) with distinct reactions. Resolves cleanly.
- **Shanice (103858, d12):** after the accept, "There's still the matter
  of the ambush of Olivia. Nobody's settled it." — an unresolved thread
  planted right after a resolved one.

## Q5 — CENSUS + SPOTTER + W5-INSTANCE

- Survival: 7/8 villages alive to d140 (103852 over d125, 11 deaths).
  End populations 6–8. Deaths 5–14 per seed; the wild is still the biggest
  killer (4–6 per seed), then monsters, the arena, strangers.
- Wave-4: 75 fights, 23 kills across the band (kAttr). Best: 103858, 7
  kills. Worst: 103857, 0 kills (6 fights).
- Wave-5: 103855 fought 1 (scholar, fresh full-HP editor — SUCCESSIVE).
  103858 fought 90 (59 scholar, 31 field — MIXED, 4 recurring lingerers,
  16 wild fingerprints). The other six seeds fought 0.
- **The door question stays open:** no village FACED the door on any seed
  (`door=-` everywhere) — the wave-5 fights are roaming beasts, not the
  door. Same as r242.
- Spotter: every seed has exactly 1 villager with spotter foodXp at d90
  and at end — the wiring is alive, the skill stays rare.
- Muster: 4 called, 3 titans slain, 2 committed Haven blades died (the
  price, read against the kill gain). March: 3 slain on-march, 0 off-march.
  Coalition shortage (`short:*`) is still the usual reason a muster never
  fires (255 held rows) — and `absent` (130) the other.
- Sortie: 0 lingerer days, 0 sorties — INERT as configured.

## Q6 — DIALOGUE WATCH (carried, record only)

The r239 "tell me more" shape: 7 occurrences across 5 transcripts, every
one answered with a DISTINCT, meaningful line — no echo of the prompt, no
repeated line. The 103852 grief sequence even deepens on the second ask
("I greet everyone by name each morning for Ivy, now."). No Q6 echo shape
on this band.

## Village assessment (plain words)

Eight villages, all regional, all holding the lesser seat, none national.
They are alive and busy — hunting, linking, teaching each other what grows
where — but they stall one seasoned link short of the next rung, and the
stall is structural: the LEAD road needs three seasoned links and the band
tops out at two. One village (103855) even delivered its tribute and still
couldn't climb. One village (103852) collapsed under the fighting. One
(103858) lived in a storm of wave-5 beasts — ninety fights — and survived
it, which says the fighting works and the people hold together. The
conversations are the healthiest part of the leg: villagers ask for real
things, remember what you told them, and answer a proposal in their own
words now instead of parroting yours.

## Reachable / fun / winnable

- **Reachable:** the raise-accept content fires (9 accepted talks) and the
  fix is visible in ordinary play. The national rung is not reachable on
  this band — 0/8, all on the same seasoned-link wall.
- **Fun:** the people are fun — Raj's soup, Nagisa's mimes, Aria's owed
  meal. The fighting holds up (103858's ninety wave-5 fights didn't break
  the village). The stall is the dull part: a village one link short for
  sixty days with nothing new to try.
- **Winnable:** not from here. No deed gate opened, so no table, no seat.
  The winnability chain still stops at the same place: seasoned links.

## Gate and telemetry

- **Gate:** `node scripts/check.js --quick` — **337 passed, 7 failed in 1310s** (`journey-scale-r243-gate.log`). 0 failures attributable to this run's change. Five are the known pre-existing failures, identical to r242's gate: the stale balance-proof pair (`test-measurement-proof-update`, `test-measurement-workflow`), the phone-frame receipt staleness (`test-phone-frame-proof`), and the 2 deed-attainment 120s timeouts (`test-living-garden-deed-attainment`, `test-one-person-army-deed-attainment`). Two more are 120s TIMEOUTs that are load artifacts, not assertions: `test-trust-observer-neutrality` (120.0s) and `test-capable-bot-20261014` (120.2s) — a sibling agent ran its own `check.js --quick` concurrently from 00:47Z, starving the box (my gate took 1310s vs r242's 752s; r242's log already had trust-observer-neutrality as 3rd-slowest at 115s, just under the timeout). Both were re-run solo after the gate: **both green** — trust-observer-neutrality 1 passed in 42s, capable-bot 1 passed in 39s. The r242 ladder-bundle failure flipped green this run.
- **Telemetry:** one LOUD line, adjudicated, baseline NOT rolled
  (r239/r242 precedent — provenance unrecoverable): `maxGameDay` 468 → 1111
  (+137%, n=8 files). The baseline is a 4-file sum (117/file) from an
  unknown band; the current is 8 files (139/file). Per-file the move is
  +19%, inside the lived-days shape (+12.9% vs control) — a file-count
  artifact, not a bug. `fightsTotal` and `fightsByWave.4` did not flag.

## Metric review (§14 — for the NEXT run)

1. **Analyzer before-measurement seed glob (fixed in-run).** `countEchoes`
   globbed r242's corpora under this run's seed numbers and printed a 0/0
   before-line. Fixed: the before-detector now takes r242's own seeds
   (103841–103848); proof-test case (55) fixture moved to seed 103841;
   proof test re-greened 126/126 and the analyzer re-run reads 13/13.
   Rule for the next run: a before-measurement that reads 0 files must say
   "unavailable", never 0/0 — the current line still prints 0/0 when the
   corpus is missing, which reads as a measurement.
2. **Accept-line pool variety.** The fix's pool has 2 lines per `how`, but
   the band shows the same line 9/9 — every fresh run opens with the same
   first pick. The ledger rotation is proven by the unit test (a second
   talk in a run would differ), but cross-run variety is unproven. Next
   run: either seed the first pick per run or record how often line 2
   fires across the band.
3. **The national wall is now the finding, three runs deep.** r239: 2/8
   national. r242: 1/8. r243: 0/8 — and all eight blockers name the same
   LEAD seasoned-link shortage (closest road needs 1–3 more). The deed
   gate never opens, so its timing discriminator (r239 103825 vs 103828)
   is unmeasurable on this band. The next scale run should either carry a
   lever for seasoned links or say plainly it is measuring the wall again.

## Closeout

- Build commit `e4ad4ec16` (prereg + fix + proof test + driver + analyzer +
  analyzer proof test). Safe-commit index clobber struck (committed files
  showed staged-as-deleted); repaired with `git ls-tree -r HEAD | git
  update-index --add --index-info`; status + diff HEAD verified empty.
- Analyzer fix commit `e420c8200` (analyzer + proof test).
- Run-note commit: [RUN-NOTE-COMMIT].
- Merged locally, pending ship (ship loop owns bump/push/live verify).
- Rotation 3→0 written. Lock deleted after run_id verification.
