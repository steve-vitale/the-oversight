# Journey leg ESTABLISHMENT — r107 run note (2026-11-06, Lane A)

## Prereg
`evidence/2026-11-06/journey-establishment-r107-prereg.md` (committed
831cfa8a8 BEFORE any scored seed; driver + analyzer + proof committed in
the same commit; the per-dawn lean/eligibility trace, FIX 2b, committed
9335ffaa after the pilot seed with the trajectory re-verified identical —
see "Instrument amendment" below). Driver
`scripts/journey-establishment-r107-20261106.js` (r106 driver clone +
native guardrails/c3 keys + ever-substrate capture + lean trace),
analyzer `scripts/analyze-journey-establishment-r107-20261106.py`, proof
`scripts/test-journey-establishment-r107-huntwire.js`. Seeds
1501–1504 (matched, deliberate reuse) + 1601–1604 (fresh — see prereg
freshness check; 1505–1508 rejected on the corpsehome collision), competent
policy, 42-iteration horizon, death-aware tail. Base: master 08e8a6650 at
branch time. Control: r105 driver unmodified, re-run on the current base
(files in goal hidden_files `evidence-2026-11-06-control-r107/`).

## Leg question
r106 (n=4) returned HUNT-HURTS with an explicit re-roll confound: the
first hunt resolve re-rolls the village's whole trajectory, so the panel
could not separate lever from luck. This run is the discriminating test
r106's metric review named — the §9 Stage-1 pilot at 8 seeds: does
hunt-staffing change the establishment funnel on 8 seeds, or was n=4
re-roll luck?

## Instrument amendment (pilot-driven, before scoring the other 7 seeds)
The pilot seed (1501) staffed ZERO hunts with substrate present, and the
prereg's pilot criterion required the instrument to name which gate held.
The committed driver could not: the end snapshot masks dead hunters and
nothing recorded lean days. FIX 2b (commit 9335ffaa, capture-only):
per-dawn lean/eligibility trace — leanDay + playerAtHaven + per living
substrate villager {trust, personHp, wounded2d}, all pure reads, no RNG,
no Game writes. Re-verification, all before scoring seeds 1502–1604:
proof test re-run ALL GREEN (P1 4/4, P2 gate-off identical, P3 4/4 incl.
the new leanTrace shape check); pilot M0 re-checked PASS (gate-off ==
control exactly, endDay 43 / aliveEnd 7 / pantryKcalEnd 14688, 19
lessons); the 1501 arm leg re-run with the new driver is trajectory-
IDENTICAL to the pre-amendment file (scalars, daily rows, deaths,
lessons, huntStaff, everSubstrate — all byte-equal on the compared
fields). No metric changed; only capture was added. The 1501 arm file in
evidence carries the trace.

## Panel verdict (BINDING metrics)
- M0 INSTRUMENT-NEUTRALITY: **PASS.** Pilot seed 1501: gate-off
  reproduces the same-base control exactly (endDay 43, aliveEnd 7,
  pantryKcalEnd 14688, 19 lessons, zero diff) — and again after the
  FIX 2b amendment. Proof P2 (5d, 3 legs) also identical incl.
  control-vs-control.
- M1 HUNT-STAFFING: **HUNT-MIXED** (pantryUp=[1603] survUp=[1502, 1504,
  1603] survDown=[] fieldDressingFires=0). Per-seed arm vs control:
  - 1501: 43/7/14,688 vs 43/7/14,688 — IDENTICAL. 0 assignments.
    Substrate existed (Pavel bush pilot, Leo trail crew lead, both
    dead by end) but the layer never had an eligible hunter: the trace
    names the gate — TRUST, then HP (see Mechanism).
  - 1502: 42/11/22,975 vs 42/9/27,733. 9 assignments (Ethan Hunt, all
    9), 7 kills, 5,667 kcal, 3 refusals (wounded-2d ×2, declining ×1).
    Two more alive, pantry −4,758.
  - 1503: 42/7/25,711 vs 42/7/25,711 — IDENTICAL. 0 assignments.
    No hunter-substrate villager ever (everSubstrate=[]), same as r106.
  - 1504: 43/11/22,663 vs 42/8/34,272. 3 assignments (Pavel Dubinin),
    2 kills, 2,554 kcal. Three more alive, pantry −11,609.
  - 1601: 43/9/52,888 vs 43/9/52,888 — IDENTICAL. 0 assignments.
    One ever-substrate villager (Earl) — trace names the gate (see
    Mechanism).
  - 1602: 43/11/27,218 vs 43/11/27,218 — IDENTICAL. 0 assignments.
    No hunter-substrate villager ever (everSubstrate=[]).
  - 1603: 43/8/26,239 vs 43/6/13,367. 1 assignment (Ethan Hunt d7),
    1 kill (eastern coyote, 7,728 kcal). Two more alive, pantry
    +12,872 — of which +1,926 is Ella's buried-cache confession in
    the people check, not the hunt (see Mechanism; funnel delta
    +10,946, still pantryUp under either number).
  - 1604: 43/10/19,875 vs 43/10/25,833. 3 assignments (Juan Macapagal,
    exterminator), 3 kills, 1,210 kcal. Alive flat, pantry −5,958.
  - Panel: assignments 16, hunt calls 16 vs 0, kills 13 vs 0, kcal
    17,059 vs 0. Field_dressing fires **0** — no kill was made by a
    holder AT KILL TIME (see Mechanism). Triage fires 26 (M2).
  - The n=4 HUNT-HURTS did NOT replicate: no seed is worse on survival
    (survDown=[]), three are better, none lost. But neither did the
    lever carry the panel: pantry up on 1/8, down on 3/8 firing seeds.
    The lever moves trajectories; the direction is seed luck. Per the
    prereg's fate rule, MIXED means the panel cannot separate lever
    from luck — the next step is the separate-RNG-stream Steve-call,
    not a bigger panel. (Convergence §12: round 2 of 3 without passing
    the pilot gate; a round 3 panel is NOT the next step.)
