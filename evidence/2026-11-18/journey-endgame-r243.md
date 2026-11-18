# Journey endgame r243 — run note (Lane B leg 4, 2026-11-18)

Leg 4 (endgame). Rotation-b read 4 at run start — a legitimate leg-4
run: the full cycle turned today (r239 endgame 4→5, r236 social 5→6,
r240/r241 crisis 6→7, r233 succession 7→4 at 19:27Z). Substrate master
6a97f3a07 exactly. Probe scripts/probe-endgame-r243-20261118.js (r239
probe verbatim except renames, dates, substrate comment, + PLAN-map
entries 89790–89797 — verified by diff: only renames, dates, comment
reflows, the substrate comment, and the new band; zero logic change).
Analyzer scripts/analyze-endgame-r243-20261118.js (same treatment).

## Run-start incidents (infrastructure, not measurement)

- Lock: none present at run start. This run's lock written
  2026-11-18T19:55:17Z. Deleted at closeout.
- Main tree: `git status --short` 0 lines, disk 49% (fail line 85%).
- `git pull` "Already up to date" at 19:56Z (master 6a97f3a07).
- Reaper ran at run start: 13/16 active; LOUD-dirty trees from other
  owners (journey-scale-attr, sim-secondlink-a, sim-redactor-a,
  sim-saycap-a, sim-siegedialog-a, sim-inffight-ab, sim-fleerepair2-b)
  never auto-removed, not mine to touch. No cleanup this run.
- Registration: `worktree-register.sh journey2-endgame` completed in
  ~2.2 min. Branch journey2-endgame did not exist (deleted at the r239
  adoption release), so `-b` created it fresh at master. Heartbeat
  landed at registration (2026-11-18T20:02:43Z); hbloop
  journey2-endgame-hbloop-r243.sh started, every 5 min.
- EVIDDIR set explicitly on EVERY pass invocation (r237 incident
  lesson). No overwrite: all pass corpora verified intact and distinct
  at closeout.

## Headline

The buyout road converted on the matched band on BOTH live passes
this round (Pass C: 89702 FULL d101; Pass D: 89705 FULL d90) — but
the gate opened on exactly one seed per pass (C 1/6, D 1/6), and on
none of the eight fresh seeds (C-wide 0/8). The road converts roughly
1-in-6 seeds per pass on the matched band; the gate, not the buyout,
is the fragile link everywhere. The fresh band produced no full seat
this round (r239 had 89781 d92) and only one wave-5 facing seed
(89795, ×2, without converting).

Pass A re-rolled twice: 89702's wave-5 facing vanished (r239: faced
×4 d80–87; r243: mentioned d74, never faced) and 89706's village
scattered d69 on a food collapse (r239: sat d90). Attribution is
weak by the run's own admission — NOTICKEXACT and the triodrought
carry are unobservable in this corpus (no brain-log fields), the
tableSitting distinction is vacuous (no muster ever fired), and
dialogue/RNG-draw shifting remains the standing attribution. The
instrument owed: persist the brain deferral and companion carry
into the per-seed JSON.

Pass D's second sighting does NOT repeat r239's uplift (kills 6 vs
13, full 1/6 vs 2/6; level with its own Pass C on seats, below on
kills). The r239 D effect reads as a seed-band/RNG artifact now.

No F1 recurrence (every surviving seed sat; the one loss scattered
before the window). F5 and C3d vacuous for a fourth straight round.
People check PASS on all three transcripts read in full; 0 dry lines
and 0 `SYSTEM: ""` lines on all 26 transcripts.

## Metric review

- M23b tally: Pass A 0/6 (r239: 1/6), Pass C 1/6 (89702@d86,
  DELIVERED; r239: 0/6), C-wide 0/8 (r239: 89781 gate ok d84 —
  recorded separately), Pass D 1/6 (89705@d73, DELIVERED; r239: 2/6).
- F5 + C3d stay vacuous on the endgame leg for a fourth straight
  round — the watches need a panel whose sittings reach them, not a
  metric change. The succession leg's F5 FAIL as written (r233)
  stands; the Amanda fix moves nothing observable in the wild count.
