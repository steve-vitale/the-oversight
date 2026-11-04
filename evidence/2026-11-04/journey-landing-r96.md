# journey-landing r96 — run note (lane A, leg 0 LANDING)

**Run id:** laneA-20261104T104529Z (scheduled 04:45 CST 2026-11-04). Base
master@02158dbea at branch creation; worktree `journey-landing`. Rotation read 0
→ leg 0 LANDING; 0→1 written at run start and verified by read-back.
Prereg: evidence/2026-11-04/journey-landing-r96-prereg.md (committed with
this run). Panel outputs: goal hidden_files evidence/2026-11-04/landing-r96
(panel censuses/system/transcripts + analysis + fights + checkquick logs)
+ landing-r96-pilot/ (seed 827) + pilot analysis. Driver:
scripts/journey-landing-r96-20261104.js (prepared and committed by r95,
used verbatim — fresh seeds 827–836, DAYS=28, R96 LIVE-RUN PASS). Analyzer:
scripts/analyze-landing-r94-20261104.js (unchanged, dir-as-argv). Fights:
scripts/analyze-fights89-20261102.js (unchanged, dir-as-argv). Shape test:
scripts/test-landing-r94-shape.js. Next driver prepared here:
scripts/journey-landing-r97-20261104.js (r96 verbatim except seeds 837–846,
OUTDIR landing-r97, header; diff-verified, node --check clean).

## Panel verdicts (as run)

