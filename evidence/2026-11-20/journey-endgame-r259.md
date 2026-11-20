# Journey endgame r259 — run note (Lane B, leg 4 ENDGAME)

**Run id:** playtest-loop-2-20261120T2155Z (scheduled Fri 2026-11-20 16:00 CST;
started 21:55Z — scheduler fired late).
**Base:** local master `1fcd7edba` EXACTLY (worktree HEAD at run start).
**Adoption:** the run timed out at 16:00 CST with Pass D incomplete (last
confirmed state 22:54:41Z: 10 files, 5 seeds done, 2 probes still running
on seed 89706, no EXIT line). The adoption verified the probes finished
on their own: Pass D EXIT=0 at 22:55:10Z, 12 files, all 6 seeds.
Coordinator dead (no WT_RUN_ID, no endgame processes); the orphan hbloop
(pid 42530) was killed by exact PID and the worktree heartbeat taken over
(22:59:34Z). The adoption ran the Pass D analyzer (not run by the
coordinator), the telemetry adjudication, the people check, the gate, and
this note. Rebased onto master `8ca5da828` (Loop A 2015Z sim-ammo-a
landing) — clean, no conflicts. New tip `9268bbccc` (pre-merge).
**Rotation:** read 4 → write 4→5 at closeout on verified landing. Next leg:
social life.
**Worktree:** `~/workspace/worktrees/journey2-endgame` (branch
`journey2-endgame`), registered 21:57–22:16Z (~19 min; slow full checkout
under disk contention from sibling loops). Heartbeat landed at
registration; hbloop died with the coordinator timeout (see Adoption).
**Lock:** `playtest-loop-2.lock`, run_id
`playtest-loop-2-20261120T2155Z`, created 2026-11-20T21:55:36Z. Deleted at
closeout in the same call as its read, only if run_id matches.
**Flap:** flap-watch ALL-OK at run start. A ~1–2 min flap hit at
22:34:46Z (boot 5ab54fa2) mid-run; writes recovered by 22:35:47Z,
nothing lost. The Pass D probes finished through it.
**Seed bands:** matched 89701–89706 (deliberate reuse per the r118+
precedent); C-wide fresh band 89840–89847, verified fresh (zero hits
across all evidence preregs/run notes/screens/scripts).
**Probe/analyzer:** r255 probe + analyzer verbatim except renames,
dates, the new C-wide band, and the WARPATH diagnostic (§WARPATH,
probe-side only, zero src/js). Dark probe skipped (no delta since
r211). No src/js change this run — evidence-only.

## Headline

Pass A reproduces r255 modulo the named deltas. Pass C and C-wide go
NO-GO vacuous again — the deed gate never opens on the buyout road.
Pass D (second ally slot, seventh sighting) goes GO with the same full
seat r255 D earned on the same seed, same day, same capstone — but with
twice the kills. The war-path naming defect from r255 is **not a
defect**: the dump and the transcripts agree everywhere, 0 mismatches.
Two bought villages scattered anyway — the buyout-starvation pattern
reproduces twice more on this panel.

## Pass A (live, CAPSTONE unset, BUYOUT unset) — PRIMARY GO

Matched re-run vs r255 pass A. Lesser 5/5, full 0/5, won 5/5.
Kills 11 (r255: 13) — 89701:1, 89702:7, 89703:0, 89704:0, 89705:3.
peakVet sum 6 (r255: 12) — per-seed [0,4,0,0,2]. M23b 1/5: 89702
reached the deed gate d70 (no capstone — binding unanswered on A, by
design). Wave 5 faced 4 times (89702×3, 89705×1); no wave-5 kills.
Standing 199 on 89701, 89703, 89704 (3/5). Sat days: 89701 d94,
89702 d90, 89703 d101, 89704 d90, 89705 d90 — all lesser.
noTickDeferrals 0, trioCarry 0. Corpus purity GO 5/5. VETCONV 4/4
reconciled.