- GUARD-STALL WATCH (adopted this run): longest same-reason run 7
  days (89704-A d90–d96), threshold 30 — no stall. The watch works
  as specified; keep it. Note the 89701-A 29-day deferral is a
  wait/not-ready alternation, not a stall — if the watch is meant to
  catch long deferrals generally, it needs a total-deferral variant
  (propose for the next run, do not re-score here).
- Telemetry baseline (r188): Pass-A 5-seed sums uw 21 vs 22, won 5
  vs 4, peakVet 3 vs 8 — ONE LOUD line (peakLivingVeterans -62%).
  Adjudicated: the drop from 8 happened at or before r239 (r239:
  4 vs 8, already explained — re-roll seeds banking no veterans);
  this round's 3 vs r239's 4 is one veteran of noise, kills still
  happen panel-wide (Pass A 6 vKills). The baseline's peakVet 8 no
  longer represents the current regime — propose re-baselining the
  peakVet key on the next run rather than rolling it now. Baseline
  NOT rolled.
- Pass D (FIGHTALLY2): SECOND observation tally — kills 6 (C 10, A
  6; r239 D 13), full 1/6 (C 1/6; r239 D 2/6), wave-5 faced 2/6
  seeds (C 1/6 seeds). Effect not reproduced. The lever stays
  env-gated OFF; no third sighting is owed unless a fix arm changes
  the fight engine.
- companionGuardSkips watch: A 10, C 11, C-wide 2, D 15 (r239: A 10,
  C 12, C-wide 2, D 15 — D identical again). HOLD as a watch.
  deathCleanups per seed: A 11, C 12, C-wide 21, D 11; removal
  cleanups A 1, rest 0; no stranded launch observed on any pass.
- NOTICKEXACT / TRIODROUGHT instrument gap (new this run): the
  per-seed JSON carries no brain deferral or companion-carry field,
  so two LIVE launch levers are unobservable on the panel. Instrument
  owed for the next run: persist `party_launch:no-tick-exact`
  deferrals and companion2/3 carry into the per-seed JSON (or the
  next launch-lever panel cannot attribute a re-roll).

## Gate + telemetry

- Telemetry: ONE LOUD line (peakLivingVeterans -62% vs the r188
  baseline: 3 vs 8, n=5 files) — adjudicated above as the explained
  regime-level drop (r239 already 4 vs 8); uw 21 vs 22 and won 5 vs
  4 are quiet. Baseline NOT rolled.
- Gate (`check.js --quick`): solo run on the worktree tip, 334 passed,
  10 failed in 1517s, 0 attributable — GO on adjudication. Standing
  set (6): measurement-proof staleness, measurement-workflow retained
  neutrality proof, phone-frame stale receipt, ladder-bundle control
  (pre-existing, base-pinned), living-garden + one-person-army 120s
  timeouts (verified solo 58s/38s by the partysize4-b adoption the
  same day). Load artifacts (4), all verified green solo by me (see
  journey-endgame-r243-gate-solo.log): cache-flags 1/1 in 25s,
  trust-observer-neutrality 1/1 in 44s, capable-bot 1/1 in 36s,
  occupation-panels 1/1 in 55s. No failure touches endgame code or
  this run's evidence.

## Closeout

Adoption closeout (2026-11-18, r243 timed out at the 3600s execution
limit with C-wide 6/8 and Pass D unstarted; adoption finished both):
- C-wide resumed (seeds 89796, 89797) with the identical pass env;
  Pass D run fresh (FIGHTALLY2=1, 6 seeds). Analyzer run for both.
- Commits: (to be filled)
- Rotation-b written 4→5 (social life next), read back.
- Lock 2026-11-18T19:55:17Z deleted at closeout after run_id
  verification. Worktree journey2-endgame released (merged), removed;
  branch deleted. Main tree clean.
- Heartbeat kept alive for the whole adoption (5-min hbloop, pid 2053;
  killed at closeout).

## Pass A-live (CAPSTONE unset, BUYOUT unset) — PRIMARY GO | ALL GO

