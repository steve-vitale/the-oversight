# journey-landing r98 — run note (lane A, leg 0 LANDING)

**Run id:** laneA-20261104T1545Z (scheduled 15:45 CST 2026-11-04). Base
master@570daa9c5 at branch creation; worktree `journey-landing`. Rotation read 0
→ leg 0 LANDING; 0→1 written at run start and verified by read-back.
Prereg: evidence/2026-11-04/journey-landing-r98-prereg.md (committed BEFORE any
scored seed ran, commit 55d7c2c2 — the safe-commit index clobber struck on
that commit, same class as r90/r94/r95/r97/scale-r96: commit correct, main index
lied with the file staged-as-deleted + untracked; repaired via HEAD-blob
cacheinfo, verified `git status` clean + `git diff HEAD` empty + hash-object
matches HEAD). Panel outputs: goal hidden_files evidence/2026-11-04/landing-r98
(panel censuses/system/transcripts + analysis + pilot/panel logs + checkquick
log). Driver: scripts/journey-landing-r98-20261104.js (prepared and committed
by r97, used verbatim — fresh seeds 847–856, DAYS=28; diff-verified against
the r97 driver: only header, seeds, OUTDIR, and the R98 DOORSTEP-OUTINGLIVE
fix block differ). Analyzer: scripts/analyze-landing-r94-20261104.js
(unchanged, dir-as-argv). Fights: scripts/analyze-fights89-20261102.js
(unchanged, dir-as-argv). Shape test: scripts/test-landing-r94-shape.js.
Next driver prepared here: scripts/journey-landing-r99-20261104.js (r98
verbatim + seeds 857–866, OUTDIR landing-r99; diff-verified, node --check
clean). NOTE for the r99 runner: the OUTDIR date is 2026-11-04 — re-point
it if that run lands on another day.

## Panel verdicts (as run)

- **Q1 DOORSTEP-OUTINGLIVE FIX AT PANEL SCALE: GO on binding clauses,
  FIX-BRANCH UNEXERCISED at panel scale.** M6 clauses all hold: (a) the
  single triggered doorstep step (851 d10, kcal 685→2335, ate, enter true)
  carries a complete eatRec; (b) 0 class-E scholar starvation deaths
  (0 starvation deaths of any class on the panel); (c) 0 triggered steps
  ending with enterResult===false. BUT the fix's new branch — a needy
  scholar at Haven eating DESPITE a live outing — never fired: across
  281 doorstep checks there were 0 'outing-live' skips (skipped:
  already-inside 56, fed-and-watered 211, in-combat 1, not-at-haven 12),
  and the one triggered step carried liveOuting=false in the live log
  (its outing had delivered before the check). The r97 seed-843 replay
  remains the ONLY proof of the new branch. This is not a failure — the
  panel never produced the shape — but the fix must NOT be cited as
  proven at panel scale. The live-run pass carried over: 2 broken-promise
  ends, both endOk true (854 Ursula d13, 855 Nathan d13, both 0-kcal
  unloads with the promise-missed line); 0 endOk false; 0 "Finish your
  current outing" refusals; all 5 waited seeds departed.
- **Q2 WATER CLAUSE: UNTESTED again** (0 wild water skips; 13 wild outing
  iterations, min hydration 78, 0 under 25). Standing since r87 — now
  thirteen runs deep.
- **M1 ALIVE-D14: 10/10 PASS** (day-14 pops: 847:10, 848:11, 849:12,
  850:11, 851:12, 852:9, 853:11, 854:10, 855:12, 856:9; overAt None on
  all ten seeds).
- **M2 SYSTEM CONTACT: 10/10 PASS** (first contact day 9 on pilot 847,
  day 8 on all nine panel seeds, all ≤d10).
- **M3 FIGHT-LOG: PASS** — panel 21 hunt fights, 21/21 complete, 1 fatal,
  0 unknown/mixed trigger. The fatal is a clean monster-approach loss
  (853 d17, Ursula vs Choir Toad w1, lost, fled false, player HP 96→−10).
  Note (not a verdict item): 6 ZERO-DMG others-killed fights (848 ×5,
  852 ×1) — the scholar struck 0 blows while allies killed; the wild-ally
  shape, recorded here, not a defect claim.