Q1 (does A reproduce r255 modulo deltas (a)–(f), does 89702 still
reach the gate): YES on the gate (89702@d70, third straight
reproduction — r243, r246, r249, r255, r259). Kills 13→11 and peakVet
12→6 are the movement: the r149 policy reachability change (f) is the
only fight-adjacent live delta, and it did NOT lift kills on the
matched band — if anything the band reads weaker. Two seeds that
banked 2 veterans on r255 bank 0 on r259 (89701, 89703); both stall
at standing 199. Attributed to band noise on 5 seeds + the 199 stall,
not to a lever — no fight-engine change landed since r255.

## Pass C (CAPSTONE=1, BUYOUT=1, BUYOUT_EARLY=1) — PRIMARY NO-GO (vacuous)

Lesser 4/5, full 0/5, lost 1/5. Kills 8 — 89701:5, 89702:0, 89703:0,
89704:0, 89705:3. peakVet sum 4 — [2,0,0,0,2]. M23b 0/5: the deed
gate never went ok on any seed, so the capstone was never attempted
and the binding is vacuous. M25c 5/5 bought early (89701 d34, 89702
d18, 89703 d53, 89704 d41, 89705 d17). Wave 5 faced 0 times.
**89702 village-lost d54** — the matched seed that WINS on Pass A
(lesser, sat d90) scatters on the buyout road: bought the bundle d18
(spent 8,025 of 51,288 kcal), then 9 deaths by d46 (starvation d12,
Reunion d42 killed Ines + Ivy, Algorithm d46 killed Carlos), pantry
hit 0, third hungry day, "Haven couldn't hold... The scattering,
again." Same seed, same substrate — the only difference is the
buyout road. Fourth buyout-starvation reproduction (r249 89821,
r255 89830 + 89831). M25c still passes (the bundle bought); the
starvation watch is a separate observation (Q20).
Corpus purity GO 5/5. VETCONV 4/4 reconciled.

## Pass C-wide (fresh 89840–89847, same flags as C) — PRIMARY NO-GO (vacuous); WIDE GO

Lesser 7/8, full 0/8, lost 1/8. Kills 9 — 89840:0, 89841:1, 89842:4,
89843:3, 89844:0, 89845:1, 89846:0, 89847:0. peakVet sum 6 —
[0,1,2,2,0,1,0,0]. M23b 0/8: deed gate never ok. M25c 8/8 bought
early. Wave 5 faced once (89842). **89845 village-lost d79** — bought
d39 (spent 8,058 of 14,487 kcal), 14 deaths d22–d76, pantry 0,
scattered with 9 alive. Fifth buyout-starvation reproduction, second
on this panel. WIDE-VERDICT GO (M25c + purity 8/8). VETCONV 8/8
reconciled.
Q11 (does ANY fresh seed face wave 5 or take a full seat): one seed
faced wave 5 (89842×1); none took a full seat, none reached the deed
gate. The r255 finding holds.

## Pass D (FIGHTALLY2=1 + CAPSTONE + BUYOUT, seventh sighting) — PRIMARY GO

Lesser 5/6, **full 1/6 — 89705 d84, feast embassy delivered d83,
deed gate ok d83**. Won 6/6, lost 0/6. Kills 14 — 89701:5, 89702:6,
89703:1, 89704:0, 89705:2, 89706:0 (C: 8, A: 11). peakVet sum 9 —
[2,3,1,1,2,0]. M23b 1/6. Wave 5 faced twice (89705×2); no wave-5
kills. Corpus purity GO 6/6. VETCONV 5/5 reconciled.
Q24 (does the second ally slot repeat r239's effect — 2/6 full,
kills ~13 — or r243/r246/r249/r255's level result — 1/6 full, kills
6–9): the SEAT outcome repeats the level result exactly — same seed
(89705), same day (d84), same capstone (feast embassy d83) as r255 D
and r249 D. The KILLS outcome breaks the level band: 14 vs 7 on
r255 D, vs 8 on r259 C. The r149 policy change (f) is the only
fight-adjacent live delta (no fight-engine change since r255), and it
plausibly explains the kills uplift — fewer wasted turns, more
finished fights. But the seat is unchanged across all seven
sightings, so **FIGHTALLY2 stays OFF** — the uplift moves kills, not
seats. No meeting party fielded 4 (the #2515 cap holds); the second
ally joined and acted on every D seed (89705's w5 faces came with the
slot on).

## WARPATH diagnostic (§WARPATH, pre-filed) — FAITHFUL, no fix

Decision rule (i) applies. Across all 22 sat seeds, every printed
engagement/kill noun matches its mid's settled villageName (or its
System name where the village never settled one): **0 mismatches**.
The transcripts agree with the dumps exactly:
- 89705 D: "On day 73, Hannusya put down Loud-Bane. On day 44,
  Ethan put down The Loud Beast." — dump: eulogy/Loud-Bane d73,
  algorithm/The Loud Beast d44. "They faced Big-Bane and lived to
  sit here. They faced Big Ugly and lived to sit here. 2 more of the
  later drafts faced besides." — dump: eater/Big-Bane, reunion/Big
  Ugly, editor + spoiler = 2 more.