Matched re-run vs r239 pass A (seeds 89701–89706).
PRIMARY-BINDINGS GO | PRIMARY GO | ALL GO. CORPUS-PURITY GO 6/6.

- lesser 5/6, full 0/6, **lost 1/6 — 89706 village-lost d69**,
  won 5/6. M23b 0/6 (r239: 1/6 — 89702@d85).
- 89701: uw 4, FACED 0, standing peak 199, sat d119 (defer 29d;
  r239: d108, defer 18d), peakVet 0, kills 1. Guard:
  "Finish the current encounter before taking your seat."
- 89702: uw 5, **FACED wave 5 ×0** (r239: ×4 — editor d80, spoiler
  d85, cancellation d86, rerun d87), standing peak **462** (r239:
  387), deedGate NEVER ok (r239: ok d85), peakVet 2, kills 5
  (vKill ×4 + 1), sat d90 lesser. Release snap d90 ready (2 living
  veterans) — sat the same day the snapshot went ready.
- 89703: uw 4, peak 199, sat d118 (r239: d95), peakVet 0, kills 0,
  2 vDie (scholar died twice — Ruby d71, Guizhen Qi d91), mFlee ×13.
- 89704: uw 4, peak 120 (r239: 170), sat d105 (r239: d90), relay/dark,
  peakVet 0, vetFights 0.