- **M5 PEOPLE: PASS.** Wind-down more 9 picks, 0 empty; WD probe GATE-A
  GO, GATE-B GO; betrayal held-offers 0; party invites 3 offered / 3
  spoken / 0 dry / 1 accepted; case labeling 8/8. Two full transcripts
  read (851 day 10 Sofia, 847 day 9 Carmela) — both contentful, no
  fabricated shared history (see People check).
- **M6 DOORSTEP: GO** (see Q1 — clauses hold; branch unexercised).
- **M7 GUARD v3: kcal PASS, water UNTESTED.** Kcal skips 3 → arrivals 3,
  rescue ladder 3/3 complete, eat-on-arrival 3/3 ate (853 d9: 360→2310;
  854 d12: 0→2400; 855 d12: 564→2364; all from outside the hall,
  enter=true), 0 refusals, 0 guarded skip-day starvations. Water
  skips 0 (see Q2).
- **M8 SHAPE: PASS** on pilot corpus and on all 10 panel censuses
  (water arrivals 0, kcal arrivals 0–1 per seed).
- **M9 STAY-GREEN: NO-GO on the self-sufficiency clause only, narrow.**
  Death liturgy exact (griefMiss 0/25; every panel death REGISTERED;
  succession latency [1]); theft 0 all seeds; plenty-voice 29–56 all
  seeds; starvation clause PASSES (0 starvation deaths — the first
  clean starvation panel since r96). The miss: seed 854 selfSuff 0.695
  < 0.70 floor (by 0.005), even though 854 ends FED at horizon
  (2675/person) with no starvation death — the ratio and the pantry
  line disagree on that village. No threshold changed (gating freeze
  stands); the miss is reported, not re-scored.
- **M10 DAWN-DOOR, LIVE-ONLY (binding): PASS.** 223 panel opps,
  waitDiagMissing 0. Live promises 44 (waiting 5, has-run 39);
  ledger rows 179 (the r89/r94 counting artifact, reported separately,
  never counted as door blocks). 5 waited live opps, sidestep attempts
  4, ok 3, readyAfter 1, 0 unexplained door blocks. Caveat (probe
  reach, not a game block): on 848 no favor ever waited at dawn — the
  probe could not reach the partner (hall-door adjacency stall, same
  class as r74/r95/r96/r97).

## Village assessment (plain words)

Ten villages, all alive at day 14, all contacted by the System on day 8–9.
What they look like at the day-28 horizon:

- **847 (Rahul's village, 12→9):** the wound village. Three deaths, all
  wounds that wouldn't close (Daniyar d9, Farid d11, Matías d23) — no
  monster kill among them, no scholar death. Hungry at horizon
  (1211/person) but never starved; one monster-meat test (nightcourt,
  safe), no pantry exit yet. Two contests: Wheel of Teeth won, The
  Witness lost.
- **848 (Donna's village, 12→10):** the meat village. Fatima ambushed d7,
  Bayan killed by a monster d17. Fed (2059/person), 22 kills, three meat
  tests all safe with 7 pantry exits — the panel's fullest meat channel.
  The probe never reached a dawn wait here (hall-door stall), so its
  joint outings never got their window.
- **849 (Jamie's village, 12→10):** the thin village. Rowan's wound d22,
  Meera's monster d27; hungry at horizon (643/person) on a slow bleed
  that never hit zero. Three meat tests, all safe, no exits.
- **850 (Vera's village, 12→10):** the killer village. 31 monster kills,
  the panel high, five meat tests — but Thabo ambushed d6 and Adaeze
  killed d26. Fed and rich (5477/person).
- **851 (Gerald's village, 12→10):** the doorstep village. Rafael ambushed
  d15, Gulsah killed d19 — but Gerald himself ate at the doorstep on
  day 10 (685→2335) on the panel's only triggered step, and the joint
  outing with Gulsah delivered (150 kcal kept). Fed (3095/person).
- **852 (Hilda's village, 12→9):** the poison village. Jovan's wound d5,
  Akua's monster d9, Consuelo's Murkcap d10 — three different deaths in
  the first ten days, then quiet. Fed (3670/person).
- **853 (Ursula's village, 12→10):** the village that changed leaders.
  Filip killed d11, Ursula herself died in the wild d17 (Choir Toad),
  Simone took the mantle d18. Hungry at horizon (1195/person) and the
  panel's only scholar-kcal slide — the death, not starvation, is what
  bent this village.
- **854 (Betty's village, 12→10):** the paradox village. Omar ambushed
  d10, Jesse's wound d12 — and the guard brought Betty's scholar home
  hungry at kcal 0 on d12 and fed her to full (0→2400). Fed at horizon
  (2675/person), no starvation death, yet self-sufficiency 0.695 — the
  M9 narrow miss. Its broken outing (Ursula) was ended cleanly d13 by
  the live-run pass.
- **855 (Amelia's village, 12→11):** the steadiest village. One death
  (Cecília's wound d22), fed enough in ratio terms (0.97) but hungry by
  the per-person line (753/person) — the two measures disagree here
  too, in the other direction from 854. Guard arrival d12 fed the
  scholar (564→2364); broken outing (Nathan) ended cleanly d13.
- **856 (Michelle's village, 12→7):** the hard fortnight. Five deaths —
  Nora ambushed d6, Bao and Esteban to monsters, Wolfgang to a Highbeam
  Deer and Rafael to The Loud Beast both on d27. Still fed at horizon
  (2571/person). The wild takes its share even in a fed village.

What they know: every village knows the System by day 9, knows monster
meat is being tested (9/10 seeds ran tests; 4 reached a pantry exit),
knows the naming debate (beast names voted around fires). What is
missing: on 849/853/855, food that reaches the per-person line — and on
854, a self-sufficiency ratio that matches the fed pantry in front of
it.

## People check (full transcripts read)

- **851 day 10, Sofia (probe sitting, curious, resolution=engaged):** a
  real philosophical opening ("The world's ended. We're what's left.")
  answered bleakly and honestly, then the case thread lands ("There's
  still the matter of the ambush of Rafael. Nobody's settled it.") with
  the full moot/witness/site menu, a subject-change deflection ("Forget
  I said anything. What did you want?"), and a beast-naming thread with
  real votes (Big Beast, Ugly Beast, Big Thing, Loud-Eyes). Ends
  resolved ("Good talk. I feel like I know you a little better now.").
  No fabricated shared history; menu re-offers are the probe's
  topic-hopping, not a filler loop.
- **847 day 9, Carmela (probe sitting, goal thread depth 7):** one want,
  pursued all the way down — "Home is where they save you a seat. I'm
  looking for my seat" → "Belonging means they notice when you're
  gone" → "Just... include me. In things. That's all I want." The
  wind-down lands on the same line, and the sitting closes warm
  ("Come back anytime."). A person wanting belonging, not a menu.
  No fabricated shared history.

## Blank filled or documented (no code change)

**Documented, not fixed: the doorstep-outinglive branch is unexercised
at panel scale.** The r98 driver fix is correct on its replay proof
(r97 seed 843) and the binding clauses hold on this panel, but no
doorstep check on seeds 847–856 ever saw a live outing — outings
deliver before the check runs, or the scholar is already inside. So the
branch the fix changed (needy + live outing → eat) has zero panel
exercises. Do not cite the fix as panel-proven; the r99 panel is where
the shape may recur, and if it does not recur there either, the next
run should consider a targeted repro (a seed/day engineered to hold an
outing live across the doorstep check) rather than another blind panel.
**Instrument watch:** the census serialization strips `liveOuting`
from doorstep steps (census step keys carry no such field) — the branch
can only be adjudicated from the live driver log's HAVEN-DOORSTEP
lines or the MET dump, not from the census. The analyzer's doorstep
section inherits this blindness; a future instrument pass should carry
the field through to the census.

## Reachable / fun / winnable (leg 0)

- Reachable: yes for contact (d8–9 every seed), food, talk, favors, and
  outings — all 5 waited seeds departed, the rescue ladder fired 3/3,
  the doorstep step fired 1/1 when it reached a needy scholar. The
  unreached part is probe-side: on 1 seed (848) no favor ever waited at
  dawn (hall-door stall), so that village's joint outings never got
  their dawn window.
- Fun: the fortnight reads like people surviving together — asks with
  reasons, a belonging thread pursued to depth 7, naming debates,
  grief that registers, a village that changes leaders and carries on.
  The unfun residue is honest and unchanged: outings that walk out
  together and find nothing (patch exhaustion, 5 together-blocks on
  "0 kcal" panel-wide), and villages that end hungry on a slow bleed
  without ever starving (4/10 by the per-person line).
- Winnable: leg 0 unchanged in difficulty; no gate or balance change.
  Ten villages hand establishment a living, System-contacted village
  with kills banked and (on 9/10) meat knowledge started. The one
  scholar death (853, the wild) is the game's difficulty, not a trap —
  no scholar starved, no scholar died to a door.

## Instrument watches (documented, not defects)

- **Armor tele/line disagree, 9/10 panel seeds** (r98 analyzer R69
  teleLineDisagree=9). Same class as r69/r95/r96/r97 — neither series
  should be cited for armor craft counts until the units are reconciled.
  Armor itself is fine (wearers present, bark/hide flowing).
- **Horizon pantry thin on 4/10 panel seeds** (847, 849, 853, 855 by the
  <2000/person line). The analyzer flags it PATTERN ("collapse recurs —
  lever work candidate"). No panel seed's pantry hit 0 before d28, so
  this panel's thinness is a slow bleed, not a famine.
- **Flesh channel:** 4/10 arrival seeds, 9/10 test seeds, 4 exit seeds,
  0 stuck seeds — CHANNEL OPENS.
- **Creek tile (4,3) evening-home block, again:** 851 Gulsah's haul
  blocked on "hop home failed: player=(4,3) home=(4,4)" (same tile as
  r97's (5,3) shape, one tile over); the delivery chain still recovered
  it (deliver-walkhome d10). Watch, not a defect claim.
- **Contests open at horizon 3** (fired 17, ended 14, orphanEnds 0) —
  in-progress shows at the d28 horizon, not orphans.
- **Self-sufficiency vs pantry line disagree** (854 FED but 0.695;
  855 hungry-per-person but 0.97): the two measures describe different
  things; neither alone should be cited as "the village is fed."

## Metric review

- M9's self-sufficiency clause binds even when the starvation clause
  passes and the pantry line says FED (854): a village can be "fed" in
  one measure while missing the ratio floor. No threshold changed this
  run (gating freeze stands); the 0.005 miss is reported as a miss,
  not rounded away and not re-scored.
- M6 reporting convention from r97 kept: step-mechanics GO reported
  alongside the branch-exercise caveat, never conflated — a triggered
  step passing its eatRec does not prove the unexercised branch.
- No thresholds changed this run. The fizzle convention from r96 (flag
  only on thread exhaustion) was kept; the verdict rests on the two full
  reads plus the wind-down/probe gates, all green.

## Telemetry deviation check

Ran `node scripts/telemetry-check.js --baseline
.../telemetry-baselines/landing-split.json --current
'<landing-r98 census glob>' --metrics systemDay,monsterKills`. 2 LOUD
lines, BOTH EXPLAINED as aggregation artifacts (same class as r94/r95/
r96/r97), baseline NOT rolled: (1) systemDay baseline 33 → current sum
81 over 10 files (per-seed 9 + 8×9, mean 8.1); (2) monsterKills baseline
pooled mean 24 → current sum 183 over 10 files (per-seed mean 18.3,
range 12–31). No behavior change is indicated.

## Closeout note

- Commit: prereg (already committed 55d7c2c2) + this note + r99 driver
  (tooling/policy only, zero src/js).
- Quick suite: `node scripts/check.js --quick` — 284 passed, 6 failed in 508s
  (landing-r98-checkquick.log). The 6 are EXACTLY r97's standing set
  (measurement-proof-update, measurement-workflow, mobile-combat-cadence,
  occupation-panels, phone-frame-proof, establishment-r20-fixes); r97's
  timeout extras (trust-observer-neutrality, capable-bot, table-endings)
  ran slow (60s/40s) but passed this time, and measurement-cache-flags
  stays gone. None is attributable to this run: this run changed zero
  src/js and zero existing tests, and no failing test references any
  r98/r99 file (verified by grep) — all 6 are the same proof-freshness
  class as r97's standing set. Reported here, not fixed — other lanes'
  proof-freshness maintenance, not this leg's findings.
- Merged locally, pending ship (no version tag; ship job owns it).
- Heartbeat: standing loop (600s) held the registry beat through the
  run; beats verified in the registry (22:05 registration, 22:15 loop
  beat, active throughout).
  The run's own lock held throughout.