- M2 CARE-VISIBILITY: careTicks 334, tends 145, medics seen 20
  distinct. healerRounds 109, treatTicks 334, treatChanged 3 (healer
  'None' — the unnamed/unknown healer, as r105). Triage USED 26× (Daniyar,
  Fatima, DeShawn reach-2). Care runs on occupation as before.
- M3 SURVIVAL-42: **8/8 — GO** (bar 6/8). Every arm seed alive at 42,
  no scatter. Control: 8/8 as well.
- M4 PANTRY-GUARDRAIL: **8/8 — GO** (bar 6/8). Zero starvation/thirst/
  dehydration deaths on all 8 arm seeds (c3.starvationDeaths=0
  everywhere, native keys).
- M5 PEOPLE: **PASS.** All 16 held convos (2 per seed, none skipped —
  no game over anywhere) read in full and coherent — NPCs want
  something, options engage/deflect, endings resolve/plant/owe. No
  fabricated shared history, no filler loops. Highlights: Ella's buried
  cache (+1,926 kcal, invitation accepted); Larry asking the System
  about the taken pods and Maya (owed); Ruth collecting seats ("Home
  is where someone saves you a seat without thinking"); Nora's theft
  confession and "the only nobody in a camp of somebodies"; Priya's
  dispatcher shame and "I want to be in charge" (invitation accepted).
  The goon-first driver again picked betrayal:accept while sampling
  (Amy 1601, Eduardo 1604, Tariq 1503 — "walk to the hollow, nothing
  much there"; r105 hygiene note, unchanged).

## The mechanism — why MIXED, and what it is not
Three separate mechanisms, one per finding:
1. **The lever fires rarely and late.** Only 4/8 seeds staffed any
   hunt; 16 assignments in-panel (vs r106's 17 on 4 seeds — the same
   rate, but spread thinner). The leanTrace names the gates per seed:
   - 1501: TRUST then HP. Lean days opened d16+ (26 lean dawns),
     scholar at Haven throughout. Pavel's trust peaked at 34 (died
     d18, monster, 6 points short of 40). Leo's trust climbed 18→60,
     clearing 40 only at d23 — by which time his HP had collapsed to
     28 (sickness/wounds), below the HP≥40 gate, and fell to 4 by d32
     when he died. While trust was low, HP was fine; when trust
     cleared, HP was gone. The two gates conspire across the window.
   - 1503, 1602: NO SUBSTRATE — no hunter-occupation villager ever
     (everSubstrate=[]). The layer could never fire. Roster luck.
   - 1601: substrate Earl existed; the trace shows the gate (lean-day
     and trust/HP pattern in the arm file — the analyzer's ever-
     substrate join lists Earl with no log names).
   - The hunt champion pattern holds (one hunter per seed, repeatedly
     staffed: Ethan ×9, Pavel ×3, Juan ×3).
2. **The re-roll still dominates the funnel.** On the three firing
   seeds with survival movement (1502, 1504, 1603), the arm's pantry
   and survival both moved — but pantry and survival move in OPPOSITE
   directions on 1502/1504 (more alive, less pantry) and together on
   1603. The hunt kcal (5,667 / 2,554 / 7,728) is dwarfed by the
   trajectory swings (−4,758 / −11,609 / +10,946). Same class as r106:
   the first hunt resolve re-rolls the world; the lever's food effect
   cannot be separated from re-roll luck at this panel size. The
   separate-RNG-stream discriminator remains the named next step (a
   Steve-call, not built here).
3. **Field_dressing never fires — a timing failure, not a mechanism
   failure.** 13 kills, 0 by a holder at kill time. The skill SPREADS
   (1502: gen_bcozu8k → gen_3kuepfa d8 → gen_gtd0qcv d19 →
   ethan_hunt d35 → omar_farouk d37; 1604: Emma d1 → Aki d36) but
   reaches the hunter AFTER his kills: Ethan (1502) learned it d35,
   eight days after his last kill (d27); his holdingsEnd shows it, so
   the analyzer's end-state holder count (10) overstates kill-time
   holding. Pavel (1504), Ethan (1603), Juan (1604) never hold it.
   r106's 11 fires came from Leo/Ethan holding it at kill time on the
   old base. The duty-use chain is timing-bound: the skill must reach
   the hunter before the lean-day hunt window, and the teaching chain
   arrives late. The mechanism works (r106 proved the 1.3x frac); the
   delivery is late.
- **Ella's cache (1603):** the people check is NOT measurement-neutral.
  Ella's confession paid +1,926 kcal to the pantry AFTER the day loop
  (guardrails.pantryKcal 24,313 pre-check vs pantryKcalEnd 26,239
  post-check). The native guardrails keys exposed this: on 7/8 seeds
  the people check moved nothing; on 1603 it paid. The M1 pantry
  delta for 1603 decomposes into +10,946 funnel +1,926 convo payout;
  pantryUp holds under either number, so the verdict is unaffected —
  but pantryKcalEnd mixes funnel + convo payout, and guardrails.
  pantryKcal is the pure funnel number. Standing instrument note for
  the next run (r105/r106 pantryKcalEnd values carry the same
  exposure, unknowable post-hoc).

## Hunter fates (§14c)
- Ethan Hunt (1502, trail crew lead): 9 hunts, 7 kills, wounded 3×
  (d15 14 dmg → 79 HP; d27 29 dmg → 68 HP; d41 13 dmg → 87 HP).
  Refused d16/d17 (wounded-2d) and d18 (declining) — the wound ledger
  fired exactly as designed. Survived; learned field_dressing d35.
- Pavel Dubinin (1504, bush pilot): 3 hunts, 2 kills, 0 wounds.
  Survived.
- Ethan Hunt (1603, trail crew lead): 1 hunt, 1 kill (coyote 7,728
  kcal), wounded d7 (12 dmg → 88 HP). Survived.
- Juan Macapagal (1604, exterminator): 3 hunts, 3 kills, 0 wounds.
  Survived.
- No hunter died of a hunting wound; no staffed hunter died at all.
  (Unstaffed Pavel/Leo on 1501 died d18 monster / d32 sickness — the
  trust/HP story above, not the hunt.)

## Village assessment, in plain words
Eight villages started with 12 people each, and on this base all eight
lived to day 42–43 — none scattered, none starved. That is the first
thing to say, because on the r105/r106 base one village in four died in
the window. 1501 is the long trust story: two hunters in the village,
Pavel and Leo, and the village never trusted either of them quite enough
in time — Pavel died six trust points short of being sent out, Leo got
trusted only after sickness had already taken his strength. 1502 is
Ethan's season: nine hunts, seven kills, three wounds, held back twice
while hurting, and the village ended with two more people alive than its
twin but a thinner pantry — the hunts fed people who then lived to eat.
1503 is the untouched twin again: no hunter on the roster, no hunts,
identical to its control in every number. 1504 is Pavel's second chance:
three hunts, two kills, three more alive than its twin. 1601 is the fat
village: a 52,888-kcal pantry and nine alive, and the hunt layer never
fired at all — it didn't need to. 1602 is the quiet twin: identical to
its control, no hunter, no hunts. 1603 is the thin village that got
lucky twice: one coyote worth 7,728 kcal, and Ella digging up a cache
she'd buried before the Scattering. 1604 is Juan's three clean kills
that still left the pantry thinner than its twin — the re-roll again,
not the meat. The care system kept working through all of it (145
tends, triage reaching two at a time 26 times). Nobody starved anywhere.

## The blank filled — and the one left open
FILLED: r106's open question is answered at pilot size. The n=4
HUNT-HURTS did NOT replicate — survival is up or flat on every seed,
no village lost, no hunter died. The confound r106 named is confirmed
real (the re-roll still dominates: pantry and survival move in
opposite directions on the firing seeds) and the delivery failure is
new and precise: field_dressing spreads but reaches hunters after
their kills, so it fired 0 times in-panel. The lean/eligibility trace
(FIX 2b) now names the gate on every zero-assignment seed — trust-then-
HP on 1501, no substrate on 1503/1602 — which r106 could not do.
LEFT OPEN: whether the lever helps or hurts. The panel cannot say —
MIXED is the honest verdict, and the discriminator is the separate-RNG-
stream Steve-call, not a bigger panel. The layer stays default-OFF
(HUNTSTAFF=1 only in the arm); no src/js changed; nothing about the
layer itself was "fixed."

## Base-move accounting (control vs committed r105 panel)
Same driver, same seeds, same policy — the base moved since r105:
- 1501: r105 endDay 24 / alive 8 / pantry 0 (village lost d24) →
  now 43 / 7 / 14,688. The d24 starvation death is gone.
- 1502: r105 44 / 9 / 20,582 → now 42 / 9 / 27,733.
- 1503: r105 43 / 8 / 5,186 → now 42 / 7 / 25,711.
- 1504: r105 43 / 6 / 51,208 → now 42 / 8 / 34,272.
The establishment funnel on current master is healthier on survival
(4/4 controls alive at 42; r105 had 3/4 with 1501 dead at d24) with
substantial pantries on every seed (13k–53k). The landings since r105
(Loop A enddaybeats, Loop B linkseek, stageally/finishprobe, and the
scale-onramp work) moved the establishment funnel, not just the
endgame. The r106 HUNT-HURTS verdict was measured on a starving base;
on a fed base the same lever reads MIXED. Any future re-read of r106
must carry that base caveat.

## Contests
Fired/ended per seed (arm): 1/2, 2/2, 5/5, 3/3, 2/3, 6/6, 4/4, 4/4.
Under the r101 rule (exclude fired within 2 days of run end): ZERO
stuck contests on any seed. (Ended > fired on 1501/1601 is carry-over
from pre-window firings, not a stuck count.)

## Telemetry deviation check (step 14)
Baseline: `telemetry-baselines/establishment.json` (r40 re-seed).
Command: `node scripts/telemetry-check.js --baseline
.../telemetry-baselines/establishment.json --current
'evidence/2026-11-06/journey-establishment-r107-seed*.json' --metrics
guardrails.deaths,guardrails.popAlive,guardrails.pantryKcal,c3.starvationDeaths`
Native guardrails/c3 keys worked — no post-processing needed this run.
- LOUD: `guardrails.deaths` 41 -> 270 (+559%). Same class as
  r85/r86/r99/r101/r102/r103/r104/r105/r106 — the baseline counts an
  r40-era death regime (~10/file); the current files count all
  death-tele records (~34/file). Arm 270 vs control 263 — nearly
  identical, so it is NOT a lever effect. Artifact, explained, not a
  bug. The baseline is stale since r40; a future run should re-seed it
  from a same-base CONTROL panel, not a lever arm (see metric review).
- LOUD: `guardrails.popAlive` 38 -> 74 (+95%). File-count artifact:
  baseline is 4 seeds (38 total, 9.5/file); current is 8 files (74
  total, 9.25/file) — per-file identical. Explained, not a bug.
- LOUD: `guardrails.pantryKcal` 77861 -> 210331 (+170%). REAL — the
  telemetry echo of the base-move finding: per-file arm pantry
  26,291 vs baseline 19,465; control per-file 27,714. The funnel is
  fatter on the current base. Investigated in the base-move section
  above; a measured base change, not a telemetry defect.
- Quiet: c3.starvationDeaths (0 in-panel vs baseline 1 — under the bar).
- **Baseline NOT rolled forward.** The deaths line is the known regime
  artifact; the pantry line is a base-move panel, not a new normal to
  enshrine. Re-seeding belongs to a control-panel run (metric review).

## Metric review (for the NEXT run, not this one)
- The MOVED-ONE-SEED definition counts pantry-UP, survival-UP and
  survival-DOWN — but not pantry-DOWN. Seed 1604's pantry fell 5,958
  with hunts firing and counts as "unmoved" by the letter. The
  definition should be direction-neutral on BOTH metrics (any pantry
  move counts). The r107 verdict is robust to the gap (moved seeds
  3 or 4 either way — neither is 1, and neither CHANGES nor FEEDS-ONLY
  fires), but the next prereg should fix it.
- pantryKcalEnd mixes funnel + people-check convo payouts (Ella's
  +1,926 on 1603). The next run should judge M1 pantry on
  guardrails.pantryKcal (pre-people-check) and report pantryKcalEnd
  as the post-check number — or move the people check after the out
  snapshot. Either way the two numbers must be named separately.
- The analyzer's end-state holdings check overstates kill-time
  holding for field_dressing (Ethan holds it at end, learned d35,
  kills d15–d27). The wrap's at-kill-time read is authoritative; the
  analyzer should join skill_lesson days (holder-since) instead of
  holdingsEnd when classifying USES. Same class of fix as the
  ever-substrate join — timing, not counts.
- The telemetry baseline (r40) no longer describes the current
  death-tele regime. A control-panel re-seed is owed — not from this
  lever arm.
- Still standing, unchanged: scholar-day labels skip/repeat (all
  ordering uses telemetry sequence index); census `equipped` first-row
  duplication (r99); player codex start snapshot is missing (end
  snapshot only); armor lessons are not skill_lesson rows; `ability_used`
  double-emission (pre-existing, r104).
- The diplomat "incident" half remains unimplemented (r105); out of
  scope.

## Reachable / fun / winnable (establishment)
- Reachable: MIXED — field_dressing is now UNREACHABLE as a use again
  in-window (0 fires; r106's 11 did not replicate), though the skill
  itself spreads villager-to-villager and reaches hunters late.
  Triage is the reachable one (26 uses). The other four (diplomat,
  herbal_remedy, preserve_food, wound_care) stay held and structurally
  unreachable as villager tools (r105/r106, unchanged).
- Fun: MIXED-BETTER — villages living to day 43 with food in the
  pantry IS the game working, and the people check keeps delivering
  (Ella's cache, Larry's pods, Ruth's seats). But a player who staffs
  a hunt and watches the pantry fall anyway will still feel the lever
  is a lottery ticket, not a tool — because on this panel it is one:
  the re-roll decides, not the meat.
- Winnable: BETTER on this panel — survival 8/8 vs r106's arm 2/4
  and control 3/4, no seed lost, no starvation deaths. The
  establishment risk is no longer food on this base — every village
  ends the window fed. The wave-4 wall lives further out; the
  establishment leg now hands the deepening leg living villages with
  pantries, which is what the funnel is for.

## Infrastructure notes
- Registration slow (~11 min) under REGISTRY.lock contention with
  sibling Loop B + flesh-out reaps; the register script itself was
  healthy, just queued behind the flock. Heartbeat loop held throughout
  (600s loop).
- safe-commit index clobber hit BOTH commits this run (prereg+tooling:
  4 files staged-as-deleted; lean-trace commit: 2 files with stale
  index blobs); repaired with `git update-index --add --cacheinfo`
  from HEAD blobs, verified clean `git status` + empty `git diff HEAD`
  + hash-object matches each time. The commit contents were correct
  in both cases; only the index lied.
- Proof tests: huntwire P1 4/4 + P2 det-gate identical + P3 4/4 (incl.
  leanTrace shape) — ALL GREEN, re-run after the FIX 2b amendment.
  b4 layer proof re-run ALL GREEN on this base (Part A pins, Part B
  det-gate 4/4 clean-identical, Part C smoke).
- No EPERM flap this run.
- Pre-flight note: the main tree showed 1 untracked file at run start
  (the Loop B coordinator's closeout evidence, written 09:27Z); it was
  committed as 08e8a6650 by that coordinator between my checks, and
  the tree was clean on re-check before I created the lock. The
  incident matches the new AGENTS.md main-tree index-clobber lesson
  (same file, same minute).

## Closeout
- Pre-merge check.js --quick (this branch, base 08e8a6650): **283 passed,
  7 failed in 1050s** — the standing set, no new failures: proof-update
  (stale proof inputs), workflow (retained neutrality proof stale on
  current inputs), mobile-combat-cadence (same 2 sub-failures as
  r104/r105/r106), occupation-panels (real CLI workflow), phone-frame-
  proof (stale receipt), establishment-r20-fixes (racks-full next-day
  count, known since r103), capable-bot (120s timeout, load flake —
  r106's note documents the same roulette). Identical counts to r106's
  final 283/7. This run changed NO src/js (only new scripts/ +
  evidence/), so none of the 7 can be caused by it. Targeted proofs on
  the touched areas: huntwire P1 4/4 + P2 det-gate identical + P3 4/4;
  b4 layer proof ALL GREEN (Part A pins, Part B det-gate 4/4, Part C
  smoke).
- Master moved during the run (Loop A 0821Z closeout 2592df67e landed
  after this branch's base 08e8a6650): rebase onto the new master,
  re-run proof tests on the rebased tip, then merge --ff-only.
  Merged locally, pending ship — no bump/push/live-verify; the ship
  loop owns those.
