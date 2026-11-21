# Loop B lever round fleshout-loop-b-20261121T0030Z — winnability chain

Run: `fleshout-loop-b-20261121T0030Z`, axis winnability chain, base master
`faa5d65a9`. Coordinator closeout: arm 1 merged, arms 2–3 HELD. Master tip at
closeout `0995971f2` + this record.

## Run-start state

- **STALE-LOCK RECOVERY.** The 2130Z B lock (`fleshout-loop-b-20261120T2130Z`,
  created 21:30:00Z) was still present at ~180 min old. Recovery verified
  before deleting: the 2130Z adoption agent is done (subagent list), no live
  `WT_RUN_ID` process, no process with cwd in either held tree, the 2130Z
  claim file is deleted, and its record commit `faa5d65a9` is on master. The
  two held trees' fresh heartbeats (00:20Z/00:25Z) were the adoption's
  closeout heartbeats, not a live coordinator — heartbeat alone misled here;
  the live-process check is what settled it. Lock deleted, new lock
  `fleshout-loop-b-20261121T0030Z` created. NOTE: the adoption's tracker
  entry claims the lock "was already absent at closeout (verified present
  at adoption start 23:34:59Z, gone by 00:2xZ)" — contradicted by the file's
  presence with the original 21:30:00Z timestamp. The adoption's "gone"
  observation was a misread (flap window or stale read); the lock was never
  actually deleted. Flagged here so the next adoption does not trust a
  "lock absent" observation without re-reading the file.
- **Loop A LIVE** on `fleshout-20261121T0015Z` (fibersupply / fiberfetch /
  lendpool; #2590, #2628/#2629, #2631/#2599) — NOT touched. Loop A landed
  sim-fibersupply-a mid-run (master `faa5d65a9` → `6e4e674f1`); arm 1 was
  rebased onto the new tip clean and its proof re-run before merging (see
  §Infrastructure).
- **Queue taken** (tracker next blanks, in order): (1) #2605 launch engine;
  (2) #2619 pinquaddoor wider band; (3) #2626 reseed wider band / longer
  window. The body's older queue items are superseded: flee-repair was
  FIXED 2026-11-18 (sim-fleerepair3-b, `d4d1eae52`); the arm-2-toggle /
  99107 items are subsumed by the tracker next-blank list.
- **Claim** written before any sims:
  `hidden_files/lever-claims/fleshout-loop-b-20261121T0030Z.json`.

## Arm 1 — sim-launcheng-b: launch-engine diag (finding #2605)

**DIAG-NO-GO (completeness bar only). MERGED** (`e8d4e35af` prereg +
`0995971f2` diag, rebased onto `6e4e674f1`, proof 44/44 re-run green on the
rebased tip). Evidence-only, `src/` diff 0. Evidence:
`evidence/2026-11-20/sim-launcheng-b.md`, prereg
`evidence/2026-11-20/sim-launcheng-b-prereg.md`.

- The first judged run exposed that the frozen taxonomy was built on a
  false premise — that a holder is scored at most once a day, at dawn.
  Scoring happens at all 4 day-parts and the pick phase drifts (a
  `party_wait` chore runs 2–4 parts; the re-pick lands whenever the chore
  is seen finished, often mid-day). A dated prereg CORRECTION 2026-11-21
  was recorded (frozen body untouched), the analyzer was rewritten to a
  day-level taxonomy, and the judged leg was re-run.
- Judged numbers (band 106241–106248, existing corpora only): 268
  instance-days across the 19 not-bid instances; 223 assessed (141 dawn +
  82 mid-day-only, 226 rows) and 45 zero-row days.
- **Binding gate: `party-no-companion` on 223/223 assessed days (100%).**
  Pool eligible 0/141 dawns. First-fails: `notRanger` 446, `away` 250,
  `trustLow`/`engaged`/`dead` 0. Rangers are 9.2% of the roster and 80%
  away at any dawn; holders are foragers 207/216 times. In plain words: a
  villager with a wave-4 plan waits for a hunting partner, and only
  wanderers/explorers count as partners — almost nobody is one, and the
  few who are spend four days in five away from Haven.
- Zero-row days classified except **10 `unknown-no-signal`** (at Haven,
  alive, not away, not the scholar, no encounter, no phase-edge shape).
  Only skipped day-parts (mid-day engagement) can explain them, and the
  recorder never sampled that. Churn 7/7 fully classified. Completeness
  FAIL on the 10 unknowns → DIAG-NO-GO; binding-gate, launch-accounting
  and instrument bars PASS.
- Launches (§7.3): 22 wave-4-target (7 counted + 15 uncounted), all with
  same-day `startExpedition` calls, all 15 uncounted copy-linked. First
  fights: 3. The uncounted-launch definition decision is now recorded in
  the prereg (follow-on hunts count as launches for the NEXT instrument).
- Wall: wins 0, national by rank 0/8, by standing 3/8, table 0, wave 4
  8/8, wave 5 3/8, median survival 142.5d, deaths 758, starvation 3,
  standing-199 4/8.
- Sense-test: Grace Obi launched 3× against the algorithm (d85/90/94)
  and never met it — her party sat 10 days on a stale sighting tile
  (3,5) while the monster drifted 2 → 4 away; Amina died d95, Grace came
  home at 1 hp and died d100. Desmond Clarke carried a plan 40 days
  without ever launching — away 22/29 days of his last instance.
- **No build, by the overlap guard.** The named next lever — let a
  trusted villager actually at Haven stand as a wave-4+ companion
  (trust-gated, Haven-gated, profile gate relaxed for wave-4+ plans
  only) — lives in `villager-brain.js`/`win-plan.js`, both held by the
  sibling arms' branches. Delivered diag-only, lever named for the next
  run. Next run's instrument item: a per-part holder-state recorder
  (objective kind/state/clock, `v.away`, `isEngaged`, node) on a fresh
  band to close the 10 unknown days.
- Finding #2605 updated (this round's update appended by the
  coordinator).

