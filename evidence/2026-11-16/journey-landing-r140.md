# Journey landing r140 — run note (2026-11-16)

Lane A leg 0 LANDING. Run `loop-a-20261116T204405Z`, scheduled 14:45 CST.
Base master `7bb50f3dc` (sim-winnability-round-1730). Seeds 1172–1181, 28d,
r140 driver (r139 driver verbatim except header/seeds/OUTDIR + phantom-line
detector). BEFORE corpora `landing-r140-before` (seeds 1172–1175), AFTER
`landing-r140-after` (seeds 1172–1181), both under the goal hidden_files
evidence dir. Prereg: `journey-landing-r140-prereg.md`.

## Q1 — regression watch on post-r139 master + F1 heed fix: FIX VERIFIED, TWO BAR MISSES

The run's question: does the post-r139 master (succession r224 F4 dry-line
fixes, endgame r225 F5 settled-favor variants, establishment r225 stage-0
want fix, social-life r226 F6 dry-opener guard; trickteach + gatelever
levers net zero) hold the landing bars, and does the r139 F1 fix hold?

### Binding bars

| Bar | r140 | Verdict |
|---|---|---|
| M1 10/10 alive d28 | 10/10 | PASS |
| M2 System contact 10/10 by d9 | 10/10 (d8–d9) | PASS |
| M3 fight-log 0 unknown/mixed | 0 unknown (17 fights, 3 zero-DMG all classified) | PASS |
| zero-DMG invariant | PASS (3 zero-DMG: B-shape 1, S-struck-0-dmg 1, no-strikes 1) | PASS |
| practice movedCells ≥50, seedsWithMove 10/10 | 89 cells, 10/10, skill0→pos 71 | PASS |
| pocket watch 0 pocket fights / 0 stuck turns | 0 / 0 | PASS |
| D1 garbled labels | 0 | PASS |
| HEED-V verbatim filler loop | 0 | PASS |
| M-PR1 max per-seed never-offered ≤1 | **2** (seeds 1174, 1181) | **MISS** |
| personal/small bridge 0 repeats | 0 / 0 (personal 30 servings, small 4) | PASS |
| presshop farUnreached | 0 (reported only) | — |
| R66 starvation deaths 0, starvingWarnings 0 | 0 / 0 | PASS |
| amnesia 0, Miriam "That's settled" 0, fellBack 0 | 0 / 0 / 0 | PASS |
| nodloop LOOP=0 | 0 (109 sittings) | PASS |
| verbatimRepeats 0 | 0 (3 exempted, all spot-checked genuine re-poses) | PASS |
| **scholar deaths ≤1 per 10-seed panel** | **2** | **MISS** |
| **silentTurns 0 on AFTER** | 0 | PASS |
| fleeStuckTurns / closeStuckTurns | 1 / 0 | — (see below) |

### FINDING F1 (r139) — fixed and proven on the panel

The defect: warn_you sittings went silent — the player picks "I'll be
careful", the NPC cycles 3 ack lines, then `sayLine`'s no-repeat ledger
blocks the 4th+ pick and the heed handler passed no fallback, so the turn
spoke nothing and the want stalled at stage 2.

- BEFORE pilot (seeds 1172–1175): reproduced live — Nino, seed 1175 d12:
  6 heed picks, 3 spoken, 2 silent, 1 wind-down dismissal; want final
  stage 3 resolution=`engaged` (never `heeded`). `silentTurns: 2`.
- Fix 1 (`src/js/convo-dialogue.js`, dlg:heed): heeds 1–3 keep the 3 ack
  lines + lazy fallback; heed 4+ deepens via `convoPickCycle` (5 variants —
  fear said out loud) and resolves via `convoWantEngage(vid, 'commit')` →
  resolution `heeded`, closeLine "Good. Just — be careful. I mean it."
- Fix 2 (`scripts/policies/competent.js`, R140 BUDGET STOP): `closeStep`
  and `beastStrikeTarget` break when `(p.moveLeft || 0) <= 0` — no
  `tbPlayerMove` call on a spent budget.
- Proof tests (both RED pre-fix, GREEN post-fix):
  `test-landing-r140-heed-deepen-20261116.js` 11/11 (exactly 4 heeds,
  0 silent, heed 4 is a deepen line, stage 3 / `heeded`);
  `test-landing-r140-close-budget-20261116.js` 14/14 (moveLeft 0 → 0
  `tbPlayerMove` calls, returns `stuck`; moveLeft 3 controls still move;
  moveLeft 1 → exactly 1 call). Existing
  `test-journey-crisis-r182-warn-details-20261112.js` passes 12/12 on the
  fixed code.