- 89705: uw 4, sat d104 (r239: d104 — identical), peak 199, survives
  (Q9 holds — r230's d59 loss stays in the past), peakVet 0.
- 89706: VILLAGE-LOST d69 scattering, pantry 0, 5 alive, 11 deaths
  (pre-registered interesting finding — a village dying before d90).
  Same trajectory as the smoke (deterministic re-run): Roman
  starvation d67, Rebecca sickness d68, Wei thirst d69 — a
  food-collapse death, not a wiring failure. The collapse is fully
  voiced (STARVING warnings, "Haven's pantry is empty. Day 3 of
  hunger.", the scattering line, Wei's death in codex + candle +
  broadcast).
- M4-wave5-or-full 1/5 (89702 OPEN on uw only — faced 0). M11 peaks
  199/462/199/120/199. M20 mech199 true on 5/6 (89704 false — never
  reached 199).
- Starvation: Daniel Zhu d12 (89702) — same as r239. Nora Wilson d67
  (89702) — new.
- deathCleanups 11 total (0/5/0/0/3/3), removalCleanups 1 (89702),
  no stranded launch observed. companionGuardSkips 10 total (r239 A:
  10 — identical). medicDutyBlocked 225 total.
- 159-turn Algorithm fight (r194): NO recurrence (longest multi-turn
  fight 30 turns, 89702 vKill, ref-change close — the same length as
  r239's longest). fastW4 diedInFight gap (r171): fastW4 0 on all
  seeds — no recurrence.

## Pass A — the two re-rolls, attribution

The kill logs pin the divergence. 89702's first three kills are
BIT-IDENTICAL to r239 (influencer d38, influencer d41, reunion d60 —
same monsters, same killers, same days); the trajectories diverge
between d60 and d73 (r239: reunion d73 + herald d80, faced wave 5 ×4
d80–87; r243: strike d87 + herald d89, faced 0). The Rerun was
MENTIONED d74 ("tiger's Rerun finds you — no dodging it", count 3)
but never FACED (w5FaceEvents empty). 89706's collapse is a second,
independent re-roll (sat d90 in r239, scatters d69 now).

Attribution, checked lever by lever against the LIVE deltas:
- NOTICKEXACT (b): UNOBSERVABLE in this corpus — the per-seed JSON
  carries no brain-log, muster/march, or party_launch field, and the
  transcript carries no deferral voicing. "0 firings" would be a
  false claim; the deferral may or may not have fired. The 89702
  divergence (a wave-4 kill that r239 got d73 never coming) is
  CONSISTENT with a deferred part-3 party_launch, but equally
  consistent with RNG-draw shifting. Instrument owed: persist the
  brain deferral into the per-seed JSON (next run).
- TABLESITTING (a): VACUOUS on this panel — no muster ever fired
  (0 blades throughout on every seed), so the muster/march hold-vs-fire
  question has no observation. The muster-growth dawn line (g) never
  appears either (no short muster to describe). The "muster" lines
  present are the static HERALD gate line ("muster 10 allied blades
  (you have 0)"), repeated verbatim 4–5× on 89701/89705.
- TRIODROUGHT CARRY (c): UNOBSERVABLE in this corpus — no
  companion2/3 field on launches. Same instrument gap as (b).
- DOOR-SKIP (d): no door-tile signature in the corpus — all 50 Pass A
  fight closes are ref-change (12), day-boundary (31), or day-end (7);
  no fight fled with allies behind on a door step is observable here.
  The fix's proof stays its unit proof (19 checks); this panel adds
  only the absence of the r145 signature.
- POCKET REPAIR (e): UNMEASURED on this panel — the analyzer carries
  no pocket tally and no fight record shows a single-tile unreachable
  monster, but that is the absence of a signal, not a pocket count.
- WALKH0ME (f), AMANDA (h), TRAILTALK (i), MIME (j), WREN (k):
  dialogue/voice lines — these consume RNG draws and shift draw
  order, the same mechanism r239 invoked for its own re-rolls. With
  (b)/(c) unobservable and (a) vacuous, dialogue/RNG-draw shifting
  remains the standing attribution for the re-rolls — but it is a
  WEAK attribution this round, because (b) is a live launch lever
  whose firing cannot be checked. The honest statement: the re-rolls
  are not explained by any OBSERVED lever; (b) is the open suspect
  and needs the instrument.

## Pass C-live (CAPSTONE=1 BUYOUT=1 BUYOUT_EARLY=1) — PRIMARY GO | ALL GO

Matched to r239 pass C (seeds 89701–89706).
PRIMARY-BINDINGS GO | PRIMARY GO | ALL GO. CORPUS-PURITY GO 6/6.

- lesser 5/6, **full 1/6 — 89702 TOOK THE FULL SEAT d101**, lost 0/6,
  won 6/6. M23b 1/6 (89702@d86/DELIVERED; r239: 0/6). M25c 6/6
  bought early.
- **89702: FULL** (feast_embassy@d86, firstFullSeatDay d87, sat full
  d101, beloved/light, won). FACED wave 5 ×2 (editor d79, rerun d83),
  uw 5, peakVet 2, standing 396. Buyout bought d18 (pantry
  51,288→43,263 — the SAME numbers as r239 Pass C, bit-identical
  early game, diverging later). Kill log: reunion d42, eater d46,
  strike d58. M23-capstone: 1 eligible, delivered 1/1, pricedFull
  1/1, 0 non-exempt refusals.
- 89705: uw 5 (peakVet 2, standing **562** — identical to r239 Pass
  C) but BLOCKED-ONLY on wave 5 (timeslot presence d84, blockedW5
  1@[84]), faced 0, sat lesser d90. The unlock without the facing,
  again — the gate's w5 bar stayed 0/2.
- 89701: uw 4, sat d93 lesser, bought d48. 89703: uw 4, sat d92
  lesser, bought d44. 89704: uw 4, sat d91 lesser, bought d39.
  89706: uw 4, sat d91 lesser, bought d25; starvation Terry Hong d72
  (the smoke/Pass A scattering does NOT reproduce under the buyout
  leg — the early buyout's 8,447 kcal keeps the pantry alive).
- M4-wave5-or-full 2/5 (89702 + 89705 OPEN). M11 peaks
  190/396/199/562/199.
- Buyout road conversion across rounds: r233 1/6, r237 1/6, r239 0/6,
  r243 1/6 (89702). The road converts roughly 1-in-6 seeds per round
  on the matched band; this round it converted on the band's strong
  seed. The gate, not the buyout, is the fragile link (every seed
  bought; one seed's gate opened).
- Starvation: Daniel Zhu d12 (89702 — same early death as Pass A and
  r239); Terry Hong d72 (89706).

## Pass C-wide (STRETCH, fresh 89790–89797) — WIDE-VERDICT GO

M25c 6/8 bought, CORPUS-PURITY 8/8.
WIDE-VERDICT GO (M25c + starvation tally). Full-bindings run is ALL
NO-GO by construction on a wide pass (judged on M25c + purity only,
per r185; full log in journey-endgame-r243-analyze-cwide-full.log).

- lesser 7/8, **full 0/8**, lost 1/8 (89794 village-lost d54),
  never-sat 0/8 — no F1 recurrence (every surviving seed sat).
- **89795: uw 5, FACED wave 5 ×2** (cancellation d68, rerun d72),
  peakVet 2 (gen_mjcdq01, nadia_khoury), standing peak 411@d76,
  bought d39, sat lesser d90, won. The band's only wave-5 facing —
  and it faced twice without converting: deedGate never ok, no
  capstone attempt. The unlock-without-facing pattern from r239
  (89782) repeats as a facing-without-converting pattern here.
- 89794: VILLAGE-LOST d54 scattering (pantry empty, third hungry
  day; "Haven couldn't hold. On the third hungry day, people
  started walking — in different directions."). 9 deaths, Liam
  starved d53. No eligible buyout day (windowEarly 4 days, 0
  eligible) — the early buyout never had a day to fire on this seed.
- 89791: never bought — windowEarly 0 days (the early-buyout window
  never opened on this seed); 22 deaths (most on the band), 3
  starvation deaths (Benjamin Marquez d33, Pavel d34, Wei d58), 4
  alive at end, pantry 0. Sat lesser d91.
- 89790: lesser d97, bought d37, 1 starvation death (Esteban Webb
  d12). 89792: lesser d95, bought d37, Kofi Black starved d16.
  89793: lesser d96, bought d51, Yingluck starved d95 (a day before
  the sit — the buyout's food did not save her). 89796: lesser d92,
  bought d39, no starvation deaths. 89797: lesser d90, bought d48,
  Lena Mukherjee starved d11.
- Starvation tally: 8 starvation deaths on 6/8 seeds (only 89795
  and 89796 clean). The buyout's 8,000+ kcal does not stop early
  starvation: 5 of the 8 deaths fall before day 35, on seeds that
  bought later (d37–d51) or never bought.
- deathCleanups 21 total, removalCleanups 0. companionGuardSkips 2.
  medicDutyBlocked 219 total.
- M23b tally (C-wide): 0/8 — deedGate never ok on any fresh seed.
  The gate, not the buyout, is the fragile link on the fresh band
  too (6/8 bought; 0/8 gates opened).

## Pass D (STRETCH, FIGHTALLY2=1) — PRIMARY GO | ALL GO

Second sighting of the second ally slot, matched to r239 pass D
(seeds 89701–89706, CAPSTONE=1 BUYOUT=1 BUYOUT_EARLY=1).
PRIMARY-BINDINGS GO | PRIMARY GO | ALL GO. CORPUS-PURITY GO 6/6.

- lesser 5/6, **full 1/6 — 89705 TOOK THE FULL SEAT d90** (gate ok
  d73, feast_embassy delivered d73, firstFullSeatDay d74, sat full
  d90, indispensable/light, won). FACED wave 5 ×2 (timeslot d61,
  network_note d71 — "They faced The Congregation... They faced The
  Timeslot" in the transcript's war path), uw 5, peakVet 3
  (gen_pmykzj1, ethan_hunt, app_mgpsphcy831), standing peak 612.
  Buyout bought d17. M23-capstone: 1 eligible, delivered 1/1,
  pricedFull 1/1, 0 non-exempt refusals.
- **The r239 D uplift did NOT repeat.** Pass D this round: kills 6,
  full 1/6, wave-5 faced 2 (both 89705) — against Pass C on the same
  seeds: kills 10, full 1/6, faced 2. r239's D was kills 13, full
  2/6 against its C's 5. The second sighting lands BELOW its own
  Pass C on kills and level on seats. The r239 uplift reads as a
  seed-band/RNG-draw artifact now, not a lever effect — and D-vs-C
  is not a clean A/B anyway (FIGHTALLY2 changes fight RNG draws:
  89702 took the full seat d101 on Pass C and sat lesser d90 on
  Pass D with gate never ok). No lever verdict beyond: effect not
  reproduced; the slot stays env-gated OFF.
- 89702: lesser d90 on D (uw 5, peak 421, 2 vKills) vs full d101 on
  C — the re-roll the other way. 89701: lesser d90, 1 vKill.
  89703: lesser d90, 0 kills. 89704: lesser d93, 0 kills. 89706:
  lesser d100 (latest sit on any pass this round), 0 kills.
- M4-wave5-or-full 2/5 (89702 + 89705 OPEN). M11 peaks
  199/421/199/612/199. M25c 6/6 bought early.
- Starvation: 1 death on the band (Daniel Zhu d12, 89702 — the same
  early death as Pass A and C).
- deathCleanups 11 total, removalCleanups 0. companionGuardSkips 15
  (r239 D: 15 — identical). medicDutyBlocked 162.
- #2515 meeting-party cap: STILL UNOBSERVABLE on this panel. Every
  fight on every pass is scholar-led (0 no-scholar fights). Anatomy
  partyKeys count close-fighters including mid-fight joins (up to 7
  allies on Pass C too, FIGHTALLY2 OFF) — so a big close-party is
  not a sense-picked meeting party of 4, and the sense cap is not
  recorded anywhere in the corpus. The instrument gap stands.

## People check — PASS

- C-wide 89795 read in full (74 SAY lines): coherent table sequence,
  audit names real deeds (12/12/3 waves, 6 wave-4, 2 wave-5 fought),
  war path names real kills (Jorge d75 Don't-Look, Nadia d60),
  beloved finale with a live audience choice, Nadia Khoury ascends
  through relay. No dry line, no senseless passage.
- C-wide 89794 read days 1–6 in full + ending tail (full-run
  transcript, 5983 SAY lines — village never reached the window):
  coherent village life — named introductions, Swahili learning,
  Katarina challenging the scholar's leadership ("Who put YOU in
  charge?"), gossip retellings that mutate, Wanjiru curing Tom's
  fever voiced, the scattering voiced with James's death mourned
  ("The Company carries the name"). No dry line.
- Pass D 89705 read in full (50 SAY lines): full-seat transcript,
  audit names real deeds ("every wave faced, the deeds complete"),
  war path names real kills (Hannusya d71 Big-Eyes, Ethan d55
  Loud-Eyes), the Indispensable path plays out with a live final
  choice ("Teach them freely"), Aurora Schmitz walks out. The
  grief-ledger exchange with the System is a real conversation beat.
  No dry line.
- DRY census: 0 dry hits ("lost my train of thought") and 0
  `SYSTEM: ""` lines on ALL 26 transcripts (A 6, C 6, C-wide 8, D 6).

## Watches

- F5 settled-favor (Q5): 0 exact-variant servings ("It's already
  handled. Thank you for asking.") on ALL passes — vacuous for a
  fourth straight round on the endgame leg. The branch IS reachable
  in panel play (succession r230 fired 2×); the endgame panel's
  sittings never reach it. Stays a watch, not a binding. The
  Amanda fix (h) changes nothing observable in the wild count.
- C3d recap-live-want (Q6): 0 "recap" mentions on any transcript —
  vacuous again (no recap sittings on the endgame panel).
- "It's handled" repeat: 19× across the panel (89794-C-wide 5×,
  smoke 89706 4×, 89706-A 4×, 89701-A 2×, 89703-A 2×, 89704-A 1×,
  89705-A 1×) — the same template as r239 (6× on one seed), spread
  thinner. Dialogue-pass item, not a binding.
- GUARD-STALL WATCH (adopted this run): longest same-reason
  consecutive run is 7 days (89704-A, "Finish the current encounter"
  d90–d96) — well under the 30-day LOUD threshold. No stall this
  round. Note: 89701-A deferred 29 days before sitting (sat d119)
  but the guardTrace alternates wait/not-ready decisions, so it is
  not a stall by the watch's definition — the deferral is long, not
  stuck.
- Wait-line monotony (carried watch): "You wait. The light changes.
  Nothing asks anything of you." still serves as the bot's idle
  filler throughout the full-run transcripts (89794-C-wide
  especially). Correct, just unvaried. Not a defect.