## Arm 2 — sim-pinquaddoor-wide-b: PIN THE QUAD wider band (finding #2619)

**NO-GO, kind METRIC-BROKEN. HELD** on branch `sim-pinquaddoor-b`, tip
`c451b0785` (rebased cleanly onto `faa5d65a9`, 5 commits, no conflicts;
prereg `648c03bb`, evidence `c451b0785`). NOT merged — the branch carries
the PINQUAD + ALLYSLOT3 lever code. Evidence:
`evidence/2026-11-20/sim-pinquaddoor-wide-b.md` (branch), prereg
`evidence/2026-11-20/sim-pinquaddoor-wide-b-prereg.md` (branch).

- 16 FRESH seeds 106501–106516 (freshness verified), same frozen bars,
  control + armed, 150d, policy `1884c8852d38`, substrate as
  pinquaddoor-b. Instrument extended for secondaries only (pin fields,
  all-waves `pinFights` census, S1–S4 analyzer; selftest 26/26; proof
  test 16/16; M1 18/18, M2 35/35 re-run on the rebased tip).
- Judged numbers: B1 PASS (15 live third-ally entries, 38 pinned
  fights); B2 PASS (ally3Dealt total 1,201 pinned, max 249); B3(a) PASS
  (vKill armed 17/292 = 5.8% vs control 17/246 = 6.9%, floor 4.9%);
  B3(b) PASS on the letter (1 pinned kill — 106502 finale_crew, Chen
  Wei 249 incl. the killing blow); **B4 MISS** (control three-vid 35 ≤
  2 — the threshold was calibrated to the launch-thin band and counts
  sense returns, which scale with quad supply: 17 quads/16 seeds here).
  The control is sane where it matters (0 expedition doors, 0 pinned
  fights); the armed-vs-control contrast on the pin is clean (doors 27
  vs 0, pinned fights 38 vs 0, pinned ally3Dealt 1,201 vs 0).
- Honest caveat: the one pinned kill was a world-tick shout-ladder
  kill, **not a door kill — the door converted 0/27**. At wave 4 the pin
  delivers the party but the party still can't kill (18 vFlee of 38) —
  the damage gap, not the pin.
- Secondaries: S1 pin-subset rate 39.5% wave-4+, 79.1% among fought
  pinned fights. S2: 6 drive-offs in 202 pinned fights; pinned end
  causes evade 116 / killed 57 / flee 20 / mFlee 6 / death 3. S3: pinned
  gate seeks 9.1% vs unpinned 2.1%, avoids 2/33 vs 47/95 — the predicted
  SEEK side effect is real. S4: 202 pinned fights at all waves (w1:72,
  w2:57, w3:35, w4:34, w5:4); 164 sub-wave-4, 56 of 57 pinned kills
  below wave 4.
- **New finding for the next prereg:** on a launch-rich band the slot
  ALONE delivers the third ally without the pin — 7 control entries, 605
  damage, all via the round-4 shout (shout3Round=4, door=false).
  Sense3's "slot inert live" was a launch-thin-band observation.