- AFTER pilot (same 4 seeds): `silentTurns` absent (= 0). First diverging
  day-line seed 1175 day 13 only (the day after the Nino sitting); seeds
  1172–1174 bit-identical. Nino AFTER transcript: heed 4 deepen spoken,
  want stage 3, closeLine "Good. Just — be careful. I mean it." spoken,
  `want final: warn_you stage=3 resolution=heeded`, 0 silent flags.
- Full panel: 2 warn_you sittings (Nino 1175-d12, Dmitri 1178-d10), both
  resolve `heeded` at stage 3; 0 silent turns anywhere; Q1 dialogue
  counters all 0 (D2 0, D3 0, HEED 0, HEED-V 0, WARNED-BUT-UNRESOLVED 0,
  D1 0). **F1 is fixed.**
- The phantom-line detector (driver-only) fired exactly on the 2 F1 turns
  in BEFORE and on nothing in AFTER — it works, and the panel proves the
  fix, not the detector, silenced them.

### BAR MISS 1 — scholar deaths 2/10 (bar ≤1, binds from r140)

- Seed 1172, Devon (gen_9zu69jw), d27, cause "contest" (contestId
  "drop", participants Devon, Pauline, Gianna). popSeries IDENTICAL
  before/after — pre-existing, not fix-caused.
- Seed 1176, Klaus (gen_lscvbxw), d15, cause "betrayal" — killed by a
  villager plot, not a contest or a monster fight. Fresh seed, no BEFORE
  comparison. Both deaths resolved within the panel (unresolved=0) —
  succession happened.
- Series: r136: 0, r137: 2, r138: 2, r139: 1, r140: 2. The ≤1 bar fails
  3 of 5 panels. Per §14 metric binding this run is NOT re-scored; the
  miss is recorded honestly and a bar review is proposed below.

### BAR MISS 2 — M-PR1 max per-seed never-offered 2 (bar ≤1)

Commit-offer analyzer (25 sittings): offered 18, picked 18, promised 14,
stated 4, never-offered 3. Per seed: 1172: 0, 1173: 0, 1174: **2** (d8,
d9), 1175: 0, 1176: 1 (d14), 1177: 0, 1178: 1 (d7), 1179: 1 (d8),
1180: 0, 1181: **2** (d12, d15). r139 passed at max 1 (2 never-offered
total); r140 has 3, clustered two-per-seed.
Adjudication: not plausibly fix-caused. None of the never-offered
sittings is a warn_you sitting (the fix touches only warn_you heed
handling + fight close/budget); seed 1174 is bit-identical before/after,
so its 2 are provably fix-independent; 1181 has no warn_you sitting at
all. Band variance in the offer's availability logic. Metric review
below proposes the bar question.

### Watch items (reported, not binding)

- **Hungry at horizon 6/10** — same as r139 (r137/r138: 4/10). r104
  HORIZON PANTRY: hungry seeds at 551, 804, 823, 1116, 1137,
  1836/person; fed 4/10. The collapse pattern recurs; lever work
  candidate (carried).
- **Favors broken 5 vs kept 4** (promised 14). r139 was 4 vs 1 — the
  break-ahead pattern holds a second panel. Watch, not yet a trend call.
- **Fights 17** (fightsSeen; r139: 21 vs 12 open question carried —
  matched-band A/B still owed). Flee/dodge/close: fleeStuckTurns 1,
  dodgeStuckTurns 0, closeStuckTurns 0. The 1 flee-stuck turn is the
  flee-WALK path (`competent.js` fleeWalk, ~line 2401: no candidate tile
  moved the player, fight still live) — NOT the close path the R140 fix
  touched, same count before/after, never hit the 3-turn fleeBlocked
  threshold. Confirmed before writing this note.
- **Presshop**: attempts 119, pressFailTotal 1 (seed 1181 Miguel:
  "Nothing came of that press. This patch has nothing left to give
  right now" — an honest empty-patch fail; the favor was kept anyway,
  630 of 1260 delivered). farUnreached 0, hopReached 36.
- **Bridges**: personal 30 servings / 0 repeats; every pool 0 repeats
  (grief 3, goal 1, village 5, plans 8, gossip 1, small 4, cheer 0,
  past 0). The Olivia repeat did NOT recur on this panel.