- 89702 A: "On day 71, Nora put down The Big Beast. On day 68, you
  put down The Loud Beast — and 5 more teeth after." — dump: 7 kills
  (d38–d71); the 5 teeth after the d68 kill are the 2 later kills +
  the 3 engagements (reunion, editor, spoiler). "They faced The
  Reunion... They faced The Big Beast... 1 more of the later drafts
  faced besides." — dump: reunion, editor/The Big Beast, spoiler =
  1 more.
r255's "mangled" is a misdiagnosis: the names it compared against
were System names the village never knew, and "Big-Bane" vs
"Loud-Bane" are different monsters that happen to share the narrow
27-name village namespace. That narrowness IS real — "Loud-Bane"
names both the eulogy kill and the spoiler engagement on 89705 D —
and is recorded as a design observation for Steve, not a defect.
No code fix; the diagnostic instrument stays in the probe for the
next endgame run to re-confirm on a fresh band.

## People check (read in full)

- **89705 D, full seat (announce window, 70 SAY lines):** coherent
  throughout. The audit reads the run back honestly (global standing,
  every wave faced, deeds complete); the war-path list matches the
  dump; the feared road lands ("Show mercy" — the most frightening
  thing, chosen as a shield). One nit: the keepsake epilogue repeats
  "The feast was the weapon." verbatim 4× in a row (Photo Album,
  harmonica, Home key, Knife roll) — a refrain that reads as a
  repeated line, same family as the r245/r246 closing-line
  duplication. Carried as an observation, not a defect.
- **89702 A, lesser seat (62 SAY lines):** coherent. "More promises
  broken than kept; the protected outnumber the killed" — an honest
  ledger read. The missed capstone is named plainly ("no capstone
  deed delivered"). The closing line "The mourners asked you, and you
  changed the subject." lands as a real beat. Same keepsake refrain
  ×3.
- **89702 C, scatter:** the loss is narrated, not silent — pantry
  empty, "Day 3 of hunger," "Haven couldn't hold. On the third
  hungry day, people started walking — in different directions. The
  scattering, again." The deaths are named (Ines + Ivy to the Reunion
  d42, Carlos to the Algorithm d46). A misidentification spreads
  live: Nino passes Bittersweet Nightshade around the fire calling it
  "White Crossberry" — the wrong name loose in the village. That is
  the system working as designed.
- **Funeral feasts fired + voiced** (Ines, Oliver, Minh — "every
  shaken fire is fed"). Pellet lines present (buried-pellet radio,
  fusion-reactor install). No dry lines anywhere (see below).

## Watch items (prereg Q1–Q35, answered)

- DRY (27): **0 dry lines panel-wide** — the r256 DRY2 fix holds.
- SYSTEM:"" : 0. ECHO (15): 0 — no accepted raise talk serves
  "All right — let's ask them."
- SETTLED-FAVOR (29): 0 occurrences — vacuous again (the r247 fix
  still untested in the wild on the endgame panel).
- C3d (14): vacuous — no recap sittings on the panel.
- SELFWIT (31): 215 death records, none carrying a witness list in
  the probe JSON (instrument gap — the probe's deathRecords have no
  witness field); no transcript witness-mourning line fired. The
  r258 fix itself is untested by this panel; REL-WIT supply stays 0.
- REACHABILITY (32): 9 refused moves total panel-wide, no cluster
  ≥10 in any fight — the r149 policy fix holds.
