# Journey leg ESTABLISHMENT — r233 run note (2026-11-17, Lane A)

## Run
Run id `playtest-loop-a-20261117T2219Z` (scheduled Tue 2026-11-17
15:45 CST). Rotation read `1` (establishment); write `1→2` at
closeout with read-back. **Base:** local master `5079bee22`.
Heartbeat loop running (9-min cadence,
`journey-establishment-hbloop-r233.sh`, setsid-detached per the r141
lesson). Pre-flight: main tree CLEAN, disk 42%. Lock created by this
run 2026-11-17T22:19:00Z. No push (ship loop owns pushes).
Registration took ~3 min (box load lower than r232's 17 min).

## Pre-registered bars (r233 prereg)
Q1 FAVORLESS ASK, FRESH-BAND RE-READ (band 101301–101305 — the
101201–101205 matched-band release is spent). Q1b WANT-RAISE,
regression guard. Q1c CASE-THREAD PRE-EMPTION, report-only (r232 F1
residual; a LOST ask is a defect finding, a deferred ask is a day's
delay). Q2 SITTING CLOSES, standing bar. Q3 recap paraphrase,
report-only. Carried bars: SPOTTER, LADDER, FASTER-ID, END BAR,
TRUST GUARD, VILLAGE BAR, JAM, STRANDED / TRAVEL / THREAD watches,
PEOPLE CHECK, SCHOLAR-DEATH standing metric (r232 hit 4 — the
companion-guard A/B escalation already triggered, sim lane's job),
ROSTER-RECONCILIATION watch. New instruments (read-only): removalLog
(removeVillager how per departure) + exileLines (dawn SAY lines
about exile/freeloading) — added after the pilot caught a triple
exile the old instruments could not explain; both proven
behavior-neutral by bit-identical pilot re-runs. Pilot gate passed
first try on the final driver (see below).

## Pilot (seed 101301, 42d)
Ran clean in ~6s: endDay 43, aliveEnd 9, aliveAt40 9, wave 3,
standing 65, pantryEnd 30,094, wedgeSits 81, committed 1, bumpCalls
60, bumpBenefit 43, codexPlants 23. Gate: 2 sittingCloses records,
transcript written, spotter instruments fire, rosterDepartures
present (5 entries), standingEnd 65 non-null, scholarDawns 42
records, teleTypeCounts 48 keys. Q1 trace fields present on social
sits. The pilot's story is F1 below: 3 villagers exiled d10, the
scholar (Mario) died d30 in the arena. No driver behavior change
after the pilot — only two read-only instruments (removalLog,
exileLines), each proven by a bit-identical pilot re-run
(JSON identical except the new field), so the band stands and the
pilot seed is scored, per the prereg.

## Analyzer verdicts (r233 panel, seeds 101301–101305, 42d)
- **Q1 FAVORLESS ASK: GO — 1/53 raised asks (1.9%) never
  materialized into a committable favor (r232 matched band: 2/77 =
  2.6%; r231: 13/82 = 15.9%).** Rate < 20%, stage-0-deflected 0,
  every sit classified (E1 1/1). The low rate HOLDS on a fresh
  band — the r231 fix is not band-specific.
- **Q1c CASE-THREAD PRE-EMPTION: 1 E1 sit, DEFERRED not lost.**
  Fatima d13 (101304): openThread request, 3/5 case picks
  (`betrayal:*:case_2` investigate/letlie/vote_guilty) + goon +
  silence, want opener never ran, `dlg:help` never pressed, need
  forage_help/u2 live. The ask surfaced in a later sitting
  (stage-0-surfaced 1/1). Milder than r232's two (6/8 case picks
  each) — same shape, smaller. No LOST ask anywhere on the panel,
  so no defect finding; the precedence question stays with the
  conversation build arm.
- **Q1b WANT-RAISE: GO — 53/337 social sits raised ask_favor
  (15.7%); any-want sits 315/337; zero-raise seeds 0/5.** Below
  r232's 26.3% but above the 10% bar. Thin seeds: 101301 5/81
  (6.2%), 101302 4/69 (5.8%); fat seeds 21–28%. Kinds: forage_help
  36, food_share 7, heal_help 6, sick_help 2, water_haul 1,
  (no-kind) 1.
- **Q2 SITTING CLOSES: 0/10 CUT — GO.** 3 engine-ended WITH
  closing beats. The r224/r226/r228 dry-line fixes and the C3d
  recap fix hold in the wild. Parting pool: 0 serves this panel
  (r232 served 1 — the reachability question stays closed).
- **Q3:** recap paraphrase distinct 2/10 sittings (raw 4) —
  report-only, no second formulation owed. Both serves are the
  "that's still where we are" formulation (Scott + Arturo, 101304).
  Canned lines: all else 0.
- **SPOTTER GO:** 52 total (9/7/1/14/21), 5/5 seeds > 0.
- **LADDER 4/5** (pace read, report-only under a SPOTTER GO).
  Seed 101303 misses (Willie 1 XP — see F4).
- **FASTER-ID 4/5:** 142 benefit plays in 187 bump calls
  (101303: 0 — 1 bump call all run).
- **CODEX 120** plants identified at end across 5 seeds (r232: 140).
- **END BAR 11/11 scored** (+0 excluded tail; 101301
  NO-OPPORTUNITY). TRUST GUARD 0 drops. VILLAGE BAR 5/5 alive d40.
  JAM 0. STRANDED: 0 stranded dawns — NO-OPPORTUNITY. THREAD:
  0/0 paged — NO-OPPORTUNITY. TRAVEL: 0/0 — NO-OPPORTUNITY.
- **ROSTER:** 0 unaccounted on all five seeds. Departures logged
  and matched by id everywhere (7 villager deaths + 3 exiles, all
  matched — the removalLog now names the how for each).

## FINDING F1 — triple exile on day 10, narrated aloud (pilot 101301)

The pilot village lost a quarter of its people on a single morning
— Moshe, Aki, and Mileidys, all exiled d10 — and the old
instruments could not say why: no death record, no trace anywhere
in the JSON, no say line exported. The new removalLog names the
how (`exiled` ×3 d10, then `killed` ×2 for Lamar d29 and Mario
d30), and the new exileLines prove the game DOES tell the player:
four dawn SAY lines on d10 — the vote line ("The oldest among them
stands. The fire seems to lean in. 'Moshe — take what you can carry
and go.'") plus one pronouncement per exile ("Moshe/Aki/Mileidys is
exiled. 'Take what you can carry and go.' The village watches them
walk until the trees close."). Not silent. But: all three were
villagers the player had never met — still unnamed in the census
("A person, maybe 40s/60s", "A man, maybe 50s") — exiled by the
freeloader pipeline (gossip d3, warning d7, vote d12 per
freeloaderTick) before the player ever sat with them. The village
never recovered the loss: it ended thinnest (9 alive, standing 65).
No panel seed repeated the shape (0 exiles on 101302–101305), so
this is a 1-seed event, not a panel pattern. Named next probe: did
the player hear the d7 warning (freeloadWarning) before the d10
vote — the exileLines filter only keeps vote-day lines — and
should three unmet villagers be exilable before the player has had
a sitting with them? That is a design question, not this run's fix.

## FINDING F2 — scholar deaths 2, at bar (WATCH)

Mario d30 (101301, "the arena") and Ingrid d31 (101302, "the
wild"). That is ≤2 — WATCH, not the ≥3 investigation line — but
the third straight panel with scholar deaths (r231: 3, r232: 4,
r233: 2). Both woke AT Haven the morning they died (last dawn
(4,4), atHaven=true, inside=false) — same shape as r232: same-day
outings that ended badly, not long expeditions. The companion-guard
A/B escalation already triggered on r232; this run adds no new
escalation. The mantle passed every time (mantle_become 1 per seed
with a scholar death). No src/js change from this run on scholar
deaths.

## FINDING F3 — standing split confirms t4=100 on the fresh band

Standing totals at end: 65, 25, 50, 120, 0 → wave 3, 3, 3, 4, 3.
Only 101304 (120) reached wave 4 — the same threshold as r232
(t4=100). And 101305 stands at ZERO: a village that survived 42
days, fought (27 monster kills in villager combat), held 4
contests to completion, taught skills and earned godpath deeds —
and banked no standing at all, because standing only counts three
narrow currencies (war +25 per wave-3+ ledger kill, diplomacy +34
per seasoned regional+ link, plenty +20 per major feast) and this
village earned none of them. A village can be alive and busy and
stand at zero. That is the design working as specified — but it is
worth saying plainly, because a player watching their village
survive would reasonably expect the number to move.

## FINDING F4 — the scholar who never foraged (101303)

Willie (fishing guide) bumped plant familiarity exactly ONCE in 42
days (d39, White Oak acorn) — bumpCalls 1, benefit 0, spotter XP 1
— while holding 62 wedge sits, 10 travel-outs, and 4 joint forage
outings. The village still ate: pantry 40,170 → 3,710 (d30) →
26,184, fed by joint outings, 30 monster kills in villager combat,
and Jorge's cooking/preserving (cook 17, preserver 19). The
scholar woke at Haven all 42 dawns, never sick, never away. The
competent policy simply never sent him solo-foraging while sits
and joint favors filled the day. Same mechanism as r210–r232
(spotter XP tracks foraging volume, not time), now with the
scholar's volume at ~0: the LADDER bar misses on this seed for
exactly that reason, and the panel's spotter total (52) is carried
by the other four seeds. Named next question for the sim lane:
does the competent policy under-forage when sits are available —
or is a 1-bump scholar the honest shape of a social-first 42 days?

## FINDING F5 — want-raise varies 5× by seed (watch, not a finding)

Q1b raise rate: 101301 6.2%, 101302 5.8%, 101303 28.1%, 101304
21.9%, 101305 21.1%. The panel passes (15.7% ≥ 10%, no zero-raise
seed), but the thin seeds raise asks at a quarter the rate of the
fat ones with no shortage of sits (81 and 69 sits). What suppresses
asks on the thin seeds — fewer live needs, fewer wants raised at
all, or the wedge's own sit order? Unprobed; the bar holds, so
this stays a watch for the next establishment run.

## Q4 — census (plain words)
Five villages, 42 days, all alive at day 40 (5/5). They are not
the same village five times: seed 101304 is the fat one (pantry
102,166 kcal, 12 of 12 alive, nobody died, wave 4); seed 101305
is the standing-zero one (pantry 11,886, 10 of 12 alive, wave 3);
seed 101301 is the exiled one (pantry 30,094, 9 of 12 alive after
the d10 triple exile, wave 3); seed 101303 is the unfed-scholar
one (pantry 26,184, 11 of 12 alive, wave 3); seed 101302 is the
quiet middle (pantry 31,474, 10 of 12 alive, wave 3).
- **The dying:** 7 named villagers died across the five villages
  (of 167 death events — the rest are monsters the villagers
  killed). Causes: the wild ×1 (Ingrid d31, 101302 — a scholar),
  the arena ×1 (Mario d30, 101301 — a scholar), Gavel ×1 (Lamar
  d29, 101301), ambush ×2 (101302 d9, 101305 Onni d12), monster ×2
  (101303 d38, 101305 d9). Nobody starved — 0 starvation deaths on
  the panel.
- **The leaving:** 3 villagers exiled d10 on the pilot (F1) — the
  only non-death departures on the panel, all narrated aloud.
- **What they knew:** the scholar's plant codex holds 21–26 plants
  per village at end (120 total). Spotter knowledge concentrates in
  one forager per village (Willie 1, others 7–21) — practice earns
  it, one person per village carries the specialty. Seed 101303's
  Willie (1 XP) is the thin end: the scholar foraged once in 42
  days.
- **What they carried:** joint favors are almost all forage_help
  (36 commits across the panel; food_share 7, heal_help 6,
  sick_help 2, water_haul 1). Pantries end 11,886–102,166 kcal
  (1,189–8,514 per person). Wave 4 reached on 1/5 seeds (101304)
  vs 2/5 on r232 — the unlock reads standing only, and only the
  120 cleared the 100 line (see F3). No wave-4 kills or party
  launches in the instrumented records — the telemetry type-count
  map again PROVES the absence rather than assuming it: no
  telemetry type records party launches (combat_start/end,
  contest_fired/end, companion_kill_beat, scale_rank are all
  present; no launch type exists). The launch/kill instrument gap
  is still open.
- **Social life:** wants are raised in 94% of social sits
  (315/337). The gap this run closes is the other side of r232's
  fix: a villager who says "How can I help?" now hears the live
  ask instead of "It's already handled" — 1.9% favorless on a
  fresh band, down from 15.9% on r231, and the one that remains is
  a trial eating the sitting for a day, not a lost ask. And the
  villages feel inhabited: Gunther the dentist asks the scholar to
  ask the System about his taken brother Paul ("Even asking is more
  than the silence"); Hattie the baker tries the Mayapple the
  scholar taught her ("Didn't poison anyone, so that's a win");
  Brianna the trail crew lead holds the scholar to account ("You
  said you'd earn it, not that I should just hand it over").

## People check — PASS (seed 101304, Scott + Arturo, read in full)
- **Scott** (postal worker): PASS. Opens resuming "that personal
  stuff" + a Woodland Strawberry lesson fragment — a real thread,
  though the opening mashes the resume and the lesson quote into
  one breath. The wound ask is concrete ("I can't clean it
  properly one-handed. Could you clean it out for me?"). The recap
  answers "that personal stuff — that's still where we are" (the
  Q3 paraphrase). The expedition answer ("a cellar full of jars —
  trace it with your finger") is vivid; the Columbus, Ohio memory
  is real. Closes warmly ("Take care of yourself." + "Come back
  anytime."). One wrinkle: the full transcript shows "Come see what
  I found. You won't believe it." — an offer the printed lines
  never showed — answered by the player's "All right. Let's go."
  before the hollow scene. The trip itself plays coherently.
- **Arturo** (programmer): PASS — the better of the two. Opens
  resuming "what's been happening" + the owed plant lesson. The
  wound ask again ("I can't reach this properly. Could you clean it
  out for me?") — the same ask template as Scott's, two wounded
  people in one village on one day; plausible, but the template
  shows. The skill question + answer ("I'm better with my hands
  than people expect") + his weather-reading confession ("nobody's
  died from it yet. That's my whole résumé now") is specific and
  funny. The invite lands ("Finally. I was wondering when you'd see
  my value."). Closes with a real resolution ("Good — what's been
  happening, settled. Feels better said out loud." + "This was
  good.").
- **Elsewhere (101303):** Gunther's taken-kin sitting is the best
  on the panel — a grieving man, a promise to ask the System about
  Paul, "If it answers — you'll tell me? Whatever it says. I can
  take it." The recap names the live thread ("we're still on that
  taken person"). A person, not a menu.

## Verdicts (leg: establishment, days 14–40)
- **Reachable:** YES. All five villages play the full 42 days;
  sittings, teaching, favors, contests, waves 3–4 all fire.
- **Fun:** YES. Conversations land, close, and resolve; the
  villages feel inhabited; Gunther's taken-kin ask and Arturo's
  weather-reading résumé are the game at its best — and the one
  false note left (a trial eating the sitting) defers the ask a day
  rather than losing it.
- **Winnable:** ON TRACK for the leg. Villages survive, gear up,
  kill ~30 monsters each, bank spotter skill, and reach wave 3 on
  5/5 and wave 4 on 1/5 seeds. No village reached
  national/table — expected at day 42. The binding watch is now a
  fix with a proof, twice confirmed: a villager asking for help
  hears the live ask instead of "It's already handled" — the next
  establishment run takes a FRESH band and re-reads the rate, the
  scholar-death watch, the case-thread residual, and the exile
  shape (does the triple exile recur? did the player hear the d7
  warning?).

## Metric review (§14)
- **Q1 GO, and the bar worked on a fresh band.** The rate (1.9%)
  and the stage-0-deflected count (0) split the verdict honestly;
  the class mix (E1 1/1) named the residual mechanism instead of
  letting the GO hide it. The fix holds on unseen seeds — this is
  the re-read the r232 prereg asked for, and it answers it.
- **Q1c bar WORKS.** 1 case-thread E1, deferred (surfaced 1/1),
  milder than r232's (3/5 picks vs 6/8). The new instrument names
  the sit exactly (Fatima d13, openThread request, dlg:help NO).
  Keep as written; the LOST-ask trigger (never surfaced) did not
  fire.
- **Q1b bar WORKS, with a watch.** 15.7% panel rate (r232: 26.3%),
  no zero-raise seed. The 5× seed spread (F5) is not a bar failure
  — but if the next panel also shows thin seeds under 7%, the bar
  should gain a per-seed floor question.
- **Q2 bar WORKS on the new base.** 0/10 CUT. Keep as written.
  The r143 truth.js fix (confront spend) and the r230 pagination
  fix are in this base; no Q2 movement is attributable to either
  beyond the standing 0.
- **Q3 — report-only, stable.** Distinct 2 (raw 4), both the same
  formulation. No formulation owed.
- **Scholar deaths 2/5 — WATCH, at bar.** Third straight panel
  with scholar deaths, first under the ≥3 line. The metric stays;
  the A/B is the sim lane's (already triggered).
- **LADDER pace read, again:** the thin seed (101303 Willie 1 XP)
  misses pace while the scholar forages once — spotter XP tracks
  foraging volume, not time. Not a bar failure. The thin end is
  now the scholar's own volume, not the village's.
- **Wave 4 on 1/5 (was 2/5).** Not a bar — the standing
  attribution is exact again (F3): t4=100, threshold between 65
  and 120 on this band.
- **Roster watch CLOSED as an instrument gap, answered again —
  and extended.** 0 unaccounted on 5/5 seeds with departures
  logged and matched by id, AND now the how is named per departure
  (removalLog). The open question is no longer recording — it is
  whether the player hears the warning before an exile, and
  whether three unmet villagers should be exilable at once.
- **Telemetry baseline — do NOT roll.** LOUD on guardrails.* is
  the known schema mismatch (prereg-predicted); c3 quiet.

## Telemetry check (§14)
`telemetry-check.js` vs `telemetry-baselines/establishment.json`
(metrics guardrails.deaths, guardrails.popAlive,
guardrails.pantryKcal, c3.starvationDeaths):
- LOUD: guardrails.deaths 604 → 0; guardrails.popAlive 178 → 0;
  guardrails.pantryKcal 1210411 → 0.
- Adjudicated: the KNOWN schema mismatch (prereg-predicted) —
  the driver never emits `guardrails.*` fields, so the checker
  reads missing paths as 0. Not a game change; the r233 panel's
  deaths / pantry are all in-band in the analyzer (5/5 alive
  d40, pantries 11,886–102,166, 0 starvation deaths).
  Baseline NOT rolled (prereg: never roll on a mismatch).

## Gate check
`node scripts/check.js --quick` in the worktree, log
`evidence/2026-11-17/journey-establishment-r233-gate.log` —
**334 passed, 6 failed in 522s, 0 attributable.** This run changed
no src/js (`git diff HEAD -- src/js/` empty), so every failure is a
base condition:

- 2 load timeouts (exact 120s), both PASS standalone WITH logs on
  this tree, run sequentially after the gate: living-garden (exit
  0), one-person-army (exit 0). Same contention class as r232.
- `test-measurement-proof-update.js` + `test-measurement-workflow.js`
  (1 fail: "retained neutrality proof covers the current
  Game/controller/harness inputs") — the balance-proof manifest is
  STALE on the new base: "Proof source inputs are not current"
  (fieldFights.js grew +274 lines in fightallycap since the last
  proof refresh). Pre-existing on master 5079bee22; the refresh
  (`scripts/balance-proof-update.js`) is measurement-maintenance
  work, not this run's — a sibling refresh fixed the pair on r232
  and it is owed again now. Notably the pair was GREEN on r232's
  gate, so the staleness arrived with the fightallycap landing.
- `test-phone-frame-proof.js` — phone-frame receipt staleness (3
  fails, same messages as r232/r142).
- `test-ladder-bundle-20261108.js` — same control fail (200
  monster turns WITHOUT delivery fire the ambient raid — fires 0).
- Notably GREEN in-gate this run (both failed on r232): the
  measurement-cache-flags test (4/4 in-gate — the load artifact
  did not strike) and occupation-panels / trust-observer-neutrality
  / capable-bot (all three timed out on r232's gate). Gate GO for
  adoption.

## Closeout
- No src/js change this run — the blank is documented (F1 exile
  shape + d7-warning probe, F4 policy foraging question, F5
  want-raise spread), the watch is recorded (F2), the attribution
  is closed (F3). Commits: prereg/driver/analyzer `ebc6c63fe`;
  instruments `53b13e7f3`; evidence [PENDING — filled at closeout].
- Master moved during the run (winnability-round-2030 evidence
  `392ec63d4`, no src/js); rebased clean onto it (no overlap),
  proof tests re-run green on the rebased tip (19+13+18+10+35+7).
- **Merged locally, pending ship** — no bump, no push, no live
  verification (ship loop owns those).
- Rotation 1→2 written with read-back; lock deleted at closeout
  after run_id verification.
- Worktree released (`merged`), branch deleted; final reap sweep
  clean. Main tree verified clean after the merge.
- The r233 panel corpus (per-seed JSONs + convo transcripts)
  lives under the goal hidden_files evidence dir for 2026-11-17
  (outside the repo, per the journey-lane pattern); the repo
  evidence dir holds the prereg, run note, analyzer log, gate
  log, and pilot/panel stderr logs.