- Wall: wins/national/table 0 both legs; wave-5 5/16, wave-4 15/16,
  survived 7/16 both; standing ≥200 5/16 both; median survival 149d →
  140d, deaths 1,195 → 1,219. Panel `review_required` (16 paired); one
  **regression_signal** on village deaths/100d (+3.695, interval
  0.10–9.06) — ~60% denominator effect (60 fewer gameDays), driven by
  106510/106507 trajectory re-rolls; the count version is a
  regression_watch whose interval includes 0. Reported, not adjudicated
  — the bar passed as frozen and the panel is the instrument, not the
  judge. Next run should watch the deaths/100d signal on its own band
  before trusting it.
- Finding #2619 stays OPEN; update appended by the coordinator.
  Recommended next prereg: B4 on sanity properties only (0 expedition
  doors, 0 pinned fights on control), B3(b) split into door kills vs
  pinned kills, B1 as the fought-subset rate, on a fresh band.

## Arm 3 — sim-reseedwide-b: expiry wider band + longer window (finding #2626)

**GO (combined). HELD** on branch `sim-reseedexpiry-b`, tip `a5a72ee07`
(prereg `616fbd531`, instrument `3a6ac430a`, evidence `ecf271e98`,
hash-fill `a5a72ee07`). NOT merged — the fix stays HELD on the
coordinator call below. Evidence:
`evidence/2026-11-20/sim-reseedwide-b.md` (branch), prereg
`evidence/2026-11-20/sim-reseedwide-b-prereg.md` (branch).

- 16 FRESH seeds 106601–106616, 180d, control + armed, frozen n≥3 judge
  rule. The wider band + longer window bought exactly two more expiries
  — the rate is stable at ~1 per 8 armed seeds — so at n=2 the follow
  shares are **REPORTED, not judged** per the frozen prereg (re-seed
  within 7d 1/2 = 0.500, fight again within 14d 2/2 = 1.000,
  post-expiry targetless launches 0).
- **Combined-fix judgment PASSES on every element:** dead-target
  launches 0 on both armed legs (20 + 39 launches), re-seed commits
  3 + 15, guardrail both bands (A: survived 2 vs 3, median 157 vs 155d,
  starvation 4 vs 6; B: 1 vs 1, 147.5 vs 135d, 2 vs 6), instrument
  clean, 25 dead commits pooled.
- Across both expiry arms: 4 expiries in 32 armed seeds, 2/4 re-seeded
  within 7d, 4/4 fought again, 0 post-expiry targetless, guardrail 4/4.
  A third wide band is not recommended (it would most likely return n=2
  again).
- The two expiries, sense-tested: Amina (106603 d28) — Diana killed the
  last Spool on camera d27; the fire called off Amina's Spool hunt d28;
  she re-seeded onto Buffering in 3 days and launched with Diana, fled a
  Redactor d31 and a Gavel d40, died d41. Fernando Vega (106610 d38) —
  he killed his own Chorus Line on camera d36, was told d38 his hunt for
  the same kind was called off, held 3× on d39, re-seeded onto Buffering
  in 8 days (one day past the bar) and launched with Desmond,
  fled/evaded three beasts, died d77 in the wild. Both re-seeded onto
  Buffering (the only rumor in each pool). Both expired-plan re-seeds
  launched **silently** — no beat on the re-seed day — filed as new open
  finding **#2632**.
- Wall: wins/national/table 0 on all legs; wave-5 5/8 + 3/8 armed; 8/16
  armed seeds end at standing 199; strongest armed villages 106614
  (standing 645) and 106609 (520, survived 180d; its control twin died
  d62). Panels both sub-bands `review_required`, 8 paired cases, no
  material signal.
- **COORDINATOR CALL — fix stays HELD, unmerged, despite the GO
  (combined) verdict.** The verdict stands as judged (the frozen judge
  rule was honored: n<3 → GO hinges on the combined fix, which passed).
  Landing is held on three evidence-based grounds, all recorded in the
  arm evidence: (1) **#2632** — the fix launches re-seeds silently, a
  no-silent-actions gap in the fix itself; landing it would ship a known
  violation of Steve's law. The beat is a small build for the next arm.
  (2) "Fought again" is launch-based by the frozen instrument — neither
  re-seeded holder has a recorded blow-by-blow fight with Buffering; both
  fled/evaded and died in the wild. The fix gets holders back out the
  door; whether it gets them back into kills is unproven. (3) The 7-day
  follow-through remains unproven at n=2 (2/4 pooled). Next arm on this
  chain: build the #2632 re-seed-day beat, then re-derive the 7-day bar
  (the rumor supply, not the mechanism, is what misses) or run a
  rumor-poor band by construction. Do NOT run a third wide band.
- Finding #2626 updated by the worker; #2632 filed by the worker.
  Branch src vs master is the held reseed fix only (`win-plan.js` +337,
  `villager-brain.js` +12, `fieldFights.js` +13); this arm added no
  `src/` change.

## Wall (this run's judged corpora)