- **Q1 LIVE-RUN PASS (binding): GO.** Six broken-promise live runs ended
  at dawn, six ends ok, zero failures: pilot 827 Ruth d9; 832 Lamia d11
  and Somchai d15; 833 Emmett d8 and Priya d11 (both with a last-tile
  walk, [3,4]→[4,4], arrived true — the r89 LASTTILE pattern inside the
  pass, working); 835 Elijah d8. Every end line is honest ("The promise
  was missed; unloading does not earn kept-promise credit"). Panel-wide,
  "Finish your current outing before starting another" refusals: ZERO
  (r95: 2, both on seed 821). All 5 waited live opps departed (7
  departures across the 5 waited seeds; departSeeds 5/9 = every waited
  seed). No waited live opp ended NO-DEPART for any reason. Causal
  caveat, stated plainly: the end→depart join is seed-level on 833/835
  (ends + departs on the same seed), not per-wait proven — the causal
  proof remains r95's seed-821 replay (end Raj d11 → Chloe departs d11).
  This panel proves the pass fires cleanly at scale with no refusal
  residue. Trade-off note: all six ends hauled 0+0 kcal (patches
  exhausted), so the r95 early-end-forfeits-late-haul trade-off did not
  bite here — but it stands as principle for a future haul-carrying end.
- **Q2 WATER CLAUSE: UNTESTED again** (0 wild water skips; r86
  opportunity: 5 wild outing iterations, min hydration 72, 0 under 25).
  Standing since r87 — now ten runs deep.
- **M1 ALIVE-D14: 10/10 PASS** (day-14 pops: 828:12, 829:10, 830:10, 831:10,
  832:11, 833:12, 834:12, 835:12, 836:8, pilot 827:10). Only early-over
  seed is 829 at d22, after the window.
- **M2 SYSTEM CONTACT: 10/10 PASS** (first contact day 8 on all ten seeds).
- **M3 FIGHT-LOG: PASS** — 14 hunt fights, 14/14 complete, 2 fatal,
  0 unknown/mixed trigger. Fewer fights than r95 (29) — three seeds
  recorded zero hunt fights (829/831/834); completeness, not count, is
  the metric. Both fatals are clean Highbeam Deer losses (830 d14: dealt
  72 + 274 ally damage, died at −32 HP; 836 d14: three stone-knife
  strikes for 77, died at −1 HP).
- **M5 PEOPLE: PASS (adjudicated — see below).** Wind-down more 6 picks,
  0 empty; WD probe GATE-A GO, GATE-B GO; betrayal held-offers 0; party
  invites 7 offered / 7 spoken / 0 dry / 2 accepted; case labeling 10/10;
  theft 0. Two full transcripts read (835 day 6 Rita probe sitting;
  828 day 11 Jorge natural sitting) — both contentful, no fabricated
  shared history (see People check). Fizzle counting uses the revised
  metric adopted in the prereg (flag only on thread exhaustion); neither
  read sitting fizzles under it.
- **M6 DOORSTEP: UNTESTED this panel, not failed.** 248 panel checks +
  28 pilot checks, triggered 0 (skips: fed-and-watered 185, already-inside
  55, not-at-haven 4, outing-live 4 panel). The binding clauses are
  vacuous at zero triggers — reported as UNTESTED, never as a pass. The
  rescue itself stays proven by r95's 2 triggered steps and by this
  panel's eat-on-arrival 5/5 (below).
- **M7 GUARD v3: kcal PASS, water UNTESTED.** Kcal skips 5 → arrivals 5,
  rescue ladder 5/5 complete, eat-on-arrival 5/5 ate (832 d10: 0→2400;
  835 d7: 0→2400; both from outside the hall, enter=true), 0 refusals,
  0 guarded skip-day starvations. Water skips 0 (see Q2).
- **M8 SHAPE: PASS** on pilot corpus and on all 9 panel censuses
  (water arrivals 0, kcal arrivals 0–2 per seed).
- **M9 STAY-GREEN: MISS on two clauses (see below).** Death liturgy exact
  (griefMiss 0/32 panel, 0/4 pilot; every panel death REGISTERED;
  succession latencies all 0); theft 0 all seeds; plenty-voice 16–56 all
  seeds. The misses are both seed 829: 1 starvation death (Aubrey d20)
  and self-sufficiency 0.678, below the 0.70 floor. The starvation death
  is CAUSE CLASS D (at Haven, pantry empty — village famine), NOT
  class-E: pantry at death 0, village pantry fell 47250 (d1) → 0 (d19).
  No guard or door failure is implicated — this is the horizon-pantry
  pattern (r95 watch: 4/9 thin) biting harder: 5/9 panel seeds hungry at
  horizon, one famine death. Carried as a lever-work candidate, not a
  code fix this run — the famine is a food-economy outcome, and per the
  binding metric a miss is NO-GO, never re-scored.
- **M10 DAWN-DOOR, LIVE-ONLY (binding): PASS on its clauses.** 395 panel
  opps + 68 pilot opps, waitDiagMissing 0. Live promises 132 (waiting 5,
  has-run 98, node-not-home 2, kept 27); ledger rows 263 (the r89/r94
  counting artifact, reported separately, never counted as door blocks).
  5 waited live opps, 5 approaches, sidestep attempts 10, ok 8,
  readyAfter 2, 0 unexplained door blocks. Caveat (probe reach, not a
  game block): on 828/829/832/834 no favor ever waited at dawn — the
  probe could not reach the partner ("Your partner is inside the Haven
  hall" / "Move next to your partner, on the same side of the Haven
  door"), the same Haven-door adjacency stall noted in r74/r95. The
  game door is not implicated; the probe's walk-toward stalls at the
  hall door.

## Village assessment (plain words)

Ten villages, all alive at day 14, all contacted by the System on day 8.
What they look like at the day-28 horizon:

- **828 (Leah's village, 12→10):** steady. System day 8, 25 monster kills,
  pantry healthy (self-sufficiency 0.943, plenty-voice 56). The scholar
  died in a contest on day 26 and the mantle passed; the village carried on.
  Jorge, day 11, is shy with strangers and says so — and means it.
- **829 (Leah's village, 12→6): the famine village.** The pantry bled out
  across the fortnight (47250 → 0 by day 19) and never recovered. Tom died
  of thirst day 10, Nathan day 13, then Scarlett (wound), Nora (sickness),
  Aubrey (starvation, day 20, at Haven with an empty pantry), Luis (a
  bad experiment, day 21). The village scattered day 22 with six people
  left. Monster-meat work stalled here too: Nathan proved sweeps-week
  safe, but nothing ever reached the pantry. This is the one village
  that hands establishment a starving remnant, not a foundation.
- **830 (Brayden's village, 12→8):** hard hunting. The scholar died day 15
  to a Highbeam Deer in a real fight — three hatchet strikes, allies
  dealing most of the damage, still lost. Otherwise fed (0.975) with 22
  kills; a kept outing is not among them, but the village eats.
- **831 (Kieran's village, 12→10):** the killers. 37 monster kills, no
  scholar death, fed (0.919). The fortnight's most dangerous village,
  and it shows in the pantry.
- **832 (Darnell's village, 12→9):** steady with a contest death (day 25).
  The live-run pass did quiet work here: two broken outings ended clean
  (Lamia, Somchai) instead of blocking the next promise.
- **833 (Felicia's village, 12→11):** the social village. No scholar
  death, 29 kills, and the panel's kept outing — Lucas, day 8, 300 kcal
  delivered and kept. Rita (day 6) wants a day "where I laugh until it
  hurts and it's not from nerves" and collects jokes like firewood.
- **834 (Ellie's village, 12→9):** quiet, fed (0.872), 23 kills, no scholar
  death. Favors existed but never waited at dawn (hall-door stall).
- **835 (Elena's village, 12→10):** the pass's other showcase — Elijah's
  broken run ended day 8, and the village's waited outing departed.
  Fed (0.918), 26 kills.
- **836 (Eric's village, 12→9):** the scholar died day 14 to a Highbeam
  Deer (three stone-knife strikes for 77 damage, died at −1 HP) and the
  mantle passed the same day; the village held at 9. Fed enough (0.797)
  but the thinnest margin of the survivors after 829.
- **827 pilot (Sidney's village, 12→8):** fed at horizon (3308/person),
  no scholar death, no starvation, three outings kept. The pilot's
  broken Ruth run ended day 9 with the honest line.

What they know: every village knows the System by day 8, knows monster
meat is being tested (9/10 seeds ran tests; 6 reached a pantry exit),
knows the naming debate (beast names voted around fires). What is
missing: on 829, food itself — the village that cannot feed itself cannot
use anything else it learned.

## People check (full transcripts read)

- **835 day 6, Rita (probe sitting, 25 turns):** a real want — the pantry
  run, purslane past the treeline at sunup, pack and knife — committed
  and promised ("forage with Rita tomorrow to rebuild the pantry"). The
  personal thread lands ("The nights are the hardest. Days, you're busy.
  Nights, you're just... with it all"), the goal thread lands ("I want
  one day where I laugh until it hurts"), and the wind-down lands
  ("I'm collecting jokes like firewood"). Map compares teach real
  ground (map grows by 4 places, then honestly "nothing new"). The two
  verbatim repeats are the subject-change deflection ("Anyway. What did
  you want?") under probe topic-hopping — a deflection, not a filler
  loop; the sitting pursues threads to depth 2 and ends resolved.
- **828 day 11, Jorge (natural sitting, 7 turns + beast beat):** shy
  opener, engaged by kindness ("Neither am I, honestly" → "Something
  eases in their shoulders"). The party invite is refused WITH a reason
  tied to relationship ("I don't know you well enough for that. Ask me
  again when we've survived something together") — the
  invitations-sometimes-taken logic working as designed, not a flat no.
  He then offers his own thing (walk the trap line), takes the decline
  gracefully ("Fair enough. Rain check."), and the sitting closes with
  a beast sighting and a naming vote with tallies (Big-Eyes leading).
  No fabricated shared history; ending resolves ("Good talk. I feel
  like I know you a little better now").
- Panel-wide people signals agree: party invites spoken 7/7, betrayal
  offers spoken with zero held, case framings naming their target 10/10.

## Blank filled (tooling, no src/js): r95's live-run pass, panel-proven

r95 folded the r75 live-run pass into the driver line and replay-proved
it on seed 821. This panel proves it at fresh-seed scale: 6/6 ends ok,
zero live-run refusals, every waited outing departed. The r74 stuck-live-
outing blank is now closed in the driver line — a competent player ends
a dead outing at dawn instead of carrying it forever, and the panel
shows the game (and the village's promises) behaving better for it.
What the pass does NOT fix, and this panel shows plainly: outings that
depart still break when the patch gives nothing (togetherBlocked 7, all
"0 kcal" — the patch-exhaustion shape, same as r95's Chloe-haul-0). The
door is open; the ground is empty. That is the next landing blank, and
it is a world-content question (patch yield/regrowth), not a door fix.

## Reachable / fun / winnable (leg 0)

- Reachable: yes for contact (d8 every seed), food, talk, favors, and
  outings — five waited outings departed on this panel, against four
  seeds where the probe never reached a waiting partner (hall-door stall,
  probe-side). The rescue ladder fired 5/5 and the doorstep step did not
  need to fire (villages were fed at Haven).
- Fun: the fortnight reads like people surviving together — asks with
  reasons, refusals with reasons, naming debates, grief that registers.
  The unfun residue is economic, not social: one village starving while
  its neighbors eat, and outings that walk out together and find
  nothing. Both are honest game states, not broken instruments — but
  829's famine is the least fun shape on the panel, and it is the one
  that hands establishment a broken village.
- Winnable: leg 0 unchanged in difficulty; no gate or balance change.
  Nine villages hand establishment a living, fed, System-contacted
  village with kills banked. 829 hands it a starving remnant — the
  winnability question for leg 0 is now "can a village recover from a
  famine fortnight," which belongs to establishment, not landing.

## Instrument watches (documented, not defects)

- **Armor tele/line disagree, 9/9 panel seeds (+ pilot pattern).**
  Telemetry craft counts vs narration craft lines disagree on every
  seed (same class as r69/r95) — neither series should be cited for
  armor craft counts until the units are reconciled. Armor itself is
  fine (wearers present, bark/hide flowing).
- **Horizon pantry thin on 5/9 panel seeds** (829: 0, plus four more
  flagged hungry by the analyzer's HORIZON PANTRY check; pilot 827 FED).
  The analyzer flags it PATTERN ("collapse recurs — lever work
  candidate"). With 829's famine death, the watch is now a finding for
  a future lever run, not a gate miss to re-score here.
- **Flesh channel stuck on 829** (sweeps_week safe at horizon, exit 0;
  panel otherwise 7/9 arrivals, 9/10 tests, 6 exits — CHANNEL OPENS).
- **Contests open at horizon 6** (fired 20, ended 14, orphanEnds 0) —
  in-progress shows at the d28 horizon, not orphans.

## Metric review

- The fizzle revision proposed by r95 was ADOPTED in this run's prereg
  (flag only on thread exhaustion) and applied to M5; raw flag counts
  were not separately tabulated because the analyzer's people blocks do
  not emit a fizzle counter — the verdict rests on the two full reads
  plus the wind-down/probe gates, all green. Next landing run: if it
  wants a citable fizzle count, it needs the instrument to emit one;
  this run does not claim one.
- M6 at zero triggers: this run's practice — UNTESTED, never PASS — is
  the correct reporting for a guard that did not fire, and should stay
  the convention. A future panel with a triggered doorstep step closes
  the r95→r96 gap (last doorstep positive remains r95's two steps).
- No thresholds changed this run (gating freeze stands).

## Telemetry deviation check

Ran `node scripts/telemetry-check.js --baseline
.../telemetry-baselines/landing-split.json --current
'<landing-r96 census glob>' --metrics systemDay,monsterKills`. 2 LOUD
lines, BOTH EXPLAINED as aggregation artifacts (same class as r94/r95),
baseline NOT rolled: (1) systemDay 33→72 is a 9-file sum (per-seed 8.0
— day 8 on every seed, matching r95's per-seed 8); (2) monsterKills
24→203 is the baseline's pooled MEAN (its own note says so) vs a 9-file
sum (per-seed mean 22.6 ≈ 24; per-seed kills 7–37). No behavior change
is indicated.

## Closeout note

- Commit: prereg + this note + r97 driver (tooling only, zero src/js).
  No [needs-eyes] — no player-facing change.
- Quick suite: `node scripts/check.js --quick` — 282 passed, 8 failed
  in 1147s (landing-r96-checkquick.log). r95's standing set was 6
  (measurement-proof-update, measurement-workflow, mobile-combat-cadence,
  occupation-panels, phone-frame-proof, establishment-r20-fixes); all 6
  recur here. Two more fail on this tree: measurement-cache-flags (4
  cache-identity assertions, 0 passed) and trust-observer-neutrality
  (check.js TIMEOUT after 120s, seeds passing before the cut). Neither
  is attributable to this run: this run changed zero src/js and zero
  existing tests, and neither failing test references any r96/r97 file
  (verified by grep) — both are the same proof-freshness/load class as
  r95's standing set, moved by sibling landings since r95's check (the
  base moved def4f8f40 → 02158dbea). Reported here, not fixed — other
  lanes' proof-freshness maintenance, not this leg's findings.
- Merged locally, pending ship (no version tag; ship job owns it).
- Heartbeat: standing loop (540s) held the registry beat through the
  run; beats verified in the registry (active, fresh at each check).
  The run's own lock held throughout.