- "The The" (34/35): **"dodged the the attack!" ×4** — on the two
  lost seeds only (89702 C ×2, 89845 C-wide ×2). The r257 blemish,
  same site, still live — a new doubled-article site outside the
  antler-thrash and scream/outing fixes. Filed as F-item below;
  carries to the next crisis round (r261). The other 3 hits are
  false positives (COMMUNE "THE — THE DOING" em-dash emphasis ×2;
  sentence boundary ×1).
- Counter-label (33): no clause-head counter line carrying a raw
  comma-clause descriptor found — the r244 fix holds.
- Goal-bridge (28): no repeat inside one sitting before 7 bridges.
- React-exhaustion (30): no "So."-style dead react tapped 3+ times
  in one sitting.
- Door-skip (6): 0. Pocket (8): 0. FledBad (7): the analyzer's
  fled watch shows no legacy-outmatched firing with a named monster
  HP — the r149 answer (full-health wave-3 trigger) stands.
- Guard-stall (25): none — longest announce→sit deferral 19d
  (89846), under the 30d line. Total-deferral (26): none ≥30d.
- NOTICKEXACT (4): deferrals 0 on all four passes — fourth
  observation. TrioCarry (5): 0 on all passes, field present on
  every per-seed JSON — fourth observation.
- TABLESITTING (3): the 89705 D mercy window (capstone delivered
  d83, finale unresolved to d90) — no muster/march held or fired
  in the window on the transcript; the distinction stands
  unobserved.
- CompanionGuard (17): skips A 12 (89702:4, 89705:8), C 11, C-wide
  1, D 13 — all counted, none with a missing counter increment;
  no plan record lists a companion who never left. **medicDutyBlocked
  dominates again: A 190, C 104, C-wide 467, D 210** — medic duty
  blocks companion calls far more than the guard (r253: 524, r257:
  312). The medic-duty wall stands.
- DeathCleanup (18): deathCleanups A 4, C 8, C-wide 14, D 13;
  removalCleanups 0 everywhere — no stranded launch.
- Tribute (M24): never delivered — still unexercised in this leg.
- 159-turn Algorithm fight (22): absent — longest fight 16 turns.
- fastW4 diedInFight gap (23): unobserved — no fastW4 scholar-death
  fight on the panel.
- F1 #2519 (12): 0 never-sat seeds — every seed sat or scattered
  with a recorded end; the exiled-scholar case does not recur.
- 89705 fate (19): survived on all four passes (sat d90–d108) —
  the r230 d59 loss stays history.
- Starvation watch (20): 2 bought seeds lost (above); all other
  bought seeds survived. Pantry reached 8,000+ in-window on every
  bought seed.
- Funeral-mend (21): feasts fired + voiced (3 instances); no
  survival effect attributable.

## F-item (filed this run)

- **F1 (r259) — "dodged the the attack!" doubled article, new site.**
  4 occurrences on the two lost seeds (89702 C ×2, 89845 C-wide ×2).
  The r257 blemish (14575 d44) was queued for the next crisis round;
  this run confirms it fires on the endgame panel too, and only on
  seeds that scatter. Next: fix at the source (the style-bonus line
  template) with a proof test, judged on the next crisis panel.

## Village assessment (plain words)

Twenty-five villages played to the end of the road. Nineteen took a
lesser seat, one took the full seat, two scattered with their people
walking in different directions, and the rest sat down to a table
that priced them and sent them home lesser. The villages that win
are the ones that kill — 89702 on Pass A put down seven wave-4
monsters and reached the deed gate; the villages that stall at
standing 199 bank no veterans and never unlock the door. The buyout
road is the cruelest finding: the same village that wins on the
plain road scatters on the bought road, twice on this panel, because
the bundle is bought with food the village then cannot spare when
the deaths start. The people in the transcripts are people — they
grieve, they misname plants, they notice when you change the
subject, they choose mercy at the table and mean it. What they still
cannot do, on any road, is open the deed gate twice: it opened once
in nineteen capstone-armed seeds, and only with the second ally in
the room.

## Reachable / fun / winnable

- **Reachable:** yes for the endgame leg — every pass plays through,
  seats are offered, the table reads the run back, the full seat
  reproduces on the matched band.