- **Practice**: 89 moved cells, 10/10 seeds, skill0→pos 71.
- **Hunt**: 251 kills, 20 reps, max 4 — H0-ESTABLISHED holds (first rung
  8 reps still out of reach in 28d).
- **Contests**: 23 fired, 22 ended, 1 open, 0 orphan ends,
  deathsWithContext 1, deathsMissing 0 — GO.
- **Flesh**: CHANNEL OPENS — arrivalSeeds 7/10, testSeeds 10,
  exitSeeds 5, stuckSeeds 2, openSeeds 5, noArrivalUntested 0.
- **Verbatim**: 0 repeats; 3 exempted, all spot-checked as genuine
  re-poses (1176-d8 "What do you miss most? From before.", 1177-d7
  "Have you ever hurt someone? Since all this started.", 1180-d5
  "I've been turning something over. What do YOU think actually
  happened to us?" — each resume x1, opener rule, a deliberate return
  to an unfinished question).
- **WANT ENGAGEMENT**: curious 76, ask_favor 25, none 5, warn_you 2,
  seek_comfort 1. Forage trips 624. 0 "SILENT TURN" lines in the full
  log.

## Village assessment (plain words)

Ten villages, all alive at day 28. The System reached every one by day
8 or 9. People are dying the way this world kills: 16 villager deaths
across 8 of the 10 villages — monsters took 6, ambushes 4, wounds that
wouldn't close 3, and one each to a contest, a betrayal, and sickness.
Nobody starved. Two villages lost their scholar mid-panel (Devon to a
contest on day 27, Klaus to a betrayal on day 15) and both found a
successor and kept going. Two villages lost nobody at all. The pantry
is the standing worry: 6 of 10 villages end the fortnight with less
than 2000 calories per person in store, two of them under 850 — the
same collapse shape as the last three panels, and nobody in the
villages is fixing it. Favors mostly stay open (23 of 32), and slightly
more break than hold. The monster-meat channel is open everywhere it
needs to be: 7 of 10 villages got monster flesh in, all 10 tested it,
5 got it into the pantry. People are learning to fight (89 practice
cells moved, 71 skills lifted off zero) and 251 monsters died to
villager hands — but the kills don't yet turn into wave-4 readiness.
The villages survive the fortnight. They do not yet look like they
will win the year.

## People check (Q2) — 5 full transcripts read

Both warn_you sittings + all three resume-take sittings. All five read
as people, not menus. No fabricated shared history in any of them. No
drift-note tail quoted as memory anywhere in the corpus.

1. **Nino, 1175-d12 (warn_you)** — PASS. Heeds 1–3 are the three ack
   lines; heed 4 deepens ("I mean it. I've watched people walk out
   sure and not walk back. Don't be the next one I have to stop waiting
   for."); want stage 3, resolution `heeded`; closeLine "Good. Just —
   be careful. I mean it." spoken. 0 silent turns. (Read in the pilot
   and re-confirmed on the AFTER corpus.)
2. **Dmitri, 1178-d10 (warn_you)** — PASS. Same clean shape, trust 73.
   Closing line "Do try to stay alive. The paperwork otherwise is
   murder." — dry, in character, and it lands because the warning
   before it was real.
3. **Aria, 1176-d8 (curious, resume-take)** — PASS. Aria asks what the
   player misses most; the player deflects twice and the shutters come
   down visibly ("Okay." Something shutters, just slightly. / "Fine."
   Their face closes like a door.). The player wanders off, then comes
   back — "We never finished — what you miss most." — and Aria re-asks
   the question. The re-pose is a genuine return, not a loop. Wind-down
   lands: the beast-naming debate, "I have opinions about the name. I
   am saving them for when they count."