| | Launcheng band (8) | Pinquad-wide (16×2) | Reseedwide (16×2) |
|---|---|---|---|
| wins | 0 | 0 / 0 | 0 |
| national | 0 by rank (3 by standing) | 0 / 0 | 0 |
| table | 0 | 0 / 0 | 0 |
| wave 5 unlocked | 3/8 | 5/16 | 5/8 + 3/8 armed |
| wave 4 unlocked | 8/8 | 15/16 | — |
| survived | — | 7/16 both | — |
| median survival | 142.5d | 149d → 140d | — |
| standing-199 stall | 4/8 | — | 8/16 armed |

The standing walls — launch decision + damage, deed gate after national,
standing-199 stall — are unchanged by this round. The launch engine is
now decomposed to a named gate (`party-no-companion`, 223/223 days);
the pin delivers parties that still can't kill wave-4 (door 0/27);
the re-seed fix is judged GO-combined but held on a silent-launch gap.

## Telemetry deviation check

Attempted by the coordinator from the held worktrees (the corpora are
recorder corpora and live only on the held branches; a main-tree attempt
fails ENOENT for the same reason): exit 2, the designed recorder-corpus
refusal, verbatim, on both the pinquaddoor-wide armed corpus (16 rows)
and the reseedwide armed corpus (8 rows). No LOUD lines. Baseline NOT
rolled. The launcheng worker reported the same exit-2 refusal.

## Infrastructure

- **Loop A landed mid-run** (fibersupply-a, master `faa5d65a9` →
  `6e4e674f1`); arm 1 rebased clean onto the new tip, proof test re-run
  44/44 green on the rebased tip, then ff-only merged. No conflicts, no
  overlap (Loop A's files are fiber-*; arm 1's are launcheng-*).
- **Machine restart** killed reseedwide leg 2 (A control) after 3 seeds;
  the 3 files were verified valid (0 errors, anchor `3a6ac430a2e4`) and
  the remaining 5 re-ran cleanly — no seed lost.
- **Long-leg SIGTERM:** pinquaddoor-wide's first 16-seed control call
  was SIGTERMed at ~16.5 min after 12 seeds; resumed the remaining 4
  cleanly and split the armed leg 8+8 — no seed lost (driver writes per
  seed). **Chunk wide legs at 8 seeds per call.**
- **Safe-commit index clobber** struck all three workers (launcheng 1×,
  pinquaddoor-wide 2×, reseedwide 3×); every commit verified correct by
  hash and the index repaired via the recorded `ls-tree -r` pipe. No work
  lost.
- **Write flap:** quiet this run — preregs, instruments, all corpora and
  the round record wrote on first attempt. VM restarted ~23:24Z before
  the run (uptime 1:08 at run start); no work lost.
- **No `check.js --quick`** on arms 2–3 (sibling gates running; no
  `src/` changed by either arm this round). Arm 1's own gates (proof
  44/44, selftest 39/39) all pass. No `check.js` failure implicates any
  arm.
- Held trees `sim-pinquaddoor-b` and `sim-reseedexpiry-b` left
  registered with FRESH heartbeats so the reaper will not touch them;
  branches kept at `c451b0785` / `a5a72ee07`.
- Claim deleted; lock deleted at closeout.

## Next blanks, in order

1. **#2605 — launch-engine lever:** let a trusted villager actually at
   Haven stand as a wave-4+ companion (trust-gated, Haven-gated,
   profile gate relaxed for wave-4+ plans only). Needs a per-part
   holder-state recorder first (objective kind/state/clock, `v.away`,
   `isEngaged`, node) on a fresh band to close the 10 unknown days.
   NOTE: the lever lives in `villager-brain.js`/`win-plan.js` — do not
   start it while the pinquaddoor/reseed branches hold those files; land
   or release the held branches first, or build it on a fresh branch
   after the next loop's landing decision.
2. **#2619 — pinquaddoor re-prereg:** B4 on sanity properties only (0
   expedition doors, 0 pinned fights on control), B3(b) split into door
   kills vs pinned kills, B1 as the fought-subset rate, on a fresh band.
   Watch the deaths/100d regression_signal on the next band before
   trusting it.
3. **#2626 — reseed fix landing path:** build the #2632 re-seed-day
   beat, then re-derive the 7-day bar or run a rumor-poor band by
   construction. Do NOT run a third wide band.
4. **#2590 / #2628/#2629** — owned by Loop A this round (live claim
   `fleshout-20261121T0015Z`); do not duplicate.

Winnability chain stays converging (NOT converged): the launch gate is
named, the pin's kill conversion is unproven at the door (0/27), and
the re-seed fix is judged but unlanded. Claim deleted; lock deleted.