- **Fun:** yes in the finale — the audit, the war path, the feared
  choice all read as the game intends. The keepsake refrain repeating
  verbatim is the one flat note.
- **Winnable:** narrowly, and only on the second-ally road — 1/6
  full on D, 0/19 on A/C/C-wide. The deed gate is the wall: it
  opened once in 19 capstone-armed seeds, never on the buyout road
  alone.

## Metric review (§14)

1. **Warpath is answered, not re-scored.** The pre-filed decision
   rule (i) fired on the evidence: 0 mismatches, transcripts match.
   The r255 "mangled" finding is corrected to a misdiagnosis in this
   note; no metric was re-scored mid-run.
2. **Pass D kills uplift (7→14) is real but does not move the seat.**
   The pre-registered D binding is the seat (1/6 full, same as r255
   D), which holds; the kills uplift is reported as a secondary
   observation attributed to the r149 policy delta (f), not as a
   re-scored primary.
3. **peakVet telemetry: 6 vs baseline 12 — neither confirmed nor
   refuted.** The r255 roll (3→12) was a single observation with an
   explicit confirm-or-revert flag for the next endgame run. r259
   reads 6: above the old 3–4 band, below 12. The revert condition
   (a read back in 3–4) is NOT met, so the baseline stays 12,
   provisional, and the next endgame run re-judges it (reads 3–4 →
   revert to 3; reads 10–12 → confirm 12; reads ~6 → roll to 6 as
   the band center). The tool read was quiet on every pass.
4. **Buyout-starvation is now 5 reproductions** (r249, r255 ×2,
   r259 ×2) on matched + fresh seeds. The M25c bar (bundle bought)
   still passes, so this stays a watch item, not a binding failure —
   but the fifth reproduction means the next endgame run should
   pre-register a starvation bar on bought seeds (e.g. bought-seed
   loss rate ≤1/8) rather than watching it informally.
5. **The 199 stall recurs** (3/5 on A, 5/8 on C-wide) without
   blocking the table — consistent with r247's trailing-lag reading.
   No revision proposed; the stalled-while-ready-days metric from
   r247's review still awaits its first run.

## Telemetry

`telemetry-check.js` on Pass A (5 files, 3 metrics
veterans.unlockedWave/won/peakLivingVeterans): **quiet**. Same on
C-wide (8 files, 3 metrics): **quiet**. Task-template read (4
metrics national/table/wins/exiled): **quiet**. Baseline NOT rolled —
peakVet 6 neither confirms the r255 12 nor returns to the 3–4 band
(see metric review 3). uw 25 vs baseline 22, won 5 vs 4 — within
tolerance, not rolled.

## Gate

`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest2`
on the rebased tip (`9268bbccc`), log
`hidden_files/journey-endgame-r259-gate.log`: **338 passed, 6 failed
in 699s — 0 attributable.** All six are the standing set:
- measurement-proof staleness pair: `test-measurement-proof-update.js`
  + `test-measurement-workflow.js` (proof re-sign round 22 still owed).
- phone-frame stale receipt: `test-phone-frame-proof.js`.
- deed-attainment 120s timeouts ×2: `test-living-garden-deed-attainment.js`
  + `test-one-person-army-deed-attainment.js` (both exceed the 120s cap;
  the first gate attempt also showed a seventh failure under concurrent
  load from the sibling pinquaddoor-b check.js — a load flake, not a
  real failure).
- `test-measurement-cache-flags.js` (67s, cache-identity failures) —
  the known load flake; passes standalone (verified r257).
Infrastructure: the first gate attempt was killed mid-run by a VM
restart (~23:23Z, uptime 1 min at 23:24:30Z); heartbeat re-established
first, writes re-probed OK, gate re-run from scratch. No flap during
either attempt.

## Landing

- Commit `944a833db` (rebased to `9268bbccc`): prereg, 4 pass logs,
  smoke log, 4 analyzer logs + .err, probe/analyzer/clone scripts,
  5 perseed corpora (50 files). Evidence-only, 0 src/js changes.
- Run note: this file (second commit on the branch, below the evidence
  commit).
- Gate log: `hidden_files/journey-endgame-r259-gate.log`.
- Rotation-b: 4 → 5 (social life) after verified merge.
- Lock deleted last on run_id match.