4. **Maya, 1177-d7 (curious, resume-take)** — PASS. The hard question —
   "Have you ever hurt someone?" — asked twice because the player
   dodged it twice, and the second dodge kills it for good: "Right."
   They look away, and the question dies where it stood. That is a
   consequence, not a loop. The gift-memory thread ("About what you
   brought me...") shows the sitting remembers a real prior exchange.
5. **Daniyar, 1180-d5 (curious, resume-take)** — PASS, best line of the
   panel. A low-trust (18) villager on day 5: "Rest. My plan is rest.
   I've been running on fumes since we got here and my body keeps
   score." "Honestly? 2 people are injured; there's tension about
   who's in charge." And: "If I may — I used to complain about Almaty,
   Kazakhstan traffic. I'd kill for traffic. Orderly, honking traffic."
   A real place, a real feeling, a person.

**Lead-in nit (observation only, recurs):** "Good question." opens
topic answers twice in the Daniyar sitting and once in Aria's — the
r139 nit is still there. The answers differ, so no verbatim repeat —
but the ear hears the same hinge three times in five minutes. Worth a
look when the bridge pool gets its per-sitting memory (carried).

## Q3 — telemetry

`node scripts/telemetry-check.js` vs
`telemetry-baselines/landing-split.json`:
**one LOUD line — investigated, explained, baseline NOT rolled.**
Current aggregates vs baseline: systemDay 82 (81), villagerDeaths **16
(9, +78% — LOUD)**, monsterKills 251 (217, +16% — quiet), folTelemetry
fires 12 (15 — quiet), starvAutopsies 0 (0).
- The 16 deaths spread across 8/10 seeds (1172: 3, 1173: 1, 1174: 2,
  1175: 1, 1176: 2, 1177: 2, 1178: 2, 1179: 3; 1180/1181: 0). Causes:
  monster 6, ambush 4, wound 3, contest 1, betrayal 1, sickness 1.
- 13 of the 16 sit on seeds the fix cannot have touched: 1172–1174
  are bit-identical before/after, and 1176/1177/1179/1180/1181 have no
  warn_you sitting while the budget fix is in-game neutral
  (spent-budget moves were refused no-ops). On the matched 4-seed
  comparison the fix's total death effect is +1 (1175: 0 → 1, a
  monster death at d27 on a re-rolled stream) — a re-roll outcome, not
  a directional effect.
- Verdict: fresh-band composition variance against an r136 baseline
  from a different band — the same family as r139's monster-kills
  +32% move, which was also not rolled. No regime change; baseline
  stays.

## Q4 — gate

`node scripts/check.js --quick` (worktree,
`--cacheDirectory=/tmp/jest-cache-playtest`): **330 passed, 10 failed
in 1535s** (r139: 334/6 in 807s). The gate ran nearly twice as long —
the box was loaded; 5 tests hit the 120s cap.

Standing 6, identical files/messages to r139:
- `test-measurement-proof-update.js` + `test-measurement-workflow.js`
  — measurement-proof staleness pair ("Proof source inputs are not
  current" / "retained neutrality proof covers the current
  Game/controller/harness inputs"). Refresh owed via
  `scripts/balance-proof-update.js` (maintenance, not this run).
- `test-phone-frame-proof.js` — phone-frame receipt staleness (3
  fails, same messages as r139). Refresh owed via
  `scripts/phone-frame-proof-update.js`.
- `test-living-garden-deed-attainment.js` +
  `test-one-person-army-deed-attainment.js` — both hit the 120s
  check.js cap (load timeouts under 4-parallel jest).
- `test-ladder-bundle-20261108.js` — same control fail (200 monster
  turns WITHOUT delivery fire the ambient raid — fires 0).

New 4, all adjudicated NOT attributable — every one passes standalone
on this tree, run sequentially after the gate:
- `test-measurement-cache-flags.js` (0/4 in gate → 4/4 standalone) —
  the documented box-load artifact (AGENTS.md 2026-11-12: gate 0/4,
  standalone 3/4, 4/4 on a quiet box).
- `test-occupation-panels.js` (120s timeout → 25/25 standalone).
- `test-trust-observer-neutrality.js` (120s timeout → 6/6 standalone).
- `test-synergy-stall.js` (120s timeout → exit 0 standalone, 103
  ability_granted events). This one requires the changed
  `competent.js`, so its standalone pass is the direct proof the R140
  budget stop didn't break it.

**0 attributable to this run's change.** None of the six standing
failures references any file this run changed, and the four new ones
all clear standalone. Proof tests re-run fresh on this tree just
before commit: heed-deepen 11/11, close-budget 14/14, warn-details
12/12.

## Metric review (proposals for r141, nothing binds this run)

1. **Scholar-death bar ≤1 — REVIEW.** Series r136: 0, r137: 2, r138: 2,
   r139: 1, r140: 2. The bar fails 3 of 5 panels, and the deaths are
   heterogeneous (contest, betrayal, monster, ambush — no single
   cause to fix). Candidates: (a) the bar is mis-set — landing
   fortnights are lethal by design ("a lot of people dying is
   correct", Steve 2026-11-06) and 2 scholar deaths in 28 days may
   be the honest rate, so raise the bar to ≤2; (b) keep ≤1 and treat
   each miss as a standing watch on death causes. Recommend (a) with
   the cause breakdown reported every run — the bar as set punishes
   the panel for the game's intended lethality.
2. **M-PR1 bar ≤1 — REVIEW.** r139 passed at max 1; r140 misses at
   max 2 with only 3 never-offered in 25 sittings (12%). The bar is
   a max-per-seed, so one seed with two quiet sittings fails the
   whole panel. Candidates: (a) score it as a rate (never-offered
   ≤15% of sittings) instead of a per-seed max; (b) keep the max but
   exempt sittings that end `settled` (1174 d8, 1176 d14, 1178 d7,
   1179 d8 all settled without an offer — the villager settled the
   thread themselves, which is not a failure to offer). Recommend
   (b) first — it separates "never offered and left hanging" from
   "settled another way".
3. **Hungry-at-horizon — lever work candidate, still carried.** 6/10
   for the second straight panel (r137/r138: 4/10). The collapse
   pattern is now four panels deep; it is not noise.
4. **Favors broken ahead of kept two panels running** (r139: 4 vs 1,
   r140: 5 vs 4). If r141 also breaks more than it keeps, call it a
   trend and open the favor-break causes.
5. **Fights 21 vs 12 — still owed.** Matched-band A/B (same seeds,
   profile-gate bypass on/off) before any claim about the bypass or
   the band. r140's 17 fights / 251 kills sits between the two.
6. **Lead-in nit — fold into the bridge-pool per-sitting memory arm**
   when it runs ("Good question." x2 in one sitting, r139 + r140).
7. **Telemetry baseline — do NOT roll on this panel.** The LOUD
   villager-deaths line is band variance (see Q3); the baseline stays
   r136-pinned until a panel carries regime-change information.

## Carried (unchanged)

- Teach the shared chooser to take nv:accept (r197 lane decision owed).
- Olivia bridge repeat — fix owed in a build arm with its own panel
  (per-sitting bridge memory or a bar revision); NOT this run — the
  fix touches shared pick-cycle machinery used by every pool. Did not
  recur on this panel (0 repeats).
- Fights 21 vs 12 (r139) — open question, matched-band A/B owed
  (same seeds, profile-gate bypass on/off), before any claim about the
  bypass or the band. Carried; r140's BEFORE/AFTER is a different
  comparison (same seeds, fix on/off) and does not answer it.
- Hungry-at-horizon watch: r137/r138 4/10, r139 6/10, r140 6/10.
- Favors broken 4 vs 1 (r139) — watch item; r140: 5 vs 4, still
  break-ahead.
- NV sittings share one closing template (observation only).
- Analyzer vs transcript streak count (r134 carry).
- `test-convo-engine-trust.js` verbatim closeLine 6 pass/1 fail
  pre-existing on pristine (observation).
- Measurement-proof + phone-frame-proof staleness pair (standing;
  refresh owed via the update scripts — maintenance, not this run,
  unless this run's gate shows them moved).
- Hunt H0-ESTABLISHED: hunt assignments resolve, first rung (8 reps)
  still out of reach in 28d.
- Lead-in nit (r139): topic answers repeat their lead-in within a
  sitting. Recurred in r140 (Daniyar x2, Aria x1).

## Landing

PENDING — filled after the gate: commit via safe-commit.sh, ff-only
merge to master, worktree release, rotation 0→1, lock deletion.

## Infrastructure notes

- Write flap: the first manual heartbeat failed on the flap
  (PermissionError EPERM on the registry atomic write); manual
  heartbeat landed 21:03:27Z. The first background heartbeat loop
  died silently; restarted detached with nohup (pid 12423, 5-min
  loop, log `/tmp/hb-journey-landing.log`). Last confirmed heartbeat
  21:57:14Z. Kill the nohup loop after release.
- Run-note write truncated at 3314 bytes on first attempt (content
  cut mid-sentence, marker text written into the file); recovered per
  the write-flap skill — probe OK, marker stripped, remainder
  appended in chunks, size verified after each append.
- Reaper at start SKIPPED — registry lock held by another reaper run,
  5 consecutive skips (known REAPER LOCK SELF-CONTENTION). Not
  blocking; registration still worked.
- Rotation file read `0` (landing) at run start; write `1` at
  closeout. NEVER touch `journey-rotation-b.txt`.
